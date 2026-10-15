# Tabela com barras e marcas inline

## O que é

Uma tabela HTML comum em que uma ou mais colunas numéricas ganham uma marca gráfica dentro da
própria célula: barra proporcional ao valor, bullet com faixa e meta, barra divergente a partir
do zero, composição 100% em segmentos ou ponto com intervalo. A marca mostra o padrão da coluna
inteira de relance; o número ao lado, fora da marca e em algarismo tabular, responde o valor
exato. Ordenar por uma coluna e olhar se as marcas das outras colunas também "descem" revela
correlação sem gráfico de dispersão, que é o espírito do TableLens.

## Quando usar

* Comparar magnitude entre 8 e 40 linhas sem perder o número exato de cada uma.
* Várias métricas com unidades diferentes por entidade, cada coluna com a própria escala
  declarada no cabeçalho.
* Valor contra meta ou teto por linha, com a meta normalizada em % quando cada linha tem a sua.
* Variação com sinal ou desvio contra referência, com a cor vinda da polaridade da métrica.
* Mix de até 5 categorias por linha na mesma ordem em todas as linhas, com o n escrito.

## Quando evitar

* Uma métrica e 3 a 6 linhas: a barra horizontal simples lê mais rápido (família 02).
* Coluna só com positivos desenhada como divergente: o zero encosta à esquerda e vira barra
  simples, sem motivo para o desenho divergente.
* Mais de 5 categorias na composição, ou linha com n pequeno sem aviso: agrupe em "outros" ou
  mostre a fração ao lado.
* A pergunta é a trajetória de cada linha, não o valor num ponto: use a série por linha (14/03).
* Barra, eixo e rótulo soltos, fora de qualquer tabela: é microvisual (família 24) ou barra da
  família 02.

## Anatomia

1. **Cabeçalho da coluna**, com a unidade ou o domínio calculado sobre o recorte inteiro
   (`0 a 612 leads`, `± R$ 89,0 mil`) e, quando a linha é ordenável, um ícone de sentido
   (`ArrowDown` de `lucide-react`) com `aria-sort` no `<th>`.
2. **Coluna de rótulo**, texto à esquerda, nunca cortado por reticência (TIP-7).
3. **Trilho neutro**, `bg-surface-sunken` (no bullet em SVG puro, `fill="var(--surface-sunken)"`
   nas faixas), altura fixa por marca (12 a 14 px nas barras e no bullet, ESP-2).
   `bg-surface-overlay` está fora: no tema claro ele é o mesmo branco do cartão e o trilho não
   existe na tela (`TOK-1`).
4. **A marca de dado**, uma por coluna: barra simples (`bg-chart-1`), bullet em SVG puro com
   faixas qualitativas e traço de meta tracejado, barra divergente (`bg-positive`/`bg-negative`
   a partir de uma linha de zero em `--line-strong`) ou composição 100% em `flex` com as quatro
   primeiras cores da ordem de slot (`--chart-1`, `--chart-3`, `--chart-6`, `--chart-5`, COR-8).
5. **Número fora da marca**, alinhado à direita, `font-display tabular-nums`, sempre por
   `formatCurrencyCompact`, `formatCurrency`, `formatInt` ou `formatPercent` conforme a coluna.
6. **Marcador de referência**, opcional: traço tracejado `--text-muted` para média ou meta no
   trilho de todas as linhas, ou o zero sólido em `--line-strong` na barra divergente e no ponto
   e intervalo.
7. **Estados especiais da célula**: indisponível substitui a marca inteira por `Unplug` mais
   `formatUnavailable()` (nunca vira zero); zero medido desenha uma marca vazada na origem da
   escala e escreve 0; outlier truncado para no teto declarado e ganha uma marca de corte, com o
   valor real escrito ao lado; amostra de um único negócio (`n = 1`) mostra só o ponto, sem
   intervalo, com o rótulo "n=1".
8. **Rodapé**, contagem de linhas em `--text-muted`, `aria-hidden` porque a frase acessível da
   raiz já diz o total.

## Versões

* [`v1_receita-por-executivo`](./v1_receita-por-executivo/) ([preview](./v1_receita-por-executivo/preview.svg)):
  barra simples com a receita reconhecida de 12 executivos, domínio calculado uma vez por
  `useMemo` e traço tracejado da média do time comum ao trilho de todas as linhas, em `--text-primary` com anel de 1 px em `--surface-raised`, que o mantém legível sobre a barra.
* [`v2_agendas-contra-meta-em-bullet`](./v2_agendas-contra-meta-em-bullet/) ([preview](./v2_agendas-contra-meta-em-bullet/preview.svg)):
  bullet inline em SVG puro com as agendas da semana de 10 SDRs contra a meta comum, faixas de
  0 a 70%, 70 a 100% e acima de 100%, ícone e cor só na linha mais crítica, e marca de estouro
  para quem passa de 150% da meta.
* [`v3_resultado-por-origem-com-desvio-e-mix`](./v3_resultado-por-origem-com-desvio-e-mix/) ([preview](./v3_resultado-por-origem-com-desvio-e-mix/preview.svg)):
  três marcas na mesma linha por origem de lead, volume em barra simples, saldo em barra
  divergente com zero e domínio simétrico calculados por coluna, e mix de status em composição
  100% com legenda única no cabeçalho e rótulo percentual em todo segmento onde o número cabe (ROT-10, não o limiar de 12% do catálogo); volume em `--text-muted`, `--chart-1` só em Novo; canvas 960 por 440 declarado no `meta.json`.
* [`v4_ausente-zero-outlier-e-faixa`](./v4_ausente-zero-outlier-e-faixa/) ([preview](./v4_ausente-zero-outlier-e-faixa/preview.svg)):
  os quatro casos difíceis lado a lado, CPL indisponível diferente de CPL zero medido, volume de
  uma origem 11 vezes maior que as demais truncado com marca de corte, e margem em ponto e
  intervalo cruzando o zero, com a linha de amostra única mostrando só o ponto.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida; a marca de cada coluna já é a peça de
   produção, sem `VisualCard`, `ChartFrame` nem `DataTable.tsx` por baixo.
2. Troque `data` pela lista real na página que consome o componente; o domínio de cada coluna é
   recalculado sozinho a cada render, porque vem de `useMemo` sobre o array recebido, nunca de um
   valor fixo.
3. Se a tabela real tiver mais linhas que o dado de exemplo, confira o rodapé de contagem: este
   modelo não pagina nem corta sozinho (ao contrário do `DataTable.tsx` do kit, que pagina com
   `maxRows`); acima de umas 40 linhas, prefira embrulhar com esse componente ou adicionar
   paginação na página de destino.
4. Mantenha o container pai com `overflow-x-auto` quando a tabela puder ficar mais larga que a
   coluna do dashboard: nenhuma versão deste modelo rola sozinha na horizontal.
5. Dado vazio, indisponível e o caso `n = 1` já têm tratamento embutido; não é preciso embrulhar
   com `EmptyState` nem `UnavailableState` do Farol para esses três casos específicos.

## Referências

* [Ramana Rao, TableLens (acervo Perceptual Edge)](https://www.perceptualedge.com/articles/b-eye/tablelens.pdf): ordenação como operador de correlação e foco com contexto, a base do modelo.
* [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): barras embutidas, alinhamento de números e ordenação estratégica.
* [Datawrapper Academy, barras e linhas em tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): trilho cinza, cor separada para negativos e a escolha entre escala individual e compartilhada.
* [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table): largura fixa de coluna para micrográfico, base do bullet inline.
* [Datawrapper, nova ferramenta de tabelas](https://www.datawrapper.de/blog/new-table-tool-barcharts-fixed-rows-responsive-2): estilo por categoria em células, base da composição 100% inline.
* [Perceptual Edge, biblioteca de artigos de Few](https://www.perceptualedge.com/library.php): onde mora a especificação original do bullet graph.
* [Stephen Few, escala de sparklines em dashboards](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf): faixa de referência comum às linhas, base do ponto e intervalo.
* [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): categorias Deviation e Part-to-whole, base da barra divergente e da composição.
* [Behance, Data Table Web Desktop](https://www.behance.net/gallery/246319147/Data-Table-Web-Desktop): densidade de linha e hierarquia de colunas numa tabela SaaS (página abriu só com metadados em texto).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19, sobre os PNGs de conferência dos dois temas. Revista na mesma data por
leitura independente, que mediu de novo a espessura do bullet do `v2` e acrescentou os itens do
fim da lista. Nenhum item desta seção reprova versão._

* `v1_receita-por-executivo`: o trilho em `bg-surface-overlay` sumia no tema claro, onde o token
  vale `#ffffff`, o mesmo branco do cartão, e mede 1,09:1 contra o cartão no escuro. A leitura
  não se perdia, porque as barras dividem o domínio e a média aparece tracejada, mas o item 3 da
  Anatomia deste README e a linha do catálogo que pedia "trilho em surface-overlay" apontavam para
  um token que a ANO-4 já proibia em faixa pelo mesmo motivo. A correção começou pelo catálogo, como
  a observação pedia: em 2026-09-29 a tabela 17.2 do `CONTRATO.md` passou a proibir o token como
  trilho, moldura e faixa, os trilhos foram para `bg-surface-sunken` e o item 3 foi reescrito.
* `v1_receita-por-executivo`: a coluna de valor tem largura fixa de 92 px e hoje o maior rótulo
  é `R$ 998,2 mil`; um recorte com valor de mais dígitos precisa revisitar a constante.
* `v2_agendas-contra-meta-em-bullet`: a régua do cabeçalho mistura unidades, com `0` e `meta 18`
  em agendas e `150%` em percentual da meta, o que a NUM-6 pede que seja explícito em todo
  número da régua.
* `v2_agendas-contra-meta-em-bullet`: os nomes do `data.ts` são completos (`Vitor Hugo
  Nascimento`), enquanto a seção 3 do contrato pede nome inventado com inicial de sobrenome
  (`Talita V.`), justamente para nenhum nome fictício coincidir com pessoa real.
* `v2_agendas-contra-meta-em-bullet`: a marca do bullet mede 12 px efetivos, e não os 6 px que a
  primeira leitura registrou. A medição no PNG escuro, de 2x, deu 24 pixels de altura de marca,
  isto é, os 12 px de `BAND_HEIGHT`, que são exatamente o piso de cartão da ESP-2, sem folga
  nenhuma para um recorte que precise de rótulo dentro da marca. A guarda `ESPESSURA-MARCA` não
  cobre esta versão, que sai como `marca_html` no `npm run check`, então o número vem de medida
  manual.
* `v2_agendas-contra-meta-em-bullet`: o ícone e o peso entram só abaixo de 70% da meta, e não em
  toda linha abaixo da meta, como diz a terceira linha do catálogo. A escolha está declarada em
  `notes` e se sustenta no teto de dois elementos em peso 700 da TIP-3.
* `v3_resultado-por-origem-com-desvio-e-mix`: o rótulo percentual dentro do mix usa
  `--accent-cyan-contrast` sobre as quatro categóricas, e não só sobre `--chart-1` como a ROT-6
  nomeia. A medição aprova o uso estendido: de 6,26:1 a 10,06:1 no escuro e de 5,39:1 a 6,25:1
  no claro, todos acima do piso de 4,5:1.
* `v3_resultado-por-origem-com-desvio-e-mix`: a legenda do mix fica acima da tabela, enquanto o
  `meta.json` e o catálogo a descrevem como "legenda única no cabeçalho".
* `v3_resultado-por-origem-com-desvio-e-mix`: a barra divergente usa `rounded-full`, então a
  ponta que nasce no zero também sai arredondada e afasta a marca da linha de zero em valores
  pequenos.
* `v3` e `v4`: os trilhos repetiam o `bg-surface-overlay` do `v1` e sumiam no tema claro pelo
  mesmo motivo. Nas duas o domínio da coluna está escrito no cabeçalho, então o que se perdia era
  o contorno da escala, não o número. Corrigidos junto com o da `v1` em 2026-09-29.
* `v4_ausente-zero-outlier-e-faixa`: a marca de corte do outlier aparece no render de página
  (`.qa/...pagina.png`) e some no `preview.svg` e no PNG que dele sai. O `<svg>` do corte está
  no arquivo, mas o serializador do render perde a posição absoluta e o traço cai fora da barra,
  sobre o cartão, onde `--surface-raised` fica invisível. É defeito da ferramenta compartilhada,
  registrado aqui sem contorno na pasta da versão; o mesmo aparece na imagem de diferença.
* `v4_ausente-zero-outlier-e-faixa`: o zero medido desenha um círculo vazado, forma que a 17.2
  reserva para ausência. O par fica legível porque o `R$ 0,00` está escrito ao lado e a linha
  indisponível usa `Unplug` mais `formatUnavailable()`, mas a forma é a mesma família visual.
* `v4_ausente-zero-outlier-e-faixa`: o caso de uso fala em volume 11 vezes maior; contra a
  segunda maior origem, que é a que define o teto de 704 leads, a razão medida é de 6,2 vezes.
* `v2_agendas-contra-meta-em-bullet`: as três faixas qualitativas existem no desenho, mas quase
  não se distinguem: no escuro os tons medidos são 13,20,35 depois 10,17,29 e 7,12,22; no claro,
  245,248,251 depois 239,243,249 e 234,239,247. Quem lê a coluna enxerga um trilho só, e o que
  separa abaixo e acima da meta acaba sendo o traço tracejado e o percentual escrito ao lado.
* `v2_agendas-contra-meta-em-bullet`: a frase acessível afirma que o último colocado fica abaixo
  de 70% da meta. Isso é verdade no dado fixo, não no cálculo: num recorte em que todo mundo bate
  a meta, a frase continua dizendo o mesmo. A conclusão da ACE-1 precisa sair de comparação, não
  de posição na lista ordenada.
* `v2_agendas-contra-meta-em-bullet`: com 10 linhas no canvas `alto`, cerca de um quinto da
  altura sobra vazia abaixo da última linha, dentro da moldura da tabela.
* `v4_ausente-zero-outlier-e-faixa`: a coluna de CPL escreve centavo (`R$ 38,00`), enquanto a
  NUM-1 reserva o centavo à tabela de detalhe. Aqui é tabela, então a escolha é defensável, mas o
  centavo é sempre zero no dado fixo e ocupa dois dígitos da coluna.

_Revisão de 2026-10-14, sobre o código e os PNGs de hoje das versões `v1`, `v3` e `v4`, com a `v1`
e a `v3` reprovadas (parecer em `validation/revisao_14_tabelas-visuais__01_tabela-com-barras-inline_2026-10-14.md`).
Os itens abaixo não reprovam e ficam para quem tocar o arquivo._

* `v1`, `v3` e `v4`: os números do cabeçalho e do rodapé (`média R$ 750,7 mil`, `0 a 612 leads`,
  `± R$ 89,0 mil`, `R$ 0 a R$ 124`, `704 leads`, `−14% a +14%`, `(n=1)` e a contagem de linhas)
  saem em Manrope sem `tabular-nums` (TIP-1). São números soltos, sem coluna a alinhar, então não há
  consequência visível.
* `v1_receita-por-executivo`: o primeiro item de `demonstrates` no `meta.json`, e a linha do
  catálogo, ainda dizem "trilho em surface-overlay", enquanto o código usa, com razão,
  `bg-surface-sunken`. A descrição contradiz a peça e o token que a tabela de estrutura proíbe.
* `v1_receita-por-executivo`: os dois primeiros escrevem `R$ 1,3 mi` e `R$ 1,1 mi`, dois algarismos
  significativos, enquanto os demais escrevem quatro (`R$ 998,2 mil`), e o caso de uso promete o
  valor exato de cada um. É o `formatCurrencyCompact` que a NUM-1 manda, por isso não reprova.
* `v3_resultado-por-origem-com-desvio-e-mix`: os trilhos de volume e de saldo medem 56 px cada,
  enquanto a coluna Origem sobra uns 100 px. O saldo de ± R$ 89,0 mil cabe em 28 px por lado:
  `−R$ 3,2 mil` vira 1 px, e as duas maiores perdas, com 12 a 13 px de largura contra 14 de altura
  em `rounded-full`, leem como ponto e não como barra.
* `v3_resultado-por-origem-com-desvio-e-mix`: as setas `ArrowUpRight` e `ArrowDownRight` do saldo
  sugerem tendência, e o saldo é sinal de resultado, não variação contra uma base.
* `v3_resultado-por-origem-com-desvio-e-mix`: a frase acessível escreve `R$ 89,0 mil de saldo` e o
  corpo `+R$ 89,0 mil`, o mesmo número com e sem sinal (DAD-5).
* `v4_ausente-zero-outlier-e-faixa`: o período, agosto de 2026, só existe na frase acessível
  (DAD-9). O caso de uso da `v3` diz "em 2026-08"; o da `v4` não diz, e nem o corpo.
* `v4_ausente-zero-outlier-e-faixa`: a margem escreve o n só na linha de `n=1`; as outras, de 8 a 54
  negócios, saem sem a base (DAD-1), e `Evento presencial`, com 8, não ganha aviso. O cabeçalho
  também não diz se o ponto é média ou mediana nem o que a faixa cobre (NUM-5).
* `v4_ausente-zero-outlier-e-faixa`: a frase acessível cita três dos quatro casos difíceis e deixa
  de fora o zero medido de `Busca orgânica`, que o caso de uso nomeia.
* `v4_ausente-zero-outlier-e-faixa`: conferido de novo em 2026-10-14, a marca de corte do outlier
  continua visível nos dois temas no render de página e ausente no `preview.svg` e no PNG; a
  moldura da tabela também aparece no render de página e some no preview. Defeito do serializador,
  não da versão.

_Segunda revisão de 2026-10-14, depois da rodada de correção, sobre o código e os PNGs de hoje da
`v1` e da `v3`, as duas aprovadas. Os itens abaixo não reprovam._

* `v1_receita-por-executivo`: o anel de 1 px em `--surface-raised` em volta do traço da média também
  cobre 1 px da barra de cada lado. Na linha 6 (`R$ 803,4 mil` contra a média de `R$ 750,7 mil`) a
  ponta passa uns 5 px do traço e só uns 4 px de barra aparecem depois do anel; num recorte em que
  um valor caia a 2 px da média, a ponta some sob o anel. O valor escrito ao lado segura a leitura.
* `v1_receita-por-executivo`: o `demonstrates` do `meta.json` continua dizendo "trilho em
  surface-overlay"; a rodada de correção não tocou o arquivo.
* `v3_resultado-por-origem-com-desvio-e-mix`: o teste de caber do rótulo do mix usa
  `MIX_WIDTH_ESTIMATE = 320`, e não a largura medida. No preview a coluna mede uns 319 px e o `8%`
  cabe com folga de 2 a 3 px; num cartão mais estreito o segmento rotulado, que é item flex com
  `min-width: auto`, alarga além da própria participação ou o número transborda. Ao colar no Farol,
  medir a coluna (ResizeObserver) ou dar `min-w-0` com `overflow-hidden` ao segmento.
* `v3_resultado-por-origem-com-desvio-e-mix`: com o canvas de 440 px, a moldura da tabela, que
  estica com `flex-1`, deixa uns 28 px vazios abaixo da última linha.
