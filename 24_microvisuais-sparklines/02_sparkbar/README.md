# Sparkbar

## O que é

Colunas verticais do tamanho de uma palavra, uma por período, com base sempre no zero e nenhum eixo. Codifica contagens discretas (agendas da semana, entradas do dia, fechamentos do mês) pela altura, e se lê pela forma da série e pela posição da coluna acesa, não pelo valor exato, que vem escrito ao lado. No Farol é um BarChart do Recharts com eixos escondidos e domínio declarado, uma cor por coluna para acender a atual, e animação por `useAnimateOnce`. O modelo absorve o sparkbar divergente, com o zero no centro e cor pela polaridade da métrica, a tabela de sparkbars em escala comum e as barras pareadas mini, que comparam o período atual com uma referência.

## Quando usar

* Contagens discretas por período ao lado de um KPI: agendas por semana, entradas por dia, fechamentos por mês, até cerca de 25 colunas em 100 px (piso de 3 px por coluna mais 1 px de vão).
* Variação com sinal em torno do zero, como variação mensal do CPL, na versão divergente.
* Coluna de tabela com a mesma série para 10 a 15 filas, em escala comum declarada no cabeçalho.
* Atual contra uma referência única (mês anterior, meta), em barras pareadas.

## Quando evitar

* Série longa que vira franja, como 52 semanas em 100 px: agregue o período ou use o sparkline de linha (`24_microvisuais-sparklines/01_sparkline-de-linha`).
* Leitura de valor com eixo e rótulo: use a família `03_colunas-verticais`.
* Resultado binário, sem magnitude: use o win/loss (`24_microvisuais-sparklines/07_win-loss`).
* Série que quase nunca cruza o zero: fique com a coluna simples, sem a versão divergente.
* Mais de dois períodos por linha nas barras pareadas: use as barras agrupadas (`02_barras-horizontais/02_barras-agrupadas`).

## Anatomia

1. **Colunas** do zero ao valor, com `barCategoryGap` de 30%, `maxBarSize` de 12 px e espessura efetiva acima de 3 px, em `--chart-1` na coluna acesa e `--text-muted` a 0,72 de opacidade nas demais.
2. **Eixos escondidos** (`XAxis hide`, `YAxis hide`) que só fixam o domínio: de 0 ao máximo, simétrico na divergente, comum à tabela na escala comum.
3. **Marca da coluna acesa**: ponto de contorno `--surface-raised` no topo (`ReferenceDot`), porque `--chart-1` contra `--text-muted` mede 1,12:1 no claro e a cor sozinha não destaca.
4. **Zero** em `ReferenceLine` com `ifOverflow="extendDomain"` na divergente; na tabela, o zero medido é um traço de 1 px em `--text-muted` e o valor pequeno ganha 1 px de altura mínima (na `v3`, cerca de 3,8 entradas na escala comum de 0 a 96).
5. **Anotação** curta de 11 px: colchete sobre a sequência de altas (`useXAxisScale` e `usePlotArea`) e a nota de recesso da tabela.
6. **Número e base** em HTML irmão com `kpi-number`, `formatInt`, `formatDate`, `formatMonthShort` e `formatPercent` sobre o valor absoluto com o sinal à mão.
7. **Frase acessível** na raiz, calculada do dado, com o gráfico em `aria-hidden`.

## Versões

* **`v1_agendas-por-semana-com-semana-atual`**: cartão de KPI com 16 colunas de agendas, a semana atual acesa e a posição dela na série.
* **`v2_variacao-mensal-do-cpl-divergente`**: variação mensal do CPL em colunas divergentes, cor pela polaridade (alta é pior) e colchete nas três altas seguidas.
* **`v3_filas-da-prevendas-em-escala-comum`**: tabela de 12 filas com sparkbar de 13 semanas na mesma escala, valor da última semana à direita e o zero do recesso como traço de 1 px.
* **`v4_barras-pareadas-com-origem-sem-mes-anterior`**: seis origens com barra atual em cima e a do mês anterior embaixo, na mesma escala, e uma origem nova sem base declarada.

## Como colar no Farol

1. Ligue `data` ao tipo exportado por `data.ts` da versão escolhida; o seletor da página monta esse objeto a partir do registry de métricas.
2. Em cartão de KPI (`v1`, `v2`), o pai do gráfico precisa de altura mínima explícita (`min-h-8` ou maior); sem ela o `ResponsiveContainer` desenha zero.
3. Na `v3`, calcule o domínio comum sobre o conjunto antes de passar os dados e deixe a célula com largura e altura fixas. Acima de cerca de 120 instâncias por tela, troque o Recharts por `rect` em SVG puro com a mesma geometria.
4. Na `v2`, passe `goodDirection` conforme a polaridade da métrica; a cor da coluna e o texto "alta do CPL é pior" seguem dele.
5. O estado vazio inline vira `EmptyState` do Farol, mantendo o sentido do texto.

## Referências

* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Palavra desenhada, em escala comum quando a comparação entre linhas importa.
* Implementação: [Recharts, BarChart](https://recharts.github.io/en-US/api/BarChart/) e [Recharts, ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/). Eixos escondidos e domínio declarado.
* Farol: `app/src/components/visuals/charts/chartTheme.ts` para `useAnimateOnce`; `01_cards-e-kpis/02_kpi-com-minigrafico-de-tendencia` como guia de anatomia do cartão.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada das quatro versões. A `v3` saiu reprovada pelo piso de altura das colunas, e o parecer está em `validation/revisao_24_microvisuais-sparklines__02_sparkbar_2026-10-05.md`. O que segue não reprova.

* `v1`: o ponto da semana atual tem o centro no valor e raio de 3,5 px, então a tinta da coluna acesa sobe até o equivalente a 35,4 agendas e passa 2 px acima da coluna de 34, enquanto o cartão escreve `3º de 16`; o contorno do ponto corta a coluna na altura de 30,1. O centro está certo e o número vem escrito ao lado, por isso não reprova. Melhoria: ponto por dentro do topo da coluna ou marcador sob a base, que não mexem na altura. Com valor atual pequeno o ponto pesa mais que a coluna.
* `v1`: o `meta.json` diz `animação desligada` e o código usa `useAnimateOnce`, que é o que a seção 5 do contrato manda. Corrigir o texto.
* `v1`, TOK-9: o `notes` cita 1,12:1 para `--chart-1` contra o neutro, que é a medida do `--text-muted` opaco. O par desenhado, com 0,72 de opacidade, mede 1,97:1 no claro e 2,84:1 no escuro. O neutro contra o cartão mede 3,04:1 no claro e 3,35:1 no escuro (ACE-5, medido à mão).
* `v1`, EIX-10: o tipo não tem como dizer que a semana atual está em curso. Ao colar com semana parcial, marcar a coluna e escrever `parcial até` com a data.
* `v1`, TIP-7: `truncate` na linha `média de 24,3 por semana`, que traz o número. Folga de cerca de 56 px no preview.
* `v2`: variação exatamente zero cai no ramo errado em três lugares. `signedPercent` escreve `−0,0%`, o ícone é a seta para cima e a cor é `--negative`; a coluna sai com 2 px acima do zero, em vermelho. O dado padrão não tem zero. Tratar o zero como estável, em `--text-secondary` e sem sinal, como a `v4` faz com `FLAT_THRESHOLD` (COR-6).
* `v2`: o rótulo do colchete fica 17,7 px à direita do centro do colchete. `NOTE_CHAR_WIDTH` de 6,2 px superestima a largura (o texto mede cerca de 165 px, 5,0 px por caractere) e a trava de borda dispara sem precisar.
* `v2`, ANO-2: a anotação usa `--text-secondary` e a regra pede `--text-muted`. Sem consequência no preview.
* `v2`: o `notes` diz que a variação exata do mês quase parado está na frase acessível, e a frase só traz o último mês. O −0,3% de mar/26 não aparece em lugar nenhum.
* `v2`: `goodDirection` é campo do dado, não prop, ao contrário do que dizem o `meta.json` e o passo 4 de `Como colar no Farol`.
* `v2`, NUM-4: a base da variação é nomeada só pelo mês (`contra jul/26`), porque o dado não traz o CPL em reais.
* `v2`: o render gravou PNG de diferença nos dois temas, o que ele só faz acima de 0,5%. Réplica à mão com tolerância de 48 por canal: 0,56% no escuro e 0,58% no claro, abaixo do erro de 2%. Dois terços dos pixels estão no subtítulo da moldura `stage` e o resto em `alta do CPL é pior`: o serializador desloca meio pixel o texto que vem depois de `CPL`. Dentro do cartão a diferença é de 0,19% e 0,21%. É da ferramenta, não do componente.
* `v3`, NUM-6: `Última` e `máx. 96` não levam substantivo. `Última semana` e `máx. 96 entradas` fecham.
* `v3`: `row.entries[index] ?? 0` e `sumOf(row.entries) ?? 0` transformam fila com menos semanas que a tabela em zero medido, com o traço do recesso no desenho e `com 0` na frase; a célula da última semana fica vazia em vez de `formatUnavailable()`. O dado padrão não tem esse caso. O tipo pode aceitar `number | null` (EST-1b, EST-2).
* `v3`: o nome da fila e o sparkbar ficam a cerca de 300 px um do outro nas filas de nome curto (`Webinars`), sem guia. Coluna de nome na largura do maior nome aproxima os dois.
* `v3`, ANO-2: a nota do rodapé tem 77 caracteres.
* `v4`: na origem sem base a segunda linha da coluna `Leads` fica vazia e some, e o `29` sai centrado na linha, 6 px abaixo de onde os outros valores atuais ficam em relação à barra de cima.
* `v4`, DAD-10: o comentário do `data.ts` promete uma origem estável (61 contra 62), mas o limiar de 0,5% a escreve como `−1,6%` em vermelho e a frase a conta entre as que caíram. O ramo `estável` não aparece com o dado padrão.
* `v4`: mês anterior igual a zero deixa a variação vazia sem dizer por quê. O dado padrão não tem esse caso.
* `v4`, ESP-2 e ESP-3: `barCategoryGap` de 0 e margem escrita na própria linha, sem constante no topo. O respiro vem do vão de 8 px do grid. Sem consequência no preview.
* `v4`: sobram cerca de 34 px no pé do corpo.
* `v4`: a frase acessível diz quantas origens cresceram e não quais, que é o que o caso de uso pergunta.
* `v4`: o aviso `CONTRASTE-MARCA` do check (barra do mês anterior em `--line-strong`, 1,79:1 e 1,83:1) é esperado. Vale a isenção da tabela 17.2, porque o valor do mês anterior está escrito na mesma linha.
* `v2`, `v3` e `v4`, TIP-1: há algarismo em Manrope sem `tabular-nums` em linha de apoio (`contra jul/26` e a anotação em SVG da `v2`, a data do rodapé da `v3`, o cabeçalho `em cima ago/26, embaixo jul/26` da `v4`). Linha única, sem coluna a alinhar; sem consequência no preview.
* README, `Anatomia`: o item 1 dá `--text-muted` a 0,72 como cor das demais colunas, e isso só vale na `v1`. O item 4 fala em 2 px de altura mínima na tabela, e a `v3` usa 3 px.
* Ferramenta: a guarda `OPACIDADE-MARCA` respondeu `sem_opacidade_em_marca` na `v1`, que tem `fillOpacity` no `Cell` por expressão. A medida da ACE-5 foi feita à mão.

Revisão de 2026-10-05, segunda passada, só da `v3`, sobre o arquivo corrigido. A `v3` saiu aprovada. Medido no `preview.svg` dos dois temas: `MIN_COLUMN_HEIGHT` de 1 px, 16 das 144 colunas positivas no piso (as 12 de `Cadastro manual da recepção` e 4 de `Webinars`, todas de 1 a 3 entradas), nenhuma fila igual a outra, coluna de 96 ocupando os 25 px da escala e base comum em todas as células. Deixam de valer, do parágrafo anterior, a reprovação da `v3` e a linha que dizia que o item 4 da `Anatomia` falava em 2 px. O que segue não reprova.

* `v3`: seguem sem correção as observações da primeira passada: substantivo em `Última` e em `máx. 96` (NUM-6), `?? 0` em fila com menos semanas que a tabela e célula vazia no lugar de `formatUnavailable()` (EST-1b, EST-2), distância entre o nome e o sparkbar, nota do rodapé acima de 50 caracteres (ANO-2; são 76) e data do rodapé sem `tabular-nums` (TIP-1).
* `v3`: em `Cadastro manual da recepção` o traço do zero e as 12 colunas positivas têm a mesma altura de 1 px. O que separa os dois é a largura (11 px contra 5 px) e a cor, e no tema claro as duas cores medem 1,12:1 entre si (1,82:1 no escuro), então quem carrega a distinção é a largura. Não reduzir `ZERO_MARK_OVERHANG`.
* `v3`: o `rx={1}` continua na coluna com menos de 2 px de altura e o canto tira cerca de 9% da tinta do traço de 5 por 1 px. O traço aparece nos dois temas. Tirar o raio abaixo de 2 px deixa a marca inteira.
* `v3`: o nome e o valor ficam centrados na linha de 32 px e as colunas assentam na base da célula. Nas filas de 1 a 3 px o traço fica 13 px abaixo do centro do próprio nome, cerca de 8 px sob ele e 14 px acima do nome seguinte. Alinhar o texto pela base da célula aproxima o traço do nome dele.
* `v3`: o período das 13 semanas não aparece na tela nem na frase acessível. Só a data do recesso ancora o eixo, e `Última` não diz de que semana é. Cabe no cabeçalho, com `formatDate`.
* `v3`: a frase acessível tem 183 caracteres e não cita a semana de recesso, que para quem ouve não existe. Há folga até 250.
* `v3`, TIP-4: o `96` do cabeçalho usa `kpi-number` sem peso declarado e herda 400, que a Space Grotesk não tem carregado. O navegador desenha com 500, que é o que a tabela 17.1 pede. Declarar `font-medium`.
* `v3`: o comentário da linha 25 do `Chart.tsx` e o `notes` do `meta.json` dão 4,7 px de espessura, e o preview desenha 5 px, com vão de 6,69 px entre colunas.
* `v3`, ESP-1: `MARGIN.bottom` de 1 px e `ZERO_MARK_OVERHANG` de 3 px são ímpares. Sem consequência no preview.
* `v3`: o comentário do `data.ts` diz `de 2 a 96 por semana`, e o menor valor positivo do dado é 1.
* Ferramenta: a guarda `ESPESSURA-MARCA` informou 1 px na `v3`, que é a altura do traço do zero e das colunas no piso. A espessura da coluna é 5 px. A guarda mede o menor lado do retângulo, e em coluna baixa esse lado é a altura.
