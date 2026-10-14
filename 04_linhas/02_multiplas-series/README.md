# Múltiplas séries

## O que é

De duas a cinco linhas na mesma unidade dividindo os eixos para comparar trajetórias, com a cor
presa à categoria (nunca à posição no array) e o rótulo direto no fim de cada linha substituindo
a legenda até quatro séries. O modelo absorve dois casos especiais: o destaque de uma série
contra o resto neutro, que resolve o espaguete quando só uma importa, e o índice base 100, que
compara o ritmo de crescimento de grandezas diferentes (investimento, leads, agendas) num eixo
único, sem recorrer a eixo duplo.

## Quando usar

- Até 4 séries na mesma unidade com rótulo no fim de cada linha; até 5 com legenda próxima.
- Uma série protagonista contra o contexto de 6 a 24 outras, todas desenhadas em neutro.
- Ritmo de crescimento de grandezas diferentes (investimento, leads, agendas) com a base
  declarada em 100.
- Categorias fixas com cor por slot: plataformas de mídia, verticais de negócio, squads.

## Quando evitar

- Mais de 5 séries em que todas importam igualmente: use pequenos múltiplos de linha, modelo 09.
- Unidades diferentes em que o nível importa: use painéis alinhados em combinados e eixo duplo,
  modelo 08 da família 08; nunca eixo duplo.
- Índice com base nula, próxima de zero ou negativa: mostre o valor absoluto em painéis.
- Partes que somam um total: use área empilhada, família 05.
- Só dois momentos por série: use o slope, família 17.

## Anatomia

1. Linhas (`<Line type="linear">`), de 1 a 2,5 px, cor por categoria fixa via `var(--chart-N)`
   (slots na ordem 1, 3, 6 da COR-8) ou `var(--line-strong)` no papel de neutro de dado.
2. Rótulo final por linha: um círculo marcador na cor da série mais um `<text>` em
   `--text-secondary` (ou `--text-primary` no destaque), formatado com `formatCurrencyCompact` ou
   `formatInt`, com halo (`paintOrder: 'stroke'`) sempre que o rótulo puder cruzar outra marca.
3. Anticolisão do rótulo final: quando dois valores terminam a menos de 16 px um do outro (a
   âncora da ROT-2), um dos dois é empurrado. A v1 mede o pixel real capturado no `dot` do
   Recharts (uma fração do domínio, tentada primeiro, media só 1,7 px de tinta a tinta no
   COLISAO-TEXTO do check); v2, v3 e v4 plotam a posição empurrada por uma linha invisível
   (`stroke="none"`) no mesmo eixo, o que também garante o pixel real em vez de uma estimativa.
4. Grade só horizontal (`<CartesianGrid vertical={false}>`), eixo X categórico com `interval={0}`
   até 8 meses, e eixo Y com `formatCurrencyAxis` ou `formatInt`, de 3 a 5 linhas redondas.
5. `<Tooltip content={<ChartTooltip />}>` com `itemSorter` pelo valor (maior primeiro) e `cursor`
   em `var(--line-strong)`; `activeDot={{ r: 4 }}` nas linhas visíveis, desligado nas neutras.
6. Estado vazio: bloco `role="status"` com o ícone `Filter` substituindo o gráfico inteiro.

## Versões

- [`v1_cpl-bruto-contra-qualificado`](./v1_cpl-bruto-contra-qualificado/): duas linhas na mesma
  unidade, cor por slot fixo, rótulo no fim de cada linha e anticolisão quando as duas convergem
  no fim da série. [Preview escuro](./v1_cpl-bruto-contra-qualificado/preview.svg) ·
  [claro](./v1_cpl-bruto-contra-qualificado/preview-claro.svg).
- [`v2_plataforma-em-destaque-com-resto-neutro`](./v2_plataforma-em-destaque-com-resto-neutro/):
  uma série em `--chart-1` desenhada por último contra três em `--line-strong`, halo nos dois
  cruzamentos e rótulo em peso 700 só no destaque. [Preview
  escuro](./v2_plataforma-em-destaque-com-resto-neutro/preview.svg) ·
  [claro](./v2_plataforma-em-destaque-com-resto-neutro/preview-claro.svg).
- [`v3_indice-base-100-do-funil`](./v3_indice-base-100-do-funil/): três grandezas diferentes
  indexadas a 100 a partir do primeiro mês medido de cada uma (leads não tem 2026-01), com
  `ReferenceLine` na base e rótulo final com índice e valor absoluto lado a lado. [Preview
  escuro](./v3_indice-base-100-do-funil/preview.svg) ·
  [claro](./v3_indice-base-100-do-funil/preview-claro.svg).
- [`v4_doze-executivos-contra-mediana`](./v4_doze-executivos-contra-mediana/): acima do teto de 5
  séries, 11 linhas neutras seguram o formato do grupo, a mediana entra tracejada e a dica é
  curada para mostrar só destaque, mediana e extremos. [Preview
  escuro](./v4_doze-executivos-contra-mediana/preview.svg) ·
  [claro](./v4_doze-executivos-contra-mediana/preview-claro.svg).

## Como colar no Farol

1. Ligue `data` (e, na v4, `executives`) ao seletor real da página; o `highlightId` deixa de ter
   default quando a página sempre sabe quem está em foco.
2. Dê altura ao pai (`h-64` ou mais, conforme a densidade de séries): sem altura,
   `ResponsiveContainer` desenha zero.
3. Nas versões com rótulo final, preserve a `MARGIN.right` declarada no arquivo: cortar essa
   margem corta o texto do rótulo, o layout não o comprime sozinho.
4. Acima de 5 séries (padrão da v4), ofereça a troca para o modelo 09 (pequenos múltiplos) em vez
   de acrescentar mais linhas neutras ao mesmo eixo.

## Referências

- [From Data to Viz, Line chart](https://www.data-to-viz.com/graph/line.html): observar os
  alertas de espaguete, de eixo e de proporção de tela, e pontos quando as observações são
  esparsas.
- [From Data to Viz, Spaghetti plot](https://www.data-to-viz.com/caveat/spaghetti.html): observar
  as saídas propostas: destacar um grupo, pequenos múltiplos, filtro interativo.
- [Datawrapper, A friendly guide to choosing a chart
  type](https://www.datawrapper.de/blog/chart-types-guide): observar pequenos múltiplos quando as
  linhas se sobrepõem.
- [Tremor, Line Chart](https://tremor.so/docs/visualizations/line-chart): observar `categories`,
  legenda com rolagem, dica customizada e o exemplo de `connectNulls`.
- [Vega-Lite, Multi Series Line Chart with Halo
  Stroke](https://vega.github.io/vega-lite/examples/line_color_halo.html): observar a camada de
  fundo com traço mais largo que separa cruzamentos.
- [Edward Tufte, Overlapping data graphics to make
  comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/):
  observar a sobreposição como instrumento de comparação.
- [Recharts, Compare Two Lines](https://recharts.github.io/en-US/examples/CompareTwoLines/):
  observar o hover que controla a ênfase e a série de comparação tracejada.
- [Datawrapper, Why not to use two axes, and what to use
  instead](https://www.datawrapper.de/blog/dualaxis): observar quando o gráfico indexado funciona
  e quando falha.
- [Stephen Few, Dual-Scaled Axes in
  Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf):
  observar a conversão para escala comum por diferença percentual.
- [Free Range Statistics, Dual axes time series plots may be ok sometimes after
  all](https://freerangestats.info/blog/2016/08/18/dualaxes): observar escalas que reproduzem
  visualmente o índice.
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/):
  observar a série fixada num ponto de referência.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões passaram no `npm run check` e foram aprovadas._

- Todas: o estado vazio é um bloco `role="status"` só com texto; a EST-1 pede também o ícone
  `Filter` de 16 px ao lado da frase.
- Todas: `DOMAIN` e `DOMAIN_TICKS` são constantes fixas no topo do arquivo; com dado real fora da
  faixa escolhida a linha sai do corpo, então quem colar precisa derivar o domínio.
- v1: o pixel do fim da linha neutra (`rawEnd`) é gravado por efeito colateral dentro do `dot` da
  primeira linha e lido pelo `dot` da segunda; funciona pela ordem do JSX, mas é um acoplamento
  que some do código e quebra calado se as duas linhas trocarem de lugar.
- v1: o render gravou `.qa/04_linhas/02_multiplas-series/v1...diff.png` nos dois temas; a
  diferença entre o SVG isolado e a página está toda no subtítulo da moldura, cujo `<p>` dentro do
  `foreignObject` não declara `font-family`. É chrome da ferramenta de render, não do `Chart.tsx`.
- v1: a linha de leitura arredonda a diferença final de R$ 4,5 para R$ 5.
- v2 e v3: as linhas invisíveis que carregam a posição do rótulo (`...LabelY`) continuam no
  payload da dica no último mês, com o nome cru do `dataKey` (`buscaPagaLabelY`, por exemplo). A
  v4 já resolve isso filtrando o payload por nome curado; vale copiar a curadoria para as duas.
- v2: os rótulos finais não trazem o marcador na cor da série que a ROT-3 pede; a associação é
  posicional, o que se lê bem aqui porque três das quatro linhas são neutras.
- v2: a linha de leitura escreve "+224% desde jan/26" sem o valor da base, e a NUM-4 pede a base
  na mesma linha da variação.
- v2 e v3: `MIN_LABEL_GAP` é fração do domínio (7%), não pixel medido; foi essa conta que na v1
  mediu só 1,7 px de tinta a tinta antes da correção.
- v3: o catálogo pede a dica com índice e valor absoluto lado a lado; a versão põe o par no
  rótulo final e deixa a dica só com o índice, com a troca justificada no `notes`.
- v3: a dica imprime o índice sem unidade, e a NUM-6 pede unidade em todo lugar onde o número
  aparece.
- v3: o `useCase` fala em "2026-01 igual a 100", mas leads tem base fev/26 (o rodapé corrige) e a
  data de tela sai em `YYYY-MM`; o texto veio do catálogo.
- v3: no rodapé, "Leads não tem jan/26 medido" pede concordância no plural.
- v4: as 11 linhas neutras em `--line-strong` ficam sem valor escrito, e a isenção de contraste da
  17.2 supõe o valor na marca ou junto dela; aqui o número individual só existe na dica curada.
- v4: os tiques do eixo Y quebram em duas linhas ("R$ 400" e "mil") com `width={64}`.
- v4: a frase acessível afirma "começa abaixo da mediana" sem calcular a comparação; com outro
  dado a frase pode dizer o contrário do desenho.
- v4: a nota de rodapé tem cerca de 210 caracteres, acima dos 50 da ANO-2, por ser nota de método
  e não anotação de marca.

## Correção de 2026-09-28

**v4, a mediana do mês nascia zero e os extremos nasciam infinito.** `median` devolvia `0` para
lista vazia e, no mesmo `map`, `Math.min(...values)` e `Math.max(...values)` de lista vazia devolvem
`Infinity` e `-Infinity`. Um mês sem nenhum executivo medido desenhava a mediana tracejada rente à
base do eixo, afirmando que o grupo inteiro faturou nada, e entregava à dica dois extremos que não
são números de receita.

O que mudou: as três medidas do mês nascem juntas do mesmo `values` e viram `null` quando ele está
vazio; a linha da mediana ganhou `connectNulls={false}`, como as 12 séries já tinham, então o mês
sem medição quebra a referência em vez de deixá-la atravessar o vazio (EIX-10); o rótulo de ponta
escreve `formatUnavailable()` no lugar do número quando a ponta não existe; e a relação entre o
destaque e a mediana, na frase acessível, passou a sair do dado em vez de ficar escrita à mão como
"acima da mediana".

**Conserto de caminho latente:** os 8 meses publicados têm os 12 executivos, então as três medidas
seguem calculadas e o desenho não mudou. O que se conserta é o ramo, não a foto.
