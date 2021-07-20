const fs = require('fs-extra');
const mustache = require('mustache');
const rc_contracts = require('@reality.eth/contracts');

const net_id = process.argv[2];
//console.log('net_id', net_id);

const net_config = rc_contracts.chainData(net_id);
const network = net_config.network_name;

const token_list = rc_contracts.chainTokenList(net_id)

const template = fs.readFileSync('subgraph.template.yaml').toString();
const ds_template = fs.readFileSync('subgraph.datasource.template.yaml').toString();

let dses = [];

for(var token in token_list) {
    const configs = rc_contracts.realityETHConfigs(net_id, token);
    for (var config_addr in configs) {
        const config = configs[config_addr];
        const dsData = {
            "network": network,
            "address": config.address,
            "block": config.block,
            "token": token,
            "contract-name-with-version": config.contract_version
        }
        const ds_section = mustache.render(ds_template, dsData);
        dses.push(ds_section);
    }
}

const templateData = {
    "datasources": dses.join("\n")
}

fs.writeFileSync(
    'subgraph.yaml', 
    mustache.render(template, templateData)
);
