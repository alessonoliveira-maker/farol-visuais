# Radar simples

## O que é

Um polígono para uma entidade sobre 5 a 8 eixos que saem do centro, todos na mesma escala declarada (índice de 0 a 100). Cada eixo é uma dimensão, a distância do centro é o valor e o centro é o zero. Lê-se como perfil, onde a entidade é forte e onde é fraca, e não como ranking nem como magnitude: a área do polígono cresce com o quadrado do raio e a forma muda se a ordem dos eixos mudar, por isso a ordem vem do registry e o valor exato vai escrito. O modelo absorve a faixa de referência do grupo, a coroa entre o mínimo e o máximo desenhada por `shape` do `Radar`, com a entidade em linha por cima.

## Quando usar

- Perfil de uma entidade em 5 a 8 dimensões na mesma escala: executivo, SDR, origem de lead, área.
- A pergunta é onde a entidade é forte e onde é fraca, com o valor exato escrito no eixo ou no vértice.
- Posição da entidade dentro da faixa do grupo (mínimo a máximo de ao menos 8 membros), com a coroa como contexto.
- Público que já lê o formato e um botão ver como barras ao lado, com os mesmos dados.

## Quando evitar

- Ranking ou comparação de magnitude entre dimensões: barras agrupadas (`02_barras-horizontais/02`).
- Menos de 5 ou mais de 8 eixos: barras com rótulo direto (`02/01`) ou stellar chart (modelo 05).
- Métricas de unidades diferentes sem normalização declarada: pequenos múltiplos de barras ou coordenadas paralelas com escala por eixo (modelo 06).
- Entidade contra outra entidade ou contra a média: radar comparativo (modelo 02).
- Faixa do grupo com menos de 8 membros, em que mínimo e máximo são as próprias pessoas: dot plot por dimensão (`17_comparacao-de-pontos/01`).
- Quem precisa do valor exato de cada dimensão para decidir: tabela com heatmap nas células (`14_tabelas-visuais/02`).

## Anatomia

1. **Grade** (`PolarGrid`) em `--line-subtle`, polígono ou circular (`gridType`), com `zIndex` acima da área para continuar visível por baixo do preenchimento.
2. **Eixos de dimensão** (`PolarAngleAxis`) com `tick` próprio: nome em `--text-secondary` (Manrope), valor em `font-display` e `formatInt`; nome longo quebra em duas linhas, e o bloco cresce para fora do eixo.
3. **Escala** (`PolarRadiusAxis`) com `domain` fixo de 0 a 100, sem `innerRadius` e sem `allowDataOverflow`. Os números ficam no vão onde o polígono chega menos longe e só nos níveis acima dele, porque texto sobre a área não passa o piso de contraste.
4. **Série** (`Radar`) em `--chart-1`, traço de 2 px e pontos com contorno `--surface-raised`. O preenchimento sai com 0,66 de opacidade, o mínimo que a ACE-5 aceita para `--chart-1` no tema claro.
5. **Marcas de exceção**: eixo mais fraco com ponto maior e peso 700 (v2), vértice fora da faixa vazado e com valor (v3), eixo sem dado tracejado em `--text-muted` com a palavra no rótulo (v4).
6. **Coroa da faixa** (v3): um `path` com `fill-rule` evenodd entre o contorno do máximo e o do mínimo, em `--line-strong`.
7. **Linha de leitura e legenda**: frase de 12 px calculada do dado, com o método da escala (`formatInt`); a legenda da v3 traz amostra de linha, de ponto vazado e de área.

## Versões

- `v1_perfil-de-qualidade-da-origem`: composição mínima, domínio fixo de 0 a 100, seis eixos com nome e valor e `outerRadius` de 72%.
- `v2_perfil-do-sdr-com-eixo-mais-fraco`: grade circular, valor em cada vértice por `label` do Radar, eixo mais fraco com ponto maior e peso 700, anotação calculada do dado.
- `v3_executivo-na-faixa-do-time`: coroa entre mínimo e máximo de 11 executivos por `shape`, executivo em linha por cima, vértices fora da faixa vazados e com valor, nomes quebrados por `tspan`.
- `v4_eixo-sem-dado-e-indice-normalizado`: eixo `null` com traço interrompido e sem ponta falsa até o centro, `sem dado` no rótulo, dica com posição no time e estado vazio com `role="status"`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual e troque o `data.ts` pelo registry de métricas: a ordem dos eixos deve ser a do registry e a mesma em todas as telas.
2. Passe os eixos como lista de `{ id, label, phrase, value }` (a v3 acrescenta `min` e `max`, a v4 acrescenta `rank`). `phrase` é o nome como entra no meio de uma frase, com sigla na caixa certa.
3. Embrulhe num `VisualCard` do Farol; o título, a procedência e o aviso de protótipo são do cartão, o Chart não desenha nenhum.
4. Ofereça ao lado o botão ver como barras com os mesmos dados e a mesma ordem (barras agrupadas, `02_barras-horizontais/02`).
5. O estado vazio inline vira `EmptyState` ou `UnavailableState` do Farol, mantendo o sentido do texto.
6. O `PolarRadiusAxis` entrega o número da escala com `transform` de rotação pelo ângulo do eixo; o `tick` próprio descarta o giro e usa só `x` e `y`, porque texto girado é proibido.

## Referências

- Recharts, [`RadarChart`](https://recharts.github.io/en-US/api/RadarChart/), [`Radar`](https://recharts.github.io/en-US/api/Radar/), [`PolarGrid`](https://recharts.github.io/en-US/api/PolarGrid/) e [`PolarAngleAxis`](https://recharts.github.io/en-US/api/PolarAngleAxis/): `shape`, `isRange` e `baseLinePoints` sustentam a coroa da v3.
- Comportamento do pacote 3.10.1 conferido nesta produção: `computeRadarPoints` dá raio zero ao valor `null` e o ponto sai com coordenada válida no centro (`recharts/es6/polar/Radar.js`), então a linha padrão colapsa no centro e o `dot` padrão desenha um zero; o `LabelList` do Radar entrega caixa de tamanho zero e `position` não posiciona (REC-34). Vale uma sonda para o dossiê.
- Stephen Few, [Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf), e Storytelling with Data, [o que é um spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): limites do formato e saída para barras.
- Estudo da família: `_estudo/familias/18_radar.md`. No Farol, `app/src/components/visuals/charts/chartTheme.ts` e `ChartTooltip.tsx`.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-10-13: `v2` e `v3` aprovadas, `v1` e `v4` reprovadas, com o parecer em `validation/revisao_18_radar__01_radar-simples_2026-10-13.md`. Nada abaixo reprova._

- `v3`: o comentário do `data.ts` diz que `min`, `max` e `teamSize` incluem o próprio executivo, e com ele dentro da faixa nenhum valor pode sair dela (o dado traz 47 abaixo do mínimo de 51, 38 abaixo de 41 e 84 acima de 78). O desenho só fecha se a faixa for a dos outros 11 executivos: alinhar os dois comentários, e quem colar a peça calcula a faixa sem a entidade, senão o ponto vazado nunca aparece.
- `v3`: três valores em peso 700 (`84`, `47` e `38`), e a TIP-3 admite dois elementos. Sem consequência no preview; o peso 600 nos valores fora da faixa resolve, porque o ponto vazado já é o segundo canal do destaque.
- `v3`: o aviso CONTRASTE-MARCA do `check` continua. O preenchimento da coroa em `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro, e a tabela 17.10 só aprova esse par com o valor escrito; quem faz a coroa ser vista é o contorno em `--text-muted`, medido em 5,21:1 e 5,37:1 contra o cartão. Os valores da faixa moram só na dica.
- `v3`: o comentário de `BAND_COLOR` diz que a faixa de valores vai escrita na dica e na legenda, e a legenda nomeia a faixa sem escrever valor (DAD-10).
- `v3`: a frase acessível diz em quais dimensões o executivo sai da faixa e não diz para que lado; duas saídas são abaixo do mínimo e uma é acima do máximo, e o sentido muda a leitura.
- `v1`, `v2`, `v3` e `v4`: os números da linha de leitura e da legenda saem em Manrope sem `tabular-nums` (TIP-1). Em texto corrido não muda nada no preview.
- `v2`, `v3` e `v4`: a frase acessível escreve "de SDR 04", "de Executivo 07" e "de Executivo 03", sem o artigo. Redação.
- `v1` e `v2`: o comentário do `data.ts` define o índice como parcela (dos leads, do critério) e a tela o chama só de índice de 0 a 100. Se a origem for mesmo uma taxa, o Farol pede o volume junto dela (DAD-1); a `v4` mostra a saída, que é dizer o método na linha de leitura.
- `v2`: o halo do valor `77` encosta no círculo de 100 e o do `50` da escala corta o círculo de 50 por baixo do número. Legível nos dois temas.
- Modelo: dois comportamentos do Recharts 3.10.1 medidos nesta revisão merecem entrada no `ARMADILHAS.md`. Com grade poligonal, o `PolarRadiusAxis` posto na bissetriz de dois eixos entrega o tique no raio cheio, e o anel cruza a bissetriz em raio vezes cos(π/n), então o número cai entre anéis (bloqueante da `v1` e da `v4`). E o `Tooltip` filtra a entrada de valor nulo antes de chamar o `content` (`filterNull` ligado por padrão), então dica própria nunca abre no eixo sem dado (bloqueante da `v4`).

_Segunda rodada da revisão independente, 2026-10-13: `v1` e `v4` julgadas de novo pelo arquivo corrigido e aprovadas. Os três bloqueantes da primeira rodada saíram: grade circular nas duas, rótulos do topo e da base por fora do gráfico na `v1`, dica aberta no eixo sem dado na `v4`. A dica, o estado vazio da `v1` e os dois estados da `v4` foram sondados em navegador nos dois temas. Nada abaixo reprova._

- `v1` e `v4`: o número da escala fica a 4 px por fora do anel que nomeia e a cerca de 12 px do anel seguinte, e o `100` por fora do último anel fecha a leitura. Na `v4`, em que a escala desce na diagonal, o halo do número interrompe a linha do anel ao lado dele. Legível nos dois temas. O recuo de 4 px está escrito solto em `renderScaleTick` e merece constante nomeada no topo.
- `v1`: os pontos herdam o `fillOpacity` de 0,66 do `Radar` (cada `circle` do `preview.svg` sai com `fill-opacity:0.66`), e a grade, que sobe por `zIndex`, passa por cima do traço da série e aparece por dentro do ponto. Só se vê na ampliação de 4 vezes; `fillOpacity: 1` no objeto do `dot` resolve.
- `v1`: nome de duas linhas no eixo do topo ou no da base não cabe no canvas `quadrado`. O bloco de três linhas iria até a borda do palco, com o centro da última linha em 327,6 px num palco de 332 px e o da primeira a 4,4 px do topo (conta sobre o `preview.svg`, não render). Com o dado da versão não acontece; quem colar com nome longo nesses dois eixos precisa de mais altura ou de `outerRadius` menor.
- `v1`: a frase acessível e a linha de leitura usam `label.toLowerCase()`, e uma sigla no rótulo sairia em caixa baixa. As outras três versões usam `phrase`, e o passo 2 do Como colar descreve `phrase` como campo de todas.
- `v4`: `cursor={false}` e `activeDot={false}` deixam a dica sem marca do eixo ativo, e a DIC-3 pede cursor discreto. Só aparece na interação. Com o mouse no centro exato, onde mora o ponto do zero medido, a dica não abre; abre ao longo do eixo.
- `v4`: o estado de todos os eixos nulos começa em caixa baixa ("indisponível: nenhuma dimensão de Executivo 03 foi medida no trimestre."), porque `formatUnavailable()` devolve a palavra assim. Redação.
- `v1` e `v4`: continuam valendo as linhas da primeira rodada sobre `tabular-nums` na linha de leitura (TIP-1), sobre o índice definido como parcela no `data.ts` da `v1` e sobre a falta do artigo na frase da `v4`. O `data.ts` e o `meta.json` das duas não mudaram entre as rodadas.
