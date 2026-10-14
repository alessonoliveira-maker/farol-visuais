# Calendário mensal em grade

## O que é

O mês desenhado como calendário de parede: sete colunas de dia da semana, seis linhas reservadas, o
número do dia no canto de cada célula e o valor no centro. É o formato que o público operacional lê
sem treino, porque é o mesmo desenho da agenda dele. Perde para a série temporal em tendência e ganha
em orientação: "quinta que vem está cheia" é uma pergunta de calendário, não de gráfico de linha.

## Quando usar

- Carga operacional dentro do mês: reuniões, visitas, plantões, entregas, agendas por dia.
- Conversa com quem opera a agenda, que precisa localizar o dia e não a tendência.
- Marcar exceção de calendário junto do número: feriado, recesso, dia de campanha.
- Mês único, com cerca de 30 valores. Vários meses de uma vez são o calendário do ano (modelo 04).

## Quando evitar

- Comparar meses entre si: o formato muda de altura e a leitura de tendência fica pior que uma linha.
- Valor contínuo de faixa larga, como receita por dia, em que cinco faixas de cor escondem diferença.
- Eventos com hora de início e fim: aí é cronograma, família 20.
- Mais de um número por dia: a célula não comporta, e o caso vira tabela da família 14.

## Anatomia

1. **Cabeçalho de dias da semana**, começando na segunda, como o resto do Farol.
2. **Célula do dia**, com o número do dia no canto superior em 11 px e a contagem no centro em 14 px.
3. **Cor por faixa**, com as faixas começando na primeira reunião, e **zero em `--surface-sunken`**,
   fora da rampa, porque o poço se vê nos dois temas e `--surface-overlay` é o mesmo branco do cartão
   no claro (`TOK-1`). O `notes` do `meta.json` da `v1` ainda cita o token antigo.
4. **Dia sem expediente**, com borda tracejada, ícone e o nome do feriado, sem cor de rampa e fora de
   toda média. A `v3` troca o tracejado de `--line-strong`, que mede 1,79:1 contra o cartão, por
   `--text-muted`, que mede 5,21:1: o tracejado do feriado precisa ser visto.
5. **Dias de outro mês**, não desenhados na `v1` e na `v2`, e esmaecidos em `--text-muted` na `v3` e na
   `v4`, onde a ponta do mês é parte do que a versão mostra.
6. **Seis linhas reservadas**, mesmo quando o mês ocupa cinco. A `v4` é a exceção declarada, porque o
   chip de evento faz a linha custar 82 px do corpo.
7. **Anel de destaque**, uma borda de 2 px que toda célula carrega na cor do cartão e que só o dia
   apontado troca: `--warning` no dia acima do teto (`v2`), `--chart-1` no dia corrente (`v3` e `v4`).
   Assim o destaque nunca muda o layout.
8. **Linha de leitura** no topo do corpo, 12 px, calculada do dado, nas versões `v2` a `v4`: teto,
   recorte parcial ou contagem de marcos na janela.
9. **Barra de período** na `v4`, um segmento por semana em `--surface-sunken`, com canto arredondado só
   na ponta real e o rótulo escrito no primeiro segmento (`ANO-4`).
10. **Legenda**, com a escala e o teto de cada degrau, o total, a média por dia útil e o que sai da
    conta.

## Versões

- `v1_reunioes-realizadas-em-setembro`: setembro de 2026, com o feriado do dia 7 marcado por ícone,
  fins de semana em zero e média calculada só sobre dia útil com expediente. Rampa de cinco degraus com
  limites fixos escritos à mão.
- `v2_dias-acima-da-capacidade-de-agenda`: agosto de 2026 lido contra o teto de 22 agendas por dia útil.
  A rampa sai do TETO, não da distribuição: os três degraus são metade dele, três quartos e ele mesmo.
  Passando disso a célula sai da rampa, pula para `--seq-7` e ganha anel em `--warning`, ícone de alerta
  e número em peso 700. O anel fica a 2 px do preenchimento, na cor do cartão, porque `--warning` contra
  `--seq-7` mede 1,21:1 no escuro.
- `v3_mes-de-seis-semanas-com-feriado`: novembro de 2026, que ocupa as seis semanas, com as pontas de
  out/26 e dez/26 esmaecidas, feriado tracejado, dia corrente com anel de foco e os dias de 25 em diante
  marcados por ícone de relógio, sem número. A rampa é por TERCIL, com o teto de cada degrau escrito, e
  tem três degraus porque o anel de `--chart-1` mede 1,36:1 contra `--seq-6`.
- `v4_calendario-de-marcos-com-janela-de-leitura`: dezembro de 2026 como régua de prazo. Sem rampa: a
  célula carrega chip de evento, com teto de 2 e a sobra contada no canto, e a janela de leitura vira uma
  barra por semana, com canto arredondado só na ponta real. É a única versão que desenha 5 linhas em vez
  de 6, e a razão está na nota do `meta.json` dela.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/MonthCalendar/`.
2. O `data` traz uma entrada por dia do mês, na ordem, do dia 1 ao último. `meetings: null` é dia sem
   expediente e sai das médias; zero é medição e fica.
3. `MONTH` vem do seletor de período da página, nunca do relógio.
4. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
5. As faixas de `BUCKET_EDGES` da `v1` são da medida, não do visual: trocar reuniões por outra contagem
   exige recalibrar os quatro limites, senão o mês inteiro sai na mesma cor. A `v2` e a `v3` não têm esse
   problema porque derivam os cortes do teto e dos tercis do próprio dado; prefira uma delas quando a
   métrica for trocar.
6. O teto de degraus da rampa é de TRÊS quando a peça tem anel de `--chart-1`, e vai a cinco só quando
   não tem: `--chart-1` mede 1,36:1 contra `--seq-6` e o anel desaparece. Está medido na nota da `v3`.
7. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [AG Charts, calendário mensal](https://www.ag-grid.com/charts/gallery/): observar a célula com número do dia e valor, e a marcação de dias fora do mês.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): observar o limite de faixas distinguíveis, que é o que fixa as cinco daqui.
- Portal de design: [Behance, painéis de agenda e operação](https://www.behance.net/search/projects/calendar%20dashboard): observar a densidade de célula de calendário em painel operacional (só metadados em texto verificados).
