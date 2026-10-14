# Família 05 · Áreas

Catálogo VISUAIS do Farol · estudo granular · 2026-09-14

Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão. Todos os casos de uso abaixo são fictícios e não citam marca real.

Legenda de abordagem usada em todo o arquivo:

- **recharts-nativo**: resolve com componentes e props do Recharts, sem desenho próprio.
- **recharts-custom**: Recharts com `shape`, `label`, `content`, `dataKey` como função ou componente filho que lê os hooks do gráfico.
- **svg-puro**: componente React que desenha SVG com geometria calculada em TypeScript.
- **html-tailwind**: composição em HTML com Tailwind (grades, legendas, painéis, estados vazios).

---

## 1. O que a família responde

A área é uma linha preenchida até uma base; o preenchimento codifica massa. Por isso a família responde perguntas de volume e composição ao longo do tempo: como um total evoluiu e quanto cada parte contribuiu, qual o envelope de valores possíveis, quanto ficou acima ou abaixo de uma referência, e que padrão aparece em muitas séries com pouco espaço.

Perguntas típicas por público do Farol:

- **Comercial:** como a receita reconhecida se divide entre verticais ao longo do ano? Em que meses ficamos acima ou abaixo da meta e quanto isso soma?
- **Pré-vendas:** quanto da demanda semanal passou do teto de capacidade? Como o estoque da fila se compõe por etapa?
- **Marketing:** como o investimento se distribui entre plataformas? A fatia de leads com origem desconhecida caiu depois da correção de coleta?
- **Diretoria:** como o custo em três camadas evoluiu? Qual a faixa de cenários de receita para 2027?

Regra de base: área parte do zero (ou de uma base declarada), porque a leitura é de massa. Quando o total não importa e a pergunta é comparar trajetórias, a resposta mora em 04_linhas (Datawrapper e Storytelling with Data convergem nesse ponto). Com menos de cerca de 10 datas, colunas empilhadas (03_colunas-verticais) leem melhor.

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Área simples com gradiente | Uma série em que o volume importa | Eixo y que não começa em zero | Gradiente forte que parece segunda série |
| 2 | Área empilhada | Total e partes importam, 2 a 6 camadas, 10 ou mais datas | Partes que exigem comparação fina | Camada mais importante no meio; legenda na ordem inversa da pilha |
| 3 | Área 100% | Evolução da participação quando o total não é a notícia | Quando o total mudou muito e isso importa | Tooltip sem valor absoluto; divisão por zero vira 0% |
| 4 | Streamgraph | Muitas categorias, sazonalidade, impressão geral com interação | Leitura de valor exato; tela estática | Mostrar eixo y numérico; camadas pequenas invisíveis |
| 5 | Streamgraph ordenado | A ordem de tamanho muda e essa mudança é a história | Poucos períodos | Trocar ordem sem manter identidade de cor |
| 6 | Faixa (range band) | Mínimo e máximo, perímetros, envelopes | Quando só a média importa | Faixa lida como meta |
| 7 | Leque de projeção | Incerteza que cresce com o horizonte | Projeção sem método | Cenários discretos desenhados como distribuição |
| 8 | Área de diferença acima e abaixo da meta | Ganho e perda contra referência | Referência sem definição por período | Não inserir pontos de cruzamento |
| 9 | Horizon chart | 10 a 50 séries em pouco espaço | Público não treinado; valor exato | Faixas demais e legenda ausente |
| 10 | Áreas sobrepostas | Duas grandezas na mesma unidade | Três ou mais séries | Transparência criando uma terceira cor enganosa |
| 11 | Área divergente (positivos e negativos) | Entradas e saídas, ganhos e perdas por camada | Quando só o saldo importa | Negativos empilhados sobre positivos |
| 12 | Área em degrau | Volumes que mudam em instantes discretos | Grandezas contínuas | Último patamar sem largura |
| 13 | Area bump | Ranking e volume juntos | Mais de 8 itens | Espessura confundida com posição |
| 14 | Pequenos múltiplos de área | Forma de cada parte sem pilha | Quando o total é a notícia | Eixos independentes sem aviso |

---

## 3. Modelos em detalhe

### 3.1 Área simples com gradiente

**Descrição.** Linha preenchida até a base, com gradiente vertical que esmaece para o fundo. O Data Viz Catalogue ressalta que a área enfatiza tendência mais que o valor pontual.

**Anatomia.** Contorno de 2 px; `linearGradient` vertical de cerca de 30% a 0% de opacidade; base em zero; ponto ativo; pontos opcionais nos dados (o exemplo Vega-Lite liga linha e pontos na própria área).

**Abordagem na stack.** recharts-nativo: `AreaChart`, `Area type="monotone" stroke fill="url(#id)"`, `defs` com `linearGradient x1="0" y1="0" x2="0" y2="1"` e duas `stop`.

**Ponto delicado.** Área com eixo truncado distorce a massa; manter o domínio a partir de zero ou `baseValue={0}` (a API aceita número, `dataMin` ou `dataMax`). IDs de gradiente repetidos na mesma página fazem todos os gráficos usarem o primeiro `defs`; gerar ID por instância e remover dois-pontos do `useId()`. No tema escuro, opacidade inicial alta vira mancha; começar entre 0,25 e 0,35. Curvas `natural` e `basis` podem ultrapassar os pontos e cruzar a base; preferir `monotone` ou `linear`.

**Versões sugeridas.**

1. **Básico.** Entradas mensais de leads em 2026.
2. **Com destaque.** Receita reconhecida com o mês corrente em opacidade menor e rótulo "parcial até 2026-09-14".
3. **Denso do Farol.** Área de 90 dias atrás do número principal de um cartão de receita (em tamanho mínimo, o modelo passa para 24_microvisuais-sparklines).
4. **Caso limite.** Resultado mensal com meses negativos: gradiente dividido no zero (ver modelo 8, versão 1).

**Referências.**

- Catálogo: [Data Viz Catalogue, Area Graph](https://datavizcatalogue.com/methods/area_graph.html). Observar a distinção entre áreas agrupadas com base comum e empilhadas.
- Exemplo técnico: [Vega-Lite, Area Chart with Gradient](https://vega.github.io/vega-lite/examples/area_gradient.html). Observar as paradas do gradiente e o contorno na cor final.
- Exemplo técnico: [Vega-Lite, Area Chart with Overlaying Lines and Point Markers](https://vega.github.io/vega-lite/examples/area_overlay.html). Observar linha e pontos como propriedades da própria área.
- Biblioteca: [shadcn/ui, Area Charts](https://ui.shadcn.com/charts/area). Observar as 10 variantes sobre Recharts prontas para copiar.
- Portal de design: [Behance, Line Chart Card Design](https://www.behance.net/gallery/227919755/Line-Chart-Card-Design). A página abriu; imagens não inspecionadas pela ferramenta; observar a relação entre número, variação e área no cartão.

### 3.2 Área empilhada

**Descrição.** Cada série começa onde a anterior termina; o topo da pilha é o total.

**Anatomia.** 2 a 6 camadas; a mais importante na base com cor saturada (Datawrapper recomenda levar o valor mais importante para baixo); demais em tons da mesma família; "outros" no topo; legenda e tooltip na ordem visual da pilha, de cima para baixo, com linha de total.

**Abordagem na stack.** recharts-nativo: várias `Area` com o mesmo `stackId`; o primeiro filho fica na base.

**Ponto delicado.** Legenda e tooltip listam na ordem dos filhos (base primeiro), o inverso da leitura visual; usar `itemSorter` ou `content` para inverter e acrescentar o total. Só a camada da base tem referência comum; as do meio não (Data Viz Catalogue e Storytelling with Data), então a pergunta "qual camada cresceu" pede pequenos múltiplos (modelo 14). Nulo numa camada deforma as de cima; preencher zero só quando zero é verdadeiro. Negativos não empilham bem nesta forma (modelo 11).

**Versões sugeridas.**

1. **Básico.** Custo mensal em três camadas (direto, alocado, estrutura) em 2026.
2. **Com destaque.** Investimento por plataforma fictícia com a plataforma de pior CPL qualificado na base em cor de acento, demais neutras.
3. **Denso do Farol.** Estoque diário da fila de pré-vendas por etapa (novo, em cadência, aguardando agenda, reagendar) em 120 dias, com o teto de capacidade em linha por cima (combinação de 08).
4. **Caso limite.** 11 origens de lead: as 5 menores somadas em "outras" pela regra "participação abaixo de 3% no período", escrita no rodapé.

**Referências.**

- Catálogo: [Data Viz Catalogue, Stacked Area Graph](https://datavizcatalogue.com/methods/stacked_area_graph.html). Observar a dificuldade de ler as camadas do meio e a ausência de negativos.
- Catálogo: [From Data to Viz, Stacked area](https://www.data-to-viz.com/graph/stackedarea.html). Observar a influência da ordem das camadas e a alternativa de pequenos múltiplos.
- Praticante: [Datawrapper, What to consider when creating area charts](https://www.datawrapper.de/blog/area-charts). Observar "mais importante embaixo", agrupamento em "outros" e colunas quando há poucas datas.
- Praticante: [Storytelling with Data, what is an area graph](https://www.storytellingwithdata.com/blog/2020/4/9/what-is-an-area-graph). Observar a ambiguidade de base em áreas empilhadas.
- Exemplo oficial: [Recharts, Stacked Area Chart](https://recharts.github.io/en-US/examples/StackedAreaChart/). Observar `stackId` compartilhado.

### 3.3 Área 100%

**Descrição.** Área empilhada normalizada: cada instante soma 100%; mostra participação.

**Anatomia.** Eixo y de 0 a 100%; rótulos das camadas dentro da área onde houver espaço; tooltip com percentual e valor absoluto; painel auxiliar de total opcional.

**Abordagem na stack.** recharts-nativo: `AreaChart stackOffset="expand"`, `YAxis tickFormatter` em percentual e `Tooltip content` que calcula a razão de cada item sobre o total, como no exemplo PercentAreaChart.

**Ponto delicado.** A normalização acontece no render; o payload do tooltip continua absoluto, então o percentual é calculado no `content`. Instante com total zero gera divisão por zero; tratar como lacuna, não como 0%. A forma esconde o total: se ele caiu pela metade, a área 100% não mostra; parear com painel de total sincronizado quando isso importar. A camada "sem informação" fica no topo, com hachura (`pattern` SVG em `defs`), para não ser lida como categoria real.

**Versões sugeridas.**

1. **Básico.** Participação do investimento por plataforma mês a mês.
2. **Com destaque.** Leads com origem desconhecida em camada hachurada no topo, caindo depois da correção de coleta, com a data anotada.
3. **Denso do Farol.** Leads por origem com cobertura de dado, semanal, 8 origens mais "sem origem", e painel de total sincronizado abaixo.
4. **Caso limite.** Semanas sem nenhum lead (total zero) marcadas como lacuna, e não como 0%.

**Referências.**

- Exemplo oficial: [Recharts, Percent Area Chart](https://recharts.github.io/en-US/examples/PercentAreaChart/). Observar `stackOffset="expand"` e o tooltip que calcula o percentual.
- Exemplo técnico: [Vega-Lite, Normalized Stacked Area Chart](https://vega.github.io/vega-lite/examples/stacked_area_normalize.html). Observar `stack: normalize`.
- Galeria: [AG Charts, 100% Stacked Area Chart](https://www.ag-grid.com/charts/gallery/100--stacked-area/). Observar `normalizedTo` e o tooltip com unidade original.
- Galeria: [Highcharts, Percentage area](https://www.highcharts.com/demo/highcharts/area-stacked-percent). Observar a leitura de composição sem total.
- Praticante: [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart). Observar a opção "stack to 100%" e o destaque de períodos.

### 3.4 Streamgraph

**Descrição.** Área empilhada deslocada em torno de um eixo central, com forma orgânica. Ganhou notoriedade em 2008 com a peça de bilheteria de cinema de um grande jornal, a partir do trabalho de Lee Byron e Martin Wattenberg; a base é escolhida para reduzir a oscilação das camadas (Wikipedia). Também chamado de ThemeRiver no Data Viz Catalogue.

**Anatomia.** Sem eixo y numérico (o exemplo Vega-Lite oculta o eixo); eixo x temporal; rótulos dentro das maiores camadas; destaque ao hover; escala de largura de referência opcional.

**Abordagem na stack.** recharts-nativo: `AreaChart stackOffset="wiggle"` (ou `"silhouette"` para simétrico em torno do centro), `YAxis hide`, `Area type="monotone"` com o mesmo `stackId`. A ordem das camadas é decidida em TypeScript antes do render, porque o Recharts empilha na ordem dos filhos e não tem prop de ordenação.

**Ponto delicado.** Ordenar camadas é trabalho de dados (sugestão de implementação: maiores ao centro, alternando lados, ou por período de pico); a escolha muda muito a forma. O y renderizado não tem significado; o tooltip precisa dar o valor absoluto de cada camada. Só aceita positivos. Dados sem padrão temporal viram uma faixa monótona sem leitura (From Data to Viz). Estático, perde utilidade; a interação de destaque é o que torna a forma legível. Storytelling with Data alerta que a forma perde detalhe, eixo rotulado e comparação entre anos.

**Versões sugeridas.**

1. **Básico.** Leads por 12 campanhas fictícias em 52 semanas, com destaque da camada ao hover.
2. **Com anotação.** A mesma forma com dois picos sazonais anotados.
3. **Denso do Farol.** 30 criativos com rótulos só nas 6 maiores camadas; o restante em tons neutros.
4. **Caso limite.** Criativos que entram e saem ao longo do período, gerando camadas finas; agrupamento em "outros" abaixo de um limiar de participação.

**Referências.**

- Praticante: [Lee Byron, Stacked Graphs: Geometry and Aesthetics](https://leebyron.com/streamgraph/). Observar a relação entre estética e legibilidade e as técnicas de cor e ordem citadas no artigo.
- Catálogo: [Wikipedia, Streamgraph](https://en.wikipedia.org/wiki/Streamgraph). Observar a minimização de oscilação e a limitação a valores positivos.
- Catálogo: [Data Viz Catalogue, Stream Graph](https://datavizcatalogue.com/methods/stream_graph.html). Observar os problemas de legibilidade com muitos dados.
- Catálogo: [From Data to Viz, Streamgraph](https://www.data-to-viz.com/graph/streamgraph.html). Observar variações com base zero e percentual.
- Exemplo técnico: [Vega-Lite, Streamgraph](https://vega.github.io/vega-lite/examples/stacked_area_stream.html). Observar `stack: center` e eixo y oculto.
- Documentação: [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/). Observar os valores de `stackOffset`: `expand`, `silhouette`, `wiggle`, `sign`, `none`, `positive`.
- Biblioteca: [nivo, Stream](https://nivo.rocks/stream/). Observar os tipos de deslocamento (silhouette, wiggle, expand, diverging, none) e as opções de ordem.
- Galerias: [Highcharts, Streamgraph](https://www.highcharts.com/demo/highcharts/streamgraph) e [RAWGraphs, How to make a streamgraph](https://www.rawgraphs.io/learning/how-to-make-a-streamgraph). Observar offset, interpolação e ordenação como parâmetros de primeira classe.
- Praticante: [Storytelling with Data, what is an area graph](https://www.storytellingwithdata.com/blog/2020/4/9/what-is-an-area-graph). Observar a crítica: chama atenção, mas insight exige gráficos e anotações adicionais.
- Catálogo: [Data Viz Project, Stream Graph](https://datavizproject.com/data-type/stream-graph/) (não abriu). Apareceu na busca; a página devolveu 403.

### 3.5 Streamgraph ordenado

**Descrição.** Variação em que, a cada período, as camadas são reordenadas por tamanho; a maior fica sempre na mesma posição (base ou centro).

**Anatomia.** Igual à do streamgraph, com camadas que se atravessam nas trocas de posição.

**Abordagem na stack.** svg-puro. Para cada período, calcular a ordem e as bordas inferior e superior de cada camada; desenhar cada camada como um `path` fechado, segmento a segmento entre períodos, ligando as bordas com curvas cúbicas horizontais. O Recharts não reordena a pilha por período.

**Ponto delicado.** Nas trocas de ordem as camadas se cruzam; a borda de cada camada precisa ser interpolada entre a posição do período t e a do t+1, e a ordem de pintura precisa seguir a ordem de destino para não abrir buracos. A cor da categoria é estável em todos os períodos; empates usam a ordem do período anterior como desempate.

**Versões sugeridas.**

1. **Básico.** Participação de 6 motivos de perda por trimestre, com o maior motivo sempre na base.
2. **Denso do Farol.** 10 origens de lead mensais em 24 meses, com reordenação e destaque ao hover.
3. **Caso limite.** Empates de tamanho em vários períodos, com desempate estável declarado.

**Referências.**

- Catálogo: [Data Viz Project, Sorted Stream Graph](https://datavizproject.com/data-type/sorted-stream-graph/) (não abriu). Apareceu na busca; mesma família de páginas que devolveu 403.
- Biblioteca: [nivo, Stream](https://nivo.rocks/stream/). Observar as opções de ordem das camadas.
- Galeria: [RAWGraphs, How to make a streamgraph](https://www.rawgraphs.io/learning/how-to-make-a-streamgraph). Observar ordenação como parâmetro.
- Portal de design: lacuna nesta rodada.

### 3.6 Faixa (range band)

**Descrição.** Área entre duas bordas (inferior e superior), sem linha central obrigatória; mostra um envelope.

**Anatomia.** Banda em opacidade baixa; bordas finas opcionais; rótulos das bordas ("perímetro amplo", "perímetro restrito"); linha central opcional (quando protagonista, é o modelo 6 de 04_linhas).

**Abordagem na stack.** recharts-nativo: `Area` com `dataKey` que devolve `[inferior, superior]`; a API do Area aceita array para área de faixa.

**Ponto delicado.** `baseValue` é ignorado em área de faixa. Bordas que se cruzam (inferior maior que superior) invertem a área; normalizar com mínimo e máximo em TypeScript ou tratar como área de diferença (modelo 8). O tooltip recebe array. Faixas sobrepostas acumulam opacidade; desenhar da mais larga para a mais estreita.

**Versões sugeridas.**

1. **Básico.** Participação de mercado com faixa entre perímetro restrito e perímetro amplo.
2. **Com destaque.** Envelope de mínimo e máximo das entradas semanais de 2023 a 2025, com 2026 em linha por cima.
3. **Denso do Farol.** Cenários de receita 2027 com faixa entre pessimista e otimista e meta de R$ 10 mi em `ReferenceLine`.
4. **Caso limite.** Períodos em que só uma borda existe (perímetro amplo sem dado): a borda aparece como linha e a faixa é omitida, com nota.

**Referências.**

- Exemplo oficial: [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/). Observar o dataKey em array.
- Documentação: [Recharts, Area API](https://recharts.github.io/en-US/api/Area/). Observar `dataKey` para faixa, `baseValue` e `connectNulls`.
- Galeria: [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/). Observar faixa anual com marcos de eventos.
- Galeria: [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line). Observar faixa com linha média e tooltip com as duas bordas.

### 3.7 Leque de projeção (fan chart)

**Descrição.** Faixas aninhadas que se abrem a partir do último dado real, representando percentis da projeção; a incerteza cresce com o horizonte. O nome vem do relatório de inflação de um banco central em 1997 (Wikipedia), e o FT Visual Vocabulary o lista para incerteza de projeções.

**Anatomia.** Linha real sólida até hoje; bandas aninhadas (por exemplo 50% e 90%) em intensidades da mesma cor, mais forte no centro; mediana tracejada; `ReferenceLine` vertical "hoje"; legenda das probabilidades.

**Abordagem na stack.** recharts-nativo com dados preparados: várias `Area` de faixa (`[p05, p95]`, `[p25, p75]`) da mais larga para a mais estreita, depois `Line` real e `Line` mediana tracejada.

**Ponto delicado.** No ponto de junção todas as faixas colapsam no valor real (inferior igual a superior igual a real), senão o leque nasce solto. Assimetria é informativa (a Wikipedia descreve leques centrados na moda com faixas de maior densidade quando a distribuição é assimétrica). Três cenários discretos não formam distribuição: é uma faixa (modelo 6) com linhas de cenário, e o rótulo precisa dizer isso. Selo de procedência PREMISSA no trecho projetado.

**Versões sugeridas.**

1. **Básico.** Receita reconhecida mensal com leque até dez/2026.
2. **Com destaque.** Meta anual em `ReferenceLine` e a probabilidade de atingi-la escrita no título.
3. **Denso do Farol.** Agendas projetadas com leque contra teto de capacidade em degrau.
4. **Caso limite.** Histórico de menos de 6 meses: o leque abre demais; horizonte truncado e aviso.

**Referências.**

- Catálogo: [Wikipedia, Fan chart (time series)](https://en.wikipedia.org/wiki/Fan_chart_(time_series)). Observar a construção por percentis e o caso assimétrico.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar o fan chart em "Change over Time".
- Exemplo técnico: [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html). Observar banda e linha central em camadas.
- Exemplo oficial: [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/). Observar a base técnica para empilhar faixas.
- Portal de design: lacuna nesta rodada.

### 3.8 Área de diferença acima e abaixo da meta

**Descrição.** O espaço entre a série real e a referência é preenchido com uma cor quando está acima e com outra quando está abaixo.

**Anatomia.** Linha real; meta tracejada; área na cor positiva do tema onde o real supera a meta e na cor de alerta onde fica abaixo; rótulo do saldo acumulado; sinal (+ ou −) no tooltip para não depender só de cor.

**Abordagem na stack.** Dois caminhos, ambos recharts-custom.

- **Referência constante ou série de desvio** (real menos meta): uma `Area` sobre o desvio com `baseValue={0}` e `fill` por gradiente com parada dura na altura do zero. O exemplo AreaChartFillByValue calcula essa altura com `useYAxisScale` e `useChartHeight` e usa `gradientUnits="userSpaceOnUse"`.
- **Meta variável desenhada junto:** duas `Area` de faixa, `acima: [meta, max(real, meta)]` e `abaixo: [min(real, meta), meta]`, depois de inserir em TypeScript os pontos de cruzamento por interpolação linear entre cada par de pontos em que o sinal muda.

**Ponto delicado.** Sem os pontos de cruzamento, a cor só troca no ponto de dado seguinte e surgem triângulos pintados do lado errado. Com `type="monotone"` a curva não passa pelo cruzamento calculado linearmente; usar `type="linear"` neste modelo. Com eixo categórico, o ponto de cruzamento não tem categoria; usar eixo x numérico (timestamps) para poder inserir posições fracionárias.

**Versões sugeridas.**

1. **Básico.** Resultado mensal contra zero com gradiente dividido.
2. **Com destaque.** Receita reconhecida mensal contra meta mensal variável, com o saldo acumulado do ano no título.
3. **Denso do Farol.** SLA diário contra limiar de 90% em 180 dias, com os dias abaixo contados e somados no título.
4. **Caso limite.** Série que cruza a meta várias vezes entre pontos e meta com nulos; comparação lado a lado com e sem cruzamentos inseridos.

**Referências.**

- Exemplo oficial: [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/). Observar o gradiente dividido na razão do zero.
- Galeria: [AG Charts, Range Area Difference Chart With Inverted Style](https://www.ag-grid.com/charts/gallery/range-area-difference-inverted-style/). Observar a opacidade diferente conforme qual série domina.
- Documentação: [Recharts, Area API](https://recharts.github.io/en-US/api/Area/). Observar `baseValue` e `dataKey` em faixa.
- Galeria: [Highcharts, Area with negative values](https://www.highcharts.com/demo/highcharts/area-negative). Observar a leitura de área que cruza o zero.
- Portal de design: lacuna nesta rodada.

### 3.9 Horizon chart

**Descrição.** Área cortada em faixas de mesma altura que são sobrepostas, com negativos espelhados para cima em outra cor; a intensidade da cor indica magnitude. A técnica foi desenvolvida em 2005 como "two-tone pseudo coloring" e popularizada comercialmente com o nome atual (Wikipedia). Stephen Few, em "Time on the Horizon", mostra o raciocínio: partir da linha de uma série com referência no valor inicial, usar matiz para distinguir alta e queda e intensidade em passos discretos para magnitude, chegando a cerca de 50 séries legíveis numa tela.

**Anatomia.** Linhas baixas (20 a 40 px) empilhadas; 2 a 4 faixas; matiz para sinal e intensidade discreta para magnitude; nome da série à esquerda; legenda de faixas ("cada faixa = 10%"); separação sutil entre linhas.

**Abordagem na stack.** recharts-custom para poucas linhas: para cada faixa k, uma `Area` com `dataKey={(d) => clamp(d.v - k * passo, 0, passo)}` e `YAxis hide domain={[0, passo]}`, intensidade crescente com k; negativos com a mesma lógica sobre `-v` em outro matiz. É a construção do exemplo Vega-Lite (camadas deslocadas, domínio fixo e recorte), trocando o recorte pelo `clamp`. svg-puro para 20 ou mais linhas: um `path` por faixa com `clipPath` e `transform`, geometria em TypeScript, sem o custo de dezenas de instâncias do Recharts.

**Ponto delicado.** O passo pode ser comum a todas as linhas (comparável) ou próprio de cada uma (forma); declarar. O espelhamento economiza espaço mas depende de matiz forte para o sinal. O número de faixas afeta a precisão; o estudo de Heer, Kong e Agrawala (2009) sobre tamanho e camadas não foi aberto nesta rodada, então começar com 3 e validar com usuários. Tooltip mostra o valor original, não o recortado. Comentários no blog de Few alertam que separadores fracos fazem as linhas vizinhas parecerem escorrer uma na outra.

**Versões sugeridas.**

1. **Básico.** Desvio diário do CPL contra a média de 30 dias em 12 campanhas.
2. **Com destaque.** Clique numa linha expande a série abaixo como linha comum (04_linhas).
3. **Denso do Farol.** SLA diário de 30 squads fictícios contra a meta em 180 dias, ordenados pelo pior trimestre.
4. **Caso limite.** Outlier de 10 vezes o passo: faixa saturada com marcador "fora de escala".

**Referências.**

- Praticante: [Stephen Few, Time on the Horizon](http://www.perceptualedge.com/articles/visual_business_intelligence/time_on_the_horizon.pdf). Observar a construção passo a passo com matiz para sinal e intensidade em passos.
- Praticante: [Stephen Few, Horizon Graphs Revisited](https://www.perceptualedge.com/blog/?p=390). Observar o exemplo de 50 ações com faixas de 10% e as críticas sobre separadores e cores.
- Catálogo: [Wikipedia, Horizon chart](https://en.wikipedia.org/wiki/Horizon_chart). Observar espelhamento, faixas sobrepostas e histórico.
- Exemplo técnico: [Vega-Lite, Horizon Graph](https://vega.github.io/vega-lite/examples/area_horizon.html). Observar duas camadas com `clip` e domínio fixo `[0, 50]`.
- Galeria: [RAWGraphs, How to make a horizon graph](https://www.rawgraphs.io/learning/how-to-make-a-horizon-graph). A página abriu só com a introdução (variação de preços de produtos); observar como ferramenta de referência.
- Pesquisa: [Heer, Kong e Agrawala, Sizing the Horizon](http://vis-ucb-maneesh.stanford.edu/papers/horizon/2009-TimeSeries-CHI.pdf) (não abriu). Apareceu na busca; o certificado do servidor falhou.
- Portal de design: lacuna nesta rodada.

### 3.10 Áreas sobrepostas (não empilhadas)

**Descrição.** Duas áreas da mesma unidade partindo do zero, uma atrás da outra, com transparência.

**Anatomia.** Área de fundo maior e mais clara; área da frente menor e mais saturada; contornos nas duas; rótulos diretos.

**Abordagem na stack.** recharts-nativo: duas `Area` sem `stackId`, com `fillOpacity` distintas; o último filho fica na frente.

**Ponto delicado.** A transparência cria uma terceira cor na interseção que parece categoria; manter contornos fortes e preenchimento leve, ou usar só linhas. O Datawrapper considera áreas não empilhadas mais difíceis de ler e só boas em poucos casos; limitar a duas. Quando a pergunta é o excesso de uma sobre a outra, o modelo 8 responde melhor.

**Versões sugeridas.**

1. **Básico.** Capacidade semanal de agendas (fundo) e agendas realizadas (frente).
2. **Com destaque.** Demanda de entrada contra atendimento, com o período em que a frente passa o fundo anotado.
3. **Caso limite.** A série menor supera a maior em vários trechos e a frente esconde o fundo; comparação com a versão em linhas.

**Referências.**

- Praticante: [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart). Observar a opção de áreas não empilhadas e o controle de opacidade.
- Praticante: [Datawrapper, What to consider when creating area charts](https://www.datawrapper.de/blog/area-charts). Observar quando preferir linha.
- Catálogo: [Data Viz Catalogue, Area Graph](https://datavizcatalogue.com/methods/area_graph.html). Observar as áreas agrupadas sobre base comum.
- Galeria: [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/). Observar quatro áreas sobrepostas a 70% de opacidade com traço de 2 px.

### 3.11 Área divergente (positivos e negativos)

**Descrição.** Camadas positivas empilhadas acima do zero e negativas abaixo, por exemplo entradas e saídas de oportunidades.

**Anatomia.** Linha de zero forte; positivas numa família de cor e negativas em outra; linha de saldo líquido opcional por cima.

**Abordagem na stack.** recharts-nativo: `AreaChart stackOffset="sign"` com `stackId` comum, saídas como valores negativos, `ReferenceLine y={0}`; saldo em `Line` dentro de `ComposedChart`.

**Ponto delicado.** Sem `stackOffset="sign"` as camadas negativas se sobrepõem às positivas. Uma categoria que muda de sinal ao longo do tempo salta de lado e confunde; separá-la em duas chaves (parte positiva e parte negativa). O tooltip mostra saídas com sinal e rótulo explícito. O Data Viz Catalogue lembra que a área empilhada comum não representa negativos, por isso este modelo existe separado.

**Versões sugeridas.**

1. **Básico.** Oportunidades que entram (positivo) e que saem por ganho ou perda (negativo) por semana.
2. **Com destaque.** Saldo líquido em linha, com as semanas de saldo negativo sinalizadas.
3. **Denso do Farol.** Movimento mensal de carteira por vertical, 3 camadas de entrada e 3 de saída, com saldo.
4. **Caso limite.** Categoria que alterna sinal, decomposta em duas chaves com a mesma cor em intensidades diferentes.

**Referências.**

- Documentação: [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/). Observar `stackOffset="sign"`.
- Galeria: [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/). Observar fases anotadas e linha de break even.
- Galeria: [Highcharts, Area with negative values](https://www.highcharts.com/demo/highcharts/area-negative). Observar a leitura de lucro e prejuízo.
- Catálogo: [Data Viz Catalogue, Stacked Area Graph](https://datavizcatalogue.com/methods/stacked_area_graph.html). Observar a limitação a valores positivos.
- Portal de design: lacuna nesta rodada.

### 3.12 Área em degrau

**Descrição.** Área com contorno em degraus; o volume se mantém até a próxima mudança.

**Anatomia.** Contorno em degraus; preenchimento leve; marcos nas mudanças com o motivo.

**Abordagem na stack.** recharts-nativo: `Area type="stepAfter"`; empilhável com `stackId`.

**Ponto delicado.** O mesmo do step em 04_linhas: acrescentar um ponto final na data de corte para o último patamar ter largura, e escolher `stepAfter` quando o valor vale a partir da data. Em pilha, todas as camadas precisam das mesmas datas de mudança, senão os degraus desencontram; gerar a união das datas em TypeScript.

**Versões sugeridas.**

1. **Básico.** Teto de capacidade de atendimento da pré-vendas em agendas por semana.
2. **Com destaque.** Headcount por função (SDR, closer, suporte) empilhado em degraus com contratações anotadas.
3. **Caso limite.** Capacidade reduzida temporariamente por férias coletivas, com degrau para baixo e volta.

**Referências.**

- Documentação: [Recharts, Area API](https://recharts.github.io/en-US/api/Area/). Observar os tipos `step` e `stepAfter` em `type`.
- Praticante: [Nightingale, Step Aside Line Graphs And Bar Charts! This Is a Job For Me](https://nightingaledvs.com/step-charts/). Observar quando o valor não tem intermediário.
- Praticante: [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart). Observar a escolha de interpolação.
- Portal de design: lacuna nesta rodada.

### 3.13 Area bump

**Descrição.** Bump chart em que a espessura da faixa codifica o valor e a posição vertical codifica o ranking (nivo descreve como bump que também mostra valores).

**Anatomia.** Faixas curvas com espaçamento entre posições; rótulos de início e fim; destaque ao hover.

**Abordagem na stack.** svg-puro: por período, ordenar os itens, calcular a espessura proporcional ao valor e empilhar com espaçamento fixo; ligar os períodos com curvas cúbicas horizontais (pontos de controle no meio do intervalo); desenhar cada item como `path` fechado, borda superior de ida e inferior de volta.

**Ponto delicado.** A escala de espessura é comum a todos os períodos; como o total varia, a altura da coluna de faixas varia, então alinhar ao centro ou ao topo e declarar. Nos cruzamentos, desenhar por segmento para que a sobreposição respeite a ordem de destino. Espessura pode ser lida como posição; a legenda precisa dizer as duas codificações.

**Versões sugeridas.**

1. **Básico.** 6 plataformas de mídia fictícias por investimento trimestral.
2. **Com destaque.** Plataforma selecionada em cor, demais com opacidade reduzida.
3. **Caso limite.** Item com valor zero num período: espessura mínima de 1 px ou interrupção, com regra declarada.

**Referências.**

- Biblioteca: [nivo, AreaBump](https://nivo.rocks/area-bump/). Observar ranking e valor na mesma forma.
- Biblioteca: [nivo, Bump](https://nivo.rocks/bump/). Observar a versão só de ranking para comparar.
- Catálogo: [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization). Observar bump area chart como tipo próprio.
- Portal de design: lacuna nesta rodada.

### 3.14 Pequenos múltiplos de área

**Descrição.** Uma área por categoria, em grade, com o mesmo eixo; alternativa à pilha quando a trajetória de cada parte importa.

**Anatomia.** Grade de painéis; eixo y comum; título curto em cada painel; painel de total opcional no início; destaque do painel selecionado.

**Abordagem na stack.** html-tailwind com recharts-nativo: `grid` com `AreaChart` pequenos, domínio calculado globalmente em TypeScript e `syncId` para cursor comum.

**Ponto delicado.** Domínio comum é obrigatório para comparar nível; ordenar os painéis por relevância (maior total ou maior variação), não alfabeticamente. Com 12 ou mais painéis, eixos só nas bordas da grade e animação desligada.

**Versões sugeridas.**

1. **Básico.** Leads por origem em 8 painéis, 52 semanas.
2. **Com destaque.** Cada painel com a média do grupo em linha cinza.
3. **Denso do Farol.** Custo por camada e por vertical numa grade 3 por 3.
4. **Caso limite.** Origem criada há poucas semanas, com painel curto e nota "desde 2026-06".

**Referências.**

- Praticante: [Storytelling with Data, what is an area graph](https://www.storytellingwithdata.com/blog/2020/4/9/what-is-an-area-graph). Observar áreas em pequenos múltiplos como uso recomendado.
- Catálogo: [From Data to Viz, Stacked area](https://www.data-to-viz.com/graph/stackedarea.html). Observar pequenos múltiplos como alternativa superior para cada grupo.
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide). Observar a divisão em painéis quando há sobreposição.
- Biblioteca: [Tremor, Area Chart](https://tremor.so/docs/visualizations/area-chart). Observar `type` default, stacked e percent e `fill` gradient, solid ou none.
- Portal de design: [Behance, Universal Data Visualization](https://www.behance.net/gallery/131066689/Universal-Data-Visualization). A página abriu (kit de Figma com dashboards e mais de 100 componentes); imagens não inspecionadas.

---

## 4. Modelos que moram melhor em outra família

- **Colunas empilhadas** com menos de cerca de 10 datas: 03_colunas-verticais (Datawrapper).
- **Ridgeline e joyplot** (distribuições deslocadas): 16_distribuicao.
- **Área com linha** quando as unidades diferem ou há eixo duplo: 08_combinados-e-eixo-duplo.
- **Sparkarea em cartão**: 24_microvisuais-sparklines.
- **Mosaico ao longo do tempo** (largura igual ao total): 26_mosaico-marimekko.
- **Área radial**: 07_rosca-e-radial ou 18_radar.
- **Participação num único instante**: 22_unidades-waffle-e-pictograma ou 06_pizza.
- **Linha com banda de intervalo** em que a linha é protagonista: 04_linhas, modelo 6.

---

## 5. Notas transversais de implementação

- **Ordem coerente.** Pilha, legenda e tooltip na mesma ordem de leitura; o Recharts lista pela ordem dos filhos, então inverter na apresentação.
- **IDs de `defs`.** Gradientes e padrões de hachura com ID único por instância, sem dois-pontos.
- **Hachura para "sem dado".** Um `pattern` SVG compartilhado pelo tema escuro, com traço fino e contraste testado; nunca cor sólida de categoria.
- **Nulos em pilha.** Decidir antes do render se o nulo é zero verdadeiro (preencher) ou lacuna (interromper todas as camadas daquele instante).
- **`stackOffset` do Recharts.** `none` (padrão), `expand` (100%), `wiggle` e `silhouette` (streamgraph), `sign` (positivos para cima e negativos para baixo), `positive` (ignora negativos), conforme a API do ComposedChart.
- **Base.** `baseValue` vale para áreas simples não empilhadas; é ignorado em pilhas e faixas.
- **Performance.** Streamgraph e horizon com dezenas de camadas: desligar animação, reduzir pontos por agregação e considerar svg-puro.
- **Acessibilidade.** Sinal de acima e abaixo com símbolo e texto, não só cor; título com a conclusão.

---

## 6. Fontes consultadas

Todas abertas nesta rodada, exceto as marcadas com (não abriu).

**Catálogos**
- [Data Viz Catalogue, Area Graph](https://datavizcatalogue.com/methods/area_graph.html)
- [Data Viz Catalogue, Stacked Area Graph](https://datavizcatalogue.com/methods/stacked_area_graph.html)
- [Data Viz Catalogue, Stream Graph](https://datavizcatalogue.com/methods/stream_graph.html)
- [From Data to Viz, Area chart](https://www.data-to-viz.com/graph/area.html)
- [From Data to Viz, Stacked area](https://www.data-to-viz.com/graph/stackedarea.html)
- [From Data to Viz, Streamgraph](https://www.data-to-viz.com/graph/streamgraph.html)
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary)
- [Wikipedia, Streamgraph](https://en.wikipedia.org/wiki/Streamgraph)
- [Wikipedia, Horizon chart](https://en.wikipedia.org/wiki/Horizon_chart)
- [Wikipedia, Fan chart (time series)](https://en.wikipedia.org/wiki/Fan_chart_(time_series))
- [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization)
- [Data Viz Project, Stream Graph](https://datavizproject.com/data-type/stream-graph/) (não abriu)
- [Data Viz Project, Sorted Stream Graph](https://datavizproject.com/data-type/sorted-stream-graph/) (não abriu)

**Praticantes e pesquisa**
- [Datawrapper, What to consider when creating area charts](https://www.datawrapper.de/blog/area-charts)
- [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart)
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide)
- [Storytelling with Data, what is an area graph](https://www.storytellingwithdata.com/blog/2020/4/9/what-is-an-area-graph)
- [Lee Byron, Stacked Graphs: Geometry and Aesthetics](https://leebyron.com/streamgraph/)
- [Stephen Few, Time on the Horizon](http://www.perceptualedge.com/articles/visual_business_intelligence/time_on_the_horizon.pdf)
- [Stephen Few, Horizon Graphs Revisited](https://www.perceptualedge.com/blog/?p=390)
- [Nightingale, Step Aside Line Graphs And Bar Charts! This Is a Job For Me](https://nightingaledvs.com/step-charts/)
- [Heer, Kong e Agrawala, Sizing the Horizon](http://vis-ucb-maneesh.stanford.edu/papers/horizon/2009-TimeSeries-CHI.pdf) (não abriu)

**Bibliotecas, galerias e exemplos**
- [Recharts, Stacked Area Chart](https://recharts.github.io/en-US/examples/StackedAreaChart/)
- [Recharts, Percent Area Chart](https://recharts.github.io/en-US/examples/PercentAreaChart/)
- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/)
- [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/)
- [Recharts, Area API](https://recharts.github.io/en-US/api/Area/)
- [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/)
- [shadcn/ui, Area Charts](https://ui.shadcn.com/charts/area)
- [Tremor, Area Chart](https://tremor.so/docs/visualizations/area-chart)
- [nivo, Stream](https://nivo.rocks/stream/)
- [nivo, AreaBump](https://nivo.rocks/area-bump/)
- [nivo, Bump](https://nivo.rocks/bump/)
- [Vega-Lite, Area Chart with Gradient](https://vega.github.io/vega-lite/examples/area_gradient.html)
- [Vega-Lite, Area Chart with Overlaying Lines and Point Markers](https://vega.github.io/vega-lite/examples/area_overlay.html)
- [Vega-Lite, Normalized Stacked Area Chart](https://vega.github.io/vega-lite/examples/stacked_area_normalize.html)
- [Vega-Lite, Streamgraph](https://vega.github.io/vega-lite/examples/stacked_area_stream.html)
- [Vega-Lite, Horizon Graph](https://vega.github.io/vega-lite/examples/area_horizon.html)
- [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html)
- [Highcharts, Percentage area](https://www.highcharts.com/demo/highcharts/area-stacked-percent)
- [Highcharts, Streamgraph](https://www.highcharts.com/demo/highcharts/streamgraph)
- [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line)
- [Highcharts, Area with negative values](https://www.highcharts.com/demo/highcharts/area-negative)
- [AG Charts, 100% Stacked Area Chart](https://www.ag-grid.com/charts/gallery/100--stacked-area/)
- [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/)
- [AG Charts, Range Area Difference Chart With Inverted Style](https://www.ag-grid.com/charts/gallery/range-area-difference-inverted-style/)
- [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/)
- [RAWGraphs, How to make a streamgraph](https://www.rawgraphs.io/learning/how-to-make-a-streamgraph)
- [RAWGraphs, How to make a horizon graph](https://www.rawgraphs.io/learning/how-to-make-a-horizon-graph)

**Portais de design**
- [Behance, Line Chart Card Design](https://www.behance.net/gallery/227919755/Line-Chart-Card-Design) (abriu; imagens não inspecionadas)
- [Behance, Universal Data Visualization](https://www.behance.net/gallery/131066689/Universal-Data-Visualization) (abriu; imagens não inspecionadas)

**Tentadas sem sucesso e fora da lista acima:** Dribbble e Figma Community (vazio ou 403 pela ferramenta), exemplos de themeRiver do Apache ECharts (carregam só por script), difference mark do Observable Plot (429) e demonstração de threshold do visx (página vazia pela ferramenta).
