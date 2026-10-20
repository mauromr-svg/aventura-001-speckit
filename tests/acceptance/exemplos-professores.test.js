import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInput } from '../../src/core/parse-input.js';
import { predict } from '../../src/core/predict.js';

// Exemplos oficiais dos professores (seção 8 de requisitos/requisitos.md).
const exemplos = [
  ['3, 6, 9, 12', '15'],
  ['1, 4, 9, 16', '25'],
  ['2, 4, 8', '16'],
  ['2, 4', '6'],
  ['1, 1, 2, 3, 5', '8'],
  ['1,5; 3; 4,5', '6'],
];

for (const [entrada, esperado] of exemplos) {
  test(`${entrada} → ${esperado}`, () => {
    const lido = parseInput(entrada);
    assert.equal(lido.ok, true);
    const r = predict(lido.sequencia);
    assert.equal(r.status, 'ok');
    assert.equal(r.proximo, esperado);
  });
}

test('5 → erro', () => {
  assert.equal(parseInput('5').erro, 'QUANTIDADE_INSUFICIENTE');
});

test('10, 20, 30, abc → erro indicando abc', () => {
  const r = parseInput('10, 20, 30, abc');
  assert.equal(r.erro, 'NUMERO_INVALIDO');
  assert.equal(r.detalhe.token, 'abc');
});
