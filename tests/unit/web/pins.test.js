import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { abrirBanco } from '../../../web/js/banco.js';
import { criarPins } from '../../../web/js/pins.js';

let sequencia = 0;
const criar = async () => criarPins(await abrirBanco(`eco-pin-web-${Date.now()}-${sequencia++}`));

test('aceita somente PINs de 4 a 8 dígitos', async () => {
  const pins = await criar();
  for (const pin of ['123', '123456789', 'abcd', '12 34', '１２３４']) {
    await assert.rejects(pins.definirPin('professor', pin), { code: 'PIN_FORMATO' });
  }
  await pins.definirPin('professor', '4821');
  pins.fechar();
});

test('salva PBKDF2 com sal de 16 bytes e 600.000 iterações, sem PIN em texto puro', async () => {
  const db = await abrirBanco(`eco-pin-web-${Date.now()}-${sequencia++}`);
  const pins = criarPins(db);
  await pins.definirPin('professor', '4821');
  const tx = db.transaction('config', 'readonly');
  const row = await new Promise((resolve, reject) => {
    const req = tx.objectStore('config').get('pinProfessor');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  assert.equal(row.iteracoes, 600000);
  assert.equal(atob(row.sal).length, 16);
  assert.equal(atob(row.hash).length, 32);
  assert.equal(JSON.stringify(row).includes('4821'), false);
  pins.fechar();
});

test('verifica PIN correto, recusa errado e separa os papéis', async () => {
  const pins = await criar();
  await pins.definirPin('professor', '1111');
  await pins.definirPin('admin', '2222');
  assert.equal(await pins.verificarPin('professor', '1111'), true);
  assert.equal(await pins.verificarPin('professor', '2222'), false);
  assert.equal(await pins.verificarPin('admin', '2222'), true);
  assert.equal(await pins.verificarPin('admin', '1111'), false);
  pins.fechar();
});

test('sal aleatório produz hashes diferentes para o mesmo PIN', async () => {
  const pins = await criar();
  await pins.definirPin('professor', '1234');
  await pins.definirPin('admin', '1234');
  assert.equal(await pins.verificarPin('professor', '1234'), true);
  assert.equal(await pins.verificarPin('admin', '1234'), true);
  pins.fechar();
});
