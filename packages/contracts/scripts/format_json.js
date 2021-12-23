/*
Add new lines to the abi file for more meaningful version control
*/

const fs = require('fs');
const file = process.argv[2]
const abi = JSON.parse(fs.readFileSync(file));
fs.writeFileSync(file, JSON.stringify(abi, null, 4));
