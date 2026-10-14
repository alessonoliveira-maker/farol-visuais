# Colunas positivo e negativo

## O que é

Colunas que sobem quando o valor é positivo e descem quando é negativo, ancoradas numa linha de
zero desenhada e mais forte que a grade. É a forma do saldo, da variação e do desvio: a altura para
cima e a altura para baixo são comparáveis porque nascem do mesmo ponto. A cor de cada coluna vem de
uma função pura que lê a polaridade da métrica, não o sinal cru do número, então uma métrica de
custo pode ter a coluna que desce em verde. O modelo também absorve a pilha por sinal: entradas
empilhadas para cima, saídas para baixo e o líquido do período marcado com mais peso que os
segmentos.

## Quando usar

* Saldo ou variação com sinal por período, em até 26 períodos.
* Desvio contra uma referência fixa, como a média do semestre, expresso como diferença.
* Entradas e saídas por período com seus componentes, quando o líquido também precisa ser lido.
* Métrica com polaridade definida, para a cor dizer bom ou ruim acompanhada de sinal.

## Quando evitar

* Todos os valores positivos: usar colunas simples (modelo 01).
* Métrica sem polaridade definida: sem verde nem vermelho, só `--text-secondary` e sinal.
* Variação percentual sobre base pequena ou zero: usar diferença absoluta ou painel de variação.
* Só o saldo interessa: sem pilha por sinal, que obriga o leitor a subtrair dois comprimentos de
  cabeça.
* Decomposição passo a passo de um total entre dois momentos: usar cascata.

## Anatomia

1. **Linha de zero**, `ReferenceLine` sólida em `--line-strong`, mais forte que as demais linhas de
   grade (EIX-5); é o único ponto de referência comum entre o lado positivo e o negativo.
2. **Eixo de períodos**, horizontal, com o tique posicionado pelo padrão do próprio Recharts na
   base da área de plotagem, fora do alcance das colunas que descem, nunca sobre a linha de zero.
3. **Colunas**, desenhadas por `shape` porque a cor depende da **polaridade da métrica**
   (`corPorPolaridade`), não do sinal cru: numa métrica de custo, a coluna que desce é boa e leva
   `--positive`. Largura travada por `maxBarSize` derivado do passo da ESP-6.
4. **Rótulo de valor**, acima da coluna positiva e abaixo da negativa, com o sinal à mão (`+` ou
   `−`, NUM-3) e a mesma cor da polaridade.
5. **Domínio simétrico**, quando a mensagem é "o quanto desviou de uma referência": calculado do
   maior valor absoluto do recorte, para um mês extremo não espremer os demais.
6. **Zero medido contra mês sem dado**, tratados de formas diferentes: o zero medido é um traço
   fino de 2 px sobre a linha de zero com o rótulo "0"; o mês sem apuração fica vazio, com
   `formatUnavailable()` no lugar do valor.
7. **Pilha por sinal**, quando há componentes dos dois lados: o mesmo `stackId` empilha os valores
   positivos para cima e os negativos para baixo, com o componente mais importante encostado no
   zero de cada lado; o líquido é uma `Line` num `ComposedChart`, com mais peso visual que os
   segmentos.

## Versões

* **`v1_saldo-mensal-de-clientes`**: `Bar` com `shape` escolhendo `--positive` ou `--negative` pela
  polaridade do saldo (novos menos perdidos), nunca pelo sinal cru; `ReferenceLine` em zero;
  valor com sinal acima da coluna positiva e abaixo da negativa; tique de mês fora da área das
  colunas que descem, pelo posicionamento padrão do eixo de categoria. Preview:
  [escuro](v1_saldo-mensal-de-clientes/preview.svg) ·
  [claro](v1_saldo-mensal-de-clientes/preview-claro.svg).
* **`v2_cpl-qualificado-contra-media`**: polaridade invertida (CPL que sobe é ruim, então a coluna
  para cima leva `--negative`), com a regra escrita na linha de leitura; domínio simétrico fixo
  para o mês mais extremo não espremer os demais; `ReferenceArea` marcando os três meses seguidos
  acima da média; a própria linha de zero nomeada com o valor da média, em vez de uma segunda
  referência. Preview: [escuro](v2_cpl-qualificado-contra-media/preview.svg) ·
  [claro](v2_cpl-qualificado-contra-media/preview-claro.svg).
* **`v3_movimento-do-funil-por-sinal`**: pilha por sinal num `ComposedChart`, com novas
  oportunidades e reativadas empilhadas para cima, perdidas e desqualificadas para baixo, sempre
  encostando o componente mais importante no zero; líquido marcado por `Line` com mais peso que os
  segmentos; dica com os quatro componentes e o líquido, na ordem visual da pilha; a semana sem
  nenhuma entrada aparece com a nota "sem entradas na semana", visível e não só na dica. Preview:
  [escuro](v3_movimento-do-funil-por-sinal/preview.svg) ·
  [claro](v3_movimento-do-funil-por-sinal/preview-claro.svg).
* **`v4_saldo-zero-e-mes-sem-dado`**: separa o mês com saldo exatamente zero (traço de 2 px sobre a
  linha de zero, rotulado "0") do mês sem apuração (vazio, com `formatUnavailable()`), nunca
  desenhando os dois do mesmo jeito; domínio calculado do maior valor absoluto medido, terminando
  na primeira linha de grade além dele dos dois lados. Preview:
  [escuro](v4_saldo-zero-e-mes-sem-dado/preview.svg) ·
  [claro](v4_saldo-zero-e-mes-sem-dado/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o import do dado.
2. Se a métrica tiver polaridade invertida (como CPL, custo ou tempo de resposta), documente a
   regra de cor no comentário do `Chart.tsx` copiado, do mesmo jeito que a `v2` faz: quem só olha o
   código precisa entender por que a coluna que desce está em verde.
3. Passe a série real pela prop `data`, no mesmo formato de `MonthlyClientBalance`,
   `MonthlyCplQualified`, `WeeklyFunnelMovement` ou `MonthlyBalanceOrGap`; mês sem apuração vira
   `balance: null`, nunca um valor omitido do array (é o que a `v4` demonstra).
4. Dê altura ao pai (`h-64` ou a linha da grade) e embrulhe em `VisualCard` com o `title` do
   `meta.json`; a `v3` pede um pai mais largo, pelo canvas `largo` que ela usa no catálogo.
5. Se a página tiver um recorte com poucos meses, o domínio simétrico calculado no componente
   ainda funciona: ele lê o `data` recebido, não uma constante fixa do catálogo.

## Referências

* Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar que este formato vive na família Deviation, definida como "variações mais e menos a partir de um ponto fixo de referência, tipicamente zero".
* Catálogo: [Vega Lite, Stack](https://vega.github.io/vega-lite/docs/stack.html). Observar como valores negativos são tratados na pilha e a menção ao gráfico divergente.
* Catálogo: [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/). Observar a progressive bar, alternativa quando o empilhado por sinal fica ilegível.
* Praticante: [Nightingale, Tear Up Your Baseline](https://nightingaledvs.com/tear-up-your-baseline/). Observar o papel da linha de zero como âncora de leitura.
* Praticante: [The Arrangement of Marks Impacts Afforded Messages (arXiv)](https://arxiv.org/pdf/2308.13321). Observar a evidência de que ordenação, partição, espaçamento e cor mudam a mensagem que a coluna transmite, o que sustenta a regra de cor por polaridade.
* Implementação: [Recharts, Positive And Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/) e [Bar Chart Stacked By Sign](https://recharts.github.io/en-US/examples/BarChartStackedBySign/). Observar o `shape` decidindo a cor pelo sinal e o empilhamento nativo por `stackId` compartilhado.
* Implementação: [shadcn/ui, `chart-bar-negative.tsx`](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts). Observar a `ReferenceLine` em zero.
* Portal de design: [Dribbble, tag column chart](https://dribbble.com/tags/column_chart). Observar tratamentos da linha de zero e do rótulo abaixo da coluna negativa.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18, sobre os PNGs de conferência dos dois temas._

* **v1**: o tique negativo do eixo de valor sai de `formatInt`, que devolve hífen (`-20`), enquanto
  o rótulo direto usa o sinal de menos tipográfico (`−11`); os dois sinais convivem na mesma tela.
* **v1**: com 12 meses o Recharts esconde tiques alternados no eixo de categoria; nenhum mês fica
  sem leitura porque o valor está escrito em cada coluna, mas o intervalo é decidido pela
  biblioteca, não por constante do componente.
* **v2**: o eixo de valor está com `hide`, então as linhas de grade aparecem sem nenhum número de
  escala; a leitura se sustenta só nos rótulos diretos e na linha de zero nomeada.
* **v2**: o domínio é a constante `DOMAIN_LIMIT = 50`, e não um cálculo sobre o maior desvio do
  recorte; o `meta.json` diz "domínio simétrico calculado" e o passo 5 da seção Como colar promete
  que o componente lê o `data` recebido. Com outro recorte, desvio acima de 50 sai cortado.
* **v2**: o catálogo pede a média nomeada na linha de leitura; a versão a nomeia na própria linha de
  zero, e a linha de leitura fica só com a regra de polaridade e o pior mês.
* **v3**: os segmentos vizinhos da pilha encostam sem vão nem contorno `--surface-raised`, e a
  ordem usa `--chart-5`, `--chart-6` e `--chart-2` coladas, combinação que a COR-8 manda separar.
* **v3**: a legenda em HTML leva `aria-hidden`, o que é coerente com a frase acessível da raiz, mas
  deixa a identificação dos quatro componentes fora do leitor de tela.
* **v4**: o eixo de valor sai com intervalos desiguais (30, 10, −5, −20), porque `tickCount` decide
  sozinho sobre o domínio fixado; a EIX-4 pede intervalo redondo com `ticks` calculados.
* **v4**: a palavra "indisponível" cruza o traço tracejado da marca de ausência na altura do
  descendente do "p"; a leitura segue clara, mas o halo da ROT-7 resolveria o encontro.

_Acréscimos da segunda revisão independente, 2026-09-18._

* **v2**: a janela da `ReferenceArea` é a constante `HIGH_WINDOW = ['2026-06', '2026-08']`, escrita
  à mão; com outro recorte de dado a faixa destacada e a contagem "3 meses acima da média" deixam de
  acompanhar os meses que de fato ficaram acima, porque nenhuma das duas sai de cálculo sobre o
  `data` recebido.
* **v4**: o tique negativo do eixo sai de `formatInt` e imprime hífen (`-20`) ao lado dos rótulos
  diretos com sinal tipográfico (`−13`), a mesma convivência de sinais já anotada na v1.
* **v1, v2 e v4**: o deslocamento do rótulo abaixo da coluna negativa soma `+ 9` cru ao
  `VALUE_LABEL_GAP`, número de linha de base sem constante nomeada, o que a ESP-1 pede que seja
  declarado.
* **v3**: a espessura declarada em `BAR_MAX = 26` fica acima do teto de 24 da ESP-2; o preset é o
  `largo` e o passo medido não chega a esse teto, então o número descreve intenção que o desenho
  não usa.

_Acréscimos da terceira revisão independente, 2026-09-18, com o check em `0 com erro` e as duas
espessuras conferidas no PNG (v1 em 16 px, v3 em 23 px)._

* **v3**: a `Line` do líquido usa `type="monotone"`, então a curva passeia entre semanas que são
  contagens discretas; `type="linear"` diria o mesmo sem sugerir valor entre um ponto e outro.
* **v3**: a legenda lista Novas oportunidades antes de Reativadas, enquanto a pilha lida de cima
  para baixo começa por Reativadas; a ROT-4 pede a ordem visual das marcas.
* **v3**: o eixo de valor sai em 80, 45, 10, −25 e −60, intervalo uniforme de 35 mas não redondo,
  porque `tickCount` divide o domínio calculado em vez de usar `ticks` próprios (EIX-4).
* **v4**: a EST-2 pede o ícone `Unplug` junto de `formatUnavailable()`; a versão escreve só a
  palavra ao lado da marca tracejada, sem o ícone.
* **v2**: a `ReferenceArea` é desenhada depois da `CartesianGrid`, então as linhas de grade somem
  dentro da faixa destacada nos dois temas; é cosmético e não muda a leitura dos rótulos diretos.

## Correção de 2026-09-18

Rodada de correção sobre reprovação de revisor independente, restrita aos dois problemas
bloqueantes apontados; as observações não bloqueantes acima não foram alteradas.

* **v2 (ROT-7)**: o rótulo `média R$ 274`, antes em `position: 'insideBottomRight'` sobre a
  própria linha de zero, nascia por cima da coluna de ago/26 e ficava ilegível nos dois temas.
  Passou a ser desenhado por uma função de rótulo (`renderMeanLabel`) ancorada fora da área de
  plotagem, na margem reservada à direita (`MARGIN.right` subiu de 8 para 80 px, ESP-6 recalculada
  no comentário do componente), com halo (`paintOrder: 'stroke'`) por segurança contra qualquer
  recorte em que uma marca cresça até a borda.
* **v2 (ACE-3)**: como consequência da correção acima, o rótulo deixou de cair sobre a marca
  `--negative`; hoje ele sempre está sobre `--surface-raised` do cartão, par aprovado na tabela
  17.10 (5,21:1 escuro, 5,37:1 claro).
* **v3 (encoding)**: faltava `stackOffset="sign"` no `ComposedChart`. Sem ele o Recharts empilhava
  as saídas (negativas) por cima das entradas já desenhadas em vez de descer a partir do zero, e a
  coluna lia como entradas mais saídas, todas positivas, com os segmentos de saída pintando por
  cima do azul de novas oportunidades. Acrescentado `stackOffset="sign"` com comentário no
  `Chart.tsx`; conferido nos dois temas que S06 (semana sem entradas) agora só desce.

### Segunda rodada de correção (2026-09-18)

* **v2 (ESP-3)**: o rótulo de valor `+R$ 38` de jun/26 encostava no texto `3 meses acima da média`
  da própria `ReferenceArea` e a leitura virava `+R$ 383`. A nota da `ReferenceArea` deixou de usar
  a posição centrada `insideTop` e passou a ser desenhada por uma função de rótulo
  (`renderAreaLabel`), ancorada no canto superior direito da faixa, junto de ago/26, o mês de menor
  desvio da janela e cujo rótulo de valor nasce bem mais baixo; halo por segurança contra a grade e
  a borda da faixa. Conferido nos dois temas que nenhum par de textos encosta mais.
