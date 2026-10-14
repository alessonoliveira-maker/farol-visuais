# Nuvem de palavras

## O que é

Termos de um conjunto de respostas abertas, cada um com o tamanho da fonte pelo peso dele, arranjados
de forma compacta. O peso é quantas respostas citam o termo, nunca quantas vezes ele aparece. Lê-se
de relance, pelo assunto: o que é grande é o que mais se repete entre as respostas. Não se lê valor
exato, porque a área de uma palavra depende também do comprimento dela. O modelo tem duas variantes.
A nuvem em espiral é SVG puro com o layout calculado em TypeScript, determinístico e sem rotação. A
nuvem alinhada é HTML com quebra de linha, degraus de tamanho por quantil e cada termo como botão de
filtro.

## Quando usar

- Visão impressionista de 30 a 100 termos, quando a pergunta é o assunto e não o valor exato. No
  canvas `card` cabem cerca de 32 termos entre 12 e 48 px; o resto é contado na nota.
- Exploração rápida antes de escolher o termo que vai para a concordância (modelo 03).
- Destacar os poucos termos que mudaram de um período para o outro, com o resto em tom neutro.
- Termos clicáveis que filtram o painel inteiro, na variante alinhada, com até cerca de 24 termos de
  duas ou três palavras no canvas `largo`.

## Quando evitar

- Ranking ou comparação precisa de valores: use a lista de barras de termos da família 02.
- Comparar dois períodos ou dois grupos termo a termo: use barras divergentes (família 02) ou a
  dispersão de termos (modelo 06). A versão de destaque só responde quem cruzou um corte.
- Menos de 30 respostas ou menos de 15 termos: o tamanho da fonte inventa padrão. Mostre a lista
  ordenada com o aviso de amostra pequena, como faz a `v4_amostra-pequena-e-termo-longo`.
- Tamanho linear no valor ou texto girado: infla os termos longos e piora a leitura. Use raiz
  quadrada e texto horizontal.
- Layout com sorteio ou refeito a cada redimensionamento: a nuvem troca de lugar. Calcule de forma
  determinística e só refaça por ponto de quebra.

## Anatomia

1. **Termo.** Um `<text>` por termo, em Manrope, ancorado no meio. Na espiral simples todos saem em
   `--text-secondary` com peso 600: visual de uma série tem uma cor só (COR-1).
2. **Tamanho pela raiz quadrada.** `MAX_FONT × √(valor ÷ maior)`, com piso em `MIN_FONT`, de 12 a
   48 px. A raiz parte do zero, sem deslocar a escala, porque a área da palavra cresce com o quadrado
   da fonte. Os três tamanhos de corpo da TIP-2 não se aplicam aos termos: aqui o tamanho é o
   encoding, não hierarquia tipográfica.
3. **Caixa medida.** Largura e tinta por `measureText` em Canvas 2D, com cache por peso, tamanho e
   termo, e só depois de `document.fonts.check` confirmar a face (GEO-8). Até lá vale a soma por
   glifo no peso 700, que superestima de propósito. A caixa tem piso de 0,72 em acima e 0,10 em
   abaixo da linha de base, a mesma régua da guarda de colisão.
4. **Espiral arquimediana.** Do maior para o menor, com empate resolvido pelo `id`. Cada termo anda
   em passo de arco constante a partir do centro, numa espiral esticada na proporção do plano, até a
   caixa não tocar em nenhuma outra nem sair do plano. A folga é de 2 px por lado, o que dá 4 px de
   tinta a tinta entre vizinhos. No fim a nuvem é centrada pela caixa do conjunto.
5. **Plano do tamanho do corpo.** O `viewBox` tem a largura e a altura do corpo medido no canvas,
   para a escala do `<svg>` sair 1 e os 12 px declarados chegarem à tela como 12 px (GEO-18).
6. **Descarte contado.** Quem dá a volta inteira sem achar lugar fica fora e entra na nota: quantos
   ficaram e quantas respostas tem o maior deles. O descarte é por encaixe, então um termo longo pode
   ficar fora enquanto um curto de menos respostas entra, e é por isso que a nota diz o maior.
7. **Linha de leitura e nota.** A linha de leitura, em 12 px, nomeia o termo mais citado com a taxa
   e o volume por `formatRateWithVolume`. A nota, em 11 px e `--text-muted`, diz o que o tamanho
   codifica e o que ficou de fora. Contagem sempre com o substantivo, por `formatInt`.
8. **Dica.** O `<title>` nativo do SVG em cada termo, com o que a nuvem não escreve: taxa com
   volume, ocorrências, variação com a base nomeada ou o tamanho que o valor pediria.
9. **Lista equivalente em `sr-only`.** Um `<ol>` com todos os termos na ordem do peso, com o valor
   e a marca de quem ficou fora. A raiz é `role="figure"` com a frase calculada do dado, e o `<svg>`
   é `aria-hidden`. Cada `<li>` também leva `sr-only`: com os itens empilhados em fluxo dentro da
   lista escondida, o render acusa conteúdo fora da área do corpo.
10. **Destaque de mudança** (v2). Termo acima do corte em `--chart-1` com peso 600; os demais em
    `--text-muted` com peso 400. A variação devolve `null` sem base anterior, e o termo sem base
    leva a marca `novo` em `--text-primary`, dentro da própria caixa. Toda caixa é medida no peso
    do destaque, para o termo que cruza o corte não empurrar os vizinhos.
11. **Nuvem alinhada** (v3). `<ul>` com `flex flex-wrap items-baseline`, cinco degraus de fonte pelo
    quinto da distribuição, cada termo um `<button>` com `aria-pressed`. Maioria qualificada em
    `--chart-1` com peso 600, os demais em `text-text-secondary`. O selecionado ganha borda
    `--line-strong`, fundo `--surface-sunken` e a contagem; a linha de estado traz a taxa com volume
    e o custo por `formatCurrencyCompact`, ou `formatUnavailable()` quando ninguém qualificou.
12. **Guarda de amostra e teto** (v4). A função de layout devolve `empty`, `list` ou `cloud`. Abaixo
    de 30 respostas ou de 15 termos sai a lista ordenada, com posição em ordinal, empate dividindo
    a posição e o aviso com o ícone `TriangleAlert` em `--warning`. Na nuvem, o termo que passaria de
    metade da largura do plano tem a fonte reduzida, sai em `--text-primary` e é nomeado na nota.
13. **Estado vazio.** Sem termo, a peça dá lugar a um bloco com `role="status"`, o ícone `Filter` e
    uma frase em `--text-muted` (EST-1).

## Versões

- `v1_motivos-de-perda-em-espiral`: "Motivos de perda livres do trimestre", 44 termos de 412
  respostas. Demonstra a espiral determinística com folga de 2 px por lado, a fonte pela raiz
  quadrada entre 12 e 48 px, a caixa medida com `measureText`, o peso por resposta e não por
  ocorrência, o descarte contado na nota (12 termos fora da nuvem) e a lista em `sr-only`. Canvas
  `card`. O plano de 574 x 176 px foi dimensionado para o caso de uso em duas linhas; hoje ele cabe
  em uma, o corpo mede 241,5 px e sobram 16,5 px em volta do plano, sem mudar a escala.
- `v2_termos-que-cresceram`: "Termos de perda que cresceram no trimestre", 32 termos em dois
  trimestres. Demonstra o destaque em `--chart-1` só acima do corte de 50%, o resto em
  `--text-muted`, a dica com as duas contagens e a variação com a base nomeada, e o termo sem base
  marcado como `novo`. O catálogo pede peso 700 no destaque; a versão usa 600, porque a TIP-3 limita
  o 700 a dois elementos e o recorte tem 6 termos acima do corte. Canvas por número, 640x400: a nota
  de duas linhas não cabe no `card` sem tirar termos da nuvem.
- `v3_termos-de-busca-em-nuvem-alinhada`: "Termos de busca paga em nuvem alinhada", 24 termos de
  2026-08. Demonstra a variante em HTML com cinco degraus por quantil, o botão com `aria-pressed`
  que filtra e mostra a contagem, a maioria qualificada em cor e peso, a ordem alfabética declarada
  com o seletor de ordem por leads, e a dica com leads, taxa e custo por lead qualificado. Canvas
  `largo`.
- `v4_amostra-pequena-e-termo-longo`: "Amostra pequena e termo longo", 9 termos de 22 respostas. O
  dado publicado exercita o caminho da lista, e é ele que o preview fotografa; o caminho da nuvem,
  com o teto para termo longo, vive no mesmo componente e responde a qualquer recorte acima dos dois
  mínimos. Demonstra também o estado vazio com `role="status"`. Canvas `card`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão. Troque o dado fictício pela consulta real, já com o
   pré-processamento da família feito antes: minúsculas, palavras vazias fora, contagem por
   resposta. O componente não limpa texto.
2. Passe o total de respostas do recorte (`totalResponses`) junto com os termos: é o denominador
   da taxa e, na v4, a contagem que decide entre nuvem e lista.
3. Ajuste `VIEW_WIDTH` e `VIEW_HEIGHT` para o corpo medido do cartão de destino. Se o cartão muda
   de largura, declare um plano por ponto de quebra; não leia a janela nem refaça o layout a cada
   pixel.
4. Dê altura ao pai ou passe `height`. Se a linha de leitura ou a nota quebrarem em mais linhas no
   destino, o `<svg>` encolhe e a fonte de 12 px chega menor: reduza o plano na mesma medida.
5. Na v3, ligue `onSelect` ao filtro da página e passe `selectedId` quando a página for a dona da
   seleção; sem ele o componente guarda a seleção sozinho, a partir de `defaultSelectedId`.
6. Ao embrulhar num `VisualCard`, o estado vazio inline dá lugar ao `EmptyState` do Farol, com o
   mesmo sentido do texto.

## Referências

- [d3-cloud, README](https://github.com/jasondavies/d3-cloud): colocação do maior para o menor,
  espiral arquimediana e descarte do que não cabe. Só referência de algoritmo; nada é importado.
- [MDN, measureText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText):
  campos de `TextMetrics` usados na caixa de cada termo.
- [echarts-wordcloud, README](https://github.com/ecomfe/echarts-wordcloud): faixa de tamanho e a
  escolha entre encolher e omitir, que a v4 aplica ao termo longo.
- [Data Viz Catalogue, Word Cloud](https://datavizcatalogue.com/methods/wordcloud.html): viés de
  palavra longa e de ascendentes e descendentes.
- [From Data to Viz, Word cloud](https://www.data-to-viz.com/graph/wordcloud.html): crítica à área
  como codificação e as alternativas em barra.
- [Wikipedia, Tag cloud](https://en.wikipedia.org/wiki/Tag_cloud): ordem alfabética e por peso e a
  normalização do tamanho em degraus, base da v3.
- No Farol: `app/src/lib/format.ts` para número, taxa e moeda, e `app/src/styles/tokens.css` para
  as cores. Não há componente de nuvem no Farol; este modelo é a referência.
- Estudo da família: `_estudo/familias/21_texto-e-nuvem-de-palavras.md`.
- Pedido registrado, sem contorno no componente: `@/lib/format` não tem formatador de trimestre, então
  a v1 e a v2 recebem o período já escrito em `periodLabel`, vindo do `data.ts`.
- Pedido registrado: fora do Recharts não há dica do Farol na lista de imports da seção 6 do
  contrato, então a dica das quatro versões é o `title` nativo, do SVG e do botão.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13: as quatro versões aprovadas, sem bloqueante. O `check` saiu com 0 erros e 0 avisos. Foi medido à mão o que as guardas não alcançam: o contraste do texto em HTML da `v3` e da `v4`, a fonte de cada termo contra a raiz quadrada na `v1` e na `v2`, os degraus e a maioria qualificada da `v3` contra o `data.ts`, e a diferença entre preview e página viva, de 0,03% a 0,23% nos oito PNGs. Nenhum item abaixo muda o que o desenho afirma com o dado publicado; o próximo agente que tocar o arquivo alinha.

- `v2`, redação da linha de leitura e da frase acessível: `Lidera prazo: +61%` lê como a maior alta, e `prazo` é o mais citado dos 6 em destaque, o quinto em variação (comitê dobra, de 3 para 6; demora sobe 78%; diretoria, 64%). Trocar por `O mais citado deles é prazo` tira a ambiguidade sem mudar o cálculo.
- `v2`, base da variação: a variação compara contagens (71 contra 44) de períodos com totais diferentes (412 e 398 respostas). Pela taxa de citação `prazo` sobe 56%, e `burocracia`, que pela contagem fica no corte exato de 50%, sobe 45%. Nenhum dos 6 troca de lado neste recorte e a dica escreve os dois totais; com períodos de tamanhos distantes a contagem engana, e a taxa é a base certa.
- `v1`, descarte por encaixe: os 12 termos de fora têm de 5 a 13 respostas, e 10 deles têm mais respostas que `perfil` e `carteira`, que entram com 5; os três termos de 9 respostas ficam todos de fora. A nota conta e diz o maior, e a anatomia explica o viés, mas o nome de quem ficou de fora só existe no `title` da nota e na lista `sr-only`. Nomear o maior na nota (`rentabilidade`) ou parar de encaixar depois do primeiro descarte fecharia a leitura.
- `v4`, cobertura: o preview fotografa só o caminho da lista, que é o que 22 respostas e 9 termos pedem. O caminho da nuvem, com o teto de largura, não foi renderizado nem medido por nenhuma guarda; foi conferido por leitura de código, e é o layout da `v1` mais `cappedSizeFor`.
- `v4`, teto no caminho da nuvem: com o teto em 50% do plano, `planejamento sucessório` pararia em cerca de 23 px ao liderar, menor que um termo curto com um terço das respostas dele (28 px). A cor, a linha de leitura e a nota avisam do primeiro termo com teto; do segundo em diante a nota só conta (`e mais 1 termo`) e o termo se separa dos vizinhos apenas pela cor, `--text-primary` contra `--text-secondary`, 1,78:1 no escuro e 2,21:1 no claro (ACE-2). Nomear na nota todos os termos com teto resolve.
- `v3`, limiar do destaque: `usufruto` acende como maioria qualificada com 1 lead de 1. O degrau menor e a dica mostram o volume, mas um piso de leads para o destaque evitaria a leitura de taxa sem volume (DAD-1).
- `v3`, escala dos degraus: a tela diz `cinco degraus pelos leads` e não diz que o degrau é o quinto da distribuição nem quanto vale cada um; `consórcio imobiliário`, com 58 leads, e `holding familiar`, com 84, saem no mesmo tamanho. Uma régua de cinco amostras com a faixa de leads de cada degrau, terminando no maior valor observado (ROT-5b), fecharia a leitura.
- `v2` e `v3`, COR-2: destaque e neutro quase não se separam em luminância (`--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro; contra `--text-secondary`, 1,16:1 e 1,35:1). Quem não distingue o matiz depende do peso 600 contra 400, discreto nos termos de 12 px. O segundo canal existe e a legenda nomeia o destaque; um sinal junto do termo reforçaria.
- `v3`, ACE-8: `--chart-1` sobre `--surface-sunken`, o par do termo selecionado, não está na tabela 17.10. Medido: 10,90:1 no escuro e 5,20:1 no claro. `--text-primary` sobre a mesma superfície mede 16,67:1 e 15,56:1.
- `v2` e `v3`, ROT-4: a legenda do destaque fica abaixo do desenho, e a regra pede acima ou ao lado. Sem consequência visível.
- `v1`, `v2` e `v4`, TIP-1: o período dentro da linha de leitura sai sem `tabular-nums` (`3º trimestre de 2026` na `v1`, `2º trimestre de 2026` na `v2`, o mês no caminho da nuvem da `v4`). Fora de coluna, sem consequência visível.
- `v4`, TIP-6: na lista, a contagem alinha à direita com o substantivo junto, e `1 resposta` tira o algarismo da coluna dos demais em cerca de 6 px. Separar número e substantivo alinha a coluna.
- `v4`, TIP-4: a posição e a contagem da lista usam `font-display` sem peso declarado; o peso herdado é 400, que a Space Grotesk não carrega, e o navegador cai no 500. Declarar `font-medium`, como faz a `v3`. Sem consequência visível.
