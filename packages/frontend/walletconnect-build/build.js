import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(__dirname, '../webroot/js/vendor/walletconnect.js');

await build({
  entryPoints: [resolve(__dirname, 'src/index.js')],
  bundle: true,
  format: 'iife',
  outfile,
  // Node.js globals used internally by WalletConnect
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis',
  },
  inject: [resolve(__dirname, 'src/buffer-shim.js')],
  minify: true,
  // WalletConnect uses dynamic imports for some optional modules; mark them external
  // so esbuild doesn't try to bundle things that don't exist in browser context.
  external: [],
  platform: 'browser',
  target: ['es2020'],
  logLevel: 'info',
});

console.log(`Built ${outfile}`);
