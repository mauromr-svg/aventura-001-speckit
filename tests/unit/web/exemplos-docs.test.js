import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInput } from '../../../src/core/parse-input.js';
import { predict } from '../../../src/core/predict.js';
import { exemplos } from '../../../web/docs/exemplos.js';

const padroes = ['constante', 'aritmetica', 'geometrica', 'fibonacci', 'polinomial'];

test('cada padrão tem pelo menos dois exemplos executáveis corretos', () => {
  for (const padrao of padroes) {
    const doPadrao = exemplos.filter((exemplo) => exemplo.padrao === padrao);
    assert.ok(doPadrao.length >= 2, `${padrao} tem ao menos dois exemplos`);
    for (const exemplo of doPadrao) {
      const entrada = parseInput(exemplo.entrada);
      assert.equal(entrada.ok, true, exemplo.entrada);
      const resultado = predict(entrada.sequencia);
      assert.equal(resultado.padrao, padrao, exemplo.entrada);
      assert.equal(resultado.proximo, exemplo.esperado, exemplo.entrada);
    }
  }
});
