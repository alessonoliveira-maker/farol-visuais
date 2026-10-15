# Revisão de 12_hierarquia/06_icicle, 2026-10-14

| Versão | Motivo | Resultado |
|---|---|---|
| `v2_ramo-concorrencia-ampliado` | sem_revisao | **reprovada** |
| `v3_investimento-da-plataforma-ao-criativo` | sem_revisao | aprovada |
| `v4_submotivos-com-rotulos-longos` | sem_revisao | aprovada |

`npm run check -- 12_hierarquia/06_icicle`: 0 com erro, 1 aviso (AGREGACAO-ZERO na `v1`, que não
estava em julgamento). PNGs de 2026-10-02, mais novos que os três `Chart.tsx` de 2026-09-29.
Observações não bloqueantes das três versões estão no README do modelo, parágrafo de 2026-10-14.

## `v2_ramo-concorrencia-ampliado`: reprovada

O estado que o preview fotografa, Concorrência ampliada, está certo e não precisa mudar. O defeito
está no outro estado da mesma versão, a raiz, e ele não é caminho latente: a `v2` anuncia no
`demonstrates` "Clique no ancestral volta um nível; tecla Escape volta à raiz", e os dois gestos
levam ao mesmo lugar, porque o único ancestral do ramo aberto é a raiz. É o critério já usado em
`revisao_01_cards-e-kpis__07_grade-e-tira-de-kpis_2026-10-02.md` e em
`revisao_06_pizza__02_pizza-com-detalhamento-de-outros_2026-10-14.md`: estado a um gesto de
distância, nomeado no `demonstrates`, é julgado como o preview.

### Como a raiz foi medida

O preview não fotografa a raiz, então a medida veio do código: as funções `partitionSpan`,
`wrapLabel` e `fitLabel` da `v2`, com as mesmas constantes (`VIEW_W` 574, `VIEW_H` 408,
`CONTENT_TOP` 74, `COLUMN_GAP` 10, `LABEL_MIN_HEIGHT` 48, duas linhas no máximo, tabela
`MANROPE_EM`), rodadas sobre o `data.ts` da versão com `path = []`. A lista foi medida pelas
classes do próprio JSX: grade de 2 colunas com `gap-x-4` e `gap-y-1`, item `grid-cols-[1fr_72px]`
com `gap-x-2` (coluna de texto de 199 px), 11 px com `leading-snug` (15,1 px por linha), `mt-2` e o
cabeçalho com `mb-1`. Corpo do canvas `alto`: 441,5 px, menos 24 px da linha de leitura.

### Bloqueante 1. Perguntas 10 e 15, regra TIP-2 (armadilha GEO-18): a raiz encolhe o desenho

**Evidência.** Na raiz, as três colunas medem 184,7 px e a altura útil é 334 px para 164 perdas.
**20 dos 25 nós ficam sem rótulo**: 1 categoria (Timing da decisão), 5 motivos e os 14
submotivos. A lista de identificação vira 10 fileiras.

* Limite inferior, como se todo item coubesse numa linha: lista de 214,4 px, sobram 203,1 px para
  um `viewBox` de 408, escala **0,50**, e o texto de 12 px sai a **6,0 px**, o de 11 px a 5,5 px.
* Com a quebra que a coluna de 199 px impõe (em toda fileira algum item quebra em duas linhas, e
  duas fileiras pedem três), a lista chega a cerca de 396 px, sobram cerca de 22 px para o `svg`,
  escala de 0,05: o icicle vira uma tira e a lista ocupa o corpo inteiro.

Em qualquer dos dois números o desenho fica abaixo do piso de 11 px, que é o mesmo defeito que
reprovou a `v1` na terceira rodada de 2026-09-20. A `v1` resolveu a mesma raiz com um canvas de
640x1000; a `v2` volta a ela num canvas de 640x560. Além disso, a raiz deixa vazio o espaço de 26 px
da faixa de ramo que não existe mais (`HEADER_BASELINE_Y` fixo em 66).

**Por que bloqueia.** Ilegibilidade e versão que não demonstra o que o catálogo diz estão na lista da
14.1 que bloqueia sempre: o gesto que a versão anuncia leva a um desenho que não se lê.

### Bloqueante 2. Pergunta 9, regra COR-3: a cor da categoria muda com o estado

**Evidência.** Em `resolveZoom`, `slot` nasce em 1 e só muda quando o caminho desce a uma categoria.
Na raiz o caminho é vazio, então o nível 0 inteiro recebe `slotColor(zoom.slot)`, isto é,
`--chart-1`, nas quatro categorias. Ampliada, Concorrência sai em `--chart-3` (slot 3 do `data.ts`,
conferido no PNG: contorno `#7c9cf8` no escuro e `#2b5bc4` no claro). Apertar Escape repinta a
mesma categoria de azul para ciano, e Sem perfil financeiro, Sem contato e Timing da decisão perdem
os slots 1, 6 e 5 que o `data.ts` declara para elas.

**Por que bloqueia.** Papel de cor está na lista da 14.1 que bloqueia sempre. A COR-3 diz que a cor
pertence à categoria, por um mapa fixo vindo do dado, justamente para que mudar o recorte nunca
troque a cor; aqui o recorte troca.

### O que mudar

1. **A raiz precisa caber.** A escolha do caminho é do produtor; o critério de aceite é este:
   renderizada com `zoomedPath = []`, a raiz sai com o `svg` em escala 1 (largura do `viewBox`
   igual à do corpo e altura sobrando), nenhum texto abaixo de 11 px e a lista dentro do corpo. Dois
   caminhos possíveis: desenhar na raiz só os dois primeiros níveis (categoria e motivo) e deixar o
   submotivo para a ampliação, o que pede clique no nó de conteúdo para abrir o ramo e de quebra
   desfaz a mão única registrada nas observações; ou dimensionar o canvas pela raiz, como a `v1`
   fez com 640x1000, e conferir que a ampliação continua em escala 1 nele.
2. **Cor por slot da categoria nos dois estados.** Na raiz, o contorno de cada categoria usa o
   `slot` dela; ampliado, o ramo usa o mesmo slot. Concorrência é `--chart-3` em qualquer estado.
3. **Se a raiz continuar com lista, a lista carrega o nível** (ROT-10, precisão de 2026-09-20). A
   lista de hoje é plana, em `pai: filho`, e na raiz mistura categoria, motivo e submotivo na mesma
   coluna de valores, na ordem por nível: "Timing da decisão 20" abre a lista e os filhos do motivo
   dela, 13 e 7, fecham. O formato `pai › filho` é aceito pela regra, mas o bloco por motivo com
   recuo da `v1` (`buildMutedGroups`) lê melhor e já foi aprovado.
4. **Conferir os dois estados.** Trocar temporariamente `zoomedPath` para `[]` no `data.ts`,
   rodar `npm run render -- 12_hierarquia/06_icicle --tema ambos`, olhar os dois PNGs da raiz,
   voltar `zoomedPath` para `['concorrencia']`, renderizar de novo e rodar `npm run check`.

### O que não mudar

A partição com recuo proporcional (`GAP_FRACTION`), a trilha com posição e percentual, o `zoomedPath`
no `data.ts`, a largura de rótulo por soma de glifo, a frase acessível, a linha de leitura e o
estado vazio. Conferidos no preview e no código, estão certos: 29 + 18 = 47 e 19 + 10 + 11 + 7 = 47,
alturas medidas no PNG dentro de 1 px da conta, os seis nós rotulados, escala 1 (`viewBox` 574x408
num `svg` de 574x417,5) e frase de 192 caracteres começando pelo tipo.

## `v3` e `v4`: aprovadas

Sem bloqueante. Conferido à mão o que as guardas não medem: na `v3`, a `OPACIDADE-MARCA` não lê a
opacidade calculada por profundidade, e a cor composta contra o cartão mede no mínimo 3,04:1
(`--text-muted` a 0,72 no claro) e 3,08:1 (`--chart-6` a 0,72 no claro); na `v4`, o contorno por
slot mede de 4,67:1 a 10,90:1 contra `--surface-sunken` nos dois temas. As somas por nível fecham nas
duas, e toda parte tem nome e número sem interação. Os pontos menores estão no README.

---

# Segunda leitura, 2026-10-14: `v2` depois da rodada de correção

| Versão | Motivo | Resultado |
|---|---|---|
| `v2_ramo-concorrencia-ampliado` | revisao_desatualizada | **reprovada** |

`npm run check -- 12_hierarquia/06_icicle`: 0 com erro, 1 aviso (AGREGACAO-ZERO na `v1`, fora do
julgamento). PNGs gravados às 16:04, depois do `Chart.tsx` das 16:03, sem arquivo de diferença.

## O que a correção resolveu

* **COR-3 (bloqueante 2 da primeira leitura): resolvido.** Na raiz cada categoria leva o slot dela
  (`categorySlot`), e Concorrência sai em `--chart-3` nos dois estados. Medido no render da raiz:
  contornos de 5,90:1 a 9,50:1 contra o cartão e de 6,77:1 a 10,90:1 contra `--surface-sunken` no
  escuro; de 5,39:1 a 6,25:1 e de 4,67:1 a 5,41:1 no claro. Os marcadores da lista usam o mesmo slot.
* **Lista com nível preservado: resolvida.** Bloco por categoria, motivo como cabeçalho, submotivo
  recuado. Somas conferidas: motivos, 152 rotulados mais 12 na lista, 164; submotivos, 58 rotulados
  mais 106 na lista, 164. Nenhum dos 25 nós fica sem nome e número.
* **A raiz ficou perto de caber:** de escala 0,50 para 0,984. Falta o último passo, abaixo.
* **Estado ampliado (o preview):** escala 1 (`viewBox` 574 x 857 numa caixa de 574 x 857,5), seis nós
  rotulados, 29 + 18 = 47 e 19 + 10 + 11 + 7 = 47, frase de 191 caracteres começando pelo tipo.

## Como a raiz foi medida desta vez

Renderizada, e não só calculada. `Chart.tsx` e `data.ts` copiados para um diretório de rascunho fora
do catálogo, com `zoomedPath = []` na cópia; empacotados pelo `buildBundle` da própria ferramenta e
abertos no mesmo harness do `npm run render` (moldura `card`, 640x1000, escala de dispositivo 2, os
dois temas). O DOM serializado por `__farol.serialize()` passou pelas guardas `guardaTamanhoTexto`,
`guardaColisaoTexto`, `guardaContrasteTexto` e `guardaTextoNaMarca` de `guardas.mjs`. Nada no
catálogo foi editado.

## Bloqueante. Pergunta 10 (e 21 no estado raiz), regra TIP-2, armadilha GEO-18

**Evidência.** Corpo de 881,5 px: linha de leitura 16 px mais `mb-2` 8 px; lista 259,25 px mais
`mt-2` 8 px; sobram **590,25 px** para o `svg`, cujo `viewBox` na raiz é 574 x **600**. A escala é
min(574/574; 590,25/600) = **0,984**, o desenho sai centrado com 4,7 px de folga de cada lado, e o
texto de 11 px chega à tela com **10,82 px** (o de 12 px, com 11,8). A guarda TAMANHO-TEXTO, rodada
sobre a raiz serializada, dá **erro**: "17 trecho(s) de texto saem abaixo do piso de 11 px da TIP-2.
"Todas as perdas comerciais" em 10.82 px [11 px declarados, encolhidos pela escala 0.98 do <svg>]
(svg, nos dois temas); "164 perdas" em 10.82 px [...]; "Categoria" em 10.82 px [...]". A mesma
escala tira a raiz do alcance da COLISAO-TEXTO, da CONTRASTE-TEXTO e da TEXTO-NA-MARCA, que voltam
`preview_com_escala` e não medem nada.

**Causa.** A conta do comentário de `VIEW_H_ROOT` e da nota do `meta.json`: "a lista toma cerca de
255 px, então o desenho tem 600". 857,5 menos 255 dá 602,5 e esquece o `mt-2` de 8 px; a lista
medida tem 259,25. A nota do `meta.json` ("ambos em escala 1, texto de 12 e 11 px chegando à tela
nesses tamanhos") e a entrada da `v2` no README ("desenho de 600 px em escala 1") afirmam o que a
raiz não cumpre.

**Por que bloqueia.** O critério de aceite da primeira leitura era a raiz em escala 1, com altura
sobrando e nenhum texto abaixo de 11 px, e a raiz continua julgada como o preview pelo mesmo motivo
de antes (Escape e o clique na trilha levam a ela, e o `demonstrates` anuncia os dois gestos). Nela, a
guarda que mede a TIP-2 dá erro: a versão não está na fila de dívida, e o filtro da guarda só perdoa
diferença de caixa abaixo de 1 px, que é ruído do serializador; aqui são 9,75 px, decididos por uma
constante. O piso da TIP-2 é número com medição atrás (14.1). A olho a diferença é pequena; o
conserto também é.

## O que mudar

1. **`VIEW_H_ROOT` de 600 para 590**, ou derivado da altura que o corpo de fato entrega ao `svg` na
   raiz. Medido na cópia de rascunho com 590 e nada mais mudado: `svg` de 574 x 590,25 para
   `viewBox` 574 x 590, escala 1, menor texto 11 px nos dois temas; TAMANHO-TEXTO sem erro;
   COLISAO-TEXTO medida, 595 pares, respiro mínimo 4,16 px; CONTRASTE-TEXTO e TEXTO-NA-MARCA
   medidas, pior par 4,65:1; os mesmos 13 nós rotulados (4 categorias, 6 motivos, 3 submotivos) e a
   mesma lista com os 12 mudos.
2. **Corrigir a conta escrita** no comentário de `VIEW_H_ROOT`, na nota do `meta.json` e na entrada
   da `v2` no README: 24 + 590,25 + 8 + 259,25 = 881,5, com a lista medida e a margem dela.
3. **Conferir a raiz renderizada**, não calculada: trocar `zoomedPath` para `[]` no `data.ts`, rodar
   `npm run render -- 12_hierarquia/06_icicle --tema ambos` e `npm run check -- 12_hierarquia/06_icicle`
   (a TAMANHO-TEXTO precisa sair sem erro com a raiz no preview), voltar `zoomedPath` para
   `['concorrencia']`, renderizar e checar de novo.

## O que não mudar

O contorno por slot nos dois estados, a lista com nível preservado, o canvas de 640x1000, o estado
ampliado (escala 1, seis rótulos, somas exatas), a partição com recuo proporcional, a trilha, o
estado vazio e a frase acessível do preview. Os pontos menores desta leitura estão no README do
modelo, no parágrafo "segunda leitura" de 2026-10-14.
