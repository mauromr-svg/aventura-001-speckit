import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { abrirBanco } from '../../../web/js/banco.js';
import { criarLog } from '../../../web/js/log.js';

let sequencia = 0;
const novoNome = () => `eco-log-test-${Date.now()}-${sequencia++}`;

test('grava campos permitidos e descarta entrada, aluno e PIN', async () => {
  const db = await abrirBanco(novoNome());
  const log = criarLog(db);
  await log.info('eco_registrado', { status: 'ok', entrada: '3, 6', aluno: 'Ana', pin: '1234' });
  const linhas = await listar(db);
  assert.equal(linhas.length, 1);
  assert.equal(linhas[0].evento, 'eco_registrado');
  assert.equal(linhas[0].status, 'ok');
  assert.equal(linhas[0].entrada, undefined);
  assert.equal(linhas[0].aluno, undefined);
  assert.equal(linhas[0].pin, undefined);
  assert.ok(!Number.isNaN(Date.parse(linhas[0].ts)));
  db.close();
});

test('mantém no máximo 500 logs removendo os mais antigos', async () => {
  const db = await abrirBanco(novoNome());
  const log = criarLog(db);
  for (let i = 0; i < 505; i++) await log.info(`evento_${i}`);
  const linhas = await listar(db);
  assert.equal(linhas.length, 500);
  assert.equal(linhas[0].evento, 'evento_5');
  assert.equal(linhas.at(-1).evento, 'evento_504');
  db.close();
});

test('falha do IndexedDB não vaza exceção para a interface', async () => {
  const log = criarLog({ transaction() { throw new Error('IndexedDB indisponível'); } });
  await assert.doesNotReject(log.erro('falha'));
  assert.equal(await log.erro('falha'), false);
});

function listar(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('logs', 'readonly');
    const request = tx.objectStore('logs').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
