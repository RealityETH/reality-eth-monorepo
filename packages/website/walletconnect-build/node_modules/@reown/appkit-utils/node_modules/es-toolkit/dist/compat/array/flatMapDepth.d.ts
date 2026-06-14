type RecursiveArray<T> = Array<T | RecursiveArray<T>>;
/**
 * Maps each element in an array and then flattens the resulting array up to the default depth of 1.
 *
 * @template T - The type of elements within the array.
 * @param {Record<string, ArrayLike<T | RecursiveArray<T>> | T> | Record<number, ArrayLike<T | RecursiveArray<T>> | T> | null | undefined} collection - The array or object to iterate over.
 * @returns {T[]} A new array that has been flattened up to the default depth of 1.
 *
 * @example
 * const result = flatMapDepth([[1, 2], [3, 4]], 1);
 * // [1, 2, 3, 4]
 */
declare function flatMapDepth<T>(collection: Record<string, ArrayLike<T | RecursiveArray<T>> | T> | Record<number, ArrayLike<T | RecursiveArray<T>> | T> | null | undefined): T[];
/**
 * Maps each element in an array using a provided iteratee function and then flattens the resulting array up to the specified depth.
 *
 * @template T - The type of elements within the array.
 * @template R - The type of elements within the returned array from the iteratee function.
 * @param {ArrayLike<T> | null | undefined} array - The array to iterate over.
 * @param {(value: T, index: number, array: ArrayLike<T>) => ArrayLike<R | RecursiveArray<R>> | R} iteratee - The function that produces the new array elements.
 * @param {number} [depth=1] - The maximum recursion depth.
 * @returns {R[]} A new array that has been flattened up to the specified depth.
 *
 * @example
 * const result = flatMapDepth([1, 2, 3], n => [n, n], 1);
 * // [1, 1, 2, 2, 3, 3]
 */
declare function flatMapDepth<T, R>(array: ArrayLike<T> | null | undefined, iteratee: (value: T, index: number, array: ArrayLike<T>) => ArrayLike<R | RecursiveArray<R>> | R, depth?: number): R[];
/**
 * Maps each element in an object using a provided iteratee function and then flattens the resulting array up to the specified depth.
 *
 * @template T - The type of elements within the object.
 * @template R - The type of elements within the returned array from the iteratee function.
 * @param {T} collection - The object to iterate over.
 * @param {(value: T[keyof T], key: string, object: T) => ArrayLike<R | RecursiveArray<R>> | R} iteratee - The function that produces the new array elements.
 * @param {number} [depth=1] - The maximum recursion depth.
 * @returns {R[]} A new array that has been flattened up to the specified depth.
 *
 * @example
 * const result = flatMapDepth({ a: [1, 2, 3], b: [4, 5, 6] }, n => [n, n], 1);
 * // [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]
 */
declare function flatMapDepth<T extends object, R>(collection: T, iteratee: (value: T[keyof T], key: string, object: T) => ArrayLike<R | RecursiveArray<R>> | R, depth?: number): R[];
/**
 * Maps each element in an object using a provided path and then flattens the resulting array up to the specified depth.
 *
 * @param {object | null | undefined} collection - The object to iterate over.
 * @param {string} path - The path of the property to get.
 * @param {number} [depth=1] - The maximum recursion depth.
 * @returns {any[]} A new array that has been flattened up to the specified depth.
 *
 * @example
 * const result = flatMapDepth({ a: {a: 1, b: 2}, b: {a: 3, b: 4} }, 'a', 1);
 * // [1, 3]
 */
declare function flatMapDepth(collection: object | null | undefined, path: string, depth?: number): any[];
/**
 * Maps each element in an object using a provided matches object and then flattens the resulting array up to the specified depth.
 *
 * @param {object | null | undefined} collection - The object to iterate over.
 * @param {object} matches - The object to match.
 * @param {number} [depth=1] - The maximum recursion depth.
 * @returns {boolean[]} A new array that has been flattened up to the specified depth.
 *
 * @example
 * const result = flatMapDepth({ a: {a: 1, b: 2}, b: {a: 3, b: 4} }, {a: 1, b: 2}, 1);
 * // [true, false]
 */
declare function flatMapDepth(collection: object | null | undefined, matches: object, depth?: number): boolean[];

export { flatMapDepth };
