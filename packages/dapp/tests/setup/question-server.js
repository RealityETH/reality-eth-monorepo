import { createServer } from 'http';
import { createReadStream, statSync } from 'fs';
import { resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBROOT = resolve(__dirname, '../../../../packages/website/webroot');

export const QUESTION_PORT = 8083;
export const QUESTION_URL = `http://localhost:${QUESTION_PORT}`;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

let server = null;

export async function startQuestionServer() {
  server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${QUESTION_PORT}`);
    let filePath = resolve(WEBROOT, url.pathname.replace(/^\//, '') || 'index.html');
    // Prevent path traversal
    if (!filePath.startsWith(WEBROOT)) { res.writeHead(403); res.end(); return; }

    try {
      const stat = statSync(filePath);
      if (stat.isDirectory()) filePath = resolve(filePath, 'index.html');
    } catch {
      res.writeHead(404); res.end('Not found'); return;
    }

    const mime = MIME[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve, reject) => {
    server.listen(QUESTION_PORT, '127.0.0.1', resolve);
    server.on('error', reject);
  });
}

export async function stopQuestionServer() {
  if (server) {
    await new Promise(resolve => server.close(resolve));
    server = null;
  }
}
