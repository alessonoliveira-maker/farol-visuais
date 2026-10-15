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
5. **Dias de outro mês**, esmaecidos em `--text-muted`, sem preenchimento e sem valor, na `v1`, na `v3` e
   na `v4`; a `v2` não os desenha.
6. **Seis linhas reservadas**, mesmo quando o mês ocupa cinco. A `v4` é a exceção declarada, porque o
   chip de evento faz a linha custar 82 px do corpo.
7. **Anel de destaque**, uma borda de 2 px que toda célula carrega na cor do cartão e que só o dia
   apontado troca: `--warning` no dia acima do teto (`v2`), `--chart-1` no dia corrente (`v3` e `v4`). Na `v4` os chips
   usam os slots 3, 6 e 5, para o slot 1 ficar só com o anel de hoje.
   Assim o destaque nunca muda o layout.
8. **Linha de leitura** no topo do corpo, 12 px, calculada do dado, nas versões `v2` a `v4`: teto,
   recorte parcial ou contagem de marcos na janela. Com `data` vazio as quatro devolvem o bloco
   `role="status"` em vez da grade.
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

## Observações da revisão (não bloqueantes)

**2026-10-15**, revisão independente das quatro versões: as quatro reprovadas (parecer em
`validation/revisao_15_mapa-de-calor-e-calendario__05_calendario-mensal-em-grade_2026-10-15.md`).
Nada abaixo reprova; quem tocar o arquivo alinha.

- v1, `meta.json`: o `notes` cita `--surface-overlay` para o zero, e o código usa `--surface-sunken` (a Anatomia, item 3, já registra).
- v1, ACE-3: o tracejado do feriado em `--line-strong` mede 1,79:1 e 1,83:1 contra o cartão; a palavra "feriado" segura a leitura, e a v3 já usa `--text-muted` (5,21:1 e 5,37:1).
- v1, ACE-1: "1 dia sem expediente ficou fora da média" tem o singular fixo; com 0 ou 2 feriados sai "0 dia" ou "2 dia". `formatDays` resolve.
- v1, NUM-6: "246 no mês" sai sem o substantivo; "246 reuniões no mês".
- v1, Anatomia item 10: a legenda escreve só as pontas (0 e 17+), sem o teto de cada degrau que este README promete; o número na célula segura a leitura.
- v1, dado: nenhum dia útil termina em zero (os zeros caem todos em sábado e domingo), e o `meta.json` promete "dia útil em zero" como estado; trocar um dia útil para 0 exercita a segunda metade do caso de uso.
- v2, TIP-3: os cinco números acima do teto saem em 700, e a regra admite dois elementos; o catálogo e a COR-2 pedem o peso como segundo canal, então é tensão de régua. O ícone e o anel já carregam o destaque.
- v2, NUM-6: a linha de leitura diz "5 dos 21 passaram dele" sem "dias úteis", que o catálogo escreve ("5 de 21 dias úteis acima de 22 agendas").
- v2: o fim de semana sai só com o número do dia, sem palavra nem amostra na legenda; quem diz que célula sem preenchimento é dia sem expediente é só a frase acessível.
- v3, comentário do topo (linha 21) e `notes`: o anel de `--chart-1` mede 4,95:1, 4,03:1 e 3,13:1 contra `--seq-1`, `--seq-2` e `--seq-3` no claro, e o pior tema é o claro, não os 8,30, 6,02 e 4,14 do escuro; continua acima de 3:1.
- v3: a bandeira do feriado sai espremida, 8 por 9 px no PNG claro contra 11 por 14 na v1, porque ícone de 12 px, vão de 4 e a palavra não cabem nos cerca de 45 px da célula; a palavra segura.
- v3: com menos de 3 dias com agenda, `edges` é null e o dia medido sai no poço do zero (linha 211), com o número escrito e a legenda dizendo "sem base".
- v3: ponta de outro mês e fim de semana do mês se distinguem só pelo tom do número (`--text-muted` contra `--text-secondary`); a sequência dos números segura.
- v4: `--surface-sunken` pinta a barra da janela e a célula de recesso, as duas a 1,15:1 contra o cartão; o recesso tem ícone e palavra e a barra tem rótulo no primeiro segmento (ANO-4), então nada se confunde, mas são dois períodos na mesma tinta.
- v4, NUM-6: "+1" e "+2" saem sem substantivo; a legenda explica a convenção.
- v4, ESP-1 e seção 5: o raio 8 da barra está escrito quatro vezes no JSX (linhas 236 a 239), fora de constante nomeada; sem consequência no preview.
- v1 a v4: o dia mais cheio fica com o primeiro do empate (`>` estrito); o dado padrão não empata, e o do Farol vai empatar.

**2026-10-15**, segunda revisão independente, depois da rodada de correção: as quatro aprovadas. Saíram
na correção o vazio sem `role="status"` das quatro, a média zero e as pontas não desenhadas da v1, a
frase sem os dias da v2, o feriado fixo da v3, o `--chart-1` em dois papéis e a janela mal contada da
v4, e de quebra o `notes`, o tracejado e o singular fixo da v1. Nada abaixo reprova:

- v1, Anatomia item 3 deste README: "O `notes` do `meta.json` da `v1` ainda cita o token antigo" ficou velha; o `notes` já diz `--surface-sunken`.
- v1, ACE-1: a frase responde o dia mais cheio e cala a outra metade do caso de uso; a legenda escreve "0 dias úteis sem reunião" e a frase não diz quantos dias úteis ficaram vazios.
- v1, TOK-8: a rampa tem cinco degraus, com `--seq-2` contra `--seq-3` a 1,45:1 no escuro e 1,29:1 no claro; o número em cada célula carrega a leitura, mas falta declarar que a cor não ordena, como a TOK-8 pede.
- v1, comentário de `previousMonthDays` (linha 65): fala do dia que cai na posição `slot`, e a função devolve quantos dias tem o mês anterior.
- v2, ACE-1: a lista sai "nos dias 5, 11, 12, 24, 25", sem o "e" antes do último.
- v3, NUM-6: a frase diz "Pico de 24 no dia 23" sem "agendas".
- v4: os marcos escondidos atrás do +N (Auditoria interna em 10/12; Conselho do ano e Fechamento parcial em 16/12) não aparecem por nome em lugar nenhum, nem na dica nem na frase, e dois são prazo interno, justamente o que o caso de uso pergunta. É o desenho do catálogo; ao colar no Farol, o +N deve abrir a lista do dia.
- v4: a linha de leitura e a frase contam `data.length` como marcos "em dez/26"; um marco de jan/27 no `data`, cujas pontas estão na grade, entraria na conta do mês. O dado padrão não tem nenhum.
- v4, comentário de `marcos` (linha 164): é o do `busiestOf` ("O dia mais cheio de marcos. Null em lista vazia"), e a função só faz a concordância de "marco".

## Pendências conhecidas

- v1, dado: nenhum dia útil termina em zero; o `meta.json` fala em "dia útil em zero" e o `data.ts` não o exercita.
- v1, NUM-6 e legenda: "246 no mês" sem o substantivo, e a legenda sem o teto de cada degrau (só 0 e 17+).
- v2, TIP-3 e NUM-6: cinco números em 700 além do ícone e do anel, e a linha de leitura sem "dias úteis".
- v3, comentário do topo e `notes`: os contrastes do anel de `--chart-1` contra `--seq-1` a `--seq-3` citam o escuro, e o pior tema é o claro.
