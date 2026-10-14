# Icicle (partição retangular)

## O que é

Faixas empilhadas por nível em que a extensão de cada retângulo é proporcional ao valor e os
filhos ficam exatamente sob o intervalo do pai. Na orientação lateral, usada nesta versão, a raiz
fica à esquerda: cada coluna é um nível da hierarquia e a posição vertical de cada retângulo vem
da soma cumulativa dos valores dos filhos dentro do intervalo do pai, calculada em TypeScript e
desenhada em SVG puro, sem biblioteca de layout.

## Quando usar

- Hierarquia de 3 ou 4 níveis com rótulos longos, como categoria, motivo e submotivo.
- Ler ao mesmo tempo o peso de cada nó e a posição dele na estrutura.
- Ampliar um ramo por clique mantendo os ancestrais como faixa fina de contexto.

## Quando evitar

- Parte do todo de um nível só: use barras (família 02) ou treemap (12/01).
- Quando o espaço é quadrado e a ênfase é no centro: use sunburst (12/03).
- Estrutura sem valor, como organograma: use árvore (12/07).
- Leitura de consulta linha a linha com números: use tabela em árvore (família 14, modelo 07).

## Anatomia

1. **Coluna por nível, com largura assimétrica.** Categoria, motivo e submotivo, com a raiz à
   esquerda e uma coluna por profundidade (`LEVEL_LABELS`). A largura de cada coluna é fixa mas
   desigual (`COLUMN_WIDTHS`): a categoria tem nomes curtos e cede espaço para motivo e submotivo,
   cujos nomes são frases inteiras.
2. **Partição em TypeScript.** `y0` e `y1` de cada nó vêm da soma cumulativa dos valores dos
   filhos dentro do intervalo do pai (`partitionSpan`); nenhuma biblioteca de layout entra aqui.
3. **Contorno por categoria.** A categoria usa contorno na cor categórica fixa por slot
   (`--chart-1`, `--chart-3`, `--chart-6`, `--chart-5`, na ordem da COR-8); motivo e submotivo
   herdam o mesmo slot, mas com contorno neutro `--line-subtle`, porque o preenchimento de todos
   os níveis é `--surface-sunken` e o texto nunca fica sobre marca saturada (ROT-6).
4. **Vão entre vizinhos.** Cada retângulo recua 1,5 px de cada lado do intervalo calculado, o que
   abre 3 px de vão entre nós adjacentes (COR-5).
5. **Nome em até duas linhas, nunca em reticência.** Nome maior que a largura útil da coluna quebra
   por palavra inteira em até duas linhas (`wrapLabel`); reticência é proibida em nome de marca
   desenhada (TIP-7). O nó só desenha nome e valor quando a altura do intervalo comporta as linhas
   que saíram (`fitLabel`); do contrário fica só com a marca colorida e o `title` nativo do SVG,
   que guarda o texto inteiro, mas essa marca sem rótulo não é o fim da linha: ela reaparece na
   lista de identificação (item 9).
6. **Cabeçalho de coluna.** "Categoria", "Motivo" e "Submotivo" em `--text-muted`, 11 px, no topo
   de cada coluna.
7. **Linha de leitura.** Frase `aria-hidden` acima do desenho, calculada do dado: a categoria líder
   e a participação dela no total de perdas.
8. **Cor pertence à categoria, não à posição.** O slot de cor e a categoria ancestral são gravados
   em todo descendente do ramo durante a partição (`categoryId`, `categoryLabel` em `PlacedNode`),
   e é essa mesma categoria que agrupa a lista de identificação.
9. **Trilha de ancestrais, na `v2`.** Quando um ramo é ampliado, os ancestrais dele viram faixas
   finas no topo do desenho, com a largura proporcional ao valor e a posição dentro do intervalo do
   pai, mais o percentual escrito ao lado (`formatRateWithVolume`). A trilha é horizontal e o
   conteúdo é vertical porque o texto nunca gira (TIP-5) e uma coluna fina de icicle lateral não tem
   largura para um nome deitado: são a mesma partição em eixos diferentes, e cada faixa escreve o
   próprio percentual justamente para a troca de eixo não pedir comparação de comprimento.
10. **Pista de rótulo fora da marca, na `v3`.** Na orientação vertical o rótulo não cabe dentro da
    faixa de 22 px, então ele vai para uma pista de texto logo abaixo dela, sobre o cartão. Isso põe
    o texto onde os tokens de texto têm par medido e desliga a altura da faixa como piso de rótulo.
    A regra de quem ganha pista é do nível inteiro, decidida pela faixa mais estreita (`fitLevel`):
    rotular quatro de dezesseis criativos sugeriria que os outros doze não têm nome.
11. **Respiro proporcional, nas `v2`, `v3` e `v4`.** O vão entre vizinhos é uma fração do próprio
    intervalo de cada nó (`GAP_FRACTION`, 1,5%), nunca um número absoluto de pixels. Vão absoluto
    consome a mesma tinta em toda faixa, e a faixa pequena paga tudo: é a armadilha GEO-16. Com
    fração constante a participação de área de cada retângulo é exatamente a participação do valor,
    conferido retângulo por retângulo nos 16 `rect` da faixa de criativo da `v3`, desvio de 0,0000%.
12. **Largura de rótulo por soma de glifo, nas `v2`, `v3` e `v4`.** `measureInkPx` soma a classe de
    cada caractere (dígito, maiúscula, minúscula, espaço) e acrescenta os 2 px que cobrem o p99 do
    erro dessa soma contra o motor de fonte. Constante única por caractere erra nos dois sentidos, e
    o lado que superestima esconde o rótulo sem nenhuma guarda acusar.
13. **Lista de identificação abaixo do gráfico, com o nível preservado.** Todo motivo e submotivo
   sem altura para o rótulo entra numa lista agrupada por categoria (`buildMutedGroups`), com o
   marcador na cor do slot, nome e valor (ROT-10): nenhuma parte do desenho fica muda, e a soma dos
   valores impressos, no desenho mais na lista, fecha o total de cada nível. A lista nunca acha a
   hierarquia: todo motivo com algo a identificar vira um bloco de cabeçalho, e os submotivos sem
   rótulo ficam sempre recuados por baixo do motivo deles, nunca soltos ao lado. O cabeçalho só
   mostra um valor quando o próprio motivo está mudo, caso em que os filhos recuados somam
   exatamente esse valor; quando o motivo já tem rótulo próprio no desenho, o cabeçalho é só o nome,
   sem repetir um valor já impresso, e só os submotivos mudos aparecem recuados embaixo dele.
   Motivo e submotivo nunca leem como irmãos que deveriam somar. É por isso que o canvas desta
   versão é maior que o preset "alto" (meta.json, seção ESP-2): a lista precisa do próprio bloco de
   altura, abaixo do SVG.

## Versões

- `v1_perdas-por-motivo-e-submotivo`: partição em TypeScript com `y0`/`y1` pela soma cumulativa,
  orientação lateral com uma coluna por nível, colunas de largura desigual, nome em até duas
  linhas sem reticência, lista de identificação por categoria para todo nó sem altura para o
  rótulo e ordenação decrescente estável dentro de cada pai. Nesta base fictícia, todas as 4
  categorias, 5 dos 7 motivos e 1 dos 13 submotivos ganham rótulo no desenho; os 14 nós restantes
  aparecem na lista abaixo do gráfico. Previews:
  [preview.svg](./v1_perdas-por-motivo-e-submotivo/preview.svg) (escuro) e
  [preview-claro.svg](./v1_perdas-por-motivo-e-submotivo/preview-claro.svg) (claro).
- `v2_ramo-concorrencia-ampliado`: a mesma árvore da `v1` com um ramo ampliado. A categoria
  Concorrência é reescalada para a altura inteira e sobram duas colunas, motivo e submotivo, em que
  os seis nós ganham rótulo direto; os ancestrais viram duas faixas finas no topo, a raiz com o
  total e o ramo com a posição dentro dela mais `28,7% (47 de 164) das perdas`. O ramo aberto é
  declarado no `data.ts` (`zoomedPath`), porque estado de interação não chega ao preview; clique num
  ancestral volta para aquele nível e a tecla Escape volta à raiz. Previews:
  [preview.svg](./v2_ramo-concorrencia-ampliado/preview.svg) (escuro) e
  [preview-claro.svg](./v2_ramo-concorrencia-ampliado/preview-claro.svg) (claro).
- `v3_investimento-da-plataforma-ao-criativo`: orientação vertical com quatro faixas, cor por
  plataforma com intensidade decrescente por profundidade (1,00, 0,86 e 0,72 de `fillOpacity`, todos
  acima da opacidade mínima de cada cor), filho "direto na campanha" calculado onde os criativos
  somam menos que a campanha, e a faixa de criativos sem rótulo, porque o valor mais curto do nível
  pede 58 px de tinta numa faixa de 31,9 px. Os dezesseis criativos vêm nomeados na lista abaixo,
  agrupados pela campanha de cada um. Previews:
  [preview.svg](./v3_investimento-da-plataforma-ao-criativo/preview.svg) (escuro) e
  [preview-claro.svg](./v3_investimento-da-plataforma-ao-criativo/preview-claro.svg) (claro).
- `v4_submotivos-com-rotulos-longos`: dois níveis e nome de submotivo de 45 a 65 caracteres, com a
  largura medida por soma de glifo e a quebra em até três linhas por palavra inteira. Exercita os
  dois casos de borda do modelo: a faixa de 4 perdas, que não comporta rótulo e é desenhada sem
  texto, e o submotivo de valor zero, que não tem faixa a ocupar numa partição e sai do desenho para
  uma lista própria, com o motivo da exclusão vindo do dado. Previews:
  [preview.svg](./v4_submotivos-com-rotulos-longos/preview.svg) (escuro) e
  [preview-claro.svg](./v4_submotivos-com-rotulos-longos/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a página de destino; a prop `data` segue o tipo
   `LossCategory[]`, sempre com `value` do pai igual à soma dos `children`.
2. Troque `data` pela consulta real de perdas por categoria, motivo e submotivo do período
   corrente, mantendo a soma exata entre pai e filhos (item 2 da Anatomia).
3. Se a hierarquia real tiver um nó com valor próprio sem filho que explique o total, crie um
   filho "direto no grupo" com a diferença antes de montar `data`, para o espaço não sobrar vazio.
4. `LEVEL_LABELS` só muda se o nome dos três níveis mudar; `COLUMN_WIDTHS` e o piso de rótulo
   (`LABEL_MIN_HEIGHT`, 48 px para nome de uma linha mais valor, mais `LABEL_LINE_HEIGHT` por
   linha extra) são derivados do canvas e não pedem ajuste manual.
5. Se a base real tiver uma hierarquia menos desbalanceada que a fictícia desta versão, mais nós
   ganham rótulo direto e a lista de identificação encolhe; se for mais desbalanceada, a lista
   cresce. Confira o canvas do `meta.json` depois de trocar `data`: pode precisar de mais altura
   para a lista não cortar (ESP-2).
6. Embrulhe em `VisualCard` com o `metricId` da métrica de perdas, seguindo o passo 5 da seção 16
   do CONTRATO.
7. Na `v2`, o ramo a abrir é a prop `zoomedPath`, um caminho de ids de fora para dentro; caminho
   vazio desenha a raiz inteira, com as três colunas. O estado da ampliação vive no componente, e
   quem cola decide se a página precisa controlá-lo de fora.
8. Na `v3`, o filho "direto na campanha" é calculado da diferença entre o pai e a soma dos filhos
   (`withDirectChild`): a consulta real não precisa entregá-lo, mas precisa entregar o valor próprio
   de cada campanha, senão a diferença some e a faixa de baixo fica mais curta sem explicação.
9. Na `v3` e na `v4`, o piso de rótulo é medido, não arbitrado: trocar `data` muda quais faixas
   ganham texto e quantas entram na lista, e a altura da lista é o que costuma pedir mais canvas.
   Confira o canvas do `meta.json` depois de trocar o dado, e confira também a escala do `svg` no
   preview, que precisa continuar em 1 (largura do `viewBox` igual à largura do corpo).

## Referências

- [nivo, Icicle](https://nivo.rocks/icicle/): orientação top, right, bottom, left; zoom por clique;
  navegação por teclado.
- [Apache ECharts, Flame graph](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/flame-graph.ts):
  série customizada com retângulo por nível e largura pelo valor.
- Praticante real: não localizado na pesquisa do catálogo para este modelo.
- Portal de design: busca no Behance sem resultado específico de icicle chart, registrada como
  lacuna no estudo da família.

## Desvios declarados da especificação do catálogo

O catálogo especifica cada versão antes de ela existir, e em dois pontos a especificação colidiu com
o contrato. Nos dois o contrato venceu, e o desvio está escrito também na nota do `meta.json` da
versão.

- `v3`, "luminosidade decrescente por profundidade": a palavra virou **intensidade**, porque
  `fillOpacity` compõe a marca com o cartão e o cartão troca de lado entre os temas, então o nível
  fundo escurece no escuro e clareia no claro (armadilha GEO-11). O degrau existe e é medido; o que
  mudou foi a descrição dele.
- `v3` e `v4`, "faixa sem rótulo, com o nome só no tooltip": a ROT-10 exige nome e número legíveis no
  desenho parado, e dica de mouse não é desenho parado. O `title` continua lá, e quem cumpre a regra
  é a lista de identificação abaixo do gráfico.
- `v4`, "truncamento com reticências medido pela largura da faixa": a TIP-7 proíbe reticência em nome
  de marca desenhada. A medida da largura continua, e o desfecho dela é quebra por palavra inteira em
  até três linhas; o que não cabe nem assim fica sem texto e vai para a lista.

## Observações da revisão (não bloqueantes)

- `v1_perdas-por-motivo-e-submotivo` (armadilha GEO-16, medido em 2026-09-29 ao produzir as irmãs):
  o `ROW_INSET` de 1,5 px por lado é respiro em medida **absoluta**, e num icicle a altura é o valor.
  Medido nos 13 `rect` da coluna de submotivo do `preview.svg`: o menor nó desenha **4,01% da área
  onde o valor pede 4,27%**, desvio relativo de **5,95%**, enquanto os nós grandes sobram. As três
  irmãs usam respiro proporcional (`GAP_FRACTION`) e medem 0,0000% de desvio; a correção na `v1` é
  trocar `ROW_INSET` constante por fração do intervalo, o que muda uma linha e não muda o desenho a
  olho nu. Fica registrado, e não corrigido, porque o `check` não acusa a `v1` e a instrução desta
  leva era não mexer em irmã aprovada.

- `v1_perdas-por-motivo-e-submotivo`: não há constante `MARGIN` no topo do arquivo e os retângulos
  nascem em `x = 0` e terminam em `x = VIEW_W` (ESP-3, "nada encosta na borda do corpo"). Segue
  como estava na rodada anterior: a correção de 2026-09-20 mexeu na largura das colunas
  (`COLUMN_WIDTHS`) e na quebra de linha, não nessa borda. Nos dois previews sobra folga
  horizontal, então o contorno de 2 px da categoria não chega a ser cortado; fica como risco caso
  o canvas mude de proporção.
- `v1_perdas-por-motivo-e-submotivo`: `ROW_INSET` de 1,5 px e `NAME_BASELINE_Y` de 17 px não são
  múltiplos de 2 px (ESP-1); `LABEL_LINE_HEIGHT`, novo nesta rodada, já nasceu em 14 px. Sem
  consequência visível no desenho.
- `v1_perdas-por-motivo-e-submotivo`: o motivo "Dados de contato inválidos" tem um único filho com
  o mesmo valor (12), o que desenha um submotivo idêntico ao pai e gasta uma coluna sem acrescentar
  leitura. Um segundo filho no `data.ts` exercitaria melhor a partição.
- `v1_perdas-por-motivo-e-submotivo`: o `data.ts` não exercita categoria de ausência nem valor nulo
  ou zero (seções 3 e 10); exercita nome longo, quebra de linha e, agora, a lista de identificação
  (item 9 da Anatomia), mas uma categoria de ausência entraria bem como quarto ramo.
- Catálogo (registrado aqui porque não posso editá-lo): a entrada de `v1` em
  `_estudo/catalogo/12_hierarquia.json` descreve a partição por "x0 e x1", enquanto a orientação
  lateral do próprio resumo do modelo exige `y0` e `y1`. O `meta.json` da versão já corrigiu a
  redação; o catálogo segue com a anterior.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20): os números da lista de identificação
  saem sem substantivo ("12", "19"); a unidade vive só no cabeçalho do bloco, "Sem rótulo no
  desenho, em perdas:". Funciona como título de eixo, mas a NUM-6 pede a unidade onde o número
  aparece; o substantivo no primeiro item de cada grupo já resolveria.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20): a categoria "Timing da decisão" tem
  um motivo só, de valor igual ao dela (20), então a coluna de motivo repete a de categoria nesse
  ramo. Junto com o filho único de "Dados de contato inválidos", são dois dos quatro ramos em que
  um nível não acrescenta partição.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20): a marca da lista é um quadrado de
  8 px preenchido com a cor do slot, enquanto a marca do desenho é um retângulo de contorno
  colorido e preenchimento `--surface-sunken`. A amostra na forma da marca (ROT-5) ficaria mais
  fiel com o contorno, e não com o preenchimento.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, segunda leitura): o `<svg>` recebe
  `className="h-full w-full"` sobre um `viewBox` de proporção fixa, então o `preserveAspectRatio`
  padrão centraliza o desenho e deixa cerca de 165 px vazios de cada lado dentro do corpo. A seção
  5 do CONTRATO sugere `h-full w-auto` para SVG puro justamente para essa folga não aparecer.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, segunda leitura): nenhum contorno usa
  `vectorEffect="non-scaling-stroke"` (seção 5), então o traço de 2 px da categoria e o de 1 px dos
  demais níveis encolhem junto com a escala do `viewBox` em vez de manter a espessura declarada.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, segunda leitura): o valor do cabeçalho
  de categoria na lista (`showsOwnValue`) sai num `<span>` sem `font-display` nem `tabular-nums`
  (TIP-1). Nesta base nenhuma categoria fica muda, então esse caminho não chega a renderizar.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, segunda leitura): o `<title>` nativo
  mora dentro de um `<svg aria-hidden>` e não chega ao leitor de tela. Como a lista de identificação
  já nomeia todo nó mudo (ROT-10), nada essencial se perde, mas o `title` não conta como canal de
  acessibilidade, só como dica de mouse.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, terceira leitura): o cabeçalho da
  lista diz "Sem rótulo no desenho, em perdas:", mas os motivos que aparecem ali como cabeçalho de
  bloco ("Patrimônio abaixo do mínimo", "Optou por banco tradicional") têm sim rótulo no desenho;
  eles entram só para agrupar os filhos mudos, e por isso saem sem valor. A frase do cabeçalho
  descreve os itens recuados, não os cabeçalhos de bloco.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, terceira leitura): achar na lista o
  retângulo em branco que se está olhando depende só da posição vertical e da ordem de leitura da
  grade de 2 colunas, porque a cor da categoria vive apenas no contorno do nível 0 e no quadradinho
  da lista; motivo e submotivo no desenho são todos cinzas. Um contorno na cor do ramo nos níveis
  1 e 2, ainda que mais claro, daria a chave de ligação sem mexer no encoding.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, terceira leitura): o total de 164 não
  é impresso pelo Chart (NUM-5, agregado explícito). Ele está na frase acessível e no subtítulo que
  o `VisualCard` monta do `useCase`, e a linha de leitura traz só a parte do líder, 35%.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, terceira leitura): a raiz declara
  `@container` sem nenhum filho em `@sm:` ou equivalente, então a diretiva não faz nada hoje.
- `v1_perdas-por-motivo-e-submotivo` (revisão de 2026-09-20, terceira leitura): o preenchimento da
  marca é `--surface-sunken` e o contorno dos níveis 1 e 2 é `--line-subtle`, dois tokens que a
  17.2 lista como estrutura, não como papel de dado; o papel categórico fica só no contorno do
  nível 0. A escolha está justificada no topo do `Chart.tsx` (ROT-6 não tem par aprovado de texto
  sobre as categóricas fora da `--chart-1`) e os dois previews mostram a marca destacada do cartão,
  mas a tabela de papéis não tem linha para esse uso.

## Correções da rodada de 2026-09-20

Reprovação anterior (`v1_perdas-por-motivo-e-submotivo`), problemas e o que mudou:

- **ROT-10 (submotivo mudo).** 12 dos 13 submotivos e 2 dos 7 motivos ficavam sem nome e sem
  número no desenho parado. Resolvido com duas mudanças que atuam juntas: colunas de motivo e
  submotivo ficaram mais largas (`COLUMN_WIDTHS`), e todo nó cujo intervalo comporta o rótulo (uma
  ou duas linhas de nome mais o valor) passou a mostrá-lo; o que ainda não cabe entra numa lista de
  identificação nova, abaixo do gráfico, agrupada por categoria, com nome e valor de cada parte
  muda (item 9 da Anatomia). Nesta base, isso deixou 4 categorias, 5 motivos e 1 submotivo no
  desenho, e os 14 nós restantes na lista, nenhum sem nome em lugar nenhum.
- **TIP-7 (`truncateLabel` cortava com reticência).** A função foi removida; `wrapLabel` quebra o
  nome em até duas linhas por palavra inteira, e `fitLabel` só libera o rótulo quando a altura do
  nó comporta as linhas que saíram. Nome de marca desenhada nunca mais trunca nesta versão. O
  comentário que citava a TIP-7 como se ela autorizasse a reticência foi reescrito junto com a
  correção.
- **ROT-10 (o impresso não somava o todo).** Consequência direta da correção acima: como cada nó é
  ou rotulado no desenho ou listado abaixo, nunca as duas coisas nem nenhuma, a soma dos valores
  impressos nas duas formas sempre fecha o total de cada nível, sem precisar conferir caso a caso.
- **useCase promete ler até o submotivo.** O nível de submotivo deixou de depender só da dica: com
  a coluna mais larga, o submotivo "Ticket abaixo de R$ 1 milhão" (22 perdas) aparece no desenho, e
  todos os outros 12 aparecem na lista de identificação, nomeados e com valor. Ler da categoria ao
  submotivo continua possível sem interação; nem todo submotivo tem rótulo dentro do retângulo,
  mas nenhum fica só na dica, que é o padrão que o catálogo reserva para `v3` e `v4`.
- **17.2 (retângulo neutro sem valor escrito nem junto dele).** Os nós sem rótulo direto passaram a
  ter nome e valor escritos ao lado, na lista de identificação logo abaixo do próprio gráfico: a
  isenção do neutro de dado (17.2, "só com o valor escrito na marca ou junto dela") passa a ser
  satisfeita pela lista, e não mais pela dica isolada.
- **Canvas.** O preset "alto" (640x560) não sobra altura para a quebra de duas linhas mais a lista
  de identificação; o `meta.json` passou a declarar canvas por número (640x780, depois ajustado
  para 640x740 depois de medir a folga sobrando no preview), com a conta em "notes" (ESP-2).

## Segunda correção da rodada de 2026-09-20 (ROT-10, hierarquia achatada)

A primeira correção acima resolveu o motivo e o submotivo mudos ficarem sem nome, mas criou uma
mentira nova: a lista concatenava motivos e submotivos do mesmo grupo numa única sequência plana,
sem marcar qual linha é pai e qual é filho. Sob a categoria "Timing da decisão", com 20 ocorrências,
a lista imprimia 20, 13 e 7 em sequência; os três números liam como irmãos que deveriam somar,
quando 13 e 7 são os submotivos que compõem os 20 do motivo.

- **O que mudou.** `buildMutedGroups` substitui a lista plana por um bloco por motivo
  (`MutedMotivoBlock`), sempre com o mesmo formato: uma linha de cabeçalho com o nome do motivo, e
  recuada por baixo dela, uma lista com os submotivos sem rótulo. O cabeçalho só imprime um valor
  quando o próprio motivo está mudo, e nesse caso os filhos recuados são todos os dele, com ou sem
  rótulo direto no desenho, porque é essa soma completa que prova que o pai é feito exatamente dos
  filhos; quando o motivo já tem rótulo próprio no desenho, o cabeçalho fica sem valor (não repete
  um número já impresso na coluna de motivo) e só os submotivos mudos entram recuados embaixo. Em
  nenhum dos dois casos o valor do motivo aparece na mesma altura visual dos submotivos.
- **Prova por contagem.** Nesta base, 2 motivos e 12 submotivos ficam sem rótulo no desenho, 14 no
  total: todos os 14 aparecem na lista, cada um em sua própria linha, motivo como cabeçalho e
  submotivo recuado sob o motivo dele. Os dois motivos que a lista imprime com valor fecham a
  conta com os filhos recuados: "Dados de contato inválidos" (12) soma o único filho "Telefone
  incorreto ou desligado" (12); "Adiou a decisão para outro momento" (20) soma "Aguardando evento
  de liquidez declarado" (13) mais "Priorizou outro projeto no período" (7). Os outros 5 motivos
  aparecem como cabeçalho sem valor, cada um agrupando só os próprios submotivos mudos.
- **Campo novo em `PlacedNode`.** `parentId`/`parentLabel` guardam o pai imediato de cada nó (a
  categoria para um motivo, o motivo para um submotivo), separado de `categoryId`/`categoryLabel`,
  que sempre aponta para a raiz do ramo. É esse campo que permite agrupar cada submotivo sob o
  bloco do motivo certo, em vez de sob a categoria inteira.

## Terceira correção da rodada de 2026-09-20 (ROT-4, TIP-2, ESP-2, NUM-6)

A segunda correção resolveu a hierarquia da lista, mas a lista em si ficou grande demais para o
canvas de 640x740 herdado da primeira correção: em grade de 4 colunas (`grid-cols-2
@lg:grid-cols-4`), cada coluna media só 131,5 px, estreita demais para a maioria dos nomes de
motivo e submotivo, que quebravam palavra a palavra em 3 a 5 linhas. A lista de identificação
mediu 400 px no preview reprovado, 65% do corpo, e sobrou só 212,5 px de um `viewBox` de altura
500 para o `<svg>` do icicle: o navegador encolheu tudo (`preserveAspectRatio` padrão) numa escala
de 0,425, o texto de 12 px saiu a 5,1 px na tela (TIP-2) e o menor retângulo de submotivo (7
perdas) saiu abaixo do piso de 12 px de altura (ESP-2). Os números da lista também saíam crus (12,
19, 17), sem o substantivo que a NUM-6 cobra em toda contagem solta.

- **O que mudou na lista.** A grade perdeu o degrau `@lg:grid-cols-4`: agora são sempre 2 colunas,
  o que quase dobra a largura disponível por rótulo (de ~63,5/77,5 px para ~187/201 px nas duas
  profundidades da lista) e faz a maioria dos nomes caber numa linha só, em vez de 3 a 5. O
  `leading-snug` no contêiner da grade aperta o interlinhado residual. Isso já derruba a lista de
  400 px para 259,25 px no preview atual, medido no `foreignObject` do render.
- **O que mudou no canvas.** Uma lista mais enxuta não bastava sozinha: 259,25 px ainda passam de
  30% de um corpo de 621,5 px (o corpo do preset "por número" anterior, 640x740). Em vez de encolher
  a lista mais e arriscar voltar a truncar ou a apertar demais o texto, o canvas subiu para 640x1000
  (`VIEW_H` do `<svg>` foi para 585, o valor medido como o que sobra de fato para o desenho depois
  da lista neste canvas). Resultado medido no preview corrigido: corpo de 881,5 px, lista em 259,25
  px (29,4%, abaixo do teto de 30% da ROT-4), e o `<svg>` sai com `width="574" height="590.25"` para
  um `viewBox="0 0 574 585"`, ou seja escala 1 (limitada pela largura, que já bate 574 = 574): nada
  encolhe, o texto de 12/11 px do desenho chega à tela em 12/11 px de verdade. A regra que decidiu
  subir o canvas em vez de afinar mais a lista é a ESP-2: quando falta espaço, quem cede é a altura
  do canvas, nunca o piso do texto ou da marca.
- **Efeito colateral bom: menos marcas mudas.** Com mais altura sobrando para a partição, dois nós
  que antes ficavam sem espaço para o rótulo passaram a caber: o motivo "Adiou a decisão para outro
  momento" (20 perdas) e o submotivo "Relação prévia com o concorrente" (19 perdas) agora aparecem
  desenhados, com nome e valor. A base foi de 14 marcas mudas (2 motivos, 12 submotivos) para 12 (1
  motivo, 11 submotivos); a prova por contagem da correção anterior continua de pé com os números
  novos, e a soma de cada motivo com seus submotivos (desenhados ou listados) continua fechando o
  valor do pai.
- **NUM-6.** Todo número da lista de identificação, cabeçalho de motivo mudo ou submotivo recuado,
  ganhou o substantivo "perdas" ao lado (`"20 perdas"`, não `20`); a coluna de valor de cada linha
  passou de 32 px para 56 px para caber o texto mais longo sem quebrar.
- **Dívida corrigida de passagem (TIP-1).** O `span` do valor de uma categoria muda
  (`showsOwnValue`) não usava `font-display`/`tabular-nums`; nesta base nenhuma categoria fica sem
  rótulo, então o trecho nunca renderizava, mas ficou certo para o dia em que uma categoria de
  ausência (candidata já registrada nas observações abaixo) tornar esse caminho alcançável.
