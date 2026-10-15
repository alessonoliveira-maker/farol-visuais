# Coluna com linha (eixo único)

## O que é

Colunas com o valor de cada período no eixo y e uma única linha na mesma unidade sobreposta ao mesmo eixo: meta, média móvel, teto de capacidade ou o mesmo período do ano anterior. Como a linha fala a unidade das colunas, a altura da coluna e a posição do ponto se comparam direto, sem escala arbitrária nem segundo eixo. Lê se cada coluna passou ou ficou abaixo do que a linha marca naquele período, e como a distância entre as duas muda ao longo do tempo.

**Por que este modelo não tem eixo duplo, mesmo morando na família 08.** A `EIX-8` do CONTRATO é literal: sem eixo duplo, duas grandezas viram dois gráficos alinhados. Este modelo não colide com ela porque a linha **fala a unidade das colunas**: reais contra reais na `v1` e na `v4`, contagem de oportunidades contra contagem na `v2` e na `v3`. O eixo é um só, e é isso que autoriza o leitor a comparar altura de coluna com altura de linha. No instante em que a segunda grandeza muda de unidade, o modelo deixa de servir e o trabalho vai para `03_paineis-alinhados`, como a seção Quando evitar registra. A régua que vale nas quatro versões: **um `YAxis`, um `domain`, uma unidade**.

## Quando usar

- Grandeza por período contra meta, média móvel, teto ou o mesmo período do ano anterior, quando as duas séries têm a mesma unidade: receita reconhecida contra meta mensal, fechamentos semanais contra a média das últimas semanas.
- Composição por período em até 5 camadas empilhadas com um teto ou limiar na mesma unidade: fila de pré-vendas por etapa contra a capacidade da equipe.
- De 6 a 26 períodos num cartão; até 52 num canvas largo, sempre com os tiques do eixo de categoria espaçados e o texto na horizontal.

## Quando evitar

- Linha em unidade diferente das colunas (taxa, CPL): use `03_paineis-alinhados` ou, com público habituado à leitura de eixo duplo, `02_eixo-duplo-com-dominios-calculados`.
- Linha que só repete o total da pilha: rotule o total acima da coluna e dispense a linha.
- Meta igual em todos os períodos e nenhuma outra linha: basta a referência de `03_colunas-verticais/06_colunas-contra-meta-ou-limiar`, sem o custo de uma série inteira.
- A pergunta é quanto passou do teto: o excedente destacado mora no mesmo `03_colunas-verticais/06_colunas-contra-meta-ou-limiar`.
- Mais de uma linha sobre a pilha ou mais de 5 camadas: agrupe camadas ou separe em painéis.

## Anatomia

1. `ComposedChart` com um único `YAxis`: `Bar` declarado antes de `Line` nos filhos, para a coluna pintar primeiro e a linha por cima. Na `v3` a segunda série é uma `ReferenceLine` de teto, também no mesmo eixo.
2. Colunas na cor de destaque (`--chart-1`); a linha na segunda cor categórica (`--chart-3`, ordem da COR-8). Na `v3` as quatro camadas da pilha usam os slots 1, 3, 6 e 5 da COR-8, e o mês do estorno da `v4` sai em `--negative` pela polaridade da métrica (COR-6).
3. **Guia contra coluna (`TOK-10`).** Na `v2` e na `v4` a linha passa **por trás das colunas**, sem revestimento (segunda saída da `TOK-10`: `zIndex` 250 contra os 300 da barra, e o elemento antes da barra no JSX); o ponto da linha só é desenhado onde o valor não tem vizinho com valor, porque o marcador cairia sobre a coluna. Na `v3`, revestimento na cor do cartão por baixo do teto (`--surface-raised`, 5 px sob 1,5 px). O revestimento de 6 px que a `v2` e a `v4` tinham foi retirado em 2026-10-02: cobria o topo de nov/26 na `v4`, que bateu a meta por R$ 6,4 mil. Medido de `tokens.css`: `--chart-3` contra `--chart-1` mede **1,47:1 no escuro e 1,03:1 no claro**, e `--text-muted` contra `--chart-6` mede **1,00:1 no claro**, então a linha que atravessa a coluna **desaparece dentro dela** se contar só com a cor. É a saída da `TOK-10`, que não tem token possível: nenhum alcança 3:1 contra o cartão e contra a marca ao mesmo tempo.
4. Domínio do eixo a partir de zero e ticks redondos calculados em função pura no componente (EIX-1, EIX-4): o eixo termina na primeira marca redonda acima do maior valor entre as duas séries. Na `v4`, em que há valor negativo, o domínio procura o menor passo redondo em que os dois lados do zero caibam no teto de faixas da EIX-4, e o zero é sempre um dos tiques.
5. Eixo de categoria com tiques espaçados e texto sempre horizontal (EIX-7, TIP-5). Em série semanal, **um tique por mês presente, ancorado na primeira semana daquele mês** (REC-21), em vez de repetir o mesmo mês em tiques vizinhos. `XAxis height` e `YAxis width` em constante nomeada no topo (EIX-6, EIX-6b).
6. Identificação das séries por **legenda desenhada à mão acima do gráfico** na `v2`, `v3` e `v4`, com amostra na forma da marca (quadrado para camada, quadrado vazado para período parcial, traço para linha) e na ordem visual da pilha, do topo para a base (ROT-4). A `v1` usa rótulo direto no fim da linha (ROT-3); as versões novas não, e a razão está em Observações.
7. Dica única (`ChartTooltip`) montada a partir da própria linha do dado, na ordem visual, com `formatUnavailable()` onde a série é nula (DIC-1, DIC-2, EST-2).
8. Linha de leitura no topo do corpo, calculada do dado, com a conclusão na frente (ANO-5, TIP-7).
9. `data` vazio troca o gráfico inteiro por um bloco `role="status"` (EST-1); toda agregação de lista devolve `number | null`, nunca zero (EST-1b).

## Versões

- `v1_receita-mensal-contra-meta`: receita reconhecida mensal em colunas contra a meta de cada mês em linha, ao longo de 2026. Demonstra o `ComposedChart` com `Bar` antes de `Line` no mesmo eixo, a linha de meta com pontos e rótulo direto no último mês, a dica única com realizado, meta e diferença em moeda compacta, e o domínio a partir do zero com ticks redondos calculados no componente.
- `v2_fechamentos-com-media-movel`: fechamentos semanais em colunas contra a média das quatro semanas terminadas na própria semana (ela inclui) em linha, em 12 semanas de calendário. Demonstra o calendário completo gerado em TypeScript no eixo categórico (o `data.ts` traz 11 linhas, sem 2026-07-27, e a semana ausente vira lacuna escrita sem dado, nunca zero), a média móvel calculada sobre o calendário e não sobre as linhas, nula nas janelas que contêm lacuna ou semana parcial, a semana corrente vazada e fora da média com nota de parcial até a data, o tique por mês ancorado na primeira semana daquele mês, a linha da média por trás das colunas, sem revestimento, e a média de lista curta devolvendo `null` nas três primeiras semanas.
- `v3_fila-por-etapa-contra-teto`: estoque da fila de pré-vendas por etapa em colunas empilhadas contra o teto de capacidade, em 26 semanas no canvas largo. Demonstra o `stackId` com slot de cor fixo por etapa, o teto como `ReferenceLine` com `ifOverflow="extendDomain"` e rótulo na faixa reservada do topo, o total acima da pilha ancorado numa série auxiliar de valor zero com forma própria, imune a camada de altura zero, e o vão de 2 px entre camadas vizinhas.
- `v4_meta-ausente-e-estorno`: dois meses sem meta cadastrada e um mês negativo por estorno, na mesma receita contra meta da `v1`. Demonstra a meta ausente como `null` com `connectNulls={false}` e nota de vão no desenho parado, a coluna negativa com `ReferenceLine` no zero em `--line-strong`, o domínio que inclui o negativo sem perder tique redondo, o sinal de menos tipográfico sobre o valor absoluto, e a linha da meta por trás das colunas, sem revestimento (nov/26 passa da meta por R$ 6,4 mil e o topo da coluna fica inteiro acima da linha).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a página que vai usar o visual, por exemplo `app/src/pages/<pagina>/visuals/MonthlyRevenueBarLine/`.
2. Troque o `import` de `./data` pelo seletor da página e passe `data` pela prop; o default do `data.ts` fica só como amostra do catálogo.
3. Dê altura ao pai (`<div className="h-72">`, por exemplo, para o canvas de 400 px de altura) ou passe `height`.
4. Na `v2`, o componente gera o calendário semanal a partir das linhas recebidas: semana sem linha vira lacuna (sem coluna, `sem dado` no desenho, média nula nas janelas que a contêm). Se a página sabe que a ausência é zero medido, passa a linha com `closings: 0`. A coluna parcial e a média móvel dependem da flag `partial` da linha do dado: quem cola precisa marcá-la no seletor, senão a semana em curso entra na média e puxa o ritmo para baixo sem medir nada.
5. Na `v3`, o teto e as etapas entram por prop (`capacity`, `stages`); o slot de cor de cada etapa é do dicionário da página, nunca do índice da lista ordenada (COR-3).
6. Se a página passar mais de 8 períodos no recorte, confira se os tiques do eixo de categoria continuam espaçados e legíveis nos dois temas.
7. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar "Line + column" em "Change over Time".
- Exemplo oficial: [Recharts, Line Bar Area Composed Chart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/). Observar `Area`, `Bar`, `Line` e `Scatter` no mesmo `ComposedChart`.
- Praticante: [Datawrapper, New: Dual-axis charts in Datawrapper](https://www.datawrapper.de/blog/dual-axis-charts). Observar as combinações suportadas (colunas e linha, áreas e linha, colunas empilhadas e linha).
- Exemplo técnico: [Vega-Lite, Mean overlay over precipitation chart](https://vega.github.io/vega-lite/examples/layer_precipitation_mean.html). Observar a média calculada pela mesma agregação das barras e desenhada como `rule`.
- Galeria: [AG Charts, Bar And Line Combination Chart](https://www.ag-grid.com/charts/gallery/bar-line-combination/). Observar barras e linhas tracejadas no mesmo eixo, sem eixo secundário, e tooltip compartilhado.
- Exemplo oficial: [Recharts, Same Data Composed Chart](https://recharts.github.io/en-US/examples/SameDataComposedChart/). Observar `XAxis scale="band"` e `barSize` com a linha centrada na banda.
- Pacote instalado, `recharts/es6/cartesian/Bar.js`, linha 667: `!hasCustomShape && (width === 0 || height === 0)` é o filtro que descarta o retângulo de dimensão zero. É a prova de que a série âncora da `v3` precisa de `shape` própria para existir, e é a saída da REC-11.

## Colisões resolvidas a favor do CONTRATO

Declaradas aqui e na nota do `meta.json` de cada versão, como manda a §14.1.

- **`v2`, especificação do catálogo contra a `TIP-3`.** O catálogo pedia "destaque da semana corrente com peso 700 além da cor". Não houve colisão de fato: a `TIP-3` permite peso 700 em **até dois** elementos, e a versão usa **um**, o valor escrito acima da coluna parcial. O segundo canal do destaque não é o peso, é a **forma**: a coluna parcial é vazada, com contorno tracejado na cor da série. A marca de busca do dossiê foi conferida e não virou desvio.
- **`v3`, especificação do catálogo contra a `ROT-4`.** O catálogo pedia legenda "com `legendType` rect e plainline", que só tem efeito com o componente `Legend` do Recharts. Nenhuma das 404 peças do catálogo o usa; ele escreve em HTML dentro de `foreignObject`, onde as guardas `COLISAO-TEXTO` e `CONTRASTE-TEXTO` saem `texto_em_html` sem medir; e ele ordena pela declaração dos filhos, que numa pilha é de baixo para cima, o **contrário** da ordem que a `ROT-4` pede. A legenda é desenhada à mão, com amostra quadrada e na ordem visual da pilha.
- **`v4`, `EIX-6` contra `REC-2`, resolvida pela §14.1 e pela medição.** A `EIX-6` fixa `YAxis width` entre 48 e 64 px. O tique mais longo do domínio com negativo é `−R$ 200 mil`, e a estimativa por largura média de caractere previa 66 px, isto é: bastaria pouco mais que o teto. **A estimativa errou por 14 px.** O primeiro render com 72 px ainda saiu com o tique quebrado em duas linhas, `R$ -200` numa e `mil` na outra, que é a REC-2; com 80 px ele ainda quebra (o formatador passou a devolver o U+2212 antes do símbolo, e o menor eixo em uma linha medido é 81 px); só em **82 px** ele cabe numa linha só. A constante ficou em 82 porque o desvio tem consequência no render, que é o teste da §14.1, e o número veio do PNG e não da conta.
- **`v2` e `v4`, `ROT-3` contra `ROT-7`.** A `ROT-3` pede rótulo no fim de cada linha. Nas duas versões a linha termina sobre uma coluna alta, e o halo que a `ROT-7` torna obrigatório ali abriria uma faixa apagada de cerca de 15 px **dentro** da coluna, partindo a marca. A identificação foi para a legenda acima (`ROT-4`), que de quebra resolve a identificação da série de colunas, um ponto que a revisão da `v1` havia registrado como pendência.
- **`v2`, `v3` e `v4`, `DIC-4` sem `itemSorter`.** O `content` próprio da dica já monta as entradas na ordem visual, então `itemSorter` não teria efeito. A prop ficou fora em vez de entrar morta, que é o defeito que a revisão da `v1` registrou.
- **`v2` e `v4`, canvas por número.** Os presets do catálogo sugeriam `card` de 640x360. Com a legenda, a linha de leitura e a faixa do eixo X da `EIX-6b`, o plano cairia para cerca de 127 px, e a `GEO-1` manda declarar o canvas por número com a conta escrita: ficou 640x400, com a conta na nota de cada `meta.json`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-09-19, sobre a `v1`. Nenhum item abaixo reprova a versão; todos são oportunidade de melhoria para a próxima passada.

- `v1_receita-mensal-contra-meta`: a meta é uma série em patamar (650 por quatro meses, depois degraus de 660, 670, 680, 690 e 700), mas a linha usa `type="monotone"`, que interpola uma rampa contínua entre os meses. Com `stepAfter` ou `linear` o patamar e o salto apareceriam como são; os pontos desenhados já reduzem o efeito, por isso a leitura não fica errada.
- `v1_receita-mensal-contra-meta`: com `Y_AXIS_WIDTH = 58` os tiques de moeda quebram em duas linhas nos dois temas (`R$ 1,0 / mi`, `R$ 800 / mil`). Continua legível e sem corte, mas alguns píxeis a mais de largura devolveriam o tique a uma linha só.
- `v1_receita-mensal-contra-meta`: só a linha de meta tem rótulo direto. A série de colunas é identificada pelo título do `VisualCard` e por eliminação; um rótulo direto ou uma amostra para "Receita reconhecida" tiraria a identificação da dependência do título.
- `v1_receita-mensal-contra-meta`: o `useCase` pergunta por quanto cada mês ficou acima ou abaixo da meta, e a diferença em número só existe na dica e, para o pior mês, na linha de leitura. A distância vertical entre coluna e linha responde a pergunta no desenho, por isso nada essencial fica preso na dica, mas a versão poderia escrever mais um desvio.
- `v1_receita-mensal-contra-meta`: o `itemSorter` do `Tooltip` não tem efeito, porque o conteúdo da dica é próprio e já monta as três entradas na ordem final em `buildTooltipEntries`. É prop morta e pode sair.

- `v1_receita-mensal-contra-meta` (nota do orquestrador, 2026-09-19): o rótulo de fim de linha imprime
  `Meta R$ 700,0 mil`, que é o valor de dezembro, enquanto a meta varia de R$ 650,0 mil em janeiro a
  R$ 700,0 mil em dezembro. A convenção da ROT-3 é essa mesma, valor do último ponto junto do nome da
  série, e a linha sobe à vista, então não é leitura errada; ainda assim, quem copiar este padrão para
  uma série de referência constante deve conferir se o número no fim não está sendo lido como o valor
  do ano inteiro.

### Defeitos da `v1` que a regra proíbe e que as versões novas não copiaram (2026-09-28)

Achados ao ler a `v1` como molde. Cada um cita a regra que vence e a linha do arquivo.

- **`MAX_BAR_SIZE = 30` contra a `ESP-2`** (`v1_receita-mensal-contra-meta/Chart.tsx`, linha 36). A `ESP-2` fixa `maxBarSize` em **no máximo 24 em cartão**, e 30 passa do teto. Sem consequência visível no render, porque a banda de 12 meses não comporta 30 px e o desenho cai em cerca de 20 px: pela §14.1 é observação, não reprovação. As três versões novas usam `BAR_MAX = 24`.
- **`truncate` na linha de leitura cuja cauda carrega o número, contra a `TIP-7`** (`v1_receita-mensal-contra-meta/Chart.tsx`, linha 203). A emenda de 2026-09-28 admite `truncate` só quando a cauda **não** carrega o número nem a conclusão, e a linha da `v1` termina em "R$ X abaixo", que é exatamente o achado. Nas versões novas a conclusão vem na frente (`v2` e `v4`) ou a linha não trunca (`v3`).
- **Linha de `--chart-3` sobre coluna de `--chart-1` sem revestimento, contra a `TOK-10` e a `TOK-9`** (`v1_receita-mensal-contra-meta/Chart.tsx`, linhas 39 e 236). Medido de `tokens.css` nesta sessão: o par mede **1,47:1 no escuro e 1,03:1 no claro**, então no tema claro a linha de meta e a coluna que ela atravessa têm praticamente a mesma luminância. A `v1` tem pontos e rótulo direto, que são segundo canal, mas o traço dentro da coluna continua sem separação. A `v3` desenha o revestimento na cor do cartão por baixo do teto; a `v2` e a `v4` passam a linha por trás das colunas.
- **`YAxis` sem `tickMargin`, contra a `EIX-5`** (`v1_receita-mensal-contra-meta/Chart.tsx`, linha 228). A regra pede `tickMargin={8}` no eixo com grade, e a `v1` o declara no `XAxis` e não no `YAxis`. Constante de acabamento sem consequência medida no render, portanto observação pela §14.1.
- **`ticks` explícito sem `interval={0}`, contra a saída da `REC-29`** (`v1_receita-mensal-contra-meta/Chart.tsx`, linha 219). O eixo pode descartar tique em corpo curto e levar a grade junto; a contramedida é `interval={0}` junto da lista de `ticks`. As versões novas declaram os dois.
- **`XAxis` sem `height` em constante, contra a `EIX-6b`.** A regra nasceu em 2026-09-28, depois da `v1`, então não é defeito de quem produziu: o padrão de 30 px do Recharts fica acima do piso de 23 px e não há consequência no render. As versões novas declaram `X_AXIS_HEIGHT = 24`.

### Observação de método, para quem produzir a próxima versão desta família

O `AXIS_PROPS` do `chartTheme` traz `axisLine` **ligado**, e a ordem do espalhamento decide: `{...AXIS_PROPS} axisLine={false}` desliga, `axisLine={false} {...AXIS_PROPS}` não desliga, e as duas escritas têm os mesmos caracteres. A `v1` acerta a ordem nos dois eixos, e as três versões novas também. É a REC-30, medida em 20 peças do acervo, e a guarda `EIXO-CALMO` mede exatamente essa sobreposição.

### Observações desta leva (2026-09-28), para a próxima passada

- `v3_fila-por-etapa-contra-teto`: nas semanas cujo total fica entre 240 e 260, o rótulo do total nasce na faixa estreita entre o topo da pilha e a linha do teto, e o halo da `ROT-7` apaga um trecho do tracejado ali. Nenhuma guarda acusa, porque a `COLISAO-TEXTO` só compara pares de `<text>` e a linha de referência não é texto, e o rótulo continua legível nos dois temas. Ainda assim o teto sai com o tracejado irregular nessas semanas. A saída, se alguém quiser mexer, não é diminuir o halo, que é fixo em 4 px pela `ROT-7`, e sim escrever o total só nas semanas que passam do teto, aceitando perder o número nas demais.
- `v2` e `v4`: o entalhe do revestimento foi eliminado em 2026-10-02 pela segunda saída da `TOK-10` (linha por trás das colunas). O custo: dentro da coluna a linha não aparece, só no vão entre colunas e acima das mais baixas.

### Revisão independente de 2026-10-02, sobre a `v2`, a `v3` e a `v4`

Veredito: `v3` aprovada; `v2` e `v4` reprovadas, com os bloqueantes em `validation/revisao_08_combinados-e-eixo-duplo__01_coluna-com-linha_2026-10-02.md`. Os itens abaixo **não** reprovam; quem tocar o arquivo alinha na mesma passada.

- `v2_fechamentos-com-media-movel`: o comentário do topo do `Chart.tsx` e a linha da versão neste README dizem "média das quatro semanas anteriores", mas `movingAverage` inclui a própria semana. Os 17,3 da linha de leitura contêm os 19 que ela compara; contra as quatro anteriores a base seria 15,5. O sentido (acima ou abaixo) nunca inverte, só a distância encolhe um quarto. Alinhar o texto ao cálculo ou o cálculo ao texto.
- `v2_fechamentos-com-media-movel`: o `useCase` pergunta pela semana corrente e a linha de leitura responde pela última semana completa sem dizer que é a última completa; a frase acessível diz.
- `v2_fechamentos-com-media-movel`: `truncate` na linha de leitura cuja cauda carrega a base da comparação ("contra média de 17,3 por semana"), contra a `TIP-7`. No preview cabe com folga (cerca de 513 de 574 px), então é latente.
- `v2_fechamentos-com-media-movel`: o revestimento de 6 px tem o mesmo defeito que reprovou a `v4`, só que latente: coluna cujo topo fique a menos de 3 px da linha (0,35 fechamento nesta escala) teria o topo coberto. No preview o caso mais próximo é a semana de 2026-09-07, com uma tampa solta de 2,6 a 3,5 px acima da linha. Aplicar aqui a mesma saída que a `v4` receber.
- `v2_fechamentos-com-media-movel`: as três primeiras semanas não têm média e nada no desenho parado diz por quê (`DIC-5`); a legenda "Média de 4 semanas" deixa inferir, e a dica escreve `formatUnavailable()`.
- `v2_fechamentos-com-media-movel`: a amostra de "Semana parcial" na legenda tem contorno contínuo e a marca tem contorno tracejado.
- `v2_fechamentos-com-media-movel`: na dica da semana parcial a cor da entrada é `--surface-raised`, e a amostra some contra o fundo da dica.
- `v2`, `v3` e `v4`: data e mês escritos na linha de leitura (`formatDate`, `formatMonthShort`) ficam em Manrope sem `tabular-nums`, contra a `TIP-1`. Sem consequência visível.
- `v3_fila-por-etapa-contra-teto`: em 6 das 26 semanas (totais 244, 240, 248 e três 246) o rótulo do total cai sobre a linha do teto e o halo apaga o tracejado ali. O número continua legível nos dois temas, mas sobram tocos de traço colados aos algarismos, e à esquerda do "240" o toco fica na altura em que um sinal de menos ficaria. A saída é o rótulo sair do lugar: quando a tinta dele cruzaria o teto, ancorar acima da linha.
- `v3_fila-por-etapa-contra-teto`: o teto só é identificado pelo rótulo "teto 260 oportunidades", que mora na faixa do topo, 39 px acima da linha e sem amostra do tracejado. Lê por eliminação e pelo valor; uma amostra tracejada na legenda amarraria os dois.
- `v3_fila-por-etapa-contra-teto`: dentro das colunas que cruzam o teto o revestimento tracejado abre janelas retangulares (semanas de 2026-08-31 e 2026-09-07) e dentes no topo das pilhas que terminam rente à linha (259, 260, 264). O total escrito e a cor do rótulo carregam o estado, por isso não reprova.
- `v3_fila-por-etapa-contra-teto`: plural fixo na linha de leitura e na frase acessível; com uma semana acima do teto sairia "1 semanas passaram".
- `v3_fila-por-etapa-contra-teto`: o rótulo em `--negative` das semanas acima do teto fica colado à camada do topo em `--chart-5`, de matiz vizinho nos dois temas. O segundo canal existe (peso 600 e posição acima do tracejado), mas é discreto.
- `v4_meta-ausente-e-estorno`: a nota do `meta.json` ainda declara `Y_AXIS_WIDTH` de 80 e o tique como `R$ -200 mil`, e afirma que "só em 80 px ele volta a caber numa linha só"; o arquivo usa 82 e com 80 o tique quebra. O quinto item de `demonstrates` diz "porque o formatador dá hífen", o que deixou de ser verdade em 2026-10-02; o comentário de `signedCurrency` no `Chart.tsx` repete a mesma razão.
- `v4_meta-ausente-e-estorno`: `truncate` na linha de leitura cuja cauda carrega a segunda conclusão (os meses sem meta), contra a `TIP-7`. Cabe no preview.
- `v4_meta-ausente-e-estorno`: `MissingTargetNote` escreve uma única nota no centro médio dos meses sem meta, o que só está certo quando o vão é contíguo; dois vãos separados ganhariam uma nota no meio, sobre meses que têm meta.
- `v4_meta-ausente-e-estorno`: a meta é patamar (460 até agosto, 480 de setembro em diante) e a linha `linear` desenha uma rampa entre os dois meses, a mesma nota já feita à `v1`.
- `v4_meta-ausente-e-estorno`: com tique a cada dois meses, `abr/26` e `ago/26`, que a linha de leitura nomeia, não têm tique próprio; lê por vizinhança.
- `v4_meta-ausente-e-estorno`: a legenda "Mês negativo por estorno" fixa a causa no texto; quem colar com mês negativo por outro motivo precisa trocar o rótulo.
- `v4_meta-ausente-e-estorno`, conferido a pedido do dono: o tique `−R$ 200 mil` sai em **uma linha só** com `Y_AXIS_WIDTH = 82`, nos dois temas (um `tspan` no `preview.svg`, âncora em x=68, sem corte à esquerda).

### Segunda revisão independente de 2026-10-02, sobre a `v2` e a `v4`, depois da correção

Veredito: `v4` aprovada; `v2` reprovada, com o bloqueante em `validation/revisao_08_combinados-e-eixo-duplo__01_coluna-com-linha_2026-10-02_segunda.md` (o valor `3` da semana parcial, em peso 700, deixou de ser desenhado quando a lacuna entrou no dado, pela `REC-5`; até a correção, a frase "a versão usa um, o valor escrito acima da coluna parcial" da seção de colisões não vale para o render). Os itens abaixo **não** reprovam.

- `v2_fechamentos-com-media-movel`: o dado novo sustenta o título e o caso de uso (a janela de 2026-08-31 a 2026-09-21 não contém a lacuna e dá 17,25), mas a linha da média passou a cobrir 5 das 12 semanas, de 2026-08-24 a 2026-09-21. As quatro semanas depois da lacuna ficam sem média e nada no desenho parado diz por quê (`DIC-5`); a dica escreve `formatUnavailable()`.
- `v2_fechamentos-com-media-movel`: o último ponto da média (17,25 em 2026-09-21), que é o que a linha de leitura compara, fica atrás da coluna de 19. O trecho visível termina na borda da coluna em cerca de 16,9. O sentido está certo e o número está escrito na linha de leitura.
- `v2_fechamentos-com-media-movel`: a mesma ausência sai com duas palavras, `sem dado` escrito à mão no desenho e na frase acessível, e `formatUnavailable()` na dica (`EST-2`). Aceito como anotação de lacuna (`ANO-2`), igual ao `sem meta` da `v4`.
- `v2_fechamentos-com-media-movel`: a frase acessível tem 200 caracteres com uma lacuna e ganha 12 por lacuna a mais; com seis lacunas passa de 250 (`ACE-1`). Com duas lacunas o corpo já tem três anotações (`ANO-1`). Latente, soma à primeira pendência conhecida.
- `v2_fechamentos-com-media-movel`: `buildCalendar` guarda uma linha por semana; se o dado trouxer duas linhas da mesma semana, a última vence em silêncio.
- `v2` e `v4`: o ponto isolado da linha (`renderIsolatedDot`) nasce no `zIndex` 250 da linha, atrás das colunas. Valor isolado abaixo do topo da coluna some sem sinal. Não é exercitado em nenhum dos dois previews.
- `v2` e `v4`: o item 1 da Anatomia ainda diz "para a coluna pintar primeiro e a linha por cima", o contrário do que o item 3 descreve para as duas versões.
- `v4_meta-ausente-e-estorno`: medidas que a nota do `meta.json` pede para conferir e não escreve, tiradas do `preview.svg` (linha de 2,25 px): `nov/26` tem o topo em y=42,41 e a linha de 42,78 a 45,03, isto é, 0,36 px acima da borda de cima da linha, coluna cobrindo a linha; `jun/26` tem o topo em 49,53 com a linha de 47,43 a 49,68 pousada nele, lendo abaixo; `fev/26` (46,48) e `set/26` (38,53) cobrem a linha sem fio solto. Conferido também por coluna de pixels nos dois PNGs.
- `v4_meta-ausente-e-estorno`: no tema claro a linha pousada no topo de `jun/26` se separa da coluna só pelo matiz (1,03:1 de luminância). A distância ali é de R$ 4,2 mil, 0,98 px, abaixo do que a escala resolve.
- `v4_meta-ausente-e-estorno`: o comentário de `signedCurrency` diz que o formatador de moeda compacta não aplica o sinal ao negativo; desde 2026-10-02 ele aplica. O resultado continua certo porque a função formata o valor absoluto.
- `v4_meta-ausente-e-estorno`: o `useCase` do `meta.json` ("Como ler receita contra meta com dois meses sem meta…") tem redação diferente da do catálogo ("Como mostrar receita contra meta quando dois meses não têm meta cadastrada…"), com o mesmo sentido.

### Terceira revisão independente de 2026-10-15, sobre a `v2`, depois da segunda rodada de correção

Veredito: `v2` aprovada. O bloqueante da segunda revisão de 2026-10-02 está resolvido: o rótulo lê `partialClosings` pelo `dataKey` e não depende mais do índice do retângulo. Conferido no `preview.svg` dos dois temas: `3` em peso 700, Space Grotesk tabular de 12 px, com halo, em x=542,4 (centro da coluna vazada, de 533,9 a 550,9) e linha de base em y=168,2, 8 px acima do topo da coluna (176,2); é o único texto em 700 do corpo. Calendário de 12 segundas-feiras com a lacuna de 2026-07-27 escrita `sem dado` em x=155,5 e sem coluna; média sobre o calendário de 14,5, 15,75, 15,25, 15,5 e 17,25 de 2026-08-24 a 2026-09-21, batendo com o `d` da linha. Render com 0,04% e 0,05% de diferença. Os itens abaixo **não** reprovam; as observações anteriores que continuam valendo (item 1 da Anatomia, amostra da semana parcial com contorno contínuo) não foram repetidas.

- `v2_fechamentos-com-media-movel`: a frase acessível diz "28/09/2026 parcial, fora da média" sem o valor `3`, que é justamente o destaque em peso 700 do desenho, e compara "19 contra média de 17,3" sem a palavra "acima", que a linha de leitura escreve (`ACE-1`, conclusão dita). Cabem os dois com folga no teto de 250 caracteres.
- `v2_fechamentos-com-media-movel`: semana parcial com zero fechamento até a data, o caso comum na segunda-feira, perde a coluna vazada e o rótulo juntos: o Recharts descarta o retângulo de altura zero e o `LabelList` nasce dessa mesma lista (`REC-11`). Sobraria só a nota "parcial até". Não é exercitado no preview; a saída é a da `REC-11` (`shape` própria na `Bar`) ou o valor numa camada própria, como a `MissingWeekMarks`.
- `v2_fechamentos-com-media-movel`: o `demonstrates` do `meta.json` não lista o item 4 do catálogo, "Destaque da semana corrente com peso 700 além da cor", que o render agora demonstra. A lista está no teto de 6 itens, então o ajuste é fundir no quarto item ("Semana corrente vazada…").
- `v2_fechamentos-com-media-movel`: a data da nota "parcial até 28/09/2026" vai num `tspan` `font-display` sem peso declarado, isto é, Space Grotesk 400, que não é carregado (`TIP-4`); o navegador cai no 500 e, nos dois PNGs, a data pesa visivelmente mais que o resto da nota, perto de competir com o `3`. Sem colisão nem corte.
- `v2_fechamentos-com-media-movel`: o rótulo `3` e os tiques do eixo saem sem substantivo; a unidade está na legenda ("Fechamentos na semana") e na linha de leitura ("19 fechamentos"), então o desenho não afirma unidade errada. A `NUM-6` literal pediria "3 fechamentos" no rótulo, se couber sobre a banda de 43 px.

## Pendências conhecidas

- `v2_fechamentos-com-media-movel`, calendário (catálogo, item 3): o preview exercita uma lacuna só (2026-07-27). Lacuna na semana adjacente à parcial ou duas lacunas seguidas não foram renderizadas; a marca `sem dado` ocupa a banda de 43 px e não foi medida com duas lacunas vizinhas.
- `v2_fechamentos-com-media-movel`, `TIP-7`: a linha de leitura ainda usa `truncate` com a base da comparação na cauda; cabe no preview, é latente.
- `v4_meta-ausente-e-estorno`, `MissingTargetNote`: escreve uma nota só no centro médio dos meses sem meta, o que só acerta com vão contíguo.
