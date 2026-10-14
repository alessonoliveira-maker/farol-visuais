# Coluna radial (barplot circular)

## O que é

Barras que saem de um círculo interno vazio para fora, uma por categoria ou por passo de um
ciclo, desenhadas como setores de anel com geometria própria em SVG puro (não um retângulo
girado). Lê se como um gráfico de colunas comum dobrado num círculo: o valor ainda é a distância
do centro até a ponta, só que a distância nasce de um raio interno em vez de uma linha de base
reta. A forma só se paga quando o círculo significa alguma coisa: um ciclo de 24 horas, de 7 dias
ou de 365 dias, ou uma quantidade grande demais de categorias para caber numa barra horizontal.

## Quando usar

- Ciclo com sentido circular de verdade: 24 horas do dia, 7 dias da semana, 12 meses ou 365 dias
  do ano, em que o fim de uma volta encosta no início da próxima.
- Muitas categorias, 40 ou mais, com um padrão evidente e ordenação natural pelo próprio ciclo
  (não por valor): o círculo cabe onde uma barra horizontal de 40 linhas não caberia.
- Janela de tempo sobreposta ao ciclo, como o horário de atendimento dentro do dia.
- Desvio contra a média com valores negativos, usando o zero num anel intermediário em vez de
  numa borda.

## Quando evitar

- Série temporal sem ciclo, em que um mês não tem relação nenhuma com o mesmo mês do ano
  seguinte: colunas retas (`03_colunas-verticais`) ou linha (`04_linhas`) leem em linha reta sem
  distorcer nada.
- Menos de uns 40 itens sem ciclo: barra horizontal (`02_barras-horizontais`) ordena com precisão
  e não tem o efeito de área da seção seguinte.
- Pergunta sobre dia da semana dentro do ano inteiro: calendário (`15_calendario-e-heatmap-temporal`)
  lê melhor uma grade de semanas do que uma espiral de dias.
- **Comparar duas colunas pelo comprimento do arco ou pela área que elas cobrem.** O raio é
  enganoso por construção: o mesmo valor desenha um arco maior quanto mais longe do centro ele
  está, porque a área de um setor de anel cresce com o raio médio, não só com a diferença de
  raio. Duas colunas de comprimento parecido em raios diferentes podem valer números bem
  diferentes, e o olho não tem como saber sem olhar a escala. Por isso nenhuma versão deste
  modelo pede para o leitor comparar duas marcas a olho: o valor sempre sai escrito, seja no
  próprio ponto (quando cabem poucas marcas, como nas duas semanas extremas da v4), seja na
  escala numerada dos anéis de grade (quando são muitas, como as 24 horas da v1 ou os 365 dias da
  v3). Quando a pergunta é justamente comparar duas categorias com precisão, a resposta certa é
  sair do círculo: barra horizontal (`02_barras-horizontais`).
- Comparar durações por comprimento de arco em raios diferentes, ou muitos anos numa espiral:
  isso mora em `20_cronograma-e-linha-do-tempo`, não aqui.

## Anatomia

1. **Círculo interno vazio, com mais da metade do raio externo.** É o zero do eixo de valor; um
   círculo pequeno demais faz a área do setor crescer mais rápido que o valor perto do centro, e
   o gráfico passa a mentir sobre categorias pequenas antes mesmo de chegar à borda.
2. **Setores de anel, um por categoria**, calculados por `arcPath` (raios e ângulos em graus,
   convertidos para radianos só na hora de desenhar). Nunca um `rect` girado: um retângulo girado
   não acompanha a curvatura do anel e desenha cantos que não existem no dado.
3. **Anéis de grade com o valor escrito**, sempre no mesmo ângulo (a costura do ciclo: o vão
   entre 2h e 3h na v1 e v2, a virada do ano na v3 e na v4). É a escala que resolve o viés do
   raio descrito em "Quando evitar": qualquer coluna se lê contra os anéis, nunca contra a
   vizinha.
4. **Vão angular** entre categorias (v1, v2) ou entre grupos de categorias (v3, por mês), em
   `var(--line-subtle)` implícito no espaço vazio entre setores, nunca em contorno.
5. **Rótulos de categoria horizontais**, nunca girados com o arco (TIP-5): hora a cada três horas
   nas v1 e v2, mês por `formatMonthShort` na v3, ancorados por quadrante (`start`, `middle` ou
   `end`) conforme o lado do círculo.
6. **Anotação pontual só onde cabe**: pico do dia na v2, semana melhor e pior na v4, sempre com
   nome e valor, respeitando o teto de duas anotações por visual.

## Versões

- **[`v1_entradas-por-hora-do-dia/`](./v1_entradas-por-hora-do-dia/):** a forma básica, 24 setores
  em `--chart-1`, círculo interno grande e quatro anéis de grade com o valor escrito num único
  ângulo; nenhum rótulo por hora, para não colidir em 24 posições.
- **[`v2_janela-de-atendimento-e-pico/`](./v2_janela-de-atendimento-e-pico/):** a mesma base com a
  janela de atendimento (9h às 18h) em `--surface-sunken` atrás das colunas, a anotação do pico
  das 11h com o valor exato, e a parte fora da janela calculada na linha de leitura.
- **[`v3_leads-por-dia-do-ano/`](./v3_leads-por-dia-do-ano/):** o caso denso, 365 colunas finas
  agrupadas em 12 meses com vão angular entre eles, geometria calculada uma vez com `useMemo`, e
  a média diária escrita num anel tracejado porque rótulo por dia não cabe.
- **[`v4_desvio-semanal-do-cpl/`](./v4_desvio-semanal-do-cpl/):** o pirulito radial (haste e
  ponto, menos tinta que 52 colunas cheias), zero num anel intermediário com hastes para dentro e
  para fora, cor pela polaridade do CPL (abaixo da média é bom) e as duas semanas extremas com o
  valor escrito.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o
   `data` pela consulta real da página, no formato do `data.ts` da versão escolhida.
2. O corpo precisa ser tão alto quanto largo para o círculo não recortar: dê ao contêiner pai uma
   altura próxima da largura (`aspect-square` no pai, ou `h-64`/`h-80` num cartão já largo). Um
   contêiner muito baixo encolhe o raio pela menor dimensão e sobra vazio nas laterais.
3. Os ângulos e raios são constantes do arquivo (`INNER_R`, `OUTER_R`, `ZERO_R`...), pensadas para
   o `viewBox` declarado; mudar o canvas do cartão não exige tocar nelas, porque o SVG escala
   inteiro.
4. Antes de usar em produção, confira se a pergunta da página é mesmo sobre um ciclo ou sobre
   muitas categorias. Se virar comparação de poucas categorias por precisão, o modelo certo é a
   barra horizontal (`02_barras-horizontais`), não este.

## Referências

- [From Data to Viz, circular barplot](https://www.data-to-viz.com/graph/circularbarplot.html):
  a lista de erros comuns (círculo interno pequeno, poucos itens, falta de escala, ordem
  arbitrária) que a Anatomia acima existe para evitar.
- [Data Visualisation Catalogue, radial column chart](https://datavizcatalogue.com/methods/radial_column_chart.html):
  o zero num anel intermediário para acomodar negativos, usado na v4.
- [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): as variantes simples, agrupada e
  invertida da coluna radial, referência de repertório para além das quatro versões daqui.
- Estudo de origem: [`_estudo/familias/07_rosca-e-radial.md`](../../_estudo/familias/07_rosca-e-radial.md),
  seção 10 (Coluna radial).

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-18. Nenhuma das quatro versões tem bloqueante; tudo abaixo é
acabamento ou pedido de correção em outro arquivo._

- **v1:** a frase acessível imprime a data crua `2026-08-01`; a NUM-7 pede `formatDate` para data
  de tela, e a frase acessível é lida em voz alta como tela. Vale também para a v2.
- **v1:** o rótulo de hora nasce na borda inicial do slot de 15°, não no centro da própria coluna;
  lê se como marcação de relógio, mas a coluna daquela hora fica sempre deslocada do rótulo.
- **v1 e v2:** `0h`, `3h`, `12h` saem em `font-sans` sem `tabular-nums`; a TIP-1 pede algarismo
  tabular em todo número de tela, inclusive no rótulo de categoria.
- **v1:** não há linha de leitura; a conclusão do visual vive só na frase acessível. A v2 mostra
  como fica com ela.
- **v2:** a faixa da janela de atendimento não carrega texto sobre si mesma; o que ela marca só
  aparece na linha de leitura acima do gráfico (ANO-4 pede o texto junto da faixa).
- **v2:** a anotação do pico nasce na borda anti-horária da coluna das 11h e se estende por cima
  do setor das 9h e 10h; o texto nomeia a hora, então não confunde, mas a âncora poderia ser o
  centro da própria coluna.
- **v2:** o halo da anotação é `--surface-raised` e apaga um pedaço da faixa `--surface-sunken`
  que passa por baixo dela.
- **v3:** o catálogo diz "ordenação por valor" no item de muitas categorias, e o README do modelo
  diz o contrário, ordenação pelo próprio ciclo. A implementação segue o README, que é o certo
  para o modelo; a entrada do catálogo é que precisa de correção.
- **v3:** o rótulo `média 41` saiu do anel tracejado e passou a viver fora do anel externo,
  empilhado sobre o `70` (esta linha substitui a anotação anterior, que o descrevia 8 unidades para
  dentro do anel). Os dois leem limpos e não colidem, mas agora nenhum dos dois encosta no anel que
  nomeia: a ligação entre `média 41` e o tracejado passou a depender só do valor.
- **v4:** os rótulos de escala usam `formatCurrency` com centavo; a NUM-1 reserva o centavo para
  tabela de detalhe e pede `formatCurrencyAxis` em tique.
- **v4:** a frase acessível diz "+R$ 4,25 acima da média", repetindo o sinal e a palavra.
- **v4:** o rótulo `média R$ 38,70` flutua no buraco central, a 80 unidades do anel de zero que ele
  nomeia, e a anotação da semana 28 também nasce longe da própria haste; as duas se leem porque o
  texto diz o nome, não porque encostam na marca.
- **v1 e v3:** os números da escala (`50` a `200`, `70`) saem sem o substantivo; a NUM-6 pede a
  unidade em todo lugar em que o número aparece, inclusive no tique.
- **v1 e v2:** o `data.ts` mede um dia (`2026-08-01`) e o caso de uso do catálogo fala das 1.842
  entradas do mês de 2026-08; o total confere, o recorte de tempo não.
- **Ferramenta:** a guarda `COLISAO-TEXTO` do `npm run check` não mediu nenhuma das quatro versões
  (motivo `preview_com_escala`, porque o SVG tem `viewBox` que escala), então a distância entre
  textos foi conferida a olho nos PNGs dos dois temas; nos quatro casos os pares mais próximos
  ficam acima de 5 px.
