# Dot plot com intervalo e distribuição ao fundo

## O que é

Um ponto na estimativa central de cada categoria, uma faixa horizontal de incerteza e, quando o n pede, os casos individuais pequenos atrás do resumo, tudo sobre um eixo de valor comum. O ponto diz onde está a mediana, a faixa diz o quanto ela varia (aqui, do 1º ao 3º quartil) e a nuvem diz quantos casos sustentam o resumo, sem abrir um box plot. O método da faixa e o n de cada linha ficam escritos, e o `ErrorBar` do Recharts recebe distâncias a partir do ponto, nunca limites absolutos: o dado chega como limite e é convertido em mediana menos 1º quartil e 3º quartil menos mediana antes do render.

## Quando usar

* Mediana ou média por categoria em que a dispersão muda a decisão, como ciclo de venda por segmento, com até 12 linhas no mesmo eixo.
* Resumo que precisa mostrar o n e os casos que o sustentam, até cerca de 400 pontos por linha (a `v3` mostra 218 na maior).
* Faixa com método declarado contra uma meta ou um SLA, com a faixa que cruza a referência marcada além da cor.
* Amostras de tamanhos muito diferentes, em que o resumo só vale a partir de um n mínimo (a `v4` usa 5 para a faixa e 10 para a mediana).

## Quando evitar

* Incerteza desconhecida ou inventada por regra de bolso: mostre só o ponto (17/01).
* A forma da distribuição é a pergunta, com dois picos ou cauda longa: box plot, strip ou violino da família 16.
* Faixa de cenário pessimista a otimista: range plot com marcador (17/04) ou faixa de cenário contra meta (13/07).
* Mais de 400 casos por linha: a nuvem vira barra sólida, use beeswarm ou violino da família 16.
* Erro nas duas medidas quantitativas: dispersão com barras de erro (09/07).

## Anatomia

1. Eixo de linhas numérico (−0,5 a n−0,5, com `reversed`) com o nome em `--text-secondary` e o n em `--text-muted` sob ele ou ao lado, e zebra em `--surface-sunken` atrás da grade vertical em `--line-subtle`.
2. Eixo de valor com domínio e tiques fixos, `formatDays`, `formatCurrencyAxis` ou minutos por `formatInt`, sem linha de eixo.
3. Faixa por `ErrorBar` com `direction="x"`, serifas de 6 px e traço de 2 px em `--text-muted`, num `Scatter` que vem primeiro na árvore.
4. Casos individuais (`v3`, `v4`) em `--text-muted` com 0,80 de opacidade (0,72 falha sobre a zebra), deslocados na vertical por hash FNV com finalizador do id, nunca por `Math.random`.
5. Marcador da mediana em `--chart-1` com contorno de 1,5 px em `--surface-raised`, por forma própria do `Scatter` que também desenha o valor e a área sensível da linha inteira.
6. Referência (`ReferenceLine`, `ifOverflow="extendDomain"`) com rótulo na margem superior, e faixa que cruza em `--warning` com ícone de alerta (`v2`).
7. Exceções escritas e desenhadas: marca de estouro na borda direita (`v3`), texto `sem mediana`, `sem faixa` e anel vazado com `sem venda no período` (`v4`).
8. Linha de leitura calculada do dado e nota de método, ambas `aria-hidden`; dica com quartis e n que o corpo não traz.

## Versões

* `v1_ciclo-mediano-por-segmento-com-quartis`: cinco segmentos, mediana em dias e faixa entre quartis, com o n sob o nome; faixa assimétrica e faixa estreita no mesmo desenho.
* `v2_handoff-com-faixa-que-cruza-o-sla`: sete executivos contra o SLA de 2 dias, com a faixa que cruza em `--warning` e ícone, e a anotação de resultado não conclusivo.
* `v3_primeiro-contato-com-leads-ao-fundo`: 900 leads de agosto por SDR ao fundo, mediana opaca na frente, teto de SLA e marca de estouro acima da escala de 120 minutos.
* `v4_ticket-por-origem-com-amostra-pequena`: oito origens, sem faixa abaixo de 5 negócios, sem mediana abaixo de 10 e a origem sem venda mantida na lista.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual e troque o `data.ts` pela consulta real, mantendo o tipo exportado; a conta de quartis (`v4`) ou o resumo já calculado (`v1`, `v2`) vem do mesmo lugar que a métrica.
2. Mova o domínio e os tiques do eixo de valor para o registry da métrica: o domínio não pode mudar com o filtro, senão os recortes deixam de ser comparáveis. O teto de SLA e o teto de escala também moram ali.
3. Embrulhe no `VisualCard` e leve o título, o método da faixa e a procedência para ele; o `Chart` não desenha etiqueta de procedência.
4. Troque o estado vazio inline por `EmptyState` ou `UnavailableState`, mantendo o sentido do texto.
5. A altura do gráfico é derivada do número de linhas (`ROW_STEP`); acima de 12 linhas, mantenha a régua fixa e role só as linhas.

## Referências

* Cleveland, W. S., The Elements of Graphing Data: o ponto sobre eixo comum e a leitura por posição.
* Tukey, J. W., Exploratory Data Analysis: mediana e quartis como resumo que não depende da média.
* Practical Reporting e Datawrapper Academy, dot plots com intervalo: declarar o que a faixa representa.
* Recharts, Scatter, ErrorBar e ReferenceLine: a distância relativa do `ErrorBar` e a forma própria do `Scatter`.
* No Farol: `app/src/components/visuals/charts/chartTheme.ts` e `ChartTooltip.tsx`.
* Pedido de formatador: `formatDays` arredonda para inteiro, e a `v2` precisa de uma casa decimal em dias, então escreve `formatDecimal` com a unidade ao lado; um `formatDays` com casas ajudaria.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05. `v1` e `v2` aprovadas; `v3` e `v4` reprovadas, com os bloqueantes em `validation/revisao_17_comparacao-de-pontos__02_dot-plot-com-intervalo_2026-10-05.md`.

* `v1`, `v2`, `v4`: o halo do rótulo de valor é `--surface-raised`, e nas linhas de zebra ele aparece como mancha em volta do texto. O texto continua legível.
* `v1`: em Saúde e bem-estar a serifa do 1º quartil fica a menos de 3 px da borda do ponto da mediana; lê, mas no limite.
* `v2`: o número de handoffs de cada executivo só está na dica, e a descrição do modelo diz que o n de cada linha fica escrito. Débora F. tem 9 handoffs e a faixa dela pesa igual à de quem tem 31.
* `v2`: a faixa é entre quartis (dispersão dos casos), não intervalo de confiança da mediana. "Resultado não conclusivo" vem do catálogo, mas Débora F. e Caio M. têm a mediana acima do SLA, ou seja, mais da metade dos aceites deles estoura o prazo. Vale rever a redação no catálogo.
* `v2`: o rótulo `1,1 dias` de Murilo C. é atravessado pela linha do SLA e o `0,8 dias` de Talita V. termina a cerca de 2,5 px dela; o halo mantém a leitura.
* `v2`: seis linhas de grade (0 a 5 dias) contra o teto de cinco da EIX-4, sem consequência no preview; a frase acessível tem 239 caracteres, a 11 do teto.
* `v3`: `meta.json` diz mediana de 6 px e o desenho tem 7 px; "agosto" está escrito à mão no rodapé e não vem do dado; `120 min` do rodapé sem `tabular-nums`.
* `v4`: rótulos de valor por cima de casos da própria linha (3 em Inbound do site, 2 em Indicação de clientes, 1 em Eventos e congressos); frase acessível sem nenhum valor de ticket; `5` e `10` sem `tabular-nums`; "n" no rodapé é jargão.
* `v4`: o deslocamento por hash sai em duas fileiras nas origens grandes e em uma só nas pequenas, pelo mesmo `hash01` da `v3`, com finalizador de avalanche.

Segunda revisão de 2026-10-05, sobre os arquivos corrigidos. `v3` e `v4` aprovadas: os bloqueantes da primeira passada (opacidade dos casos sobre a zebra, hash sem avalanche, eixo sem tique na borda) foram medidos de novo e não aparecem mais. A linha acima sobre as duas fileiras da `v4` deixou de valer.

* `v3`, `v4`: a zebra sai com `fill-opacity` 0,5 (padrão da `ReferenceArea`), então o fundo real da linha fica entre o cartão e `--surface-sunken`. Os casos a 0,80 medem 3,21:1 no pior caso (claro, zebra cheia) e 3,55:1 sobre o cartão; no escuro, 4,19:1 sobre a zebra cheia e 3,82:1 sobre o cartão. A nota do `meta.json` da `v3` trata 0,80 como mínimo, e a folga é pequena: qualquer redução reprova.
* `v3`: as marcas de estouro se empilham na borda direita e viram um bloco serrilhado em Pietra G., Caio M. e Ana Beatriz Cavalcanti (13, 16 e 13 marcas em 21 px de altura); a contagem só se lê pelo texto `acima da escala` ao lado, que está escrito.
* `v3`: o comentário do `data.ts` diz que o valor exato do caso acima do teto fica na dica, mas a dica só traz mediana, leads e a contagem acima de 120 min (DAD-10).
* `v3`: em Talita V., 63 dos 218 pontos ficam a menos de 1 px de outro, porque os minutos são inteiros e a linha é densa; é o limite do desenho que o README já declara, não defeito do hash.
* `v3`: continuam da primeira passada o `meta.json` com mediana de 6 px contra 7 px desenhados, o "agosto" escrito à mão no rodapé e o `120 min` do rodapé e do rótulo do teto de SLA sem `tabular-nums`.
* `v4`: os rótulos de valor continuam nascendo junto de casos da própria linha (medido no preview: 3 casos tocados pelo halo de `R$ 38,0 mil`, 3 por `R$ 72,0 mil`, 1 por `R$ 52,5 mil` e 1 por `R$ 64,0 mil`, um deles encostado no `R` inicial). Os números leem limpos nos dois temas; ancorar o rótulo depois do maior caso, como já se faz em `sem faixa`, resolveria.
* `v4`: `X_DOMAIN` e `X_TICKS` são constantes fixas em R$ 150 mil. Um ticket acima disso faria o Recharts estender o domínio sem tique, o mesmo sintoma da primeira passada; ao colar, o domínio vem do registry ou é calculado do dado (EIX-4).
* `v4`: seis linhas de grade (0 a 150 mil) contra o teto de cinco da EIX-4, num cartão de 490 px, sem consequência no preview.
* `v4`: continuam da primeira passada o halo em `--surface-raised` como mancha em volta de `sem faixa` na linha de zebra de Redes sociais, a frase acessível sem nenhum valor de ticket, o `5` e o `10` sem `tabular-nums` e o "n" do rodapé como jargão.
