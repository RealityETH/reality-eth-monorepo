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
    return _data?.[String(chainId)]?.chainName || null;
  },
  nativeSymbol(chainId) {
    return _data?.[String(chainId)]?.nativeCurrency?.symbol || null;
  },
  load: _load,
};

})();
