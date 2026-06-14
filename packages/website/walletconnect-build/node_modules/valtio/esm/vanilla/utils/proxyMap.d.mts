/**
 * Determines if an object is a proxy Map created with proxyMap
 *
 * @param {object} obj - The object to check
 * @returns {boolean} True if the object is a proxy Map, false otherwise
 */
export declare const isProxyMap: (obj: object) => boolean;
/**
 * Creates a reactive Map that integrates with Valtio's proxy system
 *
 * This utility creates a Map-like object that works with Valtio's reactivity system,
 * allowing you to track changes to the Map in the same way as regular proxy objects.
 * The API is the same as the standard JavaScript Map.
 *
 * @template K - Type of the Map keys
 * @template V - Type of the Map values
 * @param {Iterable<[K, V]>} [entries] - Initial key-value pairs to populate the Map
 * @returns {Map<K, V>} A proxy Map object that tracks changes
 * @throws {TypeError} If entries is not iterable
 *
 * @example
 * import { proxyMap } from 'valtio/utils'
 * const state = proxyMap([["key", "value"]])
 *
 * // can be used inside a proxy as well
 * const state = proxy({
 *   count: 1,
 *   map: proxyMap()
 * })
 *
 * // When using an object as a key, you can wrap it with `ref` so it's not proxied
 * // this is useful if you want to preserve the key equality
 * import { ref } from 'valtio'
 *
 * const key = ref({})
 * state.set(key, "value")
 * state.get(key) //value
 *
 * const key = {}
 * state.set(key, "value")
 * state.get(key) //undefined
 */
export declare function proxyMap<K, V>(entries?: Iterable<[K, V]> | undefined | null): Map<K, V> & {
    $$valtioSnapshot: Omit<Map<K, V>, "set" | "delete" | "clear">;
};
