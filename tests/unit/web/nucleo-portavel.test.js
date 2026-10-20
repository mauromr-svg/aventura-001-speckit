import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const raiz = new URL('../../../src/core/', import.meta.url);
const arquivos = [
  ...readdirSync(raiz).filter((nome) => nome.endsWith('.js')).map((nome) => new URL(nome, raiz)),
  ...readdirSync(new URL('patterns/', raiz)).map((nome) => new URL(`patterns/${nome}`, raiz)),
  new URL('../../../src/cli/messages.pt-br.js', import.meta.url),
];

test('núcleo e mensagens não dependem de APIs exclusivas do Node.js', () => {
  for (const arquivo of arquivos) {
    const fonte = readFileSync(arquivo, 'utf8');
    assert.doesNotMatch(fonte, /\bBuffer\b|\bprocess\b|from\s+['"]node:/, arquivo.pathname);
  }
});
