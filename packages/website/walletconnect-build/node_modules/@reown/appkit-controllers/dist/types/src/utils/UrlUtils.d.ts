/**
 * Parses a string as a URL.
 * @param value - The string to parse.
 * @returns The parsed URL object or null if invalid.
 */
export declare function parseUrl(value: string): URL | null;
/**
 * Parses a schemeless host:port pattern from a string.
 * @param pattern - The input pattern string.
 * @returns An object containing the host and optional port.
 */
export declare function parseSchemelessHostPort(pattern: string): {
    host: string;
    port?: string;
};
/**
 * Parses an origin string into its scheme, host, and optional port.
 * @param origin - The origin string to parse.
 * @returns An object with scheme, host, and optional port, or null if invalid.
 */
export declare function parseOriginRaw(origin: string): {
    scheme: string;
    host: string;
    port?: string;
} | null;
/**
 * Checks if the current origin matches a non-wildcard pattern.
 * @param currentOrigin - The current origin as a string.
 * @param pattern - The pattern string to match.
 * @returns True if the pattern matches, otherwise false.
 */
export declare function matchNonWildcardPattern(currentOrigin: string, pattern: string): boolean;
/**
 * Checks if the current origin matches a wildcard pattern.
 * @param current - The current origin as a URL object.
 * @param currentOrigin - The current origin as a string.
 * @param pattern - The wildcard pattern string to use.
 * @returns True if matches the wildcard pattern, otherwise false.
 */
export declare function matchWildcardPattern(current: URL, currentOrigin: string, pattern: string): boolean;
