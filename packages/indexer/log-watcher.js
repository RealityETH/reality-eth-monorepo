// log-watcher.js — Tails nginx access log, activates lazy chains on real traffic.
// Writes sync-config.json and sends SIGHUP to sync.js when chain modes change.
import { readFileSync, writeFileSync, renameSync } from 'fs';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

const WCFG = JSON.parse(readFileSync(join(__dir, 'watcher-config.json'), 'utf8'));

const LOG_PATH           = WCFG.log_path;
const ALWAYS_ACTIVE      = new Set((WCFG.always_active_chains  ?? []).map(Number));
const ACTIVE_DURATION_MS = (WCFG.active_duration_hours         ?? 2)  * 3_600_000;
const MIN_REQUESTS       = WCFG.min_requests_to_activate        ?? 1;
const MIN_DISTINCT_IPS   = WCFG.min_distinct_ips                ?? 1;
const WINDOW_MS          = (WCFG.window_minutes                 ?? 60) * 60_000;

const SYNC_CONFIG = join(__dir, 'sync-config.json');
const SYNC_PID    = join(__dir, 'sync.pid');
const TMP         = join(__dir, 'sync-config.json.tmp');

// Per-chain sliding request window: chainId → [{time, ip}]
const history = {};
// Per-chain activation expiry timestamp (ms): chainId → number
const activatedUntil = {};

function getHistory(chainId) {
  if (!history[chainId]) history[chainId] = [];
  return history[chainId];
}

function pruneAndGet(chainId, now) {
  const cutoff = now - WINDOW_MS;
  history[chainId] = (history[chainId] || []).filter(e => e.time >= cutoff);
  return history[chainId];
}

function meetsThreshold(chainId, now) {
  const entries = pruneAndGet(chainId, now);
  if (entries.length < MIN_REQUESTS) return false;
  return new Set(entries.map(e => e.ip)).size >= MIN_DISTINCT_IPS;
}

function isActive(chainId, now) {
  return ALWAYS_ACTIVE.has(chainId) || (activatedUntil[chainId] ?? 0) > now;
}

function readSyncConfig() {
  try { return JSON.parse(readFileSync(SYNC_CONFIG, 'utf8')); }
  catch { return { chains: {} }; }
}

function writeSyncConfig(cfg) {
  cfg.updated = new Date().toISOString();
  writeFileSync(TMP, JSON.stringify(cfg, null, 2));
  renameSync(TMP, SYNC_CONFIG);
  try {
    const pid = parseInt(readFileSync(SYNC_PID, 'utf8').trim(), 10);
    process.kill(pid, 'SIGHUP');
    console.log(`[watcher] SIGHUP → sync.js (pid ${pid})`);
  } catch (e) {
    console.warn('[watcher] could not signal sync.js:', e.message);
  }
}

// Default nginx combined log format:
// 1.2.3.4 - - [09/Jul/2026:10:00:00 +0000] "POST /graphql/1,100 HTTP/2.0" 200 ...
const LINE_RE = /^(\S+) \S+ \S+ \[.*?\] "\w+ \/graphql\/([\d,]+) /;

function processLine(line) {
  const m = line.match(LINE_RE);
  if (!m) return;

  const ip       = m[1];
  const chainIds = m[2].split(',').map(Number).filter(Boolean);
  const now      = Date.now();
  let changed    = false;
  const cfg      = readSyncConfig();

  for (const chainId of chainIds) {
    if (ALWAYS_ACTIVE.has(chainId)) continue;

    getHistory(chainId).push({ time: now, ip });

    if (isActive(chainId, now)) {
      activatedUntil[chainId] = now + ACTIVE_DURATION_MS; // extend
      cfg.chains[String(chainId)] = { mode: 'active', active_until: activatedUntil[chainId] };
      changed = true;
    } else if (meetsThreshold(chainId, now)) {
      activatedUntil[chainId] = now + ACTIVE_DURATION_MS;
      cfg.chains[String(chainId)] = { mode: 'active', active_until: activatedUntil[chainId] };
      changed = true;
      console.log(`[watcher] chain ${chainId} → active`);
    }
  }

  if (changed) writeSyncConfig(cfg);
}

function checkExpirations() {
  const now = Date.now();
  const cfg = readSyncConfig();
  let changed = false;

  for (const [key, until] of Object.entries(activatedUntil)) {
    const chainId = Number(key);
    if (ALWAYS_ACTIVE.has(chainId)) continue;
    if (!until || now <= until) continue; // not expired yet

    if (meetsThreshold(chainId, now)) {
      activatedUntil[chainId] = now + ACTIVE_DURATION_MS; // re-extend from recent traffic
      cfg.chains[key] = { mode: 'active', active_until: activatedUntil[chainId] };
      changed = true;
    } else {
      activatedUntil[chainId] = 0;
      cfg.chains[key] = { mode: 'lazy' };
      changed = true;
      console.log(`[watcher] chain ${chainId} → lazy`);
    }
  }

  if (changed) writeSyncConfig(cfg);
}

// Write initial config: always-active chains forced to active.
function initConfig() {
  const cfg = readSyncConfig();
  // Restore activatedUntil from persisted config so expiry survives restarts.
  for (const [key, c] of Object.entries(cfg.chains || {})) {
    if (c.active_until) activatedUntil[Number(key)] = c.active_until;
  }
  let changed = false;
  for (const chainId of ALWAYS_ACTIVE) {
    if (cfg.chains[String(chainId)]?.mode !== 'active') {
      cfg.chains[String(chainId)] = { mode: 'active' };
      changed = true;
    }
  }
  if (changed) writeSyncConfig(cfg);
}

initConfig();
setInterval(checkExpirations, 60_000);

// Tail the nginx access log, reconnecting if the file is rotated (tail -F handles that).
let buf = '';
const tail = spawn('tail', ['-F', LOG_PATH], { stdio: ['ignore', 'pipe', 'pipe'] });
tail.stdout.on('data', chunk => {
  buf += chunk.toString();
  const lines = buf.split('\n');
  buf = lines.pop(); // hold incomplete trailing line
  for (const line of lines) if (line) processLine(line);
});
tail.stderr.on('data', d => console.error('[watcher] tail:', d.toString().trim()));
tail.on('exit', code => { console.error('[watcher] tail exited:', code); process.exit(1); });

console.log('[watcher] tailing', LOG_PATH);
