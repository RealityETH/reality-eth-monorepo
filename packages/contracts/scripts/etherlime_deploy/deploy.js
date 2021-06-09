const fs = require('fs');
const etherlime = require('etherlime-lib');
const project_base = './../../';
const build_dir = './../../truffle/build/contracts/';

var undef;

const defaultConfigs = {
    gasPrice: 8000000000,
    gasLimit: 6000000,
    etherscanApiKey: 'TPA4BFDDIH8Q7YBQ4JMGN6WDDRRPAV6G34'
}
const task = process.argv[2]
const version = process.argv[3]
const network = process.argv[4]
const token_name = process.argv[5]
const token_address = process.argv[6]
var arb_fee = process.argv[7]
var arbitrator_owner = process.argv[8]

var contract_type;

const networks = {
    'mainnet': 1,
    'ropsten': 3,
    'rinkeby': 4,
    'goerli': 5,
    'kovan': 42,
    'bsc': 56,
    'sokol': 77,
    'xdai': 100
}
const non_infura_networks = {
    'xdai': 'https://xdai.poanetwork.dev',
    'sokol': 'https://sokol.poa.network',
    'bsc': 'https://bsc-dataseed.binance.org'
}
const native_coins = {
    'ETH': true,
    'XDAI': true,
    'BNB': true
}

function constructContractTemplate(contract_name) {
    const abi = JSON.parse(fs.readFileSync(project_base + '/abi/solc-0.4.25/'+contract_name+'.abi'));
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
    msg += "Usage: node deploy.js <RealityETH|Arbitrator|ERC20> <version> <network> <token_name> [<token_address>] [<dispute_fee>] [<arbitrator_owner>]";
    throw msg;
}

const network_id = networks[network];

if (!network_id) {
    usage_error("Network unknown");
}

if (token_name == undef) {
    usage_error("token_name not supplied");
}

if ((isERC20() && token_address == undef) && (task != 'ERC20')) {
    usage_error("token_address not supplied");
}

if (arb_fee == undef) {
    arb_fee = "0xde0b6b3a76400000";
}

if (arbitrator_owner == undef) {
    arbitrator_owner = "0xdd8a989e5e89ad23ed2f91c6f106aea678a1a3d0";
}

const priv = fs.readFileSync('/home/ed/secrets/' + network + '.sec', 'utf8').replace(/\n/, '')

ensure_network_directory_exists(token_name, network_id);

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
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
    return true;
}

function store_deployed_contract(template, network_id, token_name, address, block, token_address) {
    const out_json = {
        "address": address,
        "block": block,
        "token_address": token_address,
        "notes": null
    }
    const file = project_base + '/networks/' + network_id + '/' + token_name + '/' + template + '.json';
    fs.writeFileSync(file, JSON.stringify(out_json, null, 4));
    console.log('wrote file', file);
}

function deployer_for_network() {
    if (non_infura_networks[network]) {
        console.log('Using network', non_infura_networks[network]);
        return new etherlime.JSONRPCPrivateKeyDeployer(priv, non_infura_networks[network], defaultConfigs);
    } else {
        return new etherlime.InfuraPrivateKeyDeployer(priv, network, null, defaultConfigs);
    }
}

function isERC20() {
    return (!native_coins[token_name]);
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
    console.log(txt);
    const deployer = deployer_for_network();
    deployer.deploy(constructContractTemplate(tmpl), {}).then(function(result) {
        console.log('storing address', result.contractAddress);
        //console.log('result was', result);
        store_deployed_contract(tmpl, network_id, token_name, result.contractAddress, result.provider._lastBlockNumber, token_address); 
        if (isERC20()) {
            result.setToken(token_address);
        }
    });
}

function deployArbitrator() {
    console.log('deploying arbitrator');
    var tmpl = realityETHName();
    var rc_file = project_base + '/networks/' + network_id + '/' + token_name + '/' + tmpl + '.json';
    var rc_conf = require(rc_file);
    var addr = rc_conf.address;

    const deployer = deployer_for_network();
    deployer.deploy(constructContractTemplate('Arbitrator'), {}).then(function(result) {
        console.log('storing address', result.contractAddress);
        store_deployed_contract('Arbitrator', network_id, token_name, result.contractAddress, result.provider._lastBlockNumber, null);

        result.setRealitio(addr).then(function() {
            return result.setDisputeFee(arb_fee);
        }).then(function() {
            result.transferOwnership(arbitrator_owner);
        });
    });
}

function deployERC20() {
    console.log('deploying an erc20 token', token_name);
    const deployer = deployer_for_network();
    deployer.deploy(constructContractTemplate('ERC20'), {}).then(function(result) {
        console.log('storing address', result.contractAddress);
        store_deployed_contract(template, network_id, token_name, result.contractAddress, result.provider._lastBlockNumber, null);

        //result.setToken(token_address);
        //result.setToken(result.contractAddress);
    });
}
