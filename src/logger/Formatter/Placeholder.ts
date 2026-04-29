export class Placeholder {
    /**
     * Replaces placeholders in the format string with corresponding values from the placeholders object.
     * Placeholders in the format string should be in the form of {key}, where 'key' corresponds to a key in the placeholders object.
     * The value for each placeholder can be either a string or a function that returns a string.
     * If a placeholder's value is a function, it will be called to get the string value. If the key does not exist in the placeholders object, it will be replaced with an empty string.
     * @param format - The string containing placeholders to be replaced.
     * @param placeholders - An object mapping placeholder keys to their corresponding string values or functions that return strings.
     * @returns A new string with all placeholders replaced by their corresponding values.
     */
    protected setPlaceHolders(format: string, placeholders: Placeholder.Placeholders): string {
        return format.replace(/{(\w+)}/g, (match, key: string) => {
            if (!(key in placeholders)) return match;
            const replacer = placeholders[key];
            try {
                const resolved = typeof replacer === 'function' ? replacer() : replacer;
                return resolved ?? '';
            } catch { return '&C1{ERR}&R'; }
        });
    }
}
export namespace Placeholder {
    export type PlaceholderFN = () => string;
    export interface Placeholders {
        [key: string]: string | PlaceholderFN;
    }
}
export default Placeholder;