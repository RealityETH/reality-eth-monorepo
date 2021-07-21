const fs = require('fs');
const ethers = require('ethers');
const project_base = './../';
const build_dir = './../truffle/build/contracts/';
const rc = require('../index.js');

var undef;

const defaultConfigs = {
    //gasPrice: 8000000000,
    //; gasLimit: 6000000,
    //etherscanApiKey: 'TPA4BFDDIH8Q7YBQ4JMGN6WDDRRPAV6G34'
}
const task = process.argv[2]
const version = process.argv[3]
const network = process.argv[4]
const token_name = process.argv[5]
var arb_fee = process.argv[6]
var arbitrator_owner = process.argv[7]

var contract_type;

const networks = {
    'mainnet': 1,
    'ropsten': 3,
    'rinkeby': 4,
    'goerli': 5,
    'ubiq': 8,
    'kovan': 42,
    'bsc': 56,
    'sokol': 77,
    'xdai': 100,
    'polygon': 137,
    'arbitrum': 42161,
    'arbitrum-rinkeby': 421611
}
const non_infura_networks = {
    'xdai': 'https://xdai.poanetwork.dev',
    'sokol': 'https://sokol.poa.network',
    'bsc': 'https://bsc-dataseed.binance.org',
    'polygon': 'https://rpc-mainnet.maticvigil.com',
    'arbitrum': 'https://arb1.arbitrum.io/rpc',
    'arbitrum-rinkeby': 'https://rinkeby.arbitrum.io/rpc',
    'ubiq': 'https://rpc.octano.dev'
}

function constructContractTemplate(contract_name) {
    const abi = JSON.parse(fs.readFileSync(project_base + '/abi/solc-0.4.25/'+contract_name+'.abi.json'));
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
    msg += "Usage: node deploy.js <RealityETH|Arbitrator|ERC20> <version> <network> <token_name> [<dispute_fee>] [<arbitrator_owner>]";
    throw msg;
}

const network_id = networks[network];

if (!network_id) {
    usage_error("Network unknown");
}

if (token_name == undef) {
    usage_error("token_name not supplied");
}

var token_address;

const token_info = rc.tokenConfig(token_name, network_id);
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

const priv = fs.readFileSync('/home/ed/secrets/' + network + '.sec', 'utf8').replace(/\n/, '')

ensure_network_directory_exists(network_id, token_name);

if (task == 'RealityETH') {
    deployRealityETH();
} else if (task == 'Arbitrator') {
    deployArbitrator();
} else if (task == 'ERC20') {
    deployERC20();
}

function ensure_network_directory_exists(network, token) {
    const dir = project_base + '/networks/' + network + '/' + token;    
    if (!fs.existsSync(dir)) {
        console.log('creating directory for token', network, token, dir);
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
    return true;
}

function store_deployed_contract(template, network_id, token_name, out_json) {
    const file = project_base + '/networks/' + network_id + '/' + token_name + '/' + template + '.json';
    fs.writeFileSync(file, JSON.stringify(out_json, null, 4));
    console.log('wrote file', file);
}

function provider_for_network() {
    if (non_infura_networks[network]) {
        console.log('Using network', non_infura_networks[network]);
        return new ethers.providers.JsonRpcProvider(non_infura_networks[network]);
    } else {
        console.log('Using infura on network', network);
        return new ethers.providers.InfuraProvider(network);
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

function deployRealityETH() {
    var tmpl = realityETHName();
    var txt = 'deploying reality.eth';
    txt = txt + ' [template '+tmpl+']';

    const provider = provider_for_network();
    const t = constructContractTemplate(tmpl);
    const signer = new ethers.Wallet(priv, provider);
    const confac = new ethers.ContractFactory(t.abi, t.bytecode, signer);
    // console.log(signer);

    txt = txt + ' (from address ' + signer.signingKey.address + ')';
    console.log(txt);

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
            store_deployed_contract(tmpl, network_id, token_name, settings); 
            if (isERC20()) {
                result.setToken(token_address);
            }

        });

    });
}

function deployArbitrator() {

    const rc_conf = rc.realityETHConfig(network_id, token_name, version); 
    console.log('using reality.eth config', rc_conf);
    if (rc_conf.token_address != token_address) {
        throw new Error('Reality.eth contract does not seem to use the token address you specified');
    }

    var tmpl = 'Arbitrator';
    var rc_file = project_base + '/networks/' + network_id + '/' + token_name + '/' + tmpl + '.json';

    const timer = ms => new Promise( res => setTimeout(res, ms));

    const provider = provider_for_network();
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
            store_deployed_contract('Arbitrator', network_id, token_name, settings);

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

    const provider = provider_for_network();
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
            store_deployed_contract(template, network_id, token_name, settings);

        });
        //result.setToken(token_address);
        //result.setToken(result.contractAddress);
    });
}
