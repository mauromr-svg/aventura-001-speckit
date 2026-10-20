# Feature Specification: Castelo do Eco (versão web)

**Feature Branch**: `002-castelo-do-eco-web`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "realize a Fase 2: versão web \"Castelo do Eco\" com gráficos das sequências (RF-10), histórico, site de documentação dos conceitos matemáticos (RF-20) e interface temática (RF-09), reaproveitando o núcleo de core"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aluno descobre o próximo número no Castelo do Eco (Priority: P1)

O aluno abre o Castelo do Eco no navegador, informa seu nome ou apelido, digita uma sequência e recebe o próximo número com o nome do padrão. As respostas são exatamente as mesmas da Sala do Eco (versão console).

**Why this priority**: É o valor central do produto e o que a diretoria quer ver na apresentação; sem isso, os gráficos e o histórico não têm o que mostrar.

**Independent Test**: Abrir o Castelo do Eco, informar cada exemplo oficial dos professores e conferir que o resultado é igual ao da Sala do Eco.

**Acceptance Scenarios**:

1. **Given** o Castelo do Eco aberto e o nome informado, **When** o aluno digita `3, 6, 9, 12` e confirma, **Then** a tela mostra `15` e o padrão "progressão aritmética".
2. **Given** o Castelo do Eco aberto, **When** o aluno digita `2, 4, 8`, **Then** a tela mostra `16` e o padrão "progressão geométrica".
3. **Given** o Castelo do Eco aberto, **When** o aluno digita `1,5; 3; 4,5`, **Then** a tela mostra `6`.
4. **Given** o Castelo do Eco aberto, **When** o aluno digita `10, 20, 30, abc`, **Then** a tela informa, em português, que `abc` (item 4) não é um número, sem perder o que foi digitado.
5. **Given** o Castelo do Eco aberto, **When** o aluno digita `3, 1, 4, 1, 5`, **Then** a tela informa que não há padrão e não mostra número.

---

### User Story 2 - Aluno vê o gráfico da sequência (Priority: P1)

Depois de cada eco, o aluno vê um gráfico com os números que digitou e o número previsto, destacado de forma diferente, para perceber visualmente o padrão.

**Why this priority**: Gráficos são requisito aprovado de alta prioridade (RF-10) e principal diferencial visual pedido pela diretoria.

**Independent Test**: Informar `1, 4, 9, 16` e conferir que o gráfico mostra cinco pontos (1, 4, 9, 16 e 25), com o 25 destacado como previsão.

**Acceptance Scenarios**:

1. **Given** um eco com padrão encontrado, **When** a resposta aparece, **Then** o gráfico mostra cada número na ordem em que foi digitado e o número previsto destacado.
2. **Given** um eco sem padrão, **When** a resposta aparece, **Then** o gráfico mostra só os números digitados, sem previsão.
3. **Given** uma entrada inválida, **When** a mensagem de erro aparece, **Then** nenhum gráfico novo é desenhado.
4. **Given** uma sequência com muitos números, **When** o gráfico é exibido, **Then** ele continua legível e a página não trava.

---

### User Story 3 - Histórico de ecos no navegador (Priority: P2)

Cada eco feito no Castelo do Eco é guardado como memória e continua disponível depois de fechar e reabrir a página. O aluno vê suas memórias da mais recente para a mais antiga e pode reabrir o gráfico de qualquer uma.

**Why this priority**: O histórico é requisito aprovado (RF-05, RF-19) e as memórias "nunca podem ser perdidas" (RNF-11), mas o eco e o gráfico funcionam sem ele.

**Independent Test**: Fazer dois ecos, fechar a página, reabrir e conferir que os dois aparecem no histórico, com o gráfico de cada um.

**Acceptance Scenarios**:

1. **Given** ecos realizados, **When** a página é fechada e reaberta, **Then** o histórico contém todos os ecos anteriores, com data e hora.
2. **Given** um histórico existente, **When** o aluno escolhe um eco, **Then** o gráfico e a resposta daquele eco são exibidos novamente.
3. **Given** um histórico com erros e sequências sem padrão, **When** o aluno o consulta, **Then** esses ecos também aparecem, identificados como erro ou sem padrão.

---

### User Story 4 - Professor vê o que os alunos digitaram (Priority: P2)

O professor acessa, no mesmo computador e navegador usados pelos alunos, uma área protegida por PIN e vê os ecos feitos ali, agrupados por aluno, com a sequência digitada, o resultado ou o erro, e a data e hora. O administrador, com PIN próprio, pode apagar as memórias daquele navegador após confirmação explícita.

**Why this priority**: É a necessidade principal da Professora Carla (RF-18) e já existe na Sala do Eco; a versão web precisa manter essa capacidade.

**Independent Test**: Registrar ecos de dois alunos, entrar na área do professor com o PIN e conferir os ecos agrupados por aluno.

**Acceptance Scenarios**:

1. **Given** ecos de alunos diferentes feitos no mesmo navegador, **When** o professor entra com o PIN correto, **Then** vê os ecos agrupados por aluno.
2. **Given** ecos feitos em outro computador ou navegador, **When** o professor entra com o PIN, **Then** esses ecos não aparecem (cada navegador guarda apenas os próprios ecos).
3. **Given** o PIN errado 3 vezes, **When** o professor tenta entrar, **Then** o acesso é negado e nenhum dado é exibido.
4. **Given** memórias existentes, **When** o administrador pede para apagá-las e confirma com a palavra `APAGAR`, **Then** o histórico fica vazio; sem a confirmação, nada é apagado.

---

### User Story 5 - Site de documentação dos conceitos matemáticos (Priority: P3)

Alunos e professores acessam, a partir do Castelo do Eco, páginas que explicam cada padrão reconhecido (constante, progressão aritmética, progressão geométrica, Fibonacci e polinomial), com definição, exemplos e como o eco escolhe entre padrões quando há mais de uma interpretação.

**Why this priority**: É requisito aprovado (RF-20) e ajuda em sala, mas o produto entrega valor sem ele.

**Independent Test**: Abrir a documentação e conferir que há uma página para cada padrão, com ao menos dois exemplos que, digitados no Castelo do Eco, produzem o resultado indicado.

**Acceptance Scenarios**:

1. **Given** o Castelo do Eco aberto, **When** o usuário abre a documentação, **Then** vê a lista dos cinco padrões e uma página explicando a ordem de precedência (ex.: por que `2, 4, 8` resulta em `16`).
2. **Given** a página de um padrão, **When** o usuário escolhe um exemplo, **Then** o exemplo é enviado ao Castelo do Eco e o resultado mostrado é o mesmo informado na página.
3. **Given** uma resposta do eco, **When** o aluno escolhe saber mais sobre o padrão, **Then** é levado à página daquele padrão.

---

### User Story 6 - Interface temática do Castelo do Eco (Priority: P3)

A interface tem identidade visual de castelo (cores, ilustrações e textos no tom do "eco mágico"), coerente em todas as telas, sem prejudicar a leitura dos números e mensagens.

**Why this priority**: A diretoria pediu uma interface "bonita" (RF-09), mas o tema depende das funcionalidades estarem prontas.

**Independent Test**: Percorrer todas as telas (eco, gráfico, histórico, área do professor, documentação) e conferir que seguem o mesmo tema e que textos e números continuam legíveis.

**Acceptance Scenarios**:

1. **Given** qualquer tela do Castelo do Eco, **When** ela é exibida, **Then** segue a mesma identidade visual de castelo.
2. **Given** qualquer tela, **When** é exibida, **Then** todos os textos estão em português do Brasil.

---

### Edge Cases

- Entrada vazia ou só com separadores: a tela pede uma sequência, sem gerar eco nem gráfico.
- Sequência com 2 números (`2, 4`): tratada como progressão aritmética (`6`), como na Sala do Eco; 1 número é rejeitado.
- Sequência muito longa (até 1.000.000 de números): a resposta aparece sem travar a página; o gráfico pode resumir os pontos, mas mostra o primeiro, o último e a previsão.
- Valores muito grandes, negativos, zero ou decimais: o gráfico mantém a escala legível e a resposta é exata.
- Resultado fracionário (`9, 6, 4` → `8/3`): mostrado como fração e posicionado corretamente no gráfico.
- Armazenamento do navegador cheio, bloqueado ou apagado pelo usuário: o sistema avisa em português que a memória não foi guardada, e o eco continua funcionando.
- Dados de memória danificados: o sistema avisa, preserva o que for possível e continua funcionando.
- Página aberta em duas abas ao mesmo tempo: nenhum eco é perdido.
- Texto com símbolos ou código (`<script>`, `1; DROP`): rejeitado como número inválido e nunca interpretado nem exibido como código.
- Navegador sem conexão: o Castelo do Eco continua funcionando depois de carregado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer uma versão web, o Castelo do Eco, acessível por navegador (RF-09).
- **FR-002**: O Castelo do Eco MUST produzir exatamente os mesmos resultados, padrões e mensagens de erro da Sala do Eco para a mesma entrada, usando a mesma lógica de reconhecimento (constituição, Princípio I).
- **FR-003**: O sistema MUST aceitar os mesmos formatos de entrada da Sala do Eco (separadores vírgula, espaço ou ponto e vírgula; vírgula decimal quando houver ponto e vírgula) e as mesmas regras de quantidade mínima.
- **FR-004**: Após cada eco válido, o sistema MUST exibir um gráfico daquela sequência, com os números digitados e, quando houver, o número previsto destacado (RF-10). Gráficos agregados do histórico estão fora do escopo desta fase.
- **FR-005**: O sistema MUST guardar cada eco (aluno, entrada, resultado ou erro, data e hora) como memória persistente no próprio navegador, preservada entre aberturas da página (RF-05, RF-19, RNF-11). As memórias não são compartilhadas entre computadores ou navegadores.
- **FR-006**: O aluno MUST poder consultar suas memórias, da mais recente para a mais antiga, e reabrir o gráfico de qualquer uma.
- **FR-007**: O aluno MUST informar nome ou apelido (1 a 40 caracteres) antes do primeiro eco da sessão.
- **FR-008**: O professor MUST poder ver, numa área protegida por PIN, o que cada aluno digitou naquele navegador e onde errou (RF-18).
- **FR-009**: O administrador MUST poder apagar as memórias numa área protegida por PIN próprio, somente após confirmação explícita (RF-17).
- **FR-010**: O sistema MUST oferecer documentação dos conceitos matemáticos com uma página por padrão reconhecido e uma página sobre a ordem de precedência, com exemplos executáveis no Castelo do Eco (RF-20).
- **FR-011**: Cada resposta com padrão MUST oferecer acesso à página de documentação daquele padrão.
- **FR-012**: Todas as telas MUST seguir a identidade visual temática do Castelo do Eco (RF-09).
- **FR-013**: Todos os textos MUST estar em português do Brasil (RNF-09).
- **FR-014**: O sistema MUST tratar toda entrada como não confiável e MUST NOT executar nem renderizar como código qualquer texto digitado pelo usuário (RNF-13).
- **FR-015**: O sistema MUST avisar o usuário, em português, quando não conseguir guardar uma memória, sem interromper o uso.
- **FR-016**: O sistema MUST continuar funcionando sem conexão depois de carregado.
- **FR-017**: O sistema MUST registrar erros relevantes para diagnóstico sem registrar sequências, nomes ou PINs (RNF-04).

### Key Entities *(include if feature involves data)*

- **Sequência**: lista ordenada de números informada pelo aluno (mesma definição da Sala do Eco).
- **Eco / Memória**: tentativa registrada com aluno, entrada, padrão, próximo número ou erro, data e hora (mesmo formato da Sala do Eco).
- **Gráfico**: representação visual de uma sequência e da previsão; derivado do eco, não armazenado separadamente.
- **Página de documentação**: explicação de um padrão, com definição, exemplos e resultado esperado de cada exemplo.
- **Perfil**: aluno, professor ou administrador, com as mesmas permissões da Sala do Eco.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos exemplos oficiais dos professores produzem, no Castelo do Eco, o mesmo resultado da Sala do Eco.
- **SC-002**: O aluno vê a resposta e o gráfico em menos de 1 segundo para sequências de até 1.000 números, e a resposta em até 5 segundos para 1.000.000 de números, sem a página travar.
- **SC-003**: Um aluno que nunca usou o Castelo do Eco obtém o primeiro eco com gráfico em menos de 1 minuto, sem ajuda.
- **SC-004**: Após fechar e reabrir a página no mesmo computador, 100% dos ecos anteriores continuam no histórico.
- **SC-005**: O professor encontra o que um aluno específico digitou naquele navegador em menos de 1 minuto.
- **SC-006**: Cada um dos cinco padrões tem página de documentação com pelo menos 2 exemplos, e 100% dos exemplos produzem no Castelo do Eco o resultado indicado na página.
- **SC-007**: 100% dos textos exibidos estão em português do Brasil.

## Assumptions

- A Sala do Eco (console) continua existindo e sendo mantida; o Castelo do Eco é uma segunda interface sobre a mesma lógica.
- Continuam valendo as premissas sem login e sem servidor da aplicação; o Castelo do Eco roda inteiramente no navegador e pode ser distribuído como arquivos estáticos. Qualquer servidor exigiria emenda à constituição.
- O tema visual será criado a partir de referências fornecidas pela diretoria; como o "app da feira" não foi identificado, o tema segue a ideia de castelo e eco mágico sem copiar nenhum produto existente.
- O uso é em navegadores atuais de computador; celular (RNF-10) e acessibilidade formal (RNF-12) estão "Em análise" e ficam fora do escopo, embora o layout não deva impedir uso futuro nesses contextos.
- Ficam fora do escopo os requisitos "Em análise": história da sala (RF-08), insights do histórico (RF-11), explicação passo a passo (RF-12), previsão de mais de um número (RF-16) e exportação para Excel (RNF-14).
- O PIN continua sendo proteção leve contra uso acidental, não um controle de segurança forte.
- O uso previsto é em laboratório ou sala com um computador compartilhado pela turma, onde o professor consulta os ecos no mesmo navegador. Juntar ecos de vários computadores (exportação/importação ou servidor) fica fora do escopo desta fase.
- Gráficos agregados do histórico (evolução, totais por aluno) ficam fora do escopo, por se sobreporem ao RF-11, que está "Em análise".
- Os ecos do Castelo do Eco (navegador) e da Sala do Eco (console) são históricos separados.
- A documentação é escrita em português e acompanha a versão do produto; não depende de serviço externo.
