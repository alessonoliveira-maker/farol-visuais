# Parecer de revisão: 18_radar/01_radar-simples

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 06:13, posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 1 aviso (CONTRASTE-MARCA na `v3`), 0 escapes em uso.

Resultado: `v2` e `v3` aprovadas; `v1` e `v4` reprovadas, com dois bloqueantes cada uma. As observações não bloqueantes estão no README do modelo.

## Peso dos bloqueantes

* **`v1` e `v4`, número da escala fora do anel que ele nomeia.** Pergunta 13; seção 14.1, domínio de eixo; EIX-4. Não é acabamento: o número da escala existe só para dizer quanto vale cada anel, e nas duas versões ele cai em cima ou ao lado do anel seguinte, de modo que o anel de 100 se lê como 75. A 14.1 põe domínio de eixo entre as regras que bloqueiam sempre, e a emenda da EIX-6b já trata tique fora da linha de grade dele como defeito.
* **`v1`, rótulos do topo e da base desenhados para dentro do gráfico.** Pergunta 15; ROT-7. Não é constante fora do valor: é sinal trocado numa conta, com consequência no preview (nome e valor por cima do vértice e do raio da grade) e com consequência pior no dado que a escala admite, porque a ROT-7 manda decidir pelo que o dado pode produzir.
* **`v4`, dica muda no eixo sem dado.** Pergunta 18; DIC-1 e REC-6. O `meta.json` e o catálogo dizem que a versão demonstra a dica que escreve sem dado no eixo ausente, e a dica não abre ali. Versão que não entrega o que o catálogo diz é bloqueante por si.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, com recorte ampliado das zonas de texto; a geometria de cada `preview.svg` (anéis, raios, vértices, âncoras de texto); a tinta dos números da escala no PNG claro, pela caixa dos pixels de texto, contra a linha de cada anel; o raio de um vértice por versão contra o valor do `data.ts` (58, 72, 64 e 70 caem em 0,58, 0,72, 0,64 e 0,70 do raio externo, escala linear a partir do centro nas quatro); os contrastes da coroa, do contorno e da série da `v3` nos dois temas.
* **Sondado em navegador:** a dica da `v3` e da `v4`, montadas pelo mesmo empacotador do render e com o mouse levado a cada eixo, nos dois temas. A sonda não gravou nada no catálogo.
* **Não medido pela ferramenta:** ESPESSURA-MARCA, EIXO-CALMO e RAIO-CONTRA-AREA nas quatro (peça sem barra, sem grade cartesiana e lida por distância ao centro, não por área); OPACIDADE-MARCA na `v3` e na `v4`, que não têm opacidade em marca. O que cabia medir à mão está no item acima.
* **Não renderizado:** o estado vazio das quatro e o estado de todos os eixos nulos da `v4`. O que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. As posições citadas nelas são conta sobre o `preview.svg`, não render.

As coordenadas abaixo são do palco do gráfico da `v1` e da `v4`: 422 por 332 px, centro em (211; 166), raio externo de 116,64 px.

## `v1_perfil-de-qualidade-da-origem`: reprovada, dois bloqueantes

### Bloqueante 1. Pergunta 13; seção 14.1 (domínio de eixo), EIX-4; saída pela geometria da grade

**Evidência.** A escala mora na bissetriz entre Resposta e Agenda, que é a horizontal à esquerda do centro. O Recharts entrega o tique no raio cheio do nível (58,32 px para 50, 87,48 para 75, 116,64 para 100), e a grade é hexagonal: o anel de cada nível cruza a bissetriz em raio vezes cos(π/6), isto é, 13,4% mais perto do centro. Medido no PNG claro:

| Número | Tinta em X | Linha do anel dele | Linha do anel seguinte |
|---|---|---|---|
| `50` | 136,0 a 148,0 | anel de 50 em 160,49, a 12,5 px | anel de 75 em 135,24, a 0,8 px |
| `75` | 106,5 a 119,0 | anel de 75 em 135,24, a 16,2 px | anel de 100 em 109,99, dentro da tinta |
| `100` | 71,0 a 89,5 | anel de 100 em 109,99, a 20,5 px | não há |

No PNG, a aresta esquerda do hexágono de fora passa por dentro do `7` e é interrompida pelo halo do número; o `50` começa colado na aresta do anel de 75; o `100` flutua fora da grade. Quem lê a escala conclui que o anel de fora vale 75 e o seguinte vale 50, um degrau de 25 pontos abaixo do que valem. A própria peça desmente a leitura: Fit, escrito 62, tem o vértice entre o segundo e o terceiro anel, que por essa leitura ficariam abaixo de 50.

**O que mudar.** Pôr cada número no anel que ele nomeia. Três saídas, qualquer uma serve:

1. Manter a grade poligonal e a bissetriz, e levar o tique ao ponto em que o anel cruza a bissetriz: distância ao centro vezes cos(π/n), com n igual ao número de eixos. No `renderScaleTick` isso é recuar o ponto (x; y) em direção ao centro de `raio do tique × (1 − cos(π/n))`. O corte `level < spot.floor + SCALE_CLEAR` passa a comparar o nível já multiplicado pelo mesmo cosseno, porque é nessa distância que o número fica.
2. Pôr a escala sobre um raio (o `angle` de um eixo), onde tique e vértice do anel coincidem, e resolver o encontro com o polígono de outro jeito.
3. Usar `gridType="circle"`, como a `v2`, em que o tique cai no anel em qualquer ângulo.

Pela saída 1, na `v1` o `75` passaria a terminar em 131,2 (a 4 px do anel dele e a cerca de 8 px do anel de 100) e o `100` em 106,0. Conta, não render.

### Bloqueante 2. Pergunta 15 (e 13); ROT-7, com a Anatomia do README

**Evidência.** O bloco de nome e valor dos eixos do topo e da base cresce para dentro do gráfico, e o dos eixos laterais fica 8,7 px fora do hexágono. No `preview.svg`:

| Eixo | Vértice do anel de 100 | Nome | Valor |
|---|---|---|---|
| Telefone (topo) | y = 49,36 | y = 46,36, em cima do vértice | `58` em y = 60,36, dentro da grade e sobre o raio |
| Fit (base) | y = 282,64 | y = 271,64, dentro da grade e sobre o raio | `62` em y = 285,64, em cima do vértice |

Nos dois PNGs as arestas do hexágono saem por baixo da palavra Telefone, o raio vertical atravessa o `58` e o `Fit`, e o vértice de baixo some sob o `62`. Os textos não têm halo. A causa está em `renderAngleTick`, linhas 130 a 139: `rad` já nasce com o sinal trocado (`-angle`), e `sin = -Math.sin(rad)` troca de novo, então `sin` vale +1 no topo e o ramo que faz o bloco crescer para cima dispara na base. O comentário da linha 138 descreve o contrário do que o código faz, e a Anatomia do README promete que o bloco cresce para fora do eixo.

Com o dado de hoje o rótulo só pisa na grade. Com dado que a escala admite ele pisa na marca: o `58` ocupa de 55,8 a 64,2 em Y, e o ponto de um valor a partir de cerca de 84 no eixo do topo (ou da base) cai em cima do número; em 100, cai em cima do nome. A ROT-7 manda decidir pelo que o dado pode produzir.

**O que mudar.** Usar a direção do eixo como a `v2` e a `v4` fazem (`axisDirection`, com `dy` negativo no topo), ou tirar a segunda negação. Com o sinal certo o bloco do topo vai para y = 18,36 e 32,36 e o da base para 299,64 e 313,64, as mesmas posições da `v2` e da `v4`, dentro dos 332 px do palco. Conta, não render. Depois da troca, conferir de novo o encontro dos rótulos de Agenda e Resposta com os números da escala, que mudam de lugar pelo bloqueante 1.

## `v4_eixo-sem-dado-e-indice-normalizado`: reprovada, dois bloqueantes

### Bloqueante 1. Pergunta 13; seção 14.1 (domínio de eixo), EIX-4

**Evidência.** Mesma causa da `v1`, com grade de sete lados: a escala mora na bissetriz entre Negociação e Follow up (38,57° abaixo da horizontal, à direita), o tique sai no raio cheio e o anel cruza a bissetriz em raio vezes cos(π/7), 9,9% mais perto do centro. O desvio cresce com o nível. Distância ao centro medida ao longo da bissetriz, no PNG claro:

| Número | Tinta | Anel dele | Anel seguinte |
|---|---|---|---|
| `25` | 30,5 a 45,0 | em 26,3, a 4,3 px | anel de 50 em 52,5, a 7,6 px |
| `50` | 60,1 a 74,1 | em 52,5, a 7,5 px | anel de 75 em 78,8, a 4,7 px |
| `75` | 88,9 a 103,3 | em 78,8, a 10,1 px | anel de 100 em 105,1, a 1,8 px |
| `100` | 118,5 a 137,6 | em 105,1, a 13,4 px | não há |

O `25` ainda fica do lado do anel dele. O `50` já está mais perto do anel de 75 do que do próprio, o `75` encosta por dentro na aresta do heptágono de fora, e o `100` fica solto fora da grade. No PNG lê-se o anel de fora como 75. A peça escreve 70 em Descoberta com o vértice logo abaixo do terceiro anel, que por essa leitura valeria 50.

**O que mudar.** As mesmas três saídas do bloqueante 1 da `v1`, com n = 7. Como o defeito e o código são os mesmos nas duas versões, a correção deve ser uma só e igual nas duas.

### Bloqueante 2. Pergunta 18; DIC-1, DIC-5 e REC-6; item do `demonstrates` sem entrega

**Evidência.** O `meta.json` e o catálogo dizem que a versão demonstra a "Dica que escreve sem dado no eixo ausente, sem imprimir zero". A sonda em navegador, nos dois temas, deu:

| Onde o mouse parou (palco de 422 por 332) | Dica |
|---|---|
| (211; 100), eixo Descoberta | `Descoberta`, `Percentil no time 70`, `Posição 4º de 11` |
| (236; 218), eixo Follow up, zero medido | `Follow up`, `Percentil no time 0`, `Posição 11º de 11` |
| (131; 184), eixo Precisão de forecast, sem dado | nenhuma: invólucro com `visibility: hidden` e sem conteúdo |
| (105; 190), ponta do mesmo eixo | nenhuma, idem |

A causa está no pacote, não no desenho: em `recharts/es6/component/Tooltip.js` (3.10.1, linhas 147 a 150) o `filterNull`, ligado por padrão, tira do `payload` toda entrada com valor nulo, e com o `payload` vazio o invólucro fica escondido antes de o `content` contar. No `Chart.tsx`, `renderTooltip` (linhas 284 a 304) lê `payload?.[0]?.payload`, recebe `undefined` e devolve `null`; o ramo das linhas 290 e 291, que escreve `sem dado`, nunca roda. A ausência continua escrita no rótulo do eixo, então a DIC-5 está atendida e nada essencial se perde; o que cai é o item que a versão diz demonstrar.

**O que mudar.** Passar `filterNull={false}` ao `<Tooltip>` (linha 317) e, como manda a saída da REC-6, buscar a linha no próprio `data` pelo `label` da dica em vez de confiar no `payload` que o Recharts devolve. Conferir passando o mouse no eixo sem dado: a dica tem de abrir com o nome da dimensão e `sem dado`, sem número. Se a correção não for feita, a alternativa é tirar o item do `demonstrates` e da linha da versão no README, e isso é decisão do dono, porque o catálogo pede o item.

## `v2_perfil-do-sdr-com-eixo-mais-fraco`: aprovada

Sem bloqueante. A grade é circular, então os três números da escala caem no círculo que nomeiam (âncoras a 58,32, 87,48 e 116,64 px do centro, conferidas no `preview.svg`). Os rótulos de eixo crescem para fora, com 11 px de folga contra o círculo de 100 medidos pelos cantos da caixa (GEO-19). O eixo mais fraco tem ponto de 6,5 px contra 3,5 px e dois elementos em 700, o nome e o valor (TIP-3, COR-2). O preenchimento a 0,66 foi medido pela OPACIDADE-MARCA e o desvio do catálogo (0,28) está declarado na nota do `meta.json`. Frase acessível de 153 caracteres, calculada do dado.

## `v3_executivo-na-faixa-do-time`: aprovada

Sem bloqueante. A coroa confere com o dado (em Descoberta, contorno de fora a 0,81 e de dentro a 0,48 do raio externo, para máximo de 81 e mínimo de 48). Os três vértices fora da faixa saem vazados e com valor; os cinco de dentro, cheios. O contorno da coroa mede 5,21:1 no escuro e 5,37:1 no claro contra o cartão, e a série mede 5,32:1 e 3,27:1 contra o preenchimento da coroa. A dica abriu nos dois temas com o valor e a faixa da dimensão. A versão não escreve números de escala sobre o gráfico (a escala vai na legenda, anéis de 25 em 25), então o bloqueante 1 da `v1` e da `v4` não a alcança. Cinco observações no README, e a primeira delas (o comentário do `data.ts` que põe o executivo dentro da própria faixa) vale ser corrigida na mesma rodada se alguém abrir o arquivo.

## Registro no formato do checklist

```
Versão: 18_radar/01_radar-simples/v1_perfil-de-qualidade-da-origem
Data: 2026-10-13
Resultado: reprovada
Não: 13, 15
Correções:
  13. EIX-4 e seção 14.1: levar cada número da escala ao anel que ele nomeia (raio vezes cos(π/n), escala num raio ou grade circular).
  15. ROT-7: fazer o bloco de nome e valor do topo e da base crescer para fora do gráfico, corrigindo o sinal em renderAngleTick.
Não se aplica: 6, 18, 27, 28, 29, 32

Versão: 18_radar/01_radar-simples/v2_perfil-do-sdr-com-eixo-mais-fraco
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 18, 27, 28, 29, 32

Versão: 18_radar/01_radar-simples/v3_executivo-na-faixa-do-time
Data: 2026-10-13
Resultado: aprovada
Não: nenhum (a 10 fica anotada como observação pela seção 14.1: três valores em peso 700, sem consequência no preview)
Correções: nenhuma
Não se aplica: 6, 27, 28, 29, 30, 32

Versão: 18_radar/01_radar-simples/v4_eixo-sem-dado-e-indice-normalizado
Data: 2026-10-13
Resultado: reprovada
Não: 13, 18
Correções:
  13. EIX-4 e seção 14.1: levar cada número da escala ao anel que ele nomeia, com a mesma saída da v1.
  18. DIC-1 e REC-6: fazer a dica abrir no eixo sem dado (filterNull desligado no Tooltip e linha buscada no dado pelo label).
Não se aplica: 6, 27, 28, 29, 30, 32
```
