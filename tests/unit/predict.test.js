import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInput } from '../../src/core/parse-input.js';
import { predict } from '../../src/core/predict.js';

const prever = (entrada) => predict(parseInput(entrada).sequencia);

test('precedência: constante vence aritmética e geométrica', () => {
  assert.equal(prever('5, 5, 5, 5').padrao, 'constante');
});

test('precedência: aritmética antes de polinomial', () => {
  assert.equal(prever('3, 6, 9, 12').padrao, 'aritmetica');
});

test('precedência: 2, 4, 8 → geométrica 16', () => {
  assert.deepEqual(prever('2, 4, 8'), { status: 'ok', padrao: 'geometrica', proximo: '16' });
});

test('Fibonacci antes de polinomial', () => {
  assert.equal(prever('1, 1, 2, 3, 5').padrao, 'fibonacci');
});

test('polinomial informa o grau', () => {
  assert.deepEqual(prever('1, 4, 9, 16'), { status: 'ok', padrao: 'polinomial', grau: 2, proximo: '25' });
});

test('sem padrão não devolve número', () => {
  assert.deepEqual(prever('3, 1, 4, 1, 5'), { status: 'sem_padrao' });
});

test('mesma entrada sempre gera o mesmo resultado', () => {
  const a = prever('1, 8, 27, 64, 125');
  for (let i = 0; i < 20; i++) assert.deepEqual(prever('1, 8, 27, 64, 125'), a);
});

test('o núcleo não importa console, armazenamento nem logs', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const pasta = new URL('../../src/core/', import.meta.url);
  const arquivos = [
    ...readdirSync(pasta).filter((f) => f.endsWith('.js')).map((f) => new URL(f, pasta)),
    ...readdirSync(new URL('patterns/', pasta)).map((f) => new URL(`patterns/${f}`, pasta)),
  ];
  for (const arquivo of arquivos) {
    assert.doesNotMatch(readFileSync(arquivo, 'utf8'), /from ['"](\.\.\/)+(cli|storage|logging)\/|from ['"]node:(fs|readline|net|http)/);
  }
});

test('1.000 números respondem em menos de 1 s', () => {
  const entrada = Array.from({ length: 1000 }, (_, i) => i * 3).join(', ');
  const inicio = performance.now();
  assert.equal(prever(entrada).proximo, '3000');
  assert.ok(performance.now() - inicio < 1000);
});

test('1.000.000 de números respondem em menos de 5 s', () => {
  const entrada = Array.from({ length: 1_000_000 }, (_, i) => i + 1).join(' ');
  const inicio = performance.now();
  assert.equal(prever(entrada).proximo, '1000001');
  assert.ok(performance.now() - inicio < 5000);
});

test('1.000.000 de números sem padrão respondem em menos de 5 s', () => {
  const entrada = Array.from({ length: 1_000_000 }, (_, i) => (i * 7919) % 1000).join(' ');
  const inicio = performance.now();
  assert.equal(prever(entrada).status, 'sem_padrao');
  assert.ok(performance.now() - inicio < 5000);
});
