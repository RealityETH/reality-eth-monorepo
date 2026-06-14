import { useMemo, useRef, useSyncExternalStore, useCallback, useLayoutEffect, useEffect, useDebugValue } from 'react';
import { isChanged, createProxy, affectedToPathList } from 'proxy-compare';
import { subscribe, snapshot } from 'valtio/vanilla';

const useAffectedDebugValue = (state, affected) => {
  const pathList = useRef(void 0);
  useEffect(() => {
    pathList.current = affectedToPathList(state, affected, true);
  });
  useDebugValue(pathList.current);
};
const condUseAffectedDebugValue = useAffectedDebugValue;
const targetCache = /* @__PURE__ */ new WeakMap();
function useSnapshot(proxyObject, options) {
  const notifyInSync = options == null ? void 0 : options.sync;
  const affected = useMemo(
    () => proxyObject && /* @__PURE__ */ new WeakMap(),
    [proxyObject]
  );
  const lastSnapshot = useRef(void 0);
  let inRender = true;
  const currSnapshot = useSyncExternalStore(
    useCallback(
      (callback) => {
        const unsub = subscribe(proxyObject, callback, notifyInSync);
        callback();
        return unsub;
      },
      [proxyObject, notifyInSync]
    ),
    () => {
      const nextSnapshot = snapshot(proxyObject);
      try {
        if (!inRender && lastSnapshot.current && !isChanged(
          lastSnapshot.current,
          nextSnapshot,
          affected,
          /* @__PURE__ */ new WeakMap()
        )) {
          return lastSnapshot.current;
        }
      } catch (e) {
      }
      return nextSnapshot;
    },
    () => snapshot(proxyObject)
  );
  inRender = false;
  useLayoutEffect(() => {
    lastSnapshot.current = currSnapshot;
  });
  if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production") {
    condUseAffectedDebugValue(currSnapshot, affected);
  }
  const proxyCache = useMemo(() => /* @__PURE__ */ new WeakMap(), []);
  return createProxy(currSnapshot, affected, proxyCache, targetCache);
}

export { useSnapshot };
