# Coroplético por UF

## O que é

O mapa em que cada UF é pintada pela classe de uma taxa: a medida vira de 3 a 7 classes por uma regra
escrita (quantis, intervalos iguais ou limites fixos), cada classe ganha uma cor, e a legenda diz o
intervalo de cada uma. Lê-se pela vizinhança e pelo contraste entre regiões, mais do que pela ordem
exata das UFs.

**Neste catálogo o coroplético não usa o contorno real das UFs.** A lista de imports do contrato é
fechada e a versão só aceita cinco arquivos, então não existe o módulo de geometria (`ufPaths.ts`,
`regiaoPaths.ts`) que o estudo previa a partir da malha do IBGE. Por decisão do dono, as quatro
versões pintam o coroplético sobre uma **malha de hexágonos** desenhada à mão e declarada no
`data.ts` de cada versão, com a vizinhança que se perde e a que se cria escritas no comentário. O que
fica do modelo é o que o define: classificação em classes, cor por classe e legenda em degraus. O que
muda é que todo hexágono tem a mesma área, então a Amazônia não domina e toda UF comporta a sigla.

A diferença para o tile grid (`23_mapas/01_tile-grid-por-uf`): lá o número no tile é a leitura e a
cor é apoio; aqui a classe é a leitura, a regra de classificação é parte da peça, e as versões
percorrem as quatro escalas do coroplético: sequencial, divergente, por camada e bivariada.

## Quando usar

- Taxa normalizada por UF (qualificação, CPL qualificado, receita por cliente) nas 27 UFs.
- Contraste entre regiões e vizinhança, como Sul contra Nordeste, mais do que a ordem exata.
- Desvio contra uma referência única (média nacional, meta), com sinal dos dois lados.
- Visão por macrorregião com abertura para as UFs de uma região, com tabela ao lado.
- Relação entre duas taxas por UF em 3 classes cada, quando há espaço para a legenda 3x3.

## Quando evitar

- Total absoluto por UF: a cor por classe esconde a magnitude; use os símbolos proporcionais
  (`23_mapas/03_simbolos-proporcionais`).
- Ranking preciso ou diferença pequena entre UFs: use as barras ordenadas
  (`02_barras-horizontais/01_barras-simples-ordenadas`).
- Forma e área reais são parte da resposta (logística, fronteira, distância): este modelo não as
  tem; a saída é o pedido de geometria registrado em Referências.
- Tendência de cada UF no tempo: use a matriz categórica
  (`15_mapa-de-calor-e-calendario/02_matriz-categorica`).
- Público sem tempo para ler legenda de 9 cores: troque o bivariado por dois coropléticos lado a
  lado ou pela dispersão (`09_dispersao-e-bolhas/01_dispersao-simples`).

## Anatomia

1. **Malha:** `HEX_GRID` no `data.ts`, um Record de UF para linha e coluna, com as linhas ímpares
   deslocadas meia célula. O componente calcula os centros uma vez (`buildLayout`) e desenha em
   escala 1, com largura e altura iguais ao `viewBox`, para o texto de 11 px chegar com 11 px.
2. **Hexágono:** polígono SVG de ponta para cima, com 2 px de vão na cor do cartão entre vizinhos
   (COR-5). Sigla em 11 px de peso 600 e, quando cabe, o valor em `font-display` por `formatPercent`,
   `formatDecimal` ou `formatCurrency`.
3. **Classificação em TypeScript**, sempre sobre o valor já arredondado na precisão em que é
   escrito, para a cor nunca contradizer o número: quantis (`v1`), limites fixos sobre o desvio
   (`v2`), intervalos iguais (`v3`) e tercis por variável (`v4`).
4. **Cor:** sequencial em `--seq-1`, `--seq-2`, `--seq-3`, `--seq-6` e `--seq-7`, com texto em
   `--text-primary` nas três baixas e `--accent-cyan-contrast` nas duas altas; divergente em
   `--positive` e `--negative` misturados com `--surface-raised`; bivariada em `--chart-5`,
   `--chart-1` e `--chart-7`. Em cada versão a cor mora numa constante ou função só.
5. **Legenda em degraus** com o intervalo de cada classe escrito e a contagem de UFs. No bivariado,
   a grade 3x3 com os dois eixos nomeados e o limite escrito na divisa.
6. **Estados fora da escala:** UF sem medida é hexágono vazado com contorno pontilhado em
   `--text-muted`; variável ausente é hachura; amostra pequena é preenchimento recuado com contorno
   pontilhado. Nenhum deles vira zero nem entra numa classe.
7. **Texto ao lado:** lista, anotação ou tabela com o número que o hexágono não comporta (volume da
   taxa, posição no ranking, cobertura do dado).
8. **Raiz** `figure` com `aria-label` calculado do dado: tipo, quantas UFs, quem lidera ou se afasta.

## Versões

- `v1_taxa-de-qualificacao-sequencial`: 5 classes por quantis sobre a taxa de qualificação, com o
  dado casado pelo código do IBGE, legenda em degraus com intervalo e contagem, e a lista das 5
  maiores taxas com o volume.
- `v2_desvio-da-media-nacional`: escala divergente em torno da média nacional, três intensidades por
  lado, sinal escrito em todo valor, contorno grosso e anotação na UF que mais se afasta, legenda
  simétrica com a média no meio.
- `v3_macrorregiao-com-drill-para-uf`: cinco macrorregiões como blocos, prop `selectedRegion` que
  abre uma região em UFs e afunda as demais, tabela sincronizada com valor, posição e cobertura, e
  frase acessível que muda com a região aberta.
- `v4_bivariado-com-variavel-ausente`: CPL qualificado e taxa de qualificação em 3 classes cada,
  paleta 3x3 com legenda própria, sigla, taxa e CPL escritos em cada hexágono classificado, UF sem CPL em hachura, amostra pequena com contorno pontilhado e
  tabela do canto CPL alto com taxa baixa.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão e troque o array `data` pela lista vinda da query,
   mantendo **contagem** e não taxa pronta (leads e qualificados, receita e clientes, investimento).
   A taxa é derivada no componente de propósito.
2. Mantenha `null` para o que não foi medido e nunca troque por zero: é o que separa a hachura e o
   hexágono vazado das classes da escala.
3. A malha `HEX_GRID` é desenhada à mão e aproxima a vizinhança. Se o Farol adotar uma malha
   versionada, troque só a constante; o resto do componente lê linha e coluna.
4. Na `v1`, a chave da linha é o código do IBGE e o casamento é pela tabela `IBGE_TO_UF`. Linha com
   código fora da tabela não entra no mapa e é contada numa nota.
5. Na `v3`, comece com `selectedRegion` em `null` (visão de macrorregiões) e ligue a prop ao estado
   da página; o `data.ts` do catálogo abre o Nordeste só para o preview mostrar o drill. Se um dia o
   Farol ganhar o módulo de contornos reais, ele é pesado e deve entrar por import dinâmico na
   página que cola o visual, nunca dentro do `Chart.tsx`, onde o contrato proíbe.
6. O SVG tem tamanho fixo (264 por 224 px na `v1` e na `v2`, 313 por 269 px na `v3`, 407 por 345 px
   na `v4`) e não encolhe: confira se o cartão comporta mapa e coluna lateral antes de colar.
7. A dica é o `title` nativo do SVG e traz o volume que o hexágono não escreve. Troque por
   `ChartTooltip` se o Farol quiser dica estilizada.
8. Embrulhe no `VisualCard`, troque o estado vazio inline por `EmptyState` (seção 16 do contrato) e
   diga o período do recorte no título do cartão, porque o corpo não o escreve.

## Referências

- Cynthia Brewer, ColorBrewer: classes sequenciais e divergentes para coroplético e o teto de
  classes legíveis.
- Joshua Stevens, "Bivariate Choropleth Maps: A How-to Guide": a paleta 3x3, a legenda em grade e a
  classificação independente por variável.
- Storytelling with Data, "What is a choropleth map": taxa em vez de total e dado ausente distinto
  de zero.
- NPR Visuals, "Let's Tesselate: Hexagons for Tile Grid Maps": o argumento da área igual e as
  adjacências que o hexágono perde.
- IBGE, códigos de UF da Divisão Territorial Brasileira: os 27 códigos da tabela `IBGE_TO_UF`.
- Arquivo do Farol de referência: `app/src/components/visuals/charts/chartTheme.ts` (rampa
  `CHART_SEQUENTIAL_COLORS`).
- **Pedido fora da lista de imports (seção 6):** um módulo de geometria das UFs e das macrorregiões
  (paths da malha do IBGE em qualidade mínima, cerca de 48 KB e 15 KB) como import liberado. Sem
  ele o contorno real não entra, e este modelo fica na malha de hexágonos.
- **Lacunas de paleta que o modelo contorna:** não há tokens divergentes (TOK-3) nem bivariados, e a
  rampa sequencial tem dois degraus sem texto legível (TOK-2). Quando existirem, mudam só
  `bucketFill` da `v2`, `PALETTE` da `v4` e `CLASS_COLORS` das demais.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, sobre os arquivos do mesmo dia. `v1`, `v2` e `v3` aprovadas; `v4` reprovada, com o parecer em `validation/revisao_23_mapas__02_coropletico-por-uf_2026-10-13.md`. O que segue não reprova e fica para quem tocar o arquivo.

- `v1`, DAD-1 e NUM-1: a taxa vai em todo hexágono sem o volume, que só aparece na lista das 5 maiores e na dica. As outras 22 UFs vão de 80 a 1.020 leads e nenhuma leva sinal de amostra rala, como o contorno pontilhado de `23_mapas/01_tile-grid-por-uf/v1`.
- `v1` e `v2`, redação: a UF que não veio no dado cai no mesmo ramo da UF com zero lead, e a dica e a legenda dizem "sem lead recebido" para as duas. O dado padrão não exercita o ramo; conferido só por leitura de código.
- `v2`, NUM-6: o desvio no hexágono sai sem a unidade (`+7,5`). Ela está no título da legenda, em cada degrau, na anotação e na dica, e o texto com `p.p.` não cabe nos 38 px desenhados. Declarado no `notes`.
- `v2`, DAD-1: o desvio não mostra volume em nenhum ponto do desenho parado, e as 5 UFs do degrau mais negativo são de amostra pequena (RR com 75 leads, AP com 90, PI com 120, MA com 200 e PA com 290). A anotação do maior desvio comporta o volume (`91 de 380`), e o degrau da média também (`1.798 de 10.945`).
- `v2`, NUM-4: a anotação do maior desvio não nomeia a base na própria linha; a média nacional de 16,4% está escrita no degrau do meio da legenda.
- `v3`: a visão padrão de macrorregiões (`selectedRegion` nulo) não aparece no preview, porque o `data.ts` abre o Nordeste. O ramo foi conferido só por leitura de código (classes de R$ 530 a R$ 830 em passos de R$ 60, Norte na mais baixa e Nordeste na mais alta), não por render. Declarado no `notes`.
- `v3`, redação: `1º de 26 UFs` no masculino ao lado de `1ª de 5 regiões`, e o cabeçalho da primeira coluna diz `UF` sobre a linha da região (`Nordeste, 9 UFs`).
- `v3`: o hexágono de 46 px comporta valor de até R$ 999; acima disso o texto passa da célula. Declarado no `notes`; o dado padrão para em R$ 912.
- `v1`, `v2` e `v4`, ROT-4: a legenda ao lado do mapa passa dos 30% da altura do corpo (cerca de 44% na `v1`, 59% na `v2` e 66% na grade 3x3 da `v4`). Fica ao lado, não tira altura do mapa e não tem consequência visível.
- As quatro, TIP-4: o número em `font-display` dentro do SVG e nas tabelas não declara peso e herda o 400, fora da lista de pesos da Space Grotesk; o navegador entrega o 500. Sem consequência visível.
- README, TOK-8: a saída da armadilha pede declarar que a cor não ordena quando a rampa tem quatro faixas ou mais. Os comentários dos `Chart.tsx` dizem que a cor é apoio de varredura, mas a frase não está neste README.
- `v4`: os itens de mesma rodada estão no parecer (legenda da hachura que diz "sem mídia paga" também para UF com mídia e sem lead qualificado, tercis da taxa calculados com as 3 UFs sem CPL, canto alto e alto menos contrastado que o de taxa alta com CPL baixo no tema escuro, `--text-primary` dentro da mistura de um preenchimento).

Revisão de 2026-10-13, segunda passada, só da `v4`, sobre o `Chart.tsx` e o `meta.json` de 11:39:52. A `v4` segue reprovada, agora por outro motivo (a linha do CPL sai do hexágono), com o parecer na segunda passada do mesmo arquivo em `validation/`. O bloqueante da primeira passada está resolvido. O que segue não reprova.

- `v4`, DIC-1: a taxa das três UFs em hachura (RO 10,2%, TO 10,9% e AP 11,1%) só aparece na dica, e elas passaram a ser as únicas sem taxa no desenho parado. A célula de 62 px comporta a taxa sob a sigla, com o mesmo halo.
- `v4`, NUM-6: na tabela do canto em foco, `8,9% (10 de 112)` vai sem o substantivo; a dica escreve "10 de 112 leads".
- `v4`: a tabela do canto em foco repete o CPL e a taxa que o hexágono agora escreve; o que ela acrescenta é o nome e o volume.
- `v4`, DAD-1: a taxa no hexágono vai sem o volume; a amostra pequena é marcada pelo pontilhado e o volume das outras 20 UFs fica na dica, como na `v1`.
- `v4`, ROT-4: com o canvas de 960 por 480 px a grade 3x3 ocupa 185 dos 362 px do corpo (51%, e não mais os 66% da linha acima). Fica ao lado do mapa, sem consequência visível.
- `v4`: os quatro itens da primeira passada (legenda da hachura, tercis da taxa sobre 27 UFs, canto alto e alto no escuro e `--text-primary` em preenchimento) seguem iguais no arquivo.
- README, Anatomia, item 2: diz sigla em 11 px; na `v4` a sigla está em 12 px.
