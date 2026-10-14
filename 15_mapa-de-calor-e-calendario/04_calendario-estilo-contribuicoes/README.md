# Calendário estilo contribuições

## O que é

O ano inteiro numa faixa: cada coluna é uma semana, cada linha é um dia da semana, e cada célula é um
dia pintado pelo valor. É o desenho que responde **quando**, não quanto. Sazonalidade, concentração de
fim de mês, feriado, fim de semana e dia útil que passou em branco aparecem todos na mesma olhada,
porque o calendário preserva a estrutura da semana que uma série temporal achata.

## Quando usar

- Mostrar ritmo de trabalho ao longo de um ano: fechamentos, entradas de lead, atividades, publicações.
- Achar padrão de calendário que a série mensal esconde: efeito de fim de mês, segunda-feira fraca,
  semana de feriado.
- Expor ausência de evento como informação: o dia útil sem nenhum fechamento é o que o gráfico de
  linha some.
- Comparar dois ou três anos empilhados na mesma escala.

## Quando evitar

- Menos de uns três meses de dado: a grade fica com poucas colunas e uma coluna por dia lê melhor.
- Valor contínuo com faixa larga, como receita por dia: o olho não ordena 5 tons com precisão; use
  linha ou barra e deixe o calendário para contagem.
- Leitura de valor exato célula a célula: a célula tem 12 px e não cabe número.
- Público que precisa do número do dia do mês na tela: aí é o calendário mensal em grade (modelo 05).

## Anatomia

1. **Rótulos de mês** no topo, alinhados à coluna em que o mês começa.
2. **Rótulos de dia da semana** à esquerda, alternados, para não competir com a grade.
3. **Células de 12 px** com vão de 3 px na cor do cartão, que é o que corta o efeito de vizinhança
   (a mesma cor parece mais clara cercada de tons escuros).
4. **Zero medido em `--surface-sunken`**, fora da rampa: dia sem fechamento é resultado, não
   ausência de dado, e não pode se confundir com a primeira faixa de cor. O poço serve porque se vê
   nos dois temas; `--surface-overlay` mede 1,00:1 contra o cartão no claro e a célula de zero
   deixaria de existir (`TOK-1`).
5. **Contorno em degrau por mês**, em `--line-strong`, calculado do primeiro dia de cada mês (é o
   traçado do calendário do D3, uma linha aberta; fechar a região traria uma diagonal cruzando a
   grade, que é a `GEO-9`).
6. **Contorno de destaque no melhor dia**, com a data e o valor escritos na legenda.
7. **Legenda** com as faixas numeradas e a contagem de dias úteis sem nenhum fechamento.
8. **Marcas que não são valor, e nenhuma delas é zero**: falha de carga vai hachurada (v2), férias
   vão vazadas e feriado vai pontilhado (v4), sempre em `--text-muted`, que mede 5,21:1 no escuro e
   5,37:1 no claro. Zero medido é `--surface-sunken` nas versões de contagem por dia (v1, v2) e traço
   curto em `--text-muted` nas versões em que a célula já disputa contorno (v3, v4).
9. **Janela de fim de mês** (v3): contorno em `--text-primary` sobre os últimos cinco dias úteis de
   cada linha, com a parte do mês escrita por `formatRateWithVolume` ao lado.

**A rampa é a lacuna conhecida do modelo, e cada versão declara a saída que escolheu.** Dos sete
degraus de `--seq-*`, só `--seq-5`, `--seq-6` e `--seq-7` medem acima de 3:1 contra o cartão nos dois
temas; `--seq-4` mede 3,38:1 no escuro e 2,60:1 no claro, e os três primeiros nem opacos passam. É a
`TOK-8`, registrada para esta família. Quem precisa de três faixas usa só os degraus que passam (v3).
Quem precisa de quatro dá ao degrau mais baixo uma segunda pista: contorno em `--text-muted` (v2) ou
quadrado menor dentro da célula (v4, onde o contorno já é de férias e feriado). Em todas, quem carrega
a ordem de verdade é a régua escrita da legenda e o valor agregado ao lado do desenho, não o tom.

## Versões

- `v1_fechamentos-por-dia-em-2026`: 257 dias de 2026 até a data de referência, com zero medido em
  neutro, contorno de mês em degrau, destaque no melhor dia e a contagem de dias úteis em branco.
- `v2_tres-anos-de-receita-reconhecida`: 2023, 2024 e 2025 empilhados com a rampa calculada sobre o
  conjunto, total do ano e total de dezembro escritos ao lado de cada faixa, e seis dias de falha de
  carga hachurados, que é o que separa ausência de dado de zero medido.
- `v3_efeito-de-fim-de-mes-por-dia-do-mes`: a mesma medida virada em matriz de 12 meses por 31 dias,
  com máscara de validade de data, janela dos últimos cinco dias úteis contornada em cada linha e a
  parte do mês que cai nela escrita com o volume ao lado.
- `v4_grade-micro-por-sdr-com-ferias`: seis grades pequenas de agosto, uma por pessoa, em escala comum
  de quatro faixas, com férias vazadas, feriado pontilhado e zero medido em traço.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/YearCalendar/`.
2. O `data` é um array simples, uma posição por dia entre `FIRST_DAY` e `LAST_DAY`, sem buraco. O
   seletor da página precisa preencher o dia sem evento com zero: um array curto desloca o calendário
   inteiro a partir do buraco.
3. `LAST_DAY` é a data de referência do recorte, nunca `Date.now()`, e é o que corta o ano.
4. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
5. O canvas `faixa` comporta cerca de 37 semanas com célula de 12 px. Para as 53 semanas do ano
   inteiro, ou o cartão ocupa a largura toda da página, ou a célula desce para 10 px com vão de 2 px.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [Nivo, calendar](https://nivo.rocks/calendar/): observar o tratamento de dia sem dado e a variante vertical para tela estreita.
- Catálogo: [ECharts, calendar heatmap](https://echarts.apache.org/examples/en/index.html#chart-type-calendar): observar o calendário vertical e o empilhamento de vários anos.
- Praticante: [D3, calendar view](https://observablehq.com/@d3/calendar): observar o traçado em degrau que separa os meses, que é a geometria reaproveitada aqui.

## Correção de 2026-09-28

**v1, o recorte do período só existia na frase acessível (DAD-9).** O dado ia de 2026-01-01 a
2026-09-14 e o ano não tinha acabado, mas quem enxergava não sabia: o título dizia "em 2026", o
número em destaque dizia "374 fechamentos no ano" e o rodapé não falava de período em curso, então o
vazio à direita do calendário lia como outubro, novembro e dezembro sem nenhum fechamento. A frase
do `aria-label` estava certa porque é calculada do dado; o texto escrito à mão é que tinha ficado com
a redação do ano inteiro.

O que mudou, sempre com a data saindo do próprio dado e nunca de constante escrita: uma borda em
degrau tracejada fecha a medição no último dia medido, no mesmo traçado dos separadores de mês; a
legenda nomeia essa borda; o número em destaque escreve "fechamentos até 14/09/2026"; e o título
deixou de citar o ano fechado, virando "Fechamentos por dia no ano em curso". O `stepPath` que
desenha o degrau saiu de dentro do cálculo dos meses e virou função pura do arquivo, usada pelos dois.

A coluna do lado direito foi de `w-40` para `w-44` e a linha nova do rodapé ficou curta de propósito:
com o texto mais longo, o rótulo do número quebrava em duas linhas, o rodapé ia para duas, e o
conjunto passava 13 px da área do corpo, o que o render acusa.
