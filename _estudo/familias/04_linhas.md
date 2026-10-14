# Família 04 · Linhas

Catálogo VISUAIS do Farol · estudo granular · 2026-09-14

Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão. Todos os casos de uso abaixo são fictícios e não citam marca real.

Legenda de abordagem usada em todo o arquivo:

- **recharts-nativo**: resolve com componentes e props do Recharts, sem desenho próprio.
- **recharts-custom**: Recharts com `shape`, `label`, `dot`, `content` ou um componente filho que lê os hooks do gráfico (`useYAxisScale`, `usePlotArea`, `useChartHeight`).
- **svg-puro**: componente React que desenha SVG com geometria calculada em TypeScript.
- **html-tailwind**: composição em HTML com Tailwind (grades de pequenos múltiplos, legendas, painéis, estados vazios).

---

## 1. O que a família responde

A linha codifica mudança ao longo de um intervalo contínuo ou ordenado; a inclinação é o próprio dado. A família responde "subiu ou desceu, quanto, desde quando, em que ritmo e em relação a quê" (meta, período anterior, faixa esperada, outras séries). O FT Visual Vocabulary a trata como a forma padrão de mostrar uma série temporal.

Perguntas típicas por público do Farol:

- **Comercial:** a receita reconhecida está acima ou abaixo da trajetória da meta no acumulado do ano? O forecast do trimestre converge para o fechamento? Qual executivo subiu ou caiu no ranking de fechamentos?
- **Pré-vendas:** as entradas desta semana fogem do padrão das últimas oito? O percentual dentro do SLA furou o limiar? O tempo até o primeiro contato piorou depois da troca de escala?
- **Marketing:** o CPL qualificado acompanha o CPL bruto ou descolou? Qual plataforma cresceu mais desde o início do trimestre? A mudança de formulário alterou a cobertura de origem?
- **Diretoria:** a participação de mercado mudou de patamar depois da revisão de perímetro? O realizado cabe na faixa de cenários desenhada no início do ano?

Fronteiras: pergunta de composição (partes de um todo) mora em 05_areas; mistura de grandeza e taxa mora em 08_combinados-e-eixo-duplo; comparação de só dois momentos mora em 17_comparacao-de-pontos.

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Linha simples | Uma métrica ao longo do tempo | Menos de 4 pontos (cartão ou colunas resolvem) | Eixo x categórico que esconde meses sem dado |
| 2 | Múltiplas séries | Até 4 ou 5 séries na mesma unidade | Mais de 5 séries ou unidades diferentes | Legenda distante e cores sem hierarquia |
| 3 | Destaque de uma série com resto neutro | Uma série protagonista contra o contexto das demais | Quando todas as séries importam igualmente | Neutras apagadas demais no tema escuro; destaque sem rótulo |
| 4 | Pontos e rótulo direto no final | Poucas séries, leitura sem legenda | Finais muito próximos sem tratamento de colisão | Rótulos sobrepostos e margem direita curta |
| 5 | Step (degrau) | Valores que mudam em instantes discretos | Grandezas contínuas amostradas | Degrau na direção errada (antes ou depois da data) |
| 6 | Linha com banda de intervalo | Valor central com dispersão ou incerteza | Público que lê a banda como faixa de meta | Banda mais saliente que a linha |
| 7 | Real contra previsto (trecho tracejado) | Série que continua em projeção | Projeção sem método declarado | Buraco entre o sólido e o tracejado |
| 8 | Linha com anotação de eventos | Explicar mudanças de patamar por fatos datados | Mais de 5 eventos na janela | Anotação cobrindo a própria linha |
| 9 | Linha com meta ou limiar | Comparar com referência fixa ou faixa aceitável | Meta que varia por período sem ser desenhada como série | Meta fora do domínio que some sem aviso |
| 10 | Índice base 100 | Comparar ritmo de séries de grandezas diferentes | Base próxima de zero, nula ou negativa | Não declarar a data base |
| 11 | Acumulado no ano contra meta (burn-up) | Metas anuais aditivas | Taxas e médias, que não somam | Meta acumulada linear em negócio sazonal |
| 12 | Bump chart (ranking) | Mudança de posição de 5 a 12 itens | Quando a distância entre posições importa | Empates sem regra; tooltip sem valor absoluto |
| 13 | Linha com média móvel sobre o bruto | Série diária ruidosa | Menos de três janelas de dados | Janela à direita sem avisar o atraso da tendência |
| 14 | Linhas sincronizadas e pequenos múltiplos | Muitas séries ou unidades diferentes lado a lado | Espaço vertical mínimo | Eixos y independentes sem aviso |
| 15 | Linha com lacuna de dado declarada | Coleta interrompida ou fonte que começou tarde | Quando a ausência é zero verdadeiro | Ligar nulos e inventar tendência, ou tratar nulo como zero |
| 16 | Linha com seleção de janela (brush e zoom) | Séries longas em análise exploratória | Tela executiva de leitura única | Zoom sem recalcular o domínio y |
| 17 | Sobreposição de períodos (ano contra ano) | Sazonalidade e comparação com o mesmo período anterior | Calendários desalinhados sem normalizar | Alinhar por data civil quando o negócio segue dia útil |

---

## 3. Modelos em detalhe

### 3.1 Linha simples

**Descrição.** Pontos de uma série ordenada ligados por segmentos; a posição vertical codifica o valor e a inclinação, o ritmo de mudança.

**Anatomia.** Eixo x temporal; eixo y quantitativo com 4 ou 5 marcas; grade horizontal discreta; linha de 2 px; ponto ativo no hover; tooltip com data e valor em pt-BR; título que enuncia a conclusão.

**Abordagem na stack.** recharts-nativo: `LineChart`, `Line type="linear"` ou `"monotone"`, `XAxis`, `YAxis`, `CartesianGrid vertical={false}`, `Tooltip`.

**Ponto delicado.** Duas escolhas silenciosas mudam a leitura. Primeira: eixo x categórico só mostra as categorias presentes; um mês sem registro desaparece e a linha liga os vizinhos. Gerar a série de calendário completa em TypeScript antes do render, com `null` onde não há dado, ou usar `XAxis type="number" scale="time"` com timestamps. Segunda: curvas suavizadas sugerem valores entre pontos que não existem; em séries mensais curtas, `linear` é mais honesto. A linha não precisa partir do zero (Storytelling with Data sugere deixar os dados em cerca de 70 a 80% da altura), mas o eixo precisa mostrar onde começa.

**Versões sugeridas.**

1. **Básico.** Receita reconhecida mensal de jan a ago de 2026, eixo em moeda compacta (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })`).
2. **Com destaque.** A mesma série com o último ponto marcado e rotulado; título "Receita reconhecida em ago/2026: R$ 1,4 mi, maior do ano".
3. **Denso do Farol.** Entradas diárias de leads em 180 dias, `dot={false}`, `isAnimationActive={false}`, tooltip com dia da semana.
4. **Caso limite.** Variação mensal de carteira com valores negativos e um mês sem coleta (`null`); `ReferenceLine y={0}` ancora o sinal.

**Referências.**

- Catálogo: [Data Viz Catalogue, Line Graph](https://datavizcatalogue.com/methods/line_graph.html). Observar o limite de 3 a 4 linhas e a sugestão de pequenos múltiplos.
- Praticante: [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph). Observar o zero opcional e a regra de 70 a 80% da altura para os dados.
- Exemplo oficial: [Recharts, Examples](https://recharts.github.io/en-US/examples/). Observar as variações nativas de `LineChart` listadas.
- Portal de design: [Behance, LINE CHART DASHBOARD UI DESIGN](https://www.behance.net/gallery/168636537/LINE-CHART-DASHBOARD-UI-DESIGN). A página abriu, mas as imagens não foram inspecionadas pela ferramenta; observar tratamento de cartão e tooltip.

### 3.2 Múltiplas séries

**Descrição.** Várias linhas na mesma unidade compartilhando eixos, para comparar trajetórias.

**Anatomia.** Uma cor por série com luminosidade parecida; legenda próxima ou rótulos diretos; tooltip com todas as séries ordenadas por valor.

**Abordagem na stack.** recharts-nativo: várias `Line` com `dataKey` distintos; `Tooltip itemSorter` para ordenar por valor; `Legend` só quando não houver rótulo direto.

**Ponto delicado.** O efeito espaguete aparece a partir de 5 séries (From Data to Viz); acima disso o modelo troca para o 3 ou o 14. No tema escuro, cores categóricas com luminosidades muito diferentes criam hierarquia falsa. Para ligar e desligar séries pela legenda, usar a prop `hide` da `Line` (mantém a entrada na legenda) em vez de remover o componente, e fixar o domínio y para que o eixo não salte a cada clique.

**Versões sugeridas.**

1. **Básico.** CPL e CPL qualificado mensais, duas linhas na mesma unidade.
2. **Com destaque.** Investimento mensal em quatro plataformas fictícias (Busca paga, Rede social, Rede profissional, Programática), a de maior variação em cor de acento.
3. **Denso do Farol.** Taxa semanal de agenda para oportunidade de 5 squads de pré-vendas em 26 semanas, legenda interativa.
4. **Caso limite.** 12 executivos na mesma área: o componente detecta mais de 5 séries e oferece o modelo 3 ou 14, com a regra escrita no rodapé.

**Referências.**

- Catálogo: [From Data to Viz, Line chart](https://www.data-to-viz.com/graph/line.html). Observar os alertas de espaguete, eixo e proporção de tela.
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide). Observar pequenos múltiplos quando as linhas se sobrepõem.
- Biblioteca: [Tremor, Line Chart](https://tremor.so/docs/visualizations/line-chart). Observar `categories`, legenda com rolagem e tooltip customizado.
- Portal de design: [Behance, Sales Management Dashboard](https://www.behance.net/gallery/192233069/Sales-Management-Dashboard). A página abriu com as tags de line chart; imagens não inspecionadas.

### 3.3 Destaque de uma série com resto neutro

**Descrição.** Todas as séries desenhadas, mas só uma (ou duas) em cor; as demais em cinza de baixo contraste, como contexto.

**Anatomia.** Neutras em 1 px e opacidade baixa; protagonista em 2,5 px com cor de acento, ponto final e rótulo direto; halo opcional (contorno na cor do fundo) para separar cruzamentos.

**Abordagem na stack.** recharts-custom. A ordem dos filhos define a sobreposição (SVG não tem z-index): neutras primeiro, protagonista por último. O halo é uma segunda `Line` da mesma série, desenhada logo antes, com `stroke` igual ao fundo e `strokeWidth` maior. O estado de destaque vive em `useState` e troca por clique na legenda ou `onMouseEnter` na `Line`.

**Ponto delicado.** Ao trocar o protagonista, reordenar o array de séries, não apenas a cor, senão ele fica por baixo das neutras. Com 20 séries, o tooltip padrão vira lista enorme; usar `content` que mostra a protagonista, a mediana e os extremos do grupo. `activeDot={false}` nas neutras. No tema escuro, o cinza neutro precisa de contraste suficiente contra o fundo para não sumir (referência de 3:1 para elementos gráficos).

**Versões sugeridas.**

1. **Básico.** Percentual de SLA semanal de 8 squads, o squad selecionado no filtro em destaque.
2. **Com anotação.** CPL qualificado de 15 campanhas; a campanha nova destacada com anotação no dia de lançamento.
3. **Denso do Farol.** Tempo médio de handoff de pré-vendas para vendas de 24 executivos em 52 semanas, com a mediana do grupo como segunda série destacada em tracejado.
4. **Caso limite.** Duas séries destacadas que se cruzam várias vezes: halo obrigatório e rótulos finais com anticolisão.

**Referências.**

- Catálogo: [From Data to Viz, Spaghetti plot](https://www.data-to-viz.com/caveat/spaghetti.html). Observar as saídas propostas: destacar um grupo, pequenos múltiplos, filtro interativo.
- Exemplo técnico: [Vega-Lite, Multi Series Line Chart with Halo Stroke](https://vega.github.io/vega-lite/examples/line_color_halo.html). Observar a camada de fundo com traço mais largo.
- Praticante: [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/). Observar a sobreposição como instrumento de comparação.
- Exemplo oficial: [Recharts, Compare Two Lines](https://recharts.github.io/en-US/examples/CompareTwoLines/). Observar o hover que controla a ênfase e a série de comparação tracejada.

### 3.4 Pontos e rótulo direto no final

**Descrição.** Cada série termina com ponto e rótulo (nome e valor), dispensando legenda. Variação: pontos só onde importam (máximo, mínimo, fora do limiar).

**Anatomia.** Margem direita reservada; rótulo na cor da série; ponto final maior; pontos intermediários só em séries esparsas.

**Abordagem na stack.** recharts-custom. `LabelList` com `content` (ou `label` da `Line` como função) que devolve `null` fora do último ponto válido; `dot` como função que só desenha nos índices de interesse, como no exemplo CustomizedDotLineChart. A anticolisão é calculada em TypeScript: converter os valores finais em pixels com `useYAxisScale` num componente filho, ordenar e empurrar rótulos com espaçamento mínimo de cerca de 14 px, desenhando uma guia curta quando o rótulo sai da altura do ponto.

**Ponto delicado.** `margin.right` precisa caber o maior rótulo; estimar pela contagem de caracteres ou medir com `getComputedTextLength` depois de montar. Quando a série termina em nulo, o final é o último ponto válido, não o último índice. Rótulo, tooltip e eixo leem o mesmo formatador.

**Versões sugeridas.**

1. **Básico.** Receita reconhecida por três verticais fictícias (Patrimônio, Estruturadas, Consultoria), rótulo final "Patrimônio R$ 820 mil".
2. **Com destaque.** Agendas mensais com pontos só no máximo e no mínimo do ano.
3. **Denso do Farol.** CPL final de 5 plataformas com anticolisão ativa (dois finais em R$ 212 e R$ 215).
4. **Caso limite.** Plataforma desligada em jun/2026: rótulo no último ponto válido com "(até jun)".

**Referências.**

- Exemplo técnico: [Vega-Lite, Carbon Dioxide in the Atmosphere](https://vega.github.io/vega-lite/examples/layer_line_co2_concentration.html). Observar rótulos de início e fim por agregação mínima e máxima.
- Galeria: [AG Charts, Line Chart With Labels](https://www.ag-grid.com/charts/gallery/line-with-labels/). Observar o formatador que rotula só o primeiro e o último ponto.
- Galeria: [Highcharts, Line chart with data labels](https://www.highcharts.com/demo/highcharts/line-labels). Observar o custo visual de rotular todos os pontos.
- Exemplos oficiais: [Recharts, Customized Dot Line Chart](https://recharts.github.io/en-US/examples/CustomizedDotLineChart/) e [Recharts, Customized Label Line Chart](https://recharts.github.io/en-US/examples/CustomizedLabelLineChart/). Observar `dot` condicional por valor e rótulo SVG na cor do traço.

### 3.5 Step (degrau)

**Descrição.** A linha fica horizontal até a próxima mudança e salta na vertical; afirma que não existe valor intermediário.

**Anatomia.** Degraus que valem a partir da data (`stepAfter`) ou até a data (`stepBefore`); pontos opcionais nas mudanças; anotação do motivo.

**Abordagem na stack.** recharts-nativo: `Line type="stepAfter"` (a API também aceita `step` e `stepBefore`).

**Ponto delicado.** O tipo segue a semântica: teto de capacidade que muda com uma contratação vale a partir da data, então `stepAfter`. Para o último patamar ter largura, acrescentar um ponto final que repete o valor na data de corte (hoje); sem isso o último valor vira um ponto sem degrau. Em eixo categórico cada degrau tem a largura de uma categoria; em eixo numérico de tempo a largura respeita a duração real.

**Versões sugeridas.**

1. **Básico.** Teto de capacidade da pré-vendas (agendas por semana) de jan a set de 2026, mudando com contratações.
2. **Com anotação.** Tabela de preço fictícia de um serviço com o reajuste "2026-04-01" anotado.
3. **Denso do Farol.** Capacidade em degrau contra demanda semanal em linha comum (a mesma leitura aparece em 08 como área com linha).
4. **Caso limite.** Duas mudanças registradas na mesma data (correção retroativa), resolvidas pela ordem do registro e anotadas.

**Referências.**

- Praticante: [Nightingale, Step Aside Line Graphs And Bar Charts! This Is a Job For Me](https://nightingaledvs.com/step-charts/). Observar juros, temporadas e níveis sem valor intermediário.
- Exemplo técnico: [Vega-Lite, Step Chart](https://vega.github.io/vega-lite/examples/line_step.html). Observar `interpolate: step-after`.
- Documentação: [Recharts, Line API](https://recharts.github.io/en-US/api/Line/). Observar os tipos `step`, `stepBefore` e `stepAfter`.
- Catálogo: [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization). Observar o step line chart entre as formas temporais.

### 3.6 Linha com banda de intervalo

**Descrição.** Linha central (mediana, média ou previsão) sobre uma faixa sombreada de dispersão ou incerteza.

**Anatomia.** Banda de baixa opacidade sem contorno; linha central saliente; nota que diz o que a banda representa (P25 a P75, mínimo e máximo, intervalo de 95%).

**Abordagem na stack.** recharts-nativo: `ComposedChart` com `Area dataKey="faixa"`, em que cada ponto traz `faixa: [inferior, superior]`, `stroke="none"`, e `Line dataKey="central"` depois.

**Ponto delicado.** O tooltip recebe um array para a `Area` de faixa; o `formatter` precisa escrever "entre X e Y". A `Area` vem antes da `Line` nos filhos. Nulos numa das bordas quebram a banda; decidir entre `connectNulls` e lacuna explícita. Banda estatística não é faixa de meta: faixa de meta usa `ReferenceArea` (modelo 9) e outra cor.

**Versões sugeridas.**

1. **Básico.** Tempo até o primeiro contato em horas: mediana semanal com banda P25 a P75.
2. **Com destaque.** CPL diário com banda de mínimo e máximo das 8 semanas anteriores; pontos fora da banda marcados.
3. **Denso do Farol.** Participação de mercado estimada com banda entre perímetro restrito e perímetro amplo.
4. **Caso limite.** Semanas com menos de 10 observações têm a banda omitida e nota "amostra insuficiente".

**Referências.**

- Exemplo oficial: [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/). Observar a `Area` com dataKey em array e a `Line` por cima.
- Exemplo técnico: [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html). Observar a separação entre marca de banda e marca de média.
- Galeria: [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line). Observar a opacidade da faixa e a linha por cima.
- Galeria: [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/). Observar a faixa de mínimo a máximo com marcos de eventos.

### 3.7 Real contra previsto (trecho tracejado)

**Descrição.** Série contínua que muda de estilo no ponto em que deixa de ser medida e passa a ser projeção.

**Anatomia.** Trecho sólido até hoje; trecho tracejado depois; `ReferenceLine` vertical "hoje"; banda de incerteza opcional (modelo 6) ou leque (05_areas).

**Abordagem na stack.** recharts-custom no dado: duas `Line`, `dataKey="real"` sólida e `dataKey="projetado"` com `strokeDasharray="4 4"`, e o ponto de junção (último real) presente nas duas chaves.

**Ponto delicado.** Sem repetir o ponto de junção a linha abre um buraco; é a mesma solução do exemplo Vega-Lite, que repete o ponto E. O tooltip rotula "projetado" e não duplica o valor no ponto de junção. O método da projeção vai no rodapé com um selo de procedência (MEDIDO, PREMISSA, DERIVADO), no padrão de etiquetas já adotado no planejamento comercial.

**Versões sugeridas.**

1. **Básico.** Receita reconhecida real até ago/2026 e projetada até dez/2026.
2. **Com anotação.** Forecast de fechamentos com a data de corte anotada e selo PREMISSA.
3. **Denso do Farol.** Três projeções (conservadora, base, otimista) tracejadas em pesos diferentes a partir do mesmo ponto de junção.
4. **Caso limite.** Projeção que cruza a meta: data estimada do cruzamento anotada e aviso quando a incerteza inclui a meta.

**Referências.**

- Exemplo técnico: [Vega-Lite, Line chart with a dashed part](https://vega.github.io/vega-lite/examples/line_dashed_part.html). Observar o ponto repetido que costura sólido e tracejado.
- Praticante: [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph). Observar previsão e anotação como contexto.
- Documentação: [Recharts, Line API](https://recharts.github.io/en-US/api/Line/). Observar `strokeDasharray`.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar o fan chart de projeção como evolução do tracejado.

### 3.8 Linha com anotação de eventos

**Descrição.** Marcadores verticais ou faixas de período ligados a fatos datados (campanha lançada, troca de escala, revisão de perímetro), com texto curto.

**Anatomia.** `ReferenceLine` vertical fina para eventos pontuais; `ReferenceArea` translúcida para períodos; marcador numerado e legenda de eventos abaixo quando houver mais de três.

**Abordagem na stack.** recharts-nativo para linhas e faixas (`ReferenceLine x`, `ReferenceArea x1 x2`, `label`). recharts-custom quando o rótulo precisa de anticolisão: número em círculo SVG via `label` como componente e legenda em html-tailwind sincronizada ao hover. Evitar ícone lucide dentro de `foreignObject` no SVG; o ícone fica na legenda HTML.

**Ponto delicado.** Em eixo categórico o `x` precisa ser exatamente uma categoria existente; em eixo numérico de tempo, timestamp. `ifOverflow="discard"` impede que eventos fora da janela filtrada apareçam colados na borda. Texto girado a 90 graus (como no exemplo oficial) é difícil de ler; número e legenda funcionam melhor.

**Versões sugeridas.**

1. **Básico.** Entradas semanais com linha vertical "novo formulário no site".
2. **Com faixa.** CPL com `ReferenceArea` cobrindo o período de uma campanha sazonal.
3. **Denso do Farol.** Participação de mercado com três eventos numerados (revisão de perímetro, entrada de concorrente fictício, troca de fonte) e legenda HTML sincronizada.
4. **Caso limite.** Eventos na mesma data e janela filtrada que corta um período; faixa truncada com a indicação "começa antes da janela".

**Referências.**

- Exemplo técnico: [Vega-Lite, Line Chart with Highlighted Rectangles](https://vega.github.io/vega-lite/examples/layer_falkensee.html). Observar faixas de período rotuladas atrás da linha.
- Documentação: [Recharts, ReferenceArea API](https://recharts.github.io/en-US/api/ReferenceArea/). Observar `x1`, `x2`, `ifOverflow`, `label` e `shape`.
- Praticante: [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart). Observar a ferramenta de highlight range e as anotações de texto.
- Galeria: [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/). Observar fases de negócio anotadas como faixas e a linha de break even.

### 3.9 Linha com meta ou limiar

**Descrição.** Série comparada a um valor de referência (linha horizontal) ou a uma faixa aceitável (banda horizontal). Variação: a própria linha muda de cor acima e abaixo do limiar.

**Anatomia.** Meta em traço tracejado neutro com rótulo à direita ("meta 90%"); faixa aceitável em `ReferenceArea` de baixa opacidade; pontos fora do limiar em cor de alerta e com símbolo, não só cor.

**Abordagem na stack.** recharts-nativo para `ReferenceLine y` e `ReferenceArea y1 y2`. recharts-custom para a linha bicolor: `stroke="url(#id)"` com `linearGradient gradientUnits="userSpaceOnUse"` e parada dura na altura do limiar, calculada por `useYAxisScale` num componente filho. É a técnica do exemplo AreaChartFillByValue aplicada ao traço.

**Ponto delicado.** Meta acima do maior valor fica fora do domínio e some; usar `ifOverflow="extendDomain"` no `ReferenceLine`. O gradiente em `userSpaceOnUse` depende da altura do gráfico e precisa ser recalculado no resize. IDs de gradiente devem ser únicos por instância; `useId()` do React 18 devolve dois-pontos, que atrapalham `url(#...)`, então sanitizar com `replace(/:/g, '')`. Meta que muda por mês não é `ReferenceLine`: é uma segunda série em degrau (modelo 5).

**Versões sugeridas.**

1. **Básico.** Percentual de leads atendidos dentro do SLA por semana, com meta de 90%.
2. **Com faixa.** CPL qualificado com faixa aceitável de R$ 180 a R$ 240 e pontos fora marcados.
3. **Denso do Farol.** Fila de leads aguardando primeiro contato, com a linha mudando para cor de alerta acima do teto de capacidade.
4. **Caso limite.** Meta acima de todos os dados (domínio estendido) e margem mensal negativa com limiar em zero.

**Referências.**

- Exemplo oficial: [Recharts, Line Chart With Reference Lines](https://recharts.github.io/en-US/examples/LineChartWithReferenceLines/). Observar `ReferenceLine` com `label` posicionado.
- Documentação: [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/). Observar `ifOverflow="extendDomain"` e `segment`.
- Exemplo oficial: [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/). Observar a razão do zero calculada pela escala do eixo y, reaproveitável no traço.
- Praticante: [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph). Observar linhas de referência para metas e faixas.

### 3.10 Índice base 100

**Descrição.** Cada série é dividida pelo seu valor numa data base e multiplicada por 100; compara o ritmo de crescimento de grandezas diferentes num eixo único.

**Anatomia.** `ReferenceLine` em 100; seletor de data base; título que declara a base ("base: jan/2026 = 100"); tooltip com valor indexado e valor absoluto lado a lado.

**Abordagem na stack.** recharts-nativo sobre transformação em TypeScript (`indice = valor / valorBase * 100`) e `ReferenceLine y={100}`. O seletor de base é html-tailwind; clicar no gráfico pode redefinir a base usando o rótulo ativo devolvido pelo `onClick` do gráfico.

**Ponto delicado.** Base zero ou nula deixa o índice indefinido: escolher automaticamente o primeiro ponto válido e avisar. Base negativa inverte o sinal: bloquear. O índice esconde o nível (50% sobre 10 leads parece igual a 50% sobre 1.000), então o tooltip mostra o absoluto. É a alternativa indicada ao eixo duplo quando as taxas de variação são parecidas (Datawrapper) e quando se quer escala comum por diferença percentual para um valor de referência (Few).

**Versões sugeridas.**

1. **Básico.** Investimento, leads e agendas com jan/2026 = 100.
2. **Com destaque.** A plataforma de mídia que mais cresceu em cor e as demais neutras (combina com o modelo 3).
3. **Denso do Farol.** Receita reconhecida por vertical e custo em três camadas, base no início do ano, com seletor de base.
4. **Caso limite.** Plataforma ativada em mar/2026, indexada na própria primeira data e marcada com asterisco; série com base zero bloqueada com mensagem.

**Referências.**

- Praticante: [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis). Observar quando o gráfico indexado funciona e quando falha.
- Praticante: [Stephen Few, Dual-Scaled Axes in Graphs: Are They Ever the Best Solution?](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf). Observar a conversão para escala comum.
- Praticante: [Free Range Statistics, Dual axes time series plots may be ok sometimes after all](https://freerangestats.info/blog/2016/08/18/dualaxes). Observar escalas que reproduzem visualmente o índice.
- Praticante: [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/). Observar a série fixada num ponto de referência.
- Portal de design: lacuna nesta rodada.

### 3.11 Acumulado no ano contra meta (burn-up)

**Descrição.** Soma acumulada do realizado desde o início do ano contra a trajetória acumulada da meta até o valor anual; o espaço entre as duas é o adiantamento ou o atraso.

**Anatomia.** Real acumulado sólido; meta acumulada tracejada (linear ou sazonal); marcador "hoje"; rótulo do gap ("R$ 320 mil abaixo da trajetória"); projeção opcional até dezembro (modelo 7); `ReferenceLine` na meta anual.

**Abordagem na stack.** recharts-nativo: `LineChart` com duas `Line` sobre dados acumulados em TypeScript; `ReferenceLine y={metaAnual}`; o gap de hoje desenhado com `ReferenceLine segment` vertical entre os dois valores, ou como área de diferença (05_areas, modelo 8).

**Ponto delicado.** Meta acumulada linear penaliza negócio sazonal; derivar a trajetória da sazonalidade do ano anterior quando houver e declarar a escolha. Só métricas aditivas acumulam; taxa acumulada é média ponderada. Meses futuros do realizado são `null`, e não repetição do último valor, senão a linha fica plana até dezembro. Burn-up torna mudança de escopo visível (Wikipedia): meta revisada no meio do ano entra como nova série em degrau.

**Versões sugeridas.**

1. **Básico.** Receita reconhecida acumulada de 2026 contra meta anual fictícia de R$ 10 mi.
2. **Com anotação.** Fechamentos acumulados com gap rotulado em hoje e dias úteis restantes.
3. **Denso do Farol.** Real acumulado, meta linear, meta sazonal e projeção tracejada com faixa; alternância entre as duas metas.
4. **Caso limite.** Meta revisada em jun/2026 (degrau na trajetória) e mês com estorno que faz o acumulado descer.

**Referências.**

- Catálogo: [Wikipedia, Burndown chart](https://en.wikipedia.org/wiki/Burndown_chart). Observar a diferença entre burn-down e burn-up e a linha de escopo.
- Praticante: [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph). Observar metas como linhas de referência.
- Documentação: [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/). Observar `segment` para desenhar o gap.
- Portal de design: lacuna nesta rodada (nenhum burn-up comercial verificado).

### 3.12 Bump chart (ranking ao longo do tempo)

**Descrição.** Posição de cada item em cada período, ligada por linhas; mostra quem subiu, quem caiu e as trocas de liderança.

**Anatomia.** Eixo y ordinal invertido (1 no topo); pontos grandes com o número da posição; nomes no início e no fim; item selecionado em cor e demais com opacidade reduzida.

**Abordagem na stack.** recharts-custom: `LineChart` com `YAxis reversed domain={[1, N]} allowDecimals={false}` (a API do YAxis confirma `reversed`), uma `Line type="monotone"` por item, `dot` customizado com o número e rótulos finais como no modelo 4. Com mais de 12 itens ou curvas em S simétricas entre períodos, svg-puro com curva cúbica calculada.

**Ponto delicado.** O ranking é calculado em TypeScript por período, com regra de empate declarada (competição "1, 2, 2, 4" ou densa "1, 2, 2, 3") e desempate estável por chave secundária, como o exemplo Vega-Lite que ordena por pontos e saldo antes de ranquear. Itens que entram ou saem do top N geram `null`: cortar a linha ou levá-la até uma faixa "fora do top". O ranking esconde a distância; o tooltip traz o valor absoluto.

**Versões sugeridas.**

1. **Básico.** Posição de 6 executivos fictícios (Exec. 01 a Exec. 06) por receita reconhecida em cada trimestre de 2025 e 2026.
2. **Com destaque.** Um executivo em cor, demais com opacidade de 25%, e rótulo na maior subida.
3. **Denso do Farol.** Top 10 criativos por CPL qualificado em 12 semanas, com entradas e saídas do top.
4. **Caso limite.** Empates frequentes e um item pausado num período, com a regra escrita no rodapé.

**Referências.**

- Catálogo: [Data Viz Project, Bump Chart](https://datavizproject.com/data-type/bump-chart-2/) (não abriu). Apareceu na busca com a descrição de mudança de posição, vencedores e perdedores.
- Biblioteca: [nivo, Bump](https://nivo.rocks/bump/). Observar largura e opacidade de linha ativa e inativa e rótulos de início e fim.
- Exemplo técnico: [Vega-Lite, Line Charts Showing Ranks Over Time](https://vega.github.io/vega-lite/examples/window_rank.html). Observar o rank recalculado a cada período.
- Catálogo: [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization). Observar bump chart e bump area chart como formas distintas.
- Portal de design: lacuna nesta rodada.

### 3.13 Linha com média móvel sobre o bruto

**Descrição.** Valores brutos em pontos ou traço fino ao fundo e a média móvel em linha saliente; separa sinal de ruído.

**Anatomia.** Bruto em cinza fino ou pontos translúcidos; média móvel na cor principal; legenda que declara a janela ("média móvel de 7 dias").

**Abordagem na stack.** recharts-nativo: `ComposedChart` com `Scatter` ou `Line` fina para o bruto e `Line` para a média calculada em TypeScript.

**Ponto delicado.** Janela centrada (o exemplo Vega-Lite usa quadro de 15 dias para cada lado) não tem valor nas bordas; janela à direita atrasa a tendência. Escolher e declarar. Dia sem ocorrência é zero; dia sem coleta é nulo; a média muda conforme essa distinção. Em séries de dias úteis, janela de 5.

**Versões sugeridas.**

1. **Básico.** Entradas diárias de leads com média móvel de 7 dias.
2. **Com anotação.** Agendas diárias com semanas de feriado sombreadas (modelo 8).
3. **Denso do Farol.** CPL diário de 4 plataformas em pequenos múltiplos, cada painel com bruto e média.
4. **Caso limite.** Dias sem coleta e dias com zero distinguidos visualmente; janela recalculada só com dias válidos.

**Referências.**

- Exemplo técnico: [Vega-Lite, média móvel de 30 dias sobre valores brutos](https://vega.github.io/vega-lite/examples/layer_line_rolling_mean_point_raw.html). Observar o quadro `[-15, 15]` e os pontos brutos translúcidos.
- Exemplo oficial: [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/). Observar `Scatter` e `Line` no mesmo `ComposedChart`.
- Catálogo: [From Data to Viz, Line chart](https://www.data-to-viz.com/graph/line.html). Observar linhas de tendência como variação da forma.
- Portal de design: lacuna nesta rodada.

### 3.14 Linhas sincronizadas e pequenos múltiplos

**Descrição.** Um gráfico por série ou por métrica, empilhados ou em grade, com eixo x comum e cursor sincronizado.

**Anatomia.** Painéis do mesmo tamanho; eixo y comum quando a pergunta é nível, independente quando é forma (e declarado); cursor vertical compartilhado; eixo x só nos painéis da borda inferior.

**Abordagem na stack.** recharts-nativo com layout html-tailwind: vários `LineChart` com o mesmo `syncId` numa grade `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4`; um `Brush` num dos painéis movimenta todos.

**Ponto delicado.** Domínio y comum exige calcular o máximo global em TypeScript e passar `domain` fixo, porque o padrão é por painel. `syncId` casa pelo índice; todas as séries precisam do mesmo array de datas (preencher com `null`). `YAxis width` fixo e igual em todos os painéis, ou os eixos x desalinham. Com 20 painéis, desligar animação e limitar marcas de eixo.

**Versões sugeridas.**

1. **Básico.** Receita, fechamentos e ticket médio empilhados verticalmente com o mesmo eixo x (alternativa ao eixo duplo, ver 08).
2. **Com destaque.** CPL por plataforma em 4 painéis com a mediana do grupo em cinza em cada um.
3. **Denso do Farol.** SLA semanal de 12 squads em grade 4 por 3, eixo y comum de 0 a 100%.
4. **Caso limite.** Painel sem nenhum dado no período filtrado: estado vazio em HTML, sem eixo quebrado.

**Referências.**

- Exemplo oficial: [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/). Observar `syncId` compartilhado entre três gráficos e o `Brush`.
- Praticante: [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis). Observar os gráficos separados verticalmente com o mesmo eixo x.
- Praticante: [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/). Observar os panel charts.
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide). Observar múltiplas linhas em pequenos múltiplos.

### 3.15 Linha com lacuna de dado declarada

**Descrição.** A linha se interrompe onde não há medição e a interrupção é sinalizada, separando "zero" de "não medido".

**Anatomia.** Segmentos sólidos; `ReferenceArea` hachurada no período sem dado; rótulo "sem coleta"; traço pontilhado fino ligando as bordas, opcional, quando a continuidade for razoável.

**Abordagem na stack.** recharts-custom: `Line connectNulls={false}` mais `ReferenceArea fill="url(#hachura)"` com `pattern` SVG em `defs`; os intervalos sem dado são calculados em TypeScript a partir dos nulos.

**Ponto delicado.** Um ponto válido isolado entre nulos não desenha nada, porque não há segmento; forçar `dot` nesses pontos. `connectNulls` liga e esconde a lacuna; só usar numa segunda linha pontilhada. Na camada de dados, nulo e zero se confundem em agregações (soma de nada vira 0), então a API do Farol devolve nulo explícito. Essa é a lição de cobertura do repositório: fill rate baixo pode ser sintoma de coleta, não de base.

**Versões sugeridas.**

1. **Básico.** Leads por dia de uma origem cuja integração caiu por 9 dias.
2. **Com anotação.** CPL de uma plataforma com o período sem coleta hachurado e a causa em nota.
3. **Denso do Farol.** Cobertura de campo (percentual de leads com origem preenchida) por semana, com lacuna e meta de cobertura.
4. **Caso limite.** Pontos isolados entre lacunas e série que começa tarde; comparação lado a lado de `connectNulls` ligado e desligado.

**Referências.**

- Exemplo oficial: [Recharts, Line Chart Connect Nulls](https://recharts.github.io/en-US/examples/LineChartConnectNulls/). Observar lacuna contra ligação sobre o ponto ausente.
- Biblioteca: [Tremor, Line Chart](https://tremor.so/docs/visualizations/line-chart). Observar o exemplo de `connectNulls`.
- Galeria: [AG Charts, Chart Gallery](https://www.ag-grid.com/charts/gallery/). Observar "Line Chart With Gaps" entre as variações de linha.
- Catálogo: [From Data to Viz, Line chart](https://www.data-to-viz.com/graph/line.html). Observar pontos quando as observações são esparsas.

### 3.16 Linha com seleção de janela (brush e zoom)

**Descrição.** Série longa com controle de janela: arrastar para ampliar e minimapa para navegar.

**Anatomia.** Gráfico principal; `Brush` inferior com miniatura; botão "ver tudo"; indicação textual da janela ("2026-03-01 a 2026-05-31").

**Abordagem na stack.** recharts-nativo para `Brush`; recharts-custom para zoom por arraste, com `ReferenceArea` desenhada durante o arraste e domínio recalculado ao soltar (exemplo HighlightAndZoomLineChart).

**Ponto delicado.** Zoom por domínio exige `allowDataOverflow` nos eixos, senão o domínio se reexpande para caber os dados. O domínio y é recalculado para a janela visível, senão a série fica achatada. Em tela executiva, os filtros de período do drawer do Farol substituem o zoom livre; brush é ferramenta de análise.

**Versões sugeridas.**

1. **Básico.** Entradas diárias de 2 anos com `Brush`.
2. **Com destaque.** Zoom por arraste com a janela selecionada refletida nos cartões de KPI da tela.
3. **Denso do Farol.** Entradas, agendas e fechamentos em três painéis sincronizados controlados por um único brush.
4. **Caso limite.** Janela sem dados depois do zoom: estado vazio e botão para restaurar.

**Referências.**

- Exemplo oficial: [Recharts, Highlight And Zoom Line Chart](https://recharts.github.io/en-US/examples/HighlightAndZoomLineChart/). Observar `ReferenceArea` durante o arraste e `allowDataOverflow`.
- Exemplo oficial: [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/). Observar o `Brush` que move gráficos sincronizados.
- Documentação: [Recharts, YAxis API](https://recharts.github.io/en-US/api/YAxis/). Observar `allowDataOverflow`, `domain` por função e `niceTicks`.
- Portal de design: lacuna nesta rodada.

### 3.17 Sobreposição de períodos (ano contra ano)

**Descrição.** O período atual e os anteriores desenhados no mesmo eixo de calendário relativo (semana do ano, dia útil do mês).

**Anatomia.** Atual em cor e traço forte; anteriores em cinza ou tracejado; rótulo direto com o ano; faixa opcional de mínimo e máximo dos anos anteriores.

**Abordagem na stack.** recharts-nativo: dados pivotados em TypeScript por posição relativa (`semana`, `a2025`, `a2026`) e uma `Line` por ano.

**Ponto delicado.** Alinhar por semana ISO ou dia útil, não por data civil, quando o negócio segue dias úteis; feriados móveis deslocam picos. Ano corrente incompleto termina em nulo. A semana 53 existe em alguns anos e precisa de tratamento explícito.

**Versões sugeridas.**

1. **Básico.** Agendas por semana ISO, 2026 contra 2025.
2. **Com destaque.** Receita acumulada por dia útil do mês corrente contra a média dos 6 meses anteriores.
3. **Denso do Farol.** Entradas semanais de 2026 sobre a faixa de mínimo e máximo de 2023 a 2025 (combina com o modelo 6).
4. **Caso limite.** Ano com semana 53 e mês de 18 dias úteis contra mês de 22, com normalização declarada.

**Referências.**

- Exemplo oficial: [Recharts, Compare Two Lines](https://recharts.github.io/en-US/examples/CompareTwoLines/). Observar a comparação tracejada e a diferença exibida no hover.
- Praticante: [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/). Observar a sobreposição para revelar regularidade.
- Galeria: [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line). Observar faixa histórica com a linha do período atual.
- Portal de design: lacuna nesta rodada.

---

## 4. Modelos que moram melhor em outra família

- **Slope chart** (só dois momentos): 17_comparacao-de-pontos. O guia do Datawrapper o descreve como linha simplificada só com os extremos.
- **Arrow plot** (início e fim por categoria): 17_comparacao-de-pontos.
- **Connected scatterplot** (duas métricas ao longo do tempo): 09_dispersao-e-bolhas; aparece como alternativa ao eixo duplo.
- **Sparkline e linha minúscula em cartão**: 24_microvisuais-sparklines.
- **Leque de projeção com bandas aninhadas**: 05_areas (a forma dominante é de área).
- **Área de diferença entre real e meta**: 05_areas.
- **Linha com colunas, eixo duplo e pareto**: 08_combinados-e-eixo-duplo.
- **Calendar heatmap para padrão diário**: 15_mapa-de-calor-e-calendario.
- **Comet chart e trail de largura variável** (listados nos exemplos Vega-Lite): 17_comparacao-de-pontos.
- **Candlestick e OHLC**: fora do escopo do Farol; se surgirem, 16_distribuicao.
- **Linha vertical com tempo no eixo y**: descartada como modelo desta família; em linha do tempo, 20_cronograma-e-linha-do-tempo.

---

## 5. Notas transversais de implementação

- **Tokens do tema escuro.** Cores por variável CSS (`stroke="var(--farol-serie-1)"`), o mesmo padrão do shadcn/ui charts sobre Recharts 3; grade em cor de borda suave; texto de eixo em cor secundária; neutros com contraste suficiente contra o fundo.
- **Formatação única.** Um módulo `format.ts` com `Intl.NumberFormat('pt-BR')` para moeda compacta, percentual e inteiro; eixo, tooltip e rótulo leem o mesmo formatador.
- **Datas.** Série de calendário completa gerada no cliente ou devolvida pela API; `XAxis type="number" scale="time"` quando os intervalos são irregulares.
- **Nulo contra zero.** Contrato de dados explícito: `null` é "não medido", `0` é "medido e zero". Toda linha do Farol respeita isso antes de escolher `connectNulls`.
- **Animação.** `isAnimationActive` aceita `"auto"`, que respeita a preferência do sistema; desligar em séries com mais de mil pontos.
- **Acessibilidade.** A prop `accessibilityLayer` citada na documentação do shadcn/ui charts, título com a conclusão e descrição textual; meta e alerta nunca só por cor (traço, símbolo e rótulo).
- **Customização no Recharts 3.** Os hooks `usePlotArea`, `useChartWidth`, `useChartHeight`, `useOffset` e os de tooltip ativo substituem o antigo `Customized`, segundo o guia oficial; o exemplo AreaChartFillByValue usa `useYAxisScale`. São o caminho para anticolisão de rótulos, gradientes de limiar e anotações calculadas.

---

## 6. Fontes consultadas

Todas abertas nesta rodada, exceto as marcadas com (não abriu).

**Catálogos**
- [Data Viz Catalogue, Line Graph](https://datavizcatalogue.com/methods/line_graph.html)
- [From Data to Viz, Line chart](https://www.data-to-viz.com/graph/line.html)
- [From Data to Viz, Spaghetti plot](https://www.data-to-viz.com/caveat/spaghetti.html)
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary)
- [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization)
- [Wikipedia, Burndown chart](https://en.wikipedia.org/wiki/Burndown_chart)
- [Data Viz Project, Bump Chart](https://datavizproject.com/data-type/bump-chart-2/) (não abriu)

**Praticantes**
- [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph)
- [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis)
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide)
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis)
- [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart)
- [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf)
- [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/)
- [Nightingale, Step Aside Line Graphs And Bar Charts! This Is a Job For Me](https://nightingaledvs.com/step-charts/)
- [Free Range Statistics, Dual axes time series plots may be ok sometimes after all](https://freerangestats.info/blog/2016/08/18/dualaxes)
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/)

**Bibliotecas, galerias e exemplos**
- [Recharts, Examples](https://recharts.github.io/en-US/examples/)
- [Recharts, Compare Two Lines](https://recharts.github.io/en-US/examples/CompareTwoLines/)
- [Recharts, Customized Dot Line Chart](https://recharts.github.io/en-US/examples/CustomizedDotLineChart/)
- [Recharts, Customized Label Line Chart](https://recharts.github.io/en-US/examples/CustomizedLabelLineChart/)
- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/)
- [Recharts, Line Chart With Reference Lines](https://recharts.github.io/en-US/examples/LineChartWithReferenceLines/)
- [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/)
- [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/)
- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/)
- [Recharts, Line Chart Connect Nulls](https://recharts.github.io/en-US/examples/LineChartConnectNulls/)
- [Recharts, Highlight And Zoom Line Chart](https://recharts.github.io/en-US/examples/HighlightAndZoomLineChart/)
- [Recharts, Line API](https://recharts.github.io/en-US/api/Line/)
- [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/)
- [Recharts, ReferenceArea API](https://recharts.github.io/en-US/api/ReferenceArea/)
- [Recharts, YAxis API](https://recharts.github.io/en-US/api/YAxis/)
- [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/)
- [shadcn/ui, Line Charts](https://ui.shadcn.com/charts/line)
- [shadcn/ui, Chart](https://ui.shadcn.com/docs/components/chart)
- [Tremor, Line Chart](https://tremor.so/docs/visualizations/line-chart)
- [nivo, Bump](https://nivo.rocks/bump/)
- [Vega-Lite, Example Gallery](https://vega.github.io/vega-lite/examples/)
- [Vega-Lite, Multi Series Line Chart with Halo Stroke](https://vega.github.io/vega-lite/examples/line_color_halo.html)
- [Vega-Lite, Carbon Dioxide in the Atmosphere](https://vega.github.io/vega-lite/examples/layer_line_co2_concentration.html)
- [Vega-Lite, Step Chart](https://vega.github.io/vega-lite/examples/line_step.html)
- [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html)
- [Vega-Lite, Line chart with a dashed part](https://vega.github.io/vega-lite/examples/line_dashed_part.html)
- [Vega-Lite, Line Chart with Highlighted Rectangles](https://vega.github.io/vega-lite/examples/layer_falkensee.html)
- [Vega-Lite, Line Charts Showing Ranks Over Time](https://vega.github.io/vega-lite/examples/window_rank.html)
- [Vega-Lite, média móvel sobre valores brutos](https://vega.github.io/vega-lite/examples/layer_line_rolling_mean_point_raw.html)
- [Highcharts, Line chart with data labels](https://www.highcharts.com/demo/highcharts/line-labels)
- [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line)
- [AG Charts, Chart Gallery](https://www.ag-grid.com/charts/gallery/)
- [AG Charts, Line Chart With Labels](https://www.ag-grid.com/charts/gallery/line-with-labels/)
- [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/)
- [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/)

**Portais de design**
- [Behance, LINE CHART DASHBOARD UI DESIGN](https://www.behance.net/gallery/168636537/LINE-CHART-DASHBOARD-UI-DESIGN) (abriu; imagens não inspecionadas)
- [Behance, Sales Management Dashboard](https://www.behance.net/gallery/192233069/Sales-Management-Dashboard) (abriu; imagens não inspecionadas)

**Tentadas sem sucesso e fora da lista acima:** Dribbble (páginas de busca e de tag voltaram vazias pela ferramenta), Figma Community (403), exemplos do Apache ECharts (a página carrega só por script) e Observable Plot (429). Por isso nenhum link dessas fontes aparece no estudo.
