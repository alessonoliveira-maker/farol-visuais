# Radar em pequenos múltiplos

## O que é

Um radar pequeno por entidade, lado a lado numa grade, todos com os mesmos eixos, a mesma ordem e o mesmo domínio fixo de 0 a 100. A repetição troca a sobreposição: em vez de empilhar polígonos num radar só, o olho compara forma contra forma entre miniaturas. Cada eixo é numerado na miniatura, e uma legenda comum diz o nome de cada número; as miniaturas seguem um critério de ordem escrito na linha de leitura, e o valor exato de cada eixo mora na dica. Lê-se como parecença de perfil, quais formas se repetem e qual foge do padrão, e não como valor por dimensão.

## Quando usar

- Comparar os perfis de 4 a 12 entidades sem sobrepor polígonos: SDRs, filas, origens, áreas.
- A pergunta é quais perfis se parecem e qual foge do padrão, e não o valor exato de cada eixo.
- Referência comum, como a média do time, repetida em contorno em cada miniatura.
- Cartão largo, com espaço para miniaturas de pelo menos 140 px de largura.

## Quando evitar

- Mais de 12 entidades, em que a miniatura fica pequena demais para ler: tabela com heatmap nas células (`14_tabelas-visuais/02`) ou matriz categórica (`15_matrizes/02`). A `v4` mostra o aviso que a grade escreve nesse caso.
- Cada miniatura com domínio próprio, o que torna falsa a comparação entre elas: o domínio é fixo e igual em todas.
- Uma entidade só contra a referência: radar comparativo (modelo 02).
- Quem é melhor em cada dimensão: dot plot por dimensão (`17_comparacao-de-pontos/01`) ou tabela realçada (`14_tabelas-visuais/02`).
- Métricas de unidades diferentes por entidade: pequenos múltiplos de barras por métrica (`02_barras-horizontais/02`).

## Anatomia

1. **Linha de leitura** de 12 px, calculada do dado: o critério de ordem das miniaturas e a conclusão (quem abre, quem fecha, quem está sem dado). `aria-hidden`, porque a frase acessível da raiz diz o mesmo.
2. **Legenda comum de eixos**: o número em `font-display` e o nome em `--text-secondary`, na ordem do registry, mais a nota da escala (anel externo é 100). Na `v2` e na `v3` ela também traz a amostra da média e do eixo sem dado.
3. **Grade de miniaturas** em CSS grid, com colunas e fileiras calculadas do número de entidades (`GRID_COLUMNS` no topo do arquivo) e vão de 12 px.
4. **Título da miniatura**: nome em `--text-secondary` e o número que ordena (índice médio na `v1`, eixos abaixo da média na `v2`, entradas na `v3`, leads na `v4`) em `font-display` tabular, por `formatInt`.
5. **Radar** (`RadarChart` com `PolarGrid` circular, `PolarAngleAxis` de número próprio e `PolarRadiusAxis` sem número, só com os anéis de 50 e 100) com `domain` fixo de 0 a 100 igual em todas as miniaturas.
6. **Série** em `--chart-1`, traço de 2 px e preenchimento com 0,66 de opacidade, o mínimo da ACE-5 para essa cor no tema claro. A média do time (`v2`) é contorno tracejado `3 3` em `--text-muted`, com revestimento de 4 px em `--surface-raised` por baixo (TOK-4) para não se perder no preenchimento do SDR. A miniatura selecionada se marca por borda `--line-strong`, sem trocar o fundo atrás do radar, para o preenchimento manter o contraste medido contra o cartão.
7. **Marcas de exceção**: eixo sem dado com traço tracejado do centro à borda e polígono aberto, sem ponta falsa até o centro (`v3`); zero medido como ponto no centro, que não se confunde com o tracejado.
8. **Dica** com o nome da entidade, o nome do eixo, o valor exato por `formatInt` e, na `v2`, a média do time e a distância até ela.
9. **Estado vazio** com `role="status"` e ícone `Filter`, no lugar da grade inteira.

## Versões

- `v1_perfil-de-oito-sdrs`: oito SDRs em seis eixos, grade de 4 por 2, ordenados pelo índice médio, com nome e índice no título e frase acessível que cita o maior e o menor.
- `v2_media-do-time-em-cada-miniatura`: a média do time em contorno tracejado, calculada uma vez fora do `map`, contagem de eixos abaixo da média no título e miniatura selecionável por clique com `aria-pressed` e foco visível.
- `v3_filas-de-trabalho-da-prevendas`: seis filas em cinco eixos, grade de 3 por 2, primeira resposta invertida com a regra na legenda, eixo de comparecimento sem dado na fila de evento e volume de entradas ao lado do título.
- `v4_vinte-entidades-alem-do-teto`: vinte origens contra o teto de 12 miniaturas, aviso com `role="status"` com o número do recorte, as 12 de maior volume na grade e as 8 restantes declaradas, com a recomendação da tabela com heatmap.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual e troque o `data.ts` pelo registry de métricas: a ordem dos eixos é a do registry e a mesma em toda tela. O `scores` de cada entidade segue essa ordem.
2. Calcule o índice de 0 a 100 fora do componente e diga o método na linha de leitura (percentil no time, no conjunto das filas); eixo em que menor é melhor, como o tempo de resposta, chega já invertido e a legenda escreve a regra.
3. Embrulhe num `VisualCard` do Farol; título, procedência e aviso de protótipo são do cartão, o Chart não desenha nenhum.
4. Confira a largura da miniatura no cartão real: com menos de 140 px o número do eixo encosta no anel, e é hora de reduzir colunas ou trocar de visual.
5. O estado vazio inline vira `EmptyState` ou `UnavailableState` do Farol, mantendo o sentido do texto; o aviso de teto da `v4` pode virar o aviso padrão do cartão.
6. Nenhuma versão traz o canvas `largo` sugerido (960x400): a conta de altura por fileira não fecha, e o `meta.json` de cada uma explica o canvas por número. No Farol o cartão precisa de pelo menos 520 px de altura de corpo para duas fileiras legíveis.
7. Ofereça ao lado a alternativa em barras ou tabela com os mesmos dados; radar é perfil, não ranking.

## Referências

- Recharts, [`RadarChart`](https://recharts.github.io/en-US/api/RadarChart/), [`Radar`](https://recharts.github.io/en-US/api/Radar/), [`PolarGrid`](https://recharts.github.io/en-US/api/PolarGrid/) e [`PolarAngleAxis`](https://recharts.github.io/en-US/api/PolarAngleAxis/): `shape`, `dot` e `tick` próprios sustentam o eixo numerado e o traço interrompido.
- Comportamento do pacote 3.10.1 herdado do modelo 01: `computeRadarPoints` dá raio zero ao valor `null` e o ponto sai com coordenada válida no centro, então o `shape` próprio da `v3` abre o ciclo nos nulos; o `Tooltip` filtra a entrada nula antes do `content`, e `filterNull={false}` o mantém aberto no eixo sem dado.
- Guias de forma: `18_radar/01_radar-simples` (radar, grade circular, eixo sem dado) e `04_linhas/09_pequenos-multiplos-de-linha` (grade com escala comum).
- Stephen Few, [Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf), e Storytelling with Data, [o que é um spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): pequenos múltiplos como saída para mais de duas séries.
- Estudo da família: `_estudo/familias/18_radar.md`. No Farol, `app/src/components/visuals/charts/chartTheme.ts`.
- A fila de mensageria da `v3` não leva nome de produto: o catálogo pede o nome do aplicativo, e a guarda de marca real do `check` o recusa em `data.ts`.

## Observações da revisão (não bloqueantes)

2026-10-13, revisão das quatro versões: `v1`, `v3` e `v4` aprovadas; `v2` reprovada, com parecer em `validation/revisao_18_radar__03_radar-em-pequenos-multiplos_2026-10-13.md`. O estado vazio das quatro não foi renderizado e a dica não foi sondada em navegador: o que se diz deles aqui é leitura do código.

- `v1`, `v2` e `v4`: a tela diz "escala de 0 a 100" mas não diz o que ela mede. Que o índice é percentil no time (ou entre as origens) e que 100 é o melhor está só no comentário do `data.ts`; o passo 2 de "Como colar no Farol" manda dizer o método na linha de leitura. Na `v4` pesa mais, porque eixos como "Cobertura de telefone" e "Resposta em 24 h" têm nome de taxa e o leitor pode ler o índice como percentual.
- `v1` a `v4`: a dica escreve o valor do eixo sem unidade nem a palavra índice (NUM-6), e é desenhada à mão em vez de usar `ChartTooltip` (DIC-2); copia fundo, borda e classes do componente do Farol, como a saída da REC-6 admite.
- `v1`, `v2` e `v4`: `scores[i] ?? 0` desenha zero quando a lista de notas vem mais curta que a de eixos, igual a um zero medido. O tipo destas versões não admite ausência, então o ramo não roda com dado válido; quem precisar de eixo sem dado usa o tipo e o traço da `v3` (EST-1b, DAD-2).
- `v1` a `v4`: os números da nota de escala estão em Manrope sem `tabular-nums`; na `v2` também os números de eixo entre parênteses da linha de leitura, e na `v4` o 12 de "Aparecem as 12" (TIP-1). Sem consequência no preview.
- `v2`: sem faixa de tolerância, Tiago A. conta 4 de 6 eixos abaixo da média por 2 a 4 pontos, de 1 a 2,5 px num raio de 61 px, e o desenho não mostra a diferença que o título conta. Limiar discutível; a nota do `meta.json` só declara o arredondamento.
- `v2`: linha de leitura em duas linhas quando há miniatura selecionada (a ANO-5 pede uma).
- `v2`: na legenda, a amostra tracejada fica a 5 px de "SDR" e a 9 px de "média do time", que é o rótulo dela (ROT-9). Está no parecer, para a mesma rodada de correção.
- `v2`: raiz `role="img"` com oito botões dentro. Sondado no Edge, os botões e o `aria-pressed` chegam à árvore de acessibilidade; `group`, como na `v4`, não depende disso. Está no parecer.
- `v2`: a frase que diz em quais eixos o SDR selecionado fica abaixo mora na linha de leitura, que é `aria-hidden`, e a frase da raiz não a traz. Está no parecer.
- `v3`: a nota de escala não diz que o anel externo é 100, como dizem a `v1`, a `v2`, a `v4` e o item 2 da Anatomia.
- `v3`: a ausência se escreve "sem dado" no título e na legenda, e a dica usa `formatUnavailable()`, que hoje devolve "indisponível": duas palavras para o mesmo estado (EST-2).
- `v3`: a linha de leitura e a frase acessível citam só a primeira fila com eixo sem dado (`items.find`); com duas filas incompletas, a segunda fica só no título da miniatura dela.
- `v3`: a OPACIDADE-MARCA não mede o preenchimento, que mora no `shape` próprio. Medido à mão: 4,85:1 no escuro e 3,01:1 no claro contra o cartão, no limite do piso, como nas outras versões.
- `v3`: raio de cerca de 51 px numa célula de 290 px de largura; quem limita é a altura de 560 px do canvas. Melhoria possível: mais altura.
- `v4`: a frase acessível começa por "Recorte com" e não usa a palavra radar (a ACE-1 pede começar pelo tipo de gráfico).
- `v4`: "modelo 14/02" na tela é endereço do catálogo e pode ser lido como data; ao colar no Farol, trocar pelo nome do visual.
- `v4`: miniatura de 139 px, 1 px abaixo dos 140 px do "Quando usar". Sem consequência no preview.

2026-10-13, segunda revisão da `v2`, depois da correção, julgada pelo arquivo e pelos PNGs das 07:21: aprovada, sem bloqueante. Os dois bloqueantes do parecer da manhã não aparecem mais. O tracejado da média mede 5,21:1 no escuro e 5,37:1 no claro contra o revestimento, o revestimento mede 4,85:1 e 3,01:1 contra o preenchimento, e a miniatura selecionada mantém o fundo do cartão, conferido no pixel. O raio dos 48 vértices confere com o dado e a média desenhada é a mesma nas oito miniaturas. O estado vazio, a dica e o contorno de foco continuam sem render: o que se diz deles é leitura do código.

- `v2`: o revestimento de 4 px da média é pintado depois do SDR e cobre o contorno de 2 px dele onde os dois andam a menos de 3 px um do outro. Medido no `preview.svg`: em Tiago A., 23% do contorno some inteiro e 53% em parte; em Maria Eduarda S., 29% e 23%; em Caio F., 11% e 17%. A forma continua lida pelo preenchimento, e a contagem do título diz o que o desenho não resolve. Pintar o contorno do SDR por último devolveria o contorno e cobriria o tracejado nos mesmos trechos: é troca, não correção.
- `v2`: a ponta do vértice do SDR vaza cerca de 1 px além do revestimento em Davi O. (eixo 4, 70 contra 69) e em Caio F. (eixo 5, 52 contra 50), e fica como um ponto solto. `strokeLinejoin="round"` no contorno do SDR tira a ponta.
- `v2`: a borda da miniatura selecionada, em `--line-strong`, mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão. Passa no teste da ACE-6, porque tapada a borda o nome do selecionado continua escrito na linha de leitura. Melhoria possível: 2 px num token que meça 3:1.
- `v2`: o preenchimento a 0,66 mede 3,01:1 no claro pelo token e 2,99:1 pelo pixel do PNG (94, 159, 170), sem folga nenhuma. Pela conta, 0,68 dá 3,13:1 e 0,70 dá 3,25:1. Vale para as quatro versões, que usam a mesma constante.
- `v2`: constantes de acabamento fora da tabela, sem consequência no preview: traço da média com 1,5 px (a 17.2 pede 1 px para referência), `NUMBER_GAP = 11` (a ESP-1 pede múltiplo de 2, e as quatro versões usam 11) e vão de 8 px na grade (o item 3 da Anatomia diz 12 px, que é o das outras três).
- `v2`: continuam como estavam, e continuam sem bloquear, cinco pontos da primeira revisão: a amostra tracejada da legenda mais perto de "SDR" (cerca de 6 px) do que de "média do time" (cerca de 9 px); a raiz `role="img"` com oito botões dentro; a frase dos eixos do selecionado só na linha de leitura, que é `aria-hidden`; a linha de leitura em duas linhas; e a contagem de eixos abaixo da média sem faixa de tolerância.
