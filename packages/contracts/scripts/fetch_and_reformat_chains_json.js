/*
Add new lines to the abi file for more meaningful version control
*/

const request = require('request');
const fs = require('fs');

const url = 'https://chainid.network/chains.json';
const out = './../chains/chainid.network.json';

let options = {json: true};

request(url, options, (error, res, body) => {
    if (error) {
        console.log(error)
    };

    if (!error && res.statusCode == 200) {
        // console.log(body);
        fs.writeFileSync(out, JSON.stringify(body, null, 4));
        // do something with JSON, using the 'body' variable
    };
});
// 


/*

const file = process.argv[2]
const abi = JSON.parse(fs.readFileSync(file));
*/
