/*
 * Bundles all website data files into a single JS file that can be loaded
 * as a <script> tag, enabling the site to run from file:// (IPFS).
 *
 * Usage:
 *   node scripts/generate_website_data.js           # writes to generated/website-data.js
 *   node scripts/generate_website_data.js --install # also copies to packages/website/webroot/js/
 */

const fs = require('fs');
const path = require('path');

const project_base = path.resolve(__dirname, '..');
const webroot = path.resolve(project_base, '../../packages/website/webroot');
const install = process.argv.includes('--install');

const chains       = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/chains.json'),    'utf8'));
const contracts    = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/contracts.json'), 'utf8'));
const factories    = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/factories.json'), 'utf8'));
const tokens       = JSON.parse(fs.readFileSync(path.join(project_base, 'generated/tokens.json'),    'utf8'));
const integrations = JSON.parse(fs.readFileSync(path.join(webroot,       'integrations.json'),        'utf8'));

const data = { chains, contracts, factories, tokens, integrations };
const output = 'window.RealityWebsiteData = ' + JSON.stringify(data) + ';\n';

const generatedPath = path.join(project_base, 'generated/website-data.js');
fs.writeFileSync(generatedPath, output);
console.log('Wrote', generatedPath);

if (install) {
    const installPath = path.join(webroot, 'js/website-data.js');
    fs.writeFileSync(installPath, output);
    console.log('Installed to', installPath);
}
