# Fluxo e Sankey

Para onde vai o volume: de onde vem, por onde passa, onde sai e em que proporção. A diferença para o funil (família 10) é que aqui o caminho ramifica, funde e tem várias saídas. A família também cobre as mesmas unidades mudando de categoria entre momentos (alluvial), o cruzamento de atributos de uma população (parallel sets) e as trocas nos dois sentidos entre entidades sem coluna de origem nem de destino (chord direcional).

> Catálogo montado em 2026-09-14 a partir de [`_estudo/familias/11_fluxo-sankey.md`](../_estudo/familias/11_fluxo-sankey.md) e da seção 11 de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). Plano das versões em [`_estudo/catalogo/11_fluxo-sankey.json`](../_estudo/catalogo/11_fluxo-sankey.json). Todo caso de uso usa dado fictício do Farol.

## O que a família responde

Três leituras que não se confundem:

- **Sankey:** volume que flui (leads, agendas, reais) entre nós, com largura proporcional à quantidade.
- **Alluvial e parallel sets:** as mesmas unidades mudando de categoria entre momentos ou cruzando dimensões; importa a correspondência, não a direção física do fluxo.
- **Chord de fluxo:** trocas nos dois sentidos entre entidades que não se dividem em origem e destino.

Perguntas típicas no Farol:

- **Marketing:** os leads de cada origem terminam em qual desfecho (qualificado, em nutrição, descartado, sem contato)? Por quais toques passaram os qualificados?
- **Pré-vendas:** de cada origem, quanto vira agenda realizada e para qual executivo vai o handoff?
- **Comercial:** da oportunidade aberta ao ganho, onde saem as perdas e por qual motivo; quantas reabriram; quem repassa para quem?
- **Diretoria:** como o custo do trimestre em três camadas se reparte por canal e quanto dele tem retorno atribuído; como os clientes se movem entre faixas de receita.

Regras que valem para todos os modelos:

1. Uma unidade só por diagrama (contagem ou reais), escrita no título ou no rótulo.
2. Conservação: o que entra num nó sai dele. A diferença vira nó explícito ("Em andamento", "Sem desfecho"), nunca some.
3. Sem ciclo no dado de um sankey. Retorno é arco à parte (`02_sankey-multietapa`, versão `v4`).
4. Fluxos minúsculos agregados em "Outros"; abaixo de 1 px a ligação não é vista. Ausência ("Sem origem registrada") não entra em "Outros".
5. Foco que acende a adjacência e apaga o resto é quase obrigatório acima de 15 ligações. No preview o foco vem por prop (`highlightId`), porque estado de hover não sai no SVG.
6. Alternativa tabular (origem, destino, valor, % da origem) a um clique.
7. Em 400 px, sankey horizontal com mais de 3 colunas não cabe: usar a versão vertical do `01_sankey-simples` ou as barras da família 10.
8. Cor só por token do Farol, em slot fixo por categoria. As cores internas fixas do `Sankey` do Recharts somem no tema escuro: passar `node` e `link` sempre.

## Modelos

As pastas de modelo são criadas pelos produtores das versões; os links abaixo apontam para onde elas vão morar.

| # | Modelo | Abordagem na stack | O que responde | Versões planejadas |
|---|---|---|---|---|
| 01 | [Sankey simples de duas colunas](./01_sankey-simples/) | `recharts-nativo` (a versão vertical é SVG puro) | De onde vem e onde termina; handoff de uma equipe para outra. | `v1_origem-para-desfecho-dos-leads`, `v2_handoff-sdr-para-executivo-com-foco`, `v3_origem-ausente-com-cobertura`, `v4_vertical-em-coluna-estreita` |
| 02 | [Sankey multietapa com perdas](./02_sankey-multietapa/) | `recharts-custom` (o arco de retorno é SVG puro) | Onde o volume sai em cada etapa e por qual motivo; custo por camada e canal; jornada por toque; reabertura. | `v1_oportunidades-com-perdas-por-motivo`, `v2_custo-do-trimestre-por-camada-e-canal`, `v3_jornada-dos-leads-em-ate-tres-toques`, `v4_reabertura-com-arco-de-retorno` |
| 03 | [Alluvial](./03_alluvial/) | `svg-puro` | Quem manteve ou mudou de categoria entre momentos. | `v1_temperatura-dos-leads-em-tres-meses`, `v2_leads-quentes-que-esfriaram`, `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres`, `v4_classificacao-que-passou-a-existir` |
| 04 | [Parallel sets](./04_parallel-sets/) | `svg-puro` | Como 3 ou 4 atributos da mesma população se combinam. | `v1_origem-porte-e-desfecho-das-agendas`, `v2_combinacao-em-destaque`, `v3_cobertura-de-dado-dos-leads-por-origem`, `v4_combinacoes-raras-agregadas` |
| 05 | [Chord direcional de fluxo](./05_chord-direcional-de-fluxo/) | `svg-puro` | Quem entrega para quem nos dois sentidos, entre até 8 entidades. | `v1_repasses-entre-funcoes`, `v2_foco-na-pre-vendas`, `v3_reatribuicao-entre-executivos`, `v4_muitas-equipes-com-saida-para-matriz` |

Variações do estudo absorvidas como versão: o sankey vertical (11.3) entrou no modelo 01; o sankey de custo ou receita (11.4), o de caminhos (11.5) e o fluxo com retorno (11.6) entraram no modelo 02.

## Quando a família serve

- O caminho ramifica ou funde, e a pergunta é a proporção de cada ramo.
- Há conservação de volume a mostrar: tudo o que entrou tem destino declarado, inclusive "Em andamento" e "Sem retorno atribuído".
- A mesma população é classificada de dois ou mais jeitos (momentos, atributos) e a pergunta é a correspondência.
- Há trocas mútuas entre poucas entidades e a assimetria de ida e volta importa.

## Guia rápido: qual modelo escolher

1. **As unidades mudam de categoria no tempo** (temperatura do lead por mês, faixa de receita por trimestre)? Use o **03_alluvial**.
2. **São atributos da mesma população, sem tempo** (origem, porte, desfecho)? Use o **04_parallel-sets**, com até 4 eixos e 5 categorias por eixo.
3. **As entidades trocam nos dois sentidos e não há coluna de origem nem de destino** (funções, executivos, equipes)? Use o **05_chord-direcional-de-fluxo**, com até 8 grupos e a matriz a um clique.
4. **O volume flui de origem para destino em um só salto** (origem para desfecho, SDR para executivo)? Use o **01_sankey-simples**. Em coluna estreita ou celular, a versão `v4_vertical-em-coluna-estreita`.
5. **O volume atravessa três ou mais etapas com saídas no meio** (perdas por motivo, custo por camada e canal, jornada por toque, reabertura)? Use o **02_sankey-multietapa**.
6. **Não ramifica nem tem motivo de saída?** Não é desta família: vá para o funil (família 10).

Atalhos por pergunta:

| Pergunta no Farol | Modelo e versão |
|---|---|
| Os leads de cada origem terminam em qual desfecho? | `01_sankey-simples/v1_origem-para-desfecho-dos-leads` |
| Para qual executivo cada SDR entregou as agendas? | `01_sankey-simples/v2_handoff-sdr-para-executivo-com-foco` |
| Quanto da base chegou sem origem registrada? | `01_sankey-simples/v3_origem-ausente-com-cobertura` |
| Onde as oportunidades saem entre aberta e ganha? | `02_sankey-multietapa/v1_oportunidades-com-perdas-por-motivo` |
| Quanto do custo em três camadas tem retorno atribuído? | `02_sankey-multietapa/v2_custo-do-trimestre-por-camada-e-canal` |
| Por quais toques passaram os leads qualificados? | `02_sankey-multietapa/v3_jornada-dos-leads-em-ate-tres-toques` |
| Quantos leads quentes esfriaram no mês? | `03_alluvial/v2_leads-quentes-que-esfriaram` |
| A falta de telefone pesa no desfecho do lead? | `04_parallel-sets/v3_cobertura-de-dado-dos-leads-por-origem` |
| A Pré-vendas entrega mais do que recebe? | `05_chord-direcional-de-fluxo/v2_foco-na-pre-vendas` |

## Quando procurar outra família

| Situação | Família e modelo | Motivo |
|---|---|---|
| Leitura exata de cada par origem e destino, ou só dois momentos | [15_mapa-de-calor-e-calendario, 07_matriz-de-transicao](../15_mapa-de-calor-e-calendario/07_matriz-de-transicao/) | Célula colorida com valor escrito lê melhor que faixa. |
| Relação sem volume, rede dirigida ou chord simétrico | [27_rede-e-relacoes](../27_rede-e-relacoes/), em especial [07_chord-simetrico](../27_rede-e-relacoes/07_chord-simetrico/) e [01_matriz-de-adjacencia](../27_rede-e-relacoes/01_matriz-de-adjacencia/) | Relação, não quantidade que flui. A matriz é a alternativa acessível ao chord. |
| Funil linear, sem ramificação | [10_funil](../10_funil/), em especial [03_funil-com-perdas-por-etapa](../10_funil/03_funil-com-perdas-por-etapa/) | Um caminho só lê melhor em barras com taxa de passo. |
| Posição num ranking entre períodos | [04_linhas, 08_bump-chart](../04_linhas/08_bump-chart/) | Posição ordinal no tempo, não volume. |
| Soma e subtração em degraus, resultado negativo | [19_cascata-waterfall](../19_cascata-waterfall/) | Largura de faixa não codifica negativo. |
| Série temporal empilhada sem rastrear unidades | [05_areas](../05_areas/) | Composição no tempo, sem correspondência. |
| Fluxo sobre geografia | [23_mapas](../23_mapas/) | A posição é geográfica. |

## Referências

Todos os links vêm do estudo da família ou da varredura de portais; nenhum foi acrescentado aqui. Marcação de proveniência: **[aberto]** a página foi lida; **[busca]** só apareceu em busca; **(não abriu)** tentada sem sucesso, vale pelo título e trecho. Nas bibliotecas fora da stack (nivo, AG Charts, ECharts, Highcharts, visx), observar a regra e a geometria, nunca importar.

### Da família inteira

| Referência | O que observar |
|---|---|
| [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide) [aberto] | Sankey para volume, alluvial para categorias; a confusão entre os dois também atinge parallel sets. |
| [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) [aberto] | Sankey na categoria fluxo, ao lado da cascata: ajuda a decidir quando o demonstrativo vira família 19. |
| [Nightingale, Endless River: An Overview of Dataviz for Categorical Data](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/) [aberto] | No máximo 5 ou 6 cores primárias, tons para subcategorias, cruzamentos mínimos e ligações fracas em "outros". |
| [Edward Tufte, Napoleon's March](https://www.edwardtufte.com/product/napoleons-march/) [aberto] | A espessura da faixa como tamanho em cada ponto do caminho e a perda codificada na largura. |
| [RAWGraphs, repositório de gráficos](https://github.com/rawgraphs/rawgraphs-charts) [aberto] | Alluvial e sankey lado a lado no mesmo repositório, com metadados de dimensão por gráfico. |
| [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options) [aberto] | Sankey, chord, barras e radial comparados para o mesmo dado de dois níveis, com a decisão registrada: método de escolha de visual. |
| Tipagem local `app/node_modules/recharts/types/chart/Sankey.d.ts` (Recharts 3.10.1) | Padrões reais de `align`, `sort`, `iterations`, `nodeWidth`, `nodePadding`, `linkCurvature` e margem de 5 px que corta rótulo. |

### 01_sankey-simples

| Referência | O que observar |
|---|---|
| [From Data to Viz, Sankey](https://www.data-to-viz.com/graph/sankey.html) [aberto] | Posição dos nós para reduzir cruzamentos e remoção de ligações fracas. |
| [Data Visualisation Catalogue, Sankey Diagram](https://datavizcatalogue.com/methods/sankey_diagram.html) [aberto] | Espessura como magnitude e cor para categoria ou transição de estado. |
| [Recharts, API Sankey](https://recharts.github.io/en-US/api/Sankey/) [aberto] | `nodePadding`, `nodeWidth`, `linkCurvature`, `sort`, `align`, `verticalAlign`; não existe orientação vertical. |
| [Recharts, exemplo de Sankey](https://recharts-recharts.mintlify.app/examples/sankey) [aberto] | Links por índice e nó customizado com cor por `payload.depth`. |
| [Highcharts, Sankey diagram (docs)](https://www.highcharts.com/docs/chart-and-series-types/sankey-diagram) [aberto] | Formato `from`, `to`, `weight`, útil para montar o dicionário nome para índice. |
| [Apache ECharts, Sankey Orient Vertical](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sankey-vertical.ts) [aberto] | Orientação vertical com rótulo no topo, base da versão `v4_vertical-em-coluna-estreita`. |
| [nivo, Sankey](https://nivo.rocks/sankey/) [aberto] | Layout horizontal ou vertical como opção de primeira classe. |
| [Data Viz Project, Sankey Diagram](https://datavizproject.com/data-type/sankey-diagram/) (não abriu) | Ficha de catálogo; conferir antes de citar. |
| [Recharts, exemplo de nó customizado no StackBlitz](https://stackblitz.com/edit/lbje6c2j?file=src/Example.tsx) (não abriu) | Nó customizado de Sankey no Recharts. |
| [Dribbble, Futuristic dashboard with sankey chart visualization](https://dribbble.com/shots/21895394-Futuristic-dashboard-with-sankey-chart-visualization) (não abriu) | Sankey dentro de painel escuro, parte de um kit de gráficos; qualidade visual não conferida. |
| [Dribbble, Sankey Diagram](https://dribbble.com/shots/14221038-Sankey-Diagram) (não abriu) | Sankey como peça isolada; qualidade visual não conferida. |
| [Figma Community, sankey demo](https://www.figma.com/community/file/1164519978600011950/sankey-demo) [busca] | Arquivo de demonstração de sankey, só para rascunho. |

### 02_sankey-multietapa

| Referência | O que observar |
|---|---|
| [From Data to Viz, Sankey](https://www.data-to-viz.com/graph/sankey.html) [aberto] | Os usos "da origem ao fim" com passos intermediários e "evolução" com nós em estágios diferentes. |
| [nivo, Sankey](https://nivo.rocks/sankey/) [aberto] | O aviso de que dependência cíclica quebra o gráfico; `align`, `sort` e degradê na ligação. |
| [AG Charts, Sankey Series](https://www.ag-grid.com/charts/javascript/sankey-series/) [aberto] | Ligações que fecham laço são removidas; alinhamentos justify, left, right e center. |
| [Apache ECharts, Sankey with Levels Setting](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sankey-levels.ts) [aberto] | Cor por profundidade e foco na adjacência. |
| [Data Visualisation Catalogue, Sankey Diagram](https://datavizcatalogue.com/methods/sankey_diagram.html) [aberto] | Transferência de energia, dinheiro e materiais: base do demonstrativo de custo. |
| [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/) [aberto] | Sankey para perdas em várias etapas e para muitos caminhos que terminam em conversão. |
| [Behance, Flow Analysis tool for CI platform](https://www.behance.net/gallery/108555313/Flow-Analysis-tool-for-CI-platform) [aberto] | Sankey interativo para montar funil e fluxo do usuário por etapas sem conhecimento de análise. |
| [Behance, Central College Sankey Major to Job](https://www.behance.net/gallery/219066133/Central-College-Sankey-Major-to-Job-Correlation-Diagram) [aberto] | Composição multietapa; a página não descreve o visual em texto. |
| [Behance, Indian Budget: How the Rupee Flows](https://www.behance.net/gallery/227453477/Indian-Budget-How-the-Rupee-Flows) [aberto] | Orçamento desenhado como sankey; a página não descreve o visual em texto. |
| [Behance, Pathways to mitigating climate change](https://www.behance.net/gallery/107000871/Pathways-to-mitigating-climate-change-Sankey-diagram) [aberto] | Sankey editorial com dado de artigos; não detalha ordem de nós nem cor. |
| [Dribbble, Free Sankey Chart Resource](https://dribbble.com/shots/12464862-Free-Sankey-Chart-Resource) (não abriu) | Recurso pensado para desempenho de funil e jornada do cliente em painel; qualidade visual não conferida. |
| [Dribbble, Animated Sankey Diagram](https://dribbble.com/shots/17998273-Animated-Sankey-Diagram-49-Days-of-Charts) (não abriu) | Sankey animado; no Farol a animação só na entrada, por `useAnimateOnce`. |
| [Dribbble, Sankey diagram tool](https://dribbble.com/shots/24896768-Sankey-diagram-tool) (não abriu) | Interface que gera sankey a partir do dado do usuário; qualidade visual não conferida. |

### 03_alluvial

| Referência | O que observar |
|---|---|
| [RAWGraphs, Alluvial Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/alluvialdiagram) [aberto] | Correlação entre dimensões categóricas como fluxo, com retângulo por valor único e altura proporcional. |
| [RAWGraphs, Sankey Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/sankeydiagram) [aberto] | O mesmo repositório separando sankey de alluvial: comparar o que muda no dado de entrada. |
| [RAWGraphs](https://www.rawgraphs.io/) [aberto] | Ferramenta que publica os dois gráficos lado a lado. |
| [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide) [aberto] | Sankey para volume, alluvial para categorias. |
| [Data Viz Project, Alluvial Diagram](https://datavizproject.com/data-type/alluvial-diagram/) (não abriu) | Ficha de catálogo; conferir antes de citar. |
| [Behance, Alluvial Diagram: Titanic passengers](https://www.behance.net/gallery/162455355/Alluvial-Diagram-Titanic-passengers) [aberto] | Alluvial editorial de várias dimensões; a página não descreve o visual em texto. |
| [Behance, Vendor Trace: Alluvial Diagram](https://www.behance.net/gallery/152796919/Vendor-Trace-Alluvial-Diagram) [aberto] | Alluvial aplicado a rastreio de fornecedores; sem descrição textual do visual. |

### 04_parallel-sets

| Referência | O que observar |
|---|---|
| [Data Visualisation Catalogue, Parallel Sets](https://datavizcatalogue.com/methods/parallel_sets.html) [aberto] | A diferença para o sankey: sem setas, a população se divide em cada conjunto de linhas. |
| [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide) [aberto] | A confusão entre sankey e alluvial, que também atinge parallel sets. |
| [RAWGraphs, Alluvial Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/alluvialdiagram) [aberto] | A geometria compartilhada: dimensões categóricas como eixos, retângulo por valor único. |

Portal de design específico para parallel sets: não localizado na pesquisa.

### 05_chord-direcional-de-fluxo

| Referência | O que observar |
|---|---|
| [Highcharts, Dependency wheel (docs)](https://www.highcharts.com/docs/chart-and-series-types/dependency-wheel) [aberto] | O mesmo dado do sankey, com os nós no mesmo nível e fluxo multidirecional. |
| [Highcharts, Dependency wheel (demo)](https://www.highcharts.com/demo/highcharts/dependency-wheel) [aberto] | Demo oficial, renderizada por JavaScript. |
| [AG Charts, Chord Series](https://www.ag-grid.com/charts/javascript/chord-series/) [aberto] | `fromKey`, `toKey`, `sizeKey` e a tensão da curva da fita. |
| [Apache ECharts, Basic Chord](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/chord-simple.ts) [aberto] | Série chord com a cor da fita pelo destino; o Farol usa a cor da origem. |
| [nivo, Chord](https://nivo.rocks/chord/) [aberto] | Matriz de entrada, `padAngle` e opacidades ativa e inativa. |
| [From Data to Viz, Chord](https://www.data-to-viz.com/graph/chord.html) [aberto] | Ordenar para reduzir cruzamentos, remover fitas fracas e explicar a leitura ao público. |
| [Data Visualisation Catalogue, Chord Diagram](https://datavizcatalogue.com/methods/chord_diagram.html) [aberto] | Anatomia do chord e o limite de legibilidade com muitas entidades. |
| [visx, sandbox chord](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-chord) [aberto] | Geometria de chord em React; a biblioteca não entra na stack. |
| [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/) [aberto] | Minimizar cruzamentos, colapsar ligações fracas em "outros" e dar pistas para leigos. |
| [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf) [aberto] | Por que o arranjo circular atrapalha consulta e comparação: justifica a matriz a um clique. |
| [Behance, Bilateral Migrations Inside The EU in 2020 (D3.js)](https://www.behance.net/gallery/137170789/Bilateral-Migrations-Inside-The-EU-in-2020-%28D3js%29) [aberto] | Entidades ordenadas por volume e fita mais grossa para mais pessoas. |
| [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options) [aberto] | Sankey escolhido sobre chord por legibilidade num dado de dois níveis. |
