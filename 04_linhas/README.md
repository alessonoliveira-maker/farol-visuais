# Linhas

A linha codifica mudança ao longo de um intervalo contínuo ou ordenado: a posição vertical é o valor e a inclinação é o próprio dado. É a forma padrão de mostrar uma série temporal no Farol e responde "subiu ou desceu, quanto, desde quando, em que ritmo e em relação a quê", seja a meta, o período anterior, a faixa esperada ou outras séries. Quando o que importa é o volume de cada período, a família certa é colunas (03); quando é composição de um todo, áreas (05).

Estudo de origem: [`_estudo/familias/04_linhas.md`](../_estudo/familias/04_linhas.md). Catálogo consolidado: [`_estudo/catalogo/04_linhas.json`](../_estudo/catalogo/04_linhas.json).

## O que a família responde

* **Comercial:** a receita reconhecida acumulada está acima ou abaixo da trajetória da meta? O forecast do trimestre converge para o fechamento? Qual executivo subiu ou caiu no ranking de fechamentos?
* **Pré-vendas:** as entradas desta semana fogem do padrão das últimas oito? O percentual dentro do SLA furou o limiar? A demanda passou do teto de capacidade depois da troca de escala?
* **Marketing:** o CPL qualificado acompanha o CPL bruto ou descolou? Qual plataforma cresceu mais desde o início do trimestre? A integração que caiu deixou buraco de coleta ou a origem zerou de verdade?
* **Diretoria:** a participação de mercado mudou de patamar depois da revisão de perímetro? O realizado cabe na faixa de cenários desenhada no início do ano?

## Regras que valem para a família inteira

1. **Calendário completo antes do render.** Eixo categórico só mostra as categorias presentes e liga os vizinhos de um mês faltante. Gerar a série inteira em TypeScript com `null` onde não houve coleta, ou usar `XAxis type="number" scale="time"` com timestamps.
2. **Nulo não é zero.** `null` é "não medido" e `0` é "medido e zero". `connectNulls` fica desligado por padrão; a lacuna é declarada no visual, nunca escondida.
3. **Curva honesta.** Em séries mensais curtas, `type="linear"`; `monotone` sugere valores entre pontos que não existem.
4. **O zero é opcional, a origem do eixo não.** A linha pode começar acima de zero (dados em cerca de 70 a 80% da altura), mas o eixo mostra onde começa. Acumulado e contagem partem do zero.
5. **Até 4 ou 5 séries num eixo.** Acima disso, destaque uma com o resto neutro (modelo 02) ou separe em pequenos múltiplos (modelo 09).
6. **Rótulo direto antes de legenda.** Nome e valor no fim da linha, com anticolisão calculada pela escala do eixo y quando os finais ficam próximos.
7. **Referência nunca só por cor.** Meta, teto e alerta levam traço, símbolo e texto; meta que muda no tempo é série em degrau (modelo 03), não `ReferenceLine`.
8. **Projeção declara o método.** Trecho projetado é tracejado, costurado ao real pelo ponto de junção repetido, e a procedência (MEDIDO, DERIVADO, PREMISSA, LACUNA) fica na etiqueta do cartão.
9. **Um formatador para eixo, dica e rótulo.** Tudo por `@/lib/format`; cor só por token (`var(--chart-1)` no destaque, `var(--line-strong)` no neutro e na referência).
10. **Animação só na entrada.** `isAnimationActive={useAnimateOnce()}`, `dot={false}` em séries longas e animação desligada acima de mil pontos.

## Modelos

| # | Modelo | Abordagem | Versões | Pergunta que responde |
|---|---|---|---|---|
| 01 | [Linha simples](./01_linha-simples/) | Recharts nativo | 4 | Uma métrica subiu ou desceu, e quanto? Inclui rótulo final, meta, evento datado, média móvel com brush e lacuna de coleta declarada. |
| 02 | [Múltiplas séries](./02_multiplas-series/) | Recharts nativo | 4 | Como duas a cinco trajetórias na mesma unidade se comparam? Inclui destaque com resto neutro e índice base 100. |
| 03 | [Linha em degrau](./03_step-degrau/) | Recharts nativo | 3 | O que muda só em instantes discretos, como teto, preço ou equipe? Inclui capacidade contra demanda e área em degrau. |
| 04 | [Linha com banda de intervalo](./04_linha-com-banda-de-intervalo/) | Recharts nativo | 4 | Qual o valor central e quanto ele varia? Inclui faixa histórica, perímetros e amostra pequena. |
| 05 | [Real contra previsto tracejado](./05_real-contra-previsto/) | Recharts com dado moldado | 4 | O que é medido e o que é projeção? Inclui data de corte, três cenários e cruzamento com o teto. |
| 06 | [Acumulado contra meta (burn-up)](./06_acumulado-contra-meta/) | Recharts nativo | 4 | O acumulado está na trajetória da meta e que ritmo a fecha? Inclui meta sazonal, meta revisada e estorno. |
| 07 | [Sobreposição de períodos](./07_sobreposicao-de-periodos/) | Recharts nativo | 4 | Este período segue a sazonalidade dos anteriores? Inclui dia útil, faixa de três anos e meses de tamanhos diferentes. |
| 08 | [Bump chart de ranking](./08_bump-chart/) | Recharts com `dot` e rótulo próprios | 4 | Quem subiu e quem caiu no ranking? Inclui top N com entradas e saídas, empates e item sem operar. |
| 09 | [Pequenos múltiplos de linha](./09_pequenos-multiplos-de-linha/) | HTML com Tailwind e Recharts por painel | 4 | Qual a forma de cada uma de muitas séries da mesma métrica? Inclui mediana do grupo, 12 painéis e painel sem dado. |

São 9 modelos e 35 versões. As pastas dos modelos são criadas quando as versões forem produzidas; até lá os links apontam para o lugar reservado.

Variações absorvidas de outras famílias: a área em degrau (05, estudo 3.12) virou versão do modelo 03; o burn-up acumulado contra meta (13, estudo seção 20) é o modelo 06; o bump chart de ranking (17, estudo seção 19) e o ranking micro (24, estudo seção 24.39) são o modelo 08; faixas e marcos sobre série (20, estudo 3.13) e anotação narrativa sobre gráfico (21, estudo 3.13) viraram a versão com meta e evento do modelo 01.

## Guia rápido: qual modelo escolher

| Se a pergunta é... | Use | E não |
|---|---|---|
| Uma métrica subiu ou desceu no tempo | 01 Linha simples, versão com rótulo final | Colunas, a menos que o volume de cada período seja o assunto |
| A métrica furou a meta ou o limiar, e depois de qual fato | 01, versão com meta e evento | Linha pintada de vermelho sem traço nem texto |
| Série diária ruidosa em que só a tendência importa | 01, versão com média móvel e brush | Curva `monotone` no bruto, que finge suavidade |
| Coleta caiu por alguns dias ou a fonte começou tarde | 01, versão com integração interrompida | `connectNulls` ligado, que inventa tendência, ou nulo tratado como zero |
| Duas a quatro séries na mesma unidade | 02 Múltiplas séries, com rótulo no fim | Eixo duplo |
| Uma série importa e as outras são contexto | 02, versão com destaque e resto neutro | 12 cores categóricas disputando atenção |
| Ritmo de grandezas diferentes (investimento, leads, agendas) | 02, versão índice base 100 | Eixo duplo com escalas escolhidas a olho |
| Valor que só muda em datas: teto, preço, equipe, meta revisada | 03 Linha em degrau | 01 com `monotone`, que inventa valores intermediários |
| Demanda contínua contra capacidade em degrau | 03, versão capacidade contra demanda | Área empilhada somando teto com demanda |
| Valor central com dispersão ou incerteza | 04 Banda de intervalo, com a nota do que é a faixa | Banda sem legenda, que o leitor lê como meta |
| Estimativa que depende do perímetro | 04, versão entre dois perímetros | Número único sem faixa |
| Realizado que continua em projeção | 05 Real contra previsto | Projeção desenhada em sólido |
| Cenários conservador, base e otimista | 05, versão três cenários | Leque de área, que é 05_areas quando há probabilidade |
| Quando a trajetória cruza a meta ou o teto | 05, versão cruzamento com o teto | Leitura a olho do cruzamento |
| Meta anual aditiva e o ritmo que falta | 06 Acumulado contra meta | 01 com a meta anual como linha fixa sobre o mensal |
| Meta revisada no meio do ano ou estorno | 06, versão meta revisada e cancelamento | Redesenhar o passado com a meta nova |
| Sazonalidade: este ano contra o anterior | 07 Sobreposição de períodos, por semana ISO | Data civil quando o negócio segue dia útil |
| Mês corrente contra meses passados no mesmo dia útil | 07, versão por dia útil | Comparar o total parcial com o mês fechado |
| Quem subiu e quem caiu num ranking | 08 Bump chart, com o valor na dica | 02 com o valor, quando a posição é o assunto |
| Top N com entradas, saídas e empates | 08, versões top 10 e empates | Último lugar para quem não operou |
| Muitas categorias da mesma métrica, todas importantes | 09 Pequenos múltiplos, com escala comum | 02 com mais de 5 linhas |
| Forma de séries com volumes muito diferentes | 09, versão escala independente declarada | Escala independente sem aviso |

## Quando a família serve

* A medida é contínua ou ordenada no tempo e a direção, o ritmo ou a mudança de patamar é o assunto.
* Há 4 pontos ou mais por série; de 4 a 730 pontos numa linha, com média móvel e brush a partir de cerca de 60.
* O leitor aceita ler posição: o eixo pode não conter o zero, desde que mostre onde começa.
* Referências (meta, teto, período anterior, faixa esperada) ajudam a ler a série e cabem no mesmo eixo.

## Quando procurar outra família

* **Menos de 4 pontos**, ou um número com uma comparação: cards e KPIs, família **01**.
* **Volume de cada período** como assunto, com o zero obrigatório: colunas, família **03**.
* **Composição de partes de um todo** no tempo, leque de projeção com probabilidade ou diferença sombreada contra a meta: áreas, família **05**.
* **Grandeza e taxa do mesmo período**, ou métricas diferentes em painéis alinhados: combinados, família **08**, sem eixo duplo.
* **Duas métricas ao longo do tempo** lidas como trajetória num plano: dispersão conectada, família **09**.
* **Progresso num instante só**, sem trajetória: progresso e meta, família **13**.
* **Padrão diário por dia da semana ou do ano**: calendário, família **15**.
* **Só dois momentos**, início e fim por categoria: slope e arrow, família **17**.
* **Eventos e fases como assunto**, com tempo e duração e sem métrica: cronograma, família **20**.
* **Linha minúscula em cartão ou célula**, sem eixo: sparkline, família **24**.

## Referências cruzadas

Formatos que o estudo desta família levantou e que moram em outro lugar do catálogo:

| Formato | Destino | Por quê |
|---|---|---|
| Slope chart | [17/06 Slope chart](../17_comparacao-de-pontos/06_slope-chart/) | Só dois momentos: a linha vira a reta entre os extremos e o meio não existe. |
| Arrow plot | [17/03 Dumbbell e arrow plot](../17_comparacao-de-pontos/03_dumbbell/) | Início e fim por categoria, com a direção da mudança na seta. |
| Connected scatter | [09/05 Dispersão conectada](../09_dispersao-e-bolhas/05_dispersao-conectada/) | Duas métricas no tempo; o tempo corre ao longo do traço e não num eixo. |
| Leque de projeção | [05/06 Leque de projeção](../05_areas/06_leque-de-projecao/) | Bandas aninhadas por probabilidade são forma de área; o tracejado simples fica no modelo 05. |
| Área de diferença entre real e meta | [05/07 Área de diferença contra meta](../05_areas/07_area-de-diferenca/) | Quando o gap sombreado é o assunto; o gap marcado só no dia de hoje fica no modelo 06. |
| Painéis de métricas distintas | [08/03 Painéis alinhados](../08_combinados-e-eixo-duplo/03_paineis-alinhados/) | Métricas diferentes empilhadas com o mesmo eixo x substituem o eixo duplo; a mesma métrica por categoria fica no modelo 09. |
| Sparkline | [24/01 Sparkline de linha e área](../24_microvisuais-sparklines/01_sparkline-de-linha/) | Linha sem eixo dentro de cartão ou célula de tabela. |
| Faixa (range band) | [05/05 Faixa](../05_areas/05_faixa-range-band/) | Quando a faixa é o assunto e a linha central é secundária; com linha central saliente, fica no modelo 04. |
| Area bump | [05/10 Area bump](../05_areas/10_area-bump/) | Ranking com espessura proporcional ao valor; posição pura fica no modelo 08. |
| Linha com colunas e Pareto | [08 Combinados e eixo duplo](../08_combinados-e-eixo-duplo/) | Quantidade e taxa do mesmo período lidas juntas. |
| Calendar heatmap | [15 Mapa de calor e calendário](../15_mapa-de-calor-e-calendario/) | Padrão diário lido pela cor da célula, não pela inclinação. |
| Comet chart e trail | [17 Comparação de pontos](../17_comparacao-de-pontos/) | Mudança entre dois estados desenhada como traço de largura variável. |
| Linha do tempo vertical | [20 Cronograma e linha do tempo](../20_cronograma-e-linha-do-tempo/) | Eventos no tempo sem métrica quantitativa. |

Candlestick e OHLC ficam fora do escopo do Farol; se aparecerem, moram em distribuição, família **16**.

## Referências

Todos os links vêm do [estudo da família](../_estudo/familias/04_linhas.md), dos estudos das famílias de onde vieram as variações absorvidas ([05](../_estudo/familias/05_areas.md), [13](../_estudo/familias/13_progresso-meta-e-gauge.md), [17](../_estudo/familias/17_comparacao-de-pontos.md), [20](../_estudo/familias/20_cronograma-e-linha-do-tempo.md), [21](../_estudo/familias/21_texto-e-nuvem-de-palavras.md) e [24](../_estudo/familias/24_microvisuais-sparklines.md)) e da [varredura de portais de design](../_estudo/00_portais-de-design.md). Bibliotecas fora da stack do Farol (Vega-Lite, nivo, AG Charts, Highcharts, Tremor) aparecem como referência de método e de comportamento, nunca como dependência. "Não abriu" quer dizer que o endereço veio de busca e a página não carregou durante a pesquisa.

### 01 Linha simples

- [Data Viz Catalogue, Line Graph](https://datavizcatalogue.com/methods/line_graph.html): observar o limite de 3 a 4 linhas e a sugestão de pequenos múltiplos.
- [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph): observar o zero opcional, os dados em 70 a 80% da altura e as linhas de referência para metas e faixas.
- [Recharts, Examples](https://recharts.github.io/en-US/examples/): observar as variações nativas de `LineChart`, e Line Chart With Reference Lines, Banded Chart e Synchronized Line Chart como base de faixas e marcos.
- [Vega-Lite, Carbon Dioxide in the Atmosphere](https://vega.github.io/vega-lite/examples/layer_line_co2_concentration.html): observar rótulos de início e fim por agregação mínima e máxima.
- [AG Charts, Line Chart With Labels](https://www.ag-grid.com/charts/gallery/line-with-labels/): observar o formatador que rotula só o primeiro e o último ponto.
- [Highcharts, Line chart with data labels](https://www.highcharts.com/demo/highcharts/line-labels): observar o custo visual de rotular todos os pontos.
- [Recharts, Customized Dot Line Chart](https://recharts.github.io/en-US/examples/CustomizedDotLineChart/) e [Recharts, Customized Label Line Chart](https://recharts.github.io/en-US/examples/CustomizedLabelLineChart/): observar `dot` condicional por valor e rótulo SVG na cor do traço.
- [Recharts, Line Chart With Reference Lines](https://recharts.github.io/en-US/examples/LineChartWithReferenceLines/): observar `ReferenceLine` com `label` posicionado.
- [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/): observar `ifOverflow="extendDomain"` e `segment`.
- [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/): observar a razão do limiar calculada pela escala do eixo y, reaproveitável no traço bicolor.
- [Recharts, ReferenceArea API](https://recharts.github.io/en-US/api/ReferenceArea/): observar `x1`, `x2`, `ifOverflow`, `label` e `shape` para períodos e eventos.
- [Recharts API](https://recharts.github.io/en-US/api/): observar `ReferenceArea`, `ReferenceLine`, `ReferenceDot`, `Label`, `ZIndexLayer` e os hooks de escala que ancoram anotação.
- [Vega-Lite, Line Chart with Highlighted Rectangles](https://vega.github.io/vega-lite/examples/layer_falkensee.html): observar faixas de período rotuladas atrás da linha.
- [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart): observar a ferramenta de highlight range e as anotações de texto.
- [Datawrapper Academy, How to create text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar âncoras, deslocamento e a troca por chaves numeradas no celular.
- [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): observar a anotação como forma de chamar o leitor para o gráfico.
- [Storytelling with Data, What is a Gantt chart](https://www.storytellingwithdata.com/blog/what-is-a-gantt-chart): observar o Gantt combinado com linha para relacionar mudanças com a métrica.
- [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/): observar fases anotadas como faixas e a linha de break even.
- [Vega-Lite, média móvel sobre valores brutos](https://vega.github.io/vega-lite/examples/layer_line_rolling_mean_point_raw.html): observar o quadro `[-15, 15]` e os pontos brutos translúcidos.
- [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/): observar `Scatter` e `Line` no mesmo `ComposedChart`.
- [Recharts, Line Chart Connect Nulls](https://recharts.github.io/en-US/examples/LineChartConnectNulls/): observar lacuna contra ligação sobre o ponto ausente.
- [AG Charts, Chart Gallery](https://www.ag-grid.com/charts/gallery/): observar "Line Chart With Gaps" entre as variações de linha.
- [Recharts, Highlight And Zoom Line Chart](https://recharts.github.io/en-US/examples/HighlightAndZoomLineChart/): observar `ReferenceArea` durante o arraste e `allowDataOverflow`.
- [Recharts, YAxis API](https://recharts.github.io/en-US/api/YAxis/): observar `allowDataOverflow`, `domain` por função e `niceTicks` para recalcular o domínio na janela visível.

### 02 Múltiplas séries

- [From Data to Viz, Line chart](https://www.data-to-viz.com/graph/line.html): observar os alertas de espaguete, de eixo e de proporção de tela, e pontos quando as observações são esparsas.
- [From Data to Viz, Spaghetti plot](https://www.data-to-viz.com/caveat/spaghetti.html): observar as saídas propostas: destacar um grupo, pequenos múltiplos, filtro interativo.
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): observar pequenos múltiplos quando as linhas se sobrepõem.
- [Tremor, Line Chart](https://tremor.so/docs/visualizations/line-chart): observar `categories`, legenda com rolagem, dica customizada e o exemplo de `connectNulls`.
- [Vega-Lite, Multi Series Line Chart with Halo Stroke](https://vega.github.io/vega-lite/examples/line_color_halo.html): observar a camada de fundo com traço mais largo que separa cruzamentos.
- [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/): observar a sobreposição como instrumento de comparação.
- [Recharts, Compare Two Lines](https://recharts.github.io/en-US/examples/CompareTwoLines/): observar o hover que controla a ênfase e a série de comparação tracejada.
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis): observar quando o gráfico indexado funciona e quando falha.
- [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf): observar a conversão para escala comum por diferença percentual.
- [Free Range Statistics, Dual axes time series plots may be ok sometimes after all](https://freerangestats.info/blog/2016/08/18/dualaxes): observar escalas que reproduzem visualmente o índice.
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/): observar a série fixada num ponto de referência.

### 03 Linha em degrau

- [Nightingale, Step Aside Line Graphs And Bar Charts! This Is a Job For Me](https://nightingaledvs.com/step-charts/): observar juros, temporadas e níveis sem valor intermediário.
- [Vega-Lite, Step Chart](https://vega.github.io/vega-lite/examples/line_step.html): observar `interpolate: step-after`.
- [Recharts, Line API](https://recharts.github.io/en-US/api/Line/): observar os tipos `step`, `stepBefore` e `stepAfter`, e `strokeDasharray`.
- [Recharts, Area API](https://recharts.github.io/en-US/api/Area/): observar `type="stepAfter"` e `stackId` para a área em degrau empilhada.
- [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization): observar o step line chart entre as formas temporais, e bump chart e bump area chart como formas distintas.

### 04 Linha com banda de intervalo

- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/): observar a `Area` com `dataKey` em array e a `Line` por cima.
- [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html): observar a separação entre marca de banda e marca de média.
- [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line): observar a opacidade da faixa e a linha por cima.
- [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/): observar a faixa de mínimo a máximo com marcos de eventos.

### 05 Real contra previsto tracejado

- [Vega-Lite, Line chart with a dashed part](https://vega.github.io/vega-lite/examples/line_dashed_part.html): observar o ponto repetido que costura o sólido e o tracejado.
- [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph): observar previsão e anotação como contexto.
- [Recharts, Line API](https://recharts.github.io/en-US/api/Line/): observar `strokeDasharray` no trecho projetado.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar o fan chart de projeção como evolução do tracejado.

### 06 Acumulado contra meta (burn-up)

- [Wikipedia, Burndown chart](https://en.wikipedia.org/wiki/Burndown_chart): observar a diferença entre burn-down e burn-up e a linha de escopo.
- [Atlassian, Agile burndown chart tutorial](https://www.atlassian.com/agile/tutorials/burndown-charts) (não abriu): observar a linha ideal como diagonal e a linha real dia a dia.
- [Globant, Why you should use a Burn-Up chart instead of a Burn-Down chart](https://stayrelevant.globant.com/en/technology/agile-organizations/why-you-should-use-burn-up-chart-in-agile-instead/) (não abriu): observar o argumento central, o burn-up mostra mudança de escopo e o burndown esconde.
- [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): observar a seção de projeção, que explica por que "quanto falta" não responde "vou chegar".
- [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/): observar `segment` para desenhar o gap de hoje e `ifOverflow="extendDomain"` na meta anual.
- [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph): observar metas como linhas de referência.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard): observar a convivência entre série temporal e indicador de meta na mesma tela.

### 07 Sobreposição de períodos

- [Recharts, Compare Two Lines](https://recharts.github.io/en-US/examples/CompareTwoLines/): observar a comparação tracejada e a diferença exibida no hover.
- [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/): observar a sobreposição para revelar regularidade.
- [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line): observar a faixa histórica com a linha do período atual.

### 08 Bump chart de ranking

- [Data Viz Project, Bump Chart](https://datavizproject.com/data-type/bump-chart-2/) (não abriu): observar a descrição de mudança de posição, vencedores e perdedores.
- [nivo, Bump](https://nivo.rocks/bump/): referência de anatomia apenas, porque nivo está fora da stack; observar largura e opacidade de linha ativa e inativa, rótulos nas pontas e a separação entre Bump e AreaBump.
- [Vega-Lite, Line Charts Showing Ranks Over Time](https://vega.github.io/vega-lite/examples/window_rank.html): observar o rank recalculado a cada período com desempate por chave secundária.
- [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization): observar bump chart e bump area chart como formas distintas.
- [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar a categoria Ranking inteira e o alerta implícito de que posição não é valor.
- [Wikipedia, slope chart](https://en.wikipedia.org/wiki/Slope_chart): observar o bump chart como forma vizinha e a leitura que piora quando muitas retas se cruzam.
- [RAWGraphs, how to make a bump chart](https://rawgraphs.github.io/learning/how-to-make-a-bump-chart/) (abriu parcialmente): observar que as posições ganham o mesmo espaçamento independentemente do valor absoluto, o aviso que o subtítulo precisa carregar.
- [Charlie Park, Edward Tufte's slopegraphs](https://charliepark.org/slopegraphs/): observar a distinção entre mostrar rank ordinal e mostrar escala real.
- [microcharts, BumpStrip](https://microcharts.dev/docs/charts/bump-strip) (não abriu): observar o ranking como faixa de célula, origem do ranking micro absorvido.
- [Data Viz Catalogue, chart snapshot bump charts](https://datavizcatalogue.com/blog/chart-snapshot-bump-charts/) (não abriu): observar o bump chart como variante da linha centrada em posição.
- [FlowingData, how to make a bump chart](https://flowingdata.com/2019/11/18/r-ggplot-bump-chart/) (não abriu): observar a posição calculada antes do desenho e a escala vertical ajustada para posições.
- [Datawrapper Academy, how to create a bump chart](https://academy.datawrapper.de/article/347-how-to-create-a-bump-chart) (não abriu): observar o formato longo de dado com data, posição e categoria.

### 09 Pequenos múltiplos de linha

- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/): observar o `syncId` compartilhado entre três gráficos e o `Brush` que move todos.
- [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis): observar os gráficos separados verticalmente com o mesmo eixo x.
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/): observar os panel charts.
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): observar múltiplas linhas em pequenos múltiplos.

### Transversais da família

- [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/): observar os hooks `usePlotArea`, `useChartWidth`, `useChartHeight` e `useOffset`, que substituem o antigo `Customized` e sustentam anticolisão, gradiente de limiar e anotação calculada.
- [shadcn/ui, Line Charts](https://ui.shadcn.com/charts/line): observar as cores de série por variável CSS sobre Recharts 3, o mesmo padrão dos tokens do Farol.
- [shadcn/ui, Chart](https://ui.shadcn.com/docs/components/chart): observar a prop `accessibilityLayer` citada na documentação.
- [Vega-Lite, Example Gallery](https://vega.github.io/vega-lite/examples/): observar a seção de linhas inteira como catálogo de comportamento, incluindo comet chart e trail, que moram em 17.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a linha como forma padrão da categoria de mudança no tempo.

### Portais de design

A qualidade visual dos shots marcados com "não abriu" não foi conferida: olhe a página antes de adotar.

- [Dribbble, Dashboard Comparison Chart](https://dribbble.com/shots/2449899-Dashboard-Comparison-Chart) (não abriu): observar a comparação de segmentos escolhidos pelo usuário; modelo para comparar períodos (07) ou executivos (02).
- [Dribbble, Dark UI Chart Slider](https://dribbble.com/shots/1471011-Dark-UI-Chart-Slider) (não abriu): observar a linha em tema escuro com controle deslizante de período, parente do brush do modelo 01.
- [Dribbble, Animated Bump Chart, 49 Days of Charts](https://dribbble.com/shots/18335691-Animated-Bump-Chart-49-Days-of-Charts) (busca, não aberto): observar o ranking ao longo do tempo para posição de executivos mês a mês (08).
- [Dribbble, Charts UI design Figma templates](https://dribbble.com/shots/20359409-Charts-UI-design-Figma-templates-Bars-histograms-line-graphs) (não abriu): observar os modelos de linha dentro de uma biblioteca com mais de 25 categorias.
- [Mobbin, analytics dashboard](https://mobbin.com/explore/web/screens/analytics-dashboard): observar que gráficos de tendência vêm sempre com filtro e ordenação e organizados em cards modulares.
- [Behance, LINE CHART DASHBOARD UI DESIGN](https://www.behance.net/gallery/168636537/LINE-CHART-DASHBOARD-UI-DESIGN) (abriu, imagens não inspecionadas): observar o tratamento de cartão e de dica.
- [Behance, Sales Management Dashboard](https://www.behance.net/gallery/192233069/Sales-Management-Dashboard) (abriu, imagens não inspecionadas): observar as telas marcadas como line chart num painel de vendas.
- [Dribbble, tag charts](https://dribbble.com/tags/charts) (não abriu): observar rótulo nas duas pontas e cor de destaque contra fundo neutro em rankings.
- [Dribbble, tag ranking](https://dribbble.com/tags/ranking) (não abriu): observar que ranking em portal é quase sempre lista estática, sem trajetória, o que dá ao bump do Farol pouco precedente.

**Lacunas dos portais:** nenhum shot específico de linha com faixa de previsão, de comparação com período anterior tracejado, de índice base 100, de média móvel sobre o bruto, de burn-up comercial ou de seleção de janela. Dribbble (busca e tag vazias pela ferramenta), Figma Community (403), exemplos do Apache ECharts (só por script) e Observable Plot (429) não entregaram página na pesquisa do estudo, por isso não aparecem aqui.
