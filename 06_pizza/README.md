# Pizza

Pizza responde uma pergunta só: **que fração de um todo único cada parte representa**. A mensagem "parte do todo" vem embutida na forma, e a leitura é boa perto de 25%, 50% e 75%, porque essas frações caem nos quadrantes do relógio. A fraqueza é comparar fatias entre si: o olho julga mal ângulo e área. Por isso a família trabalha com todo verdadeiro (categorias exclusivas, soma igual ao total declarado, nenhum negativo), no máximo cinco fatias, ordem decrescente a partir das 12 horas no sentido horário e rótulo direto. Os seis modelos abaixo são variações dessa forma de referência: de detalhe, de fração, de arranjo e de codificação extra.

Estudo de origem: [`_estudo/familias/06_pizza.md`](../_estudo/familias/06_pizza.md). Catálogo desta família: [`_estudo/catalogo/06_pizza.json`](../_estudo/catalogo/06_pizza.json).

## O que a família responde

Perguntas típicas no Farol, com dado fictício:

- **Comercial:** quanto da receita reconhecida do trimestre veio de cliente novo? Um motivo de perda domina os demais?
- **Pré-vendas:** que fração das agendas marcadas virou reunião realizada, remarcada ou não comparecimento?
- **Marketing:** como o investimento do mês se divide entre as três plataformas de mídia? Que parte dos leads chegou sem origem declarada?
- **Diretoria:** como o custo do trimestre se reparte nas três camadas (mídia, time, estrutura)?

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | O que responde |
|---|---|---|---|---|---|
| 01 | Pizza simples | [./01_pizza-simples/](./01_pizza-simples/) | Recharts nativo | 4 | Fração de 2 a 5 partes de um todo; absorve rótulos externos, fatia em destaque e legenda tabular. |
| 02 | Pizza com detalhamento de Outros | [./02_pizza-com-detalhamento-de-outros/](./02_pizza-com-detalhamento-de-outros/) | Recharts custom | 4 | O que existe dentro de Outros, ao lado da pizza ou por drilldown. |
| 03 | Pizza de fração única | [./03_pizza-de-fracao-unica/](./03_pizza-de-fracao-unica/) | Recharts nativo | 4 | Uma parte contra o restante, como glifo ao lado do número ou em célula. |
| 04 | Pizzas e roscas em small multiples | [./04_pizzas-em-small-multiples/](./04_pizzas-em-small-multiples/) | Recharts nativo | 4 | A mesma composição em 2 a 4 todos; absorve as roscas em small multiples da família 07. |
| 05 | Pizza de raio variável | [./05_pizza-de-raio-variavel/](./05_pizza-de-raio-variavel/) | Recharts custom | 4 | Participação no ângulo e uma segunda métrica no raio, em peça exploratória. |
| 06 | Pizzas proporcionais ao total | [./06_pizzas-proporcionais-ao-total/](./06_pizzas-proporcionais-ao-total/) | Recharts custom | 4 | Composição de todos com totais muito diferentes, com área pelo total. |

As pastas dos modelos são criadas quando as versões forem produzidas.

## Quando a família serve

- Uma parte do todo é a mensagem e o leitor precisa perceber a fração num relance: um quarto, metade, três quartos.
- De 2 a 5 partes exclusivas que somam um total declarado, com a ausência de dado como fatia visível e por último.
- Coluna estreita, barra lateral ou glifo ao lado de um número, onde a pizza ocupa pouco espaço.
- Poucos todos (até 4) com a mesma composição, lidos de forma aproximada.

## Quando procurar outra família

- Comparar partes de tamanho parecido ou ordená-las com precisão: barra horizontal (02).
- Composição de cinco todos ou mais: barra 100% empilhada (03).
- Participação que muda ao longo do tempo: linha (04) ou área (05).
- Valores com negativo, categorias sobrepostas ou soma diferente do total: barra (02).
- Caminho até meta que pode ser ultrapassada: progresso, meta e gauge (13).
- Parte e todo com furo central e número no meio: rosca e radial (07).
- Hierarquia com vários níveis: hierarquia (12).
- Contagem de unidades inteiras que precisa ser lida exata: waffle e pictograma (22).

## Guia rápido: qual modelo escolher

1. **Uma parte só contra o restante?** Fração única (03). Se a fração fica abaixo de 5% ou acima de 95%, ou se existe meta, vá para progresso (13).
2. **De 2 a 5 partes de um todo?** Pizza simples (01). Nome longo ou fatia fina pede rótulo externo (v4); mensagem numa parte pede destaque (v2); card estreito ou número exato pede legenda tabular (v3).
3. **Mais de 5 partes e a cauda precisa existir?** Detalhamento de Outros (02). Se a cauda é a mensagem, barra horizontal com top N (02 da família de barras).
4. **Mesma composição em vários todos de tamanho parecido?** Small multiples (04), até 4 todos; com rosca binária e número central, até uns 12 grupos.
5. **Mesma composição em todos de tamanho muito diferente?** Pizzas proporcionais ao total (06), com área pelo total e o total escrito.
6. **Duas métricas por categoria e uma delas é participação?** Raio variável (05), só em aba de análise; no painel operacional, barras pareadas (02) ou dispersão (09).

Regras que valem para os seis modelos:

- Ângulo do Recharts começa às 3 horas e cresce no sentido anti-horário: `startAngle={90}` e `endAngle={-270}` para começar às 12 horas no sentido horário.
- Ordem decrescente, com Outros e Sem informação no fim; categoria com ordem natural mantém essa ordem; em small multiples a ordem é fixa entre as pizzas.
- Um destaque em `--chart-1` e o resto em neutro; categóricas por slot fixo na ordem 1, 3, 6, 5, 2, 4; separador `stroke="var(--surface-raised)"`.
- Ausência vazada com contorno `--text-muted`, sempre visível e por último; cobertura declarada na linha de leitura.
- Sem 3D, brilho, sombra, transparência ou gradiente; `activeIndex` e `blendStroke` saíram no Recharts 3.

## Referências cruzadas

| Visual | Onde mora | Por quê |
|---|---|---|
| Pizza em semicírculo (06#4 do estudo) | [07_rosca-e-radial, modelo 02 semi rosca](../07_rosca-e-radial/02_semi-rosca/) | A geometria de meio arco é a mesma com ou sem furo e ficou numa pasta só. |
| Pizza com agulha | [13_progresso-meta-e-gauge, modelo 06 gauge com ponteiro](../13_progresso-meta-e-gauge/06_gauge-com-ponteiro/) | A agulha lê posição numa escala, não fração de um todo. |
| Pizza quadrada (square pie) | [22_unidades-waffle-e-pictograma, modelo 01 waffle](../22_unidades-waffle-e-pictograma/01_waffle/) | Unidades em grade medem melhor que ângulo; é o waffle 10 por 10. |
| Sunburst | [12_hierarquia, modelo 03 sunburst](../12_hierarquia/03_sunburst/) | Anéis de vários níveis são hierarquia, não parte de um todo único. |
| Rosca, rosa de Nightingale, anel segmentado | [07_rosca-e-radial](../07_rosca-e-radial/) | Furo central, barra radial e unidades em anel têm família própria. |
| Pizza como marcador em mapa ou dispersão | [23_mapas](../23_mapas/) e [09_dispersao-e-bolhas](../09_dispersao-e-bolhas/) | A pizza vira símbolo sobre outra geometria. |
| Glifo de pizza em célula | [24_microvisuais-sparklines](../24_microvisuais-sparklines/) e [14_tabelas-visuais](../14_tabelas-visuais/) | Quando a tabela é o principal; a fração única (03) é o desenho de base. |
| Pizza 3D, com brilho ou transparência | fora do catálogo | Antipadrão: a mesma pizza parece três pizzas diferentes quando inclinada. |

## Referências

Só links que já constam do estudo da família (e da seção 12 do estudo 07, de onde vêm as roscas em small multiples) e da varredura de portais. O número entre parênteses indica o modelo em que a referência mais pesa.

### Método e praticantes

- [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf) (01, 04, 06): observar o mesmo 25% legível antes e ilegível depois de ordenar; a pizza rotulada que vira "tabela mal arranjada"; a série de quatro pizzas por ano redesenhada como barras e depois como linha; Playfair e o teste do círculo 16 vezes maior; o custo da legenda.
- [Stephen Few, Our Irresistible Fascination with All Things Circular (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf) (06): observar o infográfico que usou diâmetro no lugar da área e que forma circular gasta espaço para dizer pouco em painel denso.
- [Storytelling with Data, what is a pie chart](https://www.storytellingwithdata.com/blog/2020/5/14/what-is-a-pie-chart) (01, 02): observar ordenar decrescente, rotular direto e consolidar as pequenas em "All other".
- [Storytelling with Data, death to pie charts](https://www.storytellingwithdata.com/blog/2011/07/death-to-pie-charts) (01): observar a crítica à cor arbitrária, que cria ilusão de tamanho.
- [Nightingale, Have I Resolved the Pie Chart Debate?](https://nightingaledvs.com/have-i-resolved-the-pie-chart-debate/) (03): observar os seis critérios e a distinção entre perceber fração e comparar partes.
- [Datawrapper Academy, what to consider when creating a pie chart](https://www.datawrapper.de/academy/what-to-consider-when-creating-a-pie-chart) (03): observar "pizza pode ser desnecessária com dois valores" e "funciona melhor perto de 25%, 50% ou 75%".
- [Datawrapper blog, pie charts](https://www.datawrapper.de/blog/pie-charts) (01, 02): observar "rotule fora as fatias menores" e o agrupamento em outros.

### Catálogos e documentação

- [Data Visualisation Catalogue, pie chart](https://datavizcatalogue.com/methods/pie_chart.html) (01): observar as funções listadas (comparação, parte do todo, proporção) e o limite de poucos valores.
- [Datawrapper Academy, customizing your pie chart](https://www.datawrapper.de/academy/customizing-your-pie-chart) (01, 02): observar rótulo interno e externo ligáveis em separado, a legenda que some com rótulo externo e o agrupamento automático das menores acima de cinco fatias.
- [Recharts, Pie Chart With Customized Label](https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/) (01): observar o cálculo do rótulo por `midAngle` e a cor aplicada por `shape`, sem `Cell`.
- [Recharts, Custom Active Shape Pie Chart](https://recharts.github.io/en-US/examples/CustomActiveShapePieChart/) (01): observar o `Sector` externo e a linha guia desenhados só para o setor ativo.
- [Recharts, Pie Chart with gap and rounded corners](https://recharts.github.io/en-US/examples/PieChartWithPaddingAngle/) (01): observar `paddingAngle={5}` e `cornerRadius`, que são estéticos e encolhem proporcionalmente mais as fatias pequenas.
- [Recharts, Two Level Pie Chart](https://recharts.github.io/en-US/examples/TwoLevelPieChart/) (01): observar `defaultIndex` no `Tooltip`, que deixa um item ativo ao abrir.
- [Recharts, Pie Chart in Grid](https://recharts.github.io/en-US/examples/PieChartInGrid/) (04): observar pizzas e roscas `responsive` em células de tamanhos diferentes da grade CSS.
- [Recharts, API do Pie](https://recharts.github.io/en-US/api/Pie/) (01, 05): observar `shape` checando `isActive` para desenhar o setor ativo.
- [Recharts, guia de migração 3.0](https://github.com/recharts/recharts/wiki/3.0-migration-guide) (todos): observar a remoção de `activeIndex` e a troca de `blendStroke` por `stroke`.
- [shadcn, chart-pie-donut-active (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-active.tsx) (01): observar o `Sector` com `outerRadius + 10` para o índice ativo.
- [shadcn, charts de pizza](https://ui.shadcn.com/charts/pie) (01): coleção de 12 variantes de pizza em Recharts, com cor por item no próprio dado.
- [Tremor, donut chart](https://www.tremor.so/docs/visualizations/donut-chart) (01): observar a variante `pie`, o rótulo central e o `onValueChange` que desmarca no segundo clique.
- [Vega-Lite, Pie Chart with Labels](https://vega.github.io/vega-lite/examples/layer_arc_label.html) (01): observar a camada de texto em raio maior que o do arco e o `stack: true` no theta.
- [Vega-Lite, Radial Plot](https://vega.github.io/vega-lite/examples/arc_radial.html) (05): observar escala `sqrt`, `zero: true`, `rangeMin: 20` e o aviso sobre a área total.
- [AG Charts, donut series](https://www.ag-grid.com/charts/react/donut-series/) (01): observar a distinção entre `calloutLabel` (externo com linha guia) e `sectorLabel` (interno).
- [AG Charts, pie with variable radius](https://www.ag-grid.com/charts/gallery/pie-with-variable-radius/) (05): observar as duas codificações explicadas no tooltip.
- [Highcharts, variable radius pie](https://www.highcharts.com/demo/highcharts/variable-radius-pie) (05): a página abriu só com título.
- [Highcharts, pie with drilldown](https://www.highcharts.com/demo/highcharts/pie-drilldown) (02): a página abriu só com título; o comportamento fica no editor externo.
- [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md) (04, 06): observar a indicação de símbolo proporcional para grandes variações e o centro da rosca como espaço para mais informação.
- [Wikipedia, pie chart](https://en.wikipedia.org/wiki/Pie_chart) (03): observar que a pizza funciona para comparar uma categoria contra o total e que ring e multilevel aparecem como variantes.
- [RAWGraphs, tutoriais](https://www.rawgraphs.io/learning) (04): pizza entre os tutoriais da ferramenta; a página do tutorial em si abriu só com a introdução.

Referências dos visuais que foram para outra família: [Recharts, Straight Angle Pie Chart](https://recharts.github.io/en-US/examples/StraightAnglePieChart/) (semicírculo; observar `cy="100%"` e o raio relativo ao contêiner), [Highcharts, semi circle donut](https://www.highcharts.com/demo/highcharts/pie-semi-circle) (abriu só com título e navegação) e [Recharts, Pie Chart With Needle](https://recharts.github.io/en-US/examples/PieChartWithNeedle/) (agulha em SVG próprio, girada pelo `midAngle`).

### Portais de design

A qualidade visual dos shots do Dribbble não foi conferida: a página chega vazia no leitor. Olhe o shot antes de adotar.

- [Behance, Mobile Dashboard w/ Real Data, Dark theme UI](https://www.behance.net/gallery/51204899/Mobile-Dashboard-w-Real-Data-Dark-theme-UI) (01): pizza animada em app escuro; observar o contraste do separador.
- [Behance, Visualize Your Expenses with Donut Chart UI Design](https://www.behance.net/gallery/168471219/Visualize-Your-Expenses-with-Donut-Chart-UI-Design) (01): rosca de despesas com categorias listadas numa interface, referência para a legenda tabular (a página traz título e tags).
- [Behance, Pie Chart, Graphic Design](https://www.behance.net/gallery/110138073/Pie-Chart-Graphic-Design) (01): widget de pizza com transformações 3D em card; observar como contra-exemplo de destaque por profundidade.
- [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29) (03, 04): kit escuro com pizzas pequenas, roscas repetidas e círculos de progresso.
- [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options) (04): observar só o método de comparar várias formas para o mesmo dado antes de escolher; a biblioteca não entra no Farol.
- [Behance, Data Driven Polar Charts PowerPoint Template](https://www.behance.net/gallery/95759279/Data-Driven-Polar-Charts-PowerPoint-Template-Nulivo) (05): kit de gráficos polares para indicadores (a página descreve só o tipo de template).
- [Dribbble, Pie Chart Infographic](https://dribbble.com/shots/11927332-Pie-Chart-Infographic) (01, não abriu): rótulo fora da fatia em linguagem de infográfico.
- [Dribbble, Pie Chart Design](https://dribbble.com/shots/3293014-Pie-Chart-Design) (01, não abriu): pizza como componente de interface.
- [Dribbble, Animated Pie Chart, 49 Days of Charts](https://dribbble.com/shots/17791263-Animated-Pie-Chart-49-Days-of-Charts) (01, não abriu): entrada por varredura angular; no Farol a animação roda só na entrada e respeita quem pediu menos movimento.
- [Dribbble, 3d pie chart](https://dribbble.com/shots/17103726-3d-pie-chart) (resultado de busca): pizza 3D animada; contra-exemplo explícito.
- [Muzli, best dashboard design examples 2026](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/) (aberto): observar a lista de antipadrões de dashboard: pizza com mais de 4 fatias, efeito 3D e visual decorativo que não informa decisão.

Não carregaram e ficaram fora: a página de pizza do Data Viz Project (HTTP 403) e a Figma Community (HTTP 403).
