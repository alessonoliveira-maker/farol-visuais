# Barras simples ordenadas

## O que é

Uma barra por categoria, todas partindo do zero, ordenadas pela grandeza em TypeScript antes do render: o comprimento é o dado e a leitura é de ranking. É o modelo padrão da família e a base de quase todos os outros. O nome completo da categoria fica à esquerda (num eixo ou dentro da própria barra), o valor vai escrito na ponta, e o eixo de valor some quando toda barra já está rotulada. O modelo absorve a variação com destaque: uma ou poucas categorias acesas na cor de destaque por regra de dado, o resto em neutro, com a cor aplicada pela prop `shape` e nunca por `Cell`, que está deprecado no Recharts 3.

## Quando usar

- Ranking de uma medida entre categorias sem ordem natural: receita por executivo, tempo até o primeiro contato por SDR, leads por campanha.
- Nomes longos que, girados num eixo de colunas, ficariam ilegíveis.
- De 3 a cerca de 15 barras em card; até 25 em card alto, e acima disso top N mais uma barra de cauda agregada.
- Quando uma ou poucas categorias carregam a mensagem (quem passa do SLA, quem lidera) e precisam de destaque sem perder a escala do grupo inteiro.

## Quando evitar

- Série temporal: a ordenação pela grandeza apaga o tempo; use colunas verticais (`03_colunas-verticais`) ou linhas (`04_linhas`).
- Valores com os dois sinais: o zero deixa de ser uma borda única; use barras divergentes de sinal (`06_barras-divergentes`).
- Duas ou três séries por categoria: use barras agrupadas (`02_barras-agrupadas`).
- Muitas categorias com valores quase iguais: o efeito de parede esconde a diferença; use lollipop (`17_comparacao-de-pontos`).
- Ocupação contra um teto real por categoria: use barras com trilho (`13_progresso-meta-e-gauge`).
- Top N compacto em card estreito, sem necessidade de eixo: use bar list (`09_bar-list`).

## Anatomia

1. Linha de leitura opcional no topo, calculada do dado: quem lidera, a distância para o segundo, um empate ou uma contagem acima do limite (CONTRATO, ANO-5).
2. Eixo de categoria à esquerda com o nome completo (`YAxis type="category"`), ou o nome desenhado dentro/depois da própria barra quando não há eixo (v3).
3. Barra com raio só na ponta livre (`radius={[0, 3, 3, 0]}`) e vão de 32% a 36% entre categorias; altura do corpo derivada do número de linhas por um passo fixo (`ROW_STEP`), nunca espremida.
4. Cor por regra de dado via `shape` com `Rectangle`: destaque em `--chart-1`, contexto em `--line-strong` (permitido porque toda barra tem o valor escrito, COR-2), estado de alerta em `--negative` quando a métrica é um limite que não deveria ser cruzado.
5. Rótulo direto de valor na ponta de cada barra, sempre pelos formatadores do Farol (`formatCurrencyCompact`, `formatHours`, `formatInt` com o substantivo da unidade).
6. Eixo de valor oculto (`XAxis hide`) e sem grade: o rótulo direto já é a régua (EIX-3).
7. Estados de fronteira tratados por regra, não por exceção visual: zero medido escreve `0`, categoria sem coleta escreve `formatUnavailable()` em `--text-muted`, e um empate repete a posição no lugar de inventar um desempate que o dado não tem.
8. Recorte sem linhas troca o gráfico inteiro por um bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_receita-por-executivo`: receita reconhecida por executivo no trimestre. Demonstra o caso básico do modelo: `BarChart` vertical com eixo de categoria à esquerda, ordenação decrescente com desempate estável pelo nome, valor na ponta por `LabelList`, altura derivada do número de linhas e uma linha de leitura com o líder e a distância para o segundo colocado.
- `v2_destaque-contra-sla`: tempo até o primeiro contato por SDR contra o SLA de 4 horas. Demonstra cor por item via `shape` com `Rectangle` (nunca `Cell`), estado de alerta com sinal e palavra para quem passa do limite, `ReferenceLine` tracejada no próprio SLA com halo no rótulo, e ordenação do pior para o melhor porque a mensagem é quem está pior.
- `v3_campanhas-com-cauda-agregada`: leads por campanha entre as 40 do mês. Demonstra o top 15 ordenado mais uma barra final "Outras 25 campanhas" em neutro e fora da ordenação, nome dentro da barra quando cabe e depois da ponta quando não cabe (sem reticência), e a cauda somada entrando na mesma escala sem roubar a primeira posição do ranking.
- `v4_zero-indisponivel-e-empate`: agendas por fila de pré-vendas na semana. Demonstra o zero medido escrito como `0` sem fabricar barra visível, a fila sem coleta escrevendo indisponível em vez de uma barra zerada, um empate no topo com a posição 1 repetida nas duas filas, e o estado vazio no lugar do gráfico quando o recorte não tem linhas.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para uma pasta de visual da página, por exemplo `app/src/pages/<pagina>/visuals/RankingBars/`.
2. Troque o `import` do `./data` pelo seletor real da página e passe `data` (e `slaHours`, `highlightId` ou o que a versão expuser) pelas props; o default do `data.ts` fica só como amostra do catálogo.
3. Ponha o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">` ou maior, seguindo o `canvas` sugerido) ou passe `height`.
4. Se a versão tratar estado vazio ou indisponível inline, troque pelo `EmptyState`/`UnavailableState` do Farol mantendo o mesmo texto (seção 16 do CONTRATO).
5. Rode `npm run typecheck` e `npm run lint` no `app/` e confira nos dois temas e a 390 px de largura.

## Referências

- Cleveland, W. S.; McGill, R. (1984). Graphical Perception: comprimento sobre escala comum é a leitura mais precisa; base do porquê a barra começa em zero.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): "Ordered bar" mora em Ranking, e barra lê melhor que coluna com rótulos longos.
- [Data to Viz, barplot](https://www.data-to-viz.com/graph/barplot.html) e [caveat de ordenação](https://www.data-to-viz.com/caveat/order_data.html): o erro mais comum é não ordenar pela grandeza.
- [Vega Lite, barra agregada ordenada](https://vega.github.io/vega-lite/examples/bar_aggregate_sort_by_encoding.html): `sort: "-x"` declarativo, que no Recharts vira `sort` em TypeScript antes do `data`.
- [SWD, What is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart): horizontal para rótulos longos, zero obrigatório, rótulo dentro da ponta.
- [Few, Bar Widths and the Spaces in Between (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf): o respiro entre barras e o efeito da largura na percepção do comprimento.
- [Recharts VerticalComposedChart](https://recharts.github.io/en-US/examples/VerticalComposedChart/) e [shadcn chart-bar-horizontal.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-horizontal.tsx): `layout="vertical"` com eixo de categoria em `YAxis`.
- [shadcn chart-bar-active.tsx](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-bar-active.tsx) e [Recharts BarChartWithCustomizedEvent](https://recharts.github.io/en-US/examples/BarChartWithCustomizedEvent/): cor por item via `shape` com `Rectangle` e estado ativo, a migração recomendada para fora de `Cell`.
- Farol: `app/src/components/visuals/charts/BarsChart.tsx` (orientação horizontal e destaque por `highlightKeys`).

## Pendências conhecidas

- `v3_campanhas-com-cauda-agregada`: a contagem que sai para fora da barra usa `estimateWidth` (6,6 px por caractere) em vez da largura real do texto, então a coluna de contagens fica desalinhada entre linhas de nomes com comprimentos diferentes; corrigir exigiria medir o texto renderizado (`getBBox` ou canvas de medição), fora do escopo desta rodada.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-16, contra o CHECKLIST_REVISAO.md; inclui a segunda passada, de revisor independente, no mesmo dia._

- `v1_receita-por-executivo`: a barra sai com 8 px de espessura porque o Recharts desconta o `barCategoryGap` dos dois lados da banda; com `ROW_STEP` de 24 px, sobra mais vão que barra.
- `v1_receita-por-executivo`: o corpo termina por volta dos 300 px dos 360 px do canvas `card` e deixa uma faixa vazia no fim; nada corta, é só espaço ocioso.
- `v2_destaque-contra-sla`: os rótulos "3,6 h" e "3,1 h" encostam na linha tracejada do SLA; o halo da ROT-7 mantém a leitura, mas um respiro maior deixaria mais limpo.
- `v2_destaque-contra-sla`: o canvas `alto` sobra cerca de 110 px vazios abaixo da última barra.
- `v3_campanhas-com-cauda-agregada`: a contagem dos rótulos que saem para fora da barra fica desalinhada entre linhas, porque a posição vem da estimativa de 6,6 px por caractere e não da medida real do texto (pendência conhecida, ver a seção acima).
- `v3_campanhas-com-cauda-agregada`: correção de 2026-09-16 (reprovação por bloqueante nos checklist 15, 20 e 23): `ROW_STEP` foi de 24 para 50 e `barCategoryGap` de 32% para 30%, o que engrossa a barra de 9 px para 20 px (o teto de `maxBarSize`) e resolve o nome de 12 px vazando para o cartão; o canvas virou o objeto `{ width: 640, height: 940 }` para caber as 16 linhas nessa espessura nova. A contagem na ponta passou a usar sempre `--text-secondary` (era `--text-primary` fora da barra) e o estado vazio agora olha `data.length`, não o total de linhas já com a cauda somada. Os quatro nomes de campanha com marca real (LinkedIn Ads, Google Ads, YouTube, Instagram) viraram nomes genéricos de canal.
- `v4_zero-indisponivel-e-empate`: no empate, o peso 700 vai para seis elementos (duas posições, dois nomes e dois valores) e a TIP-3 pede no máximo dois por visual.
- `v4_zero-indisponivel-e-empate`: o corpo também sobra vazio no fim do canvas `card`, como em v1.
- `v2_destaque-contra-sla`: nas barras acima do SLA o rótulo direto imprime o excesso ("+3,2 h acima do SLA") e não o tempo medido, então a mesma coluna de rótulos carrega duas grandezas; o catálogo pedia valor escrito em toda barra. A base vai nomeada e a linha de leitura traz o pior tempo absoluto, então a leitura não engana.
- `v4_zero-indisponivel-e-empate`: o indisponível sai só como texto, sem o ícone `Unplug` que a EST-2 pede ao lado de `formatUnavailable()`.
- `v3_campanhas-com-cauda-agregada`: o canvas virou `{ width: 640, height: 940 }` em vez do `alto` sugerido pelo catálogo e, com `ROW_STEP` de 50 px para barra de 20 px, o vão vertical fica maior que a própria barra; cabe compactar sem perder o nome dentro da barra.
- README do modelo: a Anatomia fala em vão de 32% a 36% entre categorias, mas v3 usa 30% (dentro da ESP-2, que aceita de 30% a 40%); vale alinhar o texto ao código.

_Terceira passada, de revisor independente, em 2026-09-18: as quatro versões aprovadas, sem bloqueante. Os itens abaixo são novos desta rodada._

- `v1_receita-por-executivo`, `v2_destaque-contra-sla` e `v4_zero-indisponivel-e-empate`: a guarda `ESPESSURA-MARCA` do check mede 8 px de espessura efetiva nas três, abaixo do piso geral de 12 px da ESP-2; sai como aviso porque esse piso ainda não tem peça de teste própria, e vira erro no dia em que tiver. Pela ESP-6, `ROW_STEP` precisaria ir de 24 para cerca de 36 px em v1 e v2, e de 30 para cerca de 36 px em v4.
- `v3_campanhas-com-cauda-agregada`: o `meta.json` fixa o canvas por número (`{ "width": 640, "height": 940 }`), mas não traz a chave `notes` dizendo que a altura sai da conta da ESP-6 e quantas categorias ela comporta; a razão está só em comentário no `Chart.tsx`. O CONTRATO pede essa linha para o desvio de preset contar como declarado.
- `v3_campanhas-com-cauda-agregada`: a frase acessível mede 246 caracteres, a 4 do teto de 250 da ACE-1, e cresce com o nome da campanha líder; um nome de campanha mais longo no recorte real estoura o limite.
- `v1_receita-por-executivo`: Fabrício S. e Giovana T. empatam em R$ 196,4 mil e saem com barras idênticas, sem nada na peça dizendo que é empate; a v4 resolve o mesmo caso repetindo a posição, e o desempate pelo nome aqui fica implícito.
- `v4_zero-indisponivel-e-empate`: o rótulo `14 agendas` das duas líderes encosta na ponta da barra com os 6 px da ESP-1; lê bem nos dois temas, mas é o par mais apertado da peça, porque o peso 700 engrossa o algarismo.

_Quarta passada, de revisor independente, em 2026-09-18: as quatro versões aprovadas, sem bloqueante. O `meta.json` da v3 já traz a chave `notes` com a conta da ESP-6, o que fecha a observação da passada anterior. Os itens abaixo são novos desta rodada._

- `v4_zero-indisponivel-e-empate`: a fila com zero medido e a fila sem coleta saem as duas sem marca desenhada, e a diferença entre elas vive só na palavra (`0 agendas` contra `indisponível`). A EST-2 e a EST-3 estão cumpridas, mas quem varre a coluna de barras vê duas linhas vazias iguais; um traço de marca de zero ou o ícone `Unplug` separaria as duas de relance.
- `v3_campanhas-com-cauda-agregada`: o mesmo `estimateWidth` de 6,6 px por caractere que desalinha a coluna de contagens também decide se o nome cabe dentro da barra (`fitsInside`). A estimativa é folgada, então erra para o lado seguro, mas o limiar de "cabe dentro" da ROT-7 fica apoiado num número aproximado e não na largura medida do texto.
- `v1_receita-por-executivo`, `v2_destaque-contra-sla` e `v4_zero-indisponivel-e-empate`: a linha de leitura usa `truncate`, então em card estreito ela é cortada por reticência. A TIP-7 permite, porque o conteúdo inteiro está na frase acessível da raiz, mas em 390 px de largura a conclusão da peça é a primeira coisa a sumir.
- `v2_destaque-contra-sla`: o halo da ROT-7 vai em todos os rótulos de valor, inclusive nos que estão longe da linha do SLA. Não atrapalha, porque o halo é da cor do cartão, e é o caminho seguro quando o recorte muda; vale só registrar que a decisão foi por regra e não por rótulo.
- `v1_receita-por-executivo`: a ordem é decrescente e a v2 é crescente do ponto de vista do valor; as duas colocam no topo quem carrega a mensagem, que é o critério do catálogo, embora o texto do catálogo descreva a v2 como "ordenação crescente".
