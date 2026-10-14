# Área simples com gradiente

## O que é

Uma série temporal preenchida do zero até a linha: o preenchimento codifica volume e a leitura é
de tendência e massa acumulada, não de valor pontual exato. No acabamento deste catálogo o
gradiente vertical do estudo original vira preenchimento plano em opacidade baixa, porque a
COR-9 do contrato proíbe gradiente decorativo; o contorno de 2 px carrega a linha e a base fica
sempre no zero. O modelo absorve os pequenos múltiplos de área: várias séries da mesma unidade,
uma área por categoria, quando a forma individual importa mais que o total.

## Quando usar

- Uma série em que o volume ao longo do tempo importa: entradas de lead, receita reconhecida,
  investimento mensal.
- De 10 a cerca de 200 pontos; com menos de 10 datas, colunas leem melhor a mesma pergunta.
- Várias séries da mesma unidade cuja forma individual importa mais que a soma: pequenos
  múltiplos com escala comum entre os painéis.
- Pergunta de crescimento ou perda de força, em que o valor exato pode ficar na dica ou num
  rótulo de fim, sem precisar estar escrito em cada ponto.

## Quando evitar

- Eixo que não começa no zero ou recorte de escala: a área mente sobre a massa; usar linha
  simples.
- Série com valores negativos ou saldo contra uma referência: usar área de diferença, que separa
  o espaço acima e abaixo do zero.
- Comparar a trajetória de três ou mais séries no mesmo quadro: a sobreposição de preenchimentos
  vira ruído; usar múltiplas séries em linha.
- Menos de 3 pontos: a forma sugere uma tendência que o dado não sustenta (EIX-11); o caso vira
  número com comparação.
- Área mínima atrás do número de um cartão de KPI: isso é sparkline, não este modelo.

## Anatomia

1. **Preenchimento plano em opacidade baixa** (`AREA_FILL_OPACITY`, 0,18): a mesma cor do
   contorno, `var(--chart-1)`, sem gradiente. Opacidade alta vira mancha no tema escuro.
2. **Contorno de 2 px** (`strokeWidth={2}`) na mesma cor do preenchimento, curva `monotone` para
   nunca ultrapassar um ponto nem cruzar a base entre dois pontos.
3. **Grade só horizontal** (`CartesianGrid vertical={false}`, `var(--line-subtle)`), domínio do
   eixo de valor a partir do zero (`domain={[0, domainTop]}`) com 3 a 5 linhas em passo redondo,
   calculadas em `computeNiceTicks` no próprio arquivo (EIX-4).
4. **Eixo de valor com a unidade no tique** (`formatCurrencyAxis`, `formatInt` seguido do
   substantivo), largura entre 48 e 64 px; eixo de tempo em `formatMonthShort`.
5. **Dica com `ChartTooltip`**, sem animação, cursor em `var(--line-strong)`, mesmo formato do
   eixo e do rótulo.
6. **Linha de leitura opcional** no topo do corpo (`aria-hidden`, 12 px), calculada do dado:
   tendência, nota de parcial ou contagem de semanas sem coleta, conforme a versão.
7. **Lacuna, mês parcial e zero medido têm desenho próprio**: `null` com `connectNulls={false}`
   quebra a área; o trecho corrente incompleto sai tracejado; `ReferenceArea` em
   `var(--surface-sunken)` nomeia o intervalo sem coleta; zero medido continua desenhado e ganha
   o número escrito ao lado do ponto.

## Versões

- **`v1_entradas-mensais-de-leads`**: o caminho feliz. Série única de 14 meses, preenchimento
  plano, curva `monotone`, domínio a partir do zero com ticks redondos e a unidade no próprio
  tique do eixo de valor; sem legenda, porque é série única.
- **`v2_receita-com-mes-parcial`**: separa o mês corrente, ainda em curso, do restante da série.
  O trecho fechado é sólido, o trecho em curso é tracejado, e a média em `ReferenceLine` compara
  só contra os meses já fechados, com nota de "parcial até" por `formatDate`.
- **`v3_leads-por-origem-em-multiplos`**: pequenos múltiplos em grade HTML com Tailwind, um
  `AreaChart` por origem, 8 painéis com escala comum calculada sobre o conjunto (EIX-9), eixos só
  nas bordas da grade, animação desligada e o total anual de cada origem escrito no título do
  painel, que ordena os painéis do maior para o menor.
- **`v4_lacuna-de-coleta`**: distingue semana sem coleta de semana medida com zero. A lacuna quebra
  a área (`connectNulls={false}`) e ganha uma `ReferenceArea` nomeando o intervalo; o zero medido
  continua desenhado na linha de base e escreve "0" ao lado do ponto, para não ser confundido com
  a lacuna.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o dado padrão pela série real vinda
   do seletor da página.
2. Dê altura ao pai (`h-64` ou similar) ou passe `height`; sem altura o `ResponsiveContainer`
   desenha zero.
3. Em `v2`, a data de corte do mês parcial (`partialAsOf`) deve vir do relógio da página, não do
   `data.ts` fixo; troque por uma prop ou pelo dado do seletor.
4. Em `v3`, o número de colunas da grade (`GRID_COLUMNS = 4`) assume 6 a 10 origens; com muito
   mais categorias, prefira paginar ou agrupar as menores em "Outras" antes de chegar ao
   componente (COR-4).
5. Embrulhe no `VisualCard` do Farol: o `title` do `meta.json` vira o título do cartão, o
   `useCase` pode virar o `subtitle`.

## Referências

- [Data Viz Catalogue, Area Graph](https://datavizcatalogue.com/methods/area_graph.html):
  distinção entre áreas agrupadas com base comum e empilhadas.
- [Vega-Lite, Area Chart with Gradient](https://vega.github.io/vega-lite/examples/area_gradient.html):
  paradas de gradiente e contorno na cor final (referência de método; o acabamento deste
  catálogo usa preenchimento plano, não gradiente, por causa da COR-9).
- [Vega-Lite, Area Chart with Overlaying Lines and Point Markers](https://vega.github.io/vega-lite/examples/area_overlay.html):
  linha e pontos como propriedades da própria área.
- [shadcn/ui, Area Charts](https://ui.shadcn.com/charts/area): variantes sobre Recharts.
- [Behance, Line Chart Card Design](https://www.behance.net/gallery/227919755/Line-Chart-Card-Design):
  relação entre número, variação e área no cartão.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões passaram sem bloqueante._

- **v1**: o caso de uso diz "em 2026", mas a série desenhada vai de nov/25 a dez/26, 14 meses; o
  recorte escrito e o recorte desenhado não coincidem.
- **v1, v2, v3, v4**: os tiques de valor e de tempo são `<text>` de SVG sem `font-display` nem
  `tabular-nums` (TIP-1); os números do eixo saem em algarismo proporcional.
- **v2**: o catálogo pede trecho tracejado **e** ponto vazado no período incompleto; a versão
  entrega só o tracejado, com `dot={false}`, o que já resolve a leitura.
- **v2**: a anotação escreve apenas "média", enquanto a base ("meses fechados") aparece só na
  frase acessível; nomear a base na própria anotação deixaria a comparação explícita.
- **v2**: as duas `Area` compartilham `name="receita"`, então no mês de emenda (ago/26) a dica
  lista "receita" duas vezes, com o mesmo valor.
- **v3**: na linha de cima o tique 0 não é desenhado (o Recharts o descarta na borda inferior do
  painel), e a base fica rotulada só na linha de baixo.
- **v3**: com `GRID_TARGET_COUNT = 3` o domínio comum sobe a 100 enquanto o maior valor medido é
  62, o que deixa cerca de um terço de cada painel vazio.
- **v4**: o tique do tempo formata semana por `formatMonthShort`, então os rótulos se repetem
  (abr/26 e jun/26 duas vezes) e a dica também nomeia o mês, não a semana.
- **v4**: a frase acessível sai como "entre jun/26 e jun/26", porque as três semanas sem coleta
  caem todas no mesmo mês.
