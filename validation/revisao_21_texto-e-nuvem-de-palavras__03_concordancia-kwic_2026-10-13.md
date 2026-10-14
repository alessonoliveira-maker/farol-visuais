# Parecer de revisão: 21_texto-e-nuvem-de-palavras/03_concordancia-kwic

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 08:47:38 em diante, posterior ao `Chart.tsx` das quatro, de 08:47:16). `npm run check` com tipos: 0 com erro, 4 avisos, 0 escapes.

Resultado: `v2`, `v3` e `v4` aprovadas; `v1` reprovada por um bloqueante. As 13 observações não bloqueantes estão no README do modelo, na seção `## Observações da revisão (não bloqueantes)`.

## Peso do bloqueante

* **`v1`, o contexto não cabe na coluna: cobre o termo em 3 linhas e é cortado na borda em 7.** Pergunta 15; ESP-3, ROT-9 e seção 14.1 (ilegibilidade: corte, sobreposição, transbordo). Não é constante de acabamento sem consequência: 10 das 20 linhas do preview saem com defeito visível, nos dois temas, e as três sobreposições caem exatamente sobre a palavra vizinha do termo, que é o que a versão existe para mostrar ("mantendo as palavras mais próximas do termo").

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão e o PNG da página viva da `v1` (`.pagina.png`), com recorte ampliado das linhas 1 a 5, 13 a 19 da `v1`; a tinta de cada linha, coluna a coluna de pixels, nas quatro versões e nos dois temas; a largura de cada contexto da `v1`, da `v2` e da `v3`, calculada com a Manrope 400 a 12 px do `@fontsource/manrope` (a conta fica cerca de 1,5% acima da tinta medida no PNG, então erra para o lado seguro); os pares de cor, calculados de `app/src/styles/tokens.css`; a frase acessível, lida do `data-farol-ace` de cada `preview.svg` (186, 143, 195 e 126 caracteres); as contagens de cada versão contra o `data.ts`; a diferença entre o PNG da página e o do SVG, de 0,04% a 0,33% dos pixels nas oito imagens (conta minha, pixel com mais de 32 níveis de diferença, e não a métrica do render), abaixo do limite de 0,5%.
* **Não medido pela ferramenta:** COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA nas quatro (`texto_em_html`). É por esse ponto cego que a `v1` passa no `check` com 0 erro; a colisão foi achada à mão.
* **Não renderizado:** o estado vazio das quatro, as ordenações por contexto esquerdo e por termo da `v2`, os três filtros da `v3`. O render só desenha o `data.ts`, então o que se diz deles é leitura do código.
* **Não testado:** os dois consertos sugeridos abaixo. Os números deles são conta sobre a fonte, não render.

## `v1_ocorrencias-de-concorrente`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 15; ESP-3, ROT-9 e seção 14.1 (ilegibilidade)

**A geometria do cartão.** O canvas é de 640 x 600 e o corpo mede 574 px de largura (de 33 a 607 px). A coluna do termo é `auto` e toma a largura de `Concorrente` em peso 600, 73,4 px. Sobram 250,3 px para cada coluna de `1fr`, e 242,5 px de texto depois do `pr-2` ou do `pl-2`. Nas linhas que cabem, a tinta do contexto esquerdo termina em 274,5 px, a do termo vai de 285,0 a 354,5 px e a do contexto direito começa em 365,0 px: 10,5 px de vão de cada lado.

**O que o código pede.** `Chart.tsx:19` e `20`:

```
/** Limite de caracteres de cada contexto: cabe na coluna de 1fr do canvas (cerca de 450 px a 12 px) com folga de uma palavra. */
const CONTEXT_MAX_CHARS = 44;
```

A coluna tem 250 px, e não 450. E o limite não conta a reticência: as linhas 54 e 57 somam `… ` depois do corte, então o contexto chega a 46 caracteres. Pela régua do próprio README (6,4 px por caractere), 44 caracteres pedem 281,6 px.

**Contexto esquerdo sobre o termo.** `Chart.tsx:101` usa `whitespace-nowrap` com `text-right`. Linha que não cabe na caixa deixa de ser alinhada à direita: ela começa na borda esquerda do corpo (tinta a partir de 34,0 px) e transborda pelo fim, isto é, por cima do termo.

| Linha | Anotação | Contexto esquerdo | Caracteres | Largura | O que se vê nos dois temas |
|---|---|---|---|---|---|
| 3 | `perda-03` | `… vezes, o comprador avisou que fechou com o` | 44 | 258,1 px | o `o` final cai sobre o `c` do termo, cerca de 4 px: lê-se `com oconcorrente` |
| 5 | `perda-05` | `… a compra e comparou nossa proposta com a do` | 45 | 270,1 px | o `do` cai inteiro sobre `co`, cerca de 15 px: a palavra some |
| 15 | `perda-15` | `… condições, mas já tinha pedido orçamento ao` | 45 | 260,0 px | o `o` de `ao` cai sobre o `c`, cerca de 5 px: lê-se `orçamento aconcorrente` |
| 7 | `perda-07` | `Pediu desconto de 8% para cobrir a oferta do` | 44 | 247,7 px | não toca o termo, mas o vão cai de 10,5 para 6,5 px |
| 11 | `perda-11` | `… nosso prazo de pagamento curto frente ao` | 42 | 245,8 px | não toca o termo; vão de 9 px |

Na medição de tinta, as linhas 3 e 5 não têm vão nenhum entre o contexto e o termo, e a linha 15 é um segmento só, de 34,0 a 358,0 px. O PNG da página viva mostra o mesmo, então não é artefato do serializador do SVG.

**Contexto direito cortado na borda.** `Chart.tsx:95` põe `overflow-hidden` na grade, e o que passa de 607 px some sem marca. A tinta bate na borda (606,5 px) nas linhas 1, 2, 9 e 13.

| Linha | Anotação | Contexto direito | Caracteres | Largura | O que se vê nos dois temas |
|---|---|---|---|---|---|
| 1 | `perda-01` | `porque o prazo de entrega era menor em cinco …` | 46 | 267,0 px | termina em `cin`, com a letra partida |
| 2 | `perda-02` | `ofereceu entrada reduzida e parcelamento sem …` | 46 | 272,6 px | termina em `s` |
| 13 | `perda-13` | `apresentou um modelo equivalente em estoque.` | 44 | 267,2 px | termina em `esto`; o texto nem foi cortado por palavras, então não há reticência a mostrar |
| 8 | `perda-08` | `entregou a proposta em dois dias, e a nossa …` | 45 | 251,7 px | a reticência some inteira: a frase parece acabar em `e a nossa` |
| 16 | `perda-16` | `aceita o usado na troca por um valor melhor …` | 45 | 250,1 px | a reticência some; sobra um vestígio de ponto na borda |
| 9 | `perda-09` | `só vence em março, então o cliente prefere …` | 44 | 248,4 px | reticência pela metade |
| 19 | `perda-19` | `incluiu o seguro no primeiro ano sem custo …` | 44 | 245,9 px | reticência pela metade |

**Por que bloqueia.** A seção 14.1 separa a constante sem consequência da que aparece no render, e esta aparece: sobreposição em 3 linhas e corte em 7, metade do cartão. A ROT-9 descreve o caso literal, a tinta de um texto encostando na de outro até os dois deixarem de ser dois, e aqui o texto coberto é a palavra imediatamente anterior ao termo. A ESP-3 pede que nada encoste na borda do corpo. E há um efeito de honestidade na citação: sem a reticência, as linhas 8 e 16 mostram como fim da anotação um ponto que não é o fim. A versão também deixa de demonstrar o segundo item do catálogo, porque nas três linhas em que o corte pelo começo trabalha no limite ele entrega o termo coberto.

**O que mudar.** O critério de aceite é o desenho, e não o número: nos dois PNGs, todo contexto esquerdo termina a pelo menos 8 px da tinta do termo, nenhum contexto direito chega à borda do corpo, e todo contexto cortado mostra a reticência inteira. Dois caminhos fecham a conta, e o corretor escolhe um:

* **Manter o canvas de 640 e baixar o limite.** Com `CONTEXT_MAX_CHARS = 36` o maior contexto do dado padrão mede 225,5 px, 17 px abaixo dos 242,5 px da caixa; com 38 mede 234,1 px e a folga cai para 8 px. O limite precisa contar os 2 caracteres da reticência, ou ficar 2 abaixo do que a coluna aguenta.
* **Manter os 44 caracteres e alargar o canvas.** O corpo precisa de 2 x (272,6 + 8) + 73,4 = 634,6 px, e a moldura lateral soma 66 px: canvas de 701 px de largura no mínimo, 720 px com folga. Continua declarado por número, com a conta de largura somada à de altura no `notes`.

Nos dois caminhos: corrigir o comentário de `Chart.tsx:19`, que hoje promete 450 px, com a largura medida; e atualizar o `notes` do `meta.json`, que só traz a conta de altura. Sugestão que não é exigência: fazer a célula esquerda cortar o próprio excesso pelo lado de fora (por exemplo `flex justify-end` com `overflow-hidden` na célula), para que uma anotação futura mais larga perca o começo do contexto em vez de cobrir o termo. O `dir="rtl"` continua proibido pelo README do modelo.

**O que não mudar.** A `perda-03`, a anotação longa, fica no `data.ts`: ela é o caso difícil da versão e precisa continuar mostrando o corte pelo começo com reticência. Não vale encurtar as anotações para caber, nem reduzir a fonte: o contexto fica em 12 px. O resto da `v1` passa e não pede toque: grade de três colunas, termo em peso 600 e `--text-primary`, pontuação colada ao termo fora do destaque (linhas 7, 11, 15 e 20), marcador `início` na linha 2, cabeçalho das colunas, vazio com `role="status"`, frase acessível de 186 caracteres, 20 linhas inteiras na altura de 600 px.

**Não mexer nas outras três nesta rodada.** `v2`, `v3` e `v4` usam o mesmo `cutByWords` e estão aprovadas: a `v3` tem 64 px de folga mínima, a `v4` não chega ao corte, e a `v2` tem uma linha que entra 6 px no respiro da coluna vizinha sem consequência visível (observação no README). Editar o `Chart.tsx` delas envelhece o veredito.

### Registro da `v1`

```
Versão: 21_texto-e-nuvem-de-palavras/03_concordancia-kwic/v1_ocorrencias-de-concorrente
Data: 2026-10-13
Resultado: reprovada
Não: 15
Correções:
  15. ESP-3 e ROT-9: fazer o contexto caber na coluna medida (limite de até 36 caracteres com a reticência contada, ou canvas de 720 px), sem tinta sobre o termo e sem corte na borda, e corrigir o comentário de 450 px e o notes.
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

## As três aprovadas

Nenhuma tem bloqueante. O que foi conferido em cada uma, para o corretor saber o que já está de pé:

* **`v2_ordenado-pelo-contexto-direito`.** Seis grupos na ordem da chave sem acento (`cobriu`, `entregou`, `ja`, `mais`, `ofereceu`, `tem`), com 1, 2, 3, 4, 3 e 2 ocorrências, somando as 15 do `data.ts`; `ja` e `já` caem no mesmo grupo. Vão de 9,5 px entre contexto e termo nas 15 linhas, contagem alinhada à direita em `tabular-nums` com o substantivo flexionado, grupos separados por 10 px a mais de espaço e sem divisória. Opção ativa do seletor marcada por peso, fundo e `aria-pressed`; inativa a 9,36:1 e 7,04:1.
* **`v3_concordancia-com-desfecho-e-executivo`.** As 40 linhas aparecem inteiras no canvas de 960 x 1040 (última linha em 935,5 px, rodapé em 994,5 px). 10 ganhas, 22 perdidas e 8 abertas no preview; 612, 1.184 e 204 nas opções, somando 2.000. Desfecho com três ícones de forma diferente e a palavra ao lado, ícones a 7,36:1 e 5,34:1 (ganha) e 5,50:1 e 6,36:1 (perdida). Data por `formatDate` em `font-display tabular-nums`. Contagem das opções a 5,98:1 e 4,65:1 sobre `--surface-sunken`. Com filtro, o rodapé passa a dizer `Primeiras 10 de 612`, o que confere: as ganhas entre as 40 mais recentes são as 10 ganhas mais recentes.
* **`v4_termo-na-borda-e-sem-ocorrencia`.** Cinco ocorrências de `preço` em 7 anotações, grafias `preço` e `preco` agrupadas e exibidas como escritas; vírgula e aspas coladas ao termo e fora do destaque; `início da anotação` e `fim da anotação` em `--text-muted` (5,21:1 e 5,37:1) sem colapsar a coluna; `desconto` troca a grade por `role="status"` com a base escrita (`Nenhuma das 7 anotações`).

```
Versão: 21_texto-e-nuvem-de-palavras/03_concordancia-kwic/v2_ordenado-pelo-contexto-direito
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31, 32

Versão: 21_texto-e-nuvem-de-palavras/03_concordancia-kwic/v3_concordancia-com-desfecho-e-executivo
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31, 32

Versão: 21_texto-e-nuvem-de-palavras/03_concordancia-kwic/v4_termo-na-borda-e-sem-ocorrencia
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

## Pesado e não reprovado

* **`v3`, ANO-6 e pergunta 17.** O rodapé termina em `O resto do recorte entra ao colar no Farol, com filtro e virtualização` e a frase acessível em `o resto do recorte fica fora do preview`. São frases para quem cola, e não para quem lê o painel, e nenhuma outra versão do acervo escreve isso na tela. Ficou como observação porque é redação, não afirma nada falso no preview, e a primeira frase do rodapé cumpre sozinha o que o catálogo pede. Se a `v3` for tocada por outro motivo, cortar as duas.
* **`v2`, opções do seletor que caem num grupo só.** `Termo` é constante por construção e `Contexto esquerdo` é constante com o dado padrão; nos dois a frase acessível escreve `1 sentidos`. Ficou como observação porque o preview padrão demonstra os quatro itens do catálogo e o defeito é de redação e de dado, em estado que o render não desenha.

## Régua e ferramenta

* **AGREGACAO-ZERO acusa `kept.length > 0 ? 1 : 0` nas quatro versões.** É o incremento do espaço entre palavras dentro do `cutByWords`, não o ramo de lista vazia de uma agregação. Os 4 avisos do `check` deste modelo são esse falso positivo.
* **FORMATO-ACESSIVEL não mede a `v3` (`frase_sem_formatador`),** embora a frase use `formatInt`: o formatador entra pela variável `scope`, que a guarda não segue.
* **Nenhuma guarda mede colisão em `texto_em_html`.** A `v1` passou com 0 erro tendo texto sobre texto em 3 linhas. A abordagem `html-tailwind` inteira depende de medição à mão neste ponto.
