# Q-Q plot

## O que é

Quantis observados contra os quantis de uma referência, que pode ser uma distribuição teórica ou outra amostra. Cada ponto compara o valor que ocupa uma posição da fila ordenada com o valor que a referência teria na mesma posição. Pontos sobre a diagonal dizem mesma forma, e o afastamento sistemático diz onde a forma difere: cauda mais longa, teto, assimetria. A geometria é de dispersão, mas a pergunta é de distribuição. Sai do `ScatterChart` do Recharts com `ReferenceLine` em segmento para a diagonal, plano quadrado com o mesmo domínio nos dois eixos e o inverso da normal aproximado em TypeScript. É peça de público técnico e de conferência de premissa.

## Quando usar

- Conferir se a premissa de forma do simulador de cenários descreve o dado medido (`v1`).
- Comparar a forma de duas amostras, como dois anos, com quantis interpolados na mesma grade (`v2`).
- Diagnosticar teto, piso ou truncamento vindos do sistema de origem (`v3`).
- Amostras a partir de umas 20 observações para o desenho existir e de umas 50 para ele convencer, em público técnico.

## Quando evitar

- Painel executivo ou público que nunca viu um Q-Q: histograma com estatística anotada (modelo 01) ou ECDF (modelo 04).
- Pergunta de cauda extrema com a aproximação simples do inverso da normal: troque a função e confira contra tabela antes.
- Relação entre duas variáveis diferentes: dispersão, na família 09.
- Comparar grupos por resumo: box plot com pontos (modelo 02).

## Anatomia

1. **Função de quantis**: `qqNormal` ordena o dado, aplica a posição de plotagem (i + 0,5) / n e devolve `null` com poucas observações ou sem variação (EST-1b). Na `v2`, `qqTwoSamples` interpola as duas amostras numa grade comum de 50 probabilidades, nunca por índice.
2. **Inverso da normal** em TypeScript (aproximação racional de Acklam, erro relativo abaixo de 1,2e-9 no miolo), sem biblioteca. Para cauda extrema, confira contra tabela.
3. **Plano quadrado** com o mesmo domínio e os mesmos ticks nos dois eixos, grade nos dois sentidos (EIX-3b) em `GRID_COLOR`. O quadrado vem da conta de margens (largura do eixo Y mais margem direita contra margem de cima, eixo X e margem de baixo) e do `aspect-square` do contêiner.
4. **Diagonal** em `ReferenceLine` com `segment`, `ifOverflow="extendDomain"`, `--text-muted` tracejado de 1,5 px.
5. **Pontos**: miolo em `--text-muted` como círculo, e o que carrega a mensagem (cauda ou teto) em `--chart-1` como losango maior. O `ZAxis` tem duas pontas iguais em cada série (REC-15, REC-31).
6. **Anotação** em camada própria (`ZIndexLayer` 450, `usePlotArea`), no canto que o desenho deixa vazio, com halo de `--surface-raised`.
7. **Tique** com a unidade escrita (`formatDays`, `formatPercent`) e `interval={0}`; a `v1` usa escala logarítmica com degraus de 10, 30, 90 e 270 dias.
8. **Dica** com `ChartTooltip`: valor medido, valor esperado e percentil, que o corpo do desenho não escreve.
9. **Rodapé** com o que ficou fora da leitura (casos no teto na `v3`) e o que cada eixo mede.
10. **Estados**: vazio com `Filter` e indisponível com `Unplug` e `formatUnavailable()`.

## Versões

- `v1_ciclo-contra-lognormal`: ciclo de fechamento de 120 negócios contra a lognormal ajustada. Demonstra `qqNormal` sobre o log do ciclo, o plano quadrado com o mesmo domínio nos dois eixos, a diagonal em `ReferenceLine segment` e a anotação da cauda que se afasta.
- `v2_tempo-ate-agenda-em-dois-anos`: tempo até a agenda em 2025 (140 reuniões) contra 2026 (95). Demonstra o Q-Q de duas amostras com quantis interpolados na mesma grade, o emparelhamento que nunca é por índice, os pontos da cauda em destaque e o n de cada ano.
- `v3_atingimento-com-teto`: atingimento de meta de 96 executivos com teto de 150%. Demonstra o patamar horizontal no topo, a `ReferenceLine` no teto com a nota que atribui o desvio a ele, os casos no teto contados no rodapé e a diagonal mantida para o miolo (normal ajustada por mediana e IQR).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página.
2. Troque o `import` do `./data` pelo dado real, já filtrado: uma observação por negócio, reunião ou executivo, em dias ou em fração da meta.
3. Ajuste os degraus dos eixos (`DAY_LADDER` na `v1`, `DAY_STEP` na `v2`, `TICKS` e `CEILING` na `v3`) para a faixa real. Domínio fixo evita que o plano mude de forma a cada filtro, e os dois eixos têm sempre o mesmo domínio.
4. O plano só é quadrado se o contêiner tiver altura: coloque o componente num pai com altura definida ou passe `height`. Se o cartão da página não for quadrado, o plano fica centrado e menor que o corpo.
5. Na `v3`, troque `CEILING` pelo teto real do sistema de origem; sem teto, a `ReferenceLine` e a nota saem.
6. A camada de anotação é um componente local que só funciona dentro do `ScatterChart`, porque usa `usePlotArea`. Mantenha a ordem dos filhos: referências antes dos `Scatter`, anotação depois.
7. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Claus Wilke, ECDF e Q-Q plots (espelho do livro): https://f0nzie.github.io/dataviz-wilke-2020/ecdf-qq.html, o exemplo do teto de 100 pontos e o alerta sobre público. O endereço original não abriu na pesquisa.
- Peter Acklam, aproximação racional do inverso da distribuição normal, a função usada em `v1` e `v3`.
- Recharts, `ScatterChart`, `ReferenceLine` e `ZAxis`; no Farol, `app/src/components/visuals/charts/chartTheme.ts` e `ChartTooltip.tsx`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, as três versões aprovadas. Nenhum item abaixo muda o que o desenho afirma com o dado padrão.

- `v1`, `v2`, `v3`: o plano mede 202 px de lado num cartão de 480 px, porque `MARGIN.top` e `MARGIN.bottom` somam 60 px vazios só para fechar a conta do quadrado (GEO-1). Dá para devolver esse espaço ao plano reduzindo as duas margens e a margem direita na mesma medida.
- `v1`, `v2`, `v3`: a anotação usa `--text-primary` em peso 600 (700 no rótulo do teto da `v3`), e a ANO-2 pede `--text-muted`. A diagonal usa traço `4 4` de 1,5 px, e a tabela 17.2 pede `3 3` de 1 px para referência. Sem consequência no preview.
- `v1`: `dayTicks` cai no degrau de 10 dias quando o menor quantil esperado fica abaixo dele (9,9 dias no dado padrão). O Recharts então estende só o domínio do eixo X, e os dois eixos deixam de ter o mesmo domínio: 0,54 px no preview, invisível, mas cresce com outro recorte. Incluir um degrau abaixo de 10 na `DAY_LADDER` ou prender o domínio.
- `v1`: o negócio de 12 dias fica 0,19 no log acima do esperado, mais que o `TAIL_GAP` de 0,12, e é pintado como miolo, porque a cauda só é procurada no topo. A frase acessível diz "o miolo segue a diagonal" sem essa ressalva.
- `v1`: a frase acessível diz que 4 negócios "ficam acima" da diagonal sem dizer o limiar; os de 108 e 117 dias também estão acima, abaixo do limiar.
- `v1`: comentário da `DAY_LADDER` termina em "regular, ." (redação).
- `v2`: a frase acessível diz "10 dos 50 percentis ficam acima da diagonal, todos na cauda", e o recálculo acha 18 acima da diagonal: 8 ficam fora do destaque por estarem abaixo do percentil 75 (`TAIL_FROM`) ou abaixo do limiar de 10%. Quatro deles (percentis 55, 67, 69 e 73) cumprem o limiar de distância e só caem pela posição. Reescrever para "10 passam de 10% acima" ou baixar o `TAIL_FROM` para onde o desvio começa.
- `v2`: a nota escreve os números do percentil 99 (18 contra 36 dias) e não a conclusão que o catálogo cita, "a cauda ficou mais longa". A conclusão fica para o leitor.
- `v2`: as duas linhas do rodapé têm número (2025, 2026, 50, 2%) sem `tabular-nums` (TIP-1). Sem diferença visível no preview.
- `v2`: o rodapé monta "2%" com `formatInt` mais o sinal à mão, e não com `formatPercent`.
- `v2`: a amostra da legenda chama o círculo de "percentil", e o losango também é percentil. "percentil no miolo" separa melhor.
- `v2`: "n 2025" e "n 2026" na legenda são abreviação (ROT-8); "reuniões em 2025" cabe na linha.
- `v2`: o dado em dias inteiros faz os 40 percentis do miolo caírem em 18 posições distintas, espremidas no quarto inferior esquerdo de um domínio de 0 a 40 dias. Escala logarítmica nos dois eixos, como na `v1`, abriria o miolo sem perder a diagonal.
- `v3`: a nota "o desvio no topo vem do teto, não da forma" e a linha do teto são desenhadas mesmo quando nenhum executivo chega ao teto. Nesse ramo a frase acessível diz "nenhum chegou ao teto" e o desenho diz o contrário. Condicionar a nota a `capped.length > 0`.
- `v3`: o dado fictício estica o atingimento antes do teto, e os seis últimos pontos do miolo (de 132% a 149%) ficam de 3 a 13 pontos percentuais acima da diagonal. A nota atribui todo o desvio do topo ao teto, e essa subida é de forma. Reduzir o `STRETCH_SLOPE` do `data.ts` ou dizer na nota que ela fala do patamar.
- `v3`: domínio fixo de 0% a 200% nos dois eixos; quantil esperado fora dessa faixa (o maior hoje é 178%) ficaria fora do plano em outro recorte. O README já manda ajustar `TICKS`, e vale calcular o teto do domínio do dado.
- `v3`: a linha do teto é sólida em `--text-secondary` de 1,5 px, fora do traço de referência da 17.2. A escolha separa o teto da diagonal tracejada, e fica registrada como desvio consciente.
