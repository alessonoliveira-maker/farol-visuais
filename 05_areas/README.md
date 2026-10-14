# Áreas

A área é uma linha preenchida até uma base, e o preenchimento codifica massa. Por isso a família responde perguntas de volume e de composição ao longo do tempo: como um total evoluiu e quanto cada parte contribuiu, qual o envelope de valores possíveis, quanto ficou acima ou abaixo de uma referência e que padrão aparece em muitas séries com pouco espaço. A regra de base vale para todos os modelos: a área parte do zero ou de uma base declarada (EIX-1 e EIX-2 do [CONTRATO](../CONTRATO.md)); quando o total não importa e a pergunta é comparar trajetórias, a resposta mora em `04_linhas`.

## O que a família responde

- **Comercial:** como a receita reconhecida se distribui ao longo do ano? Em que meses ficamos acima ou abaixo da meta e quanto isso soma? O funil de oportunidades está enchendo ou esvaziando?
- **Pré-vendas:** quanto da demanda semanal passou do teto de capacidade? Como o estoque da fila se compõe por etapa? Quais equipes passaram mais dias abaixo do SLA?
- **Marketing:** como o investimento se distribui entre plataformas? A fatia de leads sem origem declarada caiu depois da correção de coleta? Em que semanas cada campanha concentrou leads?
- **Diretoria:** como o custo em três camadas evoluiu? Qual a faixa de cenários de receita para 2027 e a chance de bater a meta? A participação de mercado muda com o perímetro?

## Modelos

| # | Modelo | Técnica | Versões | Pergunta que responde |
|---|---|---|---|---|
| 01 | [Área simples com gradiente](./01_area-simples/) | recharts-nativo | 4 | Como um volume evoluiu; em pequenos múltiplos, a forma de cada parte com escala comum |
| 02 | [Área empilhada](./02_area-empilhada/) | recharts-nativo | 4 | Total e composição juntos; entradas e saídas com `stackOffset="sign"`; mix em cartão pequeno |
| 03 | [Área 100%](./03_area-100/) | recharts-nativo | 4 | Como a participação de cada parte mudou quando o total não é a notícia |
| 04 | [Áreas sobrepostas](./04_areas-sobrepostas/) | recharts-nativo | 4 | Quanto de um envelope foi usado; capacidade em área e demanda em linha |
| 05 | [Faixa (range band)](./05_faixa-range-band/) | recharts-nativo | 4 | Entre que bordas o valor está: mínimo e máximo, perímetros, cenários discretos |
| 06 | [Leque de projeção (fan chart)](./06_leque-de-projecao/) | recharts-nativo | 4 | Quanto a projeção pode variar e qual a chance de passar da meta ou do teto |
| 07 | [Área de diferença contra meta](./07_area-de-diferenca/) | recharts-custom | 4 | Onde e quanto o real ficou acima ou abaixo da referência |
| 08 | [Streamgraph](./08_streamgraph/) | recharts-nativo | 4 | Onde o volume de muitas categorias se concentrou; na variação ordenada, como a ordem mudou |
| 09 | [Horizon chart](./09_horizon-chart/) | recharts-custom | 4 | Qual de dezenas de séries saiu do normal, e quando |
| 10 | [Area bump](./10_area-bump/) | svg-puro | 3 | Quem lidera o ranking em cada período e com quanto |

O catálogo das versões (título, caso de uso, o que demonstra e canvas sugerido) está em [`_estudo/catalogo/05_areas.json`](../_estudo/catalogo/05_areas.json). As versões fora da técnica principal do modelo estão marcadas lá: a `v3` do modelo 01 é grade HTML com Tailwind, a `v3` do 08 e a `v3` do 09 são SVG puro.

**Nota de acabamento.** O nome do modelo 01 herda o gradiente do estudo, mas a COR-9 do CONTRATO proíbe gradiente decorativo: no catálogo o preenchimento é plano, em opacidade baixa, com contorno de 2 px. O único corte de cor aceito é o que codifica dado, como a parada dura no zero do modelo 07. Pelo mesmo motivo, a camada "sem dado" do modelo 03 usa o papel de ausência do CONTRATO (contorno `--text-muted` sem preenchimento) no lugar da hachura sugerida no estudo.

## Quando a família serve

- Série no tempo com 10 ou mais datas em que o volume, a soma ou a massa é a leitura.
- Composição que muda no tempo, com até 6 partes coloridas e a ausência por último.
- Envelope, perímetro, projeção ou saldo contra referência, sempre com base declarada.
- Muitas séries em pouco espaço, quando o objetivo é achar exceção e não ler valor.

## Quando procurar outra família

- Comparar trajetórias sem que a soma importe, ou escala que não começa no zero: `04_linhas`.
- Menos de cerca de 10 datas: colunas empilhadas em `03_colunas-verticais`.
- Participação num único instante: `06_pizza` ou `22_unidades-waffle-e-pictograma`.
- Duas grandezas de unidades diferentes: `08_combinados-e-eixo-duplo`.
- Distribuições deslocadas por grupo: `16_distribuicao`.
- Mosaico ao longo do tempo, com largura igual ao total: `26_mosaico-marimekko`.
- Área radial: `07_rosca-e-radial` ou `18_radar`.

## Guia rápido: qual modelo escolher

Responda na ordem; a primeira pergunta com "sim" decide.

1. **Há uma referência (meta, limiar, zero) e a pergunta é quanto ficou acima ou abaixo?** Área de diferença, [07](./07_area-de-diferenca/). Se forem entradas e saídas por camada, área empilhada divergente, [02](./02_area-empilhada/) versão `v4`.
2. **O dado é uma projeção com percentis?** Leque, [06](./06_leque-de-projecao/). Se forem cenários discretos, faixa, [05](./05_faixa-range-band/).
3. **O dado é um par de bordas (mínimo e máximo, perímetro restrito e amplo)?** Faixa, [05](./05_faixa-range-band/).
4. **São exatamente duas grandezas na mesma unidade, uma contida na outra?** Áreas sobrepostas, [04](./04_areas-sobrepostas/); com a protagonista em linha, versão `v2`.
5. **São de 10 a 50 séries e a pergunta é qual saiu do normal?** Horizon, [09](./09_horizon-chart/), só em tela de analista e com legenda de faixas.
6. **Ranking e volume importam juntos, com até 8 itens?** Area bump, [10](./10_area-bump/).
7. **São partes de um total?**
   - O total e as partes importam: área empilhada, [02](./02_area-empilhada/).
   - Só a participação importa: área 100%, [03](./03_area-100/).
   - Mais de 6 categorias com padrão sazonal e sem valor exato: streamgraph, [08](./08_streamgraph/); se a troca de ordem é a história, versão `v3`.
   - A forma de cada parte importa mais que a soma: pequenos múltiplos, [01](./01_area-simples/) versão `v3`.
8. **Uma série só:** área simples, [01](./01_area-simples/).

| Se a dúvida é entre | Escolha | Por quê |
|---|---|---|
| 02 e 03 | 03 só se a variação do total não for notícia; senão 02, ou 03 com painel de total (`v3`) | a área 100% esconde o total |
| 02 e 08 | 02 até 6 camadas com valor lido; 08 para muitas categorias e impressão geral | o streamgraph não tem eixo y com significado |
| 04 e 07 | 07 quando a pergunta é o excesso ou a falta; 04 quando é a ocupação | a transparência de 04 não mostra saldo |
| 05 e 06 | 06 só com percentis vindos de um método; cenários discretos são 05 | três cenários não formam distribuição |
| 09 e pequenos múltiplos | pequenos múltiplos (01 `v3`) para quem nunca viu horizon | o horizon exige aprendizado |
| 10 e bump chart de linha | 10 quando o volume muda a leitura do ranking | a espessura pode ser lida como posição |

## Referências cruzadas

Formas que parecem desta família mas moram em outra, conforme o plano do catálogo:

- **Área em degrau** (item 12 do estudo): `04_linhas/03_step-degrau`. Aqui ela aparece só como técnica (`Area type="stepAfter"`) na capacidade do modelo 04.
- **Linha com banda protagonista:** `04_linhas/04_linha-com-banda-de-intervalo`. Quando a faixa é o dado e a linha é opcional, o visual fica no modelo 05.
- **Ridgeline:** `16_distribuicao/08_ridgeline`.
- **Sparkarea em cartão:** `24_microvisuais-sparklines/01_sparkline-de-linha`.

Variações absorvidas como versões desta família:

- Pequenos múltiplos de área (item 14 do estudo 05): modelo 01, versão `v3`.
- Área divergente (item 11 do estudo 05): modelo 02, versão `v4`.
- Área empilhada micro (24.11 do estudo 24): modelo 02, versão `v2`.
- Área com linha (3.7 do estudo 08): modelo 04, versões `v2` a `v4`.
- Streamgraph ordenado (item 5 do estudo 05): modelo 08, versão `v3`.
- Horizonte micro (24.10 do estudo 24): modelo 09, versão `v3`.

## Referências

Todas as fontes vêm de [`_estudo/familias/05_areas.md`](../_estudo/familias/05_areas.md), das variações absorvidas em [`_estudo/familias/08_combinados-e-eixo-duplo.md`](../_estudo/familias/08_combinados-e-eixo-duplo.md) (3.7) e [`_estudo/familias/24_microvisuais-sparklines.md`](../_estudo/familias/24_microvisuais-sparklines.md) (24.10 e 24.11), e da seção 05_areas de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). Links marcados (não abriu) apareceram em busca e não foram lidos. Bibliotecas fora da stack (nivo, Vega-Lite, Highcharts, AG Charts, RAWGraphs) valem como referência de forma e de parâmetro, nunca como dependência.

### Método e escolha da forma

- [Datawrapper, What to consider when creating area charts](https://www.datawrapper.de/blog/area-charts): mais importante embaixo, agrupamento em outros, colunas quando há poucas datas e quando preferir linha.
- [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart): opção de empilhar a 100%, áreas não empilhadas com controle de opacidade, destaque de períodos e escolha de interpolação.
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): divisão em painéis quando há sobreposição.
- [Storytelling with Data, what is an area graph](https://www.storytellingwithdata.com/blog/2020/4/9/what-is-an-area-graph): ambiguidade de base nas camadas empilhadas, pequenos múltiplos como uso recomendado e a crítica ao streamgraph.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): o fan chart listado em Change over Time.
- [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization): bump area chart como tipo próprio.
- [From Data to Viz, Area chart](https://www.data-to-viz.com/graph/area.html): fonte de apoio da área simples no estudo; conferir a ficha antes de citar um ponto específico.

### 01 Área simples com gradiente

- [Data Viz Catalogue, Area Graph](https://datavizcatalogue.com/methods/area_graph.html): a área enfatiza tendência; áreas agrupadas com base comum contra empilhadas.
- [Vega-Lite, Area Chart with Gradient](https://vega.github.io/vega-lite/examples/area_gradient.html): paradas do gradiente e contorno na cor final (no catálogo o preenchimento é plano, ver a nota de acabamento).
- [Vega-Lite, Area Chart with Overlaying Lines and Point Markers](https://vega.github.io/vega-lite/examples/area_overlay.html): linha e pontos como propriedades da própria área.
- [shadcn/ui, Area Charts](https://ui.shadcn.com/charts/area): as 10 variantes sobre Recharts prontas para copiar.
- [Tremor, Area Chart](https://tremor.so/docs/visualizations/area-chart): `type` default, stacked e percent, e `fill` gradient, solid ou none.

### 02 Área empilhada

- [Data Viz Catalogue, Stacked Area Graph](https://datavizcatalogue.com/methods/stacked_area_graph.html): dificuldade de ler as camadas do meio e ausência de negativos.
- [From Data to Viz, Stacked area](https://www.data-to-viz.com/graph/stackedarea.html): influência da ordem das camadas e pequenos múltiplos como alternativa superior.
- [Recharts, Stacked Area Chart](https://recharts.github.io/en-US/examples/StackedAreaChart/): `stackId` compartilhado.
- [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/): valores de `stackOffset` (`expand`, `silhouette`, `wiggle`, `sign`, `none`, `positive`).
- [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/): fases anotadas e linha de break even.
- [Highcharts, Area with negative values](https://www.highcharts.com/demo/highcharts/area-negative): leitura de lucro e prejuízo numa área que cruza o zero.
- [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart): área micro empilhável com eixos escondidos, e não removidos, para a escala seguir funcionando.
- [Datawrapper Academy, How to add bar charts and line charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): coluna vazia de separação entre microvisuais adjacentes.
- [Storytelling with Data, little things can mean a lot](https://www.storytellingwithdata.com/blog/2020/2/13/little-things-can-mean-a-lot): ordem e consistência entre elementos repetidos.

### 03 Área 100%

- [Recharts, Percent Area Chart](https://recharts.github.io/en-US/examples/PercentAreaChart/): `stackOffset="expand"` e a dica que calcula o percentual.
- [Vega-Lite, Normalized Stacked Area Chart](https://vega.github.io/vega-lite/examples/stacked_area_normalize.html): `stack: normalize`.
- [AG Charts, 100% Stacked Area Chart](https://www.ag-grid.com/charts/gallery/100--stacked-area/): `normalizedTo` e a dica com a unidade original.
- [Highcharts, Percentage area](https://www.highcharts.com/demo/highcharts/area-stacked-percent): leitura de composição sem total.

### 04 Áreas sobrepostas

- [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/): quatro áreas sobrepostas a 70% de opacidade com traço de 2 px.
- [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/): ordem `Area`, `Bar`, `Line` dentro do `ComposedChart`.
- [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide): áreas claras e linhas escuras; uma linha sobre área como combinação preferida.
- [AG Charts, Step Interpolation Combination Chart](https://www.ag-grid.com/charts/gallery/step-interpolation-combination/): faixa e linhas em degrau e o rodapé que explica a transformação dos dados.
- [AG Charts, Stacked Bar And Area Combination Chart](https://www.ag-grid.com/charts/gallery/stacked-bar-area-combination/): área em degrau com preenchimento 0,3 sobre colunas empilhadas.

### 05 Faixa (range band)

- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/): `dataKey` em array.
- [Recharts, Area API](https://recharts.github.io/en-US/api/Area/): `dataKey` para faixa, `baseValue`, `connectNulls` e os tipos `step` e `stepAfter`.
- [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/): faixa anual com marcos de eventos.
- [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line): faixa com linha média e dica com as duas bordas.

### 06 Leque de projeção (fan chart)

- [Wikipedia, Fan chart (time series)](https://en.wikipedia.org/wiki/Fan_chart_(time_series)): construção por percentis e o caso assimétrico.
- [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html): banda e linha central em camadas.
- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/): base técnica para empilhar faixas aninhadas.

### 07 Área de diferença contra meta

- [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/): cor dividida na razão do zero, calculada com `useYAxisScale` e `useChartHeight`.
- [AG Charts, Range Area Difference Chart With Inverted Style](https://www.ag-grid.com/charts/gallery/range-area-difference-inverted-style/): opacidade diferente conforme a série que domina.
- [Highcharts, Area with negative values](https://www.highcharts.com/demo/highcharts/area-negative): leitura de área que cruza o zero.

### 08 Streamgraph

- [Lee Byron, Stacked Graphs: Geometry and Aesthetics](https://leebyron.com/streamgraph/): relação entre estética e legibilidade e as técnicas de cor e ordem.
- [Wikipedia, Streamgraph](https://en.wikipedia.org/wiki/Streamgraph): minimização de oscilação e limitação a valores positivos.
- [Data Viz Catalogue, Stream Graph](https://datavizcatalogue.com/methods/stream_graph.html): problemas de legibilidade com muitos dados.
- [From Data to Viz, Streamgraph](https://www.data-to-viz.com/graph/streamgraph.html): variações com base zero e percentual; dado sem padrão temporal vira faixa monótona.
- [Vega-Lite, Streamgraph](https://vega.github.io/vega-lite/examples/stacked_area_stream.html): `stack: center` e eixo y oculto.
- [nivo, Stream](https://nivo.rocks/stream/): tipos de deslocamento e opções de ordem das camadas, inclusive para a variação ordenada.
- [Highcharts, Streamgraph](https://www.highcharts.com/demo/highcharts/streamgraph): offset e interpolação como parâmetros de primeira classe.
- [RAWGraphs, How to make a streamgraph](https://www.rawgraphs.io/learning/how-to-make-a-streamgraph): ordenação como parâmetro.
- [Data Viz Project, Stream Graph](https://datavizproject.com/data-type/stream-graph/) (não abriu): apareceu na busca; a página devolveu 403.
- [Data Viz Project, Sorted Stream Graph](https://datavizproject.com/data-type/sorted-stream-graph/) (não abriu): referência da variação ordenada, mesma família de páginas que devolveu 403.

### 09 Horizon chart

- [Stephen Few, Time on the Horizon](http://www.perceptualedge.com/articles/visual_business_intelligence/time_on_the_horizon.pdf): construção passo a passo, com matiz para sinal e intensidade em passos.
- [Stephen Few, Horizon Graphs Revisited](https://www.perceptualedge.com/blog/?p=390): exemplo de 50 séries com faixas de 10% e as críticas sobre separadores e cores.
- [Wikipedia, Horizon chart](https://en.wikipedia.org/wiki/Horizon_chart): espelhamento, faixas sobrepostas e histórico.
- [Vega-Lite, Horizon Graph](https://vega.github.io/vega-lite/examples/area_horizon.html): duas camadas com `clip` e domínio fixo.
- [RAWGraphs, How to make a horizon graph](https://www.rawgraphs.io/learning/how-to-make-a-horizon-graph): abriu só com a introdução; vale como ferramenta de referência.
- [Datawrapper, What to consider when creating small multiple line charts](https://www.datawrapper.de/blog/what-to-consider-when-creating-small-multiple-line-charts): escala comum entre painéis, que vale com mais força no horizon.
- [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): trellis e small multiples como alternativa de menor densidade e maior legibilidade.
- [Heer, Kong e Agrawala, Sizing the Horizon](http://vis-ucb-maneesh.stanford.edu/papers/horizon/2009-TimeSeries-CHI.pdf) (não abriu): estudo sobre tamanho e número de faixas; o certificado do servidor falhou, então o número de 3 faixas segue sem validação.

### 10 Area bump

- [nivo, AreaBump](https://nivo.rocks/area-bump/): ranking e valor na mesma forma.
- [nivo, Bump](https://nivo.rocks/bump/): a versão só de ranking, para comparar.
- [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization): bump area chart como tipo próprio.

### Portais de design

- [Behance, cartão de gráfico de linha](https://www.behance.net/gallery/227919755/Line-Chart-Card-Design) (aberto; imagens não inspecionadas): relação entre número, variação e área no cartão.
- [Behance, kit universal de visualização de dados](https://www.behance.net/gallery/131066689/Universal-Data-Visualization) (aberto; imagens não inspecionadas): kit de Figma com dashboards e mais de 100 componentes, útil para pequenos múltiplos.
- [Behance, painel escuro de gestão de tarefas](https://www.behance.net/gallery/253051769/Taski-SaaS-Task-Project-Management-Dashboard) (aberto): gráficos de tendência com paleta de dois acentos, azul e âmbar, sobre fundo escuro.
- [Behance, painel escuro de gestão de negócios](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI) (aberto): área de receita em painel escuro, com acentos vibrantes para hierarquia.
- [Dribbble, área empilhada saturada](https://dribbble.com/shots/6250451--Juicy-Stacked-Area-Chart) (não abriu): conferir a legibilidade das camadas no escuro antes de adotar.
- [Dribbble, área circular](https://dribbble.com/shots/2884979-Circular-Area-Chart) (não abriu): área em coordenada polar, vale como contra-exemplo de leitura.
- [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard): cartões de mix com duas ou três faixas e a raridade, justificada, de quatro ou mais.
- [Dribbble, tag heatmap chart](https://dribbble.com/tags/heatmap-chart) (não abriu): intensidade por faixa quase sempre em grade e quase nunca dobrada em bandas, sinal de que o horizon é ferramenta de analista.

**Lacunas dos portais:** nenhuma peça específica de área 100%, faixa, leque de projeção, área de diferença, horizon, streamgraph ordenado ou area bump. A varredura só achou área 100% como título de resultado de busca, sem URL.
