# Unidades, waffle e pictograma

Quantidade contada em marcadores iguais: a família resolve a pergunta "quantos de quantos" quando o número precisa ser contável, e não só estimado pelo tamanho de uma forma. Cobre a fração em 100 células (inclusive empilhada, em múltiplos comparativos e em tamanho micro), a contagem por categoria em colunas de células, a repetição de ícones no método Isotype (inclusive a matriz de 100 figuras), o marcador por entidade real que abre o registro, a área quadrada que compara magnitudes distantes na mesma célula e o hemiciclo de assentos para conjuntos com teto de lugares.

> Catálogo montado em 2026-09-14 a partir de [`_estudo/familias/22_unidades-waffle-e-pictograma.md`](../_estudo/familias/22_unidades-waffle-e-pictograma.md), da seção 24.24 de [`_estudo/familias/24_microvisuais-sparklines.md`](../_estudo/familias/24_microvisuais-sparklines.md) (micro waffle absorvido pelo modelo 01) e da seção 22 de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). Plano das versões em [`_estudo/catalogo/22_unidades-waffle-e-pictograma.json`](../_estudo/catalogo/22_unidades-waffle-e-pictograma.json). Todo caso de uso usa dado fictício do Farol.

## O que a família responde

Pergunta de corte antes de escolher: **o leitor ganha alguma coisa contando?** Se a resposta é só "qual é maior", barras e colunas respondem melhor. Unidade entra quando a contagem exata, o denominador visível ou a identidade de cada item fazem parte da resposta.

Perguntas típicas no Farol:

- **Comercial:** de cada 100 oportunidades encerradas, quantas foram ganhas? Quantas contas cada executivo carrega contra o teto de 120? Quais oportunidades abertas estão paradas há mais de 30 dias?
- **Pré-vendas:** quantas agendas o time marcou em cada dia útil e em quais ficou abaixo da meta diária? Quantas das 6 posições de cada fila estão ocupadas?
- **Marketing:** de cada 100 leads, quantos chegaram com telefone válido e com origem declarada? De cada 100 leads de mídia paga, quantos qualificam e chegam à agenda?
- **Diretoria:** "3 em cada 10 clientes novos vieram por indicação"; custo e receita do trimestre em blocos de R$ 10 mil; quais origens juntas respondem por mais da metade das vitórias do ano.

Quando a família atrapalha: valores grandes sem unidade agregada (contar 1.284 quadrados não informa), diferenças finas entre categorias próximas, muitas dimensões ao mesmo tempo e público que lê unidades como infantil.

Regras que valem para todos os modelos:

1. **Unidade declarada e sempre visível.** Legenda "1 quadrado = 1%", "1 célula = 10 leads", "1 ícone = 1 vitória". Trocar a unidade entre peças do mesmo painel exige aviso escrito.
2. **Arredondamento que fecha o total.** Contagens por categoria pelo método do maior resto (a função `largestRemainder` está no estudo); nunca `Math.round` por categoria, que fecha em 99 ou 101.
3. **Ordem de preenchimento fixa.** Por colunas, de baixo para cima, da esquerda para a direita, para cada categoria formar um bloco contíguo. No hemiciclo a ordem é angular e global, nunca fileira por fileira.
4. **Unidade parcial só onde se lê.** Quadrado pode ter só a última célula parcial, com aviso na legenda; ícone nunca é fatiado; no tamanho micro nenhuma unidade é parcial, e a taxa pequena demais vira texto ("menos de 1 em 100").
5. **O número exato vai escrito.** A grade mostra 62 células e o texto diz 62,2%; a fileira mostra 34 ícones e o texto diz 347. Número, moeda e data por `@/lib/format`.
6. **Mesma grade entre múltiplos.** Mesmas dimensões, mesma unidade e mesmo tamanho de célula; n escrito em cada grupo e selo de amostra pequena abaixo de n = 30.
7. **Vazio não é ausente.** Célula vazia em `var(--surface-sunken)`; dado ausente em contorno tracejado `var(--line-strong)` com `formatUnavailable()`; zero medido é grade vazia com "0". A regra pedia `var(--surface-overlay)` até 2026-09-29: o token mede 1,00:1 contra o cartão no tema claro, onde é o mesmo branco, e a célula vazia é o denominador da peça, ou seja forma que precisa ser vista (`TOK-1`, e a tabela 17.2 do `CONTRATO.md` o proíbe como trilho, moldura e faixa). Nenhum modelo da família existe em disco, então a emenda chega antes do primeiro produtor.
8. **Performance.** Até cerca de 400 elementos, `div` em grid; de 400 a 2.000, SVG com `rect`; acima disso, agregar a unidade e avisar. Nunca um gráfico do Recharts por célula.
9. **Acessibilidade.** Contêiner com `role="img"` e `aria-label` com a frase calculada ("194 de 312 leads com telefone"); células e ícones com `aria-hidden`. Quando a unidade é entidade clicável, cada marcador vira botão com rótulo e o teclado segue a ordem de preenchimento.
10. **Ícone de contorno precisa de massa.** Ícones do lucide-react a partir de 14 px com `strokeWidth` perto de 2,5 no tema escuro; abaixo disso, quadrado ou círculo simples.
11. **Animação só como apoio.** Construir por partes ou reagrupar ajuda a leitura, mas respeita `prefers-reduced-motion` e não aparece no preview: nada que comunica pode depender dela.

## Modelos

As pastas de modelo são criadas pelos produtores das versões; os links abaixo apontam para onde elas vão morar.

| # | Modelo | Abordagem na stack | O que responde | Versões planejadas |
|---|---|---|---|---|
| 01 | [Waffle 10x10](./01_waffle/) | `html-tailwind` | Uma fração ou uma composição de 3 a 5 partes em "x de 100", também em múltiplos comparativos e em micro contagem de até cerca de 20 unidades reais. | `v1_leads-com-telefone-valido`, `v2_desfecho-das-oportunidades-encerradas`, `v3_cobertura-de-origem-por-plataforma-e-mes`, `v4_micro-waffle-de-posicoes-por-fila` |
| 02 | [Waffle em barras](./02_waffle-em-barras/) | `recharts-custom` | Contagem por categoria ou por período em colunas de células contáveis, com meta como linha de referência. | `v1_agendas-por-dia-util`, `v2_agendas-contra-meta-diaria`, `v3_vitorias-por-mes-e-origem`, `v4_leads-por-mes-em-celulas-de-dez` |
| 03 | [Pictograma isotype](./03_pictograma-isotype/) | `html-tailwind` | Contagem pequena em ícones repetidos ligados à unidade, e a matriz de 100 figuras para "x em cada 100". | `v1_vitorias-do-semestre-por-origem`, `v2_clientes-novos-por-indicacao-em-cada-100`, `v3_cada-100-leads-de-midia-paga`, `v4_leads-do-mes-em-icones-de-dez` |
| 04 | [Unit chart por entidade](./04_unit-chart-por-entidade/) | `svg-puro` | Um marcador por oportunidade, conta ou lead, agrupado por categoria, colorido por atributo e clicável. | `v1_oportunidades-abertas-por-etapa`, `v2_oportunidades-paradas-por-etapa`, `v3_carteira-de-contas-por-executivo`, `v4_leads-por-etapa-com-sem-etapa` |
| 05 | [Área quadrada proporcional](./05_area-quadrada-proporcional/) | `html-tailwind` | Totais de magnitude diferente na mesma unidade de célula, lado a lado, até cerca de 100 vezes de razão. | `v1_funil-do-semestre-em-celulas`, `v2_leads-que-viraram-oportunidade`, `v3_custo-e-receita-do-trimestre`, `v4_quando-a-area-deixa-de-servir` |
| 06 | [Parlamento (hemiciclo)](./06_parlamento/) | `svg-puro` | Composição de um conjunto com teto de lugares, com a linha de maioria ou a folga até o teto como referência. | `v1_contas-da-carteira-por-segmento`, `v2_ocupacao-do-teto-de-contas`, `v3_vitorias-do-ano-e-linha-de-maioria`, `v4_hemiciclo-com-7-e-com-900-lugares` |

Canvas sugerido por versão: `quadrado` para o waffle e a matriz isolados (`01/v1`, `03/v2`, `05/v2`); `alto` para os nove waffles em matriz (`01/v3`); `kpi-alto` para o micro waffle (`01/v4`); `largo` quando há 6 grupos ou os meses do ano lado a lado (`02/v3`, `04/v3`, `06/v4`); `card` no restante.

Variações do estudo absorvidas como versão:

- O **waffle empilhado multicategoria** (22#2) entrou no modelo 01 como `v2`, com as contagens pelo maior resto e a categoria abaixo de 1% listada na legenda sem célula forçada.
- Os **waffles comparativos** (22#3) entraram no modelo 01 como `v3`, em matriz de plataforma por mês com selo de amostra pequena.
- O **micro waffle de contagem** (24#24) entrou no modelo 01 como `v4`, com a regra do estudo 24 de nenhuma unidade parcial no tamanho micro.
- A **matriz de ícones** (22#6) entrou no modelo 03 como `v2` ("x em cada 100" com destaque pela legenda) e `v3` (três níveis aninhados na mesma matriz).

Decisões do plano que divergem do estudo, de propósito:

- **Taxa abaixo de 1% no waffle 10x10.** O estudo sugeria uma célula com 60% de preenchimento para 0,6%; o plano segue a regra mais estrita do estudo 24 (grade vazia e o texto "menos de 1 em 100"), para o modelo 01 não ter duas regras de unidade parcial conforme o tamanho.
- **Números do caso.** O teto de contas por executivo passou de 150 para 120 e as vitórias do ano de 66 para 74, para a linha de maioria (assento 38) e a folga (104 de 120) caírem em contas redondas de conferir. São dados fictícios; nenhum dos dois números descreve operação real.
- **Nove waffles em HTML.** A `01/v3` soma 900 células, acima dos cerca de 400 `div` da regra de performance. O modelo 01 fica em `html-tailwind` por coerência; se o render ou o Farol pesarem, a versão troca para SVG com `rect` sem mudar o dado.

### Molde de partida

O molde oficial da família é [`_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10/v1_composicao-por-origem`](../_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10/v1_composicao-por-origem/). Duas diferenças para o plano:

1. **Nome e técnica.** O molde se chama `01_waffle-10x10` e desenha em SVG puro; o modelo do catálogo se chama `01_waffle` e é `html-tailwind`. O molde vale como referência de dado, cor e legenda, não como pasta a copiar com o mesmo nome.
2. **Regras que o molde já resolve e o modelo 01 deve manter.** Cor presa à categoria pelo campo `slot` (nunca pela posição depois de ordenar), distribuição pelo maior resto com a legenda igual à grade, e a categoria de ausência diferente **por forma** (quadrado vazado com contorno), não só por cor. Onde o plano fala em hachura para "sem motivo registrado", a forma vazada do molde é o equivalente aceito.

## Quando a família serve

- O leitor precisa contar, e não só comparar: "4 de 6 posições", "38 de cada 100", "19 paradas há mais de 30 dias".
- O denominador tem que aparecer no desenho, inclusive o que falta (vaga aberta, lugar vazio, célula apagada).
- A categoria pequena não pode sumir, como a origem sem registro ou a desqualificação de 3%.
- Cada item real importa e o leitor quer abrir o registro a partir do gráfico.
- A peça é para diretoria ou apresentação e "3 em cada 10" comunica melhor que um ângulo ou um percentual solto.

## Guia rápido: qual modelo escolher

1. **O leitor não ganha nada contando**, ou o valor é contínuo (reais, horas) sem unidade honesta? Não é desta família: colunas ([03/01](../03_colunas-verticais/01_colunas-simples/)) ou barras ordenadas ([02/01](../02_barras-horizontais/01_barras-simples-ordenadas/)).
2. **Cada item é uma entidade que precisa ser vista ou aberta** (oportunidade, conta, lead), de 20 a cerca de 1.500 itens? Use o **04_unit-chart-por-entidade**.
3. **O conjunto tem um número fixo de lugares** e a pergunta é quem ocupa quanto, quanto sobra ou quem faz maioria? Use o **06_parlamento**, de 10 a cerca de 400 assentos.
4. **São 2 a 4 totais na mesma unidade com magnitudes distantes** (etapas do funil, custo contra receita)? Use o **05_area-quadrada-proporcional**, até cerca de 100 vezes de razão; acima disso, número com barra.
5. **Há um eixo de categoria ou de tempo** e a contagem de cada coluna é o que importa (agendas por dia, vitórias por mês)? Use o **02_waffle-em-barras**, até cerca de 300 unidades por barra antes de subir a unidade.
6. **A unidade é pessoa ou objeto reconhecível** e o público é amplo? Use o **03_pictograma-isotype**: fileiras para contagem por categoria, matriz de 100 figuras para "x em cada 100".
7. **É uma fração, uma composição de 3 a 5 partes, a mesma fração em vários grupos ou uma contagem pequena em cartão?** Use o **01_waffle**: grade de 100 para fração, múltiplos com a mesma grade para comparar, micro waffle de até cerca de 20 unidades reais para linha de tabela ou KPI.

Atalhos por pergunta:

| Pergunta no Farol | Modelo e versão |
|---|---|
| De cada 100 leads do mês, quantos têm telefone válido? | `01_waffle/v1_leads-com-telefone-valido` |
| De cada 100 oportunidades encerradas, quantas foram ganhas, perdidas ou desqualificadas? | `01_waffle/v2_desfecho-das-oportunidades-encerradas` |
| Em que plataforma e mês a origem declarada dos leads piorou? | `01_waffle/v3_cobertura-de-origem-por-plataforma-e-mes` |
| Quantas posições de SDR estão ocupadas em cada fila? | `01_waffle/v4_micro-waffle-de-posicoes-por-fila` |
| Quantas agendas o time marcou em cada dia útil? | `02_waffle-em-barras/v1_agendas-por-dia-util` |
| Em que dias o time ficou abaixo da meta diária de agendas, e por quanto? | `02_waffle-em-barras/v2_agendas-contra-meta-diaria` |
| Quantas vitórias houve em cada mês do ano e de que origem veio cada uma? | `02_waffle-em-barras/v3_vitorias-por-mes-e-origem` |
| Como mostrar leads por mês quando um mês passa de 300 e outro não tem coleta? | `02_waffle-em-barras/v4_leads-por-mes-em-celulas-de-dez` |
| De onde vieram as vitórias do semestre? | `03_pictograma-isotype/v1_vitorias-do-semestre-por-origem` |
| Quantos de cada 100 clientes novos chegaram por indicação? | `03_pictograma-isotype/v2_clientes-novos-por-indicacao-em-cada-100` |
| De cada 100 leads de mídia paga, quantos qualificam e chegam à agenda? | `03_pictograma-isotype/v3_cada-100-leads-de-midia-paga` |
| Quantas oportunidades estão abertas em cada etapa, uma a uma? | `04_unit-chart-por-entidade/v1_oportunidades-abertas-por-etapa` |
| Em que etapa param as oportunidades sem movimento há mais de 30 dias? | `04_unit-chart-por-entidade/v2_oportunidades-paradas-por-etapa` |
| Quem carrega contas acima do teto, e de que segmento elas são? | `04_unit-chart-por-entidade/v3_carteira-de-contas-por-executivo` |
| Quantos leads estão sem etapa registrada? | `04_unit-chart-por-entidade/v4_leads-por-etapa-com-sem-etapa` |
| Qual o tamanho de leads, oportunidades e vitórias do semestre lado a lado? | `05_area-quadrada-proporcional/v1_funil-do-semestre-em-celulas` |
| Quanto do total de leads virou oportunidade? | `05_area-quadrada-proporcional/v2_leads-que-viraram-oportunidade` |
| Quanto custou o trimestre e quanto de receita reconhecida entrou? | `05_area-quadrada-proporcional/v3_custo-e-receita-do-trimestre` |
| O que fazer quando um total é 200 vezes menor ou o saldo é negativo? | `05_area-quadrada-proporcional/v4_quando-a-area-deixa-de-servir` |
| Quanto sobra do teto de contas da carteira? | `06_parlamento/v2_ocupacao-do-teto-de-contas` |
| Quais origens juntas respondem por mais da metade das vitórias do ano? | `06_parlamento/v3_vitorias-do-ano-e-linha-de-maioria` |

## Quando procurar outra família

Referências cruzadas definidas no plano do catálogo:

| Situação | Família e modelo | Motivo |
|---|---|---|
| Contagem pequena contra um total discreto em forma circular, dentro de um cartão | [07_rosca-e-radial, 05_anel-segmentado-em-unidades](../07_rosca-e-radial/05_anel-segmentado-em-unidades/) | É a mesma ideia de unidade contável, mas desenhada em arco; mora na família das roscas. |
| Distribuição de uma medida por item, como dias no funil empilhados em pontos | [16_distribuicao, 09_dot-plot-empilhado](../16_distribuicao/09_dot-plot-empilhado/) | O dot plot de Wilkinson empilha pontos sobre um eixo contínuo: a pergunta é forma da distribuição, não parte de um todo. |
| Uma célula por dia ao longo de semanas ou meses | [15_mapa-de-calor-e-calendario, 04_calendario-estilo-contribuicoes](../15_mapa-de-calor-e-calendario/04_calendario-estilo-contribuicoes/) | O calendário de células codifica intensidade por cor no tempo; a célula não é unidade de contagem. |

Outros destinos apontados pelo estudo:

| Situação | Família e modelo | Motivo |
|---|---|---|
| Fração contra meta que pode passar de 100% | [13_progresso-meta-e-gauge, 01_barra-de-progresso-linear](../13_progresso-meta-e-gauge/01_barra-de-progresso-linear/) | A grade de 100 não tem onde desenhar o excedente. |
| Decimal que decide, como 62,4% contra 62,1% | [13_progresso-meta-e-gauge, 01_barra-de-progresso-linear](../13_progresso-meta-e-gauge/01_barra-de-progresso-linear/) | A célula inteira esconde a diferença; o número com barra a mostra. |
| Composição com mais de 5 categorias | [02_barras-horizontais, 04_barras-empilhadas-100](../02_barras-horizontais/04_barras-empilhadas-100/) ou [12_hierarquia, 01_treemap](../12_hierarquia/01_treemap/) | Cores demais para blocos contíguos contáveis. |
| Muitos grupos com uma fração cada | [14_tabelas-visuais, 01_tabela-com-barras-inline](../14_tabelas-visuais/01_tabela-com-barras-inline/) | Nove waffles já é o limite de leitura; a tabela ordena e escreve o n. |
| Diferença fina entre categorias próximas | [02_barras-horizontais, 01_barras-simples-ordenadas](../02_barras-horizontais/01_barras-simples-ordenadas/) | Comprimento sobre base comum lê melhor que contagem de células. |
| Contagem grande por categoria sem necessidade de contar | [03_colunas-verticais, 01_colunas-simples](../03_colunas-verticais/01_colunas-simples/) | Células demais viram textura. |
| Distribuição de um valor contínuo por item | [16_distribuicao, 03_strip-plot-e-beeswarm](../16_distribuicao/03_strip-plot-e-beeswarm/) | A posição no eixo é a informação; o unit chart só agrupa. |
| Estado de cada item ao longo do tempo | [15_mapa-de-calor-e-calendario, 06_lasagna](../15_mapa-de-calor-e-calendario/06_lasagna/) | Uma linha por item e uma coluna por período. |
| Taxa de passo entre etapas do funil | [10_funil, 01_funil-em-barras-com-taxa-de-passo](../10_funil/01_funil-em-barras-com-taxa-de-passo/) | A área quadrada mostra tamanho, não conversão. |
| Saldo ou valor negativo | [19_cascata-waterfall, 01_cascata-de-ponte](../19_cascata-waterfall/01_cascata-de-ponte/) | Área e unidade não têm sinal. |
| Dois ou três grupos sem maioria em jogo | [07_rosca-e-radial, 02_semi-rosca](../07_rosca-e-radial/02_semi-rosca/) | O hemiciclo só se justifica com assentos contáveis e linha de maioria ou teto. |
| Pontos por localização (densidade de pontos) | [23_mapas, 06_mapa-de-pontos](../23_mapas/06_mapa-de-pontos/) | A posição geográfica é a informação. |
| Faixa de status temporal dentro de uma célula de tabela | [14_tabelas-visuais](../14_tabelas-visuais/) | O estudo manda a faixa para a tabela que a hospeda. |
| Pizza quadrada | este README, modelo 01 | É o próprio waffle 10x10; a família 06 só cita. |

## Referências

Todos os links vêm do estudo da família, da seção 24.24 do estudo de microvisuais ou da varredura de portais; nenhum foi acrescentado aqui. Marcação de proveniência: **[aberto]** a varredura de portais leu a página; **[busca]** só apareceu em busca; **(não abriu)** e **(abriu só o título)** repetem o que o estudo registrou; sem marca, é fonte consultada no estudo. Nas bibliotecas fora da stack (Observable Plot, Vega-Lite, nivo, Highcharts, d3), observar a regra e a geometria, nunca importar. Nos shots de Dribbble e arquivos de Figma marcados [busca], a qualidade visual não foi conferida: olhe antes de adotar.

### Da família inteira

| Referência | O que observar |
|---|---|
| [Storytelling with Data, guia de gráficos](https://www.storytellingwithdata.com/chart-guide) | Isotype, waffle, symbol chart e pictorial chart agrupados sob o mesmo tipo de gráfico de unidades. |
| [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart) | Símbolo reconhecível, legenda de unidade, o alerta contra somar tempo e outras dimensões e o risco de parecer infantil. |
| [FT Visual Vocabulary, pasta](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) e [README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md) | O gridplot "bom para percentual, melhor com inteiros", os múltiplos, o arc como hemiciclo e a regra de não cortar ícone para representar decimal. |
| [Data Visualisation Catalogue, índice](https://datavizcatalogue.com/) | O gráfico de área proporcional listado como vizinho da família. |
| [From Data to Viz, caveat pie](https://www.data-to-viz.com/caveat/pie.html) | O waffle como alternativa à pizza. |
| [nivo, waffle](https://nivo.rocks/waffle/) | Componente em SVG, HTML e canvas, célula customizável e séries ocultáveis (biblioteca fora da stack). |
| [Dribbble, Waffle chart](https://dribbble.com/shots/24115728-Waffle-chart) [busca] (não abriu) | O waffle como peça de dashboard, e não só como infográfico. |
| [Dribbble, Animated Waffle Chart, 49 Days of Charts](https://dribbble.com/shots/17898541-Animated-Waffle-Chart-49-Days-of-Charts) [busca] | Construção animada por partes; no Farol o preview é estático e a animação respeita `prefers-reduced-motion`. |
| [Figma Community, r19 Data Visualization Kit](https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit) [aberto] | Kit gratuito (CC BY 4.0) que inclui waffle entre os tipos; modo escuro não mencionado. |

### 01_waffle

| Referência | O que observar |
|---|---|
| [Storytelling with Data, what is a square area chart](https://www.storytellingwithdata.com/blog/what-is-a-square-area-chart) | A grade como régua para contar, o alerta sobre categorias em linhas parciais e a sugestão de montar ao vivo. |
| [Python Graph Gallery, waffle chart](https://python-graph-gallery.com/waffle-chart/) | Linhas, colunas e legenda com proporção ao lado do nome; waffles empilhados para comparar conjuntos. |
| [R Graph Gallery, waffle](https://r-graph-gallery.com/waffle.html) | O waffle empilhado e as alternativas listadas (treemap, pizza, barra empilhada), base da versão `v2`. |
| [Observable Plot, documentação do waffle (fonte)](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/waffle.md) | Os exemplos por grupo e a opção `multiple`, base dos múltiplos da versão `v3`. |
| [Wikipedia, pie chart](https://en.wikipedia.org/wiki/Pie_chart) | O estudo em que a pizza quadrada foi a mais precisa entre os formatos de pizza. |
| [microcharts, IconArray](https://microcharts.dev/docs/charts/icon-array) | As grades de 10, 20 e 100, a proibição de unidade parcial e a sinalização de taxa pequena demais, base da versão `v4`. |
| [microcharts, when to use](https://microcharts.dev/docs/when-to-use) | A exclusão deliberada do waffle abstrato no tamanho de palavra: o micro só vale com unidade contável de verdade. |
| [Data Viz Project, waffle chart](https://datavizproject.com/data-type/percentage-grid/) (não abriu) | A definição como grade de células coloridas e vários waffles lado a lado para comparação. |
| [Behance, Waffle Chart](https://www.behance.net/gallery/145150905/Waffle-Chart) | Preço comparado entre países comunicando diferença relativa sem despejar números crus. |
| [Behance, Legislativas 2022: Resultados (Waffle Chart)](https://www.behance.net/gallery/148772539/Legislativas-2022-Resultados-%28Waffle-Chart%29) | Resultado eleitoral em waffle empilhado feito em ferramenta de BI (a página traz só metadados). |
| [Figma Community, waffles](https://www.figma.com/community/file/1271360341439247258/waffles) [busca] (não abriu) | Arquivo dedicado a waffle; conferir antes de adotar. |
| [Dribbble, tag waffle chart](https://dribbble.com/tags/waffle-chart) (não abriu) | Como o waffle aparece quase sempre grande e decorativo, raramente como microvisual. |

### 02_waffle-em-barras

| Referência | O que observar |
|---|---|
| [Observable Plot, documentação do waffle (fonte)](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/waffle.md) | `waffleY` crescendo na vertical, `unit` (quanto vale a célula), `multiple` (células por linha), `gap`, `round` e a célula parcial na primeira ou na última posição. |
| [Behance, D3.js Waffle Bar](https://www.behance.net/gallery/235904365/D3js-Waffle-Bar) | Barras de células para reuniões ao longo do tempo, com brush de período e contêiner responsivo (lá com d3, aqui só como roteiro). |
| [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md) | A regra de inteiros para unidades, que limita a célula parcial à última e com aviso. |

### 03_pictograma-isotype

| Referência | O que observar |
|---|---|
| [Wikipedia, Isotype (picture language)](https://en.wikipedia.org/wiki/Isotype_(picture_language)) | A regra de repetir o pictograma em vez de aumentá-lo. |
| [Isotype Revisited](https://isotyperevisited.org/) | O acervo de pesquisa sobre o método, a estatística pictórica e o método de Viena. |
| [Vega-Lite, galeria](https://vega.github.io/vega-lite/examples/) e [Isotype Dot Plot](https://vega.github.io/vega-lite/examples/isotype_bar_chart.html) | O `shape` por categoria e uma fileira por grupo, base da versão `v1`. |
| [Vega-Lite, Isotype Grid](https://vega.github.io/vega-lite/examples/isotype_grid.html) | O cálculo de coluna e linha por `id` e a seleção que acende as figuras marcadas, base do destaque da versão `v2`. |
| [Data Visualisation Catalogue, pictogram chart](https://datavizcatalogue.com/methods/pictogram.html) | Os dois alertas: conjunto grande demais para contar e ícone parcial. |
| [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart) | A conexão humana que a figura provoca e a legenda de unidade obrigatória. |
| [Nightingale, Showing Human Stories Behind Data Points](https://nightingaledvs.com/showing-human-stories-behind-data-points/) | Desagregar em indivíduos como recurso de contexto e anotar pontos específicos. |
| [Behance, FB ITALIAN USERS, Isotype](https://www.behance.net/gallery/20150529/FB-ITALIAN-USERS_-Isotype) | Exercício acadêmico que aplica as regras do Isotype a dados de uso de rede social. |
| [Behance, Information Design, Isotype poster](https://www.behance.net/gallery/59642365/Information-Design-Isotype-poster) | Cartaz de saúde pública com repetição de ícones padronizados. |
| [Behance, Como as pessoas estão se exercitando na quarentena?](https://www.behance.net/gallery/115376469/Como-as-pessoas-estao-se-exercitando-na-quarentena) [aberto] | Pictograma isométrico em português (a página traz só título e tags). |

### 04_unit-chart-por-entidade

| Referência | O que observar |
|---|---|
| [Microsoft Research, ATOM: A Grammar for Unit Visualizations](https://www.microsoft.com/en-us/research/publication/atom-a-grammar-for-unit-visualizations/) | A definição de unit visualization (cada item vira um marcador) e as divisões recursivas de layout até cada item ter tamanho e posição. |
| [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart) | Animação para apresentação e tamanho de símbolo constante entre grupos. |
| [Nightingale, Showing Human Stories Behind Data Points](https://nightingaledvs.com/showing-human-stories-behind-data-points/) | Variação estética leve sem sugerir significado, e a escala como decisão explícita do projeto. |

### 05_area-quadrada-proporcional

| Referência | O que observar |
|---|---|
| [Storytelling with Data, what is a square area chart](https://www.storytellingwithdata.com/blog/what-is-a-square-area-chart) | O quadrado usando altura e largura para comparar magnitudes diferentes em pouco espaço. |
| [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf) | A subestimação de área (círculo 16 vezes maior), razão para o número escrito sob cada quadrado. |
| [Data Visualisation Catalogue, índice](https://datavizcatalogue.com/) | O gráfico de área proporcional como vizinho da família. |

### 06_parlamento

| Referência | O que observar |
|---|---|
| [Parliament diagram tool (Wikimedia Toolforge)](https://parliamentdiagram.toolforge.org/) | As disposições em arco, estilo americano e bancadas opostas, a opção de fileiras compactas e a saída em SVG. |
| [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md) | A definição de arc como hemiciclo para resultado de parlamento. |
| [Highcharts, parliament chart](https://www.highcharts.com/demo/highcharts/parliament-chart) (abriu só o título) | A série de itens em arco como tipo próprio numa biblioteca comercial (fora da stack). |
| [Behance, Women's Representation in Romanian Parliament](https://www.behance.net/gallery/223305443/Womens-Representation-in-Romanian-Parliament) | Tema parlamentar resolvido com barras e percentuais em vez de hemiciclo: contraponto sobre quando o arco não precisa entrar. |

### Lacunas conhecidas

- A varredura de portais achou poucos exemplos da família em contexto de dashboard; quase tudo é infográfico editorial. Não há referência de portal específica para os waffles comparativos, o unit chart por entidade nem a área quadrada proporcional.
- Buscas no Nightingale por "waffle", "unit chart" e "parliament" não trouxeram artigo específico; o único aproveitado foi o de histórias humanas.
- O verbete de diagrama de parlamento da Wikipedia deu 404 no endereço tentado pelo estudo, por isso fica sem link.
- Os shots de Dribbble e o arquivo de waffle da Figma Community não abriram: valem pelo título da busca.
- O modelo 04 não tem referência de biblioteca para o reagrupamento animado; a técnica de medir antes e depois e interpolar por `transform` é descrita no estudo e precisa ser validada no render, que não mostra animação.
