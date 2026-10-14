# Radar

Radar responde uma pergunta só: **qual é o perfil desta entidade em várias dimensões** e, com cuidado, se esse perfil se parece com o de uma referência. Coloca 5 a 8 métricas de mesma escala em eixos que saem do centro e liga os valores num polígono. A literatura é quase unânime em restringir o formato: a área cresce ao quadrado do raio e engana, a forma muda quando se troca a ordem dos eixos, a linha sugere vizinhança entre categorias que não têm relação, o olho prefere polígonos simétricos e não existe sentido de leitura para ranking. Por isso a família trabalha com escala comum fixa e declarada, centro no zero, ordem de eixos vinda do registry, no máximo duas séries sobrepostas e saída para barras em todo radar. Os seis modelos abaixo vão da forma de referência às alternativas radiais sem polígono e ao radar desenrolado.

Estudo de origem: [`_estudo/familias/18_radar.md`](../_estudo/familias/18_radar.md). Catálogo desta família: [`_estudo/catalogo/18_radar.json`](../_estudo/catalogo/18_radar.json).

## O que a família responde

Perguntas típicas no Farol, com dado fictício:

- **Comercial:** qual o perfil do Executivo 07 em descoberta, proposta, negociação, follow up, CRM em dia e precisão de forecast? Ele sai da faixa do time em alguma dimensão?
- **Pré-vendas:** em que dimensões (tempo de resposta, tentativas, agenda, qualificação, comparecimento) a fila de inbound difere da fila de outbound? Em que horas do dia a demanda chega?
- **Marketing:** qual o perfil de qualidade de uma origem de lead (cobertura de telefone, e-mail corporativo, cargo, fit, resposta, agenda)? Quais origens formam um grupo à parte?
- **Diretoria:** qual a maturidade da área comercial nos critérios do plano anual? Como o cenário base se posiciona entre o pessimista e o otimista?

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | O que responde |
|---|---|---|---|---|---|
| 01 | Radar simples | [./01_radar-simples/](./01_radar-simples/) | Recharts nativo | 4 | Perfil de uma entidade em 5 a 8 eixos de mesma escala; absorve a faixa de referência do grupo como coroa. |
| 02 | Radar comparativo sobreposto | [./02_radar-comparativo/](./02_radar-comparativo/) | Recharts nativo | 4 | Entidade contra uma referência, com foco preenchido e referência em contorno; absorve o radar só contorno. |
| 03 | Radar em pequenos múltiplos | [./03_radar-em-pequenos-multiplos/](./03_radar-em-pequenos-multiplos/) | Recharts nativo | 4 | Perfis de 4 a 12 entidades lado a lado, com o mesmo domínio e a mesma ordem de eixos. |
| 04 | Radar de ciclo | [./04_radar-de-ciclo/](./04_radar-de-ciclo/) | Recharts custom | 4 | Série cíclica (24 horas, 12 meses) em que a continuidade entre o fim e o começo é a mensagem. |
| 05 | Stellar chart | [./05_stellar-chart/](./05_stellar-chart/) | SVG puro | 4 | Perfil radial com espetos afinados e leitura por distância, sem área nem linha entre eixos, até 12 dimensões. |
| 06 | Coordenadas paralelas | [./06_coordenadas-paralelas/](./06_coordenadas-paralelas/) | SVG puro | 4 | Muitos perfis em eixos verticais, com escala própria por eixo e foco contra o conjunto. |

As pastas dos modelos são criadas quando as versões forem produzidas.

## Quando a família serve

- Perfil de uma entidade em 5 a 8 dimensões na mesma escala, lido como forma: onde é forte, onde é fraca.
- Entidade contra uma referência (média do time, meta, outro período), com no máximo duas séries sobrepostas.
- De 4 a 12 perfis comparados em pequenos múltiplos com domínio idêntico.
- Dado naturalmente cíclico (horas do dia, meses do ano), em que o relógio evita cortar a virada do ciclo.
- Muitos perfis ou unidades diferentes por métrica, quando o radar desenrolado em coordenadas paralelas cabe no público.

## Quando procurar outra família

- Ranking ou comparação de magnitude por dimensão: barras agrupadas (02/02).
- Quem é melhor em cada dimensão, com várias entidades: dot plot (17/01) ou tabela com heatmap nas células (14/02).
- Valores exatos por dimensão para decidir: tabela com heatmap nas células (14/02).
- Dia e hora juntos: heatmap dia da semana por hora (15/01).
- Volume por categoria cíclica com apelo radial: coluna radial (07/06) ou rosa de Nightingale (07/07).
- Progresso de várias metas contra alvo: progresso, meta e gauge (13).
- Par de métricas e sua relação: dispersão (09).

## Guia rápido: qual modelo escolher

1. **Uma entidade em 5 a 8 dimensões de mesma escala?** Radar simples (01). Precisa situar a entidade no time? Coroa da faixa do grupo (v3), com ao menos 8 membros.
2. **Entidade contra uma referência?** Radar comparativo (02), foco preenchido e referência só em contorno. Três perfis quase iguais viram emaranhado: botão ver como barras (v4).
3. **De 4 a 12 entidades?** Pequenos múltiplos (03), com domínio e ordem de eixos idênticos. Acima de 12, tabela com heatmap (14/02).
4. **As dimensões são posições de um ciclo?** Radar de ciclo (04), com início no topo e sentido horário. Se a leitura fina importa mais que a continuidade, colunas por hora (03/01).
5. **Muitas dimensões ou dimensões sem vizinhança real, e a peça pede forma radial?** Stellar chart (05), até 12 espetos.
6. **Muitos perfis, padrão de grupo ou unidades diferentes por métrica?** Coordenadas paralelas (06), com mínimo e máximo rotulados em cada eixo.

Regras que valem para os seis modelos:

- Escala comum declarada e fixa: `PolarRadiusAxis domain={[0, 100]}` ou nota de 1 a 5; nunca domínio automático, que muda a forma entre filtros. Normalização sempre escrita na linha de leitura.
- Ordem dos eixos vem do registry e é a mesma em todas as telas; dimensões correlatas ficam vizinhas.
- Centro é zero: sem `innerRadius`. Primeiro eixo no topo e sentido horário (`startAngle` 90 e `endAngle` -270, padrão do Recharts).
- Dado ausente não colapsa no centro: `null` com `connectNulls` desligado e a palavra sem dado no rótulo do eixo. Zero medido desenha a marca e escreve 0.
- Foco em `--chart-1` com `fillOpacity` baixo; referência em contorno tracejado `3 3` de `--text-muted`, declarada antes no JSX; grade em `--line-subtle`.
- Todo radar tem saída para barras com os mesmos dados e a mesma ordem, e dica com os valores de todas as séries.

## Referências cruzadas

O estudo mapeou 14 formas; seis viraram modelos aqui e o resto mora onde a geometria ou a leitura pertence.

| Visual do estudo | Onde mora | Por quê |
|---|---|---|
| Radar só contorno (18#3) | [02 radar comparativo](./02_radar-comparativo/), versões v3 e v4 | É o mesmo radar com `fillOpacity` zero; vira escolha de estilo entre foco e referência. |
| Radar com faixa de referência (18#4) | [01 radar simples](./01_radar-simples/), versão v3 | A coroa é contexto de uma entidade só, desenhada por `shape` do `Radar`. |
| Colunas radiais e rosa (18#8) | [07_rosca-e-radial, modelo 07 rosa de Nightingale](../07_rosca-e-radial/07_rosa-de-nightingale/) | Setor de ângulo igual com raio pelo valor é barra radial, não polígono; lá se declara raio linear ou por área. |
| Pirulito radial (18#9) | [07_rosca-e-radial, modelo 06 coluna radial](../07_rosca-e-radial/06_coluna-radial/) | A coluna radial absorve haste e ponto como a versão com menos tinta. |
| Barras paralelas por dimensão e pequenos múltiplos de barras por métrica (18#10 e 18#11) | [02_barras-horizontais, modelo 02 barras agrupadas](../02_barras-horizontais/02_barras-agrupadas/) | É o destino do botão ver como barras: posição num eixo reto compara melhor que área. |
| Dot plot por dimensão (18#12) | [17_comparacao-de-pontos, modelo 01](../17_comparacao-de-pontos/) | Pontos por entidade num eixo comum pertencem à comparação de pontos (dot plot de Cleveland). |
| Tabela realçada de perfil (18#14) | [14_tabelas-visuais, modelo 02 tabela com heatmap nas células](../14_tabelas-visuais/02_tabela-com-heatmap-nas-celulas/) | Quando o leitor precisa do valor exato ou há mais de 12 entidades, a tabela vence o radar. |
| Heatmap de dia por hora e heatmap radial de 24 horas | [15_mapa-de-calor-e-calendario, modelo 01](../15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora/) | Quando a leitura precisa de dia e hora juntos, o radar de ciclo (04) perde para a grade. |
| Radar com três ou mais áreas opacas sobrepostas | fora do catálogo | Antipadrão: uma série esconde a outra e a forma vira emaranhado. |

## Referências

Todos os links vêm do estudo da família e da varredura de portais (`_estudo/00_portais-de-design.md`), com a marca de proveniência de lá quando a página não foi lida por inteiro. Bibliotecas citadas só como leitura de geometria não entram na stack do Farol.

### Método e crítica ao radar

- [Stephen Few, Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar o mesmo dado em radar e em barras, o argumento sobre ranking, os gráficos separados por medida e a figura de acessos por hora como relógio de 24 horas.
- [Storytelling with Data, o que é um spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): observar pequenos múltiplos como saída quando as sobreposições poluem e as coordenadas paralelas apresentadas como radar desenrolado.
- [From Data to Viz, a armadilha do spider chart](https://www.data-to-viz.com/caveat/spider.html): observar o problema da ordem dos eixos, da escala comum e as alternativas cartesianas.
- [Data Viz Catalogue, radar chart](https://datavizcatalogue.com/methods/radar_chart.html): observar as limitações listadas e a recomendação de poucas variáveis.
- [Flourish, radar charts para histórias de dados](https://flourish.studio/blog/create-online-radar-spider-charts/): observar o uso para análise de lacuna, o alerta sobre ordem dos eixos, a alternância entre grade de pequenos múltiplos e visão individual, e stellar e barras radiais como saída.
- [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/): observar a crítica às áreas sobrepostas e a tabela com cor, negrito e símbolos respondendo quem é melhor em quê.

### Radar simples e comparativo (01 e 02)

- [Recharts, Simple Radar Chart](https://recharts.github.io/en-US/examples/SimpleRadarChart/): observar a composição mínima `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis` e `Radar`.
- [Recharts, Specified Domain Radar Chart](https://recharts.github.io/en-US/examples/SpecifiedDomainRadarChart/): observar duas séries com `fillOpacity={0.6}` e `domain={[0, 150]}` fixo.
- [Recharts, API do Radar](https://recharts.github.io/en-US/api/Radar/): observar `shape`, `isRange` e `baseLinePoints`, base da coroa da faixa de referência.
- [Recharts, API do PolarGrid](https://recharts.github.io/en-US/api/PolarGrid/) e [API do PolarAngleAxis](https://recharts.github.io/en-US/api/PolarAngleAxis/): observar `gridType`, `radialLines`, `polarRadius`, `tick` como função de render e `axisLineType`.
- [shadcn/ui, radar com grade circular (código)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-grid-circle.tsx): observar `gridType="circle"`, `fillOpacity={0.6}` e pontos com `fillOpacity: 1`.
- [shadcn/ui, radar com rótulo customizado (código)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-label-custom.tsx): observar o `tspan` com valor e nome em duas linhas e o deslocamento do primeiro rótulo.
- [shadcn/ui, radar só linhas (código)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-lines-only.tsx): observar `fillOpacity={0}`, `strokeWidth={2}` e `radialLines={false}`.
- [AG Charts, radar area com rótulos](https://www.ag-grid.com/charts/gallery/radar-area-with-labels/): observar opacidades diferentes por série e rótulos só na primeira.
- [AG Charts, radar com marcadores](https://www.ag-grid.com/charts/gallery/radar-with-markers/): observar marcadores com opacidade 0,9 sem traço, grade circular e linhas semitransparentes marcando fronteiras no raio.

### Pequenos múltiplos e ciclo (03 e 04)

- [Recharts, API do RadarChart](https://recharts.github.io/en-US/api/RadarChart/): observar `startAngle` 90 e `endAngle` -270 como padrão, o que já dá topo e sentido horário.
- [Highcharts, polar (radar) chart](https://www.highcharts.com/docs/chart-and-series-types/polar-chart): observar `pane.startAngle` com 0 no norte e `pointPlacement`.
- Few, Storytelling with Data e Flourish, acima: observar a repetição com domínio idêntico no lugar da sobreposição.

### Stellar chart e coordenadas paralelas (05 e 06)

- [Nightingale, The Stellar Chart](https://nightingaledvs.com/the-stellar-chart-an-elegant-alternative-to-radar-charts/): observar os três problemas do radar e a sequência colunas radiais, pirulito radial e stellar.
- [ResearchGate, artigo do Stellar Chart](https://www.researchgate.net/publication/354904488_The_Stellar_Chart_An_Elegant_Alternative_to_Radar_Charts) (não abriu): versão acadêmica do mesmo autor.
- [visx, exemplo de radar (código)](https://raw.githubusercontent.com/airbnb/visx/master/packages/visx-demo/src/sandboxes/visx-radar/Example.tsx): observar ângulos e pontos por seno e cosseno e níveis da teia com raio proporcional; só leitura de geometria.
- [Data Viz Catalogue, parallel coordinates](https://datavizcatalogue.com/methods/parallel_coordinates.html): observar a limitação de eixos vizinhos e a seleção por pincel.
- [From Data to Viz, parallel coordinates](https://www.data-to-viz.com/graph/parallel.html): observar os quatro métodos de escala, a ordem dos eixos e o destaque contra o espaguete.

### Alternativas que moram em outras famílias

- [Data Viz Catalogue, radial bar chart](https://datavizcatalogue.com/methods/radial_bar_chart.html): observar o alerta sobre barras externas parecerem mais longas.
- [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): observar a seção Nightingale com série simples, múltiplas séries e invertida.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar dot strip plot e dot plot nas categorias Ranking e Distribution.

### Portais de design

- [Dribbble, coleção de radares do Hyper charts UI Kit](https://dribbble.com/shots/21778362-Radar-charts-collection-Hyper-charts-UI-Kit) (não abriu): coleção de radares com cor, fonte e estilo customizáveis; olhar o shot antes de adotar.
- [Dribbble, radar em wireframe](https://dribbble.com/shots/419215-Radar-Chart-Wireframe) [busca]: útil para decidir grade e rótulo antes da cor.
- [Figma Community, spider graph templates](https://www.figma.com/community/file/1355097660567567897/spider-graph-templates) [busca]: modelos de pentágono a decágono; ajuda a fixar o número de eixos.
- [Behance, seleção de radar charts](https://www.behance.net/gallery/116913831/Selection-of-radar-charts) [aberto]: variações de grade e preenchimento; a página traz só imagens e tags.
- [Behance, Analytics Spider (Radar) Chart em D3](https://www.behance.net/gallery/38231429/Analytics-Spider-%28Radar%29-Chart-D3js): tratamento de interação e comparação; só metadados em texto verificados.
- [Behance, Radar Chart](https://www.behance.net/gallery/132957557/Radar-Chart): espessura e contraste de linha em peça para web; só metadados em texto verificados.
