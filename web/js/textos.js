export { mensagens, nomeDoPadrao } from '../../src/cli/messages.pt-br.js';

export const textosWeb = {
  ouvindo: 'Ouvindo…',
  armazenamentoFalhou: 'Não consegui guardar esta memória. O eco e o gráfico continuam disponíveis nesta sessão.',
  armazenamentoPersistenteFalhou: 'O navegador pode remover estas memórias se os dados do site forem apagados.',
  memoriasDanificadas: (quantidade) => `${quantidade} memória(s) danificada(s) não puderam ser abertas.`,
  entradaTruncada: 'A entrada original era longa demais; o histórico guarda apenas os primeiros 4.096 caracteres.',
  graficoReduzido: 'A sequência é longa; alguns pontos foram resumidos para manter o gráfico legível.',
  valoresForaDeEscala: 'Os valores são grandes demais para desenhar; a resposta exata continua disponível.',
  previsaoGrafico: (valor) => `Previsão: ${valor}`,
  historicoVazio: 'Seus próximos ecos aparecerão aqui.',
  semMemorias: 'Ainda não há ecos guardados neste navegador.',
  nomeInvalido: 'Use de 1 a 40 caracteres, sem caracteres de controle.',
  workerFalhou: 'O eco encontrou um problema ao calcular. Tente novamente.',
  semArmazenamento: 'O armazenamento deste navegador está indisponível. Você ainda pode ouvir o eco.',
  armazenamentoCheio: 'O navegador está sem espaço para guardar esta memória. Libere espaço e tente novamente.',
  armazenamentoAtualizado: 'Outro eco chegou a esta sala.',
};
