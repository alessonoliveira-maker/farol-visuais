# KPI com decomposição em partes

## O que é

Um cartão de KPI hierárquico: o número total em destaque, com as partes que o formam explicadas no próprio cartão, sem virar gráfico à parte. A relação entre o pai e os filhos é sempre escrita e conferida antes de desenhar, seja soma (dois ou três filhos que fecham o total), barra única segmentada (composição por origem, com ordem estável vinda da configuração), lista de contribuição (as maiores partes, mais a linha de demais e a linha de sem rótulo que fecham a soma) ou contribuição com sinal (altas e quedas que explicam uma variação, com o resíduo nomeado quando os itens não fecham a conta). Absorve decomposição, KPI hierárquico e lista de contribuição num só modelo, em HTML com Tailwind e larguras calculadas em funções puras de TypeScript.

## Quando usar

- O total só faz sentido com a composição, como a receita entre clientes novos e carteira.
- Um número principal explicado por 2 ou 3 filhos com relação declarada: soma, divisão ou explicação.
- Composição de até 5 partes com ordem estável vinda da configuração da métrica, e não do valor.
- Total e os 3 a 5 maiores responsáveis por ele, com demais e sem rótulo em linhas próprias.

## Quando evitar

- Mais de 5 componentes, ou a lista virou a protagonista: barras horizontais (família 02).
- Contribuições de sinais opostos lidas como forma: cascata (família 19).
- Filho de filho, com dois níveis ou mais: hierarquia (família 12).
- Composição de vários totais ou ao longo do tempo: colunas empilhadas (família 03).
- Filhos sem relação declarada com o pai: separar em KPIs simples (modelo 01).

## Anatomia

1. **Rótulo e período:** nome da métrica em `text-xs font-medium text-text-secondary`, com o mês por `formatMonthShort` em `text-text-muted` à direita.
2. **Número total:** `kpi-number text-3xl leading-none font-semibold` com `formatCurrencyCompact` ou `formatInt`. Sem coleta, o ícone `Unplug` e `formatUnavailable()` no lugar do número, nunca zero.
3. **Relação com as partes, escrita e conferida:** uma função pura recebe o total e os itens e devolve as linhas já na ordem certa, com a soma conferida contra o total antes de desenhar; a soma exata vira uma frase curta, e o que sobra ou falta vira uma linha própria em vez de um número que não bate.
4. **Partes ou filhos:** `kpi-number text-sm font-semibold` para o valor e `text-[0.6875rem]` para o rótulo, com a participação percentual inteira pelo maior resto (soma sempre 100). Separação por espaço entre pai e filhos, nunca por divisória (ESP-5).
5. **Composição por barra ou por lista:** quando a forma é uma barra única, cada segmento leva 2 px de separador em `--surface-raised` entre vizinhos (COR-5) e a legenda mantém a ordem visual dos segmentos; quando é uma lista de contribuição, cada linha leva uma barra de fundo proporcional ao total (não ao maior item), em `--line-strong`.
6. **Linha de demais ou resíduo:** categorias abaixo do corte, ou a diferença que as partes nomeadas não explicam, vira uma linha própria em `--text-secondary` ou `--text-muted`, com a contagem escrita ("Demais (9 origens)"), nunca somada às partes nomeadas.
7. **Linha de sem rótulo ou sem base:** ausência de origem, de classificação ou de base de comparação vai em linha própria com contorno `--text-muted`, sempre por último, visível e fora de "Outros".
8. **Linha de leitura (ANO-5):** frase de 12 px calculada do dado, `aria-hidden`, dizendo a conclusão que os números já sustentam ("mídia paga responde por 52% do volume").
9. **Estados:** `data` vazio ou total zero desenha um bloco `role="status"` com o ícone `Filter`, sem número inventado; sem coleta usa `Unplug` e `formatUnavailable()` no número.

## Versões

- `v1_receita-do-mes-entre-novos-e-carteira`: decomposição por soma, dois filhos (clientes novos e carteira) que fecham o total exato, com o filho pequeno (7% do total) ainda legível ao lado do grande. Previews: [escuro](./v1_receita-do-mes-entre-novos-e-carteira/preview.svg) e [claro](./v1_receita-do-mes-entre-novos-e-carteira/preview-claro.svg).
- `v2_leads-do-mes-por-origem-com-destaque`: barra única segmentada com quatro origens em ordem fixa da configuração, mídia paga acesa em `--chart-1` contra as demais em neutro com valor escrito, e legenda com valor em colunas à direita. Previews: [escuro](./v2_leads-do-mes-por-origem-com-destaque/preview.svg) e [claro](./v2_leads-do-mes-por-origem-com-destaque/preview-claro.svg).
- `v3_leads-com-maiores-origens-e-sem-rotulo`: lista de contribuição com as 5 maiores origens de 14, barra de fundo proporcional ao total, linha de demais (9 origens), linha de sem origem registrada com 22% e a etiqueta LACUNA, nome longo inteiro sem reticência e desempate determinístico pelo nome. Previews: [escuro](./v3_leads-com-maiores-origens-e-sem-rotulo/preview.svg) e [claro](./v3_leads-com-maiores-origens-e-sem-rotulo/preview-claro.svg).
- `v4_receita-com-contribuicoes-que-se-anulam`: variação de receita entre dois trimestres com contribuições de sinais opostos por produto, sinal tipográfico `+`/`−` ordenado pelo módulo, participação escrita como "sem base" quando a variação total é zero (nunca `NaN%`) e o resíduo nomeado ("Demais produtos e ajustes") quando os itens não fecham a conta. Previews: [escuro](./v4_receita-com-contribuicoes-que-se-anulam/preview.svg) e [claro](./v4_receita-com-contribuicoes-que-se-anulam/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`. As quatro versões são moldura `stage` (o próprio cartão): vão direto na grade de KPIs, numa célula com altura (`h-48` para a v1 e a v4, `h-64` para a v2 e a v3, que têm legenda ou lista mais longas).
2. Passe o dado real pela prop `data`; a v2 aceita ainda `highlightKey` e a v3 aceita `topCount` (de 3 a 5), ambos vindos da configuração da métrica no registry, nunca escolhidos pelo valor do mês.
3. As partes, os segmentos e os itens de contribuição vêm sempre na ordem da configuração da métrica (v1, v2) ou reordenados de forma determinística pela própria função pura do componente (v3, por contagem e depois por nome; v4, pelo módulo da variação e depois por nome). Ao ligar o dado real, mantenha a fonte da ordem: trocar por `sort` no seletor da página quebra a comparação entre meses.
4. Os estados vazio e indisponível já estão inline com `role="status"` e `Unplug`/`formatUnavailable()`; ao colar, troque-os por `EmptyState` e `UnavailableState` do Farol mantendo o texto (seção 16 do contrato).
5. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, conferindo os dois temas e 390 px de largura; a v3, com sete linhas possíveis, é a que mais sofre em telas baixas.

## Referências

- [FT Visual Vocabulary, categoria parte do todo](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). A lista de formas de parte do todo e o lugar da barra única entre elas.
- [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). A lógica de faixas encostadas, que é a mesma geometria da barra segmentada da v2.
- [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). O limite prático de categorias distinguíveis num elemento pequeno, base do teto de 5 partes.
- [Figma Community, Dashboard Cards](https://www.figma.com/community/file/969677870366908785/dashboard-cards). Barras de composição dentro de cartões estreitos.

## Observações da revisão (não bloqueantes)

Revisão de 2026-09-15, segunda passada: os bloqueantes da primeira (legenda da v2 e nota final da v4 cruzando a borda inferior, ponteiro da v4 para a cascata ausente) foram corrigidos, e nenhuma versão tem bloqueante. Os itens abaixo não reprovam.

- `v1_receita-do-mes-entre-novos-e-carteira`: quando as partes passam do total, a participação é calculada sobre a soma das partes mas sai impressa como "% do total".
- `v1_receita-do-mes-entre-novos-e-carteira`: a Anatomia (item 9) diz que total zero vira bloco `role="status"`, mas a v1 só trata a lista de partes vazia.
- `v2_leads-do-mes-por-origem-com-destaque`: os três segmentos neutros têm a mesma cor, e quem lê só sabe qual é qual pela ordem da legenda; vale escrever "da esquerda para a direita" na legenda ou na linha de leitura.
- `v2_leads-do-mes-por-origem-com-destaque`: com mais de 5 partes, "Origem fora da configuração" acaba somada em "Outras"; ela devia ficar por último e fora do agrupamento (COR-4).
- `v2_leads-do-mes-por-origem-com-destaque`: a frase acessível tem 229 caracteres e passa de 250 com uma quinta origem.
- `v3_leads-com-maiores-origens-e-sem-rotulo`: a etiqueta LACUNA usa o vocabulário de procedência (ANO-6) numa caixa com borda (ESP-5); o catálogo pede a etiqueta, mas "sem registro" sem caixa evitaria a confusão com o selo do `VisualCard`.
- `v3_leads-com-maiores-origens-e-sem-rotulo`: as `notes` do `meta.json` citam uma "nota da escala" que não existe no cartão.
- `v3_leads-com-maiores-origens-e-sem-rotulo`: o número da posição (`index + 1`) sai sem `formatInt`, e o nome acessível de cada item vem só do texto da linha, sem `aria-label` próprio.
- `v3_leads-com-maiores-origens-e-sem-rotulo`: no tema claro, a barra `--line-strong` sobre o trilho `--surface-sunken` tem pouco contraste; vale pela isenção do valor escrito.
- `v4_receita-com-contribuicoes-que-se-anulam`: a barra de largura só é "recusada" num comentário, porque o cartão nunca desenha barra; `gains` e `losses` são calculados e ninguém os usa.
- `v4_receita-com-contribuicoes-que-se-anulam`: com variação zero, o número "R$ 0" sai em `--text-secondary` e não em `--text-primary` (17.1); é defensável pela COR-6.
- `v4_receita-com-contribuicoes-que-se-anulam`: a base da variação fica na linha de baixo do número, e não na mesma linha (NUM-4); a leitura continua clara.
- `v4_receita-com-contribuicoes-que-se-anulam`: a frase acessível tem 238 caracteres, perto do teto de 250.
- `v2_leads-do-mes-por-origem-com-destaque`: a legenda com valor ocupa cerca de 40% da altura do cartão, acima dos 30% da ROT-4; é defensável porque ela é a tabela de valores que o catálogo pede.
- `v3_leads-com-maiores-origens-e-sem-rotulo`: o trilho de 64 px deixa as barras de 7% a 12% com 4 a 8 px, e a proporção se lê quase só pelo percentual escrito; um trilho mais largo daria corpo à barra.
- `v4_receita-com-contribuicoes-que-se-anulam`: com participação calculável e um item de variação exatamente zero, `signedPercent` imprime "−0,0%" (NUM-3); vale tratar o zero sem sinal.
- README, Como colar no Farol, passo 1: as alturas sugeridas não comportam os cartões medidos no render (v2 com cerca de 260 px contra os 256 px de `h-64`, v3 com cerca de 291 px contra `h-64`, v4 com cerca de 309 px contra os 192 px de `h-48`), e o conteúdo transbordaria a borda do cartão.

## Correção de 2026-09-25

**v4, o menos zero da participação.** `signedPercent` fazia `fraction > 0 ? '+' : MINUS`, que manda
o zero para o ramo negativo: a contribuição nula saía escrita como `−0,0%`, isto é, uma queda de
zero. Zero exato não tem sinal.

O que mudou: a função passou a testar o **texto impresso**, na convenção que
`02_barras-horizontais/06_barras-divergentes/v1` já praticava; o que sai escrito como zero sai sem
sinal. O teste é sobre o texto e não sobre a fração porque um `=== 0` cru deixaria passar a
participação minúscula que arredonda para 0,0% e ainda imprimiria `−0,0%`. O `signedCurrency` ao
lado já tratava o caso pela `directionOf`, e não foi tocado.

**Conserto de caminho latente:** no dado publicado a variação total é zero, então `hasShareBase` é
falso, toda participação sai como "sem base" e `signedPercent` nem chega a ser chamada. O desenho
não mudou. O ramo se alcança quando há base de participação e um produto contribui com zero.
