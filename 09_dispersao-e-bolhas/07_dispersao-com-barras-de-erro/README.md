# Dispersão com barras de erro

## O que é

Cada ponto é uma estimativa, não um valor exato, e carrega um intervalo em Y, em X ou nos dois. O traço vertical ou horizontal ao redor do ponto mostra a faixa de incerteza calculada a partir do próprio volume que gerou a estimativa: quem tem poucos casos carrega um intervalo largo, quem tem muitos carrega um intervalo estreito. A leitura correta é comparar os intervalos, não só os pontos: duas entidades só se distinguem de fato quando os intervalos não se sobrepõem.

**O desenho precisa dizer o que a barra representa, e isso não é preferência de quem desenha.** Desvio padrão, erro padrão, intervalo de 95% de confiança e faixa de mínimo a máximo produzem barras de tamanhos muito diferentes sobre o mesmo dado: sobre a mesma taxa, o intervalo de 95% chega a ser cerca de quatro vezes o erro padrão, e a faixa de mínimo a máximo cresce com o número de observações em vez de encolher. Barra sem nome convida o leitor a concluir o que quiser, e ele vai concluir a leitura mais favorável. É a mesma classe de defeito que a [`GEO-12`](../../ARMADILHAS.md) registra, critério que decide o desenho e não aparece em lugar nenhum do cartão. Por isso as quatro versões deste modelo nomeiam a barra em pelo menos dois lugares, e a `v3`, que tem duas barras de origens diferentes no mesmo ponto, nomeia cada uma em três.

## Quando usar

- Taxas por entidade com volumes diferentes, como taxa de agenda por SDR contra leads trabalhados.
- Separar quem está de fato acima ou abaixo de uma referência do time de quem só parece estar, pela largura do intervalo.
- Estimativas com incerteza conhecida nos dois eixos, como CPL médio e taxa de qualificação por canal.
- De 4 a cerca de 25 pontos, para as barras de erro não se cruzarem umas com as outras.

## Quando evitar

- Incerteza desconhecida ou inventada: sem método declarado para calcular o intervalo, use a dispersão simples (modelo 01).
- Barras de erro sobre colunas: criam o viés de achar mais provável o que está dentro da barra; a forma correta mantém o ponto.
- Muitos pontos com intervalos largos, que viram uma cerca de traços ilegível: prefira pontos por categoria com intervalo (família 17, dumbbell e afins).
- Público que não sabe o que é intervalo de confiança: escreva o volume junto da taxa, nunca só o percentual.
- Entidade abaixo de um piso de amostra: o intervalo dela cobre meio eixo, e a largura passa a ser lida como se fosse informação sobre a entidade. O caminho está na `v4`.

## Anatomia

1. Eixo X e eixo Y numéricos, cada um com domínio explícito e tique com unidade (`formatInt` com o substantivo, `formatCurrencyAxis` em moeda, `formatPercent` sem casa), pela EIX-4 e EIX-6. Na `v4` o domínio e os tiques são **derivados do dado**, não constantes, porque a régua ali é justamente o que entra e o que não entra na conta.
2. Grade nos dois sentidos, em `var(--line-subtle)`, pela **EIX-3b**: os dois eixos são quantitativos e a marca é lida por posição nos dois, então a grade nos dois sentidos é a régua do desenho e não enfeite. O eixo sai **calmo** pela EIX-5, com `axisLine={false}`, `tickLine={false}` e `tickMargin={8}` escritos **depois** do `{...AXIS_PROPS}`, porque em JSX a última propriedade vence e o `AXIS_PROPS` do módulo compartilhado traz `axisLine` ligado.
3. Ponto em `--chart-1` quando a série é única (`v1`, `v3`, `v4`), ou em `--positive` e `--negative` quando o papel de cada ponto é o veredito contra uma referência (`v2`), com o neutro em `--text-muted`.
4. Intervalo de confiança pelo método de **Wilson**, em função pura de TypeScript, a partir da contagem bruta, nunca digitado à mão. A função devolve os limites **absolutos** e quem chama converte em distância.
5. `ErrorBar` com `dataKey` recebendo o par de **distâncias** a partir do ponto (`[ponto − limite baixo, limite alto − ponto]`), não os limites absolutos: é o ponto delicado do modelo, porque passar o limite desenha uma barra do tamanho errado sem erro de compilação (armadilha `REC-20`).
6. Serifa curta (`width={5}`) e traço em `--text-muted`, ou na cor do papel quando o papel existe. **O traço é dado e não referência**, então ele responde à `ACE-6` e precisa dos 3:1 da WCAG 1.4.11: `--line-strong` está fora, porque mede 1,79:1 no escuro e 1,83:1 no claro. Os tokens usados medem, contra `--surface-raised`, `--text-muted` 5,21:1 e 5,37:1, `--positive` 7,36:1 e 5,34:1, `--negative` 5,50:1 e 6,36:1, `--chart-1` 9,50:1 e 6,00:1. Nenhum deles leva opacidade, pela `ACE-5`.
7. **A declaração do que a barra é**, em pelo menos dois lugares: um glifo de serifa desenhado ao lado do texto, o texto que nomeia o método e o nível, e a frase acessível da raiz.
8. `ReferenceLine` de comparação, quando existe, em `--line-strong` tracejado com `ifOverflow="extendDomain"`, e o **nome dela na margem reservada**, nunca no `label` nativo, que nasce dentro da área e cai sobre os pontos (armadilha `REC-4`).
9. Rótulo direto de nome, e de valor onde o valor decide, numa camada própria dentro do `ScatterChart`, com `usePlotArea`, `useXAxisScale` e `useYAxisScale`: a anticolisão precisa dos pixels de todos os pontos ao mesmo tempo, e a caixa de cada marca é a **cruz inteira**, ponto mais barras, porque é tudo tinta a desviar. Rótulo que cruza marca leva halo de `--surface-raised` (ROT-7).
10. `ZAxis` com as duas pontas iguais, para o raio do ponto não variar sozinho (armadilha `REC-15`).
11. Dica (`ChartTooltip`) com o par volume e taxa (`formatRateWithVolume`) e os dois limites do intervalo, porque é aí que mora o valor exato que o traço não escreve.
12. Frase acessível na raiz calculada do dado, de 100 a 250 caracteres, dizendo **também o que a barra representa**.

## Versões

- `v1_taxa-de-agenda-por-sdr`: taxa de agenda de 9 SDRs fictícios contra os leads que cada um trabalhou no mês, em canvas de cartão. Demonstra o intervalo de Wilson calculado em TypeScript e assimétrico perto dos extremos, o `ErrorBar` com `direction="y"` recebendo o par de distâncias a partir do ponto, a serifa curta em tom de texto discreto e o subtítulo que nomeia o tipo de intervalo desenhado. Preview: [`v1_taxa-de-agenda-por-sdr/preview.svg`](v1_taxa-de-agenda-por-sdr/preview.svg) e [`v1_taxa-de-agenda-por-sdr/preview-claro.svg`](v1_taxa-de-agenda-por-sdr/preview-claro.svg).
- `v2_sdrs-diferentes-do-time`: os mesmos SDRs contra a taxa do time, que entra como `ReferenceLine` com o nome na margem reservada. Demonstra o destaque decidido pelo **intervalo** que não cruza a referência e não pelo ponto, o rótulo direto com nome, taxa e volume só nos destacados, e o caso que prova a regra, duas taxas iguais de 13,8% com vereditos opostos porque uma vem de 58 leads e a outra de 130. Preview: [`v2_sdrs-diferentes-do-time/preview.svg`](v2_sdrs-diferentes-do-time/preview.svg) e [`v2_sdrs-diferentes-do-time/preview-claro.svg`](v2_sdrs-diferentes-do-time/preview-claro.svg).
- `v3_canais-com-erro-nos-dois-eixos`: 8 canais com CPL médio no horizontal e taxa de qualificação no vertical, cada um com a sua barra. Demonstra dois `ErrorBar` no mesmo `Scatter`, um em `direction="x"` e outro em `direction="y"`, com **origens diferentes declaradas uma a uma**: a horizontal é um desvio padrão amostral do CPL entre as semanas, calculado do dado, e a vertical é o intervalo de Wilson da taxa. Demonstra também o nome do canal em rótulo direto no lugar de legenda. Preview: [`v3_canais-com-erro-nos-dois-eixos/preview.svg`](v3_canais-com-erro-nos-dois-eixos/preview.svg) e [`v3_canais-com-erro-nos-dois-eixos/preview-claro.svg`](v3_canais-com-erro-nos-dois-eixos/preview-claro.svg).
- `v4_amostra-minima`: 8 canais de origem, dois deles abaixo do piso de 20 leads, sendo um com 3 leads. Demonstra o piso de volume abaixo do qual o ponto fica vazado e perde o traço, a palavra "amostra insuficiente" com o volume escrito junto do ponto, e o domínio do eixo calculado **sem** o intervalo de quem está abaixo do piso, com o custo medido do próprio dado: com esses intervalos na conta o eixo iria a 90%, e sem eles para em 45%. Preview: [`v4_amostra-minima/preview.svg`](v4_amostra-minima/preview.svg) e [`v4_amostra-minima/preview-claro.svg`](v4_amostra-minima/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão mais próxima para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/SdrAgendaScatter/`.
2. Troque o `import` do `./data` pela contagem real do período filtrado. As funções de cálculo (`wilson`, `pooledRate`, `mean`, `sampleStdDev`) continuam puras e não mudam. **Não substitua a contagem por uma taxa já calculada**: sem o numerador e o denominador não existe intervalo de Wilson, e a barra vira faixa inventada.
3. Confira o domínio dos eixos. Na `v1`, `v2` e `v3` ele é constante, e um domínio fixo por página evita que a mesma posição signifique volumes diferentes de um filtro para outro; em troca, dado fora da faixa sai da moldura sem aviso, então confira que o maior limite superior do novo dado cabe. A `v4` mostra o outro caminho, com domínio e tiques derivados do dado.
4. Reveja o piso de amostra da `v4` e o nível de confiança com quem usa o número. Os dois entram por prop (`minimumSample`, `confidence`) justamente para serem decisão de quem publica, e os dois aparecem escritos na tela.
5. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-72">`) ou passe `height`. As versões `v2`, `v3` e `v4` escrevem duas linhas de texto além do plano e pedem cartão mais alto que o preset `card`.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, API do ErrorBar](https://recharts.github.io/en-US/api/ErrorBar/): `direction`, `width` das serifas e o `dataKey` em par simétrico ou assimétrico.
- [ECharts, error scatter on cartesian](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/custom-error-scatter.ts): o `renderItem` que desenha intervalo em X e em Y com serifas.
- [Vega-Lite, Error Bars Showing Confidence Interval](https://vega.github.io/vega-lite/examples/layer_point_errorbar_ci.html): `extent: ci` calculado pela biblioteca, e os quatro extents que a mesma marca aceita, que é a razão de a barra precisar de nome.
- [Datawrapper Academy, confidence intervals in column charts](https://www.datawrapper.de/academy/confidence-intervals-error-bars-datawrapper-column-charts): o viés "dentro da barra" quando o intervalo vai sobre coluna, e os ajustes de opacidade.
- [Wilson score interval](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval): por que a aproximação normal quebra perto de 0% e de 100% e o intervalo de Wilson não.

## Colisões entre a especificação do catálogo e o CONTRATO

Resolvidas a favor do CONTRATO, como a regra da casa manda, e registradas aqui e na nota do `meta.json` de cada versão.

- **Canvas.** O catálogo sugere `card` para a `v1`, a `v2` e a `v4` e `largo` para a `v3`. Nenhum dos dois fecha depois que o cartão ganha as linhas escritas que a declaração da barra exige, então a `GEO-1` manda declarar o canvas por número com a conta escrita, e é o que a `v2`, a `v3` e a `v4` fazem. A `v1` fica no preset, porque escreve uma linha só.
- **Grade.** A `EIX-3` proíbe grade nos dois sentidos, e o enunciado dela é o que uma busca pelo código devolve. Quem manda aqui é a **`EIX-3b`**, que obriga a grade nos dois sentidos quando os dois eixos são quantitativos e lidos por posição, que é exatamente esta família.
- **Cor do traço.** O catálogo pede "traço em tom de texto discreto" e a tabela 17.2 do contrato não tem linha para intervalo de incerteza. A `ACE-6` resolve: o traço **carrega a relação**, então é dado e mede 3:1, e `--line-strong` está fora. Os tokens escolhidos e os números medidos estão no item 6 da Anatomia.

## Observações da revisão (não bloqueantes)

Revisão de 2026-09-19 sobre a `v1`, mais as observações da leva de 2026-09-28, que produziu a `v2`, a `v3` e a `v4`.

- `v1_taxa-de-agenda-por-sdr`: nenhum ponto se identifica no desenho parado; o nome do SDR só existe na dica. A `v2` resolve isso com rótulo nos destacados, e a `v3` e a `v4` rotulam todos os pontos.
- `v1_taxa-de-agenda-por-sdr`: o texto do topo declara o método e não traz número calculado do dado, como a ANO-5 pede da linha de leitura. A `v2`, a `v3` e a `v4` corrigem isso: a linha de leitura de cada uma traz contagem, conclusão ou o custo do piso, todos calculados.
- `v1_taxa-de-agenda-por-sdr`: o nome longo do `data.ts` nunca chega à tela, porque o desenho não rotula ponto. Continua assim; na `v2` o nome longo passou para um SDR **destacado** (`Marina T. de Alencar`), e ali o caso difícil é exercitado de verdade.
- `v1_taxa-de-agenda-por-sdr`: os eixos escrevem `axisLine={false}` sem espalhar `AXIS_PROPS`, e por isso a guarda `EIXO-CALMO` **não mede esta versão**, saindo como `sem_eixo_com_axis_props`. O desenho está certo, o eixo sai calmo, mas ele fica fora do alcance da guarda; a `v2`, a `v3` e a `v4` espalham o `AXIS_PROPS` e sobrescrevem depois, e as três são medidas e passam. Vale alinhar a `v1` quando alguém tocar o arquivo.
- `v2_sdrs-diferentes-do-time`: a segunda linha do rótulo da Larissa M. encosta na serifa de cima da barra de erro de um ponto neutro vizinho. É tinta de texto sobre marca, não sobre texto, o halo da ROT-7 mantém o texto legível, e a `COLISAO-TEXTO` mede a versão e não acusa par nenhum. Fica registrado: com 8 barras verticais altas num plano de 634 px, todo rótulo lateral cruza alguma barra, e a saída é a que está aqui, halo mais anticolisão que conta a barra inteira como marca.
- `v2_sdrs-diferentes-do-time`: o destaque usa `--positive` e `--negative` porque a taxa de agenda tem polaridade (COR-6), mas quem está acima da média do time não está necessariamente "bem" em termos absolutos. Quem colar numa página em que a taxa do time não é meta deve trocar os dois pela cor de série e manter o anel e o rótulo como canais de destaque.
- `v3_canais-com-erro-nos-dois-eixos` e `v4_amostra-minima`: as guardas `CONTRASTE-MARCA` e `ESPESSURA-MARCA` não medem nenhuma versão deste modelo e reportam `preview_com_transform`, como em toda a família 09. Não é permissão: é medida que faltou. Os números das marcas foram medidos à mão, estão no item 6 da Anatomia e na nota de cada `meta.json`, e nenhum deles usa opacidade.
- `v4_amostra-minima`: as taxas dos seis canais medidos ficam todas abaixo de 30% de propósito, para a faixa alta do plano sobrar limpa para os dois rótulos de duas linhas dos canais sem amostra. É escolha de dado, não de desenho, e está escrita no comentário do `data.ts`; com dado real que ocupe a faixa toda, a anticolisão vai empurrar esses rótulos e vale conferir o PNG.
