# Sparkline de linha e área

## O que é

Uma polilinha do tamanho de uma palavra, sem eixo, grade, legenda nem dica, colada ao número que ela explica. Lê-se a forma, a direção e a ruptura da série, nunca o valor exato. No Farol é um LineChart, AreaChart ou ComposedChart do Recharts com margem mínima, ponto desligado (ligado só nas marcas que importam) e animação por `useAnimateOnce`. O modelo absorve as variações que acrescentam uma única camada ao traço: pontos de valor final e de extremos, faixa de normalidade com fonte declarada, cauda de projeção tracejada com faixa de cenário e área preenchida quando o zero é base legítima. A escala é sempre declarada: própria dentro do cartão ou comum a toda a tabela.

## Quando usar

* Série contínua de 12 ou mais meses, ou de 20 ou mais dias úteis, ao lado de um KPI de cartão, numa caixa de cerca de 330 por 90 px.
* Coluna de tabela com uma série por linha (18 meses em 220 por 28 px), quando a pergunta é quais linhas mudaram de comportamento.
* Julgar se o valor de hoje está dentro do esperado, com faixa de origem declarada (SLA contratado).
* Mostrar realizado e previsto no mesmo traço, com a projeção tracejada e a faixa de cenário que a Diretoria pede.

## Quando evitar

* Menos de 8 pontos: vira ruído. Mostre o número com comparação (`01_cards-e-kpis/01_kpi-simples`); a versão da tabela escreve indisponível e série curta.
* Leitura de valor exato, com eixo e dica: linha simples (`04_linhas-e-series-temporais/01_linha-simples`).
* Valores discretos e contáveis por período: sparkbar (`24_microvisuais-sparklines/02_sparkbar`).
* Mais de duas séries na mesma caixa: linha com múltiplas séries (`04_linhas-e-series-temporais/02_multiplas-series`).
* Resultado binário por período: win/loss (`24_microvisuais-sparklines/07_win-loss`).
* Área preenchida em série que não parte do zero: fique com a linha, porque a área exagera a variação (EIX-2).

## Anatomia

1. **Traço** em `--chart-1`, 2 px (1,5 px na célula de tabela), sem ponto, com `type="monotone"` no realizado e `linear` na projeção.
2. **Domínio** declarado em `YAxis hide`: do mínimo ao máximo com folga de 8% (linha), de 0 ao maior valor da tabela (área) ou de 0 ao maior valor com a faixa (SLA).
3. **Pontos de exceção**: final em `--chart-1`, extremos em `--text-muted`, fora da faixa em `--negative`, sempre com contorno `--surface-raised`.
4. **Faixa de referência** em `ReferenceArea` com `--surface-sunken`, declarada antes do `Line` para ficar atrás, com a fonte escrita ("SLA contratado").
5. **Cauda de projeção**: previsto tracejado, trajetória necessária em `--text-muted` tracejada 3 3, `ReferenceLine` no hoje e `Area` de `[baixo, alto]` em `--surface-sunken`.
6. **Área** em `--chart-1` a 0,66 de opacidade (piso da ACE-5) sob o traço, com `null` e `connectNulls` desligado para a falha de coleta quebrar traço e área.
7. **Número e base** em HTML irmão (`kpi-number`, `formatCurrencyCompact`, `formatHours`, `formatMonthShort`), fora do SVG.
8. **Frase acessível** na raiz, calculada do dado, com o gráfico em `aria-hidden`.

## Versões

* **`v1_receita-com-extremos-e-valor-final`**: sparkline de 12 meses em cartão de KPI, domínio do mínimo ao máximo com folga, ponto final aceso, melhor e pior mês em tom neutro e a distância do melhor mês escrita.
* **`v2_tempo-de-resposta-com-faixa-de-sla`**: sparkline de 20 dias úteis com a faixa do SLA atrás, ponto só nos três dias fora da faixa e a contagem escrita no rodapé.
* **`v3_meta-2027-com-cauda-de-projecao`**: seis cartões com realizado cheio, projeção tracejada, faixa de cenário recortada, trajetória necessária e linha do hoje.
* **`v4_origens-em-area-com-lacuna-de-coleta`**: tabela de 10 origens com área por linha em escala comum, mês sem coleta como interrupção e origem de série curta sem traço.

## Como colar no Farol

1. Ligue `data` ao tipo exportado por `data.ts` da versão escolhida; o seletor da página monta esse objeto a partir do registry de métricas.
2. Em cartão de KPI, o pai do gráfico precisa de altura mínima explícita (`min-h-8` ou maior); sem ela o `ResponsiveContainer` desenha zero.
3. Na tabela da `v4` e na grade da `v3`, calcule o domínio comum sobre o conjunto antes de passar os dados, para a comparação entre linhas valer (EIX-9). Acima de cerca de 120 instâncias por tela, troque o Recharts por path em SVG puro com a mesma geometria.
4. O estado vazio inline vira `EmptyState` ou `UnavailableState` do Farol, mantendo o sentido do texto.

## Referências

* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Palavra desenhada, ponto final ligado ao número.
* Implementação: [Recharts, TinyLineChart](https://recharts.github.io/en-US/examples/TinyLineChart/) e [Recharts, ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/). Esqueleto sem eixos e faixa de referência.
* Catálogo: [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/). Definição e limites de uso.
* Farol: `app/src/components/visuals/charts/chartTheme.ts` para `useAnimateOnce`; `01_cards-e-kpis/02_kpi-com-minigrafico-de-tendencia` como guia de anatomia do cartão.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada. `v2` aprovada; `v1`, `v3` e `v4` reprovadas, com os bloqueantes em `validation/revisao_24_microvisuais-sparklines__01_sparkline-de-linha_2026-10-05.md`.

* `v1`, TIP-7: a base da variação (`contra R$ 1,6 mi em set/25`) e o trecho `melhor mês mar/26, R$ 2,3 mi` levam `truncate` com o número na cauda, e o `R$ 1,6 mi` não está na frase acessível. No canvas `kpi-alto` sobram 91 e 88 px; defeito latente.
* `v1`, DAD-9: o mês do valor em destaque (`ago/26`) só existe na frase acessível; o corpo mostra `R$ 2,1 mi` sem dizer de que mês.
* `v1`: o ponto do pior mês (`out/25`) não tem nome nem valor no cartão nem na frase; lê-se como extremo só pela posição.
* `v1`: o `meta.json` foi realinhado ao código (margem lateral de 6 px, `useAnimateOnce`).
* `v1` e `v2`: `MIN_POINTS = 3` segue a EIX-11, mas o modelo diz que abaixo de 8 pontos a sparkline vira ruído; entre 3 e 7 pontos a linha ainda é desenhada. Limiar a decidir.
* `v2`, COR-6: a contagem do rodapé vai sempre em `text-negative` com peso 600. Com zero dia fora do SLA, que é o estado desejado da métrica, o texto `0 de 20 dias fora do SLA` sairia vermelho. O dado padrão tem 3 dias fora e a foto está certa; o defeito mora no ramo. Trocar para `text-text-secondary` quando a contagem for zero.
* `v2`, TIP-7: a linha de apoio leva `truncate` e o limite do SLA (`4 h`) é a última coisa dela; sobram 26 px no canvas `kpi-alto`.
* `v2`, redação do `meta.json`: o terceiro item diz que o rodapé traz o limite com `formatHours`; o limite está na linha de apoio acima do gráfico, e o rodapé traz a contagem e o período.
* `v2`: o tipo aceita dia sem medição (`null`) e o traço quebra, mas nada escrito conta os dias não medidos. O dado padrão não tem nenhum.
* `v2`: o comentário da `ReferenceArea` diz que a ordem do documento é a ordem de pintura. No Recharts 3 quem decide é o `zIndex` por tipo (REC-13, emenda de 2026-09-29); aqui o resultado coincide, e na `v4` não.
* `v3`, ACE-5: a `Area` da faixa de cenário não declara `fillOpacity` e herda 0,6 do pacote, então `--surface-sunken` mede 1,09:1 no claro e 1,10:1 no escuro, contra 1,15:1 da faixa da `v2`. Fecha junto com o bloqueante da seta.
* `v3`: a faixa de cenário é o único lugar em que o intervalo aparece (não há valor escrito) e fica no tom de poço por desenho do modelo. Um contorno fino em `--text-muted` nas bordas baixa e alta daria 3:1 sem pesar o fundo. Melhoria possível.
* `v3`, TIP-7: o nome da linha de receita leva `truncate` ao lado do selo que não encolhe (36 px de folga em `Serviços de implantação`), e o rodapé de projeção e meta também, com valores que não estão na frase acessível (69 px de folga).
* `v3`: o rodapé nomeia a faixa, o tracejado cinza, a linha vertical e a seta, e não nomeia o traço cheio (realizado) nem o tracejado da cor da série (projeção natural). Lê-se por eliminação.
* `v3`, ACE-1: a frase acessível começa pela contagem (`6 miniaturas`), escrita com `String` e não com `formatInt`; a regra pede começar pelo tipo. Com nenhuma linha abaixo da meta a frase termina em dois pontos seguidos de ponto.
* `v3`: linha de receita sem mês futuro é descartada por `buildCard` sem aviso e sai da contagem da linha de leitura. O dado padrão não tem esse caso.
* `v3`, 17.7: os seis cartões usam `p-3` (12 px) e a tabela pede 16 px no cartão próprio da moldura `stage`. Sem consequência no preview.
* `v4`, TIP-7: o nome da origem leva `truncate` numa coluna de 144 px; o cabeçalho passou a `Leads/mês, escala comum 0 a 560`, que cabe, mas o teto de quatro dígitos ainda fica na cauda.
* `v4`: `Chat do site` tem 6 meses medidos e a célula de total fica vazia, enquanto o rodapé diz que o total soma os meses medidos. Escrever o total dos 6 meses ou `formatUnavailable()` na célula.
* `v4`, NUM-6: o cabeçalho `Total` não leva o substantivo; `Total de leads` fecha.
* `v4`: os 48% da linha de leitura usam totais que não contam os meses sem coleta nem a origem de série curta. O rodapé declara o primeiro recorte e cala o segundo; com o dado padrão o percentual não muda.
* Nas quatro versões, TIP-1: há algarismo em Manrope sem `tabular-nums` na linha de apoio ou de leitura (`set/25` na `v1`, `20 dias úteis` na `v2`, a linha de leitura da `v3` e da `v4`, o rodapé da `v4`). Linha única, sem coluna a alinhar; sem consequência no preview.
* README, `Quando usar`: a caixa da sparkline no cartão de KPI mede 294 por 39 px no preview da `v1` e da `v2`, e não cerca de 330 por 90 px.

Revisão de 2026-10-05, segunda passada. `v1`, `v3` e `v4` aprovadas depois da rodada de correção: os sete bloqueantes da primeira passada foram conferidos no arquivo atual e nos dois PNGs, e nenhum resta. As observações da primeira passada continuam valendo, menos duas que a correção fechou: a da `v3` sobre o `fillOpacity` herdado (a faixa agora declara 1 e mede 1,15:1 nos dois temas) e a ressalva da `v2` sobre a ordem de pintura na `v4` (a `ReferenceLine` passou a declarar `zIndex` 50 e o zero medido pinta por cima).

* `v1`, redação no ramo: com variação abaixo de 0,05% a frase acessível sai `Estável de 0,0% contra set/25`, enquanto o corpo escreve só `estável`. O dado padrão não cai nesse ramo.
* `v3`, EST-4: com meta zero (`delta` nulo) o selo do cartão sai como seta para cima em `text-positive` e sem texto, quando a regra pede declarar que não há base para comparar. O dado padrão não tem esse caso; o defeito mora no ramo.
* `v3`: o mês do hoje é lido só do primeiro cartão. Linha de receita com realizado mais curto ou mais longo teria a `ReferenceLine` no mês errado. O dado padrão tem nove meses em todas.
* `v3`, ACE-2: no tema claro os dois tracejados (projeção em `--chart-1`, trajetória em `--text-muted`) medem 1,12:1 entre si (1,82:1 no escuro) e se separam por matiz e por 0,5 px de espessura. Os valores escritos no rodapé do cartão desempatam, então nada depende só da cor; um padrão de traço bem diferente na trajetória separaria as duas sem ela.
* `v3`, redação: `−3,9% da meta` pode ser lido como fração da meta; `3,9% abaixo da meta` não deixa dúvida.
* `v4`, ACE-5: `FILL_OPACITY` de 0,66 está no piso sem folga. A conta dá 3,01:1 no tema claro e o pixel renderizado (94, 159, 169 sobre branco) mede 2,997:1, diferença que vem do arredondamento a 8 bits. Com 0,70 a área mede 3,25:1 no claro e 5,29:1 no escuro.
* `v4`, 17.7: o cartão próprio usa `p-3` (12 px) e a tabela pede 16 px na moldura `stage`. Com `p-4` o conteúdo passaria do corpo de 470 px por cerca de 3 px; canvas por número resolve. Sem consequência no preview.
* `v4`, ACE-1: a frase acessível escreve `Indicação de clientes 1 meses` (plural fixo no fim da lista), e a enumeração das origens sem coleta cresce com o dado sem teto. Hoje mede 203 caracteres.
* `v4`: a moldura `stage` faz a tabela entrar no Farol sem `VisualCard`, portanto sem o título e sem o selo de procedência do cartão. A decidir se a peça vira moldura `card` com canvas por número.
