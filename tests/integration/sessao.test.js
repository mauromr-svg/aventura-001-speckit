import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { main } from '../../src/cli/app.js';
import { sessao, novaPastaDeDados } from './helpers.js';

test('falha inesperada em uma linha não encerra a sessão', async () => {
  let texto = '';
  let falhou = false;
  const saida = {
    write(parte) {
      if (!falhou && parte.includes('O eco responde: 12')) {
        falhou = true;
        throw new Error('falha simulada');
      }
      texto += parte;
      return true;
    },
  };
  const entrada = Readable.from(['Ana\n3, 6, 9\n2, 4, 8\n']);

  const codigo = await main({ entrada, saida, dir: novaPastaDeDados() });
  assert.equal(codigo, 0);
  assert.match(texto, /Ocorreu um erro inesperado/);
  assert.match(texto, /O eco responde: 16/, 'a sequência seguinte foi processada');
  assert.doesNotMatch(texto, /falha simulada|\n\s+at /);
});

test('várias sequências, ajuda, comando desconhecido e saída', () => {
  const { saida, codigo } = sessao(['Ana', '3, 6, 9', '2, 4, 8', '/ajuda', '/comando-x', '/sair', '1, 2, 3']);
  assert.equal(codigo, 0);
  assert.match(saida, /O eco responde: 12\n/);
  assert.match(saida, /O eco responde: 16\n/);
  assert.equal(saida.match(/Como sussurrar:/g).length, 2);
  assert.match(saida, /Não conheço esse comando\. Digite \/ajuda\./);
  assert.match(saida, /O eco se despede/);
  assert.doesNotMatch(saida, /O eco responde: 4\n/, 'nada é processado depois de /sair');
});

test('fim da entrada encerra com código 0', () => {
  const { codigo } = sessao(['Ana', '3, 6, 9']);
  assert.equal(codigo, 0);
});

test('1.000.000 de números pelo console', () => {
  const sequencia = Array.from({ length: 1_000_000 }, (_, i) => i + 1).join(' ');
  const inicio = performance.now();
  const { saida } = sessao(['Ana', sequencia]);
  assert.match(saida, /O eco responde: 1000001\n/);
  assert.ok(performance.now() - inicio < 10000);
});
