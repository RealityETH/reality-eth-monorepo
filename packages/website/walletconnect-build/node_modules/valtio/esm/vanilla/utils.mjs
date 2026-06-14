import { subscribe, snapshot, unstable_getInternalStates, proxy } from 'valtio/vanilla';

function subscribeKey(proxyObject, key, callback, notifyInSync) {
  let prevValue = proxyObject[key];
  return subscribe(
    proxyObject,
    () => {
      const nextValue = proxyObject[key];
      if (!Object.is(prevValue, nextValue)) {
        callback(prevValue = nextValue);
      }
    },
    notifyInSync
  );
}

let currentCleanups;
function watch(callback, options) {
  let alive = true;
  const cleanups = /* @__PURE__ */ new Set();
  const subscriptions = /* @__PURE__ */ new Map();
  const cleanup = () => {
    if (alive) {
      alive = false;
      cleanups.forEach((clean) => clean());
      cleanups.clear();
      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions.clear();
    }
  };
  const revalidate = async () => {
    if (!alive) {
      return;
    }
    cleanups.forEach((clean) => clean());
    cleanups.clear();
    const proxiesToSubscribe = /* @__PURE__ */ new Set();
    const parent = currentCleanups;
    currentCleanups = cleanups;
    try {
      const promiseOrPossibleCleanup = callback((proxyObject) => {
        proxiesToSubscribe.add(proxyObject);
        if (alive && !subscriptions.has(proxyObject)) {
          const unsubscribe = subscribe(proxyObject, revalidate, options == null ? void 0 : options.sync);
          subscriptions.set(proxyObject, unsubscribe);
        }
        return proxyObject;
      });
      const couldBeCleanup = promiseOrPossibleCleanup && promiseOrPossibleCleanup instanceof Promise ? await promiseOrPossibleCleanup : promiseOrPossibleCleanup;
      if (couldBeCleanup) {
        if (alive) {
          cleanups.add(couldBeCleanup);
        } else {
          cleanup();
        }
      }
    } finally {
      currentCleanups = parent;
    }
    subscriptions.forEach((unsubscribe, proxyObject) => {
      if (!proxiesToSubscribe.has(proxyObject)) {
        subscriptions.delete(proxyObject);
        unsubscribe();
      }
    });
  };
  if (currentCleanups) {
    currentCleanups.add(cleanup);
  }
  revalidate();
  return cleanup;
}

const DEVTOOLS = Symbol();
function devtools(proxyObject, options) {
  const { enabled, name = "", ...rest } = options || {};
  let extension;
  try {
    extension = (enabled != null ? enabled : (import.meta.env ? import.meta.env.MODE : void 0) !== "production") && window.__REDUX_DEVTOOLS_EXTENSION__;
  } catch (e) {
  }
  if (!extension) {
    if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && enabled) {
      console.warn("[Warning] Please install/enable Redux devtools extension");
    }
    return;
  }
  let isTimeTraveling = false;
  const devtools2 = extension.connect({ name, ...rest });
  const unsub1 = subscribe(proxyObject, (ops) => {
    const action = ops.filter(([_, path]) => path[0] !== DEVTOOLS).map(([op, path]) => `${op}:${path.map(String).join(".")}`).join(", ");
    if (!action) {
      return;
    }
    if (isTimeTraveling) {
      isTimeTraveling = false;
    } else {
      const snapWithoutDevtools = Object.assign({}, snapshot(proxyObject));
      delete snapWithoutDevtools[DEVTOOLS];
      devtools2.send(
        {
          type: action,
          updatedAt: (/* @__PURE__ */ new Date()).toLocaleString()
        },
        snapWithoutDevtools
      );
    }
  });
  const unsub2 = devtools2.subscribe((message) => {
    var _a, _b, _c, _d, _e, _f;
    if (message.type === "ACTION" && message.payload) {
      try {
        Object.assign(proxyObject, JSON.parse(message.payload));
      } catch (e) {
        console.error(
          "please dispatch a serializable value that JSON.parse() and proxy() support\n",
          e
        );
      }
    }
    if (message.type === "DISPATCH" && message.state) {
      if (((_a = message.payload) == null ? void 0 : _a.type) === "JUMP_TO_ACTION" || ((_b = message.payload) == null ? void 0 : _b.type) === "JUMP_TO_STATE") {
        isTimeTraveling = true;
        const state = JSON.parse(message.state);
        Object.assign(proxyObject, state);
      }
      proxyObject[DEVTOOLS] = message;
    } else if (message.type === "DISPATCH" && ((_c = message.payload) == null ? void 0 : _c.type) === "COMMIT") {
      devtools2.init(snapshot(proxyObject));
    } else if (message.type === "DISPATCH" && ((_d = message.payload) == null ? void 0 : _d.type) === "IMPORT_STATE") {
      const actions = (_e = message.payload.nextLiftedState) == null ? void 0 : _e.actionsById;
      const computedStates = ((_f = message.payload.nextLiftedState) == null ? void 0 : _f.computedStates) || [];
      isTimeTraveling = true;
      computedStates.forEach(({ state }, index) => {
        const action = actions[index] || "No action found";
        Object.assign(proxyObject, state);
        if (index === 0) {
          devtools2.init(snapshot(proxyObject));
        } else {
          devtools2.send(action, snapshot(proxyObject));
        }
      });
    }
  });
  devtools2.init(snapshot(proxyObject));
  return () => {
    unsub1();
    unsub2 == null ? void 0 : unsub2();
  };
}

const { proxyStateMap: proxyStateMap$1, snapCache: snapCache$1 } = unstable_getInternalStates();
const isProxy$1 = (x) => proxyStateMap$1.has(x);
const isProxyMap = (obj) => {
  return Symbol.toStringTag in obj && obj[Symbol.toStringTag] === "Map" && proxyStateMap$1.has(obj);
};
function proxyMap(entries) {
  const initialData = [];
  let initialIndex = 0;
  const indexMap = /* @__PURE__ */ new Map();
  const snapMapCache = /* @__PURE__ */ new WeakMap();
  const registerSnapMap = () => {
    const cache = snapCache$1.get(vObject);
    const latestSnap = cache == null ? void 0 : cache[1];
    if (latestSnap && !snapMapCache.has(latestSnap)) {
      const clonedMap = new Map(indexMap);
      snapMapCache.set(latestSnap, clonedMap);
    }
  };
  const getMapForThis = (x) => snapMapCache.get(x) || indexMap;
  if (entries) {
    if (typeof entries[Symbol.iterator] !== "function") {
      throw new TypeError(
        "proxyMap:\n	initial state must be iterable\n		tip: structure should be [[key, value]]"
      );
    }
    for (const [key, value] of entries) {
      indexMap.set(key, initialIndex);
      initialData[initialIndex++] = value;
    }
  }
  const vObject = {
    data: initialData,
    index: initialIndex,
    epoch: 0,
    get size() {
      if (!isProxy$1(this)) {
        registerSnapMap();
      }
      const map = getMapForThis(this);
      return map.size;
    },
    get(key) {
      const map = getMapForThis(this);
      const index = map.get(key);
      if (index === void 0) {
        this.epoch;
        return void 0;
      }
      return this.data[index];
    },
    has(key) {
      const map = getMapForThis(this);
      this.epoch;
      return map.has(key);
    },
    set(key, value) {
      if (!isProxy$1(this)) {
        throw new Error("Cannot perform mutations on a snapshot");
      }
      const index = indexMap.get(key);
      if (index === void 0) {
        indexMap.set(key, this.index);
        this.data[this.index++] = value;
      } else {
        this.data[index] = value;
      }
      this.epoch++;
      return this;
    },
    delete(key) {
      if (!isProxy$1(this)) {
        throw new Error("Cannot perform mutations on a snapshot");
      }
      const index = indexMap.get(key);
      if (index === void 0) {
        return false;
      }
      delete this.data[index];
      indexMap.delete(key);
      this.epoch++;
      return true;
    },
    clear() {
      if (!isProxy$1(this)) {
        throw new Error("Cannot perform mutations on a snapshot");
      }
      this.data.length = 0;
      this.index = 0;
      this.epoch++;
      indexMap.clear();
    },
    forEach(cb) {
      this.epoch;
      const map = getMapForThis(this);
      map.forEach((index, key) => {
        cb(this.data[index], key, this);
      });
    },
    *entries() {
      this.epoch;
      const map = getMapForThis(this);
      for (const [key, index] of map) {
        yield [key, this.data[index]];
      }
    },
    *keys() {
      this.epoch;
      const map = getMapForThis(this);
      for (const key of map.keys()) {
        yield key;
      }
    },
    *values() {
      this.epoch;
      const map = getMapForThis(this);
      for (const index of map.values()) {
        yield this.data[index];
      }
    },
    [Symbol.iterator]() {
      return this.entries();
    },
    get [Symbol.toStringTag]() {
      return "Map";
    },
    toJSON() {
      return new Map(this.entries());
    }
  };
  const proxiedObject = proxy(vObject);
  Object.defineProperties(proxiedObject, {
    size: { enumerable: false },
    index: { enumerable: false },
    epoch: { enumerable: false },
    data: { enumerable: false },
    toJSON: { enumerable: false }
  });
  Object.seal(proxiedObject);
  return proxiedObject;
}

const { proxyStateMap, snapCache } = unstable_getInternalStates();
const maybeProxify = (x) => typeof x === "object" ? proxy({ x }).x : x;
const isProxy = (x) => proxyStateMap.has(x);
const isProxySet = (obj) => {
  return Symbol.toStringTag in obj && obj[Symbol.toStringTag] === "Set" && proxyStateMap.has(obj);
};
function proxySet(initialValues) {
  const initialData = [];
  const indexMap = /* @__PURE__ */ new Map();
  let initialIndex = 0;
  const snapMapCache = /* @__PURE__ */ new WeakMap();
  const registerSnapMap = () => {
    const cache = snapCache.get(vObject);
    const latestSnap = cache == null ? void 0 : cache[1];
    if (latestSnap && !snapMapCache.has(latestSnap)) {
      const clonedMap = new Map(indexMap);
      snapMapCache.set(latestSnap, clonedMap);
    }
  };
  const getMapForThis = (x) => snapMapCache.get(x) || indexMap;
  if (initialValues) {
    if (typeof initialValues[Symbol.iterator] !== "function") {
      throw new TypeError("not iterable");
    }
    for (const value of initialValues) {
      if (!indexMap.has(value)) {
        const v = maybeProxify(value);
        indexMap.set(v, initialIndex);
        initialData[initialIndex++] = v;
      }
    }
  }
  const vObject = {
    data: initialData,
    index: initialIndex,
    epoch: 0,
    get size() {
      if (!isProxy(this)) {
        registerSnapMap();
      }
      return indexMap.size;
    },
    has(value) {
      const map = getMapForThis(this);
      const v = maybeProxify(value);
      this.epoch;
      return map.has(v);
    },
    add(value) {
      if (!isProxy(this)) {
        throw new Error("Cannot perform mutations on a snapshot");
      }
      const v = maybeProxify(value);
      if (!indexMap.has(v)) {
        indexMap.set(v, this.index);
        this.data[this.index++] = v;
        this.epoch++;
      }
      return this;
    },
    delete(value) {
      if (!isProxy(this)) {
        throw new Error("Cannot perform mutations on a snapshot");
      }
      const v = maybeProxify(value);
      const index = indexMap.get(v);
      if (index === void 0) {
        return false;
      }
      delete this.data[index];
      indexMap.delete(v);
      this.epoch++;
      return true;
    },
    clear() {
      if (!isProxy(this)) {
        throw new Error("Cannot perform mutations on a snapshot");
      }
      this.data.length = 0;
      this.index = 0;
      this.epoch++;
      indexMap.clear();
    },
    forEach(cb) {
      this.epoch;
      const map = getMapForThis(this);
      map.forEach((index) => {
        cb(this.data[index], this.data[index], this);
      });
    },
    *values() {
      this.epoch;
      const map = getMapForThis(this);
      for (const index of map.values()) {
        yield this.data[index];
      }
    },
    keys() {
      this.epoch;
      return this.values();
    },
    *entries() {
      this.epoch;
      const map = getMapForThis(this);
      for (const index of map.values()) {
        const value = this.data[index];
        yield [value, value];
      }
    },
    toJSON() {
      return new Set(this.values());
    },
    [Symbol.iterator]() {
      return this.values();
    },
    get [Symbol.toStringTag]() {
      return "Set";
    },
    intersection(other) {
      this.epoch;
      const otherSet = proxySet(other);
      const resultSet = proxySet();
      for (const value of this.values()) {
        if (otherSet.has(value)) {
          resultSet.add(value);
        }
      }
      return proxySet(resultSet);
    },
    union(other) {
      this.epoch;
      const resultSet = proxySet();
      const otherSet = proxySet(other);
      for (const value of this.values()) {
        resultSet.add(value);
      }
      for (const value of otherSet) {
        resultSet.add(value);
      }
      return proxySet(resultSet);
    },
    difference(other) {
      this.epoch;
      const resultSet = proxySet();
      const otherSet = proxySet(other);
      for (const value of this.values()) {
        if (!otherSet.has(value)) {
          resultSet.add(value);
        }
      }
      return proxySet(resultSet);
    },
    symmetricDifference(other) {
      this.epoch;
      const resultSet = proxySet();
      const otherSet = proxySet(other);
      for (const value of this.values()) {
        if (!otherSet.has(value)) {
          resultSet.add(value);
        }
      }
      for (const value of otherSet.values()) {
        if (!this.has(value)) {
          resultSet.add(value);
        }
      }
      return proxySet(resultSet);
    },
    isSubsetOf(other) {
      this.epoch;
      const otherSet = proxySet(other);
      return this.size <= other.size && [...this.values()].every((value) => otherSet.has(value));
    },
    isSupersetOf(other) {
      this.epoch;
      const otherSet = proxySet(other);
      return this.size >= other.size && [...otherSet].every((value) => this.has(value));
    },
    isDisjointFrom(other) {
      this.epoch;
      const otherSet = proxySet(other);
      return [...this.values()].every((value) => !otherSet.has(value));
    }
  };
  const proxiedObject = proxy(vObject);
  Object.defineProperties(proxiedObject, {
    size: { enumerable: false },
    data: { enumerable: false },
    index: { enumerable: false },
    epoch: { enumerable: false },
    toJSON: { enumerable: false }
  });
  Object.seal(proxiedObject);
  return proxiedObject;
}

const isObject = (x) => typeof x === "object" && x !== null;
let defaultRefSet;
const getDefaultRefSet = () => {
  if (!defaultRefSet) {
    defaultRefSet = unstable_getInternalStates().refSet;
  }
  return defaultRefSet;
};
function deepClone(obj, getRefSet = getDefaultRefSet) {
  if (!isObject(obj) || getRefSet().has(obj)) {
    return obj;
  }
  if (isProxySet(obj)) {
    return proxySet([...obj]);
  }
  if (isProxyMap(obj)) {
    return proxyMap([
      ...obj.entries()
    ]);
  }
  const baseObject = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
  Reflect.ownKeys(obj).forEach((key) => {
    baseObject[key] = deepClone(obj[key], getRefSet);
  });
  return baseObject;
}

export { deepClone, devtools, proxyMap, proxySet, subscribeKey, watch };
