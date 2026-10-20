# Implementation Plan: Sala do Eco (versão console)

**Branch**: `001-sala-do-eco-console` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-sala-do-eco-console/spec.md`

## Summary

Aplicação de terminal em que o aluno informa uma sequência numérica e recebe o próximo número. O
núcleo matemático é um módulo puro que reconhece, em ordem de precedência fixa, sequências
constantes, aritméticas, geométricas, do tipo Fibonacci e polinomiais, usando aritmética exata
(sem ponto flutuante). Cada eco é salvo em um arquivo JSON versionado, com escrita atômica. Há
modos protegidos por PIN local para professor (ver o histórico por aluno) e administrador
(apagar memórias). Decisões em [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) em Node.js 22 LTS; `engines` fixado em `package.json`

**Primary Dependencies**: nenhuma em produção (somente módulos nativos: `node:readline`, `node:fs`, `node:crypto`); ESLint como única dependência de desenvolvimento

**Storage**: arquivos locais em `dados/` (diretório configurável por `ECO_DATA_DIR`): `memorias.json` (histórico), `config.json` (hashes de PIN) e `eco.log` (logs)

**Testing**: `node:test` e `node:assert` nativos (unitários, integração e aceitação)

**Target Platform**: terminal em Linux, macOS e Windows com Node.js 22+

**Project Type**: aplicação CLI (biblioteca de núcleo + camada de console)

**Performance Goals**: resposta em menos de 1 s para até 1.000 números e em até 5 s para 1.000.000 de números (SC-002)

**Constraints**: sem rede, sem servidor, sem login; mensagens em português do Brasil; resultado determinístico; sem `eval`; histórico nunca corrompido por interrupção

**Scale/Scope**: sequências de até 1.000.000 de números; histórico de milhares de ecos por máquina; um único computador por instalação

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Como o plano atende |
|---|---|---|
| I. Núcleo Matemático Independente de Interface | Passa | `src/core` é puro, sem I/O; console e a futura web usam o mesmo núcleo. O arquivo principal é `index.js`. |
| II. Corretude Explicável e Determinística | Passa | Precedência fixa em [research.md](research.md). Todo resultado traz o padrão. Sem padrão, não há número. |
| III. Test-First (NON-NEGOTIABLE) | Passa | Os exemplos da seção 8 de requisitos.md viram testes de aceitação antes do código. Casos de borda estão listados em `tests/unit`. |
| IV. Entrada Robusta e Mensagens em Português | Passa | Analisador próprio e estrito, sem `eval`, com códigos de erro e mensagens externalizadas. |
| V. Integridade e Durabilidade dos Dados | Passa | Escrita atômica (temp, `fsync`, `rename`), backup `.bak`, esquema versionado, apagar só com confirmação e PIN. |
| VI. Observabilidade, Segurança e Simplicidade | Passa | Log estruturado sem as sequências dos alunos; zero dependências de produção; PIN com hash `scrypt`. |

Re-avaliação pós-design: todos os princípios continuam atendidos. Não há violações.

## Project Structure

### Documentation (this feature)

```text
specs/001-sala-do-eco-console/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-commands.md
│   └── storage-schema.md
├── checklists/
│   └── requirements.md
└── tasks.md             # criado por /speckit-tasks
```

### Source Code (repository root)

```text
index.js                    # ponto de entrada (RNF-01)
package.json
src/
├── core/                   # puro, sem I/O
│   ├── parse-input.js      # texto -> números exatos ou erro
│   ├── exact-number.js     # inteiro escalado (BigInt) e formatação
│   ├── patterns/
│   │   ├── constant.js
│   │   ├── arithmetic.js
│   │   ├── geometric.js
│   │   ├── fibonacci.js
│   │   └── polynomial.js
│   └── predict.js          # aplica os padrões na ordem de precedência
├── storage/
│   ├── atomic-write.js
│   ├── memory-store.js
│   └── pin-store.js
├── logging/
│   └── logger.js
└── cli/
    ├── app.js              # laço interativo
    ├── commands.js         # /ajuda, /historico, /professor, /admin, /sair
    └── messages.pt-br.js   # todos os textos exibidos

tests/
├── acceptance/             # exemplos oficiais dos professores
├── unit/                   # núcleo, armazenamento, PIN, logs
└── integration/            # sessões do console de ponta a ponta
```

**Structure Decision**: projeto único com camadas. `src/core` não importa nada de `src/cli`, `src/storage` ou `src/logging`, o que atende ao Princípio I e permite reaproveitar o núcleo na Fase 2.

## Complexity Tracking

Sem violações da constituição. A única dependência de desenvolvimento (ESLint) atende ao gate de lint exigido pela constituição.
