/** Function type for any kind of function */
type AnyFunction = (...args: any[]) => any;
/** Object that can be proxied */
type ProxyObject = object;
/** Property access path as an array of property names/symbols */
type Path = (string | symbol)[];
/**
 * Operation performed on a proxy object
 * - 'set': A property was set to a new value
 * - 'delete': A property was deleted
 */
type Op = [op: 'set', path: Path, value: unknown, prevValue: unknown] | [op: 'delete', path: Path, prevValue: unknown];
/** Function called when a proxy object changes */
type Listener = (op: Op, nextVersion: number) => void;
export type INTERNAL_Op = Op;
/** JavaScript primitive types */
type Primitive = string | number | boolean | null | undefined | symbol | bigint;
/** Types that should not be proxied in snapshots */
type SnapshotIgnore = Date | Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any> | Error | RegExp | AnyFunction | Primitive;
/**
 * Snapshot type that converts objects to readonly versions recursively
 *
 * @template T - Type to convert to a snapshot
 */
export type Snapshot<T> = T extends {
    $$valtioSnapshot: infer S;
} ? S : T extends SnapshotIgnore ? T : T extends object ? {
    readonly [K in keyof T]: Snapshot<T[K]>;
} : T;
type RemoveListener = () => void;
type AddListener = (listener: Listener) => RemoveListener;
type ProxyState = readonly [
    target: object,
    ensureVersion: (nextCheckVersion?: number) => number,
    addListener: AddListener
];
declare const canProxyDefault: (x: unknown) => boolean;
declare const createSnapshotDefault: <T extends object>(target: T, version: number) => T;
declare const createHandlerDefault: <T extends object>(isInitializing: () => boolean, addPropListener: (prop: string | symbol, propValue: unknown) => void, removePropListener: (prop: string | symbol) => void, notifyUpdate: (op: Op) => void) => ProxyHandler<T>;
declare const proxyStateMap: WeakMap<ProxyObject, ProxyState>;
declare const refSet: WeakSet<object>;
declare const snapCache: WeakMap<object, [version: number, snap: unknown]>;
declare const versionHolder: [number];
declare const proxyCache: WeakMap<object, ProxyObject>;
declare let objectIs: (a: unknown, b: unknown) => boolean;
declare let newProxy: <T extends object>(target: T, handler: ProxyHandler<T>) => T;
declare let canProxy: typeof canProxyDefault;
declare let createSnapshot: typeof createSnapshotDefault;
declare let createHandler: typeof createHandlerDefault;
/**
 * Creates a reactive proxy object that can be tracked for changes
 *
 * @template T - Type of the object to be proxied
 * @param {T} baseObject - The object to create a proxy for
 * @returns {T} A proxied version of the input object
 * @throws {Error} If the input is not an object
 */
export declare function proxy<T extends object>(baseObject?: T): T;
/**
 * Gets the current version number of a proxy object
 *
 * @param {unknown} proxyObject - The proxy object to get the version of
 * @returns {number | undefined} The current version number, or undefined if not a proxy
 */
export declare function getVersion(proxyObject: unknown): number | undefined;
/**
 * Subscribes to changes in a proxy object
 *
 * @template T - Type of the proxy object
 * @param {T} proxyObject - The proxy object to subscribe to
 * @param {Function} callback - Function called when the proxy object changes
 * @param {boolean} [notifyInSync] - If true, notifications happen synchronously
 * @returns {Function} Unsubscribe function to stop listening for changes
 */
export declare function subscribe<T extends object>(proxyObject: T, callback: (unstable_ops: Op[]) => void, notifyInSync?: boolean): () => void;
/**
 * Creates an immutable snapshot of the current state of a proxy object
 *
 * @template T - Type of the proxy object
 * @param {T} proxyObject - The proxy object to create a snapshot from
 * @returns {Snapshot<T>} An immutable snapshot of the current state
 */
export declare function snapshot<T extends object>(proxyObject: T): Snapshot<T>;
/**
 * Marks an object to be excluded from proxying
 *
 * Objects marked with ref will be kept as references in snapshots
 * instead of being deeply copied.
 *
 * @template T - Type of the object to mark as a reference
 * @param {T} obj - The object to mark as a reference
 * @returns {T & { $$valtioSnapshot: T }} The same object with a type marker
 */
export declare function ref<T extends object>(obj: T): T & {
    $$valtioSnapshot: T;
};
export declare function unstable_getInternalStates(): {
    proxyStateMap: typeof proxyStateMap;
    refSet: typeof refSet;
    snapCache: typeof snapCache;
    versionHolder: typeof versionHolder;
    proxyCache: typeof proxyCache;
};
export declare function unstable_replaceInternalFunction(name: 'objectIs', fn: (prev: typeof objectIs) => typeof objectIs): void;
export declare function unstable_replaceInternalFunction(name: 'newProxy', fn: (prev: typeof newProxy) => typeof newProxy): void;
export declare function unstable_replaceInternalFunction(name: 'canProxy', fn: (prev: typeof canProxy) => typeof canProxy): void;
export declare function unstable_replaceInternalFunction(name: 'createSnapshot', fn: (prev: typeof createSnapshot) => typeof createSnapshot): void;
export declare function unstable_replaceInternalFunction(name: 'createHandler', fn: (prev: typeof createHandler) => typeof createHandler): void;
export {};
