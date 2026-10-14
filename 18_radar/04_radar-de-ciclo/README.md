# Radar de ciclo

## O que é

Um polígono sobre eixos que são posições de um ciclo, 24 horas, 7 dias ou 12 meses, com o início no topo e o sentido horário (`startAngle` 90 e `endAngle` −270). A distância do centro é o valor, o centro é o zero, a grade é circular e só os quartos do ciclo levam rótulo, porque o relógio dispensa o nome de cada hora. É o único caso em que o radar se justifica: o fim do ciclo volta ao começo, e a madrugada fica ligada à noite, o que uma linha ou uma coluna cortam no meio. O valor exato mora na linha de leitura e na dica, e a ausência vira ausência: mês que não existe é `null`, sem ponta falsa até o centro.

## Quando usar

- Série naturalmente cíclica de 7 a 24 posições em que a mensagem é a continuidade: entradas por hora, atividade por dia da semana.
- Dois regimes do mesmo ciclo, como dia útil contra fim de semana, com o foco preenchido e o outro em contorno, sempre em média por unidade de tempo quando as bases têm tamanhos diferentes.
- Janela que importa para a operação marcada no próprio relógio, como o expediente da pré-vendas.
- Ano corrente em 12 meses com os meses futuros declarados como ausentes.

## Quando evitar

- Comparação fina de valores entre horas: colunas por hora (`03_colunas-verticais/01`) ou linha (`04`).
- Leitura de dia e hora juntos: heatmap de dia da semana por hora (`15`).
- Ciclo que não fecha, como 30 dias corridos: linha (`04`).
- Volume por setor com apelo visual e área proporcional: rosa de Nightingale (`07/07`) ou coluna radial (`07/06`).
- Começar o ciclo fora do topo ou girar no sentido anti-horário: manter `startAngle` 90 e `endAngle` −270.

## Anatomia

1. **Grade** (`PolarGrid`) circular em `--line-subtle`, sem raios (`radialLines` desligado) nas versões de 24 eixos, com `zIndex` 150 acima da área. Cada hora ganha um tique curto em `--line-strong` na borda do anel, e o dos quartos é mais longo.
2. **Eixo do ciclo** (`PolarAngleAxis`) com `tick` próprio: a hora em `font-display` e `formatInt` só nos quartos (0h, 6h, 12h e 18h). Na v4 os 12 meses levam nome e valor, e o mês sem dado leva `a medir` em `--text-muted` e um raio pontilhado.
3. **Escala** (`PolarRadiusAxis`) com `domain` de 0 ao primeiro nível redondo acima do pico, calculado no componente (`niceScale`, de 3 a 5 anéis). Os números ficam no vão onde o polígono chega menos longe, e só nos níveis acima dele.
4. **Série** (`Radar`) em `--chart-1` com preenchimento de 0,66 (v1, v2), o mínimo da ACE-5 para o tema claro sobre o cartão; na v3 sobe a 0,72, porque sobre o setor do expediente (`--surface-sunken`) o 0,66 media 2,76:1 e o 0,72 dá cerca de 3,07:1. O segundo regime da v2 é contorno em `--chart-3`, com `zIndex` 250 para subir acima da área, sobre um revestimento de 5,5 px em `--surface-raised` (zIndex 200) e com o contorno do dia útil repintado em 225, para o par medir 6,47:1 e 6,18:1 contra o revestimento. A v3 e a v4 desenham a série por `shape` próprio: a hora ou o mês sem dado não tem vértice no centro, leva raio pontilhado em `--text-muted` e palavra; a escala nunca mora em vão vizinho de ausente (v3 e v4) e, na v4, só em vão perto do topo ou da base.
5. **Marcas de exceção**: ponto maior no pico (v1), anotação do fim de semana com linha de chamada e o nome do regime (v2), ponto vazado no zero medido (v3), ponto vazado e trecho `4 4` no mês parcial e raio pontilhado nos meses ausentes (v4).
6. **Setor do expediente** (v3): um `path` dentro de `ZIndexLayer` com `zIndex` −200, em `--surface-sunken`, desenhado pelo tique do primeiro eixo, que é quem recebe o centro e o raio. O polar não tem `ReferenceArea`.
7. **Linha de leitura e legenda**: frase de 12 px calculada do dado, com a unidade (`formatDecimal`, `formatPercent`, `formatDate`); a v2 traz amostra de área e de linha, e a v3, a amostra do setor.
8. **Dica** própria com `formatRateWithVolume` (v3), as duas médias com o total e os dias (v2) e o mês nulo dito por escrito (v4, com `filterNull` desligado).

## Versões

- `v1_entradas-de-lead-por-hora-do-dia`: 24 eixos com 0h no topo, escala redonda calculada, pico marcado e a parcela fora do expediente na linha de leitura.
- `v2_dia-util-contra-fim-de-semana`: dia útil preenchido e fim de semana em contorno, médias por hora de bases diferentes, anotação da hora em que o fim de semana passa o dia útil.
- `v3_resposta-fora-do-sla-com-expediente`: setor do expediente sob a grade e a série, taxa fora do SLA com o volume na dica, zero medido vazado no centro.
- `v4_doze-meses-com-ano-parcial`: oito meses fechados, um parcial tracejado e três ausentes sem ponta falsa, com janeiro e dezembro vizinhos no topo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão e troque o `data.ts` pelo dado do registry. A ordem dos eixos é a do ciclo e não muda entre telas.
2. Na v1 e na v2 o dado traz o total do período e a base (dias do mês, dias úteis, dias de fim de semana): a média é calculada no componente. Passe a base junto, senão a média por hora não fecha.
3. Embrulhe num `VisualCard`; o título, a procedência e o aviso de protótipo são do cartão. Na v4 a `asOf` vem da data de corte do dado, e o estado do mês (`closed`, `partial`, `absent`) vem do registry.
4. O estado vazio inline vira `EmptyState` ou `UnavailableState`, mantendo o sentido do texto.
5. O `PolarRadiusAxis` entrega o número da escala com `transform` de rotação pelo ângulo do eixo; o `tick` próprio descarta o giro e usa só `x` e `y`, porque texto girado é proibido.
6. O `Tooltip` do Recharts filtra o valor nulo antes de chamar o `content`; só o `filterNull={false}` da v4 deixa a dica abrir no mês ausente.

## Referências

- Recharts, [`RadarChart`](https://recharts.github.io/en-US/api/RadarChart/), [`Radar`](https://recharts.github.io/en-US/api/Radar/), [`PolarGrid`](https://recharts.github.io/en-US/api/PolarGrid/) e [`PolarAngleAxis`](https://recharts.github.io/en-US/api/PolarAngleAxis/). No pacote 3.10.1 o `Customized` está marcado como obsoleto e o `ZIndexLayer` (`recharts/es6/zIndex/ZIndexLayer.js`) é o caminho para desenhar uma camada abaixo da grade; vale uma sonda para o dossiê.
- Stephen Few, [Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): o radar só se aceita quando o eixo é um ciclo.
- Estudo da família: `_estudo/familias/18_radar.md`. No Farol, `app/src/components/visuals/charts/chartTheme.ts`.

## Observações da revisão (não bloqueantes)

2026-10-13, revisão das quatro versões: `v1` aprovada; `v2`, `v3` e `v4` reprovadas, com parecer em `validation/revisao_18_radar__04_radar-de-ciclo_2026-10-13.md`. O estado vazio das quatro não foi renderizado e a dica não foi sondada em navegador: o que se diz deles aqui é leitura do código.

- `v1`, `v2` e `v4`: a linha de leitura ocupa duas linhas no canvas `quadrado`, e a ANO-5 pede uma. Sem corte nem colisão no preview.
- `v1` a `v4`: os números da linha de leitura estão em Manrope sem `tabular-nums`; na `v2` também os da anotação (`font-sans`) e na `v3` os da legenda do setor (TIP-1). Sem consequência no preview.
- `v1` a `v4`: a dica é desenhada à mão em vez de usar `ChartTooltip` (DIC-2); copia fundo, borda e classes do componente do Farol, como a saída da REC-6 admite.
- `v1`, `v2` e `v4`: os números da escala saem sem unidade (2 a 10, 20 a 80); quem nomeia a medida é a linha de leitura (NUM-6).
- `v1` a `v4`: o segundo estado, com o ícone `Unplug`, atende dois casos diferentes: recorte sem base de cálculo, que é indisponível, e recorte com tudo zero, que é zero medido e, na `v3`, um bom resultado (EST-3). Ramo que o dado padrão não exercita.
- `v1`: o segundo período da frase acessível não tem verbo ("O pico às 14h, com 9,2 entradas por hora"). O expediente das 8h às 18h é constante do Chart, e na `v3` vem do `data.ts`.
- `v2`: a anotação diz "Fim de semana começa às 21h", e o que o componente calcula é a primeira hora em que a média do fim de semana passa a do dia útil, que é o que a frase acessível e o `meta.json` dizem. O "4,1 por hora" sai sem o substantivo (NUM-6) e em `--text-secondary`, não no `--text-muted` da ANO-2.
- `v2`: a linha de chamada da anotação tem a cor da série e corre no sentido do raio, do vértice das 21h até fora do anel. Num radar o raio é o valor; um traço neutro (`--text-muted`) afasta a leitura de ponta.
- `v2`: se a hora da virada cair num quarto do ciclo (0h, 6h, 12h ou 18h), a anotação nasce na mesma faixa do rótulo da hora. Ramo que o dado padrão não exercita.
- `v3`: a escala em percentual é a taxa da hora (estouros sobre respostas daquela hora) e o 71% da linha de leitura (276 de 391, com a hora 3 sem resposta no dado) é a parcela dos estouros do mês. São duas bases na mesma tela, e o eixo não diz a dele.
- `v3`: o volume da taxa só aparece na dica e na frase acessível, como o catálogo pede. A madrugada tem de 7 a 38 respostas por hora no mês contra 164 a 285 no expediente, e o desenho dá à madrugada a maior área (DAD-1). A maior taxa com o volume cabe na linha de leitura.
- `v3`: o ponto vazado do centro cobre 5 px de raio, e as taxas do expediente ficam entre 9 e 12 px do centro: metade do miolo some sob a marca do zero.
- `v4`: o nome curto e o nome por extenso do mês vêm escritos no `data.ts` (`label`, `name`), não de `formatMonthShort` nem de `formatMonthLong` (NUM-7). Sem consequência no preview.

2026-10-13, segunda revisão, de `v2`, `v3` e `v4` sobre o arquivo de depois da rodada de correção: as três aprovadas, sem bloqueante nas 32 perguntas. Medido nos pixels dos dois PNGs: na `v2` o contorno do fim de semana dá 6,47:1 e 6,18:1 contra o revestimento, e o revestimento, 4,88:1 e 3,00:1 contra o preenchimento; na `v3` o preenchimento dá 3,12:1 sobre o setor e 3,42:1 sobre o cartão no claro; na `v4` os três raios pontilhados saem inteiros e nenhum número da escala toca neles. As observações do parágrafo de cima continuam valendo onde o código não mudou. O estado vazio e a dica seguem sem render: o que se diz deles é leitura do código.

- `v3`: hora medida isolada entre duas horas sem resposta não desenha nada. O `renderShape` faz dela uma fatia de um ponto só, sem área; o contorno só liga duas vizinhas medidas; e o `renderDot` só marca o pico e o zero. Um ponto na hora de trecho unitário resolve, como a `v4` já faz em todo mês medido. Ramo que o dado padrão não exercita, e o primeiro a conferir antes de colar com dado real de madrugada.
- `v3`: só o 60% da escala é escrito, porque o vão das 4h às 5h fica a 22,5° da horizontal e o corte `HORIZONTAL_SIN` de 0,5 esconde os níveis de dentro. Os números de 20% e 40% ficariam a 14,6 px um do outro, e as taxas da noite (38% a 41%) moram em cima do anel de 40%, que fica sem número.
- `v3`: o ponto vazado do zero medido fica no centro, que é de todos os eixos. A legenda diz "Zero medido" sem a hora, e a frase acessível nomeia a hora sem resposta (3h) mas não a do zero (4h).
- `v3`: o ponto cheio do pico, às 0h, não tem nome nem valor no corpo; a maior taxa com o volume (55,3%, 21 de 38) só existe na frase acessível e na dica.
- `v3`: a frase acessível mede 236 caracteres com uma hora sem resposta e ganha 4 ou 5 por hora a mais na lista; com quatro ou cinco horas ausentes passa do teto de 250 da ACE-1. O `check` já avisa.
- `v3`: no tema claro a grade sobre o setor do expediente mede 1,12:1 (`--line-subtle` sobre `--surface-sunken`) e quase some; no escuro, 1,43:1. É referência, não dado.
- `v4`: o 80 da escala fica a 13,4 px do 38 de fevereiro e 4,9 px abaixo dele (GEO-15). Lê como escala pela cor, pelo peso e pelo 60 logo abaixo, e o `check` não acusa.
- `v4`: redação da linha de leitura em ramos que o dado padrão não exercita. Ano fechado, sem parcial nem ausente, termina em dois pontos finais; sem parcial e com ausente sai "com 61., 3 meses a medir"; e um único mês ausente sai "1 meses a medir" e, na frase acessível, "1 ausentes".
- `v4`: sem nenhum vão medido perto do topo ou da base (o `VERTICAL_SIN` de 0,9 só aceita jan a fev, jun a jul, jul a ago e dez a jan), a escala some inteira. Os valores continuam escritos em cada mês.
- `v2`: o preenchimento a 0,66 mede 3,00:1 nos pixels do tema claro, (94, 159, 169) sobre branco. Está em cima do piso da ACE-5, sem folga para mudança de token.
- `v2`, `v3` e `v4`: a linha de leitura abre repetindo o começo do título do cartão ("Agendas realizadas por mês", "Primeiras respostas fora do SLA"), o que a ANO-5 pede para evitar. É ela que nomeia a medida, já que a escala da `v2` e da `v4` não leva unidade.
