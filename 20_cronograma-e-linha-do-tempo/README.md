# Cronograma e linha do tempo

Cronogramas e linhas do tempo colocam **coisas no eixo do tempo**: quando começam, quando terminam, quanto duram, o que acontece ao mesmo tempo, em que ordem e onde estamos hoje frente ao plano. A diferença para a família 04 (linhas) é o objeto: aqui o dado é um **intervalo ou um evento**, não uma medida contínua amostrada no tempo. Os nove modelos abaixo vão do Gantt de barras em tupla do Recharts ao Gantt com dependências em SVG puro, passando por marcos datados, etapas sem escala, jornada de cada oportunidade, raias de agenda, histórico em cartões, roadmap sem datas e eventos com magnitude.

Estudo de origem: [`_estudo/familias/20_cronograma-e-linha-do-tempo.md`](../_estudo/familias/20_cronograma-e-linha-do-tempo.md). Catálogo desta família: [`_estudo/catalogo/20_cronograma-e-linha-do-tempo.json`](../_estudo/catalogo/20_cronograma-e-linha-do-tempo.json).

## O que a família responde

Perguntas típicas no Farol, com dado fictício:

- **Comercial:** quanto tempo cada oportunidade ficou em cada etapa até o fechamento? Em que passo do handoff está a oportunidade OP-0412? Quando fecharam e de que tamanho foram os fechamentos de cada executivo no trimestre?
- **Pré-vendas:** como está a agenda de reuniões de cada SDR na semana, e onde há sobreposição ou buraco? Quanto a oportunidade esperou em cada troca de dono, e em qual passagem o SLA estourou?
- **Marketing:** quando cada campanha e cada criativo esteve no ar, por plataforma? Que eventos de mídia coincidem com o degrau do CPL qualificado? Em que ordem as tarefas de implantação de um canal dependem umas das outras?
- **Diretoria:** quais marcos do plano 2027 já foram atingidos e quais atrasaram? Quais iniciativas passaram da linha de base? O que entra agora, no próximo ciclo e depois, e qual tarefa define a data da janela de leitura?

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | O que responde |
|---|---|---|---|---|---|
| 01 | Gantt | [./01_gantt/](./01_gantt/) | Recharts nativo | 4 | Períodos com início e fim, até cerca de 30 linhas; absorve progresso com linha de base, hierarquia com tabela e linha do tempo empacotada. |
| 02 | Linha do tempo de marcos | [./02_linha-do-tempo-de-marcos/](./02_linha-do-tempo-de-marcos/) | Recharts custom | 4 | Eventos de duração zero na data exata, com colisão de rótulo resolvida; absorve a narrativa alternada e a régua de marcos com estado (13#17). |
| 03 | Stepper de etapas | [./03_stepper-de-etapas/](./03_stepper-de-etapas/) | HTML com Tailwind | 4 | Em que passo de um processo linear a entidade está, sem escala de tempo. |
| 04 | Jornada por entidade | [./04_jornada-por-entidade/](./04_jornada-por-entidade/) | Recharts nativo | 4 | Sequência e duração de cada etapa por oportunidade; absorve o diagrama de Marey. |
| 05 | Swimlane de eventos e agenda | [./05_swimlane-de-eventos/](./05_swimlane-de-eventos/) | SVG puro | 4 | Vários períodos e eventos por raia de pessoa, canal ou função; absorve a agenda em grade. |
| 06 | Linha do tempo vertical em cartões | [./06_feed-vertical-de-eventos/](./06_feed-vertical-de-eventos/) | HTML com Tailwind | 4 | Histórico detalhado de uma entidade, lido em sequência e agrupado por dia. |
| 07 | Roadmap por horizonte | [./07_roadmap-por-horizonte/](./07_roadmap-por-horizonte/) | HTML com Tailwind | 4 | Prioridade e sequência em agora, próximo e depois, sem prometer datas. |
| 08 | Linha do tempo de círculos | [./08_linha-do-tempo-de-circulos/](./08_linha-do-tempo-de-circulos/) | Recharts nativo | 4 | Eventos com magnitude por categoria, com área proporcional ao valor; absorve a régua micro de eventos (24#41). |
| 09 | Gantt com dependências e caminho crítico | [./09_gantt-com-dependencias/](./09_gantt-com-dependencias/) | SVG puro | 4 | Encadeamento entre tarefas, folga de cada uma e a sequência que define o prazo final. |

As pastas dos modelos são criadas quando as versões forem produzidas.

## Quando a família serve

- O dado é um intervalo (início e fim) ou um evento (data exata), e a posição no tempo é a leitura.
- Paralelismo, sobreposição e buraco entre períodos importam tanto quanto a duração.
- A pergunta é onde estamos hoje frente a um plano, a um SLA ou a uma sequência de etapas.
- Histórico de uma entidade que precisa ser lido em ordem, com texto, tipo e autor.
- Planejamento, com ou sem datas comprometidas, que precisa separar o que é promessa do que é intenção.

## Quando procurar outra família

- Medida contínua ao longo do tempo (CPL diário, agendas por dia), com faixas e marcos explicando mudanças: linha simples (04/01).
- Acumulado contra meta, burn-up ou burn-down: acumulado contra meta (04/06).
- Estado discreto por dia, tipo SLA cumprido ou não: faixa de status e de calor (24/04).
- Prazos e eventos numa grade de dias do mês: calendário mensal em grade (15/05).
- Valor por dia codificado em cor, ou carga por pessoa por dia: mapa de calor e calendário (15).
- Ciclo de hora do dia ou mês do ano em peça radial: coluna radial (07/06).
- Planejado contra realizado como dois valores por categoria, sem intervalo de tempo: comparação de pontos (17).
- Linhas verticais finas de altura variável no tempo (sismograma): colunas verticais (03).
- Um número só, como contagem regressiva para um prazo: cards e KPIs (01).
- Volume agregado por etapa, sem identidade de entidade: funil (10); transições em massa entre etapas: fluxo e Sankey (11).

## Guia rápido: qual modelo escolher

1. **Cada linha tem início e fim, e as datas são comprometidas?** Gantt (01). Planejado contra realizado: v2. Fases com entregas e colunas de dono: v3. Muitos intervalos curtos e anônimos: empacotado (v4).
2. **O encadeamento entre tarefas define o prazo?** Gantt com dependências (09), com caminho crítico calculado antes do render. Mais de 25 conectores: só os da tarefa em foco (v3).
3. **São eventos pontuais, sem duração?** Linha do tempo de marcos (02). Marcos de um plano com estado atingido, em curso e futuro: régua (v2). Poucos eventos com uma frase cada: narrativa (v3).
4. **Os eventos têm magnitude que precisa ser comparada?** Linha do tempo de círculos (08), com área proporcional e domínio a partir do zero. Régua de eventos sob um sparkline: v3.
5. **A pergunta é em que passo o processo está, sem escala de tempo?** Stepper de etapas (03). Coluna de etapa numa tabela: v3.
6. **Quanto tempo cada oportunidade ficou em cada etapa?** Jornada por entidade (04). Comparar ciclos: alinhada pelo dia zero (v3). Velocidade de passagem e retornos: Marey (v4).
7. **Vários períodos por pessoa, canal ou função?** Swimlane de eventos e agenda (05). Grade de horário de um dia por SDR: agenda em grade (v4).
8. **Histórico detalhado de uma entidade, com texto e autor?** Linha do tempo vertical em cartões (06).
9. **Planejamento sem datas firmes?** Roadmap por horizonte (07). Quando a iniciativa ganha data, ela vai para o Gantt (01) com o mesmo id.

Regras que valem para os nove modelos:

- Datas entram em `YYYY-MM-DD` e viram milissegundos por `Date.UTC`, nunca por `new Date('2026-10-01')` em horário local, que desloca a barra por fuso. Barra de um dia soma um dia ao fim.
- Ticks de calendário (primeiro dia do mês, segunda-feira) são gerados em TypeScript e formatados por `formatMonthShort` ou `formatDate`: o eixo numérico não sabe o que é mês.
- A data de hoje vem no dado, nunca do relógio, e a linha de hoje precisa de contraste contra o fundo escuro.
- A escala de tempo é real, salvo nos modelos que declaram não ter escala (03, 06 e 07); com espaçamento uniforme, a data vai escrita em cada item.
- Período sem fim desenha até hoje com ponta aberta e o rótulo em aberto; período sem início sai do eixo para uma lista sem data, nunca para o zero.
- Faixas sombreadas com opacidade baixa e contorno, porque preenchimento claro em fundo escuro domina a leitura.
- Estado e atraso vão em texto ou ícone junto da cor: concluído, atual, futuro, pulado e atrasado precisam ser legíveis sem cor.

## Referências cruzadas

O estudo mapeou 19 formas. Nove viraram modelos aqui, seis foram absorvidas como versões e quatro moram em outra família; entram também duas formas vindas de outras famílias (13#17 e 24#41) e o burn-up, que o estudo mandou para linhas.

| Visual do estudo | Onde mora | Por quê |
|---|---|---|
| Gantt de progresso e linha de base (20#2) | [01 Gantt](./01_gantt/), versão v2 | É o mesmo Gantt com shape customizado no `Bar`: o planejado vira trilho e o realizado, preenchimento. |
| Gantt hierárquico com tabela (20#4) | [01 Gantt](./01_gantt/), versão v3 | Os níveis viram linhas indentadas com colunas de texto no tick do eixo. |
| Linha do tempo empacotada (20#5) | [01 Gantt](./01_gantt/), versão v4 | É o Gantt cujas linhas perdem identidade fixa e viram faixas preenchidas por empacotamento guloso. |
| Linha do tempo narrativa com rótulos alternados (20#10) | [02 linha do tempo de marcos](./02_linha-do-tempo-de-marcos/), versão v3 | São marcos com cartão de texto; a escala real fica declarada no subtítulo. |
| Régua de marcos (13#17) | [02 linha do tempo de marcos](./02_linha-do-tempo-de-marcos/), versão v2 | Marco não tem duração; atingido, em curso e futuro viram forma do marcador. |
| Diagrama de Marey (20#17) | [04 jornada por entidade](./04_jornada-por-entidade/), versão v4 | Mesma entidade e mesmas etapas; a jornada vira polilinha em degrau. |
| Agenda em grade (20#15) | [05 swimlane de eventos e agenda](./05_swimlane-de-eventos/), versão v4 | É a swimlane girada: horas na vertical e uma coluna por pessoa. |
| Linha do tempo de eventos micro (24#41) | [08 linha do tempo de círculos](./08_linha-do-tempo-de-circulos/), versão v3 | É a linha de círculos sem eixo e com tamanho fixo, presa ao domínio do sparkline vizinho. |
| Linha de estado em blocos, tracker (20#8) | [24_microvisuais-sparklines, modelo 04 faixa de status e de calor](../24_microvisuais-sparklines/04_faixa-de-status-tracker/) | Estado discreto em blocos iguais é microvisual de célula, não intervalo nem evento. |
| Faixas e marcos sobre série temporal (20#13) | [04_linhas, modelo 01 linha simples](../04_linhas/01_linha-simples/) | O dado principal é a medida contínua; faixas e marcos são anotação por `ReferenceArea` e `ReferenceLine`. |
| Calendário de marcos (20#14) | [15_mapa-de-calor-e-calendario, modelo 05 calendário mensal em grade](../15_mapa-de-calor-e-calendario/05_calendario-mensal-em-grade/) | A grade de sete colunas é a mesma do calendário da família 15, com chips no lugar da cor. |
| Linha do tempo radial ou espiral (20#19) | [07_rosca-e-radial, modelo 06 coluna radial](../07_rosca-e-radial/06_coluna-radial/) | Ciclo enrolado em círculo é geometria radial, e comparar duração por comprimento de arco engana. |
| Burn-up e burn-down | [04_linhas, modelo 06 acumulado contra meta](../04_linhas/06_acumulado-contra-meta/) | É medida acumulada contínua, não intervalo nem evento. |

## Referências

Só links que já estão nos estudos. **[busca]** marca URL que veio de resultado de busca e não foi aberta; **(não abriu)** marca página que falhou ao abrir. Duas lacunas ficaram registradas no estudo: nenhuma referência específica foi aberta para o diagrama de Marey nem para o roadmap por horizonte.

### Método e praticantes

- [Storytelling with Data, What is a Gantt chart](https://www.storytellingwithdata.com/blog/what-is-a-gantt-chart): observar a linha de hoje, marcos como forma distinta das barras, cor só para o caminho crítico e o Gantt combinado com linha (01, 02, 09).
- [Nightingale, Ganttsgiving: Plotting a Holiday Feast](https://nightingaledvs.com/ganttsgiving-plotting-a-holiday-feast/): observar como dependências e cor por categoria de tarefa revelam tempo ocioso aproveitável (04, 09).
- [Datawrapper Academy, How to create text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar âncoras de expansão e a troca das anotações por chaves numeradas no celular (02).
- [Datawrapper Academy, How to show negative values in symbol maps](https://www.datawrapper.de/academy/how-to-show-negative-values-in-symbol-maps): observar a regra de que círculo só tem raio positivo, que vale para estornos (08).
- [Wikipedia, Gantt chart](https://en.wikipedia.org/wiki/Gantt_chart): observar as variantes de progresso, a crítica de que o gráfico achata incerteza e a nota sobre Gantt ligados ficarem poluídos (01, 09).
- [Wikipedia, Swim lane](https://en.wikipedia.org/wiki/Swim_lane): observar a origem em diagramas de processo e a orientação horizontal preferida em tela (05).
- [Wikipedia, Milestone (project management)](https://en.wikipedia.org/wiki/Milestone_(project_management)): observar marco como tarefa de tempo zero e o losango como notação (02, 03).
- [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/): observar o cuidado com contexto temporal em painéis que mudam enquanto são lidos (08 v3, via estudo 24).
- [Asana, Milestone chart, definition and steps](https://asana.com/resources/milestone-chart) [busca]: observar os componentes de um marco, com marcador, eixo de data, descrição, dependência e dono (02 v2, via estudo 13).

### Catálogos e documentação

- [Data Viz Catalogue, Gantt Chart](https://datavizcatalogue.com/methods/gantt_chart.html): observar os recursos opcionais (marcos, dependências, data atual) e o formato de tabela com trilha (01).
- [Data Viz Catalogue, Timeline](https://datavizcatalogue.com/methods/timeline.html): observar a distinção entre linha do tempo com escala e sequência sem escala, e a orientação vertical (02, 06).
- [Data Viz Catalogue, Span Chart](https://datavizcatalogue.com/methods/span_chart.html): observar o aviso de que intervalos mostram só os extremos (01, 04).
- [Data Viz Catalogue, Timetable](https://datavizcatalogue.com/methods/timetable.html): observar a função de referência para eventos agendados e o parentesco com horários de transporte (05, 04 v4).
- [Data Viz Catalogue, Calendar](https://datavizcatalogue.com/methods/calendar.html) e [blog de combinações com calendário](http://datavizcatalogue.com/blog/chart-combinations-visualizing-data-in-calendars/): observar a grade de sete colunas e barras atravessando dias (referência cruzada 15/05).
- [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar as definições de Priestley timeline e circle timeline em Change over time (01 v4, 08).
- [Vega-Lite, Gantt Chart (ranged bar)](https://vega.github.io/vega-lite/examples/bar_gantt.html): observar a codificação mínima `x`, `x2` e `y`, o mesmo contrato da tupla do Recharts (01).
- [Highcharts, X-range series](https://www.highcharts.com/docs/chart-and-series-types/x-range-series): observar `x`, `x2`, `y` como índice da raia e o `partialFill` para percentual concluído (01 v2, 05).
- [Highcharts, Timeline series](https://www.highcharts.com/docs/chart-and-series-types/timeline-series): observar rótulos alternados e a escolha entre eixo de datas e distribuição uniforme (02 v3).
- [Highcharts, Getting started with Gantt](https://www.highcharts.com/docs/gantt/getting-started-gantt): observar dependências, hierarquia de tarefas e eixo em grade (01 v3, 09).
- [AG Charts, Range Bar Series](https://www.ag-grid.com/charts/react/range-bar-series/): observar a direção horizontal e rótulos distintos para início e fim (01).
- [Tremor, Tracker](https://tremor.so/docs/visualizations/tracker): observar o contrato de cor e dica por bloco e a redução de blocos por breakpoint (referência cruzada 24/04).
- [Flowbite, Timeline](https://flowbite.com/docs/components/timeline/): observar `border-s` com marcador absoluto, log de atividades agrupado por data e o stepper horizontal com conector `h-px` (03, 06).
- [nivo, Calendar](https://nivo.rocks/calendar/): observar a organização em anos, meses e dias, só como referência de forma (referência cruzada 15/05).
- [Vizzlo, Milestone Charts](https://vizzlo.com/graphs/milestones): observar as variantes de marco e o partido de rótulo alternado (02 v2, via estudo 13).
- [microcharts, EventTimeline](https://microcharts.dev/docs/charts/event-timeline) (não abriu): observar a linha do tempo de eventos como microvisual de célula (08 v3, via estudo 24).

### Stack (Recharts 3.10)

- [TimelineExample](https://recharts.github.io/en-US/examples/TimelineExample/): observar `layout="vertical"`, `Bar` com `dataKey` em tupla e `stackId` comum para número fixo de segmentos por linha (01, 05).
- [Ranged Bar Chart](https://recharts.github.io/en-US/examples/BarChartRangeExample/): observar que a tupla `[min, max]` basta, sem série transparente de deslocamento (01).
- [Ranged Stacked Bar Chart](https://recharts.github.io/en-US/examples/RangedStackedBarChart/): observar `BarStack` com séries em tupla (04).
- [Scatter Chart With Labels](https://recharts.github.io/en-US/examples/ScatterChartWithLabels/): observar `LabelList` dentro de `Scatter` (02).
- [BubbleChart](https://recharts.github.io/en-US/examples/BubbleChart/): observar `ZAxis range` e linhas empilhadas como faixas (08).
- [Índice de exemplos](https://recharts.github.io/en-US/examples/) e [API](https://recharts.github.io/en-US/api/): observar `ReferenceArea`, `ReferenceLine`, `useXAxisScale`, `usePlotArea` e `ZIndexLayer` (01 v2, 02 v3).

### Portais de design

- [Behance, Dashboard Gantt Chart UI kit](https://www.behance.net/gallery/181443889/Dasboard-Gantt-Chart-UI-kit-Components-UX): observar barras, marcos, linha de hoje e dependências organizados como componentes separados do gráfico (01, 09).
- [Behance, busca "gantt chart"](https://www.behance.net/search/projects/gantt%20chart): observar como células, barra superior e navegação convivem com as barras (01).
- [Behance, Repair Planning Dashboard](https://www.behance.net/gallery/247578277/Repair-Planning-Dashboard): observar um Gantt de planejamento com tarefas encadeadas em tela de desktop (01 v2, 09).
- [Behance, Gantt Chart / Project Timeline](https://www.behance.net/gallery/109367269/Gantt-Chart-Project-Timeline): observar a divisão em fases de um cronograma de projeto (01 v3).
- [Behance, Task and Project Management Web Design](https://www.behance.net/gallery/161886233/Task-and-Project-Management-Web-Design): observar a visão diária e de calendário e a troca de equipe como filtro de raias (05).
- [Behance, busca "timeline dashboard"](https://www.behance.net/search/projects/timeline%20dashboard): observar painéis que combinam lista e trilha e feeds de atividade (04, 06).
- [Information is Beautiful Awards, showcase "timeline"](https://www.informationisbeautifulawards.com/showcase?query=timeline): observar peças editoriais de linha do tempo; o projeto sobre secas históricas citado no estudo ([link](https://labs.waterdata.usgs.gov/visualizations/drought-timeline/index.html#/)) não abriu (02 v3).
- [Dribbble, Gantt chart roadmap for marketing](https://dribbble.com/shots/16303456-Gantt-chart-Roadmap-for-Marketing-Company) [busca]: observar o Gantt usado como roadmap de marketing (01, 07).
- [Dribbble, Gantt chart timeline](https://dribbble.com/shots/4391846-Gantt-Chart-Timeline) [busca]: observar a visão de andamento de projetos em curso e futuros (01).
- [Dribbble, Gantt chart UI](https://dribbble.com/shots/5610958-Gantt-Chart-UI) [busca]: observar o Gantt como tela de produto (01).
- [Dribbble, activity feed dashboard](https://dribbble.com/shots/3890634-Activity-Feed-Dashboard) [busca]: observar o feed de atividade como linha do tempo vertical dentro de dashboard, útil para histórico de handoff (06).
- [Dribbble, product dashboard activity feed](https://dribbble.com/shots/1740688-Product-Dashboard-Activity-Feed-UI-UX) [busca]: observar a hierarquia de evento no feed (06).
- [Dribbble, tag event timeline](https://dribbble.com/tags/event_timeline) (não abriu): observar marcadores por tipo de evento e agrupamento de eventos próximos (08 v3).
- [Figma Community, project timeline gantt chart](https://www.figma.com/community/file/1195850074518926318/project-timeline-gantt-chart) [busca]: observar tarefas, prazos e conexões no mesmo quadro (09).
- [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit) [busca]: observar a variação em etapas, base da régua de marcos e do stepper (02 v2, 03).

Nos portais, a qualidade visual dos shots marcados como [busca] não foi conferida: olhe a peça antes de adotar. Todo visual do Farol sai em código, com dado fictício e tokens do tema escuro.
