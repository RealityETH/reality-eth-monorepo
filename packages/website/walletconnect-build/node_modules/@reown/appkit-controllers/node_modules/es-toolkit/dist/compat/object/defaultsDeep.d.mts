/**
 * Recursively assigns default values to an `object`, ensuring that certain properties do not remain `undefined`.
 * It sets default values for properties that are either `undefined` or inherited from `Object.prototype`.
 *
 * Similar to `defaults` but recursively applies default values to nested objects.
 * Source objects are applied in order from left to right, and once a property has been assigned a value,
 * any subsequent values for that property will be ignored.
 *
 * Note: This function modifies the first argument, `object`.
 *
 * @template T - The type of the object being processed.
 * @param {T} object - The target object.
 * @returns {T} The object itself.
 */
declare function defaultsDeep<T extends object>(object: T): NonNullable<T>;
/**
 * Recursively assigns default values to an `object`, ensuring that certain properties do not remain `undefined`.
 * It sets default values for properties that are either `undefined` or inherited from `Object.prototype`.
 *
 * Similar to `defaults` but recursively applies default values to nested objects.
 * Source objects are applied in order from left to right, and once a property has been assigned a value,
 * any subsequent values for that property will be ignored.
 *
 * Note: This function modifies the first argument, `object`.
 *
 * @template T - The type of the object being processed.
 * @template S - The type of the object that provides default values.
 * @param {T} object - The target object that will receive default values.
 * @param {S} source - The object that specifies the default values to apply.
 * @returns {NonNullable<T & S>} The `object` that has been updated with default values from `source`, recursively merging nested objects.
 */
declare function defaultsDeep<T extends object, S extends object>(object: T, source: S): NonNullable<T & S>;
/**
 * Recursively assigns default values to an `object`, ensuring that certain properties do not remain `undefined`.
 * It sets default values for properties that are either `undefined` or inherited from `Object.prototype`.
 *
 * Similar to `defaults` but recursively applies default values to nested objects.
 * Source objects are applied in order from left to right, and once a property has been assigned a value,
 * any subsequent values for that property will be ignored.
 *
 * Note: This function modifies the first argument, `object`.
 *
 * @template T - The type of the object being processed.
 * @template S1 - The type of the first source object providing default values.
 * @template S2 - The type of the second source object providing default values.
 * @param {T} object - The target object that will receive default values.
 * @param {S1} source1 - The first source object providing default values.
 * @param {S2} source2 - The second source object providing default values.
 * @returns {NonNullable<T & S1 & S2>} The `object` that has been updated with default values from `source1` and `source2`, recursively merging nested objects.
 */
declare function defaultsDeep<T extends object, S1 extends object, S2 extends object>(object: T, source1: S1, source2: S2): NonNullable<T & S1 & S2>;
/**
 * Recursively assigns default values to an `object`, ensuring that certain properties do not remain `undefined`.
 * It sets default values for properties that are either `undefined` or inherited from `Object.prototype`.
 *
 * Similar to `defaults` but recursively applies default values to nested objects.
 * Source objects are applied in order from left to right, and once a property has been assigned a value,
 * any subsequent values for that property will be ignored.
 *
 * Note: This function modifies the first argument, `object`.
 *
 * @template T - The type of the object being processed.
 * @param {T} object - The target object that will receive default values.
 * @param {S[]} sources - One or more source objects that specify default values to apply.
 * @returns {object} The `object` that has been updated with default values from all sources, recursively merging nested objects.
 *
 * @example
 * defaultsDeep({ a: { b: 2 } }, { a: { b: 3, c: 3 }, d: 4 }); // { a: { b: 2, c: 3 }, d: 4 }
 * defaultsDeep({ a: { b: undefined } }, { a: { b: 1 } }); // { a: { b: 1 } }
 * defaultsDeep({ a: null }, { a: { b: 1 } }); // { a: null }
 */
declare function defaultsDeep<T extends object, S extends object>(target: T, ...sources: S[]): object;

export { defaultsDeep };
