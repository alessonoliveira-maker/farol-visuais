# Colunas empilhadas com total

## O que é

Uma coluna por período dividida em segmentos empilhados, um por componente, todos nascendo do
zero. A altura total da coluna responde "quanto foi o período" e os segmentos respondem "de que
isso é feito". Só a base da pilha e o total têm uma referência comum entre colunas; os segmentos
do meio flutuam e não podem ser comparados de coluna para coluna sem o leitor fazer a subtração
de cabeça.

## Quando usar

* Total por período e sua composição, em até 6 componentes coloridos e até 12 períodos.
* O componente que o leitor mais precisa acompanhar pode ficar encostado na base da pilha, onde
  ganha uma referência comum entre colunas.
* Cauda longa de componentes que aceita agrupamento em "Outros" com a contagem no rótulo.
* Duas pilhas por período com os mesmos componentes, como orçado e realizado por trimestre.

## Quando evitar

* A pergunta é a evolução de um componente do meio da pilha: usar small multiples ou linhas, que
  dão a cada série a própria base de comparação.
* Só o mix interessa e o tamanho absoluto não: colunas empilhadas 100% (modelo 04).
* Decomposição de uma variação em contribuições passo a passo: cascata (19).
* Componentes com sinais opostos, como entradas e saídas: colunas positivo e negativo (modelo
  05), que ancoram no zero dos dois lados.
* Mais de duas pilhas por período: vira ilegível; usar small multiples (modelo 08).
* Total contra meta por período como mensagem principal: colunas contra meta (modelo 06), que
  deixa o papel da referência explícito.

## Anatomia

1. **Segmentos empilhados** (`Bar` com o mesmo `stackId`): um por componente, na mesma ordem em
   todas as colunas, mapeados por categoria via `--chart-1` a `--chart-6` na ordem de slot 1, 3,
   6, 5, 2, 4 (COR-8). A sétima categoria em diante entra em "Outros (n=X)".
2. **Base da pilha**: o componente que o leitor mais precisa acompanhar, porque é o único, além
   do total, com referência comum entre colunas.
3. **Contorno entre segmentos** (`stroke="var(--surface-raised)"`, 1,5 px): separa segmentos
   vizinhos que não contrastam entre si (COR-5).
4. **Cantos arredondados** (`radius`) só no segmento do topo da pilha; os demais ficam retos,
   senão a coluna vira uma torre de pastilhas.
5. **Total** (opcional): somado no seletor em TypeScript, porque o Recharts não expõe o total da
   pilha, e escrito acima da coluna por `LabelList` em `formatInt` ou `formatCurrencyCompact`.
6. **Categoria de ausência** ("Sem origem declarada"): contorno vazado `--text-muted`, sempre
   visível, sempre por último, nunca somada a "Outros" (COR-4).
7. **Legenda**: HTML, na ordem visual da pilha lida de cima para baixo (o topo da legenda
   corresponde ao topo da pilha), com amostra na forma da marca.
8. **Eixo numérico** em zero (`domain={[0, 'dataMax']}`), com grade só horizontal (EIX-3) e de 3
   a 5 linhas (EIX-4).
9. **Dica**: sempre `ChartTooltip`, com o componente zerado ou nulo naquele período filtrado do
   `payload` antes de chegar nela, para não entrar na lista.

## Versões

* **[v1_leads-por-origem-com-total](v1_leads-por-origem-com-total/)**: caso básico com três
  origens de lead em 6 meses, total escrito acima de cada coluna e legenda na ordem da pilha.
  Preview: [escuro](v1_leads-por-origem-com-total/preview.svg) ·
  [claro](v1_leads-por-origem-com-total/preview-claro.svg).
* **[v2_custo-em-tres-camadas](v2_custo-em-tres-camadas/)**: custo mensal em 12 meses nas três
  camadas direta, rateio de time e estrutura, com o perímetro de cada camada nomeado na legenda
  e a participação da estrutura no ano na linha de leitura.
  Preview: [escuro](v2_custo-em-tres-camadas/preview.svg) ·
  [claro](v2_custo-em-tres-camadas/preview-claro.svg).
* **[v3_origens-com-cauda-longa](v3_origens-com-cauda-longa/)**: caso limite de cauda longa, com
  14 origens reduzidas a 5 nomeadas mais "Outros (n=9)" e "Sem origem declarada" sempre visível
  e fora do agrupamento; componente zerado no mês some da coluna e da dica.
  Preview: [escuro](v3_origens-com-cauda-longa/preview.svg) ·
  [claro](v3_origens-com-cauda-longa/preview-claro.svg).
* **[v4_orcado-e-realizado-por-trimestre](v4_orcado-e-realizado-por-trimestre/)**: duas colunas
  por trimestre no mesmo `stackId`, orçado em contorno e realizado sólido, trimestre sem
  orçamento aprovado sem a pilha de orçado, e a diferença do trimestre mais distante anotada
  acima do par.
  Preview: [escuro](v4_orcado-e-realizado-por-trimestre/preview.svg) ·
  [claro](v4_orcado-e-realizado-por-trimestre/preview-claro.svg).

## Como colar no Farol

1. Escolha a ordem dos componentes antes de copiar: a base é fixa por decisão de produto (o
   componente que a página precisa comparar entre períodos), não por ranking do dado.
2. Se a página tem mais de 6 categorias, agrupe em "Outros" **antes** de passar `data` para o
   componente; o Chart não decide sozinho o que entra na cauda.
3. Ligue `data` ao seletor da página; o total, quando exibido, é recalculado no próprio Chart a
   partir dos componentes, nunca recebido pronto (evita total e soma dos segmentos divergirem).
4. Em `v4`, o par orçado e realizado é modelado como duas linhas por período (uma por regime),
   não como seis colunas de dado numa linha só; ao trocar por dado real, gere as duas linhas na
   consulta e mantenha `budgetApproved: false` para o trimestre sem orçamento, com os três
   valores em `null`.
5. Confira, com o dado real, se algum componente chega sempre em zero ou nulo num recorte: a
   dica já filtra esses casos, mas a legenda continua listando a categoria (correto: ela existe
   no modelo mesmo quando um período específico não a usa).

## Referências

* Catálogo: [Datawrapper Academy, o que considerar em colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts).
  Observar duas regras diretas: "traga o valor mais importante para a base" e agrupar os menores
  em "Outros".
* Catálogo: [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html).
  Observar a distinção entre a pilha simples e a de 100% e a menção ao problema de comparar
  segmentos.
* Catálogo: [Vega Lite, Stack](https://vega.github.io/vega-lite/docs/stack.html). Observar os
  quatro offsets (`zero`, `normalize`, `center`, `null`), que mapeiam para os modelos desta
  família.
* Praticante: [HealthDataViz, Raising the Bar on Stacked Bar Charts](https://healthdataviz.com/2016/04/15/raising-bar-stacked-bar-charts/).
  Observar a crítica prática ao excesso de segmentos por coluna.
* Implementação: [Recharts, Stacked Bar Chart](https://recharts.github.io/en-US/examples/StackedBarChart/)
  e [shadcn/ui, `chart-bar-stacked.tsx`](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts).
  Observar o `stackId` compartilhado e o `radius` aplicado só na ponta da pilha.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Nenhum item abaixo reprova a versão; ficam registrados para a próxima
passada de acabamento._

* **v1**: `BAR_MAX = 40` passa do teto de 24 da ESP-2 para moldura `card`; a espessura efetiva
  medida no PNG segue dentro da régua, então é a constante declarada que descreve a intenção.
* **v1**: o segmento de Orgânico em ago/26 vale 9 leads e some no PNG: o contorno de 1,5 px da
  COR-5 cobre quase toda a faixa e sobra cerca de 1 px de cor. O caso difícil que o `data.ts`
  quis exercitar não chega a ser visto; vale estudar suprimir o contorno quando o segmento for
  mais fino que ele.
* **v1**: o total escrito acima da coluna sai sem substantivo ("475"), enquanto a NUM-6 pede a
  unidade em todo lugar em que o número aparece; o assunto está no título e na legenda.
* **v2**: o catálogo pede o perímetro de cada camada na dica; a versão o move para a legenda,
  porque o `ChartTooltip` da seção 6 não acumula pilha e não pode ser reescrito aqui. O desvio
  está declarado em `notes` e a informação continua sempre visível, o que é até melhor que a
  dica; quem atualizar o catálogo pode alinhar o texto da versão.
* **v2**: a linha de grade de R$ 200 mil atravessa os rótulos de total de mai/26 e jun/26 sem o
  halo da ROT-7. O traço é `--line-subtle` (1,25:1) e a leitura não sofre, mas o halo limparia.
* **v2**: o rótulo de total está em 11 px, e a tabela 17.1 reserva 12 px para rótulo direto de
  valor; com 12 colunas de moeda por extenso a redução é defensável.
* **v3**: o modelo se chama "com total" e esta versão não escreve o total acima da coluna. A
  entrada do catálogo para a v3 também não o pede, então não há divergência formal; ainda assim
  é a única das quatro em que a altura da pilha só se lê pelo eixo.
* **v3**: `BAR_MAX = 44` passa do teto de 24 da ESP-2; e o `radius` do topo está preso à chave
  `semOrigem`, então o mês sem ausência declarada (jul/26) fica com o canto reto. Nenhum dos dois
  muda a leitura.
* **v3 e v4**: o não preenchimento das marcas vazadas usa a palavra `transparent`, que não é
  token do Farol nem cor literal de verdade; o `npm run check` aceita, e não há efeito de tema.
* **v4**: a anotação de diferença está presa ao literal `'T3/2026'` dentro do `Chart.tsx`. Com o
  dado fixo ela cai no trimestre de maior desvio, como o README promete, mas com outro `data` a
  anotação some em vez de acompanhar o desvio; derivar o trimestre do dado deixaria a peça sem
  estado.
* **v4**: a anotação fica centrada na coluna de realizado do par, e não no par, e o texto avança
  sobre a faixa de T4/2026, que é justamente o trimestre sem orçamento; centrar no par afasta a
  leitura errada.
* **v4**: `barCategoryGap="20%"` fica abaixo do piso de 30% da ESP-2, e o vão dentro do par é
  igual ao vão entre pares, então o agrupamento por trimestre depende do rótulo do eixo.
* **v4**: com `domain={[0, 'dataMax']}` a última faixa da grade (R$ 450 mil a R$ 580 mil) sai
  mais estreita que as demais; a EIX-4 pede intervalo redondo até a primeira linha acima do
  maior valor.
