# 11_fluxo-sankey: sankey, alluvial, parallel sets e chord de fluxo

> Estudo da família para o catálogo VISUAIS do Farol. Pesquisa feita em 2026-09-14.
> Casos de uso com dados 100% fictícios, sem marca real e sem dado pessoal.
> Stack conferida no `app/`: React 18.3.1, TypeScript 5.9 strict, Recharts 3.10.1 (tipagem de `Sankey` lida em `app/node_modules/recharts/types/chart/Sankey.d.ts`), Tailwind 4.3, lucide-react.
> Tokens de cor do Farol: `--chart-1..8`, `--seq-1..7`, `--positive`, `--negative`, `--accent-cyan`, `--accent-amber`, `--surface-*`, `--text-*`, `--border`.

---

## 1. O que a família responde

Para onde vai o volume: de onde vem, por onde passa, onde sai e em que proporção. A diferença para o funil (família 10) é que aqui o caminho ramifica, funde e tem várias saídas. Dentro da família há duas leituras que o Datawrapper separa bem:

- **Sankey**: volume que flui (leads, reais, horas) entre nós, com largura proporcional à quantidade.
- **Alluvial e parallel sets**: as mesmas unidades mudando de categoria entre momentos ou cruzando dimensões; o que importa é a correspondência, não a direção física do fluxo.
- **Chord de fluxo**: trocas nos dois sentidos entre entidades que não têm coluna de origem e de destino.

### Perguntas típicas no Farol

- **Marketing**: os leads de cada plataforma terminam em qual desfecho (qualificado, em nutrição, descartado, sem contato)?
- **Pré-vendas**: de cada origem, quanto vira agenda realizada e para qual executivo vai o handoff?
- **Comercial**: da oportunidade aberta ao ganho, onde saem as perdas e por qual motivo; quantas reabriram?
- **Diretoria**: como o custo do trimestre em três camadas (mídia, pessoas da esteira, estrutura) se distribui por canal até o custo por ganho; como a receita reconhecida se reparte por produto e origem do cliente.
- **Marketing e Comercial**: quantos leads esfriaram ou esquentaram de um mês para o outro (alluvial).

### Regras transversais da família

- Uma unidade só por diagrama (contagem ou reais), escrita no título.
- Conservação: o que entra num nó sai dele. Diferença vira nó explícito ("em andamento", "sem desfecho"), nunca some.
- Sem ciclos no dado de um sankey (ver 11.6).
- Fluxos minúsculos agregados em "Outros"; abaixo de 1 px a ligação não é vista.
- Hover que acende a adjacência e apaga o resto é quase obrigatório acima de 15 ligações.
- Alternativa tabular (origem, destino, valor, % da origem) no menu do visual.
- Em 400 px, sankey horizontal com mais de 3 colunas não cabe: trocar para 11.3 (vertical) ou para barras da família 10.

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 11.1 | Sankey simples (duas colunas) | Origem para desfecho, handoff de uma equipe para outra | Mais de 8 nós por coluna sem agrupamento | Cores padrão da biblioteca que somem no tema escuro |
| 11.2 | Sankey multietapa com perdas | Funil com ramificação e perdas por motivo em cada etapa | Retrato de pipeline sem nó de "em andamento" | `align` padrão empurrando toda perda para a última coluna |
| 11.3 | Sankey vertical | Celular, colunas estreitas de painel | Nomes longos em muitos nós por nível | Girar o SVG com transform e girar junto texto e tooltip |
| 11.4 | Sankey de custo ou receita | Demonstrativo: fontes, total, destinos | Resultado negativo tratado como fluxo | Somar camadas de custo com leituras de retorno diferentes |
| 11.5 | Sankey de caminhos (jornada multitoque) | Sequência de pontos de contato até o desfecho | Jornadas com dezenas de passos | Não desenrolar por passo e criar laço com canal repetido |
| 11.6 | Fluxo com retorno (sankey com laço) | Reaberturas e retornos que o negócio precisa ver | Quando desenrolar resolve | Mandar ciclo para uma biblioteca que quebra ou apaga a ligação |
| 11.7 | Alluvial | Mesmas unidades mudando de categoria no tempo | População que muda entre colunas sem categoria de entrada e saída | Ordem de categorias diferente em cada coluna |
| 11.8 | Parallel sets | Cruzar 3 ou 4 atributos categóricos da mesma população | Mais de 4 eixos ou 5 categorias por eixo | Ler correlação entre eixos que não são vizinhos |
| 11.9 | Chord direcional de fluxo (dependency wheel) | Trocas nos dois sentidos entre até 8 entidades | Quando existe origem e destino claros (usar sankey) | Sem marca de sentido e sem interação de foco |

---

## 3. Modelos

### 11.1 Sankey simples (duas colunas)

**Descrição.** Nós em duas colunas ligados por faixas com largura proporcional ao volume. É a forma mais legível da família e cobre boa parte das perguntas de origem para desfecho.

**Anatomia.** Nó (retângulo) com rótulo e valor; ligação com largura proporcional; percentual da origem no tooltip da ligação; cor por origem; margem reservada para rótulos.

**Abordagem na stack.** `recharts-nativo` com ajuste de rótulo. `Sankey data={{ nodes, links }} nodeWidth={12} nodePadding={16} linkCurvature={0.5} margin={{ top: 8, right: 140, bottom: 8, left: 140 }}` com `Tooltip`. O rótulo do nó vem por `node={NoComRotulo}`, como fazem os exemplos oficiais.

**Ponto delicado.**
- `links` referenciam nós por **índice** no array `nodes`, não por nome. Montar o dado a partir de um dicionário nome para índice e validar que todo índice existe.
- Padrões conferidos na tipagem 3.10.1: `align="justify"`, `sort={true}`, `iterations={32}`, `nodeWidth={10}`, `nodePadding={10}`, `linkCurvature={0.5}`, `margin` de 5 px. Com margem de 5 px os rótulos cortam.
- O build tem cores internas fixas (`#333` e `#0088fe` em `es6/chart/Sankey.js`), que não servem no tema escuro. Passar `node` e `link` sempre.
- Interação: `onMouseEnter(item, type)` informa se o alvo é `'node'` ou `'link'`; guardar o índice em estado e reduzir a opacidade das ligações não adjacentes.

**Versões sugeridas.**
1. **Básico.** Marketing, 2026-08: Mídia social, Busca paga, Rede profissional, Orgânico e Evento à esquerda; Qualificado, Em nutrição, Descartado e Sem contato à direita; 1.240 leads.
2. **Com destaque.** Hover em "Busca paga" deixa só as ligações dela em opacidade cheia e as demais a 15%; o tooltip mostra "Busca paga para Qualificado: 112 (31% da origem)".
3. **Caso denso e real.** Handoff de Pré-vendas: SDR 1 a SDR 5 à esquerda, Executivo A a H à direita, 40 ligações; ligações com menos de 3 agendas agregadas em "Outros executivos".
4. **Caso limite: origem ausente.** 174 leads sem origem entram como nó neutro "Sem origem registrada" no topo da coluna, com rótulo de cobertura (86% com origem).

**Referências.**
- Catálogo: [From Data to Viz, Sankey](https://www.data-to-viz.com/graph/sankey.html): posição dos nós para reduzir cruzamentos e remoção de ligações fracas.
- Catálogo: [Data Visualisation Catalogue, Sankey Diagram](https://datavizcatalogue.com/methods/sankey_diagram.html): espessura como magnitude e cor para categorias ou transição de estado.
- Catálogo: [Recharts, API Sankey](https://recharts.github.io/en-US/api/Sankey/): `nodePadding`, `nodeWidth`, `linkCurvature`, `sort`, `align`, `verticalAlign`.
- Catálogo: [Recharts, exemplo de Sankey](https://recharts-recharts.mintlify.app/examples/sankey): formato por índice e nó customizado com cor por `payload.depth`.
- Catálogo: [Highcharts, Sankey diagram (docs)](https://www.highcharts.com/docs/chart-and-series-types/sankey-diagram): formato `from`, `to`, `weight`.
- Catálogo: [Data Viz Project, Sankey Diagram](https://datavizproject.com/data-type/sankey-diagram/) (não abriu).
- Praticante: [Nightingale, Endless River: An Overview of Dataviz for Categorical Data](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): no máximo 5 ou 6 cores primárias, tons para subcategorias.
- Praticante: [Edward Tufte, Napoleon's March](https://www.edwardtufte.com/product/napoleons-march/): a espessura da faixa como tamanho em cada ponto do caminho.
- Portal de design: [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options): sankey escolhido sobre chord por legibilidade num dado de dois níveis.

---

### 11.2 Sankey multietapa com perdas

**Descrição.** Fluxo por várias colunas de etapa; a saída de cada etapa divide entre avançar e nós terminais de perda (por motivo), posicionados logo depois da etapa onde a perda acontece.

**Anatomia.** Colunas de etapa; nós de perda terminais em cor neutra ou `--negative` dessaturado; caminho principal destacado; nó "em andamento" para fechar a conta; rótulos com valor e percentual da entrada.

**Abordagem na stack.** `recharts-custom`. `Sankey align="left" sort={false} node={NoEtapa} link={LigacaoColorida}`. A ligação customizada recebe `sourceX, sourceY, sourceControlX, targetControlX, targetX, targetY, linkWidth` e `payload.source` e `payload.target` como `SankeyNode`; o caminho é `M sx,sy C scx,sy tcx,ty tx,ty` com `strokeWidth={linkWidth}` e `fill="none"`.

**Ponto delicado.**
- Com `align="justify"` (padrão), todo nó sem saída é empurrado para a última coluna e a perda da primeira etapa aparece ao lado dos ganhos. `align="left"` mantém o nó de perda na profundidade seguinte à etapa de origem.
- `sort={false}` respeita a ordem de entrada dos nós ("avançou" antes das perdas); conferir no protótipo se as iterações de relaxamento ainda deslocam nós verticalmente e, se deslocarem, ordenar o array na ordem desejada.
- Conservação: o valor do nó é o maior entre entrada e saída. Se as saídas somam menos que a entrada, a diferença some sem aviso. Criar o nó "Em andamento".
- Ciclos: o nivo avisa que dado cíclico quebra o gráfico e o AG Charts remove as ligações que fecham laço; a documentação do Recharts não trata do caso. Rodar uma busca em profundidade no preparo e desenrolar (11.6).
- Rótulo do nó à direita, exceto na última profundidade (à esquerda); `payload.depth` está disponível no `SankeyNode` junto de `value`, `sourceLinks` e `targetLinks`.

**Versões sugeridas.**
1. **Básico.** Comercial 2026-T3: Aberta 420, Diagnóstico 268, Proposta 131, Negociação 64, Ganha 29, com "Perdida: sem perfil", "Perdida: timing", "Perdida: concorrência" e "Em andamento" saindo de cada etapa.
2. **Com destaque.** Caminho até "Ganha" em `--accent-cyan`, perdas em `--text-muted` a 35%, e anotação na maior saída.
3. **Caso denso e real.** Pré-vendas: seis origens na primeira coluna, cinco etapas e perdas por motivo, cerca de 30 nós, com o alternador "apenas clientes novos" recalculando.
4. **Caso limite: contato futuro.** Oportunidades marcadas como "contato futuro" contam como saída no período e recebem ícone de retorno (`RotateCcw` do lucide) no nó, sem ligação de volta.

**Referências.**
- Catálogo: [From Data to Viz, Sankey](https://www.data-to-viz.com/graph/sankey.html): o uso "da origem ao fim" com passos intermediários.
- Catálogo: [nivo, Sankey](https://nivo.rocks/sankey/): o aviso explícito de que dependências cíclicas quebram o gráfico; `align`, `sort` e `enableLinkGradient`.
- Catálogo: [AG Charts, Sankey Series](https://www.ag-grid.com/charts/javascript/sankey-series/): laços removidos; alinhamentos justify, left, right, center.
- Catálogo: [Apache ECharts, Sankey with Levels Setting](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sankey-levels.ts): cor por profundidade e `emphasis.focus: 'adjacency'`.
- Praticante: [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): sankey para acompanhar perdas e ineficiências em várias etapas.
- Portal de design: [Behance, Flow Analysis tool for CI platform](https://www.behance.net/gallery/108555313/Flow-Analysis-tool-for-CI-platform): sankey interativo usado para montar funis sem conhecimento de análise.
- Portal de design: [Behance, Central College Sankey Major to Job](https://www.behance.net/gallery/219066133/Central-College-Sankey-Major-to-Job-Correlation-Diagram): composição multietapa (a página não descreve o visual em texto).

---

### 11.3 Sankey vertical

**Descrição.** O mesmo sankey com as etapas de cima para baixo. Cabe na largura do celular e em colunas estreitas de painel.

**Anatomia.** Níveis horizontais; nós lado a lado com largura proporcional; ligações verticais; rótulo acima do nó; legenda embaixo.

**Abordagem na stack.** `svg-puro`. O `Sankey` do Recharts 3.10.1 não expõe orientação (a tipagem só tem `align` e `verticalAlign`), e girar o `svg` com `transform` gira também texto e tooltip. Layout próprio em TypeScript: profundidade vira `y`; dentro da profundidade, nós em sequência com largura `valor / totalNivel * larguraUtil` e espaçamento fixo; ligação como Bézier vertical `M x0,y0 C x0,ym x1,ym x1,y1` desenhada como faixa (dois contornos) ou como traço grosso.

**Ponto delicado.**
- Sem relaxamento, a ordem dos nós em cada nível é a ordem de entrada; ordenar pela ordem do nível anterior para reduzir cruzamentos.
- Os deslocamentos das ligações dentro de cada nó precisam seguir a ordem horizontal dos destinos, senão as faixas se cruzam logo na saída.
- Rótulo acima do nó trunca em cerca de 12 caracteres; nome completo em `<title>` e no tooltip.

**Versões sugeridas.**
1. **Básico.** Pré-vendas no celular (400 px): Entradas 1.180, Conexão 612, Agenda marcada 248, Agenda realizada 187, Handoff aceito 142, com perdas à direita de cada nível.
2. **Com destaque.** Ramo "Handoff aceito" em `--accent-cyan` e o resto a 30%.
3. **Caso limite: muitos destinos.** Nove motivos de perda num nível em 400 px: top 4 e "Outros motivos", com a lista completa no tooltip.

**Referências.**
- Catálogo: [Apache ECharts, Sankey Orient Vertical](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sankey-vertical.ts): `orient: 'vertical'` e rótulo no topo.
- Catálogo: [nivo, Sankey](https://nivo.rocks/sankey/): `layout` horizontal ou vertical como opção de primeira classe.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 11.4 Sankey de custo ou receita

**Descrição.** Demonstrativo em fluxo: valores entram por fontes, convergem num total e saem por destinos (camadas, canais, resultado).

**Anatomia.** Fontes; nó de total; destinos; rótulo com reais e percentual do total; cor semântica (custo, receita, resultado); nota da camada de custo em cada nó.

**Abordagem na stack.** `recharts-custom`. `Sankey sort={false} align="justify"` com nós de total no meio, `node={NoMonetario}` que escreve "R$ 610 mil · 33%", `link` com cor da fonte.

**Ponto delicado.**
- Largura não codifica negativo. Prejuízo não é fluxo: modelar como nó "Déficit coberto" entrando pelo lado das fontes, com rótulo explícito.
- Uma unidade por diagrama (reais, na mesma escala de milhar); contagem e dinheiro não se misturam.
- As três camadas de custo têm retornos diferentes; o mesmo cenário muda de leitura conforme a camada. Rotular a camada em cada nó e não somar camadas sem avisar.

**Versões sugeridas.**
1. **Básico.** Diretoria, custo de 2026-T3 de R$ 1,86 mi: Camada 1 mídia R$ 420 mil, Camada 2 pessoas da esteira R$ 610 mil, Camada 3 estrutura R$ 830 mil, distribuídos por canal (Mídia social, Busca paga, Rede profissional, Evento, Indicação).
2. **Com destaque.** Alternador de camadas: com só a Camada 1 ligada, o custo por ganho de cada canal aparece no nó final.
3. **Caso denso e real.** Receita reconhecida de R$ 4,6 mi por produto (Gestão patrimonial, Crédito estruturado, Consultoria, Imobiliário), depois por origem do cliente (novo, ativo), depois por executivo.
4. **Caso limite: custo sem retorno.** Canal com custo e nenhum ganho atribuído: a ligação termina no nó neutro "Sem retorno atribuído", em vez de desaparecer.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, Sankey Diagram](https://datavizcatalogue.com/methods/sankey_diagram.html): transferência de energia, dinheiro e materiais.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): sankey na categoria fluxo, ao lado da cascata.
- Praticante: [Edward Tufte, Napoleon's March](https://www.edwardtufte.com/product/napoleons-march/): perda ao longo do caminho codificada na largura.
- Portal de design: [Behance, Indian Budget: How the Rupee Flows](https://www.behance.net/gallery/227453477/Indian-Budget-How-the-Rupee-Flows): orçamento público desenhado como sankey (a página não descreve o visual em texto).

---

### 11.5 Sankey de caminhos (jornada multitoque)

**Descrição.** Sequência de pontos de contato por passo (1º toque, 2º toque, 3º toque, desfecho), mostrando os caminhos mais frequentes até a conversão.

**Anatomia.** Colunas de passo; nós de canal por passo; nó de desfecho; caminho mais frequente destacado; "Outros caminhos" agregado.

**Abordagem na stack.** `recharts-custom`. Nós desenrolados por passo com `name` único ("P2 · Busca paga") e campo `rotulo` separado para exibição ("Busca paga"); `node` customizado lê `payload.rotulo`.

**Ponto delicado.**
- Sem desenrolar por passo, o mesmo canal repetido gera laço (Busca paga para Busca paga).
- O número de nós cresce com passos vezes canais (4 passos e 7 canais dão 28 nós). Limitar a 4 passos e agrupar em "4 ou mais toques".
- Jornada de toque único vai direto ao desfecho: a ligação atravessa colunas; avisar na legenda que ela "pula passos".

**Versões sugeridas.**
1. **Básico.** Marketing: jornada dos 318 leads qualificados de 2026-08 em até 3 toques.
2. **Com destaque.** O caminho mais comum (Busca paga, Evento, Qualificado) em `--accent-cyan`.
3. **Caso limite: toque único.** 31% dos leads com toque único: ligações longas do passo 1 ao desfecho, com contagem no tooltip.

**Referências.**
- Catálogo: [From Data to Viz, Sankey](https://www.data-to-viz.com/graph/sankey.html): o uso "evolução" com nós em estágios diferentes.
- Praticante: [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): muitos caminhos diferentes que terminam em conversão.
- Portal de design: [Behance, Flow Analysis tool for CI platform](https://www.behance.net/gallery/108555313/Flow-Analysis-tool-for-CI-platform): fluxo do usuário por etapas dentro do produto.

---

### 11.6 Fluxo com retorno (sankey com laço)

**Descrição.** Sankey em que parte do volume volta a uma etapa anterior (reabertura, retorno de contato futuro), com o retorno desenhado como arco por baixo das colunas.

**Anatomia.** Sankey acíclico principal; arcos de retorno em U abaixo do diagrama; contador de passagens; legenda que diz se o total conta entidades ou passagens.

**Abordagem na stack.** `svg-puro`. Nenhuma referência aceita ciclos: o nivo quebra, o AG Charts remove a ligação e o Recharts não documenta. Calcular primeiro o layout sem as ligações de retorno (grafo acíclico), depois desenhar cada retorno como caminho `M xs,yBase C xs,yBase+h xt,yBase+h xt,yBase` com a mesma escala de largura.

**Ponto delicado.**
- Decidir se o total conta a entidade uma vez ou cada passagem e escrever na legenda.
- Laço sobre a própria etapa (reagendamento) vira contador no nó, não arco.
- Antes de usar, testar se desenrolar em "1ª passagem" e "2ª passagem" (11.5) responde a pergunta; quase sempre responde.

**Versões sugeridas.**
1. **Básico.** Comercial 2026-T3: 12 oportunidades perdidas em Proposta voltaram para Diagnóstico; arco em `--accent-amber`.
2. **Caso limite: laço na mesma etapa.** 41 agendas remarcadas na própria etapa "Agenda marcada": contador "41 remarcações" no nó, sem arco.

**Referências.**
- Catálogo: [nivo, Sankey](https://nivo.rocks/sankey/): o aviso de que `A para B para C para A` quebra.
- Catálogo: [AG Charts, Sankey Series](https://www.ag-grid.com/charts/javascript/sankey-series/): "links forming a circular loop will be removed".
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 11.7 Alluvial

**Descrição.** Colunas são momentos (ou dimensões); blocos empilhados são categorias com altura proporcional à contagem; faixas ligam as unidades que mantiveram ou mudaram de categoria.

**Anatomia.** Coluna por momento; bloco por categoria em ordem fixa; faixas entre colunas vizinhas; rótulo de categoria e contagem; cor por categoria de origem ou de destino; categorias "entrou" e "saiu da base".

**Abordagem na stack.** `svg-puro` (preferido). Ordem de categorias igual em todas as colunas; dentro de cada bloco, deslocamentos de saída ordenados pela categoria de destino e de entrada pela categoria de origem; faixa como Bézier horizontal com pontos de controle no meio. O `Sankey` do Recharts com nós por momento ("Quente · jul") e `sort={false}` é um atalho `recharts-custom`, mas o relaxamento pode mover blocos e quebrar a ordem fixa que o leitor usa para rastrear.

**Ponto delicado.**
- A população precisa ser a mesma em todas as colunas; quem entrou ou saiu da base vira categoria, senão as alturas não fecham.
- Cor pela origem serve para rastrear coorte; cor pelo destino serve para ver composição. Escolher uma e escrever na legenda.
- Categoria que só existe a partir de certo momento aparece nas colunas anteriores como "sem classificação".

**Versões sugeridas.**
1. **Básico.** 1.240 leads em jun, jul e ago de 2026 por temperatura: Quente em `--accent-amber`, Morno em `--accent-cyan`, Frio em neutro, Descartado em `--negative` dessaturado.
2. **Com destaque.** Só as faixas que esfriaram (Quente para Morno ou Frio) em opacidade cheia, com contagem anotada.
3. **Caso denso e real.** Canal canônico dos clientes em quatro trimestres (2025-T4 a 2026-T3), com "Novo" entrando e "Encerrou" saindo.
4. **Caso limite: classificação nova.** "Morno" passou a existir em jul: a coluna de jun mostra o bloco "sem classificação" que se reparte nas colunas seguintes.

**Referências.**
- Catálogo: [RAWGraphs, Alluvial Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/alluvialdiagram): metadados descrevem correlações entre dimensões categóricas como fluxos, com retângulo por valor único e altura proporcional.
- Catálogo: [Data Viz Project, Alluvial Diagram](https://datavizproject.com/data-type/alluvial-diagram/) (não abriu).
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): sankey para volume, alluvial para categorias.
- Portal de design: [Behance, Alluvial Diagram: Titanic passengers](https://www.behance.net/gallery/162455355/Alluvial-Diagram-Titanic-passengers): alluvial editorial de várias dimensões (a página não descreve o visual em texto).
- Portal de design: [Behance, Vendor Trace: Alluvial Diagram](https://www.behance.net/gallery/152796919/Vendor-Trace-Alluvial-Diagram): alluvial aplicado a rastreio de fornecedores (sem descrição textual do visual).

---

### 11.8 Parallel sets

**Descrição.** Cada eixo é uma dimensão categórica; as faixas dividem a população em cada eixo, sem setas. Mostra como atributos se combinam, não uma sequência no tempo.

**Anatomia.** Eixos paralelos com segmentos por categoria; faixas entre eixos vizinhos; rótulos de categoria nos eixos; cor pela primeira dimensão.

**Abordagem na stack.** `svg-puro`, com a mesma geometria do 11.7 e eixos como barras finas segmentadas.

**Ponto delicado.**
- A ordem dos eixos muda a leitura: só eixos vizinhos se comparam diretamente. Oferecer reordenação por clique no eixo.
- Acima de 4 eixos ou de 5 categorias por eixo vira emaranhado.
- Combinações com poucos casos sugerem padrão falso; agrupar em "outras combinações" abaixo de um mínimo.

**Versões sugeridas.**
1. **Básico.** Pré-vendas: origem, porte da empresa e desfecho da agenda para as 248 agendas marcadas.
2. **Com destaque.** A combinação "Indicação, Grande, Realizada" destacada.
3. **Caso limite: amostra pequena.** Combinações com menos de 5 agendas agregadas em "outras combinações", com a contagem no tooltip.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, Parallel Sets](https://datavizcatalogue.com/methods/parallel_sets.html): diferença para o sankey (sem setas, divide o caminho em cada conjunto de linhas).
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): a confusão entre sankey e alluvial, que também atinge parallel sets.
- Portal de design: não localizado nesta rodada.

---

### 11.9 Chord direcional de fluxo (dependency wheel)

**Descrição.** Entidades dispostas no círculo; fitas com espessura proporcional ao fluxo em cada sentido. Serve para trocas mútuas sem coluna de origem e de destino.

**Anatomia.** Arco externo por entidade com tamanho proporcional ao total; fitas internas; marca de sentido (cor da origem); rótulos no arco; foco por hover.

**Abordagem na stack.** `svg-puro`. Geometria em TypeScript a partir da matriz `m[i][j]`: ângulo do grupo proporcional à soma da linha, descontado o espaçamento `padAngle`; a fita de i para j ocupa `m[i][j]` na borda de i e `m[j][i]` na borda de j; o caminho é arco na borda de i, curva quadrática pelo centro até a borda de j, arco na borda de j e curva de volta ao início. A flag de arco grande do SVG liga quando o ângulo passa de π.

**Ponto delicado.**
- A ordem dos grupos no círculo decide os cruzamentos; ordenar por afinidade ou por volume e manter a ordem estável entre filtros.
- Sem interação é ilegível: hover no grupo apaga as demais fitas.
- Fitas fracas somem; colapsar em "Outras" as entidades pequenas.
- Leitura circular é mais lenta que a linear; a matriz de adjacência (27.5) é a alternativa acessível e deve estar a um clique.

**Versões sugeridas.**
1. **Básico.** Comercial: repasses entre funções (Pré-vendas, Executivo, Relacionamento, Especialista de produto) em 2026-T3, nos dois sentidos.
2. **Com destaque.** Hover em "Pré-vendas" deixa só as fitas dela; contagem de ida e volta no tooltip.
3. **Caso limite: muitas entidades.** 14 equipes: seis maiores mais "Outras", com botão "ver como matriz".

**Referências.**
- Catálogo: [Highcharts, Dependency wheel (docs)](https://www.highcharts.com/docs/chart-and-series-types/dependency-wheel): mesmo dado do sankey, nós no mesmo nível, fluxo multidirecional.
- Catálogo: [Highcharts, Dependency wheel (demo)](https://www.highcharts.com/demo/highcharts/dependency-wheel): demo oficial (renderizado por JavaScript).
- Catálogo: [AG Charts, Chord Series](https://www.ag-grid.com/charts/javascript/chord-series/): `fromKey`, `toKey`, `sizeKey` e `tension` da curva.
- Catálogo: [Apache ECharts, Basic Chord](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/chord-simple.ts): série `chord` desde a 6.0.0 com `lineStyle.color: 'target'`.
- Catálogo: [nivo, Chord](https://nivo.rocks/chord/): matriz, `padAngle` e opacidades ativa e inativa.
- Catálogo: [From Data to Viz, Chord](https://www.data-to-viz.com/graph/chord.html): ordenar para reduzir cruzamentos, remover fracos e explicar ao público.
- Catálogo: [visx, sandbox chord](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-chord): referência de geometria em React (a biblioteca não entra na stack).
- Praticante: [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): minimizar cruzamentos, colapsar ligações fracas em "outros", dar pistas para leigos.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): por que o arranjo circular atrapalha consulta e comparação.
- Portal de design: [Behance, Bilateral Migrations Inside The EU in 2020 (D3.js)](https://www.behance.net/gallery/137170789/Bilateral-Migrations-Inside-The-EU-in-2020-%28D3js%29): entidades ordenadas por volume e fita mais grossa para mais pessoas.

---

## 4. Modelos que moram melhor em outra família

| Modelo | Família sugerida | Motivo |
|---|---|---|
| Mapa de fluxo sobre geografia (Minard) | 23_mapas | A posição é geográfica |
| Matriz de transição origem por destino com cor | 15_mapa-de-calor-e-calendario | Célula colorida, não faixa |
| Cascata (o FT a lista na categoria fluxo) | 19_cascata-waterfall | Soma e subtração em degraus |
| Rede dirigida sem volume, chord simétrico e chord sem fita | 27_rede-e-relacoes | Relação, não quantidade que flui |
| Bump chart de ranking entre períodos | 17_comparacao-de-pontos ou 04_linhas | Posição ordinal no tempo |
| Streamgraph | 05_areas | Série temporal empilhada |
| Funil linear sem ramificação | 10_funil | Um caminho só |

---

## 5. Fontes consultadas

Abertas nesta pesquisa:
- https://www.data-to-viz.com/graph/sankey.html
- https://www.data-to-viz.com/graph/chord.html
- https://datavizcatalogue.com/methods/sankey_diagram.html
- https://datavizcatalogue.com/methods/parallel_sets.html
- https://datavizcatalogue.com/methods/chord_diagram.html
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- https://recharts.github.io/en-US/api/Sankey/
- https://recharts-recharts.mintlify.app/examples/sankey
- https://nivo.rocks/sankey/
- https://nivo.rocks/chord/
- https://www.ag-grid.com/charts/javascript/sankey-series/
- https://www.ag-grid.com/charts/javascript/chord-series/
- https://www.highcharts.com/docs/chart-and-series-types/sankey-diagram
- https://www.highcharts.com/docs/chart-and-series-types/dependency-wheel
- https://www.highcharts.com/demo/highcharts/sankey-diagram (página abriu, demo renderizada por JavaScript)
- https://www.highcharts.com/demo/highcharts/dependency-wheel (página abriu, demo renderizada por JavaScript)
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sankey-levels.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sankey-vertical.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/chord-simple.ts
- https://github.com/rawgraphs/rawgraphs-charts
- https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/alluvialdiagram
- https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/sankeydiagram
- https://www.rawgraphs.io/
- https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-chord
- https://www.datawrapper.de/blog/chart-types-guide
- https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/
- https://www.edwardtufte.com/product/napoleons-march/
- https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf
- https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/
- https://www.behance.net/search/projects/sankey%20diagram
- https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options
- https://www.behance.net/gallery/108555313/Flow-Analysis-tool-for-CI-platform
- https://www.behance.net/gallery/219066133/Central-College-Sankey-Major-to-Job-Correlation-Diagram
- https://www.behance.net/gallery/227453477/Indian-Budget-How-the-Rupee-Flows
- https://www.behance.net/gallery/107000871/Pathways-to-mitigating-climate-change-Sankey-diagram (sankey editorial; texto da página não descreve o visual)
- https://www.behance.net/gallery/162455355/Alluvial-Diagram-Titanic-passengers
- https://www.behance.net/gallery/152796919/Vendor-Trace-Alluvial-Diagram
- https://www.behance.net/gallery/137170789/Bilateral-Migrations-Inside-The-EU-in-2020-%28D3js%29
- Tipagem local: `app/node_modules/recharts/types/chart/Sankey.d.ts` e `types/util/types.d.ts` (interface `SankeyNode`), Recharts 3.10.1

Apareceram em busca e não abriram:
- https://datavizproject.com/data-type/sankey-diagram/ (não abriu, 403)
- https://datavizproject.com/data-type/alluvial-diagram/ (não abriu, 403)
- https://stackblitz.com/edit/lbje6c2j?file=src/Example.tsx (não abriu; exemplo de nó customizado de Sankey no Recharts)
