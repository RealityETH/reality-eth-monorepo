#!/usr/bin/env node
// Fetches all templates from every deployed RealityETH contract across all chains.
//
// The contracts().templates(id) view returns the block number where
// LogNewTemplate was emitted for that template ID, or 0 if it doesn't exist.
// We call it for IDs 0, 1, 2, ... stopping at the first 0.
// For each unique block number we get a single pinpoint getLogs call that
// retrieves all LogNewTemplate events in that block for that contract.
//
// Usage:
//   cd packages/contracts && node scripts/fetch-templates.js
//
// Output: generated/custom-templates.json
//
// Errors (e.g. RPC nodes that don't serve old logs) are written to _errors in
// the output so the file can be checked in and specific failures retried later
// with a different RPC.

'use strict';
const fs   = require('fs');
const path = require('path');
const ethers = require('ethers');

const CONTRACTS_JSON  = path.join(__dirname, '../generated/contracts.json');
const SUPPORTED_JSON  = path.join(__dirname, '../chains/supported.json');
const CHAINID_NET_JSON = path.join(__dirname, '../chains/chainid.network.json');
const OUTPUT_PATH     = path.join(__dirname, '../generated/custom-templates.json');

const TEMPLATES_ABI = [
  'function templates(uint256 template_id) view returns (uint256)',
];

const LOG_TEMPLATE_TOPIC = ethers.utils.id('LogNewTemplate(uint256,address,string)');

const iface = new ethers.utils.Interface([
  'event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)',
]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchForContract(prov, chainId, address, existingTemplates, errors) {
  const rc = new ethers.Contract(address, TEMPLATES_ABI, prov);
  const templates = Object.assign({}, existingTemplates);
  const blocksQueried = new Set();

  for (let id = 0; ; id++) {
    let blockNum;
    try {
      const bn = await rc.templates(id);
      blockNum = bn.toNumber();
    } catch (err) {
      const msg = err.message || String(err);
      console.error(`  ✗ templates(${id}): ${msg.slice(0, 120)}`);
      errors.push({ chainId, contract: address, templateId: id, phase: 'templates()', error: msg });
      break;
    }

    if (blockNum === 0) {
      console.log(`  templates(${id}) = 0  — done (${id} template${id !== 1 ? 's' : ''})`);
      break;
    }

    console.log(`  templates(${id}) = block ${blockNum}`);

    if (!blocksQueried.has(blockNum)) {
      blocksQueried.add(blockNum);
      try {
        const logs = await prov.getLogs({
          address,
          topics: [LOG_TEMPLATE_TOPIC],
          fromBlock: blockNum,
          toBlock:   blockNum,
        });
        for (const log of logs) {
          try {
            const parsed = iface.parseLog(log);
            const tid  = parsed.args.template_id.toString();
            const text = parsed.args.question_text;
            templates[tid] = text;
            console.log(`    ✓ template ${tid}: ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
          } catch (parseErr) {
            console.error(`    ✗ log parse failed: ${parseErr.message}`);
          }
        }
        await sleep(150);
      } catch (logErr) {
        const msg = logErr.message || String(logErr);
        console.error(`  ✗ getLogs(block ${blockNum}): ${msg.slice(0, 120)}`);
        errors.push({ chainId, contract: address, block: blockNum, phase: 'getLogs', error: msg });
        // Don't break — continue to next template ID in case we can get the block number at least
      }
    }

    await sleep(150);
  }

  return templates;
}

function pickRpc(chainId, supported, publicRpcs) {
  // Highest priority: env var (same convention as the indexer's .env.local)
  const envRpc = process.env[`PONDER_RPC_URL_${chainId}`];
  if (envRpc) return envRpc;
  if (supported[chainId]?.hostedRPC) return supported[chainId].hostedRPC;
  // Fall back to first public (non-template) HTTP RPC from chainid.network.json
  const pub = (publicRpcs[chainId] || []).find(r => !r.includes('${') && r.startsWith('http'));
  return pub || null;
}

async function main() {
  const allContracts = JSON.parse(fs.readFileSync(CONTRACTS_JSON, 'utf8'));
  const supported    = JSON.parse(fs.readFileSync(SUPPORTED_JSON, 'utf8'));
  const cidList      = JSON.parse(fs.readFileSync(CHAINID_NET_JSON, 'utf8'));
  const publicRpcs   = Object.fromEntries(
    cidList.filter(c => c.chainId).map(c => [String(c.chainId), c.rpc || []])
  );

  // Load existing output so we can skip already-complete contracts
  let existing = { _errors: [] };
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
      console.log(`Loaded existing output from ${OUTPUT_PATH}`);
    } catch { /* start fresh */ }
  }

  const output   = { _errors: [] };
  let totalContracts = 0;
  let skipped = 0;

  for (const [chainId, tokenMap] of Object.entries(allContracts)) {
    const rpcUrl = pickRpc(chainId, supported, publicRpcs);
    if (!rpcUrl) {
      console.log(`\nChain ${chainId}: no RPC available, skipping`);
      continue;
    }

    output[chainId] = output[chainId] || {};

    // Collect unique RealityETH contract addresses — skip arbitrators etc.
    const seen = new Set();
    const toFetch = [];
    for (const [token, vers] of Object.entries(tokenMap)) {
      for (const [ver, info] of Object.entries(vers)) {
        if (!info.address) continue;
        if (!ver.includes('RealityETH')) continue;
        const lc = info.address.toLowerCase();
        if (seen.has(lc)) continue;
        seen.add(lc);
        toFetch.push({ address: lc, ver, token });
      }
    }

    if (!toFetch.length) continue;

    const prov = new ethers.providers.JsonRpcProvider(rpcUrl, {
      chainId: Number(chainId),
      name:    `chain-${chainId}`,
    });

    for (const { address, ver } of toFetch) {
      totalContracts++;
      const chainExisting = existing[chainId] || {};
      const contractExisting = chainExisting[address];

      // Skip if already marked complete in a previous run
      if (contractExisting && contractExisting._complete) {
        console.log(`\nChain ${chainId} ${ver} ${address}  — already complete, skipping`);
        output[chainId][address] = contractExisting;
        skipped++;
        continue;
      }

      console.log(`\nChain ${chainId}  ${ver}  ${address}  (via ${rpcUrl.slice(0, 50)})`);

      const contractErrors = [];
      const templates = await fetchForContract(
        prov, chainId, address,
        contractExisting || {}, contractErrors
      );
      output._errors.push(...contractErrors);

      // Only mark complete if no getLogs errors — incomplete contracts will be
      // retried automatically on the next run (e.g. with a better RPC set via env).
      const hasLogGaps = contractErrors.some(e => e.phase === 'getLogs');
      templates._complete = !hasLogGaps;
      output[chainId][address] = templates;

      // Save after every contract so progress isn't lost on failure
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    }
  }

  // Final save
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Done. ${totalContracts} contract(s) processed (${skipped} skipped as already complete).`);
  console.log(`Output: ${OUTPUT_PATH}`);

  if (output._errors.length > 0) {
    console.log(`\n${output._errors.length} error(s) — check _errors in the output file:`);
    for (const e of output._errors) {
      console.log(`  chain ${e.chainId}  ${e.contract}  ${e.phase}${e.block ? `  block ${e.block}` : `  id ${e.templateId}`}: ${e.error.slice(0, 80)}`);
    }
  } else {
    console.log('No errors.');
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message || err);
  process.exit(1);
});
