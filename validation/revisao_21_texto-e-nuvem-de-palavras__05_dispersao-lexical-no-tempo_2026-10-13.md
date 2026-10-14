# Parecer de revisão: 21_texto-e-nuvem-de-palavras/05_dispersao-lexical-no-tempo

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`. `npm run check`: 0 com erro, 0 avisos, 0 escapes.

Como foi medido: nos PNGs de `_render/.qa/21_texto-e-nuvem-de-palavras/05_dispersao-lexical-no-tempo/`, que têm 2 px de imagem por px de CSS, lidos pixel a pixel nos dois temas; nos tokens de `app/src/styles/tokens.css`, com a fórmula de contraste da WCAG; e no dado, refazendo fora do projeto o gerador de semente fixa de cada `data.ts`. Os totais refeitos batem com os impressos nas quatro versões.

O que as guardas não mediram e foi medido à mão: a `OPACIDADE-MARCA` saiu com `sem_opacidade_em_marca` nas quatro, porque a opacidade é calculada (`strokeOpacity={opacity}`), e a `CONTRASTE-MARCA` não lê traço de 1 px. Pixel mais forte de cada traço contra o fundo local:

| Versão | Traços medidos | Claro, mínimo | Escuro, mínimo |
|---|---|---|---|
| `v1` | 233, um por dia com menção | 3,42:1 | 5,55:1 |
| `v2` | 174 | 3,22:1 no neutro, 3,57:1 no destaque | 3,51:1 no neutro, 5,89:1 no destaque |
| `v3` | 179 | 3,57:1 | 5,89:1 |
| `v4` | 72 | 3,25:1, sobre o poço do mês corrente | 5,88:1 |

Nenhum traço abaixo de 3:1, então as perguntas 20 e 30 passam nas quatro.

| Versão | Resultado | Não |
|---|---|---|
| `v1_termos-de-perda-em-2026` | aprovada | nenhum |
| `v2_preco-depois-do-reajuste` | reprovada | 14 e 15 |
| `v3_objecoes-da-pre-vendas-por-dia` | aprovada | nenhum |
| `v4_termo-sem-mencoes-e-mes-parcial` | reprovada | 8 e 15 |

As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova, do que convém corrigir na mesma passada e do que foi pesado e não reprovou.

Não se aplica, nas quatro: perguntas 3, 4, 6, 26, 27, 28, 29 e 31. A pergunta 13 só se aplica à `v2` e à `v4`, e passa nas duas.

Os dois bloqueantes de número 2 têm a mesma raiz: o traço é desenhado no começo do dia (`x: dayNumber(date)`), que é também onde ficam as fronteiras de período (linha do evento, borda do quadro, começo do mês). A correção é a mesma nas duas versões.

## v2_preco-depois-do-reajuste

Resultado: reprovada. Dois bloqueantes, iguais nos dois temas. O resto confere: as contagens batem com o dado (15 e 48, 23 e 33, 27 e 25, 28 e 17, 16 e 8), as janelas têm 91 dias cada, o destaque vem pela chave `highlightId` e ganha peso 700 no nome e no valor, a referência usa `ifOverflow="extendDomain"` com rótulo na margem reservada, e a troca de `--line-strong` por `--text-muted` nas faixas neutras está declarada e é a que o contrato manda (TOK-5).

### Bloqueante 1. Pergunta 14. NUM-6, unidade

**O que o desenho faz.** À direita de cada faixa vem `15 antes, 48 depois`, sem substantivo. A palavra menções não aparece em lugar nenhum do corpo, e a única unidade escrita no cartão é dias, no rodapé (`Antes: 01/04/2026 a 30/06/2026, 91 dias`).

**Evidência.**

* `Chart.tsx`, linha 228: o texto sai de `${formatInt(item.before)} antes, ${formatInt(item.after)} depois`.
* O número conta menções e o traço conta dias com menção. Refeito do `data.ts`: preço tem 15 menções em 11 traços antes e 48 menções em 35 traços depois; concorrente, 23 em 16 e 33 em 22; financiamento, 27 em 21 e 25 em 18; prazo de entrega, 28 em 18 e 17 em 14; atendimento, 16 em 11 e 8 em 8.
* A `v2` não traz a frase que a `v1` traz (`traço mais forte, mais de uma menção no dia`), então nada no desenho parado explica por que 11 traços valem 15.
* A frase acessível diz `15 menções antes e 48 menções depois`: quem ouve recebe a unidade, quem vê não.

**Por que pesa.** Unidade está na lista da seção 14.1 que bloqueia sempre, e aqui o erro tem tamanho: quem conta os traços da faixa em destaque acha 11 e 35, lê 15 e 48, e a unidade mais próxima na tela é dias.

**O que mudar.** O corpo precisa dizer que o número conta menções e por que ele difere do número de traços. Duas saídas, à escolha:

1. Escrever o substantivo na coluna, `15 menções antes, 48 depois`. Mede perto de 181 px a 12 px, então `MARGIN.right` sobe de 148 para perto de 200.
2. Manter o texto curto e nomear a unidade no rodapé, que hoje ocupa perto de metade da linha: `Contagem em menções; traço mais forte, mais de uma menção no dia`.

A frase do traço mais forte entra nas duas saídas.

### Bloqueante 2. Perguntas 15 e 11. Marca coberta pela referência; seção 17.2, um papel por token

**O que o desenho faz.** A linha do reajuste e os traços do dia do reajuste caem na mesma coluna de pixels: o traço é posto no começo do dia (linha 204, `x: dayNumber(mention.date)`) e a `ReferenceLine` também (linha 269, `x={eventDay}`). Nas faixas neutras o traço usa `--text-muted`, o mesmo token da linha de referência.

**Evidência.**

* Dado: em 2026-07-01 há 1 menção de preço e 1 de financiamento.
* PNG, coluna x = 947 (a linha do reajuste), faixa de financiamento: os vãos do tracejado saem preenchidos pelo traço. Tracejado `rgb(127, 143, 171)` contra vão `rgb(103, 119, 146)` no escuro, **1,39:1**; `rgb(92, 107, 135)` contra `rgb(124, 137, 161)` no claro, **1,52:1**. Nas faixas sem menção no dia (concorrente, prazo de entrega, atendimento) o mesmo par mede 4,17:1 nos dois temas.
* Na leitura: na faixa de financiamento a linha do reajuste só parece ficar contínua, e a menção do dia não se lê como menção. Ela entra na contagem `25 depois`.
* Na faixa de preço o traço sai por cima da linha e continua legível (1,5 px em `--chart-1`), mas rajado pelo tracejado que passa por baixo: `rgb(66, 195, 217)` alternando com `rgb(42, 171, 192)` no escuro.
* Não é acaso do dado: o dia do evento é o primeiro dia da janela depois, e toda menção nele cai em cima da linha, em qualquer recorte.

**Por que pesa.** Marca de dado coberta pela referência é a sobreposição da pergunta 15, com consequência medida. E a 17.2 pede um papel por token dentro do visual: aqui `--text-muted` é ao mesmo tempo dado neutro e referência, e é isso que torna a colisão invisível nas faixas neutras.

**O que mudar.**

1. Tirar a marca de cima da fronteira: desenhar o traço no meio do dia (`dayNumber(date) + 0.5`) e levar o domínio até o fim do último dia (`dayNumber(data.end) + 1`). A linha do reajuste fica onde está, na fronteira entre 30/06 e 01/07.
2. Conferir no PNG ampliado, nos dois temas, que a menção de 01/07 de financiamento sai como traço próprio. A 3,39 px por dia, traço e linha ficam a 1,7 px de centro.
3. Se ainda fundirem, a linha de referência passa a ser desenhada só nos vãos entre as faixas e nas margens: o traço ocupa 70% da banda e os 30% restantes ficam livres para ela.

### Na mesma passada, sem peso de bloqueio

1. Frase acessível, linha 214: `em janelas de mesma duração` está escrito à mão. Com janelas desiguais o rodapé mostra os dois números de dias e a frase continua afirmando igualdade. Calcular de `beforeDays === afterDays`.
2. TIP-1: o rodapé (linha 276) e o rótulo da referência (linha 266) têm data e contagem de dias sem `tabular-nums` nem `font-display`. Sem consequência visível.
3. Seção 17.2: o tracejado da referência está em `4 4`; a tabela pede `3 3`. Sem consequência visível.
4. Os traços de 2026-04-01 e de 2026-09-29 (concorrente e financiamento nos dois dias) caem em cima das bordas da área de plotagem. Some com o item 1 do bloqueante 2.

## v4_termo-sem-mencoes-e-mes-parcial

Resultado: reprovada. Dois bloqueantes. Com o dado padrão o desenho separa os três estados como o catálogo pede: a faixa de cancelamento fica, com trilho e `sem menções`; a semana de 2026-09-14 a 2026-09-20 leva quadro tracejado e `formatUnavailable()`; outubro vai em `ReferenceArea` com `--surface-sunken` e a nota `parcial até 13/10/2026`. Os totais batem (45, 24, 14, 9 e zero, 92 no todo), a frase acessível tem 225 caracteres e o estado vazio é o da EST-1.

### Bloqueante 1. Pergunta 8. ANO-4, EIX-10 e EST-2, no ramo que o dado padrão não exercita

**O que o código faz.** A nota do mês parcial só é desenhada quando existe lacuna de coleta, e só a primeira lacuna é desenhada.

**Evidência**, por leitura do `Chart.tsx`. O PNG do dado padrão está certo, porque ele traz uma lacuna e um mês parcial.

* Linha 213: `const gap = data.gaps[0];`. Linha 265: `{gap ? <PeriodNotes ... /> : null}`. O `PeriodNotes` (linhas 163 a 181) escreve as duas notas, `indisponível` e `parcial até`. Com `gaps: []`, que é o valor natural de um período sem coleta parada, a `ReferenceArea` do mês corrente (linha 240) continua pintada e o texto `parcial até` some. Sobra um poço rebaixado sem dizer o que marca, contra a ANO-4, e os dias depois da data de corte passam a ler como dias sem menção, contra a EIX-10.
* Linhas 271 a 274: o rodapé `Quadro tracejado: semana sem coleta, ...` é incondicional. Sem lacuna, ele explica um quadro que não está no desenho.
* Linhas 241 a 243: só `gaps[0]` vira quadro. O tipo é `gaps: readonly CollectionGap[]`, e o comentário do `data.ts` diz que nenhuma menção nesses períodos quer dizer indisponível, e não zero. Uma segunda lacuna sai como faixa vazia, que é ausência exibida como zero.
* Linha 240: a `ReferenceArea` do mês é desenhada mesmo com `asOf` igual a `end`. Mês fechado sairia rebaixado e com `parcial até` o último dia.
* `semana` está escrito à mão no rodapé (linha 273) e na frase acessível (linha 221), qualquer que seja o tamanho da lacuna.

**Por que pesa.** Ausência exibida como zero bloqueia sempre (seção 14.1), e a EST-1b já fixou que defeito de ausência mora no ramo, e não na foto. Esta é a versão de referência para mês parcial e para coleta parada. O uso mais comum no Farol é mês parcial sem lacuna nenhuma, todo dia do mês, e é justamente nele que a nota some.

**O que mudar.**

1. Separar as duas notas: `parcial até` e a `ReferenceArea` do mês dependem só de `asOf` ser anterior ao fim do período; `indisponível` depende das lacunas.
2. Desenhar um quadro e uma palavra por lacuna, percorrendo `data.gaps`.
3. Escrever o rodapé do quadro só quando houver lacuna. `semana` vira `período`, ou sai do tamanho da lacuna, no rodapé e na frase acessível, e a frase passa a citar todas as lacunas ou a contagem delas.

### Bloqueante 2. Pergunta 15. Marca em cima da borda do quadro `indisponível`

**O que o desenho faz.** O traço fica no começo do dia (linha 208) e o quadro da lacuna termina no começo do dia seguinte a ela (linha 242, `x2={dayNumber(gap.to) + 1}`). A menção do primeiro dia depois da lacuna é desenhada em cima da borda direita do quadro.

**Evidência.**

* Dado: orçamento tem 1 menção em 2026-09-21, o dia seguinte à lacuna.
* PNG, colunas x = 692 e 693, faixa de orçamento: a borda tracejada do quadro some sob o traço, `rgb(66, 195, 217)` e `rgb(39, 166, 186)` no escuro, `rgb(31, 109, 128)` e `rgb(72, 146, 158)` no claro. Nas outras três faixas as mesmas colunas mostram a borda em `--text-muted`, `rgb(127, 143, 171)` e `rgb(92, 107, 135)`.
* Na leitura: o quadro que diz `indisponível` ganha um lado ciano na primeira faixa, e a menção parece estar dentro da semana sem coleta.

**Por que pesa.** É colisão de marca com anotação, visível nos dois temas, na versão que existe para separar zero, ausência e menção. O desenho deixa de dizer de que lado da fronteira a menção caiu.

**O que mudar.** A mesma saída da `v2`: traço no meio do dia (`dayNumber(date) + 0.5`), com o domínio e a `ReferenceArea` do mês indo até `dayNumber(data.end) + 1`; o quadro da lacuna fica de `gap.from` a `gap.to + 1`, como já está. A 4,11 px por dia, o traço de 21/09 passa a ficar 2 px à direita da borda, e os de 01/10 (retorno e parcelamento) saem de cima da borda do poço.

### Na mesma passada, sem peso de bloqueio

1. EST-3 e catálogo: o zero medido vem só por extenso, `sem menções`. O catálogo pede a faixa com 0 e o rótulo, e o README do modelo diz zero escrito. `0 menções` põe o algarismo e deixa a coluna homogênea.
2. O trilho do zero, em `--text-muted`, atravessa o quadro da lacuna e os dias depois da data de corte, onde não há medição. Interromper o trilho nesses trechos separa melhor zero de ausência. Pesado e não reprovado: o quadro e o poço cobrem as cinco faixas e dizem o estado por escrito.
3. EIX-3: trilho horizontal nas cinco faixas mais a grade mensal vertical formam grade nos dois sentidos. Bastaria o trilho na faixa sem menção, que é a que ele existe para segurar.
4. TIP-6: a coluna de totais está alinhada à esquerda, e `9 menções` não alinha com `45 menções`. `textAnchor="end"`, como na `v3`.
5. TIP-1: `parcial até 13/10/2026` é `<text>` sem `font-display`. Sem consequência visível.
6. ESP-1: o tracejado do quadro está em `4 3`, fora do múltiplo de 2. Sem consequência visível.
7. O piso de opacidade de 0,66 citado no comentário e na nota vale sobre `--surface-raised`. Sobre `--surface-sunken`, no claro, o piso de `--chart-1` sobe para 0,705. A opacidade de 0,75 passa: 3,28:1 calculado e 3,25:1 medido.

## Pesado e não reprovado, nas aprovadas

* `v1` e `v3`, traço no começo do dia: a mesma convenção dos dois bloqueantes de número 2, mas sem consequência medida. Nelas o traço só cai em cima da grade mensal (dia 1) e das bordas da área (2026-01-01 e 2026-09-30 na `v1`, 2026-08-31 na `v3`), sempre por cima e com o contraste inteiro: os 233 traços da `v1` e os 179 da `v3` foram contados um a um no PNG. Alinhar as duas ao meio do dia é opcional e reabre a revisão delas, porque o arquivo muda.
* `v1` a `v4`, intensidade do traço: 1 e 2 menções medem 1,5:1 entre si (0,72 ou 0,75 contra 0,92 ou 0,94 de opacidade). Lê-se no claro e é sutil no escuro. A `v1` escreve a chave; a `v3` e a `v4` nomeiam a unidade do total, e a dica dá a contagem do dia. Vai como observação; na `v2`, somado à falta de unidade, é o bloqueante 1.
* `v3`, totais sem unidade ao lado do número: a linha acima do gráfico nomeia a coluna (`total de menções à direita`), no papel de cabeçalho. Passa na NUM-5 e na NUM-6.
* `v3`, `--warning` em marca: é estado de um dia, e não série, e vem com ícone e frase no rodapé. Passa na 17.2.
* `v1` a `v4`, traço de 1 px em x fracionário: no preview, com 2 px de imagem por px de CSS, todo traço tem ao menos uma coluna cheia. Em tela de 1 px por px a suavização pode repartir o traço em duas colunas mais fracas. Fora do que o preview mostra; vai como observação.

## Registro

```
Versão: 21_texto-e-nuvem-de-palavras/05_dispersao-lexical-no-tempo/v1_termos-de-perda-em-2026
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 13, 26, 27, 28, 29, 31

Versão: 21_texto-e-nuvem-de-palavras/05_dispersao-lexical-no-tempo/v2_preco-depois-do-reajuste
Data: 2026-10-13
Resultado: reprovada
Não: 14, 15
Correções:
  14. NUM-6: nomear a unidade da contagem antes e depois (menções) e escrever a chave do traço mais forte.
  15. Seção 17.2 e sobreposição: tirar o traço do dia do evento de cima da linha de referência (traço no meio do dia, domínio até end + 1).
Não se aplica: 3, 4, 6, 26, 27, 28, 29, 31

Versão: 21_texto-e-nuvem-de-palavras/05_dispersao-lexical-no-tempo/v3_objecoes-da-pre-vendas-por-dia
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 13, 26, 27, 28, 29, 31

Versão: 21_texto-e-nuvem-de-palavras/05_dispersao-lexical-no-tempo/v4_termo-sem-mencoes-e-mes-parcial
Data: 2026-10-13
Resultado: reprovada
Não: 8, 15
Correções:
  8. ANO-4, EIX-10, EST-2: soltar a nota parcial até da existência de lacuna, desenhar todas as lacunas de data.gaps e condicionar o rodapé do quadro.
  15. Colisão: tirar o traço de 2026-09-21 de cima da borda do quadro indisponível (traço no meio do dia, domínio até end + 1).
Não se aplica: 3, 4, 6, 26, 27, 28, 29, 31
```
