# 12_hierarquia: treemap, sunburst, icicle, circle packing e árvores

> Estudo da família para o catálogo VISUAIS do Farol. Pesquisa feita em 2026-09-14.
> Casos de uso com dados 100% fictícios, sem marca real e sem dado pessoal.
> Stack conferida no `app/`: React 18.3.1, TypeScript 5.9 strict, Recharts 3.10.1 (tipagem de `Treemap` e `SunburstChart` lida em `app/node_modules/recharts/types/chart/`), Tailwind 4.3, lucide-react.
> Tokens de cor do Farol: `--chart-1..8`, `--seq-1..7`, `--positive`, `--negative`, `--accent-cyan`, `--accent-amber`, `--surface-*`, `--text-*`, `--border`.

---

## 1. O que a família responde

Como um todo se divide em partes que também se dividem. A família cobre duas perguntas diferentes, e escolher o modelo é escolher qual delas vem primeiro:

- **Quanto pesa cada parte da hierarquia** (codificação por área ou ângulo): treemap, sunburst, icicle, circle packing.
- **Qual é a estrutura** (quem pertence a quem, profundidade, ramificação), com ou sem valor: árvore, dendrograma, árvore radial, árvore de indicadores.

Treemap é o mais eficiente em espaço, mas o Data Visualisation Catalogue registra que ele separa pior os níveis do que a árvore e o sunburst; o circle packing mostra melhor a estrutura e desperdiça espaço. Nenhum dos modelos por área aceita valor negativo.

### Perguntas típicas no Farol

- **Comercial**: a receita reconhecida do trimestre vem de quais produtos e, dentro de cada produto, de quais executivos? Quais motivos de perda pesam mais, e quais submotivos compõem cada um?
- **Marketing**: o investimento do mês se distribui como entre plataforma, campanha e criativo; onde está o CPL qualificado que mais piorou?
- **Pré-vendas**: as entradas se dividem como entre origem, subcanal e desfecho?
- **Diretoria**: quais alavancas explicam a receita projetada de 2027 e quanto cada uma varia no cenário em faixa; qual é o perímetro de mercado (total, endereçável, alcançável) e quanto dele é nosso?

### Regras transversais da família

- No máximo 3 níveis rotulados de uma vez; mais que isso pede detalhamento por clique (From Data to Viz).
- Cor por ancestral de primeiro nível, com variação de luminosidade por profundidade; ou cor por métrica, nunca as duas.
- Valores menores ou iguais a zero ficam fora do desenho e aparecem numa lista "fora do gráfico" com o motivo.
- Rótulo só onde cabe (largura e altura mínimas); o resto vai para tooltip.
- Trilha de navegação (breadcrumb) sempre visível quando houver detalhamento.
- Alternativa acessível: tabela em árvore com recuo (família 14).

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 12.1 | Treemap simples (um nível) | Parte do todo com 8 a 40 categorias | Menos de 6 categorias (barra resolve) | Rótulo escrito em retângulo que não comporta o texto |
| 12.2 | Treemap aninhado com rótulo de grupo | Dois ou três níveis vistos de uma vez | Mais de 3 níveis | Rótulo do grupo sobreposto aos filhos |
| 12.3 | Treemap com detalhamento | Hierarquia profunda explorada por clique | Leitura estática em relatório impresso | Perder o contexto do todo ao entrar num ramo |
| 12.4 | Treemap com cor por variação | Área para tamanho e cor para desempenho | Métrica de cor sem ponto neutro claro | Usar cor sequencial para variação com sinal |
| 12.5 | Sunburst | Hierarquia de 2 ou 3 níveis com ênfase no centro | Comparação precisa entre fatias | Anéis externos parecendo maiores do que são |
| 12.6 | Sunburst com detalhamento | Explorar um ramo mantendo a forma radial | Muitos níveis com rótulos longos | Clique que re-enraíza sem trilha de volta |
| 12.7 | Icicle (partição retangular) | Hierarquia profunda com rótulos longos | Parte do todo de um nível só | Faixas estreitas demais para rótulo sem regra de ocultação |
| 12.8 | Circle packing | Estrutura de agrupamento com tamanho aproximado | Comparação de valores | Esperar que área de círculo seja lida com precisão |
| 12.9 | Treemap Voronoi | Peça editorial com formas orgânicas | Painel operacional nesta stack | Custo de algoritmo sem ganho de leitura |
| 12.10 | Árvore e dendrograma | Estrutura de pertencimento, organograma, taxonomia | Quando o valor é a mensagem | Ligações cruzadas por ordenação ruim |
| 12.11 | Árvore radial | Taxonomias grandes em espaço quadrado | Rótulos longos e leitura linear | Texto de cabeça para baixo na metade esquerda |
| 12.12 | Árvore de indicadores (driver tree) | Decompor uma meta ou projeção em alavancas | Relações que não são produto ou soma | Somar premissa e medição sem etiqueta |
| 12.13 | Perímetro aninhado | Total, endereçável e alcançável com participação | Grandezas com ordens de magnitude muito diferentes sem aviso | Desenhar áreas fora de escala para "caber" |

---

## 3. Modelos

### 12.1 Treemap simples (um nível)

**Descrição.** Retângulos lado a lado cuja área é proporcional ao valor de cada categoria, preenchendo um espaço fixo.

**Anatomia.** Retângulo por categoria; rótulo com nome e valor quando cabe; cor única ou por categoria; espaçamento entre retângulos; tooltip.

**Abordagem na stack.** `recharts-nativo` com conteúdo customizado. `Treemap data={itens} dataKey="valor" nameKey="nome" aspectRatio={4 / 3} isAnimationActive={false} content={<CelulaTreemap />}` com `Tooltip`. O `content` recebe `x, y, width, height, depth, index, name, value` (tipagem `TreemapNode`).

**Ponto delicado.**
- Rótulo condicionado ao tamanho: o exemplo oficial só escreve texto acima de cerca de 40 por 20 px. Para duas linhas (nome e valor) usar cerca de 64 por 36 px.
- `aspectRatio` padrão é a razão áurea; para faixas largas de painel, reduzir para retângulos mais próximos de quadrado.
- `nodeGap` (espaço entre irmãos) e `nodeInset` (recuo dos filhos) existem desde a 3.9 e valem na 3.10.1; o espaço entre retângulos no tema escuro fica melhor com a cor de `--surface-canvas` do que com borda.
- Valor zero ou negativo quebra a leitura por área: filtrar antes e listar à parte.

**Versões sugeridas.**
1. **Básico.** Comercial, receita reconhecida de 2026-T3 (R$ 4,6 mi) por produto: Gestão patrimonial, Crédito estruturado, Consultoria, Imobiliário, Previdência, Seguros, Câmbio, Outros.
2. **Com destaque.** O produto que mais cresceu contra o trimestre anterior com contorno em `--accent-amber` e anotação; os demais em `--chart-1` com opacidade 0,6.
3. **Caso limite: muitas categorias pequenas.** 36 executivos: os 12 maiores com rótulo, os demais sem texto e agrupados visualmente, com a lista completa no tooltip.

**Referências.**
- Catálogo: [Recharts, API Treemap](https://recharts.github.io/en-US/api/Treemap/): `aspectRatio`, `content`, `type`, `colorPanel`, `nestIndexContent`.
- Catálogo: [Recharts, exemplo de Treemap](https://recharts-recharts.mintlify.app/examples/treemap): conteúdo customizado com rótulo só acima de tamanho mínimo.
- Catálogo: [From Data to Viz, Treemap](https://www.data-to-viz.com/graph/treemap.html): priorizar o nível mais alto e não anotar mais de 3 níveis.
- Catálogo: [Data Visualisation Catalogue, Treemap](https://datavizcatalogue.com/methods/treemap.html): força em espaço, fraqueza em distinguir níveis.
- Praticante: [Ben Shneiderman, Treemaps for space constrained visualization of hierarchies](https://www.cs.umd.edu/hcil/treemap-history/): origem, slice and dice, squarified e ordered.
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): treemap é menos fácil de ler; barras e waffle como alternativa quando não há hierarquia.
- Portal de design: [Behance, UK's Public Sector Expenditure in One Treemap Chart](https://www.behance.net/gallery/193257421/UKs-Public-Sector-Expenditure-in-One-Treemap-Chart): gasto por área com destaque para um item novo.

---

### 12.2 Treemap aninhado com rótulo de grupo

**Descrição.** Retângulos de grupo que contêm os retângulos dos filhos, com o nome do grupo visível numa faixa de cabeçalho.

**Anatomia.** Retângulo de grupo; faixa de cabeçalho; retângulos filhos; cor por grupo com luminosidade por filho; recuo entre grupo e filhos; espaço entre irmãos.

**Abordagem na stack.** `recharts-custom` para dois níveis com rótulo de grupo em selo; `svg-puro` quando a faixa de cabeçalho for obrigatória. No Recharts, o `content` é chamado para cada nó com `depth`; para o grupo (`depth === 1`) desenhar só o contorno e um selo com o nome no canto superior esquerdo; para a folha, o retângulo com cor derivada do grupo. No SVG puro, implementar o algoritmo squarified em TypeScript e reservar `paddingTop` de 18 px em cada grupo antes de repartir os filhos.

**Ponto delicado.**
- `nodeInset` do Recharts recua os filhos por igual nos quatro lados; não reserva faixa só no topo. O selo do grupo fica sobre os filhos, então precisa de fundo (`--surface-overlay`) e de corte quando o grupo é pequeno.
- Cor por grupo: guardar o índice do ancestral de primeiro nível no próprio dado (`grupoIndex`) em vez de inferir no render.
- Mais de 3 níveis desenhados de uma vez vira mosaico ilegível.

**Versões sugeridas.**
1. **Básico.** Comercial, pipeline aberto de R$ 18,2 mi por executivo (Executivo A a H) e, dentro, por produto.
2. **Com destaque.** Grupo "Executivo C" com contorno forte e anotação "concentra 31% do pipeline".
3. **Caso denso e real.** Diretoria, custo de 2026-T3 por camada (mídia, pessoas da esteira, estrutura) e, dentro, por rubrica (cerca de 30 folhas).
4. **Caso limite: grupo minúsculo.** Rubrica de R$ 3 mil num total de R$ 1,86 mi: grupo sem selo, só contorno, com o nome no tooltip.

**Referências.**
- Catálogo: [Apache ECharts, Show Parent Labels](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/treemap-show-parent.ts): `upperLabel` por nível e bordas mais grossas no nível intermediário.
- Catálogo: [AG Charts, Treemap Series](https://www.ag-grid.com/charts/javascript/treemap-series/): cabeçalho de grupo, `group.padding`, `group.gap`, `tile.gap` e rótulo secundário.
- Catálogo: [nivo, TreeMap](https://nivo.rocks/treemap/): algoritmos squarify, binary, dice, slice e sliceDice; `innerPadding`, `outerPadding` e rótulo de pai.
- Praticante: [Ben Shneiderman, história do treemap](https://www.cs.umd.edu/hcil/treemap-history/): squarified melhora a proporção mas perde a ordem; ordered e strip equilibram.
- Portal de design: [Behance, busca "treemap"](https://www.behance.net/search/projects/treemap): página de busca para varredura de tratamentos de cabeçalho.

---

### 12.3 Treemap com detalhamento

**Descrição.** Treemap que mostra um nível por vez; clicar num grupo entra nele e uma trilha permite voltar.

**Anatomia.** Nível atual; trilha de navegação; retângulos clicáveis com cursor; indicação de que há filhos; total do nível no cabeçalho.

**Abordagem na stack.** `recharts-nativo`. `Treemap type="nest"` entra no nó clicado e desenha a trilha; `nestIndexContent` customiza os itens da trilha.

**Ponto delicado.**
- Ao entrar num ramo o leitor perde a proporção do ramo no todo: escrever "Busca paga · 34% do investimento" no cabeçalho do nível.
- O estado de navegação é interno do componente; se o filtro global mudar, o treemap precisa ser remontado (`key` com a assinatura do filtro) para não ficar preso num ramo que deixou de existir.
- Folha sem filhos não deve ter cursor de clique.

**Versões sugeridas.**
1. **Básico.** Marketing, investimento de 2026-08 (R$ 312 mil): plataforma, depois campanha, depois criativo.
2. **Com destaque.** Criativos com CPL qualificado acima do dobro da mediana marcados com ícone `TriangleAlert` no canto.
3. **Caso limite: ramo sem dado.** Campanha sem criativos cadastrados: ao entrar, estado vazio "sem criativos registrados" e botão de voltar, em vez de retângulo único gigante.

**Referências.**
- Catálogo: [Recharts, API Treemap](https://recharts.github.io/en-US/api/Treemap/): `type="nest"` e `nestIndexContent`.
- Catálogo: [Highcharts, Treemap (docs)](https://www.highcharts.com/docs/chart-and-series-types/treemap): `allowTraversingTree`, trilha automática e `levelIsConstant`.
- Catálogo: [From Data to Viz, Treemap](https://www.data-to-viz.com/graph/treemap.html): interatividade recomendada acima de 2 ou 3 níveis.
- Praticante: [Ben Shneiderman, história do treemap](https://www.cs.umd.edu/hcil/treemap-history/): treemap escala para dezenas de milhares de nós, com treino do leitor.
- Portal de design: não localizado nesta rodada.

---

### 12.4 Treemap com cor por variação

**Descrição.** A área codifica o tamanho (investimento, receita) e a cor codifica desempenho com sinal (variação, desvio contra meta), numa escala divergente.

**Anatomia.** Retângulos por área; cor divergente com neutro no zero; legenda da escala com os limites; rótulo com nome e variação.

**Abordagem na stack.** `recharts-custom`. `Treemap content={CelulaDivergente}` que converte a variação em cor por faixas (`--negative` forte, `--negative` suave, neutro, `--positive` suave, `--positive` forte), com limites simétricos.

**Ponto delicado.**
- Negativo vai para a cor, nunca para a área.
- Escala simétrica e com teto (por exemplo, de menos 50% a mais 50%); extremos acima do teto recebem a cor máxima e o rótulo real.
- Tamanho pequeno com variação enorme chama atenção desproporcional; considerar opacidade menor para retângulos abaixo de 1% do total.

**Versões sugeridas.**
1. **Básico.** Marketing, campanhas de 2026-08: área igual ao investimento, cor igual à variação do CPL qualificado contra 2026-07 (subir é ruim, então a escala é invertida e isso vai na legenda).
2. **Com destaque.** Somente as campanhas com piora acima de 30% recebem rótulo.
3. **Caso limite: sem base de comparação.** Campanha nova sem mês anterior: cor neutra hachurada e rótulo "nova".

**Referências.**
- Catálogo: [AG Charts, Treemap Series](https://www.ag-grid.com/charts/javascript/treemap-series/): `colorKey` e `colorScale` contínua ou em faixas com domínio fixo.
- Catálogo: [Highcharts, Treemap (docs)](https://www.highcharts.com/docs/chart-and-series-types/treemap): `colorAxis` com `colorValue` por ponto e agrupamento de nós pequenos (`cluster`).
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): treemap é menos fácil de ler, então a cor precisa de legenda explícita.
- Portal de design: não localizado nesta rodada.

---

### 12.5 Sunburst

**Descrição.** Anéis concêntricos: o centro é a raiz, cada anel é um nível e o ângulo de cada setor é proporcional ao valor.

**Anatomia.** Círculo ou furo central com total; anéis por nível; setores; rótulos radiais ou tangenciais; cor por ramo de primeiro nível; tooltip.

**Abordagem na stack.** `recharts-nativo`. `SunburstChart data={raiz} dataKey="valor" nameKey="nome" innerRadius={56} ringPadding={2} fill="var(--chart-1)" stroke="var(--surface-canvas)" textOptions={{ fill: 'var(--text-primary)', fontSize: 11 }}` com `Tooltip` como filho. Cor por nó no próprio dado (`fill`). O total do centro vai numa `div` absoluta sobre o gráfico.

**Ponto delicado.**
- Padrões conferidos na tipagem 3.10.1: `fill` `#333`, `stroke` `#FFF`, `innerRadius` 50, `ringPadding` 2, `padding` 2, `textOptions` em negrito. Traço branco e fundo cinza escuro não servem no tema escuro; sobrescrever sempre.
- A tipagem não expõe renderização customizada de setor nem regra de ocultar rótulo por tamanho: setores finos recebem texto sobreposto. Para controlar rótulo por ângulo mínimo, ir de `svg-puro` (partição do 12.7 com ângulo no lugar de x e raio no lugar de y).
- Anéis externos parecem maiores que internos com o mesmo valor, porque o perímetro cresce com o raio (From Data to Viz); anéis externos mais finos compensam em parte.
- Leitura angular é imprecisa (Few); não usar quando a pergunta é "quanto a mais".

**Versões sugeridas.**
1. **Básico.** Pré-vendas, 1.180 entradas de 2026-W37: origem no anel interno, subcanal no externo.
2. **Com destaque.** Ramo "Indicação" em `--accent-cyan` e os demais em neutro, com o percentual do ramo no centro.
3. **Caso limite: fatias finas.** 22 subcanais com vários abaixo de 1%: agrupar em "Outros subcanais" por origem antes de desenhar, porque o componente não esconde rótulo por ângulo.

**Referências.**
- Catálogo: [Recharts, API SunburstChart](https://recharts.github.io/en-US/api/SunburstChart/): `innerRadius`, `outerRadius`, `ringPadding`, `startAngle`, `endAngle`, `textOptions` e dado com `children`.
- Catálogo: [From Data to Viz, Sunburst](https://www.data-to-viz.com/graph/sunburst.html): dificuldade de rótulo, leitura de ângulo e distorção dos anéis externos.
- Catálogo: [Data Visualisation Catalogue, Sunburst Diagram](https://datavizcatalogue.com/methods/sunburst_diagram.html): hierarquia e parte do todo em anéis.
- Catálogo: [Apache ECharts, Sunburst Label Rotate](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sunburst-label-rotate.ts): rótulo radial, tangencial ou em ângulo fixo por nível.
- Catálogo: [AG Charts, Sunburst Series](https://www.ag-grid.com/charts/javascript/sunburst-series/): `sectorSpacing`, rótulo secundário e tamanho mínimo de fonte.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): comparações de área e ângulo são grosseiras.
- Praticante: [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): organizar do centro para fora e agrupar cores quentes e frias por lado.
- Portal de design: [Behance, SunBurst Chart in Tableau](https://www.behance.net/gallery/122211681/SunBurst-Chart-in-Tableau): amostra de sunburst em ferramenta de BI (sem descrição textual do visual).

---

### 12.6 Sunburst com detalhamento

**Descrição.** Sunburst em que clicar num setor faz dele a nova raiz; o centro vira botão de voltar.

**Anatomia.** Setor clicável; centro com nome do nó atual e total; trilha acima do gráfico; transição entre estados.

**Abordagem na stack.** `recharts-custom`. Guardar o caminho em estado (`useState<string[]>`); `onClick` do `SunburstChart` recebe o nó e empilha o caminho; o `data` passado é a subárvore do caminho atual; trilha e botão central em `html-tailwind` sobrepostos.

**Ponto delicado.**
- A troca de `data` remonta a animação; para evitar salto, desligar `isAnimationActive` ou aceitar a transição padrão.
- Folha clicada não deve re-enraizar (não há filhos).
- Filtro global alterado com o gráfico dentro de um ramo: validar se o caminho ainda existe e voltar à raiz se não existir.

**Versões sugeridas.**
1. **Básico.** Comercial, motivos de perda de 2026-T3: categoria, motivo, submotivo; clique entra na categoria.
2. **Com destaque.** Ao entrar em "Sem perfil", o submotivo dominante recebe rótulo e os demais só tooltip.
3. **Caso limite: alternância com treemap.** Mesmo dado alternável entre sunburst e treemap por botão, para quem precisa comparar tamanhos.

**Referências.**
- Catálogo: [Highcharts, Sunburst (docs)](https://www.highcharts.com/docs/chart-and-series-types/sunburst-series): `allowTraversingTree`, `levels` e `levelIsConstant` ao detalhar.
- Catálogo: [Highcharts, Sunburst (demo)](https://www.highcharts.com/demo/highcharts/sunburst): demo oficial (renderizado por JavaScript).
- Catálogo: [Apache ECharts, Transition between Treemap and Sunburst](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/treemap-sunburst-transition.ts): mesmo dado morfando entre as duas formas.
- Catálogo: [nivo, Sunburst](https://nivo.rocks/sunburst/): receitas de detalhamento e de métrica central em camada própria.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 12.7 Icicle (partição retangular)

**Descrição.** Faixas empilhadas por nível; a largura de cada retângulo é proporcional ao valor e os filhos ficam exatamente sob o pai. Na orientação lateral (raiz à esquerda) aceita rótulos longos. O flame graph é a mesma partição com outro uso.

**Anatomia.** Faixa por nível; retângulo por nó; alinhamento pai e filhos; rótulo com truncamento; orientação vertical ou lateral.

**Abordagem na stack.** `svg-puro`. Partição em TypeScript: para cada nó, `x0` e `x1` no intervalo do pai, repartidos pela soma cumulativa dos valores dos filhos; `y = profundidade * alturaFaixa`. Na orientação lateral, trocar os eixos. Rótulo só com largura de 48 px ou mais.

**Ponto delicado.**
- O valor do pai precisa ser a soma dos filhos; se o dado trouxer valor próprio no pai (itens sem filho), criar um filho "direto no grupo" para não sobrar espaço vazio.
- Ordenação dos filhos por valor decrescente dentro de cada pai, estável entre filtros.
- Clique para ampliar um ramo: reescalar `x` do ramo para a largura inteira, mantendo os ancestrais como faixa fina acima.

**Versões sugeridas.**
1. **Básico.** Comercial, 164 perdas de 2026-T3 em icicle lateral: categoria, motivo, submotivo.
2. **Com destaque.** Ramo "Concorrência" ampliado por clique, com o ancestral como faixa fina.
3. **Caso limite: rótulos longos.** Submotivos com mais de 40 caracteres: orientação lateral, truncamento com reticências e texto completo no `<title>`.

**Referências.**
- Catálogo: [nivo, Icicle](https://nivo.rocks/icicle/): orientação top, right, bottom, left; zoom por clique; navegação por teclado.
- Catálogo: [Apache ECharts, Flame graph](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/flame-graph.ts): série customizada com retângulo por nível e largura pelo valor.
- Praticante: não localizado nesta rodada.
- Portal de design: [Behance, busca "icicle chart"](https://www.behance.net/search/projects/icicle%20chart): varredura sem resultado específico de icicle, registrada como lacuna.

---

### 12.8 Circle packing

**Descrição.** Cada nó é um círculo, com os filhos dentro do pai e área aproximadamente proporcional ao valor. Mostra bem o agrupamento e mal o tamanho.

**Anatomia.** Círculo por nó; aninhamento por contenção; cor por profundidade ou por grupo; rótulo nos círculos grandes; ampliação por clique.

**Abordagem na stack.** `svg-puro`, com custo alto. O layout exato exige empacotar irmãos em cadeia frontal e calcular o menor círculo envolvente (algoritmo de Welzl) em TypeScript. Para até 2 níveis e cerca de 60 folhas, uma aproximação aceitável: ordenar por raio decrescente, posicionar cada círculo em espiral a partir do centro testando colisão, e calcular o raio do pai como o maior `distância + raio` dos filhos mais uma margem. Pré-calcular em `useMemo` com a assinatura do dado.

**Ponto delicado.**
- Raio proporcional à raiz quadrada do valor (área proporcional), nunca raio proporcional ao valor.
- A aproximação não é ótima em espaço; o Data Visualisation Catalogue já aponta muito espaço vazio no modelo, então não compensa gastar algoritmo exato num painel.
- Leitura de área de círculo é das mais imprecisas (Few, com o exemplo de círculos de valor de mercado desenhados pelo diâmetro); só usar quando a mensagem for o agrupamento.

**Versões sugeridas.**
1. **Básico.** Marketing, criativos agrupados por campanha, tamanho igual a leads de 2026-08.
2. **Com destaque.** Campanhas com CPL qualificado abaixo da mediana em `--positive` e as demais em neutro.
3. **Caso limite: um nível só.** Sem hierarquia, o circle packing vira gráfico de bolhas e perde o sentido; trocar para barras (From Data to Viz nota que um nível só equivale a um gráfico de barras com círculos).

**Referências.**
- Catálogo: [From Data to Viz, Circular Packing](https://www.data-to-viz.com/graph/circularpacking.html): remover os primeiros níveis melhora a leitura; um nível só vira barra.
- Catálogo: [Data Visualisation Catalogue, Circle Packing](https://datavizcatalogue.com/methods/circle_packing.html): mostra melhor a estrutura que o treemap, com baixa eficiência de espaço.
- Catálogo: [Vega, Circle Packing](https://vega.github.io/vega/examples/circle-packing/): transform `pack` com área proporcional e cor por profundidade.
- Catálogo: [nivo, CirclePacking](https://nivo.rocks/circle-packing/): `padding`, `leavesOnly`, zoom e `childColor`.
- Catálogo: [visx, sandbox pack](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-pack): referência de geometria em React.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): o erro de codificar valor pelo diâmetro.
- Portal de design: não localizado nesta rodada (a busca no Behance devolveu embalagem, não visualização).

---

### 12.9 Treemap Voronoi

**Descrição.** Treemap em que as células são polígonos de Voronoi ponderados dentro de um contorno (círculo ou polígono), com área proporcional ao valor.

**Anatomia.** Contorno externo; células poligonais; subcélulas por nível; rótulo no centróide.

**Abordagem na stack.** `svg-puro`, **não recomendado**. O layout exige Voronoi ponderado iterativo (diagrama de potência com ajuste de pesos até a área convergir), que é caro de implementar e de manter sem biblioteca.

**Ponto delicado.**
- Convergência não garantida em poucas iterações; áreas ficam aproximadas.
- O ganho é estético: a leitura de área de polígono irregular é pior que a de retângulo.
- Se aparecer como pedido, oferecer 12.2 e registrar o motivo.

**Versões sugeridas.**
1. **Básico (só para peça editorial).** Diretoria, capa de relatório anual com a receita por produto em contorno circular.
2. **Caso limite: painel operacional.** Mesma pergunta no painel usa 12.1, porque a leitura de área precisa ser comparável.

**Referências.**
- Catálogo: [RAWGraphs, Treemap (Voronoi), código](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/voronoitreemap): implementação de referência, categorias hierarquias e proporções.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): Voronoi listado em parte do todo.
- Praticante: não localizado nesta rodada.
- Portal de design: [Behance, busca "treemap"](https://www.behance.net/search/projects/treemap): inclui peça com Voronoi agrícola na listagem.

---

### 12.10 Árvore e dendrograma

**Descrição.** Nós ligados por arestas do pai para os filhos. Na árvore arrumada ("tidy") os nós ficam por profundidade; no dendrograma (cluster) todas as folhas ficam alinhadas no mesmo nível. O organograma é a mesma forma com cartões.

**Anatomia.** Nó (ponto ou cartão); aresta (reta, curva, diagonal ou ortogonal); rótulo; profundidade; destaque de ancestrais e descendentes; expandir e recolher.

**Abordagem na stack.** `svg-puro` para nós pontuais; `html-tailwind` com conectores SVG para organograma de cartões. Layout simples em TypeScript: posição da folha pela ordem, posição do pai pela média dos filhos (suficiente até algumas centenas de nós); aresta ortogonal `M x0,y0 V ym H x1 V y1` ou curva `M x0,y0 C x0,ym x1,ym x1,y1`.

**Ponto delicado.**
- A média dos filhos pode sobrepor subárvores largas; para árvores desbalanceadas, afastar subárvores vizinhas pelo contorno (ideia do algoritmo Reingold e Tilford).
- Recolher por padrão abaixo de certa profundidade e mostrar contagem de descendentes ocultos.
- Rótulos longos pedem orientação horizontal (raiz à esquerda), como recomenda From Data to Viz.

**Versões sugeridas.**
1. **Básico.** Diretoria, estrutura da área fictícia: Diretoria, Comercial, Pré-vendas, Marketing, com funções e quantidade de pessoas por função.
2. **Com destaque.** Organograma em cartões com capacidade contra teto em cada função (por exemplo, "Pré-vendas: 6 pessoas, 240 entradas por mês de teto, 226 em uso") e cor pelo uso.
3. **Caso limite: árvore desbalanceada.** Uma coordenação com 14 subordinados e outra com 2: subárvore larga recolhida por padrão com "14 funções" e expansão por clique.

**Referências.**
- Catálogo: [Vega, Tree Layout](https://vega.github.io/vega/examples/tree-layout/): alternância tidy e cluster e quatro estilos de aresta.
- Catálogo: [nivo, Tree](https://nivo.rocks/tree/): modo árvore ou dendrograma, `linkCurve` e destaque de ancestrais e descendentes.
- Catálogo: [Data Visualisation Catalogue, Tree Diagram](https://datavizcatalogue.com/methods/tree_diagram.html): raiz, ramos e folhas; organograma como método relacionado.
- Catálogo: [From Data to Viz, Dendrogram](https://www.data-to-viz.com/graph/dendrogram.html): horizontal para rótulos longos e circular para economizar espaço.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 12.11 Árvore radial

**Descrição.** A mesma árvore ou dendrograma com a raiz no centro e as folhas no perímetro. Cabe muitas folhas num quadrado.

**Anatomia.** Raiz central; anéis de profundidade implícitos; arestas radiais curvas; rótulos girados pelo ângulo; destaque de ramo.

**Abordagem na stack.** `svg-puro`. Mesmo layout do 12.10 com `angulo = ordemDaFolha / totalFolhas * 2π` e `raio = profundidade * passo`; converter para `x = r cos(a)` e `y = r sin(a)`.

**Ponto delicado.**
- Rótulo da metade esquerda precisa girar 180 graus e alinhar à direita, senão fica de cabeça para baixo.
- Folhas próximas ao fim do círculo encostam nas do começo: deixar uma abertura angular de alguns graus.
- Leitura de consulta é pior que a da árvore linear; usar quando a mensagem é a forma geral.

**Versões sugeridas.**
1. **Básico.** Marketing, taxonomia de 96 criativos por plataforma e campanha.
2. **Com destaque.** Hover num criativo acende o caminho até a raiz.
3. **Caso limite: rótulos longos demais.** Nomes de criativo acima de 30 caracteres: mostrar só código curto no perímetro e o nome no tooltip.

**Referências.**
- Catálogo: [Apache ECharts, Radial Tree](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/tree-radial.ts): `layout: 'radial'` e `initialTreeDepth: 3`.
- Catálogo: [RAWGraphs, Circular dendrogram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/circularDendrogram): implementação de referência.
- Catálogo: [From Data to Viz, Dendrogram](https://www.data-to-viz.com/graph/dendrogram.html): versão circular como uso eficiente de espaço.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): arranjo circular dificulta a orientação na consulta.
- Portal de design: não localizado nesta rodada.

---

### 12.12 Árvore de indicadores (driver tree)

**Descrição.** Um indicador de resultado decomposto em alavancas por soma ou produto (receita igual a ganhos vezes ticket; ganhos igual a oportunidades vezes taxa), com o valor e a faixa de cada nó.

**Anatomia.** Cartão por indicador com valor, unidade e faixa (p10 a p90); operador entre filhos (vezes, mais); etiqueta de procedência (medido, premissa, derivado, lacuna); conector; destaque da alavanca de maior sensibilidade.

**Abordagem na stack.** `html-tailwind` com conectores SVG. Layout da 12.10 na orientação lateral; cartão `rounded-lg border` com a etiqueta de procedência como selo colorido; faixa como microbarra com marca do valor central.

**Ponto delicado.**
- A faixa do pai não é a soma das faixas dos filhos; calcular por simulação ou regra declarada e escrever a regra.
- Etiqueta de procedência obrigatória em todo nó: premissa com cara de medição é o erro mais caro desse visual.
- Operadores precisam fechar numericamente com o valor central; validar no preparo e acusar nó que não fecha.

**Versões sugeridas.**
1. **Básico.** Diretoria, cenário do ano seguinte: Receita nova R$ 8,4 mi igual a Ganhos 42 vezes Ticket médio R$ 200 mil; Ganhos igual a Oportunidades 350 vezes Taxa de ganho 12%.
2. **Com destaque.** A alavanca com maior efeito na faixa (Taxa de ganho) em `--accent-amber`, com a pergunta "cada ponto de taxa vale R$ 0,7 mi".
3. **Caso denso e real.** Árvore de quatro níveis até a capacidade de Pré-vendas (entradas por mês contra o teto fictício de 240), com o nó de capacidade em `--negative` quando a demanda do cenário ultrapassa o teto.
4. **Caso limite: nó sem medição.** Ticket médio de um produto novo como premissa: selo "premissa", faixa larga e aviso de que o resultado herda a incerteza.

**Referências.**
- Catálogo: [Vega, Tree Layout](https://vega.github.io/vega/examples/tree-layout/): layout e estilos de aresta aplicáveis a árvores de cartões.
- Catálogo: [Data Visualisation Catalogue, Tree Diagram](https://datavizcatalogue.com/methods/tree_diagram.html): árvore como ferramenta de referência e de relação entre elementos.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 12.13 Perímetro aninhado

**Descrição.** Formas contidas umas nas outras (mercado total, endereçável, alcançável e participação), com área proporcional ao valor e a participação desenhada dentro do alcançável.

**Anatomia.** Forma externa (total); formas internas (endereçável, alcançável); forma da participação; rótulo com valor e percentual do nível acima; nota do perímetro (o que entra e o que fica fora).

**Abordagem na stack.** `html-tailwind` com quadrados alinhados no canto inferior esquerdo (lado proporcional à raiz quadrada do valor), ou `svg-puro` com círculos tangentes na base.

**Ponto delicado.**
- Ordens de grandeza muito diferentes (participação de 0,4% do total) deixam a forma interna invisível. Não desenhar fora de escala: mostrar um "zoom" lateral do nível alcançável com a participação, ligado por linhas finas ao quadro maior.
- A definição do perímetro muda a participação; o texto do perímetro fica colado ao visual.
- Mercado estimado com fonte pública versus base própria: etiqueta de procedência em cada nível.

**Versões sugeridas.**
1. **Básico.** Diretoria, perímetro fictício: mercado total R$ 120 bi, endereçável R$ 18 bi, alcançável R$ 2,4 bi, participação R$ 96 mi (4% do alcançável).
2. **Com destaque.** Painel lateral ampliado do alcançável com a participação e a meta de participação como contorno tracejado.
3. **Caso limite: perímetro alterado.** Mudança de perímetro (inclui outra região) aumenta o endereçável e reduz a participação; mostrar os dois perímetros lado a lado com a nota da mudança.

**Referências.**
- Catálogo: [From Data to Viz, Circular Packing](https://www.data-to-viz.com/graph/circularpacking.html): contenção como codificação de hierarquia.
- Catálogo: [Data Visualisation Catalogue, Circle Packing](https://datavizcatalogue.com/methods/circle_packing.html): contenção representa nível hierárquico.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): preferir quadrados alinhados a círculos quando a área precisa ser comparada.
- Portal de design: não localizado nesta rodada.

---

## 4. Modelos que moram melhor em outra família

| Modelo | Família sugerida | Motivo |
|---|---|---|
| Marimekko (mosaico com duas dimensões) | 26_mosaico-marimekko | Largura e altura codificam variáveis diferentes, não hierarquia |
| Rosca aninhada de dois anéis sem hierarquia real | 07_rosca-e-radial | Comparação de duas composições |
| Waffle e grade de unidades | 22_unidades-waffle-e-pictograma | Parte do todo sem aninhamento |
| Tabela em árvore com barras e recuo | 14_tabelas-visuais | Leitura de consulta, alternativa acessível desta família |
| Barras empilhadas 100% | 02_barras-horizontais ou 03_colunas-verticais | Um nível de composição |
| Bolhas soltas sem contenção | 09_dispersao-e-bolhas | Sem hierarquia |
| Árvore com arestas cruzadas entre ramos (grafo) | 27_rede-e-relacoes | Deixa de ser hierarquia |

---

## 5. Fontes consultadas

Abertas nesta pesquisa:
- https://www.data-to-viz.com/graph/treemap.html
- https://www.data-to-viz.com/graph/sunburst.html
- https://www.data-to-viz.com/graph/circularpacking.html
- https://www.data-to-viz.com/graph/dendrogram.html
- https://datavizcatalogue.com/methods/treemap.html
- https://datavizcatalogue.com/methods/sunburst_diagram.html
- https://datavizcatalogue.com/methods/circle_packing.html
- https://datavizcatalogue.com/methods/tree_diagram.html
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- https://recharts.github.io/en-US/api/Treemap/
- https://recharts.github.io/en-US/api/SunburstChart/
- https://recharts-recharts.mintlify.app/examples/treemap
- https://nivo.rocks/components/
- https://nivo.rocks/treemap/
- https://nivo.rocks/sunburst/
- https://nivo.rocks/icicle/
- https://nivo.rocks/circle-packing/
- https://nivo.rocks/tree/
- https://www.ag-grid.com/charts/javascript/treemap-series/
- https://www.ag-grid.com/charts/javascript/sunburst-series/
- https://www.highcharts.com/docs/chart-and-series-types/treemap
- https://www.highcharts.com/docs/chart-and-series-types/sunburst-series
- https://www.highcharts.com/demo/highcharts/sunburst (página abriu, demo renderizada por JavaScript)
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/treemap-show-parent.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/sunburst-label-rotate.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/tree-radial.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/flame-graph.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/treemap-sunburst-transition.ts
- https://vega.github.io/vega/examples/
- https://vega.github.io/vega/examples/circle-packing/
- https://vega.github.io/vega/examples/tree-layout/
- https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/voronoitreemap
- https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/circularDendrogram
- https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-treemap
- https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-pack
- https://www.cs.umd.edu/hcil/treemap-history/
- https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf
- https://www.datawrapper.de/blog/chart-types-guide
- https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/
- https://www.behance.net/search/projects/treemap
- https://www.behance.net/search/projects/icicle%20chart
- https://www.behance.net/search/projects/sunburst%20chart
- https://www.behance.net/gallery/193257421/UKs-Public-Sector-Expenditure-in-One-Treemap-Chart
- https://www.behance.net/gallery/122211681/SunBurst-Chart-in-Tableau
- Tipagem local: `app/node_modules/recharts/types/chart/Treemap.d.ts` e `SunburstChart.d.ts` (Recharts 3.10.1)
