if (process.argv.length < 3) {
    throw new Error("Usage: node add_chain_token.js <chain_id> <chain_name> [<token_ticker>] [<token_address_or_native>] [<small_amount_of_token>]");
}

const project_base = __dirname + '/../';

const fs = require('fs');

const chain_id = process.argv[2];

// These may be empty
const chain_name = process.argv[3];
const token_ticker = process.argv[4];
const token_address = process.argv[5];
const small_number = process.argv[6];

console.log('chain id is', chain_id);

const supported_file = 'chains/supported.json'

const chains_file = 'chains/chainid.network.json';
const chains_local_file = 'chains/chainid.network.local.json';

const chain_id_list = require(project_base + chains_file);
const chain_id_list_local = require(project_base + chains_local_file);

let supported_data = require(project_base + supported_file);

for(var cl = 0; cl<chain_id_list_local.length; cl++) {
    chain_id_list.push(chain_id_list_local[cl]);
}

let found = false;
for(var cl = 0; cl<chain_id_list.length; cl++) {
    if (chain_id == chain_id_list[cl].chainId) {
        found = true;
        break;
    }
}

if (!found) {
    throw new Error("The chain ID "+chain_id+" was not found in the chainid list. Run node fetch_and_reformat_chains_json.js to update the list, or add your settings to chainid.network.local.json.");
}
if (""+chain_id in supported_data) {
    console.log('Using existing config for chain '+chain_id);
    console.log(supported_data[""+chain_id]);
} else {
    console.log('Creating new supported entry for chain '+chain_id);
    supported_data[""+chain_id] = {"network_name": chain_name};
}

const out = JSON.stringify(supported_data, null, 4);
fs.writeFileSync(project_base+supported_file, out);

if (token_ticker != '') {

    let token_config = {};
    const token_file = project_base + 'tokens/' + token_ticker + '.json';
    try {
        token_config = JSON.parse(fs.readFileSync(token_file));
        console.log(token_config);
    } catch (e) {
        token_config = {
            "decimals": 18,
            "small_number": small_number ? small_number : 10000000000000000
        }
    }
    if (token_address == 'native') {
        token_config['native_chains'] = 'native_chains' in token_config ? token_config['native_chains'] : {};
        token_config['native_chains'][""+chain_id] = true;
    } else {
        token_config['erc20_chains'] = 'erc20_chains' in token_config ? token_config['erc20_chains'] : {};
        token_config['erc20_chains'][""+chain_id] = token_address;
    }

    console.log(token_config);

    const out2 = JSON.stringify(token_config, null, 4);
    fs.writeFileSync(token_file, out2);

}
