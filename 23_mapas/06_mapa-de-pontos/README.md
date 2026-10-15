# Mapa de pontos

## O que é

Pontos de mesmo tamanho sobre o contorno neutro do país, um ponto por item ou um ponto a cada N itens, para ler distribuição, agrupamento e lacuna. O tamanho nunca codifica valor: a leitura é onde há ponto, onde há mistura de cores e onde não há nenhum. Com um ponto a cada N itens, a posição dentro da UF é sorteada por gerador de semente fixa com teste de ponto dentro do polígono, e o mapa diz que essa posição é ilustrativa. Item sem município nunca vai para o centroide da UF.

**Neste catálogo não há a malha do IBGE.** A lista de imports do contrato é fechada e não tem o módulo de geometria. O contorno do país (51 pontos) e as coordenadas vivem no `data.ts` de cada versão, escritos à mão e declarados como aproximados. O viewBox tem escala 1 (pixels por grau fixos) para o texto de 11 px chegar com 11 px.

## Quando usar

- Localização de itens individuais com coordenada confiável, como eventos, escritórios ou clientes por cidade, até algumas centenas de pontos como `circle`.
- Densidade e aglomeração em escala nacional, com um ponto a cada N itens, até alguns milhares de pontos num path único por cor.
- Raio de atuação em torno de poucos pontos de referência.
- Distribuição por categoria com até 5 cores, quando a mistura no espaço importa.

## Quando evitar

- Dado só com UF, sem município ou coordenada exata: use o tile grid (`23_mapas/01_tile-grid-por-uf`) ou os símbolos proporcionais (`23_mapas/03_simbolos-proporcionais`).
- Densidade de duas medidas sem geografia: use a densidade 2D (`09_dispersao-e-bolhas/09_densidade-2d`).
- Ligação entre pontos: use a família 27, de rede e relações.
- Deslocamento de volume entre locais: use a família 11, de fluxo e sankey.
- Contagem exata por cidade: use a tabela com barras inline (`14_tabelas-visuais/01_tabela-com-barras-inline`).

## Anatomia

1. **Contorno do país:** polígono em `--surface-sunken` com traço `--line-subtle`. `--surface-overlay` não serve, porque no tema claro é o mesmo branco do cartão.
2. **Ponto:** círculo de raio fixo em px, `--chart-1` (ou o slot da categoria) com `fillOpacity` acima do mínimo medido (0,66 a 0,71) e contorno `--surface-raised`.
3. **Projeção:** `x = (lon − lonMin) × DEG_PX` e `y = (latMax − lat) × DEG_PX`, o mesmo sistema do coroplético, em px por grau.
4. **Exceção desenhada:** cidade medida com zero evento e item fora do raio são anel vazado (`--text-muted`), nunca ponto cheio nem marca ausente.
5. **Posição sorteada:** `seeded()` (mulberry32) e `insideRing()` (ray casting) em TypeScript, sem `Math.random`.
6. **Legenda de contagem:** "1 ponto = N", com amostra do ponto, contagem e percentual por categoria em `formatInt` e `formatPercent`.
7. **Anotação curta** (no máximo duas, 11 px) sobre o padrão a ver, com halo na cor da superfície.
8. **Raiz** `figure` com `aria-label` calculado do dado; estado vazio com `role="status"` e ícone `Filter`.

## Versões

- `v1_eventos-presenciais-por-cidade`: um ponto por evento nas cidades (com margem de 10 px no viewBox), anel para cidade sem evento, anotação sobre o Norte vazio e contagem por macrorregião abaixo do mapa.
- `v2_raio-de-atuacao-dos-escritorios`: raio de 100 km em elipse, distância por haversine, cliente dentro cheio e fora vazado (classe pela coordenada da cidade, ponto desenhado do lado certo da elipse; todas as contagens da tela, inclusive por escritório, vêm do `data.ts` e não dos pontos desenhados, e cliente sem lugar no desenho aparece numa linha "ficaram sem ponto", ausente no dado padrão), ícone `Building2` no escritório, em recorte do Sudeste e do Centro-Oeste.
- `v3_um-ponto-a-cada-cinco-leads-por-origem`: 1 ponto a cada 5 leads em pequenos múltiplos, um mapa por origem, posição sorteada na UF com ray casting, um path por mapa sem contorno e aviso de posição ilustrativa.
- `v4_leads-sem-municipio-fora-do-mapa`: card dos leads sem município, cachos compactos em malha hexagonal restrita ao contorno, que crescem com a contagem, nenhum ponto no centroide, lista de UFs e frase acessível que soma pontos e leads fora do mapa.

## Como colar no Farol

1. Trocar o `data.ts` pelo dado real (cidade com coordenada, ou UF com contagem), mantendo a ausência como `null` e nunca como `0`.
2. Trocar o contorno e as caixas de UF pelo módulo de geometria do Farol quando ele existir; o ray casting passa a rodar sobre o polígono real da UF e o aviso de posição ilustrativa continua valendo.
3. Acima de alguns milhares de itens, manter um único `path` por cor com subcaminhos de círculo.
4. Embrulhar num `VisualCard` e usar `EmptyState` no lugar do estado vazio inline; a dica nativa `<title>` pode virar a `ChartTooltip`.

## Referências

- Pedido registrado: a malha do IBGE como módulo de geometria (`ufPaths.ts` e `ufCentroides.ts`), fora da lista de imports da seção 6 do contrato; hoje o contorno e as caixas de UF são aproximados.
- Haversine para distância entre coordenadas: fórmula padrão com raio médio da Terra de 6.371 km; a elipse em graus do raio é aproximação, e a tela diz.
- Estudo da família: `_estudo/familias/23_mapas.md`.
- Arquivo do Farol de referência para formatação: `app/src/lib/format.ts`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, sobre os arquivos do mesmo dia. As quatro versões foram reprovadas, e os bloqueantes estão no parecer `validation/revisao_23_mapas__06_mapa-de-pontos_2026-10-13.md`. O que segue não reprova e fica para quem tocar o arquivo.

- As quatro, TIP-1: os números da linha de leitura e das frases de legenda ("40%", "1 ponto = 5 leads") estão em Manrope sem `tabular-nums`. Sem consequência no render.
- As quatro, tabela 17.1: o texto de legenda está em 11 px e a tabela pede 12 px; na `v4` o número do card está em 24 px e a tabela pede 30 px. Sem consequência no render.
- As quatro, TIP-7: `truncate` no nome da cidade (`v1`), do escritório (`v2`), da origem (`v3`) e da UF (`v4`), e nenhum desses nomes está na frase acessível. Hoje cabem com folga. Na `v3` é o único lugar em que a origem tem nome.
- As quatro, ACE-5: a opacidade mínima citada na Anatomia (0,66 a 0,71) foi medida contra o cartão, e o ponto fica sobre o contorno do país, em `--surface-sunken`. Medido contra ele, passa: mínimo de 3,24:1 (`--chart-6` a 0,80 no claro).
- `v1` e `v2`: o halo em `--surface-sunken` desenha uma tarja onde o texto passa do contorno do país para o cartão. Na `v1` a anotação "nenhum evento no Norte" ocupa de x = 20 a 95 e o país, nessa altura, vai de 36 a 75; o halo apaga a fronteira embaixo dela.
- `v1`: a âncora da anotação é constante (`NOTE_LON`, `NOTE_LAT`), então "nenhum evento no Sul" seria escrito sobre o Amazonas. Derivar a posição da região vazia.
- `v1`: "Cidades com mais eventos" corta em 5 dentro de um empate. Seis cidades têm 3 eventos e a lista mostra três, pela ordem alfabética.
- `v1`, NUM-6: a contagem por macrorregião do rodapé ("Nordeste 10") não leva o substantivo.
- `v1`: os pontos de Ribeirão Preto e de Uberlândia ficam a 4,42 px entre centros, com 0,78 px de sobreposição. Os dois se contam.
- `v1`: 13 das 18 cidades com evento só têm nome na dica nativa `<title>`. Sem as divisas a posição identifica pouco; rever quando a malha existir.
- `v2`, redação: "Recorte do Sudeste e do Centro-Oeste" inclui Londrina, que é do Sul; e a linha de leitura repete o 88 que a legenda escreve logo abaixo.
- `v3`: é o caso que o próprio "Quando evitar" manda para o tile grid, dado só com UF. Fica por decisão do catálogo, com o aviso de posição ilustrativa na tela.
- `v3`: as caixas das UFs se sobrepõem (a de São Paulo cobre parte do Paraná, de Minas Gerais e do Mato Grosso do Sul), então ponto de uma UF cai no território da vizinha e engrossa a aglomeração.
- `v3`: a amostra da legenda tem 9 px de diâmetro para um ponto de 3,2 px.
- `v4`, NUM-1: "8,0%" é percentual de composição e deveria ser inteiro, "8%".
- `v4`: a lista mostra 4 das 12 UFs, 171 dos 320 leads sem município, sem dizer quantas ficaram de fora.
- `v4`: com `withoutCity` vazio, `?? 0` faz o card escrever 0 e o título da lista fica sem linhas. Decidir se lista vazia é zero medido ou ausência.

Segunda revisão de 2026-10-13, sobre os arquivos corrigidos no mesmo dia (`Chart.tsx` de 13:34 a 13:36, PNGs de 13:38). `v1` e `v3` aprovadas; `v2` e `v4` reprovadas, com os bloqueantes na segunda passada do parecer `validation/revisao_23_mapas__06_mapa-de-pontos_2026-10-13.md`. Do parágrafo acima seguem valendo as quatro linhas "As quatro", as da `v1` (a tarja agora vai de x = 30 a 105, com o país de 46 a 84 nessa altura), a do tile grid, a das caixas de UF e a da amostra na `v3`, e as três da `v4` (a lista agora mostra 3 das 12 UFs, 141 dos 320). Caíram a tarja do halo na `v2` e o Londrina fora do recorte. O que é novo:

- `v2`: a amostra do ponto na legenda tem raio de 2,6 px para um ponto de 2,0 px no mapa.
- `v2`: o selo do escritório ocupa o meio da elipse, então o cliente da própria cidade do escritório é desenhado de 12 a 16,5 px do centro (de 64 a 87 km) e os pontos de dentro formam uma coroa em volta do selo. A tela diz "posição dentro da cidade"; o certo é "em volta da cidade".
- `v2`: a lista por escritório segue a ordem do array (São Paulo, Belo Horizonte, Brasília), nem por valor nem na ordem do mapa, e a linha de leitura repete o 41 que a legenda escreve logo abaixo.
- `v3`: a saturação é declarada na tela e mesmo assim pesa. A tinta à vista vai de 77% do nominal em Mídia paga a 97% em Eventos, e 240 dos 1.960 pontos têm menos de 10% de área só deles. Na caixa do Rio de Janeiro as três maiores origens mostram de 27 a 29 pontos de tinta para 38, 40 e 52 pontos; no Distrito Federal as cinco mostram a mesma mancha de cerca de 5 pontos para 9 a 31. O aviso fala só de UF pequena e manda ler o total da origem, que não diz nada da UF.
- `v3`: `MIN_GAP` vale só entre pontos da mesma UF e só nas 160 primeiras tentativas; ponto de UF vizinha cai por cima sem teste.
- `v3`: sobram cerca de 105 px à direita do quinto mapa no canvas `largo`.
- `v3`: o `fill` sai de `SLOT_COLOR[...]` e a guarda `OPACIDADE-MARCA` não mede a versão, apesar do comentário da linha 38. Medido à mão sobre `--surface-sunken`: mínimo de 3,25:1 (`--chart-6` a 0,80 no claro).
- `v4`: a amostra do ponto na legenda tem raio de 2,7 px para um ponto de 1,7 px no mapa.

Terceira revisão de 2026-10-15, sobre a segunda rodada de correção (`Chart.tsx` das duas de 10:26, PNGs de 10:27). `v4` aprovada; `v2` reprovada, com o bloqueante no parecer `validation/revisao_23_mapas__06_mapa-de-pontos_2026-10-15.md`. Das linhas acima seguem valendo as da `v2` e da `v4`, menos a do ponto sob o selo, que fechou. O que é novo:

- `v2`: três pares de pontos cheios na elipse de São Paulo ficam a 4,65, 5,22 e 5,39 px entre centros, abaixo do `MIN_GAP` de 5,4, pelo piso `MIN_GAP_FLOOR` de 4,5. Os discos à vista ficam a 1,65 px um do outro e se contam. Sem consequência no render.
- `v2`: dois anéis do Rio de Janeiro têm o centro no mar, a 0,73 e 2,28 px além da costa (cerca de 4 e 12 km), e outros quatro pontos têm a tinta sobre a linha da costa. A `v2` não testa o contorno, como a `v4` passou a testar. Fica dentro do erro declarado da costa desenhada à mão.
- `v2`: o maior deslocamento de um ponto até a própria cidade é de 29,0 px (cerca de 150 km, um ponto de São José dos Campos), e os dois pontos de Jundiaí ficam a leste do selo de São Paulo, com a cidade a noroeste. Reforça a troca de "posição dentro da cidade" por "em volta da cidade", e o número cabe na tela.
- `v4`: o maior deslocamento até a própria cidade é de 21,0 px (cerca de 400 km, pontos de São Paulo) e não está escrito na tela, como a segunda passada sugeria. Numa cor só o que se lê é o conjunto de nós ocupados, e toda tinta fica a no máximo 11,9 px (cerca de 230 km) de alguma cidade com lead.
- `v4`: `LEADS_PER_DOT` fixo em 20. Com dado real o tapete do Sudeste cresce sem teto; `if (best < 0) continue` descarta ponto sem rastro depois de 1.686 nós (33.720 leads); e `Math.round` tira do mapa cidade com menos de 10 leads. Ao colar no Farol, calcular o valor do ponto a partir do dado.

Quarta revisão de 2026-10-15, só da `v2`, sobre a terceira rodada de correção (`Chart.tsx` de 10:42, PNGs de 10:43). `v2` aprovada: as contagens saem de `tally` sobre o dado e o cliente sem ponto é escrito na tela. As linhas da `v2` acima seguem valendo. As medidas abaixo saíram de uma bancada que renderiza o `Chart.tsx` de hoje, sem mudar uma linha, com o `data.ts` alterado. O que é novo:

- `v2`, transbordo no ramo: quando algum cliente fica sem ponto, a linha de aviso ocupa duas linhas (32 px, mais 12 px de vão) e leva a coluna da direita a 355,5 px, para um corpo que acaba em 327 (a folga no dado padrão é de 15,5 px). A última linha do rodapé, "Paraná. Posição dentro da cidade é ilustrativa.", fica com a borda inferior do cartão passando no meio das letras, metade fora do cartão, nos dois temas, e a própria página de render acusa conteúdo fora do corpo. Não aparece no preview e o texto continua legível. Ao colar no Farol com dado real, em que o ramo vai disparar, reservar a altura pela conta de linhas da GEO-1 (canvas por número, de pelo menos 392 px de altura) ou levar o aviso para uma linha que já existe.
- `v2`: cabem cerca de 16 pontos cheios em cada elipse. Com o dado em dobro, São Paulo tem 32 clientes na lista e 16 pontos; com o dado multiplicado por 10, são 52 pontos cheios para 330 clientes dentro do raio, e a proporção de tinta cai para 11% contra os 45% escritos. A tela declara quantos ficaram sem ponto, como pede a DAD-2, mas o mapa deixa de mostrar a proporção. Com dado real, usar a outra saída do parecer de 2026-10-15, "1 ponto = N clientes", com N calculado da capacidade das elipses.
- `v2`: a linha de aviso não diz de qual escritório é o cliente sem ponto. Com Jundiaí em 4, a lista escreve São Paulo 18 e a elipse tem 17 pontos cheios, e só a conta de cabeça liga os dois números.
- `v2`, custo: cada cliente sem lugar passa por 900 sorteios e por duas varreduras até 60 px, cerca de 23 mil posições, cada uma testada contra todos os pontos já postos, e `placeClients` roda a cada render, sem `useMemo`. Com o dado multiplicado por 10 (740 clientes), a página leva 3,7 s até ficar pronta, contra 0,5 s no dado padrão. Ao colar no Farol, memorizar e pôr teto.
- `v2`, redação: o comentário de `placeClients` (linha 134) ainda diz que a contagem na tela é a do dado porque cada ponto é aceito do lado certo da elipse; quem garante isso hoje é `tally`. O `notes` do `meta.json` não cita a linha de cliente sem ponto.
