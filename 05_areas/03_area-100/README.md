# Área 100%

## O que é

Área empilhada normalizada: em cada instante do tempo, a soma das camadas vale sempre 100%, e o
que se lê é como a participação de cada parte mudou, não o volume. O Recharts faz a normalização
no próprio render, com `stackOffset="expand"`, mas o payload que chega à dica e ao rótulo continua
absoluto; por isso o percentual de cada camada é sempre calculado no componente, nunca lido direto
do desenho. A forma esconde o total por construção: se ele caiu pela metade, a área 100% não
mostra isso em lugar nenhum, e um leitor pode ler crescimento onde houve queda. Por decisão do
dono da marca, toda versão desta família precisa dizer o total em algum lugar visível, seja na
linha de leitura, seja num painel de total sincronizado abaixo do gráfico. Instante com total
zero é lacuna, nunca 0%, porque não existe participação de um total que não existiu.

## Quando usar

- Evolução de participação com 2 a 6 partes coloridas e 10 datas ou mais.
- Cobertura de dado ao longo do tempo: quanto da base segue sem origem declarada depois de uma
  correção de coleta.
- Mix comparado entre períodos de totais muito diferentes, sempre com um painel de total
  sincronizado abaixo, porque a área 100% sozinha apagaria a diferença de volume.

## Quando evitar

- O total mudou muito e isso é a notícia principal: área empilhada comum (`02_area-empilhada`)
  ou, se a participação também importa, esta mesma família com o painel de total.
- Participação de um único instante, sem eixo de tempo: pizza (`06_pizza`) ou waffle
  (`22_unidades-waffle-e-pictograma`).
- Poucos períodos: colunas 100% (`03_colunas-verticais`).
- Camada de ausência pintada como categoria real ou somada a "Outros": ela precisa ficar visível
  e por último, fora do teto de 6 cores (COR-4).

## Anatomia

1. **Camadas (`Area` com `stackOffset="expand"`)**: uma por categoria, todas com o mesmo
   `stackId`; cor fixa por categoria vinda do dado ou de um dicionário, na ordem de slot 1, 3, 6,
   5, 2, 4 da COR-8, nunca por índice de array reordenada.
2. **Separador entre camadas**: `stroke="var(--surface-raised)"` de 1,5 px, para vizinhos que não
   contrastam entre si (COR-5).
3. **Camada de ausência**: sempre o último filho da pilha (o topo), vazada com `fill="none"` e
   contorno `--text-muted`, nunca somada a "Outros" e fora do teto de 6 cores.
4. **Eixo de valor**: domínio fixo `[0, 1]`, tiques em `0`, `0,25`, `0,5`, `0,75` e `1` formatados
   por `formatPercent`, porque o eixo é sempre a escala de participação, nunca a do dado bruto.
5. **Percentual calculado no componente**: o payload de cada `Area` continua absoluto depois do
   `stackOffset="expand"`; toda vez que um número de participação aparece na tela (rótulo, linha
   de leitura, frase acessível), ele vem de uma função de percentual pelo maior resto (NUM-2),
   nunca de uma leitura direta do desenho.
6. **O total em algum lugar**: uma linha de leitura com o valor absoluto do último ponto (NUM-5),
   ou, quando o total varia demais para caber numa frase, um segundo gráfico de área simples
   sincronizado (`syncId`) logo abaixo, com o mesmo eixo de tempo e sem eixo duplo (EIX-8).
7. **Referência (`ReferenceLine` ou `ReferenceArea`)**: data de corte, correção de coleta ou
   período sem base, sempre com texto nomeando o que ela marca (ANO-1 a ANO-4).
8. **Estado vazio**: bloco `role="status"` com ícone `Filter` e frase, sem eixo nem grade.

## Versões

- **`v1_participacao-do-investimento-por-plataforma`**: `stackOffset="expand"` com eixo de 0% a
  100% por `formatPercent`; percentual inteiro somando 100 pelo maior resto; cor fixa por
  plataforma vinda do dado; rótulo de cada camada dentro da própria área, pelo ponto de referência
  do último mês, no lugar de uma legenda; a linha de leitura escreve a plataforma líder e o
  investimento total do último mês, para a redistribuição de peso não ser lida como queda de
  investimento.
- **`v2_leads-sem-origem-apos-correcao`**: camada de ausência ("sem origem declarada") vazada no
  topo da pilha; `ReferenceLine` vertical na data da correção de coleta, com rótulo curto; a linha
  de leitura declara a participação da ausência antes e depois da correção e o total de leads do
  último mês, para a queda de ausência não parecer queda de leads.
- **`v3_origens-com-painel-de-total`**: seis origens coloridas na ordem de slot da COR-8, mais
  "Outras (n=2)" em neutro e "Sem origem declarada" por último; dois gráficos empilhados
  verticalmente com o mesmo eixo X e o mesmo `syncId`, sem eixo duplo (EIX-8): a área 100% em cima
  e um painel de total em área simples embaixo; legenda acima do gráfico na ordem visual da
  pilha, de cima para baixo (ROT-4); é a versão em que o total muda o bastante para merecer o
  próprio painel, e não só uma linha de leitura.
- **`v4_semanas-sem-nenhum-lead`**: duas semanas de total zero, medição real e não falta de
  coleta, viram lacuna antes do render (valores `null`, curva quebrada por `connectNulls={false}`)
  em vez de dividir por zero ou desenhar 0%; cada semana zero leva uma `ReferenceArea` nomeando o
  motivo; a frase acessível declara a participação final de cada origem e o total de leads da
  última semana com lead.

Previews de cada versão: `v1_participacao-do-investimento-por-plataforma/preview.svg`,
`v2_leads-sem-origem-apos-correcao/preview.svg`, `v3_origens-com-painel-de-total/preview.svg` e
`v4_semanas-sem-nenhum-lead/preview.svg` (e o par `preview-claro.svg` de cada uma).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue `data` à consulta real da página.
2. Nunca leia percentual do desenho: o `stackOffset="expand"` só normaliza a pilha visualmente, e
   toda função de participação (rótulo, linha de leitura, dica) precisa continuar recebendo o
   valor absoluto e calculando o percentual sozinha, como em `shareOfHundred`.
3. Se a página real pode ter um total que varia muito entre recortes, prefira o desenho da `v3`
   (painel de total sincronizado) ao invés de só uma linha de leitura: a decisão do dono vale para
   qualquer instância nova desta família, não só para o catálogo.
4. Trate total zero como lacuna antes de passar `data` ao componente, ou replique a transformação
   da `v4` (`toPlotRow`) na consulta da página: nunca deixe o `stackOffset="expand"` dividir por
   zero.

## Referências

- [Recharts, Percent Area Chart](https://recharts.github.io/en-US/examples/PercentAreaChart/)
- [Vega-Lite, Normalized Stacked Area Chart](https://vega.github.io/vega-lite/examples/stacked_area_normalize.html)
- [AG Charts, 100% Stacked Area Chart](https://www.ag-grid.com/charts/gallery/100--stacked-area/)
- [Highcharts, Percentage area](https://www.highcharts.com/demo/highcharts/area-stacked-percent)
- [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart)

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18._

- **v1**: o comentário de `TICK_INTERVAL` cita a EIX-7, que é o teto de 8 categorias com
  `interval={0}`; o caso aqui é outro, são 12 meses com um tique a cada dois, e a regra citada não
  governa a decisão.
- **v1**: o `ReferenceDot` com `r={0}` serve só de âncora para o rótulo da camada; funciona, mas o
  elemento não desenha ponto nenhum e o nome sugere o contrário para quem copiar o padrão.
- **v2**: a data da correção aparece escrita à mão como `'2026-06-02'` no rótulo da `ReferenceLine`
  e na frase acessível, enquanto o mês vem da prop `correctionMonth`; quem passar outro mês fica com
  o texto dizendo uma data e a linha vertical em outra.
- **v2**: a camada de ausência declara `fill="none"` e `fillOpacity={0}` ao mesmo tempo; um dos dois
  já resolve, e o par duplicado confunde quem lê o arquivo.
- **v3**: o eixo do painel de total imprime só `300` e `100`; o Recharts descartou os tiques `0` e
  `200` que o componente passou em `ticks`, e a área preenchida fica com a base sem rótulo.
- **v3**: pelo mesmo motivo, o eixo de participação não imprime o tique `0%`, com `MARGIN.bottom`
  em `0`; a leitura se sustenta pelos tiques de 25% a 100%, mas a base fica muda.
- **v3**: a camada "Outras (n=2)" fica abaixo de 1% em todas as 52 semanas, então a faixa neutra é
  um fio; no tema claro a amostra da legenda em `--line-strong` mede 1,83:1 contra o cartão e quase
  desaparece, sem valor escrito ao lado que sustente a isenção da 17.2.
- **v4**: a lacuna desenhada cobre dois passos do eixo, da semana anterior à seguinte, enquanto a
  semana sem base é uma só; quem desfaz a ambiguidade é o texto "sem lead" no centro do vão.

_Segunda revisão, 2026-09-18._

- **v3**: o eixo de tempo imprime um tique a cada dois meses (fev, abr, jun, ago, out, dez) porque o
  Recharts alterna os 12 tiques mensais que o componente passou; a série começa em jan/26, e esse
  primeiro ponto fica sem rótulo no eixo.
- **v3**: o painel de total desenha a série em `--chart-1`, o mesmo token que pinta "Indicação" na
  pilha logo acima, e não leva rótulo direto; quem identifica a curva é a linha de leitura e a dica.
  Um neutro ou um rótulo "Total semanal" no painel separaria os dois papéis.
- **v4**: as participações da frase acessível saem de `Math.round` por origem e somam 99 (45%, 33% e
  21%); a `shareOfHundred` da v1 é o maior resto da NUM-2 e faria a frase fechar em 100.
- **v4**: a linha de leitura escreve "Total em abr/26", mas o número é o da última semana com lead,
  não o do mês de abril; a v3 resolve o mesmo caso escrevendo "leads na semana".

_Terceira revisão, 2026-09-18._

- **v1 e v4**: a frase acessível escreve "de jan/26 a dez/26 de 2026" e "de jan/26 a abr/26 de
  2026"; o rótulo de mês já carrega o ano, e o "de 2026" no fim repete o que foi dito duas vezes.
- **v2**: a linha de correção cai sobre o ponto de junho, mas o mês de junho agrega leads de antes
  e de depois de 02/06; a transição aparece instantânea onde o dado mensal não consegue separar os
  dois trechos.
- **v3**: a faixa "Outras (n=2)" é desenhada com `fillOpacity` de 0,5 sobre `--line-strong`,
  enquanto a amostra da legenda usa o token cheio; a amostra fica mais escura que a marca que ela
  nomeia (ROT-4 pede amostra na forma da marca).
- **v4**: a marcação de lacuna chama `rows.indexOf` dentro do `map` das semanas zeradas, o que
  percorre a lista inteira a cada marcação; guardar o índice no próprio filtro resolve sem custo
  quadrático quando a série cresce.
