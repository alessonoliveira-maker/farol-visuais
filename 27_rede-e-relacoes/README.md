# Rede e relações

Quem se liga a quem, com que força e com que estrutura. Aqui a mensagem é a relação entre entidades, não o volume que flui de uma etapa para outra (família 11) nem o pertencimento de pai para filho (família 12). A família cobre a matriz de adjacência, que é também a alternativa acessível de todas as outras formas; o grafo bipartido entre dois tipos de entidade; o grafo em grade, com nós presos a duas categorias; o grafo livre dirigido por forças; o arc diagram num eixo único; o grafo radial e circular (inclusive o chord sem fita); o chord simétrico com fitas de peso; e o hierarchical edge bundling, para ligações entre folhas de uma hierarquia.

> Catálogo montado em 2026-09-14 a partir de [`_estudo/familias/27_rede-e-relacoes.md`](../_estudo/familias/27_rede-e-relacoes.md) e da seção 27 de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). Plano das versões em [`_estudo/catalogo/27_rede-e-relacoes.json`](../_estudo/catalogo/27_rede-e-relacoes.json). Todo caso de uso usa dado fictício do Farol: clientes, parceiros e pessoas aparecem só como códigos (C01, P07, SDR 1, Executivo A).

## O que a família responde

Duas propriedades do dado decidem o modelo antes de qualquer gosto: a rede é **dirigida ou não** (indicação de A para B, ou coocorrência entre A e B) e é **ponderada ou não** (quantas vezes, quanto valor, ou só existe ligação). O problema central da família tem nome, **hairball**: o emaranhado de muitas ligações sem padrão. Cada modelo é uma forma de evitá-lo: reduzir nós, ordenar bem, trocar a posição livre por eixo (arco), por grade (matriz e grafo em grade) ou por círculo (radial e chord), ou agrupar arestas (bundling).

Perguntas típicas no Farol:

- **Comercial:** quem são os clientes que mais indicam, e as indicações formam grupos? Quais produtos aparecem juntos na mesma carteira? Quais motivos de perda são registrados juntos?
- **Pré-vendas:** como os handoffs se distribuem entre SDRs e executivos; há concentração em poucos pares? Em que passagem do processo o SLA estoura?
- **Marketing:** quais origens aparecem juntas na jornada do mesmo lead (coocorrência de toques)?
- **Diretoria:** de quais fontes de dado cada indicador depende (procedência); quais indicadores caem se uma fonte parar; qual indicador não tem fonte declarada?

Regras que valem para todos os modelos:

1. **Layout determinístico.** Mesma entrada, mesmo desenho: semente fixa no PRNG, geometria em `useMemo`, nenhuma animação de simulação na tela.
2. **Corte antes de desenhar.** Filtro de peso mínimo e limite de nós; o total omitido aparece escrito ("236 ligações fracas ocultas").
3. **A ordem é a informação.** Matriz, arco, bipartido e círculo são ordenados por grupo e grau, ou por baricentro; nunca em ordem alfabética sem motivo. A ordem padrão é declarada.
4. **Foco por vizinhança.** Hover acende a vizinhança e esmaece o resto; clique fixa a seleção. No render estático, a prop `highlightId` faz o mesmo papel. Adjacência pré-calculada em `Map<string, Set<string>>`.
5. **Rótulo só no que importa.** Nós de grau ou peso acima de um corte levam rótulo; o resto vai para a dica.
6. **Cor por papel.** Destaque em `var(--chart-1)`, neutro de dado em `var(--line-strong)`, arestas de fundo em `var(--text-muted)` com opacidade baixa, intensidade em `var(--seq-N)`, alerta em `var(--negative)` sempre com ícone ou texto. Até 6 grupos coloridos; do sétimo em diante, "Outros (n=X)".
7. **Sem ligação não é sem dado.** Nó isolado fica visível, com contorno `var(--text-muted)` e "0 relações" escrito; par sem medição é hachurado e tem item próprio na legenda.
8. **Alternativa acessível obrigatória.** Lista de ligações (origem, destino, peso) ou matriz de adjacência. Em 400 px, grafo livre, radial e chord cedem lugar à lista ordenada de pares.

## Modelos

As pastas de modelo são criadas pelos produtores das versões; os links abaixo apontam para onde elas vão morar.

| # | Modelo | Abordagem na stack | O que responde | Versões planejadas |
|---|---|---|---|---|
| 01 | [Matriz de adjacência](./01_matriz-de-adjacencia/) | `html-tailwind` | Intensidade de cada par numa rede densa, sem cruzamento de aresta; alternativa acessível da família. | `v1_coocorrencia-de-origens-na-jornada`, `v2_handoff-sdr-por-executivo`, `v3_motivos-de-perda-que-andam-juntos`, `v4_matriz-esparsa-e-par-sem-medicao` |
| 02 | [Grafo bipartido](./02_grafo-bipartido/) | `svg-puro` | Quem se relaciona com quem entre dois tipos de entidade, e onde a relação se concentra. | `v1_handoffs-sdr-para-executivo`, `v2_concentracao-do-sdr-selecionado`, `v3_clientes-e-produtos-na-carteira`, `v4_executivo-sem-repasse` |
| 03 | [Grafo em grade](./03_grafo-em-grade/) | `svg-puro` | Quem passa para quem quando os nós já têm função e etapa, e onde falta responsável. | `v1_handoff-por-funcao-e-etapa`, `v2_handoffs-com-sla-estourado`, `v3_filas-de-pre-vendas-com-pilha`, `v4_etapa-sem-responsavel` |
| 04 | [Grafo de rede dirigido por forças](./04_grafo-de-rede-por-forcas/) | `svg-puro` | Grupos, pontes e periferia de uma rede sem ordem natural, até cerca de 150 nós. | `v1_rede-de-indicacoes-entre-clientes`, `v2_clientes-que-mais-indicam`, `v3_coocorrencia-de-produto-em-180-contas`, `v4_clientes-sem-nenhuma-indicacao` |
| 05 | [Arc diagram](./05_arc-diagram/) | `svg-puro` | Coocorrência ou dependência num eixo único, com o nome de cada nó legível. | `v1_coocorrencia-de-origens-em-2026-08`, `v2_procedencia-indicadores-e-fontes`, `v3_dependencia-dirigida-entre-indicadores`, `v4_indicador-sem-fonte-declarada` |
| 06 | [Grafo radial e circular](./06_grafo-radial-e-circular/) | `svg-puro` | Alcance de uma entidade em anéis, ou todos os nós num círculo, inclusive como chord sem fita. | `v1_egocentrica-parceiro-de-indicacao`, `v2_circular-coocorrencia-de-origens`, `v3_equipes-que-compartilham-oportunidades`, `v4_parceiro-sem-indicacao-no-periodo` |
| 07 | [Chord simétrico de relação](./07_chord-simetrico/) | `svg-puro` | Força da coocorrência entre até 6 grupos, com o total de cada grupo no arco. | `v1_produtos-na-mesma-carteira`, `v2_produto-mais-associado-ao-credito-estruturado`, `v3_clientes-com-um-produto-so`, `v4_origens-demais-agrupadas-em-outros` |
| 08 | [Hierarchical edge bundling](./08_hierarchical-edge-bundling/) | `svg-puro` | Ligações entre folhas de uma hierarquia, agrupadas em feixes pela rota do pai. | `v1_procedencia-fontes-e-indicadores`, `v2_indicadores-que-caem-sem-o-formulario`, `v3_dependencia-dentro-do-mesmo-dashboard`, `v4_tensao-baixa-e-alta-lado-a-lado` |

Variações absorvidas como versão: a matriz de pares da família 25 (25#23) entrou no modelo 01, e as versões dela viraram `v2_handoff-sdr-por-executivo`, `v3_motivos-de-perda-que-andam-juntos` e `v4_matriz-esparsa-e-par-sem-medicao`; o chord sem fita (27#7) entrou no modelo 06 como `v3_equipes-que-compartilham-oportunidades`.

Três ajustes em relação ao estudo, para seguir o [CONTRATO](../CONTRATO.md): o destaque sai em `var(--chart-1)` e não em `--accent-amber` (seção 17.2, um destaque por visual); o grafo em grade desenha grade e arestas no mesmo `viewBox` em vez de medir células com `ResizeObserver` (seção 5); e o grafo por forças segue o estudo, com Fruchterman e Reingold escrito em TypeScript, apesar de a varredura de portais dizer que simulação de força exigiria biblioteca.

## Quando a família serve

- A pergunta é sobre a relação entre entidades (indicação, coocorrência, repasse, dependência), não sobre a quantidade que flui.
- A estrutura da rede muda a decisão: concentração em poucos pares, grupos, pontes, entidade isolada.
- Há procedência a mostrar: de que fonte cada indicador depende e o que cai se ela parar.
- A ausência de ligação é achado: executivo sem repasse, etapa sem responsável, indicador sem fonte declarada.

## Quando procurar outra família

- A pergunta é quanto volume foi de A para B, com ou sem perda no caminho: fluxo (família 11).
- A relação é só de pai para filho, sem ligação cruzada entre ramos: hierarquia (família 12).
- A matriz mostra movimento entre etapas com diagonal de permanência, ou só intensidade entre duas categorias: mapa de calor (família 15).
- A posição do nó é geográfica: mapas (família 23).
- A sobreposição de públicos é parte do todo, não rede: famílias 22, 25 ou 26.

A tabela completa, com o modelo de destino de cada caso, está em Referências cruzadas, mais abaixo.

## Guia rápido: qual modelo escolher

1. **A pergunta é quanto volume foi de A para B?** Não é desta família: vá para o sankey ([11/01](../11_fluxo-sankey/01_sankey-simples/)) ou para o chord direcional ([11/05](../11_fluxo-sankey/05_chord-direcional-de-fluxo/)).
2. **É pertencimento de pai para filho, sem ligação cruzada?** Vá para a árvore e dendrograma ([12/07](../12_hierarquia/07_arvore-e-dendrograma/)).
3. **Precisa do valor exato de cada par, a rede é densa (mais de cerca de 40 nós ou ligações quase completas) ou falta a alternativa acessível?** Use a **01_matriz-de-adjacencia**. Ela também é a visão móvel das outras.
4. **As entidades são folhas de uma hierarquia real** (fonte por sistema, indicador por dashboard) com dezenas de ligações? Use o **08_hierarchical-edge-bundling**.
5. **Os nós já têm duas categorias** (função e etapa) e a seta de quem passa para quem importa? Use o **03_grafo-em-grade**.
6. **São dois tipos de entidade** com ligação só entre eles (SDR e executivo, cliente e produto)? Use o **02_grafo-bipartido**.
7. **A rede gira em torno de uma entidade**, ou a relação é binária e cabe num círculo? Use o **06_grafo-radial-e-circular** (egocêntrica ou circular, inclusive o chord sem fita).
8. **É coocorrência com peso entre até 6 grupos**, e o total de cada grupo importa? Use o **07_chord-simetrico**, com a nota de como ler e a alternância para a matriz.
9. **Os nomes precisam ser legíveis e há uma ordem natural** (dashboard, volume), com até 40 nós? Use o **05_arc-diagram**.
10. **Nada acima, e a mensagem é a forma da rede** (grupos, pontes, periferia) em até cerca de 150 nós? Use o **04_grafo-de-rede-por-forcas**, com semente fixa e filtro de peso.

Atalhos por pergunta:

| Pergunta no Farol | Modelo e versão |
|---|---|
| Quais origens aparecem juntas na jornada do lead? | `01_matriz-de-adjacencia/v1_coocorrencia-de-origens-na-jornada` |
| Para quais executivos cada SDR repassa, com valor exato? | `01_matriz-de-adjacencia/v2_handoff-sdr-por-executivo` |
| Quais motivos de perda são registrados juntos? | `01_matriz-de-adjacencia/v3_motivos-de-perda-que-andam-juntos` |
| Os repasses do SDR se concentram em poucos executivos? | `02_grafo-bipartido/v2_concentracao-do-sdr-selecionado` |
| Algum executivo ficou sem repasse no trimestre? | `02_grafo-bipartido/v4_executivo-sem-repasse` |
| Quem passa a oportunidade para quem em cada etapa? | `03_grafo-em-grade/v1_handoff-por-funcao-e-etapa` |
| Em que passagem do processo o SLA estoura? | `03_grafo-em-grade/v2_handoffs-com-sla-estourado` |
| Qual etapa não tem responsável definido? | `03_grafo-em-grade/v4_etapa-sem-responsavel` |
| As indicações entre clientes formam grupos? | `04_grafo-de-rede-por-forcas/v1_rede-de-indicacoes-entre-clientes` |
| Quem são os clientes que mais indicam? | `04_grafo-de-rede-por-forcas/v2_clientes-que-mais-indicam` |
| Quais indicadores caem se uma fonte parar (até 40 nós)? | `05_arc-diagram/v2_procedencia-indicadores-e-fontes` |
| Qual indicador não tem fonte declarada? | `05_arc-diagram/v4_indicador-sem-fonte-declarada` |
| Quanto um parceiro trouxe, direta e indiretamente? | `06_grafo-radial-e-circular/v1_egocentrica-parceiro-de-indicacao` |
| Quais equipes nunca dividiram oportunidade? | `06_grafo-radial-e-circular/v3_equipes-que-compartilham-oportunidades` |
| Quais produtos convivem na mesma carteira? | `07_chord-simetrico/v1_produtos-na-mesma-carteira` |
| Quanto de cada produto está em cliente de um produto só? | `07_chord-simetrico/v3_clientes-com-um-produto-so` |
| Quais dos 40 indicadores dependem do formulário do site? | `08_hierarchical-edge-bundling/v2_indicadores-que-caem-sem-o-formulario` |

## Referências cruzadas

Formas vizinhas que o estudo mandou para outra família, e as duas variações que outras famílias mandaram para cá. A regra de corte é a mesma do começo: se a mensagem é volume que flui, pertencimento ou posição geográfica, a rede não é o modelo.

| Assunto | Onde mora | Por quê |
|---|---|---|
| Chord direcional de fluxo (dependency wheel) | [11/05 Chord direcional de fluxo](../11_fluxo-sankey/05_chord-direcional-de-fluxo/) | Volume com sentido de A para B. O [07 chord simétrico](./07_chord-simetrico/) usa a mesma geometria, mas com matriz simétrica e as duas pontas da fita iguais. |
| Sankey bipartido de volume | [11/01 Sankey simples de duas colunas](../11_fluxo-sankey/01_sankey-simples/) | A pergunta é quanto foi de A para B. Quando é quem se relaciona com quem e com que frequência, fica o [02 grafo bipartido](./02_grafo-bipartido/). |
| Várias camadas encadeadas com perda | [11/02 Sankey multietapa com perdas](../11_fluxo-sankey/02_sankey-multietapa/) | Volume que atravessa etapas e sai do funil; o [03 grafo em grade](./03_grafo-em-grade/) só mostra quem passa para quem. |
| Árvore, dendrograma e organograma | [12/07 Árvore e dendrograma](../12_hierarquia/07_arvore-e-dendrograma/) | Pertencimento de pai para filho, sem aresta cruzada. O [08 edge bundling](./08_hierarchical-edge-bundling/) reaproveita o layout radial de lá para posicionar as folhas. |
| Transição com cor, de-para e confusão | [15/07 Matriz de transição, de-para e confusão](../15_mapa-de-calor-e-calendario/07_matriz-de-transicao/) | Movimento de uma etapa para outra com diagonal de permanência é mapa de calor, não leitura de rede. |
| Duas categorias só com intensidade | [15/02 Matriz categórica em cor](../15_mapa-de-calor-e-calendario/02_matriz-categorica/) | Sem grupos, pontes ou ordenação por baricentro, a [01 matriz de adjacência](./01_matriz-de-adjacencia/) vira matriz categórica. |
| Responsável por etapa, sem seta | [25/07 Matriz de responsabilidade (RACI)](../25_matriz-e-quadrantes/07_matriz-raci/) | Papel em cada etapa sem passagem entre funções; com seta de quem passa para quem, é o [03 grafo em grade](./03_grafo-em-grade/). |
| Sobreposição de públicos (Venn ou Euler) | [22_unidades-waffle-e-pictograma](../22_unidades-waffle-e-pictograma/) ou [26_mosaico-marimekko](../26_mosaico-marimekko/); com muitas combinações, [25/04 Matriz de cobertura binária](../25_matriz-e-quadrantes/04_matriz-de-cobertura-binaria/) | O FT Visual Vocabulary classifica como parte do todo; não é rede. |
| Conexões geográficas | [23_mapas](../23_mapas/) | A posição é geográfica. Atenção: nenhum dos seis modelos de 23 desenha ligação entre pontos, e o catálogo de 23 devolve esse caso para cá; hoje a lacuna fica aberta. |
| Dependência entre tarefas no tempo | [20_cronograma-e-linha-do-tempo](../20_cronograma-e-linha-do-tempo/) | Predecessora e sucessora com data pertencem ao cronograma; sem tempo, voltam para o [05 arc diagram](./05_arc-diagram/). |
| Matriz de pares (25#23) | Absorvida no [01 matriz de adjacência](./01_matriz-de-adjacencia/) | Entidades contra entidades, com a ordem por agrupamento revelando bloco; virou as versões v2, v3 e v4. |
| Chord sem fita (27#7) | Absorvido no [06 grafo radial e circular](./06_grafo-radial-e-circular/) | É a circular com linhas finas de espessura única; virou a versão v3. |

## Referências

Todos os links vêm do estudo da família e da varredura de portais (`_estudo/00_portais-de-design.md`). Bibliotecas como nivo, visx, Highcharts, ECharts, AG Charts e Vega aparecem só como leitura de geometria e de API: nenhuma entra na stack do Farol, que desenha a família em SVG puro ou HTML com Tailwind.

### Método e definição da família

- [From Data to Viz, Network](https://www.data-to-viz.com/graph/network.html): observar a divisão em dirigida ou não e ponderada ou não, o nome hairball para o emaranhado, o layout como decisão de legibilidade e a sugestão de sankey ou chord quando a rede é dirigida. Serve a toda a família.
- [Data Visualisation Catalogue, Network Diagram](https://datavizcatalogue.com/methods/network_diagram.html): observar a capacidade limitada de dados e como o diagrama vira emaranhado em escala.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar que a rede entra na categoria fluxo e que o Venn fica em parte do todo, o que justifica mandar a sobreposição de públicos para outra família.
- [Vega, galeria de exemplos](https://vega.github.io/vega/examples/): observar arc diagram, matriz reordenável e edge bundling lado a lado, com as mesmas convenções de nó, peso e grupo.

### 01 Matriz de adjacência

- [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/): observar a mesma matriz ordenada por nome, por frequência e por grupo, e como só a ordem por grupo revela blocos e pontes.
- [Vega, Reorderable Matrix](https://vega.github.io/vega/examples/reorderable-matrix/): observar a matriz simétrica com reordenação por arraste e a matriz como base de leitura de rede.
- [RAWGraphs, Matrix Plot (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/matrixplot): observar a implementação de referência em grade.
- [Apache ECharts, Graph Chart in Matrix](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/matrix-graph.ts): observar o sistema de coordenadas em matriz, que também é a base do 03.

### 02 Grafo bipartido

- [From Data to Viz, Chord](https://www.data-to-viz.com/graph/chord.html): observar o caso bipartido, com ligações só entre categorias.
- [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): observar a ordenação das categorias como o que decide a leitura em redes categóricas, base do baricentro.
- [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options): observar a comparação de formas para um dado de dois níveis e a escolha pela legibilidade.

### 03 Grafo em grade

- [Apache ECharts, Graph Chart in Matrix](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/matrix-graph.ts): observar os nós de disciplina por ano presos à matriz, com setas de pré-requisito entre células.
- [Vega, Reorderable Matrix](https://vega.github.io/vega/examples/reorderable-matrix/): observar a grade como leitura de rede, que o grafo em grade preserva.
- Praticante e portal de design: não localizados na pesquisa.

### 04 Grafo de rede dirigido por forças

- [Highcharts, Network graph (documentação)](https://www.highcharts.com/docs/chart-and-series-types/network-graph): observar Reingold e Fruchterman, `maxIterations` e a aproximação para muitos nós, que orientam o limite de 300 nós no navegador.
- [Highcharts, Network graph (demo)](https://www.highcharts.com/demo/highcharts/network-graph): demo oficial renderizada por JavaScript; a página abriu sem o desenho.
- [nivo, Network](https://nivo.rocks/network/): observar `linkDistance`, `centeringStrength`, `repulsivity` e o hook `useNetwork`, como vocabulário dos parâmetros da simulação.
- [visx, sandbox network](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-network): observar a renderização de nós e arestas em React.
- [Behance, Network Data Visualization](https://www.behance.net/gallery/102929797/Network-Data-Visualization): observar camadas de informação sobrepostas aos nós da mesma topologia.
- [Behance, Scholar Network Visualization System](https://www.behance.net/gallery/117386879/Scholar-Network-Visualization-System): observar o sistema de exploração com grafo dirigido por forças.

### 05 Arc diagram

- [From Data to Viz, Arc Diagram](https://www.data-to-viz.com/graph/arc.html): observar a ordem dos nós como fator crítico e a vantagem de rótulo legível sobre o grafo em duas dimensões.
- [Data Visualisation Catalogue, Arc Diagram](https://datavizcatalogue.com/methods/arc_diagram.html): observar que serve bem para coocorrência e piora com muitas ligações.
- [Vega, Arc Diagram](https://vega.github.io/vega/examples/arc-diagram/): observar o nó dimensionado pelo grau, a espessura pelo peso e a cor pelo grupo.
- [Highcharts, Arc diagram (demo)](https://www.highcharts.com/demo/highcharts/arc-diagram): demo oficial renderizada por JavaScript; a página abriu sem o desenho.
- [RAWGraphs, Arc Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/arcdiagram): observar a implementação de referência na categoria de redes.
- [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): observar que, com boa ordenação por frequência, grupos e pontes ficam fáceis de ver.
- [Behance, Arc Diagram](https://www.behance.net/gallery/215420457/Arc-Diagram): observar os arcos sobre linha numerada em fundo claro e escuro.

### 06 Grafo radial e circular

- [Apache ECharts, Les Miserables (circular layout)](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/graph-circular-layout.ts): observar `rotateLabel`, `curveness: 0.3` e a cor da linha pela origem, que viram a curva quadrática com controle no centro.
- [Data Visualisation Catalogue, Non-ribbon Chord Diagram](https://datavizcatalogue.com/methods/non_ribbon_chord_diagram.html): observar o chord só com nós e linhas, sem fitas, que é a versão v3.
- [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): observar o custo de orientação em arranjos circulares, motivo para oferecer a lista de pares.
- [Behance, busca "network graph visualization"](https://www.behance.net/search/projects/network%20graph%20visualization): varredura de layouts radiais e circulares, sem peça única escolhida.

### 07 Chord simétrico de relação

- [From Data to Viz, Chord](https://www.data-to-viz.com/graph/chord.html): observar o arranjo dos grupos, a remoção das ligações fracas e a necessidade de explicar como ler.
- [Data Visualisation Catalogue, Chord Diagram](https://datavizcatalogue.com/methods/chord_diagram.html): observar a comparação de semelhanças e o limite do excesso de conexões.
- [nivo, Chord](https://nivo.rocks/chord/): observar o dado em matriz, o `padAngle` e a opacidade ativa e inativa no foco.
- [AG Charts, Chord Series](https://www.ag-grid.com/charts/javascript/chord-series/): observar os estilos de nó e de fita e o parâmetro `tension`.
- [visx, sandbox chord](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-chord): observar a geometria de arco e fita escrita em React.
- [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): observar os três cuidados do chord: cruzamentos, ligações fracas e pistas para quem não conhece a forma.
- [Behance, Bilateral Migrations Inside The EU in 2020 (D3.js)](https://www.behance.net/gallery/137170789/Bilateral-Migrations-Inside-The-EU-in-2020-%28D3js%29): observar a ordenação por volume e a largura da fita como intensidade.

### 08 Hierarchical edge bundling

- [From Data to Viz, Hierarchical Edge Bundling](https://www.data-to-viz.com/graph/edge_bundling.html): observar a exigência de hierarquia real e a comparação com a versão de linhas retas.
- [Vega, Edge Bundling](https://vega.github.io/vega/examples/edge-bundling/): observar o controle deslizante de tensão e as duas cores de entrada e saída no foco, com as demais ligações em opacidade 0,2.
- Praticante e portal de design: não localizados na pesquisa.

### Portais de design

**Pouca referência:** quase nada em dashboard comercial; o material de portal é de pesquisa, jornalismo ou infraestrutura. A varredura de portais propôs SVG puro com layout radial ou em camadas, sem simulação de força; o catálogo manteve o 04 porque o estudo mostrou que Fruchterman e Reingold cabe em TypeScript com semente fixa. Nomes de designers e estúdios foram omitidos. As marcas **[aberto]** e **[busca]** seguem a regra de proveniência da varredura: **[busca]** não foi aberto, e a qualidade visual não foi conferida.

- [Behance, Network Data Visualization](https://www.behance.net/gallery/102929797/Network-Data-Visualization) **[aberto]**: observar a rede de vias com atributos sobrepostos aos nós, várias camadas sobre a mesma topologia. Serve ao 04.
- [Behance, Collaboration Graph](https://www.behance.net/gallery/43680295/Collaboration-Graph) **[aberto]**: observar os padrões de colaboração dentro de empresas a partir de compartilhamento de arquivos; referência para a rede entre equipes do 06.
- [Dribbble, Graph Network UI](https://dribbble.com/shots/3224169-Graph-Network-UI) **[busca]**: observar o nó rotulado com agrupamento por atributo, útil para a cor por grupo do 04 e do 06.
- [Dribbble, Network Graph Data Visualization](https://dribbble.com/shots/25147704-Network-Graph-Data-Visualization) **[busca]**: grafo de rede como visualização de dados; olhar antes de adotar.
- [Figma Community, Network Diagram Template](https://www.figma.com/community/file/1100594710452335478/network-diagram-template) **[busca]**: modelo de diagrama de rede com componentes e conexões, só para rascunho; o Farol desenha em código.
- [Behance, busca "arc diagram data visualization"](https://www.behance.net/search/projects/arc%20diagram%20data%20visualization): varredura que levou à peça do 05.
- [Behance, busca "adjacency matrix"](https://www.behance.net/search/projects/adjacency%20matrix): devolveu identidade visual e nenhuma matriz de adjacência; o 01 fica sem referência de portal.

