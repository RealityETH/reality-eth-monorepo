import '../styles/index.scss';

'use strict';

import rpc from './rpc.js';
import graph from './graph.js';

const cookie = document.cookie;

// If you have a cookie we'll obey the cookie. Otherwise use graph.
if (cookie && cookie.indexOf('graph=0') !== -1) {
   console.log('using rpc');
   rpc();
} else {
   console.log('using graph');
   graph();
}
