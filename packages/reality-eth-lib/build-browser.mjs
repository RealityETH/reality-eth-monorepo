import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(__dirname, '../website/webroot/js/vendor/reality-eth-lib.js');

await build({
  entryPoints: [resolve(__dirname, 'browser-entry.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'RealityLib',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis',
  },
  outfile,
  logLevel: 'info',
});

console.log(`Built ${outfile}`);
