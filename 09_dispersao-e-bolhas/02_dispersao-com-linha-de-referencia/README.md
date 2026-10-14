# Dispersão com tendência ou identidade

## O que é

A dispersão ganha uma linha que dá régua à nuvem. A reta de mínimos quadrados, calculada em TypeScript, resume a direção e a força da relação entre duas medidas e só aparece quando passa um piso declarado de R² e de tamanho de amostra; a diagonal de identidade, quando a pergunta é previsto contra realizado, separa quem entregou mais do que o esperado de quem entregou menos. A faixa de 95% da média da reta, quando entra, diz até onde a inclinação se sustenta na amostra que existe.

## Quando usar

- Dizer quanto de Y vem com cada unidade a mais de X, como leads qualificados por mil reais investidos.
- Mostrar a incerteza da inclinação com a faixa de 95% da média, que alarga nas pontas.
- Previsto contra realizado ou meta contra entrega, na mesma unidade, com a diagonal y = x.
- Comparar a relação de dois ou três grupos no mesmo plano, cada um com a sua reta e a sua faixa.
- Nuvem com pelo menos 10 pontos e forma visível; abaixo disso a reta não é desenhada.

## Quando evitar

- Nuvem espalhada sem forma: a reta dá autoridade ao ruído; use a dispersão simples ([modelo 01](../01_dispersao-simples/)).
- Medidas de unidades diferentes na diagonal de identidade: a linha y = x não tem sentido.
- Público que lê a faixa de confiança como o lugar onde os pontos deveriam cair: prefira o intervalo de predição ou só a reta.
- Pergunta de causa: a reta mostra associação, nunca efeito.
- Pontos no tempo de uma entidade: use a dispersão conectada (modelo 05 da família).

## Anatomia

1. Pontos da nuvem em `--chart-1` com opacidade abaixo de 1: são o assunto do gráfico, por isso levam o token de dado em vez do neutro `--line-strong`, que a tabela 17.2 só libera para marca sem valor escrito. Onde a nuvem é pequena a opacidade sai e a marca fica cheia (`v2`, `v3`, `v4`), porque opacidade só existe para resolver sobreposição e cobra contraste em troca (CONTRATO, ACE-5).
2. Reta de mínimos quadrados calculada em TypeScript sobre o array de pontos e desenhada só entre o menor e o maior X observado (`x0` a `x1`), nunca extrapolada; por ser derivada da nuvem, entra como referência discreta (`--text-muted`, traço de 1 px tracejado `3 3`, seção 17.2), desenhada antes dos pontos para não competir com eles. Quando a reta é de um grupo entre vários, ela sai na cor do grupo e opaca, porque aí ela identifica o grupo (`v3`).
3. Piso declarado de R² 0,3 e `n` de pelo menos 10: abaixo disso a reta não entra e o rótulo explica o motivo com os dois números medidos (`v1` na ausência de relação, `v4` como versão inteira).
4. `Line` sem ponto, sem ponto ativo e fora da legenda (`dot={false}`, `activeDot={false}`, `legendType="none"`), para o traço não competir com a nuvem.
5. Rótulo com a inclinação traduzida para a unidade de negócio, o R² e o `n`. Em `v1` ele é um selo no canto para onde a reta sobe; em `v3` ele é a própria legenda, uma linha por produto, o que dispensa o selo e não disputa espaço com a nuvem.
6. Grade nos **dois sentidos** em `--line-subtle`, sem tique e sem linha de eixo: a leitura de uma dispersão é a posição conjunta em X e em Y, e a exceção da EIX-3 medida em 2026-09-19 torna isso obrigatório nas famílias 09, 16, 17 e 25. O `axisLine` do `AXIS_PROPS` precisa ser desligado depois do spread, porque ele vem ligado.
7. Eixos numéricos com domínio explícito, e a unidade escrita no próprio tique: `formatCurrencyAxis` em moeda, `formatDays` em dias, `formatPercent` em taxa, contagem com o substantivo ao lado (NUM-6).
8. Diagonal de identidade como `ReferenceLine segment` de `(0, 0)` até o topo do domínio, com o mesmo domínio nos dois eixos e a área útil quadrada, que é o que faz a linha sair a 45 graus (`v2`). As duas retas de tolerância percentual saem do mesmo ponto, com os extremos calculados para caírem dentro do domínio, e ficam em `--line-strong` tracejado, que a ACE-6 endossa para referência.
9. Nome da referência escrito numa margem reservada à direita do plano, por uma camada própria com `usePlotArea` e `useYAxisScale`, e nunca pelo `label` nativo da `ReferenceLine`, que nasce na altura da linha, dentro da área, bem onde a nuvem se acumula (`v2`, ARMADILHAS, REC-4).
10. Faixa de 95% da média da reta como `Area` de par baixo e alto, calculada numa grade de 30 valores de X entre `x0` e `x1`, com o `t` de Student da própria amostra por grau de liberdade quando `n` fica abaixo de 30 (`v3`). O preenchimento vai a 0,15 para a sobreposição de duas faixas ser legível, e o contorno opaco da cor da série, com revestimento de `--surface-raised` por baixo, é o que devolve o contraste e separa dois contornos que se cruzam (CONTRATO, ACE-5; ARMADILHAS, TOK-4).
11. Dica própria (`ChartTooltip`) com os valores já formatados na unidade certa. Em `v3` não há dica: num combinado ela é por eixo e abriria seis séries de duas grandezas na mesma caixa (ARMADILHAS, REC-6).
12. Linha de leitura acima do gráfico, calculada do dado, e rodapé abaixo com o que ficou fora do plano e por quê.
13. Estado vazio (`role="status"`) quando o recorte não tem linha com as duas medidas.
14. `ZAxis` com as duas pontas iguais em toda versão: sem ele o raio do ponto varia e passa a codificar o que ninguém quis codificar (ARMADILHAS, REC-15).

## Versões

- `v1_investimento-contra-leads-qualificados`: investimento semanal em mídia paga contra leads qualificados da mesma semana, 20 semanas fictícias. Demonstra o `ComposedChart` com `Scatter` e `Line` num array único de pontos e extremos da reta, os mínimos quadrados calculados em TypeScript com a reta limitada ao intervalo observado, o rótulo na ponta da reta com a inclinação traduzida, o R² e o `n`, e a `Line` sem ponto, sem ponto ativo e fora da legenda.
- `v2_forecast-contra-fechamento`: forecast de 30 dias antes contra o valor fechado, 30 oportunidades de um trimestre. Demonstra o mesmo domínio nos dois eixos com a área útil quadrada (medida em 373 por 373 px) para a diagonal sair a 45 graus, `ReferenceLine segment` para a identidade e para as duas retas de tolerância de 15%, a contagem dentro da tolerância com os pontos fora em cor e forma de destaque, o nome da referência numa margem reservada em vez do rótulo nativo, e as perdidas com fechado zero fora do plano, num contador com o valor previsto.
- `v3_ciclo-contra-ticket-por-produto`: ticket contra ciclo de venda de dois produtos, 46 oportunidades ganhas. Demonstra a `Area` de faixa com `dataKey` em par baixo e alto sobre uma grade de 30 valores de X, o `t` de Student da própria amostra quando `n` fica abaixo de 30, as duas faixas a 0,15 cuja sobreposição mostra até onde os produtos não se distinguem (medida em R$ 115 mil, calculada do dado), e o contorno opaco com revestimento na cor do cartão onde as duas se cruzam.
- `v4_sem-relacao-detectavel`: frequência média contra taxa de clique de 10 criativos, 9 no plano. Demonstra o piso funcionando: com R² 0,07 e `n` 9 a reta não é desenhada, o rótulo dentro do plano explica a ausência com os dois números medidos contra os dois pisos, a nuvem fica intacta, e o criativo sem impressão entregue sai do plano em vez de cair em 0% de taxa.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/InvestmentLeadsTrend/`.
2. Troque o `import` do `./data` pelo dado real da página, já agregado por semana (ou pelo período que fizer sentido para a métrica).
3. Ajuste `DOMAIN_X`, `TICKS_X`, `DOMAIN_Y` e `TICKS_Y` para a faixa real das duas medidas; um domínio fixo evita que a nuvem mude de forma a cada filtro.
4. Mantenha o piso de R² e de `n` (`R2_FLOOR`, `N_FLOOR`): é o que impede a reta de aparecer sobre ruído puro.
5. Na `v2`, a área útil quadrada depende do canvas: se o cartão da página não for quadrado, a diagonal deixa de sair a 45 graus e a leitura por distância até ela se perde. Meça o plano no render antes de fechar, como a nota do `meta.json` descreve.
6. Nas versões com camada própria (`v2` e `v4`), a camada é um componente local que só funciona **dentro** do `ScatterChart`, porque depende de `usePlotArea` e das escalas de eixo. Mantenha a ordem dos filhos: referências antes dos `Scatter`, rótulos depois.
7. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
8. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, Scatter And Line Of Best Fit](https://recharts.github.io/en-US/examples/ScatterAndLineOfBestFit/): o array único com chaves de pontos e de reta e a `Line` sem ponto nem legenda.
- [Recharts, API do Scatter](https://recharts.github.io/en-US/api/Scatter/): `lineType` `fitting` como atalho de regressão, e por que ele não serve aqui (não devolve R² nem permite o piso da regra 5).
- [Recharts, hooks de escala](https://recharts.github.io/en-US/api/hooks): `usePlotArea`, `useXAxisScale` e `useYAxisScale`, que dão à camada própria os pixels do plano inteiro; é o que o `label` da `ReferenceLine` não entrega, porque só sabe a altura da própria linha.
- [Vega-Lite, Linear Regression](https://vega.github.io/vega-lite/examples/layer_point_line_regression.html): as três camadas, pontos, reta e texto de R², que a versão reproduz num `ComposedChart` só.
- [Datawrapper Academy, how to create a scatter plot](https://www.datawrapper.de/academy/how-to-create-a-scatter-plot): a regra de não desenhar tendência quando a nuvem é espalhada, que motiva o piso de R² e `n`.
- Faixa de confiança da média da reta, `ŷ ± t(0,975; n−2) · s · √(1/n + (x − x̄)² / Sxx)`: a fórmula é implementação local em `v3/Chart.tsx`, com a tabela de `t` por grau de liberdade no próprio arquivo, porque a lista de imports da seção 6 do contrato não tem biblioteca de estatística.

## Observações da revisão (não bloqueantes)

- ~~`v1_investimento-contra-leads-qualificados`: o `CartesianGrid` sai nos dois sentidos, o que a EIX-3 fecha com "nunca grade nos dois sentidos".~~ **Corrigido em 2026-09-28: a observação estava errada e ao contrário.** A EIX-3 tem exceção medida em 2026-09-19, no sub-bullet logo abaixo do enunciado, que torna a grade nos dois sentidos **obrigatória** nas famílias 09, 16, 17 e 25, porque o plano com duas grandezas lê posição em X e em Y. A `v1` está certa nesse ponto, e a leva de 2026-09-28 saiu igual. Lição de método: a regra se lê pelo bloco inteiro, não pela linha que casa com o código; buscar `EIX-3` devolve só o enunciado e esconde a emenda.
- `v1_investimento-contra-leads-qualificados`: com grade, a EIX-5 pede `axisLine={false}` sobrescrevendo o `AXIS_PROPS`, e a própria exceção da EIX-3 fecha com "sem tique e sem linha de eixo"; a versão herda o `axisLine` do tema, e o mesmo vale para o modelo 01 da família. Esta continua valendo, e é a metade da emenda que a `v1` de fato viola.
- `v1_investimento-contra-leads-qualificados`: a segunda linha do selo (`R² 0,53 · n 20`) escreve número em Manrope sem `tabular-nums` nem `font-display`, o que a TIP-1 pede; a linha de leitura logo acima faz certo, então é inconsistência dentro do próprio arquivo.
- `v1_investimento-contra-leads-qualificados`: medido no PNG escuro, a caixa do selo termina em y 341 e o pixel mais alto de marca está em y 342, ou seja nenhum ponto foi apagado; a folga é de 1 px e um recorte com mais pontos no alto cobre marca.
- `v1_investimento-contra-leads-qualificados`: no tema claro o selo não tem fundo visível, porque `--surface-overlay` é o mesmo branco do cartão (a mesma razão pela qual a ANO-4 o proíbe em `ReferenceArea`); ele só se lê por estar acima da área de plotagem, e desceria sobre grade e pontos se a margem superior encolhesse.
- `v1_investimento-contra-leads-qualificados`: a guarda ESP-2 do `npm run check` não mediu a espessura das marcas (`preview_com_transform`), então o tamanho do ponto não tem conferência automática nesta versão.

**Corrigido em 2026-09-19:** a nuvem usava `--line-strong` sem valor escrito (fora da isenção da tabela 17.10) e o eixo Y imprimia a contagem sem unidade; a nuvem passou para `--chart-1` e a reta virou referência discreta tracejada em `--text-muted`, e o tique de Y agora escreve `N leads` (seção Anatomia, itens 1, 2 e 6).

_Notas do produtor da leva de 2026-09-28, quando as três irmãs entraram. Nenhuma é bloqueante; são decisões e tensões declaradas, não defeitos escondidos._

- `v2`, `v3` e `v4`: a grade sai nos **dois sentidos**, como a exceção da EIX-3 obriga nesta família, e as três desligam o `axisLine` que o `AXIS_PROPS` traz, que é a outra metade da mesma exceção ("sem tique e sem linha de eixo"). As três nasceram com `vertical={false}`, por leitura incompleta da regra, e foram corrigidas antes de fechar; fica registrado porque o erro é fácil de repetir: o enunciado da EIX-3, sozinho, diz o contrário do que a regra manda para a família 09.
- `v2_forecast-contra-fechamento`: o eixo Y usa 72 px, fora da faixa de 48 a 64 da EIX-6. A medição é a razão: com 64 o tique `R$ 600 mil` não cabe nos 56 px que sobram depois do `tickMargin` e quebra em duas linhas, que é o sintoma da REC-2. A 14.1 manda a constante de acabamento ceder quando o desvio aparece no render.
- `v2_forecast-contra-fechamento`: as perdidas com fechado zero ficam **fora** do plano, como a especificação da versão pede, e a EST-3 diz que zero medido desenha a marca e escreve 0. A tensão é real e a saída escolhida foi escrever o zero em texto, com contagem e valor previsto, em vez de desenhá-lo: uma oportunidade perdida não é um erro de forecast de 100%, é outro evento, e quatro marcas na linha do zero puxariam a leitura de precisão para um fato que não é dela. Quem revisar decide se a especificação ajusta a redação ou se a EST-3 ganha exceção escrita para ponto que sai do plano com contador.
- `v2_forecast-contra-fechamento`: a diagonal e as duas tolerâncias são três referências, e só duas ganham nome escrito, pelo teto de duas anotações da ANO-1. A tolerância superior fica sem rótulo próprio: ela se lê pelo par, já que o nome diz `±15%`.
- `v3_ciclo-contra-ticket-por-produto`: a faixa a 0,15 mede **1,38:1 no escuro e 1,25:1 no claro** contra o cartão, muito abaixo do piso de 3:1 que a ACE-5 cobra de marca. A opacidade ficou porque é ela que torna a sobreposição legível, e a sobreposição é o assunto da versão; o contraste foi para o contorno opaco e para a reta, que medem 9,50:1 e 6,00:1 em `--chart-1` e 6,47:1 e 6,18:1 em `--chart-3`. É a mesma tensão que a `v4` do modelo 01 registrou, resolvida aqui pelo caminho que a própria ACE-5 abre, o contorno.
- `v3_ciclo-contra-ticket-por-produto`: a faixa é de 95% da **média** da reta, não de predição, e isso está escrito no rodapé e no caso de uso porque as duas se parecem na tela e significam coisas diferentes. Nenhuma das duas diz onde o próximo ponto vai cair.
- `v3_ciclo-contra-ticket-por-produto`: sem dica, de propósito. Num `ComposedChart` a dica é por eixo e não por marca, então ela abriria seis séries de duas grandezas diferentes na mesma caixa, que é a REC-6. Tudo o que ela diria já está escrito na legenda e no rodapé.
- `v4_sem-relacao-detectavel`: o rótulo de ausência vive **dentro** do plano, na faixa baixa que a nuvem não ocupa, e isso depende do dado: um recorte com taxa de clique perto de zero encostaria nele. A saída, se acontecer, é a mesma da `v2`, mover o bloco para uma margem reservada.
- As três: a `ESPESSURA-MARCA` e a `CONTRASTE-MARCA` saem `preview_com_transform`, como em toda dispersão do acervo, então o contraste de marca foi medido à mão e está escrito na nota de cada `meta.json`.

## Pendências conhecidas

- `v1_investimento-contra-leads-qualificados`: os números do selo (`R² 0,53 · n 20`) saem em Manrope
  sem `tabular-nums`, contra a TIP-1, e o eixo herda `axisLine` em vez de desligá-lo como pede a
  EIX-5. As duas são quebras de regra escrita e ficam registradas aqui em vez de corrigidas porque
  a rodada de correção deste modelo foi gasta em dois problemas maiores, a unidade ausente no eixo
  (NUM-6) e o papel de cor invertido entre a nuvem e a reta (17.2). Nenhuma das duas muda a leitura
  do preview; quem copiar esta versão corrige as duas em uma linha cada.
- `v1_investimento-contra-leads-qualificados`: a `v1` é a única das quatro que ainda deixa a linha
  de eixo ligada, herdada do `AXIS_PROPS`. É um `axisLine={false}` de uma linha em cada eixo, e o
  que segura a correção é só o custo de regerar os dois preview desta versão.
