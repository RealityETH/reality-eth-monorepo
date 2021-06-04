const nativeTokens = { 
    "1": "ETH",
    "3": "ETH",
    "4": "ETH",
    "5": "ETH",
    "42": "ETH",
    "56": "BNB",
    "77": "XDAI",
    "100": "XDAI"
}

function realityETHInstance(network_id, token, version) {
    const config = realityETHInstance(network_id, token, version);
    const contract_version = config.contract_version
    const abi = JSON.parse(fs.readFileSync('./abi/solc-0.4.25/'+contract_version+'.abi'));
    const bytecode = fs.readFileSync('./bytecode/'+contract_version+'.bin', 'utf8').replace(/\n/, '');
    return {
        "abi": abi,
        "contractName": contract_name,
        "bytecode": bytecode,
        "address": config.address
    };
    
}

function realityETHConfig(network_id, token, version) {
    const versions = ['2.1', '2.0'];
    const is_erc20 = token == nativeTokens[network_id+""];
    const contract_name = is_erc20 ? 'RealityETH_ERC20' : 'RealityETH';
    // If no version specified, crawl for the latest
    if (version == null) {
        for (let i=0; i<versions.length; i++) {
            version = versions[i];
            if (fs.existsSync(configf)) {
                break;
            }
        }
    }
    const configf = './networks/'+network_id+'/'+token+'/'+contract_name+'-'+version+'.json'; 
    const config = JSON.parse(fs.readFileSync(configf));
    config.version_number = version;
    config.contract_name = contract_name;
    config.contract_version = contract_name + '-' + contract_version;
}

module.exports.RealityETHConfig = realityETHConfig;
module.exports.RealityETHInstance = realityETHInstance;
