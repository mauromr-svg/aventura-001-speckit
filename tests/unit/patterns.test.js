import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseInput } from '../../src/core/parse-input.js';
import { formatar, fracao } from '../../src/core/exact-number.js';
import { constante } from '../../src/core/patterns/constant.js';
import { aritmetica } from '../../src/core/patterns/arithmetic.js';
import { geometrica } from '../../src/core/patterns/geometric.js';
import { fibonacci } from '../../src/core/patterns/fibonacci.js';
import { polinomial } from '../../src/core/patterns/polynomial.js';

/** Aplica o padrão sobre a entrada e devolve o próximo número formatado, ou null. */
function proximo(padrao, entrada) {
  const { valores, casas } = parseInput(entrada).sequencia;
  const r = padrao(valores);
  if (!r) return null;
  return formatar(fracao(r.proximo.num, r.proximo.den * 10n ** BigInt(casas)));
}

describe('constante', () => {
  test('7, 7, 7 → 7', () => assert.equal(proximo(constante, '7, 7, 7'), '7'));
  test('vale com 2 números', () => assert.equal(proximo(constante, '4, 4'), '4'));
  test('não reconhece 1, 2, 3', () => assert.equal(proximo(constante, '1, 2, 3'), null));
});

describe('aritmética', () => {
  test('-3, 0, 3 → 6', () => assert.equal(proximo(aritmetica, '-3, 0, 3'), '6'));
  test('0.1, 0.2, 0.3 → 0.4 exato', () => assert.equal(proximo(aritmetica, '0.1, 0.2, 0.3'), '0.4'));
  test('vale com 2 números', () => assert.equal(proximo(aritmetica, '2, 4'), '6'));
  test('decrescente', () => assert.equal(proximo(aritmetica, '10, 7, 4'), '1'));
  test('não reconhece 2, 4, 8', () => assert.equal(proximo(aritmetica, '2, 4, 8'), null));
});

describe('geométrica', () => {
  test('3, -6, 12 → -24', () => assert.equal(proximo(geometrica, '3, -6, 12'), '-24'));
  test('8, 4, 2 → 1', () => assert.equal(proximo(geometrica, '8, 4, 2'), '1'));
  test('4, 6, 9 → 13.5', () => assert.equal(proximo(geometrica, '4, 6, 9'), '13.5'));
  test('9, 6, 4 → 8/3', () => assert.equal(proximo(geometrica, '9, 6, 4'), '8/3'));
  test('rejeita termo zero', () => assert.equal(proximo(geometrica, '0, 0, 0'), null));
  test('exige 3 números', () => assert.equal(proximo(geometrica, '2, 4'), null));
});

describe('Fibonacci', () => {
  test('1, 1, 2, 3, 5 → 8', () => assert.equal(proximo(fibonacci, '1, 1, 2, 3, 5'), '8'));
  test('2, 5, 7, 12 → 19', () => assert.equal(proximo(fibonacci, '2, 5, 7, 12'), '19'));
  test('exige 4 números: 1, 1, 2 não é Fibonacci', () => assert.equal(proximo(fibonacci, '1, 1, 2'), null));
  test('não reconhece 1, 1, 2, 4', () => assert.equal(proximo(fibonacci, '1, 1, 2, 4'), null));
});

describe('polinomial', () => {
  test('1, 4, 9, 16 → 25 (grau 2)', () => {
    assert.equal(proximo(polinomial, '1, 4, 9, 16'), '25');
    assert.equal(polinomial([1n, 4n, 9n, 16n]).grau, 2);
  });
  test('1, 8, 27, 64, 125 → 216 (grau 3)', () => {
    assert.equal(proximo(polinomial, '1, 8, 27, 64, 125'), '216');
    assert.equal(polinomial([1n, 8n, 27n, 64n, 125n]).grau, 3);
  });
  test('grau 5 com 7 números', () => {
    const quintas = [1, 2, 3, 4, 5, 6, 7].map((n) => n ** 5).join(', ');
    assert.equal(proximo(polinomial, quintas), String(8 ** 5));
  });
  test('grau 2 exige 4 números', () => assert.equal(proximo(polinomial, '1, 4, 9'), null));
  test('não aceita grau acima de 5', () => {
    const sextas = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => n ** 6).join(', ');
    assert.equal(proximo(polinomial, sextas), null);
  });
});
