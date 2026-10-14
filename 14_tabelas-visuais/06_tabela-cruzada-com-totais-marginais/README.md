# Tabela cruzada com totais marginais

## O que é

Uma matriz de duas dimensões categóricas (executivo por etapa, origem por mês) em CSS grid,
com o total de cada linha na margem direita, o total de cada coluna na margem de baixo e o
total geral na célula de canto. O miolo pode ficar só em número ou receber cor por uma escala
sequencial, como um heatmap; as margens nunca entram nessa escala, porque somam o que o miolo
mede e por isso vivem numa grandeza maior. Lê-se em duas direções ao mesmo tempo: por linha
(o perfil de um executivo ou de uma origem através das colunas) e por coluna (o que uma etapa
ou um mês concentra através das linhas). Uma célula sem número nunca é lida como zero: o
modelo distingue três respostas diferentes para "o que essa célula mede", e nenhuma delas
divide cor ou glifo com outra: **zero medido** é uma contagem real, coletada, que por acaso
deu zero; **vazio** é uma combinação que existiria em tese mas não tem captação (a origem
nasceu depois daquele mês); **não se aplica** é uma combinação estruturalmente impossível ou
fora de escopo (o papel do executivo não cobre aquela etapa, um piloto só rodou numa janela
fixa de meses).

## Quando usar

* Duas dimensões categóricas com até cerca de 12 por 12 células e totais que importam tanto
  quanto o cruzamento.
* Ler ao mesmo tempo o peso de cada linha e de cada coluna e onde elas se cruzam.
* Perguntas de percentual por linha ou por coluna em que o denominador precisa ficar
  explícito, nunca implícito no olho de quem lê.
* Contagem de oportunidades, leads ou perdas por pessoa e etapa, por origem e mês.

## Quando evitar

* Mais de 15 por 15 células sem número legível: nesse caso o padrão vira mapa de calor
  matricial puro, sem número em cada célula (família 15).
* Uma dimensão só: uma tabela com barra inline (`14/01`) ou uma barra da família 02 mostra o
  mesmo com menos peça.
* Hierarquia de grupo e subgrupo com subtotal: isso é uma tabela agrupada (`14/07`), não uma
  tabela cruzada.
* Percentual sem dizer o denominador, ou total pintado com a mesma escala de cor do miolo: as
  duas leituras se confundem e o total parece maior ou menor do que é.

## Anatomia

1. **Miolo numérico.** Uma célula por combinação de linha e coluna, com a contagem ou a soma
   medida, ou o percentual do modo de denominador ativo. Algarismo tabular sempre
   (`font-display tabular-nums`), formatado por `formatInt` ou `formatPercent`.
2. **Coluna de total (linha).** Soma da linha, em `kpi-number` sobre `bg-surface-sunken`,
   separada do miolo por espaço, nunca pela mesma escala de cor das células internas.
3. **Linha de total (coluna).** Soma de cada coluna, mesmo tratamento visual da coluna de
   total, alinhada por baixo do miolo.
4. **Célula de canto.** O total geral, no cruzamento da linha de total com a coluna de total;
   quando há modo de percentual, é também onde o rótulo do denominador ativo aparece.
5. **Seletor de percentual.** Prop ou controle com os modos "% do total", "% da linha" e
   "% da coluna"; o rótulo do denominador escrito no cabeçalho e repetido perto da célula de
   canto, nunca só implícito no título da versão.
6. **Célula vazia.** O mesmo desenho de indisponível da EST-2: ícone `Unplug` de
   `lucide-react` e `formatUnavailable()`, em `--text-muted`, sem preenchimento de fundo. A
   combinação não tem captação ainda; nunca a mesma marca da célula "não se aplica".
7. **Célula não se aplica.** Ícone `Ban` de `lucide-react` em `--text-muted`, sem preenchimento
   de fundo: a combinação é estruturalmente impossível ou fora do escopo medido. Nunca o ícone
   de indisponível nem a cor do degrau mais baixo do heatmap.
8. **Escala de cor sequencial (quando o miolo é heatmap).** Cinco degraus de `--seq-1` a
   `--seq-7` (pulando `--seq-4` e `--seq-5`, sem par de texto estável nos dois temas),
   calculados só sobre as células medidas e visíveis no modo ativo; zero medido pinta no
   degrau mais baixo, nunca fica sem cor.
9. **Barra marginal (quando a versão tem).** Trilho `bg-surface-sunken`, que se vê nos dois temas
   (`bg-surface-overlay` é o mesmo branco do cartão no claro, `TOK-1`), com a marca
   `bg-chart-1`, domínio próprio por direção (linha ou coluna), nunca o mesmo domínio do
   miolo.

## Versões

* [`v1_oportunidades-por-executivo-e-etapa`](./v1_oportunidades-por-executivo-e-etapa/)
  ([preview](./v1_oportunidades-por-executivo-e-etapa/preview.svg),
  [claro](./v1_oportunidades-por-executivo-e-etapa/preview-claro.svg)): totais simples nas
  margens; a célula sem caso vem do papel do executivo (SDR não fecha, executivo de contas
  não prospecta), com ícone e fora das somas.
* [`v2_heatmap-no-miolo-e-barras-nas-margens`](./v2_heatmap-no-miolo-e-barras-nas-margens/)
  ([preview](./v2_heatmap-no-miolo-e-barras-nas-margens/preview.svg),
  [claro](./v2_heatmap-no-miolo-e-barras-nas-margens/preview-claro.svg)): miolo em heatmap com
  escala só das células internas, barra horizontal no total de linha e vertical no total de
  coluna, cada uma com domínio próprio, e a etapa da semana destacada no cabeçalho.
* [`v3_leads-por-origem-e-mes-em-percentual-da-linha`](./v3_leads-por-origem-e-mes-em-percentual-da-linha/)
  ([preview](./v3_leads-por-origem-e-mes-em-percentual-da-linha/preview.svg),
  [claro](./v3_leads-por-origem-e-mes-em-percentual-da-linha/preview-claro.svg)): 10 origens
  por 12 meses, percentual da linha por padrão, soma 100 pelo maior resto mesmo quando uma
  origem sazonal concentra tudo num único mês.
* [`v4_denominador-e-celulas-vazias`](./v4_denominador-e-celulas-vazias/)
  ([preview](./v4_denominador-e-celulas-vazias/preview.svg),
  [claro](./v4_denominador-e-celulas-vazias/preview-claro.svg)): alternador entre os três
  denominadores, origem nova com vazio antes da criação e um piloto de janela fixa com não se
  aplica fora dela; as três respostas de uma célula sem número lado a lado, cada uma com o
  próprio glifo.

## Como colar no Farol

1. Modelo `html-tailwind` puro: nenhuma dependência de Recharts, só `<div>` em CSS grid
   (`grid-template-columns` com `subgrid` por linha), tokens e `lucide-react`. Copie
   `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. `grid-template-columns: subgrid` exige um navegador moderno (Chromium 117+); é o mesmo
   motor que roda o Farol e o `_render`, então não é uma dependência nova, só um recurso de
   CSS mais recente que `<table>`.
3. Ao ligar dado real, mantenha os três estados de uma célula sem caso como três valores
   distintos no tipo (`number | 'vazio' | 'na'`, ou equivalente), nunca colapsados em `null`
   único: a origem da distinção costuma ser o motivo de a query não trazer linha nenhuma
   (ainda não existia) contra o motivo de a regra de negócio nunca gerar aquele cruzamento.
4. O percentual por maior resto (`percentsForGroup` ou equivalente) recalcula a cada troca de
   modo; se a página já tiver um agregador de métricas com essa lógica, prefira reusar em vez
   de duplicar a função.
5. Confira a largura da coluna de rótulo contra o nome mais longo do recorte real: o
   catálogo testa com nome de origem de mais de 30 caracteres, mas a base de produção pode
   ter um mais longo ainda.
6. Embrulhe no `VisualCard` do destino; o Chart não desenha título nem moldura (seção 17,
   ANO-6, ESP-4). Versão com alternador de percentual mantém o controle dentro do próprio
   corpo do Chart, já que ele muda o que a tabela mostra, não é filtro de recorte de dado.

## Referências

* Praticante: [Stephen Few, análise multivariada com heatmaps](https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf):
  observar leitura por linha (perfil) e por coluna (variável) na mesma matriz, a base da
  leitura em duas direções desta tabela.
* Catálogo: [Vega-Lite, Table Heatmap](https://vega.github.io/vega-lite/examples/rect_heatmap.html)
  (o estudo de origem registra que este link não abriu na verificação): exemplo de tabela
  colorida por agregado em duas dimensões discretas, citado como referência de forma.
* Estudo de origem: [`_estudo/familias/14_tabelas-visuais.md`](../../_estudo/familias/14_tabelas-visuais.md),
  seção 13.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19._

* **v1:** as classes `border-t border-line-subtle` e `border-t border-line-strong` estão em
  elementos com `display: contents`, onde borda não pinta; nos dois PNGs não há nenhuma régua
  separando as linhas nem destacando a linha de total. A leitura se sustenta pelo fundo
  `surface-sunken` das margens, mas a regra escrita no código não é a regra que aparece.
* **v1:** o catálogo descreve a combinação sem registro como "traço neutro" e a versão entrega
  o ícone `Ban`. A distinção contra o zero fica clara pela nota de rodapé; é divergência de
  glifo, não de leitura.
* **v1:** a nota de rodapé que explica o ícone está em `aria-hidden`; a informação chega ao
  leitor de tela pelo `sr-only` de cada célula, repetida célula a célula.
* **v2:** a raiz é `<figure>` com `role="group"`. A seção 11 oferece `figure` justamente para
  composição com legenda, que é o caso aqui.
* **v2:** a barra vertical do total da coluna de valor 6 sai com cerca de 3 px; quem carrega a
  leitura é o número impresso acima dela.
* **v2:** a escala de cor começa no menor valor medido (1) e não no zero. A legenda declara o
  intervalo de 1 a 22, então a leitura não engana, mas o degrau mais baixo não é o zero.
* **v3, corrigido em 2026-09-19:** `data.ts` nomeava a origem `org-04` como "Anúncio Meta",
  marca de empresa real (checklist 23, contrato seção 3). Trocado por "Rede social paga", o
  nome genérico já usado no resto do catálogo para o mesmo canal.
* **v3, corrigido em 2026-09-19:** a nota de rodapé e a frase acessível diziam "soma 100 por
  linha" em qualquer valor de `percentMode`; com `col` ou `total` o texto descrevia um
  denominador diferente do que estava em uso. As duas frases agora citam `MODE_DENOMINATOR[percentMode]`,
  calculado do modo ativo.
* **v3, corrigido em 2026-09-19:** a coluna Total trazia contagem absoluta sob um cabeçalho de
  canto que dizia "% da linha", resolvido só pelo rodapé. O cabeçalho da coluna agora diz
  "Total (nº)", e o rodapé nomeia a coluna pelo mesmo texto.
* **v3, corrigido em 2026-09-19:** as linhas de dado não tinham `role="rowgroup"` envolvendo o
  grupo. Adicionado um `<div role="rowgroup" style={{ display: 'contents' }}>` em volta das
  linhas, sem mudar a grade visual.
* **v4, corrigido em 2026-09-19:** `data.ts` nomeava a origem `org-03` como "Anúncio Meta",
  marca de empresa real (checklist 23, contrato seção 3). Trocado por "Rede social paga".
* **v4, corrigido em 2026-09-19:** não havia legenda de rampa para a escala de cor do miolo,
  como a v2 tem. Adicionada ao `figcaption` do rodapé, com o mínimo e o máximo percentual
  visível no modo ativo (a escala se recalcula a cada troca de modo, então a legenda também).
* **v4, corrigido em 2026-09-19:** a linha "Denominador: ..." está em `aria-hidden` e a frase
  acessível só nomeava o modo ativo, sem a frase do denominador. A frase acessível agora inclui
  `MODE_DENOMINATOR[mode]`; a raiz também passou de `<div role="group">` para `<figure role="group">`
  com `<figcaption>`, no mesmo padrão da v2 (seção 11, composição com legenda).
* **v4, corrigido em 2026-09-19:** as linhas de dado não tinham `role="rowgroup"`, mesmo ajuste
  da v3, aplicado aqui por consistência de família.
* **v4, corrigido em 2026-09-19:** `NEW_ORIGIN_START_INDEX`, exportado no `data.ts` e não lido
  pelo `Chart.tsx`, foi removido; a distinção de quando a origem nasceu já vive inteira nas
  células `'vazio'` do próprio dado, sem precisar de um índice paralelo.
* **v4, mantido por decisão de escopo:** os totais de coluna continuam somando conjuntos
  diferentes de origens conforme o mês (Rádio Regional só existe a partir de jun/26, o piloto só
  roda de mai a jul/26); a linha de total não é uma série comparável mês a mês. Isto não é
  defeito desta versão, é o próprio caso que o modelo demonstra (seção "Quando evitar" do
  modelo 07, tabela agrupada, cobre hierarquia; aqui o objetivo é mostrar que o total de uma
  coluna com origem parcial não pode ser lido como se todas as linhas tivessem contribuído o
  ano inteiro). As células `'vazio'` e `'na'` já deixam a causa visível linha a linha; nenhuma
  mudança de código resolveria isso sem apagar o próprio ponto da versão.
* **README:** "Lê se em duas direções ao mesmo tempo" tinha o hífen de ênclise omitido; corrigido
  para "Lê-se". A regra proíbe hífen como separador de frase, não dentro da palavra.

_Segunda revisão independente, 2026-09-19. As quatro versões saíram aprovadas: `npm run check`
fecha com 0 erro e 0 aviso, os totais de linha e de coluna fecham nos dois sentidos em todas
elas, nenhum texto sai abaixo de 11 px e nenhum par de texto mede menos de 4,5:1 nos dois temas.
Os pontos abaixo são acabamento e redação, não mudam a leitura._

* **v1 e v3:** o `npm run render` mediu diferença acima de `LIMIT_OK` (0,5%) entre o
  `preview.svg` sozinho e a página, nos dois temas, e por isso gravou `.diff.png` em `.qa/`. Fica
  abaixo de `LIMIT_FAIL` (2%) e o `check` não acusa. Na v1 a divergência é o rodapé, que o SVG
  isolado posiciona alguns pixels à esquerda do que a página posiciona; na v3 é deriva de
  subpixel espalhada pelas 12 colunas de largura `1fr`. Em nenhum dos dois o conteúdo muda: os
  mesmos números, nos mesmos lugares, legíveis nos dois PNGs de conferência.
* **v1:** o catálogo pede "contagem por `formatInt` com o substantivo no cabeçalho", e o
  substantivo "oportunidades" só aparece no subtítulo do cartão, na nota de rodapé e na frase
  acessível; o cabeçalho traz "Executivo", as cinco etapas e "Total" (NUM-6). Quem cola no
  `VisualCard` recebe o substantivo pelo subtítulo, então a leitura não fica solta.
* **v2:** a legenda avisa que os totais ficam fora da escala de cor, mas não diz que a barra do
  total de linha e a do total de coluna têm domínios diferentes (37 e 49). As duas crescem do
  zero e cada número está escrito ao lado, então nenhuma engana sozinha; o que não se pode é
  comparar o comprimento de uma margem com o da outra.
* **v2 e v4:** a nota de Pendências diz que o texto sobre os cinco degraus mede de 12,7:1 a
  14,8:1 no claro e de 10,7:1 a 12,7:1 no escuro. A medição desta rodada sobre
  `app/src/styles/tokens.css` dá faixa mais larga: de 5,45:1 a 14,82:1 no claro (o piso é
  `--accent-cyan-contrast` sobre `--seq-6`) e de 6,33:1 a 12,69:1 no escuro (o piso é
  `--text-primary` sobre `--seq-3`). Todos os pares passam a ACE-3, então o veredito não muda;
  o que muda é o número registrado, que estava otimista.
* **v3 e v4:** os `role="columnheader"` do cabeçalho e, na v3, a linha de total, são filhos
  diretos do `role="table"`, sem um `role="row"` em volta, como a v1 tem. O `role="rowgroup"`
  acrescentado na rodada anterior cobre só as linhas de dado. A leitura não depende disso,
  porque a frase acessível da raiz já dá a conclusão, mas a família fica com dois desenhos de
  ARIA para a mesma tabela.
* **v4:** no modo "% da linha" a cor do miolo compara percentuais de denominadores de tamanhos
  muito diferentes: os 49% do Programa Piloto Referral saem de 3 meses medidos e os 12% da
  Indicação saem de 12, então a célula mais escura da tabela não é a de maior volume. A legenda
  diz "escala só do miolo em % da linha" e a coluna Total (nº) traz o volume ao lado, o que
  desfaz a confusão, mas o aviso é do leitor e não do desenho.
* **v3 e v4:** a frase acessível monta o total geral com `String(grandTotal)`, então sai "1397"
  e "1397" em vez do separador de milhar do `formatInt` (seção 8). Só a frase, nunca a tela; o
  leitor de tela lê o número por extenso de qualquer forma.
* **v4:** a frase acessível diz "antes da origem existir"; a forma culta é "antes de a origem
  existir". Redação, não leitura.

_Terceira revisão independente, 2026-10-02, só da v4, sobre o desenho que o render de 2026-10-01
produz (o preview antigo desenhava o `<button>` em Arial de 13,33 px; o código não mudou). A v4 segue
aprovada: nos dois PNGs o alternador sai em Manrope de 11 px e peso 500, o botão ativo mede 64 por
20 px com a tinta centrada, o grupo de 26 px fica centrado com a linha do denominador, termina na
mesma coluna de pixels da margem Total e deixa 10 px livres até o cabeçalho, sem corte nem colisão.
Preview e página diferem em 0,007% (escuro) e 0,013% (claro) dos pixels. Os pontos abaixo são
acabamento e nenhum nasceu da mudança do botão._

* **v4:** o botão do alternador tem 20 px de altura de alvo de clique; os pares de cor medem 10,06:1 e
  6,00:1 no ativo e 8,16:1 e 8,13:1 nos inativos (escuro e claro). Um `py-1` levaria o alvo a 24 px.
* **v4:** o cabeçalho "Total (nº)" quebra em duas linhas porque `TOTAL_COLUMN_WIDTH` é 46 px e as duas
  palavras medem 25,5 e 18 px de tinta, mais o espaço. Fica legível, alinhado à direita e sem corte. O
  total geral "1.397" ocupa 33 px dos 46: um total de seis algarismos pede coluna mais larga.
* **v4:** os cabeçalhos de mês ("jan/26") trazem algarismo em Manrope sem `tabular-nums` (TIP-1). Sem
  consequência no render, porque o texto é centrado e os dois algarismos se repetem nas 12 colunas.
* **v4:** as linhas da tabela são separadas por `border-t border-line-subtle` e o alternador tem caixa
  de contorno, contra a letra da ESP-5 (espaço separa, borda não). Não gera colisão nem corte.
* **v4:** a legenda da rampa fica abaixo da tabela, e a ROT-4 pede acima ou ao lado. Ocupa duas linhas
  e menos de 30% do corpo, com amostra na forma da célula e na ordem do menor para o maior.
* **v4:** o estado vazio escreve a frase em `role="status"` sem o ícone `Filter` de 16 px da EST-1.
* **v4:** `formatPercent((percent ?? 0) / 100, 0)` escreveria "0%" numa célula medida cujo grupo soma
  zero (conta sem denominador), e o `check` de hoje avisa AGREGACAO-ZERO na linha 116 (dívida
  conhecida, EST-1b). O dado padrão não cai em nenhum dos dois ramos; o `check` fecha com 0 erro e 2
  avisos, um da v2 e um da v4, e não mais com 0 aviso como dizia a rodada anterior.
* **v4:** os três degraus baixos da rampa medem 1,14, 1,58 e 2,29 contra o cartão no escuro e 1,21,
  1,49 e 1,92 no claro, e degraus vizinhos se separam por 1,23 a 1,52. A leitura mora no número escrito
  em cada célula (exceção da ACE-3, lacuna de paleta da TOK-8), com texto de 5,45:1 a 14,82:1. No modo
  "% da linha" o degrau mais baixo cobre de 0% a 6%, então ele não é exclusivo do zero medido.

## Pendências conhecidas

* Nenhuma dos apontamentos da rodada de correção de 2026-09-19 ficou sem resolução: os dois
  bloqueantes (marca real `Anúncio Meta` em `org-04` da v3 e `org-03` da v4) foram trocados por
  "Rede social paga", e as observações não bloqueantes de v3 e v4 foram todas corrigidas na
  causa (denominador dinâmico, `Total (nº)` sem ambiguidade, `role="rowgroup"`, legenda de
  rampa na v4, índice morto removido). O único ponto que segue como está, os totais de coluna
  da v4 somando conjuntos diferentes de origem mês a mês, é decisão de escopo e não defeito:
  é o próprio caso didático da versão, com a causa já visível célula a célula pelos ícones de
  vazio e não se aplica.
* `CONTRASTE-TEXTO` e `ESPESSURA-MARCA` não medem este modelo por ele inteiro sair como
  `foreignObject` no `preview.svg` (é `html-tailwind` puro, sem gráfico Recharts ou SVG).
  Conferido à mão nesta rodada: texto sobre os cinco degraus de `--seq-1` a `--seq-7` mede
  12,7:1 a 14,8:1 (claro) e 10,7:1 a 12,7:1 (escuro) nos pares usados pelas células de v2 e v4,
  e a espessura de linha e o espaçamento seguem o mesmo desenho já aprovado da v1 e da v2. Sem
  guarda automática, essa conferência precisa ser repetida manualmente se a paleta de tokens
  mudar.
