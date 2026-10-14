# Tabela com heatmap nas células

## O que é

O fundo de cada célula recebe um tom de uma rampa sequencial ou divergente proporcional ao valor,
com o número sempre escrito por cima. A estrutura continua de tabela: colunas de texto, colunas
sem cor e colunas de unidades diferentes convivem ao lado das colunas coloridas. Lê se primeiro
pela cor, para achar o extremo e o padrão, e depois pelo número, para a leitura exata.

## Quando usar

* Colunas de mesma natureza e mesma unidade (12 meses, 6 etapas) em que o extremo importa mais
  que o valor exato de cada célula.
* Até cerca de 15 linhas por 12 colunas, sempre com o número visível dentro da célula.
* Perfil de várias entidades por várias métricas de unidades diferentes, com a cor calculada
  coluna a coluna e o melhor e o pior de cada coluna realçados.
* Desvio contra meta com sinal, em escala divergente centrada em zero e legenda com os limites.

## Quando evitar

* Colunas de unidades diferentes numa escala única: calcule a cor por coluna (v3 desta pasta) ou
  use barras inline (modelo `01_tabela-com-barras-inline`).
* Todas as colunas da mesma medida e nenhum texto além do rótulo: é o heatmap matricial da
  família 15, que não carrega o compromisso de tabela lida linha a linha.
* Gradiente automático de mínimo a máximo com um outlier: use faixa manual (v2) ou percentis.
* Mais de 10 entidades por 8 dimensões com realce de melhor e pior: o realce se perde visualmente;
  nesse caso use só o gradiente, sem negrito nem ícone.
* Pergunta de quanto a mais entre duas linhas: cor compara mal grandeza, prefira barra.

## Anatomia

1. **Cabeçalho.** Rótulo da coluna de texto à esquerda; mês, etapa ou métrica em cada coluna
   colorida, em `--text-muted`, 11 px (17.1).
2. **Célula colorida.** Fundo em `var(--seq-N)` (sequencial) ou em opacidade de `--positive` e
   `--negative` (divergente), calculado por função pura de quantização; número centralizado por
   cima, sempre em `formatValue`/`formatPercent`/`formatCurrencyCompact` conforme a unidade.
3. **Texto por degrau, não fixo.** A cor do texto muda com o degrau para manter 4,5:1 nos dois
   temas (ver a nota de escala abaixo). Nunca um único token de texto para a rampa inteira.
4. **Vão entre células.** 2 px de `--surface-canvas` entre uma célula e a vizinha (`borderSpacing`
   da tabela), para a cor ser lida por comparação e não se fundir num bloco só (Few).
5. **Legenda de escala.** Faixa de amostras na ordem da rampa, com o valor mínimo e o máximo (ou
   os dois lados do zero, na divergente) e a unidade, mais uma frase dizendo se a escala é comum a
   todas as colunas, calculada por coluna, ou por linha.
6. **Célula de ausência.** Contorno tracejado em `--line-strong`, sem preenchimento de cor, com
   `--text-muted`: nunca entra na escala nem escurece para "parecer" um valor baixo.

### A escala é global nesta pasta, por coluna numa versão

A pergunta da tarefa vale versão a versão: **v1 e v2 usam escala global** (o mínimo e o máximo vêm
de toda a tabela, não de cada coluna) porque comparam a mesma unidade em todas as colunas (taxa de
conversão, CPL em reais). **v3 usa escala por coluna** (percentil dentro da própria coluna),
porque as 8 métricas têm unidades diferentes e não fixaria de outra forma. **v4 usa escala
divergente global**, centrada em 0%, comum às 4 colunas, porque o desvio contra meta já é
comparável entre trimestres. Nenhuma versão usa escala por linha: a família não tem um caso em que
a linha, e não a coluna, defina o que é "alto".

### Duas armadilhas resolvidas, com o número

**A escala de cor sem legenda.** Todas as 4 versões desenham a faixa de amostras com os limites e
a unidade no rodapé (`figcaption`), porque cor sem escala não deixa ler valor, só comparar. Na
v2, a legenda também escreve a polaridade invertida (tom mais forte é CPL mais caro, portanto
pior), porque nas outras três tom mais forte é sempre o lado bom.

**O texto sobre a célula escura.** Medido com a fórmula da WCAG sobre os hex de
`app/src/styles/tokens.css` (2026-09-18): nenhum par único de texto cobre os 7 degraus de
`--seq-1` a `--seq-7` acima de 4,5:1 nos dois temas. `--text-primary` cai para 4,29:1 em
`--seq-4` no escuro; `--accent-cyan-contrast` cai para 3,59:1 no mesmo degrau; e `--seq-5` inverte
a régua entre temas (o token que passa no escuro é o que reprova no claro, e vice-versa). Por
isso **v1, v2 e v3 usam 5 degraus, não 7** (`--seq-1`, `--seq-2`, `--seq-3`, `--seq-6`, `--seq-7`):
os três primeiros ficam com `--text-primary` (mínimo 6,33:1 no escuro, 9,35:1 no claro) e os dois
últimos com `--accent-cyan-contrast` (mínimo 5,19:1 no escuro, 5,45:1 no claro). Nos dois casos a
folga sobre 4,5:1 é medida, não estimada. Na v4, divergente, a opacidade de `--positive` e
`--negative` tem teto em 55% pela mesma razão: acima disso o par mais fraco (`--positive` a 65%
no escuro) cai para 3,76:1. Nenhuma das quatro versões usa `foreignObject` fora deste raciocínio:
o `npm run check` não mede contraste dentro de HTML servido como `foreignObject`, então as contas
acima foram conferidas à mão contra os PNGs dos dois temas, não só contra a guarda automática.

## Versões

* **`v1_conversao-por-etapa-e-mes`.** Seis transições do funil comercial por 12 meses de 2026,
  escala global em 5 degraus, mês sem medição com contorno tracejado.
* **`v2_cpl-qualificado-com-teto`.** Cinco plataformas de mídia paga por 6 meses, faixa manual de
  R$ 60 a R$ 240 (o outlier de R$ 256 encosta no extremo), contorno de aviso acima do teto de
  R$ 180 e polaridade escrita por extenso na legenda.
* **`v3_perfil-das-areas-por-coluna`.** Nove áreas por 8 métricas de unidades diferentes, cor por
  percentil dentro da coluna, direção do "bom" lida do dado (ícone no cabeçalho), melhor da
  coluna em negrito e pior com ícone de aviso.
* **`v4_desvio-divergente-e-sem-meta`.** Seis áreas por 4 trimestres, desvio contra meta em escala
  divergente com sinal tipográfico, dois trimestres de uma área sem meta cadastrada (não é
  desvio zero) e teto de opacidade medido para manter contraste.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida; troque `data` pela consulta real na página
   (mesmo formato: linhas com id, nome e valores por coluna).
2. Se a tabela tiver mais linhas que a amostra, decida entre paginar ou rolar: as quatro versões
   não implementam rolagem, porque o preset `largo` já cobre a densidade que o modelo aguenta
   (seção Quando usar).
3. Ao trocar as colunas, refaça as contas de contraste desta página se usar outra combinação de
   degraus de `--seq-*`: os números acima valem para os hex atuais de `tokens.css` e mudam se o
   token mudar.
4. Rendered dentro de `VisualCard`, o Chart não desenha título nem legenda de procedência (ANO-6);
   a legenda de escala do rodapé fica, porque é parte do dado, não da moldura.

## Referências

* Catálogo: [Datawrapper Blog, heatmaps em tabelas](https://www.datawrapper.de/blog/heatmaps-for-tables):
  escala em degraus, faixa customizada e legenda de escala.
* Catálogo: [Vega-Lite, texto sobre heatmap](https://vega.github.io/vega-lite/examples/layer_text_heatmap.html):
  cor do texto condicionada ao valor da célula, a mesma ideia por trás do degrau a degrau desta pasta.
* Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf):
  escala sequencial contra divergente, limite prático de faixas e efeito de vizinhança (a origem
  do vão de 2 px entre células).
* Estudo de origem: [`_estudo/familias/14_tabelas-visuais.md`](../../_estudo/familias/14_tabelas-visuais.md),
  seção 2.

## Observações da revisão (não bloqueantes)

Revisão de 2026-09-19, segunda passagem: as quatro versões estão aprovadas. O bloqueante anterior
da v4 (sinal ausente na faixa neutra) foi corrigido e conferido no PNG dos dois temas; `+1%`,
`−1%` e `−2%` saem com sinal e `0%` sai sem sinal, como manda a NUM-3. Nenhum item abaixo reprova.

* **v1:** três nomes de etapa saem truncados ("Oportunidade para pro...", "Proposta para
  negocia...", "Negociação para fecha..."); TIP-7 só admite reticência quando o nome inteiro está
  na frase acessível, e ali só aparece a etapa líder.
* **v1:** na célula sem medição a palavra "indisponível" quebra ao meio ("indisponí" e "vel"),
  porque a coluna de mês é estreita demais para a palavra inteira em 11 px.
* **v1:** a taxa sai em percentual inteiro; o catálogo pede uma casa, e a NUM-1 pede uma casa com
  o volume em taxa de conversão.
* **v1:** cinco degraus no lugar dos sete do catálogo, desvio medido e declarado nas `notes`; o
  mínimo de 5,19:1 citado no README e no comentário do Chart é do `--seq-5`, que ficou fora da
  escala, e o par mais fraco em uso mede 7,38:1 no escuro e 5,45:1 no claro.
* **v1:** a Anatomia diz que o vão entre células é `--surface-canvas`, mas o que aparece no vão é
  o fundo do cartão (`--surface-raised`), que é onde a tabela está.
* **v2:** "Display em rede programática" sai truncado no cabeçalho de linha, pelo mesmo motivo
  da v1.
* **v2:** a célula sem veiculação escreve `formatUnavailable()` com contorno tracejado, mas sem o
  ícone `Unplug` que a EST-2 descreve.
* **v2:** a legenda diz a faixa manual e o teto, e não diz que o valor fora da faixa encosta no
  extremo, que é justamente o caso de R$ 55 e de R$ 256 na tabela.
* **v3:** cinco áreas empatam em R$ 0 na coluna de receita nova e só "Produto" recebe o ícone de
  pior da coluna, por ser a primeira da ordem; as outras quatro ficam com a mesma cor e sem marca.
* **v3:** "Tecnologia da Informação" sai truncada na coluna de área.
* **v3:** nos cabeçalhos de duas linhas a seta de direção fica no fim da primeira linha, afastada
  do rótulo e mais perto da borda da coluna vizinha.
* **v3:** o melhor de cada coluna em peso 700 dá oito elementos em 700, acima dos dois da TIP-3;
  a regra vem do próprio catálogo, que pede o melhor da coluna em negrito.
* **v4:** o desvio de −2% já recebe tom leve, embora a legenda chame a faixa neutra de "dentro de
  ±2%": a fronteira do código é `abs < 2%`, então o próprio 2% fica de fora do neutro.
* **v4:** os chips de 20% de opacidade da legenda medem menos de 3:1 contra o cartão; quem segura
  a leitura são os textos dos limites ao lado, não a amostra.
* **v4:** a legenda escreve os sete chips e depois a frase inteira em sequência, de modo que a
  correspondência entre cada amostra e o trecho de texto se lê por ordem, não por proximidade.
* **v4:** a célula sem meta usa contorno tracejado com ícone e texto no lugar da hachura do
  catálogo, desvio declarado nas `notes` por causa da COR-9.
* **v1 a v4:** nenhuma versão desenha o bloco `role="status"` da EST-1: com `data` vazio sobram o
  cabeçalho e a legenda de escala, sem erro e sem frase dizendo que o recorte não tem linhas.
* **v1 a v3:** na legenda de escala os dois primeiros degraus (`--seq-1` e `--seq-2`) ficam abaixo
  de 3:1 contra o cartão; os limites escritos nas pontas da faixa resolvem a leitura.
