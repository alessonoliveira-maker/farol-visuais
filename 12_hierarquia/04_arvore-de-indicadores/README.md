# Árvore de indicadores (driver tree)

## O que é

Um indicador de resultado decomposto em alavancas ligadas por soma ou produto, desenhado como cartões conectados por linhas ortogonais. Cada cartão traz o valor central, a faixa de p10 a p90 e a etiqueta de procedência do número (medido, premissa, derivado, lacuna); o operador entre os filhos de cada nó soma ou multiplica até fechar com o valor do pai.

## Quando usar

- Decompor uma meta ou projeção em alavancas multiplicativas ou aditivas, com até 25 cartões.
- Mostrar qual alavanca move mais o resultado dentro de um cenário em faixa.
- Ligar o resultado financeiro à capacidade operacional, como entradas por mês contra um teto.
- Deixar explícito o que é medição e o que é premissa em cada elo do cálculo.

## Quando evitar

- Relações que não são soma nem produto: use rede (família 27) ou texto corrido.
- Quando o peso de cada parte é a mensagem e não a fórmula que liga as partes: use treemap (12/01).
- Mais de cinco níveis ou mais de 25 cartões: divida em duas árvores com um nó de ligação.
- Nó sem etiqueta de procedência: sem ela o visual faz premissa parecer medição.

## Anatomia

1. Cartão por nó (`rounded-lg border border-line-subtle bg-surface-raised`): rótulo em `text-text-secondary` e valor central em `kpi-number` formatado por `formatCurrencyCompact`, `formatPercent` ou `formatInt` conforme a unidade do nó.
2. Selo de procedência no canto do cartão, em `text-prov-medido`, `text-prov-premissa`, `text-prov-derivado` ou `text-prov-lacuna`.
3. Microbarra de faixa: trilho em `bg-line-strong` (ACE-3; `bg-surface-overlay` mede 1,00:1 contra o cartão no tema claro e não serve para trilho), marca do valor central em `bg-chart-1` na posição relativa dentro de p10 a p90, extremos escritos em `text-text-muted` e expostos ao leitor de tela (só o trilho leva `aria-hidden`). O substantivo da contagem aparece **uma vez** na linha dos extremos, na ponta de p90, porque repeti-lo nas duas pontas quebra as duas colunas em duas linhas (NUM-6).
4. Conector ortogonal em SVG puro, ligando a borda direita do cartão pai à borda esquerda de cada cartão filho, com a dobra no meio do vão entre colunas. A cor é `var(--text-muted)` (5,21:1 no escuro e 5,37:1 no claro) e não `var(--line-strong)`: pela ACE-6 a aresta de uma árvore carrega a relação e precisa de 3:1, que `--line-strong` não alcança (1,79:1 e 1,83:1).
5. Selo do operador: círculo `var(--surface-overlay)` com borda `var(--line-subtle)` e o sinal de vezes ou mais, no ponto onde o conector se ramifica para os filhos. O selo só existe onde há operador; ramo sem operador (o que aponta uma fonte em vez de compor o valor) sai sem ele.
6. Validação de fechamento: função pura que compara o produto ou a soma dos valores centrais dos filhos com o valor central do pai; se a diferença passar de 1%, o cartão do pai acende um aviso em `text-warning`.
7. Altura do cartão somada linha por linha por uma função pura (`cardHeight`), a partir de quantas linhas cada texto ocupa na largura útil. O mesmo número serve de piso da caixa e de âncora do conector, o que impede o traço de entrar acima do centro quando um rótulo quebra em duas linhas ou o cartão ganha uma nota.

## Versões

- `v1_receita-nova-do-ano-seguinte`: árvore de três níveis (receita nova, ganhos e ticket médio; dentro de ganhos, oportunidades e taxa de ganho), com layout lateral, conectores ortogonais, selo de procedência por nó e a validação de fechamento. Preview em [`v1_receita-nova-do-ano-seguinte/preview.svg`](./v1_receita-nova-do-ano-seguinte/preview.svg) (escuro) e [`v1_receita-nova-do-ano-seguinte/preview-claro.svg`](./v1_receita-nova-do-ano-seguinte/preview-claro.svg) (claro).
- `v2_alavanca-de-maior-sensibilidade`: o mesmo cenário lido pela sensibilidade. A folha de maior espalhamento relativo acende em `chart-1` e ganha a anotação derivada do dado ("cada ponto vale R$ 700,0 mil"); o rodapé escreve a regra da faixa do pai, que a v1 deixou pendente. Preview em [`v2_alavanca-de-maior-sensibilidade/preview.svg`](./v2_alavanca-de-maior-sensibilidade/preview.svg) (escuro) e [`v2_alavanca-de-maior-sensibilidade/preview-claro.svg`](./v2_alavanca-de-maior-sensibilidade/preview-claro.svg) (claro).
- `v3_da-receita-a-capacidade-de-pre-vendas`: cinco níveis até a capacidade da Pré-vendas, com o nó de entradas acendendo em `negative` quando a demanda mensal do cenário passa do teto fictício. Mostra o ramo lateral recolhido, sem microbarra, que é o que paga a altura de cinco níveis. Preview em [`v3_da-receita-a-capacidade-de-pre-vendas/preview.svg`](./v3_da-receita-a-capacidade-de-pre-vendas/preview.svg) (escuro) e [`v3_da-receita-a-capacidade-de-pre-vendas/preview-claro.svg`](./v3_da-receita-a-capacidade-de-pre-vendas/preview-claro.svg) (claro).
- `v4_ticket-de-produto-novo-como-premissa`: premissa de faixa mais larga que o próprio centro, o aviso de incerteza herdada no nó de resultado e o nó de lacuna em contorno tracejado, sem valor inventado. É a única versão em que a faixa é opcional no tipo do dado. Preview em [`v4_ticket-de-produto-novo-como-premissa/preview.svg`](./v4_ticket-de-produto-novo-como-premissa/preview.svg) (escuro) e [`v4_ticket-de-produto-novo-como-premissa/preview-claro.svg`](./v4_ticket-de-produto-novo-como-premissa/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a página; troque o `data` fixo por uma árvore vinda do cenário selecionado. O formato é o mesmo tipo `DriverNode`, recursivo em `children`.
2. Ajuste `provenance` de cada nó conforme a fonte real (medição do CRM, premissa do planejamento, valor derivado do cálculo). Nó sem medição entra como `lacuna` e sem `range`, como na `v4`: inventar centro para ele é a ausência virando número.
3. Dê altura ao pai: o conteúdo cresce em largura com a profundidade da árvore e em altura com o número de folhas. Combine com `overflow-x-auto` se a árvore ganhar mais níveis do que os previstos no canvas.
4. Se a árvore ficar assimétrica (nós com número de filhos diferente entre si), confira no PNG se os conectores continuam saindo da borda certa antes de alterar `COLUMN_STEP` ou `LEAF_GAP`.
5. Rótulo novo mais longo que os daqui muda a altura do cartão, porque `cardHeight` conta as linhas pela largura média de caractere. Confira no PNG: a consequência aparece como conector fora do centro, não como erro do `check`.

## Referências

- [Vega, Tree Layout](https://vega.github.io/vega/examples/tree-layout/): layout e estilos de aresta aplicáveis a árvores de cartões.
- [Data Visualisation Catalogue, Tree Diagram](https://datavizcatalogue.com/methods/tree_diagram.html): árvore como ferramenta de referência e de relação entre elementos.

## Observações da revisão

Revisão de 2026-09-20, corrigida no mesmo dia (única rodada desta leva).

- **Bloqueante corrigido:** o trilho da microbarra usava `bg-surface-overlay`, que mede 1,00:1 contra o cartão no tema claro (mesmo branco) e 1,10:1 no escuro, apagando a escala de p10 a p90. Trocado por `bg-line-strong` (ACE-3), o mesmo token que o Farol já usa como trilho neutro em barra de ranking (`14_tabelas-visuais`).
- **Corrigido:** a `<div>` inteira da microbarra levava `aria-hidden`, tirando p10 e p90 do leitor de tela. Agora `aria-hidden` fica só no trilho e na marca; os dois extremos ficam expostos como texto comum.
- **Corrigido:** `CARD_HEIGHT` virou piso (`minHeight`), não altura fixa; o cartão agora cresce para caber a quarta linha do aviso "não fecha com os filhos" em vez de a transbordar por cima do cartão abaixo dele.
- **Corrigido:** raiz do Chart sem `p-2` (ESP-4, chart de moldura `card` não desenha padding próprio) e sem `overflow-hidden` (seção 5, overflow nunca esconde transbordo). Parágrafo do valor sem `truncate` (TIP-7). Taxa de ganho passou a usar `formatRateWithVolume`, saindo como "12,0% (42 de 350)" (NUM-1); os demais valores em `percent` também foram a uma casa decimal.
- **Não acionável nesta versão, é defeito do contrato:** a ANO-6 diz que o Chart não desenha etiqueta de procedência, porque é papel do `VisualCard`; o catálogo deste modelo exige o selo por nó (lista "nó sem etiqueta de procedência" entre os casos de evitar). A revisão seguiu o catálogo. O contrato precisa de uma emenda registrando a árvore de indicadores como exceção, com o selo por nó em vez de por cartão.
- **Não acionável nesta versão, é defeito do contrato:** a tabela 17.2 nomeia `--surface-overlay` como token de "trilho de barra", e é essa entrada que induziu ao bug do bloqueante, porque a própria ANO-4 já registra que no tema claro esse token é o branco do cartão. A correção acima resolveu a versão, e a tabela 17.2 recebeu a emenda em 2026-09-29: `--surface-overlay` deixou de ser listado como "trilho de barra" e passou a ser proibido como trilho, moldura e faixa.

## O que a leva de 2026-09-28 mudou

As versões `v2`, `v3` e `v4` saíram nesta data. Elas herdaram da `v1` a forma e o estilo, e **não** herdaram três coisas, porque em cada uma delas uma regra vence o que a `v1` faz.

- **Agregação sem medida.** A `v1` calcula a extensão do desenho com `Math.max(...nodes.map(...))` em `Chart.tsx:212` e `:213`, o que devolve `-Infinity` para lista vazia; é a dívida de `AGREGACAO-ZERO` com contagem 2 registrada para ela. As irmãs semeiam o extremo com a própria raiz, que existe sempre (`Math.max(CARD_WIDTH, ...)` e `root.top + root.height`), então a conta nunca sai de uma lista possivelmente vazia. A `v1` não foi tocada: consertá-la aqui a faria perder o veredito.
- **Cor da aresta.** A `v1` desenha o conector em `--line-strong` (1,79:1 no escuro, 1,83:1 no claro). Pela ACE-6, emenda de 2026-09-20 posterior à produção da `v1`, o traço que carrega a relação é dado e precisa dos 3:1 da WCAG 1.4.11. As irmãs usam `--text-muted` (5,21:1 e 5,37:1), a mesma troca que a revisão de `12/07` fez na linha de chamada. O trilho da microbarra continua em `--line-strong` nas quatro: ali o traço é referência, os dois extremos estão escritos ao lado, e nenhum token do Farol entrega trilho neutro acima de 3:1. O aviso de `CONTRASTE-MARCA` nas quatro versões é esse trilho.
- **Âncora do conector.** A `v1` ancora o traço por uma constante de altura enquanto desenha o cartão com `minHeight`, o que a revisão registrou como defeito latente. As irmãs calculam a altura de cada cartão linha por linha (`cardHeight`) e usam o mesmo número nos dois lugares, o que fecha o desvio na origem e permite cartão de altura variável na mesma árvore.

Colisões entre a especificação do catálogo e o CONTRATO, resolvidas a favor do contrato e escritas também no `notes` de cada `meta.json`:

- **`v2`, destaque em accent-amber.** O catálogo pede a taxa de ganho em `accent-amber`. Esse token não tem utilitário, é acento de interface, e repete o hex de `--warning` e de `--prov-premissa`, que é justamente o selo impresso no cartão vizinho. O destaque saiu em `chart-1`, que a seção 7 nomeia como a cor de quando só uma coisa acende (9,50:1 e 6,00:1), com peso e anotação como segundo e terceiro canais (COR-2, ACE-2). Na `v2`, `chart-1` fica só no cartão da alavanca (borda, valor e marcador); o marcador dos outros quatro cartões é `bg-text-muted` (5,21:1 e 5,37:1, visível sobre o trilho `line-strong`).
- **`v2`, rodapé como anotação.** O catálogo chama o rodapé de anotação, e a ANO-2 põe teto de 50 caracteres em anotação. O rodapé aqui é nota de método sobre a codificação, não afirmação sobre o dado; a única anotação sobre o dado é a de 28 caracteres no cartão aceso, o que mantém a ANO-1.
- **`v4`, contorno do nó de lacuna.** O catálogo pede contorno tracejado, e a EST-2 proíbe moldura vermelha em ausência. O contorno saiu em `--text-muted`, o par que a ACE-8 aprova como contorno de ausência (5,21:1 e 5,37:1); a identificação de lacuna fica no selo de procedência.
- **Canvas.** Nas três versões o canvas é declarado por número (GEO-1), com a conta das linhas escrita no `notes` e conferida contra o preview. Na `v3` nenhum preset serve: cinco colunas medem 1.168 px, contra os 960 px do preset `largo`.

## Pendências conhecidas

- A faixa do pai não é o produto literal das faixas dos filhos (é a combinação em quadratura, ver comentário do `data.ts`). A `v2` e a `v4` escrevem a regra no rodapé; a `v1` e a `v3` não a escrevem no desenho, e quem multiplicar os extremos à mão na `v1` chega a R$ 5,95 mi em vez dos R$ 6,4 mi impressos no p10.
- O aviso "não fecha com os filhos" continua sem prova visual: nas quatro versões o dado fecha exato em todos os nós com operador. O que o código ensina só apareceria numa árvore que não fecha.
- `CONTRASTE-TEXTO` e `ESPESSURA-MARCA` não medem nada aqui, porque o texto vive em `foreignObject` e a barra é `<div>`. Os pares de contraste das quatro versões foram medidos à mão e estão escritos no `notes` de cada `meta.json`.

## Observações da revisão (não bloqueantes)

Revisão independente de 2026-09-20 sobre a `v1_receita-nova-do-ano-seguinte`, aprovada sem bloqueante: `npm run check` com 0 erro e 0 aviso, os dois temas legíveis, o operador fechando exato com os filhos e nenhum texto cortado, sobreposto ou fora do canvas.

- `v1`: o conector ancora no centro do cartão por `CARD_HEIGHT` fixo, enquanto o cartão é desenhado com `minHeight`. Neste dado nenhum nó cresce e o desenho sai certo, mas basta um rótulo de três linhas ou o aviso "não fecha com os filhos" para o conector entrar acima do centro real. Derivar a âncora da altura medida resolve na origem.
- `v1`: no cartão Oportunidades os extremos repetem o substantivo ("320 oportunidades" e "380 oportunidades"), quebram em duas linhas e deixam as duas colunas a poucos pixels uma da outra. A NUM-6 fica satisfeita com o substantivo dito uma vez na linha, o que devolveria ar à microbarra.
- `v1`: a validação de fechamento, que consta do `o_que_demonstra` do catálogo, nunca aparece no preview, porque o dado fecha exato nos dois nós com operador. O que a versão ensina fica só no código; um nó com diferença acima de 1% mostraria o aviso, ao custo de uma árvore que não fecha.
- `v1`: a frase acessível escreve "Ganhos vem de" com maiúscula no meio da frase, porque reusa o `label` do nó. Minúscula na retomada do ramo leria melhor no leitor de tela.
- `v1`: o dado não exercita nenhum nó de procedência `lacuna`, que o tipo `Provenance` prevê e o catálogo reserva à `v4`; o selo `text-prov-lacuna` fica sem prova visual nesta leva.

Revisão independente de 2026-10-14 sobre `v2`, `v3` e `v4`: `v3` e `v4` aprovadas sem bloqueante; `v2` reprovada por papel de cor (parecer em `validation/revisao_12_hierarquia__04_arvore-de-indicadores_2026-10-14.md`). `npm run check` com 0 erro; os 6 avisos são a dívida conhecida da `v1` e o trilho em `--line-strong`, já declarado acima. As observações abaixo não reprovam.

- `v2`: nada na tela diz por que a taxa de ganho é a alavanca. As microbarras têm todas a mesma largura, e o espalhamento relativo que decide a escolha (33,3% contra 27,5% do ticket e 17,1% das oportunidades) só existe no `data.ts`. Escrever o espalhamento em cada folha, ou na anotação, deixaria o diretor conferir o destaque.
- `v2`: a anotação "cada ponto vale R$ 700,0 mil" não diz ponto de quê nem de quê vale; "cada ponto de taxa vale R$ 700,0 mil de receita" cabe nos 50 caracteres da ANO-2. A frase acessível diz "é taxa de ganho", sem o artigo.
- `v2`: o `<p>` da anotação não leva `tabular-nums` (TIP-1), sem consequência visível porque o número está sozinho na linha.
- `v2` e `v4`: o rodapé afirma a regra da quadratura em texto fixo no `Chart.tsx`, mas o Chart não calcula faixa nenhuma, só imprime a que chega no dado. Com dado real feito por outra regra, o rodapé passa a mentir. O catálogo pede o rodapé; o que falta é ele vir do dado (um campo de regra no `data.ts`) ou o passo de colagem avisar.
- `v3`: o período anual só existe na frase acessível (armadilha DAD-9). Na tela, "3.500 entradas", "42 ganhos" e "R$ 8,4 mi" não dizem que são do ano, e a raiz perdeu o "do ano seguinte" que a `v1` e a `v2` têm. O "por mês" depende disso. Basta "Receita nova do ano seguinte" na raiz ou "no ano" no cartão de entradas.
- `v3`: o rodapé diz que o teto "é fictício". É aviso de protótipo dentro do Chart (ANO-6, pergunta 17), em texto fixo, e no Farol passaria a dizer que um teto real é fictício. Tirar a palavra ou tirar o rodapé, que repete o que a linha "122% do teto de 240 por mês" já diz.
- `v3`: a frase acessível diz "o teto de 240 por mês fica em 122%", mas o que fica em 122% é a demanda, não o teto. Melhor: "a demanda fica em 122% do teto de 240 por mês, acima da capacidade".
- `v3`: "122% do teto de 240 por mês" não traz o substantivo depois do 240 (NUM-6). Lê bem porque a linha de cima diz "entradas", mas "teto de 240 entradas por mês" não deixa dúvida.
- `v3`: o rótulo "Entradas na Pré-vendas" quebra no hífen e imprime "Pré-" numa linha e "vendas" na outra. Não corta nada, mas separa o nome da área; um rótulo que caiba numa linha ou um hífen que não quebre resolve.
- `v3`: com `COLUMN_STEP` de 240 sobram 4 px de conector entre a borda do cartão pai e o selo do operador, que parece colado no cartão. Não há colisão; 256 px, como na `v4`, devolveria o traço.
- `v3`: o nó de capacidade só acende uma linha em `negative`; borda e valor continuam neutros. O catálogo diz "nó em negative", e a linha com ícone cumpre o essencial, mas pintar a borda do cartão também deixaria o estouro visível a distância.
- `v3`: as duas linhas de capacidade (`292 entradas por mês`, `122% do teto…`) não levam `tabular-nums` (TIP-1), sem consequência visível.
- `v4`: a frase acessível sempre termina em "e o resultado herda essa incerteza", com ou sem premissa larga. Com outro dado, sem filho premissa acima de 100% de espalhamento, ela afirma uma herança que não existe e o "essa" fica sem antecedente. O preview não mostra isso; o ramo condicional resolve.
- `v4`: nada na tela diz o que a aresta tracejada sem operador significa (o filho aponta a medição que falta, não compõe o valor). O selo LACUNA e o "indisponível" seguram a leitura, mas uma linha curta no rodapé evitaria ler a aresta como identidade.
- `v4`: o aviso "herda a incerteza de ticket médio" em `--warning` tem o mesmo hex do selo PREMISSA (`--prov-premissa`), o mesmo âmbar que a `v2` evitou por esse motivo. Aqui a associação é coerente e o aviso tem ícone e palavra, então fica como nota.
- `v4`: o catálogo pede a regra da faixa "escrita junto do cartão", e o rodapé fica embaixo da árvore inteira, cerca de 50 px abaixo do cartão da receita. É o mesmo texto e lê bem, mas não está junto do cartão.

Revisão independente de 2026-10-14, segunda passada sobre a `v2` depois da rodada de correção: aprovada sem bloqueante. O `--chart-1` ficou só no cartão da alavanca e os outros quatro marcadores saíram em `--text-muted`, o que fecha o papel de cor (17.2, COR-2). `npm run check` com 0 erro e os mesmos 6 avisos já declarados. As observações acima continuam valendo; as abaixo são novas e não reprovam.

- `v2`: o marcador neutro (`--text-muted`) mede 2,92:1 no escuro e 2,93:1 no claro contra o trilho `--line-strong` em que se apoia, medido nas cores resolvidas do preview. Ele se vê porque o ponto de 8 px transborda 2 px de cada lado do trilho de 4 px para o cartão (5,21:1 e 5,37:1), e o valor central escrito no cartão dá a isenção da ACE-3. A frase "visível sobre o trilho" da seção de colisões depende desse transbordo: um trilho tão grosso quanto o ponto o apagaria.
- `v2`: com outro dado em que a folha de maior espalhamento não seja uma taxa (o ticket médio, por exemplo), `valuePerPoint` devolve `null`, a anotação some e o destaque fica só com cor e com o rótulo em 600 contra 500, abaixo do segundo canal que a COR-2 pede (peso 700 ou anotação). O preview não mostra esse ramo; uma linha de papel fixa no cartão aceso ("faixa relativa mais larga"), que não dependa da anotação, o fecha.
- `v2`: `mostSensitiveLeaf` busca em `collectLeaves`, que devolve a própria raiz quando ela não tem filhos. Uma árvore de um nó só acenderia a raiz como alavanca, e a frase acessível diria que a alavanca é o próprio resultado. Tirar a raiz da busca resolve.
- `v2`: a frase acessível diz "42 ganhos vezes R$ 200,0 mil" sem nomear o ticket médio; "vezes ticket médio de R$ 200,0 mil" diria de onde vem o fator.
- `v2`: a espessura do conector (`strokeWidth={1.5}`), a borda do selo do operador (`strokeWidth={1}`) e o tamanho do sinal (`fontSize={12}`) estão escritos no JSX, fora das constantes do topo (pergunta 22), sem consequência visível.
- `v2`: o item 3 da Anatomia ainda descreve a marca do valor central em `bg-chart-1` para o modelo inteiro; na `v2` ela é `bg-text-muted` fora da alavanca, e só a seção de colisões diz isso. Uma ressalva no item 3 evita que quem tome a `v1` como molde de uma árvore com destaque reintroduza o defeito corrigido.
