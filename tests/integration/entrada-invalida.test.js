import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessao } from './helpers.js';

test('entradas inválidas geram mensagens em português e a sessão continua', () => {
  const { saida, erro, codigo } = sessao(['Ana', 'abc', '', '5', '1,5; 3; 4,5', '3, 6, 9']);
  assert.equal(codigo, 0);
  assert.match(saida, /"abc" \(item 1\) não é um número/);
  assert.match(saida, /Sussurre pelo menos dois números/);
  assert.match(saida, /Preciso de pelo menos 2 números/);
  assert.match(saida, /O eco responde: 6\n/);
  assert.match(saida, /O eco responde: 12\n/);
  assert.doesNotMatch(saida + erro, /\n\s+at /);
});

test('mensagem do exemplo 10, 20, 30, abc indica o item 4', () => {
  const { saida } = sessao(['Ana', '10, 20, 30, abc']);
  assert.match(saida, /"abc" \(item 4\) não é um número/);
});

test('sem padrão: avisa e não devolve número', () => {
  const { saida } = sessao(['Ana', '3, 1, 4, 1, 5']);
  assert.match(saida, /não encontrou um padrão/);
  assert.doesNotMatch(saida, /O eco responde/);
});

test('mostra o padrão junto com a resposta', () => {
  const { saida } = sessao(['Ana', '3, 6, 9, 12']);
  assert.match(saida, /O eco responde: 15\nPadrão: progressão aritmética/);
});

test('nome inválido é pedido de novo', () => {
  const { saida } = sessao(['', 'x'.repeat(41), 'Ana', '2, 4']);
  assert.equal(saida.match(/Use de 1 a 40 caracteres/g).length, 2);
  assert.match(saida, /Olá, Ana!/);
});
