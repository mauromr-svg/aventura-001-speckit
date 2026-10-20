import { chmodSync, closeSync, copyFileSync, fsyncSync, mkdirSync, openSync, renameSync, rmSync, writeSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';

/**
 * Grava em um temporário na mesma pasta, faz fsync e troca por rename,
 * para que uma interrupção nunca deixe o arquivo pela metade.
 */
export function atomicWrite(caminho, conteudo, { backup = true, modo } = {}) {
  const pasta = dirname(caminho);
  mkdirSync(pasta, { recursive: true });
  const temporario = `${caminho}.${process.pid}.${randomUUID()}.tmp`;

  try {
    const fd = openSync(temporario, 'wx', modo ?? 0o666);
    try {
      writeSync(fd, conteudo);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    if (backup) {
      try {
        copyFileSync(caminho, `${caminho}.bak`);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    renameSync(temporario, caminho);
  } catch (e) {
    rmSync(temporario, { force: true });
    throw e;
  }

  if (modo !== undefined) {
    try {
      chmodSync(caminho, modo);
    } catch {
      // Nem todo sistema de arquivos suporta permissões POSIX.
    }
  }
  try {
    const fdPasta = openSync(pasta, 'r');
    try {
      fsyncSync(fdPasta);
    } finally {
      closeSync(fdPasta);
    }
  } catch {
    // fsync de diretório não é suportado em todas as plataformas (ex.: Windows).
  }
}
