import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { atomicWrite } from '../../src/storage/atomic-write.js';

const novaPasta = () => mkdtempSync(join(tmpdir(), 'eco-atomico-'));

test('grava o conteúdo no destino', () => {
  const arquivo = join(novaPasta(), 'a.json');
  atomicWrite(arquivo, '{"x":1}');
  assert.equal(readFileSync(arquivo, 'utf8'), '{"x":1}');
});

test('copia o arquivo anterior para .bak', () => {
  const arquivo = join(novaPasta(), 'a.json');
  atomicWrite(arquivo, 'v1');
  atomicWrite(arquivo, 'v2');
  assert.equal(readFileSync(arquivo, 'utf8'), 'v2');
  assert.equal(readFileSync(`${arquivo}.bak`, 'utf8'), 'v1');
});

test('sem backup quando pedido', () => {
  const arquivo = join(novaPasta(), 'a.json');
  atomicWrite(arquivo, 'v1');
  atomicWrite(arquivo, 'v2', { backup: false });
  assert.equal(existsSync(`${arquivo}.bak`), false);
});

test('falha no meio da escrita deixa o original intacto e não deixa temporários', () => {
  const pasta = novaPasta();
  const arquivo = join(pasta, 'a.json');
  writeFileSync(arquivo, 'original');
  assert.throws(() => atomicWrite(arquivo, Symbol('conteúdo inválido')));
  assert.equal(readFileSync(arquivo, 'utf8'), 'original');
  assert.deepEqual(readdirSync(pasta), ['a.json']);
});

test('aplica permissão restrita quando pedida', { skip: process.platform === 'win32' }, async () => {
  const { statSync } = await import('node:fs');
  const arquivo = join(novaPasta(), 'c.json');
  atomicWrite(arquivo, '{}', { modo: 0o600 });
  assert.equal(statSync(arquivo).mode & 0o777, 0o600);
});
