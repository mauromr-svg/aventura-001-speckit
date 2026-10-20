# Quickstart: Validação do Castelo do Eco (versão web)

Contratos: [ui-contract.md](contracts/ui-contract.md), [storage-schema.md](contracts/storage-schema.md), [docs-site.md](contracts/docs-site.md). Entidades: [data-model.md](data-model.md).

## Pré-requisitos

- Node.js 22 ou superior
- Navegador atual (Chrome, Edge, Firefox ou Safari)
- `npm install` (dependências de desenvolvimento)
- Para os testes de navegador: `npx playwright install chromium` (se a rede permitir)

## Execução

```bash
npm run web                     # http://127.0.0.1:8080/web/
ECO_WEB_PORT=9000 npm run web   # outra porta (outra origem = outro histórico)
```

## Cenários de validação

| # | Passos | Resultado esperado |
|---|---|---|
| 1 | Abrir a página, nome `Ana`, sequência `3, 6, 9, 12` | `15`, "progressão aritmética", gráfico com 4 pontos e a previsão destacada |
| 2 | `1, 4, 9, 16` | `25`, "sequência polinomial de grau 2", 5 pontos no gráfico |
| 3 | `2, 4, 8` | `16`, "progressão geométrica" |
| 4 | `1,5; 3; 4,5` | `6` |
| 5 | `10, 20, 30, abc` | Mensagem indicando `abc` (item 4); campo mantém o texto; nenhum gráfico novo |
| 6 | `3, 1, 4, 1, 5` | Sem padrão; gráfico só com os 5 pontos |
| 7 | `9, 6, 4` | `8/3`; previsão rotulada `8/3` no gráfico |
| 8 | Nome `<b>x</b>` e sequência `<script>alert(1)</script>` | Nome exibido literalmente; sequência rejeitada; nenhum alerta |
| 9 | Fechar e reabrir a página; abrir o histórico | Ecos anteriores, do mais recente ao mais antigo; clicar num eco reabre resposta e gráfico |
| 10 | Duas abas abertas; fazer um eco em cada | Ambos aparecem no histórico das duas abas |
| 11 | Clicar em "Saiba mais" após o cenário 3 | Abre `docs/geometrica.html` |
| 12 | Em cada página de padrão, clicar em cada exemplo | O Castelo do Eco mostra o resultado indicado na página |
| 13 | `professor.html`: entrar como professor, definir PIN | Ecos agrupados por aluno, com aviso de que só aparecem ecos deste navegador |
| 14 | Professor com PIN errado 3 vezes | Acesso negado, nenhum dado exibido |
| 15 | Administrador: definir PIN, digitar `nao` na confirmação | Nada é apagado |
| 16 | Administrador: confirmar com `APAGAR` | Histórico vazio |
| 17 | Colar 1.000.000 de números (ex.: gerar com `seq 1 1000000 \| tr '\n' ' '`) | "Ouvindo…" enquanto calcula; página continua rolando; resposta `1000001` em até 5 s; gráfico com aviso de redução |
| 18 | Desligar a rede (DevTools → Offline) e recarregar | Página, cálculo e documentação continuam funcionando |
| 19 | Comparar com a Sala do Eco os exemplos dos cenários 1 a 7 | Mesmos resultados e mesmas mensagens |

## Testes automatizados

```bash
npm test          # node:test: Fase 1 + módulos web (gráfico, PIN, memórias, exemplos da documentação)
npm run test:e2e  # Playwright: cenários de aceitação no navegador
npm run lint
npm audit
```

Critério de pronto: `npm test` e `npm run test:e2e` verdes (ou, se o navegador do Playwright não puder ser baixado, os 19 cenários acima executados manualmente), e os 103 testes da Fase 1 continuam passando.
