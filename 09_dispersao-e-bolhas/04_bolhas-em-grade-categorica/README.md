# Bolhas em grade categórica

## O que é

Os dois eixos são categorias ordenadas, dia útil e hora cheia, por exemplo, e uma bolha centrada em cada cruzamento dá o volume pela área. É o punch card de dia por hora e o dot plot em matriz categórica: ocupa menos tinta que o mapa de calor e deixa a cor livre para uma segunda medida. A regra que sustenta o modelo é separar zero medido, sem expediente e sem ocorrência, cada um com o próprio desenho.

## Quando usar

- Volume por dia útil e hora cheia, como agendas marcadas ou respostas de lead.
- Contagem por duas categorias de negócio, como motivo de perda por etapa do funil.
- Matriz esparsa, em que a célula cheia do mapa de calor pesaria demais.
- Tamanho para volume e cor sequencial para uma taxa da mesma célula, com as duas legendas.

## Quando evitar

- Pergunta só de onde concentra, com matriz densa: use mapa de calor (família 15), que lê melhor em menos espaço.
- Eixos quantitativos contínuos: use bolhas (modelo 03) ou densidade 2D (modelo 09).
- Mais de cerca de 20 categorias num eixo: agrupe ou quebre em pequenos múltiplos.
- Comparação precisa de valores entre células: escreva o número ou use tabela visual (família 14).

## Anatomia

1. Eixo X categórico (hora cheia, etapa do funil) e eixo Y categórico (dia útil, motivo de perda), com `type="category"` nos dois, todas as categorias impressas (`interval={0}`) e sem rotação de texto. Os dois eixos levam `allowDuplicatedCategory={false}`, senão cada linha do dado abre uma banda nova (REC-14).
2. A ordem das categorias vem da ordem de primeira ocorrência no array que alimenta a série, nunca da ordem alfabética. O eixo Y do Recharts desenha a primeira linha do array embaixo, então o array entra invertido em relação à leitura: sexta antes de segunda na v1, v2 e v4, menor total antes de maior total na v3 (REC-3).
3. Uma série só por peça, com a grade inteira, e a diferença entre estados resolvida no `shape`. Quebrar em uma série por estado ou reordenar por valor troca a ordem das categorias pela ordem dos volumes, porque o domínio de um eixo de categoria sai da ordem do dado. Numa grade categórica não há o que reordenar por cima: duas marcas nunca dividem a mesma posição, então a REC-13 não se aplica aqui.
4. `ZAxis` com `dataKey` do volume, `domain` a partir de zero e `range` em área entre `AREA_MIN` e `AREA_MAX`, os dois derivados de um raio mínimo e um máximo declarados. A conta de raio é `sqrt(area / π)`, que é a forma fechada que a GEO-3 pede; a peça repete a mesma função na marca e na legenda, para as duas nunca divergirem.
5. Bolha em cor cheia (`--chart-1`) com contorno de 1 px na cor do cartão (`--surface-raised`), que separa cruzamentos vizinhos sem mexer no contraste do preenchimento (COR-5). Sem `fillOpacity`: medido, `--chart-1` a 0,7 cai para 3,25:1 no tema claro, perto demais do piso de 3:1 da ACE-5.
6. Grade só na direção horizontal (`CartesianGrid vertical={false}`), separando as linhas; a coluna já se lê pelo tique do eixo. A exceção da EIX-3b não vale aqui, ver a colisão declarada abaixo.
7. Legenda de tamanho abaixo do gráfico, com círculos calculados pela mesma conta de raio do `ZAxis`: referências redondas abaixo do máximo e, na última posição, o maior cruzamento do próprio recorte, para a maior bolha da tela ter régua (ROT-5b).
8. Estado que não é volume entra com forma própria e nome escrito: faixa retangular com texto na v2, anel tracejado e traço com amostra na legenda na v4. A forma é o canal que separa, e não a cor, porque nenhum neutro do Farol alcança 3:1 contra o cartão.
9. Dica própria (`ChartTooltip`) com as duas categorias e o valor exato, porque a área é a pior lida das medidas.
10. Linha de leitura acima do gráfico, calculada do dado, e nota de rodapé com o que saiu do desenho: cruzamento com zero medido, hora sem apuração, distorção do piso de área.

## Versões

- `v1_agendas-por-dia-e-hora`: agendas marcadas pela pré-vendas no trimestre, de segunda a sexta, das 8h às 19h. Demonstra `ScatterChart` com os dois eixos em categoria e ordem fixa, `ZAxis` com domínio a partir de zero e piso de área para o valor 1, legenda de tamanho que termina no maior cruzamento do recorte e todas as categorias impressas sem rotação.
- `v2_melhor-janela-de-comparecimento`: janela de terça a quinta, das 10h às 12h, marcada por uma faixa com fundo de superfície rebaixada e texto que diz o que ela marca. Demonstra a faixa categórica desenhada a partir das bordas das células pelas escalas dos eixos, a taxa de comparecimento escrita com o volume dentro e fora da janela, e as bolhas de fora mantidas em neutro cheio.
- `v3_motivo-de-perda-por-etapa`: 14 motivos de perda por 6 etapas do funil, com totais marginais nas bordas. Demonstra motivos ordenados pelo total com o maior no topo, etapas na ordem do funil, uma camada própria que alinha os totais pelas escalas dos dois eixos, o mesmo domínio de `ZAxis` em toda a matriz e `shape` que tira do desenho o cruzamento com zero medido.
- `v4_zero-contra-sem-expediente`: contatos da pré-vendas por dia e hora, de 6h a 19h, com sábado e as horas antes das 8h fora do expediente. Demonstra os três estados desenhados (volume em bolha cheia, zero medido em anel tracejado, sem expediente em traço), o quarto estado sem desenho (hora aberta sem apuração, contada no rodapé), a legenda com amostra na própria forma da marca e o piso de área declarado com a distorção medida do dado.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/ScheduleBubbleGrid/`.
2. Troque o `import` do `./data` pelo dado real da página, já ordenado na ordem em que as categorias devem sair nos eixos; o componente não reordena categoria, só a v3 reordena, e por total.
3. Ajuste `LEGEND_REFERENCES` para valores redondos da ordem de grandeza do volume real; a última posição da legenda já é o máximo do recorte e não precisa de manutenção.
4. Confira `RAIO_MAX` contra o passo entre linhas do seu cartão: o diâmetro máximo precisa caber no passo com respiro, e quem cede é a altura do canvas, nunca o piso de 11 px do texto (GEO-1).
5. Na v2, a janela vem por prop (`highlightDays`, `highlightHours`) e precisa cobrir pelo menos duas categorias em cada eixo; com uma só categoria num eixo, use a categoria anterior e a seguinte como bordas (REC-24).
6. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-72">`) ou passe `height`.
7. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, Bubble Chart](https://recharts.github.io/en-US/examples/BubbleChart/): observar os sete gráficos empilhados, um por dia.
- [ECharts, scatter on single axis](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/scatter-single-axis.ts): observar um eixo único por dia e o tamanho pelo valor.
- [AG Charts, bubble with categories](https://www.ag-grid.com/charts/gallery/bubble-with-categories/): observar os dois eixos categóricos e `minSize`/`maxSize`.

## Colisões entre a especificação do catálogo e o CONTRATO

Todas resolvidas a favor do CONTRATO, e as mesmas ficam escritas na nota do `meta.json` de cada versão.

- **Grade nos dois sentidos, nas quatro versões.** A leva anterior deste modelo e as notas das versões vizinhas de `03_bolhas` escrevem que a família 09 cai na exceção que pede grade nos dois sentidos. A emenda de 2026-09-28 reescopou a exceção, que virou `EIX-3b`, **por geometria e não por número de família**: ela vale quando os dois eixos são quantitativos e a marca é lida por posição nos dois. Aqui os dois eixos são categoria, então vale a `EIX-3` como está escrita, com grade só na direção da leitura. A observação que a revisão da v1 tinha deixado em aberto fica respondida por esta emenda.
- **`ReferenceArea` categórica na v2.** A especificação pede a faixa por `ReferenceArea`. Medido no render, com `x1`, `x2`, `y1` e `y2` nas quatro categorias das pontas, o retângulo que chegava ao `shape` não coincidia com as células da janela: a faixa saiu cobrindo só a linha do meio das três do eixo de dia. A geometria passou a sair das escalas dos eixos (`useXAxisScale`, `useYAxisScale` com `position: 'start'` e `'end'`), que é a mesma técnica de camada própria que o resto da família usa para casco e rótulo. O encoding é regra que bloqueia sempre (14.1), então ele vence a técnica nomeada na especificação.
- **Zero medido sem marca na v3 e na v1.** A `EST-3` manda o zero medido desenhar a marca e escrever 0. Nas duas o zero não recebe bolha e é contado por escrito no rodapé, porque com piso de área o zero desenha uma bolha do tamanho do piso e passa a ler como volume; a v1 já tinha feito essa escolha na correção de 2026-09-25 e a v3 a repete. A v4 mostra a outra saída, que é a do modelo: ali o zero medido ganha forma própria, o anel tracejado, e aí ele pode voltar ao desenho sem mentir.
- **Dois estados de ausência no mesmo token na v4.** A saída da `TOK-1` manda dar `--surface-sunken` a um estado de ausência e `--line-strong` ao outro. Medido, os dois ficam abaixo do piso de 3:1 da `ACE-3` (1,15:1 e 1,79:1 no escuro, 1,15:1 e 1,83:1 no claro), então os dois estados ficam em `--text-muted`, que mede 5,21:1 e 5,37:1, e quem separa é a forma, anel contra traço.
- **Canvas por número nas três versões novas.** O preset sugerido pelo catálogo não fecha em nenhuma delas depois de contar as linhas escritas do cartão (GEO-1). As contas estão nas notas: 960x460 na v2, 820x680 na v3, 960x520 na v4.

## Observações da revisão (não bloqueantes)

- `v1_agendas-por-dia-e-hora`: o tique do eixo X ("08h") não recebe algarismo tabular (TIP-1). A v2 e a v4 resolvem isso passando `tick={{ ...AXIS_PROPS.tick, className: 'font-display' }}` no eixo de hora, e a v1 pode receber o mesmo tratamento na próxima vez que o arquivo for tocado.
- `v1_agendas-por-dia-e-hora`: a função de raio devolve `0` no ramo sem denominador, e a guarda `AGREGACAO-ZERO` avisa nela. As três versões novas evitam o aviso porque o estado vazio garante o denominador antes da chamada, e o ramo do denominador zero deixou de existir.
- `v1_agendas-por-dia-e-hora`: o piso `AREA_MIN = 12` infla o menor valor. Uma agenda desenha cerca de 39,8 px² onde a proporção pura daria 28,1 px², cerca de 41% a mais. É compromisso declarado no item 4 da Anatomia, e vale escrever ali o tamanho do desvio.
- `v1_agendas-por-dia-e-hora`: a legenda de tamanho fica abaixo do gráfico e a ROT-4 escreve "acima ou ao lado". É a convenção de legenda de tamanho e vale para as quatro versões; a divergência fica registrada aqui.
- `v1_agendas-por-dia-e-hora`: os números da legenda vêm sem o substantivo em cada um, resolvidos pelo rótulo "Agendas" do grupo, no limite da NUM-6. Vale para as quatro versões.
- `v1_agendas-por-dia-e-hora`: o valor exato de cada cruzamento só existe na dica. A área é a pior lida das medidas, e a linha de leitura resolve apenas o pico; num cartão impresso ou lido por teclado, o resto da matriz fica em ordem de grandeza. A v3 ataca parte disso com os totais marginais escritos, que dão a soma de cada linha e de cada coluna sem interação.
- `v2_melhor-janela-de-comparecimento`: o texto que nomeia a faixa mora na margem de cima do plano, alinhado ao centro das colunas da janela, e não encostado na borda da faixa. A razão é geométrica e foi medida: toda borda da faixa cai no meio do vão entre duas linhas, e o vão inteiro tem cerca de 15 px livres entre a bolha vizinha e a borda, que uma frase de 11 px ocuparia por completo. O custo é que o texto fica a uma linha de distância da faixa que ele nomeia.
- `v2_melhor-janela-de-comparecimento`: a faixa mede 1,15:1 de preenchimento e 1,79:1 de contorno contra o cartão, abaixo do piso de 3:1. É a lacuna conhecida dos neutros do Farol, e a peça compensa com três canais que não dependem dela: a cor das bolhas de dentro, o texto que nomeia a faixa e a taxa escrita na linha de leitura.
- `v3_motivo-de-perda-por-etapa`: a palavra "total" aparece duas vezes, uma na cabeça da linha de totais por etapa e outra na cabeça da coluna de totais por motivo. É a convenção de tabela cruzada e nomeia as duas bandas (GEO-13), mas alguém pode ler a segunda como rótulo da linha em vez da coluna.
- `v3_motivo-de-perda-por-etapa`: o passo entre linhas é de cerca de 30 px e o diâmetro máximo de bolha é 24 px, o que deixa 6 px entre duas bolhas máximas vizinhas. Nenhuma delas se toca no dado publicado, porque o máximo de 24 aparece uma vez só, mas a folga é pequena e um recorte com dois máximos em linhas vizinhas apertaria a leitura.
- Onde as guardas se calaram nas três versões novas, e o que foi medido à mão no lugar delas. `FORMATO-ACESSIVEL` sai como `frase_sem_formatador` nas três, porque a frase acessível é montada a partir de constantes nomeadas e o leitor da guarda segue só um salto a partir do `aria-label`. A divergência que ela procura não existe aqui por construção, e isso é mais forte do que o que ela mediria: a frase e o corpo não repetem chamadas parecidas, eles leem a MESMA constante, então o número sai com a mesma aparência para quem ouve e para quem enxerga. `ESPESSURA-MARCA` sai sem medir nas quatro versões, porque o piso geral dela é o outro lado do `maxBarSize` e aqui não há `<Bar>`, e porque nenhuma marca tem rótulo escrito por dentro. `CONTRASTE-MARCA` mede as três novas e não acusa nada; ela não mede a v1, por causa do `transform` no preview daquela versão.
- `v4_zero-contra-sem-expediente`: o piso de área de 5 px de raio distorce bastante, e o rodapé declara: 2 contatos valem 6,9% do máximo e desenham 18,8% da área. O piso não pode encolher porque precisa ficar acima do anel de zero, então quem quiser menos distorção troca o anel por uma forma menor, não o piso.
