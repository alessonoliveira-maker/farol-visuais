# Colunas contra meta ou limiar

## O que é

Colunas de período lidas contra uma referência fixa ou móvel: meta, média, teto de capacidade
ou forecast. A referência entra de três jeitos, cada um numa versão: linha fixa ou em degraus
sobre as colunas, corte que separa o excedente acima do limiar num segmento próprio da mesma
coluna, ou coluna fantasma mais larga e em contorno atrás do realizado. O que muda de uma versão
para outra é onde a comparação mora: numa linha à parte, dentro da própria coluna, ou numa
segunda forma sobreposta.

## Quando usar

* Uma medida por período com referência única ou em degraus, em até 12 períodos visíveis.
* Carga contra teto de capacidade, quando importa quanto passou do teto e não só se passou.
* Realizado contra meta ou forecast por período, com a referência atrás do realizado.
* Referência que muda no meio da série, como teto que sobe com contratação ou meta revisada.

## Quando evitar

* Uma medida só contra a meta, sem série de períodos: usar progresso e meta (família 13).
* Duas medidas sem relação de referência entre si: usar colunas agrupadas (modelo 02).
* A diferença para a referência é a mensagem principal, não o valor absoluto: usar painel de
  variação (família 08, modelo 06) ou colunas positivo e negativo (modelo 05).
* Média que incluiria o período corrente ainda parcial: calcular só sobre períodos fechados, ou
  não publicar a linha até o período fechar.
* Linha de meta e linha de média no mesmo gráfico sem traços distintos entre si: escolher uma.

## Anatomia

1. **Colunas do realizado**, nascendo do zero, em `var(--chart-1)` quando o cálculo não pede
   segmentação, ou divididas em TypeScript quando a referência corta a própria coluna (`dentro`
   e `excedente` empilhados no mesmo `stackId`, nunca recolorindo a coluna inteira).
2. **Referência**, em um dos três formatos da versão: `ReferenceLine` tracejada com
   `ifOverflow="extendDomain"` e rótulo numa margem reservada (linha fixa); `Line
   type="stepAfter"` sobre as colunas (referência em degraus); ou um segundo retângulo mais largo
   e em contorno, desenhado por trás pelo `shape` do `Bar` (coluna fantasma).
3. **Rótulo de valor**, escrito na coluna inteira quando a leitura pede comparar todos os
   períodos, ou só no excedente e nos casos fora da faixa quando a mensagem é o desvio.
4. **Segmento de excedente**, em `var(--negative)`, com rótulo `+N` só onde ele é maior que
   zero; nunca colore a coluna inteira quando ela passa do limiar.
5. **Linha de leitura**, uma frase acima do gráfico calculada do dado: quantos períodos bateram
   ou passaram a referência, e o viés médio quando a referência é um forecast.
6. **Legenda de papel**, só quando a forma sozinha não nomeia os dois lados (coluna fantasma e
   capacidade em degraus): dois itens de texto com a amostra na forma da marca, nunca legenda de
   cor para uma série única.

## Versões

* **`v1_receita-contra-meta-mensal`**: `ReferenceLine` na meta mensal fixa, com
  `ifOverflow="extendDomain"` e rótulo em margem reservada; meses acima da meta em
  `var(--chart-1)` e abaixo em neutro, valor escrito em toda coluna com halo onde cruza a linha;
  contador "X de 12 meses bateram a meta" calculado do dado. Preview:
  [escuro](v1_receita-contra-meta-mensal/preview.svg) ·
  [claro](v1_receita-contra-meta-mensal/preview-claro.svg).
* **`v2_entradas-contra-teto-com-excedente`**: dado dividido em TypeScript em `dentro` e
  `excedente`, empilhados no mesmo `stackId`; só o excedente em `var(--negative)`, com rótulo
  `+N` nas semanas que estouraram o teto; dica reconstruída com o valor original e o excedente,
  não com as duas séries técnicas. Preview:
  [escuro](v2_entradas-contra-teto-com-excedente/preview.svg) ·
  [claro](v2_entradas-contra-teto-com-excedente/preview-claro.svg).
* **`v3_fechamentos-contra-forecast`**: coluna fantasma via um único `Bar` com `shape` custom,
  desenhando o forecast largo em contorno atrás do fechado estreito e sólido a partir do
  `payload`; atingimento escrito só nos meses abaixo de 90% ou acima de 110%; mês em que o
  fechado passa do forecast lido como informação, sem moldura ali; viés médio do forecast no
  período calculado do dado. Preview: [escuro](v3_fechamentos-contra-forecast/preview.svg) ·
  [claro](v3_fechamentos-contra-forecast/preview-claro.svg).
* **`v4_demanda-contra-capacidade-em-degraus`**: `ComposedChart` com a capacidade como `Line
  type="stepAfter"` sobre as colunas de demanda, empilhadas em `dentro` e `excedente`; mês com
  capacidade zero sai todo em excedente, com o rótulo "sem capacidade" em vez de um `+N` sem
  sentido; excedente pequeno recebe `minPointSize` para não sumir, e a dica avisa a altura
  ampliada; legenda nomeando "capacidade medida" e "demanda projetada", sem selo de procedência
  no `Chart`. Preview: [escuro](v4_demanda-contra-capacidade-em-degraus/preview.svg) ·
  [claro](v4_demanda-contra-capacidade-em-degraus/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o import do dado.
2. Passe a série real pela prop `data`, no formato de `MonthlyRevenue`, `WeeklyIntake`,
   `MonthlyClosing` ou `MonthlyDemand` conforme a versão; a meta, o teto ou a capacidade vêm por
   prop separada (`goal`, `cap`) quando a versão as expõe, nunca hardcoded no componente colado.
3. Calcule `dentro` e `excedente` (v2 e v4) ou o par `forecast`/`closed` (v3) na página ou no
   seletor, no mesmo formato que o `data.ts` demonstra; o componente não busca dado nem calcula
   agregado fora do que já recebe pela prop.
4. Dê altura ao pai (`h-64` para `card`, uma linha de grade mais larga para `largo`) e embrulhe
   em `VisualCard` com o `title` do `meta.json`; a `v4` pede um pai mais largo, pelo canvas
   `largo` que ela usa no catálogo.
5. Se a meta, o teto ou a capacidade puderem mudar no meio do período real (revisão de meta,
   contratação nova), construa a série de referência já com o valor por período, como a `v4` faz
   com `capacity`, em vez de recalcular no componente.

## Referências

* Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary).
* Catálogo: [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/).
* Catálogo: [Vega Lite, Layered Bar Chart](https://vega.github.io/vega-lite-v2/examples/bar_layered_transparent.html).
* Catálogo: [Highcharts, Overlapping Placement Column](https://www.highcharts.com/demo/column-placement).
* Praticante: [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts).
* Praticante: [dataviz.boutique, Ultimate Variance Chart (IBCS)](https://dataviz.boutique/2017/08/15/power-bi-ultimate-variance-chart-faq-ibcs-r/).
* Implementação: [Recharts, Stacked Bar Chart with Horizontal Line](https://recharts.github.io/en-US/examples/StackedBarChartWithHorizontalLine/).
* Implementação: [Recharts, Bar](https://recharts.github.io/en-US/api/Bar/), para `stackId` e `minPointSize`.
* Portal de design: [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard).

## Observações da revisão (não bloqueantes)

* `v1`: o texto acima fala em contador "X de 12 meses bateram a meta", mas o `data.ts` traz 6
  meses e a tela imprime "4 de 6"; alinhar a redação ao dado.
* `v1`, `v2`, `v3`, `v4`: a folga entre o rótulo de valor e a ponta da marca está em 8 px
  (`VALUE_LABEL_GAP`, `LABEL_GAP`), enquanto a tabela 17.7 do CONTRATO pede 6 px.
* `v2`: o catálogo descreve a versão como mensal ("Entradas mensais", "em cada mês") e a entrega é
  semanal (S01 a S10); divergência de catálogo, não de desenho, e o `meta.json` já diz semanal.
* `v2`: nenhuma marca desenha o teto de 60, que só aparece escrito na linha de leitura; uma
  `ReferenceLine` ancoraria o corte para quem lê só o gráfico.
* `v3`: o catálogo pede sobreposição por dois `XAxis` com `xAxisId`; a entrega usa um `Bar` com
  `shape` custom, com o desvio declarado no `meta.json` e resultado visual equivalente.
* `v3`: o atingimento é escrito como `Math.round(ratio * 100)` mais o sinal de percentual, fora de
  `formatPercent`, que a seção 8 do CONTRATO pede para todo número de tela.
* `v3`: a amostra de forecast na legenda é contorno em `--line-strong`, par de 1,8:1 na tabela
  17.10, aprovado só com valor escrito ao lado, o que a legenda não tem.
* `v4`: a linha de leitura conta 5 meses acima do teto e deixa jan/27, que tem 150 de demanda sem
  capacidade instalada, fora da conta visível; ele só aparece na frase acessível.
* `v2`: o rótulo `+N` é o único do modelo desenhado sem `HALO`; `v1`, `v3` e `v4` já nascem com ele.
  No dado fixo nada cruza grade nem marca, mas a ROT-7 decide pelo que o dado pode produzir, e um
  excedente que caia perto de uma linha de grade colocaria o texto em cima dela.
* `v1` e `v3`: o `XAxis` tem 6 categorias e não declara `interval={0}`, que a EIX-7 pede até 8; nos
  dois temas o render imprime os 6 tiques, então a garantia existe de fato mas não está escrita.
* `v1` e `v3`: o comentário do topo justifica `VALUE_AXIS_WIDTH = 56` dizendo que ele mantém
  `R$ 700 mil` numa linha só, e o render quebra o tique em duas linhas; a leitura não sofre, o
  comentário é que não descreve o desenho.
* `v4`: a dica anuncia altura ampliada em todo excedente abaixo de `TINY_EXCESS_THRESHOLD = 6`,
  inclusive mar/27 com `+5`, em que o `minPointSize` de 2 px não chegou a agir; o aviso sobra, não
  falta, mas afirma um ajuste que aquele mês não recebeu.
* `v2`: a coluna sem excedente termina em canto reto, porque o `radius` arredondado vive só no
  segmento `over`, enquanto a `v1` arredonda toda coluna; diferença de acabamento entre as duas.
* `v2` e `v4`: `VALUE_AXIS_WIDTH` de 34 px e 40 px fica abaixo da faixa de 48 a 64 da EIX-6; as
  duas têm eixo de contagem, não de moeda, então a regra pode não as alcançar, o que vale
  esclarecer no CONTRATO em vez de versão a versão.
