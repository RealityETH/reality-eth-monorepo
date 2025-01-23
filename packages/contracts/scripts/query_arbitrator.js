const fs = require('fs');
const ethers = require('ethers');

const rc = require('../index.js');

const chain_id = parseInt(process.argv[2]);
const arbitrator = process.argv[3];

const chain_data = rc.chainData(chain_id);
const rpc = chain_data.hostedRPC ? chain_data.hostedRPC : chain_data.rpcUrls[0];
const provider = new ethers.providers.JsonRpcProvider(rpc);
const abi = JSON.parse(fs.readFileSync('../abi/solc-0.4.25/Arbitrator.abi.json'));
const inst = new ethers.Contract(arbitrator, abi, provider);

queryArbitrator(inst);

async function queryArbitrator(arb) {
    const dispute_fee = await arb.getDisputeFee(ethers.constants.HashZero);
    const owner = await arb.owner();
    const realityETH = await arb.realitio();
    console.log("Owner", owner);
    console.log("Fee", dispute_fee.toString());
    console.log("Reality.eth", realityETH);
}
