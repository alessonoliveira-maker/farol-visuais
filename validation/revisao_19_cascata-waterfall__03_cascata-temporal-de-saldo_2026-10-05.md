# Parecer de revisão: 19_cascata-waterfall/03_cascata-temporal-de-saldo

Data: 2026-10-05. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 1 aviso (`CONTRASTE-MARCA` na `v2`, que orienta e não reprova: o neutro em `--line-strong` vive da isenção do valor escrito da 17.2).

Resultado: `v1` e `v4` aprovadas; `v2` e `v3` reprovadas. Dois bloqueantes no total, um por versão. As observações não bloqueantes das quatro estão no README do modelo.

Os dois bloqueantes não têm o mesmo peso. O da `v3` é regra que decide o que o desenho afirma (papel de cor) e bloqueia sempre. O da `v2` é acabamento com consequência medida no preview, o caso mais fraco da seção 14.1; a medida está abaixo para o dono conferir.

## v3_oportunidades-abertas-em-doze-meses: reprovada, um bloqueante

### Bloqueante 1. Pergunta 11, COR-6 (seção 14.1: papel de cor, bloqueia sempre)

**Evidência no código.** `Chart.tsx:95` decide a cor pelo sinal do líquido: `payload.net > 0 ? 'var(--positive)' : 'var(--negative)'`. A dica repete a regra em `Chart.tsx:177`. Não existe `goodDirection` no `data.ts`, nas props nem no `notes` do `meta.json`.

**Evidência nos dois PNGs.** As onze faixas de mês com líquido acima de zero saem em `--positive` (7,36:1 no escuro, 5,34:1 no claro), com o rótulo na mesma cor. O desenho afirma onze meses bons.

**Por que é falso.** O líquido do mês é entradas menos ganhas, perdidas e arquivadas. A carteira aberta encolhe quando o time ganha negócio: um mês com 10 entradas e 15 ganhas dá −5 e sairia em `--negative`, sendo o melhor mês comercial do recorte. O sinal do movimento de um estoque não é polaridade. É a mesma grandeza da fila da `v1`, e a `v1` declara no `notes` que "fila sem polaridade declarada não usa verde nem vermelho (COR-6)". A linha que o catálogo pede para esta versão ("o estoque cresce enquanto o fluxo não muda") também não é juízo de bom ou ruim.

**O que mudar.** Tirar `--positive` e `--negative` das faixas, dos rótulos e da linha "Líquido do mês" da dica. Há dois caminhos dentro do contrato:

1. Neutro de dado com valor escrito (17.2): `--line-strong` na faixa e `--text-secondary` no rótulo. A `Line` em `--chart-1` fica como único destaque, e a direção continua no sinal e na posição do rótulo (ACE-2).
2. O par categórico da `v1` por direção: `--chart-3` quando sobe e `--chart-6` quando desce, na ordem da COR-8.

A cor semântica só volta se o dono declarar a polaridade da carteira aberta. Nesse caso ela entra como `goodDirection` no dado e a cor sai dela, nunca do sinal. O `notes` registra a decisão tomada.

### Para levar na mesma rodada (não bloqueiam)

1. O traço do mês de líquido zero (fev/26) fica com 11 dos 22 px debaixo da `Line`, e sobra um toco cinza à direita do vértice. É a emenda de 2026-09-29 da REC-13: a `Line` (zIndex 400) pinta sobre a `Bar` (300). Fecha desenhando o traço numa camada acima da linha ou afastando o traço do nível dela.
2. O `useCase` pergunta "em quais meses não cresce", e nem a linha de leitura nem a frase acessível dizem fev/26; o tique de fevereiro não é impresso. Quem enxerga deduz pelo vizinho, quem ouve fica com "1 com saldo zero". Nomear nas duas frases os meses de saldo zero ou negativo.
3. Com a faixa neutra some também o encontro de 1,12:1 no claro entre a `Line` e o canto da faixa (TOK-9).

## v2_dia-em-que-a-fila-passou-do-teto: reprovada, um bloqueante

### Bloqueante 1. Perguntas 13 e 15, ROT-7 com a emenda de 2026-09-29 da REC-13 (seção 14.1: acabamento com consequência no render, leitura apertada)

**O que se vê nos dois PNGs.** O tracejado do teto passa colado em dois rótulos: o `−36` da saída de quinta e o `104 leads` do total final. Em escala 1x o topo das letras encosta nos traços. O `104 leads` fica na ponta direita do tracejado e lê como legenda do teto, cujo rótulo de verdade ("teto de 120 leads") está na outra ponta. Na quinta o traço passa entre a barra e o rótulo dela.

**Evidência medida, igual nos dois temas.**

1. No `preview.svg` o teto está em y=103,18. A linha de base do `−36` de quinta está em y=113,95 e a do `104 leads` em y=114,09. Com 8,64 px de tinta acima da linha de base, o topo dos dois fica em 105,3 e 105,5.
2. No PNG, em 2x, o tracejado ocupa as linhas 425 a 427 e a tinta dos dois rótulos começa na 431: três pixels de dispositivo, 1,5 px de tela.
3. Cada rótulo está a 6 px da própria barra e a 1,5 px do teto. O halo da ROT-7 tem 2 px de cada lado, então o traço está dentro da zona que o halo deveria abrir.

**Por que o halo não resolve.** Os rótulos nascem com o halo, e o comentário de `Chart.tsx:264` diz que a `ReferenceLine` foi declarada antes da `Bar` "de propósito", para o halo abrir o traço. Não abre. No Recharts 3.10.1 a `ReferenceLine` tem zIndex 400 e a `Bar` 300 (`es6/cartesian/ReferenceLine.js:220` e `es6/zIndex/DefaultZIndexes.js`), então o teto é pintado depois dos rótulos, qualquer que seja a ordem no JSX. No `preview.svg` as duas `<line>` de referência vêm depois de todos os `<text>` do shape, e no PNG o tracejado atravessa inteiro a zona do halo dos dois rótulos.

**Por que não é acaso do dado.** Os números são os do catálogo: teto 120, fim 104, pico 176 (80 mais 96). Com eles o rótulo do total cai sempre nesse lugar. E em qualquer recorte em que um passo termine de 6 a 15 leads do teto, o traço risca o rótulo por cima; se cair na altura do sinal de menos, o sinal some no tracejado.

**O que mudar.**

1. Pintar o teto por baixo dos rótulos com `zIndex` explícito na `ReferenceLine`, abaixo de 300, que é a saída da REC-13, e conferir no PNG que o halo abre o traço.
2. Dar respiro quando rótulo e teto não se cruzam: rótulo que cair a menos de 4 px do traço (o respiro da 17.7) muda de lado ou se afasta.
3. Corrigir o comentário da linha 264, que hoje descreve um desenho que o render não faz.

Critério de aceite: nos dois PNGs, nenhum rótulo de valor a menos de 4 px do tracejado sem o traço aberto pelo halo.

### Para levar na mesma rodada (não bloqueiam)

1. ANO-3 e REC-4: o rótulo "teto de 120 leads" usa `position: 'insideBottomLeft'`, dentro da área e na altura do próprio traço, por cima das primeiras colunas. Com o dado fixo sobram 37 px até o `76 leads`; com a fila abrindo perto do teto os dois colidem. A saída da REC-4 é a faixa reservada, na margem do topo ou da direita.
2. O traço do teto usa `strokeDasharray="4 4"`, e a 17.2 dá `3 3` para referência.
3. A linha de leitura sai com maiúscula depois de dois pontos ("A fila passou do teto"), e a preposição fixa "na" quebra em sábado e domingo.

## v1 e v4: aprovadas

As 32 perguntas com sim nas duas. Escala conferida no `preview.svg`: 1,81 px por lead em quatro marcas da `v1` e 6,70 px por mil reais em cinco marcas da `v4`; totais ancorados no zero; pares de texto de 5,21:1 a 17,96:1 nos dois temas. Nada a corrigir nesta rodada; as observações estão no README.
