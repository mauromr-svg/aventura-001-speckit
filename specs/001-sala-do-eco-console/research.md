# Research: Sala do Eco (versão console)

Não restou nenhum `NEEDS CLARIFICATION` no Technical Context. As decisões abaixo fecham as escolhas técnicas e as ambiguidades herdadas dos requisitos.

## 1. Plataforma e testes

- **Decision**: Node.js 22 LTS, ES modules, testes com `node:test`, ESLint como única dependência de desenvolvimento.
- **Rationale**: Node.js é o padrão aprovado pela TI (RNF-01). O executor de testes nativo evita dependências (Princípio VI).
- **Alternatives considered**: Jest ou Vitest (dependências pesadas sem ganho aqui); CommonJS (sem vantagem e pior para a futura web).

## 2. Representação numérica exata

- **Decision**: cada número lido vira um inteiro `BigInt` escalado por `10^d`, em que `d` é o maior número de casas decimais da sequência. Toda a lógica opera sobre esses inteiros. O resultado é reduzido para fração e exibido como decimal exato ou, se a expansão for infinita, como fração (ex.: `10/3`).
- **Rationale**: elimina erros de ponto flutuante (`0,1 + 0,2`), suporta inteiros muito grandes e mantém o resultado determinístico (constituição, seção de precisão numérica).
- **Alternatives considered**: `Number` (perde precisão e quebra decimais); biblioteca decimal (dependência desnecessária); classe de fração completa para todos os números (mais lenta com 1.000.000 de itens).

## 3. Leitura da entrada (FR-006, FR-016)

- **Decision**: analisador próprio e estrito.
  - Se houver `;`, ele é o único separador, e vírgula ou ponto são decimais (`1,5; 3; 4,5`).
  - Sem `;`, os separadores são vírgula e/ou espaços (`3, 6, 9` e `3 6 9`). Nesse caso, a vírgula nunca é decimal; para decimais, o aluno usa `;` ou ponto (`1.5, 3, 4.5`).
  - Cada token deve casar com `^[+-]?\d+([.,]\d+)?$`. Notação científica, `NaN`, `Infinity` e texto são rejeitados.
  - Entradas com mais de 16 MiB são rejeitadas com `ENTRADA_MUITO_GRANDE`.
- **Rationale**: a regra é previsível e testável, e dispensa `eval` e `Number()`. Documentar a ambiguidade `1,5` evita falsos positivos silenciosos.
- **Alternatives considered**: adivinhar decimal ou separador por heurística (resultado imprevisível); aceitar só `;` (rejeitaria `3, 6, 9`, o exemplo oficial).

## 4. Quantidade mínima (FR-005, resposta Q1-C)

- **Decision**: menos de 2 números gera `QUANTIDADE_INSUFICIENTE`. Com exatamente 2 números, o padrão é aritmético (`2, 4` → `6`). A partir de 3 números, aplicam-se todos os padrões.
- **Rationale**: atende ao RF-13 e ao exemplo `2, 4` → `6`.
- **Alternatives considered**: mínimo rígido de 3 (descarta um exemplo dos professores).

## 5. Padrões e precedência (FR-002, FR-007, Princípio II)

Ordem fixa; o primeiro padrão que explica **toda** a sequência vence:

1. **Constante**: todos iguais. Próximo = mesmo valor.
2. **Aritmética**: diferença constante. Próximo = último + razão. Vale a partir de 2 números.
3. **Geométrica**: razão constante `r = a1/a0` com `a0 ≠ 0`. Próximo = último × r. Exige 3 ou mais números e termos não nulos. O resultado pode ser fracionário.
4. **Fibonacci** (`a[i] = a[i-1] + a[i-2]`): exige 4 ou mais números, para que haja uma verificação além dos dois termos iniciais.
5. **Polinomial**: o menor grau `k` em que a `k`-ésima diferença finita é constante, com `k` de 2 até 5. Exige pelo menos `k + 2` números, para que haja uma confirmação além do ajuste. Próximo obtido por soma das diferenças.

Sem padrão: `SEM_PADRAO`, sem número.

- **Rationale**: `2, 4, 8` cai na geométrica (16), como no exemplo oficial. A regra de "uma confirmação extra" evita padrões forçados (três pontos quaisquer cabem num polinômio quadrático). Com 3 números, só constante, aritmética e geométrica podem ser reconhecidas, e isso será dito na ajuda.
- **Alternatives considered**: Fibonacci depois do polinomial (escolha arbitrária, mas Fibonacci é mais específico); grau ilimitado (aceita qualquer sequência longa, destruindo `SEM_PADRAO`); retornar vários candidatos (RF-16 e RF-12 estão "Em análise").

## 6. Desempenho com sequências grandes (SC-002)

- **Decision**: cada verificação percorre a sequência uma vez, em O(n), com `BigInt` escalado. O polinômio faz no máximo 4 passadas extras. A leitura é uma única linha em memória. O histórico guarda no máximo 1.000 números por eco, mais a quantidade total e um indicador `truncado`.
- **Rationale**: 1.000.000 de `BigInt` e algumas passadas cabem folgadamente nos 5 segundos. Limitar o armazenamento por eco evita arquivos gigantes.
- **Alternatives considered**: guardar a sequência inteira (arquivo de memórias cresceria sem limite).

## 7. Persistência das memórias (FR-010, Princípio V)

- **Decision**: um arquivo `memorias.json` com `versaoEsquema`. A cada eco: ler, acrescentar e gravar com escrita atômica (arquivo temporário, `fsync`, `rename`); antes disso, copiar o arquivo anterior para `memorias.json.bak`. Na abertura, se o JSON estiver corrompido, o sistema avisa em português, tenta o `.bak` e nunca sobrescreve sem backup.
- **Rationale**: simples, legível, durável contra interrupções, e atende ao Princípio V sem banco de dados.
- **Alternatives considered**: SQLite (dependência nativa; o `node:sqlite` ainda é experimental na versão 22); JSON Lines com append (não é atômico e exige reparo de linha parcial).

## 8. Identificação e perfis sem login (FR-013a, resposta Q2-A)

- **Decision**: o aluno digita nome ou apelido (1 a 40 caracteres, sem caracteres de controle). Os modos `/professor` e `/admin` pedem um PIN; no primeiro uso o PIN é definido na hora (4 a 8 dígitos). O PIN é salvo como hash `scrypt` com sal em `config.json`, com 3 tentativas por pedido e atraso crescente. O administrador tem PIN próprio.
- **Rationale**: atende RF-17 e RF-18 sem login. O PIN é proteção leve, como declarado na spec; quem tem acesso ao arquivo local consegue apagá-lo, e isso é um risco aceito.
- **Alternatives considered**: PIN em texto puro (inseguro); variável de ambiente (difícil para professores); login completo (contraria as premissas).

## 9. Logs (FR-015, Princípio VI)

- **Decision**: JSON Lines em `dados/eco.log`, com `nivel`, `evento`, `codigo` e carimbo de data e hora. Não registra as sequências nem os PINs; o apelido do aluno não vai para o log. Rotação simples ao passar de 1 MiB (mantém um arquivo anterior).
- **Rationale**: diagnóstico sem dados pessoais desnecessários.
- **Alternatives considered**: biblioteca de logs (dependência desnecessária); logar a entrada completa (privacidade).

## 10. Encerramento e interrupção

- **Decision**: `/sair`, fim da entrada e `Ctrl+C` encerram de forma limpa. Como cada eco é gravado de forma atômica antes de a resposta ser exibida, não há memória em risco no encerramento.
- **Rationale**: atende SC-004 mesmo com interrupção inesperada.
- **Alternatives considered**: gravar só ao sair (perde dados em queda).
