import { ConsoleUI } from "../vterm.js";
import type Formatter from "./Formatter/Formatter.js";

export class Grouper {
    protected groups: Grouper.Group[] = [];

    public constructor(
        protected readonly formatter: Formatter,
    ) {}

    public get line(): string { return this.group().line; }
    public get item(): string { return this.group().item; }
    public get init(): string { return this.group().open; }
    public get stop(): string { return this.group().stop; }
    protected get itemLength(): number { return ConsoleUI.cleanFormat(this.group().item).length; }

    protected static defaultGroup: Grouper.Group = {
        open: "╭─", // "╮",
        item: "│ ", // "│",
        line: "├─", // "│",
        stop: "╰─"  // "╯"
    }
    public append(options: Grouper.GroupOptions = {}): void {
        const limit = this.formatter.maxLength;
        const prefix = this.item;
        const length = limit - this.itemLength;

        const group: Grouper.Group = {
            open: prefix + this.fillPattern(options.open || Grouper.defaultGroup.open, length),
            item: prefix + (options.item ?? Grouper.defaultGroup.item),
            line: prefix + this.fillPattern(options.line || Grouper.defaultGroup.line, length),
            stop: prefix + this.fillPattern(options.stop || Grouper.defaultGroup.stop, length)
        };
        this.groups.push(group);
    }
    public remove(): void { this.groups.pop(); }

    protected group(n: number = 1): Grouper.Group {
        return this.groups[this.groups.length - n] || {
            open: '', item: '', line: '', stop: ''
        };
    }
    protected fillPattern(symbol: string, maxLength: number): string {
        if (symbol.length === 0 || maxLength <= 0) return '';
        const visibleSymbol = ConsoleUI.cleanFormat(symbol);
        const visibleLength = visibleSymbol.length;
        if (visibleLength >= maxLength) return symbol;
        const lastChar = visibleSymbol[visibleSymbol.length - 1];
        const needed = maxLength - visibleLength;
        return symbol + lastChar.repeat(needed);
    }
}
export namespace Grouper {
    export interface GroupOptions {
        open?: string;
        item?: string;
        line?: string;
        stop?: string;
    }
    export interface Group extends Required<GroupOptions> { }
}
export default Grouper;