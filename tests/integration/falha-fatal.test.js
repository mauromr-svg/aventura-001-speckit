import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sessao, novaPastaDeDados } from './helpers.js';

test('pasta de dados inutilizável encerra com código 1 e mensagem em português', () => {
  // Um arquivo no lugar da pasta falha mesmo quando o teste roda como root.
  const arquivo = join(novaPastaDeDados(), 'nao-e-pasta');
  writeFileSync(arquivo, '');

  const { codigo, saida, erro } = sessao(['Ana', '3, 6, 9'], arquivo);
  assert.equal(codigo, 1);
  assert.match(erro, /Não foi possível usar a pasta de dados/);
  assert.doesNotMatch(saida + erro, /\n\s+at |Error:/);
});
