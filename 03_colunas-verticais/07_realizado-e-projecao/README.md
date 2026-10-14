# Realizado e projeção hachurada

## O que é

A mesma série em dois regimes: os períodos fechados em preenchimento sólido e os períodos
futuros, ou o restante do período em curso, em hachura com contorno na cor da série. A textura
carrega o recado de que aquilo ainda não aconteceu, e o método por trás da parte hachurada
(ritmo diário, forecast declarado, média móvel) fica escrito na peça, nunca implícito. O padrão
de hachura mora em `<defs><pattern>` com id de `useId()` e é aplicado por `shape`, escolhendo
entre cor sólida e padrão conforme um campo do próprio dado (`regime`, ou o cálculo de restante).
O modelo absorve o destaque do período em curso e o trio realizado, previsto e meta no mesmo
gráfico.

## Quando usar

* Ano com meses fechados e meses projetados, com método de projeção declarado.
* Período corrente ainda em curso ao lado de períodos fechados, para a última coluna não parecer
  queda por estar incompleta.
* Período em curso com realizado, previsto restante e meta, para saber se a soma fecha a meta.
* Série de até 12 períodos em que o regime de cada coluna vem do dado, nunca do relógio do
  navegador.

## Quando evitar

* Projeção sem método declarado: não publicar a parte hachurada; melhor mostrar só o realizado.
* Cenários com saída em faixa, piso e teto por período: colunas de faixa (família 17, modelo 04).
* Evolução acumulada do ano contra a meta: acumulado contra meta em linhas (família 04, modelo 06).
* Todos os períodos fechados e nenhum foco no atual: colunas simples (modelo 01).
* Previsão contínua com banda de incerteza, não um valor pontual por período: linha com banda de
  intervalo (família 04, modelo 04).

## Anatomia

1. **Colunas sólidas** para o que já aconteceu, em `var(--chart-1)`, com `radius` só no topo do
   segmento visível.
2. **Colunas hachuradas** para o que ainda é projeção: `<pattern>` em `<defs>` com id de `useId()`
   (nunca contador global), traço fino e espaçado com contorno em `var(--chart-1)`, aplicado via
   `shape` do `Bar` conforme o regime da linha ou o cálculo de restante (`forecast` menos
   `realizado`, com piso em zero).
3. **Divisória ou zona de projeção**, quando a série é um ano inteiro: `ReferenceArea` tênue em
   `var(--surface-sunken)` sobre os meses projetados, com o rótulo posicionado na margem
   reservada do topo (`viewBox.y − 8`), nunca disputando altura com o topo das colunas.
4. **Meta por coluna**, quando o modelo compara com um alvo que muda mês a mês: um traço curto
   tracejado em `var(--text-muted)` com halo de `var(--surface-raised)`, desenhado por um `Bar`
   independente preso a um segundo `XAxis` oculto com as mesmas categorias, cuja única função é
   devolver, sem empilhamento, o pixel exato do valor da meta na mesma escala Y.
5. **Legenda de regime**, só com amostra sólida e amostra hachurada (nunca cor categórica para
   duas coisas que são a mesma série em momentos diferentes), mais os totais do período escritos
   como realizado e previsto, nunca somados num único número sem aviso.
6. **Nota do caso limite**, quando a coluna foge do padrão: sem leitura ainda (traço na base, sem
   coluna), previsão já superada pelo realizado (restante zero, aviso de previsão desatualizada)
   ou mês sem meta cadastrada (sem traço de meta, nota curta em vez de meta zero).
7. **Linha de leitura ou nota de rodapé**, calculada do dado: dias decorridos e ritmo no mês
   parcial, ou a distância entre o total do mês corrente e a meta, nunca repetindo o título.

## Versões

* **`v1_receita-do-ano-com-projecao`**: ano com 8 meses fechados e 4 projetados; `ReferenceArea`
  sobre os meses projetados com o rótulo "projeção a partir de set/26" na margem reservada;
  legenda com amostra sólida e hachurada mais os totais do ano, nunca somados. Preview:
  [escuro](v1_receita-do-ano-com-projecao/preview.svg) ·
  [claro](v1_receita-do-ano-com-projecao/preview-claro.svg).
* **`v2_mes-corrente-parcial`**: 12 meses de leads, o último ainda em curso; `daysElapsed` e
  `daysInMonth` recebidos por prop, nunca pelo relógio; coluna corrente dividida em realizado
  sólido e restante hachurado, com o ritmo diário nomeado na linha de leitura; meses fechados
  rotulados só no maior e no último. Preview: [escuro](v2_mes-corrente-parcial/preview.svg) ·
  [claro](v2_mes-corrente-parcial/preview-claro.svg).
* **`v3_realizado-previsto-e-meta`**: 12 meses de 2026 apurados até 2026-09-14, com a meta em
  traço por coluna via um segundo eixo X oculto; previsto restante como `forecast` menos
  `realizado` com piso em zero; meses fechados com `forecast` nulo, para a dica não escrever
  previsto zero; a distância do mês corrente até a meta na nota de rodapé. Preview:
  [escuro](v3_realizado-previsto-e-meta/preview.svg) ·
  [claro](v3_realizado-previsto-e-meta/preview-claro.svg).
* **`v4_realizado-acima-do-forecast`**: três casos limite lado a lado, um mês sem nenhuma leitura
  (traço na base em vez de coluna), um mês com o realizado já acima do forecast declarado
  (restante zero, aviso de previsão desatualizada) e um mês sem meta cadastrada (sem traço de
  meta, nota em vez de meta zero); frase acessível que conta quantos meses têm meta, forecast e
  só realizado. Preview: [escuro](v4_realizado-acima-do-forecast/preview.svg) ·
  [claro](v4_realizado-acima-do-forecast/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o import do dado.
2. Passe a série real pela prop `data`, no formato de `MonthlyRevenueRegime`,
   `MonthlyLeadsPartial`, `MonthlyRevenueForecastGoal` ou `MonthlyForecastRow` conforme a versão;
   o regime (fechado ou projetado) e o restante previsto vêm sempre do dado, calculados na página
   ou no seletor, nunca do índice da linha nem do relógio do navegador.
3. Nas versões com período corrente (`v2` e `v3`), passe `daysElapsed`/`daysInMonth` ou
   `currentMonth`/`asOfDate` pela prop, vindos do backend junto com o dado: usuários em fusos
   diferentes não podem ver colunas diferentes.
4. Dê altura ao pai (`h-64` para `card`, uma linha de grade mais larga para `largo`, como a `v3`
   usa) e embrulhe em `VisualCard` com o `title` do `meta.json`.
5. Antes de publicar a parte hachurada, confirme que o método de projeção existe e cabe numa
   frase curta: hachura sem método declarado é a lição central do modelo (seção Quando evitar).

## Referências

* Catálogo: [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts). Notação explícita: sólido para realizado, contorno para plano e hachura para previsão.
* Catálogo: [Apache ECharts, aria e decal](https://echarts.apache.org/handbook/en/best-practices/aria/). Textura como segundo canal além da cor, equivalente conceitual ao `<pattern>` do SVG.
* Catálogo: [Apache ECharts, Style](https://echarts.apache.org/handbook/en/concepts/style/). O `itemStyle` com `decal`, equivalente conceitual ao `<pattern>` do SVG.
* Praticante: [Storytelling with Data, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Marcador vazado e traço pontilhado para o futuro, faixa em torno da estimativa central.
* Praticante: [Few, Graph Selection Matrix (PDF)](https://www.perceptualedge.com/articles/misc/Graph_Selection_Matrix.pdf). Onde previsão e realizado se encaixam nas relações de dado catalogadas.
* Implementação: [Recharts, API do Bar](https://recharts.github.io/en-US/api/Bar/). `shape` como elemento ou função, o que permite trocar `fill` por `url(#hachura)` por linha de dado.
* Implementação: [Recharts, Bar Chart With Customized Event](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/). O `shape` decidindo a aparência por item, com o estado morando no componente pai.
* Portal de design: [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1629909588466522134/dashboard-charts-ui-kit). Real, previsto e comparativo tratados como estados do mesmo componente.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18, sobre os PNGs de conferência dos dois temas._

* **`v1`**: as colunas usam `rx={3}` no `<rect>` inteiro, então a base também sai arredondada,
  enquanto o item 1 da Anatomia pede raio só no topo do segmento visível.
* **`v1`**: a `ReferenceArea` da zona de projeção começa antes do centro da coluna de set/26 e
  segue até a borda direita do corpo, então o recorte pintado não coincide com as bandas das
  quatro colunas que ele marca.
* **`v2`**: os meses fechados em `var(--line-strong)` medem 1,79:1 contra o cartão e só o maior e
  o último trazem valor escrito; os demais ficam sem a isenção da 17.2. É o desenho que o catálogo
  pede para esta versão, fica só registrado.
* **`v2`**: o número escrito na coluna corrente é o total projetado (206); o realizado até o dia de
  corte (96) só aparece na dica e na frase acessível.
* **`v3`**: a amostra de meta na legenda é tracejada em `border-line-strong`, enquanto o traço
  desenhado por coluna sai em `var(--text-muted)`; a amostra e a marca não usam o mesmo tom.
* **`v3`**: a nota de rodapé lê "set/26: realizado mais previsto faltam R$ 30,0 mil para a meta",
  sem verbo de ligação entre o sujeito e a distância.
* **`v4`**: três notas aparecem ao mesmo tempo (sem leitura ainda, previsão desatualizada, sem meta
  cadastrada), acima do teto de duas anotações por visual da ANO-1.
* **`v4`**: a nota "sem meta cadastrada" não leva halo e a linha de grade de R$ 600 mil atravessa o
  texto nos dois temas; a ROT-7 pede halo onde o rótulo cruza linha.
* **`v4`**: o mês sem nenhuma leitura é mai/26, que vem antes de três meses já fechados na mesma
  série; o caso limite se lê melhor no primeiro período em aberto.
* **`v3`**: a peça nomeia a hachura como "previsto" mas não escreve de onde o forecast vem, ao
  contrário da `v1`, que escreve "média móvel dos meses fechados" na zona de projeção.
* **`v2`**: os números de leads aparecem sem o substantivo no rótulo, no tique e na linha de
  leitura; a unidade só chega pelo título do `VisualCard`, fora do Chart (NUM-6).
* **`v2`**: a linha de leitura imprime o ritmo arredondado (7/dia), enquanto a projeção usa o ritmo
  cheio (6,86/dia); quem multiplicar 7 por 30 chega a 210 e não aos 206 escritos na coluna.
* **`v4`**: em set/26 o rótulo "R$ 310,0 mil" fica preso ao topo do segmento realizado, que cai
  dentro da parte hachurada, e o halo da ROT-7 interrompe a hachura e o contorno por cerca de 11 px,
  deixando uma lasca de hachura de 3,5 px entre o texto e a coluna sólida. O texto se lê limpo nos
  dois temas e a âncora é a correta (o valor nomeia o realizado, não a pilha), mas vale procurar uma
  saída que não parta a marca, como escrever o valor ao lado da coluna.
* **`v4`**: a amostra de meta na legenda é tracejada em `border-line-strong`, enquanto o traço por
  coluna sai em `var(--text-muted)`, a mesma diferença de tom já anotada na `v3`.
