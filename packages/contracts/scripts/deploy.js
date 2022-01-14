const fs = require('fs');
const ethers = require('ethers');
const project_base = './../';
const build_dir = './../truffle/build/contracts/';
const rc = require('../index.js');

const deployed_at = null;
// const deployed_at = '0x33aa365a53a4c9ba777fb5f450901a8eef73f0a9'; //mainnet gno
// const deployed_at = '0xc79e58D0a23ea0eDBDD2dBc96d16e65f696BfFc8'; // rinkeby test

var undef;

const defaultConfigs = {
//    maxFeePerGas:         61000000000,
//    maxPriorityFeePerGas:  1000000000,
    //gasPrice: 70000000000
    // gasPrice: 10000, // optimism 1000000,
    gasPrice: 5000000000,
    // gasLimit: 6000000, // optimism 4500000
    gasLimit: 4500000,
    //etherscanApiKey: 'TPA4BFDDIH8Q7YBQ4JMGN6WDDRRPAV6G34'
    // gasLimit: 155734867 // arbitrum
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
    'kovan': 42,
    'bsc': 56,
    'sokol': 77,
    'cheapeth': 777,
    'xdai': 100,
    'polygon': 137,
    'ava': 43114,
    'arbitrum': 42161,
    'arbitrum-rinkeby': 421611,
    'kovan-optimistic': 69,
    'kintsugi': 1337702,
}
const non_infura_chains = {
    'xdai': 'https://xdai.poanetwork.dev',
    'sokol': 'https://sokol.poa.network',
    'bsc': 'https://bsc-dataseed.binance.org',
    'polygon': 'https://rpc-mainnet.maticvigil.com',
    'ava': 'https://api.avax.network/ext/bc/C/rpc',
    'arbitrum': 'https://arb1.arbitrum.io/rpc',
    'arbitrum-rinkeby': 'https://rinkeby.arbitrum.io/rpc',
    'ubiq': 'https://rpc.octano.dev',
    'cheapeth': 'https://node.cheapeth.org/rpc',
    'kovan-optimistic': 'https://kovan.optimism.io',
    'optimism': 'https://mainnet.optimism.io',
    'kintsugi': 'https://rpc.kintsugi.themerge.dev',
}

function constructContractTemplate(contract_name) {
    let abi; 
    try {
        abi = JSON.parse(fs.readFileSync(project_base + '/abi/solc-0.4.25/'+contract_name+'.abi.json'));
    } catch(e) {
        abi = JSON.parse(fs.readFileSync(project_base + '/abi/solc-0.8.6/'+contract_name+'.abi.json'));
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
    msg += "Usage: node deploy.js <RealityETH|Arbitrator|ERC20> <version> <chain_name> <token_name> [<dispute_fee>] [<arbitrator_owner>]";
    throw msg;
}

const chain_id = chains[chain];

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

const priv = fs.readFileSync('/home/ed/secrets/' + chain + '.sec', 'utf8').replace(/\n/, '')

ensure_chain_directory_exists(chain_id, token_name);

if (task == 'RealityETH') {
    deployRealityETH();
} else if (task == 'Arbitrator') {
    deployArbitrator();
} else if (task == 'ERC20') {
    deployERC20();
}

function ensure_chain_directory_exists(chain, token) {
    const dir = project_base + '/chains/deployments/' + chain+ '/' + token;    
    if (!fs.existsSync(dir)) {
        console.log('creating directory for token', chain, token, dir);
        fs.mkdirSync(dir, {
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

function provider_for_chain() {
    if (non_infura_chains[chain]) {
        console.log('Using chain', non_infura_chains[chain]);
        return new ethers.providers.JsonRpcProvider(non_infura_chains[chain]);
    } else {
        console.log('Using infura on chain', chain);
        return new ethers.providers.InfuraProvider(chain);
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
    // console.log('fee', f)
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
