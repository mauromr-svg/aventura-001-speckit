import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDecimal, escalar, fracao, formatar } from '../../src/core/exact-number.js';

test('parseDecimal lê inteiros, negativos e decimais com ponto ou vírgula', () => {
  assert.deepEqual(parseDecimal('3'), { digitos: 3n, casas: 0 });
  assert.deepEqual(parseDecimal('-3'), { digitos: -3n, casas: 0 });
  assert.deepEqual(parseDecimal('+7'), { digitos: 7n, casas: 0 });
  assert.deepEqual(parseDecimal('1.5'), { digitos: 15n, casas: 1 });
  assert.deepEqual(parseDecimal('1,5'), { digitos: 15n, casas: 1 });
  assert.deepEqual(parseDecimal('-0,25'), { digitos: -25n, casas: 2 });
});

test('escalar coloca todos os números na mesma escala', () => {
  const r = escalar([parseDecimal('1.5'), parseDecimal('3'), parseDecimal('4.25')]);
  assert.equal(r.casas, 2);
  assert.deepEqual(r.valores, [150n, 300n, 425n]);
});

test('fracao reduz e normaliza o sinal', () => {
  assert.deepEqual(fracao(10n, 4n), { num: 5n, den: 2n });
  assert.deepEqual(fracao(3n, -6n), { num: -1n, den: 2n });
  assert.deepEqual(fracao(0n, 7n), { num: 0n, den: 1n });
});

test('formatar mostra decimal exato ou fração', () => {
  assert.equal(formatar(fracao(15n, 1n)), '15');
  assert.equal(formatar(fracao(60n, 10n)), '6');
  assert.equal(formatar(fracao(-1n, 2n)), '-0.5');
  assert.equal(formatar(fracao(9n, 2n)), '4.5');
  assert.equal(formatar(fracao(1n, 40n)), '0.025');
  assert.equal(formatar(fracao(10n, 3n)), '10/3');
  assert.equal(formatar(fracao(-10n, 3n)), '-10/3');
});

test('números com 30 dígitos não perdem precisão', () => {
  const n = '123456789012345678901234567890';
  const { digitos } = parseDecimal(n);
  assert.equal(formatar(fracao(digitos + 1n, 1n)), '123456789012345678901234567891');
});
