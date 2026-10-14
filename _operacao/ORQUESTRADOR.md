# Orquestrador do catálogo VISUAIS

> Este é o único arquivo que a sessão orquestradora lê para trabalhar, além de [`../CLAUDE.md`](../CLAUDE.md) e da Fase 0 de [`../PLAN.md`](../PLAN.md). Produtor, revisor, corretor e agente de ferramenta **não** o leem: cada um tem o próprio briefing em `.claude/agents/visuais-*.md`, na raiz do repositório.

## O prompt que inicia uma sessão

**Abra a sessão dentro da pasta do catálogo**, não na raiz do repositório:

```
cd _projetos/26_arquitetura-unificada-dashboards/VISUAIS
claude
```

e cole, trocando `N` pelo número do lote:

```
Leia _operacao/ORQUESTRADOR.md e execute o Lote N. Tudo por agente; nada de produção, revisão ou conserto na sessão.
```

**Por que dentro da pasta.** A memória automática do Claude Code é escolhida pela pasta em que a sessão abre. Aberta na raiz, a sessão e **todo agente que ela lança** recebem o índice de memória do repositório inteiro (19 KB, mais de 400 memórias de todas as frentes) que o catálogo não usa. Aberta em `VISUAIS`, a memória é própria e nasce vazia. Os `CLAUDE.md` da raiz e do projeto 26 continuam carregando (o Claude Code sobe até a raiz do git), e para os agentes isso é cortado pelo `omitClaudeMd: true` do frontmatter de cada um. Medido em 2026-10-01: um agente lançado de uma sessão na raiz nasce com **36 a 37 mil tokens** antes de ler qualquer arquivo; desses, cerca de 11 mil são o `CLAUDE.md` da raiz, 5 mil o índice de memória e 2 mil o `CONVENTIONS.md`.

Sessão aberta na raiz também funciona (`Leia _projetos/26_arquitetura-unificada-dashboards/VISUAIS/_operacao/ORQUESTRADOR.md e execute o Lote N.`), só custa mais.

### Teste de contexto, uma vez por versão do Claude Code

Na primeira sessão depois de 2026-10-01, antes do lote, lance este agente e anote o resultado no `STATUS.md` (bloco "Contexto de nascimento"):

`Agent(subagent_type: "visuais-corretor", model: "haiku", prompt: "DIAGNÓSTICO, não é tarefa. Não use ferramenta. Em até 6 linhas: (1) você vê um CLAUDE.md com a linha '@CONVENTIONS.md'? copie a linha ou diga 'não vejo'; (2) você vê um índice de memória com links como 'user_profile.md'? copie a primeira linha ou diga 'não vejo'; (3) você vê o briefing 'Corretor do catálogo VISUAIS'? sim ou não.")`

Esperado: "não vejo" nos dois primeiros, "sim" no terceiro, e uso abaixo de 25 mil tokens. Se o CLAUDE.md ainda aparecer, o `omitClaudeMd` não está valendo nesta versão e o custo por agente fica 11 mil tokens mais alto; registre e siga.

## Onde estão os lotes e como saber o que vai ser feito

- **A sequência dos 24 lotes está em [`../PLAN.md`](../PLAN.md), seção "Os 24 lotes, em sequência"**, com os modelos de cada um nomeados. A lista é dado em `fila.json` (`lotes`); o PLAN é a leitura humana dela.
- **Antes de lançar qualquer agente, a sessão roda `node ../_operacao/fila.mjs --lote N`** e mostra a saída: cada modelo do lote na faixa em que está hoje (`produzir`, `revisar`, `corrigir` ou `pronto`) e o prompt exato que o agente vai receber. Isso é o que vai ser feito; nada além disso entra no lote.
- Lote de ferramenta (1 a 3) lista itens `F0.x`; o texto de cada um, com Escopo e Aceite, está na Fase 0 do PLAN.
- Modelo `pronto` é pulado. Rodar o mesmo lote de novo retoma de onde parou.
- O lote termina quando todos os seus modelos estão `pronto` ou registrados no LOG como `bloqueado` ou `reprovado, pendência conhecida`. Aí a sessão marca o lote como concluído no PLAN, commita e para.
- Lote livre, fora da sequência, só a pedido explícito do dono: `execute 6 itens da faixa revisar` usa `fila.mjs --faixa revisar --proximos 6`.

## O que a sessão faz, e o que ela não faz

**Faz:** descobre o próximo trabalho pelo disco, lança agentes com o prompt pronto, confere o portão com um comando, escreve uma linha por agente no `LOG.md` e atualiza os números do `STATUS.md` no fim.

**Não faz:** ler `CONTRATO.md`, `ARMADILHAS.md`, `PRODUCAO.md`, README de família ou estudo; abrir PNG; escrever `Chart.tsx`, `data.ts`, `meta.json` ou README de modelo; alterar a ferramenta; decidir pelo dono; commit sem pedido. Se a sessão se pegar fazendo qualquer um desses, é sinal de que está gastando a janela que precisa sobreviver para coordenar.

## Protocolo

### 0. Preparação

1. Em `_render` (dentro de `VISUAIS`): `npm run pendencias -- --sem-tipos` (cerca de 15 s; grava `.qa/pendencias.json`).
2. `node ../_operacao/fila.mjs --resumo` e depois `node ../_operacao/fila.mjs --lote N`. A segunda saída é a lista do que vai ser feito: cada modelo com a **faixa** de hoje, o **agente**, o **LLM** e o **prompt** prontos. Mostre essa saída ao dono antes de lançar.
3. Se o lote é de ferramenta (1 a 3), leia em `../PLAN.md` só os itens `F0.x` que ele cita.
4. Leia `DECISOES_PENDENTES.md` só se um item citar um `D<n>`. Decisão em aberto vira "Nota do dono" no prompt do agente com o padrão adotado; nunca vira decisão sua.

### 1. Fase 0 primeiro, e sozinha

Item de ferramenta muda o que todos os outros agentes usam, então roda com **nenhum** outro agente em voo, um por vez:

`Agent(subagent_type: "visuais-ferramenta", model: "opus", run_in_background: true, prompt: "Item: <texto integral do item, incluindo Escopo e Aceite>")`

Ao voltar, leia o relatório (até 15 linhas). `Aceite: atendido` marca `[x]` no PLAN com a data; `parcial` marca `[~]` e copia a frase do que falta para o item. Só então o lote de produção começa.

### 2. Lote de produção e revisão

Pool padrão: **3 agentes em voo**. Os itens são os que `fila.mjs --lote N` imprimiu; nada de fora do lote. Lance os independentes numa mesma mensagem:

`Agent(subagent_type: "<agente da linha>", model: "<llm da linha>", run_in_background: true, prompt: "<prompt da linha>")`

Quando um termina, lance o próximo do lote. Rode `node ../_operacao/fila.mjs --lote N` de novo a cada rodada de conclusões: o estado vem do disco, nunca da sua memória, e é assim que um modelo recém-produzido aparece na faixa `revisar` dentro do mesmo lote.

**Encadeamento por resultado:**

- **Produtor terminou.** Confira o portão em `VISUAIS/_render`: `npm run check -- <alvo> --sem-tipos 2>&1 | grep -E "com erro|FALHOU"; echo "exit=$?"` (o `grep` imprime a linha de resumo do check; o código de saída do próprio `npm run check` é 1 quando há erro). Zero erros: escreva no LOG e siga; o modelo aparece na faixa `revisar` na próxima leitura da fila. Mais que zero: lance **um** corretor com `Modelo: <alvo>. Versões reprovadas ou com erro de check: <as que o check nomeou> (check_erro). A nota de recusa está na saída do check.` e confira de novo. Segunda falha: LOG com `bloqueado` e passe adiante; não insista.
- **Corretor terminou.** Lance o revisor do mesmo modelo com o prompt da faixa `revisar` (regere a fila para obtê-lo).
- **Revisor terminou.** Aprovou tudo: LOG. Reprovou: lance **um** corretor (única rodada de correção do modelo) e depois o revisor de novo. Segunda reprovação: LOG com `reprovado, pendência conhecida` e passe adiante.

### 3. O que a sessão lê de cada agente

Só o relatório final. Não reabra arquivos para conferir; o portão é o comando do passo 2. Duas linhas do relatório são canais de retorno ao dono e precisam chegar ao LOG textualmente: `Defeito de ferramenta ou de régua` e `Dúvida para o dono`.

### 4. LOG

Uma linha por agente concluído em `LOG.md`: `| data | faixa | alvo | agente/llm | resultado | retorno ao dono |`. Resultado é uma palavra: `aprovado`, `reprovado`, `check ok`, `bloqueado`, `parcial`, `atendido`.

### 5. Fim do lote

1. `npm run pendencias` (com tipos, cerca de 30 s) e `node ../_operacao/fila.mjs --resumo`.
2. Em `../STATUS.md`, atualize só o bloco **Números** com a saída do resumo e a data. Em `../PLAN.md`, marque o lote na linha "Lotes concluídos" com a data (ou "parcial: <o que faltou>").
3. Se houve produção: `npm run galeria`.
4. **Commit e push, autorizados pelo dono em 2026-10-01 (D10).** Da raiz do git (`cd "$(git rev-parse --show-toplevel)"`), só os caminhos do catálogo: `git add _projetos/26_arquitetura-unificada-dashboards/VISUAIS _projetos/26_arquitetura-unificada-dashboards/STATUS.md _projetos/26_arquitetura-unificada-dashboards/PLAN.md .claude/agents` e `git commit -m "feat(26/VISUAIS): lote N, <o que entrou em uma frase>"`, depois `git push`. Nunca `git add -A`: o repositório tem trabalho de outras frentes fora do catálogo.
5. Relate ao dono em até 12 linhas: itens por faixa, aprovados, reprovados e bloqueados, os retornos ao dono, o hash do commit, e qual é o próximo lote. Diga explicitamente que tudo foi por agente e o que, se algo, foi na sessão.
6. Pare. Lote novo só com pedido.

### Parar

Quando o dono mandar parar: nenhum agente novo, espere os em voo, LOG, passo 5, encerre. Agente devolvendo erro de cota ou limite de uso: mesmo procedimento.

## Custos de referência para dimensionar o lote

Medidos em setembro de 2026, antes do dossiê enxuto (F0.1):

| Trabalho | Tokens de agente |
|---|---|
| Modelo novo de 4 versões, com dossiê e guia, passando de primeira | 0,3 a 0,5 M |
| O mesmo, com uma rodada de correção | 0,6 a 1,5 M |
| Revisão de um modelo | 0,15 a 0,3 M |
| Correção | cerca de 0,3 M |
| Uma janela de cota | 3 a 6 modelos |

## O que este protocolo substitui

O script de Workflow `visuais-farol-producao-wf_402a69c5-726.js`, em `~/.claude/projects/…/workflows/scripts/`, cujo produtor lia o `CONTRATO.md` inteiro e cujo briefing vivia fora do repositório. Não o use mais. Os briefings agora vivem em `.claude/agents/visuais-produtor.md`, `visuais-revisor.md`, `visuais-corretor.md` e `visuais-ferramenta.md`, versionados com o repositório; quem quiser mudar como um papel trabalha edita o arquivo dele, e a mudança vale para toda sessão seguinte.
