# Parecer de revisão: 15_mapa-de-calor-e-calendario/03_cohort-em-triangulo

Data: 2026-10-15. Revisor independente. Julgadas as quatro versões: `v1` por `revisao_desatualizada`
(o `Chart.tsx` trocou o trilho de `bg-surface-overlay` para `bg-surface-sunken` depois da reprovação de
2026-09-28) e `v2`, `v3` e `v4` por `sem_revisao`. Julgado o arquivo de hoje contra o contrato de hoje.
PNGs de 2026-10-02, posteriores a todos os `Chart.tsx` (2026-09-28 e 2026-09-29).

`npm run check` com tipos: 0 com erro, 2 avisos, os dois na `v1` (AGREGACAO-ZERO nas linhas 55 e 126,
a primeira em dívida conhecida). As guardas de texto, contraste e colisão não medem esta abordagem
(`texto_em_html`, `marca_html`), então contraste e encaixe foram conferidos à mão nos PNGs e nos tokens.

Resultado: `v2` e `v3` aprovadas; `v1` reprovada com três bloqueantes; `v4` reprovada com dois.

## Resumo para o corretor

* `v1`, bloqueante 1: a frase acessível elege o melhor cohort comparando idades diferentes. Pergunta
  19; ACE-1 e seção 11.
* `v1`, bloqueante 2: não há estado vazio, e com `data` vazio a legenda escreve `0%` e `100%`.
  Pergunta 16; EST-1 e EST-1b.
* `v1`, bloqueante 3: o eixo de colunas `M0` a `M6` não tem unidade em lugar nenhum do cartão.
  Pergunta 14; NUM-6, ROT-8 e GEO-13.
* `v4`, bloqueante 1: no modo contagem, a linha "Média ponderada" imprime uma soma. Pergunta 14; NUM-5.
* `v4`, bloqueante 2: a conclusão da linha de leitura e da frase acessível é texto fixo, e a causa
  dita está errada. Perguntas 17 e 19; ANO-5, ACE-1 e seção 11.

Tudo se resolve no `Chart.tsx`. Os `data.ts` ficam como estão. As três irmãs já trazem a saída
pronta para a `v1`: o retorno de vazio e o `extent` nulo da `v2` (linhas 83 a 91 e 161 a 172), o
`bestAt` em idade fixa da `v3` (linhas 115 a 127) e a linha de legenda de `M0` da `v2` (linha 347).

## v1_agenda-por-cohort-mensal-de-entrada

```
Versão: 15_mapa-de-calor-e-calendario/03_cohort-em-triangulo/v1_agenda-por-cohort-mensal-de-entrada
Data: 2026-10-15
Resultado: reprovada
Não: 14, 16, 19
Correções:
  14. NUM-6, ROT-8, GEO-13: dizer na legenda que M0 é o mês de entrada e M6 são seis meses depois, e que a diagonal é um mês de calendário.
  16. EST-1, EST-1b: data vazio vira bloco role="status" no lugar do visual, e min e max saem de um extent que devolve null.
  19. ACE-1: a conclusão da frase compara cohorts numa idade fixa, nunca o último período fechado de cada um.
Não se aplica: 6, 13, 18, 27, 28, 29
```

**Bloqueante 1, pergunta 19 (ACE-1, seção 11).** A frase gravada no preview diz "O melhor é o cohort
de mar/26, com 21,5% em M5". O campeão sai das linhas 75 a 84: para cada cohort, o último período
fechado, e o maior desses valores, isto é M6 de jan/26 contra M5 de mar/26 contra M3 de mai/26. É a
comparação entre idades diferentes que o próprio README diz que o triângulo existe para evitar ("se os
números do começo do ano só tiveram mais tempo para amadurecer"). Na mesma idade a tabela responde o
contrário: em M1, de 14,2% (jan/26) a 17,3% (jul/26); em M2, mai/26 lidera com 19,9% contra 18,8% de
mar/26; em M3, mai/26 tem 21,4% contra 20,3% de mar/26. O caso de uso pergunta se os cohorts recentes
convertem mais rápido, e quem ouve a frase sai com a resposta de que o melhor é um cohort antigo.
**O que mudar:** escolher o melhor numa idade fixa só entre períodos fechados (o `bestAt` da `v3`), ou
escrever a comparação que o caso de uso pede, calculada, por exemplo o primeiro contra o último cohort
fechado em M1.

**Bloqueante 2, pergunta 16 (EST-1, EST-1b).** Não há retorno para `data` vazio. Com `[]`, o cabeçalho
`Entrada`, `Leads`, `M0` a `M6` e o rodapé "Média ponderada" continuam na tela, e a legenda escreve
`formatPercent(min, 0)` e `formatPercent(max, 0)` com os recuos das linhas 55 e 56, isto é "0%" e
"100%": uma faixa de escala que nenhuma medida produziu. É o aviso AGREGACAO-ZERO da linha 55, que a
fila de dívida deixa passar no `check` mas que aqui chega a texto. **O que mudar:** o bloco
`role="status"` com `Filter` de 16 px e frase de 12 px em `--text-muted`, como nas linhas 161 a 172
da `v2`, e o domínio da rampa por um `extent` que devolve `null`.

**Bloqueante 3, pergunta 14 (NUM-6, ROT-8, GEO-13).** O eixo de colunas sai rotulado `M0` a `M6`
(linhas 108 a 112) e nada no cartão diz que M é mês decorrido desde a entrada: a legenda (linhas 187
a 190) fala em taxa acumulada, tracejado, célula vazia e média, e o subtítulo não toca no assunto.
`M3` lido como março muda a leitura da tabela inteira, e a terceira leitura do formato, a diagonal
como mês de calendário, também não se nomeia na tela (só na frase acessível). O README do modelo,
Anatomia item 11, pede as duas coisas, e a nota do `meta.json` da `v2` registra que a `v1` não faz.
**O que mudar:** acrescentar à legenda a linha da `v2` (`M0 é a entrada e M6 são seis meses depois`,
calculada de `ELAPSED_MONTHS`) e trocar "tracejado: período em curso" por
"tracejado: set/26 de calendário, em curso", a partir de `CURRENT_MONTH`.

**Não bloqueante, para a mesma rodada.** (a) O trilho de `bg-surface-sunken` na coluna Leads é o token
que a tabela do contrato permite para trilho, e por isso deixou de ser bloqueante; mede 1,15:1 contra
o cartão e o README do modelo pede a coluna sem trilho, como nas irmãs. (b) O tracejado da célula em
curso sai em `--text-primary`, e o traço contra o preenchimento da própria célula mede 1,44:1 no
escuro e 2,17:1 no claro sobre `--seq-7`; nos PNGs ele ainda se vê porque a borda encosta no cartão,
mas as irmãs usam a tinta do número. (c) A legenda escreve só os extremos (5% e 22%), sem a fronteira
de cada faixa. (d) A borda superior do rodapé é divisória que a ESP-5 proíbe.

## v4_periodo-parcial-e-cohort-pequeno

```
Versão: 15_mapa-de-calor-e-calendario/03_cohort-em-triangulo/v4_periodo-parcial-e-cohort-pequeno
Data: 2026-10-15
Resultado: reprovada
Não: 14, 17, 19
Correções:
  14. NUM-5: no modo contagem, a linha do rodapé diz o agregado que imprime (total, e de quantos cohorts fechados) ou continua em taxa.
  17. ANO-5: a comparação da linha de leitura sai do dado (maior ou menor) e a causa da célula sem intensidade é o piso de 30 leads.
  19. ACE-1: "lidera" só quando o cohort ralo é o máximo das células fechadas da coluna; senão, "marca".
Não se aplica: 6, 13, 18, 27, 28, 29
```

**Bloqueante 1, pergunta 14 (NUM-5).** No modo contagem, a linha rotulada "Média" e "ponderada"
(linhas 405 a 410) imprime `formatInt(average.booked)` (linha 421), e `weightedRate` (linhas 122 a
135) acumula em `booked` a **soma** das agendas dos cohorts fechados. Com o dado padrão, ao clicar em
"contagem", M0 sai 298 (33 + 0 + 36 + 49 + 56 + 60 + 64) contra células de 0 a 64, e M1 sai 455:
uma "média" maior do que todas as células que ela resume. Cada coluna soma ainda um número diferente
de cohorts, então nem como total as colunas se comparam. O defeito não aparece no preview, porque a
§13 grava só o estado inicial, e foi conferido na leitura do código; o alternador é item do "O que
demonstra" desta versão, então o estado de contagem é parte do que ela afirma. **O que mudar:** no
modo contagem, ou a linha continua em taxa com o rótulo dizendo isso, ou o rótulo vira "Total" e a
legenda diz que é a soma dos cohorts fechados em cada idade (NUM-5: o agregado dito no rótulo).

**Bloqueante 2, perguntas 17 e 19 (ANO-5, ACE-1, seção 11).** A linha de leitura (linha 260) termina
em ": a taxa maior é a da base menor, e é por isso que ela não recebe intensidade", e a frase
acessível (linha 247) diz que o cohort ralo "lidera" M6. As duas afirmações são texto fixo:
`confrontAt` (linhas 155 a 178) devolve o primeiro cohort ralo e o maior cohort cheio, sem comparar as
taxas e sem conferir se o ralo é o máximo da coluna. No preview é verdade (25,0% contra 19,9%), mas
com um cohort ralo que converta menos, por exemplo fev/26 com 1 de 12 em M6, o cartão imprimiria
"8,3% (1 de 12) e jan/26 marca 19,9% (82 de 412): a taxa maior é a da base menor". E a causa escrita
está errada mesmo no preview: a célula perde a intensidade porque `size < MIN_SAMPLE` (linha 190),
qualquer que seja a taxa, e não por ter a taxa maior. **O que mudar:** calcular a comparação
(`thinBooked / thinSize` contra `fullBooked / fullSize`) e escolher "maior" ou "menor" por ela; usar
"lidera" só quando o ralo for o máximo das células fechadas de M6; escrever a causa pelo piso,
"fica sem intensidade por ter menos de 30 leads", com `formatInt(MIN_SAMPLE)`.

**Não bloqueante, para a mesma rodada.** (a) A fronteira "19%" da legenda é 18,5% arredondado, e a
célula de 18,7% (jan/26, M3) sai pintada na faixa que a legenda diz começar em 19%. (b) A linha de
leitura quebra em duas linhas, contra a ANO-5. (c) A anotação "1 cohort sem entradas e 1 período sem
medição" repete a legenda e a frase, e não flexiona plural. (d) O botão "contagem" não pressionado
não tem forma de botão, só texto em `--text-secondary`.

## Aprovadas: v2 e v3

Sem bloqueante nas duas. Observações registradas no README do modelo, seção "Observações da revisão
(não bloqueantes)". A média do rodapé que cai de uma coluna para a seguinte por mudança de população
(v1 M6 19,8% abaixo de M5 20,3%; v4 M3 21,8% abaixo de M2 22,8%, com mar/26 fora de M2 pela célula sem
medição) já é pendência conhecida do README, e não foi tratada como bloqueante. A legenda da `v4`,
ao contrário da `v1`, da `v2` e da `v3`, não diz que a média deixa de fora o período em curso; vale
acrescentar a linha na mesma rodada.
