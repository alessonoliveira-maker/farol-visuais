# Barra radial

## O que é

Barras categóricas desenhadas como arcos concêntricos com origem angular comum: em vez do
comprimento de uma barra reta, o que carrega o valor é o comprimento angular do arco, do início
comum (sempre no topo) até a ponta de cada anel. Lê-se do anel de fora para dentro, comparando
quanto cada arco avançou antes de parar; o valor escrito ao lado do nome resolve o que o olho sozinho
não mede com precisão em coordenada polar. O modelo absorve a barra radial empilhada: a mesma
geometria, com cada arco dividido em até três segmentos de composição em vez de um valor só.

**Viés que o formato não resolve sozinho, só declara.** O mesmo ângulo desenha um traço maior
no anel externo (raio maior) do que no anel interno (raio menor): dois arcos de comprimento
visual parecido em raios diferentes podem representar valores bem diferentes, e o mesmo valor
muda de comprimento visual só por mudar de anel. Por isso nenhuma versão deste modelo ordena ou
compara categorias pelo comprimento do traço; a ordem vem declarada no componente (maior valor
no anel externo, sempre) e a comparação de verdade é pelo número escrito no início de cada arco,
nunca pelo olho medindo o arco.

## Quando usar

- Ranking curto de 3 a 7 categorias como peça de capa de um painel, quando o valor escrito em
  cada arco já entrega a leitura exata e o formato circular preenche melhor um espaço quadrado
  do que uma barra horizontal deixaria vazio.
- Composição em arco com 2 ou 3 segmentos por categoria (a variante empilhada), como status de
  um total por dia ou por etapa.
- Cartão em que a forma circular já é o tema da tela (ao lado de outras roscas da família) e a
  barra radial mantém a mesma linguagem visual sem virar gauge nem pizza.

## Quando evitar

- Comparação precisa entre valores próximos: o mesmo ângulo fica mais comprido no anel de fora
  mesmo com valor igual, o que distorce a leitura visual. Trocar por barra horizontal ordenada
  (`02_barras-horizontais`).
- Uma categoria muito maior que as demais, que reduz as outras a lascas quase ilegíveis (caso
  limite documentado na v4 deste modelo): barra horizontal (`02`).
- Mais de 3 segmentos empilhados por arco: a distorção de raio soma à falta de base comum entre
  segmentos do meio. Usar barra empilhada horizontal (`02` ou `03`).
- Cada categoria com uma meta própria: anéis de metas ou bullet chart
  (`13_progresso-meta-e-gauge`).

## Anatomia

1. **Arco com trilho.** Cada categoria é um `RadialBar` com `background` em
   `var(--surface-sunken)`, que desenha o trajeto inteiro (até 270 graus) atrás do valor, para
   o olho comparar o quanto falta e não achar que o arco cheio é 100%. O trilho só cumpre esse
   papel se aparecer nos dois temas, e por isso não usa `--surface-overlay`, que no tema claro é o
   mesmo branco do cartão (`TOK-1`); as quatro versões guardam o token na constante `TRACK_FILL`.
2. **Origem angular comum.** Todo arco começa no mesmo ponto, no topo (`startAngle={90}`), e
   avança em sentido horário até `endAngle={-180}`: 270 graus de teto, nunca 360, para nenhum
   anel parecer um total fechado. Cada anel tem seu próprio raio, então o mesmo ângulo desenha
   comprimentos visuais diferentes anel a anel (viés descrito acima em "O que é"); a ordem de
   quem entra em qual anel é sempre declarada por valor, nunca deixada ao acaso do array.
3. **Nome no início do arco.** Texto em `--text-secondary`, Manrope 500, alinhado à direita em
   `cx - LABEL_GAP_PX` e na linha do raio médio do anel: a linha do nome é horizontal e cada anel
   tem a sua, a um passo de anel da vizinha.
4. **Valor colado ao nome, no início do arco.** Texto em `--text-primary`, Space Grotesk 500
   (`font-display`, `formatInt`), com halo da ROT-7, numa `tspan` da mesma linha do nome. Não
   fica na ponta: o valor que pousa na ponta cai sobre o arco de um anel vizinho ou sobre a ponta
   dele quando as pontas se aglomeram perto de −180 graus (um ângulo de vão fixo em pixels vira
   44 graus no anel interno, e o sentido em que o arco continua muda a cada ângulo). No início a
   raia é horizontal, a ponta mais próxima do texto é a do próprio anel e nenhum valor chega a
   tinta alheia.
5. **Cor por papel, não por pessoa.** Série única: uma cor só (`--chart-1`), sem arco-íris por
   categoria (v1, v2, v4). Composição empilhada: até três categorias nos slots `--chart-1`,
   `--chart-3` e `--chart-6`, na ordem da COR-8, com separação por `stroke` em
   `var(--surface-raised)` (v3).
6. **`PolarAngleAxis` numérico.** `type="number" domain={[0, maior valor]}` sem tique nem linha
   de eixo: é o que traduz o valor em ângulo; sem domínio explícito um valor único enche o anel
   inteiro.
7. **`cornerRadius` só na ponta final.** Em série única, arredonda as duas pontas do arco; na
   variante empilhada, só o último segmento (o que fecha o total) recebe `cornerRadius`, nunca
   cada gomo, para os segmentos do meio não parecerem categorias soltas.

## Versões

- **[`v1_agendas-por-sdr-na-semana/`](./v1_agendas-por-sdr-na-semana/):** a forma básica, seis
  SDRs numa cor só, ordenados do maior para o menor anel, nome e valor no início do arco, sem
  legenda.
- **[`v2_sdr-em-foco-no-ranking/`](./v2_sdr-em-foco-no-ranking/):** a mesma base com uma pessoa
  em foco; a legenda ao lado troca o destaque por clique ou teclado, um segundo clique desmarca,
  e a linha de leitura calcula a posição em ordinal.
- **[`v3_entradas-da-semana-por-status-de-sla/`](./v3_entradas-da-semana-por-status-de-sla/):**
  a variante empilhada, três status de SLA por dia útil, com o dia escrito no início de cada
  arco, o feriado desenhando só o trilho e o rótulo "dia, sem expediente" em vez de um arco
  zerado.
- **[`v4_origem-zerada-e-origem-dominante/`](./v4_origem-zerada-e-origem-dominante/):** o caso
  limite do formato, com uma origem sem nenhum lead (`minPointSize` em 0, explícito) e outra
  quase 8 vezes maior que a segunda, que reduz as demais a lascas.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue o
   dado real pela prop `data`, no formato do `data.ts` da versão escolhida.
2. Como o corpo do cartão é retangular e o gráfico é redondo, dê ao contêiner pai uma altura que
   sobre espaço nos dois eixos (`h-64` ou mais); um contêiner muito baixo e muito largo encolhe
   o raio pela menor dimensão e desperdiça a largura.
3. Na variante com legenda clicável (v2), a prop `highlightId` decide o foco inicial; o estado
   do clique é interno ao componente e não precisa de fio de volta para a página, a menos que a
   seleção precise ecoar em outro cartão.
4. Antes de usar em produção, confira o número de categorias contra a razão entre a maior e a
   segunda maior: acima de uma proporção parecida com a da v4, a barra horizontal
   (`02_barras-horizontais`) lê melhor.

## Referências

- [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/): `background`, `barSize`, rótulo no início do arco e legenda à direita com `cx="30%"`.
- [Recharts, Radial Bar Chart with Click to Focus Legend](https://recharts.github.io/en-US/examples/RadialBarChartClickToFocusLegendExample/): contexto compartilhado entre legenda e setor e a transição de opacidade que inspirou o clique da v2.
- [Recharts, API do RadialBar](https://recharts.github.io/en-US/api/RadialBar/) e [API do PolarAngleAxis](https://recharts.github.io/en-US/api/PolarAngleAxis/): `background`, `cornerRadius`, `minPointSize`, `type` e `domain`.
- [Data Visualisation Catalogue, radial bar chart](https://datavizcatalogue.com/methods/radial_bar_chart.html): a distorção das barras externas que motiva escrever o valor em cada arco.
- [AG Charts, stacked radial bar](https://www.ag-grid.com/charts/gallery/stacked-radial-bar/): `innerRadiusRatio` pequeno e rótulos de eixo desligados, referência da variante empilhada da v3.
- [shadcn, chart-radial-stacked (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-stacked.tsx): `stackId` e `cornerRadius` em cada série, ponto de partida da v3.
- [Behance, Crowdinvesting Interest Rate](https://www.behance.net/gallery/75245591/Crowdinvesting-Interest-Rate): infográfico editorial com barra radial de taxas em dois anos, referência de acabamento.
- Estudo de origem: [`_estudo/familias/07_rosca-e-radial.md`](../../_estudo/familias/07_rosca-e-radial.md), seção 8 (Barra radial) e seção 9 (Barra radial empilhada).

## Observações da revisão (não bloqueantes)

- **v1:** a lista de nomes no topo depende do alinhamento por anel para casar nome e arco; com um
  nome bem longo ("Isabela do Nascimento N.") a coluna de texto fica bem mais larga que o resto
  do desenho.
- **v2:** os botões da legenda não declaram estilo de foco visível próprio, então o realce por
  teclado fica por conta do padrão do navegador.
- **v3:** a legenda de status está inteira em `aria-hidden` e a frase acessível não nomeia os três
  status, então quem usa leitor de tela fica sem a composição do arco.
- **v1, v3 e v4:** o trilho em `var(--surface-overlay)` sumia no tema claro, onde o token é o mesmo
  branco do cartão, e a leitura de "quanto falta para o teto de 270 graus", que a Anatomia promete,
  só existia de fato no tema escuro. Corrigido em 2026-09-29: as quatro versões trazem
  `--surface-sunken` em `TRACK_FILL`.
- **v2:** a raiz é `role="img"`, então a legenda clicável que troca o foco vive dentro de uma
  subárvore que o leitor de tela trata como imagem única; o recurso principal da versão fica sem
  alcance por teclado assistido.
- **v2:** os seis valores aparecem duas vezes, no início de cada arco e na coluna da legenda; é
  redundância deliberada para casar arco e nome, mas dobra o número impresso no mesmo cartão.
- **v3:** os anéis vão de Sexta por fora até Segunda por dentro, então a coluna de nomes lê a
  semana de trás para a frente de cima para baixo; combina com "maior valor no anel externo" dos
  outros casos, mas contraria a ordem natural do tempo.
- **v4:** a razão entre a origem dominante e a segunda entra na frase acessível por
  `ratio.toFixed(1)`, que fala "7.8" com ponto; `formatDecimal` daria a vírgula do pt-BR.

**2026-10-14, revisão independente das quatro versões** (as quatro foram reprovadas por posição
de rótulo; o parecer está em `validation/revisao_07_rosca-e-radial__04_barra-radial_2026-10-14.md`).
O que segue não reprova:

- **v1 a v4:** nenhuma declara `MARGIN` (ESP-3); nada encosta na borda nos dois PNGs.
- **v1 a v4:** o anel mede de 8 px (v3) a 11 px (v1), abaixo do piso geral de 12 px da ESP-2, que
  ainda é aviso; `barCategoryGap` de 16% a 24%.
- **v1, v3 e v4:** os valores nos arcos são contagens sem substantivo (NUM-6); a unidade só aparece
  no título do cartão. A v2 escreve "agendas" na linha de leitura.
- **v2:** o nome na legenda tem `truncate`, e a legenda é o único lugar que nomeia os arcos (TIP-7);
  no preview cabe com folga, mas o defeito fica latente.
- **v2:** o catálogo e o `meta.json` dizem "nome e valor do destaque em peso 700", e só o valor no
  arco sai em 700; o nome na legenda e na linha de leitura sai em 600.
- **v2 e v3:** a amostra da legenda é um ponto redondo e a marca é um arco (ROT-4, amostra na forma
  da marca).
- **v3:** a legenda fica abaixo do gráfico; a ROT-4 pede acima ou ao lado.
- **v3:** o `cornerRadius` do segmento pendente arredonda as duas pontas dele, então o pendente vira
  uma pílula solta; a Anatomia (item 7) promete arredondar só a ponta final.
- **v3:** a pergunta do caso de uso é fora do SLA ou pendente por dia, e só o total vai escrito; o
  olho compara segmentos em raios diferentes, o que "O que é" diz que o formato não sustenta.
- **v3:** "O que é" e a Anatomia dizem que o maior valor vai sempre no anel externo; a v3 ordena por
  dia, e Quinta (43) fica no segundo anel. A ordem do tempo é a certa aqui; o texto do modelo é que
  precisa da exceção.
- **v3:** a frase acessível conta "5 dias úteis" incluindo a segunda de feriado.

**2026-10-14, segunda revisão independente, depois da correção da posição dos valores** (as quatro
aprovadas). O que segue não reprova:

- **v1 a v4:** o valor saiu da ponta livre e foi para o início do arco, na raia do próprio anel.
  Contraria a letra da ROT-2 ("a ponta livre da marca, nunca o zero") e o catálogo ("valor escrito
  na ponta" no resumo do modelo e na v1; "total escrito na ponta de cada arco" na v3). Aceito porque
  cada número fica fora de qualquer marca, na linha do seu anel, sem ambiguidade nos dois temas. O
  `meta.json` da v3 já diz "no início"; o da v1, o da v2 e o da v4 não declaram o desvio em `notes`.
  Alinhar o catálogo, ou a ROT-2 para barra radial, é decisão do dono.
- **v1, v3 e v4:** nome e valor saem do mesmo `<text>` ancorado no fim, então a borda direita dos
  nomes anda com a largura do número; na v4, "Indicação" (342) termina cerca de 15 px antes de
  "Evento" (6). Dois textos, o valor ancorado em `cx − LABEL_GAP_PX` e o nome a uma largura fixa de
  número antes dele, alinham as duas colunas.
- **v1, v3 e v4:** a coluna de nomes cresce para a esquerda do centro e o gráfico não reserva largura
  para ela. Num corpo quadrado com a altura do preview (242 px), a v1 precisaria de 148 px à esquerda
  do centro e teria 121: o início de "Isabela do Nascimento N." passaria uns 28 px da borda (TIP-7).
  O "Como colar no Farol" avisa do contêiner baixo e largo, não do estreito.
- **v4:** com sete anéis o passo entre raias é de 14,6 px e sobram 4,7 px entre a tinta de dois
  valores; um corpo 5% mais baixo que o do preview já desce abaixo dos 4 px da ROT-9.
- **v1 a v4:** `barCategoryGap`, `innerRadius`, `outerRadius`, `cornerRadius` e o `dx={6}` entre nome
  e valor são literais no JSX, não constantes nomeadas no topo (seção 5).
- **v2:** os itens 3 e 4 da Anatomia descrevem nome e valor no mesmo `<text>`; na v2 o arco leva só o
  valor, e o nome mora na legenda.
- **v3:** com `pending` em 0 num dia aberto, nenhum segmento recebe `cornerRadius` e o arco fecha
  reto; o caso não está no dado fixo.
- **v4:** a frase acessível junta as origens zeradas com "não gerou" no singular, e com duas ou mais o
  verbo fica errado; fora do dado fixo.
- **Resolvidos desde a rodada anterior:** a razão da frase da v4 sai por `formatDecimal` ("7,8"), e o
  `demonstrates` da v1 já diz `surface-sunken`.
