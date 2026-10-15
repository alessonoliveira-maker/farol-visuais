# Revisão de 09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia, 2026-10-14

Versões julgadas: `v2_forecast-contra-fechamento`, `v3_ciclo-contra-ticket-por-produto` e `v4_sem-relacao-detectavel`, todas `sem_revisao`. A `v1` está aprovada desde 2026-09-19 e não foi julgada de novo.

`npm run check -- 09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia`: 0 com erro, 2 avisos (EIXO-CALMO em fila de dívida, os dois na `v1`). As três versões julgadas saem `ok`. PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28.

Resultado: as três reprovadas, cada uma por um ramo do código que faz o cartão dizer algo falso num recorte diferente do padrão. Nos dois previews as três estão corretas e legíveis; nada do que segue aparece no render do dado padrão, e por isso o parecer cita a linha e descreve o recorte que dispara o defeito. A 14.1 manda bloquear sempre a regra que decide o que o desenho afirma, e a EST-1b já fixou que o defeito que mora no ramo, e não na foto, conta. Observações não bloqueantes foram para o README do modelo.

## Resumo para o corretor

* **`v2`, ganha sem forecast some sem contagem.** Pergunta 8; EST-4 e DAD-2; seção 14.1, ausência.
* **`v3`, reta sem piso de R² e de n, e ajuste ausente lido como faixas separadas.** Perguntas 3 e 8; regra do modelo e EST-4; seção 14.1, encoding e ausência.
* **`v4`, o piso não tem o lado que desenha a reta.** Perguntas 1 e 19; regra do modelo e ACE-1; seção 14.1, versão que não demonstra o que o catálogo diz.

As três correções são de lógica e de texto; nenhuma mexe em cor, eixo ou canvas, então os previews do dado padrão devem sair iguais, salvo onde o rodapé ganhar uma contagem.

---

## v2_forecast-contra-fechamento

```
Versão: 09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia/v2_forecast-contra-fechamento
Data: 2026-10-14
Resultado: reprovada
Não: 8
Correções:
  8. EST-4 e DAD-2: contar as ganhas sem forecast, escrevê-las no rodapé e na frase acessível, e condicionar o "Toda oportunidade ganha do trimestre está no plano" a essa contagem ser zero.
Não se aplica: 6, 16 (conferida no código), 26, 27, 28, 29, 30
```

### Bloqueante 1. Pergunta 8; EST-4 e DAD-2; seção 14.1 (ausência)

**Evidência.** `Chart.tsx:148`: `if (row.previstoReais <= 0) continue;`. Uma oportunidade ganha que não estava no forecast de 30 dias antes sai do plano e não entra em contador nenhum. Não há variável que a conte, então ela também não aparece:

* na frase acessível (`Chart.tsx:182`), que diz `${points.length} oportunidades ganhas`, ou seja, só as plotadas;
* na legenda (`Chart.tsx:178`), cujo `80,8% (21 de 26)` passa a ter como denominador só as ganhas com forecast;
* no rodapé (`Chart.tsx:315-317`), que só conhece as perdidas. Com zero perdidas, ele escreve `Toda oportunidade ganha do trimestre está no plano`, o que fica falso assim que uma ganha sem forecast existir.

No dado padrão nenhuma ganha tem `previstoReais` zero, e por isso o preview está certo.

**Por que bloqueia.** A pergunta do caso de uso é se o forecast bateu com o fechado. Uma venda ganha que estava fora do forecast é o maior erro de forecast possível: previsto zero, fechado positivo. Tirá-la em silêncio melhora a taxa de acerto do cartão justamente pelo caso que mais a piora. A saída da DAD-2 é literal: "Ausência sai da amostra e é contada no rodapé, sempre." E a EST-4 pede que comparação sem base se declare. Aqui ela some, e num ramo o cartão afirma o contrário. É a regra que decide o que o desenho afirma (14.1), no ramo.

**O que mudar.**

1. Juntar as ganhas com `previstoReais <= 0` numa lista própria (`semForecast`), como as perdidas.
2. Escrever a contagem e o valor fechado delas no rodapé, por exemplo `2 ganhas fora do forecast, com R$ 180,0 mil fechados, ficam fora do plano porque não há previsto para comparar`, ao lado da frase das perdidas quando houver as duas.
3. Acrescentar a mesma contagem à frase acessível, conferindo o teto de 250 caracteres da ACE-1.
4. Trocar a condição do texto `Toda oportunidade ganha do trimestre está no plano` para `perdidas.length === 0 && semForecast.length === 0`.
5. Opcional, e decisão do produtor: em vez de sair do plano, a ganha sem forecast pode ir para `x = 0` como fora da tolerância, que é o que ela é. Qualquer das duas formas resolve, desde que ela seja contada.

---

## v3_ciclo-contra-ticket-por-produto

```
Versão: 09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia/v3_ciclo-contra-ticket-por-produto
Data: 2026-10-14
Resultado: reprovada
Não: 3, 8
Correções:
  3. Regra do modelo (piso de R² e de n): aplicar R2_FLOOR 0,3 e N_FLOOR 10 por grupo antes de desenhar reta e faixa, e dizer na legenda por que o grupo ficou sem reta, com os dois números.
  8. EST-4: quando um dos grupos não tem ajuste, escrever que não há comparação de faixas, em vez de "as faixas não se encontram no trecho comum".
Não se aplica: 6, 7, 13, 16 (conferida no código), 18 (sem dica, decisão declarada), 26, 27, 28, 29, 31
```

Conferido e certo no dado padrão, recalculado à parte: Produto A com +24,46 dias por R$ 100 mil, R² 0,9449, n 24; Produto B com +12,19 dias, R² 0,7927, n 22; as faixas se sobrepõem de R$ 28 mil (início do trecho comum) até cerca de R$ 115 mil, e deixam de se tocar em R$ 115,9 mil. Os números impressos batem.

### Bloqueante 1. Pergunta 3; regra do modelo; seção 14.1 (encoding)

**Evidência.** `linearFit` (`Chart.tsx:151-191`) só devolve `null` com menos de três pontos ou sem variação num eixo. Não existe `R2_FLOOR` nem `N_FLOOR` no arquivo, e `buildGrid` desenha reta e faixa para todo ajuste que não seja nulo. Um recorte em que o Produto B tenha 5 oportunidades com R² 0,08 sai com reta, faixa e inclinação escrita na legenda.

**Por que bloqueia.** O catálogo define o modelo assim: "A reta é calculada em TypeScript e só aparece quando passa o piso declarado de R² e de n." O README repete a regra na Anatomia, item 3, e no passo 4 de "Como colar no Farol" ("Mantenha o piso de R² e de n (`R2_FLOOR`, `N_FLOOR`)"), e a `v1` foi aprovada com "piso de R2 e n respeitado" na nota. A `v3` é a versão que o catálogo indica para comparar grupos; quem a copiar leva para o Farol uma reta que dá autoridade ao ruído, que é o primeiro item de "Quando evitar". A faixa larga não substitui o piso: a reta continua afirmando a direção, e a inclinação continua escrita na legenda.

**O que mudar.** Declarar `R2_FLOOR = 0.3` e `N_FLOOR = 10` no topo, como na `v4`. Grupo que não passa fica só com os pontos, sem `Area` nem `Line`, e o item dele na legenda troca inclinação e R² pelo motivo, no formato da `v4`: `sem reta: R² 0,08 contra o piso de 0,30, e n 5 contra o piso de 10`. A frase acessível diz o mesmo do grupo, em vez de retirá-lo da lista em silêncio como faz hoje o `.filter` de `Chart.tsx:306`.

### Bloqueante 2. Pergunta 8; EST-4; seção 14.1 (ausência)

**Evidência.** `Chart.tsx:283`: `const limite = primeiro === null || segundo === null ? null : overlapUpperBound(primeiro, segundo);`, e `Chart.tsx:286-287` traduz `limite === null` por `as faixas não se encontram no trecho comum`. Três situações diferentes caem no mesmo texto: as faixas de fato separadas; um grupo sem ajuste (hoje com n abaixo de 3, depois da correção 1 também abaixo do piso); e um recorte com um produto só. Nas duas últimas, rodapé e frase acessível afirmam que os produtos se distinguem em toda a faixa medida, sem haver segunda faixa para comparar.

**Por que bloqueia.** É ausência de medida virando conclusão: a EST-4 pede que comparação sem base se declare, e aqui ela sai como resultado. É exatamente a resposta à pergunta do caso de uso ("Os dois produtos têm a mesma relação?"), e é falsa.

**O que mudar.** Separar os três casos: com os dois ajustes e sobreposição, o texto de hoje; com os dois ajustes e nenhuma sobreposição, `as faixas não se encontram no trecho comum`; com um ajuste ausente, algo como `sem faixa do Produto B para comparar`.

**Aproveite a mesma rodada (não bloqueia, está no README):** `até R$ 115 mil` pressupõe que a sobreposição começa no início do trecho comum, o que vale no dado padrão mas não em geral, e a forma `de R$ X a R$ Y` resolve; o valor sai em `formatCurrencyAxis` dentro de texto corrido; e a ordem de pintura não deixa o revestimento separar os contornos que se cruzam, ao contrário do que dizem o `meta.json` e a Anatomia 10.

---

## v4_sem-relacao-detectavel

```
Versão: 09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia/v4_sem-relacao-detectavel
Data: 2026-10-14
Resultado: reprovada
Não: 1, 19
Correções:
  1. 14.1 (versão que não demonstra o que o catálogo diz): quando a nuvem passa os dois pisos, desenhar a reta de mínimos quadrados entre o menor e o maior X, como na v1.
  19. ACE-1: condicionar a frase acessível e o rodapé a passaPiso, para nenhum ramo dizer "sem reta de tendência" e "a nuvem passa os dois pisos" ao mesmo tempo.
Não se aplica: 6, 7, 13, 16 (conferida no código), 26, 27, 28, 29, 30, 32
```

Conferido e certo no dado padrão, recalculado à parte: 9 criativos no plano, R² 0,0713, taxa de clique de 0,91% a 1,68%, e o criativo J, sem impressão, fora do plano e contado no rodapé.

### Bloqueante 1. Pergunta 1; regra do modelo; seção 14.1 (versão que não demonstra o que o catálogo diz)

**Evidência.** `Chart.tsx:170` calcula `passaPiso`, e o único uso dele no desenho é `Chart.tsx:245`: `{passaPiso ? null : <MissingLineLabel ... />}`. Quando a nuvem passa, não se desenha nada: nem reta, nem rótulo. O `LinearFit` do arquivo (`Chart.tsx:43-47`) nem guarda o intercepto, então não há com que desenhar a reta.

**Por que bloqueia.** O catálogo dá à versão "Piso de R² 0,3 e n de pelo menos 10 aplicado antes de desenhar a reta", e o comentário do topo do próprio arquivo diz "o mesmo desenho do modelo, com o piso funcionando". Um piso que leva ao mesmo desenho nos dois lados não decide nada: a peça nunca desenha reta, e quem a copiar para o Farol perde a tendência justamente quando ela existe. A `v4` é a versão que o README aponta como a do piso "como versão inteira" (Anatomia, item 3).

**O que mudar.** Guardar o intercepto e os extremos de X no ajuste, e no ramo `passaPiso` desenhar a reta entre o menor e o maior X observado, como a `v1`: `--text-muted`, 1 px, tracejado `3 3`, por baixo dos pontos, e o rótulo com a inclinação traduzida, o R² e o n. O dado padrão continua não passando, então o preview não muda.

### Bloqueante 2. Pergunta 19; ACE-1; seção 14.1 (o texto diz o contrário do dado)

**Evidência.** No ramo `passaPiso`, a frase de `Chart.tsx:183-186` sai `Gráfico de dispersão com N criativos, ... sem reta de tendência. A nuvem passa os dois pisos: R² ... contra o piso de 0,30, ...`. O rodapé de `Chart.tsx:249-253` é fixo, `A reta só entra quando a nuvem passa os dois pisos`: num cartão sem reta, ele leva quem enxerga à conclusão de que a nuvem não passou, o oposto do dado.

**O que mudar.** A frase começa por `sem reta de tendência` só no ramo que não passa; no outro, ela diz a inclinação, o R² e o n. O rodapé muda junto: no ramo que passa, deixa de dizer que a reta só entra se a nuvem passar e passa a dizer o que a reta é. A guarda FORMATO-ACESSIVEL mede esta versão e vai conferir que frase e corpo usam os mesmos formatadores.

---

## Fora do parecer, para quem mantém a ferramenta

A guarda OPACIDADE-MARCA registrou a `v3` como `sem_opacidade_em_marca`, mas `Chart.tsx:379` tem `fillOpacity={BAND_FILL_OPACITY}`, com a constante em 0,15 na linha 94. A faixa mede 1,38:1 no escuro e 1,25:1 no claro, e o contorno opaco é o que a sustenta. A guarda parece não resolver opacidade vinda de constante nomeada, ou numa `Area`, e por isso calou sobre o único caso deste modelo em que ela tinha o que medir.

---

# Segunda passada, 2026-10-14, depois da rodada de correção

Versões julgadas de novo, todas `revisao_desatualizada`, sobre os arquivos de hoje (`Chart.tsx` das 10:51 às 10:53, PNGs das 10:53, mais novos). `npm run check`: 0 com erro, 2 avisos, os dois de EIXO-CALMO na `v1`, fora do escopo.

Os seis bloqueantes da primeira passada estão corrigidos e conferidos no código: a `v2` conta as ganhas sem forecast; a `v3` aplica `R2_FLOOR` 0,3 e `N_FLOOR` 10 por grupo, escreve o motivo na legenda e declara `sem comparação de faixas`; a `v4` desenha a reta no ramo que passa o piso e condiciona frase e rodapé a ele. Números recalculados do `data.ts`: Produto A +24,46 dias por R$ 100 mil, R² 0,945, n 24; Produto B +12,19, R² 0,793, n 22; sobreposição de R$ 28 mil a R$ 115,3 mil; `v4` com R² 0,0713 e n 9.

Resultado: `v2` aprovada; `v3` e `v4` reprovadas, uma por bloqueante cada. O da `v3` já existia na primeira passada e não foi visto; o da `v4` nasceu na própria correção. Observações novas foram para o README.

## Resumo para o corretor

* **`v3`, o último tique de X sai 14,9 px da linha de grade dele.** Pergunta 15; ESP-3 e emenda de 2026-10-02 da EIX-6b. Margem direita.
* **`v4`, a inclinação de uma taxa sai em percentual em vez de ponto percentual.** Pergunta 14; NUM-6 e DAD-4. Formatador, no ramo que passa o piso.

As duas correções são de uma ou duas linhas. A da `v3` muda o preview (o plano estreita 16 px); a da `v4` não muda, porque o dado padrão não passa o piso.

## v3_ciclo-contra-ticket-por-produto, segunda passada

```
Versão: 09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia/v3_ciclo-contra-ticket-por-produto
Data: 2026-10-14
Resultado: reprovada
Não: 15
Correções:
  15. ESP-3 e EIX-6b (emenda de 2026-10-02): subir MARGIN.right de 20 para 36, para o Recharts deixar o último tique de X sobre a linha de grade dele.
Não se aplica: 6, 7, 13, 16 (conferida no código), 18 (sem dica, decisão declarada), 26, 27, 28, 29, 31
```

### Bloqueante 1. Pergunta 15; ESP-3; EIX-6b, emenda de 2026-10-02; seção 14.1 (constante com consequência visível)

**Evidência.** No `preview.svg`, o plano vai de x 68 a x 874 (`width="806"` no `<text>` do eixo), e os tiques de X saem em 68, 269,5, 471 e 672,5, exatamente sobre as linhas de grade; o quinto, `R$ 320 mil`, sai em **x 859,13**, 14,87 px à esquerda da borda do plano onde mora a linha de grade dele. No PNG escuro ampliado, a linha de grade passa sob o `l` de `mil`, perto da ponta direita do rótulo, e não no meio dele; o centro do rótulo cai sobre R$ 314 mil, quase em cima do último ponto do Produto A (R$ 308 mil). O claro sai igual. O tique `120 dias` também sai deslocado, em y 11,25 contra a grade do topo em y 10, mas 1,25 px não se vê (observação no README).

**Causa.** É o mecanismo que a emenda da EIX-6b documenta para o eixo em pé: o padrão `interval: 'preserveEnd'` cai em `getTicksEnd`, que **reposiciona só o último tique** quando a meia largura medida dele passa da margem. Com `MARGIN.right` 20, o Recharts mediu 34,87 px de meia largura (20 + 14,87) e puxou o rótulo para dentro.

**Por que bloqueia.** A emenda dá o peso por escrito: "constante de acabamento da 14.1, bloqueia quando o tique some ou sai da linha de grade no render". Aqui ele sai, por 14,9 px, cerca de 30% da largura do rótulo, visível no tamanho natural dos dois PNGs. O tique da ponta é o que diz onde o domínio termina, e o rótulo deslocado fica sob o último dado.

**O que mudar.** `MARGIN.right` de 20 para **36** (primeiro múltiplo de 4 acima dos 34,87 que o Recharts mede), com a conta num comentário ao lado da constante. Aproveite e suba `top` de 10 para **12**, o valor da emenda, para o `120 dias` cair sobre a grade do topo. Depois do render, confira no `preview.svg` que o `x` do último `<tspan>` de X é igual a `68 + width` e que o `y` do primeiro tique de Y é igual ao `margin.top`. Não troque por `interval={0}`: sem o reposicionamento, a tinta do rótulo (cerca de 51 px, metade de 25,5) pode passar da margem de 20 px, e o defeito vira corte.

## v4_sem-relacao-detectavel, segunda passada

```
Versão: 09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia/v4_sem-relacao-detectavel
Data: 2026-10-14
Resultado: reprovada
Não: 14
Correções:
  14. NUM-6 e DAD-4: escrever a inclinação em ponto percentual, formatDecimal(inclinacao * 100, 2) seguido de p.p., no rótulo do plano e na frase acessível.
Não se aplica: 4, 6, 7, 13 (sem referência no dado padrão), 16 (conferida no código), 26, 27, 28, 29, 30, 32 (sem traço de relação no dado padrão)
```

### Bloqueante 1. Pergunta 14; NUM-6 e DAD-4; seção 14.1 (unidade)

**Evidência.** `Chart.tsx:204-207`:

```ts
: `${fit.inclinacao >= 0 ? '+' : '−'}${formatPercent(Math.abs(fit.inclinacao), 2)} de taxa de clique por vez a mais de frequência`;
```

A inclinação é a variação da taxa de clique, em fração, por vez a mais de frequência. `formatPercent` multiplica por 100 e põe `%`, então uma inclinação de 0,0012 sai `+0,12% de taxa de clique por vez a mais de frequência`. O número certo é 0,12 **ponto percentual**: a taxa vai, por exemplo, de 1,20% para 1,32%, e não de 1,20% para 1,2014%. O texto vai para dois lugares, o título do rótulo no plano (`Chart.tsx:286`, `titulo={inclinacaoTexto}`) e a frase acessível (`Chart.tsx:213`). No dado padrão a nuvem não passa o piso, então o preview está certo e o defeito mora no ramo que a primeira passada mandou escrever.

**Por que bloqueia.** É a DAD-4 literal ("O ponto percentual sai escrito como percentual"), e unidade é regra que decide o que o desenho afirma (14.1). O ramo que passa o piso é metade do que a versão demonstra ("Piso de R² 0,3 e n de pelo menos 10 aplicado antes de desenhar a reta"), e é o texto que quem copiar a peça vai ver na primeira campanha em que a relação existir. A primeira passada já julgou este ramo, pelo mesmo critério.

**O que mudar.** Pela saída da DAD-4: `formatDecimal(Math.abs(fit.inclinacao) * 100, 2)` seguido de ` p.p.`, com o sinal à mão como hoje, por exemplo `+0,12 p.p. de taxa de clique por vez a mais de frequência`. O mesmo `inclinacaoTexto` alimenta rótulo e frase, então a troca é de uma linha. A FORMATO-ACESSIVEL mede esta versão e vai conferir que os dois usam o mesmo formatador.

**Aproveite a mesma rodada (não bloqueia, está no README):** `MARGIN.right` 20 reposiciona o tique `6 vezes` 4,1 px para dentro (x 549,9 contra a grade em 554,0), e `top` 10 deixa o `2,0%` 1,25 px abaixo da grade; `right` 28 e `top` 12 resolvem os dois. No mesmo ramo, a `ReferenceLine` da reta sem `ifOverflow` some inteira se uma ponta do ajuste cair fora do domínio fixo de Y.

## Fora do parecer, segunda passada

* Nenhuma guarda do `check` mede tique fora da linha de grade dele, e o ARMADILHAS não tem entrada para o caso horizontal: a emenda de 2026-10-02 da EIX-6b mediu só o eixo em pé com o de categoria escondido. O mesmo `getTicksEnd` desloca o último tique de X sempre que a meia largura medida dele passa da margem direita, e a medida do Recharts sai maior que a tinta (34,87 px de meia largura para os cerca de 51 px de `R$ 320 mil`). A conferência que pegou o defeito é barata: comparar, no `preview.svg`, o `x` do último `<tspan>` de cada eixo com a borda do plano.
* A emenda não dá tolerância em px para "sai da linha de grade". Esta passada tratou 14,9 px, visível no tamanho natural, como bloqueante, e 4,1 px e 1,25 px, que só se veem ampliados e não mudam a leitura, como observação.
