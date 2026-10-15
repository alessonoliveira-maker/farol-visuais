# Anéis concêntricos de metas

## O que é

Três anéis encaixados, do maior para o menor, um por meta independente do mesmo dono e do mesmo
período. Cada anel fecha ou não fecha: é uma leitura binária, no estilo dos anéis de atividade do
relógio. Nenhum anel pretende ser lido em valor absoluto pelo próprio comprimento de arco: o dado
bruto, a meta e o percentual de cada anel vão escritos numa lista ao lado, porque o defeito de
percepção do formato não tem conserto dentro dele mesmo.

**O viés estrutural, por escrito.** Com o mesmo percentual, o anel de fora desenha um arco
fisicamente mais longo que o de dentro, porque o comprimento do arco cresce com o raio para o
mesmo ângulo. 60% no anel externo ocupa mais espaço visual que 60% no anel interno, embora as duas
metas estejam igualmente atingidas. As três versões deste modelo compensam isso da mesma forma:
nunca comparando anéis pelo olho, sempre escrevendo o valor de cada meta ao lado do anel
correspondente, e reservando a ordem dos anéis (de fora para dentro) para a importância
declarada no dado, nunca para o tamanho do percentual.

## Quando usar

- De 2 a 3 metas independentes da mesma pessoa ou equipe no mesmo período (v1).
- Leitura de quem fechou todas as metas, numa grade de até 6 pessoas na mesma escala (v2).
- Cartão de abertura da pré-vendas com entradas, agendas e SLA da semana (v1, v2, v3).
- Pessoa com meta proporcional ao tempo de casa, meta ainda não definida ou estouro de meta (v3).

## Quando evitar

- Comparar uma meta com a outra: o anel de fora parece maior mesmo quando os percentuais são
  iguais. Use o painel de bullets (13/02), que compartilha uma única escala linear.
- Mais de 3 anéis, ou 4 sem um raio externo grande: os anéis internos ficam finos demais para
  segurar espessura de marca legível.
- Várias entidades em três ou mais dimensões comparáveis entre si: radar (família 18) ou tabela
  visual (14/01).
- Meta revisada no meio do período: o anel fechado apaga o histórico da revisão. Use o burn-up
  (04/06), que tem eixo de tempo.

## Anatomia

1. **Anéis concêntricos.** Um `RadialBar` por meta, cada um com a própria banda de raio
   (`innerRadius`/`outerRadius` em percentual), do maior (mais importante) ao menor. `PolarAngleAxis`
   numérico com `domain={[0, 100]}` mantém a escala honesta em todos os anéis: o valor de cada meta
   é normalizado para percentual antes de chegar ao Recharts.
2. **Trilho.** `background` do `RadialBar` em `--surface-sunken`, que se vê nos dois temas;
   `--surface-overlay` está fora porque no tema claro ele é o mesmo branco do cartão e o anel de
   fundo desaparece (`TOK-1`). Quando a meta não existe, o
   trilho vira tracejado (`stroke` em `--text-muted`, sem preenchimento) e o anel não desenha arco.
3. **Cor por categoria, fixa por id.** Cada meta tem sua cor (`--chart-1`, `--chart-3`, `--chart-6`,
   na ordem de slots da COR-8), igual em toda versão e em toda pessoa da grade (v2): a cor nunca
   muda com a posição ou com o valor.
4. **Lista ou legenda ao lado do anel**, nunca dentro dele: valor bruto, meta e percentual (ou "sem
   meta") por linha, com ícone de fechado, sem meta ou estouro. É a peça que resolve o viés
   estrutural descrito acima.
5. **Selo de contexto**, quando o dado pede: meta proporcional com os dias úteis considerados (v3)
   ou "três metas fechadas" com ícone e texto por pessoa (v2).
6. **Frase acessível** calculada do dado: quantas metas fecharam, qual não fechou e quanto falta,
   e a ausência de meta nomeada em vez de somada como zero.

## Versões

- **v1_tres-metas-da-semana**: três metas independentes de uma equipe (entradas tratadas, agendas
  marcadas, SLA cumprido) na mesma semana, com uma meta fechada e duas em aberto. A lista traz
  valor, meta com unidade e percentual em colunas tabulares alinhadas à direita nos três anéis,
  ícone por estado (`CheckCircle2` fechado, `CircleAlert` aberto, `CircleDashed` sem meta) e o
  "faltam N unidade" nos abertos.
- **v2_quem-fechou-as-tres-metas**: pequenos múltiplos do mesmo trio de anéis para 6 pessoas, na
  mesma escala e no mesmo raio, com legenda única de cor por meta, o par valor/meta escrito em
  cada número (com ícone de fechado além da cor) e selo de "três metas fechadas" só para quem
  fechou todas.
- **v3_meta-proporcional-e-sem-meta**: uma pessoa que entrou na semana no meio do caminho, com duas
  metas proporcionais aos dias úteis restantes, uma meta ainda sem definição (trilho tracejado) e
  uma meta acima de 100% travada na volta cheia, com o percentual real escrito.

Previews: [v1 escuro](v1_tres-metas-da-semana/preview.svg) ·
[v1 claro](v1_tres-metas-da-semana/preview-claro.svg) ·
[v2 escuro](v2_quem-fechou-as-tres-metas/preview.svg) ·
[v2 claro](v2_quem-fechou-as-tres-metas/preview-claro.svg) ·
[v3 escuro](v3_meta-proporcional-e-sem-meta/preview.svg) ·
[v3 claro](v3_meta-proporcional-e-sem-meta/preview-claro.svg)

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue o dado real pela prop `data`.
2. Se a página já sabe quais metas existem e quais não têm meta ainda, monte o array de anéis no
   seletor da página, na ordem de importância desejada; o componente não reordena sozinho.
3. Dê altura ao pai (`h-56` ou similar): sem altura, o `ResponsiveContainer` desenha zero. Em
   `v2`, a altura mínima é a que comporta 2 linhas de pequenos múltiplos sem espremer o raio.
4. Nunca use este modelo para comparar duas metas entre si numa mesma página: se essa for a
   pergunta, troque para o painel de bullets (13/02) antes de colar.

## Referências

- Catálogo: [Highcharts, Activity gauge demo](https://www.highcharts.com/demo/android/gauge-activity):
  arcos múltiplos ao redor do mesmo centro no estilo do relógio da Apple.
- Praticante: [Apple, Human Interface Guidelines, Activity rings](https://developers.apple.com/design/human-interface-guidelines/components/status/activity-rings/):
  a lógica do "fechou ou não fechou" e as três dimensões fixas.
- Catálogo: [shadcn, A radial chart](https://www.shadcn.io/examples/a-radial-chart): os anéis
  concêntricos por categoria, cada um na sua faixa circular, sobre Recharts.
- Portal de design: [Behance, Gauge Chart](https://www.behance.net/gallery/233895453/Gauge-Chart):
  a disposição de vários arcos numa peça só e o custo de espaço que isso cobra.
- Catálogo: [Recharts, RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/):
  API de `innerRadius`, `outerRadius`, `startAngle`, `endAngle` e `PolarAngleAxis`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-09-19, sobre os PNGs dos dois temas e o `npm run check` sem erro nas três versões.

- v1, v2 e v3: o trilho do `background` usava `--surface-overlay`, que no tema claro mede exatamente
  o branco do cartão (255, 255, 255 medido nos dois casos), então a volta completa do anel sumia e
  só o arco preenchido aparecia. No escuro o trilho existia, com pouco contraste. A leitura de
  fechou ou não fechou continuava de pé pelo arco e pela lista, mas a peça descrita no item 2 da
  Anatomia não se via no claro. Corrigido em 2026-09-29: as três versões usam `--surface-sunken` em
  `TRACK_FILL`, e o item 2 da Anatomia foi reescrito com o token novo.
- v1: o anel que não fechou fica sem ícone. A lista traz o texto do que falta, e só o anel fechado
  recebe o `CheckCircle2`, enquanto o `meta.json` anuncia "anel que não fechou com ícone".
- v1: o percentual só é escrito no anel que fechou (110,0%); nos dois abertos a linha termina no
  que falta. O par valor e meta cobre a leitura, mas o percentual que o arco codifica não aparece
  escrito em todos os anéis, como diz o item 3 do `demonstrates`.
- v3: a linha do anel de agendas imprime "faltam 1 agendas", com a concordância presa no plural.
- v3: "7 de sem meta" resolve a ausência sem somar zero, mas a frase emenda mal; algo como
  "7 atendimentos, sem meta definida" lê direto.
- v3: a amostra da lista do anel sem meta é um círculo cheio na cor da meta, enquanto o anel
  correspondente é um trilho tracejado e vazado. A ROT-4 pede amostra na forma da marca.
- v3: o campo `proportional` do `data.ts` não é lido pelo componente; o selo de meta proporcional
  vem só das duas constantes de dias úteis, e o anel sem meta acaba coberto pelo mesmo selo.
- v2: o nome da pessoa vai com `truncate`. No dado fixo nenhum nome corta, mas o nome longo não
  está na frase acessível, que só cita a primeira pessoa com meta em aberto. Ver Pendências
  conhecidas.

Segunda leitura independente, 2026-09-19, mesmo render e mesmo `npm run check` sem erro. Nenhum
bloqueante novo; os pontos abaixo se somam aos de cima.

- v1 e v3: a lista ao lado corre em frase ("132 de 120 entradas, 110,0%") em vez das colunas
  alinhadas à direita que a ROT-5 pede para legenda com valor; só o primeiro número de cada linha
  leva `kpi-number`, os demais saem sem algarismo tabular (TIP-1).
- v1: a linha do anel em aberto repete a unidade duas vezes ("34 de 40 agendas, faltam 6 agendas").
- v1 e v3: o percentual sai com uma casa ("110,0%", "170,8%"); percentual de meta lido de relance
  cabe inteiro, pela precisão da decisão da NUM-1.
- v2: os três números embaixo de cada trio se ligam à meta só pela ordem, porque nenhum deles leva
  nome nem cor; o leitor casa a posição com a legenda do topo. Funciona com três metas e fica
  frágil se o trio mudar de ordem em outra página.
- v1 e v3: o `useCase` imprime a data em `YYYY-MM-DD` na tela, formato que a NUM-7 reserva ao dado
  e ao documento. O texto vem palavra por palavra do catálogo, então a correção é de lá, não da
  versão.

_Revisão de 2026-10-14 das três versões (motivo `revisao_desatualizada`), feita sobre o arquivo de
hoje. O trilho em `--surface-sunken` está aceito nos dois temas (`#070c16` contra `#121c2e` no
escuro, `#eaeff7` contra `#ffffff` no claro, lidos do PNG). `v2` aprovada; `v1` e `v3` voltam
reprovadas, com parecer em
`validation/revisao_13_progresso-meta-e-gauge__04_aneis-concentricos_2026-10-14.md`. Os itens
abaixo não reprovam e se somam aos de cima, sem repeti-los._

- v1: a frase acessível diz "1 de 3 metas fechadas. Agendas marcadas não fechou: faltam 6
  agendas." e não diz qual meta fechou nem que o SLA ficou a 7 atendimentos; quem ouve não sabe se
  a fechada foi Entradas ou SLA. Nomear a fechada e as duas abertas com o que falta cabe nos 250.
- v1 e v3: `bandForIndex` devolve a banda da terceira para a quarta meta em diante, e os dois anéis
  se desenham um em cima do outro sem aviso; `ringColor` cai em `--chart-1` para id desconhecido e
  repete a cor de Entradas (COR-3 latente). O modelo limita a 3 metas, mas o componente não recusa.
- v1: o `CheckCircle2` do anel fechado fica na borda direita da lista, a cerca de 190 px do nome,
  medidos no PNG; a ligação com a linha depende só do alinhamento horizontal.
- v2: a frase acessível dá a contagem ("1 de 6 fecharam as três metas") mas não diz quem fechou,
  que é a resposta do caso de uso, e nomeia só a primeira exceção na ordem do array (Murilo C.)
  entre cinco. "Só Talita V. fechou as três metas" cabe no lugar da exceção.
- v2: os pares valor/meta não levam unidade em lugar nenhum da grade; "Entradas" e "Agendas" servem
  de substantivo pela legenda, "SLA" não (a unidade é atendimentos). Hoje o par lê como contagem
  pelo formato, mas a NUM-6 pede o substantivo.
- v2: o selo diz "três metas"; "três metas fechadas" diz o estado sem depender do ícone.
- v2: o `RadialBarChart` não declara `margin` e herda os 5 px do Recharts, então o anel usa 54 dos
  64 px reservados e cada banda sai com 4,9 px; legível no preview, mas é espaço reservado e não
  usado (ESP-3).
- v3: o trilho tracejado do anel sem meta desenha também a aresta radial do setor às 12 h, um traço
  curto entre os dois círculos (medido a 358,9° no raio médio, nos dois temas) que lê como marca
  de início. Dois círculos tracejados, sem a aresta, dizem o mesmo sem a marca extra.
- v3: o `TrendingUp` só aparece acima de 100%; meta fechada em exatamente 100% sai sem ícone
  nenhum, ramo latente que o dado fixo não exercita.
- v3: o selo de meta proporcional escreve os dias com `String()` em vez de `formatInt` e sem
  algarismo tabular (TIP-1).

_Revisão de 2026-10-14, segunda passada, sobre `v1` e `v3` depois da correção do mesmo dia (motivo
`revisao_desatualizada`), julgado o arquivo de hoje. As duas aprovadas. Os itens abaixo não
reprovam e se somam aos de cima, sem repeti-los._

- v1: "120", "40", "58" e os números do "faltam" levam `kpi-number` sem classe de peso e pedem
  Space Grotesk 400, que não está entre os pesos carregados (TIP-4); o navegador cai para 500. Sem
  consequência visível; `font-medium` declara o peso que já sai na tela.
- v1 e v3: o nome do anel vai com `truncate`, e na v1 a unidade também. Nada corta no preview e os
  três nomes estão na frase acessível, mas a TIP-7 não admite reticência em nome de marca
  desenhada; deixar quebrar em duas linhas é a saída quando o cartão estreitar.
- v1: o ramo sem meta ainda pinta a amostra cheia na cor da meta, enquanto a v3 já usa a amostra
  vazada e tracejada (ROT-4); o dado fixo da v1 não exercita o ramo.
- v3: o anel aberto (Agendas marcadas) sai sem ícone de estado, e a v1 dá `CircleAlert` ao mesmo
  estado. O texto "falta 1 agenda" carrega a leitura, mas o modelo fica com dois desenhos para o
  mesmo estado.
- v3: a lista segue em frase corrida e escreve o percentual só no anel acima de 100%; Agendas
  marcadas não escreve os 90% que o arco codifica. Diverge do item 4 da Anatomia ("valor bruto,
  meta e percentual ... por linha") e da v1, que passou para colunas.
- v3: `weekStart` e `joinedOn` saem do `data.ts` e não são lidos; nem o selo nem a frase dizem a
  semana ou o dia de entrada, e o "entrou na quarta" fica só no subtítulo do cartão. Escrever o dia
  de entrada no selo, por `formatDate`, amarraria o recorte.
- v1 e v3: `space-y-2.5` dá 10 px entre os itens da lista, que são grupos; a ESP-1 pede múltiplo de
  4 px nessa distância. Sem consequência visível.

## Correção de 2026-09-18 (v2, reprovada)

A rodada anterior reprovou `v2_quem-fechou-as-tres-metas` em dois pontos: nenhuma cor tinha nome
na tela (ROT-4) e os três números de cada trio saíam sem a meta, então não dava para julgar se
uma meta fechou sem decorar a paleta (NUM-6, Anatomia item 4). Correção:

- **Legenda única no topo da grade** (`MetricLegend`), com amostra quadrada na cor de cada meta e
  o nome por extenso (Entradas, Agendas, SLA), na mesma ordem dos anéis de fora para dentro.
- **Cada número virou par valor/meta** (`28/24`, não mais `28`), e o anel fechado ganhou o ícone
  `CheckCircle2` ao lado do par, não só a cor do texto: quem fechou agora se lê pelo par de
  números (basta comparar os dois) e pelo ícone, cor é reforço, não canal único (ACE-2).
- O canvas cresceu de `largo` (960×400) para 960×440 porque a legenda mais o par valor/meta não
  cabiam no preset sem espremer o texto (medido: o corpo comprimia a altura da linha do nome de
  16 px para 8 px e cortava as letras pela metade). O desvio está declarado em `canvas` e `notes`
  do `meta.json`, como pede a seção 17.7 do contrato.

## Correção de 2026-10-14 (v1 e v3, reprovadas)

- v1: ícone `CircleAlert` em `--text-muted` no anel aberto; lista em colunas de largura fixa
  (valor, meta, percentual inteiro) para os três anéis; frase acessível nomeia as três metas.
- v1 e v3: `unitOne` no dado e concordância "falta 1 agenda"; o anel sem meta escreve "7
  atendimentos, sem meta definida" e a frase leva o valor com a unidade.
- v3: amostra vazada e tracejada para o anel sem meta.
- Superadas por esta correção as observações acima sobre ícone do anel aberto, percentual só no
  fechado, frase corrida, "faltam 1 agendas", "7 de sem meta" e amostra cheia no sem meta.

## Pendências conhecidas

- v2: o nome da pessoa vai com `truncate`, mas a frase acessível só nomeia a primeira pessoa com
  meta em aberto; um nome longo que fechasse as três metas, ou que fosse a segunda ou terceira
  pessoa em aberto, não apareceria por extenso em lugar nenhum (TIP-7). Não corrigido nesta
  rodada: listar as 6 pessoas por nome estourava o teto de 250 caracteres da frase acessível
  (ACE-1) com o dado atual, e a correção certa (reescrever a frase para citar só quem tem nome
  longo, ou truncar por medida de pixel em vez de caractere) pede desenho próprio.
