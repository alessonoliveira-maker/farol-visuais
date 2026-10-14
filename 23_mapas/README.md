# Mapas

Onde: concentração regional, perímetro de atuação, contraste entre regiões e lacuna geográfica. O grão típico no Farol é a UF (27 unidades), às vezes a macrorregião (5). A família cobre o mapa de peso igual por UF (tiles quadrados ou hexagonais), o contorno real pintado por taxa (inclusive bivariado), a magnitude absoluta em símbolos (sobre a malha, em grade ou em cartograma de Dorling), a tendência por UF em pequenos múltiplos geográficos, o perímetro que dá sentido a um número e a localização de itens individuais em pontos.

> Catálogo montado em 2026-09-14 a partir de [`_estudo/familias/23_mapas.md`](../_estudo/familias/23_mapas.md) e da seção 23 de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). Plano das versões em [`_estudo/catalogo/23_mapas.json`](../_estudo/catalogo/23_mapas.json). Todo caso de uso usa dado fictício do Farol; a geografia (UFs e regiões do Brasil) é pública.

## O que a família responde

Pergunta de corte antes de escolher um mapa: **a posição geográfica muda a leitura?** Se a pergunta é só "qual UF é maior", barras respondem melhor. Mapa entra quando vizinhança, região ou perímetro fazem parte da resposta.

Perguntas típicas no Farol:

- **Comercial:** onde está a receita reconhecida e onde estão as oportunidades abertas? Onde a carteira cresceu ou encolheu no trimestre?
- **Pré-vendas:** de que UFs vêm as entradas da semana e onde a fila está acumulando?
- **Marketing:** quantos leads e qual CPL qualificado por UF; quantos leads chegaram sem UF ou sem município preenchido?
- **Diretoria:** qual a participação de mercado por UF dentro do perímetro de atuação, e o que muda se o perímetro crescer?

Regras que valem para todos os modelos:

1. **Geometria como constante.** Um único script de build baixa a malha do IBGE, os centroides e as grades de tiles e grava `ufPaths.ts`, `regiaoPaths.ts`, `ufCentroides.ts` e `gradesUf.ts` com URL e data de captura em comentário. Nada é baixado em runtime; nenhuma dependência nova (sem d3-geo, topojson, Leaflet).
2. **Normalização.** Coroplético e tiles com taxa; símbolos e pontos com total ou contagem. O título diz qual é.
3. **Classes e cor.** De 3 a 7 classes, rampa `var(--seq-N)` ou divergente com `var(--positive)` e `var(--negative)`, sempre por token. No tema escuro, valor baixo perto do fundo e valor alto mais luminoso.
4. **Sem dado não é zero.** Hachura e item próprio na legenda para ausência; zero medido é desenhado e escrito como 0.
5. **Área, não raio.** Todo símbolo proporcional usa a raiz quadrada no raio.
6. **Cobertura fora do mapa.** Registro sem UF ou sem município não vai para o centroide: fica num card com contagem e percentual.
7. **Contorno fino.** Dentro do grupo `scale(0.0001, -0.0001)` da malha, todo traço leva `vectorEffect="non-scaling-stroke"`.
8. **Alternativa tabular.** Toda visão de mapa tem tabela ou lista sincronizada com os mesmos valores, o que também resolve DF, SE, AL, RN, PB, ES e RJ, difíceis de apontar.

## Modelos

As pastas de modelo são criadas pelos produtores das versões; os links abaixo apontam para onde elas vão morar.

| # | Modelo | Abordagem na stack | O que responde | Versões planejadas |
|---|---|---|---|---|
| 01 | [Tile grid map por UF](./01_tile-grid-por-uf/) | `html-tailwind` | Taxa por UF com peso visual igual para as 27, em tiles quadrados ou hexagonais. | `v1_taxa-de-qualificacao-por-uf`, `v2_ufs-acima-da-meta-com-ranking`, `v3_hexagonal-cpl-qualificado-por-plataforma`, `v4_leads-sem-uf-e-ufs-sem-dado` |
| 02 | [Coroplético por UF](./02_coropletico-por-uf/) | `svg-puro` | Taxa por UF ou região com contorno real; relação entre duas taxas no bivariado. | `v1_taxa-de-qualificacao-sequencial`, `v2_desvio-da-media-nacional`, `v3_macrorregiao-com-drill-para-uf`, `v4_bivariado-com-variavel-ausente` |
| 03 | [Símbolos proporcionais](./03_simbolos-proporcionais/) | `svg-puro` | Total absoluto por UF sem viés de área, na malha, em grade ou em Dorling. | `v1_clientes-ativos-no-centroide`, `v2_bolhas-em-grade-realizado-contra-meta`, `v3_dorling-receita-2025-e-2026`, `v4_saldo-de-clientes-negativo-e-zero` |
| 04 | [Tile map com mini gráfico por UF](./04_tile-map-com-mini-grafico/) | `html-tailwind` | Tendência ou composição de cada UF mantendo a geografia. | `v1_leads-mensais-por-uf-escala-compartilhada`, `v2_tendencia-dos-ultimos-tres-meses`, `v3_receita-por-produto-no-perimetro`, `v4_escala-propria-para-ufs-pequenas` |
| 05 | [Mapa de perímetro e localizador](./05_mapa-de-perimetro-e-localizador/) | `svg-puro` | A que recorte geográfico um número se refere, e o que muda com a expansão ou a troca do perímetro. | `v1_miniatura-ao-lado-do-card-de-participacao`, `v2_participacao-so-dentro-do-perimetro`, `v3_perimetro-atual-e-expansao-proposta`, `v4_perimetro-que-mudou-de-vigencia` |
| 06 | [Mapa de pontos](./06_mapa-de-pontos/) | `svg-puro` | Onde estão itens individuais, sua densidade e o que fica sem coordenada. | `v1_eventos-presenciais-por-cidade`, `v2_raio-de-atuacao-dos-escritorios`, `v3_um-ponto-a-cada-cinco-leads-por-origem`, `v4_leads-sem-municipio-fora-do-mapa` |

Variações do estudo absorvidas como versão: o tile grid hexagonal (23#2) entrou no modelo 01 como `v3`; o coroplético bivariado (23#8) entrou no modelo 02 como `v4`; as bolhas por UF em grade (23#4) e o cartograma de Dorling (23#9) entraram no modelo 03 como `v2` e `v3`. As bolhas em grade saem em SVG puro, e não no `ScatterChart` do Recharts sugerido no estudo, para seguir a abordagem do modelo; o `ZAxis range` do Recharts continua valendo como referência.

## Quando a família serve

- A vizinhança, a região ou o perímetro fazem parte da resposta, não só a ordem das UFs.
- O público reconhece o Brasil e precisa se localizar antes de ler o número.
- O número ao lado só vale para um recorte geográfico e isso precisa ficar visível.
- Há lacuna geográfica a mostrar: UFs sem dado, regiões sem evento, leads sem UF.

## Guia rápido: qual modelo escolher

1. **A posição geográfica não muda a leitura?** Não é desta família: vá para as barras ordenadas ([02/01](../02_barras-horizontais/01_barras-simples-ordenadas/)).
2. **O número ao lado vale só para um recorte geográfico** (participação de mercado, TAM, expansão)? Use o **05_mapa-de-perimetro-e-localizador**.
3. **Os itens têm coordenada ou município** (eventos, escritórios, clientes por cidade)? Use o **06_mapa-de-pontos**. Só com UF, siga adiante.
4. **É tendência ou composição de cada UF**, não um valor só? Use o **04_tile-map-com-mini-grafico**, declarando escala compartilhada ou própria.
5. **É total absoluto** (clientes, receita, oportunidades)? Use o **03_simbolos-proporcionais**: sobre a malha no caso geral, em grade quando o Nordeste oriental sobrepõe, em Dorling quando a magnitude deve dominar.
6. **É taxa e o contorno real ajuda a se localizar** (ou há espaço para tabela ao lado)? Use o **02_coropletico-por-uf**; para duas taxas, a versão bivariada.
7. **É taxa em cartão estreito, ou as UFs pequenas precisam pesar igual?** Use o **01_tile-grid-por-uf**; hexagonal quando a vizinhança entre regiões importa.

Atalhos por pergunta:

| Pergunta no Farol | Modelo e versão |
|---|---|
| Em que UFs os leads se qualificam mais? | `01_tile-grid-por-uf/v1_taxa-de-qualificacao-por-uf` |
| Quais UFs passaram da meta e onde ficam no ranking? | `01_tile-grid-por-uf/v2_ufs-acima-da-meta-com-ranking` |
| Quantos leads chegaram sem UF? | `01_tile-grid-por-uf/v4_leads-sem-uf-e-ufs-sem-dado` |
| Quais UFs ficam abaixo da média nacional de qualificação? | `02_coropletico-por-uf/v2_desvio-da-media-nacional` |
| Que região tem a maior receita média por cliente? | `02_coropletico-por-uf/v3_macrorregiao-com-drill-para-uf` |
| Onde CPL alto convive com qualificação baixa? | `02_coropletico-por-uf/v4_bivariado-com-variavel-ausente` |
| Onde estão os clientes ativos? | `03_simbolos-proporcionais/v1_clientes-ativos-no-centroide` |
| Em que UFs a receita do trimestre já cobre a meta? | `03_simbolos-proporcionais/v2_bolhas-em-grade-realizado-contra-meta` |
| Onde a carteira cresceu ou encolheu? | `03_simbolos-proporcionais/v4_saldo-de-clientes-negativo-e-zero` |
| Quais UFs aceleraram ou perderam leads nos últimos 3 meses? | `04_tile-map-com-mini-grafico/v2_tendencia-dos-ultimos-tres-meses` |
| A participação de mercado vale para quais UFs? | `05_mapa-de-perimetro-e-localizador/v1_miniatura-ao-lado-do-card-de-participacao` |
| O que a expansão do perímetro acrescenta? | `05_mapa-de-perimetro-e-localizador/v3_perimetro-atual-e-expansao-proposta` |
| Quantos clientes ficam perto de um escritório? | `06_mapa-de-pontos/v2_raio-de-atuacao-dos-escritorios` |
| Quantos leads não têm município e ficam fora do mapa? | `06_mapa-de-pontos/v4_leads-sem-municipio-fora-do-mapa` |

## Quando procurar outra família

| Situação | Família e modelo | Motivo |
|---|---|---|
| Volume que se desloca entre locais (mapa de fluxo) | [11_fluxo-sankey](../11_fluxo-sankey/) | O dado é fluxo: largura por volume entre origem e destino. |
| Ligação entre pontos ou entre UFs, sem volume | [27_rede-e-relacoes](../27_rede-e-relacoes/) | O dado é relação entre nós, não posição. |
| UF por mês em intensidade | [15_mapa-de-calor-e-calendario, 02_matriz-categorica](../15_mapa-de-calor-e-calendario/02_matriz-categorica/) | Grade UF x tempo codificada por cor, com valor exato na célula. |
| Ranking de UFs, inclusive agrupado por região | [02_barras-horizontais, 01_barras-simples-ordenadas](../02_barras-horizontais/01_barras-simples-ordenadas/) | Quando a pergunta é ordem, barras vencem o mapa. |
| Valor exato das 27 UFs com barra | [14_tabelas-visuais, 01_tabela-com-barras-inline](../14_tabelas-visuais/01_tabela-com-barras-inline/) | Leitura de número, não de território. |
| Sparkline por UF fora de mapa | [24_microvisuais-sparklines, 01_sparkline-de-linha](../24_microvisuais-sparklines/01_sparkline-de-linha/) | O modelo 04 usa a sparkline, mas o componente é da família 24. |
| Densidade de duas medidas sem geografia (binagem hexagonal) | [09_dispersao-e-bolhas, 09_densidade-2d](../09_dispersao-e-bolhas/09_densidade-2d/) | É densidade 2D, não região. |
| Perímetro que não é geográfico (segmento, carteira) | [12_hierarquia, 05_perimetro-aninhado](../12_hierarquia/05_perimetro-aninhado/) | O recorte é hierárquico, não territorial. |

## Referências

Todos os links vêm do estudo da família ou da varredura de portais; nenhum foi acrescentado aqui. Marcação de proveniência: **[aberto]** a página foi lida; **[busca]** só apareceu em busca; **(abriu só o título)** a página carregou sem conteúdo legível. Nas bibliotecas fora da stack (nivo, AG Charts, Vega-Lite, React Graph Gallery com d3), observar a regra e a geometria, nunca importar. Nos shots de Dribbble e arquivos de Figma marcados [busca], a qualidade visual não foi conferida: olhe antes de adotar.

### Da família inteira

| Referência | O que observar |
|---|---|
| [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) [aberto] | A categoria Spatial: equalised cartogram, scaled cartogram, proportional symbol e dot density lado a lado. |
| [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md) [aberto] | A definição curta de cada forma espacial e o pedido de anotar o padrão que o leitor deve ver. |
| [Datawrapper Academy, índice](https://www.datawrapper.de/academy) [aberto] | Coroplético, símbolos e localizador tratados como tipos distintos, cada um com seus cuidados. |
| [From Data to Viz, Background map](https://www.data-to-viz.com/graph/map.html) [aberto] | A projeção como cuidado de base de qualquer mapa. |
| [Data Viz Catalogue, Flow Map](https://datavizcatalogue.com/methods/flow_map.html) [aberto] | O parentesco com o Sankey, que manda o mapa de fluxo para a família 11. |
| [Data Viz Catalogue, Connection Map](https://datavizcatalogue.com/methods/connection_map.html) [aberto] | Ligação entre pontos como relação, que manda o mapa de conexões para a família 27. |
| [Behance, Data screen: Regional business monitoring](https://www.behance.net/gallery/171554797/Data-screen-Regional-business-monitoring) [aberto] | Monitoramento de negócio por região com o mapa no centro de um painel de controle (a página não descreve a escala de cor). |
| [Behance, Analytical Dashboard for Map Viewers](https://www.behance.net/gallery/255244289/Analytical-Dashboard-for-Map-Viewers) [aberto] | Dashboard analítico construído em torno de mapa (a página traz só título e tags). |
| [Dribbble, Visitor analytics widget, Dark mode](https://dribbble.com/shots/25330210-Visitor-analytics-widget-Dark-mode) [busca] | Widget com mapa em tema escuro: como o mapa convive com números num cartão. |
| [Figma Community, plugin Map Chart](https://www.figma.com/community/plugin/1171452234740033982/map-chart) [busca] | Mapa mundial com dados, só para rascunho; o Farol desenha em código. |

### 01_tile-grid-por-uf

| Referência | O que observar |
|---|---|
| [geofacet, br_states_grid1.csv](https://raw.githubusercontent.com/hafen/grid-designer/master/grids/br_states_grid1.csv) [aberto] e [br_states_grid2.csv](https://raw.githubusercontent.com/hafen/grid-designer/master/grids/br_states_grid2.csv) [aberto] | As coordenadas linha e coluna das 27 UFs nas grades de 8x6 e 7x6, e como cada uma distribui o Nordeste. |
| [grid-designer, repositório](https://github.com/hafen/grid-designer) [aberto] | O formato `code,name,row,col` e a exigência de tiles sem sobreposição. |
| [NPR Visuals, Let's Tesselate: Hexagons for Tile Grid Maps](https://blog.apps.npr.org/2015/05/11/hex-tile-maps.html) [aberto] | O argumento contra o viés de área, o esboço a lápis e as adjacências que não couberam no hexágono. |
| [Storytelling with Data, What is a choropleth map](https://www.storytellingwithdata.com/blog/what-is-a-choropleth-map) [aberto] | O mapa de tiles como alternativa ao coroplético e o dado ausente distinto de zero. |
| [Red Blob Games, Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) [aberto] | Tamanho, espaçamento e deslocamento odd-r do hexágono com ponta para cima, base da versão `v3`. |
| [From Data to Viz, Hexbin map](https://www.data-to-viz.com/graph/hexbinmap.html) [aberto] | Os dois sentidos do termo: região como hexágono (este modelo) e binagem de pontos (família 09). |
| [React Graph Gallery, Hexbin map](https://www.react-graph-gallery.com/hexbin-map) [aberto] | As etapas de cor, legenda e centroide para rótulo; lá com d3, aqui só como roteiro. |
| [Tilegrams](https://pitchinteractiveinc.github.io/tilegrams/) (abriu só o título) | Ferramenta para desenhar grades de tiles; não há grade hexagonal pública do Brasil verificada. |
| [Behance, Infographic Map Styles #1](https://www.behance.net/gallery/25341691/Infographic-Map-Styles-1) [aberto] | Estilos de mapa infográfico, inclusive um sobre o Brasil. |
| [Figma Community, Open Source Brazil for data vis](https://www.figma.com/community/file/1116542873315056571/open-source-brazil-for-data-vis) [busca] | UFs em quadrados de tamanho igual: o tile map pronto para comparar com as grades do geofacet. |
| [Figma Community, U.S. Heat Maps](https://www.figma.com/community/file/1315813033136332578/u-s-heat-maps) [busca] | A mesma técnica em hexágono, quadrado e realista: referência de acabamento do tile. |

### 02_coropletico-por-uf

| Referência | O que observar |
|---|---|
| [IBGE, documentação da API de malhas v3](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3) [aberto] | Formatos SVG, GeoJSON e TopoJSON e os parâmetros `qualidade` e `intrarregiao`. |
| [IBGE, malha do Brasil por UF em SVG, qualidade mínima](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=minima&intrarregiao=UF) [aberto] | 48.242 bytes com 27 `path`, `id` igual ao código IBGE, `viewBox` e o grupo `scale(0.0001,-0.0001)`. |
| [IBGE, malha do Brasil por macrorregião em SVG](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=minima&intrarregiao=regiao) [aberto] | 14.698 bytes para as 5 regiões: base da versão `v3` com abertura por UF. |
| [Data Viz Catalogue, Choropleth Map](https://datavizcatalogue.com/methods/choropleth.html) [aberto] | A imprecisão de leitura e o viés das regiões grandes. |
| [From Data to Viz, Choropleth](https://www.data-to-viz.com/graph/choropleth.html) [aberto] | Normalização, paleta contínua e legenda como erros comuns. |
| [Datawrapper Academy, What to consider when creating choropleth maps](https://www.datawrapper.de/academy/what-to-consider-when-creating-choropleth-maps) [aberto] | Dado relativo, extremos mais dois a quatro degraus e centro mais claro na divergente. |
| [Datawrapper Academy, How to display both label and value on choropleth maps](https://www.datawrapper.de/academy/how-to-display-both-label-and-value-on-choropleth-maps) [aberto] | Rótulo composto por nome e valor. |
| [Axis Maps, Data classification](https://www.axismaps.com/guide/data-classification) [aberto] | Intervalos iguais, quantis e quebras naturais, com 3 a 7 classes. |
| [ColorBrewer](https://colorbrewer2.org/) [aberto] | Esquemas sequencial, divergente e qualitativo com filtro para daltonismo; base de 3 classes para cada eixo do bivariado. |
| [Joshua Stevens, Bivariate Choropleth Maps](https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/) [aberto] | A grade de 9 classes, a rotulagem A1 a C3 e a legenda só com cantos, base da versão `v4`. |
| [Storytelling with Data, What is a choropleth map](https://www.storytellingwithdata.com/blog/what-is-a-choropleth-map) [aberto] | O exemplo de total bruto contra taxa por 100 mil habitantes. |
| [Nightingale, This Map Helps Fascists](https://nightingaledvs.com/this-map-helps-fascists/) [aberto] | A crítica a tratar área de terra como se fosse peso social. |
| [AG Charts, Map Shapes Series](https://www.ag-grid.com/charts/react/map-shapes/) [aberto] | `missingDataFill` e rótulos que encolhem para caber na forma. |
| [Vega-Lite, Choropleth](https://vega.github.io/vega-lite/examples/geo_choropleth.html) [aberto] | O `lookup` por id, que equivale aqui ao casamento pelo código IBGE. |
| [nivo, Choropleth](https://nivo.rocks/choropleth/) [aberto] | A cor para feição sem dado (referência de forma; biblioteca fora da stack). |
| [React Graph Gallery, Choropleth map](https://www.react-graph-gallery.com/choropleth-map) [aberto] | A divisão entre projeção e desenho; aqui os paths pré-projetados do IBGE substituem a parte do d3. |
| [mapshaper](https://github.com/mbloch/mapshaper) [aberto] | Simplificação extra opcional e offline, só se a qualidade mínima do IBGE ainda pesar. |
| [Behance, População do Brasil: uma leitura cartográfica](https://www.behance.net/gallery/248428653/Populacao-do-Brasil-Uma-leitura-cartografica) [aberto] e [busca "brazil map infographic"](https://www.behance.net/search/projects/brazil%20map%20infographic) [aberto] | Representações alternativas da população brasileira em mapa. |
| [Figma Community, Brazil States Map for Data Visualization](https://www.figma.com/community/file/1393010274407329820/brazil-states-map-for-data-visualization) [busca] | Cada UF como componente colorível: rascunho rápido do coroplético antes do código. |
| [Dribbble, Choropleth Map](https://dribbble.com/shots/4704497-Choropleth-Map) [busca] | Orçamento agregado por distrito em escala de calor. |
| [Dribbble, Animated Choropleth Map, 49 Days of Charts](https://dribbble.com/shots/17791306-Animated-Choropleth-Map-49-Days-of-Charts) [busca] | Transição de classes no coroplético; no Farol o preview é estático e a animação fica desligada. |

### 03_simbolos-proporcionais

| Referência | O que observar |
|---|---|
| [IBGE, metadados de SC](https://servicodados.ibge.gov.br/api/v3/malhas/estados/SC/metadados) [aberto] | `centroide`, `regiao-limitrofe` e `area`; o centroide de SC em longitude −50,4749 e latitude −27,2474. |
| [Data Viz Catalogue, Bubble Map](https://datavizcatalogue.com/methods/bubble_map.html) [aberto] | Área e não raio, e o problema de sobreposição. |
| [From Data to Viz, Bubble map](https://www.data-to-viz.com/graph/bubblemap.html) [aberto] | Os três erros (raio, sobreposição, legenda ausente) e a transparência contra sobreposição. |
| [Datawrapper Academy, How to show negative values in symbol maps](https://www.datawrapper.de/academy/how-to-show-negative-values-in-symbol-maps) [aberto] | Valor absoluto no tamanho com cor pelo sinal, e o mapa de setas; base da versão `v4`. |
| [Datawrapper Academy, How to group nearby symbols](https://www.datawrapper.de/academy/working-with-iteration-and-tolerance-feature-in-symbol-maps) [aberto] | A troca entre detalhe e clareza ao agrupar símbolos próximos. |
| [Datawrapper Academy, categoria Symbol maps](https://www.datawrapper.de/academy/category/symbol-maps) [aberto] | A lista de cuidados: dicas de grupo, negativos e rótulos. |
| [Recharts, BubbleChart](https://recharts.github.io/en-US/examples/BubbleChart/) [aberto] | `ZAxis range` e domínio a partir de zero para área proporcional; referência de cálculo para as bolhas em grade. |
| [From Data to Viz, Cartogram](https://www.data-to-viz.com/graph/cartogram.html) [aberto] | O aviso de dar contexto e comparar com o mapa original. |
| [React Graph Gallery, Cartogram](https://www.react-graph-gallery.com/cartogram) [aberto] | A abordagem com biblioteca externa; aqui a relaxação de Dorling é própria, em TypeScript. |
| [Nightingale, Distortion by Design](https://nightingaledvs.com/distortion-by-design/) [aberto] | Distorção só é defensável com o mecanismo transparente, o que pede o subtítulo da versão `v3`. |

### 04_tile-map-com-mini-grafico

| Referência | O que observar |
|---|---|
| [geofacet](https://hafen.github.io/geofacet/) [aberto] | Pequenos múltiplos que preservam a orientação geográfica. |
| [grid-designer, repositório](https://github.com/hafen/grid-designer) [aberto] | Como grades são desenhadas e submetidas; a mesma grade do modelo 01 serve aqui. |
| [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/) [aberto] | Tiny Line Chart e Tiny Area Chart; 27 instâncias pesam, por isso o path pré-calculado. |

### 05_mapa-de-perimetro-e-localizador

| Referência | O que observar |
|---|---|
| [Datawrapper Academy, índice](https://www.datawrapper.de/academy) [aberto] | Locator maps como tipo próprio: o mapa como contexto, não como gráfico principal. |
| [Datawrapper Academy, categoria Choropleth maps](https://www.datawrapper.de/academy/category/choropleth-maps) [aberto] | Os artigos sobre ocultar regiões e mostrar símbolos sobre coroplético. |
| [IBGE, documentação da API de malhas v3](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3) [aberto] | Recortes por região e por UF, a mesma malha do modelo 02 em duas camadas. |

### 06_mapa-de-pontos

| Referência | O que observar |
|---|---|
| [Data Viz Catalogue, Dot Map](https://datavizcatalogue.com/methods/dot_map.html) [aberto] | As variantes um para um e um para muitos, e a leitura de distribuição e agrupamento. |
| [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md) [aberto] | A definição de dot density e o pedido de anotação. |
| [From Data to Viz, Background map](https://www.data-to-viz.com/graph/map.html) [aberto] | A projeção como cuidado de base; aqui a equiretangular do IBGE estica o Sul na horizontal (cosseno de 30° é cerca de 0,87). |

### Lacunas conhecidas

- Nenhuma grade hexagonal pública do Brasil foi verificada. A versão `01_tile-grid-por-uf/v3` parte da grade quadrada com deslocamento de meia célula e precisa de revisão de vizinhança com quem lê o painel.
- Tentadas sem sucesso no estudo, por isso sem link: demo de tile map em favo do Highcharts, série de marcadores em mapa do AG Charts, artigo da Datawrapper sobre o que considerar em mapas de símbolos, exemplo geo do visx, Observable Plot geo, Data Viz Project, FlowingData, Dribbble e Figma Community abertos diretamente.
- A varredura de portais não achou shot de mapa de perímetro nem de mapa de pontos em painel comercial; os modelos 05 e 06 se apoiam só em guias de método.
