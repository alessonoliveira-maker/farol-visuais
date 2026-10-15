# Área de diferença contra meta

## O que é

O espaço entre a série real e uma referência (zero, um limiar constante ou uma meta que varia
por período) é pintado de uma cor onde o real fica acima e de outra onde fica abaixo. A forma
responde a uma pergunta com sinal: não "quanto", mas "quanto e de que lado". Dois caminhos, os
dois recharts custom: contra uma referência constante, uma única `Area` sobre o desvio com
`baseValue` na referência e um degradê de corte duro (`useYAxisScale` mais
`useChartHeight`, `gradientUnits="userSpaceOnUse"`) que troca de cor exatamente na altura em
que a referência está desenhada; contra uma meta que varia por período, duas `Area` de faixa,
uma acima e outra abaixo da meta, com o ponto de cruzamento inserido por interpolação linear
entre cada par de meses em que o sinal muda. Nas duas técnicas, a cor nunca é a única pista: a
série real e a referência são nomeadas por rótulo ou legenda, e a própria área tem nome, porque
quando duas séries se cruzam o leitor não sabe sozinho qual estava por cima.

## Quando usar

- Real contra meta ou limiar definido por período, quando o saldo acima e abaixo é a pergunta.
- Resultado que cruza o zero: lucro e prejuízo, saldo de carteira.
- De 12 a cerca de 365 pontos, com o saldo acumulado ou a contagem de períodos abaixo escritos
  na tela, nunca só na cor.
- Métrica com polaridade clara, em que acima ser bom ou ruim é conhecido (COR-6).

## Quando evitar

- Referência sem definição por período: múltiplas séries em linha
  (`04_linhas/02_multiplas-series`).
- Só o acumulado contra a meta importa: burn-up (`04_linhas/06_acumulado-contra-meta`).
- Poucos períodos com variação escrita por mês:
  `08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao`.
- Métrica sem polaridade: verde e vermelho mentiriam (COR-6).
- Curva `monotone` ou eixo categórico na técnica de faixa: o cruzamento calculado por
  interpolação linear não cai exatamente onde a cor deveria trocar.

## Anatomia

1. **Referência constante (`v1`, `v3`):** uma `Area` com `baseValue` na referência, preenchida
   por um `linearGradient` de `gradientUnits="userSpaceOnUse"` cujo corte de cor é calculado com
   `useYAxisScale` e `useChartHeight`, medindo a altura em pixel já renderizada da referência.
   Duas cores sólidas, nunca um degradê decorativo (COR-9): `--positive`/`--negative` quando a
   referência é o zero natural da métrica, `--line-strong`/`--negative` quando é um limiar de
   qualidade em que só o lado ruim merece alerta.
2. **Meta variável (`v2`, `v4`):** duas `Area` com `dataKey` em par `[a, b]`, `acima: [meta,
   max(real, meta)]` e `abaixo: [min(real, meta), meta]`, em `--positive` e `--negative`.
3. **Cruzamento inserido por interpolação linear** (`v2`, `v4`): uma função pura no topo do
   arquivo calcula, para cada par de meses em que o sinal de `real − meta` muda, a fração exata
   em que a diferença passa por zero e insere um ponto ali, com `real = meta` = valor
   interpolado. Sem isso a cor só troca no próximo ponto de dado e nasce um triângulo pintado do
   lado errado.
4. **Eixo x numérico e `type="linear"`** na técnica de faixa: o eixo categórico não tem posição
   para o cruzamento fracionário, e `type="monotone"` não passa exatamente por ele.
5. **Linha de referência ou de meta:** `ReferenceLine` tracejada em `--text-muted` para um
   limiar nomeado (`v3`), ou uma `Line` tracejada própria quando a meta varia por período
   (`v2`, `v4`), sempre com rótulo dizendo o que ela é.
6. **Meta ausente vira lacuna, nunca repetição** (`v4`): mês sem meta definida quebra a faixa e
   a linha de meta (`connectNulls={false}`), com uma `ReferenceArea` em `--surface-sunken`
   nomeando os meses sem meta.
7. **Série e área sempre nomeadas:** legenda compacta com amostra de cor e nome ("Positivo",
   "Acima da meta", "Captação real") e uma linha de leitura calculada do dado com a contagem e o
   saldo. Cor nunca é a única pista de quem está por cima (decisão do dono da marca).

## Versões

- **`v1_resultado-mensal-contra-zero`**: o caminho feliz contra uma referência constante.
  Resultado mensal fictício que cruza o zero várias vezes ao longo de 12 meses, com o corte de
  cor calculado por `useYAxisScale`, a linha do zero em `--line-strong` sólido e uma legenda
  nomeando positivo, negativo e a própria referência de zero, ao lado do saldo do período.
- **`v2_receita-contra-meta-mensal`**: a técnica de faixa contra uma meta que sobe mês a mês.
  Receita reconhecida que começa bem abaixo da meta, cruza de lado três vezes seguidas e assenta
  acima dela, com desvio de 35 a 80 mil para o corpo mostrar a faixa e não só a linha; os pontos
  de cruzamento entram por interpolação, a meta tracejada e a receita real são nomeadas por
  legenda, e o saldo acumulado do ano aparece escrito ao lado da legenda.
- **`v3_sla-diario-contra-limiar`**: o caso denso do Farol. 180 dias de SLA diário contra o
  limiar constante de 90%, desenhado como série de desvio com `baseValue` no limiar; a cor de
  alerta existe só abaixo da linha, uma legenda nomeia dentro do limiar, abaixo do limiar e o
  próprio limiar, a contagem de dias abaixo e o déficit somado aparecem escritos, e a animação
  fica desligada por ser série longa.
- **`v4_cruzamentos-e-meta-ausente`**: o caso limite. Captação líquida contra meta variável com
  8 cruzamentos ao longo do ano e dois meses em que a meta ainda não foi definida; a faixa
  quebra nesses meses em vez de repetir a última meta conhecida, uma `ReferenceArea` nomeia
  exatamente quais meses ficaram sem meta, e a linha de leitura soma quantos meses ficaram
  acima e abaixo, com o saldo do período junto da legenda.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o dado padrão pela série real vinda
   do seletor da página.
2. Em `v1` e `v3`, mantenha a referência (`0` ou o limiar) como uma constante nomeada no topo do
   arquivo; se o limiar do produto mudar, é essa constante que muda, nunca um número solto no
   meio do JSX.
3. Em `v2` e `v4`, a meta variável entra como mais uma coluna do dado real (nunca uma constante
   fixa): a interpolação de cruzamento já lida com qualquer formato de meta, inclusive `null`
   nos períodos sem meta definida.
4. Dê altura ao pai (`h-64` ou similar) ou passe `height`; sem altura o `ResponsiveContainer`
   desenha zero.
5. Embrulhe no `VisualCard` do Farol: o `title` do `meta.json` vira o título do cartão, o
   `useCase` pode virar o `subtitle`. A legenda de série e área do próprio Chart continua
   necessária dentro do cartão: ela não é decoração de catálogo, é o que impede a cor de ser a
   única pista.

## Referências

- [Recharts, Area Chart Fill By Value](https://recharts.github.io/en-US/examples/AreaChartFillByValue/):
  cor dividida na razão do zero, calculada com `useYAxisScale` e `useChartHeight`.
- [AG Charts, Range Area Difference Chart With Inverted Style](https://www.ag-grid.com/charts/gallery/range-area-difference-inverted-style/):
  opacidade diferente conforme a série que domina.
- [Highcharts, Area with negative values](https://www.highcharts.com/demo/highcharts/area-negative):
  leitura de área que cruza o zero.
- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/): base técnica
  do `dataKey` em par `[a, b]` que sustenta a faixa acima/abaixo da meta.
- [Recharts, Area API](https://recharts.github.io/en-US/api/Area/): `baseValue`, `dataKey` em
  faixa e `connectNulls`.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18, corrigida na mesma data. Itens resolvidos na correção saem daqui; o que
não coube nesta rodada está em "Pendências conhecidas", abaixo._

- **`v3`**: com domínio de 0 a 100% e SLA que nunca desce de 74%, mais de metade do corpo fica
  vazia e a faixa de desvio vive numa fita perto do topo; desenhar o desvio em pontos percentuais
  contra o zero daria a mesma honestidade de escala com o dobro de leitura. Não corrigido nesta
  rodada: ver Pendências conhecidas.
- **`v4`**: a `ReferenceArea` dos meses sem meta tem contraste baixo contra o cartão no tema
  escuro; quem carrega a informação é a nota escrita, como manda a ANO-4, então não é tratado como
  defeito.

### Revisão independente de 2026-09-18 (nenhum bloqueante; as quatro versões aprovadas)

- **`v1`**: o tique de valor negativo sai como `R$ -50 mil`, com hífen, porque é o que o
  `formatCurrencyAxis` devolve; a seção 8 pede o sinal de menos tipográfico, mas o formatador é
  compartilhado e o contrato proíbe formatar fora dele.
- **`v1`**: a `ReferenceLine` do zero não declara `ifOverflow="extendDomain"`; hoje o zero sempre
  cabe porque `computeSignedTicks` o inclui, então é só uma proteção que falta para o dia em que a
  série vier toda de um lado só.
- **`v2`**: é a única das quatro sem `CartesianGrid`, então os tiques de valor flutuam sem linha de
  grade (a EIX-4 fala em 3 a 5 linhas em cartão).
- **`v2`**: com domínio de zero a 600 mil e receita entre 300 e 540 mil, o dado vive no terço
  superior do corpo; honesto pela EIX-1, mas a metade de baixo fica vazia.
- **`v2`**: a linha de leitura resume "abaixo da meta até mai/26" embora abr/26 tenha ficado acima
  da meta; o desenho mostra o cruzamento, o texto arredonda o regime.
- **`v2`, `v3`, `v4`**: os tiques dos eixos saem no texto padrão do Recharts, sem `font-display`
  nem `tabular-nums` (TIP-1); só `v1` aplica a classe no tique próprio.
- **`v3`**: a amostra "Dentro do limiar" e o traço da própria área usam `--line-strong` a 30% e
  ficam bem apagados nos dois temas; quem identifica a série é o texto da legenda.
- **`v4`**: a `ReferenceArea` dos meses sem meta não leva rótulo dentro do corpo; a ANO-4 pede
  texto dizendo o que a faixa marca, e aqui esse texto vive só na linha de leitura acima do
  gráfico.
- **Todas**: nenhuma versão tem dica, e nada essencial dependeria dela (DIC-1 satisfeita); a
  pergunta 18 do checklist não se aplica.

### Resolvidas nesta rodada (2026-09-18)

- **Todas as versões**: `XAxis` e `YAxis` (e o tique de valor próprio de `v1`) agora usam
  `AXIS_PROPS` de `chartTheme` (`fill: var(--text-muted)`, `fontSize: 11`), em vez do cinza padrão
  do Recharts a 3,0:1. Resolve o bloqueio de ACE-3 nas quatro versões.
- **`v1`**: o `<text>` do tique de valor agora leva `className="font-display"` (TIP-1).
- **`v2`**: `meta.json` reescrito para dizer que a legenda do topo nomeia as séries, não o rótulo
  de fim.
- **`v2` e `v4`**: largura do eixo Y de 64 para 80, como `v1` já fazia; com o tique em 11 px o
  ganho é sobra, não necessidade, mas evita regressão se o formato mudar.
- **`v2`**: o saldo acumulado agora está escrito na tela (ao lado da legenda), não só na frase
  acessível; o desvio entre receita e meta foi ampliado de 5 a 30 mil para 35 a 80 mil (`data.ts`)
  para a faixa deixar de ser uma fita de 2 a 5 px e virar uma fatia legível do corpo.
- **`v3`**: legenda nova nomeia "Dentro do limiar", "Abaixo do limiar" e "Limiar 90%"; antes a
  área não nomeava nada, o defeito clássico que o dono da marca apontou. O rótulo "limiar 90%"
  ganhou o halo da ROT-7.
- **`v4`**: a linha de leitura agora soma quantos meses (com meta definida) ficaram acima e
  abaixo, e o saldo do período aparece junto da legenda, como o item 7 da Anatomia pede.
- **`v1`**: legenda ganhou um terceiro item, "Referência: zero", nomeando a linha de referência
  que antes só existia como `ReferenceLine` sem rótulo.

### Revisão independente de 2026-10-02 (só a `v1`, depois da mudança dos formatadores)

A `v1` foi reprovada nesta data por um bloqueante de contraste (pergunta 30, ACE-5), descrito em
`validation/revisao_05_areas__07_area-de-diferenca_2026-10-02.md`. O que segue é o que não reprova.

- **`v1`**: o tique negativo agora sai `−R$ 50 mil`, com U+2212 antes do símbolo, em uma linha só,
  sem corte nem colisão nos dois temas; a observação de 2026-09-18 sobre o hífen fica resolvida pelo
  formatador.
- **`v1`**: o comentário de `Chart.tsx:35` ainda cita o texto antigo `R$ -50 mil`, que o formatador
  não escreve mais.
- **`v1`**: o comentário do topo do `Chart.tsx` diz que a contagem de meses de cada lado aparece
  escrita, mas na tela só o saldo aparece; a contagem vive na frase acessível (DAD-10).
- **`v1`**: `Y_AXIS_WIDTH` de 80 fica fora da faixa de 48 a 64 da EIX-6, sem consequência visível.
- **`v1`**: o tique do eixo X (`jan/25`) sai sem `font-display` nem `tabular-nums` (TIP-1); só o
  tique de valor leva a classe.
- **`v1`**: o `id` do gradiente vem do `useId()` com os dois pontos; o estudo da família recomenda
  tirá-los, e hoje o corte de cor desenha certo nos dois temas.
- **`v1`**: a amostra "Referência: zero" e a própria linha usam `--line-strong` (1,79:1 no escuro e
  1,83:1 no claro); é referência e não dado, e a tensão é a E5 do contrato, ainda aberta.

### Revisão independente de 2026-10-15 (só a `v1`, depois da segunda rodada de correção)

A `v1` foi aprovada nesta data: com `FILL_OPACITY` em 0,70 o bloqueante de ACE-5 de 2026-10-02 está
resolvido. O que segue é o que não reprova.

- **`v1`**: a folga da ACE-5 no claro é mínima. Medido à mão, com canal arredondado: `--positive`
  composto mede 3,03:1 no claro (3,07:1 no PNG) e 4,26:1 no escuro; `--negative` mede 3,67:1 no claro
  e 3,28:1 no escuro. Qualquer ajuste em `--positive` ou em `--surface-raised` derruba o verde abaixo
  do piso sem aviso, porque a guarda OPACIDADE-MARCA não lê o `fill` em `url(#…)` e lista a `v1` como
  `sem_opacidade_em_marca`.
- **`v1`**: a amostra de "Positivo" e "Negativo" sai redonda, 10 px, na cor cheia, enquanto a marca é
  área a 0,70; a ROT-4 pede amostra na forma da marca. A identificação não se perde, porque o nome
  está ao lado.
- **`v1`**: seguem abertas as observações de 2026-10-02 que não tratavam da ACE-5: o comentário do
  tique (`Chart.tsx:36`) ainda cita `R$ -50 mil`; o comentário do topo promete a contagem de meses na
  tela (DAD-10); `Y_AXIS_WIDTH` em 80; tique do eixo X sem `font-display`; `id` do gradiente com os
  dois pontos do `useId()`; zero em `--line-strong`.

## Pendências conhecidas

- **`v3`**: domínio de 0 a 100% com SLA que nunca desce de 74% deixa mais da metade do corpo
  vazia; o desvio em pontos percentuais contra o zero (em vez do percentual absoluto contra 0 a
  100%) daria o dobro de leitura com a mesma honestidade de escala. Não corrigido nesta rodada
  porque troca o eixo de grandeza da métrica (percentual absoluto vira desvio em p.p.), o que é
  redesenho, não ajuste pontual, e o checklist não bloqueou por isso.
