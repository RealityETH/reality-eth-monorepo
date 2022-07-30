const fs = require('fs-extra');
const mustache = require('mustache');
const rc_contracts = require('@reality.eth/contracts');

const net_id = process.argv[2];
//console.log('net_id', net_id);

const net_config = rc_contracts.chainData(net_id);
const network = net_config.network_name;

const token_list = rc_contracts.chainTokenList(net_id)
const factory_list = rc_contracts.factoryList(net_id)

const template = fs.readFileSync('subgraph.template.yaml').toString();
const ds_template = fs.readFileSync('subgraph.datasource.template.yaml').toString();
const factory_template = fs.readFileSync('subgraph.factory.template.yaml').toString();
const template_template = fs.readFileSync('subgraph.template.template.yaml').toString();

let dses = [];

for(var token in token_list) {
    const configs = rc_contracts.realityETHConfigs(net_id, token);
    for (var config_addr in configs) {
        const config = configs[config_addr];
        if ('factory_address' in config && config.factory_address) {
            // console.log('skipping config that was deployed by a factory')
            continue;
        }
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

let facs = [];

let found = false;
for(var ver in factory_list) {
    const f = factory_list[ver];
    const fData = {
        "network": network,
        "address": f.address,
        "block": f.block,
        "contract-name-with-version": ver
    }
    const f_section = mustache.render(factory_template, fData);
    facs.push(f_section);
    found = true;
}

let templates = [];
if (found) {
    const tData = {
        "network": network
    }
    const t_section = mustache.render(template_template, tData);
    templates.push(t_section);
}

const templateData = {
    "datasources": dses.join("\n"),
    "factories": facs.join("\n"),
    "templates": templates.join("\n")
}

fs.writeFileSync(
    'subgraph.yaml', 
    mustache.render(template, templateData)
);
