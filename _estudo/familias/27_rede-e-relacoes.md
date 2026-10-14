# 27_rede-e-relacoes: grafos, arcos, matrizes e chord de relação

> Estudo da família para o catálogo VISUAIS do Farol. Pesquisa feita em 2026-09-14.
> Casos de uso com dados 100% fictícios, sem marca real e sem dado pessoal (clientes, parceiros e pessoas aparecem só como códigos: C01, P07, SDR 1, Executivo A).
> Stack: React 18.3.1, TypeScript 5.9 strict, Recharts 3.10.1, Tailwind 4.3, lucide-react. O Recharts não tem componente de grafo, chord ou matriz de adjacência: toda a família é `svg-puro` ou `html-tailwind`, com geometria calculada em TypeScript.
> Tokens de cor do Farol: `--chart-1..8`, `--seq-1..7`, `--positive`, `--negative`, `--accent-cyan`, `--accent-amber`, `--surface-*`, `--text-*`, `--border`.

---

## 1. O que a família responde

Quem se liga a quem, com que força e com que estrutura. Aqui a mensagem é a relação, não o volume que flui de uma etapa para outra (isso é a família 11) nem o pertencimento de pai para filho (família 12).

A From Data to Viz separa as redes por duas propriedades que decidem o modelo:
- **dirigida ou não** (indicação de A para B, ou coocorrência entre A e B);
- **ponderada ou não** (quantas vezes, quanto valor, ou só existe ligação).

E o problema central da família tem nome: **hairball**, o emaranhado de muitas ligações sem padrão. Toda a escolha de modelo abaixo é uma forma de evitá-lo: reduzir nós, ordenar bem, trocar a posição livre por eixo (arco), por grade (matriz) ou por círculo (chord), ou agrupar arestas (bundling).

### Perguntas típicas no Farol

- **Comercial**: quem são os clientes que mais indicam, e as indicações formam grupos? Quais produtos aparecem juntos na mesma carteira?
- **Pré-vendas**: como os handoffs se distribuem entre SDRs e executivos; há concentração em poucos pares?
- **Marketing**: quais origens aparecem juntas na jornada do mesmo lead (coocorrência de toques)?
- **Diretoria**: de quais fontes de dado cada indicador depende (procedência); quais indicadores caem se uma fonte parar?

### Regras transversais da família

- Layout determinístico: mesma entrada, mesmo desenho (semente fixa, sem animação de simulação na tela).
- Filtro de peso mínimo e limite de nós antes de desenhar; o total omitido aparece escrito.
- Hover que acende a vizinhança e apaga o resto; clique que fixa a seleção.
- Rótulo só nos nós relevantes (grau ou peso acima de um corte); o resto no tooltip.
- Alternativa acessível obrigatória: lista de ligações (origem, destino, peso) ou matriz (27.5).
- Em 400 px, grafo livre e chord ficam ilegíveis: oferecer a lista ordenada de pares como visão móvel.

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 27.1 | Grafo de rede dirigido por forças | Descobrir grupos e pontes em até cerca de 150 nós | Mais de 300 nós ou ligações densas | Layout aleatório a cada render e rótulo em todo nó |
| 27.2 | Grafo bipartido | Relações entre dois tipos de entidade (SDR e executivo, cliente e produto) | Um tipo só de entidade | Ordem das colunas que maximiza cruzamentos |
| 27.3 | Grafo radial e circular | Rede centrada numa entidade, ou todos os nós num círculo | Muitas ligações longas cruzando o centro | Nó central sem distinção do resto |
| 27.4 | Arc diagram | Coocorrência ou dependência com rótulos legíveis | Mais de 40 nós | Ordem dos nós aleatória, que apaga os grupos |
| 27.5 | Matriz de adjacência | Redes densas, comparação de pares, alternativa acessível | Poucos nós e ligações esparsas (grafo resolve) | Ordem alfabética que esconde os blocos |
| 27.6 | Chord simétrico de relação | Coocorrência entre até 10 grupos com peso | Relação dirigida com volume (usar 11.9) | Não explicar como ler |
| 27.7 | Chord sem fita | Relações binárias num círculo, visual leve | Quando o peso importa | Linhas retas que viram emaranhado |
| 27.8 | Hierarchical edge bundling | Ligações entre folhas de uma hierarquia (fonte e indicador) | Dado sem hierarquia | Tensão alta que junta tudo num feixe só |
| 27.9 | Grafo em grade | Relações entre nós que já têm duas categorias (função e etapa) | Nós sem atributo categórico | Arestas atravessando células sem rota |

---

## 3. Modelos

### 27.1 Grafo de rede dirigido por forças

**Descrição.** Nós posicionados por simulação física (ligações puxam, nós se repelem), revelando grupos, pontes e periferia.

**Anatomia.** Nó (círculo) com tamanho por grau ou valor e cor por grupo; aresta com espessura por peso e seta quando dirigida; rótulos dos nós principais; legenda de grupos; contagem de nós e arestas omitidos.

**Abordagem na stack.** `svg-puro`. Implementar Fruchterman e Reingold em TypeScript dentro de `useMemo`, com posições iniciais geradas por PRNG com semente fixa (por exemplo, mulberry32 com semente derivada do hash do dado): `k = sqrt(area / n)`, repulsão `k² / d` entre todos os pares, atração `d² / k` nas arestas, temperatura decrescente por iteração, cerca de 300 iterações, posições presas à área útil. Renderizar `<line>` ou `<path>` para arestas antes dos `<circle>`.

**Ponto delicado.**
- Custo quadrático na repulsão: até cerca de 300 nós roda no navegador em poucas dezenas de milissegundos; acima disso, pré-calcular fora da tela ou agregar.
- Sem semente fixa o grafo muda de forma a cada render e o leitor perde a memória espacial.
- Adjacência pré-calculada em `Map<string, Set<string>>` para o hover acender vizinhos sem varrer arestas.
- No tema escuro, arestas em `--text-muted` com opacidade 0,25 e realce em `--accent-cyan`; sem isso o emaranhado vira mancha.
- Hairball: filtrar arestas abaixo de um peso mínimo e mostrar "82 ligações fracas ocultas".

**Versões sugeridas.**
1. **Básico.** Comercial, rede de indicações: 60 clientes (C01 a C60) e 72 indicações registradas desde 2025; tamanho pela receita, cor pelo produto principal.
2. **Com destaque.** Os três clientes com mais indicações em `--accent-amber` e rótulo; hover acende quem cada um indicou.
3. **Caso denso e real.** 180 contas e 410 ligações de coocorrência de produto: filtro de peso mínimo 2, grupos coloridos por produto dominante e contagem de ligações ocultas.
4. **Caso limite: componentes isolados.** 22 clientes sem nenhuma indicação: agrupados numa faixa "sem ligação" abaixo do grafo em vez de espalhados pela borda.

**Referências.**
- Catálogo: [From Data to Viz, Network](https://www.data-to-viz.com/graph/network.html): quatro tipos (dirigido, ponderado), algoritmos de layout e o hairball.
- Catálogo: [Data Visualisation Catalogue, Network Diagram](https://datavizcatalogue.com/methods/network_diagram.html): capacidade limitada de dados e o emaranhado em escala.
- Catálogo: [nivo, Network](https://nivo.rocks/network/): `linkDistance`, `centeringStrength`, `repulsivity` e o hook `useNetwork`.
- Catálogo: [Highcharts, Network graph (docs)](https://www.highcharts.com/docs/chart-and-series-types/network-graph): Reingold e Fruchterman, `maxIterations` e aproximação para muitos nós.
- Catálogo: [Highcharts, Network graph (demo)](https://www.highcharts.com/demo/highcharts/network-graph): demo oficial (renderizado por JavaScript).
- Catálogo: [visx, sandbox network](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-network): referência de renderização em React.
- Praticante: não localizado nesta rodada.
- Portal de design: [Behance, Network Data Visualization](https://www.behance.net/gallery/102929797/Network-Data-Visualization): camadas de informação sobrepostas numa rede de sinalização.
- Portal de design: [Behance, Scholar Network Visualization System](https://www.behance.net/gallery/117386879/Scholar-Network-Visualization-System): sistema de exploração com grafo dirigido por forças.

---

### 27.2 Grafo bipartido

**Descrição.** Dois tipos de entidade em duas colunas, com ligações só entre colunas. Resolve relações como "quem passa para quem" sem o caos do layout livre.

**Anatomia.** Coluna A e coluna B com nós ordenados; ligação com espessura por peso; rótulos nos dois lados; total por nó; destaque do par selecionado.

**Abordagem na stack.** `svg-puro`. Posição vertical por ordem na coluna; ligação como Bézier horizontal `M xA,yA C xm,yA xm,yB xB,yB`. Ordenação para reduzir cruzamentos por heurística de baricentro: ordenar a coluna B pela média das posições dos vizinhos em A, depois A pela média em B, repetir algumas vezes.

**Ponto delicado.**
- Relação e fluxo se parecem aqui. Se a pergunta é "quanto volume foi de A para B", usar o sankey 11.1; se é "quem se relaciona com quem e com que frequência", o bipartido com espessura discreta.
- Espessura em poucas faixas (fraca, média, forte) é mais legível que contínua quando há muitas ligações.
- Nós com muitas ligações empilham as pontas no mesmo ponto: distribuir as pontas ao longo da altura do nó.

**Versões sugeridas.**
1. **Básico.** Pré-vendas, handoffs de 2026-T3: SDR 1 a SDR 5 à esquerda, Executivo A a H à direita, espessura pelo número de agendas repassadas.
2. **Com destaque.** Hover em "SDR 3" mostra que 70% dos repasses foram para dois executivos, com o percentual no tooltip.
3. **Caso limite: nó sem ligação.** Executivo sem nenhum handoff no trimestre aparece na coluna com traço neutro e "0 repasses", sem sumir.

**Referências.**
- Catálogo: [From Data to Viz, Network](https://www.data-to-viz.com/graph/network.html): a sugestão de sankey ou chord quando a rede é dirigida.
- Catálogo: [From Data to Viz, Chord](https://www.data-to-viz.com/graph/chord.html): o caso bipartido, com ligações só entre categorias.
- Praticante: [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): ordenação de categorias como o que decide a leitura em redes categóricas.
- Portal de design: [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options): comparação de formas para um dado de dois níveis e escolha pela legibilidade.

---

### 27.3 Grafo radial e circular

**Descrição.** Duas variações de posição fixa: a **egocêntrica**, com uma entidade no centro e as relações em anéis de distância; e a **circular**, com todos os nós no perímetro e as ligações por dentro.

**Anatomia.** Nó central destacado (egocêntrica) ou círculo de nós ordenados (circular); anéis de primeiro e segundo grau; arestas curvas; rótulos girados pelo ângulo.

**Abordagem na stack.** `svg-puro`. Egocêntrica: vizinhos de primeiro grau em ângulos iguais no raio r1, de segundo grau no raio r2 próximos do vizinho que os liga. Circular: ângulo pela ordem (agrupada por categoria), aresta como curva quadrática com controle deslocado para o centro (`Q cx,cy`), à semelhança do `curveness` do ECharts.

**Ponto delicado.**
- Na circular, a ordem dos nós decide tudo: agrupar por categoria e, dentro dela, por grau.
- Rótulos da metade esquerda giram 180 graus e alinham à direita.
- Na egocêntrica, segundo grau com muitos nós transborda o anel: limitar e mostrar "mais 18".

**Versões sugeridas.**
1. **Básico (egocêntrica).** Comercial, parceiro de indicação P07 no centro, 9 contas indicadas no primeiro anel e 14 contas indicadas por essas contas no segundo.
2. **Com destaque (circular).** Marketing, 12 origens num círculo agrupadas por tipo (pago, orgânico, relacionamento), com coocorrência na mesma jornada; hover numa origem acende as ligações dela.
3. **Caso limite: nó central sem vizinhos.** Parceiro sem indicação no período: estado vazio com o histórico anterior em cinza e aviso "sem indicações em 2026-T3".

**Referências.**
- Catálogo: [Apache ECharts, Les Miserables (circular layout)](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/graph-circular-layout.ts): `rotateLabel`, `curveness: 0.3` e cor da linha pela origem.
- Catálogo: [From Data to Viz, Network](https://www.data-to-viz.com/graph/network.html): layout como decisão de legibilidade.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): custo de orientação em arranjos circulares.
- Portal de design: [Behance, busca "network graph visualization"](https://www.behance.net/search/projects/network%20graph%20visualization): varredura de layouts radiais e circulares.

---

### 27.4 Arc diagram

**Descrição.** Nós alinhados num eixo único e ligações desenhadas como arcos. Troca a visão da estrutura global por rótulos legíveis e por padrões claros quando a ordem é boa.

**Anatomia.** Eixo com nós ordenados; arcos acima (e abaixo, quando dirigido no sentido contrário); espessura por peso; tamanho do nó por grau; cor por grupo; rótulos girados sob o eixo.

**Abordagem na stack.** `svg-puro`. `x = indice * passo`; arco do nó i ao j como semicírculo `M xi,y A r,r 0 0,1 xj,y` com `r = (xj - xi) / 2`; sentido de i para j acima, de j para i abaixo. Espessura em escala de raiz quadrada do peso.

**Ponto delicado.**
- Ordem aleatória apaga os grupos (From Data to Viz); ordenar por grupo e, dentro do grupo, por grau ou frequência (Nightingale).
- Arcos longos saem da área: altura máxima do SVG igual à metade do eixo, ou achatar arcos longos com elipse (`A r, r*0,6`).
- Rótulos sob o eixo girados em 45 ou 90 graus pedem margem inferior calculada pelo maior rótulo.

**Versões sugeridas.**
1. **Básico.** Marketing, coocorrência de 7 origens na jornada dos leads de 2026-08, ordenadas por volume.
2. **Com destaque.** Diretoria, procedência: 24 indicadores ordenados por dashboard (Comercial, Pré-vendas, Marketing, Diretoria), com arcos para as fontes de dado de que dependem; hover numa fonte acende todos os indicadores que caem se ela parar.
3. **Caso limite: dependência dirigida.** Indicador derivado de outro indicador: arco acima para "usa" e abaixo para "é usado por", com legenda explícita.

**Referências.**
- Catálogo: [From Data to Viz, Arc Diagram](https://www.data-to-viz.com/graph/arc.html): ordem dos nós como fator crítico e vantagem de rótulo sobre o grafo 2D.
- Catálogo: [Data Visualisation Catalogue, Arc Diagram](https://datavizcatalogue.com/methods/arc_diagram.html): bom para coocorrência, ruim com muitas ligações.
- Catálogo: [Vega, Arc Diagram](https://vega.github.io/vega/examples/arc-diagram/): nó dimensionado pelo grau, espessura pelo peso e cor pelo grupo.
- Catálogo: [Highcharts, Arc diagram (demo)](https://www.highcharts.com/demo/highcharts/arc-diagram): demo oficial (renderizado por JavaScript).
- Catálogo: [RAWGraphs, Arc Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/arcdiagram): implementação de referência na categoria redes.
- Praticante: [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): com boa ordenação fica fácil ver grupos e pontes; ordenar por frequência.
- Portal de design: [Behance, Arc Diagram](https://www.behance.net/gallery/215420457/Arc-Diagram): arcos sobre linha numerada em fundo claro e escuro.

---

### 27.5 Matriz de adjacência

**Descrição.** Nós como linhas e colunas; cada célula colorida indica a ligação e a intensidade codifica o peso. Não tem cruzamento de arestas, escala para redes densas e é a alternativa acessível de toda a família.

**Anatomia.** Cabeçalho de linhas e de colunas; células com cor sequencial; diagonal (autorrelação) neutra; separadores de grupo; controle de ordenação (nome, frequência, grupo); destaque da linha e coluna sob o cursor.

**Abordagem na stack.** `html-tailwind` até cerca de 30 nós (`grid` com `grid-template-columns: auto repeat(n, minmax(0, 1fr))`, célula `aspect-square` com cor de `--seq-1..7` por quantil); `svg-puro` acima disso. Ordenação calculada em TypeScript: por grupo e grau como padrão; por semelhança de linhas quando houver pedido de "agrupar".

**Ponto delicado.**
- A ordem é a informação: por nome, a matriz de coocorrência não mostra nada; por grupo, surgem blocos (Bostock, Les Misérables).
- Dirigida ou não: na simétrica, desenhar só metade ou deixar claro que as duas metades repetem; na dirigida, linha é origem e coluna é destino, escrito no canto.
- Mais de 12 nós em 400 px exige contêiner com rolagem horizontal (permitido para diagramas) e cabeçalho de linha fixo.
- Cor por quantil evita que um único par gigante apague o resto.

**Versões sugeridas.**
1. **Básico.** Marketing, coocorrência de 12 origens na mesma jornada de lead (simétrica), ordenada por grupo de origem.
2. **Com destaque.** Pré-vendas, matriz dirigida SDR por executivo com o par mais concentrado destacado e o percentual da linha escrito na célula.
3. **Caso denso e real.** Diretoria, 40 indicadores por 18 fontes de dado (matriz retangular de procedência), com colunas agrupadas por sistema e linhas por dashboard.
4. **Caso limite: célula desconhecida.** Par sem medição (a fonte não registra a origem): célula hachurada "sem dado", distinta da célula vazia "zero".

**Referências.**
- Catálogo: [Vega, Reorderable Matrix](https://vega.github.io/vega/examples/reorderable-matrix/): matriz simétrica com reordenação por arraste.
- Catálogo: [Apache ECharts, Graph Chart in Matrix](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/matrix-graph.ts): sistema de coordenadas em matriz da 6.0 (base do 27.9).
- Catálogo: [RAWGraphs, Matrix Plot (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/matrixplot): implementação de referência em grade.
- Praticante: [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/): ordenação por nome, frequência e grupo, e por que a ordem revela grupos e pontes.
- Portal de design: não localizado nesta rodada (a busca no Behance devolveu identidade visual, não matriz de adjacência).

---

### 27.6 Chord simétrico de relação

**Descrição.** Grupos no perímetro de um círculo e fitas entre eles com largura proporcional à força da relação, sem sentido. Para fluxo com direção, ver 11.9.

**Anatomia.** Arco externo por grupo com tamanho pelo total de relações; fitas internas; cor por grupo; rótulos no arco; foco por hover; nota "como ler".

**Abordagem na stack.** `svg-puro`, com a mesma geometria do 11.9 aplicada a matriz simétrica (as duas pontas da fita têm a mesma largura). Ângulo do grupo pela soma da linha menos o espaçamento; subarcos ordenados pelo peso para reduzir cruzamentos; flag de arco grande quando o ângulo passa de π.

**Ponto delicado.**
- Chord não é autoexplicativo (From Data to Viz): legenda curta "fita mais larga, mais contas com os dois produtos" junto do visual.
- Ordem dos grupos e dos subarcos decide a legibilidade.
- Fitas finas somem: limiar mínimo e agrupamento em "Outros".
- A matriz (27.5) resolve a mesma pergunta com precisão; oferecer alternância.

**Versões sugeridas.**
1. **Básico.** Comercial, produtos na mesma carteira: 7 produtos, fita pela quantidade de clientes que têm os dois.
2. **Com destaque.** Hover em "Crédito estruturado" acende as fitas dele e mostra o produto mais associado.
3. **Caso limite: diagonal.** Clientes com um produto só não têm par: arco do grupo mostra a parcela "só este produto" como faixa interna neutra, em vez de fita para si mesmo.

**Referências.**
- Catálogo: [From Data to Viz, Chord](https://www.data-to-viz.com/graph/chord.html): arranjo, remoção de fracos e necessidade de explicação.
- Catálogo: [Data Visualisation Catalogue, Chord Diagram](https://datavizcatalogue.com/methods/chord_diagram.html): comparação de semelhanças e excesso de conexões.
- Catálogo: [nivo, Chord](https://nivo.rocks/chord/): dado em matriz, `padAngle` e opacidade ativa e inativa.
- Catálogo: [AG Charts, Chord Series](https://www.ag-grid.com/charts/javascript/chord-series/): estilos de nó e fita e `tension`.
- Catálogo: [visx, sandbox chord](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-chord): referência de geometria em React.
- Praticante: [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): três cuidados do chord (cruzamentos, fracos, pistas para leigos).
- Portal de design: [Behance, Bilateral Migrations Inside The EU in 2020 (D3.js)](https://www.behance.net/gallery/137170789/Bilateral-Migrations-Inside-The-EU-in-2020-%28D3js%29): ordenação por volume e largura da fita como intensidade.

---

### 27.7 Chord sem fita

**Descrição.** Versão enxuta do chord: só os nós no círculo e linhas curvas finas entre eles, para relações binárias ou de peso pouco relevante.

**Anatomia.** Nós no perímetro; linhas curvas pelo interior; cor pela origem ou pelo grupo; rótulos girados.

**Abordagem na stack.** `svg-puro`. Nós como no 27.3 circular; ligação como curva quadrática `M xi,yi Q cx,cy xj,yj` (controle no centro) com opacidade baixa.

**Ponto delicado.**
- Linhas retas pelo centro viram emaranhado; a curva pelo centro já ajuda, e agrupar nós por categoria ajuda mais.
- Sem peso na espessura, a leitura é de existência de ligação; não usar para "quanto".
- Muitos nós no círculo: rótulos só por grupo, não por nó.

**Versões sugeridas.**
1. **Básico.** Comercial, 16 equipes internas fictícias e quais já compartilharam oportunidades no ano.
2. **Com destaque.** Hover numa equipe acende as ligações e a contagem de parceiras.
3. **Caso limite: nó isolado.** Equipe sem nenhuma ligação: fica no círculo, em neutro, com "0 relações", para não sugerir que foi esquecida.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, Non-ribbon Chord Diagram](https://datavizcatalogue.com/methods/non_ribbon_chord_diagram.html): chord só com nós e linhas, sem as fitas.
- Catálogo: [Apache ECharts, Les Miserables (circular layout)](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/graph-circular-layout.ts): linhas curvas com `curveness` em layout circular.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 27.8 Hierarchical edge bundling

**Descrição.** Folhas de uma hierarquia dispostas num círculo (ou num eixo), com as ligações entre folhas curvadas ao longo do caminho da hierarquia; ligações com rota parecida viram feixes, "como amarrar fios elétricos e abrir nas pontas".

**Anatomia.** Folhas no perímetro agrupadas pelo pai; feixes curvos; cor de entrada e de saída no hover; controle de tensão; rótulos girados.

**Abordagem na stack.** `svg-puro`. Layout radial de dendrograma (12.11) para as folhas; para cada ligação, pontos de controle = posições dos ancestrais do caminho da origem até o ancestral comum e de volta até o destino; aplicar a tensão β deslocando cada ponto de controle em direção à reta origem e destino (`P' = β·P + (1 - β)·(P0 + t·(Pn - P0))`); desenhar como B-spline cúbica uniforme convertida em segmentos de Bézier cúbica.

**Ponto delicado.**
- Exige hierarquia real: sem ela, o bundling não tem rota (From Data to Viz).
- Tensão perto de 1 junta tudo num feixe único; perto de 0 volta a ser linha reta. Começar em 0,85 e expor um controle.
- Hover obrigatório com duas cores de sentido (o exemplo do Vega usa uma cor para dependências de entrada e outra para as de saída, e baixa a opacidade das demais para 0,2).
- A conversão de B-spline para Bézier precisa repetir o primeiro e o último ponto para a curva tocar a folha.

**Versões sugeridas.**
1. **Básico.** Diretoria, procedência: 18 fontes de dado agrupadas por sistema e 40 indicadores agrupados por dashboard, todos no mesmo círculo, com feixes fonte e indicador.
2. **Com destaque.** Hover na fonte "Formulário do site" mostra em `--negative` os 11 indicadores que dependem dela.
3. **Caso limite: ligação dentro do mesmo grupo.** Indicador que depende de outro indicador do mesmo dashboard: o caminho sobe só até o pai comum e a curva fica curta; desenhar em cor secundária para não sumir no feixe.

**Referências.**
- Catálogo: [From Data to Viz, Hierarchical Edge Bundling](https://www.data-to-viz.com/graph/edge_bundling.html): exigência de hierarquia e comparação com a versão de linhas retas.
- Catálogo: [Vega, Edge Bundling](https://vega.github.io/vega/examples/edge-bundling/): controle deslizante de tensão e cores de entrada e saída no hover.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 27.9 Grafo em grade

**Descrição.** Nós posicionados em células de uma grade definida por duas categorias (linha e coluna) e ligações entre eles com seta. Mantém a leitura da matriz e mostra dependências dirigidas sem layout livre.

**Anatomia.** Eixo de colunas (por exemplo, função); eixo de linhas (por exemplo, etapa); nó dentro da célula; arestas com seta; destaque do caminho selecionado.

**Abordagem na stack.** `svg-puro` sobre uma grade `html-tailwind`: grade em CSS com cabeçalhos, camada SVG absoluta com a mesma dimensão para as arestas; posição do nó pelo centro da célula (medido com `ResizeObserver`); aresta ortogonal com cantos arredondados para não atravessar nós.

**Ponto delicado.**
- A camada SVG precisa acompanhar a grade em redimensionamento; medir as células, não assumir tamanhos fixos.
- Várias arestas saindo da mesma célula se sobrepõem: deslocar as pontas em alguns pixels por aresta.
- Célula com mais de um nó vira pilha interna com contagem.

**Versões sugeridas.**
1. **Básico.** Comercial, handoff: colunas Marketing, Pré-vendas, Executivo, Relacionamento; linhas Entrada, Qualificação, Proposta, Pós-venda; setas mostrando quem passa para quem em cada etapa.
2. **Com destaque.** Handoffs com SLA estourado em `--negative` e a contagem na seta.
3. **Caso limite: etapa sem dono.** Célula "Proposta · Relacionamento" sem nó: tracejado "sem responsável definido", que é justamente o achado.

**Referências.**
- Catálogo: [Apache ECharts, Graph Chart in Matrix](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/matrix-graph.ts): nós de disciplina por ano em sistema de coordenadas de matriz, com setas de pré-requisito.
- Catálogo: [Vega, Reorderable Matrix](https://vega.github.io/vega/examples/reorderable-matrix/): a matriz como base de leitura de rede.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

## 4. Modelos que moram melhor em outra família

| Modelo | Família sugerida | Motivo |
|---|---|---|
| Árvore, dendrograma e organograma | 12_hierarquia | Pertencimento de pai para filho, sem arestas cruzadas |
| Chord direcional de fluxo (dependency wheel) | 11_fluxo-sankey (11.9) | Volume com sentido |
| Sankey bipartido de volume | 11_fluxo-sankey (11.1) | Quantidade que flui |
| Mapa de conexões sobre geografia | 23_mapas | A posição é geográfica |
| Matriz de transição com cor contínua sem leitura de rede | 15_mapa-de-calor-e-calendario | Mapa de calor puro |
| Diagrama de Venn ou de Euler (sobreposição de públicos) | 22_unidades-waffle-e-pictograma ou 26_mosaico-marimekko | O FT classifica em parte do todo; não é rede |

---

## 5. Fontes consultadas

Abertas nesta pesquisa:
- https://www.data-to-viz.com/graph/network.html
- https://www.data-to-viz.com/graph/arc.html
- https://www.data-to-viz.com/graph/chord.html
- https://www.data-to-viz.com/graph/edge_bundling.html
- https://datavizcatalogue.com/methods/network_diagram.html
- https://datavizcatalogue.com/methods/arc_diagram.html
- https://datavizcatalogue.com/methods/chord_diagram.html
- https://datavizcatalogue.com/methods/non_ribbon_chord_diagram.html
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary (rede na categoria fluxo; Venn em parte do todo)
- https://nivo.rocks/network/
- https://nivo.rocks/chord/
- https://www.ag-grid.com/charts/javascript/chord-series/
- https://www.highcharts.com/docs/chart-and-series-types/network-graph
- https://www.highcharts.com/demo/highcharts/network-graph (página abriu, demo renderizada por JavaScript)
- https://www.highcharts.com/demo/highcharts/arc-diagram (página abriu, demo renderizada por JavaScript)
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/graph-circular-layout.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/matrix-graph.ts
- https://vega.github.io/vega/examples/
- https://vega.github.io/vega/examples/arc-diagram/
- https://vega.github.io/vega/examples/reorderable-matrix/
- https://vega.github.io/vega/examples/edge-bundling/
- https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/arcdiagram
- https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/matrixplot
- https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-network
- https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-chord
- https://bost.ocks.org/mike/miserables/
- https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/
- https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf
- https://www.behance.net/search/projects/network%20graph%20visualization
- https://www.behance.net/search/projects/arc%20diagram%20data%20visualization
- https://www.behance.net/search/projects/adjacency%20matrix (sem resultado de matriz de adjacência)
- https://www.behance.net/gallery/102929797/Network-Data-Visualization
- https://www.behance.net/gallery/117386879/Scholar-Network-Visualization-System
- https://www.behance.net/gallery/215420457/Arc-Diagram
- https://www.behance.net/gallery/137170789/Bilateral-Migrations-Inside-The-EU-in-2020-%28D3js%29
- https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options
