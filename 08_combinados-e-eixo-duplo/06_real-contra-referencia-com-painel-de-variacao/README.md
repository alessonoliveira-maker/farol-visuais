# Real contra referência com painel de variação

## O que é

Painel principal com o realizado contra uma referência (orçamento, ano anterior ou meta) e um painel inferior mais baixo, alinhado no mesmo eixo x e sincronizado por `syncId`, com a variação em colunas que sobem e descem do zero. É a estrutura de relatório de negócio para análise de variância: lê se cada período bateu ou estourou a referência no painel de cima, e por quanto, em qual direção e com que cor de sentido, no painel de baixo. A cor da variação segue a polaridade da métrica, passada como prop, e nunca o sinal cru; o painel de variação tem escala própria e diz isso por escrito no próprio título.

## Quando usar

- Desvio por período ou por categoria contra orçamento, ano anterior ou meta: custo contra orçado, receita contra o mesmo mês do ano anterior.
- Relatório mensal da Diretoria e do Comercial em que o desvio importa tanto quanto o nível absoluto.
- Até 12 períodos ou 8 categorias, com um ou dois painéis de variação.

## Quando evitar

- Decompor o desvio total em componentes: use `19_cascata-waterfall/01_cascata-de-ponte`.
- Referência que muda sem registro de versão: sem a versão declarada no título, a variação não é publicável.
- Só a variação interessa, sem o nível: `03_colunas-verticais/05_colunas-positivo-e-negativo` resolve com um gráfico só.
- Meta vista como volume a preencher em cada período: `03_colunas-verticais/06_colunas-contra-meta-ou-limiar`.
- Variação percentual sobre base pequena ou zero: abaixo do piso declarado, mostre só a variação absoluta.

## Anatomia

1. Dois `ComposedChart` empilhados na vertical com o mesmo `syncId`: o painel principal ocupa cerca de dois terços da altura do corpo, o painel de variação o terço restante.
2. Painel principal: coluna fantasma (ESP-6), não duas séries lado a lado. Uma única `Bar` por categoria, no dado da referência, desenha via `shape` customizado o orçado vazado e tracejado ocupando a banda inteira e o realizado sólido na cor de destaque (`--chart-1`) por cima, mais estreito e centrado, com a altura escalada pela razão entre os dois valores; assim o realizado sobe acima do contorno quando estoura a referência, e a espessura efetiva de cada marca não depende de dividir a banda por duas séries. Uma legenda acima do painel nomeia as duas marcas (ROT-4), porque a forma sozinha não basta quando elas se sobrepõem.
3. Um único `YAxis` no painel principal, domínio a partir do zero e ticks redondos calculados em função pura (EIX-1, EIX-4); o `XAxis` fica oculto ali, porque o eixo de categoria visível mora só no painel de baixo.
4. Painel de variação: `Bar` com `variacao = realizado − orcado`, domínio simétrico em torno do zero calculado por outra função pura, e `ReferenceLine` no zero em `--line-strong` (EIX-1, ANO-3).
5. Cor da variação pela polaridade da métrica, recebida por prop (`polarity`) e nunca inferida do sinal: para custo, estourar o orçado é `--negative` e economizar é `--positive`; variação exatamente zero usa o neutro `--line-strong`, com o valor sempre escrito ao lado (COR-2, COR-6).
6. Rótulo direto com sinal tipográfico (`+`, `−` U+2212) em cada barra de variação, com halo na cor do cartão para continuar legível ao cruzar a `ReferenceLine` do zero; acima da barra quando a variação é positiva, abaixo quando é negativa (NUM-3, ROT-7).
7. Dica própria por painel: o de cima mostra realizado e orçado em moeda compacta; o de baixo mostra só a variação, com o mesmo sinal tipográfico do rótulo, porque o formatador padrão de moeda usaria hífen (DIC-2, NUM-3).
8. Linha de leitura no topo do corpo, calculada do dado: quantos períodos estouraram a referência e onde está o maior desvio (ANO-5). `data` vazio troca os dois painéis por um bloco único `role="status"` (EST-1).

9. Quando a referência pode faltar ou valer zero, a `Bar` do painel principal se ancora no REALIZADO e não na referência, e o contorno da referência sai da escala do eixo dentro do `shape`. Ancorada na referência, um período de base ausente ficaria sem retângulo e levaria o realizado embora junto. Orçado zero desenha traço na base mais o `R$ 0` escrito (EST-3); orçado ausente não desenha marca de referência nenhuma e o motivo vai escrito no painel de baixo (EST-4).
10. O modelo aguenta duas referências e dois painéis de variação, um por referência, cada um com a própria escala escrita no título. As marcas do painel principal saem todas de um `shape` só, porque entre tipos de marca diferentes quem decide a ordem de pintura é o zIndex do pacote e não a ordem do JSX (REC-13).

## Versões

- `v1_custo-realizado-contra-orcado`: custo mensal realizado contra o orçado ao longo de 2026, com o painel de variação mostrando por quanto cada mês estourou ou ficou abaixo do orçado. Demonstra os dois `ComposedChart` com `syncId`, `YAxis width` e margens idênticas, o painel principal em coluna fantasma (orçado vazado atrás, realizado sólido central, uma série só por banda), a legenda acima do painel principal nomeando as duas marcas, a polaridade "menor é melhor" passada como prop e aplicada na cor da variação, o sinal tipográfico com `ReferenceLine` no zero, e a escala própria do painel de variação declarada no título do painel. Canvas de 740 por 560, mais largo que o preset `alto`: a conta da ESP-6 está em `meta.json` e no comentário do topo do `Chart.tsx`. Previews: [preview.svg](./v1_custo-realizado-contra-orcado/preview.svg) (escuro) e [preview-claro.svg](./v1_custo-realizado-contra-orcado/preview-claro.svg) (claro).

- `v2_receita-contra-ano-anterior`: receita de cada mês de 2026 contra o mesmo mês de 2025, com o painel de variação em reais e escala própria. Demonstra a variação percentual com piso de base declarado (fevereiro tem base de R$ 18 mil, abaixo do piso de R$ 50 mil, e por isso o rótulo dele escreve só a variação absoluta), os dois maiores desvios anotados com o resto silencioso, cada rótulo anotado nomeando a base na mesma linha (NUM-4), e o rótulo caindo dentro ou fora da coluna conforme o sinal. O rótulo nasce dentro do `shape` do `Bar`, que é o único lugar que recebe a linha inteira do dado (REC-5). Canvas de 760 por 580; a conta está em `meta.json` e no comentário do topo do `Chart.tsx`. Previews: [preview.svg](./v2_receita-contra-ano-anterior/preview.svg) (escuro) e [preview-claro.svg](./v2_receita-contra-ano-anterior/preview-claro.svg) (claro).
- `v3_vertical-contra-orcamento-e-ano-anterior`: receita de 6 verticais fictícias contra duas referências ao mesmo tempo, com dois painéis de variação empilhados, um por referência, cada um com a própria escala escrita no título. Demonstra o maior desvio anotado por painel (dois no visual inteiro, ANO-1), o `syncId` por categoria amarrando os três painéis, e as três marcas do painel principal desenhadas num `shape` só, porque entre tipos de marca diferentes quem decide a ordem de pintura é o zIndex do pacote e não a ordem do JSX (REC-13). Canvas de 640 por 700. Previews: [preview.svg](./v3_vertical-contra-orcamento-e-ano-anterior/preview.svg) (escuro) e [preview-claro.svg](./v3_vertical-contra-orcamento-e-ano-anterior/preview-claro.svg) (claro).
- `v4_orcado-zero-e-troca-de-versao`: oito meses de custo de projeto feitos de casos-limite. Demonstra orçado ZERO com traço na linha de base e `R$ 0` escrito (EST-3) contra orçado AUSENTE sem marca nenhuma e com a frase "sem base" na faixa do mês (EST-4), que é a pendência que a v1 deixou aberta em 2026-09-25; `minPointSize` para um desvio de R$ 800 existir ao lado de um de R$ 900 mil; e a troca de versão do orçamento em jul/2026 marcada com `ReferenceArea` e texto, desenhada por `shape` com `y1` e `y2` declarados (REC-27, REC-28). Canvas de 780 por 580. Previews: [preview.svg](./v4_orcado-zero-e-troca-de-versao/preview.svg) (escuro) e [preview-claro.svg](./v4_orcado-zero-e-troca-de-versao/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a página de destino, por exemplo `app/src/pages/<pagina>/visuals/MonthlyCostVsBudgetPanels/`, e ajuste o import do dado.
2. Troque o `data` fixo pelo seletor real (custo realizado e orçado por mês) e passe a `polarity` certa para a métrica da página: métricas de custo usam `"menorMelhor"`, métricas de receita ou volume usam `"maiorMelhor"`.
3. Embrulhe num único `VisualCard`: os dois painéis internos já se comportam como um cartão só, o `title` do `meta.json` vira o `title` do `VisualCard` e o `useCase` pode virar `subtitle`.
4. Dê altura ao pai (por exemplo `h-96` ou mais, para os dois painéis empilhados); abaixo de cerca de 320 px o painel de variação fica baixo demais para o rótulo do eixo e para os rótulos de sinal não colidirem com o eixo x.
5. Dê largura ao pai também: com 12 meses, abaixo de cerca de 680 a 700 px a coluna fantasma do painel principal fica mais fina que o piso de espessura da ESP-2 (a conta é a mesma da ESP-6, no comentário do topo do `Chart.tsx`); com menos meses no recorte, uma largura menor já basta.
6. Se a referência mudar de versão no meio do período (orçamento revisado, por exemplo), declare a versão vigente no título do cartão ou numa nota: sem isso a variação mistura dois orçamentos diferentes sem avisar.

## Referências

- [Recharts, Positive and Negative Bar Chart](https://recharts.github.io/en-US/examples/PositiveAndNegativeBarChart/): `ReferenceLine y={0}` e os tiques coloridos pelo sinal; no Farol a cor vem da polaridade.
- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/): `syncId` para amarrar os painéis.
- [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/): `minPointSize`, inclusive como função.
- [Recharts, BarChart API](https://recharts.github.io/en-US/api/BarChart/): `syncId`, que sincroniza cursor e dica entre gráficos irmãos, e `margin`, que precisa ser idêntica nos dois.
- [Wikipedia, International Business Communication Standards](https://en.wikipedia.org/wiki/International_Business_Communication_Standards): a notação cobrindo cenários, períodos e análises de variância; as regras visuais detalhadas não estão no artigo.
- [IBCS, Version 2.0](https://www.ibcs.com/ibcs-version-2-0/): a separação entre notação e composição (as regras visuais detalhadas não foram verificadas na pesquisa).
- [Microsoft Learn, colunas e barras IBCS](https://learn.microsoft.com/en-us/fabric/iq/plan/intelligence-ibcs/how-to-configure-ibcs-column-bar-charts): a estrutura de comparação com painel de variação e a semântica de favorável e desfavorável.
- [Data Viz Catalogue, variações de bar e column chart](https://datavizcatalogue.com/blog/bar-column-chart-variations/): a change bar, que resolve o mesmo problema num gráfico só, com seta de direção.

## Observações da revisão (não bloqueantes)

_Segunda revisão de 2026-09-19, sobre a coluna fantasma: nenhum ponto bloqueante restou (os dois da rodada anterior, legenda ausente e espessura de 5 px, estão resolvidos). Aqui ficam só os que não reprovam._

- `v1_custo-realizado-contra-orcado`: o tique do eixo do painel de variação imprime `R$ -100 mil`, com hífen depois do símbolo da moeda, enquanto os rótulos diretos das barras imprimem o menos tipográfico (`−R$ 15,0 mil`). A diferença nasce em `formatCurrencyAxis`, que é da biblioteca compartilhada e não desta versão; a leitura não fica ambígua, mas a peça mostra dois sinais de menos diferentes na mesma tela.
- `v1_custo-realizado-contra-orcado`: `buildSymmetricDomain` devolve cinco tiques (`−100`, `−50`, `0`, `+50`, `+100` mil), e nos dois PNGs só três aparecem; os degraus de 50 mil somem na altura atual do painel de baixo. Não engana, porque todo valor está escrito ao lado da barra, mas a grade intermediária prometida no código não chega à tela.
- `v1_custo-realizado-contra-orcado`: o painel de baixo tem rótulo escrito em todas as 12 barras, inclusive nas de R$ 1,0 mil e R$ 1,5 mil, que só desenham marca por causa do `minPointSize`. O texto salva a leitura, mas a densidade obriga o afastamento alternado por paridade de índice (`STAGGER_EXTRA`), que espalha os rótulos em duas alturas e deixa a faixa abaixo do zero visualmente mais cheia que a de cima.
- `v1_custo-realizado-contra-orcado`: a linha de leitura usa `truncate`. Na largura do cartão a frase cabe inteira nos dois temas, mas num cartão mais estreito ela some pelo fim, que é justamente onde mora o maior desvio. **(fechado na Correção de 2026-09-25.)**
- `v1_custo-realizado-contra-orcado`: a linha de leitura e a frase acessível escrevem "estouraram o orçado" e "acima do orçado" direto no texto, enquanto a cor da variação obedece à prop `polarity`. Quem colar com `polarity="maiorMelhor"`, como o passo 2 de "Como colar no Farol" manda fazer para receita, vê a cor certa e a frase invertida; nesta versão, de custo, as duas concordam.
- `v1_custo-realizado-contra-orcado`: `renderMainColumn` calcula a altura do realizado pela razão `realizado / orçado` sobre a altura da banda do orçado, o que é exato enquanto o orçado for positivo; com orçado zero o realizado some da tela, e esse é justamente o caso que a `v4` planejada vai precisar resolver de outro jeito. **(fechado na Correção de 2026-09-25.)**

### Observações de 2026-09-29, na leva da v2, da v3 e da v4

_Registradas pelo produtor das três versões novas, como a 14.1 pede para desvio medido. Nenhuma reprova, e nenhuma foi corrigida por conta própria._

- `v1_custo-realizado-contra-orcado`: **o tique do eixo de valor quebrava em duas linhas nos dois painéis** com `Y_AXIS_WIDTH = 58`, e perdia o `R$ 0` do painel principal e dois tiques do de variação. Corrigido em 2026-10-02: o eixo declara 84 px, como v2 a v4 (o limiar medido da EIX-6 é 81 px para `−R$ 300 mil`; 80 ainda quebrava), com `interval={0}` nos dois `YAxis` e 8 px de margem inferior no painel principal. A tensão com o teto de 48 a 64 px da EIX-6 está declarada no `meta.json`. O rótulo de janeiro passou a ancorar no início da coluna para não invadir os tiques do eixo. O eixo de 80 px citado em versões anteriores deste README nunca existiu na v1: o código tinha 58.
- `v1_custo-realizado-contra-orcado`: o painel principal **não imprime o tique `R$ 0`** da base, e o painel de variação imprime 3 dos 5 tiques declarados em `buildSymmetricDomain` (a observação de 2026-09-19 já registrava o segundo caso). É a armadilha REC-29, e a saída dela é `interval={0}` no eixo, que as versões novas passaram a usar.
- `v1_custo-realizado-contra-orcado`: `Chart.tsx:311` esconde o `XAxis` do painel principal com `hide`, que é a forma que a REC-17 nomeia como a evitar. Aqui não engana, porque os dois painéis têm escalas de valor independentes e só o eixo de categoria precisa alinhar, mas a `v3` mostra o custo quando isso importa: o painel do meio devolve ao próprio plano a altura do eixo escondido, e os 22 px de diferença entre as alturas dos dois painéis de desvio existem para compensar.
- `v1_custo-realizado-contra-orcado`: o `check` acusa aviso de `AGREGACAO-ZERO (ZERO)` em `Chart.tsx:110`, no ramo `orcado > 0 ? ... : 0` da altura do realizado. É aviso e não erro porque o zero vira limite de desenho e não número lido. As versões novas trocam esse ternário por `plano / domínio`, que não tem ramo de zero.
- `v2_receita-contra-ano-anterior`: o rótulo anotado do maior desvio negativo termina 4 px à esquerda da própria coluna, e não em cima dela. A ligação é por proximidade, sem linha de chamada. Foi escolhido assim porque a alternativa, centrar na coluna, põe o halo por cima da marca (GEO-4); quem quiser a ligação explícita acrescenta um traço de 6 px na vertical.
- `v3_vertical-contra-orcamento-e-ano-anterior`: no painel do meio, a tinta do rótulo anotado passa logo abaixo da coluna de Energia. A `CONTRASTE-TEXTO` mediu os dois temas e não acusou, porque o halo resolve o fundo, mas a folga vertical ali é a menor do visual.
- `v4_orcado-zero-e-troca-de-versao`: no tema escuro a faixa de `--surface-sunken` da troca de versão pesa bem mais do que no claro, e as linhas de grade somem dentro dela. O token é o que a ANO-4 manda usar em faixa de período, então fica registrado em vez de trocado.
- `v4_orcado-zero-e-troca-de-versao`: o `R$ 0` do mês de orçado zero é escrito abaixo da linha de base, na mesma altura do tique `R$ 0` do eixo de valor. São dois números iguais na mesma linha horizontal, um na coluna de abril e outro na borda esquerda; a posição resolve, mas convém saber que existem.

### Observações de 2026-10-02, na revisão das quatro versões

_Registradas pelo revisor independente, sobre o render de 2026-10-02 (sinal U+2212 antes do símbolo da moeda). Vereditos do dia: `v2` e `v4` aprovadas, `v1` e `v3` reprovadas. Os bloqueantes estão em `validation/revisao_08_combinados-e-eixo-duplo__06_real-contra-referencia-com-painel-de-variacao_2026-10-02.md`; aqui fica só o que não reprova._

- `v1_custo-realizado-contra-orcado`: a observação de 2026-09-19 sobre o hífen em `R$ -100 mil` fechou pela biblioteca, e o tique hoje sai `−R$ 100` sobre `mil`. As duas observações sobre tique quebrado e tique perdido (2026-09-19 e 2026-09-29) deixaram de ser observação: viraram o bloqueante da revisão de hoje, pela consequência no preview.
- `v2_receita-contra-ano-anterior`: o contorno da base de fevereiro (R$ 18,0 mil) mede 4,2 px de altura e o tracejado `3 3` se desfaz em três fragmentos soltos na base da coluna. Lê como base minúscula e o número está escrito no rótulo do painel de baixo; abaixo de uns 8 px de altura um traço contínuo na linha de base leria mais limpo.
- `v2_receita-contra-ano-anterior`: o rótulo "dentro da coluna" do desvio negativo fica ao lado da coluna, na altura do vão dela, e não dentro do retângulo. A releitura está declarada no `meta.json` e a posição muda com o sinal, que é o que o catálogo pede; quem ler o item do catálogo ao pé da letra espera outra coisa.
- `v2_receita-contra-ano-anterior`: o rótulo anotado de novembro cruza a linha de grade de −R$ 150 mil e o halo interrompe a grade ao longo do texto. Legível nos dois temas.
- `v2`, `v3` e `v4`: os títulos dos painéis de variação usam `truncate` e a cauda deles carrega a declaração que importa (o piso de R$ 50,0 mil na `v2`, "mais larga que a de cima" na `v3`), que não está na frase acessível. É o caso latente da TIP-7: na largura renderizada os três cabem com folga, em cartão estreito o corte cai justamente na declaração.
- `v3_vertical-contra-orcamento-e-ano-anterior`: os dois painéis de desvio estão na mesma unidade e em escalas diferentes (150 mil e 300 mil), então a mesma altura vale o dobro no painel de baixo. Os títulos declaram, como o catálogo pede. Com escala comum de 300 mil o menor desvio (R$ 14,0 mil) mediria 2,2 px, abaixo do piso de 3 px.
- `v3_vertical-contra-orcamento-e-ano-anterior`: o traço de 2025 em `--text-muted` mede cerca de 1,1:1 contra a coluna sólida no tema claro e 1,82:1 no escuro. Quem o mantém legível são os 8,2 px que sobram de cada lado da coluna, sobre o cartão.
- `v3` e `v4`: o `useCase` do `meta.json` foi encurtado em relação ao texto do catálogo para o cabeçalho caber em uma linha. Está dentro dos 140 caracteres do contrato; os dois textos deixaram de ser iguais.
- `v4_orcado-zero-e-troca-de-versao`: a tinta de `+R$ 900,0 mil` termina a 3 px da borda tracejada da faixa "sem base", nos dois temas. Não toca e lê, mas está abaixo dos 4 px de respiro que a casa usa entre textos.
- `v4_orcado-zero-e-troca-de-versao`: a primeira linha dos rótulos positivos nasce a menos de 1 px da linha de grade de R$ 750 mil e o `−2,5%` de fevereiro pousa sobre a de −R$ 750 mil, sem halo, por decisão declarada no código. A grade é `--line-subtle` e o texto lê nos dois temas.
- `v4_orcado-zero-e-troca-de-versao`: o traço do orçado zero de abril mostra 4,2 px de cada lado da coluna sólida, um tracinho só. Quem diz que o orçado é zero é o `R$ 0` escrito abaixo, e ele não diz de quem é o zero; "orçado R$ 0" fecharia a leitura sem depender da linha do topo.
- `v4_orcado-zero-e-troca-de-versao`: a linha de leitura e a frase acessível escrevem "abr/26 gastou R$ 900,0 mil sem orçamento" para o orçado ZERO e "mai/26 não tem base" para o orçado AUSENTE. "Sem orçamento" soa como ausência e embaralha justamente a diferença que a versão existe para mostrar; "com orçado zero" separa os dois.
- `v4_orcado-zero-e-troca-de-versao`: o percentual da segunda linha de cada rótulo não traz o valor da base na mesma linha (NUM-4). A base é uma só e está nomeada no título do painel, e o valor dela se lê no painel de cima. Na `v3`, que tem duas bases, o mesmo silêncio na linha de leitura reprovou.
- `v4_orcado-zero-e-troca-de-versao`: seis das sete colunas de variação estão no piso de 3 px do `minPointSize` (de R$ 800 a R$ 62,0 mil desenham a mesma marca) e só a de abril está em escala. O custo está declarado no `meta.json` e todo valor está escrito; o painel se lê pelo texto.
- `v4_orcado-zero-e-troca-de-versao`: os rótulos de julho e agosto ficam sobre a faixa `--surface-sunken`, onde `--positive` mede 4,62:1 no tema claro. Passa o piso de 4,5:1 e é o par mais justo do visual. Na frase acessível, duas sentenças começam por mês em minúscula ("abr/26 gastou", "mai/26 não tem").

### Observações de 2026-10-02, na segunda revisão da v1 e da v3

_Registradas pelo revisor independente depois da rodada única de correção, sobre o render de 2026-10-02, 11:29. Vereditos: `v1` e `v3` aprovadas, sem bloqueante nas 32 perguntas. Os três bloqueantes do parecer de 2026-10-02 fecharam e foram medidos no `preview.svg`, que tem a mesma geometria nos dois temas. Aqui fica só o que não reprova._

- `v1_custo-realizado-contra-orcado`: fechado o bloqueante do eixo. Com 84 px os 12 tiques de moeda saem em uma linha, o painel principal desenha 7 de 7 (o `R$ 0` da base em y=242 numa caixa de 250 px) e o de variação 5 de 5, com passo de 16,25 px. A linha do bloco de 2026-09-29 que diz que o `R$ 0` não é impresso e que saem 3 de 5 tiques descreve o estado anterior.
- `v1_custo-realizado-contra-orcado`: o rótulo de janeiro é o único ancorado no início da coluna; os outros onze são centrados. A tinta vai de x=100 a x=165 e termina em cima da coluna de fevereiro, 10 px acima dela. Lê pelo sinal, pela cor e porque fevereiro tem o próprio rótulo abaixo, e fica a 24 px do tique `R$ 50 mil`. Centrado, ele começaria em x=76, onde o tique termina. A saída que mantém os doze rótulos iguais é a da REC-29, três tiques no painel de variação. O comentário que explica a âncora ficou em `Chart.tsx:246`, acima da linha do afastamento alternado, e não da âncora.
- `v1_custo-realizado-contra-orcado`: o sólido central mede 12,35 px no render (fantasma de 19 px, arredondado pelo pacote), 0,35 px acima do piso de 12 px da ESP-2. O `meta.json` escreve cerca de 12,6 px, e o comentário do topo do `Chart.tsx` (linhas 48 a 50) ainda traz a conta do eixo de 58 px (passo de 50,3, fantasma de 20,1, sólido de 13,1). O limiar do passo 5 de "Como colar no Farol" também foi calculado com o eixo antigo e subiu 26 px: com 12 meses, o canvas de 740 px tem poucos pixels de folga de largura antes de o sólido cair do piso.
- `v3_vertical-contra-orcamento-e-ano-anterior`: fechado o bloqueante do rótulo. A linha de base do `−12% contra R$ 704,0 mil orçado` está em y=108,88, com a tinta a partir de y=101, 6 px abaixo da ponta da coluna de Serviços e 19 px abaixo da base da coluna de Energia (y=82,08). Igual nos dois temas, conferido no PNG escuro ampliado. A observação de 2026-09-29 sobre a folga contra Energia deixou de valer.
- `v3_vertical-contra-orcamento-e-ano-anterior`: o rótulo desce além da ponta, mas continua ao lado da coluna, começando 4 px à direita dela, e não debaixo dela. A ligação é por proximidade do canto. Caminho latente: quando o maior desvio negativo passar de cerca de 66% do domínio, o rótulo pousa sobre a linha de grade da borda inferior, com o halo interrompendo a grade; cabe na caixa de 124 px e não corta.
- `v3_vertical-contra-orcamento-e-ano-anterior`: fechado o bloqueante da NUM-4, a linha de leitura escreve `+38% sobre 2025`. Ela passou a ocupar duas linhas, com `orçado` sozinho na segunda, e a ANO-5 pede uma. Não corta nem colide, mas tira 16 px do painel principal, cujo plano mede 160 px. O `meta.json` não mudou desde o veredito anterior: a nota ainda conta 24 px de linha de leitura e 223,5 px de painel principal, e hoje são 40 px e cerca de 207,5 px. Encurtar a primeira oração devolve a linha única.
- `v3_vertical-contra-orcamento-e-ano-anterior`: "sobe +38%" diz a direção duas vezes, no verbo e no sinal. Vale para a linha de leitura e para a frase acessível, que usam a mesma chamada.
- `v1` e `v3` (e também `v2` e `v4`): a linha de leitura é um `<p>` em Manrope sem `tabular-nums`, e o preview confirma `font-variant-numeric: normal` nela. A TIP-1 pede algarismo tabular em todo número de tela. Numa frase corrida não há coluna para desalinhar e nada muda no preview; quem tocar o arquivo acrescenta a classe.

## Correção de 2026-09-25

Dois defeitos na mesma versão, os dois de "a escala apaga um valor que existe".

**v1, orçado zero apagava o realizado.** `renderMainColumn` tirava a altura do realizado da razão
`realizado / orçado` sobre a altura da banda. A razão é exata enquanto o orçado é positivo, mas com
orçado zero a banda tem altura zero, a razão anula, e o mês desenhava só um traço tracejado rente à
base: um custo que existe desaparecia da tela, enquanto o painel de baixo continuava mostrando a
variação inteira dele. A tela e o painel de variação contavam histórias diferentes sobre o mesmo mês.

O que mudou: a altura do realizado passa a sair da escala do eixo, `plano / domínio`, lendo a altura
do plano em `background`, o retângulo que o Recharts entrega junto de cada barra (`BarRectangleItem`,
campo público), e o domínio por parâmetro (`renderMainColumn(mainDomain.domainMax)`). A base deixou
de ser recalculada e passa a ser `y + bandHeight`, que é o pixel do zero mesmo quando a banda tem
altura zero. Nos meses de orçado positivo as duas contas dão **o mesmo pixel**, porque a banda é
`orçado / domínio × plano`: é identidade algébrica, não aproximação. A razão antiga ficou só como
saída para o caso de `background` não vir.

**v1, a linha de leitura cortada pelo fim.** A frase termina no maior desvio
("maior desvio em out/26, R$ 62,0 mil acima") e vinha com `truncate`. Em cartão mais estreito ela
sumia pelo fim, ou seja, o cartão perdia exatamente o número pelo qual a frase existe, e o leitor
ficava com uma contagem de meses sem a magnitude. O `truncate` saiu: na largura do cartão a frase
cabe numa linha e o desenho é o mesmo; em cartão estreito ela quebra e rouba altura do plano, que é o
preço certo a pagar. É o que 53 versões do acervo já fazem, entre elas
`09_dispersao-e-bolhas/01_dispersao-simples/v1`.

**Conserto de caminho latente nos dois:** os 12 meses publicados têm orçado positivo e a frase cabe
na largura renderizada, então o preview não exibia nenhum dos dois defeitos e o desenho não mudou.

**Pendência que não foi decidida aqui:** com orçado zero, o contorno tracejado fica com altura zero e
lê igual a "mês sem orçado". Distinguir "orçado é zero" de "não há orçado" pede marca própria (a
pergunta 3 de ARMADILHAS) e é decisão de desenho, não de correção: fica para quem desenhar a `v4`
planejada, que é a versão dos casos-limite.
