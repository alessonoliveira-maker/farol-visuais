# Pizzas e roscas em small multiples

## O que é

Uma grade de pizzas (ou roscas) do mesmo diâmetro, uma por todo (semana, pessoa, plataforma), com as mesmas categorias na mesma ordem e nas mesmas cores em toda a grade, e uma legenda única que vale para todas as células. A leitura não é "quanto variou", é "em qual todo a parte X passa da metade" ou "em qual todo a parte X chama atenção": Stephen Few condena a forma para acompanhar mudança fina, e ela sobrevive aqui porque a pergunta é de posição, não de série temporal.

## Quando usar

- A mesma composição de 2 a 4 todos com leitura aproximada: em qual todo a parte X passa da metade.
- Matriz de completude ou cobertura com roscas binárias e número central, até uns 12 grupos.
- Totais parecidos entre os todos, o que justifica o mesmo diâmetro para todas as pizzas.

## Quando evitar

- Cinco todos ou mais, ou comparar a mesma parte com precisão entre eles: barra 100% empilhada (família 03).
- Participação ao longo de muitos períodos: linha (família 04).
- Totais muito diferentes entre os todos: pizzas proporcionais ao total (modelo 06 desta família).
- Muitas roscas binárias dentro de uma tabela: barra em célula (família 14).

## Anatomia

1. Uma pizza por todo em `Pie` dentro de `ResponsiveContainer`, uma célula por `PieChart`, numa grade CSS (`grid`) com `gridTemplateColumns` derivado do número de todos, nunca uma contagem de colunas fixa que sobre ou falte célula.
2. Ordem das categorias fixa entre as pizzas (a mesma sequência do `data`, nunca ordenada por valor dentro de cada célula): é o que garante que a mesma cor apareça sempre na mesma posição angular (ponto delicado do estudo).
3. Cor por categoria vinda do índice fixo na sequência, nos slots 1, 3 e 6 dos tokens `--chart-*` (COR-8), a mesma tabela `CATEGORY_COLORS` usada pela legenda e por toda pizza.
4. `startAngle={90}` e `endAngle={-270}` em toda pizza, para começar às 12 horas no sentido horário, igual ao modelo 01.
5. Rótulo interno de percentual inteiro por `midAngle`, com halo em `var(--surface-raised)` para contraste sobre qualquer cor categórica (ROT-6, ROT-7), somando 100 por pizza pelo maior resto (`integerPercents`, NUM-2).
6. Legenda única no topo da grade, na ordem angular das categorias, com amostra quadrada e nome (ROT-1, ROT-4): repetir a legenda em cada célula só duplicaria a mesma informação quatro vezes.
7. Total de agendas escrito sob cada pizza, em `formatInt` com a unidade por extenso (NUM-6); a dica (`ChartTooltip`) traz a contagem exata de cada categoria, que o rótulo interno não escreve por já estar em percentual (DIC-1).
8. Conclusão calculada do dado (o total geral e o piso da categoria de referência entre as semanas) só na frase acessível da raiz (ANO-5): o corpo do canvas em faixa é baixo, e uma linha de leitura visível a mais encolheria a pizza abaixo do ponto em que os rótulos internos se encostam (COLISAO-TEXTO).
9. `data` vazio troca a grade inteira por um bloco `role="status"` (EST-1).
10. Raiz com `role="figure"`, porque é composição com legenda e não um gráfico único (seção 11): o total e o rótulo de cada semana ficam legíveis no próprio texto, e a frase acessível da raiz traz a conclusão sem repetir os doze números da grade.
11. Quando uma categoria é a pergunta e as outras são só o resto, a cor acesa é uma só (`--chart-1`) e o resto vai para `--text-muted`, que a tabela de tokens endossa como categoria neutra e que mede 5,2:1 no escuro e 5,4:1 no claro. A parte acesa é a **primeira** do dado, então ela começa sempre às 12 horas e ocupa a mesma posição angular em toda a grade.
12. O percentual da fatia acesa mora **fora** do disco, logo abaixo dele, sempre que a fatia for pequena: entre 8% e 19% a corda da cunha é menor que a tinta de `18,5% (5 de 27)`, e o rótulo interno atravessa a borda e cai sobre o cartão, que é o defeito da `v1` registrado na fila da guarda `TEXTO-NA-MARCA`. Com o percentual fora, quem carrega a identificação de cada parte é a legenda única mais o número escrito sob cada pizza, na mesma ordem da legenda (ROT-10).
13. Acima de oito células a rosca deixa de ser `PieChart` e passa a ser **SVG puro**: um `<circle>` de trilho, um `<path>` de arco calculado por `pointAt` e `arcPath`, e o número no centro em `font-display`. Doze `PieChart` seriam doze instâncias do Recharts para desenhar doze arcos. O `viewBox` é igual ao tamanho desenhado, para a escala do texto sair 1 e o piso de 11 px da `TIP-2` valer sobre o tamanho que aparece na tela.
14. O estado de cada célula sai de **uma constante no topo do arquivo** (`MIN_SAMPLE`, `minShare`), nunca de um número repetido no meio do JSX: abaixo do piso o número troca de cor **e** ganha ícone (ACE-2), e a célula com `n` abaixo do mínimo perde o percentual e escreve a contagem absoluta, porque percentual de seis leads varia dezessete pontos com um lead a mais.
15. Selo de estado sem fundo tingido: `--surface-overlay` mede 1,00:1 contra o cartão no tema claro, então a tarja não existiria na tela (TOK-1). O selo é ícone mais palavra, na cor de atenção.

## Versões

- `v1_agendas-em-quatro-semanas`: resultado das agendas comerciais (realizada, remarcada, não compareceu) em quatro semanas seguidas. Demonstra a grade `PieChart` por célula do Tailwind, a ordem fixa de categorias entre as pizzas, a legenda única no topo com amostra quadrada e o total de agendas escrito sob cada pizza.
- `v2_nao-comparecimento-acima-de-15`: em qual das quatro semanas o não comparecimento passou de 15% das agendas. Demonstra a grade com **uma** categoria acesa e o resto em neutro, o percentual escrito só para a fatia acesa (com peso 700 na semana acima do limite), a anotação curta com o valor do limite só na pizza que o ultrapassa, e a frase acessível que nomeia essa semana.
- `v3_completude-de-campos-por-plataforma`: quais campos do lead chegam incompletos em cada plataforma de mídia. Demonstra a matriz de 3 por 4 roscas binárias com rótulos de linha e coluna em HTML, o número central como a métrica que se compara, o número abaixo do piso em `--warning` com ícone, e o anel em SVG puro no lugar de um `PieChart` por rosca acima de oito células.
- `v4_origem-por-sdr-com-amostra-pequena`: como a origem dos leads se divide entre quatro pessoas quando uma recebeu só 6 leads. Demonstra a pizza com `n` abaixo do mínimo desenhada inteira em neutro e com selo, o percentual omitido em favor da contagem absoluta, a categoria de ausência vazada e por último em todas as pizzas, e a constante `MIN_SAMPLE` do topo do arquivo decidindo o estado de cada célula.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para uma pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/WeeklyAgendaResultPies/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` pela prop; o default do `data.ts` fica só como amostra do catálogo.
3. Dê altura ao pai (`<div className="h-64">`, por exemplo, para o canvas em faixa) ou passe `height`; a grade encolhe junto porque cada célula usa `ResponsiveContainer`.
4. Se o número de todos variar de página para página, confirme que `gridTemplateColumns` continua derivado de `data.length` e não de uma contagem fixa de colunas.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, Pie Chart in Grid](https://recharts.github.io/en-US/examples/PieChartInGrid/): observar pizzas `responsive` em células de tamanhos diferentes da grade CSS.
- [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar a série de quatro pizzas por ano redesenhada como barras e depois como linha.
- Farol: `app/src/components/visuals/charts/DonutChart.tsx` (Pie com `Cell` por índice e `ChartTooltip`, referência mais próxima já em produção).
- Molde de SVG puro com geometria em TypeScript: `_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10/v1_composicao-por-origem` (é dele que vem a forma de calcular a geometria em funções puras do próprio arquivo, usada nos anéis da `v3`).

## Observações da revisão (não bloqueantes)

- `v1_agendas-em-quatro-semanas`: a amostra da legenda sai redonda no render, e não quadrada como dizem o `meta.json` e a anatomia 6. A classe `rounded-sm` vale 6 px no tema do app e o quadrado tem 10 px, então o raio fecha o círculo; quem quiser o quadrado precisa de um raio menor declarado.
- `v1_agendas-em-quatro-semanas`: o rótulo interno das fatias pequenas é mais largo que a fatia e transborda o disco, e o halo da ROT-7 come um pedaço da cunha ao passar por ela. Nos dois temas os quatro pares continuam legíveis, com o número inteiro sobre o cartão; num diâmetro de 80 px é o preço de manter o rótulo dentro em vez de linha guia.
- `v1_agendas-em-quatro-semanas`: a guarda `COLISAO-TEXTO` avisa um par a 3,21 px na Sem 4, entre "20%" e "8%". Conferido nos PNGs dos dois temas: os dois ficam em linhas diferentes e leem soltos, sem risco de virar um número só.
- `v1_agendas-em-quatro-semanas`: a frase acessível tem 238 caracteres, a 12 do teto de 250 da ACE-1, e cresce com o número de semanas; com seis semanas no recorte ela passa do teto.
- `v1_agendas-em-quatro-semanas`: o total sob cada pizza ("24 agendas") está em Manrope sem `tabular-nums` (TIP-1), e o `MIN_LABEL_FRACTION` de 5% nunca é exercitado pelo dado fixo, como o próprio comentário do arquivo declara, então o caminho da fatia sem rótulo não tem retrato.
- `v2_nao-comparecimento-acima-de-15`: o percentual da fatia acesa fica FORA do disco, logo abaixo dele. Foi medida a corda da cunha: entre 8% e 19% do círculo ela é menor que a tinta de `18,5% (5 de 27)`, e o rótulo interno atravessaria a borda. O desvio está declarado na nota do `meta.json`.
- `v3_completude-de-campos-por-plataforma`: a tinta de `100%` em Space Grotesk de 14 px mede 53 px no preview, contra os cerca de 38 px que a soma por glifo do dossiê prevê (o glifo `%` não está na tabela e cai no padrão de 0,550 em, que o subestima muito). O anel foi para 88 px com traço de 8 px, o que dá furo de 72 px e 9,5 px de folga de cada lado do número. Quem mexer no diâmetro refaz esta conta pela medida, não pela tabela.
- `v4_origem-por-sdr-com-amostra-pequena`: os números das quatro linhas de origem vão alinhados à direita (TIP-6, coluna de número), enquanto a pizza e o rótulo da pessoa ficam centrados na coluna, porque ali são marca e rótulo de marca. A contagem `0 de 6` de SDR 03 é zero medido e aparece escrita, mas sem cunha, porque cunha de área nula não se desenha (EST-3 servida pela metade, e é o limite da forma, não da regra).

Revisão independente de 2026-10-14 (v2, v3 e v4 aprovadas; nenhum item abaixo reprova):

- `v2_nao-comparecimento-acima-de-15`: a fatia acesa em `--chart-1` e o resto em `--text-muted` medem 1,82:1 entre si no escuro e 1,12:1 no claro (TOK-9). A identificação se sustenta pelo contorno de 2 px, pela posição às 12 horas, pelo tamanho e pelos números escritos, mas o par marca contra marca não está no `notes`, como a saída da TOK-9 pede.
- `v2_nao-comparecimento-acima-de-15`: "Sem 1" a "Sem 4" abreviam semana (ROT-8), e "Sem 2" também se lê como "sem dois"; a coluna tem largura para "Semana 2". O rótulo vem do mesmo padrão da `v1`.
- `v2_nao-comparecimento-acima-de-15`: "21 compareceram ou remarcaram" não leva o substantivo da contagem (NUM-6); "21 agendas realizadas ou remarcadas" diria a unidade.
- `v2_nao-comparecimento-acima-de-15`: o percentual da fatia acesa vai em `--chart-1`, e a 17.1 dá `--text-secondary` (destacado em `--text-primary`) ao rótulo de valor. Passa o piso de texto (9,50:1 no escuro, 6,00:1 no claro), mas a 17.10 lista esse par só como marca. A anotação "acima do limite de 15%" está em Manrope sem `tabular-nums` (TIP-1).
- `v2_nao-comparecimento-acima-de-15`: no ramo da semana sem agenda (`share` nulo) o corpo escreve só a contagem `0`, sem `formatUnavailable()` no lugar da taxa e com a pizza em branco; o dado fixo não exercita o ramo.
- `v3_completude-de-campos-por-plataforma`: os nomes de coluna (Origem, Porte, Telefone, Cargo) saem em 11 px `--text-muted`, e a 17.1 dá 12 px `--text-secondary` a rótulo de categoria; legíveis nos dois temas, sem consequência no render.
- `v3_completude-de-campos-por-plataforma`: os números da linha de leitura ("5 de 12 células abaixo de 50%", "18%") estão em Manrope sem `tabular-nums` e no mesmo peso e cor do resto da frase (TIP-1; a 17.1 pede nomes e números em 500 ou 600 e `--text-primary`).
- `v3_completude-de-campos-por-plataforma`: a parte vazia de cada anel não tem nome próprio; a ROT-10 fecha porque "X de Y" declara o todo e o centro escreve a fração. Quem trocar o formato da contagem precisa manter o denominador escrito.
- `v4_origem-por-sdr-com-amostra-pequena`: o subtítulo, que é o caso de uso do catálogo, diz "entre SDR 01 e SDR 04 quando uma delas recebeu só 6 leads", e quem recebeu 6 é SDR 03. Lido como intervalo (de 01 a 04) fecha; lido como duas pessoas, contradiz o desenho. Reescrever no catálogo e no `meta.json` como "entre as quatro pessoas da pré vendas".
- `v4_origem-por-sdr-com-amostra-pequena`: `--text-muted` faz dois papéis no mesmo visual, preenchimento da pizza de amostra pequena e contorno da ausência (17.2, um token por papel). A forma separa (cheio contra vazado) e o selo explica, então não há leitura falsa no render; um neutro distinto no preenchimento tiraria a sobreposição.
- `v4_origem-por-sdr-com-amostra-pequena`: o texto da legenda e os valores das colunas saem em 11 px, e a 17.1 dá 12 px à legenda e 14 px ao valor de legenda; legíveis nos dois temas.
- `v4_origem-por-sdr-com-amostra-pequena`: a frase acessível descreve o desenho e o estado da amostra, mas não diz nada da composição, que é a pergunta do caso de uso (ACE-1); caberia a origem que lidera, por exemplo "Mídia paga lidera em SDR 02, com 48%".
- `v4_origem-por-sdr-com-amostra-pequena`: o selo diz "amostra pequena" sem o "n=6" que o catálogo pede; o n está no cabeçalho da coluna ("6 leads"), então a informação existe na tela.
