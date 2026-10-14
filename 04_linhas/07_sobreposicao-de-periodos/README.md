# Sobreposição de períodos

## O que é

O período atual e um ou mais períodos anteriores desenhados no mesmo eixo de calendário
relativo, semana ISO ou dia útil do mês, nunca a data civil. O pivot de formato longo (uma linha
por período e posição) para colunas comparáveis acontece em TypeScript, e cada linha carrega o
nome do próprio período escrito na ponta, sem legenda: quem lê precisa saber qual traço é qual
ano sem depender só da cor.

## Quando usar

* Ano contra ano por semana ISO: agendas, entradas, fechamentos.
* Mês corrente contra a média dos meses anteriores, alinhado por dia útil.
* Ano corrente contra a faixa de mínimo e máximo dos anos anteriores.
* Dois períodos com números diferentes de dias úteis, quando a pergunta é o ritmo e não o total.

## Quando evitar

* Série contínua em que a pergunta é tendência e não sazonalidade: use `01_linha-simples`.
* Comparação de só dois momentos agregados: use `17_comparacao-de-pontos`.
* Mais de 3 anos anteriores desenhados um a um: resuma em faixa de mínimo e máximo (`v3`).
* Calendários desalinhados sem normalização declarada: normalize por dia útil ou por fração do
  período e escreva a normalização no visual (`v4`).

## Anatomia

1. **Pivot em TypeScript**, sempre a partir de um dado fictício em formato longo (`{ano, semana,
   valor}` ou `{mês, diaÚtil, valor}`), nunca já pronto em colunas: o `Chart.tsx` monta o eixo
   relativo (semana 1 a 52, dia útil 1 a N, ou fração do mês) e encaixa cada período na sua
   posição, para o componente provar a técnica e não só desenhar um dado já arrumado.
2. **Período atual em `--chart-1`**, com 2 px de traço; período de referência em `--line-strong`
   (`v1`, `v2`) ou faixa `Area` no mesmo tom com opacidade (`v3`), porque o neutro só é honesto
   com o valor escrito ao lado, nunca como amostra de legenda isolada.
3. **Rótulo no fim de cada linha**, nome do período e valor (`formatInt` ou `formatCurrencyCompact`
   conforme a unidade), com halo (`paintOrder: 'stroke'`) e verificação de colisão vertical: quando
   dois pontos finais caem na mesma coluna e a menos de 16 px um do outro, o segundo rótulo desloca
   e ganha um conector fino até o ponto real, nunca dividindo a linha de tinta com o primeiro
   (`v1`, `v2`, `v4`).
4. **Ano corrente incompleto termina em `null`** (`connectNulls={false}`), sem repetir o último
   valor medido nem inventar ponto para o período curto alcançar o comprimento do período longo
   (`v1`, `v3`, `v4`).
5. **Marcação do que sai do padrão:** ponto de hoje contra a média com a diferença escrita e a
   base nomeada na mesma linha (`v2`); semana fora da faixa histórica com ponto e valor (`v3`).
6. **Nota curta de normalização** quando o alinhamento não é óbvio de olhar: qual dia é "hoje"
   (`v2`), quais anos formam a faixa (`v3`), o que significa 0% e 100% no eixo (`v4`).

## Versões

* [`v1_agendas-por-semana-2026-contra-2025`](./v1_agendas-por-semana-2026-contra-2025/): agendas
  comerciais por semana ISO, as 52 semanas de 2025 contra as 37 semanas medidas de 2026. Demonstra
  o pivot de formato longo para colunas por ano, o ano corrente terminando em `null` depois da
  semana 37 e o rótulo do ano escrito na ponta de cada linha, sem legenda.
  ([preview escuro](./v1_agendas-por-semana-2026-contra-2025/preview.svg) ·
  [preview claro](./v1_agendas-por-semana-2026-contra-2025/preview-claro.svg))
* [`v2_receita-por-dia-util-contra-media`](./v2_receita-por-dia-util-contra-media/): receita
  reconhecida acumulada de setembro de 2026 por dia útil, medida até o 9º dia (hoje), contra a
  média da mesma acumulação nos 6 meses anteriores. Demonstra o alinhamento por dia útil em vez de
  data civil, a diferença de hoje escrita com a base nomeada e o desvio anticolisão quando as duas
  pontas de linha caem perto uma da outra no mesmo dia.
  ([preview escuro](./v2_receita-por-dia-util-contra-media/preview.svg) ·
  [preview claro](./v2_receita-por-dia-util-contra-media/preview-claro.svg))
* [`v3_entradas-sobre-faixa-de-tres-anos`](./v3_entradas-sobre-faixa-de-tres-anos/): entradas de
  leads por semana ISO de 2026, medidas até a semana 27, sobre a faixa de mínimo e máximo da mesma
  semana em 2023, 2024 e 2025. Demonstra a faixa histórica completa por trás da linha do ano
  corrente, as semanas em que 2026 sai da faixa marcadas com ponto e valor, e a nota dizendo quais
  anos formam a faixa.
  ([preview escuro](./v3_entradas-sobre-faixa-de-tres-anos/preview.svg) ·
  [preview claro](./v3_entradas-sobre-faixa-de-tres-anos/preview-claro.svg))
* [`v4_meses-com-dias-uteis-diferentes`](./v4_meses-com-dias-uteis-diferentes/): agendas
  acumuladas de dezembro de 2025 (18 dias úteis) contra maio de 2026 (22 dias úteis), alinhadas
  pela fração do mês útil decorrida em vez do dia civil. Demonstra o eixo de 0% a 100%, o mês curto
  sem pontos inventados para igualar o longo e a dica escrevendo o dia útil real ao lado da fração.
  ([preview escuro](./v4_meses-com-dias-uteis-diferentes/preview.svg) ·
  [preview claro](./v4_meses-com-dias-uteis-diferentes/preview-claro.svg))

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o
   dado fictício pela consulta real; mantenha o formato longo de entrada (uma linha por período e
   posição relativa), porque é dele que o pivot depende.
2. Decida a posição relativa na origem, não no componente: se a página compara ano contra ano por
   semana ISO, a consulta já devolve `isoWeek`; se compara dia útil, a consulta já exclui fins de
   semana e feriados antes de chegar ao componente.
3. Quando o negócio tiver mais de 3 períodos anteriores, prefira a faixa de mínimo e máximo (`v3`)
   a desenhar uma linha por ano: a partir do quarto traço a leitura de qual é qual se perde mesmo
   com rótulo na ponta.
4. Dê altura ao pai (`h-64` a `h-80`, ou `h-96` no canvas `largo` da `v3`) e embrulhe em
   `VisualCard` com `metricId`; o Chart não desenha título nem etiqueta de procedência.
5. Confira o recorte do primeiro período medido, em que só existe uma linha na tela, e o recorte
   em que os dois períodos têm o mesmo comprimento: é aí que a verificação de colisão do rótulo
   final precisa disparar o desvio.

## Referências

* Exemplo oficial: [Recharts, Compare Two Lines](https://recharts.github.io/en-US/examples/CompareTwoLines/).
  Observar a comparação tracejada e a diferença exibida no hover.
* Praticante: [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/).
  Observar a sobreposição para revelar regularidade.
* Galeria: [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line).
  Observar a faixa histórica com a linha do período atual por cima, usada na `v3`.
* Arquivo do Farol: [`app/src/components/visuals/charts/chartTheme.ts`](../../../../app/src/components/visuals/charts/chartTheme.ts),
  origem de `useAnimateOnce`, `AXIS_PROPS` e das cores de token usadas em toda versão.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões foram aprovadas. Nenhum item abaixo impede o uso do
modelo como referência._

* `v1`: o rótulo do ano corrente sai em `--text-primary` com peso 700, enquanto a ROT-3 pede
  `--text-secondary`; o peso é o segundo canal que a COR-2 exige para o destaque, então a leitura
  não muda, mas a divergência vale registro.
* `v1`: o rótulo do ano anterior só é desenhado dentro do renderizador do ponto do ano corrente;
  num recorte em que nenhuma semana do ano corrente foi medida, a linha do ano anterior fica sem
  rótulo na ponta.
* `v2`: com `VALUE_AXIS_WIDTH = 56`, os tiques de moeda quebram em duas linhas (`R$ 900` e `mil`);
  nada é cortado, mas um passo de eixo mais curto deixaria cada tique numa linha só.
* `v2`: o rótulo da ponta escreve o mês corrente como `2026 09`; `formatMonthShort`, que a `v4` já
  usa, daria `set/26` e deixaria as quatro versões falando a mesma língua.
* `v3`: a faixa histórica é `--line-strong` com opacidade 0,28 e mede 1,14:1 no tema escuro e
  1,16:1 no claro contra o cartão, abaixo dos 3:1 da ACE-3, sem a isenção do valor escrito junto da
  marca; a conclusão se sustenta pelos pontos fora da faixa, que trazem o valor, mas subir a
  opacidade ou escrever mínimo e máximo de uma semana deixaria a faixa dentro da régua.
* `v3`: no pivot, a semana histórica ausente vira zero (`?? 0`) e derrubaria o piso da faixa até a
  linha do zero; com o dado fixo entregue isso não acontece, porque os três anos cobrem todas as
  semanas, mas quem colar o componente numa consulta real herda a armadilha.
* `v4`: a cor de cada mês sai da posição na lista ordenada (`SERIES_COLORS[months.indexOf(month)]`);
  com os dois meses entregues o mês corrente fica em `--chart-1`, como manda a anatomia, mas um
  terceiro mês reaproveitaria `--chart-3` pelo resto da divisão.
* `v4`: o eixo vertical continua em acumulado absoluto enquanto o horizontal é fração do mês, então
  a distância entre as linhas ainda carrega a diferença de dias úteis (18 contra 22); o ritmo real é
  de 7,8 contra 8,2 agendas por dia útil. Média por dia útil decorrido, ou percentual do total do
  mês, isolaria o ritmo sem mudar a técnica de alinhamento.
