# Funil em barras com taxa de passo

## O que é

Barras de volume por etapa numa escala comum, com um trilho de fundo que vale a entrada inteira e a taxa de passo escrita entre uma etapa e a seguinte. É o padrão analítico da família: o comprimento da barra é proporcional ao valor, então nada aqui distorce a leitura como a silhueta afunilada distorce. Este modelo é também onde a família estreia sua regra própria: toda taxa nomeia contra o que foi calculada, do passo anterior ou da entrada, e toda passagem escreve em número absoluto quantos entraram e quantos saíram, nunca só o percentual.

## Quando usar

- Achar o passo que precisa de conserto num processo ordenado de 3 a 7 etapas, com a mesma população do topo ao fundo.
- Pré-vendas e Comercial acompanhando a semana ou o trimestre, quando a decisão depende da taxa de passo e não só do volume.
- Célula de tabela ou cartão estreito que precisa da forma do funil por linha, na versão micro com 3 a 6 colunas (ou mais, em tabela dedicada).
- Largura de celular: barras horizontais empilham e mantêm os rótulos legíveis, ao contrário do trapézio centralizado.

## Quando evitar

- Etapas com ordens de grandeza muito diferentes no mesmo painel, como impressões e ganhos: dividir em dois painéis ou mostrar só as taxas; nunca escala logarítmica nem quebra de eixo, porque as duas quebram a proporcionalidade que é a razão de ser da barra.
- Etapas que não são subconjunto uma da outra, como reunião sem passar por qualificado: usar o `11_fluxo-sankey/02_sankey-multietapa`.
- Retrato do pipeline num dia, em que a diferença entre etapas inclui quem está em andamento: usar o `03_funil-com-perdas-por-etapa`.
- Pergunta de comparação entre períodos ou segmentos: usar o `04_funil-comparativo`.

## Anatomia

1. **Trilho ou coluna de volume**, proporcional ao valor: `Bar background` em `--surface-sunken` quando há trilho fixo (v1), ou coluna com `shape` próprio ocupando 55% da banda quando há cunha ao lado (v2).
2. **Rótulo de etapa** no eixo categórico ou na primeira coluna da tabela, sempre por extenso, nunca sigla.
3. **Valor absoluto em toda etapa**, com o substantivo da contagem (`formatInt` mais o nome do que foi contado).
4. **Taxa de passo**, sempre rotulada "do passo": conversão contra a etapa imediatamente anterior, escrita entre uma marca e a seguinte (`LabelList content` na v1, dentro da cunha na v2, na célula da v3, ao lado da barra na v4).
5. **Taxa da entrada**, sempre rotulada "da entrada": conversão acumulada contra o topo, escrita no fim do trilho (v1), só na dica da célula (v3) ou ao lado de cada barra (v4).
6. **Perda em número absoluto** entre duas etapas (`anterior − atual`), ao lado da taxa de passo: nunca só o percentual, porque o mesmo percentual pode ser 16 pessoas ou 16 mil.
7. **Etapa zerada** desenha a marca com um traço de 1 px e escreve "0" (EST-3, v4); nunca desaparece e nunca vira barra invisível.
8. **Estado vazio**: bloco `role="status"` com o ícone `Filter`, sem eixo nem grade, quando o recorte não tem etapas suficientes (EST-1).

## Versões

- [`v1_barras-com-trilho-e-taxa-de-passo`](./v1_barras-com-trilho-e-taxa-de-passo/) ([preview](./v1_barras-com-trilho-e-taxa-de-passo/preview.svg)): pré-vendas da semana de 2026-09-07, de 1.180 entradas a 142 handoffs aceitos. Demonstra o `BarChart` vertical com domínio fixo na entrada, o trilho de fundo, a taxa de passo escrita entre barras sem rodar no último índice, e a taxa da entrada fechando a última barra.
- [`v2_colunas-com-cunha-na-pior-passagem`](./v2_colunas-com-cunha-na-pior-passagem/) ([preview](./v2_colunas-com-cunha-na-pior-passagem/preview.svg)): marketing de agosto de 2026, de 1.240 leads a 74 agendas realizadas, com impressões e cliques citados fora do gráfico por ordem de grandeza. Demonstra o `Bar` com `shape` próprio dividido em coluna e cunha, `barCategoryGap` zero como exceção declarada, e a cunha da pior passagem em negativo contra as demais em neutro.
- [`v3_funil-micro-por-origem-em-tabela`](./v3_funil-micro-por-origem-em-tabela/) ([preview](./v3_funil-micro-por-origem-em-tabela/preview.svg)): 12 origens de lead da pré-vendas de agosto de 2026, cada linha com seu próprio funil em degrau escalado contra a própria entrada. Demonstra a escala por linha em HTML, a taxa do passo na célula contra a taxa do topo só na dica, e a etapa Reativação de base desenhada no tamanho real quando qualificadas supera contatadas.
- [`v4_barras-centralizadas-com-etapa-zerada`](./v4_barras-centralizadas-com-etapa-zerada/) ([preview](./v4_barras-centralizadas-com-etapa-zerada/preview.svg)): comercial da unidade Sul na semana de 2026-09-07, uma semana sem nenhuma venda fechada. Demonstra a geometria de barras centralizadas e conector em funções puras, as duas taxas escritas em toda etapa por não haver linha de base comum, e a etapa Ganha zerada desenhada com traço e conector em triângulo, nunca escondida.

## Como colar no Farol

1. Escolha a versão pelo formato do espaço: faixa lateral com etapas e taxa de passo (`v1`), painel de marketing com etapas de ordem de grandeza distante (`v2`), tabela com muitas categorias (`v3`) ou cartão estreito centralizado (`v4`).
2. Ao ligar o dado real, mantenha a ordem de processo no array de entrada: nenhuma versão ordena etapa por valor, porque a ordem é a informação. A `v3` ordena as linhas (origens) por volume, o que é diferente e continua correto.
3. Se o dado for retrato de pipeline em vez de coorte, não use este modelo sem primeiro separar quem está em andamento: sem esse segmento a diferença entre etapas vira perda inventada. Prefira o `03_funil-com-perdas-por-etapa`.
4. As taxas de passo e da entrada são calculadas no componente a partir do array recebido; ao passar dado real, garanta que ele já vem na ordem do processo e sem etapas faltando no meio, ou a taxa de passo troca de denominador sem avisar.

## Referências

- [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/): `dropOff.enabled: false` vira barras segmentadas; observar `spacingRatio`, `stageLabel` e `direction: 'horizontal'` para o modo colunas.
- [nivo, Funnel](https://nivo.rocks/funnel/): separadores antes e depois de cada parte e o hook `useFunnel` como referência de cálculo de proporção.
- [Apache ECharts, issue 21302](https://github.com/apache/echarts/issues/21302): funil com altura dinâmica e `sort: 'none'` para manter a ordem do processo, nunca ordenar por valor.
- [microcharts, Funnel](https://microcharts.dev/docs/charts/funnel): retângulos em degrau ancorados no zero, a recusa explícita da silhueta afunilada que fundamenta a v3.
- [microcharts, when to use](https://microcharts.dev/docs/when-to-use): microvisual quando o gráfico mora dentro de algo que já se está lendo, com o funil completo numa página vinculada; base da v3.
- [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/): mesma linha de base, trilho com a população inicial, taxa de passo e queda absoluta lado a lado.
- [Towards Data Science, Telling your data story with funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): barras horizontais para achar o atrito da jornada.
- [Storytelling with Data, #SWDchallenge funnel chart](https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart): por que a centralização atrapalha a comparação entre etapas vizinhas, o argumento a favor da barra alinhada à esquerda.
- [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard): funil de vendas num painel de conversão, com faixa de KPIs e colunas de conversão.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18._

- `v1`: a frase acessível anuncia "a maior queda de passo" mas `worst` é escolhido pela perda absoluta (408 saídas, de tentativa para conexão); pela taxa a pior passagem seria conexão para agenda marcada, com 40,5%. Os dois números escritos estão certos, só o rótulo da escolha é que sugere outro critério.
- `v1`: a perda absoluta entre etapas sai como `−160`, sem o substantivo da contagem que a NUM-6 pede em todo número; o valor da barra, logo acima, traz o substantivo.
- `v1`: o halo da ROT-7 pinta `--surface-raised` sobre o trilho em `--surface-sunken`, então cada rótulo de valor deixa um retângulo de tom diferente atrás de si, visível nos dois temas.
- `v1`: identificador em português acentuado (`saíram`), contra a seção 9 do contrato, que pede identificador em inglês e texto de tela em português. Corrigido na `v2` (para `exited`) na correção de 2026-09-18; `v1` segue pendente, fora do escopo desta rodada.
- `v2`: o critério da pior passagem é a menor taxa de passo, enquanto a `v1` usa a maior perda absoluta; duas versões do mesmo modelo respondendo "pior" de formas diferentes. Mantido de propósito: a decisão do dono para a família pede o denominador explícito de cada taxa, e a perda absoluta sozinha erra o "pior" quando os denominadores divergem (aqui, 922 é a maior perda absoluta e também a taxa mais baixa, mas as duas medidas podem discordar em outro recorte).
- `v2`: além da linha de leitura, a nota das etapas excluídas é uma segunda anotação no corpo; a ANO-1 admite duas, então fica no limite.
- `v2`: o rótulo de topo escreve só o número (`1.240`), sem o substantivo; quem dá a unidade é o tique de categoria embaixo da coluna.
- `v2`, correção de 2026-09-18: a cunha da pior passagem tinha `--negative` em opacidade 0,38 sob texto `--negative`, medindo abaixo de AA (ACE-3/ACE-8, COR-7). Corrigido com um halo opaco em `--surface-raised` atrás do texto, que devolve o par aprovado da 17.10 (5,50:1 escuro, 6,36:1 claro) sem tirar a cunha do lugar. As cunhas neutras não mudaram: já mediam 4,75:1 e 4,80:1 e continuam sem halo.
- `v2`, correção de 2026-09-18: as três cunhas passaram a escrever também a saída absoluta (`N saíram`), ao lado da taxa e do rótulo "do passo", para cumprir a regra da família (seção "O que é" acima): toda passagem diz o denominador da taxa e o número absoluto de quem entrou (já no rótulo de topo) e de quem saiu. Antes, o número absoluto só existia na frase acessível, e só para a pior passagem.
- `v2`, correção de 2026-09-18, reprovada pela revisão independente: o halo acima cobria só as duas primeiras das três linhas do rótulo da pior cunha; a terceira linha, a saída absoluta ("922 saíram"), caía direto sobre a cunha e media 3,07:1 no escuro e 3,29:1 no claro, abaixo do mínimo AA. Corrigido estendendo o halo às três linhas, com folga de ascendente acima da primeira e de descendente abaixo da terceira (`WORST_LABEL_HALO_TOP_PAD`, `WORST_LABEL_HALO_BOTTOM_PAD`) e `LABEL_BOTTOM_GAP` de 30 para 36 px para abrir o espaço que o halo maior precisa.
- `v3`: o trilho de 14 px deixa as colunas de taxa alta, de 86% a 96%, praticamente indistinguíveis entre si; a leitura fica inteira no número escrito na célula.
- `v3`: "Sem origem" é categoria de ausência pintada em `--chart-1` como as demais e ordenada por volume, e não em tom neutro e por último como pede a seção 7.
- `v3`: a taxa contra o topo vive no atributo `title` nativo, que não é alcançável por teclado e não é o `ChartTooltip` da DIC-2; o `title` no `<td>` ainda pode substituir o nome acessível da célula em alguns leitores.
- `v3`: o `Math.min(100, ...)` do `barPct` corta em silêncio qualquer etapa maior que a entrada da própria linha; o dado fixo não chega lá, mas o recorte real pode.
- `v4`: o traço da etapa zerada mede 2 px (`ZERO_TICK_WIDTH`), enquanto o catálogo e o item 7 da Anatomia acima dizem 1 px.
- `v4`: os blocos de três linhas das etapas 2 a 5 ficam com cerca de 10 px entre si, o menor respiro da peça, bem abaixo do vão que separa a primeira etapa da segunda.
- `v4`: a metade direita do canvas fica vazia abaixo da lista de rótulos, o que deixa a peça mais larga do que o desenho precisa.

_Segunda leitura de 2026-09-18, revisão independente._

- `v2`: o `meta.json` descreve as cunhas neutras como "texto muted a 20%", enquanto o código pinta `--line-strong` a 20%, que é o neutro que a 17.2 pede. O texto do metadado é que está velho; a cor está certa.
- `v3`: o `Math.max(1, ...)` da altura da barra contraria o "nunca altura mínima falsa" declarado no próprio `meta.json`: uma etapa medida em zero sairia com 1 px de marca. O dado fixo não tem zero, então nada aparece no preview.
- `v3`: por definição da escala por linha, as doze barras da coluna Entradas saem todas na altura cheia do trilho, de 412 a 9; quem separa uma origem da outra nessa coluna é só o número escrito, e o cabeçalho diz "topo" sem dizer que a escala é da linha.
- `v4`: no cálculo da frase acessível, `rows[...]?.value || 1` troca por 1 um denominador medido em zero, o que devolveria uma taxa em vez de declarar a base ausente; com o dado fixo a etapa anterior a Negociação vale 9 e o caminho não é exercitado.

_Terceira leitura de 2026-09-18, revisão independente: as quatro versões passam no `npm run check` (0 com erro, 0 aviso) e nenhuma tem bloqueante._

- `v2`, verificação da correção anterior: o halo das três linhas da pior cunha foi medido pixel a pixel nos dois PNGs de conferência e o texto lê sobre `--surface-raised` puro nas três linhas, a **5,45:1 no tema escuro e 6,41:1 no claro**, acima do piso AA da ACE-3. O bloqueante da rodada anterior está fechado.
- `v1`: a linha de leitura usa `truncate`, então num cartão mais estreito a conclusão some sem aviso; o dado fixo cabe no canvas `alto` e nada é cortado no preview.
- `v1`: `MARGIN.right` é 148 px fixos para o rótulo mais longo do dado fixo; substantivo de contagem maior que "agendas realizadas" passaria da margem reservada.
- `v2`: o halo da pior cunha tem largura fixa de 64 px (`WORST_LABEL_HALO_WIDTH`) contra cerca de 52 px da linha mais longa do dado fixo ("922 saíram"); saída de cinco dígitos passaria da caixa do halo.
- `v3`: a linha Reativação de base imprime "122,2%" numa coluna cujo cabeçalho diz "do passo", e o motivo (reengajamento qualifica quem já respondeu) só existe no comentário do `data.ts` e na frase acessível, nunca na tela.
- `v4`: o conector de perda é `--chart-1` a 0,22 de opacidade, a mesma cor da barra de volume, então perda e volume se separam só pela opacidade; a leitura não depende disso porque toda etapa escreve valor e as duas taxas.

## Pendências conhecidas

- `v1`: identificador `saíram` segue em português, fora do escopo da correção de 2026-09-18 (só a `v2` foi corrigida nesta rodada).
- `v2`: o rótulo de topo de cada coluna segue sem o substantivo da contagem (só o número), apoiado no tique de categoria abaixo; não mexido na correção de 2026-09-18 por não ser o problema bloqueante da rodada.
