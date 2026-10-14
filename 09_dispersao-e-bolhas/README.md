# Dispersão e bolhas

Posiciona cada entidade por duas medidas quantitativas, uma em cada eixo, para responder se existe relação entre X e Y, qual a direção e a força dessa relação, quem foge do padrão e onde há aglomerados. A bolha acrescenta uma terceira medida pela área do círculo; a densidade 2D troca os pontos por contagem quando eles são milhares. Correlação vista no gráfico não é causa.

## O que a família responde

| Público | Perguntas típicas no Farol |
|---|---|
| Comercial | Oportunidades de ticket maior demoram mais para fechar? O forecast de 30 dias antes bateu com o valor fechado? Executivo com mais carteira converte menos? |
| Pré-vendas | Mais tentativas por lead trazem mais agendas? O tempo até o primeiro contato derruba o comparecimento? SDR com fila maior cumpre menos SLA? |
| Marketing | Campanha de CPL menor traz lead menos qualificado? Quanto rende cada real a mais por plataforma? Criativo de CTR alto converte? |
| Diretoria | Custo de cada área contra o que ela entrega; posição das linhas de produto entre dois períodos. Leitura por quadrante com cortes mora na família 25. |

Regras que valem para todos os modelos, vindas do estudo da família:

1. A legenda diz o que é cada ponto ("cada ponto é uma campanha na semana") e a unidade de cada eixo.
2. Domínio explícito e estável entre filtros; domínio automático só em modo exploração.
3. Bolha com área proporcional: `ZAxis` com `domain` a partir de 0, maiores desenhadas antes e legenda de tamanho.
4. Volume: acima de cerca de 500 pontos, opacidade de 0,35 a 0,5 e ponto pequeno; acima de cerca de 3.000, densidade 2D ou amostra declarada.
5. Tendência só com prova: reta com `n` e R² no rótulo, e só acima do piso declarado (R² 0,3 e `n` de pelo menos 10).
6. Cor tem um papel só: categoria (até 5 grupos, sempre com forma) ou destaque (uma cor mais neutro).
7. Rótulo direto só no que importa (até cerca de 8 pontos).
8. Dado ausente não vira zero: ponto sem X ou sem Y sai do plano e entra na contagem do rodapé.

## Modelos

| # | Modelo | Abordagem | Responde | Versões |
|---|---|---|---|---|
| 01 | [Dispersão simples](./01_dispersao-simples/) | Recharts nativo | Relação entre duas medidas, com destaque, categoria, envoltória ou escala log | 4 |
| 02 | [Dispersão com tendência ou identidade](./02_dispersao-com-linha-de-referencia/) | Recharts com peça própria | Direção e força da relação; previsto contra realizado | 4 |
| 03 | [Bolhas](./03_bolhas/) | Recharts nativo | Terceira medida de magnitude por entidade, também mês a mês | 4 |
| 04 | [Bolhas em grade categórica](./04_bolhas-em-grade-categorica/) | Recharts nativo | Volume por duas categorias ordenadas (punch card, matriz de pontos) | 4 |
| 05 | [Dispersão conectada](./05_dispersao-conectada/) | Recharts nativo | Trajetória de uma entidade em duas medidas no tempo | 4 |
| 06 | [Dispersão de antes e depois com setas](./06_antes-e-depois-com-setas/) | SVG puro | Quem se moveu entre dois momentos, e quem cruzou a meta | 4 |
| 07 | [Dispersão com barras de erro](./07_dispersao-com-barras-de-erro/) | Recharts nativo | Estimativas com incerteza por entidade | 4 |
| 08 | [Dispersão com distribuições marginais](./08_dispersao-com-marginais/) | Recharts com peça própria | Relação e forma de cada medida juntas | 4 |
| 09 | [Densidade 2D (binada, hexbin, contorno)](./09_densidade-2d/) | SVG puro | Onde se concentram milhares de pontos | 4 |
| 10 | [Matriz de dispersão](./10_matriz-de-dispersao/) | HTML com Tailwind | Exploração dos pares entre 3 a 5 medidas | 4 |
| 11 | [Pequenos múltiplos de dispersão](./11_pequenos-multiplos-de-dispersao/) | HTML com Tailwind | A mesma relação em vários grupos sem sobrepor | 4 |

O catálogo em dados, com resumo, quando usar, quando evitar e as versões de cada modelo, está em [`_estudo/catalogo/09_dispersao-e-bolhas.json`](../_estudo/catalogo/09_dispersao-e-bolhas.json); o estudo completo, em [`_estudo/familias/09_dispersao-e-bolhas.md`](../_estudo/familias/09_dispersao-e-bolhas.md).

## Guia rápido: qual modelo escolher

1. **Duas medidas por entidade, até cerca de 3.000 pontos?** Comece pela [01 Dispersão simples](./01_dispersao-simples/). Nomes em poucos pontos, cor por grupo (até 5), território por grupo e escala log são versões dela.
2. **Precisa dizer quanto de Y vem com cada unidade de X, ou comparar previsto com realizado?** [02 Dispersão com tendência ou identidade](./02_dispersao-com-linha-de-referencia/). Sem R² acima do piso e sem `n` de pelo menos 10, a reta não entra.
3. **Há uma terceira medida de magnitude que importa?** [03 Bolhas](./03_bolhas/), aceitando que a área é lida com pouca precisão. Se a comparação da terceira medida precisa ser exata, ela vai para barras.
4. **Os dois eixos são categorias (dia e hora, motivo e etapa)?** [04 Bolhas em grade categórica](./04_bolhas-em-grade-categorica/). Se só a concentração importa e a matriz é densa, mapa de calor na família 15.
5. **Uma entidade ao longo de muitos períodos?** [05 Dispersão conectada](./05_dispersao-conectada/). **Várias entidades em só dois momentos?** [06 Antes e depois com setas](./06_antes-e-depois-com-setas/).
6. **Taxas ou médias de volumes muito diferentes?** [07 Dispersão com barras de erro](./07_dispersao-com-barras-de-erro/), para não tratar ruído de amostra pequena como diferença.
7. **A forma de cada medida importa tanto quanto a relação?** [08 Dispersão com distribuições marginais](./08_dispersao-com-marginais/), em cartão de pelo menos 520 px de largura.
8. **Milhares de pontos viraram mancha?** [09 Densidade 2D](./09_densidade-2d/): grade binada ou hexbin antes de contorno, que custa caro e só vale acima de 500 pontos.
9. **Explorar de uma vez os pares entre 3 a 5 medidas?** [10 Matriz de dispersão](./10_matriz-de-dispersao/), para análise e não para apresentação.
10. **A mesma relação em mais de 5 grupos, ou grupos que se cobrem?** [11 Pequenos múltiplos de dispersão](./11_pequenos-multiplos-de-dispersao/), sempre com domínio comum.

## Quando a família serve

- As duas medidas são quantitativas e cada ponto é uma entidade identificável (oportunidade, lead, campanha, SDR, canal).
- A pergunta é de relação, desvio do padrão ou aglomerado, e não de ranking nem de evolução de uma medida só.
- O leitor aceita ler posição nos dois eixos; o eixo não precisa começar no zero, porque a codificação é posição.

## Quando procurar outra família

- Uma medida só por categoria: barras (família 02) ou pontos por categoria (família 17).
- Uma medida no tempo: linhas (família 04); duas medidas no tempo para público não técnico, linhas empilhadas ou indexadas em vez da dispersão conectada.
- Quantidade e taxa do mesmo período: combinados (família 08), sem eixo duplo.
- Leitura por quadrante com cortes de meta ou de média: matriz e quadrantes (família 25).

## Referências cruzadas

| Assunto | Onde mora | Por quê |
|---|---|---|
| Quadrante com cortes | [25/01 Matriz 2x2 de quadrantes](../25_matriz-e-quadrantes/01_matriz-2x2-de-quadrantes/) | Quando a leitura principal é a região definida por cortes, e não a relação. |
| Correlograma | [15/08 Heatmap de correlação](../15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/) | Muitos pares resumidos por cor da correlação; parente da matriz de dispersão (modelo 10). |
| Strip e beeswarm | [16/03 Strip plot e beeswarm](../16_distribuicao/03_strip-plot-e-beeswarm/) | Um eixo quantitativo só, com os pontos espalhados para não sobrepor. |
| Dumbbell | [17/03 Dumbbell e arrow plot](../17_comparacao-de-pontos/03_dumbbell/) | Mudança entre dois momentos numa medida só; o modelo 06 faz o mesmo em duas. |
| Bolhas empacotadas | [12/08 Circle packing](../12_hierarquia/08_circle-packing/) | Bolhas sem eixos, quando só o tamanho e a hierarquia importam. |
| Mapa de bolhas | [23 Mapas](../23_mapas/) | Bolha posicionada por geografia, não por duas medidas. |
| Linha mais coluna | [08 Combinados e eixo duplo](../08_combinados-e-eixo-duplo/) | Quantidade e taxa do mesmo período lidas juntas no tempo. |
| Micro dispersão em célula | [24 Microvisuais e sparklines](../24_microvisuais-sparklines/) | Nuvem sem eixo dentro de tabela; o estudo manda o modelo com eixos morar aqui, no 01. |
| Punch card de dia por hora | [15 Mapa de calor e calendário](../15_mapa-de-calor-e-calendario/) | Mesma grade com cor na célula cheia; aqui ele vive como versão do modelo 04. |

## Referências

Todos os links vêm do [estudo da família](../_estudo/familias/09_dispersao-e-bolhas.md), dos estudos das famílias de onde vieram as variações absorvidas (15, 17, 24 e 25) e da [varredura de portais de design](../_estudo/00_portais-de-design.md). Bibliotecas fora da stack do Farol (Observable Plot, Vega-Lite, ECharts, Nivo, visx, AG Charts, Highcharts) aparecem como referência de método e de comportamento, nunca como dependência. "Não abriu" quer dizer que o endereço veio de busca e a página não carregou durante a pesquisa.

### 01 Dispersão simples

- [Data Visualisation Catalogue, scatterplot](https://datavizcatalogue.com/methods/scatterplot.html): observar o uso para dados pareados, a tendência opcional e o aviso de que correlação não é causa.
- [Recharts, Simple Scatter Chart](https://recharts.github.io/en-US/examples/SimpleScatterChart/): observar `type="number"` nos eixos e `unit` alimentando a dica.
- [Storytelling with Data, what is a scatterplot](https://www.storytellingwithdata.com/blog/2020/5/27/what-is-a-scatterplot): observar transparência nos sobrepostos, eixo sem zero e o alerta de leitura errada.
- [Recharts, Scatter Chart With Labels](https://recharts.github.io/en-US/examples/ScatterChartWithLabels/): observar o `LabelList` dentro do `Scatter`.
- [Recharts, API do LabelList](https://recharts.github.io/en-US/api/LabelList/): observar que `content` como função é chamado uma vez por item, onde mora o filtro de quem recebe rótulo.
- [AG Charts, scatter with labels](https://www.ag-grid.com/charts/gallery/scatter-with-labels/): observar rótulo em todos os pontos com posição fixa e sem tratamento de colisão, que o Farol resolve em TypeScript.
- [Datawrapper Academy, text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar anotação com e sem seta e ancoragem para telas pequenas.
- [Recharts, Scatter Chart With Cells](https://recharts.github.io/en-US/examples/ScatterChartWithCells/): observar o símbolo próprio escolhendo cor e tipo pelo índice.
- [Observable Plot, dot](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/dot.md): observar os conjuntos de símbolos preenchidos e vazados, a escala `sqrt` no raio e a ordenação das maiores para as menores.
- [Datawrapper Academy, customizing your scatter plot](https://datawrapper.de/academy/customizing-your-scatter-plot): observar cor por coluna, opacidade para sobrepostos, forma por categoria e a nota de que log é mais difícil de ler.
- [RAWGraphs, convex hull (metadata)](https://raw.githubusercontent.com/rawgraphs/rawgraphs-charts/master/src/convexHull/metadata.js): observar a envoltória como forma de identificar pontos da mesma categoria.
- [RAWGraphs, pasta de gráficos](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src): observar `convexHull`, `hexagonalBinning` e `contourPlot` como gráficos de correlação do mesmo acervo.
- [Recharts, API do XAxis](https://recharts.github.io/en-US/api/XAxis/): observar `scale` com `log`, `domain` e `ticks` manuais.
- [Stephen Few, Displaying Change Between Two Points in Time](http://www.perceptualedge.com/articles/visual_business_intelligence/displaying_change_between_two_points_in_time.pdf): observar que em escala log inclinações iguais são taxas iguais.
- [Recharts, API do ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/): observar `x1`, `x2`, `y1`, `y2` em unidade de dado e `ifOverflow`, base do retângulo de seleção.
- [Nivo, scatterplot](https://nivo.rocks/scatterplot/): observar a malha de Voronoi para capturar interação em ponto pequeno.
- [AG Charts, scatter with large data](https://www.ag-grid.com/charts/gallery/scatter-with-large-data/): observar marcador pequeno com opacidade em volume alto.
- [SpreadJS, lista de tipos de sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain): observar a micro dispersão ao lado de outros 23 tipos, o que mostra quão rara ela é.
- [Spread Windows Forms, scatter sparkline](https://developer.mescius.com/spreadnet/docs/latest/online-win/scatter-sparkline.html) (não abriu): observar a correlação entre dois conjuntos de valores numa célula.
- [Wikipedia, scatter plot](https://en.wikipedia.org/wiki/Scatter_plot) (não abriu): observar a advertência clássica de que correlação visual não é causalidade.

### 02 Dispersão com tendência ou identidade

- [Recharts, Scatter And Line Of Best Fit](https://recharts.github.io/en-US/examples/ScatterAndLineOfBestFit/): observar o array único com chaves de pontos e de reta e a `Line` sem ponto nem legenda.
- [Vega-Lite, Linear Regression](https://vega.github.io/vega-lite/examples/layer_point_line_regression.html): observar as três camadas: pontos, reta e texto de R².
- [Recharts, API do Scatter](https://recharts.github.io/en-US/api/Scatter/): observar `lineType` `fitting` como atalho de regressão sem R², que não atende o piso do Farol.
- [Datawrapper Academy, how to create a scatter plot](https://www.datawrapper.de/academy/how-to-create-a-scatter-plot): observar a regra de não usar tendência quando a nuvem é espalhada.
- [Observable Plot, linear regression](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/linear-regression.md): observar `ci` padrão de 0,95 e a observação de que regressão é direcional.
- [From Data to Viz, scatter](https://www.data-to-viz.com/graph/scatter.html): observar a lista de variações e o alerta de subgrupos escondidos.
- [Datasaurus Dozen](https://www.research.autodesk.com/publications/same-stats-different-graphs/): observar que estatística igual convive com formas diferentes; R² e faixa não dispensam olhar a nuvem.
- [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `segment` para a diagonal de identidade e `ifOverflow`.
- [FT Visual Vocabulary, README](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md): observar a dispersão como forma padrão de relação entre duas variáveis contínuas.
- [Stephen Few, Simple Displays of Complex Quantitative Relationships](http://www.perceptualedge.com/articles/b-eye/complex_relationships.pdf): observar a solução que plota cada venda com a diferença entre preço pedido e obtido, em vez de agregar.

### 03 Bolhas

- [Data Visualisation Catalogue, bubble chart](https://datavizcatalogue.com/methods/bubble_chart.html): observar o alerta de área e não raio e o limite de quantidade de bolhas.
- [Recharts, Bubble Chart](https://recharts.github.io/en-US/examples/BubbleChart/): observar `ZAxis range={[16, 225]}`.
- [Recharts, Three Dim Scatter Chart](https://recharts.github.io/en-US/examples/ThreeDimScatterChart/): observar `ZAxis` com `range` e duas séries com `shape` diferente.
- [Recharts, API do ZAxis](https://recharts.github.io/en-US/api/ZAxis/): observar que o eixo não desenha nada e que o tamanho é área em px².
- [ECharts, bubble gradient](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bubble-gradient.ts): observar `Math.sqrt` no tamanho do símbolo e rótulo só no destaque.
- [Vega-Lite, Bubble Plot](https://vega.github.io/vega-lite/examples/point_bubble.html): observar a especificação mínima de tamanho por campo quantitativo.
- [Storytelling with Data, what is a bubble chart](https://www.storytellingwithdata.com/blog/2021/5/11/what-is-a-bubble-chart): observar a dificuldade de comparar áreas e a recomendação de construir o gráfico em partes, inclusive quando animado.
- [From Data to Viz, bubble](https://www.data-to-viz.com/graph/bubble.html): observar a legenda de tamanho obrigatória e a escolha de qual variável vai na área.
- [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar as bolhas no estilo de evolução de países por renda e expectativa de vida.
- [Highcharts, bubble chart](https://www.highcharts.com/demo/highcharts/bubble): observar a demonstração com temas claro e escuro.

### 04 Bolhas em grade categórica

- [Recharts, Bubble Chart](https://recharts.github.io/en-US/examples/BubbleChart/): observar os sete gráficos empilhados, um por dia, com o mesmo `ZAxis`.
- [ECharts, scatter on single axis](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/scatter-single-axis.ts): observar um eixo único por dia e o tamanho pelo valor.
- [AG Charts, bubble with categories](https://www.ag-grid.com/charts/gallery/bubble-with-categories/): observar os dois eixos categóricos e os limites de tamanho mínimo e máximo.
- [Vega-Lite, Table Bubble Plot (punch card)](https://vega.github.io/vega-lite/examples/circle_github_punchcard.html): observar dia no eixo Y com ordem própria, hora no X e tamanho pela soma.
- [visx, exemplo de heatmap com círculos](https://raw.githubusercontent.com/airbnb/visx/master/packages/visx-demo/src/sandboxes/visx-heatmap/Example.tsx): observar o raio limitado pelo menor lado da célula.
- [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar XY heatmap e símbolo proporcional ordenado como vizinhos diretos deste desenho.
- [Vega, dot plot example](https://vega.github.io/vega/examples/dot-plot/) (não abriu): observar a separação entre escala de posição e escala de tamanho.
- [DataViz Catalogue, chart snapshot: dot distribution plots](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/) (não abriu): observar a distinção entre ponto como unidade e ponto como contagem.

### 05 Dispersão conectada

- [From Data to Viz, connected scatter](https://www.data-to-viz.com/graph/connectedscatter.html): observar o uso para duas variáveis no tempo sem eixo duplo e o alerta de espaguete.
- [Vega-Lite, Connected Scatterplot](https://vega.github.io/vega-lite/examples/connected_scatterplot.html): observar o canal `order` pelo ano, e não pela posição.
- [Recharts, Joint Line Scatter Chart](https://recharts.github.io/en-US/examples/JointLineScatterChart/): observar `line` e `lineJointType` no `Scatter`.
- [Nightingale, Connected Scatterplots Make Me Feel Dumb](https://nightingaledvs.com/connected-scatterplots-make-me-feel-dumb/): observar o argumento das quatro coisas mudando ao mesmo tempo e as alternativas empilhada e indexada.

### 06 Dispersão de antes e depois com setas

- [Observable Plot, arrow (documentação fonte)](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/arrow.md): observar duas observações por cidade ligadas por seta, cor por direção e as opções `bend`, `headLength` e `inset`.
- [Observable Plot, arrow mark](https://observablehq.github.io/plot/marks/arrow): observar `insetEnd`, que aqui vira recuo calculado à mão para a ponta não sumir sob o destino.
- [Observable Plot, link](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/link.md): observar o mesmo dado com linha simples e cor pela direção.
- [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/): observar componentes próprios como filhos do gráfico e os hooks de área de plotagem.
- [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): observar as zonas configuráveis, que aqui mantêm a divisória fixa entre os dois períodos.

### 07 Dispersão com barras de erro

- [Recharts, API do ErrorBar](https://recharts.github.io/en-US/api/ErrorBar/): observar `direction`, `width` das serifas e o `dataKey` simétrico ou em par de distâncias.
- [ECharts, error scatter on cartesian](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/custom-error-scatter.ts): observar o desenho de intervalo em X e em Y com serifas.
- [Vega-Lite, Error Bars Showing Confidence Interval](https://vega.github.io/vega-lite/examples/layer_point_errorbar_ci.html): observar o intervalo de confiança calculado pela biblioteca.
- [Datawrapper Academy, confidence intervals in column charts](https://www.datawrapper.de/academy/confidence-intervals-error-bars-datawrapper-column-charts): observar o viés de achar mais provável o que está dentro da barra e os ajustes de opacidade.

### 08 Dispersão com distribuições marginais

- [From Data to Viz, scatter](https://www.data-to-viz.com/graph/scatter.html): observar as distribuições marginais como variação recomendada.
- [ECharts, histogram with custom series](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-histogram.ts): observar histogramas das duas dimensões calculados a partir dos mesmos pontos.
- [From Data to Viz, página inicial e índice de caveats](https://www.data-to-viz.com/): observar a armadilha do tamanho de bin do histograma, que muda a forma do marginal.
- [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar as composições em camadas e a concatenação de gráficos, receita formal das marginais.

### 09 Densidade 2D

- [Vega-Lite, 2D Histogram Scatterplot](https://vega.github.io/vega-lite/examples/circle_binned.html): observar os dois eixos binados em até 10 faixas e o tamanho pela contagem.
- [From Data to Viz, 2D density](https://www.data-to-viz.com/graph/density2d.html): observar hexbin, histograma 2D e contorno como as três formas, o alerta de amostra pequena e a sensibilidade à largura de banda.
- [Observable Plot, hexbin](https://raw.githubusercontent.com/observablehq/plot/main/docs/transforms/hexbin.md): observar largura do bin em pixels, saídas por cor e por raio e a dica de contorno.
- [RAWGraphs, hexagonal binning (metadata)](https://raw.githubusercontent.com/rawgraphs/rawgraphs-charts/master/src/hexagonalBinning/metadata.js): observar a descrição de densidade em vez de pontos, por cor ou área.
- [Observable Plot, density](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/density.md): observar a largura de banda padrão de 20 px, os limiares e a analogia com mapa topográfico.
- [From Data to Viz, Overplotting](https://www.data-to-viz.com/caveat/overplotting.html) (não abriu): observar a lista de técnicas contra sobreposição.
- [Visier, Quadrant visual](https://docs.visier.com/developer/Analytics/visual%20types/2x2%20scatter%20plot.htm): observar o teto declarado de 3.000 itens e o detalhe fora do plano.
- [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar `inset` e `fill`, que definem o desenho de cada bin da grade.

### 10 Matriz de dispersão

- [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar a entrada Interactive Scatterplot Matrix na seção de visões múltiplas.
- [From Data to Viz, scatter](https://www.data-to-viz.com/graph/scatter.html): observar o correlograma como parente para muitos pares.

### 11 Pequenos múltiplos de dispersão

- [Stephen Few, Simple Displays of Complex Quantitative Relationships](http://www.perceptualedge.com/articles/b-eye/complex_relationships.pdf): observar os pequenos múltiplos por bairro com os mesmos eixos e cada venda plotada.
- [Vega-Lite, Becker's Barley Trellis Plot](https://vega.github.io/vega-lite/examples/trellis_barley.html): observar painéis ordenados pela mediana.
- [Wikipedia, Small multiple](https://en.wikipedia.org/wiki/Small_multiple): observar a exigência de mesma escala e mesmos eixos e a pergunta "comparado com o quê".
- [Observable Plot, Facets](https://observablehq.github.io/plot/features/facets): observar `fx` e `fy` e as escalas compartilhadas por padrão.
- [Recharts, API do ScatterChart](https://recharts.github.io/en-US/api/ScatterChart/): observar `syncId` com `syncMethod` padrão por índice, razão para sincronizar destaque por `id` em estado próprio.

### Gerais da família

- [From Data to Viz, índice](https://www.data-to-viz.com/): observar a organização por formato de dado de entrada.
- [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar os exemplos de dispersão como ponto de partida de cada modelo nativo.
- [Recharts, guia de migração 3.0](https://github.com/recharts/recharts/wiki/3.0-migration-guide): observar o que mudou em componentes próprios como filhos diretos do gráfico.
- [shadcn/ui charts](https://ui.shadcn.com/charts): observar que não há categoria de dispersão.
- [Tremor, scatter chart](https://npm.tremor.so/docs/visualizations/scatter-chart): observar a API de tamanho, faixa de tamanho, opacidade e categoria, como referência de comportamento.
- [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): observar as variações de dispersão e bolha lado a lado.
- [Nightingale, busca por scatterplot](https://nightingaledvs.com/?s=scatterplot): observar os ensaios de praticantes sobre leitura de dispersão.
- [Data Viz Project, scatterplot](https://datavizproject.com/data-type/scatterplot/) (não abriu): observar a ficha do tipo e as variações relacionadas.
- [FlowingData, chart type scatter plot](https://flowingdata.com/charttype/scatter-plot/) (não abriu): observar exemplos editoriais de dispersão.

### Portais de design

Nenhum portal mostrou peça dedicada a tendência, identidade, grade categórica, trajetória, setas, barras de erro, densidade, matriz ou pequenos múltiplos; os modelos 02 e 04 a 11 ficam sem referência de portal. Nomes de designers e estúdios foram omitidos.

- [Behance, Scatter plot charting component](https://www.behance.net/gallery/149202761/Scatter-plot-charting-component) (aberto): observar a dispersão tratada como componente de biblioteca em vários estados; a página traz só imagens, sem especificação escrita. Serve aos modelos 01 e 03.
- [Behance, Quadrant Chart (Scatter Plot)](https://www.behance.net/gallery/182422151/Quadrant-Chart-%28Scatter-Plot%29) (aberto): observar a dispersão dividida em quadrantes, inspirada em peça jornalística; a página não descreve os rótulos. Ponte com a família 25.
- [Behance, UX/UI Design: Data Visualization Library](https://www.behance.net/gallery/124260019/UXUI-Design-Data-Visualization-Library): observar a biblioteca de gráficos para uma empresa de vendas de porte médio; a página não lista os tipos.
- [Behance, Bubble Chart](https://www.behance.net/gallery/156115599/Bubble-Chart): observar a peça editorial de bolhas; a página não descreve o que cada medida codifica.
- [Behance, busca por scatter plot dashboard](https://www.behance.net/search/projects/scatter%20plot%20dashboard): trouxe só dashboards genéricos, sem peça de tendência dedicada.
- [Behance, busca por bubble chart data visualization](https://www.behance.net/search/projects/bubble%20chart%20data%20visualization): ponto de partida para comparar tratamentos de bolha.
- [Dribbble, Bubble Chart](https://dribbble.com/shots/2925554-Bubble-Chart) (não abriu): observar o gráfico de bolhas com arquivo fonte, parte de uma sequência que cobre as visualizações comuns.
- [Dribbble, Figma infographics: Matrix, distribution, Scatter chart](https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart) (não abriu): observar a dispersão com distribuição em matriz; ponte com os modelos 08 e 10 e com a família 25.
- [Dribbble, tag scatter plot](https://dribbble.com/tags/scatter_plot) (não abriu): conferir a qualidade visual antes de adotar qualquer shot.
- [Dribbble, tag scatter chart](https://dribbble.com/tags/scatter-chart) (não abriu): observar como a dispersão quase nunca aparece em tamanho reduzido nos portais.
- [Dribbble, Dashboard charts library](https://dribbble.com/shots/14154711-Dashboard-charts-library) (não abriu): observar o tratamento de grades densas em tema escuro e o contraste mínimo de marcadores pequenos.
- [Figma Community, arquivo de gráficos com dispersão e bolha](https://www.figma.com/community/file/1379803816977878437/charts-line-chart-bar-chart-pie-chart-donut-radar-scatter-cahrt-buble-radial) (busca): observar bolha e dispersão lado a lado com linha, barra, radar e rosca num mesmo kit.
- [Figma Community, busca por scatter plot](https://www.figma.com/community/search?resource_type=mixed&sort_by=relevancy&query=scatter%20plot&editor_type=all) (não abriu): ponto de partida para kits de dispersão.
