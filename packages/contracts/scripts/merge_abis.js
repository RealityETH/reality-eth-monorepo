/*
Add new lines to the abi file for more meaningful version control
*/

const fs = require('fs');
const project_base = './..'

const solc = process.argv[2];
const out = process.argv[3];

const abi_dir = project_base + '/abi/'+solc;

ret_by_name = {};
ret = [];

for (var i=4; i<process.argv.length; i++) {
    const v = process.argv[i];
    console.log(v);
    const abi = JSON.parse(fs.readFileSync(abi_dir+'/'+v));
    for (var idx in abi) {
        const name = abi[idx].name;
        if (!ret_by_name[name]) {
            ret_by_name[name] = abi[idx];
        }
    }

}

for (var n in ret_by_name) {
    ret.push(ret_by_name[n]);
}

fs.writeFileSync(abi_dir + '/' + out, JSON.stringify(ret, null, 4));

// console.log(ret);

//const abi = JSON.parse(fs.readFileSync(file));
//fs.writeFileSync(file, JSON.stringify(abi, null, 4));
