# Cascata de previsão

## O que é

Uma ponte que junta o realizado até hoje com o projetado até o fim do período. Cada passo é uma faixa `[baixo, alto]` de um `Bar` do Recharts com `shape` próprio, que desenha o retângulo, o rótulo, o nome sob a base e o conector até a coluna seguinte. O que já aconteceu tem preenchimento sólido; o que ainda é projeção tem hachura declarada em `defs`, com contorno na cor da série. Um divisor marca a data de corte e o total final diz que é projeção. A distinção entre realizado e projetado sobrevive sem cor: a hachura é forma, e o regime vem escrito sob cada coluna.

## Quando usar

* Fechamento de período em andamento: meses ou semanas realizados mais o restante projetado, com 3 a 8 passos.
* Projeção comparada a um plano, com a distância do plano como passo explícito.
* Mudança do forecast entre duas leituras: novas, avanços, perdas e datas que deslizaram.
* Projeção que depende de campo com cobertura baixa, quando a ressalva precisa aparecer no desenho.

## Quando evitar

* Projeção como trajetória no tempo: linha ou área com faixa de projeção, famílias 04 e 05.
* Só a pergunta de quanto falta para a meta: progresso e meta, família 13.
* Projeção com incerteza declarada em faixa: cascata com faixa de cenário, modelo 05 desta família.
* Sem data de corte conhecida: sem ela a peça mente calada uma semana depois.

## Anatomia

1. **Coluna sólida** (`--chart-1`): passo já realizado, rótulo em `--text-primary` por `money` (moeda curta com duas casas no milhão, sobre `formatDecimal` e `formatCurrencyAxis`).
2. **Coluna hachurada**: passo projetado. `pattern` em `defs` com id de `useId`, fundo `--surface-raised`, traço de 1,5 px em `--chart-1` a 70% (piso de 66% da ACE-5) e contorno opaco que mantém a marca em 3:1.
3. **Divisor de corte** (v1): traço tracejado em `--text-secondary` na fronteira entre a última banda realizada e a primeira projetada, posição de `useXAxisScale`, com o texto `realizado até` e a data por `formatDate`.
4. **Total** ancorado no zero, com peso 700 e a palavra projeção; quando fica perto de uma referência, sobe acima dela.
5. **Nome e regime sob a base**: duas linhas desenhadas pelo shape, porque o mesmo mês pode aparecer duas vezes (realizado e projetado).
6. **Referência de plano** (v2): `ReferenceLine` tracejada com `ifOverflow="extendDomain"` e legenda na margem direita, mais a distância do plano como faixa flutuante em `--negative` ou `--positive`.
7. **Linha de leitura** (`aria-hidden`, 12 px) com a conclusão e a base, e **dica** com o valor exato e o acumulado, que o rótulo não traz.
8. **Fechamento verificado no dado**: função que devolve `number | null` e só escreve na linha de leitura se a soma dos passos errar o total.
9. **Frase acessível** calculada do dado, com os nomes dos passos em minúscula.

## Versões

* `v1_fechamento-do-trimestre`: julho e agosto realizados, setembro dividido em realizado e projetado, divisor na data de corte e total projetado.
* `v2_projecao-contra-plano`: a mesma ponte com traço de plano, passo de distância do plano com a polaridade da receita e anotação sobre a origem da projeção.
* `v3_forecast-semanal-da-carteira`: ponte entre duas leituras de forecast em canvas largo, com totais divididos em fechado e ponderado, maior passo destacado e legenda de papéis e de preenchimento.
* `v4_projecao-com-cobertura-rasa`: dois graus de hachura, fina para o projetado com data e larga e tracejada para o estimado sem data, com a cobertura do campo na linha de leitura.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão para o diretório do visual e trocar `data` pelo retorno da métrica; os tipos (`ForecastItem` e afins) vêm do `data.ts`, e a data de corte, o plano e a cobertura são props com default.
2. Entregar o dado já na ordem da ponte e com o total declarado: o componente confere a soma dos passos e escreve na linha de leitura quando a ponte não fecha.
3. Embrulhar num `VisualCard` e trocar o estado vazio inline por `EmptyState`; título e procedência são do cartão, e na v4 a procedência PREMISSA é do cartão, nunca do Chart.
4. A data de corte vem do carimbo de leitura da métrica; sem ela, não colar a v1: a hachura deixa de ter o que dizer.

## Referências

* Método: a ponte (bridge) de Gene Zelazny, em "Say It With Charts"; o princípio de ancorar totais no zero e deixar só os passos flutuarem. Hachura para projeção segue a convenção de gráficos financeiros de realizado contra previsto.
* Recharts 3.10.1: `Bar` com `dataKey` devolvendo faixa e `shape` próprio, `usePlotArea`, `useXAxisScale`, `useYAxisScale`.
* Farol: `app/src/components/visuals/charts/ChartTooltip.tsx` e `app/src/lib/format.ts`.
* Pedido ao Farol: nenhum formatador escreve o sinal `+` em moeda nem a moeda compacta com duas casas no milhão, então cada versão os escreve à mão sobre o valor absoluto e sobre `formatDecimal`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez e as quatro aprovadas. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v4`: a frase acessível sai com a palavra repetida, "realizado realizado R$ 214 mil", porque o `stepText` junta o nome da coluna em minúscula com o `BASIS_TEXT` e os dois coincidem no primeiro passo; a dica repete o mesmo em "Realizado, realizado". Usar o `SUB_TEXT` ("já medido") ou omitir o grau quando ele repete o nome.
* `v1` e `v2`: a coluna do total é hachurada inteira, embora R$ 1,42 mi de R$ 1,84 mi já sejam realizados. O catálogo pede só o total dizendo que é projeção, e a parte realizada se lê pelo conector, pelo divisor e pela linha de leitura; a `v3` e a `v4` dividem o total, e o mesmo empilhado aqui alinharia o modelo.
* `v3`: três rótulos em peso 700 (os dois totais e o maior passo), e a TIP-3 dá dois. O destaque não depende do peso, porque leva a anotação "maior passo da semana".
* `v3`: a semana de 07/09/2026 só existe na frase acessível (DAD-9); na tela ficam "da semana" e "na leitura anterior". Na `v4`, o mês não aparece no corpo nem na frase ("projeção do mês").
* `v1`, `v2` e `v4`: o conector sai sempre do topo da coluna (`y1={top}`), que é o fim do passo só quando ele é positivo. Com passo negativo o traço sairia do nível de partida; a `v3` já resolve com `levelY`. Não aparece com o dado fixo, que não tem passo negativo nessas versões.
* `v1`, `v2`, `v3` e `v4`: o conector é um traço de 1 px em `--line-strong`, medido em 1,79:1 no escuro e 1,83:1 no claro. Foi lido como referência pela ACE-6, como em `01_cascata-de-ponte` e `03_cascata-temporal-de-saldo`: tapado o traço, o nível de cada passo continua na posição das colunas e o valor continua escrito.
* `v1`, `v2`, `v3` e `v4`: rótulo direto por `formatCurrencyAxis` e por moeda de duas casas no milhão montada sobre `formatDecimal`, e a NUM-1 dá `formatCurrencyCompact`. O pedido ao Farol já está nas referências.
* `v1`, `v2`, `v3` e `v4`: os números da linha de leitura ficam em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
* `v1`: o divisor é desenhado à mão por `useXAxisScale`, e o `notes` diz que a `ReferenceLine` cai no centro da banda. No Recharts 3.10.1 ela declara `position` para eixo com banda (`ReferenceLine.d.ts`), e vale testar `position="start"`, que devolveria o `ifOverflow` e o rótulo padrão.
* `v1`: o texto "realizado até" fica à esquerda do divisor, na altura do topo da área. Com o dado fixo as linhas de base ficam a 33 px do `+R$ 214 mil`; se o passo projetado medir menos de cerca de 12 px (8% da escala), o rótulo do último passo realizado sobe até essa linha e os dois colidem.
* `v1` e `v2`: o divisor e o traço de plano usam `--text-secondary` com `4 3`, e a 17.2 dá `--text-muted` com `3 3` para referência. Sem consequência visível.
* `v2`: a origem da projeção traz a data escrita à mão no dado ("até 30/09"), fora do `formatDate` (NUM-7).
* `v3`: a legenda lista aumento, queda, total fechado e total ponderado, e a ordem das marcas da esquerda para a direita começa pelo total (ROT-4). Sem consequência de leitura.
* `v3`: a anotação "maior passo da semana" fica a cerca de 3 px de tinta do conector que chega de Perdas. Lê solta nos dois temas.
* `v1`, `v2` e `v3`: o check avisa `COLISAO-TEXTO` em pares empilhados a 3,88 px e 3,98 px (valor do total sobre "projeção", "plano" sobre o valor, valor sobre "maior passo da semana"). Nos dois PNGs os pares se leem soltos.
* `v1` e `v2`: distâncias sem nome no código (o 13 da segunda linha do rótulo, o 14 e o 6 do divisor, o 2 e o 11 da legenda do plano), e a ESP-1 pede constante nomeada.
