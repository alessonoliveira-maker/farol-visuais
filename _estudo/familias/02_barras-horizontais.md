# 02 Barras horizontais

> Família do catálogo VISUAIS do Farol. Estudo feito em 2026-09-14. Todos os casos de uso são fictícios; nomes de pessoas, plataformas e produtos são rótulos genéricos.
> Stack alvo: React 18.3 + TypeScript strict + Recharts 3.10 + Tailwind 4 + lucide-react. Nada de d3, nivo, visx ou echarts no código; bibliotecas de terceiros aparecem aqui só como referência de desenho.

## O que a família responde

Barras horizontais comparam magnitudes entre categorias discretas. O comprimento codifica o valor, e a leitura corre da esquerda para a direita, o que acomoda rótulos longos e listas grandes (SWD, FT Visual Vocabulary). É a família de ranking, de composição por categoria e de posição contra meta ou teto.

Perguntas típicas no Farol:

* Quem está na frente e por quanto? (receita reconhecida por executivo)
* Do que é feita cada categoria? (leads por origem, divididos por cobertura de dado)
* Onde cada fila está contra o teto? (capacidade de pré-vendas por fila)
* O que puxa para cima e o que puxa para baixo? (variação de CPL por plataforma)
* Como duas populações se espelham? (leads e oportunidades por faixa de porte)
* Como se distribuem as respostas numa escala? (avaliação da qualidade do lead no handoff)
* Qual é a faixa provável? (cenários de receita com saída em faixa)

## Regras que valem para a família inteira

1. **Escala começa em zero.** O comprimento é o dado; truncar o eixo mente (SWD, Wikipedia). Se a escala precisa começar acima de zero, troque a barra por ponto (Few, especificação do bullet graph).
2. **Ordene pelo valor** quando a categoria não tem ordem natural; respeite a ordem natural quando ela existe, como faixas de porte ou pontos de escala (Data to Viz, SWD).
3. **Largura e respiro.** Espaço entre barras perto de 50% da espessura; barra grossa demais em relação ao comprimento distrai, fina demais obriga texto minúsculo (Few, "Bar Widths and the Spaces in Between").
4. **Rotule direto.** Nome à esquerda ou dentro da barra, valor na ponta; legenda só quando há séries (SWD; Vega Lite `layer_bar_labels`).
5. **Cor com intenção.** Um neutro para o contexto e uma cor de destaque; cor semântica segue a polaridade da métrica, não o sinal (custo que sobe é ruim, receita que sobe é boa; Few inverte as faixas para despesas).
6. **No Recharts, barra horizontal é `BarChart layout="vertical"`** com `XAxis type="number"` e `YAxis type="category"` (exemplo oficial VerticalComposedChart). O Recharts não ordena: ordenar em TypeScript antes de passar `data`.
7. **`Cell` está deprecado no Recharts 3 e sai na 4.0.** Cor por item vai pela prop `shape` (um `Rectangle` com `fill` calculado a partir de `payload` ou `index`), como faz o exemplo `chart-bar-active` do shadcn.
8. **Tema escuro.** Cores só por token CSS (`fill="var(--farol-serie-1)"`, padrão usado pelo shadcn); rótulo sobre barra escura em texto claro; grade vertical tênue ou nenhuma.
9. **Muitas categorias.** A altura cresce por passo fixo por categoria (Vega Lite usa `height: {step: 16}`) em vez de espremer; acima de uns 25 itens, top N mais "Outros" ou `Brush`.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 2.1 | Barras simples ordenadas | Ranking de uma medida entre categorias com rótulo longo | Série temporal (use colunas ou linhas) | Deixar em ordem alfabética ou de banco |
| 2.2 | Barras com destaque | Uma ou poucas categorias carregam a mensagem | Quando todas importam igualmente | Colorir tudo com cores diferentes |
| 2.3 | Barras agrupadas | Comparar 2 ou 3 séries dentro de cada categoria | Mais de 3 séries ou muitas categorias | Grupos sem ordem e legenda distante |
| 2.4 | Barras sobrepostas | Realizado contra referência (meta, teto, ano anterior) na mesma banda | Duas medidas sem relação de referência | Barra da frente mais larga que a de trás |
| 2.5 | Barras empilhadas | Total por categoria e a composição dele | Comparar segmentos do meio entre categorias | Segmento importante longe da base |
| 2.6 | Barras empilhadas 100% | Proporção dentro de cada categoria | Quando o tamanho absoluto importa | Esconder o n de cada barra |
| 2.7 | Barras empilhadas em grupos | Duas pilhas por categoria (orçado e realizado) | Mais de 2 pilhas por grupo | Cores diferentes para o mesmo componente |
| 2.8 | Barras divergentes de sinal | Valores positivos e negativos em torno de zero | Todos os valores com o mesmo sinal | Cor por sinal ignorando polaridade |
| 2.9 | Barras empilhadas por sinal | Entradas e saídas de cada categoria, com componentes | Quando só o saldo interessa | Obrigar o leitor a subtrair de cabeça |
| 2.10 | Divergente empilhada Likert | Escala ordinal de concordância ou avaliação | Categorias nominais sem polo | Neutro inteiro de um lado só |
| 2.11 | Butterfly ou pirâmide | Duas populações espelhadas sobre as mesmas faixas | Escalas de ordem de grandeza diferente | Esquecer valor absoluto no rótulo do lado negativo |
| 2.12 | Bar list | Top N compacto em card, com link ou clique | Comparação precisa ou valores negativos | Barra sem valor numérico ao lado |
| 2.13 | Barras com trilho | Ocupação de 0 a 100% ou contra teto | Medidas sem teto natural | Trilho com contraste igual ao da barra |
| 2.14 | Barras com marcador de meta | Posição contra meta, com ou sem faixas qualitativas | Público que não conhece o formato, sem legenda | Marcador mais pesado que a barra |
| 2.15 | Barra única de composição | Composição de um total só, em card ou cabeçalho | Comparar composições entre grupos | Segmentos minúsculos com rótulo sobreposto |
| 2.16 | Barra de faixa (span) | Intervalo mínimo e máximo por categoria | Quando a distribuição interna importa | Faixa sem ponto central de referência |
| 2.17 | Lollipop horizontal | Muitas categorias com valores parecidos | Poucas categorias (barra lê melhor) | Haste começando fora do zero |
| 2.18 | Corrida de barras | Narrativa de ranking ao longo do tempo em apresentação | Análise, leitura precisa | Troca de posição rápida demais |

## Modelos

### 2.1 Barras simples ordenadas

**Descrição.** Uma barra por categoria, todas partindo do zero, ordenadas do maior para o menor (ou ao contrário, se a mensagem é "quem está pior"). É o modelo padrão da família e a base de quase todos os outros.

**Anatomia.** Eixo de categorias à esquerda com o nome completo; barras de espessura constante; valor na ponta de cada barra; eixo numérico no rodapé ou omitido quando todo valor está rotulado; título que diz a leitura ("Executivo 03 lidera com R$ 412 mil").

**Abordagem na stack:** `recharts-nativo`. `BarChart layout="vertical"`, `XAxis type="number" hide`, `YAxis type="category" dataKey="nome" width="auto"`, `Bar dataKey="valor" radius={[0, 4, 4, 0]}` e `LabelList position="right" formatter` com `Intl.NumberFormat('pt-BR')`.

**Ponto delicado.** A altura do contêiner precisa ser derivada do número de categorias (passo fixo, por exemplo 28 px por barra) ou as barras engordam com poucos itens e somem com muitos. `YAxis width="auto"` resolve largura, mas rótulo muito longo ainda precisa de truncamento com `title` para leitura completa. A ordenação é feita em TypeScript antes do render; "Outros" entra depois da ordenação, sempre no fim.

**Versões sugeridas.**

* **V1 Básico.** Receita reconhecida por executivo no trimestre (Executivo 01 a 08), ordem decrescente, valor em R$ mil na ponta.
* **V2 Rótulo dentro da barra.** Motivos de perda com nomes longos ("Sem orçamento no ciclo", "Adiou decisão para o próximo ano"): nome sobreposto dentro da barra em tom neutro e contagem na ponta, como no `layer_bar_labels_grey` do Vega Lite e no `chart-bar-label-custom` do shadcn (dois `LabelList`, um `insideLeft` e outro `right`).
* **V3 Caso denso do Farol.** Leads por campanha com 40 campanhas: top 15 ordenadas e uma barra final "Outras 25 campanhas" em cor neutra, fora da ordenação.
* **V4 Caso limite.** Zeros e dado ausente: fila com 0 agendas mostra o texto "0" sem barra; categoria sem coleta mostra "sem dado" em cor apagada. Não usar `minPointSize` para fabricar uma barra visível: a prop existe (exemplo BarChartWithMinHeight) mas faz o zero parecer valor.

**Referências.**

* Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar que "Ordered bar" mora em Ranking e que o FT diz que barra lê melhor que coluna com rótulos longos.
* Catálogo: [Data to Viz, barplot](https://www.data-to-viz.com/graph/barplot.html) e [caveat de ordenação](https://www.data-to-viz.com/caveat/order_data.html). Observar os erros listados: não ordenar e confundir barra com histograma.
* Catálogo: [Vega Lite, barra agregada ordenada](https://vega.github.io/vega-lite/examples/bar_aggregate_sort_by_encoding.html). Observar `sort: "-x"`, a ordenação declarativa que no Recharts vira `sort` em TS.
* Praticante: [SWD, What is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart). Observar horizontal para rótulos longos, zero obrigatório e rótulos dentro da ponta.
* Praticante: [Few, Bar Widths and the Spaces in Between (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf). Observar o respiro de 50% e o efeito da largura na percepção do comprimento.
* Implementação: [Recharts VerticalComposedChart](https://recharts.github.io/en-US/examples/VerticalComposedChart/) e [shadcn chart-bar-horizontal.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-horizontal.tsx). Observar `layout="vertical"` com eixo de categoria em `YAxis`.
* Portal de design: [Behance, Bar Chart Design in Figma](https://www.behance.net/gallery/145652823/Bar-Chart-Design-in-Figma). Observar espaçamento e rótulos numa peça de UI (a página abriu só com metadados; conferir as imagens).

### 2.2 Barras com destaque

**Descrição.** Barras simples em que uma ou poucas categorias recebem a cor de destaque e o resto fica em neutro. A cor faz o papel do título: aponta onde olhar.

**Anatomia.** Igual a 2.1, com uma barra na cor de destaque, rótulo dessa barra em peso maior e, opcionalmente, anotação curta ao lado ("você", "estoura SLA").

**Abordagem na stack:** `recharts-custom`. `Bar` com `shape={(p) => <Rectangle {...p} fill={p.payload.destaque ? 'var(--farol-destaque)' : 'var(--farol-neutro)'} />}`. É o mesmo mecanismo do `chart-bar-active` do shadcn (compara `index` com um índice ativo e muda `strokeDasharray` e `fillOpacity`) e do exemplo BarChartWithCustomizedEvent do Recharts (opacidade por estado).

**Ponto delicado.** O destaque deve vir de uma regra de dado (`destaque: boolean` calculado no seletor), nunca de posição fixa, senão quebra quando a ordenação muda. Em filtro cruzado, o estado selecionado mora no componente pai e não no `shape` (o exemplo oficial guarda estado dentro do shape, o que não sobrevive a rerender). Contraste do neutro no tema escuro: neutro escuro demais faz as outras barras sumirem.

**Versões sugeridas.**

* **V1 Básico.** CPL qualificado por plataforma de mídia (Busca paga, Social pago, Rede profissional paga, Vídeo pago, Display), destacando a plataforma mais cara.
* **V2 Com anotação.** Ranking de executivos com o executivo do usuário logado destacado e a etiqueta "você"; clique em outra barra move o destaque e filtra o painel.
* **V3 Caso denso do Farol.** Tempo médio até o primeiro contato por SDR (SDR 01 a 12) com `ReferenceLine x={4}` rotulada "SLA 4 h"; barras acima do SLA em cor de alerta, demais em neutro.
* **V4 Caso limite.** Empate no topo: as duas categorias empatadas recebem destaque e o título diz "empate". Categoria destacada com valor zero: sem barra, rótulo "0" em destaque.

**Referências.**

* Catálogo: [Vega Lite, barras cinza com rótulo sobreposto](https://vega.github.io/vega-lite/examples/layer_bar_labels_grey.html). Observar a base toda em cinza, que é o ponto de partida do destaque.
* Praticante: [SWD, What is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart). Observar a combinação de cor e palavra no título.
* Implementação: [shadcn chart-bar-active.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-active.tsx) e [Recharts BarChartWithCustomizedEvent](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/). Observar `shape` com `Rectangle` e estado ativo.
* Implementação: [Recharts Cell (deprecado)](https://recharts.github.io/en-US/api/Cell/). Observar a orientação de migrar cor por item para `shape`.
* Portal de design: [Behance, Interactive Hover Bar Chart for Job Statistics](https://www.behance.net/gallery/212978419/Interactive-Hover-Bar-Chart-for-Job-Statistics). Observar o estado de hover como destaque (página abriu só com metadados; conferir imagens).

### 2.3 Barras agrupadas

**Descrição.** Duas ou três barras lado a lado por categoria, uma por série, todas partindo do zero. Também chamadas de clustered ou multi set bar.

**Anatomia.** Categoria à esquerda; dentro de cada banda, uma barra por série com cor fixa por série; espaço menor entre barras do grupo e maior entre grupos; legenda no topo, na ordem das barras.

**Abordagem na stack:** `recharts-nativo`. Vários `Bar` sem `stackId`; `barGap` (padrão 4) controla o espaço dentro do grupo e `barCategoryGap` (padrão 10%) o espaço entre grupos. A Tremor faz o mesmo com `type="default"` e `layout="vertical"`.

**Ponto delicado.** A leitura piora a cada barra adicionada ao grupo (Data Viz Catalogue, SWD). Com mais de 3 séries, trocar por small multiples, linhas ou dumbbell (família 17). Ausência não é zero: valor `null` não desenha barra e precisa de marca textual, senão o leitor lê "zero". Ordenar grupos pela série principal, não pela soma.

**Versões sugeridas.**

* **V1 Básico.** Agendas marcadas e agendas realizadas por canal de entrada (6 canais).
* **V2 Com destaque.** Trimestre atual contra o mesmo trimestre do ano anterior por produto (Produto A a E), ano anterior em cinza claro e atual em cor forte.
* **V3 Caso denso do Farol.** Leads por origem nos últimos 3 meses (3 séries, 7 origens), com a origem ordenada pelo mês mais recente; ao passar de 3 meses, o componente oferece alternar para small multiples.
* **V4 Caso limite.** Origem nova sem histórico: as barras dos meses anteriores não existem e o espaço recebe o texto "sem histórico", não uma barra de zero.

**Referências.**

* Catálogo: [Data Viz Catalogue, Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html). Observar o alerta de legibilidade com muitas barras por grupo.
* Catálogo: [Vega Lite, barras agrupadas](https://vega.github.io/vega-lite/examples/bar_grouped.html). Observar `xOffset` como canal de agrupamento.
* Praticante: [Nightingale, Beyond the Bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/). Observar dumbbell e slope como alternativas ao agrupado quando a pergunta é mudança entre dois momentos.
* Praticante: [Tufte, cancer survival rates: tables, slopegraphs, barcharts](https://www.edwardtufte.com/notebook/cancer-survival-rates-tables-slopegraphs-barcharts/). Observar a crítica a barras agrupadas de baixa densidade e a defesa da tabela para poucos números.
* Implementação: [AG Charts, bar series](https://www.ag-grid.com/charts/react/bar-series/). Observar grupos, pilhas, normalização e `stackGroup` num só tipo de série.
* Portal de design: [Behance, Sales Dashboard](https://www.behance.net/gallery/194252083/Sales-Dashboard). Observar barras de vendas em painel (página abriu só com metadados; conferir imagens).

### 2.4 Barras sobrepostas

**Descrição.** Duas barras na mesma banda, uma atrás da outra: a de trás, mais larga e clara, é a referência (meta, teto, ano anterior); a da frente, mais fina e escura, é o realizado. Economiza espaço e torna óbvio quem passou da referência.

**Anatomia.** Barra de referência larga em tom claro ou só contorno; barra de realizado mais estreita e sólida, centrada na mesma banda; rótulo do realizado na ponta e, se preciso, rótulo do percentual atingido.

**Abordagem na stack:** `recharts-nativo`. Dois `YAxis type="category"` com o mesmo `dataKey`, um deles com `hide` e `yAxisId` próprio; a `Bar` de referência usa um eixo e a de realizado usa o outro, com `barSize` menor. Como cada `Bar` está sozinha no seu eixo de categoria, as duas ocupam o centro da mesma banda. O eixo numérico é um só.

**Ponto delicado.** Os dois eixos de categoria precisam receber exatamente a mesma lista na mesma ordem; qualquer filtro aplicado a uma série e não à outra desalinha as barras sem erro visível. A ordem dos filhos no JSX define quem fica na frente (referência primeiro). Quando o realizado passa da referência, a barra fina ultrapassa a larga, e isso deve ser legível (rótulo de excedente).

**Versões sugeridas.**

* **V1 Básico.** Realizado (fina, sólida) sobre meta do trimestre (larga, clara) por executivo.
* **V2 Com anotação.** Receita reconhecida sobre forecast comprometido por produto, com percentual atingido à direita ("87%").
* **V3 Caso denso do Farol.** Pré-vendas: entradas trabalhadas na semana sobre o teto de capacidade de cada uma das 9 filas; teto em contorno tracejado.
* **V4 Caso limite.** Meta ausente para um executivo recém-chegado: não desenhar a barra larga e escrever "sem meta"; realizado acima da meta com rótulo "+18% acima".

**Referências.**

* Catálogo: [Vega Lite, barras em camadas transparentes](https://vega.github.io/vega-lite/examples/bar_layered_transparent.html). Observar `stack: null` e opacidade para sobrepor séries.
* Catálogo: [Highcharts, colunas sobrepostas (código da demo)](https://raw.githubusercontent.com/highcharts/highcharts/master/samples/highcharts/demo/column-placement/demo.js). Observar `grouping: false`, `pointPadding` e `pointPlacement` para meta atrás e realizado na frente.
* Praticante: [SWD, What is a bullet graph](https://www.storytellingwithdata.com/blog/what-is-a-bullet-graph). Observar a variação simplificada com barras sobrepostas quando as faixas qualitativas não são necessárias.
* Praticante: [IBCS 2.0](https://www.ibcs.com/ibcs-version-2-0/). Observar que a notação de cenários (realizado, plano, previsão) é o fundamento da convenção sólido contra contorno; a página só resume a norma.
* Portal de design: [Behance, SaaS Dashboard e Analytics em modo escuro](https://www.behance.net/gallery/254777417/SaaS-Dashboard-Analytics-Web-Application). Observar contraste de tons claros e escuros sobre fundo escuro (página abriu com metadados e tags; conferir imagens).

### 2.5 Barras empilhadas

**Descrição.** Cada barra representa o total da categoria e é dividida em segmentos por componente. Só o segmento da base e o total têm linha de base comum; os segmentos do meio não se comparam bem entre categorias (Data to Viz, Few).

**Anatomia.** Barra total com segmentos em cores de uma paleta categórica curta; segmento prioritário encostado no zero; total rotulado na ponta; rótulos de segmento só quando cabem; legenda na mesma ordem dos segmentos.

**Abordagem na stack:** `recharts-nativo`. `Bar` com o mesmo `stackId`; a partir do Recharts 3.6, `BarStack` agrupa as barras e aplica `radius` ao contorno da pilha inteira, o que evita arredondar segmentos internos. Total na ponta com `LabelList content` no último segmento (padrão do exemplo StackedBarChartWithHorizontalLine).

**Ponto delicado.** Rótulo de segmento aparece só quando a largura em pixels comporta o texto; a regra fica num `content` que mede `width` antes de desenhar (a Tremor esconde rótulos sobrepostos na CategoryBar; o nivo expõe `labelSkipWidth`). Com mais de 5 segmentos, agregar em "outros". Ordem de segmentos fixa entre categorias e igual à legenda.

**Versões sugeridas.**

* **V1 Básico.** Oportunidades abertas por executivo, empilhadas por estágio (Descoberta, Proposta, Negociação, Assinatura).
* **V2 Com destaque.** Mesma leitura com o segmento "paradas há mais de 30 dias" na base em cor de alerta e os demais estágios em neutros graduados.
* **V3 Caso denso do Farol.** Leads do mês por origem, empilhados por cobertura de dado (telefone e e-mail, só e-mail, só telefone, sem contato), com total e percentual de cobertura completa na ponta.
* **V4 Caso limite.** Oito motivos de perda por executivo: agregação automática dos três menores em "outros motivos" e supressão de rótulo em segmentos com menos de 24 px.

**Referências.**

* Catálogo: [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html). Observar os dois tipos (simples e 100%) e a perda de legibilidade com muitos segmentos.
* Catálogo: [Data to Viz, o problema de empilhar](https://www.data-to-viz.com/caveat/stacking.html). Observar que só a série da base tem linha de base estável.
* Catálogo: [ECharts, barras horizontais empilhadas (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-y-category-stack.ts). Observar rótulo por segmento e foco por série no hover.
* Praticante: [SWD, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars). Observar "o segmento mais importante na base" e contraste do rótulo.
* Praticante: [Few, displays for combining time series and part to whole (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf). Observar por que linhas conectando segmentos não resolvem.
* Implementação: [Recharts BarStack](https://recharts.github.io/en-US/api/BarStack/). Observar `radius` aplicado ao contorno da pilha e precedência do `stackId`.
* Portal de design: [Behance, stacked bar chart](https://www.behance.net/gallery/43416395/stacked-bar-chart). Observar a peça dedicada ao formato (página abriu só com metadados; conferir imagens).

### 2.6 Barras empilhadas 100%

**Descrição.** Cada barra vai de 0 a 100% e mostra a proporção de cada componente dentro da categoria. Ganha duas linhas de base (a do 0 e a do 100%), então o primeiro e o último segmento se comparam bem (SWD).

**Anatomia.** Barras de comprimento igual; segmentos com percentual rotulado; n absoluto à direita da barra; legenda no topo; eixo em percentual ou omitido.

**Abordagem na stack:** `recharts-nativo`. `BarChart layout="vertical" stackOffset="expand"` com `stackId` comum e `XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`}`. A Tremor usa `type="percent"`; o Vega Lite, `stack: "normalize"`.

**Ponto delicado.** Com `expand`, o valor que chega ao tooltip e ao `LabelList` continua absoluto; o percentual precisa ser calculado no dado (campo `pct_*`) ou no `formatter`. Categoria com total zero gera divisão por zero; tratar antes. Esconder o n é o erro mais caro: uma barra de 3 respostas parece tão sólida quanto uma de 300.

**Versões sugeridas.**

* **V1 Básico.** Mix de origem dos leads por segmento de conta (Pequenas, Médias, Grandes contas).
* **V2 Com anotação.** Percentual dentro de cada segmento com texto claro sobre cor escura, rótulo posicionado no centro do segmento (como `bandPosition: 0.5` no Vega Lite) e "n = 214" à direita.
* **V3 Caso denso do Farol.** Distribuição dos motivos de perda por executivo (12 executivos), ordenados pela fatia de "sem fit".
* **V4 Caso limite.** Executivo com n = 3 fica com opacidade reduzida e selo "n baixo"; executivo sem nenhuma perda mostra "sem casos" no lugar da barra.

**Referências.**

* Catálogo: [Vega Lite, barra horizontal normalizada com rótulos](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html). Observar o rótulo centrado no segmento.
* Catálogo: [ECharts, normalização de pilha (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-stack-normalization.ts). Observar a normalização feita no dado, antes do gráfico.
* Praticante: [SWD, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars). Observar a vantagem das duas linhas de base.
* Implementação: [Recharts BarChart API](https://recharts.github.io/en-US/api/BarChart/) e [Tremor BarChart](https://tremor.so/docs/visualizations/bar-chart). Observar `stackOffset` com `expand` e `type="percent"`.
* Portal de design: [Behance, busca por stacked bar chart](https://www.behance.net/search/projects/stacked%20bar%20chart). Observar a variedade de tratamentos de segmento (listagem aberta; nenhum projeto 100% específico carregou com descrição).

### 2.7 Barras empilhadas em grupos

**Descrição.** Duas pilhas por categoria, lado a lado dentro da mesma banda: orçado e realizado, planejado e executado, mês anterior e mês atual. Junta a comparação entre grupos da 2.3 com a composição da 2.5.

**Anatomia.** Banda da categoria dividida em duas sub bandas; cada sub banda é uma pilha com a mesma ordem de segmentos e as mesmas cores; rótulo curto sob cada pilha ("orç" e "real") ou legenda dupla; total na ponta de cada pilha.

**Abordagem na stack:** `recharts-nativo`. Dois `stackId` distintos ("orcado" e "realizado") e duas cores por segmento não; a mesma cor por componente nos dois grupos, distinguindo as pilhas por opacidade ou padrão de preenchimento. É o `stackGroup` das AG Charts e o `stack` nomeado do ECharts; o Recharts resolve com `stackId` diferente por grupo e `Bar` repetida por componente.

**Ponto delicado.** O número de `Bar` explode: 2 grupos por 4 componentes são 8 elementos `Bar`, e cada um precisa de `stackId`, `fill` e entrada de legenda coerentes. A legenda deve listar componentes, não as oito séries; isso exige `Legend content` customizado que colapsa o par. Distinguir as duas pilhas por opacidade cria problema de contraste no tema escuro; preferir um contorno tracejado na pilha de referência.

**Versões sugeridas.**

* **V1 Básico.** Orçado contra realizado de mídia paga por plataforma, empilhados por tipo de campanha (Prospecção, Remarketing).
* **V2 Com anotação.** Mesma leitura com etiqueta de desvio na ponta ("+12% acima do orçado") e cor do desvio pela polaridade de custo.
* **V3 Caso denso do Farol.** Diretoria: custo por camada (Camada 1 direto, Camada 2 alocado, Camada 3 rateado) em duas pilhas, cenário base e cenário agressivo, por área.
* **V4 Caso limite.** Categoria com uma pilha só (área nova sem orçado): desenhar apenas a pilha existente centrada na banda, com a etiqueta "sem orçado" no lugar da pilha ausente.

**Referências.**

* Catálogo: [AG Charts, bar series](https://www.ag-grid.com/charts/react/bar-series/). Observar `stackGroup`, que é exatamente este modelo num único tipo de série.
* Catálogo: [ECharts, barras horizontais empilhadas (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-y-category-stack.ts). Observar que o nome da pilha é uma string livre, o que permite dois grupos no mesmo eixo.
* Praticante: [IBCS 2.0](https://www.ibcs.com/ibcs-version-2-0/). Observar a notação de cenários, que é a razão de ser deste modelo: plano e realizado no mesmo lugar com formas diferentes.
* Implementação: [Recharts Bar, prop stackId](https://recharts.github.io/en-US/api/Bar/). Observar que barras com o mesmo `axisId` e o mesmo `stackId` empilham, o que torna o agrupamento de pilhas uma questão de nomear os `stackId`.
* Portal de design: [Dribbble, tag barchart](https://dribbble.com/tags/barchart). Observar tratamentos de pilha dupla em cards estreitos (listagem de tag; peças individuais não abertas).

### 2.8 Barras divergentes de sinal

**Descrição.** Barras que saem de um zero central para a direita quando o valor é positivo e para a esquerda quando é negativo. O zero vira eixo de simetria e o olho lê sinal antes de magnitude.

**Anatomia.** Linha de zero marcada e mais forte que a grade; categorias à esquerda ou sobre o eixo central; barras para os dois lados com cores de polaridade; rótulo sempre do lado de fora da barra, com sinal explícito.

**Abordagem na stack:** `recharts-custom`. `BarChart layout="vertical"` com `XAxis type="number" domain={[-max, max]}` simétrico, `ReferenceLine x={0}` e `Bar shape` que escolhe a cor pelo sinal e o `radius` pelo lado (cantos arredondados só na ponta livre). Com o eixo de categoria à esquerda, o rótulo do negativo precisa de `LabelList position` condicional, o que também vai no `content`.

**Ponto delicado.** Três armadilhas. Primeira: domínio assimétrico, que faz a mesma variação parecer maior de um lado; calcular `max = Math.max(...abs(valores))` e usar `[-max, max]`. Segunda: cor por sinal em métrica de custo, onde subir é ruim; a cor segue a polaridade do indicador, não o sinal aritmético. Terceira: o `radius` em array fixo arredonda o canto errado nas barras negativas; a ponta arredondada tem que seguir a direção da barra.

**Versões sugeridas.**

* **V1 Básico.** Variação do CPL por plataforma contra o mês anterior, em reais, com queda em cor boa e alta em cor de alerta.
* **V2 Com anotação.** Mesma leitura com `ReferenceLine` na média ponderada e rótulo "média da conta", mais uma anotação na maior alta.
* **V3 Caso denso do Farol.** Variação de pipeline por executivo entre duas semanas, 12 executivos ordenados do maior ganho à maior perda, com o zero no meio do card.
* **V4 Caso limite.** Todos os valores negativos: o eixo não é simétrico de verdade e o gráfico vira barra simples espelhada; o componente detecta o caso e some com o lado vazio, mantendo o zero à direita.

**Referências.**

* Catálogo: [Vega Lite, exemplos de barra](https://vega.github.io/vega-lite/examples/). Observar `bar_diverging_stack_transform`, cuja base é o deslocamento em torno de um zero calculado.
* Catálogo: [Domo, divergent bar charts](https://www.domo.com/learn/charts/divergent-bar-charts). Observar a definição de uso e os exemplos de variação positiva e negativa (apareceu na busca, página não aberta).
* Praticante: [SWD, What is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart). Observar a orientação sobre onde colocar o rótulo quando a barra cruza o zero.
* Implementação: [Recharts Bar, prop shape e radius](https://recharts.github.io/en-US/api/Bar/). Observar que `radius` aceita array de quatro valores, o que permite arredondar só a ponta livre.
* Portal de design: [Dribbble, tag bar_chart](https://dribbble.com/tags/bar_chart). Observar tratamento de cor de polaridade em peças de painel (listagem de tag; peças individuais não abertas).

### 2.9 Barras empilhadas por sinal

**Descrição.** Variação da 2.8 em que cada lado do zero é uma pilha: à direita os componentes que somam, à esquerda os que subtraem. Mostra de onde vem o saldo, não só qual é.

**Anatomia.** Zero central; pilha positiva crescendo para a direita e pilha negativa para a esquerda; marcador de saldo líquido (um traço vertical ou um ponto) na posição da soma algébrica; legenda de componentes separada por sinal.

**Abordagem na stack:** `recharts-nativo` com apoio. `Bar` com `stackId` comum e valores já assinados no dado: o Recharts empilha positivos para um lado e negativos para o outro dentro do mesmo `stackId`, então o desenho sai sozinho. O marcador de saldo é uma `Scatter` ou um `ReferenceDot` por categoria, ou um `Customized` que percorre o dado e desenha o traço.

**Ponto delicado.** O leitor é obrigado a fazer a subtração de cabeça se o saldo não estiver marcado; esse é o erro comum da linha da tabela. O marcador de saldo precisa da mesma escala do eixo numérico, e no Recharts o acesso a essa escala dentro de `Customized` vem pelo argumento de props do gráfico, não por cálculo manual de pixel. Cores: componentes positivos em uma família de tons e negativos em outra, nunca a mesma paleta categórica dos dois lados.

**Versões sugeridas.**

* **V1 Básico.** Movimentação do pipeline por executivo: entradas e avanços à direita, perdas e desqualificações à esquerda, saldo marcado.
* **V2 Com anotação.** Mesma leitura com o saldo rotulado em texto ("saldo +R$ 180 mil") e cor do rótulo pela polaridade.
* **V3 Caso denso do Farol.** Pré vendas: entradas por fonte à direita (inbound, lista fria, retomada) e saídas à esquerda (sem contato, fora do perfil, sem retorno), por semana do mês.
* **V4 Caso limite.** Saldo exatamente zero: o marcador cai sobre a linha de zero e precisa de contorno claro para não sumir; categoria só com saídas mostra a pilha esquerda e o saldo negativo, sem espaço morto à direita.

**Referências.**

* Catálogo: [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html). Observar que o formato assume valores do mesmo sinal, o que explica por que este modelo precisa do marcador de saldo.
* Catálogo: [Vega Lite, barra divergente com transformação](https://vega.github.io/vega-lite/examples/bar_diverging_stack_transform.html). Observar o cálculo do deslocamento, que é a mesma ideia aplicada a componentes.
* Praticante: [Few, displays for combining time series and part to whole (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf). Observar a crítica à leitura de componentes sem linha de base comum, que aqui é mitigada pelo zero central.
* Implementação: [Recharts Bar, prop stackId](https://recharts.github.io/en-US/api/Bar/). Observar que o empilhamento respeita o sinal do valor, sem configuração extra.
* Vizinhança: quando a pergunta é "como o saldo se formou passo a passo", o modelo certo é a cascata da família 19_cascata-waterfall, não esta.
* Portal de design: [Dribbble, busca progress-table](https://dribbble.com/search/progress-table). Observar composições de linha com saldo à direita (listagem de busca; peças individuais não abertas).

### 2.10 Divergente empilhada Likert

**Descrição.** Pilha de categorias ordinais centrada entre os polos: discordâncias à esquerda do zero, concordâncias à direita, neutro no meio. É o formato clássico de resultado de pesquisa de escala.

**Anatomia.** Pergunta ou item à esquerda; pilha centrada com paleta divergente de 4 ou 5 passos; zero central marcado; percentuais dentro dos segmentos maiores; n da pergunta à direita; legenda ordenada do polo negativo ao positivo.

**Abordagem na stack:** `svg-puro` ou `recharts-custom`. O caminho honesto é calcular em TypeScript o deslocamento de cada pergunta (soma dos negativos, mais metade do neutro se a escolha for dividir) e desenhar retângulos em SVG com uma escala linear escrita à mão; é o que o Vega Lite faz com transformações encadeadas. Em Recharts dá para forçar com valores assinados e `stackId` comum, mas o neutro dividido exige dois campos (`neutro_esq` e `neutro_dir`), e o tooltip precisa reconstruir o valor original.

**Ponto delicado.** A decisão do neutro é política, não técnica. Dividir o neutro ao meio implica que metade de quem não opinou é a favor, e a Datawrapper chama isso de perigoso; a alternativa é deixar o neutro inteiro de um lado, o que desalinha, ou usar 100% empilhado (2.6), que é a recomendação explícita deles. Qualquer que seja a escolha, ela vai escrita na legenda. Segunda armadilha: sem o n, uma pergunta com 5 respostas parece igual a uma com 500.

**Versões sugeridas.**

* **V1 Básico.** Avaliação da qualidade do lead no handoff, 5 pontos, 6 critérios, neutro inteiro em cinza no centro.
* **V2 Com anotação.** Mesma leitura com o percentual somado de cada polo fora da barra ("62% concordam") e ordenação das perguntas pelo polo positivo.
* **V3 Caso denso do Farol.** Pesquisa interna de 14 afirmações sobre o processo comercial, com filtro por área e alternância entre divergente e 100% empilhado no mesmo componente.
* **V4 Caso limite.** Escala par, sem neutro: o zero cai na fronteira entre os dois polos e não há segmento central; item com n abaixo de 10 recebe opacidade reduzida e selo "n baixo".

**Referências.**

* Catálogo: [Vega Lite, divergente empilhada com neutro](https://vega.github.io/vega-lite/examples/bar_diverging_stack_transform.html). Observar a divisão do neutro por dois e a subtração do deslocamento nas duas pontas do segmento.
* Catálogo: [Vega Lite, medianas de escala Likert](https://vega.github.io/vega-lite/examples/layer_likert.html) (apareceu na listagem de exemplos; página não aberta). Observar a mediana sobreposta como resumo da distribuição.
* Praticante: [Datawrapper, the case against diverging stacked bars](https://www.datawrapper.de/blog/divergingbars). Observar o argumento central: sem linha de base comum, comparar itens exige conta mental, e "não sei" é dado.
* Praticante: [Data Revelations, rethinking the divergent stacked bar chart](https://www.datarevelations.com/rethinkingdivergent/). Observar a proposta de colocar as opiniões fortes no centro, junto ao zero (apareceu na busca; página não aberta).
* Praticante: [Heiberger e Robbins, design of diverging stacked bar charts for Likert scales](https://www.researchgate.net/publication/289590282_Design_of_Diverging_Stacked_Bar_Charts_for_Likert_Scales_and_Other_Applications). Observar a defesa formal do formato, que é o contraponto à Datawrapper (apareceu na busca; página não aberta).
* Portal de design: [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit). Observar a versão em modo escuro dos componentes de barra, útil para calibrar a paleta divergente.

### 2.11 Butterfly ou pirâmide

**Descrição.** Dois gráficos de barras espelhados sobre o mesmo eixo de categorias, um crescendo para a esquerda e outro para a direita. A pirâmide etária é o caso clássico; a borboleta é o caso geral, com qualquer par de grupos sobre as mesmas faixas.

**Anatomia.** Eixo de categorias no centro (ou à esquerda, com o rótulo fora); dois eixos numéricos, um invertido; rótulo de cada lado com valor absoluto, nunca com o sinal negativo que a implementação usa; título de cada lado acima do respectivo bloco; faixas na ordem natural, da menor para a maior, de baixo para cima.

**Abordagem na stack:** `recharts-nativo` com truque de sinal, ou `html-tailwind` para o caso simples. No Recharts, o lado esquerdo recebe valores negados no seletor e o eixo usa `domain={[-max, max]}` com `tickFormatter={(v) => fmt(Math.abs(v))}`; o mesmo `Math.abs` vai no `LabelList formatter` e no tooltip. Alternativa mais controlável: dois `BarChart` irmãos num grid Tailwind de três colunas, com o eixo de categorias no meio e `reversed` no `XAxis` do gráfico da esquerda; assim cada lado mantém seus próprios valores positivos.

**Ponto delicado.** Os dois lados precisam da mesma escala, senão a comparação é falsa; calcular o máximo sobre os dois conjuntos e fixar nos dois gráficos. Na solução de dois gráficos, a altura das bandas tem que bater exatamente: mesma lista de categorias, mesma margem vertical, mesmo `barCategoryGap`. E o sinal negativo não pode vazar para nenhum texto visível.

**Versões sugeridas.**

* **V1 Básico.** Leads à esquerda e oportunidades à direita, por faixa de porte da conta (5 faixas na ordem natural).
* **V2 Com anotação.** Mesma leitura com a taxa de conversão entre os dois lados escrita no centro, ao lado do rótulo da faixa ("14%").
* **V3 Caso denso do Farol.** Entradas à esquerda e agendas realizadas à direita por faixa de tempo até o primeiro contato (menos de 5 min, 5 a 30 min, 30 min a 2 h, 2 a 24 h, mais de 24 h), com destaque na faixa de 5 minutos.
* **V4 Caso limite.** Lados com ordens de grandeza diferentes (10 mil leads contra 80 oportunidades): a escala comum some com o lado pequeno; o componente detecta razão acima de 20 e oferece a versão em percentual do próprio total, com aviso "escalas independentes" no título.

**Referências.**

* Catálogo: [Data Viz Project, Butterfly Chart](https://datavizproject.com/data-type/butterfly-chart/) (não abriu, HTTP 403). Observar, quando abrir, a distinção entre borboleta genérica e pirâmide etária.
* Catálogo: [Vega Lite, pirâmide populacional como divergente empilhada](https://vega.github.io/vega-lite/examples/bar_diverging_stack_population_pyramid.html). Observar que o Vega Lite trata a pirâmide como caso da divergente, com o eixo de categoria no centro.
* Catálogo: [Wikipedia, population pyramid](https://en.wikipedia.org/wiki/Population_pyramid). Observar o vocabulário de forma (expansiva, estacionária, construtiva) que também descreve funis comerciais (apareceu na busca; página não aberta).
* Praticante: [Observable, about population pyramids](https://observablehq.com/@didoesdigital/15-july-2020-about-population-pyramids). Observar variações de desenho e o cuidado com eixos independentes (apareceu na busca; página não aberta).
* Praticante: [xD Gov, Data Visualization Standards, population pyramid](https://xdgov.github.io/data-design-standards/visualizations/population-pyramid). Observar as regras duras: bins uniformes, no máximo duas cores, eixo de categoria no zero (apareceu na busca; página não aberta).
* Portal de design: [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1066019348443074842/dashboard-charts-ui-kit). Observar componentes espelhados e a grade de três colunas em modo escuro.

### 2.12 Bar list

**Descrição.** Lista compacta de itens em que cada linha é ao mesmo tempo um rótulo, uma barra de fundo proporcional e um número à direita. Não é um gráfico com eixo: é uma tabela em que a barra vive atrás do texto. Formato consagrado pela Tremor e onipresente em painéis de produto.

**Anatomia.** Linha de altura fixa; barra de fundo com opacidade baixa, largura proporcional ao maior valor da lista; nome do item sobre a barra, alinhado à esquerda; valor formatado à direita, fora da barra; opcionalmente um ícone e um link.

**Abordagem na stack:** `html-tailwind`. Um `div` por linha com `relative`, a barra sendo um `div` `absolute inset-y-0 left-0` com `style={{ width: `${(v / max) * 100}%` }}` e `rounded-sm`, e o texto num `div` `relative z-10 flex justify-between px-2`. A Tremor renderiza exatamente assim, com `h-8` por linha e a barra em `bg-*-200` no claro e `bg-*-900` no escuro. Nenhum SVG e nenhum Recharts.

**Ponto delicado.** Normalizar pelo maior valor da lista, não por um total ou por um teto arbitrário, senão a lista inteira encolhe quando entra um item grande; e deixar isso explícito, porque a barra não tem eixo e o leitor não sabe contra o que ela mede. Nome longo sobre a barra precisa de `truncate` com `title`. Valores negativos não cabem no formato: a Tremor ordena e desenha da esquerda, então o modelo assume magnitudes não negativas; com negativos, ir para 2.8. No tema escuro, a barra de fundo tem que ser distinguível do fundo do card sem competir com o texto.

**Versões sugeridas.**

* **V1 Básico.** Top 5 origens de lead do mês, com contagem à direita, dentro de um card de 320 px.
* **V2 Com destaque e link.** Top 8 campanhas com o nome virando link para o detalhe, a campanha em foco com barra na cor de destaque e as demais em neutro.
* **V3 Caso denso do Farol.** Marketing: top 10 criativos por lead gerado, com dois números à direita (leads e CPL) e uma segunda barra fina abaixo da principal indicando o CPL relativo.
* **V4 Caso limite.** Cauda longa: 3 itens concentram 90% e os 7 restantes viram traços quase invisíveis; o componente oferece alternar a normalização para escala de raiz quadrada, com aviso no rodapé de que a escala não é linear.

**Referências.**

* Catálogo: [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist). Observar `sortOrder`, `valueFormatter`, `href` no item e o fato de a barra ser HTML, não SVG.
* Catálogo: [Tremor NPM, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars). Observar a variação de barra dentro de linha de tabela (apareceu na busca; página não aberta).
* Praticante: [SWD, What is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart). Observar por que o valor numérico ao lado da barra não é redundância neste formato: sem eixo, o número é a única leitura precisa.
* Implementação: [shadcn chart-bar-horizontal.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-horizontal.tsx). Observar o contraste com a bar list: aqui há eixo e escala, lá não; a escolha entre os dois é de precisão contra densidade.
* Portal de design: [Dribbble, tag bar-graph](https://dribbble.com/tags/bar-graph). Observar listas compactas com barra de fundo em cards (listagem de tag; peças individuais não abertas).

### 2.13 Barras com trilho

**Descrição.** Cada barra vive dentro de um trilho que representa o total possível: o teto, os 100%, a capacidade. O espaço vazio à direita é parte da informação, porque mostra a folga.

**Anatomia.** Trilho de cantos arredondados em tom neutro muito baixo; barra preenchida a partir da esquerda; percentual ou fração ("184 de 274") à direita ou dentro do trilho; opcionalmente uma marca no trilho indicando um limiar (80% da capacidade).

**Abordagem na stack:** duas rotas. `html-tailwind` para listas em card, com dois `div` aninhados e `width` em percentual, que é o `ProgressBar` da Tremor (entrada de 0 a 100, fundo visível quando o valor é zero). `recharts-nativo` quando o trilho precisa de eixo e tooltip: a prop `background` da `Bar` desenha exatamente o trilho, aceitando objeto de props ou elemento React.

**Ponto delicado.** O trilho só faz sentido quando existe teto real; se o teto é inventado, a folga é ficção. Valor acima de 100% quebra o formato: ou o excedente aparece em cor diferente estourando o trilho, ou o trilho é redimensionado e deixa de ser comparável entre linhas. Contraste do trilho no tema escuro: claro demais e ele compete com a barra, escuro demais e ele desaparece, e então a folga deixa de ser lida. E o trilho vazio precisa continuar visível quando o valor é zero, que é justamente o caso mais importante.

**Versões sugeridas.**

* **V1 Básico.** Ocupação de cada uma das 4 filas de pré vendas contra o teto semanal, com fração "184 de 274".
* **V2 Com limiar.** Mesma leitura com marca de 80% no trilho; fila acima do limiar em cor de alerta e etiqueta "perto do teto".
* **V3 Caso denso do Farol.** Diretoria: capacidade contra demanda por área, com trilho representando a capacidade instalada, barra representando a demanda contratada e uma segunda barra fina abaixo mostrando a demanda projetada do cenário base.
* **V4 Caso limite.** Demanda acima da capacidade: a barra preenche o trilho inteiro e o excedente sai à direita em hachura na cor de alerta, com rótulo "+42 acima do teto"; fila desativada mostra trilho vazio com "fila pausada".

**Referências.**

* Catálogo: [Tremor, ProgressBar e CategoryBar](https://www.tremor.so/docs/visualizations/category-bar). Observar a regra de que o fundo continua visível quando o valor é zero e o ajuste automático de cor.
* Catálogo: [Tremor NPM, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars). Observar barra dentro de célula de tabela, que é o mesmo desenho em outra densidade (apareceu na busca; página não aberta).
* Praticante: [Few, Bar Widths and the Spaces in Between (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf). Observar que o trilho altera a percepção da largura da barra e exige revisão do respiro.
* Implementação: [Recharts Bar, prop background](https://recharts.github.io/en-US/api/Bar/). Observar que `background` aceita `true`, objeto de props, elemento ou função, o que cobre trilho simples e trilho com limiar.
* Vizinhança: quando há uma medida só e ela é o assunto do card, o lugar é 13_progresso-meta-e-gauge; aqui o trilho é repetido por categoria.
* Portal de design: [Dribbble, tag progress-bar](https://dribbble.com/tags/progress-bar). Observar tratamentos de trilho e de estouro (listagem de tag; peças individuais não abertas).

### 2.14 Barras com marcador de meta

**Descrição.** Barra do realizado com um marcador perpendicular na posição da meta, e opcionalmente faixas de fundo em tons de um mesmo matiz indicando estados qualitativos. É o bullet graph do Few, criado para substituir velocímetro em painel.

**Anatomia.** Cinco componentes na especificação do Few: a medida principal (barra fina e escura), a medida comparativa (traço perpendicular, a meta), as faixas qualitativas (dois ou três tons do mesmo matiz ao fundo), a escala quantitativa e o rótulo do indicador. Em lista, todas as linhas compartilham a mesma escala.

**Abordagem na stack:** `recharts-custom`. `Bar` fina sobre `background` que desenha as faixas (uma função que recebe as props do trilho e devolve dois ou três retângulos em tons do neutro), mais o marcador de meta. O marcador pode ser `ReferenceLine` quando a meta é única para todas as categorias, ou um `Customized` que percorre o dado e desenha um traço por linha quando cada categoria tem a sua meta. Alternativa mais simples e frequentemente melhor: `svg-puro`, porque a geometria é trivial e o controle do marcador fica direto.

**Ponto delicado.** O marcador tem que ser mais leve que a barra, não mais pesado; invertido, o olho lê a meta como o dado. As faixas qualitativas só funcionam em tons do mesmo matiz, por daltonismo e por economia de cor no painel; usar verde, amarelo e vermelho traz semáforo para dentro do gráfico e destrói a leitura. Para métrica de custo, a ordem das faixas inverte: muito é ruim. E o formato precisa de uma legenda ou de um título que explique o marcador, porque o público que nunca viu um bullet graph lê o traço como erro de renderização.

**Versões sugeridas.**

* **V1 Básico.** Receita reconhecida por executivo com marcador de meta trimestral individual, sem faixas.
* **V2 Com faixas.** Mesma leitura com três faixas do mesmo matiz (abaixo de 70%, de 70% a 100%, acima de 100%) e legenda curta no rodapé do card.
* **V3 Caso denso do Farol.** Diretoria: seis indicadores de meta 2027 numa coluna (receita, novos clientes, ticket médio, agendas por mês, custo por reunião, participação), cada um com escala própria normalizada para percentual da meta, com o perímetro escrito ao lado de cada linha.
* **V4 Caso limite.** Meta ausente para um indicador: a barra aparece sem marcador e com a etiqueta "sem meta definida"; realizado muito acima da meta (250%) faz a escala esmagar as demais linhas, e o componente corta a escala em 150% com marca de quebra explícita no fim da barra.

**Referências.**

* Catálogo: [Wikipedia, bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). Observar a definição dos componentes, a orientação de usar intensidades de um único matiz por acessibilidade e o fato de o formato ter nascido para substituir gauges.
* Catálogo: [Few, Bullet Graph Design Specification (PDF)](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf) (não abriu como texto: o PDF veio em binário). Observar, ao abrir num leitor, os limites de número de faixas e as regras de espessura.
* Praticante: [SWD, What is a bullet graph](https://www.storytellingwithdata.com/blog/what-is-a-bullet-graph). Observar a versão simplificada, sem faixas, defendida para público que não conhece o formato.
* Praticante: [Clearly and Simply, an alternative design of bullet graphs](https://www.clearlyandsimply.com/2017/05/an-alternative-design-of-bullet-graphs/). Observar a crítica ao excesso de faixas e a proposta de desenho enxuto (apareceu na busca; página não aberta).
* Implementação: [Recharts Bar, props background e shape](https://recharts.github.io/en-US/api/Bar/). Observar que `background` como função recebe as props do trilho, o que permite desenhar as faixas sem uma série extra.
* Portal de design: [Figma Community, Dark Theme Dashboard UI Kit](https://www.figma.com/community/file/1185617660562911231/dark-theme-dashboard-ui-kit-with-prototyping). Observar como o marcador de meta é tratado em componentes de painel escuro.

### 2.15 Barra única de composição

**Descrição.** Uma barra só, larga, dividida em segmentos, representando a composição de um total único. Vive em cabeçalho de painel, dentro de card de KPI ou como resumo acima de uma lista. É a `CategoryBar` da Tremor.

**Anatomia.** Barra de altura pequena ocupando a largura do contêiner; segmentos com cores da paleta categórica; legenda em linha abaixo, com bolinha, nome e valor ou percentual; opcionalmente um marcador de posição (onde estamos dentro da composição) sobre a barra.

**Abordagem na stack:** `html-tailwind`. Um `flex` com um `div` por segmento, `style={{ width: `${pct}%` }}`, `first:rounded-l-full last:rounded-r-full` e um `gap` de 2 px que separa os segmentos sem depender de borda. Zero Recharts, zero SVG. O marcador da Tremor é um triângulo posicionado por `left` em percentual, e a cor dele acompanha a do segmento em que cai.

**Ponto delicado.** Segmento pequeno vira sliver invisível: definir uma largura mínima em pixels e agregar tudo abaixo dela em "outros", porque forçar largura mínima sem agregar distorce os percentuais. Rótulo dentro do segmento só quando cabe; a regra fica em CSS de contêiner ou numa medição prévia. A soma tem que fechar em 100%: erro de arredondamento acumulado deixa um vão de 1 px na ponta, corrigido jogando o resto no último segmento. E este modelo não serve para comparar dois grupos; duas barras únicas empilhadas viram, na prática, uma 2.6 mal feita.

**Versões sugeridas.**

* **V1 Básico.** Composição do pipeline aberto por estágio, numa barra no topo da tela comercial, com legenda em linha.
* **V2 Com marcador.** Distribuição das contas por faixa de receita com um triângulo marcando onde cai a conta selecionada.
* **V3 Caso denso do Farol.** Cabeçalho de marketing: composição do investimento do mês por plataforma, com percentual dentro dos três maiores segmentos, o restante agregado em "outras" e o total em reais à direita.
* **V4 Caso limite.** Um segmento com 97% e cinco com menos de 1%: agregação automática em "outros 3%" com tooltip listando o detalhe; total zero (mês sem investimento) mostra a barra vazia em trilho neutro com a palavra "sem investimento".

**Referências.**

* Catálogo: [Tremor, CategoryBar](https://www.tremor.so/docs/visualizations/category-bar). Observar a entrada de 0 a 100, o marcador que some quando o valor é zero e a cor do marcador herdada do segmento.
* Catálogo: [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html). Observar que a barra única é o caso degenerado da empilhada, com uma categoria só.
* Praticante: [SWD, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars). Observar a recomendação de rotular direto e de limitar o número de segmentos.
* Vizinhança: quando a composição é de um total só e o público espera fatia, a família 06_pizza e a 07_rosca-e-radial disputam o mesmo espaço; a barra única ganha em cabeçalho estreito e perde quando o público quer "parte do bolo".
* Portal de design: [Figma Community, DarkMode Dashboard Design](https://www.figma.com/community/file/1281961549597623375/darkmode-dashboard-design). Observar barras de composição em cabeçalho sobre fundo escuro.

### 2.16 Barra de faixa (span)

**Descrição.** A barra não parte do zero: ela flutua entre um mínimo e um máximo, mostrando amplitude e posição ao mesmo tempo. Também chamada de range bar, floating bar ou high low.

**Anatomia.** Eixo numérico que não precisa começar em zero (a barra já não parte dele); uma barra por categoria entre os dois extremos; marca de ponto central (base, mediana ou valor atual) dentro da faixa; rótulos dos dois extremos nas pontas; categorias ordenadas pelo ponto central ou pela amplitude, conforme a pergunta.

**Abordagem na stack:** `recharts-nativo` com dado preparado, ou `svg-puro`. No Recharts, `Bar dataKey` aceita um array `[min, max]` por ponto, e o desenho sai flutuante; é o caminho mais curto. A marca central entra como `Scatter` no mesmo `ComposedChart` ou como `LabelList content` que desenha um traço. Em SVG puro, a geometria é uma escala linear e um retângulo por linha, o que dá controle total sobre a marca central e sobre pontas arredondadas assimétricas.

**Ponto delicado.** Sem um ponto de referência dentro da faixa, o leitor não sabe onde a métrica realmente está: a faixa vira só "incerteza" e perde valor de decisão. Segunda: faixa de amplitude muito pequena desenha um retângulo de 2 px que parece um traço; definir largura mínima e, abaixo dela, trocar por um ponto com bigodes. Terceira: o tooltip precisa dizer os dois extremos e o central, e o `payload` do Recharts entrega o array, não campos nomeados, então o `content` do tooltip é customizado.

**Versões sugeridas.**

* **V1 Básico.** Faixa de ticket por produto (mínimo e máximo fechados no ano), com a mediana marcada.
* **V2 Com anotação.** Mesma leitura com a faixa do produto em foco em cor de destaque e a etiqueta "mediana R$ 84 mil".
* **V3 Caso denso do Farol.** Diretoria: cenários de receita 2027 por linha de negócio, com a faixa entre cenário conservador e agressivo e o cenário base marcado no meio; a mesma tela mostra a receita realizada do ano corrente como `ReferenceLine`.
* **V4 Caso limite.** Faixa degenerada (mínimo igual ao máximo, uma observação só): desenhar um ponto e a etiqueta "n = 1", nunca uma barra de largura artificial; categoria sem dado mostra a linha em branco com "sem observações".

**Referências.**

* Catálogo: [Data Viz Project, Span Chart](https://datavizproject.com/data-type/span-chart/) (não abriu, HTTP 403). Observar, quando abrir, a família de nomes alternativos do formato.
* Catálogo: [Data Viz Catalogue, busca por range](https://datavizcatalogue.com/search/range.html). Observar quais formatos o catálogo agrupa sob amplitude, incluindo span e box plot (apareceu na busca; página não aberta).
* Praticante: [Depict Data Studio, span charts](https://depictdatastudio.com/span-charts/). Observar o argumento de uso: quando só existem mínimo e máximo, a faixa é mais honesta que uma média fabricada.
* Praticante: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar que o FT coloca amplitude e incerteza em categorias próprias, separadas de magnitude.
* Vizinhança: quando a pergunta é a distribuição inteira e não só os extremos, o lugar é 16_distribuicao; quando são dois pontos comparáveis por categoria, é o dumbbell da 17_comparacao-de-pontos.
* Portal de design: [Dribbble, tag chart](https://dribbble.com/tags/chart). Observar tratamentos de faixa e de marca central (listagem de tag; peças individuais não abertas).

### 2.17 Lollipop horizontal

**Descrição.** A barra vira uma haste fina com um ponto na ponta. O comprimento continua sendo o dado, mas a tinta cai muito, o que salva listas longas de valores parecidos do efeito de parede sólida.

**Anatomia.** Haste a partir do zero em tom neutro e espessura de 1 a 2 px; ponto na ponta com o tamanho suficiente para ser alvo de clique; categoria à esquerda; valor à direita do ponto; grade vertical tênue para ancorar a leitura, já que a percepção de posição do centro do ponto é menos precisa que a de comprimento de barra.

**Abordagem na stack:** `recharts-nativo` com `ComposedChart`, ou `svg-puro`. No Recharts: `ComposedChart layout="vertical"` com uma `Bar barSize={2}` fazendo a haste e uma `Scatter` ou uma segunda `Bar` com `shape` de círculo marcando a ponta; a `Scatter` precisa dos mesmos eixos e do `dataKey` do valor. Em SVG puro, é uma `line` e um `circle` por linha, e o resultado costuma sair mais limpo e mais fácil de animar.

**Ponto delicado.** A haste tem que começar no zero: lollipop com haste truncada é a versão mais discreta de mentir com o eixo. O ponto deve ficar centrado na ponta, o que significa que o desenho estoura o domínio em metade do raio; reservar margem no eixo ou o círculo é cortado. E a precisão cai em relação à barra, então este modelo é para leitura de ranking, não para leitura de valor exato; se o número importa, ele vai escrito ao lado.

**Versões sugeridas.**

* **V1 Básico.** Ranking de 20 origens de lead por volume, com valor à direita do ponto.
* **V2 Com destaque.** Mesma leitura com as origens acima da mediana em cor de destaque e uma `ReferenceLine` na mediana rotulada.
* **V3 Caso denso do Farol.** Taxa de conversão por SDR e por etapa (30 linhas), com ponto dimensionado pelo volume da etapa, o que faz a leitura carregar dois dados sem virar bolha.
* **V4 Caso limite.** Valores quase iguais (todas as taxas entre 11% e 13%): o eixo em zero achata tudo; a saída é manter o zero e acrescentar um segundo painel em escala expandida ao lado, com a quebra declarada, nunca truncar o painel principal.

**Referências.**

* Catálogo: [Data to Viz, lollipop](https://www.data-to-viz.com/graph/lollipop.html). Observar o argumento principal: barras de altura parecida criam efeito moiré e o lollipop desfaz isso.
* Catálogo: [UNHCR Dataviz, ranking](https://dataviz.unhcr.org/chart-types/ranking/). Observar em que ponto o guia troca barra por lollipop na família de ranking (apareceu na busca; página não aberta).
* Praticante: [Tableau, when to use a lollipop chart](https://www.tableau.com/blog/viz-whiz-when-use-lollipop-chart-and-how-build-one-64267). Observar a ressalva de precisão: o valor mora no centro do ponto, e isso é mais difícil de ler que uma ponta de barra (apareceu na busca; página não aberta).
* Praticante: [Tufte, cancer survival rates](https://www.edwardtufte.com/notebook/cancer-survival-rates-tables-slopegraphs-barcharts/). Observar a lógica de razão tinta sobre dado, que é a justificativa do formato.
* Implementação: [Recharts VerticalComposedChart](https://recharts.github.io/en-US/examples/VerticalComposedChart/). Observar a combinação de `Bar` e outra série no mesmo layout vertical, que é o esqueleto do lollipop.
* Vizinhança: com dois pontos por categoria, o lollipop vira dumbbell e muda de casa para 17_comparacao-de-pontos.
* Portal de design: [Dribbble, busca progress-indicator](https://dribbble.com/search/progress-indicator). Observar hastes finas com ponto terminal em peças de painel (listagem de busca; peças individuais não abertas).

### 2.18 Corrida de barras

**Descrição.** Barras horizontais ordenadas que trocam de posição ao longo do tempo, animadas. É peça de narrativa, não de análise: serve para abrir uma apresentação, não para sustentar uma decisão.

**Anatomia.** Top N barras (tipicamente 10) ordenadas do maior para o menor; rótulo de categoria acompanhando a barra; valor animado na ponta; relógio grande no canto indicando o período corrente; eixo numérico com máximo dinâmico.

**Abordagem na stack:** `svg-puro` com transição CSS. A receita é: manter uma lista ordenada por período, calcular a posição `y` de cada categoria por índice no ranking e animar `transform: translateY` e a largura da barra com `transition`; a chave do React é a categoria, nunca o índice, senão o React recicla o nó e a barra troca de identidade no meio da animação. O Recharts não tem esse modo; o ECharts tem `realtimeSort` na série de barras e serve de especificação de comportamento, com `yAxis.inverse`, `animationDurationUpdate` em torno de 300 ms e `xAxis.max: 'dataMax'`.

**Ponto delicado.** Além da animação, o problema é editorial: a crítica corrente é que a corrida entretém e informa pouco, porque o leitor não consegue reter a trajetória; Bostock resume como entretenimento, não análise. Se a pergunta é "como o ranking evoluiu", o formato correto é o slope ou o bump da família 04_linhas. Tecnicamente: passo de tempo curto demais embaralha as barras e a leitura morre; interpolar entre períodos para suavizar cria valores que nunca existiram, e isso precisa estar dito. Acessibilidade: respeitar `prefers-reduced-motion` e oferecer um controle de pausa e um estado final estático.

**Versões sugeridas.**

* **V1 Básico.** Top 10 origens de lead mês a mês nos últimos 24 meses, com relógio no canto e botão de pausa.
* **V2 Com anotação.** Mesma corrida com marcos fixos no tempo ("início da campanha X", "troca de plataforma"), que congelam a animação por um segundo e mostram um texto curto.
* **V3 Caso denso do Farol.** Abertura de reunião de diretoria: corrida de receita acumulada por linha de negócio nos 8 trimestres, terminando no quadro estático que sustenta o resto da apresentação.
* **V4 Caso limite.** Categoria que entra no top 10 e sai várias vezes: a entrada e a saída precisam de transição de opacidade, senão a barra pisca; período sem dado não pode ser interpolado como zero, tem que congelar o último valor conhecido com indicação visual.

**Referências.**

* Catálogo: [ECharts, bar racing](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/bar-race/). Observar `realtimeSort`, `yAxis.inverse`, os 300 ms de reordenação e `xAxis.max: 'dataMax'`, que são a especificação de comportamento a replicar em SVG.
* Catálogo: [Highcharts, bar race demo](https://www.highcharts.com/demo/bar-race/sand-signika). Observar o controle de reprodução e o relógio como parte da peça (apareceu na busca; página não aberta).
* Praticante: [Built In, why some experts hate bar chart races](https://builtin.com/data-science/bar-chart-races). Observar as duas posições: a crítica de sobrecarga sem guia para o olho e a defesa de Duncan Clark para conjuntos com muitas entidades (apareceu na busca; página não aberta).
* Praticante: [Big Think, bar chart races: short on analysis, but fun to watch](https://bigthink.com/strange-maps/bar-chart-races/). Observar o enquadramento como peça de entretenimento (apareceu na busca; página não aberta).
* Implementação: [Flourish, bar chart race](https://flourish.studio/visualisations/bar-chart-race/). Observar os controles padrão que o público já espera: barra de tempo, velocidade e top N (apareceu na busca; página não aberta).
* Vizinhança: para ranking ao longo do tempo em peça estática e analisável, ir para o bump e o slope da família 04_linhas.

## Modelos que moram melhor em outra família

Ficam registrados aqui porque aparecem nas buscas por barra horizontal, mas o estudo deles pertence a outro lugar do catálogo.

* **Dumbbell e barra de alteres.** Dois pontos por categoria ligados por uma linha. Parece barra, mas o dado é a distância entre dois estados, não o comprimento a partir do zero. Casa: 17_comparacao-de-pontos.
* **Gantt.** Barras que flutuam entre duas datas. Geometricamente é a 2.16, semanticamente é cronograma. Casa: 20_cronograma-e-linha-do-tempo.
* **Funil e barras afuniladas.** Barras horizontais decrescentes centradas, com taxa de passagem entre etapas. Casa: 10_funil.
* **Marimekko e mosaico.** Empilhada 100% em que a espessura da barra também codifica um valor. Casa: 26_mosaico-marimekko.
* **Cascata horizontal.** Barras flutuantes encadeadas mostrando como um total se forma. Casa: 19_cascata-waterfall.
* **Barra dentro de célula de tabela.** Barra como microvisual numa linha de tabela densa, com cabeçalho e ordenação. Casa: 14_tabelas-visuais, com empréstimo do desenho de 2.12 e 2.13.
* **Histograma horizontal.** Barras coladas sobre um eixo contínuo binado. A colagem é o que distingue do gráfico de barras, e o erro de confundir os dois está listado no Data to Viz. Casa: 16_distribuicao.
* **Barra radial e progresso em arco.** A mesma leitura de 2.13 enrolada num arco, com perda de precisão. Casa: 07_rosca-e-radial.

## Notas de implementação que valem para a família inteira

1. **Altura derivada do número de categorias.** `height = topo + rodape + categorias * passo`, com passo entre 24 e 36 px. `ResponsiveContainer` com altura percentual em lista longa produz barras finas demais.
2. **Ordenação é responsabilidade do seletor.** O Recharts desenha na ordem do array. Ordenar em TypeScript, com desempate estável (valor, depois nome), senão a ordem muda a cada refetch quando há empate.
3. **`YAxis width="auto"`** resolve a largura do rótulo no Recharts 3; antes disso era número fixo. Ainda assim, limitar o rótulo a um número de caracteres e expor o texto completo no `title` e no tooltip.
4. **Formatação em um lugar só.** `Intl.NumberFormat('pt-BR')` num módulo de formatação, usado pelo `tickFormatter`, pelo `LabelList formatter` e pelo tooltip. Três formatações diferentes na mesma tela é o defeito mais frequente.
5. **Cor por token.** Nunca literal hexadecimal no JSX; `fill="var(--farol-serie-1)"`, com a paleta definida uma vez para tema escuro e tema claro, como no padrão de `ChartConfig` do shadcn.
6. **`Cell` é caminho morto.** Está deprecado no Recharts 3 e sai na 4.0. Cor por item vai por `shape` ou por um campo `fill` no próprio dado, que é o que o `chart-bar-mixed` do shadcn faz.
7. **Zero, nulo e não coletado são três coisas.** Zero desenha rótulo sem barra; nulo não desenha nada e escreve "sem dado"; não coletado escreve "sem coleta" em tom apagado. Confundir os três é o erro que mais estraga leitura de cobertura no Farol.
8. **Tooltip só quando acrescenta.** Se todo valor está rotulado, o tooltip vira ruído; reservá lo para o detalhe que não cabe na tela (composição, n, período).

## Fontes consultadas

**Catálogos e guias de forma**

* [FT Visual Vocabulary, repositório chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary)
* [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html)
* [Data Viz Catalogue, Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html)
* [Data Viz Catalogue, busca por range](https://datavizcatalogue.com/search/range.html) (apareceu na busca; não aberta)
* [Data to Viz, barplot](https://www.data-to-viz.com/graph/barplot.html)
* [Data to Viz, caveat de ordenação](https://www.data-to-viz.com/caveat/order_data.html)
* [Data to Viz, caveat de empilhamento](https://www.data-to-viz.com/caveat/stacking.html)
* [Data to Viz, lollipop](https://www.data-to-viz.com/graph/lollipop.html)
* [Data Viz Project, Butterfly Chart](https://datavizproject.com/data-type/butterfly-chart/) (não abriu, HTTP 403)
* [Data Viz Project, Span Chart](https://datavizproject.com/data-type/span-chart/) (não abriu, HTTP 403)
* [UNHCR Dataviz, ranking](https://dataviz.unhcr.org/chart-types/ranking/) (apareceu na busca; não aberta)
* [Wikipedia, bullet graph](https://en.wikipedia.org/wiki/Bullet_graph)
* [Wikipedia, population pyramid](https://en.wikipedia.org/wiki/Population_pyramid) (apareceu na busca; não aberta)
* [Domo, divergent bar charts](https://www.domo.com/learn/charts/divergent-bar-charts) (apareceu na busca; não aberta)

**Gramáticas e galerias de biblioteca**

* [Vega Lite, índice de exemplos](https://vega.github.io/vega-lite/examples/)
* [Vega Lite, bar_aggregate_sort_by_encoding](https://vega.github.io/vega-lite/examples/bar_aggregate_sort_by_encoding.html)
* [Vega Lite, layer_bar_labels_grey](https://vega.github.io/vega-lite/examples/layer_bar_labels_grey.html)
* [Vega Lite, bar_grouped](https://vega.github.io/vega-lite/examples/bar_grouped.html)
* [Vega Lite, bar_layered_transparent](https://vega.github.io/vega-lite/examples/bar_layered_transparent.html)
* [Vega Lite, stacked_bar_h_normalized_labeled](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html)
* [Vega Lite, bar_diverging_stack_transform](https://vega.github.io/vega-lite/examples/bar_diverging_stack_transform.html)
* [Vega Lite, bar_diverging_stack_population_pyramid](https://vega.github.io/vega-lite/examples/bar_diverging_stack_population_pyramid.html)
* [Vega Lite, layer_likert](https://vega.github.io/vega-lite/examples/layer_likert.html) (listado no índice; não aberta)
* [Observable Plot, bar mark](https://observablehq.com/plot/marks/bar) (não abriu, HTTP 429)
* [Observable Plot, diverging stacked bars](https://observablehq.com/@observablehq/plot-diverging-stacked-bar) (apareceu na busca; não aberta)
* [ECharts, bar-y-category-stack (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-y-category-stack.ts)
* [ECharts, bar-stack-normalization (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-stack-normalization.ts)
* [ECharts, handbook bar racing](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/bar-race/)
* [Highcharts, column placement (código da demo)](https://raw.githubusercontent.com/highcharts/highcharts/master/samples/highcharts/demo/column-placement/demo.js)
* [Highcharts, bar race demo](https://www.highcharts.com/demo/bar-race/sand-signika) (apareceu na busca; não aberta)
* [AG Charts, bar series](https://www.ag-grid.com/charts/react/bar-series/)
* [Flourish, bar chart race](https://flourish.studio/visualisations/bar-chart-race/) (apareceu na busca; não aberta)

**Implementação na stack do Farol**

* [Recharts, API do Bar](https://recharts.github.io/en-US/api/Bar/)
* [Recharts, API do BarChart](https://recharts.github.io/en-US/api/BarChart/)
* [Recharts, API do BarStack](https://recharts.github.io/en-US/api/BarStack/)
* [Recharts, API do Cell (deprecado)](https://recharts.github.io/en-US/api/Cell/)
* [Recharts, exemplo VerticalComposedChart](https://recharts.github.io/en-US/examples/VerticalComposedChart/)
* [Recharts, exemplo BarChartWithCustomizedEvent](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/)
* [shadcn, chart-bar-horizontal.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-horizontal.tsx)
* [shadcn, chart-bar-active.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-active.tsx)
* [shadcn, chart-bar-mixed.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-mixed.tsx)
* [shadcn, galeria de gráficos de barra](https://ui.shadcn.com/charts/bar) (apareceu na busca; não aberta)
* [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist)
* [Tremor, CategoryBar](https://www.tremor.so/docs/visualizations/category-bar)
* [Tremor, BarChart](https://tremor.so/docs/visualizations/bar-chart)
* [Tremor NPM, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars) (apareceu na busca; não aberta)

**Praticantes**

* [Storytelling with Data, what is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart)
* [Storytelling with Data, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars)
* [Storytelling with Data, what is a bullet graph](https://www.storytellingwithdata.com/blog/what-is-a-bullet-graph)
* [Stephen Few, Bar Widths and the Spaces in Between (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf)
* [Stephen Few, displays for combining time series and part to whole (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf)
* [Stephen Few, Bullet Graph Design Specification (PDF)](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf) (baixou como binário; não legível pela ferramenta)
* [Edward Tufte, cancer survival rates: tables, slopegraphs, barcharts](https://www.edwardtufte.com/notebook/cancer-survival-rates-tables-slopegraphs-barcharts/)
* [Datawrapper, the case against diverging stacked bars](https://www.datawrapper.de/blog/divergingbars)
* [Data Revelations, rethinking the divergent stacked bar chart](https://www.datarevelations.com/rethinkingdivergent/) (apareceu na busca; não aberta)
* [Heiberger e Robbins, design of diverging stacked bar charts for Likert scales](https://www.researchgate.net/publication/289590282_Design_of_Diverging_Stacked_Bar_Charts_for_Likert_Scales_and_Other_Applications) (apareceu na busca; não aberta)
* [Nightingale, beyond the bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/)
* [Clearly and Simply, an alternative design of bullet graphs](https://www.clearlyandsimply.com/2017/05/an-alternative-design-of-bullet-graphs/) (apareceu na busca; não aberta)
* [Tableau, when to use a lollipop chart](https://www.tableau.com/blog/viz-whiz-when-use-lollipop-chart-and-how-build-one-64267) (apareceu na busca; não aberta)
* [Built In, why some experts hate bar chart races](https://builtin.com/data-science/bar-chart-races) (apareceu na busca; não aberta)
* [Big Think, bar chart races](https://bigthink.com/strange-maps/bar-chart-races/) (apareceu na busca; não aberta)
* [Observable, about population pyramids](https://observablehq.com/@didoesdigital/15-july-2020-about-population-pyramids) (apareceu na busca; não aberta)
* [xD Gov, Data Visualization Standards, population pyramid](https://xdgov.github.io/data-design-standards/visualizations/population-pyramid) (apareceu na busca; não aberta)
* [Depict Data Studio, span charts](https://depictdatastudio.com/span-charts/)
* [IBCS 2.0](https://www.ibcs.com/ibcs-version-2-0/)

**Portais de design**

* [Behance, Bar Chart Design in Figma](https://www.behance.net/gallery/145652823/Bar-Chart-Design-in-Figma)
* [Behance, Interactive Hover Bar Chart for Job Statistics](https://www.behance.net/gallery/212978419/Interactive-Hover-Bar-Chart-for-Job-Statistics)
* [Behance, Sales Dashboard](https://www.behance.net/gallery/194252083/Sales-Dashboard)
* [Behance, SaaS Dashboard e Analytics](https://www.behance.net/gallery/254777417/SaaS-Dashboard-Analytics-Web-Application)
* [Behance, stacked bar chart](https://www.behance.net/gallery/43416395/stacked-bar-chart)
* [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard)
* [Dribbble, Figma Charts UI kit, dashboard dark templates](https://dribbble.com/shots/15100032-Figma-Charts-UI-kit-Dashboard-dark-templates)
* [Dribbble, tag bar_chart](https://dribbble.com/tags/bar_chart)
* [Dribbble, tag barchart](https://dribbble.com/tags/barchart)
* [Dribbble, tag bar-graph](https://dribbble.com/tags/bar-graph)
* [Dribbble, tag progress-bar](https://dribbble.com/tags/progress-bar)
* [Dribbble, tag chart](https://dribbble.com/tags/chart)
* [Dribbble, busca progress-table](https://dribbble.com/search/progress-table)
* [Dribbble, busca progress-indicator](https://dribbble.com/search/progress-indicator)
* [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit)
* [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1066019348443074842/dashboard-charts-ui-kit)
* [Figma Community, Dark Theme Dashboard UI Kit with Prototyping](https://www.figma.com/community/file/1185617660562911231/dark-theme-dashboard-ui-kit-with-prototyping)
* [Figma Community, DarkMode Dashboard Design](https://www.figma.com/community/file/1281961549597623375/darkmode-dashboard-design)

_Estudo concluído em 2026-09-14. Nesta sessão de continuação houve 12 tentativas de WebFetch, 8 com conteúdo aproveitado (Datawrapper, índice de exemplos do Vega Lite, bar_diverging_stack_transform, Tremor BarList, API do Bar do Recharts, shadcn chart-bar-mixed, Wikipedia bullet graph, Depict Data Studio) e 4 falhas (Data Viz Project butterfly e span com HTTP 403, Observable Plot com HTTP 429, PDF da especificação do bullet graph devolvido em binário). Os links da primeira sessão, dos modelos 2.1 a 2.6, estão listados acima do mesmo jeito. Tudo que veio apenas de resultado de busca está marcado como não aberto._
