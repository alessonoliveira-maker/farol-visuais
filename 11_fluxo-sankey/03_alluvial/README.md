# Alluvial

## O que é

Colunas são momentos (ou dimensões); dentro de cada coluna, blocos empilhados são categorias com altura proporcional à contagem, sempre na mesma ordem em todas as colunas; faixas ligam, entre colunas vizinhas, as unidades que mantiveram ou mudaram de categoria. A leitura importa pela correspondência das mesmas unidades ao longo do tempo, não pela direção física de um fluxo: por isso a cor conta a história de quem veio de onde (ou de quem chega a onde), e a posição fixa do bloco é o que deixa o olho seguir uma categoria sem reler o rótulo em cada coluna.

## Quando usar

- A mesma população mudando de categoria entre 3 e 5 momentos: temperatura do lead mês a mês, faixa de receita do cliente por trimestre.
- Ver quem esfriou, esquentou ou manteve a classificação de um período para o outro.
- Coorte com entrada e saída da base declaradas como categorias de primeira classe, com até 6 categorias por coluna.

## Quando evitar

- População que muda entre colunas sem categoria de entrada e saída declarada: as alturas não fecham e a leitura mente. Declare "ainda não cliente" e "encerrou" como categorias.
- Volume que atravessa etapas com perdas no meio do caminho: usar o 02_sankey-multietapa.
- Mais de 6 categorias por coluna, ou só dois momentos com necessidade de leitura exata par a par: usar a matriz de transição (família 15_mapa-de-calor-e-calendario, ou 07_matriz-de-transicao).
- Ranking de posição entre períodos: usar o bump chart (família 04_linhas ou 17_comparacao-de-pontos).
- Composição no tempo sem precisar rastrear as mesmas unidades: usar áreas empilhadas da família 05_areas.

## Anatomia

1. Colunas em `TypeScript` puro, posicionadas a intervalo fixo (`columnStep`), uma por momento (`columns`), com o bloco em `BLOCK_WIDTH` de largura.
2. Blocos empilhados em `<rect>`, um por categoria, sempre na ordem fixa de `categories`: a soma acumulada do dado decide a posição, nunca um algoritmo de relaxamento que reordene por tamanho.
3. Vão de `BLOCK_GAP` entre blocos empilhados na mesma coluna, a separação mínima da CONTRATO COR-5. Na `v1` o vão é de 3 unidades para dar cerca de 2 px, porque o `viewBox` de 900 por 300 é esticado para um corpo de 894 por 229,5. Nas versões `v2`, `v3` e `v4` o `viewBox` é declarado no tamanho aproximado da área do corpo, e aí a unidade volta a ser o pixel: medido no preview, 574 por 190 saiu com 574 por 189,5 px, 894 por 310 saiu com 894 por 309,5 px e 894 por 270 saiu com 894 por 269,5 px, de modo que 2 unidades de vão chegam ao desenho com 2 px.
4. Faixas em `<path>` como Bézier horizontal (`ribbonPath`), com o ponto de controle no meio do vão entre colunas; a espessura em cada ponta é a contagem da própria ligação na mesma escala do bloco, então a soma das faixas de um bloco sempre fecha a altura dele.
5. Ordenação das ligações por um único `sort` em (categoria de origem, categoria de destino), que entrega ao mesmo tempo as saídas de cada bloco ordenadas pelo destino e as entradas de cada bloco ordenadas pela origem.
6. Cor da faixa herdada da categoria de ORIGEM, em slot fixo dos tokens `--chart-N` (COR-8: ordem 1, 3, 6, 5); bloco e faixa ficam os dois em cor cheia (ACE-5: `fillOpacity` reduzida compõe com o cartão e derruba o contraste abaixo de 3:1 no tema claro) e é o contorno `--surface-raised` (`RIBBON_STROKE`) que separa nó de ligação, sem mexer no contraste do preenchimento.
7. Legenda de cor por categoria acima do diagrama (`aria-hidden`, porque a frase acessível da raiz já enumera as categorias), única fonte da correspondência entre cor e nome para os blocos do meio do percurso.
8. Rótulo de nome e contagem (`formatInt`, com o substantivo "leads") fora do bloco, só na primeira e na última coluna: à esquerda na primeira, à direita na última, ancorado ao centro vertical do bloco. As colunas do meio se identificam pela ordem fixa, pela cor e pela legenda, não por rótulo próprio.
9. Cabeçalho de mês (`formatMonthShort`) centralizado acima de cada coluna.
10. Linha de leitura calculada do dado no topo do corpo: quem lidera na última coluna e o tamanho de quem saiu da base (ANO-5).
11. `data` vazio troca o diagrama inteiro por um bloco `role="status"` (EST-1). Nas versões `v2`, `v3` e `v4` o mesmo portão cobre o recorte que tem linhas somando zero unidade, porque a escala vertical devolve `null` em vez de 0 (EST-1b).
12. Foco opcional (`v2`): a prop `highlight` recebe pares de categorias, e só as faixas desses pares ficam na cor da origem; as demais vão para o neutro `--text-muted` opaco, com contorno `--surface-raised` de 1,75 px em toda faixa e revestimento de 5 px sob a acesa (chart-1 contra text-muted mede 1,12:1 no claro, TOK-9). O apagamento é feito pelo token, nunca por `fillOpacity`, porque opacidade em marca é perda de contraste medida (ACE-5).
13. Presença de categoria por coluna (`v4`): `firstColumn` e `lastColumn` no dado dizem onde a categoria existe, e a pilha gasta vão só onde existe bloco. A presença não se deduz de `total > 0`, porque isso transformaria zero medido (EST-3) em ausência (DAD-2).
14. Bloco de ausência (`v3` e `v4`): sem preenchimento, contorno `--text-muted` de 1,5 px, sempre por último na pilha, com a amostra vazada na legenda (ROT-4). As faixas que saem dele são neutras em `--text-muted` cheio, e só ganham cor de categoria na chegada.
15. Dica de SVG (`v3`): `<title>` por bloco com o percentual daquele bloco na coluna, o número que não está escrito em nenhum outro lugar (DIC-1). Em SVG puro é a única dica possível, porque o `ChartTooltip` do Farol é um `content` de Recharts.

## Versões

- `v1_temperatura-dos-leads-em-tres-meses`: temperatura dos mesmos 1.240 leads de junho a agosto de 2026, em Quente, Morno, Frio e Descartado. Demonstra a geometria de alluvial em TypeScript sem relaxamento que mova blocos, a ordem de categorias igual nas três colunas, as saídas ordenadas pelo destino e as entradas ordenadas pela origem a partir de um único `sort`, a cor pela categoria de origem dita na legenda, o vão de cerca de 2 px entre blocos empilhados e a faixa em cor cheia com contorno `--surface-raised` (correção de 2026-09-19, ACE-5).
- `v2_leads-quentes-que-esfriaram`: os 214 leads quentes de julho de 2026 e o que aconteceu com eles em agosto, em duas colunas. Demonstra a prop `highlight` com as duas transições em foco na cor da origem e todas as outras faixas em neutro, o apagamento feito por token e não por opacidade, as duas anotações com a contagem que chega por cada faixa acesa, e o peso 700 no nome e no valor da origem, que é o teto da TIP-3.
- `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres`: os mesmos 312 clientes em quatro trimestres e seis categorias, com "Ainda não cliente" e "Encerrou" fechando a população. Demonstra o teto de categorias do modelo, a entrada e a saída da base como categorias de primeira classe, a ordem das faixas carregada pela posição fixa em vez da rampa sequencial (que não tem quatro degraus acima do piso de contraste), o percentual da coluna na dica e o tamanho da base escrito em cada cabeçalho.
- `v4_classificacao-que-passou-a-existir`: a temperatura Morno passa a existir em julho de 2026, e os 388 leads sem classificação de junho se repartem nas colunas seguintes. Demonstra o bloco de ausência vazado e por último, a categoria que nasce no meio da série sem bloco zerado nas colunas anteriores, a presença declarada no dado, a anotação única na coluna do nascimento e as faixas neutras que saem da ausência.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/TemperatureAlluvial/`.
2. Troque o `import` do `./data` pelas listas reais de `categories`, `columns` e `data` (as ligações entre colunas); mantenha a mesma forma de `AlluvialFlow` para o layout continuar calculando sozinho.
3. Passe `data` pela prop a partir do seletor da página; o default do `data.ts` fica só como amostra do catálogo.
4. Dê altura ao pai (`<div className="h-80">`, por exemplo, para o canvas largo) ou passe `height`, porque o SVG usa `preserveAspectRatio="none"` e ocupa 100% do contêiner nos dois eixos.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [RAWGraphs, Alluvial Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/alluvialdiagram): metadados descrevem correlações entre dimensões categóricas como fluxos, com retângulo por valor único e altura proporcional.
- [Data Viz Project, Alluvial Diagram](https://datavizproject.com/data-type/alluvial-diagram/).
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): sankey para volume, alluvial para categorias.
- [Behance, Alluvial Diagram: Titanic passengers](https://www.behance.net/gallery/162455355/Alluvial-Diagram-Titanic-passengers): alluvial editorial de várias dimensões.
- [Behance, Vendor Trace: Alluvial Diagram](https://www.behance.net/gallery/152796919/Vendor-Trace-Alluvial-Diagram): alluvial aplicado a rastreio de fornecedores.

## Colisões entre a especificação do catálogo e o contrato (2026-09-28)

As três versões desta leva foram escritas contra a especificação do catálogo, e em três pontos ela pede o que o contrato proíbe. Em todos eles o contrato venceu, e a medição está no campo `notes` do `meta.json` de cada versão.

- `v2` (ACE-5): a especificação pede as faixas fora de foco a 15% de opacidade. Opacidade em marca compõe a cor com a do cartão, e 15% de qualquer cor fica entre 1,0 e 1,2:1, isto é, a faixa desaparece. O apagamento passou a ser feito por `--text-muted` opaco (5,21:1 no escuro e 5,37:1 no claro); o `--line-strong` foi abandonado porque nenhuma faixa neutra carrega a própria contagem (ACE-6).
- `v2` (TIP-3): a especificação pede peso 700 no nome das categorias em foco, e elas são três (a origem e os dois destinos). A TIP-3 dá 700 a dois elementos, o nome e o valor do destaque, então o 700 ficou na origem, que é o sujeito da pergunta, e os destinos se identificam pela cor cheia da faixa e pela anotação com a contagem.
- `v3` (ACE-3, TOK-2 e TOK-7): a especificação pede as faixas ordinais na rampa `--seq-N` com a contagem escrita no bloco, e a rampa do Farol não tem quatro degraus úteis. Medida contra `--surface-raised`, ela dá 1,14, 1,58, 2,29, 3,38, 4,89, 6,96 e 10,12:1 no tema escuro e 1,21, 1,49, 1,92, 2,60, 3,72, 5,45 e 8,29:1 no claro: só três degraus passam do piso de 3:1 nos dois temas, e a versão precisa de quatro faixas. Escrever a contagem dentro do bloco não salva a rampa, porque sobre `--seq-4` o melhor par de texto mede 4,29:1, abaixo do piso de 4,5:1. A ordem passou a ser carregada pela posição fixa e pelo nome da faixa, que é o próprio intervalo em reais, e a cor voltou a ser identidade de categoria em slot fixo.

Vale como achado de token, e não só desta versão: **nenhuma rampa de quatro degraus existe nos tokens do Farol acima do piso de 3:1 nos dois temas.** As cores categóricas invertem de luminância entre os temas, o que as impede de ordenar, e a rampa sequencial só entrega `--seq-5`, `--seq-6` e `--seq-7`. Escala ordinal com mais de três degraus precisa de outro canal, como posição ou rótulo.

## Correções da revisão de 2026-09-19

- `v1_temperatura-dos-leads-em-tres-meses` (bloqueante, ACE-5/ACE-3): as 32 faixas usavam `fillOpacity` de 0,55, que compunha 2,27 a 2,57:1 no tema claro (2,64:1 em chart-5 no escuro), abaixo do piso de 3:1, sem valor escrito junto da faixa que isentasse a régua. Corrigido para cor cheia (`fill` sem opacidade) com contorno `--surface-raised` (`RIBBON_STROKE`, 1 px), como o próprio apontamento sugeriu; medido depois da correção, a cor cheia das faixas mede de 5,39:1 a 9,50:1 contra o cartão nos dois temas, e o contorno de superfície é quem agora separa nó de ligação. O mesmo contorno também resolveu, de graça, a separação entre faixas coladas que chegam ao mesmo bloco.
- `v1_temperatura-dos-leads-em-tres-meses` (não bloqueante, NUM-5): o total de 1.240 leads aparecia só na frase acessível. A linha de leitura visível agora abre com "Nos 1.240 leads, ...", declarando o agregado que é o denominador de tudo o que está desenhado.
- `v1_temperatura-dos-leads-em-tres-meses` (não bloqueante, TIP-1): os números da linha de leitura (1.240, 210, 345) e os meses ganharam `tabular-nums`.
- `v1_temperatura-dos-leads-em-tres-meses` (não bloqueante, 17.7): a linha de leitura usava `mb-1` (4 px) até a legenda; passou para `mb-2` (8 px), a distância que a tabela da seção prevê.
- `v1_temperatura-dos-leads-em-tres-meses` (não bloqueante, COR-5): o `preserveAspectRatio="none"` escala o desenho de forma diferente nos dois eixos (cerca de 1,03 px por unidade na horizontal contra 0,68 na vertical, medido no canvas largo), então o `BLOCK_GAP` de 2 unidades chegava ao PNG com cerca de 1,35 px, abaixo do piso de 1,5 px. Subiu para 3 unidades; medido nos dois PNGs desta correção, o vão entre blocos empilhados chega a 2 px nos dois temas, acima do piso.

## Observações da revisão (não bloqueantes, mantidas)

- `v1_temperatura-dos-leads-em-tres-meses`: a coluna do meio (jul/26) não imprime contagem nenhuma, então o valor de cada categoria em julho só existe na proporção do bloco; a leitura funciona pela legenda e pela ordem fixa (anatomia, item 8: rótulo de nome e contagem só na primeira e na última coluna), mas um número por bloco ali fecharia a série. Não mexido nesta rodada por ser decisão de desenho já registrada na Anatomia, não o item bloqueante desta correção.
- `v1_temperatura-dos-leads-em-tres-meses`: o `preserveAspectRatio="none"` continua fazendo o desenho escalar em proporções diferentes nos dois eixos; as constantes declaradas no topo do arquivo (em unidades do `viewBox`) não descrevem diretamente o pixel do PNG, e quem alterar uma constante de espaçamento precisa medir o PNG depois, não confiar no número declarado.
- `v1_temperatura-dos-leads-em-tres-meses`: as ligações de 5 leads desenham cerca de 0,7 px de espessura de preenchimento e leem como fio fino; é o caso difícil pedido pela seção 3 do contrato, e o contorno novo ajuda a distingui-las (ver crop de conferência), mas vale saber que abaixo dessa contagem a faixa some visualmente.

Revisão independente de 2026-09-19 (segunda passada, sem bloqueante):

- `v1_temperatura-dos-leads-em-tres-meses` (ROT-4): a amostra da legenda sai redonda no PNG, porque o `rounded-sm` do Farol resolve em raio de 6 px sobre um quadrado de 10 px, enquanto a marca desenhada é retângulo de `rx={1}`. A identificação por cor e nome continua inteira; é raio de acabamento, não encoding.
- `v1_temperatura-dos-leads-em-tres-meses` (COR-5): o `RIBBON_STROKE_WIDTH` de 1 unidade chega ao PNG com cerca de 0,77 px na vertical (o `svg` aninhado mede 894 por 229,5 px para um `viewBox` de 900 por 300), abaixo do 1 px que a opção de contorno da regra pede. A separação entre faixas vizinhas lê nos dois temas, então fica como anotação; vale a mesma lição já registrada acima sobre a unidade declarada não ser o pixel do PNG.
- `v1_temperatura-dos-leads-em-tres-meses` (documentação): o item 7 da Anatomia diz que a legenda é `aria-hidden`, mas no código só as amostras de cor levam o atributo, e o texto da legenda é lido pelo leitor de tela depois da frase da raiz. O comportamento é aceitável; o que diverge é a descrição.
- `v1_temperatura-dos-leads-em-tres-meses` (robustez ao colar no Farol): os totais das colunas do meio saem das ligações que SAEM do par, então dado real com entrada e saída divergentes numa categoria faria as faixas estourarem a altura do bloco sem nenhum aviso na tela. Com o dado fixo do catálogo as duas pontas fecham em 1.240 nas três colunas.
- `v1_temperatura-dos-leads-em-tres-meses` (redação): na linha de leitura, "segue a maior categoria" fica entre "continua sendo a maior" e "vai atrás da maior"; "segue sendo a maior categoria" fecharia a ambiguidade.

## Observações da revisão (não bloqueantes)

Revisão independente de 2026-10-14, das versões `v2`, `v3` e `v4` (a `v2` foi reprovada por outro motivo; os bloqueantes estão em `validation/revisao_11_fluxo-sankey__03_alluvial_2026-10-14.md`, e o que segue aqui não reprova):

- `v2_leads-quentes-que-esfriaram` (Quando usar): a versão tem dois momentos, e a seção Quando evitar deste README manda dois momentos com leitura exata para a matriz de transição. A pergunta aqui é o destaque de duas transições, não a leitura par a par, e o catálogo especifica jul para ago, então fica como nota.
- `v2_leads-quentes-que-esfriaram` (revisão A22): as anotações "46 vieram de Quente" e "21 vieram de Quente" repetem os dois números que a linha de leitura já escreve logo acima; a anotação é pedida pela especificação, mas uma das duas camadas poderia dizer outra coisa (o total que chega, por exemplo).
- `v2_leads-quentes-que-esfriaram` (NUM-6): "46 vieram de Quente" sai sem o substantivo; "46 leads vieram de Quente" fecha a unidade na própria anotação.
- `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres` (ordem de pintura): as faixas de quem encerrou (4 a 6 clientes por faixa de receita, em cada par) são pintadas antes das faixas de "Ainda não cliente" e passam por baixo delas na maior parte do vão; nos vãos entre as faixas neutras sobram pequenas lascas oblíquas em cor de categoria, que se leem como risco solto. A saída e a chegada se leem, e a contagem de Encerrou está escrita; pintar as neutras primeiro, ou as faixas finas por último, deixaria a saída da base visível no caminho todo.
- `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres` (NUM-1 e NUM-2): a dica `<title>` escreve o percentual da coluna com `formatPercent` de uma casa; percentual de composição é inteiro, e pelo maior resto para somar 100.
- `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres` (ANO-5): o verbo "sobe" está fixo na linha de leitura ("a base sobe de") e na frase acessível ("a faixa ... sobe de"); com um recorte em queda a frase afirmaria o contrário do desenho. É o mesmo padrão da `v1` ("Descartado sobe de").
- `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres` (NUM-6): o cabeçalho "204 na base" sai sem substantivo; "204 clientes na base" fecha a unidade.
- `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres` (frase acessível): "e 50 encerraram" soma os 8 que já estavam em Encerrou em dez/25; no período encerraram 42. "50 em Encerrou até set/26" ou "42 encerraram no período" fica exato.
- `v3_faixa-de-receita-dos-clientes-em-quatro-trimestres` (rótulo de coluna): o trimestre é nomeado pelo mês de fechamento ("dez/25"), e só o subtítulo do cartão diz que são trimestres; na coluna, isso se lê como mês.
- `v4_classificacao-que-passou-a-existir` (ROT-10, mesma nota da `v1`): o bloco de Morno em jul/26, que é o assunto da versão, não tem número escrito (317 leads); a anotação do nascimento poderia levar a contagem dentro do teto de 50 caracteres.
- `v4_classificacao-que-passou-a-existir` (ordem de pintura): as faixas neutras da ausência são pintadas por último e cobrem Frio para Descartado (40 leads) e as faixas de 5 leads na maior parte do vão; o mesmo ajuste da `v3` vale aqui.
- `v4_classificacao-que-passou-a-existir` (frase acessível): "em três meses" está escrito à mão; com outro recorte de colunas a frase erra a contagem.
- `v2`, `v3` e `v4` (ROT-4, mesma nota da `v1`): a amostra da legenda sai redonda no PNG (`rounded-sm` sobre 10 px) enquanto o bloco desenhado é retângulo; a identificação por cor e nome continua inteira.

Revisão independente de 2026-10-14, segunda passada da `v2` depois da rodada única de correção (reprovada de novo; o bloqueante está em `validation/revisao_11_fluxo-sankey__03_alluvial_2026-10-14.md`, e o que segue aqui não reprova):

- `v2_leads-quentes-que-esfriaram` (ROT-4): com duas colunas, todo bloco já tem nome e contagem escritos ao lado, então a legenda repete a identificação e gasta cerca de 16 px de altura do cartão. Na `v1` ela se justifica pela coluna do meio, que não tem rótulo; aqui poderia sair.
- `v2_leads-quentes-que-esfriaram` (ANO-5): a linha de leitura tem 108 caracteres e quebra em duas linhas no cartão de 640 px, e a regra pede uma. Uma redação mais curta, como "Dos 214 Quentes de jul/26, 31,3% (67 de 214) esfriaram: 46 para Morno e 21 para Frio", cabe em uma linha e devolve altura ao diagrama.
- `v2_leads-quentes-que-esfriaram` (ACE-1): a frase acessível termina em "as outras faixas ficam em neutro", que descreve a pintura e não o dado. Dizer o resto dos 214 (132 continuaram quentes e 15 foram descartados) fecharia a conta para quem ouve.
- `v2_leads-quentes-que-esfriaram` (robustez ao colar no Farol): o verbo "esfriaram" está fixo na linha de leitura e na frase. Já o `highlight` aceita qualquer par de categorias. Com um destaque de transições que esquentam, a frase afirmaria o contrário do desenho. É o mesmo padrão do "sobe" da `v3`.
