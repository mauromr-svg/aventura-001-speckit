import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LIMITE_BYTES = 1024 * 1024;
const CAMPOS_OPCIONAIS = ['codigo', 'status'];

export function pastaDeDados() {
  return process.env.ECO_DATA_DIR || 'dados';
}

/** Logs em JSON Lines; nunca grava campos fora da lista permitida, para não vazar dados de alunos. */
export function createLogger({ dir = pastaDeDados() } = {}) {
  const caminho = join(dir, 'eco.log');

  function registrar(nivel, evento, extras = {}) {
    const linha = { ts: new Date().toISOString(), nivel, evento };
    for (const campo of CAMPOS_OPCIONAIS) {
      if (extras[campo] !== undefined) linha[campo] = extras[campo];
    }
    try {
      mkdirSync(dir, { recursive: true });
      try {
        if (statSync(caminho).size > LIMITE_BYTES) renameSync(caminho, `${caminho}.1`);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
      appendFileSync(caminho, `${JSON.stringify(linha)}\n`);
    } catch {
      // Falha de log não pode interromper o aluno.
    }
  }

  return {
    info: (evento, extras) => registrar('info', evento, extras),
    aviso: (evento, extras) => registrar('aviso', evento, extras),
    erro: (evento, extras) => registrar('erro', evento, extras),
  };
}
