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

Revisão independente de 2026-10-14 sobre a `v2`, a `v3` e a `v4`, que saíram reprovadas por defeitos de ramo descritos em `validation/revisao_09_dispersao-e-bolhas__07_dispersao-com-barras-de-erro_2026-10-14.md`. O que segue não bloqueia.

- `v2_sdrs-diferentes-do-time`: o comentário de `DOMAIN_Y` diz que o maior limite superior é 43,3%; o dado dá 44,1% (Larissa M., 25 de 76). O domínio de 45% continua certo.
- `v2_sdrs-diferentes-do-time`: medido no PNG ampliado, nos dois temas, o fim de "32,9% (25 de 76)" fica a cerca de 3 px da serifa do ponto neutro de 104 leads, e o halo não toca a serifa. A caixa da anticolisão usa o raio do ponto (4,5 px) e não a meia serifa do `ErrorBar` (5 px); alinhar as duas dá meio pixel a mais de margem.
- `v2_sdrs-diferentes-do-time`: com um só SDR num papel, a frase acessível escreve "1 estão acima" e o rodapé "os 1 em neutro"; vale concordar o número.
- `v2_sdrs-diferentes-do-time`: o `strokeWidth={1.5}` do anel e o `y - 3` do nome da referência ficam fora das constantes do topo, e `LABEL_PAD = 3` é ímpar (ESP-1). Nada disso aparece no preview.
- `v3_canais-com-erro-nos-dois-eixos`: a serifa direita do traço horizontal do Display (R$ 57) cai a menos de 1 px da serifa de cima da Lista fria, e as duas leem como um canto. Nenhum valor muda de leitura; afastar um dos dois no `data.ts` limpa o desenho.
- `v3_canais-com-erro-nos-dois-eixos`: o rodapé do ramo `semSerie` diz "sem custo semanal apurado" também para o canal com uma semana só ou sem lead, e a frase acessível não leva essa contagem.
- `v3_canais-com-erro-nos-dois-eixos`: `semanas` vem do canal mais barato; com número de semanas diferente entre canais, o rodapé e a frase erram para os outros.
- `v3_canais-com-erro-nos-dois-eixos`: o CPL da linha de leitura sai por `formatCurrencyAxis`, e a NUM-1 pede `formatCurrencyCompact` fora do tique; abaixo de R$ 1 mil as duas escrevem o mesmo texto.
- `v4_amostra-minima`: a nota do `meta.json` diz que sem o intervalo dos escassos o eixo "para em 60%" e fala em "oito canais que têm medida"; o render e este README dizem 45%, e os medidos são seis. O comentário do topo do `Chart.tsx` repete "oito canais" (DAD-10).
- `v4_amostra-minima`: o rodapé diz que abaixo do piso o ponto "sai da conta do domínio", mas quem sai é o intervalo. A posição do ponto continua na conta (`tetoPonto`), e é isso que impede um escasso de taxa alta de sair da moldura.
- `v4_amostra-minima`: o subtítulo, que repete o caso de uso do catálogo, fala em intervalo "de quase 0 a 100%"; o de 1 em 3 leads vai de 6,1% a 79,2%, como a dica mostra.
- `v4_amostra-minima`: `STEP_X = 100` e `STEP_Y = 0.15` são fixos, e com 1.000 leads o eixo X teria 11 tiques, quando a EIX-4 pede de 3 a 5. Derivar o passo do teto completa o "domínio e tiques derivados do dado" da Anatomia.
- `v4_amostra-minima`: com um só canal abaixo do piso, a frase acessível escreve "1 canais".
- Todas as versões: a guarda `FORMATO-ACESSIVEL` não mede nenhuma (`frase_sem_formatador`), porque as frases montam o texto a partir de variáveis já formatadas, que é justamente o padrão que a DAD-5 recomenda. Conferida à mão, a frase e o corpo usam os mesmos textos nas três versões revisadas.

Segunda passada da revisão independente, 2026-10-14, sobre a `v2`, a `v3` e a `v4` corrigidas: os quatro bloqueantes da primeira passada estão resolvidos e as três saíram aprovadas. Das observações acima seguem abertas o comentário de `DOMAIN_Y` e a concordância com um só SDR na `v2`; o canto das serifas de Display e Lista fria, o rodapé `semSerie`, as `semanas` do mais barato e o `formatCurrencyAxis` na `v3`; e, na `v4`, o "60%" e os "oito canais" do `meta.json` e dos comentários do `Chart.tsx`, o "1 canais", o subtítulo "de quase 0 a 100%" e o passo fixo. O que segue é novo e não bloqueia.

- `v2_sdrs-diferentes-do-time`: o comentário da frase acessível diz 228 caracteres; o preview mede 211, e com um SDR sem lead a frase vai a 239, dentro dos 250 da ACE-1.
- `v2_sdrs-diferentes-do-time`: "os 4 em neutro" no rodapé é contagem sem substantivo (NUM-6); "os 4 SDRs em neutro" resolve junto com a concordância já anotada.
- `v3_canais-com-erro-nos-dois-eixos`: o veredito calculado cobre só a taxa, e o lado do custo continua decidido pela média. No dado padrão o traço do E-mail (R$ 23,75 a R$ 30,75) e o do Display (R$ 30,10 a R$ 57,40) se sobrepõem em R$ 0,65. Como o traço horizontal é desvio padrão e não intervalo de confiança, "mais barato" é fato sobre a média e não inferência; fica anotado porque o caso de uso pede a leitura "quando a incerteza entra na conta".
- `v3_canais-com-erro-nos-dois-eixos`: o ramo "não se distinguem" escreve cerca de 159 caracteres em 12 px, estimados em 876 px contra os 894 px do corpo; com nome de canal mais longo a linha quebra em duas e tira altura do plano. A frase acessível não leva o veredito, o que a DAD-5 deixa como opcional aqui.
- `v4_amostra-minima`: a fidelidade entre página e arquivo mede 0,77% no escuro e 0,83% no claro, acima dos 0,5% da pergunta 21 e abaixo dos 2% que reprovam no render. A diferença está toda no rodapé, que com a correção passou a quebrar em duas linhas: o glifo de serifa, sem `shrink-0` dentro do `<p>` flex, encolhe para 9,27 px na página e de novo no SVG, e o texto inteiro desloca meio pixel. Nada muda de leitura; `shrink-0` no `<svg>` do glifo deve zerar a divergência. A conta de canvas do `meta.json` ainda fala em duas linhas de texto, e agora são três.
- `v4_amostra-minima`: com o passo fixo de 15 pontos, um escasso com taxa de 100% (1 de 1 lead, justamente o caso que a versão existe para mostrar) ou um medido com limite superior acima de 90% leva o eixo a 105%, com oito tiques. Limitar o teto a 100% e derivar o passo (10, 20 ou 25 pontos) mantém o eixo dentro da taxa possível e nas 3 a 5 linhas da EIX-4.
- `v4_amostra-minima`: com canal sem lead, a frase acessível soma esse canal aos "N canais abaixo do piso … saem vazados e sem traço", e ele não é desenhado; o parêntese "(1 sem lead, fora do plano)" desfaz a leitura, mas o verbo fica com o número de quem não está no plano. O `strokeWidth={1.5}` do anel vazado fica fora das constantes do topo.
