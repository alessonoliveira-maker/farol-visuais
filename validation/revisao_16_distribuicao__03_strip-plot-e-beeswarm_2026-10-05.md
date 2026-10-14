# Parecer de revisão: 16_distribuicao/03_strip-plot-e-beeswarm

Data: 2026-10-05. Revisor independente. Julgado o arquivo de hoje, não a nota antiga.

`npm run check -- 16_distribuicao/03_strip-plot-e-beeswarm`: 0 com erro, 1 aviso (fila de dívida da v1,
descrito no fim). Os dois PNGs de cada versão foram abertos, e as medidas abaixo saem do `preview.svg`.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_cpl-das-campanhas-por-plataforma` | reprovada | 2 |
| `v2_wheat-plot-com-buraco-anotado` | aprovada | 0 |
| `v3_beeswarm-de-ticket-por-trimestre` | reprovada | 1 |
| `v4_barcode-com-valores-repetidos` | reprovada | 2 |

A correção da opacidade na v1 está aceita: o ponto agora é opaco, com contorno na cor da superfície, e
o ponto isolado se vê nos dois temas. O que reprova a v1 hoje é outra coisa.

## v1_cpl-das-campanhas-por-plataforma: reprovada

### Bloqueante 1. Pergunta 16, EST-1: não existe estado vazio

- **Evidência.** `Chart.tsx` não tem nenhum ramo com `role="status"`. Com `data` vazio, `kinds` e `all`
  ficam vazios, `ceiling` vale 150 e o componente segue até o `ScatterChart`: desenha o eixo de R$ 0 a
  R$ 150, a linha da meta e o rodapé com "n 0 campanhas do trimestre" e "0 campanhas acima da meta de
  R$ 150". O próprio README lista isso em Pendências conhecidas. As versões 2, 3 e 4 têm o bloco.
- **O que mudar.** Antes do `return` principal, quando `all.length === 0`, devolver o bloco das irmãs:
  raiz `flex h-full w-full min-w-0`, `role="status"`, ícone `Filter` de 16 px e uma frase de 12 px em
  `--text-muted` dizendo que o recorte não tem campanha com custo por lead calculável. Sem eixo, sem
  meta, sem rodapé. Depois, apagar a linha da pendência no README.

### Bloqueante 2. Pergunta 1, seção 14.1 (versão não demonstra o que declara), DAD-10

- **Evidência.** O catálogo pede "tooltip com o nome fictício da campanha". O `meta.json` declara "uma
  campanha nomeada por ponto". O comentário do topo diz que "cada ponto é uma campanha que alguém pode
  pausar, copiar ou reforçar". O `data.ts` carrega 114 nomes e o `StripPoint` leva o campo `campaign`.
  Nenhum nome chega à tela: o arquivo não importa `Tooltip` nem `ChartTooltip`, não há rótulo de ponto e
  o rodapé não cita campanha nenhuma. Nos dois PNGs não existe um único nome de campanha. É a única das
  quatro versões sem o item 7 da Anatomia do README (nome do caso no extremo ou no selecionado).
- **O que mudar.** Uma das duas saídas, à escolha do corretor, e as duas podem conviver:
  1. Ligar `<Tooltip content={<ChartTooltip valueFormat="..." />} isAnimationActive={false} />` com o
     nome da campanha e o custo no mesmo formato do tique (DIC-2, DIC-4). Como dica não conta sozinha
     (DIC-1), escrever também no rodapé o caso extremo, calculado do dado: a campanha mais cara e o
     valor dela (hoje seria Xaxim institucional, R$ 395, em Display).
  2. Se a dica não entrar, escrever o extremo no rodapé e trocar o texto do `meta.json` e do comentário
     do topo para o que a peça de fato mostra.

### A alinhar na mesma rodada (observações, não reprovam sozinhas)

- Pergunta 19, ACE-1: a frase acessível do ramo principal começa por "Custo por lead de 114 campanhas",
  não pelo tipo. Começar por "Strip plot do custo por lead de", como o ramo sem medida já faz.
- Rodapé: "pontos sobrepostos aparecem separados por contorno claro" só é verdade no tema claro. No
  escuro o contorno é `--surface-raised`, que é escuro. Trocar por "contorno na cor do cartão".
- TIP-1: o rótulo "meta R$ 150" da `ReferenceLine` não leva classe de algarismo tabular.
- EIX-6: o tique do eixo X usa `formatCurrency(value, 0)` e não `formatCurrencyAxis`. Sem diferença
  visível neste domínio.
- ANO-3: a `ReferenceLine` não declara `ifOverflow="extendDomain"`. Sem consequência, porque o teto do
  eixo já inclui a meta em `Math.max(target, ...)`.
- O `meta.json` não declara nas notas a divergência contra o catálogo (opacidade de 0,45 trocada por
  ponto opaco, pela ACE-5). As versões 2 e 4 declaram.
- Fila de dívida: o `check` pede que a chave `OPACIDADE-MARCA` desta versão saia de
  `_render/scripts/lib/divida-guardas.json`. Quem conserta tira o registro.

## v2_wheat-plot-com-buraco-anotado: aprovada

Nenhum bloqueante. Conferido contra o dado: mediana de 10 dias (23º e 24º casos em 10), faixa de 5 a 9
dias com 13 casos, vão de 13 a 14 dias sem nenhum caso e sem outro vão mais largo, 46 pontos no
desenho. A altura está declarada como ordem e não como grandeza, o eixo Y está oculto, a faixa do vão
tem texto (ANO-4) e o motivo está no rodapé. Observações no README.

## v3_beeswarm-de-ticket-por-trimestre: reprovada

### Bloqueante 1. Perguntas 13 e 15, ROT-7 e COR-5 pela consequência: o traço da mediana parte os pontos

- **Evidência.** A mediana é desenhada por cima da nuvem como um retângulo de 119,35 px por 2 px, com
  uma base de 121,35 px por 4 px na cor do cartão. O ponto tem 6 px de diâmetro, então a base cobre
  dois terços da altura de todo ponto centrado nela. Medido no `preview.svg`, somando a área de cada
  círculo dentro da base: 72 dos 312 pontos são tocados e **35 ficam com metade ou mais da área
  coberta** (10 de 71 no 1º tri, 12 de 78 no 2º, 8 de 80 no 3º, 5 de 83 no 4º). Nos dois PNGs esses
  pontos aparecem como duas lascas, uma acima e outra abaixo do traço, e nelas não dá para dizer se a
  marca é ponto cheio (vertical A) ou anel (vertical B), que é o segundo canal que a própria peça
  declara obrigatório (TOK-9, ACE-2). O dodge existe para nenhum ponto ser coberto, e a mediana de um
  beeswarm cai por construção na linha mais densa da nuvem.
- **O que mudar.** Tirar a mediana de cima dos pontos. Saída sugerida: dois traços curtos nas bordas
  da faixa, fora da nuvem (de `band.cx - half` até a borda esquerda da nuvem naquela altura, e o
  espelho à direita), ou um marcador lateral de cada lado, sem base na cor do cartão. O valor da
  mediana por trimestre pode ir escrito ao lado do marcador, em 11 px, o que também tira do leitor o
  trabalho de ler a mediana contra a grade. Conferir de novo no `preview.svg` que nenhum círculo perde
  área para o traço.

### A alinhar na mesma rodada (observações)

- TIP-1: o tique do eixo Y é um `<text>` próprio sem classe de algarismo tabular.
- O catálogo fala em "drill por ponto" e o componente não tem `onClick` nem dica; existe só o
  `highlightId`. A frase do README em Pendências ("o drill por ponto existe nos componentes") promete
  mais do que há (DAD-10).
- O anel de destaque usa `band.cx + point.dx` sem o limite que o ponto usa. Igual neste recorte.

## v4_barcode-com-valores-repetidos: reprovada

### Bloqueante 1. Perguntas 1 e 15, ilegibilidade: valor com uma campanha só mede 0,78 px e some

- **Evidência.** No ramo saturado a altura do traço é `yScale(bucket.campaigns)`, num plano de 94 px
  para um teto de 120. Medido no `preview.svg`: os oito valores com uma campanha (R$ 20, 290, 300, 310,
  330, 360, 400 e 460) têm traço de **1 px de largura por 0,78 px de altura**, e os de duas campanhas,
  1,57 px. Nos PNGs, a 2x, eles são grãos de 2 por 2 px pousados em cima da linha de grade do zero; os
  de R$ 300 e R$ 400 ainda caem na coluna da grade vertical. A 1x a marca tem menos de um pixel e
  depende do arredondamento do `crispEdges` para existir. O resultado na tela é uma distribuição que
  parece acabar em R$ 280, com o eixo indo até R$ 500 sem razão aparente. O `data.ts` diz que "de
  R$ 310 em diante o lançamento é esparso, e o barcode mostra o buraco que o histograma fecharia", e é
  exatamente essa cauda que o desenho apaga. O maior valor (R$ 460) só está na frase acessível. O
  `meta.json` recusou a opacidade porque "um valor com uma campanha só ficaria invisível", e a altura
  por contagem produz o mesmo efeito.
- **O que mudar.** Presença e contagem em duas marcas, sem piso que minta a contagem. Saída sugerida:
  manter, também no ramo saturado, a faixa de barcode de altura uniforme (um traço curto por valor, o
  `TICK_H` ou menos) logo abaixo da linha do zero, como tapete, e deixar a altura por contagem acima
  dela. Assim todo valor com caso se vê, os vãos da cauda aparecem, e o preview passa a mostrar o
  barcode que o título promete. Escrever no rodapé a faixa observada (de R$ 20 a R$ 460), no mesmo
  formato da frase acessível.

### Bloqueante 2. Pergunta 4 pela regra de encoding (seção 14.1): a seleção usa o canal que conta

- **Evidência.** O rodapé escreve "a altura do traço passou a contar", o eixo Y é contagem com grade,
  e todo traço nasce da linha do zero. A campanha selecionada é um traço que nasce da mesma linha do
  zero e sobe até `plotArea.y`: 94 px, isto é, a marca de 120 no eixo, mais alta que o valor mais
  cheio (113). O valor dela, R$ 310, tem uma campanha. O que a separa dos demais é a cor, que a própria
  peça mede em 1,14:1 no escuro e 1,05:1 no claro contra `--chart-1`, meio pixel de espessura e o
  rótulo ao lado. O comentário diz que "quem separa é a altura", e no ramo saturado a altura é
  justamente o canal do dado. O traço de contagem do próprio valor de R$ 310 fica escondido embaixo.
- **O que mudar.** No ramo saturado a seleção não pode nascer do zero como um traço de contagem. Saída
  sugerida: marcar a seleção na faixa de barcode do bloqueante 1 (traço mais alto que os vizinhos
  dentro do tapete, que é o desenho que o catálogo pede) e, no plano de contagem, no máximo uma guia
  tracejada da tabela 17.2, que lê como referência e não como marca. O rótulo com nome e valor fica.
  No ramo uniforme o traço alto continua certo, porque ali a altura não conta nada.

### A alinhar na mesma rodada (observações)

- TIP-1: o rótulo "Alvorada institucional, R$ 310" é um `<text>` sem classe de algarismo tabular.
- O rodapé tem dois "34" de coisas diferentes na mesma leitura (34 valores e 34 campanhas sem lead). É
  coincidência do dado fictício; trocar um dos dois evita a confusão.
- O caso de uso fala em "faixa de poucos pixels" e a peça pede 97 px de plano num canvas de 960 por
  320. Está declarado nas notas. Com o tapete do bloqueante 1 a frase volta a ter desenho que a
  sustente.

## Defeitos de régua e de ferramenta notados

- O `check` devolve `ESPESSURA-MARCA` não medida na v4 por `marca_html`, e as marcas da v4 são
  `<line>` em SVG. O motivo parece errado, e nenhuma guarda mede altura mínima de marca de traço: o
  grão de 0,78 px passou calado.
- O aviso de fila de dívida da v1 (`OPACIDADE-MARCA`) segue aberto em `divida-guardas.json`.
