const fs = require('fs');
const ethers = require('ethers');

const usage_message = "Usage: node transfer_arbitrator.js <key> <arbitrator> <to> <rpc>";

const from = process.argv[2]

if (!from) {
    throw new Error(usage_message);
}

const arbitrator = process.argv[3]
if (!arbitrator) {
    throw new Error(usage_message);
}


const to = process.argv[4]
if (!to) {
    throw new Error(usage_message);
}

const rpc = process.argv[5];
if (!rpc) {
    throw new Error(usage_message);
}

const arb_abi = require('../abi/solc-0.4.25/Arbitrator.abi.json');

// For infura we just pass the network name eg kovan
const provider = (rpc.startsWith('http')) ? new ethers.providers.JsonRpcProvider(rpc) : new ethers.providers.InfuraProvider(rpc);

const fpriv = fs.readFileSync(from, 'utf8').replace(/\n/, '')
const f = new ethers.Wallet(fpriv, provider);

transferArbitrator(f, arbitrator, to);

async function transferArbitrator(f, arb, to_addr) {

    const arb_contract = new ethers.Contract(arb, arb_abi, f);
    
    const gas_price = await provider.getGasPrice()
    const nonce = await provider.getTransactionCount(f.address, 'latest')
    const gas_limit = 80000;

    console.log('Using gas price', gas_price);

    const override_options = {
        gasLimit: 80000,
        gasPrice: gas_price,
        nonce: nonce
    };

    // console.log(f)

    console.log('Transferring ownership of arbitration contract', arb, 'to address', to_addr);
    const response = await arb_contract.transferOwnership(to_addr, override_options);
    console.log('sent tx', response.hash)

};
