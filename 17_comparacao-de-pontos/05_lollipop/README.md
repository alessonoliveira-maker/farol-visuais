# Lollipop

## O que é

Barra reduzida a uma haste fina com um disco na ponta: a haste mantém a âncora no zero ou numa referência, e o disco chama a atenção para o valor. Fica entre a barra, que ancora no zero, e o dot plot, que abandona a âncora; por isso o eixo começa obrigatoriamente no zero. Nas quatro versões o desenho é um `Bar` do Recharts com `shape` própria que desenha haste e disco no mesmo retângulo, o que garante os dois alinhados e trata largura negativa. O centro do disco é o valor e o olho lê a borda, então valores próximos parecem empatados: ordene sempre e mantenha o raio perto de 5,5 px.

## Quando usar

- Ranking de uma contagem ou valor a partir do zero, de 8 a 25 categorias, com mais ar que a barra (`v1`).
- Categorias com ordem natural, como semana, e rótulo curto: versão vertical, com referência de teto (`v2`).
- Desvio com sinal contra uma referência, com a coluna de rótulos fixa à esquerda: versão divergente com 18 áreas (`v3`).
- Duas séries por categoria mantendo a âncora no zero, com zero medido e ausência distintos (`v4`).
- Valores todos altos e parecidos, em que barras cheias virariam bloco.

## Quando evitar

- A decisão depende de distinguir valores próximos: barra da família 02 ou 03.
- Escala que não começa no zero: haste cortada é mentira estrutural, use dot plot (17/01).
- Pergunta de razão entre duas séries (A é o dobro de B): barras agrupadas (02/02).
- Mais de duas séries ou barra de erro pendurada no disco: dot plot com intervalo (17/02).
- Rótulo de categoria que precisaria girar 45 graus na vertical: use a versão horizontal.

## Anatomia

1. `Bar` com `shape` própria: `line` de 2 px (`STEM_WIDTH`) e `circle` de raio 5,5 (`DISC_RADIUS`), com a ponta lida de `x + width` ou do topo normalizado por `Math.min`.
2. Eixo de valor ancorado no zero: oculto quando o valor vem escrito (`v1`, `v3`, `v4`) e com grade só na direção da leitura quando o eixo fica (`v2`).
3. Rótulo direto de valor na ponta livre, em `font-display`, com `formatInt` ou `formatCurrency` e sinal à mão com o menos tipográfico (NUM-3).
4. Referência: `ReferenceLine` com `ifOverflow="extendDomain"`, o teto em `--text-muted` com 3:1 (`v2`) e o orçado em `--text-secondary` (`v3`), rótulo na margem reservada.
5. Cor pela polaridade: `--negative` para o que passa do teto e para o custo acima do orçado, `--positive` para o custo abaixo, `--chart-1` para a série única (COR-1, COR-6).
6. Período parcial: disco vazado e haste tracejada (`v2`, EIX-10).
7. Zero medido e ausência: zero é só o disco sobre a base, ausência é só texto no lugar do disco, lida do `null` do payload porque o `shape` do pacote não recebe o `null` (REC-11) (`v4`).
8. Linha de leitura calculada do dado, legenda por amostra na forma da marca e nota no rodapé quando há exceção.
9. Dica por `ChartTooltip` só com o que o corpo não escreve: participação (`v1`), distância do teto (`v2`), orçado e realizado (`v3`), variação (`v4`).

## Versões

- `v1_agendas-por-sdr-no-mes`: 8 SDRs, agendas de agosto em ordem decrescente. Demonstra a haste de 2 px com disco de 5,5 px, o eixo no zero e o valor à direita.
- `v2_entradas-por-semana-contra-o-teto`: 16 semanas contra um teto de 60. Demonstra o lollipop vertical, o disco em negativo acima do teto com o excedente escrito e a semana parcial vazada.
- `v3_desvio-de-custo-contra-o-orcado-por-area`: 18 áreas com desvio de custo por unidade entregue. Demonstra o `shape` com `Math.min` e `Math.abs`, o zero forte rotulado, o domínio simétrico e o sinal no rótulo.
- `v4_leads-por-plataforma-com-zero-e-ausente`: 4 plataformas em dois meses. Demonstra os dois `Bar` irmãos com `barGap` menor que a folga entre categorias, o zero medido como disco e a ausência como texto.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página.
2. Troque o `import` do `./data` pelos dados reais; teto, polaridade (`goodDirection`) e meses vêm da métrica, não do `data.ts`.
3. O domínio do eixo de valor precisa continuar começando no zero. Em `v2`, o teto de domínio é calculado do dado em passos de 20; em `v3`, o domínio simétrico vem do maior desvio, e no Farol pode vir do registry de métricas.
4. Mais linhas pedem mais altura: `v1` e `v3` declaram `ROW_STEP` e derivam a altura do número de linhas.
5. Na `v4`, a marca de ausência cresce para a folga entre plataformas; nome de mês mais longo pede mais folga entre categorias.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, Bar com shape própria](https://recharts.github.io/en-US/api/Bar/): retângulo recebido por `shape`, que pode vir com largura ou altura negativa.
- Few, S. *Show Me the Numbers*: a haste mantém a comparação por comprimento que o disco sozinho perderia.
- Estudo da família: `_estudo/familias/17_comparacao-de-pontos.md`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, as quatro versões julgadas pela primeira vez e aprovadas. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3` e `v4`: a linha de leitura tem `truncate` e não passa nas duas condições da TIP-7. Na `v1` a distância para o segundo colocado e o nome dele ficam na cauda e fora da frase acessível; na `v2` e na `v3` a cauda carrega o número do maior estouro; na `v4` a cauda carrega a variação e o total, que também não estão na frase acessível. Nos canvases declarados cabe sem corte, com folga medida de 30 px na `v1`, 40 px na `v4`, 92 px na `v3` e 390 px na `v2`.
- `v1`: com empate no 2º lugar (36 e 36), a linha de leitura cita só o primeiro nome em ordem alfabética, "5 à frente de Ana Beatriz Cavalcanti", e cala o outro empatado.
- `v1`: a dica escreve "Parte do time" com uma casa decimal, e a NUM-1 pede percentual de composição inteiro.
- `v1` e `v3`: `NAME_AXIS_WIDTH` é constante dimensionada para o maior nome do dado fixo (125 px em 148 px na `v1`, 144 px em 168 px na `v3`), e o "Como colar no Farol" não avisa que nome mais longo pede coluna maior.
- `v2`: o traço do teto é sólido de 1,5 px, e a tabela 17.2 pede 1 px tracejado `3 3`; o tracejado ficou para a haste da semana parcial, em `3 3` onde a EIX-10 cita `4 4`. Os dois se leem sem confusão nos dois temas.
- `v2`: a linha do teto é pintada por cima das marcas. O disco da semana que fecha exatamente em 60 aparece riscado ao meio, e o da semana de 62 tem a borda de baixo coberta pelo traço. A cor e o rótulo de excedente mantêm a leitura; pintar a referência por baixo dos discos fecha o caso.
- `v2` e `v4`: número sem o substantivo (NUM-6). Na `v2`, os tiques do eixo de valor, o rótulo do teto ("60 por semana") e os rótulos de excedente (`+3`); na `v4`, os rótulos sobre os discos. A unidade se lê na linha de leitura e na dica.
- `v2`: a semana parcial nunca conta como estouro (`exceedsCap` a exclui), mesmo que o parcial já tenha passado do teto. Nesse recorte o disco vazado ficaria acima da linha sem cor de estouro nem rótulo de excedente.
- `v2`: o rótulo da semana sai de `formatDate(week).slice(0, 5)`, corte de texto sobre a saída do formatador, que quebra em silêncio se o formato da data mudar.
- `v3`: a legenda vem na ordem acima, abaixo e no orçado, e as marcas se leem de cima para baixo como acima, no orçado e abaixo (ROT-4). Cada item da legenda tem o texto ao lado da amostra.
- `v3`: o `useCase` do `meta.json` perdeu o "no trimestre" do catálogo, e o período não aparece no cartão nem na frase acessível (DAD-9). A nota do `meta.json` conta o caso de uso em uma linha e o preview o quebra em duas; a conta do corpo continua fechando, com cerca de 30 px de sobra no pé.
- `v3`: o corpo escreve o desvio só como "R$", e o "por unidade entregue" fica no subtítulo do cartão e na dica.
- `v3`: nos desvios pequenos o disco engole a haste. Em `−R$ 0,30` o centro fica a 3,7 px do zero e o disco cruza a linha do orçado; em `+R$ 0,60` sobram 2 px de haste. O sinal do rótulo e o lado decidem a leitura, e é o limite que o "O que é" já declara para valores próximos.
- `v3`: entre o nome e a marca há até 311 px sem guia (linha `Compras`), em 18 linhas de 18 px. Seguir a linha com o olho pede atenção nos nomes curtos.
- `v4`: a marca "sem veiculação" parte da borda esquerda da fatia do mês e mede 55 px. Na fatia de agosto ela cresce para a folga entre plataformas; com `july: null`, que o tipo aceita, ela cruzaria a haste de agosto da mesma plataforma, que fica a 30 px. O dado fixo só tem ausência em agosto, e o preview está limpo.
- `v4`: a nota do rodapé e a frase acessível só contam ausência e zero de agosto. Ausência ou zero em julho seriam desenhados e não narrados.
- `v4`: cada fatia mede 26 px e os dois rótulos de valor ficam a 30 px um do outro. Contagem de quatro algarismos com ponto de milhar, cerca de 31 px, colidiria em alturas parecidas, e o "Como colar no Farol" só avisa do nome de mês longo.
- `v1`, `v2` e `v4`: número em Manrope sem `tabular-nums` (TIP-1). É o "ago/26" da linha de leitura da `v1`, a data da legenda da `v2` e, na `v4`, o "26" e o "669" da linha de leitura, os meses da legenda e o rodapé. Sem consequência visível.
- `v4`: o canvas `card` deixa 79 px de altura para as hastes depois do caso de uso em duas linhas, da linha de leitura, da legenda e do rodapé em duas linhas, e a haste de 54 leads mostra 4 px abaixo do disco. Legível; canvas por número daria mais corpo (GEO-1).
- `v4`: `ABSENT_LINE_STEP = 13` foge dos múltiplos de 2 px da ESP-1. Sem consequência visível.
