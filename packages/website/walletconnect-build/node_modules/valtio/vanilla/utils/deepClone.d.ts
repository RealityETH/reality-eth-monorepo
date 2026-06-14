/**
 * Creates a deep clone of an object, maintaining proxy behavior for Maps and Sets
 *
 * @template T - Type of the object to clone
 * @param {T} obj - The object to clone
 * @param {Function} [getRefSet=getDefaultRefSet] - Function to get the set of reference objects
 * @returns {T} A deep clone of the input object
 */
export declare function deepClone<T>(obj: T, getRefSet?: () => WeakSet<object>): T;
