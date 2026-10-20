import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPinStore } from '../../src/storage/pin-store.js';

const novaPasta = () => mkdtempSync(join(tmpdir(), 'eco-pin-'));

test('aceita só PIN de 4 a 8 dígitos', () => {
  const store = createPinStore({ dir: novaPasta() });
  for (const invalido of ['123', '123456789', 'abcd', '12 34', '', '１２３４']) {
    assert.throws(() => store.definirPin('professor', invalido), { code: 'PIN_FORMATO' }, invalido);
  }
  store.definirPin('professor', '1234');
  store.definirPin('admin', '12345678');
});

test('salva hash scrypt com sal de 16 bytes, nunca o PIN em texto puro', () => {
  const dir = novaPasta();
  createPinStore({ dir }).definirPin('professor', '4821');
  const texto = readFileSync(join(dir, 'config.json'), 'utf8');
  assert.doesNotMatch(texto, /4821/);
  const config = JSON.parse(texto);
  assert.equal(config.versaoEsquema, 1);
  assert.equal(Buffer.from(config.pinProfessor.sal, 'base64').length, 16);
  assert.ok(Buffer.from(config.pinProfessor.hash, 'base64').length >= 32);
  assert.equal(config.pinAdmin, undefined);
});

test('verifica PIN correto e recusa errado', () => {
  const dir = novaPasta();
  createPinStore({ dir }).definirPin('professor', '4821');
  const store = createPinStore({ dir });
  assert.equal(store.temPin('professor'), true);
  assert.equal(store.verificarPin('professor', '4821'), true);
  assert.equal(store.verificarPin('professor', '4822'), false);
  assert.equal(store.verificarPin('professor', 'x'), false);
});

test('PINs de professor e administrador são independentes', () => {
  const store = createPinStore({ dir: novaPasta() });
  store.definirPin('professor', '1111');
  assert.equal(store.temPin('admin'), false);
  assert.equal(store.verificarPin('admin', '1111'), false);
  store.definirPin('admin', '2222');
  assert.equal(store.verificarPin('admin', '1111'), false);
  assert.equal(store.verificarPin('admin', '2222'), true);
});

test('dois PINs iguais geram hashes diferentes (sal aleatório)', () => {
  const dir = novaPasta();
  const store = createPinStore({ dir });
  store.definirPin('professor', '1234');
  store.definirPin('admin', '1234');
  const config = JSON.parse(readFileSync(join(dir, 'config.json'), 'utf8'));
  assert.notEqual(config.pinProfessor.hash, config.pinAdmin.hash);
});

test('config.json corrompido gera erro, sem permitir redefinir o PIN', () => {
  const dir = novaPasta();
  writeFileSync(join(dir, 'config.json'), '{ quebrado');
  assert.throws(() => createPinStore({ dir }).temPin('professor'), { code: 'CONFIG_INVALIDA' });
});

test('config.json só pode ser lido pelo dono', { skip: process.platform === 'win32' }, () => {
  const dir = novaPasta();
  createPinStore({ dir }).definirPin('professor', '1234');
  assert.equal(statSync(join(dir, 'config.json')).mode & 0o777, 0o600);
});
