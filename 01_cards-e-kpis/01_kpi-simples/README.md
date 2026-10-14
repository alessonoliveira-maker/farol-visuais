# KPI simples com contexto

## O que é

Cartão de moldura `stage` com um rótulo, um número grande em Space Grotesk e o contexto mínimo que impede a leitura errada desse número: período, variação com a base nomeada, anterior e meta, par de numerador e denominador, status com régua escrita, procedência, frescor do dado ou o estado honesto de ausência. Não há gráfico: é HTML com Tailwind e tokens do Farol. Lê-se de cima para baixo em três pesos (rótulo pequeno, número em 30 px, contexto pequeno), e a cor só aparece onde existe julgamento (variação, status, ponto de ação, defasagem), sempre acompanhada de sinal, ícone ou palavra.

## Quando usar

- Um número que o público já sabe ler, com rótulo, unidade e período escritos. Um número por cartão.
- Métrica acompanhada em cadência fixa, em que a variação contra o período anterior decide a leitura.
- Realizado que precisa das três âncoras na mesma leitura: atual, período anterior e meta.
- Taxa ou custo por unidade que mostra numerador e denominador para não promover ruído a tendência.
- Número de planejamento que mistura medição e premissa, ou fonte com carga agendada que precisa de carimbo.
- Métrica sem coleta ou com coleta falha, que ocupa o mesmo espaço do cartão preenchido dizendo por quê.
- Tira de abertura com até 4 cartões na mesma linha (a v4); de 5 a 6 cartões, ou grade por entidade, vá para o modelo 07.

## Quando evitar

- A forma da série recente muda a conclusão: use o [KPI com minigráfico de tendência](../02_kpi-com-minigrafico-de-tendencia/).
- O julgamento depende de meta, ritmo ou teto desenhados: use o [KPI com régua de meta](../03_kpi-com-regua-de-meta/).
- Projeção ou cenário publicado como ponto único: use o [KPI com faixa](../04_kpi-com-faixa/).
- O total só faz sentido com a composição: use o [KPI com decomposição](../05_kpi-com-decomposicao/).
- Volume que pode ser inflado à custa da qualidade: use o [par de indicadores](../06_par-de-indicadores/).
- Uma ou duas medidas dentro de uma frase corrida: use a frase com número (família 21, modelo 01).
- Métrica sem polaridade pintada de verde ou vermelho: aqui ela sai em `--text-secondary`; se todo cartão da tela ganha cor, a exceção deixa de aparecer, e o caminho é o [card de exceção](../08_card-de-excecao/).

## Anatomia

1. **Cabeçalho:** rótulo em `text-xs font-medium text-text-secondary` e período à direita em `text-[0.6875rem] text-text-muted tabular-nums`, por `formatMonthShort`. Na v3 a etiqueta de procedência sobe para uma linha própria acima do rótulo.
2. **Número:** `kpi-number text-3xl leading-none font-semibold text-text-primary`, por `formatCurrencyCompact` ou `formatInt`, com o valor exato em `title` por `formatCurrency`. A caixa tem altura fixa (`h-7.5`, 30 px) para a linha de base não dançar entre cartões.
3. **Variação:** ícone `TrendingUp`, `TrendingDown` ou `Minus`, sinal `+` ou `−` (U+2212) escrito à mão sobre `formatPercent(Math.abs(x))`, inteiro a partir de 10% e com uma casa abaixo. A cor sai da polaridade (`text-positive`, `text-negative`, `text-text-secondary` quando estável, sem polaridade ou com base abaixo de 30), nunca do sinal. A base vem na mesma linha em `text-text-muted`, com o valor em `kpi-number text-text-secondary`.
4. **Apoios:** anterior e meta em `kpi-number text-sm font-semibold`, rótulos em 11 px `text-text-muted`, duas colunas com `gap-6` e nenhuma divisória (ESP-5). Cada coluna diz em 11 px como o atual se relaciona com ela.
5. **Selo de status:** borda e texto no token semântico (`border-warning text-warning`), sem fundo tingido (COR-7), ícone de forma própria por estado (`CircleCheck`, `TriangleAlert`, `OctagonX`, `CircleDashed` para sem meta) e a palavra. A régua fica escrita em 11 px no pé do cartão.
6. **Par da razão:** numerador e denominador da mesma janela em `kpi-number text-text-secondary` dentro de uma frase em `text-text-muted`.
7. **Ponto de ação:** `CircleAlert` e a frase do limiar em `text-warning`, com `role="img"` e `aria-label` com a regra. Só existe quando o limiar é cruzado; o cartão normal não ganha marca.
8. **Procedência:** a palavra MEDIDO, DERIVADO, PREMISSA ou LACUNA em 11 px `text-prov-*`, uma vez, só na moldura `stage`.
9. **Frescor:** `Clock` com o carimbo da coleta, só a data por `formatDate` (sem hora: a lista da seção 6 não tem formatador de hora), e o prazo por `formatHours`; defasado troca para `TriangleAlert` em `text-warning` e diz há quanto tempo, por `formatDays` ou `formatHours`.
10. **Ausência:** `Unplug` e `formatUnavailable()` em `font-display text-xl text-text-muted` no lugar do número, com o motivo, a data da falha e a última medição válida. Zero medido é `0` na tipografia cheia do número, com a frase do que o zero significa.
11. **Acessibilidade:** raiz `role="group"` com `aria-label` calculado do dado (número, unidade, período, comparação e estado); ícones com `aria-hidden`.

## Versões

- [`v1_receita-com-variacao-contra-mes-anterior`](./v1_receita-com-variacao-contra-mes-anterior/) ([escuro](./v1_receita-com-variacao-contra-mes-anterior/preview.svg), [claro](./v1_receita-com-variacao-contra-mes-anterior/preview-claro.svg)): receita reconhecida de ago/26 com `+8,4%` contra jul/26. Demonstra variação com sinal tipográfico, ícone e cor pela polaridade, a base nomeada na mesma linha, o valor exato no `title` e a variação calculada dos valores exatos, não dos compactos.
- [`v2_receita-do-trimestre-contra-anterior-e-meta`](./v2_receita-do-trimestre-contra-anterior-e-meta/) ([escuro](./v2_receita-do-trimestre-contra-anterior-e-meta/preview.svg), [claro](./v2_receita-do-trimestre-contra-anterior-e-meta/preview-claro.svg)): receita do 3º trimestre em atenção a 94,0% da meta, mesmo crescendo sobre o 2º. Demonstra a hierarquia de três pesos, anterior e meta em colunas sem divisória, selo com forma, ícone e palavra, a régua escrita e o veredito calculado.
- [`v3_cpl-qualificado-com-par-frescor-e-procedencia`](./v3_cpl-qualificado-com-par-frescor-e-procedencia/) ([escuro](./v3_cpl-qualificado-com-par-frescor-e-procedencia/preview.svg), [claro](./v3_cpl-qualificado-com-par-frescor-e-procedencia/preview-claro.svg)): CPL qualificado de ago/26 com as duas parcelas. Demonstra polaridade menor melhor (queda em verde), ponto de ação aceso mesmo em queda, carimbo do dado e não da página, etiqueta DERIVADO e link esticado com foco visível sem pseudo-elemento.
- [`v4_zero-indisponivel-e-sem-base`](./v4_zero-indisponivel-e-sem-base/) ([escuro](./v4_zero-indisponivel-e-sem-base/preview.svg), [claro](./v4_zero-indisponivel-e-sem-base/preview-claro.svg)): tira de quatro cartões com zero medido, coleta falha, métrica sem mês anterior e mês parcial. Demonstra a mesma altura e a mesma linha de base do número, base pequena sem percentual, a comparação na mesma janela de dias e o estado vazio da tira.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoKpi>/`. O cartão já é a moldura: vai direto na grade, sem `VisualCard`, numa célula com altura (`h-44` para v1, `h-72` para v2 e v3, a linha inteira para a v4).
2. Troque `polarity` pelo sentido do bom do registry da métrica (`goodDirection`). Nunca decida a cor pelo sinal da variação.
3. A régua da v2 (`rule`) e o limiar da v3 (`actionThreshold`) vêm do dicionário da métrica, com data de vigência; não escreva cortes no componente.
4. Na v3, troque `data.provenance` por `resolveProvenance(metricId)` do registry (`@/data/metrics/registry`); o valor no `data.ts` do catálogo é só a amostra fixa do preview, nunca a fonte real. A palavra é a mesma que o `ProvenanceBadge` mostraria; o estilo próprio (11 px, sem borda nem fundo) é do anatomia 8, porque a v3 é moldura `stage` e não tem `VisualCard` em volta para desenhar o selo.
5. Na v3, `referenceAt` é o relógio que a página passa (hora da consulta ao servidor) e `collectedAt` é a maior data de coleta da tabela, com fuso gravado. Nenhum dos dois pode vir de `new Date()` dentro do componente, nem da hora em que a página abriu.
6. Na v3, troque `<a href>` pelo `Link` do roteador do Farol mantendo o `span` absoluto que estica a área clicável, o `aria-label` e o contorno de foco.
7. Se o KPI for embrulhado num `VisualCard` ou no `KpiCard` do Farol, retire a etiqueta de procedência da v3 (o wrapper já mostra, ANO-6) e retire borda, fundo e padding do `article` (ESP-4).
8. Na v4, o estado vazio inline e o cartão indisponível dão lugar a `EmptyState` e `UnavailableState` quando a página já os usa (seção 16, passo 7), mantendo o motivo e a última medição válida escritos.

## Referências

- [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text): com um ou dois números, o texto grande comunica melhor que o gráfico.
- [Anatomy of the KPI Card](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card): período, nome e valor como obrigatórios e o peso do delta contra o número.
- [Datawrapper Academy, formatos numéricos personalizados](https://academy.datawrapper.de/article/207-custom-number-formats-that-you-can-display-in-datawrapper): sinal, separador, sufixo e arredondamento do número grande.
- [Datawrapper Academy, células vazias exibidas como zero](https://www.datawrapper.de/academy/my-empty-cells-get-displayed-as-zeros-in-tooltips): por que vazio virando zero é bug (v4).
- [Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf): contexto insuficiente, precisão excessiva e o destaque que some quando tudo é proeminente (v3).
- [Few, Bullet Graph Design Specification, em PDF](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): medida em destaque contra medidas comparativas (v2).
- [Stacey Barr, 3 problemas dos semáforos de KPI](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/): cortes arbitrários e variação normal lida como mudança real (v2; não abriu no estudo, 403).
- [Google Cloud, Manage data freshness no Data Studio](https://docs.cloud.google.com/looker/docs/studio/manage-data-freshness) e [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/): carimbo da última atualização e prazo por fonte (v3).
- [Tremor Blocks, KPI cards](https://blocks.tremor.so/blocks/kpi-cards) e [Grafana, Stat](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/stat/): estados por ícone e o hífen padrão para sem valor, que a família proíbe.
- [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics): variantes com e sem comparação.
- Pedido de formatador: `@/lib/format` não tem uma função de hora (só data por `formatDate`); a v3 mostra só a data da coleta e omite a hora, porque fatiar `05:00` do ISO sairia da lista da seção 6 do contrato. Falta um `formatTime` (e, se o fuso precisar aparecer, um `formatTimeWithOffset` com o sinal de menos tipográfico já embutido) em `@/lib/format` para a v3 mostrar a hora sem fatiar string.
- Estudo da família: [`_estudo/familias/01_cards-e-kpis.md`](../../_estudo/familias/01_cards-e-kpis.md), modelos 1.1, 1.2, 1.3, 1.10, 1.13, 1.14, 1.15, 1.30 e 1.33.
- Farol: `app/src/components/visuals/KpiCard.tsx` (variação com ícone e ausência que não vira zero) e `app/src/lib/format.ts` (formatadores).
- Molde: `_render/exemplos/01_cards-e-kpis/01_kpi-com-sparkline/`.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-15 e reconferência independente de 2026-09-18, as quatro versões aprovadas nas duas; nada abaixo reprova._

- `v1`: o arredondamento do compacto deixa os dois números impressos sem fechar com a variação impressa (`R$ 1,2 mi` contra `R$ 1,1 mi` sugere 9,1%, e a linha diz `+8,4%`). O cálculo está certo, sai dos valores exatos; o exato só aparece no `title`, que não existe no PNG nem no papel.
- `v2`: `statusOf` compara a razão com os cortes sem olhar a `polarity`, então uma métrica de "menor é melhor" cairia em "no alvo" justamente quando estoura a meta. O dado publicado é "maior é melhor" e o preview está correto; a ressalva vale para quem colar a peça com outra polaridade.
- `v3`: a etiqueta DERIVADO desenhada dentro do Chart contraria a letra da ANO-6, e é o próprio catálogo que a pede nesta versão. O passo 7 de "Como colar no Farol" já manda retirá-la sob `VisualCard`; fica o registro para a regra e o catálogo se acertarem.
- `v3`: o número `R$ 118` não carrega o `title` com o valor exato que o item 2 da Anatomia promete e que a v1 e a v2 entregam.
- `v3`: o `useCase` do `meta.json` escreve "quando a mídia foi coletada" onde o catálogo escreve "quando a média foi coletada".
- `v4`: a frase acessível do cartão "Agendas realizadas" diz "Alta de 13,7%" e a tela escreve "+14%". `describeCard` fixa uma casa decimal em vez de seguir a régua da NUM-1 que o `ComparisonLine` aplica.
- `v4`: o cartão de zero medido é o único sem linha de comparação; a base (2 vendas nos mesmos 14 dias de jul/26) vive só na frase acessível. É escolha deliberada e documentada no código, mas quebra a simetria das quatro peças da tira.
- `v4` (2026-09-18): o `check` mede a frase acessível em 239 caracteres, 11 abaixo do teto de 250 da ACE-1. A frase cresce com o recorte, então um quinto cartão ou um rótulo mais longo estoura o teto; quem colar a peça no Farol precisa de um corte por contagem.
- `v2` (2026-09-18): o cartão trata o 3º tri/26 como fechado e não tem a linha de mês parcial que a v4 escreve. No preview isso é correto, porque o `data.ts` declara o trimestre fechado; quem colar a peça com trimestre em curso precisa levar junto a cobertura de dias, senão o atingimento de 94,0% da meta é lido como ritmo do trimestre inteiro.

## Correção de 2026-09-25

**v2, o status que ignorava a polaridade.** `statusOf` comparava `current / target` com os cortes da
régua sem olhar a `polarity` da métrica. Numa métrica de "menor é melhor" a meta é teto, e a razão
crua cresce com o estouro: gastar o dobro do teto dava 200% e caía em "no alvo", com selo verde e
tudo. O cartão declarava atingimento onde havia estouro.

O que mudou: entrou `attainmentOf`, que traduz o valor em "quanto da meta foi cumprido" **antes** da
régua, sem inventar corte novo. Meta de piso segue `current / target`; meta de teto usa o recíproco
`target / current`, que devolve o atingimento na mesma escala; sem direção preferida, a medida é a
proximidade, `1 − |current − target| / target`, que julga os dois lados igual. `statusOf` passou a
receber a polaridade e só aplica os cortes sobre esse atingimento.

**Conserto de caminho latente:** o dado publicado é `higher-is-better`, o ramo novo devolve
exatamente `current / target` e o desenho não mudou (render mediu 0,00% nos dois temas). O selo
segue em "atenção" com 94,0% da meta.

**Auditado e mantido.** O `signedPercent` das quatro versões desta família não entra na classe do
menos zero: v1, v3 e v4 têm guarda de `flat` antes da chamada e a v2 só chama a função no ramo
`direction !== 'flat'`, então o zero nunca alcança o `'+' : '−'`. A v4 é a referência do acervo para
o par zero medido contra indisponível e não foi tocada.
