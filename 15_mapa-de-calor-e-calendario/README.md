# Mapa de calor e calendário

Mapa de calor codifica um valor pela cor de uma célula posicionada numa grade de duas dimensões discretas. A família responde três perguntas com a mesma geometria: **quando acontece** (tempo cíclico, como dia da semana por hora, dia do ano ou dia do mês), **onde está o extremo e qual é o padrão** (matriz de categorias, como executivo por segmento ou métrica por métrica) e **se grupos novos se comportam melhor que os antigos** (coorte por tempo decorrido). A cor não é o canal mais preciso para quantidade, mas é o único que deixa uma grade inteira visível de uma vez; por isso a legenda é obrigatória e o número dentro da célula resolve quando cabe.

Catálogo VISUAIS do Farol, 2026-09-14. Estudo de origem: [`_estudo/familias/15_mapa-de-calor-e-calendario.md`](../_estudo/familias/15_mapa-de-calor-e-calendario.md). Todos os casos de uso são fictícios.

## Quando a família serve

O que ela responde em cada público do Farol:

* **Pré-vendas:** em que dia e hora chegam os leads, e o SDR está disponível nessa janela; em quais dias cada fila estourou o SLA; quais SDRs passaram do teto de capacidade de agenda e em quais semanas.
* **Comercial:** quais cohorts de oportunidades convertem melhor aos 3 meses; entre quais etapas a oportunidade mais retrocede; em que segmento cada executivo ganha e perde; onde as oportunidades abertas ficaram paradas.
* **Marketing:** em quais meses e plataformas o CPL qualificado disparou; quais métricas de mídia andam juntas e quais se descolam; como os leads de cada origem evoluíram mês a mês.
* **Diretoria:** em que dias do ano a receita reconhecida se concentra; se o efeito de fim de mês nos fechamentos existe; se a nova cadência mudou a conversão dos cohorts seguintes.

Serve mal quando a leitura exige valor fino entre células vizinhas (diferenças sutis de tom não se percebem) e quando a pergunta é tendência: a grade apaga a sequência que uma linha mostra de imediato.

## Decisões que valem para a família toda

1. **Tipo de escala segue a pergunta.** Sequencial para magnitude (`--seq-1` a `--seq-7`); divergente quando existe ponto de quebra lógico (zero, meta, 100% da capacidade), com dois matizes e neutro no meio. Arco-íris nunca: não se percebe ordem entre matizes. Enquanto não houver tokens `--div-*`, compor com `--negative`, `--surface-overlay` e `--positive` via `color-mix(in oklab, ...)`.
2. **Faixas ou contínua.** De 5 a 7 faixas quando a leitura é categórica (dentro do SLA, atenção, estouro) ou há régua; contínua interpolada entre tokens vizinhos quando a tarefa é ordenar ou comparar extremos.
3. **Tema escuro inverte a intuição.** Valor alto é o tom mais claro; `--seq-1` fica perto do fundo e se confunde com "sem dado". Célula ausente leva padrão SVG de hachura e borda tracejada, nunca `--seq-1`.
4. **Texto da célula com contraste condicional.** Token de texto escolhido pela faixa: claro nas faixas baixas, escuro nas altas.
5. **Vizinhança engana.** A mesma cor parece mais clara cercada de tons escuros; um vão de 1 a 2 px na cor do cartão entre células reduz o efeito.
6. **Normalizar antes de colorir.** Um mês com cinco segundas infla a segunda; dividir pelo número de ocorrências do dia ou mostrar taxa.
7. **Fuso antes de agregar por hora e data civil antes de desenhar calendário.** Uma hora errada desloca o pico inteiro; UTC renderizado em fuso local muda o dia.
8. **Ordem de linhas e colunas é metade da leitura.** Tempo em ordem natural; categorias por total, por régua do registry ou por semelhança. Nunca alfabética por padrão.
9. **Um primitivo para quase tudo.** Os modelos 01, 02, 04, 06, 07 e 08 são o mesmo `HeatGrid` em SVG com props de escala, máscara, ordenação, rótulo e margens. Recharts não tem heatmap; forçar com `ScatterChart` de formas quadradas briga com o eixo categórico. Os modelos 03 e 05 são HTML com Tailwind porque o número precisa escalar com a fonte.
10. **Acessível e exportável.** Grade grande não é navegável célula a célula: cada heatmap oferece "ver como tabela" (família 14) e um `aria-label` com o resumo (maior valor, menor valor, janela de pico).

## Modelos

As pastas de modelo são criadas pelos produtores; os links abaixo apontam para onde cada uma vai morar.

| # | Modelo | Técnica | O que resolve | Versões previstas |
|---|---|---|---|---|
| 01 | [Heatmap dia da semana por hora](./01_heatmap-dia-da-semana-por-hora/) | SVG puro | Janela de pico de um evento recorrente contra a janela da equipe, com média por ocorrência do dia | 4 |
| 02 | [Matriz categórica em cor](./02_matriz-categorica/) | SVG puro | Extremos e padrões entre duas dimensões de categoria, com totais nas margens, eixo agrupado e célula de tamanho variável | 4 |
| 03 | [Cohort de conversão em triângulo](./03_cohort-em-triangulo/) | HTML com Tailwind | Se grupos novos convertem melhor que os antigos na mesma idade, com o período em curso marcado | 4 |
| 04 | [Calendário estilo contribuições](./04_calendario-estilo-contribuicoes/) | SVG puro | Atividade diária ao longo de meses ou anos, efeito de dia do mês e grades micro por pessoa | 4 |
| 05 | [Calendário mensal em grade](./05_calendario-mensal-em-grade/) | HTML com Tailwind | Um mês lido como agenda, com número do dia, teto de capacidade, feriado e marcos | 4 |
| 06 | [Lasagna (entidades por tempo)](./06_lasagna/) | SVG puro | Status ou valor diário de muitas entidades, com a entidade que ainda não existia distinta de zero | 4 |
| 07 | [Matriz de transição, de-para e confusão](./07_matriz-de-transicao/) | SVG puro | De onde para onde as entidades se moveram e onde uma classificação erra, com a diagonal fora da escala | 4 |
| 08 | [Heatmap de correlação](./08_heatmap-de-correlacao/) | SVG puro | Quais métricas andam juntas, em escala divergente de −1 a +1 e com o n de pares por célula | 4 |

Variações do estudo absorvidas como versões: o heatmap radial de 24 horas (15#14) entra no 01 como peça de destaque; totais marginais (15#9), eixo agrupado (15#10), células de tamanho variável (15#12) e ordenação por semelhança (15#13) entram no 02; a matriz anual dia do mês por mês (15#5) e a grade de atividade micro da família 24 (24#34) entram no 04; o calendário de marcos da família 20 (20#14) entra no 05; a matriz de confusão (25#17) e a matriz de-para (25#18) da família 25 entram no 07; a matriz de correlação da família 25 (25#19) entra no 08. O punch card do estudo (15#2) saiu da família: mora em bolhas em grade categórica, na família 09.

## Guia rápido: qual modelo escolher

Comece pela pergunta, não pela forma:

| Se a pergunta é... | Use |
|---|---|
| Em que dia e hora acontece, e a equipe está lá nessa janela | 01 |
| Qual segmento, motivo ou plataforma concentra o extremo | 02 |
| Qual linha pesa mais, além de qual é mais quente | 02, versão com totais nas margens |
| Qual taxa é alta com volume que importa | 02, versão de tamanho variável |
| Cohorts novos convertem melhor que os antigos na mesma idade | 03 |
| Uma mudança de processo aparece a partir de qual cohort | 03, versão de mudança de cadência |
| Como a atividade diária se distribuiu no ano, e onde houve vazio | 04 |
| Existe efeito de início, quinzena ou fim de mês | 04, versão dia do mês por mês |
| Como foi este mês dia a dia, com o número do dia visível | 05 |
| Quais prazos e marcos caem no mês | 05, versão de marcos |
| Como cada fila, SDR ou oportunidade se comportou ao longo dos dias | 06 |
| Para onde foram as oportunidades que estavam em cada etapa | 07 |
| Onde a classificação automática erra, e com qual classe confunde | 07, versão de confusão |
| Quais métricas andam juntas e quais se descolam | 08 |

Três testes antes de escolher:

* **O tempo é cíclico ou linear?** Cíclico (hora do dia, dia da semana, dia do mês) fica em 01 ou 04; linear com muitas entidades vai para 06; linear com poucas séries sai da família e vira linha (04_linhas).
* **Os dois eixos são a mesma lista?** Estados com direção vão para 07; métricas contra métricas vão para 08; dimensões diferentes ficam em 02.
* **Cada célula tem eventos suficientes?** Com poucos eventos a grade vira mancha aleatória: agregar (blocos de 2 horas, semanas, trimestres) antes de escolher o modelo, ou declarar a amostra mínima e hachurar o que ficar abaixo dela.

## Referências cruzadas

Visuais parentes desta família que o plano do catálogo colocou em outra casa:

| Visual | Onde mora | Por que lá |
|---|---|---|
| Punch card, bolhas dia por hora (estudo 15#2) | [09_dispersao-e-bolhas, modelo 04 Bolhas em grade categórica](../09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/) | O volume vira área do círculo e deixa a cor livre para uma taxa; sai em Recharts nativo com `ScatterChart` e `ZAxis` |
| Faixa de calor em célula | [24_microvisuais-sparklines, modelo 04 Faixa de status tracker](../24_microvisuais-sparklines/04_faixa-de-status-tracker/) | Uma entidade só, uma linha de dias, em tamanho de célula ou de cartão pequeno |
| Tabela com heatmap | [14_tabelas-visuais, modelo 02 Tabela com heatmap nas células](../14_tabelas-visuais/02_tabela-com-heatmap-nas-celulas/) | Colunas com unidades diferentes e texto, em que o número é lido antes da cor |
| Radar de ciclo | [18_radar, modelo 04 Radar de ciclo](../18_radar/04_radar-de-ciclo/) | Uma série só por hora ou por mês lida como ciclo, sem o dia da semana |

## Quando procurar outra família

| Situação | Vá para |
|---|---|
| Curvas de amadurecimento de cada cohort lado a lado | [04_linhas, modelo 02 Múltiplas séries](../04_linhas/02_multiplas-series/) |
| Poucas entidades com valor contínuo e pergunta de tendência | [04_linhas, modelo 09 Pequenos múltiplos de linha](../04_linhas/09_pequenos-multiplos-de-linha/) |
| Caminho por vários estágios em sequência, com o volume do fluxo | [11_fluxo-sankey, modelo 02 Sankey multietapa](../11_fluxo-sankey/02_sankey-multietapa/) |
| Só o volume por etapa, sem origem e destino | [10_funil](../10_funil/) |
| Eventos com hora de início e fim, agenda por pessoa | [20_cronograma-e-linha-do-tempo, modelo 05 Swimlane de eventos](../20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos/) |
| Forma da relação entre pares de métricas (curva, grupos, pontos fora da curva) | [09_dispersao-e-bolhas, modelo 10 Matriz de dispersão](../09_dispersao-e-bolhas/10_matriz-de-dispersao/) |
| Dendrograma isolado, sem a grade de cor | [12_hierarquia, modelo 07 Árvore e dendrograma](../12_hierarquia/07_arvore-e-dendrograma/) |
| Relação simétrica entre entidades, sem direção | [27_rede-e-relacoes, modelo 01 Matriz de adjacência](../27_rede-e-relacoes/01_matriz-de-adjacencia/) |
| Matriz de risco ou nine-box, com posição por dois eixos ordinais | [25_matriz-e-quadrantes, modelos 02 e 06](../25_matriz-e-quadrantes/) |

## Referências

Só links já registrados nos estudos. Quando o estudo marcou que a página não abriu, a marca se repete aqui. Nas referências de portal, a marca entre colchetes repete a proveniência do [estudo de portais](../_estudo/00_portais-de-design.md): **[aberto]** a página foi lida; **[busca]** vale pelo título e trecho da busca, a qualidade visual não foi conferida.

### Método e praticantes

* [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): a lista de tarefas de leitura de heatmap, o limite prático de sete faixas e o efeito de vizinhança entre tons; modelos 01, 02 e 04.
* [Stephen Few, análise multivariada com heatmaps](https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf): leitura de perfil por linha e de variável por coluna, o heatmap organizado por dendrograma e a advertência de que exige público treinado; modelo 02 (totais e semelhança).
* [Stephen Few, Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): o caso de acessos por hora do dia, por que a linha lê melhor que o relógio e a única justificativa aceita para forma circular, o ciclo de 24 horas; modelo 01, versão radial.
* [Statsig, introdução aos triangle charts](https://www.statsig.com/blog/intro-triangle-charts-retention): leitura horizontal (um cohort envelhecendo) e vertical (cohorts na mesma idade); modelo 03.
* [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/): como a ordem de linhas e colunas revela ou esconde bloco; modelos 02 (semelhança), 07 e 08.
* [FlowingData, calendar heatmaps para séries temporais](https://flowingdata.com/2012/03/15/calendar-heatmaps-to-visualize-time-series-data/) (não abriu): post de referência sobre o formato; modelo 04.
* [Guia de visualização de dados da União Europeia, calendar heatmap](https://data.europa.eu/apps/data-visualisation-guide/calendar-heatmap) (não abriu): barras de agregação por semana e por dia da semana para ler ciclos; modelo 04, versão micro.

### Catálogos e documentação

* [Data Viz Catalogue, heatmap](https://datavizcatalogue.com/methods/heatmap.html): legenda obrigatória, intervalos de tempo em linha ou coluna e leitura por interseção; modelos 01, 02 e 07.
* [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): os erros comuns de normalização, ordenação e paleta, a clusterização antes de arranjar linhas e a matriz de adjacência como variação; modelos 02 e 07.
* [From Data to Viz, correlograma](https://www.data-to-viz.com/graph/correlogram.html): o limite prático de uns 10 atributos e o uso declaradamente exploratório; modelo 08.
* [Data Visualisation Catalogue, correlation matrix](https://datavizcatalogue.com/blog/chart-snapshot-correlation-matrix/): o marcador circular de tamanho variável nas interseções; modelo 08, versão em blocos.
* [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): o XY heatmap na categoria Correlation, bom para padrão e menos bom para diferença fina; modelos 07 e 08.
* [seaborn, matriz de correlação diagonal](https://seaborn.pydata.org/examples/many_pairwise_correlations.html): máscara do triângulo superior, paleta divergente centrada em zero e células quadradas; modelo 08.
* [Wikipedia, Confusion matrix](https://en.wikipedia.org/wiki/Confusion_matrix): as duas convenções de eixo que coexistem, as métricas derivadas e o alerta sobre acurácia em dado desbalanceado; modelo 07.
* [scikit-learn, ConfusionMatrixDisplay](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ConfusionMatrixDisplay.html): `normalize` com `true`, `pred` e `all`, e o real nas linhas; modelo 07, versão de confusão.
* [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): célula ordinal com texto sobreposto e a opção `interval` para lacuna explícita; modelos 04 e 07. O endereço alternativo [observablehq.com/plot/marks/cell](https://observablehq.com/plot/marks/cell) não abriu na pesquisa.
* [Vega-Lite, texto sobre heatmap](https://vega.github.io/vega-lite/examples/layer_text_heatmap.html): cor do texto condicionada ao valor da célula; modelos 01 e 02.
* [Vega-Lite, Annual Weather Heatmap](https://vega.github.io/vega-lite/examples/rect_heatmap_weather.html): dia no X e mês no Y, sem domínio de eixo; modelo 04, versão dia do mês por mês.
* [Vega-Lite, Lasagna Plot](https://vega.github.io/vega-lite/examples/rect_lasagna.html): rótulo de eixo só no primeiro dia do ano e categorias nominais nas linhas; modelo 06.
* [Vega-Lite, Table Bubble Plot (punch card)](https://vega.github.io/vega-lite/examples/circle_github_punchcard.html): dia no Y com ordem customizada e tamanho pela soma; referência do punch card que mora na família 09.
* [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): índice dos exemplos acima.
* [Apache ECharts, calendar heatmap (código)](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/calendar-heatmap.ts): `cellSize`, `visualMap` em faixas e série `heatmap` no sistema de coordenadas `calendar`; modelo 04.
* [Apache ECharts, lista de exemplos](https://github.com/apache/echarts-examples/tree/gh-pages/public/examples/ts): as variantes `calendar-simple`, `calendar-vertical` e `calendar-horizontal` e o `custom-polar-heatmap`; modelos 04, 05 e 01 (radial).
* [Highcharts, exemplos de heat map](https://www.highcharts.com/blog/tutorials/heat-map-examples-using-highcharts/): vendas por funcionário por dia útil e o heatmap grande de dia por hora; modelos 01 e 02.
* [Highcharts, calendar heatmap mensal](https://www.highcharts.com/demo/highcharts/calendar-heatmap-month): o dia como rótulo dentro da célula; modelo 05.
* [Highcharts, Large heatmap](https://www.highcharts.com/demo/highcharts/heatmap-canvas) (não abriu): heatmap de milhares de células; modelo 06.
* [AG Charts, heatmap com rótulos](https://www.ag-grid.com/charts/gallery/heatmap-with-labels/): formatador de rótulo na célula e legenda em gradiente; modelo 02.
* [AG Charts, heatmap com eixo de categoria agrupada](https://www.ag-grid.com/charts/gallery/grouped-category-heatmap/): o segundo nível do eixo em negrito; modelo 02, versão de eixo agrupado.
* [AG Charts, calendar heatmap](https://www.ag-grid.com/charts/gallery/calendar-heatmap/) e [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): o calendário como variação da mesma série; modelo 04.
* [Nivo, HeatMap](https://nivo.rocks/heatmap/): escalas sequencial, divergente e quantizada, cor dedicada para nulo e célula circular de tamanho variável; modelo 02.
* [Nivo, Calendar](https://nivo.rocks/calendar/): direção, espaçamento de anos, borda de mês e cor para dia vazio; modelos 04 e 05.
* [visx, exemplo de heatmap (código)](https://raw.githubusercontent.com/airbnb/visx/master/packages/visx-demo/src/sandboxes/visx-heatmap/Example.tsx) e [visx, pastas de sandbox](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes): raio pelo menor lado da célula e escala de opacidade adicional; modelo 02, versão de tamanho variável.
* [Evidence, Calendar Heatmap](https://docs.evidence.dev/components/charts/calendar-heatmap): expansão automática para vários anos e grade completa com dias faltando; modelo 04, versão de três anos.
* [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): a versão de uma linha só com status categórico; modelo 06 e a faixa da família 24.
* [Holistics, cohort retention](https://docs.holistics.io/docs/charts/cohort-retention): coluna de tamanho do cohort e ordem cronológica das colunas; modelo 03.
* [SpreadJS, tipos de sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain): month e year sparklines como calendários de célula; modelo 04, versão micro.
* [microcharts, CalendarStrip](https://microcharts.dev/docs/charts/calendar-strip) (não abriu): calendário em faixa de uma linha; modelo 04, versão micro.
* [Data Viz Catalogue, Calendar](https://datavizcatalogue.com/methods/calendar.html) e [blog de combinações com calendário](http://datavizcatalogue.com/blog/chart-combinations-visualizing-data-in-calendars/): grade de 7 colunas e barras que atravessam dias para duração; modelo 05, versão de marcos.
* [Observable, calendar view do D3](https://observablehq.com/@d3/calendar-view) (não abriu): contorno de mês calculado e anos empilhados; modelo 04. Também não abriram o [calendário simplificado com Plot](https://observablehq.com/@observablehq/plot-simplified-calendar) e o [heatmap temporal de temperatura com Plot](https://observablehq.com/@observablehq/plot-seattle-temperature-heatmap).

### Portais de design

* [Behance, Portfolio Heatmaps: Where Data Meets Clarity](https://www.behance.net/gallery/244707007/Portfolio-Heatmaps-Where-Data-Meets-Clarity-) **[aberto]**: grade de blocos com semântica verde, vermelho e neutro e toque para expandir; modelo 02; lembrar que no Farol a cor vem de `--positive`, `--negative` e `--surface-overlay`.
* [Behance, monitoramento de dados com heatmaps e radares](https://www.behance.net/gallery/221169407/Data-Monitoring-Merchant-Heatmaps-Radars): grade de calor combinada com alertas em painel operacional; só metadados em texto verificados; modelos 01 e 02.
* [Behance, Heatmap UI para dias positivos num app de diário](https://www.behance.net/gallery/201243715/Heatmap-UI-Chart-UXUI-Design): tamanho de célula e escala de intensidade em interface de produto; só metadados em texto verificados; modelo 04.
* [Behance, cohort analysis de retenção ao longo do tempo](https://www.behance.net/gallery/174732039/COHORT-ANALYSIS-CUSTOMER-RETENTION-OVER-TIME): tabela triangular combinada com resumo; só metadados em texto verificados; modelo 03.
* [Behance, Task and Project Management Web Design](https://www.behance.net/gallery/161886233/Task-and-Project-Management-Web-Design) (citado no estudo da família 20): visão de calendário para o panorama das tarefas; modelo 05, versão de marcos.
* [Dribbble, Animated Matrix Chart, 49 Days of Charts](https://dribbble.com/shots/17790868-Animated-Matrix-Chart-49-Days-of-Charts) **[busca]**: matriz da série de 49 gráficos; serve para SLA por dia da semana e hora; modelo 01.
* [Dribbble, Heatmap graphs, Hyper charts UI Kit](https://dribbble.com/shots/21707985-Heatmap-graphs-Hyper-charts-UI-Kit) (não abriu): mapas de calor de um kit com mais de mil gráficos editáveis.
* [Dribbble, Calendar heatmap](https://dribbble.com/shots/3532285-Calendar-heatmap) (não abriu): tamanho de célula e vão que mantêm a grade legível em tema escuro; modelo 04.
* [Figma Community, heatmap graph components](https://www.figma.com/community/file/1537974759673563561/heatmap-graph-components-inity-agency-community) **[busca]**: componentes de heatmap para contribuição, atividade e horas trabalhadas em formato de calendário; modelos 04 e 06.
* [Figma Community, heat map template](https://www.figma.com/community/file/1130920123422161382/heat-map-template) **[busca]**: modelo genérico de mapa de calor; modelo 02.

**Lacunas.** Dribbble e Figma Community não renderizaram conteúdo para leitura automática, e a tag de calendário de calor do Dribbble tinha um design só; o Data Viz Project respondeu com acesso negado; as páginas do Behance abriram só com metadados em texto, sem inspeção das imagens. Não há referência de portal verificada para lasagna, matriz de transição, matriz de confusão nem heatmap de correlação.

**No Farol:** SVG puro com geometria calculada em TypeScript (o primitivo `HeatGrid`) para os modelos 01, 02, 04, 06, 07 e 08; grid do Tailwind com cor por `style` para os modelos 03 e 05. Recharts não tem heatmap nativo e nenhuma biblioteca nova entra.
