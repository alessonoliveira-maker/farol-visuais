# Microvisuais e sparklines

Microvisuais e sparklines é a família que não tem um tipo de dado próprio: tem um **tamanho**. O gráfico cabe dentro de uma célula de tabela, de um card de KPI ou de uma linha de texto, fica colado ao número que explica e troca precisão de leitura por densidade e vizinhança. Ninguém lê valor exato num sparkline; lê forma, direção, ruptura, sequência e posição relativa. Em compensação, cabem dezenas deles numa tela, um por linha, e o olho compara linha a linha sem trocar de tela. O modelo mora aqui quando o encolhimento muda o desenho (some eixo, legenda, grade e rótulo intermediário, a escala vira implícita); quando o encolhimento é só `width` e `height`, o visual continua na família grande.

> Catálogo VISUAIS do Farol, montado em 2026-09-14 a partir de [`_estudo/familias/24_microvisuais-sparklines.md`](../_estudo/familias/24_microvisuais-sparklines.md) e da seção 24 de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). Catálogo em dados, com resumo, quando usar, quando evitar e as versões de cada modelo: [`_estudo/catalogo/24_microvisuais-sparklines.json`](../_estudo/catalogo/24_microvisuais-sparklines.json). Todos os casos de uso são fictícios.

## O que a família responde

| Público | Perguntas típicas no Farol |
|---|---|
| Comercial | A receita reconhecida do mês está em alta, em queda ou em serra, e quão longe do melhor mês do ano? Quais executivos batem a meta mensal com regularidade e quais decaíram no semestre? Quais oportunidades passadas pela pré-vendas estão pendentes fora do prazo de aceite? |
| Pré-vendas | Em quantas semanas a fila fechou dentro do SLA, e qual foi a maior sequência fora? As agendas estão subindo, e como está a semana atual? O tempo de primeira resposta desta semana cai dentro da faixa aceitável? |
| Marketing | O CPL de hoje é alto ou baixo para o que já se viu? Em qual origem o CPL qualificado não pode ser lido porque a cobertura do dado ficou baixa? Qual origem cresceu contra o mês anterior sem que base zero ou minúscula vire manchete? |
| Diretoria | Em quais linhas de receita a projeção fica abaixo da trajetória necessária para a meta de 2027? Posso confiar no painel de hoje, ou alguma fonte falhou na coleta? Onde a participação própria cai entre os concorrentes do perímetro de cada segmento? |

Regras que valem para todos os modelos, vindas do estudo da família:

1. **Tamanho é especificação, não acaso.** Card: de 96 a 140 px de largura por 32 a 48 px de altura. Célula de tabela: de 60 a 100 px por 20 a 28 px. Abaixo de 60 px de largura a forma vira ruído.
2. **O número vive ao lado, não dentro.** O microvisual é adjunto de um número legível, em HTML irmão com `kpi-number` ou `tabular-nums`, nunca texto dentro do SVG.
3. **O que sai:** eixo, grade, legenda, rótulo de ponto intermediário e animação. **O que fica:** a forma, o último ponto e, no máximo, um extremo.
4. **Escala comum ou por linha, sempre declarada.** Escala por linha compara forma; escala comum compara nível. O cabeçalho da coluna ou o rodapé do card diz qual está em uso.
5. **Série curta não é tendência.** Piso de 12 pontos em série mensal e 8 em semanal; abaixo disso, traço neutro e a nota "série curta".
6. **Cor carrega polaridade, não identidade.** Bom e ruim seguem a direção boa da métrica (`goodDirection`); métrica sem polaridade fica em `--text-secondary`. Paleta categórica de 8 cores dentro de 100 px não é lida.
7. **Cor nunca é o único canal.** Variação leva sinal e glifo; win/loss usa posição; estado usa silhueta; ausência usa contorno vazado e palavra.
8. **Dado ausente é estado, não zero.** Lacuna visível, `connectNulls` desligado, contorno `--text-muted` sem preenchimento; zero medido desenha a marca e escreve 0.
9. **Sem tooltip por padrão.** O microvisual é porta de entrada; quem precisa do valor exato abre a família grande.
10. **Desempenho é regra de desenho.** Em tabela longa, largura e altura fixas e animação desligada; acima de cerca de 120 instâncias por tela, SVG puro calculado em TypeScript.
11. **Acessibilidade não encolhe com o gráfico.** A raiz tem `role="img"` e uma frase calculada do dado; o SVG decorativo leva `aria-hidden`.
12. **Texto semântico direto sobre o cartão.** Pílula e selo não usam fundo tingido (`bg-positive/15` reprova contraste no tema claro), conforme a COR-7 do [contrato](../CONTRATO.md).

## Modelos

As pastas de modelo são criadas pelos produtores das versões; os links abaixo apontam para onde elas vão morar.

| # | Modelo | Abordagem na stack | O que responde | Versões planejadas |
|---|---|---|---|---|
| 01 | [Sparkline de linha e área](./01_sparkline-de-linha/) | `recharts-nativo` | Forma, direção e ruptura de uma série contínua ao lado do número, com uma camada a mais no máximo: extremos, área, faixa de normalidade, referência, projeção, degraus ou faixa por período. | `v1_receita-com-extremos-e-valor-final`, `v2_tempo-de-resposta-com-faixa-de-sla`, `v3_meta-2027-com-cauda-de-projecao`, `v4_origens-em-area-com-lacuna-de-coleta` |
| 02 | [Sparkbar](./02_sparkbar/) | `recharts-nativo` | Contagem discreta por período, variação com sinal em torno do zero e período atual contra uma referência em barras pareadas. | `v1_agendas-por-semana-com-semana-atual`, `v2_variacao-mensal-do-cpl-divergente`, `v3_filas-da-prevendas-em-escala-comum`, `v4_barras-pareadas-com-origem-sem-mes-anterior` |
| 03 | [Pílula de variação e indicador de estado](./03_pilula-de-variacao/) | `html-tailwind` | Delta contra uma base nomeada, direção dentro de uma frase e estado de uma linha contra regra declarada. | `v1_receita-do-mes-contra-mes-anterior`, `v2_setas-de-tendencia-na-linha-de-leitura`, `v3_status-do-handoff-por-oportunidade`, `v4_origens-com-base-zero-e-base-minuscula` |
| 04 | [Faixa de status e de calor (tracker)](./04_faixa-de-status-tracker/) | `html-tailwind` | Estado categórico ou classe de valor por período, lida como regularidade e sequência em dezenas de blocos. | `v1_sla-diario-da-fila-de-entrada`, `v2_entradas-em-52-semanas-com-semana-corrente`, `v3_coleta-diaria-de-oito-fontes`, `v4_meta-semanal-com-feriado-e-sem-coleta` |
| 05 | [Medidor de cobertura de dado](./05_medidor-de-cobertura-de-dado/) | `html-tailwind` | Quanto do universo tem o dado que sustenta o número vizinho, e se a lacuna vem da coleta ou da base. | `v1_chip-de-cobertura-no-cpl-qualificado`, `v2_telefone-em-tres-segmentos`, `v3_origens-com-cpl-rebaixado-por-cobertura`, `v4_salto-de-cobertura-por-mudanca-de-coleta` |
| 06 | [Marcador em trilho](./06_marcador-em-trilho/) | `html-tailwind` | Onde o valor de hoje cai dentro de uma faixa conhecida (histórica, aceitável ou do perímetro), sem inventar meta. | `v1_cpl-do-mes-na-faixa-de-12-meses`, `v2_tempo-de-resposta-com-faixa-aceitavel`, `v3_participacao-por-segmento-com-perimetro`, `v4_valor-fora-da-faixa-e-sem-historico` |
| 07 | [Win/loss](./07_win-loss/) | `svg-puro` | Sequência de acertos e falhas num desfecho binário com regra declarada, sem magnitude. | `v1_sla-semanal-em-26-semanas`, `v2_maior-sequencia-fora-do-sla-anotada`, `v3_meta-mensal-por-executivo`, `v4_meses-sem-meta-empate-e-sem-coleta` |

São 7 modelos e 28 versões, todas com canvas dos presets do [contrato](../CONTRATO.md): `kpi`, `kpi-alto`, `card`, `faixa`, `largo` e `alto`.

Variações do estudo absorvidas como versão:

- **01_sparkline-de-linha:** extremos e valor final (24#2) em `v1`; faixa de normalidade (24#4) em `v2`; série de comparação (24#5) e cauda de projeção (24#6) juntas em `v3`, onde a trajetória necessária para a meta é a referência; sparkline de área (24#3) em `v4`. A interpolação em degraus (24#26) e a faixa de mínimo e máximo por período (24#27) estão no resumo e no quando usar do modelo, sem versão própria: a primeira é troca de `type` na `Line` e a segunda é uma camada de faixa sobre o mesmo traço.
- **02_sparkbar:** sparkbar divergente (24#8) em `v2`; barras pareadas mini (24#30) em `v4`.
- **03_pilula-de-variacao:** seta de tendência no texto (24#21) em `v2`; ponto de status (24#33) em `v3`.
- **04_faixa-de-status-tracker:** tracker de blocos da família 13 (13#15) em `v1` e `v4`; faixa de calor (24#23) em `v2`; linha de estado em blocos da família 20 (20#8) em `v3`.
- **05, 06 e 07** não absorvem variação; cada um é a forma base de um modelo do estudo (24#22, 24#29 e 24#9).

## Guia rápido: qual modelo escolher

Pergunta de corte: **o encolhimento muda o desenho?** Se o visual precisa de eixo, legenda e dica para ser lido, ele não é desta família; vá para a família grande (linhas, colunas, progresso, tabela).

1. **O leitor precisa saber se o próprio número merece confiança** (quanto da base tem o campo, se a coleta mudou)? Use o **05_medidor-de-cobertura-de-dado**, antes de qualquer outro microvisual ao lado desse número.
2. **Só existe o valor de agora e uma comparação** (contra o mês anterior, contra a meta, contra uma regra)? Use o **03_pilula-de-variacao**: pílula com número para delta, seta para direção dentro de uma frase, ponto de status para estado contra regra.
3. **Só existe o valor de agora e uma faixa conhecida, sem meta?** Use o **06_marcador-em-trilho**. Se há meta a atingir, é o bullet ou a barra de progresso da família 13.
4. **Há série no tempo e o desfecho de cada período é binário** (bateu ou não bateu)? Use o **07_win-loss**. Com três ou quatro estados, ou mais de cerca de 40 períodos, use o **04_faixa-de-status-tracker**.
5. **A série é de estados ou de classes, e a pergunta é regularidade** (quantos dias ruins, se estão juntos)? Use o **04_faixa-de-status-tracker**; na forma de faixa de calor quando a magnitude vira classe.
6. **A série é de contagens discretas por período, ou de variação com sinal?** Use o **02_sparkbar**, até cerca de 25 colunas em 100 px; para atual contra referência, as barras pareadas.
7. **A série é contínua, com 12 meses ou 8 semanas ou mais?** Use o **01_sparkline-de-linha** e acrescente uma camada só: extremos, faixa de normalidade, referência, projeção, degraus ou área quando o zero é base legítima.

Atalhos por pergunta:

| Pergunta no Farol | Modelo e versão |
|---|---|
| A receita reconhecida do mês está em alta, queda ou serra? | `01_sparkline-de-linha/v1_receita-com-extremos-e-valor-final` |
| Em quantos dias o tempo de primeira resposta saiu da faixa de SLA? | `01_sparkline-de-linha/v2_tempo-de-resposta-com-faixa-de-sla` |
| Em quais linhas de receita a projeção fica abaixo da trajetória para a meta de 2027? | `01_sparkline-de-linha/v3_meta-2027-com-cauda-de-projecao` |
| Onde a coleta de leads por origem falhou, sem confundir falha com zero? | `01_sparkline-de-linha/v4_origens-em-area-com-lacuna-de-coleta` |
| As agendas das últimas semanas estão subindo? | `02_sparkbar/v1_agendas-por-semana-com-semana-atual` |
| Em quais meses o CPL qualificado subiu, lembrando que alta é pior? | `02_sparkbar/v2_variacao-mensal-do-cpl-divergente` |
| Quais filas da pré-vendas carregam volume? | `02_sparkbar/v3_filas-da-prevendas-em-escala-comum` |
| A receita do mês subiu contra o mês anterior, e sobre qual base? | `03_pilula-de-variacao/v1_receita-do-mes-contra-mes-anterior` |
| Quais oportunidades do handoff estão pendentes fora do prazo de aceite? | `03_pilula-de-variacao/v3_status-do-handoff-por-oportunidade` |
| Qual origem cresceu sem que base zero ou minúscula vire manchete? | `03_pilula-de-variacao/v4_origens-com-base-zero-e-base-minuscula` |
| Em quantos dos últimos 30 dias a fila de entrada fechou dentro do SLA? | `04_faixa-de-status-tracker/v1_sla-diario-da-fila-de-entrada` |
| Posso confiar no painel de hoje, ou alguma fonte falhou na coleta? | `04_faixa-de-status-tracker/v3_coleta-diaria-de-oito-fontes` |
| O CPL qualificado pode ser lido, ou a base que o sustenta é incompleta? | `05_medidor-de-cobertura-de-dado/v1_chip-de-cobertura-no-cpl-qualificado` |
| Em quais origens o CPL qualificado não deve ser lido por falta de cobertura? | `05_medidor-de-cobertura-de-dado/v3_origens-com-cpl-rebaixado-por-cobertura` |
| A cobertura de telefone saltou por mudança dos leads ou da coleta? | `05_medidor-de-cobertura-de-dado/v4_salto-de-cobertura-por-mudanca-de-coleta` |
| O CPL do mês é alto ou baixo para os últimos 12 meses? | `06_marcador-em-trilho/v1_cpl-do-mes-na-faixa-de-12-meses` |
| Onde a participação própria cai entre os concorrentes do perímetro? | `06_marcador-em-trilho/v3_participacao-por-segmento-com-perimetro` |
| Qual foi a maior sequência de semanas fora do SLA? | `07_win-loss/v2_maior-sequencia-fora-do-sla-anotada` |
| Quais executivos batem a meta mensal com regularidade? | `07_win-loss/v3_meta-mensal-por-executivo` |

## Referências cruzadas

O estudo levantou 41 variações de microvisual. 19 ficaram aqui, como modelo ou versão; as outras 22 são a forma reduzida de um modelo cuja geometria e cuidados moram numa família grande. Nesses casos o microvisual é implementado lá, na moldura de célula ou de card, e as regras de tamanho, escala declarada e dado ausente desta família continuam valendo.

| Variação do estudo | Família e modelo | Motivo |
|---|---|---|
| 24#10 Horizonte micro | [05_areas, 09_horizon-chart](../05_areas/09_horizon-chart/) | Bandas dobradas são a geometria do horizon chart; o micro só reduz a altura. |
| 24#11 Área empilhada micro | [05_areas, 02_area-empilhada](../05_areas/02_area-empilhada/) | Mudança de mix no tempo; sem eixo, mais de 4 componentes não se leem. |
| 24#12 Barra de dado em célula, 24#13 Barra de composição mini, 24#28 Barra de desvio em célula | [14_tabelas-visuais, 01_tabela-com-barras-inline](../14_tabelas-visuais/01_tabela-com-barras-inline/) | A barra de célula depende da tabela que a hospeda: escala da coluna, alinhamento e ordenação. |
| 24#14 Bullet micro | [13_progresso-meta-e-gauge, 02_bullet-chart](../13_progresso-meta-e-gauge/02_bullet-chart/) | Realizado contra meta com faixas; o bullet já nasce compacto. |
| 24#15 Barra com teto de capacidade | [13_progresso-meta-e-gauge, 01_barra-de-progresso-linear](../13_progresso-meta-e-gauge/01_barra-de-progresso-linear/) | Demanda contra teto operacional, inclusive a parte que estoura. |
| 24#16 Strip plot micro | [16_distribuicao, 03_strip-plot-e-beeswarm](../16_distribuicao/03_strip-plot-e-beeswarm/) | Observações individuais de uma distribuição. |
| 24#17 Boxplot micro | [16_distribuicao, 02_box-plot](../16_distribuicao/02_box-plot/) | Resumo em quartis, que precisa dizer o que a caixa desenha. |
| 24#18 Micro dumbbell | [17_comparacao-de-pontos, 03_dumbbell](../17_comparacao-de-pontos/03_dumbbell/) | Antes e depois como dois pontos ligados. |
| 24#19 Micro dispersão | [09_dispersao-e-bolhas, 01_dispersao-simples](../09_dispersao-e-bolhas/01_dispersao-simples/) | Relação entre duas medidas pede o eixo que o micro não tem. |
| 24#24 Micro waffle de contagem | [22_unidades-waffle-e-pictograma, 01_waffle](../22_unidades-waffle-e-pictograma/01_waffle/) | Unidade contável na mesma lógica de grade do waffle. |
| 24#25 Micro anel | [13_progresso-meta-e-gauge, 03_progresso-radial-de-anel-unico](../13_progresso-meta-e-gauge/03_progresso-radial-de-anel-unico/) | Percentual único; não serve para comparar linhas. |
| 24#31 Micro slope | [17_comparacao-de-pontos, 06_slope-chart](../17_comparacao-de-pontos/06_slope-chart/) | Direção entre dois instantes, que só se lê com escala comum. |
| 24#34 Grade de atividade micro | [15_mapa-de-calor-e-calendario, 04_calendario-estilo-contribuicoes](../15_mapa-de-calor-e-calendario/04_calendario-estilo-contribuicoes/) | Dia a dia arranjado por semana, para ler o ciclo do dia da semana. |
| 24#35 Histograma micro | [16_distribuicao, 01_histograma](../16_distribuicao/01_histograma/) | Forma da distribuição, com as mesmas faixas de classe entre linhas. |
| 24#36 Cascata micro | [19_cascata-waterfall, 01_cascata-de-ponte](../19_cascata-waterfall/01_cascata-de-ponte/) | Ponte de um total a outro, com totais distintos das variações. |
| 24#37 Funil micro | [10_funil, 01_funil-em-barras-com-taxa-de-passo](../10_funil/01_funil-em-barras-com-taxa-de-passo/) | Conversão por etapa com taxa de passo. |
| 24#38 Barra divergente empilhada mini | [02_barras-horizontais, 08_divergente-empilhada-likert](../02_barras-horizontais/08_divergente-empilhada-likert/) | Escala ordinal com centro neutro. |
| 24#39 Ranking micro (bump strip) | [04_linhas, 08_bump-chart](../04_linhas/08_bump-chart/) | Posição no ranking ao longo do tempo, com o 1º no topo. |
| 24#40 Curva de concentração micro | [16_distribuicao, 10_curva-de-lorenz](../16_distribuicao/10_curva-de-lorenz/) | Quanto do total vem de poucos itens, em ordem decrescente. |
| 24#41 Linha do tempo de eventos micro | [20_cronograma-e-linha-do-tempo, 08_linha-do-tempo-de-circulos](../20_cronograma-e-linha-do-tempo/08_linha-do-tempo-de-circulos/) | Eventos pontuais no tempo, agrupando os simultâneos. |
| KPI que hospeda o microvisual | [01_cards-e-kpis, 02_kpi-com-minigrafico-de-tendencia](../01_cards-e-kpis/02_kpi-com-minigrafico-de-tendencia/) | O card é o continente; o microvisual desta família é o ingrediente. |

No sentido contrário, duas variações de outras famílias vieram para cá: o tracker de blocos (13#15) e a linha de estado em blocos (20#8) foram absorvidos pelo **04_faixa-de-status-tracker**, porque o bloco por período nasce pequeno e a regra de sem dado como estado próprio é a mesma.

## Referências

Todos os links vêm do estudo da família ou da varredura de portais; nenhum foi acrescentado aqui. Marcação de proveniência: **[aberto]** a página foi lida na sessão do estudo; **[herdado]** mantido da versão anterior do estudo, sem reabertura; **(não abriu)** o link apareceu em resultado de busca ou na navegação de uma página aberta, sem ser lido; **[busca]** achado na varredura de portais, com a qualidade visual não conferida. Nas bibliotecas fora da stack (Tremor, microcharts, AG Grid, Highcharts, AnyChart, SpreadJS, Vega-Lite, Protovis), observar a regra e a geometria, nunca importar.

### Da família inteira

| Referência | O que observar |
|---|---|
| [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) [herdado] | "Word-sized graphic with typographic resolution", o banking to 45 graus e a instrução de manter o gráfico junto do texto que o discute. |
| [Wikipedia, sparkline](https://en.wikipedia.org/wiki/Sparkline) [herdado] | A definição sem eixo nem coordenadas e a menção a agrupar sparklines como small multiples. |
| [microcharts, when to use](https://microcharts.dev/docs/when-to-use) [aberto] | A regra de usar o microvisual quando o gráfico mora dentro de algo que já se está lendo, e a exclusão deliberada de pizza, gauge de ponteiro e waffle por falharem no tamanho de palavra. |
| [SpreadJS, lista de tipos de sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain) [aberto] | Os 24 tipos de sparkline de planilha, cruzados com as 41 variações do estudo; a RangeBlock, definida como representação de intervalos limitados, é a faixa por período. |
| [Datawrapper Academy, how to add bar charts, column charts and line charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables) [herdado] | A escolha entre escala individual e compartilhada, a coluna que começa no zero e o registro de que o microvisual em tabela não tem tooltip. |
| [Datawrapper Academy, how to embed charts into tooltips](https://www.datawrapper.de/academy/how-to-embed-charts-into-tooltips) [herdado] | O microvisual como porta de entrada, com o detalhe morando no tooltip ou na família grande. |
| [Storytelling with Data, little things can mean a lot](https://www.storytellingwithdata.com/blog/2020/2/13/little-things-can-mean-a-lot) [herdado] | Repetir o mesmo padrão pequeno deixa o leitor aprender a forma uma vez e aplicá-la em dezenas de linhas. |
| [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/) (não abriu) | O tratamento de incerteza e de dado em atualização em painéis operacionais. |
| [Dribbble, Sparklines (4625487)](https://dribbble.com/shots/4625487-Sparklines) [busca] | Sparkline como contexto histórico de um valor estático; em tabela, mais informação no mesmo espaço. |
| [Dribbble, Dashboard Sparkline Experiments](https://dribbble.com/shots/4437593-Dashboard-Sparkline-Experiments) [busca] | Experimentos de sparkline dentro de dashboard. |
| [Dribbble, Sparkline (1225506)](https://dribbble.com/shots/1225506-Sparkline) [busca] | Sparkline como componente. |
| [Dribbble, 23 Sparkline](https://dribbble.com/shots/4202840-23-Sparkline) [busca] | Sparkline numa série de estudos numerados. |
| [Dribbble, Sparkline (410363)](https://dribbble.com/shots/410363-Sparkline) [busca] | Sparkline reduzida ao mínimo. |
| [Figma Community, plugin Sparkliner](https://www.figma.com/community/plugin/1104468340333278614/sparkliner) [busca] | Gera sparkline a partir de dado colado; só para rascunho, o Farol desenha em código. |
| [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline) (não abriu) | A recorrência do par número grande e traço curto em cards escuros, e quantos exemplos ignoram a simetria do divergente e o degrau onde o dado é discreto. |

A varredura de portais resume a tradução para o Farol: SVG de uma `path` com o ponto final destacado, e `LineChart` do Recharts sem eixos quando o microvisual precisar de dica.

### 01_sparkline-de-linha

| Referência | O que observar |
|---|---|
| [Recharts, Simple Line Chart](https://recharts.github.io/en-US/examples/SimpleLineChart/) [herdado] | `responsive` e `style` com aspect-ratio no próprio `LineChart` da versão 3, duas `Line` no mesmo gráfico e `null` interrompendo o traço, o mecanismo que separa realizado de previsto. |
| [Recharts, Line API](https://recharts.github.io/en-US/api/Line/) (não abriu) | A propriedade `type` com `step`, `stepBefore` e `stepAfter`, base do sparkline em degraus. |
| [Recharts, API de Tooltip e componentes de referência](https://recharts.github.io/en-US/api/Tooltip/) [herdado] | A ordem de renderização, que decide se a faixa de normalidade fica atrás ou na frente do traço. |
| [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart) [herdado] | `SparkAreaChart` com gradiente por padrão, `autoMinValue`, `minValue` e `maxValue`, o tamanho base `h-12 w-28` e a paleta de 9 cores, convite a errar num microvisual. |
| [Protovis, sparklines](https://mbostock.github.io/protovis/ex/sparklines.html) [herdado] | A reprodução clássica do sparkline de Tufte, com banda de referência atrás do traço e marcação de extremos. |
| [Highcharts, sparkline demo](https://www.highcharts.com/demo/highcharts/sparkline) [herdado] | A função fábrica que injeta um gráfico minúsculo por célula e zera margens, título e legenda. |
| [Peltier Tech, sparklines and data bars in Excel 2010](https://peltiertech.com/sparklines-and-data-bars-in-excel-2010/) [herdado] | Primeiro ponto, último, alto e baixo como opções independentes, e as armadilhas de escala do recurso nativo. |
| [AnyChart Chartopedia, sparkline chart](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/) [herdado] | A taxonomia de linha, área, coluna e win/loss, e a área preenchida até o eixo X. |
| [Datawrapper, what to consider when creating small multiple line charts](https://www.datawrapper.de/blog/what-to-consider-when-creating-small-multiple-line-charts) [herdado] | Escala comum entre painéis pequenos e a técnica de repetir as séries em cinza ao fundo e destacar uma. |
| [Financial Times, visual vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) [herdado] | As categorias de mudança no tempo e de incerteza, separando dado observado de estimado por traço e por cor. |
| [microcharts, Sparkline](https://microcharts.dev/docs/charts/sparkline) [aberto] | A regra de `null` como lacuna que nunca interpola, e o Ohlc na navegação entre os componentes centrais. |
| [shadcn.io, line chart with step](https://www.shadcn.io/examples/a-line-chart-with-step) (não abriu) | Degrau montado sobre Recharts com Tailwind, a mesma stack do Farol. |
| [TradingView, o que são step line charts](https://in.tradingview.com/support/solutions/43000745272-what-are-step-line-charts) (não abriu) | Pelo resumo da busca, degrau como valor fixo até a mudança, contra linha como mudança contínua. |
| [Datawrapper Academy, customizing your range plot](https://www.datawrapper.de/academy/customizing-your-range-plot) (não abriu) | A distância entre dois extremos como leitura principal, base da faixa por período. |
| [Dribbble, coleção charts & gauges](https://dribbble.com/rileyzoi/collections/721831-charts-gauges) (não abriu) | Número grande, traço e ponto final em cards limpos de dashboard. |
| [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard) (não abriu) | Cards escuros com área em gradiente de baixa opacidade no lugar da linha pura, e o custo disso na leitura. |
| [Dribbble, tag kpi](https://dribbble.com/tags/kpi) (não abriu) | O par linha cheia e linha fantasma em cards de comparação de período. |
| [Dribbble, tag candlestick chart](https://dribbble.com/tags/candlestick-chart) (não abriu) | A marca de abertura e fechamento, que no Farol vira mediana e último valor na faixa por período. |

### 02_sparkbar

| Referência | O que observar |
|---|---|
| [AG Grid, bar e column sparkline customisation](https://www.ag-grid.com/javascript-data-grid/sparklines-bar-customisation/) [herdado] | `padding` por lado, a linha de eixo removida zerando a espessura e o `itemStyler` que muda o preenchimento por valor, equivalente do `Cell` do Recharts. |
| [AnyChart Chartopedia, sparkline chart](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/) [herdado] | Column sparkline como retângulo vertical proporcional, indicado justamente para séries com valores negativos. |
| [Vega-Lite, bar chart with negative values and a zero baseline](https://vega.github.io/vega-lite/examples/bar_negative.html) [herdado] | A base zero explícita e o rótulo em barra negativa, o mesmo problema geométrico em escala grande. |
| [Datawrapper Academy, how to add bar charts, column charts and line charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables) [herdado] | O par de seletores de cor para positivo e negativo, a coluna começando no zero e só o primeiro e o último ponto com número. |
| [microcharts, PairedBars](https://microcharts.dev/docs/charts/paired-bars) (não abriu; link da navegação da biblioteca) | O par de barras como componente de célula dedicado. |
| [SpreadJS, Hbar sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkhbar) (não abriu) | A barra horizontal de célula como primitiva que compõe o par. |
| [Datawrapper, your favorite chart type is more flexible than you think](https://blog.datawrapper.de/favorite-popular-chart-types/) (não abriu) | A barra comum bem configurada cobrindo comparações que costumam ganhar formas mais caras. |
| [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard) (não abriu) | Sparkbar em cards escuros com a última coluna em cor de acento. |
| [Dribbble, tag kpi design](https://dribbble.com/tags/kpi-design) (não abriu) | Barra fantasma para o período anterior em cards de comparação. |

### 03_pilula-de-variacao

| Referência | O que observar |
|---|---|
| [Tremor, badges e BadgeDelta](https://npm.tremor.so/docs/ui/badges) [aberto] | Os cinco `deltaType`, a propriedade `isIncreasePositive` e o card de KPI com "+9.3%". |
| [microcharts, Delta](https://microcharts.dev/docs/charts/delta) [aberto] | A direção dupla (glifo e cor), a polaridade que troca só a cor e o tratamento de zero e de `NaN`. |
| [microcharts, TrendArrow](https://microcharts.dev/docs/charts/trend-arrow) [aberto] | O glifo que não escala com a magnitude, o `flatBand` como piso de ruído e a divisão Delta para magnitude, Sparkline para série. |
| [microcharts, StatusDot](https://microcharts.dev/docs/charts/status-dot) [aberto] | O par silhueta e cor por estado, o pulso que some com movimento reduzido e o nome acessível "Status: ok". |
| [Mobbin, glossário de badge](https://mobbin.com/glossary/badge) (não abriu) | A pílula como formato de badge mais comum, o uso como rótulo de item em lista e o trio símbolo, cor e rótulo que dispensa depender só de cor. |
| [Stephen Few, Information Dashboard Design, apresentação](https://blogs.ischool.berkeley.edu/i247s12/files/2012/01/Dashboard-Design-Overview-Presentation.pdf) (não abriu) | Pelo resumo da busca, o sparkline que enriquece a seta de tendência com o histórico. |
| [Stephen Few, Dashboard Design: Taking a Metaphor Too Far](https://www.perceptualedge.com/articles/dmreview/dashboard_design.pdf) (não abriu) | A crítica à metáfora de semáforo e de painel de carro. |
| [Stacey Barr, 3 problems with KPI traffic lights](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/) (retornou 403) | Pelo resumo da busca, a crítica ao semáforo como resumo de desempenho e a citação de Few sobre daltonismo. |
| [Creative Tim, KPI cards com sparkline e indicador de variação](https://www.creative-tim.com/ui/block/kpi-sparkline-cards) (não abriu) | A composição recorrente de número grande, pílula no canto e sparkline embaixo. |
| [Dribbble, tag percentage](https://dribbble.com/tags/percentage) (não abriu) | Quantas pílulas usam só cor, sem glifo: o erro a evitar. |
| [Dribbble, tag indicator](https://dribbble.com/tags/indicator) (não abriu) | A variedade de glifos de direção e a seta de tamanho variável, que o modelo proíbe. |
| [Dribbble, tag status](https://dribbble.com/tags/status) (não abriu) | Pontos de status que dependem só de cor, o padrão a evitar. |

### 04_faixa-de-status-tracker

| Referência | O que observar |
|---|---|
| [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker) [aberto] | O dado com `color` e `tooltip` por bloco, o `defaultBackgroundColor` para bloco sem cor e o exemplo responsivo que esconde blocos por breakpoint. |
| [Datawrapper, heatmaps for tables](https://www.datawrapper.de/blog/heatmaps-for-tables) [aberto] | Escala em degraus contra contínua, intervalo de cor manual, legenda e colunas estreitas sem valor. |
| [Wikipedia, warming stripes](https://en.wikipedia.org/wiki/Warming_stripes) [herdado] | A remoção deliberada de eixo, rótulo e número, que deixa a faixa de calor legível em qualquer tamanho. |
| [microcharts, HeatStrip](https://microcharts.dev/docs/charts/heat-strip) (não abriu; link da navegação da biblioteca) | A faixa de calor como componente dedicado de célula. |
| [Datawrapper Academy, how to create a heatmap](https://academy.datawrapper.de/article/308-how-to-create-a-heatmap) (não abriu) | O passo a passo de escolha de paleta e de intervalo. |
| [Stephen Few, Dashboard Design: Taking a Metaphor Too Far](https://www.perceptualedge.com/articles/dmreview/dashboard_design.pdf) (não abriu) | Pelo título e pelo contexto da busca, a crítica ao uso literal de metáforas de painel e de semáforo. |
| [Dribbble, uptime status board](https://dribbble.com/shots/2733357) (não abriu) | A faixa de blocos diários como linguagem estabelecida de página de status. |
| [Dribbble, tag uptime](https://dribbble.com/tags/uptime) (não abriu) | A variação de altura e de vão entre blocos e o efeito na leitura de dias ruins. |
| [Dribbble, tag heatmap](https://dribbble.com/tags/heatmap) (não abriu) | A frequência de rampas verde e vermelho, o padrão a evitar. |

### 05_medidor-de-cobertura-de-dado

| Referência | O que observar |
|---|---|
| [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars) [aberto] | `ProgressBar` e `CategoryBar` como ingredientes prontos para fração e segmentos, e o fato de nenhum deles ter estado de ausente. |
| [Song e Szafir, Where's My Data? Evaluating Visualizations with Missing Data](https://cmci.colorado.edu/visualab/MissingData/) (não abriu) | O achado de que destacar o ausente eleva a qualidade percebida, e de que quebrar a continuidade a reduz e enviesa a leitura. |
| [Song e Szafir, artigo completo em PDF](https://cmci.colorado.edu/visualab/papers/song_VIS_2018.pdf) (não abriu) | Os três modos de codificar valor imputado (destacar, atenuar, anotar) e os três métodos de imputação testados. |
| [DQOps, tipos de dashboard de qualidade de dado](https://dqops.com/docs/dqo-concepts/types-of-data-quality-dashboards/) (não abriu) | Pelo resumo da busca, a completude como dimensão com painel próprio. |
| [Dribbble, tag status indicator](https://dribbble.com/tags/status-indicator) (não abriu) | A ausência quase total de indicador de qualidade de dado nos portais, sinal de que o modelo precisa ser desenhado do zero. |

### 06_marcador-em-trilho

| Referência | O que observar |
|---|---|
| [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars) [aberto] | O `MarkerBar`, com marcador e faixa opcional entre `minValue` e `maxValue`. |
| [microcharts, DotPlot](https://microcharts.dev/docs/charts/dot-plot) (não abriu; link da navegação da biblioteca) | O dot plot como microvisual de célula. |
| [Datawrapper Academy, customizing your dot plot](https://www.datawrapper.de/academy/customizing-your-dot-plot) (não abriu) | As opções de destaque de um ponto sobre a linha. |
| [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) [herdado] | A faixa de normalidade cinza do exemplo clínico, que é o trilho deste modelo sem a série. |
| [Dribbble, tag kpi cards](https://dribbble.com/tags/kpi_cards) (não abriu) | A raridade do marcador em trilho, mais honesto que a barra de progresso quando não há meta. |

### 07_win-loss

| Referência | O que observar |
|---|---|
| [AnyChart Chartopedia, sparkline chart](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/) [herdado] | Win/loss como variação do column sparkline que só registra se o valor é positivo, negativo ou zero. |
| [AnyChart, WinLoss sparkline](https://www.anychart.com/blog/2016/04/02/winloss-javascript-sparkline-chart-anychart/) [herdado] | Os blocos de altura constante e o uso do tipo para séries de resultado esportivo e comercial. |
| [MyExcelOnline, win/loss sparklines](https://www.myexcelonline.com/blog/winloss-sparklines-in-excel/) [herdado] | A convenção de dado 1, menos 1 e 0, o aviso de que células vazias e entradas inconsistentes quebram o desenho e o foco em sequências. |
| [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) [herdado] | A resolução tipográfica, que faz o win/loss caber dentro de uma linha de texto. |
| [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline) (não abriu) | Blocos binários em tabelas de status, com altura menor que a do sparkbar. |

### Lacunas conhecidas

- A maior parte das referências de portal e várias de praticante ficaram como (não abriu): conteúdo e qualidade visual não foram conferidos. Olhe antes de adotar.
- Nenhum artigo específico de Nightingale, Andy Kirk, Alberto Cairo ou Information is Beautiful Awards sobre microvisuais apareceu nas buscas do estudo; fora o plugin Sparkliner da varredura de portais, nenhum projeto de Behance ou arquivo de Figma Community específico de microvisual foi achado.
- As coleções não centrais da microcharts (Decision, Expressive e Frontier) não foram inventariadas.
- O PDF de Stephen Few, Rich Data, Poor Data, foi aberto no estudo mas voltou como binário ilegível, por isso fica sem nota de observação.
- O modelo 05 não tem referência de portal que o desenhe: apoia-se na pesquisa sobre dado ausente e nas regras do Farol.
- O sparkline em degraus (24#26) e a faixa por período (24#27) estão descritos no modelo 01, mas sem versão que os demonstre; se o time pedir, entram como versões novas desse modelo.
