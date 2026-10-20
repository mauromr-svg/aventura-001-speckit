import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessao, sessaoAberta, novaPastaDeDados } from './helpers.js';

test('memórias sobrevivem ao fechar e reabrir o programa', () => {
  const dir = novaPastaDeDados();
  sessao(['Ana', '3, 6, 9', 'abc', '/sair'], dir);
  const { saida } = sessao(['Ana', '/historico'], dir);
  const posInvalido = saida.indexOf('abc → erro');
  const posOk = saida.indexOf('3, 6, 9 → 12');
  assert.ok(posInvalido > 0 && posOk > 0, saida);
  assert.ok(posInvalido < posOk, 'o mais recente aparece primeiro');
  assert.match(saida, /sem padrão|erro: /);
});

test('histórico mostra só as memórias do aluno atual', () => {
  const dir = novaPastaDeDados();
  sessao(['Ana', '3, 6, 9'], dir);
  sessao(['Bruno', '2, 4, 8'], dir);
  const { saida } = sessao(['Ana', '/historico'], dir);
  assert.match(saida, /3, 6, 9 → 12/);
  assert.doesNotMatch(saida, /2, 4, 8/);
});

test('aluno sem memórias recebe aviso', () => {
  const { saida } = sessao(['Ana', '/historico']);
  assert.match(saida, /ainda não tem memórias/);
});

test('interrupção com SIGINT após um eco mantém a memória', async () => {
  const dir = novaPastaDeDados();
  const s = sessaoAberta(dir);
  s.escrever('Ana');
  s.escrever('3, 6, 9');
  await s.aguardar('O eco responde: 12');
  const fim = s.terminou();
  s.filho.kill('SIGINT');
  const { codigo } = await fim;
  assert.equal(codigo, 0);

  const { saida } = sessao(['Ana', '/historico'], dir);
  assert.match(saida, /3, 6, 9 → 12/);
});
