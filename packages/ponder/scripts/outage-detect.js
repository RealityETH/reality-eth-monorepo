#!/usr/bin/env node
// outage-detect.js — Detect ponder indexer failures. Run from cron.
// When outage state changes, pipes a JSON report to OUTAGE_SCRIPT via stdin.
// State is persisted in .outage-state.json between runs.
//
// Usage: OUTAGE_SCRIPT=/path/to/handler node outage-detect.js
// The script receives a JSON report on stdin:
//   { ts, ponderDown, heartbeatAge?, failing[], absent[], allChains }
//
// .outage-state.json is written to the same directory as this script.
// Add it to .gitignore.

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ─── config ──────────────────────────────────────────────────────────────────

const DB_URL    = process.env.DATABASE_URL
               || 'postgresql://ponder:X24k4nxE3oEIm6eGzDzNw8sTTrhSD2@localhost/ponder';
const DEBUG_LOG = path.resolve(__dirname, '..', 'ponder-debug.log');
const STATE_FILE = path.join(__dirname, '.outage-state.json');

// Ponder heartbeats every ~10s; flag down if silent for 90s.
const HEARTBEAT_TIMEOUT_MS = 90_000;

// A chain absent from the debug log for this long may be blocked by another chain's stall.
const ABSENT_WARN_MS = 20 * 60 * 1000;  // 20 min

// On first run (no saved state), read this many bytes from end of debug log.
const FIRST_RUN_BYTES = 500_000;

// ─── DB ──────────────────────────────────────────────────────────────────────

function psqlJson(query) {
  const r = spawnSync('psql', [DB_URL, '-t', '-A', '-c', query], {
    encoding: 'utf8',
    timeout: 10_000,
  });
  const out = r.stdout?.trim();
  if (!out) return null;
  try { return JSON.parse(out); } catch { return null; }
}

function getLockedInstance() {
  // Find the currently running (is_locked=1) app instance.
  return psqlJson(`
    SELECT value
      FROM _ponder_meta
     WHERE key LIKE 'app_%'
       AND (value->>'is_locked')::int = 1
     LIMIT 1
  `);
}

// ─── debug log parsing ───────────────────────────────────────────────────────

// [chain] something failed ... HTTP 429 / ECON... / etc.
const FAIL_RE = /^\[(\w+)\] \S+ failed.*?(?:HTTP (\d+)|(ECON\w+|ETIM\w+|fetch failed))/;
// [chain] eth_X ... → provider   OR   eth_X ... ← result   OR   RPC recovered
const OK_RE   = /^\[(\w+)\] (?:eth_\w+.*?[←→]|RPC recovered)/;
// Provider hostname from URL in failure line
const HOST_RE = /@\s+https?:\/\/([^/\s]+)/;

// Read only the bytes written since last run. On first run reads last FIRST_RUN_BYTES.
function readNewLines(lastSize) {
  let stats;
  try { stats = fs.statSync(DEBUG_LOG); } catch { return { lines: [], newSize: 0 }; }
  const currentSize = stats.size;

  // File rotated or truncated — reset
  let start = (lastSize > 0 && lastSize <= currentSize) ? lastSize : 0;
  if (start === 0) start = Math.max(0, currentSize - FIRST_RUN_BYTES);

  if (currentSize === start) return { lines: [], newSize: currentSize };

  const fd  = fs.openSync(DEBUG_LOG, 'r');
  const buf = Buffer.alloc(currentSize - start);
  fs.readSync(fd, buf, 0, buf.length, start);
  fs.closeSync(fd);

  return { lines: buf.toString('utf8').split('\n'), newSize: currentSize };
}

// Returns Map<chain, { lastSuccessIdx, lastFailureIdx, latestReason, latestProvider }>
// Higher index = later in the window = more recent.
function analyzeLines(lines) {
  const chains = new Map();
  const get = ch => {
    if (!chains.has(ch)) chains.set(ch, {
      lastSuccessIdx: -1, lastFailureIdx: -1, latestReason: null, latestProvider: null,
    });
    return chains.get(ch);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const fm = line.match(FAIL_RE);
    if (fm) {
      const s = get(fm[1]);
      if (i > s.lastFailureIdx) {
        s.lastFailureIdx = i;
        s.latestReason   = fm[2] ? `HTTP ${fm[2]}` : fm[3];
        const hm = line.match(HOST_RE);
        if (hm) s.latestProvider = hm[1];
      }
      continue;
    }

    const om = line.match(OK_RE);
    if (om) {
      const s = get(om[1]);
      if (i > s.lastSuccessIdx) s.lastSuccessIdx = i;
    }
  }
  return chains;
}

// ─── state computation ───────────────────────────────────────────────────────

function computeState(prev) {
  const now = Date.now();

  // Liveness: check locked instance heartbeat
  const instance     = getLockedInstance();
  const heartbeatAge = instance ? now - instance.heartbeat_at : Infinity;
  const ponderDown   = heartbeatAge > HEARTBEAT_TIMEOUT_MS;

  if (ponderDown) {
    return {
      ts: now, ponderDown: true,
      heartbeatAge: Math.round(heartbeatAge / 1000),
      instanceId: instance?.instance_id ?? null,
      chains: {},
      debugLogSize: prev?.debugLogSize ?? 0,
    };
  }

  // Per-chain health from debug log delta
  const { lines, newSize } = readNewLines(prev?.debugLogSize ?? 0);
  const analysis           = analyzeLines(lines);
  const prevChains         = prev?.chains ?? {};
  const chains             = {};

  // Update chains seen in the new lines
  for (const [chain, info] of analysis) {
    const wasHealthy   = prevChains[chain]?.status === 'healthy';
    const wasFailing   = prevChains[chain]?.status === 'failing';
    const failingSince = wasFailing ? prevChains[chain].since : now;
    const lastSeen     = prevChains[chain]?.lastSeen ?? prev?.ts ?? now;

    if (info.lastSuccessIdx > info.lastFailureIdx || info.lastSuccessIdx >= 0 && info.lastFailureIdx < 0) {
      // Most recent activity was a success (or only successes, no failures)
      chains[chain] = { status: 'healthy', lastSeen: now };
    } else if (info.lastFailureIdx >= 0) {
      // Most recent activity was a failure
      chains[chain] = {
        status: 'failing',
        reason: info.latestReason,
        provider: info.latestProvider,
        since: failingSince,
        lastSeen: lastSeen,
      };
    }
  }

  // Carry forward chains not seen in this window
  for (const [chain, prevInfo] of Object.entries(prevChains)) {
    if (chains[chain]) continue;

    if (prevInfo.status === 'failing') {
      // Still failing — silence means still retrying with backoff
      chains[chain] = prevInfo;
    } else {
      // Was healthy or absent — track silence duration
      const lastSeen  = prevInfo.lastSeen ?? prev?.ts ?? now;
      const silenceMs = now - lastSeen;
      chains[chain] = silenceMs > ABSENT_WARN_MS
        ? { status: 'absent', lastSeen, silenceSec: Math.round(silenceMs / 1000) }
        : { status: 'healthy', lastSeen };
    }
  }

  return {
    ts: now,
    ponderDown: false,
    instanceId: instance?.instance_id,
    chains,
    debugLogSize: newSize,
  };
}

// ─── change detection ────────────────────────────────────────────────────────

function hasChanged(prev, curr) {
  // First run: fire if anything is wrong
  if (!prev) {
    return curr.ponderDown
        || Object.values(curr.chains).some(c => c.status !== 'healthy');
  }

  if (prev.ponderDown !== curr.ponderDown) return true;

  const allChains = new Set([
    ...Object.keys(prev.chains ?? {}),
    ...Object.keys(curr.chains ?? {}),
  ]);

  for (const ch of allChains) {
    const p = prev.chains?.[ch]?.status ?? 'unknown';
    const c = curr.chains?.[ch]?.status ?? 'unknown';

    if (p !== c) return true;  // any status transition

    // Same status=failing but reason changed (different error, maybe different provider)
    if (c === 'failing' && prev.chains[ch]?.reason !== curr.chains[ch]?.reason) return true;
  }

  return false;
}

// ─── user script ─────────────────────────────────────────────────────────────

function buildReport(state) {
  const failing = Object.entries(state.chains)
    .filter(([, v]) => v.status === 'failing')
    .map(([chain, v]) => ({
      chain,
      reason: v.reason,
      provider: v.provider,
      since: v.since,
      durSec: v.since ? Math.round((state.ts - v.since) / 1000) : null,
    }));

  const absent = Object.entries(state.chains)
    .filter(([, v]) => v.status === 'absent')
    .map(([chain, v]) => ({ chain, lastSeen: v.lastSeen, silenceSec: v.silenceSec }));

  return {
    ts: state.ts,
    iso: new Date(state.ts).toISOString(),
    ponderDown: state.ponderDown,
    heartbeatAge: state.heartbeatAge ?? null,
    instanceId: state.instanceId ?? null,
    failing,
    absent,
    allChains: state.chains,
  };
}

function fireScript(state) {
  const scriptPath = process.env.OUTAGE_SCRIPT;
  const report     = buildReport(state);

  if (!scriptPath) {
    console.log('[outage-detect] No OUTAGE_SCRIPT set. Report:');
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (!fs.existsSync(scriptPath)) {
    console.error(`[outage-detect] OUTAGE_SCRIPT not found: ${scriptPath}`);
    return;
  }

  const r = spawnSync(scriptPath, [], {
    input: JSON.stringify(report, null, 2),
    encoding: 'utf8',
    timeout: 30_000,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (r.status !== 0) {
    console.error(`[outage-detect] Script exited ${r.status}`);
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return null; }
}

function saveState(state, changed) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...state, scriptFired: changed }, null, 2));
}

function main() {
  const prev    = loadState();
  const current = computeState(prev);
  const changed = hasChanged(prev, current);

  if (changed) fireScript(current);

  saveState(current, changed);

  const issues = Object.entries(current.chains)
    .filter(([, v]) => v.status !== 'healthy')
    .map(([k, v]) => `${k}=${v.status}${v.reason ? `(${v.reason})` : ''}`);

  const overall = current.ponderDown ? 'PONDER_DOWN'
                : issues.length      ? 'degraded'
                : 'ok';

  console.log(
    `[outage-detect] ${new Date(current.ts).toISOString()}`,
    `status=${overall}`,
    `changed=${changed}`,
    issues.length ? `issues=[${issues.join(' ')}]` : '',
  );
}

main();
