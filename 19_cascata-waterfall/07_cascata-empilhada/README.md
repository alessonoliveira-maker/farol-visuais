# Cascata empilhada

## O que é

Uma cascata em que cada passo flutuante é dividido em segmentos por componente (executivo, plataforma, contrato), para responder quem contribuiu com o quê em cada passo. A geometria sai inteira de funções puras em TypeScript, com N retângulos por passo, em SVG puro com viewBox do tamanho do corpo. O preenchimento pertence ao componente (slot categórico fixo, ou `--chart-1` contra `--line-strong` quando um está em foco) e a polaridade vai para o sinal, a seta e o rótulo do líquido, escrito acima de cada passo. Os totais ancoram no zero, sem segmentação, numa só convenção de cor, e um conector liga o fim de cada coluna ao começo da seguinte. Nenhum passo mistura positivo com negativo.

## Quando usar

* Ponte de 3 a 6 passos em que cada passo se divide em até 6 componentes do mesmo sinal.
* A pergunta é a contribuição de cada executivo, plataforma ou contrato dentro de cada passo.
* Um componente em foco comparado ao resto, com os demais em neutro e o foco sempre na base da pilha.
* Custo em que só alguns passos se dividem, com a legenda presa ao passo segmentado.

## Quando evitar

* Componentes de sinais opostos no mesmo passo: separar em dois passos, como a `v4` faz com o estorno.
* Mais de 6 componentes por passo: agrupar em "Outros (n=X)" ou usar a ponte aninhada, modelo 08.
* O total por passo não importa e a comparação é entre componentes: colunas agrupadas, família 03.
* O interesse é o caminho dos componentes entre estágios: Sankey, família 11.
* Totais muito maiores que os passos: as fatias ficam finas. A `v1` e a `v2` resolvem com desvio declarado (eixo que parte da carteira inicial, totais como nível escrito); com o eixo no zero o segmento só se lê na dica.

## Anatomia

1. **Total**: sem segmentação, em `--text-secondary`, com o valor escrito acima (`--text-primary`, peso 600). Coluna do zero na `v3` e na `v4`; na `v1` e na `v2`, nível de 3 px sobre eixo que parte da carteira inicial (180), escrito na linha de leitura. Não usa `--chart-1`, que é slot de componente.
2. **Passo segmentado**: pilha de retângulos calculada por `buildBlocks`, da base do passo para cima, com cor por slot fixo (1, 3, 6, 5, depois 2 e 4). Na `v1` e na `v2` o separador é um vão proporcional de 1,5 px só entre vizinhos, sem contorno (COR-5); na `v3` e na `v4`, contorno em `--surface-raised`. Passo inteiro da `v3` sai de onde o anterior terminou, não do zero.
3. **Rótulo do líquido**: sinal à mão sobre o valor absoluto (NUM-3) e seta desenhada em polígono. Cor de polaridade vinda do campo `polarity` do dado na `v1` e na `v2` (entradas e ganhos `--positive`, perdas `--negative`); na `v4`, de custo pelo sinal; a `v3` não desenha seta nem cor. O segmento só aparece na dica nativa (`<title>`).
4. **Conector**: traço de 1 px em `--line-strong` do fim de uma coluna ao começo da seguinte, no nível acumulado.
5. **Legenda**: acima do gráfico, na ordem da pilha lida de cima para baixo (`v1`, `v2`, `v4`), ou presa ao passo, à direita da barra e abaixo do conector (`v3`).
6. **Linha de leitura** (`aria-hidden`, 12 px) calculada do dado: variação com base, taxa com volume por `formatRateWithVolume` ou o fechamento verificado.
7. **Fechamento**: função que devolve `number | null` com a diferença entre o total declarado e a soma dos passos; só aparece na leitura se houver erro.
8. **Frase acessível** calculada do dado, com os nomes de passo em minúscula.

## Versões

* `v1_carteira-do-mes-por-executivo`: carteira de 180 para 193 abertas em agosto, com entradas, ganhos e perdas divididos por quatro executivos nos slots 1, 3, 6, 5.
* `v2_um-executivo-em-foco`: só Denise R. acesa em `--chart-1`, os demais em `--text-muted` (desvio declarado, sem número por marca), foco fixo na base; taxa de 33,3% (3 de 9) contra a mediana do time, com `highlightId` vindo do `data.ts`.
* `v3_custo-da-area-com-midia-por-plataforma`: passos inteiros (pessoas, comissão) e segmentados (mídia por plataforma, ferramentas por contrato) na mesma ponte, com a legenda presa ao passo.
* `v4_estorno-separado-em-passo-proprio`: R$ 124 mil investidos em quatro plataformas, estorno de R$ 6 mil em passo próprio no mesmo slot da rede profissional e mídia líquida de R$ 118 mil, com a nota da decisão.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão para o diretório do visual e trocar `data` e `parts` pelo retorno da métrica; os tipos vêm do `data.ts`.
2. Entregar o dado já na ordem da ponte, com `sign` (ou o tipo do passo) e os valores de cada componente como magnitudes; o componente confere a soma e escreve na leitura quando a ponte não fecha.
3. O `viewBox` é do tamanho do corpo do canvas indicado no `meta.json`. Num cartão de outra largura o SVG escala por inteiro e o texto escala junto: trocar `VIEW_W` e `VIEW_H` pelo corpo real do `VisualCard`.
4. Embrulhar num `VisualCard` e trocar o estado vazio inline por `EmptyState`; título e procedência são do cartão.
5. A dica é o `<title>` nativo de cada retângulo; se o Farol quiser dica rica, substituir por `ChartTooltip` com o mesmo texto.

## Referências

* Método: a ponte (bridge) de Gene Zelazny, em "Say It With Charts", com a pilha por componente de Stephen Few em "Show Me the Numbers".
* Farol: `app/src/lib/format.ts` (`formatCurrencyAxis`, `formatInt`, `formatPercent`, `formatRateWithVolume`) e `app/src/components/visuals/charts/StackedBarsChart.tsx` para a separação entre segmentos.
* Pedido ao Farol: nenhum formatador escreve o sinal `+` nem a seta de polaridade, então cada versão os escreve à mão.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v4` aprovada; `v1`, `v2` e `v3` reprovadas, com o parecer em `validation/revisao_19_cascata-waterfall__07_cascata-empilhada_2026-10-06.md`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v1`, `v2`, `v3` e `v4`: o conector é um traço de 1 px em `--line-strong` (1,79:1 no escuro e 1,83:1 no claro). Foi lido como referência pela ACE-6, como em `01_cascata-de-ponte`: tapado o traço, o nível continua na posição das colunas e o líquido continua escrito.
* `v1`, `v2`, `v3` e `v4`: o bloco de vazio traz só a frase, sem o ícone `Filter` de 16 px da EST-1. Não aparece no preview.
* `v1`, `v2`, `v3` e `v4`: os números da linha de leitura ficam em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
* `v1`, `v2`, `v3` e `v4`: `sumParts` devolve `null` para passo sem partes, e `buildBlocks` desfaz com `?? 0` (EST-1b). Um passo sem componente sairia com rótulo de zero. Mora no ramo; o dado fixo não passa por ele.
* `v1`, `v2`, `v3` e `v4`: `BAR_W` de 40 px passa do teto de 24 px da ESP-2. Sem consequência visível; a pilha precisa da largura para as fatias.
* `v3` e `v4`: o separador é um contorno de 1,5 px em cada retângulo, e tira 1,5 px de toda fatia (GEO-16). Na `v3`, Contrato de envio fica com 35,8% da tinta de Ferramentas para 38,5% do valor; na `v4`, o estorno mede 4 px de tinta para 5,46 px nominais, com o valor escrito acima. Na `v1` e na `v2` o mesmo contorno é bloqueante. Um vão proporcional só entre vizinhos resolve nas quatro.
* `v3` e `v4`: o rótulo direto sai de `formatCurrencyAxis`, e a NUM-1 pede `formatCurrencyCompact`. Com o dado fixo em milhar redondo a diferença seria o `,0`.
* `v1`: a variação da linha de leitura sai como `+7%`; abaixo de 10% a NUM-1 pede uma casa (`+7,2%`).
* `v1` e `v2`: os rótulos dos passos (`+64`) e do foco (`Denise R. +17`) não levam o substantivo (NUM-6). Os totais dizem "abertas" e a leitura da `v1` diz "oportunidades abertas", então a unidade não fica em dúvida.
* `v1` e `v4`: o topo da pilha é `--chart-5` e fica a 8 px de um rótulo em `--negative`, de matiz vizinho. Não é o caso da COR-8, porque os hex são diferentes, mas o rótulo pode ler como cor da categoria.
* `v1` e `v2`: o comentário do topo do `Chart.tsx` diz "Seis colunas em 878 px dão banda de 146 px"; são cinco colunas e a banda mede 175,6 px. No `data.ts` da `v1`, "o sinal vem do `kind`" devia dizer `sign`.
* `v1`: a frase acessível diz "divididos entre 4 executivos" e não nomeia nenhum, embora a pergunta seja quem contribuiu.
* `v2`: a legenda lista o foco antes dos demais, e na pilha os demais ficam em cima (ROT-4).
* `v2`: a mediana do time não diz de quantos executivos (4) e inclui a própria Denise R.; os passos da conversão são achados por `id` fixo no componente (`ganhos`, `perdas`), o que amarra o Chart ao dado.
* `v3`: o valor de cada plataforma e de cada contrato só está na dica, como o catálogo pede. A legenda presa ao passo tem espaço para o valor à direita do nome (ROT-5), e a pergunta é como a mídia se divide.
* `v3`: passo inteiro em `--text-muted` e total em `--text-secondary` são tons vizinhos. Corrigido o bloqueante da Comissão, a posição passa a separar os dois papéis.
* `v4`: a cor de polaridade sai do sinal por uma função fixa de custo, sem campo de polaridade no dado, e pinta de `--negative` o bruto investido, que parte do zero e não é variação. A `v3` trata o mesmo tipo de passo como neutro. Vale alinhar as duas.
* `v4`: o mês só aparece no caso de uso do `meta.json`, como `2026-08`, que é formato de dado (NUM-7), e não está na linha de leitura (DAD-9). O caso de uso também não é pergunta, como é nas outras três.
* `v4`: a nota de rodapé tem 94 caracteres, e a ANO-2 pede até 50.
* `v4`: a legenda fica no topo, e o nome com o valor caberia à direita da pilha investida (ROT-4), que tem 146 px livres até o estorno.
* Nota de correção: os bloqueantes da `v1`, `v2` e `v3` foram tratados depois desta revisão (vão proporcional, eixo por desvio declarado, polaridade do dado, neutro em `--text-muted`, passo inteiro da `v3` flutuando); os itens acima sobre contorno da `v1` e `v2` e sobre o README ficam como histórico.

Revisão de 2026-10-06, segunda passada, depois da correção: `v1`, `v2` e `v3` julgadas pelo arquivo de hoje e aprovadas, sem bloqueante. Conferido no `preview.svg` e nos dois PNGs: na `v1` e na `v2`, 2,77 px por oportunidade, pilhas com a altura do líquido, vão de 1,5 px só entre vizinhos e as quatro fatias de Ganhos com tinta nos dois temas; na `v3`, Comissão flutuando de R$ 304 mil a R$ 326 mil com 13,56 px. Os itens da primeira passada que a correção não tocou continuam valendo. Itens novos, nenhum reprova:

* `v1` e `v2`: o vão proporcional é descontado dentro de cada passo, então a tinta por oportunidade muda de passo para passo (2,70 px em Entradas, 2,66 px em Perdas, 2,32 px em Ganhos). Dentro do passo a proporção é exata e a altura do passo é a do líquido; entre passos, a mesma contagem desenha uma fatia 14% menor em Ganhos do que em Entradas.
* `v1` e `v2`: a menor fatia (Bruna T. em Ganhos, 1 oportunidade) mede 2,3 px. Tem tinta nos dois temas, mas o componente não tem piso nem aviso: com um passo menor ou um pico maior ela volta a sumir.
* `v1` e `v2`: o piso do eixo está escrito na linha de leitura ("eixo parte de 180") e no rótulo do nível inicial, e nenhum retângulo codifica valor absoluto a partir dele, como em `03_cascata-temporal-de-saldo` `v3`. Quem tirar a linha de leitura ao colar no Farol tira junto a declaração do eixo.
* `v1` e `v2`: o "O que é" deste README ainda diz que os totais ancoram no zero, o que hoje só vale para a `v3` e a `v4`; a Anatomia já diz o certo.
* `v1` e `v2`: o catálogo ainda descreve o total como coluna e, na `v2`, os demais em `--line-strong`. As duas versões declaram o desvio no `notes`, e o da `v2` é exigência da tabela 17.2. Alinhar o catálogo é decisão do dono.
* `v2`: aceso contra neutro mede 1,82:1 no escuro e 1,12:1 no claro (TOK-9). O segundo canal existe (rótulo próprio com nome e valor em peso 600, posição fixa na base), mas a TOK-9 pede o número escrito no `notes` e ele não está lá.
* `v2`: o rótulo do foco usa `--chart-1` como cor de texto (9,50:1 no escuro e 6,00:1 no claro, passa a ACE-3); a tabela 17.1 prevê `--text-primary` no rótulo destacado.
* `v2`: a palavra "oportunidades" não aparece no corpo, só "abertas" nos totais e a palavra inteira na dica; a linha de leitura fala só da conversão (NUM-6).
* `v1`, `v2` e `v3`: componente com `partId` sem cadastro em `parts` entra na soma do líquido e não é desenhado, então a pilha ficaria mais curta que o valor escrito, sem aviso. Mora no ramo; o dado fixo não passa por ele.
* `v1`, `v2` e `v3`: o rótulo de categoria sai em `--text-muted` com peso 400, e a tabela 17.1 prevê `--text-secondary` com peso 500. Mede 5,21:1 e 5,37:1, sem consequência visível.
* `v3`: com o contorno, Ferramentas (R$ 26 mil) tem 14,5 px de tinta ao lado da Comissão (R$ 22 mil) com 13,6 px, razão de 1,07 para 1,18 do valor; em Mídia a parte de cada plataforma desvia até 1,1 ponto percentual. Os valores dos passos estão escritos. Complementa o item do contorno da primeira passada.
* `v3`: os slots 2 e 6 (Contrato de análise e Rede profissional) caem para ΔE de 4,1 em deuteranopia no tema claro (COR-8). Ficam em pilhas diferentes, cada uma com a própria legenda, e por isso não se confundem; vale lembrar se os slots mudarem.
* `v3`: a legenda presa ao passo não mede a largura do nome. "Contrato de análise" passa da banda de Ferramentas e termina a cerca de 12 px da coluna de Comissão, sem colidir porque a Comissão fica acima; com nome mais longo ou vizinho mais baixo ela entra na coluna seguinte.

## Pendências conhecidas

* `v1` e `v2`: a linha de leitura passou a trazer "eixo parte de 180" e a variação continua com `+7%` (NUM-1); sem ícone `Filter` no vazio (EST-1). Nada bloqueante.
