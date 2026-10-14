# Funil comparativo entre períodos ou segmentos

## O que é

O mesmo funil desenhado duas vezes lado a lado, sempre na mesma escala: barras agrupadas por
etapa quando são dois recortes, painéis pequenos com domínio comum quando são vários, ou um
funil espelhado num eixo central quando são exatamente dois lados opostos. A forma só responde
se a conversão mudou ou difere entre recortes quando a escala das duas metades é a mesma e o
visual diz isso; funil comparado em percentual sem mostrar o tamanho absoluto de cada lado
esconde que um dos dois pode valer um décimo do outro.

## Quando usar

* Trimestre contra trimestre ou mês contra mês, com as mesmas etapas nos dois períodos.
* Executivo contra executivo ou segmento contra segmento, em até 8 painéis numa grade.
* Duas populações lado a lado na mesma escala, com leitura etapa a etapa na borboleta.
* Achar em qual passagem a taxa de conversão mudou o suficiente para merecer atenção.

## Quando evitar

* Recortes de tamanho muito diferente comparados em volume cru: normalizar em percentual da
  entrada e escrever o modo no título, sempre com o tamanho absoluto de cada lado ao lado do
  percentual.
* Mais de dois recortes na borboleta: usar painéis pequenos.
* Evolução da taxa ao longo de muitos períodos: usar a família [04_linhas](../../04_linhas/).
* Recorte com menos de 10 oportunidades mostrado como taxa firme: esmaecer, esconder a taxa e
  avisar a amostra pequena.

## Anatomia

1. **Etapa no eixo de categoria**, sempre na ordem do processo, nunca ordenada por valor.
2. **Duas marcas por etapa**: o recorte em destaque em `--chart-1` sólido e o de comparação no
   mesmo tom translúcido (`fillOpacity`) ou em `--line-strong` neutro, nunca uma segunda cor
   categórica (COR-8).
3. **Valor absoluto escrito na ponta livre de cada marca**, por `formatInt`, com o rótulo ancorado
   em `x + width` (ROT-2), nunca no pixel de base que o Recharts devolve.
4. **Taxa quando a pergunta é conversão**, por `formatPercent`, sempre nomeando a base de
   comparação na mesma linha (NUM-4).
5. **Linha de referência** quando faz sentido: `ReferenceLine` na mediana do conjunto (painéis
   pequenos) ou no zero central (borboleta), com `ifOverflow="extendDomain"`.
6. **Domínio comum e fixo** entre os recortes comparados (EIX-9): nunca escala automática por
   painel, porque isso engana a comparação que o modelo existe para fazer.
7. **Estado de etapa inexistente** escrito como "não se aplica", nunca como zero (EIX-10), e
   estado de amostra pequena com o total absoluto sempre visível ao lado da taxa suprimida.

## Versões

* [`v1_trimestre-contra-trimestre`](./v1_trimestre-contra-trimestre/): barras agrupadas por etapa,
  trimestre atual contra o anterior, valor absoluto nos dois lados e a mesma escala declarada na
  leitura.
* [`v2_delta-de-taxa-acima-do-limiar`](./v2_delta-de-taxa-acima-do-limiar/): mesma base do v1 lida
  como taxa de passo; a única transição que varia acima do limiar de 5 pontos ganha seta
  triangular, cor semântica e a base nomeada na mesma linha.
* [`v3_executivos-em-paineis-pequenos`](./v3_executivos-em-paineis-pequenos/): grade 4 por 2 com
  oito executivos em percentual da entrada, ordenados pela conversão final, mediana do time como
  referência e o executivo de amostra pequena com a taxa oculta mas o `n` absoluto sempre visível.
* [`v4_borboleta-familia-contra-empresa`](./v4_borboleta-familia-contra-empresa/): funil espelhado
  num eixo central em zero, família à esquerda e empresa à direita, etapa sem dado escrita como
  não se aplica e linha de leitura na etapa em que a razão entre os lados inverte.

## Como colar no Farol

1. Escolha a versão pela pergunta: mudança contra um período anterior vai de `v1` ou `v2`;
   ranking de pessoas ou segmentos vai de `v3`; duas populações inteiras lado a lado vão de `v4`.
2. Ao ligar dado real, mantenha o domínio calculado a partir do **conjunto inteiro** que entra na
   comparação, nunca do recorte que a pessoa está olhando no momento: um filtro que troca só um
   dos lados sem recalcular o domínio comum quebra a leitura que o modelo promete.
3. Se o recorte que a página filtra puder ficar com menos de 10 casos, herde o limiar de amostra
   pequena do `v3` (`minReliableOpened`) em vez de publicar uma taxa que a base não sustenta.
4. `v2` e `v4` esperam etapas na mesma ordem nos dois lados; quando uma etapa não existe para um
   dos lados, passe `null` em vez de omitir a etapa ou zerar o valor.

## Referências

| Referência | O que observar |
|---|---|
| [Recharts, API Funnel](https://recharts.github.io/en-US/api/Funnel/) | Vários `Funnel` no mesmo `FunnelChart` como alternativa de comparação lado a lado. |
| [Apache ECharts, Funnel Compare](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-align.ts) | Quatro séries posicionadas para comparação; `funnelAlign` à esquerda e à direita para o espelhado. |
| [Storytelling with Data, #SWDchallenge funnel chart](https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart) | Magnitude diferente entre topo e fundo dificulta a leitura; motivo direto do aviso de amostra pequena do `v3`. |
| [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard) | Varredura de comparativos em painéis, usada como referência de composição para o `v3`. |

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-19, sobre os PNGs de conferência dos dois temas e o
`npm run check` das quatro versões (0 com erro, 1 aviso de espessura no `v3`). Nenhuma versão tem
bloqueante; os itens abaixo são nuance de acabamento e de redação._

* `v1`: o catálogo pedia a taxa de passo de cada período escrita ao lado da barra; a versão
  escreve só o volume absoluto e deixa a taxa para o `v2`. A leitura de volume fica completa, mas
  quem copiar o padrão precisa saber que a taxa não está aqui.
* `v1`: os rótulos das duas barras da mesma etapa ficam a 16 px entre âncoras, exatamente o piso
  da ROT-2; qualquer redução de altura do canvas os encosta um no outro.
* `v1` e `v4`: o rótulo é contagem solta (`420`, `236`), sem o substantivo que a NUM-6 pede; o
  substantivo só aparece na frase acessível e no subtítulo do cartão.
* `v2`: a barra do período anterior perde o rótulo na etapa que passa do limiar, e o valor só
  reaparece dentro da linha de variação; é a escolha certa contra a colisão, mas obriga o leitor a
  amarrar a barra sem rótulo ao número entre parênteses.
* `v2`: `formatPercentPoints` já imprime o sinal de porcentagem, então a linha sai como
  `−8,4% p.p.`; o par `% p.p.` é redundante e a base entre parênteses é o que desfaz a ambiguidade.
* `v2`: a frase acessível começa por "Só" a partir do maior desvio; com dado real em que duas
  transições passem do limiar, a palavra deixa de ser verdadeira.
* `v3`: o catálogo pede o painel de amostra pequena **esmaecido**; a versão esconde o funil inteiro
  e mantém apenas nome, `n` e aviso. O sentido é o mesmo, a forma não. Não mexido na correção de
  2026-09-18 (ver Pendências conhecidas).
* `v4`: o lado esquerdo nasce do zero e o rótulo é resolvido por `x + width`, mas falta o
  comentário de uma linha que a ROT-2 manda deixar ali para a próxima cópia não repetir a
  armadilha.
* `v4`: a linha de leitura afirma sempre que o lado direito "passa à frente"; se a inversão vier no
  outro sentido, a frase inverte o sujeito.
* `v2`: a origem do `% p.p.` está confirmada no Farol; `formatPercentPoints` só divide por 100 e
  chama `formatPercent`, então o símbolo já vem de lá e o `p.p.` escrito à mão dobra a unidade.
* `v2`: a frase acessível herda a mesma dobra ao dizer "acima de 5%" onde o limiar é de 5 pontos
  percentuais; segue compreensível, mas o número sai com a unidade trocada.
* `v3`: a mediana sai só dos painéis confiáveis, então "mediana do time" não inclui o Executivo H.
  Excluir amostra pequena da mediana é o certo; quem lê a frase não sabe que a exclusão houve.
* `v3`: a mediana tracejada não leva rótulo próprio em cada painel (ANO-3 pede nome e valor); a
  linha de leitura a nomeia uma vez para a grade inteira, o que evita repetir o texto sete vezes.
* `v3`: sete painéis escrevem a taxa final em peso 700, acima do teto de dois elementos da TIP-3
  lido ao pé da letra; em pequenos múltiplos, um destaque por painel é a leitura usual.
* `v4`: a inversão acontece duas vezes, em Proposta e de novo em Ganha, onde Família volta à
  frente com 19 contra 14; a linha de leitura nomeia só a primeira, e a segunda fica por conta das
  barras.
* `v4`: etapa sem dado entra no empilhamento como epsilon de 0,01 para o índice do `LabelList` não
  deslocar. A marca fica invisível e o texto escreve não se aplica, mas quem copiar o padrão
  precisa saber que existe um valor plotado ali, e não um nulo.

## Pendências conhecidas

- `v3`: correção de 2026-09-18 (ROT-7) deu halo ao rótulo da taxa final e trouxe o respiro para
  `VALUE_LABEL_GAP = 6` e a margem do painel para `PANEL_MARGIN`, ambos em constante nomeada no
  topo do arquivo; a mediana tracejada não corta mais o texto nos painéis abaixo dela. Resolvido
  nesta rodada.
- `v3`: o catálogo pede o painel de amostra pequena **esmaecido** e a versão esconde o funil
  inteiro; não é o problema bloqueante desta rodada e segue sem correção.

## Correção de 2026-09-28

**v3, a mediana do time nascia zero quando ninguém alcançava o mínimo de aberturas.** `median`
devolvia `0` para lista vazia, e a lista que alimenta a conta não é `data`, é a dos executivos
confiáveis: com todo mundo abaixo de 10 aberturas, `data` está cheia, a lista da conta está vazia, e
a peça escrevia "Tracejado: mediana do time, 0%" com a linha de referência colada na origem de cada
painel. Taxa de conversão de 0% é plausível, e o desenho afirmava que o time inteiro fecha nada.

O que mudou: `median` devolve `number | null` e a linha de leitura escreve "Mediana do time
indisponível: ninguém alcançou o mínimo de aberturas, e o tracejado não entra", sem desenhar a
`ReferenceLine`. Junto veio a conta vizinha que herdava o mesmo zero: a taxa final de quem não abriu
nada era `0` e agora é `null`, com os percentuais de etapa saindo de lista vazia em vez de saírem
zerados. Confiável passou a ser quem tem taxa calculável e passa do mínimo, nesta ordem, por um
único predicado de tipo usado nos dois lugares que decidiam isso em separado.

**Conserto de caminho latente:** dos 8 executivos publicados, 7 passam do mínimo, então a mediana
segue calculada e o desenho não mudou. O que se conserta é o ramo, não a foto.
