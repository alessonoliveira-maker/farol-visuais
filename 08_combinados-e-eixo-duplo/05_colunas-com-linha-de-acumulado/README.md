# Colunas com linha de acumulado

## O que é

Colunas com o valor de cada mês no eixo esquerdo e uma linha com o acumulado do ano no eixo direito, com a meta anual como referência nesse mesmo eixo. O cartão responde duas perguntas ao mesmo tempo: quanto entrou em cada mês e em que ponto do caminho até a meta anual o ano está. As duas escalas não têm relação natural entre si, então o desenho só é honesto quando os domínios seguem uma regra objetiva e declarada, nunca o automático da biblioteca.

## Quando usar

- Valor mensal e caminho até a meta anual no mesmo cartão: receita reconhecida, fechamentos, captação.
- Ano corrente com 12 meses, com os meses futuros como `null` nas duas séries.
- Cartão lido por um público já habituado ao eixo duplo, com a alternância para painéis disponível para os demais.

## Quando evitar

- Só o caminho até a meta interessa: use o burn-up puro de `04_linhas/06_acumulado-contra-meta`.
- Público geral sem mediação: prefira `03_paineis-alinhados`, com o burn-up num painel e as colunas no outro.
- Anotar o cruzamento entre a linha e o topo das colunas: as escalas são independentes e o cruzamento não significa nada.
- Métrica sem acumulação natural, como taxa ou CPL: use `01_coluna-com-linha`.
- Enquanto a EIX-8 do CONTRATO valer sem exceção registrada, o modo painéis é a entrega padrão para um público sem mediação: é o que a `v2` entrega de saída, com o eixo duplo atrás de uma alternância (ver Anatomia, itens 3 e 12).

## Anatomia

1. **Eixo esquerdo (mês).** `YAxis yAxisId="mes"`, domínio de 0 até o maior valor entre a maior receita mensal e o dobro do ritmo linear mensal (`annualTarget / 12`), tique e título na cor `--chart-1`, formatado por `formatCurrencyAxis`. Escolher o domínio assim faz o ritmo linear cair perto da metade do eixo sempre que nenhum mês supera esse ritmo, o que transforma "coluna acima da metade" em "mês acima do ritmo da meta".
2. **Eixo direito (acumulado).** `YAxis yAxisId="acumulado" orientation="right"`, domínio de 0 até o maior valor entre a meta anual e o acumulado do último mês fechado, tique e título na cor `--chart-3`.
3. **Ponto delicado.** As duas escalas não têm relação natural: uma mede o mês, a outra mede a soma do ano. O cruzamento visual entre a linha do acumulado e o topo de uma coluna não carrega significado nenhum e por isso nunca é anotado, mesmo quando cai perto de um valor redondo.
4. **Colunas.** `Bar yAxisId="mes"` na cor do eixo esquerdo, sem rótulo direto: a grade e o eixo já dão a leitura, e a dica dá o valor exato de cada mês.
5. **Linha do acumulado.** `Line yAxisId="acumulado"` na cor do eixo direito, sem ponto em todo mês: o ponto e o rótulo direto aparecem só no último mês fechado (`dot={false}` mais um `label` que desenha o círculo e o texto só nesse índice).
6. **Meses futuros.** `revenue: null` no `data.ts` a partir do primeiro mês sem fechamento; o acumulado também vira `null` a partir daí, com `connectNulls={false}` na linha, para a coluna não desenhar zerada e a linha não continuar por interpolação.
7. **Meta anual.** `ReferenceLine` no `yAxisId="acumulado"`, com `ifOverflow="extendDomain"`, traço tracejado em `--text-muted` e rótulo com o valor em moeda compacta.
8. **Grade.** `CartesianGrid` só no `yAxisId="mes"`, para não duplicar linhas de grade com escalas diferentes no mesmo cartão.
9. **Linha de leitura.** Frase no topo do corpo, calculada do último mês fechado: o acumulado e o percentual da meta anual já alcançado (ANO-5).
10. **Dica.** `ChartTooltip` com o valor do mês e o acumulado do mês selecionado, cada entrada só aparece quando o dado daquele mês existe (DIC-5).
11. `data` vazio troca o gráfico inteiro por um bloco `role="status"` (EST-1).
12. **Ritmo linear como altura declarada** (`v2`). O domínio do eixo do mês termina em `annualTarget / 12` dividido por uma fração declarada no topo do arquivo (`PACE_AT = 0.5`), então a marca do ritmo cai sempre na metade do eixo e "coluna acima da metade" vira "mês acima do ritmo". A cor segue a polaridade da métrica (COR-6): `--positive` acima, `--negative` abaixo, com a posição contra a linha e a contagem escrita na linha de leitura como segundo canal (ACE-2).
13. **Alternância para painéis** (`v2`). Dois `ComposedChart` empilhados com a mesma escala de categoria, a mesma largura de eixo e a mesma margem, porque painel alinhado cobra as três coincidências (EIX-12). O painel de cima não desenha eixo X e reserva a mesma faixa dele em `MARGIN.bottom`, senão os dois planos saem de alturas diferentes (REC-17). O modo vive em `useState` e nunca muda a ordem das séries nem os domínios.
14. **Taxa de câmbio implícita** (`v2` no modo de eixo duplo, `v3` sempre). O rodapé imprime quanto de uma grandeza o desenho está equiparando a quanto da outra, dividindo o topo de um eixo pelo topo do outro, e o que esse empate vira com um passo a mais no eixo da direita. É a técnica que a emenda de 2026-09-28 da EIX-8 pede de quem assume o eixo duplo de propósito: troca a afirmação de que "as escalas são independentes" por uma demonstração aritmética dentro da peça.
15. **Pilha por vertical com slot fixo** (`v3`). Um `Bar` por vertical com o mesmo `stackId`, o `slot` de cor vindo do `data.ts` e não da ordem de desenho (COR-3), na ordem de slots da COR-8, e contorno de 1 px em `--surface-raised` entre segmentos (COR-5). A linha do acumulado usa `--chart-7`, fora da composição, porque ela não é categoria da pilha. A legenda lista as verticais de cima para baixo da pilha, com o total do ano de cada uma (ROT-4, ROT-5).
16. **Zeros alinhados por função pura** (`v4`). `alignZero` toma a maior das duas frações negativas e estica o lado negativo do outro eixo até igualá-la, sem nunca encolher domínio. Com os dois zeros no mesmo pixel, uma única `ReferenceLine` em `--line-strong` serve aos dois eixos, com `zIndex` abaixo das colunas e acima da grade. O preço é do desenho e se declara: a fatia negativa do plano existe para as colunas, e no eixo do acumulado ela fica vazia.
17. **Meta que muda como degrau** (`v4`). A meta vigente mora mês a mês no `data.ts` e entra como série `Line type="stepAfter"` no eixo do acumulado, tracejada em `--text-muted`, não como `ReferenceLine`: referência que muda no meio do recorte é dado. Uma nota de rodapé nomeia o valor vigente em cada trecho, derivada do próprio dado.
18. **Coluna negativa** (`v4`). O retângulo chega com `y` no pixel do valor e `height` **negativo** (`baseValueScale − currentValueScale` em `cartesian/Bar.js`); o `Rectangle` normaliza para desenhar, mas conta de rótulo não normaliza nada, então o meio da marca é `y + height / 2` com qualquer sinal. O raio do canto acompanha o sentido da coluna.

## Versões

- `v1_receita-mensal-e-acumulado-do-ano`: receita reconhecida mensal em colunas e acumulado de 2026 em linha, contra uma meta anual fictícia de R$ 10 mi. Demonstra o `ComposedChart` com `Bar` e `Line` em eixos `yAxisId` diferentes, cada um na cor da própria série, o eixo do acumulado indo de zero ao maior valor entre a meta anual e o acumulado, a `ReferenceLine` da meta no eixo do acumulado, os quatro últimos meses como `null` nas duas séries sem coluna zerada, e o ponto com rótulo aparecendo só no último mês fechado.
- `v2_ritmo-linear-com-alternancia-para-paineis`: a mesma receita mensal contra o ritmo linear da meta anual, em dois modos de leitura que partilham cores e domínios. Demonstra o eixo do mês escolhido para o ritmo cair em altura declarada, a cor da coluna seguindo acima ou abaixo do ritmo, a alternância em HTML entre painéis alinhados e eixo duplo com o modo guardado no estado da tela, e a taxa de câmbio implícita impressa quando o eixo duplo está ligado. O modo painéis é o padrão e é o que o preview retrata.
- `v3_fechamentos-por-vertical-com-acumulado`: fechamentos de cada mês repartidos em quatro verticais fictícias, com o acumulado total do ano em linha. Demonstra a pilha com slot de cor vindo do dado, uma única linha sobre a pilha que é o acumulado do ano e não o total do mês, a meta anual no eixo do acumulado com o ritmo linear no eixo do mês, a legenda distinguindo coluna de linha pela forma da amostra e trazendo o total do ano de cada vertical, e a taxa de câmbio implícita no rodapé.
- `v4_estorno-e-meta-revisada`: um estorno em mai/26 maior do que tudo o que entrou naquele mês, e a meta anual revisada para baixo em jun/26. Demonstra a coluna negativa com o acumulado descendo junto, os zeros dos dois eixos alinhados por função pura com uma única linha de zero em `--line-strong`, a meta revisada como degrau no eixo do acumulado lido do próprio dado, e a nota que nomeia o valor vigente em cada trecho.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a página de destino, por exemplo `app/src/pages/<pagina>/visuals/RevenueAndAccumulated/`.
2. Troque o `import` de `./data` pelo seletor da página: passe a lista mensal por `data` e ajuste a constante `annualTarget` do `data.ts` para a meta anual real, ou exporte a meta também como prop se a página tiver mais de uma meta possível.
3. Dê altura ao pai (`<div className="h-64">`, por exemplo, para o canvas `card`) ou passe `height`.
4. Se o recorte da página tiver mais de 12 meses, confira se os tiques do eixo de categoria continuam espaçados e legíveis nos dois temas; o `xTicks` hoje pula um mês sim, um não.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.
6. Na `v2`, decida o modo inicial pela prop `initialMode`. O padrão é `paineis`, que é a leitura sem eixo duplo; ligar `duplo` de saída é decisão de quem cola, e a peça passa a imprimir a taxa de câmbio implícita no rodapé.
7. Na `v3`, a lista de verticais entra por `verticals` e o `slot` de cor tem de vir da página, não da ordem da consulta, senão a mesma vertical troca de cor quando o recorte muda de composição (COR-3).
8. Na `v4`, a meta vigente vem no próprio dado, mês a mês. Página que tem só uma meta repete o mesmo valor nos doze meses, e o degrau simplesmente não aparece.
9. Em todas, o `AXIS_WIDTH` do topo do arquivo foi dimensionado para o tique mais longo do dado fictício. Recorte com ordem de grandeza diferente muda o tique, e a conta é somar a tinta da string glifo a glifo e acrescentar 18 px, nunca deixar o eixo quebrar em duas linhas (REC-2).

## Referências

- Praticante: [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide). Observar zeros alinhados, cores por eixo e rótulos nos extremos e no último valor.
- Praticante: [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis). Observar a saída em gráficos empilhados com o mesmo eixo x.
- Documentação: [Recharts, ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/). Observar `yAxisId` na referência para que a meta anual use o eixo do acumulado.
- Biblioteca: [Tremor, Combo Chart](https://tremor.so/docs/visualizations/combo-chart). Observar `enableBiaxial` e rótulo de eixo por série.
- Praticante: [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis). Observar por que escalas arbitrárias sugerem cruzamentos.

## Observações da revisão (não bloqueantes)

- `v1_receita-mensal-e-acumulado-do-ano`: os tiques do eixo esquerdo caem em valores não redondos (R$ 417 mil, R$ 833 mil, R$ 1,3 mi, R$ 1,7 mi), porque `evenTicks` divide o dobro do ritmo linear em quatro passos iguais sem arredondar. A leitura fica correta, mas um passo redondo seria mais rápido de conferir de relance.
- `v1_receita-mensal-e-acumulado-do-ano`: com `AXIS_WIDTH` em 56 px, os tiques mais longos quebram em duas linhas nos dois temas ("R$ 1,7" acima de "mi"). Nada é cortado nem sobreposto; é só um desalinho visual na coluna de tiques.
- `v1_receita-mensal-e-acumulado-do-ano`: a linha tracejada da meta anual passa perto do tique mais alto do eixo esquerdo e, por um instante, pode sugerir um nível daquele eixo. O rótulo "Meta anual R$ 10,0 mi" e o tique da direita resolvem a dúvida, e a Anatomia já avisa que o cruzamento entre escalas não significa nada.
- `v1_receita-mensal-e-acumulado-do-ano`: o valor exato de cada mês vive só na dica, por decisão do item 4 da Anatomia. Quem colar o padrão numa tela impressa ou exportada em PNG perde esse número, e vale considerar o rótulo direto no mês de maior receita.
- `v1_receita-mensal-e-acumulado-do-ano`, linha 51: a causa da quebra de tique registrada acima está medida. `R$ 1,7 mi` soma 41,89 px de tinta em Manrope, e a sobrecarga do eixo é de 18 px (`tickSize` de 6 px que o `tickLine={false}` não desconta, mais `tickMargin` de 8, mais a folga de 2 px por linha), logo o tique pede 61,89 px contra os 56 px declarados em `AXIS_WIDTH`. As três versões novas dimensionam o eixo pela mesma conta, e por isso nenhuma delas quebra.
- `v1_receita-mensal-e-acumulado-do-ano`, linha 148: a linha de leitura leva `truncate`, e a cauda dela carrega o percentual da meta, que é a conclusão. A TIP-7 só libera reticência em texto de apoio cuja cauda **não** carregue o número nem a conclusão. Nada é cortado no canvas atual, então o desvio não aparece no render e o `check` não o acusa; as versões novas escrevem a linha de leitura sem `truncate`.
- `v1_receita-mensal-e-acumulado-do-ano`, `meta.json`: a versão usa eixo duplo, que a EIX-8 proíbe, e o `meta.json` não tem `notes` declarando o desvio. As três versões novas declaram.
- `v1_receita-mensal-e-acumulado-do-ano`, linhas 158, 168 e 181: os tiques dos três eixos não pedem algarismo tabular, nem por `className="font-display"` nem por `tabular-nums`, o que a TIP-1 exige de todo número de tela. A `NUMERO-CRU` não alcança o caso, porque o número do tique nasce do `tickFormatter` e não de texto JSX.
- `v2_ritmo-linear-com-alternancia-para-paineis`: o topo do eixo do acumulado é a própria meta anual, então a linha tracejada da meta cai exatamente sobre a primeira linha de grade e o valor aparece duas vezes na mesma altura, no tique à esquerda e no rótulo à direita. Nada colide e a leitura não muda; dar folga ao domínio resolveria a repetição ao custo de tiques não redondos.
- `v3_fechamentos-por-vertical-com-acumulado`: o rótulo da meta anual termina a poucos pixels do tique mais alto do eixo direito, e o rótulo do ritmo linear faz o mesmo com o tique do meio. A `COLISAO-TEXTO` mediu a peça e não acusou nem erro nem aviso, mas o par é o mais apertado do cartão e qualquer aumento no texto da referência precisa ser conferido no PNG.
- `v4_estorno-e-meta-revisada`: o degrau da meta, que corre no eixo do acumulado, cruza o topo da coluna de mar/26, que corre no eixo do mês. O encontro não significa nada, é o que o item 3 da Anatomia descreve, e a nota do rodapé diz que os dois eixos partilham o zero e nada além dele. É o custo conhecido do eixo duplo, não um defeito de desenho.
- `v4_estorno-e-meta-revisada`: metade do plano fica abaixo do zero por causa do alinhamento, e nessa metade só existe uma coluna. O desenho poderia recuperar espaço com um estorno menor, e perderia a mesma proporção na profundidade da queda do acumulado; a escolha está declarada no `meta.json`.
