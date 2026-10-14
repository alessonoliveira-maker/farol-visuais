# Bullet chart

## O que é

O modelo central da família e a recomendação do Farol no lugar do gauge. Cinco peças, na especificação de Stephen Few: rótulo, escala linear, barra principal com cerca de um terço da espessura do contêiner, traço perpendicular da meta e de duas a cinco faixas qualitativas por intensidade de um único tom. Em Recharts, `BarChart` com `layout="vertical"` (ou orientação padrão na versão em coluna), faixas como `ReferenceArea` pintadas antes da barra e meta como `ReferenceLine` pintada depois dela, sempre em `extendDomain` para a meta não sumir. A polaridade da métrica decide a ordem das faixas, e empilhar vários bullets com rótulos alinhados é o que faz o formato ganhar do mostrador.

## Quando usar

- Medida, meta e régua qualitativa declarada no mesmo espaço, o caso geral da família.
- Painel de 3 a 8 métricas ou pessoas com metas diferentes, normalizadas em percentual da meta.
- Métrica de custo com polaridade invertida, como CPL, em que menos é melhor.
- Coluna estreita e alta com 2 a 5 itens de rótulo curto, na versão vertical.
- Qualquer pedido de gauge em que a leitura precisa ser precisa ou comparada.

## Quando evitar

- Faixas sem dono nem data de definição: sem régua acordada, use a barra de progresso (13/01).
- Público que nunca viu o formato e nenhuma anotação de primeira leitura no painel.
- Escala compartilhada entre métricas de unidades diferentes: normalize ou dê escala por linha.
- Mais de 5 faixas qualitativas, ou faixas pintadas em semáforo de matiz.
- Dezenas de linhas numa tabela: é bullet em célula (14/01).
- Rótulo longo na versão vertical, que obrigaria a girar o texto: volte para a horizontal.

## Anatomia

1. **Rótulo:** nome da medida, à esquerda na horizontal ou acima na vertical, em `text-text-secondary` (12 px) e `text-text-primary` (700) quando a linha precisa de destaque, nunca por cor sozinha.
2. **Escala linear:** eixo quantitativo com `domain={[0, top]}`, sempre a partir do zero (EIX-1). Na horizontal fica embaixo com tiques discretos por `formatCurrencyAxis`; na vertical pode ser dispensada quando o valor já está escrito em cada marca.
3. **Faixas qualitativas:** de duas a cinco, como `ReferenceArea` contíguas em `fill="var(--surface-sunken)"` com `fillOpacity` crescente (a `ANO-4` proíbe `--surface-overlay` aqui: no tema claro ele é o branco do cartão e a faixa deixa de existir), a mais clara na pior faixa (COR-1: um tom só, nunca semáforo de matiz). Pintadas **antes** da barra no JSX. Cada faixa tem nome próprio (Ruim, Aceitável, Boa, ou o equivalente da polaridade), escrito **fora** da área pintada, na margem reservada acima ou ao lado do gráfico, nunca em cima do preenchimento: colocar texto sobre a faixa exige halo (ROT-7) e o contraste mínimo de 4,5:1 sobre um fundo de baixa luminância nem sempre se sustenta sem ele.
4. **Barra principal:** `Bar` com espessura de cerca de um terço do espaço da categoria (`maxBarSize` derivado da altura conhecida do corpo, nunca deixado ao Recharts, ESP-2 e ESP-6), preenchida em `--chart-1`, com o valor escrito na ponta livre (ROT-2) e halo porque a ponta sempre cai dentro de alguma faixa.
5. **Meta:** `ReferenceLine` sólida em `--text-primary`, perpendicular à barra, com `ifOverflow="extendDomain"` (armadilha 19 do acabamento: sem isso a meta some quando está longe do valor). É a peça que distingue a medida da faixa **por forma**, não por cor: traço fino contra área plana, então a leitura funciona em qualquer condição de contraste de matiz.
6. **Ordem de pintura no JSX:** faixas, depois a barra, só então a meta. Trocar a ordem inverte a regra de Few (comparativa sempre atrás da principal) sem aviso no código.

## Versões

- [`v1_receita-com-faixas-de-estado`](./v1_receita-com-faixas-de-estado/): bullet horizontal único, receita do trimestre contra a régua ruim, aceitável e boa; nomes de faixa acima da área pintada e meta como traço com rótulo abaixo da barra, ambos com halo. Previews: [escuro](./v1_receita-com-faixas-de-estado/preview.svg) e [claro](./v1_receita-com-faixas-de-estado/preview-claro.svg).
- [`v2_cpl-com-polaridade-invertida`](./v2_cpl-com-polaridade-invertida/): mesma peça com a régua invertida (faixa boa perto do zero, porque menor CPL é melhor), anotação da data da revisão que definiu as faixas e variação contra o mês anterior com sinal tipográfico, ícone e cor semântica pela polaridade do custo. Previews: [escuro](./v2_cpl-com-polaridade-invertida/preview.svg) e [claro](./v2_cpl-com-polaridade-invertida/preview-claro.svg).
- [`v3_painel-de-metas-comerciais`](./v3_painel-de-metas-comerciais/): painel de cinco metas comerciais de unidades diferentes (moeda, contagem, taxa), todas normalizadas em percentual da própria meta para compartilharem a mesma escala e as mesmas faixas; a métrica abaixo do aceitável leva ícone e peso no rótulo, nunca só cor. Previews: [escuro](./v3_painel-de-metas-comerciais/preview.svg) e [claro](./v3_painel-de-metas-comerciais/preview-claro.svg).
- [`v4_orcamento-por-plataforma-em-coluna`](./v4_orcamento-por-plataforma-em-coluna/): bullet vertical, orçamento de mídia por plataforma contra o planejado, com uma faixa de conforto única atravessando as colunas, a plataforma sem veiculação em trilho tracejado com `formatUnavailable()` e a coluna acima do conforto com o excedente escrito ao lado do valor real. Previews: [escuro](./v4_orcamento-por-plataforma-em-coluna/preview.svg) e [claro](./v4_orcamento-por-plataforma-em-coluna/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue `data` à seleção real da página; o default de cada versão fica só como amostra.
2. Nas versões horizontais (v1, v2), a moldura é `card`: embrulhe em `VisualCard` com altura no corpo (`h-40` a `h-56` conforme o canvas `faixa`). Na v3 (painel), dê altura suficiente para as cinco linhas não espremerem abaixo do piso de 12 px da ESP-2. Na v4 (coluna), a mesma lógica vale na largura por coluna.
3. As faixas e a meta são decisão de negócio, não de estilo: passe os limites (`bands`, `acceptableFrom`/`acceptableTo`, `comfortFrom`/`comfortTo`) a partir da régua acordada com o dono da métrica, nunca hardcoded fora do dado.
4. Confira a polaridade antes de reusar a v1 para uma métrica de custo: sem inverter a ordem das faixas (v2), a leitura "mais é melhor" fica implícita e engana.
5. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e abra a página nos dois temas e a 390 px de largura: o rótulo de faixa e o de meta, por saírem da margem reservada, são os primeiros a cortar num cartão estreito demais.

## Referências

- [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): os cinco componentes, o terço de espessura da barra, as intensidades por número de faixas e o desenho para valores negativos e de polaridade invertida.
- [Stephen Few, Our Irresistible Fascination with All Things Circular](http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): a comparação lado a lado de vários gauges contra o mesmo espaço em bullets, o argumento por trás do painel (v3).
- [Stephen Few, bullet graphs revisited](https://www.perceptualedge.com/blog/?p=217): intensidades em vez de matizes nas faixas e a escala invertida para métricas do tipo não exceder (v2).
- [Storytelling with Data, bullet graphs galore](https://www.storytellingwithdata.com/blog/2021/12/9/bullet-graphs-galore): versões simplificadas sem faixa de fundo, referência para não exagerar na quantidade de faixas.
- [Data Visualisation Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html): a nomenclatura das três partes, o teto de cinco faixas e a regra de a medida comparativa ser sempre perpendicular à orientação (base da v4 vertical).
- [Data Viz Project, Bullet Graph](https://datavizproject.com/data-type/bullet-graph/): a ficha de funções (comparação e intervalo) e a família de origem, a barra.
- [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart): estender o eixo além do maior valor e as opções de ordenação e agrupamento de linhas do painel.
- [Tremor, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars): `CategoryBar` aceitando valor acima de 100 e `MarkerBar` com faixa, referência para o excedente da v4.
- [Recharts, Bar](https://recharts.github.io/en-US/api/Bar/): a prop `background`, avaliada e descartada em favor de um `shape` próprio para desenhar o trilho tracejado da plataforma sem veiculação (v4).
- [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard): progresso contra cota por executivo, o mesmo caso de uso da v3.
- [Estudo da família](../../_estudo/familias/13_progresso-meta-e-gauge.md): anatomia completa, pontos delicados e versões sugeridas dos modelos 4, 5 e 6 (bullet horizontal, painel e vertical), fundidos neste modelo único.
- [Catálogo da família](../../_estudo/catalogo/13_progresso-meta-e-gauge.json): caso de uso, o que cada versão demonstra e canvas sugerido.
- [CONTRATO.md](../../CONTRATO.md): seção 17, em especial ROT-2, ROT-7, COR-8 e ESP-2/ESP-6, usadas para a marca de meta, o halo e a espessura da barra.
- [Padrão de acabamento, estudo](../../_estudo/00_acabamento.md): M4 e M5 sobre a preferência pelo bullet graph e a armadilha 19 sobre a meta que some com `discard`.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-19, contra o CHECKLIST_REVISAO.md, com `npm run check` sem erro nas quatro versões. O bloqueante da `v4` fica no parecer em `_render/.qa/revisao/`; aqui só o que não reprova._

- `v1_receita-com-faixas-de-estado`: a barra sai com 28 px no preview, acima do teto de 24 px que a ESP-2 dá para cartão; nada corta, é só marca mais grossa que a régua.
- `v1_receita-com-faixas-de-estado`: o traço da meta é `--text-primary` sólido de 3 px, e a tabela 17.2 reserva para referência o `--text-muted` tracejado. A escolha vem da especificação de Few (a meta se distingue por forma) e está declarada no `meta.json`, mas continua fora da régua do Farol.
- `v1_receita-com-faixas-de-estado`: o último tique do eixo é o próprio topo do domínio, R$ 6,1 mi, fora do intervalo redondo que a EIX-4 pede. O mesmo vale para o R$ 663 da `v2`.
- `v1_receita-com-faixas-de-estado`: o `meta.json` troca dois dos cinco itens que o catálogo lista (o `barSize` de 34% da altura e a faixa mais clara na zona ruim). Os dois estão no desenho, só não estão escritos na ficha.
- `v2_cpl-com-polaridade-invertida`: a intensidade das faixas cresce com o eixo, não com a qualidade (Boa é a mais clara, Ruim a mais escura), o inverso da anatomia deste README, que pede a mais clara na pior faixa. Como os três nomes vão impressos acima das faixas, a leitura não depende do tom; mas um leitor que veja a `v1` e a `v2` lado a lado recebe sentidos opostos do mesmo recurso.
- `v2_cpl-com-polaridade-invertida`: o render mediu o `preview.svg` isolado acima de 0,5% da página, todo na linha de leitura, que é texto em HTML com ícone. É aviso de render, e o `npm run check` sai sem erro.
- `v3_painel-de-metas-comerciais`: a `ReferenceLine` de 100% não tem rótulo com nome e valor (ANO-2 e ANO-3) e nem `ifOverflow="extendDomain"`. O domínio mínimo de 130 esconde o efeito da segunda falta, mas o traço branco mais forte do desenho fica sem nome na tela.
- `v3_painel-de-metas-comerciais`: com o eixo de valor oculto, nenhum número na tela nomeia a escala em percentual da própria meta; quem carrega a leitura são os nomes Abaixo, Aceitável e Acima, e os 80% e 100% só existem na frase acessível.
- `v3_painel-de-metas-comerciais`: "Taxa de conversão de proposta" para a cerca de 1,5 px da faixa pintada. O tique de nome desenha em `x=0` com `nowrap` e sem `tickMargin`, então um nome um pouco maior entra na área do gráfico sem aviso.
- `v3_painel-de-metas-comerciais`: o `meta.json` promete a unidade original "no rótulo e na dica", e a versão não tem `ChartTooltip`. Pela DIC-1 a dica é dispensável, já que o valor está escrito; então o que sobra é a ficha prometendo o que o código não faz.
- `v3_painel-de-metas-comerciais` e `v4_orcamento-por-plataforma-em-coluna`: nenhuma das duas trata `data` vazio com o bloco `role="status"` da EST-1, que 205 das 244 versões do catálogo já trazem. Nas `v1` e `v2` o caso muda de forma, porque o dado é um objeto só.
- `v4_orcamento-por-plataforma-em-coluna`: a plataforma sem veiculação recebe `percent = domainMax`, então o trilho tracejado é a peça mais alta do desenho. Está vazio e escrito, como a EST-2 pede, mas fica com a ponta da leitura (ver Pendências conhecidas).

_Itens acrescentados por nova leitura independente em 2026-09-18, com `npm run check` em `0 com erro` e nenhum bloqueante nas quatro versões._

- `v1_receita-com-faixas-de-estado`: o rótulo "meta R$ 5,0 mi" cai na mesma faixa horizontal dos tiques, entre "R$ 4,0 mi" e "R$ 6,1 mi". A guarda de colisão passa e as duas tintas ficam longe uma da outra, mas a anotação pode ser lida como mais um tique do eixo.
- `v2_cpl-com-polaridade-invertida`: a frase acessível chama os R$ 350 de "teto aceitável", enquanto na régua desenhada os R$ 350 são o fim da faixa Boa e o começo da Aceitável. O número é o mesmo; o nome dado a ele na frase e na tela não é.
- `v4_orcamento-por-plataforma-em-coluna`: a `ReferenceLine` de 100% não traz `ifOverflow="extendDomain"` (ANO-3). Como o domínio nasce de `comfortTo` vezes 1,05, a linha nunca sai da escala com este dado, e a falta só apareceria numa régua cujo conforto terminasse abaixo de 100%.
- `v4_orcamento-por-plataforma-em-coluna`: quando a ponta da coluna chega perto da linha de meta, o rótulo sobe para o outro lado dela (caso de "Busca", em 96% do planejado). A coluna continua abaixo da linha, mas o número fica acima, e o desvio de posição é maior que o das colunas vizinhas.
- `v4_orcamento-por-plataforma-em-coluna`: "+3 pp de 105%" nomeia a base como a NUM-4 pede, mas a preposição deixa a leitura entre "3 pontos acima de 105%" e "3 pontos de 105%".
- Modelo: até 2026-09-29 o item 3 da Anatomia mandava pintar a faixa em `var(--surface-overlay)`, token que a ANO-4 proíbe justamente em `ReferenceArea` porque no tema claro ele é o branco do cartão, enquanto as quatro versões já usavam `--surface-sunken`. Quem divergia era o texto do README, e foi ele que mudou: a Anatomia passou a pedir `--surface-sunken`.

### Correção de 2026-09-18 (`v4_orcamento-por-plataforma-em-coluna`)

_Rodada única de correção do bloqueante ROT-7 apontado pela revisão independente, mais os itens de observação que a mesma revisão já tinha catalogado como não bloqueantes._

- **ROT-7 (bloqueante, resolvido):** o rótulo `formatUnavailable()` da coluna sem veiculação era mais largo que o trilho tracejado e as duas hastes do tracejado cruzavam as letras nos dois temas, sem halo. Ganhou `style={HALO}`, na mesma constante já usada no rótulo de valor; em qualquer largura de trilho o texto seguirá mais largo que a coluna, então o halo (e não tirar o texto de dentro) é a correção estável.
- **ESP-2 (atenção do dono, resolvido):** `COLUMN_MAX` caiu de 48 para 24 px. O passo de 116 px com vão de 34% rendia 37 px de espessura efetiva, medidos no `preview.svg`, acima do teto de 24 px em cartão; o `maxBarSize` antigo nunca chegava a prender porque só o vão (`barCategoryGap`) e o passo decidiam a espessura. Confirmado no SVG: as três colunas com veiculação agora medem 24 px.
- **NUM-4 (resolvido):** o "+3 pp" passou a nomear a base, "+3 pp de 105%". Uma primeira tentativa com "sobre 105%" colocava a tinta a 1,24 px do rótulo da coluna vizinha (aviso da guarda COLISAO-TEXTO); a forma mais curta com "de" resolve o mesmo requisito sem aproximar as duas tintas.
- **ANO-2 (resolvido):** o rótulo da meta passou de "meta" para "meta 100%". Isso exigiu subir `MARGIN.left` de 34 para 68 px, porque o texto mais longo, ancorado à esquerda do corpo, passava a vazar para fora do canvas (aviso de transbordo do render); 68 px é o primeiro valor que sai limpo nos dois temas.
- **ACE-1 (resolvido):** a frase acessível trocou `data.month.slice(5,7)/data.month.slice(2,4)` por `formatMonthShort(data.month)`, e agora imprime "ago/26" em vez de "08/26" (seção 8). A frase foi de 244 para 245 caracteres, ainda dentro do teto de 250 da ACE-1, mas a guarda continua com o mesmo aviso de proximidade do teto porque a frase é calculada do dado.

## Pendências conhecidas (`v4_orcamento-por-plataforma-em-coluna`)

- A plataforma sem veiculação usa `percent = domainMax` para desenhar o trilho tracejado em altura cheia; isso a torna a peça mais alta do desenho (a "ponta da leitura" visual), quando semanticamente ela deveria ser a mais discreta. Resolver exige desacoplar a altura do trilho da escala de valor (por exemplo, altura fixa e pequena, independente do domínio), o que muda a geometria do `<Bar>` e não coube nesta rodada.
- O rótulo de indisponibilidade escreve só o texto de `formatUnavailable()`; a EST-2 também pede o ícone `Unplug` em `--text-muted` ao lado do texto, que esta versão não desenha. Embutir o ícone em SVG puro (sem `foreignObject`) pede montar o `path` do glifo à mão ou um `<image>`, fora do escopo desta correção.
- `v3_painel-de-metas-comerciais` e `v4_orcamento-por-plataforma-em-coluna` continuam sem o bloco `role="status"` da EST-1 para `data` vazio (item já listado acima, mantido aqui por ser pendência e não só observação).
