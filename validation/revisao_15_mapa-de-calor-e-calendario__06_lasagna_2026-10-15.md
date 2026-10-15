# Parecer de revisão: 15_mapa-de-calor-e-calendario/06_lasagna

Data: 2026-10-15. Revisor independente, primeira passada da `v2`, da `v3` e da `v4`, as três em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render de 2026-10-02, posterior aos `Chart.tsx` de 2026-09-29). `npm run check` com tipos: 0 com erro, 1 aviso (a dívida conhecida de `TAMANHO-TEXTO` da `v1`, que não entrou nesta passada), 0 escapes.

| Versão | Resultado | Não |
|---|---|---|
| `v2_ocupacao-semanal-por-sdr` | aprovada | nenhum |
| `v3_dias-parados-das-oportunidades-abertas` | reprovada | 1, 8 |
| `v4_inicio-tardio-e-agregacao-semanal` | reprovada | 14, 15 |

Não se aplica, nas três: perguntas 4, 6, 7, 13, 18, 27, 28, 29 e 31. Na `v3` e na `v4` também a 30, porque nenhuma marca declara opacidade.

## O que foi medido

* **Do `data.ts`, refeito fora do componente:** na `v2`, a média das 25 semanas fechadas de cada SDR (Gustavo D. 30,55 h, 101,8%) e a contagem da frase (3 acima de 100% na média, 4 com semana acima do teto). Na `v3`, a mesma regra de contagem do componente sobre as 200 linhas: 81 criadas até 01/06/2026, o primeiro movimento de cada uma dentro da janela e as paradas há 30 dias ou mais (47). Na `v4`, a média por dia com registro das colunas de Marta V., Bianca M. e Elias G. e as 3 colunas hachuradas e 2 de zero.
* **Cor, pelos hex resolvidos nos dois `preview.svg`:** contraste de cada degrau contra o cartão, de degrau contra degrau e do contorno contra o preenchimento; ΔE76 em visão comum e em simulação de deuteranopia e protanopia (Machado 2009, severidade 1).
* **PNGs ampliados** no início da janela da `v3` e nas linhas de cima da `v2`, nos dois temas.
* **Textos de tela da `v4`**, lidos do `preview.svg`: os 24 trechos, sem nenhum "reuniões".
* **Não medido:** o estado vazio das três e a `v4` com `granularity="dia"`, que são leitura do código; as saídas sugeridas não foram testadas.

## `v3_dias-parados-das-oportunidades-abertas`: reprovada

### Bloqueante 1. Pergunta 8; EIX-10 e DAD-2; seção 14.1 (ausência exibida como zero)

**O que o código faz.** `laneOf` (`Chart.tsx`, linhas 121 a 152) começa a contagem em `reference = firstDay = max(created, 0)`. Para quem foi criado antes de 01/06/2026 isso é o primeiro dia da janela: a oportunidade sai com zero dia parado em 01/06 sem nenhum movimento no dado. O `data.ts` não traz movimento anterior à janela (nenhuma data de `moves` antes de 2026-06-01), e diz no cabeçalho, linhas 13 e 14, que a oportunidade sem movimento "conta os dias parados desde a criação". O componente faz o contrário. O `notes` declara o recorte, mas a tela não.

**Evidência.**

* 81 das 200 linhas foram criadas até 01/06/2026. Destas, 55 não têm movimento nos três primeiros dias e saem como "até 2 dias" de 01 a 03/06; 28 não têm movimento até o oitavo dia e saem como "3 a 7 dias" de 04 a 08/06.
* 11 nunca andaram dentro da janela (opp-013, criada em 31/10/2025, opp-014, opp-020 e outras oito). No desenho, o mês de junho delas é a rampa inteira, de "até 2 dias" a "15 a 29 dias", e só chegam a "mais de 29 dias" em 01/07. Pelo próprio `data.ts`, opp-013 tinha 213 dias parados em 01/06.
* No PNG, nos dois temas, as linhas 1 a 81 têm bordas verticais alinhadas nos dias 3, 8, 15 e 30 de junho. É exatamente o sinal que o README manda ler como evento sistêmico ("a coluna inteira que muda de cor"), e aqui ele é artefato do corte da janela.
* A contagem de hoje não muda (47 com o corte e 47 contando da criação), porque o limiar de 30 dias fica dentro da janela. O que mente são as células de junho.

**O que mudar.** Critério de aceite: nenhuma célula de oportunidade criada antes da janela afirma um número de dias parados que o dado não sustenta.

1. Preferível, porque o dado é fictício: dar ao `data.ts` o último movimento anterior à janela (campo como `lastMoveBefore`, `null` quando nunca andou desde a criação) e começar a contagem nele, ou na criação quando for `null`, como o cabeçalho do `data.ts` já promete.
2. Se a peça quiser demonstrar histórico desconhecido, o trecho até o primeiro movimento dentro da janela sai como ausência declarada (hachura ou contorno, com item na legenda), nunca como degrau da rampa.
3. Depois, refazer o `37% dos dias caem no primeiro degrau` da frase, a distribuição citada no `notes` e a frase do `notes` que justifica o corte.

### Bloqueante 2. Pergunta 1; README do modelo e catálogo (a forma responde à pergunta do caso de uso)

**O que está escrito.** O `useCase` do `meta.json`, que vira o subtítulo, pergunta "e quais nunca andaram?". O catálogo pergunta "e quais nunca voltaram a andar?".

**Por que reprova.** "Nunca voltaram a andar" o desenho responde: é o degrau "mais de 29 dias" na coluna de hoje e a contagem "47 paradas há 30 dias ou mais". "Nunca andaram" ele não responde: são 16 linhas (11 anteriores à janela e 5 criadas dentro dela), nenhuma marca as distingue de quem andou uma vez e parou, a contagem não está na tela, e com o Bloqueante 1 as 11 antigas ainda parecem ter andado em 01/06.

**O que mudar.** Voltar ao texto do catálogo, que é o que a peça responde; ou, mantendo a pergunta, escrever na tela quantas nunca andaram e dar a elas um canal próprio.

```
Versão: 15_mapa-de-calor-e-calendario/06_lasagna/v3_dias-parados-das-oportunidades-abertas
Data: 2026-10-15
Resultado: reprovada
Não: 1, 8
Correções:
  1. README e catálogo: o subtítulo pergunta "quais nunca andaram", que o desenho não identifica; voltar a "quais nunca voltaram a andar" ou escrever a contagem com canal próprio.
  8. EIX-10, DAD-2 e 14.1: a contagem das 81 oportunidades anteriores à janela começa em zero em 01/06 sem movimento no dado; dar o último movimento anterior no data.ts (ou contar da criação) ou desenhar o trecho sem histórico como ausência declarada.
Não se aplica: 4, 6, 7, 13, 18, 27, 28, 29, 30 e 31
```

**Na mesma passada, sem peso de bloqueio** (no README): amostra de "até 2 dias" em bloco cheio quando a marca é faixa fina; "47 paradas" sem substantivo; posições da legenda como número solto no JSX.

## `v4_inicio-tardio-e-agregacao-semanal`: reprovada

O que a versão demonstra está no código e na tela: nenhuma célula antes da admissão, hachura para semana sem registro, zero medido em `--text-muted` com o "0" vazado (5,21 e 5,37:1), semana da admissão calculada só sobre os dias em que o SDR existia, média por dia com registro e não por sete, três degraus `--seq-5` a `--seq-7` acima de 3:1 nos dois temas. Os dois bloqueantes são de leitura do que a cor e o eixo dizem.

### Bloqueante 1. Pergunta 14; NUM-6; seção 14.1 (unidade)

**O que está na tela.** Os 24 textos do `preview.svg`: título "Início tardio e agregação por semana", subtítulo "Como mostrar SDR admitido no meio da janela sem pintar de zero o que veio antes?", legenda "até 1,5 por dia", "1,5 a 3,0 por dia", "mais de 3,0 por dia", "zero medido", nota "182 dias em 26 semanas, média por dia". Nenhum diz o que é contado. "Reuniões" só existe na frase acessível ("Mapa de reuniões por dia"), que quem enxerga não lê.

**Por que reprova.** A NUM-6 manda a unidade em todo lugar em que o número aparece, e contagem solta leva o substantivo. Sem ele a cor da grade não tem grandeza: 1,5 de quê por dia. É o mesmo defeito da DAD-9, com a grandeza no lugar do período.

**O que mudar.** Pôr o substantivo nos rótulos da legenda ("até 1,5 reunião por dia", "1,5 a 3,0 reuniões por dia", "mais de 3,0 reuniões por dia") ou numa nota de escala ("reuniões agendadas por dia, média da semana"). Conta de espaço, para escolher: com `SLOT_ONE = 140` o substantivo em cada rótulo da primeira linha não cabe ("1,5 a 3,0 reuniões por dia" mede cerca de 135 px e começa em 160); a nota de escala, na terceira linha, cabe trocando "média por dia" por "média de reuniões por dia", se a linha for conferida no render contra os 574 px.

### Bloqueante 2. Pergunta 15; eixo de tempo; seção 14.1 (tique perdido)

**O que o código faz.** `MIN_TICK_GAP = 48` (`Chart.tsx`, linhas 61 e 213) descarta o rótulo de mês que nasce a menos de 48 px do anterior. A janela começa em 30/03/2026: a coluna 0 tem dois dias de março e cinco de abril e recebe "mar/26"; a coluna 1, primeira semana de abril, nasceria "abr/26" a 18,5 px e é descartada. O descarte cai sobre a virada de mês, que é o rótulo que o README manda ter ("rótulo só na virada de mês"), e preserva o da semana parcial do começo.

**Evidência, nos dois PNGs.** O eixo lê "mar/26, mai/26, jun/26, jul/26, ago/26, set/26". Abril não existe no eixo, e as colunas 0 a 4, das quais quatro são abril inteiro, ficam sob "mar/26". Nada na tela dá a data de início da janela para o leitor corrigir.

**Por que reprova.** A seção 14.1 lista tique perdido entre as consequências visíveis que bloqueiam, e aqui ele muda a data que o eixo atribui a quatro de 26 colunas. A versão existe para mostrar quando cada SDR entrou, e o eixo é o único lugar onde se lê o quando.

**O que mudar.** Na colisão, descartar o rótulo da coluna 0 quando ela for semana parcial do mês anterior e manter a virada ("abr/26" na coluna 1), como a `v1` faz ao não rotular o começo da janela, e escrever o início na nota de escala (por exemplo "182 dias desde 30/03/2026, em 26 semanas"), por `formatDate`. Conferir também a granularidade `dia`, onde a mesma regra descarta "abr/26" a 5,3 px de "mar/26".

```
Versão: 15_mapa-de-calor-e-calendario/06_lasagna/v4_inicio-tardio-e-agregacao-semanal
Data: 2026-10-15
Resultado: reprovada
Não: 14, 15
Correções:
  14. NUM-6 e 14.1 (unidade): a tela nunca diz que a cor conta reuniões; pôr o substantivo na legenda ou na nota de escala.
  15. Eixo e 14.1 (tique perdido): MIN_TICK_GAP descarta abr/26 e deixa quatro semanas de abril sob mar/26; na colisão descartar o rótulo da semana parcial do começo, manter a virada e escrever o início da janela na nota.
Não se aplica: 4, 6, 7, 13, 18, 27, 28, 29, 30 e 31
```

**Na mesma passada, sem peso de bloqueio** (no README): a marca "primeiro dia" de Otávio S. fica em 29/06, na borda da semana, e não em 01/07; "26 colunas de 182 dias" na frase acessível; `SLOT_TWO_B + 20` solto no JSX.

## `v2_ocupacao-semanal-por-sdr`: aprovada

Sem "não". O que sustentou o aceite: nove linhas pela média das semanas fechadas, a maior no topo, com a média escrita à direita por `formatPercent`; cinco degraus com o teto escrito, o limiar de 100% na troca de matiz e reforçado por contorno em `--warning`; semana sem agenda hachurada e fora da média; semana em curso com moldura tracejada, ocupação sobre os dois dias decorridos e fora da média; degraus internos a 0,7 de opacidade em 5,30 e 3,25:1 (`--chart-1`) e 3,28 e 3,67:1 (`--negative`), escuro e claro; frase acessível de 205 caracteres, verdadeira contra o dado (3 acima de 100% na média, 4 com semana acima do teto). As observações estão no README; a de daltonismo tem peso e vale para quem for mexer na escala.

```
Versão: 15_mapa-de-calor-e-calendario/06_lasagna/v2_ocupacao-semanal-por-sdr
Data: 2026-10-15
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 7, 13, 18, 27, 28, 29 e 31
```

## Régua e ferramenta

* A `TOK-8` se contradiz: a Saída aceita quatro ou mais degraus sem número na célula se o README declarar que a cor não ordena, e o parágrafo da linha 1098 chama a mesma coisa de "mentira de desenho". O catálogo pede cinco faixas sequenciais na `v3`, sem número na célula. Julguei pela Saída, que é o que a `CONTRASTE-MARCA` aplica (três ou mais degraus `--seq-*` saem de fora), e deixei como observação.
* Nenhuma guarda vê ausência de histórico virando zero quando o zero nasce de um `max(created, 0)` e não de uma função de agregação: a `AGREGACAO-ZERO` mediu a `v3` e não acusou.
* Nenhuma guarda confere se a grandeza que a cor codifica está escrita na tela; a `v4` passa com o substantivo só na frase acessível.
* O `meta.json` pode trocar o caso de uso do catálogo por outra pergunta (`v3`, "nunca voltaram a andar" virou "nunca andaram") e nada confere uma coisa contra a outra.

---

# Segunda passada: `v3` e `v4`, depois da rodada de correção

Data: 2026-10-15. Revisor independente, outro agente, julgando os arquivos de hoje (`Chart.tsx` das duas
às 08:21, PNGs e previews às 08:22), em `revisao_desatualizada`. `npm run check` com tipos: 0 com erro,
1 aviso (a dívida de `TAMANHO-TEXTO` da `v1`, fora desta passada), 0 escapes.

| Versão | Resultado | Não |
|---|---|---|
| `v3_dias-parados-das-oportunidades-abertas` | reprovada | 8 |
| `v4_inicio-tardio-e-agregacao-semanal` | aprovada | nenhum |

## O que foi medido

* **`v3`, a regra do componente refeita fora dele** sobre o `data.ts`: 81 oportunidades criadas até
  01/06/2026 e 119 depois; 47 paradas há 30 dias ou mais no último dia; distribuição dos 18.035 dias
  pintados em 36,1 / 24,4 / 12,2 / 9,7 / 17,5% (confere com o `notes` e com os 36% da frase); 3.435
  `rect` no `preview.svg`. Contagem, dia a dia, das oportunidades em "mais de 29 dias".
* **`v3`, um caso de teste** passado pela mesma regra: criada em 2025-10-05, movimentos em 2026-05-30 e
  2026-06-10.
* **`v3`, o início da janela ampliado** nos dois PNGs (recorte das linhas 1 a 81, junho).
* **`v4`, contra o `data.ts`:** colunas hachuradas (Luana P. em 25/05, Bianca M. em 27/07, Elias G. em
  31/08), zeros (Otávio S. em 17/08, Elias G. em 14/09), semana da admissão de Otávio S. e Bianca M.
  sobre os dias em que já existiam, e os 24 textos do `preview.svg`.
* **`v4`, os rótulos de mês** recalculados nos dois passos: em `semana`, abr/26 na coluna de 06/04 e
  mar/26 descartado; em `dia`, mar/26 (coluna 0) cede a abr/26 (coluna 2, a 5,3 px).

## `v3_dias-parados-das-oportunidades-abertas`: reprovada

O bloqueante 2 da primeira passada foi resolvido: o subtítulo pergunta "quantas seguem há 30 dias ou
mais" e a tela escreve "47 paradas há 30 dias ou mais", que confere com o dado. O bloqueante 1 foi
corrigido só no ramo de reserva, e o defeito mudou de lado.

### Bloqueante. Pergunta 8; EIX-10 e DAD-2; seção 14.1 (encoding: a cor afirma dias parados que o dado não sustenta)

**O que o código faz.** `laneOf` (`Chart.tsx`, linhas 121 a 153) agora começa em
`reference = created`, a criação, mesmo antes da janela. Mas a linha 127,
`if (index >= 0 && index < days) moveDays.add(index);`, descarta todo movimento anterior a 01/06/2026:
ele nunca chega a ser referência. A contagem não reinicia num movimento anterior à janela, embora o
catálogo diga "reiniciando a cada movimento", o item 9 do README diga "parte da criação (inclusive antes
da janela, sem movimento anterior no dado) e reinicia a cada movimento" e o cabeçalho do `data.ts` diga
o mesmo. O tipo `OpportunityMoves.moves` aceita qualquer data, e nada avisa quem cola que o histórico
é jogado fora.

**Evidência.**

* Caso de teste pela regra do componente: oportunidade criada em 2025-10-05, movida em 2026-05-30 e em
  2026-06-10. O componente pinta 01 a 09/06 como "mais de 29 dias" (239 a 247 dias). Pelo dado, são 2 a
  10 dias: "até 2 dias", "3 a 7 dias" e "8 a 14 dias". É a mesma célula de borda que reprovou na
  primeira passada, errada agora para cima. No Farol, oportunidade antiga tem histórico, então este é o
  caso comum, não a exceção.
* O critério de aceite da primeira passada ("nenhuma célula de oportunidade criada antes da janela
  afirma um número de dias parados que o dado não sustenta") falha com o primeiro dado que tiver
  histórico. Das duas saídas propostas, a preferida (último movimento anterior à janela no `data.ts`,
  com a criação só quando ele for `null`) não pode ser aplicada sem mexer na linha 127: o componente
  descartaria o campo.
* No preview, o `data.ts` não tem nenhum movimento antes de 01/06 (0 de 200 oportunidades), porque o
  cabeçalho passou a declarar que não há histórico. Resultado medido: em "mais de 29 dias" estão 59 das
  81 oportunidades antigas em 01/06 (73%), 46 em 03/06, 27 em 07/06 e 19 em 14/06, contra 12 de 123
  (10%) no dia 30 da janela. 50 das 81 dão o primeiro passo em menos de uma semana depois de 8 meses
  paradas. Nos dois PNGs, ampliados, as linhas 1 a 81 abrem junho com uma faixa escura (claro) ou clara
  (escuro) de 1 a 20 dias, alinhada à esquerda: é a "coluna inteira que muda de cor" que o README manda
  ler como evento sistêmico, e ela vem do corte da janela no gerador do dado, não da operação.

**O que mudar.**

1. Em `laneOf`, a referência inicial passa a ser o último movimento com índice negativo (anterior à
   janela), e a criação só quando não houver nenhum. Movimento anterior à criação continua impossível
   e pode ser ignorado.
2. No `data.ts`, dar às oportunidades antigas o histórico que a regra lê: a maioria com um movimento
   anterior a 01/06 em datas espalhadas, e algumas sem movimento desde a criação, que é o caso difícil
   do "nunca andou". O preview deixa de abrir com a faixa de borda.
3. Refazer o que depende da contagem: os 36% da frase, a distribuição do `notes`, o parágrafo do `notes`
   que justifica a contagem desde a criação, o cabeçalho do `data.ts` e o item 9 do README, que passam a
   dizer "último movimento, inclusive antes da janela; criação quando não houver".
4. Conferir nos dois PNGs que a coluna de 01/06 não destoa das vizinhas sem motivo no dado.

```
Versão: 15_mapa-de-calor-e-calendario/06_lasagna/v3_dias-parados-das-oportunidades-abertas
Data: 2026-10-15
Resultado: reprovada
Não: 8
Correções:
  8. EIX-10, DAD-2 e 14.1 (encoding): laneOf descarta movimento anterior à janela e conta da criação; tomar o último movimento anterior como referência inicial e dar esse histórico ao data.ts.
Não se aplica: 4, 6, 7, 13, 18, 26, 27, 28, 29, 30 e 31
```

**Sem peso de bloqueio** (no README): "vazio" sem amostra na legenda; `useCase` diferente do catálogo;
legenda abaixo do gráfico; as observações da primeira passada seguem no arquivo.

## `v4_inicio-tardio-e-agregacao-semanal`: aprovada

Sem "não". Os dois bloqueantes da primeira passada foram resolvidos. A grandeza está na tela
("reuniões por dia, linhas por admissão", na segunda linha da legenda). Na colisão de rótulos, a semana
parcial do começo cede à virada: o eixo lê abr/26, mai/26, jun/26, jul/26, ago/26, set/26, e o início
da janela está na nota ("26 semanas desde 30/03/2026, média por dia"). O resto se sustenta contra o
dado: nenhuma célula antes da admissão das quatro que entraram depois, 3 colunas hachuradas e 2 de
zero medido com o "0" vazado em `--surface-raised` (5,21 e 5,37:1), média por dia com registro, três
degraus `--seq-5` a `--seq-7` acima de 3:1 nos dois temas, frase acessível verdadeira.

```
Versão: 15_mapa-de-calor-e-calendario/06_lasagna/v4_inicio-tardio-e-agregacao-semanal
Data: 2026-10-15
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31 e 32
```

## Régua e ferramenta, segunda passada

* Nenhuma guarda nem pergunta do checklist alcança dado que o componente joga fora antes de calcular
  (o filtro `index >= 0` da `v3`). É a mesma família da `EST-1b`, "o defeito mora no ramo, não na
  foto", fora de uma função de agregação, e passa no `check` e nos PNGs.
