# Echo Chamber: Sala do Eco

Na Sala do Eco, o aluno "sussurra" uma sequência de números no terminal e a sala devolve o próximo número, como um eco.

## Requisitos

- Node.js 22 ou superior

## Instalação e uso

```bash
npm install      # só dependências de desenvolvimento (ESLint)
npm start        # ou: node index.js
```

Ao abrir, o programa pede o nome ou apelido do aluno (de 1 a 40 caracteres). Depois disso, cada linha digitada é uma sequência.

## Como digitar a sequência

| Entrada | Como é lida |
|---|---|
| `3, 6, 9, 12` | vírgula e/ou espaços separam os números |
| `3 6 9 12` | só espaços |
| `1.5, 3, 4.5` | ponto é decimal |
| `1,5; 3; 4,5` | com `;`, ele é o único separador e a vírgula (ou o ponto) é decimal |

Atenção: sem `;`, a vírgula sempre separa números. Por isso `1,5, 3` é lido como 1, 5 e 3.

O mínimo é de 2 números. Com exatamente 2, o eco supõe uma progressão aritmética (`2, 4` → `6`).

## Padrões reconhecidos

Os padrões são testados nesta ordem, e o primeiro que explica **toda** a sequência vence:

| Ordem | Padrão | Mínimo de números | Exemplo |
|---|---|---|---|
| 1 | Constante | 2 | `7, 7, 7` → `7` |
| 2 | Progressão aritmética | 2 | `3, 6, 9, 12` → `15` |
| 3 | Progressão geométrica | 3 | `2, 4, 8` → `16` |
| 4 | Fibonacci (soma dos dois anteriores) | 4 | `1, 1, 2, 3, 5` → `8` |
| 5 | Polinomial de grau 2 a 5 | grau + 2 | `1, 4, 9, 16` → `25` |

Se nenhum padrão explica a sequência, o eco avisa e não inventa um número. Os cálculos são exatos, sem erros de arredondamento. Quando o próximo número não tem representação decimal finita, ele aparece como fração (`9, 6, 4` → `8/3`).

## Comandos

| Comando | Quem usa | O que faz |
|---|---|---|
| `/ajuda` | todos | mostra formatos e comandos |
| `/historico` | aluno | lista as memórias do aluno atual, da mais recente para a mais antiga |
| `/professor` | professor | pede o PIN e lista as memórias de todos os alunos, agrupadas por aluno |
| `/admin` | administrador | pede o PIN e apaga todas as memórias, depois da confirmação `APAGAR` |
| `/sair` | todos | encerra o programa |

No primeiro uso de `/professor` e de `/admin`, o programa pede para definir um PIN de 4 a 8 dígitos. **Defina os dois PINs na instalação**, antes de liberar o computador para os alunos. O PIN é uma proteção leve contra uso acidental e não substitui login.

## Onde ficam os dados

Os dados ficam na pasta `dados/`. Para usar outra pasta, defina a variável `ECO_DATA_DIR`.

| Arquivo | Conteúdo |
|---|---|
| `memorias.json` | histórico dos ecos (gravação atômica e cópia em `memorias.json.bak`) |
| `config.json` | hashes dos PINs (nunca o PIN em texto puro) |
| `eco.log` | log técnico em JSON Lines, sem sequências, nomes ou PINs |

Se `memorias.json` estiver danificado, o programa avisa, guarda uma cópia do arquivo danificado e restaura a cópia de segurança. O formato dos arquivos está em [specs/001-sala-do-eco-console/contracts/storage-schema.md](specs/001-sala-do-eco-console/contracts/storage-schema.md).

## Desenvolvimento

```bash
npm test         # testes unitários, de integração e de aceitação
npm run lint
npm audit
```

O núcleo matemático (`src/core`) não depende de console, arquivos nem rede. A Sala do Eco e o Castelo do Eco compartilham exatamente a mesma lógica de previsão.

Estrutura:

```text
index.js            ponto de entrada
src/core/           leitura da entrada, aritmética exata, padrões e previsão
src/storage/        gravação atômica, memórias e PINs
src/logging/        logs
src/cli/            console, comandos e mensagens em português
tests/              unit, integration e acceptance
```

Especificação, plano e tarefas: [specs/001-sala-do-eco-console/](specs/001-sala-do-eco-console/).

## Castelo do Eco (versão web)

O Castelo do Eco é uma segunda interface para o mesmo núcleo matemático. Ele roda no navegador, sem servidor de aplicação: o servidor local abaixo entrega apenas arquivos estáticos.

```bash
npm install
npm run web
```

Abra [http://127.0.0.1:8080/web/](http://127.0.0.1:8080/web/). O endereço e a porta são importantes porque o histórico e os PINs pertencem à origem do navegador. Para escolher outra porta, use `ECO_WEB_PORT=9000 npm run web`; essa porta terá um histórico separado.

As memórias da web ficam no IndexedDB daquele navegador e não são compartilhadas com outros computadores nem com o console. Em sala, use um computador compartilhado pela turma para que o professor veja os ecos dos alunos. Apagar os dados do site no navegador também apaga essas memórias; o Castelo solicita armazenamento persistente, mas o navegador ainda pode removê-lo.

Defina os PINs de professor e administrador na primeira utilização, antes de liberar o navegador para os alunos. Os PINs são proteção leve contra uso acidental, não substituem login.

Após o primeiro carregamento, o Castelo, o cálculo, o gráfico e a biblioteca de padrões continuam disponíveis sem conexão. A documentação fica em [web/docs/](web/docs/).

Testes do navegador:

```bash
npx playwright install chromium
npm run test:e2e
```

Os testes unitários, de integração e aceitação do console e da web continuam em `npm test`; `npm run lint` e `npm audit` verificam estilo e dependências.

Plano e tarefas da Fase 2: [specs/002-castelo-do-eco-web/](specs/002-castelo-do-eco-web/).
