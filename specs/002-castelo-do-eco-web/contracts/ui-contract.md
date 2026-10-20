# Contrato: Interface Web

Todas as telas: português do Brasil, tema do castelo, nenhum texto do usuário interpretado como HTML. Os textos de erro e os nomes de padrões são os mesmos do contrato da Sala do Eco ([../../001-sala-do-eco-console/contracts/cli-commands.md](../../001-sala-do-eco-console/contracts/cli-commands.md)).

## `index.html`: Castelo do Eco

| Elemento | Comportamento |
|---|---|
| Campo de nome | Aparece se ainda não houver nome na sessão da aba; 1 a 40 caracteres; mensagem de erro igual à do console |
| Campo de sequência + botão "Ouvir o eco" | Enter ou clique envia; o campo mantém o texto em caso de erro |
| Área de resposta | `O eco responde: <proximo>` e `Padrão: <nome>` com link "Saiba mais" para `docs/<padrao>.html`; ou a mensagem de sem padrão ou de erro |
| Indicador "Ouvindo…" | Visível enquanto o Worker calcula; o botão fica desabilitado nesse intervalo |
| Gráfico | SVG com os pontos digitados e a previsão destacada; `role="img"` e `<title>` descrevendo a sequência; aviso quando os pontos foram reduzidos ou estão fora de escala |
| Histórico | Lista das memórias do aluno atual, da mais recente para a mais antiga, com data e hora, entrada (até 60 caracteres) e resultado; clicar reabre resposta e gráfico |
| Aviso de armazenamento | Faixa visível quando uma memória não pôde ser guardada ou há memórias danificadas |
| Links | "Documentação" (`docs/index.html`) e "Área do professor" (`professor.html`) |

**Parâmetro `?seq=`**: preenche o campo e envia automaticamente, depois que o nome for informado. Passa pelo mesmo analisador.

## `professor.html`: Professor e Administrador

| Ação | Comportamento |
|---|---|
| "Entrar como professor" | Primeiro acesso: definir PIN (4 a 8 dígitos) e confirmar. Depois: pedir PIN; 3 tentativas com atraso crescente; esgotadas, volta ao estado bloqueado |
| Lista do professor | Ecos do navegador agrupados por aluno (`Nome (N ecos)`), cada um com data e hora, entrada, resultado ou rótulo de erro; aviso de que só aparecem ecos deste navegador |
| "Entrar como administrador" | Mesmo fluxo de PIN, com PIN próprio |
| "Apagar todas as memórias" | Pede a palavra `APAGAR` num campo; só então apaga; qualquer outra resposta mantém tudo |
| Campos de PIN | `type="password"`, `inputmode="numeric"`, `autocomplete="off"`; o PIN nunca aparece na tela, na URL nem no log |

## Estados de erro

| Situação | Comportamento |
|---|---|
| IndexedDB indisponível ou cota cheia | Eco e gráfico funcionam; aviso "não consegui guardar esta memória" |
| Banco com versão maior que a conhecida | Aviso; nenhuma gravação |
| Worker falha | Mensagem de erro inesperado em português; a tela continua utilizável |
| Sem conexão | Funciona normalmente se a página já foi aberta antes |
