# Combinados e eixo duplo

Duas marcas no mesmo quadro para responder a relação entre duas medidas sobre o mesmo tempo ou a mesma categoria: grandeza e taxa (volume e conversão), realizado e referência, parte e acumulado (pareto), valor do mês e caminho até a meta anual. A família existe porque o público quer ver as duas coisas juntas; o risco é a combinação criar comparações que os dados não sustentam, como cruzamentos entre escalas arbitrárias ou alturas de coluna que não se comparam. Por isso cada modelo daqui declara a regra de escala, e a saída segura, painéis alinhados, é um modelo de primeira classe.

Estudo de origem: [`_estudo/familias/08_combinados-e-eixo-duplo.md`](../_estudo/familias/08_combinados-e-eixo-duplo.md). Catálogo em dados: [`_estudo/catalogo/08_combinados-e-eixo-duplo.json`](../_estudo/catalogo/08_combinados-e-eixo-duplo.json). Todo caso de uso é fictício e sem marca real.

## O que a família responde

- **Comercial:** quanto de receita reconhecida entrou por mês e se bateu a meta; quais motivos de perda somam 80% das perdas; quanto o ano acumulado já andou até a meta anual; onde o realizado desviou do orçamento ou do ano anterior.
- **Pré-vendas:** quantas entradas e agendas por semana e qual a taxa de comparecimento; em que semanas a fila, somada por etapa, passou do teto de capacidade.
- **Marketing:** quanto foi investido por mês e qual foi o CPL qualificado; quantos leads chegaram e qual a proporção qualificada.
- **Diretoria:** o custo realizado cabe no orçado; o realizado do ano chega à meta; o funil de entradas, agendas e fechamentos andou junto.

## Modelos

| # | Modelo | Abordagem | Responde | Versões |
|---|---|---|---|---|
| 01 | [Coluna com linha (eixo único)](./01_coluna-com-linha/) | recharts-nativo | Grandeza por período com meta, média, ano anterior ou teto na mesma unidade; inclui pilhas com uma linha de referência | 4 |
| 02 | [Eixo duplo com domínios calculados](./02_eixo-duplo-com-dominios-calculados/) | recharts-nativo | Quantidade e taxa sobre o mesmo tempo, com zeros alinhados por função pura; inclui linha e linha e o antipadrão de colunas em dois eixos | 4 |
| 03 | [Painéis alinhados](./03_paineis-alinhados/) | recharts-nativo | Duas ou três métricas de unidades diferentes no mesmo calendário, cada uma no seu eixo, sincronizadas | 4 |
| 04 | [Pareto](./04_pareto/) | recharts-custom | Quais poucas causas concentram o efeito, com o acumulado de 0 a 100% | 4 |
| 05 | [Colunas com linha de acumulado](./05_colunas-com-linha-de-acumulado/) | recharts-nativo | Valor de cada mês e caminho do acumulado até a meta anual no mesmo cartão | 4 |
| 06 | [Real contra referência com painel de variação](./06_real-contra-referencia-com-painel-de-variacao/) | recharts-nativo | Desvio do realizado contra orçamento, ano anterior ou meta, com a cor pela polaridade da métrica | 4 |

As pastas dos modelos são criadas na etapa de produção; os links acima apontam para onde elas vão morar.

## Guia rápido: qual modelo escolher

Regra de decisão antes de abrir um segundo eixo (síntese de Few, Datawrapper, Storytelling with Data, Peltier e Flourish, registrada no estudo):

| Se a pergunta é | Use | Não use |
|---|---|---|
| Grandeza por período contra meta, média móvel, ano anterior ou teto, tudo na mesma unidade | [01](./01_coluna-com-linha/) | Segundo eixo: a unidade é a mesma |
| Composição por período com um teto ou limiar na mesma unidade | [01](./01_coluna-com-linha/), versão de pilha | Linha de total repetindo o topo da pilha |
| Duas ou três métricas de unidades diferentes, para público geral | [03](./03_paineis-alinhados/) | Eixo duplo com domínio automático |
| Quantidade e taxa no mesmo tempo, para público habituado ao cartão | [02](./02_eixo-duplo-com-dominios-calculados/) com zeros alinhados, ou [03](./03_paineis-alinhados/) | Anotar o cruzamento entre a linha e as colunas |
| Forma de duas séries de unidades diferentes | [02](./02_eixo-duplo-com-dominios-calculados/), versão de duas linhas com regra de índice declarada | Escala escolhida a olho para sugerir correlação |
| Duas grandezas absolutas que eu queria em colunas | [03](./03_paineis-alinhados/) | Colunas em dois eixos (antipadrão catalogado em 02) |
| Quais poucas causas concentram o efeito | [04](./04_pareto/) | Pareto com menos de 4 categorias ou com negativos |
| Valor de cada mês e caminho até a meta anual | [05](./05_colunas-com-linha-de-acumulado/), modo painéis como padrão | Ler a altura da coluna contra a altura da linha |
| Desvio do realizado contra orçamento, ano anterior ou meta | [06](./06_real-contra-referencia-com-painel-de-variacao/) | Cor pelo sinal em vez da polaridade da métrica |

Três perguntas resolvem a maioria dos casos: as duas medidas têm a mesma unidade (01); o público lê sem mediação (03); o segundo eixo é derivado do primeiro (04). Só depois disso vale considerar 02 e 05.

## Quando a família serve

- Duas medidas sobre o mesmo eixo de tempo ou de categoria, lidas juntas porque uma explica a outra.
- Grandeza com referência (meta, média, teto, orçamento) em que a referência muda por período.
- Concentração de causas com o acumulado como régua de corte.

## Quando procurar outra família

- Barras com marcador de meta por pessoa ou categoria: [02_barras-horizontais/05_barras-contra-meta](../02_barras-horizontais/05_barras-contra-meta/).
- Meta vista como volume a preencher, limiar com excedente destacado: [03_colunas-verticais/06_colunas-contra-meta-ou-limiar](../03_colunas-verticais/06_colunas-contra-meta-ou-limiar/).
- Realizado sólido, previsto hachurado e meta no período em curso: [03_colunas-verticais/07_realizado-e-projecao](../03_colunas-verticais/07_realizado-e-projecao/).
- Capacidade em área com demanda em linha: [05_areas/04_areas-sobrepostas](../05_areas/04_areas-sobrepostas/).
- Burn-up acumulado contra meta como linha pura: [04_linhas/06_acumulado-contra-meta](../04_linhas/06_acumulado-contra-meta/).
- Índice base 100 como alternativa ao eixo duplo: [04_linhas/02_multiplas-series](../04_linhas/02_multiplas-series/).
- Área de diferença acima e abaixo da meta: [05_areas/07_area-de-diferenca](../05_areas/07_area-de-diferenca/).
- Relação entre duas taxas ao longo do tempo sem eixo de tempo: [09_dispersao-e-bolhas/05_dispersao-conectada](../09_dispersao-e-bolhas/05_dispersao-conectada/).
- Decompor o desvio do orçado ao realizado por componente: [19_cascata-waterfall/01_cascata-de-ponte](../19_cascata-waterfall/01_cascata-de-ponte/).
- Histograma com curva acumulada: [16_distribuicao/04_ecdf-e-histograma-acumulado](../16_distribuicao/04_ecdf-e-histograma-acumulado/).
- Bullet graph completo com faixas qualitativas: [13_progresso-meta-e-gauge/02_bullet-chart](../13_progresso-meta-e-gauge/02_bullet-chart/).

## Referências cruzadas

Modelos que o estudo desta família levantou, mas que foram morar em outra família no plano do catálogo:

| Do estudo | Mora em | Por quê |
|---|---|---|
| 08#5 Barras com marcador de meta | [02_barras-horizontais/05_barras-contra-meta](../02_barras-horizontais/05_barras-contra-meta/) | O marcador é um cuidado da barra; o traço de meta com `Scatter shape` segue valendo lá. |
| 08#6 Coluna fantasma (realizado sobre a meta) | [03_colunas-verticais/06_colunas-contra-meta-ou-limiar](../03_colunas-verticais/06_colunas-contra-meta-ou-limiar/) | Duas `Bar` sobrepostas em eixos x distintos, técnica de coluna e não de combinação de marcas. |
| 08#7 Área com linha | [05_areas/04_areas-sobrepostas](../05_areas/04_areas-sobrepostas/) | Na mesma unidade, é área de capacidade com linha de demanda; áreas claras e linha escura. |
| 08#10 Realizado, previsto e meta | [03_colunas-verticais/07_realizado-e-projecao](../03_colunas-verticais/07_realizado-e-projecao/) | Pilha de realizado e previsto restante; contrato `previstoRestante = max(forecastTotal − realizado, 0)`. |
| 08#11 Colunas com limiar e excedente | [03_colunas-verticais/06_colunas-contra-meta-ou-limiar](../03_colunas-verticais/06_colunas-contra-meta-ou-limiar/) | Divisão `ateLimiar` e `excedente` preparada em TypeScript e empilhada. |
| Bullet graph | [13_progresso-meta-e-gauge/02_bullet-chart](../13_progresso-meta-e-gauge/02_bullet-chart/) | Com faixas qualitativas atrás, a barra com marcador vira bullet completo. |

Variações absorvidas pelos modelos daqui: 08#9 (empilhadas ou agrupadas com linha) em 01; 08#3 (linha e linha em eixo duplo) e 08#14 (colunas em eixo duplo, antipadrão) em 02; 08#13 (real contra orçamento) e 03#13 (colunas com painel de variação, do estudo de colunas verticais) em 06.

## Notas para quem vai produzir

- **Conflito com a EIX-8.** O padrão de acabamento do [CONTRATO](../CONTRATO.md), seção 17.3, diz "sem eixo duplo: duas grandezas viram dois gráficos alinhados". O modelo 03 cumpre a regra; o 04 usa um eixo derivado do primeiro, e a versão com o eixo das colunas de 0 ao total transforma o percentual em outra rotulagem da mesma escala; os modelos 02 e 05 precisam de exceção registrada no README do modelo ou saem com o modo painéis como padrão.
- **Tokens.** O estudo cita `var(--farol-serie-1)`, que não existe; no catálogo vale `--chart-1` a `--chart-6` (seção 7 do CONTRATO), com o eixo pintado na cor da sua série.
- **Formatação.** O estudo sugere `Intl.NumberFormat` na dica; o CONTRATO proíbe `Intl` direto e pede `@/lib/format` com `ChartTooltip`.
- **A validar no Recharts 3.10.** `niceTicks="none"` e `allowDataOverflow` segurando os domínios alinhados; `CartesianGrid yAxisId` com `syncWithTicks`; ordem de pintura de `ReferenceLine` e `ReferenceArea` em relação às séries; `Brush` compartilhado por `syncId`.
- **Função de zeros alinhados.** A função pura `alinharZeros` da seção 5 do estudo serve aos modelos 02 e 05; os casos de teste mínimos são dois eixos só positivos, um eixo com negativos, um eixo só negativo contra outro só positivo e série toda nula.

## Referências

Todos os links vêm do estudo da família, do estudo de colunas verticais (variação 03#13) e da varredura de portais de design. Nenhum foi montado de memória. Onde a fonte não foi aberta na pesquisa, isso está dito na linha.

### 01 Coluna com linha (eixo único)

- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): "Line + column" em "Change over Time".
- [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/): `Area`, `Bar`, `Line` e `Scatter` no mesmo `ComposedChart`, e a ordem dos filhos.
- [Recharts, Same Data Composed Chart](https://recharts.github.io/en-US/examples/SameDataComposedChart/): `XAxis scale="band"` e `barSize`, com a linha centrada na banda.
- [Datawrapper, New: Dual-axis charts in Datawrapper](https://www.datawrapper.de/blog/dual-axis-charts): as combinações suportadas (colunas e linha, áreas e linha, colunas empilhadas e linha).
- [Vega-Lite, Mean overlay over precipitation chart](https://vega.github.io/vega-lite/examples/layer_precipitation_mean.html): a média calculada pela mesma agregação das barras e desenhada como `rule`.
- [AG Charts, Bar And Line Combination Chart](https://www.ag-grid.com/charts/gallery/bar-line-combination/): barras e linhas tracejadas no mesmo eixo, sem eixo secundário, com dica compartilhada.
- [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/): `stackId`, o total calculado no `LabelList` e o limiar rotulado em `ReferenceLine`.
- [AG Charts, Grouped Category Axis Combination Chart](https://www.ag-grid.com/charts/gallery/grouped-bar-line-combination/): barras agrupadas, linhas e eixo de categoria hierárquico.
- [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/): `barGap`, `barCategoryGap`, `stackOffset` e `reverseStackOrder`.
- [Recharts, Line API](https://recharts.github.io/en-US/api/Line/): `legendType` para a legenda distinguir coluna de linha.
- [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide): o limite de uma linha sobre a pilha.

### 02 Eixo duplo com domínios calculados

- [Highcharts, Dual axes, line and column](https://www.highcharts.com/demo/highcharts/combo-dual-axes): o eixo oposto e a combinação de tipos.
- [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide): zeros alinhados, cor por eixo, áreas claras e linhas escuras, eixo mais importante à esquerda.
- [Flourish, Dual axis charts: why they spark debate, and how to get them right](https://flourish.studio/blog/dual-axis-charts/): linha com coluna para evitar cruzamentos aleatórios.
- [Vega-Lite, Layered Plot with Dual-Axis](https://vega.github.io/vega-lite/examples/layer_dual_axis.html): `resolve` de escala independente e títulos na cor da série.
- [Recharts, Biaxial Line Chart](https://recharts.github.io/en-US/examples/BiaxialLineChart/): `yAxisId` e `orientation="right"`.
- [Recharts, Composed Chart With Axis Labels](https://recharts.github.io/en-US/examples/ComposedChartWithAxisLabels/): título de eixo com unidade pela prop `label`.
- [Recharts, YAxis API](https://recharts.github.io/en-US/api/YAxis/): `domain` por função, `allowDataOverflow` e os valores de `niceTicks` (`none`, `auto`, `adaptive`, `snap125`).
- [Recharts, CartesianGrid API](https://recharts.github.io/en-US/api/CartesianGrid/): `yAxisId` para a grade seguir só o eixo principal.
- [Tremor, Combo Chart](https://tremor.so/docs/visualizations/combo-chart): `barSeries` e `lineSeries` separados, `enableBiaxial` e rótulo de eixo por série.
- [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf): o raciocínio passo a passo e a conclusão de que eixo duplo nunca deve codificar só barras.
- [Free Range Statistics, Dual axes time series plots may be ok sometimes after all](https://freerangestats.info/blog/2016/08/18/dualaxes): a regra de escala por índice e as condições em que duas linhas se sustentam.
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis): escalas arbitrárias, cruzamentos sem significado e as alternativas.
- [From Data to Viz, Dual axis caveat](https://www.data-to-viz.com/caveat/dual_axis.html): a manipulação de escala para sugerir relação.
- [Why Two Y-Axes (Y2Y): A Case Study for Visual Correlation with Dual Axes](https://uncharted.software/assets/WhyTwoYAxes_Y2Y.pdf): o contraponto; em análise de correlação de séries de alta frequência, a sobreposição revela padrões locais.
- [Recharts, Biaxial Bar Chart](https://recharts.github.io/en-US/examples/BiaxialBarChart/): como a biblioteca permite colunas em dois eixos sem nenhum alerta (base do antipadrão da versão 4).

### 03 Painéis alinhados

- [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis): as duas saídas, rótulo direto e gráficos empilhados com o mesmo eixo x.
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/): os panel charts.
- [Daydreaming Numbers, 5 alternatives to dual axis charts](https://daydreamingnumbers.com/5-alternatives-to-dual-axis-charts/): lado a lado, rótulo direto, priorizar e rotular, connected scatterplot e índice.
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis): a vantagem e o custo de espaço dos gráficos separados.
- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/): `syncId` e `Brush`.

### 04 Pareto

- [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart): a definição, o eixo direito como percentual acumulado e o exemplo em que as 3 primeiras causas somam 78% do problema.
- [Highcharts, Pareto chart](https://www.highcharts.com/demo/highcharts/pareto): a forma pronta como tipo próprio da biblioteca (a página abriu, mas a configuração carrega por script).
- [Highcharts, documentação do Pareto chart](https://www.highcharts.com/docs/chart-and-series-types/pareto-chart): a série de pareto derivada de uma série base de colunas, em 0 a 100% num eixo oposto.
- [Recharts, Vertical Composed Chart](https://recharts.github.io/en-US/examples/VerticalComposedChart/): `layout="vertical"`, `XAxis type="number"` e `YAxis type="category"` para rótulos longos.
- [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/): `shape` como função para cor por item e `minPointSize` para a cauda minúscula.

### 05 Colunas com linha de acumulado

- [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide): zeros alinhados, cores por eixo e rótulos nos extremos e no último valor.
- [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis): a saída em gráficos empilhados com o mesmo eixo x, base do modo painéis.
- [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/): `yAxisId` na referência para a meta anual usar o eixo do acumulado, e `ifOverflow="extendDomain"`.
- [Tremor, Combo Chart](https://tremor.so/docs/visualizations/combo-chart): `enableBiaxial` e rótulo de eixo por série.
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis): por que escalas arbitrárias sugerem cruzamentos.

### 06 Real contra referência com painel de variação

- [Recharts, Positive and Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/): `ReferenceLine y={0}` e os tiques coloridos pelo sinal; no Farol a cor vem da polaridade.
- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/): `syncId` para amarrar os painéis.
- [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/): `minPointSize`, inclusive como função.
- [Recharts, BarChart API](https://recharts.github.io/en-US/api/BarChart/): `syncId`, que sincroniza cursor e dica entre gráficos irmãos, e `margin`, que precisa ser idêntica nos dois.
- [Wikipedia, International Business Communication Standards](https://en.wikipedia.org/wiki/International_Business_Communication_Standards): a notação cobrindo cenários, períodos e análises de variância; as regras visuais detalhadas não estão no artigo.
- [IBCS, Version 2.0](https://www.ibcs.com/ibcs-version-2-0/): a separação entre notação e composição (as regras visuais detalhadas não foram verificadas na pesquisa).
- [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts): a estrutura de comparação com painel de variação e a semântica de favorável e desfavorável.
- [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/): a change bar, que resolve o mesmo problema num gráfico só, com seta de direção.
- [dataviz.boutique, Ultimate Variance Chart (IBCS)](https://dataviz.boutique/2017/08/15/power-bi-ultimate-variance-chart-faq-ibcs-r/): as decisões de escala entre o painel principal e o de variação (apareceu na busca; página não aberta).
- [Inforiver, variance analysis em Power BI](https://inforiver.com/blog/inforiver-analytics-plus/variance-analysis-powerbi-inforiver-analytics-plus/): variação absoluta em coluna e percentual em lollipop (apareceu na busca; página não aberta).

### Galerias gerais

- [Recharts, Examples](https://recharts.github.io/en-US/examples/): índice dos exemplos oficiais citados acima.
- [Vega-Lite, Example Gallery](https://vega.github.io/vega-lite/examples/): camadas, regras e escalas independentes.
- [AG Charts, Chart Gallery](https://www.ag-grid.com/charts/gallery/): combinações prontas; a de três eixos y num só quadro ([Bar, Line And Area Combination Chart](https://www.ag-grid.com/charts/gallery/grouped-category-combination/)) é o exemplo do que o Farol não repete.

### Portais de design

A família tem pouco material nos portais; a própria tag de eixo duplo do Dribbble tinha só 2 designs. Olhe o shot antes de adotar qualquer coisa marcada como não aberta.

- [Behance, Style Guidelines for data visualisation, dark and light](https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light) [aberto]: o melhor achado da família; guia de estilo com regras escritas para gráfico de dois eixos, paletas para tema escuro e claro e mockups nos dois temas.
- [Behance, Sales Management Dashboard](https://www.behance.net/gallery/192233069/Sales-Management-Dashboard) [aberto]: a página abriu com tags de chart e line chart; as imagens não foram inspecionadas.
- [Behance, Data Visualization Dashboard design](https://www.behance.net/gallery/38344587/Data-Visualization-Dashboard-design) [busca]: composições de painel principal com faixa de apoio abaixo, útil para o modelo 06; projeto não aberto.
- [Dribbble, Sales Analytics Dashboard](https://dribbble.com/shots/24601607-Sales-Analytics-Dashboard) (não abriu): painel de vendas com receita multicanal e leads em destaque; conferir se usa barra com linha.
- [Dribbble, Sales report revenue example](https://dribbble.com/shots/14172134-Sales-report-revenue-example-data-visualization-dashboard) (não abriu): relatório de receita; não confirmado se há eixo duplo.
- [Dribbble, tag dual axis chart](https://dribbble.com/tags/dual-axis-chart) [busca]: a escassez de referência visual para a família.

**No Farol:** `ComposedChart` do Recharts com dois `YAxis` só quando o modelo permitir, eixo e rótulo na cor da série, e painéis alinhados como saída padrão. Lacunas de portal de design registradas no estudo: coluna com linha em eixo único, linha e linha, pareto, acumulado e painel de variação não têm peça verificada.
