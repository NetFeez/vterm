import type Placeholder from "./Formatter/Placeholder.js";

import Formatter from "./Formatter/Formatter.js";
import LoggerCore from "./LoggerCore.js";
import ConsoleUI from "../ui/ConsoleUI.js";

export class Logger {
    public static default = new Logger();

    protected static defaultGroup: Logger.Group = {
        open: "╭─", // "╮",
        item: "│ ", // "│",
        line: "├─", // "│",
        stop: "╰─"  // "╯"
    }

    protected readonly formatter: Formatter;
    protected readonly core: LoggerCore;
    protected readonly name: string;

    public save: boolean;
    public show: boolean;

    protected groups: Logger.Group[] = [];
    protected vSep: string = '-> ';

    protected get prefix(): string {
        return this.groups.map(g => g.item).join('');
    }
    protected get sep(): string {
        return `${this.vSep}${this.prefix}`;
    }

    public constructor(options: Logger.Options | Logger = {}) {
        if (options instanceof Logger) {
            this.core = options.core;
            this.name = options.name;
            this.save = options.save;
            this.show = options.show;
            this.formatter = options.formatter;
            return;
        }
        this.core = Logger.getCore(options.logger);
        this.name = options.name || this.core.id;
        this.save = options.save ?? this.core.save;
        this.show = options.show ?? this.core.show;
        this.formatter = Logger.getFormatter(this.core.formatter, options.formatter);
    }

    public log(...data: any[]): void { this.send(Logger.LEVEL.LOG, ...data); }
    public info(...data: any[]): void { this.send(Logger.LEVEL.INF, ...data); }
    public warn(...data: any[]): void { this.send(Logger.LEVEL.WRN, ...data); }
    public error(...data: any[]): void { this.send(Logger.LEVEL.ERR, ...data); }
    public debug(...data: any[]): void { this.send(Logger.LEVEL.DBG, ...data); }

    public group(title?: string, options: Logger.GroupOptions = {}): void {
        const limit = this.formatter.maxLength;
        const currentPrefix = this.prefix;
        const availableSpace = limit - currentPrefix.length;

        const group: Logger.Group = {
            open: this.fillPattern(options.open || Logger.defaultGroup.open, availableSpace),
            item: options.item ?? Logger.defaultGroup.item,
            line: this.fillPattern(options.line || Logger.defaultGroup.line, availableSpace),
            stop: this.fillPattern(options.stop || Logger.defaultGroup.stop, availableSpace)
        };

        this.sendRaw(currentPrefix + group.open, title ? [`&C6${title}&R`] : []);
        this.groups.push(group);
    }
    public line(level: Logger.LEVEL = Logger.LEVEL.LOG): void {
        const group = this.groups[this.groups.length - 1];
        if (!group) return;
        const parentPrefix = this.groups.slice(0, -1).map(g => g.item).join('');
        this.sendRaw(parentPrefix + group.line, [], level);
    }
    public groupEnd(): void {
        const group = this.groups.pop();
        if (!group) return;
        this.sendRaw(this.prefix + group.stop, []);
    }
    protected sendRaw(separator: string, data: any[], level = Logger.LEVEL.LOG): void {
        const custom = this.getCustom(level, { sep: `${this.vSep}${separator}` });
        custom.data = data;
        this.core.customLog(custom);
    }
    private fillPattern(symbol: string, maxLength: number): string {
        if (symbol.length === 0 || maxLength <= 0) return '';
        const visibleSymbol = ConsoleUI.cleanFormat(symbol);
        const visibleLength = visibleSymbol.length;
        if (visibleLength >= maxLength) return symbol;
        const lastChar = visibleSymbol[visibleSymbol.length - 1];
        const needed = maxLength - visibleLength;
        return symbol + lastChar.repeat(needed);
    }
    

    protected send(level: Logger.LEVEL, ...data: any[]): void {
        const options = this.getCustom(level, { sep: this.sep });
        options.data = data;
        this.core.customLog(options);
    }

    protected getCustom(level: Logger.LEVEL, placeholders: Placeholder.Placeholders = {}): LoggerCore.CustomLog {
        const color = Logger.getColor(level);
        return {
            formatter: this.formatter,
            level: `${color}[${level}]&R`,
            name: `${color}[${this.name}${color}]&R`,
            save: this.save,
            show: this.show,
            placeholders,
            data: []
        };
    }

    public static log(...data: any) { this.send(Logger.LEVEL.LOG, ...data); }
    public static info(...data: any) { this.send(Logger.LEVEL.INF, ...data); }
    public static warn(...data: any) { this.send(Logger.LEVEL.WRN, ...data); }
    public static error(...data: any) { this.send(Logger.LEVEL.ERR, ...data); }
    public static debug(...data: any) { this.send(Logger.LEVEL.DBG, ...data); }

    protected static send(level: Logger.LEVEL, ...data: any): void {
        const color = Logger.getColor(level);
        Logger.default.core.customLog({ level: `${color}[${level}]`, data });
    }

    protected static getFormatter(defaultF: Formatter, formatter?: Formatter | Formatter.Options): Formatter {
        if (!formatter) return new Formatter(defaultF);
        else if (formatter instanceof Formatter) return formatter;
        else return new Formatter(formatter);
    }
    protected static getCore(logger?: Logger.Core): LoggerCore {
        if (!logger) return LoggerCore.get('default');
        else if (logger instanceof LoggerCore) return logger;
        else if (logger instanceof Logger) return logger.core;
        else if (typeof logger === 'string') return LoggerCore.get(logger);
        else if ('id' in logger) return LoggerCore.get(logger.id, logger);
        else return LoggerCore.get(logger);
    }
    protected static getColor(level: Logger.LEVEL): string {
        switch (level) {
            case Logger.LEVEL.LOG: return '&C(#FFB4DC)';
            case Logger.LEVEL.INF: return '&C6';
            case Logger.LEVEL.WRN: return '&C3';
            case Logger.LEVEL.ERR: return '&C1';
            case Logger.LEVEL.DBG: return '&C7';
            default: return '&R';
        }
    }
}
export namespace Logger {
    export enum LEVEL {
        LOG = 'LOG',
        INF = 'INF',
        WRN = 'WRN',
        ERR = 'ERR',
        DBG = 'DBG'
    }
    export type FormatterOption = Formatter | Formatter.Options;
    export type Core = string | Logger | LoggerCore | LoggerOptions;
    export interface Options extends Omit<LoggerCore.Options, 'path'> {
        name?: string;
        formatter?: FormatterOption;
        logger?: Core;
    }
    export interface LoggerOptions extends LoggerCore.Options {
        id: string;
    }
    export interface GroupOptions {
        open?: string;
        item?: string;
        line?: string;
        stop?: string;
    }
    export interface Group extends Required<GroupOptions> { }
}
export default Logger;