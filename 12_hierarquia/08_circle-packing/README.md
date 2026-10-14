# Circle packing

## O que é

Cada nó é um círculo; os filhos ficam dentro do círculo do pai, e a área de cada círculo é
aproximadamente proporcional ao valor do nó. Lê-se pelo agrupamento (quais itens pertencem a qual
grupo, e quais grupos são maiores) e não pela comparação fina de tamanho, porque a leitura de área
de círculo é uma das mais imprecisas que existem. O layout desta versão é uma aproximação em
espiral com teste de colisão, calculada em TypeScript e memorizada pela assinatura do dado.

## Quando usar

- A mensagem é o agrupamento: quais itens pertencem a qual grupo e quais grupos concentram mais.
- Até 2 ou 3 níveis e cerca de 60 folhas, com rótulo direto só nos círculos grandes o bastante.
- Peça de visão geral em que o tamanho aproximado já basta para orientar, sem exigir precisão.

## Quando evitar

- Comparação de valores com precisão: use barras ordenadas (família 02) ou treemap (12/01).
- Um nível só, sem hierarquia real: vira bolhas soltas; use barras (família 02) ou o modelo de
  bolhas (família 09).
- Espaço apertado: o modelo desperdiça muito espaço entre círculos; prefira treemap (12/01) quando
  o cartão for pequeno.
- Valores zero ou negativos: não cabem em área; ficam fora do desenho e numa lista à parte.

## Anatomia

1. **Círculo do criativo (folha).** Raio proporcional à raiz quadrada dos leads (`Math.sqrt`),
   nunca ao valor bruto, porque a área do círculo já cresce com o quadrado do raio. Cor herdada da
   campanha a que pertence (`slot` do `data.ts`, COR-3), a mesma paleta categórica dos anéis.
2. **Anel da campanha (pai).** Contorno sem preenchimento, na mesma cor categórica dos criativos
   que contém, com espessura de 2 px; a contenção geométrica é a relação em si (ACE-6), por isso o
   contorno usa a cor de dado e não o neutro de referência `--line-strong`.
3. **Empacotamento em espiral.** Dentro de cada campanha, os criativos são ordenados por raio
   decrescente e posicionados um a um, caminhando em ângulo e raio crescentes a partir do centro
   até achar uma posição sem colisão com nenhum já posicionado (`packCircles`). O mesmo algoritmo
   empacota as campanhas entre si, um nível acima.
4. **Raio do pai calculado, nunca arbitrado.** O raio do anel de cada campanha é a maior distância
   do centro até a borda externa de um criativo, mais uma margem fixa (`GROUP_MARGIN`); o raio do
   conjunto inteiro (usado para escalar o layout até o canvas) nasce da mesma conta um nível acima.
5. **Sem rótulo dentro do criativo.** O criativo é colorido pela cor categórica da campanha, que
   raramente é `--chart-1`; a tabela 17.10 só aprova texto em `--accent-cyan-contrast` sobre
   `--chart-1`, sem par medido para as demais cores da paleta, e `--text-primary` sobre qualquer
   categórica mede abaixo do piso (reprovado). Por isso todo criativo ganha identificação garantida
   na lista abaixo do desenho, nunca com texto sobre a própria marca.
6. **Legenda das campanhas.** Uma linha por campanha, com amostra na cor do anel, nome e total de
   leads: como o anel não leva texto (evita rótulo flutuante sobre os próprios criativos), é aqui
   que toda campanha ganha identificação garantida, independentemente do tamanho do círculo.
7. **Lista de identificação dos criativos sem rótulo direto**, agrupada por campanha e recuada por
   baixo do nome dela (ROT-10): o total da campanha já está na legenda do item 6 e nunca se repete
   na mesma altura visual dos criativos.
8. **Linha de leitura e frase acessível**, calculadas do dado: a campanha líder e a participação
   dela no total de leads, e o criativo com mais leads em toda a base.
9. **Vão entre círculos em pixel, não em unidade de layout** (v2, v3, v4). O empacotamento roda em
   unidade abstrata e só depois é escalado, então vão fixo em unidade de layout vira vão variável na
   tela. A escala é resolvida em quatro passadas: empacota, mede a caixa, tira a escala, converte o
   vão de pixel de volta para unidade de layout e repete. O vão fica em 2 px entre folhas, acima do
   piso de 1,5 px da COR-5, qualquer que seja o total. O vão empurra os círculos e nunca desconta
   raio de nenhum deles, que é o que preservaria a codificação por área (GEO-16).
10. **Rótulo dentro do círculo, liberado por soma de glifos** (v2, v3). A largura da caixa de tinta
    sai da tabela por glifo da guarda `COLISAO-TEXTO`, com dígito tabular a 0,620 em, e o teste é a
    meia diagonal da caixa mais 4 px contra o raio. Contido, o texto vai vazado em
    `--surface-raised` e **sem** halo (ROT-7b); não contido, o nó é nomeado na lista de
    identificação. A média por classe não serve aqui, porque erra de 8% a 26% para baixo em string
    real e o lado de baixo é o que esconde o vazamento.
11. **Veredito de custo por cor** (v2): folha em `--positive` quando o CPL qualificado fica abaixo
    da mediana do recorte e em `--text-muted` quando não, com a mediana calculada no preparo,
    devolvendo `null` em lista vazia (EST-1b) e escrita na legenda. Valor por
    `formatCurrencyCompact`, taxa por `formatRateWithVolume`.
12. **Rótulo de grupo no arco** (v3): ancorado por fora do círculo, com a folga reservada contra a
    **altura da caixa** de tinta e não contra a linha de base, e conferido pelos quatro cantos
    contra todo disco e todo anel do desenho (GEO-19). Tenta o arco superior, depois o inferior, e
    quando nenhuma posição fica limpa o grupo é nomeado só na tabela. O rótulo da origem sai na
    própria cor dela, o que dispensa uma legenda de origem.
13. **Régua de área com três círculos de referência** (v3): degraus redondos abaixo do máximo mais o
    **maior valor observado**, calculado do dado e nunca constante (ROT-5b). Contorno em
    `--text-muted`, que é o token de referência da 17.2, com a nota de que o tamanho é aproximado.
14. **Guarda de profundidade** (v4): profundidade 1 não é hierarquia, então a forma troca para
    barras horizontais ordenadas, com nome ao lado e valor na ponta livre (ROT-2), e o aviso escrito
    em `--warning`. Nó com valor zero sai do desenho, porque zero não tem área, e entra na lista com
    marcador vazado e o valor escrito. Nenhuma folha positiva é estado vazio (EST-1).

## Versões

- `v1_criativos-por-campanha`: "Criativos agrupados por campanha", 4 campanhas fictícias e 14
  criativos de 2026-08. Demonstra o raio pela raiz quadrada do valor, o empacotamento em espiral
  com teste de colisão, o raio do pai calculado a partir dos filhos com margem, e o layout em
  `useMemo` com a assinatura textual do dado. Nenhum criativo leva texto sobre a própria marca
  (item 5 da Anatomia), então a identificação completa dos 14 criativos vive na lista abaixo do
  desenho, agrupada por campanha; a legenda das 4 campanhas fica entre o círculo e essa lista.
  Canvas `alto` em vez do `quadrado` sugerido pelo catálogo, declarado em `meta.json`, porque a
  lista de 14 linhas não cabe na altura do preset menor sem espremer o círculo. Previews:
  [preview.svg](./v1_criativos-por-campanha/preview.svg) (escuro) e
  [preview-claro.svg](./v1_criativos-por-campanha/preview-claro.svg) (claro).
- `v2_cpl-qualificado-abaixo-da-mediana`: "Campanhas com CPL qualificado abaixo da mediana", 3 canais
  e 10 campanhas de 2026-08. Demonstra o veredito de custo por cor (item 11 da Anatomia), a mediana
  calculada no preparo com retorno `number | null`, o rótulo de nome e CPL liberado por soma de
  glifos (item 10) e o vão em pixel resolvido em quatro passadas (item 9). O contorno é o canal, em
  cor categórica por `slot` fixo, e o preenchimento é o veredito: dois canais de tinta, dois
  significados, os dois na legenda. Canvas por número em 640x480, com a legenda de canal e a lista de
  identificação numa coluna ao lado do desenho (ROT-4); o preset `alto` também caberia, mas deixaria
  110 px de faixa vazia embaixo. Previews:
  [preview.svg](./v2_cpl-qualificado-abaixo-da-mediana/preview.svg) (escuro) e
  [preview-claro.svg](./v2_cpl-qualificado-abaixo-da-mediana/preview-claro.svg) (claro).
- `v3_entradas-por-origem-subcanal-e-desfecho`: "Entradas por origem, subcanal e desfecho", 2 origens,
  5 subcanais e 15 folhas de 2026-08. Demonstra os três níveis com a raiz fora do desenho, cor
  semântica de desfecho na folha e contorno de origem nos dois níveis de grupo, o rótulo de grupo no
  arco (item 12) e a régua de área com três círculos de referência (item 13). A identificação sai
  numa tabela de `pai › filho` com uma coluna por desfecho, que é a forma que a ROT-10 pede em visual
  hierárquico. Com este recorte, 2 dos 5 subcanais conseguem rótulo de arco e os outros 3 ficam
  nomeados só na tabela: é o anticolisão decidindo, não o autor. Canvas por número em 640x500.
  Previews:
  [preview.svg](./v3_entradas-por-origem-subcanal-e-desfecho/preview.svg) (escuro) e
  [preview-claro.svg](./v3_entradas-por-origem-subcanal-e-desfecho/preview-claro.svg) (claro).
- `v4_um-nivel-so-e-zeros`: "Dado sem hierarquia e criativos sem lead", 8 criativos de 2026-08 num
  recorte de profundidade 1, três deles sem lead. Demonstra a guarda de profundidade (item 14), o
  zero fora do desenho com o motivo escrito e o estado vazio. O dado publicado exercita o caminho das
  barras, então é ele que o preview fotografa; o caminho do empacotamento vive no mesmo componente e
  responde a qualquer recorte com filhos. Canvas `card`. Previews:
  [preview.svg](./v4_um-nivel-so-e-zeros/preview.svg) (escuro) e
  [preview-claro.svg](./v4_um-nivel-so-e-zeros/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` de `v1_criativos-por-campanha/` para a página de destino; a prop
   `data` segue o tipo `CampaignGroup[]`, sempre com dois níveis (grupo e folha).
2. Troque o dado fictício pela consulta real, mantendo o `slot` de cada grupo fixo por categoria
   (nunca calculado pela posição no ranking), para a cor não trocar quando o recorte de período
   mudar.
3. O modelo não desenha texto sobre a marca do criativo (item 5 da Anatomia); se a página real
   precisar de rótulo direto num círculo grande, use a cor de fundo do cartão como referência de
   contraste, não a cor categórica, ou mova o nome para fora do círculo com linha de chamada.
4. Dê altura ao pai (`h-64` na grade, por exemplo) ou passe `height`; o `viewBox` é fixo e escala
   pelo espaço disponível.
5. Com mais de 6 campanhas, revise a lista de identificação: ela cresce uma linha por criativo sem
   rótulo direto e pode passar da altura do cartão antes de passar do teto de 6 categorias do
   `chart-1` a `chart-6` (COR-4); nesse caso agrupe as campanhas menores em "Outras" antes de colar.

## Referências

- Catálogo: [From Data to Viz, Circular Packing](https://www.data-to-viz.com/graph/circularpacking.html):
  remover os primeiros níveis melhora a leitura; um nível só vira barra.
- Catálogo: [Data Visualisation Catalogue, Circle Packing](https://datavizcatalogue.com/methods/circle_packing.html):
  mostra melhor a estrutura que o treemap, com baixa eficiência de espaço.
- Catálogo: [Vega, Circle Packing](https://vega.github.io/vega/examples/circle-packing/): transform
  `pack` com área proporcional e cor por profundidade.
- Catálogo: [nivo, CirclePacking](https://nivo.rocks/circle-packing/): `padding`, `leavesOnly`,
  zoom e `childColor`.
- Catálogo: [visx, sandbox pack](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-pack):
  referência de geometria de empacotamento em React.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf):
  o erro de codificar valor pelo diâmetro; quadrados alinhados comparam melhor que círculos.

## Observações da revisão (não bloqueantes)

Revisão de 2026-09-20, sobre `v1_criativos-por-campanha`. Nenhum item abaixo reprova; o próximo
agente que tocar o arquivo resolve o que fizer sentido.

- `v1`: o enquadramento sai da distância até a ORIGEM do layout, não da caixa do agrupamento, e a
  origem é o centro do primeiro círculo empacotado, não o centro do conjunto. O resultado é um
  desenho deslocado para baixo dentro do `viewBox`, com cerca de 55 px CSS de faixa vazia acima dos
  círculos e os círculos uns 25% menores do que caberiam. Enquadrar pela caixa mínima dos grupos
  resolve os dois de uma vez.
- `v1`: o vão entre folhas da mesma campanha fica em cerca de 1 px CSS no canvas atual
  (`LEAF_GAP = 0.6` em unidade de layout, multiplicado pela escala), abaixo do piso de 1,5 px da
  COR-5. No preview os círculos ainda se separam, mas num cartão mais estreito eles colam e a
  contagem de criativos por campanha deixa de ser legível.
- `v1`: o contorno do grupo usa `GROUP_STROKE_WIDTH = 2` em unidade de `viewBox`, então ele encolhe
  junto com o desenho e chega a cerca de 0,8 px CSS. Como é esse traço que carrega a contenção, que
  é a relação do modelo (ACE-6), vale `vectorEffect="non-scaling-stroke"` para ele não sumir quando
  o cartão for menor que o preset.
- `v1`: a legenda das campanhas traz o valor em linha, sem a coluna alinhada à direita da ROT-5 e da
  TIP-6, e fica abaixo do gráfico, onde a ROT-4 pede acima ou ao lado. Os espaçamentos também saem
  da tabela 17.7: 6 px entre amostra e texto (a tabela pede 10) e 4 px entre linhas (idem).
- `v1`: legenda e lista de identificação em 11 px, onde a 17.1 dá 12 px ao texto de legenda e 14 px
  em Space Grotesk 600 ao valor de legenda. Fica no piso da TIP-2, legível nos dois temas, mas é o
  menor tamanho do contrato usado no elemento que carrega a identificação inteira.
- `v1`: todo número desenhado se repete na lista de baixo, e a lista ocupa mais área do cartão que o
  próprio desenho. É consequência direta da ROT-10, que o autor declarou na Anatomia, e não de um
  descuido; ainda assim, o cartão lê mais como tabela com uma vinheta do que como gráfico.
- `v1`: a frase acessível começa em "Circle packing", termo em inglês, ainda que seja o nome do
  modelo no catálogo. "Empacotamento de círculos" diria o tipo em português, como pede a seção 9.
- `v1`: `meta.json` traz "Raio do pai pelo maior distância mais raio dos filhos", com erro de
  concordância copiado do catálogo, e o rótulo "História da família Andrade" usa sobrenome de
  família, que é fictício mas desnecessário perto da régua da seção 3.
