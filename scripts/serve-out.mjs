// Static server for the e2e suite (playwright.config.ts): serves out/ like the real hosts do, including HTTP Range
// requests (python's http.server has none, and without them a browser can't seek inside the home walk's videos).
// Usage: node scripts/serve-out.mjs <port>. No dependencies.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'out');
const PORT = Number(process.argv[2] ?? 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json',
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  let path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
  if (!path.startsWith(ROOT)) return void res.writeHead(403).end();
  let st;
  try {
    st = statSync(path);
    if (st.isDirectory()) {
      if (!url.pathname.endsWith('/')) return void res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
      path = join(path, 'index.html');
      st = statSync(path);
    }
  } catch {
    return void res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
  const type = TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream';
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, st.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
    if (start > end || start >= st.size) return void res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }).end();
    res.writeHead(206, { 'Content-Type': type, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes' });
    if (req.method === 'HEAD') return void res.end();
    return void createReadStream(path, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
  if (req.method === 'HEAD') return void res.end();
  createReadStream(path).pipe(res);
}).listen(PORT, '127.0.0.1');
