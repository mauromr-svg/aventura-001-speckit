import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = fileURLToPath(new URL('../../', import.meta.url));

export const novaPastaDeDados = () => mkdtempSync(join(tmpdir(), 'eco-dados-'));

/** Executa uma sessão completa do console com as linhas informadas. */
export function sessao(linhas, dir = novaPastaDeDados()) {
  const r = spawnSync(process.execPath, ['index.js'], {
    cwd: RAIZ,
    input: `${linhas.join('\n')}\n`,
    env: { ...process.env, ECO_DATA_DIR: dir },
    encoding: 'utf8',
    timeout: 20000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { saida: r.stdout, erro: r.stderr, codigo: r.status, dir };
}

/** Inicia o console sem fechar a entrada, para testes que interrompem o processo. */
export function sessaoAberta(dir) {
  const filho = spawn(process.execPath, ['index.js'], {
    cwd: RAIZ,
    env: { ...process.env, ECO_DATA_DIR: dir },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  filho.stdout.setEncoding('utf8');
  let saida = '';
  filho.stdout.on('data', (d) => {
    saida += d;
  });
  return {
    filho,
    escrever: (linha) => filho.stdin.write(`${linha}\n`),
    saida: () => saida,
    aguardar: (trecho, ms = 5000) =>
      new Promise((resolve, reject) => {
        const limite = Date.now() + ms;
        const verificar = () => {
          if (saida.includes(trecho)) return resolve();
          if (Date.now() > limite) return reject(new Error(`não apareceu: ${trecho}\n${saida}`));
          setTimeout(verificar, 20);
        };
        verificar();
      }),
    terminou: () => new Promise((resolve) => filho.on('exit', (codigo, sinal) => resolve({ codigo, sinal }))),
  };
}
