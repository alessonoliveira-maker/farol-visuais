# Parecer de revisão: 19_cascata-waterfall/05_cascata-com-faixa-de-cenario

Data: 2026-10-06. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 09:45, posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 0 aviso.

Resultado: as quatro versões reprovadas. Um bloqueante comum às quatro (o intervalo do passo contra o corpo), mais um próprio da `v3` e um próprio da `v4`. As observações não bloqueantes estão no README do modelo.

## Peso de cada bloqueante

* **Comum, contraste.** É regra que decide o que o desenho afirma e bloqueia sempre pela seção 14.1. Uma correção no shape resolve as quatro versões, que compartilham o mesmo trecho de código.
* **`v3`, rótulo colado na marca.** Acabamento com consequência medida no preview (colisão). É o caso mais fraco da 14.1; a medida está abaixo.
* **`v4`, tampa partida pela linha do teto.** Acabamento com consequência medida no preview (marca partida).

## Sobre precedente, para quem for conferir este parecer

O bloqueante comum **não se apoia em decisão anterior do acervo**. Procurei em `validation/*.md` e em `_render/.qa/revisao/*.json` por dois padrões (termo de intervalo com razão de contraste e corpo na mesma linha; depois só `ErrorBar`, barra de erro, whisker, bigode) e não achei nenhum veredito sobre intervalo medido contra o próprio corpo. O que existe é vizinho, e não igual:

* `19/01`, `19/02`, `19/03`: conector em `--line-strong` aceito como referência pela ACE-6. Mantido aqui.
* `17/04` `v4`: linha de capacidade que some dentro das colunas, registrada como observação (TOK-10). Lá o traço é referência; aqui é o dado.
* `08/01` `v4`: revestimento que cobria o topo da coluna, bloqueante.
* `16/02` (parecer de 2026-09-28, linha 278): a caixa cobre o traço do `ErrorBar` de propósito. Não serve de saída aqui, ver abaixo.

É, até onde encontrei, a primeira vez que esse par é julgado. Os READMEs dos modelos só entraram na primeira busca, a mais estreita.

## O que foi medido e o que não foi

* **Medido:** contrastes, pela cor dos pixels dos dois PNGs; geometria, pelas coordenadas do `preview.svg`; contato de texto com marca e cobertura de tampa, por varredura de pixels.
* **Não testado:** nenhuma das saídas sugeridas foi renderizada. As razões da saída A são conta sobre as cores medidas. O `zIndex` da `ReferenceLine` vem da leitura da emenda da REC-13, não de execução.

## Bloqueante comum às quatro. Pergunta 20, ACE-3 com ROT-6 e ACE-8, armadilha TOK-10

**O que o desenho faz.** O intervalo do passo é um traço de 2 px em `--text-primary` com duas tampas. Como o esperado fica entre o mínimo e o máximo, uma das tampas cai sempre **dentro do corpo**: a do mínimo nos passos positivos, a do máximo nos negativos. Esse trecho tem o corpo como fundo adjacente, não o cartão.

**Medida, contraste do traço contra o corpo:**

| Corpo | Escuro | Claro | Versões |
|---|---|---|---|
| `--positive` | 1,97:1 | 3,37:1 | `v1`, `v3`, `v4` |
| `--negative` | 2,64:1 | 2,82:1 | `v1`, `v3`, `v4` |
| `--chart-1` | 1,53:1 | 2,99:1 | `v2` (passo destacado) |
| `--text-secondary` | 1,78:1 | 2,21:1 | `v2` (passos neutros) |

Sete dos oito pares ficam abaixo dos 3:1 da ACE-3. A faixa de 1,53:1 a 3,37:1 é a mesma que a ROT-6 já registra para `--text-primary` sobre as categóricas.

**Quanto do intervalo fica nesse fundo** (conta sobre o `data.ts` da `v1`): Novos contratos, 70 de 160 mil; Expansão, 30 de 70 mil; Cancelamentos, 50 de 90 mil. Em cada passo, perto de metade do traço e uma das duas tampas.

**A isenção da ACE-3 não cobre.** Na `v1`, `v3` e `v4` o mínimo e o máximo do passo não estão escritos (só na dica). Na `v2` está escrita a amplitude, que é o comprimento, não a posição da tampa.

**O que se vê.** Ampliadas, as tampas internas se distinguem nas quatro versões. Na escala do PNG, a pior é a `v2` no escuro: sobre o corpo neutro a tampa se confunde com o corpo. O trecho que sobra visível em Expansão vai do topo do corpo à tampa de cima, 40 mil, ao lado do rótulo "amplitude R$ 70 mil"; em Cancelamentos sobram 40 mil visíveis abaixo do corpo, ao lado de "amplitude R$ 90 mil".

**O que mudar.** Dar ao trecho do intervalo que cruza o corpo um fundo próprio, que é a saída da TOK-10, e medir o resultado nos dois temas. Três caminhos, nenhum testado por mim:

1. **Trecho interno vazado em `--surface-raised`**, o resto em `--text-primary`. Pela conta sobre as cores medidas, `--surface-raised` contra os corpos dá 7,36, 5,50, 9,50 e 8,16:1 no escuro e 5,34, 6,36, 6,00 e 8,13:1 no claro.
2. **Halo na cor da superfície** por baixo do traço. Risco a conferir: o corpo de Expansão mede 6,99 px na `v1` e 6,26 px na `v2`, e uma tampa de 2 px com halo ocupa boa parte dele. Foi um halo que engoliu a ponta da coluna em `08/01`.
3. **Intervalo ao lado do corpo**, inteiro sobre o cartão.

Não é saída cobrir o traço com o corpo, como a caixa de `16/02`: aqui o trecho coberto termina na tampa que marca o mínimo ou o máximo, e cobri-lo apaga o dado.

## v1_receita-do-proximo-trimestre-em-faixa: reprovada, um bloqueante

### Bloqueante 1. Pergunta 20, ACE-3 (o comum, acima)

**No código.** `Chart.tsx:148` a `154`: o grupo do intervalo, `stroke="var(--text-primary)"`, pintado sobre o `rect` do corpo.

**No `preview.svg`.** Novos contratos: tampa interna em y=65,18, corpo de 55,39 a 76,37. Expansão: tampa em 52,59, corpo de 48,39 a 55,39. Cancelamentos: tampa em 51,19, corpo de 48,39 a 58,19.

**Nos PNGs.** Sobre `--positive`, 1,97:1 no escuro e 3,37:1 no claro. Sobre `--negative`, 2,64:1 e 2,82:1. Três dos quatro pares abaixo do piso.

### Para levar na mesma rodada (não bloqueiam)

Estão no README: a primeira frase da linha de leitura repete a faixa do subtítulo e da coluna; mínimo e máximo de cada passo só na dica.

## v2_onde-a-faixa-nasce: reprovada, um bloqueante

### Bloqueante 1. Pergunta 20, ACE-3 (o comum, acima)

**No código.** `Chart.tsx:161` a `167`.

**No `preview.svg`.** Novos contratos: tampa interna em y=84,55, corpo de 75,78 a 94,57. Expansão: tampa em 73,28, corpo de 69,52 a 75,78. Cancelamentos: tampa em 72,02, corpo de 69,52 a 78,29.

**Nos PNGs.** Sobre `--chart-1`, 1,53:1 no escuro e 2,99:1 no claro. Sobre `--text-secondary`, 1,78:1 e 2,21:1. Os quatro pares abaixo do piso, e são as menores razões do modelo. É a versão em que a consequência mais aparece, descrita no bloco comum.

### Medido à mão porque a guarda não mediu

A `OPACIDADE-MARCA` saiu `sem_opacidade_em_marca` nesta versão, mas a faixa de saída é um `rect` com `fillOpacity` de 0,7 em `--text-secondary` (`Chart.tsx:155`). Medido no PNG: 4,65:1 no escuro e 3,77:1 no claro contra o cartão. Passa.

### Para levar na mesma rodada (não bloqueiam)

Estão no README: a dica pinta amostras em `--positive`, `--negative` e `--chart-1` (`Chart.tsx:241`) enquanto as marcas são neutras; a anotação repete o fim da linha de leitura.

## v3_capacidade-contra-demanda-em-2027: reprovada, dois bloqueantes

### Bloqueante 1. Pergunta 20, ACE-3 (o comum, acima)

**No código.** `Chart.tsx:156` a `162`.

**No `preview.svg`.** Contratações: tampa interna em y=78,09, corpo de 61,05 a 119. Rampa: tampa em 67,86, corpo de 61,05 a 78,09. Atrito: tampa em 81,50, corpo de 78,09 a 91,73.

**Nos PNGs.** Os mesmos pares da `v1`: 1,97:1 e 3,37:1 sobre `--positive`, 2,64:1 e 2,82:1 sobre `--negative`.

### Bloqueante 2. Pergunta 15, seção 14.1 (acabamento com consequência no render: colisão de texto com marca)

**No código.** `Chart.tsx:180` e `183` somam 3 px à posição do bloco de rótulo (`labelY - LINE_STEP + 3` e `labelY + 3`). A linha de base de "entradas por mês" fica a 3 px do topo da marca, e não aos 6 px de `LABEL_GAP` das outras versões.

**Medido por varredura de pixels, igual nos dois temas.**

1. Contratações: o descendente do "p" de "por" ocupa as linhas 335 a 338 do PNG, e a tampa de cima do intervalo começa na 338. O texto entra uma linha na tampa: 0,5 px de sobreposição, sem vão nenhum.
2. Capacidade atual: o descendente termina na linha 488 e o corpo começa na 490. Uma linha livre, 0,5 px.
3. Rampa: descendente até a 372, corpo a partir da 374. Uma linha livre, 0,5 px.
4. Atrito: **não medido**. A janela da minha varredura caiu fora do rótulo. O código é o mesmo das outras três colunas.

**O que mudar.** Devolver respiro entre a linha da unidade e a marca nas quatro colunas e repetir a varredura. Um caminho, não testado: tirar o `+ 3` das duas linhas e somar a diferença a `MARGIN.top`.

### Para levar na mesma rodada (não bloqueiam)

1. A linha da demanda pinta por cima dos corpos, dos intervalos e da faixa: no `preview.svg` ela é o último elemento. O comentário em `Chart.tsx:274` diz o contrário. Aqui nenhuma marca fica partida; na `v4` fica, e a correção é a mesma.
2. "Cai a 86% da faixa" não diz de que ponta se conta.

## v4_cenario-acima-do-teto: reprovada, dois bloqueantes

### Bloqueante 1. Pergunta 20, ACE-3 (o comum, acima)

**No código.** `Chart.tsx:160` a `166`.

**No `preview.svg`.** Novos contratos: tampa interna em y=102,25, corpo de 86,69 a 128,19. Expansão: tampa em 76,31, corpo de 65,94 a 86,69. Cancelamentos: tampa em 71,125, corpo de 65,94 a 76,31.

**Nos PNGs.** Os mesmos pares da `v1`: 1,97:1 e 3,37:1 sobre `--positive`, 2,64:1 e 2,82:1 sobre `--negative`.

### Bloqueante 2. Perguntas 13 e 15, seção 14.1 (acabamento com consequência no render: marca partida), emenda de 2026-09-29 da REC-13

**O que se vê nos dois PNGs.** A tampa de cima do intervalo de Cancelamentos aparece em três pedaços, atravessada pelo tracejado do teto. Na escala do PNG lê como dois tracinhos claros dentro do corpo, não como tampa.

**Por que acontece.** O máximo do passo é −R$ 50 mil sobre R$ 2,15 mi, ou seja, R$ 2,10 mi, o valor exato do teto. No `preview.svg` a tampa e a linha do teto estão as duas em y=71,125, e a linha do teto é o último elemento desenhado: pinta depois das marcas.

**Medido por varredura de pixels, igual nos dois temas.** Nas linhas 392 a 395 do PNG, ao longo dos 28 px da tampa: 5 de traço, 6 de teto, 6 de traço, 6 de teto, 4 de traço. O tracejado cobre 12 dos 28 px e segue pelos dois lados por cima do corpo.

**No código.** O comentário em `Chart.tsx:273` afirma que a faixa e o traço do esperado pintam por cima da linha do teto. O render mostra o contrário, e a emenda da REC-13 explica: entre tipos de marca o Recharts pinta por `zIndex` (barra 300, linha 400), e a ordem no JSX não muda nada.

**O que mudar.** Fazer a linha do teto passar por baixo das marcas, de modo que a tampa de Cancelamentos saia inteira nos dois temas, e corrigir o comentário. O caminho que a REC-13 indica é `zIndex` explícito na `ReferenceLine`, abaixo do da barra. **Não executei**: não conferi se a versão instalada aceita a prop nesse componente. Conferir também depois da correção do bloqueante 1, porque o trecho interno do intervalo muda de desenho.

### Para levar na mesma rodada (não bloqueia)

"R$ 2,05 mi" (linha de base em y=34) e "acima do teto," (y=35,1) ficam na mesma linha, com 10 px de vão. Passa na ROT-9 e na guarda, mas lidos em sequência formam "R$ 2,05 mi acima do teto", o contrário do dado: o esperado está R$ 50 mil abaixo. A coincidência vem da altura da hachura neste dado.

## Registro pelo formato do checklist

```
Versão: 19_cascata-waterfall/05_cascata-com-faixa-de-cenario/v1_receita-do-proximo-trimestre-em-faixa
Data: 2026-10-06
Resultado: reprovada
Não: 20
Correções:
  20. ACE-3: dar fundo próprio ao trecho do intervalo que cruza o corpo, até 3:1 nos dois temas.
Não se aplica: 6, 26, 27, 28, 29, 31

Versão: 19_cascata-waterfall/05_cascata-com-faixa-de-cenario/v2_onde-a-faixa-nasce
Data: 2026-10-06
Resultado: reprovada
Não: 20
Correções:
  20. ACE-3: dar fundo próprio ao trecho do intervalo que cruza o corpo, até 3:1 nos dois temas.
Não se aplica: 6, 26, 27, 28, 29, 31

Versão: 19_cascata-waterfall/05_cascata-com-faixa-de-cenario/v3_capacidade-contra-demanda-em-2027
Data: 2026-10-06
Resultado: reprovada
Não: 15, 20
Correções:
  15. 14.1: afastar a linha da unidade da marca; hoje o "p" entra 0,5 px na tampa de Contratações.
  20. ACE-3: dar fundo próprio ao trecho do intervalo que cruza o corpo, até 3:1 nos dois temas.
Não se aplica: 6, 26, 27, 28, 29

Versão: 19_cascata-waterfall/05_cascata-com-faixa-de-cenario/v4_cenario-acima-do-teto
Data: 2026-10-06
Resultado: reprovada
Não: 13, 15, 20
Correções:
  13 e 15. REC-13, 14.1: linha do teto por baixo das marcas; hoje cobre 12 dos 28 px da tampa de Cancelamentos.
  20. ACE-3: dar fundo próprio ao trecho do intervalo que cruza o corpo, até 3:1 nos dois temas.
Não se aplica: 6, 26, 27, 28, 29
```
