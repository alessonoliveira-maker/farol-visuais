# Tile grid map por UF

## O que é

Cada uma das 27 UFs vira um tile do mesmo tamanho numa grade que lembra o mapa do Brasil, com a sigla, o valor e uma cor por classe. Como todo tile pesa igual, a Amazônia não domina o desenho e DF, SE, AL, RN, PB, ES e RJ ficam legíveis e apontáveis. A leitura é pelo número escrito no tile; a cor só ajuda a varrer o painel. A versão hexagonal usa o mesmo grid com linhas ímpares deslocadas meia célula.

## Quando usar

- Taxa ou percentual por UF (qualificação, CPL qualificado, SLA cumprido) quando as 27 UFs devem pesar igual na leitura.
- Painel em que as UFs pequenas do Nordeste e do Sudeste precisam ser apontáveis.
- Cartão de 480 px ou menos, onde a malha real não comporta sigla e valor em cada UF.
- Destaque de poucas UFs (acima da meta) sobre um fundo geográfico reconhecível, até as 27.
- Versão hexagonal em pequenos múltiplos, uma plataforma por mapa, quando o valor cabe em 32 px.

## Quando evitar

- A pergunta é só qual UF é maior: use as barras ordenadas (`02_barras-horizontais/01_barras-simples-ordenadas`).
- Forma e área reais fazem parte da resposta: use o coroplético por UF (`23_mapas/02_coropletico-por-uf`).
- O valor é total absoluto e a magnitude importa: use os símbolos proporcionais (`23_mapas/03_simbolos-proporcionais`).
- UF por mês em intensidade: use a matriz categórica (`15_mapa-de-calor-e-calendario/02_matriz-categorica`).
- Leitura de valor exato das 27 UFs: use a tabela com barras inline (`14_tabelas-visuais/01_tabela-com-barras-inline`).

## Anatomia

1. Grade: constante `UF_GRID` do tipo Record de UF para linha e coluna, no `data.ts`, com a vizinhança adotada declarada em comentário.
2. Tile: div posicionado por `gridRow` e `gridColumn`, sigla em 12 px e valor em `font-display` 11 px, por `formatPercent` ou `formatInt`.
3. Cor: cinco classes em `--seq-1`, `--seq-2`, `--seq-3`, `--seq-6` e `--seq-7`, com texto de `--text-primary` nas três baixas e `--accent-cyan-contrast` nas duas altas.
4. Legenda em degraus com o limite de cada classe, sem legenda contínua.
5. Estado especial: contorno pontilhado para amostra rala, hachura e as palavras sem dado para ausência, contorno cheio e o 0 escrito para zero medido.
6. Raiz `figure` com `aria-label` calculado do dado: UF líder, amplitude, contagens.

## Versões

- `v1_taxa-de-qualificacao-por-uf`: grade de 8 por 6, cinco classes com quebras calculadas e contorno pontilhado para amostra rala.
- `v2_ufs-acima-da-meta-com-ranking`: anel e visto nas UFs acima da meta, ranking das 10 maiores com `highlightId` e container query.
- `v3_hexagonal-cpl-qualificado-por-plataforma`: hexágonos em SVG, três pequenos múltiplos e escala divergente única em torno da média.
- `v4_leads-sem-uf-e-ufs-sem-dado`: grade de 7 por 6, sem dado hachurado, zero medido e o card dos leads sem UF.

## Como colar no Farol

1. Copie o `Chart.tsx` e o `data.ts` da versão e troque o dado por uma lista de UFs vinda da query, mantendo a sigla como chave.
2. Substitua a grade `UF_GRID` pela constante versionada do Farol quando ela existir; as grades daqui são desenhadas à mão e não são as do geofacet.
3. A dica é o atributo `title` nativo (`title` em div, `title` em SVG); troque por `ChartTooltip` se o Farol quiser dica estilizada nos tiles.
4. A rampa de cinco classes pula `--seq-4` e `--seq-5`; se o Farol ganhar tokens divergentes, só `bucketFill` da v3 muda.
5. Embrulhe no `VisualCard` e troque os estados vazios inline por `EmptyState` (seção 16 do contrato).

## Referências

- geofacet, `br_states_grid1.csv` e `br_states_grid2.csv`: coordenadas públicas de grades de 8 por 6 e 7 por 6. Não foram verificadas aqui; a vizinhança adotada é própria e declarada no `data.ts`.
- NPR Visuals, "Let's Tesselate: Hexagons for Tile Grid Maps": o argumento contra o viés de área e as adjacências que não cabem no hexágono.
- Red Blob Games, "Hexagonal Grids": o deslocamento das linhas ímpares em meia célula.
- Storytelling with Data, "What is a choropleth map": o tile map como alternativa e o dado ausente distinto de zero.
- Arquivo do Farol de referência: `app/src/components/visuals/charts/chartTheme.ts` (rampa `CHART_SEQUENTIAL_COLORS`).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, sobre os arquivos do mesmo dia. `v1` e `v4` aprovadas; `v2` e `v3` reprovadas, com o parecer em `validation/revisao_23_mapas__01_tile-grid-por-uf_2026-10-13.md`. O que segue não reprova e fica para quem tocar o arquivo.

- `v1`, EST-2 e ACE-2: no ramo de UF sem lead (`rate` nulo, que o dado padrão não exercita) o tile sai vazado, com a sigla em `--text-muted` e o contorno pontilhado da amostra rala, sem palavra nem ícone no lugar do número; a ausência só está na dica. Não afirma classe nem zero, por isso não reprova. Dar a ela o ícone `Unplug` e um item escrito na legenda, como a `v3` e a `v4` fazem.
- `v1`, limiar: os rótulos da legenda repetem o limite (`12% a 16%`, `16% a 20%`) e a classe inclui o limite de baixo. MG, com 15,98%, imprime `16,0%` e leva a cor de `12% a 16%`.
- `v1` e `v2`, sobra: a coluna 1 da grade de 8 por 6 não tem UF (a mais à esquerda é AC, na coluna 2). O mapa ocupa 7 colunas e fica deslocado para a direita, com um oitavo da largura vazio. A `v4` já usa a grade de 7.
- `v1`, `v2` e `v4`, TIP-1: números em Manrope sem `tabular-nums`: o `50` da nota da `v1` (`Chart.tsx:158`), a linha de leitura e o `10 maiores` da `v2` (linhas 99 e 149) e a frase de apoio do card da `v4` (linha 173). Sem consequência visível, porque nenhum deles está em coluna.
- `v2`: os itens de mesma rodada estão no parecer (escala do ranking sem a meta, linha da meta apagada sobre a barra acesa, `10 maiores` sem substantivo, destaque do tile só pelo preenchimento).
- `v2`, ROT-2: o valor do ranking fica em coluna à direita, e não na ponta livre da barra. Desvio declarado no `notes` (a linha da meta cruzaria o rótulo perto de 18%) e sem consequência visível.
- `v2`, redação: BA empata com SP em 17,0% e fica fora do corte das 10, e RJ imprime 17,0% no tile com 16,99%. O cartão não diz que o desempate é pelo volume de leads.
- `v2`, DAD-1: a amostra rala que a `v1` marca com contorno pontilhado (RR com 28 leads, AP com 40) não tem sinal na `v2`; o volume só está na dica.
- `v3`: os itens de mesma rodada estão no parecer (desvio sem o símbolo de percentual dentro do hexágono, limiar de 15% na legenda, quinto item do catálogo trocado sem declarar, sigla e número a 1,98 px, diferença de 0,59% e 0,65% entre o preview e a página, 236 px por mapa contra os 280 do `notes`).
- `v4`, ESP-3: `sem dado` cabe no tile com 1,5 a 2 px de folga de cada lado até o contorno tracejado (tinta de 48,5 px num vão de 52 px, medido nos dois PNGs). Sem colisão no canvas de 640 px; em cartão mais estreito o rótulo, que é `whitespace-nowrap`, passa do tile. A folga sai da coluna lateral de 160 px ou do vão de 16 px.
- `v4`, NUM-6: `18% do total de 6.890` sem o substantivo; o rótulo do card (`Leads sem UF`) dá a unidade.
- `v4`, EST-2: a ausência é escrita à mão como `sem dado` no tile, na legenda e na dica, como o catálogo pede, enquanto a dica das outras três versões usa `formatUnavailable()`. São dois vocabulários para a mesma ausência dentro do modelo; decidir um ao colar no Farol.
- `v4`, ROT-4: a legenda lateral tem 8 linhas e 142 px, metade da altura do corpo. Não tira altura do mapa, mas é ela, com o card, que estreita os tiles para 53 px.
- `v4`, TOK-8: no tema escuro os cinco tiles da classe `1 a 70` (RO, PI, AL, RN e PB) medem 1,14:1 contra o cartão e não têm contorno. Leem pelo número escrito, que é a isenção, mas são os tiles mais apagados do modelo.
- As quatro, DAD-9: o período do recorte (primeiro semestre ou segundo trimestre de 2026) só existe no comentário do `data.ts`. Nem o corpo nem a frase acessível o dizem, e fica para o título do `VisualCard`.

Segunda passada de 2026-10-13, sobre a `v2` e a `v3` corrigidas no mesmo dia (`Chart.tsx` de 10:23 e de 10:22, PNGs de 10:23). As duas aprovadas: os dois bloqueantes do parecer saíram e nenhum outro apareceu. Das observações anteriores da `v2` e da `v3`, só a da escala do ranking sem a meta deixou de valer; as demais continuam. O que segue não reprova.

- `v2`, TOK-10: a linha da meta em `--text-secondary` mede 1,16:1 no escuro e 1,35:1 no claro sobre a barra acesa de PR e quase some por 12 px. A leitura se mantém, porque a linha segue visível 4 px acima e 4 px abaixo e a barra passa dela. A saída da armadilha é o halo na cor da superfície ou a guia interrompida.
- `v2`, empilhamento abaixo de 560 px (lido no código, não renderizado): o ranking tem 216 px fixos e a grade é `flex-1` com `min-h-0`, então o corpo pede cerca de 474 px de altura para o tile guardar sigla e valor. Em cartão de altura fixa menor a grade encolhe abaixo do texto (no `quadrado`, de corpo perto de 361 px, cada linha cai para cerca de 10 px). Com altura automática funciona.
- `v2`, ramo de UF sem lead (lido no código, não renderizado): a contagem da legenda sai sem substantivo (`(1)`), a linha de leitura passa a `7 de 26 UFs` sem a palavra `medidas` que a frase acessível traz, e a legenda com o terceiro item quebra em duas linhas nos 509 px do mapa e tira 16 px da grade.
- `v2`, COR-2 e ROT-4: no mapa o tile de `highlightId` muda só o preenchimento, o anel some nele por ter a mesma cor, e a legenda, que é frase sem amostra, não diz o que é o tile preenchido. O peso 700 está só no ranking.
- `v2`, ANO-3: o rótulo `meta 18,0%` é ancorado à direita da linha, sem trava. Com a meta abaixo de cerca de 28% do teto da escala ele encosta no `10 maiores`, que passa 13 px da coluna de 32 px. No dado padrão a folga é de 126 px.
- `v3`, NUM-6: o número do hexágono segue sem o símbolo (`+17`) sob um cabeçalho em reais (`média R$ 84`); a unidade está na linha da legenda (`em %`) e na dica. Há folga para escrever o símbolo: os três mapas somam 740 px num corpo de 894 px e, pela conta, não renderizada, a célula de 36 px dá cerca de 33 px na linha do número, contra cerca de 28 px de `−30%`.
- `v3`, pergunta 21: o preview difere da página em 0,59% dos pixels no escuro e 0,65% no claro, acima do 0,5% da pergunta e abaixo dos 2% em que o render reprova. Cerca de metade está no subtítulo da moldura, fora do Chart; na área do Chart são 0,29% e 0,33%. É avanço de texto depois de `CPL ` e nas siglas PA e AC, e as marcas são idênticas.
- `v3`, limiar: `bucketOf` põe o desvio de exatamente 15 na classe forte, dos dois lados, e a legenda a chama de `mais de 15%`. Nenhuma UF do dado padrão cai em 15.
- `v3`, `meta.json`: o `notes` diz três mapas de 280 px e cada um mede 236 px (740 px no total); diz que o Nordeste vai 8 px à direita e cala os 4,62 px para cima; e o quinto item do catálogo (abaixo de 32 px só a sigla) segue trocado pelo da ausência sem dizer que o SVG tem tamanho fixo e nunca fica abaixo de 32 px.
- `v3`, macrorregiões: quatro das 18 fronteiras entre regiões ficam só com o vão comum de 2,00 px (MA com AP, MA com TO, MT com RO e MT com TO); as outras 14 têm de 5,2 a 10 px. O `demonstrates` declara as duas do Nordeste e cala as duas de MT, que só têm o degrau vertical de 6 px.
- `v3`, ESP-3: dois contornos tracejados vizinhos (RR com AP, na Busca e na Profissional) ficam a 0,5 px um do outro e leem como linha dupla; tracejado contra hexágono cheio fica a 1,25 px. Sem fusão nos dois PNGs.
- `v3`, COLISAO-TEXTO (aviso do check): sigla e número a 1,98 px de tinta a tinta em 74 pares. Nos dois PNGs leem como duas linhas, e a tinta fica a 2,4 px ou mais da borda nos 74 hexágonos preenchidos.
- `v3`, TOK-9: as duas classes leves (5% a 15% abaixo e acima) se separam por 1,19:1 no escuro e 1,12:1 no claro, e os dois extremos por 1,34:1 e 1,19:1. Quem distingue é o matiz e o sinal escrito, que está em todo hexágono medido.
- `v3`, frase acessível: `tem mais UFs acima da média` compara contagens absolutas entre plataformas de bases diferentes (26, 25 e 23 UFs medidas). No dado padrão a ordem pela parcela é a mesma.
