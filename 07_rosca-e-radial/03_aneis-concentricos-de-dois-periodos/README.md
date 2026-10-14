# Anéis concêntricos de dois períodos

## O que é

Duas roscas com o mesmo conjunto de categorias em dois momentos: o anel interno, em cor atenuada, é o período anterior; o anel externo, em cor cheia, é o período atual. Os dois compartilham o centro, o ângulo inicial e o sentido de leitura, e a ordem das categorias é sempre a do período atual, aplicada aos dois anéis, porque uma categoria pode trocar de posição de um período para o outro e a leitura não pode depender de qual período decidiu a ordem.

**A forma tem um defeito estrutural que este modelo não esconde.** Pela geometria do círculo, a mesma fração ocupa mais área no anel de fora do que no de dentro: um raio maior multiplica o comprimento do arco só um pouco, mas multiplica a área do gomo bem mais. Isso significa que, olhando só para o desenho, o período atual sempre parece ter crescido mais do que realmente cresceu, mesmo quando as duas fatias representam o mesmo percentual. Não existe correção geométrica para isso sem abrir mão da própria forma de dois anéis (a alternativa que corrige de verdade é comparar por comprimento, não por área, e isso é outro modelo: barra 100% empilhada, `03_colunas-verticais/04_colunas-empilhadas-100`, ou linha de participação em `04_linhas`). A compensação deste modelo é editorial, não geométrica: **o percentual de cada categoria, nos dois períodos, vai sempre escrito em texto**, ao lado do nome, nunca só pela área do arco; e toda variação relevante é dita em pontos percentuais, nunca deixada para o olho estimar pelo desenho. As quatro versões seguem essa regra sem exceção. Quem precisa que a comparação seja honesta só de bater o olho, sem ler a legenda, está pedindo outro modelo; este aqui serve quando o par de roscas cabe como resumo visual de capa e o texto ao lado carrega a conclusão.

## Quando usar

- Mesma composição de 2 a 5 categorias em dois períodos fechados, como mês contra mês ou trimestre contra trimestre, quando o cartão precisa caber num espaço quadrado de resumo.
- Leitura de qual categoria ganhou ou perdeu peso, sempre com a variação escrita em pontos percentuais ao lado do nome, nunca inferida pela área dos dois arcos.
- Categoria nova que só existe no período atual, desde que a ausência no período anterior seja declarada como "sem dado", nunca desenhada como 0%.

## Quando evitar

- Decisão que depende só da leitura visual da área, sem ninguém lendo a legenda: o anel de fora sempre parece ter crescido mais; use barra 100% empilhada (`03_colunas-verticais/04_colunas-empilhadas-100`) ou linha de participação (`04_linhas`), onde a mesma fração tem o mesmo comprimento nos dois períodos.
- Três períodos ou mais: um terceiro anel esmagaria o miolo e a distorção de área composta fica ainda mais enganosa; use barra 100% (`03_colunas-verticais/04_colunas-empilhadas-100`) ou linha (`04_linhas`).
- Comparar volume absoluto entre os dois períodos: o anel mostra fração de cada período, não volume; use colunas agrupadas (`03_colunas-verticais/02_colunas-agrupadas`).
- Muitas categorias pequenas: a fatia mínima do gomo some na distorção polar antes mesmo de chegar no anel de fora; use haltere (`17_comparacao-de-pontos`, quando existir) ou a barra 100% já citada.
- Período atual ainda incompleto contra um período fechado, sem aviso de parcial: a comparação sairia enganosa duas vezes, pela área e pelo recorte.

## Anatomia

1. Dois `Pie` no mesmo `PieChart`, com `cx`, `cy`, `startAngle` (90) e `endAngle` (−270) idênticos: o interno recebe os dados do período anterior, com `innerRadius`/`outerRadius` menores e `fillOpacity` reduzida; o externo recebe o período atual, com raios maiores e cor cheia. O `stroke` de separação entre fatias usa `var(--surface-raised)`.
2. Cor por categoria via `slot` do dado (`--chart-1` a `--chart-6`, atribuídos na ordem 1, 3, 6, 5, 2, 4), a mesma nos dois anéis: trocar o período não troca a cor.
3. Centro do gráfico com o total do período atual, por um `div` absoluto centralizado sobre o `ResponsiveContainer` (a alternativa ao `Label` do Recharts que o CONTRATO recomenda para tipografia e leitura de tela), nunca ícone decorativo.
4. Legenda tabular ao lado, com o nome da categoria e o percentual inteiro de cada período em colunas à direita, somando 100 pelo método do maior resto; é aqui que a distorção do desenho é compensada em texto.
5. Percentual inteiro calculado por categoria, nunca lido do ângulo do arco: o `Pie` do Recharts normaliza cada anel pelo total dos dados que recebe, então o anel interno de uma categoria nova (v4) fecha 100% sozinho, sem a categoria que ainda não existia.
6. Estados de fronteira tratados por regra: categoria sem dado no período anterior escreve "sem dado" e a variação dela escreve "sem base de comparação", nunca 0% nem um p.p. calculado contra zero.
7. Recorte sem categorias troca o gráfico inteiro por um bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_origem-dos-leads-em-dois-meses`: origem dos leads de jul/26 (anel interno) contra ago/26 (anel externo), quatro canais. Demonstra o caso básico do modelo: dois `Pie` com os mesmos ângulos, ordem fixada pelo mês atual, atenuação por opacidade no anel interno e legenda com o percentual dos dois meses lado a lado. Previews [escuro](./v1_origem-dos-leads-em-dois-meses/preview.svg) e [claro](./v1_origem-dos-leads-em-dois-meses/preview-claro.svg).
- `v2_origem-que-mais-ganhou-peso`: as mesmas origens, com a categoria de maior variação absoluta destacada em peso 700 e a diferença escrita em pontos percentuais calculados sobre a fração real, não sobre o percentual já arredondado. Demonstra por que `formatPercentPoints` do Farol não serve aqui (imprime a diferença como se fosse taxa) e o contorno de escrever a unidade "p.p." à mão. Previews [escuro](./v2_origem-que-mais-ganhou-peso/preview.svg) e [claro](./v2_origem-que-mais-ganhou-peso/preview-claro.svg).
- `v3_investimento-por-plataforma-em-dois-trimestres`: investimento por plataforma no 1º contra o 2º trimestre de 2026, quatro plataformas em slots 1, 3, 6 e 5. Demonstra o total de cada trimestre escrito na legenda com a variação nomeando a base, a diferença em pontos percentuais em toda linha (não só na de maior variação, diferente da v2), e uma troca real de posição entre duas categorias de um trimestre para o outro, prova de que a ordem não pode vir do período anterior. Previews [escuro](./v3_investimento-por-plataforma-em-dois-trimestres/preview.svg) e [claro](./v3_investimento-por-plataforma-em-dois-trimestres/preview-claro.svg).
- `v4_plataforma-nova-sem-mes-anterior`: uma quarta plataforma entra em ago/26 e não existia em jul/26. Demonstra o anel interno fechando 100% só com quem já existia, a categoria nova presente só no anel externo, "sem dado" no lugar de um 0% inventado, e "sem base de comparação" no lugar de um p.p. sem sentido. Previews [escuro](./v4_plataforma-nova-sem-mes-anterior/preview.svg) e [claro](./v4_plataforma-nova-sem-mes-anterior/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta de visual da página, por exemplo `app/src/pages/<pagina>/visuals/TwoPeriodDonut/`.
2. Troque o `import` do `./data` pelo seletor real da página e passe `data` (e os rótulos de período que a versão expuser) pelas props; o default do `data.ts` fica só como amostra do catálogo.
3. Ponha o componente no corpo de um `VisualCard` com altura definida no pai, seguindo o `canvas` sugerido (`card`), ou passe `height`.
4. Se o recorte real puder trazer uma categoria nova ou uma categoria sem dado no período anterior, mantenha `previous` como `null` para essas linhas: o componente já trata a ausência sem inventar 0%.
5. Rode `npm run typecheck` e `npm run lint` no `app/` e confira nos dois temas e a 390 px de largura, com atenção à legenda em card estreito (ela empilha abaixo do gráfico por container query).

## Referências

- [AG Charts, pie in a donut](https://www.ag-grid.com/charts/gallery/pie-in-a-donut/): `outerRadiusRatio` da pizza interna e o tooltip comparativo com setas de variação, referência de anatomia para os dois raios concêntricos.
- [Data Visualisation Catalogue, radial bar chart](https://datavizcatalogue.com/methods/radial_bar_chart.html): a explicação da distorção do arco externo mais longo, que é a mesma distorção de área que este modelo declara e compensa em texto.
- [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): por que comparar partes entre pizzas é difícil, a base do porquê a variação sai sempre escrita e não deixada para o olho.
- [Highcharts, documentação de pizza](https://www.highcharts.com/docs/chart-and-series-types/pie-chart): a rosca montada com várias séries de `size` e `innerSize` diferentes, a mesma técnica de dois raios usada aqui.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Os pontos que reprovaram versão estão na nota do `npm run revisao`, não aqui._

**Correção 2026-09-18 (rodada única, ACE-3):** em `v1`, `v2` e `v3` o rótulo central saía do miolo e cruzava o anel interno (contraste abaixo de 4,5:1 nos dois temas). Correção pelas duas frentes que a regra permite: o miolo abriu (`innerRadius`/`outerRadius` do anel anterior de 30%/48% para 38%/54%; do atual, de 56%/80% para 62%/82%, as duas relações seguindo dentro da faixa de 60% a 80% que a família exige) e o texto perdeu o mês (`leads no mês` em vez de `leads em ago/26`; `no trimestre` em vez de `no {trimestre}`), já que o mês ou trimestre de cada anel segue nomeado logo abaixo, na legenda. `v4` manteve os raios antigos (30%/48%/56%/80%) porque já estava aprovado e a regra desta rodada é não mexer no que passou; as duas geometrias convivem no modelo até uma rodada futura unificar.

- Todas as versões: a legenda traz uma amostra de cor por categoria, em cor cheia, e o tom atenuado do anel interno não aparece nela; quem lê depende da linha "Anel interno: ... anel externo: ..." para ligar tom e período.
- `v1`: o miolo mostra só o total do período atual; o total do período anterior não aparece em lugar nenhum, então a variação de volume entre os dois meses fica fora da peça, por desenho do modelo.
- `v2`: a variação do destaque sai de +7,4 p.p., calculada sobre a fração real, enquanto os percentuais inteiros impressos na mesma linha (27% e 35%) sugerem 8 p.p.; é arredondamento, não erro, mas convive mal na mesma linha.
- `v2`: o catálogo prevê dica com as duas frações e a nota sobre a distorção do anel externo; a dica foi dispensada com justificativa no `meta.json` e a nota da distorção vive na frase acessível e no `meta.json`, não na tela.
- `v3`: o catálogo pede o total de cada período na legenda com a variação nomeando a base; a legenda traz os dois totais, mas a variação do total só existe na frase acessível.
- `v4`: o número central transborda o miolo e cruza o anel interno; segue legível (7,9:1 no escuro e 8,5:1 no claro), então fica como acabamento a apertar junto com o resto do modelo.
- `v4`: o `meta.json` afirma categoria nova no fim da ordem, mas a ordem é a do período atual e "Vídeo curto" cai em terceiro; a afirmação do metadado é que está desalinhada, não o desenho.
- `v4`: o rótulo do miolo diz "no mês atual" em vez de nomear ago/26 como as outras versões fazem.
- `v4`: a ausência é escrita como "sem dado" e "sem base", texto próprio da versão, no lugar de `formatUnavailable()` e da frase da EST-4; o sentido está certo e cabe na coluna, mas diverge do texto único do Farol.

### Revisão independente de 2026-09-18

As quatro versões passaram no `npm run check` (0 com erro) e nenhuma tem bloqueante; os pontos abaixo somam à lista acima, sem contradizê-la.

- Todas as versões: as duas colunas de percentual da legenda não têm cabeçalho próprio; quem lê liga cada coluna ao seu período pela linha "Anel interno: ... anel externo: ..." e pelo peso do número (atenuado igual a anterior, forte igual a atual). Funciona, mas é uma leitura indireta.
- `v1` e `v2`: o rótulo do miolo diz "leads no mês" sem nomear o mês; o total impresso é o do anel externo, e só a linha da legenda logo ao lado desfaz a dúvida.
- `v3`: o `meta.json` promete a variação do total nomeando a base na legenda; na tela ficam os dois totais lado a lado e a variação sai só na frase acessível.
- `v4`: o número central cruza o anel interno, e a medida de contraste desta rodada sobre os pixels do PNG deu 6,2:1 no tema escuro e 8,8:1 no claro (acima de AA), não os 7,9:1 e 8,5:1 anotados na rodada anterior; segue legível, então continua acabamento e não bloqueio.
- `v4`: o catálogo se contradiz na própria entrada, porque o resumo do modelo manda fixar a ordem pelo período atual e a lista de demonstrações da versão pede a categoria nova no fim; o código segue o resumo, que é a regra do modelo, e a linha do metadado é que precisa ser reescrita.
