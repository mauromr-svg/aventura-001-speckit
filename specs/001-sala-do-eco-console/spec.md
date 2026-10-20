# Feature Specification: Sala do Eco (versão console)

**Feature Branch**: `001-sala-do-eco-console`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Fase 1 do Echo Chamber (requisitos/requisitos.md): versão em terminal da Sala do Eco, em que o aluno informa uma sequência numérica e o sistema devolve o próximo número, guardando as memórias dos ecos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aluno recebe o próximo número da sequência (Priority: P1)

O aluno "sussurra" uma sequência de números na Sala do Eco e recebe de volta o próximo número, como um eco. O sistema reconhece progressões aritméticas, progressões geométricas, sequências polinomiais (ex.: quadrados) e sequências do tipo Fibonacci.

**Why this priority**: É o valor central do produto; sem isso nada mais faz sentido e já entrega um MVP utilizável em sala.

**Independent Test**: Informar cada exemplo oficial dos professores e conferir o resultado esperado, sem depender de histórico ou de outros perfis.

**Acceptance Scenarios**:

1. **Given** a Sala do Eco aberta, **When** o aluno informa `3, 6, 9, 12`, **Then** o sistema responde `15`.
2. **Given** a Sala do Eco aberta, **When** o aluno informa `1, 4, 9, 16`, **Then** o sistema responde `25`.
3. **Given** a Sala do Eco aberta, **When** o aluno informa `2, 4, 8`, **Then** o sistema responde `16`.
4. **Given** a Sala do Eco aberta, **When** o aluno informa `1, 1, 2, 3, 5`, **Then** o sistema responde `8`.
5. **Given** a Sala do Eco aberta, **When** o aluno informa uma sequência sem nenhum padrão reconhecível, **Then** o sistema informa claramente que não encontrou um padrão e não devolve um número.

---

### User Story 2 - Aluno digita a sequência do jeito que preferir e recebe avisos claros (Priority: P1)

O aluno pode digitar números separados por vírgula, ponto e vírgula ou espaço, e usar vírgula como separador decimal. Entradas inválidas geram uma mensagem clara em português, dizendo o que está errado e como corrigir.

**Why this priority**: Alunos erram e digitam de formas diferentes; sem tratamento de entrada a ferramenta frustra o público principal.

**Independent Test**: Informar entradas válidas em formatos variados e entradas inválidas, conferindo resultado ou mensagem.

**Acceptance Scenarios**:

1. **Given** a Sala do Eco aberta, **When** o aluno informa `1,5; 3; 4,5`, **Then** o sistema interpreta os valores 1,5, 3 e 4,5 e responde `6`.
2. **Given** a Sala do Eco aberta, **When** o aluno informa `10, 20, 30, abc`, **Then** o sistema informa que `abc` não é um número e indica o que deve ser corrigido.
3. **Given** a Sala do Eco aberta, **When** o aluno informa uma única entrada como `5`, **Then** o sistema informa que a quantidade de números é insuficiente.
4. **Given** a Sala do Eco aberta, **When** o aluno envia uma entrada vazia, **Then** o sistema pede que ele informe uma sequência, sem encerrar o programa.

---

### User Story 3 - Aluno testa várias sequências em uma mesma sessão (Priority: P2)

Após cada resposta, o aluno pode informar outra sequência sem reiniciar o programa e encerrar quando quiser.

**Why this priority**: Torna a prática fluida e é pré-requisito natural para o histórico.

**Independent Test**: Informar três sequências seguidas e depois encerrar, conferindo que cada resposta é independente.

**Acceptance Scenarios**:

1. **Given** uma resposta recém-exibida, **When** o aluno informa outra sequência, **Then** o sistema responde a nova sequência normalmente.
2. **Given** a Sala do Eco aberta, **When** o aluno pede para sair, **Then** o programa encerra de forma limpa com uma despedida.

---

### User Story 4 - Memórias e histórico dos ecos são guardados (Priority: P2)

Cada eco (sequência informada, resultado ou erro, data e hora) é guardado como "memória" e permanece disponível depois que o programa é fechado e reaberto. O aluno pode consultar suas memórias anteriores.

**Why this priority**: É requisito aprovado de alta prioridade e base para a visão do professor, mas o núcleo funciona sem ele.

**Independent Test**: Fazer dois ecos, fechar o programa, reabrir e consultar o histórico, que deve listar os dois ecos.

**Acceptance Scenarios**:

1. **Given** ecos realizados, **When** o programa é fechado e reaberto, **Then** o histórico ainda contém todos os ecos anteriores.
2. **Given** um histórico existente, **When** o aluno consulta as memórias, **Then** o sistema lista os ecos do mais recente ao mais antigo, incluindo erros e sequências sem padrão.
3. **Given** o programa encerrado de forma inesperada durante um eco, **When** ele é reaberto, **Then** as memórias anteriores continuam íntegras.

---

### User Story 5 - Professor vê o que os alunos digitaram e o administrador apaga memórias (Priority: P3)

O professor consegue ver as entradas dos alunos e onde erraram. O administrador consegue apagar as memórias, mediante confirmação explícita.

**Why this priority**: Atende à principal necessidade da Professora Carla, mas é opcional para o núcleo funcionar.

**Independent Test**: Registrar ecos de mais de um aluno e conferir que o professor os visualiza separados por aluno; apagar memórias e conferir que o histórico fica vazio apenas após confirmação.

**Acceptance Scenarios**:

1. **Given** ecos de alunos diferentes, **When** o professor consulta o histórico, **Then** o sistema mostra, para cada aluno, as sequências digitadas, os resultados e os erros.
2. **Given** memórias existentes, **When** o administrador pede para apagá-las e confirma, **Then** o histórico fica vazio.
3. **Given** memórias existentes, **When** o administrador pede para apagá-las e não confirma, **Then** nada é apagado.

---

### Edge Cases

- Sequência com 2 números (`2, 4`): tratada como progressão aritmética e responde `6` (ver FR-005); com 1 número ou menos, é rejeitada.
- Sequência constante (`7, 7, 7`): deve ser reconhecida (diferença zero) e responder `7`.
- Sequência com números negativos e zero (`-3, 0, 3`): deve ser tratada normalmente.
- Sequência em que um padrão geométrico e um polinomial são igualmente plausíveis (`2, 4, 8`): vale a regra de precedência definida em FR-007.
- Sequência muito longa (milhares de números, com possibilidade de milhões no futuro): deve ser processada sem travar.
- Valores muito grandes ou com muitas casas decimais: resultado não pode ser silenciosamente impreciso.
- Entrada com espaços extras, separadores repetidos ou mistura de separadores.
- Entrada com texto, símbolos ou comandos (`abc`, `1; DROP`): rejeitada com mensagem clara, nunca executada.
- Interrupção do programa (Ctrl+C) durante o uso: as memórias já salvas não são perdidas.
- Arquivo de memórias corrompido ou inacessível: o sistema avisa o usuário em português e preserva o que for possível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST prever o próximo número de uma sequência numérica informada pelo usuário (RF-01).
- **FR-002**: O sistema MUST reconhecer progressões aritméticas (RF-02), progressões geométricas, sequências polinomiais e sequências do tipo Fibonacci (RF-03).
- **FR-003**: O sistema MUST informar claramente quando a sequência não segue nenhum padrão reconhecível e MUST NOT devolver um número nesse caso (RN-02).
- **FR-004**: O sistema MUST avisar, em português e de forma clara, quando a sequência for inválida (RF-04, RNF-09), indicando o motivo.
- **FR-005**: O sistema MUST exigir no mínimo 3 números na sequência (RF-13), com uma única exceção: sequências de exatamente 2 números são tratadas como progressão aritmética (`2, 4` → `6`). Sequências com menos de 2 números MUST ser rejeitadas com mensagem clara.
- **FR-006**: O sistema MUST aceitar números separados por vírgula, ponto e vírgula ou espaço e MUST aceitar vírgula como separador decimal (RF-14); quando houver ponto e vírgula na entrada, ele separa os números e a vírgula é decimal.
- **FR-007**: Quando mais de um padrão explicar a sequência, o sistema MUST aplicar uma ordem de precedência fixa e documentada, de modo que a mesma entrada sempre gere o mesmo resultado (`2, 4, 8` → `16`).
- **FR-008**: O sistema MUST tratar os casos de borda listados nesta especificação sem encerrar de forma inesperada (RF-15).
- **FR-009**: O usuário MUST poder informar várias sequências na mesma sessão e encerrar quando quiser (RF-06).
- **FR-010**: O sistema MUST guardar cada eco (entrada, resultado ou erro, data e hora) como memória e MUST preservá-la entre sessões (RF-05, RF-19, RNF-11).
- **FR-011**: O usuário MUST poder consultar as memórias anteriores (RF-05, RF-19).
- **FR-012**: O professor MUST poder ver o que cada aluno digitou e onde errou (RF-18).
- **FR-013**: O administrador MUST poder apagar as memórias, somente após confirmação explícita (RF-17).
- **FR-013a**: O aluno MUST informar um nome ou apelido ao iniciar a sessão, e as memórias MUST ser associadas a ele. Os modos de professor e de administrador MUST ser acessados por comandos distintos, protegidos por um PIN local configurável.
- **FR-014**: Todas as mensagens e textos exibidos MUST estar em português do Brasil (RNF-09).
- **FR-015**: O sistema MUST registrar logs de erros e eventos relevantes para diagnóstico (RNF-04).
- **FR-016**: O sistema MUST rejeitar entradas que não sejam números válidos, sem interpretá-las como comandos ou código (RNF-13).
- **FR-017**: O sistema MUST apresentar uma interface de texto intuitiva, com instruções de uso visíveis na abertura e uma mensagem de boas-vindas amigável (RNF-05).

### Key Entities *(include if feature involves data)*

- **Sequência**: lista ordenada de números informada pelo aluno; pode conter inteiros e decimais.
- **Padrão**: regra que explica a sequência (aritmético, geométrico, polinomial, recorrente do tipo Fibonacci); tem nome e ordem de precedência.
- **Eco**: resultado de uma tentativa; contém a sequência informada, o padrão identificado (se houver), o próximo número ou o motivo do erro, e data e hora.
- **Memória**: registro persistente de um eco, associado a um aluno quando houver identificação.
- **Perfil de uso**: aluno, professor ou administrador, com permissões distintas (ver clarificação sobre identificação).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos exemplos oficiais dos professores (seção 8 de requisitos.md) com resultado definido retornam exatamente o valor esperado.
- **SC-002**: O aluno recebe a resposta em menos de 1 segundo para sequências de até 1.000 números e em até 5 segundos para sequências de 1.000.000 de números.
- **SC-003**: 100% das entradas inválidas geram uma mensagem em português que identifica o problema, sem encerrar o programa.
- **SC-004**: Após fechar e reabrir o programa, 100% dos ecos anteriores continuam disponíveis, inclusive após interrupção inesperada.
- **SC-005**: Um aluno que nunca usou o sistema consegue obter o primeiro eco em menos de 1 minuto, sem ajuda externa.
- **SC-006**: Para a mesma sequência de entrada, 100% das execuções produzem o mesmo resultado.
- **SC-007**: O professor encontra o que um aluno específico digitou em menos de 1 minuto.

## Assumptions

- Esta especificação cobre apenas a Fase 1 (console, "Sala do Eco"); a versão web (Castelo do Eco), os gráficos, o site de documentação e a exportação para Excel pertencem à Fase 2 e estão fora do escopo.
- Requisitos com status "Em análise" ficam fora do escopo desta versão: contar a história da sala (RF-08), insights de histórico (RF-11), explicação passo a passo (RF-12), previsão de mais de um número (RF-16), acessibilidade (RNF-12) e uso no celular (RNF-10).
- O sistema não tem login nem servidor, e as memórias ficam armazenadas na máquina local do usuário. O PIN local é uma proteção leve contra uso acidental, não um controle de segurança forte.
- A interface é somente em português; outros idiomas ficam para uma versão futura.
- Os alunos já sabem o que é uma progressão, conforme as premissas do documento de requisitos.
- Números decimais são aceitos, por serem usados pelos alunos (exemplo `1,5; 3; 4,5`).
- Para `2, 4, 8`, o resultado é `16`, conforme o exemplo oficial; a regra de precedência prioriza o padrão mais simples e mais específico.
- "Sequência grande" é considerada até 1.000.000 de números nesta versão.
- "Acertar sempre" é interpretado como: nunca devolver um número sem um padrão demonstrável e sempre informar quando não houver padrão.
