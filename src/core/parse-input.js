import { parseDecimal, escalar } from './exact-number.js';

export const LIMITE_BYTES = 16 * 1024 * 1024;
const MAX_TOKEN_EXIBIDO = 30;
const NUMERO_SEM_PONTO_E_VIRGULA = /^[+-]?\d+(\.\d+)?$/;
const NUMERO_COM_PONTO_E_VIRGULA = /^[+-]?\d+([.,]\d+)?$/;

const falha = (erro, detalhe) => ({ ok: false, erro, detalhe });

/**
 * Lê a sequência digitada pelo aluno.
 * Com ";" na entrada, ele é o único separador e vírgula ou ponto são decimais;
 * sem ";", vírgulas e espaços separam e só o ponto é decimal.
 */
export function parseInput(texto) {
  if (typeof texto !== 'string') return falha('ENTRADA_VAZIA');
  if (texto.length * 3 > LIMITE_BYTES && new TextEncoder().encode(texto).length > LIMITE_BYTES) {
    return falha('ENTRADA_MUITO_GRANDE');
  }

  const comPontoEVirgula = texto.includes(';');
  const formato = comPontoEVirgula ? NUMERO_COM_PONTO_E_VIRGULA : NUMERO_SEM_PONTO_E_VIRGULA;
  const tokens = texto
    .split(comPontoEVirgula ? ';' : /[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t !== '');

  if (tokens.length === 0) return falha('ENTRADA_VAZIA');

  for (let i = 0; i < tokens.length; i++) {
    if (!formato.test(tokens[i])) {
      const token = tokens[i].length > MAX_TOKEN_EXIBIDO ? `${tokens[i].slice(0, MAX_TOKEN_EXIBIDO)}…` : tokens[i];
      return falha('NUMERO_INVALIDO', { token, posicao: i + 1 });
    }
  }

  if (tokens.length < 2) return falha('QUANTIDADE_INSUFICIENTE', { quantidade: tokens.length });

  const { valores, casas } = escalar(tokens.map(parseDecimal));
  return { ok: true, sequencia: { valores, casas, quantidade: valores.length } };
}
