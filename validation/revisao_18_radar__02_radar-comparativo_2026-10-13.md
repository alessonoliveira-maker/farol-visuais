# Parecer de revisão: 18_radar/02_radar-comparativo

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 06:57, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes em uso.

Resultado: `v1` e `v4` aprovadas; `v2` e `v3` reprovadas, com um bloqueante cada uma. As observações não bloqueantes estão no README do modelo.

## Peso dos bloqueantes

* **`v2`, os dois números da escala lado a lado e o 75 colado no anel de 100.** Perguntas 13 e 15; seção 14.1, domínio de eixo; EIX-4 e ROT-9; armadilha GEO-15. Não é acabamento: o número da escala existe só para dizer quanto vale cada anel, e aqui o `75` fica a 0,8 px do anel de 100 e a 3,8 px do anel dele, com o halo apagando o anel de 100 entre os dois números, que passam a ler `100 75` como um par. É o defeito que reprovou a `v1` e a `v4` de `18_radar/01_radar-simples` na rodada de hoje, com outra causa.
* **`v3`, índice e eixo invertido sem declaração na tela.** Pergunta 14; NUM-6 e DAD-9; seção 14.1, unidade e sentido de eixo. Os seis eixos têm nome de métrica com unidade própria (receita, fechamentos, ticket, ciclo, win rate, retenção) e a tela escreve números soltos de 0 a 100, sem dizer que são índice contra a meta nem que o ciclo de venda está invertido. A normalização é um dos cinco pontos que o catálogo diz que a versão demonstra, e ela não chega a quem olha o cartão.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, com recorte ampliado das zonas de escala e dos cruzamentos de traço com área; a geometria de cada `preview.svg` (os vértices das dez séries caem exatamente no valor do `data.ts` dividido por 100 do raio externo, escala linear a partir do centro nas quatro); a caixa de cada texto no DOM vivo; o contraste da área composta, de cada traço contra o cartão e de cada traço contra a área que ele cruza, pela fórmula da WCAG sobre `tokens.css`, nos dois temas; a diferença entre a página e o `preview.svg`, de 0,03% no máximo, na `v1`.
* **Sondado em navegador**, com o empacotador do render e sem gravar nada no catálogo: a dica das quatro versões nos dois temas, a vista em barras da `v4`, o foco pela legenda da `v4` nas duas vistas e o `aria-pressed` do botão.
* **Não medido pela ferramenta, e medido à mão:** OPACIDADE-MARCA na `v2` e na `v3`, que o `check` informa como `sem_opacidade_em_marca` embora as duas tenham `fillOpacity` de 0,66 (a área mede 3,58:1 e 3,05:1 na `v2`, 4,85:1 e 3,01:1 na `v3`, escuro e claro); ESPESSURA-MARCA na vista em barras da `v4`, que não é o estado do preview (barra de 15 px).
* **Não renderizado:** o estado vazio das quatro. O que se diz dele é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. As posições citadas nelas são conta sobre o DOM medido, não render.

## `v2_plataforma-a-contra-plataforma-b`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 13 e 15; seção 14.1 (domínio de eixo), EIX-4, ROT-9; armadilha GEO-15

**Evidência.** O palco do gráfico tem 402 por 225 px, centro em x = 406 da página e raio externo de 73,78 px, então os anéis ficam a 18,4 px um do outro. O `scaleSpot` escolhe a bissetriz entre Taxa de resposta e Taxa de fit, que é a horizontal à esquerda do centro, e os dois níveis que passam do corte (75 e 100) saem na mesma linha, cada um ancorado pelo fim a 4 px do anel dele. Medido no DOM vivo, igual nos dois temas:

| Número | Caixa em X | Anel que ele nomeia | Anel vizinho |
|---|---|---|---|
| `75` | 333,02 a 346,84 | anel de 75 em 350,66, a 3,8 px | anel de 100 em 332,22, a 0,8 px |
| `100` | 307,75 a 328,39 | anel de 100 em 332,22, a 3,8 px | não há |

Entre o `100` e o `75` sobram 4,6 px, 0,6 px acima do limiar de 4 px da COLISAO-TEXTO, e por isso o `check` não avisa. No recorte ampliado dos dois PNGs o halo de 2 px do `75` apaga o anel de 100 por cerca de 10 px de altura, exatamente no trecho que separaria os dois números: o que se vê é `100 75` numa linha só, sem nada no meio. O `75` fica mais de quatro vezes mais perto do anel de 100 do que do anel que ele nomeia, e quem lê a escala pode concluir que o anel de fora vale 75.

**Por que bloqueia.** Domínio de eixo está na lista da 14.1 que bloqueia sempre, e a consequência é medida no preview (leitura apertada e grade partida pelo halo), não uma constante fora do valor. O sintoma é o da GEO-15: dois números na mesma linha que leem como par, sem aviso da ferramenta. O precedente é de hoje: em `18_radar/01_radar-simples` a `v1` caiu com o `50` a 0,8 px do anel de 75 e voltou aprovada com cada número a 3,8 px do anel dele e a 11,5 px do seguinte.

**O que mudar.** Cada número da escala a 4 px por fora do anel que nomeia e a pelo menos essa distância de qualquer outro anel, e dois números de escala nunca na mesma linha a menos de um anel um do outro. A conta que falta no `renderScaleTick` é a do espaço: um número de dois dígitos em 11 px ocupa 13,8 px, com os dois recuos de 4 px pede 21,8 px entre anéis, e a bissetriz horizontal deste palco tem 18,4. Saídas possíveis, nenhuma testada:

1. Na bissetriz horizontal, quando o passo entre anéis for menor que a largura do número mais dois recuos, escrever só o nível de fora (`100`). Quatro anéis de 25 em 25 com o último nomeado fecham a leitura, e o texto da coluna já diz "Índice de 0 a 100".
2. Trocar de bissetriz quando a escolhida for horizontal e o passo não couber. Neste dado a bissetriz de 120° empata em alcance com a da esquerda (45,8 nas duas), mas ali o `100` cairia na linha do nome "Taxa de fit", a cerca de 11 px dele, e o `75` na linha do `45 (40)`, que é a GEO-15 de novo; a escolha precisa olhar também o rótulo do eixo vizinho.
3. Mais raio: com passo de 22 px ou mais (raio externo de 88 px) os dois números cabem. No `card`, com 225 px de corpo e duas linhas de rótulo no topo e na base, isso não fecha, então pediria canvas por número (GEO-1).

Depois da troca, conferir no recorte ampliado dos dois temas que o halo não parte nenhum anel entre dois números.

### Na mesma passada, sem peso de bloqueio

As observações da `v2` no README cabem na mesma edição: o revestimento de `--surface-raised` sob o tracejado da Plataforma A (TOK-10; 2,65:1 no escuro e 1,97:1 no claro contra a área da B), a medida de marca contra marca na nota do `meta.json` (TOK-9), o nome de cada número na dica (`38 38,0% (475 de 1.250)` hoje só se separa pela cor) e a anotação da maior lacuna dentro dos 50 caracteres da ANO-2.

### Conferido e em ordem

Índice de 0 a 100 com a regra de inversão escrita na tela e calculada do dado (`costList`); CPL e CPL qualificado conferem com o `data.ts` (100 menos custo sobre teto: 48 e 64, 38 e 57) e as quatro taxas com contagem sobre leads; cor pelo slot do dado (1 e 3, na ordem da COR-8); maior lacuna correta (taxa de agenda, 38 contra 64); área da B a 0,66 mede 3,58:1 no escuro e 3,05:1 no claro; dica com índice, R$ inteiro nos custos e taxa com volume (`72,0% (900 de 1.250)`), aberta por sonda nos dois temas; frase acessível de 190 caracteres; rótulos de eixo sem corte nem colisão; diferença de 0,00% entre página e preview.

## `v3_cenario-escolhido-e-alternativas-em-contorno`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 14; NUM-6 e DAD-9; seção 14.1 (unidade e sentido de eixo)

**Evidência.** Os textos visíveis do cartão são: a linha de leitura ("Base mais perto do pessimista em 5 de 6 alavancas. Entre pessimista e base, a menor folga é ticket médio, 2 pontos."), a legenda ("Pessimista", "Base, o escolhido", "Otimista", "Base e, entre parênteses, a faixa dos dois"), os seis rótulos de eixo (`Receita 62 (48 a 78)`, `Fechamentos 66 (52 a 81)`, `Ticket médio 60 (58 a 70)`, `Ciclo de venda 58 (45 a 74)`, `Win rate 59 (50 a 72)`, `Retenção 80 (61 a 85)`) e os números 75 e 100 da escala. A palavra "índice" não aparece em nenhum deles; só existe no `aria-label` ("índice de 0 a 100"). O comentário do `data.ts` diz que cada número é um índice de 0 a 100 contra a meta da alavanca e que "no ciclo de venda o índice é invertido: ciclo mais curto dá índice maior". Nenhuma das duas coisas está na tela, e a inversão não está nem na frase acessível.

**Por que bloqueia.** Unidade e sentido de eixo estão na lista da 14.1 que bloqueia sempre, e aqui os nomes dos eixos são de métricas que o leitor conhece com outra unidade. `Win rate 59` e `Retenção 80` leem como 59% e 80%. `Ciclo de venda 58 (45 a 74)` lê como dias, e nessa leitura o cenário otimista teria o ciclo mais longo e o pessimista o mais curto, o contrário do que o desenho quer dizer. `Receita 62` não lê como nada. O único apoio é o "2 pontos" da linha de leitura. O catálogo e o `meta.json` listam "eixos de receita, fechamentos, ticket, ciclo, win rate e retenção normalizados" entre os cinco pontos que a versão demonstra, e a decisão que sustenta a versão não chega a quem olha o cartão. A irmã `v2` mostra o padrão do modelo: "Índice de 0 a 100, maior é melhor. Em CPL e CPL qualificado o custo menor dá o índice maior." O acervo trata número sem unidade como observação quando a unidade está escrita em outro ponto do cartão (`20_cronograma-e-linha-do-tempo/07`) e como bloqueante quando não está (`09_dispersao-e-bolhas/03`); com eixo invertido calado, este é o segundo caso. Na `v1` e na `v4` a mesma falta da palavra "índice" ficou como observação, porque ali nenhum eixo é invertido e nenhum nome de eixo carrega outra unidade.

**O que mudar.** Dizer na tela, sem depender da dica, que os números são índice de 0 a 100 contra a meta de cada alavanca, que maior é melhor e que no ciclo de venda o ciclo menor dá o índice maior. O lugar natural é a nota que hoje fecha a legenda ("Base e, entre parênteses, a faixa dos dois") ou a linha de leitura. A lista dos eixos invertidos deve sair do dado, com um campo como o `kind` da `v2`, e não escrita à mão. Levar a inversão também à frase acessível, que hoje tem 199 caracteres e teto de 250. A legenda já ocupa duas linhas e a linha de leitura outras duas: se entrar linha nova, refazer a conta da GEO-1 no `quadrado` e conferir nos dois PNGs que os rótulos do topo e da base continuam inteiros.

### Na mesma passada, sem peso de bloqueio

As observações da `v3` no README cabem na mesma edição: o revestimento de `--surface-raised` sob o tracejado do pessimista (TOK-10; 1,33:1 no escuro e 2,06:1 no claro contra a área do base), a medida de marca contra marca na nota do `meta.json` (TOK-9) e o ponto do base por cima do ponto do pessimista no eixo de ticket médio, que é o eixo citado na linha de leitura.

### Conferido e em ordem

Base preenchido e alternativas com `fill="none"`, traço de 2 px e ponto; pessimista tracejado (6 4) e otimista pontilhado (1 4), distintos sem depender da cor; grade sem raios; slots 1, 3 e 6 vindos do dado; os três polígonos conferem com o `data.ts`; "5 de 6" e "ticket médio, 2 pontos" conferem; área a 0,66 mede 4,85:1 no escuro e 3,01:1 no claro; pessimista e otimista medem 6,47:1 e 7,39:1 contra o cartão no escuro, 6,18:1 e 5,39:1 no claro; escala na bissetriz de 60° abaixo da horizontal, com `75` e `100` em linhas diferentes e a 4 px do anel de cada um; dica na ordem de fora para dentro (otimista, base, pessimista), aberta por sonda nos dois temas; frase acessível de 199 caracteres; diferença de 0,00% entre página e preview.

## `v1_executivo-contra-media-do-time` e `v4_tres-trimestres-quase-identicos`: aprovadas

* **`v1`.** Domínio fixo de 0 a 100 e os dois polígonos conferem com o `data.ts`; "4 de 8" e "registro no CRM, +22 pontos" conferem; área a 0,66 mede 4,85:1 e 3,01:1; tracejado da média mede 5,21:1 e 5,37:1 contra o cartão; `75` e `100` em linhas diferentes, a 4 px do anel de cada um; dica com as duas séries e a diferença com sinal (`+22 pontos`, `−17 pontos` com o menos tipográfico), aberta por sonda nos dois temas; frase de 180 caracteres. A observação do tracejado dentro da área (1,07:1 no escuro, ΔE 1,2 em simulação de protanopia) é a mais pesada do modelo: não reprova pela isenção da ACE-3, porque o valor da média está escrito em cada eixo, mas vale entrar na mesma passada de correção, com o revestimento da TOK-10.
* **`v4`.** Os três contornos conferem com o `data.ts`; "4 pontos, em agendamento" e "2 de 6 eixos" conferem; traços a 9,50:1, 6,47:1 e 7,39:1 contra o cartão no escuro e 6,00:1, 6,18:1 e 5,39:1 no claro, com padrão de traço e raio de ponto por trimestre; foco pela legenda esmaece só a marca, nas duas vistas; botão com `aria-pressed` de `false` para `true`; vista em barras com origem no zero (4,14 px por ponto em todas as dezoito barras), barras de 15 px, valor na ponta e a mesma ordem de eixos; frase acessível que troca o tipo de gráfico com a vista (185 e 196 caracteres); dica que junta os trimestres coincidentes ("2026-T1 e 2026-T2 65"). O emaranhado do estado inicial é o caso que o catálogo manda demonstrar, e as três saídas (linha de leitura, foco e barras) funcionam.

## Registro

```
Versão: 18_radar/02_radar-comparativo/v1_executivo-contra-media-do-time
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29

Versão: 18_radar/02_radar-comparativo/v2_plataforma-a-contra-plataforma-b
Data: 2026-10-13
Resultado: reprovada
Não: 13, 15
Correções:
  13 e 15. EIX-4, ROT-9, GEO-15, seção 14.1: cada número da escala a 4 px por fora do anel dele e longe dos outros anéis, sem dois números de escala na mesma linha a menos de um anel um do outro.
Não se aplica: 6, 26, 27, 28, 29

Versão: 18_radar/02_radar-comparativo/v3_cenario-escolhido-e-alternativas-em-contorno
Data: 2026-10-13
Resultado: reprovada
Não: 14
Correções:
  14. NUM-6, DAD-9, seção 14.1: escrever na tela que os números são índice de 0 a 100 contra a meta, que maior é melhor e que o ciclo de venda está invertido, com a lista de eixos invertidos vinda do dado.
Não se aplica: 6, 26, 27, 28, 29

Versão: 18_radar/02_radar-comparativo/v4_tres-trimestres-quase-identicos
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29
```
