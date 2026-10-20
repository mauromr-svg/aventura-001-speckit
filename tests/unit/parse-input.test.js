import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseInput } from '../../src/core/parse-input.js';

describe('analisador básico', () => {
  test('separa por vírgula e espaços', () => {
    const r = parseInput('3, 6, 9, 12');
    assert.equal(r.ok, true);
    assert.deepEqual(r.sequencia, { valores: [3n, 6n, 9n, 12n], casas: 0, quantidade: 4 });
  });

  test('separa só por espaços', () => {
    const r = parseInput('3 6 9 12');
    assert.equal(r.ok, true);
    assert.equal(r.sequencia.quantidade, 4);
  });

  test('aceita decimais com ponto e negativos', () => {
    const r = parseInput('1.5, -3, 4.5');
    assert.equal(r.ok, true);
    assert.deepEqual(r.sequencia, { valores: [15n, -30n, 45n], casas: 1, quantidade: 3 });
  });

  test('sem ponto e vírgula, a vírgula é separador', () => {
    const r = parseInput('1,5');
    assert.equal(r.ok, true);
    assert.deepEqual(r.sequencia.valores, [1n, 5n]);
  });

  test('não usa eval, Function nem Number() para validar', () => {
    const fonte = readFileSync(new URL('../../src/core/parse-input.js', import.meta.url), 'utf8');
    assert.doesNotMatch(fonte, /\beval\s*\(|\bFunction\s*\(|\bNumber\s*\(/);
  });
});

describe('formatos e erros', () => {
  test('com ponto e vírgula, a vírgula é decimal', () => {
    const r = parseInput('1,5; 3; 4,5');
    assert.equal(r.ok, true);
    assert.deepEqual(r.sequencia, { valores: [15n, 30n, 45n], casas: 1, quantidade: 3 });
  });

  test('com ponto e vírgula, o ponto também é decimal', () => {
    const r = parseInput('1.5;3;4.5');
    assert.equal(r.ok, true);
    assert.deepEqual(r.sequencia.valores, [15n, 30n, 45n]);
  });

  test('tolera espaços extras e separadores repetidos', () => {
    assert.deepEqual(parseInput('  3 ,, 6 ,  9  ').sequencia.valores, [3n, 6n, 9n]);
    assert.deepEqual(parseInput('3;;6; ;9').sequencia.valores, [3n, 6n, 9n]);
  });

  test('texto não numérico gera NUMERO_INVALIDO com token e posição', () => {
    const r = parseInput('10, 20, 30, abc');
    assert.deepEqual(r, { ok: false, erro: 'NUMERO_INVALIDO', detalhe: { token: 'abc', posicao: 4 } });
  });

  test('um único número gera QUANTIDADE_INSUFICIENTE', () => {
    const r = parseInput('5');
    assert.equal(r.ok, false);
    assert.equal(r.erro, 'QUANTIDADE_INSUFICIENTE');
  });

  test('vazio ou só separadores gera ENTRADA_VAZIA', () => {
    for (const entrada of ['', '   ', ',,,', ' ; ; ']) {
      assert.equal(parseInput(entrada).erro, 'ENTRADA_VAZIA', JSON.stringify(entrada));
    }
  });

  test('mais de 16 MiB gera ENTRADA_MUITO_GRANDE', () => {
    const r = parseInput('1 '.repeat(8 * 1024 * 1024 + 1));
    assert.equal(r.erro, 'ENTRADA_MUITO_GRANDE');
  });

  test('rejeita notação científica, NaN, Infinity e comandos', () => {
    for (const entrada of ['1e3, 2, 3', 'NaN, 1, 2', 'Infinity, 1, 2', '1; DROP', '0x10, 1, 2', '1.5., 2, 3']) {
      assert.equal(parseInput(entrada).erro, 'NUMERO_INVALIDO', entrada);
    }
  });

  test('token inválido muito longo é encurtado no detalhe', () => {
    const r = parseInput(`1, 2, ${'x'.repeat(200)}`);
    assert.ok(r.detalhe.token.length <= 31);
  });
});
