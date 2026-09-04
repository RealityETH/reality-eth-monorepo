(function () {
'use strict';

let _data = null;
let _promise = null;

function _load() {
  if (_promise) return _promise;
  _data = window.RealityWebsiteData?.chains || {};
  _promise = Promise.resolve(_data);
  return _promise;
}

_load();

window.RealityChains = {
  name(chainId) {
    const c = _data?.[String(chainId)];
    return c ? (c.display_name || c.chainName) : null;
  },
  nativeSymbol(chainId) {
    return _data?.[String(chainId)]?.nativeCurrency?.symbol || null;
  },
  load: _load,
};

})();
