#!/usr/bin/env node
// Promote the live (gitignored) runtime sparse index to the tracked seed that ships in the
// repo / npm tarball. Run this deliberately when you want to publish a refreshed index:
//
//   npm run snapshot-index
//   git add known-event-blocks.json known-event-blocks-meta.json && git commit
//
// Routine indexer operation only writes the *.runtime.json files, so the tracked seed never
// changes except when you run this — keeping it out of unrelated commits/releases.

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir  = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(dir, '..');

const pairs = [
  ['known-event-blocks.runtime.json',      'known-event-blocks.json'],
  ['known-event-blocks-meta.runtime.json', 'known-event-blocks-meta.json'],
];

let promoted = 0;
let missing  = 0;
for (const [runtime, seed] of pairs) {
  const rp = path.join(base, runtime);
  const sp = path.join(base, seed);
  if (!fs.existsSync(rp)) {
    console.error(`No runtime file ${runtime} — run the indexer (or fetch-event-blocks.js) first to build the live index.`);
    missing++;
    continue;
  }
  fs.copyFileSync(rp, sp);
  console.log(`Promoted ${runtime} -> ${seed}`);
  promoted++;
}

if (missing) process.exitCode = 1;
if (promoted) console.log(`\nSeed updated. Review with 'git diff' and commit to ship the refreshed index.`);
