# Funil

Um funil mostra quantas unidades sobrevivem a cada etapa de um processo ordenado e onde a perda se concentra. Esta família cobre o funil de oportunidades do Comercial, a esteira de entradas até handoff da Pré-vendas, o caminho de impressão a lead qualificado do Marketing e o realizado contra meta da Diretoria. Todos os casos usam dado fictício do Farol.

Estudo de origem: [`_estudo/familias/10_funil.md`](../_estudo/familias/10_funil.md). Catálogo das versões: [`_estudo/catalogo/10_funil.json`](../_estudo/catalogo/10_funil.json).

## O que a família responde

Três leituras convivem num funil e costumam ser confundidas. Todo modelo diz qual está mostrando:

1. **Volume por etapa:** quantos chegaram.
2. **Taxa de passo:** dos que estavam na etapa anterior, quantos passaram para esta.
3. **Taxa da entrada (acumulada):** dos que entraram, quantos chegaram até aqui.

Um funil só é honesto quando as etapas formam uma sequência real e a população é a mesma do topo ao fundo (coorte, leitura de fluxo). Quando o dado é um retrato do pipeline num dia (leitura de estoque), a diferença entre duas etapas não é perda: parte está em andamento, e o visual precisa mostrar esse segmento.

Perguntas típicas no Farol:

* **Comercial:** das 420 oportunidades abertas no trimestre, quantas viraram proposta e quantas foram ganhas; em qual passagem a taxa caiu contra o trimestre anterior; onde se perde mais e por qual motivo.
* **Pré-vendas:** das entradas da semana, quantas tiveram conexão, agenda marcada, agenda realizada e handoff aceito; qual passagem está fora do SLA.
* **Marketing:** de impressões a lead qualificado, qual origem sobrevive até o ganho; qual CPL e CPL qualificado resultam.
* **Diretoria:** o funil realizado cabe na meta de ganhos; quanto falta em cada etapa para fechar a meta do período.

## Modelos

| Nº | Modelo | Responde | Abordagem | Versões |
|---|---|---|---|---|
| 01 | [Funil em barras com taxa de passo](./01_funil-em-barras-com-taxa-de-passo/) | Em qual passagem a conversão cai | `recharts-custom` | 4 |
| 02 | [Funil clássico trapezoidal](./02_funil-classico-trapezoidal/) | Como o processo afunila, em leitura de capa | `recharts-nativo` | 4 |
| 03 | [Funil com perdas por etapa](./03_funil-com-perdas-por-etapa/) | Onde e por qual motivo se perde | `recharts-nativo` | 4 |
| 04 | [Funil comparativo entre períodos ou segmentos](./04_funil-comparativo/) | Se a conversão mudou ou difere entre recortes | `recharts-nativo` | 4 |
| 05 | [Funil com meta sobreposta](./05_funil-com-meta-sobreposta/) | Se o realizado cabe na meta e quanto falta | `recharts-custom` | 4 |
| 06 | [Funil empilhado por composição](./06_funil-empilhado-por-composicao/) | Quem sobrevive: como o mix muda do topo ao fundo | `recharts-nativo` | 4 |
| 07 | [Funil em cartões de etapa](./07_funil-em-cartoes-de-etapa/) | Os números do funil numa faixa, com prazo e SLA | `html-tailwind` | 4 |

Variações absorvidas do estudo:

* **01** absorve as barras centralizadas com conectores de perda (10.3), as colunas com cunha de drop off (10.7) e o funil micro de célula de tabela (24.37).
* **02** absorve o funil cônico contínuo (10.8).
* **04** absorve o funil espelhado em borboleta (10.6).
* **07** absorve o funil com tempo e SLA entre etapas (10.12).

## Guia rápido: qual modelo escolher

| Se a pergunta é | Use | Versão de partida |
|---|---|---|
| Qual passagem precisa de conserto? | 01, barras com taxa de passo | `v1_barras-com-trilho-e-taxa-de-passo` |
| A forma do funil por linha, dentro de uma tabela | 01, funil micro | `v3_funil-micro-por-origem-em-tabela` |
| Uma capa de trimestre com 4 a 6 etapas monotônicas | 02, trapezoidal | `v1_trapezios-do-trimestre` |
| Onde se perde e por qual motivo, com dado de retrato do pipeline | 03, perdas por etapa | `v1_avancou-perdido-em-andamento` |
| A conversão mudou contra o período anterior? | 04, comparativo | `v2_delta-de-taxa-acima-do-limiar` |
| Qual executivo converte melhor em cada passagem? | 04, painéis pequenos | `v3_executivos-em-paineis-pequenos` |
| O realizado cabe na meta e quanto falta por etapa? | 05, meta sobreposta | `v1_realizado-contra-meta-do-trimestre` |
| Qual origem sobrevive até o ganho? | 06, empilhado por composição | `v2_mix-em-100-com-indicacao-em-destaque` |
| Os números do funil numa faixa de topo de página | 07, cartões de etapa | `v1_faixa-de-marketing-com-cpl` |
| Quanto tempo leva cada passagem e se cumpre o SLA | 07, tempo e SLA | `v3_tempo-e-sla-entre-etapas` |

Três atalhos:

* **Taxa ou volume?** Se a decisão depende da taxa de passo, fique no 01 ou no 04; o 02 só dá a forma de conjunto.
* **Fluxo ou estoque?** Se o dado é um retrato do pipeline num dia, vá para o 03, que tem o segmento em andamento; nos demais, a diferença entre etapas seria lida como perda.
* **Largura de 400 px:** 01 e 07 empilham bem; 02, a borboleta do 04 e o cone do 02 perdem os rótulos.

## Quando a família serve

* As etapas formam uma sequência real de processo e cada uma é subconjunto da anterior.
* A população é a mesma do topo ao fundo, ou o visual declara o segmento em andamento.
* Há de 3 a 7 etapas; acima disso, agrupar etapas ou partir em dois painéis.

Regras que valem para todos os modelos:

* Etapas sempre na ordem do processo, nunca ordenadas por valor.
* Valor absoluto escrito em toda etapa; taxa identificada pelo nome, "de passo" ou "da entrada".
* Etapa sem dado é marcada como tal e nunca interpolada; zero medido é zero e aparece desenhado.
* Etapa maior que a anterior (janelas de data diferentes, reengajamento) é desenhada no tamanho real e explicada, nunca escondida.
* Nunca escala logarítmica, quebra de eixo ou gargalo de largura fixa: comprimento e largura seguem o valor.
* Alternativa tabular acessível (etapa, valor, taxa de passo, taxa da entrada) disponível no menu do visual.

## Quando procurar outra família

Referências cruzadas definidas no plano do catálogo:

| Situação | Modelo em outra família |
|---|---|
| O funil se ramifica: perdas por motivo saindo de cada etapa, caminhos que se dividem ou voltam | [11_fluxo-sankey / 02_sankey-multietapa](../11_fluxo-sankey/02_sankey-multietapa/) |
| Da entrada aos ganhos subtraindo cada perda em degraus | [19_cascata-waterfall / 02_cascata-de-decomposicao](../19_cascata-waterfall/02_cascata-de-decomposicao/) |
| Conversão por safra de entrada, etapa alcançada por coorte | [15_mapa-de-calor-e-calendario / 03_cohort-em-triangulo](../15_mapa-de-calor-e-calendario/03_cohort-em-triangulo/) |
| Funil de área quadrada, a alternativa que codifica por área em grade | [22_unidades-waffle-e-pictograma / 05_area-quadrada-proporcional](../22_unidades-waffle-e-pictograma/05_area-quadrada-proporcional/) |

Outras moradias apontadas pelo estudo:

| Situação | Família |
|---|---|
| Taxa de conversão de passo ao longo de muitos períodos | [04_linhas](../04_linhas/) |
| Uma única meta do período, sem etapas | [13_progresso-meta-e-gauge](../13_progresso-meta-e-gauge/) |
| Pirâmide proporcional sem ordem de processo, que é parte do todo | [02_barras-horizontais](../02_barras-horizontais/) ou [22_unidades-waffle-e-pictograma](../22_unidades-waffle-e-pictograma/) |
| Funil em rosca, com codificação angular | [07_rosca-e-radial](../07_rosca-e-radial/) |
| Um indicador isolado do funil com meta ou variação | [01_cards-e-kpis](../01_cards-e-kpis/) |

## Referências

Todos os links vêm do estudo da família, da seção 24.37 do estudo de microvisuais e da varredura de portais. Marcas: **(não abriu)** quando a página não carregou na pesquisa e vale pelo título e pelo trecho da busca; **[busca]** quando o link não foi aberto. Bibliotecas fora da stack do Farol (nivo, ECharts, AG Charts, Highcharts) entram só como referência de desenho e de cálculo.

### Catálogos e documentação

| Referência | O que observar | Modelos |
|---|---|---|
| [Recharts, API Funnel](https://recharts.github.io/en-US/api/Funnel/) | `lastShapeType` (o padrão é triângulo), `reversed`, `shape`, `activeShape`; vários `Funnel` no mesmo `FunnelChart` para comparar | 02, 04 |
| [Recharts, exemplo de funil](https://recharts-recharts.mintlify.app/examples/funnel-chart) | `LabelList` dentro e fora da faixa e `Cell` por segmento | 02 |
| [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/) | Área de drop off com a cor da barra em opacidade reduzida; `dropOff.enabled: false` vira barras segmentadas; `spacingRatio`, `stageLabel` e `direction: 'horizontal'` | 01, 03, 07 |
| [AG Charts, Cone Funnel](https://www.ag-grid.com/charts/gallery/simple-cone-funnel/) | Linha por etapa com áreas de perda; dica que combina valor absoluto e taxa sobre a entrada | 02, 07 |
| [nivo, Funnel](https://nivo.rocks/funnel/) | Separadores antes e depois de cada parte, `shapeBlending`, interpolação suave contra linear e o hook `useFunnel` como referência de cálculo | 01, 02, 07 |
| [Highcharts, JSFiddle do funil](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/funnel/) | Antiexemplo: `neckWidth` e `neckHeight` fixos desproporcionam as etapas finais | 02 |
| [Apache ECharts, issue 21302](https://github.com/apache/echarts/issues/21302) | Funil com altura dinâmica e `sort: 'none'` para manter a ordem do processo | 01 |
| [Apache ECharts, Funnel Compare](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-align.ts) | Quatro séries posicionadas para comparação; `funnelAlign` à esquerda e à direita para o espelhado | 04 |
| [Apache ECharts, Customized Funnel](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-customize.ts) | Séries de esperado e realizado sobrepostas com opacidade e borda | 05 |
| [microcharts, Funnel](https://microcharts.dev/docs/charts/funnel) | Retângulos em degrau ancorados no zero, recusa da silhueta afunilada, rótulo em percentual ou valor e a etapa maior que a anterior | 01, 02 |
| [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) | Não tem funil; barras empilhadas e proporcionais na categoria parte do todo | 06 |
| [shadcn/ui, charts](https://ui.shadcn.com/charts) | Não tem funil; a família sai do Recharts direto, sem bloco pronto | todos |
| [Data Viz Project, Funnel Chart](https://datavizproject.com/data-type/funnel-chart/) (não abriu) | Ficha do formato clássico | 02 |
| [Wikipedia, funnel chart](https://en.wikipedia.org/wiki/Funnel_chart) (não abriu) | A forma clássica em trapézios, ponto de partida do que o funil micro abandona | 01, 02 |

### Praticantes

| Referência | O que observar | Modelos |
|---|---|---|
| [Storytelling with Data, #SWDchallenge funnel chart (2024-06-03)](https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart) | As três ressalvas: centralização, diferença de magnitude entre topo e fundo e uso sem progressão real; a área quadrada como alternativa | 01, 02, 04 |
| [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/) | A medição da distorção (última etapa com 6,2% do volume ocupando 35% da largura), mesma linha de base, trilho com a população inicial, taxa de passo e queda absoluta | 01, 02, 03, 07 |
| [Towards Data Science, Telling your data story with funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/) | Barras para achar atrito na jornada; o funil em rosca só aguenta dois ou três grupos | 01, 03, 06 |
| [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide) | Barras empilhadas como alternativa mais legível para partes (não trata funil) | 06 |
| [Perceptual Edge, Our Irresistible Fascination with All Things Circular (2010)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf) | O argumento a favor do bullet graph linear, base do marcador de meta | 05 |
| [microcharts, when to use](https://microcharts.dev/docs/when-to-use) | Microvisual quando o gráfico mora dentro de algo que já se está lendo, com o funil completo numa página vinculada | 01 |
| [Effective Data Storytelling, Measurement over metaphor](https://www.effectivedatastorytelling.com/post/measurement-over-metaphor-rethinking-the-conversion-funnel) (não abriu) | Pelo título: medida acima da metáfora no funil de conversão | 01, 02 |

### Portais de design

| Referência | O que observar | Modelos |
|---|---|---|
| [Behance, Style Guidelines for data visualisation: dark & light](https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light) | Regras escritas para funil num guia com paleta escura e clara; tratamento de cartões em tema escuro | 02, 07 |
| [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard) | Funil de vendas num painel de conversão: faixa de KPIs e colunas de conversão | 01, 03, 07 |
| [Behance, busca funnel chart dashboard](https://www.behance.net/search/projects/funnel%20chart%20dashboard) | Página de busca, só para varrer estilos de conector, comparativo, meta e composição | 01, 04, 05, 06 |
| [Behance, Funnel Chart](https://www.behance.net/gallery/234800155/Funnel-Chart) | Funil em ilustração vetorial sem etapas nem taxas: o decorativo a evitar | 02 |
| [Behance, Upsell Downsell Chart, Funnel Process Chart](https://www.behance.net/gallery/154211303/Upsell-Downsell-Chart-Funnel-Process-Chart) | Funil com ramificação de oferta adicional e alternativa; lembra bifurcação de handoff e aponta para o Sankey | 11/02 |
| [Dribbble, Sales Dashboard and Lead Funnel Page](https://dribbble.com/shots/17241075-Sales-Dashboard-and-Lead-Funnel-Page) (não abriu) | Painel de vendas com página própria para o funil de leads | 01, 07 |
| [Dribbble, Sales Funnel Dashboard UI](https://dribbble.com/shots/26046624-Sales-Funnel-Dashboard-UI) (não abriu) | Dashboard inteiro organizado em torno do funil de vendas | 01, 07 |
| [Dribbble, Sales Funnel](https://dribbble.com/shots/3004993-Sales-Funnel) (não abriu) | A história das vendas contada com uma única visualização em vez de vários gráficos | 01, 03 |
| [Dribbble, tag funnel chart](https://dribbble.com/tags/funnel-chart) (não abriu) | Predominância de trapézios decorativos, o padrão a evitar no funil micro | 01, 02 |
| [Figma Community, Charts Components For Free](https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available) [busca] | Mais de 30 tipos de gráfico, incluindo funil e Sankey; abrir antes de adotar | 02 |
| [Figma Community, Charts Components](https://www.figma.com/community/file/1467135040779593066/charts-components) [busca] | Mais de 14 tipos e mais de 100 variantes, incluindo funil | 02 |
| [Figma Community, plugin uChart](https://www.figma.com/community/plugin/1404821057322599271/uchart) [busca] | Gera funil, Sankey e heatmap de calendário a partir de dado; só para rascunho, o Farol desenha em código | 02 |

Nota da varredura de portais: para funil com taxa entre etapas e contagem absoluta, barras leem melhor que o trapézio do `FunnelChart`; os shots do Dribbble não tiveram a qualidade visual conferida.
