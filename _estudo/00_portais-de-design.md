# Varredura de portais de design para o catálogo VISUAIS do Farol

_Varredura feita em 2026-09-14. Estudo de referência: não é especificação, não entra no build._

## Como ler este documento

Cada família do catálogo lista de 3 a 8 links específicos (projeto, shot ou arquivo), com uma linha do que o designer fez de bom e aplicável ao Farol (tema escuro, dados fictícios, React 18.3 + TypeScript strict + Recharts 3.10 + Tailwind 4 + lucide-react). A linha **No Farol** diz se o visual sai do Recharts ou vira SVG puro/HTML com geometria calculada em TypeScript.

**Marcação de cada link (regra de proveniência):**

| Marca | Significado |
|---|---|
| **[aberto]** | Página aberta e lida nesta varredura. A descrição vem do texto da própria página. |
| **[busca]** | URL literal de um resultado de busca, não aberta. A descrição vem do título e do trecho que a busca devolveu. |
| **(não abriu)** | URL literal de busca que tentei abrir e não carregou. A descrição vem do título e do trecho da busca. |

**O que o acesso permitiu, por portal:**

* **Dribbble:** a página do shot chega vazia no leitor ou cai em verificação humana (HTTP 405) e limite de requisições (HTTP 429). Só um shot abriu (via leitor). Os demais links do Dribbble valem pelo título e trecho da busca, então **a qualidade visual não foi conferida**: olhe o shot antes de adotar.
* **Behance:** abre direto, mas a página de projeto chega em modo texto. Na maioria dos casos a descrição do designer é curta ou ausente; quando a página não descreve nada, isso está dito na linha.
* **Figma Community:** HTTP 403 direto; cinco arquivos abriram via leitor. O resto vale pela busca.
* **Mobbin, UI8, Muzli, Awwwards:** Muzli e Awwwards abrem; Mobbin abriu uma página de categoria via leitor; UI8 devolveu 403 e 429.

**Regras de escrita aplicadas:** nomes de designers e de empresas reais foram omitidos do texto; os slugs das URLs são os originais e ficam como estão. Shots de telas de produtos reais (Mobbin) não são citados individualmente por esse motivo.

**Limite da varredura:** o orçamento de buscas da sessão acabou antes de cobrir mosaico/marimekko no Behance e na Figma Community, gráfico de inclinação (slope) e bullet chart com shot específico. Essas lacunas estão marcadas nas famílias.

---

## 01_cards-e-kpis

* https://dribbble.com/shots/17238059-Dashboard-Cards-Light-Dark (não abriu) · cards de dashboard na mesma composição em claro e escuro, útil para testar se hierarquia e contraste do card sobrevivem à troca de tema.
* https://dribbble.com/shots/25092919-Sales-Dashboard-Dark-Mode (não abriu) · painel de vendas escuro montado sobre componentes shadcn/ui, com receita total, crescimento de assinaturas e vendas recentes no topo; é o vocabulário visual mais próximo de Tailwind.
* https://dribbble.com/shots/23673869-SaaS-Analytics-Dark-Dashboard [busca] · faixa de KPIs de vendas acima de tabela de transações, em tema escuro.
* https://www.behance.net/gallery/129162191/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-P1 [aberto] · KPIs e métricas desenhados dentro de um design system próprio, pensado para evoluir junto com a meta do negócio (a página não detalha a anatomia do card).
* https://www.behance.net/gallery/255429155/Analytics-Metric-Cards-UI [aberto] · estudo dedicado só a cards de métrica; a página não traz texto, só as imagens.
* https://www.behance.net/gallery/227305143/Modern-KPI-Dashboard-Cards-UI-Kit-2025 [aberto] · kit de cards de KPI (a página traz só título e tags de dashboard e fintech).
* https://www.figma.com/community/file/1130917765288346079/kpi-charts [busca] · arquivo de cards de KPI com gráfico embutido.
* https://www.figma.com/community/file/1577537133533397367/kpi-dashboard-with-micro-interactions [busca] · cards de KPI com microinterações (estado de hover e transição de valor).

**No Farol:** HTML + Tailwind; sparkline interna em Recharts `LineChart` sem eixos ou em SVG de uma `path`.
**Pouca referência:** não achei nenhum card que mostre **proveniência do número** (MEDIDO, PREMISSA, DERIVADO, LACUNA) nem cobertura de dado; esse elemento é invenção do Farol e não tem precedente nos portais.

## 02_barras-horizontais

* https://dribbble.com/shots/6969622-Horizontal-Bar-Chart [aberto] · o designer defende a barra horizontal por cinco razões explícitas: pontas fáceis de comparar, diferença incremental visível, rótulo longo cabe, leitura da esquerda para a direita e zero ruído. Paleta de sete azuis. Serve de argumento para perdas por motivo e ranking de executivos.
* https://dribbble.com/shots/11014258 (não abriu) · barras separadas com espaço para anotação e rótulo, como componente de proporção em dashboard.
* https://dribbble.com/shots/11352990 (não abriu) · variante do mesmo componente com preenchimento em gradiente.
* https://dribbble.com/shots/4390824-Horizontal-bar-chart (não abriu) · barra horizontal com arquivo-fonte para baixar.
* https://dribbble.com/shots/6710427-Waterfall-NPS-Chart (não abriu) · barras horizontais em cascata para decompor drivers de NPS; ponte com a família 19.
* https://www.behance.net/gallery/124260019/UXUI-Design-Data-Visualization-Library [aberto] · biblioteca de gráficos desenhada para uma empresa de vendas de porte médio (a página lista as imagens e tags de vendas, sem regras escritas).

**No Farol:** Recharts `BarChart` com `layout="vertical"`, rótulo no `YAxis` com largura fixa e valor no `LabelList`.

## 03_colunas-verticais

* https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme (não abriu) · colunas dentro de um card de produto de operação em tema escuro; referência direta para o card de colunas do Farol.
* https://dribbble.com/shots/2121707-Stacked-Bar-Chart (não abriu) · colunas empilhadas.
* https://dribbble.com/shots/17791435-Animated-Stacked-Bar-Chart-49-Days-of-Charts (não abriu) · parte de uma série de 49 gráficos animados, um tipo por dia, seguindo um manual de visualização; a série inteira serve de catálogo de animação de entrada.
* https://dribbble.com/shots/4118414-Bar-Chart (não abriu) · coluna simples; aparece em buscas de combinado, conferir se tem linha sobreposta.
* https://dribbble.com/shots/20359409-Charts-UI-design-Figma-templates-Bars-histograms-line-graphs (não abriu) · biblioteca de modelos com mais de 25 categorias (barras, histogramas, linhas, gantt, gauge, sankey, radar e outras).

**No Farol:** Recharts `BarChart` com `stackId` para empilhar; receita por mês e fechamentos por mês.

## 04_linhas

* https://dribbble.com/shots/2449899-Dashboard-Comparison-Chart (não abriu) · tela de comparação de segmentos em que o usuário escolhe as coortes e vê semelhanças e diferenças; modelo para comparar períodos ou executivos.
* https://dribbble.com/shots/1471011-Dark-UI-Chart-Slider (não abriu) · linha em tema escuro com controle deslizante de período embaixo.
* https://dribbble.com/shots/18335691-Animated-Bump-Chart-49-Days-of-Charts [busca] · bump chart (ranking ao longo do tempo); serve para posição de executivos mês a mês.
* https://dribbble.com/shots/20359409-Charts-UI-design-Figma-templates-Bars-histograms-line-graphs (não abriu) · modelos de linha na mesma biblioteca da família 03.
* https://mobbin.com/explore/web/screens/analytics-dashboard [aberto] · categoria de telas reais de analytics: gráficos de tendência sempre acompanhados de filtro e ordenação e organizados em cards modulares.

**No Farol:** Recharts `LineChart`; bump chart é `LineChart` com `YAxis reversed` e domínio inteiro.
**Pouca referência:** não achei shot específico de linha com **faixa de previsão** (forecast com intervalo) nem de comparação com período anterior tracejado; só apareceram páginas de tag.

## 05_areas

* https://dribbble.com/shots/6250451--Juicy-Stacked-Area-Chart (não abriu) · área empilhada com cores saturadas; bom para conferir legibilidade das camadas no escuro.
* https://dribbble.com/shots/2884979-Circular-Area-Chart (não abriu) · área em coordenada polar; vale como contra-exemplo de leitura.
* https://www.behance.net/gallery/253051769/Taski-SaaS-Task-Project-Management-Dashboard [aberto] · painel escuro com gráficos de tendência de produtividade, paleta de dois acentos (azul e âmbar) sobre fundo escuro.
* https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI [aberto] · área de receita dentro de painel escuro com acentos vibrantes para hierarquia.

**No Farol:** Recharts `AreaChart` com `stackId` e `stackOffset="expand"` para 100%; gradiente via `<defs>` com opacidade baixa no escuro.
**Pouca referência:** área empilhada 100% (participação ao longo do tempo) só apareceu como título em resultado de busca, sem URL.

## 06_pizza

* https://dribbble.com/shots/3293014-Pie-Chart-Design (não abriu) · pizza como componente de interface.
* https://dribbble.com/shots/17791263-Animated-Pie-Chart-49-Days-of-Charts (não abriu) · pizza animada da série de 49 gráficos; referência de entrada por varredura angular.
* https://dribbble.com/shots/11927332-Pie-Chart-Infographic (não abriu) · pizza em linguagem de infográfico, com rótulo fora da fatia.
* https://dribbble.com/shots/17103726-3d-pie-chart [busca] · pizza 3D animada; contra-exemplo explícito.
* https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/ [aberto] · o resultado de busca desse artigo lista como antipadrão de dashboard: pizza com mais de 4 fatias, efeito 3D e visual decorativo que ocupa espaço sem informar decisão.

**No Farol:** Recharts `PieChart`; limitar a 4 fatias e agrupar o resto em "outros".

## 07_rosca-e-radial

* https://dribbble.com/shots/20464065-Radial-Chart (não abriu) · barra radial com grande engajamento no portal; referência de acabamento de trilha e ponta arredondada.
* https://dribbble.com/shots/18753894-Universal-Data-Visualization-Donut-Chart (não abriu) · rosca de um kit de visualização para Figma, com valor central.
* https://dribbble.com/shots/22332016-Radial-histogram-charts [busca] · histograma radial; bom para ver o limite de leitura do formato.
* https://www.figma.com/community/file/1379803816977878437/charts-line-chart-bar-chart-pie-chart-donut-radar-scatter-cahrt-buble-radial [busca] · arquivo com rosca e radial lado a lado com linha, barra, radar e bolha.

**No Farol:** Recharts `PieChart` com `innerRadius` para rosca e `RadialBarChart` para radial; número central em `Label` ou HTML sobreposto.

## 08_combinados-e-eixo-duplo

* https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light [aberto] · o melhor achado da família: guia de estilo de dashboard com **regras escritas para gráfico de dois eixos e para funil**, variações de paleta para tema escuro e claro e mockups nos dois temas.
* https://dribbble.com/shots/24601607-Sales-Analytics-Dashboard (não abriu) · painel de vendas que agrega receita multicanal e destaca leads; conferir se usa barra com linha.
* https://dribbble.com/shots/14172134-Sales-report-revenue-example-data-visualization-dashboard (não abriu) · relatório de receita; não confirmei se há eixo duplo.
* https://dribbble.com/tags/dual-axis-chart [busca] · a própria tag do portal tinha só 2 designs, o que confirma a escassez.

**No Farol:** Recharts `ComposedChart` com dois `YAxis` (`yAxisId`); receita em coluna e taxa em linha.
**Pouca referência:** família com menos material de todas entre as comuns. O artigo do Muzli (família 06) cita eixo duplo como antipadrão; vale adotar só quando as duas grandezas tiverem unidade diferente e rótulo de eixo colorido igual à série.

## 09_dispersao-e-bolhas

* https://dribbble.com/shots/2925554-Bubble-Chart (não abriu) · gráfico de bolhas com arquivo-fonte, parte de uma sequência que cobre as visualizações comuns uma a uma.
* https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart (não abriu) · dispersão com distribuição em matriz; ponte com a família 25.
* https://www.behance.net/gallery/149202761/Scatter-plot-charting-component [aberto] · dispersão tratada como componente de biblioteca (a página traz só as imagens, sem estados descritos).
* https://www.behance.net/gallery/182422151/Quadrant-Chart-%28Scatter-Plot%29 [aberto] · dispersão dividida em quadrantes, inspirada em peça jornalística (a página não descreve os rótulos).

**No Farol:** Recharts `ScatterChart` com `ZAxis` para o tamanho da bolha; ex.: CPL contra volume de leads por campanha.

## 10_funil

* https://dribbble.com/shots/17241075-Sales-Dashboard-and-Lead-Funnel-Page (não abriu) · painel de vendas com página própria para o funil de leads.
* https://dribbble.com/shots/26046624-Sales-Funnel-Dashboard-UI (não abriu) · dashboard inteiro organizado em torno do funil de vendas.
* https://dribbble.com/shots/3004993-Sales-Funnel (não abriu) · exploração que tenta contar a história das vendas com **uma única visualização** em vez de vários gráficos; bom para a tela de funil de oportunidades.
* https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light [aberto] · regras escritas para funil (ver família 08).
* https://www.behance.net/gallery/234800155/Funnel-Chart [aberto] · funil desenhado em ilustração vetorial (a página não descreve etapas nem taxas).
* https://www.behance.net/gallery/154211303/Upsell-Downsell-Chart-Funnel-Process-Chart [aberto] · funil como processo com ramificação de oferta adicional e alternativa; lembra bifurcação de handoff.
* https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available [busca] · mais de 30 tipos de gráfico, incluindo funil e sankey.
* https://www.figma.com/community/file/1467135040779593066/charts-components [busca] · mais de 14 tipos e mais de 100 variantes, incluindo funil e radar.

**No Farol:** Recharts `FunnelChart` serve para o trapézio; para funil com taxa entre etapas e contagem absoluta, barras horizontais centradas em HTML/Tailwind leem melhor.

## 11_fluxo-sankey

* https://dribbble.com/shots/21895394-Futuristic-dashboard-with-sankey-chart-visualization (não abriu) · sankey dentro de dashboard escuro, parte de um kit de gráficos.
* https://dribbble.com/shots/12464862-Free-Sankey-Chart-Resource (não abriu) · recurso gratuito pensado para **desempenho de funil e jornada do cliente** em dashboard; exatamente o caso de uso de entradas até fechamento.
* https://dribbble.com/shots/14221038-Sankey-Diagram (não abriu) · sankey como peça isolada.
* https://dribbble.com/shots/24896768-Sankey-diagram-tool (não abriu) · interface de ferramenta que gera sankey a partir dos dados do usuário.
* https://dribbble.com/shots/17998273-Animated-Sankey-Diagram-49-Days-of-Charts (não abriu) · sankey animado da série de 49 gráficos.
* https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options [aberto] · compara sankey, corda, barra empilhada, agrupada e radial para os mesmos dados de dois níveis e registra a decisão num caderno; método aplicável à escolha de visual no catálogo.
* https://www.behance.net/gallery/107000871/Pathways-to-mitigating-climate-change-Sankey-diagram [aberto] · sankey construído com dados de artigos científicos (a página não detalha ordem de nós nem cor).
* https://www.figma.com/community/file/1164519978600011950/sankey-demo [busca] · arquivo de demonstração de sankey.

**No Farol:** Recharts `Sankey` com `node` e `link` customizados; rótulo fora do nó e cor do link herdada da origem.

## 12_hierarquia

* https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options [aberto] · referência principal: testa cinco formas para uma hierarquia de dois níveis e escolhe pela legibilidade.
* https://dribbble.com/shots/14711133-Figma-Charts-UI-kit-Treemap-data-visualization (não abriu) · treemap de kit de gráficos para Figma.
* https://dribbble.com/shots/13754237-Treemap-chart-template-Figma-infographics-Ui-kit [busca] · modelo de treemap descrito como retângulos aninhados em que o maior representa o maior valor.
* https://dribbble.com/shots/20223141-Charts-UI-design-Figma-templates-Sunburst-graph-as-infographics (não abriu) · sunburst do mesmo kit.
* https://www.behance.net/gallery/244707007/Portfolio-Heatmaps-Where-Data-Meets-Clarity- [aberto] · blocos por setor com percentual, valor alocado e seta de direção; verde para alta, vermelho para queda, neutro para estável. Serve como treemap de carteira ou de mix.
* https://www.behance.net/gallery/199328709/Treemap [aberto] · treemap em que o esquema de cor decompõe a evolução ao longo de 25 anos.

**No Farol:** Recharts `Treemap` com `content` customizado; sunburst conferir na documentação do Recharts 3.10 antes de decidir, senão SVG com arcos calculados.

## 13_progresso-meta-e-gauge

* https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard [aberto] · painel de forecast B2B que monitora saúde do pipeline, progresso contra quota e acurácia do forecast; o trio é o mesmo da tela Comercial.
* https://www.behance.net/gallery/233895453/Gauge-Chart [aberto] · arcos para pedidos, receita e lucro do mês, com o argumento de comparar produto a produto sem tabela longa.
* https://dribbble.com/shots/14711130-Figma-Charts-UI-kit-Gauge-templates (não abriu) · modelos de gauge de kit para Figma.
* https://www.figma.com/community/file/1477881073711295499/figma-chart-components [busca] · 19 componentes de gráfico, gauges incluídos.
* https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit [busca] · barras de progresso linear, circular e em etapas; a de etapas serve para metas com marco.
* https://www.behance.net/gallery/65301405/Theme-and-UI-Design-for-Charts-Gauges-and-Maps [aberto] · tema visual para gráficos, gauges e mapas (a página não descreve o tema).

**No Farol:** meta e capacidade contra teto como barra HTML com marcador de alvo (bullet); gauge em `RadialBarChart` com `startAngle`/`endAngle` ou SVG de arco.
**Pouca referência:** **bullet chart** (real contra meta com faixas qualitativas) não rendeu shot específico, só página de tag: https://dribbble.com/tags/bullet_chart [busca]. É o formato mais indicado para capacidade contra teto e metas, então vale desenhar do zero.

## 14_tabelas-visuais

* https://www.behance.net/gallery/254994285/DataGrid-Dashboard-Kit-Pro-Interactive-UI-Kit [aberto] · kit de grade de dados e dashboard feito em **React 18, TypeScript e Tailwind CSS**, com modo escuro; é a mesma stack do Farol e merece inspeção primeiro.
* https://www.behance.net/gallery/180252443/Optimizing-SaaS-Data-Tables-UIUX-Case-Study [aberto] · estudo de caso sobre otimizar tabelas de SaaS, com foco em filtro (a página traz só as tags).
* https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI [aberto] · tabela de pedidos recentes com **indicador de status** dentro de painel escuro.
* https://dribbble.com/shots/3316208-Data-Table-Dashboard-Ui-Design [busca] · tabela de dados como tela principal de dashboard.
* https://dribbble.com/shots/19408052-Data-Table-Dashboard-Design [busca] · outra composição de tabela como tela de dashboard.
* https://www.figma.com/community/file/1021406552622495462/data-table-design-components-free-ui-kit [busca] · componentes gratuitos de tabela para design system corporativo.
* https://www.figma.com/community/file/1337763226031810494/data-table-components [busca] · componente de tabela flexível para SaaS.

**No Farol:** HTML `<table>` com Tailwind; barra inline em `div` com largura percentual, sparkline em SVG por linha.

## 15_mapa-de-calor-e-calendario

* https://dribbble.com/shots/21707985-Heatmap-graphs-Hyper-charts-UI-Kit (não abriu) · mapas de calor de um kit com mais de mil gráficos editáveis.
* https://dribbble.com/shots/3532285-Calendar-heatmap (não abriu) · calendário de calor; bom para volume de entradas por dia.
* https://dribbble.com/shots/17790868-Animated-Matrix-Chart-49-Days-of-Charts [busca] · matriz animada da série de 49 gráficos; serve para SLA por dia da semana e hora.
* https://www.behance.net/gallery/244707007/Portfolio-Heatmaps-Where-Data-Meets-Clarity- [aberto] · grade de blocos com semântica verde/vermelho/neutro e toque para expandir.
* https://www.figma.com/community/file/1537974759673563561/heatmap-graph-components-inity-agency-community [busca] · componentes de heatmap para contribuição, atividade e horas trabalhadas; formato de calendário.
* https://www.figma.com/community/file/1130920123422161382/heat-map-template [busca] · modelo genérico de mapa de calor.

**No Farol:** SVG ou CSS grid com escala sequencial calculada em TypeScript; Recharts não tem heatmap nativo.
**Pouca referência:** a tag de calendário de calor do Dribbble tinha só 1 design.

## 16_distribuicao

* https://dribbble.com/shots/4615955-Box-Plot-with-Whiskers (não abriu) · box plot defendido como forma de mostrar faixa e distribuição num único gráfico, com mediana e percentis em pouco espaço.
* https://dribbble.com/shots/23639318-Histogram-Charts-for-Figma (não abriu) · coleção de histogramas customizáveis para montar dashboard.
* https://dribbble.com/shots/22332016-Radial-histogram-charts [busca] · histograma radial (limite de leitura).
* https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit [aberto] · kit gratuito (CC BY 4.0) com curva de densidade, box plot, violino e histograma, além de waffle, sankey e treemap.

**No Farol:** histograma em `BarChart` com faixas pré-calculadas; box plot em SVG com quartis calculados em TypeScript.
**Pouca referência:** nenhum achado no Behance; distribuição quase não aparece em dashboard comercial de portfólio.

## 17_comparacao-de-pontos

* https://dribbble.com/shots/17791283-Animated-Connected-Dot-Plot-49-Days-of-Charts (não abriu) · dot plot conectado (o dumbbell), da série de 49 gráficos; serve para antes e depois por executivo.
* https://dribbble.com/shots/3980027-Dot-Plot-Graph [busca] · dot plot simples.
* https://dribbble.com/shots/18335691-Animated-Bump-Chart-49-Days-of-Charts [busca] · mudança de posição entre períodos.
* https://dribbble.com/shots/2449899-Dashboard-Comparison-Chart (não abriu) · comparação entre coortes escolhidas pelo usuário.

**No Farol:** SVG com escala linear calculada em TypeScript; alternativa em `ScatterChart` com `ReferenceLine` ligando os pares.
**Pouca referência:** **dumbbell, lollipop e slope** não renderam shot específico; o que a busca devolveu foi documentação de biblioteca e tutorial, não portal de design.

## 18_radar

* https://dribbble.com/shots/21778362-Radar-charts-collection-Hyper-charts-UI-Kit (não abriu) · coleção de radares com cor, fonte e estilo customizáveis.
* https://dribbble.com/shots/419215-Radar-Chart-Wireframe [busca] · radar em wireframe; útil para decidir grade e rótulo antes da cor.
* https://www.behance.net/gallery/116913831/Selection-of-radar-charts [aberto] · seleção de radares (a página traz só as imagens e as tags).
* https://www.figma.com/community/file/1355097660567567897/spider-graph-templates [busca] · modelos de pentágono a decágono; ajuda a fixar o número de eixos.

**No Farol:** Recharts `RadarChart`; no máximo 2 séries sobrepostas e 5 a 8 eixos.

## 19_cascata-waterfall

* https://www.behance.net/gallery/241535937/YTD-Bookings-Pipeline-Stacked-Waterfall-Chart-%28Excel%29 [aberto] · cascata empilhada de **reservas acumuladas no ano mais pipeline**; o tema é o mesmo da ponte de forecast da tela Comercial (a página não descreve cores).
* https://dribbble.com/shots/4936758-Waterfall-Chart (não abriu) · cascata com exemplo do efeito cumulativo de valores positivos e negativos, comparando valor inicial e final.
* https://dribbble.com/shots/6710427-Waterfall-NPS-Chart (não abriu) · cascata horizontal, boa quando os rótulos das etapas são longos.
* https://www.behance.net/gallery/107274033/Waterfall-Charts-Infographics [aberto] · modelos de cascata para apresentação com valores positivos e negativos.
* https://www.behance.net/gallery/253236163/Data-Visualization-Guidelines [aberto] · guia com 18 modelos de gráfico e regras de cor, contraste, tipografia, espaçamento e anotação; apareceu na busca de cascata.

**No Farol:** Recharts `BarChart` empilhado com a base invisível calculada em TypeScript, ou SVG direto; custo em três camadas e ponte de receita.

## 20_cronograma-e-linha-do-tempo

* https://www.behance.net/gallery/181443889/Dasboard-Gantt-Chart-UI-kit-Components-UX [aberto] · kit de gantt com barras, marcos, linha de hoje e dependências, organizado por atomic design.
* https://dribbble.com/shots/16303456-Gantt-chart-Roadmap-for-Marketing-Company [busca] · gantt de roadmap de marketing.
* https://dribbble.com/shots/4391846-Gantt-Chart-Timeline [busca] · linha do tempo que dá visão do andamento de projetos em curso e futuros.
* https://dribbble.com/shots/5610958-Gantt-Chart-UI [busca] · gantt como tela de produto.
* https://dribbble.com/shots/3890634-Activity-Feed-Dashboard [busca] · feed de atividade como linha do tempo vertical dentro de dashboard; serve para histórico de handoff.
* https://dribbble.com/shots/1740688-Product-Dashboard-Activity-Feed-UI-UX [busca] · feed de atividade com hierarquia de evento.
* https://www.figma.com/community/file/1195850074518926318/project-timeline-gantt-chart [busca] · linha do tempo em gantt com tarefas, prazos e conexões.

**No Farol:** SVG ou CSS grid com colunas de data calculadas; `BarChart` horizontal com base invisível resolve gantt simples.

## 21_texto-e-nuvem-de-palavras

* https://dribbble.com/shots/4085097-Word-Cloud [busca] · nuvem de palavras como peça de interface.
* https://www.behance.net/gallery/43513099/Career-Advice-Word-Cloud-Infographic [aberto] · nuvem em que tamanho e destaque indicam frequência dos termos (a página não detalha regra de cor).
* https://dribbble.com/tags/word_cloud [busca] · tag do portal, citada para mostrar que o material é quase todo decorativo.

**No Farol:** para motivos de perda ou termos de busca, barra horizontal ranqueada lê melhor; nuvem só como exceção, em HTML com `font-size` proporcional.
**Pouca referência:** a busca de nuvem de palavras no Behance devolveu quase só estampa de camiseta e pôster; não achei nuvem dentro de dashboard analítico.

## 22_unidades-waffle-e-pictograma

* https://dribbble.com/shots/24115728-Waffle-chart [busca] · waffle como peça de dashboard.
* https://dribbble.com/shots/17898541-Animated-Waffle-Chart-49-Days-of-Charts [busca] · waffle animado da série de 49 gráficos.
* https://www.behance.net/gallery/115376469/Como-as-pessoas-estao-se-exercitando-na-quarentena [aberto] · pictograma isométrico em português (a página traz só título e tags).
* https://www.figma.com/community/file/1271360341439247258/waffles [busca] · arquivo dedicado a waffle.
* https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit [aberto] · inclui waffle entre os tipos (ver família 16).

**No Farol:** CSS grid 10x10 com `div` por unidade; ícone de pessoa com lucide-react para pictograma.
**Pouca referência:** poucos exemplos em contexto de dashboard; quase tudo é infográfico editorial.

## 23_mapas

* https://www.figma.com/community/file/1393010274407329820/brazil-states-map-for-data-visualization [busca] · mapa do Brasil com cada estado como componente colorível; base direta para coroplético por UF.
* https://www.figma.com/community/file/1116542873315056571/open-source-brazil-for-data-vis [busca] · estados do Brasil em **quadrados de tamanho igual** (tile map); elimina a distorção de área entre UFs grandes e pequenas.
* https://www.figma.com/community/file/1315813033136332578/u-s-heat-maps [busca] · mesma técnica em três estilos (hexágono, quadrado e realista); referência de como desenhar o tile map.
* https://dribbble.com/shots/4704497-Choropleth-Map [busca] · coroplético de orçamento agregado por distrito em escala de calor.
* https://dribbble.com/shots/17791306-Animated-Choropleth-Map-49-Days-of-Charts [busca] · coroplético animado da série de 49 gráficos.
* https://dribbble.com/shots/25330210-Visitor-analytics-widget-Dark-mode [busca] · widget de visitantes com mapa em tema escuro.
* https://www.behance.net/gallery/171554797/Data-screen-Regional-business-monitoring [aberto] · tela de monitoramento de negócio por região com mapa e linguagem de painel de controle (a página não descreve a escala de cor).
* https://www.behance.net/gallery/255244289/Analytical-Dashboard-for-Map-Viewers [aberto] · dashboard analítico construído em torno de mapa (a página traz só título e tags).

**No Farol:** tile map em CSS grid com posição fixa por UF (sem geometria externa); coroplético exige `path` SVG embutido no bundle.

## 24_microvisuais-sparklines

* https://dribbble.com/shots/4625487-Sparklines [busca] · sparkline como forma de dar contexto histórico a um valor estático; em tabela, mais informação no mesmo espaço.
* https://dribbble.com/shots/4437593-Dashboard-Sparkline-Experiments [busca] · experimentos de sparkline dentro de dashboard.
* https://dribbble.com/shots/1225506-Sparkline [busca] · sparkline como componente.
* https://dribbble.com/shots/4202840-23-Sparkline [busca] · sparkline em série de estudos numerados.
* https://dribbble.com/shots/410363-Sparkline [busca] · sparkline mínima.
* https://www.figma.com/community/plugin/1104468340333278614/sparkliner [busca] · plugin que gera sparkline a partir de dado colado; só para rascunho.

**No Farol:** SVG de uma `path` com ponto final destacado; Recharts `LineChart` sem eixos quando precisar de tooltip.

## 25_matriz-e-quadrantes

* https://www.behance.net/gallery/182422151/Quadrant-Chart-%28Scatter-Plot%29 [aberto] · dispersão em quatro quadrantes (ver família 09).
* https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart (não abriu) · distribuição em matriz sobre dispersão.
* https://dribbble.com/shots/17790868-Animated-Matrix-Chart-49-Days-of-Charts [busca] · matriz animada.

**No Farol:** `ScatterChart` com duas `ReferenceLine` na média ou na meta e `ReferenceArea` rotulando cada quadrante; ex.: CPL qualificado contra volume.
**Pouca referência:** a busca de matriz 2x2 devolveu modelos de priorização de ferramentas de quadro branco, não design de dashboard.

## 26_mosaico-marimekko

* https://dribbble.com/shots/4543911-45-Marimekko-Chart [busca] · marimekko de uma série numerada de estudos de gráfico.
* https://dribbble.com/tags/marimekko [busca] · tag do portal, citada para mostrar a escassez (inclui páginas de referência do formato em tablet).
* https://datavizcatalogue.com/methods/marimekko_chart.html [busca] · não é portal de design, mas explica largura e altura normalizadas a 100% e o limite de poucas categorias.

**No Farol:** SVG ou HTML flex com largura da coluna proporcional ao total e altura proporcional à participação; participação de mercado com perímetro.
**Pouca referência:** **a família mais pobre do catálogo.** Behance e Figma Community não foram varridos por falta de orçamento de busca.

## 27_rede-e-relacoes

* https://dribbble.com/shots/3224169-Graph-Network-UI [busca] · grafo em que cada nó é um artista ligado a outros por gênero; bom modelo de nó rotulado com agrupamento por atributo.
* https://dribbble.com/shots/25147704-Network-Graph-Data-Visualization [busca] · grafo de rede como visualização de dados.
* https://www.behance.net/gallery/102929797/Network-Data-Visualization [aberto] · rede de vias com atributos sobrepostos aos nós (camadas de informação sobre a mesma topologia).
* https://www.behance.net/gallery/43680295/Collaboration-Graph [aberto] · padrões de colaboração dentro de empresas a partir de compartilhamento de arquivos, com interface gestual e versão imersiva.
* https://www.figma.com/community/file/1100594710452335478/network-diagram-template [busca] · modelo de diagrama de rede com componentes e conexões.

**No Farol:** SVG puro com layout radial ou em camadas calculado em TypeScript (sem simulação de força, que exigiria biblioteca).
**Pouca referência:** quase nada em dashboard comercial; o material é de pesquisa, jornalismo ou infraestrutura.

---

## Dashboards completos em tema escuro

### Dribbble
* https://dribbble.com/shots/25092919-Sales-Dashboard-Dark-Mode (não abriu) · vendas em tema escuro sobre shadcn/ui.
* https://dribbble.com/shots/23673869-SaaS-Analytics-Dark-Dashboard [busca] · visão geral de vendas, métricas e tabela de transações.
* https://dribbble.com/shots/20398432-Sales-Dashboard-Dark-Mode [busca] · outro painel de vendas escuro.
* https://dribbble.com/shots/3529761-Sales-Dashboard-Dark [busca] · painel de vendas escuro, mais antigo; bom para comparar evolução de densidade.
* https://dribbble.com/shots/24601607-Sales-Analytics-Dashboard (não abriu) · receita multicanal e destaque de leads.
* https://dribbble.com/shots/21895394-Futuristic-dashboard-with-sankey-chart-visualization (não abriu) · escuro com sankey.

### Behance
* https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI [aberto] · escuro equilibrado com acentos vibrantes, visão de vendas, receita e tabela com status; espaçamento e tipografia consistentes.
* https://www.behance.net/gallery/81085955/Data-Visualization-Dashboard-UI-Kit [aberto] · kit de dashboard com modo claro e escuro para finanças e gestão.
* https://www.behance.net/gallery/254777417/SaaS-Dashboard-Analytics-Web-Application [aberto] · analytics SaaS em modo escuro (a página traz só imagens e tags).
* https://www.behance.net/gallery/241954613/Rayum-The-Invisible-CRM [aberto] · CRM conceitual em modo escuro minimalista, com a tese de interface que não interrompe.
* https://www.behance.net/gallery/253653757/Sales-Management-Dashboard [aberto] · gestão de vendas com acompanhamento de pipeline, leads, oportunidades e receita.
* https://www.behance.net/gallery/215887035/Stratus-CRM-SaaS-UX-UI-Dashboard-Design [aberto] · CRM com rastreio de leads e segmentação de clientes.
* https://www.behance.net/gallery/255536599/DEALPORT-Sales-Management-SaaS-Dashboard-UI-Design- [aberto] · gestão de vendas SaaS (a página não detalha componentes).
* https://www.behance.net/gallery/105773549/Customer-Intelligence-Marketing-Analytics-platform [aberto] · analytics de marketing com segmentos, campanhas e **grau de cobertura**; o único achado que trata cobertura de dado como métrica.
* https://www.behance.net/gallery/255424983/AI-Powered-Competitive-Ad-Intelligence-Platform [aberto] · plataforma para achar criativos de melhor desempenho; referência para a tela de criativos do Marketing.
* https://www.behance.net/gallery/245170427/Modern-Website-Analytics-Platform-UXUI-Case-Study [aberto] · analytics de site com tese de priorizar métricas essenciais e reduzir sobrecarga.
* https://www.behance.net/gallery/255169531/Sales-Marketing-Analytics-Dashboard-SaaS-UIUX [aberto] · vendas e marketing no mesmo painel (a página não detalha componentes).

### Muzli
* https://muz.li/inspiration/dashboard-inspiration/ [aberto] · coleção atualizada de dashboards (finanças, vendas, operações).
* https://muz.li/inspiration/dark-mode/ [aberto] · coleção de telas em modo escuro com vários painéis de analytics.
* https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/ [aberto] · seleção comentada de 2026 com antipadrões (ver família 06).
* https://me.muz.li/sajiburdesign/sales-management-dashboard-6 [aberto] · painel de gestão de vendas (a página traz só a miniatura).

### Mobbin
* https://mobbin.com/explore/web/screens/analytics-dashboard [aberto] · telas reais: gráfico sempre com filtro e ordenação, cards modulares em grade.
* https://mobbin.com/explore/web/screens/charts (não abriu) · categoria de gráficos em telas web.
* https://mobbin.com/explore/web/screens/ecommerce-analytics-dashboard [busca] · categoria de analytics de comércio eletrônico.

### UI8 (pago)
* https://ui8.net/digcy/products/premium-dashboard-ui-charts---figma (não abriu) · 50 gráficos em versão clara e escura.
* https://ui8.net/emura/products/chartwit---data-visualization--dashboard-ui-kit [busca] · kit de gráficos e dashboard analítico.
* https://ui8.net/radiant-studio/products/radiant-studio--mega-chart-kit [busca] · mais de 75 gráficos e dashboards para Figma.
* https://ui8.net/pixelpf/products/supehub---multipurpose-admin-dashboard--charts-kit-figma [busca] · quatro estilos (linha claro, linha escuro, primário claro, primário escuro) e mais de 1.100 variantes.

### Awwwards
* https://www.awwwards.com/websites/data-visualization/ [aberto] · coleção premiada de sites de visualização de dados.
* https://www.awwwards.com/sites/covid-19-data-dashboard [aberto] · dashboard de página única com paleta de três cores e prioridade para celular; lição de contenção cromática (é claro, não escuro).
* https://www.awwwards.com/inspiration/data-visualization-state-of-ai-2025 [aberto] · peça de visualização de relatório anual (a página não descreve os gráficos).

---

## Kits de dataviz e de dashboard na Figma Community

Aviso geral: um comentário da comunidade em um dos kits abertos diz que parte dos gráficos é imagem e não componente editável. Abrir o arquivo antes de adotar qualquer kit como base.

### Dataviz (gráficos)

| Nome | Link | Marca | Nota |
|---|---|---|---|
| Data Visualisation UI Kit, 150 Charts, 36 Chart Types, 10 Color Palettes | https://www.figma.com/community/file/1212977094398360391/data-visualisation-ui-kit-150-charts-36-chart-types-10-color-palettes | [aberto] | mais de 150 componentes, 36 tipos, 10 paletas; gratuito, CC BY 4.0 |
| r19 Data Visualization Kit | https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit | [aberto] | densidade, box plot, violino, histograma, sparkline, waffle, sankey, treemap, heatmap; CC BY 4.0; modo escuro não mencionado |
| Chart UI Kit v2.0 | https://www.figma.com/community/file/1328496497617715352/chart-ui-kit-v2-0 | [aberto] | 20 tipos, tema claro e escuro; CC BY 4.0 |
| Charts Components Kit, Free | https://www.figma.com/community/file/1117140803316010537/charts-components-kit-free | [aberto] | mais de 130 variantes, 156 estilos de cor; CC BY 4.0 |
| Data Visualization Graphs / Charts Kit | https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit | [aberto] | 40 gráficos, claro e escuro; CC BY 4.0; comentários reclamam de gráficos em imagem |
| Charts & Graphs, UI Kit | https://www.figma.com/community/file/1314538669933482880/charts-graphs-ui-kit | [busca] | gráficos customizáveis para design system |
| Data Visualization Package (Community) | https://www.figma.com/community/file/1130361890489454674/data-visualization-package-community | [busca] | cards de dado e gráficos prontos |
| Data Visualization Chart Set 1 | https://www.figma.com/community/file/1272086414322879429/data-visualization-chart-set-1 | [busca] | 65 gráficos customizáveis |
| Advanced Data Visualization | https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization | [busca] | tipos avançados |
| Charts, Data Vizualization | https://www.figma.com/community/file/1314420428767393565/charts-data-vizualization | [busca] | gráficos tirados de um kit de apresentação |
| Charts Components For Free, More Than 30 Designs Available | https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available | [busca] | inclui funil e sankey |
| Charts Components | https://www.figma.com/community/file/1467135040779593066/charts-components | [busca] | mais de 14 tipos, inclui funil e radar |
| Figma Chart Components | https://www.figma.com/community/file/1477881073711295499/figma-chart-components | [busca] | 19 componentes, inclui gauges |
| Full charts components | https://www.figma.com/community/file/1039326385370619352/full-charts-components | [busca] | coleção ampla |
| Heatmap Graph Components (Community) | https://www.figma.com/community/file/1537974759673563561/heatmap-graph-components-inity-agency-community | [busca] | heatmap de atividade em formato calendário |
| Spider Graph Templates | https://www.figma.com/community/file/1355097660567567897/spider-graph-templates | [busca] | radar de 5 a 10 eixos |
| sankey diagram | https://www.figma.com/community/file/1221011010073705965/sankey-diagram | [busca] | arquivo de sankey |
| Brazil States Map for Data Visualization | https://www.figma.com/community/file/1393010274407329820/brazil-states-map-for-data-visualization | [busca] | UFs como componentes coloríveis |
| Open Source Brazil for data vis | https://www.figma.com/community/file/1116542873315056571/open-source-brazil-for-data-vis | [busca] | tile map de UFs em quadrados iguais |

### Dashboard (telas, cards, tabelas)

| Nome | Link | Marca | Nota |
|---|---|---|---|
| Modern Dashboard UI Kit, Dark Admin Panel, Productivity & Analytics App Design | https://www.figma.com/community/file/1621990878990665091/modern-dashboard-ui-kit-dark-admin-panel-productivity-analytics-app-design-figma | [busca] | tema escuro, layouts estruturados |
| SaaS Dashboard UI Kit (Free) | https://www.figma.com/community/file/1561384239599771178/saas-dashboard-ui-kit-free | [busca] | claro e escuro, foco em acessibilidade |
| Data Dashboard & Reporting UI Kit | https://www.figma.com/community/file/1531239121499190252/data-dashboard-reporting-ui-kit | [busca] | relatórios |
| Sales Analytics, Mobile UI Kit Light & Dark Theme [Free] | https://www.figma.com/community/file/1274706651798894123/sales-analytics-mobile-ui-kit-light-dark-theme-free | [busca] | vendas, celular, claro e escuro |
| Mobile Dashboard, Charts & KPI Widgets | https://www.figma.com/community/file/1528308765361625218/mobile-dashboard-charts-kpi-widgets | [busca] | cards de dado, gráficos e estados vazios |
| kpi Dashboard | https://www.figma.com/community/file/1273847712697902475/kpi-dashboard | [busca] | painel de KPI |
| Dashboard Cards | https://www.figma.com/community/file/1481885761542814198/dashboard-cards | [busca] | cards de analytics |
| Analytics & Statistics Dashboard | https://www.figma.com/community/file/1211582725537898614/analytics-statistics-dashboard | [busca] | tela de analytics |
| Data table design components, Free UI Kit | https://www.figma.com/community/file/1021406552622495462/data-table-design-components-free-ui-kit | [busca] | tabela corporativa |
| Data table component, Free | https://www.figma.com/community/file/1133845244561497719/data-table-component-free | [busca] | tabela simples e completa |
| Progress Bar UI Kit | https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit | [busca] | linear, circular e em etapas |
| Project timeline (Gantt chart) | https://www.figma.com/community/file/1195850074518926318/project-timeline-gantt-chart | [busca] | gantt |

### Plugins (só para rascunho; o Farol desenha em código)
* https://www.figma.com/community/plugin/1294347762916144472/sankey-diagram-chart-made-easy [busca] · sankey a partir de dados.
* https://www.figma.com/community/plugin/1159893716343028026/sankey [busca] · sankey a partir de CSV.
* https://www.figma.com/community/plugin/1404821057322599271/uchart [busca] · vários tipos, incluindo sankey, funil e heatmap de calendário.
* https://www.figma.com/community/plugin/1284226738201766544/radar-chart [busca] · radar com CSV ou JSON.
* https://www.figma.com/community/plugin/1584969787567772564/gauge-charts-quick-customizable-gauge-dial-speedometer-chart-widget-for-figma-figjam [busca] · gauge e indicador de KPI.
* https://www.figma.com/community/plugin/1171452234740033982/map-chart [busca] · mapa mundial com dados.

---

## Síntese para o catálogo

**Famílias bem servidas:** 01, 02, 10, 11, 12, 14, 19, 20, 23 e dashboards escuros.

**Famílias com pouca referência:**

| Família | Lacuna |
|---|---|
| 08_combinados-e-eixo-duplo | tag com 2 designs; um guia de estilo é o único achado forte |
| 17_comparacao-de-pontos | sem shot de dumbbell, lollipop ou slope |
| 21_texto-e-nuvem-de-palavras | material decorativo, nada em dashboard |
| 22_unidades-waffle-e-pictograma | quase só infográfico editorial |
| 25_matriz-e-quadrantes | um projeto de quadrante e um shot de matriz |
| 26_mosaico-marimekko | um shot e uma tag; Behance e Figma não varridos |
| 27_rede-e-relacoes | nada em contexto comercial |
| 13 (bullet chart) e 04 (faixa de previsão) | formatos centrais para o Farol sem shot específico |
| 16_distribuicao | nada no Behance |
| 01 (proveniência do número) | nenhum precedente de card com etiqueta de proveniência |

**Três achados que valem abrir primeiro:**
1. https://www.behance.net/gallery/254994285/DataGrid-Dashboard-Kit-Pro-Interactive-UI-Kit · a mesma stack do Farol (React 18, TypeScript, Tailwind) com modo escuro.
2. https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light · regras escritas para eixo duplo e funil, com paletas escuro e claro.
3. https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options · método de escolher o visual comparando cinco formas para os mesmos dados.
