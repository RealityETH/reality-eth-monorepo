const requireGlob = require('require-glob');
const fs = require('fs');
const path = require('path');

var SEPARATOR_PATTERN = /[\\\/]/;

function toCombinedValues(a, b) {
        return a.concat(b);
}

function toSplitPath(filePath) {
        return filePath.split(SEPARATOR_PATTERN);
}

function keygen(options, fileObj) {
        var uniquePath = fileObj.path.replace(fileObj.base, '');
        var parsedPath = path.parse(uniquePath);

        return [parsedPath.dir, parsedPath.name]
                .map(toSplitPath)
                .reduce(toCombinedValues)
                .filter(Boolean);
}

const all_config = requireGlob.sync('./../chains/deployments/*/*/*.json', {"keygen": keygen});
fs.writeFileSync(__dirname + '/../generated/contracts.json', JSON.stringify(all_config, null, 4));
