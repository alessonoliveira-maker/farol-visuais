# Strip plot e beeswarm

## O que é

Cada observação vira um ponto numa escala só, com uma faixa por grupo. Mostra o valor exato de cada
caso e os buracos entre eles, que o histograma apaga, e perde para o histograma na leitura da forma.

A diferença entre as geometrias da família é o que acontece quando dois pontos coincidem. No strip
eles se sobrepõem. No wheat plot o segundo sobe um nível dentro do intervalo, e a pilha inclina
porque o eixo horizontal continua sendo o valor exato. No beeswarm ele se desloca lateralmente por um
algoritmo guloso, o que preserva a posição no eixo de valor e troca a sobreposição por largura. No
barcode nada disso cabe, e a coincidência precisa virar altura. Jitter é a quinta via, e a pior de
todas quando a semente não é fixa: ruído aleatório muda a cada render e deforma a leitura.

Em nenhuma das quatro a segunda dimensão é grandeza. Nível de pilha, desvio lateral e largura de
traço existem para resolver sobreposição, e é por isso que todas as versões daqui escrevem de onde
vem a segunda dimensão em vez de deixar o leitor deduzir.

## Quando usar

- Poucas dezenas a poucas centenas de casos por grupo, quando cada caso importa e pode abrir drill.
- Amostra pequena demais para violino ou densidade: abaixo de 30 casos a curva inventa forma.
- Mostrar a posição de cada caso sem sobrepor, em beeswarm, enquanto a nuvem couber na altura.
- Apontar um vão de valores sem nenhum caso, que é o que o wheat plot faz melhor que qualquer outra
  forma da família: a faixa vazia fica dentro de uma coluna do histograma e some.
- Forma crua em altura de uma linha, como barcode sob um KPI ou rug sob uma densidade.

## Quando evitar

- Milhares de pontos numa faixa estreita: faixa de densidade em cor ou KDE (modelo 06).
- Métrica discreta com poucos valores, como tentativas de 1 a 12: dot plot empilhado (09).
- Leitura de valor exato no beeswarm: o deslocamento lateral cobre uma faixa de valores.
- Quartis e mediana como mensagem principal: box plot com os pontos por cima (02).
- Valor lançado arredondado com dezenas de casos por valor: o barcode satura, e quem responde é o
  histograma (01). A v4 mede esse limite em vez de fingir que ele não existe.
- Ponto valendo várias unidades, com a contagem como mensagem: família 22, de unidades e waffle.

## Anatomia

1. **Eixo de valor contínuo** com a unidade formatada por `@/lib/format`, e teto arredondado na
   primeira linha de grade acima do maior caso (EIX-4). Moeda por `formatCurrencyAxis`, dias por
   `formatDays`, contagem por `formatInt`.
2. **Uma faixa por grupo** quando há grupos, ordenada por uma métrica declarada no rodapé, com nome e
   `n` na mesma linha. Ordem que o leitor não reconhece sozinho precisa de frase (GEO-12).
3. **Ponto opaco com contorno na cor da superfície**, nunca opacidade: o contorno separa dois pontos
   colados sem compor a marca com o cartão. Medido nesta família, `--chart-1` com `fillOpacity` de
   0,45 mede 2,97:1 no tema escuro e 2,04:1 no claro, abaixo do piso de 3:1 da ACE-5; opaco ele mede
   9,50:1 e 6,00:1.
4. **Segunda dimensão declarada**: nível de pilha no wheat plot, desvio lateral no beeswarm, altura no
   barcode saturado, onde uma faixa de tapete de altura uniforme sob o zero mantém a presença de todo
   valor e a seleção fica nela, não na altura que conta. Sempre com uma linha dizendo de onde ela vem, porque nenhuma delas é grandeza.
5. **Traço curto de mediana**, nunca uma caixa, que competiria com os pontos pelo mesmo espaço. Em
   nuvem densa (beeswarm) ele fica fora dela, em dois traços laterais com o valor escrito ao lado: a
   mediana cai por construção na linha mais densa, e um traço por cima parte os pontos (ROT-7, COR-5).
6. **Limiar operacional ou vão anotado** com o rótulo fora da área de plotagem (REC-4), e a contagem
   do lado errado, ou o motivo do vão, escrita no rodapé.
7. **Nome do caso**, no ponto extremo ou na campanha selecionada, que é o que transforma a nuvem em
   fila de trabalho. Quando o nome não cabe no desenho, ele vai para o rodapé, nunca para uma promessa
   de comentário (DAD-10).
8. **Segundo canal além da cor** em toda peça com mais de uma marca: forma, altura ou rótulo. Medido,
   par de marca contra marca da paleta categórica fica entre 1,03:1 e 1,47:1, e isso é luminância
   pareada de propósito, não defeito (TOK-9).

## Versões

- `v1_cpl-das-campanhas-por-plataforma`: strip plot de 114 campanhas do trimestre em quatro tipos de
  mídia, com a mediana indo de R$ 86 em busca paga a R$ 174 em vídeo, 35 campanhas acima da meta de
  R$ 150 e 7 campanhas sem nenhum lead fora da faixa, porque CPL com denominador zero não é zero nem
  infinito.
- `v2_wheat-plot-com-buraco-anotado`: 46 oportunidades do mês pelo dia exato da primeira reunião, com
  a altura dada pela ordem dentro do intervalo de 5 dias, desempate por id para o desenho não mudar
  entre renders, e o vão de 13 a 14 dias medido do dado e marcado com `ReferenceArea`.
- `v3_beeswarm-de-ticket-por-trimestre`: 312 negócios ganhos em quatro trimestres, com dodge guloso em
  TypeScript, janela deslizante na busca de vizinhos, raio de 3 px com piso de 2 px, e a mediana
  em dois traços laterais fora da nuvem, com o valor escrito, subindo de R$ 37,0 mil no 1º tri a
  R$ 51,0 mil no 4º tri.
- `v4_barcode-com-valores-repetidos`: 1.100 campanhas em 34 valores múltiplos de R$ 10, um traço por
  valor em meio pixel, e a troca da altura uniforme para altura por contagem quando a coincidência
  passa de 8 casos no mesmo valor, com um tapete de traços uniformes sob o zero que mantém visível todo
  valor com caso, a seleção marcada nele e uma guia tracejada no plano de contagem.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. **v1.** O eixo de categoria é tipo de mídia, não plataforma: o recorte por fornecedor não sobrevive
   à troca de fornecedor. A ordenação é decrescente por mediana de propósito, porque o eixo de
   categoria do Recharts empilha de baixo para cima (REC-3).
3. **v2.** `BIN_WIDTH` é o intervalo de empilhamento e muda a inclinação da pilha, não a posição do
   ponto. `GAP_REASON` é o único texto declarado da peça: o vão sai do dado, o motivo não se calcula
   de prazo nenhum e precisa vir de quem conhece o mês.
4. **v3.** O dodge roda dentro do gráfico, com `usePlotArea`, `useXAxisScale` e `useYAxisScale`. Não
   troque isso por `ResizeObserver` nem por `window.innerWidth`: os hooks já recalculam a cada mudança
   de largura, e a seção 5 do contrato proíbe ler a janela. `highlightId` é o alvo do drill; ligue o
   clique no mesmo `<circle>` que a camada desenha.
5. **v4.** `COINCIDENCE_LIMIT` é a régua de leitura, não do dado: abaixo dela o traço tem altura
   uniforme e a peça é um barcode; acima dela a altura passa a contar quantas campanhas dividem o
   valor, e o rodapé escreve o aviso. `SELECTED` é o estado inicial do drill.
6. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
7. O estado vazio inline de cada versão dá lugar a `EmptyState`, mantendo o sentido do texto.
8. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Pendências conhecidas

- **`allowDuplicatedCategory` precisa estar desligado no eixo de categoria** (v1). Ligado, cada ponto
  do `Scatter` abre uma banda nova, as quatro faixas viram cento e catorze linhas invisíveis, e pontos
  e rótulos descolam. O sintoma é de desalinhamento, não de erro, então passa batido na revisão.
- **O `ZAxis` está ali para travar o raio** (v1 e v2). Sem ele o Recharts passa a variar o tamanho do
  ponto, e tamanho nestas peças não carrega informação nenhuma (REC-15).
- **v1, EST-1 e DAD-10: resolvidos em 2026-10-15**, na segunda rodada de correção autorizada pelo dono
  (eram os dois bloqueantes da revisão de 2026-10-05). Com `data` vazio a versão devolve o bloco
  `role="status"` com `Filter`, e a campanha de maior CPL é nomeada no rodapé e na frase acessível, com o
  `meta.json` alinhado; aprovada na revisão de 2026-10-15. O que ficou dessa correção está nas observações
  da revisão abaixo (rodapé de cinco linhas, empates exatos, dica do catálogo não implementada).
- **v3 não mede `CONTRASTE-MARCA` nem `ESPESSURA-MARCA`.** A nuvem é desenhada à mão, fora de um
  `<Bar>`, e o tique do eixo Y é um `<text>` próprio. Os números do par marca contra cartão estão
  medidos à mão no `notes` do `meta.json`.
- **v4 publica o lado saturado do limite.** O dado chega a 113 campanhas no mesmo valor, então o
  preview mostra a altura por contagem. O ramo de altura uniforme é o que desenha em recorte abaixo de
  8 coincidências, e ele não aparece no PNG; isso está declarado aqui de propósito, para ninguém ler o
  comentário do topo como promessa de desenho (DAD-10).
- Com mais de umas 150 campanhas por faixa no strip simples a pilha satura e a sobreposição para de
  informar. A saída é o beeswarm da v3 ou a troca para densidade, não um ponto menor.
- v3: `highlightId` só destaca o ponto; não há `onClick` nem dica. O drill por ponto é desta peça a ligar
  no app (DAD-10). Na v1 nem isso existe (ver acima).

## Defeitos encontrados no vizinho, ao produzir as versões 2, 3 e 4

Registro de observação, na forma que a seção 14.1 do contrato pede. Nada aqui foi corrigido nesta
leva, porque o escopo de escrita era esta pasta.

- **`16_distribuicao/01_histograma` desenha grade num sentido só, nas quatro versões**, em
  `v1_ciclo-de-fechamento/Chart.tsx` linha 180, `v2_media-contra-mediana/Chart.tsx` linha 451,
  `v3_ciclo-por-executivo-em-pequenos-multiplos/Chart.tsx` linha 330 e
  `v4_receita-com-massa-no-zero/Chart.tsx` linha 341, todas com
  `<CartesianGrid stroke={GRID_COLOR} vertical={false} />`. A `EIX-3b` do `CONTRATO.md`, linha 528 e
  seguintes, nomeia o histograma de forma literal como o caso em que a exceção vale: "a família 16
  mistura as duas geometrias e prova o ponto: o strip plot e o box plot têm `<YAxis type="category">`,
  então neles vale a regra original e a grade transversal só suja; já o histograma e a ECDF têm as duas
  grandezas". Pela régua do contrato, ali a grade nos dois sentidos é obrigatória e não proibida. A
  regra vence o vizinho, e é por isso que a v4 desta pasta desenha os dois sentidos enquanto a v2 e a
  v3, que têm um eixo que não mede nada, desenham um sentido só.
- **`16_distribuicao/01_histograma/v1_ciclo-de-fechamento` não desliga a linha de eixo** com grade no
  fundo, em `Chart.tsx` linhas 181 a 190: os dois eixos espalham `AXIS_PROPS`, que traz
  `axisLine: { stroke: GRID_COLOR }` ligado, e nenhum dos dois sobrepõe. É a `EIX-5` mais a `REC-30`, e
  é o passivo que a guarda `EIXO-CALMO` já contabiliza em 20 peças.

## Referências

- Catálogo: [From Data to Viz, strip plot e jitter](https://www.data-to-viz.com/caveat/overplotting.html): observar as saídas para sobreposição e o limite de cada uma.
- Catálogo: [Observable Plot, dodge transform](https://observablehq.com/plot/transforms/dodge): observar que o dodge preserva a posição de entrada e que o algoritmo é guloso, com padding de 1 px somado ao raio.
- Praticante: [Claus Wilke, Fundamentals of Data Visualization, visualizing distributions](https://clauswilke.com/dataviz/histograms-density-plots.html): observar strip chart como saída para conjunto esparso demais para violino.
- Praticante: [Leland Wilkinson, Dot Plots, The American Statistician 53(3)](https://www.cs.uic.edu/~wilkinson/Publications/dotplots.pdf): observar a regra de empilhamento por intervalo que o wheat plot usa, e por que a largura do intervalo é escolha de leitura.
- Portal de design: [SetProduct, distribution chart patterns](https://setproduct.com/charts/patterns/distribution): observar o tratamento de ponto e faixa em tema claro e escuro.

## Correção de 2026-09-28

**v1, a faixa sem campanha ganhava mediana zero.** `median` devolvia `0` para lista vazia, então um
tipo de mídia sem nenhuma campanha no recorte recebia o traço da mediana colado na origem do eixo e
entrava na ordenação como a faixa mais barata de todas, que é a conclusão oposta à verdadeira: não
havia nada para medir. Custo por lead de R$ 0 é um valor plausível, e era isso que o desenho
afirmava.

O que mudou: `median` devolve `number | null`; a faixa sem mediana sai da ordenação por valor e vai
para o começo do array, que é o rodapé da grade e o último lugar na leitura de cima para baixo
(17.2, ausência por último); o traço só é desenhado para as faixas medidas; e um rodapé em
`--text-muted` escreve "mediana indisponível em <faixas>: sem campanha no recorte", que entra também
na frase acessível. Os extremos citados na frase, a faixa mais barata e a mais cara, passaram a sair
só das faixas medidas.

**Conserto de caminho latente:** as quatro faixas publicadas têm campanha, então nada disso é
renderizado e o desenho não mudou. O que se conserta é o ramo, não a foto.

## Correção de 2026-09-28, segunda rodada

**v1, a ordem das faixas não se apresentava (GEO-12).** As quatro faixas vêm ordenadas por mediana
crescente, de cima para baixo, e nada no cartão dizia isso. Como a mediana de cada faixa aparece só
como traço, e nunca como número, o leitor não tinha de onde deduzir o critério: a lista de tipos de
mídia lia como arbitrária. O rodapé ganhou a frase da ordem, no mesmo formato que
`04_linhas/09_pequenos-multiplos-de-linha/v2` usa, e ela cresce sozinha para declarar que a faixa sem
campanha no recorte fica no fim, quando existir uma.

## Leva de 2026-09-28, terceira rodada: as versões 2, 3 e 4

O modelo fechou as quatro versões planejadas. As três novas nasceram sem opacidade em marca, com
estado vazio próprio, com faixa de eixo X declarada em constante (`EIX-6b`) e com a segunda dimensão
do desenho escrita em texto, porque em nenhuma delas ela é grandeza. As medições que sustentam cada
escolha estão no `notes` do `meta.json` de cada versão, e as duas medições de paleta que valem para a
família inteira estão na Anatomia, itens 3 e 8.

## Correção de 2026-10-05

**v3, a mediana partia os pontos (ROT-7, COR-5).** O traço de 2 px com base de 4 px na cor do cartão caía
na linha mais densa da nuvem e cobria metade ou mais de 35 pontos, sem dar para ler cheio contra anel.
Agora são dois traços laterais que começam além do ponto mais afastado da linha da mediana, com o valor
escrito ao lado (`MedianMark`); a margem direita cresceu para o valor da última faixa caber.

**v4, valores de uma campanha sumiam e a seleção usava o canal que conta.** No ramo saturado o traço de
uma campanha media 0,78 px. Entrou o tapete de altura uniforme logo abaixo do zero (sem piso na contagem),
com a seleção como traço mais longo nele, e no plano de contagem só uma guia tracejada. O rodapé escreve a
faixa de R$ 20 a R$ 460.

## Observações da revisão (não bloqueantes)

**Revisão de 2026-10-05.** Os bloqueantes das versões 1, 3 e 4 estão em
`validation/revisao_16_distribuicao__03_strip-plot-e-beeswarm_2026-10-05.md`. O que segue não reprova.

- v1: a frase acessível do ramo principal começa por "Custo por lead" e não pelo tipo de gráfico (ACE-1).
- v1: o rodapé diz "contorno claro", e no tema escuro o contorno é a cor do cartão, que é escura.
- v1: o rótulo "meta R$ 150" da `ReferenceLine` não leva classe de algarismo tabular (TIP-1).
- v1: o tique do eixo X usa `formatCurrency(value, 0)` no lugar de `formatCurrencyAxis` (EIX-6), sem diferença visível.
- v1: a `ReferenceLine` da meta não declara `ifOverflow="extendDomain"` (ANO-3); o teto do eixo já inclui a meta.
- v1: as notas do `meta.json` não declaram a divergência contra o catálogo, que pede opacidade de 0,45.
- v1: a chave `OPACIDADE-MARCA` desta versão segue na fila de `divida-guardas.json`, e o `check` pede a retirada.
- v2: os limites do intervalo de 5 dias em 5, 15 e 25 não têm marca no desenho; só os de 10 em 10 coincidem com a grade.
- v2: o rótulo "sem reunião" fica no topo sem reserva lateral; se a pilha mais alta encostar no vão, o ponto do topo chega perto dele.
- v2: o comentário da nota de leitura cita a GEO-12, que trata de ordem de faixas e não de altura sem grandeza.
- v3: o tique do eixo Y é um `<text>` próprio sem classe de algarismo tabular (TIP-1).
- v3: o anel de destaque usa `band.cx + point.dx` sem o limite lateral que o ponto usa; igual neste recorte.
- v3 e v1: a pendência "o drill por ponto existe nos componentes" promete mais do que há. Na v3 existe só o `highlightId`, sem `onClick` nem dica; na v1 nada (DAD-10).
- v4: o rótulo "Alvorada institucional, R$ 310" é um `<text>` sem classe de algarismo tabular (TIP-1).
- v4: o rodapé tem dois "34" de coisas diferentes, 34 valores e 34 campanhas sem lead, por coincidência do dado fictício.
- v4: o caso de uso fala em "faixa de poucos pixels" e a peça usa 97 px de plano em 960 por 320; está declarado nas notas.

**Revisão de 2026-10-05, segunda passada (v3 e v4 depois da correção).** As duas foram aprovadas; nada abaixo reprova.

- v3: o rótulo "R$ 37,0 mil" do 1º tri termina a 2,9 px do traço esquerdo da mediana do 2º tri, em alturas diferentes e sem toque; em cartão mais estreito que 960 px os dois se encontram, porque o rótulo não tem reserva contra a faixa vizinha.
- v3: a legenda das verticais e da mediana fica no rodapé, e a ROT-4 pede acima ou ao lado do gráfico; sem consequência de leitura neste preview.
- v3: a pendência "v3 não mede `CONTRASTE-MARCA`" envelheceu; o `check` de hoje mede essa guarda na v3 e só a `ESPESSURA-MARCA` segue fora (`marca_fora_do_bar`).
- v3: a observação anterior sobre o tique do eixo Y sem algarismo tabular está resolvida; o `<text>` leva `tabular-nums`.
- v4: as notas do `meta.json` dizem que sobram cerca de 97 px de plano, e o preview mede 59 px (do zero em y 75 ao topo em y 16), porque o tapete e a terceira linha de rodapé entraram depois; os cinco tiques de contagem seguem legíveis, a 14,75 px um do outro.
- v4: as notas do `meta.json` ainda dizem que a selecionada "é mais alta que todas"; no ramo saturado ela é o traço mais longo do tapete, como o `demonstrates` já diz.
- v4: o rótulo da seleção fica no topo do plano, à esquerda da guia, sem reserva contra traço alto; com a seleção entre R$ 140 e R$ 200 o halo cortaria os traços de 100 a 113 campanhas (GEO-4). Não ocorre com a seleção publicada em R$ 310.
- v4: a seleção usa `--chart-2`, que repete o hex de `--warning` (COR-8), enquanto a tabela 17.2 dá o destaque ao `--chart-1`; o catálogo pede esse token, não há variação semântica no corpo e a seleção tem comprimento e nome como segundo canal.
- v4: a observação anterior sobre o rótulo da seleção sem algarismo tabular está resolvida.

**Revisão de 2026-10-15, segunda passada da v1 (depois da segunda rodada de correção).** Aprovada; os dois bloqueantes de 2026-10-05 (EST-1 e DAD-10) estão resolvidos, e nada abaixo reprova.

- v1: a seção Pendências conhecidas ainda lista o EST-1 e o DAD-10 da v1 como abertos e diz "Na v1 nem isso existe"; as duas entradas envelheceram com esta correção.
- v1: a linha do maior CPL empurrou o rodapé para cinco linhas e o plano caiu de 104 para 84 px de altura (faixas de 26 para 21 px) no canvas `card`. Segue legível, mas é a GEO-14: a frase "um ponto é uma campanha; ..." é a candidata a sair, ou o canvas a crescer (GEO-1).
- v1: 7 das 114 campanhas empatam em valor exato com outra da mesma faixa (Social com três em R$ 75, três em R$ 138 e duas em R$ 69; Busca paga com duas em R$ 88; Vídeo com duas em R$ 162) e viram um ponto só. O rodapé diz que pontos sobrepostos aparecem separados por contorno, o que não vale para empate exato; o `n` de cada faixa conta todas.
- v1: o rodapé ainda diz "contorno claro", e no tema escuro o contorno é a cor do cartão (repete 2026-10-05).
- v1: a frase acessível ainda começa por "Custo por lead" e não pelo tipo de gráfico (ACE-1); mede 230 caracteres, perto do teto de 250.
- v1: o catálogo pede "tooltip com o nome fictício da campanha"; a correção seguiu a saída da DAD-10 (extremo nomeado no rodapé e `meta.json` alinhado), e as notas do `meta.json` não declaram essa divergência, nem a da opacidade de 0,45.
- v1: o item do `demonstrates` "n ao lado do nome da faixa campanha de maior CPL nomeada no rodapé" perdeu a conjunção entre "faixa" e "campanha".
- v1: o comentário do `data.ts` diz que "o ponto sem nome perderia justamente isso", e na tela só o extremo tem nome (DAD-10, lado do comentário).
- v1: o ramo da frase acessível "nenhuma campanha medida" ficou inalcançável depois do retorno antecipado do estado vazio; é código morto.
- v1: `withoutLeads` tem default do fixture (7); quem passa `data` próprio sem a contagem herda "7 campanhas sem nenhum lead" no rodapé.
- v1: a campanha nomeada no rodapé não tem marca no desenho; o leitor a acha pela faixa e pela posição, a 4 px do maior ponto de Social. Cabe como segunda anotação (ANO-1).
- v1: seguem sem mudança as observações de 2026-10-05 sobre `ifOverflow` (ANO-3), `formatCurrencyAxis` (EIX-6) e o rótulo "meta R$ 150" sem algarismo tabular (TIP-1); os tiques do eixo X também saem sem `tabular-nums`, pelo `AXIS_PROPS`.
- v1: os tiques do eixo são os automáticos do Recharts sobre o teto em passo de 50, e a EIX-4 pede `ticks` calculados no componente; neste recorte o teto cai em R$ 400 e os cinco tiques são redondos.
- v1: a amostra da mediana fica no rodapé, e a ROT-4 pede legenda acima ou ao lado do gráfico; sem consequência de leitura neste preview.
