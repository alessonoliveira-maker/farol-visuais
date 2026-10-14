# 03 Colunas verticais

> Família do catálogo VISUAIS do Farol. Estudo feito em 2026-09-14. Todos os casos de uso são fictícios; nomes de pessoas, plataformas e produtos são rótulos genéricos.
> Stack alvo: React 18.3 + TypeScript strict + Recharts 3.10 + Tailwind 4 + lucide-react. Bibliotecas de terceiros aparecem só como referência de desenho.

## O que a família responde

Colunas comparam magnitudes em categorias curtas e, sobretudo, em **períodos discretos** (semana, mês, trimestre): o tempo corre da esquerda para a direita e a altura codifica o valor. O FT chama a coluna de "a forma padrão de comparar tamanhos" e exige começar em zero. Quando o que importa é a tendência contínua e não o volume de cada período, a família certa é linhas (04) (Few, sobre séries temporais).

Perguntas típicas no Farol:

* Quanto entrou em cada período e como o período atual se compara? (leads por semana, mês corrente destacado)
* Batemos a meta em cada mês? (receita reconhecida contra meta mensal)
* De que é feito o total de cada período? (custo mensal em três camadas)
* Quanto foi realizado e quanto é projeção? (receita do ano com forecast hachurado)
* Quando passamos do teto? (carga diária da fila contra a capacidade)
* O saldo foi positivo ou negativo? (clientes novos menos perdidos por mês)
* Qual é a faixa provável por período? (cenários de receita por trimestre)

## Regras que valem para a família inteira

1. **Zero sempre.** A altura é o dado (FT, SWD, Wikipedia). Se o eixo precisa começar acima de zero, a forma certa é ponto ou linha.
2. **Período em ordem cronológica**, nunca ordenado por valor; ordenar por valor só em categorias não temporais com poucos itens (FT, "Ordered column").
3. **Rótulos com parcimônia.** Em séries longas, rotular só máximo, mínimo, último e o período em foco; em séries curtas, `LabelList position="top"` (shadcn `chart-bar-label`).
4. **Período incompleto é marcado.** Mês corrente parcial parece queda; marcar como parcial ou mostrar projeção (Few propõe dividir a barra em realizado e projeção).
5. **Cor semântica pela polaridade da métrica**, não pelo sinal (Few, despesas com faixas invertidas).
6. **Recharts:** `BarChart` padrão (layout horizontal) com `XAxis dataKey="periodo"` e `YAxis`; `ReferenceLine` para meta e média, `ReferenceArea` para janelas, `Brush` para séries longas, `syncId` para painéis alinhados.
7. **`Cell` está deprecado** (sai na 4.0): cor por coluna via `shape`.
8. **Padrões SVG** (hachura) via `<defs><pattern>` dentro do gráfico. O exemplo oficial AreaChartFillByValue confirma que um componente que devolve `<defs>` pode ser filho do gráfico.
9. **Tema escuro.** Tokens CSS em `fill` e `stroke`; hachura com traço claro sobre fundo transparente para não virar mancha.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 3.1 | Colunas simples | Uma medida por período ou por poucas categorias | Rótulos longos (use barras) ou mais de ~30 períodos | Rotular todas as colunas numa série longa |
| 3.2 | Colunas agrupadas | 2 ou 3 séries por período | Mais de 3 séries | Cores sem relação entre anos |
| 3.3 | Colunas empilhadas com total | Total por período e sua composição | Comparar componentes do meio ao longo do tempo | Omitir o total |
| 3.4 | Colunas empilhadas 100% | Mix por período | Tamanho absoluto relevante | Esconder o n |
| 3.5 | Colunas agrupadas e empilhadas | Duas pilhas por período (orçado e realizado) | Mais de 2 pilhas | Legenda que não distingue pilha de componente |
| 3.6 | Colunas positivo e negativo | Saldo ou variação com sinal | Todos os valores positivos | Cor por sinal para métrica de custo |
| 3.7 | Colunas empilhadas por sinal | Entradas e saídas por período, com componentes | Só o saldo interessa | Sem marcador de saldo líquido |
| 3.8 | Colunas com linha de meta ou média | Referência única ou em degraus | Meta muda a cada coluna e é o foco (use 3.10) | Média contaminada pelo período parcial |
| 3.9 | Colunas com excedente acima do limiar | Mostrar quanto passou do teto | Limiar irrelevante para a decisão | Colorir a coluna inteira |
| 3.10 | Colunas sobrepostas | Realizado contra meta por período | Duas medidas sem relação de referência | Coluna da frente mais larga |
| 3.11 | Realizado e projeção hachurado | Ano com meses fechados e meses projetados | Projeção sem método declarado | Hachura sem legenda |
| 3.12 | Destaque do período atual | Série de períodos com foco no atual | Quando todos os períodos importam igual | Destacar mês parcial sem aviso |
| 3.13 | Colunas com painel de variação | Realizado contra referência e a diferença | Público sem hábito de ler variação | Cor da variação ignorando polaridade |
| 3.14 | Colunas de faixa | Intervalo mínimo e máximo por período | Distribuição interna importa | Faixa sem valor central |
| 3.15 | Colunas em small multiples | Muitas séries que não cabem num gráfico só | Poucas séries (use agrupadas) | Escala diferente em cada painel sem avisar |
| 3.16 | Colunas com eixo de tempo em dois níveis | Mês dentro de trimestre, semana dentro de mês | Série curta de um nível só | Repetir o rótulo do nível de cima em toda coluna |
| 3.17 | Colunas com anotação de evento | Marcar quando algo mudou (campanha, preço, regra) | Eventos demais no mesmo período | Anotação cobrindo a coluna que explica |

## Modelos

### 3.1 Colunas simples

**Descrição.** Uma coluna por período (ou por categoria curta), todas nascendo do zero, lado a lado na ordem do tempo. É o formato padrão para "quanto entrou em cada mês" e a base de todos os outros modelos da família.

**Anatomia.** Eixo horizontal de períodos com rótulo curto (`jan`, `S12`, `1T26`); eixo vertical numérico começando em zero, com poucas marcas; colunas de largura constante e respiro entre elas; valor rotulado só onde a mensagem exige; título que já diz a leitura ("Agosto foi o maior mês do ano").

**Abordagem na stack:** `recharts-nativo`. `BarChart` com `XAxis dataKey="periodo" tickLine={false}`, `YAxis` com `tickFormatter` em `Intl.NumberFormat('pt-BR', { notation: 'compact' })`, `Bar dataKey="valor" radius={[4, 4, 0, 0]}` e `CartesianGrid vertical={false}`. É o desenho do `chart-bar-default` do shadcn e do exemplo Simple Bar Chart do Recharts.

**Ponto delicado.** O eixo de períodos é **ordinal**, não temporal: o Recharts distribui as categorias em passos iguais, então um mês faltante some sem deixar buraco e a série mente sobre a cadência. A correção é preencher a série em TypeScript, gerando todos os períodos do intervalo antes do render, com `valor: null` onde não houve coleta; é o mesmo problema que o Observable Plot resolve com a opção `interval`, que força uniformidade e mostra o vão. Largura: com poucas colunas o Recharts engorda cada uma até virarem blocos, então travar com `maxBarSize`.

**Versões sugeridas.**

* **V1 Básico.** Leads por mês nos últimos 12 meses, eixo em zero, rótulo só no maior e no último.
* **V2 Com anotação.** Mesma série com `ReferenceLine y={media}` tracejada e a etiqueta "média 12m"; o título aponta o mês que rompeu a média.
* **V3 Caso denso do Farol.** Pré-vendas: entradas por semana nas últimas 26 semanas, com `Brush` embaixo limitando a janela visível a 13 semanas e `maxBarSize={18}`; o eixo mostra uma marca a cada 4 semanas via `interval`, não todas.
* **V4 Caso limite.** Semana sem coleta no meio da série: a coluna não é desenhada e o espaço recebe uma marca cinza de altura mínima com o texto "sem dado" no tooltip. Nunca desenhar zero, porque zero é uma medição e ausência não é.

**Referências.**

* Catálogo: [Data Viz Catalogue, Bar Chart](https://datavizcatalogue.com/methods/bar_chart.html). Observar que a página trata coluna como a variante vertical da barra e lista as anatomias comuns (apareceu na busca; página não aberta).
* Catálogo: [Datawrapper Academy, por que colunas começam em zero](https://www.datawrapper.de/academy/why-our-column-and-bar-charts-start-at-zero). Observar as três saídas propostas quando zero achata tudo: dot plot, linha ou recalcular a medida como diferença.
* Catálogo: [Observable Plot, bar mark](https://observablehq.com/plot/marks/bar) (não abriu: HTTP 429) e [Interval transform](https://observablehq.com/plot/transforms/interval). Observar a opção `interval`, que força a cadência e revela os períodos ausentes em vez de escondê-los.
* Praticante: [FlowingData, Bar Chart Baselines Start at Zero](https://flowingdata.com/2015/08/31/bar-chart-baselines-start-at-zero/). Observar o argumento de que o comprimento codifica o valor, então deslocar a base quebra a proporção (apareceu na busca; página não aberta).
* Praticante: [FlowingData, Real Chart Rules to Follow](https://flowingdata.com/2015/08/11/real-chart-rules-to-follow/). Observar a separação entre regra real (zero na coluna) e gosto pessoal (apareceu na busca; página não aberta).
* Implementação: [Recharts, Simple Bar Chart](https://recharts.github.io/en-US/examples/SimpleBarChart/) e [Tiny Bar Chart](https://recharts.github.io/en-US/examples/TinyBarChart/). Observar a versão sem eixos, que é a ponte para a família 24.
* Implementação: [shadcn/ui, diretório de charts](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts), arquivo `chart-bar-default.tsx`. Observar o esqueleto mínimo: `ChartContainer`, `CartesianGrid vertical={false}`, `XAxis` sem linha e `Bar` com `radius`.
* Portal de design: [Dribbble, Bar Chart Dashboard Card (Dark Theme)](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme). Observar o tratamento da coluna sobre fundo escuro e a economia de grade (apareceu na busca; peça não aberta).

### 3.2 Colunas agrupadas

**Descrição.** Duas ou três colunas lado a lado dentro de cada período, uma por série. Serve para "este ano contra o ano passado", "marcado contra realizado", "orçado contra gasto".

**Anatomia.** Banda por período; dentro dela, uma coluna por série com cor fixa; espaço pequeno dentro do grupo e grande entre grupos; legenda no topo, na mesma ordem das colunas; eixo numérico único.

**Abordagem na stack:** `recharts-nativo`. Vários `Bar` sem `stackId`; `barGap` controla o vão dentro do grupo e `barCategoryGap` o vão entre períodos. É o `chart-bar-multiple` do shadcn e o `type="default"` da Tremor.

**Ponto delicado.** A leitura degrada rápido: com 4 séries por período o olho perde o par a comparar. Acima de 3, ir para small multiples (3.15) ou linhas (04). Quando as séries são anos, a cor precisa ser uma **progressão do mesmo matiz** (claro para o ano antigo, forte para o atual), não duas cores categóricas, senão o leitor lê como coisas diferentes em vez de dois momentos da mesma coisa. E séries com ordem de grandeza diferente (leads e vendas) não convivem no mesmo eixo: isso é a família 08.

**Versões sugeridas.**

* **V1 Básico.** Agendas marcadas e agendas realizadas por mês, 6 meses, duas colunas por mês.
* **V2 Com destaque.** Ano corrente contra o anterior, ano anterior em tom apagado e ano corrente em cor forte, com o delta anotado só no mês de maior diferença.
* **V3 Caso denso do Farol.** Marketing: leads por mês em três plataformas de mídia paga, 12 meses, 3 colunas por mês; acima de 8 meses visíveis o componente oferece trocar para small multiples e o rodapé traz o total por plataforma.
* **V4 Caso limite.** Plataforma que só começou a rodar em maio: de janeiro a abril a coluna simplesmente não existe e a legenda ganha a nota "Plataforma C entra em mai"; não desenhar coluna de altura zero, que seria lida como investimento sem retorno.

**Referências.**

* Catálogo: [Data Viz Catalogue, Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html). Observar o alerta de que o formato perde legibilidade conforme cresce o número de colunas por grupo (apareceu na busca; página não aberta).
* Catálogo: [Datawrapper Academy, como criar colunas agrupadas](https://academy.datawrapper.de/article/21-how-to-create-a-grouped-column-chart) e [como customizar](https://academy.datawrapper.de/article/45-customizing-your-grouped-column-chart). Observar a recomendação de agrupadas quando a comparação entre partes importa mais que o total (apareceram na busca; páginas não abertas).
* Catálogo: [Observable, Plot: Time series grouped bars](https://observablehq.com/@observablehq/plot-time-series-grouped-bars). Observar o agrupamento declarativo como alternativa ao ajuste manual de `barGap` (apareceu na busca; notebook não aberto).
* Praticante: [Nightingale, Tear Up Your Baseline](https://nightingaledvs.com/tear-up-your-baseline/). Observar o argumento da linha de zero como condição de honestidade, que é o que limita o agrupado a séries de mesma grandeza (apareceu na busca; artigo não aberto).
* Implementação: [shadcn/ui, diretório de charts](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts), arquivo `chart-bar-multiple.tsx`, e [Grouped Bar Chart no shadcn.io](https://www.shadcn.io/charts/bar-chart/bar-chart-04). Observar dois `Bar` irmãos com o mesmo `radius` e a legenda gerada do `chartConfig` (shadcn.io apareceu na busca; página não aberta).
* Implementação: [Tremor, BarChart](https://www.tremor.so/docs/visualizations/bar-chart). Observar os três `type` (`default`, `stacked`, `percent`) e o `onValueChange`, que transforma a coluna em filtro.
* Portal de design: [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit). Observar as variantes de grupo e a versão escura dos componentes (apareceu na busca; arquivo não aberto).

### 3.3 Colunas empilhadas com total

**Descrição.** Uma coluna por período dividida em segmentos empilhados, um por componente. A altura total responde "quanto foi o período" e os segmentos respondem "de que isso é feito".

**Anatomia.** Coluna por período; segmentos na mesma ordem em todas as colunas; o componente mais importante encostado na base; legenda na ordem inversa da pilha (o topo da legenda corresponde ao topo da pilha); total opcional rotulado acima da coluna; eixo numérico em zero.

**Abordagem na stack:** `recharts-nativo`. Vários `Bar` com o mesmo `stackId`; `radius` só no último `Bar` da pilha, senão cada segmento ganha canto arredondado e a coluna vira uma torre de pastilhas. O total acima vem de um `LabelList` no `Bar` do topo com `position="top"` e um `formatter` que lê o total já calculado no dado.

**Ponto delicado.** Só o segmento da base e o total têm linha de referência comum; os do meio flutuam e não podem ser comparados entre períodos, que é exatamente o alerta da Datawrapper ("é difícil para o leitor comparar colunas que não começam na mesma base") e a razão de Few preferir linhas ou small multiples quando a pergunta é a evolução de um componente. Ordem dos segmentos: fixa e escolhida, com a série que o leitor mais precisa acompanhar na base. E o total precisa ser somado no seletor em TypeScript, porque o Recharts não expõe o total da pilha para rotular.

**Versões sugeridas.**

* **V1 Básico.** Leads por mês divididos em 3 origens, 6 meses, total rotulado acima de cada coluna.
* **V2 Com destaque.** Mesma pilha com todos os segmentos em neutro e só a origem em foco na cor forte, com a nota "origem paga responde por 55% do volume e por nenhuma vitória"; a comparação da origem em foco fica honesta porque ela está na base.
* **V3 Caso denso do Farol.** Diretoria: custo mensal em três camadas (camada 1 direta, camada 2 com rateio de time, camada 3 com estrutura) ao longo de 12 meses, total rotulado e a etiqueta da camada no tooltip dizendo qual perímetro cada uma usa.
* **V4 Caso limite.** Cauda longa: 14 origens viram as 5 maiores mais "Outras 9", com o "Outras" sempre no topo da pilha, em cinza, e o tooltip listando o que entrou nela. Componente com valor zero no mês não desenha segmento e some da legenda daquele tooltip.

**Referências.**

* Catálogo: [Datawrapper Academy, o que considerar em colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts). Observar duas regras diretas: "traga o valor mais importante para a base" e agrupar os menores em "Outros".
* Catálogo: [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html). Observar a distinção entre a pilha simples e a de 100% e a menção ao problema de comparar segmentos (apareceu na busca; página não aberta).
* Catálogo: [Vega Lite, Stack](https://vega.github.io/vega-lite/docs/stack.html). Observar os quatro offsets (`zero`, `normalize`, `center`, `null`), que são exatamente os modelos 3.3, 3.4, streamgraph (família 05) e 3.10.
* Praticante: [Few, Quantitative Displays for Combining Time Series and Part to Whole Relationships (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf) (não abriu como texto: o PDF veio em binário). Observar, ao abrir num leitor, as alternativas propostas à pilha quando as duas perguntas aparecem juntas.
* Praticante: [HealthDataViz, Raising the Bar on Stacked Bar Charts](https://healthdataviz.com/2016/04/15/raising-bar-stacked-bar-charts/). Observar a crítica prática ao excesso de segmentos por coluna (apareceu na busca; página não aberta).
* Implementação: [Recharts, Stacked Bar Chart](https://recharts.github.io/en-US/examples/StackedBarChart/) e [shadcn/ui, `chart-bar-stacked.tsx`](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts). Observar o `stackId` compartilhado e o `radius` aplicado só na ponta da pilha.
* Portal de design: [Behance, Data Visualization Dashboard UI Kit](https://www.behance.net/gallery/81085955/Data-Visualization-Dashboard-UI-Kit). Observar os modos claro e escuro do mesmo componente empilhado (apareceu na busca; projeto não aberto).

### 3.4 Colunas empilhadas 100%

**Descrição.** Cada coluna é normalizada para a altura total, então o que se lê é o **mix** de cada período, não o tamanho. Ganha uma segunda base de comparação no topo, além da de baixo.

**Anatomia.** Colunas de mesma altura; eixo em percentual de 0 a 100; segmentos rotulados em percentual quando cabem; um lugar visível para o `n` de cada período (rótulo acima da coluna, linha de apoio abaixo do eixo ou tooltip); legenda fixa.

**Abordagem na stack:** duas rotas. `recharts-nativo` quando a normalização é feita no seletor em TypeScript (cada segmento vira percentual antes do render) e o `Bar` empilhado desenha direto; é o que a Tremor chama de `type="percent"`. `recharts-custom` só se for preciso guardar o valor absoluto no payload para o tooltip, o que se resolve mandando ambos no mesmo objeto de dado (`valor` e `pct`) e formatando o tooltip.

**Ponto delicado.** O 100% esconde o tamanho e, com isso, esconde o colapso: um mês com 12 leads e um com 900 ficam idênticos. A regra de sobrevivência é sempre exibir o `n`; sem ele o gráfico é decorativo. Segundo ponto: percentuais arredondados não somam 100, então arredondar com sobra alocada ao maior segmento e não deixar o rótulo denunciar 99 ou 101. Terceiro: com segmento abaixo de uns 4% o rótulo não cabe dentro e precisa sair ou desaparecer.

**Versões sugeridas.**

* **V1 Básico.** Mix de origem dos leads por mês nos últimos 6 meses, com o `n` do mês acima de cada coluna.
* **V2 Com anotação.** Mesma leitura com uma seta e a nota "mix vira 70% pago em abr" ancorada no período em que o segmento passa do limiar.
* **V3 Caso denso do Farol.** Comercial: composição das perdas por motivo, por trimestre, em 8 trimestres; motivos ordenados por peso no trimestre mais recente, os 3 menores agrupados em "Outros", e o `n` de perdas no rodapé de cada coluna.
* **V4 Caso limite.** Trimestre com `n` igual a 4: a coluna é desenhada em hachura leve com a etiqueta "amostra pequena" e o tooltip diz "4 perdas, leitura instável"; trimestre sem nenhuma perda registrada fica vazio com o texto "sem registro", nunca uma coluna cheia de "Outros".

**Referências.**

* Catálogo: [Vega Lite, Normalized (Percentage) Stacked Bar Chart](https://vega.github.io/vega-lite/examples/stacked_bar_normalize.html) e a [versão com rótulos](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html). Observar `stack: "normalize"` e o rótulo centrado no segmento (apareceram na busca; páginas não abertas).
* Catálogo: [Highcharts, Stacked Percentage Column](https://www.highcharts.com/demo/highcharts/column-stacked-percent). Observar a legenda e o tooltip que mostram valor absoluto e percentual juntos, que é a correção do defeito do formato (apareceu na busca; demo não aberta).
* Catálogo: [Datawrapper Academy, o que considerar em colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts). Observar a observação de que o 100% cria uma segunda base de comparação no topo do gráfico.
* Praticante: [Storytelling with Data, sobre 100% empilhado](https://www.storytellingwithdata.com/blog/2016/1/12/is-there-a-single-right-answer). Observar que não existe resposta única e que a escolha depende da pergunta que se quer responder (apareceu na busca; post não aberto).
* Praticante: [Anchoring and Alignment: Data Factors in Part to Whole Visualization (arXiv)](https://arxiv.org/pdf/2508.01881). Observar a evidência experimental sobre quanto a ancoragem na base afeta a precisão da leitura de partes (apareceu na busca; PDF não aberto).
* Implementação: [Tremor, BarChart](https://www.tremor.so/docs/visualizations/bar-chart). Observar o `type="percent"` e o `valueFormatter`, que resolvem o rótulo em percentual sem alterar o dado de origem.
* Portal de design: [Figma Community, Charts and Graphs UI Kit](https://www.figma.com/community/file/1314538669933482880/charts-graphs-ui-kit). Observar como o kit trata segmentos minúsculos e o posicionamento do rótulo (apareceu na busca; arquivo não aberto).

### 3.5 Colunas agrupadas e empilhadas

**Descrição.** Duas pilhas lado a lado dentro do mesmo período: orçado e realizado, plano e executado, canal A e canal B, cada uma dividida nos mesmos componentes. Combina a pergunta "quanto" com "de que é feito" e com "comparado a quê".

**Anatomia.** Banda por período; duas pilhas por banda, separadas por um vão pequeno; rótulo da pilha embaixo do eixo, num segundo nível ("orç." e "real."); a mesma cor para o mesmo componente nas duas pilhas; legenda de componentes separada da legenda de pilhas.

**Abordagem na stack:** `recharts-nativo`. Dois conjuntos de `Bar` com `stackId` diferentes (`stackId="orcado"` e `stackId="realizado"`); o Recharts agrupa automaticamente pilhas de `stackId` distintos lado a lado. O rótulo em dois níveis sai de um segundo `XAxis` com `xAxisId`, como no exemplo Bar Chart With Multi X Axis.

**Ponto delicado.** A legenda vira o problema principal: o leitor precisa saber que cor é componente e que posição é pilha, e o Recharts gera uma entrada de legenda por `Bar`, o que duplica todos os componentes. A saída é montar a legenda à mão em `html-tailwind` (componentes por cor, pilhas por posição, explicadas em texto) e passar `legendType="none"` nos `Bar` da segunda pilha. Acima de duas pilhas por período o formato colapsa: aí é small multiples.

**Versões sugeridas.**

* **V1 Básico.** Orçado e realizado por trimestre, divididos em 3 linhas de produto.
* **V2 Com destaque.** A pilha do orçado em contorno tênue e preenchimento apagado, a do realizado sólida, que é a notação de IBCS para plano contra efetivo; a diferença total anotada acima do par.
* **V3 Caso denso do Farol.** Diretoria: investimento planejado contra executado por trimestre, quebrado nas três camadas de custo, 4 trimestres; abaixo do eixo, a linha de variação percentual por trimestre.
* **V4 Caso limite.** Trimestre sem plano aprovado: a pilha do orçado não é desenhada e o espaço recebe "sem orçamento aprovado"; componente presente só no realizado aparece na pilha da direita e ganha nota no tooltip ("fora do plano").

**Referências.**

* Catálogo: [Datawrapper Academy, colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts). Observar a sugestão de split bars ou small multiples quando a comparação de partes entre totais é o objetivo, que é o limite deste modelo.
* Catálogo: [Highcharts, Stacked Column](https://www.highcharts.com/demo/column-stacked). Observar a variante com pilhas agrupadas e o agrupamento por `stack` (apareceu na busca; demo não aberta).
* Praticante: [Microsoft Learn, configurar colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts). Observar a notação: preenchimento sólido para realizado, contorno para plano ou ano anterior e hachura para previsão (apareceu na busca; página não aberta).
* Praticante: [Inforiver, variance analysis em Power BI](https://inforiver.com/blog/inforiver-analytics-plus/variance-analysis-powerbi-inforiver-analytics-plus/). Observar a defesa de juntar realizado, referência e variação num visual só, em vez de três gráficos (apareceu na busca; página não aberta).
* Implementação: [Recharts, Bar Chart With Multi X Axis](https://recharts.github.io/en-US/examples/BarChartWithMultiXAxis/). Observar o segundo `XAxis` com `xAxisId`, que resolve o rótulo em dois níveis sem SVG manual.
* Portal de design: [Behance, Dashboard UI Data Visualization Showcase](https://www.behance.net/gallery/72032023/Dashboard-UI-Data-Visualization-Showcase). Observar como a peça separa legenda de cor e legenda de posição (apareceu na busca; projeto não aberto).

### 3.6 Colunas positivo e negativo

**Descrição.** Colunas que crescem para cima quando o valor é positivo e para baixo quando é negativo, ancoradas numa linha de zero visível no meio do gráfico. É a forma da variação, do saldo e do desvio.

**Anatomia.** Linha de zero mais forte que as demais linhas de grade; colunas para cima e para baixo; rótulos do eixo de períodos deslocados para fora da área das colunas (abaixo do gráfico, não sobre a linha de zero); cor para cima e cor para baixo definidas pela **polaridade da métrica**; valor rotulado acima da coluna positiva e abaixo da negativa.

**Abordagem na stack:** `recharts-custom`. `BarChart` com `ReferenceLine y={0}` e `Bar` com `shape` que decide o `fill` a partir do sinal em `payload.valor`. O exemplo oficial Positive And Negative Bar Chart mostra a estrutura; o `chart-bar-negative` do shadcn mostra a versão com `chartConfig`. O detalhe do eixo é `XAxis` com `tickLine={false}` e o rótulo posicionado fora, para não colidir com as colunas que descem.

**Ponto delicado.** O erro clássico é pintar por sinal em vez de por significado: numa métrica de custo, um valor negativo é bom, e verde para positivo mentiria. A regra é uma função `corPorPolaridade(valor, polaridade)` no seletor, com `polaridade: 'maiorMelhor' | 'menorMelhor'`. Segundo ponto: o eixo precisa de domínio simétrico (`domain={[-max, max]}`) quando a mensagem é "o quanto desviou", senão um mês muito negativo espreme todos os positivos. Terceiro: a linha de zero tem que ser desenhada, não inferida da grade.

**Versões sugeridas.**

* **V1 Básico.** Saldo mensal de clientes (novos menos perdidos) em 12 meses, zero marcado, verde para cima e vermelho para baixo.
* **V2 Com anotação.** Mesma série com `ReferenceArea` cobrindo o trimestre em que o saldo ficou negativo três meses seguidos e a nota "três meses de saldo negativo".
* **V3 Caso denso do Farol.** Marketing: variação mensal de CPL qualificado contra a média do semestre, 12 meses, com polaridade invertida (queda de CPL é boa, então a coluna que desce é verde) e a legenda explicando isso em texto.
* **V4 Caso limite.** Mês com saldo exatamente zero: nenhuma coluna e um traço fino de 2 px sobre a linha de zero com o rótulo "0", para o leitor não confundir com ausência de dado; mês sem dado fica realmente vazio e é marcado como tal.

**Referências.**

* Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar que este formato vive na família Deviation, definida como "variações mais e menos a partir de um ponto fixo de referência, tipicamente zero".
* Catálogo: [Vega Lite, Stack](https://vega.github.io/vega-lite/docs/stack.html). Observar como valores negativos são tratados na pilha e a menção ao gráfico divergente.
* Praticante: [Nightingale, Tear Up Your Baseline](https://nightingaledvs.com/tear-up-your-baseline/). Observar o papel da linha de zero como âncora de leitura (apareceu na busca; artigo não aberto).
* Praticante: [The Arrangement of Marks Impacts Afforded Messages (arXiv)](https://arxiv.org/pdf/2308.13321). Observar a evidência de que ordenação, partição, espaçamento e cor mudam a mensagem que a coluna transmite, o que sustenta a regra de cor por polaridade (apareceu na busca; PDF não aberto).
* Implementação: [Recharts, Positive And Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/) e [shadcn/ui, `chart-bar-negative.tsx`](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts). Observar o `shape` decidindo a cor pelo sinal e a `ReferenceLine` em zero.
* Portal de design: [Dribbble, tag column chart](https://dribbble.com/tags/column_chart). Observar tratamentos da linha de zero e do rótulo abaixo da coluna negativa (listagem de tag; peças individuais não abertas).

### 3.7 Colunas empilhadas por sinal

**Descrição.** Pilha que sobe com os componentes positivos e desce com os negativos a partir da mesma linha de zero, com um marcador do saldo líquido. Responde "o que entrou, o que saiu e o que sobrou" num período só.

**Anatomia.** Zero no meio; segmentos positivos empilhados para cima, negativos para baixo; um traço, ponto ou rótulo marcando o líquido de cada período; legenda separando entradas e saídas; eixo simétrico o bastante para caber os dois lados.

**Abordagem na stack:** `recharts-nativo` para a pilha, `recharts-custom` para o líquido. O Recharts tem o caso pronto no exemplo Bar Chart Stacked By Sign: com o mesmo `stackId`, valores negativos empilham para baixo automaticamente. O marcador de líquido sai de uma `Line` num `ComposedChart` (um ponto por período) ou de um `Customized` que percorre o dado e desenha o traço na altura do saldo.

**Ponto delicado.** Sem o marcador de líquido, o formato obriga o leitor a subtrair dois comprimentos de cabeça, que é justamente o que ele não consegue fazer bem. O líquido precisa de destaque visual maior que os segmentos. Segundo ponto: com componentes dos dois lados, o tooltip padrão soma errado na cabeça do leitor, então o tooltip tem que exibir três blocos (entradas, saídas, líquido). Terceiro: a ordem dos segmentos deve ser espelhada, com o componente mais importante encostado no zero dos dois lados.

**Versões sugeridas.**

* **V1 Básico.** Movimento mensal da carteira: entradas por origem para cima, saídas por motivo para baixo, líquido marcado.
* **V2 Com anotação.** Mesma leitura com o mês em que o líquido virou negativo destacado e a nota "primeira vez no ano".
* **V3 Caso denso do Farol.** Pré-vendas: movimento do funil por semana, com entradas (novas oportunidades, reativadas) para cima e saídas (perdidas, desqualificadas, devolvidas) para baixo, 13 semanas, líquido em linha fina.
* **V4 Caso limite.** Semana só de saída (nenhuma entrada): a metade de cima fica vazia e o rótulo de líquido aparece abaixo do zero, com a etiqueta "sem entradas na semana"; se um componente só aparece uma vez em 13 semanas, ele entra em "Outros" para não poluir a legenda.

**Referências.**

* Catálogo: [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/). Observar as variantes listadas, entre elas a progressive bar (segmentos deslocados para ganhar base própria), que é uma saída quando o empilhado por sinal fica ilegível.
* Catálogo: [Vega Lite, Stack](https://vega.github.io/vega-lite/docs/stack.html). Observar o limite declarado: a transformação de pilha não resolve sozinha o caso de empilhar em torno de um centro, que precisa de cálculo próprio.
* Praticante: [Nightingale, Visualizing Likert Scale Data](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/). Observar a defesa da base comum separando positivo de negativo e as sete alternativas testadas sobre o mesmo dado (apareceu na busca; artigo não aberto).
* Praticante: [Better Evaluation, stacked graph](https://www.betterevaluation.org/methods-approaches/methods/stacked-graph). Observar a descrição neutra de quando a pilha ajuda e quando atrapalha (apareceu na busca; página não aberta).
* Implementação: [Recharts, Bar Chart Stacked By Sign](https://recharts.github.io/en-US/examples/BarChartStackedBySign/). Observar que o empilhamento por sinal é nativo quando o `stackId` é compartilhado.
* Implementação: [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/). Observar a linha sobre a pilha, que é o mecanismo do marcador de líquido.
* Portal de design: [Figma Community, Advanced Data Visualization](https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization). Observar o tratamento de pilhas com valores nos dois sentidos (apareceu na busca; arquivo não aberto).

### 3.8 Colunas com linha de meta ou média

**Descrição.** Colunas de período com uma linha horizontal atravessando o gráfico na altura de uma referência: a meta, a média do período, o teto de capacidade, o mesmo mês do ano anterior. A linha transforma "quanto" em "quanto contra o quê".

**Anatomia.** Colunas normais; linha horizontal tracejada ou sólida fina, em cor neutra ou de alerta; rótulo da linha na ponta direita, dentro da área do gráfico ("meta 620"); colunas acima e abaixo da linha podem mudar de cor; quando a referência muda por período, a linha vira uma escada.

**Abordagem na stack:** `recharts-nativo` para referência única: `ReferenceLine y={meta} strokeDasharray="4 4"` com `label={{ value: 'meta 620', position: 'right' }}`. Para referência em degraus (meta diferente a cada mês), a rota é `ComposedChart` com uma `Line type="stepAfter"` sobre as colunas, o que o exemplo Stacked Bar Chart with Horizontal Line demonstra na versão simples.

**Ponto delicado.** A média calculada sobre uma série que inclui o período corrente parcial vem para baixo e desqualifica o próprio gráfico; calcular a média só sobre períodos fechados e dizer isso no rótulo ("média dos 11 meses fechados"). Segundo ponto: a `ReferenceLine` precisa de `ifOverflow="extendDomain"` quando a meta é maior que todas as colunas, senão ela some fora da área. Terceiro: linha de meta e linha de média no mesmo gráfico exigem espessuras e traços diferentes, senão viram ruído.

**Versões sugeridas.**

* **V1 Básico.** Receita reconhecida por mês com `ReferenceLine` na meta mensal fixa.
* **V2 Com destaque.** Mesma leitura com as colunas abaixo da meta em neutro e as acima em cor forte, mais o contador "7 de 12 meses acima da meta" no cabeçalho do card.
* **V3 Caso denso do Farol.** Pré-vendas: carga semanal da fila contra o teto de capacidade medido, com o teto em linha de alerta, as semanas acima do teto em cor de alerta e a nota do perímetro ("teto de 274 entradas por mês, medido, não premissa").
* **V4 Caso limite.** Meta revisada no meio do ano: a linha vira escada com `stepAfter`, e no ponto da revisão entra uma marca vertical tênue com a nota "meta revisada em jul"; quando não há meta definida para o período, a linha é interrompida em vez de ser estendida.

**Referências.**

* Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar a família Deviation, onde a referência pode ser zero, uma meta ou a média de longo prazo.
* Catálogo: [Datawrapper Academy, categoria de gráficos de coluna](https://academy.datawrapper.de/category/75-column-charts). Observar as opções de linha de referência e de anotação tratadas como recurso de primeira classe, não como enfeite (apareceu na busca; página não aberta).
* Praticante: [Few, Graph Selection Matrix (PDF)](https://www.perceptualedge.com/articles/misc/Graph_Selection_Matrix.pdf). Observar a matriz de relações (série temporal, ranking, parte e todo, desvio) e onde a coluna com referência se encaixa (apareceu na busca; PDF não aberto).
* Praticante: [FlowingData, 7 Basic Rules for Making Charts and Graphs](https://flowingdata.com/2010/07/22/7-basic-rules-for-making-charts-and-graphs/). Observar a regra de dar contexto ao número, que é o papel exato da linha de referência (apareceu na busca; página não aberta).
* Implementação: [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/). Observar a composição de `Bar` e `Line` no mesmo gráfico, base tanto da meta fixa quanto da meta em degraus.
* Portal de design: [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard). Observar o contraste da linha tracejada sobre fundo escuro, que costuma precisar de opacidade maior do que no tema claro (apareceu na busca; peça não aberta).

### 3.9 Colunas com excedente acima do limiar

**Descrição.** A coluna é cortada na altura do limiar: a parte de baixo, até o teto, fica em cor normal; a parte que passou fica em cor de alerta ou hachurada. O olho lê de uma vez quanto passou, sem comparar com a linha.

**Anatomia.** Coluna em dois segmentos, separados na altura do limiar; linha do limiar desenhada por cima ou implícita na troca de cor; rótulo só do excedente ("+42"); legenda curta explicando os dois segmentos.

**Abordagem na stack:** `recharts-nativo` com o dado preparado. O caminho robusto é calcular em TypeScript dois campos, `dentro = min(valor, limiar)` e `excedente = max(0, valor - limiar)`, e empilhar dois `Bar` com o mesmo `stackId`; o corte fica exato e o tooltip fica correto sem truque. A alternativa `recharts-custom`, com `shape` desenhando dois retângulos, existe mas complica o tooltip sem ganho.

**Ponto delicado.** Colorir a coluna inteira quando ela passa do teto exagera o problema: o mês que passou 3% fica igual ao que passou 80%. O segmento separado é a correção. Segundo ponto: se o limiar muda por período, `dentro` e `excedente` têm que ser calculados por linha, e a linha do limiar vira escada. Terceiro: no tema escuro, hachura de alerta precisa de traço claro sobre fundo transparente, e não de preenchimento chapado, senão o excedente vira uma mancha pesada.

**Versões sugeridas.**

* **V1 Básico.** Carga semanal da fila com teto fixo; excedente em laranja.
* **V2 Com anotação.** Mesma leitura com o rótulo "+42 acima do teto" só nas semanas que estouraram e um resumo no cabeçalho ("estourou em 5 das 13 semanas").
* **V3 Caso denso do Farol.** Diretoria: demanda projetada por mês contra a capacidade instalada em 2027, com a capacidade em degraus (sobe quando entra gente nova) e o excedente hachurado, mais a etiqueta de origem do número (MEDIDO para a capacidade, PREMISSA para a demanda).
* **V4 Caso limite.** Mês em que a capacidade é zero (equipe em formação): a coluna inteira é excedente, e o rótulo diz "sem capacidade instalada"; quando o excedente é menor que 2 px, ele ganha altura mínima visual e o tooltip informa o valor real, com a marca de que a altura foi ampliada.

**Referências.**

* Catálogo: [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/). Observar a progressive bar, que resolve o mesmo problema deslocando os segmentos em vez de trocar a cor.
* Catálogo: [Highcharts, Column Range](https://www.highcharts.com/demo/highcharts/columnrange). Observar a coluna que não nasce no zero, mecanismo que também serve para desenhar apenas o excedente (apareceu na busca; demo não aberta).
* Praticante: [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts). Observar a notação de variação favorável e desfavorável aplicada só ao trecho da diferença (apareceu na busca; página não aberta).
* Praticante: [Inforiver, variance analysis](https://inforiver.com/blog/inforiver-analytics-plus/variance-analysis-powerbi-inforiver-analytics-plus/). Observar a ideia de mostrar o desvio como elemento próprio, e não recolorindo o total (apareceu na busca; página não aberta).
* Implementação: [Recharts, Bar](https://recharts.github.io/en-US/api/Bar/). Observar `stackId` e `minPointSize` (padrão 0), este último útil para o excedente minúsculo, desde que sinalizado.
* Portal de design: [Behance, projetos de dashboard em modo escuro](https://www.behance.net/search/projects/dark%20mode%20dashboard?locale=en_US). Observar tratamentos de alerta em painéis escuros (listagem de busca; projetos individuais não abertos).

### 3.10 Colunas sobrepostas

**Descrição.** Duas colunas por período ocupando a mesma banda, uma na frente da outra: a de trás, mais larga e apagada, é a referência (meta, ano anterior, plano); a da frente, mais estreita e sólida, é o realizado. Ocupa menos espaço que o agrupado e deixa explícito quem é referência.

**Anatomia.** Coluna de trás com largura maior e preenchimento tênue ou só contorno; coluna da frente centralizada, mais estreita e sólida; sem legenda de cor, mas com legenda de papel ("meta" e "realizado"); rótulo do realizado acima da coluna da frente.

**Abordagem na stack:** `recharts-nativo` com um truque de posição. Dois `Bar` com o mesmo `xAxisId` e `barGap={-largura}` fazem a sobreposição, ou usa-se `barSize` diferente com deslocamento; é o mesmo efeito que o Vega Lite consegue com `stack: null` mais opacidade e que o Highcharts nomeia como overlapping placement. Quando o controle fino do deslocamento incomoda, a rota limpa é `recharts-custom`: um `Bar` só, com `shape` desenhando os dois retângulos a partir de `payload.meta` e `payload.realizado`.

**Ponto delicado.** A coluna da frente jamais pode ser mais larga que a de trás: invertido, a referência vira o dado. Segundo ponto: quando o realizado ultrapassa a meta, a parte que passa fica sem a moldura de trás, e isso precisa ser lido como informação (passou), não como erro de desenho. Terceiro: em tema escuro a coluna de referência some se for só um preenchimento de baixa opacidade, e então o contorno resolve melhor que o preenchimento.

**Versões sugeridas.**

* **V1 Básico.** Realizado contra meta por mês, 12 meses, meta em contorno e realizado sólido.
* **V2 Com destaque.** Mesma leitura com o percentual de atingimento rotulado acima só nos meses abaixo de 90% e acima de 110%.
* **V3 Caso denso do Farol.** Comercial: fechamentos por mês contra o forecast declarado no início do mês, com a coluna de trás sendo o forecast e a da frente o fechado, mais um rodapé com o viés médio do forecast no período.
* **V4 Caso limite.** Mês sem meta definida: só a coluna sólida aparece, sem moldura, e a legenda ganha a nota "sem meta em jan"; meta igual a zero não desenha moldura e o tooltip diz "meta 0".

**Referências.**

* Catálogo: [Vega Lite, Layered Bar Chart](https://vega.github.io/vega-lite-v2/examples/bar_layered_transparent.html). Observar `stack: null` mais `opacity`, que é a receita declarativa da sobreposição (apareceu na busca; página não aberta).
* Catálogo: [Highcharts, Overlapping Placement Column](https://www.highcharts.com/demo/column-placement). Observar o controle de `pointPadding` e `groupPadding`, equivalentes ao `barGap` negativo do Recharts (apareceu na busca; demo não aberta).
* Praticante: [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts). Observar que a barra sobreposta é a forma canônica de plotar plano contra realizado na notação.
* Praticante: [dataviz.boutique, Ultimate Variance Chart (IBCS)](https://dataviz.boutique/2017/08/15/power-bi-ultimate-variance-chart-faq-ibcs-r/). Observar as perguntas frequentes sobre largura relativa das colunas e sobre o que fazer quando o realizado passa do plano (apareceu na busca; página não aberta).
* Implementação: [Recharts, BarChart](https://recharts.github.io/en-US/api/BarChart/). Observar `barGap` e `barCategoryGap`, que aceitam valores negativos e em percentual, o que viabiliza a sobreposição sem SVG manual.
* Portal de design: [Dribbble, Dark Chart Templates](https://dribbble.com/shots/18056356-Dark-Chart-Templates-Figma-dashboard). Observar o contraste entre coluna de referência e coluna sólida em fundo escuro (apareceu na busca; peça não aberta).

### 3.11 Realizado e projeção hachurado

**Descrição.** A mesma série em dois regimes: os períodos fechados em preenchimento sólido e os períodos futuros em hachura, contorno ou opacidade reduzida. A textura carrega o recado "isto ainda não aconteceu".

**Anatomia.** Colunas sólidas até o último período fechado; colunas hachuradas dali em diante; uma divisória vertical tênue entre os dois regimes, com o rótulo "projeção a partir de set"; legenda com dois quadrados, um sólido e um hachurado; nota de método logo abaixo do gráfico ("projeção linear sobre a média das 8 semanas fechadas").

**Abordagem na stack:** `recharts-custom`. Definir um `<pattern>` em `<defs>` e aplicá-lo como `fill="url(#hachura)"` via `shape` do `Bar`, escolhendo entre cor sólida e padrão conforme `payload.regime === 'projecao'`. O Recharts aceita um componente que devolve `<defs>` como filho do gráfico, então o padrão pode viver junto do gráfico em vez de num SVG solto. A divisória é `ReferenceLine x={ultimoFechado}` e a área futura pode receber `ReferenceArea` de fundo muito tênue.

**Ponto delicado.** Hachura sem legenda é ruído: metade do público lê como "destaque" e a outra metade como "erro". Segundo ponto: o método da projeção precisa estar escrito na peça, porque uma coluna hachurada tem a mesma força visual de uma medida e passa a valer como número. Terceiro: no tema escuro, hachura densa vira mancha; traço claro fino, espaçamento generoso e `strokeOpacity` por volta de 0,5 resolvem. Quarto: `<pattern>` com `patternUnits="userSpaceOnUse"` mantém o ângulo estável quando a coluna muda de largura.

**Versões sugeridas.**

* **V1 Básico.** Receita por mês do ano, 8 meses sólidos e 4 hachurados, com legenda de dois estados.
* **V2 Com anotação.** Mesma série com a nota de método e o total do ano dividido em "R$ 7,5 mi realizados e R$ 2,5 mi projetados", para o número do topo não passar como medido.
* **V3 Caso denso do Farol.** Diretoria: cenários de receita 2027 por trimestre, colunas realizadas sólidas e projetadas em três cenários, com o cenário base hachurado e os extremos aparecendo como faixa fina (ponte com 3.14); cada cenário declara a camada de custo usada.
* **V4 Caso limite.** Projeção maior que qualquer período realizado: o eixo estica e achata o histórico, então o componente oferece alternar para escala do histórico com marca de corte explícita na coluna projetada. Projeção negativa (previsão de saldo negativo) hachura para baixo, mantendo a mesma textura.

**Referências.**

* Catálogo: [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts). Observar a notação explícita: sólido para realizado, contorno para plano e hachura para previsão, que é o padrão adotado aqui.
* Catálogo: [Apache ECharts, aria e decal](https://echarts.apache.org/handbook/en/best-practices/aria/). Observar que a textura entra como segundo canal além da cor, útil para acessibilidade e para separar regimes (apareceu na busca; página não aberta).
* Catálogo: [Apache ECharts, Style](https://echarts.apache.org/handbook/en/concepts/style/). Observar o `itemStyle` com `decal`, equivalente conceitual ao `<pattern>` do SVG (apareceu na busca; página não aberta).
* Praticante: [Storytelling with Data, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Observar dois recursos: marcador vazado e traço pontilhado para o futuro, e faixa sombreada em torno da estimativa central em vez de listar valores.
* Praticante: [Few, Graph Selection Matrix (PDF)](https://www.perceptualedge.com/articles/misc/Graph_Selection_Matrix.pdf). Observar onde previsão e realizado se encaixam nas relações de dado catalogadas (apareceu na busca; PDF não aberto).
* Implementação: [Recharts, Bar](https://recharts.github.io/en-US/api/Bar/). Observar que `shape` aceita elemento React ou função, o que permite trocar `fill` por `url(#hachura)` por linha de dado.
* Portal de design: [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1629909588466522134/dashboard-charts-ui-kit). Observar os estados de série (real, previsto, comparativo) tratados como variantes do mesmo componente (apareceu na busca; arquivo não aberto).

### 3.12 Destaque do período atual

**Descrição.** Série de colunas em que o período corrente recebe tratamento próprio: cor forte, contorno, rótulo permanente e, quando ele ainda está em curso, uma marca de "parcial". Todo o resto fica em neutro para servir de contexto.

**Anatomia.** Colunas neutras; coluna do período atual em cor de destaque; rótulo com o valor e, se parcial, a fração do período decorrida ("12 de 30 dias"); opcionalmente, um traço fantasma na altura da projeção do período completo; eixo com o rótulo do período atual em peso maior.

**Abordagem na stack:** `recharts-custom`. Um `Bar` com `shape` que compara `payload.periodo` com o período corrente vindo por prop (nunca do índice, que quebra quando a janela muda) e escolhe cor e opacidade. Para a parte parcial, a rota é dividir a coluna em dois `Bar` empilhados (`realizadoParcial` e `projecaoDoRestante`, este hachurado), que é o mesmo mecanismo do 3.11 aplicado a uma coluna só.

**Ponto delicado.** O erro mais caro da família é mostrar o mês corrente parcial ao lado de meses fechados sem avisar: a última coluna aparece baixa e o painel inteiro sugere queda quando nada caiu. A marca de parcial é obrigatória. Segundo ponto: se o painel oferece projeção do período corrente, ela precisa de método declarado, senão vira previsão silenciosa. Terceiro: o destaque não pode depender do relógio do navegador; o período corrente vem do backend, junto do dado, para não divergir entre usuários em fusos diferentes.

**Versões sugeridas.**

* **V1 Básico.** Leads por mês nos últimos 12 meses, mês corrente em cor de destaque com a etiqueta "parcial".
* **V2 Com projeção do período.** A coluna do mês corrente ganha um segmento hachurado no topo, correspondendo ao restante projetado, com a nota "ritmo atual projeta 410".
* **V3 Caso denso do Farol.** Pré-vendas: entradas por semana, 26 semanas, semana corrente destacada e parcial, semanas anteriores neutras, com `Brush` para navegar e a semana corrente sempre visível na janela padrão.
* **V4 Caso limite.** Primeiro dia do período: a coluna corrente é quase invisível, então o componente troca a coluna por um traço na base com o rótulo "1 de 30 dias, sem leitura ainda". Feriado ou semana curta recebe a mesma marca de parcial, porque o denominador mudou.

**Referências.**

* Catálogo: [Datawrapper Academy, como lidar com dados incompletos](https://www.datawrapper.de/academy/patchy-data). Observar o tratamento de lacunas e de períodos incompletos como decisão de desenho, não como acidente (apareceu na busca; página não aberta).
* Catálogo: [Datawrapper Blog, diferentes escalas de tempo num gráfico](https://www.datawrapper.de/blog/different-time-scales-in-one-chart). Observar como intervalos desiguais distorcem a leitura de colunas de período (apareceu na busca; página não aberta).
* Praticante: [Storytelling with Data, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Observar a orientação de não transferir para o leitor o trabalho de descontar a incerteza.
* Praticante: [FlowingData, Real Chart Rules to Follow](https://flowingdata.com/2015/08/11/real-chart-rules-to-follow/). Observar a distinção entre regra que protege a leitura e preferência estética, útil para justificar a marca de parcial (apareceu na busca; página não aberta).
* Implementação: [Recharts, Bar Chart With Customized Event](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/). Observar o `shape` decidindo aparência por item, mecanismo do destaque, com a ressalva de que o estado deve morar no componente pai.
* Implementação: [shadcn/ui, diretório de charts](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts), arquivos `chart-bar-active.tsx` e `chart-bar-interactive.tsx`. Observar `activeBar` e a troca de série por clique no cabeçalho.
* Portal de design: [Dribbble, Data Visualization Dashboard (Dark Mode)](https://dribbble.com/shots/21763513-Data-Visualization-Dashboard-Dark-Mode). Observar a hierarquia entre coluna neutra e coluna em foco no tema escuro (apareceu na busca; peça não aberta).

### 3.13 Colunas com painel de variação

**Descrição.** Dois gráficos empilhados verticalmente e alinhados pelo mesmo eixo de períodos: em cima, as colunas do realizado contra a referência; embaixo, um painel curto só com a diferença, absoluta ou percentual, em colunas que sobem e descem do zero. É a estrutura canônica da notação IBCS.

**Anatomia.** Painel superior com altura maior; painel inferior com cerca de um terço da altura, sem repetir o eixo de períodos; linha de zero do painel inferior alinhada e visível; cor da variação pela polaridade; rótulo da variação dentro ou fora da coluna conforme o sinal.

**Abordagem na stack:** `recharts-nativo` mais composição. Dois `BarChart` irmãos com o mesmo `syncId`, o de baixo com `XAxis hide` e `margin` idêntica ao de cima, dentro de um contêiner `html-tailwind` que garante largura comum. O `syncId` sincroniza tooltip e cursor entre os dois, que é o que faz os painéis parecerem um gráfico só.

**Ponto delicado.** O alinhamento horizontal só se sustenta se as margens laterais forem iguais nos dois gráficos, e a largura do `YAxis` muda conforme o tamanho do número formatado; a saída é fixar `YAxis width` nos dois com o mesmo valor calculado. Segundo ponto: variação percentual sobre base pequena explode (de 2 para 6 é +200%) e precisa de um piso declarado, abaixo do qual o painel mostra a diferença absoluta. Terceiro: cor por polaridade, de novo, e não por sinal.

**Versões sugeridas.**

* **V1 Básico.** Receita por mês em cima, variação contra o mesmo mês do ano anterior embaixo, em pontos percentuais.
* **V2 Com destaque.** Mesma estrutura com os três meses de maior desvio anotados e o resto silencioso.
* **V3 Caso denso do Farol.** Marketing: investimento por mês em cima, variação contra o mês anterior embaixo, com a polaridade invertida no painel de custo (subir é ruim) e a legenda dizendo isso em palavras.
* **V4 Caso limite.** Mês sem base de comparação (primeiro mês da série ou origem nova): o painel inferior fica vazio naquele período, com o traço "sem base", em vez de exibir 0% ou 100%. Base igual a zero nunca vira percentual.

**Referências.**

* Catálogo: [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts). Observar a estrutura de comparação com painel de variação e a semântica de favorável e desfavorável.
* Catálogo: [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/). Observar a change bar, que resolve o mesmo problema dentro de um gráfico só, com seta de direção.
* Praticante: [dataviz.boutique, Ultimate Variance Chart (IBCS)](https://dataviz.boutique/2017/08/15/power-bi-ultimate-variance-chart-faq-ibcs-r/). Observar as decisões práticas de escala entre o painel principal e o de variação (apareceu na busca; página não aberta).
* Praticante: [Inforiver, variance analysis em Power BI](https://inforiver.com/blog/inforiver-analytics-plus/variance-analysis-powerbi-inforiver-analytics-plus/). Observar a variação absoluta em coluna e a percentual em lollipop, uma separação útil de formatos (apareceu na busca; página não aberta).
* Implementação: [Recharts, BarChart](https://recharts.github.io/en-US/api/BarChart/). Observar `syncId`, que sincroniza cursor e tooltip entre gráficos irmãos, e `margin`, que precisa ser idêntica nos dois.
* Portal de design: [Behance, Data Visualization Dashboard design](https://www.behance.net/gallery/38344587/Data-Visualization-Dashboard-design). Observar composições de painel principal com faixa de apoio abaixo (apareceu na busca; projeto não aberto).

### 3.14 Colunas de faixa

**Descrição.** Colunas que não nascem do zero: cada uma vai de um mínimo a um máximo, representando um intervalo por período. Serve para cenário com saída em faixa, para variação intradiária e para amplitude observada.

**Anatomia.** Retângulo flutuante por período, entre os limites; marca do valor central (linha ou ponto) dentro do retângulo; eixo numérico que pode não conter o zero, porque aqui a altura é amplitude, não magnitude; rótulos dos limites nas pontas quando são poucos períodos.

**Abordagem na stack:** `recharts-nativo`. O Recharts aceita `dataKey` que devolve um par `[min, max]`, e o exemplo Ranged Bar Chart mostra exatamente isso; a versão empilhada está em Ranged Stacked Bar Chart. Quando é preciso somar a marca central e rótulos por ponta, a rota é `recharts-custom` com `shape` desenhando retângulo e traço a partir do payload.

**Ponto delicado.** Este é o único modelo da família em que o eixo pode legitimamente não começar em zero, e por isso ele precisa dizer em palavras que a altura é amplitude e não volume; caso contrário o leitor aplica a regra da família e lê errado. Segundo ponto: faixa sem valor central esconde a assimetria (um cenário base colado no piso é muito diferente de um colado no teto). Terceiro: faixas muito estreitas somem, e um piso de altura em pixels precisa ser sinalizado.

**Versões sugeridas.**

* **V1 Básico.** Faixa de receita projetada por trimestre (piso e teto), com o cenário base marcado por um traço.
* **V2 Com anotação.** Mesma leitura com a meta como `ReferenceLine` atravessando as faixas e a nota "meta dentro da faixa em 3 dos 4 trimestres".
* **V3 Caso denso do Farol.** Diretoria: cenários 2027 por trimestre com três marcas por coluna (pessimista, base, otimista), a faixa em preenchimento tênue e o base em traço forte, mais a etiqueta de premissa ao lado de cada limite.
* **V4 Caso limite.** Faixa degenerada, com piso igual ao teto: desenhar só o traço central com a nota "cenário único"; faixa que cruza o zero (previsão de resultado negativo) mantém a linha de zero visível para não virar um bloco solto no ar.

**Referências.**

* Catálogo: [Highcharts, Column Range](https://www.highcharts.com/demo/highcharts/columnrange). Observar o formato canônico do intervalo por categoria e o rótulo nas duas pontas (apareceu na busca; demo não aberta).
* Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar a família Distribution e a Magnitude, que é onde este formato transita conforme a pergunta seja amplitude ou tamanho.
* Praticante: [Storytelling with Data, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Observar a recomendação de manter o ponto central em evidência e a faixa como contexto, e não o contrário.
* Praticante: [Few, Graph Selection Matrix (PDF)](https://www.perceptualedge.com/articles/misc/Graph_Selection_Matrix.pdf). Observar onde amplitude e distribuição se separam de magnitude na matriz (apareceu na busca; PDF não aberto).
* Implementação: [Recharts, Ranged Bar Chart](https://recharts.github.io/en-US/examples/BarChartRangeExample/) e [Ranged Stacked Bar Chart](https://recharts.github.io/en-US/examples/RangedStackedBarChart/). Observar o `dataKey` que devolve um par de valores, base do retângulo flutuante.
* Vizinhança: quando o interesse é a distribuição interna (quartis, outliers), o lugar é 16_distribuicao, e não esta família; a faixa aqui é intervalo declarado, não resumo estatístico.
* Portal de design: [Figma Community, Chart UI Kit v2.0](https://www.figma.com/community/file/1328496497617715352/chart-ui-kit-v2-0). Observar as variantes de faixa e de intervalo nos temas claro e escuro (apareceu na busca; arquivo não aberto).

### 3.15 Colunas em small multiples

**Descrição.** Em vez de amontoar séries num gráfico só, repete-se o mesmo gráfico pequeno, um por série, numa grade. Cada painel guarda a forma da própria série e a grade permite comparar formas, que é o que o agrupado com muitas séries destrói.

**Anatomia.** Grade de painéis com o mesmo tamanho; escala numérica compartilhada por padrão; eixo de períodos só na linha de baixo; título curto dentro de cada painel, com o total ou o último valor ao lado; painéis ordenados por uma medida (total, variação), não alfabeticamente.

**Abordagem na stack:** `html-tailwind` para a grade mais `recharts-nativo` para cada painel. A grade é um `grid grid-cols-2 md:grid-cols-4 gap-3`; cada célula tem um `BarChart` mínimo, sem legenda, com `YAxis hide` e `XAxis` só na última linha. O domínio comum é calculado uma vez em TypeScript e passado a todos os painéis via `YAxis domain={[0, maxGlobal]}`.

**Ponto delicado.** Escala livre por painel é o defeito clássico: cada painel fica bonito e a comparação entre eles vira mentira. O padrão é escala compartilhada, e escala livre só com aviso explícito em cada painel ("escala própria"). Segundo ponto: com escala compartilhada, séries pequenas viram traços, e a saída é oferecer a alternância, não escondê-la. Terceiro: performance, porque 12 `ResponsiveContainer` na tela custam caro; fixar altura em pixels e evitar animação nos painéis.

**Versões sugeridas.**

* **V1 Básico.** Leads por mês em 6 origens, 6 painéis, escala compartilhada.
* **V2 Com destaque.** Mesma grade com o painel da origem em foco em cor forte e os demais em neutro, mais o total de cada painel ao lado do título.
* **V3 Caso denso do Farol.** Comercial: fechamentos por mês por executivo, 12 painéis, escala compartilhada, painéis ordenados por win rate; o painel do executivo com win rate fora da faixa recebe borda de alerta.
* **V4 Caso limite.** Executivo com 2 meses de histórico: o painel mostra só dois períodos e a faixa restante fica vazia e marcada, sem esticar o dado; origem com todos os meses zerados mostra o painel plano com a nota "sem volume no período", porque o vazio também é resposta.

**Referências.**

* Catálogo: [Datawrapper Academy, colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts). Observar a indicação de split bars ou small multiples quando a comparação entre várias partes é o objetivo.
* Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar que o recurso de repetir painéis atravessa várias famílias em vez de ser um tipo próprio.
* Praticante: [Few, Quantitative Displays for Combining Time Series and Part to Whole Relationships (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf) (não abriu como texto: PDF binário). Observar, ao abrir num leitor, os painéis repetidos como alternativa à pilha.
* Praticante: [Observable, the powerful simplicity of bar charts and histograms](https://observablehq.com/blog/simplicity-bar-charts). Observar a defesa da forma simples repetida em vez do gráfico único sobrecarregado (apareceu na busca; página não aberta).
* Implementação: [Recharts, BarChart](https://recharts.github.io/en-US/api/BarChart/). Observar `syncId`, que também serve à grade: passar o mesmo `syncId` a todos os painéis sincroniza o cursor entre eles.
* Portal de design: [Figma Community, Data Visualization Graphs and Charts Kit](https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit). Observar as versões compactas do mesmo gráfico, que é o que a grade exige (apareceu na busca; arquivo não aberto).

### 3.16 Colunas com eixo de tempo em dois níveis

**Descrição.** O eixo de períodos ganha uma segunda linha que agrupa o primeiro nível: meses sob o trimestre, semanas sob o mês, dias sob a semana. A hierarquia do tempo aparece no eixo em vez de virar cor ou legenda.

**Anatomia.** Linha de rótulos finos no nível de baixo (mês); linha de rótulos maiores no nível de cima (trimestre), centralizada sobre o grupo e separada por traços verticais curtos; separador de grupo mais forte que a grade normal; total do grupo opcional acima das colunas.

**Abordagem na stack:** `recharts-nativo`. Dois `XAxis` com `xAxisId` distintos, o segundo com `tickFormatter` que devolve o rótulo só na coluna central de cada grupo, exatamente como no exemplo Bar Chart With Multi X Axis. Os separadores verticais saem de `ReferenceLine x={...}` nos limites de grupo.

**Ponto delicado.** Repetir o rótulo do nível de cima em todas as colunas destrói o ganho e polui; o rótulo aparece uma vez por grupo. Segundo ponto: grupos de tamanho diferente (um trimestre com 2 meses fechados) desalinham a centralização, o que exige calcular a posição a partir da contagem real de itens do grupo, não de um divisor fixo. Terceiro: com espaço curto, o nível de cima some antes do de baixo, e a decisão de qual cortar é de projeto, não do componente.

**Versões sugeridas.**

* **V1 Básico.** Receita mensal de 2 anos com o ano no nível de cima.
* **V2 Com destaque.** Mesma série com o trimestre corrente com fundo levemente diferente via `ReferenceArea` e o total do trimestre rotulado acima do grupo.
* **V3 Caso denso do Farol.** Pré-vendas: entradas por semana em 6 meses, semanas no nível de baixo (só o número), meses no nível de cima, separador entre meses e a semana corrente destacada.
* **V4 Caso limite.** Mês com 5 semanas contra meses de 4: o grupo mais largo mantém a largura da coluna constante e apenas ocupa mais espaço, em vez de espremer; períodos parciais no início e no fim da janela recebem marca de recorte no eixo.

**Referências.**

* Catálogo: [Datawrapper Blog, diferentes escalas de tempo num gráfico](https://www.datawrapper.de/blog/different-time-scales-in-one-chart). Observar as saídas propostas quando anos, meses, dias e horas precisam conviver no mesmo eixo (apareceu na busca; página não aberta).
* Catálogo: [Observable Plot, Interval transform](https://observablehq.com/plot/transforms/interval). Observar a formalização de intervalo temporal, que é o que dá sentido ao agrupamento de nível superior (apareceu na busca; página não aberta).
* Catálogo: [Observable, Plot: temporal bar chart](https://observablehq.com/@observablehq/plot-temporal-bar-chart). Observar o uso de `rect` com intervalo para colunas em eixo de tempo real (apareceu na busca; notebook não aberto).
* Praticante: [Datawrapper Academy, dados irregulares](https://www.datawrapper.de/academy/patchy-data). Observar o alerta sobre intervalos desiguais, que é o caso limite deste modelo (apareceu na busca; página não aberta).
* Implementação: [Recharts, Bar Chart With Multi X Axis](https://recharts.github.io/en-US/examples/BarChartWithMultiXAxis/). Observar o segundo `XAxis` com `xAxisId` próprio e o `tickFormatter` que decide onde escrever o rótulo do grupo.
* Portal de design: [Behance, Charts Dashboard](https://www.behance.net/search/projects/charts%20dashboard). Observar tratamentos de eixo hierárquico em painéis densos (listagem de busca; projetos individuais não abertos).

### 3.17 Colunas com anotação de evento

**Descrição.** Série de colunas em que marcas verticais, faixas de fundo ou etiquetas indicam quando alguma coisa mudou: campanha no ar, mudança de preço, entrada de pessoa no time, alteração de regra do funil. A anotação explica o degrau que o leitor vê.

**Anatomia.** Colunas normais; marcador vertical fino no período do evento, com um ponto ou ícone no topo e a etiqueta curta ao lado; faixa de fundo quando o evento dura vários períodos; lista de eventos no rodapé do card quando são muitos, numerados e referenciados por número na área do gráfico.

**Abordagem na stack:** `recharts-nativo` para os marcadores (`ReferenceLine x` com `label`, `ReferenceArea x1 x2` para janelas) e `html-tailwind` para a lista de eventos e para as etiquetas fora da área do gráfico, que ficam mais legíveis fora do SVG.

**Ponto delicado.** A etiqueta não pode cobrir a coluna que ela explica; o padrão é a etiqueta acima da área de plotagem, ligada por um traço fino, ou numerada com a legenda embaixo. Segundo ponto: `ReferenceLine` num eixo **ordinal** precisa que o valor de `x` case exatamente com o rótulo do período, o que quebra quando a granularidade muda (evento em 12 de março num eixo semanal); a correção é mapear a data do evento para o período no seletor e guardar a data exata para o tooltip. Terceiro: mais de três ou quatro eventos na mesma janela viram ruído e pedem a lista numerada.

**Versões sugeridas.**

* **V1 Básico.** Leads por semana com uma marca vertical na semana em que a campanha entrou no ar.
* **V2 Com faixa.** `ReferenceArea` cobrindo as 6 semanas de campanha, com etiqueta no topo e o total do período dentro da faixa.
* **V3 Caso denso do Farol.** Marketing: leads por semana em 26 semanas com 5 eventos numerados (duas campanhas, uma mudança de formulário, uma mudança de roteamento, um feriado longo) e a lista no rodapé; o tooltip de cada semana afetada repete o evento.
* **V4 Caso limite.** Dois eventos na mesma semana: as etiquetas empilham com um deslocamento vertical automático e a marca vertical fica única, com o tooltip listando os dois; evento sem data precisa (só o mês) aparece como faixa do mês inteiro, não como linha, para não fingir precisão.

**Referências.**

* Catálogo: [Datawrapper Academy, categoria de gráficos de coluna](https://academy.datawrapper.de/category/75-column-charts). Observar as anotações de texto e de faixa como recurso de produto, e não improviso (apareceu na busca; página não aberta).
* Catálogo: [Vega Lite, Bar Chart with Label Overlays](https://vega.github.io/vega-lite/examples/layer_bar_labels_grey.html). Observar a composição em camadas, que é o mecanismo declarativo do texto sobre o gráfico (apareceu na busca; página não aberta).
* Praticante: [Nightingale, Charles Apple on Making Effective Charts](https://nightingaledvs.com/charles-apple-on-making-effective-charts/). Observar a defesa de explicar o pico dentro do próprio gráfico, e não na legenda distante (apareceu na busca; artigo não aberto).
* Praticante: [FlowingData, 7 Basic Rules for Making Charts and Graphs](https://flowingdata.com/2010/07/22/7-basic-rules-for-making-charts-and-graphs/). Observar a regra de explicar o dado incomum em vez de deixar o leitor adivinhar (apareceu na busca; página não aberta).
* Implementação: [Recharts, Brush Bar Chart](https://recharts.github.io/en-US/examples/BrushBarChart/). Observar a navegação da janela, que muda quais eventos ficam visíveis e obriga a recalcular as anotações.
* Portal de design: [Dribbble, tag chart dashboard](https://dribbble.com/tags/chart-dashboard). Observar padrões de etiqueta e de marcação de evento em cards compactos (listagem de tag; peças individuais não abertas).

## Onde um modelo mora melhor em outra família

* **Rótulo longo de categoria** (motivo de perda, nome de campanha): vira barra horizontal, família **02**.
* **Tendência contínua com muitos períodos**, sem interesse no volume de cada um: família **04**; com ênfase no acumulado, família **05**.
* **Coluna mais linha no mesmo gráfico** (volume e taxa, investimento e CPL), incluindo o Pareto: família **08**.
* **Decomposição de uma variação em contribuições** (de R$ 7,5 mi para R$ 10 mi, passo a passo): cascata, família **19**, e não colunas empilhadas.
* **Uma medida só contra a meta, em card**: família **13**; a coluna com meta repetida por período fica aqui.
* **Distribuição de uma variável contínua** (histograma): família **16**, ainda que o desenho pareça coluna; ali as barras se tocam porque o eixo é contínuo.
* **Coluna minúscula dentro de célula ou card**, sem eixo: sparkline de colunas, família **24**.
* **Largura da coluna também codificando um valor** (volume por segmento e participação): mosaico, família **26**.
* **Contagem em unidades discretas** (10 agendas, 10 quadradinhos): waffle, família **22**.
* **Coluna em torno de um centro por escala ordinal de concordância**: divergente Likert, família **02**.

## Fontes consultadas

Páginas efetivamente abertas com WebFetch (12):

1. [Recharts, galeria de exemplos](https://recharts.github.io/en-US/examples/): inventário dos 24 exemplos de barra e coluna, com os slugs usados nas referências deste documento.
2. [Recharts, API do Bar](https://recharts.github.io/en-US/api/Bar/): `stackId`, `background` (aceita `false`, `true`, objeto, elemento ou função), `shape`, `minPointSize` (padrão 0), `activeBar`, `barSize`, `radius`, `isAnimationActive` com padrão `"auto"`.
3. [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/): lollipop, triangle, curved, back to back, unit, progressive, waterfall, change bar, Pareto e column sparkline.
4. [Datawrapper Academy, o que considerar em colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts): quando a pilha funciona, quando falha, ordenação de segmentos e a regra do "Outros".
5. [Datawrapper Academy, por que colunas começam em zero](https://www.datawrapper.de/academy/why-our-column-and-bar-charts-start-at-zero): o zero obrigatório e as três alternativas quando ele achata a leitura.
6. [Vega Lite, documentação de Stack](https://vega.github.io/vega-lite/docs/stack.html): offsets `zero`, `normalize`, `center` e `null` e o tratamento de valores negativos.
7. [Storytelling with Data, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty): marcador vazado e traço pontilhado para o futuro; faixa sombreada em torno do ponto central.
8. [GitHub, diretório de charts do shadcn/ui](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts): os dez arquivos `chart-bar-*.tsx` disponíveis.
9. [GitHub, FT chart doctor, visual vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): as nove famílias de relação de dado, com destaque para Deviation, Change over Time, Part to Whole e Magnitude.
10. [Tremor, BarChart](https://www.tremor.so/docs/visualizations/bar-chart): `type` em `default`, `stacked` e `percent`, `layout`, `valueFormatter` e `onValueChange`.
11. [ui.shadcn.com, galeria de bar charts](https://ui.shadcn.com/charts/bar): a galeria abriu, mas a página renderizou sem os títulos dos blocos, então os nomes dos arquivos vieram do diretório no GitHub.
12. [Few, Quantitative Displays for Combining Time Series and Part to Whole Relationships (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf): o PDF baixou, mas veio como binário sem texto extraível; citado pelo tema, não por citação literal.

Páginas que apareceram literalmente em resultado de busca e foram usadas como referência sem abrir:

13. [Recharts, Simple Bar Chart](https://recharts.github.io/en-US/examples/SimpleBarChart/) · [Stacked Bar Chart](https://recharts.github.io/en-US/examples/StackedBarChart/) · [Bar Chart Stacked By Sign](https://recharts.github.io/en-US/examples/BarChartStackedBySign/) · [Positive And Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/) · [Bar Chart With Multi X Axis](https://recharts.github.io/en-US/examples/BarChartWithMultiXAxis/) · [Bar Chart With Customized Event](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/) · [Brush Bar Chart](https://recharts.github.io/en-US/examples/BrushBarChart/) · [Tiny Bar Chart](https://recharts.github.io/en-US/examples/TinyBarChart/) · [Ranged Bar Chart](https://recharts.github.io/en-US/examples/BarChartRangeExample/) · [Ranged Stacked Bar Chart](https://recharts.github.io/en-US/examples/RangedStackedBarChart/) · [Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/) · [Bar Chart with background](https://recharts.github.io/en-US/examples/BarChartHasBackground/) · [Bar Chart With Min Height](https://recharts.github.io/en-US/examples/BarChartWithMinHeight/) · [Custom Shape Bar Chart](https://recharts.github.io/en-US/examples/CustomShapeBarChart/) · [API do BarChart](https://recharts.github.io/en-US/api/BarChart/).
14. [Data Viz Catalogue, Bar Chart](https://datavizcatalogue.com/methods/bar_chart.html) · [Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html) · [Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html) · [Chart Selection Guide](https://datavizcatalogue.com/blog/chart-selection-guide/).
15. [Datawrapper Academy, criar colunas agrupadas](https://academy.datawrapper.de/article/21-how-to-create-a-grouped-column-chart) · [customizar colunas agrupadas](https://academy.datawrapper.de/article/45-customizing-your-grouped-column-chart) · [criar colunas empilhadas](https://academy.datawrapper.de/article/22-how-to-create-a-stacked-column-chart) · [customizar colunas empilhadas](https://academy.datawrapper.de/article/46-customizing-your-stacked-column-chart) · [categoria de colunas](https://academy.datawrapper.de/category/75-column-charts) · [dados irregulares](https://www.datawrapper.de/academy/patchy-data) · [escalas de tempo diferentes](https://www.datawrapper.de/blog/different-time-scales-in-one-chart).
16. [Vega Lite, Normalized Stacked Bar](https://vega.github.io/vega-lite/examples/stacked_bar_normalize.html) · [versão com rótulos](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html) · [Layered Bar Chart](https://vega.github.io/vega-lite-v2/examples/bar_layered_transparent.html) · [Bar Chart with Label Overlays](https://vega.github.io/vega-lite/examples/layer_bar_labels_grey.html) · [Stacked Bar Chart](https://vega.github.io/vega-lite/examples/stacked_bar_weather.html) · [documentação de Bar](https://vega.github.io/vega-lite/docs/bar.html) · [galeria](https://vega.github.io/vega-lite/examples/).
17. [Highcharts, Stacked Percentage Column](https://www.highcharts.com/demo/highcharts/column-stacked-percent) · [Column Range](https://www.highcharts.com/demo/highcharts/columnrange) · [Overlapping Placement Column](https://www.highcharts.com/demo/column-placement) · [Stacked Column](https://www.highcharts.com/demo/column-stacked) · [Basic Column](https://www.highcharts.com/demo/highcharts/column-basic).
18. [Apache ECharts, aria e decal](https://echarts.apache.org/handbook/en/best-practices/aria/) · [Style](https://echarts.apache.org/handbook/en/concepts/style/) · [Basic Bar](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/basic-bar/).
19. [Observable Plot, bar mark](https://observablehq.com/plot/marks/bar) (tentativa de fetch devolveu HTTP 429) · [Interval transform](https://observablehq.com/plot/transforms/interval) · [temporal bar chart](https://observablehq.com/@observablehq/plot-temporal-bar-chart) · [time series grouped bars](https://observablehq.com/@observablehq/plot-time-series-grouped-bars) · [the powerful simplicity of bar charts and histograms](https://observablehq.com/blog/simplicity-bar-charts).
20. [FlowingData, Bar Chart Baselines Start at Zero](https://flowingdata.com/2015/08/31/bar-chart-baselines-start-at-zero/) · [Real Chart Rules to Follow](https://flowingdata.com/2015/08/11/real-chart-rules-to-follow/) · [7 Basic Rules for Making Charts and Graphs](https://flowingdata.com/2010/07/22/7-basic-rules-for-making-charts-and-graphs/) · [tipo de gráfico: bar chart](https://flowingdata.com/charttype/bar-chart-type/).
21. [Nightingale, Tear Up Your Baseline](https://nightingaledvs.com/tear-up-your-baseline/) · [Visualizing Likert Scale Data](https://nightingaledvs.com/visualizing-likert-scale-data-same-data-displayed-seven-different-ways/) · [Charles Apple on Making Effective Charts](https://nightingaledvs.com/charles-apple-on-making-effective-charts/).
22. [Storytelling with Data, sobre 100% empilhado](https://www.storytellingwithdata.com/blog/2016/1/12/is-there-a-single-right-answer).
23. [Few, Graph Selection Matrix (PDF)](https://www.perceptualedge.com/articles/misc/Graph_Selection_Matrix.pdf) · [Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf).
24. [Microsoft Learn, configurar colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts) · [Inforiver, variance analysis](https://inforiver.com/blog/inforiver-analytics-plus/variance-analysis-powerbi-inforiver-analytics-plus/) · [dataviz.boutique, Ultimate Variance Chart](https://dataviz.boutique/2017/08/15/power-bi-ultimate-variance-chart-faq-ibcs-r/).
25. [shadcn.io, Grouped Bar Chart](https://www.shadcn.io/charts/bar-chart/bar-chart-04) · [Stacked Bar Chart](https://www.shadcn.io/charts/bar-chart/bar-chart-05) · [Interactive Highlight Chart](https://www.shadcn.io/charts/bar-chart/bar-chart-09).
26. Pesquisa acadêmica: [The Arrangement of Marks Impacts Afforded Messages (arXiv)](https://arxiv.org/pdf/2308.13321) · [Anchoring and Alignment: Data Factors in Part to Whole Visualization (arXiv)](https://arxiv.org/pdf/2508.01881) · [Visual cues in estimation of part to whole comparison (arXiv)](https://arxiv.org/pdf/1908.00630) · [HealthDataViz, Raising the Bar on Stacked Bar Charts](https://healthdataviz.com/2016/04/15/raising-bar-stacked-bar-charts/) · [Better Evaluation, stacked graph](https://www.betterevaluation.org/methods-approaches/methods/stacked-graph).
27. Portais de design: [Behance, Data Visualization Dashboard UI Kit](https://www.behance.net/gallery/81085955/Data-Visualization-Dashboard-UI-Kit) · [Behance, Dashboard UI Data Visualization Showcase](https://www.behance.net/gallery/72032023/Dashboard-UI-Data-Visualization-Showcase) · [Behance, Data Visualization Dashboard design](https://www.behance.net/gallery/38344587/Data-Visualization-Dashboard-design) · [Behance, busca de dark mode dashboard](https://www.behance.net/search/projects/dark%20mode%20dashboard?locale=en_US) · [Behance, busca de charts dashboard](https://www.behance.net/search/projects/charts%20dashboard) · [Dribbble, Bar Chart Dashboard Card (Dark Theme)](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme) · [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard) · [Dribbble, Dark Chart Templates](https://dribbble.com/shots/18056356-Dark-Chart-Templates-Figma-dashboard) · [Dribbble, Data Visualization Dashboard (Dark Mode)](https://dribbble.com/shots/21763513-Data-Visualization-Dashboard-Dark-Mode) · [Dribbble, tag column chart](https://dribbble.com/tags/column_chart) · [Dribbble, tag chart dashboard](https://dribbble.com/tags/chart-dashboard) · [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1629909588466522134/dashboard-charts-ui-kit) · [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit) · [Figma Community, Charts and Graphs UI Kit](https://www.figma.com/community/file/1314538669933482880/charts-graphs-ui-kit) · [Figma Community, Chart UI Kit v2.0](https://www.figma.com/community/file/1328496497617715352/chart-ui-kit-v2-0) · [Figma Community, Advanced Data Visualization](https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization) · [Figma Community, Data Visualization Graphs and Charts Kit](https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit).

Lacunas conhecidas deste estudo: o PDF do Few sobre série temporal combinada com parte e todo não devolveu texto extraível, então a citação é temática; a galeria de bar charts do shadcn renderizou sem títulos e os nomes dos blocos vieram do diretório do repositório; a página do bar mark do Observable Plot respondeu HTTP 429 e ficou marcada como não aberta; as peças individuais de Behance, Dribbble e Figma Community entraram pelo resultado de busca, sem abertura, porque exigem sessão ou carregam por script.
