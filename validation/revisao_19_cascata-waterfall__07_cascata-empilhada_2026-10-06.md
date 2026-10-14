# Parecer de revisão: 19_cascata-waterfall/07_cascata-empilhada

Data: 2026-10-06. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 09:53, posterior ao `Chart.tsx` das quatro, das 09:52). `npm run check` com tipos: 0 com erro, 1 aviso (`CONTRASTE-MARCA` na `v2`).

Resultado: `v4` aprovada; `v1`, `v2` e `v3` reprovadas. São quatro bloqueantes distintos: dois comuns à `v1` e à `v2` (o separador que consome a fatia e a cor de polaridade pelo sinal), um próprio da `v2` (neutro sem número) e um próprio da `v3` (passo inteiro ancorado no zero). As observações não bloqueantes estão no README do modelo.

## Peso de cada bloqueante

* **`v3`, passo inteiro desenhado do zero.** Encoding: a marca de R$ 22 mil tem a altura de R$ 326 mil. Bloqueia sempre pela seção 14.1. É o mais grave dos quatro e o mais barato de corrigir.
* **`v1` e `v2`, cor de polaridade pelo sinal.** Papel de cor, bloqueia sempre pela 14.1. Tem precedente direto na família, citado abaixo.
* **`v1` e `v2`, separador que consome a fatia.** Constante de acabamento (`SEPARATOR = 1.5`) com consequência medida no preview: marca sem tinta e marca partida. Descrito pela consequência, não pelo número. Na `v1` a consequência atinge a pergunta do caso de uso.
* **`v2`, neutro em `--line-strong` sem número próprio.** Contraste e papel de cor, 14.1. O `check` avisa e não reprova; a razão de reprovar aqui está na seção da versão.

## Sobre precedente, para quem for conferir este parecer

* `19/03` `v3`, veredito de 2026-10-05: reprovada pela pergunta 11, COR-6, porque "a carteira aberta encolhe quando se ganha negócio, então o sinal não é polaridade". É o caso da `v1` e da `v2`, com o mesmo tipo de dado. Foi aprovada depois com faixa neutra e sinal no texto.
* `19/06` `v3`: pinta ganhas em `--positive` e perdidas em `--negative`, por papel declarado. É a outra saída aceita na família.
* `19/03` `v3` e `19/01` `v4`: diante de passos pequenos contra totais grandes, as duas declararam desvio do catálogo em vez de desenhar passo de 1 px. A primeira pôs o zero do eixo na carteira inicial, escrita na margem; a segunda ancorou a variação líquida. É a saída que proponho para o separador.
* `01/04` (item d e 17.2) e `17/01` (perguntas 11 e 20): `--line-strong` em marca sem valor escrito reprovou. `09/02` registrou caso parecido como observação, numa nuvem de pontos. Sigo a maioria e a letra da tabela 17.2.
* `19/01`, `19/02` e `19/03`: conector em `--line-strong` aceito como referência pela ACE-6. Mantido aqui, como observação.

## O que foi medido e o que não foi

* **Medido:** geometria pelas coordenadas do `preview.svg` (escala 1 nas quatro versões); tinta visível por varredura de coluna de pixels nos dois PNGs de cada versão, que têm 2 px de dispositivo por px; contraste do neutro pelo aviso do `check`.
* **Não testado:** nenhuma saída sugerida foi renderizada. As alturas citadas nas saídas são conta sobre a escala, não medida.

## `v1_carteira-do-mes-por-executivo`: reprovada

### Bloqueante 1. Perguntas 2, 15 e 18; COR-5 com a armadilha GEO-16, e DIC-1

**O que o desenho faz.** Cada segmento é um `<rect>` com `stroke="var(--surface-raised)"` de 1,5 px (`Chart.tsx:138` a `147`). O contorno é centrado na borda, então come 0,75 px de cada lado e todo segmento perde 1,5 px de altura, qualquer que seja o valor. A escala é de 0,725 px por oportunidade, porque os totais de 180 e 193 definem o eixo. No passo Ganhos (10 oportunidades, 7,25 px) a perda é maior que a fatia.

**Medida, passo Ganhos, igual nos dois temas:**

| Componente | Valor | Altura nominal | Tinta visível | Parte da tinta | Parte do valor |
|---|---|---|---|---|---|
| Otávio L. | 4 | 2,90 px | 1,40 px | 67,5% | 40% |
| Denise R. | 3 | 2,18 px | 0,68 px | 32,5% | 30% |
| Caio M. | 2 | 1,45 px | 0 | 0% | 20% |
| Bruna T. | 1 | 0,73 px | 0 | 0% | 10% |

Na coluna de pixels do centro da barra (x = 960 do PNG) só existem duas corridas de cor: 3 px de rosa e 1 px de amarelo com borda suavizada. Azul e ciano não aparecem em nenhum dos dois temas. O passo lê "Otávio L. e um pouco de Denise R." quando os quatro ganharam.

No passo Perdas o mesmo efeito é menor e não bloquearia sozinho: Denise R. (6) fica com 2,85 px de 4,35 px e com 12,0% da tinta para 14,6% do valor.

**Por que bloqueia.** A pergunta do `meta.json` é "Quem contribuiu com as entradas, os ganhos e as perdas". Em Ganhos o desenho não responde, e o que mostra é falso em proporção (2,1 para 1 onde o dado é 4 para 3). O valor só existe na dica nativa, cujo alvo tem 0,7 px ou está coberto pelo contorno do vizinho. O `notes` e o README declaram só o caso de Bruna T.; o de Caio M. não está declarado, e o próprio README cita esta versão em "Quando evitar".

**O que mudar.** Critério de aceite: no PNG dos dois temas, todo componente com valor maior que zero tem tinta em todo passo, e a parte da tinta de cada um acompanha a parte do valor. Conferir como a GEO-16 manda, segmento a segmento no `preview.svg`.

1. **Separador como vão, não como contorno.** Um vão de 1,5 px só entre vizinhos, descontado do passo em proporção (cada segmento perde a mesma fração), sem contorno nas bordas de fora. Zera o desvio de proporção nos três passos, mas não basta: em Ganhos sobram 2,75 px para quatro fatias.
2. **Escala, por desvio declarado no `notes`.** Saída preferida, a de `19/03` `v3`: o eixo parte da carteira inicial (180), escrita como nível com rótulo à esquerda, e o fim (193) vira nível com rótulo à direita, sem coluna cheia. De 180 a 244 em 177 px são 2,77 px por oportunidade: Ganhos passa a 27,7 px e Bruna T. a cerca de 2,3 px depois do vão. O item "Totais sem segmentação" do catálogo vira o desvio declarado. Não vale manter coluna cheia com eixo cortado (EIX-1).
3. **Alternativa à 2:** canvas por número, mais alto (GEO-1). Com 480 px de área útil a escala vai a 1,97 px por oportunidade e Bruna T. a cerca de 1,5 px. Fecha o critério, com muito cartão para duas colunas cinza.

Não serve: piso de altura por fatia (em 7,25 px não cabem quatro fatias e três vãos sem inflar o passo e desalinhar o conector), nem deixar o passo como está com a ressalva no `notes`.

### Bloqueante 2. Pergunta 11, COR-6 (papel de cor, 14.1)

**O que o desenho faz.** `polarityColor(net)` (`Chart.tsx:101`) devolve `--positive` para líquido positivo e `--negative` para negativo. Ganhos (−10) sai em vermelho com seta para baixo, igual a Perdas (−41).

**Por que bloqueia.** A COR-6 manda a cor seguir o sentido do bom, não o sinal. O `notes` diz o contrário com as próprias palavras: "ganho reduz a carteira e sai em negativo pela direção, não pelo mérito". Ganhar negócio é o melhor desfecho do recorte e o cartão o pinta como perda. É o caso que reprovou `19/03` `v3`.

**O que mudar.** Uma das duas, com sinal e seta continuando a dizer a direção (ACE-2):

1. Polaridade por passo vinda do `data.ts` (um campo do passo, e não o sinal do líquido): entradas e ganhos em `--positive`, perdas em `--negative`. Mantém a promessa do catálogo de polaridade no rótulo.
2. Carteira como métrica sem polaridade: os três rótulos em `--text-secondary`.

Depois da troca, corrigir a frase do `notes`.

## `v2_um-executivo-em-foco`: reprovada

A `v2` usa o mesmo dado e o mesmo desenho de passo da `v1`. Os bloqueantes 1 e 3 são os da `v1` com outra consequência; o 2 é próprio.

### Bloqueante 1. Pergunta 15, COR-5 com GEO-16, e respiro da 17.7

**Medida, passo Ganhos, igual nos dois temas.** Dos 7,25 px do passo, 2,08 px têm tinta: 0,68 px de `--chart-1` (Denise R., 3) na base e 1,40 px de `--line-strong` (Otávio L., 4) no topo, com cerca de 3,5 px de superfície entre os dois. Bruna T. (1) e Caio M. (2) não têm tinta. Varredura em x = 960 do PNG: 3 px de neutro, 7 px de fundo, 2 px de ciano suavizado.

**Consequência.** A marca do passo sai partida em dois fios. O fio neutro tem a cor do conector (`--line-strong`) e quase a mesma espessura (1,40 px contra 1 px), e começa onde o conector de Entradas termina, 1,45 px abaixo dele de centro a centro: lê como continuação do conector, não como parte da coluna. E o rótulo "Denise R. −3" fica a 1 px do mesmo conector em toda a largura do texto (conector nas linhas 323 a 325 do PNG, topo das maiúsculas na 328), contra o respiro de 4 px.

**O que mudar.** A saída de escala da `v1` (item 2 do bloqueante 1) resolve os três sintomas de uma vez: com 2,77 px por oportunidade o passo tem 27,7 px, o foco 8,3 px, e o rótulo fica longe do conector. Se a escala ficar como está, o mínimo é: os demais num bloco neutro só, com um único vão proporcional entre foco e resto (foco com cerca de 1,7 px e resto com 4,0 px), e o rótulo do foco a 4 px ou mais de qualquer conector.

### Bloqueante 2. Perguntas 11 e 20, seção 17.2, ACE-3, armadilha TOK-5

**O que o desenho faz.** Os nove segmentos dos demais executivos são preenchidos com `--line-strong` (`OTHER_FILL`, `Chart.tsx:33`). O `check` mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão, nas nove marcas. Nenhuma delas tem o próprio número na tela; o `notes` confirma: "o valor de cada segmento neutro só está na dica".

**Por que bloqueia.** A tabela 17.2 tem dois neutros e separa os dois por este critério: `--line-strong` "quando cada marca carrega o próprio número", `--text-muted` "quando não há número por marca". A isenção da ACE-3 pede o valor escrito na marca ou junto dela. O líquido do passo acima da pilha não é o número do segmento neutro nem o do grupo. A guarda não reprova porque duas regras se cruzam no caso geral (contorno e zero medido); aqui nenhuma das duas se aplica, porque as marcas carregam de 1 a 18 oportunidades. O item do catálogo que pede `--line-strong` não entra em choque com o contrato: ele vale com o número escrito.

**O que mudar.** Uma das duas:

1. Manter `--line-strong`, como o catálogo pede, e escrever o valor dos demais junto do passo ("demais +47"), com os demais num bloco só para que a marca carregue o número dela. Combina com o mínimo do bloqueante 1.
2. Trocar o neutro por `--text-muted` (5,21:1 e 5,37:1), mantendo os segmentos, e declarar o desvio do item do catálogo no `notes`. Conferir no PNG que o foco continua separável nos dois temas.

A amostra "Demais executivos" da legenda segue o token escolhido.

### Bloqueante 3. Pergunta 11, COR-6 (papel de cor, 14.1)

O mesmo da `v1`, bloqueante 2: `polarityColor` (`Chart.tsx:98`) pinta Ganhos em `--negative`. A mesma correção. Nesta versão pesa mais, porque a linha de leitura fala da conversão de Denise R. e o passo dos ganhos dela sai em vermelho.

## `v3_custo-da-area-com-midia-por-plataforma`: reprovada

### Bloqueante único. Pergunta 4, EIX-1 e encoding (14.1)

**O que o desenho faz.** Para passo que não é segmentado, o retângulo sai com `height={y(0) - y(block.high)}` e `y={y(block.high)}` (`Chart.tsx:132`): do topo do acumulado até o zero. Isso está certo para o total e para Pessoas, que começa no zero. Para Comissão, que começa em R$ 304 mil, o passo deixa de flutuar e vira coluna cheia.

**Medida, igual nos dois temas:**

| Marca | Valor | Altura que o valor pede | Altura desenhada |
|---|---|---|---|
| Pessoas | R$ 160 mil | 98,65 px | 98,65 px |
| Comissão | R$ 22 mil | 13,56 px, de y = 41,56 a y = 28 | 201 px, de y = 229 a y = 28 |
| Custo total | R$ 326 mil | 201 px | 201 px |

No `preview.svg` os retângulos de Comissão e do total têm a mesma altura e o mesmo topo (`height="201"`, `y="28"`). Na varredura de pixels, os dois têm os mesmos 401 px de dispositivo. A escala é de 0,6166 px por mil reais.

**Consequência.** O passo de R$ 22 mil, o menor da ponte, é desenhado 14,8 vezes maior que o valor e fica do tamanho do total. A linha de leitura do mesmo cartão diz que "o maior passo é pessoas, R$ 160 mil (49% do total)", e o desenho mostra Comissão com o dobro da altura de Pessoas. O conector de Ferramentas chega em R$ 304 mil e encontra uma coluna que vai até o chão.

**O que mudar.** Guardar o início do passo no bloco (o `low` que a `v1`, a `v2` e a `v4` já têm, `Math.min(start, end)`) e desenhar o passo inteiro de `y(block.high)` até `y(block.low)`. O total continua de `y(0)`. Conferir no `preview.svg` que Comissão sai com cerca de 13,56 px e que a legenda de Ferramentas, que começa em y = 49,56, continua livre abaixo dela.

Nada mais bloqueia na `v3`: escala conferida em Pessoas, nos seis segmentos e no total; seis cores em seis categorias, sem cor semântica no corpo; legenda presa ao passo na ordem da pilha; fechamento 160 + 118 + 26 + 22 = 326.

## `v4_estorno-separado-em-passo-proprio`: aprovada

32 perguntas sim, a 10 e a 14 com ressalva de acabamento. Escala conferida nas seis marcas (0,911 px por mil reais): investido a partir do zero, estorno flutuando de R$ 124 mil a R$ 118 mil no mesmo slot 6 da rede profissional, total no zero com 107,53 px. A conta do fechamento está escrita na leitura. Polaridade de custo com sinal e seta, declarada no `notes`. Observações no README.

## Ordem sugerida para a correção

1. `v3`: a geometria do passo inteiro.
2. `v1` e `v2`: a cor de polaridade, que é a mesma função nas duas.
3. `v1` e `v2`: separador e escala, que saem da mesma `buildBlocks` com o mesmo dado. Decidir a saída uma vez e aplicar nas duas.
4. `v2`: o neutro, depois de decidida a escala.

Ao mexer no README por causa do desvio, rever o item de "Quando evitar" que cita a `v1` e o item 3 da Anatomia, que descreve seta e cor de polaridade que a `v3` não desenha.

## Registro

```
Versão: 19_cascata-waterfall/07_cascata-empilhada/v1_carteira-do-mes-por-executivo
Data: 2026-10-06
Resultado: reprovada
Não: 2, 11, 15, 18
Correções:
  2, 15 e 18. COR-5, GEO-16, DIC-1: dar tinta proporcional aos quatro componentes de todo passo, com vão no lugar do contorno e escala por desvio declarado.
  11. COR-6: polaridade por passo vinda do dado, ou rótulo em --text-secondary; Ganhos não sai em --negative.
Não se aplica: 27, 28, 29, 30, 31

Versão: 19_cascata-waterfall/07_cascata-empilhada/v2_um-executivo-em-foco
Data: 2026-10-06
Resultado: reprovada
Não: 11, 15, 20
Correções:
  15. COR-5, GEO-16, 17.7: passo Ganhos sem marca partida e rótulo do foco a 4 px ou mais do conector.
  11 e 20. 17.2, ACE-3, TOK-5: neutro com o número escrito junto, ou em --text-muted com desvio declarado.
  11. COR-6: a mesma correção da v1.
Não se aplica: 27, 28, 29, 30, 31

Versão: 19_cascata-waterfall/07_cascata-empilhada/v3_custo-da-area-com-midia-por-plataforma
Data: 2026-10-06
Resultado: reprovada
Não: 4
Correções:
  4. EIX-1: passo inteiro desenhado do início dele ao fim, e não do zero; Comissão com cerca de 13,56 px.
Não se aplica: 27, 28, 29, 30, 31

Versão: 19_cascata-waterfall/07_cascata-empilhada/v4_estorno-separado-em-passo-proprio
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 27, 28, 29, 30, 31
```
