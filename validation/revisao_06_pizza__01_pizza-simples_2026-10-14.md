# Parecer de revisão: 06_pizza/01_pizza-simples

Data: 2026-10-14. Revisor independente, primeira passada das três versões em `sem_revisao` (a `v1` já estava aprovada desde 2026-09-28 e não entrou nesta rodada). Julgadas pelos arquivos de hoje e pelos PNGs de 2026-10-02, posteriores ao último `Chart.tsx` (2026-09-28). `npm run check` com tipos: 0 com erro, 3 avisos, todos da `v1` e todos em fila de dívida da TEXTO-NA-MARCA; `v2`, `v3` e `v4` saem `ok`.

Resultado: duas aprovadas e uma reprovada. A `v3` cai por um defeito só, de comportamento: a seleção padrão trava o acendimento por ponteiro e por foco, que é uma das coisas que o catálogo diz que a versão demonstra. A `v2` e a `v4` passam nas 32 perguntas. As observações não bloqueantes das três estão no README do modelo, seção `Observações da revisão (não bloqueantes)`, parágrafo de 2026-10-14.

| Versão | Resultado | Não |
|---|---|---|
| `v2_nao-comparecimento-em-destaque` | aprovada | nenhum |
| `v3_perdas-por-motivo-com-legenda-tabular` | reprovada | nenhuma das 32 (ver abaixo) |
| `v4_origem-dos-leads-com-dado-ausente` | aprovada | nenhum |

Não se aplica: 4, 7, 13, 18, 25, 26 e 29 nas três; 28, 31 e 32 na `v2` e na `v3`, que não têm conector; 30 na `v2` e na `v4`, que não têm opacidade.

## O que foi conferido à mão

* **Percentual pelo maior resto, refeito do `data.ts`:** `v2` 58, 17, 15 e 10 sobre 82 agendas; `v3` 32, 26, 18, 15 e 9 sobre 212 perdas; `v4` 44, 37, 3, 2 e 14 sobre 340 leads, com a ausência dentro do todo. Todos somam 100 no que está impresso.
* **Opacidade da `v3` (ACE-5), composta contra o cartão a partir das cores do preview:** escuro 4,23, 4,70, 3,85 e 3,52:1; claro 3,66, 3,26, 3,83 e 3,22:1 (`--chart-3`, `--chart-6`, `--chart-5` e `--text-muted`). Todos acima de 3:1. A guarda OPACIDADE-MARCA não mediu: declarou `sem_opacidade_em_marca`, o que não é verdade, porque o `fillOpacity` existe e só não é resolvido pelo leitor.
* **Legenda em HTML (`foreignObject`) da `v2` e da `v3`**, que a COLISAO-TEXTO e a CONTRASTE-TEXTO não alcançam: só pares aprovados da 17.10 (`--text-primary`, `--text-secondary` e `--text-muted` sobre `--surface-raised`); cabeçalhos alinhados com a coluna na `v3`; na `v2` o cabeçalho "agendas" transborda a coluna, registrado como observação.
* **Guias da `v4` (ROT-11, ACE-6):** do mesmo lado do disco a ordem de cima para baixo é a angular, nenhuma guia cruza outra nem atravessa fatia, e a guia em `--text-muted` mede 5,21 e 5,37:1.
* **Slots de cor:** `v3` e `v4` usam índices 0, 2, 5 e 4 de `CHART_SERIES_COLORS`, isto é, 1, 3, 6 e 5 da COR-8, com a cauda e a ausência fora dos slots.

## `v3_perdas-por-motivo-com-legenda-tabular`: reprovada

### Bloqueante único. Seção 14.1, "versão que não demonstra o que o catálogo diz"; armadilha DAD-10

Nenhuma das 32 perguntas cobre estado interativo, por isso a coluna "Não" fica vazia; o enquadramento é o da 14.1, e a armadilha é a DAD-10, de comentário que promete o que o código não entrega.

**O que o catálogo diz.** A versão demonstra "Hover e foco ligados nos dois sentidos por estado React" (o `meta.json` repete: "Ponteiro e teclado acesos nos dois sentidos").

**O que está no código.** `Chart.tsx:129` faz `const activeId = selectedId ?? hoverId;`, e a seleção nasce preenchida: `data.ts:38` exporta `selectedId = 'preco'`, e o default do parâmetro em `Chart.tsx:105` troca `undefined` por `'preco'`, então nenhum consumidor consegue montar sem seleção. Com seleção presente, `activeId` ignora `hoverId`: passar o ponteiro numa fatia ou numa linha, ou chegar nela pelo teclado, não muda raio, opacidade nem peso de nada. Clicar em outra linha só troca a seleção e trava de novo. O acendimento por ponteiro e por foco só funciona depois de clicar na linha já selecionada para desmarcar, estado que ninguém encontra sem saber que existe.

**O comentário promete o contrário.** `Chart.tsx:128`: "a seleção manda, e o ponteiro ou o teclado dá uma prévia sem apagar a seleção". Não há prévia em estado nenhum: sem seleção não há o que apagar, e com seleção o ponteiro é ignorado.

**Por que reprova e não anota.** A peça é a referência do catálogo para legenda tabular interativa. Quem copiar leva um acendimento morto no estado em que a peça abre, e o preview estático não tem como mostrar isso a quem revisa pela imagem.

**O que mudar, só no `Chart.tsx`:**

* `Chart.tsx:129`: `const activeId = hoverId ?? selectedId;`. O ponteiro e o foco passam a dar a prévia, e ao sair (`onMouseLeave`, `onBlur`) a peça volta para a seleção, que é o que o comentário já descreve. O `aria-pressed` continua preso à seleção, como está.
* Opcional, na mesma mexida: aceitar ausência de seleção inicial (por exemplo `selectedId?: string | null`, com `null` para nenhuma), porque hoje o default do parâmetro torna impossível montar a peça sem um motivo aceso.

O PNG não muda, porque `hoverId` é `undefined` no render. Depois da troca: `npm run render -- 06_pizza/01_pizza-simples --tema ambos` e `npm run check -- 06_pizza/01_pizza-simples`, e conferir no navegador que passar o ponteiro em "Escolheu outro fornecedor", com Preço selecionado, aumenta o raio daquela fatia, apaga as demais e põe o nome dela em 700, e que sair devolve Preço.

**Fora do bloqueante, para não perder na mesma rodada:** as quatro observações da `v3` no README (amostra cheia contra fatia apagada, "mi" e "mil" na mesma coluna com o líder em valor fora da linha de leitura, `MARGIN` ausente, composição de Outros só para quem enxerga) podem ser fechadas junto, sem obrigação.
