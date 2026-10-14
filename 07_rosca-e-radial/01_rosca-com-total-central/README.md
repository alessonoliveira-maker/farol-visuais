# Rosca com total central

## O que é

Pizza com o miolo recortado, e o miolo carrega o total do todo: a leitura sai da área da fatia e vai para o comprimento do arco, e o espaço vazio do centro vira informação (o total, a contagem ou o item em foco), nunca ícone decorativo. É a forma mais comum da família 07 nos painéis do Farol.

## Quando usar

- Parte do todo com 2 a 6 categorias em que o total é a informação principal do cartão, como investimento de mídia do mês ou carteira aberta por etapa.
- Composição que precisa do número do todo e da divisão no mesmo lugar, sem repetir o total no título do cartão.
- Exploração de partes sem poluir com rótulo em cada fatia: o centro mostra o item em foco e a legenda tabular traz valor e percentual.
- Composição com categoria de ausência declarada (sem origem, sem dado), visível e por último, fora do teto de cor.

## Quando evitar

- Comparação precisa entre categorias de tamanho parecido: barra horizontal ordenada (família 02).
- Mais de 6 fatias coloridas: agrupar as menores em "Outros (n=X)" com a contagem, como a v4 faz, ou trocar por barra.
- Uma fração só contra uma meta: progresso circular (modelo 06 desta família, ou 13/03).
- Total que muda com filtro ou com série escondida sem aviso: o centro precisa sempre dizer de qual total fala.
- Mesma composição repetida em vários períodos: barra 100% (03) ou linha de participação (04).

## Anatomia

1. Anel com `innerRadius` entre 60% e 80% do `outerRadius` (62%/80% ou 62%/74% nas versões daqui), ordem decrescente a partir das 12 horas (`startAngle={90}`, `endAngle={-270}`).
2. Centro por `Label` com `content` dentro do `Pie`, em duas linhas de `<tspan>`: o número em Space Grotesk 600 de 14 px (`--text-primary`) e o rótulo de apoio em Manrope 11 px (`--text-muted`). O total nunca se repete no título do `VisualCard`.
3. Separador entre fatias com `stroke="var(--surface-raised)"`, 2 px nas fatias coloridas.
4. Cor por categoria, nos slots 1, 3, 6, 5, 2, 4 dos tokens `--chart-*` (COR-8); ausência declarada sem preenchimento, contorno `--text-muted`.
5. Legenda tabular ao lado (nunca dentro do corpo do gráfico): amostra de cor, nome truncável, valor em `formatCurrencyCompact`/`formatInt` e percentual inteiro por `formatPercent(fração, 0)`, os três alinhados à direita, somando 100 pelo maior resto (NUM-2).
6. Estado vazio (`role="status"`) substitui o gráfico inteiro quando `data` chega sem linha; estado indisponível (v4) troca o anel por um trilho tracejado com `Unplug` e `formatUnavailable()`.

## Versões

- `v1_investimento-de-midia-do-mes`: composição estática de 3 canais de mídia. Demonstra a anatomia básica: `innerRadius`/`outerRadius`, ordem decrescente, total no centro por `Label`, separador entre fatias e legenda tabular com valor e percentual somando 100.
- `v2_perdas-por-motivo-com-fatia-ativa`: 5 motivos de perda, o maior já aberto ao montar. Demonstra o `shape` que lê `isActive` (sem o `activeIndex` removido no Recharts 3), o centro alternando entre total e item (nome quebrado por palavra em até duas linhas, 16 caracteres por linha, para caber na corda do raio interno sem reticência), o raio maior na fatia ativa, o atraso de saída de 100 ms para não piscar ao cruzar o separador, e a ativação pela legenda (ponteiro, foco e clique).
- `v3_carteira-aberta-por-etapa`: 4 etapas do funil comercial, na ordem do funil e não por valor. Demonstra a cor sequencial (`--seq-4` a `--seq-7`) para categoria ordenada, o centro em duas linhas (valor e contagem de oportunidades) e a legenda tabular com três colunas.
- `v4_origem-com-fatia-minima-e-ausencia`: 8 origens de lead mais a ausência declarada. Demonstra o teto de 5 fatias individuais com a sexta em diante agrupada em "Outros (n=3)", a fatia de ausência sem preenchimento e por último, a fatia mínima (a menor origem nomeada) ativável pela legenda e pelo teclado sem inflar o ângulo (`minAngle` não declarado, portanto 0), e a prop `unavailableReason`, que troca a composição por um trilho tracejado com `formatUnavailable()`. **Esse último estado não aparece no preview padrão**, só no código: o preview desta versão fotografa a composição, não a indisponibilidade.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/MediaSpendDonut/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` pela prop; o default de cada `data.ts` só serve ao catálogo.
3. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (o corpo do preset `card` mede cerca de 574 × 234 px) ou passe `height`.
4. Se a origem de dado pode cair (a v4 já traz o exemplo), passe `unavailableReason` com o motivo; a composição normal só volta quando a prop some.
5. Rode `npm run typecheck` e `npm run lint` no `app/`, e abra a página nos dois temas.

## Referências

- Catálogo: [Data Visualisation Catalogue, donut chart](https://datavizcatalogue.com/methods/donut_chart.html): a troca de leitura de área para comprimento de arco e o uso do miolo.
- Catálogo: [shadcn, chart-pie-donut-text (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-text.tsx): o total calculado e desenhado no centro em duas linhas.
- Catálogo: [AG Charts, donut series](https://www.ag-grid.com/charts/react/donut-series/): `innerLabels`, `innerCircle` e `sectorSpacing`.
- Praticante: [From Data to Viz, donut plot](https://www.data-to-viz.com/graph/donut.html): o limite de poucas categorias e o centro para total e percentuais.
- Farol: `app/src/components/visuals/charts/DonutChart.tsx` (o wrapper de produção, com o mesmo nome de prop `unavailableReason` usado aqui).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Nenhum bloqueante nas quatro versões; os pontos abaixo são nuance._

- v1: o mês `2026-08` está escrito no `Chart.tsx` (centro e frase acessível), não no `data.ts`. Com outro `data` pela prop, o centro continua dizendo `ago/26`. O mês caberia melhor no dado ou numa prop.
- v1, v2, v3, v4: a amostra da legenda é um círculo, enquanto a marca é um arco de anel (ROT-5 pede a amostra na forma da marca). Legível do jeito que está, mas divergente do arco.
- v2: o percentual da legenda arredonda cada fatia isolada (`formatPercent(count / total, 0)`), sem o maior resto que a v1, a v3 e a v4 usam. Com estes números a soma dá 100 por coincidência; outro recorte pode fechar em 99 ou 101.
- v2: no preview padrão o centro nasce no item ativo, então o total de 212 perdas só aparece no subtítulo do cartão, que vem do `meta.json` e não do `Chart.tsx`. Quem colar num `VisualCard` com outro título precisa garantir o total em algum lugar.
- v3: a coluna de contagem da legenda (24, 16, 11, 7) não tem cabeçalho nem unidade; o substantivo `oportunidades` só existe no centro. A leitura funciona porque a soma bate com o centro, mas a coluna sozinha é ambígua.
- v4: a frase acessível diz que a menor origem individual é `Panfletagem`, com `1 leads`. Essa origem não é uma fatia: ela está dentro de `Outros (n=3)`. A menor fatia individual desenhada é `Parceria comercial`, com 4 leads. Vale também acertar a concordância de `1 leads`.
- v2 e v4: o render grava `.diff.png` nos dois temas, acima do limite de 0,5%, por diferença de antisserrilhado do texto das linhas de legenda, que ali são `button` e não `span`. O `npm run check` passa com 0 erro; o desvio é da ferramenta de comparação, não do desenho.

_Revisão de 2026-10-02, só da v2 e da v4, pelo desenho que a ferramenta produz desde o render de 2026-10-01 (linha de base herdada no `<style>`). A v4 segue aprovada. A v2 foi reprovada por um bloqueante que está em `validation/revisao_07_rosca-e-radial__01_rosca-com-total-central_2026-10-02.md` e não tem relação com a mudança do botão. Os pontos abaixo são nuance; os de 2026-09-18 continuam valendo, salvo o último._

- v2 e v4: a nota de 2026-09-18 sobre o `.diff.png` acima de 0,5% deixou de valer. Medido hoje, preview contra página: 9 e 24 pixels acima da tolerância na v2 (0,001% no escuro e 0,003% no claro, todos no texto do centro) e 0 na v4. O botão da legenda sai em Manrope 12 px, com 325 por 16 px, igual à página.
- v2 e v4: o bloco de vazio (`role="status"`) traz só a frase; a EST-1 pede também o ícone `Filter` de 16 px. Não aparece no preview padrão.
- v2 e v4: a margem do `PieChart` está escrita no JSX (`{ top: 8, right: 8, bottom: 8, left: 8 }`), e a ESP-3 pede a constante `MARGIN` no topo do arquivo. Sem consequência no desenho.
- v2 e v4: a raiz usa `role="img"` e tem dentro botões que recebem foco. Para leitor de tela, o conteúdo de uma imagem não é navegável, então a ativação pelo teclado fica sem nome anunciado. A seção 11 oferece `figure` para composição com legenda.
- v2 e v4: as colunas de número da legenda usam `kpi-number` sem peso declarado e herdam 400, que não é peso carregado da Space Grotesk (TIP-4). O navegador cai no 500, que é o que a 17.1 pede, então o desenho sai certo; declarar `font-medium` deixa de depender do desvio.
- v4: o separador de 2 px come cerca de metade da tinta da menor fatia. `Parceria comercial` (4 leads) tem arco de cerca de 3,7 px no raio médio e sobra cerca de 1,7 px visível; `Outros (n=3)` (6 leads) sobra cerca de 3,8 px. A razão desenhada passa de 2 para 1, contra 1,5 para 1 no dado. O número está na legenda e a fatia continua visível nos dois temas.

_Segunda revisão de 2026-10-02, só da v2, depois da rodada de correção. Aprovada: o bloqueante da ROT-7 fechou. Medido na página da ferramenta, com foco em cada botão da legenda e com o ponteiro sobre a fatia, nos dois temas, pela tinta em pixel dentro do miolo (raio interno de 64,79 px). Os pontos abaixo são nuance._

- v2: folga da linha mais larga do centro até a corda do raio interno, por lado, igual nos dois temas: `Sem fit de` 27,1 px; `Preço acima do` 10,1 px; `concorrente` 23,6 px; `Sem resposta no` 5,1 px (a menor, com 111,0 px de tinta contra 121,1 px de corda); `Projeto adiado` 14,7 px. A linha de contagem tem 86,0 px e folga de 16,6 px. Nenhuma tinta toca o anel, e o centro volta para `212 perdas` depois do desfoque e da saída do ponteiro.
- v2: a largura que o comentário de `CENTER_NAME_MAX_CHARS` assume, 7,1 px por caractere, é menor que a medida. `Sem resposta no` tem 15 caracteres e 111,6 px de avanço, ou 7,44 px por caractere. Uma linha de 16 caracteres nessa proporção mede cerca de 119 px contra 121,1 px de corda, e sobra 1 px por lado em vez dos 4 px de respiro. O teto de 16 protege o dado atual, não qualquer nome; 15 caracteres ou uma tabela de largura fecha a conta.
- v2: `wrapName` não limita o número de linhas nem parte palavra com mais de 16 caracteres. O "até duas linhas" deste README vale pelo dado, não pelo código. Com três linhas de nome o bloco passa a 68 px de altura e a primeira linha cai numa corda de cerca de 110 px.
- v2: a coluna de contagem da legenda (86, 54, 38, 22, 12) não leva o substantivo (NUM-6), como na v3. `perdas` aparece no centro e no subtítulo do cartão.
- v2: o `meta.json` diz "Maior motivo aberto ativo por padrão" e o catálogo diz "por activeId do data.ts". A versão faz o que o catálogo diz; é só a redação do `meta.json` que ficou na forma antiga.

## Pendências conhecidas

- v2: NUM-2, percentual da legenda ainda por arredondamento simples (soma 100 só pelo dado atual); falta o maior resto como na v4. EST-1, TIP-4 e ESP-3 desta versão seguem como nas observações acima.
- v2: ROT-7 corrigido (quebra do nome no centro), medido nos cinco motivos ativos; a guarda automática continua sem cobrir estados de foco.
