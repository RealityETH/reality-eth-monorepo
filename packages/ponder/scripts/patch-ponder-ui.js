#!/usr/bin/env node
// Patches @ponder/core to suppress the Ink UI when --log-format json is used.
// The upstream binary always starts the Ink live-table regardless of log format;
// this patch makes createUi() a no-op in json mode so logs are plain text.
'use strict';
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../node_modules/@ponder/core/dist/bin/ponder.js');
const src = fs.readFileSync(file, 'utf8');

const needle = 'function createUi({ common }) {\n  const ui = buildUiState();';
const replacement = 'function createUi({ common }) {\n  if (common.options.logFormat === "json") {\n    return { kill: () => {} };\n  }\n  const ui = buildUiState();';

if (src.includes(replacement)) {
  console.log('ponder-ui patch: already applied, skipping.');
  process.exit(0);
}

if (!src.includes(needle)) {
  console.error('ponder-ui patch: target string not found — ponder may have been updated. Please review the patch.');
  process.exit(1);
}

fs.writeFileSync(file, src.replace(needle, replacement));
console.log('ponder-ui patch: applied successfully.');
