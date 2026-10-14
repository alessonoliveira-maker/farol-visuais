# Tabelas visuais

Tabela visual é a tabela que continua sendo tabela: o leitor ainda consulta o número exato de uma linha, mas cada célula ganha uma camada gráfica (barra, cor de fundo, micrográfico, seta de posição, símbolo de status) para que o padrão apareça antes da leitura. A família serve quando há muitas entidades, várias métricas com unidades diferentes e a pergunta mistura "quanto exatamente" com "quem se destaca". O espírito é o do TableLens: gráfico primeiro, dentro de uma estrutura que todo mundo já sabe ler, com a ordenação por coluna como operador principal de análise.

Catálogo VISUAIS do Farol, 2026-09-14. Estudo de origem: [`_estudo/familias/14_tabelas-visuais.md`](../_estudo/familias/14_tabelas-visuais.md). Todos os casos de uso são fictícios.

## Quando a família serve

O que ela responde em cada público do Farol:

* **Comercial:** qual executivo está abaixo da meta de fechamento e em que etapa ele perde mais; quem subiu e quem caiu no ranking de receita reconhecida do trimestre; onde estão as oportunidades abertas por pessoa e etapa.
* **Pré-vendas:** quais filas estouraram o SLA nos últimos 30 dias, e em quais dias; como a produção semanal de agendas de cada SDR evoluiu; quais oportunidades passadas ao Comercial ainda têm pendências de handoff.
* **Marketing:** quais origens de lead têm CPL qualificado alto e cobertura de dado baixa; qual plataforma de mídia piorou o CPL contra o mês anterior; quanto de telefone, cargo e cidade existe por origem.
* **Diretoria:** quais áreas cumprem cada meta do ano (sim, parcial, não); quanto cada área custa em cada camada; como os cenários se comparam critério a critério.

Serve mal em apresentação ao vivo: a plateia não lê e escuta ao mesmo tempo. Quando a pergunta é só a forma de uma série ou a comparação de cinco barras, o gráfico dedicado lê mais rápido.

## Decisões que valem para a família toda

1. **Escala por coluna.** Colunas com unidades diferentes nunca dividem escala; dentro da coluna, o domínio é comum a todas as linhas do recorte inteiro, não só da página exibida.
2. **Total, média e referência ficam fora do domínio.** A linha de total tem estilo próprio e escala própria declarada, ou fica sem marca.
3. **Dado ausente não é zero.** Sem marca, com `formatUnavailable()` e o motivo; zero medido desenha a marca e escreve 0.
4. **Cor segue a polaridade da métrica, não o sinal.** CPL subir é ruim; taxa de conversão subir é bom.
5. **Número à direita com algarismo tabular, texto à esquerda,** e a marca nunca disputa o pixel do número.
6. **A base já existe no Farol.** O `DataTable.tsx` usa TanStack Table; cada modelo daqui é um renderizador de célula ou de cabeçalho sobre ele, não uma tabela nova.
7. **No celular a camada visual encolhe antes do número.** Barra e sparkline podem sumir na variante cartão; valor, estado e procedência nunca somem.
8. **Acessibilidade.** A camada gráfica é redundante ao texto: SVG decorativo com `aria-hidden`, status sempre com ícone ou palavra junto da cor.

## Modelos

As pastas de modelo são criadas pelos produtores; os links abaixo apontam para onde cada uma vai morar.

| # | Modelo | Técnica | O que resolve | Versões previstas |
|---|---|---|---|---|
| 01 | [Tabela com barras e marcas inline](./01_tabela-com-barras-inline/) | HTML com Tailwind | Magnitude, valor contra meta, desvio com sinal, mix 100% e ponto com intervalo dentro da célula, com escala por coluna | 4 |
| 02 | [Tabela com heatmap nas células](./02_tabela-com-heatmap-nas-celulas/) | HTML com Tailwind | Extremos e padrões em colunas de mesma natureza, com o número sobre a cor e a faixa de escala declarada | 4 |
| 03 | [Tabela com sparkline ou tracker por linha](./03_tabela-com-serie-por-linha/) | SVG puro | Trajetória recente ou status diário de cada linha ao lado do valor atual | 4 |
| 04 | [Scorecard tabular com procedência](./04_scorecard-tabular/) | HTML com Tailwind | Valor, meta, variação com base e seta pela polaridade, mais procedência e cobertura por linha | 4 |
| 05 | [Ranking com variação de posição](./05_ranking-com-variacao-de-posicao/) | HTML com Tailwind | Quem subiu, quem caiu, quem entrou e quem saiu do topo, com regra de empate declarada | 4 |
| 06 | [Tabela cruzada com totais marginais](./06_tabela-cruzada-com-totais-marginais/) | HTML com Tailwind | Contagem por duas dimensões com totais nas margens e denominador do percentual explícito | 4 |
| 07 | [Tabela agrupada com subtotais e linha fixa](./07_tabela-agrupada-com-subtotais/) | HTML com Tailwind | Hierarquia curta com subtotal por grupo, cabeçalho duplo e referência que não sai da tela | 4 |
| 08 | [Tabela com linha expansível](./08_tabela-com-linha-expansivel/) | HTML com Tailwind, Recharts no painel | Resumo por linha e detalhe gráfico sob demanda sem trocar de tela | 4 |
| 09 | [Matriz de comparação com status](./09_matriz-de-comparacao-com-status/) | HTML com Tailwind, glifo em SVG | Cumprimento de critérios qualitativos com cinco estados de forma distinta e bolas de Harvey com número | 4 |

Variações do estudo absorvidas como versões: bullet inline, barras divergentes inline, composição 100% inline e ponto e intervalo inline entram no 01 (junto com o bullet em célula da família 13 e a barra de dado, a composição mini e a barra de desvio em célula da família 24); a tabela realçada de perfil da família 18 entra no 02; a faixa de status temporal entra no 03; a tabela de cobertura e procedência entra no 04; a matriz de comparação de itens da família 25 entra no 09.

## Guia rápido: qual modelo escolher

Comece pela pergunta, não pela forma:

| Se a pergunta é... | Use |
|---|---|
| Quanto cada linha vale e quem se destaca, em várias colunas | 01, barras inline |
| Quanto cada linha está da meta ou do teto | 01, versão em bullet |
| Quem ficou acima ou abaixo de uma referência, com sinal | 01, versão divergente; se são meses ou etapas, 02 em escala divergente |
| Qual é o mix de categorias de cada linha | 01, versão de composição 100% |
| Onde estão os extremos numa grade de meses ou etapas | 02 |
| Como cada linha evoluiu, ou em quais dias falhou | 03 (sparkline para série contínua, tracker para status) |
| Como os indicadores do mês ficaram contra meta e contra o mês anterior | 04 |
| De onde vem cada número e quanto do dado existe | 04, versões de procedência e cobertura |
| Quem subiu e quem caiu no ranking | 05 |
| Como uma contagem se distribui por duas dimensões, com totais | 06 |
| Quanto cada grupo soma e como cada linha se compara à média | 07 |
| Por que aquela linha está assim, sem sair da lista | 08 |
| Quem cumpre cada critério, quando não há número por trás | 09 |

Dois testes antes de escolher:

* **Há número por trás do status?** Mostre o número (01 ou 02) e deixe o status derivado; a matriz de status (09) é para o que não se mede.
* **O leitor precisa comparar o detalhe entre linhas?** Então o detalhe vira coluna (01 ou 03), não painel expansível (08).

## Quando procurar outra família

| Situação | Vá para |
|---|---|
| Top N de uma métrica em espaço estreito, só nome, barra e valor (lista de barras, estudo 14#10) | [02_barras-horizontais, modelo 09 Bar list](../02_barras-horizontais/09_bar-list/) |
| Micrográfico fora da tabela: sparkline em cartão, pílula de variação, barra de dado solta | [24_microvisuais-sparklines](../24_microvisuais-sparklines/) |
| Matriz sem texto, em que o padrão de cor é a leitura | [15_mapa-de-calor-e-calendario, modelo 02 Matriz categórica em cor](../15_mapa-de-calor-e-calendario/02_matriz-categorica/) |
| Poucos KPIs com espaço para cartões | [01_cards-e-kpis, modelo 07 Grade e tira de KPIs](../01_cards-e-kpis/07_grade-e-tira-de-kpis/) |
| Bullet isolado, fora de tabela | [13_progresso-meta-e-gauge](../13_progresso-meta-e-gauge/) |
| Trajetória de posições em muitos períodos (bump, slope) ou distribuição com intervalo fora da tabela | [17_comparacao-de-pontos](../17_comparacao-de-pontos/) e [16_distribuicao](../16_distribuicao/) |
| Barra divergente ou 100% com eixo e poucas linhas | [02_barras-horizontais](../02_barras-horizontais/) |
| Composição em duas dimensões com área proporcional | [26_mosaico-marimekko](../26_mosaico-marimekko/) |
| Hierarquia com mais de dois níveis | [12_hierarquia](../12_hierarquia/) |
| Perfil de poucas entidades em poucas dimensões lido como forma | [18_radar](../18_radar/), sabendo que a tabela realçada (02) costuma vencer |
| Opções posicionadas em dois eixos contínuos | [25_matriz-e-quadrantes](../25_matriz-e-quadrantes/) |

## Referências

Só links já registrados nos estudos. Nas referências de portal, a marca entre colchetes repete a proveniência do [estudo de portais](../_estudo/00_portais-de-design.md): **[aberto]** a página foi lida; **[busca]** vale pelo título e trecho da busca, a qualidade visual não foi conferida.

### Método e praticantes

* [Ramana Rao, TableLens (acervo Perceptual Edge)](https://www.perceptualedge.com/articles/b-eye/tablelens.pdf): ordenação como operador de correlação e foco com contexto; base dos modelos 01 e 08.
* [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): barras embutidas, alinhamento de números, ordenação estratégica e rótulos de supercategoria; vale para 01, 04, 05 e 07.
* [Stephen Few, escala de sparklines em dashboards](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf): os cinco métodos de escala com o mesmo dado e a faixa de referência sombreada comum às linhas; modelos 01 (ponto e intervalo) e 03.
* [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): escala sequencial contra divergente, limite prático de faixas e efeito de vizinhança; modelo 02.
* [Stephen Few, análise multivariada com heatmaps](https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf): leitura por linha (perfil) e por coluna (variável) na mesma matriz; modelo 06.
* [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): formato desenhado para caber em pouco espaço, que é o caso da célula; modelo 01, versão em bullet.
* [Perceptual Edge, biblioteca de artigos de Few](https://www.perceptualedge.com/library.php): índice onde mora a especificação do bullet graph.
* [Stephen Few, bullet graphs revisited](https://www.perceptualedge.com/blog/?p=217): nunca comparar magnitudes entre escalas diferentes, que é o erro da barra normalizada por linha.
* [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): último ponto marcado, faixa normal e proporção que deixa a inclinação legível; modelo 03, incluindo o tracker.
* [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/): tabela realçada com cor, negrito e símbolos respondendo quem é melhor em quê; modelos 02 (perfil) e 09.
* [Peltier Tech, sparklines and data bars in Excel 2010](https://peltiertech.com/sparklines-and-data-bars-in-excel-2010/): armadilhas de escala do data bar nativo e tratamento de mínimo e máximo; modelo 01.
* [microcharts, Delta](https://microcharts.dev/docs/charts/delta): inverter a polaridade troca a cor e nunca a direção; modelos 01 (desvio) e 04.

### Catálogos e documentação

* [Datawrapper Academy, barras e linhas em tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): trilho cinza, cor separada para negativos, faixa manual e a escolha entre escala individual e compartilhada; modelo 01.
* [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table): largura fixa de coluna para micrográfico, formatação por coluna, linhas fixas, cabeçalho duplo e cor condicional por categoria; modelos 04 e 07.
* [Datawrapper Academy, tabelas com atualização contínua](https://www.datawrapper.de/academy/how-to-create-live-updating-tables): mini colunas, sparklines e heatmaps na mesma tabela; modelo 03.
* [Datawrapper Blog, heatmaps em tabelas](https://www.datawrapper.de/blog/heatmaps-for-tables): escala em degraus, faixa customizada, legenda de escala e barras sobre o heatmap; modelos 02 e 04.
* [Datawrapper Blog, nova ferramenta de tabelas](https://www.datawrapper.de/blog/new-table-tool-barcharts-fixed-rows-responsive-2): estilo por categoria em células, linhas fixas e troca por cartões em tela pequena; modelos 01 e 07.
* [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart): barra externa e interna na mesma linha de tabela; modelo 01, versão em bullet.
* [Vega-Lite, texto sobre heatmap](https://vega.github.io/vega-lite/examples/layer_text_heatmap.html): cor do texto condicionada ao valor da célula; modelo 02.
* [Vega-Lite, Table Heatmap](https://vega.github.io/vega-lite/examples/rect_heatmap.html) (não abriu na pesquisa): tabela colorida por agregado em duas dimensões discretas; modelo 06.
* [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): barra empilhada normalizada em tamanho grande, como referência de geometria da composição 100%.
* [Data Viz Catalogue, stacked bar graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html): empilhado simples contra 100% e a dificuldade de comparar segmentos sem base comum.
* [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): categorias Ranking, Deviation, Part-to-whole, Distribution e Magnitude como alternativas fora da tabela; modelos 01, 05 e 09.
* [Recharts, Tiny Line Chart](https://recharts.github.io/en-US/examples/TinyLineChart/): o LineChart mínimo com dot desligado, só para poucas linhas com dica; modelo 03.
* [Tremor, Spark Chart](https://www.tremor.so/docs/visualizations/spark-chart): minValue, maxValue e connectNulls expostos no micrográfico; modelo 03.
* [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): cor e dica por bloco, fundo padrão e recorte responsivo; modelos 03 e 09.
* [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist): sortOrder, valueFormatter e rótulo dentro da barra para listas ordenadas; modelo 05.
* [Tremor, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars): DeltaBar de −100 a +100 com isIncreasePositive para métrica em que subir é ruim; modelo 01.
* [SpreadJS, vari sparkline](https://developer.mescius.com/spreadjs/docs/v18/features/sparkmain/sparkvari): referência, mínimo, máximo e cores separadas acima e abaixo; modelo 01, versão de desvio.
* [AG Grid, sparklines overview](https://www.ag-grid.com/javascript-data-grid/sparklines-overview/): bar e column como tipos distintos numa grade de dados; modelos 01 e 03.
* [shadcn/ui, Data Table](https://ui.shadcn.com/docs/components/data-table): composição sobre TanStack Table com ordenação, filtro, visibilidade de colunas e ações por linha; modelos 07 e 08.
* [Wikipedia, Harvey balls](https://en.wikipedia.org/wiki/Harvey_balls): uso em tabela de comparação e renderização irregular do caractere Unicode, motivo do arco em SVG; modelo 09.
* [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): célula ordinal com texto, alternativa quando o glifo não é necessário; modelo 09.

### Portais de design

* [Behance, DataGrid Dashboard Kit Pro](https://www.behance.net/gallery/254994285/DataGrid-Dashboard-Kit-Pro-Interactive-UI-Kit) **[aberto]**: kit de grade de dados em React 18, TypeScript e Tailwind com modo escuro, a mesma stack do Farol; inspecionar primeiro.
* [Behance, Optimizing SaaS Data Tables](https://www.behance.net/gallery/180252443/Optimizing-SaaS-Data-Tables-UIUX-Case-Study) **[aberto]**: estudo de caso de tabela de SaaS com foco em filtro (a página traz só as tags).
* [Behance, Dark Themed Business Management Dashboard](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI) **[aberto]**: tabela de pedidos com indicador de status em painel escuro; observar espaçamento e tipografia; modelo 09.
* [Behance, Customer Intelligence Marketing Analytics](https://www.behance.net/gallery/105773549/Customer-Intelligence-Marketing-Analytics-platform) **[aberto]**: o único achado que trata grau de cobertura de dado como métrica; modelo 04.
* [Behance, Data Table Web Desktop](https://www.behance.net/gallery/246319147/Data-Table-Web-Desktop): densidade de linha e hierarquia de colunas; a página abriu só com metadados em texto; modelos 01 e 05.
* [Behance, plataforma de relatórios e analytics](https://www.behance.net/gallery/176149443/ReportPro-Reporting-and-Analytics): formatação condicional na grade e hierarquia entre resumo e detalhe; só metadados em texto; modelos 02 e 08.
* [Dribbble, Data Table Dashboard Ui Design](https://dribbble.com/shots/3316208-Data-Table-Dashboard-Ui-Design) **[busca]**: tabela de dados como tela principal de dashboard.
* [Dribbble, Data Table Dashboard Design](https://dribbble.com/shots/19408052-Data-Table-Dashboard-Design) **[busca]**: outra composição de tabela como tela de dashboard.
* [Dribbble, tag table ui](https://dribbble.com/tags/table-ui) (citado no estudo da família 24): barra de baixa opacidade como fundo da célula, altura da barra contra o texto e chips como legenda externa.
* [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard) (citado no estudo da família 24): barra de desvio centrada quase sempre trocada por pílula.
* [Figma Community, data table design components](https://www.figma.com/community/file/1021406552622495462/data-table-design-components-free-ui-kit) **[busca]**: componentes gratuitos de tabela para design system corporativo.
* [Figma Community, data table components](https://www.figma.com/community/file/1337763226031810494/data-table-components) **[busca]**: componente de tabela flexível para SaaS.
* [Figma Community, Data table component](https://www.figma.com/community/file/1133845244561497719/data-table-component-free) **[busca]**: tabela simples e completa.
* [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit) **[busca]**: variações de barra fina como referência de altura para o bullet em célula.

**Lacunas.** Dribbble e Figma Community não renderizaram para leitura automática, então a qualidade visual desses links não foi conferida; as páginas do Behance abriram só em texto. Não há shot específico verificado de sparkline em tabela, bullet em célula, barra divergente inline, cruzada com totais nem linha expansível.

**No Farol:** `<table>` em HTML com Tailwind; barra inline em `div` com largura percentual; sparkline e glifo de Harvey em SVG com geometria calculada em TypeScript; Recharts só no painel da linha expansível.
