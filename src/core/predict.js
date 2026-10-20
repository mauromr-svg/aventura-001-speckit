import { fracao, formatar } from './exact-number.js';
import { constante } from './patterns/constant.js';
import { aritmetica } from './patterns/arithmetic.js';
import { geometrica } from './patterns/geometric.js';
import { fibonacci } from './patterns/fibonacci.js';
import { polinomial } from './patterns/polynomial.js';

/** Ordem de precedência fixa: o primeiro padrão que explica toda a sequência vence. */
export const PADROES = [
  ['constante', constante],
  ['aritmetica', aritmetica],
  ['geometrica', geometrica],
  ['fibonacci', fibonacci],
  ['polinomial', polinomial],
];

/**
 * @param {{ valores: bigint[], casas: number }} sequencia valores inteiros escalados por 10^casas
 * @returns {{ status: 'ok', padrao: string, grau?: number, proximo: string } | { status: 'sem_padrao' }}
 */
export function predict({ valores, casas }) {
  const escala = 10n ** BigInt(casas);
  for (const [padrao, detectar] of PADROES) {
    const r = detectar(valores);
    if (r) {
      const proximo = formatar(fracao(r.proximo.num, r.proximo.den * escala));
      return r.grau === undefined ? { status: 'ok', padrao, proximo } : { status: 'ok', padrao, grau: r.grau, proximo };
    }
  }
  return { status: 'sem_padrao' };
}
