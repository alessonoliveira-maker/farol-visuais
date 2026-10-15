# Histograma

## O que é

O eixo contínuo cortado em faixas de largura igual, com a altura da barra contando quantas
observações caíram em cada faixa. É o modelo de entrada da família 16 e a régua contra a qual os
outros são julgados: antes de propor violino, densidade ou ECDF para uma medida, vale desenhar o
histograma dela e ver se a pergunta já não estava respondida.

O modelo absorve três parentes próximos como versões suas: a estatística anotada por cima das
barras, que transforma o gráfico em argumento contra a média; os pequenos múltiplos, que trocam a
sobreposição de grupos por uma grade com régua comum; e o caso em que boa parte da amostra vale
exatamente zero, que é onde a forma e o estado do dado se confundem se o desenho deixar.

## Quando usar

- Ver a forma de uma medida contínua: ciclo em dias, ticket em reais, minutos até o primeiro
  contato, CPL por campanha.
- Mostrar que a média citada no cartão não é o caso típico, com média e mediana desenhadas por cima.
- Amostra a partir de umas 50 observações, com a largura do bin escrita no rótulo do eixo.
- De 4 a 20 grupos da mesma métrica, em pequenos múltiplos com bin e escala comuns.
- Medida com massa concentrada num valor só, em geral o zero, quando é preciso mostrar a forma do
  resto sem deixar o pico engolir a escala.

## Quando evitar

- Contagem por categoria nominal: barras da família 02 ou colunas da 03. Histograma exige eixo
  contínuo binado, e um eixo de nomes com barras encostadas é só uma barra mal desenhada.
- Menos de umas 30 observações: strip ou beeswarm (modelo 03) ou dot plot empilhado (09), que
  mostram cada caso em vez de esconder três deles dentro de uma barra.
- Pergunta de quantos ficam abaixo de um limiar: ECDF e histograma acumulado (04). Somar barras de
  cabeça é onde o leitor erra.
- Comparar a forma de dois ou três grupos na mesma régua: histograma comparativo (05) ou densidades
  sobrepostas (06).
- Barra ordenada por entidade com linha acumulada: Pareto na família 08, modelo 04.

## Anatomia

1. **Eixo X contínuo**, com a unidade e a largura do bin escritas no rodapé ("ciclo em dias, faixas
   de 7 dias"), e domínio fixo vindo da métrica. Na `v4` a régua deixa de ser contínua de ponta a
   ponta, porque ela ganha um átomo no zero e uma faixa aberta no fim, e é isso que faz o eixo dela
   ser numérico em **unidades de coluna** em vez de em reais.
2. **Eixo Y de contagem, com nome**: "oportunidades ganhas". É a legenda que mais falta em painel de
   produto, onde altura de barra é lida como dinheiro por padrão. Nas quatro versões ele fica acima
   do corpo, na horizontal, e nunca rotacionado na lateral.
3. **Barras encostadas**, sem vão entre elas, com `barCategoryGap={0}` e **uma série só**. Duas
   séries de `Bar` repartem a banda do bin entre si e o histograma vira gráfico de colunas, então
   tudo o que a peça precisa desenhar sai de dentro do `shape` da série única.
4. **Faixa vazia com marca de base**, de 2 px, e só **entre** a primeira e a última faixa com caso:
   antes da primeira e depois da última não há buraco, há borda de amostra.
5. **`n` escrito no rodapé**, junto dos registros que ficaram fora por ausência de dado.
6. **Tooltip por faixa**, no formato "42 a 49 dias, 22 oportunidades", montada à mão, e nunca o nome
   do campo. O componente de dica do Farol é fixo em um formatador por dica, e aqui são dois.
7. **Anotação na margem superior**, nunca dentro da área de plotagem (`v2` e `v4`). Rótulo de
   referência dentro da área colide com a primeira faixa alta que aparecer, e nas duas versões a
   faixa alta está exatamente onde a anotação cairia.
8. **Escala comum declarada** quando há painéis (`v3`): domínio de X e de Y calculado no pai e
   passado igual a todos, e eixo presente em todos com `tick={false}` onde o rótulo não aparece,
   nunca `hide`.

### Abordagem na stack

O catálogo declara o modelo inteiro como `recharts-custom` e o estudo declara por versão, e os dois
discordam na `v3`, que o estudo trata como `html-tailwind`. A peça faz as duas coisas, porque a
geometria pede as duas: a grade de painéis é `html-tailwind`, como o estudo manda, e o corpo de cada
célula é `recharts-custom`, porque o retângulo de contagem zero só sobrevive com `shape` declarado e
a régua da casa precisa ser série de linha para não repartir a banda do bin com a barra. A regra
geral da família vale aqui: a abordagem do modelo é guarda-chuva, a versão segue a geometria, e o
desvio se escreve.

## Versões

- **`v1_ciclo-de-fechamento`**: o caminho feliz. 312 oportunidades ganhas nos últimos 12 meses,
  ciclo em dias, bin de 7, domínio fixo de 0 a 210. A metade fecha em até 51 dias e a média sai em
  64, puxada pela cauda de negócios longos; 9 ganhas sem data de criação ficaram fora da amostra e
  contadas no rodapé. Média, mediana e faixa interquartil ficam de fora de propósito: aqui a
  pergunta é só a forma.
- **`v2_media-contra-mediana`**: o mesmo ciclo, com mediana sólida em `--chart-2`, média tracejada
  em `--text-muted` e a faixa de p25 a p75 atrás das barras, nomeada dentro do desenho. Os dois
  rótulos moram na margem de cima, com âncoras divergentes, e colapsam num bloco só quando as duas
  linhas ficam a menos de 48 px uma da outra. Com a amostra padrão, 296 ganhas, a mediana dá 51
  dias, a média 74 e a linha de leitura mede o quanto isso custa: a média fica acima de 66,6%
  (197 de 296) dos negócios.
- **`v3_ciclo-por-executivo-em-pequenos-multiplos`**: oito painéis numa grade de 4 por 2, bin de 7
  dias e escala comum calculada sobre o conjunto, ordenados por mediana crescente. Atrás das barras
  de cada painel vai a forma da casa reescalada para o volume daquele executivo, que é o segundo
  termo da comparação. A ordem dos painéis é declarada no rodapé, junto do domínio e da escala
  comum: sem isso o leitor vê "A, B, C, E" na primeira fileira e supõe ordem alfabética com erro de
  digitação, e não ordenação deliberada. O executivo com 3 negócios fechados não ganha histograma:
  ele troca as barras por um traço tracejado em cada caso, com a nota "um traço por caso", porque
  uma barra solitária num painel de 190 px é lida como pico.
- **`v4_receita-com-massa-no-zero`**: receita reconhecida por oportunidade, com 41,0% (89 de 217) em
  exatamente R$ 0. Ela existe para separar três estados que costumam ler igual: **zero medido**,
  coluna neutra em `--text-muted` fora da rampa, apartada das faixas por uma coluna vazia e uma
  divisória tracejada, com o próprio número escrito; **faixa medida sem nenhum caso**, traço de base
  de 2 px no mesmo neutro; e **ausência**, que não desenha nada e aparece só no rodapé, com o ícone
  de tomada desligada e `formatUnavailable()`. A coluna do zero é truncada, com tarja de escala
  interrompida e o número acima, e a última faixa é aberta em R$ 600 mil.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o dado padrão pelo que vem do seletor
   da página.
2. O `data` é **uma observação por oportunidade**, não os bins contados nem as estatísticas
   prontas. Quem bina e quem calcula mediana, média e quartil é o componente, e é isso que garante
   que a estatística escrita foi calculada sobre a amostra desenhada. Seletor que já devolve
   contagem por faixa tira essa garantia da página.
3. `binWidth` e `domainMax` vêm do registry da métrica, nunca do máximo observado. Régua que muda
   junto com o filtro faz o usuário comparar duas formas que nunca foram comparáveis. Na `v3` isso
   deixa de ser conveniência e vira obrigação: oito painéis com domínio próprio desenham oito réguas
   diferentes.
4. `withoutCycle` e `withoutRevenue` são obrigatórios quando existem: registro sem a medida não vira
   bin zero, sai da amostra e é contado no rodapé. Página que não sabe informar esse número deveria
   dizer isso, e não passar zero.
5. Na `v3`, `GRID_COLUMNS` assume 8 painéis em 4 por 2; com mais grupos, pagine ou agrupe antes de
   chegar ao componente, e confira que o número de linhas da grade acompanha (`grid-rows-2` é
   explícito de propósito, porque linha implícita do Tailwind é `auto` e colapsa dentro de um
   container `flex-1`).
6. Na `v4`, `openFrom` define onde a última faixa deixa de ter fim. Ele é decisão de produto, não de
   layout: mudá-lo muda quantos casos somem dentro da faixa aberta, e o rodapé precisa continuar
   dizendo quantos são e qual o maior deles.
7. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
8. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Pendências conhecidas

- ~~**A `v1` carrega uma instância do defeito de guarda de vazio, e o conserto está em lote
  separado.**~~ **Fechada na Correção de 2026-09-28, no fim deste arquivo.** A `v1` era a sexta
  instância catalogada de "a guarda de vazio testa a lista vizinha, e a mediana nasce zero"; agora
  ela tem a mesma forma das irmãs `v2`, `v3` e `v4`, isto é, toda agregação devolve `null` no vazio,
  a guarda testa a lista que alimenta a conta, e o caso vazio vira `formatUnavailable()` em vez de
  medida plantada no zero. Não há mais divergência entre as quatro versões neste ponto.
- **A marca da faixa vazia diverge entre a `v1` e as outras três.** A `v1` usa `--line-strong`, que
  mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão, abaixo do piso de 3:1 da marca; a `v2` e
  a `v4` usam `--text-muted`, medido acima de 5:1 nos dois temas. Quem for mexer na `v1` deve levar
  essa troca junto.
- **O aviso `ESPESSURA-MARCA` é esperado na `v1`, na `v2` e na `v3`, e não reprova, mas o que ele
  mede não é o que estava escrito aqui.** O guarda mede a **marca mais fina desenhada pelo `Bar`**,
  e nestas peças essa marca é o traço de base da faixa vazia, de 2 px na `v2` e de 6 px na `v3`,
  não a largura da barra: a redação anterior atribuía os "7 px" à barra em 30 faixas no canvas
  `card`, e não é isso que o número do aviso descreve. As duas coisas seguem valendo em separado:
  o traço de exceção é fino de propósito, e a barra, que num `card` de 30 faixas fica mesmo abaixo
  do piso de 12 px da ESP-2, é fina porque a marca é densidade e não barra de comparação. O que
  cede primeiro é o número de faixas, não a espessura: em canvas mais estreito a saída é bin de 14
  dias. A `v4`, com 14 colunas de 36 px e o traço de faixa vazia igualmente largo, não dispara o
  aviso.
- **A faixa interquartil da `v2` perde a borda esquerda atrás das barras altas.** Ela fica atrás do
  dado, que é onde deve ficar, e entre o p25 e a mediana as barras são altas o bastante para cobrir
  o começo dela; no tema escuro a borda some de vez. A correção é pelo rótulo e não pela geometria:
  o nome da faixa carrega o intervalo ("metade dos casos, 35 a 120 dias"), então a leitura deixa de
  depender de enxergar onde ela começa. Sem isso, o desenho sozinho sugere que a metade dos casos
  começa na mediana, que é a conclusão que a versão existe para desmontar.
- **A `v2` não demonstra o colapso de rótulos com a amostra padrão.** A distância entre a mediana e
  a média é de cerca de 58 px, logo acima do limite de 48 px, então os dois rótulos saem separados.
  O caminho do bloco único está implementado e aparece em cartão mais estreito ou em recorte que
  aproxime as duas estatísticas; quem revisar a `v2` no preview não vai vê-lo.
- **A `v3` não marca faixa vazia.** Trinta traços de 2 px em oito painéis de 65 px viram ruído, e
  dentro da grade não existe faixa não medida: o domínio é o da métrica e todos os executivos foram
  medidos nele, então vão em branco ali é zero medido. Se a peça for colada numa página em que o
  buraco de um executivo é o achado, o traço volta.
- **A régua da `v3` é fracionária.** Ela é a contagem da casa multiplicada pela fatia de volume do
  executivo, então ela não é uma contagem inteira e não deve ser lida como tal. Por isso ela não é
  escrita em lugar nenhum além da dica, onde vai arredondada, e o rodapé diz de onde ela sai.
- **A coluna truncada da `v4` é uma decisão de precisão, não um acabamento.** Ela afirma 89 num eixo
  que vai até 30, e isso só se sustenta porque o corte está desenhado, o número está escrito e o
  rodapé diz que o eixo foi dimensionado pelas faixas de valor. Quem mexer no desenho dela sem
  manter os três canais transforma a peça numa que mente.

## Referências

- Catálogo: [Observable Plot, bin transform](https://observablehq.com/plot/transforms/bin): observar `thresholds` com scott, freedman-diaconis e sturges, e o `cumulative: -1` para "ou mais".
- Catálogo: [Highcharts, histogram demo](https://www.highcharts.com/demo/ios/histogram): observar o histograma calculado a partir da série de origem, com o dado cru mostrado embaixo como dispersão.
- Catálogo: [Vega-Lite, histogram](https://vega.github.io/vega-lite/examples/histogram.html): observar o bin declarado no encoding e o eixo contínuo com limites do bin, base da anotação da `v2`.
- Praticante: [Datawrapper Academy, how to read a histogram](https://www.datawrapper.de/academy/histogram-min-max-median-mean): observar a regra do limite do bin e o exemplo em que média e mediana divergem muito.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar o argumento de que a largura do bin muda o que a forma diz, que em pequenos múltiplos precisa ser resolvido uma vez para todos os painéis.
- Portal de design: [SetProduct, distribution chart patterns](https://setproduct.com/charts/patterns/distribution): observar o tratamento de histograma em tema claro e escuro com legenda, eixo e anotação.
- Portal de design: [Behance, Advanced SaaS Analytics Dashboards & KPI UI/UX, Set 01](https://www.behance.net/gallery/93727935/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-Set-01): observar a densidade de cartões pequenos numa grade e o tamanho mínimo de rótulo que ainda se lê.

## Correção de 2026-09-28

**v1, a mediana e a média nasciam zero, e a guarda de vazio testava a lista vizinha.** `median`
devolvia `0` para lista vazia, a média vinha de `data.length === 0 ? 0 : ...`, e a única guarda do
caso vazio olhava `tallest`, que é derivado de `bins`; como `bins` nasce de `domainMax / binWidth`,
ele nunca é vazio, a guarda nunca disparava e a amostra vazia chegava à frase acessível como "a
metade fecha em até 0 dias e a média fica em 0 dias". Zero dia é um ciclo plausível, então o leitor
não tinha como distinguir medição de ausência.

O que mudou: `median` devolve `number | null`, a média virou a função `average` com o mesmo
contrato, e a guarda passou a testar `data`, que é a lista que alimenta as duas contas. Com a
amostra vazia a peça deixa de desenhar eixo e grade e mostra um bloco `role="status"` com o ícone
`Filter` (EST-1) dizendo "Nenhuma oportunidade ganha neste recorte: sem amostra não há distribuição
para desenhar, e a mediana fica indisponível em vez de zero.". Cada medida da frase acessível
escreve a própria ausência por `formatUnavailable()`, inclusive a faixa mais cheia.

**Conserto de caminho latente:** as 312 observações publicadas continuam iguais, as duas medidas
seguem calculadas e o desenho não mudou. O que se conserta é o ramo, não a foto. A pendência
registrada acima fica fechada, e a `v1` passa a ter a mesma forma das irmãs `v2`, `v3` e `v4`.

## Observações da revisão (não bloqueantes)

**Revisão de 2026-10-15, `v1_ciclo-de-fechamento`** (a versão foi reprovada por outro motivo, o tique
24 perdido no eixo Y; o parecer está em `validation/revisao_16_distribuicao__01_histograma_2026-10-15.md`).
Os itens abaixo não reprovam sozinhos, mas valem para a mesma rodada de correção:

- `v1`: a marca da faixa vazia segue em `--line-strong` (1,79:1 no escuro, 1,83:1 no claro), a pendência
  já registrada acima. Não reprova porque o buraco também se vê pelo vão e está escrito no rodapé, mas
  a troca para `--text-muted`, como na `v2` e na `v4`, cabe na mesma rodada.
- `v1`: o `meta.json` diz em `notes` que "a segunda série de Bar existe só para desenhar o traço de base",
  e o código usa uma série só com `shape`, como manda a REC-19. A nota ensina o padrão errado a quem copiar.
- `v1`: o exemplo de dica no `meta.json` e na Anatomia ("42 a 49 dias, 22 oportunidades") não bate com o
  dado: a faixa de 42 a 49 tem 19; a de 22 é a de 49 a 56.
- `v1`: valores acima de `domainMax` são descartados do bin em silêncio, mas continuam em `n`, na mediana
  e na média; em recorte com ciclo acima de 210 dias as barras deixam de somar o `n` do rodapé. Contar
  o excedente no rodapé, como a faixa aberta da `v4`.
- `v1`: a frase acessível fecha com "puxada pela cauda longa" fixo no código; deveria depender de média
  maior que mediana.
- `v1`: `hole` nomeia só a primeira faixa vazia interna; com dois buracos, o segundo ganha marca e não
  ganha texto.
- `v1`: com barras encostadas e sem contorno, faixas vizinhas de mesma altura se fundem; a de 133 a 147
  dias lê como uma barra só de 7, quando são 14 casos. Contorno de 1 px em `--surface-raised` mantém as
  barras encostadas e separa as faixas (COR-5).
- `v1`: eixos herdam o `axisLine` do `AXIS_PROPS` (EIX-5, fila do EIXO-CALMO); a linha vertical do Y
  aparece à esquerda do plano nos dois temas.
- `v1`: o rótulo "210" do eixo X sai 4,1 px à esquerda da posição dele (561,9 contra 566), porque
  `MARGIN.right` de 8 px é menor que meia largura do rótulo; sem grade vertical, não se percebe.
- `v1`: tiques do X a cada 30 dias não caem em borda de faixa de 7; a cada 35 dias (0, 35, ..., 210)
  cairiam, e fechariam no fim do domínio.
- `v1`: tiques dos eixos sem `font-display` (TIP-1), `YAxis width={28}` e `tickCount={8}` sem constante
  nomeada, e a dica sem `isAnimationActive={false}` (DIC-4).

**Revisão de 2026-10-15, segunda rodada, `v1_ciclo-de-fechamento`** (aprovada: o eixo Y agora imprime
0, 8, 16, 24 e 32, e cada rótulo cai na própria linha de grade nos dois temas). A correção levou só o
bloqueante; as observações da primeira rodada, logo acima, seguem abertas. Novas:

- `v1`: só o teto do eixo Y sai do dado; o passo é a constante `Y_STEP = 8`. Com o `binWidth` de 14
  que o `data.ts` anuncia como uso legítimo, a faixa mais cheia vai a 54 e o eixo sai com 8 linhas (0
  a 56) num plano de 108 px, fora das 3 a 5 da EIX-4; com até 8 casos cai para 2 linhas; e, como o
  `interval={0}` impede o descarte, acima de uns 96 casos na faixa mais cheia os rótulos de 11 px se
  tocam. A escada `Y_STEPS` da `v2`, da `v3` e da `v4` resolve, e daria 0 a 40 em passo 10 com o dado
  de hoje; a régua da família hoje diverge das três irmãs neste ponto.
- `v1`: o texto do estado vazio diz que "a mediana fica indisponível em vez de zero", mas a peça
  nunca mostra mediana; basta dizer que o recorte não tem amostra para desenhar a distribuição.
- `v1`: o `useCase` do `meta.json` diz "no ano", e o `data.ts` e este README dizem "nos últimos 12
  meses"; ano civil e janela móvel são recortes diferentes.
