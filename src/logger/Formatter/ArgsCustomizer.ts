import { inspect } from "node:util";

export class ArgsCustomizes {
    protected vArgCustomers: ArgsCustomizes.customizer[];
    public constructor(options: ArgsCustomizes.Options = {}) {
        const { customizers = [], defaults = true } = options;
        this.vArgCustomers = defaults ? [
            ...customizers,
            ...ArgsCustomizes.getDefaults()
        ] : customizers;
    }
    /**
     * Applies the argument customizers to the provided arguments. Each argument is passed through the list of customizers in order, and the first customizer that returns a string will be used as the formatted value for that argument. If no customizer returns a string for an argument, it will be converted to a string using template literals.
     * @param args - An array of arguments to be customized.
     * @returns An array of strings where each argument has been processed by the customizers.
     */
    public apply(args: any[]): string[] {
        return args.map((arg) => {
            for (const customizer of this.vArgCustomers) {
                const customized = customizer(arg);
                if (typeof customized === 'string') return customized;
            } return `${arg}`;
        });
    }
    protected static getDefaults(): ArgsCustomizes.customizer[] {
        return [
            arg => typeof arg === 'string'  ? `&C7${arg}&R`                  : undefined,
            arg => typeof arg === 'number'  ? `&C3${arg}&R`                  : undefined,
            arg => typeof arg === 'boolean' ? `&C${arg ? '6' : '1'}${arg}&R` : undefined,
            arg => arg instanceof Error     ? `&C1${arg.message}&R`          : undefined,
            arg => {
                if (!(arg instanceof Object)) return undefined;
                if (arg.constructor?.name === 'Object' && Object.keys(arg).length === 0) return '&C6{}&R';

                const name = arg.constructor?.name || 'Object';
                const details = inspect(arg, {
                    depth: 2,
                    colors: false,
                    compact: true,
                    showHidden: false
                });
                    
                return `&C6[${name}]: ${details}&R`;
            }
        ];
    }
}
export namespace ArgsCustomizes {
    export type customizer = (arg: any) => string | undefined;
    export interface Options {
        customizers?: customizer[];
        defaults?: boolean;
    }
}
export default ArgsCustomizes;