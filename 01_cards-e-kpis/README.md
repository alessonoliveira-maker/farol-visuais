# Cards e KPIs

A família do **número que responde sozinho**. Enquanto as outras famílias comparam muitas coisas, aqui existe uma medida em destaque e tudo o mais no cartão serve para dar o contexto mínimo que impede a leitura errada desse número: contra quando, contra quanto, com que forma no tempo, com que confiança e de onde ele vem. Um número sozinho não é informação; um número com gráfico que não acrescenta nada também não. Os cartões são HTML com Tailwind e tokens do Farol em moldura `stage`, porque o KPI já é o próprio cartão; gráfico, quando entra, é miniatura subordinada ao número.

## O que a família responde

* **Comercial:** quanto de receita foi reconhecido no mês, e isso é bom? A receita do trimestre está na meta, e no ritmo atual chega? Quem entre os executivos está acima da mediana?
* **Pré-vendas:** quantas agendas foram marcadas na semana, contra a semana anterior e contra o teto de capacidade? O SLA de primeiro contato falhou em bloco ou espalhado? O volume de agendas subiu à custa do comparecimento?
* **Marketing:** o CPL qualificado subiu ou desceu, e com que forma nos últimos 12 meses? Quanto do volume de leads veio de cada origem, e quanto chegou sem origem? Quando a mídia foi coletada pela última vez?
* **Diretoria:** qual é a faixa provável do cenário, em vez do ponto médio disfarçado de certeza? Qual fila já passou do teto? Esse número é medido, derivado, premissa ou lacuna?
* **Todos:** esse número existe? O cartão que diz honestamente que não há coleta é um modelo, não um erro de renderização.

## Quando a família serve

* Primeira leitura de uma tela, com 3 a 6 números de abertura antes de qualquer gráfico.
* Número que precisa de uma âncora para ter sentido: período anterior, meta, teto, faixa ou par de numerador e denominador.
* Estado honesto de uma métrica: zero medido, sem coleta, sem base de comparação, defasada ou fora da régua.
* A mesma métrica repetida por entidade, quando a comparação cabe em cartões pequenos com escala comum.

## Modelos

| Modelo | Abordagem | O que resolve | Variações do estudo absorvidas | Versões previstas |
|---|---|---|---|---|
| [01 KPI simples com contexto](./01_kpi-simples/) | HTML com Tailwind | Número com período, variação, meta, par, status, procedência, frescor ou ausência | 01#2, 01#3, 01#9, 01#10, 01#13, 01#14, 01#15, 01#20, 01#23, 01#27, 01#29, 01#30, 01#33, 21#10 | 4 |
| [02 KPI com minigráfico de tendência](./02_kpi-com-minigrafico-de-tendencia/) | Recharts nativo | A forma recente da série: sparkline, sparkbar, comparativa e fita de estado | 01#4, 01#5, 01#19, 01#26, 01#31 | 4 |
| [03 KPI com régua de meta, ritmo ou teto](./03_kpi-com-regua-de-meta/) | HTML com Tailwind | Quanto já foi, se o ritmo chega e se o uso passou do teto | 01#6, 01#7, 01#8, 01#22, 01#32 | 4 |
| [04 KPI com faixa de incerteza ou distribuição](./04_kpi-com-faixa/) | SVG puro | Cenário em faixa e tempo de cauda longa em mediana e p90 | 01#12, 01#34 | 4 |
| [05 KPI com decomposição em partes](./05_kpi-com-decomposicao/) | HTML com Tailwind | O total e as partes que o formam, com demais e sem rótulo | 01#11, 01#18, 01#28 | 4 |
| [06 Par de indicadores](./06_par-de-indicadores/) | HTML com Tailwind | Volume e qualidade na mesma leitura, com veredito calculado | 01#25 | 4 |
| [07 Grade e tira de KPIs](./07_grade-e-tira-de-kpis/) | HTML com Tailwind | Tira de abertura de tela e grade de scorecards por entidade | 01#16, 01#17 | 4 |
| [08 Card de exceção](./08_card-de-excecao/) | HTML com Tailwind | Casos fora de uma régua escrita, com severidade e caminho para a lista | 01#21 | 4 |

A numeração `01#N` é a do estudo da família em [`_estudo/familias/01_cards-e-kpis.md`](../_estudo/familias/01_cards-e-kpis.md); `21#10` vem do estudo da família 21. O catálogo das versões previstas, com caso de uso, o que cada uma demonstra e o canvas sugerido, está em [`_estudo/catalogo/01_cards-e-kpis.json`](../_estudo/catalogo/01_cards-e-kpis.json).

Variações absorvidas sem versão própria, e onde a técnica aparece:

* **01#20 posição no ranking:** entra na grade de executivos do modelo 07 (`3º de 12` em cada cartão).
* **01#27 seletor de janela:** entra na tira da pré-vendas do modelo 07, com um seletor único para a tira inteira.
* **01#29 em carregamento:** fica na página, não no componente; pela regra EST-5 do contrato o esqueleto com a altura do cartão é da página e o Chart recebe dado pronto.
* **01#26 bandline:** extensão da sparkline do modelo 02, sem versão própria nesta rodada; exige pelo menos cerca de 20 observações e quartis sobre a janela de referência, nunca sobre a janela visível.
* **01#32 anel de progresso:** o anel compara mal por ângulo; quando for pedido, segue a regra do modelo 03 (percentual escrito no centro, denominador escrito) e o progresso protagonista mora na família 13.

## Guia rápido: qual modelo escolher

Responda as perguntas nesta ordem e pare na primeira que for sim.

1. **Só importa quando uma régua estoura?** [08 Card de exceção](./08_card-de-excecao/): faixa própria de exceções, com o estado calmo ocupando o lugar.
2. **São vários cartões na mesma peça?** [07 Grade e tira](./07_grade-e-tira-de-kpis/): métricas diferentes em tira; a mesma métrica por entidade em grade com escala comum.
3. **O número pode ser inflado à custa de outro?** [06 Par de indicadores](./06_par-de-indicadores/): par declarado, coorte comum e veredito em texto.
4. **É projeção, cenário ou tempo de cauda longa?** [04 KPI com faixa](./04_kpi-com-faixa/): faixa escrita como número principal; mediana e p90 no lugar da média.
5. **O total só faz sentido com as partes?** [05 KPI com decomposição](./05_kpi-com-decomposicao/): filhos com relação declarada, barra segmentada até 5 partes ou lista dos maiores com a linha de demais.
6. **O julgamento depende de meta, ritmo ou teto?** [03 KPI com régua](./03_kpi-com-regua-de-meta/): barra para meta acumulada, marcador de ritmo quando o tempo decorrido importa, trilho com excesso visível quando o 100% é teto.
7. **A forma da série muda a conclusão?** [02 KPI com minigráfico](./02_kpi-com-minigrafico-de-tendencia/): linha para trajetória, colunas para contagem discreta, segunda linha neutra para sazonalidade, fita para cumprimento diário.
8. **Nenhuma das anteriores.** [01 KPI simples](./01_kpi-simples/): acrescente só a âncora que falta (período anterior, meta, par de razão, status com régua, procedência ou carimbo de frescor).

Confusões frequentes e a saída de cada uma:

| Situação | Use | Não use |
|---|---|---|
| CPL que caiu no mês | 01 com polaridade menor melhor | Cor tirada do sinal do delta |
| Taxa com 7 de 28 | 01 com `formatRateWithVolume` | Percentual sozinho |
| Meta olhada no dia 5 do mês | 03 com marcador de ritmo | Barra de progresso sem o tempo decorrido |
| Fila acima do teto | 03 com excesso hachurado além do teto | Barra clampada em 100% |
| Forecast do ano | 04 com faixa e premissa escrita | Ponto médio em 30 px |
| Ciclo de venda | 04 com mediana, p90 e n | Média de distribuição de cauda longa |
| Leads por origem com lacuna | 05 com a linha sem origem registrada | Lacuna dissolvida em demais |
| Doze executivos com sparkline | 07 com domínio comum a todos | Escala livre por cartão |
| Fonte sem coleta | 01 no estado indisponível, com motivo | `0`, traço solto ou `NaN` |
| Todos os cartões com semáforo | 01 com ponto de ação só no que saiu da régua | Cor em todos os cartões |

## Decisões que valem para todos os modelos

* **Hierarquia de três pesos:** rótulo pequeno, número em `kpi-number text-3xl leading-none font-semibold`, contexto pequeno; nada abaixo de 11 px (TIP-1, TIP-2).
* **Algarismo tabular** em todo número e formatação só por `@/lib/format` ou `valueFormat`.
* **A polaridade decide a cor, nunca o sinal do delta,** e a cor vem sempre com sinal tipográfico e ícone (COR-6, ACE-2).
* **Toda variação nomeia a base** na mesma linha; taxa varia em pontos percentuais, valor varia em percentual (NUM-4).
* **Denominador abaixo de 30** sai com o par, e a variação perde a cor semântica.
* **Sem fundo tingido atrás de texto semântico** (COR-7): a cor mora no texto, no ícone ou na borda.
* **Zero medido é zero** em tipografia cheia; ausência é `formatUnavailable()` com motivo específico (EST-2, EST-3).
* **Procedência uma vez por cartão:** no Farol ela é do `VisualCard` (ANO-6); só o KPI de moldura `stage`, que é o próprio cartão, desenha a etiqueta.
* **Sparkline sem eixo não preenche área** quando a escala não parte do zero (EIX-2) e leva `aria-hidden` quando a frase acessível já traz a tendência.
* **Grade e tira não dançam:** mesma altura, mesma linha de base do número e espaço reservado para variação, ponto de ação e micrográfico, mesmo quando vazios.

## Referências cruzadas

* **KPI em texto corrido (01#24):** vai para frase com número, [21 texto e nuvem de palavras, modelo 01](../21_texto-e-nuvem-de-palavras/01_frase-com-numero/).
* **Sparkline como visual inteiro** (coluna de tabela, sparkline sem número em destaque): [24 microvisuais e sparklines, modelo 01](../24_microvisuais-sparklines/).
* **Progresso protagonista** (arco, gauge ou barra que é a peça inteira): [13 progresso, meta e gauge](../13_progresso-meta-e-gauge/).
* **Scorecard em tabela** (várias métricas por entidade lidas linha a linha): [14 tabelas visuais, modelo 04](../14_tabelas-visuais/).
* **Lista de contribuição que virou protagonista:** [02 barras horizontais](../02_barras-horizontais/).
* **Contribuições de sinais opostos lidas como forma:** [19 cascata](../19_cascata-waterfall/).
* **Faixa de incerteza ao longo do tempo:** [05 áreas](../05_areas/); **distribuição completa com caixa e atípicos:** [16 distribuição](../16_distribuicao/).
* **Fita de estado com mais de cerca de 90 células:** [15 mapa de calor e calendário](../15_mapa-de-calor-e-calendario/).
* **Par de indicadores visto em muitos pontos:** [09 dispersão e bolhas](../09_dispersao-e-bolhas/) ou [25 matriz e quadrantes](../25_matriz-e-quadrantes/).
* **Filho de filho na decomposição:** [12 hierarquia](../12_hierarquia/).

## Referências

Juntam as fontes do [estudo da família](../_estudo/familias/01_cards-e-kpis.md) e da seção 01 da [varredura de portais de design](../_estudo/00_portais-de-design.md). A marca entre parênteses repete a do estudo: **aberto** é página lida; **busca** é resultado de busca não aberto, que vale pelo título e pelo trecho; sem marca é fonte herdada das primeiras sessões do estudo.

### Catálogos

* [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/). Observar o número com microgrático como unidade de leitura, repetível em tabela e em grade (modelos 02 e 07).
* [Data Viz Project, Column Sparkline](https://datavizproject.com/data-type/column-sparkline/). Observar quando a coluna ganha da linha no mesmo espaço (modelo 02, sparkbar).
* [Data Viz Project, Win loss Sparkline](https://datavizproject.com/data-type/win-loss-sparkline/) (busca). Observar o formato de dois estados, parente direto da fita de estado (modelo 02).
* [Data Viz Project, Bullet Graph](https://datavizproject.com/data-type/bullet-graph/). Observar a genealogia: variação de barra que substitui o medidor de painel (modelo 03).
* [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Observar medida principal, medida comparativa e faixas qualitativas, e que o mesmo desenho serve para meta e para teto (modelo 03).
* [Data Viz Catalogue, Box Plot](https://datavizcatalogue.com/methods/box_plot.html) (aberto). Observar mediana, quartis e atípicos, que a régua do modelo 04 resume em quatro marcas.
* [FT Visual Vocabulary, README](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). Observar as categorias magnitude, parte do todo, ranking e distribuição, para saber quando o cartão deixa de bastar (modelos 01, 04 e 05).
* [Datawrapper Academy, formatos numéricos personalizados](https://academy.datawrapper.de/article/207-custom-number-formats-that-you-can-display-in-datawrapper). Observar sinal, separador, sufixo e arredondamento, que é metade do trabalho do número grande (modelo 01).
* [Datawrapper Academy, células vazias exibidas como zero](https://www.datawrapper.de/academy/my-empty-cells-get-displayed-as-zeros-in-tooltips). Observar por que vazio virando zero é bug e não detalhe (modelo 01, estado indisponível).
* [Datawrapper Academy, dados irregulares](https://academy.datawrapper.de/article/321-patchy-data) (busca). Observar o buraco na série que quebra a linha e a falha de coleta que não pode ser lida como resultado (modelos 02 e 08).
* [Datawrapper Academy, o que considerar em gráficos de linha](https://academy.datawrapper.de/article/129-what-to-consider-when-creating-line-charts) (busca). Observar a separação entre o que o gráfico mostra bem e o que ele leva a concluir errado, que vale para a projeção do modelo 03.
* [Datawrapper, text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/) (aberto). Observar a regra de não acrescentar precisão e de repetir a unidade junto do número (modelos 01 e 21/01).
* [shadcn/ui, galeria de gráficos](https://v3.shadcn.com/charts) e [galeria de área](https://ui.shadcn.com/charts/area) (aberto). Observar o cartão com cabeçalho de número e rodapé de tendência, forma canônica da tira nesta stack (modelo 07).
* [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart) (busca). Observar a leitura de concentração, poucos itens explicando a maior parte do total (modelo 05, lista de contribuição).
* [Nivo, Bump chart](https://nivo.rocks/bump/). Só referência de desenho, fora da stack: observar a diferença entre mostrar a posição e mostrar a posição com o valor (posição no ranking, modelo 07).

### Praticantes

* [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) (aberto). Observar a proporção que dá inclinação perto de 45 graus, o ponto final ligado ao número, a faixa cinza de normalidade e o alerta sobre escala individual por série (modelos 02 e 07).
* [Tufte, overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/) (aberto). Observar a sobreposição como método de comparação (modelo 02, sparkline comparativa).
* [Few, Bullet Graph Design Specification, em PDF](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf) (aberto). Observar os cinco componentes, as faixas em intensidades de um só tom e a distinção entre medida em destaque e medidas comparativas (modelos 01 e 03).
* [Few, Introducing Bandlines, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/introducing_bandlines.pdf) (aberto). Observar os cinco valores das faixas, a mediana e os atípicos em ponto cheio e vazado (bandline do modelo 02 e régua do 04).
* [Few, Best Practices for Scaling Sparklines, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf) (aberto). Observar os cinco métodos de escala e a escala consistente entre sparklines comparadas (modelos 02 e 07).
* [Few, Bar Widths and the Spaces in Between, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf). Observar a lógica de respiro entre colunas, que vale para a sparkbar (modelo 02).
* [Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf) (aberto). Observar contexto insuficiente, precisão excessiva e o décimo erro: quando tudo é proeminente, nada se destaca (modelos 01, 03 e 08).
* [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). Observar a crítica aos medidores e a regra de intensidades de um só tom (modelo 03).
* [Clearly and Simply, An Alternative Design of Bullet Graphs](https://www.clearlyandsimply.com/clearly_and_simply/2017/05/an-alternative-design-of-bullet-graphs.html) (busca). Observar a crítica de que as faixas roubam atenção da barra (modelo 03).
* [IBCS, avaliação do bullet graph](https://www.ibcs.com/resource/ibcs-evaluation-bullet-graphs/) (busca). Observar as três correções propostas: tirar a terceira faixa, normalizar a meta e destacar a variação (modelo 03).
* [Nightingale, Why I Stopped Using Bullet Graphs](https://nightingaledvs.com/why-i-stopped-using-bullet-graphs-and-what-i-now-use-instead/) (aberto). Observar a curva de aprendizado e a leitura lenta, argumento para o comparativo escrito em painel de diretoria (modelos 01 e 03).
* [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text) (aberto). Observar que com um ou dois números o texto grande comunica melhor que a barra (modelos 01 e 07).
* [SWD, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty) (busca). Observar como mostrar intervalo sem assustar o público executivo (modelo 04).
* [FlowingData, Visualizing the Uncertainty in Data](https://flowingdata.com/2018/01/08/visualizing-the-uncertainty-in-data/) (busca). Observar o repertório de formas de incerteza e o custo de cada uma (modelo 04).
* [Anatomy of the KPI Card](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card) (aberto). Observar período, nome e valor como obrigatórios e o peso visual do delta contra o número (modelo 01).
* [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/) (aberto). Observar o limite de itens em memória ativa e o argumento contra cartões de importância igual (modelo 07).
* [Nightingale, Dashboard Psychology, Effective Feedback in Data Design](https://nightingaledvs.com/dashboard-psychology-effective-feedback-in-data-design/) (aberto). Observar os dois números lado a lado para provocar comparação (modelo 06).
* [Wikipedia, Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law) (aberto). Observar a medida que se degrada sob pressão, motivo de existir do par (modelo 06).
* [Stacey Barr, 3 problemas dos semáforos de KPI](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/) (não abriu, 403). Observar cortes arbitrários e variação normal lida como mudança real (status do modelo 01 e modelo 08).
* [Bernard Marr, cores de semáforo e classificações RAG](https://bernardmarr.com/performance-reporting-how-to-use-traffic-light-colours-and-rag-ratings-in-dashboards/). Observar a defesa do formato e as condições que ele exige (status do modelo 01).
* [Smart Frames UI, rethinking RAG colours](https://smart-frames.co.uk/2025/01/23/rethinking-rag-colours-in-business-intelligence-tools/) (busca) e [The end of traffic light dashboards](https://www.linkedin.com/pulse/end-traffic-light-dashboards-kat-greenbrook) (busca). Observar as codificações acessíveis de estado e a crítica ao sinal que substitui a explicação (modelos 01 e 08).
* [NN/g, skeleton screens](https://www.nngroup.com/articles/skeleton-screens/) (aberto). Observar os limiares de tempo e a exigência de espelhar o layout final; no Farol o esqueleto é da página (EST-5).
* [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/) (aberto). Observar o widget de frescor com horário e o instantâneo em cache rotulado (frescor do modelo 01).
* [Google SRE Book, Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) (aberto). Observar a seção sobre a cauda: a média esconde o 1% lento (modelo 04, mediana e p90).

### Implementação

Bibliotecas fora da stack aparecem só como referência de desenho; o código do Farol usa React, Recharts, Tailwind e lucide-react.

* [Recharts, TinyLineChart](https://recharts.github.io/en-US/examples/TinyLineChart/), [TinyBarChart](https://recharts.github.io/en-US/examples/TinyBarChart/) e a [galeria de exemplos](https://recharts.github.io/en-US/examples/). Observar o esqueleto sem eixo, sem grade e com margem mínima (modelo 02).
* [Recharts, BandedChart](https://recharts.github.io/en-US/examples/BandedChart/) (busca). Observar faixa preenchida atrás de linha, base da bandline (modelo 02).
* [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/) (aberto). Observar `RadialBar` com trilho de fundo e notar que comparar sete arcos é o uso que o anel não recomenda (modelo 03).
* [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart). Observar o arranjo número, variação e microgrático em `h-8 w-20` (modelos 01 e 02).
* [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker). Observar célula com cor e dica, cinza quando o dado não define estado e menos células por breakpoint (modelo 02, fita de estado).
* [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars). Observar o arranjo métrica, barra e texto de fração (modelo 03).
* [Tremor, BarList](https://www.tremor.so/docs/visualizations/bar-list) (aberto). Observar rótulo por dentro da barra, ordem decrescente e clique por item (modelo 05, lista de contribuição).
* [Tremor, ProgressCircle](https://www.tremor.so/docs/visualizations/progress-circle) (aberto). Observar o texto central e o corte calado acima do máximo, que o Farol precisa escrever (modelo 03).
* [Tremor Blocks, KPI cards](https://blocks.tremor.so/blocks/kpi-cards) (aberto). Observar link de ação no rodapé, total com distribuição e estados por ícone; nenhum bloco traz a linha de demais (modelos 01, 05 e 08).
* [shadcn/ui, Area Chart Interactive](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-area-interactive.tsx) (aberto). Observar o seletor de 90, 30 e 7 dias e a data de referência fixa no código (seletor de janela, modelo 07).
* [shadcn/ui, Line Chart Multiple](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-line-multiple.tsx) (aberto). Observar as duas linhas de mesmo peso, justamente a igualdade que a sparkline comparativa quebra (modelo 02).
* [shadcn/ui, Skeleton](https://ui.shadcn.com/docs/components/skeleton) (aberto). Observar o esqueleto montado com as caixas do conteúdo final, para a página que embrulha o KPI.
* [Highcharts Dashboards, componente KPI](https://www.highcharts.com/docs/dashboards/kpi-component) (aberto). Observar o KPI sincronizado com o painel: o drill pode ser filtro cruzado em vez de navegação (modelo 01).
* [Grafana, Stat](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/stat/) (aberto). Observar o hífen padrão para sem valor e o fundo sólido que pinta todos os cartões, dois hábitos que a família proíbe (modelos 01 e 08).
* [Grafana, Calculation types](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/calculation-types/) (aberto). Observar a estatística do número como escolha declarada: média, mediana ou percentil (modelo 04).
* [Google Cloud, Manage data freshness no Data Studio](https://docs.cloud.google.com/looker/docs/studio/manage-data-freshness) (aberto). Observar os intervalos de atualização por conector e o carimbo da última atualização (frescor do modelo 01).

### Portais de design

A qualidade visual dos shots de Dribbble não foi conferida na varredura: olhe a peça antes de adotar.

* [Dribbble, Dashboard Cards Light Dark](https://dribbble.com/shots/17238059-Dashboard-Cards-Light-Dark) (não abriu). Observar se hierarquia e contraste do cartão sobrevivem à troca de tema.
* [Dribbble, Sales Dashboard Dark Mode](https://dribbble.com/shots/25092919-Sales-Dashboard-Dark-Mode) (não abriu). Observar o painel escuro sobre componentes shadcn/ui, vocabulário mais próximo do Tailwind.
* [Dribbble, SaaS Analytics Dark Dashboard](https://dribbble.com/shots/23673869-SaaS-Analytics-Dark-Dashboard) (busca). Observar a faixa de KPIs acima da tabela de transações em tema escuro (modelos 05 e 07).
* [Dribbble, Dashboard Card Stats Metrics em TailwindCSS](https://dribbble.com/shots/15261147-Dashboard-Card-Stats-Metrics-TailwindCSS-Component). Observar a proporção entre rótulo e número, o respiro interno e o trilho em componente utilitário (modelos 01 e 03).
* [Dribbble, Bar Chart Dashboard Card em tema escuro](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme). Observar o contraste do traço do microgrático sobre fundo escuro (modelo 02).
* [Dribbble, tag kpi-cards](https://dribbble.com/tags/kpi-cards) e [tag kpi-dashboard](https://dribbble.com/tags/kpi-dashboard). Observar quantas peças usam fundo tingido atrás do delta ou estado só por cor, práticas que o contrato proíbe (modelo 01).
* [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline) (busca). Observar que as peças usam sparkline decorativa e nenhuma traz faixa de distribuição (modelo 02).
* [Dribbble, UI Progress Indicator Percentage Ring Chart](https://dribbble.com/shots/4069776-UI-Progress-Indicator-Percentage-Ring-Chart) (não abriu). Observar o anel com percentual central (modelo 03).
* [Behance, Advanced SaaS Analytics Dashboards KPI](https://www.behance.net/gallery/129162191/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-P1) (aberto). Observar os KPIs desenhados dentro de um sistema de design próprio.
* [Behance, Analytics Metric Cards UI](https://www.behance.net/gallery/255429155/Analytics-Metric-Cards-UI) (aberto, só imagens). Observar se algum cartão combina duas medidas com a relação escrita e se a comparação tem peso menor (modelos 02 e 06).
* [Behance, Modern KPI Dashboard Cards UI Kit 2025](https://www.behance.net/gallery/227305143/Modern-KPI-Dashboard-Cards-UI-Kit-2025) (aberto). Observar se algum cartão reserva lugar para carimbo de atualização (modelo 01).
* [Behance, Sales Dashboard Design](https://www.behance.net/gallery/205112599/Sales-Dashboard-Design?locale=en_US) (busca). Observar a escala tipográfica do número de abertura (modelo 01).
* [Behance, Dark-Themed Business Management Dashboard UI](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI) (aberto). Observar quanto do indicador de status marca exceção e quanto marca o normal (modelos 01 e 08).
* [Figma Community, KPI Charts](https://www.figma.com/community/file/1130917765288346079/kpi-charts) (busca). Observar comparações, marcadores e faixas dentro de um cartão só (modelos 01, 03 e 04).
* [Figma Community, KPI Dashboard with micro interactions](https://www.figma.com/community/file/1577537133533397367/kpi-dashboard-with-micro-interactions) (busca). Observar estados de passagem do cursor e transição de valor (drill do modelo 01).
* [Figma Community, Mobile Dashboard, charts e KPI widgets](https://www.figma.com/community/file/1528308765361625218/mobile-dashboard-charts-kpi-widgets). Observar estados vazios como componente e número grande em largura de celular (modelo 01).
* [Figma Community, Dashboard UI Kits Series](https://www.figma.com/community/file/1347448012996114787/dashboard-ui-kits-series). Observar alturas e raios de trilho em kits de painel (modelo 03).
* [Figma Community, Dashboard Cards](https://www.figma.com/community/file/969677870366908785/dashboard-cards). Observar barras de composição dentro de cartões estreitos (modelo 05).
* [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit) (busca). Observar linear, circular e em etapas lado a lado, para decidir quando o anel deveria ser barra (modelo 03).
* [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics) (aberto). Observar as variantes com e sem comparação, o microgrático em bloco de tamanho fixo e a versão móvel de 343 px (modelos 01, 05 e 07).

**Lacuna dos portais:** nenhuma peça encontrada mostra procedência do número (MEDIDO, DERIVADO, PREMISSA, LACUNA), cobertura de dado, carimbo de frescor ou mediana com percentil no mesmo cartão. Esses elementos saem das regras do Farol e da literatura de método, não de referência visual.
