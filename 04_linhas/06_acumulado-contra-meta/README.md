# Acumulado contra meta (burn-up)

## O que é

A soma acumulada do realizado desde o início do período contra a trajetória acumulada da meta
até o valor final: a distância entre as duas linhas é o adiantamento ou o atraso. É um burn-up
(a linha sobe, ao contrário do burn-down que desce): a soma é calculada em TypeScript a partir do
valor mensal ou semanal, nunca vem pronta do dado, e cada versão deste modelo diz explicitamente
de quando a quando ela acumula e se a meta impressa é a do período em tela ou a anual, porque sem
essas duas informações a peça afirma uma trajetória sem dizer o que mediu.

## Quando usar

* Metas aditivas do ano ou do trimestre: receita reconhecida, fechamentos, agendas realizadas.
* Pergunta de se o acumulado está na trajetória e de que ritmo fecha a meta até o fim do período.
* Meta revisada no meio do período, que precisa aparecer como mudança de escopo e não como reescrita do passado.

## Quando evitar

* Taxas e médias, que não somam: use `01_linha-simples` com meta.
* Progresso num instante só, sem trajetória: use `13_progresso-meta-e-gauge`.
* Diferença sombreada entre real e meta como assunto principal: use a área de diferença de `05_areas`.
* Negócio sazonal com meta linear sem aviso: derive a trajetória sazonal (`v3`) ou declare a escolha.

## Anatomia

1. **Real acumulado**, linha sólida em `--chart-1`, somada em TypeScript a partir do valor do
   período (nunca vem pronta do `data.ts`); meses ou quinzenas futuras entram como `null` e a
   linha para ali, sem repetir o último valor (`connectNulls={false}`).
2. **Meta acumulada**, linha tracejada em `--line-strong`; linear (um `n` avos do total por
   período) ou sazonal (peso do período equivalente do ano anterior aplicado ao total). A meta
   impressa é sempre nomeada: anual (`v1`, `v4`), do trimestre (`v2`) ou como a prop escolher
   entre linear e sazonal (`v3`).
3. **Marcador de hoje e rótulo do gap**, no ponto onde o real para: valor acumulado escrito ao
   lado do ponto (`formatCurrencyCompact`, halo) e, quando a versão cobre isso, a distância até a
   meta no mesmo período, com sinal e cor semântica (`--positive`/`--negative`) acompanhados da
   palavra "acima" ou "abaixo".
4. **`ReferenceLine` da meta final**, horizontal em `y={meta}` com `ifOverflow="extendDomain"`, ou
   vertical em `x={mêsDaRevisão}` quando o que se anota é uma data; rótulo com o valor por extenso
   numa margem reservada, nunca sobre a marca.
5. **Eixo a partir do zero**, `formatCurrencyAxis` no tique, de 3 a 5 linhas de grade e todas as
   categorias impressas (`interval={0}`) quando cabem 8 ou menos; acima disso, canvas `largo` para
   caber as 12 sem descartar tique.

## Versões

* [`v1_receita-acumulada-contra-meta-anual`](./v1_receita-acumulada-contra-meta-anual/): receita
  reconhecida acumulada de janeiro a junho de 2026, com julho e agosto como meses futuros em
  `null`, contra a trajetória linear da meta anual de R$ 10,0 milhões. Demonstra o acumulado
  calculado em TypeScript, a `ReferenceLine` da meta anual com `extendDomain` e o eixo de moeda a
  partir do zero.
  ([preview escuro](./v1_receita-acumulada-contra-meta-anual/preview.svg) ·
  [preview claro](./v1_receita-acumulada-contra-meta-anual/preview-claro.svg))
* [`v2_gap-de-hoje-e-ritmo-necessario`](./v2_gap-de-hoje-e-ritmo-necessario/): fechamentos por
  quinzena no terceiro trimestre de 2026 contra a meta do trimestre, não a anual. Demonstra o gap
  desenhado como conector vertical entre o real e a meta na quinzena de corte, a linha do ritmo
  necessário até o fim do trimestre e as duas anotações no limite do modelo (o gap e o ritmo).
  ([preview escuro](./v2_gap-de-hoje-e-ritmo-necessario/preview.svg) ·
  [preview claro](./v2_gap-de-hoje-e-ritmo-necessario/preview-claro.svg))
* [`v3_meta-linear-contra-sazonal-com-projecao`](./v3_meta-linear-contra-sazonal-com-projecao/):
  o ano inteiro de 2026, medido até agosto e projetado dali a dezembro pelo mesmo formato sazonal
  de 2025, contra a meta anual na trajetória linear ou sazonal (prop `metaVariant`). Demonstra a
  meta sazonal derivada do peso mensal do ano anterior, a projeção tracejada e o rótulo no fim de
  cada trajetória em vez de legenda.
  ([preview escuro](./v3_meta-linear-contra-sazonal-com-projecao/preview.svg) ·
  [preview claro](./v3_meta-linear-contra-sazonal-com-projecao/preview-claro.svg))
* [`v4_meta-revisada-e-cancelamento`](./v4_meta-revisada-e-cancelamento/): fechamentos acumulados
  de janeiro a agosto de 2026 contra a meta anual, revisada de R$ 9,0 milhões para R$ 10,2 milhões
  em julho, com um cancelamento em agosto que faz o acumulado cair. Demonstra a meta como `Line`
  `stepAfter` sem redesenhar o passado, a revisão anotada com a data e os dois valores, e a queda
  anotada em vez de suavizada.
  ([preview escuro](./v4_meta-revisada-e-cancelamento/preview.svg) ·
  [preview claro](./v4_meta-revisada-e-cancelamento/preview-claro.svg))

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue
   `data` à consulta real de fechamentos ou receita reconhecida.
2. Decida a meta na origem, não no componente: se a página tem meta anual e meta do trimestre ao
   mesmo tempo, passe explicitamente qual delas por prop (`annualTarget` ou `quarterlyTarget`) e
   ajuste o rótulo que a nomeia; nunca deixe implícito qual escopo está em tela.
3. Quando o negócio for sazonal, prefira a variante `v3` com `metaVariant="sazonal"` como padrão;
   a meta linear (`v1`) só é honesta em negócio sem sazonalidade relevante.
4. Dê altura ao pai (`h-64` a `h-80`) e embrulhe em `VisualCard` com `metricId` para a etiqueta de
   procedência; o Chart não desenha título nem selo.
5. Confira o recorte de um único mês (vira o bloco `role="status"`) e o recorte em que a meta
   ainda não foi revisada nenhuma vez (a `v4` cai de volta na trajetória linear simples).

## Referências

* Catálogo: [Wikipedia, Burndown chart](https://en.wikipedia.org/wiki/Burndown_chart). Observar a
  diferença entre burn-down e burn-up e a linha de escopo.
* Praticante: [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph).
  Observar metas como linhas de referência.
* Documentação: [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/).
  Observar `ifOverflow="extendDomain"` e `segment` para desenhar o gap.
* [Atlassian, Agile burndown chart tutorial](https://www.atlassian.com/agile/tutorials/burndown-charts):
  observar a linha ideal como diagonal e a linha real dia a dia.
* [Globant, Why you should use a Burn-Up chart instead of a Burn-Down chart](https://stayrelevant.globant.com/en/technology/agile-organizations/why-you-should-use-burn-up-chart-in-agile-instead/):
  observar o argumento central, o burn-up mostra mudança de escopo e o burndown esconde.
* [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar a seção de projeção, que explica por que "quanto falta" não responde "vou chegar".
* Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar a convivência entre série temporal e indicador de meta na mesma tela.
* Arquivo do Farol: [`app/src/components/visuals/charts/chartTheme.ts`](../../../../app/src/components/visuals/charts/chartTheme.ts),
  origem de `useAnimateOnce`, `AXIS_PROPS` e das cores de token usadas em toda versão.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões passaram sem bloqueante._

* Todas: a trajetória da meta é desenhada em `--line-strong`, par que a tabela 17.10 mede em
  1,79:1 no escuro e libera como marca só com valor escrito; apenas a `v3` escreve o valor no fim
  da linha. Nas outras três o valor da meta vive na anotação ou na linha de leitura.
* Todas: nenhuma linha carrega o nome da série sobre o desenho, então a identificação do
  tracejado depende da linha de leitura e da anotação; a ROT-3 prevê rótulo no fim de cada linha.
* Todas: o tique de moeda quebra em duas linhas nos valores mais largos ("R$ 10,0 mi",
  "R$ 500 mil") porque a EIX-6 limita `YAxis width` a 64. Legível, mas irregular.
* `v1`: a frase acessível diz "de jan/26 a jun/26 de 2026", com o ano repetido, porque
  `formatMonthShort` já imprime o ano no rótulo.
* `v2`: o rótulo do gap diz "abaixo da meta", quando a distância medida é até a trajetória da meta
  naquela quinzena e não até a meta do trimestre inteiro.
* `v2`: o conector vertical do gap fica 14 px à esquerda da quinzena de corte para não encostar no
  marcador, então ele não cai exatamente sobre a data.
* `v2`: a linha do ritmo necessário usa a mesma `--chart-1` do realizado e se distingue só pelo
  tracejado; é coerente por ser projeção da mesma grandeza, mas apoia a leitura numa pista só.
* `v2`: `targetAtCutoff` é capturado por efeito colateral no `dot` da meta e lido no `dot` do
  realizado; funciona pela ordem do JSX e quebra em silêncio se as duas linhas trocarem de lugar.
* `v2`: a linha de leitura leva `truncate`, então em cartão estreito ela corta em reticências.
* `v3`: o preview mostra só a trajetória sazonal, que é o que o catálogo pede (alternância por
  prop), mas a pergunta do caso de uso compara linear com sazonal e não se responde numa imagem
  só; vale um segundo preview com `metaVariant="linear"` ou uma nota dizendo isso.
* `v3`: o peso mensal de 2025 é quase uniforme, então a trajetória sazonal fica perto da linear e
  a demonstração perde força; um dezembro mais pesado separaria melhor as duas curvas.
* `v4`: o último degrau da meta (R$ 6,4 mi em ago/26) aparece só como um traço vertical na borda
  direita, próprio do `stepAfter` no ponto final, então os R$ 990,0 mil de atraso que a linha de
  leitura afirma quase não se veem no desenho.
* `v4`: o rótulo "R$ 5,4 mi" passa a cerca de 1 px da linha do realizado no trecho de descida; o
  halo da ROT-7 resolve a leitura, mas a folga é mínima.
