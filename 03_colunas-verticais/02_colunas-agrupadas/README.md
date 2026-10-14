# Colunas agrupadas

## O que é

Duas ou três colunas lado a lado dentro de cada período, uma por série, sobre um eixo numérico
único. A banda de cada período reserva espaço igual para cada série, com um vão curto dentro do
grupo e um vão largo entre um período e o próximo, e todas as colunas nascem do zero. A forma
compara estados ou momentos da mesma medida: marcado contra realizado, ano corrente contra
anterior, plataforma contra plataforma. A leitura degrada rápido acima de três séries por
período.

## Quando usar

* Duas ou três séries da mesma grandeza por período, em até 12 períodos.
* A comparação entre as partes de cada período importa mais que o total do período.
* Ano corrente contra ano anterior, com o ano antigo em neutro e o atual em destaque.
* Séries que começam ou param no meio da janela, desde que a ausência fique dita em palavras.

## Quando evitar

* Mais de três séries por período: usar small multiples (modelo 08) ou linhas (família 04).
* Séries de ordem de grandeza diferente, como leads e vendas: painéis alinhados (08/03), nunca
  eixo duplo.
* O total do período é a pergunta principal: colunas empilhadas com total (modelo 03).
* Uma série é a referência da outra, como meta e realizado: colunas contra meta (modelo 06), que
  deixa o papel de cada série explícito.
* Diferença entre as séries é a mensagem: painel de variação (08/06).

## Anatomia

1. **Banda por período.** Uma categoria no eixo X para cada mês ou período, com `barCategoryGap`
   entre 30% e 40% (ESP-2) separando uma banda da vizinha.
2. **Uma coluna por série dentro da banda,** cor fixa por série (token `--chart-N` na ordem de
   slots 1, 3, 6, 5, 2, 4 da COR-8), sem `stackId`.
3. **Vão dentro do grupo,** pelo `barGap` do Recharts (padrão de 4 px da biblioteca), sempre
   declarado em constante nomeada quando há mais de uma série na banda (ESP-6).
4. **Espessura derivada do passo,** nunca arbitrada: `maxBarSize` sai da fórmula da ESP-6, que
   desconta `barCategoryGap` dos dois lados da banda e o `barGap` entre as séries, e é conferida
   no `preview.svg`, não só na constante declarada.
5. **Eixo numérico único,** com grade só horizontal (`CartesianGrid vertical={false}`) e tique por
   `@/lib/format` (`formatInt`, `formatCurrencyAxis`).
6. **Legenda no topo,** na mesma ordem visual das colunas, com amostra quadrada na cor de cada
   série (ROT-4).
7. **Dica (`ChartTooltip` ou dica própria no formato dele)** listando as séries na ordem visual, não
   na alfabética (DIC-4).

## Versões

* **`v1_agendas-marcadas-e-realizadas`.** Agendas marcadas e realizadas por mês em 6 meses: dois
  `Bar` irmãos com cor fixa nos slots 1 e 3, tique de contagem sem decimais e a taxa de realização
  com volume na dica.
* **`v2_ano-corrente-contra-anterior`.** Receita reconhecida de 2026 contra 2025 em 12 meses: ano
  anterior em neutro (`--line-strong`, com o valor escrito no mês de referência) e ano corrente em
  destaque (`--chart-1`), com legenda no topo nomeando as duas cores, a maior distância do ano na
  linha de leitura, o ano escrito junto de cada valor da coluna e os meses de 2026 ainda não
  fechados sem coluna, com a nota de período parcial escrita ao lado da legenda.
* **`v3_leads-por-plataforma-de-midia`.** Leads por mês em três plataformas de mídia paga, 6
  meses: três `Bar` nos slots 1, 3 e 6, com `barGap` de 1,5 px declarado, rodapé em HTML com o
  total por plataforma e dica na ordem visual.
* **`v4_plataforma-que-estreou-em-maio`.** Leads por mês em duas plataformas, uma delas estreando
  em maio: valor `null` antes da estreia (a coluna não existe) e zero medido depois dela desenhado
  e escrito, para as duas ausências nunca se confundirem; a coluna da plataforma estabelecida não
  engorda nos meses em que a recém-chegada ainda não existe.

## Como colar no Farol

* O `dataKey` de cada série vem do seletor da página (por exemplo, agrupar `fato_movimento_funil`
  por mês e por status), nunca de uma constante do catálogo.
* Ao trocar o número de séries ou o número de períodos, recalcule o passo pela fórmula da ESP-6
  (seção 17.7 do `CONTRATO.md`) antes de copiar o `maxBarSize`: ele muda com a largura real do
  cartão de destino, com o `barCategoryGap` escolhido e com o `barGap` entre séries.
* Quando uma série for "ano anterior" ou qualquer papel de neutro de dado (`--line-strong`),
  mantenha o valor escrito no mês de referência (o maior ou o último) para preservar a isenção de
  contraste da ACE-3; não generalize o neutro para todas as colunas sem repetir esse cuidado.
* Legenda e rodapé do `v3` são HTML puro (`<ul>`/`<li>`), então sobrevivem à colagem sem
  Recharts; ajuste só as classes de espaçamento se o `VisualCard` de destino já tiver um rodapé
  próprio.

## Referências

* Catálogo: [Data Viz Catalogue, Multi set Bar Chart](https://datavizcatalogue.com/methods/multiset_barchart.html).
* Catálogo: [Datawrapper Academy, como criar colunas agrupadas](https://academy.datawrapper.de/article/21-how-to-create-a-grouped-column-chart) e [como customizar](https://academy.datawrapper.de/article/45-customizing-your-grouped-column-chart).
* Catálogo: [Observable, Plot: Time series grouped bars](https://observablehq.com/@observablehq/plot-time-series-grouped-bars).
* Praticante: [Nightingale, Tear Up Your Baseline](https://nightingaledvs.com/tear-up-your-baseline/).
* Implementação: [shadcn/ui, diretório de charts](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts), arquivo `chart-bar-multiple.tsx`, e [Grouped Bar Chart no shadcn.io](https://www.shadcn.io/charts/bar-chart/bar-chart-04).
* Implementação: [Tremor, BarChart](https://www.tremor.so/docs/visualizations/bar-chart).
* Portal de design: [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Correção de 2026-09-18: `v2` reprovada por ROT-4, ACE-3 (rótulo sem ano)
e EIX-10/EST-4 (período parcial só na frase acessível); as três causas foram corrigidas no
`Chart.tsx` (legenda no topo, ano escrito junto de cada valor, nota de período parcial na
legenda). Ver "Pendências conhecidas" para o que ficou de fora desta rodada._

_Segunda leitura independente de 2026-09-18: `npm run check` sai com 0 com erro e 0 aviso nas
quatro versões, os dois PNGs de cada uma foram olhados e nenhuma acusou bloqueante. As quatro
ficam aprovadas; os itens abaixo são o que sobrou de observação._

_Correção de 2026-09-18 (guardas CONTRASTE-TEXTO e TAMANHO-TEXTO): as quatro versões escreviam
`XAxis` e `YAxis` sem espalhar `AXIS_PROPS`, então o tique numérico do `YAxis` saía no cinza
padrão da biblioteca em vez de `--text-muted`, abaixo do piso de contraste da ACE-3; as quatro
passaram a usar `{...AXIS_PROPS}` nos dois eixos. Na `v2`, o sub-rótulo do ano ("2025" e "2026")
subiu de 10 px para 11 px, o piso da TIP-2. Nenhuma outra peça foi alterada._

* **`v1`.** A dica é montada à mão, no desenho do `ChartTooltip`, porque ele não calcula taxa
  derivada de duas séries (DIC-2). O desvio está justificado no próprio arquivo e o formato bate
  com o do rótulo.
* **`v1`.** O mês de menor realização aparece só como tique em peso 600 e texto primário. O
  motivo do realce vive na frase acessível e na dica, não no corpo do visual; uma linha de leitura
  no topo (ANO-5) tornaria a leitura estática autossuficiente.
* **`v2`.** O neutro de dado (`--line-strong`) tem o valor escrito só em dezembro de 2025, e as
  outras onze colunas de 2025 seguem sem número junto da marca; agora a legenda no topo nomeia a
  cor de forma permanente, o que reforça a isenção da ACE-3 além do valor escrito no mês de
  referência.
* **`v3`.** Os totais do rodapé saem sem o substantivo ("Busca paga 1.360"), e a NUM-6 pede a
  unidade em todo lugar em que o número aparece. O título carrega "leads", então a leitura não se
  perde.
* **`v3`.** A dica também é montada à mão, aqui só para garantir a ordem visual das três
  plataformas (DIC-4). Fica a pergunta de método: o `ChartTooltip` do Farol ganharia um
  `itemSorter` e as duas versões voltariam ao componente padrão.
* **`v4`.** O zero medido desenha um traço de 2 px acima da linha de zero, um pouco de tinta para
  um valor nulo em quantidade. É o que torna o zero visível ao lado da ausência, e o número 0 fica
  escrito acima dele, então a leitura não engana.
* **`v4`.** Os nomes das duas séries estão escritos no componente, não vêm do dado. Ao colar no
  Farol, quem troca a plataforma precisa trocar legenda, frase acessível e `name` do `Bar` nos
  três lugares.
* **`v2`.** A variação da linha de leitura imprime "+42,0%" e a NUM-1 pede variação inteira a
  partir de 10%, ou seja "+42%". A casa decimal a mais não muda a decisão, mas destoa das outras
  versões do catálogo.
* **`v2`.** O `demonstrates` do `meta.json` tem cinco itens e reescreve o primeiro do catálogo
  (neutro contra destaque virou "legenda no topo com amostra quadrada"). Os quatro pontos do
  catálogo continuam todos demonstrados na tela; é divergência de redação entre catálogo e
  `meta.json`, não de conteúdo.
* **`v3`.** O rodapé diz o total por plataforma sem dizer que é total de semestre, e a NUM-5 pede
  o agregado explícito no rótulo. O subtítulo do cartão carrega "no semestre", então a leitura se
  recompõe, mas o rodapé sozinho não se explica.
* **`v3`.** O `data.ts` é o caminho feliz: seis meses, três séries, nenhum nulo, nenhum valor
  pequeno, nenhuma categoria de ausência. A seção 3 do contrato pede que o dado exercite um caso
  difícil; aqui quem cobre os casos duros é a `v4`, e vale dizer isso em uma linha nas `notes`.
* **`v1`.** O tique de mês e o rótulo de valor não carregam `tabular-nums` nem `font-display` no
  texto do eixo, então os dígitos de "mar/26" saem em largura proporcional (TIP-1). Vale para as
  quatro versões do modelo e não desalinha nada, porque o tique é centralizado.
* **`v4`.** Nos quatro meses anteriores à estreia a coluna que sobrou fica deslocada para a
  esquerda da banda, fora do centro do tique do mês. É o preço correto de não engordar a coluna
  que restou, mas convém dizer isso na Anatomia, porque quem copiar o padrão vai estranhar.

_Terceira leitura independente de 2026-09-19: `npm run check` sai com 0 com erro e 1 aviso, os
dois PNGs das quatro versões foram olhados e nenhuma acusou bloqueante; as quatro seguem
aprovadas. Os itens abaixo são o que esta rodada acrescentou._

* **`v2`.** A guarda `COLISAO-TEXTO` avisa em dois pares, "R$ 279,4 mil" a 2,88 px de "2026" e
  "R$ 214,3 mil" a 2,88 px de "2025". São as duas linhas do mesmo rótulo direto, valor em cima e
  ano embaixo, e nos dois PNGs elas se leem soltas; o piso de 4 px do aviso foi medido em rótulo
  sobre barra, não em par empilhado. Abrir a distância para 4 px calaria o aviso.
* **`v2`.** O eixo escreve `jan/26` a `dez/26` nos doze meses, inclusive onde só existe a coluna
  neutra de 2025. A legenda e o ano escrito junto do valor de dezembro desfazem a ambiguidade,
  mas o tique sozinho diz o ano errado da série anterior.
* **`v3`.** O rodapé de totais é separado do corpo por `border-t border-line-subtle`, e a ESP-5
  pede espaço no lugar de borda. A divisória ajuda a separar o agregado da série, então é
  divergência de régua, não de leitura.
* **`v1`.** As `notes` do `meta.json` chamam os 30% de `barCategoryGap` de "o teto do vão", e o
  comentário do `Chart.tsx` chama de "o piso". O certo é piso, porque 30% é o mínimo da faixa da
  ESP-2 e o que maximiza a espessura; a conta dos dois textos é a mesma.

## Pendências conhecidas

* **`v2`.** O tique de moeda quebra em duas linhas (`R$ 285` sobre `mil`) com `VALUE_AXIS_WIDTH`
  de 56 px. Nada fica cortado e não é bloqueante, mas a faixa de 48 a 64 da EIX-6 comporta um
  valor maior; não mexido nesta rodada de correção porque a reprovação apontava só ROT-4, ACE-3 e
  EIX-10/EST-4, e alargar o eixo mudaria o passo calculado pela ESP-6 para as 12 colunas.
