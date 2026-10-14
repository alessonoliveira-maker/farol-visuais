# Status — Catálogo VISUAIS

_Atualizado em 2026-09-30 (sessão de reorganização da operação)_

## Números

Saída de `node _operacao/fila.mjs --resumo` em 2026-10-14, no fim do Lote 19 (o primeiro só de revisão do acervo de 2026-09-29: onze modelos revisados, nove deles com uma rodada de correção, e o `08/01` pulado por já estar em pendência conhecida desde 2026-10-02; nenhuma mudança de ferramenta). **A produção fechou no disco: as 814 versões planejadas existem.**

| Contagem | Valor |
|---|---|
| Versões planejadas | 814 em 205 modelos e 27 famílias |
| Versões no disco | 814 (100%) |
| Versões prontas (check em zero erro e veredito válido) | 670 (eram 640: o Lote 19 julgou 30 versões de onze modelos do acervo e aprovou as 30, 17 de primeira e 13 depois da rodada única de correção; nenhuma ficou em pendência conhecida) |
| Modelos completos (todas as versões no disco) | 205 de 205 |
| Modelos vazios | 0 (a família 27 fechou no disco, com sete dos oito modelos prontos, de `27/01` a `27/06` e o `27/08`, e o `27/07` com a v2 em pendência conhecida; não resta modelo a produzir, e os lotes 19 a 23 são só de revisão, com o 19 fechado em 2026-10-14) |
| Fila por faixa | corrigir 18 modelos (21 versões reprovadas: `05/07` v1 e `08/01` v2, mais as 8 que o Lote 4 fechou como `reprovado, pendência conhecida`: `09/03` v2 e v4, `09/06` v1 e v3, `11/01` v2, `11/02` v3, `15/08` v1, `16/03` v1, a `16/10` v3 do Lote 5, a `24/07` v2 do Lote 8, a `25/01` v2 do Lote 9, a `20/05` v3 do Lote 11, a `22/04` v3 do Lote 13, a `21/06` v4 e a `23/02` v4 do Lote 15, a `23/03` v3 e a `23/06` v2 e v4 do Lote 16 e a `27/07` v2 do Lote 18; essas 19 versões já gastaram a rodada de correção e só voltam por decisão do dono, assim como a `08/01` v2, que fechou em pendência conhecida em 2026-10-02 e que a fila ainda imprime na faixa `corrigir`), revisar 43 modelos (93 versões sem veredito, 30 com veredito desatualizado), produzir 0 modelos; no Lote 19 a contagem de corrigir não mudou e a de revisar caiu de 54 para 43 modelos, pelos motivos do resumo (`revisao_reprovada` 21, `sem_revisao` 93, `revisao_desatualizada` 30) |
| Guardas do `check` | 16 desde o Lote 3 (entrou a `RAIO-CONTRA-AREA`, ligada em `check.mjs` e ainda invisível para `lib/pendencias.mjs`); fila de dívida com 92 peças (entrou `06/05` v1) |
| Avisos do `check -- .` | 389 (o aviso a mais é a `06/05` v1, acusada pela guarda nova e posta na fila), nenhum de biblioteca; 0 erros (contagem de avisos não remedida nos Lotes 5 a 19; o Lote 19 tirou ao menos 8, `07/04` de 9 para 1 depois da correção, e acrescentou ao menos 1, `07/02` v4, de 0 para 1; antes dele: o Lote 18 não acrescentou nenhum, os três modelos fecharam com 0 avisos; antes dele: o Lote 17 acrescentou 6, 3 de `26/03`, CONTRASTE-MARCA em v2, v3 e v4, e 3 de `27/01`, CONTRASTE-MARCA da diagonal em v1, v3 e v4; antes dele: o Lote 16 acrescentou ao menos 9, 4 de `26/01`, 3 de CONTRASTE-MARCA em v2, v3 e v4 e 1 de FRASE-ACESSIVEL na v4, 4 de `26/02`, um de CONTRASTE-MARCA por versão, e 1 de `23/05` v4, FRASE-ACESSIVEL; antes dele: o Lote 15 acrescentou ao menos 5, 3 de `23/01`, 2 de CONTRASTE-MARCA em v2 e v3 e 1 de COLISAO-TEXTO na v3, e 2 de `23/02` v4, COLISAO-TEXTO e CONTRASTE-TEXTO; antes dele: o Lote 14 acrescentou ao menos 6, 1 de `18/04` v3, 1 de `18/05` v2 e 4 de `21/03`, estes quatro um falso positivo da AGREGACAO-ZERO, o Lote 13 acrescentou ao menos 2, 1 de `18/01` v3 e 1 de `18/02` v3, o Lote 5 acrescentou ao menos os 9 avisos de `16/08`, o Lote 7 ao menos 6, 5 de `24/02` e 1 de `24/04`, o Lote 8 ao menos 6, 4 de `24/06` e 2 de `19/03`, o Lote 9 ao menos 6, 3 de `19/04`, 1 de `19/06` e 2 de `25/01`, o Lote 10 ao menos 2, 1 de `25/02` e 1 de `25/05`, o Lote 11 ao menos 2, os dois de `20/01` v3, e o Lote 12 ao menos 6, 4 de `20/08`, 1 de `22/01` v4 e 1 de `22/02` v4) |
| Provas do `selftest` | 661 (eram 591 no início do Lote 3: 626 depois do F0.3, 661 depois do F0.4) |
| Dossiê do produtor | teto de 110 KB (112.640 B) com prova no `selftest`; o maior dos 205 é `24/01` com 112.578 B, **folga de 62 B**: a próxima emenda de régua estoura, decisão do dono em aberto |

Fechamento do Lote 3 em 2026-10-02: as quatro contagens de versão acima não mudaram (lote só de ferramenta e de régua).

## Funcionando

- Famílias 01 a 14 completas e aprovadas; 15 e 16 com todos os modelos abertos completos no disco.
- Ferramenta: render com trava entre processos, check com 15 guardas e fila de dívida, dossiê por modelo, pendências, veredito preso ao sha1, galeria, selftest.
- **Kit de operação por agente (2026-09-30):** quatro briefings versionados em `.claude/agents/visuais-{produtor,revisor,corretor,ferramenta}.md`, protocolo da sessão em [`_operacao/ORQUESTRADOR.md`](_operacao/ORQUESTRADOR.md), fila ordenada dos 81 modelos vazios com modelo-guia e LLM por linha em `_operacao/fila.json`, e `_operacao/fila.mjs`, que cruza a fila com `pendencias.json` e imprime o prompt pronto de cada agente. A sessão orquestradora não lê régua nem abre PNG. Para os briefings entrarem no git, o `.gitignore` da raiz passou de `.claude/` para `.claude/*` mais `!.claude/agents/` (2026-09-30).
- Produção medida em set/2026: irmã de v1 existente sai por cerca de 95 mil tokens de agente; modelo novo por 0,3 a 0,5 M quando passa de primeira.

## Em construção

- **24 lotes em sequência no `PLAN.md` (2026-10-01):** 1 a 3 ferramenta (dossiê enxuto, carimbo da biblioteca, consertos de régua, guarda raio contra área), 4 conserto dos 3 reprovados mais a revisão ACE-6, 5 a 18 produção dos 81 modelos vazios (6 por lote, com revisão no mesmo lote), 19 a 23 revisão do acervo de 2026-09-29 (12 por lote), 24 fechamento. `node _operacao/fila.mjs --lote N` mostra o que o lote N vai fazer hoje. Próximo lote: **1**.
- Decisões fechadas em 2026-10-01: D1 (todas as versões por modelo) e D10 (commit e push por lote, autorizados).

## Contexto de nascimento de um agente (medido em 2026-10-01)

Agente `visuais-produtor` lançado em Haiku de uma sessão aberta na raiz, sem ler arquivo nem usar ferramenta: **37,5 mil tokens**. Ele enxerga o `CLAUDE.md` da raiz inteiro (42 KB, dos quais 35 KB são a seção "Fase atual"), o `CONVENTIONS.md` (7,5 KB), o índice `MEMORY.md` da memória automática (19 KB, copiado verbatim na prova), o git status e o próprio briefing; não enxerga skills, ferramentas MCP nem os `CLAUDE.md` aninhados. Com `omitClaudeMd: true` acrescentado ao frontmatter **na mesma sessão**, nada mudou (36 mil tokens, CLAUDE.md ainda visível): a definição parece ser lida uma vez por sessão. Versão instalada 2.1.285. **A confirmar na próxima sessão** com o teste do ORQUESTRADOR. Depois disso, o produtor ainda lê o dossiê (167 KB antes do Lote 1, cerca de 45 mil tokens; 108 KB depois dele) e o guia (cerca de 10 mil), o que explica os 100 mil observados.

Resultado do teste em 2026-10-02 (sessão aberta na raiz do repositório, agente `visuais-corretor` em `haiku`): `CLAUDE.md` com `@CONVENTIONS.md` "não vejo"; índice de memória "não vejo"; briefing do corretor "sim"; **10,1 mil tokens** de nascimento, contra os 36 a 37 mil medidos antes. O `omitClaudeMd` está valendo nesta versão, e o índice de memória não chegou ao agente mesmo com a sessão aberta na raiz.

Resultado do teste em 2026-10-12, versão 2.1.295 (sessão aberta na raiz do repositório, agente `visuais-corretor` em `haiku`, sem ferramenta): índice de memória "não vejo"; briefing do corretor "sim"; **10,3 mil tokens** de nascimento, igual aos 10,1 mil de 2026-10-02. Na pergunta do `CLAUDE.md` a resposta foi "sim", mas a prova que o agente deu foi a linha `M CLAUDE.md` do git status, e a linha copiada é a que o próprio prompt do teste traz; ele não citou conteúdo do arquivo. Pelo custo, o `omitClaudeMd` segue valendo nesta versão (com o `CLAUDE.md` da raiz carregado o nascimento ficaria perto de 21 mil). A pergunta 1 do teste é ambígua, porque o git status que o agente recebe lista o nome do arquivo; quem refizer o teste deve pedir uma frase do corpo do arquivo, e não a linha `@CONVENTIONS.md`.

## Quebrado, pontos cegos e bloqueios

- **O dossiê cresceu além do que devia substituir:** 167 KB para `16/05` contra os 59 KB de 2026-09-28. O Lote 1 (F0.1, 2026-10-01) o levou a **108 KB** no papel `produtor` (com as dez perguntas) e criou o papel `revisor` com 49 KB; não chegou aos 70 KB pedidos porque o que o item manda manter já soma 68 KB. Decisão do dono registrada no LOG: cortar mais 10 KB do recorte do contrato ou dos enunciados, ou aceitar 108.
- **Carimbo do preview não cobre `@/lib/format`, `chartTheme.ts` nem `ChartTooltip`:** mexer num formatador envelhece previews com check verde. Bloqueia qualquer escrita em `app/src/`. Item F0.2.
- **Pontos cegos declarados das guardas:** contraste e espessura não medem dentro de `foreignObject` (45 versões, entre elas as 30 de `01_cards-e-kpis`); forma com `transform` desliga `CONTRASTE-MARCA` e `ESPESSURA-MARCA` (dispersão inteira); no tema claro `--surface-overlay` é o mesmo branco de `--surface-raised`. Check verde não é medido.
- **Quatro versões aprovadas antes da ACE-6** (`11/01`, `11/02`, `09/05`, `09/06`) precisam de nova revisão com foco no traço que carrega a relação. Fase 1, itens manuais.
- **459 arquivos de `VISUAIS/` fora do git** desde 2026-09-20. Decisão D10.
- **Onze decisões do dono em aberto**, cada uma com padrão adotado: [`_operacao/DECISOES_PENDENTES.md`](_operacao/DECISOES_PENDENTES.md).
- O script de Workflow antigo (`visuais-farol-producao-wf_402a69c5-726.js`, fora do repositório) está superado e não deve ser usado: o produtor dele lia o CONTRATO inteiro.
