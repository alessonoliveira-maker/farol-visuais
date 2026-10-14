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

- **`v2`, destaque em accent-amber.** O catálogo pede a taxa de ganho em `accent-amber`. Esse token não tem utilitário, é acento de interface, e repete o hex de `--warning` e de `--prov-premissa`, que é justamente o selo impresso no cartão vizinho. O destaque saiu em `chart-1`, que a seção 7 nomeia como a cor de quando só uma coisa acende (9,50:1 e 6,00:1), com peso e anotação como segundo e terceiro canais (COR-2, ACE-2).
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
