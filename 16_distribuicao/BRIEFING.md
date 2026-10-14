# Briefing de produção: família 16, distribuição

Este arquivo é o índice de produção da família: ele não substitui o estudo de 153 KB, ele diz qual pedaço dele o seu modelo precisa, quais armadilhas mordem um visual de distribuição, que regras e limites do contrato e do `check` a família toca, o que as peças já entregues resolveram e a mecânica do Recharts que o `ARMADILHAS.md` ainda não cobre.
Ordem de leitura: este briefing inteiro; a seção 2 para achar o intervalo de linhas do seu modelo; só esse intervalo do estudo; o seu modelo no `_estudo/catalogo/16_distribuicao.json`; e o `README.md` do modelo, se já existir.
Não leia: as fontes do estudo (1961 a 2045), já consolidadas em `16_distribuicao/README.md`; nem o `CONTRATO.md` inteiro, do qual a seção 4 lista os códigos que a família usa.

Escrito em 2026-09-25, depois das cinco primeiras peças, e corrigido no mesmo dia por quem fechou o modelo 01, que foi a primeira produção a usá-lo. Quem produzir a próxima corrige aqui o que a produção desmentir.

O que a primeira produção mudou: dois erros de numeração na seção 3, que tinham deixado **duas armadilhas de fora**, incluindo uma que precisou ser passada por fora do briefing no meio da tarefa; o alcance por modelo das seis regras da seção 1 que a família aplica mas o histograma não; os limites do `meta.json` e a lista de imports, que antes só existiam no código do `check`; e a seção 8, nova, com a pilha de desenho do Recharts e duas armadilhas que ainda não estão no `ARMADILHAS.md`.

Distribuição responde como os valores se espalham, não quanto deu no total. São 13 modelos e 51 versões planejadas, e por trás deles 36 modelos de estudo, porque cada modelo do catálogo absorve de um a cinco do estudo como versões suas. A stack não tem histograma, box plot, violino nem beeswarm: o padrão é sempre **função pura de agregação em TypeScript, array pronto, componente genérico**, escrito nas linhas 105 a 136 do estudo. **Leitura comum a todo produtor, uma vez: 79 a 136** (as onze regras e a base de implementação) **e 1918 a 1939** (resumo por abordagem e as funções puras da família); opcional, útil para justificar uma recusa, **43 a 78**, as dez conclusões de pesquisa de onde as regras saíram.

---

## 1. As regras do Farol para distribuição

Conferidas contra o estudo, 79 a 105: as onze estão lá, nenhuma deturpada, nenhuma faltando.

1. **`n` sempre visível,** no subtítulo ou no rótulo do grupo ("SDR C · n 48").
2. **Bin declarado, nunca automático:** vem do registry, aparece no eixo, não muda com o filtro.
3. **Grupo pequeno não ganha curva suave:** abaixo de 30 casos, pontos com nota; abaixo de 5, texto.
4. **Curva recortada no observado,** em `[min, max]`, e em zero se a métrica não pode ser negativa.
5. **Box plot nunca sozinho em cartão de decisão:** pontos por cima, ou histograma no cartão irmão.
6. **Outlier tem nome:** ponto além da cerca abre o registro. Sem drill é curiosidade.
7. **Jitter com semente fixa,** derivada do id do registro. Nunca `Math.random()`.
8. **Escala log só quando a cauda manda,** com aviso no eixo; zero e negativo viram nota.
9. **Limiar operacional desenhado,** com rótulo e o percentual do lado errado escrito.
10. **Dado ausente fora do gráfico e dentro do rodapé:** nunca zero nem bin zero.
11. **Cor com um papel só:** grupo ou destaque, nunca os dois.

**Seis que a família aplica e a lista das onze não cobre,** com a origem e **os modelos que ela alcança** ao lado. Confira o alcance antes de gastar leitura: três delas não tocam histograma nenhum.

12. **(todos)** **O eixo de frequência se nomeia** ("oportunidades ganhas"): em painel o leitor lê altura como dinheiro (pesquisa, item 10; feito em `01/v1`).
13. **(05, 01/v3, 08, 09)** **Comparação exige régua comum declarada:** bin, domínio e ordem de desenho fixos entre filtros (catálogo, modelo 05).
14. **(só 08)** **Ridgeline feito de histogramas é proibido:** as faixas são densidades (estudo, 667 a 669).
15. **(02, 06, 07, 09, 13)** **Parâmetro escondido vai escrito:** método de quartil, banda da densidade, escala de largura do violino, `k` do quantile dotplot fixo no produto inteiro.
16. **(só 11)** **Kaplan-Meier: o evento é a decisão,** ganho ou perda; perda como censura infla a chance de ganhar.
17. **(só 12/v4)** **Animação tem versão estática obrigatória,** para exportação e para movimento reduzido.

---

## 2. Índice do estudo, um modelo por linha

Intervalos de `_estudo/familias/16_distribuicao.md`. O número entre parênteses é o modelo do estudo, para conferir o título ao abrir. Antes de qualquer um, as linhas 79 a 136 e 1918 a 1939. As extensões de cada modelo (polígono, caule e folhas, letter-value, faixa de percentis) estão no resumo dele no catálogo, com o número do modelo de estudo.

| # | Modelo | Responde | Abordagem | Canvas v1 a v4 | Linhas do estudo |
|---|---|---|---|---|---|
| 01 | `01_histograma` | A forma de uma medida, e se a média é o típico | recharts-custom | card, card, largo, card | **180 a 242** (1: base, v1, v4); v2 **243 a 285** (2); v3 **490 a 523** (8) |
| 02 | `02_box-plot` | Qual grupo demora mais, em cinco números | recharts-custom | card, card, alto, card | **686 a 765** (13: base, v1, v3); v2 **872 a 923** (16, jitter); v4 **766 a 817** (14, entalhe) |
| 03 | `03_strip-plot-e-beeswarm` | Onde cai cada caso, com os buracos entre eles | recharts-nativo | card, card, largo, faixa | **1109 a 1157** (21: base, v1); v2 **1868 a 1917** (36, wheat); v3 **1158 a 1215** (22, beeswarm); v4 **1216 a 1261** (23, barcode) |
| 04 | `04_ecdf-e-histograma-acumulado` | Que percentual fica abaixo de um limiar | recharts-nativo | card nas quatro | **1359 a 1411** (26: base, v1, v3, v4); v2 **286 a 332** (3, acumulado) |
| 05 | `05_histograma-comparativo` | Dois a quatro grupos na mesma régua | recharts-custom | card nas quatro | **413 a 445** (6: sobrepostos, v1, v4); v2 **446 a 489** (7, pirâmide); v3 **1777 a 1810** (34, empilhado) |
| 06 | `06_densidade-kde` | A forma sem o degrau do bin | recharts-nativo | card, card, alto, card | **560 a 606** (10: base, v1, v4); v2 **607 a 639** (11, sobrepostas); v3 **524 a 559** (9, faixa em cor); para o v4, também 84 a 86 e 1109 a 1157 |
| 07 | `07_violino-e-raincloud` | A forma por grupo, onde o box plot mente | svg-puro | card, largo, card, card | **924 a 980** (17: base); v1 **981 a 1013** (18); v2 **1014 a 1058** (19, raincloud); v3 **1059 a 1108** (20, sina); v4 **1742 a 1776** (33, bean) |
| 08 | `08_ridgeline` | Se a forma muda no tempo, em 6 a 30 grupos | svg-puro | alto, alto, alto, card | **640 a 685** (12: as quatro). Obrigatório também **560 a 606** (10): cada faixa é uma densidade e o KDE está lá |
| 09 | `09_dot-plot-empilhado` | Quantos casos por intervalo, contando unidades | svg-puro | card, card, largo, card | **1262 a 1312** (24: base, v1, v2, v4); v3 **1313 a 1358** (25, quantile dotplot) |
| 10 | `10_curva-de-lorenz` | Quanto do total vem de poucas entidades | recharts-nativo | quadrado, e card no v3 | **1456 a 1509** (28: as quatro) |
| 11 | `11_curva-de-sobrevivencia` | Tempo até o evento com casos ainda abertos | recharts-custom | alto, alto, largo, card | **1619 a 1681** (31: as quatro) |
| 12 | `12_meia-olho-e-desfechos` | A faixa de um cenário simulado | svg-puro | card, card, alto, card | **1682 a 1741** (32: base, v1 a v3); v4 **1811 a 1867** (35, animados); reaproveita o violino, **924 a 980** (17) |
| 13 | `13_q-q-plot` | Se a medida segue a forma de uma referência | recharts-nativo | quadrado nas três | **1412 a 1455** (27: as três) |

**Presets:** `card` 640 x 360, `largo` 960 x 400, `alto` 640 x 560, `quadrado` 480 x 480, `faixa` 960 x 260; no `card` o corpo do Chart recebe cerca de 574 x 234 px.

---

## 3. Armadilhas que mordem esta família

40 das **52** entradas do `ARMADILHAS.md`: 22 na tabela e 18 nas duas linhas depois dela. As 12 de fora são de rosca, pizza, área por ângulo, treemap, sankey, cascata, composição a 100%, pilha por período, rampa divergente e `Brush`. **Atenção à contagem:** o índice do `ARMADILHAS.md` diz "São 50 entradas" e lista 52, e a primeira versão deste briefing herdou o erro; em consequência ela numerava a entrada 52 como 50 e deixava a **50 verdadeira de fora**, que é justamente a que morde toda peça que calcula estatística. Confira sempre o título, nunca só o número. Abaixo, título e momento em que morde; causa e saída ficam no arquivo, buscáveis pelo título. O **•** marca as dezesseis que mordem qualquer peça da família.

| # | Título | Morde quando |
|---|---|---|
| 1 • | A meta desaparece justamente no mês em que ela é passada | SLA, teto e meta de CPL, a regra 9 |
| 2 • | O rótulo do eixo quebra em três linhas e desloca o grupo inteiro | Eixo de minutos, dias ou reais |
| 3 | O eixo de categoria empilha de baixo para cima | Ordenar grupos por mediana |
| 4 • | Rótulo de `ReferenceLine` dentro da área colide com a primeira faixa | "SLA 30 min" sobre a primeira marca |
| 6 • | A dica não consegue dizer duas coisas de formatos diferentes | "42 a 49 dias · 18 oportunidades" |
| 11 | O zero medido não desenha e leva o rótulo embora | Bin de contagem zero é o achado |
| 14 | `Scatter` sobre eixo de categoria abre uma banda por ponto | Strip, beeswarm, sina, outliers |
| 15 | `ZAxis` ausente deixa o raio do ponto variar | Todo `Scatter` daqui |
| 21 • | O passo automático do eixo esconde o limiar | Limiar em 30 com passo de 25 |
| 28 • | Nenhum preset de canvas fecha o cartão depois que ele ganha linhas escritas | A família escreve muito no rodapé |
| 29 • | Texto truncado na célula | Nome do grupo mais `n` no eixo |
| 31 | O halo do rótulo apaga justamente a marca que ele deveria deixar ver | Mediana rotulada sobre caixa ou pontos |
| 36 | Contorno fechado de região vira diagonal cruzando a grade | Violino, densidade, ridgeline, meia-olho |
| 39 • | A marca desaparece contra o cartão, e a tabela do contrato mandava usá-la assim | Faixa neutra, silhueta, bin vazio |
| 43 • | `--line-strong` não se vê como marca, e com opacidade desaparece | Traço de mediana, marca de bin vazio |
| 44 • | `fillOpacity` derruba a marca abaixo do piso no tema claro | Sete versões daqui pedem isso |
| 45 • | Taxa escrita sem o volume | "31% acima do SLA" sem o `n` |
| 46 • | Ausência virando zero | É a regra 10 |
| 47 • | Dado gerado sem semente fixa, ou lido do relógio | É a regra 7 |
| 49 • | O corpo do cartão e a frase acessível dizem o mesmo número de dois jeitos | Toda peça daqui escreve o mesmo número na linha de leitura, no rodapé e na frase da ACE-1 |
| 50 • | A guarda de vazio testa a lista vizinha, e a mediana nasce zero | Mediana, média, quartil, cerca: **qualquer** agregação desta família |
| 52 • | Nome real de produto ou plataforma | `03/v1` trocou fornecedor por tipo de mídia |

**Já resolvidas nas peças em disco, abra a entrada só se for mexer na montagem:** 11 (retângulo de dimensão zero só sobrevive com `shape` declarado, `01/v4`), 19 (duas séries de `Bar` repartem a banda), 20 (`ErrorBar` mede a partir da ponta), 26 (segundo grupo no `shape` do primeiro), 27 (só o `shape` da `ReferenceArea` sabe onde as referências caíram), 13 e 42 (ordem de desenho e fusão de cores em marcas sobrepostas).

**De gatilho estreito, confira pelo índice do `ARMADILHAS.md` se a sua peça as toca:** 5 (`LabelList` sobre bins), 9 (período sem nada, `08/v4`), 10 (`tick` com nome mais `n`), 16 e 17 (painéis, `01/v3` e o `11`), 33 (mais fina que o `maxBarSize`), 34 (rótulo de borda de bin), 35 (largura de texto na anticolisão), 37 (canvas `faixa`, `03/v4`), 38 (pilha nos dois temas, `05/v3`), 40 (rampa sequencial, `06/v3` e `12/v3`) e 48 (ponto percentual).

A **50** merece uma linha a mais, porque ela é a que mais custa nesta família e passou em branco na primeira rodada. Doze de quinze implementações de mediana do acervo devolvem `0` para lista vazia, e a guarda de vazio quase sempre testa uma lista vizinha, não a que alimenta a conta; com amostra vazia a peça então escreve "metade fecha em até 0 dias", isto é, zero medido onde não houve medição. A `01/v1` carrega uma instância dessa classe. **Regra para toda peça nova daqui: agregação devolve `null` no vazio, nunca `0`; a guarda testa a lista que alimenta a conta; e o caso vazio vira `formatUnavailable()`, não linha plantada na origem do eixo.**

As dez perguntas de **Antes de entregar**, no fim do `ARMADILHAS.md`, você responde sempre, contra o PNG que gerou.

---

## 4. Regras do contrato que a família toca

Por código, para consulta pontual no `CONTRATO.md`. As de tipografia ficam na seção 17.1.

**Eixo.** `EIX-1` barra e área do zero. `EIX-4` 3 a 5 linhas de grade, sem decimal em contagem. `EIX-5` eixo calmo. `EIX-6` moeda por `formatCurrencyAxis`, `YAxis width` em constante. `EIX-7` até 8 categorias imprime todas. `EIX-9` **escala comum onde os painéis existem para ser comparados**, a regra que decide os pequenos múltiplos. `EIX-10` lacuna não é zero nem interpolação. `EIX-12` painéis só se alinham com a mesma escala, e `BarChart` usa banda enquanto `LineChart` usa ponto.

**Espaço.** `ESP-1` distâncias em múltiplos de 2 px. `ESP-2` espessura com piso e teto, e quem cede é a altura do canvas, com o desvio declarado; ver a seção 7. `ESP-3` `MARGIN` explícita para rótulo e anotação. `ESP-4` moldura `card` não desenha moldura. `ESP-6` passo derivado por fórmula, com o `barGap` de 4 px contado.

**Cor.** `COR-1` uma série, uma cor. `COR-2` destaque não só por cor. `COR-3` a cor é da categoria, não da posição. `COR-5` vizinhos sem contraste levam vão ou contorno de superfície. `COR-8` slots na ordem 1, 3, 6, 5, 2, 4. `COR-9` tinta só para o dado, `opacity` só em marca.

**Rótulo.** `ROT-1` uma série, sem legenda. `ROT-4` legenda só se o rótulo direto não cabe. `ROT-6` texto sobre marca colorida só no par medido. `ROT-7` halo onde o rótulo cruza linha ou marca, com as exceções da barra curta e da marca fina. `ROT-9` dois textos não dividem a linha sem respiro. `ROT-10` parte de um todo se nomeia no desenho parado, o que alcança o empilhado.

**Anotação.** `ANO-1` duas anotações por visual, no máximo. `ANO-3` `ifOverflow="extendDomain"` em toda referência. `ANO-4` faixa de período com `--surface-sunken`, nunca `--surface-overlay`. `ANO-5` linha de leitura calculada do dado.

**Número, dica, estado.** `NUM-3` sinal à mão com U+2212. `NUM-6` unidade em todo lugar. `DIC-1` dica só quando acrescenta. `DIC-2` dica padrão proibida; ver a seção 7. `DIC-4` sem animação, na ordem visual. `EST-1` `data` vazio substitui o gráfico. `EST-3` zero medido desenha a marca.

**Acessibilidade e versão.** `ACE-1` frase de 100 a 250 caracteres, do dado. `ACE-2` cor nunca é o único canal. `ACE-3` 4,5:1 em texto, 3:1 em marca. `ACE-5` opacidade em marca é perda medida, e os dois temas são conferidos. `ACE-6` traço que carrega a relação mede 3:1. `VER-1` versão planejada que não existe fica declarada no README.

**Guardas do `npm run check` que costumam falar aqui:** `ESPESSURA-MARCA`, `CONTRASTE-TEXTO`, `TAMANHO-TEXTO`, `COLISAO-TEXTO`, `MARCA-REAL`. O `ESPESSURA-MARCA` mede a **marca mais fina desenhada pelo `Bar`**, e nesta família essa marca costuma ser o traço de 2 px da faixa vazia, não a largura da barra: leia o número do aviso antes de atribuí-lo à barra.

**Limites do `meta.json`, que só existiam no código do `check` e ninguém mandava ler.** `title` de 3 a 60 caracteres; `useCase` de 10 a **140**; `demonstrates` de 1 a 6 itens, cada um de 3 a **90**; `canvas` num preset ou `{width, height}` de 200 a 1600, e **canvas por número sem `notes` é erro**; `frame` em `card` ou `stage`; `notes` texto livre. Chave fora dessas seis é recusada, e hífen ou travessão como separador de frase é recusado em qualquer uma delas. Os 90 caracteres de `demonstrates` são o que mais pega: eles contam o texto acentuado inteiro, e uma frase confortável de catálogo passa fácil de 90.

**Imports permitidos no `Chart.tsx`,** e nada além: `react`, `recharts` e `lucide-react` inteiros; de `@/lib/format` os catorze formatadores; `cn` de `@/lib/utils`; `ChartTooltip` e `ChartTooltipProps`; os doze nomes de `chartTheme`; `formatValue`, `formatAxisLabel`, `axisValueFormat` e `ValueFormat` de `@/components/visuals/valueFormat`; e `./data`. O `data.ts` **não importa nada**. Import de efeito colateral, reexport, `require` e import dinâmico são recusados.

---

## 5. O que as peças já entregues resolveram

Regra dura primeiro: **versões não dependem umas das outras** (contrato, seção 6). Reuso aqui é **copiar o corpo da função**, com o comentário que explica o porquê, nunca `import` de pasta irmã. Não existe módulo compartilhado de distribuição. Em disco: o modelo 01 fechado com as quatro versões, e a `v1` dos modelos 02, 03, 04 e 05.

| O que não reinventar | Onde está |
|---|---|
| `bin(values, width, domainMax)`: **mantém a faixa vazia com contagem zero** e apoia a barra no centro do bin | `01_histograma/v1_ciclo-de-fechamento/Chart.tsx:51` |
| `median(values)` | acima, linha 67, e `03_strip-plot-e-beeswarm/v1/Chart.tsx:46` |
| `quantile(sorted, p)` por **interpolação linear**, a convenção declarada da família | `02_box-plot/v1_primeiro-contato-por-sdr/Chart.tsx:76` |
| `summarize(queue, sla)`: cinco números, cercas de 1,5 IQR, outliers e percentual acima do limiar | `02_box-plot/v1/Chart.tsx:86` |
| `renderBox`: **caixa, mediana e bigodes dentro do `shape` do `Bar`**, com traço mínimo se o IQR é zero | `02_box-plot/v1/Chart.tsx:137` |
| `ecdf(values)` com **empates colapsados** num ponto por valor | `04_ecdf-e-histograma-acumulado/v1/Chart.tsx:45` |
| `bin(filled, outline, width, domainMax)`: dois grupos na mesma régua, num array só | `05_histograma-comparativo/v1/Chart.tsx:139` |
| `countAxis(maxCount)`: teto e passo redondos para eixo de contagem | `05_histograma-comparativo/v1/Chart.tsx:126` |
| `renderAnnotation`: o `shape` que sabe em pixel onde cada mediana caiu | `05_histograma-comparativo/v1/Chart.tsx:253` |
| Tique de categoria com nome mais `n`, e `ZAxis` travando o raio do ponto | `03_strip-plot-e-beeswarm/v1/Chart.tsx:111` e `POINT_SIZE` |
| Dica montada à mão, com dois formatos na mesma linha | `01_histograma/v1/Chart.tsx:150` e `05_histograma-comparativo/v1/Chart.tsx:384` |
| Frase da `ACE-1` do dado: tipo, `n`, faixa mais cheia, mediana, média | `01_histograma/v1/Chart.tsx`, constante `summary` |
| `summarize(values)`: mediana, média, p25, p75 e **`null` na amostra vazia**, com a guarda na lista que alimenta a conta | `01_histograma/v2_media-contra-mediana/Chart.tsx` |
| Anotação de duas estatísticas na margem de cima, com âncoras divergentes e colapso em bloco único abaixo de 48 px | `01_histograma/v2/Chart.tsx`, `renderMarks` |
| Grade de pequenos múltiplos com escala comum: `tick={false}` em vez de `hide`, reserva de eixo por número e régua da casa reescalada por volume | `01_histograma/v3_ciclo-por-executivo-em-pequenos-multiplos/Chart.tsx` |
| Os três estados no mesmo desenho: zero medido em coluna neutra, faixa medida sem caso em traço de base, ausência sem marca e só no rodapé | `01_histograma/v4_receita-com-massa-no-zero/Chart.tsx` |
| Coluna truncada com tarja de escala interrompida, número escrito e teto ultrapassado de propósito | `01_histograma/v4/Chart.tsx`, `renderColumn` |
| Eixo que **não é régua contínua**: átomo, vão feito de uma linha do array que não desenha, e faixa aberta no fim | `01_histograma/v4/Chart.tsx`, `buildRows` |
| Nome do eixo Y acima do corpo, não rotacionado na lateral | `01_histograma/v1/Chart.tsx`, o `<span>` antes do `ResponsiveContainer` |

Os `meta.json` e os README são o acabamento a igualar, principalmente a seção "Pendências conhecidas", onde o desvio esperado se declara em vez de ficar calado. O README do modelo 01 é o exemplo de modelo fechado: sete seções fixas, as quatro versões na seção Versões, e a divergência de abordagem escrita na Anatomia.

---

## 6. Formatadores e tokens

**De `@/lib/format`,** os que a família usa: `formatInt` em contagem, `formatDays` e `formatHours` em tempo, `formatDecimal` em média e banda, `formatPercent` na altura da acumulada, `formatCurrencyAxis` no tique de CPL e de ticket, `formatCurrencyCompact` em rótulo direto, `formatUnavailable` no estado indisponível. Os outros sete liberados (`formatCurrency`, `formatPercentPoints`, `formatDate`, `formatMonthShort`, `formatMonthLong`, `formatRateWithVolume`) estão na seção 6 do contrato. Cuidado com `formatPercentPoints`, que imprime o sinal de porcentagem e não a unidade de ponto percentual.

**De `@/components/visuals/charts/chartTheme`,** os que a família usa: `AXIS_PROPS` e `GRID_COLOR` em toda peça de Recharts, `useAnimateOnce` no histograma, `CHART_SEQUENTIAL_COLORS` só na faixa de densidade em cor, e `CURSOR_COLOR` na dica de linha. Os outros liberados (`AXIS_COLOR`, `CHART_SERIES_COLORS`, `seriesColor`, `CHART_ANIMATION_MS`, `FORCED_TICK_LIMIT`, `CATEGORY_TICK_CHARS`, `clampTickLabel`) estão na seção 6 do contrato.

**Tokens que o estudo nomeia:** marca `--chart-1`, destaque `--chart-2`, neutro `--line-strong`, grade `--line-subtle`, texto `--text-muted`, superfície `--surface-raised`, alerta `--danger`. Três medições que mudam a escolha: `--line-strong` como marca dá 1,79:1 no escuro e 1,83:1 no claro; nenhuma das sete categóricas chega a 3:1 contra `--chart-1`, então a separação entre marcas vizinhas vem de revestimento em `--surface-raised`; e `--surface-overlay` no claro é o mesmo branco de `--surface-raised`.

---

## 7. Pegadinhas desta família

Sete conflitos, cada um com os dois lados citados: cinco achados ao mapear e dois medidos na produção do modelo 01. Fora deles, a especificação e o estudo batem.

**1. A abordagem do catálogo é do modelo, e o estudo declara por versão.** Em 10 das 51 versões os dois discordam: `01/v3`, `03/v2`, `03/v3`, `03/v4`, `04/v2`, `05/v1`, `05/v3`, `06/v3`, `07/v3` e `12/v4`; o resumo do modelo 03 admite a tensão. Precedente: `05/v1` seguiu a geometria que a peça exigia, virou `shape` customizado e explicou nas `notes`; `03/v1` ficou nativo. **A abordagem do modelo é guarda-chuva, a versão segue a geometria, e o desvio se escreve na Anatomia do README do modelo.**

**2. A regra 2 da família manda `barCategoryGap={0}` e a `ESP-2` proíbe isso,** exigindo de 30% a 40%. Mas o que separa histograma de barra é a marca encostada, e `01/v1` e `05/v1` usam zero. Resolvido em produção e não no contrato: `01/v1` leva aviso `ESPESSURA-MARCA` com barra de 7 px em 30 faixas e declara nas "Pendências conhecidas" que ali a espessura fina é a forma certa, porque a marca é densidade e não barra de comparação, e que em canvas estreito a saída é bin de 14 dias. **Quem produzir `01/v3` e as outras versões do 05 bate nisso de novo: o aviso é esperado, a declaração é obrigatória.**

**3. Sete versões planejadas prescrevem opacidade na marca, contra a `ACE-5`:** `02/v2` (0,45), `03/v1` (0,45), `03/v4` (0,35), `05/v1` (0,55), `06/v2` (0,25), `07/v4` e `12/v3`. A `ACE-5` mede que `fillOpacity` compõe a cor da marca com a do cartão e derruba o contraste; duas recusas já aconteceram aqui, `02/v1` na caixa opaca do `ErrorBar` e `05/v1` nas duas barras de 0,55, trocadas por barra preenchida contra silhueta em degrau com revestimento. `03/v1` manteve 0,45 de propósito, porque ali a acumulação da pilha é a informação, e pagou com contorno na cor da superfície. **Opacidade é decisão a justificar por medição, não a herdar da spec.** O mesmo vale para `08/v2`, que pede todas as faixas em `--line-strong`, medido como invisível como marca nas armadilhas `TOK-1` e `TOK-5`.

**4. Duas partes do estudo discordam sobre a faixa de densidade em cor.** A regra 11 (linha 103) diz que a escala sequencial de densidade só entra quando a peça é mapa de calor, e aí mora na família 15; o modelo 9 (524 a 559) mantém a peça aqui e só a manda para a 15 quando ela ganha duas dimensões categóricas. O catálogo decidiu pelo modelo 9, e a peça virou `06/v3`. **Quem a produzir lê a ressalva do modelo 9: declarar no rodapé se a cor é densidade dentro do grupo ou contagem absoluta.**

**5. A `DIC-2` manda usar sempre o componente de dica do Farol, e as cinco peças montam a dica à mão.** Não é desvio: a armadilha `REC-6` registra que o componente é fixo em um formatador por dica, a família precisa de dois ("42 a 49 dias · 18 oportunidades"), e a saída sancionada é montar o mesmo desenho à mão, com o mesmo fundo, borda e algarismo tabular, lendo o valor na linha do dado. **Quem "consertar" isso de volta para o componente perde o segundo formato.**

**6. A `ANO-4` manda faixa de período em `--surface-sunken`, e no tema escuro isso lê como buraco.** Medido na produção do `01/v2`: `--surface-sunken` é quase preto contra o cartão escuro, então uma faixa cheia dele não lê como região marcada, lê como um retângulo recortado no gráfico, e uma faixa que afirma "metade dos casos" passa a parecer a região onde não há nada. No tema claro ela fica ótima. A armadilha `TOK-1` oferece duas saídas, `--surface-sunken` **ou** `--line-subtle`, e `--line-subtle` é a que funciona nos dois temas, porque ele fica mais claro que o cartão no escuro e mais escuro no claro. **Faixa de ausência continua em `--surface-sunken`; faixa que afirma presença vai em `--line-subtle`.** Duas consequências medidas no mesmo lugar: o padrão de `fillOpacity` da `ReferenceArea` é **0,5**, então fixe `1` explicitamente ou a ACE-5 é violada sem ninguém escrever nada; e texto sobre essa faixa em `--text-muted` entrega 4,17:1, abaixo do piso de 4,5:1 da ACE-3, enquanto `--text-secondary` entrega 6,52:1 e 6,30:1.

**7. Faixa atrás do dado perde a borda, e o conserto é o rótulo.** Ainda no `01/v2`: pôr a faixa interquartil atrás das barras é certo, e o efeito colateral é que onde as barras são altas elas cobrem a borda da faixa. Com a borda esquerda encoberta, o desenho sozinho sugere que a faixa começa na mediana. **O nome da faixa carrega o intervalo** ("metade dos casos, 35 a 120 dias"), e a leitura deixa de depender de enxergar onde ela começa; é a mesma saída que o `05/v1` usou quando a anotação não nomeava os grupos. O bloco de texto vai no lado da faixa mais distante da linha que a cruza, calculado em pixel a partir do retângulo do próprio `shape`.

---

## 8. Mecânica do Recharts 3.10, medida em produção

Três coisas que a armadilha existente não cobre e que custaram render na produção do modelo 01. As duas últimas ainda não estão no `ARMADILHAS.md`.

**A pilha de desenho é por `zIndex`, e é ela que decide se a anotação cobre o dado.** Os padrões da 3.10: `Bar` **300**, `Line` e `ReferenceLine` **400**, `Area` e `ReferenceArea` **100**. Consequências diretas para esta família: uma `ReferenceArea` desenha **atrás** das barras, então a faixa interquartil atrás do histograma sai de graça, mas a anotação de mediana e média feita pelo `shape` de uma `ReferenceArea` sai atrás das barras também, e some onde a distribuição é mais densa; para trazê-la para a frente, `zIndex` acima de 300. E a régua de comparação em `Line` nasce **na frente** da barra, o que obriga a revestimento; passando `zIndex={200}` ela vai para trás e o revestimento deixa de ser necessário. A armadilha `REC-27` resolve a geometria do `shape`, não a camada dele.

**`ReferenceArea` com só `x1` e `x2` não devolve o retângulo em pixel ao `shape`.** O `shape` recebe `x`, `y`, `width` e `height` indefinidos, toda coordenada derivada vira `NaN` e **nada é desenhado, sem erro e sem aviso**: na produção do `01/v3` um painel inteiro saiu em branco e o `check` passou. Declare as quatro, `x1`, `x2`, `y1` e `y2`.

**Eixo em corpo curto descarta tique em silêncio, e leva a grade junto.** Em painel de cerca de 65 px de altura o `YAxis` imprimiu dois dos quatro tiques declarados em `ticks`, e como o `CartesianGrid` nasce dos tiques do eixo, sumiram duas das quatro linhas de grade, com pares diferentes em painéis diferentes. O mesmo acontece no `XAxis` de um cartão estreito. A saída é `interval={0}` junto de `ticks` explícito, e conferir no PNG que o número de linhas de grade é o que a EIX-4 pede.

