# Barras empilhadas 100%

## O que é

Cada barra vai de 0% a 100% e mostra a proporção de cada componente dentro da categoria, não o volume absoluto. O ganho é ter duas linhas de base sólidas, a do zero e a do cem, então o primeiro e o último segmento da pilha se comparam bem entre categorias mesmo quando o total de cada uma é diferente. O percentual de cada segmento fica escrito nele quando cabe, e o n absoluto da categoria fica escrito à parte, porque uma barra de 3 casos preenche 100% da largura tão bem quanto uma de 300; sem o n a régua engana. O caso degenerado do modelo é a barra única: uma faixa só, dividida em segmentos, útil como resumo de composição num cabeçalho ou card de KPI.

## Quando usar

* Proporção dentro de cada categoria quando o tamanho absoluto não é a pergunta: mix de origem por segmento de conta, motivos de perda por executivo.
* De 2 a 5 componentes por barra e de 2 a cerca de 15 categorias; acima disso a pilha fica fina demais para rótulo.
* Comparar o primeiro ou o último componente entre categorias, apoiado nas duas linhas de base (a fatia de "sem fit" de um executivo contra a de outro, por exemplo).
* Composição de um total único numa faixa estreita de cabeçalho, com os menores componentes agregados em "outras".

## Quando evitar

* O total importa tanto quanto a proporção: prefira barras empilhadas absolutas (`03_barras-empilhadas`).
* Categorias com n muito diferente e sem espaço para escrever o n: tabela com composição inline.
* Escala ordinal com polos em que o equilíbrio entre lados é a leitura (concordo/discordo): divergente empilhada Likert (`08_divergente-empilhada-likert`).
* A espessura da própria barra também deveria codificar volume: mosaico marimekko.
* Parte de um todo com poucas fatias e público que espera fatia redonda: rosca ou waffle.

## Anatomia

1. Linha de leitura opcional no topo, calculada do dado: quem lidera ou o intervalo entre extremos na fatia de referência (CONTRATO, ANO-5).
2. Legenda em linha, com amostra na cor de cada componente e a ausência marcada por contorno vazado, sempre por último (ROT-4, COR-4).
3. Eixo de categoria à esquerda em Manrope 12 px; tique de percentual só nas duas linhas de base e no meio (`[0, 0.5, 1]`), formatado por `formatPercent`.
4. Pilha com `stackOffset="expand"`: o percentual de cada segmento é recalculado no dado pelo maior resto (`largestRemainder`), porque o `expand` só normaliza o desenho e o rótulo receberia o valor absoluto.
5. Segmento com vão de 2 px dos vizinhos (COR-5) e cantos levemente arredondados; ausência de dado sai vazada, contorno em `--line-strong` ou `--text-muted`, nunca preenchida.
6. Rótulo de percentual centrado no segmento, em `--accent-cyan-contrast` sobre cor e suprimido quando o segmento não comporta o texto (`labelFits`), nunca cortado.
7. Coluna do n à direita da barra, fora da pilha, em formato inteiro (`formatInt`) com o substantivo da contagem.
8. Estado de n baixo com opacidade reduzida e selo textual; total zero escreve "sem casos"; ausência de coleta escreve "indisponível"; nenhum dos dois desenha segmento cheio.

## Versões

* `v1_mix-de-origem-por-segmento`: mix de origem dos leads por segmento de conta (pequenas, médias, grandes). Demonstra `stackOffset="expand"` com tique de percentual pelo formatador do Farol, percentual calculado no dado pelo maior resto, n absoluto numa segunda coluna de eixo, ordem natural dos segmentos preservada e a origem ausente vazada por último.
* `v2_motivos-de-perda-por-executivo`: motivos de perda por executivo, caso denso com doze pessoas. Demonstra a ordenação das barras pela fatia do motivo da base, rótulo de percentual centrado no segmento em texto de contraste, supressão do rótulo quando o segmento é estreito, o n escrito como "n = 214" e a fatia do time inteiro como linha de referência anotada.
* `v3_barra-unica-investimento-do-mes`: investimento do mês por plataforma numa faixa de cabeçalho. Demonstra o caso degenerado da família em HTML com Tailwind (sem Recharts), largura de segmento por percentual com vão fixo, top 3 com fatia própria e o restante agregado em "outras", soma fechada em 100% pelo resto do arredondamento no último segmento, e total em moeda compacta ao lado do título.
* `v4_n-baixo-e-sem-casos`: composição de perdas por squad no caso limite. Demonstra squad com n abaixo de 10 em opacidade reduzida e selo "n baixo", squad medido com total zero escrevendo "sem casos" sem dividir por zero, squad sem coleta escrevendo "indisponível" separado do zero medido, e o cálculo de estado e opacidade feito inteiramente no seletor (`toRows`), nunca no `shape`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/OriginMixBars/`.
2. Troque o `import` do `./data` pelo seletor real da página, passando `data` (e `components`/`reasons`, quando a versão os expõe) pela prop; o default do `data.ts` só serve para o catálogo.
3. Nas versões em pilha (v1, v2, v4), reserve altura no pai proporcional ao número de categorias (uma linha por barra mais a legenda); na barra única (v3), a moldura `stage` já cabe numa faixa de cabeçalho sem `VisualCard`.
4. Ao ligar dado real, preserve os três estados de contagem (medido, zero, sem coleta) e o piso de n baixo: são eles que impedem a barra de mentir quando o volume é pequeno.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

* [Vega Lite, barra horizontal normalizada com rótulos](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html): observar o rótulo centrado no segmento.
* [ECharts, normalização de pilha (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-stack-normalization.ts): observar a normalização feita no dado, antes do gráfico.
* [Storytelling with Data, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars): observar a vantagem das duas linhas de base e a recomendação de rotular direto e limitar segmentos.
* [Recharts, BarChart API](https://recharts.github.io/en-US/api/BarChart/) e [Tremor, BarChart](https://tremor.so/docs/visualizations/bar-chart): observar `stackOffset="expand"` e `type="percent"`.
* [Tremor, CategoryBar](https://www.tremor.so/docs/visualizations/category-bar): observar a entrada de 0 a 100, o marcador que some quando o valor é zero e a cor do marcador herdada do segmento.
* [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html): observar que a barra única é o caso degenerado da empilhada, com uma categoria só.
* Farol: `app/src/components/visuals/charts/BarsChart.tsx` (orientação horizontal e composição em pilha).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-17, reconferida em 2026-09-18 por revisor independente: as quatro versões seguem sem bloqueante, com `npm run check` em 0 com erro, 0 aviso e os dois temas olhados no PNG._

* `v1_mix-de-origem-por-segmento`: o percentual da fatia de ausência só aparece em Pequenas contas (9%); em Médias (10%) e Grandes (8%) o `labelFits` suprime, e a última fatia fica com leitura desigual entre as três barras.
* `v1_mix-de-origem-por-segmento`: os tiques de 0%, 50% e 100% convivem com o valor escrito em cada segmento; a ROT-2 dispensaria o eixo, ainda que as duas linhas de base ajudem a comparar entre barras.
* `v2_motivos-de-perda-por-executivo`: a ausência de 1% e de 2% (Caio F. e Heitor M.) vira um contorno de cerca de 2 px na ponta da barra, que à primeira vista parece um caractere solto e não uma fatia.
* `v2_motivos-de-perda-por-executivo`: o piso de altura que resolveu a colisão do rótulo com o contorno deixa a fatia de ausência sem percentual escrito em toda barra; o número dela vive só na proporção desenhada.
* `v2_motivos-de-perda-por-executivo`: a ordenação pela fatia da base põe no topo quem tem 19 perdas contra 214 do maior; a linha de leitura declara o volume, o que sustenta a escolha, mas a primeira olhada ainda é de ranking.
* `v3_barra-unica-investimento-do-mes`: o arredondamento é piso nos três primeiros e resto no último, e não o maior resto da NUM-2, então "Outras" imprime e desenha 15% onde o dado dá 13,7%, e Redes sociais imprime 28% onde daria 29%.
* `v3_barra-unica-investimento-do-mes`: a fatia agregada "Outras (3)" usa contorno tracejado, que nas outras versões do modelo é o desenho reservado à ausência; vale um segundo sinal que separe agregação de falta de dado.
* `v3_barra-unica-investimento-do-mes`: no tema claro o tracejado de "Outras" é `--line-strong`, que mede 1,83:1 contra o cartão; quem segura a leitura é o percentual escrito ao lado, na legenda.
* `v3_barra-unica-investimento-do-mes`: a soma das larguras dá 100% mais os 6 px dos três vãos dentro de um contêiner com `overflow-hidden`, então a ponta do último segmento perde alguns pixels e o tracejado fica aberto à direita.
* `v4_n-baixo-e-sem-casos`: a marca em opacidade 0,5 da linha de n baixo mede 3,35:1 no tema escuro e 2,23:1 no claro contra o cartão; o selo "n baixo" e o `n = 3` carregam o sentido, e nenhum texto ficou sobre ela, mas a marca em si fica abaixo do piso da ACE-3.
* `v4_n-baixo-e-sem-casos`: com o rótulo suprimido na linha de n baixo, a composição do Squad Cedro só se lê pela geometria e pela legenda; nenhum percentual dela fica escrito.
* `v4_n-baixo-e-sem-casos`: o texto já sai de `formatUnavailable()` (a observação anterior, de texto literal, foi corrigida), mas segue sem o ícone `Unplug` que a EST-2 pede ao lado da palavra; dentro do SVG do Recharts o ícone lucide não entra sem contorno próprio.

_Acrescentado na reconferência de 2026-09-18:_

* `v4_n-baixo-e-sem-casos`: a linha "sem casos" e a linha "indisponível" ficam sem o `n` à direita, porque `renderCount` devolve vazio nos dois estados; em Squad Dourado o zero medido é informação e caberia escrito como `n = 0`.
* `v1_mix-de-origem-por-segmento`: o `n` sai como `412 leads` e nas irmãs v2 e v4 sai como `n = 214`; as três são legíveis, mas quem colar as duas na mesma tela vai ver dois jeitos de escrever a mesma coluna.
* `v2_motivos-de-perda-por-executivo`: a legenda usa `mb-1` contra o `mb-3` de v1 e v4, então a faixa entre a legenda e a primeira barra encurta cerca de 8 px no caso mais denso do modelo.
