import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { criarLeitor } from '../../src/cli/app.js';

function terminalFalso() {
  const entrada = new PassThrough();
  entrada.isTTY = true;
  entrada.setRawMode = () => entrada;
  const saida = new PassThrough();
  saida.isTTY = true;
  saida.columns = 80;
  let texto = '';
  saida.on('data', (d) => {
    texto += d;
  });
  return { entrada, saida, texto: () => texto };
}

test('no terminal, o PIN não aparece na tela nem fica no histórico', async () => {
  const t = terminalFalso();
  const leitor = criarLeitor(t.entrada, t.saida);

  const linha = leitor.lerLinha('eco> ');
  t.entrada.write('/professor\r');
  assert.equal(await linha, '/professor');

  const segredo = leitor.lerSegredo('PIN: ');
  t.entrada.write('4821\r');
  assert.equal(await segredo, '4821');

  assert.doesNotMatch(t.texto(), /4821/);
  assert.ok(!leitor.rl.history.includes('4821'), 'o PIN não pode ser recuperado com a seta para cima');
  assert.ok(leitor.rl.history.includes('/professor'), 'linhas comuns continuam no histórico');
  leitor.fechar();
});
