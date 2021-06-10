const fs = require('fs');
const all_config = require('./generated/contracts.json');
const token_info = require('./generated/tokens.json');
const chain_info = require('./generated/chains.json');
const template_config = require('./config/templates.json');

function realityETHInstance(config) {
    const contract_version = config.contract_version
    //const abi = JSON.parse(fs.readFileSync('./abi/solc-0.4.25/'+contract_version+'.abi'));
    //const abi = require('./abi/solc-0.4.25/'+contract_version+'.abi');
    const abi = require('./abi/solc-0.4.25/RealityETH-all.abi.json');
    //const bytecode = fs.readFileSync('./bytecode/'+contract_version+'.bin', 'utf8').replace(/\n/, '');
//    const bytecode = require('./bytecode/'+contract_version+'.bin');
    return {
        "abi": abi,
        "contractName": config.contract_name,
        //"bytecode": bytecode,
        "address": config.address,
        "network_id": config.network_id
    };
    
}

// TODO: Rename to clarify that there's no address
function arbitratorInstance(network_id) {
    const abi = require('./abi/solc-0.4.25/Arbitrator.abi.json');
    return {
        "abi": abi,
        "contractName": 'Arbitrator',
        "network_id": network_id
    };
}

function erc20Instance(config) {
    const abi = require('./abi/solc-0.4.25/ERC20.abi.json');
    if (!config.token_address) {
        console.log('config', config);
        throw new Error("token address for erc20 instance not found");
        return null;
    }
    return {
        "abi": abi,
        "contractName": 'ERC20',
        "address": config.token_address,
        "network_id": config.network_id
    };
}

function networkTokenInfo(network_id) {
    let ret = {};
    for (t in token_info) {
        if (all_config[""+network_id][t]) {
            ret[t] = token_info[t];
            ret[t].is_native = (token_info[t].native_networks && token_info[t].native_networks[""+network_id]);
        }
    }
    return ret;
}

function realityETHConfig(network_id, token, version) {
    const versions = ['2.1', '2.1-rc1', '2.0'];
    const token_info = networkTokenInfo(network_id);
    if (!token_info[token]) {
        console.log("Token not found for network");
        return null;
        //throw new Error("Token not found for network");
    }
    const contract_name = token_info[token].is_native ? 'RealityETH' : 'RealityETH_ERC20';
    // If no version specified, crawl for the latest
    if (version == null) {
        for (let i=0; i<versions.length; i++) {
            if (all_config[""+network_id][token][contract_name + '-' + versions[i]]) {
                version = versions[i];
                break;
            }
        }
        if (!version) {
            throw new Error("Could not find any version for "+network_id + "/" + token + "/" + contract_name);
        } 
    }
    //const configf = './networks/'+network_id+'/'+token+'/'+contract_name+'-'+version+'.json';
    const contract_version = contract_name + '-' + version;
    const config = all_config[""+network_id][token][contract_version];
    if (!config) {
        console.log("Could not find config for "+network_id + "/" + token + "/" + contract_version);
        return null;
        //throw new Error("Could not find config for "+network_id + "/" + token + "/" + contract_version);
    }
    if (!config.arbitrators) {
        config.arbitrators = [];
    }
    config.version_number = version;
    config.network_id = network_id;
    config.contract_name = contract_name;
    config.contract_version = contract_version;
    return config;
}

function networkData(network_id) {
    return chain_info[""+network_id];
}

function walletAddParameters(network_id) {
    var params = ['chainId', 'chainName', 'nativeCurrency', 'rpcUrls', 'blockExplorerUrls']
    var ret = {};
console.log('looking for config for network ', network_id);
    var config = chain_info[""+network_id];
    for (var i=0; i<params.length; i++) {
        var item = params[i];
        ret[item] = config[item];
    }
    return ret; 
}

function templateConfig() {
    return template_config;
}

function defaultTokenForNetwork(network_id) {
    // Use the native token if we have one
    // If not, use the first one
    const config = all_config[""+network_id];
console.log('config', config);
    var ret = null;
    for (var token in config) {
console.log('token', token);
        var token_info = networkTokenInfo(network_id);
        if (!token_info) {
            continue;
        }
        if (token_info.is_native) {
            return token;
        }
        if (!ret) {
            ret = token;
        }
    }
    return ret;
}

module.exports.realityETHConfig = realityETHConfig;
module.exports.realityETHInstance = realityETHInstance;
module.exports.arbitratorInstance = arbitratorInstance;
module.exports.erc20Instance = erc20Instance;
module.exports.networkTokenInfo = networkTokenInfo;
module.exports.networkData = networkData;
module.exports.walletAddParameters = walletAddParameters;
module.exports.templateConfig = templateConfig;
module.exports.defaultTokenForNetwork = defaultTokenForNetwork;
