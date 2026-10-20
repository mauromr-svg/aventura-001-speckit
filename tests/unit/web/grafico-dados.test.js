import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInput } from '../../../src/core/parse-input.js';
import { prepararGrafico } from '../../../web/js/grafico-dados.js';

const sequencia = (texto) => parseInput(texto).sequencia;

test('inclui pontos da entrada e previsão na posição seguinte', () => {
  const g = prepararGrafico(sequencia('1, 4, 9, 16'), '25');
  assert.deepEqual(g.pontos.map((p) => [p.indice, p.valor]), [[1, 1], [2, 4], [3, 9], [4, 16]]);
  assert.deepEqual(g.previsao, { indice: 5, valor: 25, rotulo: '25' });
  assert.equal(g.minimo, 1);
  assert.equal(g.maximo, 25);
});

test('valor fracionário tem coordenada aproximada e rótulo exato', () => {
  const g = prepararGrafico(sequencia('9, 6, 4'), '8/3');
  assert.ok(Math.abs(g.previsao.valor - 2.6666667) < 1e-6);
  assert.equal(g.previsao.rotulo, '8/3');
});

test('sem previsão não cria marcador de previsão', () => {
  const g = prepararGrafico(sequencia('3, 1, 4, 1, 5'), null);
  assert.equal(g.previsao, null);
});

test('reduz 1.000.000 de pontos a no máximo 1.000 e mantém extremos', () => {
  const valores = Array.from({ length: 1_000_000 }, (_, i) => BigInt(i));
  const g = prepararGrafico({ valores, casas: 0 }, '1000000');
  assert.ok(g.pontos.length <= 1000);
  assert.equal(g.reduzido, true);
  assert.deepEqual(g.pontos[0], { indice: 1, valor: 0 });
  assert.deepEqual(g.pontos.at(-1), { indice: 1_000_000, valor: 999_999 });
  assert.equal(g.previsao.indice, 1_000_001);
});

test('valores acima de ±1e300 indicam fora de escala', () => {
  const g = prepararGrafico(sequencia('1' + '0'.repeat(301) + ', 2' + '0'.repeat(301)), null);
  assert.equal(g.foraDeEscala, true);
});

test('inclui previsão nos limites e evita escala degenerada', () => {
  const g = prepararGrafico(sequencia('7, 7, 7'), '7');
  assert.ok(g.minimo < 7);
  assert.ok(g.maximo > 7);
});
