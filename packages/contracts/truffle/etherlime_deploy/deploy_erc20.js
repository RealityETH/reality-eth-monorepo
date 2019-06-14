const fs = require('fs');
const etherlime = require('etherlime-lib');
const build_dir = './../build/contracts/';
const contract_templates = {
    'Realitio': require(build_dir + 'RealitioERC20.json'),
    'Arbitrator': require(build_dir + 'Arbitrator.json')
}

const defaultConfigs = {
    gasPrice: 4000000000,
    gasLimit: 6000000,
    etherscanApiKey: 'TPA4BFDDIH8Q7YBQ4JMGN6WDDRRPAV6G34'
}
const network = process.argv[2]
const token_name = process.argv[3]
const token_address = process.argv[4]
var contract_type;

const networks = {
    'mainnet': 1,
    'ropsten': 3,
    'rinkeby': 4,
    'goerli': 5,
    'kovan': 42
}

const network_id = networks[network];
if (!network_id) {
    throw "Network unknown";
}

if (token_name == "") {
    throw "token_name not supplied";
}

if (token_address == "") {
    throw "token_address not supplied";
}

const priv = fs.readFileSync('./secrets/' + network + '.sec', 'utf8').replace(/\n/, '')

if (!fs.existsSync(token_contract_file('Realitio', build_dir, token_name))) {
    deployRealitio();    
} else {
    deployArbitrator();
    //console.log('done');
    //setRealitioToken(token_address, build_dir, token_name, network_id);
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
        //result.setToken(token_address);
        result.setToken(result.contractAddress);
    });
}

function deployArbitrator() {
    var rc = load_or_create('Realitio', build_dir, token_name);
    var addr = rc.networks[""+network_id].address;
    var fee = "0xde0b6b3a76400000";

    const deployer = new etherlime.InfuraPrivateKeyDeployer(priv, network, null, defaultConfigs);
    deployer.deploy(contract_templates['Arbitrator'], {}).then(function(result) {
        console.log('storing address', result.contractAddress);
        store_deployed_contract('Arbitrator', build_dir, token_name, result.contractAddress); 
        //result.setToken(token_address);
        result.setRealitio(addr).then(function() {
            result.setDisputeFee(fee);
        });
    });
}
