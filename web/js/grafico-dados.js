const LIMITE_PONTOS = 1000;
const LIMITE_ESCALA = 1e300;

function valorNumerico(texto) {
  if (typeof texto !== 'string') return null;
  if (texto.includes('/')) {
    const [num, den] = texto.split('/').map(Number);
    return den === 0 || !Number.isFinite(num) || !Number.isFinite(den) ? null : num / den;
  }
  const valor = Number(texto);
  return Number.isFinite(valor) ? valor : null;
}

function reduzir(pontos) {
  if (pontos.length <= LIMITE_PONTOS) return { pontos, reduzido: false };
  const baldes = Math.floor((LIMITE_PONTOS - 2) / 2);
  const interior = pontos.slice(1, -1);
  const saida = [pontos[0]];
  for (let balde = 0; balde < baldes; balde++) {
    const inicio = Math.floor((balde * interior.length) / baldes);
    const fim = Math.floor(((balde + 1) * interior.length) / baldes);
    const grupo = interior.slice(inicio, Math.max(inicio + 1, fim));
    let menor = grupo[0];
    let maior = grupo[0];
    for (const ponto of grupo) {
      if (ponto.valor < menor.valor) menor = ponto;
      if (ponto.valor > maior.valor) maior = ponto;
    }
    if (menor.indice < maior.indice) saida.push(menor, maior);
    else if (menor.indice > maior.indice) saida.push(maior, menor);
    else saida.push(menor);
  }
  saida.push(pontos.at(-1));
  return { pontos: saida.slice(0, LIMITE_PONTOS), reduzido: true };
}

export function prepararGrafico({ valores, casas }, proximo = null) {
  const pontosCompletos = [];
  for (let i = 0; i < valores.length; i++) {
    const valor = Number(valores[i]) / 10 ** casas;
    if (!Number.isFinite(valor) || Math.abs(valor) > LIMITE_ESCALA) {
      return { pontos: [], previsao: null, reduzido: false, foraDeEscala: true, minimo: null, maximo: null, quantidade: valores.length };
    }
    pontosCompletos.push({ indice: i + 1, valor });
  }

  const previsaoValor = valorNumerico(proximo);
  if (proximo !== null && (previsaoValor === null || Math.abs(previsaoValor) > LIMITE_ESCALA)) {
    return { pontos: [], previsao: null, reduzido: false, foraDeEscala: true, minimo: null, maximo: null, quantidade: valores.length };
  }
  const previsao = previsaoValor === null ? null : {
    indice: valores.length + 1,
    valor: previsaoValor,
    rotulo: proximo,
  };
  let minimo = pontosCompletos[0].valor;
  let maximo = pontosCompletos[0].valor;
  for (const ponto of pontosCompletos) {
    if (ponto.valor < minimo) minimo = ponto.valor;
    if (ponto.valor > maximo) maximo = ponto.valor;
  }
  if (previsao) {
    if (previsao.valor < minimo) minimo = previsao.valor;
    if (previsao.valor > maximo) maximo = previsao.valor;
  }
  if (minimo === maximo) {
    const margem = Math.max(Math.abs(minimo) * 0.1, 1);
    minimo -= margem;
    maximo += margem;
  }
  const { pontos, reduzido } = reduzir(pontosCompletos);
  return { pontos, previsao, reduzido, foraDeEscala: false, minimo, maximo, quantidade: valores.length };
}
