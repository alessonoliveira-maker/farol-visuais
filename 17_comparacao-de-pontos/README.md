# Comparação de pontos

Comparação de pontos é a família que troca área por posição. Em vez de encher uma barra do zero até o valor, ela marca o valor com um ponto e deixa o resto do espaço livre: cabe muito mais categoria na mesma altura de cartão e a escala não precisa começar em zero, porque o leitor julga posição sobre um eixo comum e não comprimento a partir de uma base. Quando o ponto aparece duas vezes na mesma linha, a pergunta muda de "quanto" para "quanto mudou" ou "qual a distância entre os dois", e é aí que entram o dumbbell, o arrow plot, o range plot e o slope chart.

Catálogo VISUAIS do Farol, 2026-09-14. Estudo de origem: [`_estudo/familias/17_comparacao-de-pontos.md`](../_estudo/familias/17_comparacao-de-pontos.md). Todos os casos de uso são fictícios.

## O que a família responde

* **Comercial:** qual o ticket médio de cada um dos 14 executivos no mesmo cartão; se o ciclo de venda encurtou entre semestres; onde cada executivo está entre meta, forecast e realizado; como o win rate de cada um mudou de um semestre para o outro.
* **Pré-vendas:** se o SLA de primeiro contato melhorou da semana passada para esta, por SDR; qual a carga de cada fila contra o teto; quantas agendas por SDR, ordenadas, sem gastar meia tela com barras.
* **Marketing:** quanto o CPL de cada campanha mudou de um mês para o outro; qual a distância entre o CPL bruto e o CPL qualificado por origem, que é a pergunta real do orçamento; quais plataformas trocaram de posição.
* **Diretoria:** quanto o custo por unidade entregue de cada área desviou do orçado; como a participação de cada canal mudou entre anos.

A família ganha em três situações: lista longa (acima de cerca de 12 categorias a barra já perdeu), escala em que o zero não diz nada e comparação de distância entre dois valores. Perde quando a plateia não conhece o formato e a barra comum resolve: novidade não vence familiaridade, e a diferença de precisão medida entre barra, lollipop e dot plot fica em torno de 1%.

## Modelos

As pastas de modelo são criadas pelos produtores; os links abaixo apontam para onde cada uma vai morar.

| # | Modelo | Técnica | O que resolve | Versões previstas |
|---|---|---|---|---|
| 01 | [Dot plot de Cleveland](./01_dot-plot-de-cleveland/) | Recharts nativo | Um valor por categoria em lista longa, escala sem zero; agrupado, desvio, pequenos múltiplos e marca direcional | 4 |
| 02 | [Dot plot com intervalo e distribuição ao fundo](./02_dot-plot-com-intervalo/) | Recharts nativo | Resumo por categoria com faixa de incerteza declarada e os casos que o sustentam ao fundo | 4 |
| 03 | [Dumbbell e arrow plot](./03_dumbbell/) | Recharts com shape própria | Mudança entre dois momentos do mesmo objeto, direção com seta, até três marcadores e micro haltere | 4 |
| 04 | [Range plot](./04_range-plot/) | Recharts nativo | Distância entre dois extremos, com marcador interno contra teto e colunas de faixa | 4 |
| 05 | [Lollipop](./05_lollipop/) | Recharts com shape própria | Magnitude a partir do zero com menos tinta, na horizontal, vertical, divergente e agrupado | 4 |
| 06 | [Slope chart](./06_slope-chart/) | SVG puro | Antes e depois com troca de posição, rótulos sem colisão e pequenos múltiplos de micro slope | 4 |

Variações do estudo absorvidas como versões: o dot plot agrupado, o de desvio, os pequenos múltiplos e a marca direcional entram no 01, e o dot plot por dimensão da família 18 vira o caso agrupado do 01 com dimensões nas linhas; o resumo com distribuição ao fundo entra no 02; o connected dot plot de três pontos, o arrow plot e o micro dumbbell da família 24 entram no 03; o range plot com marcador interno, a barra de faixa da família 02 e as colunas de faixa da família 03 entram no 04; o lollipop horizontal da família 02 e as formas vertical, divergente e agrupada entram no 05; os painéis de slope e o micro slope da família 24 entram no 06. O dumbbell agrupado e o dot plot pareado em colunas não viraram versão própria: o primeiro é a mesma shape do 03 com dois Bar irmãos, o segundo é o haltere do 03 girado quando a categoria tem ordem natural.

## Guia rápido: qual modelo escolher

Comece pela pergunta, não pela forma. A Datawrapper separa os três desenhos mais parecidos por ênfase: dot plot quando importam os valores, range plot quando importa a distância, arrow plot quando importa a mudança.

| Se a pergunta é... | Use |
|---|---|
| Quanto vale cada categoria, numa lista de 12 a 25 linhas ou numa escala sem zero | 01 |
| Quanto cada categoria se afasta de uma referência comum, com sinal | 01, versão de desvio; se a âncora no zero precisa aparecer, 05 divergente |
| Como duas ou três medidas se posicionam na mesma linha, sem antes e depois | 01, versão agrupada |
| Qual o valor típico e quanto ele pode variar, com o n à vista | 02 |
| Quanto mudou entre dois momentos do mesmo objeto | 03 |
| Para que lado mudou, com mais peso na direção que nos valores | 03, versão em seta |
| Onde ficam meta, forecast e realizado na mesma linha | 03, versão de três pontos |
| Qual a distância entre dois extremos, sem ordem entre eles | 04 |
| Qual a faixa observada e onde está o valor de agora contra um teto | 04, versão com marcador interno |
| Quanto vale cada categoria a partir do zero, com menos tinta que a barra | 05 |
| Quem trocou de posição entre dois momentos | 06 |
| Como muitas categorias mudaram entre dois momentos sem virar emaranhado | 06, versão em painéis |

Três testes antes de escolher:

* **A pergunta é de razão ("quantas vezes maior")?** Então é barra da família 02 ou 03. Comprimento a partir da origem sustenta razão; posição não.
* **Há mais de três marcadores por linha?** Então o desenho já é linha, família 04. É o teto que a Datawrapper publica para dot e arrow plot.
* **Os dois pontos são o mesmo objeto?** Só então entra conector (03, 06). Duas populações diferentes ficam sem conector, no 01 agrupado.

## Decisões que valem para a família toda

1. **Ordem declarada, nunca alfabética por acidente.** O subtítulo diz por que a lista está naquela ordem ("ordenado por diferença", "ordenado pelo valor de agosto"); cada ordenação conta uma história diferente com o mesmo dado.
2. **Eixo comum e domínio explícito.** O `domain` vem do registry da métrica e não muda com o filtro; pequenos múltiplos e painéis herdam o mesmo domínio. Faceta com escala própria por painel é o erro silencioso mais frequente do grupo.
3. **Nada horizontal imita grade de escala.** Até cerca de 8 categorias não há guia por linha; acima disso, zebra em `--surface-raised` ou separador fino entre bandas, nunca uma reta passando pelo centro do ponto.
4. **Dois pontos ligados sempre dizem qual é o antes.** Legenda com a forma exata do marcador e, no primeiro item, rótulo direto nas duas pontas; o sentido vem do dado, nunca da geometria da faixa.
5. **Direção codificada duas vezes, polaridade declarada.** Cor de subida e descida é redundância: seta, ordem ou sinal no rótulo dizem o mesmo sem cor. Cada métrica carrega `melhorQuando`; CPL e SLA que caem são verdes, receita que cai é vermelha.
6. **Ausente não vira zero nem ponto cheio.** Ponto vazado em `--line-strong` com o tooltip "sem dado no período"; dumbbell com uma só ponta vira ponto solto, sem conector descendo até zero.
7. **O rótulo direto é o delta, com sinal.** Os dois valores vão no tooltip e na tabela irmã, que acompanha dumbbell e slope como Tufte recomenda.
8. **Teto de linhas e alvo de clique.** Até 12 linhas no cartão pequeno e 25 no largo, acima disso lista rolável com a régua fixa; a área sensível é a banda inteira, com pelo menos 24 px de altura.

## Referências cruzadas

Variações vistas no estudo desta família que moram em outra família do catálogo, para não duplicar modelo.

| Variação | Onde mora | Por que lá |
|---|---|---|
| Dot strip plot (muitos pontos por categoria numa tira) | [16_distribuicao, 03 strip plot e beeswarm](../16_distribuicao/03_strip-plot-e-beeswarm/) | Com muitos casos a pergunta vira a forma da distribuição, e o problema central é o empilhamento de valores iguais |
| Bump chart de ranking | [04_linhas, 08 bump chart](../04_linhas/08_bump-chart/) | Três a oito períodos com o eixo carregando posição; é o slope estendido, lido como linha |
| Dot plot em matriz categórica | [09_dispersao-e-bolhas, 04 bolhas em grade categórica](../09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/) | Valor em tamanho por cruzamento de duas categorias; área, não posição |
| Bullet com faixas qualitativas | [13_progresso-meta-e-gauge, 02 bullet chart](../13_progresso-meta-e-gauge/02_bullet-chart/) | Ponto contra meta com faixa qualitativa de fundo; o range plot (04) fica com a variante sem faixa |
| Coordenadas paralelas | [18_radar, 06 coordenadas paralelas](../18_radar/06_coordenadas-paralelas/) | Parece slope com mais colunas, mas a pergunta é multivariada |

## Quando procurar outra família

| Situação | Vá para |
|---|---|
| Magnitude a partir do zero com poucas categorias e leitura de razão | [02_barras-horizontais](../02_barras-horizontais/) ou [03_colunas-verticais](../03_colunas-verticais/) |
| Barra divergente, divergente empilhada ou spine chart | [02_barras-horizontais](../02_barras-horizontais/) |
| A forma da distribuição importa: dois picos, cauda, onde está o grosso | [16_distribuicao](../16_distribuicao/) |
| Duas medidas quantitativas cruzadas num plano, inclusive setas de antes e depois em XY | [09_dispersao-e-bolhas](../09_dispersao-e-bolhas/) |
| Série contínua no tempo com muitos pontos, ou mais de três marcadores por categoria | [04_linhas](../04_linhas/) |
| Cenário pessimista, base e otimista contra a meta | [13_progresso-meta-e-gauge, 07 faixa de cenário contra meta](../13_progresso-meta-e-gauge/07_faixa-de-cenario-contra-meta/) |
| Ponto ou seta de direção dentro da célula de uma tabela ordenável | [14_tabelas-visuais](../14_tabelas-visuais/) |
| Microdot ou marcador em trilho numa célula estreita | [24_microvisuais-sparklines](../24_microvisuais-sparklines/) |
| Barras ou hastes dispostas em círculo | [07_rosca-e-radial](../07_rosca-e-radial/) |
| Faixa com início e fim no calendário | [20_cronograma-e-linha-do-tempo](../20_cronograma-e-linha-do-tempo/) |
| Símbolo proporcional em lista ordenada ou ponto como unidade contável | [09_dispersao-e-bolhas](../09_dispersao-e-bolhas/) ou [22_unidades-waffle-e-pictograma](../22_unidades-waffle-e-pictograma/) |
| Matriz categórica densa, com a célula inteira pintada | [15_mapa-de-calor-e-calendario](../15_mapa-de-calor-e-calendario/) |

## Referências

Só links já registrados no [estudo da família](../_estudo/familias/17_comparacao-de-pontos.md) e no [estudo de portais](../_estudo/00_portais-de-design.md). A proveniência vem entre colchetes: **[aberto]** a página foi lida; **[parcial]** carregou sem o conteúdo inteiro; **[busca]** vale pelo título e trecho da busca; **(não abriu)** houve tentativa sem resposta legível e a descrição vem da busca.

### Catálogos e documentação

| Referência | Modelos | O que observar |
|---|---|---|
| [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md) [aberto] | todos | Dot plot em *Distribution*, dot strip e slope em *Ranking*, lollipop em *Ranking* e *Magnitude*, zero central em *Deviation*: o mesmo desenho serve a perguntas diferentes |
| [DataViz Catalogue, Cleveland dot plots](https://datavizcatalogue.com/blog/chart-snapshot-cleveland-dot-plots/) [aberto] | 01 | Vantagens sobre a barra, sem necessidade de começar do zero, e o recorte para número moderado de categorias |
| [DataViz Catalogue, dumbbell plots](https://datavizcatalogue.com/blog/chart-snapshot-dumbbell-plot/) [aberto] | 03 | Nomes alternativos (barbell, connected dot plot) e o uso para mudança entre dois pontos, condições ou grupos |
| [DataViz Catalogue, dot distribution plots](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/) (não abriu) | 02 | Ponto como unidade ou como contagem, e a fronteira com o histograma |
| [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot) [aberto] | 01, 03, 05 | Teto de três pontos por linha e conector automático que indica a diferença quantitativa |
| [Datawrapper Academy, customizing your dot plot](https://www.datawrapper.de/academy/customizing-your-dot-plot) [aberto] | 01, 03 | Destaque da faixa entre pontos, alinhamento do rótulo, agrupar e reordenar linhas, posição das marcações e grade própria |
| [Datawrapper Academy, how to create a range plot](https://www.datawrapper.de/academy/how-to-create-a-range-plot) [aberto] | 04 | Quando a distância importa mais que os valores, e o alerta contra símbolos redundantes |
| [Datawrapper Academy, how to create an arrow plot](https://www.datawrapper.de/academy/how-to-create-an-arrow-plot) [aberto] | 03 | Seta sempre do valor antigo para o novo e a árvore de decisão entre linha, range plot e dot plot |
| [Datawrapper blog, new arrow and range plots](https://www.datawrapper.de/blog/new-arrow-and-range-plots) [aberto] | 03, 04 | Ênfase de mudança contra distância e rótulo de início, fim, variação absoluta ou percentual |
| [Datawrapper Academy, examples of dot and range plots](https://www.datawrapper.de/academy/examples-of-datawrapper-dot-charts) (não abriu) | 01, 04 | Cor por série e rótulo direto nas pontas em peças publicadas |
| [Flourish, (Ar)row row row your plot](https://flourish.studio/blog/make-arrow-plots/) [aberto] | 03 | Arrow plot como connected dot plot com cabeça, e a ordem da planilha decidindo o desenho |
| [From Data to Viz, lollipop chart](https://www.data-to-viz.com/graph/lollipop.html) [aberto] | 03, 05 | Haltere como variante para dois valores; erros de não ordenar, de vários valores por grupo e de erro pendurado no disco |
| [Highcharts, lollipop series](https://www.highcharts.com/docs/chart-and-series-types/lollipop-series) [aberto] | 05 | Centro do ponto é o valor, uso contra o efeito moiré de barras parecidas e conector parametrizado à parte |
| [Highcharts, dumbbell series](https://www.highcharts.com/docs/chart-and-series-types/dumbbell-series) [aberto] | 03 | Marcador e cor separados para cada ponta, e conector com cor e espessura próprias |
| [Highcharts, lower and upper dumbbell markers](https://www.highcharts.com/demo/highcharts/dumbbell-markers) [parcial] | 03 | Forma, e não só cor, separando as duas pontas |
| [ApexCharts, dumbbell chart](https://apexcharts.com/javascript-chart-demos/column-charts/dumbbell-chart/) [aberto] | 03 | Haltere vertical com meses no eixo, em que só a legenda diz qual ponta é qual |
| [AG Charts, range bar series (React)](https://www.ag-grid.com/charts/react/range-bar-series/) [aberto] | 04 | Chaves de ponta baixa e alta, rótulo por ponta e valor nulo abrindo lacuna em vez de zero |
| [Vega-Lite, ranged dot plot](https://vega.github.io/vega-lite-v2/examples/layer_ranged_dot.html) [aberto] | 02, 04 | Faixa como camada de baixo e pontos por cima: a mesma ordem de árvore que o Recharts exige |
| [Recharts, ErrorBar](https://recharts.github.io/en-US/api/ErrorBar/) [aberto] | 02 | `direction`, `width` das serifas e valores como distâncias relativas ao ponto |
| [Recharts, Scatter](https://recharts.github.io/en-US/api/Scatter/) [aberto] | 01 | `shape` como string, elemento ou função, e `line` com `lineType="joint"` |
| [Recharts, Custom Shape Bar Chart](https://recharts.github.io/en-US/examples/CustomShapeBarChart/) [aberto] | 03, 04, 05 | A `shape` recebendo `x`, `y`, `width` e `height` já calculados, contrato de que a barra de faixa depende |
| [Observable Plot, arrow mark](https://observablehq.com/plot/marks/arrow) (não abriu) | 03 | Cor do traço respondendo ao significado da mudança, não à direção geométrica |
| [Observable Plot, dodge transform](https://observablehq.com/plot/transforms/dodge) (não abriu) | 02 | Alternativa determinística ao jitter aleatório para os casos ao fundo |
| [Data Viz Project, lollipop chart](https://datavizproject.com/data-type/lollipop-chart/) (não abriu) | 05 | Lollipop divergente como forma vizinha e ganho quando os valores ficam entre 80% e 90% da escala |
| [Wikipedia, slope chart](https://en.wikipedia.org/wiki/Slope_chart) [aberto] | 06 | Leitura difícil quando muitas retas se cruzam; troca por linha com mais de dois momentos |
| [RAWGraphs, how to make a slope graph](https://rawgraphs.github.io/learning/how-to-make-a-slope-graph/) [parcial] | 06 | Duas colunas numéricas mapeadas nas duas âncoras |

### Praticantes

| Referência | Modelos | O que observar |
|---|---|---|
| [Practical Reporting, a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot) [aberto] | 01, 03, 04 | As cinco causas de confusão medidas em oficina, o pipe e a barra esmaecida, e a ressalva de que tudo ainda é hipótese |
| [Storytelling with Data, dot plot vs slopechart vs bar chart](https://www.storytellingwithdata.com/blog/2017/10/13/novel-vs-the-boring-old-bar-chart) [aberto] | 01, 04, 05 | A plateia escolheu a barra: contraprova antes de adotar o formato por estética |
| [Storytelling with Data, more on slopegraphs](https://www.storytellingwithdata.com/blog/2014/03/more-on-slopegraphs) [aberto] | 06 | Dois usos declarados, destaque por cor para a exceção e a reta que faz sentido sem dado contínuo no meio |
| [Storytelling with Data, a little math on non-zero baselines](https://www.storytellingwithdata.com/blog/2014/02/a-little-math-on-non-zero-baselines) (não abriu) | 01, 05 | A conta de quanto a base não zero distorce comprimento, e por que o ponto escapa disso |
| [3iap, bars vs lollipops (vs dot plots)](https://3iap.com/bar-graphs-vs-lollipop-charts-vs-dot-plots-experiment-PP8-qapwQe2fRBJu1-ADfA/) [aberto] | 01, 05 | Diferença de acerto de cerca de 1% e de tempo de cerca de 1 segundo: escolher pelo cartão, não pela precisão |
| [Nightingale, beyond the bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/) [aberto] | 01, 03, 06 | Cinco alternativas para dois pontos de mudança e slope em pequenos múltiplos quando há muitas categorias |
| [Charlie Park, Edward Tufte's slopegraphs](https://charliepark.org/slopegraphs/) [aberto] | 06 | Histórico do formato, regras de rotulagem, empates e a crítica à escala dupla |
| [Edward Tufte, slopegraphs for comparing gradients](https://www.edwardtufte.com/notebook/slopegraphs-for-comparing-gradients-slopegraph-theory-and-practice/) (não abriu) | 06 | Inclinação como codificação principal, nos exemplos escolhidos pelo autor |
| [Perceptual Edge, dot plots: a useful alternative to bar charts](https://www.perceptualedge.com/articles/b-eye/dot_plots.pdf) [parcial] | 01 | Dot plot sugerido quando a lista passa de doze barras |
| [Nightingale, the dumbbell plot: a how-to guide](https://medium.com/nightingale/the-dumbbell-plot-a-how-to-guide-5dafd1d67581) (não abriu) | 03 | Escolhas de ordenação e de rótulo de ponta |
| [Tableau, when to use a lollipop chart](https://www.tableau.com/blog/viz-whiz-when-use-lollipop-chart-and-how-build-one-64267) (não abriu) | 05 | Redução de tinta e os casos em que a barra continua melhor |
| [Medium, lollipop e dumbbell charts com Plotly](https://medium.com/data-science/lollipop-dumbbell-charts-with-plotly-696039d5f85) (não abriu) | 03, 05 | Construção por camadas de linha e marcador, e quando cada forma serve |
| [FlowingData, how to make dot plots in R](https://flowingdata.com/2015/04/15/how-to-make-dot-plots-in-r/) (não abriu) | 01 | Passo de ordenação e tratamento do rótulo de categoria |

### Portais de design

As quatro primeiras linhas são a seção da família no estudo de portais; as demais vêm dos modelos do estudo da família. Nenhum shot de Dribbble foi conferido visualmente: olhe a peça antes de adotar.

| Referência | Modelos | O que observar |
|---|---|---|
| [Dribbble, Animated Connected Dot Plot, 49 Days of Charts](https://dribbble.com/shots/17791283-Animated-Connected-Dot-Plot-49-Days-of-Charts) (não abriu) | 03 | Dot plot conectado da série de 49 gráficos; ponto de partida para antes e depois por executivo |
| [Dribbble, Dot Plot Graph](https://dribbble.com/shots/3980027-Dot-Plot-Graph) [busca] | 01 | Dot plot simples |
| [Dribbble, Animated Bump Chart, 49 Days of Charts](https://dribbble.com/shots/18335691-Animated-Bump-Chart-49-Days-of-Charts) [busca] | 06 | Mudança de posição entre períodos; o bump em si mora em 04/08 |
| [Dribbble, Dashboard Comparison Chart](https://dribbble.com/shots/2449899-Dashboard-Comparison-Chart) (não abriu) | 01 | Comparação entre coortes escolhidas pelo usuário |
| [Behance, Dark Themed Business Management Dashboard UI](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI) [aberto] | 01, 05 | Hierarquia só por cor de acento sobre fundo escuro: decide se a haste de 2 px e a barra esmaecida sobrevivem no cartão |
| [Visa Product Design System, dumbbell plot](https://design.visa.com/data-visualization/charts/dumbbell-plot/) [parcial] | 02, 03 | Tokens de cor, espessura do conector, rótulo direto e marcação de acessibilidade |
| [Dribbble, Dashboard charts library](https://dribbble.com/shots/14154711-Dashboard-charts-library) (não abriu) | 01, 04 | Rótulo de categoria, espaçamento entre linhas e marcadores de meta em tema claro e escuro |
| [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard) (não abriu) | 03 | Contraste de marcador sobre fundo escuro, o problema de três marcadores juntos |
| [Dribbble, Bar Chart Dashboard Card, tema escuro](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme) (não abriu) | 05 | Contraste de haste fina sobre fundo escuro |
| [Figma Community, Data Visualisation UI Kit, 150 charts](https://www.figma.com/community/file/1212977094398360391/data-visualisation-ui-kit-150-charts-36-chart-types-10-color-palettes) (não abriu) | 01 | Variações de marcador organizadas como componentes |
| [Figma Community, Data Visualization Graphs / Charts Kit](https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit) (não abriu) | 01 | Repetição de eixo numa grade de pequenos múltiplos |
| [Figma Community, Advanced Data Visualization](https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization) (não abriu) | 02, 03 | Variantes de marcador e preenchimento, opacidade e camadas |
| [Figma Community, Charts Components For Free](https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available) (não abriu) | 03, 05 | Lollipop e dumbbell entre os tipos, com as duas pontas como variantes do mesmo componente |
| [Figma Community, Charts & Graphs UI Kit](https://www.figma.com/community/file/1314538669933482880/charts-graphs-ui-kit) (não abriu) | 04 | Espessura e raio de canto das barras, a decisão central do range plot |
| [Figma Community, Charts Components Kit, gratuito](https://www.figma.com/community/file/1117140803316010537/charts-components-kit-free) (não abriu) | 05 | Folgas entre séries e entre categorias no lollipop agrupado |
| [Figma Community, r19 Data Visualization Kit](https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit) (não abriu) | 06 | Tratamento tipográfico dos rótulos de ponta |
| [Figma Community, Data Visualization Chart Set 1](https://www.figma.com/community/file/1272086414322879429/data-visualization-chart-set-1) (não abriu) | 06 | Peças pequenas em grade e tamanho mínimo de tipografia |
| [Dribbble, busca comparison-chart](https://dribbble.com/search/comparison-chart) (não abriu) | 01 | Quantas peças resolvem acima e abaixo só com cor, e por que isso falha no escuro |
| [Dribbble, busca dashboard-chart](https://dribbble.com/search/dashboard-chart) (não abriu) | 03 | Indicador de direção reduzido a seta minúscula ao lado do número |
| [Behance, busca charts dashboard](https://www.behance.net/search/projects/charts%20dashboard) (não abriu) | 05 | Coluna de rótulos em gráficos divergentes |
| [Behance, busca data dashboard](https://www.behance.net/search/projects/data%20dashboard?locale=en_US) (não abriu) | 04 | Eixos com muitos rótulos em peças de dashboard |

Lacunas registradas nos estudos: nenhuma peça de portal mostra dumbbell, arrow, lollipop ou slope em tema escuro com link específico aberto, então a decisão visual depende do protótipo; as fichas do Data Viz Project responderam 403 e a página de slopegraph de Tufte ficou bloqueada, com o conteúdo chegando por Charlie Park e pela Wikipedia; a marca direcional do 01 se apoia numa proposta que o autor declara não testada e entra como hipótese a validar com o time.
