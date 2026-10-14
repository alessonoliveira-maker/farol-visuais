# Box plot

## O que é

Cinco números por grupo: primeiro quartil, mediana e terceiro quartil formam a caixa, os bigodes vão
até o último valor dentro das cercas de 1,5 vez o intervalo interquartil, e o que passa delas vira
ponto. É o resumo mais compacto da família e também o mais mal lido: em oficinas com público de
negócio, tipicamente menos de um em cada cinco participantes já sabia ler um.

Por isso, no Farol, ele nunca vai sozinho num cartão de decisão. Ou vem com os pontos por cima, ou
vem ao lado do histograma da mesma métrica, e sempre com a frase de leitura no rodapé.

## Quando usar

- Resumir de 4 a 20 grupos da mesma métrica em pouco espaço: minutos até o contato por fila, dias
  parados por etapa.
- Público que já lê quartil, ou peça acompanhada da nota "caixa: metade central dos casos".
- Grupos com pelo menos umas 20 observações; com os pontos por cima, até algumas centenas por grupo.
- Comparar medianas e tamanho de amostra ao mesmo tempo, com entalhe e largura proporcional à raiz
  de n (é a v4 deste modelo).

## Quando evitar

- Distribuição bimodal ou com buraco: a caixa apaga os picos. Violino ou raincloud (modelo 07) ou
  strip (03).
- Grupo com menos de 5 casos: só os pontos e o n em texto, sem caixa.
- Milhares de casos por grupo com cauda importante: letter-value, derivado deste modelo, ou
  densidade (06).
- Só o resumo importa e não há forma por trás: comparação de pontos na família 17, modelo 02.
- Faixa de percentis desenhada ao longo do tempo: faixa em área na família 05, modelo 05.

## Anatomia

1. **Eixo de categoria com nome e `n`** na mesma linha, ordenado pela mediana e nunca por ordem
   alfabética.
2. **Caixa do q1 ao q3**, opaca, com borda fina. Opaca porque é ela que cobre o trecho do bigode que
   atravessaria por dentro.
3. **Traço de mediana** mais forte que a borda, com piso de 2 px de largura para o caso de intervalo
   interquartil zero.
4. **Bigodes com tampa**, até o último valor dentro da cerca, e não até o mínimo e o máximo
   absolutos quando há outlier.
5. **Outliers como pontos nomeados**, cada um com o código do registro, que é o que abre o drill.
6. **Limiar operacional desenhado**, com o rótulo fora da área de plotagem, e o percentual do lado
   errado escrito no rodapé.
7. **Método de quartil declarado** no rodapé.
8. **Entalhe**, só na `v4`: polígono de dez vértices com a cintura na mediana, amplitude de 1,58 vez o
   intervalo interquartil sobre a raiz de `n`. Cortado nos quartis e tracejado quando não cabe.
9. **Largura variável**, só na `v4`: a espessura da caixa sai da raiz da amostra contra o maior `n`
   observado, com piso de 12 px da ESP-2, e a régua vai na legenda com o `n` dos dois extremos.
10. **Marcador de borda**, só na `v3`: caso além do teto do eixo desenhado como seta na borda, com o
   código e o valor escritos, em `--negative`, e o rótulo deslocado da linha do bigode.

**Emenda de 2026-09-28, e ela corrige o item 2 acima.** O item 2 manda a caixa ser opaca "porque é ela
que cobre o trecho do bigode que atravessaria por dentro", e isso resolve o sintoma pelo lado errado. As
`v2`, `v3` e `v4` desenham o bigode em **dois trechos**, de `whiskerLow` a `q1` e de `q3` a
`whiskerHigh`, então não existe trecho a cobrir e a caixa pode ser vazada. A diferença não é de gosto:
a caixa opaca da `v1` é preenchida com `--line-subtle`, que mede **1,25:1 no tema escuro e 1,29:1 no
claro** contra o cartão, e a guarda `CONTRASTE-MARCA` avisa por isso em 68 versões do acervo. Caixa
vazada com contorno em `--chart-1` mede 9,50:1 e 6,00:1 e não precisa de isenção nenhuma.

## Versões

- `v1_primeiro-contato-por-sdr`: seis filas de pré-vendas, 297 leads, minutos até o primeiro contato
  humano. As medianas vão de 7 a 33 minutos, 29,3% dos leads passam do SLA de 30 minutos, 19 ficam
  além da cerca e 24 ainda não tinham contato no momento da extração, contados fora da amostra.
- `v2_pontos-sobre-a-caixa-e-prazo`: as mesmas seis filas medidas em horas até a agenda, 150 leads,
  com a caixa vazada e **todos** os pontos por cima, com jitter determinístico por hash do código do
  lead. Uma das filas é bimodal de propósito: treze leads entre 3 e 9 horas, treze entre 62 e 96, e
  os cinco números desenham uma caixa larga com a mediana no meio do vazio. É a versão que mostra
  por que este modelo não vai sozinho num cartão de decisão.
- `v3_dias-parados-por-etapa`: oito etapas do funil em ordem de funil, 1.900 oportunidades abertas,
  dias parados na etapa atual. O gargalo é Aprovação interna, com mediana de 46 dias contra 6 na
  Triagem. Dois casos passam do teto de 180 dias e viram marcador na borda com o código e o valor
  escritos, em vez de esticar o eixo; os pontos além da cerca devolvem o código da oportunidade para
  o drill de quem colar a peça.
- `v4_entalhe-largura-e-grupo-minusculo`: seis tipos de mídia, 146 campanhas, CPL qualificado. A
  largura de cada caixa vem da raiz da amostra contra o maior n observado, e o entalhe de 1,58 vez o
  interquartil sobre a raiz de n responde se duas medianas diferem de fato. Um grupo de nove
  campanhas tem entalhe maior que a própria caixa, então ele é cortado nos quartis e tracejado; o de
  quatro campanhas não ganha caixa, só os quatro pontos e o n escrito.


## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/FirstContactBoxPlot/`.
2. O `data` é uma observação por registro, não os cinco números prontos. Isso não é capricho: o
   método de quartil muda a caixa em amostra pequena, e quem recebe o resumo pronto não sabe mais
   qual convenção o produziu. A função `quantile` aqui é interpolação linear, e o rodapé diz isso.
3. O código do registro nasce no `data.ts`. Outlier sem nome é curiosidade; com nome é fila de
   trabalho, e o ponto é o gancho natural do drill.
4. `withoutContact` conta quem não tem a medida. Não vire zero: tratar lead sem contato como zero
   minuto puxa toda mediana para baixo e premia justamente a fila mais abandonada.
5. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
7. Nas `v2` e `v4` a nuvem de pontos e o `n` de cada grupo vivem num componente filho que usa
   `usePlotArea`, `useXAxisScale` e `useYAxisScale`. Isso não é preciosismo: a amplitude do jitter e a
   posição do ponto dependem da largura da banda, que só existe depois que o Recharts resolve o
   painel. Constante no lugar dela encosta a nuvem de um grupo na do vizinho, e só aparece no PNG.
8. Na `v3`, passe `onOutlierSelect` para receber o código da oportunidade clicada e abrir o drill.
   Sem a prop os pontos não ficam com cursor de clique, então a peça não promete o que não faz.
9. A `v4` traz o estado vazio da EST-1 pronto: `data` sem nenhuma campanha substitui o gráfico inteiro
   por um bloco com `role="status"`. Ao colar no Farol, ele dá lugar ao `EmptyState`, mantendo o texto.
10. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Pendências conhecidas

- **O `ErrorBar` está declarado e não desenha.** A montagem do exemplo oficial do Recharts mede a
  distância do bigode a partir de q3, e a perna de baixo atravessa a caixa inteira por dentro, o que
  no tema escuro parece uma segunda mediana. O bigode saiu para o `shape`, junto da caixa e das
  tampas, e o `ErrorBar` ficou com traço transparente para a peça registrar a armadilha em vez de
  fingir que ela não existe. Quem colar isso numa página pode remover o `ErrorBar` sem perda.
- **O `Scatter` sobre eixo de categoria exige `allowDuplicatedCategory` desligado.** Sem isso, cada
  ponto do Scatter cria uma banda nova no eixo, as seis filas viram vinte e cinco, e caixas e pontos
  descolam das linhas. O sintoma na tela é de desalinhamento, não de erro, e por isso passa batido.
- O rótulo do SLA vive acima da área de plotagem porque dentro dela colidia com a primeira fila. Em
  canvas mais alto, vale trazê-lo para dentro, junto da linha.

- **O clique do outlier da `v3` não tem equivalente de teclado dentro do Chart.** O corpo do gráfico é
  `aria-hidden` e quem lê a peça por leitor de tela recebe a frase da raiz, que é o desenho de
  acessibilidade das quatro versões. Quem colar no Farol precisa expor o mesmo drill por um caminho
  focável, numa lista abaixo do gráfico ou no menu do `VisualCard`. Registrado aqui em vez de
  resolvido porque a lista focável é decisão da página, não do catálogo.
- **A `v1` está na fila de dívida da guarda `AGREGACAO-ZERO`, com três mensagens.** O `quantile` dela
  declara retorno `number` e devolve `0` para lista vazia (`Chart.tsx`, linhas 79 e 80), e a escala da
  caixa cai em `iqr > 0 ? ... : 0` (linhas 155 e 159). As `v2`, `v3` e `v4` declaram `number | null` e
  saem por retorno antecipado, sem nenhum ramo devolvendo zero. Quem tocar a `v1` quita as quatro.
- **O aviso `ESPESSURA-MARCA` nas `v2` e `v4` é esperado e não se conserta.** A guarda lê a marca mais
  fina desenhada dentro do `<Bar>` e encontra 2 px, que é o **traço da mediana**, não a caixa. A caixa
  das duas mede 23,0 px na `v2` e de 12,0 a 24,0 px na `v4`, medidos no `preview.svg`, todas acima do
  piso geral de 12 px. Engrossar a mediana para 12 px encheria a caixa inteira de tinta e apagaria os
  quartis, que é o que a peça existe para mostrar. O piso geral, aliás, avisa e não reprova porque
  nunca foi medido, e é o caso da emenda de 2026-09-18 da ESP-2.
- **A `v3` sai `preview_com_transform` em duas guardas, e isso não é aprovação.** O tique de categoria
  dela usa `<g transform="translate(...)">` para posicionar nome e `n`, e o leitor de marcas se cala
  diante de qualquer `transform`, então `ESPESSURA-MARCA` e `CONTRASTE-MARCA` não mediram a versão.
  Medido à mão no `preview.svg`: **toda caixa mede 13,0 px de espessura**, acima do piso de 12 px, e as
  cores de marca são `--chart-1` (9,50:1 no escuro e 6,00:1 no claro contra o cartão), `--negative`
  (5,50:1 e 6,36:1) e `--text-muted` no bigode e na linha de chamada (5,21:1 e 5,37:1), todas acima do
  piso de 3:1 da WCAG 1.4.11. A `v1` sai pelo mesmo motivo, com o mesmo tique.


## Referências

- Catálogo: [Recharts, Box Plot](https://recharts.github.io/en-US/examples/BoxPlot/): observar o par de q1 e q3 no `Bar`, o bigode medido a partir de q3 e os outliers num `Scatter` à parte.
- Catálogo: [AG Charts, box plot com múltiplas séries](https://www.ag-grid.com/charts/gallery/multiple-box-plots/): observar o tooltip com os cinco números e a separação de séries por cor.
- Praticante: [Nightingale, I've Stopped Using Box Plots. Should You?](https://nightingaledvs.com/ive-stopped-using-box-plots-should-you/): observar os três defeitos apontados e as alternativas propostas.
- Praticante: [Stephen Few, Distribution Displays (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf): observar a tabela que compara histograma, polígono, box, strip e quantile plot por tarefa.
- Portal de design: [Highcharts, box plot no tema escuro](https://www.highcharts.com/demo/box-plot/dark-unica): observar contraste de bigode e mediana sobre fundo escuro.

## Correção de 2026-09-28

**v1, a ordem das filas não se apresentava (GEO-12).** As filas são ordenadas por mediana crescente e
nada no cartão dizia isso, então os nomes liam como lista arbitrária. Aqui o defeito morde mais que
em outros modelos, porque a mediana de cada fila não está escrita em número: é o traço dentro da
caixa, e o leitor não tem como deduzir o critério olhando as marcas. O rodapé passou a declarar a
ordem, no formato que `16_distribuicao/01_histograma/v3` já usava.

**v1, o comentário prometia um rótulo que o desenho não desenhava (DAD-10).** O comentário de
abertura afirmava que cada ponto além da cerca carrega o código do lead, "que é o que transforma a
peça de curiosidade em fila de trabalho", e nenhum código chegava à tela: o `Scatter` desenha só o
círculo. Das duas saídas possíveis, rotular os dezenove pontos ou parar de prometer, a primeira foi
medida e não cabe. Na fila mais carregada, Larissa M., dois outliers vizinhos caem a **4 px** um do
outro (74 e 76 minutos, numa escala de 2,12 px por minuto) e o típico fica em 15 px, enquanto o
código `LD 4540` mede cerca de 35 px em 11 px de texto: dezenove rótulos se cobririam, e a ROT-9
reprova par de texto a menos de 1 px.

O que mudou: o comentário passou a dizer o que acontece de fato, com a medição junto, e o código do
**caso mais distante** passou a ser escrito no rodapé, calculado do dado. Assim a regra da família,
outlier tem nome, continua valendo para o caso que abre a fila de trabalho, e o resto fica para o
drill do ponto no Farol, que é onde ele existe.

**Canvas.** Com as cinco linhas de rodapé que a peça precisa escrever, as seis filas não cabiam nos
234 px do corpo do preset `card`: a banda de cada fila ficava com 20,5 px e a caixa tem 20 px, isto é,
as caixas encostavam umas nas outras. O canvas passou a ser declarado por número, 640 por 460, e a
banda subiu para 30,5 px, com 10,5 px de vão, dentro da faixa de 30% a 40% da ESP-2. Cada fila a mais
pede cerca de 30 px de altura. É o caso que a armadilha 28 desta família descreve: nenhum preset fecha
o cartão depois que ele ganha linhas escritas.

## Segunda leva, 2026-09-28: onde a regra venceu a v1 e o vizinho

As `v2`, `v3` e `v4` foram escritas copiando o padrão da `v1` e do strip plot vizinho, como manda o
protocolo. Em cinco pontos o padrão copiado estava proibido por regra, e aqui a regra venceu, com o
arquivo e a linha, para a próxima leva não reintroduzir o defeito.

1. **`v1/Chart.tsx:79` e `:80`, mais `:155` e `:159`** contra **EST-1b** e a guarda `AGREGACAO-ZERO`.
   O `quantile` declara retorno `number` e devolve `0` para lista vazia, e a escala da caixa cai em
   `iqr > 0 ? ... : 0`. Num box plot o zero de uma agregação não é um número neutro: ele desenha a
   caixa colada no piso do eixo, e isso se lê como "esta fila responde na hora" em vez de "não houve
   caso". As três versões novas declaram `number | null` e tratam o interquartil zero por retorno
   antecipado, não por escala valendo zero.
2. **`v1/Chart.tsx:187` e `:288`** contra a mesma regra, na forma `base > 0 ? parte / base : 0`:
   `formatPercent(total === 0 ? 0 : above / total, 1)`. As três versões novas usam
   `formatRateWithVolume(above, total)`, que já devolve o rótulo de indisponível para denominador
   zero e, de quebra, resolve a **DAD-1**, taxa escrita sem o volume.
3. **`01_histograma/v1:180`, `v2:451`, `v3:330` e `v4:341`** contra **EIX-5** e **REC-30**. As quatro
   desenham `CartesianGrid` e espalham `AXIS_PROPS` sem sobrepor `axisLine`, e as quatro estão na fila
   de dívida da guarda `EIXO-CALMO`. Nas três versões novas o `axisLine={false}` vem **depois** do
   espalhamento, em cada eixo, porque em JSX a última propriedade vence e as duas escritas têm os
   mesmos caracteres.
4. **`v1/Chart.tsx:65`**, `BOX_FILL = 'var(--line-subtle)'`, contra **TOK-1** e a guarda
   `CONTRASTE-MARCA`. O preenchimento existe para cobrir o bigode que atravessa a caixa, e mede
   1,25:1 e 1,29:1 contra o cartão. As três versões novas quebram o bigode em dois trechos, então não
   há nada a cobrir, e a caixa é vazada com contorno em `--chart-1`, que mede 9,50:1 e 6,00:1.
5. **`03_strip-plot-e-beeswarm/v1/Chart.tsx:38` e `:180`**, `fillOpacity` de 0,45 em `--chart-1`,
   contra **ACE-5**. É exatamente a técnica que a especificação da `v2` mandava copiar. Medida à mão
   nos dois temas, a cor composta sobre o cartão dá **2,96:1 no escuro e 2,04:1 no claro**, abaixo do
   piso de 3:1 da WCAG 1.4.11; em `--negative` fica pior, 2,05:1 e 2,21:1. A menor opacidade que passa
   nos dois temas é **0,66**. A `v2` usa ponto opaco com contorno de 0,5 px na cor da superfície, que é
   a segunda saída que a própria ACE-5 oferece, e separa a pilha sem compor cor nenhuma.

Nenhuma guarda mede as cinco: a 1 e a 2 são pegas pela `AGREGACAO-ZERO` e a 3 pela `EIXO-CALMO`, mas a
4 sai como aviso e a 5 fica **fora do escopo** da `CONTRASTE-MARCA`, que julga só os tokens que o
contrato proíbe como marca. Estar fora do escopo de uma guarda não é estar aprovado por ela, e o par
composto por opacidade é medição de quem escreve a peça.

## Onde cada versão declara o que a caixa é

O modelo tem uma armadilha que não é de código: quartis, mínimo e máximo, cerca de 1,5 vez o
interquartil e faixa de percentil 10 a 90 produzem caixas de tamanhos muito diferentes sobre o mesmo
dado. Caixa sem a definição escrita convida o leitor a concluir o que quiser, e é a mesma classe da
**GEO-12**, ordem por métrica que nada no cartão declara. As quatro versões declaram no rodapé, por
texto calculado e não por texto fixo:

| Versão | Onde declara | O que declara |
|---|---|---|
| `v1` | rodapé, quatro trechos | método de quartil, caixa é a metade central, cerca de 1,5 vez, ordem por mediana |
| `v2` | rodapé, três trechos | método de quartil, caixa é a metade central, cerca de 1,5 vez, ordem por mediana crescente da esquerda para a direita |
| `v3` | rodapé, três trechos | método de quartil, caixa é a metade central, cerca de 1,5 vez, ordem de funil e não de valor, teto do eixo e o que acontece além dele |
| `v4` | rodapé, quatro trechos | método de quartil, caixa é a metade central, cerca de 1,5 vez, o que a largura codifica com os dois extremos de `n`, o que o entalhe compara e por que ele aparece tracejado |

A cerca sai de `formatDecimal(FENCE_FACTOR, 1)` nas quatro, e o entalhe de
`formatDecimal(NOTCH_FACTOR, 2)` na `v4`: o número escrito na tela é a constante que o desenho usou, e
não um número digitado no texto, para as duas não poderem divergir.

**O que cada caixa faz com uma lista vazia.** Nas `v2`, `v3` e `v4` o `quantile` devolve `null`, então
`five` devolve `null`, então `box` é `null`, e aí o `dataKey` do `Bar` entrega `[null, null]` e o
`shape` sai com um grupo vazio: **nenhuma caixa é desenhada**, nenhum bigode, nenhuma mediana. O grupo
continua no eixo de categoria com o `n` escrito, para a diferença entre "não tem mediana" e "a mediana
é baixa" existir na tela. Na `v4` isso é o caminho normal e não o caso de exceção, porque o grupo com
menos de cinco campanhas entra por ele de propósito. Com o recorte inteiro vazio a `v4` substitui o
gráfico pela frase de estado da **EST-1**, em vez de desenhar eixo e grade de uma distribuição que não
existe.
