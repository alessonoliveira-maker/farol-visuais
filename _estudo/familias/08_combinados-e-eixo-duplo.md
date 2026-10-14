# Família 08 · Combinados e eixo duplo

Catálogo VISUAIS do Farol · estudo granular · 2026-09-14

Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão. Todos os casos de uso abaixo são fictícios e não citam marca real.

Legenda de abordagem usada em todo o arquivo:

- **recharts-nativo**: resolve com componentes e props do Recharts, sem desenho próprio.
- **recharts-custom**: Recharts com `shape`, `label`, `content` ou componente filho que lê os hooks do gráfico.
- **svg-puro**: componente React que desenha SVG com geometria calculada em TypeScript.
- **html-tailwind**: composição em HTML com Tailwind (painéis alinhados, legendas, alternância de modo).

---

## 1. O que a família responde

A família junta duas marcas no mesmo quadro para responder a relação entre duas medidas sobre o mesmo tempo ou a mesma categoria: grandeza e taxa (volume e conversão), realizado e meta, parte e acumulado (pareto), volume e capacidade. Ela existe porque o público quer ver as duas coisas juntas; o risco é que a combinação crie comparações que os dados não sustentam.

Perguntas típicas por público do Farol:

- **Comercial:** quantos fechamentos por mês e qual o ticket médio? Quais motivos de perda somam 80% das perdas? Cada executivo bateu a meta do trimestre? Quanto do mês já foi realizado e quanto ainda é previsão?
- **Pré-vendas:** quantas entradas por semana e qual a taxa de agendamento? Em que dias a fila passou do teto de capacidade e por quanto?
- **Marketing:** quanto foi investido por mês e qual foi o CPL qualificado? Quantos leads por origem e qual a cobertura de origem preenchida?
- **Diretoria:** a demanda cabe na capacidade? O realizado, somado ao previsto, chega à meta?

**Regra de decisão antes de escolher eixo duplo** (síntese de Few, Datawrapper, Storytelling with Data, Peltier e Flourish):

1. As duas medidas têm a mesma unidade? Eixo único (modelos 1, 7, 11).
2. Unidades diferentes e o gráfico será lido por público geral, sem mediação? Painéis alinhados (modelo 4) ou índice base 100 (04_linhas, modelo 10).
3. Unidades diferentes, público habituado e relação entre quantidade e taxa? Colunas e linha em eixo duplo (modelo 2), com as regras da seção 5.
4. Duas linhas de unidades diferentes em eixo duplo só com escalas definidas por regra objetiva (modelo 3).
5. O segundo eixo é derivado do primeiro (percentual acumulado do pareto)? Eixo duplo legítimo (modelo 8).

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Coluna com linha (eixo único) | Grandeza com média, meta ou tendência na mesma unidade | Unidades diferentes | Média calculada sobre janela diferente da das colunas |
| 2 | Colunas e linha de taxa em eixo duplo | Quantidade e taxa (leads e percentual qualificado) | Público geral; duas grandezas absolutas | Zeros desalinhados; eixos sem a cor da série |
| 3 | Linha e linha em eixo duplo | Forma de duas séries de unidades diferentes | Comparar nível ou interpretar cruzamentos | Escala escolhida para forçar correlação |
| 4 | Painéis alinhados (alternativa ao eixo duplo) | Duas ou três métricas de unidades diferentes no mesmo tempo | Espaço vertical mínimo | Eixos x desalinhados por larguras de eixo y diferentes |
| 5 | Barras com marcador de meta | Realizado contra meta por categoria ou período | Meta igual para todos (basta linha de referência) | Marcador escondido quando a barra passa a meta |
| 6 | Coluna fantasma (realizado sobre a meta) | Meta vista como volume a preencher | Metas muito maiores que o realizado | Larguras iguais que escondem uma das colunas |
| 7 | Área com linha | Capacidade ou faixa (área) e demanda ou real (linha) | Unidades diferentes | Área opaca escondendo grade e linha |
| 8 | Pareto (colunas com linha acumulada) | Priorizar causas que concentram o efeito | Menos de 4 categorias ou categorias sem ordem de importância | Não ordenar; "outros" no meio; eixo direito fora de 0 a 100% |
| 9 | Colunas empilhadas ou agrupadas com linha | Composição por período mais uma taxa ou um limiar | Mais de 5 camadas ou mais de uma linha | Linha de total redundante com o topo da pilha |
| 10 | Realizado, previsto e meta | Período em curso com forecast | Previsão sem método | Previsto na mesma cor do realizado; forecast total somado ao realizado |
| 11 | Colunas com limiar e excedente destacado | Quanto passou do teto (ou faltou para o piso) | Limiar variável sem desenho próprio | Pintar a coluna inteira em alerta |
| 12 | Colunas mensais com linha de acumulado | Valor do mês e caminho até a meta anual no mesmo cartão | Público geral sem mediação (preferir painéis) | Anotar o cruzamento entre a linha e as colunas |
| 13 | Real contra orçamento com painel de variação | Desvio por período ou categoria contra plano | Plano que muda sem registro de versão | Cor pelo sinal em vez da polaridade da métrica |
| 14 | Colunas em eixo duplo (antipadrão catalogado) | Nunca como entrega; só como exemplo do que trocar | Sempre | Comparar alturas de colunas de escalas diferentes |

---

## 3. Modelos em detalhe

### 3.1 Coluna com linha (eixo único)

**Descrição.** Colunas para o valor de cada período e uma linha na mesma unidade: média móvel, meta mensal ou o mesmo período do ano anterior.

**Anatomia.** Colunas na cor principal; linha em cor contrastante ou neutra, com pontos; rótulo direto da linha; tooltip com as duas medidas.

**Abordagem na stack.** recharts-nativo: `ComposedChart` com `Bar` e `Line` no mesmo eixo y padrão; `Bar` antes da `Line` nos filhos.

**Ponto delicado.** O `ComposedChart` posiciona a linha no centro da banda de cada categoria, o que é o esperado. Em eixo x numérico as barras perdem a largura automática; para série temporal combinada, manter o eixo categórico com o calendário completo gerado em TypeScript. A média móvel é calculada sobre a mesma janela filtrada que alimenta as colunas, senão a linha e as colunas contam histórias de períodos diferentes.

**Versões sugeridas.**

1. **Básico.** Receita reconhecida mensal em colunas e meta mensal em linha com pontos.
2. **Com destaque.** Fechamentos semanais com média móvel de 4 semanas; a semana corrente em cor de parcial.
3. **Denso do Farol.** Agendas por dia útil com média móvel de 5 dias e o mesmo mês do ano anterior tracejado.
4. **Caso limite.** Meses sem meta cadastrada (linha interrompida) e mês com coluna negativa por estorno.

**Referências.**

- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar "Line + column" em "Change over Time".
- Exemplo oficial: [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/). Observar `Area`, `Bar`, `Line` e `Scatter` no mesmo `ComposedChart`.
- Praticante: [Datawrapper, New: Dual-axis charts in Datawrapper](https://www.datawrapper.de/blog/dual-axis-charts). Observar as combinações suportadas (colunas e linha, áreas e linha, colunas empilhadas e linha).
- Exemplo técnico: [Vega-Lite, Mean overlay over precipitation chart](https://vega.github.io/vega-lite/examples/layer_precipitation_mean.html). Observar a média calculada pela mesma agregação das barras e desenhada como `rule`.
- Galeria: [AG Charts, Bar And Line Combination Chart](https://www.ag-grid.com/charts/gallery/bar-line-combination/). Observar barras e linhas tracejadas no mesmo eixo, sem eixo secundário, e tooltip compartilhado.
- Exemplo oficial: [Recharts, Same Data Composed Chart](https://recharts.github.io/en-US/examples/SameDataComposedChart/). Observar `XAxis scale="band"` e `barSize` com a linha centrada na banda.
- Portal de design: [Behance, Sales Management Dashboard](https://www.behance.net/gallery/192233069/Sales-Management-Dashboard). A página abriu com tags de chart e line chart; imagens não inspecionadas pela ferramenta.

### 3.2 Colunas e linha de taxa em eixo duplo

**Descrição.** Colunas no eixo esquerdo (grandeza absoluta) e linha no eixo direito (taxa). O FT Visual Vocabulary indica a combinação para a relação entre uma quantidade e uma taxa ao longo do tempo.

**Anatomia.** Eixo esquerdo e colunas na mesma cor; eixo direito e linha na outra cor; títulos de eixo com unidade ("leads", "% qualificados"); zeros alinhados; rótulos só nos extremos e no último ponto; tooltip com as duas unidades e o denominador da taxa.

**Abordagem na stack.** recharts-nativo com domínios calculados: `YAxis yAxisId="qtd"` e `YAxis yAxisId="taxa" orientation="right"`, `Bar yAxisId="qtd"`, `Line yAxisId="taxa"`, `tick={{ fill: 'var(--farol-serie-1)' }}` e `label` na cor da série correspondente (padrão do exemplo BiaxialLineChart e do Vega-Lite com títulos coloridos).

**Ponto delicado.** Se um eixo começa em zero, o outro também (Datawrapper); com negativos, os dois domínios precisam da mesma fração abaixo do zero, calculada pela função da seção 5. Fixar `domain`, `allowDataOverflow` e `niceTicks="none"` (prop listada na API do YAxis) para o Recharts não arredondar os limites e desalinhar; validar no protótipo. Usar o mesmo `tickCount` nos dois eixos ou desenhar grade só do eixo principal. Cruzamento entre a linha e o topo das colunas não significa nada e não deve ser anotado. Taxa com denominador zero é nula, não 0%.

**Versões sugeridas.**

1. **Básico.** Leads por mês em colunas e percentual qualificado em linha.
2. **Com destaque.** Investimento mensal em colunas e CPL qualificado em linha, rótulo no mês de pior CPL.
3. **Denso do Farol.** Agendas por semana e taxa de comparecimento em 26 semanas, eixos coloridos e tooltip com denominador.
4. **Caso limite.** Semanas com zero leads (taxa nula e ponto ausente) e taxa acima de 100% por erro de dado sinalizada como anomalia.

**Referências.**

- Galeria: [Highcharts, Dual axes, line and column](https://www.highcharts.com/demo/highcharts/combo-dual-axes). Observar o eixo oposto e a combinação de tipos.
- Praticante: [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide). Observar zeros alinhados, cor por eixo, áreas claras e linhas escuras, eixo mais importante à esquerda.
- Praticante: [Flourish, Dual axis charts: why they spark debate, and how to get them right](https://flourish.studio/blog/dual-axis-charts/). Observar a recomendação de linha com coluna para evitar cruzamentos aleatórios.
- Exemplo técnico: [Vega-Lite, Layered Plot with Dual-Axis](https://vega.github.io/vega-lite/examples/layer_dual_axis.html). Observar `resolve` de escala independente e títulos na cor da série.
- Exemplo oficial: [Recharts, Biaxial Line Chart](https://recharts.github.io/en-US/examples/BiaxialLineChart/). Observar `yAxisId` e `orientation="right"`.
- Praticante: [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf). Observar a conclusão de que eixo duplo nunca deve codificar só barras.
- Biblioteca: [Tremor, Combo Chart](https://tremor.so/docs/visualizations/combo-chart). Observar `barSeries` e `lineSeries` separados, `enableBiaxial` e `yAxisLabel` por série: a API obriga declarar qual série vai em qual eixo.
- Documentação: [Recharts, YAxis API](https://recharts.github.io/en-US/api/YAxis/). Observar `domain` por função, `allowDataOverflow` (recorta em vez de reexpandir) e os valores de `niceTicks`: `none`, `auto`, `adaptive`, `snap125`.

### 3.3 Linha e linha em eixo duplo

**Descrição.** Duas linhas de unidades diferentes, cada uma no seu eixo. Só se sustenta para comparar forma ao longo do tempo.

**Anatomia.** Igual à do modelo 2 com duas linhas; nota que declara a regra de escala; alternância para painéis ou índice.

**Abordagem na stack.** recharts-nativo com domínios calculados: `LineChart`, dois `YAxis`, duas `Line`, como no exemplo BiaxialLineChart.

**Ponto delicado.** A escala é arbitrária e pode forjar correlação ou cruzamentos (From Data to Viz, Datawrapper). A regra precisa ser objetiva e testada: escolher os domínios para que as duas séries apareçam como se estivessem indexadas na mesma data base (proposta do Free Range Statistics), implementada como função pura; nunca deixar o `domain` automático decidir. Few chega a aceitar só linhas em eixo duplo, e ainda assim diz não conhecer caso sem solução melhor. O Free Range Statistics desaconselha quando as unidades são iguais, quando há mais de duas séries ou quando um eixo é taxa de crescimento e o outro é valor bruto.

**Versões sugeridas.**

1. **Básico.** CPL em R$ e volume de leads em 12 meses, com escala por índice declarada no rodapé.
2. **Com alternância.** O mesmo cartão com toggle entre eixo duplo, painéis alinhados (modelo 4) e índice base 100 (04_linhas).
3. **Caso limite.** Uma série varia 10 vezes mais que a outra e a regra de índice achata a menor; o componente avisa e sugere painéis.

**Referências.**

- Praticante: [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf). Observar o raciocínio passo a passo e as alternativas.
- Praticante: [Free Range Statistics, Dual axes time series plots may be ok sometimes after all](https://freerangestats.info/blog/2016/08/18/dualaxes). Observar a regra de escala por índice e as condições de uso.
- Praticante: [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis). Observar escalas arbitrárias e cruzamentos sem significado.
- Catálogo: [From Data to Viz, Dual axis caveat](https://www.data-to-viz.com/caveat/dual_axis.html). Observar a manipulação de escala para sugerir relação.
- Pesquisa: [Why Two Y-Axes (Y2Y): A Case Study for Visual Correlation with Dual Axes](https://uncharted.software/assets/WhyTwoYAxes_Y2Y.pdf). Observar o contraponto: em análise de correlação de séries financeiras de alta frequência, a sobreposição em dois eixos revela padrões locais que índice, dispersão e correlação estatística não mostram; a tarefa é correlação, não inclinação nem distância.
- Portal de design: lacuna nesta rodada.

### 3.4 Painéis alinhados (alternativa ao eixo duplo)

**Descrição.** Dois ou três gráficos empilhados verticalmente com o mesmo eixo x, cada um com o seu eixo y à esquerda. Variação: rotular diretamente a segunda série e remover o segundo eixo.

**Anatomia.** Painéis com alturas proporcionais à importância; eixo x só no último; cursor sincronizado; título de painel com unidade.

**Abordagem na stack.** recharts-nativo com layout html-tailwind: um `ComposedChart` por métrica com o mesmo `syncId`, `YAxis width` fixo e igual em todos, `XAxis hide` nos painéis de cima, contêiner `flex flex-col gap-2`.

**Ponto delicado.** `YAxis width="auto"` alinha mal painéis com rótulos de tamanhos diferentes; fixar a largura e as margens esquerda e direita idênticas. O tooltip sincroniza pelo índice, então os painéis recebem o mesmo array de datas. A alternativa ocupa mais espaço (Datawrapper), mas é a leitura mais segura para público geral.

**Versões sugeridas.**

1. **Básico.** Investimento em colunas no painel de cima e CPL qualificado em linha no de baixo.
2. **Com rótulo direto.** CPL com eixo e volume de leads rotulado só nos pontos-chave, sem segundo eixo (primeira alternativa do Storytelling with Data).
3. **Denso do Farol.** Entradas, agendas e fechamentos em três painéis sincronizados com um único brush.

**Referências.**

- Praticante: [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis). Observar as duas saídas: rótulo direto e gráficos separados verticalmente com o mesmo x.
- Praticante: [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/). Observar os panel charts.
- Praticante: [Daydreaming Numbers, 5 alternatives to dual axis charts](https://daydreamingnumbers.com/5-alternatives-to-dual-axis-charts/). Observar o conjunto: lado a lado, rótulo direto, priorizar e rotular, connected scatterplot, índice.
- Praticante: [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis). Observar a vantagem e o custo de espaço dos gráficos lado a lado.
- Exemplo oficial: [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/). Observar `syncId` e `Brush`.

### 3.5 Barras com marcador de meta

**Descrição.** Barra do realizado com um traço perpendicular curto na posição da meta. Herda a medida comparativa do bullet graph de Stephen Few, sem as faixas qualitativas.

**Anatomia.** Barra realizada; marcador de meta menos dominante que a barra (Few: a medida comparativa é uma linha curta perpendicular à orientação do gráfico); segundo marcador opcional, como o mesmo período anterior (a especificação admite uma ou duas medidas comparativas); rótulo "92% da meta".

**Abordagem na stack.** recharts-custom: `Bar dataKey="real"` e `Scatter dataKey="meta"` com `shape` que desenha uma `line` horizontal da largura da banda (colunas) ou vertical (barras em `layout="vertical"`). Alternativa: `Bar shape` que desenha a barra e o traço num só componente, lendo a escala por `useYAxisScale`.

**Ponto delicado.** Com `Scatter`, o traço precisa saber a largura da banda: derivar de `usePlotArea` e do número de categorias, ou fixar em px. A especificação de Few coloca a comparativa atrás da medida principal quando elas se cruzam; em barras largas isso esconde a meta, então testar e documentar a escolha (traço na frente com contorno na cor do fundo é uma saída). O domínio precisa incluir a maior meta. Com faixas qualitativas atrás (ruim, regular, bom), a forma vira bullet graph completo e mora em 13_progresso-meta-e-gauge.

**Versões sugeridas.**

1. **Básico.** Receita do trimestre por executivo fictício (Exec. 01 a Exec. 08) em barras horizontais com marcador de meta.
2. **Com destaque.** Barras que atingem a meta em cor de acento, demais neutras, e ponto do trimestre anterior.
3. **Denso do Farol.** Agendas da semana por SDR (20 pessoas fictícias) com meta individual, ordenadas pelo percentual de atingimento.
4. **Caso limite.** Executivo sem meta cadastrada (sem marcador, com nota) e realizado negativo por estorno.

**Referências.**

- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Observar medida principal com cerca de um terço da espessura do contêiner, comparativa como linha curta perpendicular e de 2 a 5 faixas.
- Catálogo: [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). Observar a origem como substituto de gauges.
- Exemplo técnico: [Vega-Lite, Bullet Chart](https://vega.github.io/vega-lite/examples/facet_bullet.html). Observar as camadas de faixa, medida e marcador de meta.
- Galeria: [AG Charts, Bullet Chart](https://www.ag-grid.com/charts/gallery/simple-bullet/). Observar o marcador de meta e os valores acima e abaixo da meta.
- Galeria: [Highcharts, Bullet graph](https://www.highcharts.com/demo/highcharts/bullet-graph). Observar a forma compacta para KPI.
- Praticante: [Nightingale, Dashboard Redesign: A Look at Chart Choices](https://nightingaledvs.com/dashboard-redesign-a-look-at-chart-choices/). Observar a crítica aos velocímetros como barras distorcidas.

### 3.6 Coluna fantasma (realizado sobre a meta)

**Descrição.** Coluna larga e clara da meta atrás de uma coluna estreita e forte do realizado, centradas na mesma categoria.

**Anatomia.** Meta com contorno ou preenchimento de baixa opacidade; realizado mais estreito (a proporção de cerca de um terço da espessura usada por Few no bullet é um bom ponto de partida); rótulo do percentual atingido.

**Abordagem na stack.** recharts-custom. Opção A: duas `Bar` em eixos x distintos com a mesma chave de categoria (`XAxis xAxisId="meta"` visível e `XAxis xAxisId="real" hide`), `barSize` diferentes, para se sobreporem centradas. Opção B: uma única `Bar dataKey="meta"` com `shape` que desenha os dois retângulos a partir do payload e da escala do eixo y.

**Ponto delicado.** Na opção A os dois eixos x precisam do mesmo `dataKey`, `padding` e lista de categorias; qualquer diferença desalinha as colunas. É uma técnica a validar no protótipo contra o Recharts 3.10 antes de virar componente. O tooltip combina os dois payloads numa linha ("realizado R$ 820 mil de R$ 900 mil, 91%").

**Versões sugeridas.**

1. **Básico.** Fechamentos por mês contra meta mensal.
2. **Com destaque.** Meses acima da meta com o realizado ultrapassando a fantasma e o excedente rotulado.
3. **Caso limite.** Meta zero ou ausente (sem fantasma) e realizado muito acima da meta (fantasma reduzida a uma faixa baixa).

**Referências.**

- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Observar a proporção entre medida principal e contêiner.
- Documentação: [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/). Observar `barSize`, `xAxisId`, `shape` e `background`.
- Documentação: [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/). Observar `shape` recebendo a geometria resolvida.
- Exemplo oficial: [Recharts, Bar Chart With Multi X Axis](https://recharts.github.io/en-US/examples/BarChartWithMultiXAxis/). Observar dois `XAxis` sobre o mesmo `dataKey`, o segundo com `xAxisId`: é a base da opção A.
- Exemplo oficial: [Recharts, Bar Chart with background](https://recharts.github.io/en-US/examples/BarChartHasBackground/). Observar `background` na `Bar`, que pinta a altura inteira da área de plotagem e por isso **não** serve como fantasma de meta (serve como trilho de 0 a 100% em percentuais).
- Exemplo técnico: [Vega-Lite, Layered Bar Chart](https://vega.github.io/vega-lite/examples/bar_layered_transparent.html). Observar `stack: null` e opacidade 0,7: a sobreposição sem empilhar, que é o princípio da coluna fantasma.
- Portal de design: lacuna nesta rodada.

### 3.7 Área com linha

**Descrição.** Área de fundo para um envelope, uma capacidade ou um total, e linha por cima para a medida protagonista, normalmente na mesma unidade. O Datawrapper recomenda áreas e colunas mais claras e menos saturadas e linhas mais escuras e saturadas, justamente para que a linha continue legível sobre a massa.

**Anatomia.** Área em opacidade baixa (0,2 a 0,4), contorno fino ou nenhum; linha de 2 px com pontos só nos extremos; rótulo da área dentro dela ("capacidade"); tooltip com as duas medidas e a diferença; `ReferenceLine` vertical "hoje" quando parte da linha é projeção.

**Abordagem na stack.** recharts-nativo: `ComposedChart` com `Area` antes de `Line` nos filhos, mesmo `YAxis`. Capacidade que muda com contratação usa `Area type="stepAfter"`; a galeria do AG Charts mostra a mesma ideia com faixa e linhas em interpolação de degrau.

**Ponto delicado.** Quando a área é o total e a linha é uma parte, a linha nunca pode passar da área; se passar, é erro de dado ou de conceito, e o componente deve acusar em vez de desenhar calado. O tooltip lista na ordem dos filhos (área primeiro); usar `itemSorter` ou `content` para pôr a protagonista no topo. Capacidade futura costuma ser conhecida (escala planejada) e demanda futura não: a área segue até dezembro e a linha para em `null`. Com unidades diferentes (área de investimento, linha de CPL), valem as regras do modelo 2 e da seção 5; o exemplo do AG Charts com colunas empilhadas e área põe a área no eixo secundário com preenchimento de 0,3 para não esconder as barras.

**Versões sugeridas.**

1. **Básico.** Capacidade semanal de agendas em área de degrau e agendas realizadas em linha, jan a set de 2026.
2. **Com destaque.** Demanda de entradas em linha contra capacidade em área; semanas em que a linha passa a área ganham ponto de alerta e rótulo do excedente (a leitura de quanto passou mora no modelo 11 e em 05_areas, modelo 8).
3. **Denso do Farol.** Diretoria: capacidade total em área e demanda em linha, real até hoje e tracejada depois (04_linhas, modelo 7), 52 semanas, com selo PREMISSA no trecho projetado.
4. **Caso limite.** Semana de recesso com capacidade zero e semana sem coleta de demanda (`null`); as duas ausências desenhadas de formas diferentes, degrau até zero e lacuna.

**Referências.**

- Exemplo oficial: [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/). Observar a ordem `Area`, `Bar`, `Line` dentro do `ComposedChart`.
- Praticante: [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide). Observar "áreas claras, linhas escuras" e a combinação preferida de uma linha sobre área ou coluna.
- Galeria: [AG Charts, Step Interpolation Combination Chart](https://www.ag-grid.com/charts/gallery/step-interpolation-combination/). Observar faixa e linhas em `interpolation: step` e o rodapé que explica a transformação dos dados.
- Galeria: [AG Charts, Stacked Bar And Area Combination Chart](https://www.ag-grid.com/charts/gallery/stacked-bar-area-combination/). Observar a área em degrau com preenchimento 0,3 sobre colunas empilhadas.
- Galeria: [AG Charts, Bar, Line And Area Combination Chart](https://www.ag-grid.com/charts/gallery/grouped-category-combination/). Observar o custo de três eixos y num só quadro: exemplo do que o Farol não deve repetir.
- Portal de design: lacuna nesta rodada.

### 3.8 Pareto (colunas com linha acumulada)

**Descrição.** Colunas em ordem decrescente e uma linha com o percentual acumulado do total no eixo direito, de 0 a 100%. A Wikipedia o descreve como um dos sete instrumentos básicos da qualidade, feito para destacar os fatores mais importantes num conjunto grande; a linha forma uma curva côncava porque os valores decrescem.

**Anatomia.** Colunas decrescentes; "Outros" sempre no fim, mesmo quando é maior que a última categoria; linha acumulada com pontos; eixo direito fixo de 0 a 100%; `ReferenceLine` em 80% no eixo direito; categorias até o corte em cor forte e as demais neutras; título com a leitura ("3 motivos explicam 78% das perdas").

**Abordagem na stack.** recharts-custom leve: `ComposedChart` com `Bar yAxisId="qtd"` (cor por item via `shape`, destacando as categorias até o corte), `Line yAxisId="pct" dataKey="acumPct"`, `YAxis yAxisId="pct" orientation="right" domain={[0, 100]}` e `ReferenceLine yAxisId="pct" y={80}`. Ordenação, "Outros" e acumulado são calculados em TypeScript antes do render. Com rótulos longos, `layout="vertical"` como no exemplo VerticalComposedChart.

**Ponto delicado.** Aqui o eixo duplo é legítimo porque o direito é derivado do esquerdo, mas as escalas ainda precisam de uma regra: uma opção é fixar o eixo esquerdo de 0 ao **total** geral, o que faz o topo da primeira coluna coincidir com o primeiro ponto da linha; a outra é de 0 ao maior valor, que usa melhor a altura e desalinha os dois. Escolher e declarar. Acumular sobre os valores brutos e arredondar só na exibição, senão a linha termina em 99,9% ou 100,1%. Pareto de **quantidade** e pareto de **valor** (perdas contra R$ perdido) costumam ordenar diferente; oferecer alternância em vez de misturar. Valores negativos (estorno) não cabem na forma. Empate recebe desempate estável por nome, senão a ordem pisca a cada refresh.

**Versões sugeridas.**

1. **Básico.** Perdas do trimestre por motivo: 7 motivos fictícios (sem fit, sem retorno, preço, momento, concorrência, prazo, produto) mais "Outros".
2. **Com destaque.** Motivos até 80% em cor de acento, demais neutros, `ReferenceLine` em 80% e anotação do número de motivos que cruza a linha.
3. **Denso do Farol.** Alternância entre quantidade de perdas e valor perdido em R$, com pequenos múltiplos por etapa (pré-vendas e vendas), em barras horizontais para caber os rótulos.
4. **Caso limite.** 40 motivos com cauda longa: top 10 mais "Outros (30 motivos)" no fim; período com só 2 motivos, em que o componente troca para barras simples e avisa.

**Referências.**

- Catálogo: [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart). Observar a definição, o eixo direito como percentual acumulado e o exemplo em que resolver as 3 primeiras causas reduz 78% do problema.
- Galeria: [Highcharts, Pareto chart](https://www.highcharts.com/demo/highcharts/pareto). A página abriu, mas a configuração carrega por script; observar a forma pronta como tipo próprio da biblioteca.
- Documentação: [Highcharts, Pareto chart](https://www.highcharts.com/docs/chart-and-series-types/pareto-chart). Observar a série de pareto derivada de uma série base de colunas (`baseSeries`), em 0 a 100% num segundo eixo oposto.
- Exemplo oficial: [Recharts, Vertical Composed Chart](https://recharts.github.io/en-US/examples/VerticalComposedChart/). Observar `layout="vertical"`, `XAxis type="number"` e `YAxis type="category"` para a versão horizontal.
- Documentação: [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/). Observar `shape` como função para cor por item e `minPointSize` para categorias minúsculas da cauda.
- Portal de design: lacuna nesta rodada.

### 3.9 Colunas empilhadas ou agrupadas com linha

**Descrição.** Composição por período em colunas empilhadas (ou comparação em colunas agrupadas) e uma única linha: taxa no eixo direito ou referência na mesma unidade. O Datawrapper lista "uma linha sobre colunas ou áreas empilhadas" entre as combinações preferidas e desaconselha várias linhas sobre pilhas.

**Anatomia.** 2 a 5 camadas, a mais importante na base; camadas claras e linha escura; total rotulado acima da pilha; legenda na ordem visual da pilha; ícone de legenda que distingue coluna de linha (`legendType="rect"` e `"line"`).

**Abordagem na stack.** recharts-nativo: `ComposedChart`, uma `Bar stackId="a"` por camada, `Line yAxisId="taxa"` ou `ReferenceLine y` para limiar. O exemplo StackedBarChartWithHorizontalLine rotula o total com `LabelList` na última `Bar`, somando as chaves do ponto. Para agrupadas, `Bar` sem `stackId`, com `barGap` e `barCategoryGap` no gráfico.

**Ponto delicado.** Linha de total repete o topo da pilha e só gasta tinta; a linha precisa ser outra medida. O `LabelList` na última `Bar` falha quando essa camada é zero ou nula no período (o rótulo cai no topo errado ou some); calcular `total` no dado e ancorar o rótulo numa série auxiliar, por exemplo `Line dataKey="total" stroke="none" dot={false} label`, a validar no protótipo. Em colunas agrupadas, a linha fica no centro da banda, não sobre uma das colunas do grupo; se a taxa é de uma das séries, o rótulo diz qual. Negativos na pilha pedem `stackOffset="sign"`. A taxa usa como denominador o total da pilha ou uma camada específica; o tooltip escreve o denominador.

**Versões sugeridas.**

1. **Básico.** Leads por mês empilhados por origem (busca paga, rede social, orgânico, indicação) e percentual qualificado em linha no eixo direito.
2. **Com limiar.** Estoque semanal da fila de pré-vendas por etapa com `ReferenceLine` no teto de capacidade e total rotulado acima de cada pilha.
3. **Denso do Farol.** Leads por origem com a camada "sem origem" hachurada no topo e linha de cobertura de dado (percentual com origem preenchida) no eixo direito, 26 semanas.
4. **Caso limite.** Colunas agrupadas de 2025 e 2026 por mês com linha de variação percentual; mês com zero em 2025 (variação indefinida, ponto ausente) e estorno negativo em 2026.

**Referências.**

- Exemplo oficial: [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/). Observar `stackId`, o total calculado no `LabelList` e o limiar rotulado em `ReferenceLine`.
- Praticante: [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide). Observar o limite de uma linha sobre pilha e a cor por eixo.
- Galeria: [AG Charts, Grouped Category Axis Combination Chart](https://www.ag-grid.com/charts/gallery/grouped-bar-line-combination/). Observar barras agrupadas no eixo esquerdo, linhas no direito e eixo de categoria hierárquico.
- Documentação: [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/). Observar `barGap`, `barCategoryGap`, `stackOffset` e `reverseStackOrder`.
- Documentação: [Recharts, Line API](https://recharts.github.io/en-US/api/Line/). Observar `legendType` (`line`, `rect`, `square` e outros) para a legenda distinguir as marcas.
- Portal de design: lacuna nesta rodada.

### 3.10 Realizado, previsto e meta

**Descrição.** O período em curso em colunas: realizado sólido na base, previsto restante empilhado por cima em estilo vazado ou hachurado da mesma matiz, e a meta como marcador. Responde "o que já está feito, o que ainda depende de previsão e se a soma fecha a meta".

**Anatomia.** Realizado sólido; previsto restante com contorno na cor da série e hachura; meta como traço curto (modelo 5) ou degrau; gap rotulado; selo de procedência (MEDIDO no realizado, PREMISSA ou DERIVADO no previsto); meses fechados só com realizado. Faixa de previsão, quando existir, como barra de intervalo estreita ao lado.

**Abordagem na stack.** recharts-custom: `ComposedChart`, `Bar stackId="m" dataKey="realizado"`, `Bar stackId="m" dataKey="previstoRestante" fill="url(#hachura)" stroke="var(--farol-serie-1)"`, meta com o `Scatter shape` do modelo 5; `pattern` SVG em `defs` com ID único por instância. A faixa conservador a otimista usa `Bar` com `dataKey` que devolve `[min, max]`, recurso mostrado no exemplo Ranged Bar Chart, num `xAxisId` próprio para não entrar na pilha.

**Ponto delicado.** Forecast costuma vir como **total do período**, que já inclui o realizado; empilhar os dois conta o realizado duas vezes. Contrato de dado: `previstoRestante = Math.max(forecastTotal - realizado, 0)`. Quando o realizado já passou do forecast, o restante é zero e o cartão avisa que a previsão está desatualizada. Hachura fina some no tema escuro e em telas pequenas; testar espessura e contraste. Meses fechados recebem `previstoRestante: null`, não zero, para o tooltip não escrever "previsto: R$ 0".

**Versões sugeridas.**

1. **Básico.** Receita reconhecida por mês de 2026: meses fechados só com realizado; set/2026 com realizado até 2026-09-14 mais previsto até o fim do mês, contra meta mensal.
2. **Com anotação.** Trimestre em curso por executivo fictício (Exec. 01 a Exec. 10) em barras horizontais: realizado, previsto ponderado pela probabilidade da etapa e marcador de meta, com gap rotulado.
3. **Denso do Farol.** Diretoria: 12 meses de 2026 com realizado, previsto em faixa (conservador a otimista) e alternância para o burn-up acumulado (04_linhas, modelo 11).
4. **Caso limite.** Realizado maior que o forecast total (restante zero e aviso) e mês sem meta cadastrada (sem marcador, com nota).

**Referências.**

- Exemplo oficial: [Recharts, Ranged Bar Chart](https://recharts.github.io/en-US/examples/BarChartRangeExample/). Observar o `dataKey` que devolve `[min, max]` e desenha a barra entre os dois limites.
- Documentação: [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/). Observar `stackId` (mesmo eixo e mesmo id empilham) e `xAxisId` para separar a faixa da pilha.
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Observar a medida comparativa como traço, reaproveitada para a meta.
- Referência de norma: [IBCS, Version 2.0](https://www.ibcs.com/ibcs-version-2-0/). Observar que existe uma norma de notação para relatórios de negócio (alinhada à ISO 24896) que trata cenários como real, plano e previsão; as regras visuais detalhadas não estavam na página aberta e não foram verificadas nesta rodada.
- Portal de design: lacuna nesta rodada.

### 3.11 Colunas com limiar e excedente destacado

**Descrição.** Cada coluna fica na cor normal até o limiar e só a parte acima dele muda para a cor de alerta; o limiar aparece como linha rotulada. O exemplo do Vega-Lite constrói isso com uma segunda camada filtrada aos valores acima do limiar, desenhada de `y` no limiar até `y2` no valor.

**Anatomia.** Base neutra; excedente em cor de alerta com rótulo ("+38"); `ReferenceLine` no limiar com rótulo à direita; título que conta os períodos acima e soma o excesso. Variante de piso: o que falta até o mínimo desenhado como segmento vazado e tracejado.

**Abordagem na stack.** recharts-nativo com dado preparado em TypeScript: `ateLimiar = Math.min(v, limiar)` e `excedente = Math.max(v - limiar, 0)`, duas `Bar stackId="l"` e `ReferenceLine y={limiar} ifOverflow="extendDomain" label`. Limiar variável por período (teto que muda com contratação): a mesma divisão linha a linha e o limiar como `Line type="stepAfter"` ou como o traço do modelo 5. Alternativa recharts-custom: uma `Bar dataKey="valor"` com `shape` que desenha os dois retângulos lendo a escala por `useYAxisScale`. Variante de piso: `falta = Math.max(piso - v, 0)` como terceira `Bar` empilhada com `fill="none"` e `strokeDasharray`.

**Ponto delicado.** O tooltip precisa mostrar o valor original e o excedente, não "ateLimiar" e "excedente" como se fossem duas séries; usar `content`. O rótulo do excedente só aparece onde ele é maior que zero (`LabelList` com `content` que devolve `null`). Com valores negativos, `ateLimiar` fica negativo e a pilha pede `stackOffset="sign"`. Pintar a coluna inteira de vermelho perde a informação de quanto passou, que é a razão de ser do modelo. Quando todos os valores estão abaixo do limiar, `ifOverflow="extendDomain"` mantém a linha visível.

**Versões sugeridas.**

1. **Básico.** Fila diária de leads aguardando primeiro contato contra teto fixo de 120.
2. **Com destaque.** Agendas por semana contra teto em degrau que muda com contratações; título "4 semanas acima do teto, 162 agendas além da capacidade".
3. **Denso do Farol.** 12 filas de pré-vendas na semana em barras horizontais, cada uma com o seu teto e o excedente em alerta, ordenadas pelo excedente.
4. **Caso limite.** Variante de piso (agendas mínimas por SDR com o déficit vazado) e saldo semanal negativo com limiar em zero.

**Referências.**

- Exemplo técnico: [Vega-Lite, Bar Chart Highlighting Values beyond a Threshold](https://vega.github.io/vega-lite/examples/layer_bar_annotations.html). Observar a camada filtrada com `y` no limiar e `y2` no valor, mais `rule` e `text` para o limiar.
- Exemplo oficial: [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/). Observar o limiar rotulado em `ReferenceLine` sobre colunas empilhadas.
- Documentação: [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/). Observar `ifOverflow="extendDomain"` e `label`.
- Exemplo oficial: [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/). Observar `useYAxisScale` convertendo valor em pixel, base da alternativa com `shape`.
- Praticante: [Peltier Tech, Add Lines to Bar or Column Charts](https://peltiertech.com/Excel/Charts/AddLine.html). Observar a linha de meta ou média desenhada como série própria, e não como enfeite.
- Portal de design: lacuna nesta rodada.

### 3.12 Colunas mensais com linha de acumulado

**Descrição.** Colunas com o valor de cada mês e linha com o acumulado do ano. O acumulado cresce muito mais que as colunas, por isso a forma quase sempre usa eixo direito, com a meta anual como referência nesse eixo.

**Anatomia.** Colunas no eixo esquerdo; acumulado no direito com ponto no último mês fechado; `ReferenceLine` da meta anual no eixo direito, rotulada; eixo e série na mesma cor; alternativa pronta em painéis (burn-up em cima, colunas embaixo).

**Abordagem na stack.** recharts-nativo com domínios calculados: `ComposedChart`, `Bar yAxisId="mes"`, `Line yAxisId="acum"`, `YAxis yAxisId="acum" orientation="right"`, `ReferenceLine yAxisId="acum" y={metaAnual} ifOverflow="extendDomain"`.

**Ponto delicado.** As duas escalas não têm relação natural, então o cruzamento entre a linha e o topo das colunas não significa nada e não é anotado. Regra objetiva sugerida: eixo direito de 0 a `Math.max(metaAnual, acumuladoMax)`; eixo esquerdo escolhido para que a meta mensal linear (`metaAnual / 12`) fique numa altura declarada, por exemplo metade do eixo, o que transforma "coluna acima da marca" em "mês acima do ritmo linear". Meses futuros são `null` nas duas séries. Estorno deixa a coluna negativa e faz o acumulado descer; aí os zeros precisam de alinhamento (seção 5).

**Versões sugeridas.**

1. **Básico.** Receita reconhecida mensal em colunas e acumulado de 2026 em linha, com meta anual fictícia de R$ 10 mi.
2. **Com alternância.** O mesmo cartão com toggle entre eixo duplo e painéis alinhados (modelo 4), preservando cores e domínios.
3. **Denso do Farol.** Fechamentos mensais empilhados por vertical (modelo 9) com o acumulado total, a meta anual e a marca do ritmo linear no eixo esquerdo.
4. **Caso limite.** Estorno em mai/2026 (coluna negativa, acumulado cai) e meta revisada em jun/2026, desenhada como degrau em vez de linha fixa.

**Referências.**

- Praticante: [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide). Observar zeros alinhados, cores por eixo e rótulos nos extremos e no último valor.
- Praticante: [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis). Observar a saída em gráficos empilhados com o mesmo eixo x.
- Documentação: [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/). Observar `yAxisId` na referência para que a meta anual use o eixo do acumulado.
- Biblioteca: [Tremor, Combo Chart](https://tremor.so/docs/visualizations/combo-chart). Observar `enableBiaxial` e rótulo de eixo por série.
- Praticante: [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis). Observar por que escalas arbitrárias sugerem cruzamentos.
- Portal de design: lacuna nesta rodada.

### 3.13 Real contra orçamento com painel de variação

**Descrição.** Painel principal com realizado e orçado por período ou categoria, e um painel inferior mais baixo, alinhado no mesmo eixo x, com barras de variação absoluta a partir do zero. É a forma comum em relatórios financeiros padronizados; a Wikipedia descreve a norma IBCS cobrindo, entre outros pontos, cenários e análises de variância.

**Anatomia.** Realizado sólido e orçado vazado (ou a fantasma do modelo 6); painel de variação com cerca de um terço da altura; cor pela polaridade da métrica; rótulo com sinal explícito ("+R$ 120 mil", "−R$ 40 mil"); variação percentual no tooltip ou num terceiro painel.

**Abordagem na stack.** html-tailwind com recharts-nativo: dois `ComposedChart` empilhados com o mesmo `syncId`, `YAxis width` fixo e igual, `XAxis hide` no painel de cima; o de baixo com `Bar dataKey="variacao"`, cor por item via `shape` e `ReferenceLine y={0}`, como no exemplo PositiveAndNegativeBarChart.

**Ponto delicado.** A cor segue a polaridade, não o sinal: custo acima do orçado é ruim mesmo sendo positivo. Polaridade é propriedade da métrica, passada como prop (`polaridade: 'maiorMelhor' | 'menorMelhor'`) e nunca inferida. O painel de variação tem escala própria (as variações são pequenas perto dos totais) e isso precisa estar escrito, senão o leitor vê desvio gigante. Variação percentual com orçado zero é indefinida; mostrar só a absoluta. Variação minúscula some; `minPointSize` garante um traço visível e o rótulo diz o valor real. Orçamento revisado no meio do ano: comparar contra a versão declarada no título, nunca misturar versões.

**Versões sugeridas.**

1. **Básico.** Custo mensal realizado contra orçado em 2026, com painel de variação e polaridade "menor é melhor".
2. **Com destaque.** Receita por vertical fictícia (Patrimônio, Estruturadas, Consultoria) contra orçamento e contra o ano anterior, com dois painéis de variação e o maior desvio anotado.
3. **Denso do Farol.** Custo em três camadas por mês, cada camada com a sua variação e o total do ano rotulado.
4. **Caso limite.** Orçado zero num mês (percentual indefinido), variação de R$ 800 ao lado de outra de R$ 900 mil (`minPointSize`) e troca da versão do orçamento em jul/2026.

**Referências.**

- Exemplo oficial: [Recharts, Positive and Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/). Observar `ReferenceLine y={0}` e os ticks coloridos pelo sinal; no Farol a cor vem da polaridade.
- Exemplo oficial: [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/). Observar `syncId` para amarrar os dois painéis.
- Documentação: [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/). Observar `minPointSize`, inclusive como função.
- Catálogo: [Wikipedia, International Business Communication Standards](https://en.wikipedia.org/wiki/International_Business_Communication_Standards). Observar a notação cobrindo cenários, períodos e análises de variância; as regras visuais detalhadas não estão no artigo.
- Referência de norma: [IBCS, Version 2.0](https://www.ibcs.com/ibcs-version-2-0/). Observar a separação entre notação e composição.
- Portal de design: lacuna nesta rodada.

### 3.14 Colunas em eixo duplo (antipadrão catalogado)

**Descrição.** Duas séries de colunas lado a lado, cada uma no seu eixo. Tecnicamente trivial; entra no catálogo para ser reconhecida e trocada.

**Anatomia.** Pares de colunas cujas alturas não são comparáveis entre si, mas são lidas como se fossem.

**Abordagem na stack.** recharts-nativo (exemplo BiaxialBarChart: duas `Bar` com `yAxisId="left"` e `"right"`). No Farol, o componente de combinados recusa duas `Bar` em eixos y diferentes e emite aviso de desenvolvimento sugerindo painéis alinhados ou índice.

**Ponto delicado.** Coluna é lida pelo comprimento a partir de um zero comum; com dois eixos, a coluna mais alta pode ser a menor quantidade e a comparação entre pares vira ruído. Few conclui que eixo duplo nunca deve codificar só barras. Saídas: painéis alinhados (modelo 4), colunas em pequenos múltiplos (03_colunas-verticais), índice base 100 (04_linhas, modelo 10) ou colunas com linha (modelo 2) quando uma das medidas é taxa.

**Versões sugeridas.**

1. **Didático.** Investimento em R$ e leads em quantidade por plataforma fictícia, lado a lado, com a versão corrigida em painéis ao lado.
2. **Guarda de componente.** Teste que monta o combinado com duas `Bar` em `yAxisId` distintos e espera o aviso.

**Referências.**

- Exemplo oficial: [Recharts, Biaxial Bar Chart](https://recharts.github.io/en-US/examples/BiaxialBarChart/). Observar como a biblioteca permite a combinação sem nenhum alerta.
- Praticante: [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf). Observar a rejeição explícita de barras em eixo duplo.
- Praticante: [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis). Observar as alternativas.
- Catálogo: [From Data to Viz, Dual axis caveat](https://www.data-to-viz.com/caveat/dual_axis.html). Observar a manipulação de escala.

---

## 4. Modelos que moram melhor em outra família

- **Bullet graph completo com faixas qualitativas**: 13_progresso-meta-e-gauge.
- **Linha contra meta ou limiar, sem colunas**: 04_linhas, modelo 9.
- **Burn-up acumulado contra meta como linha pura**: 04_linhas, modelo 11.
- **Índice base 100 como alternativa ao eixo duplo**: 04_linhas, modelo 10.
- **Faixa de valores com linhas de alvo e rótulo ativo** (exemplo TargetPriceChart do Recharts): 04_linhas, modelo 6.
- **Área de diferença acima e abaixo da meta**: 05_areas, modelo 8.
- **Área empilhada protagonista com linha de teto**: 05_areas, modelo 2.
- **Connected scatterplot** (alternativa ao eixo duplo listada pela Daydreaming Numbers) e **dispersão com linha de melhor ajuste** (ScatterAndLineOfBestFit, listado no índice de exemplos do Recharts): 09_dispersao-e-bolhas.
- **Cascata do orçado ao realizado por componente**: 19_cascata-waterfall.
- **Histograma com curva acumulada** (listado na galeria do Vega-Lite): 16_distribuicao.
- **Barra de intervalo com pontos** (listada na galeria do AG Charts) e **alfinetes de variação percentual**: 17_comparacao-de-pontos.
- **Combinação de radar, área radial e nightingale** (listada na galeria do AG Charts): 18_radar.
- **Eixo de categoria hierárquico, mês sobre trimestre** (exemplo BarChartWithMultiXAxis): técnica transversal, documentar em 03_colunas-verticais.

---

## 5. Notas transversais de implementação

**Alinhamento de zeros entre dois eixos.** Função pura usada pelos modelos 2, 3, 9 e 12. Estende os dois domínios o mínimo necessário para que o zero caia na mesma fração da altura, sem cortar dado.

```ts
type Dominio = [number, number];

const incluirZero = ([min, max]: Dominio): Dominio => {
  const lo = Math.min(min, 0);
  const hi = Math.max(max, 0);
  return lo === hi ? [0, 1] : [lo, hi]; // série toda zero ou vazia
};

const fracaoAbaixoDoZero = ([lo, hi]: Dominio): number => -lo / (hi - lo);

const ajustar = ([lo, hi]: Dominio, f: number): Dominio => {
  if (f <= 0) return [0, hi];
  if (f >= 1) return [lo, 0];
  const loNovo = (-f * hi) / (1 - f); // mantém o topo, desce a base
  return loNovo <= lo ? [loNovo, hi] : [lo, (-lo * (1 - f)) / f]; // ou mantém a base, sobe o topo
};

/** Estende dois domínios para que o zero fique na mesma altura nos dois eixos. */
export function alinharZeros(esq: Dominio, dir: Dominio): { esq: Dominio; dir: Dominio } {
  const e = incluirZero(esq);
  const d = incluirZero(dir);
  let f = Math.max(fracaoAbaixoDoZero(e), fracaoAbaixoDoZero(d));
  if (f === 1 && (e[1] > 0 || d[1] > 0)) f = 0.5; // um eixo só negativo e outro com positivos
  return { esq: ajustar(e, f), dir: ajustar(d, f) };
}
```

Os domínios vão para `YAxis domain` com `allowDataOverflow` e `niceTicks="none"`, senão o arredondamento automático desfaz o alinhamento; validar no protótipo com Recharts 3.10. Casos de teste mínimos: dois eixos só positivos (nada muda além de incluir zero), um eixo com negativos, um eixo só negativo contra outro só positivo, série toda nula.

**Marcas e grade.** Para as marcas dos dois eixos coincidirem em altura, gerar `ticks` explícitos em cada eixo como frações iguais do domínio (`lo + i * (hi - lo) / n`); o zero só cai numa marca quando `f * n` é inteiro, então escolher `n` a partir de `f` quando possível. Grade horizontal só do eixo principal: `CartesianGrid yAxisId="qtd"` (a API aceita `yAxisId`) com `syncWithTicks`.

**Cor e rótulo por eixo.** Tick e título do eixo na cor da série (`tick={{ fill: 'var(--farol-serie-1)' }}`); título de eixo com unidade pela prop `label` do eixo, como em ComposedChartWithAxisLabels (`angle: -90`, `position: 'insideLeft'`). Colunas e áreas claras, linhas escuras.

**Ordem de pintura.** SVG não tem z-index: áreas, depois colunas, depois linhas, depois referências e rótulos. Validar no protótipo onde `ReferenceLine` e `ReferenceArea` caem em relação às séries.

**Legenda.** `legendType` por série (`rect` para coluna, `line` para linha, `plainline` para referência tracejada) para a legenda mostrar o tipo da marca, não só a cor.

**Tooltip.** Um `content` único com mapa de formatadores por `dataKey` (moeda compacta, percentual, inteiro, todos de `Intl.NumberFormat('pt-BR')`); taxas sempre com numerador e denominador; valores derivados (excedente, restante, variação) mostrados junto do valor original.

**Guardas do componente de combinados do Farol.** No máximo dois eixos y; no máximo uma série de linha no eixo secundário; recusar colunas em dois eixos (modelo 14); exigir `unidade` em cada série; avisar quando duas séries da mesma unidade vão para eixos diferentes; exigir `regraDeEscala` declarada quando houver eixo duplo entre duas linhas (modelo 3).

**Alternância de modo.** Controle em html-tailwind (eixo duplo, painéis, índice) com o modo guardado no estado da tela; cores e ordem das séries não mudam entre modos.

**Procedência.** Em combinados com previsão (modelos 7, 10 e 12), selo MEDIDO, PREMISSA ou DERIVADO por série, no padrão de etiquetas do planejamento comercial.

**Horizontal.** Barras com marcador, pareto de rótulos longos e filas usam `layout="vertical"` com `XAxis type="number"` e `YAxis type="category"`.

**Acessibilidade.** `accessibilityLayer` (listada na API do ComposedChart); alerta, excedente e polaridade nunca só por cor: sinal, rótulo e padrão de preenchimento.

---

## 6. Fontes consultadas

Todas abertas nesta rodada, exceto as marcadas.

**Catálogos e normas**
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary)
- [From Data to Viz, Dual axis caveat](https://www.data-to-viz.com/caveat/dual_axis.html)
- [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph)
- [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart)
- [Wikipedia, International Business Communication Standards](https://en.wikipedia.org/wiki/International_Business_Communication_Standards)
- [IBCS, página inicial](https://www.ibcs.com/)
- [IBCS, Version 2.0](https://www.ibcs.com/ibcs-version-2-0/)

**Praticantes e pesquisa**
- [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf)
- [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf)
- [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide)
- [Datawrapper, New: Dual-axis charts in Datawrapper](https://www.datawrapper.de/blog/dual-axis-charts)
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis)
- [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis)
- [Flourish, Dual axis charts: why they spark debate, and how to get them right](https://flourish.studio/blog/dual-axis-charts/)
- [Free Range Statistics, Dual axes time series plots may be ok sometimes after all](https://freerangestats.info/blog/2016/08/18/dualaxes)
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/)
- [Peltier Tech, Add Lines to Bar or Column Charts](https://peltiertech.com/Excel/Charts/AddLine.html)
- [Daydreaming Numbers, 5 alternatives to dual axis charts](https://daydreamingnumbers.com/5-alternatives-to-dual-axis-charts/)
- [Nightingale, Dashboard Redesign: A Look at Chart Choices](https://nightingaledvs.com/dashboard-redesign-a-look-at-chart-choices/)
- [Why Two Y-Axes (Y2Y): A Case Study for Visual Correlation with Dual Axes](https://uncharted.software/assets/WhyTwoYAxes_Y2Y.pdf)

**Bibliotecas, galerias e exemplos**
- [Recharts, Examples](https://recharts.github.io/en-US/examples/)
- [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/)
- [Recharts, Same Data Composed Chart](https://recharts.github.io/en-US/examples/SameDataComposedChart/)
- [Recharts, Vertical Composed Chart](https://recharts.github.io/en-US/examples/VerticalComposedChart/)
- [Recharts, Composed Chart With Axis Labels](https://recharts.github.io/en-US/examples/ComposedChartWithAxisLabels/)
- [Recharts, Target Price Chart with active Label](https://recharts.github.io/en-US/examples/TargetPriceChart/)
- [Recharts, Biaxial Line Chart](https://recharts.github.io/en-US/examples/BiaxialLineChart/)
- [Recharts, Biaxial Bar Chart](https://recharts.github.io/en-US/examples/BiaxialBarChart/)
- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/)
- [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/)
- [Recharts, Bar Chart With Multi X Axis](https://recharts.github.io/en-US/examples/BarChartWithMultiXAxis/)
- [Recharts, Bar Chart with background](https://recharts.github.io/en-US/examples/BarChartHasBackground/)
- [Recharts, Ranged Bar Chart](https://recharts.github.io/en-US/examples/BarChartRangeExample/)
- [Recharts, Positive and Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/)
- [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/)
- [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/)
- [Recharts, Line API](https://recharts.github.io/en-US/api/Line/)
- [Recharts, YAxis API](https://recharts.github.io/en-US/api/YAxis/)
- [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/)
- [Recharts, CartesianGrid API](https://recharts.github.io/en-US/api/CartesianGrid/)
- [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/)
- [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/)
- [Tremor, Combo Chart](https://tremor.so/docs/visualizations/combo-chart)
- [Vega-Lite, Example Gallery](https://vega.github.io/vega-lite/examples/)
- [Vega-Lite, Layered Plot with Dual-Axis](https://vega.github.io/vega-lite/examples/layer_dual_axis.html)
- [Vega-Lite, Mean overlay over precipitation chart](https://vega.github.io/vega-lite/examples/layer_precipitation_mean.html)
- [Vega-Lite, Bar Chart Highlighting Values beyond a Threshold](https://vega.github.io/vega-lite/examples/layer_bar_annotations.html)
- [Vega-Lite, Layered Bar Chart](https://vega.github.io/vega-lite/examples/bar_layered_transparent.html)
- [Vega-Lite, Bullet Chart](https://vega.github.io/vega-lite/examples/facet_bullet.html)
- [Highcharts, Dual axes, line and column](https://www.highcharts.com/demo/highcharts/combo-dual-axes)
- [Highcharts, Pareto chart](https://www.highcharts.com/demo/highcharts/pareto) (abriu; configuração carrega por script)
- [Highcharts, documentação do Pareto chart](https://www.highcharts.com/docs/chart-and-series-types/pareto-chart)
- [Highcharts, Bullet graph](https://www.highcharts.com/demo/highcharts/bullet-graph)
- [AG Charts, Chart Gallery](https://www.ag-grid.com/charts/gallery/)
- [AG Charts, Bar And Line Combination Chart](https://www.ag-grid.com/charts/gallery/bar-line-combination/)
- [AG Charts, Grouped Category Axis Combination Chart](https://www.ag-grid.com/charts/gallery/grouped-bar-line-combination/)
- [AG Charts, Bar, Line And Area Combination Chart](https://www.ag-grid.com/charts/gallery/grouped-category-combination/)
- [AG Charts, Step Interpolation Combination Chart](https://www.ag-grid.com/charts/gallery/step-interpolation-combination/)
- [AG Charts, Stacked Bar And Area Combination Chart](https://www.ag-grid.com/charts/gallery/stacked-bar-area-combination/)
- [AG Charts, Bullet Chart](https://www.ag-grid.com/charts/gallery/simple-bullet/)

**Portais de design**
- [Behance, Sales Management Dashboard](https://www.behance.net/gallery/192233069/Sales-Management-Dashboard) (abriu; imagens não inspecionadas)

**Tentadas sem sucesso e fora da lista acima:** o índice de demos do Highcharts e a página de exemplos do IBCS (listas carregadas por script, nenhum item legível pela ferramenta); a página de pareto de uma associação de qualidade (403); Dribbble, Figma Community e novos projetos no Behance não entraram porque o limite de buscas na web da sessão se esgotou antes desta família fechar, e nenhum link de portal foi montado de memória. Por isso a maioria dos modelos registra "portal de design: lacuna nesta rodada".
