# Eixo duplo com domínios calculados

## O que é

Duas medidas de unidades diferentes no mesmo quadro, cada uma no seu eixo y, com os domínios decididos por função pura em TypeScript e nunca pelo automático do Recharts: os dois começam em zero, têm o mesmo número de marcas e o eixo, o tique e a série usam a mesma cor. A forma legítima é coluna de quantidade com linha de taxa; linha e linha só com regra de escala declarada por índice; colunas nos dois eixos é o antipadrão catalogado, com a correção ao lado. Sem essa disciplina de domínio, o eixo duplo vira o instrumento que a literatura de visualização mais recomenda evitar, porque a mesma forma pode ser desenhada para provar qualquer relação.

**O que as quatro versões deste modelo dizem juntas, e elas não dizem a mesma coisa.** A `EIX-8` do CONTRATO é literal e não tem exceção registrada, então cada versão tomou uma decisão própria sobre o segundo eixo e escreveu a conta do domínio na própria peça: a `v1` e a `v3` usam dois eixos e declaram o desvio, a `v2` **recusa** o segundo eixo e resolve por índice na mesma data base, e a `v4` usa dois eixos como **objeto de estudo**, ao lado da correção em painéis que a própria `EIX-8` prescreve. Ler as quatro na ordem é ler o argumento inteiro: onde o segundo eixo é evitável, onde ele custa uma declaração, e onde ele mente.

## Quando usar

- Quantidade e taxa sobre o mesmo tempo, para um público habituado ao cartão: leads e percentual qualificado, agendas e taxa de comparecimento.
- Duas séries de unidades diferentes ao longo do tempo, com a regra de escala por índice escrita no rodapé do corpo.
- Até 26 períodos, uma série por eixo e no máximo uma linha no eixo secundário.

## Quando evitar

- Público geral sem mediação: use `03_paineis-alinhados` ou o índice base 100 de `04_linhas/02_multiplas-series`.
- Duas grandezas absolutas em colunas: é o antipadrão; troque por painéis ou por `03_colunas-verticais/08_colunas-em-small-multiples`.
- Mesma unidade nas duas séries: use `01_coluna-com-linha`, que tem um eixo só.
- Leitura de nível ou de cruzamento entre as séries: a escala é arbitrária e o cruzamento não significa nada.
- Mais de duas séries, ou taxa de crescimento num eixo e valor bruto no outro.
- Quando a regra de escala converte as duas séries na mesma unidade, como o índice da `v2`: aí o segundo eixo não é escolha de desenho, é sobra, e a `EIX-8` manda tirá-lo.

## Anatomia

1. **Eixo esquerdo (quantidade).** `YAxis yAxisId` com domínio `[0, top]` calculado por função pura a partir do maior valor, tique e cor da série em `--chart-1`, formatado por `formatInt` ou `formatCurrencyAxis`.
2. **Eixo direito (a segunda medida).** `YAxis orientation="right"` com o mesmo número de marcas do esquerdo, tique em `--chart-3`. Na `v3` o domínio dele não tem escolha nenhuma: uma taxa tem teto natural de 100%.
3. **Marcas como frações iguais do domínio.** Os dois eixos partem de zero e são divididos no mesmo número de pedaços iguais, então a enésima marca de um cai no pixel da enésima marca do outro e uma grade só serve aos dois. É o que substitui o arredondamento independente de cada eixo, que faria a grade mentir para um deles.
4. **Colunas.** `Bar` na cor do eixo esquerdo, com `barCategoryGap` entre 30% e 40% e `maxBarSize` de no máximo 24 (ESP-2). Zero medido leva `minPointSize` e escreve o número, porque sem isso o Recharts descarta o retângulo de altura zero (REC-11, EST-3).
5. **Linha.** `Line` na cor do eixo direito, **com revestimento na cor do cartão por baixo do traço**. Medido de `tokens.css`: `--chart-3` contra `--chart-1` mede 1,47:1 no escuro e 1,03:1 no claro, então a linha desaparece dentro da coluna que ela atravessa se contar só com a cor. É a saída da `TOK-10`, que não tem token possível.
6. **Grade.** `CartesianGrid` só no `yAxisId` do eixo principal, `vertical={false}`.
7. **Dica.** `ChartTooltip` com `payload` montado à mão a partir da linha do dado, valores já formatados em texto, porque a dica do Farol tem um formatador só e aqui há duas unidades (REC-6). Taxa sai por `formatRateWithVolume`, com numerador e denominador.
8. **Rodapé com a conta do domínio.** Uma a três linhas de 11 px, calculadas do dado, dizendo os dois domínios, o passo e quantas marcas; e, onde há dois eixos, que o encontro das marcas não significa nada. Domínio calculado que não está escrito não demonstra nada.
9. **Linha de leitura.** Frase no topo do corpo, calculada do dado, com a conclusão na frente (ANO-5, TIP-7).
10. **Vazio e ausência.** `data` vazio troca o gráfico inteiro por um bloco `role="status"` (EST-1); toda agregação de lista devolve `number | null`, nunca zero (EST-1b), e a taxa sem denominador some do desenho com `connectNulls={false}`.

## Versões

- `v1_leads-e-percentual-qualificado`: leads mensais em coluna e percentual qualificado em linha, domínios calculados por função pura, eixos coloridos por série e dica com o denominador da taxa.
- `v2_cpl-e-leads-em-duas-linhas`: custo por lead e volume de leads em duas linhas, as duas em índice sobre o primeiro mês do recorte, **num eixo só**. Demonstra que a regra de escala por índice converte reais por lead e contagem na mesma unidade e assim dispensa o segundo eixo, o domínio de índice em passo que divide 100 para a base cair sempre num tique, o aviso medido quando o eixo comum achata a série de menor amplitude, e a forma do ponto como segundo canal porque `--chart-1` contra `--chart-3` mede 1,03:1 no tema claro.
- `v3_agendas-e-comparecimento-26-semanas`: agendas por semana em coluna e taxa de comparecimento em linha, em 26 semanas. Demonstra o eixo de taxa no teto natural de 100%, que não é escolha de autor nenhuma, as marcas como frações iguais dos dois domínios para a grade servir aos dois, a semana sem agenda como zero medido na coluna e taxa nula no desenho, o comparecimento acima de 100% tratado como dado inválido e marcado na coluna e por palavra, e um tique por mês ancorado na primeira semana daquele mês.
- `v4_antipadrao-colunas-em-dois-eixos`: investimento e leads por plataforma em colunas de dois eixos, ao lado da correção em dois painéis alinhados. Demonstra a taxa de câmbio implícita entre os dois tetos impressa na peça, a inversão do veredito visual de duas das cinco plataformas quando o teto de um eixo sobe um passo sem nenhum número mudar, a guarda de eixo duplo como função pura executável pela prop `antipattern`, e os dois painéis da correção com a mesma escala de categoria, a mesma margem e a mesma largura de eixo (EIX-12).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a página de destino e troque o `data` fixo pelo seletor real.
2. Se a página já tem paleta de cor por série diferente da ordem 1, 3 do CONTRATO, ajuste as duas constantes de cor juntas, nos dois lugares onde cada uma aparece (eixo e marca), nunca só num deles.
3. Ao trocar o recorte de tempo, mantenha o número de marcas fixo: é ele que garante que os dois eixos continuem coincidindo depois da troca de dado.
4. Na `v2`, a data base do índice é a primeira linha de `data`: quem cola decide qual é o mês de referência ao montar o recorte, e o rodapé imprime o mês escolhido sozinho.
5. Na `v3`, a semana com mais comparecimentos que agendas é erro da origem, e o componente a trata como dado inválido em vez de taxa acima do teto. Quem cola deve conferir se o seletor não está contando comparecimento de agenda remarcada.
6. Na `v4`, passe `antipattern={false}` em qualquer uso que não seja didático: a metade errada sai do desenho e o motivo da recusa aparece no lugar dela.
7. Embrulhe no `VisualCard` do Farol; o título e o caso de uso do `meta.json` viram `title` e `subtitle`.

## Referências

- [Highcharts, Dual axes, line and column](https://www.highcharts.com/demo/highcharts/combo-dual-axes): o eixo oposto e a combinação de tipos.
- [Datawrapper, What to consider when creating dual-axis charts](https://www.datawrapper.de/blog/dual-axis-charts-guide): zeros alinhados, cor por eixo, eixo mais importante à esquerda.
- [Flourish, Dual axis charts: why they spark debate, and how to get them right](https://flourish.studio/blog/dual-axis-charts/): linha com coluna para evitar cruzamentos aleatórios.
- [Free Range Statistics, Dual axes time series plots may be ok sometimes after all](https://freerangestats.info/blog/2016/08/18/dualaxes): a regra de escala por índice e as condições em que duas linhas se sustentam.
- [Recharts, Biaxial Line Chart](https://recharts.github.io/en-US/examples/BiaxialLineChart/): `yAxisId` e `orientation="right"`.
- [Recharts, YAxis API](https://recharts.github.io/en-US/api/YAxis/): `domain` por função, `allowDataOverflow` e os valores de `niceTicks`.
- [Recharts, CartesianGrid API](https://recharts.github.io/en-US/api/CartesianGrid/): `yAxisId` para a grade seguir só o eixo principal.
- [Stephen Few, Dual-Scaled Axes in Graphs](https://www.perceptualedge.com/articles/visual_business_intelligence/dual-scaled_axes.pdf): eixo duplo nunca deve codificar só barras.
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis): escalas arbitrárias e cruzamentos sem significado.
- [Recharts, Biaxial Bar Chart](https://recharts.github.io/en-US/examples/BiaxialBarChart/): como a biblioteca permite colunas em dois eixos sem alerta, base do antipadrão da `v4`.
- Pacote instalado, `recharts/es6/state/selectors/combiners/combineAllBarPositions.js`, linha 58: `var originalSize = (bandSize - 2 * _offset - (len - 1) * realBarGap) / len;`. É a prova de que o vão de categoria é descontado dos **dois** lados da banda, e é a conta de espessura que os `meta.json` da `v3` e da `v4` reproduzem.

## Colisões resolvidas a favor do CONTRATO

Declaradas aqui e na nota do `meta.json` de cada versão, como manda a §14.1. A régua é a mesma nas três: onde o catálogo e o CONTRATO colidem de fato, o CONTRATO vence.

- **`v2`, especificação do catálogo contra a `EIX-8`, resolvida a favor do CONTRATO.** O catálogo pede "linha e linha **em eixo duplo** com escala por índice na mesma data base"; a `EIX-8` do [CONTRATO.md](../../CONTRATO.md), **linha 568**, diz "Sem eixo duplo. Duas grandezas viram dois gráficos alinhados, com o mesmo eixo X e o mesmo `syncId`", e a §14.1 põe domínio e sentido de eixo entre as regras que bloqueiam **sempre**. A colisão é de fato e o segundo eixo saiu. O detalhe que decide: a própria regra de escala que a versão pede é o que torna a renúncia possível, porque dividido pelo valor da data base um real por lead e um lead viram a **mesma** unidade, o índice. O preço, o achatamento da série de menor amplitude, está medido (razão de 2,8 entre as amplitudes) e escrito na peça.
- **`v3`, `EIX-8` contra a demonstração da versão, resolvida com desvio declarado.** Aqui o segundo eixo ficou, e o motivo é que a demonstração da versão não existe sem ele: "marcas como frações iguais do domínio para as marcas coincidirem" só faz sentido entre dois eixos. O desvio está declarado na nota do `meta.json`, com a linha da regra, e a peça compensa do jeito que dá: o domínio da taxa não tem escolha de autor (teto natural de 100%), a única escolha que resta está impressa no rodapé, e o rodapé diz por escrito que onde a linha encosta nas colunas não há relação a ler.
- **`v4`, `EIX-8` como objeto de estudo.** Desenhar o defeito para nomeá-lo não é cometê-lo, e é a mesma licença pela qual o catálogo tem versões de antipadrão. A metade errada vem rotulada como antipadrão, a correção que a `EIX-8` prescreve está no mesmo cartão, e a guarda que recusaria o desenho é uma função pura que a prop `antipattern` executa.
- **`v4`, `COR-6` e a cor do rótulo do antipadrão.** A `COR-6` manda a semântica seguir a polaridade da **métrica**, e nenhuma métrica desta peça é colorida por polaridade. O `--negative` qualifica o **desenho**, não um número, e a palavra "Antipadrão" carrega o mesmo sinal sem depender de cor (ACE-2). O rótulo da correção ficou em `--text-secondary` em vez de `--positive`, para não sugerir que exista uma métrica verde ali.
- **`v2` e `v3`, `EIX-7` com mais de 8 categorias.** A `EIX-7` obriga `interval={0}` até 8 categorias e admite o descarte acima disso. A `v2` imprime os 12 meses com `interval={0}` porque o respiro entre os rótulos foi **medido** em 12,3 px, acima do piso de 4 px da `ROT-9`; a `v3` não imprime as 26 semanas, e sim um tique por mês ancorado na primeira semana daquele mês (REC-21), que é como caber 26 períodos sem girar texto (TIP-5).
- **`v3` e `v4`, canvas por número.** Os presets sugeridos pelo catálogo (`largo` de 960x400) não fecham depois das linhas escritas que o contrato obriga, e a `GEO-1` manda declarar o canvas por número com a conta na nota: a `v3` ficou em 1000x460 e a `v4` em 1120x560, com a conta e o motivo da largura escritos em cada `meta.json`.

## Defeitos da `v1` que a regra proíbe e que as versões novas não copiaram (2026-09-29)

Achados ao ler a `v1` como molde, como manda o dossiê. Cada um cita a regra que vence e o arquivo.

- **`label={{ value: '% qualif.' }}` contra a `ROT-8`** (`v1_leads-e-percentual-qualificado/Chart.tsx`, no `YAxis` do eixo direito). A `ROT-8` é literal: "Sem sigla nem abreviação inventada em rótulo, legenda e eixo". `% qualif.` é abreviação inventada. Há consequência de leitura, não só de acabamento, então pela §14.1 é bloqueante para quem escrever a próxima versão. As versões novas não usam título de eixo abreviado: a `v2` escreve `índice` por extenso, e a `v3` e a `v4` identificam as séries pela legenda e pela unidade no próprio tique, sem título de eixo.
- **Linha de `--chart-3` sobre coluna de `--chart-1` sem revestimento, contra a `TOK-10`** (`v1/Chart.tsx`, constantes `LEADS_COLOR` e `RATE_COLOR` e a `Line` da taxa). Medido de `tokens.css` nesta sessão: o par mede **1,47:1 no escuro e 1,03:1 no claro**, então no tema claro a linha da taxa e a coluna que ela atravessa têm praticamente a mesma luminância. A `v1` tem pontos e rótulo direto no último ponto, que são segundo canal, mas o traço dentro da coluna continua sem separação. A `v3` desenha o revestimento na cor do cartão por baixo do traço.
- **`HEADROOM = 1.16` multiplicando o domínio contra a própria conta de marcas** (`v1/Chart.tsx`, constante `HEADROOM` e as duas props `domain`). O domínio vira `top × 1,16` enquanto os `ticks` continuam em `top`, então a última marca não é o fim do eixo e a coluna mais alta ocupa cerca de 65% do plano. Não é desvio de regra escrita, e a honestidade se mantém porque o zero está na base; mas a folga do topo é problema de **margem**, não de domínio, e as versões novas reservam espaço por `MARGIN.top` em vez de inflar a escala.
- **`ticks` explícito sem `interval={0}`, contra a saída da `REC-29`** (`v1/Chart.tsx`, os dois `YAxis`). O eixo pode descartar tique em corpo curto e levar a grade junto. As versões novas declaram `interval={0}` no eixo de categoria junto da lista de `ticks`.
- **`XAxis` sem `height` em constante, contra a `EIX-6b`** (`v1/Chart.tsx`). A regra nasceu depois da `v1`, então não é defeito de quem produziu, e o padrão de 30 px do Recharts fica acima do piso de 23 px. As versões novas declaram `X_AXIS_HEIGHT = 24`.

**Conferido e NÃO é defeito, para ninguém repetir a atribuição errada:** o `barCategoryGap="34%"` da `v1` está **dentro** da faixa de 30% a 40% da `ESP-2`, e o `maxBarSize={28}` dela passa do teto de 24 em cartão, o que pela §14.1 é observação e não reprovação, porque a banda de 8 meses não comporta 28 px e o desenho cai abaixo disso. O `itemSorter` ausente também não é defeito: o `content` próprio já monta as entradas na ordem visual, e prop morta engana quem copia.

## Observações da revisão (não bloqueantes)

- `v1_leads-e-percentual-qualificado`: a `EIX-8` do CONTRATO proíbe eixo duplo sem exceção registrada, e o próprio catálogo anota a tensão em "quando evitar". A versão foi revisada pelo que o catálogo pede, mas a exceção precisa ser registrada pelo dono do contrato para o modelo sair do limbo. **Isso segue aberto depois desta leva**, e agora com três versões a mais apoiadas na mesma pendência.
- `v1_leads-e-percentual-qualificado`: o `CartesianGrid` desenha seis linhas, uma a mais que as cinco marcas, porque a borda superior da área de plotagem vira linha; ela não tem tique nem valor em nenhum dos dois eixos.
- `v1_leads-e-percentual-qualificado`: o `data.ts` traz oito meses limpos e não exercita nenhum caso difícil. O caso ficou para a `v3`, que agora existe em disco e traz os dois modos de a taxa não existir.
- `v2_cpl-e-leads-em-duas-linhas`: por construção do índice as duas séries valem 100 no mês da base, então os dois pontos coincidem no primeiro mês e o quadrado cobre o círculo ali. É inerente ao encoding e não há o que corrigir sem mentir; a identificação das séries acontece no fim de cada linha, onde elas estão a 91 px uma da outra.
- `v2_cpl-e-leads-em-duas-linhas`: o revestimento da `TOK-10` foi tentado e rejeitado, porque a faixa de 6 px da linha de cima apagaria o ponto da outra série justamente naquele ponto compartilhado. Se um recorte futuro fizer as duas linhas se cruzarem muitas vezes, vale reavaliar o revestimento **e** o ponto da base juntos, nunca um sem o outro.
- `v3_agendas-e-comparecimento-26-semanas`: o eixo da taxa vai de 0% a 100% e as taxas medidas ficam entre 52,6% e 81,3%, então a linha ocupa a metade de cima do plano e a metade de baixo fica vazia. É o preço do teto natural, e ele é preferível a um domínio recortado que exageraria a variação; quem quiser a variação ampliada precisa mudar de forma, não de domínio.
- `v3_agendas-e-comparecimento-26-semanas`: os dois vãos da linha da taxa têm causas diferentes, semana sem agenda e semana com dado inválido, e no desenho parado eles se parecem. O que os distingue é a coluna vazada na semana inválida, o zero escrito na semana sem agenda e o rodapé, que nomeia as duas datas. Um marcador próprio no vão seria mais direto, mas nenhuma posição vertical para ele é honesta, porque a taxa ali não existe.
- `v4_antipadrao-colunas-em-dois-eixos`: **a conta glifo a glifo não bastou para a largura do eixo de moeda, e o número veio do PNG.** `R$ 60 mil` soma 46,20 px pela tabela de `colisao.mjs` e com o `tickMargin` de 8 pede 54,2 px, então 56 px deveriam servir; o primeiro render saiu com o tique quebrado em `R$ 60` e `mil`, que é a `REC-2`. A largura foi para 64 px, que é o teto da `EIX-6`, e ali coube numa linha só. Como 54,2 px está **abaixo** do teto, a correção certa foi alargar o eixo, e não encurtar a unidade do rótulo; acima de 64 px é que a largura viraria sinal de unidade errada. É o mesmo tipo de erro que a `01_coluna-com-linha/v4` registrou, ali com 14 px de diferença.
- `v4_antipadrao-colunas-em-dois-eixos`: o painel de cima da correção reserva 24 px de faixa de eixo sem imprimir tique, para os dois painéis terem o mesmo plano e a mesma coluna de pixels por plataforma (EIX-12). São 24 px de corpo gastos em alinhamento, e é o preço de painéis que se comparam de verdade.
- `v4_antipadrao-colunas-em-dois-eixos`: vazado nesta peça quer dizer "a outra série", enquanto na `01_coluna-com-linha` ele quer dizer "período parcial". Os dois usos são legítimos no lugar em que estão, e a legenda desambigua em cada peça, mas quem varrer a família inteira vai encontrar o mesmo desenho com dois significados. É candidato a convenção de casa.

Revisão independente de 2026-10-14 (v2, v3 e v4). A `v2` foi reprovada por um bloqueante, descrito em `validation/revisao_08_combinados-e-eixo-duplo__02_eixo-duplo-com-dominios-calculados_2026-10-14.md`; os itens abaixo não reprovam.

- `v2_cpl-e-leads-em-duas-linhas`: a linha de leitura fixa o verbo "subiu". Com os dois índices abaixo de 100 ela escreveria "O custo subiu mais que o volume", e no empate "O volume subiu mais que o custo".
- `v2_cpl-e-leads-em-duas-linhas`: o aviso de achatamento só sai quando o custo varia mais que o volume (`costAmplitude / leadAmplitude`), e o texto tem as duas séries fixas; com o volume variando 1,5 vez mais, a série achatada é a do custo e nenhum aviso aparece.
- `v2_cpl-e-leads-em-duas-linhas`: com o primeiro mês sem lead, `scale` vira `null` e o plano ainda desenha grade de domínio automático, o título "índice" e a linha "base 100" sem nenhuma série; devia dar lugar ao bloco de indisponível da EST-2.
- `v2_cpl-e-leads-em-duas-linhas`: rótulo de fim de linha na cor da série e em peso 600, e não em `--text-secondary` com marcador na cor, como a ROT-3 descreve; o contraste medido passa nos dois temas.
- `v2_cpl-e-leads-em-duas-linhas`: "R$ 150,00 por lead" no rodapé leva centavo, que a NUM-1 reserva para tabela de detalhe; e os meses em texto corrido ("jan/26", "dez/26") ficam fora de `tabular-nums` (TIP-1), sem efeito visível.
- `v3_agendas-e-comparecimento-26-semanas`: a frase acessível diz "As agendas foram de 0 a 38, e o comparecimento caiu de 81,3% na semana mais vazia", mas a semana mais vazia é a de 0 agendas, que não tem taxa; os 81,3% são da semana de 16. A linha de leitura já escreve certo ("na de 16").
- `v3_agendas-e-comparecimento-26-semanas`: o verbo "caiu" é fixo na frase acessível; se a taxa subir nas semanas cheias, a frase inverte o sentido, enquanto a linha de leitura trata os dois casos.
- `v3_agendas-e-comparecimento-26-semanas`: no rodapé de ausência, com só a semana inválida a frase começa em ", e a de"; com mais de uma semana sem agenda ou inválida, só a primeira é nomeada enquanto a contagem soma todas.
- `v3_agendas-e-comparecimento-26-semanas`: a conclusão da linha de leitura sai de dois extremos (a semana mais cheia e a mais vazia com taxa), e não da tendência das 24 semanas medidas; com outro recorte, um extremo atípico decide a frase.
- `v3_agendas-e-comparecimento-26-semanas`: o "0" da semana sem agenda sai em peso 700, que a TIP-3 reserva ao nome e ao valor do destaque; e o tique do eixo esquerdo não traz unidade, que vem só da cor e do rodapé.
- `v3_agendas-e-comparecimento-26-semanas`: na dica da semana inválida a amostra é `--surface-raised`, sobre o `bg-surface-overlay` do `ChartTooltip`, que no tema claro é o mesmo branco; a amostra some e fica só o nome.
- `v4_antipadrao-colunas-em-dois-eixos`: a frase acessível diz quem lidera o investimento e não a conclusão da peça, a inversão de 3 para 1 das 5 plataformas com o teto seguinte; e usa `formatCurrencyAxis` ("R$ 58 mil") onde a NUM-1 pede `formatCurrencyCompact` ("R$ 58,4 mil").
- `v4_antipadrao-colunas-em-dois-eixos`: com `antipattern={false}`, que o passo 6 de Como colar manda usar fora do uso didático, a frase acessível continua anunciando "o antipadrão de colunas ... em dois eixos", o motivo da recusa aparece duas vezes (no lugar do desenho e no rodapé) e o aviso "Essa taxa é escolha do autor" fala de um desenho que não está na tela.
- `v4_antipadrao-colunas-em-dois-eixos`: a EIX-8 prescreve o mesmo `syncId` nos painéis da correção, e os dois `BarChart` não o têm; o cursor de um não acompanha o outro. Sem efeito no preview.
- `v4_antipadrao-colunas-em-dois-eixos`: na mensagem da guarda, "600" sai sem substantivo (NUM-6 pede "600 leads") e "Leads" com maiúscula no meio da frase; "R$ 100,00" e "R$ 75,00" levam centavo (NUM-1).
- `v4_antipadrao-colunas-em-dois-eixos`: "as que parecem eficientes" não se define na peça; a regra implícita é a coluna vazada mais alta que a cheia, e uma oração no aviso a deixaria explícita.
- `v4_antipadrao-colunas-em-dois-eixos`: o rótulo "Antipadrão" em `--negative` é cor semântica num estado do desenho e não de métrica; a palavra carrega o sentido sozinha (ACE-2), e a escolha está declarada em Colisões resolvidas.
- `v3` e `v4`: a exceção da EIX-8 continua sem registro do dono do contrato. A `v3` foi aprovada no mesmo regime da `v1` e do `04_pareto/v1` (eixo duplo com sinal: cor de tique, zero alinhado, marcas coincidentes e rodapé que nega a leitura de cruzamento).

Segunda revisão independente de 2026-10-14 (`v2`, depois da correção). O bloqueante da primeira passada foi resolvido: a frase acessível escreve a ausência do último mês pelo nome, sem índice de reposição, e o rótulo de fim de linha se ancora no último ponto presente de cada série. A `v2` foi aprovada. Os itens abaixo não reprovam, e os cinco da `v2` anotados no parágrafo anterior seguem abertos no código.

- `v2_cpl-e-leads-em-duas-linhas`: a frase acessível tem um motivo só para o custo sem índice, "porque não houve lead". Com o mês da base sem investimento e com leads, `baseCost` vale 0, `toIndex` devolve `null` em todos os meses, a linha do custo some do plano, a frase atribui a ausência à falta de lead e o rodapé imprime "R$ 0,00 por lead".
- `v2_cpl-e-leads-em-duas-linhas`: um mês do meio sem lead abre o vão certo na linha do custo (EIX-10), mas nada no desenho nem no rodapé nomeia o mês; a ACE-2 pede palavra para a ausência e a DIC-5 não deixa o nulo só na dica. A `v3` nomeia os vãos no rodapé e serve de molde. O `data.ts` padrão não exercita esse ramo.
- `v2_cpl-e-leads-em-duas-linhas`: `buildIndexDomain` não tem piso de marcas. Com todos os índices entre 95 e 100 sai com duas (a EIX-4 pede de 3 a 5); com um mês só o domínio vira `[100, 100]`, a peça desenha linha de um ponto (EIX-11) e a frase diz "em 1 meses".
- `v2_cpl-e-leads-em-duas-linhas`: na dica, o `activeDot` padrão do Recharts desenha círculo com anel `#fff` nas duas séries, então sob o cursor o volume perde o quadrado que é o segundo canal; a ordem das entradas é fixa (custo, depois leads) e só segue a ordem visual enquanto o custo terminar acima; o cursor usa o literal `var(--line-strong)` em vez de `CURSOR_COLOR`, de mesmo valor.
- `v2_cpl-e-leads-em-duas-linhas`: o deslocamento de 14 px do rótulo "base 100" é número solto no `renderBaseLabel`, e não constante nomeada no topo (seção 5); o último ponto presente de cada série é recalculado a cada chamada do rótulo, em vez de uma vez antes do JSX. Nenhum dos dois tem efeito no preview.
- `v2_cpl-e-leads-em-duas-linhas`: a nota do `meta.json` diz que a frase acessível mede 192 caracteres; depois da correção ela mede 207, ainda dentro da ACE-1.
