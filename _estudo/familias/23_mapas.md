# 23_mapas

_Estudo de família do catálogo VISUAIS do Farol. Pesquisa feita em 2026-09-14. Dados de exemplo 100% fictícios; a geografia (UFs e regiões do Brasil) é pública._

Stack de referência: React 18.3 + TypeScript strict + Recharts 3.10.1 + Tailwind 4 + lucide-react. Sem d3-geo, topojson, nivo, visx, echarts ou Leaflet. Toda geometria vira constante TypeScript gerada uma vez por script de build e versionada; o componente só desenha.

---

## 1. O que a família responde

Mapas respondem **onde**: concentração regional, perímetro de atuação, contraste entre regiões, lacuna geográfica. No Farol o grão típico é a **UF** (27 unidades), às vezes a macrorregião (5).

Antes de escolher um mapa, uma pergunta de corte: a posição geográfica muda a leitura? Se a pergunta é "qual UF é maior", barras respondem melhor, como o Storytelling with Data lembra ao falar de coropléticos. Mapa entra quando vizinhança, região ou perímetro fazem parte da resposta.

Perguntas típicas no Farol:

| Público | Pergunta |
|---|---|
| Comercial | Onde está a receita reconhecida e onde estão as oportunidades abertas? |
| Pré-vendas | De que UFs vêm as entradas da semana e onde a fila está acumulando? |
| Marketing | Quantos leads e qual CPL qualificado por UF; quantos leads chegaram sem UF preenchida? |
| Diretoria | Qual a participação de mercado por UF dentro do perímetro de atuação, e o que muda se o perímetro crescer? |

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Tile grid map quadrado por UF | Taxas por UF com peso visual igual para todas | Quando forma e área reais importam | Posições que o público não reconhece, sem sigla no tile |
| 2 | Tile grid map hexagonal | Mesmo caso do 1, preservando mais vizinhanças | Tela muito estreita | Layout hexagonal inventado sem validação |
| 3 | Tile map com mini gráfico por UF | Tendência de cada UF mantendo a geografia | Mais de um indicador por tile | Escala Y compartilhada achatando UFs pequenas sem aviso |
| 4 | Bolhas por UF em grade | Valores absolutos por UF sem viés de área | Taxas e percentuais | Raio proporcional ao valor em vez de área |
| 5 | Coroplético simplificado por UF | Taxas com contorno real reconhecível | Totais absolutos; ranking preciso | Pintar total bruto e premiar UFs grandes |
| 6 | Símbolos proporcionais sobre a malha | Absolutos com contexto geográfico real | Muitas UFs pequenas com valores altos lado a lado | Sobreposição sem ordem de pintura |
| 7 | Mapa de pontos | Localização de itens individuais ou densidade | Dado sem coordenada confiável | Jogar itens sem município no centroide da UF |
| 8 | Coroplético bivariado | Relação entre duas taxas por UF | Público sem tempo para legenda | Legenda pequena ou ausente |
| 9 | Cartograma de Dorling | Destacar magnitude mantendo posição aproximada | Quando a forma real é esperada | Distorção não explicada |
| 10 | Mapa de perímetro e localizador | Dizer a que recorte geográfico um número se refere | Como gráfico analítico principal | Números do perímetro lidos como nacionais |

---

## 3. Modelos em detalhe

### 3.1 Tile grid map quadrado por UF

**Descrição.** Cada UF vira um quadrado de mesmo tamanho, posicionado numa grade que lembra o mapa. Elimina o viés de área que faz a Amazônia dominar um coroplético. O FT Visual Vocabulary chama a forma de equalised cartogram; a equipe de gráficos da NPR a defendeu por dar peso igual a cada unidade.

**Anatomia.** 27 tiles com sigla; valor abaixo da sigla; cor por classe; legenda em degraus; separação discreta entre regiões.

**Abordagem na stack.** `html-tailwind`. `div` com `grid grid-cols-6 gap-1` e cada tile com `style={{ gridRow: linha, gridColumn: coluna }}` e `aspect-square`. As posições vêm de uma constante. Duas grades públicas do Brasil foram verificadas no repositório de grades do pacote geofacet:

```ts
export type UF =
  | 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MG' | 'MS' | 'MT' | 'PA' | 'PB' | 'PE' | 'PI' | 'PR'
  | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO';

type Posicao = readonly [linha: number, coluna: number];

/** br_states_grid1 (8 linhas x 6 colunas), geofacet grid-designer */
export const GRADE_UF_8X6: Record<UF, Posicao> = {
  RR: [1, 2], AP: [1, 3],
  AM: [2, 2], PA: [2, 3], MA: [2, 4], CE: [2, 5],
  AC: [3, 1], RO: [3, 2], TO: [3, 3], PI: [3, 4], PB: [3, 5], RN: [3, 6],
  MT: [4, 2], GO: [4, 3], BA: [4, 4], PE: [4, 5], AL: [4, 6],
  MS: [5, 2], DF: [5, 3], MG: [5, 4], SE: [5, 5],
  SP: [6, 3], RJ: [6, 4], ES: [6, 5],
  PR: [7, 3], SC: [7, 4],
  RS: [8, 3],
};

/** br_states_grid2 (7 linhas x 6 colunas), geofacet grid-designer */
export const GRADE_UF_7X6: Record<UF, Posicao> = {
  AM: [1, 1], RR: [1, 2], AP: [1, 3], RN: [1, 4], PB: [1, 5], PE: [1, 6],
  AC: [2, 1], PA: [2, 2], MA: [2, 3], CE: [2, 4], SE: [2, 5], AL: [2, 6],
  RO: [3, 1], MT: [3, 2], TO: [3, 3], PI: [3, 4], BA: [3, 5],
  DF: [4, 2], GO: [4, 3], MG: [4, 4], ES: [4, 5],
  MS: [5, 2], SP: [5, 3], RJ: [5, 4],
  PR: [6, 2], SC: [6, 3],
  RS: [7, 3],
};
```

**Ponto delicado.** Nenhuma grade preserva todas as vizinhanças; as duas acima distribuem o Nordeste de formas diferentes e merecem validação com quem vai ler o painel antes de escolher. A cor do texto dentro do tile precisa alternar entre claro e escuro conforme a luminância do preenchimento. UF sem dado usa hachura e legenda própria, distinta de zero.

**Versões sugeridas.**
1. **Básico: taxa de qualificação de leads por UF em 2026.** 5 classes sequenciais.
2. **Com destaque: UFs acima da meta.** Anel de destaque nos tiles acima da meta fictícia e o resto sem anel.
3. **Denso e real do Farol: tile mais ranking.** Tile com sigla, valor e percentual qualificado em duas linhas, ao lado de barras das 10 maiores UFs, com hover sincronizado entre os dois.
4. **Limite: cobertura de dado.** UFs sem dado hachuradas e, fora do mapa, o card "1.240 leads sem UF (18% do total)", porque lead sem UF não pode ser distribuído entre as UFs.

**Referências.**
- Catálogo: [geofacet, br_states_grid1.csv](https://raw.githubusercontent.com/hafen/grid-designer/master/grids/br_states_grid1.csv) e [br_states_grid2.csv](https://raw.githubusercontent.com/hafen/grid-designer/master/grids/br_states_grid2.csv): observar as coordenadas linha e coluna das 27 UFs.
- Catálogo: [grid-designer, repositório](https://github.com/hafen/grid-designer): observar o formato `code,name,row,col` e a exigência de tiles sem sobreposição.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a categoria Spatial e o equalised cartogram.
- Praticante: [NPR Visuals, Let's Tesselate: Hexagons for Tile Grid Maps](https://blog.apps.npr.org/2015/05/11/hex-tile-maps.html): observar o argumento contra o viés de área e a troca de adjacências por clareza.
- Praticante: [Storytelling with Data, What is a choropleth map](https://www.storytellingwithdata.com/blog/what-is-a-choropleth-map): observar o mapa de tiles como alternativa e dado ausente distinto de zero.
- Portal de design: [Behance, Infographic Map Styles #1](https://www.behance.net/gallery/25341691/Infographic-Map-Styles-1): observar estilos de mapa infográfico, inclusive um sobre o Brasil.

---

### 3.2 Tile grid map hexagonal

**Descrição.** Hexágonos iguais em vez de quadrados. A NPR relata que hexágonos dão mais flexibilidade para manter fronteiras vizinhas do que linhas e colunas rígidas.

**Anatomia.** Hexágonos em linhas deslocadas; sigla; cor por classe; contorno mais grosso entre regiões.

**Abordagem na stack.** `svg-puro`. Geometria da referência da Red Blob Games para hexágono com ponta para cima (pointy-top) e deslocamento em linhas ímpares (odd-r), com tamanho `s`:
- largura `√3·s`, altura `2·s`, passo vertical `1,5·s`;
- centro: `x = s·√3·(coluna + 0,5·(linha & 1))`, `y = s·1,5·linha`;
- vértices em ângulos `60°·i + 30°`, desenhados como `<polygon>`.

**Ponto delicado.** Não foi encontrada nesta pesquisa uma grade hexagonal pública do Brasil verificada; o caminho é partir da grade quadrada do modelo 1, aplicar o deslocamento de meia célula e revisar vizinhança por vizinhança (lacuna registrada). O Tilegrams existe como ferramenta de desenho desse tipo de grade. Hexágono comporta menos texto que quadrado.

**Versões sugeridas.**
1. **Básico: CPL qualificado por UF.** Escala divergente em torno da média nacional fictícia.
2. **Com destaque: regiões.** Contorno grosso entre hexágonos de regiões diferentes.
3. **Denso e real do Farol: pequenos múltiplos por plataforma.** Três mapas hexagonais lado a lado (Plataforma Social, de Busca, Profissional) com a mesma escala de cor.
4. **Limite: tela estreita.** Abaixo de 32 px por hexágono, só a sigla fica visível; o valor aparece no toque.

**Referências.**
- Praticante: [NPR Visuals, Let's Tesselate](https://blog.apps.npr.org/2015/05/11/hex-tile-maps.html): observar o esboço a lápis e as adjacências que não couberam.
- Geometria: [Red Blob Games, Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/): observar tamanhos, espaçamentos e conversão de coordenadas deslocadas para pixel.
- Catálogo: [From Data to Viz, Hexbin map](https://www.data-to-viz.com/graph/hexbinmap.html): observar os dois sentidos do termo (região como hexágono e binagem de pontos).
- Catálogo: [React Graph Gallery, Hexbin map](https://www.react-graph-gallery.com/hexbin-map): observar as etapas de cor, legenda e centroide para rótulo (lá com d3, aqui só como referência de etapas).
- Ferramenta: [Tilegrams](https://pitchinteractiveinc.github.io/tilegrams/): ferramenta para desenhar grades de tiles; a página abriu só com o título, sem conteúdo legível.

---

### 3.3 Tile map com mini gráfico por UF

**Descrição.** Cada tile contém um pequeno gráfico da UF (linha, barras), e a grade mantém a posição geográfica. É o geofaceting: pequenos múltiplos arranjados como mapa.

**Anatomia.** Grade do modelo 1; sigla no canto; mini gráfico; último valor; escala declarada.

**Abordagem na stack.** `html-tailwind` para a grade, com sparkline em `svg-puro` dentro de cada tile (família 24). Um `LineChart` ou `AreaChart` do Recharts em cada tile também funciona, como no exemplo Tiny Line Chart, mas 27 instâncias com observação de tamanho pesam; o path pré-calculado é mais leve.

**Ponto delicado.** Escala Y compartilhada permite comparar UFs, mas achata as pequenas; escala independente mostra a forma de cada uma, mas impede comparação. Declarar a escolha em texto.

**Versões sugeridas.**
1. **Básico: leads mensais de 2026 por UF.** Sparkline com escala compartilhada.
2. **Com destaque: tendência.** Linha colorida por alta ou queda nos últimos 3 meses e último valor em negrito.
3. **Denso e real do Farol: receita por produto no perímetro.** Mini barras empilhadas por produto nas UFs do perímetro; UFs fora do perímetro em cinza sem gráfico.
4. **Limite: UFs com volume 100 vezes menor.** Alternar para escala independente com selo "escala própria" em cada tile.

**Referências.**
- Catálogo: [geofacet](https://hafen.github.io/geofacet/): observar a ideia de pequenos múltiplos que preservam a orientação geográfica.
- Catálogo: [grid-designer, repositório](https://github.com/hafen/grid-designer): observar como grades são desenhadas e submetidas.
- Stack: [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar Tiny Line Chart e Tiny Area Chart.

---

### 3.4 Bolhas por UF em grade

**Descrição.** Um círculo por UF, centrado na posição do tile, com área proporcional ao valor. Serve para valores absolutos (contagens, receita), caso em que a Datawrapper recomenda símbolos em vez de coroplético.

**Anatomia.** Grade invisível; círculos; sigla dentro ou abaixo; legenda de tamanho com dois ou três círculos de referência.

**Abordagem na stack.** `recharts-nativo`. `ScatterChart` com `XAxis type="number" dataKey="coluna" domain={[0.5, 6.5]} hide`, `YAxis type="number" dataKey="linha" domain={[0.5, 8.5]} reversed hide`, `ZAxis dataKey="valor" domain={[0, max]} range={[0, areaMax]}`, `LabelList dataKey="uf"` e cor por `Cell`. O exemplo BubbleChart confirma o mapeamento de valor por `ZAxis range`; o tamanho do símbolo é área, então `domain` começando em zero mantém a proporção.

**Ponto delicado.** `areaMax` precisa caber na célula: o maior círculo não pode passar do tile. A altura do gráfico deve ser `largura * 8 / 6` para células quadradas. Negativos: círculo não tem raio negativo; usar tamanho pelo valor absoluto e cor pelo sinal, como a Datawrapper orienta.

**Versões sugeridas.**
1. **Básico: receita reconhecida por UF (fictícia).**
2. **Com destaque: meta.** Círculo vazado com a meta e círculo cheio com o realizado, na mesma escala.
3. **Denso e real do Farol: duas variáveis.** Tamanho pelos leads e cor pelo CPL qualificado, com legenda dupla.
4. **Limite: variação negativa.** Variação de receita contra o ano anterior: tamanho pelo absoluto, cor divergente, sinal no rótulo. Alternativa: quadrado escalado no lugar do círculo (o scaled cartogram do FT).

**Referências.**
- Stack: [Recharts, BubbleChart](https://recharts.github.io/en-US/examples/BubbleChart/): observar `ZAxis range` e eixos escondidos.
- Catálogo: [Data Viz Catalogue, Bubble Map](https://datavizcatalogue.com/methods/bubble_map.html): observar área e não raio, e o problema de sobreposição.
- Catálogo: [From Data to Viz, Bubble map](https://www.data-to-viz.com/graph/bubblemap.html): observar os três erros: raio, sobreposição e ausência de legenda.
- Praticante: [Datawrapper Academy, How to show negative values in symbol maps](https://www.datawrapper.de/academy/how-to-show-negative-values-in-symbol-maps): observar valor absoluto com cor e o mapa de setas.

---

### 3.5 Coroplético simplificado por UF (malha IBGE pré-processada)

**Descrição.** Contornos reais das UFs pintados por uma taxa. É viável sem dependência: a API de malhas do IBGE entrega SVG pronto, e isso foi verificado nesta pesquisa.

**O que foi verificado em 2026-09-14.**
- A chamada `https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=minima&intrarregiao=UF` devolveu **48.242 bytes com 27 `<path>`**.
- Cada `path` tem `id` igual ao código IBGE da UF (por exemplo `id="11"` para RO).
- O SVG usa `viewBox="-73.9833 -5.2718 39.1806 39.0157"` e um `<g transform="scale(0.0001,-0.0001)">`: as coordenadas são longitude e latitude multiplicadas por 10.000, com Y invertido. É uma projeção equiretangular pronta, sem biblioteca.
- A mesma chamada com `intrarregiao=regiao` devolveu **14.698 bytes** para as 5 macrorregiões.

**Anatomia.** 27 paths; preenchimento por classe; contorno fino na cor do fundo; legenda em degraus; rótulos só nas UFs grandes e chamadas externas para as pequenas (DF, SE, AL, RN, PB, ES, RJ).

**Abordagem na stack.** `svg-puro`.
1. Script de build em Node (fora do bundle, sem dependência de runtime) baixa o SVG uma vez, extrai `id` e `d` e grava `ufPaths.ts` versionado com a data de captura.
2. Componente renderiza `<svg viewBox="-73.9833 -5.2718 39.1806 39.0157">`, o `<g transform="scale(0.0001,-0.0001)">` e um `<path>` por UF com `vectorEffect="non-scaling-stroke"`.
3. Classificação em TypeScript (quantis, intervalos iguais ou quebras manuais), de 3 a 7 classes.
4. Tabela de código IBGE para sigla: 11 RO, 12 AC, 13 AM, 14 RR, 15 PA, 16 AP, 17 TO, 21 MA, 22 PI, 23 CE, 24 RN, 25 PB, 26 PE, 27 AL, 28 SE, 29 BA, 31 MG, 32 ES, 33 RJ, 35 SP, 41 PR, 42 SC, 43 RS, 50 MS, 51 MT, 52 GO, 53 DF.

**Ponto delicado.**
- **Contorno:** o `scale(0.0001)` escala também a espessura da linha; sem `vector-effect="non-scaling-stroke"` a borda some ou vira mancha.
- **Sobrepor pontos:** fora do grupo escalado, um ponto de longitude e latitude fica em `x = lon` e `y = -lat` no sistema do `viewBox`.
- **Distorção:** a equiretangular estica horizontalmente o Sul (cosseno de 30° é cerca de 0,87). É aceitável para painel; se incomodar, multiplicar X por cerca de 0,97 (cosseno da latitude média).
- **Viés de área:** normalizar sempre (taxa, não total) e considerar o modelo 1 quando a Amazônia dominar a leitura.
- **UFs pequenas:** difíceis de apontar com o mouse; tabela sincronizada ao lado e chamadas externas.
- **Peso:** 48 KB inline: carregar o módulo sob demanda com `import()` dinâmico.
- **Sem dado:** `<pattern>` hachurado com legenda própria, distinto de zero.
- **Tema escuro:** na escala sequencial, valor baixo perto da cor do fundo e valor alto mais luminoso; na divergente, o centro é o tom mais próximo do fundo.

**Versões sugeridas.**
1. **Básico: taxa de qualificação de leads por UF.** Sequencial em 5 classes.
2. **Com destaque: desvio da média.** Divergente em torno da média nacional fictícia, com a UF de maior desvio rotulada.
3. **Denso e real do Farol: macrorregião com drill.** Visão padrão da Diretoria com as 5 regiões (malha de 14,7 KB); clique numa região abre as UFs dela, com tooltip de valor, posição no ranking e cobertura de dado.
4. **Limite: dado ausente e amostra pequena.** 9 UFs sem dado hachuradas; UF com menos de 30 leads com contorno pontilhado e rótulo "amostra pequena".

**Referências.**
- Fonte de geometria: [IBGE, documentação da API de malhas v3](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3): observar formatos SVG, GeoJSON e TopoJSON e os parâmetros `qualidade` e `intrarregiao`.
- Fonte de geometria: [IBGE, malha do Brasil por UF em SVG, qualidade mínima](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=minima&intrarregiao=UF) e [por macrorregião](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=minima&intrarregiao=regiao): observar `viewBox`, `transform` e `id` por código.
- Catálogo: [Data Viz Catalogue, Choropleth Map](https://datavizcatalogue.com/methods/choropleth.html): observar a imprecisão de leitura e o viés de regiões grandes.
- Catálogo: [From Data to Viz, Choropleth](https://www.data-to-viz.com/graph/choropleth.html): observar normalização, paleta contínua e legenda como erros comuns.
- Praticante: [Datawrapper Academy, What to consider when creating choropleth maps](https://www.datawrapper.de/academy/what-to-consider-when-creating-choropleth-maps): observar dado relativo, extremos mais dois a quatro degraus, e centro mais claro na divergente.
- Praticante: [Axis Maps, Data classification](https://www.axismaps.com/guide/data-classification): observar intervalos iguais, quantis e quebras naturais, com 3 a 7 classes.
- Praticante: [ColorBrewer](https://colorbrewer2.org/): observar esquemas sequencial, divergente e qualitativo de 3 a 12 classes com filtro para daltonismo.
- Praticante: [Storytelling with Data, What is a choropleth map](https://www.storytellingwithdata.com/blog/what-is-a-choropleth-map): observar o exemplo de total bruto contra taxa por 100 mil habitantes.
- Praticante: [Datawrapper Academy, How to display both label and value on choropleth maps](https://www.datawrapper.de/academy/how-to-display-both-label-and-value-on-choropleth-maps): observar rótulo composto por nome e valor.
- Catálogo: [AG Charts, Map Shapes Series](https://www.ag-grid.com/charts/react/map-shapes/): observar `missingDataFill` e rótulos que encolhem para caber na forma.
- Catálogo: [Vega-Lite, Choropleth](https://vega.github.io/vega-lite/examples/geo_choropleth.html): observar o `lookup` por id, que equivale aqui ao casamento pelo código IBGE.
- Catálogo: [nivo, Choropleth](https://nivo.rocks/choropleth/): observar a cor para feição sem dado (referência de forma; biblioteca fora da stack).
- Catálogo: [React Graph Gallery, Choropleth map](https://www.react-graph-gallery.com/choropleth-map): observar a divisão entre d3 (projeção e path) e React; aqui os paths pré-projetados substituem a parte do d3.
- Ferramenta: [mapshaper](https://github.com/mbloch/mapshaper): simplificação extra opcional e offline, só se a qualidade mínima do IBGE ainda pesar.
- Praticante: [Nightingale, This Map Helps Fascists](https://nightingaledvs.com/this-map-helps-fascists/): observar a crítica a tratar área de terra como se fosse peso social.
- Portal de design: [Behance, População do Brasil: uma leitura cartográfica](https://www.behance.net/gallery/248428653/Populacao-do-Brasil-Uma-leitura-cartografica) e [busca "brazil map infographic"](https://www.behance.net/search/projects/brazil%20map%20infographic): observar representações alternativas da população brasileira em mapa.

---

### 3.6 Símbolos proporcionais sobre a malha

**Descrição.** Malha neutra de fundo e um círculo no centroide de cada UF com área proporcional ao valor absoluto. O FT lista a forma como proporcional symbol, indicada para contagem e magnitude.

**Anatomia.** Malha cinza; círculos translúcidos com contorno; legenda de tamanho; rótulo nos maiores.

**Abordagem na stack.** `svg-puro`, reaproveitando a malha do modelo 5. Centroides pelo endpoint de metadados do IBGE, que devolve `centroide` por UF (verificado para SC: longitude -50,4749 e latitude -27,2474), gravados em `ufCentroides.ts` pelo mesmo script de build. Círculos desenhados fora do grupo escalado, em `cx = lon`, `cy = -lat`, com `r = rMaxGraus * Math.sqrt(v / vMax)`.

**Ponto delicado.** A documentação avisa que os metadados se referem à malha original e não à simplificada; para centroide a diferença é irrelevante em painel. O raio está em graus, então converter o raio desejado em pixels com `larguraViewBox / larguraPx`. Sobreposição no Nordeste oriental e no Sudeste: desenhar do maior para o menor, opacidade de cerca de 0,6 e contorno; se ainda sobrepor, agrupar (a Datawrapper expõe iteração e tolerância para isso) ou migrar para o modelo 9.

**Versões sugeridas.**
1. **Básico: clientes ativos fictícios por UF.**
2. **Com destaque: UF sede.** Bolha da sede fictícia com anotação e as demais sem rótulo.
3. **Denso e real do Farol: aberto e ganho.** Anel vazado com oportunidades abertas e círculo cheio com ganhas, mesma escala.
4. **Limite: saldo negativo.** Saldo de clientes no trimestre: tamanho pelo absoluto, cor divergente e tooltip com o valor original; alternativa em setas para cima e para baixo.

**Referências.**
- Fonte de geometria: [IBGE, metadados de SC](https://servicodados.ibge.gov.br/api/v3/malhas/estados/SC/metadados): observar `centroide`, `regiao-limitrofe` e `area`.
- Catálogo: [Data Viz Catalogue, Bubble Map](https://datavizcatalogue.com/methods/bubble_map.html): observar área proporcional e sobreposição.
- Catálogo: [From Data to Viz, Bubble map](https://www.data-to-viz.com/graph/bubblemap.html): observar transparência contra sobreposição.
- Praticante: [Datawrapper Academy, How to group nearby symbols](https://www.datawrapper.de/academy/working-with-iteration-and-tolerance-feature-in-symbol-maps): observar a troca entre detalhe e clareza no agrupamento.
- Praticante: [Datawrapper Academy, How to show negative values in symbol maps](https://www.datawrapper.de/academy/how-to-show-negative-values-in-symbol-maps): observar as três saídas para negativos.
- Catálogo: [Datawrapper Academy, categoria Symbol maps](https://www.datawrapper.de/academy/category/symbol-maps): observar a lista de cuidados (tooltips de grupo, negativos, rótulos).

---

### 3.7 Mapa de pontos

**Descrição.** Pontos do mesmo tamanho em coordenadas, um ponto por item ou um ponto por N itens. O Data Viz Catalogue destaca a leitura de distribuição e agrupamento; o FT pede anotar os padrões que o leitor deve ver.

**Anatomia.** Malha de fundo; pontos pequenos translúcidos; legenda "1 ponto = 5 leads".

**Abordagem na stack.** `svg-puro`, no mesmo sistema de coordenadas do modelo 5. `<circle>` até alguns milhares; acima disso, um único `<path>` com subcaminhos de círculo.

**Ponto delicado.** Com "1 ponto = N", a posição dentro da UF é sorteada: exige teste de ponto dentro do polígono em TypeScript e semente fixa, e o mapa deve dizer que a posição é ilustrativa. Item sem município não vai para o centroide, porque isso cria um aglomerado falso.

**Versões sugeridas.**
1. **Básico: eventos presenciais fictícios em cidades.**
2. **Com destaque: raio de atuação.** Círculo aproximado de 100 km em torno de escritórios fictícios.
3. **Denso e real do Farol: 1 ponto = 5 leads.** Pontos distribuídos dentro de cada UF, cor por origem.
4. **Limite: sem município.** Contagem à parte "320 leads sem município", fora do mapa.

**Referências.**
- Catálogo: [Data Viz Catalogue, Dot Map](https://datavizcatalogue.com/methods/dot_map.html): observar as variantes um para um e um para muitos.
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a definição de dot density e o pedido de anotação.
- Catálogo: [From Data to Viz, Background map](https://www.data-to-viz.com/graph/map.html): observar a projeção como cuidado de base.

---

### 3.8 Coroplético bivariado

**Descrição.** Duas variáveis, cada uma em 3 classes, combinadas numa paleta de 9 cores. Joshua Stevens documenta a construção da grade 3x3 e da legenda.

**Anatomia.** Malha ou tiles; legenda 3x3 com eixos nomeados; rótulo nos cantos da legenda.

**Abordagem na stack.** `html-tailwind` sobre a grade do modelo 1 (recomendado, porque a legenda disputa espaço com a malha) ou `svg-puro` sobre a malha do modelo 5. Classificação independente das duas variáveis (A, B, C e 1, 2, 3) e paleta 3x3 fixa em tokens.

**Ponto delicado.** A legenda é parte obrigatória e precisa de tamanho; acessibilidade para daltonismo é difícil com três matizes. No tema escuro, o canto baixo e baixo fica perto do fundo e o alto e alto é o mais saturado.

**Versões sugeridas.**
1. **Básico: volume de leads e taxa de qualificação por UF, em tiles.**
2. **Com destaque: quadrante de ação.** Só "alto volume e baixa qualificação" em cor; o resto em neutro.
3. **Denso e real do Farol: CPL e participação de mercado dentro do perímetro, na malha.**
4. **Limite: uma das variáveis ausente.** UF fora da paleta com hachura e nota na legenda.

**Referências.**
- Praticante: [Joshua Stevens, Bivariate Choropleth Maps](https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/): observar a grade de 9 classes, a rotulagem A1 a C3 e a legenda só com cantos.
- Praticante: [ColorBrewer](https://colorbrewer2.org/): observar escalas sequenciais de 3 classes que servem de base para cada eixo.

---

### 3.9 Cartograma de Dorling

**Descrição.** Cada UF vira um círculo de área proporcional ao valor, afastado dos vizinhos para não sobrepor e mantido perto da posição real. O From Data to Viz define cartograma como mapa com geometria distorcida para mostrar outra variável; o FT lista o scaled cartogram.

**Anatomia.** Círculos; siglas; legenda de área; cor opcional por região.

**Abordagem na stack.** `svg-puro`. Posição inicial no centroide do IBGE (ou no centro do tile); raio pela raiz quadrada; relaxação iterativa em TypeScript dentro de `useMemo`: em cerca de 120 iterações, para cada par sobreposto, afastar os dois pela metade da sobreposição ao longo da reta entre os centros, e puxar cada círculo de volta à origem com fator pequeno (cerca de 0,02). Com 27 círculos, o custo quadrático é irrelevante.

**Ponto delicado.** Estabilidade: a mesma entrada precisa dar a mesma saída, e mudanças de filtro não podem fazer os círculos saltarem longe; partir sempre da posição de origem e não da anterior. A distorção precisa ser explicada no subtítulo, como defende o texto do Nightingale sobre distorção por design.

**Versões sugeridas.**
1. **Básico: receita reconhecida por UF.**
2. **Com destaque: perímetro.** Cor por região e contorno nos círculos das UFs do perímetro.
3. **Denso e real do Farol: dois anos lado a lado.** 2025 e 2026 com a mesma escala de raio para a variação de tamanho ser comparável.
4. **Limite: valor zero.** Círculo mínimo vazado com a sigla, para a UF não desaparecer.

**Referências.**
- Catálogo: [From Data to Viz, Cartogram](https://www.data-to-viz.com/graph/cartogram.html): observar o aviso de dar contexto e comparar com o mapa original.
- Catálogo: [React Graph Gallery, Cartogram](https://www.react-graph-gallery.com/cartogram): observar a abordagem com biblioteca externa (só referência; aqui a relaxação é própria).
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar scaled cartogram e equalised cartogram lado a lado.
- Praticante: [Nightingale, Distortion by Design](https://nightingaledvs.com/distortion-by-design/): observar que distorção só é defensável com o mecanismo transparente.

---

### 3.10 Mapa de perímetro e localizador

**Descrição.** Realça as UFs de um recorte (perímetro de atuação, região de participação de mercado) e esmaece o resto. Diz ao leitor a que geografia o número ao lado se refere. Na Diretoria do Farol, participação de mercado só tem sentido com perímetro declarado.

**Anatomia.** Malha ou tiles; UFs do perímetro com preenchimento e contorno; demais em cinza; rótulo do perímetro; versão miniatura ao lado de um card.

**Abordagem na stack.** `svg-puro` sobre a malha do modelo 5, em duas camadas: fora do perímetro (cinza) e dentro. O contorno externo do perímetro sai sem dissolver polígonos: desenhar primeiro os paths do perímetro com contorno grosso e depois os mesmos paths com preenchimento e contorno fino por cima, o que esconde as bordas internas. Versão em tiles com `html-tailwind`.

**Ponto delicado.** Deixar escrito que os números valem só para o perímetro. Quando o perímetro muda no tempo, a data de vigência precisa aparecer. A Datawrapper oferece ocultar regiões e mapas localizadores como recursos próprios, o que confirma o uso do mapa como contexto e não como gráfico principal.

**Versões sugeridas.**
1. **Básico: miniatura de 120 px ao lado do card de participação de mercado.**
2. **Com destaque: participação só dentro do perímetro.** Cor por participação nas UFs do perímetro e fora dele sem cor.
3. **Denso e real do Farol: perímetro atual e expansão proposta.** Contorno cheio para o atual e tracejado para a expansão, com a participação estimada em faixa.
4. **Limite: perímetro que mudou.** Selo "perímetro vigente desde 2026-03-01" e alternância para ver o perímetro anterior.

**Referências.**
- Catálogo: [Datawrapper Academy, índice](https://www.datawrapper.de/academy): observar a categoria de locator maps como tipo próprio.
- Catálogo: [Datawrapper Academy, categoria Choropleth maps](https://www.datawrapper.de/academy/category/choropleth-maps): observar os artigos sobre ocultar regiões e mostrar símbolos sobre coroplético.
- Fonte de geometria: [IBGE, documentação da API de malhas v3](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3): observar recortes por região e por UF.

---

## 4. Modelos que moram melhor em outra família

| Modelo | Família certa | Motivo |
|---|---|---|
| Mapa de fluxo (espessura = volume entre locais) | 11_fluxo-sankey | O dado é fluxo; o Data Viz Catalogue aponta o Sankey como parente |
| Mapa de conexões entre pontos | 27_rede-e-relacoes | O dado é relação entre nós |
| Barras por UF agrupadas por região | 02_barras-horizontais | Quando a pergunta é ranking, barras vencem o mapa |
| UF por mês em intensidade | 15_mapa-de-calor-e-calendario | Grade UF x tempo codificada por cor |
| Tabela de UFs com barra | 14_tabelas-visuais | Leitura de valor exato |
| Sparkline por UF | 24_microvisuais-sparklines | Usada dentro do modelo 3, mas o componente é da família 24 |
| Binagem hexagonal de coordenadas | 16_distribuicao | É densidade 2D, não região |

---

## 5. Notas transversais de implementação

1. **Geometria como constante.** Um único script de build baixa malha, centroides e grades, grava `ufPaths.ts`, `regiaoPaths.ts`, `ufCentroides.ts` e `gradesUf.ts` com a URL e a data de captura em comentário. Nada é baixado em runtime e nenhuma dependência nova entra no `package.json`.
2. **Normalização.** Coroplético e tiles com taxa; bolhas e símbolos com total. O título diz qual é.
3. **Classes e cor.** De 3 a 7 classes, escala sequencial ou divergente, tokens próprios do tema escuro testados contra o fundo; "sem dado" com hachura e legenda, nunca a cor do zero.
4. **Área.** Todo símbolo proporcional usa área (raiz quadrada no raio ou `ZAxis` com domínio a partir de zero).
5. **Cobertura.** Registros sem UF ficam fora do mapa, com contagem e percentual visíveis.
6. **Acessibilidade.** Toda visão de mapa tem tabela ou lista sincronizada com os mesmos valores, o que também resolve as UFs pequenas.

---

## 6. Fontes consultadas

Abertas com conteúdo:
- https://datavizcatalogue.com/methods/choropleth.html
- https://datavizcatalogue.com/methods/bubble_map.html
- https://datavizcatalogue.com/methods/dot_map.html
- https://datavizcatalogue.com/methods/flow_map.html
- https://datavizcatalogue.com/methods/connection_map.html
- https://www.data-to-viz.com/graph/choropleth.html
- https://www.data-to-viz.com/graph/bubblemap.html
- https://www.data-to-viz.com/graph/cartogram.html
- https://www.data-to-viz.com/graph/hexbinmap.html
- https://www.data-to-viz.com/graph/map.html
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md
- https://blog.apps.npr.org/2015/05/11/hex-tile-maps.html
- https://raw.githubusercontent.com/hafen/grid-designer/master/grids/br_states_grid1.csv
- https://raw.githubusercontent.com/hafen/grid-designer/master/grids/br_states_grid2.csv
- https://github.com/hafen/grid-designer
- https://hafen.github.io/geofacet/
- https://servicodados.ibge.gov.br/api/docs/malhas?versao=3
- https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=minima&intrarregiao=UF
- https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=minima&intrarregiao=regiao
- https://servicodados.ibge.gov.br/api/v3/malhas/estados/SC/metadados
- https://www.redblobgames.com/grids/hexagons/
- https://www.axismaps.com/guide/data-classification
- https://colorbrewer2.org/
- https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/
- https://www.storytellingwithdata.com/blog/what-is-a-choropleth-map
- https://www.datawrapper.de/academy
- https://www.datawrapper.de/academy/what-to-consider-when-creating-choropleth-maps
- https://www.datawrapper.de/academy/category/choropleth-maps
- https://www.datawrapper.de/academy/category/symbol-maps
- https://www.datawrapper.de/academy/how-to-show-negative-values-in-symbol-maps
- https://www.datawrapper.de/academy/working-with-iteration-and-tolerance-feature-in-symbol-maps
- https://www.datawrapper.de/academy/how-to-display-both-label-and-value-on-choropleth-maps
- https://vega.github.io/vega-lite/examples/geo_choropleth.html
- https://nivo.rocks/choropleth/
- https://www.ag-grid.com/charts/react/map-shapes/
- https://www.react-graph-gallery.com/choropleth-map
- https://www.react-graph-gallery.com/hexbin-map
- https://www.react-graph-gallery.com/cartogram
- https://github.com/mbloch/mapshaper
- https://recharts.github.io/en-US/examples/
- https://recharts.github.io/en-US/examples/BubbleChart/
- https://nightingaledvs.com/this-map-helps-fascists/
- https://nightingaledvs.com/distortion-by-design/
- https://www.behance.net/search/projects/brazil%20map%20infographic
- https://www.behance.net/gallery/25341691/Infographic-Map-Styles-1
- https://www.behance.net/gallery/248428653/Populacao-do-Brasil-Uma-leitura-cartografica
- https://pitchinteractiveinc.github.io/tilegrams/ (abriu só com o título)

Tentadas sem sucesso, por isso sem link: demo de tile map em favo do Highcharts (404), série de marcadores em mapa do AG Charts (404), artigo da Datawrapper sobre o que considerar em mapas de símbolos (404), exemplo geo do visx (vazio), Observable Plot geo (429), Data Viz Project (403), FlowingData (403), Dribbble e Figma Community (vazio ou 403). Nenhuma grade hexagonal pública do Brasil foi encontrada.
