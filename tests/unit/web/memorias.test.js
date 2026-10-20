import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { abrirBanco } from '../../../web/js/banco.js';
import { criarMemorias } from '../../../web/js/memorias.js';

let sequencia = 0;
const abrir = async () => criarMemorias(await abrirBanco(`eco-memorias-${Date.now()}-${sequencia++}`));

test('registra eco com campos e limites do contrato', async () => {
  const store = await abrir();
  const eco = await store.registrar({
    aluno: 'Ana', entrada: '1, 4, 9, 16', quantidade: 4, status: 'ok', padrao: 'polinomial', grau: 2, proximo: '25',
  });
  assert.match(eco.id, /^[0-9a-f-]{36}$/);
  assert.ok(eco.criadoEm.endsWith('Z'));
  assert.equal(eco.versaoEsquema, 1);
  assert.equal(eco.truncado, false);
  assert.equal(eco.grau, 2);

  const truncado = await store.registrar({ aluno: 'Ana', entrada: 'x'.repeat(5000), quantidade: 0, status: 'invalido', erro: 'NUMERO_INVALIDO' });
  assert.equal(truncado.entrada.length, 4096);
  assert.equal(truncado.truncado, true);
  assert.equal(truncado.padrao, null);
  assert.equal(truncado.proximo, null);
  assert.equal(truncado.erro, 'NUMERO_INVALIDO');
});

test('lista ecos do aluno e todos por data decrescente, incluindo erro e sem padrão', async () => {
  const store = await abrir();
  await store.registrar({ aluno: 'Ana', entrada: '1', quantidade: 2, status: 'ok', padrao: 'aritmetica', proximo: '2' });
  await store.registrar({ aluno: 'Bruno', entrada: '3', quantidade: 0, status: 'invalido', erro: 'NUMERO_INVALIDO' });
  await store.registrar({ aluno: 'Ana', entrada: '5', quantidade: 5, status: 'sem_padrao' });
  assert.deepEqual((await store.listarPorAluno('Ana')).map((eco) => eco.entrada), ['5', '1']);
  assert.deepEqual((await store.listarTodos()).map((eco) => eco.entrada), ['5', '3', '1']);
});

test('ignora e conta registros malformados sem apagá-los', async () => {
  const db = await abrirBanco(`eco-malformado-${Date.now()}-${sequencia++}`);
  const tx = db.transaction('ecos', 'readwrite');
  tx.objectStore('ecos').add({ id: 'ruim', aluno: 'Ana', entrada: 77, status: 'talvez' });
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  const store = criarMemorias(db);
  assert.deepEqual(await store.listarTodos(), []);
  assert.equal(store.danificados(), 1);
  const check = db.transaction('ecos', 'readonly').objectStore('ecos').count();
  assert.equal(await new Promise((resolve, reject) => { check.onsuccess = () => resolve(check.result); check.onerror = () => reject(check.error); }), 1);
});

test('apagarTudo limpa o histórico em uma operação', async () => {
  const store = await abrir();
  await store.registrar({ aluno: 'Ana', entrada: '1', quantidade: 2, status: 'ok', padrao: 'aritmetica', proximo: '2' });
  await store.apagarTudo();
  assert.deepEqual(await store.listarTodos(), []);
});
