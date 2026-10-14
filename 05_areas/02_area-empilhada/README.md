# Área empilhada

## O que é

Várias séries desenhadas com `Area` e o mesmo `stackId`, cada uma começando onde a anterior
termina: o topo da pilha é o total e a espessura de cada camada é a parte. Lê se o total cresceu
ou caiu e, ao mesmo tempo, se a composição mudou, mas só a camada da base tem referência comum no
zero; as de cima flutuam sobre uma base que já não é zero, o que torna a leitura exata de uma
camada do meio mais difícil que a da base. A variante divergente (`stackOffset="sign"`) separa
entradas acima do zero e saídas abaixo, com o saldo líquido em linha por cima.

## Quando usar

- Total e composição importam juntos, com 2 a 6 camadas coloridas e 10 datas ou mais.
- A camada mais importante para a pergunta pode ir na base, onde a leitura é exata.
- Fluxo com entradas e saídas por categoria: `stackOffset="sign"` mais uma linha de saldo.
- Mix de 2 a 4 componentes num cartão pequeno, com eixo escondido (não removido) e ordem fixa
  entre instâncias, quando o cartão só precisa mostrar se um componente ganhou peso.

## Quando evitar

- A pergunta é qual camada do meio cresceu: nenhuma camada além da base tem base comum, então a
  resposta mora em pequenos múltiplos (`01_area-simples`, versão `v3`).
- Participação importa mais que o total: área 100% (`03_area-100`).
- Menos de cerca de 10 datas: colunas empilhadas (`03_colunas-verticais`).
- Mais de 6 categorias coloridas sem agrupar em "Outros" com a contagem (COR-4).
- Negativos empilhados sem `stackOffset="sign"`, ou uma categoria que alterna sinal numa chave só:
  sem o offset a pilha deforma; numa chave só, a mesma cor empilha positivo sobre negativo e o
  topo da pilha deixa de significar total.
- Muitas categorias com padrão sazonal e sem necessidade de valor exato: streamgraph
  (`08_streamgraph`).

## Anatomia

1. **Camadas (`Area`)**: uma por categoria, todas com o mesmo `stackId`; a mais importante é o
   primeiro filho, na base. Cor fixa por categoria em `--chart-1`, `--chart-3`, `--chart-6`,
   `--chart-5` (ordem de slot da COR-8), nunca por índice de array reordenada.
2. **Separador entre camadas**: `stroke="var(--surface-raised)"` de 1,5 px em cada `Area`, para
   vizinhos que não contrastam entre si (COR-5).
3. **Rótulo de total**: quando o eixo de valor está visível, o total do último ponto é escrito por
   cima da pilha e nomeado como "total" (nunca um número solto), a única forma de dizer o todo e
   as partes sem o leitor confundir o topo com o valor da última camada.
4. **Referência (`ReferenceLine`)**: teto, meta ou zero em `--text-muted` (tracejada) ou
   `--line-strong` (zero, sólida), sempre com `ifOverflow="extendDomain"` e rótulo com nome e
   valor.
5. **Linha de leitura**: uma frase acima do gráfico, calculada do dado, que já dá o todo (total,
   saldo ou participação) e ao menos uma parte, para nunca depender só da leitura visual da pilha.
6. **Eixo de categoria/tempo**: `formatMonthShort` ou `formatDate` no `tickFormatter`, com
   `interval` explícito acima de 8 categorias (FORCED_TICK_LIMIT).
7. **Eixo de valor**: `formatCurrencyAxis`, `formatInt` ou um formatador com sinal tipográfico
   (`−`, U+2212) quando a série diverge.
8. **Estado vazio**: bloco `role="status"` com ícone `Filter` e frase, sem eixo nem grade.

## Versões

- **`v1_custo-em-tres-camadas`**: `Area` com `stackId` comum e a camada mais importante como
  primeiro filho na base; rótulo de total escrito por cima da pilha, nomeado como total; slots
  categóricos na ordem 1, 3, 6 com separador `surface-raised`; linha de leitura com o total do mês
  e a participação de cada camada, o todo e as partes juntos.
- **`v2_mix-de-investimento-em-cartao`**: área empilhada micro num cartão pequeno, eixos
  escondidos e não removidos; a plataforma em foco em `chart-1`, as demais em `line-strong` com
  separador entre camadas; teto de 4 componentes já agregado na origem do dado; frase acessível e
  linha de leitura dizem o total investido e a participação da plataforma em foco.
- **`v3_estoque-da-fila-contra-teto`**: quatro etapas empilhadas na ordem do processo, não pelo
  tamanho, com o teto de capacidade em `ReferenceLine` tracejada; legenda acima do gráfico na
  ordem visual da pilha, de cima para baixo, com a etapa que mais incha em destaque, para o nome
  de cada camada ficar localizável no desenho (ROT-4); a linha de leitura conta os dias acima do
  teto e aponta a etapa que mais incha nesses dias; um dia sem medição interrompe as quatro
  camadas juntas, nunca vira zero.
- **`v4_entradas-e-saidas-de-oportunidades`**: área empilhada divergente com duas pilhas por
  sinal (`positiva` e `negativa`), cada uma com offset padrão a partir do zero; sem
  `stackOffset="sign"`, porque esse offset classifica cada semana pelo sinal do próprio valor, e
  numa semana de reclassificação zero o zero conta como não negativo e a camada salta para a
  pilha errada, desenhando uma área que o dado não tem; a categoria de reclassificação alterna de
  sinal e por isso vive em duas chaves da mesma cor, uma em cada pilha; legenda acima do gráfico
  nomeia as quatro camadas mais o saldo líquido, com amostra na forma da marca (ROT-3, ROT-4); a
  linha de leitura declara todas as parcelas, entradas, saídas e reclassificação líquida, para a
  soma escrita fechar com o saldo; o saldo líquido vai numa `Line` à parte, nomeada na legenda
  por amostra de linha, e as semanas de saldo negativo levam um losango na cor negativa mais o
  texto na linha de leitura, símbolo e texto além da cor.

Previews de cada versão: `v1_custo-em-tres-camadas/preview.svg`,
`v2_mix-de-investimento-em-cartao/preview.svg`, `v3_estoque-da-fila-contra-teto/preview.svg` e
`v4_entradas-e-saidas-de-oportunidades/preview.svg` (e o par `preview-claro.svg` de cada uma).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue `data` à consulta real da página.
2. Se a versão usa `ReferenceLine` de teto ou meta, o valor vem do mesmo lugar que a régua da
   página (registry ou parâmetro), nunca hardcoded fora do `data.ts` de amostra.
3. Em cartões pequenos (`v2`), mantenha os eixos escondidos com `hide`, nunca removidos: sem eles
   o Recharts perde a escala e a área para de bater com o total.
4. Em pilhas divergentes (`v4`), o `stackOffset="sign"` só funciona se toda categoria daquele
   `stackId` estiver presente em toda linha do dado, mesmo que com valor zero.

## Referências

- [Data Viz Catalogue, Stacked Area Graph](https://datavizcatalogue.com/methods/stacked_area_graph.html)
- [From Data to Viz, Stacked area](https://www.data-to-viz.com/graph/stackedarea.html)
- [Recharts, Stacked Area Chart](https://recharts.github.io/en-US/examples/StackedAreaChart/)
- [Recharts, ComposedChart API](https://recharts.github.io/en-US/api/ComposedChart/)
- [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/)
- [Highcharts, Area with negative values](https://www.highcharts.com/demo/highcharts/area-negative)
- [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart)
- [Datawrapper Academy, How to add bar charts and line charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables)
- [Storytelling with Data, little things can mean a lot](https://www.storytellingwithdata.com/blog/2020/2/13/little-things-can-mean-a-lot)

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18._

- `v1`: a legenda inline da linha de leitura vai da base para o topo (Direto, Alocado, Estrutura),
  enquanto a pilha se lê de cima para baixo; a ROT-4 e o catálogo pedem a ordem visual da pilha.
- `v1`: o eixo de tempo mostra um mês a cada dois, então dez/26, o mês do rótulo de total, fica sem
  tique próprio.
- `v2`: a frase acessível dá a participação do foco e das demais somadas; o catálogo pede a
  participação final de cada componente.
- `v2`: as três camadas neutras dividem a mesma cor e a mesma opacidade, então o separador é a
  única pista entre elas, e no tema escuro ele é discreto.
- `v3`: o topo do eixo de valor é o próprio máximo do dado (71), fora do passo redondo da EIX-4.
- `v3`: a frase acessível mede 241 caracteres, a 9 do teto da ACE-1 (aviso do `npm run check`); um
  recorte maior estoura o limite.
- `v3`: a lacuna de medição aparece só como corte no desenho; nada a nomeia na tela, apenas na
  frase acessível.
- `v4`: o tique do eixo de tempo corta o ano (dd/mm), então a virada de ano fica implícita.

_Segunda revisão de 2026-09-18, depois das correções de `v3` e `v4`._

- `v1`: a dica usa `cursor={{ stroke: 'var(--line-strong)' }}`; a DIC-3 reserva `CURSOR_COLOR`
  para o cursor de linha.
- `v1`: com a largura de eixo em 60, o tique de moeda quebra em duas linhas (`R$ 400` e `mil`);
  lê sem corte, mas ocupa o dobro da altura de uma linha de tique.
- `v2`: a frase acessível diz sempre "Ganhou X p.p."; se o foco perder peso, o texto contraria o
  sinal impresso na linha de leitura, que já trata os dois casos.
- `v3`: o teto e a contagem de dias aparecem como número solto (`teto 60`, `24 de 120 dias`), sem
  o substantivo que a NUM-6 pede junto da contagem.
- `v4`: as parcelas da linha de leitura (174, 549, −383) também vêm sem o substantivo
  "oportunidades"; a unidade só aparece no título e na frase acessível.

_Terceira revisão independente de 2026-09-18, sobre as quatro versões já corrigidas. As quatro
foram aprovadas: nenhum achado abaixo é bloqueante._

- `v3`: a legenda que nomeia as quatro etapas é `aria-hidden` e a frase acessível cita só a etapa
  que mais incha, então quem lê por leitor de tela fica sem os nomes das outras três; `v1` não tem
  esse vão porque a frase dela nomeia as três camadas com o percentual de cada uma.
- `v4`: o `Tooltip` não declara `itemSorter`, que a DIC-4 pede para a dica seguir a pilha; a ordem
  dos filhos já sai próxima da visual, mas as duas chaves de reclassificação chegam à dica com o
  mesmo nome, uma acima e outra abaixo do zero, sem nada que as distinga além do sinal.
- `v4`: a `Line` do saldo usa `--text-primary`, um token de texto, como marca de dado, papel que a
  tabela 17.2 não prevê; é o único token com contraste suficiente sobre as quatro camadas cheias,
  então vale como escolha deliberada, mas está registrada aqui por não ter papel na tabela.
- `v2`: segue aberta a divergência das rodadas anteriores contra o catálogo, que pede a
  participação final de cada componente na frase acessível; `meta.json` e a seção Versões deste
  README já descrevem o comportamento implementado, o do foco contra as demais somadas, de modo
  que a decisão pendente é corrigir a versão ou corrigir a entrada do catálogo.
- `v1` e `v3`: seguem abertas, sem novidade, a ordem da legenda inline da `v1` (da base para o
  topo) e o topo do eixo da `v3` no próprio máximo do dado (71), fora do passo redondo da EIX-4.

## Correção de 2026-09-18

`v3` e `v4` voltaram do revisor reprovados; ambos corrigidos nesta rodada, sem mexer em `v1` e
`v2`.

- `v3`: adicionada legenda acima do gráfico, na ordem visual da pilha de cima para baixo
  (Reagendar, Aguardando agenda, Em cadência, Novo), com a etapa que mais incha em negrito; antes
  não havia legenda nem rótulo direto e nenhuma etapa era nomeável no PNG (ROT-4), e a pergunta do
  `useCase`, qual etapa inchou, não tinha como ser respondida olhando o desenho.
- `v4`: `entradas` e `reclassificacaoEntrada` passaram para `stackId="positiva"`,
  `saidaGanho`, `saidaPerda` e `reclassificacaoSaida` para `stackId="negativa"`, e
  `stackOffset="sign"` saiu do `ComposedChart`. O offset `sign` classifica cada semana pelo sinal
  do próprio valor; numa semana em que `reclassificacaoSaida` é zero, o zero conta como não
  negativo e a camada saltava para a pilha positiva, desenhando uma faixa entre +45 e −28 que o
  dado não tinha. Com duas pilhas fixas por sinal e offset padrão, cada camada soma a partir do
  zero da própria pilha, sem depender do sinal ponto a ponto.
- `v4`: adicionada legenda acima do gráfico (Reclassificação, Entradas, Saída por ganho, Saída
  por perda). A reclassificação ocupa os dois extremos da pilha, o mais acima e o mais abaixo do
  zero, então não existe uma única posição "visual" para ela na ordem da ROT-4; a legenda lista a
  cor uma vez só, na posição do extremo, e as demais camadas seguem da mais próxima do zero para a
  mais distante em cada lado. Fica registrado aqui por não ser o caso simples que a regra prevê.
- `v4`: a linha de leitura e a frase acessível passaram a declarar a reclassificação líquida
  (entradas 549, saídas −383, reclassificação +8, saldo 174); antes a soma escrita não fechava
  porque a reclassificação ficava de fora da conta.

Nenhum problema apontado ficou sem resolução nesta rodada.

## Correção de 2026-09-18 (segunda rodada, revisão independente)

`v4` voltou reprovado da revisão independente; corrigido sem mexer em `v1`, `v2` e `v3`, que
seguem aprovados como estão.

- `v4`: a `Line` do saldo líquido, a marca mais forte do quadro, não era nomeada em lugar nenhum
  do desenho, porque a legenda listava só as quatro camadas empilhadas; acrescentado um quinto
  item de legenda para o saldo líquido, com amostra na forma da marca (um traço com o mesmo traço
  e cor da linha, não o quadrado das camadas), conforme ROT-3 e ROT-4.

## Observações da revisão (não bloqueantes)

_Quarta revisão independente de 2026-09-18, sobre as quatro versões. `npm run check` saiu com 0
com erro e 1 aviso; as quatro foram aprovadas e nenhum achado abaixo é bloqueante._

- `v4`: o losango das semanas negativas é pintado em `--negative`, e a camada de reclassificação
  em `--chart-5`; as duas ficam no mesmo campo de rosa no tema escuro. A forma (losango sobre a
  linha) e o texto da linha de leitura separam as duas, então a leitura não se perde, mas as
  cores não se distinguem de relance.
- `v4`: a última semana do recorte (20/07) fica sem tique próprio, porque o eixo mostra uma
  semana a cada duas; a linha de leitura e a frase acessível já dão o período inteiro.
- `v3`: o rótulo `teto 60` divide a faixa mais cheia do desenho com os picos de maio; o halo da
  ROT-7 resolve, mas um recorte com pico exatamente ali deixaria o par muito próximo.
- `v2`: no tema escuro as três camadas neutras só se separam pelo traço de `--surface-raised`,
  que é discreto; a leitura pretendida (foco contra as demais) não depende disso, mas quem
  procurar as três camadas não as encontra.
- `v1` e `v2`: seguem abertas, sem novidade, a ordem da legenda inline da `v1` (da base para o
  topo, enquanto a pilha se lê de cima para baixo) e a divergência da `v2` contra o catálogo, que
  pede a participação final de cada componente na frase acessível.
- `v3`: seguem abertos o topo do eixo de valor no próprio máximo do dado (71), fora do passo
  redondo da EIX-4, e a frase acessível a 241 caracteres, a 9 do teto da ACE-1, que é o único
  aviso do `npm run check` neste modelo.
