'use strict';

var react = require('react');
var proxyCompare = require('proxy-compare');
var vanilla = require('valtio/vanilla');

const useAffectedDebugValue = (state, affected) => {
  const pathList = react.useRef(void 0);
  react.useEffect(() => {
    pathList.current = proxyCompare.affectedToPathList(state, affected, true);
  });
  react.useDebugValue(pathList.current);
};
const condUseAffectedDebugValue = useAffectedDebugValue;
const targetCache = /* @__PURE__ */ new WeakMap();
function useSnapshot(proxyObject, options) {
  const notifyInSync = options == null ? void 0 : options.sync;
  const affected = react.useMemo(
    () => proxyObject && /* @__PURE__ */ new WeakMap(),
    [proxyObject]
  );
  const lastSnapshot = react.useRef(void 0);
  let inRender = true;
  const currSnapshot = react.useSyncExternalStore(
    react.useCallback(
      (callback) => {
        const unsub = vanilla.subscribe(proxyObject, callback, notifyInSync);
        callback();
        return unsub;
      },
      [proxyObject, notifyInSync]
    ),
    () => {
      const nextSnapshot = vanilla.snapshot(proxyObject);
      try {
        if (!inRender && lastSnapshot.current && !proxyCompare.isChanged(
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
    () => vanilla.snapshot(proxyObject)
  );
  inRender = false;
  react.useLayoutEffect(() => {
    lastSnapshot.current = currSnapshot;
  });
  if (process.env.NODE_ENV !== "production") {
    condUseAffectedDebugValue(currSnapshot, affected);
  }
  const proxyCache = react.useMemo(() => /* @__PURE__ */ new WeakMap(), []);
  return proxyCompare.createProxy(currSnapshot, affected, proxyCache, targetCache);
}

exports.useSnapshot = useSnapshot;
