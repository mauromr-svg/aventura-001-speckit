# Implementation Plan: Castelo do Eco (versão web)

**Branch**: `002-castelo-do-eco-web` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-castelo-do-eco-web/spec.md`

## Summary

Versão web estática do Echo Chamber, executada inteiramente no navegador, que importa o mesmo
núcleo `src/core` da Sala do Eco sem duplicar lógica. A previsão roda num Web Worker para não
travar a página com sequências grandes. O gráfico de cada sequência é desenhado em SVG próprio,
sem bibliotecas. Memórias e PINs ficam no IndexedDB do navegador, com transações atômicas e
esquema versionado; os PINs são guardados como hash PBKDF2 (Web Crypto). Um service worker
permite uso sem conexão. A documentação dos padrões são páginas HTML estáticas cujos exemplos
vêm de um módulo de dados testado contra o núcleo. Decisões em [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) em navegadores atuais (Chrome, Edge, Firefox, Safari das duas últimas versões); Node.js 22 LTS para ferramentas e testes

**Primary Dependencies**: nenhuma em produção (APIs nativas do navegador: Web Workers, IndexedDB, Web Crypto, Service Worker, SVG). Desenvolvimento: ESLint (já existente), `fake-indexeddb` (testes de armazenamento) e `@playwright/test` (testes de aceitação no navegador)

**Storage**: IndexedDB do navegador, banco `castelo-do-eco` versão 1, com os stores `ecos`, `config` e `logs`

**Testing**: `node:test` para módulos puros e armazenamento (com `fake-indexeddb`); Playwright para os cenários de aceitação no navegador

**Target Platform**: navegador de computador, servido como arquivos estáticos (pelo servidor local `npm run web` em 127.0.0.1 ou por qualquer hospedagem estática)

**Project Type**: aplicação web estática (front-end only) reaproveitando a biblioteca de núcleo existente

**Performance Goals**: resposta e gráfico em menos de 1 s para até 1.000 números; resposta em até 5 s para 1.000.000 de números sem travar a página (SC-002)

**Constraints**: sem servidor de aplicação, sem login, sem rede após o carregamento; textos em português do Brasil; nenhum texto do usuário interpretado como HTML ou código; resultados idênticos aos da Sala do Eco

**Scale/Scope**: um navegador por computador de laboratório; milhares de ecos por navegador; 7 páginas de documentação; 5 telas principais (eco, gráfico, histórico, professor, administrador)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Como o plano atende |
|---|---|---|
| I. Núcleo Matemático Independente de Interface | Passa | A web importa `src/core` diretamente. A única dependência do Node no núcleo (`Buffer.byteLength` em `parse-input.js`) é trocada por uma API padrão disponível no Node e no navegador. Os textos de padrões e erros vêm do mesmo `src/cli/messages.pt-br.js`, garantindo mensagens idênticas (FR-002). |
| II. Corretude Explicável e Determinística | Passa | Mesmo `predict`; teste automatizado compara web e console para todos os exemplos oficiais e da documentação. O padrão é exibido em cada resposta, com link para a explicação. |
| III. Test-First (NON-NEGOTIABLE) | Passa | Testes `node:test` para gráfico, armazenamento e PIN; testes Playwright para os cenários de aceitação; os exemplos da documentação viram testes. |
| IV. Entrada Robusta e Mensagens em Português | Passa | Mesmo analisador; a interface usa só `textContent` e APIs DOM, nunca `innerHTML` com dados do usuário; Content-Security-Policy proíbe scripts inline e `eval`. |
| V. Integridade e Durabilidade dos Dados | Passa com risco documentado | Transações IndexedDB atômicas, esquema versionado, apagar só com PIN e `APAGAR`, pedido de armazenamento persistente. O usuário pode limpar os dados do navegador; o risco é avisado na interface e no README. |
| VI. Observabilidade, Segurança e Simplicidade | Passa | Zero dependências de produção; log técnico limitado no IndexedDB sem sequências, nomes ou PINs; PIN com PBKDF2-SHA-256 e sal. As dependências de desenvolvimento estão justificadas abaixo. |
| Restrição "sem servidor" | Passa com justificativa | Não há servidor de aplicação nem dados remotos. O `npm run web` é só um servidor de arquivos estáticos local (127.0.0.1), necessário porque navegadores não carregam módulos ES por `file://`. |

Re-avaliação pós-design: todos os princípios continuam atendidos; as justificativas estão em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-castelo-do-eco-web/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-contract.md
│   ├── storage-schema.md
│   └── docs-site.md
├── checklists/
│   └── requirements.md
└── tasks.md             # criado por /speckit-tasks
```

### Source Code (repository root)

```text
src/core/                     # existente; parse-input.js passa a usar API portável
src/cli/messages.pt-br.js     # existente; textos compartilhados com a web

web/
├── index.html                # Castelo do Eco (eco, gráfico, histórico)
├── professor.html            # área do professor e do administrador
├── estilo.css                # tema do castelo
├── sw.js                     # service worker (uso offline)
├── img/                      # ilustrações SVG próprias do castelo
├── js/
│   ├── main.js               # controla a tela principal
│   ├── eco-worker.js         # Web Worker: parseInput + predict + pontos do gráfico
│   ├── grafico-dados.js      # puro: converte sequência e previsão em pontos e reduz amostragem
│   ├── grafico-svg.js        # desenha o SVG a partir dos pontos (DOM, sem innerHTML)
│   ├── memorias.js           # repositório IndexedDB de ecos
│   ├── pins.js               # PIN com PBKDF2 (Web Crypto)
│   ├── log.js                # log técnico limitado
│   ├── professor.js          # controla professor.html
│   └── textos.js             # textos exclusivos da web; reexporta os do console
└── docs/
    ├── index.html            # lista de padrões
    ├── precedencia.html
    ├── constante.html
    ├── aritmetica.html
    ├── geometrica.html
    ├── fibonacci.html
    ├── polinomial.html
    ├── docs.js               # renderiza os exemplos a partir de exemplos.js
    └── exemplos.js           # dados dos exemplos (testados contra o núcleo)

scripts/
└── serve-web.js              # servidor estático local (127.0.0.1), só arquivos permitidos

tests/
├── unit/web/                 # grafico-dados, memorias (fake-indexeddb), pins, exemplos da documentação
└── e2e/                      # Playwright: cenários de aceitação no navegador
```

**Structure Decision**: a web fica em `web/` e importa `../src/core/` e `../src/cli/messages.pt-br.js` por caminhos relativos. O servidor local e qualquer hospedagem estática publicam apenas `web/`, `src/core/` e `src/cli/messages.pt-br.js`, preservando essa estrutura.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Servidor de arquivos estáticos local (`scripts/serve-web.js`) | Navegadores bloqueiam módulos ES e Web Workers abertos por `file://` | Gerar um único HTML com tudo embutido exigiria um bundler (dependência) e impediria o Web Worker |
| Dependência de desenvolvimento `fake-indexeddb` | Testar o repositório de memórias em `node:test` sem navegador | Simular o IndexedDB à mão seria frágil e não testaria transações reais |
| Dependência de desenvolvimento `@playwright/test` | Testar os cenários de aceitação no navegador real (Princípio III) | Testes só de módulos puros não cobrem gráfico, Worker, IndexedDB e service worker integrados |
