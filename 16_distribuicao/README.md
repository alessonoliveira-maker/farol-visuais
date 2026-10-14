# Distribuição

Distribuição responde **como os valores se espalham**, e não quanto deu no total. A pergunta de soma vira pergunta de forma: onde está o grosso dos casos, quanto varia, se existe mais de um pico, quem são os extremos e se a média é representativa. É justamente o que o card da família 01 esconde: um ciclo médio de 74 dias pode ser dois grupos, um que fecha em três semanas e outro que arrasta seis meses, com quase ninguém fechando em 74 dias. Os treze modelos abaixo cobrem a forma de uma medida, a comparação entre grupos, o tempo até um evento com casos ainda abertos, a concentração de um total e a incerteza de cenário simulado.

Estudo de origem: [`_estudo/familias/16_distribuicao.md`](../_estudo/familias/16_distribuicao.md). Catálogo desta família: [`_estudo/catalogo/16_distribuicao.json`](../_estudo/catalogo/16_distribuicao.json). Varredura de portais: [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md).

## O que a família responde

Perguntas típicas no Farol, com dado fictício:

- **Comercial:** qual a forma do ciclo de vendas, e não só a média? O ticket tem cauda longa? Algum executivo vive de um negócio grande? Quanto tempo uma oportunidade fica parada antes de ser perdida?
- **Pré-vendas:** quanto tempo leva o primeiro contato? A fila por SDR é equilibrada? O SLA estoura em quantos casos e por quanto? Quantas tentativas até a agenda?
- **Marketing:** como o CPL se espalha entre as campanhas da mesma plataforma? Qual a mediana do CPL qualificado por origem, com a dispersão junto? Quantos criativos vivem na cauda cara?
- **Diretoria:** quanto do total vem de poucos clientes ou campanhas? O cenário tem faixa, e qual o formato dessa faixa? A premissa do simulador descreve o dado medido?

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | O que responde |
|---|---|---|---|---|---|
| 01 | Histograma | [./01_histograma/](./01_histograma/) | Recharts custom | 4 | Forma de uma medida contínua em faixas fixas; versões com média e mediana, pequenos múltiplos e massa no zero. Polígono, densidade sobreposta, stem and leaf e histograma micro são extensões. |
| 02 | Box plot | [./02_box-plot/](./02_box-plot/) | Recharts custom | 4 | Cinco números por grupo, nunca sozinho; versões com pontos por cima, outliers clicáveis, entalhe e largura por amostra. Letter-value, faixa de percentis e box micro são extensões. |
| 03 | Strip plot e beeswarm | [./03_strip-plot-e-beeswarm/](./03_strip-plot-e-beeswarm/) | Recharts nativo | 4 | Cada caso como ponto numa escala; versões de strip, wheat plot, beeswarm e barcode. |
| 04 | ECDF e histograma acumulado | [./04_ecdf-e-histograma-acumulado/](./04_ecdf-e-histograma-acumulado/) | Recharts nativo | 4 | Que percentual fica abaixo ou acima de um limiar, sem escolher bin; inclui a versão ou mais em escala log. |
| 05 | Histograma comparativo entre grupos | [./05_histograma-comparativo/](./05_histograma-comparativo/) | Recharts custom | 4 | Dois a quatro grupos na mesma régua: sobrepostos, espelhados em pirâmide ou empilhados por categoria. |
| 06 | Densidade (KDE) | [./06_densidade-kde/](./06_densidade-kde/) | Recharts nativo | 4 | Forma suave com amostra grande; absorve densidades sobrepostas e faixa de densidade em cor. |
| 07 | Violino e raincloud | [./07_violino-e-raincloud/](./07_violino-e-raincloud/) | SVG puro | 4 | Forma completa por grupo; absorve marcadores internos, raincloud, sina plot e bean plot. |
| 08 | Ridgeline | [./08_ridgeline/](./08_ridgeline/) | SVG puro | 4 | Muitas distribuições com ordem natural, como mês a mês, numa régua única. |
| 09 | Dot plot empilhado e quantile dotplot | [./09_dot-plot-empilhado/](./09_dot-plot-empilhado/) | SVG puro | 4 | Contar unidades numa pilha; absorve o quantile dotplot de 20 desfechos simulados. |
| 10 | Curva de Lorenz | [./10_curva-de-lorenz/](./10_curva-de-lorenz/) | Recharts nativo | 4 | Quanto do total vem de poucas entidades, com Gini; a curva de concentração micro usa a mesma geometria. |
| 11 | Curva de sobrevivência (Kaplan-Meier) | [./11_curva-de-sobrevivencia/](./11_curva-de-sobrevivencia/) | Recharts custom | 4 | Tempo até um evento quando parte dos casos segue em aberto, com tabela de em risco. |
| 12 | Meia-olho e desfechos hipotéticos | [./12_meia-olho-e-desfechos/](./12_meia-olho-e-desfechos/) | SVG puro | 4 | Faixa de cenário simulado com forma e intervalos; absorve os desfechos animados (HOP) com versão estática. |
| 13 | Q-Q plot | [./13_q-q-plot/](./13_q-q-plot/) | Recharts nativo | 3 | Se a medida segue a forma de uma referência teórica ou de outra amostra. |

As pastas dos modelos são criadas quando as versões forem produzidas. Total: 13 modelos e 51 versões.

## Guia rápido de escolha

| Se a pergunta é | Use |
|---|---|
| Qual a forma de uma medida, com umas 50 observações ou mais? | 01 Histograma, com bin declarado |
| A média citada no card representa o caso típico? | 01 Histograma, versão com média e mediana |
| Que percentual fica dentro do SLA ou abaixo de um valor? | 04 ECDF; para quem não conhece a curva, a versão de histograma acumulado |
| Como dois ou três grupos se comparam na mesma régua? | 05 Histograma comparativo; com amostra grande, 06 Densidade |
| Ganhos contra perdas, faixa a faixa? | 05, versão espelhada em pirâmide |
| Como 4 a 20 grupos se comparam em pouco espaço? | 02 Box plot com os pontos por cima; se a forma for o achado, 07 Violino |
| Mais de 6 grupos com ordem natural, como mês a mês? | 08 Ridgeline |
| Menos de 30 casos, ou cada caso precisa abrir drill? | 03 Strip plot e beeswarm |
| Valor discreto com poucos níveis, ou contar unidades? | 09 Dot plot empilhado |
| Quanto do total vem de poucos clientes ou campanhas? | 10 Curva de Lorenz |
| Quanto tempo até um evento, com casos ainda abertos? | 11 Curva de sobrevivência |
| Qual a faixa de um cenário simulado e a chance de bater a meta? | 12 Meia-olho; para público não técnico, o quantile dotplot do 09 |
| A premissa de forma do simulador descreve o dado medido? | 13 Q-Q plot |

Quando o filtro encolhe a amostra, a escolha muda sozinha: abaixo de 30 observações, densidade e violino viram strip ou beeswarm; abaixo de 5, só o valor em texto.

## Regras que valem para todos os modelos

1. **`n` sempre visível**, no subtítulo ou no rótulo do grupo.
2. **Bin e banda declarados** no registry da métrica, fixos entre filtros e escritos no eixo ou no rodapé.
3. **Grupo pequeno não ganha curva suave:** abaixo de 30 casos, pontos; abaixo de 5, texto.
4. **Curva recortada no observado** e em zero quando a métrica não pode ser negativa.
5. **Box plot nunca sozinho** em cartão de decisão: pontos por cima ou histograma no cartão irmão.
6. **Outlier tem nome:** ponto além da cerca abre o drill do registro fictício.
7. **Jitter com semente** derivada do id do registro, nunca `Math.random()`.
8. **Escala log só quando a cauda manda,** com aviso no eixo e zeros ou negativos contados em nota.
9. **Limiar operacional desenhado** (SLA, teto, meta), com rótulo e percentual do lado errado.
10. **Dado ausente fora do gráfico** e contado no rodapé, nunca como zero ou bin zero.
11. **Cor com um papel só:** grupo ou destaque, nunca os dois.

## Quando procurar outra família

| Situação | Família |
|---|---|
| Resumo por categoria sem mostrar a forma: mediana, intervalo, meta contra realizado em pontos | `17_comparacao-de-pontos`, modelo 02 |
| Barra ordenada por entidade com linha acumulada | `08_combinados-e-eixo-duplo`, modelo 04 (Pareto) |
| Percentis ou faixa de previsão desenhados ao longo do tempo | `05_areas`, modelo 05 (faixa) |
| Contagem em que cada ponto ou ícone é a unidade contável | `22_unidades-waffle-e-pictograma` |
| Densidade de duas variáveis ao mesmo tempo: hexbin, contorno | `09_dispersao-e-bolhas`, modelo 09 |
| Contagem por categoria nominal | `02_barras-horizontais` ou `03_colunas-verticais` |
| Distribuição no tempo por célula, como dia da semana contra hora | `15_mapa-de-calor-e-calendario` |
| Microhistograma, barcode, box ou strip dentro de card ou célula | `24_microvisuais-sparklines`, com a geometria daqui |
| Stem and leaf ou faixa de percentis em linha de tabela | `14_tabelas-visuais` |
| Composição a 100% por faixa | `02_barras-horizontais` ou `26_mosaico-marimekko` |
| Série de um valor no tempo, sem evento por caso | `04_linhas` |

## Referências

Links reunidos do estudo da família e da varredura de portais, sem link novo. Quando a página não abriu na pesquisa, a marca vem entre parênteses e a descrição veio do resultado da busca.

### Transversais à família

- [FT, Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a coluna Distribution, com histograma, dot strip, barcode, boxplot, violino, pirâmide populacional e curva acumulada lado a lado.
- [FT, pôster do Visual Vocabulary (PDF)](https://journalismcourses.org/wp-content/uploads/2020/07/Visual-vocabulary.pdf): observar o desenho de referência de cada forma da coluna Distribution.
- [Stephen Few, Distribution Displays (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf): observar a tabela que compara histograma, polígono, box, strip e quantile plot por tarefa, e as definições de quartil, decil e percentil.
- [Stephen Few, The DataVis Jitterbug (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/the_datavis_jitterbug.pdf): observar a sequência strip, strip com jitter, dot histogram e wheat plot sobre o mesmo dado, e as três regras para mexer só no ponto escondido.
- [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar como a largura do bin muda o que a forma diz, por que a densidade pode inventar cauda e por que ridgeline de histogramas não funciona.
- [Claus Wilke, visualizing many distributions at once](https://clauswilke.com/dataviz/boxplots-violins.html) (domínio bloqueado na pesquisa): observar box, violino, strip e sina lado a lado e a exigência de pontos suficientes por grupo.
- [Claus Wilke, visualizing uncertainty](https://clauswilke.com/dataviz/visualizing-uncertainty.html): observar a distinção entre faixa dos dados e faixa de incerteza da estimativa, e o limite de meio da animação.
- [ggdist, slab + interval stats and geoms](https://mjskay.github.io/ggdist/articles/slabinterval.html): observar meia-olho, pointinterval, stat_dots e ccdfinterval, todos com os mesmos intervalos.
- [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar faceta com escala compartilhada e o histograma empilhado ao lado das versões sobreposta e em facetas.

### 01 Histograma

- [Observable Plot, bin transform](https://observablehq.com/plot/transforms/bin): observar `thresholds` com scott, freedman-diaconis e sturges.
- [Highcharts, histogram demo](https://www.highcharts.com/demo/ios/histogram): observar o histograma calculado a partir da série de origem, com o dado cru mostrado embaixo como dispersão.
- [Datawrapper Academy, how to read a histogram](https://www.datawrapper.de/academy/histogram-min-max-median-mean): observar a regra do limite do bin e o exemplo em que média 293 e mediana 50 divergem.
- [Vega-Lite, histogram](https://vega.github.io/vega-lite/examples/histogram.html): observar o bin declarado no encoding e o eixo contínuo com os limites do bin, base da anotação.
- [Vega-Lite, relative frequency histogram](https://vega.github.io/vega-lite/examples/histogram_rel_freq.html): observar a troca de contagem por frequência relativa, que permite sobrepor polígonos de grupos desiguais.
- [Wikipedia, stem-and-leaf display](https://en.wikipedia.org/wiki/Stem-and-leaf_display): observar as variações de caule dividido e o tratamento de negativos.
- [John W. Tukey, biografia curta](https://mbounthavong.com/blog/2020/12/16/communicating-data-effectively-with-data-visualizations-part-32-john-w-tukey-short-biography): observar o contexto da análise exploratória de onde vem o stem and leaf.
- [Stem & Leaf Plots Extended for Text Visualizations](https://www.researchgate.net/publication/318300438_Stem_Leaf_Plots_Extended_for_Text_Visualizations): observar a extensão da forma para texto, útil para rótulos de campanha.

### 02 Box plot

- [Recharts, Box Plot](https://recharts.github.io/en-US/examples/BoxPlot/): observar o par `[q1, q3]` no `Bar`, o bigode medido a partir de Q3 e os outliers num `Scatter` à parte.
- [AG Charts, box plot com múltiplas séries](https://www.ag-grid.com/charts/gallery/multiple-box-plots/): observar o tooltip com os cinco números e a separação de séries por cor.
- [Nightingale, I've Stopped Using Box Plots. Should You?](https://nightingaledvs.com/ive-stopped-using-box-plots-should-you/): observar os três defeitos do box e o strip como substituto lido em poucos segundos.
- [From Data to Viz, the boxplot and its pitfalls](https://www.data-to-viz.com/caveat/boxplot.html) (abriu truncado): observar o argumento de que amostra pequena e bimodalidade não aparecem na caixa.
- [ggplot2, geom_boxplot](https://ggplot2.tidyverse.org/reference/geom_boxplot.html): observar `notch`, `varwidth` e a fórmula `1.58 * IQR / sqrt(n)`.
- [Wickham e Stryjewski, 40 years of boxplots (PDF)](https://vita.had.co.nz/papers/boxplots.pdf): observar a genealogia das variações desde Tukey, incluindo entalhe e largura variável.
- [Hofmann, Wickham e Kafadar, Letter-value plots](https://vita.had.co.nz/papers/letter-value-plot.html): observar a regra de parar onde o quantil deixa de ser confiável.
- [CRAN, pacote lvplot](https://archive.linux.duke.edu/cran/web/packages/lvplot/index.html): observar a escolha dinâmica de quantos letter values mostrar.
- [React Graph Gallery, boxplot com jitter](https://www.react-graph-gallery.com/example/boxplot-jitter): observar a ordem de desenho dos pontos sobre a caixa e o tamanho pequeno dos marcadores.
- [R Graph Gallery, boxplot with jitter](https://r-graph-gallery.com/96-boxplot-with-jitter.html): observar o ajuste de opacidade e tamanho do ponto para não esconder a caixa.

### 03 Strip plot e beeswarm

- [Data Visualisation Catalogue, dot distribution plot](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/): observar os nomes alternativos (strip plot, dot strip plot), a opacidade contra sobreposição e a variante barcode.
- [Guia de visualização de dados da UE, univariate scatter plots and strip plots](https://data.europa.eu/apps/data-visualisation-guide/univariate-scatter-plots-and-strip-plots): observar o strip tratado como dispersão de uma variável.
- [Observable Plot, dodge transform](https://observablehq.com/plot/transforms/dodge) (não abriu): observar `dodgeX` e `dodgeY`, que calculam a dimensão livre a partir da fixa.
- [Observable, five underused charts for richer dashboards](https://old.observablehq.com/blog/five-underused-charts-for-richer-dashboards): observar os dois alertas do beeswarm em dashboard, pontos demais e leitura de valor exato.
- [Data Visualisation Catalogue, beeswarm plots](https://datavizcatalogue.com/blog/chart-snapshot-beeswarm-plot/): observar a distinção entre beeswarm e jitter e o uso de cor para categoria.
- [amCharts, beeswarm demo](https://www.amcharts.com/demos/beeswarm/): observar o reposicionamento ao redimensionar e o tamanho do ponto como segunda variável.
- [FlowingData, compact ways to visualize distributions](https://flowingdata.com/2017/12/04/compact-ways-to-visualize-distributions-in-r/) (não abriu): observar o foco em formas compactas, como barcode, para pouco espaço.

### 04 ECDF e histograma acumulado

- [Vega-Lite, layered histogram and cumulative histogram](https://vega.github.io/vega-lite/examples/layer_cumulative_histogram.html): observar o histograma e a acumulada no mesmo plano, com a acumulada como camada.
- [Observable Plot, bin transform (fonte da documentação)](https://raw.githubusercontent.com/observablehq/plot/main/docs/transforms/bin.md): observar a opção `cumulative`, com `-1` produzindo a distribuição reversa "ou mais".
- [Claus Wilke, ECDF e Q-Q plots (espelho do livro)](https://f0nzie.github.io/dataviz-wilke-2020/ecdf-qq.html): observar a ECDF descendente para dado assimétrico e o alerta sobre público; o [endereço original](https://clauswilke.com/dataviz/ecdf-qq.html) não abriu na pesquisa.

### 05 Histograma comparativo entre grupos

- [Data Visualisation Catalogue, box and whisker plot](http://datavizcatalogue.com/methods/box_plot.html): observar a justificativa de que resumo ocupa menos espaço com muitos grupos, o limite de onde a sobreposição deixa de servir.
- [From Data to Viz, violin](https://www.data-to-viz.com/graph/violin.html): observar o alerta de que diferença de tamanho de amostra entre grupos precisa ficar visível.
- [Vega-Lite, histogram from binned data](https://vega.github.io/vega-lite/examples/bar_binned_data.html): observar o caso em que os bins já vêm calculados, como o Farol entrega os dois lados da pirâmide.

### 06 Densidade (KDE)

- [Vega-Lite, density plot](https://vega.github.io/vega-lite/examples/area_density.html): observar os parâmetros `bandwidth` e `extent`, os mesmos dois cuidados a declarar no Farol.
- [Vega-Lite, stacked density estimates](https://vega.github.io/vega-lite/examples/area_density_stacked.html): observar exatamente o que evitar, a leitura de camada empilhada, contra a versão sobreposta.
- [Vega-Lite, 2D histogram heatmap](https://vega.github.io/vega-lite/examples/rect_binned_heatmap.html): observar o bin com cor por contagem, geometria de origem da faixa de densidade em cor.

### 07 Violino e raincloud

- [Data Visualisation Catalogue, violin plot](https://datavizcatalogue.com/methods/violin_plot.html): observar a definição como box com densidade girada e o marcador de mediana dentro.
- [Data Viz Project, violin plot](https://datavizproject.com/data-type/violin-plot/) (não abriu): observar a ficha do catálogo e os exemplos relacionados.
- [React Graph Gallery, violin plot](https://www.react-graph-gallery.com/violin-plot): observar a transição entre box e violino, que expõe o que a caixa escondia.
- [r-statistics.co, violin plot in R](https://r-statistics.co/Violin-Plot-in-R.html): observar a combinação violino e mini box e a paleta que não compete com o resto do painel.
- [Mode, Violin Plots 101](https://mode.com/blog/violin-plot-examples/): observar a explicação de leitura para público de negócio.
- [Allen e colegas, Raincloud plots](https://ora.ox.ac.uk/objects/uuid:e870716e-0be2-4f7c-9e9f-a05f4aa0dd47): observar a motivação contra barra com erro e os ajustes para amostras de tamanhos diferentes.
- [RainCloudPlots no GitHub](https://github.com/RainCloudPlots/RainCloudPlots): observar a ordem das camadas e o deslocamento entre nuvem, box e chuva.
- [ggforce, geom_sina](https://ggforce.data-imaginist.com/reference/geom_sina.html): observar a definição, os modos de escala `area`, `count` e `width` e a semente.
- [Draw sinaplots with geom_sina](https://mzuer.github.io/blog/2020/05/30/r-sinaplot): observar exemplos práticos de ajuste da largura máxima.
- [Kampstra, Beanplot: a boxplot alternative](https://www.jstatsoft.org/article/view/v028c01): observar os componentes (traço por observação, densidade, médias) e a variante assimétrica.
- [CRAN, vinheta do pacote beanplot (PDF)](https://cran.r-project.org/web/packages/beanplot/vignettes/beanplot.pdf): observar os exemplos com duplicatas e bimodalidade.
- [statsmodels, beanplot](https://www.statsmodels.org/stable/generated/statsmodels.graphics.boxplots.beanplot.html): observar as opções de traço, média e lado.

### 08 Ridgeline

- [From Data to Viz, ridgeline](https://www.data-to-viz.com/graph/ridgeline.html): observar o limite de que abaixo de meia dúzia de grupos outro modelo é melhor, a exigência de ordenar os grupos e a troca de sobreposição por faixas deslocadas.
- Ver também, nas transversais, o capítulo de Claus Wilke sobre histogramas e densidades, que explica por que as faixas são densidades e não histogramas.

### 09 Dot plot empilhado e quantile dotplot

- [Data Visualisation Catalogue, dot plots e unit charts](https://datavizcatalogue.com/blog/chart-snapshot-dot-plots-unit-charts/): observar a separação entre dot plot de distribuição e gráfico de unidades.
- [Leland Wilkinson, Dot Plots (PDF)](https://www.cs.uic.edu/~wilkinson/Publications/dotplots.pdf): observar o agrupamento por densidade de pontos, diferente da grade fixa do Farol.
- [Vega, quantile dot plot example](https://vega.github.io/vega/examples/quantile-dot-plot/): observar o controle de quantidade de quantis e o empilhamento automático.
- [Kay, quantile-dotplots.md](https://github.com/mjskay/when-ish-is-my-bus/blob/master/quantile-dotplots.md): observar a construção passo a passo e a regra de leitura por contagem.
- [MU Collective, When(ish) is my bus?](https://mucollective.northwestern.edu/project/when-ish-is-my-bus): observar o uso em tela de celular e decisão cotidiana.
- [Uncertainty displays using quantile dotplots or CDFs improve transit decision-making (PDF)](https://www.mjskay.com/papers/chi2018-uncertain-bus-decisions.pdf): observar a comparação entre dotplot e curva acumulada em decisão real.

### 10 Curva de Lorenz

- [Our World in Data, what is the Gini coefficient](https://ourworldindata.org/what-is-the-gini-coefficient): observar a leitura das áreas A e B e a diagonal da igualdade.
- [CORE Econ, Lorenz curves and Gini coefficients](https://books.core-econ.org/doing-economics/book/text/05-02.html): observar o passo a passo de construção a partir de dados ordenados.
- Ver também o FT Visual Vocabulary nas transversais, que lista a curva acumulada como forma de mostrar desigualdade.

### 11 Curva de sobrevivência (Kaplan-Meier)

- [PMC, Methods to analyse time-to-event data: the Kaplan-Meier survival curve](https://pmc.ncbi.nlm.nih.gov/articles/PMC8478547/): observar a marca de censura, a tabela de em risco e a leitura da mediana em 50%.
- [numiqo, Kaplan-Meier curve explained](https://numiqo.com/tutorial/kaplan-meier-curve): observar a tabela de cálculo passo a passo com censura entre eventos.
- [MCP Analytics, Kaplan-Meier estimator practical guide](https://mcpanalytics.ai/articles/kaplan-meier-estimator-practical-guide-for-data-driven-decisions): observar a regra de truncar a leitura quando o grupo em risco fica pequeno.

### 12 Meia-olho e desfechos hipotéticos

- [ggdist, stat_halfeye](https://mjskay.github.io/ggdist/reference/stat_halfeye.html): observar os parâmetros de largura dos intervalos e de lado da densidade.
- [Jessica Hullman, página de pesquisa](https://users.eecs.northwestern.edu/~jhullman/research.html): observar a linha de trabalho sobre incerteza e os artigos de HOP.
- [Hypothetical Outcome Plots Help Untrained Observers Judge Trends in Ambiguous Data (PubMed)](https://pubmed.ncbi.nlm.nih.gov/30136961/): observar o experimento com público sem treino.
- [Towards Data Science, uncertainty visualization made easy with HOPs](https://towardsdatascience.com/uncertainty-visualization-made-easy-with-hypothetical-outcome-plots-89558574d069/): observar os exemplos animados e a cadência dos quadros.

### 13 Q-Q plot

- [Vega-Lite, quantile-quantile plot](https://vega.github.io/vega-lite/examples/point_quantile_quantile.html): observar a comparação lado a lado contra uniforme e normal com o transform de quantil.
- [Vega, quantile-quantile plot example](https://vega.github.io/vega/examples/quantile-quantile-plot/): observar a escolha interativa da distribuição de referência.
- Ver também o capítulo de Claus Wilke sobre ECDF e Q-Q no modelo 04, com o exemplo do teto de 100 pontos.

### Portais de design e kits

A varredura de portais achou pouca coisa: nenhum achado de distribuição no Behance, e os shots do Dribbble valem pelo título e trecho da busca, sem conferência visual. Os projetos do Behance abaixo são painéis gerais, citados pelo tratamento de cor, linha e grade, não por trazerem a peça de distribuição.

- [Dribbble, Box Plot with Whiskers](https://dribbble.com/shots/4615955-Box-Plot-with-Whiskers) (não abriu): observar a defesa do box como faixa e distribuição num espaço pequeno, com mediana e percentis.
- [Dribbble, Histogram Charts for Figma](https://dribbble.com/shots/23639318-Histogram-Charts-for-Figma) (não abriu): observar a coleção de histogramas customizáveis para montar dashboard.
- [Dribbble, Radial histogram charts](https://dribbble.com/shots/22332016-Radial-histogram-charts) (resultado de busca): observar o histograma radial como exemplo do limite de leitura do formato.
- [Dribbble, Distribution Chart UI design, Figma templates kit](https://dribbble.com/shots/13988553-Distribution-Chart-Ui-design-Figma-templates-kit) (resultado de busca): observar faixa e distribuição por grupo em kit de interface.
- [Dribbble, Charts UI design Figma templates: bars, histograms, line graphs](https://dribbble.com/shots/20359409-Charts-UI-design-Figma-templates-Bars-histograms-line-graphs) (não abriu): observar a biblioteca de histogramas do kit.
- [Figma Community, r19 Data Visualization Kit](https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit): observar curva de densidade, box plot, violino e histograma no mesmo kit gratuito, com caixa, mediana e bigode em camadas editáveis.
- [Ant Design Charts for Figma](https://www.antforfigma.com/ant-design-charts-for-figma): observar histograma, box e violino no mesmo kit de componentes estatísticos.
- [Highcharts, box plot no tema escuro](https://www.highcharts.com/demo/box-plot/dark-unica): observar o contraste de bigode e mediana sobre fundo escuro.
- [Flourish, box, violin e beeswarm no template de dispersão](https://helpcenter.flourish.studio/hc/en-us/articles/9859136207759-How-to-make-box-violin-and-beeswarm-scatter-plots): observar box, violino e pontos tratados como camadas ligáveis no mesmo gráfico.
- [Data Viz Project, beeswarm plot](https://datavizproject.com/data-type/beeswarm-blot/): observar a ficha visual e os exemplos editoriais ligados a ela.
- [Python Graph Gallery, violino com beeswarm](https://python-graph-gallery.com/502-violinplot-and-swarmplot/): observar a referência visual mais próxima do raincloud; é galeria de código, não portal.
- [SetProduct, distribution chart patterns](https://setproduct.com/charts/patterns/distribution): observar o histograma em tema claro e escuro com legenda, eixo e anotação de ponto.
- [Behance, Figma Charts Kit, dashboard templates design system](https://www.behance.net/gallery/67155393/Figma-Charts-Kit-Dashboard-templates-design-system): observar linha de referência e rótulo dentro da área do gráfico, e o gradiente suave sob a curva.
- [Behance, Charts. Infographics. Data design in Figma](https://www.behance.net/gallery/70284157/Charts-Infographics-Data-design-in-Figma): observar peso de linha em séries múltiplas e camadas sobrepostas com rótulo lateral.
- [Behance, Advanced SaaS Analytics Dashboards & KPI UI/UX, P1](https://www.behance.net/gallery/129162191/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-P1): observar barra neutra com linha de destaque e preenchimento translúcido em tema escuro.
- [Behance, Advanced SaaS Analytics Dashboards & KPI UI/UX, Set 01](https://www.behance.net/gallery/93727935/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-Set-01): observar a grade de cartões pequenos e o tamanho mínimo de rótulo que ainda se lê.
- [Behance, Sales Analytics, B2B Dashboard UI/UX](https://www.behance.net/gallery/248974775/Sales-Analytics-B2B-Dashboard-UIUX): observar a paleta de duas séries em superfície escura e o contraste na interseção.
- [Behance, Data screen, Regional business monitoring](https://www.behance.net/gallery/171554797/Data-screen-Regional-business-monitoring): observar a composição espelhada com eixo central compartilhado em painel escuro.
- [Behance, Web app to optimize energy distribution](https://www.behance.net/gallery/204349647/Web-app-to-optimize-energy-distribution): observar faixas coloridas contínuas como leitura de intensidade em interface escura.

### Lacunas registradas

- **Sem referência de portal:** 14 dos 36 tipos do estudo, entre eles raincloud, sina, barcode, quantile dotplot, ECDF, Q-Q, Lorenz, faixa de percentis, stem and leaf, Kaplan-Meier, meia-olho, bean plot, HOP e wheat plot.
- **Afirmações só de resultado de busca**, sem leitura da fonte primária: redução de cerca de 1,15 vez na variância com quantile dotplot, achados de HOP, regra de truncar Kaplan-Meier abaixo de 10% ou 15 casos e fórmula do entalhe do ggplot2.
- **A conferir antes de virar código:** nomes de tipo `BarShapeProps` e `ScatterShapeProps` e os hooks de layout na versão 3.10 instalada do Recharts; o inverso aproximado da normal do Q-Q e a regra de níveis do letter-value, contra tabela e contra o artigo.
