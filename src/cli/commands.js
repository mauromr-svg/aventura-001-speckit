import { pinValido } from '../storage/pin-store.js';
import { mensagens } from './messages.pt-br.js';

const MAX_TENTATIVAS = 3;
const ATRASO_BASE_MS = 500;
const MAX_ENTRADA_EXIBIDA = 60;

const resumirEntrada = (entrada) =>
  entrada.length > MAX_ENTRADA_EXIBIDA ? `${entrada.slice(0, MAX_ENTRADA_EXIBIDA)}…` : entrada;

function resultadoDoEco(eco) {
  if (eco.status === 'ok') return eco.proximo;
  if (eco.status === 'sem_padrao') return mensagens.resultadoSemPadrao();
  return mensagens.resultadoErro(eco.erro);
}

export function formatarEco(eco) {
  const data = new Date(eco.criadoEm).toLocaleString('pt-BR');
  return mensagens.linhaEco(data, resumirEntrada(eco.entrada), resultadoDoEco(eco));
}

/**
 * @param {object} ctx
 * @param {(texto: string) => void} ctx.escrever
 * @param {(prompt: string) => Promise<string | null>} ctx.lerLinha
 * @param {(prompt: string) => Promise<string | null>} ctx.lerSegredo lê sem mostrar a digitação
 * @param {string} ctx.aluno
 * @param {object} ctx.store memórias (ver storage/memory-store.js)
 * @param {object} ctx.pinStore PINs (ver storage/pin-store.js)
 * @param {object} ctx.logger
 * @param {(ms: number) => Promise<void>} [ctx.esperar]
 * @returns {{ executar(linha: string): Promise<'sair' | undefined> }}
 */
export function criarComandos(ctx) {
  const esperar = ctx.esperar ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));

  async function definirPrimeiroPin(perfil) {
    ctx.escrever(mensagens.primeiroAcesso(perfil));
    const pin = await ctx.lerSegredo(mensagens.pedirNovoPin());
    if (pin === null) return false;
    if (!pinValido(pin.trim())) {
      ctx.escrever(mensagens.pinFormatoInvalido());
      return false;
    }
    const confirmacao = await ctx.lerSegredo(mensagens.confirmarPin());
    if (confirmacao === null || confirmacao.trim() !== pin.trim()) {
      ctx.escrever(mensagens.pinsDiferentes());
      return false;
    }
    ctx.pinStore.definirPin(perfil, pin.trim());
    ctx.logger.info('pin_definido', { codigo: perfil });
    ctx.escrever(mensagens.pinDefinido());
    return true;
  }

  async function autenticar(perfil) {
    try {
      if (!ctx.pinStore.temPin(perfil)) return await definirPrimeiroPin(perfil);
      for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
        const pin = await ctx.lerSegredo(mensagens.pedirPin());
        if (pin === null) return false;
        if (ctx.pinStore.verificarPin(perfil, pin.trim())) return true;
        ctx.escrever(mensagens.pinIncorreto());
        if (tentativa < MAX_TENTATIVAS) await esperar(ATRASO_BASE_MS * 2 ** (tentativa - 1));
      }
      ctx.logger.aviso('pin_bloqueado', { codigo: perfil });
      ctx.escrever(mensagens.pinBloqueado());
      return false;
    } catch (e) {
      ctx.logger.erro('pin_indisponivel', { codigo: e.code });
      ctx.escrever(mensagens.configInvalida());
      return false;
    }
  }

  const comandos = {
    '/ajuda': async () => ctx.escrever(mensagens.ajuda()),

    '/historico': async () => {
      const ecos = ctx.store.listarPorAluno(ctx.aluno);
      if (ecos.length === 0) {
        ctx.escrever(mensagens.historicoVazio());
        return;
      }
      ctx.escrever(mensagens.historicoTitulo(ctx.aluno));
      for (const eco of ecos) ctx.escrever(formatarEco(eco));
    },

    '/professor': async () => {
      if (!(await autenticar('professor'))) return;
      ctx.logger.info('modo_professor');
      const porAluno = new Map();
      for (const eco of ctx.store.listarTodos()) {
        if (!porAluno.has(eco.aluno)) porAluno.set(eco.aluno, []);
        porAluno.get(eco.aluno).push(eco);
      }
      if (porAluno.size === 0) {
        ctx.escrever(mensagens.semMemorias());
        return;
      }
      for (const [aluno, ecos] of porAluno) {
        ctx.escrever(mensagens.tituloAluno(aluno, ecos.length));
        for (const eco of ecos) ctx.escrever(formatarEco(eco));
      }
    },

    '/admin': async () => {
      if (!(await autenticar('admin'))) return;
      const total = ctx.store.listarTodos().length;
      const resposta = await ctx.lerLinha(mensagens.confirmarApagar(total));
      if (resposta?.trim() !== 'APAGAR') {
        ctx.escrever(mensagens.nadaApagado());
        return;
      }
      try {
        ctx.store.apagarTudo();
      } catch (e) {
        ctx.logger.erro('memorias_nao_apagadas', { codigo: e.code });
        ctx.escrever(mensagens.erroInesperado());
        return;
      }
      ctx.logger.aviso('memorias_apagadas');
      ctx.escrever(mensagens.memoriasApagadas());
    },

    '/sair': async () => {
      ctx.escrever(mensagens.despedida());
      return 'sair';
    },
  };

  return {
    async executar(linha) {
      const nome = linha.trim().split(/\s+/)[0].toLowerCase();
      const comando = Object.hasOwn(comandos, nome) ? comandos[nome] : null;
      if (!comando) {
        ctx.escrever(mensagens.comandoDesconhecido());
        return undefined;
      }
      return comando();
    },
  };
}
