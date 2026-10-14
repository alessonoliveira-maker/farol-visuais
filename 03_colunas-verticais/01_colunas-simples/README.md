# Colunas simples

## O que é

Uma coluna por período ou por categoria curta, todas nascendo do zero e lado a lado na ordem do
tempo. A altura da coluna é o valor; não há segmento, não há segunda série. É a forma padrão para
responder "quanto entrou em cada período" e a base de que os outros modelos da família partem.

## Quando usar

* Uma medida por período discreto (semana, mês, trimestre), com até cerca de 30 períodos visíveis.
* Poucas categorias curtas e não temporais em que a magnitude importa mais que a tendência.
* Série em que um evento explica um degrau e precisa ficar marcado no próprio gráfico, com até três
  eventos na janela.
* Série longa em que o eixo precisa mostrar a hierarquia do tempo: semanas sob o mês, meses sob o
  ano.

## Quando evitar

* Rótulo de categoria longo, como motivo de perda ou nome de campanha: usar barras horizontais
  (família 02, modelo 01).
* Tendência contínua em muitos períodos, sem interesse no volume de cada um: usar linhas (família
  04).
* Diferença que só aparece com o eixo começando acima de zero: usar ponto ou linha.
* Mais de três eventos na mesma janela: numerar e listar no rodapé, ou separar em outro visual.
* Distribuição de uma variável contínua, com colunas que se tocam: usar histograma.
* Coluna minúscula dentro de célula ou card, sem eixo: usar sparkbar.

## Anatomia

1. **Eixo de períodos**, horizontal, ordinal e não temporal: o Recharts distribui as categorias em
   passos iguais, então um período faltante precisa ser preenchido em TypeScript antes do render
   (`month: null`), senão a série mente sobre a cadência.
2. **Eixo de valor**, vertical, sempre começando em zero (`domain={[0, 'dataMax']}`), com poucas
   marcas (`tickCount={4}`) formatadas por `@/lib/format`.
3. **Colunas**, cor única `var(--chart-1)`, largura travada por `maxBarSize` derivado do passo da
   ESP-6 (nunca um número redondo arbitrário) e respiro por `barCategoryGap` entre 30% e 40%.
4. **Rótulo de valor**, escrito só onde a mensagem exige (o pico, o último período, o caso
   difícil), nunca em toda coluna.
5. **Linha de leitura**, uma frase acima do gráfico calculada do dado, que aponta o período de
   pico ou a semana corrente, sem repetir o título.
6. **Anotação de evento**, quando houver: `ReferenceArea` para uma janela e `ReferenceLine` para um
   marco pontual, ambas em tokens neutros (`--surface-sunken`, `--text-muted`).

## Versões

* **`v1_leads-por-mes`**: `BarChart` nativo com domínio em zero, grade só horizontal e
  `maxBarSize` derivado do passo da ESP-6; valor escrito só no mês de pico e no último mês; série
  completada em TypeScript para o eixo ordinal não esconder mês faltante; linha de leitura
  calculada do dado apontando o mês de pico. Preview: [escuro](v1_leads-por-mes/preview.svg) ·
  [claro](v1_leads-por-mes/preview-claro.svg).
* **`v2_campanha-no-ar`**: `ReferenceArea` em `surface-sunken` cobrindo as semanas em que uma
  campanha esteve no ar, com o total do período escrito na própria faixa; `ReferenceLine` vertical
  na semana de estreia, com a data exata guardada no dado e mostrada na dica. Preview:
  [escuro](v2_campanha-no-ar/preview.svg) · [claro](v2_campanha-no-ar/preview-claro.svg).
* **`v3_entradas-semanais-em-dois-niveis`**: dois eixos horizontais no mesmo gráfico, o de baixo
  com o número da semana e o de cima com o mês, um rótulo por grupo, centralizado pela contagem
  real de semanas de cada mês (inclui um mês de 5 semanas); separador vertical sutil entre meses,
  ancorado pela escala real do eixo `week` via `useXAxisScale` (não por um eixo numérico paralelo,
  que desviava do passo de barra e furava colunas: Checklist 15, corrigido em 2026-09-18); semana
  corrente com o tique em peso 700 e a palavra "parcial". Preview:
  [escuro](v3_entradas-semanais-em-dois-niveis/preview.svg) ·
  [claro](v3_entradas-semanais-em-dois-niveis/preview-claro.svg).
* **`v4_semana-sem-coleta`**: separa a semana sem coleta (marca vazada, tracejada, com o texto
  "indisponível") da semana que mediu exatamente zero (traço fino de 2 px sobre a base, escrito
  "0"), nunca desenhando as duas do mesmo jeito nem inventando um valor para a que faltou. Preview:
  [escuro](v4_semana-sem-coleta/preview.svg) · [claro](v4_semana-sem-coleta/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o import do dado.
2. Passe a série real pela prop `data`, no mesmo formato de `MonthlyLeads` ou `WeeklyIntake`; se o
   período puder faltar na origem, preencha-o com `null` antes de passar ao componente (é o que
   `fillMonths` demonstra na `v1`), nunca omita o período.
3. Dê altura ao pai (`h-64` ou a linha da grade) e embrulhe em `VisualCard` com o `title` do
   `meta.json`; a `v3` pede um pai mais largo, pelo canvas `largo` que ela usa no catálogo.
4. Se a página tiver uma semana ou mês corrente ainda em curso, passe o identificador dele pela
   prop `currentWeek` (`v3`) em vez de calcular a partir do relógio do navegador.

## Referências

* Catálogo: [Data Viz Catalogue, Bar Chart](https://datavizcatalogue.com/methods/bar_chart.html).
* Catálogo: [Datawrapper Academy, por que colunas começam em zero](https://www.datawrapper.de/academy/why-our-column-and-bar-charts-start-at-zero).
* Catálogo: [Observable Plot, bar mark](https://observablehq.com/plot/marks/bar) e [Interval transform](https://observablehq.com/plot/transforms/interval).
* Praticante: [FlowingData, Bar Chart Baselines Start at Zero](https://flowingdata.com/2015/08/31/bar-chart-baselines-start-at-zero/).
* Praticante: [FlowingData, Real Chart Rules to Follow](https://flowingdata.com/2015/08/11/real-chart-rules-to-follow/).
* Implementação: [Recharts, Simple Bar Chart](https://recharts.github.io/en-US/examples/SimpleBarChart/) e [Tiny Bar Chart](https://recharts.github.io/en-US/examples/TinyBarChart/).
* Implementação: [shadcn/ui, diretório de charts](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts), arquivo `chart-bar-default.tsx`.
* Portal de design: [Dribbble, Bar Chart Dashboard Card (Dark Theme)](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18, sobre os PNGs de conferência dos dois temas. Atualizada na rodada de
correção do mesmo dia: os itens resolvidos por ela saíram desta lista, não porque a nuance de
redação não importe, mas porque deixaram de descrever o arquivo atual. Revisão independente de
2026-09-18 (segunda passada): as quatro versões passam no `npm run check` sem erro nem aviso e
nenhuma tem bloqueante; os itens abaixo são nuance e ficam registrados para quem corrigir._

* **`v1_leads-por-mes`**: o eixo de valor termina em 214, que é o maior valor e não uma linha de
  grade redonda, então o intervalo fica desigual (75, 75, 64). A EIX-4 pede intervalo redondo.
* **`v2_campanha-no-ar`**: a linha tracejada de estreia cai por cima da coluna da S07 e fica sem
  halo. Meia banda para a esquerda, na fronteira entre S06 e S07, deixa a coluna inteira à vista.
* **`v2_campanha-no-ar`**: o eixo de valor termina em 91, o maior valor, pelo mesmo motivo da
  observação de intervalo redondo da `v1`.
* **`v2_campanha-no-ar`**: a `ReferenceArea` da janela de campanha usa `ifOverflow="visible"`
  enquanto a `ReferenceLine` de estreia usa `ifOverflow="extendDomain"`; os dois cumprem o
  contrato, mas vale uniformizar quando a versão for revisitada.
* **`v4_semana-sem-coleta`**: o texto "indisponível" ocupa mais que a banda da S06 e encosta na
  coluna da S07, com cerca de um pixel de folga no PNG. Encurtar a palavra ou baixar o corpo do
  texto devolve o respiro sem mudar a leitura.
* **`v4_semana-sem-coleta`**: o campo `weekStart` existe no dado e não aparece na tela nem na
  dica, diferente da `v2` e da `v3`, que mostram a data exata da semana.
* **`v1_leads-por-mes`**: a marca do mês ausente é vazada e tracejada, como manda a 17.2, mas a
  palavra que a explica só aparece na dica, porque o rótulo de valor é escrito apenas no pico e no
  último mês. A DIC-1 pede que nada essencial viva só na dica; escrever `formatUnavailable()`
  acima da marca de mar/26, como a `v4` faz, fecha o ponto.
* **`v1_leads-por-mes`**: a frase acessível cita o pico e o último mês e não menciona que mar/26
  ficou sem coleta, então quem lê por leitor de tela não recebe a ressalva que o desenho dá.
* **`v3_entradas-semanais-em-dois-niveis`**: a coluna da semana corrente é desenhada cheia e da
  mesma cor das semanas fechadas; o aviso de parcial vive no tique em peso 700, na linha de
  leitura e na dica. A EIX-10 sugere marcar o próprio período incompleto (traço tracejado ou
  marca vazada), o que evitaria ler a queda de 99 para 62 como queda de cadência.
* **`v3_entradas-semanais-em-dois-niveis`**: a entrada do catálogo ainda descreve "dois XAxis com
  xAxisId", enquanto a versão usa um eixo de semana mais o overlay de mês por `useXAxisScale`, que
  foi justamente a correção de 2026-09-18. O `meta.json` já diz "dois eixos horizontais"; falta o
  catálogo acompanhar, e ele não é editável por quem revisa.
* **`v3_entradas-semanais-em-dois-niveis`**: o eixo de valor termina em 108, o maior valor, pelo
  mesmo motivo de intervalo redondo já anotado na `v1` e na `v2`.
* **`v4_semana-sem-coleta`**: a frase acessível diz "13 semanas medidas, 1 com zero entradas e 1
  sem coleta" em 14 semanas; a semana zerada está dentro das medidas, mas a soma lida em voz alta
  dá 15. Dizer "13 medidas, das quais 1 mediu zero" tira a ambiguidade.
