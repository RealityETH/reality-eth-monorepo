const fs = require('fs');
const ethers = require('ethers');
const project_base = './../';
const build_dir = './../truffle/build/contracts/';
const rc = require('../index.js');
const { join } = require('path');
const chain_configs = require('./../generated/chains.json');

let secrets_dir = join(__dirname, '../secrets');
if (process.env.SECRETS) {
    secrets_dir = process.env.SECRETS;
}

const deployed_at = null;
// const deployed_at = '0x33aa365a53a4c9ba777fb5f450901a8eef73f0a9'; //mainnet gno
// const deployed_at = '0xc79e58D0a23ea0eDBDD2dBc96d16e65f696BfFc8'; // rinkeby test

var undef;

const defaultConfigs = {
    //maxFeePerGas:         610000000000,
    //maxPriorityFeePerGas:  10000000000,
    //gasPrice: 70000000000,
    //gasPrice:   10000000000,
    // gasPrice:   100000000,
    // gasPrice: 10000, // optimism 1000000,
    /// gasPrice: 5000000000,
    //gasLimit: 6000000, // optimism 4500000
    gasLimit: 4500000,
    //etherscanApiKey: 'TPA4BFDDIH8Q7YBQ4JMGN6WDDRRPAV6G34'
    //gasLimit: 155734867 // arbitrum
    //gasLimit: 7000000
    //gasLimit:   800035294
    // gasLimit: 4291955938
}
const task = process.argv[2]
const version = process.argv[3]
const chain = process.argv[4]
const token_name = process.argv[5]
var arb_fee = process.argv[6]
var arbitrator_owner = process.argv[7]

var contract_type;

const chains = {
    'mainnet': 1,
    'ropsten': 3,
    'rinkeby': 4,
    'goerli': 5,
    'ubiq': 8,
    'optimism': 10,
    'telosevm': 40,
    'kovan': 42,
    'bsc': 56,
    'chapel': 97,
    'sokol': 77,
    'cheapeth': 777,
    'gnosis': 100,
    'scroll-alpha-testnet': 534353,
    'polygon': 137,
    'polygon-zkevm': 1101,
    'holesky': 17000,
    'mumbai': 80001,
    'ava': 43114,
    'arbitrum': 42161,
    'arbitrum-rinkeby': 421611,
    'arbitrum-goerli': 421613,
    'arbitrum-sepolia': 421614,
    'kovan-optimistic': 69,
    'kintsugi': 1337702,
    'sepolia': 11155111,
    'backstopTestnet1': 88558801
}
const non_infura_chains = {
    'gnosis': 'https://gnosis.oat.farm',
    'scroll-alpha-testnet': 'https://alpha-rpc.scroll.io/l2',
    'sokol': 'https://sokol.poa.network',
    'bsc': 'https://bsc-dataseed.binance.org',
    'chapel': 'https://bsc-testnet.public.blastapi.io',
    'polygon': 'https://rpc-mainnet.maticvigil.com',
    'polygon-zkevm': 'https://zkevm-rpc.com',
    'ava': 'https://api.avax.network/ext/bc/C/rpc',
    'arbitrum': 'https://arb1.arbitrum.io/rpc',
    'arbitrum-rinkeby': 'https://rinkeby.arbitrum.io/rpc',
    'arbitrum-goerli': 'https://goerli-rollup.arbitrum.io/rpc',
    'arbitrum-sepolia': 'https://sepolia-rollup.arbitrum.io/rpc',
    'ubiq': 'https://rpc.octano.dev',
    'cheapeth': 'https://node.cheapeth.org/rpc',
    'kovan-optimistic': 'https://kovan.optimism.io',
    'optimism': 'https://mainnet.optimism.io',
    'kintsugi': 'https://rpc.kintsugi.themerge.dev',
    'mumbai': 'https://matic-mumbai.chainstacklabs.com',
    'sepolia': 'https://sepolia.backstop.technology/', // 'https://rpc.sepolia.org',
    'holesky': 'https://ethereum-holesky.publicnode.com',
    'telosevm': 'https://mainnet.telos.net/evm',
    'unichain': 'https://mainnet.unichain.org',
    'base': 'https://mainnet.base.org',
    'backstopTestnet1': 'https://testnet.rpc.backstop.technology'
}

function constructContractTemplate(contract_name) {
    let abi; 
    try {
        abi = JSON.parse(fs.readFileSync(project_base + '/abi/solc-0.4.25/'+contract_name+'.abi.json'));
    } catch(e) {
        try {
            abi = JSON.parse(fs.readFileSync(project_base + '/abi/solc-0.8.6/'+contract_name+'.abi.json'));
        } catch(e) {
            abi = JSON.parse(fs.readFileSync(project_base + '/abi/solc-0.8.10/'+contract_name+'.abi.json'));
        }
    }
    const bytecode = fs.readFileSync(project_base + '/bytecode/'+contract_name+'.bin', 'utf8').replace(/\n/, ''); 
    //console.log('bytecode', bytecode);
    return {
        "abi": abi,
        "contractName": contract_name,
        "bytecode": bytecode
    };
}

function usage_error(msg) {
    msg = msg + "\n";
    msg += "Usage: node deploy.js <RealityETH|Arbitrator|ERC20|Factory> <version> <chain_name> <token_name> [<dispute_fee>] [<arbitrator_owner>]";
    throw msg;
}


const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string)

let chain_id;
// Predefined chains (old method)
if (chain in chains) {
    chain_id = chains[chain];
// Get the chain from the chain config
} else {
    for (const c in chain_configs) {
        const cn = chain_configs[c].chainName.toLowerCase().replace(' ', '-');
        if (cn == chain) {
            chain_id = c;
            break;
        }
        if (chain_configs[c].network_name) {
            const cn2 = chain_configs[c].network_name.toLowerCase();
            if (cn2 == chain) {
                chain_id = c;
                break;
            }
        }
    }
}

if (!chain_id) {
    usage_error("Network unknown");
}

if (token_name == undef) {
    usage_error("token_name not supplied");
}

var token_address;

const token_info = rc.tokenConfig(token_name, chain_id);
if (!token_info) {
    usage_error("token not found, please configure it first");
}

console.log('token', token_info);
if (isERC20()) {
    token_address = token_info.address; 
}

if (arb_fee == undef) {
    arb_fee = "0xde0b6b3a76400000";
}

if (arbitrator_owner == undef) {
    arbitrator_owner = "0xdd8a989e5e89ad23ed2f91c6f106aea678a1a3d0";
}

const priv = fs.readFileSync(secrets_dir + '/' + chain + '.sec', 'utf8').replace(/\n/, '')

ensure_chain_directory_exists(chain_id, token_name);

if (task == 'RealityETH') {
    deployRealityETH();
} else if (task == 'Arbitrator') {
    deployArbitrator();
} else if (task == 'ERC20') {
    deployERC20();
} else if (task == 'Factory') {
    deployFactory();
}

function ensure_chain_directory_exists(chain, token) {
    const dir = project_base + '/chains/deployments/' + chain+ '/' + token;    
    if (!fs.existsSync(dir)) {
        console.log('creating directory for token', chain, token, dir);
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
    const dir2 = project_base + '/chains/factories/' + chain;
    if (!fs.existsSync(dir2)) {
        console.log('creating directory for factories', chain, dir);
        fs.mkdirSync(dir2, {
            recursive: true
        });
    }
    return true;
}

function store_deployed_contract(template, chain_id, token_name, out_json) {
    const file = project_base + '/chains/deployments/' + chain_id + '/' + token_name + '/' + template + '.json';
    fs.writeFileSync(file, JSON.stringify(out_json, null, 4));
    console.log('wrote file', file);
}

function store_deployed_factory_contract(template, chain_id, out_json) {
    const file = project_base + '/chains/factories/' + chain_id + '/' + template + '.json';
    fs.writeFileSync(file, JSON.stringify(out_json, null, 4));
    console.log('wrote file', file);
}

function chain_config_for_name(chain_name) {
    for (cc in chain_configs) {
        
    }
}

function provider_for_chain() {
    if (non_infura_chains[chain]) {
        console.log('Using chain', non_infura_chains[chain]);
        return new ethers.providers.JsonRpcProvider(non_infura_chains[chain]);
    } else {
        if (chains[chain]) {
            console.log('Using infura on chain', chain);
            return new ethers.providers.InfuraProvider(chain);
        } else {
            const chain_config = chain_configs[chain_id];
            const hostedRPC = chain_config.hostedRPC;
            console.log('Using RPC', hostedRPC);
            return new ethers.providers.JsonRpcProvider(chain_config.hostedRPC);
        } 
    }
}

function isERC20() {
    return (!token_info.is_native);
}

function realityETHName() {
    let tmpl = isERC20() ? 'RealityETH_ERC20' : 'RealityETH';
    tmpl = tmpl + '-' + version;
    return tmpl;
}

async function waitForGas(provider) {
    if (!defaultConfigs.maxFeePerGas) {
        return true;
    }
    // console.log('in waitForGas');
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    const f = await provider.getFeeData()
     console.log('fee', f)
throw new Error();
return;
    if (f.gasPrice.gt(ethers.BigNumber.from(defaultConfigs.maxFeePerGas))) {
        console.log('Gas is too expensive, got', f.gasPrice.toString(), 'but you will only pay ', defaultConfigs.maxFeePerGas, ', retrying...')
        await sleep(2000);
        await waitForGas(provider);
    } 
    return true;
}

async function deployRealityETH() {
    var tmpl = realityETHName();
    var txt = 'deploying reality.eth';
    txt = txt + ' [template '+tmpl+']';

    const provider = provider_for_chain();
    const t = constructContractTemplate(tmpl);
    const signer = new ethers.Wallet(priv, provider);
    const confac = new ethers.ContractFactory(t.abi, t.bytecode, signer);
    // console.log(signer);

    txt = txt + ' (from address ' + signer.address + ')';
    console.log(txt);

    await waitForGas(provider);

    if (deployed_at) {

        console.log('using preconfigured address', deployed_at);
        const inst = new ethers.Contract(deployed_at, t.abi, provider);
        conninst = inst.connect(signer);
        // console.log('depres', depres);
        const settings = {
            "address": deployed_at,
            "block": 0, // fill this in by hand from the earlier tx
            "token_address": token_address,
            "notes": null,
            "arbitrators": {}
        }

        //console.log('result was', result);
        store_deployed_contract(tmpl, chain_id, token_name, settings); 
        if (isERC20()) {
            console.log('Setting token')
            conninst.setToken(token_address);
        }

    } else {
        confac.deploy(defaultConfigs).then(function(result) {
            const txid = result.deployTransaction.hash;
            const address = result.address;
            console.log('storing address', address);
            console.log('deploying at address with tx ', txid);
            result.deployed().then(function(depres) {
                // console.log('depres', depres);
                const settings = {
                    "address": address,
                    "block": depres.provider._lastBlockNumber,
                    "token_address": token_address,
                    "notes": null,
                    "arbitrators": {}
                }

                //console.log('result was', result);
                store_deployed_contract(tmpl, chain_id, token_name, settings); 
                if (isERC20()) {
                    console.log('Setting token')
                    result.setToken(token_address);
                }
            });

        });
    }
}

function deployArbitrator() {

    const rc_conf = rc.realityETHConfig(chain_id, token_name, version); 
    console.log('using reality.eth config', rc_conf);
    if (rc_conf.token_address != token_address) {
        throw new Error('Reality.eth contract does not seem to use the token address you specified');
    }

    var tmpl = 'Arbitrator';
    var rc_file = project_base + '/chains/deployments/' + chain_id + '/' + token_name + '/' + tmpl + '.json';

    const timer = ms => new Promise( res => setTimeout(res, ms));

    const provider = provider_for_chain();
    const t = constructContractTemplate('Arbitrator');
    const signer = new ethers.Wallet(priv, provider);
    const confac = new ethers.ContractFactory(t.abi, t.bytecode, signer);

    confac.deploy(defaultConfigs).then(function(result) {
        const txid = result.deployTransaction.hash;
        const address = result.address;
        console.log('storing address', address);
        console.log('deploying at address with tx ', txid);
        result.deployed().then(function(depres) {
            // console.log('depres', depres);
            const settings = {
                "address": address,
                "block": depres.provider._lastBlockNumber,
                "reality_eth_address": rc_conf.address
            }

            console.log('storing address', address);
            store_deployed_contract('Arbitrator', chain_id, token_name, settings);

            console.log('doing setRealitio');
            result.setRealitio(rc_conf.address).then(function() {
                console.log('done setRealitio');
                return timer(9000);
            }).then(function() {
                console.log('doing setDisputeFee');
                return result.setDisputeFee(arb_fee);
            }).then(function() {
                console.log('done setDisputeFee');
                return timer(9000);
            }).then(function() {
                if (arbitrator_owner) {
                    result.transferOwnership(arbitrator_owner);
                }
            });


        });

    });
}


function deployERC20() {
    console.log('deploying an erc20 token', token_name);

    const provider = provider_for_chain();
    const t = constructContractTemplate('ERC20');
    const signer = new ethers.Wallet(priv, provider);
    const confac = new ethers.ContractFactory(t.abi, t.bytecode, signer);

    confac.deploy(defaultConfigs).then(function(result) {
        const txid = result.deployTransaction.hash;
        const address = result.address;
        console.log('storing address', address);
        console.log('deploying at address with tx ', txid);
        result.deployed().then(function(depres) {
            // console.log('depres', depres);
            const settings = {
                "address": address,
                "block": depres.provider._lastBlockNumber
            }

            console.log('storing address', address);
            store_deployed_contract(template, chain_id, token_name, settings);

        });
        //result.setToken(token_address);
        //result.setToken(result.contractAddress);
    });
}

async function deployFactory() {
    
    const config = rc.realityETHConfig(chain_id, token_name, version); 
    const lib = config.address;

    var tmpl = realityETHName();

    var txt = 'deploying reality.eth factory [library '+lib+']';

    const provider = provider_for_chain();
    const t = constructContractTemplate('RealityETH_ERC20_Factory');
    const signer = new ethers.Wallet(priv, provider);
    const confac = new ethers.ContractFactory(t.abi, t.bytecode, signer);
    // console.log(signer);

    txt = txt + ' (from address ' + signer.address + ')';
    console.log(txt);

    await waitForGas(provider);

    confac.deploy(lib, defaultConfigs).then(function(result) {
        const txid = result.deployTransaction.hash;
        const address = result.address;
        console.log('storing address', address);
        console.log('deploying at address with tx ', txid);
        result.deployed().then(function(depres) {
            // console.log('depres', depres);
            const settings = {
                "address": address,
                "block": depres.provider._lastBlockNumber,
                "library_address": lib,
            }

            //console.log('result was', result);
            store_deployed_factory_contract(tmpl, chain_id, settings); 
        });

    });
}
