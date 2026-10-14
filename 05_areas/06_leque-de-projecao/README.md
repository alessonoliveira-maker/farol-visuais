# Leque de projeção (fan chart)

## O que é

Faixas de percentis aninhadas que se abrem a partir do último dado real: cada faixa (por
exemplo p05 a p95, e p25 a p75, uma dentro da outra) mostra um intervalo de confiança da
projeção, e a incerteza cresce com o horizonte porque as faixas se alargam mês a mês. No ponto
de junção, onde o real termina, todas as faixas colapsam no mesmo valor medido, para o leque não
nascer solto. O nome vem do relatório de inflação de um banco central em 1997. Um leque só é
honesto quando declara três coisas: o método que gerou os percentis, quais percentis estão
desenhados e a partir de que data o traço deixa de ser medição e vira estimativa; sem isso é o
caso mais caro de leitura inventada da família de áreas, porque a forma sozinha já parece rigor
estatístico.

## Quando usar

- Projeção com método que produz percentis mês a mês ou semana a semana (p05, p25, p50, p75,
  p95), com o método nomeado em `notes` e na tela.
- Pergunta de chance: qual a probabilidade de passar da meta ou de encostar no teto até uma
  data.
- Histórico de pelo menos 12 períodos para a abertura do leque ter base; com menos que isso, ver
  o caso limite da `v4`.
- Distribuição assimétrica que precisa aparecer como tal, sem espelhar as faixas em torno da
  mediana.

## Quando evitar

- Projeção sem método, ou premissa de planilha apresentada com cara de medição: nomeie a
  premissa em vez de desenhar leque.
- Cenários discretos (pessimista e otimista, por exemplo): isso é faixa, não distribuição
  (`05_faixa-range-band`).
- Real contra previsto sem incerteza: `04_linhas/05_real-contra-previsto`.
- Linha protagonista com banda de erro já estimada: `04_linhas/04_linha-com-banda-de-intervalo`.
- Leitor que precisa de um número único: publique a mediana com a faixa escrita ao lado, nunca
  só o leque.

## Anatomia

1. **Faixas aninhadas da mais larga para a mais estreita**: `Area` com `dataKey` em par
   `[inferior, superior]` (a técnica de `05_faixa-range-band`), preenchida com `--line-strong`
   em duas opacidades da mesma cor, mais intensa no centro (COR-1: uma cor só por visual).
2. **Ponto de junção colapsado**: no último mês real, todos os percentis recebem o próprio valor
   medido, para as faixas nascerem de um ponto só e não de um degrau solto.
3. **Real sólido e mediana tracejada por cima das faixas**: duas `Line` na mesma cor de destaque
   (`--chart-1`), `real` com `connectNulls={false}` parando na junção e `median` começando ali
   com `strokeDasharray="4 4"`.
4. **`ReferenceLine` vertical de "hoje"** no mês ou semana de junção, com rótulo curto (ANO-2).
5. **Domínio a partir do zero** (EIX-1, EIX-2): toda grandeza da família de área começa no zero;
   numa contagem que não pode ser negativa, a borda inferior do percentil é limitada em zero
   mesmo que o método bruto projete menos que isso (`v4`).
6. **Método, percentis e data de corte sempre declarados**: o comentário do `data.ts` nomeia o
   método (bootstrap da variação histórica, no catálogo), os cinco percentis e o mês em que o
   real termina; o `meta.json` repete isso em `notes`, e a linha de leitura (ANO-5) ou a
   anotação levam a versão curta para a tela. Leque sem essa declaração não é uma projeção, é uma
   forma bonita sem lastro.

## Versões

- **`v1_receita-com-leque-ate-dezembro`**: o caminho feliz. Faixas p05 a p95 e p25 a p75 da mais
  larga para a mais estreita, colapsadas no último real, mediana tracejada e real sólido por
  cima, `ReferenceLine` de "hoje" com rótulo curto.
- **`v2_chance-de-bater-a-meta`**: leque sobre a receita acumulada contra a meta anual em
  `ReferenceLine` tracejada; a probabilidade de superar a meta sai de uma interpolação linear
  entre os percentis do último mês (nunca de sorteio) e aparece na linha de leitura e numa
  legenda com o valor de cada faixa, sem depender só da cor; as faixas não são espelhadas em
  torno da mediana.
- **`v3_agendas-projetadas-contra-teto`**: leque de agendas semanais da pré-vendas contra um teto
  de capacidade desenhado como `Line` em degrau (`stepAfter`) tracejada; a primeira semana em que
  o p75 passa do teto é achada no próprio dado e anotada com a data, no máximo duas anotações ao
  todo ("hoje" e a semana de encontro). O selo de procedência PREMISSA do trecho projetado é do
  `VisualCard` que embrulha o componente, não do `Chart` (ANO-6).
- **`v4_historico-curto`**: mesma técnica com só 5 meses de real, bem abaixo dos 12 recomendados;
  o horizonte projetado é truncado em 3 meses em vez dos 5 de costume porque o leque já abre
  demais, a linha de leitura diz quantos meses foram usados, e a borda inferior de uma contagem
  fica em zero mesmo quando o método bruto projetaria um valor negativo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o dado padrão pela série real vinda
   do seletor da página, mantendo os campos `real` e os cinco percentis.
2. **Nunca cole sem o método.** Ajuste o comentário do `data.ts` e o `notes` do `meta.json` para
   o método real de geração dos percentis da página; se a página ainda não tiver um método, o
   visual não deve ir para produção como leque.
3. Passe o mês ou semana de junção pela prop `todayMonth` (ou `todayWeek`, em `v3`) calculado do
   próprio dado real, nunca fixo no código.
4. Embrulhe no `VisualCard` do Farol: o `title` do `meta.json` vira o título do cartão, e o selo
   de procedência PREMISSA do trecho projetado (`v3`) é responsabilidade do cartão via
   `metricId`, não do `Chart`.
5. Dê altura ao pai (`h-64` ou similar) ou passe `height`; sem altura o `ResponsiveContainer`
   desenha zero.

## Referências

- [Wikipedia, Fan chart (time series)](https://en.wikipedia.org/wiki/Fan_chart_(time_series)):
  construção por percentis e o caso assimétrico.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary):
  o fan chart listado em Change over Time.
- [Vega-Lite, Line Chart with Confidence Interval Band](https://vega.github.io/vega-lite/examples/layer_line_errorband_ci.html):
  banda e linha central em camadas.
- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/): base técnica
  para empilhar faixas aninhadas, a mesma de `05_faixa-range-band`.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões foram aprovadas, nenhum item abaixo reprova._

- **Todas as versões**: o `YAxis` não passa `tickLine={false}` nem `tickMargin`, então sobra o
  traço curto do tique ao lado do rótulo, contra a EIX-5 (o `XAxis` já passa). O irmão
  `05_faixa-range-band/v2` mostra o ajuste.
- **`v1`, `v2` e `v4`**: o tique de moeda e de contagem quebra em duas linhas ("R$ 600" e "mil")
  dentro dos 56 px de `VALUE_AXIS_WIDTH`. Continua legível nos dois temas; um renderizador de
  tique próprio, como o de `05_faixa-range-band/v2`, resolveria numa linha só.
- **`v1`, `v2` e `v4`**: a linha de leitura traz "jul/26", "dez/26" e "3 meses" escritos no
  código, enquanto o mês de junção e o horizonte chegam por prop e pelo dado. A ANO-5 pede a
  frase calculada do dado; a `v3` já faz assim, com `crossing.week` e `formatDate`.
- **`v1`, `v3` e `v4`**: as duas faixas do leque não têm identificação na tela; quem olha vê dois
  tons e não sabe quais percentis são. A `v2` resolve com a legenda que escreve o valor de cada
  faixa, e o mesmo recurso caberia aqui.
- **`v2`**: a amostra de 10 px da legenda, em `--line-strong` com opacidade de 0,16, quase não
  aparece nos dois temas. Como o texto ao lado já nomeia a faixa e o valor, nada se perde, mas a
  amostra não está cumprindo papel.
- **`v2`**: o texto da legenda está em 11 px; a tabela 17.1 reserva 12 px para legenda e 11 px
  para tique, anotação e nota.
- **`v3`**: o `ceiling` é constante em 45 nas 12 semanas, então o `type="stepAfter"` não desenha
  degrau nenhum e a técnica que o catálogo pede fica invisível. Uma mudança de capacidade no meio
  do horizonte faria a escolha da `Line` se justificar diante de uma `ReferenceLine`.
- **`v3`**: o cruzamento usa comparação estrita (`p75 > ceiling`), então S29, em que o p75 empata
  com o teto em 45, não aparece na leitura, embora o caso de uso fale em "encostar no teto".
- **`v3`**: o rótulo "real 36" nasce a poucos pixels da tracejada do teto; o halo segura a
  leitura, mas com outro recorte de dado os dois podem se encostar (ROT-9).
- **`v4`**: o `p05` de out/26 é zero e a borda inferior encosta no eixo, o que está correto pela
  EIX-1 e está explicado no `data.ts`; na tela, porém, nada distingue "limitado em zero" de
  "projetado em zero". Uma anotação curta de 11 px no ponto resolveria.
