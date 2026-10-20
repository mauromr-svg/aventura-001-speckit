import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularEco } from '../../../web/js/calcular-eco.js';
import { mensagens } from '../../../src/cli/messages.pt-br.js';

const exemplos = [
  ['3, 6, 9, 12', 'ok', 'aritmetica', '15'],
  ['1, 4, 9, 16', 'ok', 'polinomial', '25'],
  ['2, 4, 8', 'ok', 'geometrica', '16'],
  ['2, 4', 'ok', 'aritmetica', '6'],
  ['1, 1, 2, 3, 5', 'ok', 'fibonacci', '8'],
  ['1,5; 3; 4,5', 'ok', 'aritmetica', '6'],
  ['5', 'invalido', null, null],
  ['10, 20, 30, abc', 'invalido', null, null],
  ['3, 1, 4, 1, 5', 'sem_padrao', null, null],
];

for (const [entrada, status, padrao, proximo] of exemplos) {
  test(`${entrada}: mesmo resultado do núcleo`, () => {
    const r = calcularEco(entrada);
    assert.equal(r.status, status);
    assert.equal(r.padrao ?? null, padrao);
    assert.equal(r.proximo ?? null, proximo);
    if (status === 'ok') {
      assert.equal(r.mensagem, mensagens.resposta(proximo, padrao, r.grau));
    } else if (status === 'sem_padrao') {
      assert.equal(r.mensagem, mensagens.semPadrao());
    } else {
      assert.equal(r.mensagem, mensagens[r.erro](r.detalhe));
    }
  });
}

test('quantidade e detalhes do token inválido permanecem intactos', () => {
  assert.equal(calcularEco('3, 6, 9').quantidade, 3);
  assert.deepEqual(calcularEco('10, 20, 30, abc').detalhe, { token: 'abc', posicao: 4 });
});
