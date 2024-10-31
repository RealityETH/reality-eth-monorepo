import '../styles/index.scss';

'use strict';

import common from './common.js';
import rpc from './rpc.js';
import graph from './graph.js';

const cookie = document.cookie;

// Quick-and-dirty check to make sure we actually have graph on the target network
// TODO: We should really be getting this from rc_contracts
function isGraphUsable() {
    const whash = window.location.hash;
    const regex = /\/network\/(.*?)(\/|$)/;
    const found = whash.match(regex);
    // output from contracts/scripts/no_graph_chains.js
    const nograph = [
             8,      40,       69,
           300,     690,      777,
          1101,   10200,    17000,
        421611,  421613,   421614,
        534353, 1337702, 11155111,
      11155420
    ];

    if (found && found[1]) {
        const nid = parseInt(found[1]);
        if (nograph.indexOf(nid) > -1) {
            console.log('selected chain does not support Graph, forcing RPC');
            return false;
        }
    }
    return true;
}

// If you have a cookie we'll obey the cookie. Otherwise use graph.
if (!isGraphUsable() || (cookie && cookie.indexOf('graph=0') !== -1)) {
   console.log('using rpc');
   rpc();
} else {
   console.log('using graph');
   graph();
}

common();
