# Hierarquia

Como um todo se divide em partes que também se dividem. A família responde duas perguntas diferentes, e escolher o modelo é escolher qual vem primeiro: quanto pesa cada parte da hierarquia (área ou ângulo: treemap, sunburst, icicle, circle packing, perímetro aninhado) ou qual é a estrutura, quem pertence a quem, com ou sem valor (árvore, dendrograma, árvore de indicadores).

## O que a família responde

- **Comercial:** a receita reconhecida do trimestre vem de quais produtos e, dentro de cada produto, de quais executivos; quais motivos de perda pesam mais e de quais submotivos é feito cada um; quanto do pipeline aberto depende de um único executivo.
- **Pré-vendas:** como as entradas se dividem entre origem, subcanal e desfecho; qual função está perto do teto de capacidade.
- **Marketing:** como o investimento do mês desce de plataforma para campanha e criativo; onde está o CPL qualificado que mais piorou.
- **Diretoria:** quais alavancas explicam a receita projetada e quanto cada uma move a faixa do cenário; qual é o perímetro de mercado (total, endereçável, alcançável) e quanto dele é nosso; de que é feito o custo por camada.

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | Pergunta que responde |
|---|---|---|---|---|---|
| 01 | Treemap | [./01_treemap/](./01_treemap/) | recharts-nativo | 4 | De que é feito o total, com 8 a 40 partes; também com cor por variação e detalhamento nível a nível |
| 02 | Treemap aninhado com rótulo de grupo | [./02_treemap-aninhado/](./02_treemap-aninhado/) | recharts-custom | 4 | Como dois ou três níveis se dividem, vistos de uma vez |
| 03 | Sunburst | [./03_sunburst/](./03_sunburst/) | recharts-nativo | 4 | De que é feito cada pai, em 2 ou 3 anéis, com o total no centro |
| 04 | Árvore de indicadores (driver tree) | [./04_arvore-de-indicadores/](./04_arvore-de-indicadores/) | html-tailwind | 4 | Quais alavancas, por soma ou produto, explicam um resultado e com que procedência |
| 05 | Perímetro aninhado | [./05_perimetro-aninhado/](./05_perimetro-aninhado/) | html-tailwind | 4 | Quanto do mercado total, endereçável e alcançável é nosso |
| 06 | Icicle (partição retangular) | [./06_icicle/](./06_icicle/) | svg-puro | 4 | Peso e posição de cada nó numa hierarquia profunda com rótulos longos |
| 07 | Árvore e dendrograma | [./07_arvore-e-dendrograma/](./07_arvore-e-dendrograma/) | svg-puro | 4 | Quem pertence a quem: organograma, taxonomia, árvore radial |
| 08 | Circle packing | [./08_circle-packing/](./08_circle-packing/) | svg-puro | 4 | Como os itens se agrupam, com tamanho só aproximado |

As versões de cada modelo seguem o mesmo arco: básico; com destaque ou anotação; caso denso do Farol; caso limite (valor zero, ramo sem dado, fatia fina, nível sem estimativa). O catálogo completo das versões está em `_estudo/catalogo/12_hierarquia.json`.

## Quando a família serve

- Existe hierarquia de verdade: cada filho pertence a um único pai e a soma dos filhos fecha com o pai.
- A pergunta é de composição (de que é feito) ou de estrutura (quem pertence a quem), não de ranking fino.
- Há 2 ou 3 níveis para ler de uma vez, ou uma hierarquia mais profunda explorada por clique.

## Guia rápido de escolha

| Se a pergunta é | Use | Porque |
|---|---|---|
| De que é feito o total, um nível, 8 a 40 partes | 01 Treemap | Melhor aproveitamento de espaço da família |
| O mesmo, mas quem piorou importa tanto quanto quem pesa | 01 Treemap, versão com cor por variação | Área para tamanho, cor divergente para desempenho |
| Hierarquia profunda para explorar por clique, em painel | 01 Treemap, versão com detalhamento | Um nível por vez, com trilha e peso do ramo no todo |
| Dois ou três níveis lidos juntos | 02 Treemap aninhado | Grupo e filhos no mesmo quadro, com selo do grupo |
| De que é feito cada pai, com ênfase no total | 03 Sunburst | Centro com o total e anéis por nível |
| Rótulos longos ou mais de 3 níveis | 06 Icicle | Orientação lateral acomoda texto e profundidade |
| Quais alavancas explicam uma meta ou projeção | 04 Árvore de indicadores | Operadores que fecham e procedência em cada nó |
| Participação dentro de um perímetro de mercado | 05 Perímetro aninhado | Contenção com área proporcional e nota do perímetro |
| Estrutura sem valor: organograma, taxonomia | 07 Árvore e dendrograma | Arestas mostram pertencimento, não tamanho |
| Agrupamento em que o tamanho só precisa ser aproximado | 08 Circle packing | Contenção lê bem; área de círculo lê mal |
| Menos de 6 partes, ou comparação precisa | Nenhum desta família | Barras ordenadas (família 02) leem melhor |

## Regras transversais

1. No máximo 3 níveis rotulados de uma vez; mais que isso pede detalhamento por clique.
2. Cor por ancestral de primeiro nível com luminosidade por profundidade, ou cor por métrica; nunca as duas no mesmo visual.
3. Valores menores ou iguais a zero ficam fora do desenho e aparecem numa lista fora do gráfico, com o motivo. Negativo vai para a cor, nunca para a área.
4. Rótulo só onde cabe (cerca de 40 por 20 px para uma linha, 64 por 36 px para nome e valor, 48 px de largura no icicle); o resto vai para o tooltip.
5. Trilha de navegação sempre visível quando houver detalhamento, e volta à raiz quando o filtro global remove o ramo aberto.
6. Filhos que não somam o pai ganham um filho não classificado com a diferença, em neutro hachurado, com aviso de reconciliação.
7. Raio de círculo pela raiz quadrada do valor; quadrado de perímetro com lado pela raiz quadrada do valor.
8. Alternativa acessível em toda versão: tabela em árvore com recuo (família 14, modelo 07).
9. Tema escuro: sobrescrever os padrões do Recharts que assumem fundo claro (`fill` #333 e `stroke` #FFF no `SunburstChart`) por tokens do Farol.

## Quando procurar outra família

| Situação | Vá para | Motivo |
|---|---|---|
| Largura e altura codificam duas variáveis diferentes | [26_mosaico-marimekko, modelo 01](../26_mosaico-marimekko/) | Marimekko não é hierarquia, é cruzamento de duas dimensões |
| Dois anéis que comparam composições (dois períodos) sem pai e filho | [07_rosca-e-radial, modelo 03](../07_rosca-e-radial/) | Anéis concêntricos sem hierarquia real |
| Leitura de consulta, com números, ou alternativa acessível | [14_tabelas-visuais, modelo 07](../14_tabelas-visuais/) | Tabela em árvore com recuo e subtotais |
| Arestas que cruzam ramos diferentes | [27_rede-e-relacoes](../27_rede-e-relacoes/) | Deixa de ser hierarquia e vira grafo |
| Perímetro desenhado sobre território | [23_mapas, modelo 05](../23_mapas/) | Mapa de perímetro geográfico |
| Parte do todo sem aninhamento, em unidades | [22_unidades-waffle-e-pictograma](../22_unidades-waffle-e-pictograma/) | Waffle e grade de unidades |
| Um nível de composição só | [02_barras-horizontais](../02_barras-horizontais/) | Barras empilhadas 100% ou barras ordenadas |
| Bolhas soltas sem contenção | [09_dispersao-e-bolhas](../09_dispersao-e-bolhas/) | Sem hierarquia, o tamanho vira terceira variável |

## Referências

### Catálogos e documentação

| Referência | Modelos | O que observar |
|---|---|---|
| [Recharts, API Treemap](https://recharts.github.io/en-US/api/Treemap/) | 01, 02 | `aspectRatio`, `content`, `type="nest"` e `nestIndexContent` para detalhamento |
| [Recharts, exemplo de Treemap](https://recharts-recharts.mintlify.app/examples/treemap) | 01 | Conteúdo customizado que só escreve rótulo acima de tamanho mínimo |
| [Recharts, API SunburstChart](https://recharts.github.io/en-US/api/SunburstChart/) | 03 | `innerRadius`, `ringPadding`, `textOptions` e dado com `children` |
| [Recharts, Two Level Pie Chart](https://recharts.github.io/en-US/examples/TwoLevelPieChart/) | 03 | Raios relativos da rosca aninhada de dois níveis |
| [From Data to Viz, Treemap](https://www.data-to-viz.com/graph/treemap.html) | 01, 02 | Priorizar o nível mais alto e não anotar mais de 3 níveis |
| [From Data to Viz, Sunburst](https://www.data-to-viz.com/graph/sunburst.html) | 03 | Dificuldade de rótulo e distorção dos anéis externos |
| [From Data to Viz, Circular Packing](https://www.data-to-viz.com/graph/circularpacking.html) | 05, 08 | Remover os primeiros níveis melhora a leitura; um nível só vira barra |
| [From Data to Viz, Dendrogram](https://www.data-to-viz.com/graph/dendrogram.html) | 07 | Horizontal para rótulos longos e circular para economizar espaço |
| [Data Visualisation Catalogue, Treemap](https://datavizcatalogue.com/methods/treemap.html) | 01, 02 | Força em espaço e fraqueza em distinguir níveis |
| [Data Visualisation Catalogue, Sunburst Diagram](https://datavizcatalogue.com/methods/sunburst_diagram.html) | 03 | Hierarquia e parte do todo em anéis |
| [Data Visualisation Catalogue, Circle Packing](https://datavizcatalogue.com/methods/circle_packing.html) | 05, 08 | Contenção como nível hierárquico e baixa eficiência de espaço |
| [Data Visualisation Catalogue, Tree Diagram](https://datavizcatalogue.com/methods/tree_diagram.html) | 04, 07 | Raiz, ramos e folhas; organograma como método relacionado |
| [AG Charts, Treemap Series](https://www.ag-grid.com/charts/javascript/treemap-series/) | 01, 02 | Cabeçalho de grupo, espaçamentos e `colorScale` em faixas com domínio fixo |
| [AG Charts, Sunburst Series](https://www.ag-grid.com/charts/javascript/sunburst-series/) | 03 | Espaço entre setores e tamanho mínimo de fonte |
| [AG Charts, multiple donut charts](https://www.ag-grid.com/charts/gallery/multiple-donuts/) | 03 | Agregação no anel interno e detalhe no externo |
| [Highcharts, Treemap](https://www.highcharts.com/docs/chart-and-series-types/treemap) | 01 | Trilha automática, `colorAxis` por ponto e agrupamento de nós pequenos |
| [Highcharts, Sunburst (docs)](https://www.highcharts.com/docs/chart-and-series-types/sunburst-series) | 03 | `allowTraversingTree` e `levelIsConstant` ao detalhar |
| [Highcharts, Sunburst (demo)](https://www.highcharts.com/demo/highcharts/sunburst) | 03 | Demo oficial, renderizada por JavaScript |
| [Highcharts, pizza](https://www.highcharts.com/docs/chart-and-series-types/pie-chart) | 03 | Rosca montada com várias séries de tamanhos diferentes |
| [Apache ECharts, Show Parent Labels](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/treemap-show-parent.ts) | 02 | Rótulo de pai por nível e bordas mais grossas no nível intermediário |
| [Apache ECharts, Sunburst Label Rotate](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sunburst-label-rotate.ts) | 03 | Rótulo radial, tangencial ou em ângulo fixo por nível |
| [Apache ECharts, Treemap e Sunburst em transição](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/treemap-sunburst-transition.ts) | 01, 03 | O mesmo dado alternando entre as duas formas |
| [Apache ECharts, Flame graph](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/flame-graph.ts) | 06 | Retângulo por nível com largura pelo valor |
| [Apache ECharts, Radial Tree](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/tree-radial.ts) | 07 | Layout radial com profundidade inicial limitada |
| [nivo, TreeMap](https://nivo.rocks/treemap/) | 02 | Algoritmos squarify, binary, dice e slice; rótulo de pai |
| [nivo, Sunburst](https://nivo.rocks/sunburst/) | 03 | Receitas de detalhamento e métrica central |
| [nivo, Icicle](https://nivo.rocks/icicle/) | 06 | Quatro orientações, zoom por clique e navegação por teclado |
| [nivo, CirclePacking](https://nivo.rocks/circle-packing/) | 08 | `padding`, `leavesOnly`, zoom e cor por filho |
| [nivo, Tree](https://nivo.rocks/tree/) | 07 | Árvore ou dendrograma, curva da aresta e destaque de ancestrais |
| [Vega, Tree Layout](https://vega.github.io/vega/examples/tree-layout/) | 04, 07 | Alternância tidy e cluster e quatro estilos de aresta |
| [Vega, Circle Packing](https://vega.github.io/vega/examples/circle-packing/) | 08 | Área proporcional e cor por profundidade |
| [visx, sandbox treemap](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-treemap) | 01, 02 | Geometria de treemap em React, só como leitura de algoritmo |
| [visx, sandbox pack](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-pack) | 08 | Geometria de empacotamento em React, só como leitura de algoritmo |
| [RAWGraphs, Treemap Voronoi](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/voronoitreemap) | 02 | Implementação de referência do Voronoi, que este catálogo não adota |
| [RAWGraphs, Circular dendrogram](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/circularDendrogram) | 07 | Implementação de referência da árvore radial |
| [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) | 01, 02 | Treemap e Voronoi listados em parte do todo |

As bibliotecas nivo, visx, ECharts, Highcharts, AG Charts e Vega servem só como referência de desenho e de algoritmo; nenhuma entra no Farol.

### Praticantes

| Referência | Modelos | O que observar |
|---|---|---|
| [Ben Shneiderman, história do treemap](https://www.cs.umd.edu/hcil/treemap-history/) | 01, 02 | Slice and dice, squarified e ordered: proporção contra preservação da ordem |
| [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide) | 01 | Treemap é menos fácil de ler; a cor pede legenda explícita |
| [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf) | 03, 05, 07, 08 | Ângulo e área são leituras grosseiras; quadrados alinhados comparam melhor |
| [Stephen Few, Save the Pies for Dessert](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf) | 03 | Crítica ao gráfico de dois níveis que tenta comparar subcategoria entre pais |
| [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/) | 03 | Organizar do centro para fora e agrupar cores quentes e frias por lado |

### Portais de design

| Referência | Modelos | O que observar |
|---|---|---|
| [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options) | todos | Cinco formas para a mesma hierarquia de dois níveis, escolhidas pela legibilidade |
| [Behance, UK's Public Sector Expenditure in One Treemap Chart](https://www.behance.net/gallery/193257421/UKs-Public-Sector-Expenditure-in-One-Treemap-Chart) | 01 | Gasto por área com destaque para um item novo |
| [Behance, Portfolio Heatmaps](https://www.behance.net/gallery/244707007/Portfolio-Heatmaps-Where-Data-Meets-Clarity-) | 01 | Blocos com percentual, valor e seta; verde para alta, vermelho para queda, neutro para estável |
| [Behance, Treemap](https://www.behance.net/gallery/199328709/Treemap) | 01 | Esquema de cor que decompõe a evolução ao longo de 25 anos |
| [Behance, SunBurst Chart in Tableau](https://www.behance.net/gallery/122211681/SunBurst-Chart-in-Tableau) | 03 | Sunburst em ferramenta de BI, sem descrição textual do visual |
| [Behance, busca treemap](https://www.behance.net/search/projects/treemap) | 01, 02 | Varredura de tratamentos de cabeçalho de grupo |
| [Behance, busca sunburst chart](https://www.behance.net/search/projects/sunburst%20chart) | 03 | Varredura de sunburst |
| [Behance, busca icicle chart](https://www.behance.net/search/projects/icicle%20chart) | 06 | Sem resultado específico de icicle, registrado como lacuna |
| [Dribbble, Treemap chart template](https://dribbble.com/shots/13754237-Treemap-chart-template-Figma-infographics-Ui-kit) | 01 | Retângulos aninhados em que o maior representa o maior valor (vale pelo trecho da busca) |
| [Dribbble, Figma Charts UI kit, Treemap](https://dribbble.com/shots/14711133-Figma-Charts-UI-kit-Treemap-data-visualization) | 01 | Treemap de kit de gráficos; a página não abriu, conferir antes de adotar |
| [Dribbble, Sunburst graph as infographics](https://dribbble.com/shots/20223141-Charts-UI-design-Figma-templates-Sunburst-graph-as-infographics) | 03 | Sunburst do mesmo kit; a página não abriu, conferir antes de adotar |

Lacunas registradas nos estudos: nenhum portal de design específico para detalhamento, árvore de indicadores, perímetro aninhado, árvore e dendrograma ou circle packing; nenhum praticante localizado para icicle, árvore e árvore de indicadores. Estudo de origem: `_estudo/familias/12_hierarquia.md`, com a seção da família em `_estudo/00_portais-de-design.md`.
