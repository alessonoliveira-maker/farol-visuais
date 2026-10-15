# Árvore e dendrograma

## O que é

Nós ligados por arestas do pai para os filhos. Na árvore arrumada os nós ficam por profundidade;
no dendrograma todas as folhas se alinham; na árvore radial a raiz vai ao centro e as folhas ao
perímetro. O organograma é a mesma forma com cartões. Todo o layout é calculado em TypeScript,
sem biblioteca de layout, e as quatro versões percorrem as quatro formas: lateral com aresta curva
(v1), organograma de cartões com conector ortogonal (v2), dendrograma radial (v3) e lateral
desbalanceada com ramo recolhido e afastamento por contorno (v4).

## Quando usar

- Estrutura de pertencimento: organograma, taxonomia de campanhas e criativos, catálogo de
  produtos.
- Quando a mensagem é quem pertence a quem, com ou sem valor em cada nó.
- Taxonomia grande num espaço quadrado, na versão radial, quando a forma geral importa mais que
  a consulta.
- Expandir e recolher ramos com contagem de descendentes ocultos.

## Quando evitar

- Quando o valor é a mensagem: use treemap (12/01) ou icicle (12/06).
- Arestas entre ramos diferentes: deixa de ser hierarquia; use rede (família 27).
- Consulta nó a nó em taxonomia grande na forma radial: a leitura linear orienta melhor.
- Decomposição por fórmula com operadores e faixas: use árvore de indicadores (12/04).

## Anatomia

1. **Nó por função, grupo e raiz.** Um círculo por nó, com raio maior nos níveis mais altos
   (`NODE_RADIUS`, 6 px na raiz, 5 px no grupo, 4 px na função), só para diferenciar a
   profundidade sem depender só da posição.
2. **Aresta curva do pai para cada filho.** `M x0,y0 C x0,ym x1,ym x1,y1`, com o ponto médio
   vertical como controle dos dois lados (`edgePath`), calculada em TypeScript e desenhada em SVG
   puro. A aresta é o próprio dado (apagá-la apaga quem é filho de quem), então sua cor vem do
   `slot` categórico do filho que ela liga, nunca do neutro de referência `--line-strong` (ACE-6).
3. **Layout arrumado ("tidy").** A folha é posicionada pela ordem de entrada no `data.ts`
   (`leafIndex`, de cima para baixo); o pai é posicionado pela média vertical dos filhos,
   calculada de baixo para cima na mesma recursão que monta o layout (`buildLayout`).
4. **Cor por categoria, não por posição.** Cada grupo declara o próprio `slot` no `data.ts`
   (COR-3, COR-8); função e raiz herdam o slot já resolvido do grupo em que vivem, e a raiz nunca
   compete por slot porque representa o todo, ficando em `--line-strong`.
5. **Rótulo de nome e contagem ao lado do nó**, em duas linhas: o cargo em cima, a contagem de
   pessoas embaixo, no singular quando o valor é 1 (`formatHeadcount`, NUM-6). Todo nó com filho
   tem aresta saindo do mesmo ponto onde o rótulo nasce; a aresta mede só 1,5 px, fina demais para
   o halo da ROT-7 (que abaixo de 18 px de espessura apaga o próprio traço). Por isso quem sai do
   lugar é o rótulo: `findLabelPlacement` testa deslocamentos verticais e, se nenhum limpar no
   afastamento padrão, escala também o afastamento horizontal (dois estágios, seção "Segunda
   correção de 2026-09-20"), até achar uma posição que a busca mediu livre de toda aresta do
   desenho na faixa de texto (busca geométrica sobre a curva, não sobre o preview fixo); o nó
   ganha uma linha de chamada até o rótulo deslocado.
6. **Headcount de grupo e raiz somado dos filhos no próprio Chart**, nunca digitado duas vezes no
   `data.ts`: o número ao lado de um grupo sempre fecha com a soma das funções dele.
7. **Linha de leitura acima do desenho**, calculada do dado: o grupo com mais pessoas e a
   participação dele no total (ANO-5).
8. **Frase acessível na raiz**, calculada do dado: total de pessoas, número de grupos e de
   funções, grupo líder e função líder (ACE-1).
9. **Cartão de nó, no organograma** (v2). Cartão em Tailwind com `rounded-lg border
   border-line-subtle bg-surface-raised`, posicionado por coordenada calculada no próprio
   arquivo, e o conector ortogonal em SVG por baixo (tronco, barramento e descida), em
   `--text-muted`, que mede 5,21:1 e 5,37:1 contra o cartão e cumpre a ACE-6.
10. **Microbarra de uso contra teto** (v2). Trilho em `--surface-sunken`, que é o que a TOK-1
    endossa para trilho, e preenchimento na cor da faixa: `--text-muted` com folga,
    `--accent-amber` acima de 85% e `--negative` acima de 100%. A cor nunca anda sozinha: a faixa
    também tem palavra escrita e ícone próprio (ACE-2), e o valor sai por `formatRateWithVolume`,
    com percentual e volume juntos (DAD-1).
11. **Anel do dendrograma radial** (v3). Raiz no centro, plataforma em 46 px, campanha em 90 px e
    criativo em 128 px de raio; ângulo pela ordem da folha, com 10 graus de abertura entre a
    última e a primeira. A aresta é o elbow polar (`elbowPath`): arco no raio do pai até o ângulo
    do filho e segmento radial para fora.
12. **Rótulo de perímetro horizontal** (v3). Nome curto da campanha em raio de 140 px, no centro
    angular do ramo, com `textAnchor` pelo sinal do cosseno; o nome inteiro vive no `<title>` do
    nó, que é o tooltip nativo. O catálogo pedia a metade esquerda girada 180 graus e a TIP-5
    proíbe `rotate` em texto, então sobrou o alinhamento, que resolve o mesmo problema.
13. **Afastamento por contorno** (v4). Cada subárvore devolve, por profundidade, a linha mais alta
    e a mais baixa que ocupa, e a vizinha desce só o que o encontro dos dois contornos pedir
    (`requiredShift`), na ideia de Reingold e Tilford: é o que deixa o ramo estreito subir ao lado
    do ramo largo recolhido.
14. **Selo de contagem oculta** (v4). Três lugares, a mesma regra: o botão do ramo recolhido diz
    quantas funções ele guarda, o nó cortado pela profundidade máxima leva a contagem à direita do
    rótulo, e o teto de filhos desenhados abre uma linha própria de folhas ocultas, com o ponto
    vazado que a ACE-2 pede para ausência. O botão é `<button>` de verdade, com `aria-expanded`,
    alcançável por teclado, e o estado inicial vem do `data.ts`.

## Versões

- `v1_estrutura-da-area-comercial`: árvore lateral de três níveis (raiz, grupo, função) com a
  estrutura fictícia da área comercial: 15 pessoas em 3 grupos (Comercial, Pré-vendas,
  Marketing) e 7 funções. Demonstra o layout arrumado com folha pela ordem e pai pela média dos
  filhos, a aresta curva calculada em TypeScript e colorida pelo `slot` do filho que ela liga
  (ACE-6, nunca `--line-strong`), a cor por categoria vinda do `slot` do `data.ts` (nunca da
  posição no array), o anticolisão de rótulo em dois estágios contra aresta fina
  (`findLabelPlacement`, ROT-7), a contagem de pessoas por função no singular e no plural, e a
  ausência de qualquer nome de pessoa no desenho. Previews: [preview.svg](./v1_estrutura-da-area-comercial/preview.svg)
  (escuro) e [preview-claro.svg](./v1_estrutura-da-area-comercial/preview-claro.svg) (claro).
- `v2_organograma-com-capacidade-contra-teto`: organograma de dois níveis com a área no topo e
  quatro funções numa fileira, cada uma num cartão de Tailwind com o uso do mês contra o teto
  declarado. Demonstra o cartão posicionado pelo layout com conector ortogonal em SVG por baixo, a
  microbarra de uso com percentual e volume escritos, a cor pela faixa de uso sempre acompanhada de
  palavra e ícone, e a etiqueta de procedência por número, com o teto em premissa e o uso em
  medido. Previews: [preview.svg](./v2_organograma-com-capacidade-contra-teto/preview.svg) (escuro)
  e [preview-claro.svg](./v2_organograma-com-capacidade-contra-teto/preview-claro.svg) (claro).
- `v3_taxonomia-radial-de-criativos`: dendrograma radial com 96 criativos em 9 campanhas e 3
  plataformas, e o caminho de um criativo até a raiz aceso. Demonstra o ângulo pela ordem da folha
  com abertura de 10 graus, o raio pela profundidade com todas as folhas alinhadas, o nome curto no
  perímetro com o nome inteiro no tooltip, e o destaque por espessura, anel e peso, nunca por troca
  de cor. Previews: [preview.svg](./v3_taxonomia-radial-de-criativos/preview.svg) (escuro) e
  [preview-claro.svg](./v3_taxonomia-radial-de-criativos/preview-claro.svg) (claro).
- `v4_subarvore-larga-recolhida`: árvore lateral desbalanceada, com uma coordenação de 14 funções
  recolhida ao lado de outras de 2 e 3 abertas. Demonstra o afastamento de subárvores vizinhas pelo
  contorno, o estado expandido declarado no `data.ts` com botão alcançável por teclado, a
  profundidade máxima visível fixa e a contagem de descendentes ocultos em três lugares. Previews:
  [preview.svg](./v4_subarvore-larga-recolhida/preview.svg) (escuro) e
  [preview-claro.svg](./v4_subarvore-larga-recolhida/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a página de destino; a prop `data` segue o tipo
   `OrgNode[]`, sempre com um único elemento raiz.
2. Troque `data` pela estrutura real (organograma real da área), mantendo `headcount` só nas
   funções que são folha: grupo e raiz continuam somando os filhos no Chart.
3. Se a estrutura real tiver algum ramo muito mais largo que os outros, comece pela
   `v4_subarvore-larga-recolhida`, que recolhe ramo e limita profundidade; a v1 não recolhe nada.
4. `COLUMN_X` e `MARGIN` são derivados do canvas do `meta.json`; ajuste os dois juntos se o
   canvas mudar de tamanho, para o rótulo do último nível continuar com espaço à direita.
5. Embrulhe em `VisualCard` com o `metricId` da métrica de estrutura, seguindo o passo 5 da seção
   16 do CONTRATO.
6. Na v2, cada função traz a própria unidade (`unit`) porque entrada de pré-vendas e oportunidade
   de vendas não se somam: o cartão da área conta pessoas e funções, nunca a soma dos tetos. Os
   limiares de faixa são `NEAR_CEILING` e `OVER_CEILING` no topo do arquivo.
7. Na v3, o `viewBox` tem o tamanho do corpo medido do canvas e a escala do `<svg>` sai 1. Mudando
   o canvas, mude `VIEW_W`, `VIEW_H` e o centro junto, senão o texto passa a chegar à tela abaixo
   dos 11 px sem nada acusar no código.
8. Na v4, abrir o ramo de 14 funções cresce o desenho além do corpo do canvas `card`; quem colar
   decide entre deixar o cartão crescer e baixar `MAX_VISIBLE_CHILDREN`, que é o teto de filhos
   desenhados por nó.

## Referências

- Catálogo: [Vega, Tree Layout](https://vega.github.io/vega/examples/tree-layout/): alternância
  tidy e cluster e quatro estilos de aresta.
- Catálogo: [nivo, Tree](https://nivo.rocks/tree/): modo árvore ou dendrograma, `linkCurve` e
  destaque de ancestrais e descendentes.
- Catálogo: [Data Visualisation Catalogue, Tree Diagram](https://datavizcatalogue.com/methods/tree_diagram.html):
  raiz, ramos e folhas; organograma como método relacionado.
- Catálogo: [From Data to Viz, Dendrogram](https://www.data-to-viz.com/graph/dendrogram.html):
  horizontal para rótulos longos e circular para economizar espaço.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

## Leva de 2026-09-29

As três versões que faltavam entraram nesta data, e o modelo fica com as quatro do catálogo. Três
decisões merecem registro, porque valem para quem tocar o arquivo depois.

**A escala do `<svg>` e o piso de 11 px.** A v1 desenha num `viewBox` de 894 x 274 dentro de uma
caixa de 894 x 257,5, e a escala de 0,9398 que sai daí faz os 11 px declarados chegarem à tela em
10,34 px: é a dívida de `TAMANHO-TEXTO` que o check aponta nela, e ela cega de quebra a
`COLISAO-TEXTO`, a `CONTRASTE-TEXTO` e a `TEXTO-NA-MARCA`, que saem `preview_com_escala`. As três
versões novas não repetem isso: a v3 desenha num `viewBox` do tamanho exato do corpo, e a v2 e a
v4 declaram `width` e `height` em pixel sem `viewBox`. Resultado medido no mesmo check: as quatro
guardas de desenho passam a medir a v3 e a v4.

**TIP-5 contra a especificação da v3.** O catálogo pedia os rótulos da metade esquerda girados 180
graus, e a TIP-5 é literal, nenhum `rotate` em texto, sem exceção para visual radial; nenhuma das
peças aprovadas do acervo gira texto. O contrato venceu: ficou o alinhamento à direita na metade
esquerda, que resolve o mesmo problema, e o desvio está escrito no `meta.json` da versão.

**ANO-6 contra a especificação da v2.** A ANO-6 diz que o Chart não desenha etiqueta de
procedência, porque ela é do `VisualCard` e aparece uma vez por cartão. A v2 desenha, porque o teto
é premissa e o uso é medido dentro do mesmo número de tela, e um selo único não diz as duas coisas;
é o mesmo caso de `12_hierarquia/04_arvore-de-indicadores/v1`, e está declarado no `meta.json`.

## Observações da revisão (não bloqueantes)

Revisão independente de 2026-10-14 sobre a `v2`, a `v3` e a `v4`, as três aprovadas sem bloqueante:
`npm run check` com 0 erro (os dois avisos são da `v1`, que não estava em julgamento), os dois temas
legíveis e nenhum texto cortado, sobreposto ou fora do corpo.

- `v2`: `--accent-amber` repete o hex de `--prov-premissa`, então no cartão de Pré-vendas a barra âmbar de "perto do teto" e o texto âmbar de "teto PREMISSA" dividem a mesma cor com dois papéis; o verde de "uso MEDIDO" é o hex de `--positive` e fica ao lado do vermelho de "acima do teto" no cartão Comercial. A palavra desfaz a dúvida, mas é a colisão que a COR-8 existe para evitar.
- `v2`: acima do teto a barra fica cheia, então Pré-vendas (94,2%) e Comercial (105,3%) desenham 5,8 pontos de diferença onde o dado tem 11,1. Está declarado e o número está escrito; um tique no 100% com o excedente além dele mostraria a grandeza sem depender do texto.
- `v2`: a linha de leitura repete o "25,0% (1 de 4)" que o cartão da área já imprime logo abaixo, e a frase acessível não cita a Pré-vendas, que é a função "perto do teto" do caso de uso. Para quatro funções, "1 de 4 funções" leria melhor que um percentual com casa decimal.
- `v2`: "158 de 150" lê como parte maior que o todo; "158 contra teto de 150" diria o mesmo sem estranhar. A microbarra de 6 px fica abaixo dos 12 px da ESP-2, sem consequência visível no preview.
- `v2` e `v4`: o conteúdo tem largura fixa em pixel (872 px e 574 px) e não se adapta a cartão mais estreito que o do catálogo; a decisão está explicada na leva de 2026-09-29, mas o passo de colar no Farol não avisa do corte lateral.
- `v3`: a contagem de cada campanha só se lê pelo vão angular; o caso de uso pergunta a distribuição por campanha, e escrever o número junto do nome curto ("Retomada 14") responderia sem contar pontos.
- `v3`: a legenda escreve a composição com uma casa (36,5%, 30,2%, 33,3%), e a NUM-1 pede percentual de composição inteiro, pelo maior resto (37%, 30%, 33%). A amostra da legenda é quadrada e a marca é ponto com traço (ROT-4).
- `v3`: o `label` do dado ("Criativos do mês") não aparece em lugar nenhum, então o período só existe no comentário do `data.ts` (DAD-9). O nome do criativo aceso ("Sul 06") é digitado no `data.ts` em vez de derivado de campanha e posição, e os dois podem divergir.
- `v3`: campanha com zero criativo cai no ângulo inicial (`START_DEGREE`), no topo do anel, com o nó e o rótulo fora do próprio ramo. O dado padrão não exercita.
- `v4`: o rótulo "Comercial" fica exatamente a 16 px do ponto da Pré-vendas, acima, e a 16 px do próprio ponto, abaixo, com o mesmo recuo de 14 px para os dois. Quem identifica o ponto ciano é a convenção de rótulo acima, não a proximidade. Afastar o rótulo do irmão de cima, ou pôr o rótulo na linha do nó, tira a dúvida.
- `v4`: o selo "2 ocultas" não leva o substantivo (NUM-6); o cartão diz "funções" em todo o resto, mas num organograma "ocultas" também lê como pessoas. O selo da linha de folhas ocultas diz "N funções ocultas", então os dois selos da mesma regra saem diferentes. Os dois números estão em `font-sans` sem `tabular-nums` (TIP-1).
- `v4`: abrir a Pré-vendas leva o conteúdo a cerca de 387 px num corpo de 241,5 px, e com `justify-center` o excesso sai pelos dois lados, cortando a linha de leitura e o primeiro rótulo em cartão de altura fixa. `justify-start` com rolagem guardaria o topo. A frase acessível também não conta as funções escondidas pelo teto de filhos, só as cortadas pela profundidade.
- `v4`: raiz declarada com `expanded: false` não ganha botão, porque o botão só existe para `kind === 'branch'`, e o desenho fica preso num ponto só sem estado vazio. O dado padrão não exercita.
