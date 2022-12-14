const fs = require('fs');
const ethers = require('ethers');

const from = process.argv[2]
if (!from) {
    throw new Error("Usage: node migrate_wallet.js <from> <to> <rpc>");
}

const to = process.argv[3]
if (!to) {
    throw new Error("Usage: node migrate_wallet.js <from> <to> <rpc>");
}

const rpc = process.argv[4];
if (!rpc) {
    throw new Error("Usage: node migrate_wallet.js <from> <to> <rpc>");
}

const is_out = (process.argv.length > 4 && process.argv[5] == 'out')

// For infura we just pass the network name eg kovan
const provider = (rpc.startsWith('http')) ? new ethers.providers.JsonRpcProvider(rpc) : new ethers.providers.InfuraProvider(rpc);

const fpriv = fs.readFileSync(from, 'utf8').replace(/\n/, '')
const f = new ethers.Wallet(fpriv, provider);

// to can be an address if we specify out, otherwise expect a key
let to_addr;
if (is_out) {
    to_addr = to;
} else {
    const tpriv = fs.readFileSync(to, 'utf8').replace(/\n/, '')
    const t = new ethers.Wallet(tpriv, provider);
    to_addr = t.address;
}
console.log(to_addr);

//console.log(provider);
migrateFunds(provider, f, to_addr);

async function migrateFunds(provider, f, to_addr) {

    const bal = await provider.getBalance(f.address)
    const gas_price = await provider.getGasPrice()
    const nonce = await provider.getTransactionCount(f.address, 'latest')
    const gas_limit = 21000;

    // console.log(f)

    const txdata = {
      to: to_addr,
      value: bal.sub((gas_price.mul(gas_limit))),
      nonce: nonce,
      gasLimit: ethers.utils.hexlify(gas_limit), 
      gasPrice: gas_price,
    }

    const walletSigner = f.connect(provider)
    const response = await walletSigner.sendTransaction(txdata);
    console.log('sent tx', response.hash)

};
