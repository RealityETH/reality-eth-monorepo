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

// For infura we just pass the network name eg kovan
const provider = (rpc.startsWith('http')) ? new ethers.providers.JsonRpcProvider(rpc) : new ethers.providers.InfuraProvider(rpc);

const fpriv = fs.readFileSync(from, 'utf8').replace(/\n/, '')
const tpriv = fs.readFileSync(to, 'utf8').replace(/\n/, '')

const f = new ethers.Wallet(fpriv, provider);
const t = new ethers.Wallet(tpriv, provider);

//console.log(provider);
migrateFunds(provider, f, t);

async function migrateFunds(provider, f, t) {

    const bal = await provider.getBalance(f.signingKey.address)
    const gas_price = await provider.getGasPrice()
    const nonce = await provider.getTransactionCount(f.signingKey.address, 'latest')
    const gas_limit = 21000;

    // console.log(f)

    const txdata = {
      to: t.signingKey.address,
      value: bal.sub((gas_price.mul(gas_limit))),
      nonce: nonce,
      gasLimit: ethers.utils.hexlify(gas_limit), 
      gasPrice: gas_price,
    }

    const walletSigner = f.connect(provider)
    const response = await walletSigner.sendTransaction(txdata);
    console.log('sent tx', response.hash)

};
