import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { abrirBanco, NOME_BANCO, VERSAO_BANCO } from '../../../web/js/banco.js';

let sequencia = 0;
const nomeTeste = () => `${NOME_BANCO}-schema-${Date.now()}-${sequencia++}`;

test('cria os stores e índices do contrato na versão 1', async () => {
  const db = await abrirBanco(nomeTeste());
  assert.equal(db.version, VERSAO_BANCO);
  assert.deepEqual([...db.objectStoreNames].sort(), ['config', 'ecos', 'logs']);
  const tx = db.transaction(['ecos', 'config', 'logs'], 'readonly');
  assert.equal(tx.objectStore('ecos').keyPath, 'id');
  assert.ok(tx.objectStore('ecos').indexNames.contains('aluno'));
  assert.ok(tx.objectStore('ecos').indexNames.contains('criadoEm'));
  assert.equal(tx.objectStore('config').keyPath, 'chave');
  assert.equal(tx.objectStore('logs').autoIncrement, true);
  db.close();
});

test('não abre nem migra banco com versão futura', async () => {
  const nome = nomeTeste();
  const futuro = await new Promise((resolve, reject) => {
    const req = indexedDB.open(nome, 2);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  futuro.close();
  await assert.rejects(abrirBanco(nome), { code: 'VERSAO_DESCONHECIDA' });
});
