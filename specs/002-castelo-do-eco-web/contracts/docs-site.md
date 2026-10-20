# Contrato: Site de Documentação

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `web/docs/index.html` | Apresentação e lista dos cinco padrões, com link para cada página e para a precedência |
| `web/docs/precedencia.html` | Ordem em que o eco testa os padrões, por que `2, 4, 8` resulta em `16`, quantidade mínima de números por padrão, regra de 2 números |
| `web/docs/constante.html` | Definição e exemplos |
| `web/docs/aritmetica.html` | Definição (razão = diferença), exemplos com negativos e decimais |
| `web/docs/geometrica.html` | Definição (razão = quociente), exemplo com resultado em fração |
| `web/docs/fibonacci.html` | Definição (soma dos dois anteriores), mínimo de 4 números |
| `web/docs/polinomial.html` | Diferenças sucessivas, graus de 2 a 5, exemplo dos quadrados e dos cubos |

## Exemplos

Fonte única: `web/docs/exemplos.js`, exportando `exemplos` como lista de `{ padrao, entrada, esperado }`.

- Pelo menos 2 exemplos por padrão (SC-006).
- Cada exemplo é exibido como link para `../index.html?seq=<entrada codificada>`.
- Um teste automatizado garante que `predict(parseInput(entrada))` devolve `padrao` e `esperado` para todos os exemplos.

## Regras

- Mesmo tema e mesma Content-Security-Policy da aplicação.
- Sem dependências externas, funciona offline (arquivos incluídos no cache do service worker).
- Textos em português do Brasil, voltados para alunos que já conhecem progressões (premissa de requisitos.md).
