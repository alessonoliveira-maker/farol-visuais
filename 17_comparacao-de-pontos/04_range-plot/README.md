# Range plot

## O que é

Dois valores por categoria ligados por uma barra grossa de pontas arredondadas, com a ênfase na distância entre eles e não em qual veio antes: não há cabeça de início nem de fim, só extremos. Neste modelo a faixa é uma barra flutuante, feita por uma base invisível empilhada que vai do zero ao menor valor e por uma barra de largura igual a maior menos menor, desenhada como cápsula por `shape` própria. Com marcador interno, a faixa ganha um traço forte do valor atual; girada, vira colunas de faixa quando a categoria tem ordem natural, como semanas. O subtítulo declara o que a faixa é, porque o leitor treinado lê barra com dois extremos como intervalo de confiança.

## Quando usar

- A distância entre dois valores é a notícia, como CPL bruto contra CPL qualificado por origem.
- Mínimo e máximo observados por categoria, com o método escrito no subtítulo (`v1`).
- Faixa com um valor atual dentro ou fora dela, contra um teto comum a todas as linhas (`v3`).
- Colunas de faixa quando a categoria tem ordem natural, até cerca de 26 períodos (`v4`).
- Até 25 linhas no cartão largo, ordenadas pela amplitude.

## Quando evitar

- Os valores das pontas importam mais que a distância: dot plot (17/01).
- Existe um antes e um depois: dumbbell ou arrow plot (17/03).
- Incerteza estatística em torno de um ponto central: dot plot com intervalo (17/02).
- Valor contra meta com faixas qualitativas de fundo: bullet chart (13/02); cenário contra meta: faixa de cenário (13/07).
- Tarefa com início e fim no calendário: família 20 de cronograma.
- Faixa de extremos numa amostra com outlier: um caso sozinho alarga tudo, prefira quartis (17/02).

## Anatomia

1. Base invisível: `Bar` com `dataKey` do menor valor, `fill="none"` e o mesmo `stackId` da faixa (REC-8).
2. Faixa: `Bar` com `dataKey` da largura (maior menos menor) e `shape` própria; o raio é a metade da menor dimensão, para a cápsula não deformar.
3. Rótulos das duas pontas por dois `LabelList` que leem o menor e o maior do próprio dado, o da direita ancorado em `x + width` (ROT-2), com halo em `--surface-raised`.
4. Eixo de valor com domínio e tiques calculados do dado (`niceScale`), `formatCurrencyAxis` ou `formatPercentFromScale100`, e grade só na direção da leitura.
5. Destaque em `--chart-2` só na faixa de maior distância, demais em `--text-muted`, que passa de 3:1 como marca (`v2`).
6. Largura zero como ponto com anel e nota, nulo como ausência escrita, nunca como zero (`v2`, `v4`).
7. Traço da semana atual por regra de três sobre `usePlotArea`, com halo, seta de transbordo e coluna escrita à direita (`v3`).
8. `ReferenceLine` com `ifOverflow="extendDomain"` e o valor escrito em texto (`v3`, `v4`).
9. Dica com o que o corpo não escreve (amplitude, volume, situação), por `ChartTooltip`.

## Versões

- `v1_amplitude-de-ticket-por-segmento`: 5 segmentos, menor e maior ticket das vendas ganhas. Demonstra a base invisível empilhada, o raio limitado, o subtítulo que declara a faixa e a ordem pela amplitude.
- `v2_distancia-entre-cpl-bruto-e-qualificado`: 14 origens de lead. Demonstra a ordem pela largura, o destaque único em `--chart-2`, o fator 4,1 vezes e a faixa de largura zero como ponto com anel.
- `v3_carga-das-filas-com-semana-atual-e-teto`: 9 filas em % do teto. Demonstra o traço da semana atual por regra de três, a linha de teto em 100% e a seta de transbordo.
- `v4_colunas-de-faixa-de-entradas-por-semana`: 26 semanas em colunas. Demonstra a semana sem coleta, a faixa nula como traço com anel e a capacidade diária.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página.
2. Troque o `import` do `./data` pelos dados reais; em `v3`, o fim do eixo (150% no mínimo, esticado em múltiplos de 50 se a faixa passar disso, calculado em `domainEnd` e usado no eixo e nos traços) e os tiques vêm da métrica, e em `v4` a capacidade vem da prop `capacity`.
3. Mantenha a base invisível e a faixa no mesmo `stackId`, e o menor valor nunca negativo: a pilha sem `stackOffset="sign"` não serve para faixa que cruza o zero.
4. Mais linhas pedem mais altura: cada versão declara `ROW_STEP` e o corpo precisa de `linhas × ROW_STEP` mais o eixo.
5. Deixe o nulo como `null`: no `v4` o `shape` o recusa pelo payload, porque a pilha o entrega como altura zero.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, Bar](https://recharts.github.io/en-US/api/Bar/): barra empilhada e `shape` própria.
- Armadilhas `REC-8` (pilha e zero), `REC-3` (ordem do eixo de categoria), `REC-1` (referência fora do domínio) e `REC-11` (zero medido).
- Nenhum formatador novo foi pedido ao Farol.
- Estudo da família: `_estudo/familias/17_comparacao-de-pontos.md`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada. `v1`, `v2` e `v4` aprovadas; `v3` reprovada, com o bloqueante em `validation/revisao_17_comparacao-de-pontos__04_range-plot_2026-10-05.md`.

- `v1` e `v2`, ROT-2: os dois extremos estão escritos nas pontas e o eixo de valor com grade continua desenhado. Não há leitura falsa, mas a regra manda sair eixo e grade quando o valor está escrito; o halo dos rótulos da esquerda corta a linha de grade do zero.
- `v1` e `v2`, ROT-9: o rótulo do menor valor nasce à esquerda da cápsula e entra na coluna dos nomes quando o mínimo fica perto do zero (na `v2`, `R$ 6,40` começa 27 px antes do zero do eixo). Com o dado padrão sobram mais de 20 px até o nome; num recorte com nome longo e mínimo baixo os dois se tocam.
- `v1`, ACE-1: a frase acessível mede 235 caracteres, a 15 do teto, e cresce com o nome do segmento (aviso do check).
- `v2`, pergunta 21: o render mediu 0,52% de diferença entre o SVG e a página nos dois temas, acima dos 0,5% da pergunta e abaixo dos 2% em que a ferramenta reprova. A diferença está toda no texto do caso de uso e da linha de método depois da palavra CPL, deslocado na horizontal; nenhuma marca diverge.
- `v2`, NUM-1 e DAD-1: a nota `100% qualificado` é texto fixo, sem o volume (100 de 100 leads só aparece na dica), e é escrita quando a distância arredondada ao centavo dá zero, o que pode acontecer com taxa abaixo de 100%. Derivar a nota de `qualifiedLeads === leads` e escrever com `formatRateWithVolume`.
- `v2`, NUM-1: os rótulos usam `formatCurrency` com centavos, que a regra reserva à tabela de detalhe. Aqui o centavo separa `R$ 8,53` de `R$ 9,75` e a escolha se sustenta; vale declarar no `meta.json`.
- `v2`: a nota em 11 px na ponta da faixa fica cerca de 1 px abaixo da linha do valor, porque o `tspan` troca de fonte dentro do mesmo `text`.
- `v3`, DIC-1: `Reativação de base` tem 6 de 8 semanas medidas e isso só aparece na dica, enquanto a legenda afirma `Faixa das últimas 8 semanas` para todas as filas. É justamente a fila do transbordo; marcar a linha de amostra menor no desenho.
- `v3`, TIP-4: o rótulo `teto de cada fila, 100%` vai em `font-display` sem `fontWeight`, e o peso 400 não é carregado para essa família; declarar 500.
- `v3`, TIP-3: o peso 700 vai em toda fila acima do teto, duas no dado padrão; com três ou mais filas acima passa do limite de dois elementos.
- `v3`: a ponta da seta de transbordo para a 6 px do `172%` da coluna da direita. Legível, mas sem folga.
- `v4`, ANO-3 e REC-4: o rótulo `capacidade diária: 48 entradas` fica dentro da área de plotagem, sobre as cinco primeiras semanas, e não em margem reservada. Com o dado padrão não toca em nada (as colunas param em 44 e o texto começa perto de 50); num recorte que comece acima da capacidade o halo do rótulo corta as colunas.
- `v4`, TOK-10: a linha tracejada da capacidade em `--text-muted` some dentro das colunas que a atravessam e só se lê entre elas. A leitura de quais semanas passam continua clara.
- `v4`: a marca `sem coleta` tem altura fixa junto da base; uma semana vizinha com mínimo abaixo de 10 entradas encostaria no texto, e o halo cortaria a coluna.
- `v4`: o `de 5` dos dias com coleta na dica é constante escrita dentro do texto; nomear no topo do arquivo.

Revisão de 2026-10-05, segunda passada, só a `v3` depois da correção. Aprovada: o fim do eixo agora sai de `domainEnd` e o mesmo número vai para o `XAxis`, para os tiques e para a regra de três do traço e do rótulo do teto, então o bloqueante da primeira passada (EIX-9, ANO-3, REC-1) está fechado. As quatro observações da `v3` acima continuam valendo.

- `v3`, redação do `meta.json`: a nota (3) ainda descreve o desenho anterior, com `valor / 150 x largura`, domínio fixo de 0 a 150 e tiques iguais em todo recorte. O código atual estica o eixo em múltiplos de 50 quando a faixa passa de 150; no dado padrão o fim continua 150 e nada muda na tela. Atualizar a nota para o que `domainEnd` faz.
- `v3`: fila com menor e maior iguais entrega cápsula de largura zero, que não desenha nada, e sobra só o traço da semana atual. O dado padrão não tem esse caso; a `v2` resolve com ponto com anel e vale copiar.
- `v3`: a seta de transbordo só nasce quando a semana atual passa do fim do eixo, e não em toda semana atual acima do máximo da faixa, como a linha do catálogo sugere. O traço fora da cápsula já diz que saiu da faixa e o `meta.json` descreve o comportamento real; a redação do catálogo pode ser alinhada.
