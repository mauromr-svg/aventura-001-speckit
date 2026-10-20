import { accessSync, constants, mkdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { parseInput } from '../core/parse-input.js';
import { predict } from '../core/predict.js';
import { createLogger, pastaDeDados } from '../logging/logger.js';
import { createMemoryStore } from '../storage/memory-store.js';
import { createPinStore } from '../storage/pin-store.js';
import { criarComandos } from './commands.js';
import { mensagens } from './messages.pt-br.js';

const NOME_VALIDO = /^[^\p{Cc}]{1,40}$/u;

/** Leitor de linhas que funciona tanto no terminal quanto com entrada redirecionada. */
export function criarLeitor(entrada, saida) {
  let mudo = false;
  const saidaRl = new Writable({
    write(chunk, _enc, cb) {
      if (!mudo) saida.write(chunk);
      cb();
    },
  });
  saidaRl.isTTY = saida.isTTY;
  saidaRl.columns = saida.columns;

  const terminal = Boolean(entrada.isTTY && saida.isTTY);
  const rl = createInterface({ input: entrada, output: saidaRl, terminal, crlfDelay: Infinity });
  const linhas = rl[Symbol.asyncIterator]();
  let fechado = false;
  rl.on('close', () => {
    fechado = true;
  });

  // Depois do fim da entrada o iterador ainda entrega as linhas já recebidas; só o prompt muda.
  function mostrarPrompt(prompt) {
    if (fechado) {
      if (!mudo) saida.write(prompt);
      return;
    }
    rl.setPrompt(prompt);
    rl.prompt();
  }

  async function lerLinha(prompt = '') {
    mostrarPrompt(prompt);
    const { value, done } = await linhas.next();
    return done ? null : value;
  }

  // Esconde a digitação (PIN) no terminal; com entrada redirecionada não há eco.
  async function lerSegredo(prompt) {
    mostrarPrompt(prompt);
    mudo = true;
    try {
      const { value, done } = await linhas.next();
      if (done) return null;
      // Sem isso, a seta para cima no próximo prompt revelaria o PIN.
      for (let i = rl.history.indexOf(value); i !== -1; i = rl.history.indexOf(value)) rl.history.splice(i, 1);
      return value;
    } finally {
      mudo = false;
      saida.write('\n');
    }
  }

  return { rl, lerLinha, lerSegredo, fechar: () => rl.close() };
}

const AVISOS_DE_CARGA = {
  restaurado: mensagens.memoriasRestauradas,
  recomecado: mensagens.memoriasRecomecadas,
  versao_desconhecida: mensagens.versaoDesconhecida,
};

/** Grava a memória antes de mostrar a resposta, para que uma interrupção não a perca. */
function guardar(eco, { store, logger, escrever }) {
  try {
    store.registrar(eco);
  } catch (e) {
    logger.erro('memoria_nao_salva', { codigo: e.code ?? 'ERRO_ESCRITA' });
    escrever(mensagens.memoriaNaoSalva());
  }
}

function processarSequencia(linha, { aluno, escrever, logger, store }) {
  const lido = parseInput(linha);
  if (!lido.ok) {
    logger.aviso('entrada_invalida', { codigo: lido.erro });
    // Linha vazia não é uma tentativa de eco; não vira memória.
    if (lido.erro !== 'ENTRADA_VAZIA') {
      guardar({ aluno, entrada: linha.trim(), quantidade: 0, status: 'invalido', erro: lido.erro }, { store, logger, escrever });
    }
    escrever(mensagens[lido.erro](lido.detalhe));
    return;
  }

  const r = predict(lido.sequencia);
  guardar(
    { aluno, entrada: linha.trim(), quantidade: lido.sequencia.quantidade, status: r.status, padrao: r.padrao, proximo: r.proximo },
    { store, logger, escrever },
  );
  logger.info('eco_registrado', { status: r.status });
  escrever(r.status === 'ok' ? mensagens.resposta(r.proximo, r.padrao, r.grau) : mensagens.semPadrao());
}

export async function main({ entrada = process.stdin, saida = process.stdout, dir = pastaDeDados() } = {}) {
  const escrever = (texto) => saida.write(`${texto}\n`);

  try {
    mkdirSync(dir, { recursive: true });
    accessSync(dir, constants.W_OK);
  } catch {
    process.stderr.write(`${mensagens.falhaFatal(dir)}\n`);
    return 1;
  }

  const logger = createLogger({ dir });
  const store = createMemoryStore({ dir, logger });
  let avisoDeCarga;
  try {
    avisoDeCarga = store.carregar();
  } catch (e) {
    logger.erro('memorias_inacessiveis', { codigo: e.code });
    process.stderr.write(`${mensagens.falhaFatal(dir)}\n`);
    return 1;
  }

  const leitor = criarLeitor(entrada, saida);
  leitor.rl.on('SIGINT', () => {
    escrever(`\n${mensagens.despedida()}`);
    leitor.fechar();
  });

  try {
    logger.info('sessao_iniciada');
    escrever(mensagens.boasVindas());
    escrever(mensagens.ajuda());
    if (avisoDeCarga) escrever(AVISOS_DE_CARGA[avisoDeCarga]());

    let aluno = null;
    while (aluno === null) {
      const linha = await leitor.lerLinha(mensagens.pedirNome());
      if (linha === null) return 0;
      const nome = linha.trim();
      if (NOME_VALIDO.test(nome)) aluno = nome;
      else escrever(mensagens.nomeInvalido());
    }
    escrever(mensagens.saudacao(aluno));

    const comandos = criarComandos({
      escrever,
      lerLinha: leitor.lerLinha,
      lerSegredo: leitor.lerSegredo,
      aluno,
      store,
      pinStore: createPinStore({ dir }),
      logger,
    });

    for (;;) {
      const linha = await leitor.lerLinha(mensagens.prompt());
      if (linha === null) break;
      try {
        if (linha.trimStart().startsWith('/')) {
          if ((await comandos.executar(linha)) === 'sair') break;
          continue;
        }
        processarSequencia(linha, { aluno, escrever, logger, store });
      } catch {
        logger.erro('erro_inesperado');
        escrever(mensagens.erroInesperado());
      }
    }
    return 0;
  } catch {
    logger.erro('erro_inesperado');
    escrever(mensagens.erroInesperado());
    return 1;
  } finally {
    leitor.fechar();
    logger.info('sessao_encerrada');
  }
}
