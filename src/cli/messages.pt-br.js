const NOMES_PADRAO = {
  constante: 'sequência constante',
  aritmetica: 'progressão aritmética',
  geometrica: 'progressão geométrica',
  fibonacci: 'sequência de Fibonacci (cada termo é a soma dos dois anteriores)',
};

const ROTULOS_DE_ERRO = {
  NUMERO_INVALIDO: 'tem algo que não é número',
  QUANTIDADE_INSUFICIENTE: 'poucos números',
  ENTRADA_MUITO_GRANDE: 'sequência grande demais',
};

export function nomeDoPadrao(padrao, grau) {
  if (padrao === 'polinomial') return `sequência polinomial de grau ${grau}`;
  return NOMES_PADRAO[padrao] ?? padrao;
}

export const mensagens = {
  boasVindas: () =>
    [
      '',
      '~ Bem-vindo à Sala do Eco ~',
      'Sussurre uma sequência de números e a sala devolverá o próximo, como um eco mágico.',
      '',
    ].join('\n'),

  ajuda: () =>
    [
      'Como sussurrar:',
      '  3, 6, 9, 12      números separados por vírgula ou espaço',
      '  1.5, 3, 4.5      decimais com ponto',
      '  1,5; 3; 4,5      ou use ponto e vírgula para separar e vírgula como decimal',
      'Com 2 números, o eco supõe uma progressão aritmética.',
      'Com 3 ou mais, ele reconhece progressões aritméticas e geométricas; com 4 ou mais,',
      'também Fibonacci e sequências polinomiais (como 1, 4, 9, 16).',
      '',
      'Comandos:',
      '  /ajuda       mostra esta ajuda',
      '  /historico   mostra suas memórias',
      '  /professor   mostra as memórias de todos os alunos (pede PIN)',
      '  /admin       apaga todas as memórias (pede PIN)',
      '  /sair        sai da Sala do Eco',
      '',
    ].join('\n'),

  pedirNome: () => 'Qual é o seu nome ou apelido? ',
  nomeInvalido: () => 'Use de 1 a 40 caracteres, sem caracteres especiais de controle.',
  saudacao: (nome) => `Olá, ${nome}! Pode sussurrar sua sequência.`,
  prompt: () => 'eco> ',

  resposta: (proximo, padrao, grau) => `O eco responde: ${proximo}\nPadrão: ${nomeDoPadrao(padrao, grau)}`,
  semPadrao: () => 'O eco não encontrou um padrão nessa sequência. Confira os números e tente de novo.',

  ENTRADA_VAZIA: () => 'Sussurre pelo menos dois números, por exemplo: 3, 6, 9.',
  NUMERO_INVALIDO: ({ token, posicao }) => `"${token}" (item ${posicao}) não é um número. Use apenas números, como 3, 6, 9.`,
  QUANTIDADE_INSUFICIENTE: () => 'Preciso de pelo menos 2 números para ouvir o eco.',
  ENTRADA_MUITO_GRANDE: () => 'Essa sequência é grande demais. O limite é de 16 MiB de texto.',

  comandoDesconhecido: () => 'Não conheço esse comando. Digite /ajuda.',
  despedida: () => 'O eco se despede. Até a próxima!',

  memoriaNaoSalva: () => 'Atenção: não consegui guardar esta memória. Avise o professor.',
  memoriasRestauradas: () => 'Atenção: o arquivo de memórias estava danificado e foi restaurado da cópia de segurança.',
  memoriasRecomecadas: () =>
    'Atenção: o arquivo de memórias estava danificado e não havia cópia válida. Uma cópia do arquivo danificado foi guardada e um novo histórico foi iniciado.',
  versaoDesconhecida: () =>
    'Atenção: o arquivo de memórias foi criado por uma versão mais nova do programa. Novas memórias não serão gravadas.',
  falhaFatal: (pasta) => `Não foi possível usar a pasta de dados "${pasta}". Verifique se ela existe e se há permissão de escrita.`,
  erroInesperado: () => 'Ocorreu um erro inesperado. Tente de novo ou avise o professor.',

  historicoVazio: () => 'Você ainda não tem memórias.',
  historicoTitulo: (nome) => `Memórias de ${nome} (da mais recente para a mais antiga):`,
  semMemorias: () => 'Ainda não há memórias guardadas.',
  tituloAluno: (nome, total) => `== ${nome} (${total} ${total === 1 ? 'eco' : 'ecos'}) ==`,
  linhaEco: (data, entrada, resultado) => `  [${data}] ${entrada} → ${resultado}`,
  resultadoSemPadrao: () => 'sem padrão',
  resultadoErro: (codigo) => `erro: ${ROTULOS_DE_ERRO[codigo] ?? codigo}`,

  primeiroAcesso: (perfil) => `Primeiro acesso ao modo ${perfil}: defina um PIN de 4 a 8 dígitos.`,
  pedirNovoPin: () => 'Novo PIN: ',
  confirmarPin: () => 'Confirme o PIN: ',
  pinFormatoInvalido: () => 'O PIN deve ter de 4 a 8 dígitos.',
  pinsDiferentes: () => 'Os PINs não conferem. Nada foi alterado.',
  pinDefinido: () => 'PIN definido.',
  pedirPin: () => 'PIN: ',
  pinIncorreto: () => 'PIN incorreto.',
  pinBloqueado: () => 'Tentativas esgotadas. Voltando à Sala do Eco.',
  configInvalida: () => 'O arquivo de configuração está danificado. Peça ajuda à equipe de TI.',

  confirmarApagar: (total) => `Isso vai apagar ${total} ${total === 1 ? 'memória' : 'memórias'}. Digite APAGAR para confirmar: `,
  memoriasApagadas: () => 'Todas as memórias foram apagadas.',
  nadaApagado: () => 'Nada foi apagado.',
};
