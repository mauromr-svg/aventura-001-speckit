# Research: Castelo do Eco (versão web)

Não restou nenhum `NEEDS CLARIFICATION` no Technical Context. As decisões abaixo fecham as escolhas técnicas.

## 1. Aplicação estática, sem framework e sem build

- **Decision**: HTML, CSS e módulos ES nativos, sem framework e sem etapa de build. A web importa `../src/core/*.js` diretamente.
- **Rationale**: atende ao Princípio VI (zero dependências de produção) e ao Princípio I (o mesmo núcleo, sem cópia). Cinco telas simples não justificam um framework.
- **Alternatives considered**: React/Vue (dependência e build sem ganho proporcional); copiar o núcleo para `web/` (duplicação proibida pelo Princípio I).

## 2. Portabilidade do núcleo

- **Decision**: em `src/core/parse-input.js`, trocar `Buffer.byteLength(texto, 'utf8')` por uma contagem de bytes UTF-8 portável. Primeiro compara `texto.length` (cada caractere ocupa de 1 a 3 bytes nesse cálculo); só calcula o tamanho exato com `new TextEncoder().encode(texto).length` quando o texto está perto do limite. Os 103 testes atuais precisam continuar passando.
- **Rationale**: `Buffer` não existe no navegador; `TextEncoder` existe no Node e no navegador. A comparação prévia evita codificar 16 MiB a cada eco.
- **Alternatives considered**: limitar por `texto.length` (muda o comportamento documentado da Fase 1); manter versões separadas do analisador (duplicação).

## 3. Previsão em Web Worker

- **Decision**: `web/js/eco-worker.js` (Worker de módulo) recebe o texto, executa `parseInput` e `predict` e devolve o resultado mais os pontos já reduzidos para o gráfico. Os `BigInt` não saem do Worker.
- **Rationale**: 1.000.000 de números leva cerca de 1 s de CPU; no Worker a página continua respondendo (SC-002 e "sem travar"). Mandar só os pontos reduzidos evita copiar milhões de valores.
- **Alternatives considered**: rodar na thread principal (trava a página); dividir em fatias com `setTimeout` (complexo e ainda mais lento).

## 4. Gráfico em SVG próprio

- **Decision**: `grafico-dados.js` (puro, testável em Node) converte os valores para `Number` só para desenhar, calcula a escala e reduz para no máximo 1.000 pontos, sempre mantendo o primeiro, o último e a previsão. A redução divide os pontos em faixas e guarda o menor e o maior valor de cada faixa, preservando picos. `grafico-svg.js` cria os elementos SVG com `createElementNS` e define os textos com `textContent`. A previsão é um marcador de forma e cor diferentes, com rótulo; previsões em fração são posicionadas pelo valor aproximado e rotuladas com o valor exato.
- **Rationale**: sem dependência, acessível (SVG com `<title>` e `role="img"`), nítido em qualquer tela. Os valores exibidos em texto continuam exatos; só a posição no desenho é aproximada.
- **Alternatives considered**: Chart.js (dependência e mais peso); `<canvas>` (sem texto acessível, exige redesenho manual).
- **Valores fora da faixa de `Number`**: quando um valor passa de ±1e300, o gráfico mostra o aviso "valores grandes demais para desenhar"; a resposta numérica continua exata.

## 5. Armazenamento no IndexedDB

- **Decision**: banco `castelo-do-eco`, versão 1:
  - `ecos` (chave `id`, índices `aluno` e `criadoEm`): mesmo formato de eco da Sala do Eco, incluindo `versaoEsquema` por registro;
  - `config` (chave `chave`): `pinProfessor`, `pinAdmin`;
  - `logs` (chave autoincremento): no máximo 500 entradas, as mais antigas removidas.

  Cada gravação é uma transação `readwrite`. Na abertura, a página chama `navigator.storage.persist()` para reduzir o risco de o navegador apagar dados por falta de espaço. Uma `BroadcastChannel` avisa as outras abas para atualizar o histórico.
- **Rationale**: transações são atômicas (Princípio V) e seguras entre abas; a cota é muito maior que a do `localStorage`, que guardaria só cerca de 1.000 ecos de 4 KB e é síncrono.
- **Alternatives considered**: `localStorage` (limite de cerca de 5 MB, sem transações); arquivos via File System Access API (não suportada em todos os navegadores e exige ação do usuário).
- **Risco aceito**: o usuário pode apagar os dados do navegador; a interface avisa isso na área do professor e o README orienta.

## 6. PIN no navegador

- **Decision**: PBKDF2-SHA-256 com 600.000 iterações e sal aleatório de 16 bytes, pela Web Crypto (`crypto.subtle`), resultado de 32 bytes guardado em base64 no store `config`. Comparação em tempo constante, feita byte a byte sobre o resultado. Três tentativas por acesso com atraso crescente (0,5 s e 1 s), como na Sala do Eco. PIN de 4 a 8 dígitos, definido no primeiro acesso com confirmação.
- **Rationale**: `scrypt` não existe na Web Crypto; PBKDF2 com SHA-256 e 600.000 iterações segue a recomendação atual da OWASP. Como o PIN tem só 4 a 8 dígitos, a proteção continua leve, como a spec declara.
- **Alternatives considered**: biblioteca de `scrypt`/`argon2` em JavaScript (dependência); PIN em texto puro (inseguro).
- **Contexto seguro**: a Web Crypto exige `https` ou `localhost`; o servidor local usa 127.0.0.1, e a hospedagem estática deve usar `https`.

## 7. Uso sem conexão

- **Decision**: `web/sw.js` armazena em cache, na instalação, a lista fixa de arquivos da web, do núcleo e da documentação, e responde do cache primeiro. A lista leva um número de versão; ao mudar a versão, o cache antigo é apagado.
- **Rationale**: atende ao FR-016 sem dependências.
- **Alternatives considered**: Workbox (dependência); sem service worker (a página não abre sem rede).

## 8. Segurança da interface

- **Decision**: Content-Security-Policy em `<meta>`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`. Nenhum script inline, nenhum `innerHTML`/`insertAdjacentHTML` com dados do usuário (regra de lint `no-restricted-properties`). O parâmetro `?seq=` dos links da documentação é lido com `URLSearchParams` e passa pelo mesmo analisador.
- **Rationale**: FR-014 e RNF-13; impede XSS mesmo com nomes de alunos ou sequências maliciosos.
- **Alternatives considered**: sanitizar HTML (mais frágil que nunca interpretar HTML).

## 9. Documentação estática

- **Decision**: sete páginas HTML escritas à mão em `web/docs/` (índice, precedência e uma por padrão). Os exemplos de cada página vêm de `web/docs/exemplos.js` (`{ padrao, entrada, esperado }`), renderizados por `docs.js` como links para `../index.html?seq=<entrada>`. Um teste `node:test` importa `exemplos.js` e confere cada exemplo contra `parseInput` + `predict` (SC-006).
- **Rationale**: os exemplos nunca ficam desatualizados em relação ao núcleo; as páginas funcionam offline e sem build.
- **Alternatives considered**: gerador de site estático (dependência); documentação em Markdown renderizada no navegador (exigiria um parser).

## 10. Servidor local de arquivos

- **Decision**: `scripts/serve-web.js` com `node:http`, ouvindo só em `127.0.0.1` (porta `ECO_WEB_PORT`, padrão 8080). Serve apenas arquivos dentro de `web/`, `src/core/` e `src/cli/messages.pt-br.js`, resolvendo o caminho e recusando tudo que sair dessas pastas (proteção contra `../`). Envia tipos MIME corretos e o cabeçalho `Service-Worker-Allowed`. A porta precisa ser fixa porque o IndexedDB pertence à origem (`http://127.0.0.1:8080`).
- **Rationale**: necessário porque módulos ES e Workers não carregam por `file://`; não é servidor de aplicação, não guarda dados.
- **Alternatives considered**: `npx http-server` (dependência e serve a pasta inteira, incluindo `dados/` da Fase 1).

## 11. Testes

- **Decision**:
  - `node:test`: `grafico-dados`, `pins` (Web Crypto existe no Node 22), `memorias` com `fake-indexeddb`, exemplos da documentação e um teste de equivalência web × console sobre os exemplos oficiais.
  - Playwright (`tests/e2e/`): cenários de aceitação das histórias 1 a 6 no Chromium, iniciando `scripts/serve-web.js` numa porta temporária.
  - `npm test` continua rodando só os testes `node:test`; `npm run test:e2e` roda o Playwright.
- **Rationale**: Princípio III; separa testes rápidos dos que precisam de navegador.
- **Alternatives considered**: jsdom (outra dependência, sem Worker, IndexedDB nem SVG reais).
- **Risco**: o download do navegador do Playwright pode ser bloqueado pela rede da instituição; nesse caso, os cenários do [quickstart.md](quickstart.md) são executados manualmente.

## 12. Textos

- **Decision**: `web/js/textos.js` reexporta `mensagens` e `nomeDoPadrao` de `src/cli/messages.pt-br.js` e acrescenta só os textos exclusivos da web (rótulos de botões, títulos de telas, avisos de armazenamento).
- **Rationale**: mensagens de erro e nomes de padrões idênticos aos do console (FR-002), em um único lugar.
- **Alternatives considered**: duplicar os textos (divergência garantida com o tempo).
