/**
 * Servidor estatico minimo, so em 127.0.0.1 e porta livre.
 *
 * `/`            a pagina empacotada (modulo ES nao carrega por file://)
 * `/__visuais/`  o catalogo, para abrir o preview.svg como `<img>`
 * `/__tool/`     as duas paginas de conferencia (imagem e comparacao de pixels)
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import { VISUAIS_DIR } from './paths.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
};

const IMG_PAGE = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}img{display:block}</style></head>
<body><img id="alvo" alt=""><script>
const q = new URLSearchParams(location.search);
const img = document.getElementById('alvo');
img.width = Number(q.get('w')); img.height = Number(q.get('h'));
window.__imgReady = new Promise((ok, fail) => { img.onload = () => ok(true); img.onerror = () => fail(new Error('img falhou')); });
img.src = q.get('src');
</script></body></html>`;

const COMPARE_PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
async function load(src) { const img = new Image(); img.src = src; await img.decode(); return img; }
function pixels(img) { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height); }
window.compare = async (a, b, tolerance) => {
  const A = await load(a), B = await load(b);
  if (A.naturalWidth !== B.naturalWidth || A.naturalHeight !== B.naturalHeight) {
    return { sizeMismatch: true, a: [A.naturalWidth, A.naturalHeight], b: [B.naturalWidth, B.naturalHeight] };
  }
  const pa = pixels(A), pb = pixels(B);
  const w = pa.width, h = pa.height, total = w * h;
  const diff = document.createElement('canvas'); diff.width = w; diff.height = h;
  const dx = diff.getContext('2d'); const out = dx.createImageData(w, h);
  let count = 0, maxDelta = 0;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const d = Math.max(Math.abs(pa.data[o] - pb.data[o]), Math.abs(pa.data[o+1] - pb.data[o+1]), Math.abs(pa.data[o+2] - pb.data[o+2]), Math.abs(pa.data[o+3] - pb.data[o+3]));
    if (d > maxDelta) maxDelta = d;
    const g = (pa.data[o] * 0.3 + pa.data[o+1] * 0.59 + pa.data[o+2] * 0.11) * 0.35;
    if (d > tolerance) { count++; out.data[o] = 255; out.data[o+1] = 40; out.data[o+2] = 90; out.data[o+3] = 255; }
    else { out.data[o] = g; out.data[o+1] = g; out.data[o+2] = g; out.data[o+3] = 255; }
  }
  dx.putImageData(out, 0, 0);
  return { sizeMismatch: false, count, total, ratio: count / total, maxDelta, diffPng: count > 0 ? diff.toDataURL('image/png') : null };
};
window.__compareReady = true;
</script></body></html>`;

function safeJoin(base, urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const target = path.resolve(base, `.${decoded.startsWith('/') ? decoded : `/${decoded}`}`);
  const rel = path.relative(base, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return target;
}

export function startServer(distDir) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    let file = null;
    if (url.pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    if (url.pathname === '/__tool/img.html') {
      res.writeHead(200, { 'content-type': TYPES['.html'] });
      res.end(IMG_PAGE);
      return;
    }
    if (url.pathname === '/__tool/compare.html') {
      res.writeHead(200, { 'content-type': TYPES['.html'] });
      res.end(COMPARE_PAGE);
      return;
    }
    if (url.pathname.startsWith('/__visuais/')) file = safeJoin(VISUAIS_DIR, url.pathname.slice('/__visuais'.length));
    else file = safeJoin(distDir, url.pathname === '/' ? '/index.html' : url.pathname);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404);
      res.end('nao encontrado');
      return;
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ origin: `http://127.0.0.1:${port}`, close: () => new Promise((ok) => server.close(() => ok())) });
    });
  });
}
