type Config = Parameters<(Window extends {
    __REDUX_DEVTOOLS_EXTENSION__?: infer T;
} ? T : {
    connect: (param: any) => any;
})['connect']>[0];
type Options = {
    enabled?: boolean;
    name?: string;
} & Config;
/**
 * Connects a proxy object to Redux DevTools Extension for state debugging
 *
 * This allows real-time monitoring and time-travel debugging of state changes
 * using the Redux DevTools browser extension.
 *
 * Limitation: Only plain objects/values are supported.
 *
 * @template T - Type of the proxy object
 * @param {T} proxyObject - The proxy object to connect to DevTools
 * @param {Options} [options] - Configuration options for the DevTools connection
 * @param {boolean} [options.enabled] - Explicitly enable or disable the connection
 * @param {string} [options.name=''] - Name to display in DevTools
 * @returns {Function|undefined} Unsubscribe function to disconnect from DevTools, or undefined if connection failed
 *
 * @example
 * import { devtools } from 'valtio/utils'
 * const state = proxy({ count: 0, text: 'hello' })
 * const unsub = devtools(state, { name: 'state name', enabled: true })
 */
export declare function devtools<T extends object>(proxyObject: T, options?: Options): (() => void) | undefined;
export {};
