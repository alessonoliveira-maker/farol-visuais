# Bump chart de ranking

## O que é

A posição de cada item em cada período, ligada por linhas, com o eixo vertical invertido (1º no
topo) e um ponto grande em cada linha trazendo o número da posição. A forma mostra quem subiu,
quem caiu e as trocas de liderança, mas apaga a distância entre posições: dois itens vizinhos
podem estar a um real ou a um milhão de reais de diferença e a linha desenha a mesma distância de
um degrau. Por isso a peça sempre diz, num texto visível, que o eixo é posição e não valor, e o
valor que gerou cada posição fica acessível na dica; sem essas duas peças o leitor lê distância
onde só há ordem.

## Quando usar

* Mudança de posição de 5 a 12 itens ao longo de 4 a 12 períodos: executivos, origens de lead,
  criativos, squads.
* Pergunta de quem subiu e quem caiu, e não de por quanto.
* Top N com entradas e saídas ao longo do tempo, como a fadiga de um criativo que cai aos poucos
  do topo do ranking.

## Quando evitar

* Distância entre posições importa: use `02_multiplas-series` com o valor no eixo.
* Só dois momentos: use o slope de `17_comparacao-de-pontos`.
* Posição num instante só: use a barra ordenada de `02_barras-horizontais`.
* Mais de 12 itens com muitos cruzamentos: filtre um top N ou use pequenos múltiplos.
* Universo que muda de tamanho entre períodos sem regra declarada: fixe o universo (top N) ou
  normalize para percentil antes de ranquear.

## Anatomia

1. **Eixo y ordinal invertido**, `YAxis reversed domain={[1, N]} allowDecimals={false}`, com
   tique em ordinal (`1º`, `2º`...) e largura estreita, porque o número já aparece dentro de cada
   ponto.
2. **Ranking calculado em TypeScript por período**, nunca lido pronto do dado: soma-se ou
   ordena-se por valor, e o empate usa competição (`1º, 2º, 2º, 4º`, o quarto lugar pula o
   terceiro) com desempate estável por uma chave secundária declarada (o nome, em ordem
   alfabética), para o mesmo empate não trocar de ordem entre um render e outro.
3. **Dot próprio com o número da posição dentro do círculo**: um círculo na cor da série com o
   texto do rank ao centro, nunca a marca colorida cheia com o número por cima, porque nenhuma
   cor categórica passa o contraste de texto exigido pela ACE-3 nos dois temas.
4. **Nome nas duas pontas, sem legenda**: o rótulo direto do início e do fim da linha substitui a
   legenda; quando duas ou mais linhas empatam numa ponta, os nomes se amontoam na mesma linha, e
   o modelo separa os rótulos por um deslocamento fixo em torno da posição comum, sem mexer no
   ponto real do dado nem inventar uma posição que o dado não tem.
5. **O valor absoluto mora na dica, nunca só no eixo.** Como a posição apaga a magnitude, a dica
   troca o valor de posição pelo valor de origem (receita, CPL, SLA) formatado pela unidade da
   métrica, e uma frase curta no corpo do gráfico declara que o eixo é posição.
6. **Universo fixo em top N**: itens fora do recorte (abaixo do corte, ou período sem operação)
   viram `null` com `connectNulls={false}`, nunca zero e nunca a última posição por padrão; a
   linha reaparece com um ponto anelado quando o item volta a entrar.

## Versões

* [`v1_posicao-de-seis-executivos`](./v1_posicao-de-seis-executivos/): ranking de receita
  reconhecida de 6 executivos fictícios em 8 trimestres. Demonstra o eixo ordinal invertido, o
  ranking calculado por trimestre com desempate estável, o dot com o número da posição e o nome
  nas duas pontas, sem legenda; a receita fica só na dica.
  ([preview escuro](./v1_posicao-de-seis-executivos/preview.svg) ·
  [preview claro](./v1_posicao-de-seis-executivos/preview-claro.svg))
* [`v2_origem-que-mais-subiu`](./v2_origem-que-mais-subiu/): ranking de volume de 8 origens de
  lead em 6 meses, com a origem que mais sobe em destaque contra as outras sete em neutro.
  Demonstra o rótulo em peso 700 só na destacada, a anotação com as posições de início e fim da
  subida, a frase que declara que o eixo é posição e não volume e a dica com o volume absoluto de
  leads. Toda origem usa rótulo genérico de canal, nunca marca real (checklist 23).
  ([preview escuro](./v2_origem-que-mais-subiu/preview.svg) ·
  [preview claro](./v2_origem-que-mais-subiu/preview-claro.svg))
* [`v3_top-10-criativos-em-12-semanas`](./v3_top-10-criativos-em-12-semanas/): top 10 de CPL
  qualificado entre 12 criativos, ao longo de 12 semanas. Demonstra o universo fixo (quem sai do
  top 10 vira lacuna, não zero), o ponto anelado na entrada e na saída com o nome de quem entra
  quando a série nunca aparece numa ponta, a anticolisão dos rótulos das pontas quando duas
  posições empatam na última semana sem mover o ponto do lugar real (só o nome se desloca; o
  círculo é um só, na primeira série em ordem de id) e a descida lenta e constante de um criativo
  lida como fadiga.
  ([preview escuro](./v3_top-10-criativos-em-12-semanas/preview.svg) ·
  [preview claro](./v3_top-10-criativos-em-12-semanas/preview-claro.svg))
* [`v4_empates-e-squad-pausado`](./v4_empates-e-squad-pausado/): ranking semanal de SLA de 5
  squads fictícios em 8 semanas, com empates frequentes e um squad parado por 3 semanas.
  Demonstra a regra de empate por competição escrita em nota, o desempate estável, o traço
  interrompido no período sem operar (sem herdar a última posição) e o trecho ausente sem
  interpolação entre as bordas.
  ([preview escuro](./v4_empates-e-squad-pausado/preview.svg) ·
  [preview claro](./v4_empates-e-squad-pausado/preview-claro.svg))

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o
   import do dado.
2. Ligue `data` à consulta real: cada série entra com seus valores brutos por período (receita,
   CPL, SLA); o ranking, o corte de universo e o desempate continuam sendo calculados dentro do
   `Chart`, nunca pré-calculados na página, para o componente ficar responsável pela única regra
   de empate declarada.
3. Se a página usa um top N diferente de 10, ou um número de itens diferente de 6, ajuste as
   constantes de desenho no topo do arquivo (`RANK_AXIS_WIDTH`, `DOT_RADIUS`, os tiques do
   domínio) e a lista de cores categóricas, que segue a ordem de slot da COR-8 e não a ordem de
   entrada dos itens.
4. Dê altura ao pai (`h-64` a `h-80`) e embrulhe em `VisualCard`; a etiqueta de procedência do
   valor de origem (MEDIDO, DERIVADO) vem do `metricId` do cartão, nunca de um selo desenhado
   dentro do Chart.
5. Confira o recorte com menos itens que o top N (universo menor do que N não deve inventar
   posições vazias) e o recorte em que todos os itens empatam no primeiro período, caso em que a
   anticolisão da ponta inicial precisa segurar sozinha.

## Referências

* [Data Viz Project, Bump Chart](https://datavizproject.com/data-type/bump-chart-2/) (não abriu).
  Apareceu na busca com a descrição de mudança de posição, vencedores e perdedores.
* [nivo, Bump](https://nivo.rocks/bump/): observar largura e opacidade de linha ativa e inativa e
  rótulos de início e fim.
* [Vega-Lite, Line Charts Showing Ranks Over Time](https://vega.github.io/vega-lite/examples/window_rank.html):
  observar o rank recalculado a cada período.
* [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization):
  observar bump chart e bump area chart como formas distintas.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Só itens que não reprovam; o que reprovou está no veredito de cada versão._

* `v1_posicao-de-seis-executivos`: não tem anticolisão de empate. O dado fixo não empata em nenhum
  trimestre, então o preview sai limpo, mas um recorte com dois executivos de mesma receita
  escreveria um número por cima do outro; `v3` e `v4` já trazem o deslocamento pronto para copiar.
* `v1`: o número dentro do círculo usa `font-display` sem `tabular-nums`. Com âncora ao centro
  isso não desalinha a coluna, mas foge da TIP-1. `v3` já corrigiu (2026-09-18).
* `v2_origem-que-mais-subiu`: as outras sete origens ficam sem rótulo e sem legenda; a identidade
  delas só existe na dica. O destaque responde à pergunta, e o pano de fundo é lido como conjunto,
  mas quem colar numa página em que as sete importam precisa rotular as pontas.
* `v2`: a anotação `de 8º a 1º em 6 meses` cai sobre a grade e sobre linhas do pano de fundo. O
  halo da ROT-7 segura a leitura nos dois temas; uma margem reservada seria mais robusta.
* `v3_top-10-criativos-em-12-semanas`: nove dos doze criativos têm CPL constante nas 12 semanas, o
  que desenha fileiras paralelas e não exercita a troca de liderança que o modelo promete.
* `v4_empates-e-squad-pausado`: no empate o deslocamento move o círculo e o número, não só o
  rótulo, então o ponto se descola da própria linha em cerca de 10 px. Na escala desta versão os
  dois pontos continuam dentro da faixa da posição e se leem soltos; a Anatomia, item 4, diz que o
  deslocamento não mexe no ponto real do dado, e o código faz o contrário. `v3` corrigiu a mesma
  causa (2026-09-18): lá o passo entre linhas era menor e o mesmo deslocamento cobria o círculo
  vizinho, o que forçou a correção; aqui fica registrado para quem for copiar `v4` num recorte
  mais apertado.

_Segunda revisão independente de 2026-09-18, depois da correção abaixo. `v1`, `v2` e `v4`
aprovadas; `v3` reprovada por um bloqueante (a linha do eixo x corre sobre a 10ª posição e
preenche as lacunas), que está no veredito da versão e não aqui._

* `v1`: `series.values[qIndex] ?? 0` faz valor ausente virar zero e cair para a última posição. O
  dado fixo não tem buraco, então o preview não mostra, mas um recorte real com trimestre em
  aberto mostraria (EIX-10). `v4` já trata o ausente como `null`.
* `v1`: a linha de leitura é um aviso fixo sobre o eixo, não uma conclusão calculada do dado
  (ANO-5). O aviso é exigido pela Anatomia, item 5, então vale como nuance de redação.
* `v2`: a frase acessível escreve `8 origens` por literal enquanto o resto sai do dado; um recorte
  com outro número de origens desmente a própria frase. `v1` e `v4` contam do dado.
* `v2`: o halo do rótulo da anotação apaga metade do ponto neutro de abr/26 na 6ª posição, nos
  dois temas. O ponto ainda se lê, mas é a mesma armadilha que a ROT-7 descreve para a barra
  curta; uma margem reservada para a anotação resolveria de vez.
* `v2`: as sete séries de contexto usam `--line-strong` sem nenhum valor escrito na marca ou junto
  dela, e a 17.2 só isenta o neutro do piso de 3:1 quando o valor está escrito. O catálogo pede
  esse desenho e a leitura sai limpa nos dois temas, então fica como registro. Em `v3` a mesma cor
  aparece com o número da posição dentro do ponto, que é a forma coberta pela isenção.
* `v3`: o mesmo `?? 0` aqui inverte o sentido, porque o CPL ordena do menor para o maior: criativo
  sem dado viraria zero e apareceria em 1º lugar.
* `v3` e `v4`: `shortDate` formata dia e mês fora de `@/lib/format` (seção 8). `v4` declara o
  motivo em comentário; `v3` não.
* `v3`: o canvas está fixado em 960 por 480, acima do preset `largo`, e as `notes` falam do tique
  do eixo y, não da altura. Pela ESP-2 o desvio declarado é o que a nota precisa explicar.

_Terceira revisão independente de 2026-09-18, sobre o estado atual dos arquivos. As quatro versões
aprovadas, `npm run check` com 0 erro e 2 avisos de `FRASE-ACESSIVEL`. Itens novos ou medidos
nesta passada:_

* `v1`: a dica usa `cursor={{ stroke: 'var(--line-strong)' }}` em vez do `CURSOR_COLOR` da
  seção 6, que é o cursor de linha pedido pela DIC-3. Mesma família de tom, então a leitura não
  muda; vale a troca quando o modelo for copiado. Vale para as quatro versões.
* `v1` e `v2`: a frase acessível fica a 6 e a 4 caracteres do teto de 250 da ACE-1. Como ela é
  calculada do dado, um recorte com mais séries ou com nome mais longo estoura o teto sem ninguém
  mexer no código.
* `v2`: o halo da anotação `de 8º a 1º em 6 meses` não apaga só o pano de fundo, apaga um pedaço
  da própria linha em destaque entre mar/26 e abr/26. Medido no PNG escuro em 2x: 14 colunas sem
  tinta de `--chart-1`, da coluna 556 à 569, cerca de 7 px na escala do componente. Os pontos das
  duas pontas do trecho seguram a leitura, mas a anotação numa margem reservada resolve de vez.
* `v3`: no empate da última semana o leitor vê duas pontas rotuladas na 5ª posição, um único
  círculo e nenhuma 6ª posição, sem nenhuma nota dizendo que o empate reparte a colocação. A nota
  existe só na `v4`; uma linha igual à dela deixaria a regra explícita onde ela aparece.
* `v3`: com nove das doze séries em CPL constante, a linha da série em `--line-strong` e a grade
  em `--line-subtle` ficam quase iguais, e o vão de quem sai do top 10 se distingue só pelo tom.
  Medido no tema claro: `180, 192, 214` no trecho com série contra `220, 227, 239` no trecho de
  lacuna. A ausência não vira zero e os quatro vãos aparecem, mas o degrau é estreito.
* `v4`: o deslocamento do empate move o círculo e o número, e não só o nome. O efeito que se vê no
  PNG é a linha da série passando no vão entre os dois pontos empatados, em 11/05 e em 18/05, e o
  anel tracejado do squad pausado cruzando o círculo vizinho em 18/05, porque o anel tem raio 13 e
  os dois centros ficam a 20 px. Os dois números continuam legíveis nos dois temas e a nota do
  rodapé declara a regra, então fica como registro; `v3` já mostra a forma que desloca só o nome.

## Correção de 2026-09-18 (rodada única)

`v2` e `v3` foram reprovadas numa revisão independente; `v1` e `v4` não foram tocadas.

* `v2`: `Mídia paga Meta` nomeava uma plataforma real. Trocado por `Mídia paga social`, a
  convenção genérica do resto do catálogo (checklist 23). Acrescentada a frase visível que
  declara eixo de posição, não de valor (Anatomia, item 5), que já existia nas outras três versões.
* `v3`: quatro causas, todas na mesma peça de código.
  1. Dois dos três criativos que passam pela 10ª posição (`Comparativo de resultado`,
     `Tutorial curto`) nunca apareciam numa ponta e liam como se a linha fosse sempre de
     `Banner sazonal`. Passaram a ganhar o próprio nome no momento em que entram no top 10.
  2. A nota promete lacuna para quem sai, mas com 12 candidatos para 10 vagas a 10ª posição
     nunca fica vazia; a rotulagem do item acima marca a troca de ocupante em vez de mudar o
     dado (a alternativa aberta pelo revisor era mudar o dado; ficou registrado como decisão,
     não como pendência).
  3. e 4. O empate da última semana (`UGC de cliente` e `Prova social`) deslocava o círculo e o
     número para separar os rótulos, o que descolava o ponto da própria linha e, no passo mais
     curto desta versão, cobria o círculo da posição vizinha. Corrigido: o círculo e o número
     ficam no lugar verdadeiro (compartilhado pelas duas séries, desenhado só pela primeira em
     ordem de id) e só o texto do nome se desloca; o canvas de render cresceu de 400 para 480 px
     de altura para dar folga ao passo entre linhas.
  Render e `npm run check` conferidos nos dois temas depois da correção: 0 erro, 2 avisos
  pré-existentes de `FRASE-ACESSIVEL` em `v1`/`v2` (a frase calculada do dado fica a poucos
  caracteres do teto de 250, não é regressão desta rodada).
