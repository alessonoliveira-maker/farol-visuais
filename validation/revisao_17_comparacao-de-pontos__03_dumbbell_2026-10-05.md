# Parecer de revisão: 17_comparacao-de-pontos/03_dumbbell

> Data: 2026-10-05. Revisor independente. `npm run check`: 0 com erro, 0 avisos, 4 versões.
> Julgadas: `v1`, `v2`, `v3` e `v4`, todas `sem_revisao`.
> Resultado: `v1`, `v2` e `v3` aprovadas; `v4` reprovada, com 2 bloqueantes.
> Observações das aprovadas: README do modelo, seção `## Observações da revisão (não bloqueantes)`.

## v4_micro-halteres-de-cpl-com-mes-ausente: REPROVADA

Arquivo julgado: `Chart.tsx` de 2026-10-05 09:31, PNGs de 09:32, nos dois temas.

### Bloqueante 1. Pergunta 19, ACE-2, com COR-5 e TOK-4: as metades do marcador bipartido só se separam por matiz

**Evidência.** Em `MicroDumbbell`, no ramo `gap < SPLIT_BELOW`, os dois `halfDisc` são pintados em
`--chart-3` e `--chart-1`, cheios, encostados um no outro, sem vão e sem contorno. Medido pela fórmula
da WCAG com os hex de `app/src/styles/tokens.css`: `--chart-1` contra `--chart-3` dá **1,47:1 no escuro
e 1,03:1 no claro**, os mesmos números que a TOK-4 do `ARMADILHAS.md` registra. Cada metade tem 4 px de
largura (3,9 px no render, porque a coluna de 128 px encolhe o viewBox de 132). No PNG claro, linha
`Rede social`, o marcador lê como um disco escuro só; a divisão aparece apenas ampliando 3 vezes. A
amostra da legenda (`diferença menor que a cabeça`) repete o defeito.

Soma se a isso que a metade de julho deixa de ser vazada: nas outras linhas julho é anel e agosto é
disco cheio (forma), e no bipartido os dois viram cheios. O único canal que sobra para dizer qual mês é
qual é a cor, e ela mede 1,03:1. É o recurso que a versão existe para demonstrar ("cabeças a menos de
dois raios mais 2 px viram marcador bipartido").

**O que mudar.** Devolver a forma ao bipartido e separar as metades, pela saída da TOK-4 e da COR-5:

1. metade de julho vazada (miolo na cor da superfície do cartão, contorno `--chart-3` de `HEAD_STROKE`)
   e metade de agosto cheia em `--chart-1`, a mesma gramática das cabeças inteiras;
2. vão de pelo menos 1,5 px entre as metades, ou contorno na cor da superfície de 1 a 2 px;
3. a amostra da legenda desenhada do mesmo jeito.

Conferir no PNG claro em tamanho real, não ampliado.

### Bloqueante 2. Pergunta 15, seção 17.7 (cartão próprio da moldura `stage`): o cartão não existe

**Evidência.** O `meta.json` declara `frame: "stage"` "porque o visual já é o próprio cartão de KPI", e
a seção 13 do contrato diz que na moldura `stage` o Chart vai "direto no palco, sem cartão em volta". A
tabela da 17.7 manda o cartão próprio: `p-4 rounded-lg border border-line-subtle`. A raiz do Chart é
`flex h-full w-full min-w-0 flex-col justify-between text-xs`: sem fundo, sem borda, sem padding. As
versões `stage` de cartão único do acervo (`01_cards-e-kpis/01_kpi-simples/v1` a `v3`, por exemplo)
trazem na raiz `rounded-lg border border-line-subtle bg-surface-raised p-4`.

Consequência nos dois PNGs: o conteúdo está solto sobre `--surface-canvas`, e o miolo das cabeças
vazadas (`fill="var(--surface-raised)"`) é pintado numa cor que não é a do fundo. Amostrado no PNG:
fundo `#0b1220` e miolo `#121c2e` no escuro (1,10:1), fundo `#f6f8fc` e miolo `#ffffff` no claro
(1,06:1). No Farol, a moldura `stage` vai direto na grade sem `VisualCard`, então a peça chegaria sem
superfície nenhuma.

**O que mudar.** Pôr o cartão na raiz (`rounded-lg border border-line-subtle bg-surface-raised p-4`),
inclusive no ramo de vazio, como fazem `01_cards-e-kpis/02/v2` e `v4`. O corpo útil cai de
328 x 181,5 px para 294 x 147,5 px, e o conteúdo pede 164 px de altura (4 linhas de 32 px, 8 de
respiro, rodapé de 36 px). Refazer a conta da GEO-1 e declarar o canvas por número se o `kpi-alto` não
fechar. Com 294 px de largura a coluna do haltere cai de 128 para cerca de 94 px, e o `<svg>` de
viewBox fixo de 132 encolhe junto: a cabeça de raio 4 passaria a cerca de 2,8 px. Ajustar `VIEW_W` à
coluna real, ou as colunas da grade, para a cabeça continuar com o raio declarado.

### Observações da v4 (não reprovam; saem na mesma rodada porque o arquivo já vai ser tocado)

- **Título cortado na moldura.** `title` com 49 caracteres sai como "Micro halteres de custo por lead
  com mês aus…" nos dois PNGs, e a palavra que some é o assunto da versão. O título do catálogo,
  "Micro halteres de CPL com mês ausente", cabe.
- **Nenhum CPL absoluto está escrito.** O cartão imprime só o delta; os valores de julho e de agosto
  só existem na frase acessível e nos extremos do rodapé, e a peça não tem dica. Na linha `Display` não
  há número nenhum: o ponto solto de julho vale R$ 45 e isso não se lê. Sugestão: o valor de julho
  junto do texto "sem veiculação em ago/26", ou o valor atual ao lado do delta (NUM-4 pede a base).
- **TIP-1.** O rodapé "de R$ 31 a R$ 86 por lead" e o "ago/26" de "sem veiculação em ago/26" são número
  em Manrope sem `tabular-nums`. Sem consequência visível.
- **TIP-7.** O nome da plataforma tem `truncate` numa coluna de 88 px. No dado padrão nada é cortado,
  mas nome de marca desenhada não pode sumir por reticência; deixar quebrar ou alargar a coluna.
- **ROT-4.** A legenda fica abaixo do desenho, e a regra pede acima ou ao lado. Sem consequência.

## v1, v2 e v3: aprovadas

As 32 perguntas respondidas com sim (não se aplica: 6, 27, 28, 29, 30 nas três; 26 no modelo, que tem
as 4 versões no disco). Conferido à mão o que o `check` não mediu: `v1` e `v2` sem marca de barra nem
área, sem opacidade; `v3` idem. Contas refeitas: `v2` tem 9 de 22 acima de 15% (6 subiram, 3 caíram) e
`Encontro de clientes`, com 15,0% exatos, fica neutra; `v3` tem 6 de 14 abaixo da meta. As observações
de cada uma estão no README do modelo.
