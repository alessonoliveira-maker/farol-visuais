# KPI com régua de meta, ritmo ou teto

## O que é

Um número acompanhado de uma régua horizontal que julga antes do número. A régua tem sempre as mesmas peças: um trilho que representa o denominador (a meta a perseguir ou o teto a não passar), um preenchimento com o realizado e marcas verticais para as referências. Lê-se da esquerda para a direita: quanto do trilho já foi preenchido, onde está a marca da meta ou do teto, e se o preenchimento passou dela. Três leituras cabem no modelo e mudam a polaridade: barra até a meta (quanto já foi), marcador de ritmo (se o tempo decorrido chega) e trilho de capacidade (chegar a 100% é ruim, e o excesso continua desenhado). Absorve barra de progresso, bullet embutido, trilho de capacidade, ritmo até a meta e anel; o anel fica sem versão própria, porque ângulo compara mal e o progresso protagonista mora na família 13.

## Quando usar

- Meta acumulada dentro de um período fechado, como a receita do trimestre: um cartão, um par realizado e meta.
- Meta com prazo e acumulação perto de linear, em que importa saber se o ritmo atual chega: o cartão precisa do calendário de dias úteis, não só da data.
- Uso contra teto operacional, como fila da pré-vendas ou carteira de vendas, em que chegar a 100% é ruim.
- Realizado contra referência e faixas qualitativas declaradas (com o corte escrito), para público que já lê bullet.
- Várias réguas empilhadas na mesma escala relativa, como percentual do próprio teto: até cerca de 8 linhas num cartão de 400 px de altura; acima disso, tabela visual.
- Tira de 3 a 4 cartões com a mesma geometria de régua, para os números e as marcas alinharem na horizontal.

## Quando evitar

- Métrica sem meta nem teto declarados: use o KPI simples com variação (modelo 01).
- Meta sazonal ou com degraus: a projeção linear mente; use a curva de meta acumulada (famílias 13 ou 05).
- O arco ou a barra é o protagonista da peça: vá para progresso, meta e gauge (família 13).
- Vários anéis comparados entre si: troque por barras com base comum, porque ângulo compara mal.
- Diretoria sem legenda diante de bullet: escreva atual contra anterior e meta (modelo 01).
- Teto de planilha exibido sem procedência: declare PREMISSA antes de desenhar o estouro, senão o cartão inventa autoridade.

## Anatomia

1. **Rótulo e período:** nome da métrica com o período em `text-xs font-medium text-text-secondary`; data da fotografia por `formatDate` ou mês por `formatMonthShort`, em `text-text-muted`.
2. **Número:** `kpi-number text-3xl leading-none font-semibold` com `formatCurrencyCompact`. Sem coleta, o ícone `Unplug` e `formatUnavailable()` no lugar, nunca zero.
3. **Linha de veredito:** abaixo do número, 12 px. Semântica só quando há julgamento com base: `text-positive` ou `text-negative` com ícone (`ArrowUpRight`, `TrendingUp`, `TrendingDown`) e a base escrita em `text-text-muted` ("R$ 74,0 mil atrás do ritmo de R$ 419,0 mil"). Sem ritmo declarado, a barra não julga e a linha fica neutra.
4. **Trilho:** 8 px de altura em `--surface-sunken`, raio cheio. Não use `--surface-overlay`: no tema claro ele é o mesmo branco do cartão e o trilho some.
5. **Preenchimento:** `--chart-1`, largura por regra de três em função pura. Mede 10,90:1 contra o trilho no escuro e 5,20:1 no claro.
6. **Marcas de referência:** traço de 2 px em `--text-muted` com halo de 5 px em `--surface-raised`, que corta o preenchimento em vez de sumir nele. Meta e teto em traço cheio da altura inteira; ritmo esperado em tracejado `3 2`, 2 px mais curto em cada ponta. As formas se distinguem sem cor, e cada marca tem rótulo com nome e valor: ritmo com os dias úteis e meta da tira com o valor, em 11 px acima do trilho; teto como "100% do teto" no topo da coluna comum; e a meta da v2 sob a ponta do trilho, onde não disputa espaço com o rótulo do ritmo.
7. **Faixas do bullet:** conforto, atenção e estouro em `--seq-1`, `--seq-2` e `--seq-3`, intensidade crescente de um tom só, com vão de 2 px em `--surface-raised` (COR-5). O corte de atenção vem do dado e é escrito no rodapé.
8. **Excesso:** nunca some. No trilho de meta, a zona de excesso é reservada (o trilho vai a 125% e a meta fica em 80% da largura) e o excedente sai em hachura de `--chart-1`. No trilho de capacidade, o excedente sai em hachura de `--negative` sobre fundo `--surface-raised` (5,50:1 no escuro, 6,36:1 no claro), porque sobre `--seq-3` a cor mediria só 2,40:1.
9. **Rodapé:** o par realizado e meta em 12 px com números em `text-text-secondary` e o percentual inteiro em `kpi-number text-sm font-semibold`. Abaixo da meta o percentual para em 99%: 99,6% escrito como 100% promete o que não houve.
10. **Procedência pontual:** só a projeção, que é número derivado dentro de um cartão de números medidos, leva a etiqueta DERIVADO em `text-prov-derivado` com borda do mesmo token e sem fundo tingido (6,47:1 no escuro, 6,18:1 no claro, pela fórmula da WCAG sobre `tokens.css` em 2026-09-14). A etiqueta tem 11 px, não os 10 px do `ProvenanceBadge`, por causa da TIP-2. Origem de teto em linha de bullet vai escrita em texto ("teto premissa de 160 entradas"), sem selo por linha.
11. **Ausência:** meta ou teto não declarados viram trilho vazado em contorno tracejado `--text-muted`, sem marca e sem percentual, com a frase escrita. Zero medido é trilho vazio com a marca da meta, sem cor de alerta.

## Versões

- `v1_receita-do-trimestre-ate-a-meta`: barra de progresso em HTML com `role="progressbar"` e `aria-valuenow`, `aria-valuemin`, `aria-valuemax`; rodapé com R$ 412,4 mil de R$ 600,0 mil e 69%; excedente escrito em texto com o preenchimento clampado; nenhuma cor semântica abaixo da meta, porque sem ritmo não há julgamento. Previews: [escuro](./v1_receita-do-trimestre-ate-a-meta/preview.svg) e [claro](./v1_receita-do-trimestre-ate-a-meta/preview-claro.svg).
- `v2_receita-com-ritmo-esperado-e-veredito`: régua em SVG com meta em traço cheio e ritmo esperado em tracejado curto, 44 de 63 dias úteis, veredito "R$ 74,0 mil atrás do ritmo de R$ 419,0 mil" com ícone e base, projeção linear com etiqueta DERIVADO e declarada como piso, e o primeiro dia sem ritmo medido em vez de divisão por zero. Previews: [escuro](./v2_receita-com-ritmo-esperado-e-veredito/preview.svg) e [claro](./v2_receita-com-ritmo-esperado-e-veredito/preview-claro.svg).
- `v3_filas-da-pre-vendas-contra-o-teto`: cinco bullets em SVG na mesma escala relativa (percentual do próprio teto, de 0 a 130%), faixas de conforto, atenção e estouro em `--seq-1` a `--seq-3`, teto alinhado nas cinco réguas, estouro em hachura além do teto sem clamp ("186 de 160, estouro de 26"), origem medido ou premissa escrita em cada linha e o corte de 85% no rodapé. Previews: [escuro](./v3_filas-da-pre-vendas-contra-o-teto/preview.svg) e [claro](./v3_filas-da-pre-vendas-contra-o-teto/preview-claro.svg).
- `v4_metas-com-estouro-zero-e-sem-meta`: tira de três cartões com a mesma geometria: 118% com zona de excesso reservada e "18% acima da meta", zero sem dia útil fechado sem cor de alerta, e executivo novo sem meta com trilho vazado e a frase escrita. Previews: [escuro](./v4_metas-com-estouro-zero-e-sem-meta/preview.svg) e [claro](./v4_metas-com-estouro-zero-e-sem-meta/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`. As versões 1, 2 e 4 são o próprio cartão (moldura `stage`): vão direto na grade de KPIs, numa célula com altura (`h-44` para a v1, `h-80` para a v2). A v3 vai dentro de um `VisualCard`, com `h-72` ou mais no corpo.
2. Passe o dado real pela prop `data`. Para a v2, o calendário vem pronto da página: `businessDaysElapsed` e `businessDaysTotal` saem do calendário da praça, não de dias corridos, e o componente não calcula feriado.
3. Na v3, passe `attentionFrom` a partir da configuração da métrica no registry (o corte é decisão de negócio, não de estilo) e `month` com o mês da fotografia. A etiqueta de procedência do `VisualCard` fica com o elo mais fraco (PREMISSA quando algum teto é premissa); a origem de cada teto continua escrita na linha.
4. Na v2, a etiqueta DERIVADO é da projeção, não do cartão. Se a métrica do cartão inteiro vier do registry com procedência própria, mantenha as duas: a do cartão no topo e a da projeção na linha dela.
5. Meta sazonal: não use a v2. Troque a projeção linear pela curva histórica do mesmo período (família 13 ou 05), porque a linear é piso e em vendas quase sempre pessimista.
6. Os estados vazio (v3 e v4, com `role="status"`), indisponível e sem meta já estão inline; ao colar, troque-os por `EmptyState` e `UnavailableState` mantendo o texto, e rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, conferindo os dois temas e 390 px de largura (a v4 empilha os cartões por container query abaixo de 672 px).

## Referências

- [Few, Bullet Graph Design Specification, em PDF](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Os cinco componentes, as faixas em intensidades de um só tom e a distinção entre medida em destaque e medidas comparativas (v2 e v3).
- [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Medida principal, medida comparativa e faixas qualitativas, e que o mesmo desenho serve para meta e para teto.
- [Data Viz Project, Bullet Graph](https://datavizproject.com/data-type/bullet-graph/). A genealogia: variação de barra que substitui o medidor de painel.
- [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). A crítica aos medidores e a regra de intensidades de um só tom.
- [Clearly and Simply, An Alternative Design of Bullet Graphs](https://www.clearlyandsimply.com/clearly_and_simply/2017/05/an-alternative-design-of-bullet-graphs.html). A crítica de que as faixas roubam atenção da barra, motivo do preenchimento mais estreito que as faixas na v3.
- [IBCS, avaliação do bullet graph](https://www.ibcs.com/resource/ibcs-evaluation-bullet-graphs/). As correções propostas: normalizar a meta e destacar a variação, o que a v3 faz com o percentual do próprio teto.
- [Nightingale, Why I Stopped Using Bullet Graphs](https://nightingaledvs.com/why-i-stopped-using-bullet-graphs-and-what-i-now-use-instead/). A curva de aprendizado e a leitura lenta, argumento para escrever o veredito em texto.
- [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). O custo de muitas réguas diferentes na mesma tela, motivo da escala comum.
- [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). O veredito em palavras ainda é necessário com a barra desenhada.
- [SWD, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Projeção tratada como leitura incerta, não com a autoridade do realizado.
- [Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf). O medidor que só deixa estimar o valor, sem referência, e o espaço gasto para dizer pouco.
- [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars). O arranjo métrica, barra e texto de fração (v1).
- [Tremor, ProgressCircle](https://www.tremor.so/docs/visualizations/progress-circle). O corte calado acima do máximo com `Math.min`, que as versões daqui escrevem em vez de esconder.
- [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/). O anel com trilho e o uso comparativo que este modelo não recomenda.
- [Figma Community, Dashboard UI Kits Series](https://www.figma.com/community/file/1347448012996114787/dashboard-ui-kits-series). Alturas e raios de trilho usados em kits de painel.
- [Dribbble, Dashboard Card Stats Metrics em TailwindCSS](https://dribbble.com/shots/15261147-Dashboard-Card-Stats-Metrics-TailwindCSS-Component). Trilho e preenchimento em componente utilitário.
- Farol: `app/src/components/visuals/ProgressGoal.tsx` (linha de ritmo, meta ausente não é meta zero) e `app/src/components/visuals/BulletChart.tsx` (fonte do teto ao lado, ocupação acima de 100% passa da faixa). As versões daqui corrigem o que a régua do contrato reprova nesses dois: trilho em `--surface-overlay` que some no tema claro, preenchimento pintado em cor semântica, faixa com `opacity`, marca de ritmo sem forma própria e texto de 10 px.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-15; as quatro versões foram aprovadas, sem nenhum bloqueante._

- `v1_receita-do-trimestre-ate-a-meta`: o trilho usa `--surface-sunken`, e não o `--surface-overlay` que o catálogo pedia; a troca estava justificada no `notes` do `meta.json` (no tema claro o overlay é o mesmo branco do cartão). Resolvido na origem em 2026-09-29: a tabela 17.2 do `CONTRATO.md` deixou de listar `--surface-overlay` como trilho de barra e passou a proibi-lo como trilho, moldura e faixa, então a versão e o catálogo pedem o mesmo token.
- `v1_receita-do-trimestre-ate-a-meta`: o `data.ts` traz só o caminho feliz (69% da meta). Os três casos difíceis que o código trata (realizado nulo, meta nula e acima da meta) só aparecem desenhados na v4, o que é uma divisão de trabalho declarada no `notes`, não um defeito.
- `v2_receita-com-ritmo-esperado-e-veredito`: a etiqueta DERIVADO é desenhada dentro do Chart, como o catálogo manda, enquanto a ANO-6 reserva procedência ao `VisualCard`. O passo 4 de "Como colar no Farol" já resolve a ambiguidade; vale levar o conflito ao catálogo.
- `v2_receita-com-ritmo-esperado-e-veredito` e `v4_metas-com-estouro-zero-e-sem-meta`: as duas subiram o canvas acima do preset sugerido pelo catálogo (400 x 330 contra `kpi-alto`; 960 x 280 contra `faixa`), cada uma com a razão escrita no `notes`.
- `v3_filas-da-pre-vendas-contra-o-teto`: a marca do teto usa `--text-muted` no lugar do `--line-strong` do catálogo, porque `--line-strong` mede 1,8:1 e sumiria sobre as faixas; quem garante a leitura é o halo de 5 px em `--surface-raised` atrás do traço.
- `v3_filas-da-pre-vendas-contra-o-teto`: no tema escuro a faixa de estouro (`--seq-3`) é a mais clara da régua e aparece inteira mesmo na fila sem estouro, então o bloco à direita do teto pede um instante de atenção antes de ser lido como faixa, e não como dado; a barra se separa pela altura menor, pela cor de destaque e pelo valor escrito ao lado.
