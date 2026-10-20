# Quickstart: Validação da Sala do Eco (versão console)

Guia de validação ponta a ponta. Contratos: [cli-commands.md](contracts/cli-commands.md) e [storage-schema.md](contracts/storage-schema.md). Entidades: [data-model.md](data-model.md).

## Pré-requisitos

- Node.js 22 ou superior (`node --version`)
- Dependências de desenvolvimento instaladas: `npm install`

## Execução

```bash
node index.js
```

Para usar uma pasta de dados temporária durante a validação:

```bash
ECO_DATA_DIR=$(mktemp -d) node index.js
```

## Cenários de validação

| # | Passos | Resultado esperado |
|---|---|---|
| 1 | Nome `Ana`; sequência `3, 6, 9, 12` | Eco `15`, padrão aritmético |
| 2 | `1, 4, 9, 16` | `25`, padrão polinomial (grau 2) |
| 3 | `2, 4, 8` | `16`, padrão geométrico |
| 4 | `2, 4` | `6`, padrão aritmético |
| 5 | `1, 1, 2, 3, 5` | `8`, padrão Fibonacci |
| 6 | `1,5; 3; 4,5` | `6` |
| 7 | `5` | Mensagem de quantidade insuficiente |
| 8 | `10, 20, 30, abc` | Mensagem indicando que `abc` (item 4) não é um número |
| 9 | Entrada vazia | Pede uma sequência; o programa continua |
| 10 | `3, 1, 4, 1, 5` | Mensagem de que não há padrão, sem número |
| 11 | Duas sequências seguidas, depois `/sair` | Duas respostas independentes e despedida |
| 12 | Fechar e reabrir com a mesma pasta de dados; `/historico` | Ecos anteriores listados, do mais recente ao mais antigo, com erros e sem-padrão |
| 13 | `/professor`, definir PIN, repetir PIN | Ecos agrupados por aluno |
| 14 | `/admin`, definir PIN; responder `nao` à confirmação | Nada é apagado |
| 15 | `/admin`, PIN correto, confirmação `APAGAR` | Histórico fica vazio |
| 16 | `/professor` com PIN errado 3 vezes | Volta à sessão sem mostrar dados |
| 17 | Interromper com `Ctrl+C` após um eco e reabrir | O eco continua no histórico |
| 18 | `{ echo Ana; seq 1 1000000 \| tr '\n' ' '; echo; } \| node index.js` | Resposta em até 5 segundos |

Observação sobre o cenário 18: com a entrada redirecionada, a primeira linha é o nome do aluno e a segunda é a sequência.

## Testes automatizados

```bash
npm test        # unitários, integração e aceitação (node --test)
npm run lint    # ESLint
npm audit       # sem vulnerabilidades altas ou críticas
```

Critério de pronto: todos os exemplos oficiais da seção 8 de requisitos.md passam em `tests/acceptance`, e os 18 cenários acima se comportam como descrito.
