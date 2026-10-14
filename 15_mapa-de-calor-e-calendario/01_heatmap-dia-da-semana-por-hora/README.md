# Heatmap dia da semana por hora

## O que é

Uma grade de 7 linhas, uma por dia da semana na ordem da operação (segunda a domingo), por até 24
colunas de hora. A cor de cada célula codifica o volume ou a taxa medida naquela janela: quanto
mais intensa a cor na escala sequencial, maior o número. Lê se onde está o pico de um evento
recorrente e se ele cai dentro ou fora da janela em que a equipe está disponível.

## Quando usar

- Janela de pico de um evento recorrente: entradas de lead, respostas, agendas marcadas, tickets
  de atendimento.
- Cruzar a janela de demanda com a janela de disponibilidade da equipe (almoço, turno, expediente).
- Recorte com eventos suficientes por célula: pelo menos 4 semanas e algumas centenas de eventos
  no total.
- Pequenos múltiplos por pessoa ou fila, até 8 grades com escala comum.

## Quando evitar

- Poucos eventos por célula: a grade vira mancha aleatória; agregar em blocos de 2 horas ou usar
  colunas por dia.
- Pergunta de tendência ao longo das semanas: uma linha semanal lê melhor.
- Volume e taxa ao mesmo tempo na mesma célula: um punch card separa os dois canais.
- Uma série só por hora, sem dia da semana: uma coluna por hora já resolve, sem a segunda
  dimensão.
- Comparação precisa entre dias: a forma radial engana; manter sempre a grade cartesiana.

## Anatomia

1. **Eixo de dias**, à esquerda, texto `--text-secondary` de 12 px, na ordem da operação (segunda
   a domingo), nome por extenso sem abreviação.
2. **Eixo de horas**, no topo, texto `--text-muted` de 11 px por `formatHours`, com rótulo a cada
   2 horas para não lotar a régua.
3. **Célula**, retângulo com `rx` de 2, preenchido por uma faixa da rampa sequencial
   (`CHART_SEQUENTIAL_COLORS`), com vão de 1 a 1,5 px na cor do cartão entre elas. O número de
   faixas depende de haver ou não espaço para escrever o valor dentro da célula: com espaço, 5
   faixas de `--seq-1` a `--seq-3` e `--seq-6` a `--seq-7`; sem espaço, 3 faixas de `--seq-5` a
   `--seq-7`, que são as únicas que passam de 3:1 contra o cartão nos dois temas (TOK-8).
4. **Valor em toda célula**, quando a célula aguenta o texto, para a cor nunca ser o único canal
   (ACE-2). O texto é `--text-primary` nas faixas baixas e `--accent-cyan-contrast` nas duas
   altas. As faixas do meio, `--seq-4` e `--seq-5`, ficam fora de toda escala com texto por dentro,
   porque medido nos dois temas nenhum dos dois textos passa de 4,5:1 contra elas ao mesmo tempo.
5. **Legenda de escala**, com as cores em sequência e o **intervalo de cada faixa escrito**, porque
   degrau contra degrau a rampa mede de 1,23:1 a 1,52:1 e a cor sozinha não ordena (TOK-8).
6. **Estados de célula**, três, com canais diferentes: hora medida recebe a faixa e o valor; zero
   medido recebe o poço `--surface-sunken` com contorno sólido e o zero escrito; hora sem medição
   recebe contorno tracejado em `--text-muted`, sem preenchimento e sem número. Quando a amostra
   existe e é pequena demais para sustentar intensidade, a célula sai hachurada.
7. **Linha de leitura**, uma frase de 12 px acima da grade com a janela de pico e a parcela dela no
   total, calculada do dado, com o volume junto da taxa (`formatRateWithVolume`).

## Versões

- `v1_entradas-de-lead-por-dia-e-hora`: entradas de lead por dia e hora, média por ocorrência do
  dia nas últimas 12 semanas, das 8h às 20h, com a escala sequencial de 5 faixas, valor escrito em
  toda célula e a legenda de extremos. Preview:
  [preview.svg](v1_entradas-de-lead-por-dia-e-hora/preview.svg) e
  [preview-claro.svg](v1_entradas-de-lead-por-dia-e-hora/preview-claro.svg).
- `v2_pico-contra-janela-do-sdr`: a mesma grade de 7 por 13, com o contorno da janela de pico
  calculado sobre a soma de 3 horas seguidas, a faixa de almoço da pré-vendas em `--surface-sunken`
  com o próprio texto dentro, e os três estados de célula separados por três canais. O contorno
  corre num canal de 6 px aberto fora das células, porque nenhum token alcança 3:1 contra o cartão e
  contra a marca ao mesmo tempo (TOK-10). Preview:
  [preview.svg](v2_pico-contra-janela-do-sdr/preview.svg) e
  [preview-claro.svg](v2_pico-contra-janela-do-sdr/preview-claro.svg).
- `v3_agendas-por-sdr-em-pequenos-multiplos`: oito grades de 5 dias por 12 horas com domínio comum,
  sábado e domingo fora da grade, célula com menos de 5 agendas hachurada em vez de pintada, nome
  por extenso e total do trimestre em cada painel. Escala de 3 faixas nomeadas, porque com 480
  células não há onde escrever valor. Preview:
  [preview.svg](v3_agendas-por-sdr-em-pequenos-multiplos/preview.svg) e
  [preview-claro.svg](v3_agendas-por-sdr-em-pequenos-multiplos/preview-claro.svg).
- `v4_relogio-radial-de-24-horas`: sete anéis de 24 setores anulares em path de dois arcos, 0h no
  topo e sentido horário, segunda no centro e domingo na borda, com a lista de picos por dia ao lado
  e a nota de que o anel de fora parece mais intenso com o mesmo valor (GEO-5). Preview:
  [preview.svg](v4_relogio-radial-de-24-horas/preview.svg) e
  [preview-claro.svg](v4_relogio-radial-de-24-horas/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a página de destino; troque `LeadHourCell`,
   `WeekDay`, `DAY_LABELS`, `DAY_ORDER` e `HOURS` pelo import real do seletor da página quando o
   dado deixar de ser fictício.
2. O componente já calcula o pico e o dia de menor volume a partir do `data` recebido: basta
   passar as linhas reais pela prop, sem recalcular nada fora dele.
3. Dê altura ao contêiner pai (o corpo do `VisualCard`) e mantenha a largura livre: a grade
   escala pelo `viewBox` e não empurra a coluna.
4. Se o recorte real cair fora de 8h às 20h ou incluir sábado e domingo com regra própria, ajuste
   `HOURS` e a leitura de "fora do expediente" antes de ligar o dado, porque esta versão assume a
   janela fixa das 8 às 20h em todos os 7 dias.
5. `byKey.get(...) ?? 0` pinta como `0,0` toda combinação de dia e hora que falte no `data`
   recebido: com buraco real na medição (hora sem evento no recorte), a célula sai igual à de uma
   hora com valor zero de verdade. Se o dado real puder ter buraco, filtre `HOURS` para as horas
   com medição antes de ligar, ou trate a ausência antes de chamar o componente. Mantenha também
   uma largura mínima para o cartão: o número de 11 px encolhe junto com o `viewBox` em cartão
   estreito e fica abaixo do piso legível antes da grade quebrar linha.

## Referências

- Catálogo: [Highcharts, exemplos de heat map](https://www.highcharts.com/blog/tutorials/heat-map-examples-using-highcharts/): observar "vendas por funcionário por dia útil" e o heatmap grande de dia por hora com milhares de células.
- Praticante: [Stephen Few, Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar o caso de acessos por hora do dia e por que a linha horizontal lê melhor que o relógio.
- Catálogo: [Data Viz Catalogue, heatmap](https://datavizcatalogue.com/methods/heatmap.html): observar a exigência de legenda e o uso de intervalos de tempo em linha ou coluna.
- Portal de design: [Behance, monitoramento de dados com heatmaps e radares](https://www.behance.net/gallery/221169407/Data-Monitoring-Merchant-Heatmaps-Radars): projeto de painel de monitoramento que transforma atividade em heatmaps; observar a combinação de grade de calor com alertas (só metadados em texto verificados).

## Observações desta leva (não bloqueantes)

- As quatro versões estão no disco, então a seção de versões planejadas saiu: não há mais versão do
  catálogo sem `Chart.tsx`.
- **Defeito da v1 que as novas versões não repetem, e a regra que vence.** A v1 escreve
  `byKey.get(...) ?? 0` em `Chart.tsx:159` e pinta como `0,0` toda combinação de dia e hora que falte
  no `data` recebido. Isso desenha ausência como zero, o que a **EST-2** proíbe ("Nunca zero, nunca
  barra zerada") e a **DAD-2** do `ARMADILHAS.md` registra como o defeito mais redescoberto do
  acervo, em 38 modelos. A v1 também tem, em `Chart.tsx:99`, um `rowValues.length === 0 ? 0 : média`,
  que é a **EST-1b** ao contrário: função de agregação devolve `null` no vazio, nunca `0`. As v2, v3
  e v4 tipam o valor da célula como `number | null` e separam três estados com três canais: faixa da
  rampa com o valor escrito, poço com contorno sólido e o zero escrito, contorno tracejado sem
  número. O `check` pega um dos dois casos e não pega o outro, o que vale registrar: o ternário da
  linha 99 sai como **aviso** da guarda `AGREGACAO-ZERO`, porque ali o zero vira limite de desenho e
  não número lido na tela; o `?? 0` da linha 159 sai **calado**, porque está sobre um `Map.get` e a
  guarda deixa esse caso passar de propósito. O que reprova os dois é a regra, não a guarda.
- **Quantos níveis de cor este modelo afirma, medido.** Dois, não cinco nem sete. Contra
  `--surface-raised`, a rampa inteira mede 1,14 / 1,58 / 2,29 / 3,38 / 4,89 / 6,96 / 10,12 no escuro
  e 1,21 / 1,49 / 1,92 / 2,60 / 3,72 / 5,45 / 8,29 no claro, então só `--seq-5`, `--seq-6` e
  `--seq-7` passam de 3:1 nos dois temas; e entre si eles medem 1,42:1, 1,45:1 e 2,07:1, os três
  abaixo de 3:1. Na escala de 5 faixas da v1 e da v2 a medição dos vizinhos é 1,38 / 1,45 / 3,03 /
  1,45 no escuro e 1,23 / 1,29 / 2,84 / 1,52 no claro: **um único par de vizinhos passa de 3:1**, o
  que quer dizer que a escala de cinco degraus entrega dois níveis distinguíveis. Por isso toda
  versão desta leva carrega a ordem fora da cor: número escrito na célula (v2), intervalo escrito em
  cada amostra da legenda (v2, v3, v4), total escrito em cada painel (v3) e lista de picos ao lado
  (v4).
- **A saída da TOK-8 esbarra na matriz de texto, e isso é contradição entre duas regras.** A `TOK-8`
  manda usar `--seq-5`, `6` e `7` quando há até três faixas; a matriz de pares medidos diz que
  `--seq-5` **não aceita texto nenhum** (o melhor par mede 3,72:1 no claro, abaixo dos 4,5:1 da
  `ACE-3`). As duas juntas proíbem escrever o valor dentro da célula da faixa mais baixa. Por isso a
  v2 mantém a escala de 5 faixas, que tem texto legível em todas elas, e só a v3 e a v4, em que não
  cabe texto nenhum, adotam a escala de 3 faixas da `TOK-8`.
- **Contorno de janela de pico não tem cor possível dentro da grade** (medido nesta leva):
  `--chart-1` mede 9,50:1 no escuro e 6,00:1 no claro contra o cartão, e 1,36:1 e 1,10:1 contra
  `--seq-6`, 1,07:1 e 1,38:1 contra `--seq-7`. É a `TOK-10`. A v2 resolve pela segunda saída da
  entrada, a de quebrar a guia: o contorno corre num canal de 6 px aberto de propósito nas bordas da
  janela, onde o fundo é sempre o do cartão.
- **A faixa de almoço e o poço de zero usam `--surface-sunken`, que mede 1,15:1 contra o cartão nos
  dois temas.** Não existe neutro melhor no Farol (`--line-subtle` 1,25 e 1,29, `--line-strong` 1,79
  e 1,83, `--surface-overlay` 1,10 e 1,00), e a `ANO-4` endossa este token para faixa. As duas formas
  levam contorno em `--text-muted`, que mede 5,21:1 e 5,37:1, e texto escrito por dentro, então a
  isenção da `ACE-3` vale e a forma se vê pela borda.
- **As três versões novas declaram o `viewBox` no tamanho exato do corpo do cartão**, para escala 1.
  A v1 escala o `viewBox` e por isso as guardas `COLISAO-TEXTO` e `CONTRASTE-TEXTO` saíram com
  `preview_com_escala`, ou seja passaram no portão sem medir nada. Com a escala em 1 as duas passaram
  a medir as três versões novas, e a `CONTRASTE-MARCA` foi de 1 para 4 versões medidas no modelo.
- **A v4 usa faixas por terço da amostra, e a troca veio de olhar o PNG.** Com faixas de largura
  igual sobre o intervalo, quatro de cada cinco setores do relógio caíam na primeira faixa e o
  desenho ficava liso: a madrugada lia igual ao meio da manhã. Por terço das horas medidas as três
  faixas ficam com 53, 52 e 58 setores e o ciclo aparece. O critério não é adivinhável, então está
  escrito ao lado da legenda, junto com o intervalo de cada faixa.
- **Dois números de acabamento medidos nesta leva, para quem copiar o modelo.** "Segunda" mede 50 px
  em Manrope de 12 px e 41,5 px em 11 px, então a coluna de dias precisa de 62 px com recuo de 8 na
  v2 e de 50 px na v3; e texto ancorado em `x=0` sai com a tinta 2,5 px à esquerda da âncora, o que
  o render acusa como conteúdo fora do corpo. As três versões usam `TEXT_LEFT = 4`.

## Observações da revisão (não bloqueantes)

- `v1_entradas-de-lead-por-dia-e-hora`: a Anatomia, item 6, promete linha de leitura com o pico, o
  dia de menor volume e a média geral; na tela ela traz só o pico e a média geral, e o dia de menor
  volume aparece apenas na frase acessível. Alinhar o texto da Anatomia ou a linha.
- `v1_entradas-de-lead-por-dia-e-hora`: a Anatomia, item 4, diz que o texto troca de cor "a partir
  da faixa mais clara"; na prática ele troca nas duas faixas mais altas (índices 3 e 4 de
  `TEXT_COLORS`). Redação, não comportamento.
- `v1_entradas-de-lead-por-dia-e-hora`: o catálogo pede 6 faixas e vão de 1 px, e a versão entrega
  5 faixas e vão de 1,5 px. O desvio está declarado em `meta.json` e confere na medição
  independente desta revisão: o melhor caso de `--seq-4` é 4,29:1 com `--text-primary` no escuro e
  2,60:1 com `--accent-cyan-contrast` no claro, os dois abaixo de 4,5:1. Desvio aceito, registrado.
- `v1_entradas-de-lead-por-dia-e-hora`: as guardas `COLISAO-TEXTO` e `CONTRASTE-TEXTO` do
  `npm run check` não mediram esta versão, com o motivo `preview_com_escala`. O contraste foi
  conferido à mão nos dois temas e passa com folga; o par mais apertado é
  `--accent-cyan-contrast` sobre `--seq-6` no tema claro, com 5,45:1.
- `v1_entradas-de-lead-por-dia-e-hora`: `byKey.get(...) ?? 0` pinta célula ausente como `0,0`. Com
  o dado fixo não existe ausência e o desenho não mente, e o item 5 de "Como colar no Farol" já
  avisa quem for ligar dado real com buraco de hora. Fica registrado porque a armadilha é invisível
  no PNG: só aparece quando o `data` recebido tem menos de 91 células.
- `v1_entradas-de-lead-por-dia-e-hora`: a reprovação anterior por NUM-6 está resolvida. A linha de
  leitura agora escreve "6,3 leads por ocorrência do dia" e repete a unidade na média geral, e o
  eixo de horas sai por `formatHours` com o "h". Conferido nos dois PNGs de 2026-09-20.
- `v1_entradas-de-lead-por-dia-e-hora`: o número dentro da célula sai sem unidade, que mora na
  legenda logo abaixo da grade e na linha de leitura logo acima. É a saída certa para uma matriz de
  91 células, mas quem recortar a grade para um slide precisa levar a legenda junto.
- `v1_entradas-de-lead-por-dia-e-hora`: duas constantes de acabamento fora da régua, sem
  consequência no desenho. O valor da célula sai em 11 px, e a 17.1 pede 12 px para rótulo direto
  de valor (com a escala de 1,07 do `viewBox` a tinta fica em 11,8 px, acima do piso da TIP-2); e o
  vão de 1,5 px não é múltiplo de 2 px da ESP-1, embora seja exatamente o mínimo que a COR-5 pede.
- `v1_entradas-de-lead-por-dia-e-hora`: a primeira amostra da legenda, em `--seq-1`, mede 1,14:1
  contra o cartão no tema escuro e quase some. A isenção vale porque os extremos da faixa trazem
  `0,0` e `6,3` escritos ao lado, e a rampa lê pelo conjunto; ainda assim, um contorno em
  `--line-subtle` na faixa inteira daria a borda que falta.
