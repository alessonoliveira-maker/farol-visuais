# Barras agrupadas

## O que é

Duas ou três barras lado a lado por categoria, uma por série, todas partindo do zero, com cor fixa por série e legenda na ordem das barras. Vários `Bar` sem `stackId` dentro do mesmo `BarChart`: `barGap` controla o respiro dentro do grupo e `barCategoryGap` o respiro entre grupos. A leitura piora a cada série acrescentada, então o modelo para em três. O grupo absorve as barras paralelas por dimensão, que são a saída cartesiana do radar comparativo (entidade contra referência em cada dimensão, na mesma escala), e os pequenos múltiplos de barras por métrica, que resolvem o caso em que as métricas têm unidades diferentes e não cabem num eixo comum.

## Quando usar

- Comparar 2 ou 3 séries dentro de cada categoria: marcadas e realizadas, entidade e média do time, mês atual e meses anteriores.
- De 3 a cerca de 8 categorias; acima disso o grupo afina demais e a leitura vira ruído.
- Perfil de uma entidade contra uma referência em várias dimensões na mesma escala, no lugar de um radar.
- Várias métricas de unidades diferentes para as mesmas entidades, em pequenos múltiplos com eixo próprio por painel.

## Quando evitar

- Mais de 3 séries por categoria: pequenos múltiplos (`v4_pequenos-multiplos-por-metrica` deste modelo) ou linhas (`04_linhas`).
- A pergunta é a mudança entre dois momentos: dumbbell ou slope (`17_comparacao-de-pontos`).
- A soma das séries é o assunto: barras empilhadas (`03_barras-empilhadas`).
- Realizado contra uma referência na mesma banda: barras contra meta (`05_barras-contra-meta`).
- Poucos números que o leitor precisa ler exatos: tabela (`14_tabelas-visuais`).

## Anatomia

1. Eixo de categoria à esquerda com o nome completo (`YAxis type="category"`); nenhuma categoria some por reticência (TIP-7).
2. Duas ou três barras por categoria, cor fixa por série (nunca por posição no array), com `barGap` pequeno dentro do grupo e `barCategoryGap` de 28% a 34% entre grupos (ESP-2).
   O passo de cada categoria é derivado, nunca arbitrado: `ROW_STEP = (espessura × séries + barGap × (séries − 1)) / (1 − 2 × barCategoryGap)` (ESP-6). Como o grupo divide a banda entre as séries e ainda desconta o `barGap`, a espessura cai rápido com a densidade de categorias; quando ela ameaça o piso de 12 px, quem cede é a altura do canvas, nunca a barra nem a lista de categorias (ESP-2). É por isso que `v1` e `v2` declaram o canvas por número em vez de usar o preset.
3. Rótulo direto de valor na ponta de cada barra pelos formatadores do Farol; com o valor escrito, o eixo de valor some e não há grade (ROT-2, EIX-3).
4. Legenda no topo, na ordem das barras, com amostra quadrada na cor da série (ROT-4).
5. Ausência tratada por regra: valor nulo não desenha barra (fica em 0 px de comprimento) e o rótulo escreve `formatUnavailable()` no lugar do número, nunca zero (EIX-10, EST-2).
6. Quando a comparação é uma progressão no tempo (três meses, por exemplo), a cor por série usa a rampa sequencial `--seq-*`, do tom mais fraco ao mais forte, porque os meses têm ordem, não são categorias soltas (17.2, Sequencial).
7. Quando um valor à parte (uma lacuna, uma pontuação) precisa acompanhar cada categoria, uma coluna em HTML ao lado do `BarChart` usa uma grade CSS de N linhas iguais dentro do mesmo pai de altura cheia, sem medir o DOM: como as duas dividem o mesmo container e a mesma contagem de linhas, alinham por aritmética.
8. Recorte sem linhas troca o gráfico inteiro por um bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_agendas-marcadas-e-realizadas`: agendas marcadas e realizadas por canal de entrada. Demonstra o caso básico do modelo: dois `Bar` sem `stackId` com `barGap` e `barCategoryGap` explícitos, canais ordenados pela série principal (marcadas, não a soma), legenda no topo na ordem das barras e uma linha de leitura com o canal de menor taxa de realização. Canvas declarado por número, 640 x 640, com `ROW_STEP = 76` px por canal: é o que faz a marca entregar os 14 px do `BAR_MAX` e deixa 16 px entre as âncoras dos dois rótulos do par, o piso da ROT-2.
- `v2_executivo-contra-media-por-dimensao`: a nota do Executivo 07 contra a média do time em seis dimensões de 0 a 100 pontos. Demonstra as barras paralelas por dimensão numa escala comum, entidade em cor de destaque e referência em neutro na mesma banda, dimensões ordenadas da maior lacuna negativa à maior positiva, e a lacuna escrita numa coluna HTML alinhada às bandas do Recharts sem medir o DOM. Canvas declarado por número, 640 x 700, com `ROW_STEP = 90` px por dimensão: com `BAR_GAP = 8` e vão de 32%, é o passo que a ESP-6 exige para a marca alcançar o piso de 12 px da ESP-2.
- `v3_leads-por-origem-em-tres-meses`: leads por origem em três meses fechados. Demonstra três séries por origem com o mês mais recente na cor forte da rampa sequencial e os anteriores em tons mais fracos, origens ordenadas pelo mês mais recente, origem sem coleta no início do período escrevendo indisponível no lugar da barra, e uma linha de leitura com a maior queda desde o primeiro mês.
- `v4_pequenos-multiplos-por-metrica`: cinco métricas de mídia paga por plataforma. Demonstra um `BarChart` por métrica com domínio e formato próprios (moeda ou percentual), as mesmas plataformas na mesma ordem em todos os painéis, a plataforma selecionada em destaque em todos eles, o painel de custo por lead avisando que menor é melhor sem inverter o eixo, e a métrica não medida escrevendo indisponível no lugar da barra.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para uma pasta de visual da página, por exemplo `app/src/pages/<pagina>/visuals/DimensionGapBars/`.
2. Troque o `import` do `./data` pelo seletor real da página e passe `data` (e `entityLabel`, `highlightId`, `months` ou o que a versão expuser) pelas props; o default do `data.ts` fica só como amostra do catálogo.
3. Ponha o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">` ou maior, seguindo o `canvas` sugerido) ou passe `height`.
4. Em `v2` e `v4`, a coluna HTML ao lado do `BarChart` (ou dos painéis) depende de compartilhar o mesmo pai de altura cheia com margem zero no `BarChart`; não envolva só o gráfico numa altura fixa separada, ou o alinhamento por grade quebra.
5. Se a versão tratar estado vazio ou indisponível inline, troque pelo `EmptyState`/`UnavailableState` do Farol mantendo o mesmo texto (seção 16 do CONTRATO).
6. Rode `npm run typecheck` e `npm run lint` no `app/` e confira nos dois temas e a 390 px de largura.

## Referências

- [Data Viz Catalogue, Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html): alerta de legibilidade com muitas barras por grupo, a razão do teto de três séries.
- [Vega Lite, barras agrupadas](https://vega.github.io/vega-lite/examples/bar_grouped.html): `xOffset` como canal de agrupamento.
- [Nightingale, Beyond the Bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): dumbbell e slope como alternativas ao agrupado quando a pergunta é mudança entre dois momentos.
- [Tufte, cancer survival rates: tables, slopegraphs, barcharts](https://www.edwardtufte.com/notebook/cancer-survival-rates-tables-slopegraphs-barcharts/): a crítica a barras agrupadas de baixa densidade e a defesa da tabela para poucos números.
- [AG Charts, bar series](https://www.ag-grid.com/charts/react/bar-series/): grupos, pilhas, normalização e `stackGroup` num só tipo de série.
- Farol: `app/src/components/visuals/charts/BarsChart.tsx` (o wrapper de barras do Farol, referência de props e tema).

## Observações da revisão (não bloqueantes)

- `v1_agendas-marcadas-e-realizadas`: os dois rótulos de valor do par ficavam a poucos pixels um do outro nos canais de menor volume (Parceiro contábil, 9 e 8 agendas). Resolvido em 2026-09-18 junto com a espessura: com a marca em 14 px e `BAR_GAP = 2`, as âncoras ficam a 16 px, que é o piso da ROT-2, e sobram 4,25 px entre a tinta de um rótulo e a do outro, o primeiro degrau em que as duas linhas se leem soltas.
- `v1_agendas-marcadas-e-realizadas`: o rótulo na ponta imprime só a contagem, sem o substantivo que a NUM-6 pede; o sentido vem da legenda, da linha de leitura e do título do cartão.
- `v3_leads-por-origem-em-tres-meses`: `buildRows` troca o nulo por 0 no `dataKey`, então um zero medido ficaria indistinguível da ausência (EST-3); o nulo poderia chegar ao Recharts como `null`. O `shape` da barra decide pelo `payload.leads[mês]` original, não pelo `dataKey`, então o desenho na tela já trata o nulo certo mesmo com esse 0 por baixo.
- `v3_leads-por-origem-em-tres-meses`: os dois meses anteriores usam `--seq-3` e `--seq-5`, de contraste baixo contra o cartão; só passam pela isenção do valor escrito ao lado da barra.
- `v1_agendas-marcadas-e-realizadas`: quando a barra de cima é bem mais longa que a de baixo (Indicação de cliente, 31 contra 27), o rótulo da série de baixo passa por baixo da barra de cima. Com a altura de 2026-09-18 a folga subiu de 1 px para 3,5 px entre a base da barra de cima e o topo da tinta do rótulo, medido no `preview.svg` dos dois temas.
- `v2_executivo-contra-media-por-dimensao`: a barra saía com cerca de 2,5 px de altura no canvas de cartão, bem abaixo do `BAR_MAX = 11` declarado, porque o Recharts desconta o `barCategoryGap` percentual dos dois lados da banda antes de dividir pelo número de séries; com `barGap = 8` sobravam poucos pixels por barra. Corrigido em 2026-09-18 pela ESP-2: o canvas subiu para 640 x 700, o passo virou constante nomeada e a marca mede 12 px. O `v3` (cerca de 7,7 px) segue com a mesma conta por fazer.
- `v2_executivo-contra-media-por-dimensao`: com 270 px de nome e 88 px de coluna de lacuna, a faixa útil da escala de 0 a 100 fica em torno de 130 px no canvas de cartão, então a diferença de 14 pontos do primeiro par vira poucos pixels e a leitura acaba apoiada no número escrito.
- `v2_executivo-contra-media-por-dimensao`: a amostra de "Média do time" na legenda usa `--line-strong`, que mede 1,8:1 contra o cartão, e ali não há valor escrito ao lado da amostra para valer a isenção da 17.2; o texto da legenda identifica a série mesmo assim.
- `v3_leads-por-origem-em-tres-meses`: o `meta.json` e a linha deste README anunciam uma linha de leitura com a maior queda desde o primeiro mês, e a versão não desenha nenhuma; a frase existe só no `aria-label`. Corrigir o texto ou desenhar a linha, como o `v1` faz.
- `v3_leads-por-origem-em-tres-meses`: `BAR_GAP = 1` deixa 1 px entre tons vizinhos da rampa, abaixo do vão de 1,5 px que a COR-5 pede para vizinhos de baixo contraste entre si.
- `v4_pequenos-multiplos-por-metrica`: o valor da plataforma em destaque sai em peso 700 nos cinco painéis, cinco elementos onde a TIP-3 admite dois; o destaque já vem da cor e do nome em 600 na coluna da esquerda.
- Frase acessível: `v2`, `v3` e `v4` passavam do teto de 250 caracteres da ACE-1 (275, 282 e 260); as três frases foram encurtadas mantendo tipo de gráfico e conclusão, sem trocar a informação. `v2` ficou em 237, a 13 do teto, porque a frase cresce com o número de dimensões do recorte.
- `v3_leads-por-origem-em-tres-meses` e `v4_pequenos-multiplos-por-metrica`: o vão entre grupos fica abaixo do piso de 30% da ESP-2, com `BAR_CATEGORY_GAP = '28%'` no `v3` e `barCategoryGap="26%"` no `v4`. A Anatomia deste README declara a faixa de 28% a 34%, que por si já diverge dos 30% a 40% do CONTRATO; vale alinhar os dois textos antes de mexer nas versões.
- `v4_pequenos-multiplos-por-metrica`: o `barCategoryGap` vai como literal na marcação, sem a constante nomeada no topo do arquivo que a ESP-1 pede e que as outras três versões usam.
- `v4_pequenos-multiplos-por-metrica`: os nomes de plataforma da coluna da esquerda levam `truncate` numa largura fixa de 116 px e não aparecem na frase acessível, que só nomeia a plataforma em destaque. No canvas largo cabem inteiros, mas num pai estreito a categoria sumiria por reticência (TIP-7).
- Ferramenta (Recharts): o `content` de `LabelList` só recebe props SVG (o `payload` da linha é filtrado antes de chegar à função), então nenhuma versão deste modelo lê a linha do dado por ali. `v2`, `v3` e `v4` desenham o rótulo dentro do `shape` da própria `Bar`, que recebe o `payload` inteiro; nas versões com nulo (`v3`, `v4`) o `shape` também evita o descompasso do `index` da `LabelList` com barras de largura zero, porque nunca usa `index` para achar a linha.
- Revisão de 2026-09-18: a guarda `ESPESSURA-MARCA` do `npm run check` mediu a espessura efetiva das quatro versões no preview: `v1` 5 px, `v2` 2 px, `v3` 8 px e `v4` 10 px, todas abaixo do piso geral de 12 px da ESP-2. O piso geral é aviso e não erro (decisão de 2026-09-18, por falta de peça de teste própria), e nenhuma das quatro escreve rótulo de 12 px dentro da marca, que é onde o piso medido de 18 px valeria.
- Correção de 2026-09-18, `v1` e `v2`: as duas foram refeitas pela ESP-2, que manda a altura do canvas ceder quando a densidade de categorias empurra a espessura abaixo do piso. Nada foi afinado e nenhuma categoria saiu: só a altura subiu, de 360 px para 640 px no `v1` e para 700 px no `v2`, com o passo declarado em `ROW_STEP` e a conta da ESP-6 em comentário. A guarda passou a medir 14 px no `v1` e 12 px no `v2`, o `BAR_MAX` do `v2` subiu de 11 para 12 (com 11 o teto cortaria a marca antes do piso) e os dois canvas viraram número com o desvio declarado nas `notes`, como a ESP-2 exige. O `v3` (8 px) e o `v4` (10 px) ficaram como estavam e continuam no inventário de aviso.
- `v3_leads-por-origem-em-tres-meses`: a amostra de `jun/26` na legenda usa `--seq-3`, que mede de 1,9:1 a 2,3:1 contra o cartão, e ali não há valor escrito ao lado da amostra para valer a isenção da 17.2, o mesmo ponto já anotado na amostra neutra do `v2`. A identificação da série se sustenta pelo texto do mês e pela ordem das barras dentro do grupo, que repete a ordem da legenda.
- Revisão independente de 2026-09-18, `v4_pequenos-multiplos-por-metrica`: conferido no PNG dos dois temas que os cinco painéis partem do zero e guardam a proporção exata do valor; no painel de custo por lead, 88, 142, 205 e 318 caem em 30, 50, 72 e 112 px contra os 112 px do maior. Nenhum painel encurta a base.
- Revisão independente de 2026-09-18, `v1_agendas-marcadas-e-realizadas`: com `BAR_MAX = 14` dentro de um passo de 76 px, o vão desenhado entre grupos fica bem acima dos 30% declarados em `BAR_CATEGORY_GAP`, porque o teto de espessura devolve o resto do passo como espaço vazio. A leitura sai esparsa e cada canal a mais custa 76 px de altura.
- Revisão independente de 2026-09-18, `v2_executivo-contra-media-por-dimensao`: `makeBarShapes` grava a ponta da barra de score num `Map` mutado durante o render e a barra da média lê essa ponta de volta pelo `id`. Funciona porque o Recharts desenha as séries na ordem declarada, mas o rótulo do par depende dessa ordem e cairia no valor de reserva se ela mudasse.
- Revisão independente de 2026-09-18, `v3_leads-por-origem-em-tres-meses`: o `dataMax` do eixo é comum às três séries e a todas as origens, então a origem de menor volume (Evento presencial, de 6 a 19 leads) desenha barras de poucos pixels e a leitura dela se apoia no número escrito ao lado.
- Revisão independente de 2026-09-18, `v4_pequenos-multiplos-por-metrica`: `formatCurrencyCompact` imprime `R$ 6,2 mil` para 6.150 e `R$ 22,4 mil` para 22.400. O arredondamento é o do formatador do Farol, não muda a ordem de nenhum painel e o comprimento da barra continua saindo do valor cheio.
