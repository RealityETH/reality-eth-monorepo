(function () {
'use strict';

let _data = null;
let _promise = null;

function _load() {
  if (_promise) return _promise;
  _promise = fetch('generated/chains.json')
    .then(r => r.json())
    .then(d => { _data = d; return d; })
    .catch(() => { _data = {}; return {}; });
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
