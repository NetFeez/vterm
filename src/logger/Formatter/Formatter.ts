import { Time } from "@netfeez/common";
import Placeholder from "./Placeholder.js";
import ArgsCustomizes from "./ArgsCustomizer.js";

export class Formatter extends Placeholder {
    protected readonly format: Formatter.Format;
    protected readonly argsEngine: ArgsCustomizes;

    public constructor(options: Formatter | Formatter.Options) { super();
        if (options instanceof Formatter) {
            this.format = options.format;
            this.argsEngine = options.argsEngine;
            return;
        }
        this.format = Formatter.normalizeOptions(options);
        this.argsEngine = new ArgsCustomizes();
    }

    public get maxLength(): number { return this.format.maxMessageLength; }
    public set maxLength(length: number) { this.format.maxMessageLength = length; }

    /**
     * Executes the formatting process for a log entry. It takes the log's date, level, name, custom variables, and data arguments, and produces an array of formatted strings ready for output. The method performs the following steps:
     * 1. Transforms the data arguments into formatted strings using the argument customizers.
     * 2. Defines core system variables (timestamp, level, name) as lazy functions to avoid unnecessary processing if they are not used in the format.
     * 3. Splits the full message into lines based on the maximum message length defined in the format.
     * 4. Renders each line by injecting the placeholders with the combined context of user-defined variables and system variables.
     * @param date - The date of the log entry.
     * @param level - The log level (e.g., INFO, ERROR).
     * @param name - The name associated with the log entry (e.g., logger name).
     * @param placeholders - An object containing custom variables that can be used as placeholders in the format string.
     * @param data - An array of arguments to be included in the log message, which will be processed by the argument customizers.
     * @returns An array of formatted strings, each representing a line of the final log message ready for output.
     */
    public execute(
        date: Date, 
        level: string, 
        name: string, 
        placeholders: Placeholder.Placeholders = {}, 
        ...data: any[]
    ): string[] {
        const formattedArgs = this.argsEngine.apply(data);
        const fullMessage = formattedArgs.join(' ');

        const systemVars: Placeholder.Placeholders = {
            timestamp: () => this.format.timestamp ? Time.format(this.format.timestampFormat, date) : '',
            level:     () => this.format.level ? level : '',
            name:      () => this.format.name ? name : '',
            sep:       placeholders.sep || '->'
        };

        const lines = this.splitMessage(fullMessage, this.format.maxMessageLength);

        return lines.map(lineContent => {
            const context = { ...placeholders, ...systemVars, line: lineContent };            
            const rendered = this.setPlaceHolders(this.format.messageFormat, context);
            return rendered.replace(/\s\s+/g, ' ').trim();
        });
    }

    protected splitMessage(message: string, maxLength: number): string[] {
        if (message.length <= maxLength && !message.includes('\n')) {
            return [message];
        }

        const originalLines = message.split(/\r?\n/);
        const lines: string[] = [];
        
        const regex = new RegExp(`.{1,${maxLength}}`, 'g');

        for (const line of originalLines) {
            if (line.length <= maxLength) { lines.push(line); continue; }
            const chunks = line.match(regex) || [line];
            lines.push(...chunks.map(c => c.trim()));
        }
        return lines;
    }

    protected static normalizeOptions(options: Formatter.Options): Formatter.Format {
        const {
            timestamp = true, 
            level = true, 
            name = true,
            timestampFormat = '&C7[{YYYY}-{MM}-{DD}] [{HH}:{mm}:{ss}]&R',
            messageFormat = '{timestamp} {level} {name} {sep} {line}',
            maxMessageLength = Formatter.getConsoleWidth() - 20,
        } = options;

        return { 
            timestamp, level, name, timestampFormat, 
            messageFormat, maxMessageLength
        };
    }
    protected static getConsoleWidth(): number {
        return process.stdout.columns || 80;
    }
}

export namespace Formatter {
    export type Format = Required<Options>;
    export interface Options {
        timestamp?: boolean;
        level?: boolean;
        name?: boolean;
        timestampFormat?: string;
        messageFormat?: string;
        maxMessageLength?: number;
    }
}

export default Formatter;