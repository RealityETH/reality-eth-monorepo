/*
Add new lines to the abi file for more meaningful version control
*/

const fs = require('fs');

const project_base = __dirname + '/../';
const chains_file = 'chains/chainid.network.json';
const chains_local_file = 'chains/chainid.network.local.json';
const supported_file = 'chains/supported.json';
const generated_file = 'generated/chains.json';

const chain_id_list = require(project_base + chains_file);
const chain_id_list_local = require(project_base + chains_local_file);
const supported_data = require(project_base + supported_file);

for(var cl = 0; cl<chain_id_list_local.length; cl++) {
    chain_id_list.push(chain_id_list_local[cl]);
}

let out = {};
for (var ci = 0; ci< chain_id_list.length; ci++) {
    let chainparams = {};
    const chain_info = chain_id_list[ci];
    const chainId = chain_info.chainId;
    const our_data = supported_data[chainId+""];
    if (!our_data) {
        // Not a supported chain, skip it
        continue;
    }

    chainparams = {};
    chainparams['chainId'] = "0x"+Number(chainId).toString(16),
    chainparams['chainName'] = chain_info.name;
    chainparams['nativeCurrency'] = chain_info.nativeCurrency;
    chainparams['network_name'] = chain_info.network;

    let rpc = [];
    if (chain_info.rpc) {
        for (var r in chain_info.rpc) {
            var thisr = chain_info.rpc[r];
            if (thisr.indexOf('INFURA_API_KEY') !== -1) {
                continue;
            }
            if (thisr.indexOf('ALCHEMY_API_KEY') !== -1) {
                continue;
            }
            rpc.push(thisr);
        }
    }
    chainparams['rpcUrls'] = rpc;

    if (!our_data['hostedRPC'] && rpc.length > 0) {
        our_data['hostedRPC'] = rpc[0];
    }
    if (our_data['hostedRPC']) {
        chainparams['hostedRPC'] = our_data['hostedRPC'];
    }

    if (our_data['iconURL']) {
        chainparams['iconUrls'] = [our_data['iconURL']];
    } 

    if (our_data['graphURL']) {
        chainparams['graphURL'] = our_data['graphURL'];
    }

    // Sometimes this is "mainnet" and we have to override it, there's "shortname" but that doesn't seem quite right either
    if (our_data['network_name']) {
        chainparams['network_name'] = our_data['network_name'];
    }

    chainparams['blockExplorerUrls'] = [];
    if ('explorers' in chain_info) {
        for(var exi in chain_info['explorers']) {
            var ex = chain_info['explorers'][exi];
            chainparams['blockExplorerUrls'].push(ex['url']);
        }
    }
    if (our_data['explorerURL']) {
        if (chainparams['blockExplorerUrls'].indexOf(our_data['explorerURL']) === -1) {
            chainparams['blockExplorerUrls'].push(our_data['explorerURL']);
        }
    }

    out[chainId.toString()] = chainparams;
}

fs.writeFileSync(project_base + generated_file, JSON.stringify(out, null, 4));
