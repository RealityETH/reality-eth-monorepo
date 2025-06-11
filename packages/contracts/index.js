let all_config = require('./generated/contracts.json');
let token_info = require('./generated/tokens.json');
const chain_info = require('./generated/chains.json');
const factory_config = require('./generated/factories.json');

function populateImports(imported_contracts, chain_id) {
    for(var ctr in imported_contracts) {
        let to_imp = imported_contracts[ctr];
        to_imp.realityETH= ctr; 
        const imp = tokenAndContractConfigFromFactory(to_imp, chain_id); 
        const token = imp.token.ticker;
        if (!all_config[chain_id][token]) {
            all_config[chain_id][token] = {};
        }
        const ver = imp.contract.version_number;
        all_config[chain_id][token][ver] = imp.contract;

        if (!token_info[token]) {
            token_info[token] = imp.token;
        }
    }
}

function realityETHInstance(config) {
    const abis = {
        'RealityETH-2.0': require('./abi/solc-0.8.6/RealityETH-2.0.abi.json'), 
        'RealityETH-2.1': require('./abi/solc-0.8.6/RealityETH-2.1.abi.json'),
        'RealityETH-2.1-rc1': require('./abi/solc-0.8.6/RealityETH-2.1.abi.json'),
        'RealityETH-3.0': require('./abi/solc-0.8.6/RealityETH-3.0.abi.json'),
        'RealityETH-3.2': require('./abi/solc-0.8.6/RealityETH-3.2.abi.json'),
        'RealityETH_ERC20-2.0': require('./abi/solc-0.8.6/RealityETH_ERC20-2.0.abi.json'),
        'RealityETH_ERC20-3.0': require('./abi/solc-0.8.6/RealityETH_ERC20-3.0.abi.json'),
        'RealityETH_ERC20-3.2': require('./abi/solc-0.8.6/RealityETH_ERC20-3.2.abi.json')
    }
    return {
        "abi": abis[config.contract_version],
        "contractName": config.contract_name,
        //"bytecode": bytecode,
        "address": config.address,
        "chain_id": config.chain_id
    };
    
}

// TODO: Rename to clarify that there's no address
function arbitratorInstance(chain_id) {
    const abi = require('./abi/solc-0.4.25/Arbitrator.abi.json');
    return {
        "abi": abi,
        "contractName": 'Arbitrator',
        "chain_id": chain_id
    };
}

function erc20Instance(config) {
    const abi = require('./abi/solc-0.4.25/ERC20.abi.json');
    if (!config.token_address) {
        // console.log('config', config);
        throw new Error("token address for erc20 instance not found");
        return null;
    }
    return {
        "abi": abi,
        "contractName": 'ERC20',
        "address": config.token_address,
        "chain_id": config.chain_id
    };
}

function chainTokenList(chain_id) {
    let ret = {};
    for (t in token_info) {
        if (all_config[""+chain_id] && all_config[""+chain_id][t]) {
            ret[t] = token_info[t];
            ret[t].is_native = (token_info[t].native_chains && token_info[t].native_chains[""+chain_id]);
        }
    }
    return ret;
}

function tokenConfig(token, chain_id) {
    const t = token_info[token];
    if (!t) {
        console.log('token not found in token_info');
        return null;
    }
    if (t.native_chains && t.native_chains[chain_id+""]) {
        t.is_native = true;
        return t;
    }
    if (t.erc20_chains && t.erc20_chains[chain_id+""]) {
        t.address = t.erc20_chains[chain_id+""];
        t.is_native = false;
        return t;
    }
    console.log("Token config not found for chain");
    return null;
}

function realityETHConfig(chain_id, token, version) {
    const versions = ['3.0', '3.2', '2.1', '2.1-rc1', '2.0'];
    const token_info = chainTokenList(chain_id);
    if (!token_info[token]) {
        console.log("Token not found for chain");
        return null;
        //throw new Error("Token not found for chain");
    }
    const contract_name = token_info[token].is_native ? 'RealityETH' : 'RealityETH_ERC20';
    // If no version specified, crawl for the latest
    if (version == null) {
        for (let i=0; i<versions.length; i++) {
            if (all_config[""+chain_id][token][contract_name + '-' + versions[i]]) {
                version = versions[i];
                break;
            }
        }
        if (!version) {
            throw new Error("Could not find any version for "+chain_id + "/" + token + "/" + contract_name);
        } 
    }
    //const configf = './networks/'+chain_id+'/'+token+'/'+contract_name+'-'+version+'.json';
    const contract_version = contract_name + '-' + version;
    const config = all_config[""+chain_id][token][contract_version];
    if (!config) {
        console.log("Could not find config for "+chain_id + "/" + token + "/" + contract_version);
        return null;
        //throw new Error("Could not find config for "+chain_id + "/" + token + "/" + contract_version);
    }
    if (!config.arbitrators) {
        config.arbitrators = [];
    }
    config.version_number = version;
    config.chain_id = chain_id;
    config.contract_name = contract_name;
    config.contract_version = contract_version;
    config.token_ticker = token;
    return config;
}

function realityETHConfigs(chain_id, token) {
    let configs = {};
    const versions = ['3.2', '3.0', '2.1', '2.1-rc1', '2.0'];
    const token_info = chainTokenList(chain_id);
    if (!token_info[token]) {
        console.log("Token not found for network");
        return null;
        //throw new Error("Token not found for network");
    }
    const contract_name = token_info[token].is_native ? 'RealityETH' : 'RealityETH_ERC20';
    // If no version specified, crawl for the latest
    let is_latest_found = false;
    for (let i=0; i<versions.length; i++) {
        if (all_config[""+chain_id][token][contract_name + '-' + versions[i]]) {
            const version = versions[i];
            //const configf = './networks/'+network_id+'/'+token+'/'+contract_name+'-'+version+'.json';
            const contract_version = contract_name + '-' + version;
            const config = all_config[""+chain_id][token][contract_version];
            if (!config) {
                console.log("Could not find config for "+chain_id+ "/" + token + "/" + contract_version);
                return null;
                //throw new Error("Could not find config for "+network_id + "/" + token + "/" + contract_version);
            }
            if (!config.arbitrators) {
                config.arbitrators = [];
            }
            config.version_number = version;
            config.chain_id = chain_id;
            config.contract_name = contract_name;
            config.contract_version = contract_version;
            config.is_latest = !is_latest_found;
            configs[config.address] = config;
            is_latest_found = true;
        }
    }
    return configs;
}

function chainData(chain_id) {
    return chain_info[""+chain_id];
}

function isChainSupported(chain_id) {
    return (""+chain_id in chain_info);
}

function supportedChains(include_deprecated = false) {
    let ret = {};
    for (chain_id in chain_info) {
        if (include_deprecated || !chain_info[""+chain_id].deprecated) {
            ret[""+chain_id] = chain_info[""+chain_id].chainName;
        }
    }
    return ret;
}

function walletAddParameters(chain_id) {
    var params = ['chainId', 'chainName', 'nativeCurrency', 'rpcUrls', 'blockExplorerUrls']
    var ret = {};
    // console.log('looking for config for chain', chain_id);
    var config = chain_info[""+chain_id];
    for (var i=0; i<params.length; i++) {
        var item = params[i];
        ret[item] = config[item];
    }
    return ret; 
}

function templateConfig(vernum) {
    const old_templates = require('./config/templates.json');
    const new_templates = require('./config/templates_3.2.json'); // This is also backported to 2.2
    if (vernum == 2.2 || vernum < 3.2) {
        return old_templates;
    } else {
        return new_templates;
    }
}

function defaultTemplateIDForType(template_type, vernum) {
    const tc = templateConfig(vernum);
    return tc.base_ids[template_type];
}

function defaultTokenForChain(chain_id) {
    // Use the native token if we have one
    // If not, use the first one
    const config = all_config[""+chain_id];
    var ret = null;
    for (var token in config) {
        var token_info = chainTokenList(chain_id);
        if (!token_info) {
            continue;
        }
        if (token_info[token].is_native) {
            return token;
        }
        if (!ret) {
            ret = token;
        }
    }
    return ret;
}

function versionHasFeature(vernum, feature_name) {
    vernum = ""+vernum;
    if (feature_name == 'min-bond' || feature_name == 'reopen-question') {
        const min_maj = 3;
        const bits = vernum.split('.');
        const maj = parseInt(bits[0]);
        return (maj >= min_maj);
    } else if (feature_name == 'description' || feature_name == 'hash-type') {
        const min_min = 2;
        const bits = vernum.split('.');
        const min = parseInt(bits[1]);
        return (min >= min_min);
    } else if (feature_name == 'category') {
        const min_min = 2;
        const bits = vernum.split('.');
        const min = parseInt(bits[1]);
        return (min < min_min);
    } else {
        throw new Error('Feature not known: '+feature_name);
    }
}

function factoryConfigForAddress(address, chain_id) {

    for(var cid in factory_config) {
        if (chain_id && cid != chain_id) {
            continue;
        }
        for(var ver in factory_config[cid]) {
            const config = factory_config[cid][ver];
            if (address.toLowerCase() == config.address.toLowerCase()) {
                return config;
            }
        }
    }
    return null;

}

function configForAddress(addr, chain_id) {
    for(var cid in all_config) {
        if (chain_id && cid != chain_id) {
            continue;
        }
        for(var ticker in all_config[cid]) {
            for(var ver in all_config[cid][ticker]) {
                const config = all_config[cid][ticker][ver];
                if (addr.toLowerCase() == config.address.toLowerCase()) {
                    if (!config.arbitrators) {
                        config.arbitrators = [];
                    }
                    const [contract_name, version_number] = ver.split('-');
                    config.version_number = version_number;
                    config.chain_id = cid;
                    config.contract_name = contract_name;
                    config.contract_version = ver;
                    config.token_ticker = ticker;
                    return config;
                }
            }
        }
    }
    return null;

}

function factoryList(chain_id) {
    if (!factory_config[chain_id]) {
        return {};
    }
    return factory_config[chain_id];
}

function tokenAndContractConfigFromFactory(factory_data, chain_id) {
    // Get the library for the factory
    const factory_config = factoryConfigForAddress(factory_data.factory, chain_id);

    const template_orig = configForAddress(factory_config.library_address, chain_id);
    let template = {};
    for (let k in template_orig) {
      template[k] = template_orig[k];
    }

    if (!template) {
        console.log('no template found for', factory_data, factory_config, chain_id);
        return null;
    }

    template.address = factory_data.realityETH;
    template.block = parseInt(factory_data.createdBlock);
    template.token_address = factory_data.token_address;
    template.token_ticker = factory_data.token_symbol;

    const erc20_chains_val = {};
    erc20_chains_val[chain_id] = factory_data.token_address;

    return {
        'token': {
            'ticker': factory_data.token_symbol,
            'decimals': factory_data.token_decimals,
            'is_native': false,
            'small_number': 1000000000000000000,
            'erc20_chains': erc20_chains_val
        },
        'contract': template
    }
        
}

// An identifier for reality.eth use where we need a number for a chain...
// ...but we don't have enough bits to use the normal Chain ID
// This is intended for when we abuse atproto TIDs to make a unique rkey per question
// The Chain ID will go in the "clock identifier" field which is only 10 bits
// https://atproto.com/ja/specs/tid
function realityETH10BitChainID(chain_id) {
    // For any chain ID below 512 we'll use the chain ID as is
    if (chain_id < 512) {
        return chain_id;
    }
    // Above that we'll assign them manually starting at the max
    // We'll only assign them if we need them, ie if we're making rkeys for that chain
    const assigned_manually = {
        "11155111": 1023
    }
    return assigned_manually[""+chain_id];
}

function atProtoBotDid(chain_id) {
    if (chain_info[""+chain_id] && chain_info[""+chain_id]['atprotoBot']) {
        return chain_info[""+chain_id]['atprotoBot']
    }
    return null;
}

function getChainLabel(chain_id) {
    const c = chain_info[chain_id];
    if (!c) {
        return null;
    }
    return c['chainName'];
}

module.exports.realityETHConfig = realityETHConfig;
module.exports.realityETHConfigs = realityETHConfigs;
module.exports.realityETHInstance = realityETHInstance;
module.exports.arbitratorInstance = arbitratorInstance;
module.exports.erc20Instance = erc20Instance;
module.exports.chainTokenList = chainTokenList;
module.exports.tokenConfig = tokenConfig
module.exports.chainData = chainData;
module.exports.walletAddParameters = walletAddParameters;
module.exports.templateConfig = templateConfig;
module.exports.defaultTemplateIDForType = defaultTemplateIDForType;
module.exports.defaultTokenForChain = defaultTokenForChain;
module.exports.versionHasFeature = versionHasFeature;
module.exports.isChainSupported = isChainSupported;
module.exports.supportedChains = supportedChains;
module.exports.factoryList = factoryList;
module.exports.tokenAndContractConfigFromFactory = tokenAndContractConfigFromFactory;
module.exports.configForAddress = configForAddress;
module.exports.populateImports = populateImports;
module.exports.getChainLabel = getChainLabel;
module.exports.realityETH10BitChainID = realityETH10BitChainID;
module.exports.atProtoBotDid = atProtoBotDid;
