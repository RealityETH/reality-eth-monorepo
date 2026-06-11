import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAPP_DIR = resolve(__dirname, '../../');

export const DAPP_PORT = 8082;
export const DAPP_URL = `http://localhost:${DAPP_PORT}`;

let serverProcess = null;

export async function startDappServer() {
  let compilationDone = false;

  serverProcess = spawn(
    'node_modules/.bin/webpack',
    ['serve', '--config', 'webpack/webpack.config.dev.js', '--port', String(DAPP_PORT), '--no-open'],
    { cwd: DAPP_DIR, stdio: 'pipe' }
  );

  serverProcess.on('error', err => { throw new Error(`webpack-dev-server failed: ${err.message}`); });

  // Watch stdout for the "compiled" message so we know the bundle is ready
  const resolveCompiled = new Promise((resolve) => {
    const check = (data) => {
      const s = data.toString();
      if (s.includes('compiled') || s.includes('successfully')) {
        compilationDone = true;
        resolve();
      }
    };
    serverProcess.stdout.on('data', check);
    serverProcess.stderr.on('data', check);
  });

  // Wait for HTTP to be up first (quick), then wait for compilation
  await waitForDapp();
  // Give it up to 60s for the bundle to finish compiling
  await Promise.race([
    resolveCompiled,
    new Promise(r => setTimeout(r, 60000)),
  ]);

  // Extra buffer to ensure assets are served
  await new Promise(r => setTimeout(r, 500));
}

export async function stopDappServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

async function waitForDapp(retries = 60, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(DAPP_URL);
      if (res.ok || res.status === 304) return;
    } catch {
      // not up yet
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error('Dapp dev server did not start in time');
}
