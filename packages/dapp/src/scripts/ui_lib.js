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

const importFactoryConfig = async function(contract_addrs, chain_id, only_one) {

    const contract_str = JSON.stringify(contract_addrs);
    const where = `{realityETH_in: ${contract_str} }`;

    // console.log('CHAIN_INFO', CHAIN_INFO);
    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        console.log('No graph endpoint found for this network, skipping graph fetch');
        return false;
    }

    const query = `
      {
        factoryDeployments(first:10, where: ${where}) {
            id,
            token_address,
            token_symbol,
            token_decimals,
            factory,
            realityETH,
            createdBlock,
            createdTimestamp
        }
      }  
      `;

    const res = await axios.post(network_graph_url, {query: query});
     console.log('custom token graph res', contract_addrs, query, res, res.data);
    let custom_tokens = {};
    for (const q of res.data.data.factoryDeployments) {

        if (!q.token_symbol.match(/^[0-9a-z]+$/i)) {
            console.log('Refusing to display token with non-alphanumeric symbol', q.token_symbol);
            continue;
        }

        custom_tokens[q.id] = rc_contracts.tokenAndContractConfigFromFactory(q, chain_id); 

        // Keep the raw factory data too as this is what we save in local storage to avoid needing to do this query in future
        custom_tokens[q.id].factory_data = [q.realityETH, q.factory, q.createdBlock, q.token_address, q.token_symbol, q.token_decimals]

        if (only_one) {
            return custom_tokens[q.id];
        }
    }
    return custom_tokens;

}

export { storeCustomContract, importedCustomContracts, importFactoryConfig }
