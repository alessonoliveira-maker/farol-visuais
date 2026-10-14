# Grafo bipartido

## O que é

Dois tipos de entidade em duas colunas, com ligação só de uma coluna para a outra: SDR e executivo, conta e produto. A posição vertical é a ordem do nó na coluna, e a ligação é uma Bézier horizontal `M xA,yA C xm,yA xm,yB xB,yB`, com os dois pontos de controle no meio do vão. Lê se achando um nó pelo nome e seguindo as ligações dele até a outra coluna. A ordem das colunas decide a leitura, então é calculada em TypeScript pelo baricentro: cada coluna se ordena pela média das posições dos vizinhos na outra, em turnos, e fica a ordem de menos cruzamentos. A espessura vai em três faixas (fraca, média, forte), e as pontas se repartem ao longo da altura do nó, um passo por ligação, para não empilhar num ponto. O desenho responde quem se relaciona com quem e com que frequência; quanto volume foi de A para B é pergunta do sankey da família 11.

## Quando usar

- Relação entre dois tipos de entidade: SDR e executivo, conta e produto, campanha e público.
- Até 8 nós por coluna com rótulo de duas linhas nos canvas da `v1`, `v2` e `v4`; até 24 nós numa coluna com código curto no canvas `alto` da `v3`.
- Até cerca de 60 ligações num cartão; acima disso, filtro de peso mínimo antes de montar o dado.
- Concentração de repasses em poucos pares, lida pela espessura e pelo percentual escrito no nó de destino.
- Frequência discreta (quantas vezes) ou presença (tem ou não tem), não volume contínuo.

## Quando evitar

- A pergunta é quanto volume fluiu de A para B, com proporção do todo: use o sankey simples (`11_fluxo-sankey/01_sankey-simples`).
- Um tipo só de entidade: use a matriz de adjacência (`27_rede-e-relacoes/01`) ou o chord simétrico (`27_rede-e-relacoes/07`).
- Mais de 20 nós nas duas colunas ou ligações quase completas: use a matriz retangular (`27_rede-e-relacoes/01`), porque o cruzamento deixa de ser seguível.
- As entidades já têm função e etapa: use o grafo em grade (`27_rede-e-relacoes/03_grafo-em-grade`).
- Mais de duas camadas encadeadas com perdas: use o sankey multietapa (`11_fluxo-sankey/02_sankey-multietapa`).
- Leitura exata de cada par: o grafo mostra a faixa de espessura, e o número do par só vem na dica. Para todos os pares escritos, use a matriz.

## Anatomia

1. **Nó** (`<rect>`, `NODE_WIDTH` de 8 px): um por entidade, em `var(--text-secondary)`. A altura é o número de ligações vezes o passo `SLOT` (6 px na `v1`, `v2` e `v4`; 4 px na `v3`). Na `v3` o nó de produto leva a cor do produto, lida do campo `slot` do dado por `CHART_SERIES_COLORS`.
2. **Ligação** (`<path>` com `fill="none"`): Bézier horizontal em `var(--text-muted)`, que mede 5,21:1 no escuro e 5,37:1 no claro. Não usa `var(--line-strong)`, que mede 1,79:1 e 1,83:1, porque a aresta é o dado (ACE-6). Espessura de 1,5, 3 ou 5 px pela faixa do peso; na `v3`, 2 px na cor do produto.
3. **Revestimento** (`var(--surface-raised)`, 1 px de cada lado; meio pixel na `v3`, onde a ligação tem 2 px): um `<path>` igual por baixo de cada ligação, que abre passagem no cruzamento sem mexer no contraste do traço (TOK-4). As ligações finas são desenhadas primeiro e as fortes por último.
4. **Pontas no nó**: as ligações de cada nó se ordenam pelo centro do vizinho e ganham um passo cada (`endpointByLink`), então duas ligações do mesmo nó nunca saem do mesmo ponto nem se cruzam na saída.
5. **Ordem das colunas** (`orderColumns`): baricentro com uma largada por nó da esquerda, `SWEEPS` turnos por largada e contagem de cruzamentos para guardar a melhor ordem. Nó de grau zero não tem baricentro (`meanPosition` devolve `null`, EST-1b) e vai para o fim. As duas colunas são espelhadas juntas quando a âncora cai na metade de baixo, o que não muda os cruzamentos.
6. **Rótulo do nó** (`<text>` com dois `<tspan>`): nome em `var(--text-secondary)`, 12 px, Manrope 500; valor em `var(--text-muted)`, 11 px, Space Grotesk, por `formatInt` com o substantivo ("40 repasses", "18 contas"). Fica fora do nó, na margem lateral, e a caixa de cada nó nunca é menor que os 24 px do rótulo.
7. **Legenda das faixas** (`v1`, `v2`, `v4`): três amostras em forma de traço, com o intervalo de cada faixa calculado do maior peso observado (`buildBands`, ROT-5b), e o período do recorte à direita.
8. **Nó aceso** (`v2`): ligações em `var(--chart-1)` desenhadas por último; as demais baixam para `strokeOpacity` de 0,76 sobre `var(--text-muted)`, que composto mede 3,58:1 e 3,28:1 (ACE-5). Nome e valor do nó em peso 700 (TIP-3), e a outra coluna passa a escrever a parte de cada vizinho por `formatPercentFromScale100` com o volume ao lado.
9. **Nó de zero medido** (`v4`): contorno `var(--text-muted)` de 1,5 px sem preenchimento, com "0 repasses" escrito (EST-3). **Nó sem medição** (`v4`): ícone `Unplug` no lugar do nó e o texto de `formatUnavailable()` (EST-2). Os dois vão para o fim da coluna, com 8 px a mais de vão.
10. **Linha de leitura**: frase de 12 px no topo do corpo, calculada do dado, com a conclusão da versão. **Frase acessível**: na raiz, com o tipo de gráfico, o tamanho das colunas e a mesma conclusão, pelos mesmos formatadores.
11. **Vazio**: sem ligação, o grafo inteiro dá lugar a um bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_handoffs-sdr-para-executivo`: 177 repasses de agenda entre 5 SDRs e 8 executivos, em 22 pares. Demonstra a Bézier horizontal calculada em TypeScript, a ordem das colunas por baricentro, a espessura em três faixas com legenda, o total escrito ao lado de cada nó por `formatInt` e as ligações em `var(--text-muted)` desenhadas antes dos nós.
- `v2_concentracao-do-sdr-selecionado`: os 40 repasses do SDR 3, dos quais 70% vão para dois executivos. Demonstra a prop `highlightId`, as ligações do nó em `var(--chart-1)` com as demais baixadas por opacidade medida, o peso 700 no nó aceso, o percentual de cada ligação escrito no nó de destino com o volume ao lado, a adjacência pré-calculada em `Map` para o hover e a frase acessível com o par mais forte.
- `v3_clientes-e-produtos-na-carteira`: 24 contas contra 7 nós de produto, com 58 ligações. Demonstra a altura do nó pelo total de ligações, as pontas repartidas ao longo do nó, a cor da ligação pelo produto em slot fixo, o rótulo só nos produtos e nas contas com três ou mais produtos (o resto na dica), o sétimo nó agrupado em "Outros (3 produtos)" e a nota das 36 contas fora do corte de receita.
- `v4_executivo-sem-repasse`: o mesmo time com um executivo que não recebeu nenhuma agenda e um SDR sem medição comparável. Demonstra o nó de zero vazado e por último na coluna, o "0 repasses" escrito, o baricentro que ignora grau zero, a ausência com ícone e `formatUnavailable()` em vez de zero, e o rodapé com a contagem de nós sem ligação nas duas colunas.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Troque `data` pelas linhas reais no mesmo formato. Na `v1`, `v2` e `v4`: `sources` e `targets` com `id`, `label` e `inSentence` (o nome com artigo, para o meio da frase), e `links` com `source`, `target` e `weight` inteiro maior que zero. Os ids não se repetem entre as duas colunas, e cada par aparece uma vez.
3. Não ordene o dado antes de passar: a ordem das colunas é do componente. Quem quiser ordem fixa troca `orderColumns` por uma função que devolve a ordem do dado.
4. Na `v2`, `highlightId` é o id do nó aceso, de qualquer das duas colunas; id que não existe deixa o grafo inteiro em neutro. O layout depende do dado e do `highlightId`, nunca do hover.
5. Na `v4`, zero e ausência são coisas diferentes no dado: nó medido sem linha em `links` é zero; nó com `unmeasuredReason` é ausência e fica fora de `links`.
6. Na `v3`, mantenha o campo `slot` de cada produto e agregue da sétima categoria em diante num nó sem slot antes de montar o dado (COR-4).
7. O `viewBox` é o tamanho do corpo do cartão do catálogo (574 px de largura). Em cartão de outra proporção o SVG escala inteiro, texto incluído: mudou o cartão, mude `VIEW_WIDTH` e `VIEW_HEIGHT` para o corpo novo, senão o texto cai abaixo de 11 px (GEO-18). Mais de 8 nós numa coluna com rótulo de duas linhas pede `VIEW_HEIGHT` maior: são 34 px por nó, 24 da caixa do rótulo e 10 de vão.
8. Dê altura ao pai (`h-72` ou similar) antes de embrulhar em `VisualCard`, e troque o bloco de vazio por `EmptyState`.

## Referências

- [From Data to Viz, Network](https://www.data-to-viz.com/graph/network.html): quando o grafo de nós e ligações serve e quando a matriz é melhor.
- Sugiyama, Tagawa e Toda, "Methods for Visual Understanding of Hierarchical System Structures" (1981): a heurística do baricentro para reduzir cruzamentos entre duas camadas.
- Eades e Wormald, "Edge Crossings in Drawings of Bipartite Graphs" (1994): por que o mínimo de cruzamentos é difícil e a heurística encalha em mínimo local, que é a razão das várias largadas.
- `VISUAIS/11_fluxo-sankey/01_sankey-simples/README.md`: o vizinho de volume, com o mesmo par SDR e executivo lido como fluxo.
- `app/src/lib/format.ts`: `formatInt`, `formatPercentFromScale100`, `formatCurrencyCompact` e `formatUnavailable`, os quatro formatadores do modelo.
- `app/src/styles/tokens.css`: `--text-muted`, `--text-secondary`, `--surface-raised` e `--chart-1` a `--chart-6`.

## Pendências conhecidas

- O número exato de cada par só aparece na dica (`<title>` nativo do SVG): o corpo mostra a faixa de espessura. É o limite que "Quando evitar" declara.
- Na `v2`, `var(--chart-1)` contra a ligação baixada mede 2,65:1 no escuro e 1,83:1 no claro (TOK-9). O destaque não depende só da cor: as ligações acesas são desenhadas por cima com revestimento, o nó aceso muda o peso do rótulo e os vizinhos ganham o percentual escrito.
- Na `v3`, a identidade das contas com um ou dois produtos vive só na dica, por especificação do catálogo. A leitura que a versão atende é a do padrão (quais produtos andam juntos), não a de uma conta específica.
- Na `v3`, os produtos de slot 2 e de slot 6 (gestão de frota e folha de pagamento) são o par de matiz mais próximo da paleta, sobretudo no tema claro. Os dois nós ficam longe um do outro na coluna e cada um leva o nome escrito ao lado; com seis categorias coloridas o par é inevitável.
- `OPACIDADE-MARCA` sai não medida na `v2` (`sem_opacidade_em_marca`), porque a opacidade chega ao traço pela constante `DIM_OPACITY` e a guarda não a segue. Medida à mão contra `tokens.css`: `--text-muted` a 0,76 sobre o cartão dá 3,58:1 no escuro e 3,28:1 no claro; o piso de 3:1 fica em 0,72.
- `ESPESSURA-MARCA` sai não medida nas quatro versões (`marca_fora_do_bar`): a guarda só tem piso para marca de `<Bar>`. As espessuras deste modelo são constantes do topo do arquivo: ligação de 1,5, 3 e 5 px (2 px na `v3`) e nó de 8 px de largura.
- A coluna que não cabe no `viewBox` aperta os vãos de 10 px até 4 px e, passando disso, vaza por baixo. O limite prático é o de "Quando usar": 8 nós com rótulo de duas linhas.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, quatro versões julgadas. `v1`, `v3` e `v4` aprovadas; `v2` reprovada por um bloqueante (com o cursor sobre o Executivo E, o rótulo `100% (16 de 16)` do SDR 3 começa 2,55 px fora do SVG e o primeiro algarismo sai cortado), descrito em `validation/revisao_27_rede-e-relacoes__02_grafo-bipartido_2026-10-13.md`. Os itens abaixo não reprovam.

- `v1`, `v2` e `v4`: a altura do nó conta pares (6 px por ligação, com piso de 12 px) e o número escrito ao lado é o total de repasses, e nada no cartão diz o que a altura mede. No dado da `v1` e da `v2` o SDR 3, de 40 repasses, tem nó de 24 px, e o SDR 2 e o SDR 5, de 34, têm 30 px; os executivos A, D e G, com 27 cada, têm 30, 24 e 18 px. Na `v4` o nó vazado do zero (18 px) é mais alto que os nós de um e de dois pares (12 px). Quem lê a altura como volume, como no sankey vizinho, lê errado. Uma frase na linha da legenda resolve ("altura do nó: número de pares"), ou o nó de altura fixa. Na `v3` a altura e o número escrito são a mesma contagem.
- `v1` e `v4`: a margem esquerda é constante e guarda 68 px para o valor do nó. `40 repasses` mede 64,03 px e cabe; `100 repasses` mede 70,86 px e sairia cortado em 2,86 px na borda do SVG. O dado padrão não passa de 40. Derivar a margem do maior total do dado, ou declarar o teto de dois algarismos em "Como colar no Farol".
- `v1`, `v2` e `v4`: o período da legenda (`3º trimestre de 2026`) e o algarismo dos nomes na linha de leitura saem em Manrope sem `tabular-nums` (TIP-1). Sem coluna a alinhar, o preview não muda.
- `v3`: 13 das 24 contas, as de um e de dois produtos, não têm nome no desenho parado, por especificação do catálogo, e a regra está escrita no cabeçalho da coluna. O caso de uso fala em "cada uma das 24 contas", e para essas 13 a resposta depende da dica. Rotular todas pede caixa de 12 px por conta: 308 px de caixas e 46 px de vãos somam 354 px contra 348 px úteis, isto é, 6 px a mais de altura e canvas por número. Decisão do dono, porque muda o que o catálogo manda demonstrar.
- `v3`: na zona de maior cruzamento as ligações de emissão fiscal passam por baixo do feixe de controle de estoque e ficam em traços curtos. Com o feixe a 4 px de passo, a ligação de 2 px e o revestimento de meio pixel de cada lado, sobra 1 px visível a cada 4 px. A cor nas duas pontas continua dizendo o produto de cada ligação, mas ali não se segue uma ligação sozinha. Sem revestimento entre ligações sobrariam 2 px a cada 4 px; é conta de geometria, não testada em render.
- `v3`: o "Quando evitar" do catálogo manda matriz acima de 20 nós por coluna, e a `v3` do mesmo catálogo tem 24 contas. Este README reescreveu o limite como "nas duas colunas". Alinhar no catálogo.
- `v3`: o `<tspan>` do "3" no cabeçalho das contas usa `font-display` sem peso declarado e herda 400, que não é peso carregado de Space Grotesk (TIP-4); o navegador desenha em 500. Declarar `fontWeight={500}`.
- `v4`: o total de cada executivo soma só as ligações medidas, porque o SDR sem medição fica fora do grafo, e só a linha de leitura diz "medidos". O rótulo do nó e o rodapé escrevem `0 repasses` sem a ressalva.
- `v4`: o filtro que descarta a ligação de nó sem medição (linha 242 do `Chart.tsx`) faria de zero medido, em destaque, o executivo cujo único repasse viesse desse nó. O dado padrão não exercita o ramo, e o passo 5 de "Como colar no Farol" manda deixar o nó sem medição fora de `links`. Nó que perdeu ligação no filtro não deveria entrar em `zeros`.
- `v1`, `v2` e `v4`: `OPACIDADE-MARCA` e `ESPESSURA-MARCA` saem não medidas pelo check, como as "Pendências conhecidas" já dizem. Conferido à mão nesta revisão, de `tokens.css`: `--text-muted` a 0,76 sobre o cartão mede 3,57:1 no escuro e 3,27:1 no claro, e as seis cores de produto da `v3` medem de 5,34:1 a 9,50:1 nos dois temas.

Revisão de 2026-10-13, segunda passada, só a `v2`, julgada pelo `Chart.tsx` das 15:44 e não pela nota anterior. Aprovada, 32 perguntas sem "não". O bloqueante da primeira passada não se repete: em página viva, com o cursor levado a cada um dos 13 nós nos dois temas, nenhum texto sai do SVG, e a linha mais larga, `100% (16 de 16)` no SDR 3 com o cursor sobre o Executivo E, mede 86,55 px e começa 5,45 px dentro da borda esquerda, com o primeiro algarismo inteiro no recorte ampliado. Em todos os estados: nenhuma colisão de texto, dois elementos em peso 700, linha de leitura em uma linha de 20 px e a ordem dos nós parada. Também montados e conferidos o vazio (`links` sem linha), o `highlightId` inexistente e o nó aceso por prop num executivo e no SDR 5, que espelha as colunas. Os itens abaixo não reprovam.

- `v2`: as duas margens laterais são constantes calibradas para total de dois algarismos. Cada algarismo mede 6,83 px em 11 px tabular, então `48% (113 de 227)` chega a 93,38 px contra 92 px livres na esquerda e 88 px na direita, e `100% (100 de 100)` chega a 100,21 px. Com total de nó a partir de 100 o rótulo sai cortado nos dois lados; na direita, `100% (16 de 16)` já passa com 1,45 px. O dado padrão não passa de 40. Derivar as margens do maior total do dado, ou declarar o teto de 99 repasses por nó em "Como colar no Farol".
- `v2`: a linha de leitura soma as partes inteiras dos dois pares mais fortes, e em três estados de cursor o percentual fica a um ponto da divisão do volume escrito ao lado: SDR 2 escreve `61% (21 de 34)` e a divisão dá 61,8%; SDR 5 escreve `73% (25 de 34)` e dá 73,5%; Executivo G escreve `71% (19 de 27)` e dá 70,4%. O estado padrão (SDR 3, 28 de 40) é exato. É a escolha de fazer a linha fechar com as partes impressas nos nós; vale uma linha no comentário do `TOP_PAIRS`.
- `v2`: com o cursor no Executivo G, o SDR 3 e o SDR 4 têm o mesmo volume (8 de 27) e saem com `30%` e `29%`, pelo desempate do maior resto, e a linha de leitura nomeia o SDR 3 como segundo par mais forte sem dizer que o SDR 4 empata. O volume escrito ao lado mostra o empate.
- `v2`: a troca do nó aceso só existe com o mouse (`onMouseEnter`). Quem navega por teclado fica com o nó da prop `highlightId`, que é o que a frase acessível descreve.
- `v2`: a ordem das colunas (SDR 3, 1, 4, 2 e 5) é a de menos cruzamentos, 25, que é o mínimo exato para este dado, conferido por enumeração, e nada no cartão diz qual é o critério (GEO-12). No estado padrão a coluna da direita coincide com a parte decrescente do SDR 3 e pode ser lida como ranking; com o cursor em outro nó a coincidência some.
- `v2`: continuam valendo, do parágrafo anterior, a altura do nó que conta pares ao lado do total de repasses (SDR 3, de 40 repasses, com 24 px, e SDR 2 e SDR 5, de 34, com 30 px) e o período da legenda e o algarismo dos nomes em Manrope sem `tabular-nums` (TIP-1).
- `v2`: `OPACIDADE-MARCA` continua não medida pelo check (`sem_opacidade_em_marca`). Refeito à mão de `tokens.css`: `--text-muted` a 0,76 sobre o cartão mede 3,58:1 no escuro e 3,28:1 no claro, e o piso de 3:1 cai em 0,72 (3,04:1 no claro; 0,71 dá 2,98:1). Aceso contra fora de foco mede 2,65:1 e 1,83:1, como o `notes` declara (TOK-9).
