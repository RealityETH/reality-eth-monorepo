/**
 * Creates an object composed of keys generated from the results of running each element of `collection`
 * through `iteratee`. The corresponding value of each key is the number of times the key was returned by `iteratee`.
 * Supports array-like collections.
 *
 * @example
 * countBy([6.1, 4.2, 6.3], Math.floor); // => { '4': 1, '6': 2 }
 * countBy(['one', 'two', 'three'], 'length'); // => { '3': 2, '5': 1 }
 */
declare function countBy<T, K extends PropertyKey = PropertyKey>(collection: ArrayLike<T> | null | undefined, iteratee?: ((item: T) => K) | keyof T | [keyof T, K] | Partial<T> | null | undefined): Record<K, number>;
/**
 * Creates an object composed of keys generated from the results of running each element of `collection`
 * through `iteratee`. The corresponding value of each key is the number of times the key was returned by `iteratee`.
 * Supports plain object collections.
 *
 * @example
 * countBy({ a: 'apple', b: 'banana' }, v => v[0]); // => { 'a': 1, 'b': 1 }
 * countBy({ a: 'foo', b: 'bar' }, 'length'); // => { '3': 2 }
 */
declare function countBy<T, K extends PropertyKey = PropertyKey>(collection: Record<PropertyKey, T> | null | undefined, iteratee?: ((item: T) => K) | keyof T | [keyof T, K] | Partial<T> | null | undefined): Record<K, number>;

export { countBy };
