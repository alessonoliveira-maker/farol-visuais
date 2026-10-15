# Heatmap de correlação

## O que é

A matriz de medidas por medidas, com o coeficiente de correlação em cada cruzamento. Serve para uma
pergunta só, e é uma boa pergunta: o que anda junto com o quê. Num painel de mídia, é o visual que
separa o que move volume do que move resultado, e costuma ser desconfortável justamente por isso.

## Quando usar

- Exploração inicial de um conjunto de medidas, antes de escolher qual delas vira indicador.
- Mostrar que duas medidas são redundantes, e que acompanhar as duas é trabalho dobrado.
- Achar a relação negativa que ninguém procurava, que é onde o correlograma paga o espaço que ocupa.
- Comparar a estrutura de relações entre dois períodos, com duas matrizes na mesma escala.

## Quando evitar

- Mais de umas dez medidas: a matriz cresce ao quadrado e nenhuma célula cabe com número.
- Amostra curta: com menos de umas 12 observações o coeficiente oscila mais que o fenômeno.
- Quando a pergunta é a forma da relação, e não a força: aí é dispersão, família 09, que mostra curva,
  agrupamento e ponto fora.
- Público que vai ler correlação como causa sem a ressalva escrita na tela.

## Anatomia

1. **Triângulo inferior**, sem a metade de cima, que é a mesma informação espelhada, e sem a
   diagonal, que valeria sempre 1.
2. **Identificação das duas pontas**, e ela tem três saídas, porque a largura da célula raramente
   comporta o nome inteiro: nome nos dois eixos (v1 e v4), coluna numerada com o número repetido no
   rótulo da linha e a medida órfã num rótulo de canto (v2), ou nome na diagonal correndo para a
   direita, onde o triângulo inferior deixa espaço livre (v3). Nenhuma medida pode ficar sem nome.
3. **Codificação do coeficiente**, e ela depende do que cabe na célula: escala divergente contínua
   com o número escrito (v1), três faixas nomeadas com intervalo escrito (v2), área da marca com o
   sinal na forma (v3), ou cor só para o sinal com a força escrita (v4).
4. **Estados de célula que não são coeficiente**: menos de 12 pares sai hachurado, e variância zero
   sai vazada com o rótulo de ausência, nunca zero (v4).
5. **Número de observações**, na legenda quando é o mesmo para toda a matriz, e por célula quando a
   exclusão é por par.
6. **Legenda** com a régua de leitura, o método, o recorte de período e a ressalva de que correlação
   não é causa.

## Versões

- `v1_seis-medidas-de-midia`: seis medidas semanais sobre 52 semanas fechadas, com investimento
  colado em impressão e clique, fraco em lead qualificado, e a única relação forte e negativa entre
  lead qualificado e custo por lead qualificado. Escala divergente contínua, com o número em toda
  célula.
- `v2_pares-fortes-rotulados`: dez métricas para leitura executiva. Só as células acima de 0,70 em
  módulo levam número e anel; o resto fica em três faixas nomeadas, com o intervalo escrito, porque
  sem número na célula a cor não sustenta mais de dois níveis. A relação que a diretoria espera forte
  e que não aparece leva anel tracejado.
- `v3_catorze-medidas-em-blocos`: catorze medidas em três blocos separados por espaço, sobre a
  variação semana a semana. A força vai na área da marca e o sinal na forma dela, círculo contra
  losango de área igual, e o nome de cada medida mora na diagonal.
- `v4_pares-insuficientes-e-nao-calculavel`: par com menos de 12 observações hachurado, com o n
  escrito e o coeficiente não desenhado, e medida constante no período com o coeficiente indefinido,
  que sai como ausência escrita e nunca como zero. O n vai em toda célula, porque a exclusão é por
  par.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/CorrelationHeatmap/`.
2. O `data` é o triângulo inferior, linha a linha: a linha `i` traz as colunas de `0` a `i - 1`. A
   primeira medida não abre linha e a última não abre coluna, e é isso que dá a forma. Na v4 a célula
   não é um número e sim um par, coeficiente e número de pares, porque a exclusão é por par.
3. O coeficiente é calculado no seletor da página, não aqui, e o método fica declarado na legenda.
   Pearson mede relação linear; se a suspeita for de relação monótona mas curva, é Spearman, e o
   texto da legenda precisa mudar junto.
4. `observations` não é enfeite: é o que permite ao leitor descontar o coeficiente. Página que não
   consegue informar o n não deveria publicar a matriz.
5. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [seaborn, correlation matrix com máscara triangular](https://seaborn.pydata.org/examples/many_pairwise_correlations.html): observar a máscara do triângulo superior e a escala divergente centrada.
- Catálogo: [From Data to Viz, correlograma](https://www.data-to-viz.com/graph/correlogram.html): observar o limite prático de medidas e os erros de paleta.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): observar a diferença entre escala contínua e faixas na leitura de valor.

## Correção de 2026-09-28

**v1, a matriz comparava seis medidas e nomeava cinco (GEO-13).** O triângulo inferior descarta a
primeira linha e a última coluna, então rotular as linhas pelo nome e as colunas pelo número
funcionava para todas as medidas menos uma: a que só existe como coluna. A medida 1, Investimento,
não tinha nome em lugar nenhum do cartão, nos dois temas, e é justamente a que o subtítulo pergunta.

O que mudou: os dois eixos levam o nome da medida e nenhum leva número. Para o nome caber, a célula
foi de 62 px para 70 px de largura e a coluna da esquerda encolheu de 124 px para 104 px, já que os
rótulos de linha perderam o número da frente; o cabeçalho ganhou altura para duas linhas, que é o que
`Leads qualificados` precisa. A quebra é por palavra inteira, decidida por uma constante de largura
média de caractere medida no próprio preview, porque SVG puro não mede texto e reticência é proibida
em nome de marca (TIP-7). A proporção do desenho praticamente não mudou, de 1,60 para 1,59, então o
tamanho renderizado no canvas quadrado é o mesmo.

## Leva de 2026-09-29, e o que as três irmãs decidiram junto

**O `viewBox` vai na altura do PIOR caso de cabeçalho, não na do caso provável.** O corpo do cartão
tem duas alturas, porque o caso de uso quebra em até duas linhas, e a diferença é de 16,5 px. Como
`xMidYMid meet` escala pela menor das duas razões, um `viewBox` na altura de duas linhas sai em
escala 1 nas duas situações, e a peça para de depender de uma contagem de caracteres que a próxima
emenda de texto muda. É o que separa as três irmãs da v1, que está na fila de dívida da
`TAMANHO-TEXTO` por declarar 11 px e entregar 10,05 px, com a escala em 0,91.

**Os polos são `--chart-1` e `--chart-5`, e não `--positive` com `--negative`.** Correlação negativa
não é resultado ruim, e verde ao lado de vermelho faz a matriz parecer um placar. Os dois slots foram
escolhidos por oposição de matiz, ciano contra magenta, e não pela ordem da COR-8, porque aqui a cor
carrega SINAL e não identidade de categoria. Opacos contra o cartão medem 9,50:1 e 6,00:1, e 5,90:1 e
6,25:1, os dois acima do piso de marca de 3:1 nos dois temas.

**Texto dentro de marca semitransparente não fecha o piso de texto.** O vazado em `--surface-raised`
sobre `--chart-1` composto a 0,72 mede 5,49:1 no escuro e **3,38:1 no claro**, abaixo dos 4,5:1 da
ACE-3, embora passe o piso de 3:1 de MARCA. Por isso a faixa moderada da v2 leva o sinal numa seta,
que é marca, e não num sinal escrito.

**A GEO-13 tem três saídas, e as quatro versões usam três delas.** Nome nos dois eixos, número na
coluna com a correspondência escrita no rótulo da linha, e nome na diagonal. A escolha é de geometria:
o nome inteiro cabe na largura da célula, cabe na diagonal, ou não cabe em lugar nenhum.

## Pendências

**v1 escreve o sinal de menos com hífen.** `v1_seis-medidas-de-midia/Chart.tsx:175`
(`{formatDecimal(value, 2)}`) e `:188` (`{formatDecimal(-1, 2)}`) mandam o valor negativo direto ao
formatador, e o `Intl` pt-BR devolve U+002D. Medido no `preview.svg` da v1: quatro coeficientes e o
degrau de menos 1 da legenda saem com hífen, e o arquivo não tem uma ocorrência de U+2212. A seção 8
do contrato e a NUM-3 pedem o sinal tipográfico, e nenhuma guarda do `check` mede isso, então a v1
passa verde. O conserto é o mesmo das três irmãs: `${value < 0 ? '−' : ''}` sobre
`formatDecimal(Math.abs(value), 2)`.

## Observações da revisão (não bloqueantes)

**2026-10-05, revisão independente das quatro versões.** A v1 voltou reprovada por dois bloqueantes
(vazio sem bloco `role="status"`, EST-1, e texto do SVG em 10,05 px, TIP-2), descritos em
`validation/revisao_15_mapa-de-calor-e-calendario__08_heatmap-de-correlacao_2026-10-05.md`. O que
segue não reprova, e quem tocar o arquivo acerta de passagem.

- v1: a pendência do sinal de menos, registrada acima, está quitada sem mudança no Chart. O
  `formatDecimal` passou a devolver U+2212, e o preview de hoje traz os quatro coeficientes negativos e
  o degrau da legenda com o sinal tipográfico.
- v1: o `notes` do `meta.json` ainda diz que o texto vira `--surface-sunken` acima de 0,50 em módulo.
  O Chart de hoje não escolhe cor pelo valor, assenta o número numa pastilha. Reescrever a nota.
- v1: a frase acessível começa por "Correlação entre" e não pelo tipo do gráfico (ACE-1). As irmãs
  começam por "Matriz de correlação".
- v1: os polos são `--positive` e `--negative`, saída que a TOK-3 aceita, enquanto as três irmãs usam
  `--chart-1` e `--chart-5` pelo motivo escrito na leva de 2026-09-29. Alinhar quando a peça for
  redesenhada em escala 1.
- v1: a régua da legenda é um `linear-gradient` em sRGB e a célula é `color-mix` em oklab, então o
  meio da régua não reproduz exatamente a cor da célula de mesmo valor. Sem consequência de leitura,
  porque o número está escrito em toda célula.
- v1, v2 e v3: o catálogo pede o n do par ou o valor exato na dica, e nenhuma versão tem dica. Na v1 e
  na v2 o que importa já está escrito; na v3 o valor exato de cada par não existe em lugar nenhum da
  tela, só a área contra a régua de três degraus.
- v2: a amostra da legenda fica a 4 px do anel da última linha da matriz, menos que o vão de 5 px
  entre células, então a legenda parece colada na linha `10 Custo por lead`. A metade direita do
  canvas está livre e comporta a legenda ao lado.
- v2: `0,70 ou mais: sentido contrário` e `0,30 a 0,69` são intervalos em módulo, e a legenda não diz
  "em módulo".
- v2 e v4: o comentário de `signed` e o `notes` dizem que `formatDecimal` devolve hífen em número
  negativo. Deixou de ser verdade; o sinal à mão segue correto e pode ficar.
- v3: a linha da régua de tamanho fica a 27 px da última linha da matriz, o mesmo passo de 28 px das
  linhas de dado, com amostras na mesma forma e cor das marcas. Um vão igual ao de bloco ou maior
  separaria a legenda do dado.
- v3: 2,8 px entre a borda do maior círculo da régua e o rótulo `0,94`. Não encosta, mas é o ponto
  mais apertado da peça.
- v4: a palavra de ausência mede 61,1 px numa célula de 64 px, e no PNG sobram 2 px de cada lado
  entre a tinta e o contorno tracejado, distância de entreletra. Lê inteira nos dois temas; um
  contorno 2 px para fora ou a coluna de rótulos mais estreita daria folga.
- v4: o Chart e o `meta.json` dizem que o n vai em toda célula, e as cinco células de variância zero
  não escrevem o n. Ajustar o texto ou escrever o n.
- v4: a célula de ausência não leva o ícone `Unplug` da EST-2, desvio declarado no `notes` por falta
  de largura.

**2026-10-15, segunda passada da v1, depois da segunda rodada de correção.** A v1 foi aprovada: o
vazio virou bloco `role="status"` com `Filter` e sem régua, e o `svg` sai em escala 1 (viewBox de
422 x 290 num corpo de 422 x 328), com os 14 textos de 11 px e os 15 números de 12 px medidos no
preview. Ficam quitados dois itens de 2026-10-05: o `notes` não fala mais em limiar de 0,50 e a frase
acessível começa por "Matriz de correlação". O que segue não reprova.

- v1: a chave `TAMANHO-TEXTO` da v1 em `_render/scripts/lib/divida-guardas.json` ficou órfã; o
  `check` avisa que a guarda mede e não acusa mais nada. Quem fecha a rodada apaga a chave, que é
  arquivo da ferramenta e não do revisor.
- v1: o comentário de `CHAR_W` ainda cita "84 px para os 17 caracteres de CPL qualificado com o número
  na frente", medida do desenho antigo de coluna numerada. E o `HEAD_CHARS` promete 5 px de respiro
  que `Investimento`, palavra única de 12 caracteres, não cumpre: a tinta ocupa os 67 px da célula e
  fica a cerca de 6 px de `Impressões`. Lê como dois nomes, mas é o par mais justo do cabeçalho.
- v1: o cabeçalho assenta a 5 px da célula (`TOP_H - 5`) e a célula tem 67 px, fora do múltiplo de 2
  da ESP-1; `ROW_CHARS` é escrito à mão em vez de sair de `LEFT_W` e `CHAR_W`; `CHIP_W` e `CHIP_H`
  ficam depois das funções, longe das outras constantes. Nada disso aparece no preview.
- v1: os nomes e a contagem da frase acessível vêm de `MEASURES`, constante do módulo, e não do
  `data`; uma matriz de outro tamanho passada por prop herda nomes e "6 medidas" errados. As medidas
  deviam viajar com o dado. A frase também diz o par mais forte e o mais fraco da matriz, mas não a
  resposta do caso de uso (investimento com leads qualificados, 0,21).
- v1: os números abaixo de 0,60 não declaram peso e pedem 400 ao Space Grotesk, que só tem 500 a 700
  carregados (TIP-4); o navegador cai no 500, como nas irmãs, e a diferença para o 600 do par forte
  fica sutil. O `meta.json` diz "acima de 0,60" e o código usa maior ou igual.
- v1: o catálogo descreve "diagonal com o nome", "texto com contraste por faixa" e "Pearson no
  subtítulo e n na dica"; a peça nomeia nos dois eixos, assenta o número em pastilha e declara método
  e n na legenda. São substitutos com o mesmo efeito, documentados na Anatomia; vale alinhar o texto
  do catálogo ao que a peça faz.
- README: a seção `Correção de 2026-10-15 (v1)` entrou depois desta, que deveria ser a última.

## Correção de 2026-10-15 (v1)

- EST-1: com `data` vazio a v1 devolve um bloco `role="status"` com ícone `Filter` e a frase de
  ausência, sem régua nem legenda, como as irmãs.
- TIP-2 e GEO-18: o `viewBox` passou de 462 x 290 para 422 x 290, a largura do corpo medido no
  preview, e a escala sai 1: os textos de 11 px chegam em 11 px. Para caber, a célula ficou em 67 px, a
  coluna da esquerda em 79 px e os rótulos de linha quebram em até duas linhas por palavra inteira.
- A frase acessível passou a começar por "Matriz de correlação" (ACE-1) e o `notes` do `meta.json` não
  fala mais em limiar de 0,50.
- Os polos seguem `--positive` e `--negative`, saída aceita pela TOK-3; as irmãs usam `--chart-1` e
  `--chart-5`, e a v1 não foi alinhada nesta rodada.
