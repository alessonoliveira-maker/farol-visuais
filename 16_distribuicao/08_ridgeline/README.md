# Ridgeline

## O que é

Uma densidade por grupo, deslocada na vertical e sobreposta em 40% da altura à vizinha, todas na mesma
régua horizontal. Cada faixa é um path de SVG puro, com kernel gaussiano calculado em TypeScript sobre
uma grade de 120 valores e banda de Silverman comum a todas as faixas. A altura é normalizada pelo pico
global, com piso de 8% para a faixa mais baixa, e a nota no rodapé diz isso. O preenchimento é opaco,
com contorno na cor do cartão para separar as faixas, e a faixa de cima é desenhada primeiro. Lê-se de
cima para baixo: a posição horizontal dá o valor, a largura dá a dispersão e o corte vazado dá a
mediana.

## Quando usar

- De 6 a umas 30 distribuições da mesma métrica, em ordem cronológica ou por mediana.
- Ver se a forma muda ao longo do tempo: ciclo encurtando, CPL ficando mais caro mês a mês.
- Destacar um grupo contra o conjunto, com as demais faixas em neutro.
- Cada faixa com 30 observações ou mais; abaixo disso a faixa perde a curva.

## Quando evitar

- Dois ou três grupos: densidades sobrepostas ou histograma comparativo (modelos 06 e 05).
- Leitura de valor exato ou de volume por grupo: box plot com pontos (modelo 02) ou pequenos múltiplos
  (modelo 01).
- Faixas feitas de histograma: as barras de faixas diferentes se alinham de forma confusa.
- Percentis ao longo do tempo como mensagem principal: faixa em área na família 05.

## Anatomia

1. **Faixa**: path fechado em `--chart-1` (ou `--line-strong` no neutro da `v2`), com contorno de 1,5 px
   em `--surface-raised`. Desenhada de cima para baixo, a de baixo à frente.
2. **Passo vertical**: altura do pico vezes 0,6, da sobreposição de 40%. A altura vem do pico global,
   com piso de 8%.
3. **Rótulo à esquerda**: mês ou nome em `--text-secondary` de 11 px, e n em `--text-muted` com
   `formatInt`. Na `v3` só a cada três faixas.
4. **Mediana**: corte de 2 px em `--surface-raised` sobre a faixa; na `v2` também escrita à direita com
   `formatDays`.
5. **Eixo X único** embaixo, com `formatDays` ou `formatCurrencyAxis`, e grade vertical em
   `--line-subtle`.
6. **Regra de piso** (`v1`, `v3`, `v4`): 30 observações ou mais, curva; menos disso, um traço por
   observação com `amostra pequena` escrito; lista vazia, linha pontilhada com `sem campanha` (`v4`).
7. **Rodapé** em `--text-muted` de 11 px com a normalização, o piso, a banda comum e a leitura do corte.
8. **Dica** (`v3`): SVG dentro do viewBox, com mês, n de campanhas e mediana.

## Versões

- `v1_ciclo-mes-a-mes`: 12 meses do ciclo de fechamento, com a mediana caindo e a cauda encolhendo.
- `v2_executivo-em-foco`: 12 executivos por mediana crescente, em neutro, com um aceso em ciano e a
  mediana de todos escrita à direita.
- `v3_cpl-por-campanha-em-18-meses`: 18 faixas de CPL, rótulo a cada três meses, mediana em traço fino e
  dica por faixa.
- `v4_mes-sem-campanha`: mês sem campanha em linha pontilhada e mês de 11 campanhas em traços, com a
  ordem cronológica mantida.

## Como colar no Farol

1. Copie a pasta da versão para `app/src/components/visuals/` e troque o `data` de teste por um array
   de números por faixa (uma observação por linha de origem, nunca a contagem já agregada). Quem estima
   a curva é o componente.
2. A banda, a grade e as constantes de passo moram no `Chart.tsx`. Se a métrica puder ser negativa,
   ajuste o domínio: hoje a régua começa em zero.
3. Na `v2`, ligue a prop `highlightId` ao filtro da página; a ordem e a escala não mudam com ele.
4. Embrulhe em `VisualCard` com título e subtítulo; o estado vazio inline vira `EmptyState` ou
   `UnavailableState`, com o mesmo sentido.
5. As quatro versões usam `viewBox` de 574 de largura, medida no corpo do preset de cartão. Se o cartão
   do Farol for mais estreito, o texto encolhe junto: confira o piso de 11 px.

## Referências

- Wilke, C. *Fundamentals of Data Visualization*, capítulo sobre distribuições: ridgeline plots e o
  cuidado com a banda comum.
- Silverman, B. W. *Density Estimation for Statistics and Data Analysis*, 1986: regra da banda.
- Molde de código: `16_distribuicao/06_densidade-kde/v3_ciclo-por-executivo-em-faixas-de-cor`.
- Sem pedido de formatador novo: todos os números saem de `@/lib/format`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05. A `v1`, a `v2` e a `v3` foram aprovadas; a `v4` volta por um bloqueante, descrito
em `validation/revisao_16_distribuicao__08_ridgeline_2026-10-05.md`. O que segue não reprova.

- `v1`, `v2`, `v3`, `v4`: a linha de leitura e o rodapé (`<p>`) têm número e não levam `tabular-nums`; o rótulo de mês em SVG (`jan/26`) não leva `font-display` (TIP-1). Sem consequência visível.
- `v1`, `v2`, `v3`, `v4`: a curva é recortada no mínimo e no máximo observados, e por isso nasce em parede vertical (em `dez/26` da `v1` a parede tem 44% do pico). É a mesma convenção aceita no modelo 06; este README não a declara em "O que é".
- `v1`, `v3`, `v4`: cauda feita de uma só observação tem menos de 2 px de altura e o contorno de 1,5 px na cor do cartão come quase tudo (`jun/26` e `ago/26` da `v1`, `jun/26` da `v3`). O extremo do mês quase não se vê; vale contorno só no topo da curva ou um ponto no máximo observado.
- `v1`, `v2`, `v3`: o ramo de amostra pequena (menos de 30) existe no código e nenhum dado o exercita; ele herda o defeito que reprovou a `v4` (traço coberto pela faixa seguinte) e deve receber a mesma correção.
- `v1`, `v2`, `v3`, `v4`: o `demonstrates` do `meta.json` diverge do texto do catálogo na ordem de desenho (o catálogo escreve de dezembro para janeiro; aqui a faixa de cima é desenhada primeiro e a de baixo fica à frente). O desvio está declarado nas notas e o desenho é o convencional; falta o dono alinhar o catálogo.
- `v1`: sobram cerca de 40 px vazios entre o eixo e o rodapé no preset `alto`; `PEAK_H` pode crescer.
- `v1`, `v4`: o `n` à esquerda não diz de quê no desenho parado (negócios, campanhas); só a frase acessível diz.
- `v2`: as faixas neutras em `--line-strong` medem 1,79:1 no escuro e 1,83:1 no claro contra o cartão, abaixo de 3:1 (aviso `CONTRASTE-MARCA` do check, TOK-5). Aceito pela isenção do neutro com valor escrito, porque toda faixa traz mediana e `n`, e a forma se lê nos dois PNGs; o catálogo pede esse token. Se o Farol ganhar um neutro de marca acima de 3:1, trocar.
- `v2`: o corte da mediana em `--surface-raised` sobre `--line-strong` fica fraco no tema claro (o mesmo 1,83:1); o valor está escrito à direita, então não se perde.
- `v2`: o catálogo pede a mediana do executivo em foco marcada; a versão escreve a de todos e destaca a do foco. É mais do que o pedido, e o `demonstrates` foi reescrito para dizer isso.
- `v3`: o `n` de cada mês só existe na dica e o total só na frase acessível; no desenho parado não há volume nenhum. Uma frase no rodapé com a faixa de `n` (de 31 a 68 campanhas por mês) resolve (DIC-1).
- `v3`: com rótulo a cada três faixas, a última (`set/26`, o mês mais recente e citado na linha de leitura) fica sem rótulo; vale rotular sempre a última.
- `v3`, `v4`: a linha de leitura e o rodapé escrevem centavo (`R$ 40,40`, banda de `R$ 5,44`); a NUM-1 guarda o centavo para tabela de detalhe. Em CPL o centavo é defensável.
- `v3`: a dica fica fixa no canto direito do desenho e pode cobrir a cauda das faixas de 2026; não aparece no preview.
- `v3`, `v4`: a função `px` e o comentário de `MIN_CURVE_SAMPLE` ainda falam em dias e em negócio, herdados da `v1`; o dado é em reais e por campanha. Na `v4`, a linha 223 do `Chart.tsx` está com a indentação quebrada.
- `v1`, `v2`, `v3`: o ramo de amostra pequena ainda desenha os traços dentro do `<g>` da linha, sem a passada à frente da `v4`; nenhum dado atual o exercita.

Segunda revisão de 2026-10-05, só da `v4`, sobre o arquivo corrigido. A `v4` foi aprovada: o bloqueante anterior está resolvido, com os 11 traços de `abr/26` inteiros (12 px, de y 66,4 a y 78,4) à frente da curva de `mai/26` e separados dela por apoio de 3,5 px na cor do cartão, nos dois temas. O que segue não reprova.

- `v4`: o halo do rótulo `sem campanha` (descendente do `p`) apaga um ponto da linha pontilhada de `mar/26`, perto de R$ 25, e deixa um resíduo; é 1 ponto em cerca de 73 e a linha continua lida como pontilhada contínua (pergunta 31, ROT-7 marca fina). Subir o rótulo 2 px (`base - 9`) resolve sem tocar no halo.
- `v4`: o halo de `amostra pequena` encosta na linha de base de `abr/26` nos descendentes de `p` e `q`; a linha é estrutura em `--line-subtle`, não dado.
- `v4`: o apoio na cor do cartão abre entalhes de 3,5 px na silhueta de `mai/26` onde 4 traços passam por cima dela. É o preço da separação e se lê como traço à frente; com muitos traços sobre o pico da vizinha a silhueta ficaria serrilhada.
- `v4`: traços a menos de 2,5 px um do outro ficam com vão abaixo de 1 px (R$ 54,50 e R$ 55,60 estão a 2,4 px, vão de 0,9 px, ainda distintos no PNG); dois CPLs a menos de R$ 0,70 se fundiriam e a contagem de traços deixaria de bater com o `n` escrito. Depende do dado.
- `v4`: a pontilhada e o texto `sem campanha` agora ficam à frente de uma eventual curva do mês seguinte, mas o texto em `--text-muted` sobre `--chart-1` teria só o halo de 1,5 px como fundo; nenhum dado atual exercita esse cruzamento.
- `v4`: as notas do `meta.json` não descrevem a passada da frente nem o apoio dos traços; a indentação quebrada do `Chart.tsx` agora está na linha 183.
