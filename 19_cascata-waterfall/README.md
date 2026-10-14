# Cascata (waterfall)

A cascata mostra como um valor inicial vira um valor final passando por acréscimos e decréscimos em sequência. As colunas de início, fim e subtotal partem do eixo; as intermediárias flutuam, cada uma começando onde a anterior terminou. É a forma de parte do todo que aceita componentes negativos, conhecida também como ponte (bridge). Todos os casos desta família usam dado fictício do Farol.

Estudo de origem: [`_estudo/familias/19_cascata-waterfall.md`](../_estudo/familias/19_cascata-waterfall.md). Catálogo das versões: [`_estudo/catalogo/19_cascata-waterfall.json`](../_estudo/catalogo/19_cascata-waterfall.json).

## O que a família responde

Toda cascata responde a uma de três perguntas, e o modelo escolhido diz qual:

1. **Ponte:** como o valor de um momento virou o valor de outro (dois estoques e os movimentos entre eles).
2. **Decomposição:** de que é feito um total, ou o que o consome até zero ou até o gap da meta (um estoque só).
3. **Saldo no tempo:** como um estoque evoluiu período a período (cada passo é um período).

Perguntas típicas no Farol:

* **Comercial:** por que a receita reconhecida saiu de R$ 1,72 mi para R$ 1,89 mi no trimestre; o que mudou no forecast desde a semana passada (novas, avanços, perdas, datas que deslizaram); de que motivos são feitas as perdas na proposta.
* **Pré-vendas:** como a fila evoluiu na semana e em que dia passou do teto; das entradas do mês, onde cada uma saiu até restarem os ganhos.
* **Marketing:** por que o CPL subiu de um mês para o outro, por efeito de volume, custo e mix de plataforma; como a verba de mídia do semestre ficou negativa.
* **Diretoria:** de que é feito o custo em três camadas; quanto falta até a meta contando o pipeline ponderado; qual a faixa de receita ou de capacidade no próximo período e de qual passo nasce a incerteza.

## Modelos

| Nº | Modelo | Responde | Abordagem | Versões |
|---|---|---|---|---|
| 01 | [Cascata de ponte](./01_cascata-de-ponte/) | Como um valor virou outro, com subtotais, deitada, por efeito ou em célula | `recharts-custom` | 4 |
| 02 | [Cascata de decomposição](./02_cascata-de-decomposicao/) | De que é feito um total ou o que falta até a meta | `recharts-custom` | 4 |
| 03 | [Cascata temporal de saldo](./03_cascata-temporal-de-saldo/) | Como um saldo evoluiu período a período | `recharts-custom` | 4 |
| 04 | [Cascata de previsão](./04_cascata-de-previsao/) | Quanto é realizado e quanto é projetado até o fim do período | `recharts-custom` | 4 |
| 05 | [Cascata com faixa de cenário](./05_cascata-com-faixa-de-cenario/) | Qual a faixa do resultado e em qual passo nasce a incerteza | `recharts-custom` | 4 |
| 06 | [Cascata pareada e em pequenos múltiplos](./06_cascata-comparativa/) | Como a mesma ponte difere entre períodos, planos ou segmentos | `svg-puro` | 4 |
| 07 | [Cascata empilhada](./07_cascata-empilhada/) | Quem contribuiu com o quê dentro de cada passo | `svg-puro` | 4 |
| 08 | [Cascata aninhada](./08_cascata-aninhada/) | De que é feito um passo, abrindo numa ponte própria | `recharts-custom` | 4 |

Variações absorvidas do estudo:

* **01** absorve a cascata com subtotais (19.2), a horizontal (19.3), a de variação por componente (19.4) e a cascata micro de célula de tabela (24.36).
* **06** absorve a cascata em pequenos múltiplos (19.9) e a pareada (19.11).

Todas as versões seguem o mesmo arco: básica; com destaque ou anotação; caso denso do Farol; caso limite (passo zero, saldo negativo, resíduo não explicado, parte sem medição, filho que não fecha o pai).

## Guia rápido: qual modelo escolher

| Se a pergunta é | Use | Versão de partida |
|---|---|---|
| Por que o valor saiu de X para Y entre dois períodos? | 01, ponte | `v1_ponte-da-receita-do-trimestre` |
| O mesmo, com blocos que têm parcial própria e nomes longos | 01, ponte deitada com subtotais | `v2_custo-em-tres-camadas-deitado-com-subtotais` |
| Quanto da diferença cada efeito explica, e quanto fica sem explicação? | 01, variação por componente | `v3_cpl-por-efeito-com-residual-nao-explicado` |
| A mesma ponte em cada linha de uma tabela | 01, cascata micro | `v4_cascata-micro-da-carteira-por-executivo` |
| De que é feito o total, com alguma parte negativa? | 02, decomposição | `v1_custo-marginal-liquido-do-mes` |
| Quanto falta até a meta, contando o que já está contratado? | 02, ponte até a meta | `v2_ponte-ate-a-meta-anual` |
| Para onde foi cada entrada do mês até restarem os ganhos? | 02, decomposição em contagem | `v3_entradas-do-mes-ate-os-ganhos` |
| Como a fila ou o saldo evoluiu dia a dia ou mês a mês? | 03, saldo temporal | `v1_fila-de-pre-vendas-na-semana` |
| Em que período o saldo passou do teto ou ficou negativo? | 03, saldo temporal | `v2_dia-em-que-a-fila-passou-do-teto` |
| Quanto do fechamento é realizado e quanto é projeção? | 04, previsão | `v1_fechamento-do-trimestre` |
| O que mudou no forecast desde a última leitura? | 04, previsão | `v3_forecast-semanal-da-carteira` |
| Qual a faixa do resultado e qual passo, se medido, a estreita? | 05, faixa de cenário | `v2_onde-a-faixa-nasce` |
| A capacidade futura cobre a demanda projetada? | 05, faixa de cenário | `v3_capacidade-contra-demanda-em-2027` |
| Plano contra realizado, passo a passo | 06, pareada espelhada | `v2_plano-e-realizado-espelhados-com-variancia` |
| Onde cada executivo ganha e perde carteira? | 06, pequenos múltiplos | `v3_carteira-por-executivo-em-oito-paineis` |
| Quem contribuiu com o quê dentro de cada passo? | 07, empilhada | `v1_carteira-do-mes-por-executivo` |
| De que é feito um passo específico da ponte? | 08, aninhada | `v1_custo-total-abrindo-em-marketing` |

Quatro atalhos:

* **Dois estoques ou um?** Se há valor de início e de fim, é ponte (01, 04, 06). Se há só um total, é decomposição (02). Se cada passo é um período, é saldo temporal (03).
* **Número único ou faixa?** Se o fim é auditável, 01 ou 04. Se o fim é cenário com incerteza declarada, 05.
* **Comparar pontes?** Se só a diferença importa, 01 na versão por efeito. Se as duas formas importam, 06, sempre com escala comum.
* **Largura de 400 px:** 01 deitada e 03 com poucos períodos empilham bem; 06 espelhada e 07 perdem rótulos e passam para a tabela com cascata micro.

## Quando a família serve

* Há sinais opostos no caminho, ou o resto até zero é a conclusão.
* Os passos têm ordem defensável: cronológica, por bloco lógico, ou ganhos antes de perdas, com o critério declarado.
* Entre 3 e 12 passos; acima disso, agrupar a cauda em Demais (n) com desdobramento.

Regras que valem para todos os modelos:

* **Início, fim e subtotal no eixo; intermediárias flutuam.** A barra de faixa do Recharts (`dataKey` devolvendo `[baixo, alto]`) cruza o zero sem a série transparente empilhada, que quebra nesse caso.
* **Três papéis de cor com polaridade:** aumento, queda e total, com custo que sobe pintado como piora. Sinal e seta no rótulo, porque a cor nunca é o único canal.
* **Os números fecham no dado:** soma dos passos igual a fim menos início, subtotais calculados na origem e resíduo explícito quando a decomposição não fecha.
* **Rótulo em toda coluna e legenda de papéis obrigatória.** A cascata não é intuitiva para quem não a conhece.
* **Nunca truncar nem quebrar o eixo.** Se as variações somem diante dos totais, remover as colunas de total e mostrar só os efeitos.
* **Passo zero é traço com rótulo 0; passo sem medição é vazado, com palavra e etiqueta LACUNA no cartão.** Nunca zero silencioso no lugar de ausente.
* **Sinais opostos no mesmo passo viram dois passos.**
* **Recharts não tem cascata nativa** (issue 7010): a família é `recharts-custom` ou `svg-puro` por definição, e `Cell` não entra, porque a cor por tipo vai no `shape`.

## Quando procurar outra família

Referências cruzadas definidas no plano do catálogo:

| Situação | Modelo em outra família |
|---|---|
| Queda etapa a etapa de um mesmo conjunto, com taxa de conversão de passo | [10_funil / 01_funil-em-barras-com-taxa-de-passo](../10_funil/01_funil-em-barras-com-taxa-de-passo/) |
| Fluxo entre origens e destinos, com perdas saindo de cada etapa e caminhos que se dividem | [11_fluxo-sankey / 02_sankey-multietapa](../11_fluxo-sankey/02_sankey-multietapa/) |
| Decomposição em alavancas por soma ou produto, com procedência por nó (driver tree) | [12_hierarquia / 04_arvore-de-indicadores](../12_hierarquia/04_arvore-de-indicadores/) |
| Variações por período e o acumulado lidos juntos, com escalas diferentes | [08_combinados-e-eixo-duplo / 05_colunas-com-linha-de-acumulado](../08_combinados-e-eixo-duplo/05_colunas-com-linha-de-acumulado/) |

Outras moradias apontadas pelo estudo:

| Situação | Família |
|---|---|
| Partes todas positivas e total secundário; barra 100% quando o total não interessa | [02_barras-horizontais](../02_barras-horizontais/) ou [03_colunas-verticais](../03_colunas-verticais/) |
| Composição final sem caminho | [07_rosca-e-radial](../07_rosca-e-radial/) |
| Barra de variação com base comum (mais ou menos, pirulito de variância) | [02_barras-horizontais](../02_barras-horizontais/) ou [17_comparacao-de-pontos](../17_comparacao-de-pontos/) |
| Trajetória do saldo, não a contribuição de cada período; projeção como trajetória | [04_linhas](../04_linhas/) ou [05_areas](../05_areas/) |
| Só quanto falta para a meta, sem caminho | [13_progresso-meta-e-gauge](../13_progresso-meta-e-gauge/) |
| Treemap e árvore de decomposição, quando a hierarquia importa mais que o caminho | [12_hierarquia](../12_hierarquia/) |
| Lista de mais de 20 linhas ou detalhamento sobre números | [14_tabelas-visuais](../14_tabelas-visuais/) |
| Distribuição do resultado de um cenário | [16_distribuicao](../16_distribuicao/) |
| Blocos com área proporcional | [26_mosaico-marimekko](../26_mosaico-marimekko/) |
| Cascata reduzida a tira dentro de um cartão, sem eixo | [24_microvisuais-sparklines](../24_microvisuais-sparklines/), com a geometria vinda daqui |
| Cascata de requisições de rede (desempenho web): homônimo, não é esta família | [20_cronograma-e-linha-do-tempo](../20_cronograma-e-linha-do-tempo/) |

## Referências

Todos os links vêm do estudo da família, da seção 24.36 do estudo de microvisuais e da varredura de portais de design. Marcas: **(não abriu)** quando a página foi tentada e não carregou, e vale pelo título e pelo trecho da busca; **[busca]** quando o link apareceu em resultado de busca e não foi aberto; **[aberto]** nos portais quando a página foi lida. Bibliotecas fora da stack do Farol (AG Charts, ECharts, Vega-Lite, Highcharts, SpreadJS) entram só como referência de desenho e de cálculo.

### Catálogos e documentação

| Referência | O que observar | Modelos |
|---|---|---|
| [Recharts, exemplo Waterfall](https://recharts.github.io/en-US/examples/Waterfall/) | `computeWaterfallData` devolvendo `[baixo, alto]`, o `shape` `WaterfallBar` e as colunas de total ancoradas no zero; a barra de faixa já é o mecanismo de intervalo | 01, 02, 05 |
| [Recharts, issue 7010](https://github.com/recharts/recharts/issues/7010) [busca] | Pedido aberto de cascata nativa: por isso a família é sempre `recharts-custom` | todos |
| [Recharts, Custom Shape Bar Chart](https://recharts.github.io/en-US/examples/CustomShapeBarChart/) [busca] | `shape` customizado, onde mora a cor por tipo de passo no lugar de `Cell` | todos |
| [Wikipedia, waterfall chart](https://en.wikipedia.org/wiki/Waterfall_chart) | Os apelidos (bridge, flying bricks), a origem em consultoria, subtotais como colunas inteiras e valores que cruzam o eixo | 01, 03 |
| [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/) | As três entradas de cascata (simples, horizontal, customizada) | 01 |
| [AG Charts, customised waterfall](https://www.ag-grid.com/charts/gallery/customised-waterfall/) | Array `totals` com índice e rótulo, estilos de positivo, negativo e total, conector tracejado, série diária com um total e o `tooltip renderer` que separa item real de total sintético | 01, 03, 08 |
| [AG Charts, horizontal waterfall](https://www.ag-grid.com/charts/gallery/horizontal-waterfall/) (não abriu) | Orientação deitada como variante de primeira classe | 01 |
| [AG Charts, simple waterfall](https://www.ag-grid.com/charts/gallery/simple-waterfall/) [busca] | A ponte mínima da biblioteca | 01 |
| [Vega-Lite, waterfall chart of monthly profit and loss](https://vega.github.io/vega-lite/examples/waterfall_chart.html) | `window` de soma corrida, `y` em `previous_sum` e `y2` em `sum`, conector como `rule` via `lead`, Begin e End com cor neutra | 01, 03 |
| [Apache ECharts, handbook, waterfall](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/waterfall/) | Série auxiliar transparente e séries positiva e negativa separadas: a técnica que quebra ao cruzar o zero | 03 |
| [Highcharts, demo waterfall](https://www.highcharts.com/demo/highcharts/waterfall) | Abriu só com título e categoria; ponte com total intermediário | 01 |
| [Datawrapper Academy, customizing your waterfall chart](https://www.datawrapper.de/academy/customizing-your-waterfall-chart) | Coluna de categoria que gera subtotais, diferenças contra totais corridos, zoom nas diferenças e faixas de destaque | 01, 05, 08 |
| [Datawrapper Academy, how to create a waterfall chart](https://www.datawrapper.de/academy/how-to-create-a-waterfall-chart) [busca] | O passo a passo de montagem do dado | 01 |
| [Datawrapper Academy, waterfall chart examples](https://www.datawrapper.de/academy/waterfall-chart-examples) (não abriu) | Galeria de exemplos da ferramenta | 01 |
| [IBCS, vertical waterfall chart template (C06)](https://www.ibcs.com/resource/chart-template-06/) | Barras de realizado e plano com a cascata de variação, pinos de variação percentual e ordenação pela variação contra o plano | 04, 06 |
| [SpreadJS, cascade sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkcascade) | `colorPositive`, `colorNegative`, `colorTotal` e o tipo `+`, `-` ou `=` de cada item vindo do dado | 01 |
| [microcharts, Waterfall](https://microcharts.dev/docs/charts/waterfall) (não abriu) | A cascata entre os microvisuais centrais | 01 |
| [FT, visual vocabulary (pasta)](https://github.com/ft-interactive/chart-doctor/tree/master/visual-vocabulary) [busca] e [README](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) | A cascata em parte do todo, e a separação entre desvio, parte do todo e fluxo | 01, 02 |
| [Data Viz Project, waterfall chart](https://datavizproject.com/data-type/waterfall-chart/) (não abriu) | Ficha do formato | 01 |
| [Observable Plot, interval transform](https://observablehq.github.io/plot/transforms/interval) [busca] | Sem exemplo oficial de cascata; a receita equivalente é a soma corrida | 03 |
| [sjcobb, echarts-waterfall](https://github.com/sjcobb/echarts-waterfall) [busca] | Cascata que cobre a barra que atravessa de positivo a negativo | 03, 07 |
| [Preset, waterfall chart](https://docs.preset.io/docs/waterfall-chart) [busca] | Cascata em ferramenta de BI | 01 |
| [AnyChart Playground, waterfall chart](https://playground.anychart.com/chart-types/waterfall-chart) [busca] | Exemplo editável de cascata | 01 |

### Praticantes

| Referência | O que observar | Modelos |
|---|---|---|
| [Storytelling with Data, what is a waterfall](https://www.storytellingwithdata.com/blog/2020/11/16/what-is-a-waterfall) | O fim da barra anterior como base da próxima, o alerta de que barras flutuantes não se comparam entre si e o arco regular de agrupar ganhos e perdas | 01, 02 |
| [Storytelling with Data, recap do desafio da cascata](https://www.storytellingwithdata.com/blog/2018/5/15/may-swdchallenge-recap-the-waterfall-chart) | Versões deitadas por rótulo longo, barras de erro e setas acrescentadas à cascata e a pergunta "por que as barras flutuam?" | 01, 05, 06, 08 |
| [Datawrapper, what to consider when creating waterfall charts](https://www.datawrapper.de/blog/waterfall-charts-guide) | Três cores, rotular tudo, proibição de marcador de quebra de eixo em total, quando a barra simples vence e o cansaço de quatro cascatas lado a lado | 01, 02, 05, 06 |
| [Datawrapper, new: waterfall charts in Datawrapper](https://www.datawrapper.de/blog/waterfall-charts) [busca] | O anúncio do tipo na ferramenta | 01 |
| [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/) | A taxonomia completa: variance, breakdown, measure-only, stacked, nested, small multiple, forecasting e side-by-side; orientação horizontal para rótulo longo | todos |
| [Inforiver, waterfall charts for finance professionals](https://inforiver.com/insights/waterfall-charts-finance-professionals-best-friend/) [busca] | A ponte no uso financeiro | 01, 02 |
| [Peltier Tech, Excel waterfall charts (bridge charts)](https://peltiertech.com/excel-waterfall-charts-bridge-charts/) | A técnica de empilhamento quebra ao misturar positivo e negativo; limite prático de itens por coluna | 07 |
| [Peltier Tech, Stacked Waterfall Chart](https://peltiertech.com/documentation/stacked-waterfall/) | Mixed bar com preenchimento padronizado e as variantes Dual, Rotated, Paired e Split Bar | 06, 07 |
| [Peltier Tech, Waterfall Chart](https://peltiertech.com/documentation/waterfall/) [busca] | A ponte básica da ferramenta | 01 |
| [Peltier Tech, Dual Waterfall Chart](https://peltiertech.com/documentation/dual-waterfall/) (não abriu) | Duas cascatas comparadas | 06 |
| [Zebra BI, Power BI horizontal waterfall charts explained](https://zebrabi.com/power-bi-waterfall-charts-explained/) | Critério de orientação (tempo da esquerda para a direita, quebra estrutural de cima para baixo), o recurso Result para subtotal e a ressalva de vocabulário | 01, 03, 04 |
| [Zebra BI, bridge charts from a single measure](https://help.zebrabi.com/kb/power-bi/bridge-waterfall-from-1-measure/) [busca] | Ponte montada a partir de uma medida só | 01 |
| [Zebra BI, Excel waterfall chart tutorial](https://zebrabi.com/excel-waterfall-chart/) [busca] | Verde e vermelho como convenção financeira | 01 |
| [Zebra BI, IBCS](https://zebrabi.com/ibcs/) (não abriu) | Cenários realizado, plano, orçamento, previsão e ano anterior com preenchimento normatizado: a origem da hachura de projeção | 04 |
| [Zebra BI, price volume mix analysis in Power BI](https://zebrabi.com/price-volume-mix-analysis-power-bi/) (não abriu) | Receita decomposta em preço, volume e mix como ponte | 01 |
| [Rohit Patel, how to do the price-volume-mix waterfall right](https://medium.com/quickai-app/how-to-do-the-price-volume-mix-waterfall-right-6723f5ed2920) (não abriu) | O efeito mix como o mais atribuído errado | 01 |
| [The Cost Element, sales bridge](https://thecostelement.com/sales-bridge-volume-price-mix-analysis/) [busca] | Ponte de vendas por volume, preço e mix | 01 |
| [Nightingale, Viva Magenta and Waterfall Experiences](https://nightingaledvs.com/viva-magenta-and-waterfall-experiences-in-data-visualization/) [busca] | Relato de uso de cascata em visualização | 01 |
| [Nightingale, Navigating the Wide World of Data Visualization Libraries](https://nightingaledvs.com/navigating-the-wide-world-of-data-visualization-libraries/) [busca] | Suporte a cascata entre bibliotecas | todos |
| [Nightingale no Medium, Data Density in Financial Presentations](https://medium.com/nightingale/lets-bring-some-data-density-to-financial-presentations-f8bc9e52ff10) (não abriu) | Densidade de dado em apresentação financeira | 06 |
| [Domo, waterfall chart guide](https://www.domo.com/learn/charts/waterfall-charts) [busca] | Guia introdutório do formato | 01 |
| [think-cell, waterfall charts in PowerPoint](https://www.think-cell.com/en/resources/content-hub/a-step-by-step-guide-to-creating-waterfall-charts-in-powerpoint) [busca] | Ponte com subtotais em apresentação | 01 |
| [Spotfire, what is a waterfall chart](https://www.spotfire.com/glossary/what-is-a-waterfall-chart) [busca] | Definição de glossário | 01 |
| [Sigma, when waterfall charts are the best option](https://www.sigmacomputing.com/blog/waterfall-charts-data-visualization) [busca] | Quando a cascata vence outras formas | 01, 02 |
| [MrExcel, stacked waterfall com positivos e negativos](https://www.mrexcel.com/board/threads/stacked-waterfall-chart-with-positive-and-negative-values-in-excel.1199615/) [busca] | O problema de sinais opostos no mesmo passo, visto por quem tenta resolver | 07 |

### Portais de design

Nomes de designers omitidos. Os links do Dribbble e da Figma Community valem pelo título e pelo trecho da busca: olhar a peça antes de adotar.

| Referência | O que observar | Modelos |
|---|---|---|
| [Behance, YTD Bookings Pipeline Stacked Waterfall Chart](https://www.behance.net/gallery/241535937/YTD-Bookings-Pipeline-Stacked-Waterfall-Chart-%28Excel%29) [aberto] | Cascata empilhada de reservas acumuladas no ano mais pipeline: o mesmo tema da ponte de forecast do Comercial (a página não descreve cores) | 04, 07 |
| [Behance, Waterfall Charts Infographics](https://www.behance.net/gallery/107274033/Waterfall-Charts-Infographics) [aberto] | Modelos de cascata para apresentação com valores positivos e negativos | 01 |
| [Behance, Data Visualization Guidelines](https://www.behance.net/gallery/253236163/Data-Visualization-Guidelines) [aberto] | Guia com 18 modelos de gráfico e regras de cor, contraste, tipografia, espaçamento e anotação | todos |
| [Dribbble, Waterfall Chart](https://dribbble.com/shots/4936758-Waterfall-Chart) (não abriu) | Efeito cumulativo de positivos e negativos, com barras de variação visualmente diferentes das de total | 01 |
| [Dribbble, Waterfall NPS Chart](https://dribbble.com/shots/6710427-Waterfall-NPS-Chart) (não abriu) | Cascata horizontal com cada fator como linha nomeada | 01 |
| [Dribbble, Waterfall chart](https://dribbble.com/shots/3699945-Waterfall-chart) (não abriu) | Rótulo direto, que na cascata micro vira dica | 01 |
| [Dribbble, tag waterfall chart](https://dribbble.com/tags/waterfall-chart) (não abriu) | Varredura de estilos; a página voltou vazia | 03, 04 |
| [Figma Community, Net Revenue Waterfall Chart Generator](https://www.figma.com/community/plugin/1620729787813298870/net-revenue-waterfall-chart-generator) (não abriu) | Ponte de receita líquida com paradas a partir de CSV | 01 |
| [Figma Community, Waterfal charts](https://www.figma.com/community/plugin/1180125043621224219/waterfal-charts) (não abriu) | Plugin de cascata a partir de dado | 01 |
| [Figma Community, Waterfall (design)](https://www.figma.com/community/file/1099626340704948588/waterfall-design) (não abriu) | Arquivo comunitário de componente de cascata | 02 |
| [Figma Community, Charts Artisan](https://www.figma.com/community/plugin/1577643545855669744/charts-artisan) (não abriu) | Suíte de gráficos com cascata entre os tipos | 07 |
| [Figma Community, UCharts](https://www.figma.com/community/plugin/1404821057322599271/ucharts-line-chart-bar-chart-area-chart-pie-chart-scatter-chart-radar-chart) (não abriu) | Plugin com suporte a cascata, sem exemplo de faixa de cenário | 05 |
| [Figma Community, Chart components](https://www.figma.com/community/file/1407258492483066708/chart-components) (não abriu) | Biblioteca de componentes de gráfico | 08 |
| [Figma Community, Full charts components](https://www.figma.com/community/file/1039326385370619352/full-charts-components) (não abriu) | Grade de painéis pequenos | 06 |
| [Figma Community, Charts Components For Free](https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available) (não abriu) | Mais de 30 tipos de gráfico, cascata incluída | 06 |

Nota da varredura de portais: no Farol a cascata sai do Recharts com a faixa calculada em TypeScript, ou de SVG direto; nenhum projeto do Behance dedicado a cascata apareceu em duas buscas, e nenhum exemplo de cascata apareceu no shadcn/ui charts nem no Tremor.
