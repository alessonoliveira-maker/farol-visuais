# Barras horizontais

Barras horizontais comparam grandezas entre categorias discretas: o comprimento codifica o valor, sempre a partir do zero, e a leitura corre da esquerda para a direita, o que acomoda nome longo e lista grande. É a família de ranking, de composição por categoria, de posição contra meta e de variação com sinal, e a mais usada do Farol quando a categoria não é tempo: executivo, motivo de perda, origem de lead, campanha, fila, plataforma. Quando a categoria é período, a família certa é colunas (03); quando a pergunta é a forma de uma série longa, linhas (04).

Estudo de origem: [`_estudo/familias/02_barras-horizontais.md`](../_estudo/familias/02_barras-horizontais.md). Catálogo consolidado: [`_estudo/catalogo/02_barras-horizontais.json`](../_estudo/catalogo/02_barras-horizontais.json). Varredura de portais: seção 02 de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md).

## O que a família responde

* **Comercial:** quem lidera a receita reconhecida do trimestre e por quanto? Quanto cada executivo já fez da própria meta? Por que motivo perdemos, e em que proporção por executivo? Quanto do pipeline está parado há mais de 30 dias?
* **Pré-vendas:** que SDR passa do SLA de primeiro contato? Quanto a velocidade do contato muda a chance de agenda? Em que canal a agenda marcada não acontece? Qual fila caiu na semana?
* **Marketing:** de que origem vem o lead e com que cobertura de dado? O CPL subiu ou caiu em cada plataforma? Quais criativos trazem lead qualificado e a que custo? Como o investimento do mês se divide entre plataformas?
* **Diretoria:** onde cada indicador da meta 2027 está contra a meta? Como as linhas de negócio chegaram à receita acumulada?
* **Handoff:** como vendas avalia a qualidade do lead recebido da pré-vendas, critério por critério e origem por origem?

## Regras que valem para a família inteira

1. **Escala começa em zero.** O comprimento é o dado. Se a escala precisa começar acima de zero, a forma certa é ponto (família 17).
2. **Ordene pelo valor** quando a categoria não tem ordem natural, com desempate estável por nome; respeite a ordem natural quando ela existe (faixa de porte, ponto de escala). O Recharts desenha na ordem do array, então a ordenação é do seletor, em TypeScript. "Outros" entra depois da ordenação, sempre no fim.
3. **Barra horizontal no Recharts é `BarChart layout="vertical"`**, com `XAxis type="number"` e `YAxis type="category" width="auto"`.
4. **Altura derivada do número de categorias:** passo fixo entre 24 e 36 px por barra; acima de uns 25 itens, top N mais uma barra de cauda.
5. **Rótulo direto.** Nome à esquerda ou dentro da barra, valor na ponta; eixo de valor omitido quando toda barra está rotulada; legenda só quando há séries. Nome de categoria nunca some por reticência (TIP-7 do CONTRATO).
6. **Cor com intenção.** Um neutro para o contexto e um destaque vindo de regra de dado, nunca de posição fixa; cor semântica pela polaridade da métrica, não pelo sinal (CPL que sobe é ruim). Só token do Farol, nunca hexadecimal no JSX.
7. **`Cell` está deprecado no Recharts 3.** Cor por item vai pela prop `shape`, com `Rectangle` e `fill` calculado do `payload`.
8. **Zero, nulo e sem coleta nunca se confundem.** Zero medido escreve 0 sem barra e sem `minPointSize`; nulo e sem coleta escrevem indisponível (`formatUnavailable()`); nunca barra zerada no lugar de dado faltante.
9. **Formatação num lugar só:** `formatCurrencyCompact` no rótulo, `formatCurrencyAxis` no tique, `formatPercent` na taxa, `formatPercentPoints` na diferença de proporção e sinal de menos tipográfico (U+2212) na variação.
10. **Tooltip só quando acrescenta.** Com todo valor rotulado, a dica fica para o detalhe que não cabe na tela: composição, n, período, valor original de um percentual.

## Modelos

| # | Modelo | Abordagem | Versões | Pergunta que responde |
|---|---|---|---|---|
| 01 | [Barras simples ordenadas](./01_barras-simples-ordenadas/) | Recharts nativo | 4 | Quem está na frente e por quanto? Inclui destaque por regra de dado contra SLA, cauda agregada e zero separado de indisponível. |
| 02 | [Barras agrupadas](./02_barras-agrupadas/) | Recharts nativo | 4 | Como 2 ou 3 séries se comparam em cada categoria? Inclui entidade contra média por dimensão e pequenos múltiplos por métrica. |
| 03 | [Barras empilhadas](./03_barras-empilhadas/) | Recharts nativo | 4 | Qual o total da categoria e do que ele é feito? Inclui segmento prioritário na base e orçado contra realizado em pilhas agrupadas. |
| 04 | [Barras empilhadas 100%](./04_barras-empilhadas-100/) | Recharts nativo | 4 | Qual a proporção dentro de cada categoria, com o n à vista? Inclui a barra única de composição e o caso de n baixo. |
| 05 | [Barras contra meta](./05_barras-contra-meta/) | Recharts custom | 4 | Quanto cada categoria fez da própria meta, teto ou forecast? Inclui barras sobrepostas, marcador de meta e faixas qualitativas em lista. |
| 06 | [Barras divergentes de sinal](./06_barras-divergentes/) | Recharts custom | 4 | O que puxou para cima e o que puxou para baixo? Inclui pilha por sinal com saldo marcado e word shift de termos. |
| 07 | [Butterfly ou pirâmide](./07_butterfly-piramide/) | Recharts nativo | 4 | Como duas populações se espelham sobre as mesmas faixas? Inclui pirâmide de termos e escalas de grandeza diferentes. |
| 08 | [Divergente empilhada Likert](./08_divergente-empilhada-likert/) | SVG puro | 4 | Como se distribuem as respostas numa escala com polos? Inclui saldo por polo, versão mini por linha e escala par. |
| 09 | [Bar list](./09_bar-list/) | HTML com Tailwind | 4 | Qual o top N compacto em card, com número exato e link? Inclui criativos com dois números e termos com cauda agregada. |
| 10 | [Corrida de barras](./10_corrida-de-barras/) | SVG puro | 3 | Como o ranking mudou ao longo do tempo, em peça de abertura de apresentação? |

São 10 modelos e 39 versões. As pastas dos modelos são criadas quando as versões forem produzidas; até lá os links apontam para o lugar reservado.

Variações absorvidas: barras com destaque (estudo 2.2) é a v2 do modelo 01; barras paralelas por dimensão e pequenos múltiplos de barras por métrica (radar, estudo 18, seções 10 e 11) são as v2 e v4 do modelo 02; empilhadas em grupos (2.7) é a v4 do modelo 03; barra única de composição (2.15) é a v3 do modelo 04; barras sobrepostas (2.4), barras com marcador de meta (2.14) e o marcador de meta dos combinados (estudo 08, seção 3.5) formam o modelo 05; empilhadas por sinal (2.9) e word shift (estudo 21, seção 3.4) são as v2 e v3 do modelo 06; pirâmide de termos (estudo 21, seção 3.5) é a v3 do modelo 07; barra divergente empilhada mini (estudo 24, seção 24.38) é a v3 do modelo 08; lista de barras com rótulo (estudo 14, seção 10) e lista de termos com barras (estudo 21, seção 3.3) viraram as v3 e v4 do modelo 09.

### Versões por modelo

Cada modelo cobre o básico, um caso com destaque ou anotação, um caso denso do Farol e um caso limite. Canvas pelos presets do [CONTRATO](../CONTRATO.md).

| Modelo | Versões (canvas) |
|---|---|
| 01 | v1 receita por executivo (card) · v2 destaque contra SLA (alto) · v3 campanhas com cauda agregada (alto) · v4 zero, indisponível e empate (card) |
| 02 | v1 agendas marcadas e realizadas (card) · v2 executivo contra média por dimensão (card) · v3 leads por origem em três meses (alto) · v4 pequenos múltiplos por métrica (largo) |
| 03 | v1 pipeline por estágio (card) · v2 paradas na base (card) · v3 leads por cobertura de dado (card) · v4 orçado e realizado em grupos (largo) |
| 04 | v1 mix de origem por segmento (card) · v2 motivos de perda por executivo (alto) · v3 barra única do investimento do mês (faixa) · v4 n baixo e sem casos (card) |
| 05 | v1 realizado sobre meta sobreposta (card) · v2 marcador de meta e trimestre anterior (card) · v3 metas 2027 em percentual (largo) · v4 sem meta e acima da meta (card) |
| 06 | v1 variação de CPL por plataforma (card) · v2 movimentação do pipeline com saldo (card) · v3 termos de perda que mais mudaram (alto) · v4 todos os valores negativos (card) |
| 07 | v1 leads e oportunidades por porte (card) · v2 tempo até o primeiro contato (card) · v3 termos em ganhas e perdidas (alto) · v4 escalas de grandeza diferentes (card) |
| 08 | v1 qualidade do lead no handoff (largo) · v2 saldo líquido por polo (largo) · v3 avaliação por origem, mini (alto) · v4 escala par e n baixo (card) |
| 09 | v1 top origens do mês (kpi-alto) · v2 campanhas com link e destaque (card) · v3 criativos com leads e CPL (alto) · v4 termos com cauda agregada (alto) |
| 10 | v1 origens mês a mês (largo) · v2 receita acumulada com marcos (largo) · v3 entrada e saída do top 10 (largo) |

## Guia rápido: qual modelo escolher

| Se a pergunta é... | Use | E não |
|---|---|---|
| Quem lidera uma medida e por quanto | 01 Barras simples ordenadas, versão básica | Ordem alfabética ou ordem do banco |
| Uma categoria carrega a mensagem: a fila que estoura o SLA, a pessoa logada | 01, versão com destaque contra SLA | Uma cor diferente para cada barra |
| Ranking de 40 campanhas num card | 01, versão com cauda agregada | 40 barras espremidas ou `Brush` dentro do card |
| Fila com zero, fila sem coleta e empate no topo | 01, versão zero, indisponível e empate | `minPointSize`, que faz o zero parecer valor |
| Duas ou três séries por categoria | 02 Barras agrupadas | Mais de três barras por grupo |
| Perfil de uma entidade contra a média em várias dimensões | 02, versão executivo contra média | Radar comparativo sobreposto |
| Métricas de unidades diferentes para as mesmas entidades | 02, versão pequenos múltiplos por métrica | Normalizar tudo num eixo só sem aviso |
| Total por categoria e do que ele é feito | 03 Barras empilhadas | Pilha com o segmento importante longe da base |
| Orçado e realizado com a composição de cada um | 03, versão orçado e realizado em grupos | Oito cores para quatro componentes |
| Proporção dentro de cada categoria | 04 Barras empilhadas 100%, com o n escrito | Esconder o n de cada barra |
| Composição de um total único numa faixa de cabeçalho | 04, versão barra única | Pizza espremida numa faixa estreita |
| Realizado contra meta, teto ou forecast próprio de cada linha | 05 Barras contra meta | Duas séries agrupadas sem relação de referência |
| Indicadores de unidades diferentes contra a meta | 05, versão metas 2027 em percentual | Faixas em verde, amarelo e vermelho |
| Uma medida só contra a meta, como assunto do card | Família 13, progresso, meta e gauge | Lista de uma linha só |
| Subiu ou caiu, com os dois sinais | 06 Barras divergentes, com domínio simétrico | Cor pelo sinal em métrica de custo |
| De onde vem o saldo: entradas contra saídas | 06, versão movimentação com saldo | Obrigar o leitor a subtrair de cabeça |
| Termos que mais mudaram entre dois períodos | 06, versão word shift | Duas nuvens de palavras lado a lado |
| Duas populações sobre as mesmas faixas | 07 Butterfly ou pirâmide | Sinal negativo vazando para rótulo, eixo ou dica |
| Termos citados por dois grupos | 07, versão termos em ganhas e perdidas | Contagem absoluta sem normalizar pelo tamanho do grupo |
| Lados com ordens de grandeza muito diferentes | 07, versão escalas independentes | Escala comum que apaga o lado pequeno |
| Distribuição de respostas numa escala com polos | 08 Divergente empilhada Likert, neutro em coluna própria | Neutro dividido ao meio sem dizer na legenda |
| Qual item tem mais resposta positiva, com precisão | 04 Barras empilhadas 100% | 08, que desalinha as bases dos segmentos |
| Avaliação por linha em card ou tabela densa | 08, versão mini | Um gráfico com eixo para cada linha |
| Top N compacto em card, com número exato e link | 09 Bar list | BarChart com nome truncado no eixo |
| Termos mais citados em texto livre | 09, versão termos com cauda agregada | Nuvem de palavras |
| Como o ranking mudou no tempo, para abrir apresentação | 10 Corrida de barras, com pausa e quadro final | Corrida em painel de uso diário |
| Como o ranking mudou no tempo, para analisar | Bump chart da família 04 ou slope da família 17 | 10 Corrida de barras |

## Quando a família serve

* A categoria é discreta e sem eixo de tempo, e o comprimento a partir do zero é o dado.
* O nome da categoria é longo: pessoa, campanha, motivo de perda, criativo, fila.
* Há de 3 a cerca de 25 categorias; acima disso, top N com uma barra de cauda.
* O leitor quer ranking, composição, posição contra referência ou variação com sinal por categoria.

## Quando procurar outra família

* **A categoria é período**, e o volume de cada mês é o assunto: colunas, família **03**.
* **Forma de uma série longa** no tempo: linhas, família **04**.
* **Escala que não começa em zero**, dois pontos por categoria, faixa de mínimo a máximo ou lista longa de valores parecidos: comparação de pontos, família **17**.
* **Uma medida só contra teto ou meta**, ocupação de 0 a 100% ou bullet isolado: progresso e meta, família **13**.
* **Etapas sequenciais** com taxa de passagem: funil, família **10**.
* **Como um total se formou passo a passo**: cascata, família **19**.
* **Barras entre duas datas**: cronograma, família **20**.
* **Distribuição de uma variável contínua** em faixas coladas: histograma, família **16**.
* **Empilhada 100% em que a espessura também codifica volume**: marimekko, família **26**.
* **Barra dentro de célula de tabela** com várias colunas e ordenação: tabelas visuais, família **14**.
* **Barra enrolada num arco**: rosca e radial, família **07**, com perda de precisão.
* **Barra minúscula sem eixo** em cartão: microvisuais, família **24**.

## Referências cruzadas

Formatos que o estudo desta família levantou e que moram em outro lugar do catálogo:

| Formato | Destino | Por quê |
|---|---|---|
| Barras com trilho (estudo 2.13) | [13/01 Barra de progresso e capacidade contra teto](../13_progresso-meta-e-gauge/01_barra-de-progresso-linear/) | O trilho só faz sentido com teto real, e a folga até o teto é o assunto: ocupação de 0 a 100% ou capacidade de fila. |
| Barra de faixa, span (estudo 2.16) | [17/04 Range plot](../17_comparacao-de-pontos/04_range-plot/) | A barra não parte do zero; flutua entre mínimo e máximo, e a leitura passa a ser de posição, não de comprimento. |
| Lollipop horizontal (estudo 2.17) | [17/05 Lollipop](../17_comparacao-de-pontos/05_lollipop/) | Haste e ponto reduzem a tinta em listas longas de valores parecidos; o valor mora no centro do ponto. |
| Gantt | [20/01 Gantt](../20_cronograma-e-linha-do-tempo/01_gantt/) | Geometricamente é a barra de faixa; semanticamente é cronograma entre duas datas. |
| Funil e barras afuniladas | [10/01 Funil em barras com taxa de passo](../10_funil/01_funil-em-barras-com-taxa-de-passo/) | Barras decrescentes com taxa de passagem entre etapas sequenciais. |
| Cascata horizontal | [19 Cascata (waterfall)](../19_cascata-waterfall/) | Barras flutuantes encadeadas mostrando como um total se forma. |
| Histograma horizontal | [16/01 Histograma](../16_distribuicao/01_histograma/) | Barras coladas sobre eixo contínuo binado; confundir com barra de categoria é erro listado no Data to Viz. |
| Marimekko e mosaico | [26/01 Marimekko 100% e mosaico](../26_mosaico-marimekko/01_marimekko-e-mosaico/) | Empilhada 100% em que a espessura da barra também codifica valor. |

Também citados na seção "Modelos que moram melhor em outra família" do estudo:

| Formato | Destino | Por quê |
|---|---|---|
| Dumbbell | [17/03 Dumbbell e arrow plot](../17_comparacao-de-pontos/03_dumbbell/) | Dois pontos por categoria; o dado é a distância entre dois estados. |
| Bullet graph de uma medida só | [13/02 Bullet chart](../13_progresso-meta-e-gauge/02_bullet-chart/) | Com uma medida e faixas qualitativas como assunto do card, mora em 13; em lista de categorias, é o modelo 05. |
| Barra dentro de célula de tabela | [14 Tabelas visuais](../14_tabelas-visuais/) | Microvisual numa linha de tabela densa, com cabeçalho e ordenação; empresta o desenho dos modelos 09 e 05. |
| Barra radial e progresso em arco | [07 Rosca e radial](../07_rosca-e-radial/) | A mesma leitura do trilho enrolada num arco, com perda de precisão. |

Formatos de outras famílias que vieram morar aqui:

| Origem | Formato | Onde ficou |
|---|---|---|
| 08 Combinados e eixo duplo | Barras com marcador de meta (estudo 3.5) | Modelo 05, v2 com marcador de meta e trimestre anterior, e v4 sem meta |
| 14 Tabelas visuais | Lista de barras com rótulo (estudo 10) | Modelo 09, v3 criativos e v4 cauda agregada |
| 18 Radar | Barras paralelas por dimensão (estudo 10) | Modelo 02, v2 executivo contra média |
| 18 Radar | Pequenos múltiplos de barras por métrica (estudo 11) | Modelo 02, v4 |
| 21 Texto e nuvem de palavras | Lista de termos com barras (estudo 3.3) | Modelo 09, v4 |
| 21 Texto e nuvem de palavras | Word shift (estudo 3.4) | Modelo 06, v3 |
| 21 Texto e nuvem de palavras | Pirâmide de termos entre dois grupos (estudo 3.5) | Modelo 07, v3 |
| 23 Mapas | Barras por UF agrupadas por região, quando a pergunta é ranking | Modelo 01 |
| 24 Microvisuais e sparklines | Barra divergente empilhada mini (estudo 24.38) | Modelo 08, v3 |
| 26 Mosaico e marimekko | Empilhada 100% sem espessura variável | Modelo 04; em colunas, 03/04 |

## Referências

Todos os links vêm do [estudo da família](../_estudo/familias/02_barras-horizontais.md), dos estudos das famílias de onde vieram as variações absorvidas ([08](../_estudo/familias/08_combinados-e-eixo-duplo.md), [14](../_estudo/familias/14_tabelas-visuais.md), [18](../_estudo/familias/18_radar.md), [21](../_estudo/familias/21_texto-e-nuvem-de-palavras.md) e [24](../_estudo/familias/24_microvisuais-sparklines.md)) e da [varredura de portais de design](../_estudo/00_portais-de-design.md). Bibliotecas fora da stack do Farol (Vega Lite, ECharts, Highcharts, AG Charts, Tremor, Flourish, Shifterator) aparecem como referência de método e de comportamento, nunca como dependência. "Não abriu" quer dizer que o endereço veio de busca e a página não carregou ou não foi aberta durante a pesquisa; "só metadados" quer dizer que a página abriu sem texto do designer, e as imagens precisam ser conferidas antes de adotar.

### 01 Barras simples ordenadas

* [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar "Ordered bar" na categoria Ranking e a preferência por barra quando o rótulo é longo.
* [Data to Viz, barplot](https://www.data-to-viz.com/graph/barplot.html) e [caveat de ordenação](https://www.data-to-viz.com/caveat/order_data.html): observar os erros listados, não ordenar e confundir barra com histograma.
* [Vega Lite, barra agregada ordenada](https://vega.github.io/vega-lite/examples/bar_aggregate_sort_by_encoding.html): observar `sort: "-x"`, a ordenação declarativa que no Recharts vira ordenação em TypeScript.
* [Vega Lite, barras cinza com rótulo sobreposto](https://vega.github.io/vega-lite/examples/layer_bar_labels_grey.html): observar a base toda em cinza, que é o ponto de partida do destaque.
* [Storytelling with Data, what is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart): observar horizontal para rótulo longo, zero obrigatório, rótulo na ponta e cor combinada com palavra no título.
* [Stephen Few, Bar Widths and the Spaces in Between (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf): observar o respiro perto de 50% da espessura e o efeito da largura na percepção do comprimento.
* [Recharts, VerticalComposedChart](https://recharts.github.io/en-US/examples/VerticalComposedChart/) e [shadcn, chart-bar-horizontal.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-horizontal.tsx): observar `layout="vertical"` com o eixo de categoria no `YAxis`.
* [shadcn, chart-bar-active.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-active.tsx) e [Recharts, BarChartWithCustomizedEvent](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/): observar `shape` com `Rectangle` e estado ativo; no Farol o estado do destaque mora no pai, não no shape.
* [Recharts, Cell (deprecado)](https://recharts.github.io/en-US/api/Cell/) e [shadcn, chart-bar-mixed.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-mixed.tsx): observar a migração da cor por item para `shape` ou para um campo `fill` no próprio dado.
* Portal de design: [Dribbble, Horizontal Bar Chart](https://dribbble.com/shots/6969622-Horizontal-Bar-Chart): observar as cinco razões do designer para a barra horizontal: pontas comparáveis, diferença incremental visível, rótulo longo que cabe, leitura da esquerda para a direita e zero ruído.
* Portal de design: [Behance, Bar Chart Design in Figma](https://www.behance.net/gallery/145652823/Bar-Chart-Design-in-Figma) (só metadados): observar espaçamento e rótulos numa peça de UI.
* Portal de design: [Behance, Interactive Hover Bar Chart for Job Statistics](https://www.behance.net/gallery/212978419/Interactive-Hover-Bar-Chart-for-Job-Statistics) (só metadados): observar o estado de hover como destaque.

### 02 Barras agrupadas

* [Data Viz Catalogue, Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html): observar o alerta de legibilidade com muitas barras por grupo.
* [Vega Lite, barras agrupadas](https://vega.github.io/vega-lite/examples/bar_grouped.html): observar `xOffset` como canal de agrupamento.
* [Nightingale, Beyond the Bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): observar dumbbell e slope como saída quando a pergunta é mudança entre dois momentos.
* [Edward Tufte, cancer survival rates: tables, slopegraphs, barcharts](https://www.edwardtufte.com/notebook/cancer-survival-rates-tables-slopegraphs-barcharts/): observar a crítica a barras agrupadas de baixa densidade e a defesa da tabela para poucos números.
* [AG Charts, bar series](https://www.ag-grid.com/charts/react/bar-series/): observar grupo, pilha, normalização e `stackGroup` num só tipo de série.
* [Stephen Few, radar graphs (PDF)](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar a figura de barras com os mesmos dados do radar e a proposta de um gráfico de barras por medida.
* [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/): observar a crítica às áreas sobrepostas e a solução por tabela e pequenos múltiplos.
* [From Data to Viz, a armadilha do spider chart](https://www.data-to-viz.com/caveat/spider.html): observar as alternativas cartesianas sugeridas.
* [Storytelling with Data, spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): observar pequenos múltiplos como formato preferível à sobreposição.
* Portal de design: [Behance, Sales Dashboard](https://www.behance.net/gallery/194252083/Sales-Dashboard) (só metadados): observar barras de vendas em painel. Para as duas variações vindas do radar, o estudo 18 não achou referência específica verificada em portal.

### 03 Barras empilhadas

* [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html): observar os dois tipos, simples e 100%, e a perda de legibilidade com muitos segmentos.
* [Data to Viz, o problema de empilhar](https://www.data-to-viz.com/caveat/stacking.html): observar que só a série da base tem linha de base estável.
* [ECharts, barras horizontais empilhadas (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-y-category-stack.ts): observar rótulo por segmento, foco por série no hover e o nome da pilha como string livre, que permite dois grupos no mesmo eixo.
* [Storytelling with Data, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars): observar "o segmento mais importante na base" e o contraste do rótulo.
* [Stephen Few, displays for combining time series and part to whole (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf): observar por que linhas conectando segmentos não resolvem a leitura do meio da pilha.
* [Recharts, BarStack](https://recharts.github.io/en-US/api/BarStack/): observar `radius` aplicado ao contorno da pilha e a precedência do `stackId`.
* [Recharts, Bar, prop stackId](https://recharts.github.io/en-US/api/Bar/): observar que barras com o mesmo `axisId` e o mesmo `stackId` empilham, o que torna o agrupamento de pilhas uma questão de nomear os `stackId`.
* [AG Charts, bar series](https://www.ag-grid.com/charts/react/bar-series/): observar `stackGroup`, que é a pilha agrupada num único tipo de série.
* [IBCS 2.0](https://www.ibcs.com/ibcs-version-2-0/): observar a notação de cenários, plano e realizado no mesmo lugar com formas diferentes (a página só resume a norma).
* Portal de design: [Behance, stacked bar chart](https://www.behance.net/gallery/43416395/stacked-bar-chart) (só metadados): observar a peça dedicada ao formato.
* Portal de design: [Dribbble, tag barchart](https://dribbble.com/tags/barchart) (listagem de tag): observar tratamentos de pilha dupla em cards estreitos.

### 04 Barras empilhadas 100%

* [Vega Lite, barra horizontal normalizada com rótulos](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html): observar o rótulo centrado no segmento.
* [ECharts, normalização de pilha (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-stack-normalization.ts): observar a normalização feita no dado, antes do gráfico.
* [Storytelling with Data, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars): observar a vantagem das duas linhas de base e a recomendação de rotular direto e limitar segmentos.
* [Recharts, BarChart API](https://recharts.github.io/en-US/api/BarChart/) e [Tremor, BarChart](https://tremor.so/docs/visualizations/bar-chart): observar `stackOffset="expand"` e `type="percent"`.
* [Tremor, CategoryBar](https://www.tremor.so/docs/visualizations/category-bar): observar a entrada de 0 a 100, o marcador que some quando o valor é zero e a cor do marcador herdada do segmento.
* [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html): observar que a barra única é o caso degenerado da empilhada, com uma categoria só.
* Portal de design: [Behance, busca por stacked bar chart](https://www.behance.net/search/projects/stacked%20bar%20chart) (listagem): observar a variedade de tratamentos de segmento.
* Portal de design: [Figma Community, DarkMode Dashboard Design](https://www.figma.com/community/file/1281961549597623375/darkmode-dashboard-design): observar barras de composição em cabeçalho sobre fundo escuro.

### 05 Barras contra meta

* [Vega Lite, barras em camadas transparentes](https://vega.github.io/vega-lite/examples/bar_layered_transparent.html): observar `stack: null` e opacidade para sobrepor realizado e referência.
* [Highcharts, colunas sobrepostas (código da demo)](https://raw.githubusercontent.com/highcharts/highcharts/master/samples/highcharts/demo/column-placement/demo.js): observar `grouping: false`, `pointPadding` e `pointPlacement` para meta atrás e realizado na frente.
* [Wikipedia, bullet graph](https://en.wikipedia.org/wiki/Bullet_graph): observar os componentes do formato, as intensidades de um único matiz por acessibilidade e a origem como substituto de gauge.
* [Stephen Few, Bullet Graph Design Specification (PDF)](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf) (baixou como binário na pesquisa; abrir num leitor): observar a medida principal com cerca de um terço da espessura, a comparativa como linha curta perpendicular e de 2 a 5 faixas.
* [Storytelling with Data, what is a bullet graph](https://www.storytellingwithdata.com/blog/what-is-a-bullet-graph): observar a versão simplificada sem faixas, com barras sobrepostas, para público que não conhece o formato.
* [Clearly and Simply, an alternative design of bullet graphs](https://www.clearlyandsimply.com/2017/05/an-alternative-design-of-bullet-graphs/) (não abriu): observar a crítica ao excesso de faixas e o desenho enxuto.
* [IBCS 2.0](https://www.ibcs.com/ibcs-version-2-0/): observar a notação de cenários (realizado, plano, previsão), fundamento da convenção sólido contra contorno.
* [Vega Lite, Bullet Chart](https://vega.github.io/vega-lite/examples/facet_bullet.html): observar as camadas de faixa, medida e marcador de meta.
* [AG Charts, Bullet Chart](https://www.ag-grid.com/charts/gallery/simple-bullet/): observar o marcador de meta e os valores acima e abaixo dela.
* [Highcharts, Bullet graph](https://www.highcharts.com/demo/highcharts/bullet-graph): observar a forma compacta para KPI.
* [Nightingale, Dashboard Redesign: A Look at Chart Choices](https://nightingaledvs.com/dashboard-redesign-a-look-at-chart-choices/): observar a crítica aos velocímetros como barras distorcidas.
* [Recharts, Bar, props background e shape](https://recharts.github.io/en-US/api/Bar/): observar que `background` como função recebe as props do trilho e desenha as faixas sem série extra.
* Portal de design: [Behance, SaaS Dashboard e Analytics](https://www.behance.net/gallery/254777417/SaaS-Dashboard-Analytics-Web-Application) (só metadados): observar o contraste de tons claros e escuros sobre fundo escuro, útil para referência larga e realizado sólido.
* Portal de design: [Figma Community, Dark Theme Dashboard UI Kit with Prototyping](https://www.figma.com/community/file/1185617660562911231/dark-theme-dashboard-ui-kit-with-prototyping): observar o tratamento do marcador de meta em componentes de painel escuro.

### 06 Barras divergentes de sinal

* [Vega Lite, índice de exemplos](https://vega.github.io/vega-lite/examples/) e [bar_diverging_stack_transform](https://vega.github.io/vega-lite/examples/bar_diverging_stack_transform.html): observar o deslocamento em torno de um zero calculado, a mesma ideia aplicada a componentes por sinal.
* [Domo, divergent bar charts](https://www.domo.com/learn/charts/divergent-bar-charts) (não abriu): observar a definição de uso e os exemplos de variação positiva e negativa.
* [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html): observar que a pilha comum assume valores do mesmo sinal, o que explica o marcador de saldo na pilha por sinal.
* [Storytelling with Data, what is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart): observar onde colocar o rótulo quando a barra cruza o zero.
* [Stephen Few, displays for combining time series and part to whole (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf): observar a crítica à leitura de componentes sem linha de base comum, mitigada aqui pelo zero central.
* [Recharts, Bar, props shape, radius e stackId](https://recharts.github.io/en-US/api/Bar/): observar o `radius` em array de quatro valores para arredondar só a ponta livre e o empilhamento que respeita o sinal.
* [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar Positive And Negative Bar Chart, esqueleto do word shift.
* [Shifterator, README](https://github.com/ryanjgallagher/shifterator): observar a anatomia de barras por contribuição e os tipos de shift (proporção, entropia, Jensen Shannon).
* [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): observar títulos conversacionais do tipo "mais X que Y", úteis no word shift.
* Portal de design: [Dribbble, tag bar_chart](https://dribbble.com/tags/bar_chart) (listagem de tag): observar cor de polaridade em peças de painel.
* Portal de design: [Dribbble, busca progress-table](https://dribbble.com/search/progress-table) (listagem de busca): observar composições de linha com saldo à direita.

### 07 Butterfly ou pirâmide

* [Data Viz Project, Butterfly Chart](https://datavizproject.com/data-type/butterfly-chart/) (não abriu, HTTP 403): observar a distinção entre borboleta genérica e pirâmide etária.
* [Vega Lite, pirâmide populacional como divergente empilhada](https://vega.github.io/vega-lite/examples/bar_diverging_stack_population_pyramid.html): observar a pirâmide tratada como caso da divergente, com o eixo de categoria no centro.
* [Wikipedia, population pyramid](https://en.wikipedia.org/wiki/Population_pyramid) (não abriu): observar o vocabulário de forma (expansiva, estacionária, construtiva), que também descreve funis comerciais.
* [Observable, about population pyramids](https://observablehq.com/@didoesdigital/15-july-2020-about-population-pyramids) (não abriu): observar variações de desenho e o cuidado com eixos independentes.
* [xD Gov, Data Visualization Standards, population pyramid](https://xdgov.github.io/data-design-standards/visualizations/population-pyramid) (não abriu): observar as regras duras de bins uniformes, no máximo duas cores e eixo de categoria no zero.
* [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar Population Pyramid, com dois `Bar` no mesmo `stackId`, lado A negativo e `Math.abs` no `tickFormatter`.
* [Shifterator, README](https://github.com/ryanjgallagher/shifterator): observar a comparação par a par de textos, base da pirâmide de termos.
* Portal de design: [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1066019348443074842/dashboard-charts-ui-kit): observar componentes espelhados e a grade de três colunas em modo escuro.

### 08 Divergente empilhada Likert

* [Vega Lite, divergente empilhada com neutro](https://vega.github.io/vega-lite/examples/bar_diverging_stack_transform.html): observar a divisão do neutro por dois e a subtração do deslocamento nas duas pontas do segmento, que é exatamente o que o Farol evita ao pôr o neutro em coluna própria.
* [Vega Lite, medianas de escala Likert](https://vega.github.io/vega-lite/examples/layer_likert.html) (listado no índice; não abriu): observar a mediana sobreposta como resumo da distribuição.
* [Datawrapper, the case against diverging stacked bars](https://www.datawrapper.de/blog/divergingbars): observar o argumento central (sem linha de base comum, comparar itens exige conta mental), o perigo de dividir o neutro e a recomendação da 100% com rótulo direto.
* [Data Revelations, rethinking the divergent stacked bar chart](https://www.datarevelations.com/rethinkingdivergent/) (não abriu): observar a proposta de pôr as opiniões fortes junto ao centro e o neutro por fora.
* [Heiberger e Robbins, design of diverging stacked bar charts for Likert scales](https://www.researchgate.net/publication/289590282_Design_of_Diverging_Stacked_Bar_Charts_for_Likert_Scales_and_Other_Applications) (não abriu): observar a defesa formal do formato, contraponto à Datawrapper.
* [microcharts, LikertStrip](https://microcharts.dev/docs/charts/likert-strip) (não abriu): observar a escala Likert como microvisual de célula, base da versão mini.
* [Data Viz Catalogue, chart snapshot diverging bar charts](https://datavizcatalogue.com/blog/chart-snapshot-diverging-bar-charts/) (não abriu): observar as variantes de barra divergente simples e empilhada.
* Portal de design: [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit): observar a versão em modo escuro dos componentes de barra, útil para calibrar a rampa divergente.
* Portal de design: [Dribbble, tag likert scale](https://dribbble.com/tags/likert_scale) (não abriu): observar como a maioria dos desenhos divide o neutro ao meio, que é a escolha a evitar.

### 09 Bar list

* [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist): observar `sortOrder`, `valueFormatter`, `onValueChange`, `href` no item, a largura mínima da barra e o fato de a barra ser HTML, não SVG.
* [Tremor NPM, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars) (não abriu): observar a barra dentro de linha de tabela, o mesmo desenho em outra densidade.
* [Storytelling with Data, what is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart): observar por que o número ao lado da barra não é redundância quando não há eixo.
* [shadcn, chart-bar-horizontal.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-horizontal.tsx): observar o contraste com a bar list; lá há eixo e escala, aqui não, e a escolha é precisão contra densidade.
* [From Data to Viz, Word cloud](https://www.data-to-viz.com/graph/wordcloud.html): observar a lista de termos com barras como alternativa recomendada à nuvem.
* [Datawrapper Academy, How to add bar charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar base zero, faixa máxima fixa e cor separada para negativos.
* [NLTK Book, capítulo 1](https://www.nltk.org/book/ch01.html): observar a distribuição de frequência e por que as palavras mais comuns são vazias, o que obriga a tirar stopwords antes da lista de termos.
* Portal de design: [Dribbble, tag bar-graph](https://dribbble.com/tags/bar-graph) (listagem de tag): observar listas compactas com barra de fundo em cards. O estudo 14 não achou referência específica verificada em portal para a lista de barras com rótulo.

### 10 Corrida de barras

* [ECharts, bar racing](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/bar-race/): observar `realtimeSort`, `yAxis.inverse`, os 300 ms de reordenação e `xAxis.max: 'dataMax'`, a especificação de comportamento a replicar em SVG.
* [Highcharts, bar race demo](https://www.highcharts.com/demo/bar-race/sand-signika) (não abriu): observar o controle de reprodução e o relógio como parte da peça.
* [Flourish, bar chart race](https://flourish.studio/visualisations/bar-chart-race/) (não abriu): observar os controles que o público já espera: barra de tempo, velocidade e top N.
* [Built In, why some experts hate bar chart races](https://builtin.com/data-science/bar-chart-races) (não abriu): observar a crítica de sobrecarga sem guia para o olho e a defesa para conjuntos com muitas entidades.
* [Big Think, bar chart races: short on analysis, but fun to watch](https://bigthink.com/strange-maps/bar-chart-races/) (não abriu): observar o enquadramento como peça de entretenimento, não de análise.
* Portal de design: sem referência específica verificada no estudo nem na varredura de portais.

### Referências gerais da família

* [Observable Plot, bar mark](https://observablehq.com/plot/marks/bar) (não abriu, HTTP 429): observar a marca de barra como referência de método para a geometria horizontal.
* [Observable Plot, diverging stacked bars](https://observablehq.com/@observablehq/plot-diverging-stacked-bar) (não abriu): observar o empilhamento divergente declarativo, útil para conferir a geometria do modelo 08.
* [shadcn, galeria de gráficos de barra](https://ui.shadcn.com/charts/bar) (não abriu): observar o conjunto de variações sobre Recharts com cor por token CSS, o padrão que o Farol segue.
* [Tremor, BarChart](https://tremor.so/docs/visualizations/bar-chart): observar `layout="vertical"` com `type="default"` para o agrupado e `type="percent"` para o 100%, que mapeiam os modelos 02 e 04.

### Portais de design

Da seção 02 da [varredura de portais](../_estudo/00_portais-de-design.md). Os shots do Dribbble marcados como "não abriu" valem pelo título e trecho da busca: a qualidade visual não foi conferida, então olhe o shot antes de adotar.

* [Dribbble, Horizontal Bar Chart](https://dribbble.com/shots/6969622-Horizontal-Bar-Chart) (aberto): observar as cinco razões explícitas para a barra horizontal e a paleta de sete azuis; serve de argumento para perdas por motivo e ranking de executivos.
* [Dribbble, shot 11014258](https://dribbble.com/shots/11014258) (não abriu): observar barras separadas com espaço para anotação e rótulo, como componente de proporção em dashboard.
* [Dribbble, shot 11352990](https://dribbble.com/shots/11352990) (não abriu): observar a variante do mesmo componente com preenchimento em gradiente, e lembrar que o Farol pinta só por token sólido.
* [Dribbble, Horizontal bar chart](https://dribbble.com/shots/4390824-Horizontal-bar-chart) (não abriu): observar a barra horizontal com arquivo fonte para baixar.
* [Dribbble, Waterfall NPS Chart](https://dribbble.com/shots/6710427-Waterfall-NPS-Chart) (não abriu): observar barras horizontais em cascata para decompor drivers de NPS; ponte com a família 19.
* [Behance, UXUI Design Data Visualization Library](https://www.behance.net/gallery/124260019/UXUI-Design-Data-Visualization-Library) (aberto, sem regras escritas): observar a biblioteca de gráficos desenhada para uma empresa de vendas de porte médio.
* [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard) (listado nas fontes do estudo): observar barras em painel de tema escuro.
* [Dribbble, Figma Charts UI kit, dashboard dark templates](https://dribbble.com/shots/15100032-Figma-Charts-UI-kit-Dashboard-dark-templates) (listado nas fontes do estudo): observar componentes de barra prontos para modo escuro.

**No Farol:** Recharts `BarChart` com `layout="vertical"` para os modelos 01 a 07, nome da categoria no `YAxis` e valor por `LabelList`; SVG puro com geometria em TypeScript para os modelos 08 e 10; HTML com Tailwind para o modelo 09.
