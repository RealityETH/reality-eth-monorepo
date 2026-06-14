'use strict';

var react$1 = require('react');
var react = require('valtio/react');

const DUMMY_SYMBOL = Symbol();
function useProxy(proxy, options) {
  const snapshot = react.useSnapshot(proxy, options);
  snapshot[DUMMY_SYMBOL];
  let isRendering = true;
  react$1.useLayoutEffect(() => {
    isRendering = false;
  });
  return new Proxy(proxy, {
    get(target, prop) {
      return isRendering ? snapshot[prop] : target[prop];
    }
  });
}

exports.useProxy = useProxy;
