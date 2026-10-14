# Corrida de barras

## O que é

Barras horizontais ordenadas que trocam de posição ao longo do tempo, animadas, com o período
corrente escrito grande no canto. É peça de narrativa para abrir uma apresentação ou uma reunião,
não peça de análise: o leitor não retém a trajetória, só a sensação de movimento e o quadro final.
O Recharts não tem esse modo de desenho; a peça é SVG puro em React, com a posição vertical de cada
categoria vindo do índice no ranking do período corrente e a posição e a largura da marca animadas
por transição CSS quando o quadro muda. A chave do React em cada linha é sempre a categoria, nunca
o índice: se a chave fosse o índice, o React reciclaria o nó ao trocar de posição e a barra saltaria
de identidade no meio da animação em vez de deslizar. Por padrão o componente monta parado no último
período do dado, que é também o quadro estático que o `preview.svg` retrata, porque o render deste
catálogo é determinístico; o botão de reprodução refaz a corrida inteira desde o primeiro período.

## Quando usar

- Abertura de reunião ou de apresentação em que o ranking ao longo do tempo é a própria história.
- Top 10 entre um número maior de entidades, de 12 a cerca de 36 períodos.
- Quando o quadro final estático, parado no período mais recente, sustenta o resto da apresentação
  mesmo para quem não viu a animação rodar.

## Quando evitar

- Análise ou decisão: o leitor não retém a trajetória; use bump ou slope da família `04_linhas`.
- Leitura de valor exato num período: barras simples ordenadas do período (`01_barras-simples-ordenadas`).
- Poucas entidades que quase não trocam de posição: pequenos múltiplos de linha (`04_linhas`) mostram
  a tendência de cada uma sem depender do movimento para comunicar.
- Painel de uso diário, ao lado de outros cards: o movimento contínuo compete pela atenção com o
  resto da tela e nenhuma leitura fica mais rápida por isso.

## Anatomia

1. Cabeçalho com o botão de reprodução (`Play`/`Pause` do `lucide-react`, `aria-hidden`) à esquerda
   e o período corrente à direita, em `kpi-number text-3xl` (Space Grotesk 600), igual ao papel de
   "Número de KPI" da tabela 17.1: é o único número da peça que não passa por formatador de contagem
   ou moeda porque é uma etiqueta de tempo, calculada por `formatMonthShort`.
2. Corpo em SVG puro, medido pelo `ResizeObserver` do próprio contêiner (nunca por `window`), com um
   `<g>` por categoria. A posição vertical de cada `<g>` é `rank * rowStep`, animada por
   `transition: transform` em torno de `CHART_ANIMATION_MS`; a largura da marca anima por
   `transition: width` no mesmo tempo.
3. Rótulo de posição (`1º`, `2º`...) e nome da categoria à esquerda, sempre por `formatInt` mesmo
   sendo um índice de 1 dígito, porque nenhum número de tela foge do formatador (seção 8 do
   CONTRATO). Nome sem reticência: a largura reservada ao rótulo (`NAME_WIDTH`) cobre o nome mais
   longo do próprio `data.ts` (`TIP-7`).
4. Marca em `rect` com `rx={3}`, cor `--chart-1` para quem lidera o quadro corrente e `--line-strong`
   para as demais, nunca por índice de array: a cor de destaque segue a categoria líder de cada
   quadro, então uma barra pode ganhar e perder a cor de destaque ao longo da corrida (`COR-1`).
5. Valor na ponta livre da marca, num `<g>` que translada junto da largura da barra, sempre por
   `formatInt` ou `formatCurrencyCompact` conforme a unidade da versão; nunca eixo de valor nem
   grade, porque o valor já está escrito em toda linha (`ROT-2`).
6. Domínio numérico recalculado a cada quadro como `1,08 ×` o maior valor do período corrente, para
   sobrar respiro à direita da barra mais longa sem que o eixo pareça cortado.
7. Estado de fronteira: recorte sem nenhum período troca o corpo inteiro por um bloco `role="status"`
   com o ícone `Filter` e o texto dizendo que não há corrida para desenhar (`EST-1`).
8. Frase acessível (`aria-label` na raiz, `role="group"`) calculada do dado: quantas categorias,
   intervalo de períodos, período em que o quadro está parado, quem lidera e o segundo colocado; o
   corpo em SVG leva `aria-hidden` porque a leitura útil já está na frase.
9. `prefers-reduced-motion` desliga o botão de reprodução: quem pediu menos movimento recebe só o
   quadro final estático, nunca a corrida rodando sozinha.

## Versões

- `v1_origens-mes-a-mes`: top 10 origens de lead mês a mês em 24 meses. Demonstra a posição por
  índice de ranking animada por `transform`, a chave do React pela categoria, o período corrente em
  destaque no canto, o botão de pausa com `prefers-reduced-motion` e o domínio do eixo acompanhando
  o maior valor de cada quadro.
- `v2_receita-acumulada-com-marcos`: receita acumulada de quatro linhas de negócio em 8 trimestres,
  para abrir uma reunião de diretoria. Demonstra marcos fixos no tempo que seguram o quadro por mais
  tempo e mostram um texto curto, o aviso de que o deslizamento entre trimestres é a animação
  interpolando (não uma medição nova), e o quadro final estático com o marco do último trimestre.
- `v3_entrada-e-saida-do-top-10`: 12 campanhas das quais só 10 cabem no topo a cada mês, com uma
  delas sem coleta em dois meses seguidos. Demonstra a entrada e a saída do topo 10 por transição de
  opacidade (sem a barra piscar), o mês sem coleta congelando o último valor conhecido com textura
  listrada em vez de interpolar como zero, e o desempate estável por nome para a ordem não oscilar
  à toa entre quadros.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta de visual da página, por exemplo
   `app/src/pages/marketing/visuals/CorridaDeOrigens/`.
2. Troque o `import` do `./data` pelo seletor real da página: um item por período, na mesma ordem
   cronológica que o componente espera, sem reordenar.
3. O `data` default do catálogo é só a amostra; ligue a prop `data` com a série real e mantenha o
   `height` ou dê altura ao pai (`<div className="h-72">` para o canvas `largo`).
4. Se a página tiver mais de um top N possível (10, 15, 20), exponha isso como prop nova em vez de
   mudar `TOP_LIMIT` no arquivo copiado, documentando o default.
5. Confirme que a página tem algum controle de acessibilidade equivalente ao botão de pausa: o Farol
   não deve montar a corrida já rodando sozinha ao entrar na tela.
6. Rode `npm run typecheck` e `npm run lint` no `app/` e confira nos dois temas e a 390 px de largura,
   com o botão de reprodução parado e rodando.

## Referências

- [ECharts, bar racing](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/bar-race/):
  `realtimeSort`, `yAxis.inverse`, os cerca de 300 ms de reordenação e `xAxis.max: 'dataMax'` são a
  especificação de comportamento replicada aqui em SVG puro.
- [Highcharts, bar race demo](https://www.highcharts.com/demo/bar-race/sand-signika): o controle de
  reprodução e o relógio de período como parte da própria peça, não como acessório externo.
- [Built In, why some experts hate bar chart races](https://builtin.com/data-science/bar-chart-races):
  a crítica de sobrecarga sem guia para o olho e a defesa do formato para conjuntos com muitas
  entidades, as duas posições que justificam restringir o modelo a abertura de apresentação.
- [Big Think, bar chart races: short on analysis, but fun to watch](https://bigthink.com/strange-maps/bar-chart-races/):
  o enquadramento como peça de entretenimento, base do "Quando evitar" acima.
- [Flourish, bar chart race](https://flourish.studio/visualisations/bar-chart-race/): os controles
  padrão que o público já espera de uma corrida de barras (linha do tempo, velocidade, top N).
- Vizinhança: para ranking ao longo do tempo em peça estática e analisável, ver o bump e o slope da
  família `04_linhas`.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Nenhum destes itens reprova a versão._

- `v1_origens-mes-a-mes`: a linha do líder leva três elementos em peso 700 (posição, nome e valor), e a TIP-4 pede no máximo dois; o peso no nome e no valor já resolveria o destaque.
- `v1_origens-mes-a-mes`: o caso de uso fala em 24 meses e o `data.ts` traz 24 períodos, mas o texto do card não diz que o quadro parado é o último mês; isso só aparece no `notes` do `meta.json`.
- `v1_origens-mes-a-mes`: o comentário do topo do `data.ts` diz "jan a dez em dois anos fiscais", e a série vai de set/24 a ago/26; o comentário é que está desatualizado, o dado está certo.
- `v1_origens-mes-a-mes`: os identificadores `meta_ads`, `google_ads` e `linkedin_ads` do `data.ts` carregam nome de plataforma real, embora nenhum deles chegue à tela, porque os rótulos foram genericizados; um `social_ads`, `search_ads`, `b2b_ads` fecharia a questão.
- `v1_origens-mes-a-mes`: o máximo do eixo é recalculado a cada quadro, então o comprimento da barra não é comparável entre meses; o valor escrito em cada marca compensa, e o comportamento é o que o catálogo pede.
- `v2_receita-acumulada-com-marcos`: o marco e o aviso de interpolação ficam num bloco `aria-hidden`, então o ponto narrativo da versão não chega ao leitor de tela; a frase acessível poderia carregar o marco do quadro corrente.
- `v2_receita-acumulada-com-marcos`: nos quatro primeiros trimestres a Consultoria Patrimonial vale `R$ 0` porque a vertical ainda não existia; é zero verdadeiro, não ausência, mas só o marco de mar/25 explica isso, e ele chega depois.
- `v2_receita-acumulada-com-marcos`: o período corrente sai por `formatMonthShort` do mês de fechamento (`dez/25`), o que pode ser lido como um mês isolado em vez do trimestre inteiro.
- `v3_entrada-e-saida-do-top-10`: o rótulo "Topo 10" é ancorado em `x = size.width`, encostando na borda direita do corpo (ESP-3); um recuo de alguns pixels resolveria.
- `v3_entrada-e-saida-do-top-10`: o quadro final não tem nenhuma campanha sem coleta, então a textura listrada, que é o que a versão demonstra, não aparece no preview do catálogo.
- `v3_entrada-e-saida-do-top-10`: a frase acessível cresce quando há campanha sem coleta, porque enumera cada uma pelo nome; com duas ou mais ela passa dos 250 caracteres da ACE-1, e um "duas campanhas sem coleta" resolveria.
- `v3_entrada-e-saida-do-top-10`: quando uma campanha sem coleta nunca teve valor anterior, o `rankFrame` devolve zero; a série do catálogo não chega nesse caso, mas dado real chegaria, e ali o congelamento viraria a ausência em zero.
- Anatomia, item 3: o texto promete rótulo de posição em `1º`, `2º`, e as três versões imprimem `1`, `2` por `formatInt`; vale alinhar o README ao que o código desenha.
