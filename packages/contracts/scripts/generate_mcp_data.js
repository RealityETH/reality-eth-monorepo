/*
 * Generates packages/mcp/generated/chains-config.json from the contracts data.
 * Run via `npm run generate` in packages/contracts.
 */

const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const mcp  = path.resolve(base, '../../packages/mcp/generated');

const chains    = JSON.parse(fs.readFileSync(path.join(base, 'generated/chains.json'),    'utf8'));
const contracts = JSON.parse(fs.readFileSync(path.join(base, 'generated/contracts.json'), 'utf8'));

const out = { chains: {} };

for (const [chainId, chain] of Object.entries(chains)) {
  if (!chain.realityETHIndexerSupport) continue;

  // Pick RPC URLs — skip websocket entries
  const rpcs = (chain.rpcUrls || []).filter(u => u.startsWith('https://'));

  const chainContracts = {};
  for (const [token, versions] of Object.entries(contracts[chainId] || {})) {
    for (const [version, data] of Object.entries(versions)) {
      if (!chainContracts[token]) chainContracts[token] = {};
      chainContracts[token][version] = data.address;
    }
  }

  out.chains[chainId] = {
    name:       chain.chainName,
    shortName:  chain.network_name,
    rpcUrls:    rpcs,
    contracts:  chainContracts,
  };
}

fs.mkdirSync(mcp, { recursive: true });
fs.writeFileSync(path.join(mcp, 'chains-config.json'), JSON.stringify(out, null, 2) + '\n');
console.log('Generated packages/mcp/generated/chains-config.json');
