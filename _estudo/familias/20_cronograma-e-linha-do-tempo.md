# 20_cronograma-e-linha-do-tempo

_Estudo de família do catálogo VISUAIS do Farol. Pesquisa feita em 2026-09-14. Dados de exemplo 100% fictícios._

Stack de referência: React 18.3 + TypeScript strict + Recharts 3.10.1 (versão conferida no `package.json` do app) + Tailwind 4 + lucide-react. Nada de d3, nivo, visx ou echarts no código; essas bibliotecas aparecem aqui só como referência de forma.

---

## 1. O que a família responde

Cronogramas e linhas do tempo colocam **coisas no eixo do tempo**: quando começam, quando terminam, quanto duram, o que acontece ao mesmo tempo, em que ordem, e onde estamos hoje frente ao plano. A diferença para a família 04 (linhas) é o objeto: aqui o dado é um **intervalo ou um evento**, não uma medida contínua amostrada no tempo.

Perguntas típicas no Farol:

| Público | Pergunta |
|---|---|
| Comercial | Quanto tempo cada oportunidade ficou em cada etapa até o fechamento? |
| Comercial | Quais oportunidades do forecast têm data prevista de fechamento neste trimestre e quais já estouraram a data? |
| Comercial | Quanto tempo leva o handoff entre pré-vendas e o executivo, caso a caso? |
| Pré-vendas | Como está a agenda de reuniões de cada SDR na semana, e onde há sobreposição ou buraco? |
| Pré-vendas | Quais leads estão dentro, perto ou fora da janela de SLA de primeiro contato? |
| Marketing | Quando cada campanha e cada criativo esteve no ar, por plataforma, e o que mudou no CPL nesses períodos? |
| Diretoria | Qual o roadmap das iniciativas do ano, com marcos e com a janela em que o resultado fica legível? |
| Diretoria | Em que datas entram as contratações previstas e como isso conversa com o teto de capacidade? |

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Gantt clássico | Tarefas ou períodos com início e fim, até umas 30 linhas | Centenas de linhas; quando só a ordem importa | Eixo de tempo com ticks em milissegundos crus |
| 2 | Gantt de progresso e linha de base | Comparar planejado com realizado e mostrar % concluído | Quando não existe plano registrado | Pintar o % concluído sobre a duração inteira sem marcar a data de hoje |
| 3 | Gantt com dependências e caminho crítico | Encadeamento entre tarefas define prazo | Projetos grandes: vira teia de setas | Setas cruzando barras sem rota em cotovelo |
| 4 | Gantt hierárquico com tabela | Fases com subtarefas e colunas de dono, status, datas | Leitura em celular | Tabela e barras desalinhadas em altura de linha |
| 5 | Linha do tempo empacotada (Priestley) | Muitos intervalos curtos e sobrepostos, com rótulo na própria barra | Quando cada linha precisa de identidade fixa | Uma linha por item, desperdiçando altura |
| 6 | Swimlane de eventos e períodos | Vários períodos e eventos por responsável ou canal | Quando só há um período por raia (use o 1) | Raias sem ordem lógica |
| 7 | Jornada por entidade (tempo em cada etapa) | Mostrar a sequência de estados de cada oportunidade | Muitas etapas curtas ilegíveis | Cores de etapa sem ordem perceptiva |
| 8 | Linha de estado em blocos (tracker) | Estado discreto por dia ou hora, tipo SLA cumprido ou não | Valores contínuos | Blocos sem tooltip nem legenda de estado |
| 9 | Linha do tempo de marcos | Eventos pontuais com data exata | Eventos com duração relevante | Rótulos colidindo quando datas são próximas |
| 10 | Linha do tempo narrativa com rótulos alternados | Contar a história de um período com poucos eventos descritos | Mais de 15 eventos | Espaçar eventos igualmente quando o intervalo importa |
| 11 | Linha do tempo vertical em cartões (feed) | Histórico detalhado de uma entidade, leitura sequencial | Comparar entidades ou durações | Sem agrupamento por dia |
| 12 | Stepper de etapas | Mostrar em que passo um processo está | Processos não lineares | Confundir etapa atual com concluída |
| 13 | Faixas e marcos sobre série temporal | Explicar mudanças de uma métrica por eventos | Eventos demais sobre a série | Faixa opaca escondendo a linha |
| 14 | Calendário de marcos | Planejamento por dia do mês, prazos e feriados | Tendência ou comparação quantitativa | Semana começando em dia diferente do padrão local |
| 15 | Agenda em grade (timetable) | Blocos de horário por pessoa ou dia | Períodos de semanas ou meses | Blocos sobrepostos desenhados um em cima do outro |
| 16 | Linha do tempo de círculos | Eventos com magnitude em várias categorias | Precisão de valor | Raio proporcional ao valor em vez de área |
| 17 | Diagrama de Marey | Velocidade de entidades passando por etapas ordenadas | Público não treinado | Etapas fora de ordem no eixo |
| 18 | Roadmap por horizonte | Planejamento sem datas firmes (agora, próximo, depois) | Quando há datas comprometidas | Esconder que não há escala de tempo |
| 19 | Linha do tempo radial ou espiral | Ciclos (hora do dia, mês do ano) em peça editorial | Dashboard operacional | Comparar comprimentos em arcos de raios diferentes |

---

## 3. Modelos em detalhe

### 3.1 Gantt clássico

**Descrição.** Lista de atividades nas linhas e escala de tempo nas colunas; cada barra vai do início ao fim da atividade. O catálogo Data Viz Catalogue resume assim: mostra quando cada atividade começa e termina, revela paralelismo e aceita cor, marcos, dependências e marcador de data atual.

**Anatomia.** Eixo Y categórico com os nomes; eixo X temporal com ticks em unidades de calendário (semana, mês); barra de intervalo; linha vertical de hoje; grade vertical leve; rótulo opcional na barra ou à direita.

**Abordagem na stack.** `recharts-nativo`. `BarChart layout="vertical"`, `YAxis type="category" dataKey="nome"`, `XAxis type="number" domain={[inicio, fim]}` e `Bar dataKey="periodo"` em que `periodo` é a tupla `[inicioMs, fimMs]`. A barra com intervalo é suportada nativamente: o exemplo oficial TimelineExample usa exatamente `firstCycle: [0, 3]` e o exemplo de barras empilhadas com intervalo indica suporte desde a 3.6. `ReferenceLine x={hojeMs}` marca hoje.

**Ponto delicado.** O eixo numérico não sabe o que é mês. Gere o array `ticks` no TypeScript (primeiro dia de cada mês ou segunda-feira de cada semana) e formate com `tickFormatter`. Converta datas `YYYY-MM-DD` com `Date.UTC(ano, mes - 1, dia)` e não com `new Date('2026-10-01')` em horário local, para não deslocar a barra por fuso. Para barra de um dia, some 1 dia ao fim (intervalo fechado em dias vira aberto em milissegundos).

**Versões sugeridas.**
1. **Básico: calendário de campanhas do trimestre.** Marketing vê 8 campanhas fictícias (Campanha Outono, Campanha Previdência, etc.) com início e fim entre 2026-10-01 e 2026-12-31, uma por linha.
2. **Com destaque: campanhas por plataforma com linha de hoje.** Cor por plataforma (Plataforma Social, Plataforma de Busca, Plataforma Profissional), `ReferenceLine` em 2026-11-12 com rótulo "hoje" e `ReferenceArea` sombreando a janela de congelamento de orçamento de 2026-12-20 a 2026-12-31.
3. **Denso e real do Farol: 30 criativos no ar com Brush.** Criativos ordenados por data de início, rótulo com CPL qualificado à direita da barra e `Brush` no eixo Y para rolar a lista, como no exemplo BrushBarChart.
4. **Limite: períodos abertos e datas ausentes.** Campanha sem data de fim (ainda no ar) desenhada até hoje com a ponta em degradê ou tracejado e marcação "em aberto"; campanha sem data de início vai para uma lista "sem data" abaixo do gráfico, nunca para o zero do eixo.

**Referências.**
- Catálogo: [Data Viz Catalogue, Gantt Chart](https://datavizcatalogue.com/methods/gantt_chart.html): observar a lista de recursos opcionais (marcos, dependências, data atual) e a relação com o span chart.
- Catálogo: [Vega-Lite, Gantt Chart (ranged bar)](https://vega.github.io/vega-lite/examples/bar_gantt.html): observar a codificação mínima `x` + `x2` + `y`, que é o mesmo contrato da tupla do Recharts.
- Stack: [Recharts, TimelineExample](https://recharts.github.io/en-US/examples/TimelineExample/): observar `layout="vertical"`, dois `Bar` com `stackId` e `dataKey` em tupla, e o `activeBar` customizado.
- Stack: [Recharts, Ranged Bar Chart](https://recharts.github.io/en-US/examples/BarChartRangeExample/): observar que a tupla `[min, max]` já basta, sem série transparente de deslocamento.
- Catálogo: [AG Charts, Range Bar Series](https://www.ag-grid.com/charts/react/range-bar-series/): observar a direção horizontal e rótulos distintos para início e fim.
- Praticante: [Storytelling with Data, What is a Gantt chart](https://www.storytellingwithdata.com/blog/what-is-a-gantt-chart): observar a linha de hoje, marcos como círculo ou losango, cor só para o caminho crítico e remoção de bordas.
- Portal de design: [Behance, busca "gantt chart"](https://www.behance.net/search/projects/gantt%20chart) e [Dashboard Gantt Chart UI kit](https://www.behance.net/gallery/181443889/Dasboard-Gantt-Chart-UI-kit-Components-UX): observar como células, barra superior e navegação convivem com as barras.

---

### 3.2 Gantt de progresso e linha de base

**Descrição.** Gantt em que cada linha tem duas leituras: a barra planejada (linha de base) e a barra realizada ou o preenchimento parcial com o percentual concluído. A Wikipedia registra as variantes de progresso que sombreiam a tarefa proporcionalmente à conclusão e comparam contra uma linha de status.

**Anatomia.** Trilho fino ou contorno com o planejado; barra cheia com o realizado; preenchimento interno até o % concluído; linha de hoje; indicador de atraso (texto "+6 d" ou cor de alerta).

**Abordagem na stack.** `recharts-custom`. Um `Bar dataKey="planejado"` com `shape` customizado. O preenchimento de progresso só precisa das props que o shape já recebe (`x`, `width`, `y`, `height`, `payload`): largura preenchida = `width * payload.pct`. Para desenhar o realizado com datas diferentes do planejado, o shape vira um componente que chama `useXAxisScale()` (exportado pela 3.10.1, disponível desde a 3.8) para converter `payload.realizadoInicio` e `payload.realizadoFim` em pixels.

**Ponto delicado.** Duas barras independentes na mesma categoria ficam lado a lado, não sobrepostas; por isso a sobreposição vai no shape e não em dois `Bar`. O percentual concluído compara com o esperado até hoje: `esperado = (hoje - inicio) / (fim - inicio)`; atraso visual é `pct < esperado`, e isso precisa de legenda textual para não depender só de cor.

**Versões sugeridas.**
1. **Básico: iniciativas da Diretoria com % concluído.** 6 iniciativas do plano 2027 com trilho do planejado e preenchimento até o percentual.
2. **Com destaque: atrasadas em alerta.** Mesma lista com rótulo "+12 d" à direita das iniciativas cujo realizado passou do planejado e cor de alerta só nelas.
3. **Denso e real do Farol: rampa de contratação da pré-vendas.** Planejado versus realizado da entrada de 5 SDRs fictícios (vaga aberta, contratação, ramp-up até produtividade plena), com a data em que a capacidade medida alcança o teto previsto.
4. **Limite: realizado sem plano.** Linha que tem realizado mas nunca teve linha de base: desenhar só o realizado com contorno tracejado e etiqueta "sem plano registrado", em vez de inventar um planejado igual ao realizado.

**Referências.**
- Catálogo: [Highcharts, X-range series](https://www.highcharts.com/docs/chart-and-series-types/x-range-series): observar o contrato `x`, `x2`, `y` e o `partialFill` para percentual concluído.
- Catálogo: [Wikipedia, Gantt chart](https://en.wikipedia.org/wiki/Gantt_chart): observar a seção de variantes de progresso e a crítica de que o gráfico achata incerteza.
- Stack: [Recharts API, índice com hooks](https://recharts.github.io/en-US/api/): observar `useXAxisScale`, `usePlotArea` e `ZIndexLayer`.
- Praticante: [Storytelling with Data, What is a Gantt chart](https://www.storytellingwithdata.com/blog/what-is-a-gantt-chart): observar o uso estratégico de cor e o risco de complexidade em projetos grandes.
- Portal de design: [Behance, Repair Planning Dashboard](https://www.behance.net/gallery/247578277/Repair-Planning-Dashboard): observar um Gantt de planejamento de manutenção em interface web de desktop.

---

### 3.3 Gantt com dependências e caminho crítico

**Descrição.** Gantt em que setas ligam o fim de uma tarefa ao início da seguinte; o caminho crítico (a sequência que define o prazo final) ganha destaque.

**Anatomia.** Barras de intervalo; conectores em cotovelo (sai do fim da barra, desce ou sobe até a linha da sucessora, entra pelo início); ponta de seta; cor de destaque para o caminho crítico e cinza para o resto; folga opcional desenhada como trilho após a barra.

**Abordagem na stack.** `svg-puro`. Linhas com altura fixa (`rowH`), escala linear de tempo própria em TypeScript (`x = (t - t0) / (t1 - t0) * largura`), barras como `<rect>` e conectores como `<path d="M x1 y1 H xm V y2 H x2">`. O caminho crítico é calculado antes de desenhar: ordenação topológica, cedo e tarde de cada tarefa, folga zero = crítica.

**Ponto delicado.** Roteamento: quando a sucessora começa antes do fim da predecessora (sobreposição permitida), o cotovelo precisa contornar pela esquerda, senão a seta atravessa a barra. Ciclos no grafo de dependência devem ser detectados e reportados como erro de dado, não desenhados. A Wikipedia observa que Gantt com dependências fica poluído em projetos complexos; acima de uns 25 conectores, mostre só os da tarefa sob o cursor.

**Versões sugeridas.**
1. **Básico: plano de implantação de um canal.** 7 tarefas fictícias com 6 dependências.
2. **Com destaque: caminho crítico.** Mesmo plano com as 4 tarefas críticas em cor de destaque e as demais em cinza com folga desenhada.
3. **Denso e real do Farol: esteira de preparação da meta 2027.** 18 tarefas entre dados, pré-vendas e mídia, com dependências exibidas só ao passar o cursor sobre uma tarefa.
4. **Limite: dependência inválida.** Uma sucessora que começa antes da predecessora terminar e um ciclo A → B → A: conector em vermelho tracejado com aviso "dependência inconsistente" e ciclo listado fora do gráfico.

**Referências.**
- Catálogo: [Highcharts, Getting started with Gantt](https://www.highcharts.com/docs/gantt/getting-started-gantt): observar as seções de dependências, hierarquia e eixo em grade.
- Catálogo: [Wikipedia, Gantt chart](https://en.wikipedia.org/wiki/Gantt_chart): observar a nota sobre Gantt ligados ficarem poluídos e o caminho crítico como alternativa.
- Praticante: [Nightingale, Ganttsgiving: Plotting a Holiday Feast](https://nightingaledvs.com/ganttsgiving-plotting-a-holiday-feast/): observar como dependências e tarefas paralelas revelam tempo ocioso aproveitável.
- Portal de design: [Behance, Repair Planning Dashboard](https://www.behance.net/gallery/247578277/Repair-Planning-Dashboard): observar o tratamento de tarefas encadeadas numa tela de planejamento.

---

### 3.4 Gantt hierárquico com tabela

**Descrição.** Tabela à esquerda (nome, dono, status, início, fim) e trilha de tempo à direita, com fases que abrem e fecham mostrando subtarefas. A fase desenha a envoltória das filhas.

**Anatomia.** Colunas de tabela; indentação e chevron por nível; barra de fase mais fina que a de tarefa; cabeçalho de tempo em dois níveis (mês em cima, semana embaixo); linha de hoje atravessando tudo.

**Abordagem na stack.** `html-tailwind`. Grid CSS com colunas `grid-cols-[minmax(12rem,1fr)_6rem_6rem_3fr]`; na coluna de tempo cada barra é um `div` absoluto com `left` e `width` em porcentagem calculados em TypeScript. Chevron do lucide-react (`ChevronRight` girando). A tabela e a trilha compartilham a mesma linha do grid, o que resolve alinhamento vertical sem medir DOM.

**Ponto delicado.** Rolagem horizontal da trilha com a coluna de nomes fixa (`sticky left-0`) e cabeçalho fixo (`sticky top-0`). Envoltória da fase: `min(inicio)` e `max(fim)` das filhas visíveis e ocultas. Acessibilidade: cada linha vira `role="row"` com o período também em texto para leitor de tela.

**Versões sugeridas.**
1. **Básico: plano do trimestre por fase.** 3 fases e 9 tarefas, tudo aberto.
2. **Com destaque: fase atrasada recolhida.** Fases fechadas por padrão; a fase com filha atrasada mostra ícone de alerta e contagem "2 atrasadas".
3. **Denso e real do Farol: plano de iniciativas por público.** Nível 1 = público (Comercial, Pré-vendas, Marketing, Diretoria), nível 2 = iniciativa, nível 3 = entrega, com colunas de dono fictício e status.
4. **Limite: nome longo e celular.** Nome com 80 caracteres truncado com `line-clamp-2` e título completo no tooltip; abaixo de 640 px a trilha some e cada linha mostra "2026-10-05 a 2026-11-20" em texto.

**Referências.**
- Catálogo: [Highcharts, Getting started with Gantt](https://www.highcharts.com/docs/gantt/getting-started-gantt): observar "grouping tasks in a hierarchy" e o eixo em grade com colunas.
- Catálogo: [Data Viz Catalogue, Gantt Chart](https://datavizcatalogue.com/methods/gantt_chart.html): observar a descrição do formato de tabela com trilha de tempo.
- Portal de design: [Behance, Dashboard Gantt Chart UI kit](https://www.behance.net/gallery/181443889/Dasboard-Gantt-Chart-UI-kit-Components-UX): observar componentes de célula, barra superior e navegação separados do gráfico.
- Portal de design: [Behance, Gantt Chart / Project Timeline](https://www.behance.net/gallery/109367269/Gantt-Chart-Project-Timeline): observar a divisão em fases de um cronograma de projeto.

---

### 3.5 Linha do tempo empacotada (Priestley)

**Descrição.** Intervalos desenhados como barras rotuladas, empilhados no menor número de faixas possível: um item novo ocupa a primeira faixa livre no seu início. O FT Visual Vocabulary descreve a Priestley timeline como boa quando data e duração são o núcleo da história.

**Anatomia.** Eixo de tempo; faixas sem identidade fixa; barra com o rótulo dentro ou logo depois; cor por categoria.

**Abordagem na stack.** `svg-puro`. Algoritmo guloso de empacotamento de intervalos em TypeScript: ordenar por início, manter o fim de cada faixa, colocar na primeira faixa cujo fim + margem < início. Desenhar `<rect>` e `<text>`; medir o texto para decidir se cabe dentro da barra (senão vai para fora ou some com tooltip).

**Ponto delicado.** A margem entre itens na mesma faixa precisa considerar o rótulo externo, não só a barra, senão rótulos colidem. O layout deve ser determinístico (ordenar por início e depois por id) para não "pular" entre renderizações.

**Versões sugeridas.**
1. **Básico: criativos no ar no trimestre.** 40 criativos fictícios empacotados em 6 faixas.
2. **Com destaque: criativos com CPL qualificado acima da meta.** Mesma peça com cor só nos criativos acima do limite.
3. **Denso e real do Farol: todas as variações de anúncio de 2026.** 220 intervalos empacotados, rótulos só nos que duraram mais de 14 dias.
4. **Limite: sobreposição massiva.** Dia de lançamento com 35 criativos começando juntos: limitar a 12 faixas e agrupar o excedente numa barra "+23" clicável.

**Referências.**
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a definição da Priestley timeline em "Change over time".
- Catálogo: [Data Viz Catalogue, Span Chart](https://datavizcatalogue.com/methods/span_chart.html): observar o aviso de que intervalos mostram só os extremos e nada entre eles.
- Praticante e portal: sem exemplo específico verificado nesta pesquisa.

---

### 3.6 Swimlane de eventos e períodos

**Descrição.** Uma raia por responsável, canal ou sistema; dentro de cada raia, vários períodos e eventos pontuais ao longo do tempo. O termo vem dos diagramas de processo (raias de responsabilidade), aqui aplicado a um eixo temporal real.

**Anatomia.** Raias horizontais com rótulo fixo à esquerda e fundo alternado; períodos como barras; eventos como marcas (losango, círculo); linha de hoje; separadores de dia ou semana.

**Abordagem na stack.** `svg-puro` quando o número de períodos por raia varia. Se cada raia tiver um número fixo e pequeno de segmentos (por exemplo, turno da manhã e turno da tarde), cabe em `recharts-nativo` como no TimelineExample, com um `Bar` por segmento e `stackId` comum.

**Ponto delicado.** Períodos sobrepostos dentro da mesma raia (duas reuniões no mesmo horário) precisam de sub-faixas: aplicar o empacotamento do modelo 5 dentro da raia e aumentar a altura dela, em vez de sobrepor retângulos.

**Versões sugeridas.**
1. **Básico: semana de agendas por SDR.** 5 raias (SDR 1 a SDR 5), reuniões de 30 ou 60 minutos entre 2026-11-09 e 2026-11-13.
2. **Com destaque: no-show e remarcação.** Eventos de no-show como marca vazada e remarcações ligadas por arco fino à nova data.
3. **Denso e real do Farol: handoff em raias de função.** Raias Marketing, Pré-vendas, Executivo e Operações; cada oportunidade fictícia deixa um período em cada raia, mostrando a espera entre as passagens.
4. **Limite: sobreposição e raia vazia.** SDR com três reuniões sobrepostas na terça (sub-faixas) e SDR em férias com a raia hachurada e o texto "ausente", sem confundir com agenda vazia.

**Referências.**
- Catálogo: [Wikipedia, Swim lane](https://en.wikipedia.org/wiki/Swim_lane): observar a origem em diagramas de processo e a orientação horizontal preferida em tela.
- Stack: [Recharts, TimelineExample](https://recharts.github.io/en-US/examples/TimelineExample/): observar a solução para número fixo de segmentos por linha.
- Catálogo: [Highcharts, X-range series](https://www.highcharts.com/docs/chart-and-series-types/x-range-series): observar `y` como índice da raia e vários pontos por raia.
- Portal de design: [Behance, Task and Project Management Web Design](https://www.behance.net/gallery/161886233/Task-and-Project-Management-Web-Design): observar a visão de calendário e a troca de equipe como filtro de raias.

---

### 3.7 Jornada por entidade (tempo em cada etapa)

**Descrição.** Uma linha por oportunidade (ou lead), com segmentos contíguos coloridos por etapa do funil. Mostra a sequência e a duração de cada estado, e revela gargalos quando muitas linhas têm o mesmo segmento longo.

**Anatomia.** Linhas ordenadas (por data de criação ou por duração total); segmentos empilhados sem espaço; cor ordinal por etapa; marca final de desfecho (ganho, perdido, aberto); alinhamento opcional pelo dia zero.

**Abordagem na stack.** `recharts-nativo`. `BarChart layout="vertical"` com um `Bar` por etapa, cada um com `dataKey` em tupla `[entradaMs, saidaMs]` e o mesmo `stackId`, ou `BarStack` como no exemplo RangedStackedBarChart. Para a versão alinhada pelo dia zero, os valores viram dias desde a criação e o eixo passa a ser numérico em dias.

**Ponto delicado.** Etapas repetidas (a oportunidade volta de Proposta para Qualificação) quebram o esquema de um `Bar` por etapa: nesse caso cada passagem vira uma chave própria (`etapa_1`, `etapa_2`) ou o modelo migra para `svg-puro`. Cor: a paleta precisa ser ordinal (claridade crescente) e não categórica, para que "mais adiante no funil" seja legível.

**Versões sugeridas.**
1. **Básico: 15 oportunidades ganhas no trimestre.** Segmentos de Qualificação, Diagnóstico, Proposta e Negociação.
2. **Com destaque: tempo parado.** Segmentos com mais de 30 dias sem movimento com hachura e rótulo "parada 42 d".
3. **Denso e real do Farol: alinhado pelo dia zero.** 60 oportunidades fictícias alinhadas pela criação, ordenadas por ciclo total, com mediana de cada etapa como linha de referência vertical.
4. **Limite: idas e voltas e oportunidade aberta.** Oportunidade que volta de etapa (segmentos repetidos) e oportunidade ainda aberta, cujo último segmento termina em hoje com ponta aberta.

**Referências.**
- Stack: [Recharts, Ranged Stacked Bar Chart](https://recharts.github.io/en-US/examples/RangedStackedBarChart/): observar `BarStack` com três séries em tupla e a nota de suporte desde a 3.6.
- Catálogo: [Data Viz Catalogue, Span Chart](https://datavizcatalogue.com/methods/span_chart.html): observar a família de gráficos de intervalo a que a jornada pertence.
- Praticante: [Nightingale, Ganttsgiving](https://nightingaledvs.com/ganttsgiving-plotting-a-holiday-feast/): observar a cor por categoria de tarefa para achar ociosidade.
- Portal de design: [Behance, busca "timeline dashboard"](https://www.behance.net/search/projects/timeline%20dashboard): observar como painéis de gestão combinam lista e trilha.

---

### 3.8 Linha de estado em blocos (tracker)

**Descrição.** Sequência de blocos iguais, um por período (hora, dia), colorido pelo estado discreto naquele período. Popularizado em painéis de disponibilidade.

**Anatomia.** Fila de blocos com pequeno espaço entre eles; cor por estado (ok, atenção, falha, sem dado); tooltip por bloco; resumo textual ao lado ("27 de 30 dias dentro do SLA").

**Abordagem na stack.** `html-tailwind`. `div` flex com um `div` por bloco, `flex-1` e `h-8`, classe de cor por estado e `title` ou tooltip do Radix (já presente no projeto). O componente Tracker do Tremor segue esse desenho, com `color` e `tooltip` por item.

**Ponto delicado.** "Sem dado" precisa de estado próprio e visualmente neutro (contorno, sem preenchimento), diferente de falha. Em tela estreita, reduzir a granularidade (agregar dias em semanas) e dizer isso no rótulo, como o Tremor faz ao mostrar menos blocos no celular.

**Versões sugeridas.**
1. **Básico: SLA de primeiro contato por dia.** 30 blocos de novembro de 2026, verde para dia dentro do SLA e âmbar para fora.
2. **Com destaque: dia de pico.** Bloco do dia 2026-11-16 com contorno e anotação "entrada 3x a média".
3. **Denso e real do Farol: um tracker por fila da pré-vendas.** 4 filas empilhadas, 90 dias cada, com percentual cumprido à direita.
4. **Limite: coleta interrompida.** 5 dias sem dado de coleta desenhados como blocos vazados com legenda "sem dado", sem entrar no cálculo do percentual.

**Referências.**
- Catálogo: [Tremor, Tracker](https://tremor.so/docs/visualizations/tracker): observar o contrato `color` + `tooltip` e a redução de blocos por breakpoint.
- Catálogo: [Data Viz Catalogue, blog de combinações com calendário](http://datavizcatalogue.com/blog/chart-combinations-visualizing-data-in-calendars/): observar blocos e ícones por data como forma de estado.
- Praticante e portal: sem exemplo específico verificado nesta pesquisa.

---

### 3.9 Linha do tempo de marcos

**Descrição.** Eventos de duração zero posicionados na data exata sobre um eixo contínuo. Em gestão de projetos o marco é uma tarefa de tempo zero, tradicionalmente desenhada como losango.

**Anatomia.** Eixo de tempo horizontal; losango ou círculo por evento; rótulo curto com data; categoria por cor ou por faixa vertical; linha de hoje.

**Abordagem na stack.** `recharts-custom`. `ScatterChart` com `XAxis type="number"` de datas, `YAxis type="category"` para a faixa do evento (ou constante), `Scatter shape="diamond"` e `LabelList` com `content` customizado, no mesmo padrão do exemplo ScatterChartWithLabels.

**Ponto delicado.** Rótulos de eventos próximos colidem. Solução em TypeScript antes do render: ordenar por data, estimar largura do rótulo e alternar acima e abaixo; se ainda colidir, subir de nível (escada de 3 alturas) com linha guia fina até o ponto.

**Versões sugeridas.**
1. **Básico: marcos do plano comercial 2027.** 6 marcos (orçamento aprovado, abertura de vagas, início de campanha, revisão de meta).
2. **Com destaque: marco em risco.** Losango vazado para marco sem data confirmada e cor de alerta para marco com dependência atrasada.
3. **Denso e real do Farol: marcos por público.** 4 faixas (Comercial, Pré-vendas, Marketing, Diretoria) com 25 marcos no ano e linha de hoje.
4. **Limite: muitos marcos na mesma semana.** 7 marcos entre 2026-12-14 e 2026-12-18 agrupados num único losango com número "7" e lista no tooltip.

**Referências.**
- Catálogo: [Wikipedia, Milestone (project management)](https://en.wikipedia.org/wiki/Milestone_(project_management)): observar marco como tarefa de tempo zero e o losango como notação.
- Catálogo: [Data Viz Catalogue, Timeline](https://datavizcatalogue.com/methods/timeline.html): observar a distinção entre linha do tempo com escala e sequência sem escala.
- Stack: [Recharts, Scatter Chart With Labels](https://recharts.github.io/en-US/examples/ScatterChartWithLabels/): observar `LabelList` dentro de `Scatter`.
- Praticante: [Storytelling with Data, What is a Gantt chart](https://www.storytellingwithdata.com/blog/what-is-a-gantt-chart): observar marcos como formas distintas das barras.

---

### 3.10 Linha do tempo narrativa com rótulos alternados

**Descrição.** Poucos eventos, cada um com título e descrição curta, dispostos ao longo de uma linha com os rótulos alternando de lado. Serve para contar a história de um período.

**Anatomia.** Linha central; pontos; conectores curtos; cartões de texto alternando acima e abaixo (ou esquerda e direita na vertical); data em destaque.

**Abordagem na stack.** `svg-puro` para a linha e os pontos, com os cartões de texto em `foreignObject` ou, mais simples, `html-tailwind` inteiro com posição percentual no eixo. A série timeline do Highcharts usa `dataLabels.alternate` e aceita posição por data real ou espaçamento uniforme.

**Ponto delicado.** Decidir entre escala real e espaçamento uniforme, e deixar isso explícito: com espaçamento uniforme a distância visual não significa tempo, então as datas precisam aparecer em cada cartão e não só no eixo.

**Versões sugeridas.**
1. **Básico: o ano da pré-vendas em 8 eventos.** Espaçamento uniforme, título e uma frase por evento.
2. **Com destaque: evento que mudou a métrica.** O cartão da mudança de roteiro de abordagem ganha borda de destaque e número "taxa de agenda +40%".
3. **Denso e real do Farol: histórico de mudanças de mídia com escala real.** 12 eventos de 2026 em escala real, mostrando a concentração de mudanças no segundo semestre.
4. **Limite: dois eventos no mesmo dia.** Cartões empilhados no mesmo lado com um único ponto e contador "2 eventos em 2026-08-03".

**Referências.**
- Catálogo: [Highcharts, Timeline series](https://www.highcharts.com/docs/chart-and-series-types/timeline-series): observar `alternate` nos rótulos e a escolha entre eixo de datas e distribuição uniforme.
- Catálogo: [Data Viz Catalogue, Timeline](https://datavizcatalogue.com/methods/timeline.html): observar o uso para narrativa histórica.
- Praticante: [Datawrapper Academy, How to create text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar âncoras de expansão e a troca das anotações por chaves numeradas no celular.
- Portal de design: [Information is Beautiful Awards, showcase "timeline"](https://www.informationisbeautifulawards.com/showcase?query=timeline): observar peças editoriais de linha do tempo; destaque para "Five droughts that changed history" ([link do projeto](https://labs.waterdata.usgs.gov/visualizations/drought-timeline/index.html#/), não abriu).

---

### 3.11 Linha do tempo vertical em cartões (feed)

**Descrição.** Lista cronológica vertical com um trilho à esquerda, um marcador por item e um cartão com o conteúdo. É o histórico de uma entidade: tudo o que aconteceu com uma oportunidade ou uma conta.

**Anatomia.** Trilho `border-left`; marcador circular com ícone por tipo de evento; data relativa e absoluta; cartão com título, autor fictício e detalhe; cabeçalho de agrupamento por dia.

**Abordagem na stack.** `html-tailwind`. `ol` com `border-s`, cada `li` com `ms-4` e o marcador `absolute`, exatamente a estrutura documentada pelo Flowbite; ícones do lucide-react (`Phone`, `Mail`, `CalendarCheck`, `ArrowRightLeft`).

**Ponto delicado.** Virtualização para históricos longos: `@tanstack/react-virtual` já está no projeto, mas cabeçalhos de dia com altura diferente exigem `estimateSize` por tipo de item. Fuso e data relativa ("há 3 dias") precisam do mesmo "agora" em toda a lista.

**Versões sugeridas.**
1. **Básico: histórico de uma oportunidade.** 10 eventos (criação, ligação, reunião, proposta).
2. **Com destaque: eventos de handoff.** Mudança de dono marcada com ícone e cor próprios e o tempo de espera entre os dois donos em texto.
3. **Denso e real do Farol: log de atividades da pré-vendas agrupado por dia.** 200 eventos fictícios de uma semana, agrupados por dia, com filtros por tipo.
4. **Limite: evento sem data e texto enorme.** Evento importado sem data vai para o fim com rótulo "data desconhecida"; anotação de 3.000 caracteres truncada com "ver mais".

**Referências.**
- Catálogo: [Flowbite, Timeline](https://flowbite.com/docs/components/timeline/): observar as variantes com ícones, log de atividades e agrupada por data, todas com `border-s` e marcador absoluto.
- Catálogo: [Data Viz Catalogue, Timeline](https://datavizcatalogue.com/methods/timeline.html): observar a orientação vertical como variante legítima.
- Portal de design: [Behance, busca "timeline dashboard"](https://www.behance.net/search/projects/timeline%20dashboard): observar feeds de atividade em painéis de CRM e gestão.

---

### 3.12 Stepper de etapas

**Descrição.** Sequência horizontal de passos com estado (concluído, atual, futuro, bloqueado), sem escala de tempo. Responde "em que ponto do processo esta coisa está".

**Anatomia.** Círculos numerados ou com ícone; conector entre passos preenchido até o atual; rótulo e data de conclusão abaixo de cada passo.

**Abordagem na stack.** `html-tailwind`. `ol` com `flex items-center`, conector `h-px flex-1` e marcador com classes por estado; ícone `Check` para concluído. Vertical no celular.

**Ponto delicado.** Três estados precisam ser distinguíveis sem cor: concluído com ícone de check, atual com anel e texto em peso maior, futuro vazado. Etapa pulada não pode parecer concluída.

**Versões sugeridas.**
1. **Básico: etapas do handoff.** Lead qualificado, reunião agendada, reunião realizada, oportunidade aceita pelo executivo.
2. **Com destaque: tempo entre passos.** Rótulo "4 d" sobre cada conector e alerta no conector que passou do SLA.
3. **Denso e real do Farol: stepper em cada linha de uma tabela.** Coluna de etapa numa tabela de 50 oportunidades, versão compacta só com marcadores.
4. **Limite: etapa pulada e retorno.** Oportunidade que pulou o diagnóstico (marcador tracejado "pulada") e que voltou de proposta para qualificação (seta de retorno).

**Referências.**
- Catálogo: [Flowbite, Timeline (variante stepper horizontal)](https://flowbite.com/docs/components/timeline/): observar conectores `h-px` e responsividade `sm:flex`.
- Catálogo: [Wikipedia, Milestone (project management)](https://en.wikipedia.org/wiki/Milestone_(project_management)): observar marcos como pontos de controle do processo.
- Portal de design: sem exemplo específico verificado nesta pesquisa.

---

### 3.13 Faixas e marcos sobre série temporal

**Descrição.** Uma série quantitativa (CPL, agendas por dia) com períodos sombreados e linhas verticais que marcam eventos. Liga a linha do tempo de eventos à métrica. O Storytelling with Data mostra um Gantt combinado com linha para relacionar mudanças de sistema com satisfação.

**Anatomia.** Linha ou área da métrica; faixas verticais translúcidas para períodos; linhas verticais tracejadas para eventos pontuais; rótulos curtos no topo; opcionalmente uma mini trilha de Gantt abaixo do eixo X, sincronizada.

**Abordagem na stack.** `recharts-nativo`. `ComposedChart` ou `LineChart` com `ReferenceArea x1 x2` para períodos e `ReferenceLine x` com `label` para eventos. A trilha de Gantt sincronizada é um segundo `BarChart layout="vertical"` com o mesmo `domain` e `syncId`, como no exemplo Synchronized Line Chart.

**Ponto delicado.** Com eixo X categórico (datas como texto), `ReferenceArea` precisa de valores que existam no domínio; prefira eixo numérico de datas. Faixas sobrepostas somam opacidade: limite a 0,12 e use contorno superior colorido em vez de preenchimento forte. Mantenha a série acima das faixas com `ZIndexLayer` ou ordem dos filhos.

**Versões sugeridas.**
1. **Básico: CPL diário com flights de campanha.** Linha de CPL em 2026 e 3 faixas de campanha.
2. **Com destaque: evento explicativo.** Linha vertical em 2026-06-12 "nova fonte de mídia ativada", com anotação do salto no volume.
3. **Denso e real do Farol: métrica mais trilha de Gantt sincronizada.** Agendas por dia em cima, trilha de campanhas por plataforma embaixo, com cursor sincronizado.
4. **Limite: eventos demais.** 40 eventos no ano: mostrar só os marcados como relevantes e resumir os demais como tiques de 4 px no eixo, com lista completa no tooltip.

**Referências.**
- Stack: [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar Line Chart With Reference Lines, Banded Chart e Synchronized Line Chart.
- Stack: [Recharts API](https://recharts.github.io/en-US/api/): observar `ReferenceArea`, `ReferenceLine` e `ZIndexLayer`.
- Praticante: [Storytelling with Data, What is a Gantt chart](https://www.storytellingwithdata.com/blog/what-is-a-gantt-chart): observar o exemplo de Gantt combinado com linha.
- Praticante: [Datawrapper Academy, How to create text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar anotações em gráfico de linha e o comportamento no celular.

---

### 3.14 Calendário de marcos

**Descrição.** Grade de calendário (7 colunas por semana) com eventos, prazos e períodos dentro das células. Referência de consulta, não de comparação quantitativa. O mapa de calor em calendário, que codifica valor por cor, mora na família 15.

**Anatomia.** Cabeçalho de dias da semana; células de dia com número; chips de evento; barras que atravessam dias para períodos; marcação de hoje, fim de semana e feriado fictício.

**Abordagem na stack.** `html-tailwind`. `grid grid-cols-7`, geração das semanas do mês em TypeScript (primeiro dia, deslocamento pelo dia da semana, preenchimento de dias do mês anterior). Períodos multidia como `div` com `grid-column: span N` numa camada sobreposta por semana.

**Ponto delicado.** Semana começando na segunda ou no domingo tem de ser configuração explícita. Períodos que atravessam a quebra de semana são divididos em segmentos por semana, com cantos arredondados só nas pontas reais. Muitos eventos numa célula: mostrar 2 e "+3".

**Versões sugeridas.**
1. **Básico: prazos do mês de dezembro de 2026.** Entregas de relatório, fechamento de mês, revisão de forecast.
2. **Com destaque: janela de leitura.** Período 2026-12-14 a 2027-01-13 atravessando semanas com rótulo "janela de leitura conclusiva".
3. **Denso e real do Farol: visão anual de marcos.** 12 mini meses em grade 4 x 3, só com pontos nos dias com marco, e clique abrindo o mês.
4. **Limite: dia lotado e mês sem eventos.** Dia com 9 eventos resumido em "+7"; mês vazio exibe mensagem em vez de grade vazia sem explicação.

**Referências.**
- Catálogo: [Data Viz Catalogue, Calendar](https://datavizcatalogue.com/methods/calendar.html): observar a grade de 7 colunas e o parentesco com timetable.
- Catálogo: [Data Viz Catalogue, blog de combinações com calendário](http://datavizcatalogue.com/blog/chart-combinations-visualizing-data-in-calendars/): observar barras horizontais atravessando dias para duração.
- Catálogo: [nivo, Calendar](https://nivo.rocks/calendar/): observar a organização anos, meses, dias e a cor de vazio (só como referência de forma).
- Portal de design: [Behance, Task and Project Management Web Design](https://www.behance.net/gallery/161886233/Task-and-Project-Management-Web-Design): observar a visão de calendário para "big picture" das tarefas.

---

### 3.15 Agenda em grade (timetable)

**Descrição.** Grade de horário por colunas (dias ou pessoas) com blocos posicionados pelo início e pela duração. É a leitura de agenda de reuniões.

**Anatomia.** Coluna de horas; colunas de dia ou pessoa; blocos com título e horário; linha de agora; faixas indisponíveis.

**Abordagem na stack.** `html-tailwind`. Coluna com `relative` e altura fixa por hora; bloco `absolute` com `top = (inicioMin - abertura) * pxPorMin` e `height = duracaoMin * pxPorMin`. Sobreposição resolvida por colunas internas (algoritmo de empacotamento do modelo 5) com `left` e `width` em porcentagem.

**Ponto delicado.** Blocos muito curtos (15 minutos) não comportam texto: altura mínima visual com rótulo no tooltip. Horário de verão e fuso: armazenar em UTC e renderizar num único fuso configurado.

**Versões sugeridas.**
1. **Básico: agenda de um SDR na semana.**
2. **Com destaque: capacidade livre.** Faixas vazias entre 9h e 18h pintadas em verde claro com total "6 h livres".
3. **Denso e real do Farol: 5 SDRs lado a lado num dia.** Colunas por pessoa com cor por tipo (reunião de qualificação, retorno, interno).
4. **Limite: conflito e evento fora do expediente.** Três reuniões sobrepostas em colunas internas e reunião às 20h ampliando a grade só naquele dia com aviso.

**Referências.**
- Catálogo: [Data Viz Catalogue, Timetable](https://datavizcatalogue.com/methods/timetable.html): observar a função de referência para eventos agendados.
- Portal de design: [Behance, Task and Project Management Web Design](https://www.behance.net/gallery/161886233/Task-and-Project-Management-Web-Design): observar a visão diária de tarefas.

---

### 3.16 Linha do tempo de círculos (circle timeline)

**Descrição.** Eventos sobre o eixo do tempo, uma faixa por categoria, com círculo de área proporcional à magnitude. O FT descreve como boa para valores discretos de tamanhos variados em várias categorias.

**Anatomia.** Eixo de tempo; faixas por categoria; círculos translúcidos; legenda de tamanho.

**Abordagem na stack.** `recharts-nativo`. `ScatterChart` com `XAxis` de datas, `YAxis type="category"` para a categoria e `ZAxis dataKey="valor" range={[areaMin, areaMax]}`, o mesmo mecanismo do exemplo BubbleChart. O `size` dos símbolos do Recharts é área, então valor proporcional à área exige `ZAxis domain={[0, max]}`.

**Ponto delicado.** Sem `domain` explícito começando em zero, o menor valor vira o menor círculo e a proporção se perde. Círculos grandes escondem vizinhos: opacidade 0,6 e ordenar do maior para o menor na renderização.

**Versões sugeridas.**
1. **Básico: fechamentos por semana por executivo.** Um círculo por fechamento fictício, área = valor.
2. **Com destaque: maior fechamento do trimestre.** Rótulo "R$ 1,2 mi" no maior círculo.
3. **Denso e real do Farol: receita reconhecida por produto por mês.** 4 faixas de produto, 24 meses.
4. **Limite: valores negativos (estornos).** Estorno desenhado como círculo vazado com a mesma área do valor absoluto e legenda "estorno", nunca com área negativa.

**Referências.**
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a definição de circle timeline e de seismogram como alternativa.
- Stack: [Recharts, BubbleChart](https://recharts.github.io/en-US/examples/BubbleChart/): observar `ZAxis range` e várias linhas empilhadas como faixas.
- Praticante: [Datawrapper Academy, How to show negative values in symbol maps](https://www.datawrapper.de/academy/how-to-show-negative-values-in-symbol-maps): observar a regra "círculo só tem raio positivo", que vale aqui também.

---

### 3.17 Diagrama de Marey (progressão por etapas)

**Descrição.** Eixo X de tempo e eixo Y com etapas ordenadas; cada entidade é uma linha que sobe de etapa em etapa. Inclinação forte = passagem rápida; trecho horizontal = parada. Tem origem nos horários ferroviários.

**Anatomia.** Etapas no eixo Y em ordem de funil; uma polilinha por oportunidade; cor por desfecho; linha de hoje.

**Abordagem na stack.** `recharts-nativo`. `LineChart` com `YAxis type="number"` (índice da etapa) e `tickFormatter` que devolve o nome da etapa; um `Line type="stepAfter"` por entidade com `data` própria, ou `svg-puro` quando passar de umas 40 linhas.

**Ponto delicado.** Um `Line` por entidade escala mal no Recharts (cada série é um componente). Acima de 40 entidades, desenhar todas como um único `path` em `svg-puro`. Retornos de etapa geram linha descendente e precisam ser permitidos no dado.

**Versões sugeridas.**
1. **Básico: 10 oportunidades do trimestre.**
2. **Com destaque: a mais rápida e a mais lenta.** Duas linhas coloridas e o resto em cinza.
3. **Denso e real do Farol: coorte de outubro de 2026.** 80 oportunidades em `svg-puro`, cor por desfecho.
4. **Limite: entidade que volta de etapa.** Linha descendente com marcador de retorno.

**Referências.** Nenhuma referência específica foi aberta nesta pesquisa (lacuna registrada). Base conceitual: [Data Viz Catalogue, Timetable](https://datavizcatalogue.com/methods/timetable.html), pelo parentesco com horários de transporte.

---

### 3.18 Roadmap por horizonte (agora, próximo, depois)

**Descrição.** Colunas de horizonte sem datas firmes, com cartões de iniciativa. Comunica prioridade e sequência sem prometer calendário.

**Anatomia.** Três ou quatro colunas (agora, próximo, depois, descartado); cartões com título, público e grau de confiança; faixas horizontais opcionais por público.

**Abordagem na stack.** `html-tailwind`. `grid grid-cols-3` com linhas por público; cartões com borda colorida pelo público e selo de confiança.

**Ponto delicado.** Deixar explícito, no título, que não há escala de tempo. Quando uma iniciativa ganha data, ela sai daqui e vai para o Gantt (modelo 1); manter as duas visões ligadas pelo mesmo id.

**Versões sugeridas.**
1. **Básico: roadmap de dashboards do Farol.**
2. **Com destaque: confiança.** Selo alta, média, baixa em cada cartão.
3. **Denso e real do Farol: roadmap por público.** 4 faixas x 3 horizontes, 24 iniciativas fictícias.
4. **Limite: horizonte vazio.** Coluna "depois" vazia com texto "sem iniciativa priorizada", sem colapsar a grade.

**Referências.** Nenhuma referência específica foi aberta nesta pesquisa (lacuna registrada).

---

### 3.19 Linha do tempo radial ou espiral

**Descrição.** O tempo enrolado em círculo (24 horas, 12 meses) ou em espiral (vários ciclos). Evidencia periodicidade, mas prejudica comparação de comprimento.

**Anatomia.** Ângulo = posição no ciclo; raio = ciclo (na espiral) ou categoria; arcos para períodos e pontos para eventos.

**Abordagem na stack.** `svg-puro`. Ângulo `θ = 2π (t - t0) / periodo`, arcos com o comando `A` do path. O Recharts tem `RadialBarChart`, mas ele é para barras radiais de valor, não para intervalos de tempo arbitrários.

**Ponto delicado.** Arcos em raios diferentes com o mesmo ângulo têm comprimentos diferentes; nunca pedir ao leitor que compare duração por comprimento de arco.

**Versões sugeridas.**
1. **Básico: relógio de horários de entrada de leads.**
2. **Com destaque: janela de atendimento.** Arco sombreando 9h a 18h.
3. **Limite: espiral de 3 anos por mês.** Só como peça editorial, com alternativa em tabela ao lado.

**Referências.**
- Catálogo: [Data Viz Catalogue, blog de combinações com calendário](http://datavizcatalogue.com/blog/chart-combinations-visualizing-data-in-calendars/): observar calendários em espiral arquimediana.

---

## 4. Modelos que moram melhor em outra família

| Modelo | Família certa | Motivo |
|---|---|---|
| Mapa de calor em calendário | 15_mapa-de-calor-e-calendario | O valor é codificado por cor em cada dia; não é marco nem intervalo |
| Sismograma (linhas verticais de altura variável no tempo) | 03_colunas-verticais | É coluna fina; o FT o lista como alternativa ao circle timeline |
| Burn-down e burn-up | 04_linhas | Medida contínua ao longo do tempo |
| Faixa de valores planejado versus realizado por categoria (dumbbell) | 17_comparacao-de-pontos | Compara dois valores, não um intervalo temporal |
| Contagem regressiva para prazo | 01_cards-e-kpis | Um número só |
| Carga por pessoa por dia (sobrealocação) | 15_mapa-de-calor-e-calendario | Grade pessoa x dia com intensidade |

---

## 5. Notas transversais de implementação

1. **Datas.** Entrada sempre `YYYY-MM-DD`; converter com `Date.UTC`; renderizar com um formatador único. Ticks de calendário gerados em TypeScript, nunca deixados ao eixo numérico.
2. **Escala própria em SVG puro.** Uma função `escalaTempo(t0, t1, largura)` e uma `escalaBanda(n, altura, padding)` resolvem os modelos 3, 5, 6, 17 e 19 sem biblioteca.
3. **Recharts 3.10.1.** Barra em tupla `[inicio, fim]` resolve Gantt e jornada; `BarStack` agrupa; `useXAxisScale` e `useYAxisScale` (desde a 3.8) permitem desenhar sobreposições dentro do gráfico; `ZIndexLayer` controla a ordem de pintura.
4. **Tema escuro.** Linha de hoje e marcos precisam de contraste contra o fundo escuro; faixas sombreadas com opacidade baixa e contorno, porque preenchimento claro em fundo escuro domina a leitura.
5. **Dado ausente.** Período sem fim desenha até hoje com ponta aberta; período sem início sai do gráfico para uma lista; bloco sem dado tem estado próprio.

---

## 6. Fontes consultadas

Abertas com conteúdo:
- https://datavizcatalogue.com/methods/gantt_chart.html
- https://datavizcatalogue.com/methods/timeline.html
- https://datavizcatalogue.com/methods/span_chart.html
- https://datavizcatalogue.com/methods/calendar.html
- https://datavizcatalogue.com/methods/timetable.html
- http://datavizcatalogue.com/blog/chart-combinations-visualizing-data-in-calendars/
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md
- https://vega.github.io/vega-lite/examples/bar_gantt.html
- https://recharts.github.io/en-US/examples/
- https://recharts.github.io/en-US/examples/TimelineExample/
- https://recharts.github.io/en-US/examples/BarChartRangeExample/
- https://recharts.github.io/en-US/examples/RangedStackedBarChart/
- https://recharts.github.io/en-US/examples/ScatterChartWithLabels/
- https://recharts.github.io/en-US/examples/BubbleChart/
- https://recharts.github.io/en-US/api/
- https://www.highcharts.com/docs/chart-and-series-types/x-range-series
- https://www.highcharts.com/docs/chart-and-series-types/timeline-series
- https://www.highcharts.com/docs/gantt/getting-started-gantt
- https://www.ag-grid.com/charts/react/range-bar-series/
- https://www.ag-grid.com/charts/gallery/
- https://nivo.rocks/calendar/
- https://tremor.so/docs/visualizations/tracker
- https://ui.shadcn.com/charts (sem modelos de cronograma; confirma a lacuna nas galerias baseadas em Recharts)
- https://flowbite.com/docs/components/timeline/
- https://www.storytellingwithdata.com/chart-guide
- https://www.storytellingwithdata.com/blog/what-is-a-gantt-chart
- https://www.datawrapper.de/academy/how-to-create-text-annotations
- https://www.datawrapper.de/academy/how-to-show-negative-values-in-symbol-maps
- https://en.wikipedia.org/wiki/Gantt_chart
- https://en.wikipedia.org/wiki/Swim_lane
- https://en.wikipedia.org/wiki/Milestone_(project_management)
- https://nightingaledvs.com/ganttsgiving-plotting-a-holiday-feast/
- https://www.informationisbeautifulawards.com/showcase?query=timeline
- https://www.behance.net/search/projects/gantt%20chart
- https://www.behance.net/search/projects/timeline%20dashboard
- https://www.behance.net/gallery/181443889/Dasboard-Gantt-Chart-UI-kit-Components-UX
- https://www.behance.net/gallery/109367269/Gantt-Chart-Project-Timeline
- https://www.behance.net/gallery/247578277/Repair-Planning-Dashboard
- https://www.behance.net/gallery/161886233/Task-and-Project-Management-Web-Design

Apareceram em página de busca, sem abrir:
- https://labs.waterdata.usgs.gov/visualizations/drought-timeline/index.html#/ (não abriu)

Tentadas sem sucesso, por isso sem link: Data Viz Project (403), FlowingData (403), Dribbble e Figma Community (página vazia ou 403), Observable Plot (429), demos do Highcharts e editor do ECharts (só navegação, sem o exemplo), fórum de Edward Tufte sobre gráficos de gestão de projetos (redirecionou para índice sem o texto).
