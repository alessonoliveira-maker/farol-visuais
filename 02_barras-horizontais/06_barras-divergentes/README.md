# Barras divergentes de sinal

## O que é

Barras horizontais que saem de um zero comum: para a direita quando o valor é positivo, para a esquerda quando é negativo. O olho lê primeiro o sinal (de que lado do zero a barra está) e depois a magnitude (o comprimento), por isso o domínio é simétrico, calculado pelo maior valor absoluto, e a mesma variação tem o mesmo comprimento dos dois lados. A cor segue a polaridade da métrica e não o sinal aritmético: CPL que cai é bom, pipeline que cai é ruim. O modelo absorve duas variações do estudo: a pilha por sinal, em que componentes que somam crescem para a direita, componentes que subtraem crescem para a esquerda e o saldo fica marcado, e o word shift, em que termos são ordenados pela contribuição para a mudança entre dois grupos.

## Quando usar

- Variação contra período anterior ou contra referência, com valores dos dois sinais: CPL por plataforma, pipeline por executivo, agendas por fila.
- Entradas e saídas de cada categoria, quando o leitor precisa ver de onde vem o saldo e não só qual é.
- Termos ou motivos que mais mudaram entre dois períodos ou dois grupos, ordenados pela contribuição em pontos percentuais.
- De 4 a cerca de 30 linhas, ordenadas do maior ganho à maior perda. Até 8 linhas cabem no preset `card`; de 15 a 30 pedem o `alto`.
- Semana ou mês em que todos os valores têm o mesmo sinal, desde que o componente recolha o lado vazio (v4).

## Quando evitar

- Todos os valores com o mesmo sinal e sem leitura de variação: barras simples ordenadas (01_barras-simples-ordenadas).
- Como o saldo se formou passo a passo, na ordem dos eventos: cascata (19_cascata-waterfall).
- Duas magnitudes lado a lado, e não a diferença entre elas: butterfly (07_butterfly-piramide).
- Escala ordinal com polos, como avaliação de 5 pontos: divergente empilhada Likert (08_divergente-empilhada-likert).
- Variação dentro de uma célula de tabela densa: barra de desvio em célula (14_tabelas-visuais).
- Mais de cerca de 30 linhas ou nomes que não cabem numa linha: tabela ordenável com a variação em coluna.

## Anatomia

1. Linha de leitura no topo, calculada do dado, com a conclusão: a maior alta, o pior saldo ou o termo que mais ganhou peso (CONTRATO, ANO-5), com nome e número em `--text-primary`.
2. Nome da categoria à esquerda num eixo de largura fixa, em Manrope 12 px `--text-secondary`, nunca cortado por reticência (TIP-7).
3. Linha do zero em `ReferenceLine x={0}` sólida de 1 px em `--line-strong`, mais forte que a grade em `--line-subtle` quando há grade (EIX-5).
4. Domínio simétrico `[-máximo absoluto, +máximo absoluto]`, ou recolhido para `[-máximo, 0]` e `[0, +máximo]` quando o dado tem sinal único (v4).
5. Barra desenhada pela prop `shape` com `Rectangle`: raio só na ponta livre, trocando de lado conforme o sinal; `Cell` está deprecado no Recharts 3.
6. Cor pela polaridade: `--positive` no sentido bom e `--negative` no ruim, sempre com o sinal escrito (COR-6); métrica sem polaridade usa `--chart-1` e `--chart-3` por direção; pilha por sinal usa `--chart-1` e `--chart-3` para o que entra e `--chart-6` e `--chart-5` para o que sai, com contorno `--surface-raised` entre segmentos (COR-5, COR-8).
7. Rótulo de valor sempre do lado de fora da ponta, em Space Grotesk 12 px, com `+` ou sinal de menos tipográfico `−` sobre `formatPercent`, `formatCurrencyCompact` ou `formatDecimal` do valor absoluto (NUM-3).
8. Coluna à direita com a base da comparação ou o saldo, alinhada à direita (TIP-6, NUM-4).
9. Marcador de saldo por `ReferenceDot` na mesma escala do eixo, com contorno na cor do cartão para não sumir quando o saldo é zero (v2).
10. Estados: `data` vazio troca o gráfico por um bloco `role="status"` com o ícone `Filter`; linha sem base escreve a falta de base em vez de desenhar zero; variação zero escreve 0 sem barra e sem sinal.

## Versões

- [`v1_variacao-de-cpl-por-plataforma`](./v1_variacao-de-cpl-por-plataforma/): variação do CPL de ago/26 contra jul/26 em seis plataformas genéricas. Demonstra o domínio simétrico, a cor pela polaridade de custo, o raio só na ponta livre, o rótulo com sinal tipográfico, a base de cada linha escrita na coluna e a plataforma sem mês anterior declarada. Previews: [escuro](./v1_variacao-de-cpl-por-plataforma/preview.svg) e [claro](./v1_variacao-de-cpl-por-plataforma/preview-claro.svg).
- [`v2_movimentacao-do-pipeline-com-saldo`](./v2_movimentacao-do-pipeline-com-saldo/): entradas e avanços contra perdas e desqualificações do pipeline de seis executivos na semana. Demonstra valores assinados com `stackId` comum, tons frios e quentes por sinal, o saldo marcado por `ReferenceDot` e escrito com cor pela polaridade, e a legenda na ordem visual. Previews: [escuro](./v2_movimentacao-do-pipeline-com-saldo/preview.svg) e [claro](./v2_movimentacao-do-pipeline-com-saldo/preview-claro.svg).
- [`v3_termos-de-perda-que-mais-mudaram`](./v3_termos-de-perda-que-mais-mudaram/): word shift com os 20 termos de motivo de perda que mais mudaram do 2º para o 3º trimestre de 2026. Demonstra a contribuição como diferença de proporção em pontos percentuais, o mínimo de ocorrências aplicado e declarado, o selo "novo" e a contagem de cada trimestre na dica. Previews: [escuro](./v3_termos-de-perda-que-mais-mudaram/preview.svg) e [claro](./v3_termos-de-perda-que-mais-mudaram/preview-claro.svg).
- [`v4_todos-os-valores-negativos`](./v4_todos-os-valores-negativos/): variação semanal de agendas por fila numa semana em que nenhuma fila cresceu. Demonstra a detecção de sinal único que recolhe o lado vazio, o zero mantido à direita, a fila sem variação escrita como 0 sem barra e a frase que declara o caso. Previews: [escuro](./v4_todos-os-valores-negativos/preview.svg) e [claro](./v4_todos-os-valores-negativos/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o import do dado.
2. Entregue o dado cru pela prop `data`: o componente calcula variação, contribuição e saldo, ordena e decide o domínio. Não passe a variação pronta de outro seletor, senão a regra de arredondamento e a de sinal divergem do resto da página.
3. Passe `goodDirection` conforme o `goodDirection` da métrica no registry (`down` para custo, `up` para receita e volume). É ele que decide `--positive` ou `--negative`, nunca o sinal.
4. Mantenha as linhas sem base (mês anterior sem coleta, termo abaixo do mínimo) no dado: o componente declara a falta em vez de desenhar zero.
5. Dê altura ao pai: com 6 a 8 linhas, `h-64`; com 20 linhas, cerca de 26 px por linha mais 40 px de cabeçalho. Abaixo disso o texto de 12 px encosta na linha vizinha.
6. Embrulhe num `VisualCard` com o título e o subtítulo do `meta.json`; na v3, o mínimo de ocorrências vai no subtítulo do cartão além da nota do próprio visual.
7. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/` e confira os dois temas e a largura de 390 px, onde a coluna da direita é a primeira candidata a sair.

## Referências

- [Vega Lite, índice de exemplos](https://vega.github.io/vega-lite/examples/) e [bar_diverging_stack_transform](https://vega.github.io/vega-lite/examples/bar_diverging_stack_transform.html): o deslocamento em torno de um zero calculado, a mesma ideia aplicada a componentes por sinal.
- [Domo, divergent bar charts](https://www.domo.com/learn/charts/divergent-bar-charts) (não abriu): definição de uso e exemplos de variação positiva e negativa.
- [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html): a pilha comum assume valores do mesmo sinal, o que explica o marcador de saldo da v2.
- [Storytelling with Data, what is a bar chart](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart): onde colocar o rótulo quando a barra cruza o zero.
- [Stephen Few, displays for combining time series and part to whole (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf): a crítica à leitura de componentes sem linha de base comum, mitigada aqui pelo zero central.
- [Recharts, Bar, props shape, radius e stackId](https://recharts.github.io/en-US/api/Bar/): `radius` em array de quatro valores para arredondar só a ponta livre e o empilhamento que respeita o sinal.
- [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): Positive And Negative Bar Chart, esqueleto do word shift.
- [Shifterator, README](https://github.com/ryanjgallagher/shifterator): anatomia de barras por contribuição e os tipos de shift (proporção, entropia, Jensen Shannon).
- [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): títulos conversacionais do tipo "mais X que Y", úteis no word shift.
- Portal de design: [Dribbble, tag bar_chart](https://dribbble.com/tags/bar_chart) (listagem de tag): cor de polaridade em peças de painel.
- Portal de design: [Dribbble, busca progress-table](https://dribbble.com/search/progress-table) (listagem de busca): composições de linha com saldo à direita.
- Estudo de origem: [`_estudo/familias/02_barras-horizontais.md`](../../_estudo/familias/02_barras-horizontais.md), seções 2.8 e 2.9, e [`_estudo/familias/21_texto-e-nuvem-de-palavras.md`](../../_estudo/familias/21_texto-e-nuvem-de-palavras.md), seção 3.4.
- Farol: `app/src/components/visuals/charts/BarsChart.tsx` (orientação horizontal) e `app/src/components/visuals/charts/ChartTooltip.tsx` (a dica usada na v2 e na v3). Os hooks `useXAxisScale`, `useYAxisScale` e `usePlotArea` do Recharts 3.8 em diante posicionam os rótulos fora da ponta sem cálculo manual de pixel.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; o que aparece aqui não reprova versão nenhuma. As quatro versões passaram com `0 com erro` no check e estão aprovadas. Esta leitura confirma o que a rodada de 2026-09-17 pedia: a frase acessível da v3 caiu para 179 caracteres e entrou na régua de 100 a 250 da ACE-1, a barra do termo novo sai na cor de crescimento, e o cabeçalho "saldo" da v2 deixou de ser cortado._

- v1, v2 e v3: o `npm run check` acusa a espessura efetiva da marca abaixo do piso geral de 12 px da ESP-2 (10 px, 8 px e 7 px). O próprio contrato registra que esse piso ainda não tem peça de medição e por isso sai como aviso; nas três o rótulo mora fora da barra, que é justamente o caso em que a medição de 2026-09-17 não achou defeito. Quem quiser fechar o aviso sobe a altura do canvas pela conta da ESP-6, nunca afina mais a barra.

- v1: o render mede o SVG isolado diferindo da página em mais de 0,5% dos pixels nos dois temas, e o `.qa/*.diff.png` mostra a diferença concentrada no desenho do texto (subtítulo do cartão e linha de leitura). Fica abaixo do limite de falha e não muda a leitura, mas segue acusado a cada render.
- v1: o cabeçalho com "queda" e "alta" pinta as duas palavras na cor da polaridade; a informação já está na cor da barra e no sinal do rótulo, então é redundância, não erro.
- v2: saldo exatamente zero cai no ramo `net >= 0` e sai em `--positive`; zero não é ganho, e `--text-secondary` diria melhor o que aconteceu com a Ingrid S.
- v2: os quatro componentes da pilha só têm número na dica; a mensagem do visual é o saldo, que está escrito, então a DIC-1 está respeitada, mas quem colar numa página sem mouse perde a decomposição.
- v3: a linha de leitura mais a nota do mínimo de ocorrências somam dois blocos de texto antes do gráfico, o que empurra as barras para baixo no preset `alto`.
- v3: a nota do mínimo de ocorrências vive dentro do Chart, e o catálogo pede esse mínimo declarado no subtítulo. Quem colar num `VisualCard` precisa decidir se repete a frase no subtítulo do cartão ou se tira a do Chart, sob pena de ler o mesmo aviso duas vezes.
- v1: a ordenação é decrescente pelo valor com sinal, então o topo é a maior alta, que numa métrica de custo é a pior linha, e não o maior ganho que o texto do catálogo cita. O cabeçalho "queda" e "alta" resolve a leitura, mas a palavra do catálogo e a ordem do código descrevem a mesma regra por nomes diferentes.
- v2: `advanced` igual a zero deixa a ponta direita da pilha quadrada, porque o raio mora na barra de avanços; a linha do Renan A. fica com acabamento diferente das outras, o que não muda leitura nenhuma.
- v3: `formatPercentPoints` imprime o sinal de porcentagem, então a contribuição em pontos percentuais sai como "+1,6%"; é o formatador do Farol e a nota abaixo da linha de leitura já diz que a unidade é ponto percentual.
- v3: o selo "novo" usa `--info`, que tem exatamente o mesmo hex de `--chart-3` nos dois temas, ou seja, a cor de quem perdeu peso. Como é palavra e fica na coluna de nomes, não colide com as marcas, mas a coincidência de hex merece atenção de quem colar.
- v4: com todas as filas em queda o desenho vira, na prática, barras simples espelhadas contra o zero da borda. É exatamente o caso que o catálogo pede desta versão, e a linha de leitura declara o caso, mas vale lembrar a quem copiar que o valor didático está na detecção de sinal único, não na forma.
- v4: a fila sem variação escreve "0 agendas" dentro da faixa reservada ao rótulo, à direita do zero; com rótulo mais longo ou cartão mais estreito esse texto é o primeiro candidato a encostar na coluna de contagem.

## Correção de 2026-09-25

**v2, o saldo zero pintado de ganho.** O marcador de saldo e o número da coluna saíam de
`row.net >= 0 ? 'var(--positive)' : 'var(--negative)'`. Saldo exatamente zero caía no ramo do `>=`
e era pintado em `--positive`: verde numa semana em que o que entrou e o que saiu se anularam. Zero
não é ganho. O `formatSigned` da mesma peça já deixava o zero sem sinal, então número e cor se
contradiziam dentro do mesmo arquivo.

O que mudou: entrou `netTone`, com o zero no neutro `--text-muted` e o comentário de uma linha que
impede a próxima cópia de voltar ao `>=`. Vale para o `ReferenceDot` e para o texto da coluna de
saldo, as duas marcas que liam o mesmo ramo.

**O defeito estava vivo no dado publicado.** Ingrid S. tem saldo exatamente zero (240 mil de
entradas e avanços contra 240 mil de perdas e desqualificações) e era a quarta linha em verde. No
preview novo ela é a única linha com marcador cinza, parado sobre a linha do zero, e "R$ 0" em
neutro na coluna: o olho separa as três leituras sem ler texto. O `meta.json` ganhou a nota do caso
e o item de `demonstrates` que prometia "cor pela polaridade" passou a dizer que o zero vai no
neutro, sem sinal.

**Auditadas e mantidas.** v1, v3 e v4 já tratavam o zero: a v1 testa o texto impresso
(`text === formatPercent(0, digits)`), v3 e v4 testam `value === 0`. Nenhuma foi tocada, e a v1 é a
convenção que as correções desta rodada copiaram.
