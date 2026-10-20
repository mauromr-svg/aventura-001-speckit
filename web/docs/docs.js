import { exemplos } from './exemplos.js';

const padrao = document.body.dataset.padrao;
const alvo = document.querySelector('#exemplos');
if (alvo && padrao) {
  const lista = document.createElement('ul');
  for (const exemplo of exemplos.filter((item) => item.padrao === padrao)) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const texto = `${exemplo.entrada} → ${exemplo.esperado}`;
    link.href = `../?seq=${encodeURIComponent(exemplo.entrada)}`;
    link.textContent = texto;
    link.dataset.esperado = exemplo.esperado;
    item.append(link);
    lista.append(item);
  }
  alvo.replaceChildren(lista);
}
