# Real contra previsto tracejado

## O que é

Uma série contínua que muda de estilo no ponto em que deixa de ser medida e passa a ser
projeção: trecho sólido até o mês ou a semana de corte, trecho tracejado dali em diante, com o
ponto de junção repetido nas duas chaves para a linha não abrir buraco na virada. É recharts com
dado moldado porque a separação entre medido e projetado, o ponto de junção e, no caso do
cruzamento com um teto, a interpolação, são calculados em TypeScript antes do render.

## Quando usar

* Realizado até hoje continuando em projeção até o fim do mês, do trimestre ou do ano.
* Forecast de fechamentos ou de receita com data de corte explícita e método declarado.
* Cenários conservador, base e otimista partindo do mesmo último ponto medido.
* Pergunta de quando a trajetória cruza uma meta ou um teto de capacidade.

## Quando evitar

* Projeção sem método declarado: mostre só o realizado, em `01_linha-simples`.
* Incerteza em bandas aninhadas por probabilidade: use o leque de `05_areas`.
* Acumulado contra meta anual: use `06_acumulado-contra-meta`, que já traz a projeção tracejada.
* Período corrente só incompleto, sem projeção: basta o trecho parcial tracejado de
  `01_linha-simples`.

## Anatomia

1. **Duas chaves, uma cor.** `real` sólido em `var(--chart-1)` e `projected` tracejado
   (`strokeDasharray="4 4"` ou mais largo nos cenários) na mesma cor: é a mesma métrica mudando
   de estado, não duas séries.
2. **Ponto de junção duplicado.** O mês ou a semana de corte tem valor nas duas chaves, para o
   `Line` não abrir buraco entre o trecho sólido e o tracejado (Vega-Lite, ponto repetido).
3. **Referência do corte.** `ReferenceLine` vertical no mês ou na semana de corte, rótulo curto
   numa margem reservada; quando a pergunta é o cruzamento com um teto, a `ReferenceLine`
   horizontal do teto entra com `ifOverflow="extendDomain"` e a vertical marca a data estimada.
4. **Método declarado.** Nenhuma zona tracejada nasce sem dizer como foi calculada: o texto do
   método fica visível no corpo do gráfico (linha de leitura) e entra na frase acessível da raiz,
   nunca só implícito no traço tracejado.
5. **Dica sem duplicar o corte.** `ChartTooltip` recebe o `payload` filtrado para excluir a chave
   `projected` no ponto de junção, porque as duas chaves valem o mesmo ali e mostrar as duas
   confundiria o valor com o dobro dele.
6. **Eixo de categoria ou eixo numérico.** Até 8 pontos, categoria com `interval={0}`; acima
   disso, `interval` calculado a partir de um `FORCED_TICK_LIMIT` local (EIX-7). Quando a
   anotação cai fora de uma categoria exata, como a semana estimada de um cruzamento, o eixo
   troca para `type="number"` sobre dias corridos, porque uma escala de categoria não sabe
   posicionar um valor que não é uma de suas categorias.
7. **Rótulo direto no fim de cada trecho**, com `formatCurrencyCompact` ou `formatInt` conforme a
   unidade, halo obrigatório (`ROT-7`) onde o rótulo pode cruzar a linha de referência do corte.

## Versões

* [`v1_receita-real-e-projetada`](./v1_receita-real-e-projetada/): receita reconhecida mensal
  real até agosto de 2026 e projetada até dezembro. Demonstra as duas `Line` mudando de sólida
  para tracejada, o ponto de junção duplicado, a `ReferenceLine` vertical do corte e a dica que
  não duplica o valor na virada.
  ([preview escuro](./v1_receita-real-e-projetada/preview.svg) ·
  [preview claro](./v1_receita-real-e-projetada/preview-claro.svg))
* [`v2_forecast-de-fechamentos-com-data-de-corte`](./v2_forecast-de-fechamentos-com-data-de-corte/):
  fechamentos por semana, medidos até 2026-09-14 e projetados até o fim do ano. Demonstra a data
  de corte anotada com `formatDate`, o método do forecast como nota visível e o eixo de contagem
  inteira com `allowDecimals` desligado.
  ([preview escuro](./v2_forecast-de-fechamentos-com-data-de-corte/preview.svg) ·
  [preview claro](./v2_forecast-de-fechamentos-com-data-de-corte/preview-claro.svg))
* [`v3_tres-cenarios-de-receita`](./v3_tres-cenarios-de-receita/): três cenários de receita
  reconhecida partindo do mesmo mês medido de agosto de 2026. Demonstra três tracejados com pesos
  diferentes saindo do mesmo ponto de junção, o cenário base em destaque contra os extremos em
  neutro e a frase acessível relatando a faixa entre o conservador e o otimista.
  ([preview escuro](./v3_tres-cenarios-de-receita/preview.svg) ·
  [preview claro](./v3_tres-cenarios-de-receita/preview-claro.svg))
* [`v4_fila-projetada-cruzando-o-teto`](./v4_fila-projetada-cruzando-o-teto/): fila semanal de
  primeiro contato projetada contra um teto de capacidade. Demonstra o cruzamento calculado por
  interpolação linear em TypeScript sobre um eixo numérico de dias, a semana estimada anotada com
  `formatDate` e o aviso escrito para quando a projeção não cruza o teto no horizonte.
  ([preview escuro](./v4_fila-projetada-cruzando-o-teto/preview.svg) ·
  [preview claro](./v4_fila-projetada-cruzando-o-teto/preview-claro.svg))

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o
   import do dado.
2. Ligue `data` à consulta real: a chave `real` recebe o medido até a data de corte e a chave
   `projected` recebe a saída do modelo de projeção da página, com o ponto de corte duplicado nas
   duas chaves.
3. Passe o texto do método da projeção (`projectionMethod`, `forecastMethod`, `scenarioMethod` ou
   `queueMethod`, conforme a versão) vindo da mesma fonte que calculou a projeção; nunca deixe a
   prop com o texto de amostra do `data.ts` em produção.
4. Dê altura ao pai (`h-64` a `h-80`) e embrulhe em `VisualCard` com `metricId`, cuja etiqueta de
   procedência (PREMISSA) substitui qualquer selo desenhado dentro do Chart.
5. Confira o recorte sem projeção calculada (só medido) e o recorte em que o corte é o próprio
   último ponto do dado, casos em que a chave `projected` fica vazia ou reduzida a um único valor.

## Referências

* [Vega-Lite, Line chart with a dashed part](https://vega.github.io/vega-lite/examples/line_dashed_part.html):
  observar o ponto repetido que costura o sólido e o tracejado.
* [Storytelling with Data, what is a line graph](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph):
  observar previsão e anotação como contexto.
* [Recharts, Line API](https://recharts.github.io/en-US/api/Line/): observar `strokeDasharray`
  no trecho projetado.
* [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary):
  observar o fan chart de projeção como evolução do tracejado.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões passaram sem bloqueante._

* Nas quatro versões o texto do método vive num parágrafo `aria-hidden` com `truncate` e não entra
  na frase acessível, ao contrário do que diz o item 4 da Anatomia; em cartão estreito o método
  encurta na tela e nunca chega a quem usa leitor de tela (TIP-7).
* `v1_receita-real-e-projetada`: os nomes "Real" e "Projetado" só existem na dica; a leitura do
  trecho tracejado depende da convenção sólido contra tracejado somada à linha "hoje" (ROT-3).
* `v2_forecast-de-fechamentos-com-data-de-corte`: o método declarado é a média móvel das 4 semanas
  medidas antes do corte, que valem 13, 10, 12 e 14 e dão 12,25, enquanto a série projetada oscila
  entre 13 e 15; o dado fixo ficaria mais coerente com o texto que o explica.
* `v2_forecast-de-fechamentos-com-data-de-corte`: o `useCase` diz "até 2026-12-31" e a última
  semana do dado é 2026-12-28.
* `v3_tres-cenarios-de-receita`: o rótulo do fim de cada linha vem sem o marcador na cor da série
  que a ROT-3 pede; o nome e o peso já distinguem os três cenários.
* `v3_tres-cenarios-de-receita`: conservador e otimista dividem o mesmo `--line-strong` e só se
  separam pelo desenho do tracejado e pelo nome no rótulo final.
* `v4_fila-projetada-cruzando-o-teto`: o tique de 12/10/2026 não é impresso, porque o Recharts o
  descarta por proximidade do último tique, e o eixo fica com um vão duplo entre 28/09 e 26/10; um
  passo de tique maior devolveria o ritmo.
* `v4_fila-projetada-cruzando-o-teto`: a linha do teto usa `--negative`, e a 17.2 reserva
  `--text-muted` tracejado para referência; o uso se sustenta porque o teto é estado de risco e vem
  com a palavra "teto" escrita, mas é desvio da tabela.
* `v4_fila-projetada-cruzando-o-teto`: o rótulo "teto 50" fica na margem superior, longe da linha
  vermelha que ele nomeia.
