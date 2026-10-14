# Parecer de revisão: 27_rede-e-relacoes/03_grafo-em-grade

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render das 15:03, posterior ao último `Chart.tsx`, das 15:02:11). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes.

Resultado: duas aprovadas e duas reprovadas, com um bloqueante cada. A `v3` cai porque o rótulo da seta de retorno está em cima do traço e o halo parte a seta em duas. A `v4` cai porque os três números das setas saem sem unidade e sem período em todo o corpo do cartão. Nenhuma versão tem defeito de conta, de geometria de grade, de contraste ou de ausência: somas, taxas, faixas de espessura e pontas conferem com o `data.ts`. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

| Versão | Resultado | Não |
|---|---|---|
| `v1_handoff-por-funcao-e-etapa` | aprovada | nenhum |
| `v2_handoffs-com-sla-estourado` | aprovada | nenhum |
| `v3_filas-de-pre-vendas-com-pilha` | reprovada | 31 |
| `v4_etapa-sem-responsavel` | reprovada | 14 |

Não se aplica, nas quatro: perguntas 4, 6, 7, 27, 28 e 29. Na `v1`, na `v2` e na `v4` também a 30. A 26 não se aplica: as quatro versões do catálogo estão no disco.

## O que foi medido e o que não foi

* **Refeito do `data.ts`, à mão:** na `v1`, as 5 passagens somam 3.390 e a maior é 1.420. Na `v2`, as cinco taxas (9%, 0%, 38%, 10% e 19%) e as duas acima do limiar de 15%. Na `v3`, os cortes das faixas (173, 346 e 520), a faixa de cada uma das 13 setas contra a espessura do PNG, o caminho aceso (340, 150, 200, 28 e 260, que somam 978), 1 retorno e 1 pilha. Na `v4`, 1 de 16 células e os 388 que chegam à célula sem dono.
* **Geometria refeita das constantes:** centro de célula, pontas a 14 px, pista a 62% do vão e posição de cada rótulo, nas quatro. Na `v3`, o corredor de retorno em x 554 e o trecho reto do tronco de y 135 a y 189 (54 px), com o rótulo centrado em x 554 e y 162.
* **Recortes ampliados dos PNGs, com contagem de pixels:** o tronco do retorno da `v3`, as três pistas da `v2` sob os rótulos, as setas grossas da `v3`, a legenda e a célula tracejada da `v4`, as chegadas duplas da `v1`.
* **`v3` em tons de cinza, nos dois temas:** o caminho aceso continua separado do resto.
* **Preview contra página:** de 0,000% a 0,028% de pixels diferentes nos oito pares de PNG.
* **Frase acessível, lida em `data-farol-ace`:** 194, 157, 169 e 205 caracteres.
* **Não medido pela ferramenta:** `EIXO-CALMO` (`sem_grade`) e `RAIO-CONTRA-AREA` (`sem_marca_de_area`) não se aplicam a esta peça. `OPACIDADE-MARCA` sai `sem_opacidade_em_marca` também na `v3`, que usa opacidade pela constante `DIM_OPACITY`; a conta foi refeita à mão e está na tabela.
* **Não renderizado:** o estado vazio das quatro, a `v3` com outro `highlightId` ou com mais de uma pilha, e qualquer dado diferente do padrão. O que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas. As medidas citadas nelas são conta de constante, não render.

Pares de contraste, calculados de `app/src/styles/tokens.css` pela fórmula da WCAG:

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--text-muted` contra o cartão | 5,21 | 5,37 | seta das quatro, contorno tracejado e rodapé da `v4` |
| `--text-muted` a 0,76 contra o cartão | 3,58 | 3,28 | seta fora do caminho, `v3` (ACE-5, piso de 3) |
| `--chart-1` contra o cartão | 9,50 | 6,00 | caminho aceso, contorno do nó e número aceso, `v3` |
| `--chart-1` contra o neutro a 0,76 | 2,65 | 1,83 | marca contra marca, `v3` (TOK-9, observação) |
| `--negative` contra o cartão | 5,50 | 6,36 | seta, relógio e texto em alerta, `v2` |
| `--negative` contra `--text-muted` | 1,05 | 1,18 | marca contra marca, `v2`: o alerta vive do relógio, da espessura e do texto |
| `--text-secondary` contra o cartão | 8,16 | 8,13 | cabeçalhos, número neutro da `v3`, texto da célula sem dono |
| `--text-primary` sobre `--surface-sunken` | 16,67 | 15,56 | nome dentro do nó, as quatro |
| `--line-strong` contra o cartão | 1,79 | 1,83 | contorno do nó, com o nome escrito dentro (isenção da ACE-3) |
| `--line-subtle` contra o cartão | 1,25 | 1,29 | grade, e a amostra de legenda da `v4` (observação) |

## `v3_filas-de-pre-vendas-com-pilha`: reprovada, 1 bloqueante

### Pergunta 31, ROT-7 (exceção da marca fina), armadilha GEO-4

**Evidência.** O rótulo da seta de retorno é ancorado no próprio corredor: `x: corridorX`, `y: (a.cy + b.cy) / 2`, `anchor: 'middle'` (`Chart.tsx`, linhas 267 a 269), e todo rótulo de seta leva halo de `strokeWidth: 4` (linha 408). O tronco do retorno tem 1,5 px. No PNG, nos dois temas, o `28` aparece no meio do tronco e o traço some por baixo dele:

| Tema | Traço cheio acaba em | Volta em | Interrupção | Sobra de traço reto |
|---|---|---|---|---|
| Claro | y 588 (2x) | y 612 (2x) | 11,5 px | 21,5 px acima e 21,5 px abaixo |
| Escuro | y 589 (2x) | y 612 (2x) | 11,0 px | 22,0 px acima e 21,5 px abaixo |

São 11 a 11,5 px apagados em 54 px de trecho reto, 21% do tronco, e a seta passa a ser dois pedaços com um número entre eles. É o caso que a ROT-7 mediu em `09/06` e proibiu: "onde o rótulo cruzaria uma marca de traço, quem sai do lugar é o rótulo". As outras 12 setas da versão já obedecem: o número fica acima da pista ou ao lado da vertical, e nenhum halo encosta no traço. O retorno é o único rótulo em cima da marca, e é justamente a seta que o catálogo manda demonstrar ("retorno para etapa anterior desenhado por fora da grade").

**O que mudar.** Tirar o rótulo de cima do tronco, mantendo pelo menos 2 px entre a borda do halo e a borda do traço. Dois caminhos, nenhum testado:

* **À esquerda do tronco**, com `textAnchor="end"` em `corridorX - SIDE_GAP` (x 546). O `28` ocupa de x 533 a x 546 e cruza só a borda direita da grade (x 538), que é linha de referência e é onde o halo serve. Não mexe na grade. Vale para retorno entre etapas vizinhas, em que o ponto médio cai na divisa de linha. Em retorno que pule uma etapa o ponto médio cai na altura de um nó da última coluna: nesse caso ancore o `y` numa divisa de linha, não no ponto médio.
* **À direita do tronco**, com `textAnchor="start"` em `corridorX + SIDE_GAP` (x 562). Hoje sobram 20 px à direita do corredor e o `28` mede cerca de 13: estoura o `viewBox` por 1 px, e um número de três algarismos (cerca de 19 px) estoura por 7. Pede `MARGIN_RIGHT` maior, e aí a célula encolhe: com 48 px de margem a célula cai de 112 para 109 px e a pilha de três folhas (54,75 px de meia largura com o contorno) encosta na borda da célula (54,5 px). Se for por aqui, refaça a conta da pilha.

Depois da mudança, confira no PNG dos dois temas que o tronco sai inteiro de y 135 a y 189 e que o número não cai sobre o nó `Retomada`.

## `v4_etapa-sem-responsavel`: reprovada, 1 bloqueante

### Pergunta 14, NUM-6, armadilha DAD-9

**Evidência.** Os três números das setas saem de `formatInt(edge.count)` sozinho (`Chart.tsx`, linha 234). O rodapé escreve a contagem de células e as duas amostras de legenda (linhas 237 a 247), e mais nada. `data.period` só é lido na linha 155 e `passageNoun` só na linha 153, as duas dentro da frase acessível. No PNG, o corpo inteiro traz `1.420`, `860` e `388` sem dizer o que contam nem de quando são; o título (`Etapas do processo sem responsável`) e o caso de uso também não dizem. Quem ouve recebe "no 3º trimestre de 2026" e "recebe 388 oportunidades"; quem enxerga não recebe nenhum dos dois.

A NUM-6 pede "unidade em todo lugar em que o número aparece" e que a "contagem solta" leve o substantivo, e a seção 14.1 põe unidade entre as regras que bloqueiam sempre. A DAD-9 descreve o mesmo defeito pelo lado do período: o recorte só existe na frase acessível. Na vizinha `27_rede-e-relacoes/01_matriz-de-adjacencia/v2` um cabeçalho sem substantivo ficou como observação porque a unidade estava em outro ponto do cartão; aqui ela não está em ponto nenhum. A irmã `v1` resolve com uma linha de rodapé: `Passagens de oportunidade, 3º trimestre de 2026`.

**O que mudar.** Escrever no corpo a unidade e o período dos números das setas, calculados do dado (`data.period`), em 11 px e `--text-muted`. Dois caminhos, nenhum testado:

* **Terceira linha de rodapé**, como a da `v1`. Pede cerca de 14 px a mais em `FOOTER_HEIGHT` e em `VIEW_HEIGHT` (de 222 para perto de 236). No render de hoje o caso de uso cabe em uma linha e sobram cerca de 19 px sob o desenho no preset `card`, então a escala deve continuar 1; confirme com o render e com a `TAMANHO-TEXTO`, e atualize a medida do corpo no `notes`.
* **Na linha da contagem, à direita**, com `textAnchor="end"` perto de x 568. A contagem em 700 acaba perto de x 232 do `viewBox` e a frase da unidade mede cerca de 249 px em 11 px (medida no rodapé da `v1`): cabe em 574 com mais de 80 px entre as duas. Não muda a altura.

A dica nativa da seta (`<title>`, linha 116) também sai sem substantivo; alinhe na mesma passada.

## O que convém alinhar na mesma passada (não bloqueia)

Estes itens estão no README como observação. Ficam aqui porque o corretor vai abrir os mesmos arquivos, e a rodada de correção é uma só.

* `v3`: a linha de leitura e a frase acessível dizem `5 passagens que somam 978 leads`. A conta fecha com as setas acesas, mas soma passagens em cadeia: a Cadência longa recebe 340 e entrega 150. Trocar `leads` por `passagens`, ou a soma por entrada e saída do caminho.
* `v3`: `period` (`2026-08`) não aparece no corpo nem na frase acessível. A unidade está na legenda (`Leads por passagem`), por isso não bloqueia como na `v4`.
* `v3`: escrever no `notes` o par marca contra marca do destaque, 2,65:1 no escuro e 1,83:1 no claro (TOK-9).
* `v4`: o passo 3 de Como colar, no README, não avisa que a aresta com destino na mesma coluna ou à esquerda é descartada. O README é do modelo e o revisor só edita a seção de observações; a correção do texto fica com quem corrige.
* `v1`: a frase acessível tem a mesma soma em cadeia (`5 passagens que somam 3.390 oportunidades`). A versão está aprovada; a troca de uma palavra muda a impressão digital e pede novo veredito.

## Registro do parecer

```
Versão: 27_rede-e-relacoes/03_grafo-em-grade/v1_handoff-por-funcao-e-etapa
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções:
  nenhuma
Não se aplica: 4, 6, 7, 26, 27, 28, 29, 30

Versão: 27_rede-e-relacoes/03_grafo-em-grade/v2_handoffs-com-sla-estourado
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções:
  nenhuma
Não se aplica: 4, 6, 7, 26, 27, 28, 29, 30

Versão: 27_rede-e-relacoes/03_grafo-em-grade/v3_filas-de-pre-vendas-com-pilha
Data: 2026-10-13
Resultado: reprovada
Não: 31
Correções:
  31. ROT-7, exceção da marca fina: tirar o rótulo do retorno de cima do tronco da seta, que hoje perde de 11 a 11,5 px de traço sob o halo nos dois temas.
Não se aplica: 4, 6, 7, 26, 27, 28, 29

Versão: 27_rede-e-relacoes/03_grafo-em-grade/v4_etapa-sem-responsavel
Data: 2026-10-13
Resultado: reprovada
Não: 14
Correções:
  14. NUM-6: escrever no corpo a unidade e o período dos números das setas (oportunidades, 3º trimestre de 2026), que hoje só existem na frase acessível.
Não se aplica: 4, 6, 7, 26, 27, 28, 29, 30
```
