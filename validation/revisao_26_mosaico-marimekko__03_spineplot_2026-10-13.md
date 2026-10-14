# Parecer de revisão: 26_mosaico-marimekko/03_spineplot

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render das 14:23, posterior ao `Chart.tsx` das 14:22 e 14:23 nas quatro). `npm run check` com tipos: 0 com erro, 3 avisos, 0 escapes.

Resultado: as quatro reprovadas. Três caem pela mesma causa, percentual impresso que não fecha, e duas por amostra de legenda abaixo do piso de contraste. Nenhuma tem defeito de geometria: área, escala, vãos e texto conferem. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

| Versão | Resultado | Não |
|---|---|---|
| `v1_ganho-por-faixa-de-porte` | reprovada | 6 (e 27) |
| `v2_qualificacao-por-tempo-ate-contato` | reprovada | 6 (e 27) |
| `v3_qualificado-por-plataforma-e-formato` | reprovada | 20 |
| `v4_porte-desconhecido-e-amostra-pequena` | reprovada | 6 (e 27), 20 |

Não se aplica, nas quatro: perguntas 26, 28, 29 e 30. Na `v1` também a 13, a 31 e a 32.

## O que foi medido e o que não foi

* **Medido no `preview.svg`:** posição e tamanho de cada ladrilho, linha e texto. A área por caso é constante dentro de cada versão (119,95 px² na `v1`, 80,06 na `v2`, 80,29 na `v3` e 133,4 na `v4`, em amostra de ladrilhos de ganho e de perda), então largura e altura codificam a contagem. A `RAIO-CONTRA-AREA` saiu `sem_marca_de_area` e a conta foi feita à mão.
* **Refeito do `data.ts`:** as participações de cada coluna pelo valor exato e pelo maior resto, os pares de taxa e complemento com uma casa, a taxa global e a queda em p.p. da `v2` (20,19 menos 34,11 dá −13,9).
* **Escala e tipografia:** `viewBox` igual à caixa na `v1`, na `v2` e na `v4` (574 por 201, 217 e 257). Na `v3` o `viewBox` de 894 por 217 fica numa caixa de 894 por 233,5, em escala 1 e centrado. Corpo em 12 e 11 px, pesos 400, 500 e 600, nenhum 700.
* **Preview contra página:** de 0,01% a 0,18% de pixels diferentes nos oito pares de PNG.
* **Recortes ampliados dos PNGs:** a legenda da `v3` e da `v4`, a faixa da linha global da `v2` e da `v4`, as colunas finas da `v3` e da `v4`, nos dois temas.
* **Não medido pela ferramenta:** `EIXO-CALMO` (`sem_grade`), `OPACIDADE-MARCA` (`sem_opacidade_em_marca`) e `RAIO-CONTRA-AREA` nas quatro; `ESPESSURA-MARCA` na `v3` (`marca_fora_do_bar`). Linha de leitura e legenda são HTML: o contraste delas saiu da tabela abaixo.
* **Não renderizado:** o estado vazio das quatro, a lista `Sem rótulo no desenho` da `v1` e da `v2`, e os ramos citados no README. O que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas. As larguras citadas são conta, não render.

Pares de contraste, calculados de `app/src/styles/tokens.css` pela fórmula da WCAG:

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--text-primary` sobre `--line-strong` | 8,13 | 9,79 | percentual dentro do ladrilho, `v1`, `v2` e `v4` |
| `--text-muted` sobre `--surface-raised` | 5,21 | 5,37 | participação no eixo, hachura, fios, linha global |
| `--text-muted` sobre `--surface-sunken` | 5,98 | 4,65 | `25%` sobre a faixa do SLA, `v2` |
| `--text-secondary` sobre `--surface-sunken` | 9,36 | 7,04 | textos sobre a faixa do SLA, `v2` |
| `--chart-1` contra o cartão | 9,50 | 6,00 | parte de interesse, as quatro |
| `--line-strong` contra o cartão | 1,79 | 1,83 | neutro de dado, só vale com o valor escrito |
| `--surface-sunken` contra o cartão | 1,15 | 1,15 | trilho da `v3`, amostra da `v3` |
| `--line-subtle` contra o cartão | 1,25 | 1,29 | borda das amostras da `v3` |
| `--line-strong` contra `--surface-sunken` | 2,05 | 1,59 | marca contra marca, `v3` |

## A causa comum de `v1`, `v2` e `v4`

As três escrevem a participação de cada coluna com `formatPercent(count / total, 0)`, um arredondamento por coluna, sem repartir o resto. A NUM-2 pede o maior resto, e o modelo `01` desta família já tem a função pronta: `largestRemainder()` em `01_marimekko-e-mosaico/v1_cobertura-de-dado-por-origem/Chart.tsx:83`, que devolve `null` para lista vazia (EST-1b). O acervo reprovou pelo mesmo motivo `19_cascata-waterfall/08 v3` (99), `07_rosca-e-radial/02 v3` (101) e `25_matriz-e-quadrantes/01 v2` (99), e deixou como observação só quando o impresso fechava 100 por coincidência (`19/08 v4`).

## v1_ganho-por-faixa-de-porte

Resultado: reprovada. Um bloqueante, igual nos dois temas. O resto confere: 502 oportunidades em cinco faixas na ordem do porte, ganho na base em `--chart-1`, perdido em `--line-strong` com o percentual escrito em cada ladrilho, taxa com volume no topo de cada coluna, desfecho nomeado à direita no lugar de legenda, `Muito grande` quebrado em duas linhas na coluna mais estreita, frase acessível de 154 caracteres.

### Bloqueante. Pergunta 6 (e 27). NUM-2

**O que o desenho faz.** Sob o nome de cada faixa vai a participação dela nas oportunidades, em percentual inteiro. As cinco somam 99.

**Evidência.**

* Textos do `preview.svg`, na linha de baixo do eixo: `14%`, `29%`, `25%`, `18%` e `13%`. Soma: 99.
* `Chart.tsx`, linha 151: `share: formatPercent(count / total, 0)`. Cada coluna arredonda sozinha.
* Valores exatos sobre 502: 14,34, 29,48, 25,10, 18,33 e 12,75. Pelo maior resto: 14, 30, 25, 18 e 13, que somam 100.

**Por que pesa.** A largura é a participação, e o número impresso sob ela é a leitura exata da largura. Quem soma o eixo chega a 99% das oportunidades. É a NUM-2 pela letra e a pergunta 6 com resposta não.

**O que mudar.**

1. Calcular as participações de uma vez, pelo maior resto, com a função das irmãs. Pequena passa a `30%`.
2. Renderizar nos dois temas e rodar o `check`.

### Na mesma passada, sem peso de bloqueio

1. **Par de ganho e perdido.** `lostText` (linha 144) arredonda por conta própria. Fecha 100,0 nas cinco colunas por coincidência do dado; na `v4` o mesmo cálculo imprime 100,1. Tirar o complemento da taxa já arredondada resolve nas três versões que o escrevem.
2. **Base da participação.** `14%` não diz de quê, e em Micro divide a coluna com `(14 de 72)`. O modelo `01` escreve `do total` na primeira coluna. Aqui a primeira coluna tem 72,6 px e `14% do total` pede 73,9 px pela estimativa do próprio arquivo (12 caracteres a 11 px e 0,56 em), então a folga é nenhuma: a saída sem risco é dizer a base na linha de leitura, que já fala da largura.

## v2_qualificacao-por-tempo-ate-contato

Resultado: reprovada. Um bloqueante, igual nos dois temas. O resto confere: 730 leads em quatro faixas com os limites escritos no eixo por `formatHours`, faixa do SLA em `--surface-sunken` com o rótulo `dentro do SLA` (o desvio do catálogo, que pedia `--surface-overlay`, está declarado e é o que a ANO-4 manda), linha global em tracejado 3 3 de `--text-muted` com nome e valor na margem, queda de `−13,9 p.p.` com o sinal tipográfico e a base nomeada, legenda com 34,1% e 65,9%, canvas por número com a conta no `notes`.

### Bloqueante. Pergunta 6 (e 27). NUM-2

**O que o desenho faz.** O mesmo da `v1`: a participação de cada faixa de tempo, em percentual inteiro, soma 99.

**Evidência.**

* Textos do `preview.svg`: `25%`, `33%`, `27%` e `14%`. Soma: 99.
* `Chart.tsx`, linha 169: `share: formatPercent(count / total, 0)`.
* Valores exatos sobre 730: 25,48, 33,15, 27,12 e 14,25. Pelo maior resto: 26, 33, 27 e 14.

**Por que pesa.** Igual à `v1`. Aqui a coluna que muda é a do SLA, a que o caso de uso pergunta: ela pesa 26% e o cartão diz 25%.

**O que mudar.**

1. Participações pelo maior resto. `até 1 h` passa a `26%`.
2. Renderizar nos dois temas e rodar o `check`.

### Na mesma passada, sem peso de bloqueio

1. **Par de taxa e complemento.** `lostText` (linha 160), como na `v1`.
2. **`data.ts`.** O comentário diz `from` incluso e `to` incluso. Um dos dois limites precisa ser exclusivo, ou 1 h cabe em duas faixas.
3. **Base da participação.** Como na `v1`.

## v3_qualificado-por-plataforma-e-formato

Resultado: reprovada. Um bloqueante, nos dois temas. O resto confere: 984 leads em três plataformas e nove colunas finais, vão de 4 px entre plataformas e de 1 px entre formatos, eixo em duas linhas com o fio da plataforma, três colunas acima da taxa global de 32,0% em `--chart-1` e cinco abaixo em `--line-strong`, Carrossel de Busca paga como linha de 2 px com `sem anúncio` e fora da taxa, três formatos de Redes sociais (1,6, 2,4 e 2,4 px) somados em `Outros formatos: 25,0% (2 de 8)`, os oito `n` impressos somando os 984 da legenda. Nenhum percentual impresso deixa de fechar.

### Bloqueante. Pergunta 20. ACE-3, TOK-5 e tabela 17.10

**O que o desenho faz.** A cor carrega três estados e a legenda é o único lugar que diz qual é qual. Duas das três amostras ficam abaixo de 3:1 contra o cartão, nos dois temas, e nenhuma tem valor ao lado.

**Evidência.**

* `Chart.tsx`, linhas 219 a 228: três amostras de 10 px, com `border border-line-subtle`, e só o nome ao lado.

| Amostra | Preenchimento | Escuro | Claro | Borda | Escuro | Claro |
|---|---|---|---|---|---|---|
| Qualificado acima da taxa global | `--chart-1` | 9,50 | 6,00 | `--line-subtle` | 1,25 | 1,29 |
| Qualificado abaixo da taxa global | `--line-strong` | **1,79** | **1,83** | `--line-subtle` | 1,25 | 1,29 |
| Não qualificado | `--surface-sunken` | **1,15** | **1,15** | `--line-subtle` | 1,25 | 1,29 |

* No recorte ampliado do PNG claro, a amostra de Não qualificado quase não se separa do cartão. As outras leituras fracas (Qualificado abaixo nos dois temas, Não qualificado no escuro) ainda se veem no recorte, apagadas; o que as reprova é a medida, não a impressão do revisor.
* A ACE-3 dá 3:1 para amostra, salvo com o valor escrito junto dela. A TOK-5 fecha a porta: a isenção vale para o neutro com o valor escrito ao lado, e amostra de legenda não tem valor escrito. A tabela 17.10 lista `--line-strong` sobre o cartão como par que só vale com valor escrito.
* A `v2` deste modelo tem a mesma amostra em `--line-strong` com `65,9%` ao lado, e passa. No modelo `01`, a `v2` passou pelo mesmo motivo.

**Por que pesa.** Contraste está na lista da seção 14.1 que bloqueia sempre. Os ladrilhos de `--line-strong` valem pela taxa escrita no topo da coluna; a amostra não tem essa saída. Quem não separa 1,8:1 fica com três nomes e uma cor, e decide qual cinza é qual pela posição contra a linha tracejada.

**O que mudar.**

1. Legenda com valor (ROT-5): os leads de cada estado ao lado do nome, em `kpi-number`. São 190 qualificados acima da taxa global, 125 abaixo e 669 não qualificados, que somam os 984 já escritos à direita. A legenda vai até perto de 522 dos 894 px e o total começa perto de 823: três números de três algarismos cabem na mesma linha.
2. Ou contorno de 1 px em `--text-muted` (5,21:1 e 5,37:1) nas duas amostras fracas, no lugar de `--line-subtle`. A primeira saída é melhor, porque também dá número à parte não qualificada.
3. Renderizar nos dois temas e rodar o `check`.

### Na mesma passada, sem peso de bloqueio

1. **Parte não qualificada sem número.** Os oito ladrilhos de cima não trazem percentual; ele sai por subtração de `38,9% (70 de 180)`. As irmãs escrevem o complemento no ladrilho (`lostLabeled`), e sobre `--surface-sunken` o `--text-secondary` mede 9,36:1 e 7,04:1. Com a saída 1 a parte já ganha o total.
2. **Ramo do zero medido.** `hasWidth` (linha 90) é `aired && total > 0`. Uma combinação com `aired: true` e nenhum lead cai no mesmo ramo do `aired: false`: vira linha fina e o rótulo escalonado escreve `sem anúncio` (linha 293). O `data.ts` diz que veicular sem gerar lead não é o mesmo que não veicular. O rótulo precisa separar os dois, por exemplo `sem lead` no primeiro.
3. **`notes` e canvas.** O `notes` conta o caso de uso em duas linhas e 265 px de corpo. No preset largo o caso de uso cabe em uma linha, o corpo mede 281,5 px e o SVG fica centrado com 8,25 px de sobra em cima e embaixo. Canvas por número de 960 por 384 fecha o cartão (GEO-1); se a legenda mudar de altura, refazer a conta.

## v4_porte-desconhecido-e-amostra-pequena

Resultado: reprovada. Dois bloqueantes, iguais nos dois temas. O resto confere: 521 oportunidades, 365 com porte informado (70%), porte desconhecido à direita com vão de 6 px, hachura e contorno em `--text-muted` e o rótulo sobre a hachura com halo; taxa global de 26,6% (97 de 365) só com porte informado, dita na legenda; Grande (10,6 px) e Muito grande (3,8 px) em rótulo escalonado com fio conector, o selo `amostra pequena` só no de 4 casos; zero medido com `0,0% (0 de 11)` escrito; canvas por número com a conta no `notes`.

### Bloqueante 1. Pergunta 6 (e 27). NUM-2 e ROT-10

**O que o desenho faz.** Dois conjuntos de percentuais impressos não fecham o todo que representam.

**Evidência.**

* **Micro soma 100,1.** O topo da coluna escreve `18,8% (18 de 96)` e o ladrilho de cima escreve `81,3%`. São 18,75% e 81,25%, e os dois sobem. `Chart.tsx`, linha 167: `lostText` é formatado à parte da taxa.
* **As participações impressas somam 97.** No eixo: `18%`, `29%`, `20%` e `30%`. Grande (2%) e Muito grande (1%) não têm participação: a linha 269 só escreve `share` quando a coluna não é escalonada, e o rótulo escalonado (linhas 280 e 281) leva só a taxa com o volume.
* **O subtítulo não bate com o eixo.** A linha de leitura diz `70% das oportunidades com faixa de porte informada`; as faixas conhecidas com participação impressa somam 67. Os 3 pontos que faltam não estão em lugar nenhum, e o total de 521, que deixaria fazer a conta com `0 de 11` e `1 de 4`, só existe na frase acessível.
* As seis participações fecham 100 pelo maior resto (18, 29, 20, 2, 1 e 30) e também pelo arredondamento simples, por coincidência do dado: a linha 172 usa `formatPercent(column.count / total, 0)`, como a `v1` e a `v2`.

**Por que pesa.** É a versão que existe para ensinar a ler cobertura, e o número de cobertura dela não se reconstrói pela tela. A pergunta 6 quer o impresso somando 100 e a 27 quer que o impresso some o todo; aqui dá 97 entre colunas e 100,1 dentro de uma.

**O que mudar.**

1. Tirar o complemento da taxa já arredondada: 100,0 menos 18,8 dá `81,2%` em Micro. Vale para as colunas largas e para a de porte desconhecido.
2. Participações pelo maior resto, com a função das irmãs, e a cobertura do subtítulo somada dos mesmos inteiros.
3. Escrever a participação também no rótulo escalonado, por exemplo `Grande, 2% do total: 0,0% (0 de 11)`. Pela estimativa do arquivo são 216 px e 253 px nos dois rótulos, contra 338 e 346 px livres à esquerda dos fios.
4. Renderizar nos dois temas e rodar o `check`.

### Bloqueante 2. Pergunta 20. ACE-3, TOK-5 e tabela 17.10

**O que o desenho faz.** A amostra de `Perdido` na legenda é um quadrado de `--line-strong` sem valor ao lado.

**Evidência.** `Chart.tsx`, linha 201. Mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão. É a mesma regra do bloqueante da `v3`: os ladrilhos valem pelo percentual escrito neles, a amostra não. O `check` avisa exatamente este elemento (`--line-strong como fundo de elemento sem texto`).

**O que mudar.** Uma das duas:

1. Valor ao lado, como na `v2`: 97 ganhas e 268 perdidas com porte informado. A legenda vai até perto de 540 dos 574 px, e os dois números pedem perto de 50: a linha quebra, o corpo ganha 20 px e a conta de altura do `notes` precisa ser refeita (GEO-18).
2. Contorno de 1 px em `--text-muted` na amostra, que não mexe na largura.

### Na mesma passada, sem peso de bloqueio

1. **Fio do zero.** Grande leva 2 px de `--chart-1` na base (linha 247). O catálogo diz que a faixa sem ganho desenha só a parte perdida, e a DAD-2 quer o zero em neutro fora da rampa: aqui o zero sai na cor do ganho. O número está escrito, por isso não reprova.
2. **Divisão da coluna desconhecida.** As duas partes levam a mesma hachura e a divisão (26,3%) fica a 0,4 px da linha global (26,6%), debaixo do fio de 4 px. No dado padrão não se vê que a coluna é dividida. Uma taxa a 3 pontos ou mais da global no `data.ts` mostra a divisão.
3. **Total.** Escrever os 521 no corpo.

## Pesado e não reprovado

* **`v1`, `v2` e `v4`, parte perdida em `--line-strong`.** Mede 1,79:1 e 1,83:1 contra o cartão e vale pela isenção da 17.2: cada ladrilho traz o próprio percentual, em `--text-primary` (8,13:1 e 9,79:1). Nas duas colunas finas da `v4` o número está no rótulo escalonado, ligado pelo fio. É o que o catálogo pede e o que os avisos de `CONTRASTE-MARCA` descrevem.
* **`v3`, qualificado abaixo da taxa global em `--line-strong`.** A taxa com o volume está no topo de cada coluna, que é o rótulo dela. O que não passa é só a amostra.
* **`v3`, parte não qualificada em `--surface-sunken`.** A 1,15:1 ela é trilho, o uso que a TOK-1 dá ao token, e não compete com a parte que carrega a taxa. Fica sem número por ladrilho, o que a ROT-10 pede pela letra; como a taxa e o volume da coluna estão escritos, ficou como observação.
* **`v2`, `v3` e `v4`, fio sob a linha global.** Os 4 px de `--surface-raised` partem os ladrilhos e escondem o topo do ganho a até 2 px da linha: `1 a 4 h` na `v2`, Pequena na `v4`. É a saída que a TOK-10 mede para guia sobre marca preenchida, as colunas são coladas e a guia não tem por onde passar por fora, e a taxa de cada coluna está escrita. Observação, no README.
* **`v2`, três anotações.** Faixa do SLA, linha global e queda em p.p. passam das duas da ANO-1. O catálogo pede as três, e tirar uma faria a versão deixar de demonstrar o que ele diz.
* **`v3`, ramo `sem anúncio` para zero medido.** Faz o cartão afirmar ausência onde houve veiculação, mas só fora do dado padrão. O acervo trata ramo não renderizado como observação; vai na mesma passada porque a versão já volta.
* **`v4`, fio do zero em `--chart-1`.** Marca mínima para zero é o que a EST-3 pede; a cor é que foge da DAD-2. Com `0,0% (0 de 11)` escrito ao lado, não muda o que o cartão afirma.
* **Ordem da legenda na `v2`, na `v3` e na `v4`.** Da base para o topo, contra a ROT-4. O modelo `01` passou do mesmo jeito.

## Tensões de régua notadas

* Nenhuma guarda soma percentual impresso (NUM-2): três das quatro versões passam no `check` com 99, 99 e 97 entre colunas, e uma com 100,1 dentro da coluna.
* A `CONTRASTE-MARCA` avisa a amostra de legenda em `--line-strong` sem separar a que tem valor ao lado (`v2`, que passa) da que não tem (`v3` e `v4`). A TOK-5 diz que amostra não tem a isenção, e a guarda só orienta.
* O verbete do catálogo contradiz o contrato em três pontos: `--surface-overlay` na faixa do SLA da `v2` (ANO-4), três anotações na `v2` (ANO-1) e faixa sem ganho que desenha só a parte perdida na `v4` (EST-3). No primeiro o produtor desviou pelo contrato e declarou.
* A 17.2 não tem papel para trilho de parte de um todo: `--surface-sunken` como complemento da `v3` vem da TOK-1, e nenhuma linha da tabela diz se ele precisa de número.

## Registro

```
Versão: 26_mosaico-marimekko/03_spineplot/v1_ganho-por-faixa-de-porte
Data: 2026-10-13
Resultado: reprovada
Não: 6 (e 27)
Correções:
  6. NUM-2: participações das colunas pelo maior resto; hoje somam 99 (14, 29, 25, 18 e 13).
Não se aplica: 13, 26, 28, 29, 30, 31, 32

Versão: 26_mosaico-marimekko/03_spineplot/v2_qualificacao-por-tempo-ate-contato
Data: 2026-10-13
Resultado: reprovada
Não: 6 (e 27)
Correções:
  6. NUM-2: participações das colunas pelo maior resto; hoje somam 99 (25, 33, 27 e 14).
Não se aplica: 26, 28, 29, 30

Versão: 26_mosaico-marimekko/03_spineplot/v3_qualificado-por-plataforma-e-formato
Data: 2026-10-13
Resultado: reprovada
Não: 20
Correções:
  20. ACE-3 e TOK-5: valor ao lado das amostras da legenda (190, 125 e 669 leads) ou contorno em --text-muted; hoje duas medem de 1,15:1 a 1,83:1.
Não se aplica: 26, 28, 29, 30

Versão: 26_mosaico-marimekko/03_spineplot/v4_porte-desconhecido-e-amostra-pequena
Data: 2026-10-13
Resultado: reprovada
Não: 6 (e 27), 20
Correções:
  6. NUM-2 e ROT-10: complemento tirado da taxa arredondada (Micro imprime 18,8% e 81,3%) e participação pelo maior resto também no rótulo escalonado (o eixo soma 97 e o subtítulo diz 70% contra 67 impressos).
  20. ACE-3 e TOK-5: valor ao lado da amostra de Perdido ou contorno em --text-muted; hoje mede 1,79:1 e 1,83:1.
Não se aplica: 26, 28, 29, 30
```
