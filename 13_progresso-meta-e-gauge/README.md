# Progresso, meta e gauge

Família do número contra a régua. O visual não existe para mostrar quanto vale a medida; existe para responder se ela está onde deveria estar: contra uma meta, contra um teto de capacidade, contra o ritmo esperado para a data de corte ou contra uma faixa de cenários. Toda a família herda a tensão que Stephen Few descreveu ao propor o bullet graph: o arco é vistoso e lê mal, a barra com traço de meta é sóbria e certeira. O Farol já tomou partido (bullet no lugar de gauge, item M4 do acabamento, e o gauge registrado como armadilha número 2) e cataloga os radiais mesmo assim, cada um com a sua ressalva, porque o pedido de diretoria existe e há um jeito honesto de atendê-lo.

> Estado em 2026-09-14: modelos e versões definidos no [catálogo da família](../_estudo/catalogo/13_progresso-meta-e-gauge.json), a partir do [estudo](../_estudo/familias/13_progresso-meta-e-gauge.md). As pastas de modelo ainda não foram criadas; os links da tabela de modelos passam a abrir quando cada uma for produzida.

## O que a família responde

Perguntas típicas por público do Farol, todas com dado fictício:

- **Comercial:** quanto da meta trimestral de receita reconhecida já fechou; se cada executivo está no ritmo da cota; se a meta do próximo trimestre cabe na faixa do forecast.
- **Pré-vendas:** se a demanda do mês cabe no teto de capacidade; quantas agendas foram marcadas contra as previstas; se a equipe fechou as metas de entradas, agendas e SLA da semana.
- **Marketing:** se o CPL está na faixa aceitável, no limite ou estourado, lembrando que ali menor é melhor; quanto do orçamento de cada plataforma já foi consumido contra o planejado.
- **Diretoria:** se a demanda projetada passa do teto medido; se o cenário base entrega a meta de 2027 ou só o otimista chega lá.

Três perguntas que **não** são desta família: de que é feito um total (famílias 06 e 07), como a medida evoluiu no tempo sem alvo (04 e 05) e como categorias se comparam sem meta (02). Assim que a meta ou o teto sai de cena, o visual vira barra comum e muda de casa.

## Modelos

| # | Modelo | Técnica | Versões | Pergunta que responde |
|---|---|---|---|---|
| 01 | [Barra de progresso e capacidade contra teto](./01_barra-de-progresso-linear/) | HTML com Tailwind | 4 | Quanto falta para a meta, quanto sobra ou estourou do teto, e se o ritmo acompanha o prazo. |
| 02 | [Bullet chart](./02_bullet-chart/) | Recharts customizado | 4 | Em que faixa de estado a medida está e a que distância da meta. É o padrão da família. |
| 03 | [Progresso radial de anel único](./03_progresso-radial-de-anel-unico/) | Recharts nativo | 4 | Um percentual isolado num cartão, com tique de ritmo ou repartido por origem. |
| 04 | [Anéis concêntricos de metas](./04_aneis-concentricos/) | Recharts nativo | 3 | Se o mesmo dono fechou duas ou três metas independentes do período. |
| 05 | [Gauge de arco preenchido](./05_gauge-de-arco-preenchido/) | Recharts nativo | 3 | Percentual da meta num cartão pequeno, lido pelo comprimento do arco. |
| 06 | [Gauge semicircular com ponteiro e faixas](./06_gauge-com-ponteiro/) | Recharts customizado | 4 | Estado qualitativo de uma métrica só, em peça única de destaque. |
| 07 | [Faixa de cenário contra meta](./07_faixa-de-cenario-contra-meta/) | Recharts customizado | 4 | Se a meta cabe na faixa de cenários ou só no melhor caso. |

Versões previstas (26 no total):

- **01:** `v1_receita-do-trimestre-contra-meta` (básica), `v2_agendas-no-ritmo-do-mes` (ritmo esperado e projeção), `v3_cota-por-executivo` (lista por pessoa com mediana), `v4_filas-contra-teto-com-estouro` (teto medido, teto de premissa e fila sem coleta).
- **02:** `v1_receita-com-faixas-de-estado` (básica), `v2_cpl-com-polaridade-invertida` (anotação da origem da faixa), `v3_painel-de-metas-comerciais` (bullets alinhados), `v4_orcamento-por-plataforma-em-coluna` (bullet vertical com plataforma sem veiculação).
- **03:** `v1_agendas-do-mes-no-anel` (básica), `v2_receita-do-mes-com-tique-de-ritmo`, `v3_meta-de-receita-por-origem` (anel empilhado), `v4_orcamento-com-estouro-e-ausencia`.
- **04:** `v1_tres-metas-da-semana` (básica), `v2_quem-fechou-as-tres-metas` (pequenos múltiplos), `v3_meta-proporcional-e-sem-meta`.
- **05:** `v1_meta-de-agendas-em-arco` (básica), `v2_fechamentos-acima-da-meta`, `v3_filas-na-mesma-escala` (zero medido e sem coleta).
- **06:** `v1_atingimento-trimestral-com-ponteiro` (básica), `v2_cobertura-de-dado-com-nota` (estado como palavra), `v3_capacidade-contra-teto-medido`, `v4_valor-acima-do-maximo`.
- **07:** `v1_receita-projetada-do-trimestre` (básica), `v2_pontas-com-premissa`, `v3_trimestres-de-2027-contra-meta-anual`, `v4_meta-fora-da-faixa`.

O estudo pesquisou 20 formatos e o catálogo os fundiu em 7 modelos. Viraram versão: a barra com ritmo e projeção, a capacidade contra teto e a lista de metas por pessoa (em 01, junto das barras com trilho da família 02 e da barra com teto da 24); a barra com faixas qualitativas, o painel de bullets e o bullet vertical (em 02, junto do bullet micro da 24); o progresso radial empilhado (em 03, junto do progresso circular da 07 e do micro anel da 24); os anéis de atividade da 07 (em 04); o gauge com faixas e nota (em 06). O termômetro ficou absorvido em 01 sem versão própria: é a mesma codificação por comprimento, girada e vestida.

## Qual modelo escolher

Responda na ordem; a primeira resposta sim decide.

1. **A saída é uma faixa de cenários, e não um número?** Faixa de cenário contra meta (07).
2. **A referência é um teto que não se deve passar?** Barra com capacidade contra teto (01, v4), com polaridade invertida. Só em peça única de apresentação, gauge com ponteiro (06, v3).
3. **Existe régua qualitativa acordada, com dono e data (ruim, aceitável, bom)?** Bullet chart (02). Se a diretoria pede peça única com o estado como palavra, gauge com ponteiro e nota (06, v2), sabendo que o bullet lê melhor.
4. **São várias pessoas, filas ou métricas para comparar?** Sem faixas, lista de barras com escala comum (01, v3); com faixas, painel de bullets (02, v3). Nunca radiais: ângulo não se compara.
5. **Duas ou três metas independentes do mesmo dono, lidas como fechou ou não fechou?** Anéis concêntricos (04), com o número de cada meta escrito ao lado.
6. **Um percentual só, num cartão pequeno?** Barra (01) se o cartão é largo; anel único (03) se é quadrado; arco preenchido (05) se o layout pede meia lua. A barra é a que menos erra.
7. **A meta tem prazo e a leitura é no meio do período?** Acrescente o ritmo esperado: marcador na barra (01, v2) ou tique no anel (03, v2). Se a pergunta é a trajetória dia a dia, é o burn-up (04/06).

| Situação no Farol | Primeira escolha | Evite |
|---|---|---|
| Meta trimestral de receita num cartão | 01 ou 02 | gauge com ponteiro sem o número escrito |
| CPL contra faixa aceitável | 02 com polaridade invertida | semáforo de matiz nas faixas |
| Demanda da pré-vendas contra teto medido | 01, v4 | barra travada em 100% |
| Cota de 8 executivos | 01, v3 ou 02, v3 | 8 gauges ou 8 anéis lado a lado |
| Meta de 2027 contra cenários | 07 | cenário único apresentado como certeza |
| Metas da semana de uma pessoa | 04 | comparar os anéis entre si |

## Regras que valem para a família inteira

Decisões do [estudo](../_estudo/familias/13_progresso-meta-e-gauge.md) que todo modelo cumpre, somadas às regras do [CONTRATO](../CONTRATO.md):

1. **Meta e teto escritos em texto,** não só desenhados. Em Recharts, `ReferenceLine` e `ReferenceArea` com `ifOverflow="extendDomain"`: o padrão `discard` apaga a meta justamente quando ela passa do maior valor (ANO-3).
2. **Passar de 100% cabe.** Domínio até o maior entre valor e meta, com folga; o excedente ganha marca própria e rótulo. Anel fechado não dá segunda volta: trava e escreve o excedente.
3. **O tempo decorrido é a segunda régua.** Ritmo esperado como marcador secundário, realizado sólido e projeção tracejada na mesma cor. A data de corte e a fração decorrida chegam no dado; nenhum componente chama o relógio.
4. **Faixas qualitativas: três, no máximo cinco,** por intensidade de um único tom, a mais clara marcando a zona ruim no tema escuro. Semáforo de matiz fica fora por padrão.
5. **A polaridade da métrica manda na cor e na ordem das faixas.** Receita subindo é bom; CPL subindo e capacidade cheia, não. A métrica declara a polaridade no dado.
6. **Escala que não começa em zero troca a barra por ponto.** Barra cortada mente sobre proporção (EIX-1).
7. **Sem dado não é zero por cento.** Trilho ou arco tracejado e `formatUnavailable()`; zero medido desenha a marca e escreve 0 (EST-2 e EST-3).
8. **Denominador pequeno sai com o par,** por `formatRateWithVolume`.
9. **Procedência é do `VisualCard`.** O Chart não pinta etiqueta MEDIDO ou PREMISSA (ANO-6); teto de premissa se distingue do medido pelo texto do rótulo e por um traço mais apagado.
10. **A frase acessível carrega a leitura.** Arco, ponteiro e trilho vão `aria-hidden`; ninguém depende de ler ângulo, e cor nunca é a única pista.
11. **Geometria de arco em TypeScript,** com as funções `polar`, `ringArc` e `valueToAngle` do estudo, zero no topo e ângulo em graus.
12. **Os dois motores radiais do Recharts não se misturam.** Progresso contra máximo pede `RadialBarChart` com `PolarAngleAxis type="number"` e domínio explícito; faixas fixas pedem `PieChart` com uma `Cell` por faixa.

## Referências cruzadas

Formatos que parecem desta família e moram em outra, no endereço família/modelo:

| Formato | Mora em | Por quê |
|---|---|---|
| Bullet em célula de tabela | 14/01, tabelas visuais | Dezenas de linhas com a mesma meta relativa; a marca vive dentro da célula, ao lado do número. |
| Tracker de blocos | 24/04, microvisuais e sparklines | É leitura de regularidade dia a dia, não de distância até a meta. |
| Régua de marcos | 20/02, cronograma e linha do tempo | Marcos datados de um plano; o eixo é de tempo, não de valor. |
| Burn-up acumulado contra meta | 04/06, linhas | O assunto é a trajetória até a meta, com a meta revisada desenhada como série. |
| KPI com régua subordinada | 01/03, cartões e KPIs | O número grande é o protagonista e a régua é apoio; sem régua desenhada, é cartão. |
| Waffle de meta | 22/01, unidades, waffle e pictograma | Quantos de 100 da meta, com arredondamento pelo maior resto. |

Vizinhos que o estudo também afastou: meia rosca como composição de um total (07), calendário de calor com meta diária (15), funil com meta por etapa (10) e anel pequeno em coluna de tabela, que é a barra de dado em célula da família 24.

## Referências

Só links que já estão nos estudos. O número entre parênteses diz o modelo a que a referência serve; quando o estudo marcou a página como não aberta, a nota diz isso e a descrição vale pelo resultado de busca.

### Método e praticantes

- [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf) (01, 02, 07): os cinco componentes, a barra com um terço da espessura, a tabela de intensidades por número de faixas, a inversão para despesa, a medida partida em real e projetado e a regra de trocar barra por ponto quando a escala não começa em zero.
- [Stephen Few, Our Irresistible Fascination with All Things Circular](http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf) (02, 03, 06): três gauges contra quatro pessoas em bullets no mesmo espaço.
- [Stephen Few, bullet graphs revisited](https://www.perceptualedge.com/blog/?p=217) (02): intensidades em vez de matizes, escala invertida para métricas do tipo não exceder e o alerta de não comparar bullets de escalas distintas.
- [Stephen Few, Bar Widths and the Spaces in Between](http://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf) (01): o trilho altera a percepção da largura da barra e pede revisão do respiro.
- [Storytelling with Data, bullet graphs galore](https://www.storytellingwithdata.com/blog/2021/12/9/bullet-graphs-galore) (02): versões simplificadas sem faixa de fundo, preferidas por legibilidade.
- [Stephanie Evergreen, The Gauge Diagram](https://stephanieevergreen.com/gauge-diagram/) (06, não aberto no estudo): o gauge defendido para dado qualitativo, a exceção que a v2 explora.
- [Apple, Human Interface Guidelines, Activity rings](https://developers.apple.com/design/human-interface-guidelines/components/status/activity-rings/) (04, não aberto no estudo): a lógica do fechou ou não fechou com três dimensões fixas.
- [WildApricot, Fundraising Thermometers](https://www.wildapricot.com/blog/fundraising-thermometer) (01): três formas de rotular o termômetro, útil para meta de campanha.
- [microcharts, MicroDonut](https://microcharts.dev/docs/charts/micro-donut) (03): o anel pequeno como acento ao lado de número impresso, e a barra segmentada para qualquer comparação.

### Catálogos e bibliotecas

- [Data Viz Project, Progress Bar](https://datavizproject.com/data-type/progress-bar/) (01, não aberto no estudo): o formato tratado como elemento de interface, o que explica o vício de travar em 100%.
- [Data Viz Project, Bullet Graph](https://datavizproject.com/data-type/bullet-graph/) (02, não aberto no estudo): funções de comparação e intervalo, com a barra como família de origem.
- [Data Visualisation Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html) (02): nomenclatura das partes, teto de cinco faixas e comparativa sempre perpendicular à orientação.
- [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart) (01, 02, 07): estender o eixo além do maior valor, barra externa e interna, ordenação e agrupamento de linhas.
- [Datawrapper, Bullet bars](https://www.datawrapper.de/charts/bullet-bars) (07, não aberto no estudo): o que deu certo e o que não deu na mesma barra.
- [Datawrapper Blog, New Arrow and Range Plots](https://www.datawrapper.de/blog/new-arrow-and-range-plots) (07, não aberto no estudo): o gráfico de amplitude, forma canônica de faixa entre dois valores.
- [Tremor, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars) (01, 02): `CategoryBar` aceitando valor acima de 100, `MarkerBar` com faixa e a falta de tratamento para estouro.
- [Tremor, ProgressBar e CategoryBar](https://www.tremor.so/docs/visualizations/category-bar) (01): o trilho continua visível quando o valor é zero.
- [Tremor, ProgressCircle](https://www.tremor.so/docs/visualizations/progress-circle) (03, não aberto no estudo): variantes de estado e comportamento em zero.
- [Recharts, RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/) (03, 04, 05): padrões de `startAngle` e `endAngle`, `innerRadius`, `outerRadius` e `barSize`.
- [Recharts, RadialBar](https://recharts.github.io/en-US/api/RadialBar/) e [PolarAngleAxis](https://recharts.github.io/en-US/api/PolarAngleAxis/) (03, 04, 05): `background`, `cornerRadius`, `minPointSize`, `type` e `domain`.
- [Recharts, Bar](https://recharts.github.io/en-US/api/Bar/) (01, 02): a prop `background`, que desenha trilho simples ou com limiar.
- [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/) (04): `background`, `barSize` e rótulo no início do arco.
- [Recharts, Pie Chart With Needle](https://recharts.github.io/en-US/examples/PieChartWithNeedle/) (06): comprimento do ponteiro, rotação por `transformOrigin` e a limitação do `midAngle`.
- [shadcn/ui, Radial Charts](https://ui.shadcn.com/charts/radial) (03, 05, página aberta sem o código): variantes prontas sobre Recharts.
- [shadcn, chart-radial-text, código fonte](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-text.tsx) (03): `PolarGrid` como trilho e `endAngle` fixado à mão.
- [shadcn, A radial chart with text](https://www.shadcn.io/examples/a-radial-chart-with-text) (03, não aberto no estudo): `Label` central posicionado pelo `viewBox`.
- [shadcn, A radial chart with stacked sections](https://www.shadcn.io/examples/a-radial-chart-with-stacked-sections) (03, não aberto no estudo): `stackId` compartilhado e a soma no centro.
- [shadcn, A radial chart](https://www.shadcn.io/examples/a-radial-chart) (04, não aberto no estudo): anéis concêntricos por categoria sobre Recharts.
- [shadcn, A radial chart with a custom shape](https://www.shadcn.io/patterns/chart-radial-shape) (05, não aberto no estudo): `endAngle` parcial virando arco de gauge com rótulo central.
- [AG Charts, Radial Gauge](https://www.ag-grid.com/charts/react/radial-gauge/) (05, 06): segmentação por passo, contagem ou valores, alvos com forma própria e a distinção entre barra e ponteiro.
- [Apache ECharts, exemplo gauge-grade](https://echarts.apache.org/examples/en/editor.html?c=gauge-grade) (06, não aberto no estudo): setores nomeados e estado no centro; só observação, a biblioteca não entra no Farol.
- [Highcharts, Solid gauge](https://www.highcharts.com/demo/highcharts/gauge-solid) (05, não aberto no estudo): o arco preenchido como formato padrão de biblioteca.
- [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): a ausência de gauge e de bullet no vocabulário editorial, registrada como lacuna.

### Portais de design

Da [varredura de portais](../_estudo/00_portais-de-design.md), seção 13, e dos estudos. A qualidade visual das peças não abertas não foi conferida: olhe antes de adotar.

- [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard) (01, 02, 07, aberto): progresso contra cota, saúde do pipeline e acurácia do forecast na mesma tela, o mesmo trio da tela Comercial.
- [Behance, Gauge Chart](https://www.behance.net/gallery/233895453/Gauge-Chart) (05, 06, aberto): arcos para pedidos, receita e lucro do mês; observar por que cada arco precisa do número escrito dentro.
- [Behance, Theme and UI Design for Charts, Gauges and Maps](https://www.behance.net/gallery/65301405/Theme-and-UI-Design-for-Charts-Gauges-and-Maps) (05, aberto): tratamento de tema, grade e tipografia; descartar a parte de ponteiro.
- [Behance, Axure Tutorial, Progress Ring](https://www.behance.net/gallery/180372547/Axure-Tutorial-Practices-and-Examples-29Progress-Ring) (03): componente de anel de progresso; a página traz só o texto introdutório.
- [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit) (01, 03, não aberto): linear, circular e em etapas no mesmo arquivo; referência de altura de barra e espessura de anel.
- [Figma Community, Figma Chart Components](https://www.figma.com/community/file/1477881073711295499/figma-chart-components) (02, 06, não aberto): 19 componentes de gráfico, com gauges e indicadores de estado.
- [Figma Community, plugin Gauge Charts](https://www.figma.com/community/plugin/1584969787567772564/gauge-charts-quick-customizable-gauge-dial-speedometer-chart-widget-for-figma-figjam) (06, não aberto): mostradores e indicadores de KPI; só para rascunho, o Farol desenha em código.
- [Dribbble, Figma Charts UI kit, Gauge templates](https://dribbble.com/shots/14711130-Figma-Charts-UI-kit-Gauge-templates) (06, não abriu): modelos de gauge de kit.
- [Dribbble, UI Progress Indicator Percentage Ring Chart](https://dribbble.com/shots/4069776-UI-Progress-Indicator-Percentage-Ring-Chart) (03, não abriu): anel com percentual central, padrão recorrente em cartões.
- [Dribbble, tag progress-bar](https://dribbble.com/tags/progress-bar) (01, listagem de tag): tratamentos de trilho e de estouro.
- [Dribbble, tag kpi-dashboard](https://dribbble.com/tags/kpi-dashboard) (02, listagem de tag): quantos cartões desenham gauge onde caberia um bullet, o problema que Few descreve.
- [Dribbble, tag bullet_chart](https://dribbble.com/tags/bullet_chart) (02, não aberto): a única pista de portal para bullet chart.

**Lacuna registrada.** O bullet chart, formato mais recomendado da família, não tem nenhuma peça de portal verificada; o bullet do Farol sai da especificação de Few, não de referência visual.

### Documentos do Farol

- [Estudo da família](../_estudo/familias/13_progresso-meta-e-gauge.md): os 20 formatos pesquisados, as 16 decisões transversais, o código de `polar`, `ringArc` e `valueToAngle` e as fontes com marcação de aberto ou busca.
- [Catálogo da família](../_estudo/catalogo/13_progresso-meta-e-gauge.json): modelos e versões com caso de uso, o que cada versão demonstra e canvas sugerido.
- [CONTRATO.md](../CONTRATO.md): presets de canvas, `meta.json`, tokens, formatadores e o padrão de acabamento da seção 17.
- [CHECKLIST_REVISAO.md](../CHECKLIST_REVISAO.md): a régua de revisão aplicada a cada versão.
- [Padrão de acabamento, estudo](../_estudo/00_acabamento.md): M4 e M5 sobre bullet graph, A4 sobre linha de meta, G11 sobre realizado e projeção, armadilhas 2 (gauge) e 19 (meta que some com `discard`).
