#!/usr/bin/env node
// Generates website-templates.js from custom-templates.json.
// Strips the _errors key, the _complete marker from each contract,
// and excludes chains that aren't worth bundling (large testnet chains, etc).
//
// Usage:
//   cd packages/contracts && node scripts/generate_templates_bundle.js

'use strict';
const fs   = require('fs');
const path = require('path');

const INPUT  = path.join(__dirname, '../generated/custom-templates.json');
const OUTPUT = path.join(__dirname, '../../frontend/webroot/js/vendor/website-templates.js');

// Chains excluded from the bundle (too large, or not useful in production).
const EXCLUDE_CHAINS = new Set(['1301']); // Unichain Sepolia: 672 templates, testnet only

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

const bundle = {};
for (const [chainId, contracts] of Object.entries(raw)) {
  if (chainId === '_errors') continue;
  if (EXCLUDE_CHAINS.has(chainId)) continue;
  bundle[chainId] = {};
  for (const [addr, templates] of Object.entries(contracts)) {
    const cleaned = {};
    for (const [k, v] of Object.entries(templates)) {
      if (k === '_complete') continue;
      cleaned[k] = v;
    }
    if (Object.keys(cleaned).length > 0) bundle[chainId][addr] = cleaned;
  }
  if (Object.keys(bundle[chainId]).length === 0) delete bundle[chainId];
}

const totalTemplates = Object.values(bundle)
  .flatMap(c => Object.values(c))
  .reduce((n, t) => n + Object.keys(t).length, 0);

const js = `window.RealityBundledTemplates = ${JSON.stringify(bundle)};\n`;
fs.writeFileSync(OUTPUT, js);

const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
console.log(`Written ${OUTPUT}`);
console.log(`${Object.keys(bundle).length} chains, ${totalTemplates} templates, ${kb}KB`);
