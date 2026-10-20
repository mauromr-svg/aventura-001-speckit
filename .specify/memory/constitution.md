<!--
Sync Impact Report
- Version change: (template não preenchido) → 1.0.0
- Princípios modificados: nenhum renomeado (todos definidos pela primeira vez)
- Seções adicionadas: Core Principles (I–VI), Restrições Adicionais e Escopo,
  Fluxo de Desenvolvimento e Quality Gates, Governance
- Seções removidas: nenhuma
- Templates revisados (somente leitura, não alterados): plan-template.md,
  spec-template.md, tasks-template.md, checklist-template.md
- TODOs adiados:
  - TODO(ADMIN_ROLE): "Quem será o administrador?" está em aberto em requisitos.md
  - TODO(NAMING): "Echo Chamber" é nome provisório (marketing ainda valida)
-->

# Echo Chamber Constitution

## Core Principles

### I. Núcleo Matemático Independente de Interface
A lógica de reconhecimento de sequências e previsão MUST viver em módulos puros, sem dependência
de console, web, armazenamento ou rede. A Fase 1 (console, "Sala do Eco") e a Fase 2 (web,
"Castelo do Eco") MUST consumir o mesmo núcleo. O arquivo principal da aplicação MUST se chamar
`index.js` (RNF-01).

Racional: o escopo prevê duas interfaces; duplicar a lógica geraria divergência de resultados.

### II. Corretude Explicável e Determinística
Toda previsão MUST ser produzida por um padrão explicitamente identificado (aritmético,
geométrico, polinomial, recorrente como Fibonacci, etc.) e MUST ser reproduzível: a mesma entrada
MUST sempre gerar a mesma saída. Quando houver mais de um padrão plausível (ex.: `2, 4, 8` →
16 ou 14), a ordem de precedência dos padrões MUST ser documentada e testada. Se nenhum padrão
for identificado, o sistema MUST informar isso (RN-02) e MUST NOT inventar um resultado. Cada
resposta MUST ser capaz de expor o padrão usado, mesmo que a exibição fique para uma fase
posterior.

Racional: o produto é pedagógico; um resultado sem justificativa ou ambíguo gera discussão em
sala e destrói a confiança. "Acertar sempre" é entendido como nunca responder sem padrão
demonstrável.

### III. Test-First (NON-NEGOTIABLE)
O ciclo Red-Green-Refactor é obrigatório: testes escritos e vistos falhando antes da
implementação. Todos os exemplos fornecidos pelos professores (seção 8 de requisitos.md) MUST ser
testes de aceitação automatizados. Casos de borda (RF-15) MUST ter testes: entradas vazias,
quantidade mínima de elementos, valores não numéricos, decimais com vírgula, números negativos,
zeros, sequências constantes e sequências muito grandes. Nenhuma mudança é integrada com testes
falhando.

Racional: RNF-07 exige testes abrangentes e o domínio tem muitas ambiguidades que só testes
tornam explícitas.

### IV. Entrada Robusta e Mensagens Claras em Português
Toda entrada do usuário MUST ser tratada como não confiável: validada, normalizada e rejeitada
com mensagem clara em português do Brasil (RF-04, RNF-09). O sistema MUST NOT usar `eval`,
`Function` ou equivalentes para interpretar a sequência. Formatos aceitos (separadores, vírgula
decimal) MUST ser definidos na especificação e cobertos por testes. Erros MUST NOT expor stack
traces ao aluno.

Racional: alunos digitam "do jeito que acharem melhor" (RF-14); a tolerância deve ser
intencional e previsível, nunca acidental.

### V. Integridade e Durabilidade dos Dados
Memórias e histórico de ecos (RF-05, RF-19, RNF-11) MUST ser persistidos de forma durável:
escrita atômica (arquivo temporário + rename ou equivalente), tolerância a falhas no meio da
escrita e sem sobrescrita destrutiva. Apagar memórias (RF-17) MUST ser uma ação explícita,
restrita ao papel de administrador e MUST exigir confirmação. Esquemas de dados persistidos
MUST ter versão e migração documentada.

Racional: "memórias nunca podem ser perdidas" é requisito aprovado; professores dependem do
histórico para ver o que cada aluno digitou e onde errou.

### VI. Observabilidade, Segurança e Simplicidade
O sistema MUST registrar logs estruturados de erros e eventos relevantes, sem dados pessoais
além do estritamente necessário (RNF-04, RNF-13). Dependências MUST ser mínimas, justificadas e
auditadas (`npm audit` sem vulnerabilidades altas ou críticas). Complexidade MUST ser justificada
(YAGNI): sem login, sem servidor e sem recursos de IA/"inteligência" além de algoritmos
determinísticos, salvo decisão registrada via emenda ou especificação aprovada.

Racional: não há servidor nem login nas premissas, e o prazo é curto; simplicidade reduz risco e
superfície de ataque.

## Restrições Adicionais e Escopo

- **Stack**: JavaScript com Node.js (padrão aprovado pela TI). Versão LTS ativa MUST ser fixada
  em `package.json` (`engines`).
- **Faseamento**: Fase 1 = console; Fase 2 = web, gráficos, histórico e site de documentação.
  A entrada da Fase 2 junto com a Fase 1 depende de decisão da coordenação e MUST ser resolvida
  na especificação, não assumida na implementação.
- **Premissas vigentes**: sem login e sem servidor por enquanto. Qualquer mudança nessas
  premissas MUST passar por emenda ou especificação aprovada.
- **Desempenho**: sequências grandes (milhares, possivelmente milhões) MUST ser processadas com
  algoritmos de complexidade linear ou justificada, e o limite suportado MUST ser definido na
  especificação. Para o aluno, a resposta MUST parecer instantânea (RNF-08).
- **Idioma**: interface e mensagens em português do Brasil; textos MUST ser externalizados para
  permitir internacionalização futura (inglês/espanhol em aberto).
- **Precisão numérica**: o tratamento de decimais e inteiros grandes MUST ser decidido na
  especificação e testado, evitando erros silenciosos de ponto flutuante.

## Fluxo de Desenvolvimento e Quality Gates

- Requisitos conflitantes ou ambíguos (ex.: mínimo de 3 números vs. exemplo `2, 4` → 6; entrada
  `abc`; sequência "grande") MUST ser resolvidos via `/speckit-clarify` e registrados na
  especificação antes da implementação.
- Requisitos com status "Em análise" MUST NOT ser implementados antes de aprovação.
- Todo código MUST ter comentários e documentação adequados (RNF-06), limitados ao que o código
  não expressa por si só.
- Gates obrigatórios antes de integrar: testes passando, lint sem erros, `npm audit` verificado,
  exemplos dos professores verdes, README e documentação atualizados quando o comportamento
  mudar.
- Revisão de código MUST verificar conformidade com esta constituição.
- "Pronto para produção" (RNF-03) MUST ser traduzido em critérios mensuráveis na especificação.

## Governance

Esta constituição prevalece sobre outras práticas do projeto. Emendas MUST ser documentadas,
aprovadas pela Coordenação Pedagógica e por um representante da TI, e incluir plano de migração
quando afetarem trabalho existente. Os aprovadores formais ainda estão em definição
(requisitos.md) e MUST ser nomeados antes da primeira release.

**Versionamento (SemVer)**: MAJOR para remoção ou redefinição incompatível de princípios; MINOR
para novo princípio/seção ou expansão material; PATCH para esclarecimentos e correções de
redação.

**Conformidade**: todo plano (`plan.md`) MUST passar pelo Constitution Check; todo PR MUST
verificar aderência aos princípios; desvios MUST ser justificados por escrito na seção de
complexidade do plano.

**Version**: 1.0.0 | **Ratified**: 2026-10-20 | **Last Amended**: 2026-10-20
