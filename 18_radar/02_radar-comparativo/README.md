# Radar comparativo sobreposto

## O que é

Duas séries no mesmo radar: a entidade e uma referência (média do time, outra entidade, cenários), com escala comum fixa de 0 a 100. O foco vai preenchido e a referência em contorno tracejado, para uma área não esconder a outra. A diferença de forma aponta em que dimensões a entidade se afasta da referência; o valor exato das duas vai escrito no eixo ou na dica, porque a área cresce com o quadrado do raio e não serve para comparar magnitude. Quando o recado é a faixa de um cenário, as alternativas ficam só em contorno e o escolhido é o único preenchido.

## Quando usar

- Entidade contra uma referência em 5 a 8 dimensões na mesma escala: executivo contra a média, plataforma contra plataforma.
- A pergunta é onde as formas divergem, com a diferença numérica na dica.
- Cenário de meta em que a série escolhida é preenchida e as alternativas ficam em contorno, formando a faixa do cenário.
- Tela que também oferece ver como barras, com a mesma ordem de dimensões.

## Quando evitar

- Três ou mais séries que precisam ser lidas uma a uma: pequenos múltiplos (modelo 03) ou barras agrupadas (`02_barras-horizontais/02`).
- Comparar valores exatos por dimensão: barras agrupadas ou dot plot por dimensão (`17_comparacao-de-pontos/01`).
- Duas áreas opacas de opacidade igual, que escondem uma à outra: foco preenchido e referência só em contorno.
- Dimensões de unidades diferentes sem normalização declarada: coordenadas paralelas com escala por eixo (modelo 06).
- Perfis quase idênticos em que a diferença é o recado: barras ordenadas pela lacuna; a `v4` mostra o emaranhado e a saída para barras.

## Anatomia

1. **Grade** (`PolarGrid`) circular em `--line-subtle`, com `zIndex` 150 acima da área; sem raios na `v3`, para a linha fina não sumir sobre eles.
2. **Eixos de dimensão** (`PolarAngleAxis`) com `tick` próprio: nome em `--text-secondary`, valor do foco em `font-display` e o da referência entre parênteses em `--text-muted`, tudo por `formatInt`. Nome longo quebra em duas linhas; os eixos do topo e da base levam nome curto.
3. **Escala** (`PolarRadiusAxis`) com `domain` fixo de 0 a 100, igual para todas as séries, com os números no vão onde o maior polígono chega menos longe.
4. **Referência** (`Radar` declarado antes) com `fill="none"` e `strokeDasharray="3 3"`, sem ponto, com `zIndex` 250 para o tracejado não sumir sob a área do foco.
5. **Foco** (`Radar`) com `fillOpacity` de 0,66, o mínimo que a ACE-5 aceita para `--chart-1` e `--chart-3` no tema claro, traço de 2 px e ponto com contorno `--surface-raised`.
6. **Linha de leitura e legenda**: frase calculada do dado e amostras na forma da marca (área para o foco, linha tracejada para a referência), na ordem em que a anotação cita os grupos.
7. **Dica** própria com `data-slot="chart-tooltip"`: as duas séries, a diferença em pontos com sinal `+` ou `−` (`v1`), o valor original em R$ e em taxa com volume (`v2`), os três cenários (`v3`) e os trimestres que coincidem no eixo (`v4`).
8. **Vista em barras** (`v4`): botão com `aria-pressed` que troca o `RadarChart` por `BarChart` agrupado, com as mesmas dimensões na mesma ordem e o valor escrito na ponta.

## Versões

- `v1_executivo-contra-media-do-time`: média em tracejado de `--text-muted` e executivo em `--chart-1` preenchido, dica com a diferença em pontos e legenda com amostra de área e de linha.
- `v2_plataforma-a-contra-plataforma-b`: índice com CPL e CPL qualificado invertidos, categorias por slot fixo, anotação na maior lacuna e dica com o valor original; com a escala numa bissetriz quase horizontal, só o 100 é escrito (anéis a 18 px não comportam dois números a 4 px de cada anel).
- `v3_cenario-escolhido-e-alternativas-em-contorno`: cenário base preenchido e pessimista e otimista só em contorno, tracejado e pontilhado, sem raios na grade.
- `v4_tres-trimestres-quase-identicos`: três contornos quase coincidentes, esmaecimento por foco na legenda, pontos concêntricos, dica com as séries coincidentes e troca para barras agrupadas.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual e troque o `data.ts` pelo registry de métricas: a ordem dos eixos deve ser a do registry e a mesma em todas as telas, inclusive na vista em barras.
2. Passe as dimensões como lista de `{ id, label, phrase, ... }`; `phrase` é o nome como entra no meio de uma frase, com sigla na caixa certa.
3. A cor de cada categoria vem do slot do dado (`slot`), nunca da posição no array; o mesmo slot em todo o painel.
4. Embrulhe num `VisualCard`: o título, a procedência e o aviso de protótipo são do cartão. O estado vazio inline vira `EmptyState` ou `UnavailableState`.
5. A `v4` tem raiz `role="group"` por causa dos botões; ao colar, o botão ver como barras pode subir para o cabeçalho do `VisualCard`, e o `Chart` passa a receber a vista por prop.
6. O `PolarRadiusAxis` entrega o número da escala com `transform` de rotação; o `tick` próprio descarta o giro e usa só `x` e `y`, porque texto girado é proibido.
7. A faixa ou a média precisam ser calculadas sem a entidade comparada, senão o foco nunca sai dela.

## Referências

- Recharts, [`RadarChart`](https://recharts.github.io/en-US/api/RadarChart/), [`Radar`](https://recharts.github.io/en-US/api/Radar/) e [`PolarGrid`](https://recharts.github.io/en-US/api/PolarGrid/): `zIndex` por série, `radialLines` e `strokeDasharray`.
- Stephen Few, [Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): limites do formato e saída para barras.
- Pacote 3.10.1: o `Radar` pinta pela ordem de `zIndex` e não pela do JSX, então a referência declarada antes só fica abaixo do foco se o `zIndex` dela for menor; aqui ela é maior de propósito. Vale uma sonda para o dossiê.
- Estudo da família: `_estudo/familias/18_radar.md`. No Farol, `app/src/components/visuals/charts/chartTheme.ts`.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-10-13: `v1` e `v4` aprovadas, `v2` e `v3` reprovadas, com o parecer em `validation/revisao_18_radar__02_radar-comparativo_2026-10-13.md`. Nada abaixo reprova._

- `v1`: o tracejado da média em `--text-muted` passa por cima da área do executivo e mede 1,07:1 contra ela no tema escuro e 1,79:1 no claro (5,21:1 e 5,37:1 contra o cartão). No escuro quem separa é só a matiz, e em simulação de protanopia a diferença de cor cai para ΔE 1,2: o contorno some dentro da área justamente nas quatro dimensões em que o executivo passa da média. O valor da média vem escrito em cada eixo, que é a isenção da ACE-3, e por isso não reprova. A saída da TOK-10 é um revestimento de `--surface-raised` por baixo do traço, que mede 4,85:1 e 3,01:1 contra a área. É a observação mais pesada do modelo.
- `v2` e `v3`: o mesmo cruzamento, com folga maior. Na `v2` o tracejado da Plataforma A mede 2,65:1 e 1,97:1 contra a área da B; na `v3` o do pessimista mede 1,33:1 e 2,06:1 contra a área do base. Nas duas a matiz segura em simulação de daltonismo (ΔE de 13,8 para cima) e os valores estão escritos nos eixos.
- `v1`, `v2` e `v3`: a nota do `meta.json` não registra a medida de marca contra marca que a TOK-9 manda escrever; os números estão nas duas linhas acima.
- `v1`, `v2` e `v3`: a área a 0,66 mede 3,01:1 com `--chart-1` e 3,05:1 com `--chart-3` contra o cartão no tema claro, sem folga sobre o piso; a opacidade não pode descer.
- `v1` e `v4`: a tela não diz que os números são um índice de 0 a 100; a palavra só existe na frase acessível (DAD-9). A unidade aparece como "pontos" na linha de leitura e a escala escreve 75 e 100, então lê; a `v2` mostra a saída, que é dizer o índice no texto de leitura.
- `v1` e `v3`: a linha de leitura ocupa duas linhas no canvas `quadrado`, e a ANO-5 pede uma. Não corta nem colide.
- `v1`, `v2`, `v3` e `v4`: os números da linha de leitura e da legenda saem em Manrope sem `tabular-nums` (TIP-1); a linha de leitura vai inteira em peso 500 e a legenda em 11 px, e a tabela 17.1 pede 400 com nomes e números em destaque e legenda de 12 px. Em texto corrido não muda nada no preview.
- `v1`, `v2`, `v3` e `v4`: o recuo de 4 px do número da escala está escrito solto em `renderScaleTick` e merece constante nomeada no topo, como já se anotou em `01_radar-simples`.
- `v1`, `v2`, `v3` e `v4`: a dica feita à mão repete a casca do `ChartTooltip` (saída da REC-6), sem a amostra de cor de cada série e sem o número alinhado à direita em coluna (TIP-6). Só aparece na interação.
- `v2`: na dica, o índice e o valor original ficam lado a lado sem nome (`38 38,0% (475 de 1.250)`), separados só pela cor.
- `v2`: nos quatro eixos de taxa o índice é a própria taxa, e a base de leads de cada plataforma (1.250 e 1.000) só aparece na dica (DAD-1).
- `v2`: a anotação da maior lacuna mora na coluna de texto e não junto do eixo, tem 64 caracteres e vai em `--text-primary`; a ANO-2 pede até 50 em `--text-muted`. A regra do índice sai em 11 px, e a ANO-5 pede 12.
- `v2`: pela caixa do texto, o rótulo do topo começa a 0,2 px da borda do corpo e o da base passa 0,3 px dela; a tinta fica dentro. Nome de duas linhas nesses dois eixos não cabe no `card` (GEO-1).
- `v3`: no eixo de ticket médio o ponto do pessimista (58) cobre o ponto do base (60), a 1,8 px um do outro, porque as alternativas sobem por `zIndex`; é o eixo que a linha de leitura cita. Os valores estão escritos.
- `v4`: o `meta.json` repete do catálogo "três contornos coincidentes em quatro dos seis eixos", e a linha de leitura da própria peça diz que os três coincidem em 2 de 6. No dado são dois eixos com os três iguais e dois com dois iguais: alinhar a frase do `meta.json` ou o dado.
- `v4`: a vista em radar não escreve valor nenhum; os números moram na vista em barras e na dica. A conclusão está na linha de leitura.
- `v4`: o trimestre vai à tela como `2026-T1`, que é formato de dado (NUM-7); o acervo escreve `1º tri/26` em `01_cards-e-kpis`.
- `v4`: o raio do ponto muda por trimestre (5,5, 4 e 2,5 px) e a amostra da legenda só traz o traço; sem o ponto na amostra, o tamanho pode ser lido como grandeza.
- `v4`, vista em barras, sondada em navegador nos dois temas: barras de 15 px, 2 px entre as barras do grupo e 11,2 px entre grupos, com o `barCategoryGap` de 10% declarado na nota contra os 30% da ESP-2; a nota fala em 14 px. O valor na ponta sai em Space Grotesk sem peso declarado (400, que a TIP-4 não lista) e o nome da categoria em `--text-muted`.
- `v4`: os botões da legenda só reagem a hover e a foco, sem ação no clique, e o botão "Ver como barras" em repouso não se distingue de texto.
- Modelo: o `check` informa `sem_opacidade_em_marca` na OPACIDADE-MARCA da `v2` e da `v3`, que têm `fillOpacity` de 0,66 como a `v1`; a guarda só mede quando a cor é constante do arquivo, e nas duas ela vem do slot do dado. Medido à mão nesta revisão. E a vista em barras da `v4` não passa por nenhuma guarda de preview, porque o preview é o estado inicial.

_Segunda revisão independente de 2026-10-13, sobre a `v2` e a `v3` corrigidas depois do parecer acima: as duas aprovadas, e com isso as quatro versões do modelo estão aprovadas. Os dois bloqueantes saíram: na `v2` só o 100 é escrito na escala, e na `v3` a tela diz o índice, o sentido e a inversão do ciclo de venda, com a lista vinda do dado. Das linhas acima continuam valendo as que citam `v2` e `v3`. Nada abaixo reprova._

- `v2`: a escala escreve só o 100, a 3,8 px do anel de fora e sem vizinho na linha; os anéis de 25, 50 e 75 ficam sem número e se leem pelo passo igual e pelo "Índice de 0 a 100" da coluna de texto. Não reprova porque cada vértice tem o valor escrito no eixo. A outra bissetriz empatada no vão, a de 120 graus, poria o 100 na linha de "Taxa de fit", a cerca de 11 px, então a escolha atual é a melhor das duas.
- `v2`: a nota do `meta.json` fala em coluna de 168 px; medida no navegador, a coluna tem 160 px e o vão até o gráfico tem 12 px.
- `v2`: o `data.ts` declara o índice (`a`, `b`) e a contagem (`aRaw`, `bRaw`) em campos separados nas quatro taxas. Hoje conferem com os leads (475 de 1.250 dá 38), mas a saída da DAD-1 é derivar o índice da contagem, para os dois não poderem divergir.
- `v2`: medido de novo no arquivo corrigido, o rótulo da base passa 0,28 px do fundo do gráfico pela caixa do texto e o do topo começa a 0,22 px da borda; a tinta fica dentro nos dois temas.
- `v3`: o 100 da escala fica a 14,6 px de `60 (58 a 70)`, o valor de ticket médio, meia linha abaixo dele (4,6 px), e o 75 fica na linha do nome "Ticket médio", a 30,9 px. Lê como escala porque o anel termina no número, o peso e a cor são outros e a legenda declara a gramática do rótulo, mas é a vizinhança da GEO-15. A saída é mudar o ângulo da escala ou a âncora do número: nas quatro bissetrizes inclinadas a distância é a mesma, por simetria, e nas duas horizontais só o 100 cabe, como na `v2`.
- `v3`: o ponto das alternativas herda o `strokeDasharray` da série, então o halo de `--surface-raised` em volta dele sai tracejado no pessimista e pontilhado no otimista; no PNG a 2x o ponto do otimista parece serrilhado. Passar `strokeDasharray: 'none'` no `dot` das duas séries.
- `v3`: a área do base, `--chart-1` a 0,66, mede 3,007:1 no tema claro na conta em ponto flutuante e 2,99:1 no pixel do PNG (`rgb(94, 159, 170)` contra branco). Vale a isenção da ACE-3, com o valor escrito no eixo e o contorno opaco a 6,00:1; com 0,67 a conta e o pixel dão 3,07:1. A mesma medida serve para a `v1`.
- `v3`: a regra do índice entrou como quarto item da lista da legenda, que passa a ter três linhas (53,5 px, 15% do corpo), e a ROT-4 fala em até duas. Somada à linha de leitura, são 101,5 px de texto acima de um radar de 83,6 px de raio (GEO-14): lê, sem folga para mais uma linha.
- Modelo: a tabela de mínimos da guarda OPACIDADE-MARCA dá 0,66 para `--chart-1`, e esse alfa cai em 2,99:1 depois do arredondamento da cor composta para 8 bits; o mínimo com folga é 0,67.
