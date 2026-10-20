import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLogger } from '../../src/logging/logger.js';

const novaPasta = () => mkdtempSync(join(tmpdir(), 'eco-log-'));
const linhas = (dir) => readFileSync(join(dir, 'eco.log'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));

test('grava JSON Lines com campos fixos e opcionais', () => {
  const dir = novaPasta();
  const log = createLogger({ dir });
  log.info('eco_registrado', { status: 'ok' });
  log.erro('memorias_corrompidas', { codigo: 'JSON_INVALIDO' });
  const [a, b] = linhas(dir);
  assert.equal(a.nivel, 'info');
  assert.equal(a.evento, 'eco_registrado');
  assert.equal(a.status, 'ok');
  assert.ok(!Number.isNaN(Date.parse(a.ts)));
  assert.equal(b.nivel, 'erro');
  assert.equal(b.codigo, 'JSON_INVALIDO');
});

test('descarta campos não permitidos (sequências, apelidos, PINs)', () => {
  const dir = novaPasta();
  createLogger({ dir }).aviso('teste', { entrada: '3, 6, 9', aluno: 'Ana', pin: '1234', codigo: 'X' });
  const [a] = linhas(dir);
  assert.deepEqual(Object.keys(a).sort(), ['codigo', 'evento', 'nivel', 'ts']);
});

test('rotaciona para eco.log.1 ao passar de 1 MiB', () => {
  const dir = novaPasta();
  writeFileSync(join(dir, 'eco.log'), 'x'.repeat(1024 * 1024 + 1));
  createLogger({ dir }).info('depois_da_rotacao');
  assert.ok(existsSync(join(dir, 'eco.log.1')));
  assert.equal(linhas(dir).length, 1);
});

test('cria a pasta se ela não existir', () => {
  const dir = join(novaPasta(), 'sub', 'pasta');
  createLogger({ dir }).info('ok');
  assert.equal(linhas(dir).length, 1);
});
