# Matriz e quadrantes

Matriz e quadrantes é a família da classificação por duas dimensões. Ela não pergunta qual o valor, como a barra, nem se existe relação, como a dispersão: pergunta em que grupo cada entidade cai e o que se faz com esse grupo. O plano é cortado por limiares e cada região ganha um nome que já carrega uma decisão (acelerar, manter, investigar, cortar). Há duas metades com a mesma gramática e matéria-prima diferente: os quadrantes contínuos, em que os eixos são medidas e cada entidade é um ponto, e as matrizes discretas, em que linhas e colunas são categorias e a célula é a unidade visual que nomeia um grupo.

Catálogo VISUAIS do Farol, 2026-09-14. Estudo de origem: [`_estudo/familias/25_matriz-e-quadrantes.md`](../_estudo/familias/25_matriz-e-quadrantes.md). Catálogo em dados, com resumo, quando usar, quando evitar e as versões de cada modelo: [`_estudo/catalogo/25_matriz-e-quadrantes.json`](../_estudo/catalogo/25_matriz-e-quadrantes.json). Todos os casos de uso são fictícios.

## O que a família responde

| Público | Perguntas típicas no Farol |
|---|---|
| Comercial | Quais executivos têm volume alto e conversão baixa, um problema de qualificação e não de esforço? Quais oportunidades do forecast valem muito e estão paradas há tempo demais? Quem chega à meta de vitórias por volume e quem chega por taxa? Quem responde por cada etapa do handoff? |
| Pré-vendas | Que filas têm muita entrada e pouco atendimento dentro do SLA? Quais automações do backlog rendem mais por unidade de esforço? Como a fila da SDR se divide entre fazer agora, agendar, redistribuir e descartar? |
| Marketing | Quais campanhas compram lead barato que não vira nada? Quais origens têm muito lead e pouca cobertura de dado, o que impede julgar qualquer coisa sobre elas? Quais origens cresceram em volume e perderam qualificação? |
| Diretoria | Qual o mapa de risco dos cenários por probabilidade e impacto? Qual cenário de orçamento vence com pesos explícitos e cabe na capacidade medida? Como a carteira se divide entre receita e previsibilidade? |

Regras que valem para todos os modelos, vindas do estudo da família:

1. **O limiar é declarado, nunca implícito.** Toda divisória diz o que é, o valor e de onde veio ("mediana da carteira", "meta de SLA", "break-even"); quadrante sem rótulo de corte é gráfico sem eixo.
2. **Etiqueta de procedência no corte.** MEDIDO entra em traço sólido; PREMISSA entra tracejado e com ícone; DERIVADO e LACUNA também são escritos. O mesmo plano com outro corte conta outra história.
3. **Rótulo de região diz a ação, não o apelido.** "Muito volume, pouca conversão: revisar qualificação" funciona; jargão de consultoria só quando o público já usa.
4. **Contagem por região sempre visível**, com a soma da medida de negócio quando ela é aditiva. Taxa, CPL e ticket não somam: a região mostra a razão recalculada sobre os totais.
5. **Fronteira é zona.** Onde a decisão for cara, faixa de indiferença em torno do corte, com os itens de dentro em cinza e fora dos quatro rótulos.
6. **Eixo composto abre a conta; eixo de julgamento se declara**, com contorno tracejado e a legenda "avaliação do time, não medição".
7. **Cor com um papel só:** pinta a região (entre 4% e 8% de opacidade no escuro) ou a categoria do ponto, nunca as duas. Verde e vermelho saturados pintando região inteira são proibidos.
8. **Zero e sem dado são desenhos diferentes.** Célula com zero leva o dígito 0; célula sem dado leva hachura diagonal e entra na legenda. Entidade sem uma das medidas sai do plano e vira linha de rodapé, nunca ponto no (0,0).
9. **Célula discreta de pelo menos 44 px no menor lado**, e ordem de linhas e colunas declarada (severidade, volume ou processo), nunca alfabética.
10. **Semáforo de matriz de risco tem segundo canal** (número ou densidade de traço), e a cor da célula não decide orçamento.

## Modelos

As pastas de modelo são criadas pelos produtores; os links abaixo apontam para onde cada uma vai morar.

| # | Modelo | Abordagem | Responde | Versões |
|---|---|---|---|---|
| 01 | [Matriz 2x2 de quadrantes](./01_matriz-2x2-de-quadrantes/) | Recharts nativo | Em que região cada entidade caiu por duas medidas, com corte estatístico, por meta ou no zero, bolhas, sumário por região e lista sincronizada | 4 |
| 02 | [Matriz agregada de células (2x2, 3x3)](./02_matriz-agregada-de-celulas/) | HTML com Tailwind | Quanto cai em cada grupo: 2x2 de cartão pequeno, Eisenhower com cartões e nine-box 3x3 | 4 |
| 03 | [Plano com iso-linhas de razão ou produto](./03_plano-com-iso-linhas/) | Recharts com peça própria | Ordem por retorno sobre esforço e fronteira curva quando a meta é produto dos eixos | 4 |
| 04 | [Matriz de cobertura binária](./04_matriz-de-cobertura-binaria/) | HTML com Tailwind | Quem tem e quem não tem cada atributo, combinações no estilo UpSet e campo fora da coleta | 4 |
| 05 | [Matriz de decisão ponderada](./05_matriz-de-decisao-ponderada/) | HTML com Tailwind | Escolha entre opções com pesos à vista, eliminatórios e sensibilidade do vencedor | 4 |
| 06 | [Matriz de risco em células](./06_matriz-de-risco/) | HTML com Tailwind | Riscos por probabilidade e impacto com nível de tabela acordada, movimento e compressão de faixa | 4 |
| 07 | [Matriz de responsabilidade (RACI)](./07_matriz-raci/) | HTML com Tailwind | Quem executa, responde, é consultado e informado em cada etapa, declarado contra executado | 4 |

Variações do estudo absorvidas como versões: o corte estatístico, o corte por meta declarada, os rótulos diretos, as bolhas, o sumário por região, a lista sincronizada e a variação centrada no zero entram no 01; a matriz 2x2 agregada, o nine-box 3x3 e a Eisenhower com cartões entram no 02; o impacto e esforço com iso-linhas e a fronteira curva de equilíbrio entram no 03. Duas variações absorvidas pelo 01 não viraram versão própria, por causa do teto de quatro versões: o **quadrante em posto** (estudo, modelo 9), que vale como alternador quando as duas medidas têm caudas brutais, com o valor bruto sempre no tooltip e empate por posto médio, e o **mapa perceptual** (estudo, modelo 16), que usa domínio simétrico sem ticks, polos nomeados e proporção 1:1 com `aspect-square`. As duas estão descritas no estudo e podem virar versão extra se o Farol pedir.

## Guia rápido: qual modelo escolher

1. **Cada entidade tem duas medidas numéricas e a pergunta é o grupo em que ela cai?** [01 Matriz 2x2 de quadrantes](./01_matriz-2x2-de-quadrantes/). Sem meta externa, corte na mediana; com SLA, break-even ou teto, corte na meta; com os dois eixos em variação, corte no zero. Até cerca de 20 nomes no plano; acima de 25 entidades, lista sincronizada.
2. **Só importam os quatro ou nove números, ou os eixos já são faixas?** [02 Matriz agregada de células](./02_matriz-agregada-de-celulas/). Itens acionáveis que pedem verbo por caixa viram Eisenhower; carteira em três faixas por eixo vira nine-box.
3. **A regra de decisão é uma razão ou um produto dos eixos?** [03 Plano com iso-linhas](./03_plano-com-iso-linhas/). Razão (impacto por esforço) dá reta pela origem; produto (vitórias, investimento) dá hipérbole. Sem fórmula acordada, volte ao 01.
4. **Quem tem e quem não tem cada campo ou atributo?** [04 Matriz de cobertura binária](./04_matriz-de-cobertura-binaria/). Grade direta para achar a origem sem o campo; forma UpSet para contar combinações; hachura para campo fora da coleta.
5. **Escolher entre poucas opções com pesos?** [05 Matriz de decisão ponderada](./05_matriz-de-decisao-ponderada/). Sem pesos acordados, não use; sem peso nem total, é a matriz de comparação da família 14.
6. **Catálogo de riscos por probabilidade e impacto?** [06 Matriz de risco em células](./06_matriz-de-risco/), sabendo que a cor resume e não decide; havendo estimativa quantitativa de perda, prefira pontos com intervalo (17/02).
7. **Quem faz o quê em cada etapa de um processo?** [07 Matriz de responsabilidade (RACI)](./07_matriz-raci/), com um A por etapa validado e o declarado separado do executado.

## Quando procurar outra família

- A pergunta é a relação entre X e Y, e não a região: dispersão (família 09).
- Mais de cerca de 120 entidades no plano, onde o rótulo morre: densidade 2D (09/09), com a lista fora do plano.
- A célula existe para ler intensidade por gradiente (calendário, coorte, dia por hora): mapa de calor (família 15).
- O caminho completo por vários estágios importa mais que o par início e fim: Sankey (família 11).
- A área da célula codifica proporção: mosaico e marimekko (família 26).
- Caminho, vizinhança e centralidade entre entidades: rede e relações (família 27).
- Tabela com glifo lida linha a linha, e não como padrão de preenchimento: tabelas visuais (família 14).
- Perfil de uma entidade só em muitos critérios: radar (família 18). Distância até a meta num eixo só: progresso (família 13).

## Referências cruzadas

Formas estudadas nesta família que moram melhor em outra, com o que levar daqui quando forem construídas lá.

| Assunto | Onde mora | Por quê |
|---|---|---|
| Quadrante com trajetória entre dois períodos | [09/06 Dispersão de antes e depois com setas](../09_dispersao-e-bolhas/06_antes-e-depois-com-setas/) | O assunto é o movimento; daqui vai a regra de manter a divisória fixa entre os dois períodos e contar quem trocou de região. |
| Quadrante denso | [09/09 Densidade 2D](../09_dispersao-e-bolhas/09_densidade-2d/) | Centenas ou milhares de pontos; o bin precisa ter borda exatamente sobre o corte, e o tooltip é por bin ou por região. |
| Quadrante com distribuições marginais | [09/08 Dispersão com distribuições marginais](../09_dispersao-e-bolhas/08_dispersao-com-marginais/) | Mostra se o corte cai num vale ou no meio de um pico; a divisória atravessa as faixas marginais. |
| Matriz de confusão e matriz de-para | [15/07 Matriz de transição, de-para e confusão](../15_mapa-de-calor-e-calendario/07_matriz-de-transicao/) | Normalização declarada (bruta, por linha, por coluna) e totais separados entre permaneceram, avançaram, regrediram, entraram e saíram. |
| Matriz de correlação | [15/08 Heatmap de correlação](../15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/) | Escala divergente com domínio fixo e neutro no zero; `n` de pares por célula. |
| Matriz de comparação de itens | [14/09 Matriz de comparação com status](../14_tabelas-visuais/09_matriz-de-comparacao-com-status/) | Glifo sempre com o número ao lado; quando entram pesos e total, a forma é a [05](./05_matriz-de-decisao-ponderada/). |
| Matriz de pares | [27/01 Matriz de adjacência](../27_rede-e-relacoes/01_matriz-de-adjacencia/) | Entidades contra entidades do mesmo tipo; a ordem por agrupamento é o que revela bloco. |
| Pequenos múltiplos de quadrantes | [09/11 Pequenos múltiplos de dispersão](../09_dispersao-e-bolhas/11_pequenos-multiplos-de-dispersao/) | Mesmo domínio e mesmo corte em todos os painéis, ou o valor do corte no título; destaque sincronizado por `id`, não por `syncId`. |

## Referências

Todos os links vêm do [estudo da família](../_estudo/familias/25_matriz-e-quadrantes.md) e da [varredura de portais de design](../_estudo/00_portais-de-design.md). Bibliotecas fora da stack do Farol (Observable Plot, Vega-Lite, Highcharts, AG Charts, ECharts, Mermaid, scikit-learn) aparecem como referência de método e de comportamento, nunca como dependência. "Não abriu" quer dizer que o endereço veio de busca e a página não carregou durante a pesquisa.

### 01 Matriz 2x2 de quadrantes

- [Data Viz Project, 2x2 Matrix / Opposite Diagram](https://datavizproject.com/data-type/2x2-matrix/) (não abriu; 403): observar a definição de dois conjuntos de opostos em eixos cartesianos e o alerta de que o uso é com frequência conceitual, em escala relativa.
- [visualizing.org, Quadrant Chart](https://www.visualizing.org/quadrant-chart) (não abriu): verbete de definição e casos de uso do formato.
- [Raffael Marty, Two-by-Two Matrices](https://www.informit.com/articles/article.aspx?p=709139&seqNum=7): observar as vantagens (balde simples, eixo visível, conselho pelo rótulo), o alerta de que a matriz restringe o espaço de decisão e a Business Impact Matrix com a terceira medida na bolha.
- [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): observar o argumento de que corte no ponto médio é o defeito central do formato e a defesa de corte por meta, orçamento ou SLA.
- [Recharts, gist de ScatterChart com 4 quadrantes](https://gist.github.com/mehulcse/f729d4e93ee1dc67d7c8d22eb73bf940): observar as duas `ReferenceLine` como divisórias e o comentário de que o fundo colorido depende de `ReferenceArea`.
- [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `x` e `y` em valor de dado, `label` com `position`, `strokeDasharray` e `ifOverflow` com os quatro valores, inclusive por que não esticar o domínio por valor extremo.
- [Recharts, API do ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/): observar `x1`, `x2`, `y1`, `y2` em valor de dado, `ifOverflow` com padrão `discard`, `zIndex` com padrão 100 e `<Label />` como filho.
- [Mermaid, proposta de diagrama 2x2 / quadrantChart](https://github.com/mermaid-js/mermaid/issues/4282): observar a gramática mínima (título, rótulo e direção de cada eixo, rótulo dos quadrantes, pontos por coordenada).
- [Vega-Lite v2, Scatterplot with Mean and Standard Deviation Overlay](https://vega.github.io/vega-lite-v2/examples/layer_global_mean_dev.html) (não abriu): observar ponto, regra da média e faixa de desvio em camadas, a receita da faixa de indiferença.
- [Highcharts, demo de bubble sand-signika](https://www.highcharts.com/demo/bubble/sand-signika) (não abriu; 404): bolhas com `plotLines` nos dois eixos, a mesma ideia de corte por meta.
- [Vega-Lite, Scatter Plot with Text Marks](https://vega.github.io/vega-lite/examples/text_scatterplot_colored.html) (não abriu): observar o ponto trocado por texto quando o nome é curto e os itens são poucos.
- [Michael Sandberg, Calling Bullshit on the 2017 Gartner Magic Quadrant](https://datavizblog.com/2017/02/23/calling-bullshit-on-the-2017-gartner-magic-quadrant-for-bi-analytics-platforms/) (não abriu): crítica ao quadrante rotulado mais famoso do mercado, para saber o que não repetir.
- [Mark Sellors, Gartner-style charts in R with ggplot2](https://blog.sellorm.com/2019/02/11/gartner-style-charts-in-r-with-ggplot2/) (não abriu): reconstrução passo a passo, boa como lista de elementos do formato.
- [AG Charts, Multiple Bubble Series](https://www.ag-grid.com/charts/gallery/multiple-bubble-series/) (não abriu): referência de legenda de tamanho e sobreposição de bolhas.
- [Apache ECharts, issue 16401](https://github.com/apache/echarts/issues/16401) (não abriu): pedido de linhas de quadrante dentro da área de plotagem em bolha e dispersão.
- [graphomate, BCG Matrix with graphomate bubbles](https://www.graphomate.com/en/2018/09/charts-tables-for-ui5-2-2/) (não abriu): matriz BCG em bolhas como referência de anatomia.
- [Learn Lean Sigma, Impact Effort Matrix](https://www.learnleansigma.com/guides/impact-effort-matrix/) (não abriu): observar a leitura por aglomerado como produto principal da matriz, base do sumário por região.
- [Visier, Quadrant visual (2x2 scatter plot)](https://docs.visier.com/developer/Analytics/visual%20types/2x2%20scatter%20plot.htm): observar o quadrante por limiar de cada métrica, o alternador "Center on thresholds", o rótulo por quadrante de até 48 caracteres, o teto de 3.000 itens e o drill por clique direito.
- [Vega-Lite, Rectangular Brush](https://vega.github.io/vega-lite/examples/interactive_brush.html): observar `select: interval` e a condição de cor que separa selecionado de não selecionado, a gramática da lista sincronizada.
- [Recharts, useXAxisScale](https://recharts.github.io/en-US/api/useXAxisScale/): observar o retorno `ScaleFunction | undefined`, o uso só dentro do gráfico e a versão inversa para seleção por arrasto.
- [Data Visualisation Catalogue, correlation matrix](https://datavizcatalogue.com/blog/chart-snapshot-correlation-matrix/): observar o marcador de tamanho variável na interseção, alternativa quando o empate de posto é frequente.
- [Wikipedia, Perceptual mapping](https://en.wikipedia.org/wiki/Perceptual_mapping): observar os métodos de derivação dos eixos, pontos ideais contra vetores ideais e a limitação do mapa intuitivo, feito sem dado de cliente.
- [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar dispersão e bolha como formas padrão de Correlação e a barra divergente da categoria Desvio, parente do quadrante centrado no zero.

### 02 Matriz agregada de células

- [Mermaid, proposta de diagrama 2x2](https://github.com/mermaid-js/mermaid/issues/4282): observar a separação entre a sintaxe com pontos e coordenadas e a sintaxe conceitual, só com texto por quadrante.
- [Raffael Marty, Two-by-Two Matrices](https://www.informit.com/articles/article.aspx?p=709139&seqNum=7): observar a leitura por balde como vantagem central e o alerta de que a matriz restringe o espaço de decisão, que pesa mais com nove caixas.
- [Wikipedia, GE multifactorial analysis](https://en.wikipedia.org/wiki/GE_multifactorial_analysis): observar as três zonas de investimento, o círculo com raio e fatia por unidade, a seta de posição futura e a lista de limitações.
- [Wikipedia, Time management (método Eisenhower)](https://en.wikipedia.org/wiki/Time_management): observar a ação associada a cada quadrante e a nota sobre a autoria da frase.
- [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a célula em duas dimensões ordinais com escala de banda, `inset` e texto sobreposto, a receita da célula com contagem.

### 03 Plano com iso-linhas de razão ou produto

- [NN/g, 5 Prioritization Methods in UX Roadmapping](https://www.nngroup.com/articles/prioritization-methods/) (não abriu): observar onde a matriz 2x2 se encaixa entre os métodos de priorização e quais são seus limites.
- [Learn Lean Sigma, Impact Effort Matrix](https://www.learnleansigma.com/guides/impact-effort-matrix/) (não abriu): observar a exigência de definir critérios de impacto e de esforço antes de pontuar.
- [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `segment` com par de coordenadas, o mecanismo das iso-linhas retas, e que ele só desenha reta, o limite que obriga o `path` próprio na curva.
- [Recharts, useXAxisScale](https://recharts.github.io/en-US/api/useXAxisScale/): observar a função de dado para pixel, que dispensa refazer a conta do domínio ao desenhar a hipérbole.
- [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): observar a defesa de zonas que reflitam a regra do negócio, que aqui ganha forma de curva.
- [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar dispersão e bolha como formas padrão de Correlação, sobre as quais a curva é camada.

### 04 Matriz de cobertura binária

- [UpSet](https://upset.app/): observar a matriz de pontos ligados, as barras de tamanho por combinação e por conjunto, a faixa de 4 a 30 conjuntos e as ordenações por tamanho e por grau.
- [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a opção `interval`, que mostra lacuna em vez de continuidade falsa, útil para o campo fora da coleta.
- [Data Visualisation Catalogue, correlation matrix](https://datavizcatalogue.com/blog/chart-snapshot-correlation-matrix/): observar o marcador na interseção, o mesmo vocabulário do ponto cheio e do anel vazio.

### 05 Matriz de decisão ponderada

- [Wikipedia, Decision-matrix method](https://en.wikipedia.org/wiki/Decision-matrix_method): observar a opção de referência, a marcação melhor, pior e igual, a variante ponderada e as quatro fraquezas listadas (critérios arbitrários, critérios menores que distraem, soma que escolhe quem falha requisito obrigatório, notas que são palpites).
- [NN/g, 5 Prioritization Methods in UX Roadmapping](https://www.nngroup.com/articles/prioritization-methods/) (não abriu): comparação de métodos em que a pontuação ponderada aparece ao lado da matriz 2x2.
- [Recharts, índice da API](https://recharts.github.io/en-US/api/): observar `BarChart` e `Bar` com `stackId`, caminho alternativo para a decomposição do total quando a barra de divs não bastar.

### 06 Matriz de risco em células

- [Wikipedia, Risk matrix](https://en.wikipedia.org/wiki/Risk_matrix): observar os tamanhos por norma (3x3, 4x4, 5x5), os defeitos apontados por Cox (resolução, erros e reversões, alocação, entrada subjetiva) e o resultado de 2014 sobre ranking arbitrário.
- [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a célula ordinal com escala de banda nos dois eixos e a opção `interval` para lacuna explícita.
- [Highcharts, demo de heatmap](https://www.highcharts.com/demo/highcharts/heatmap) (abriu sem o texto do demo): referência de grade categórica com rótulo por célula.

### 07 Matriz de responsabilidade (RACI)

- [Wikipedia, Responsibility assignment matrix](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix): observar a definição das quatro letras, a regra de um único A por etapa, o layout etapa por papel e as variantes (RASCI, RACI-VSL, CAIRO, DACI).
- [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar texto sobre célula ordinal, a base da célula com letra.

### Gerais da família

- [From Data to Viz, página inicial e índice de caveats](https://www.data-to-viz.com/): observar a organização por formato de dado de entrada e a lista de armadilhas.
- [From Data to Viz, Overplotting](https://www.data-to-viz.com/caveat/overplotting.html) (não abriu): observar as técnicas contra sobreposição, o limite em que o 01 passa a pedir densidade.
- [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/): observar como a ordem de linhas e colunas revela ou esconde bloco, a razão da regra de ordem declarada nas matrizes discretas.
- [Recharts, API do Scatter](https://recharts.github.io/en-US/api/Scatter/): observar `shape`, `activeShape` e `label`, os encaixes do ponto próprio nos modelos 01 e 03.
- [Recharts, API do ScatterChart](https://recharts.github.io/en-US/api/ScatterChart/): observar `syncId` com `syncMethod` padrão por índice, razão para sincronizar destaque por `id` em estado próprio.
- [Wikipedia, Small multiple](https://en.wikipedia.org/wiki/Small_multiple): observar a exigência de mesma escala e mesmos eixos, que vale para qualquer quadrante repetido.

### Portais de design

A busca de matriz 2x2 nos portais devolveu quase só modelos de priorização de ferramentas de quadro branco, não design de dashboard. Matriz de risco, cobertura binária, decisão ponderada e RACI ficaram sem peça de portal verificada; os modelos 04, 05 e 07 não têm referência de portal. Nomes de designers e estúdios foram omitidos.

- [Dribbble, Priority Matrix dark mode](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode): observar quadrante em tema escuro com itens como cartões, divisória discreta e hierarquia de tipo dentro de cada região; a página carrega só a imagem, sem especificação. Serve aos modelos 01 e 02.
- [Behance, Quadrant Chart (Scatter Plot)](https://www.behance.net/gallery/182422151/Quadrant-Chart-%28Scatter-Plot%29) (aberto): observar a dispersão dividida em quatro quadrantes, inspirada em peça jornalística; a página não descreve eixos nem rótulos. Serve ao 01.
- [Dribbble, Figma infographics: Matrix, distribution, Scatter chart](https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart) (não abriu): distribuição de itens em matriz sobre dispersão, ponte entre o 01 e o 02.
- [Dribbble, Animated Matrix Chart, 49 Days of Charts](https://dribbble.com/shots/17790868-Animated-Matrix-Chart-49-Days-of-Charts) (não abriu): matriz de células em série de estudos de gráfico; referência de ritmo de grade para o 06.
- [Miro, template de matriz 2x2 de priorização](https://miro.com/templates/2x2-prioritization-matrix/) (não abriu): quatro caixas rotuladas em quadro colaborativo, referência de rótulo e direção de eixo para o 02.
- [CNVS, 10 Ways to Design an Impact Effort Matrix](https://www.getcnvs.design/blog/design-an-impact-effort-matrix) (não abriu): variações visuais do mesmo 2x2, útil para o tratamento de região e rótulo no 03.
- [UXPin, Priority Matrix: the value of a unique UX](https://www.uxpin.com/studio/blog/priority-matrix-the-value-of-a-unique-ux/) (não abriu): matriz de prioridade tratada como interface, e não como figura estática; serve ao 03.
