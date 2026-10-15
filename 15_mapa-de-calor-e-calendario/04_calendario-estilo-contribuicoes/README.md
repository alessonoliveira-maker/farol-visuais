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
3. **Células de 11 px (v1) ou 12 px** com vão de 3 px na cor do cartão, que é o que corta o efeito de vizinhança
   (a mesma cor parece mais clara cercada de tons escuros).
4. **Zero medido em `--surface-sunken`**, fora da rampa: dia sem fechamento é resultado, não
   ausência de dado, e não pode se confundir com a primeira faixa de cor. O poço serve porque se vê
   nos dois temas; `--surface-overlay` mede 1,00:1 contra o cartão no claro e a célula de zero
   deixaria de existir (`TOK-1`). Na v1 o zero leva também um traço curto em `--text-muted`, porque no
   claro o neutro sozinho mede 1,05:1 contra o primeiro degrau (`TOK-8`); o feriado não é zero e vai
   pontilhado, fora da conta de dia útil (`HOLIDAYS` em `data.ts`).
5. **Contorno em degrau por mês**, em `--line-strong`, calculado do primeiro dia de cada mês (é o
   traçado do calendário do D3, uma linha aberta; fechar a região traria uma diagonal cruzando a
   grade, que é a `GEO-9`).
6. **Contorno de destaque nos dias de máximo**, todos quando há empate, com a contagem e o valor escritos no painel.
7. **Legenda** com as classes e o intervalo de cada uma (v1: 1, 2 a 3 e 4 ou mais) e a contagem de dias úteis sem nenhum fechamento.
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

- `v1_fechamentos-por-dia-em-2026`: 257 dias de 2026 até a data de referência, em três classes
  (1, 2 a 3 e 4 ou mais) só em `--seq-5` a `--seq-7`, zero em traço, feriado pontilhado fora da conta,
  contorno de mês em degrau, todos os dias de máximo contornados e a contagem de dias úteis em branco.
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
5. O canvas `faixa` comporta as 38 semanas da v1 com célula de 11 px e vão de 3 px. Para as 53 semanas do ano
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

## Observações da revisão (não bloqueantes)

**2026-10-15**, revisão independente das quatro versões: v2, v3 e v4 aprovadas, v1 reprovada (parecer
em `validation/revisao_15_mapa-de-calor-e-calendario__04_calendario-estilo-contribuicoes_2026-10-15.md`).
Nada abaixo reprova; quem tocar o arquivo alinha.

- v1, ESP-5: o painel de números é separado do calendário por `border-l border-line-subtle`; grupo se separa por espaço, não por divisória.
- v1, ROT-4: "contorno: melhor dia do ano", "o degrau separa os meses" e "tracejado: fim da medição" vão na legenda só como palavra, sem amostra na forma da marca.
- v1, `meta.json`: o segundo item de `demonstrates` diz que o degrau sai "do último dia de cada mês", e o código e este README dizem primeiro dia; o `notes` fala em 37 semanas e o desenho tem 38 colunas.
- v1, NUM-6: a frase acessível escreve "com 5" sem o substantivo; ao refazer o pico (bloqueante 3 do parecer), escrever "5 fechamentos".
- v1, v2 e v3, ESP-1: o vão entre células é de 3 px, fora do múltiplo de 2; sem consequência visível no preview.
- v2, NUM-5: o total do ano e a parte de dezembro somam só os dias carregados, e "receita no ano" não diz isso. Imputar a média dos dias com valor nos 2 dias de falha de cada ano levaria 2024 de R$ 11,7 mi para R$ 11,8 mi e 2025 de R$ 13,6 mi para R$ 13,7 mi; escrever "soma dos dias carregados" ou "sem 2 dias" junto do total.
- v2, NUM-1: "15,2% do ano" é composição e vai inteiro; 15%, 16% e 17% continuam distintos.
- v2, ACE-1: a frase acessível fala só de 2025; a resposta do caso de uso, dezembro com 15,2%, 15,9% e 16,8% do ano nos três anos, não está nela.
- v2, catálogo: a entrada pede 2024, 2025 e 2026, e a versão usa 2023 a 2025, os três anos fechados (dezembro de 2026 ainda não existe na data de referência). A troca é certa, mas o `notes` não a declara.
- v2, v3 e v4, seção 5: as posições x da legenda são números soltos no JSX (v2: 28, 85, 380, 624, 750; v3: 56, 200, 318, 412, 517, 694; v4: 50, 228, 338, 430, 496). Com o dado padrão nada colide; rótulo mais longo colidiria. Constante nomeada no topo ou posição acumulada pela largura do texto.
- README, Quando evitar: "Valor contínuo com faixa larga, como receita por dia" contradiz a v2 e o "Quando usar" do catálogo, que cita receita reconhecida por dia; e a Anatomia, item 3, fixa célula de 12 px com vão de 3 px, que só a v1 usa.
- v3: setembro (parcial) e outubro a dezembro (futuros) escrevem `formatUnavailable()`, palavra de dado perdido; "mês em curso" e "ainda não medido" seriam exatas, no espírito da EST-4.
- v3, ANO-5: a linha de leitura dá 41,9% sem a base; os 5 últimos dias úteis são cerca de 23% dos dias úteis de um mês de 2026, e é contra essa parte que 41,9% se lê como acúmulo.
- v3: o contorno da janela vai até o último dia do mês e abraça o fim de semana final (jan, mai, ago), enquanto a legenda diz "últimos 5 dias úteis"; como esse fim de semana está sombreado e em zero, não engana.
- v4, ACE-1: a frase começa por "6 grades de calendário"; começar pelo tipo, "Grades de calendário de 6 pessoas".
- v4: agosto de 2026 tem 5 segundas e 4 sextas, então a parte na segunda nasce com base maior que a parte na sexta; a linha de leitura põe 53,6% e 42,3% lado a lado sem dizer que não se comparam entre si.

**2026-10-15**, segunda revisão da v1, depois da rodada única de correção: aprovada. Os cinco bloqueantes do
parecer estão resolvidos; das observações anteriores da v1, a divisória do painel, o "37 semanas", o
"último dia de cada mês" e o "com 5" sem substantivo também saíram. Nada abaixo reprova.

- v1, README, Anatomia: o item 4 justifica o traço do zero com "1,05:1 contra o primeiro degrau", medida do antigo `--seq-1` (contra o `--seq-5` de hoje o poço mede 3,22:1 no claro); o item 8 ainda diz que a v1 desenha o zero só em `--surface-sunken`, e o código desenha o traço; o parágrafo da rampa cita só a v3 com três faixas; "Quando evitar" fala em célula de 12 px.
- v1, README, Como colar, passo 3: diz que `LAST_DAY` corta o ano, mas o `Chart.tsx` não lê `LAST_DAY`; o corte sai do comprimento de `data`. Ou o Chart passa a ler a constante, ou o passo diz que é o tamanho do array.
- v1: `FIRST_DAY` e `HOLIDAYS` vêm do módulo `data.ts`, não de prop; a página que passar outro ano em `data` desenha com o início e os feriados de 2026. Ao colar, levar os dois para props.
- v1: o contorno do dia de máximo sai 2,75 px para fora da célula, e o `viewBox` termina rente à última coluna (563) e à linha de domingo (113); um máximo na semana corrente ou num domingo teria um lado cortado pelo `overflow` do `<svg>`. Com o dado padrão nenhum máximo cai ali, sem consequência no preview; reservar 3 px à direita e embaixo.
- v1, ROT-4: "tracejado: fim em 14/09/2026" segue só como palavra, sem amostra na forma da marca; as amostras de máximo e de feriado já estão na forma certa.
- v1, seção 5: `TOP_H - 6`, `LEFT_W - 8`, o contorno `CELL + 4` com recuo de 2, `rx` 2 e 3 e o traço do zero de 5 por 1,5 são números soltos no JSX; nomear no topo.
- v1, fila de dívida: a TAMANHO-TEXTO mede a v1 e não acusa nada, mas a chave `TAMANHO-TEXTO` continua em `_render/scripts/lib/divida-guardas.json` (linhas 254 a 256) e o `check` avisa; quem consertou tira a chave.
