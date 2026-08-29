/*
 * Bundles all website data files into a single JS file that can be loaded
 * as a <script> tag, enabling the site to run from file:// (IPFS).
 *
 * Usage:
 *   node scripts/generate_website_data.js           # writes to generated/website-data.js
 *   node scripts/generate_website_data.js --install # also copies to packages/frontend/webroot/js/
 */

const fs = require('fs');
const path = require('path');

const project_base = path.resolve(__dirname, '..');
const webroot = path.resolve(project_base, '../../packages/frontend/webroot');
const install = process.argv.includes('--install');

const chains       = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/chains.json'),    'utf8'));
const contracts    = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/contracts.json'), 'utf8'));
const factories    = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/factories.json'), 'utf8'));
const tokens       = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/tokens.json'),    'utf8'));
const integrations = JSON.parse(fs.readFileSync(path.join(webroot,       'integrations.json'),        'utf8'));

// Flat map: chainId (string) → native token symbol. Covers all chains in chains.json.
const nativeTokenByChain = {};
for (const [chainId, chainData] of Object.entries(chains)) {
    const symbol = chainData.nativeCurrency?.symbol;
    if (symbol) nativeTokenByChain[chainId] = symbol;
}

// Flat map: chainId (string) → small bond in wei (as number, safe as IEEE-754 double).
const smallBondByChain = {};
for (const [chainId, symbol] of Object.entries(nativeTokenByChain)) {
    const t = tokens[symbol];
    if (t?.small_number != null) smallBondByChain[chainId] = t.small_number;
}

// Flat index: lowercase contract address → metadata. Derived from contracts.json.
const contractsByAddress = {};
for (const [chainId, chainContracts] of Object.entries(contracts)) {
    for (const [tokenTicker, tokenVersions] of Object.entries(chainContracts)) {
        const tokenDecimals = tokens[tokenTicker]?.decimals ?? 18;
        for (const [versionName, versionData] of Object.entries(tokenVersions)) {
            if (!versionData.address) continue;
            const majorMatch = versionName.match(/-(\d+)\./);
            contractsByAddress[versionData.address.toLowerCase()] = {
                majorVersion: majorMatch ? parseInt(majorMatch[1]) : null,
                startBlock:   versionData.block ?? 0,
                tokenTicker,
                tokenDecimals,
                tokenAddress: versionData.token_address ?? null,
                chainId:      parseInt(chainId),
            };
        }
    }
}

const data = { chains, contracts, factories, tokens, integrations, nativeTokenByChain, smallBondByChain, contractsByAddress };
const output = 'window.RealityWebsiteData = ' + JSON.stringify(data) + ';\n';

const generatedPath = path.join(project_base, 'generated/website-data.js');
fs.writeFileSync(generatedPath, output);
console.log('Wrote', generatedPath);

if (install) {
    const installPath = path.join(webroot, 'js/vendor/website-data.js');
    fs.writeFileSync(installPath, output);
    console.log('Installed to', installPath);
}
