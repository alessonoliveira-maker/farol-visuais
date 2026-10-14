# Linha simples

## O que é

Pontos de uma série ordenada, quase sempre no tempo, ligados por segmentos: a posição vertical
codifica o valor e a inclinação codifica o ritmo de mudança. É a forma padrão do Farol para
responder "subiu ou desceu, quanto, desde quando", e concentra as camadas de contexto mais
pedidas sobre uma série única: rótulo no último ponto, meta ou limiar, evento datado, média móvel
sobre o bruto, seleção de janela e lacuna de coleta declarada.

## Quando usar

* Uma métrica em série temporal com 4 pontos ou mais: receita reconhecida mensal, entradas
  diárias, CPL semanal, percentual no SLA.
* Pergunta de subiu ou desceu, quanto e desde quando, com até duas referências desenhadas sobre a
  série (meta, teto, evento).
* Série diária ruidosa de 60 a 730 pontos, com média móvel declarada e, em tela de análise,
  seleção de janela.
* Série com coleta interrompida ou fonte que começou tarde, em que a diferença entre zero e não
  medido muda a leitura.

## Quando evitar

* Menos de 3 pontos: vira número com comparação em `01_cards-e-kpis`.
* Duas ou mais séries na mesma unidade: use `02_multiplas-series`.
* Valor que muda em instantes discretos, como teto de capacidade ou preço: use `03_step-degrau`.
* Composição de partes de um todo ou volume que pede área a partir do zero: use `05_areas`.
* Linha minúscula em cartão, sem eixo: use a sparkline de `24_microvisuais-sparklines`.
* Mais de duas anotações ou mais de 5 eventos na janela: resuma os eventos em lista ou use
  `20_cronograma-e-linha-do-tempo`.

## Anatomia

1. **Eixo x temporal.** Categórico com todos os meses ou dias presentes, sem pular o que falta;
   `formatMonthShort` ou `formatDate` no tique, `tickMargin={8}`, sem linha e sem tique próprio
   (`AXIS_PROPS` com `axisLine={false}`).
2. **Eixo y quantitativo.** De 3 a 5 linhas de grade em passo redondo (`niceCeiling` mais
   `Array.from` para os `ticks`), formatado por `formatCurrencyAxis`, `formatPercent` ou
   `formatInt` conforme a unidade; largura fixa entre 40 e 56 px.
3. **Grade só horizontal.** `<CartesianGrid stroke={GRID_COLOR} vertical={false} />`.
4. **Linha de 2 px** em `var(--chart-1)`, `type="linear"` em série curta e mensal, `"monotone"` só
   quando a leitura pede curva macia (média móvel sobre ruído diário).
5. **Ponto e rótulo no fim.** `dot` como função que só desenha no último índice válido; o rótulo
   direto usa `formatCurrencyCompact`, `formatPercent` ou `formatInt` e halo quando pode cruzar
   outra marca.
6. **Referência opcional.** Meta e teto em `ReferenceLine` horizontal tracejada; evento datado em
   `ReferenceLine` vertical tracejada; no máximo duas por versão, com rótulo de nome e valor numa
   margem reservada.
7. **Lacuna declarada.** `null` com `connectNulls={false}` para "não medido"; `ReferenceArea` em
   `var(--surface-sunken)` com texto para um período inteiro sem coleta; trecho tracejado para o
   dia corrente parcial.
8. **Dica opcional.** `Tooltip content={<ChartTooltip .../>}` com o mesmo formato do rótulo,
   cursor discreto e sem animação, só quando acrescenta o valor exato.

## Versões

* [`v1_receita-mensal-com-rotulo-final`](./v1_receita-mensal-com-rotulo-final/): receita
  reconhecida mensal de 2026-01 a 2026-08. Demonstra o calendário mensal completo gerado em
  TypeScript, a linha sem legenda com grade só horizontal e o rótulo direto só no último mês, com
  `formatCurrencyCompact` e tique em `formatCurrencyAxis`.
  ([preview escuro](./v1_receita-mensal-com-rotulo-final/preview.svg) ·
  [preview claro](./v1_receita-mensal-com-rotulo-final/preview-claro.svg))
* [`v2_sla-com-meta-e-evento`](./v2_sla-com-meta-e-evento/): percentual semanal de atendimento no
  SLA contra a meta de 90%, com a troca de escala como evento datado. Demonstra a meta e o evento
  em `ReferenceLine` (no máximo duas anotações) e as semanas abaixo da meta marcadas por ponto e
  símbolo, não só por cor.
  ([preview escuro](./v2_sla-com-meta-e-evento/preview.svg) ·
  [preview claro](./v2_sla-com-meta-e-evento/preview-claro.svg))
* [`v3_entradas-diarias-com-media-movel`](./v3_entradas-diarias-com-media-movel/): entradas
  diárias de leads em 180 dias, com o bruto em traço fino neutro e a média móvel de 7 dias em
  destaque por cima. Demonstra o rótulo e o marcador no fim de cada linha, recalculados sobre a
  fatia visível do `Brush` (não sobre os 180 dias inteiros), a janela de 7 dias declarada junto ao
  rótulo da média e o `Brush` recalculando o domínio y para a janela visível.
  ([preview escuro](./v3_entradas-diarias-com-media-movel/preview.svg) ·
  [preview claro](./v3_entradas-diarias-com-media-movel/preview-claro.svg))
* [`v4_origem-com-integracao-interrompida`](./v4_origem-com-integracao-interrompida/): leads
  diários de uma origem cuja integração ficou 9 dias fora do ar. Demonstra `null` com
  `connectNulls` desligado (distinto do zero medido), a `ReferenceArea` do período sem coleta, o
  ponto isolado com `dot` forçado no meio da lacuna e o último dia, parcial, em trecho tracejado.
  ([preview escuro](./v4_origem-com-integracao-interrompida/preview.svg) ·
  [preview claro](./v4_origem-com-integracao-interrompida/preview-claro.svg))

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o
   import do dado.
2. Se a página tem mais de uma métrica no tempo, prefira o mesmo `MARGIN.right` para todas as
   linhas rotuladas no fim, para os rótulos não ficarem em colunas diferentes entre cartões.
3. Ligue `data` à consulta real; mantenha o dado fictício do `data.ts` como amostra ou remova o
   default, conforme o passo 4 da seção 16 do `CONTRATO.md`.
4. Dê altura ao pai (`h-64` a `h-80`, o corpo médio medido nos previews vai de 234 a 350 px) e
   embrulhe em `VisualCard` com `metricId` para a etiqueta de procedência.
5. Confira o recorte vazio e o recorte com um único mês ou uma única semana, que aqui viram o
   bloco `role="status"` no lugar do gráfico.

## Referências

* [Data Viz Catalogue, Line Graph](https://datavizcatalogue.com/methods/line_graph.html):
  observar o limite de 3 a 4 linhas e a sugestão de pequenos múltiplos.
* [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph):
  observar o zero opcional e a regra de 70 a 80% da altura para os dados.
* [Recharts, Examples](https://recharts.github.io/en-US/examples/): observar as variações
  nativas de `LineChart` listadas, incluindo `Brush` e `ReferenceArea`.
* [Vega-Lite, Line chart with a dashed part](https://vega.github.io/vega-lite/examples/line_dashed_part.html):
  observar o ponto de junção repetido que costura o trecho medido ao trecho tracejado, usado aqui
  no dia parcial da `v4`.
* Arquivo do Farol: [`app/src/components/visuals/charts/chartTheme.ts`](../../../../app/src/components/visuals/charts/chartTheme.ts),
  origem de `useAnimateOnce`, `AXIS_PROPS` e das cores de token usadas em toda versão.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Itens que não reprovam versão, registrados para a próxima passada._

* `v1_receita-mensal-com-rotulo-final`: o tique de moeda quebra em duas linhas (`R$ 1,0` sobre
  `mi`) porque `VALUE_AXIS_WIDTH = 56` fica justo; a faixa da EIX-6 vai até 64 px.
* `v1_receita-mensal-com-rotulo-final`: a frase acessível afirma "o maior valor do período" sem
  calcular isso do dado; com outra série a afirmação pode ficar falsa.
* `v2_sla-com-meta-e-evento`: a série é semanal e o tique usa `formatMonthShort`, então o eixo
  repete `mai/26` duas vezes e `jun/26` três; `formatDate` separaria as semanas.
* `v2_sla-com-meta-e-evento`: `DOMAIN` e `TICKS` são constantes fixas de 0,7 a 1; série que caia
  abaixo de 70% sai do domínio em vez de esticá-lo.
* `v2_sla-com-meta-e-evento`: a frase acessível data o evento por `formatMonthShort` ("jun/26") e
  perde o dia da troca de escala, que o dado traz em `eventWeek`.
* `v3_entradas-diarias-com-media-movel`: a série é diária e o tique usa `formatMonthShort`, então
  os oito tiques da janela imprimem só `jun/26` e `jul/26`; nenhum deles identifica o dia.
* `v3_entradas-diarias-com-media-movel`: a frase acessível abre pelos 180 dias inteiros, enquanto
  a janela inicial do `Brush` desenha os últimos 60; dizer a janela visível alinharia as duas
  leituras.
* `v3_entradas-diarias-com-media-movel`: "méd. 7d" é abreviação criada no rótulo (ROT-8); a margem
  de 88 px comporta a forma escrita por extenso.
* `v3_entradas-diarias-com-media-movel`: o painel do `Brush` sai sem série de apoio e sem tique em
  repouso, então a janela selecionada não diz de quando a quando vai.
* `v4_origem-com-integracao-interrompida`: nenhum dia do dado tem zero medido, então o contraste
  que o catálogo nomeia (nulo distinto do zero, que é desenhado) fica só no texto; um dia com
  `leads: 0` junto da lacuna mostraria os dois tratamentos lado a lado.
* `v4_origem-com-integracao-interrompida`: o `useCase` fala em 9 dias fora do ar e a frase
  acessível conta 8, porque o dia do lançamento manual isolado tem valor medido.
* `v4_origem-com-integracao-interrompida`: com `MARGIN.right = 16` o trecho tracejado do dia
  parcial cabe em um traço só, colado na borda do corpo, e o último dia fica sem ponto próprio.
* `v4_origem-com-integracao-interrompida`: o dia parcial vive só em `leadsPartial`, que tem
  `tooltipType="none"`, então a dica do último dia sai vazia.
