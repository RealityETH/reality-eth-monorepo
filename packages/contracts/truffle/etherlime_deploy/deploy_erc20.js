const fs = require('fs');
const etherlime = require('etherlime-lib');
const build_dir = './../build/contracts/';
const contract_templates = {
    'Realitio': require(build_dir + 'RealitioERC20.json'),
    'Arbitrator': require(build_dir + 'Arbitrator.json'),
    'ERC20': require(build_dir + 'ERC20.json')
}
var undef;

const defaultConfigs = {
    gasPrice: 8000000000,
    gasLimit: 6000000,
    etherscanApiKey: 'TPA4BFDDIH8Q7YBQ4JMGN6WDDRRPAV6G34'
}
const task = process.argv[2]
const network = process.argv[3]
const token_name = process.argv[4]
const token_address = process.argv[5]
var arb_fee = process.argv[6]
var arbitrator_owner = process.argv[7]

var contract_type;

const networks = {
    'mainnet': 1,
    'ropsten': 3,
    'rinkeby': 4,
    'goerli': 5,
    'kovan': 42
}

function usage_error(msg) {
    msg = msg + "\n";
    msg += "Usage: node deploy_erc20.js <Realitio|Arbitrator|ERC20> <network> <token_name> [<token_address>] [<dispute_fee>] [<arbitrator_owner>]";
    throw msg;
}

const network_id = networks[network];

if (contract_templates[task] == undef) {
    usage_error("Contract to deploy unknown");
}

if (!network_id) {
    usage_error("Network unknown");
}

if (token_name == undef) {
    usage_error("token_name not supplied");
}

if ((token_address == undef) && (task != 'ERC20')) {
    usage_error("token_address not supplied");
}

if (arb_fee == undef) {
    arb_fee = "0xde0b6b3a76400000";
}

if (arbitrator_owner == undef) {
    arbitrator_owner = "0xdd8a989e5e89ad23ed2f91c6f106aea678a1a3d0";
}


const priv = fs.readFileSync('./secrets/' + network + '.sec', 'utf8').replace(/\n/, '')

if (task == 'Realitio') {
    deployRealitio();    
} else if (task == 'Arbitrator') {
    deployArbitrator();
} else if (task == 'ERC20') {
    deployERC20();
}

function token_contract_file(contract_type, path, token) {
    return path + contract_type + '.'+token+'.json';
}

function load_or_create(contract_type, path, token) {
    contract_file = token_contract_file(contract_type, path, token);
    if (fs.existsSync(contract_file)) {
        rc = require(contract_file);
    } else {
        rc = contract_templates[contract_type];
    }
    return rc;
}

function store_deployed_contract(contract_type, path, token, address) {
    rc = load_or_create(contract_type, path, token);
    if (!rc['networks']) {
        rc['networks'] = {};
    }
    rc['networks'][""+network_id] = {
      "events": {},
      "links": {},
      "address": address,
      "transactionHash": ""
    };
    fs.writeFileSync(token_contract_file(contract_type, path, token), JSON.stringify(rc, null, " "));
}

function deployRealitio() {
    console.log('deploying realitio');
    const deployer = new etherlime.InfuraPrivateKeyDeployer(priv, network, null, defaultConfigs);
    deployer.deploy(contract_templates['Realitio'], {}).then(function(result) {
        console.log('storing address', result.contractAddress);
        store_deployed_contract('Realitio', build_dir, token_name, result.contractAddress); 
        result.setToken(token_address);
    });
}

function deployArbitrator() {
    console.log('deploying arbitrator');
    var rc = load_or_create('Realitio', build_dir, token_name);
    var addr = rc.networks[""+network_id].address;

    const deployer = new etherlime.InfuraPrivateKeyDeployer(priv, network, null, defaultConfigs);
    deployer.deploy(contract_templates['Arbitrator'], {}).then(function(result) {
        console.log('storing address', result.contractAddress);
        store_deployed_contract('Arbitrator', build_dir, token_name, result.contractAddress); 
        result.setRealitio(addr).then(function() {
            return result.setDisputeFee(arb_fee);
        }).then(function() {
            result.transferOwnership(arbitrator_owner);
        });
    });
}

function deployERC20() {
    console.log('deploying an erc20 token', token_name);
    const deployer = new etherlime.InfuraPrivateKeyDeployer(priv, network, null, defaultConfigs);
    deployer.deploy(contract_templates['ERC20'], {}).then(function(result) {
        console.log('storing address', result.contractAddress);
        store_deployed_contract('ERC20', build_dir, token_name, result.contractAddress); 
        //result.setToken(token_address);
        //result.setToken(result.contractAddress);
    });
}


