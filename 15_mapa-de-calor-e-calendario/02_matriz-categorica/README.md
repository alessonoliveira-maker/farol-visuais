# Matriz categórica em cor

## O que é

O heatmap clássico em tabela: uma dimensão categórica nas linhas, outra nas colunas, e a mesma
medida em todas as células. A cor mostra o padrão numa olhada só, o número escrito em cada célula
prova o valor exato, e a ordenação das linhas decide se o leitor enxerga o padrão ou uma sopa de
cores. É o primitivo `HeatGrid` da família 15, e as quatro versões percorrem as quatro variações que
o estudo previu: taxa por par com amostra declarada, totais marginais, eixo agrupado em dois níveis e
célula de tamanho variável para taxa com volume.

## Quando usar

- Achar extremos e padrões entre duas dimensões de categoria: executivo por segmento, motivo por
  etapa, plataforma por mês.
- Até uns 15 por 12 células com número escrito; acima disso, cor sem número e valor exato na dica.
- Padrão da grade e peso de cada linha ao mesmo tempo, com barras de total nas margens.
- Hierarquia curta num eixo (canal e origem, ano e trimestre), com vão maior entre grupos.
- Taxa que só faz sentido junto do volume, com o tamanho da célula carregando o volume.

## Quando evitar

- Colunas com unidades diferentes ou texto: tabela com heatmap nas células (família 14, modelo 02).
- Leitura de valor fino entre células vizinhas: barras agrupadas (família 03) ou barras horizontais
  (família 02).
- Eixo de tempo contínuo com muitas entidades: lasagna (modelo 06 desta família).
- Mesma lista de estados nos dois eixos: matriz de transição (modelo 07 desta família).
- Hierarquia com mais de dois níveis: treemap ou árvore (família 12).
- Público sem hábito de dupla codificação cor e tamanho: preferir dois heatmaps lado a lado.

## Anatomia

1. **Rótulos de coluna**, centrados sobre cada coluna, em `--text-secondary` de 12 px, na ordem do
   domínio (funil, calendário) e nunca na ordem de volume.
2. **Rótulos de linha**, alinhados à direita da grade, em `--text-secondary` de 12 px, sem reticência
   mesmo no nome mais longo (TIP-7). Quando o eixo tem dois níveis, o nível de cima ganha uma coluna
   própria à esquerda, centrada pela extensão desenhada do grupo, nunca pela contagem de itens.
3. **Célula colorida** por escala sequencial fixa, com vão de 2 px na cor do cartão entre células,
   que é o mínimo que a COR-5 pede para marcas que não contrastam entre si.
4. **Número escrito em toda célula**, em `--text-primary` nas faixas claras da rampa e
   `--accent-cyan-contrast` nas escuras, vazado e **sem halo** (ROT-7b), porque a marca está inteira
   por baixo. É este número que autoriza a rampa de cinco degraus, pela isenção da TOK-8.
5. **Estados de célula, em canais diferentes:** valor medido recebe a faixa e o número; zero medido
   recebe o poço `--surface-sunken` com contorno sólido e o zero escrito (EST-3); par sem registro
   recebe contorno tracejado, e o rótulo de `formatUnavailable()` quando a célula é larga o bastante
   para ele (EST-2).
6. **Margens de total**, quando a versão as tem: barra em `--text-muted`, fora da rampa do miolo,
   com o número escrito ao lado e **régua de comprimento comum às duas margens**, para que barras de
   igual comprimento contem igual nos dois sentidos.
7. **Legenda de escala**, sempre com o **intervalo de cada faixa escrito**, porque degrau contra
   degrau a rampa mede de 1,23:1 a 1,52:1 e a cor sozinha não ordena (TOK-8). Quando a versão também
   codifica tamanho, a legenda de tamanho traz três referências **calculadas do dado**, terminando no
   maior valor observado (ROT-5b).
8. **Linha de leitura e anotação**, uma de cada, calculadas do dado: a conclusão em 12 px no topo do
   corpo e a anotação de até 50 caracteres em 11 px logo abaixo (ANO-2, ANO-5).

## Versões

- `v1_win-rate-por-executivo-e-segmento`: HeatGrid de 10 executivos por 5 segmentos de cliente, com
  taxa e volume escritos em cada célula, ordenação por taxa geral ponderada ou por semelhança de
  perfil (cadeia do vizinho mais próximo), texto em token claro ou escuro conforme a faixa, contorno
  cheio na maior taxa de cada segmento e contorno pontilhado onde a amostra é rala demais para a
  taxa concluir.
- `v2_perdas-por-motivo-e-etapa-com-totais`: 7 motivos de perda por 5 etapas do funil, com barra de
  total por motivo à direita e por etapa embaixo no mesmo SVG, duas escalas nomeadas (cor para o par,
  comprimento para o total), régua de comprimento comum às duas margens com teto no maior total, e os
  três estados de célula separados. Preview:
  [preview.svg](v2_perdas-por-motivo-e-etapa-com-totais/preview.svg) e
  [preview-claro.svg](v2_perdas-por-motivo-e-etapa-com-totais/preview-claro.svg).
- `v3_leads-por-origem-agrupada-em-canal`: 14 origens agrupadas em 3 canais mais uma linha fora dos
  grupos, por 12 meses, com o eixo de linhas em dois níveis, vão de 8 px na troca de canal e 2 px
  entre itens acumulados no y, grupos desiguais de 7 e de 2 origens, Sem origem declarada em neutro e
  fora do teto da rampa, e o mês parcial com moldura tracejada no vão e a data de corte no rodapé.
  Preview: [preview.svg](v3_leads-por-origem-agrupada-em-canal/preview.svg) e
  [preview-claro.svg](v3_leads-por-origem-agrupada-em-canal/preview-claro.svg).
- `v4_taxa-e-volume-em-celula-de-tamanho-variavel`: 8 origens por 6 meses com o lado do quadrado pela
  raiz do volume e a cor pela taxa em três faixas nomeadas, quatro estados de célula, zero lead
  medido em ponto neutro, amostra rala só de contorno, e duas legendas, a de tamanho com três
  referências calculadas do dado. Preview:
  [preview.svg](v4_taxa-e-volume-em-celula-de-tamanho-variavel/preview.svg) e
  [preview-claro.svg](v4_taxa-e-volume-em-celula-de-tamanho-variavel/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` (ou promova para `app/src/components/visuals/` se
   mais de uma página for usar o modelo).
2. Troque as constantes de domínio (`SEGMENTS`, `STAGES`, `CHANNELS`, `MONTHS`) e o array `data` pelos
   valores reais vindos do seletor da página, mantendo o formato de **contagem** por par (`wins` e
   `closed`, `leads` e `agendas`, contagem de perdas). Todas as quatro versões derivam a taxa das
   contagens de propósito: passar taxa pronta abre a porta para o percentual escrito divergir do
   volume escrito ao lado dele.
3. Mantenha `null` para par sem medição e `0` para zero medido. É essa diferença que os três estados
   de célula desenham, e achatar os dois em zero é a armadilha DAD-2, a mais redescoberta do acervo.
4. Embrulhe no `VisualCard` do Farol, passando `title` e `useCase` do `meta.json` como `title` e
   `subtitle`; o Chart não desenha título nem etiqueta de procedência (ANO-6).
5. Dê altura ao pai (a linha da grade no CSS Grid do Farol) ou passe `height`; sem altura, a grade
   não tem onde desenhar.
6. Respeite a largura mínima do cartão. As quatro versões escalam o `viewBox` com o contêiner, então
   em cartão estreito o texto de 11 px cai abaixo do piso da TIP-2 antes de a grade quebrar linha: no
   corpo de 894 px do catálogo o texto está no piso, e qualquer redução o tira de lá.
7. Se o número de linhas variar muito, suba a altura do canvas antes de afinar a célula: a régua da
   GEO-1 só tem um sentido, quem cede é a altura da tela e nunca o piso de leitura.
8. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [AG Charts, heatmap com rótulos](https://www.ag-grid.com/charts/gallery/heatmap-with-labels/): observar formatador de rótulo na célula e legenda em gradiente.
- Catálogo: [Nivo, HeatMap](https://nivo.rocks/heatmap/): observar escalas sequencial, divergente e quantizada e a cor dedicada para nulo.
- Catálogo: [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): observar os erros comuns de normalização, ordenação e paleta.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): observar a lista de tarefas de leitura de heatmap e o limite de sete faixas.
- Portal de design: [Behance, monitoramento de dados com heatmaps e radares](https://www.behance.net/gallery/221169407/Data-Monitoring-Merchant-Heatmaps-Radars): observar heatmaps em painel operacional (só metadados em texto verificados).
- Irmão que resolveu o mesmo dilema de escala: `15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora`, cuja `v1` usa cinco faixas com número na célula e cuja `v3` usa três faixas nomeadas sem número, pela mesma TOK-8.

## Quantos níveis de cor a rampa afirma, e por que isto está na Anatomia

Medido em 2026-09-28 contra `--surface-raised`, degrau contra degrau da rampa sequencial do Farol:

| Par vizinho | Escuro | Claro |
|---|---|---|
| `--seq-1` contra `--seq-2` | 1,38:1 | 1,23:1 |
| `--seq-2` contra `--seq-3` | 1,45:1 | 1,29:1 |
| `--seq-3` contra `--seq-6` | **3,03:1** | 2,84:1 |
| `--seq-6` contra `--seq-7` | 1,45:1 | 1,52:1 |
| `--seq-5` contra `--seq-6` | 1,42:1 | 1,46:1 |
| `--seq-5` contra `--seq-7` | 2,07:1 | 2,23:1 |

A leitura honesta é uma só: **a escala de cinco degraus afirma dois níveis, baixo e alto**, porque o
único salto que chega perto de 3:1 é o de `--seq-3` para `--seq-6`. Os cinco degraus servem de
varredura, e a ordem fina mora no **número escrito em toda célula**. Nas versões sem número na
célula, que é o caso da `v4`, a TOK-8 manda ficar em `--seq-5`, `--seq-6` e `--seq-7`, e ali nenhum
par sequer alcança 3:1: a peça declara dois níveis e carrega a ordem pelo intervalo escrito da faixa,
pela ordenação das linhas e pela taxa com volume escrita na margem. Nenhuma versão deste modelo
afirma cinco níveis de cor, e dizer o contrário seria mentira de desenho.

## Colisões entre catálogo e CONTRATO, resolvidas a favor do CONTRATO

Registradas aqui e na nota do `meta.json` de cada versão, como a régua manda.

- **`v3`, vão entre itens.** O catálogo pede 1 px entre itens do mesmo grupo; a versão usa 2 px,
  porque a COR-5 exige vão de pelo menos 1,5 px entre marcas que não contrastam entre si, e vizinhos
  da rampa medem de 1,23:1 a 1,52:1. A ESP-1 também pede distância em múltiplo de 2 px.
- **`v3`, Sem origem declarada em neutro.** O catálogo diz "em neutro" sem dizer o que recebe o
  neutro. O neutro foi aplicado à célula, e não só ao rótulo, pelo motivo da seção 7 do contrato: a
  ausência de atribuição não pode aparecer como um degrau da mesma escala, porque isso convida a
  comparar um desconhecido com um conhecido. Por isso essa linha também fica fora do cálculo do teto
  da rampa.
- **`v4`, número na célula.** O catálogo não pede número na célula, e ele não caberia: o menor
  quadrado preenchido tem 8,5 px de lado contra os 17 px que um texto de 11 px exige. É por isso que
  a `v4` fica nos três degraus da TOK-8 em vez dos cinco das irmãs, e por isso ela declara dois
  níveis de cor.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-20, sobre a `v1`._

- O contorno de destaque não tem chave na tela. Quem olha o cartão vê cinco células contornadas e
  não sabe que elas marcam a maior taxa de cada segmento; a frase acessível também não diz. Uma
  anotação de até 50 caracteres (ANO-2) resolveria.
- O contorno em `--text-primary` mede 2,09:1 sobre `--seq-6` no tema escuro e 3,30:1 no claro. Fica
  dentro da isenção da ACE-3 porque o valor está escrito na célula, mas é o canal mais fraco do
  desenho e some primeiro em tela pequena.
- O alternador não congela a ordem ao filtrar, como o catálogo pede. `rows` é recalculado do `data`
  recebido a cada render, então um recorte menor reencadeia a semelhança desde outra semente; o
  comentário do `Chart.tsx` afirma o contrário.
- Quitado em 2026-10-02: a `v1` agora desenha o SVG em escala 1 (largura e altura fixas no tamanho do
  `viewBox`, 536 por 436) num canvas de 640 por 632, com o texto da grade em 11 px ou mais. Em cartão
  estreito do Farol, que não tem esses 640 px, o piso continua valendo só se o cartão comportar a grade.

_Revisão de 2026-10-02, sobre a `v1`, pelo desenho novo dos botões (render de 2026-10-02). Os
bloqueantes desta rodada estão em
`validation/revisao_15_mapa-de-calor-e-calendario__02_matriz-categorica_2026-10-02.md`; aqui fica só
o que não reprova._

- `v1`: os botões do alternador estão íntegros nos dois temas no desenho novo: 22 px de altura os
  dois, texto de 12 px centrado e na mesma linha de base de "Ordenar por", sem corte nem colisão.
- `v1`: a borda do botão inativo mede 1,25:1 no escuro e 1,29:1 no claro contra o cartão, e a do
  ativo 1,79:1 e 1,83:1. O estado se lê pelo peso e pela cor do texto; a pílula quase não se vê.
- `v1`: a frase acessível (167 caracteres) começa por "Win rate de 10 executivos" e não pelo tipo do
  gráfico, como a ACE-1 pede. O ramo de vazio já começa por "Matriz de calor".
- `v1`: a legenda fica abaixo da grade e explica os dois contornos só por palavra, sem amostra na
  forma da marca (ROT-4). A régua de cor escreve só 0% e 100%, e a Anatomia acima pede o intervalo
  de cada faixa.
- `v1`: o primeiro degrau da régua de cor mede 1,14:1 no escuro e 1,21:1 no claro contra o cartão.
  Vale a isenção da ACE-3 pelo "0%" escrito ao lado, mas a amostra quase some.
- `v1`: o contorno pontilhado sobre `--seq-3` mede 2,27:1 no escuro e 2,80:1 no claro (uma célula,
  3 de 7). O volume escrito na célula sustenta a leitura.
- `v1`: "0%" e "100%" da régua de cor são literais no JSX, fora do `formatPercent`.
- `v1`: a taxa geral que ordena as linhas, e que a frase acessível cita (64,5%), não está escrita no
  corpo do cartão.
- `v1`: o catálogo ainda pede que o alternador congele a ordem ao filtrar. A versão não congela, e o
  comentário do `Chart.tsx` hoje diz isso com honestidade; falta alinhar o texto do catálogo.
- Segue valendo da revisão de 2026-09-20: o contorno cheio mede 2,09:1 sobre `--seq-6` no escuro e
  3,30:1 no claro.

_Segunda revisão de 2026-10-02, sobre a `v1`, depois da correção do mesmo dia. Os dois bloqueantes
do parecer anterior foram conferidos no arquivo e no preview de hoje e estão quitados: a grade sai
em 536 por 436 px sobre `viewBox` de 536 por 436 (escala 1, com 55 textos em 11 px, 15 em 12 px e 49
em 14 px), as guardas COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA voltaram a medir a versão, e
`overallRate` devolve `number | null` com o nulo por último na ordem e fora da frase. Versão
aprovada; aqui fica só o que não reprova._

- `v1`: a grade agora tem tamanho fixo e não encolhe. Em corpo menor que 536 por 510 px ela
  transborda centrada, por cima dos botões e da legenda, em vez de escalar; no canvas do catálogo a
  folga de altura é de 3,5 px. O item 6 de Como colar ainda diz que as quatro versões escalam o
  `viewBox` e cita o corpo de 894 px, o que deixou de valer para a `v1`.
- `v1`: a frase acessível segue começando por "Win rate de 10 executivos" e não pelo tipo do gráfico
  (ACE-1). A observação da primeira revisão do dia não foi atendida na rodada de correção.
- `v1`: com dado não vazio em que nenhum par tem fechada, a frase vira "Matriz de calor sem
  executivos para comparar.", com 45 caracteres (piso de 100 da ACE-1) e negando executivos que
  existem. O texto "Nenhum executivo tem oportunidade fechada para liderar" nunca é alcançado,
  porque líder sem taxa implica segmento mais fraco sem taxa, e esse caso cai no outro ramo.
- `v1`: a célula sem fechadas escreve `formatUnavailable()` sem o ícone `Unplug` da EST-2 e com
  contorno sólido, e o pontilhado marca amostra rala. O item 5 da Anatomia descreve o inverso
  (tracejado para par sem registro); a ausência se lê pela palavra e pela forma vazada.
- `v1`: as linhas de base do texto (14 e 29 no cabeçalho, 16 e 30 na célula) e o recuo de 8 px do
  nome do executivo são números soltos no JSX, fora das constantes do topo do arquivo.
- `v1`: a faixa `--seq-7` (taxa de 80% ou mais) continua sem célula no dado. Medido pela amostra da
  legenda, `--accent-cyan-contrast` sobre ela dá 10,72:1 no escuro e 8,29:1 no claro.
- `v1`: pares medidos hoje no preview, escuro e claro: texto sobre `--seq-1`, `--seq-2` e `--seq-3`
  em 12,69, 9,21 e 6,33:1 e em 14,82, 12,05 e 9,35:1; sobre `--seq-6` em 7,38:1 e 5,45:1; pontilhado
  sobre `--seq-2` em 3,30:1 e 3,60:1.
- Seguem valendo, sem mudança no arquivo: legenda abaixo da grade e contornos explicados só por
  palavra, "0%" e "100%" literais, taxa geral fora do corpo do cartão, borda fraca dos botões e o
  texto do catálogo sobre congelar a ordem ao filtrar.

_Revisão de 2026-10-15, primeira das versões 2, 3 e 4 (render de 2026-10-02). As três foram
aprovadas sem bloqueante; aqui fica só o que não reprova._

- `v2`: os valores das margens não ficam na ponta livre (ROT-2). O total de etapa fica abaixo da base
  da barra, que é o zero, e o total de motivo fica numa coluna alinhada à direita, a cerca de 67 px da
  ponta em Decisor trocou (39). No render a leitura está íntegra e sem colisão.
- `v2`: a linha de leitura escreve a participação da etapa com uma casa, "24,5% (212 de 867)", por
  `formatRateWithVolume`. A NUM-1 pede percentual de composição inteiro, e a anotação logo abaixo já
  usa 46%.
- `v2`: a célula ausente escreve `formatUnavailable()` sem o ícone `Unplug` da EST-2. O `data.ts` diz
  que Preço e Decisor trocou não existem na Triagem, então "indisponível" sugere medição perdida
  onde o motivo simplesmente não se aplica, e põe em dúvida o total de 199 da Triagem, que fica só 13
  perdas abaixo da Proposta. A legenda "motivo sem registro na etapa" segura a leitura.
- `v2`: com dado em que todo par medido é zero, a peça mostra o bloco de vazio "Nenhuma perda
  registrada" no lugar da matriz de zeros medidos (a EST-3 manda desenhar o zero), e o motivo com a
  linha toda nula some da matriz sem aviso. O mesmo vale para a `v3`.
- `v2` e `v3`: a legenda fica abaixo da grade (ROT-4) e a amostra `--seq-1` mede 1,14:1 contra o
  cartão no escuro. A isenção da ACE-3 vale pelo intervalo escrito ao lado, como na `v1`.
- `v3`: o catálogo pede indicação com 1 origem e o dado tem 2. O desvio não está nas colisões
  declaradas acima nem na nota do `meta.json`, e assim o grupo de um item só, em que o rótulo de canal
  divide a linha com o da origem, fica sem exercício.
- `v3`: a frase acessível diz "15 origens em 3 canais" e o subtítulo diz 14 origens: Sem origem
  declarada entra na contagem e fica fora dos canais. A frase também não diz que set/26 é parcial.
- `v3`: o caso de uso pergunta como os leads evoluíram, mas a linha de leitura fala de composição
  (Mídia paga 55,8%, com uma casa, contra a NUM-1) e a anotação fala do total (Busca paga 1.347
  leads, sem dizer "total", NUM-5). Nenhuma das duas fala da evolução.
- `v4`: set/26 repete os valores do mês parcial da `v3` (Busca paga 71 contra 160 em ago/26, e as
  oito origens com cerca de metade do volume), mas a `v4` não declara mês parcial. O desenho lê como
  queda de setembro em todas as origens, o "32 vezes o menor" da anotação compara com um par de
  set/26 e as duas células de amostra rala existem só nesse mês. Se o recorte é o mesmo da `v3`, falta
  a marcação da EIX-10; se não é, convém trocar o dado do último mês.
- `v4`: a taxa de cada célula vive só na cor, em três degraus que medem 1,42:1 e 1,45:1 entre
  vizinhos, sem número e sem dica. É o regime declarado da TOK-8 e a margem escreve a taxa da linha,
  mas o valor exato do par não aparece em lugar nenhum (a DIC-1 aceita dica com o par volume e taxa).
- `v4`: a régua de tamanho desenha quadrados só de contorno, que é também o desenho do estado
  "contorno sem preenchimento: menos de 8 leads". A amostra não tem a forma da marca preenchida (ROT-4).
- `v4`: as faixas de cor imprimem a borda duas vezes, "7,4% a 24,9%" e "24,9% a 42,5%", sem dizer em
  qual faixa cai a taxa de 24,9%.
- `v4`: o caso de uso do `meta.json` diz "3 agendas em 5 leads" e o do catálogo diz "2 leads com
  100%"; o dado não tem nenhum par de 100%.
- `v4`: a linha de leitura nomeia a origem de maior taxa e menor volume (Indicação de cliente, "3,2%
  dos leads", com uma casa, contra a NUM-1), justamente a armadilha que a versão existe para conter,
  e não nomeia a origem que responde à pergunta (Acesso direto, 41,2% em 233, ou Busca orgânica,
  31,7% em 565). A coluna de taxa com volume à direita não tem cabeçalho que a nomeie como taxa do
  período (NUM-5).
- `v4`: o canto de 2 px tira 3,4 px² de área, 4,7% do menor quadrado preenchido (8,5 px de lado), sem
  consequência visível. Já o `MIN_SIDE` passa a agir quando o teto supera 288 leads, e aí achata a
  área do quadrado preenchido sem que a régua de tamanho saiba (GEO-16).
- `v2`, `v3` e `v4`: no preview o svg está em escala 1 (894 px sobre `viewBox` de 894), com texto em
  11 e 12 px. Como as três escalam com o contêiner, em cartão mais estreito o texto cai abaixo do
  piso da TIP-2 (GEO-18), como o item 6 de Como colar já avisa.

## Correção de 2026-09-24

A `v1` estava reprovada por NUM-1: a célula escrevia só a taxa, com o n indo de 3 a 31, e a coluna
Agronegócio, que responde à pergunta do cartão, é justamente a de menor volume. A correção mexeu em
quatro pontos e resolveu de passagem duas observações antigas desta lista:

1. O `data.ts` passou a declarar `{ wins, closed }` em vez de `{ rate, n }`, e a taxa é derivada no
   componente. O percentual escrito e o volume escrito não têm mais como divergir.
2. A célula ganhou altura (26 para 38) e duas linhas: taxa em 14 px, `ganhas de fechadas` em 11 px.
3. O cabeçalho de coluna ganhou o total de fechadas do segmento, e o contorno pontilhado marca a
   célula abaixo de 8 fechadas. O destaque de maior taxa do segmento passou a ignorar as células
   abaixo desse piso, senão o contorno premiaria 3 de 5.
4. Par sem oportunidade fechada virou ausência declarada, o que fecha a observação do `?? 0`; a
   legenda passou a explicar os dois contornos, o que fecha a observação da chave que faltava.

Segue valendo, e não bloqueia: o contorno cheio em `--text-primary` é o canal mais fraco do desenho
e some primeiro em tela pequena, e o SVG escala com o contêiner, então em cartão estreito o texto
de 12 px cai abaixo do piso de 11 px da TIP-2. Os dois são acabamento de colagem, a resolver quando
o visual entrar numa página do Farol.

## O defeito que a v1 propaga, e a regra que vence

_Levantado em 2026-09-28, ao produzir as versões 2, 3 e 4._

_Quitado em 2026-10-02: `overallRate` da `v1` agora devolve `number | null`, a ordenação põe o `null` por último, a frase acessível não cita taxa de quem não tem fechadas e a `distance` afasta esse executivo em vez de usar zero. A linha 87 citada abaixo é a de antes da correção._

A `v1` declara `overallRate` com retorno `number` e devolve `0` para carteira vazia, em
[`v1_win-rate-por-executivo-e-segmento/Chart.tsx:87`](v1_win-rate-por-executivo-e-segmento/Chart.tsx):
`return closed === 0 ? 0 : wins / closed;`. A regra que vence é a **EST-1b** do `CONTRATO.md`, emenda
de 2026-09-28: toda função que agrega uma lista declara retorno `number | null` e devolve `null` para
lista vazia, nunca `0`. O caminho do defeito está na mesma linha: `overallRate` alimenta a ordenação
e a `distance`, então um executivo sem nenhuma oportunidade fechada seria ordenado como se tivesse
taxa zero, que é desempenho medido, e não como quem não tem medição. O mesmo arquivo repete o padrão
na linha 175, `rate: closed === 0 ? null : wins / closed`, e ali está certo: a diferença entre as duas
linhas é só que uma virou `null` e a outra não.

As versões 2, 3 e 4 não repetem nada disso: `measuredTotal`, `medianOf`, `maxOf`, `minOf` e `rateOf`
declaram `number | null` e devolvem `null` na lista vazia, e o único zero que sobra é a semente do
`reduce` da soma, onde somar zero é a definição certa. Também não há `?? 0` sobre agregação em
nenhuma das três; onde o `noUncheckedIndexedAccess` obriga a fechar um índice, o fechamento é
`?? null` e o `null` é tratado, e onde uma lista precisa ser estreitada, o estreitamento é por
predicado de tipo e não por `?? 0`, que é a forma que passa **calada** pela guarda quando está sobre
um `Map.get`.

## Pendências conhecidas

- v1, TAMANHO-TEXTO: a guarda não acusa mais; falta remover a chave `TAMANHO-TEXTO` desta versão em `_render/scripts/lib/divida-guardas.json` (o corretor não edita esse arquivo; o `check` avisa).
