# Densidade (KDE)

## O que é

Curva suave estimada a partir dos pontos, com kernel gaussiano calculado em TypeScript sobre uma
grade de 120 valores e banda de Silverman comum a todos os grupos. Responde a mesma pergunta do
histograma sem o degrau do bin: a largura do bin dá lugar à banda, e por isso a banda precisa
aparecer escrita no rodapé. A altura da curva é densidade relativa, com área 1, e não contagem; o
eixo Y some e a nota diz isso. Toda curva é recortada no mínimo e no máximo observados, e em zero
quando a métrica não pode ser negativa.

## Quando usar

- Forma suave de uma medida com amostra grande, a partir de umas 100 observações por curva.
- Sobrepor 2 a 4 grupos de forma parecida sem o borrão das barras sobrepostas.
- Muitas distribuições empilhadas em pouco espaço, em tiras com a densidade na cor.
- Marcar uma faixa de decisão e dizer que parte da área cai dentro dela.

## Quando evitar

- Menos de 30 observações: a curva inventa forma. Strip ou beeswarm (modelo 03), que é o que a `v4`
  faz com o grupo pequeno.
- Métrica com massa num valor, como 41% de zeros: histograma com o bin do zero separado (modelo 01).
- Grupos com n muito diferente e densidade normalizada, sem declarar a escala: declarar a
  normalização ou usar histograma comparativo (modelo 05).
- Muitos grupos com ordem natural, como mês a mês: ridgeline (modelo 08).
- Densidade de duas variáveis ao mesmo tempo: hexbin e contorno na família 09 (modelo 09).

## Anatomia

1. **Grade de 120 pontos**, de zero ao máximo observado quando a métrica é não negativa, ou do mínimo
   ao máximo. A curva não existe fora do observado.
2. **Banda de Silverman**: 0,9 vezes o menor entre o desvio e a amplitude interquartil sobre 1,34,
   vezes n elevado a menos um quinto. Nas versões com mais de um grupo ela sai da amostra reunida e
   é a mesma para todos.
3. **Área monotone** em `--chart-1` (um grupo) ou em `--chart-1` e `--chart-3` (dois), com contorno
   de 2 px e preenchimento leve. Sem eixo Y: a altura é relativa e a nota está no rodapé.
4. **Eixo X em reais ou dias**, com `formatCurrencyAxis` ou `formatDays` e tiques em intervalo
   redondo.
5. **Mediana em `ReferenceLine`** (`v1`), com `ifOverflow="extendDomain"` e o rótulo na margem
   superior reservada, fora da área.
6. **Região de cruzamento hachurada** (`v2`), desenhada com os hooks `useXAxisScale` e
   `usePlotArea` atrás das curvas, com a faixa de CPL escrita acima.
7. **Tiras de cor** (`v3`): um `rect` por célula da grade, cor de `--seq-5` a `--seq-7` (três degraus) por
   densidade relativa ao pico da própria tira, corte vazado na mediana.
8. **Regra de piso** (`v4`): 30 observações ou mais, curva; de 5 a 29, pontos individuais; abaixo
   de 5, só os valores escritos.
9. **Rodapé** com n, banda e a normalização, em `text-muted` de 11 px.

## Versões

- `v1_ticket-de-fechamento`: densidade do ticket de 208 negócios ganhos, com dois picos, mediana em
  referência e banda de R$ 8,2 mil no rodapé.
- `v2_cpl-de-dois-canais-sobrepostos`: CPL de busca e social em duas áreas sem pilha, com a região
  de cruzamento hachurada e a legenda com n e normalização.
- `v3_ciclo-por-executivo-em-faixas-de-cor`: 12 executivos em tiras de densidade, com duas tiras
  de amostra pequena hachuradas.
- `v4_amostra-curta-cai-para-pontos`: cinco segmentos na mesma régua, com curva, pontos e só texto
  conforme o n de cada um.

## Como colar no Farol

1. Copie a pasta da versão para `app/src/components/visuals/` e troque o `data` de teste por um
   array de números (uma observação por linha de origem, nunca a contagem já agregada). Quem estima
   a curva é o componente.
2. A banda e a grade moram no `Chart.tsx`, em constantes nomeadas. Se a métrica puder ser negativa,
   troque `NON_NEGATIVE` por falso.
3. Embrulhe em `VisualCard` com título e subtítulo; o estado vazio inline vira `EmptyState` ou
   `UnavailableState`, com o mesmo sentido.
4. A `v3` e a `v4` usam `viewBox` de 574 de largura, medida no corpo do preset de cartão. Se o
   cartão do Farol for mais estreito, o texto das tiras encolhe junto: confira o piso de 11 px.

## Referências

- Silverman, B. W. *Density Estimation for Statistics and Data Analysis*, 1986: regra da banda.
- Wilke, C. *Fundamentals of Data Visualization*, capítulo sobre distribuições: densidade contra
  histograma e o cuidado com a banda.
- Molde de código: `05_areas/01_area-simples/v1_entradas-mensais-de-leads` e
  `16_distribuicao/01_histograma/v1_ciclo-de-fechamento`.
- Sem pedido de formatador novo: todos os números saem de `@/lib/format`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05. A `v1` foi aprovada; `v2`, `v3` e `v4` voltam por um bloqueante cada, descritos
em `validation/revisao_16_distribuicao__06_densidade-kde_2026-10-05.md`. O que segue não reprova.

- `v1`, `v2`, `v3`, `v4`: a linha de leitura (`<p>`) tem número e não leva `tabular-nums` (TIP-1).
- `v1`, `v2`: os tiques do `XAxis` e os rótulos em SVG (mediana, faixa hachurada) não levam `font-display`; a `v3` e a `v4` levam.
- `v1`: o comentário do `data.ts` fala em plano completo "perto de R$ 68 mil" e a constante `FULL_MEAN` é 72 mil, como o `meta.json` diz.
- `v1`: a nota do `meta.json` diz que a guarda `OPACIDADE-MARCA` não enxerga a opacidade por constante, mas o `check` lista a versão como medida.
- `v1`, `v2`: este README diz "área 1", e a curva recortada no observado integra um pouco menos que 1 dentro do desenho.
- `v2`: a cor sai de `SERIES_COLORS[index]`, pela posição no array; um filtro que tire um canal troca a cor do outro (COR-3).
- `v2`: a curva da busca corre sobre a linha de base de R$ 300 a R$ 400, fora do que a busca observou, porque a grade é a da amostra reunida.
- `v2`: `tails[index] ?? 0` escreveria R$ 0 para quantil nulo; hoje a guarda de vazio impede o caso.
- `v2`: o preview difere da página em 0,77% (escuro) e 0,83% (claro), só no texto depois de "CPL"; é o kerning que o render já anuncia, não a peça.
- `v3`: vizinhos da rampa sequencial medem de 1,42 a 1,52:1 entre si; a cor entrega pico e extensão, não níveis finos (TOK-8).
- `v3`: a ordem por mediana crescente, com amostra pequena no fim, não está escrita em frase nenhuma do cartão (GEO-12).
- `v3`: a linha de `--line-subtle` sob cada tira lê como divisória entre itens (ESP-5).
- `v3`: o item 7 da Anatomia ainda diz "traço claro na mediana"; a peça desenha corte vazado.
- `v4`: segmento sem negócio some do desenho em silêncio, em vez de sair escrito como na `v3`.
- `v4`: o eixo vai a R$ 150 mil para um máximo perto de R$ 108 mil, e um terço da régua fica vazio.
- `v4`: a frase acessível começa por "Densidade do ticket", sem o tipo de gráfico (ACE-1).
- `v4`: banda nula com grupo grande deixa a linha da curva em branco, só com nome e n.

Segunda revisão de 2026-10-05, sobre os arquivos corrigidos. `v2`, `v3` e `v4` foram aprovadas: os três
bloqueantes do parecer anterior saíram. As observações acima seguem valendo, salvo a do item 7 da
Anatomia, que já diz corte vazado. O que segue é novo e não reprova.

- `v2`: o rodapé com o critério da hachura quebra em duas linhas e deixa "maior" sozinha na segunda; o corpo do gráfico fica com 100 px de altura (GEO-14). Texto mais curto devolve a linha.
- `v2`: a diferença entre preview e página segue acima de 0,5% e agora alcança o rodapé, que começa por "CPL"; é o kerning que o render anuncia, não a peça.
- `v2`: `formatInt(CROSSING_RATIO * 100)` seguido de `%` escrito à mão, no lugar de `formatPercent`.
- `v4`: no Varejo, 10 pares de centros ficam entre 4,00 e 5,83 px, com diâmetro de 6 px; os 22 pontos se contam, mas vizinhos se tocam em até 2 px. Cinco faixas em `POINT_H` de 24 dão passo de 4 px; `POINT_H` de 34 dá passo de 7 px e zera o toque.
- `v4`: o ponto mais baixo do Varejo passa 1 px da linha de base da linha dele.
- `v3`: os degraus medidos hoje contra o cartão são 3,72, 5,45 e 8,29 no claro e 4,89, 6,96 e 10,12 no escuro; o degrau de baixo no claro tem folga curta sobre o piso de 3:1.
