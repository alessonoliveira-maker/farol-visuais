# Parecer de revisão: 09_dispersao-e-bolhas/06_antes-e-depois-com-setas

Data: 2026-10-15. Segunda passada da segunda rodada de correção, autorizada pelo dono em 2026-10-15, sobre o bloqueante do parecer de 2026-10-05 (nome estacionado junto do ponto de outra entidade). Julgadas: `v1_canais-entre-trimestres` e `v3_origens-cruzando-a-meta`, sobre o código de hoje.

Resultado: `v3` aprovada; `v1` reprovada.

## Como foi medido

- `npm run check -- 09_dispersao-e-bolhas/06_antes-e-depois-com-setas`: 0 com erro, 1 aviso (frase da `v1` com 236 caracteres).
- Geometria lida do `preview.svg` e do `preview-claro.svg` no Edge, pela caixa de cada `<text>` (`getBBox`, tinta vertical de 12 px em volta da linha central). Distância em px do `viewBox` (894 de largura), da caixa do nome até o centro de cada ponto, de origem e de destino. A geometria é idêntica nos dois temas.
- Contraste pela fórmula da WCAG, com a cor computada do traço contra o fundo do cartão de cada tema.

## Nome a nome

`v1_canais-entre-trimestres` (próprio destino contra o ponto alheio mais perto):

| Nome | Próprio | Alheio mais perto | Resultado |
|---|---|---|---|
| Indicação | 13,6 | origem de Busca paga, 94,3 | próprio mais perto |
| Parcerias comerciais | 13,6 | origem de Eventos, 46,6 | próprio mais perto |
| Eventos corporativos | 13,6 | destino de Mídia, 25,4 | próprio mais perto |
| Redes sociais | 13,6 | origem de Eventos, 33,0 | próprio mais perto |
| Outbound direto | 11,7 | destino de Eventos, 15,1 | próprio mais perto, folga de 3,4 |
| Busca paga | 16,0 | origem de Indicação, 30,9 | próprio mais perto |
| Conteúdo orgânico | 13,0 | origem de Busca paga, 39,6 | próprio mais perto |
| Mídia programática institucional | 104,8 | destino de Eventos, 86,6 | **alheio mais perto**; atribuição só pela linha de chamada |

`v3_origens-cruzando-a-meta`:

| Nome | Próprio | Alheio mais perto | Resultado |
|---|---|---|---|
| Busca paga | 15,8 | origem de Marketplace, 33,5 | próprio mais perto |
| Redes sociais | 16,0 | destino de Outbound, 95,0 | próprio mais perto |
| Conteúdo orgânico | 11,7 | origem de Busca paga, 18,2 | próprio mais perto |
| E-mail próprio | 10,5 | origem de Conteúdo, 53,6 | próprio mais perto |
| Eventos corporativos | 40,9 | origem de Webinar, 40,9 | empate; linha de chamada em `--text-muted` desde o próprio ponto |
| Webinar técnico | 115,3 | destino de Indicação, 40,4 | alheio mais perto; linha de chamada em `--text-muted` desde o próprio ponto |

O critério pedido na correção (`ownPointIsNearest`) vale para os nomes sem linha de chamada, e todos os sete da `v1` e os quatro da `v3` que ficam junto do ponto passam nos dois temas. Os nomes com linha de chamada se julgam pela linha: ela sai do próprio ponto, chega ao nome sem cruzar marca nem outro nome (ROT-11) e mede 3:1 (ACE-6). Na `v3` as duas linhas passam nas três condições; na `v1`, a única linha falha em duas.

## `v1_canais-entre-trimestres`: reprovada

O defeito de 2026-10-05 saiu: nenhum nome fica mais perto de ponto alheio sem linha de chamada. Como consequência, `Mídia programática institucional` foi para a fileira de reserva (`FALLBACK_ROW_Y`), e o dado fixo desenha agora pela primeira vez a linha de chamada. A observação de 2026-10-05 sobre essa linha ("ela liga nome a ponto e, pelo teste da ACE-6, carrega relação; o dado fixo não a desenha") passou a valer no preview.

**Bloqueante 1. Perguntas 32, 20 e 11; ACE-6 e papel de cor da 17.2.**
Evidência: a linha de chamada da fileira (Chart.tsx, linha 322) está em `--line-strong`, tracejada 2 2, com 1 px. Ela mede **1,79:1** no escuro (`rgb(51, 69, 106)` sobre `rgb(18, 28, 46)`) e **1,83:1** no claro (`rgb(180, 192, 214)` sobre branco), contra o piso de 3:1. Pelo teste da ACE-6 ela carrega a relação: tapada, a caixa do nome fica a 86,6 px do destino de Eventos corporativos e a 104,8 px do destino de Mídia, então o nome passa a ler como o de outro canal. Nos dois PNGs ela quase não se vê. É o único elemento que diz qual ponto é Mídia.
O que mudar: desenhar a linha de chamada num token que meça 3:1 nos dois temas, `--text-muted` (5,21:1 e 5,37:1), como as linhas de chamada da `v3` e da `v4` já fazem.

**Bloqueante 2. Perguntas 13 e 12; ROT-7 e ROT-11.**
Evidência: a mesma linha vai de (682,5; 136,1) a (567,3; 27) e atravessa o nome `Eventos corporativos` entre x 645 e 656, de 23 a 33 px depois do começo da palavra (na letra "n" de Eventos), sem halo e sem desvio. Quem segue a linha a partir do nome de Mídia passa primeiro pelo nome de outro canal. A ponta de cima termina em cima da tinta: o `x2` é o próprio `textX` do nome, e o `y2` é a linha central, então o traço toca o "M". Hoje a sobreposição é atenuada pelo contraste de 1,79:1. Com o bloqueante 1 corrigido, ela vira um traço visível cortando o texto.
O que mudar: a reserva da `v1` precisa recusar a linha que cruza nome já colocado, como a `v3` faz na linha 268 (`placedRects.some(... segmentHitsRect(arrow.target, nearest, placed, 2))`). Escolher na fileira um `x` em que o caminho do ponto até a caixa fique livre, ou levar a linha até a borda da caixa mais próxima do ponto (o ponto `nearest` da `v3`), com folga antes da tinta, em vez de levá-la ao começo do texto.

**Corrigir na mesma rodada, mesmo sem ser bloqueante por si. Pergunta 21; seções 12 e 13.**
Evidência: `npm run render` da `v1` mede o SVG sozinho **0,74%** diferente da página no escuro e **0,77%** no claro, acima dos 0,5% da pergunta 21 e abaixo dos 2% em que o render reprova. O `diff.png` mostra a divergência começando no caractere seguinte à sigla `CPL`, no subtítulo e na linha de leitura. É a causa que o README registrou em 2026-09-28 para a `v2` e a `v4`, que foram a 0,00% quando passaram a escrever "custo por lead" por extenso.
O que mudar: escrever "custo por lead" por extenso na linha de leitura e na frase acessível, e no `useCase` do `meta.json` se o subtítulo também tiver de sair da faixa de aviso. A frase acessível já tem 236 caracteres: confira se ela continua abaixo de 250.

Conferido e aprovado na `v1`: setas em `--chart-1`, 9,50:1 no escuro e 6,00:1 no claro (ACE-6 das setas passa); domínio linear explícito e igual nos dois trimestres; grade nos dois sentidos sem eixo; ticks com unidade; taxa com volume na linha de leitura e na frase acessível; vazio com `role="status"`; frase de 236 caracteres, que começa pelo tipo e diz a conclusão; nenhum halo e nenhum nome começando em cima de ponto alheio (pergunta 31).

## `v3_origens-cruzando-a-meta`: aprovada

Os seis nomes de quem cruzou a meta estão identificados. Quatro ficam junto do próprio ponto, que é o mais próximo deles. `Eventos corporativos` e `Webinar técnico` são ligados ao próprio destino por linha de chamada em `--text-muted` (5,21:1 e 5,37:1). A linha de Eventos desce na vertical e termina no vão entre as duas palavras. A de Webinar passa a 13,6 px do anel de Parcerias e a cerca de 17 px das setas de Parcerias e Indicação, sem cruzar marca nem nome. As setas medem de 5,21:1 a 7,36:1 nos dois temas. O render ficou abaixo de 0,5% nos dois temas.

## Registro

```
Versão: 09_dispersao-e-bolhas/06_antes-e-depois-com-setas/v1_canais-entre-trimestres
Data: 2026-10-15
Resultado: reprovada
Não: 11, 12, 13, 20, 32 (e 21, não bloqueante pelo peso do render)
Correções:
  32. ACE-6: linha de chamada da fileira de reserva em --text-muted, não em --line-strong.
  13. ROT-7 e ROT-11: linha de chamada que não atravessa outro nome e não toca a tinta do próprio.
  21. Seções 12 e 13: custo por lead por extenso, para o SVG sozinho voltar a até 0,5%.
Não se aplica: 4, 6, 18, 26, 27, 28, 29, 30
```
