# Barras contra meta

## O que é

Uma barra de realizado lida contra uma referência própria da mesma linha (meta, teto ou forecast comprometido), sempre na mesma banda horizontal. A meta pode aparecer como uma segunda barra larga e clara atrás da barra fina do realizado, como um traço perpendicular mais leve que a barra, ou como o valor normalizado em percentual da própria meta quando as linhas medem coisas de unidades diferentes. Em qualquer uma das três formas a leitura é a mesma: quem passou da referência, e por quanto.

## Quando usar

* Cada categoria tem a sua própria meta, teto ou forecast: receita por executivo contra meta individual, entradas por fila contra capacidade própria.
* Posição contra meta em lista, com todas as linhas na mesma escala absoluta ou normalizadas em percentual da meta.
* De 3 a cerca de 20 linhas; com mais linhas, ordenar pelo percentual de atingimento e não pelo nome.
* Indicadores de unidades diferentes (reais, contagem, percentual) que precisam compartilhar uma leitura só contra a própria meta.
* Público que precisa ver quem passou da meta e por quanto sem ler uma segunda série de barras ao lado.

## Quando evitar

* Uma medida só, como assunto do cartão inteiro: use régua de meta em KPI (família 01) ou barra de progresso (família 13).
* Ocupação de 0% a 100% contra um teto sem meta intermediária: barra com trilho (família 13) é mais direta.
* Duas medidas sem relação de referência entre si: barras agrupadas (modelo 02) comparam sem impor hierarquia de meta.
* Meta contra realizado ao longo do tempo: coluna fantasma ou combinado de realizado, previsto e meta (modelo 08) lê melhor a evolução.
* Faixas de fundo em verde, amarelo e vermelho: isso vira semáforo e destrói a leitura; as faixas qualitativas só funcionam em tons de um único matiz.

## Anatomia

1. **Barra do realizado**: a medida principal, na cor de destaque (`--chart-1`) em toda a família de versões deste modelo, fina o suficiente para caber sobre ou ao lado da referência.
2. **Referência**: meta, teto ou forecast, desenhada em neutro de dado (`--line-strong` ou `--text-muted`), nunca mais pesada que o realizado. Aparece como barra larga atrás (v1), traço perpendicular (v2) ou `ReferenceLine` fixa em 100% quando os valores já estão normalizados (v3).
3. **Faixas qualitativas** (só quando fazem sentido, v3): dois ou três tons de um único matiz (`--seq-1` a `--seq-3`), nunca semáforo; a ordem inverte quando a métrica é de custo, em que menos é melhor.
4. **Colunas de número**: percentual atingido, valor realizado e valor da meta, sempre por `@/lib/format` ou pelo despachante `@/components/visuals/valueFormat` quando a unidade varia linha a linha, alinhados à direita da banda.
5. **Casos limite**: categoria sem meta cadastrada escreve "sem meta definida" e desenha só o realizado; realizado muito acima da meta ganha rótulo de excedente e, quando passa da escala visível, uma marca de quebra explícita na ponta da barra; estorno com realizado negativo escreve o valor e não desenha barra nenhuma.

## Versões

* **v1_realizado-sobre-meta-sobreposta**: barras sobrepostas clássicas, meta larga e clara atrás, realizado fino na frente, dois `YAxis` de categoria com o mesmo `dataKey`. Percentual, realizado e meta em colunas à direita; linha de leitura com o time contra a meta somada.
* **v2_marcador-de-meta-e-trimestre-anterior**: bullet graph com marcador de meta por `Scatter` e `shape`, mais leve que a barra; ponto vazado do trimestre anterior como segunda referência; cor de destaque só em quem bateu a meta, com variação assinada e seta de direção.
* **v3_metas-2027-em-percentual**: seis indicadores de unidades diferentes normalizados em percentual da própria meta, com faixas qualitativas em três tons pela prop `background` do `Bar`, invertidas no indicador de custo, e um marcador de meta único em 100% para todos.
* **v4_sem-meta-e-acima-da-meta**: escala absoluta com os três casos limite da família: executivo sem meta cadastrada, executivo a 250% da própria meta com a escala cortada em 150% da maior meta do grupo e marca de quebra na ponta, e um estorno com realizado negativo que só escreve o valor.

## Como colar no Farol

* Nas versões v1 e v4 (barras sobrepostas), o `YAxis` oculto da meta e o `YAxis` visível do realizado precisam receber exatamente a mesma lista de categorias, na mesma ordem; um filtro aplicado a uma sem passar pela outra desalinha as barras sem erro visível.
* Na v2, o traço de meta é um `Scatter` com `shape` próprio: ao trocar o dado, garanta que `target` e `previous` continuem na mesma unidade do `actual`.
* Na v3, o domínio é fixo (`DOMAIN_MAX`) e a normalização (`actual / target`) acontece no componente; ao ligar dado real, confira que nenhuma meta chega a zero antes da divisão.
* Na v4, o corte de escala é sobre a maior meta do grupo (`computeDomainMax`), não sobre a maior meta da própria linha: se o conjunto de dados mudar bastante de porte, o corte em 150% acompanha automaticamente.
* Em todas, a barra do realizado usa uma cor só (`--chart-1`); não reintroduza `Cell` nem cor por posição.

## Referências

* [Wikipedia, bullet graph](https://en.wikipedia.org/wiki/Bullet_graph)
* [Storytelling with Data, what is a bullet graph](https://www.storytellingwithdata.com/blog/what-is-a-bullet-graph)
* [Clearly and Simply, an alternative design of bullet graphs](https://www.clearlyandsimply.com/2017/05/an-alternative-design-of-bullet-graphs/)
* [Vega Lite, barras em camadas transparentes](https://vega.github.io/vega-lite/examples/bar_layered_transparent.html)
* [Highcharts, colunas sobrepostas (código da demo)](https://raw.githubusercontent.com/highcharts/highcharts/master/samples/highcharts/demo/column-placement/demo.js)
* [Recharts, Bar (props background e shape)](https://recharts.github.io/en-US/api/Bar/)
* [IBCS 2.0](https://www.ibcs.com/ibcs-version-2-0/)
* Estudo de origem: [`_estudo/familias/02_barras-horizontais.md`](../../_estudo/familias/02_barras-horizontais.md), seções 2.4 e 2.14.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-17; as quatro versões passaram no `npm run check` sem erro e foram olhadas nos dois temas. Nenhum item abaixo reprova versão._

* **v1**: a frase acessível chegou a cerca de 255 caracteres com o dado padrão, acima do teto de 250 da ACE-1; corrigido em 2026-09-18 cortando a oração de ordenação da primeira sentença.
* **v1**: o cabeçalho "atingido" é mais largo que a coluna de 52 px em que está declarado e só não encosta na amostra de "realizado" porque sobra vão à esquerda; um rótulo mais longo passaria por cima.
* **v1**: a meta em `--line-strong` mede 1,79:1 no escuro e depende da isenção do valor escrito; a coluna da direita garante a isenção, mas qualquer corte dessa coluna derruba o acabamento.
* **v2**: Bianca e Caio saem os dois como 105% depois do arredondamento, e só a ordem das linhas mostra quem está na frente.
* **v2**: o realizado do trimestre atual não é escrito em reais em nenhuma linha; a leitura da barra vive só do percentual atingido, e o comentário de `BELOW_FILL` afirma que o valor está escrito sobre a barra, o que não acontece.
* **v2**: a única palavra "realizado" da legenda pertence ao ponto vazado do trimestre anterior, então a barra, que é a medida principal, fica sem nome próprio na peça; nomear a barra na legenda tiraria a chance de troca.
* **v3**: a ordenação decrescente por percentual coloca o custo por reunião, que é o pior indicador do grupo, no topo da lista; ordenar por distância da meta no sentido bom de cada métrica leria melhor.
* **v3**: as três faixas de fundo só são explicadas na frase acessível; uma nota de 11 px dizendo o que cada tom marca ajudaria quem nunca viu bullet graph.
* **v3**: com o nome mais longo do conjunto, o perímetro entre parênteses chega a cerca de 3 px do começo da faixa; a folga vive de `NAME_AXIS_WIDTH`.
* **v3**: as duas colunas de número da direita não têm cabeçalho, como a v1 e a v4 têm, e na linha da conversão elas saem como 81% e 8,1% lado a lado, o que pede uma segunda leitura para saber qual é o percentual da meta.
* **v3**: `displayRate` corta em 140% sem nenhuma marca de quebra; o dado atual chega a 128% e não exercita o corte, mas um indicador acima de 140% encurtaria a barra em silêncio, ao contrário da v4, que marca a ponta.
* **v3**: a barra do custo cobre quase toda a faixa boa invertida, então a pista da inversão que sobra na peça é a linha de leitura; as três faixas foram medidas no pixel nos dois temas e estão corretas.
* **v4**: o excedente de Otavio sai como mais 2% quando a NUM-1 pede uma casa decimal abaixo de 10%; a v2 já resolve isso com `ONE_DECIMAL_BELOW`.
* **v4**: o corte de escala em 150% da maior meta e o rótulo mais 150% acima de Renan coincidem em número e podem ser lidos como a mesma coisa.
* **v4**: o cabeçalho da coluna diz "% da meta" e abaixo dele caem também "estorno" e "sem meta definida", que não são percentual; um título mais neutro, como "posição", cobriria os três casos.

_Segunda revisão independente de 2026-09-18: `npm run check` voltou com 0 com erro e 4 avisos nas quatro versões, os oito PNGs foram olhados nos dois temas e nenhum bloqueante apareceu. A frase acessível da v1, apontada acima, está corrigida. Itens novos:_

* **v2 e v3**: o check acusa ESPESSURA-MARCA, barra de 10 px na v2 e de 8 px na v3 contra o piso de 12 px da ESP-2. É escolha de desenho do bullet graph, em que a medida precisa ser mais fina que o traço de meta de 16 px e que a faixa de 14 px; fica registrado porque o aviso vai reaparecer a cada render.
* **v3 e v4**: a frase acessível mede 237 e 239 caracteres, a 13 e a 11 do teto de 250 da ACE-1, e cresce com o dado; um nome de indicador ou de executivo mais longo estoura o teto no recorte real.
* **v2**: o retângulo separador do traço de meta é pintado na cor do cartão, então quem passou da meta tem a barra partida em dois pedaços, com o pedaço da direita solto depois do traço; é a forma certa para separar as marcas, mas quem olha rápido pode ler o pedaço solto como outra medida.
* **v3**: medido no pixel, o perímetro entre parênteses do nome mais longo para a cerca de 10 px do começo da faixa, e não a 3 px como a revisão anterior registrou; segue sendo folga pequena, presa a `NAME_AXIS_WIDTH`.
* **v1 e v4**: as colunas da direita ficam fora da área de desenho, então a coluna da meta e a do realizado dependem da margem reservada em `COLUMNS_WIDTH`; num cartão mais estreito que o canvas do preview a área de barra encolhe antes das colunas.
