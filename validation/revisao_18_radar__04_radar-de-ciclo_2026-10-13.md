# Parecer de revisão: 18_radar/04_radar-de-ciclo

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 08:13 e 08:14, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes em uso.

Resultado: `v1` aprovada; `v2`, `v3` e `v4` reprovadas. São quatro bloqueantes: um na `v2`, dois na `v3` e um na `v4`. As observações não bloqueantes estão no README do modelo.

## Peso dos bloqueantes

* **`v2`, contorno do fim de semana sobre o preenchimento do dia útil.** Perguntas 20 e 32; ACE-3 e ACE-6; COR-5; armadilhas TOK-4 e TOK-9. Contraste é regra que bloqueia sempre pela seção 14.1, e o número medido fica abaixo do piso nos dois temas. É o mesmo encontro de regras que reprovou `18_radar/03_radar-em-pequenos-multiplos/v2` hoje.
* **`v3`, hora sem resposta desenhada como zero.** Pergunta 8; EIX-10, EST-2 e ACE-2; armadilha DAD-2. Ausência exibida como zero bloqueia sempre. O defeito mora num ramo que o dado padrão não exercita, mas é ramo que dado válido alcança (basta uma hora com `total` 0) e que o tipo e o comentário do próprio arquivo declaram tratado.
* **`v3`, preenchimento abaixo do piso sobre o setor do expediente, no tema claro.** Perguntas 20 e 30; ACE-5 e ACE-3. Pesa menos que o primeiro: o contorno de 2 px segue visível e o trecho afetado é pequeno no dado padrão. É número abaixo do piso, e entra aqui para ser corrigido na mesma rodada.
* **`v4`, rótulo da escala em cima do raio de ausência de novembro.** Pergunta 31; ROT-7, exceção da marca fina; armadilhas GEO-4 e GEO-15. Constante de posição com consequência visível no preview: marca partida e colisão, nos dois temas. O raio pontilhado é o que a versão diz demonstrar.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, inteiros e com recorte ampliado (miolo da `v2` e da `v3`, canto da escala da `v1` e da `v4`, anotação da `v2`); a cor de pixel do contorno, do preenchimento, do setor e do cartão; o contraste pela fórmula da WCAG sobre o pixel; a posição dos textos lida no `preview.svg`; o raio de um vértice por versão contra o dado (14h da `v1`, 0h da `v3`, janeiro da `v4`); as contas da linha de leitura refeitas à mão (9,2 e 23%; 9,6, 4,6 e 21h; 71%, que são 280 de 395; 61 e 27).
* **Lido no pacote:** `node_modules/recharts/es6/polar/Radar.js` e `es6/shape/Polygon.js`, versão 3.10.1, para o ramo do valor nulo da `v3`.
* **Não medido pela ferramenta:** ESPESSURA-MARCA, EIXO-CALMO e RAIO-CONTRA-AREA nas quatro; FORMATO-ACESSIVEL na `v2` e na `v3`, conferido à mão (o mesmo formatador na frase e no corpo); OPACIDADE-MARCA na `v4`, que não tem preenchimento. Nenhuma guarda mede marca contra marca nem marca contra superfície que não seja o cartão.
* **Não renderizado:** o estado vazio das quatro e o ramo de hora nula da `v3`. O que se diz deles é leitura de código.
* **Não sondado:** a dica das quatro versões.
* **Não testado:** as saídas sugeridas abaixo. Os números citados nelas são conta, não render.

Medidas de palco: PNG de 960 por 960 px, o dobro do canvas `quadrado` de 480 por 480. Raio do anel de fora: 126,3 px na `v1`, 110,4 px na `v2`, 122,6 px na `v3` e 107,8 px na `v4`.

## `v2_dia-util-contra-fim-de-semana`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 20 e 32; ACE-3 e ACE-6; COR-5; saída pela TOK-4, medição pela TOK-9

**Evidência.** O fim de semana é o segundo `Radar` (linha 309): contorno em `--chart-3`, 2,5 px, com `zIndex` 250, pintado por cima do preenchimento do dia útil (`--chart-1`, `fillOpacity` 0,66). Pelo dado, a média do fim de semana só passa a do dia útil das 21h às 4h; das 5h às 20h, 16 das 24 horas, o contorno corre por cima do preenchimento.

| Tema | Contorno do fim de semana | Preenchimento do dia útil | Contraste entre os dois | Contorno contra o cartão |
|---|---|---|---|---|
| escuro | pixel (124, 156, 248) | pixel (36, 150, 169) | 1,33:1 | 6,47:1 |
| claro | pixel (43, 91, 196) | pixel (94, 159, 169) | 2,06:1 | 6,18:1 |

O piso da ACE-3 é de 3:1 contra o fundo adjacente, e nesse trecho o fundo adjacente do contorno é o preenchimento. O `check` não vê, porque toda guarda mede marca contra cartão. A isenção do valor escrito não vale: os números do fim de semana na tela (4,1 às 21h e 4,6 às 22h) são do trecho que está sobre o cartão. No escuro, que é o padrão do Farol, o trecho diurno do fim de semana se separa do fundo só pelo matiz, e é esse trecho que mostra o outro lado da comparação: fim de semana perto de 1 entrada por hora enquanto o dia útil passa de 9.

**O que mudar.** Revestimento na cor da superfície por baixo do contorno do fim de semana, que é a saída da TOK-4 e o que a COR-5 autoriza entre vizinhos que não contrastam: um traço cheio em `--surface-raised`, seguindo o mesmo contorno, com cerca de 1,5 px a mais de cada lado (5,5 px no total), pintado depois do preenchimento do dia útil e antes do contorno em `--chart-3`. O contorno passa a medir contra o revestimento o mesmo que mede contra o cartão (6,47:1 e 6,18:1), e o revestimento mede contra o preenchimento 4,88:1 no escuro e 3,00:1 no claro.

Dois cuidados. Conferir nos dois PNGs que o revestimento não parte o contorno de 2 px do dia útil nos dois cruzamentos (entre 20h e 21h e entre 4h e 5h); se partir, o contorno do dia útil passa a ser pintado depois do revestimento. E escrever os números medidos do par na nota do `meta.json`, como manda a TOK-9. Trocar só o token não resolve: pela TOK-4, nenhum par categórico chega a 3:1 entre si.

## `v3_resposta-fora-do-sla-com-expediente`: reprovada, dois bloqueantes

### Bloqueante 1. Pergunta 8; EIX-10, EST-2 e ACE-2; armadilha DAD-2

**Evidência, por leitura de código (o dado padrão não exercita o ramo).** A linha 176 calcula `rate: row.total > 0 ? (row.breaches / row.total) * 100 : null`, e o tipo `SlaRow` documenta o nulo como "sem resposta na hora". Hora com `total` 0 é dado válido e provável: no próprio dado fictício as horas 2 a 5 têm de 7 a 14 respostas no mês. A série é o `<Radar>` padrão da linha 296, sem `shape` próprio.

No Recharts 3.10.1, `es6/polar/Radar.js:129` faz `var radius = isNullish(pointValue) ? 0 : …`, isto é, o ponto nulo recebe raio zero com coordenada válida, e `es6/shape/Polygon.js`, linhas 14 a 41, só parte o caminho em ponto sem `x` e `y` numéricos. O vértice da hora nula cai, portanto, no centro, e o polígono recolhe até lá exatamente como recolhe hoje na hora 4, que é zero medido (0 de 7). A única diferença seria a falta do ponto vazado, e ela não se vê: todos os eixos se encontram no centro, onde o ponto vazado da hora 4 já está.

O comentário das linhas 248 a 251 afirma que a hora sem resposta "nem entra no polígono". Não é o que o pacote faz, e a `v4` deste mesmo modelo registra o comportamento real ("o polígono padrão do Radar põe o mês nulo no centro", na nota do `meta.json`) e o resolve com `shape` próprio. A consequência na tela do Farol: a hora em que ninguém respondeu aparece como 0% fora do SLA, a melhor hora do dia. A dica escreve `formatUnavailable()` (linha 270), mas a DIC-5 não deixa o nulo morar só na dica.

**O que mudar.**

1. Desenhar a série por `shape` próprio, como a `v4`: preenchimento e contorno partidos na hora nula, ligando só horas vizinhas medidas, sem vértice no centro para o nulo. O zero medido continua com o vértice no centro.
2. Dar à hora ausente forma e palavra próprias (ACE-2): raio pontilhado em `--text-muted` do centro à borda, como o `1 4` da `v4`, e um item de legenda dizendo "sem resposta na hora".
3. Dar palavra ao zero medido: hoje nada na tela diz o que é o ponto vazado do centro, e vazado é a forma da ausência no catálogo. Um item de legenda ou a linha de leitura resolve; um ponto cheio pequeno no zero evita a confusão com a ausência.
4. Corrigir o comentário de `renderDot`.
5. Exercitar o caso no `data.ts`, para o PNG provar: por exemplo a hora 3 com `total` 0 e `breaches` 0. O 71% da linha de leitura se mantém (276 de 391, que dá 70,6%).

Um cuidado: `scaleSpot` leva a escala para o vão de menor alcance, que passa a ser o da hora nula. O rótulo da escala não pode cair sobre o raio pontilhado, que é o bloqueante da `v4` abaixo: no anel de 20% a bissetriz fica a cerca de 5 px do eixo vizinho, e um rótulo de 21 px não cabe ali.

### Bloqueante 2, de peso menor. Perguntas 20 e 30; ACE-5 e ACE-3

**Evidência.** O preenchimento da série tem `fillOpacity` de 0,66, "o mínimo da ACE-5 para o tema claro" segundo o README, e essa conta foi feita contra o cartão. Dentro do setor do expediente o fundo é `--surface-sunken`, e ali o composto fica abaixo do piso no claro:

| Tema | Preenchimento sobre o setor | Setor | Contraste | Preenchimento sobre o cartão, contra o cartão |
|---|---|---|---|---|
| claro | pixel (87, 154, 166) | pixel (234, 239, 247) | 2,76:1 | 3,00:1 |
| escuro | pixel (32, 144, 161) | pixel (7, 12, 22) | 5,19:1 | 4,88:1 |

O contorno de 2 px mede 5,20:1 contra o setor no claro, e por isso a marca não some. No dado padrão o trecho é pequeno (as taxas do expediente ficam entre 9 e 12 px do centro), mas o setor é justamente onde a pergunta do caso de uso manda olhar, e com dado real a taxa de dentro do expediente não tem por que ser pequena.

**O que mudar.** Subir `FILL_OPACITY` até o composto medir 3:1 contra `--surface-sunken` no claro. Pela conta sobre os pixels, 0,70 dá 2,99:1 e 0,72 dá cerca de 3,07:1; confirmar no pixel depois do render. O comentário da constante e o item 4 da Anatomia do README passam a citar o número novo e o fundo contra o qual ele foi medido.

## `v4_doze-meses-com-ano-parcial`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 31; ROT-7, exceção da marca fina; armadilhas GEO-4 e GEO-15

**Evidência.** `scaleSpot` (linhas 84 a 103) põe a escala no vão de menor alcance e, no empate entre os quatro vãos com mês nulo, no mais perto da diagonal: a bissetriz entre novembro e dezembro, a 135°. Os dois eixos vizinhos levam o raio pontilhado de ausência (linha 202, traço `1 4`, 1,5 px, `--text-muted`), que é o que a versão diz demonstrar. No anel de 20 o raio do desenho é de 26,95 px e a bissetriz fica a 7 px de cada raio pontilhado; o rótulo `20`, ancorado pelo fim a 4 px do anel, tem cerca de 13 px de largura e avança sobre o raio de novembro. Pelo `preview.svg` (corpo de 422 por 316), a tinta do rótulo vai de x 174,7 a 187,9 e de y 133,9 a 142,9, e o raio de novembro a atravessa de x 184,8 até a borda esquerda.

Nos dois PNGs o raio de novembro perde três pontos seguidos, os de 30, 35 e 40 px do centro, cobertos pelo rótulo e pelo halo de 4 px dele: entre o ponto visível a 25 px e o seguinte, a 45 px, ficam 20 px sem ponto, num passo de 5 px. O raio lê como partido e o `20` lê como preso ao eixo de novembro. O `40` passa a cerca de 2 px do mesmo raio, sem corte.

Agravante pela GEO-15: o `80` cai na mesma linha do nome `nov` (y 81,8 contra 78,1), cerca de 9 px à direita dele, no mês que está "a medir". Lado a lado, os dois leem como par.

**O que mudar.** Pela exceção da marca fina da ROT-7, quem sai do lugar é o rótulo. Duas saídas, a escolher:

1. Manter a escala no vão e só escrever o nível que cabe entre os dois raios com folga. No anel de 20 sobram cerca de 8 px úteis para um rótulo de 13 px, em qualquer âncora, então o `20` não se escreve; o `40` precisa de pelo menos 4 px do raio.
2. Levar a escala para um vão sem raio pontilhado, escrevendo só os níveis acima do traço da série, que é o que `SCALE_CLEAR` já faz.

Nas duas, afastar o último nível do nome do mês vizinho, para os dois não dividirem a linha, e conferir nos dois temas que nenhum ponto dos três raios some.

## `v1_entradas-de-lead-por-hora-do-dia`: aprovada

Sem bloqueante. Conferido: 0h no topo e sentido horário (6h à direita, 12h embaixo, 18h à esquerda); domínio de 0 a 10 em cinco anéis, calculado do pico; ponto do pico às 14h a 116 px do centro num raio de 126,3 px, que é 9,2 de 10; 285 entradas em 31 dias; 697 de 3.001 entradas fora das 8h às 18h, que dá 23%; 24 tiques de hora na borda, quatro deles com rótulo; textos em 11 e 12 px, pesos 500 e 600, nenhum girado; frase acessível de 197 caracteres. O preenchimento a 0,66 mede 4,88:1 no escuro e 3,00:1 no claro contra o cartão, no limite do piso. As observações estão no README.

## Registro

```
Versão: 18_radar/04_radar-de-ciclo/v1_entradas-de-lead-por-hora-do-dia
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29

Versão: 18_radar/04_radar-de-ciclo/v2_dia-util-contra-fim-de-semana
Data: 2026-10-13
Resultado: reprovada
Não: 20, 32
Correções:
  20 e 32. ACE-3, ACE-6 e COR-5: revestimento em --surface-raised por baixo do contorno do fim de semana, que hoje mede 1,33:1 e 2,06:1 contra o preenchimento do dia útil.
Não se aplica: 6, 26, 27, 28, 29

Versão: 18_radar/04_radar-de-ciclo/v3_resposta-fora-do-sla-com-expediente
Data: 2026-10-13
Resultado: reprovada
Não: 8, 20, 30
Correções:
  8. EIX-10, EST-2 e ACE-2: partir o polígono na hora nula por shape próprio, marcar o eixo ausente com raio pontilhado e palavra, nomear o zero medido e exercitar o caso no data.ts.
  20 e 30. ACE-5 e ACE-3: subir o preenchimento até 3:1 contra --surface-sunken no claro, onde hoje mede 2,76:1.
Não se aplica: 6, 26, 27, 28, 29

Versão: 18_radar/04_radar-de-ciclo/v4_doze-meses-com-ano-parcial
Data: 2026-10-13
Resultado: reprovada
Não: 31
Correções:
  31. ROT-7, marca fina: tirar o rótulo 20 da escala de cima do raio de ausência de novembro e afastar o 80 do nome do mês.
Não se aplica: 6, 26, 27, 28, 29, 30
```
