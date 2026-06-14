/**
 * Finds the key of the last element predicate returns truthy for.
 *
 * @template T - The type of the object.
 * @param {T | null | undefined} obj - The object to inspect.
 * @param {(value: T[keyof T], key: keyof T, obj: T) => unknown} conditionToFind - The function invoked per iteration.
 * @returns {keyof T | undefined} Returns the key of the matched element, else `undefined`.
 *
 * @example
 * const users = {
 *   barney: { age: 36, active: true },
 *   fred: { age: 40, active: false },
 *   pebbles: { age: 1, active: true }
 * };
 * const result = findLastKey(users, o => o.age < 40);
 * // => 'pebbles'
 */
declare function findLastKey<T>(obj: T | null | undefined, conditionToFind: (value: T[keyof T], key: string, obj: T) => unknown): string | undefined;
/**
 * Finds the key of the last element that matches the given object.
 *
 * @template T - The type of the object.
 * @param {T | null | undefined} obj - The object to inspect.
 * @param {Partial<T[keyof T]>} objectToFind - The object to match.
 * @returns {keyof T | undefined} Returns the key of the matched element, else `undefined`.
 *
 * @example
 * const users = {
 *   barney: { age: 36, active: true },
 *   fred: { age: 40, active: false },
 *   pebbles: { age: 1, active: true }
 * };
 * const result = findLastKey(users, { active: true });
 * // => 'pebbles'
 */
declare function findLastKey<T>(obj: T | null | undefined, objectToFind: Partial<T[keyof T]>): string | undefined;
/**
 * Finds the key of the last element that matches the given property and value.
 *
 * @template T - The type of the object.
 * @param {T | null | undefined} obj - The object to inspect.
 * @param {[PropertyKey, any]} propertyToFind - The property and value to match.
 * @returns {keyof T | undefined} Returns the key of the matched element, else `undefined`.
 *
 * @example
 * const users = {
 *   barney: { age: 36, active: true },
 *   fred: { age: 40, active: false },
 *   pebbles: { age: 1, active: true }
 * };
 * const result = findLastKey(users, ['active', false]);
 * // => 'fred'
 */
declare function findLastKey<T>(obj: T | null | undefined, propertyToFind: [PropertyKey, any]): string | undefined;
/**
 * Finds the key of the last element that has a truthy value for the given property.
 *
 * @template T - The type of the object.
 * @param {T | null | undefined} obj - The object to inspect.
 * @param {PropertyKey} propertyToFind - The property to check.
 * @returns {string | undefined} Returns the key of the matched element, else `undefined`.
 *
 * @example
 * const users = {
 *   barney: { age: 36, active: true },
 *   fred: { age: 40, active: false },
 *   pebbles: { age: 1, active: true }
 * };
 * const result = findLastKey(users, 'active');
 * // => 'pebbles'
 */
declare function findLastKey<T>(obj: T | null | undefined, propertyToFind: PropertyKey): string | undefined;
/**
 * Finds the key of the last element that matches the given predicate.
 *
 * @template T - The type of the object.
 * @param {T | null | undefined} obj - The object to inspect.
 * @param {((value: T[keyof T], key: string, obj: T) => unknown) | PropertyKey | [PropertyKey, any] | Partial<T[keyof T]>} predicate - The predicate to match.
 * @returns {string | undefined} Returns the key of the matched element, else `undefined`.
 *
 * @example
 * const users = {
 *   barney: { age: 36, active: true },
 *   fred: { age: 40, active: false },
 *   pebbles: { age: 1, active: true }
 * };
 *
 * findLastKey(users, o => o.age < 40);
 * // => 'pebbles'
 *
 * findLastKey(users, { active: true });
 * // => 'pebbles'
 *
 * findLastKey(users, ['active', false]);
 * // => 'fred'
 *
 * findLastKey(users, 'active');
 * // => 'pebbles'
 */
declare function findLastKey<T>(obj: T | null | undefined, predicate?: ((value: T[keyof T], key: string, obj: T) => unknown) | PropertyKey | [PropertyKey, any] | Partial<T[keyof T]>): string | undefined;

export { findLastKey };
