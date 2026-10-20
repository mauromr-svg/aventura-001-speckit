# Data Model: Sala do Eco (versão console)

## Entidades

### Sequência (em memória, não persistida por inteiro)

| Campo | Descrição |
|---|---|
| `valores` | Lista de inteiros `BigInt` escalados por `10^casas` |
| `casas` | Número de casas decimais usado na escala (0 ou mais) |
| `quantidade` | Quantidade de números lidos |

**Validações**
- Pelo menos 2 números (FR-005); a partir de 3, todos os padrões se aplicam.
- Cada token deve casar com `^[+-]?\d+([.,]\d+)?$` (ver [research.md](research.md), item 3).
- Entrada vazia, só com separadores ou maior que 16 MiB é rejeitada.

### Padrão

| Nome | Código | Mínimo de números | Regra |
|---|---|---|---|
| Constante | `constante` | 2 | todos iguais |
| Aritmética | `aritmetica` | 2 | diferença constante |
| Geométrica | `geometrica` | 3 | razão constante, termos não nulos |
| Fibonacci | `fibonacci` | 4 | `a[i] = a[i-1] + a[i-2]` |
| Polinomial | `polinomial` | `k + 2` (grau `k`, de 2 a 5) | `k`-ésima diferença finita constante |

Precedência: a ordem da tabela. O primeiro padrão que explica toda a sequência vence.

### Previsão (resultado do núcleo)

| Campo | Descrição |
|---|---|
| `status` | `ok`, `sem_padrao` ou `invalido` |
| `padrao` | Código do padrão, quando `status = ok` (e `grau`, se polinomial) |
| `proximo` | Texto do número previsto (decimal exato ou fração), quando `status = ok` |
| `erro` | Código do erro, quando `status = invalido`: `ENTRADA_VAZIA`, `NUMERO_INVALIDO`, `QUANTIDADE_INSUFICIENTE`, `ENTRADA_MUITO_GRANDE` |
| `detalhe` | Dados para a mensagem (ex.: o token inválido e sua posição) |

### Eco / Memória (persistido)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | texto (UUID) | Identificador único |
| `aluno` | texto | Nome ou apelido informado (1 a 40 caracteres) |
| `criadoEm` | texto ISO 8601 UTC | Data e hora do eco |
| `entrada` | texto | Entrada original (cortada em 4.096 caracteres) |
| `quantidade` | inteiro | Quantidade de números lidos (0 se a entrada era inválida) |
| `truncado` | booleano | Verdadeiro se a entrada foi cortada para o armazenamento |
| `status` | texto | `ok`, `sem_padrao` ou `invalido` |
| `padrao` | texto ou nulo | Código do padrão |
| `proximo` | texto ou nulo | Número previsto |
| `erro` | texto ou nulo | Código do erro |

**Regras**
- Memórias são somente de acréscimo, exceto pela exclusão total feita pelo administrador.
- A ordem de consulta é do mais recente para o mais antigo.
- Ecos com erro e sem padrão também são guardados (US4, cenário 2).

### Perfil

| Perfil | Como entra | Pode |
|---|---|---|
| Aluno | Informa nome ou apelido ao iniciar | Fazer ecos e ver as próprias memórias |
| Professor | `/professor` + PIN | Ver memórias de todos os alunos, agrupadas por aluno |
| Administrador | `/admin` + PIN | Apagar todas as memórias, com confirmação |

### Configuração (persistida)

| Campo | Descrição |
|---|---|
| `versaoEsquema` | Versão do formato do arquivo |
| `pinProfessor` / `pinAdmin` | `{ sal, hash }` com `scrypt`; ausente até o primeiro uso |

## Relacionamentos

- Um Aluno (nome) tem muitos Ecos; o Professor os vê agrupados por nome.
- Um Eco referencia no máximo um Padrão (por código).
- A Previsão não é persistida; ela é resumida dentro do Eco.

## Transições de estado

- **Sessão do aluno**: `aguardando nome` → `aguardando sequência` ⇄ `exibindo resultado` → `encerrada` (por `/sair`, fim da entrada ou `Ctrl+C`).
- **Modo professor ou administrador**: `PIN solicitado` → `autenticado` (ou `bloqueado` após 3 tentativas) → `volta à sessão`.
- **Arquivo de memórias**: `ausente` → `válido` → (se corrompido) `restaurado do .bak` ou `recomeçado com aviso`, sempre guardando uma cópia do arquivo ruim.
