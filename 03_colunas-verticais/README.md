# Colunas verticais

Colunas comparam magnitudes em períodos discretos (semana, mês, trimestre) e em categorias curtas: o tempo corre da esquerda para a direita e a altura codifica o valor, sempre a partir do zero. É a família mais usada do Farol para volume por período e a base de quase tudo o que o Farol mostra por mês: receita reconhecida, leads, entradas na pré-vendas, custo e capacidade. Quando o que importa é a tendência contínua e não o volume de cada período, a família certa é linhas (04); quando a categoria tem nome longo, barras horizontais (02).

Estudo de origem: [`_estudo/familias/03_colunas-verticais.md`](../_estudo/familias/03_colunas-verticais.md). Catálogo desta família: [`_estudo/catalogo/03_colunas-verticais.json`](../_estudo/catalogo/03_colunas-verticais.json). Varredura de portais: seção 03 de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). Presets de canvas e formato do `meta.json`: [CONTRATO](../CONTRATO.md), seção 4.

## O que a família responde

Perguntas típicas no Farol, com dado fictício:

- **Comercial:** a receita reconhecida bateu a meta em cada mês? Quanto do ano já foi realizado e quanto é projeção? Quanto foi fechado contra o forecast declarado? Qual o ritmo de fechamento de cada executivo na mesma escala?
- **Pré-vendas:** qual a cadência semanal de entradas? Quanto a entrada passou do teto de capacidade? O que entrou, saiu e sobrou no funil a cada semana? Quantas agendas marcadas viraram reunião?
- **Marketing:** quanto entrou de lead em cada mês e de que origem? Como mudou o mix de origem? O CPL qualificado ficou acima da média do semestre? O degrau de volume coincide com a campanha no ar?
- **Diretoria:** quanto custou cada mês nas três camadas? Em que meses de 2027 a demanda projetada passa da capacidade? Qual foi o saldo de clientes? O executado bateu com o orçado?

## Regras que valem para a família inteira

1. **Zero sempre.** A altura é o dado. Se o eixo precisa começar acima de zero, a forma certa é ponto ou linha (17, 04). A coluna de faixa, que não nasce do zero, mora em 17/04.
2. **Período em ordem cronológica**, nunca ordenado por valor. Ordenar por valor só em categorias não temporais com poucos itens.
3. **O eixo de períodos é ordinal:** mês faltante some sem deixar buraco. Preencher a série em TypeScript antes do render, com `null` onde não houve coleta.
4. **Rótulo com parcimônia.** Em série longa, rotular só máximo, mínimo, último e o período em foco; em série curta, `LabelList` no topo.
5. **Período incompleto é marcado** como parcial ou com projeção de método declarado; mês corrente parcial parece queda.
6. **Cor pela polaridade da métrica**, não pelo sinal: CPL que cai é bom. Destaque único em `--chart-1`, contexto em neutro.
7. **Ausência nunca vira zero.** Sem dado, a coluna não existe e aparece `formatUnavailable()`; zero medido é desenhado e escrito 0.
8. **`Cell` está deprecado** no Recharts 3.10: cor por coluna via `shape`. Hachura por `<pattern>` em `<defs>`, com id de `useId` e traço claro espaçado no tema escuro.
9. **Largura travada.** Com poucas colunas o Recharts engorda cada uma até virar bloco: `maxBarSize` sempre definido.
10. **Formatação num lugar só:** `formatCurrencyCompact` no rótulo, `formatCurrencyAxis` no tique, `formatRateWithVolume` na taxa e sinal de menos tipográfico na variação.

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | O que responde |
|---|---|---|---|---|---|
| 01 | Colunas simples | [./01_colunas-simples/](./01_colunas-simples/) | Recharts nativo | 4 | Quanto foi cada período; absorve o eixo de tempo em dois níveis e a anotação de evento. |
| 02 | Colunas agrupadas | [./02_colunas-agrupadas/](./02_colunas-agrupadas/) | Recharts nativo | 4 | Como duas ou três séries da mesma grandeza se comparam em cada período. |
| 03 | Colunas empilhadas com total | [./03_colunas-empilhadas/](./03_colunas-empilhadas/) | Recharts nativo | 4 | Quanto foi o período e de que ele é feito; absorve as colunas agrupadas e empilhadas (orçado e realizado). |
| 04 | Colunas empilhadas 100% | [./04_colunas-empilhadas-100/](./04_colunas-empilhadas-100/) | Recharts nativo | 4 | Como mudou o mix de cada período, com o n à vista. |
| 05 | Colunas positivo e negativo | [./05_colunas-positivo-e-negativo/](./05_colunas-positivo-e-negativo/) | Recharts custom | 4 | O saldo ou o desvio foi para cima ou para baixo; absorve a pilha por sinal com o líquido marcado. |
| 06 | Colunas contra meta ou limiar | [./06_colunas-contra-meta-ou-limiar/](./06_colunas-contra-meta-ou-limiar/) | Recharts nativo | 4 | Quanto contra a meta, a média, o teto ou o forecast; absorve linha de meta, excedente, colunas sobrepostas e coluna fantasma. |
| 07 | Realizado e projeção hachurada | [./07_realizado-e-projecao/](./07_realizado-e-projecao/) | Recharts custom | 4 | O que já aconteceu e o que ainda é previsão; absorve o destaque do período atual e o trio realizado, previsto e meta. |
| 08 | Colunas em small multiples | [./08_colunas-em-small-multiples/](./08_colunas-em-small-multiples/) | HTML com Tailwind | 4 | Qual a forma de cada uma de muitas séries, na mesma escala. |

São 8 modelos e 32 versões. As pastas dos modelos são criadas quando as versões forem produzidas; até lá os links apontam para o lugar reservado.

### Versões por modelo

Cada modelo cobre o básico, um caso com destaque ou anotação, um caso denso do Farol e um caso limite. Canvas pelos presets do [CONTRATO](../CONTRATO.md).

| Modelo | Versões (canvas) |
|---|---|
| 01 | v1 leads por mês nos últimos 12 meses (card) · v2 leads por semana com a campanha marcada (card) · v3 entradas semanais da pré-vendas em 26 semanas (largo) · v4 entradas semanais com semana sem coleta (card) |
| 02 | v1 agendas marcadas e realizadas por mês (card) · v2 receita reconhecida: 2026 contra 2025 (largo) · v3 leads por plataforma de mídia paga (largo) · v4 leads por plataforma com estreia em maio (card) |
| 03 | v1 leads por mês em três origens (card) · v2 custo mensal em três camadas (largo) · v3 leads por origem com cauda longa (largo) · v4 orçado e realizado por trimestre (card) |
| 04 | v1 mix de origem dos leads por mês (card) · v2 participação da origem paga no mix (card) · v3 perdas por motivo em 8 trimestres (largo) · v4 mix de perdas com amostra pequena (card) |
| 05 | v1 saldo mensal de clientes (card) · v2 CPL qualificado contra a média do semestre (card) · v3 movimento semanal do funil de pré-vendas (largo) · v4 saldo com zero medido e mês sem dado (card) |
| 06 | v1 receita reconhecida contra a meta mensal (card) · v2 entradas mensais contra o teto de capacidade (card) · v3 fechamentos contra o forecast do mês (card) · v4 demanda projetada contra capacidade em 2027 (largo) |
| 07 | v1 receita do ano: realizado e projeção (card) · v2 leads por mês com o mês corrente parcial (card) · v3 receita reconhecida: realizado, previsto e meta (largo) · v4 realizado acima do forecast e mês sem meta (card) |
| 08 | v1 leads por mês em seis origens (largo) · v2 seis origens com uma em foco (largo) · v3 fechamentos por mês de 12 executivos (alto) · v4 painéis com histórico curto e sem volume (largo) |

## Qual modelo escolher

| Se a pergunta é... | Use | E não |
|---|---|---|
| Uma medida por período, sem referência | 01 Colunas simples, v1 | 04 Linhas, a menos que a tendência importe mais que o volume |
| Um evento explica um degrau na série | 01, v2 com a campanha marcada | Legenda distante contando o evento |
| Série longa com hierarquia de tempo | 01, v3 com o eixo em dois níveis | Rótulo do mês repetido em toda coluna |
| Período sem coleta no meio da série | 01, v4 com a marca de ausência | Coluna zerada no lugar do dado faltante |
| Duas ou três séries da mesma grandeza | 02 Colunas agrupadas | 08 Small multiples, que só compensa a partir de 4 séries |
| Ano corrente contra ano anterior | 02, v2 com o ano anterior em neutro | Duas cores categóricas, que leem como coisas diferentes |
| Total do período e sua composição | 03 Empilhadas com total | 04 Empilhadas 100%, que esconde o tamanho |
| Plano contra executado, com componentes | 03, v4 orçado e realizado | Três gráficos separados |
| Só o mix, com volume diferente entre períodos | 04 Empilhadas 100%, com o n escrito | 03, em que o mix dos períodos pequenos some |
| Saldo, variação ou desvio com sinal | 05 Positivo e negativo | 01 com cor por sinal numa métrica de custo |
| Entradas e saídas com o líquido | 05, v3 pilha por sinal | 03, que não tem lado negativo |
| Meta ou média como referência fixa | 06, v1 com linha de meta | Coluna inteira pintada de vermelho |
| Quanto passou do teto | 06, v2 com excedente | Só a linha, que obriga a subtrair de cabeça |
| Realizado contra forecast por período | 06, v3 coluna fantasma | 02 Agrupadas, que não diz quem é referência |
| Capacidade que sobe em degraus | 06, v4 com a linha em escada | Média única que apaga a contratação |
| Ano com meses fechados e projetados | 07 Realizado e projeção | 01 com a projeção em sólido |
| Mês corrente ainda em curso | 07, v2 mês corrente parcial | 01 sem marca de parcial |
| Realizado, previsto e meta no mesmo mês | 07, v3 | Previsto somado ao realizado sem aviso |
| Muitas séries, forma de cada uma | 08 Small multiples, escala comum | 02 com seis colunas por período |

## Quando a família serve

* A medida é um volume ou um valor por período discreto e cada período conta como unidade de decisão.
* O leitor precisa comparar tamanhos, não só enxergar a direção da série.
* Há até cerca de 30 períodos visíveis, ou até 12 quando cada período tem mais de uma coluna ou pilha.
* O rótulo da categoria é curto: `jan/26`, `S12`, `3T26`, uma plataforma, uma origem.

## Quando procurar outra família

* **Rótulo longo de categoria** (motivo de perda, nome de campanha): barras horizontais, família **02**.
* **Tendência contínua com muitos períodos**, sem interesse no volume de cada um: linhas, família **04**; com ênfase no acumulado, áreas, família **05**.
* **Volume e taxa no mesmo gráfico**, incluindo o Pareto: combinados, família **08**.
* **Uma medida só contra a meta, num card**: progresso e meta, família **13**. A coluna com meta repetida por período fica aqui, no modelo 06.
* **Distribuição de uma variável contínua**, com colunas que se tocam: histograma, família **16**.
* **Intervalo de piso a teto por período**, como cenários com saída em faixa: range plot, família **17**.
* **Decomposição de uma variação em contribuições**, passo a passo: cascata, família **19**, e não colunas empilhadas.
* **Contagem em unidades discretas** (10 agendas, 10 quadradinhos): waffle, família **22**.
* **Coluna minúscula dentro de célula ou card**, sem eixo: sparkbar, família **24**.
* **Largura da coluna também codificando um valor** (volume por segmento e participação): mosaico, família **26**.

## Referências cruzadas

Formatos que o estudo desta família levantou e que moram em outro lugar do catálogo:

| Formato | Destino | Por quê |
|---|---|---|
| Colunas com painel de variação (estudo 3.13) | [08/06 Real contra referência com painel de variação](../08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/) | São dois gráficos alinhados por `syncId` com margem idêntica, que é o terreno dos combinados. |
| Colunas de faixa (estudo 3.14) | [17/04 Range plot](../17_comparacao-de-pontos/04_range-plot/) | A altura é amplitude e não magnitude, então o eixo pode não conter o zero e a regra da família não vale. |
| Coluna com linha e Pareto | [08/01 Coluna com linha](../08_combinados-e-eixo-duplo/01_coluna-com-linha/) e [08/04 Pareto](../08_combinados-e-eixo-duplo/04_pareto/) | Volume e taxa no mesmo gráfico, com a linha acumulada do Pareto, pedem as regras de eixo dos combinados. |
| Histograma | [16/01 Histograma](../16_distribuicao/01_histograma/) | O desenho parece coluna, mas o eixo é contínuo e as colunas se tocam. |
| Coluna em célula | [24/02 Sparkbar](../24_microvisuais-sparklines/02_sparkbar/) | Coluna minúscula sem eixo, dentro de célula de tabela ou de card. |

Variações de outras famílias absorvidas aqui: a coluna fantasma (08#6) virou a v3 do modelo 06; as colunas com limiar e excedente (08#11) viraram as v2 e v4 do modelo 06; realizado, previsto e meta (08#10) virou a v3 do modelo 07.

## Referências

Juntam as fontes do [estudo da família](../_estudo/familias/03_colunas-verticais.md) e da seção 03 da [varredura de portais de design](../_estudo/00_portais-de-design.md). A marca entre parênteses repete a do estudo: **aberto** é página lida; **busca** é resultado de busca não aberto, que vale pelo título e pelo trecho; **não abriu** é página que falhou ao abrir; **listagem** é página de tag ou de busca de portal. Bibliotecas fora da stack (Vega Lite, Highcharts, ECharts, Observable Plot, Tremor) valem só como referência de desenho.

### Catálogos

* [Datawrapper Academy, por que colunas começam em zero](https://www.datawrapper.de/academy/why-our-column-and-bar-charts-start-at-zero) (aberto). Observar as três saídas quando o zero achata a leitura: dot plot, linha ou recalcular a medida como diferença (regra 1, modelos 01 e 05).
* [Datawrapper Academy, o que considerar em colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts) (aberto). Observar "traga o valor mais importante para a base", o agrupamento dos menores em Outros, a segunda base de comparação do 100% e a indicação de small multiples quando as partes são o objetivo (modelos 03, 04 e 08).
* [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/) (aberto). Observar a progressive bar, que desloca segmentos em vez de trocar a cor, e a change bar com seta de direção (modelos 05 e 06, e 08/06).
* [Vega Lite, Stack](https://vega.github.io/vega-lite/docs/stack.html) (aberto). Observar os offsets `zero`, `normalize`, `center` e `null`, que correspondem aos modelos 03, 04, ao streamgraph (05) e à sobreposição do modelo 06, e o tratamento de valores negativos na pilha (modelo 05).
* [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) (aberto). Observar a família Deviation, com referência em zero, meta ou média, e o painel repetido como recurso que atravessa famílias (modelos 05, 06 e 08).
* [Data Viz Catalogue, Bar Chart](https://datavizcatalogue.com/methods/bar_chart.html), [Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html) e [Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html) (busca). Observar a coluna como variante vertical da barra e o alerta de perda de legibilidade conforme crescem as colunas por grupo e os segmentos (modelos 01, 02 e 03).
* [Datawrapper Academy, criar colunas agrupadas](https://academy.datawrapper.de/article/21-how-to-create-a-grouped-column-chart) e [customizar](https://academy.datawrapper.de/article/45-customizing-your-grouped-column-chart) (busca). Observar agrupadas quando a comparação entre partes importa mais que o total (modelo 02).
* [Datawrapper Academy, categoria de colunas](https://academy.datawrapper.de/category/75-column-charts) (busca). Observar linha de referência e anotação tratadas como recurso de primeira classe (modelos 01 v2 e 06).
* [Datawrapper Academy, dados irregulares](https://www.datawrapper.de/academy/patchy-data) e [Datawrapper Blog, escalas de tempo diferentes num gráfico](https://www.datawrapper.de/blog/different-time-scales-in-one-chart) (busca). Observar período incompleto e intervalo desigual como decisão de desenho (modelos 01 v3 e v4, 07 v2).
* [Observable Plot, bar mark](https://observablehq.com/plot/marks/bar) (não abriu) e [Interval transform](https://observablehq.com/plot/transforms/interval) (busca). Observar a opção `interval`, que força a cadência e revela o período ausente em vez de escondê-lo (modelo 01 v4).
* [Observable, temporal bar chart](https://observablehq.com/@observablehq/plot-temporal-bar-chart) e [time series grouped bars](https://observablehq.com/@observablehq/plot-time-series-grouped-bars) (busca). Observar coluna em eixo de tempo real e agrupamento declarativo no lugar do ajuste manual de `barGap` (modelos 01 v3 e 02).
* [Vega Lite, Normalized Stacked Bar](https://vega.github.io/vega-lite/examples/stacked_bar_normalize.html) e a [versão com rótulos](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html) (busca). Observar `stack: "normalize"` e o rótulo centrado no segmento (modelo 04).
* [Vega Lite, Layered Bar Chart](https://vega.github.io/vega-lite-v2/examples/bar_layered_transparent.html) e [Bar Chart with Label Overlays](https://vega.github.io/vega-lite/examples/layer_bar_labels_grey.html) (busca). Observar `stack: null` com opacidade para sobrepor e a camada de texto sobre o gráfico (modelos 06 v3 e 01 v2).
* [Highcharts, Stacked Percentage Column](https://www.highcharts.com/demo/highcharts/column-stacked-percent), [Stacked Column](https://www.highcharts.com/demo/column-stacked), [Overlapping Placement Column](https://www.highcharts.com/demo/column-placement) e [Column Range](https://www.highcharts.com/demo/highcharts/columnrange) (busca). Observar valor absoluto e percentual juntos na dica, pilhas agrupadas, `pointPadding` como o `barGap` negativo e a coluna que não nasce do zero (modelos 04, 03 v4, 06 v3 e 06 v2).
* [Apache ECharts, aria e decal](https://echarts.apache.org/handbook/en/best-practices/aria/) e [Style](https://echarts.apache.org/handbook/en/concepts/style/) (busca). Observar a textura como segundo canal além da cor, equivalente conceitual ao `<pattern>` do SVG (modelo 07).

### Praticantes

* [Storytelling with Data, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty) (aberto). Observar marcador vazado e traço pontilhado para o futuro, faixa em torno da estimativa central e a orientação de não passar ao leitor o trabalho de descontar a incerteza (modelo 07).
* [Few, Quantitative Displays for Combining Time Series and Part to Whole Relationships, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf) (não abriu como texto). Observar, num leitor de PDF, as alternativas à pilha quando tempo e parte do todo aparecem juntos, entre elas os painéis repetidos (modelos 03 e 08).
* [Few, Graph Selection Matrix, em PDF](https://www.perceptualedge.com/articles/misc/Graph_Selection_Matrix.pdf) (busca). Observar onde série temporal, desvio, previsão e amplitude se separam na matriz (modelos 06 e 07).
* [FlowingData, Bar Chart Baselines Start at Zero](https://flowingdata.com/2015/08/31/bar-chart-baselines-start-at-zero/) e [Real Chart Rules to Follow](https://flowingdata.com/2015/08/11/real-chart-rules-to-follow/) (busca). Observar o comprimento como codificação do valor e a separação entre regra que protege a leitura e gosto pessoal, útil para justificar a marca de parcial (modelos 01 e 07 v2).
* [FlowingData, 7 Basic Rules for Making Charts and Graphs](https://flowingdata.com/2010/07/22/7-basic-rules-for-making-charts-and-graphs/) (busca). Observar a regra de dar contexto ao número e explicar o dado incomum (modelos 06 e 01 v2).
* [Nightingale, Tear Up Your Baseline](https://nightingaledvs.com/tear-up-your-baseline/) (busca). Observar a linha de zero como condição de honestidade e âncora de leitura (modelos 02 e 05).
* [Nightingale, Visualizing Likert Scale Data](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/) (busca). Observar a base comum separando positivo de negativo e as sete alternativas sobre o mesmo dado (modelo 05 v3).
* [Nightingale, Charles Apple on Making Effective Charts](https://nightingaledvs.com/charles-apple-on-making-effective-charts/) (busca). Observar a defesa de explicar o pico dentro do gráfico, e não na legenda distante (modelo 01 v2).
* [Storytelling with Data, sobre 100% empilhado](https://www.storytellingwithdata.com/blog/2016/1/12/is-there-a-single-right-answer) (busca). Observar que a escolha entre absoluto e 100% depende da pergunta (modelos 03 e 04).
* [Microsoft Learn, configurar colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts) (busca). Observar a notação: sólido para realizado, contorno para plano, hachura para previsão e variação favorável ou desfavorável só no trecho da diferença (modelos 03 v4, 06 e 07).
* [Inforiver, variance analysis](https://inforiver.com/blog/inforiver-analytics-plus/variance-analysis-powerbi-inforiver-analytics-plus/) e [dataviz.boutique, Ultimate Variance Chart](https://dataviz.boutique/2017/08/15/power-bi-ultimate-variance-chart-faq-ibcs-r/) (busca). Observar o desvio como elemento próprio, sem recolorir o total, e a largura relativa das colunas quando o realizado passa do plano (modelo 06 v2 e v3).
* [HealthDataViz, Raising the Bar on Stacked Bar Charts](https://healthdataviz.com/2016/04/15/raising-bar-stacked-bar-charts/) e [Better Evaluation, stacked graph](https://www.betterevaluation.org/methods-approaches/methods/stacked-graph) (busca). Observar a crítica ao excesso de segmentos e quando a pilha ajuda ou atrapalha (modelos 03 v3 e 05 v3).
* [The Arrangement of Marks Impacts Afforded Messages, arXiv](https://arxiv.org/pdf/2308.13321) e [Anchoring and Alignment: Data Factors in Part to Whole Visualization, arXiv](https://arxiv.org/pdf/2508.01881) (busca). Observar a evidência de que ordenação, partição e cor mudam a mensagem e de que a ancoragem na base afeta a leitura das partes (modelos 04 e 05).
* [Observable, the powerful simplicity of bar charts and histograms](https://observablehq.com/blog/simplicity-bar-charts) (busca). Observar a forma simples repetida no lugar do gráfico único sobrecarregado (modelo 08).

### Implementação

* [Recharts, galeria de exemplos](https://recharts.github.io/en-US/examples/) (aberto). Observar o inventário dos exemplos de barra e coluna, de onde saem os slugs abaixo.
* [Recharts, API do Bar](https://recharts.github.io/en-US/api/Bar/) (aberto). Observar `stackId`, `shape` como elemento ou função (troca de `fill` por `url(#hachura)` por linha), `minPointSize` com padrão 0 e `maxBarSize` (modelos 03, 05, 06 v4 e 07).
* [Recharts, API do BarChart](https://recharts.github.io/en-US/api/BarChart/) (busca). Observar `barGap` e `barCategoryGap`, que aceitam valor negativo e percentual, e `syncId` para cursor comum entre painéis (modelos 02, 06 v3 e 08).
* [Recharts, Simple Bar Chart](https://recharts.github.io/en-US/examples/SimpleBarChart/), [Tiny Bar Chart](https://recharts.github.io/en-US/examples/TinyBarChart/) e [Brush Bar Chart](https://recharts.github.io/en-US/examples/BrushBarChart/) (busca). Observar o esqueleto mínimo, a versão sem eixos que leva à família 24 e a janela navegável que obriga a recalcular anotações (modelo 01).
* [Recharts, Bar Chart With Multi X Axis](https://recharts.github.io/en-US/examples/BarChartWithMultiXAxis/) (busca). Observar o segundo `XAxis` com `xAxisId` e o `tickFormatter` que decide onde escrever o rótulo do grupo (modelos 01 v3 e 03 v4).
* [Recharts, Stacked Bar Chart](https://recharts.github.io/en-US/examples/StackedBarChart/) (busca). Observar o `stackId` compartilhado e o `radius` só na ponta da pilha (modelos 03 e 04).
* [Recharts, Positive And Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/) e [Bar Chart Stacked By Sign](https://recharts.github.io/en-US/examples/BarChartStackedBySign/) (busca). Observar a `ReferenceLine` em zero e o empilhamento por sinal nativo com `stackId` compartilhado (modelo 05).
* [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/) (busca). Observar `Bar` e `Line` no mesmo gráfico, base da meta em degraus e do marcador de líquido (modelos 05 v3 e 06 v4).
* [Recharts, Bar Chart With Customized Event](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/) (busca). Observar o `shape` decidindo a aparência por item, com o estado morando no componente pai (modelo 07 v2 e 08 v2).
* [shadcn/ui, diretório de charts](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts) (aberto). Observar `chart-bar-default`, `chart-bar-multiple`, `chart-bar-stacked`, `chart-bar-negative`, `chart-bar-active` e `chart-bar-interactive`: grade só horizontal, eixo sem linha e `radius` (modelos 01, 02, 03, 05 e 07).
* [shadcn.io, Grouped Bar Chart](https://www.shadcn.io/charts/bar-chart/bar-chart-04) (busca). Observar dois `Bar` irmãos com o mesmo `radius` e a legenda gerada do `chartConfig` (modelo 02).
* [Tremor, BarChart](https://www.tremor.so/docs/visualizations/bar-chart) (aberto). Observar os `type` `default`, `stacked` e `percent`, o `valueFormatter` que rotula em percentual sem mexer no dado e o `onValueChange` que faz da coluna um filtro (modelos 02, 03 e 04).

### Portais de design

A qualidade visual das peças abaixo não foi conferida: Dribbble, Behance e Figma Community carregam por script ou pedem sessão. Olhe a peça antes de adotar. No Farol, o desenho sai de Recharts `BarChart` com `stackId`, `shape` e `pattern`, nunca de imagem de kit.

* [Dribbble, Bar Chart Dashboard Card (Dark Theme)](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme) (não abriu). Observar a coluna dentro de um card de operação em tema escuro e a economia de grade, referência direta para o card de colunas (modelo 01).
* [Dribbble, Stacked Bar Chart](https://dribbble.com/shots/2121707-Stacked-Bar-Chart) (não abriu). Observar a separação entre segmentos da pilha (modelo 03).
* [Dribbble, Animated Stacked Bar Chart](https://dribbble.com/shots/17791435-Animated-Stacked-Bar-Chart-49-Days-of-Charts) (não abriu). Observar a série de gráficos animados como catálogo de entrada, lembrando que no render a animação fica desligada (modelos 03 e 08).
* [Dribbble, Bar Chart](https://dribbble.com/shots/4118414-Bar-Chart) (não abriu). Observar a coluna simples e conferir se há linha sobreposta, caso em que a peça pertence à família 08 (modelo 01).
* [Dribbble, Charts UI design Figma templates](https://dribbble.com/shots/20359409-Charts-UI-design-Figma-templates-Bars-histograms-line-graphs) (não abriu). Observar a diferença de desenho entre coluna e histograma na mesma biblioteca (modelo 01 e família 16).
* [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard) (busca). Observar a linha tracejada sobre fundo escuro, que pede opacidade maior que no tema claro (modelo 06 v1).
* [Dribbble, Dark Chart Templates](https://dribbble.com/shots/18056356-Dark-Chart-Templates-Figma-dashboard) (busca). Observar o contraste entre coluna de referência e coluna sólida em fundo escuro (modelo 06 v3).
* [Dribbble, Data Visualization Dashboard (Dark Mode)](https://dribbble.com/shots/21763513-Data-Visualization-Dashboard-Dark-Mode) (busca). Observar a hierarquia entre coluna neutra e coluna em foco (modelos 07 v2 e 08 v2).
* [Dribbble, tag column chart](https://dribbble.com/tags/column_chart) e [tag chart dashboard](https://dribbble.com/tags/chart-dashboard) (listagem). Observar a linha de zero, o rótulo abaixo da coluna negativa e a marcação de evento em card compacto (modelos 05 e 01 v2).
* [Behance, Data Visualization Dashboard UI Kit](https://www.behance.net/gallery/81085955/Data-Visualization-Dashboard-UI-Kit) (busca). Observar o mesmo componente empilhado nos modos claro e escuro (modelo 03).
* [Behance, Dashboard UI Data Visualization Showcase](https://www.behance.net/gallery/72032023/Dashboard-UI-Data-Visualization-Showcase) (busca). Observar a legenda de cor separada da legenda de posição (modelo 03 v4).
* [Behance, Data Visualization Dashboard design](https://www.behance.net/gallery/38344587/Data-Visualization-Dashboard-design) (busca). Observar painel principal com faixa de apoio abaixo, que é a composição de 08/06.
* [Behance, busca de dark mode dashboard](https://www.behance.net/search/projects/dark%20mode%20dashboard?locale=en_US) e [busca de charts dashboard](https://www.behance.net/search/projects/charts%20dashboard) (listagem). Observar alerta em painel escuro e eixo hierárquico em painel denso (modelos 06 v2 e 01 v3).
* [Figma Community, Chart UI Kit v2.0](https://www.figma.com/community/file/1328496497617715352/chart-ui-kit-v2-0) e [Data Visualization Graphs and Charts Kit](https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit) (aberto na varredura de portais). Observar as variantes claro e escuro e as versões compactas do mesmo gráfico que a grade exige; os comentários do segundo kit reclamam de gráficos em imagem (modelo 08).
* [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit) e [Charts and Graphs UI Kit](https://www.figma.com/community/file/1314538669933482880/charts-graphs-ui-kit) (busca). Observar as variantes de grupo, a versão escura e o posicionamento do rótulo em segmento minúsculo (modelos 02 e 04).
* [Figma Community, Advanced Data Visualization](https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization) (busca). Observar pilhas com valores nos dois sentidos (modelo 05 v3).
* [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1629909588466522134/dashboard-charts-ui-kit) (busca). Observar real, previsto e comparativo tratados como estados do mesmo componente (modelo 07).
