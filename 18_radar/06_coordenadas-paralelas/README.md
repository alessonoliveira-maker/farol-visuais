# Coordenadas paralelas

## O que é

O radar desenrolado: cada métrica é um eixo vertical, os eixos ficam lado a lado, e cada entidade é uma linha que atravessa todos eles, tocando cada eixo na altura do próprio valor. O que se lê é o feixe, e não a linha: entidades de perfil parecido correm juntas, um grupo à parte aparece como feixe separado, e a entidade fora do padrão é a linha que cruza as outras. A posição só vale dentro do eixo, e só eixos vizinhos se comparam diretamente, então a ordem dos eixos é decisão de desenho. Aceita muito mais perfis que o radar e deixa cada eixo com a escala da sua unidade, desde que mínimo e máximo estejam escritos.

## Quando usar

- De 6 a 60 perfis em 4 a 8 métricas, quando a pergunta é padrão de grupo e entidade fora do padrão. As versões deste modelo vão de 14 origens em 6 eixos a 48 campanhas em 4.
- Métricas de unidades diferentes (R$, %, dias) que o radar só aceitaria normalizadas.
- Uma entidade em foco contra o conjunto em tom neutro, com a mediana das outras como base.
- Aba de análise, com leitor que tem hábito do gráfico ou com uma linha de leitura que ensina a ler.

## Quando evitar

- Leitor sem hábito do gráfico num painel operacional: use barras agrupadas (`02_barras-horizontais/02_barras-agrupadas`) ou tabela com mapa de calor (família `14`).
- Relação entre eixos que não são vizinhos: use dispersão (`09_dispersao-e-bolhas`) para o par de métricas que importa.
- Muitas linhas sem destaque nem filtro, o espaguete: ponha uma entidade em foco (`v2`) ou selecione por faixa num eixo (`v4`).
- Escalas diferentes sem mínimo e máximo rotulados em cada eixo: o leitor lê como escala única. Normalize e use a `v1`, ou rotule como na `v3`.
- Uma entidade só: use o radar simples (`01_radar-simples`) ou barras (`02_barras-horizontais/01_simples-ordenada`).
- Menos de 4 eixos: com dois é uma dispersão, com três o feixe ainda não forma padrão.

## Anatomia

1. `viewBox` igual ao corpo medido da moldura (894 px de largura, altura conforme o canvas), para a escala do SVG sair 1 e os 11 px declarados serem 11 px na tela (GEO-18). Todo texto é `<text>` de SVG, então as guardas de colisão e de contraste medem a peça.
2. Eixos verticais em `--line-strong` de 1 px, a intervalo fixo (`axisStep`), com o título centrado acima em `--text-secondary` de 11 px. Na `v1` e na `v2` a escala é comum, de 0 a 100, com tiques em 0, 50 e 100 em todos os eixos e os três níveis escritos uma vez, por `formatPercentFromScale100`. Na `v3` e na `v4` cada eixo tem domínio próprio (`outwardDomain`), com o máximo no topo e o mínimo no pé, por `formatCurrencyAxis`, `formatPercentFromScale100` ou `formatDays`.
3. Uma linha por entidade, em `<path>` de segmentos retos com `fill="none"`. A posição em cada eixo sai de uma função pura de escala (`yOf`). A linha é o dado (ACE-6): onde todas têm o mesmo peso ela vai em `--text-muted` com 1,5 px, que mede 5,21:1 no escuro e 5,37:1 no claro.
4. Foco e seleção (`v2`, `v4`): o aceso vai em `--chart-1`, mais grosso e desenhado por último; o resto apaga por token, em `--text-muted` opaco, nunca por opacidade (ACE-5). O par `--chart-1` contra `--text-muted` mede 1,82:1 e 1,12:1 (TOK-9), então o aceso se separa por espessura e por revestimento em `--surface-raised` (9,50:1 e 6,00:1, TOK-4); na `v2` o mesmo revestimento fica sob a mediana e a barra do vão.
5. O dado declara contagens e somas, nunca a taxa (DAD-1): `rateOf` e `metricOf` derivam o valor do eixo e devolvem `number | null`, porque divisor zero é ausência e não zero (EST-1b).
6. Ausência quebra a linha (EIX-10): `linePieces` encerra o trecho no último eixo medido, sem interpolar. A entidade ganha um anel vazado na faixa de ausência, abaixo do pé dos eixos, rotulada por `formatUnavailable()`. Zero medido é a linha que toca o pé do eixo. A faixa só ocupa altura quando existe ausência no recorte.
7. Coluna de nomes (`v1`, `v2`, `v3`): cada entidade é nomeada na altura em que a linha toca o eixo da ponta, com linha de chamada. `spreadLabels` espalha os nomes com passo de 14 px por regressão isotônica; o texto sai do lugar e a marca fina não leva halo (GEO-4). Na `v2` cada nome é um botão com `aria-pressed`.
8. Lista das selecionadas (`v4`): nome, marcador e a métrica de `rankBy` com o volume (`formatRateWithVolume`), em ordem dessa métrica.
9. Seleção por faixa (`v4`): traço de 6 px em `--chart-1` sobre o eixo e dois limites `role="slider"`, com arrasto pela matriz do SVG e teclado (setas, Home e End).
10. Referência do foco (`v2`): traço da mediana das outras entidades em cada eixo, em `--text-muted`, barra do vão no eixo de maior distância e anotação de uma linha com os dois números.
11. Linha de leitura calculada do dado no topo (ANO-5), 12 px, com o período do recorte (DAD-9). A frase acessível da raiz usa os mesmos textos já formatados (DAD-5).
12. Dica por `<title>` em cada linha, com o valor de todos os eixos e o volume de cada taxa (DIC-1). Em SVG puro é a dica possível, porque o `ChartTooltip` do Farol é um `content` de Recharts. Uma área de ponteiro de 8 a 10 px, sem tinta, acompanha cada linha.
13. `data` vazio, ou menos de dois eixos, troca o visual inteiro por um bloco `role="status"` (EST-1). Na `v4`, seleção sem campanha mantém o gráfico e troca só a lista por um bloco `role="status"`.

## Versões

- `v1_perfil-de-catorze-origens`: as seis taxas do funil de 14 origens de lead em 2026-08, na escala comum de 0 a 100. Demonstra os seis eixos com níveis 0, 50 e 100, um path por origem com posição em função pura, a ordem dos eixos que reduz cruzamentos (30, contra 28 da melhor das 720 ordens e 52 da pior), o grupo à parte achado pelo maior salto na média das taxas, a coluna de nomes e a dica com os seis valores.
- `v2_indicacao-de-cliente-em-foco`: a mesma base com Indicação de cliente em foco. Demonstra o foco em `--chart-1` com 2,5 px e desenhado por último, o contexto apagado por token em `--text-muted`, o nome em peso 700 e o valor escrito no cabeçalho de cada eixo, a troca de foco por clique na linha ou na coluna de nomes com `aria-pressed`, o traço da mediana das outras treze e a anotação na maior distância: 71,0% de taxa de agenda contra mediana de 28,0%.
- `v3_escala-propria-por-eixo`: custo por lead, taxa de agenda, win rate, ticket médio e ciclo das 14 origens no terceiro trimestre de 2026, cada eixo na sua unidade. Demonstra o domínio arredondado para fora a partir do recorte, o mínimo e o máximo rotulados com o formatador da unidade, a polaridade escrita sob o título sem inverter o eixo, o aviso de escala na linha de leitura e, na mesma linha, zero medido tocando o pé do eixo e métrica ausente como anel vazado.
- `v4_quarenta-e-oito-campanhas-com-lacunas`: 48 campanhas do terceiro trimestre de 2026 em quatro eixos, com seleção por faixa de custo por lead. Demonstra a seleção em estado React com dois limites `role="slider"`, as campanhas fora da faixa em neutro com a contagem 7 de 48 selecionadas, a lista das selecionadas em ordem de taxa de agenda, a métrica ausente que quebra o path com anel vazado na faixa de baixo (9 de 48 sem ciclo medido) e o estado vazio da seleção com `role="status"`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/OriginParallelCoordinates/`.
2. Troque o `import` do `./data` pelo seletor da página e mantenha a forma do dado: contagens e somas por entidade, e a lista `axes` na ordem de leitura. Não passe a taxa pronta: é o par de contagens que deixa a dica escrever o volume.
3. Refaça a conta da ordem dos eixos quando o dado mudar. A ordem é decisão de dado e fica em `axes`; o componente não reordena sozinho, para o mesmo eixo ficar no mesmo lugar em qualquer filtro.
4. Dê ao cartão a proporção do canvas declarado no `meta.json` de cada versão, ou mude `VIEW_HEIGHT` para a altura real do corpo. O `viewBox` tem a proporção do corpo da moldura do catálogo e o SVG escala junto: num cartão mais baixo o texto encolhe abaixo dos 11 px da TIP-2 sem nenhuma guarda acusar.
5. Confira a largura da coluna de nomes depois de trocar os rótulos: `LABEL_RIGHT`, `AXIS_LEFT` e `AXIS_RIGHT_PAD` foram dimensionados pela soma de glifo do nome mais largo do dado fictício (124 px). Na `v4`, o mesmo vale para `LIST_WIDTH`.
6. Mais de 16 entidades não cabem na coluna de nomes com passo de 14 px: aumente a altura do canvas, ou troque a coluna pela seleção com lista da `v4`.
7. Na `v2` e na `v4` o estado de foco e de faixa mora no componente e nasce das props `highlightId` e `brush`. Para o estado morar na página, levante-o e passe o valor pela prop com uma `key` que remonte o componente.
8. Troque o bloco `role="status"` por `EmptyState` do Farol, mantendo o sentido do texto (EST-6), e rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Alfred Inselberg, Parallel Coordinates: Visual Multidimensional Geometry and Its Applications (Springer, 2009): a origem do método e a leitura de correlação entre eixos vizinhos.
- [Data Visualisation Catalogue, Parallel Coordinates Plot](https://datavizcatalogue.com/methods/parallel_coordinates.html): a ordem dos eixos e o excesso de linhas como os dois riscos do gráfico.
- [From Data to Viz, Parallel plot](https://www.data-to-viz.com/graph/parallel.html): escala comum contra escala por eixo e o destaque de um grupo contra os demais.
- Stephen Few, Multivariate Analysis Using Parallel Coordinates (Perceptual Edge, 2006): seleção por faixa num eixo como remédio do espaguete.
- No Farol, `app/src/lib/format.ts` (formatadores usados em eixo, lista e dica) e `app/src/styles/tokens.css` (os tokens medidos nos `notes` de cada versão).
- Pedido registrado, sem contorno no componente: uma dica de SVG puro com fundo de token, equivalente ao `ChartTooltip`, que hoje só serve a Recharts. Até lá a dica é o `<title>` nativo.

## Observações do produtor

- Cor da linha na `v1` e na `v3`: a especificação do catálogo pede `--line-strong`, e a ACE-6 venceu, porque a linha é o dado e `--line-strong` mede 1,79:1 e 1,83:1. As linhas vão em `--text-muted`.
- Opacidade na `v2` e esmaecimento na `v4`: a especificação pede opacidade 0,3 e linhas esmaecidas, e a ACE-5 venceu. O contexto apaga por token, em `--text-muted` opaco (5,21:1 e 5,37:1), e a separação do aceso vem do revestimento em `--surface-raised`, não da cor.
- Valor do foco na `v2`: a especificação pede o valor escrito em cada eixo e o rótulo no fim da linha. O valor foi para uma pista sob o título do eixo, fora do plano, e o nome ficou no início da linha, na coluna que também é a lista lateral.
- Eixos da `v4`: o quarto eixo é comparecimento, e não win rate, para a ausência do ciclo não arrastar um zero por construção no eixo vizinho.
- O lado da coluna de nomes muda entre versões de propósito: fica no eixo da ponta em que as entidades mais se espalham (taxa de contato na `v1` e na `v2`, ciclo na `v3`).

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-10-13: `v1` e `v3` aprovadas, `v2` e `v4` reprovadas, com o parecer em `validation/revisao_18_radar__06_coordenadas-paralelas_2026-10-13.md`. Nada abaixo reprova._

- `v1` e `v3`: no ponteiro, a linha acesa em `--chart-1` mede 1,82:1 no escuro e 1,12:1 no claro contra as vizinhas em `--text-muted` (TOK-9). O segundo canal existe, 2,5 px contra 1,5 px e nome em 600, mas a nota do `meta.json` não registra a medida de marca contra marca.
- `v1`: o nome sob o ponteiro ganha o mesmo peso 600 e a mesma cor dos três nomes do grupo à parte; com o ponteiro numa origem do grupo grande, ela passa a parecer do grupo.
- `v1`: a "média das 6 taxas", que decide o grupo à parte, é média simples de seis taxas com bases diferentes. Está nomeada na linha de leitura; o corpo não diz que não é ponderada.
- `v1`, `v2`, `v3` e `v4`: a dica é o `<title>` nativo e só existe no ponteiro; o valor por entidade não chega ao teclado. O pedido de dica de SVG puro já está nas Referências.
- `v3`: a linha de leitura e a frase acessível dizem a estrutura (cada eixo com sua escala, menor é melhor em dois) e a lacuna (1 de 14), mas não dizem como as origens se comparam, que é a pergunta do cartão (ACE-1, ANO-5). O achado cabe numa frase: Indicação de cliente tem o melhor valor nos cinco eixos, empatada em custo por lead.
- `v3`: taxa de agenda e win rate são vizinhas, têm a mesma unidade e domínios diferentes (0% a 80% e 0% a 50%), então a inclinação entre os dois eixos não compara percentuais. O aviso da linha de leitura e os rótulos de pé e de topo cobrem.
- `v3`: o trecho de Lista de terceiros, que se encerra em win rate, não tem nome junto dele; o nome fica na faixa de ausência, ao lado do anel, e a ligação entre os dois só aparece no ponteiro. Com uma origem ausente não há dúvida; com duas ou mais haveria.
- `v3`: 8 das 14 origens ficam nos 31 px de baixo do eixo de custo por lead, abaixo de R$ 30 num domínio de R$ 0 a R$ 200 puxado por Evento presencial (R$ 186). É o dado, e a nota já registra.
- `v2`: a anotação tem 52 caracteres no dado padrão e chega a 56 com Mídia social patrocinada em foco, contra o teto de 50 da ANO-2, e não diz a métrica, que só se lê pela posição.
- `v2`: com volume de quatro dígitos o cabeçalho aperta; com Mídia social patrocinada em foco, `48,0% (1.373 de 2.860)` fica a cerca de 10 px do valor do eixo vizinho. Não colide neste dado.
- `v2`: o traço da mediana é cheio, de 2 px por 14 px, e a tabela 17.2 pede referência em 1 px tracejado `3 3`. Num traço de 14 px o tracejado não se leria; sem consequência no preview.
- `v4`: com os dois limites acima de R$ 100 e a no máximo R$ 5 um do outro, o rótulo juntado (`R$ 160 a R$ 160`) sai 11,8 px pela borda esquerda do corpo e perde o `R$` do limite de baixo; `R$ 10 a R$ 15` cabe com 1,8 px de folga. Canto de interação neste dado; com valores de quatro dígitos corta em toda faixa estreita.
- `v4`: depois do arrasto com o mouse, o limite fica com o contorno padrão do Chromium para SVG em `:focus` (`auto 5px`, quase preto). Não cobre texto.
- `v4`: as três linhas do bloco `role="status"` são `tspan` sem espaço entre elas, e o texto sai "faixa:arraste" e "setasdo teclado" para quem lê o conteúdo.
- `v4`: a linha de leitura deixa "sem ciclo medido" subentendido na segunda metade ("2 das 7 selecionadas"), e de primeira se lê que 2 das 7 foram selecionadas.
- `v4`: com o limite na ponta do eixo, o rótulo do limite fica a 10 px do rótulo de máximo ou de mínimo, com o mesmo texto (`R$ 160` duas vezes, `R$ 0` duas vezes).
- `v4`: as 7 selecionadas têm a mesma cor e a lista não se liga às linhas por traço; casa-se nome e linha pela ordem em que elas tocam o eixo de taxa de agenda, que é a ordem da lista, ou pelo ponteiro. O cabeçalho da coluna diz a métrica e não diz que é a ordem.
- `v4`: o marcador vazado da lista, de campanha com métrica ausente, não tem palavra ao lado; o sentido vem da faixa de ausência (ACE-2).
- `v1`, `v2`, `v3` e `v4`: há espessura solta no JSX (`strokeWidth={1}` em eixo e chamada, `1.5` no ponto do foco da `v2` e no marcador da lista da `v4`) que merece constante no topo, e medidas fora do múltiplo de 2 px da ESP-1 (`MARKER_STEP` de 9 e de 11, `HANDLE_RADIUS` de 5,5, `MERGE_BELOW` de 13). Sem consequência no preview.

_Segunda revisão independente de 2026-10-13, depois da rodada de correção: `v2` e `v4` julgadas pelo arquivo das 09:15 e aprovadas, com as 14 linhas da `v2` e as 48 da `v4` refeitas do dado, os 14 focos da `v2` e 12 estados de faixa da `v4` sondados em página viva nos dois temas. Nada abaixo reprova. Do parágrafo anterior deixaram de valer, no arquivo de hoje, a anotação da `v2` acima de 50 caracteres (agora de 35 a 41, com o nome da métrica) e os `tspan` sem espaço do bloco `role="status"` da `v4`; os demais itens da `v2` e da `v4` continuam valendo._

- `v4`: a mais pesada. Com os dois limites a partir de R$ 100 e a no máximo R$ 5 um do outro, o rótulo juntado (`R$ 100 a R$ 105`) sai 11,8 px pela borda esquerda do corpo e perde o `R` e parte do `$` do limite de baixo; `R$ 10 a R$ 15` cabe com 1,8 px. A faixa inteira continua escrita na linha de leitura. Com valor de quatro dígitos o corte aparece em toda faixa estreita: reserve a largura do rótulo juntado em `AXIS_LEFT`, ou escreva os dois limites em duas linhas.
- `v4`: com o limite na ponta do eixo (Home, End ou arrasto até o fim), o anel do limite encosta no rótulo de mínimo ou de máximo do eixo, e o rótulo do limite repete o mesmo texto ao lado: `R$ 160` duas vezes, com 6,2 px de sobreposição horizontal e linhas de base a 10 px, e `R$ 0` duas vezes, a 0,6 px. Com o foco de teclado, o contorno de 2 px do limite risca o rótulo do eixo. O valor continua legível no rótulo do limite; esconder o rótulo do limite quando ele coincide com a ponta resolve os dois.
- `v4`: a linha de leitura não trata o singular (`0 das 1 selecionadas`, com a faixa de R$ 100 a R$ 105); a frase acessível trata (`fica 1`).
- `v4`: na lista, o realce por ponteiro só dispara sobre o texto e o marcador; no vão entre o nome e a taxa a linha da lista não responde, porque o grupo não tem área de ponteiro.
- `v4`: a linha de contexto sob o ponteiro vai a 2 px em `--text-secondary`, a mesma espessura das selecionadas e sem revestimento; no tema claro só o matiz a separa de uma selecionada.
- `v4`: linha de contexto que passa em ângulo raso sob várias selecionadas sai picotada pelo revestimento (Portal setorial 07 no primeiro vão, sob as sete) e fica com cara de tracejado, que na EIX-10 quer dizer período parcial.
- `v4`: taxa de agenda e comparecimento são vizinhas, têm a mesma unidade e domínios diferentes (0% a 60% e 45% a 90%), e a linha de leitura não avisa que cada eixo tem sua escala, como a `v3` avisa. Os rótulos de pé e de topo cobrem.
- `v2`: com volume de quatro dígitos o cabeçalho fica a 8,5 px do valor vizinho (Busca paga e Mídia social patrocinada em foco: `61,0% (1.305 de 2.140)` e `33,0% (431 de 1.305)`). Não colide neste dado.
- `v2`: com o foco abaixo da mediana em todos os eixos, a linha de leitura escreve "supera a mediana das outras 13 origens em 0 das 6 taxas" (cinco das 14 origens); a frase direta seria dizer que fica abaixo nas seis.
- `v2`: o indicador de foco de teclado é uma barra de 3 por 12 px em `--ring`, a 2 px do nome (9,50:1 e 6,00:1). Vê-se, mas é pequeno e tem a cor da chamada da origem em foco, que nasce 3 px à direita dele.
- `v2`: o catálogo pede o rótulo no fim da linha em foco e o nome fica no início, na coluna da esquerda. Julgado e não reprova: o foco está nomeado em 700 junto da própria linha, cada eixo tem o valor escrito e o desvio está declarado na nota; o ponto do último eixo fica sem nome ao lado.
