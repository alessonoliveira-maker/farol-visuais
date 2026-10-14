# Parecer de revisão: 22_unidades-waffle-e-pictograma/04_unit-chart-por-entidade

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render de 06:10:47 a 06:10:55, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro, o mais novo de 06:10:41). `npm run check` com tipos: 0 com erro, 0 aviso.

Resultado: `v1`, `v2` e `v4` aprovadas; `v3` reprovada por dois bloqueantes independentes, que se corrigem na mesma passada. As observações não bloqueantes das quatro estão no README do modelo.

> **Segunda passada no fim deste arquivo.** A `v3` foi corrigida às 06:58 e julgada de novo no mesmo dia. Os dois bloqueantes descritos logo abaixo estão resolvidos e conferidos. Ela segue reprovada por dois outros, na seção `# Segunda passada`, que é o insumo do corretor a partir de agora.

## Peso dos bloqueantes

* **`v3`, moldura do teto em `--line-strong`.** Perguntas 11 e 20; tabela 17.2 (papel Referência), ACE-3 e armadilha TOK-5. Papel de cor e contraste estão entre as regras que a seção 14.1 manda bloquear sempre, e o número é medido no PNG. É o mesmo defeito que reprovou `09/06/v3`, `17/01/v1` e `17/01/v4`, com a mesma origem: o catálogo pede o token e o contrato vence.
* **`v3`, ordem de tabulação diferente da ordem de preenchimento.** Seção 14.1, classe "versão que não demonstra o que o catálogo diz", item 5 do `demonstrates`. Não há pergunta própria entre as 32; a mais próxima, pela consequência, é a 19. O defeito não aparece no PNG, aparece no teclado, e está medido na ordem dos nós do `preview.svg`.

## O que foi medido e o que não foi

* **Medido:** os oito PNGs de conferência, com recortes ampliados da moldura, da legenda e do excedente da `v3`, da nota e da legenda da `v2` e do grupo de ausência da `v4`; a cor de cada marca amostrada pixel a pixel nos dois temas e conferida com `app/src/styles/tokens.css`; o contraste de cada cor contra o cartão e dos pares entre faixas da `v2`; a contagem de quadrados por cor em cada `preview.svg` (`v1` 155; `v2` 73, 23 e 44; `v3` 188, 189, 180 e 9, mais 6 molduras; `v4` 149 cheios e 41 tracejados); a ordem dos 566 botões da `v3` no `preview.svg` contra a ordem de preenchimento; a base do corpo e a última linha de tinta do nome de cada grupo; a frase acessível gravada em cada preview (169, 164, 192 e 118 caracteres).
* **Não medido pela ferramenta:** COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA nas quatro (`texto_em_html`); ESPESSURA-MARCA nas quatro (`marca_fora_do_bar` e, na `v3`, `preview_com_transform`). Contraste de texto e colisão foram cobertos à mão, pelos tokens e pelos PNGs. EIXO-CALMO, OPACIDADE-MARCA e RAIO-CONTRA-AREA não se aplicam.
* **Não renderizado:** o vazio das quatro; na `v3`, o modo por segmento, a animação da troca e o estado de foco; na `v4`, o ramo de um quadrado por lead. O que se diz desses ramos é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. São leitura do código e conta sobre o PNG, não render.

## `v3_carteira-de-contas-por-executivo`: reprovada, dois bloqueantes

### Bloqueante 1. Perguntas 11 e 20; tabela 17.2 (papel Referência), ACE-3, armadilha TOK-5

**Evidência.** A moldura do teto sai de `FRAME_STROKE = 'var(--line-strong)'` com `FRAME_DASH = '4 3'` (`Chart.tsx:40` e `41`, usados nas linhas 235 a 247), e a amostra dela na legenda sai de `border border-dashed border-line-strong` (linha 219). Medido nos dois PNGs, nas seis molduras de 146 por 122 px e na amostra de 10 px:

| Marca | Escuro | Contra o cartão | Claro | Contra o cartão |
|---|---|---|---|---|
| Moldura do teto, 1 px tracejado | `#33456a` | **1,79:1** | `#b4c0d6` | **1,83:1** |
| Amostra do teto na legenda | `#33456a` | **1,79:1** | `#b4c0d6` | **1,83:1** |
| Quadrados (`--chart-1`, `--chart-3`, `--chart-6`, `--negative`) | | 5,50 a 9,50:1 | | 5,39 a 6,36:1 |

Nos dois temas a moldura é o traço mais pálido do corpo, e a amostra da legenda quase não se vê no claro. O título do cartão é "contra o teto": a moldura é o assunto, e é ela que mostra a folga de quem está abaixo (Helena P. com 49, Otávio M. com 78).

**Por que bloqueia.** A tabela 17.2 dá o papel pelo nome: Referência (média, meta, teto) é `--text-muted`, traço de 1 px tracejado `3 3`, e `--line-strong` fica para a linha do zero. A TOK-5 lista este sintoma com as mesmas palavras, "o teto de referência ou a amostra da legenda ficam quase invisíveis sobre o cartão", e nomeia a origem: os estudos previam `--line-strong` para teto, e quem produziu obedeceu. O `notes` invoca a isenção do valor escrito, mas ela pertence a outro papel da tabela, o neutro de dado em que cada marca carrega o próprio número; aqui o 120 está escrito uma vez, na legenda, longe das seis molduras. O dossiê avisa que, colidindo catálogo e contrato, o contrato vence e o desvio se declara.

**O que mudar.**

1. `FRAME_STROKE = 'var(--text-muted)'` (5,21:1 no escuro e 5,37:1 no claro) e `FRAME_DASH = '3 3'`, que é o traço da 17.2.
2. A amostra da legenda acompanha: `border-text-muted` no lugar de `border-line-strong` (linha 219).
3. `meta.json`: o primeiro item do `demonstrates` deixa de citar `--line-strong`, e a última frase do `notes`, que hoje justifica o token, passa a declarar o desvio do catálogo. O item 5 da Anatomia no README do modelo cita o mesmo token e muda junto.
4. Conferir nos dois PNGs depois da troca, porque o traço mais forte expõe duas coisas que hoje passam por serem pálidas. As molduras vizinhas ficam a 3 px uma da outra (faixa de 149 px por grupo, moldura de 146 px) e leem como linha dupla. E a fileira do excedente nasce encostada no traço de topo da moldura, sem vão (base do quadrado em `bottom - 120`, que é a cota do centro do traço): se com o traço mais forte o excedente deixar de ler como fileira solta acima da moldura, suba a fileira o valor de `FRAME_PAD`.

### Bloqueante 2. Seção 14.1 (versão que não demonstra o que o catálogo diz), item 5 do `demonstrates`; pergunta mais próxima, a 19

**Evidência.** O catálogo e o `meta.json` dizem "Marcador como botão com rótulo, navegável por teclado na ordem de preenchimento", e o comentário do topo do `Chart.tsx` (linhas 11 e 12) afirma que "a ordem de preenchimento é a ordem de tabulação". O código faz outra coisa: os botões são desenhados por `data.accounts.map` (linha 250), na ordem do dado, com `tabIndex={0}` em cada um (linha 277), enquanto a posição de cada conta vem de `bucketsFor`, que ordena por segmento e depois por id (linhas 93 e 99). Como o segmento alterna a cada conta no dado, a ordem do DOM e a ordem da grade não coincidem.

Medido no `preview.svg`, que guarda os 566 botões na ordem do DOM:

| Tab | Conta | Segmento | Índice na ordem de preenchimento da carteira |
|---|---|---|---|
| 1 | C-1001 | Varejo | 42 |
| 2 | C-1002 | Serviços | 85 |
| 3 | C-1003 | Indústria | 0 |
| 4 | C-1004 | Serviços | 86 |
| 5 | C-1005 | Indústria | 1 |
| 6 | C-1006 | Varejo | 43 |

Dos 560 pares de botões consecutivos dentro da mesma carteira, **560 não seguem a sequência de preenchimento**. Na tela, cada Tab salta entre os três blocos de cor da carteira.

**Por que bloqueia.** É um dos cinco itens que a versão existe para ensinar, e quem copiar a peça como referência leva junto a afirmação errada, escrita em três lugares. O `notes` declara três desvios do catálogo e este não está entre eles. A consequência é de operação, não de acabamento: o foco deixa de ter ordem previsível numa peça com 566 paradas de tabulação.

**O que mudar.**

1. Desenhar os botões na ordem do layout, e não na do dado: percorrer os grupos de `bucketsFor(data, mode)` e, dentro de cada um, as contas já ordenadas, no lugar de `data.accounts.map`. A `key` continua sendo o id, então o React só move os nós na troca de agrupamento, e a animação, que nasce no `useLayoutEffect` depois da troca, não deveria ser afetada. Não testado: confira a troca nos dois sentidos depois da mudança.
2. Conferir o resultado no `preview.svg`: os 128 primeiros botões têm de ser a carteira de Talita V. com `transform` crescendo coluna a coluna a partir da base.
3. Se a escolha for manter a ordem do dado, o caminho é o contrário: tirar a afirmação do `demonstrates` e do comentário e declarar o desvio no `notes`. É a saída pior, porque o item do catálogo descreve o comportamento certo.

### Para corrigir na mesma rodada, sem peso de bloqueio

* Frase acessível com plural fixo (linha 186): com um só executivo acima do teto por uma conta, sai "1 executivos passam do teto" e "com 1 contas a mais".
* Legenda (linhas 209 a 228): está em 11 px, e a 17.1 pede 12 px em Manrope; o item "teto de 120 contas" leva `kpi-number` na frase inteira e sai em Space Grotesk ao lado de vizinhos em Manrope. `tabular-nums` só no número resolve (TIP-1).
* TIP-4: "128 contas" (linha 300) e o item do teto pedem Space Grotesk em peso 400, que não é carregado; o navegador entrega 500. Declarar `font-medium` ou usar Manrope com `tabular-nums`.
* ROT-4: a legenda vai da base ao topo (Indústria, Varejo, Serviços, teto, acima do teto) e a pilha lida de cima para baixo começa pelo excedente. Sem consequência visível.
* `data.ts:53`: comentário de documentação solto, separado da função por linha em branco.

### O que está certo na `v3` e não deve mudar na correção

* A contagem: 566 quadrados no preview, 128, 121, 100, 90, 78 e 49 por carteira, iguais aos números escritos sob cada nome; 8 e 1 em `--negative` acima da moldura, iguais a "+8 acima do teto" e "+1 acima do teto".
* A geometria do teto: moldura de 12 colunas por 10 linhas (120 lugares) em todas as carteiras, mesma célula e mesma base, então a folga se lê pela altura vazia dentro da moldura.
* Os segmentos nos slots 1, 3 e 6 pelo `slot` do dado, e a decisão de parar em três, explicada no `notes`. `--negative` com palavra e posição, não só cor.
* O excedente escrito com sinal e base na mesma linha, em `--negative` direto sobre o cartão (5,50:1 e 6,36:1).
* A raiz `role="group"` com a frase calculada, porque os filhos são botões; o vazio com `role="status"`; a troca sem animação para quem pede menos movimento.
* O texto em HTML por cima do SVG, que mantém 11 e 12 px quando o desenho encolhe.

```
Versão: 22_unidades-waffle-e-pictograma/04_unit-chart-por-entidade/v3_carteira-de-contas-por-executivo
Data: 2026-10-13
Resultado: reprovada
Não: 11, 20, e a classe da seção 14.1 (sem pergunta própria; a mais próxima é a 19)
Correções:
  11. Tabela 17.2 (papel Referência), TOK-5: moldura do teto e amostra da legenda em --text-muted, tracejado 3 3, com o desvio do catálogo declarado no notes.
  20. ACE-3: --line-strong mede 1,79:1 e 1,83:1 contra o cartão; a troca acima resolve.
  14.1. Item 5 do demonstrates: desenhar os botões na ordem de preenchimento, para a tabulação seguir a grade.
Não se aplica: 6, 26, 27, 28, 29, 30, 31, 32
```

## Versões aprovadas

Nenhuma das três tem bloqueante. O que cada uma deixa para depois está no README do modelo, na seção de observações, e não entra na rodada de correção.

### `v1_oportunidades-abertas-por-etapa`

Conferido: 155 quadrados no preview, 44, 48, 36, 24 e 3 por etapa, iguais aos números escritos, que somam o total da linha de abertura. Quatro colunas e célula de 10 px em todos os grupos, todos da mesma base, então a altura lê a contagem. Cor única em `--chart-1` (9,50:1 e 6,00:1). O nome longo quebra em duas linhas sem truncar, e a etapa de 3 oportunidades continua visível. Frase de 169 caracteres, calculada do dado. Vazio com `role="status"`.

```
Versão: 22_unidades-waffle-e-pictograma/04_unit-chart-por-entidade/v1_oportunidades-abertas-por-etapa
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 13, 26, 27, 28, 29, 30, 31, 32
```

### `v2_oportunidades-paradas-por-etapa`

Conferido: 73, 23 e 44 quadrados por faixa no preview, 140 no total, iguais à linha de abertura; a faixa crítica sobe em bloco contíguo para o topo de cada etapa (6, 11, 19 e 8) e o colchete da nota cobre as 4 linhas que as 19 de Proposta ocupam. Três faixas discretas, sem degradê, com o desvio da palavra "gradiente" do catálogo declarado. Contra o cartão: `--seq-5` 4,89:1 e 3,72:1, `--seq-7` 10,12:1 e 8,29:1, `--warning` 8,36:1 e 5,74:1. Entre faixas: `--seq-5` contra `--seq-7` mede 2,07:1 e 2,23:1, com a posição ordenando junto; `--seq-7` contra `--warning` mede 1,21:1 e 1,44:1 e se sustenta no segundo canal, que é o contorno em `--text-primary` nos dois temas, repetido na amostra da legenda. Nota de 29 caracteres em 11 px e `--text-muted`, a 16 px do grupo vizinho.

```
Versão: 22_unidades-waffle-e-pictograma/04_unit-chart-por-entidade/v2_oportunidades-paradas-por-etapa
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29, 30, 31
```

### `v4_leads-por-etapa-com-sem-etapa`

Conferido: 149 quadrados cheios e 41 tracejados no preview, 190 para 1.900 leads, com 56, 47, 29, 16, 1 e 41 por grupo; seis colunas em todos os grupos, então a altura segue comparável. O aviso "1 quadrado = 10 leads" está no topo, em uma linha que termina 37 px antes da borda do corpo, e a nota diz que o número é exato e o desenho arredonda. A ausência vem por último, afastada, em contorno tracejado `--text-muted` (5,21:1 e 5,37:1), com nome e contagem exata; não vira zero nem some. Vazio com `role="status"`.

O ponto que mais pesa entre as observações é desta versão: a frase acessível diz "1.900 leads em 6 etapas" contando o grupo sem etapa como etapa, logo antes de dizer que 406 não têm etapa. Ficou como observação porque é redação, a unidade e a ausência estão ditas certas na mesma frase, e o corpo não repete o número.

```
Versão: 22_unidades-waffle-e-pictograma/04_unit-chart-por-entidade/v4_leads-por-etapa-com-sem-etapa
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 13, 18, 26, 27, 28, 29, 30, 31, 32
```

## Régua e ferramenta

* **Catálogo desatualizado na `v3`.** O `demonstrates` do catálogo manda a moldura do teto em `--line-strong`, que a tabela 17.2 e a TOK-5 recusam para referência. O dossiê marcou a palavra "gradiente" na `v2` e não marcou este token na `v3`; a mesma busca de termo, aplicada a `--line-strong` junto de teto, meta ou média, teria avisado o produtor.
* **A ROT-10 não diz onde cai o unit chart com cor por atributo.** A lista dela nomeia waffle e pictograma. Na `v2` e na `v3` cada pilha tem partes coloridas sem número por parte, e a pergunta 27 foi respondida como não se aplica, com o ponto anotado nas observações. Vale uma linha no contrato dizendo se a régua alcança este modelo.

---

# Segunda passada: `v3` depois da correção

Data: 2026-10-13. Revisor independente, outro que o da primeira passada. Motivo: `revisao_desatualizada`, porque o `Chart.tsx` e o `meta.json` da `v3` mudaram às 06:58:33, depois do veredito das 06:43. Julgado o arquivo de hoje, não a nota anterior. `npm run check` com tipos: 0 com erro, 0 aviso. PNGs de 06:58:53 e 06:58:54, posteriores ao `Chart.tsx`; diferença entre a página e o SVG sozinho de 0,013% no escuro e 0,016% no claro.

Resultado: **reprovada**, por dois bloqueantes novos. Os dois estão na moldura do teto e os dois são invisíveis no preview, porque o dado padrão os esconde. O desenho do dado padrão está certo, e os dois bloqueantes da primeira passada estão corrigidos.

## O que a correção resolveu, conferido

* **Moldura do teto.** Nas seis molduras dos dois previews o traço é `rgb(127, 143, 171)` no escuro e `rgb(92, 107, 135)` no claro, que são `--text-muted`, com tracejado `3px, 3px`. Medido nos PNGs: 5,21:1 e 5,37:1 contra o cartão. A amostra da legenda acompanha. O `meta.json` e o item 5 da Anatomia declaram o desvio do catálogo.
* **Tabulação.** Os 566 botões do `preview.svg` estão na ordem de preenchimento: 0 de 560 pares consecutivos fora de sequência dentro da mesma carteira, contra 560 de 560 na primeira passada. No navegador, saindo do seletor, o Tab para em C-1003 (2, 196), C-1005 (14, 196), C-1010 (26, 196) e C-1012 (38, 196): a linha da base, coluna a coluna.

## Como os ramos foram medidos

O preview prova um estado só: o dado padrão, no modo por executivo. Para esta passada, um script de rascunho, fora do catálogo, empacotou a versão com `buildBundle` e `startServer` da própria ferramenta e abriu a página no navegador do render, sob a trava. Nada do catálogo foi gravado por ele. Foram duas séries:

* **O `Chart.tsx` e o `data.ts` da versão, sem mudança,** com clique e teclado: modo por segmento nos dois temas, foco, e a troca com e sem animação.
* **Cópias no rascunho com o mesmo `Chart.tsx` e só o `data.ts` alterado:** recorte de 280 contas (carteiras de 60, 55, 50, 45, 40 e 30), teto de 100, um nome de 26 caracteres, `segmentId` fora da lista e lista vazia.

As saídas sugeridas abaixo também foram aplicadas em cópia e renderizadas. É teste de rascunho e não substitui o render do corretor.

## Bloqueante 1. Pergunta 13; ANO-3; seção 14.1, domínio

**O teto não entra na altura do desenho, e a moldura perde o topo quando as pilhas são baixas.**

**Evidência.** A altura sai só das pilhas. `maxRowsOf` (`Chart.tsx:112` a `115`) devolve as linhas da maior pilha nos dois agrupamentos, e `viewH` e `bottom` (linhas 179 e 180) saem dela. A moldura é desenhada em `y = bottom - ceilingRows * PITCH + GAP - FRAME_PAD` (linha 251), que com as constantes do arquivo vale `14 + (maxRows - 10) * 12`. Com 9 linhas a moldura cabe, em y de 2. Com 8 ou menos o y fica negativo, e o `<svg>`, que corta o que sai dele, leva o traço de topo.

No dado padrão isso não aparece por acaso: o maior segmento tem 189 contas, 16 linhas, e é ele que dá a altura. Medido:

| | Dado padrão | Recorte de 280 contas |
|---|---|---|
| Maior pilha, em qualquer agrupamento | 189 contas, 16 linhas | 94 contas, 8 linhas |
| `viewBox` | `0 0 894 244` | `0 0 894 148` |
| `y` da moldura | 86 | **−10** |
| Traço de topo da moldura | visível nas seis | **cortado nas seis** |

Na tela do recorte, nos dois temas, as seis molduras viram três lados abertos que sobem até a legenda. A folga de cada carteira, que é a leitura do cartão, deixa de existir, e a legenda continua dizendo "teto de 120 contas".

**Quando acontece.** Sempre que a maior pilha, em qualquer dos dois agrupamentos, tem até 96 contas. Com três segmentos parecidos, é todo recorte de até cerca de 288 contas. Com seis segmentos, basta nenhuma carteira passar de 96, que é o estado saudável. O README do modelo põe o uso entre 20 e cerca de 1.500 itens, e o `notes` e o passo 3 de "Como colar no Farol" mandam filtrar passando menos contas em `data`: é o ramo que a versão anuncia.

**Por que bloqueia.** A ANO-3 dá o motivo com as próprias palavras: sem estender o domínio, a referência "some quando passa do maior valor". É o caso medido: o teto passa da maior pilha e some. A regra fala em `ReferenceLine` porque foi escrita para Recharts; em SVG puro a obrigação fica com quem calcula o `viewBox`. Domínio está na lista da seção 14.1 que bloqueia sempre, e o número tem medição atrás. Não é constante de acabamento: o que some é o assunto do cartão.

**O que mudar.** Em `maxRowsOf`, devolver o maior entre as linhas da maior pilha e `rowsFor(portfolio.ceiling)`. É uma linha. Testado no rascunho: no recorte de 280 contas o `viewBox` vai a `0 0 894 172` e as seis molduras fecham inteiras, com a folga legível; no dado padrão nada muda de lugar, porque as 16 linhas do maior segmento continuam mandando.

## Bloqueante 2. Seção 14.1, encoding; sem pergunta própria, a mais próxima é a 13

**A moldura fecha linhas inteiras de 12, e só é o teto quando o teto é múltiplo de 12.**

**Evidência.** `ceilingRows = rowsFor(data.ceiling)` (linha 181) arredonda o teto para cima em linhas, e a moldura tem essa altura (linha 243): ela fecha `ceilingRows * 12` lugares. O excedente é contado de outro jeito, e certo, pelo índice (`index >= portfolio.ceiling`, linha 131). Os dois só concordam quando o teto é múltiplo de `COLS`. Medido com `ceiling: 100` e as mesmas 566 contas:

* a moldura tem 110 px de altura, 9 linhas, **108 lugares**, sob a legenda "teto de 100 contas";
* **16 quadrados em `--negative`, rotulados "acima do teto", ficam dentro da moldura** (8 de Talita V. e 8 de Murilo C.);
* Renan A., com exatamente 100 contas, aparece com 8 lugares vazios dentro da moldura: a tela mostra folga de 8 onde a folga é zero.

No dado padrão, 120 é 12 vezes 10 e a moldura é exata.

**Por que bloqueia.** A moldura é o encoding do teto: a área dela afirma a capacidade. Fora dos múltiplos de 12 ela afirma um número que não é o do dado nem o da legenda ao lado, e o vermelho, que quer dizer acima do teto, aparece dentro dela. `ceiling` é campo do dado (`Portfolio.ceiling: number`, sem restrição declarada) e a legenda o imprime por `formatInt(data.ceiling)`: a peça promete seguir o número. 100, 150 e 200 não são múltiplos de 12. Encoding está na lista da seção 14.1 que bloqueia sempre. Não há regra com código para a capacidade de uma moldura; o peso aqui vem da consequência, que é a tela dizer um teto e desenhar outro.

**O que mudar.** A moldura passa a fechar exatamente `ceiling` células: as linhas inteiras e, quando sobra resto, um degrau com `ceiling % COLS` células na linha de cima, com o traço do degrau no meio do vão de 2 px. Um `<path>` no lugar do `<rect>` resolve. O caminho testado no rascunho, no lugar de `ceilingRows`:

```tsx
const fullRows = Math.floor(data.ceiling / COLS);
const rest = data.ceiling % COLS;
const framePath = (left: number): string => {
  const x0 = left - FRAME_PAD;
  const x1 = left + STACK_WIDTH + FRAME_PAD;
  const yBottom = bottom + FRAME_PAD;
  const yFull = bottom - fullRows * PITCH + GAP - FRAME_PAD;
  if (rest === 0) return `M${String(x0)} ${String(yBottom)}H${String(x1)}V${String(yFull)}H${String(x0)}Z`;
  const xStep = left + rest * PITCH - GAP / 2;
  const yStep = bottom - fullRows * PITCH + GAP / 2;
  const yTop = yFull - PITCH;
  return `M${String(x0)} ${String(yBottom)}H${String(x1)}V${String(yStep)}H${String(xStep)}V${String(yTop)}H${String(x0)}Z`;
};
```

Resultado do teste com teto 100: 8 linhas inteiras e 4 células no degrau, Renan A. preenche a moldura inteira e nenhum quadrado vermelho fica dentro dela. Com teto 120 o caminho coincide com o retângulo de hoje: 0,26% dos pixels do PNG mudam, todos na caixa das molduras, pela fase do tracejado e pelo canto, que deixa de ser arredondado pelo `rx` (o teste usou `strokeLinejoin="round"`). A saída do bloqueante 1 já cobre a linha do degrau, porque `rowsFor(ceiling)` a conta.

Saída menor, e pior: manter o retângulo e escrever no tipo, no `notes` e no "Como colar no Farol" que o teto precisa ser múltiplo de `COLS`. Resolve a honestidade só para quem lê o aviso.

## Para corrigir na mesma rodada, sem peso de bloqueio

A lista inteira está no README do modelo, no parágrafo da segunda passada. Os que tocam a mesma moldura e saem junto com os bloqueantes:

* A primeira moldura nasce em x = 0 e perde metade do traço esquerdo (1 de 2 px de dispositivo no PNG, nos dois temas). Um recuo de 1 px a mais resolve, e o comentário da linha 125 volta a ser verdade.
* A fileira do excedente encosta no traço de topo da moldura e cobre metade dele sob os 9 quadrados. Lê certo como fileira acima da moldura; com a moldura em caminho, o traço pode passar no meio do vão.
* Os cinco itens de mesma rodada da primeira passada não foram tocados pela correção: plural fixo na frase acessível (medido no recorte: "0 executivos passam do teto de 120, com 0 contas a mais"), legenda em 11 px com "teto de 120 contas" em Space Grotesk, peso 400 em "128 contas", ordem da legenda e comentário solto em `data.ts:53`.

## O que está certo na `v3` e não deve mudar

* **O dado padrão.** 566 quadrados; 128, 121, 100, 90, 78 e 49 por carteira, iguais aos números escritos; 188, 189, 180 e 9 por cor; "+8" e "+1" acima da moldura.
* **O modo por segmento,** renderizado nos dois temas: três pilhas de 188, 189 e 189 com nome e contagem, legenda só com os segmentos, sem moldura e sem transbordo (o conteúdo fecha em 278 dos 281,5 px do corpo). A frase acessível troca para "agrupadas por segmento".
* **A troca.** Com movimento, 524 dos 566 marcadores animam por transform e os 42 que não mudam de lugar ficam parados; ida e volta devolvem o desenho inicial, sem erro no console. Com menos movimento a peça não chama a animação (linha 157).
* **O teclado.** Ordem de preenchimento, e foco com contorno de 2 px em `--text-primary`, visível nos dois temas.
* **A lista vazia.** Bloco `role="status"` com `Filter` e a frase, no lugar do desenho inteiro.
* **Contraste,** pelos tokens que o navegador entregou: 5,21:1 e 5,37:1 no menor par de texto (`--text-muted` em "128 contas"), 5,50:1 e 6,36:1 no excedente, 5,39:1 para cima nos quadrados.

```
Versão: 22_unidades-waffle-e-pictograma/04_unit-chart-por-entidade/v3_carteira-de-contas-por-executivo
Data: 2026-10-13
Resultado: reprovada
Não: 13, e a classe encoding da seção 14.1 (sem pergunta própria; a mais próxima é a 13)
Correções:
  13. ANO-3: a altura do viewBox passa a contar as linhas do teto, para a moldura não perder o topo quando a maior pilha tem até 96 contas.
  14.1. Encoding: a moldura fecha exatamente ceiling células, em degrau quando o teto não é múltiplo de COLS.
Não se aplica: 6, 26, 27, 28, 29, 30, 31
```

## Régua e ferramenta, segunda passada

* **A ANO-3 só fala de `ReferenceLine`.** Teto, meta e média desenhados em SVG puro não têm regra escrita que diga que a referência entra no domínio e que ela se desenha no valor exato. Os dois bloqueantes desta passada moram nesse vão, e a pergunta 13 do checklist herda a redação de Recharts. Por isso o peso deles foi decidido pela consequência medida, e quem discordar do peso tem aqui o que foi medido e como.
* **O preview prova um estado só.** Recorte pequeno, teto diferente e modo por segmento não têm prova visual, e foi por isso que a primeira passada não viu estes dois defeitos. A emenda em estudo E7 da seção 18 do contrato (cada versão declara os estados que o preview prova) cobriria. Até lá, peça com teto, filtro ou seletor pede um segundo dado de teste no render.
