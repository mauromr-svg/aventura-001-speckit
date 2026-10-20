const GRAU_MINIMO = 2;
const GRAU_MAXIMO = 5;

const diferencas = (v) => {
  const d = new Array(v.length - 1);
  for (let i = 1; i < v.length; i++) d[i - 1] = v[i] - v[i - 1];
  return d;
};

const todosIguais = (v) => v.every((x) => x === v[0]);

/**
 * Menor grau k (2 a 5) em que a k-ésima diferença é constante.
 * Exige k + 2 números para que haja ao menos uma confirmação além do ajuste.
 */
export function polinomial(v) {
  const ultimos = [v[v.length - 1]];
  let atual = v;
  for (let grau = 1; grau <= GRAU_MAXIMO; grau++) {
    if (v.length < grau + 2) return null;
    atual = diferencas(atual);
    ultimos.push(atual[atual.length - 1]);
    if (!todosIguais(atual)) continue;
    // Grau 1 é progressão aritmética, tratada por outro padrão.
    if (grau < GRAU_MINIMO) return null;
    const proximo = ultimos.reduce((soma, x) => soma + x, 0n);
    return { proximo: { num: proximo, den: 1n }, grau };
  }
  return null;
}
