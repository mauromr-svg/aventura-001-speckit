import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { iniciarServidor } from '../../../scripts/serve-web.js';

let servidor;
let base;
after(() => servidor?.close());

test('servidor expõe só os diretórios públicos com MIME correto', async () => {
  servidor = iniciarServidor({ porta: 0, log: false });
  await once(servidor, 'listening');
  const address = servidor.address();
  base = `http://127.0.0.1:${address.port}`;
  for (const [path, mime] of [
    ['/web/index.html', 'text/html'],
    ['/src/core/predict.js', 'text/javascript'],
    ['/src/cli/messages.pt-br.js', 'text/javascript'],
    ['/web/estilo.css', 'text/css'],
    ['/web/img/castelo-eco.svg', 'image/svg+xml'],
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.ok(response.headers.get('content-type').includes(mime), path);
  }
});

test('recusa arquivos privados e caminhos fora da raiz', async () => {
  for (const path of ['/dados/memorias.json', '/package.json', '/src/cli/app.js', '/web/../../package.json', '/web/%2e%2e/package.json']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
  }
});

test('ouve somente em 127.0.0.1 e define Service-Worker-Allowed', async () => {
  assert.equal(servidor.address().address, '127.0.0.1');
  const response = await fetch(base + '/web/sw.js');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('service-worker-allowed'), '/');
});
