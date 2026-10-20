import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const RAIZES_PERMITIDAS = [
  path.resolve(RAIZ, 'web'),
  path.resolve(RAIZ, 'src/core'),
  path.resolve(RAIZ, 'src/cli/messages.pt-br.js'),
];
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

function arquivoPermitido(caminho) {
  return RAIZES_PERMITIDAS.some((raiz) =>
    caminho === raiz || (caminho.startsWith(`${raiz}${path.sep}`) && path.resolve(caminho) === caminho),
  );
}

function resolverRequisicao(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, 'http://127.0.0.1').pathname);
  } catch {
    return null;
  }
  if (pathname.includes('\\') || pathname.includes('\0')) return null;
  if (pathname === '/') pathname = '/web/';
  if (pathname.endsWith('/')) pathname += 'index.html';
  const caminho = path.resolve(RAIZ, `.${pathname}`);
  return arquivoPermitido(caminho) ? caminho : null;
}

export function iniciarServidor({ porta = Number(process.env.ECO_WEB_PORT || 8080), log = true } = {}) {
  const servidor = createServer(async (req, res) => {
    const caminho = resolverRequisicao(req.url ?? '/');
    if (!caminho || !['GET', 'HEAD'].includes(req.method ?? '')) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Não encontrado.');
      return;
    }
    try {
      const conteudo = await readFile(caminho);
      const headers = {
        'content-type': TIPOS[path.extname(caminho)] ?? 'application/octet-stream',
        'x-content-type-options': 'nosniff',
      };
      if (caminho === path.resolve(RAIZ, 'web/sw.js')) headers['service-worker-allowed'] = '/';
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : conteudo);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Não encontrado.');
    }
  });

  servidor.listen(porta, '127.0.0.1', () => {
    if (log) console.log(`Castelo do Eco: http://127.0.0.1:${servidor.address().port}/web/`);
  });
  return servidor;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) iniciarServidor();
