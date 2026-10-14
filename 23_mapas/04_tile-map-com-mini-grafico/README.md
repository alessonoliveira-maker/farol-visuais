# Tile map com mini gráfico por UF

## O que é

Pequenos múltiplos arranjados como mapa, o geofaceting: a grade de UFs do tile grid (`23_mapas/01_tile-grid-por-uf`) e, dentro de cada tile, um mini gráfico da UF (linha ou barras empilhadas) com a sigla no canto e o último valor escrito. A grade é HTML com Tailwind e o mini gráfico é um path SVG calculado em TypeScript dentro do tile, mais leve que 27 instâncias de `ResponsiveContainer`. A escolha entre escala Y compartilhada (compara UFs e achata as pequenas) e escala própria (mostra a forma e impede a comparação) é declarada em texto no próprio visual.

## Quando usar

- Tendência mensal de cada UF mantendo a posição geográfica, com 6 a 12 pontos por série.
- Comparar formas de evolução entre regiões, como Sul crescendo e Nordeste estável.
- Composição por produto dentro de cada UF de um perímetro de até cerca de 12 UFs.
- Canvas alto ou largo, com tile de pelo menos 78 px de largura para a linha ser legível; barras com total em reais pedem 120 px ou mais.

## Quando evitar

- Mais de um indicador por tile: divida em dois mapas ou use a tabela com série por linha (`14_tabelas-visuais/03_tabela-com-serie-por-linha`).
- Valor exato por UF e mês: use a matriz categórica (`15_mapa-de-calor-e-calendario/02_matriz-categorica`).
- Só o último valor importa: use o tile grid por UF (`23_mapas/01_tile-grid-por-uf`).
- Sparkline isolada fora de mapa: o componente é da família 24 (`24_microvisuais-sparklines/01_sparkline-de-linha`).
- Comparação de linhas de poucas UFs no mesmo eixo: use os pequenos múltiplos de linha (`04_linhas/09_pequenos-multiplos-de-linha`).

## Anatomia

1. Grade: constante `UF_GRID` de UF para linha e coluna, 7 por 6, desenhada à mão e declarada no `data.ts`; tile `bg-surface-sunken` de proporção fixa.
2. Sigla no canto superior esquerdo em 12 px semibold e valor em `font-display` 11 px, por `formatInt` ou `formatCurrencyCompact`.
3. Mini gráfico: path calculado em TypeScript num `viewBox` fixo de 100 por 32, `preserveAspectRatio="none"` e `vectorEffect="non-scaling-stroke"`; mês `null` quebra o caminho.
4. Marcas que o SVG esticado deformaria (anel do zero, ponto final, ponto isolado) são `span` HTML posicionados por porcentagem.
5. Cor: `--chart-1` em série única; `--positive`, `--negative` e `--text-muted` na tendência; `seriesColor` com slot fixo por produto nas barras.
6. Estados: zero medido com anel ou tracejado, mês sem coleta com linha quebrada, UF sem dado com `Unplug` e `formatUnavailable`.
7. Nota de escala no rodapé do corpo, dizendo se a escala é única ou própria e o que o número escrito é.
8. Raiz `figure` com `aria-label` calculado do dado.

## Versões

- `v1_leads-mensais-por-uf-escala-compartilhada`: linha mensal por UF na mesma escala, anel no zero medido e mês sem coleta quebrando a linha.
- `v2_tendencia-dos-ultimos-tres-meses`: UFs classificadas em alta, queda ou estável pela variação dos 3 últimos meses, com ícone, sinal e ponto final.
- `v3_receita-por-produto-no-perimetro`: barras empilhadas por trimestre em três produtos, com escala própria por tile, UFs fora do perímetro rebaixadas e total do último trimestre.
- `v4_escala-propria-para-ufs-pequenas`: escala por tile com selo, máximo escrito, ponto isolado e UF sem medição.

## Como colar no Farol

1. Copie o `Chart.tsx` e o `data.ts` da versão e troque o dado por uma lista de UFs vinda da query, mantendo a sigla como chave e um valor por mês na ordem de `MONTHS`.
2. Substitua `UF_GRID` pela constante versionada do Farol quando ela existir; a grade daqui não é a `br_states_grid1` do geofacet.
3. A dica é o atributo `title` nativo do tile, com o par de valores que o corpo não escreve; troque por `ChartTooltip` se o Farol quiser dica estilizada.
4. Embrulhe no `VisualCard` e troque os estados vazios inline por `EmptyState` e `UnavailableState` (seção 16 do contrato).
5. Se o cartão ficar abaixo de 78 px de largura por tile, não encolha o texto: reduza o perímetro ou use a escala em duas colunas de macrorregião.

## Referências

- geofacet, `br_states_grid1.csv`: coordenadas públicas de grade de UFs. Não foram verificadas aqui; a vizinhança adotada é própria e declarada no `data.ts`.
- Edward Tufte, "Envisioning Information": pequenos múltiplos com escala comum para comparar e com escala própria para ver a forma.
- NPR Visuals, "Let's Tesselate: Hexagons for Tile Grid Maps": o argumento contra o viés de área do mapa real.
- Pedido ao Farol: a lista de formatadores não traz `formatNumber`, que o catálogo cita; o número vai por `formatInt`.
- Arquivo do Farol de referência: `app/src/components/visuals/charts/chartTheme.ts` (`seriesColor`).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, sobre os `Chart.tsx` de 12:10 e os PNGs de 12:10 e 12:11 do mesmo dia. `v1`, `v2` e `v4` aprovadas; `v3` reprovada, com o parecer em `validation/revisao_23_mapas__04_tile-map-com-mini-grafico_2026-10-13.md`. O que segue não reprova.

- `v1`: o número do tile, a dica e a frase acessível saem de `lastMeasured`, que devolve o último mês **medido**, e a nota afirma "O número é o de ago/26". Com uma UF sem coleta no último mês, o tile escreveria o valor de um mês anterior sob esse rótulo. O dado padrão não exercita o ramo (só AP, toda `null`).
- `v1`, `meta.json`: "tile de proporção fixa" não está no código. A grade usa `1fr` nas duas direções e o tile acompanha o cartão (78,5 por 63 px no canvas `alto`).
- `v1`: na escala de 0 a 2.000 o mini gráfico tem 30 px úteis, cerca de 66 leads por pixel, e 15 das 26 UFs medidas ficam a menos de 5 px da base. É o preço declarado da escala única, e a `v4` é o contraponto.
- `v2`: a linha de leitura e a frase acessível contam "3 sem base", e o desenho mostra 2 tiles com "sem base" (RR e TO) e 1 com `formatUnavailable()` (AP). A definição do rodapé cobre os três, mas quem conta tiles acha 2; "2 sem base e 1 sem dado" fecha com o que se vê.
- `v2`, DAD-1: a frase acessível anuncia "Maior alta: AC, +17%" sem o volume (de 6 para 7 leads). No tile o par está escrito; na frase falta.
- `v2`: a linha inteira de 8 meses leva a cor da classe dos 3 últimos. CE sobe por 6 meses e sai toda vermelha; SP sobe 19% de jan/26 a ago/26 e sai cinza com o ícone de estável. Nada falso, porque o rodapé nomeia a janela, mas um marcador no ponto de base (jun/26) mostraria de onde a variação parte.
- `v2`, NUM-4: a base da variação é nomeada uma vez, na linha de leitura e no rodapé, e não em cada tile; o valor de base só aparece na dica `title`.
- `v2`, TIP-1: a linha de leitura tem números em Manrope sem `tabular-nums`. Sem consequência visível.
- `v2`, ROT-9: o tile tem 66 px úteis no canvas de 640 por 640 px, e valor de quatro algarismos ao lado de variação de cinco caracteres não cabe. O dado padrão para em 418 e o menor vão medido entre os dois textos é de 9,5 px.
- `v2`, ACE-8: `--positive` como texto sobre `--surface-sunken` não está na tabela 17.10. Mede 8,44:1 no escuro e 4,62:1 no claro, 0,12 acima do piso.
- `v4`, ANO-5: a linha de leitura é um aviso fixo, não calculado do dado, e repete o título e o subtítulo. Pode levar a conclusão do dado junto do aviso (máximos de 2 a 655 agendas).
- `v4`: `yAt(value, peak.value)` divide por zero quando o máximo da UF é 0 (UF só com zero medido): o caminho sai `NaN` e nada é desenhado. O dado padrão não exercita o ramo.
- `v4`: com a escala de 0 ao máximo, as séries crescentes ocupam só a faixa de cima do mini gráfico (SP vai de 79% a 100% do máximo, cerca de 7 dos 34 px úteis). É a escolha declarada no `notes`.
- `v3`, corrigida: escala própria por tile (declarada no rodapé), separador só entre parcelas, piso de 0,9 unidade por parcela (cerca de 1,8 px), trimestre com algum produto `null` tratado como sem coleta e frase acessível com a repartição por produto.
- README, Anatomia, item 1: diz tile `bg-surface-sunken` de proporção fixa. Na `v3` o tile do perímetro é só contorno em `--line-subtle`, e em nenhuma versão a proporção é fixa.
- README, Anatomia, item 2: diz valor em 11 px. Na `v2` o valor vai em 12 px, peso 600.
- Ferramenta: a guarda CONTRASTE-MARCA mede a marca contra `--surface-raised`, e na `v1`, na `v2` e na `v4` a marca fica sobre `--surface-sunken`. Medido à mão, escuro e claro: `--chart-1` 10,90:1 e 5,20:1; `--positive` 8,44:1 e 4,62:1; `--negative` 6,30:1 e 5,51:1; `--text-muted` 5,98:1 e 4,65:1.

Revisão de 2026-10-13, segunda passada, só da `v3` (motivo `revisao_desatualizada`), sobre o `Chart.tsx` de 12:45:11 e os PNGs de 12:45:16 e 12:45:17 do mesmo dia. `v3` aprovada: nos dois temas as 90 parcelas maiores que zero têm tinta (a menor, a Linha Corporativa de MG em T2/26, mede 2,0 px), os zeros medidos de MG e do DF saem sem a parcela e a escala própria está declarada no rodapé. O que segue não reprova.

- `v3`, COR-5: o traço separador é pintado antes do retângulo da parcela de cima, que cobre a metade superior dele. Sobra cerca de 0,5 px de `--surface-raised` em cada fronteira (1 px no PNG de escala 2), abaixo do 1 a 2 px da regra. Sem consequência visível: toda fronteira aparece nos dois temas, embora Linha Plus contra Linha Base meça 1,03:1 em luminância no claro. Desenhar os separadores depois de todos os retângulos devolve o 1 px inteiro.
- `v3`, `meta.json`: o `notes` diz que o piso de 0,9 unidade vale cerca de 1,8 px. O mini gráfico mede 55,25 px para 32 unidades, então o piso vale 1,55 px.
- `v3`: o piso `MIN_SEGMENT` não é exercitado pelo dado padrão (a menor parcela pede 1,13 unidade). Quando entrar, a barra fica até 1,55 px mais alta que o total dela por parcela erguida, e só o `notes` avisa; a tela não.
- `v3`: o topo da escala de cada tile é o maior total trimestral, e o número escrito é o total de T3/26. No dado padrão os dois coincidem nos 8 tiles, porque todas as séries terminam no máximo. Com o pico num trimestre anterior, o tile fica sem número que diga o topo da escala; a `v4` escreve o máximo por isso.
- `v3`, NUM-1: o rodapé diz que o número compara UFs, e o formato compacto empata PR com MG (R$ 1,5 mi para 1,45 e 1,49 mi) e RS com SC (R$ 1,1 mi para 1,08 e 1,11 mi).
- `v3`: o valor de cada produto só existe na frase acessível (R$ 1,5 mi, R$ 3,7 mi e R$ 7,0 mi em T3/26). A legenda pode levar esses totais em coluna à direita, pela ROT-5, e o corpo passa a responder ao `useCase` também com número.
- `v3`, EST-2: com o último trimestre sem coleta, o lugar do total escreve `formatUnavailable()` em `--text-primary` e sem o `Unplug`. O dado padrão não exercita o ramo (em GO falta o primeiro trimestre).
- `v3`, EST-3: trimestre com total zero medido não desenha marca nenhuma, só a linha de base. O dado padrão só tem zero por produto (MG e DF), em que a parcela ausente dentro de uma barra desenhada se lê como zero.
- `v3`: a repartição da frase acessível soma `?? 0` no último trimestre. Uma UF com um produto `null` nesse trimestre entraria na soma pelos outros dois, enquanto o tile dela escreve `formatUnavailable()`. Não exercitado.
- `v3`, ANO-2: a segunda nota do rodapé tem 190 caracteres e quebra em duas linhas no canvas de 960 px. "Tracejado: sem coleta" cabe na legenda, com amostra vazada (ROT-4).
- Régua: a EST-3 manda desenhar a marca do zero e escrever 0, e não diz o que vale para a parcela zero dentro de uma pilha; a ROT-10 lista a barra 100% e cala sobre a coluna empilhada em valor absoluto. Nesta passada a parcela zero sem marca foi julgada certa e a pergunta 27 como não se aplica.
