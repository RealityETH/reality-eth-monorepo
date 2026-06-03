#!/usr/bin/env node
//
// Extracts duplicate utility functions from rpc.js and graph.js into utils.js.
// Each function is checked to be identical in both files and free of outer-scope
// dependencies before being extracted.
//
// Dry run (review what will happen):
//   node tools/extract-shared.js
//
// Apply changes:
//   node tools/extract-shared.js --apply

'use strict';

const fs = require('fs');
const path = require('path');
const acorn = require('../packages/dapp/node_modules/acorn');

// ============================================================
// REVIEW THIS LIST — candidates to move from rpc.js and graph.js into utils.js.
// The script will check each one:
//   - exists in both files
//   - is identical in both files
//   - doesn't reference outer-scope variables it can't carry
// Anything that fails a check is reported and skipped.
// ============================================================
const FUNCTIONS_TO_EXTRACT = [
  'rand',
  'delay',
  'formatPossibleIPFSLink',
  'isArbitrationPending',
  'isFinalized',
  'isReopenable',
  'isReopenCandidate',
  'isCommitExpired',
  'commitExpiryTS',
  'isAnswerActivityStarted',
  'isAnsweredOrAnswerActive',
  'isAnswered',
  'setViewedBlockNumber',
  'getViewedBlockNumber',
  'markViewedToDate',
  'storePendingTXID',
  'clearPendingTXID',
  'contractQuestionID',
  'cqToID',
  'parseContractQuestionID',
  'humanToDecimalizedBigNumber',
  'decimalizedBigNumberToHuman',
  'humanReadableWei',
  'initScrollBars',
  'dragMoveListener',
  'renderTimeAgo',
  'updateAnyDisplay',
  'activateSection',
  'depopulateSection',
  'validate',
  'nonceFromSeed',
  'populateTOSSection',
  'RCStartBlock',
  'RCInstance',
  'getERC20TokenInstance',
];
// ============================================================

const APPLY = process.argv.includes('--apply');
const DAPP = path.join(__dirname, '../packages/dapp');
const SRC = path.join(DAPP, 'src/scripts');
const RPC_FILE = path.join(SRC, 'rpc.js');
const GRAPH_FILE = path.join(SRC, 'graph.js');
const UTILS_FILE = path.join(SRC, 'utils.js');
const PARSE_OPTS = { ecmaVersion: 2020, sourceType: 'module' };

// Browser/Node globals safe to reference from extracted functions
const SAFE_GLOBALS = new Set([
  'undefined', 'null', 'NaN', 'Infinity', 'console', 'window', 'document',
  'Math', 'Date', 'JSON', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'String', 'Number', 'Boolean', 'Array', 'Object', 'Error', 'TypeError',
  'Promise', 'Symbol', 'Map', 'Set', 'RegExp', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'URL',
]);

function readAndParse(file) {
  const src = fs.readFileSync(file, 'utf8');
  return { src, ast: acorn.parse(src, PARSE_OPTS) };
}

// Return the top-level statement list of the module
function getOuterBody(ast) {
  return ast.body;
}

// Find a named function in a list of statements
function findFunction(stmts, name) {
  for (const s of stmts) {
    if (s.type === 'FunctionDeclaration' && s.id && s.id.name === name) return s;
    if (s.type === 'VariableDeclaration') {
      for (const d of s.declarations) {
        const init = d.init;
        if (d.id && d.id.name === name && init &&
            (init.type === 'FunctionExpression' || init.type === 'ArrowFunctionExpression'))
          return s;
      }
    }
  }
  return null;
}

// Get the name out of a function node (FunctionDeclaration or VariableDeclaration)
function getFunctionName(node) {
  if (node.type === 'FunctionDeclaration') return node.id.name;
  if (node.type === 'VariableDeclaration') return node.declarations[0].id.name;
  return null;
}

// Collect all names declared at the top level of a statement list
function topLevelNames(stmts) {
  const names = new Set();
  for (const s of stmts) {
    if (s.type === 'FunctionDeclaration' && s.id) names.add(s.id.name);
    if (s.type === 'VariableDeclaration') {
      for (const d of s.declarations) {
        if (d.id && d.id.type === 'Identifier') names.add(d.id.name);
      }
    }
  }
  return names;
}

// Collect parameter names from a function node
function getParamNames(node) {
  const fn = node.type === 'FunctionDeclaration' ? node : node.declarations[0].init;
  const names = new Set();
  for (const p of (fn.params || [])) {
    if (p.type === 'Identifier') names.add(p.name);
    if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') names.add(p.left.name);
    if (p.type === 'RestElement' && p.argument.type === 'Identifier') names.add(p.argument.name);
  }
  return names;
}

// Walk AST collecting referenced identifiers.
// Skips property names in member expressions (foo.bar only adds foo)
// and non-computed object keys ({ foo: val } only adds val).
function collectRefs(node, found = new Set()) {
  if (!node || typeof node !== 'object') return found;
  if (Array.isArray(node)) { node.forEach(c => collectRefs(c, found)); return found; }
  switch (node.type) {
    case 'Identifier':
      found.add(node.name);
      break;
    case 'MemberExpression':
      collectRefs(node.object, found);
      if (node.computed) collectRefs(node.property, found);
      break;
    case 'Property':
      if (node.computed) collectRefs(node.key, found);
      collectRefs(node.value, found);
      break;
    default:
      for (const key of Object.keys(node)) {
        if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') continue;
        collectRefs(node[key], found);
      }
  }
  return found;
}

function main() {
  const rpc = readAndParse(RPC_FILE);
  const graph = readAndParse(GRAPH_FILE);
  const rpcBody = getOuterBody(rpc.ast);
  const graphBody = getOuterBody(graph.ast);
  const outerScope = topLevelNames(rpcBody);
  // Also treat top-level import bindings as outer scope
  for (const node of rpc.ast.body) {
    if (node.type === 'ImportDeclaration') {
      for (const spec of node.specifiers) outerScope.add(spec.local.name);
    }
  }
  const extractSet = new Set(FUNCTIONS_TO_EXTRACT);

  const toExtract = [];
  const skippedOuter = [];
  const skippedDiffers = [];
  const skippedMissing = [];

  for (const name of FUNCTIONS_TO_EXTRACT) {
    const rpcNode = findFunction(rpcBody, name);
    const graphNode = findFunction(graphBody, name);

    if (!rpcNode || !graphNode) {
      skippedMissing.push({ name, inRpc: !!rpcNode, inGraph: !!graphNode });
      continue;
    }

    const rpcText = rpc.src.slice(rpcNode.start, rpcNode.end);
    const graphText = graph.src.slice(graphNode.start, graphNode.end);

    if (rpcText !== graphText) {
      skippedDiffers.push(name);
      continue;
    }

    // Check for outer-scope references that can't travel with the function
    const params = getParamNames(rpcNode);
    const refs = collectRefs(rpcNode);
    const outerDeps = [...refs].filter(
      id => outerScope.has(id) && !extractSet.has(id) && !SAFE_GLOBALS.has(id) && !params.has(id)
    );

    if (outerDeps.length > 0) {
      skippedOuter.push({ name, deps: outerDeps });
    } else {
      toExtract.push({ name, text: rpcText, node: rpcNode });
    }
  }

  // Second pass: if a function calls another that is in the candidate list but
  // was ultimately skipped, it can't be extracted either. Repeat until stable.
  let changed = true;
  while (changed) {
    changed = false;
    const extractNames = new Set(toExtract.map(f => f.name));
    for (let i = toExtract.length - 1; i >= 0; i--) {
      const f = toExtract[i];
      const node = findFunction(rpcBody, f.name);
      const params = getParamNames(node);
      const refs = collectRefs(node);
      const brokenDeps = [...refs].filter(
        id => extractSet.has(id) && !extractNames.has(id) && !params.has(id)
      );
      if (brokenDeps.length > 0) {
        toExtract.splice(i, 1);
        skippedOuter.push({ name: f.name, deps: brokenDeps.map(d => `${d} (skipped)`) });
        changed = true;
      }
    }
  }

  // ---- Report ----
  console.log('\n=== WILL EXTRACT ===');
  if (toExtract.length === 0) console.log('  (none)');
  toExtract.forEach(f => console.log(' ', f.name));

  console.log('\n=== SKIPPED — uses outer-scope variables ===');
  if (skippedOuter.length === 0) console.log('  (none)');
  skippedOuter.forEach(({ name, deps }) => console.log(`  ${name}: [${deps.join(', ')}]`));

  console.log('\n=== SKIPPED — differs between files (near-duplicates) ===');
  if (skippedDiffers.length === 0) console.log('  (none)');
  skippedDiffers.forEach(name => console.log(' ', name));

  console.log('\n=== SKIPPED — not found in one or both files ===');
  if (skippedMissing.length === 0) console.log('  (none)');
  skippedMissing.forEach(({ name, inRpc, inGraph }) =>
    console.log(`  ${name}: rpc=${inRpc} graph=${inGraph}`)
  );

  if (!APPLY) {
    console.log('\nDry run. Pass --apply to apply changes.\n');
    return;
  }

  if (toExtract.length === 0) {
    console.log('\nNothing to extract.\n');
    return;
  }

  // ---- Apply ----
  const names = toExtract.map(f => f.name);
  const importLine = `import { ${names.join(', ')} } from './utils.js';`;

  // Write utils.js
  const utilsSrc = [
    "'use strict';",
    '',
    toExtract.map(f => f.text).join('\n\n'),
    '',
    `export { ${names.join(', ')} };`,
    '',
  ].join('\n');
  fs.writeFileSync(UTILS_FILE, utilsSrc);
  console.log('Wrote utils.js');

  // Remove extracted functions from a file and add the import
  function updateFile(file, src, body, ast) {
    const extractNames = new Set(names);
    const nodes = body
      .filter(s => extractNames.has(getFunctionName(s)))
      .sort((a, b) => b.start - a.start); // reverse order so removals don't shift offsets

    let result = src;
    for (const node of nodes) {
      // Back up to start of line to include indentation whitespace
      let start = node.start;
      while (start > 0 && result[start - 1] !== '\n') start--;
      // Forward past the trailing newline
      let end = node.end;
      if (result[end] === '\n') end++;
      result = result.slice(0, start) + result.slice(end);
    }

    // Insert import after the last top-level import declaration
    let insertPos = 0;
    for (const node of ast.body) {
      if (node.type === 'ImportDeclaration') insertPos = node.end;
    }
    result = result.slice(0, insertPos) + '\n' + importLine + result.slice(insertPos);

    fs.writeFileSync(file, result);
    console.log('Updated', path.basename(file));
  }

  updateFile(RPC_FILE, rpc.src, rpcBody, rpc.ast);
  updateFile(GRAPH_FILE, graph.src, graphBody, graph.ast);

  console.log('\nDone. Run npm run build to verify.\n');
}

main();
