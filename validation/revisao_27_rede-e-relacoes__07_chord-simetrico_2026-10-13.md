# Parecer de revisão: 27_rede-e-relacoes/07_chord-simetrico

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render das 17:57:44 em diante, posterior ao último `Chart.tsx`, das 17:57:18). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes.

Resultado: duas aprovadas e duas reprovadas. A `v1` e a `v2` caem pela mesma causa de desenho: o contorno que separa as fitas é pintado por cima do preenchimento da própria fita e consome, de cada uma, a mesma largura em pixels, qualquer que seja o valor. Na fita larga isso não aparece; na fina, a fita some. Na `v1` três pares ficam sem fita e o cartão não avisa; na `v2` a perda cai nas fitas do produto em foco, que são o assunto do cartão. A `v2` tem ainda um bloqueante de conta: os percentuais do painel somam 101. A `v3` não tem fita fina e passa limpa. A `v4` usa o mesmo contorno, mas o limiar dela segura o pior caso e toda fita desenhada chega com tinta e cor às duas pontas; o que sobra está no README como observação, com peso. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

| Versão | Resultado | Não |
|---|---|---|
| `v1_produtos-na-mesma-carteira` | reprovada | 15 |
| `v2_produto-mais-associado-ao-credito-estruturado` | reprovada | 6 (e 14), 15 |
| `v3_clientes-com-um-produto-so` | aprovada | nenhum |
| `v4_origens-demais-agrupadas-em-outros` | aprovada | nenhum |

Não se aplica, nas quatro: perguntas 3, 4, 7, 13, 18, 26, 27, 28, 29, 30 e 31. Na `v1`, na `v3` e na `v4` também a 6, porque nenhuma imprime percentual.

## O que foi medido e o que não foi

* **Refeito do `data.ts`, à mão:** na `v1`, os 20 pares e o total dos 7 arcos (333, 276, 200, 263, 169, 200 e 37; 739 em pares). Na `v2`, os 218 clientes do foco e os seis percentuais. Na `v3`, os 8 pares, as 6 diagonais, os totais (355, 265, 118, 257, 195 e 74), 476 de 870. Na `v4`, as 32 linhas do dado, os 21 pares depois do agrupamento, os 7 totais (392, 340, 326, 191, 234, 115 e 168; 883 em pares), os 3 pares abaixo do limiar e os 25 leads dos 3 pares internos de Outros.
* **Geometria, refeita fora do componente com a mesma regra** (ângulo por unidade, vão de 0,05 rad, subarcos por peso, fita por curva quadrática com o centro como ponto de controle): largura nominal de cada fita na ponta e no ponto mais fino, em px de tela.
* **Escala da roda, lida em página viva e conferida por ajuste de círculo no PNG:** 1,4375 px por unidade do viewBox na `v1` (círculo de 172,5 px), 1,125 na `v2` (126 px), 1,3375 na `v3` (155 px) e 1,645 na `v4` (204 px). O contorno de 1 unidade vale isso em px.
* **Tinta visível, por varredura dos dois PNGs** (2 px de dispositivo por px): cor de cada pixel ao longo da circunferência 2 unidades por dentro do arco, e ao longo de cada fita fina, seção por seção. "Com cor plena" quer dizer ao menos um pixel na cor do token na seção (tolerância de 70 na soma dos três canais); "sem cor" quer dizer nenhum pixel com 10% ou mais da cor da fita.
* **Página viva, pelo mesmo pacote e servidor do `npm run render`:** as quatro no estado padrão (caixa de cada rótulo, vão entre rótulos, folga ao anel, tamanhos, pesos, `tabular-nums`), a `v4` com o botão Matriz acionado nos dois temas e a `v4` num corpo de 362 px de largura, onde a corda dá lugar à lista.
* **Preview contra página:** de 0,04% a 0,08% de pixels diferentes nos oito pares de PNG.
* **Frase acessível, lida na raiz em página viva:** 166, 175, 152 e 198 caracteres, as quatro começando por "Diagrama de corda simétrico" e verdadeiras contra o dado.
* **Peso 700, contado em página viva:** nenhum na `v1`, na `v3` e na `v4`; dois na `v2` (os rótulos de Crédito estruturado e de Financiamento).
* **Rótulos:** folga ao anel de 7,9 a 11,5 px nas quatro; menor vão entre caixas de 2,6 px na `v1`, em linhas diferentes, e de 9,9 px ou mais nas outras. Nenhum sai do corpo.
* **Faixa "só este produto" da `v3`:** a parte do arco que ela ocupa contra a parte do dado, nas seis (0,394, 0,358, 0,186, 0,233, 0,436 e 1,000, iguais ao dado).
* **Não medido pela ferramenta:** `ESPESSURA-MARCA` (`sem_marca_de_barra` em três, `marca_html` na `v4`), `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` (`texto_em_html`), `EIXO-CALMO`, `OPACIDADE-MARCA` e `RAIO-CONTRA-AREA` (`valor_nao_casado`), nas quatro. Colisão e contraste de texto foram conferidos à mão, acima e na tabela abaixo. Nenhuma guarda mede fita consumida pelo próprio contorno.
* **Não renderizado:** o estado vazio das quatro e a `v2` com `highlightId` inexistente. O que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas. As larguras citadas nelas são conta sobre a escala, não render da peça corrigida.

Pares de contraste, da tabela 17.10 do contrato e de `app/src/styles/tokens.css`:

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--text-secondary` contra o cartão | 8,16 | 8,13 | nome do grupo, linha de leitura, lista do painel |
| `--text-muted` contra o cartão | 5,21 | 5,37 | total do grupo, notas, arco de Outros, faixa só este, neutro da `v2` |
| `--text-muted` sobre `--surface-sunken` | 5,98 | 4,65 | botão não selecionado da `v4` |
| `--chart-1` a `--chart-6` contra o cartão | 5,90 a 9,50 | 5,34 a 6,25 | arcos e fitas (pergunta 32) |
| `--chart-1` contra `--text-muted` | 1,82 | 1,12 | aceso contra neutro na `v2` (TOK-9), observação no README |

## Peso de cada achado, e onde passa a linha

* **Fita sem tinta, `v1` e `v2`.** `STROKE_WIDTH = 1` é constante de acabamento, dentro da faixa da COR-5 (de 1,13 a 1,65 px na tela). Reprova pela consequência medida no preview, que a seção 14.1 nomeia: marca sem tinta e marca partida. É a armadilha GEO-16, respiro em medida absoluta que a marca pequena paga inteira, e o acervo já decidiu o caso em `19_cascata-waterfall/07_cascata-empilhada`, `v1` e `v2`, em 2026-10-06 (separador que consome a fatia).
* **Percentual que não soma, `v2`.** NUM-2 pela letra e pergunta 6. O acervo reprovou pelo mesmo motivo em `19/08` `v3`, `25/01` `v2` e `26/03` `v1`, `v2` e `v4`.
* **Por que a `v4` não cai com o mesmo contorno.** A linha que usei é a de `27/02` `v3`, de hoje: traço interrompido que mantém a identificação pela cor nas duas pontas é observação; marca sem tinta, ou destaque cortado (`11/02`, 2026-10-05), é bloqueante. Na `v4`, toda fita desenhada tem de 2,5 a 3,9 px de tinta em cada ponta, na cor do parceiro, e o trecho sem cor é de 5 a 9 px no ponto mais fino. Na `v1` e na `v2` há par com zero pixel.
* **Por que a `v3` não cai.** A menor fita tem 25 clientes, 7,7 px nominais e 6,4 px de tinta. As oito são contínuas.

## `v1_produtos-na-mesma-carteira`: reprovada

O resto do retrato está certo: totais conferidos, slots 1, 3, 6, 5, 2, 4 pela chave, Outros em `--text-muted` com o desvio declarado, rótulo direto com nome e total em todo arco, nota de como ler, frase acessível verdadeira, vazio com `role="status"`.

### Bloqueante 1. Pergunta 15; COR-5 com a armadilha GEO-16; seção 14.1 (marca sem tinta e marca partida)

**O que o desenho faz.** Cada fita é um `<path>` com `stroke="var(--surface-raised)"` e `strokeWidth={STROKE_WIDTH}` (`Chart.tsx`, linhas 34 e 214). O contorno é centrado na borda e pintado por cima do preenchimento, então come meia unidade de cada lado: toda fita perde 1,44 px de largura, qualquer que seja o valor. A escala na ponta é de 0,294 px por cliente. Abaixo de 5 clientes a perda é maior que a fita. No meio do caminho a fita tem cerca de metade da largura da ponta, e ali a perda alcança as de até 9 clientes.

**Medida, igual nos dois temas:**

| Par | Clientes | Ponta nominal | Tinta na ponta | O que chega à tela |
|---|---|---|---|---|
| Crédito estruturado com Outros | 3 | 0,88 px | 0 | nada: nenhuma seção da fita tem cor |
| Financiamento com Outros | 5 | 1,47 px | 0,03 px | nada: nenhuma seção com cor plena |
| Seguro auto com Outros | 6 | 1,76 px | 0,33 px | vestígio: 2% das seções com cor plena |
| Crédito estruturado com Cartão | 8 | 2,35 px | 0,91 px | toco nas duas pontas, 123 px sem cor plena no meio |
| Consórcio com Outros | 9 | 2,64 px | 1,21 px | toco nas duas pontas, 90 px sem cor plena no meio |

* Varredura da circunferência 2 unidades por dentro do arco de Outros (10,9 px de arco interno), nos dois PNGs: 2,18 px de verde (Cartão, nominal 4,11), 0,63 px de ciano (Consórcio, nominal 2,64), 0,49 px de cor misturada onde devia estar o azul de Seguro auto, e depois **3,72 px contínuos na cor do cartão**, onde deviam estar Financiamento e Crédito estruturado.
* O arco de Outros escreve `37 clientes` e recebe fita visível de 23 (14 e 9). Os outros 14, 38% do arco, não têm fita.
* O `data.ts`, linha 34, escolheu este caso de propósito: "crédito estruturado com outros é o menor (3), e o par ausente não existe". No desenho o par de 3 e o par ausente (Conta digital com Outros, zero medido) ficam iguais.

**Por que bloqueia.** A pergunta do `meta.json` é "quantos clientes têm cada par entre os 7 produtos". Para três dos vinte pares a resposta do desenho é "nenhum", e é falsa: Outros aparece ligado só a Cartão e a Consórcio, quando também anda com Seguro auto, Financiamento e Crédito estruturado. Não há número escrito por fita que cubra a falta, e nada no cartão avisa. O próprio modelo conhece a saída, que a `v4` aplica: par fino sem fita, com o ângulo reservado e a contagem no rodapé.

**O que mudar.** Critério de aceite: nos dois PNGs, todo par com valor maior que zero ou tem tinta na cor dele nas duas pontas, com largura que acompanha o valor, ou não tem fita e está contado numa linha visível do cartão. Conferir como foi medido: cor dos pixels na circunferência logo por dentro de cada arco, um trecho de cor por subarco.

1. **Contorno que não come a própria fita.** `style={{ paintOrder: 'stroke' }}` no `<path>` da fita pinta o contorno por baixo do preenchimento: a fita fica com a largura nominal e o contorno segue separando-a do que está embaixo. Junto disso, desenhar as fitas da maior para a menor, como a `v4` já faz com `ranked`, para a fina ficar por cima.
2. **Piso em px, com aviso.** Par cuja ponta nominal fique abaixo de um piso (derivado de px por cliente, não escrito em clientes) perde a fita, mantém o ângulo no arco e entra numa linha de rodapé com a contagem, no molde da `v4`. Como a `v1` não tem matriz, a linha precisa dizer o que ficou de fora.
3. As duas saídas se somam. A 1 tira a perda do contorno próprio, mas a vizinha pintada depois ainda cobre meia unidade (0,72 px) na borda comum: no arco de Outros a fita de 5 ficaria com cerca de 0,75 px e a de 3 com 0,88, ordem trocada. A 2 trata o que nem assim se lê, e é ela que fecha o critério; a GEO-16 chama isso de agregar a cauda acima do piso.

Não serve: largura mínima por fita sem aviso, que infla o par pequeno e quebra a soma do arco; nem deixar como está com a ressalva só no `notes`.

**Na mesma passada, sem peso de bloqueio.** Estão no README: rótulo `Outros` sem a contagem `(n=X)` da COR-4, com "7 produtos" contando o agrupamento; e a convenção da cor da fita, que a nota de como ler não diz.

```
Versão: 27_rede-e-relacoes/07_chord-simetrico/v1_produtos-na-mesma-carteira
Data: 2026-10-13
Resultado: reprovada
Não: 15
Correções:
  15. COR-5 e GEO-16 (14.1): o contorno de 1,44 px consome as fitas de 3, 5 e 6 clientes e parte as de 8 e 9; dar tinta própria à fita (contorno por baixo do preenchimento, finas por último) ou tirar a fita abaixo de um piso em px e contar os pares no rodapé.
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30 e 31
```

## `v2_produto-mais-associado-ao-credito-estruturado`: reprovada

O foco está bem construído: fitas do foco por cima, peso 700 só nos rótulos de Crédito estruturado e de Financiamento, anotação "o mais associado" junto do arco, painel com nome à esquerda e número à direita em coluna, neutro em `--text-muted` no lugar do esmaecido que o catálogo pedia, com o desvio declarado. Os dois bloqueantes são de conta e de tinta.

### Bloqueante 1. Pergunta 6 (e 14); NUM-2 (percentual impresso que não soma)

**O que o desenho faz.** O painel escreve a parte de cada par sobre os 218 clientes do foco com `formatPercent(row.count / focusTotal, 0)`, um arredondamento por linha (`Chart.tsx`, linha 281). Os seis pares são a partição inteira dos 218 (96, 58, 41, 12, 8 e 3), e a nota diz isso: "o percentual é sobre os 218 clientes de crédito estruturado em pares".

**Evidência, lida nos dois PNGs:** 44%, 27%, 19%, 6%, 4% e 1%. Soma **101**.

| Par | Clientes | Exato | Impresso | Maior resto |
|---|---|---|---|---|
| Financiamento | 96 | 44,04% | 44% | 44% |
| Consórcio | 58 | 26,61% | 27% | 27% |
| Seguro auto | 41 | 18,81% | 19% | 19% |
| Conta digital | 12 | 5,50% | 6% | 5% |
| Cartão | 8 | 3,67% | 4% | 4% |
| Outros | 3 | 1,38% | 1% | 1% |

**Por que bloqueia.** A NUM-2 manda a composição com percentual inteiro somar 100 pelo maior resto, e a pergunta 6 cobra a soma no percentual impresso. A precisão da ROT-10 de 2026-09-20, que isenta aritmética de arredondamento, fala de valor em moeda; para percentual inteiro de composição a régua é a NUM-2, e o acervo já decidiu assim três vezes neste mês.

**O que mudar.** Repartir os seis inteiros pelo maior resto, com alvo 100, numa função local (o molde está em `02_barras-horizontais/04_barras-empilhadas-100/v1_mix-de-origem-por-segmento/Chart.tsx`, `largestRemainder`), e usar o mesmo inteiro no painel e na frase acessível. Com o dado padrão só Conta digital muda, de 6% para 5%; os 44% da frase continuam.

### Bloqueante 2. Pergunta 15; COR-5 com a armadilha GEO-16; seção 14.1 (marca sem tinta e marca partida, no destaque)

**O que o desenho faz.** O mesmo contorno da `v1` (`Chart.tsx`, linhas 37 e 223), num círculo menor: o canvas `card` deixa a roda com 126 px, a escala cai para 0,207 px por cliente na ponta e o contorno vale 1,13 px.

**Medida nas seis fitas do foco, que são pintadas por último e não têm nada por cima:**

| Par do foco | Clientes | Ponta nominal | Tinta na ponta | O que chega à tela, escuro e claro |
|---|---|---|---|---|
| Financiamento | 96 | 19,7 px | 18,6 px | inteira (98% e 96% das seções com cor plena) |
| Consórcio | 58 | 11,9 px | 10,8 px | inteira (99%) |
| Seguro auto | 41 | 8,5 px | 7,3 px | inteira (99%) |
| Conta digital | 12 | 2,48 px | 1,36 px | partida: 41% e 38% das seções com cor plena, de 11 a 13 px sem cor no meio |
| Cartão | 8 | 1,65 px | 0,53 px | vestígio perto do arco do Cartão: 10% das seções, 90 px sem cor plena |
| Outros | 3 | 0,62 px | 0 | nada: nenhuma seção com cor plena |

**Por que bloqueia.** A pergunta do cartão é "com quais produtos o crédito estruturado aparece na mesma carteira". O painel responde seis; a roda desenha três fitas, uma quarta partida, e não desenha as outras duas. O número está escrito ao lado, e por isso o dado não se perde; o que se perde é a marca do destaque, que é o que a versão existe para demonstrar, e a roda passa a desmentir a lista. Marca de destaque cortada já reprovou em `11_fluxo-sankey/02_sankey-multietapa`.

**O que mudar.** O mesmo critério de aceite da `v1`, aplicado às fitas do foco: cada par da lista ou tem fita com tinta nas duas pontas, ou a lista diz que ele ficou sem fita.

1. As saídas 1 e 2 da `v1`. Aqui a 2 é barata, porque o valor já está no painel: basta marcar na linha do par, ou na nota, que ele está abaixo do piso de desenho.
2. Dar corpo à roda. O "Como colar" do README do modelo já recomenda `quadrado` ou `alto` acima de 6 grupos. Num corpo em que a roda chegue a 200 px a ponta de 12 clientes passa de 2,5 para cerca de 3,9 px; a de 3 continua abaixo de 1 px, então o piso segue necessário. O canvas muda por número com o desvio no `notes` (GEO-1).

**Na mesma passada, sem peso de bloqueio.** Estão no README: o número do par aceso contra neutro no `notes` (TOK-9: 1,82:1 e 1,12:1), o `218` da nota sem `tabular-nums`, o comentário da prop `highlightId`, que promete roda em neutro onde o código devolve o vazio, e o rótulo `Outros` sem `(n=X)`.

```
Versão: 27_rede-e-relacoes/07_chord-simetrico/v2_produto-mais-associado-ao-credito-estruturado
Data: 2026-10-13
Resultado: reprovada
Não: 6 (e 14), 15
Correções:
  6. NUM-2: os percentuais do painel somam 101 (44, 27, 19, 6, 4 e 1); repartir pelo maior resto com alvo 100 (Conta digital passa a 5) e usar o mesmo inteiro na frase acessível.
  15. COR-5 e GEO-16 (14.1): das seis fitas do foco, a de Outros não tem tinta, a de Cartão é vestígio e a de Conta digital parte no meio; fita com tinta própria ou par declarado sem fita, e roda maior que os 126 px do canvas card.
Não se aplica: 3, 4, 7, 13, 18, 26, 27, 28, 29, 30 e 31
```

## `v3` e `v4`: aprovadas

Nenhuma das duas tem "não". O corretor não é obrigado a tocar nelas; o que segue é o registro do que sustentou o aceite. As observações de cada uma estão no README, e as duas primeiras da `v4` têm peso.

* **`v3`.** A diagonal vira a cauda neutra do arco do próprio grupo, sem fita de retorno, e a parte que ela ocupa no arco é a do dado nas seis. Previdência, sem nenhum par, fica no círculo com o arco inteiro em neutro e `74 clientes` e `74 só este` escritos. Cada rótulo traz nome, total e a faixa própria; a amostra da legenda tem a forma e a cor da faixa; o neutro em `--text-muted` no lugar do `--line-strong` do catálogo está declarado. As oito fitas são contínuas. Pontos pesados e deixados como observação: "476 de 870 clientes" soma pares como se fossem clientes distintos, o que o dado fictício não desmente mas o dado real pode desmentir; e a linha de leitura em duas linhas.
* **`v4`.** Seis origens em slot fixo e `Outros (n=5)` com a contagem no rótulo (COR-4). O par abaixo de 10 leads perde a fita e mantém o ângulo, e o rodapé conta os 3; a origem sem jornada fica fora do círculo com os 37 leads escritos. Em página viva, nos dois temas: o botão Matriz troca a corda por uma tabela de 574 por 245,5 px, com os 21 pares, o mais forte em peso 600 e os abaixo do limiar em `--text-muted`, sem transbordo; num corpo de 362 px a corda some e entra a lista dos 21 pares em ordem decrescente, sem aviso de layout.

Medida das fitas mais finas da `v4` (contorno de 1,65 px, 0,293 px por lead; as fitas são pintadas da maior para a menor, então estas ficam por cima):

| Par | Leads | Ponta nominal | Tinta na ponta | Trecho sem cor no ponto mais fino | Trecho abaixo de 25% da cor |
|---|---|---|---|---|---|
| Site orgânico com Evento | 14 | 4,09 px | 2,45 px | de 5 a 6,5 px | 13 px |
| Evento com Outros | 19 | 5,55 px | 3,91 px | 5,3 px | de 9 a 13 px |
| Indicação com E-mail | 19 | 5,55 px | 3,91 px | de 8 a 9 px | de 9,5 a 18 px |

É o mesmo contorno da `v1`, com consequência menor: nenhuma fita fica sem tinta, as duas pontas se leem e a cor da ponta diz quem é o parceiro. Por isso fica como observação. Dois avisos para quem for mexer:

* `MIN_RIBBON = 10` está em leads. No limiar a ponta teria 2,9 px nominais e 1,3 px de tinta, e o corpo sumiria como o da fita de 9 clientes da `v1`. O dado padrão não tem par entre 10 e 13, e é só por isso que o retrato não mostra. O piso deveria sair dos px por lead.
* Se o corretor levar o conserto da fita também para a `v4`, o veredito dela fica desatualizado e ela volta à fila; cabe na mesma edição a linha de rodapé dos 3 pares internos de Outros (25 leads), que hoje somem sem aviso.

```
Versão: 27_rede-e-relacoes/07_chord-simetrico/v3_clientes-com-um-produto-so
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30 e 31
```

```
Versão: 27_rede-e-relacoes/07_chord-simetrico/v4_origens-demais-agrupadas-em-outros
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30 e 31
```

## Régua e ferramenta

* Nenhuma guarda mede marca consumida pelo próprio contorno. A `ESPESSURA-MARCA` sai com `sem_marca_de_barra` e a `RAIO-CONTRA-AREA` com `valor_nao_casado`; as duas versões reprovadas passam no `check` com 0 erros e 0 avisos. A conferência que pega é a da GEO-16, tinta contra valor marca por marca, e aqui ela só existe à mão.
* Nenhuma guarda soma percentual impresso (NUM-2), dívida já anotada em `26_mosaico-marimekko/03_spineplot`: a `v2` passa com 101.
* A `NUMERO-CRU` não acusa `{String(hiddenCount)}` nem `{String(MIN_RIBBON)}` em texto corrido (`v4`, linha 370), e a TIP-1 fica sem guarda nesses dois números.
* O retrato é só o estado padrão. A matriz e a lista da `v4`, que são dois dos cinco itens que a versão demonstra, só se conferem montando a página.
* O catálogo se contradiz na `v1` ("7 produtos" e "Outros neutro") e sugere `card` para a `v2` com 7 grupos, onde a roda fica com 126 px e as fitas do foco não cabem.
* A geometria herdada do chord da família 11 usa o centro como ponto de controle das duas bordas: entre grupos vizinhos a fita afina no ápice qualquer que seja o peso. A largura só é fiel na ponta, e o contrato não tem regra que diga onde a fita de chord se lê.

---

# Segunda passada, depois da rodada de correção

Data: 2026-10-13. Revisor independente. Julgadas a `v1` e a `v2`, as duas em `revisao_desatualizada`, pelo arquivo de hoje e não pela nota da primeira passada: `Chart.tsx` das 18:27:50 (`v1`) e das 18:27:21 (`v2`), PNGs das 18:27:56 em diante, posteriores aos dois. `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes. A `v3` e a `v4` não entraram nesta passada e seguem com o veredito da primeira.

Resultado: `v1` aprovada, `v2` reprovada. Os bloqueantes da primeira passada estão resolvidos nas duas versões. Os dois bloqueantes de agora, na `v2`, nasceram na correção: a troca do canvas de `card` para `alto` expôs uma caixa que só é quadrada quando a altura é o lado curto, e a troca do arredondamento pelo maior resto tirou o `formatPercent` do painel.

| Versão | Resultado | Não |
|---|---|---|
| `v1_produtos-na-mesma-carteira` | aprovada | nenhum |
| `v2_produto-mais-associado-ao-credito-estruturado` | reprovada | 12, 14 |

Não se aplica, nas duas: perguntas 3, 4, 7, 13, 18, 26, 27, 28, 29, 30 e 31. Na `v1` também a 6, porque ela não imprime percentual.

## O que foi medido nesta passada, e como

* **Refeito do `data.ts`, à mão:** os 20 pares das duas versões, os totais da `v1` (333, 276, 200, 263, 169, 200 e 37; 739 em pares) e os da `v2` (327, 276, 218, 287, 169, 200 e 37), os 218 clientes do foco e os seis percentuais pelo maior resto (44, 27, 19, 5, 4 e 1, soma 100).
* **Geometria, refeita fora do componente com a mesma regra:** ângulo por unidade, vão de 0,05 rad, giro de 0,6 rad, subarcos por peso, âncora de cada rótulo em `R_LABEL`, ponta e cintura nominal de cada fita.
* **Roda, por ajuste de círculo nos quatro PNGs** (2 px de dispositivo por px): na `v1`, 1,268 px por unidade do viewBox, caixa de 253,7 px e anel de 152 px; na `v2`, 1,657 px por unidade, quadrado de 331,4 px e anel de 186 px. Iguais nos dois temas.
* **Rótulos, pela caixa de tinta de cada linha de texto em volta da roda:** posição contra a âncora esperada e distância da tinta ao anel.
* **Arcos, por varredura do anel a meia espessura (14.400 direções):** parte do ângulo medida contra a parte do valor.
* **Fitas finas, por varredura da linha média de cada uma (384 seções):** presença da cor do token numa vizinhança de 1 px de dispositivo.
* **Cor e contraste, lidos do pixel:** cada arco contra o cartão, nos dois temas.
* **Preview contra página:** 0,04% e 0,05% de pixels diferentes na `v1`, 0,18% e 0,19% na `v2`.
* **Frase acessível, lida no `data-farol-ace` do `preview.svg`:** 166 e 175 caracteres, as duas começando por "Diagrama de corda simétrico" e verdadeiras contra o dado.
* **Não medido em página viva:** tudo acima sai dos PNGs e do código. A altura da caixa da `v2` (cerca de 425 px) é inferida do desvio dos rótulos, não lida no DOM. O estado vazio e o `highlightId` inexistente são leitura do código. As saídas sugeridas não foram testadas.

## `v1_produtos-na-mesma-carteira`: aprovada

Sem bloqueante. O que a correção fez, conferido:

* **Contorno pintado por baixo do preenchimento** (`paintOrder: 'stroke'`, linha 231), com as fitas largas primeiro e as finas por último (linha 202): a fita não perde mais largura para o próprio contorno.
* **Piso `MIN_TIP` de 1,6 unidade** (linha 39): os pares de 6, 5 e 3 clientes, os três com Outros, saem sem fita, mantêm o ângulo no arco e são nomeados no rodapé com o valor e a soma (14 clientes). É ausência declarada, não ausência exibida como zero.
* **Fitas finas desenhadas, nos dois temas:** crédito estruturado com cartão (8 clientes, 2,1 px na ponta, cintura de 1,0 px), crédito estruturado com conta digital (12; 3,1 e 1,3 px) e financiamento com conta digital (15) têm a cor do token em todas as 384 seções. Consórcio com Outros (9; 2,3 px na ponta) afina até 0,8 px no gargalo e segue visível como fio contínuo no recorte ampliado; a varredura perde a cor plena ali por suavização, não por interrupção.
* **Arcos:** a parte medida fica a menos de 0,2 ponto percentual da parte do valor nos sete (de 22,63% contra 22,53% em consórcio a 2,35% contra 2,50% em Outros, que perde meio contorno de cada lado).
* **Rótulos:** tinta de 10 a 13 px do anel nos sete, todos na âncora esperada. Menor vão de tinta: 5 px entre `200 clientes` de Cartão e `Conta digital`, em linhas diferentes.
* **Contraste das marcas contra o cartão:** de 5,21 a 9,50 no escuro e de 5,34 a 6,25 no claro. Texto em `--text-secondary` e `--text-muted`, 12 e 11 px, nenhum peso 700.
* **O que demonstra:** os cinco itens estão no código e na tela.

Observações, no README: o rodapé de quatro linhas encolheu a roda de 288 para 254 px e deixou velho o "cerca de 2,3 px" do comentário; o piso é em unidade do viewBox; `6`, `5` e `3` do rodapé saem sem substantivo e sem classe tabular; a caixa `aspect-square h-full w-auto max-w-full` é a mesma que reprova a `v2`, e aqui não aparece porque a altura é o lado curto.

```
Versão: 27_rede-e-relacoes/07_chord-simetrico/v1_produtos-na-mesma-carteira
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30 e 31
```

## `v2_produto-mais-associado-ao-credito-estruturado`: reprovada

Resolvido da primeira passada, conferido: os percentuais somam 100; as quatro fitas do foco que passam do piso têm a cor do token de ponta a ponta nos dois temas (a de conta digital, 12 clientes, com 3,7 px na ponta, cintura de 1,5 px e 384 de 384 seções); Cartão (8) e Outros (3) saem sem fita e o painel escreve "sem fita, fina demais" na linha de cada um; o anel passou de 126 para 186 px. Arcos a menos de 0,3 ponto percentual do valor; contraste de 5,21 e 9,50 no escuro, 5,37 e 6,00 no claro; peso 700 só nos rótulos de Crédito estruturado e de Financiamento.

### Bloqueante 1. Pergunta 12; ROT-2 com a seção 14.1 (identificação das marcas): a camada de rótulos não está na escala da roda

**O que o desenho faz.** A caixa que carrega o SVG e a camada de rótulos é `relative aspect-square h-full w-auto max-w-full` (`Chart.tsx`, linha 246). Com `h-full` a altura é fixa; quando a largura disponível é menor que a altura, o `max-w-full` corta a largura e a caixa deixa de ser quadrada. No canvas `alto` é o que acontece: o painel de 200 px, o vão de 16 px e o `pl-6` deixam cerca de 331 px de largura num corpo de cerca de 425 px de altura. O `<svg>` (`absolute inset-0`, `viewBox` de 200 por 200) desenha a roda num quadrado de 331 px centrado na caixa. A camada de rótulos (`absolute inset-0`, linhas 264 a 280) posiciona cada rótulo por percentual da caixa inteira: `left` sobre 331 px e `top` sobre 425 px. São duas escalas verticais para o mesmo ponto: 1,657 px por unidade na roda e cerca de 2,12 nos rótulos.

**Evidência, medida nos dois PNGs** (igual nos dois temas). Na horizontal todo rótulo cai na âncora, com erro de 1 a 2 px. Na vertical o desvio cresce com a distância ao centro, e o rótulo se afasta da marca que ele nomeia:

| Rótulo | Desvio vertical da âncora | Tinta ao anel na `v2` | O mesmo rótulo na `v1` |
|---|---|---|---|
| Cartão | 29 px para cima | 44,6 px | 13,0 px |
| Outros | 26 px para cima | 38,9 px | 13,4 px |
| Conta digital | 20 px para cima | 28,3 px | 12,4 px |
| Consórcio | 10 px para cima | 17,6 px | 11,4 px |
| Financiamento | 5 px para baixo | 14,6 px | 10,4 px |
| Seguro auto | 23 px para baixo | 33,4 px | 12,2 px |
| Crédito estruturado | 28 px para baixo | 40,0 px | 11,7 px |

A `v1` tem a mesma classe e a mesma `R_LABEL = R_OUTER + 7`, e lá a tinta fica de 10 a 13 px do anel porque a altura é o lado curto. A primeira passada mediu de 7,9 a 11,5 px nas quatro versões, a `v2` inclusive, ainda em `card`.

**Por que reprova.** Na `v2` os seis arcos fora do foco têm a mesma cor (`--text-muted`), então a posição do rótulo é o único canal que diz qual arco é qual. O rótulo `Outros` ficou à mesma distância do fim do arco de Cartão e do começo do arco de Outros (38,9 e 39,0 px da tinta à borda de fora de cada um), e a 46 px do começo de Consórcio: o arco pequeno, que é onde a proximidade mais importa, só se identifica por eliminação. O rótulo do produto em foco, `Crédito estruturado`, está a 40 px do arco dele. Nada colide, nada é cortado e toda âncora continua dentro do vão angular do próprio arco, e é por isso que a leitura ainda fecha com este dado; mas o desvio aparece no render, mede até 29 px num anel de 186 px e cresce com qualquer corpo mais alto. Pela seção 14.1, desvio com consequência medida no preview bloqueia, e este cai em identificação das marcas.

**O que mudar.** A caixa tem de ser quadrada nos dois limites, para o SVG e a camada de rótulos dividirem a mesma escala: o lado é o menor entre a largura e a altura do pai, e hoje só é assim quando a altura é a menor. Saída sugerida, não testada: pai com `[container-type:size]` e a caixa com lado `min(100cqw, 100cqh)`. Trocar o canvas por um mais baixo, sem consertar a caixa, só esconde o defeito. Depois do conserto, conferir no render dos dois temas que a tinta dos sete rótulos volta a ficar de 10 a 16 px do anel e que Cartão, Outros e Conta digital não se encostam no topo. Com a caixa quadrada sobram cerca de 95 px de altura no corpo do `alto`: vale declarar o canvas por número (GEO-1).

### Bloqueante 2. Pergunta 14; seção 8 e o "o que demonstra" do catálogo: o percentual é escrito à mão

**O que o código faz.** No painel, linha 310: `{String(percents[index] ?? 0)}%`. Na frase acessível, linha 235: `${String(percents[0] ?? 0)}%`. O arquivo não importa `formatPercent`. O `meta.json` e o catálogo dizem "Percentual do par sobre o total do grupo com formatPercent", e o README, em Versões, "o painel dos pares com `formatPercent`". Na primeira passada a linha era `formatPercent(row.count / focusTotal, 0)`; a correção do maior resto trocou o formatador por `String` e deixou os três textos como estavam.

**Peso, dito com franqueza.** Na tela o texto é o mesmo (`44%`), e nada do que o desenho afirma muda. Reprova por contrato, não por desenho: a versão declara no `meta.json` uma técnica que o código não tem (versão que não demonstra o que o catálogo diz), e a seção 8 manda todo número de tela sair de `@/lib/format`. A guarda `NUMERO-CRU` lista `{String(x + 1)}` entre o que acusa e não vê este caso porque o argumento é `percents[index] ?? 0`. O maior resto e o formatador não brigam.

**O que mudar.** `formatPercent((percents[index] ?? 0) / 100, 0)` no painel e `formatPercent((percents[0] ?? 0) / 100, 0)` na frase, mantendo `largestRemainder`. A saída continua `44%` e a soma continua 100.

### Na mesma passagem, sem peso de bloqueio

* O comentário do topo do `Chart.tsx` (linhas 7 a 15) herdou da `v1` "Cor da fita: a do grupo de índice menor no par", que a `v2` não faz (a fita é foco ou neutro), e ficou com um parêntese aberto (DAD-10).
* No `notes` do `meta.json`, "as fitas e os arcos fora do foco" começa frase em minúscula.
* A frase do vazio para `highlightId` inexistente ainda diz "Nenhum cliente com dois produtos neste recorte", que não é o caso.
* Dois pares fora do foco também ficam sem fita pelo piso (seguro auto com Outros, 6; financiamento com Outros, 5) e a tela não diz. São contexto neutro sem valor escrito, e o painel só fala do foco.
* O rótulo de Financiamento ocupa a largura inteira do `max-w-[5.5rem]`: "o mais associado" mede 86,5 dos 88 px e a tinta começa a 1 px da borda esquerda do corpo. Nome mais longo quebra a linha ou sai do corpo.
* O `218` da nota do painel segue sem `tabular-nums` (TIP-1), como na primeira passada.

```
Versão: 27_rede-e-relacoes/07_chord-simetrico/v2_produto-mais-associado-ao-credito-estruturado
Data: 2026-10-13
Resultado: reprovada
Não: 12, 14
Correções:
  12. ROT-2 e 14.1 (identificação das marcas): caixa da roda quadrada nos dois limites, para o SVG e a camada de rótulos dividirem a escala; conferir a tinta dos sete rótulos de 10 a 16 px do anel nos dois temas.
  14. Seção 8 e "o que demonstra": percentual do painel e da frase acessível por formatPercent(x / 100, 0), mantendo o maior resto.
Não se aplica: 3, 4, 7, 13, 18, 26, 27, 28, 29, 30 e 31
```

## Régua e ferramenta, segunda passada

* Nenhuma guarda mede a camada de rótulos em HTML contra as marcas do SVG: `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` saem com `texto_em_html` nas quatro versões. Uma camada esticada 28% na vertical passa no `check` com 0 erros e 0 avisos.
* A seção 2 do contrato (linha 195) sugere `h-full w-auto aspect-square` para SVG puro. Num `<svg>` sozinho funciona, porque o `viewBox` centraliza o desenho na caixa que sobrar. Com uma camada de HTML posicionada por percentual em cima dele, e com `max-w-full` na mesma caixa, o conjunto só é quadrado quando a altura é o lado curto. As quatro versões deste modelo usam a mesma classe; vale uma entrada GEO no `ARMADILHAS.md`.
* A `NUMERO-CRU` não acusa `{String(percents[index] ?? 0)}%`, pelo mesmo caminho que já deixava passar `{String(hiddenCount)}` na `v4`: `String` com argumento que não é literal, `.length` nem conta.
* O `meta.json` pode declarar em "o que demonstra" um formatador que o `Chart.tsx` não importa, e nada confere uma coisa contra a outra.
