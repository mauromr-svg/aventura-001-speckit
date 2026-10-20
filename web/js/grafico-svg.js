const SVG_NS = 'http://www.w3.org/2000/svg';
const LARGURA = 720;
const ALTURA = 300;
const MARGEM = { topo: 24, direita: 24, baixo: 42, esquerda: 52 };

function svgElemento(tag, atributos = {}) {
  const elemento = document.createElementNS(SVG_NS, tag);
  for (const [nome, valor] of Object.entries(atributos)) elemento.setAttribute(nome, String(valor));
  return elemento;
}

function textoSvg(texto, x, y, classe) {
  const elemento = svgElemento('text', { x, y, class: classe });
  elemento.textContent = texto;
  return elemento;
}

export function desenharGrafico(dados) {
  const svg = svgElemento('svg', {
    viewBox: `0 0 ${LARGURA} ${ALTURA}`,
    role: 'img',
    'aria-label': 'Gráfico da sequência numérica e do próximo valor',
  });
  const titulo = svgElemento('title');
  titulo.textContent = `Gráfico com ${dados.quantidade ?? dados.pontos.length} números${dados.previsao ? ' e a previsão' : ''}`;
  svg.append(titulo);
  if (dados.foraDeEscala || dados.pontos.length === 0) return svg;

  const area = {
    x: MARGEM.esquerda,
    y: MARGEM.topo,
    largura: LARGURA - MARGEM.esquerda - MARGEM.direita,
    altura: ALTURA - MARGEM.topo - MARGEM.baixo,
  };
  const indiceMaximo = Math.max(dados.pontos.at(-1).indice, dados.previsao?.indice ?? 0, 2);
  const valorX = (indice) => area.x + ((indice - 1) / (indiceMaximo - 1)) * area.largura;
  const valorY = (valor) => area.y + ((dados.maximo - valor) / (dados.maximo - dados.minimo)) * area.altura;

  for (let linha = 0; linha <= 4; linha++) {
    const valor = dados.minimo + ((dados.maximo - dados.minimo) * linha) / 4;
    const y = valorY(valor);
    svg.append(svgElemento('line', { x1: area.x, y1: y, x2: area.x + area.largura, y2: y, class: 'grade' }));
    svg.append(textoSvg(Number(valor.toPrecision(5)).toString(), area.x - 8, y + 4, 'rotulo-eixo'));
  }
  svg.append(svgElemento('line', { x1: area.x, y1: area.y + area.altura, x2: area.x + area.largura, y2: area.y + area.altura, class: 'eixo' }));

  const caminho = dados.pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${valorX(p.indice)} ${valorY(p.valor)}`).join(' ');
  svg.append(svgElemento('path', { d: caminho, class: 'linha-sequencia', fill: 'none' }));
  for (const ponto of dados.pontos) {
    const marcador = svgElemento('circle', {
      cx: valorX(ponto.indice), cy: valorY(ponto.valor), r: 5, class: 'ponto',
      'aria-label': `Termo ${ponto.indice}: ${ponto.valor}`,
    });
    svg.append(marcador);
  }
  if (dados.previsao) {
    const x = valorX(dados.previsao.indice);
    const y = valorY(dados.previsao.valor);
    const marcador = svgElemento('circle', {
      cx: x, cy: y, r: 7, class: 'previsao',
      'aria-label': `Previsão: ${dados.previsao.rotulo}`,
    });
    const rotulo = textoSvg(dados.previsao.rotulo, x, y - 12, 'rotulo-previsao');
    svg.append(marcador, rotulo);
  }
  return svg;
}
