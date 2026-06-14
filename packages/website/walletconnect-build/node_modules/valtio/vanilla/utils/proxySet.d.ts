type InternalProxySet<T> = Set<T> & {
    data: T[];
    toJSON: object;
    index: number;
    epoch: number;
    intersection: (other: Set<T>) => Set<T>;
    union: (other: Set<T>) => Set<T>;
    difference: (other: Set<T>) => Set<T>;
    symmetricDifference: (other: Set<T>) => Set<T>;
    isSubsetOf: (other: Set<T>) => boolean;
    isSupersetOf: (other: Set<T>) => boolean;
    isDisjointFrom: (other: Set<T>) => boolean;
};
/**
 * Determines if an object is a proxy Set created with proxySet
 *
 * @param {object} obj - The object to check
 * @returns {boolean} True if the object is a proxy Set, false otherwise
 */
export declare const isProxySet: (obj: object) => boolean;
/**
 * Creates a reactive Set that integrates with Valtio's proxy system
 *
 * This utility creates a Set-like object that works with Valtio's reactivity system,
 * allowing you to track changes to the Set in the same way as regular proxy objects.
 * The API extends the standard JavaScript Set with additional set operations like
 * union, intersection, difference, etc.
 *
 * @template T - Type of the Set elements
 * @param {Iterable<T>} [initialValues] - Initial values to populate the Set
 * @returns {Set<T>} A reactive proxy Set with extended methods
 * @throws {TypeError} If initialValues is not iterable
 *
 * @example
 * import { proxySet } from 'valtio/utils'
 * const state = proxySet([1,2,3])
 *
 * // can be used inside a proxy as well
 * const state = proxy({
 *   count: 1,
 *   set: proxySet()
 * })
 */
export declare function proxySet<T>(initialValues?: Iterable<T> | null): InternalProxySet<T> & {
    $$valtioSnapshot: Omit<InternalProxySet<T>, "set" | "delete" | "clear">;
};
export {};
