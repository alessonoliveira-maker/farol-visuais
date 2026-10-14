# Divergente empilhada Likert

## O que é

Pilha de categorias ordinais centrada entre dois polos: as respostas ruins ou de discordância ficam
à esquerda de um zero comum, as boas ou de concordância ficam à direita, e o neutro fica fora da
pilha, numa coluna própria. O deslocamento de cada item é calculado em TypeScript (soma dos
percentuais do polo negativo define onde o zero cai) e os retângulos saem em SVG puro com escala
linear escrita à mão. A leitura é de equilíbrio: quanto a barra pende para um lado, com o zero como
referência comum entre todas as linhas do conjunto.

## Quando usar

* Escala ordinal com polos: avaliação de 5 pontos, concordância, satisfação.
* Leitura do equilíbrio entre os polos por item, quando a forma geral importa mais que a comparação
  exata entre dois números.
* De 3 a cerca de 15 itens com o mesmo conjunto de respostas.
* Avaliação de qualidade de lead por critério ou por origem no handoff entre pré-vendas e vendas.

## Quando evitar

* Categorias nominais sem polo: use barras empilhadas 100% (`04_barras-empilhadas-100`).
* A pergunta é qual item tem mais resposta positiva: barras empilhadas 100% alinhadas à esquerda
  compara melhor que a divergente.
* Uma nota média por item já basta: use barras simples ordenadas (`01_barras-simples-ordenadas`)
  ou comparação de pontos (`17_comparacao-de-pontos`).
* Itens com n muito baixo sem espaço para o selo de aviso: use tabela (`14_tabelas-visuais`).
* Valores numéricos com sinal, que não vêm de uma escala ordinal: use barras divergentes de sinal
  (`06_barras-divergentes`).

## Anatomia

1. **Rótulo do item**, à esquerda, em `text-text-secondary`, com o texto completo sem reticência
   (TIP-7).
2. **Pilha centrada no zero**, um `<svg>` por linha com retângulos posicionados por fração do
   domínio comum a todas as linhas: `--chart-1`, `--chart-3`, `--chart-5` e `--chart-6` para os
   pontos da escala, na ordem de slot 1, 3, 6, 5 (COR-8).
3. **Linha do zero**, `--line-strong` sólida de 1 px, no mesmo x em toda linha do conjunto.
4. **Rótulo de percentual dentro do segmento**, só quando cabe, em `--accent-cyan-contrast` sobre a
   cor do segmento, calculado pelo maior resto para somar 100.
5. **Contorno entre segmentos vizinhos**, `--surface-raised` de 1 a 1,5 px, porque cores adjacentes
   da paleta não contrastam entre si (COR-5).
6. **Coluna do neutro ou legenda**, conforme a versão: número à parte na v1, v2 e v3, ausente por
   desenho na v4 (escala par sem ponto central).
7. **Contagem de respostas**, à direita, em `--text-muted`, com o substantivo por extenso (NUM-6).
8. **Estado indisponível**, ícone `Unplug` e `formatUnavailable()` no lugar da pilha quando o item
   não tem nenhuma resposta no recorte.

## Versões

* **`v1_qualidade-do-lead-no-handoff`**: o básico do modelo, seis critérios de handoff numa escala
  de 5 pontos, com o neutro em coluna própria e a legenda ancorada no zero.
  [preview escuro](./v1_qualidade-do-lead-no-handoff/preview.svg) ·
  [preview claro](./v1_qualidade-do-lead-no-handoff/preview-claro.svg)
* **`v2_saldo-liquido-por-polo`**: os mesmos critérios, ordenados pelo saldo entre positivo e
  negativo, com a soma de cada polo escrita fora da pilha, o neutro em coluna própria entre o
  percentual positivo e o saldo, e o saldo em pontos percentuais ao lado.
  [preview escuro](./v2_saldo-liquido-por-polo/preview.svg) ·
  [preview claro](./v2_saldo-liquido-por-polo/preview-claro.svg)
* **`v3_avaliacao-por-origem-mini`**: a mesma geometria em densidade de tabela, doze origens de
  lead numa barra mini por linha, com as origens de saldo negativo pendendo para a esquerda.
  [preview escuro](./v3_avaliacao-por-origem-mini/preview.svg) ·
  [preview claro](./v3_avaliacao-por-origem-mini/preview-claro.svg)
* **`v4_escala-par-e-n-baixo`**: caso limite de escala par, sem ponto neutro, com item de n abaixo
  de 10 em opacidade reduzida e selo, e item sem nenhuma resposta em `formatUnavailable()`.
  [preview escuro](./v4_escala-par-e-n-baixo/preview.svg) ·
  [preview claro](./v4_escala-par-e-n-baixo/preview-claro.svg)

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a página de destino (handoff pré-vendas e
   vendas, ou pesquisa de clima).
2. Ligue `data` ao seletor real do formulário de handoff ou da pesquisa, mantendo o mesmo formato de
   contagem por ponto da escala (`Record<RatingKey, number>`); a decisão de deixar o neutro fora da
   pilha é do modelo inteiro e não deve mudar por página.
3. Embrulhe no `VisualCard` com `metricId` da métrica de qualidade de handoff; o título do
   `meta.json` vira o `title` do cartão.
4. Dê altura ao pai proporcional ao número de itens (`ROW_HEIGHT` da versão vezes a contagem de
   linhas mais a margem do cabeçalho).

## Referências

* [Vega Lite, divergente empilhada com neutro](https://vega.github.io/vega-lite/examples/bar_diverging_stack_transform.html)
* [Vega Lite, medianas de escala Likert](https://vega.github.io/vega-lite/examples/layer_likert.html)
* [Datawrapper, the case against diverging stacked bars](https://www.datawrapper.de/blog/divergingbars)
* [Data Revelations, rethinking the divergent stacked bar chart](https://www.datarevelations.com/rethinkingdivergent/)
* [Heiberger e Robbins, design of diverging stacked bar charts for Likert scales](https://www.researchgate.net/publication/289590282_Design_of_Diverging_Stacked_Bar_Charts_for_Likert_Scales_and_Other_Applications)
* [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit)
* Estudo de origem: [`_estudo/familias/02_barras-horizontais.md`](../../_estudo/familias/02_barras-horizontais.md), seção 2.10.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-17; nenhum item desta lista reprova versão. As quatro versões
passaram no `npm run check` sem erro nem aviso e foram conferidas nos dois temas. A
`v2_saldo-liquido-por-polo` havia sido reprovada por um ponto que já não existe: o neutro da escala
de 5 pontos não aparecia em lugar nenhum da tela e as duas colunas de polo somavam menos de 100 sem
declarar o resto, ao contrário da v1 e da v3. Corrigido em 2026-09-17: o neutro sai numa coluna
própria, entre o percentual positivo e o saldo, e os três números de cada linha fecham em 100.
Correção de 2026-09-18, dois `check_erro` que a impressão registrada não cobria mais: a frase
acessível da `v2_saldo-liquido-por-polo` cortou "entre positivo e negativo" da oração do melhor
saldo e voltou a caber no teto de 250 caracteres da ACE-1; a marca de segmento da
`v3_avaliacao-por-origem-mini` passou de 16 para 18 px de altura para acomodar o rótulo de 11 px
acima do piso de 17 px da ESP-2. `npm run check` sai limpo (0 com erro) nas quatro versões._

_Segunda revisão independente em 2026-09-18, sobre o estado já corrigido: `npm run check` sai com 0
com erro e 1 aviso, os quatro pares de PNG foram lidos nos dois temas e as quatro versões estão
aprovadas. Nenhum bloqueante novo. Conferências refeitas nesta passada: as três colunas de
percentual da `v2` fecham 100 em todas as sete linhas e o saldo bate com a diferença entre os polos;
o contraste do texto sobre segmento foi recalculado pela fórmula da WCAG e o pior par segue em
5,39:1, acima do piso de AA; a cor do selo "n baixo" da `v4` mede 5,74:1 no claro e 8,16:1 no
escuro. Os itens abaixo continuam valendo como observação._

_Terceira revisão independente em 2026-09-19, também sobre o estado corrigido: `npm run check` sai
com 0 com erro e 1 aviso (a frase de 238 caracteres da `v1`), os quatro pares de PNG foram lidos nos
dois temas e as quatro versões seguem aprovadas, sem bloqueante novo. Conferido nesta passada: cada
linha das quatro versões fecha em 100 com o neutro contado, o zero cai no mesmo x em todas as linhas
de cada versão, nenhuma barra parte de valor diferente de zero, a ausência da `v4` sai como
indisponível e não como zero, e não há texto cortado ou sobreposto em nenhum dos oito PNGs. O único
item da lista abaixo que mudou de estado é o selo "n baixo" da `v4`, que já está a 11 px._

* Todas as versões: `--accent-cyan-contrast` sobre `--chart-3`, `--chart-5` e `--chart-6` não está na
  tabela medida da CONTRATO 17.10, que só certifica o par sobre `--chart-1`. A revisão de 2026-09-17
  refez a conta sobre `tokens.css` pela fórmula da WCAG: o pior par é `--chart-6` no claro, 5,39:1, e
  o conjunto vai de 5,39:1 a 10,06:1 nos dois temas, acima do piso de 4,5:1 de texto. Vale promover
  as medidas para a tabela do contrato em vez de deixá-las só na nota do `meta.json`.
* Todas as versões: a ordem de slot da COR-8 (1, 3, 6, 5) é usada invertida na escala (5 e 6 no polo
  ruim, 3 e 1 no bom) para a rampa divergente. O conjunto de slots está certo e o desvio está
  documentado no `data.ts`; fica registrado porque a leitura literal da regra é de ordem, não de
  conjunto.
* Todas as versões: segmento abaixo do limiar de rótulo fica sem nenhum número na tela e sem dica,
  então um ponto da escala com 2% ou 3% não tem valor legível em lugar algum.
* `v1_qualidade-do-lead-no-handoff`: a frase acessível mede 238 caracteres, a 12 do teto de 250 da
  ACE-1, e é calculada do dado. Rótulo de critério mais longo, ou um item a mais, estoura o teto no
  próximo recorte; o `check` já avisa disso a cada execução.
* `v1_qualidade-do-lead-no-handoff`: a barra da coluna do neutro tem escala própria, do zero ao maior
  neutro do conjunto, diferente da escala da pilha ao lado. O percentual está escrito ao lado, mas os
  dois comprimentos não são comparáveis entre si.
* `v2_saldo-liquido-por-polo`: o saldo sai como `+74%` porque é o que o `formatPercentPoints` do
  Farol imprime, enquanto o cabeçalho da coluna diz "(p.p.)". A divergência é do formatador da
  plataforma, não da versão; corrigido em 2026-09-17 apenas o eco na frase acessível, que repetia a
  unidade ("+74% pontos percentuais") e agora não nomeia mais a unidade por extenso ali.
* `v3_avaliacao-por-origem-mini`: o rótulo da origem usa `truncate`, e o texto inteiro não está na
  frase acessível (TIP-7). No canvas alto os doze nomes cabem, então nada some hoje.
* `v4_escala-par-e-n-baixo`: o selo "n baixo" já está em `text-[0.6875rem]`, ou seja 11 px, no piso
  da TIP-2. A observação anterior, que o apontava em 10 px, ficou vencida pela correção e é
  registrada aqui só para não voltar a ser lida como pendência.
* `v4_escala-par-e-n-baixo`: a frase acessível descreve a escala e o item sem resposta, mas não
  entrega uma conclusão de leitura como pede a ACE-1.
* `v3_avaliacao-por-origem-mini`: a contagem por linha sai como "39 resp.", abreviada, enquanto a v1
  e a v4 escrevem "respostas" por extenso (NUM-6, ROT-8). Cabe no canvas alto sem abreviar.
* `v4_escala-par-e-n-baixo`: a frase acessível traz a oração "Uma afirmação está sem resposta no
  período" fixa no texto, e conta as afirmações respondidas (cinco) enquanto a tela mostra seis
  linhas. Com outro dado a frase passa a discordar do desenho.
* `v4_escala-par-e-n-baixo`: a amostra de cor da legenda não leva `aria-hidden` própria, ao contrário
  das outras três versões. Na prática o cabeçalho inteiro está sob um `aria-hidden`, então o leitor
  de tela não lê a amostra; fica só como divergência de escrita entre as versões.
* `v4_escala-par-e-n-baixo`: a linha de n baixo perde todos os percentuais dentro dos segmentos, por
  desenho, e sobra só o comprimento dos quatro blocos. O selo e a contagem explicam a opacidade, mas
  a única linha sem número da tela é justamente a que já é a mais frágil de ler.
* `v3_avaliacao-por-origem-mini`: o catálogo ainda descreve "a única barra que pende para a
  esquerda", enquanto o dado tem duas origens de saldo negativo e o `meta.json` já foi corrigido para
  o plural. A entrada do catálogo é que está desatualizada; a versão está coerente consigo mesma.
* `v3_avaliacao-por-origem-mini`: a linha só desenha a pilha, sem tratar item de total zero; com um
  recorte que zere uma origem a linha sai vazia em vez de escrever indisponível, como fazem a v1 e a
  v4. Com o dado fixo da versão isso não aparece.
* `v4_escala-par-e-n-baixo`: o selo "n baixo" aparece sobre `bg-surface-overlay`, que no tema escuro
  desenha uma pílula visível e no claro fica quase igual ao fundo do cartão. O texto em
  `text-warning` continua acima de AA nos dois temas, então muda o acabamento, não a leitura.

## Correção de 2026-09-25

**v2, o saldo zero com sinal e cor de ganho.** `signedPoints` fazia `points >= 0 ? '+' : '−'` e a
coluna de saldo pintava por `row.balance >= 0 ? 'text-positive' : 'text-negative'`. Saldo zero, o
critério em que avaliação favorável e contrária se anulam, saía escrito `+0%` e pintado de verde.
Zero é medição, não ganho.

O que mudou: entrou `balanceSign`, que classifica pelo **texto impresso** e não pela fração crua, e
dele saem tanto o sinal (`signedPoints`) quanto a cor (`balanceTone`), para os dois nunca se
contradizerem, isto é, um "0%" pintado de verde. Zero sai sem sinal e no neutro `--text-muted`. O
teste é sobre o texto porque o saldo de meio ponto, que a peça arredonda para 0%, também não declara
direção.

**Conserto de caminho latente:** os sete saldos do dado publicado vão de −17% a +74%, nenhum zero,
então o preview não exibia o defeito e o desenho não mudou. Achado na varredura da família, não na
lista de origem.
