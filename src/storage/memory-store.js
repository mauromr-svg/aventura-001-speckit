import { copyFileSync, readFileSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { atomicWrite } from './atomic-write.js';

export const VERSAO_ESQUEMA = 1;
const MAX_ENTRADA = 4096;

const vazio = () => ({ versaoEsquema: VERSAO_ESQUEMA, ecos: [] });

const STATUS_VALIDOS = new Set(['ok', 'sem_padrao', 'invalido']);
const CAMPOS_TEXTO = ['id', 'aluno', 'criadoEm', 'entrada'];

const ecoValido = (eco) =>
  eco !== null &&
  typeof eco === 'object' &&
  CAMPOS_TEXTO.every((campo) => typeof eco[campo] === 'string') &&
  STATUS_VALIDOS.has(eco.status);

const arquivoValido = (dados) =>
  dados !== null && Number.isInteger(dados.versaoEsquema) && Array.isArray(dados.ecos) && dados.ecos.every(ecoValido);

function lerJson(caminho) {
  let texto;
  try {
    texto = readFileSync(caminho, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return { ausente: true };
    throw e;
  }
  try {
    const dados = JSON.parse(texto);
    if (arquivoValido(dados)) return { dados };
  } catch {
    // tratado abaixo como corrompido
  }
  return { corrompido: true };
}

export function createMemoryStore({ dir, logger }) {
  const caminho = join(dir, 'memorias.json');
  const backup = `${caminho}.bak`;
  let dados = vazio();
  let somenteLeitura = false;

  const guardarCopiaCorrompida = (origem) => copyFileSync(origem, `${origem}.corrompido-${Date.now()}`);

  const gravar = (opcoes) => {
    if (somenteLeitura) {
      const erro = new Error('versão de esquema desconhecida');
      erro.code = 'VERSAO_DESCONHECIDA';
      throw erro;
    }
    atomicWrite(caminho, JSON.stringify(dados, null, 2), opcoes);
  };

  return {
    /** @returns {null | 'restaurado' | 'recomecado' | 'versao_desconhecida'} aviso para o usuário */
    carregar() {
      const principal = lerJson(caminho);
      if (principal.ausente) {
        dados = vazio();
        return null;
      }
      if (principal.dados) {
        dados = principal.dados;
        if (dados.versaoEsquema > VERSAO_ESQUEMA) {
          somenteLeitura = true;
          logger.aviso('memorias_versao_desconhecida', { codigo: 'VERSAO_DESCONHECIDA' });
          return 'versao_desconhecida';
        }
        return null;
      }

      logger.erro('memorias_corrompidas', { codigo: 'JSON_INVALIDO' });
      guardarCopiaCorrompida(caminho);
      const reserva = lerJson(backup);
      let aviso;
      if (reserva.dados && reserva.dados.versaoEsquema <= VERSAO_ESQUEMA) {
        dados = reserva.dados;
        aviso = 'restaurado';
      } else {
        if (reserva.corrompido) guardarCopiaCorrompida(backup);
        dados = vazio();
        aviso = 'recomecado';
      }
      // Repara o principal sem sobrescrever o .bak com o arquivo corrompido.
      gravar({ backup: false });
      return aviso;
    },

    registrar({ aluno, entrada, quantidade, status, padrao = null, proximo = null, erro = null }) {
      const truncado = entrada.length > MAX_ENTRADA;
      const eco = {
        id: randomUUID(),
        aluno,
        criadoEm: new Date().toISOString(),
        entrada: truncado ? entrada.slice(0, MAX_ENTRADA) : entrada,
        quantidade,
        truncado,
        status,
        padrao: status === 'ok' ? padrao : null,
        proximo: status === 'ok' ? proximo : null,
        erro: status === 'invalido' ? erro : null,
      };
      dados.ecos.push(eco);
      try {
        gravar();
      } catch (e) {
        dados.ecos.pop();
        throw e;
      }
      return eco;
    },

    listarPorAluno(aluno) {
      return dados.ecos.filter((e) => e.aluno === aluno).reverse();
    },

    listarTodos() {
      return [...dados.ecos].reverse();
    },

    apagarTudo() {
      const anteriores = dados.ecos;
      dados.ecos = [];
      try {
        gravar({ backup: false });
      } catch (e) {
        dados.ecos = anteriores;
        throw e;
      }
      rmSync(backup, { force: true });
    },
  };
}
