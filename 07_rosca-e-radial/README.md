# Rosca e radial

A família reúne as formas em coordenada polar que não são pizza cheia: a **rosca**, que mostra parte do todo e aproveita o centro para o total ou o item ativo; os **arcos e anéis**, que medem ranking, composição e contagem em comprimento de arco; e as **colunas radiais e a rosa**, que mostram magnitude ao longo de um ciclo. O ganho é conhecido: a leitura sai da área e vai para o comprimento do arco, e o miolo vira espaço útil. O preço também: o mesmo ângulo fica mais comprido no anel de fora, e a forma circular só se paga quando o círculo significa alguma coisa (um todo, uma meta, um ciclo de horas ou meses). Por isso todo modelo daqui escreve o valor na marca e declara a distorção.

Estudo de origem: [`_estudo/familias/07_rosca-e-radial.md`](../_estudo/familias/07_rosca-e-radial.md). Catálogo desta família: [`_estudo/catalogo/07_rosca-e-radial.json`](../_estudo/catalogo/07_rosca-e-radial.json).

## O que a família responde

Perguntas típicas no Farol, com dado fictício:

- **Comercial:** quanto dos R$ 7,4 mi da carteira aberta está em cada etapa, com o total no centro? Qual motivo explica a maior parte das perdas do trimestre? O executivo passou da meta de reuniões?
- **Pré-vendas:** quantas das 20 agendas da meta semanal já foram marcadas? Como as agendas se dividem por canal e por resultado? Em que horas do dia a fila recebe entradas? Em quantos dias úteis cada fila cumpriu o SLA?
- **Marketing:** como o investimento do mês se reparte por plataforma? A composição de origens mudou de um mês para o outro? Em que meses do ano a mídia paga pesa mais e em que semanas o CPL fugiu da média?
- **Diretoria:** como o custo de cada mês se reparte entre mídia, time e estrutura ao longo de 12 meses?

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | O que responde |
|---|---|---|---|---|---|
| 01 | Rosca com total central | [./01_rosca-com-total-central/](./01_rosca-com-total-central/) | Recharts nativo | 4 | De que é feito o total, com o total ou o item ativo no centro; absorve a rosca com fatia ativa. |
| 02 | Semi rosca | [./02_semi-rosca/](./02_semi-rosca/) | Recharts nativo | 4 | Composição ou progresso empilhado numa faixa baixa e larga; absorve a pizza em semicírculo da família 06. |
| 03 | Anéis concêntricos de dois períodos | [./03_aneis-concentricos-de-dois-periodos/](./03_aneis-concentricos-de-dois-periodos/) | Recharts nativo | 4 | Como a mesma composição mudou entre dois períodos fechados. |
| 04 | Barra radial | [./04_barra-radial/](./04_barra-radial/) | Recharts nativo | 4 | Ranking curto como peça de capa; absorve a barra radial empilhada. |
| 05 | Anel segmentado em unidades | [./05_anel-segmentado-em-unidades/](./05_anel-segmentado-em-unidades/) | Recharts nativo | 4 | Quantas unidades de um total discreto (até 40) estão em cada status. |
| 06 | Coluna radial (barplot circular) | [./06_coluna-radial/](./06_coluna-radial/) | SVG puro | 4 | Magnitude ao longo de um ciclo longo ou de muitas categorias; absorve o pirulito radial e a linha do tempo radial. |
| 07 | Rosa de Nightingale | [./07_rosa-de-nightingale/](./07_rosa-de-nightingale/) | Recharts custom | 4 | Magnitude em ciclo de 12 meses ou 7 dias, com área proporcional ao valor; absorve colunas radiais e rosa da família 18. |

As pastas dos modelos são criadas quando as versões forem produzidas.

## Quando a família serve

- Parte do todo com 2 a 5 partes em que o total, ou o item ativo, merece o centro do cartão.
- Contagem ou composição que cabe num espaço quadrado ou numa faixa baixa, como peça de capa do painel.
- Ciclo com sentido circular: 24 horas, 7 dias, 12 meses ou 365 dias.
- Contagem inteira pequena contra um total discreto, como agendas da semana ou dias úteis do mês.

## Quando procurar outra família

- Comparar categorias de tamanho parecido ou ordená-las com precisão: barra horizontal (02).
- Composição em três períodos ou mais: barra 100% (03) ou linha de participação (04).
- Uma fração só contra meta, ou 2 a 4 metas do mesmo período: progresso, meta e gauge (13).
- Agulha, escala e faixas qualitativas: gauge (13).
- Hierarquia de dois níveis ou mais: sunburst (12).
- Uma rosca por grupo, lado a lado: small multiples (06).
- Mais de 40 unidades: waffle (22).
- Várias métricas por categoria: radar (18). Fluxo entre categorias em círculo: corda (27).
- Série temporal sem ciclo: colunas (03) ou linha (04).

## Guia rápido: qual modelo escolher

1. **De 2 a 5 partes de um todo e o total é a informação principal?** Rosca com total central (01). Para explorar sem rótulo em cada fatia, fatia ativa (v2); carteira em etapas com valor e contagem no centro (v3); cauda quase nula e origem ausente (v4).
2. **O cartão é uma faixa baixa e larga, ou há 2 ou 3 séries empilhadas contra uma meta?** Semi rosca (02). Três filas lado a lado pedem a faixa de semicírculos (v3); soma acima da meta pede selo, nunca arco além de 180 graus (v4).
3. **A pergunta é se a composição mudou entre dois períodos?** Anéis concêntricos (03), com a variação escrita em pontos percentuais. Categoria nova sem período anterior entra no fim e marcada como sem dado (v4).
4. **Ranking curto de 3 a 7 categorias como peça de capa?** Barra radial (04), com arco máximo de 270 graus. Composição em arco com até três segmentos (v3). Se uma categoria esmaga as demais, barra horizontal (02).
5. **Contagem inteira de até 40 unidades com status?** Anel segmentado (05). Acima de 40, waffle (22).
6. **Ciclo de 24 horas, 365 dias ou 40 categorias ou mais?** Coluna radial (06). Janela de atendimento sobre o ciclo (v2); desvio com negativos em pirulito radial com o zero num anel intermediário (v4).
7. **Magnitude em ciclo de 12 meses ou 7 dias, lida por área?** Rosa de Nightingale (07), sempre com raio pela raiz quadrada. Camadas de custo empilhadas (v3); meses ainda a realizar (v4).
8. **Nada disso?** Uma fração contra meta mora em progresso radial de anel único (13/03); metas concêntricas em 13/04; dois níveis hierárquicos em sunburst (12/03); roscas por grupo em 06/04.

## Regras transversais

- Tudo da família 06 vale aqui: todo verdadeiro, teto de 5 fatias, ordem decrescente a partir das 12 horas (`startAngle={90}` e `endAngle={-270}`), separador em `var(--surface-raised)`, sem 3D e dado ausente declarado com procedência.
- Espessura do anel: `innerRadius` entre 60% e 80% do `outerRadius`. Fino demais vira contorno; grosso demais volta a ser pizza.
- O centro tem função: total, item ativo ou valor contra meta, nunca ícone decorativo. Número central por `Label` com `content` dentro do `Pie` ou do `PolarRadiusAxis`; componente próprio embrulhando `Label` precisa de `displayName = 'Label'` no Recharts 3. Alternativa: `div` absoluto sobre o gráfico.
- Domínio angular explícito no `RadialBar`: `PolarAngleAxis type="number" domain={[0, meta]} tick={false}`. Sem ele, um valor único enche o anel.
- Distorção polar declarada: o mesmo ângulo é mais comprido por fora. Valor escrito em cada anel ou barra, e ordem dos anéis por importância ou declarada.
- Acima de 100%: selo com o excedente ou segunda volta em tom mais escuro. Nunca cortar em 100% em silêncio.
- Trilho por `background` no `RadialBar` com `fill: 'var(--surface-sunken)'`, ou `PolarGrid gridType="circle" radialLines={false}`. A receita dizia `var(--surface-overlay)` até 2026-09-29, e é o token que os modelos 02, 04 e 05 tinham copiado: no tema claro ele é o mesmo branco do cartão e o trilho não aparece (`TOK-1`).
- Tamanho mínimo: raio externo de 56 px para número de dois dígitos a 24 px no centro; abaixo disso o número vai para o lado.
- Cor por item no dado (`fill: 'var(--chart-1)'`); semântica (`--positive`, `--warning`, `--negative`) só quando a polaridade da métrica é conhecida.
- `activeIndex` e `blendStroke` saíram no Recharts 3: estado ativo por `shape` que lê `isActive`, ou por estado React próprio.
- Valor no raio pede cuidado com a área: na rosa, raio pela raiz quadrada do valor, senão a área cresce ao quadrado; na coluna radial, círculo interno com mais da metade do raio para conter o mesmo efeito. **Havendo furo central, a raiz fica por fora da soma inteira**, `Math.sqrt(rMin ** 2 + (rMax ** 2 - rMin ** 2) * (v / topo))`, porque a área de um setor de anel vale `r² − rMin²`: a forma com a raiz por dentro parece corrigida e ainda exagera o pequeno em até 2,16 pontos percentuais (medido em 2026-09-28 no modelo 07).
- Celular: o número central fica; legenda e rótulos descem para baixo do gráfico.

## Referências cruzadas

| Visual | Onde mora | Por quê |
|---|---|---|
| Rosca aninhada hierárquica (07#3 do estudo) | [12_hierarquia, modelo 03 sunburst](../12_hierarquia/03_sunburst/) | Anel interno de pais e externo de filhos é um sunburst de dois níveis; mais níveis seguem a mesma geometria. |
| Progresso circular (07#6) | [13_progresso-meta-e-gauge, modelo 03 progresso radial de anel único](../13_progresso-meta-e-gauge/03_progresso-radial-de-anel-unico/) | Um valor contra meta lê posição numa escala, não parte de um todo. |
| Anéis de atividade (07#7) | [13_progresso-meta-e-gauge, modelo 04 anéis concêntricos](../13_progresso-meta-e-gauge/04_aneis-concentricos/) | Cada anel mede uma meta própria; o conjunto é progresso, não composição. |
| Roscas em small multiples (07#12) | [06_pizza, modelo 04 pizzas e roscas em small multiples](../06_pizza/04_pizzas-em-small-multiples/) | Grade de roscas pequenas com a mesma métrica central segue a regra da grade de pizzas. |
| Radar | [18_radar](../18_radar/) | Várias métricas por categoria em eixos radiais; aqui o eixo angular é categoria ou ciclo de uma métrica só. |
| Corda | [27_rede-e-relacoes, modelo 07 chord simétrico](../27_rede-e-relacoes/07_chord-simetrico/) | Arcos no perímetro ligados por fitas medem fluxo entre categorias, não magnitude. |
| Gauge com agulha, faixas e escala | [13_progresso-meta-e-gauge, modelo 06 gauge com ponteiro](../13_progresso-meta-e-gauge/06_gauge-com-ponteiro/) | A semi rosca (02) não tem agulha nem faixas e não deve parecer gauge. |
| Rosca de raio variável | [06_pizza, modelo 05 pizza de raio variável](../06_pizza/05_pizza-de-raio-variavel/) | Participação no ângulo e segunda métrica no raio é a mesma codificação com ou sem furo. |
| Espiral temporal de vários anos | [04_linhas](../04_linhas/) ou [20_cronograma-e-linha-do-tempo](../20_cronograma-e-linha-do-tempo/) | A volta mais recente fica mais longa e parece maior; a coluna radial (06) cobre um ciclo só. |
| Rosca minúscula em KPI ou célula | [01_cards-e-kpis](../01_cards-e-kpis/), [14_tabelas-visuais](../14_tabelas-visuais/) e [24_microvisuais-sparklines](../24_microvisuais-sparklines/) | Quando o número ou a tabela é o principal, o glifo mora com eles. |
| Pizza em semicírculo (06#4) | [02 semi rosca, nesta família](./02_semi-rosca/) | Absorvida: meio arco com ou sem furo usa a mesma geometria. |
| Pirulito radial (18#9) e linha do tempo radial (20#19) | [06 coluna radial, nesta família](./06_coluna-radial/) | Absorvidos: o mesmo setor de anel sobre um ciclo, com menos tinta ou com janela de período. |
| Colunas radiais e rosa (18#8) | [07 rosa de Nightingale, nesta família](./07_rosa-de-nightingale/) | Absorvida: ângulo igual por passo do ciclo e raio pela raiz quadrada do valor. |

## Referências

Só links que já constam do estudo da família e da varredura de portais de design. O número entre parênteses indica o modelo em que a referência mais pesa. Bibliotecas fora da stack (AG Charts, Nivo, Highcharts, Chart.js, Vega-Lite) entram como referência de anatomia e de regra; nenhuma delas entra no Farol.

### Método e praticantes

- [From Data to Viz, donut plot](https://www.data-to-viz.com/graph/donut.html) (01): observar o limite de poucas categorias e o centro para total e percentuais.
- [From Data to Viz, circular barplot](https://www.data-to-viz.com/graph/circularbarplot.html) (06): observar os erros listados: círculo interno pequeno, poucos itens, falta de escala e ordem arbitrária.
- [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf) (03): observar por que comparar partes entre pizzas é difícil e a crítica ao gráfico de dois níveis de parte do todo.
- [Stephen Few, Our Irresistible Fascination with All Things Circular (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf) (todos): observar gauges circulares gastando um painel inteiro para dizer o que quatro bullet graphs dizem numa faixa.
- [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart) (05): observar a legenda que diz o que cada unidade representa.
- [Nightingale, Finding The Right Elements For an Award-Winning Dashboard](https://nightingaledvs.com/elements-for-an-award-winning-dashboard/) (04): observar a autora admitir que radial não é visual comum de painel e usá-lo para sobrepor uma rosca ao ranking.

### Catálogos e documentação

- [Data Visualisation Catalogue, donut chart](https://datavizcatalogue.com/methods/donut_chart.html) (01): observar a troca de leitura de área para comprimento de arco e o uso do miolo.
- [Data Visualisation Catalogue, radial bar chart](https://datavizcatalogue.com/methods/radial_bar_chart.html) (03, 04): observar a distorção das barras externas, que vale também para anéis concêntricos.
- [Data Visualisation Catalogue, radial column chart](https://datavizcatalogue.com/methods/radial_column_chart.html) (06): observar o zero num anel externo para acomodar negativos.
- [Data Visualisation Catalogue, Nightingale rose chart](https://datavizcatalogue.com/methods/nightingale_rose_chart.html) (07): observar a ênfase exagerada dos setores externos.
- [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md) (01, 05): observar o centro da rosca como espaço para mais informação e a regra de números inteiros para grades de unidades.
- [Recharts, Custom Active Shape Pie Chart](https://recharts.github.io/en-US/examples/CustomActiveShapePieChart/) (01): observar `activeShape` com segundo `Sector` e linha até o valor.
- [Recharts, Straight Angle Pie Chart](https://recharts.github.io/en-US/examples/StraightAnglePieChart/) (02): observar ângulos e centro na base.
- [Recharts, Pie Chart with gap and rounded corners](https://recharts.github.io/en-US/examples/PieChartWithPaddingAngle/) (05): observar `paddingAngle={5}` e `cornerRadius="50%"`, que no anel segmentado viram vão calculado por N e canto reto.
- [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/) (04): observar `background`, `barSize`, rótulo no início do arco e legenda à direita com `cx="30%"`.
- [Recharts, Radial Bar Chart with Click to Focus Legend](https://recharts.github.io/en-US/examples/RadialBarChartClickToFocusLegendExample/) (04): observar o contexto React compartilhado entre legenda e setor e a transição de opacidade.
- [Recharts, API do RadialBar](https://recharts.github.io/en-US/api/RadialBar/) e [API do PolarAngleAxis](https://recharts.github.io/en-US/api/PolarAngleAxis/) (02, 04): observar `background`, `cornerRadius`, `minPointSize`, `type` e `domain`.
- [Recharts, API do Sector](https://recharts.github.io/en-US/api/Sector/) (07): consultada no estudo para o `shape` da rosa, que desenha cada setor com raio próprio.
- [Recharts, guia de migração 3.0](https://github.com/recharts/recharts/wiki/3.0-migration-guide) (todos): observar a remoção de `activeIndex` e `blendStroke` e o `accessibilityLayer` ligado por padrão.
- [shadcn, charts radiais](https://ui.shadcn.com/charts/radial) (02, 04): coleção de variantes radiais em Recharts consultada no estudo.
- [shadcn, chart-pie-donut-text (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-text.tsx) (01): observar o total calculado e desenhado no centro em duas linhas.
- [shadcn, chart-pie-donut-active (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-active.tsx) (01): observar o índice ativo desenhado com raio maior.
- [shadcn, chart-radial-stacked (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-stacked.tsx) (02, 04): observar `endAngle={180}`, `stackId`, `cornerRadius` e o `Label` dentro do `PolarRadiusAxis`.
- [Tremor, donut chart](https://www.tremor.so/docs/visualizations/donut-chart) (01): observar `onValueChange` e o desmarcar no segundo clique.
- [AG Charts, donut series](https://www.ag-grid.com/charts/react/donut-series/) (01): observar `innerLabels`, `innerCircle` e `sectorSpacing`; boa referência de anatomia do miolo.
- [AG Charts, pie in a donut](https://www.ag-grid.com/charts/gallery/pie-in-a-donut/) (03): observar `outerRadiusRatio` da pizza interna, rótulos escondidos abaixo de 10% e o tooltip comparativo com setas de variação.
- [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/) (04, 06): observar as variantes simples, empilhada e invertida da barra radial e da coluna radial.
- [AG Charts, stacked radial bar](https://www.ag-grid.com/charts/gallery/stacked-radial-bar/) (04): observar `innerRadiusRatio` pequeno, rótulos de eixo desligados e o formatador de valor.
- [AG Charts, simple nightingale](https://www.ag-grid.com/charts/gallery/simple-nightingale/) (07): observar a linha de média no eixo radial e a opacidade condicional.
- [Nivo, radial bar](https://nivo.rocks/radial-bar/) (04): observar trilhos, eixos radial e circular, o formato de dados em grupos com séries e o aviso de que a margem não considera os rótulos.
- [Highcharts, documentação de pizza](https://www.highcharts.com/docs/chart-and-series-types/pie-chart) (03): observar a rosca montada com várias séries de `size` e `innerSize` diferentes, a mesma técnica dos anéis concêntricos.
- [Highcharts, semi circle donut](https://www.highcharts.com/demo/highcharts/pie-semi-circle) (02): a página abriu só com título.
- [Highcharts, donut chart](https://www.highcharts.com/demo/highcharts/pie-donut) (01, 03): listada entre as fontes do estudo, sem descrição da página.
- [Chart.js, polar area](https://www.chartjs.org/docs/latest/charts/polar.html) (07): observar a definição por ângulo igual e raio variável.
- [Vega-Lite, Radial Plot](https://vega.github.io/vega-lite/examples/arc_radial.html) (07): observar a escala `sqrt` no raio.

Referências dos visuais que foram para outra família: [Recharts, Two Level Pie Chart](https://recharts.github.io/en-US/examples/TwoLevelPieChart/) e [AG Charts, multiple donut charts](https://www.ag-grid.com/charts/gallery/multiple-donuts/) (rosca aninhada, 12/03; observar raios relativos e agregação no anel interno com detalhe no externo); [Tremor, progress circle](https://www.tremor.so/docs/visualizations/progress-circle) e [shadcn, chart-radial-text (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-text.tsx) (progresso circular, 13/03; observar `value`, `max`, o estado zero e o `PolarGrid` como trilho); [Recharts, Pie Chart in Grid](https://recharts.github.io/en-US/examples/PieChartInGrid/) (roscas em small multiples, 06/04; observar roscas `responsive` em grade CSS).

### Portais de design

A qualidade visual dos shots do Dribbble não foi conferida: a página chega vazia no leitor. Olhe o shot antes de adotar. Na Behance a página de projeto chega em modo texto e muitas vezes sem descrição.

- [Behance, Donut, Chart UI](https://www.behance.net/gallery/201371225/Donut-Chart-UI) (01): estudo de interface de rosca (a página traz só título, ferramentas e tags).
- [Behance, The Art and Science of Speaking Donut Charts](https://www.behance.net/gallery/179227873/The-Art-and-Science-of-Speaking-Donut-Charts) (01): estudo sobre roscas em ferramentas de BI (a página traz só título e tags).
- [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29) (02): roscas e círculos de progresso num kit escuro; observar o contraste de trilho e arco no fundo escuro.
- [Behance, Crowdinvesting Interest Rate](https://www.behance.net/gallery/75245591/Crowdinvesting-Interest-Rate) (04): infográfico editorial com barra radial de taxas em dois anos.
- [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options) (04): barra radial empilhada comparada com sankey, corda e barras para o mesmo dado; o cliente escolheu o sankey por legibilidade. Observar só o método; a biblioteca não entra no Farol.
- [Behance, D3.js 2023 Disaster Hotspots Dashboard](https://www.behance.net/gallery/236085929/D3js-2023-Disaster-Hotspots-Dashboard) (07): rosa como peça principal, com hover que filtra por tipo junto de um mapa de pontos.
- [Behance, Florence Nightingale, Visualización de Datos](https://www.behance.net/gallery/124198669/Florence-Nightingale-Visualizacion-de-Datos) (07): releitura do formato (a página traz só título e tags).
- [Behance, Axure Tutorial, Progress Ring](https://www.behance.net/gallery/180372547/Axure-Tutorial-Practices-and-Examples-29Progress-Ring) (foi para 13/03): componente de anel de progresso (a página traz só o texto introdutório).
- [Dribbble, Radial Chart](https://dribbble.com/shots/20464065-Radial-Chart) (04, não abriu): barra radial com grande engajamento no portal; referência de acabamento de trilho e ponta arredondada.
- [Dribbble, Universal Data Visualization, Donut Chart](https://dribbble.com/shots/18753894-Universal-Data-Visualization-Donut-Chart) (01, não abriu): rosca de um kit de visualização para Figma, com valor central.
- [Dribbble, Radial histogram charts](https://dribbble.com/shots/22332016-Radial-histogram-charts) (06, resultado de busca): histograma radial; bom para ver o limite de leitura do formato.
- [Figma Community, charts com rosca e radial](https://www.figma.com/community/file/1379803816977878437/charts-line-chart-bar-chart-pie-chart-donut-radar-scatter-cahrt-buble-radial) (01, 04, resultado de busca): arquivo com rosca e radial lado a lado com linha, barra, radar e bolha.

Não carregaram e ficaram fora: a página de rosca do Data Viz Project (HTTP 403), a demo de anéis de atividade do Highcharts (o endereço tentado deu 404) e a Figma Community aberta direto (HTTP 403).
