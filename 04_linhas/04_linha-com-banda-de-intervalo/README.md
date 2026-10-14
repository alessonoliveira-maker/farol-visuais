# Linha com banda de intervalo

## O que é

Uma linha central (mediana, média ou estimativa) desenhada sobre uma faixa sombreada que
representa dispersão ou incerteza: o 1º e o 3º quartil de cada ponto, o mínimo e o máximo de um
histórico móvel, ou os dois extremos de uma estimativa. A leitura é sempre dupla: a linha diz o
valor típico e a largura da faixa diz o quanto esse valor pode variar. Banda estatística não é
faixa de meta, e o modelo só existe porque essa confusão é o erro mais fácil de cometer: uma
sombra sem método declarado é a leitura inventada por excelência, então toda versão aqui nomeia,
em texto simples e visível, o que a faixa representa.

## Quando usar

* Valor central com dispersão: tempo até o primeiro contato em mediana com quartis, ciclo de
  venda.
* Faixa histórica de comparação: mínimo e máximo das semanas anteriores para achar dias fora do
  padrão.
* Estimativa com incerteza declarada, como participação de mercado entre dois perímetros de
  cálculo.

## Quando evitar

* Público que lê a banda como meta: use `ReferenceArea` em `01_linha-simples` com o texto da
  meta.
* Projeção com bandas aninhadas por probabilidade: use o leque de `05_areas`.
* Distribuição completa de um único período: use `16_distribuicao`.
* Banda mais saliente que a linha central: reduza a opacidade ou mostre só a linha.

## Anatomia

1. **`ComposedChart` com `Area` de par inferior e superior.** O dado carrega os dois limites (por
   exemplo `p25Hours` e `p75Hours`), e o componente monta o par `[inferior, superior]` no próprio
   `Chart.tsx`, nunca no `data.ts`, para o dado ficar legível por si e o par ficar óbvio no código
   que desenha. A `Area` não tem contorno (`stroke="none"`) e entra **antes** da `Line` central
   nos filhos do `ComposedChart`, para a linha ficar por cima da sombra.
2. **Cor da faixa: `--line-strong` em opacidade 0,18.** É o token de neutro de dado da tabela
   17.2, escolhido porque a faixa aqui é contexto, não a mensagem principal. Nunca
   `--surface-sunken`, que a ANO-4 reserva para `ReferenceArea` de período sem coleta: usar o
   mesmo tom faria a banda estatística e a lacuna de meta parecerem a mesma coisa.
3. **A faixa se nomeia.** Toda versão traz, fora da dica, um texto fixo dizendo o método da banda
   (quartil, mínimo e máximo de N semanas, os dois perímetros por nome). É a exigência que motivou
   a revisão desta rodada: banda sem método declarado é o caso clássico de leitura inventada, e o
   texto que resolve isso mora na tela, não só na dica ou no `meta.json`.
4. **Linha central em `--chart-1`,** 2 px, com rótulo direto quando cabe (ROT-2) e o mesmo
   formatador do eixo e da dica.
5. **Recorte de escala é permitido aqui,** ao contrário de barra, coluna e área que representam
   quantidade a partir de zero (EIX-1, EIX-2): a área desta família é uma banda de incerteza sobre
   uma linha, não um volume. Quando o eixo mede uma fração pequena (participação de mercado), o
   domínio pode começar acima de zero.
6. **Caso limite da amostra pequena.** Quando a base do ponto não sustenta um quartil confiável, a
   banda vira `null` naquele ponto (gap na `Area`, com `connectNulls={false}`) e a mediana
   continua marcada como ponto isolado, nunca escondida.
7. **Dica opcional.** Quando a `Area` tem dataKey em par, o `ChartTooltip` padrão imprimiria o par
   cru; a dica reescreve isso como "entre X e Y" com o mesmo formatador do rótulo, ou a `Area`
   entra com `tooltipType="none"` e a dica mostra só a linha central.

## Versões

* [`v1_tempo-ate-primeiro-contato-com-quartis`](./v1_tempo-ate-primeiro-contato-com-quartis/):
  mediana semanal do tempo até o primeiro contato em 26 semanas, com a faixa entre o 1º e o 3º
  quartil. Demonstra o `ComposedChart` com `Area` de par e `Line` por cima, a dica reescrita como
  "entre X e Y" em `formatHours`, e a nota curta nomeando o quartil.
  ([preview escuro](./v1_tempo-ate-primeiro-contato-com-quartis/preview.svg) ·
  [preview claro](./v1_tempo-ate-primeiro-contato-com-quartis/preview-claro.svg))
* [`v2_cpl-diario-fora-da-faixa-historica`](./v2_cpl-diario-fora-da-faixa-historica/): CPL diário
  de agosto de 2026 sobre a faixa móvel de mínimo e máximo das 8 semanas anteriores. Demonstra a
  faixa móvel calculada em TypeScript a partir do histórico do próprio `data.ts`, e os dias fora
  da faixa marcados por símbolo, cor semântica e valor escrito.
  ([preview escuro](./v2_cpl-diario-fora-da-faixa-historica/preview.svg) ·
  [preview claro](./v2_cpl-diario-fora-da-faixa-historica/preview-claro.svg))
* [`v3_participacao-de-mercado-entre-perimetros`](./v3_participacao-de-mercado-entre-perimetros/):
  participação de mercado estimada entre o perímetro restrito e o amplo, com uma revisão de
  perímetro anotada em 2026-05. Demonstra a saída sempre em faixa (nunca um número só), os dois
  lados da banda nomeados por rótulo próprio no fim da linha, e o eixo percentual com recorte de
  escala.
  ([preview escuro](./v3_participacao-de-mercado-entre-perimetros/preview.svg) ·
  [preview claro](./v3_participacao-de-mercado-entre-perimetros/preview-claro.svg))
* [`v4_ciclo-de-venda-com-amostra-pequena`](./v4_ciclo-de-venda-com-amostra-pequena/): mediana
  mensal do ciclo de venda, com a faixa entre quartis omitida nos dois meses com menos de 10
  fechamentos. Demonstra a borda da banda em `null` por regra de amostra, o aviso escrito na tela
  (não só na dica), a contagem de vendas junto de cada ponto e o ponto isolado com anel quando a
  faixa some.
  ([preview escuro](./v4_ciclo-de-venda-com-amostra-pequena/preview.svg) ·
  [preview claro](./v4_ciclo-de-venda-com-amostra-pequena/preview-claro.svg))

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o
   import do dado.
2. Se a página já tem outro visual desta família, use a mesma cor e a mesma opacidade de faixa
   (`--line-strong` a 0,18) para a dispersão não parecer um destaque diferente cartão a cartão.
3. Ligue `data` à consulta real; mantenha os dois limites da faixa como campos próprios do dado
   (`p25`, `p75` ou `min`, `max`), nunca só o par pronto, para a origem do número continuar
   auditável.
4. Dê altura ao pai (o corpo médio medido nos previews vai de 234 a 250 px em `card`; a
   `v4_ciclo-de-venda-com-amostra-pequena` usa `largo` porque oito meses com um rótulo de
   contagem por ponto não cabem no passo do `card` sem colidir) e embrulhe
   em `VisualCard` com `metricId` para a etiqueta de procedência: a incerteza da banda é, ela
   mesma, informação de procedência, então a etiqueta do cartão e a nota do gráfico se
   complementam, nunca se repetem.
5. Confira o recorte vazio, o recorte com um único ponto (que aqui vira o bloco `role="status"` no
   lugar do gráfico) e o mês ou a semana em que a amostra é pequena demais para a faixa.

## Referências

* [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/): a `Area` com
  dataKey em par e a `Line` por cima, base do padrão usado nas quatro versões.
* [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html):
  a separação entre a marca de banda e a marca de média, usada para decidir que a linha central
  nunca compartilha token com a faixa.
* [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line):
  a opacidade baixa da faixa com a linha sólida por cima, referência de acabamento para a
  `v1` e a `v2`.
* [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/): a
  faixa de mínimo a máximo com marcos de evento, referência direta da `v2`.
* Arquivo do Farol: [`app/src/components/visuals/charts/chartTheme.ts`](../../../../app/src/components/visuals/charts/chartTheme.ts),
  origem de `useAnimateOnce`, `AXIS_PROPS` e das cores de token usadas em toda versão.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões passaram sem bloqueante._

* **Modelo (as quatro versões).** A Anatomia e o passo 2 de "Como colar no Farol" dizem opacidade
  **0,18** para a faixa, e os quatro `Chart.tsx` usam `BAND_OPACITY = 0.32`. Os `meta.json` da `v1`
  e da `v2` repetem o 0,18. O desenho na tela está bom nos dois temas; o que diverge é o número
  escrito, que vai junto quando alguém copiar a instrução.
* **v1.** Os tiques do eixo X saem por `formatMonthShort` sobre dado semanal, então rótulos iguais
  aparecem lado a lado (`mar/26 mar/26`, `jun/26 jun/26`, `ago/26 ago/26`). A tendência se lê, mas o
  eixo não diz qual semana é qual.
* **v1.** A frase acessível mede 237 caracteres, a 13 do teto de 250 da ACE-1; o `check` avisa. A
  frase é calculada do dado e cresce com o recorte, então um rótulo mais longo estoura.
* **v3.** A frase acessível mede 238 caracteres, com a mesma ressalva da `v1`.
* **v3.** O comentário do topo do `data.ts` nomeia a casa ("participação de mercado estimada da
  Somma"). É a única ocorrência de nome de empresa real em todo o catálogo, e a seção 3 do contrato
  pede dado sem empresa real; nada disso aparece na tela nem nos valores. Trocar por um sujeito
  genérico deixa a versão alinhada com as demais.
* **v3.** A faixa é preenchida sobre domínio que começa em 2%, o que a EIX-2 lida ao pé da letra
  proíbe. O catálogo e a Anatomia deste modelo autorizam o recorte de escala por ser banda de
  incerteza sobre uma linha, e não volume a partir do zero; fica a nota porque a regra e a exceção
  moram em documentos diferentes.
* **v4.** O rótulo de contagem sai em Space Grotesk tabular a 11 px com halo de 4 px, e nos números
  de dois dígitos as tintas se encostam (`11 vendas` lê como um bloco só, o `1` de `14` e `16`
  parece cortado). Continua legível e é o mesmo acabamento de outras versões do acervo, mas um
  respiro maior ou 12 px resolveria.
* **v4.** O eixo Y sai de `domain={[0, 'dataMax + 10']}`, o que põe o último tique em `74 dias`,
  fora do passo redondo de 20 que a EIX-4 pede.
