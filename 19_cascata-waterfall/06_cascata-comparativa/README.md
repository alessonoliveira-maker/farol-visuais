# Cascata pareada e em pequenos múltiplos

## O que é

A mesma ponte, com os mesmos passos na mesma ordem, repetida para comparar recortes: dois painéis lado a lado, dois lados espelhados num eixo central ou uma grade de painéis pequenos. A comparação é de forma e só vale com escala comum, calculada sobre todos os recortes antes de desenhar qualquer painel. Cada coluna de início e fim parte do zero, cada passo flutua onde o anterior terminou, e o mesmo passo ocupa a mesma posição em todos os painéis.

## Quando usar

* Dois períodos, plano contra realizado ou duas unidades com a mesma ponte de 4 a 7 passos.
* De 3 a 9 segmentos (executivos, plataformas, unidades) com a mesma ponte, quando onde cada um ganha ou perde importa mais que o total.
* Plano contra realizado com a variância de cada passo numa tira entre os dois lados.
* Segmentos de volume parecido; os de amostra pequena recebem aviso no próprio painel.

## Quando evitar

* Só a diferença entre os dois lados interessa: ponte de variação, `01_cascata-de-ponte/v3`, com metade da tinta.
* Segmentos com escalas dez vezes diferentes sem normalizar: declarar escalas independentes ou usar percentual do início.
* Comparação só do resultado final: comparação de pontos, família 17, ou barras, família 02.
* Mais de 9 painéis num cartão: rótulos somem; passar para tabela com cascata micro, `01_cascata-de-ponte/v4`.

## Anatomia

1. **Domínio comum** calculado por função pura sobre todos os painéis antes do desenho, subido à primeira linha de grade acima do maior acumulado.
2. **Escala linear** de valor para pixel escrita à mão em TypeScript, única para todos os painéis (EIX-9).
3. **Colunas de total** em `--chart-1` e **passos** em `--positive` e `--negative` por sinal, com sinal escrito à mão sobre o valor absoluto (NUM-3) e `formatCurrencyAxis`.
4. **Conector** de 1 px em `--text-muted` entre uma coluna e a seguinte, no nível onde o passo termina.
5. **Passo zero** em traço de 2 px com o rótulo `R$ 0`, diferente do passo sem medição, vazado e tracejado com a palavra (v4).
6. **Linha de leitura** de 12 px, `aria-hidden`, com a escala declarada ou a conclusão, e **frase acessível** calculada do dado.
7. **viewBox** com o tamanho do corpo medido, para a escala do SVG ser 1 e os 11 px chegarem como 11 px (GEO-18).

## Versões

* `v1_trimestre-contra-anterior-lado-a-lado`: duas pontes da receita lado a lado, eixo só à esquerda e total em destaque.
* `v2_plano-e-realizado-espelhados-com-variancia`: plano em contorno à esquerda, realizado cheio à direita, tira central com variância em valor e percentual por polaridade.
* `v3_carteira-por-executivo-em-oito-paineis`: grade em Tailwind de pontes pequenas na mesma escala, três valores por painel e aviso de amostra pequena.
* `v4_passo-sem-medicao-num-dos-lados`: duas unidades, passo sem medição vazado e total parcial em contorno tracejado.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão e trocar o `data` pelo retorno da métrica, na ordem da ponte; os tipos vêm do `data.ts`.
2. As versões desenham num `viewBox` do tamanho do corpo do canvas declarado no `meta.json`; em cartão mais estreito o SVG encolhe junto com o texto, então confira o piso de 11 px no cartão real.
3. Embrulhar num `VisualCard`, trocar o estado vazio inline por `EmptyState` e deixar título e procedência para o cartão.
4. Na v3, a grade usa container query (`@3xl`); ajuste o ponto de quebra à largura do cartão.

## Referências

* Método: a ponte de Gene Zelazny, em "Say It With Charts"; pequenos múltiplos de Edward Tufte, em "The Visual Display of Quantitative Information", com escala comum.
* Farol: `app/src/lib/format.ts`; nenhum formatador escreve o sinal `+` em moeda, então cada versão o escreve à mão.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez e aprovadas. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v3`: o zero medido de Camila R. (arquivadas) sai como traço neutro de 2 px em `--text-secondary`, emendado aos conectores de 1 px, e o `R$ 0` só existe no `<title>`. A EST-3 e o item 5 da Anatomia pedem o rótulo. Foi a observação mais próxima de bloquear: passou porque a marca está desenhada na altura certa e a versão, por especificação do catálogo, só escreve três valores por painel. Escrever `R$ 0` de 11 px sobre o traço resolve.
* `v3`: `Entradas` é pintada com `--info`, token de nota de texto que não tem papel de marca na tabela 17.2. O hex é o de `--chart-3` nos dois temas, então a tela não muda; trocar por `--chart-3`, o segundo slot da COR-8.
* `v3`: o item 3 da Anatomia diz que os passos vão em `--positive` e `--negative` por sinal, e a `v3` pinta por desfecho (ganhas em `--positive` mesmo descendo, arquivadas em `--warning`). A legenda nomeia cada cor; falta o README dizer.
* `v3`: a linha de leitura (`<p>`) e os textos do aviso de amostra pequena trazem número em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
* `v3`: o volume ao lado do nome, `(6 de 16)`, sai sem substantivo (NUM-6), e a legenda diz "taxa de ganho" sem dizer que a base são as oportunidades fechadas.
* `v3`: o painel de amostra pequena repete `n=3` no canto, no título do aviso e na frase; o piso de 10 fechadas não aparece na tela; e o texto quebrado à mão em três linhas escreve "1 oportunidades" quando n for 1.
* `v3`: o catálogo pede a ordem "declarada no subtítulo" e a versão a declara na linha de leitura, como o `meta.json` já diz. Acertar o texto do catálogo.
* `v2`: a base da variação fica no cabeçalho da coluna ("Realizado contra o plano") e não na linha de cada variação (NUM-4). Lê-se como coluna de tabela.
* `v2`: a seta diz só se o realizado ficou acima ou abaixo do plano; se isso é melhora ou piora vive na cor e na linha de leitura, que nomeia os passos em piora (ACE-2). Em cancelamentos a seta sobe em vermelho e quem explica é a nota de rodapé, de 126 caracteres.
* `v2`: a variância de passo é `|realizado| − |plano|`; se um passo trocar de sinal entre o plano e o realizado, a conta erra a distância. Não ocorre no dado fixo.
* `v2`: o contorno do plano, de 1,5 px centrado na borda, deixa a barra do plano 1,5 px mais longa e mais alta que a cheia de mesmo valor (410 contra 408 px de dispositivo no início). Sem consequência de leitura.
* `v2`: a linha de leitura é `<text>` de SVG e não quebra; ocupa 704 dos 890 px úteis, e com o aviso de fechamento acrescentado passa da largura e é cortada.
* `v4`: dois pares de rótulo em canto ficam a menos de 4 px, `−R$ 110 mil` a 3,67 px de `R$ 1,40 mi` e `R$ 1,05 mi` a 3,97 px de `+R$ 140 mil` (aviso da `COLISAO-TEXTO`). Conferido com zoom nos dois temas: cor, corpo e linha de base diferentes, e os dois se leem soltos.
* `v4`: o contorno tracejado do fim depende de `partial: true` vir do dado, enquanto o título do painel deriva o "parcial" do passo `null`. Dado com passo nulo e sem a marca desenharia o fim cheio. A `v4` também não confere o fechamento, que a `v1` confere.
* `v1`, `v2` e `v4`: os totais saem de `millions()`, que monta `R$ 1,58 mi` com `formatDecimal` e a unidade escrita à mão, e os passos de `formatCurrencyAxis`, quando a NUM-1 pede `formatCurrencyCompact`. O motivo procede (uma casa daria `R$ 1,6 mi` diante de passos de R$ 20 mil) e a frase acessível usa o mesmo formato; falta ao Farol a moeda compacta com duas casas no milhão.
* `v1` e `v4`: `TICK_STEP` é fixo em R$ 500 mil, e `GRID_STEP` na `v3` também. Com dado de outra ordem de grandeza a grade sai com linhas demais ou sem nenhuma, e a EIX-4 pede passo calculado.
* `v1` e `v4`: o tique do eixo usa `font-display` sem `fontWeight` e herda 400, peso que a Space Grotesk não carrega (TIP-4). O navegador cai no 500 e nada muda na tela.
* `v1` e `v4`: o rótulo do passo de queda fica acima do topo da barra, onde o passo começa, e não na ponta livre (ROT-2). Sem sobreposição.
* `v1` e `v4`: o passo medido de R$ 20 mil sai com 2 px, a espessura do traço do zero; os dois se separam pela cor e pelo valor escrito.
* `v1`: a linha de leitura só declara a escala; o que os dois trimestres têm em comum (novos como maior passo) fica na frase acessível (ANO-5).
* `v1`: `2026-T2` e `2026-T3` saem crus no título de cada painel (NUM-7); o `format.ts` não tem formatador de trimestre.
* `v2`, `v3` e `v4`: o período não está no corpo. Na `v2` ele só existe na frase acessível; na `v3` e na `v4` nem no dado, só no comentário do `data.ts` e no subtítulo do cartão (DAD-9).
* `v1`, `v2`, `v3` e `v4`: sobram posições escritas no JSX (`cy - 3`, `cy + 12`, `PLOT_TOP + 42 + index * 16`, `PLOT_BOTTOM + 18`) e o tracejado `4 3` da `v4`, em vez de constante nomeada no topo e dos traços `3 3` e `4 4` do contrato. Sem consequência visível.
