import { createServer } from 'http';
import { createReadStream, statSync } from 'fs';
import { resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Serve from the webroot — question.js fetches /packages/contracts/... so we need
// to also handle paths that escape the webroot upward into the repo tree.
const WEBROOT = resolve(__dirname, '../../webroot');
const REPO_ROOT = resolve(__dirname, '../../../..');

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

export const WEBSITE_PORT = 8083;
export const WEBSITE_URL = `http://localhost:${WEBSITE_PORT}`;

let server = null;

export async function startWebsiteServer() {
  server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${WEBSITE_PORT}`);
    const pathname = url.pathname.replace(/^\//, '') || 'index.html';

    // /packages/... paths are served from the repo root (e.g. contracts.json)
    const filePath = pathname.startsWith('packages/')
      ? resolve(REPO_ROOT, pathname)
      : resolve(WEBROOT, pathname);

    // Prevent path traversal outside the repo
    if (!filePath.startsWith(REPO_ROOT)) { res.writeHead(403); res.end(); return; }

    try {
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        res.writeHead(404); res.end('Not found'); return;
      }
    } catch {
      res.writeHead(404); res.end('Not found'); return;
    }

    const mime = MIME[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve, reject) => {
    server.listen(WEBSITE_PORT, '127.0.0.1', resolve);
    server.on('error', reject);
  });
}

export async function stopWebsiteServer() {
  if (server) {
    await new Promise(resolve => server.close(resolve));
    server = null;
  }
}
