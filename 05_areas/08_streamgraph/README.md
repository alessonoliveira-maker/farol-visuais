# Streamgraph

## O que é

Área empilhada deslocada em torno de um eixo central (`stackOffset="silhouette"` ou `"wiggle"`, sem
eixo y numérico), de forma orgânica: cada camada é uma categoria, a espessura em cada instante é o
valor e a base muda de posição para minimizar a oscilação do conjunto. Serve para a impressão geral
de sazonalidade e de peso relativo entre muitas categorias, nunca para leitura de valor exato ou
comparação fina entre camadas, porque não existe base zero comum a nenhuma delas. **Decisão do dono
da marca (2026-09-18): toda versão deste modelo precisa dizer isso em texto no próprio corpo, não
só neste README**, e por isso as quatro versões trazem uma nota curta ("forma sem eixo numérico...")
além da legenda com o total exato de cada camada e a dica com o valor de cada ponto; nenhuma delas
promete leitura de valor que a forma não entrega. A ordem das camadas é decisão de dado tomada em
TypeScript, porque o Recharts empilha na ordem dos filhos e não tem prop de ordenação.

## Quando usar

- De 6 a cerca de 30 categorias com padrão temporal (sazonalidade, picos) em 30 ou mais períodos.
- Visão exploratória de onde o volume se concentrou ao longo do ano, sem precisar do valor exato.
- Mudança na ordem de tamanho entre categorias como a própria história (variação ordenada, `v3`).
- Uma campanha ou criativo concentrando um pico específico, com as demais como contexto (`v2`).

## Quando evitar

- Leitura de valor exato ou comparação fina entre camadas: área empilhada
  (`02_area-empilhada`) ou pequenos múltiplos (`01_area-simples`, versão `v3`).
- Dado sem padrão temporal: vira uma faixa monótona sem leitura.
- Valores negativos: a forma só aceita positivos.
- Tela estática sem rótulo ou legenda nas camadas maiores: a forma perde o sentido sem o nome.
- Poucos períodos na variação ordenada: bump chart (`04_linhas/08_bump-chart`).
- Mais de 6 categorias coloridas sem agrupar o restante em "Outras (n=X)" (COR-4).

## Anatomia

1. **Camadas (`Area`)**: uma por categoria, todas com o mesmo `stackId` e `stackOffset="silhouette"`
   no `AreaChart`; até 6 com cor própria nos slots 1, 3, 6, 5, 2, 4 da COR-8, o restante agregado em
   "Outras (n=X)" em `--line-strong`.
2. **Eixo y**: `<YAxis hide />`, escondido e não removido, porque o Recharts precisa dele para
   calcular o deslocamento mesmo sem desenhar números.
3. **Ordem das camadas**: função pura no topo do arquivo que ordena por valor e alterna as duas
   pontas da pilha (maior ao centro); recalculada a cada render a partir do `data` recebido, nunca
   fixa por índice de array (COR-3).
4. **Separador entre camadas**: `stroke="var(--surface-raised)"` de 1,5 px (COR-5).
5. **Nota de honestidade da forma**: uma linha de 11 px em `--text-muted`, em toda versão, dizendo
   que a forma não tem eixo numérico e onde está o valor exato (legenda, dica ou anotação).
6. **Legenda com total**: nome mais total do período por categoria, porque o valor exato de uma
   camada não sai da leitura visual da forma (ROT-4, ROT-5).
7. **Dica (`ChartTooltip`)**: valor exato de cada camada naquele ponto, formato `int`.
8. **Eixo de tempo**: `formatMonthShort` em tique mensal sobre dado semanal ou mensal, calculado por
   `monthlyTicks(rows)`.
9. **Estado vazio**: bloco `role="status"` com ícone `Filter` e frase, sem eixo nem grade.

## Versões

- **`v1_leads-por-campanha-no-ano`**: seis campanhas coloridas mais "Outras (n=6)", 52 semanas de
  2026; ordem decidida por `insideOutOrder` a partir do total do ano; legenda com o total de cada
  campanha; nenhuma anotação, só a nota de honestidade da forma.
- **`v2_picos-sazonais-com-destaque`**: uma campanha em destaque (`highlightId`, `chart-1`) contra
  quatro em `line-strong` com separador; dois picos anotados por `ReferenceLine` calculados do
  próprio `data` (maior total em cada metade do ano, sem data hardcoded), cada um com o total da
  semana e, no segundo pico, a participação do destaque.
- **`v3_origens-ordenadas-por-tamanho`**: SVG puro, porque o Recharts não reordena a pilha por
  período; seis origens coloridas mais "Outras (n=4)" realizam as 10 origens do caso de uso sem
  estourar o teto de 6 cores; a ordem existe por mês, por posto simples de tamanho, com a maior
  sempre na base da faixa (alternativa que a seção 3.5 do estudo da família admite ao lado do
  centro, e que mantém posto vizinho na classificação como vizinho na pilha); as fronteiras da
  pilha são calculadas uma vez por trecho e consumidas pelas duas vizinhas, com os mesmos números
  e os mesmos pontos de controle da cúbica, que é o que torna a fresta impossível em vez de
  improvável; cada origem sai como uma fita contínua e, na troca de posto, quem ultrapassa
  atravessa inteira em direção à base enquanto a ultrapassada se abre em duas lâminas que somam a
  espessura dela e se fecham do outro lado; o separador da COR-5 é traço aberto sobre a fronteira,
  sem borda vertical, e o eixo de mês é HTML fora do `viewBox` escalado, não `<text>` do SVG.
- **`v4_criativos-de-vida-curta`**: quatro criativos entram e saem do ar em janelas próprias
  (lançamento, evergreen, relançamento, fechamento), com 0 verdadeiro fora da janela, nunca lacuna;
  mais "Outras (n=5)" para os criativos abaixo de 3% de participação no total do período, corte
  escrito no rodapé; animação desligada em toda `Area`, prática que sustenta muitas camadas na
  mesma tela mesmo nesta demonstração reduzida.

Previews de cada versão: `v1_leads-por-campanha-no-ano/preview.svg`,
`v2_picos-sazonais-com-destaque/preview.svg`, `v3_origens-ordenadas-por-tamanho/preview.svg` e
`v4_criativos-de-vida-curta/preview.svg` (e o par `preview-claro.svg` de cada uma).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue `data` à consulta real da página.
2. Mantenha `stackOffset="silhouette"` e `<YAxis hide />`: removê-lo, em vez de escondê-lo, quebra o
   cálculo do deslocamento.
3. A ordem das camadas é recalculada do `data` recebido a cada render; não fixe a ordem por índice
   de array, porque a cor é por chave (COR-3) e a posição pode mudar quando o recorte muda.
4. Em `v3` (SVG puro), o `viewBox` é fixo e a página escala por CSS; não leia `window.innerWidth`
   para decidir a geometria.
5. A nota de honestidade da forma ("sem eixo numérico...") é texto do próprio Chart e vai junto para
   o Farol; não é aviso de protótipo do `VisualCard` (ANO-6) e não deve ser removida ao colar.

## Referências

- [Lee Byron, Stacked Graphs: Geometry and Aesthetics](https://leebyron.com/streamgraph/)
- [Wikipedia, Streamgraph](https://en.wikipedia.org/wiki/Streamgraph)
- [Data Viz Catalogue, Stream Graph](https://datavizcatalogue.com/methods/stream_graph.html)
- [From Data to Viz, Streamgraph](https://www.data-to-viz.com/graph/streamgraph.html)
- [Vega-Lite, Streamgraph](https://vega.github.io/vega-lite/examples/stacked_area_stream.html)
- [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/)
- [nivo, Stream](https://nivo.rocks/stream/)
- [Highcharts, Streamgraph](https://www.highcharts.com/demo/highcharts/streamgraph)
- [RAWGraphs, How to make a streamgraph](https://www.rawgraphs.io/learning/how-to-make-a-streamgraph)
- [Storytelling with Data, what is an area graph](https://www.storytellingwithdata.com/blog/2020/4/9/what-is-an-area-graph)
- [Data Viz Project, Sorted Stream Graph](https://datavizproject.com/data-type/sorted-stream-graph/) (não abriu)

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; `v3` reprovada, as demais aprovadas._

- `v1`: o catálogo pede rótulo do total do ano dentro das camadas maiores; a versão levou o total
  para a legenda e o `meta.json` registrou a troca. A leitura não se perde, mas a divergência entre
  catálogo e versão continua aberta.
- `v1`, `v2` e `v4`: o primeiro tique mensal (jan/26) não aparece no eixo, que começa em fev/26; o
  início do período fica implícito.
- `v1`, `v3` e `v4`: no tema escuro a camada "Outras" em `--line-strong` quase se confunde com o
  fundo do cartão; vale pela isenção do valor escrito na legenda, mas a faixa lê como vão.
- `v2`: as quatro campanhas de contexto dividem o mesmo neutro, então a legenda nomeia cinco séries
  que a figura estática só distingue em uma, a do destaque; quem precisa do nome depende da dica.
- `v2` e `v4`: a frase acessível fica a 15 e a 12 caracteres do teto de 250 da ACE-1 (aviso do
  check); recorte maior estoura o limite.
- `v4`: o rótulo da camada agregada é "Outras" enquanto o `meta.json` e o catálogo escrevem "Outros".
- `v4`: o corte de 3% é constante declarada em `data.ts`, não recalculado do dado; trocar o recorte
  não move o texto do rodapé.

### Correção de 2026-09-18 (segunda passada, só `v3`)

- Reescrita a construção da pilha: em vez de interpolar o topo e a base de cada camada
  independentemente, a pilha inteira passou a ser recalculada com uma única ordem de cada vez; na
  troca de ordem entre dois meses, um par de colunas no mesmo x (a ordem que sai e a que entra, no
  valor médio dos dois meses) fecha a fronteira dos dois lados sem vão nem sobreposição (o vão de
  até 70 px em jan/26 e abr/26 e o cruzamento de faixas em Q1 e Q2 da revisão anterior).
- O eixo de mês saiu do `<text>` do SVG (achatado a cerca de 7 px pelo `preserveAspectRatio="none"`)
  para uma linha HTML própria fora do `viewBox` escalado, que não sofre a distorção.
- Corrigido o comentário do topo do `Chart.tsx`, que dizia empate de 54 em 2026-06 e apontava
  2026-05 na regra de desempate; o `data.ts` sempre trouxe 53 e 53 em 2026-06.
- Acrescentado `vectorEffect="non-scaling-stroke"` no separador entre camadas (CONTRATO.md, seção
  5), que antes engordava de forma desigual entre os eixos por causa do `preserveAspectRatio="none"`.

### Pendências conhecidas (`v3`)

- Nenhuma das três pendências bloqueantes desta rodada ficou em aberto.
- A camada "Outras" em `--line-strong` no tema escuro segue próxima do fundo do cartão (observação
  já registrada acima para `v1`, `v3` e `v4`); não bloqueante e fora do escopo desta rodada.

### Segunda revisão independente, 2026-09-18 (`v3` reprovada de novo; `v1`, `v2` e `v4` aprovadas)

- `v3`, bloqueante: a reescrita fechou os vãos e os cruzamentos, mas trocou o defeito por um corte
  reto no meio do intervalo. Cada troca de ordem acontece num `x` único, então as camadas não se
  ligam entre períodos como o catálogo pede e a mudança de ordem, que é a história da versão, não
  se lê como movimento; a leitura fica de mosaico, com a mesma cor em duas faixas por corte.
- `v3`: a ordem de pintura é a do último mês, e não a ordem de destino de cada troca, como o
  catálogo descreve; sem efeito visível enquanto as camadas ladrilham, mas a descrição não bate.
- `v1`, `v2` e `v4`: as quatro versões identificam as camadas só pela legenda; nenhuma escreve o
  nome dentro das camadas maiores, que é o que dispensaria casar cor a cada leitura.
- `v2`: a anotação imprime "pico 2 · 187" sem o substantivo do que é contado; a NUM-6 pede a
  unidade em todo lugar em que o número aparece, inclusive na anotação.
- `v2`: o dado dá volume semanal à campanha "Webinar de setembro" o ano inteiro, o que o nome não
  sugere; é plausível como campanha contínua, mas o nome e a série contam coisas diferentes.
- `v1`, `v3` e `v4`: o total na legenda sai em 12 px, enquanto a tabela 17.1 reserva 14 px para
  número de apoio em legenda.
- `v1` a `v4`: as chaves do dado estão em português (`buscaPaga`, `creativoLancamento`), e a seção
  9 do contrato pede identificador em inglês; em `v4`, "creativo" ainda é grafia errada de criativo.
- `v4`: a animação é desligada por `isAnimationActive={false}` fixo, não por `useAnimateOnce`;
  decisão declarada no cabeçalho do arquivo e coerente com o caso de muitas camadas.

### Correção de 2026-09-18 (terceira passada, só `v3`)

- Trocado o desenho por colunas duplicadas (mesma ordem de um lado, ordem nova do outro, no mesmo
  x) por uma pilha reamostrada: entre cada par de meses reais entram 16 quadros internos com o valor
  de cada origem interpolado linearmente, e a ordem é recalculada a cada quadro pelo próprio valor
  daquele quadro, não pelo valor do mês. A troca de ordem entre duas origens passa a acontecer no
  quadro exato em que os dois valores interpolados se cruzam, então a fronteira entre elas nasce
  colada na origem que estava por baixo e termina colada na que passa a estar, sem vão nem
  sobreposição; o corte vertical num x único que a segunda revisão reprovou foi substituído por duas
  camadas se cruzando ao longo do eixo do tempo, que é a leitura de movimento que o catálogo pede.
- A ordem de pintura passou a vir do último quadro (não do último mês), mas na prática coincide com
  ele; como a pilha agora ladrilha em todo quadro por construção, a ordem de pintura deixou de ser a
  peça que evita vão, que era a lacuna apontada na revisão anterior.
- `meta.json` e a descrição da versão acima foram reescritos para descrever o mecanismo novo.

### Terceira revisão independente, 2026-09-18 (`v3` reprovada de novo; `v1`, `v2` e `v4` aprovadas)

- `v3`, bloqueante: a reamostragem em 16 quadros não resolveu a troca de ordem. Medido no PNG
  escuro, na coluna x=1120 (entre abr/26 e mai/26) a faixa tem três buracos de fundo do cartão de
  15 px cada dentro da pilha, e entre x=1115 e x=1130 as camadas ciano e oliva trocam de lugar num
  degrau de cerca de 5 px; o resultado lê como mosaico de blocos, não como camadas se cruzando.
- `v3`, bloqueante: a ordem "de dentro para fora" é recalculada por posto a cada quadro, então
  duas origens que trocam de posto vizinho saltam para pontas opostas da pilha; é essa regra, e não
  a densidade de quadros, que produz o corte reto, e ela precisa mudar antes de nova rodada.
- `v3`: o comentário do topo do `Chart.tsx` afirma que a fronteira "nunca abre vão nem salta", o
  que o PNG desmente; texto de código e desenho contam coisas diferentes.
- `v1`: o catálogo pede o total do ano escrito dentro das camadas maiores; a versão levou o total
  para a legenda e declarou a troca no `meta.json`, mas a divergência com o catálogo segue aberta.
- `v1`, `v2` e `v4`: o primeiro tique mensal não aparece, e o eixo começa em fev/26; o início do
  período fica implícito nas três.
- `v1`, `v2` e `v4`: a legenda lista as camadas de baixo para cima, e a ROT-4 pede a ordem visual
  da pilha lida de cima para baixo.
- `v2`: as quatro séries de contexto dividem o mesmo neutro, então a legenda nomeia cinco camadas
  que a figura estática distingue em uma só, a do destaque.
- `v2`: a anotação "pico 2 · 187" não traz o substantivo do que é contado, que a NUM-6 pede; o
  número em `font-sans` também fica sem `tabular-nums` (TIP-1).
- `v1`, `v3` e `v4`: no tema escuro a camada neutra "Outras" quase se confunde com o fundo do
  cartão; vale pela isenção do valor escrito na legenda, mas a faixa lê como vão.
- `v4`: o rótulo da camada agregada é "Outras" enquanto o catálogo e o `meta.json` escrevem
  "Outros".
- Ferramenta: `npm run revisao` grava a nota certa em UTF-8, mas o terminal do Windows mostra os
  acentos trocados na conferência; ler o JSON de `.qa/revisao/` antes de concluir que a nota saiu
  errada.

### Correção de 2026-09-18 (quarta passada, só `v3`)

- Trocada a regra de ordem, a causa raiz apontada na terceira revisão: em vez de recalculada por
  posto a cada quadro com as pontas alternadas (maior ao centro, 2º e 3º postos nas pontas
  opostas), a ordem agora só existe nos 24 meses reais e é por posto simples, maior sempre na
  mesma ponta da pilha, a base, sem alternar lados. Um posto vizinho na classificação passa a ser
  sempre um posto vizinho na pilha: a troca de "maior sempre ao centro" por "maior sempre na base"
  segue a versão 1 sugerida pelo próprio catálogo para este modelo (`_estudo/familias/05_areas.md`,
  seção 3.5, "com o maior motivo sempre na base"); `useCase` e `meta.json` foram reescritos.
- Trocada a geometria, não só a regra: uma pilha ÚNICA por quadro não tem como mostrar troca de
  posto sem salto, porque a soma cumulativa não tem meio termo entre "está antes" e "está depois"
  de um vizinho; trocar a ordem de dois vizinhos sempre move cada um pela largura inteira do valor
  do outro, em um quadro só, por mais quadros que existam (medido: reamostrar em 48 quadros em vez
  de 16 não mudou o tamanho do salto, só o comprimiu). O desenho passou a ser, como a seção 3.5 do
  catálogo pede, um path fechado por origem e por PAR de meses reais (`ribbonPath`), ligando a
  posição de saída à de chegada com curva cúbica; a ordem de pintura de cada trecho segue a ordem
  de CHEGADA daquele par (não uma ordem única do gráfico inteiro), que é o que garante que a fita
  vencedora cubra a que está saindo sem abrir vão, também como a seção 3.5 descreve. Os quadros
  internos e o parâmetro `ORDER_SAMPLES` saíram do código.
- Comentário do topo do `Chart.tsx` reescrito para descrever o mecanismo novo sem prometer o que o
  desenho não cumpre (item já observado na terceira revisão).

### Pendências conhecidas (`v3`, após a quarta passada)

- Nenhum dos quatro problemas bloqueantes da terceira revisão ficou em aberto nesta passada.
- A camada "Outras" em `--line-strong` no tema escuro segue próxima do fundo do cartão (mesma
  observação de `v1` e `v4`, acima); não bloqueante, fora do escopo desta rodada.
- Total na legenda em 12 px contra os 14 px da tabela 17.1 (mesma observação de `v1` e `v4`,
  acima); não corrigido nesta rodada para não alterar peça compartilhada com versões aprovadas.
- COLISAO-TEXTO não mede esta versão porque o eixo de mês é HTML fora do SVG (observação já
  registrada); sem alternativa dentro do modelo, já que `<text>` do SVG achataria sob
  `preserveAspectRatio="none"`.

### Observações não bloqueantes confirmadas em 2026-09-18 (decisão do dono da marca)

Revistas nesta rodada e mantidas como estão, sem reescrever `v2` nem `v4` (aprovadas):

- `v2`: o neutro compartilhado pelas quatro camadas de contexto (já registrado acima) e a frase
  acessível de 235 caracteres (a 15 do teto de 250 da ACE-1, já registrado acima em caracteres
  relativos).
- `v4`: a frase acessível de 238 caracteres (a 12 do teto de 250, já registrado acima em
  caracteres relativos) e o par de rótulos "Outras" contra "Outros" (já registrado acima).

### Quarta revisão independente, 2026-09-18 (`v3` reprovada; `v1`, `v2` e `v4` aprovadas)

Bloqueante de `v3` no parecer registrado; abaixo, só o que não reprova.

- `v3`: o caso de uso do catálogo ainda diz "com a maior sempre ao centro" e a versão passou a
  usar "maior sempre na base". O estudo da família (seção 3.5) admite base ou centro, e a quarta
  passada declarou a troca no `meta.json`, mas a entrada do catálogo segue divergente da versão.
- `v3`: cada fita é um path fechado por par de meses, então o contorno também pinta as bordas
  verticais; o resultado é uma grade de traços verticais a cada mês dentro da faixa, leitura de
  ladrilho que a forma orgânica não pede.
- `v3`: o comentário do topo do `Chart.tsx` afirma que a ordem de pintura pela chegada "garante que
  a fita vencedora cubra a que está saindo sem abrir vão"; os PNGs dos dois temas mostram o
  contrário, então o texto do código promete o que o desenho não cumpre.
- `v1`, `v2` e `v4`: o primeiro tique mensal continua ausente e o eixo começa em fev/26; o início
  do período fica implícito (observação já registrada em rodadas anteriores, confirmada aqui).
- `v1`: o total do ano vive na legenda e não dentro das camadas maiores, como o catálogo pede; a
  troca está declarada no `meta.json` e a leitura não se perde, mas a divergência segue aberta.
- `v2`: a anotação imprime "pico 1 · 101" e "pico 2 · 187" sem o substantivo do que é contado, que
  a NUM-6 pede em todo lugar em que o número aparece.
- `v2`: as quatro camadas de contexto dividem o mesmo neutro, então a legenda nomeia cinco séries
  que a figura estática distingue em uma só; é o que o catálogo pede para esta versão, e o nome de
  cada camada de contexto depende da dica.
- `v1`, `v3` e `v4`: no tema escuro a camada neutra "Outras" segue próxima do fundo do cartão; o
  valor escrito na legenda compensa, mas a faixa lê como vão.
- `v4`: as chaves do dado grafam "creativo" onde o português é criativo, e o rótulo da camada
  agregada é "Outras" enquanto o catálogo escreve "Outros".
- Ferramenta: `npm run check` acusa `COLISAO-TEXTO` não medida em `v3` porque o eixo de mês é HTML
  fora do SVG; a verificação de transbordo, então, não cobre o único texto de eixo desta versão.

### Correção de 2026-09-18 (quinta passada, só `v3`)

- **Causa da fresta, nomeada:** cada camada vinha sendo desenhada como polígono próprio, com a borda
  de cima e a de baixo interpoladas por conta própria. Numa pilha isso é impossível de fechar: a
  borda de cima de uma camada é a de baixo da vizinha, e duas contas equivalentes divergem na troca
  de ordem. Com as fitas se cruzando, a conta mostra o tamanho do buraco: no meio do intervalo a
  camada que sobe está a `b/2` da base da janela e a que desce a `a/2`, então sobra vão de
  `min(a, b)/2` embaixo e outro tanto em cima. Era o que a revisão mediu como 12 a 15 vãos de 400 px
  ou mais, o maior de 73 por 63 px.
- **O que mudou na geometria:** a pilha inteira passou a sair de uma lista de fronteiras por trecho,
  calculada uma vez do deslocamento da silhueta para cima. Cada faixa consome o mesmo objeto da
  vizinha, com o par de números já arredondado em texto e os mesmos pontos de controle, então a
  borda compartilhada sai no SVG com coordenada idêntica, percorrida em sentidos opostos. Medido no
  `preview.svg` dos dois temas: 146 pares de fronteira por tema, **maior diferença de borda 0,00 px**.
- **A travessia, decidida e declarada:** uma pilha opaca não troca duas vizinhas de posição mantendo
  as duas inteiras e ladrilhando a faixa (cobrir a janela das duas com espessura igual ao valor exige
  uma colada na base e a outra no topo, o que só vale nas pontas do movimento). Em vez de vão ou de
  corte, a troca virou travessia: quem ultrapassa atravessa inteira em direção à base e a ultrapassada
  se abre em duas lâminas que somam exatamente a espessura dela naquele ponto. As duas seguem com cor
  fixa e espessura igual ao valor interpolado em qualquer `x`, e a travessia ocupa o par de meses
  inteiro, então se lê como movimento. Está escrito no `meta.json` e no `useCase`, sem prometer o
  cruzamento sem fresta que a forma não entrega.
- **Grade de traços verticais a cada mês, resolvida:** era o path fechado por par de meses, apontado
  na quarta revisão, mais a emenda de duas faixas vizinhas no mesmo `x`. Agora cada origem é **uma
  fita contínua** (quinze no total: sete origens mais oito travessias) e o separador da COR-5 é traço
  aberto encadeado sobre a fronteira, sem borda vertical nenhuma.
- **Medição de pixel, nos dois temas:** dentro da janela do gráfico, com o envelope de cada coluna
  definido pela cor das camadas, a **maior corrida vertical de cor de fundo do cartão é de 6 px de
  dispositivo no escuro e 5 no claro**, ou seja 3 px e 2,5 px de CSS, que é o traço de 1,5 px do
  separador da COR-5 medido na diagonal. Nenhuma abertura vertical maior que isso em lugar nenhum.
- **Dado refeito** para a troca de ordem virar história legível: oito trocas em 24 meses, cada uma
  num par de meses diferente, com busca paga saindo do 7º posto e chegando ao 1º, e dois empates de
  valor (2025-07 e 2026-06) que exercitam a regra de desempate pelo mês anterior. As chaves do dado
  passaram para o inglês (seção 9 do contrato), observação aberta desde a terceira revisão.
- **Duas observações não bloqueantes das rodadas anteriores fechadas nesta versão:** o total na
  legenda subiu para 14 px (tabela 17.1) e a legenda passou a listar as camadas na ordem visual da
  pilha do último mês, lida de cima para baixo (ROT-4).
- **Segue aberto, e declarado:** o caso de uso do catálogo pede a maior ao centro e esta versão usa a
  maior na base, porque com as pontas alternadas um posto vizinho na classificação cai na ponta
  oposta da pilha e a troca deixa de ser movimento curto; e a camada neutra "Outras" no tema escuro
  continua próxima do fundo do cartão, observação que `v1` e `v4` também carregam.

### Quinta revisão independente, 2026-09-18 (as quatro versões aprovadas)

Nenhum bloqueante nesta rodada. `v3` foi medida no PNG e a geometria se sustenta: dentro do
envelope da pilha, a maior corrida vertical de fundo do cartão é de 5 px de dispositivo, ou seja
2,5 px de CSS, que é o traço de 1,5 px do separador da COR-5 visto na diagonal; a espessura de cada
camada acompanha o valor interpolado, com desvio só nas camadas finas, onde o separador come tinta
dos dois lados. O que segue abaixo não reprova.

- `v3`: a travessia divide a camada ultrapassada em duas lâminas da mesma cor em 8 trechos do
  desenho, cerca de 21% das colunas; cada trecho tapera até zero nas duas pontas e está declarado no
  `meta.json`, mas quem olha um trecho isolado vê duas faixas onde existe uma origem.
- `v3`: o caso de uso do catálogo pede a maior ao centro e a versão usa a maior na base; a troca
  está declarada no `meta.json` e o estudo da família admite as duas, mas o catálogo segue
  divergente da versão.
- `v3`: a versão não tem dica, então o item 7 da Anatomia acima ("Dica com o valor exato de cada
  camada") não vale para ela; a nota do corpo e a legenda, que é onde o valor mora, dizem isso.
- `v3`: `COLISAO-TEXTO` não mede esta versão porque o eixo de mês é HTML fora do SVG, então a
  guarda de transbordo não cobre o único texto de eixo da peça.
- `v1`: o catálogo pede o total do ano escrito dentro das camadas maiores e a versão levou o total
  para a legenda; a troca está declarada no `meta.json` e a leitura não se perde, mas a divergência
  segue aberta desde a primeira rodada.
- `v1`, `v2` e `v4`: o eixo começa em fev/26 e o primeiro tique mensal não aparece; o início do
  período fica implícito.
- `v1`, `v2` e `v4`: a legenda lista as camadas de baixo para cima, e a ROT-4 pede a ordem visual da
  pilha lida de cima para baixo; `v3` já corrigiu isso e as três seguem como estavam.
- `v2`: a anotação imprime "pico 1 · 101" e "pico 2 · 187" sem o substantivo do que é contado, que a
  NUM-6 pede em todo lugar em que o número aparece.
- `v1`, `v3` e `v4`: no tema escuro a camada neutra "Outras" fica próxima do fundo do cartão; o
  valor escrito na legenda cobre a isenção, mas a faixa lê como vão.
- `v1`, `v2` e `v4`: as chaves do dado estão em português (`buscaPaga`, `outrasCount`,
  `creativoLancamento`) e a seção 9 do contrato pede identificador em inglês; em `v4`, "creativo"
  ainda é grafia errada de criativo. `v3` já passou as chaves para o inglês.
- `v4`: o rótulo da camada agregada é "Outras" enquanto o catálogo escreve "Outros", e o corte de 3%
  é constante declarada em `data.ts`, não recalculado do dado.
