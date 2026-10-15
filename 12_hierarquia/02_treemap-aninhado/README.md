# Treemap aninhado com rótulo de grupo

## O que é

Retângulos de grupo que contêm os retângulos dos filhos, com o nome do grupo visível num selo ou numa faixa de cabeçalho. Mostra dois níveis de uma vez: a área de cada filho é proporcional ao valor dentro do grupo, e o grupo inteiro carrega uma cor própria. Lê-se em duas camadas: primeiro o tamanho relativo dos grupos entre si, depois a composição interna de cada um.

Duas consequências valem para todas as versões, e as duas decidem o modelo.

A primeira é que **o valor de um nó com filhos é sempre a soma dos filhos**, calculada no componente, nunca um total declarado à parte no `data.ts`. É essa igualdade que faz a área do grupo fechar com a área das células dentro dele por construção, e não por coincidência do dado, que é o lado bom da armadilha `GEO-3`. A saída dela manda conferir somando a área desenhada de cada marca contra a participação de cada valor, e foi assim que se conferiu: um script leu os `<rect>` dos seis `preview.svg` das `v2`, `v3` e `v4`, separou as células pelo contorno do grupo que as contém e comparou a participação da área de cada célula na soma do grupo com a participação do valor dela no total do grupo. **O maior desvio por célula é 0,000% nas três versões**, nos 63 retângulos de folha desenhados, porque o squarify reescala o que sobrou contra a área livre que sobrou a cada faixa. No primeiro nível, que é do Recharts, o desvio chega a 1,26% na `v3`, 3,19% na `v2` e 4,40% na `v4`: a causa é o `nodeGap`, que recua cada irmão em medida absoluta e por isso pesa proporcionalmente mais no grupo pequeno.

A segunda é que **a cor não carrega profundidade**. A rampa sequencial do Farol entrega dois níveis úteis, não sete: `--seq-5` contra `--seq-6` mede 1,42:1 e `--seq-6` contra `--seq-7` mede 1,45:1, e só três degraus da rampa passam de 3:1 contra o cartão nos dois temas (`TOK-8`). Então o nível vai por **aninhamento, borda e rótulo**, que é o que o próprio aninhamento já oferece de graça, e a cor fica para a categoria do primeiro nível, com o filho herdando a cor do pai sem diluição nenhuma. Quem separa duas células irmãs é o contorno na cor do cartão da `COR-5`, não uma diferença de luminosidade.

## Quando usar

- Dois níveis que precisam ser lidos juntos, como executivo e produto, ou camada de custo e rubrica.
- Composição de um total grande em grupos e rubricas, com até cerca de 40 folhas ao todo.
- Leitura de concentração dentro de cada grupo e entre grupos no mesmo quadro, sem trocar de tela.

## Quando evitar

- Mais de três níveis desenhados de uma vez: vira mosaico ilegível. Use detalhamento (`01_treemap`) ou icicle.
- Comparar a mesma subcategoria entre grupos: a posição de cada folha muda de grupo para grupo. Use barras agrupadas (família 02).
- Comparar o tamanho de uma folha de um grupo com o de outra folha de outro grupo: a faixa de cabeçalho e o respiro cobram a mesma medida absoluta de todo grupo, então a mesma quantia desenha uma célula maior no grupo maior. A comparação honesta é grupo contra grupo pelo retângulo do grupo, e folha contra folha dentro do mesmo grupo.
- Treemap Voronoi pedido por estética: a leitura de polígono irregular é pior e o layout exige algoritmo iterativo sem biblioteca pronta; este modelo cobre o mesmo caso de uso com squarify.
- Grupos com duas dimensões independentes, como largura e altura medindo coisas diferentes: isso é Marimekko, não treemap.

## Anatomia

1. **Contorno do grupo.** Um retângulo sem preenchimento (`fill="none"`), traço na cor do grupo (`--chart-*`, atribuída pelo índice gravado no dado, na ordem de slot 1, 3, 6, 5, 2, 4 da `COR-8`). Ele é desenhado DEPOIS das células, e é isso que resolve a `REC-25` sem pagar o preço que ela cobra: quem controla a ordem de pintura é o componente, não o Recharts.
2. **Faixa de cabeçalho do grupo.** Uma faixa de 18 px no topo do retângulo do grupo, reservada ANTES de repartir os filhos, com o nome do grupo à esquerda e o número dele à direita. Os 18 px são o piso da `ESP-2` mais 1 px de folga: texto de 11 px escrito dentro de uma marca pede 11 mais 6 px de espessura. A faixa é o cartão, não um selo: `--surface-overlay` está fora, porque no tema claro ele é o mesmo branco de `--surface-raised` e o selo deixa de existir como caixa (`TOK-1`). Na `v1` ela é um selo de `--surface-overlay` obtido por `nodeInset` nos quatro lados; nas `v2`, `v3` e `v4` ela é faixa de verdade, só no topo.
3. **Célula da folha.** Um retângulo por filho, área proporcional ao valor, preenchido com a cor do grupo, com contorno de 2 px em `--surface-raised` que separa as irmãs sem mexer no preenchimento (`COR-5`, e também a saída da `TOK-4`). O contorno straddle mantém a área geométrica exata, ao contrário de um recuo, que encolheria a célula pequena proporcionalmente mais que a grande.
4. **Rótulo da célula, e a regra de corte.** Nome e valor são avaliados **como par**: a célula ou escreve os dois ou fica muda, porque identificação pela metade não é identificação. O nome quebra em até duas linhas por palavra inteira antes de desistir, nunca por caractere e nunca por reticência (`TIP-7`, e é a saída da `GEO-2`). A largura de cada linha é medida por **soma por glifo** com a tabela de `_render/scripts/lib/colisao.mjs`, e a conta **superestima de propósito**: num treemap o rótulo que transborda invade a célula vizinha e nenhuma guarda do `npm run check` mede invasão entre células, enquanto o rótulo escondido é coberto pela lista do item 6. O lado seguro do arredondamento é o contrário do caso geral, em que subestimar é seguro porque a `COLISAO-TEXTO` pega o encontro de tinta no render.
5. **Cor do texto sobre a célula.** Vazado na cor da superfície (`--surface-raised`), que mede de 5,21:1 a 6,18:1 sobre as marcas usadas, no tema que reprova primeiro, e resolve os dois temas sozinho porque o token acompanha o cartão. **Sem halo**, pela `ROT-7b`: o halo também é a cor da superfície, e no tema claro os dois são o mesmo branco, então o halo apagaria a letra. A pergunta que decide é uma só, o texto tem a marca inteira por baixo, e aqui a resposta é sim, porque o rótulo só desenha quando cabe dentro da própria célula.
6. **Lista de identificação.** Abaixo do treemap, cada grupo aparece com um quadrado da cor dele, o nome e o total, e abaixo dele todo filho com nome e valor numa coluna de largura fixa alinhada à direita (`ROT-5`, `TIP-6`). Ela existe porque a faixa do item 2 some no grupo estreito e o rótulo do item 4 some na célula pequena, e o filho continua precisando de nome e número legíveis sem interação (`ROT-10`). É ela que autoriza a regra de corte a ser dura.
7. **Frase acessível.** `aria-label` na raiz com `role="figure"` (a lista do item 6 precisa continuar acessível a quem navega por teclado ou leitor de tela), entre 100 e 250 caracteres, calculada do dado: total, quantos grupos e filhos, quem lidera ou quem é a menor, e o que ficou fora do desenho.

## Versões

- `v1_pipeline-por-executivo-e-produto`: `content` do Recharts decidido pelo `depth` (grupo com contorno e selo, folha com área), índice de grupo gravado no dado para a cor, luminosidade da folha por `color-mix` em `oklab` do produto maior ao menor, largura de todo rótulo medida por Canvas 2D, selo da folha limitado por área e lista de identificação com todo executivo e todo produto. Canvas fixado em 960x800, declarado no `meta.json`. Previews: [preview.svg](v1_pipeline-por-executivo-e-produto/preview.svg) e [preview-claro.svg](v1_pipeline-por-executivo-e-produto/preview-claro.svg).
- `v2_concentracao-em-um-executivo`: um executivo aceso em `--chart-1` e os cinco demais no neutro de dado `--text-muted`, faixa de cabeçalho só no topo com nome e total, produto herdando a cor do executivo sem diluição, e linha de leitura calculada do dado com a base da comparação junto. Canvas 960x680. Previews: [preview.svg](v2_concentracao-em-um-executivo/preview.svg) e [preview-claro.svg](v2_concentracao-em-um-executivo/preview-claro.svg).
- `v3_custo-por-camada-e-rubrica`: três camadas com 26 rubricas, faixa de cabeçalho de 18 px reservada antes de repartir os filhos, total e participação da camada escritos na faixa com a composição fechando em 100 pelo maior resto (`NUM-2`), e rótulo só na rubrica que comporta nome e valor juntos. Canvas 1040x760. Previews: [preview.svg](v3_custo-por-camada-e-rubrica/preview.svg) e [preview-claro.svg](v3_custo-por-camada-e-rubrica/preview-claro.svg).
- `v4_grupo-minusculo-sem-selo`: seis camadas, uma delas com 0,2% do custo, e a regra de corte em três desfechos medidos no preview (faixa completa, camada sem faixa com as rubricas dentro, e camada pintada cheia porque nem o respiro cabe). Canvas 960x600. Previews: [preview.svg](v4_grupo-minusculo-sem-selo/preview.svg) e [preview-claro.svg](v4_grupo-minusculo-sem-selo/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão mais próxima do seu caso para a página de destino.
2. Troque o tipo do grupo e o dado de exemplo pela query real, mantendo `id`, `name` e o índice de cor em cada grupo. Nas versões `v2`, `v3` e `v4` o objeto que vai para o `Treemap` é montado no componente e **não** carrega a chave `children`, porque o Recharts reparte só o primeiro nível ali; os filhos ficam num campo próprio do grupo.
3. Calcule o índice de cor na consulta ou no seletor da página, na ordem em que os grupos devem receber cor (a ordem de slot da `COR-8`), nunca a partir da posição do nó dentro do `content`.
4. Nunca declare o total do grupo na origem do dado: deixe o componente somar os filhos. Total declarado à parte é o caminho mais curto para a área do pai divergir da soma das áreas dos filhos sem ninguém notar.
5. Dê altura ao pai (`h-64` na grade, por exemplo) ou passe `height`, porque o `ResponsiveContainer` desenha zero sem isso.
6. Ajuste `LAYER_HEADER_HEIGHT`, `LAYER_PAD`, `LEAF_MIN_WIDTH` e `RESERVED_MAX_AREA_COST` só se o canvas real da página for muito diferente do canvas do catálogo: eles decidem quando a faixa e o rótulo aparecem. `LAYER_HEADER_HEIGHT` precisa continuar acima do piso da `ESP-2` (marca com rótulo de 11 px dentro não desce de 17 px) e `RESERVED_MAX_AREA_COST` é o que impede a faixa e o respiro de comerem a área de um grupo minúsculo.
7. Passe os grupos já ordenados do maior para o menor valor, como a query real também deveria fazer: o squarify lê a ordem do array, e fora de ordem o último grupo tende a sobrar como uma tira fina mesmo sem ser o de menor valor. O desempate é pelo `id`, para a ordem não mudar entre recortes.

## Referências

- Catálogo: [Apache ECharts, Show Parent Labels](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/treemap-show-parent.ts): `upperLabel` por nível e bordas mais grossas no nível intermediário.
- Catálogo: [AG Charts, Treemap Series](https://www.ag-grid.com/charts/javascript/treemap-series/): cabeçalho de grupo, `group.padding`, `group.gap`, `tile.gap` e rótulo secundário.
- Catálogo: [nivo, TreeMap](https://nivo.rocks/treemap/): algoritmos squarify, binary, dice, slice e sliceDice; `innerPadding`, `outerPadding` e rótulo de pai.
- Método: Mark Bruls, Kees Huizing e Jarke van Wijk, "Squarified Treemaps" (2000): o algoritmo que as versões `v2`, `v3` e `v4` implementam em TypeScript para repartir os filhos dentro do retângulo do grupo.
- Praticante: [Ben Shneiderman, história do treemap](https://www.cs.umd.edu/hcil/treemap-history/): squarified melhora a proporção mas perde a ordem; ordered e strip equilibram.
- Portal de design: [Behance, busca "treemap"](https://www.behance.net/search/projects/treemap): página de busca para varredura de tratamentos de cabeçalho.

## O mecanismo de layout, e por que ele muda entre a v1 e as três novas

A `v1` usa o aninhamento nativo do Recharts: o `Treemap` recebe o dado com a chave `children` e reparte os dois níveis, e o espaço do selo do grupo sai do `nodeInset`. O problema é que o `nodeInset` do Recharts é **um número só, aplicado aos quatro lados** (conferido em `recharts@3.10.1`, `Props.nodeInset` e `insetRect`, que clampa em metade da largura e da altura), então faixa reservada só no topo não existe nele, e abrir espaço para um cabeçalho custa o mesmo recuo nos outros três lados, em todo grupo, inclusive nos que não têm cabeçalho.

As `v2`, `v3` e `v4` deixam o Recharts repartir **só o primeiro nível** e repartem os filhos aqui, por squarify próprio em TypeScript, dentro do retângulo que o grupo recebeu. Três ganhos, e o terceiro é o que fechou a `v4`:

- A faixa sai do topo e os outros três lados ficam com um respiro de 3 px, o que devolve área útil às células.
- A ordem de pintura passa a ser do componente: as células primeiro, o contorno e a faixa por cima. A `REC-25` deixa de poder acontecer, e sem pagar o preço que a saída dela cobra.
- A soma dos filhos fecha com o pai por construção: cada faixa do squarify reescala o que sobrou contra a área livre que sobrou, então a área do pai é repartida inteira, sempre.

A `v4` mediu o limite disso no próprio preview. Uma camada de 0,2% do custo nasceu com 7 px de largura; o respiro de 3 px por lado comeu 6 deles, e a única rubrica dentro dela desenhou **54 px² onde a área do valor pede 420**, um erro de 87% na única coisa que o treemap codifica. Daí saiu a constante `RESERVED_MAX_AREA_COST`, que é a régua da `GEO-3` escrita como código: faixa e respiro não podem cobrar mais da metade da área do grupo, e quando cobram, o grupo é pintado cheio, sem faixa e sem contorno próprio. Escala é o que não se negocia; faixa e respiro são. As três versões carregam a mesma constante.

## O que as três versões novas não herdaram da v1, e a regra que venceu

A `v1` não foi tocada: consertá-la aqui a faria perder o veredito. Onde uma regra proíbe o que ela faz, a regra venceu, e as versões novas foram escritas de outro jeito.

- **Luminosidade da folha pelo posto dentro do grupo.** A `v1` calcula o preenchimento da folha em `leafFill` (`v1_pipeline-por-executivo-e-produto/Chart.tsx:148` a `154`), misturando a cor do grupo com o neutro em função do `rank` da folha, isto é, da **posição** dela na lista ordenada por valor. A `COR-3` (`CONTRATO.md:515`) diz que a cor pertence à categoria e não à posição, e nomeia justamente o caso de mapear cor sobre array ordenada por valor. As versões novas não diluem nada: a folha herda a cor do pai, e o que separa irmãs é o contorno da `COR-5`. É a mesma direção da `TOK-8` (`ARMADILHAS.md:838`), que mede que a rampa não tem degraus suficientes para carregar ordem.
- **`--surface-overlay` como caixa de selo.** A `v1` pinta o fundo do selo do grupo e do selo da folha com `--surface-overlay` (`Chart.tsx:321` e `:358`) e usa o mesmo token como ponta neutra do `color-mix` (`Chart.tsx:153`). A nota de `--surface-overlay` do contrato (`CONTRATO.md:255`) e a `TOK-1` (`ARMADILHAS.md:730`) medem 1,00:1 dele contra `--surface-raised` no tema claro, onde os dois são o mesmo branco: a caixa não existe na tela. A própria revisão da `v1` já tinha registrado o sintoma. Nas versões novas não há selo: a faixa É o cartão, e o texto vai direto sobre ele, em `--text-primary` e `--text-secondary`.
- **Largura de rótulo medida por Canvas 2D.** A `v1` mede a tinta com `document.createElement('canvas')` e `document.fonts.check` (`Chart.tsx:115` a `136`), com cache em escopo de módulo e uma heurística de largura média por família enquanto a fonte não carregou. Isso não é proibido por regra, mas depende do estado do navegador no instante do render e guarda o resultado para sempre. As versões novas somam por glifo pela tabela de `colisao.mjs`, que é função pura, não depende de a fonte ter carregado e é a mesma medida que a guarda `COLISAO-TEXTO` usa para julgar o preview.

## Contradições com o enunciado que abriu esta leva, medidas no arquivo

- **O `CHAR_WIDTH` único para as duas famílias não está nesta `v1`.** O enunciado atribuía a ela uma constante única de largura de caractere, errando cerca de 11% em Space Grotesk. O arquivo mede o contrário: a `v1` deste modelo já abandonou a heurística por contagem em 2026-09-20 e mede por Canvas 2D, com fallback **por família** (`fallbackTextWidth`, `Chart.tsx:98`, com 0,72 em para `display` e 0,68 em para `sans`). A constante única de 6,3 existe, mas na `v1` de `01_treemap`, e está registrada no README daquele modelo.
- **O retorno de emergência da quebra de nome existe, e não invade a célula vizinha.** `wrapLeafName` devolve, no fim, uma partição ao meio sem conferir se ela cabe (`Chart.tsx:180` e `:181`), o que de fato é um retorno de emergência. Só que quem decide desenhar não é ele: `measureLeafFit` refaz a conta linha a linha contra a largura útil e devolve `fits: false` quando qualquer linha passa (`Chart.tsx:215`), e sem `fits` nenhum texto é desenhado. O defeito de invasão que essa escrita permitiria está fechado a jusante. As versões novas fecham na origem: `wrapName` devolve `null` em vez de uma tentativa.

## Observações desta leva, medidas no preview de 2026-09-28

- **A regra de corte da faixa dispara com frequência, e isso é o desenho funcionando.** Na `v2`, 5 dos 6 executivos ganham faixa e o sexto, com 95 px de largura, fica sem. Na `v4`, 3 das 6 camadas ficam sem faixa. A identificação dessas camadas vive inteira na lista, como a `ROT-10` permite, e nenhum retângulo foi aumentado para o texto caber.
- **No tema claro o destaque da `v2` é mais fraco, e isso não se conserta na cor.** `--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro. Razão entre marcas não é piso: a WCAG 1.4.11 pede 3:1 de objeto contra o fundo, e as duas cores passam disso com folga contra o cartão. O que o número manda fazer é acrescentar o segundo canal da `COR-2`, que a peça tem em quatro lugares: peso 700 no nome do executivo aceso, contorno de 2 px contra 1 px nos demais, negrito na linha dele na lista e a linha de leitura que o nomeia.
- **A área de uma folha só é comparável dentro do grupo dela.** A faixa de 18 px e o respiro de 3 px cobram a mesma medida absoluta de todo grupo, então a mesma quantia desenha uma célula maior no grupo maior. É bem menos severo que o `GROUP_INSET` de 22 px nos quatro lados da `v1`, que a revisão daquela versão mediu em 72% de diferença, mas não é zero, e por isso a seção Quando evitar traz a linha.
- **A `v4` usa os seis slots da `COR-8`, o teto exato da `COR-4`.** Isso põe `--chart-2` e `--chart-4` em tela, que repetem o hex de `--warning` e de `--positive`. Não há leitura semântica aqui, porque a peça não pinta variação nem estado, e a ordem de slot garante que uma composição de até quatro categorias nunca chegaria a usá-los. `--chart-7` e `--chart-8` ficaram fora, e o segundo deles não aceita texto nenhum por dentro nos dois temas, o que o tornaria incompatível com o rótulo vazado do item 5 da Anatomia.
- **O que o `check` não mediu nestas três versões.** As 9 guardas de preview mediram 4 de 4 versões, e `EIXO-CALMO` e `OPACIDADE-MARCA` saíram fora de escopo (`sem_grade` e `sem_opacidade_em_marca`), corretamente, porque não há eixo nem opacidade em marca. O que fica de fora por recorte declarado é o texto em HTML das ilhas de `foreignObject`, que a `CONTRASTE-TEXTO` e a `COLISAO-TEXTO` não alcançam: a linha de leitura, a lista de identificação e a linha de exclusão. Medidos à mão contra o cartão: `--text-primary` 14,53:1 no escuro e 17,96:1 no claro, `--text-secondary` 8,16:1 e 8,13:1, `--text-muted` 5,21:1 e 5,37:1, todos acima do piso de 4,5:1 da `ACE-3`. Os marcadores coloridos da lista, que também são HTML e por isso escapam da `CONTRASTE-MARCA`, medem de 5,21:1 a 9,50:1 contra o cartão, acima do piso de 3:1 da WCAG 1.4.11.

## Pendências conhecidas

Nenhuma nesta leva. A `v1` segue com uma mensagem na fila de dívida de `AGREGACAO-ZERO` (`Chart.tsx:116`, o `return 0` de `measureTextWidth` para texto vazio), que não foi tocada de propósito: consertar a `v1` aqui a faria perder o veredito. As três versões novas não acrescentaram nenhuma peça à fila.

## Observações da revisão da v1 (não bloqueantes)

_Revisão de 2026-09-20; corrigida no mesmo dia (ver "O que a correção de 2026-09-20 mudou" abaixo). Seguem só as observações que continuam válidas depois da correção._

- `v1_pipeline-por-executivo-e-produto`: oito grupos coloridos, com `--chart-7` e `--chart-8` no sétimo e no oitavo. A tabela 17.2 libera os dois quando toda marca que os usa tem rótulo direto, o que os selos de Executivo G e Executivo H cumprem, mas a COR-4 fala em teto de seis. A tensão é do contrato, não da versão; vale registrar para quem escrever a régua. As versões novas ficam dentro do teto: a `v2` usa uma cor, a `v3` usa três e a `v4` usa seis.
- `v1_pipeline-por-executivo-e-produto`: no tema claro o selo do grupo (nome do executivo) fica sobre o fundo cru do canvas (`--surface-raised`), que ali é o mesmo branco de `--surface-overlay`, então ele desaparece como caixa e o texto parece flutuar. Não engana a leitura, mas o desenho do selo de grupo só existe de fato no tema escuro. É esta observação que a faixa de cabeçalho das versões novas resolve na origem, deixando de desenhar caixa nenhuma.
- `v1_pipeline-por-executivo-e-produto`: a área da folha só é comparável dentro do grupo. Medido no `preview-claro.svg`: o contorno dos 8 grupos é exato (de 10.559 a 10.824 px² por milhão, variação de 2,5%), mas o `GROUP_INSET` de 22 px cobra a mesma faixa de todo grupo, então a área útil das folhas vai de 7.423 px² por milhão no Executivo C a 4.317 no Executivo G: o mesmo valor desenha uma folha 72% maior no maior grupo.
- `v1_pipeline-por-executivo-e-produto`: nenhuma folha recebe selo neste dado. O mecanismo do item 3 da Anatomia original e o `LEAF_BADGE_MAX_AREA_RATIO` não aparecem em nenhum dos dois PNGs.
- `v1_pipeline-por-executivo-e-produto`: a lista de identificação mede 372,5 px contra 277 px do treemap, isto é, fica mais alta que o próprio desenho. A ROT-10 trata a lista como peça própria, e não como legenda, então não há regra ferida.
- `v1_pipeline-por-executivo-e-produto`: três números da linha de leitura saem sem algarismo tabular (TIP-1), "8 executivos", "R$ 5,6 mi" e "5 produtos". Sem consequência de leitura numa frase corrida. Nas versões novas a linha de leitura inteira leva `tabular-nums`.
- `v1_pipeline-por-executivo-e-produto`: o marcador de produto na lista usa a cor cheia do grupo, e a folha correspondente no desenho é uma mistura mais clara conforme o posto. Nas versões novas o problema não existe, porque a folha tem a cor cheia do grupo.

### O que a correção de 2026-09-20 mudou

Resolvidos naquela rodada, a partir de problemas apontados por um revisor independente:

- **Rótulo vazando do selo (ROT-6, ACE-3).** Trocada a heurística `CHAR_WIDTH`/`CHAR_WIDTH_BOLD` por medida real em Canvas 2D (`measureTextWidth`), com uma segunda causa corrigida no caminho: a primeira medida rodava antes de `document.fonts` terminar de carregar a Manrope de verdade e o cache guardava o número errado para sempre.
- **Folha diluída abaixo do piso de contraste (ACE-3).** A rampa de `color-mix` (`MIN_LEAF_MIX`) subiu de 45% para 80%.
- **20 de 24 folhas sem identificação (ROT-10, checklist 27).** A antiga legenda só de executivo virou uma lista de identificação por executivo e produto.
- **Selo cobrindo quase a folha inteira (checklist 27).** Teto de metade da área da célula para o selo da folha.
- **Matiz girando por grupo (COR-1, COR-3).** `color-mix` trocou de `oklch` para `oklab`.
- **TIP-3 (peso 700 em até dois elementos).** O nome no selo de grupo caiu de 700 para 500.
- **TIP-6 e ROT-5 (coluna de valor).** A lista passou a usar grade de duas colunas com a segunda em largura fixa e alinhada à direita.
- **Caso difícil ausente no `data.ts` (seção 3).** Acrescentado um produto com valor zero no trimestre, fora do treemap e presente na lista com o motivo.
- Canvas subiu de `largo` (960x400) para 960x800, declarado por número no `meta.json`.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-10-14 das `v2`, `v3` e `v4`, as três aprovadas. Nenhum item abaixo muda o que o desenho afirma; ficam como melhoria para a próxima passada._

- `v2`, `v3` e `v4`: o contorno de grupo que cai na borda do treemap é cortado ao meio pelo `overflow:hidden` do `<svg>` do Recharts. Medido no PNG da `v2` nos dois temas: o contorno de 2 px do Executivo C sai com 2 px de dispositivo (1 px de CSS) nos lados esquerdo, de cima e de baixo e com 4 px só no lado interno, e o lado direito do Executivo F sai com 0,5 px de CSS. Na `v2` isso enfraquece em três lados o canal "contorno de 2 px contra 1 px" que o item sobre o tema claro cita para a `COR-2`. Desenhar o contorno recuado meia espessura (`x + w/2`, `width - w`) resolve sem mexer na área.
- `v2`: no tema claro, `--chart-1` (11, 109, 125) e `--text-muted` (92, 107, 135) têm luminância quase igual e, para quem não distingue verde de azul, o matiz também converge. O segundo canal que sobra dentro do desenho é o peso do nome no cabeçalho, 700 contra 600 nos demais, diferença sutil no PNG. Baixar o nome dos grupos neutros para 500 deixaria o 700 do aceso legível de primeira.
- `v2`: o Executivo F fica sem faixa (95 px de largura) e, como os grupos neutros têm todos a mesma cor, a lista não o liga ao retângulo por cor; a ligação é por eliminação e pelos valores das duas folhas rotuladas, que só aparecem sob o Executivo F na lista. Funciona, mas vale saber que é esse o caminho.
- `v2`: o produto de valor zero é declarado numa linha "Fora do desenho" abaixo da lista, e não dentro do bloco do Executivo E com marcador vazado, como diz a precisão da `ROT-10` e como a `v1` faz. A declaração existe e tem o motivo; muda a forma.
- `v2`: o `notes` do `meta.json` fala em "lista de identificação de 8 executivos e 24 produtos"; o dado tem 6 executivos e 21 produtos (20 desenhados e 1 fora do desenho).
- `v3`: o `notes` do `meta.json` diz que a peça imprime "49, 37 e 14" por cento e que há 28 rubricas; o preview imprime 44, 34 e 22 e o dado tem 26 rubricas. O comentário de `wholePercents` diz que arredondar cada camada por conta própria "daria 101 neste dado", mas com o dado atual dá 44 + 34 + 22 = 100: o código do maior resto está certo, só o caso difícil da `NUM-2` não é exercitado.
- `v3`: o cabeçalho da Mídia paga escreve "R$ 1,0 mi" para R$ 1,03 mi, ao lado de "R$ 800,0 mil" e "R$ 530,0 mil"; os três totais impressos somam R$ 2,33 mi contra R$ 2,4 mi da linha de leitura. É arredondamento do formatador, não parte faltando (`ROT-10`, precisão de 2026-09-20), mas um leitor que some nota.
- `v3` e `v4`: rubrica de valor zero ou negativo sai do desenho **e** da lista pelo `filter((line) => line.value > 0)`, sem a linha "Fora do desenho" que a `v2` tem; um estorno negativo ainda faria o total da camada crescer. O dado padrão não tem esse caso, então o preview está certo, mas quem colar no Farol herda o ramo calado. Copiar a linha de exclusão da `v2` fecha.
- `v3` e `v4`: o período "2026-T3" está escrito à mão na linha de leitura e na frase acessível, e não vem do dado. Mesmo padrão já aprovado em `12/01 v2` e `12/06 v1`; ao colar, o período tem de vir do recorte.
- `v3`: a frase acessível lista todas as camadas; com seis camadas ela passaria de 250 caracteres (`ACE-1`). Com as três do caso de uso mede 217.
- `v4`: a frase acessível afirma que a camada menor é "pequena demais para faixa de cabeçalho" sem consultar se a faixa dela coube; com outro dado, em que a menor camada comporte faixa, a frase mente. Condicionar a cláusula ao mesmo teste `headerFits` do desenho resolve. A linha de leitura também explica o mecanismo ("camada sem espaço para nome e total juntos fica só com a cor") em vez de só dar a conclusão, o que no Farol vira instrução de interface.
- `v4`: o catálogo pede nome e valor do grupo pequeno "no tooltip e na lista"; a peça não tem dica, com o motivo no `notes` (a `ROT-10` não conta a dica e a `DIC-1` só a quer quando acrescenta). Decisão defensável e registrada aqui para o dono do catálogo.
- `v4`: no tema claro, Eventos e conteúdo (148, 88, 8) e Estrutura (122, 106, 18) são vizinhas, as duas sem faixa, em marrom e oliva próximos; quem as identifica de fato são os nomes das rubricas rotuladas dentro delas, não a cor.
- `v4`: a Contingência desenha 7 x 60 = 420 px² onde a participação pede cerca de 400 px² (0,16% de 247.224 px² de grupos), 5% a mais pelo arredondamento para inteiro que o Recharts faz no primeiro nível. Não é retângulo aumentado para caber rótulo, e o desvio é invisível.
- `v2`, `v3` e `v4`: na lista, o marcador do filho é um ponto redondo e a célula desenhada é retângulo (`ROT-4`, amostra na forma da marca). O ponto separa o nível do filho do quadrado do pai, que é o que a `ROT-10` pede da lista hierárquica, e a `v1` foi aprovada com o mesmo desenho.
