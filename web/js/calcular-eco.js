import { parseInput } from '../../src/core/parse-input.js';
import { predict } from '../../src/core/predict.js';
import { mensagens } from '../../src/cli/messages.pt-br.js';
import { prepararGrafico } from './grafico-dados.js';

export function calcularEco(texto) {
  const entrada = parseInput(texto);
  if (!entrada.ok) {
    const detalhe = entrada.detalhe ?? {};
    return {
      status: 'invalido',
      erro: entrada.erro,
      detalhe,
      quantidade: detalhe.quantidade ?? 0,
      mensagem: mensagens[entrada.erro](detalhe),
    };
  }
  const previsao = predict(entrada.sequencia);
  if (previsao.status === 'sem_padrao') {
    return {
      ...previsao,
      quantidade: entrada.sequencia.quantidade,
      mensagem: mensagens.semPadrao(),
      grafico: prepararGrafico(entrada.sequencia),
    };
  }
  return {
    ...previsao,
    quantidade: entrada.sequencia.quantidade,
    mensagem: mensagens.resposta(previsao.proximo, previsao.padrao, previsao.grau),
    grafico: prepararGrafico(entrada.sequencia, previsao.proximo),
  };
}
