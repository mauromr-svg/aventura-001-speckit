# Data Model: Castelo do Eco (versão web)

A Sequência, o Padrão e a Previsão são os mesmos da Fase 1 ([../001-sala-do-eco-console/data-model.md](../001-sala-do-eco-console/data-model.md)). Abaixo, só o que é novo ou muda na web.

## Entidades

### Eco / Memória (store `ecos`)

Mesmos campos da Fase 1, com as mesmas regras:

| Campo | Tipo | Regra |
|---|---|---|
| `id` | texto (UUID) | chave do store |
| `aluno` | texto | 1 a 40 caracteres, sem caracteres de controle; índice `aluno` |
| `criadoEm` | texto ISO 8601 UTC | índice `criadoEm` |
| `entrada` | texto | cortada em 4.096 caracteres |
| `quantidade` | inteiro | quantidade de números lidos (0 se inválida) |
| `truncado` | booleano | `true` se `entrada` foi cortada |
| `status` | texto | `ok`, `sem_padrao` ou `invalido` |
| `padrao` | texto ou nulo | só se `status = ok` |
| `grau` | inteiro ou nulo | só se `padrao = polinomial` (novo, para reabrir o gráfico com o nome completo do padrão) |
| `proximo` | texto ou nulo | só se `status = ok` |
| `erro` | texto ou nulo | só se `status = invalido` |
| `versaoEsquema` | inteiro | 1 nesta versão |

**Regras**
- Entradas vazias não geram eco (igual à Sala do Eco).
- Registros que não cumprem as regras acima são ignorados na leitura e contados; a interface avisa que há memórias danificadas, sem apagá-las.
- O gráfico de um eco do histórico é refeito a partir de `entrada`; se `truncado = true`, o gráfico mostra a parte guardada e um aviso.

### Configuração (store `config`)

| `chave` | Valor |
|---|---|
| `pinProfessor` | `{ sal: base64, hash: base64, iteracoes: 600000 }` |
| `pinAdmin` | idem |

Ausente até o primeiro acesso. As iterações ficam guardadas para permitir aumentá-las no futuro sem invalidar PINs.

### Log técnico (store `logs`)

| Campo | Regra |
|---|---|
| `ts` | ISO 8601 UTC |
| `nivel` | `info`, `aviso`, `erro` |
| `evento` | texto fixo (ex.: `memoria_nao_salva`) |
| `codigo` | opcional |

No máximo 500 registros. Nunca guarda sequências, nomes ou PINs.

### Pontos do gráfico (em memória, não persistido)

| Campo | Descrição |
|---|---|
| `pontos` | lista de `{ indice, valor }` com `valor` em `Number`, no máximo 1.000 itens |
| `previsao` | `{ indice, valor, rotulo }` ou ausente; `rotulo` é o texto exato (`8/3`) |
| `reduzido` | `true` se houve redução de pontos |
| `foraDeEscala` | `true` se algum valor passa de ±1e300 |
| `minimo`, `maximo` | limites do eixo vertical |

**Regras**: o primeiro e o último ponto e a previsão sempre aparecem; os índices partem de 1, como as posições que o aluno digitou.

### Página de documentação

| Campo | Descrição |
|---|---|
| `padrao` | código (`constante`, `aritmetica`, `geometrica`, `fibonacci`, `polinomial`) |
| `exemplos` | lista de `{ entrada, esperado }`, pelo menos 2 por padrão |

Fonte única em `web/docs/exemplos.js`.

## Relacionamentos

- Um aluno (nome) tem muitos ecos no mesmo navegador.
- Um eco gera um gráfico sob demanda (não armazenado).
- Cada padrão tem uma página de documentação; cada resposta com padrão aponta para ela.

## Transições de estado

- **Tela principal**: `pedindo nome` → `pronto` → `calculando` (Worker) → `exibindo resposta e gráfico` | `exibindo erro` → `pronto`.
- **Área do professor/administrador**: `bloqueada` → `definindo PIN` (primeiro acesso) ou `pedindo PIN` → `liberada` | `tentativas esgotadas` → `bloqueada`.
- **Banco**: `ausente` → `versão 1`. Uma versão futura usa o evento `upgradeneeded` com migração documentada; se o banco tiver versão maior que a conhecida, a página avisa e não grava.
