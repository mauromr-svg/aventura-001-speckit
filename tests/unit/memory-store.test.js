import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createMemoryStore } from '../../src/storage/memory-store.js';

const novaPasta = () => mkdtempSync(join(tmpdir(), 'eco-memorias-'));
const ler = (dir) => JSON.parse(readFileSync(join(dir, 'memorias.json'), 'utf8'));
const logger = { info() {}, aviso() {}, erro() {} };
const okEco = (aluno, entrada) => ({ aluno, entrada, quantidade: 3, status: 'ok', padrao: 'aritmetica', proximo: '12' });

test('arquivo ausente começa vazio, com versaoEsquema 1', () => {
  const dir = novaPasta();
  const store = createMemoryStore({ dir, logger });
  assert.equal(store.carregar(), null);
  assert.deepEqual(store.listarTodos(), []);
  store.registrar(okEco('Ana', '3, 6, 9'));
  assert.equal(ler(dir).versaoEsquema, 1);
});

test('registra eco com todos os campos do contrato', () => {
  const dir = novaPasta();
  const store = createMemoryStore({ dir, logger });
  store.carregar();
  store.registrar(okEco('Ana', '3, 6, 9'));
  store.registrar({ aluno: 'Ana', entrada: 'abc', quantidade: 0, status: 'invalido', erro: 'NUMERO_INVALIDO' });
  store.registrar({ aluno: 'Ana', entrada: '3, 1, 4, 1, 5', quantidade: 5, status: 'sem_padrao' });
  const [ok, invalido, semPadrao] = ler(dir).ecos;

  assert.match(ok.id, /^[0-9a-f-]{36}$/);
  assert.ok(ok.criadoEm.endsWith('Z') && !Number.isNaN(Date.parse(ok.criadoEm)));
  assert.deepEqual(
    { ...ok, id: undefined, criadoEm: undefined },
    { id: undefined, criadoEm: undefined, aluno: 'Ana', entrada: '3, 6, 9', quantidade: 3, truncado: false, status: 'ok', padrao: 'aritmetica', proximo: '12', erro: null },
  );
  assert.equal(invalido.padrao, null);
  assert.equal(invalido.proximo, null);
  assert.equal(invalido.erro, 'NUMERO_INVALIDO');
  assert.equal(semPadrao.padrao, null);
  assert.equal(semPadrao.erro, null);
});

test('entrada é cortada em 4.096 caracteres com truncado: true', () => {
  const dir = novaPasta();
  const store = createMemoryStore({ dir, logger });
  store.carregar();
  store.registrar(okEco('Ana', '1 '.repeat(5000)));
  const [eco] = ler(dir).ecos;
  assert.equal(eco.entrada.length, 4096);
  assert.equal(eco.truncado, true);
});

test('lista do mais recente para o mais antigo, por aluno ou todos', () => {
  const dir = novaPasta();
  const store = createMemoryStore({ dir, logger });
  store.carregar();
  store.registrar(okEco('Ana', '1'));
  store.registrar(okEco('Bruno', '2'));
  store.registrar(okEco('Ana', '3'));
  assert.deepEqual(store.listarPorAluno('Ana').map((e) => e.entrada), ['3', '1']);
  assert.deepEqual(store.listarTodos().map((e) => e.entrada), ['3', '2', '1']);
});

test('memórias persistem entre instâncias', () => {
  const dir = novaPasta();
  const a = createMemoryStore({ dir, logger });
  a.carregar();
  a.registrar(okEco('Ana', '1'));
  const b = createMemoryStore({ dir, logger });
  b.carregar();
  assert.equal(b.listarTodos().length, 1);
});

test('JSON corrompido: restaura do .bak e guarda cópia do arquivo ruim', () => {
  const dir = novaPasta();
  const store = createMemoryStore({ dir, logger });
  store.carregar();
  store.registrar(okEco('Ana', '1'));
  store.registrar(okEco('Ana', '2'));
  writeFileSync(join(dir, 'memorias.json'), '{ quebrado');

  const outro = createMemoryStore({ dir, logger });
  assert.equal(outro.carregar(), 'restaurado');
  assert.deepEqual(outro.listarTodos().map((e) => e.entrada), ['1']);
  assert.ok(readdirSync(dir).some((f) => f.startsWith('memorias.json.corrompido-')));
  assert.equal(ler(dir).ecos.length, 1, 'o arquivo principal foi reparado');
});

test('JSON e .bak corrompidos: recomeça com aviso, preservando cópias', () => {
  const dir = novaPasta();
  writeFileSync(join(dir, 'memorias.json'), 'lixo');
  writeFileSync(join(dir, 'memorias.json.bak'), 'lixo');
  const store = createMemoryStore({ dir, logger });
  assert.equal(store.carregar(), 'recomecado');
  assert.deepEqual(store.listarTodos(), []);
  assert.ok(readdirSync(dir).filter((f) => f.includes('.corrompido-')).length >= 1);
});

test('eco malformado é tratado como arquivo corrompido', () => {
  const dir = novaPasta();
  const store = createMemoryStore({ dir, logger });
  store.carregar();
  store.registrar(okEco('Ana', '1'));
  store.registrar(okEco('Ana', '2'));
  const dados = ler(dir);
  dados.ecos.push({ aluno: 'Ana' });
  writeFileSync(join(dir, 'memorias.json'), JSON.stringify(dados));

  const outro = createMemoryStore({ dir, logger });
  assert.equal(outro.carregar(), 'restaurado');
  assert.deepEqual(outro.listarTodos().map((e) => e.entrada), ['1']);
  assert.ok(readdirSync(dir).some((f) => f.startsWith('memorias.json.corrompido-')));
});

test('ecos com campos de tipo errado ou status desconhecido são rejeitados', () => {
  const invalidos = [
    null,
    'texto',
    { id: 'x', aluno: 'Ana', criadoEm: '2026-10-20T00:00:00.000Z', entrada: 123, status: 'ok' },
    { id: 'x', aluno: 'Ana', criadoEm: '2026-10-20T00:00:00.000Z', entrada: '1', status: 'talvez' },
    { aluno: 'Ana', criadoEm: '2026-10-20T00:00:00.000Z', entrada: '1', status: 'ok' },
  ];
  for (const eco of invalidos) {
    const dir = novaPasta();
    writeFileSync(join(dir, 'memorias.json'), JSON.stringify({ versaoEsquema: 1, ecos: [eco] }));
    const store = createMemoryStore({ dir, logger });
    assert.equal(store.carregar(), 'recomecado', JSON.stringify(eco));
    assert.deepEqual(store.listarTodos(), []);
  }
});

test('versaoEsquema maior que a conhecida: recusa gravar', () => {
  const dir = novaPasta();
  const original = JSON.stringify({ versaoEsquema: 99, ecos: [] });
  writeFileSync(join(dir, 'memorias.json'), original);
  const store = createMemoryStore({ dir, logger });
  assert.equal(store.carregar(), 'versao_desconhecida');
  assert.throws(() => store.registrar(okEco('Ana', '1')), { code: 'VERSAO_DESCONHECIDA' });
  assert.equal(readFileSync(join(dir, 'memorias.json'), 'utf8'), original);
});

test('apagarTudo esvazia o histórico e remove a cópia de segurança', () => {
  const dir = novaPasta();
  const store = createMemoryStore({ dir, logger });
  store.carregar();
  store.registrar(okEco('Ana', '1'));
  store.registrar(okEco('Ana', '2'));
  store.apagarTudo();
  assert.deepEqual(ler(dir).ecos, []);
  assert.ok(!readdirSync(dir).includes('memorias.json.bak'));
});
