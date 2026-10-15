# Parecer de revisão: 16_distribuicao/02_box-plot

Data: 2026-10-15. Revisor independente. Julgadas as quatro versões: `v1` por `revisao_desatualizada`
(o `Chart.tsx` mudou depois do aceite de 2026-09-28, e o que vale é o arquivo de hoje contra o
contrato de hoje, que inclui a EST-1b), `v2`, `v3` e `v4` por `sem_revisao`. PNGs de 2026-10-02,
mais novos que todo `Chart.tsx` (2026-09-28); não foi preciso renderizar.

`npm run check -- 16_distribuicao/02_box-plot` com tipos: 0 com erro, 6 avisos. Quatro são a
`AGREGACAO-ZERO` da `v1` (linhas 79, 80, 155 e 159, fila de dívida); dois são a `ESPESSURA-MARCA` da
`v2` e da `v4`, que mede o traço de 2 px da mediana e não a caixa (esperado, README). A guarda de
dívida orienta e não reprova, mas o ramo que ela aponta é julgado aqui, como em
`14_tabelas-visuais/08` e `16_distribuicao/03` (pela pergunta 8 e pela 16).

Números conferidos recalculando do `data.ts` com a mesma interpolação linear: `v1` (medianas de 7 a 33
minutos, 87 de 297 acima do SLA, 19 além da cerca, LD 4927 com 188), `v2` (47 de 150 acima do prazo,
Larissa M. com mediana de 35,5 h entre os dois grupos), `v3` (1.900 casos do gerador, 516 acima de 30
dias, 32 além da cerca no dado mais os 2 da constante) e `v4` (medianas, entalhes e larguras).

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_primeiro-contato-por-sdr` | reprovada | 1 |
| `v2_pontos-sobre-a-caixa-e-prazo` | reprovada | 1 |
| `v3_dias-parados-por-etapa` | reprovada | 2 |
| `v4_entalhe-largura-e-grupo-minusculo` | reprovada | 1 |

## Resumo para o corretor

* `v1`: o ramo de ausência desenha e escreve zero, e não há estado vazio. Perguntas 8 e 16.
* `v2`: não há estado vazio. Pergunta 16.
* `v3`, bloqueante 1: o marcador de borda vem de uma constante fora da prop `data`, e os casos que ele
  desenha não entram no `n`, nas caixas nem na taxa. Perguntas 1, 14 e 22.
* `v3`, bloqueante 2: não há estado vazio. Pergunta 16.
* `v4`: os dois casos além da cerca não são desenhados. Perguntas 1 e 3.

O estado vazio das três primeiras é a mesma mudança: copiar o bloco da `v4`, `Chart.tsx`, linhas 366 a
379 (raiz `flex h-full w-full min-w-0`, `role="status"`, `Filter` de 16 px, frase de 12 px em
`--text-muted`), sob a condição `rows.length === 0 || total === 0`, antes do `return` principal.

As observações não bloqueantes estão no README do modelo, seção final, parágrafo de 2026-10-15.

## v1_primeiro-contato-por-sdr: reprovada

```
Versão: 16_distribuicao/02_box-plot/v1_primeiro-contato-por-sdr
Data: 2026-10-15
Resultado: reprovada
Não: 8, 16
Correções:
  8. EST-1b, EST-2: quantile com number | null, caixa nula sem desenho, taxa por formatRateWithVolume.
  16. EST-1: bloco role="status" da v4 no lugar do gráfico quando não há lead.
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 32
```

### Bloqueante. Perguntas 8 e 16; EST-1b, EST-2, EST-1; seção 14.1 (ausência exibida como zero)

**Evidência no código** (o dado padrão não chega a estes ramos, e é para isso que a EST-1b existe):

* `Chart.tsx:79-80`: `quantile` declara `number` e devolve `0` para lista vazia. Uma fila com
  `contacts: []` sai com q1, mediana e q3 em 0; a ordenação da linha 122 a põe em primeiro lugar, como
  a fila mais rápida; o `shape` desenha uma caixa de 2 px (`MIN_BOX_W`) colada no zero do eixo; e a
  frase acessível diz "A mediana vai de 0 minutos em <fila>". É exatamente o que a `data.ts` desta
  versão diz querer evitar com `WITHOUT_CONTACT`: lead sem contato contado como zero premia a fila
  mais abandonada.
* `Chart.tsx:155` e `:159`: interquartil zero vira escala `0` e posição `0`, em vez de retorno
  antecipado.
* `Chart.tsx:187` e `:288`: `formatPercent(total === 0 ? 0 : above / total, 1)`. Sem lead nenhum, a
  frase e o rodapé escrevem "0,0% acima do SLA". Percentual sem base é ausência.
* Não há ramo `role="status"`. Com `data` vazio o componente desenha os dois eixos, a linha do SLA e o
  rodapé com "n 0 leads", "0 leads além da cerca" e "0,0% acima do SLA de 30 min", e a frase acessível
  cai em "Box plot sem nenhuma fila para medir." (37 caracteres, abaixo do piso da ACE-1).

**Por que bloqueia.** A 14.1 põe "ausência exibida como zero" entre as regras que bloqueiam sempre, e a
pergunta 16 pede o bloco de vazio. O aceite de 2026-09-28 deixou isso como ressalva de dívida; o
critério desde então reprovou o mesmo desenho em `16_distribuicao/03` (v1, 2026-10-05),
`13_progresso-meta-e-gauge/03` e `14_tabelas-visuais/08` (2026-10-14 e 2026-10-15). As três irmãs
deste modelo já trazem a saída, então o conserto é cópia, não projeto.

**O que mudar.**

1. Trocar `quantile` e `summarize` pelo par `quantile` e `five` da `v2` (`Chart.tsx`, linhas 102 a
   131), com `box: BoxFive | null` na linha. A ordenação manda a fila sem caixa para o fim (`v2`,
   linhas 257 a 262), e a frase usa só as filas medidas.
2. No `renderBox`, `row.box === null` devolve `<g />`, e o interquartil zero sai por retorno
   antecipado, como na `v2` (linhas 292 a 307), sem escala valendo zero.
3. Nas linhas 187 e 288, `formatRateWithVolume(above, total)`. Isso escreve a ausência pelo nome
   quando não há base e, de quebra, põe o volume junto da taxa ("29,3% (87 de 297)"), que hoje falta
   (NUM-1, DAD-1).
4. O bloco de vazio da `v4`, com uma frase que diga que o recorte não tem lead com primeiro contato
   medido.
5. Depois, tirar a chave `AGREGACAO-ZERO` desta versão da fila de dívida em
   `_render/scripts/lib/divida-guardas.json` e a pendência correspondente do README.

Critério de aceite: o preview padrão não muda (nenhuma fila vazia no dado), o `check` sai sem a
`AGREGACAO-ZERO`, e um render de bancada com uma fila de `contacts: []` mostra a fila no eixo com
"n 0", sem caixa, no fim da ordem e fora da frase. Não gravar o `data.ts` de bancada.

**O que não mexer**, porque foi conferido e está certo: a ordem por mediana declarada no rodapé
(GEO-12), o `n` no tique de cada fila, o código do caso mais distante no rodapé (DAD-10 resolvido em
2026-09-28) e o canvas de 640 por 460.

## v2_pontos-sobre-a-caixa-e-prazo: reprovada

```
Versão: 16_distribuicao/02_box-plot/v2_pontos-sobre-a-caixa-e-prazo
Data: 2026-10-15
Resultado: reprovada
Não: 16
Correções:
  16. EST-1: bloco role="status" da v4 no lugar do gráfico quando não há lead.
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 32
```

### Bloqueante. Pergunta 16; EST-1

**Evidência.** `Chart.tsx` não tem nenhum ramo `role="status"`. Com `data` vazio, `rows` fica vazio, a
`PointCloud` devolve `null` e o componente segue até o `ComposedChart`: desenha a grade de 0 a 120 h
com os cinco tiques, a linha tracejada com "prazo 48 h" e o rodapé inteiro ("horas até a agenda, n 0
leads", as duas amostras de forma, "63 leads sem agenda ficaram fora"). A frase acessível cai em "Box
plot das horas até a agenda sem nenhuma fila com caso medido para resumir." (78 caracteres, abaixo do
piso de 100 da ACE-1). O README do modelo registra que só a `v4` traz o vazio pronto.

**Por que bloqueia.** Mesmo critério da `v1` e de `16_distribuicao/03` (v1): eixo e grade de uma
distribuição que não existe leem como medição, e a pergunta 16 pede que o vazio substitua o gráfico
inteiro.

**O que mudar.** O bloco da `v4` antes do `return` principal, sob `rows.length === 0 || total === 0`,
com uma frase de 12 px dizendo que o recorte não tem lead com agenda medida. O caso de fila presente e
vazia continua como está: fila no eixo com "n 0" e sem caixa, que é o desenho certo.

**O que não mexer**, porque foi medido e está certo: caixa vazada com bigode em dois trechos; pontos
opacos com contorno de 0,5 px na cor da superfície no lugar da opacidade de 0,45 (desvio declarado no
`meta.json`, a ACE-5 vence); losango em `--negative` para o caso fora do prazo, forma e cor; jitter por
FNV com amplitude tirada da banda (nenhuma nuvem invade a vizinha nos dois PNGs); prazo com
`ifOverflow="extendDomain"` e rótulo na margem direita; taxa com volume, "31,3% (47 de 150)"; tique com
unidade; grade só horizontal com `axisLine={false}` depois do espalhamento.

## v3_dias-parados-por-etapa: reprovada

```
Versão: 16_distribuicao/02_box-plot/v3_dias-parados-por-etapa
Data: 2026-10-15
Resultado: reprovada
Não: 1, 14, 16, 22
Correções:
  1, 14 e 22. Seção 14.1 e seções 2 e 5: o caso além do teto entra no dado das etapas e o marcador de
  borda é derivado dele, sem a constante BEYOND_DOMAIN.
  16. EST-1: bloco role="status" da v4 no lugar do gráfico quando não há oportunidade.
Não se aplica: 6, 18, 26, 27, 28, 29, 30
```

### Bloqueante 1. Perguntas 1, 14 e 22; seção 14.1 (versão que não demonstra o que o catálogo diz); seções 2 e 5

**Evidência.**

* `Chart.tsx:276-280`: `edgeCases` sai de `BEYOND_DOMAIN`, importada direto do `data.ts` (linha 21),
  e não da prop `data`. A única ligação com o dado recebido é o `stageId` casar com o `id` de uma
  etapa.
* `Chart.tsx:274`: `plotted = inFence.filter((point) => point.days <= domainMax)`. Um caso dentro de
  `data` acima de 180 dias sai do `Scatter` e não vira marcador: some do desenho, embora entre na conta
  "além da cerca" (linha 284) e possa ser o nomeado "a mais distante" do rodapé, sem marca na tela.
* No preview, os dois casos marcados não pertencem às etapas. Recalculado do gerador: as oito etapas
  somam 1.900, o máximo de Aprovação interna no dado é 170 dias e o de Negociação é 130. Então OP 10482
  (412 dias) e OP 10731 (206) estão fora do "n 135" e do "n 170", fora das caixas e fora dos "516 de
  1.900" que passam de 30 dias, mas dentro dos "34 além da cerca" (32 do dado mais os 2). O mesmo
  rodapé conta 1.900 numa linha e 1.902 na outra, e a taxa deixa de fora justamente os dois casos mais
  parados da tela.
* Colado no Farol com `data` real, as etapas `aprovacao-interna` e `negociacao` receberiam as setas de
  OP 10482 e OP 10731, que são fictícias, e o caso real acima do teto não teria seta.

**Por que bloqueia.** O catálogo diz que esta versão demonstra "Outlier de 412 dias fora do domínio
vira marcador na borda com o valor escrito", e o componente não transforma outlier nenhum em marcador:
desenha uma lista fixa. É a mesma classe de defeito da DAD-10 (a peça promete um comportamento que o
dado não aciona), com o agravante de pôr dado fictício sobre dado real e de deixar os números
impressos sem somar as marcas desenhadas. A pergunta 22 pede que o desenho dependa da prop `data`, com
o `data.ts` só como default.

**O que mudar.**

1. No `data.ts`, os dois casos entram em `opportunities` das suas etapas, e `BEYOND_DOMAIN` deixa de
   ser exportada. Duas saídas, à escolha do corretor: manter os geradores e passar a 1.902
   oportunidades (o texto do catálogo diz 1.900 e o `meta.json` acompanha), ou baixar os geradores de
   Aprovação interna e de Negociação para 134 e 169 e manter 1.900. Simulado aqui, a segunda muda o
   dado, não só a soma: a mediana de Aprovação interna vai de 46 para 49 dias, os parados ficam em 517
   de 1.900 (27,2%) e os casos além da cerca em 33. Os números citados no README, no `notes` e no
   comentário do topo seguem o dado novo, qualquer que seja a saída.
2. No `Chart.tsx`, `edgeCases` sai do próprio dado: toda oportunidade com `days > domainMax`, com o
   nome da etapa. O `Scatter` continua com os casos além da cerca até o teto. Sem import de
   `BEYOND_DOMAIN`.
3. O bigode que passar do teto para na borda do eixo, para o ramo novo não desenhar fora da área.

Critério de aceite: o `n` do rodapé é a soma dos `n` das etapas; a contagem "além da cerca" e a taxa
de parados saem da mesma população, e a taxa conta os dois casos de borda; nos dois PNGs as duas setas
seguem com código e valor; e um render de bancada que acrescente um caso de 250 dias em Contrato
desenha a seta dele sem nenhuma mudança no componente. Não gravar o `data.ts` de bancada.

### Bloqueante 2. Pergunta 16; EST-1

**Evidência.** Nenhum ramo `role="status"`. Com `data` vazio o componente desenha a grade de 0 a 180
dias, os tiques, a linha "parada a partir de 30 dias" e o rodapé com "n 0 oportunidades abertas", "0
oportunidades além da cerca" e "78 sem data de etapa ficaram fora". A frase acessível cai em 75
caracteres.

**O que mudar.** O bloco da `v4` antes do `return` principal, sob `rows.length === 0 || total === 0`,
com uma frase dizendo que o recorte não tem oportunidade aberta com data de etapa.

**O que não mexer**, porque foi conferido e está certo: ordem de funil declarada no rodapé; grade só
vertical (`horizontal={false}`, a orientação certa para o box horizontal); limiar com `extendDomain` e
rótulo acima da área; rótulo da seta subindo 13 px com linha de chamada em `--text-muted` (5,21:1 e
5,37:1); clique devolvendo o código só quando há `onOutlierSelect`; gerador com semente fixa.

## v4_entalhe-largura-e-grupo-minusculo: reprovada

```
Versão: 16_distribuicao/02_box-plot/v4_entalhe-largura-e-grupo-minusculo
Data: 2026-10-15
Resultado: reprovada
Não: 1, 3
Correções:
  1 e 3. Seção 14.1 (encoding), Anatomia 4 e 5: desenhar como ponto todo valor fora das cercas.
Não se aplica: 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

### Bloqueante. Perguntas 1 e 3; seção 14.1 (encoding); Anatomia 4 e 5 do README

**Evidência.** O componente não tem `Scatter` nem nenhum outro desenho para os casos além da cerca:
`GroupAnnotations` (linhas 205 a 221) desenha pontos só no grupo sem caixa. O `preview.svg` tem
exatamente quatro `<circle>`, os de Programática. Recalculado do `data.ts`:

* Busca paga: q1 R$ 165,50, q3 R$ 228,25, cerca de cima em R$ 322,38. O bigode para em R$ 322 e a
  campanha CP 3147, de R$ 341, não aparece.
* Social pago: q1 R$ 185, q3 R$ 300, cerca de cima em R$ 472,50. O bigode para em R$ 469 e a campanha
  CP 3340, de R$ 512, não aparece. É o maior CPL do recorte depois do de Vídeo.

O rodapé diz "bigode até a cerca de 1,5 vez" e o `n` de cada grupo conta as duas campanhas (48 e 41),
mas nada na tela mostra que existe valor além do bigode. O leitor lê que o pior CPL de Social pago é
R$ 469.

**Por que bloqueia.** Num box plot a tampa do bigode afirma que nada passa dela, a não ser o que vem
desenhado como ponto; o README do modelo põe isso na anatomia (item 4, bigode até a cerca "e não até o
mínimo e o máximo absolutos quando há outlier"; item 5, outliers como pontos). Sem os pontos, a forma
afirma uma cauda que o dado não tem (pergunta 3), e a versão deixa de ser o box plot que a família
define (pergunta 1).

**O que mudar.** Em `GroupAnnotations`, para todo grupo com caixa, desenhar como ponto cada valor
abaixo de `q1 − 1,5·IQR` ou acima de `q3 + 1,5·IQR`, no centro da banda, com o mesmo estilo dos pontos
de Programática (`POINT_FILL` opaco, raio de 2,6 px, contorno de 0,5 px na cor da superfície). O
`summarize` já tem `values` e `box`, então a conta cabe ali. No rodapé, uma linha com a amostra do
ponto e quantas campanhas ficaram além da cerca, calculado do dado. Critério de aceite nos dois PNGs:
um ponto em R$ 341 acima da tampa de Busca paga e um em R$ 512 acima da tampa de Social pago, sem
tocar nas tampas.

**O que não mexer**, porque foi conferido e está certo: entalhe de 1,58 vez o interquartil sobre a
raiz de `n`, cortado nos quartis e tracejado só em Nativa (entalhe de R$ 42,13 contra R$ 40 de caixa);
cortar não muda nenhuma conclusão de cruzamento com os outros grupos; Programática sem caixa e com os
quatro pontos; `nMax` sobre todos os grupos; régua da legenda calculada do dado; estado vazio da EST-1;
tique por `formatCurrencyAxis` com `YAxis` de 60 px.

## Defeitos de régua e de ferramenta notados

* A `AGREGACAO-ZERO` aponta as linhas 79, 80, 155 e 159 da `v1` e não aponta as linhas 187 e 288, que
  têm `formatPercent(total === 0 ? 0 : above / total, 1)`: o zero de taxa sem base em forma de ternário
  com a igualdade na frente, dentro de argumento de formatador, escapa da guarda e chega ao texto.
* Nenhuma guarda pega componente que desenha marca a partir de constante importada do `data.ts` em vez
  da prop `data` (o caso da `v3`). Uma checagem barata: import nomeado do `./data` além de `data`, tipos
  e constantes de régua usado dentro de `.map` ou `.flatMap` de JSX.

---

# Segunda passada, 2026-10-15, depois da rodada de correção

Revisor independente. As quatro versões chegaram por `revisao_desatualizada`, e o que vale é o
arquivo de hoje. `npm run check -- 16_distribuicao/02_box-plot` com tipos: 0 com erro, 3 avisos (a
fila de dívida da `v1`, que pede para apagar a chave `AGREGACAO-ZERO`, e a `ESPESSURA-MARCA` da
`v2` e da `v4`, que mede o traço de 2 px da mediana). PNGs das 08:46, mais novos que todo
`Chart.tsx`. Os números da `v3` foram recalculados do gerador com a mesma interpolação linear.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_primeiro-contato-por-sdr` | aprovada | 0 |
| `v2_pontos-sobre-a-caixa-e-prazo` | aprovada | 0 |
| `v3_dias-parados-por-etapa` | reprovada | 1 |
| `v4_entalhe-largura-e-grupo-minusculo` | aprovada | 0 |

O que a primeira passada pediu e chegou: na `v1`, `quantile` com `number | null`, fila sem caixa no
fim da ordem, retorno antecipado no interquartil zero, `formatRateWithVolume` nas duas linhas e o
bloco de vazio; na `v2` e na `v3`, o bloco de vazio; na `v3`, os dois casos dentro de
`opportunities` (n 1.900 = soma das etapas, 517 de 1.900 acima de 30 dias, 33 além da cerca, sem
import de `BEYOND_DOMAIN`); na `v4`, os pontos em R$ 341 e R$ 512 e a contagem no rodapé.

## v3_dias-parados-por-etapa: reprovada

```
Versão: 16_distribuicao/02_box-plot/v3_dias-parados-por-etapa
Data: 2026-10-15
Resultado: reprovada
Não: 14, 15
Correções:
  14 e 15. Seção 14.1 (sobreposição, número impresso falso), Anatomia 10 do README: todo caso acima
  do teto vira marcador, um marcador por etapa, e o bigode para na borda.
Não se aplica: 6, 18, 26, 27, 28, 29, 30
```

### Bloqueante. Perguntas 14 e 15; seção 14.1; Anatomia 10 e "Como colar", passo 9, do README

A correção derivou o marcador do dado, mas só de parte dele, e o desenho do marcador supõe um caso por
etapa. O preview padrão está certo; o defeito mora no ramo que esta versão existe para demonstrar, e o
próprio dado padrão já fica a um caso de distância dele.

**Evidência no código.**

* `Chart.tsx:268` a `:273`: `edgeCases` filtra `inFence`, que apesar do nome são os casos **além da
  cerca** (`outliersOf`, linhas 155 a 163). Caso acima de `domainMax` e dentro da cerca não vira seta,
  e também não vira ponto (`plotted` só aceita `days <= domainMax`).
* `Chart.tsx:330` e `:332`: o bigode vai até `at(box.whiskerHigh)` sem limite em `domainMax`, e o
  bigode não entra no domínio do eixo (o `dataKey` do `Bar` é só `[q1, q3]`). Não há `clipPath` no
  `Bar` sem `allowDataOverflow`.
* `Chart.tsx:194` a `:229`: a seta e o rótulo de cada caso saem de `yScale(item.stageName)` e de
  constantes. Todo caso da mesma etapa cai na **mesma** coordenada.
* `Chart.tsx:492`: "N casos passam do teto de 180 dias" conta `edgeCases`, não os casos acima do teto.

**Por que o ramo é alcançável.** Recalculado do gerador: Aprovação interna tem q1 20,5, q3 94,5 e
cerca de cima em **205,5 dias**, acima do teto de 180. Ali, um caso entre 181 e 205 dias:

1. não ganha seta nem valor escrito;
2. puxa o bigode até ele, a 2,14 px por dia: 190 dias passam 21 px da borda da área, mais que os
   16 px da margem direita, então a tampa sai do SVG e o bigode corre por baixo da seta da OP 10482;
3. deixa o rodapé dizendo "2 casos passam do teto" quando são 3.

E com dois casos acima do teto na mesma etapa (412 e 250 em Aprovação interna, por exemplo, os dois
além da cerca), as duas setas e os dois rótulos, alinhados pela direita no mesmo ponto, se sobrepõem
e nenhum dos dois códigos se lê. Com dado real, cauda longa numa etapa lenta é a regra.

**Por que bloqueia.** A Anatomia 10 do README promete "caso além do teto do eixo desenhado como seta na
borda, com o código e o valor escritos", e o passo 9 de "Como colar" diz que "o marcador de borda é
derivado dos dias acima de `domainMax`; no Farol nada além do `data` precisa ser passado". No ramo
acima o desenho tem texto sobreposto (pergunta 15), bigode fora da área (pergunta 15) e uma contagem
impressa que não bate com o dado (pergunta 14). É o resto do bloqueante 1 da primeira passada, cujo
"O que mudar" já pedia "toda oportunidade com `days > domainMax`" (item 2) e "o bigode que passar do
teto para na borda do eixo" (item 3); o item 3 não foi feito e o item 2 entrou com o filtro da cerca.

**O que mudar.**

1. `edgeCases` sai de **toda** oportunidade com `days > domainMax`, por etapa, sem passar pela cerca:
   `data.flatMap((stage) => stage.opportunities.filter((item) => item.days > domainMax) ...)`.
2. **Um marcador por etapa**, não um por caso: agrupar `edgeCases` pela etapa, desenhar uma seta e um
   rótulo com o caso mais distante, e com mais de um caso acrescentar a contagem no mesmo rótulo
   (por exemplo "OP 10482 · 412 dias e mais 1 acima de 180"), conferindo a largura contra a banda.
   O clique continua devolvendo o código do caso mais distante.
3. No `renderBox`, o bigode de cima vai até `Math.min(box.whiskerHigh, domainMax)`, e sem tampa quando
   foi limitado, porque a seta da etapa já marca a borda.
4. O rodapé conta os casos acima do teto pela lista do item 1. A contagem "além da cerca" continua como
   está.
5. Na mesma mão, os números do texto seguem o dado novo: README ("Versões"), `notes` do `meta.json`
   (46 dias e 34 casos viraram 49 e 33) e o comentário do topo do `Chart.tsx` ("medianas de 6 a 46
   dias", "trinta e dois códigos").

**Critério de aceite.** O preview padrão não muda (as duas setas, OP 10731 com 206 dias e OP 10482 com
412, "2 casos passam do teto"). Em bancada, sem gravar o `data.ts`: (a) um caso de 190 dias em
Aprovação interna ganha seta ou entra na contagem da seta da etapa, o bigode para em 180 e o rodapé diz
3 casos; (b) um caso de 250 dias em Aprovação interna, ao lado do de 412, deixa um rótulo só, legível,
com o 412 nomeado e a contagem.

**O que não mexer**, porque foi conferido e está certo: os dois casos dentro de `opportunities` com o
total em 1.900; a taxa de parados e a contagem além da cerca sobre a mesma população; o estado vazio;
a ordem de funil; a grade só vertical; o limiar com `extendDomain`; a linha de chamada em
`--text-muted`; o clique condicionado a `onOutlierSelect`.

## v1, v2 e v4: aprovadas

Sem bloqueante. As observações novas estão no README do modelo, parágrafo da segunda passada.

## Defeitos de régua e de ferramenta notados na segunda passada

* Nenhuma guarda mede marcador ou rótulo desenhado na mesma coordenada para mais de um item do dado,
  porque o preview padrão tem um caso por etapa. O defeito só existe no ramo, como o da `EST-1b`.
