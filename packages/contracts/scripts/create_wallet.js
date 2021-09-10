const fs = require('fs');
const ethers = require('ethers');

const out = process.argv[2]
if (!out) {
    throw new Error("Usage: node create_wallet.js <outfile>");
}

let w;
if (fs.existsSync(out)) {
    const k = fs.readFileSync(out, 'utf8').replace(/\n/, '')
    w = new ethers.Wallet(k)
    console.log("Wallet already exists at " + out + ", delete it if you want to create a new one");
} else { 
    w = ethers.Wallet.createRandom();
    fs.writeFileSync(out, w._signingKey().privateKey);
}

console.log(w.address);
