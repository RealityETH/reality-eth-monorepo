'use strict';

const storeCustomContract = function (ctr, custom_contract_str, chain_id) {
    console.log('Trying to store custom deployment', ctr, custom_contract_str);
    const curr = importedCustomContracts(chain_id);
    if (curr[ctr.toLowerCase()]) {
        // already there
        console.log('contract ', ctr, 'already stored');
        return true;
    }
    let current = window.localStorage.getItem('ctr-'+chain_id);
    if (!current) {
        current = '';
    } else if (current && current != '') {
        current = current + ','; 
    }
    window.localStorage.setItem('ctr-'+chain_id, current + custom_contract_str);
}

const importedCustomContracts = function (chain_id) {
    const current = window.localStorage.getItem('ctr-'+chain_id);
    let ret = {};
    if (current) {
        const items = current.split(',');
        for(let i=0; i<items.length; i++) {
            const bits = items[i].split('|');
            const ctr = bits[0].toLowerCase();

            // was persisted with:
            // [q.realityETH, q.factory, q.createdBlock, q.token_address, q.token_symbol, q.token_decimals].join('|'~
            const cfg = {
                'factory': bits[1],
                'createdBlock': bits[2],
                'token_address': bits[3],
                'token_symbol': bits[4],
                'token_decimals': bits[5]
            }
            ret[ctr] = cfg;
        }
    }
    return ret;
}

export { storeCustomContract, importedCustomContracts }
