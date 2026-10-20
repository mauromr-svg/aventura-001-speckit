import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sessao, novaPastaDeDados } from './helpers.js';

function prepararAlunos() {
  const dir = novaPastaDeDados();
  sessao(['Ana', '3, 6, 9', 'abc'], dir);
  sessao(['Bruno', '2, 4, 8'], dir);
  return dir;
}

test('professor define o PIN no primeiro acesso e vê ecos agrupados por aluno', () => {
  const dir = prepararAlunos();
  const { saida } = sessao(['Carla', '/professor', '1234', '1234'], dir);
  assert.match(saida, /Primeiro acesso ao modo professor/);
  assert.match(saida, /== Bruno \(1 eco\) ==\n {2}\[.+\] 2, 4, 8 → 16/);
  assert.match(saida, /== Ana \(2 ecos\) ==\n {2}\[.+\] abc → erro: .+\n {2}\[.+\] 3, 6, 9 → 12/);
  assert.doesNotMatch(saida, /1234/, 'o PIN não aparece na saída');
});

test('professor com PIN errado 3 vezes volta à sessão sem ver dados', () => {
  const dir = prepararAlunos();
  sessao(['Carla', '/professor', '1234', '1234'], dir);
  const { saida } = sessao(['Carla', '/professor', '0000', '1111', '2222', '3, 6, 9'], dir);
  assert.equal(saida.match(/PIN incorreto/g).length, 3);
  assert.match(saida, /Tentativas esgotadas/);
  assert.doesNotMatch(saida, /Bruno/);
  assert.match(saida, /O eco responde: 12/, 'a sessão continua');
});

test('PINs diferentes na definição não salvam nada', () => {
  const dir = prepararAlunos();
  const { saida } = sessao(['Carla', '/professor', '1234', '4321'], dir);
  assert.match(saida, /Os PINs não conferem/);
  assert.doesNotMatch(saida, /Bruno/);
});

test('administrador: sem confirmação nada é apagado; com APAGAR o histórico fica vazio', () => {
  const dir = prepararAlunos();
  const primeira = sessao(['Admin', '/admin', '9999', '9999', 'nao'], dir);
  assert.match(primeira.saida, /Isso vai apagar 3 memórias/);
  assert.match(primeira.saida, /Nada foi apagado/);
  assert.equal(JSON.parse(readFileSync(join(dir, 'memorias.json'), 'utf8')).ecos.length, 3);

  const segunda = sessao(['Admin', '/admin', '9999', 'APAGAR'], dir);
  assert.match(segunda.saida, /Todas as memórias foram apagadas/);
  assert.deepEqual(JSON.parse(readFileSync(join(dir, 'memorias.json'), 'utf8')).ecos, []);

  const log = readFileSync(join(dir, 'eco.log'), 'utf8');
  assert.match(log, /"evento":"memorias_apagadas"/);
  assert.doesNotMatch(log, /9999|Ana|Bruno/);
});

test('PIN do professor não abre o modo administrador', () => {
  const dir = prepararAlunos();
  sessao(['Carla', '/professor', '1234', '1234'], dir);
  sessao(['Admin', '/admin', '9999', '9999', 'nao'], dir);
  const { saida } = sessao(['Carla', '/admin', '1234', '1234', '1234'], dir);
  assert.match(saida, /Tentativas esgotadas/);
  assert.equal(JSON.parse(readFileSync(join(dir, 'memorias.json'), 'utf8')).ecos.length, 3);
});
