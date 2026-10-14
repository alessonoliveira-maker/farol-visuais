# Butterfly ou pirâmide

## O que é

Dois gráficos de barras espelhados sobre o mesmo eixo de categorias, um crescendo para a esquerda e outro para a direita. A pirâmide etária é o caso clássico; a borboleta é o caso geral, com qualquer par de grupos sobre as mesmas faixas. O olho lê primeiro o comprimento de cada lado e depois compara os dois, por isso os dois lados sempre precisam da mesma escala, e o sinal negativo que a implementação usa por baixo nunca pode vazar para um texto visível: tique, rótulo e dica sempre imprimem o valor absoluto. O modelo absorve a pirâmide de termos entre dois grupos, em que cada lado é normalizado pelo tamanho do próprio grupo em vez de um total comum.

## Quando usar

- Duas populações sobre as mesmas faixas: leads e oportunidades por porte, entradas e agendas por tempo até o contato.
- Faixas com ordem natural, de 4 a cerca de 12, lidas de baixo para cima.
- Mostrar as duas magnitudes lado a lado, e não só a diferença entre elas.
- Termos citados por dois grupos, como ganhas e perdidas, em percentual das respostas de cada grupo.

## Quando evitar

- Só a diferença entre os dois lados importa: barras divergentes de sinal (06_barras-divergentes), que já sabe empilhar por sinal.
- Lados com ordens de grandeza muito diferentes na mesma escala absoluta: percentual do próprio total (v4) ou dois cards separados.
- Mais de dois grupos: barras agrupadas (02_barras-agrupadas) ou pequenos múltiplos.
- Passagem sequencial entre etapas com taxa de conversão: funil (10_funil).
- Dois pontos por categoria em que a distância é o dado: dumbbell (17_comparacao-de-pontos).

## Anatomia

1. Eixo de categorias com o rótulo centrado na própria coluna, entre os dois lados; a lista sempre na ordem natural, da menor faixa embaixo à maior no topo (CONTRATO, seção 5).
2. Domínio simétrico `[-máximo, +máximo]`, calculado sobre os dois conjuntos juntos, nunca um por lado, senão a comparação fica falsa.
3. Barra desenhada pela prop `shape` com `Rectangle`, raio só na ponta livre de cada lado; um `Bar` por lado, cada um com o **próprio** `stackId` (`leadsNeg`/`opportunities`, por exemplo). `stackId` igual empilha os dois valores numa pilha só e o segundo lado passaria a partir do fim do primeiro em vez do zero; `stackId` diferente é o que garante os dois lados partindo do zero, cada um pela própria escala, mas não os centra na mesma linha: o Recharts divide a banda da faixa em duas sub-faixas, uma por lado, separadas pelo `barGap`, e é o rótulo da categoria (item 1), no meio da banda inteira, que costura visualmente os dois lados.
4. Valor absoluto em `Math.abs` no tique do eixo (`tickFormatter`), na `LabelList` de cada ponta e em qualquer dica: o lado esquerdo nunca imprime o sinal negativo que o seletor usa por baixo.
5. `ReferenceLine x={0}` sólida em `--line-strong`, sem grade nos dois sentidos (EIX-3).
6. Título de cada lado (`Leads`, `Oportunidades`, `Ganhas`, `Perdidas`) posicionado pela escala do próprio eixo com `useXAxisScale` e `usePlotArea`, nunca por pixel fixo.
7. Cor fixa por lado, uma categórica para cada população (`--chart-1` e `--chart-3`, COR-8), nunca semântica: os dois lados são populações, não um bom e um ruim.
8. Alternativa de dois `BarChart` irmãos numa grade de três colunas, com o eixo invertido (`reversed`) do lado esquerdo, quando os dois lados são métricas diferentes e não precisam da mesma escala (v2).
9. Estados: termo ou faixa sem observação num lado escreve `indisponível` ou um traço com `0%`, nunca remove a linha nem desenha barra zerada; `data` vazio troca o gráfico por um bloco `role="status"`.

## Versões

- [`v1_leads-e-oportunidades-por-porte`](./v1_leads-e-oportunidades-por-porte/): leads à esquerda e oportunidades à direita, em cinco faixas de porte da conta. Demonstra o lado esquerdo negado no seletor com domínio simétrico calculado nos dois conjuntos, `Math.abs` no tique, na `LabelList` e na leitura, as faixas na ordem natural da menor para a maior e o título de cada lado acima do respectivo bloco. Previews: [escuro](./v1_leads-e-oportunidades-por-porte/preview.svg) e [claro](./v1_leads-e-oportunidades-por-porte/preview-claro.svg).
- [`v2_tempo-ate-o-primeiro-contato`](./v2_tempo-ate-o-primeiro-contato/): entradas de lead à esquerda e agendas realizadas à direita, por faixa de tempo até o primeiro contato da pré-vendas. Demonstra a taxa de conversão escrita no centro ao lado do rótulo da faixa, a faixa de menos de 5 minutos em destaque contra as demais em neutro, dois `BarChart` irmãos numa grade de três colunas com o eixo de categorias no meio e as bandas alinhadas pela mesma lista, margem e `barCategoryGap`. Previews: [escuro](./v2_tempo-ate-o-primeiro-contato/preview.svg) e [claro](./v2_tempo-ate-o-primeiro-contato/preview-claro.svg).
- [`v3_termos-em-ganhas-e-perdidas`](./v3_termos-em-ganhas-e-perdidas/): pirâmide dos 14 termos mais citados nas anotações de oportunidades ganhas e perdidas do trimestre. Demonstra a normalização de cada lado pelo tamanho do próprio grupo, a ordenação pela diferença em pontos percentuais com o critério escrito na própria leitura, a diferença acima de 10 p.p. em cor cheia contra o resto translúcido, e o termo ausente num lado marcado com traço e `0%`, nunca removido. Previews: [escuro](./v3_termos-em-ganhas-e-perdidas/preview.svg) e [claro](./v3_termos-em-ganhas-e-perdidas/preview-claro.svg).
- [`v4_escalas-de-grandeza-diferentes`](./v4_escalas-de-grandeza-diferentes/): leads e oportunidades das mesmas cinco faixas de porte, agora com 10 mil leads contra pouco mais de 80 oportunidades. Demonstra a detecção de razão acima de 20 vezes entre os totais, a troca para percentual do próprio total com o aviso de escalas independentes na leitura, o valor absoluto preservado na dica de cada barra mesmo com o rótulo em percentual, e a faixa sem observação de um lado escrevendo `indisponível` no lugar da barra. Previews: [escuro](./v4_escalas-de-grandeza-diferentes/preview.svg) e [claro](./v4_escalas-de-grandeza-diferentes/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o import do dado.
2. Entregue as duas séries cruas pela prop `data`: o componente calcula o domínio simétrico (ou a razão entre totais, na v4), ordena e decide o lado ausente. Não normalize antes de passar, senão o cálculo do domínio compartilhado diverge entre as versões.
3. Se o par de séries tiver ordens de grandeza muito diferentes, prefira a v4 como ponto de partida: ela já decide sozinha entre escala absoluta e percentual do próprio total.
4. Se as duas métricas não precisarem da mesma escala (uma é contagem, outra é taxa ou outra unidade), prefira a v2: os dois `BarChart` correm soltos e só a lista de categorias precisa bater.
5. Dê altura ao pai (`h-64` para até 6 faixas; a v3, com 14 termos, pede algo em torno de `h-96`) ou passe `height`. Sem altura, `ResponsiveContainer` desenha zero.
6. Embrulhe num `VisualCard` com o título e o subtítulo do `meta.json`; a nota de sinal negativo do rodapé sai, porque o `Chart` já nunca imprime sinal.
7. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas e a largura de 390 px, onde os dois lados encolhem juntos.

## Referências

- [Data Viz Project, Butterfly Chart](https://datavizproject.com/data-type/butterfly-chart/) (não abriu, HTTP 403). Observar, quando abrir, a distinção entre borboleta genérica e pirâmide etária.
- [Vega Lite, pirâmide populacional como divergente empilhada](https://vega.github.io/vega-lite/examples/bar_diverging_stack_population_pyramid.html). Observar que o Vega Lite trata a pirâmide como caso da divergente, com o eixo de categoria no centro.
- [Wikipedia, population pyramid](https://en.wikipedia.org/wiki/Population_pyramid). Observar o vocabulário de forma (expansiva, estacionária, construtiva), que também descreve funis comerciais.
- [Observable, about population pyramids](https://observablehq.com/@didoesdigital/15-july-2020-about-population-pyramids). Observar variações de desenho e o cuidado com eixos independentes.
- [xD Gov, Data Visualization Standards, population pyramid](https://xdgov.github.io/data-design-standards/visualizations/population-pyramid). Observar as regras duras: bins uniformes, no máximo duas cores, eixo de categoria no zero.
- [Figma Community, Dashboard Charts UI Kit](https://www.figma.com/community/file/1066019348443074842/dashboard-charts-ui-kit). Observar componentes espelhados e a grade de três colunas em modo escuro.
- Estudo de origem: [`_estudo/familias/02_barras-horizontais.md`](../../_estudo/familias/02_barras-horizontais.md), seção 2.11.
- Farol: `app/src/components/visuals/charts/ChartTooltip.tsx` (a dica usada na v4). Os hooks `useXAxisScale`, `useYAxisScale` e `usePlotArea` do Recharts posicionam título de lado, marca de ausência e coluna central sem cálculo manual de pixel.

## Pendências conhecidas

_Correção de 2026-09-17 (1ª rodada), sobre a revisão que reprovou as quatro versões por `stackId` compartilhado: separado por lado em v1, v3 e v4 (cada lado parte do zero), o `YAxis` de v1 passou a mapear `id` para `row.band`, o `meta.json` de v1 parou de prometer dica inexistente, o `renderName` ficou uniforme em `NAME_WIDTH / 2`, o `INDEPENDENT_RATIO` da v4 passou a ser dito na leitura, e a v2 ganhou margem para o rótulo da maior barra e passou a declarar as duas escalas na linha de leitura._

_Correção de 2026-09-17 (2ª rodada), sobre a revisão que reprovou as quatro versões de novo por ROT-7: em v1, v2, v3 e v4 o rótulo de valor do lado que nasce do zero (esquerda no butterfly, entradas na v2) estava ancorado em `x` do `Rectangle`, que o Recharts sempre devolve como o pixel da base (zero), não da ponta; para um valor negativo ou revertido isso colava o número junto da linha de zero, por cima da própria barra, e em faixas pequenas o halo cobria quase toda a marca. Corrigido para `x + width`, que resolve a ponta livre em qualquer sinal, igual ao lado direito já fazia. De quebra: `tabular-nums` nos números do título de cada lado em v1, v3 e v4 (TIP-1); percentual de composição inteiro nos dois lados de v3, igual ao tique (NUM-1); linha de leitura de v3 calculada dos dois termos líderes em vez de frase fixa (ANO-5); e ausência de v4 com `formatUnavailable()` e ícone `Unplug`, no lugar do literal `indisponível` (EST-2)._

_Correção de 2026-09-17 (4ª rodada), sobre a revisão que reprovou só a v4 pela dica que repetia o percentual do rótulo: `renderTooltip` passou a imprimir sempre `formatInt(leadsRaw)`/`formatInt(oppRaw)`, contagem absoluta, mesmo com `independent=true` (DIC-1); de quebra, o rótulo de composição da v4 passou a `formatPercent(x, 0)`, igual ao tique do eixo, o que também fecha a soma em 100% (NUM-1); os títulos de lado do `Overlay` da v4 ganharam `tabular-nums`, igual v1 e v3 (TIP-1); a leitura acessível da v4 encurtou para 236 caracteres (ACE-1); e o `meta.json` da v4 passou a dizer que o aviso mora na linha de leitura, não no título. A ala da mesma faixa escalonada em y (item abaixo) é pendência de v1, v3 e v4 juntas, de desenho do modelo, e fica fora desta rodada, que tratou só da reprovação da v4._

_Correção de 2026-09-18, decisão do dono sobre a espessura da marca (ESP-2) e reescrita do item 3 da Anatomia: em v1, v3 e v4 a marca mais fina do `<Bar>` media de 3 a 4 px, abaixo do piso de 12 px, porque a banda de cada faixa dividia duas séries dentro do mesmo canvas `card`/`alto`. Em vez de afinar a barra ou cortar faixa, o canvas de cada versão cresceu pela conta invertida da ESP-6 (passo = espessura desejada × séries + barGap × (séries − 1), dividido por 1 − 2 × barCategoryGap) até a marca chegar ao piso: v1 de 640x360 para 640x690 (marca a 15 px), v4 de 640x360 para 640x710 (marca a 15 px) e v3 de 640x560 para 640x1170 (marca no teto de `maxBarSize`, 14 px). O desvio de preset está declarado no `canvas` e no `notes` de cada `meta.json`. De quebra, o item 3 da Anatomia deste README foi reescrito: `stackId` diferente separa os dois lados em sub-faixas distintas da mesma banda, unidas apenas pelo `barGap`, e não os centra numa linha única como o texto anterior afirmava; e a frase acessível de v2 (324 caracteres) e v3 (284 caracteres) foi encurtada para caber na faixa de 100 a 250 da ACE-1, sem perder tipo, total e destaque._

- v3 e v4: o halo dos rótulos usa `--surface-raised` fixo. Se o visual for colado sobre outra superfície do Farol que não seja o cartão, o halo aparece como um retângulo de cor errada em volta do número. Não há token de "superfície do pai" no contrato para resolver isso na origem; registrado para quem colar decidir caso a caso.
- v2: a leitura declara as duas escalas independentes, mas o resumo do modelo pede escala comum; como a v4 é a versão desenhada para grandeza divergente, cabe lembrar que a v2 é a saída certa quando as duas métricas nem deveriam somar escala.
- v3: são 14 termos, acima do teto de cerca de 12 faixas que o catálogo indica para o modelo; o canvas alto segura, mas a barra fica fina.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-18 (6ª rodada). Resultado: as quatro versões aprovadas, nenhum bloqueante. `npm run check` sai com `0 com erro` e um aviso de folga na v4 (frase acessível em 236 dos 250 caracteres da ACE-1, dentro do teto); os dois temas foram olhados nos PNGs de conferência e os itens abaixo são acabamento ou desenho, não impedimento. Saíram desta lista, porque a correção de 2026-09-18 as resolveu: a marca em filete de v1, v3 e v4 (agora 14 a 15 px, medida pelo guarda ESP-2 nas quatro versões), a frase acessível acima de 250 caracteres em v2 e v3, e a contradição do item 3 da Anatomia, que foi reescrito._

- v1, v3 e v4: as duas alas da mesma faixa seguem em sub-faixas distintas da mesma banda, e não numa linha só. O item 3 da Anatomia agora descreve o comportamento certo, então deixou de ser contradição; continua sendo escolha de desenho a rever, porque o vão entre as duas alas cresceu junto com o canvas e, na v4, a ala de leads e a de oportunidades da mesma faixa ficam a cerca de 36 px uma da outra no PNG de conferência. O rótulo da faixa cai entre as duas e nenhum valor muda de dono.
- v1, v3 e v4: o canvas dobrou de altura para a marca chegar ao piso de 12 px da ESP-2, e o custo foi vão vertical: a v3 vai a 640x1170 e a v1 e a v4 passam de 690 px com cinco faixas. Cabe avaliar `barGap` negativo ou uma banda só por faixa antes de aceitar o preset esticado como padrão do modelo.
- v3: o peso 700 acende em nove das quatorze linhas, uma para cada termo com diferença acima de 10 p.p., e a TIP-3 pede peso 700 em no máximo dois elementos por visual. O destaque continua legível, mas deixa de ser destaque; a cor cheia contra o translúcido já separa os fortes sozinha.
- v2: os dois lados correm em escalas independentes (entradas até 121, agendas até 24), então a barra de 21 agendas sai quase o dobro da barra de 58 entradas. A linha de leitura declara as duas escalas e todo valor está escrito, mas o espelhamento convida à comparação direta de comprimento; vale avaliar um teto comum ou um vão maior entre as duas colunas.
- v3: `barCategoryGap` em 26%, abaixo da faixa de 30% a 40% da ESP-2.
- v1: os tiques do eixo imprimem `142` sem o substantivo que a NUM-6 pede para contagem; o título de cada lado supre em parte ao dizer "Leads (416)".
- v1, v3 e v4: o rótulo de valor já está escrito em cada ponta e mesmo assim o eixo de valor continua desenhado, o que a ROT-2 dispensa. Na v1 a nota do `meta.json` justifica a escolha pela prova da escala simétrica; nas outras duas a justificativa não está escrita.
- v2, v3 e v4: a linha de leitura sai em 11 px e quebra em duas linhas no canvas de conferência, enquanto a ANO-5 pede uma linha de 12 px.
- v1, v3 e v4: o nome da faixa sai centrado na coluna do eixo de categorias (`x={NAME_WIDTH / 2}`), e a TIP-6 pede texto alinhado à esquerda no tique do eixo Y. Com nomes de comprimento muito diferente, a borda esquerda da coluna fica serrilhada.
- v1 a v4: o rótulo de valor do lado que nasce do zero depende de o Recharts devolver `x` na base e a largura com sinal, armadilha que a 2ª rodada corrigiu e que só está registrada nas Pendências deste README. Um comentário de uma linha em cada `renderLeftValue` evita que a próxima cópia do padrão volte a colar o número sobre a barra.
- v4: a frase acessível fica a 14 caracteres do teto da ACE-1 e é calculada do dado, então um recorte com nome de faixa mais longo a empurra para fora. O check já avisa; vale encurtar a última oração antes que o aviso vire erro.
- v3: o aviso de ordem sai como texto do próprio `Chart` acima das barras, e o `meta.json` explica o porquê, mas a nota fica a 11 px e disputa a função da linha de leitura do `VisualCard`. Quem colar decide qual das duas mantém.
