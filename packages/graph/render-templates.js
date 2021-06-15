const fs = require('fs-extra');
const mustache = require('mustache');
const rc_contracts = require('@reality.eth/contracts');

const net_id = process.argv[2];
//console.log('net_id', net_id);
const config = rc_contracts.realityETHConfig(net_id, 'ETH');
//console.log('config', config);

const net_config = rc_contracts.networkData(net_id);
const network = net_config.network_name;

const templateData = {
    "network": network,
    "address": config.address,
    "block": config.block
}

const template = fs.readFileSync('subgraph.template.yaml').toString();
fs.writeFileSync(
    'subgraph.yaml', 
    mustache.render(template, templateData),
);
