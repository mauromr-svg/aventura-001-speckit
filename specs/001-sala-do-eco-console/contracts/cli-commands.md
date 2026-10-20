# Contrato: Interface de Console

Executável: `node index.js` (sem argumentos). Interface interativa, uma linha por entrada, em português do Brasil. Funciona também com a entrada padrão redirecionada (a sessão termina no fim da entrada).

## Abertura

1. Exibe uma mensagem de boas-vindas e um resumo de uso (como informar a sequência e quais comandos existem).
2. Pergunta o nome ou apelido do aluno (1 a 40 caracteres). Entrada vazia ou inválida repete a pergunta.

## Entrada de sequência

Qualquer linha que não comece com `/` é tratada como sequência. Formatos:

| Entrada | Interpretação |
|---|---|
| `3, 6, 9, 12` | vírgula e/ou espaços separam os números |
| `3 6 9 12` | espaços separam os números |
| `1,5; 3; 4,5` | com `;`, ele separa e vírgula/ponto são decimais |
| `1.5, 3, 4.5` | ponto é decimal |

## Saídas de uma sequência

| Situação | Saída (texto de exemplo) | Código interno |
|---|---|---|
| Padrão encontrado | `O eco responde: 15` e uma linha com o padrão (`Padrão: progressão aritmética`) | `ok` |
| Sem padrão | `O eco não encontrou um padrão nessa sequência.` | `sem_padrao` |
| Entrada vazia | `Sussurre pelo menos dois números.` | `ENTRADA_VAZIA` |
| Texto não numérico | `"abc" (item 4) não é um número. Use apenas números.` | `NUMERO_INVALIDO` |
| Poucos números | `Preciso de pelo menos 2 números para ouvir o eco.` | `QUANTIDADE_INSUFICIENTE` |
| Entrada gigante | `Essa sequência é grande demais.` | `ENTRADA_MUITO_GRANDE` |

Os textos são exemplos; a redação final fica em `src/cli/messages.pt-br.js`. A saída de erro nunca exibe rastros de pilha.

## Comandos

| Comando | Perfil | Efeito |
|---|---|---|
| `/ajuda` | todos | Exibe formatos aceitos e comandos |
| `/historico` | aluno | Lista as memórias do aluno atual, da mais recente para a mais antiga |
| `/professor` | professor | Pede o PIN; lista as memórias de todos os alunos agrupadas por aluno, com sequência, resultado ou erro e data e hora |
| `/admin` | administrador | Pede o PIN; apaga todas as memórias após a confirmação exata `APAGAR` |
| `/sair` | todos | Encerra com uma despedida |

Regras comuns:
- Comando desconhecido: `Não conheço esse comando. Digite /ajuda.`
- PIN: 3 tentativas por pedido, com atraso crescente entre elas; depois volta à sessão. No primeiro uso do comando, o programa pede para definir o PIN (4 a 8 dígitos) com confirmação.
- A digitação do PIN não é exibida na tela.
- Código de saída do processo: `0` em encerramento normal; `1` em falha fatal (ex.: pasta de dados sem permissão de escrita), com mensagem em português.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `ECO_DATA_DIR` | `./dados` | Pasta de memórias, configuração e logs |
