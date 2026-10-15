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
   código e o valor escritos, em `--negative`, e o rótulo deslocado da linha do bigode. Vale todo caso
   com dias acima do teto (dentro ou além da cerca), um marcador por etapa com o mais distante e a
   contagem, e o bigode para no teto, sem tampa.

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
9. As quatro versões trazem o estado vazio da EST-1 pronto: `data` sem nenhum caso substitui o gráfico
   inteiro por um bloco com `role="status"`. Ao colar no Farol, ele dá lugar ao `EmptyState`, mantendo
   o texto. Fila ou etapa sem observação tem caixa `null` (nunca zero) e vai para o fim da ordem.
   Na `v3`, os casos acima do teto fazem parte de `opportunities` da própria etapa e o marcador de
   borda é derivado dos dias acima de `domainMax`; no Farol nada além do `data` precisa ser passado.
   Na `v4`, todo valor além da cerca de Tukey vira ponto na banda do grupo e o rodapé conta quantos.
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

## Observações da revisão (não bloqueantes)

**2026-10-15, revisor independente, quatro versões julgadas.** Nada abaixo reprova; quem tocar o
arquivo alinha na mesma mão. Os bloqueantes estão em
`validation/revisao_16_distribuicao__02_box-plot_2026-10-15.md`.

- `v1`: a `ReferenceLine` do SLA não declara `ifOverflow="extendDomain"` (ANO-3, REC-1). Sem consequência com o teto de 200 minutos, mas `domainMax` e `slaMinutes` são props independentes.
- `v1` e `v2`: a mediana de Rafael T. cai exatamente no limiar (30 minutos na `v1`, 48 horas na `v2`) e o traço tracejado da referência é pintado por cima dela, então a mediana sai riscada nos dois temas (REC-13). Pintar a referência antes da caixa.
- `v1`: o ponto de 21 minutos de Bruna C. cobre a tampa do bigode em 20, e os pares a 2 minutos (Ernesto V. 102 e 104, Larissa M. 74 e 76) se fundem num borrão. O contorno de 0,5 px na cor da superfície, como na `v2` e na `v3`, separa sem perder contraste.
- `v1`: a caixa é preenchida com `--line-subtle` (1,25:1 e 1,29:1 contra o cartão, TOK-1). Quem identifica a caixa é o contorno em `--chart-1`, mas as irmãs já fazem caixa vazada com bigode em dois trechos, e é a mesma mão do conserto.
- `v1` e `v3`: os tiques do eixo de valor saem sem unidade (NUM-6); a unidade vive só no rodapé e no rótulo do limiar. A `v2` e a `v4` escrevem `h` e `R$` no tique.
- `v1`: sem grade, a caixa de cima se lê contra um eixo a cerca de 170 px; a `v3`, no mesmo layout, tem a grade vertical da EIX-3.
- `v1`: o catálogo pede dica nomeando o lead no outlier; a versão escreve o código do mais distante no rodapé (saída aceita em 2026-09-28). Uma `ChartTooltip` no `Scatter` completaria o que o catálogo descreve.
- `v1` e `v2`: a frase acessível sai com ponto duplo depois do nome abreviado ("Camila O..", "Ernesto V..").
- `v2`: a frase acessível não responde a segunda metade do caso de uso: o aglomerado escondido de Larissa M. (treze leads de 3 a 9 horas e treze de 62 a 96) aparece no desenho e em nenhum texto (ACE-1).
- `v2`: o caso de uso pergunta quantos leads de cada fila passam do prazo, e só o total está escrito. Contar os 13 losangos de Larissa M. com jitter é trabalho do leitor; o número cabe ao lado do `n` do topo.
- `v2`: ponto acima de `domainMax` seria desenhado fora da área de plotagem, porque a nuvem não entra no cálculo do domínio. Latente no dado padrão (máximo de 118 horas contra teto de 120).
- `v2`: o catálogo pede `allowDuplicatedCategory` desligado no `XAxis`; sem `Scatter` a propriedade não tem efeito, e a ausência é coerente com a REC-32.
- `v2`, `v3` e `v4`: o `n` do topo e o rótulo do caso de borda usam `font-display` sem peso declarado, e o Space Grotesk 400 não é carregado (TIP-4); o navegador cai no 500.
- `v3`: os casos além da cerca com valor repetido se empilham (17 em Qualificação sobre 7 valores distintos, 13 em Diagnóstico sobre 8): a contagem por etapa não se lê e o clique só alcança o ponto de cima da pilha.
- `v3`: os rótulos dos casos de borda atravessam a linha de grade de 135 dias sem halo. A grade é `--line-subtle` e a leitura não sofre nos dois PNGs.
- `v4`: o piso de 12 px leva Nativa (n 9) à largura que a raiz daria para n 12, e a régua da legenda escreve "n 9" sobre esse degrau. Está declarado no `meta.json` e não na tela; "piso de 12 px" na linha da régua resolve.
- `v4`: a frase acessível não diz a conclusão do caso de uso (o entalhe de Busca paga não cruza os de Display e Vídeo) e põe no topo das medianas Programática, o grupo de quatro campanhas que a própria peça não resume em caixa (ACE-1).
- `v4`: o `notes` do `meta.json` diz que "o n do grupo recebe um marcador" quando o entalhe é cortado, e o desenho não tem marcador nenhum (DAD-10 no texto, não na tela).
- README: a lista de "Como colar no Farol" pula do passo 5 para o 7.

**2026-10-15, segunda passada do revisor independente, depois da rodada de correção.** `v1`, `v2` e
`v4` aprovadas, `v3` reprovada (bloqueante em
`validation/revisao_16_distribuicao__02_box-plot_2026-10-15.md`, seção da segunda passada). Nada
abaixo reprova.

- `v1`: a chave `AGREGACAO-ZERO` desta versão continua em `_render/scripts/lib/divida-guardas.json`, e o `check` já avisa que ela não acusa mais nada. Quem conserta tira o registro.
- README, "Pendências conhecidas": o item que põe a `v1` na fila de dívida da `AGREGACAO-ZERO` (`quantile` devolvendo `0`, linhas 79, 80, 155 e 159) ficou falso. Em "O que cada caixa faz com uma lista vazia", "Nas `v2`, `v3` e `v4`" e "a `v4` substitui o gráfico" valem hoje para as quatro.
- `v1`: o rótulo `SLA 30 min` da `ReferenceLine` sai sem classe tabular (TIP-1). Sem consequência visível com um número só.
- `v2`, `v3` e `v4`: os tiques são constantes (`[0..120]`, `[0..180]`, `[0..560]`) enquanto `domainMax` é prop. Outro teto deixaria a grade sem a linha do teto ou com tique fora do domínio (EIX-4). Calcular os tiques do `domainMax`.
- `v4`: ponto além da cerca acima de `domainMax` seria desenhado fora da área de plotagem, porque os pontos não entram no cálculo do domínio. Latente no dado padrão (maior valor R$ 528 contra teto de R$ 560), a mesma classe já anotada na `v2`.
- `v4`: o ponto além da cerca e o ponto de Programática têm o mesmo desenho (mesma cor, mesmo raio) e dizem coisas diferentes, caso extremo contra amostra inteira. O rodapé explica os dois, mas a linha "2 campanhas ficaram além da cerca" não traz amostra da marca, como trazem a `v2` e a `v3`.
- `v3`: os números do texto ficaram com o dado antigo. O README ("Versões") e o `notes` do `meta.json` dizem mediana de 46 dias em Aprovação interna e 34 casos além da cerca; o desenho e a frase dizem 49 dias e 33 casos. O comentário do topo do `Chart.tsx` ainda diz "medianas de 6 a 46 dias" e "trinta e dois códigos".
- README, passo 9 de "Como colar no Farol": "fila ou etapa sem observação vai para o fim da ordem" não vale para a `v3`, que mantém a ordem de funil, e está certa em manter.

**2026-10-15, terceira passada do revisor independente, só a `v3`, depois da segunda rodada de
correção.** `v3` aprovada: todo caso acima do teto entra no marcador da etapa, com o mais distante e a
contagem, o bigode para no teto sem tampa e o rodapé conta do dado. Nada abaixo reprova.

- `v3`: o comentário da linha 274 do `Chart.tsx` ainda diz "todo caso além da cerca com dias acima do teto", e o bloco logo abaixo (linhas 275 e 276) diz o contrário, que vale todo caso acima do teto, esteja ou não além da cerca. Apagar a linha 274.
- `v3`: os números antigos do texto continuam (item 5 do "O que mudar" da segunda passada): "Versões" deste README e `notes` do `meta.json` com mediana de 46 dias e 34 casos além da cerca, e o comentário do topo do `Chart.tsx` com "medianas de 6 a 46 dias" e "trinta e dois códigos". O desenho e a frase dizem 49 dias e 33 casos. A "banda de 38 px" do comentário e do `notes` mede 32,75 px no `preview.svg`.
- `v3`: caixa com q3 acima de `domainMax` estenderia o eixo, porque o par `[q1, q3]` do `Bar` entra no domínio e não há `allowDataOverflow`; os tiques fixos parariam em 180 e a seta iria para a borda estendida. Latente (o maior q3 do dado padrão é 94,5 dias), a mesma classe dos tiques constantes já anotados.
- `v3`: a frase acessível não nomeia o caso extremo, que é a segunda metade do caso de uso. " O mais distante é a OP 10482, com 412 dias." soma 44 caracteres e cabe nos 250 (ACE-1).
- `v3`: "33 além da cerca" no rodapé sai sem o substantivo (NUM-6, contagem solta); o ramo sem caso mais distante já escreve "oportunidades".
- `v3`: o rótulo "parada a partir de 30 dias" da `ReferenceLine` sai sem classe tabular (TIP-1), como o da `v1`. Sem consequência visível com um número só.
- `v3`: `MARKER_LABEL_RISE` de 13 px é ímpar (ESP-1), e a linha de chamada usa deslocamentos soltos (`+ 2`, `+ 3`, `- 2`, `* 1.6`) fora de constante nomeada. Sem consequência visível no preview.
- README, "Pendências conhecidas": o item que diz que a `v3` sai `preview_com_transform` em duas guardas ficou velho; hoje a `CONTRASTE-MARCA` mede a `v3` e só a `ESPESSURA-MARCA` não mede.
