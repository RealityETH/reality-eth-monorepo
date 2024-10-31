// Script to dump out chains with no graph URL
// Used for a quick hack in the dapp, see dapp/src/scripts/index.js

const chains = require('../generated/chains.json');
let out = []; 
for (const c in chains) {
    const gurl = chains[c].graphURL;
    if (!gurl) {
        out.push(parseInt(c));
    }
}

console.log(out);
