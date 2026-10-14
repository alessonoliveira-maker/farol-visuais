# Área quadrada proporcional

## O que é

Quadrados de grade com a mesma célula e totais diferentes: o lado cresce com a raiz quadrada do total (`Math.ceil(Math.sqrt(células))`), então a área acompanha o valor e magnitudes distantes cabem lado a lado em pouco espaço. A célula é a unidade declarada (1 célula = 5 leads, 1 célula = R$ 10 mil), de modo que o leitor ainda pode contar, e a comparação de área, que é aproximada, fica ancorada no número exato escrito sob cada quadrado. Os quadrados ficam alinhados pela base e a linha incompleta fica no topo. Feito em HTML com Tailwind, com `gridTemplateColumns` calculado do lado e posição explícita por célula, sem Recharts.

## Quando usar

- De 2 a 4 totais na mesma unidade com magnitudes diferentes, até cerca de 100 vezes (v1 e v3).
- Etapas de funil ou custo contra receita para diretoria, com o número sempre escrito.
- Parte de um total acesa dentro do próprio quadrado, como leads que viraram oportunidade (v2).
- Até cerca de 400 células na peça inteira; a v1 desenha 307 e a v3 desenha 441 em dois quadrados, que é o teto prático para `div`.

## Quando evitar

- Razão de 100 vezes ou mais: o menor vira uma célula; número com barra (13/01 ou 01). A v4 faz essa troca no próprio componente.
- Taxa de passo entre etapas como pergunta principal: funil em barras (10/01).
- Comparação precisa entre totais parecidos: barras horizontais ordenadas (02/01).
- Valor negativo ou saldo: área não tem sinal; cascata (19). A v4 deixa o saldo fora do desenho.
- Totais de unidades diferentes no mesmo quadro: separar as peças ou normalizar antes.

## Anatomia

1. **Célula:** `span` quadrado de lado constante (`CELL`) e vão constante (`GAP`), raio de 1 a 2 px. O passo é o mesmo em todos os quadrados, para o respiro não distorcer a área (GEO-16).
2. **Lado e linhas:** `Math.ceil(Math.sqrt(células))` colunas e `Math.ceil(células / lado)` linhas; `gridTemplateColumns` e `gridTemplateRows` explícitos em px.
3. **Posição:** função pura `place(índice, células, lado)` devolve linha, coluna e ordem de preenchimento. A linha de cima é a incompleta, alinhada à esquerda, e o preenchimento sobe a partir do canto inferior esquerdo.
4. **Células:** inteiro mais próximo de `total / unidade`; total positivo que arredonda para zero fica sem célula e diz "menos de 1 célula".
5. **Alinhamento pela base:** grade de duas linhas, quadrados em `self-end` e texto em `self-start`.
6. **Número exato:** `formatInt` ou `formatCurrencyCompact` sob cada quadrado, com a contagem de células.
7. **Legenda de unidade:** "1 célula = N" sempre visível, com o arredondamento declarado.
8. **Estados:** vazio com `role="status"` e `Filter`; total indisponível com `Unplug` e `formatUnavailable()`; saldo negativo com sinal tipográfico e fora da área.
9. **Frase acessível:** `role="img"` na raiz, calculada do dado, com as células em `aria-hidden`.

## Versões

- `v1_funil-do-semestre-em-celulas`: 1.284 leads em 257 células, 212 oportunidades em 42 e 38 vitórias em 8, alinhados pela base, com a unidade e o arredondamento declarados. Canvas `card`.
- `v2_leads-que-viraram-oportunidade`: um quadrado de 257 células com 42 acesas a partir do canto inferior, taxa 16,5% (212 de 1.284) e anotação ligada ao bloco aceso, sem legenda separada. Canvas `quadrado`.
- `v3_custo-e-receita-do-trimestre`: custo em 193 células contra receita em 248, com a folga de 55 células acesa no quadrado da receita e a procedência em etiqueta. Canvas `card`.
- `v4_quando-a-area-deixa-de-servir`: razão máxima de 100 checada no componente; o total 200 vezes menor passa a número com barra, o saldo negativo sai do desenho e o total indisponível escreve o rótulo de ausência. Canvas `card`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e passe o dado real pela prop `data`.
2. Passe a unidade (`unit`) junto do dado: a legenda e a frase acessível a leem dali, e mudar a unidade muda o número de células.
3. Confira o corpo do cartão: os quadrados têm tamanho fixo em px (`CELL`, `GAP`) e a v1, a v3 e a v4 pedem cerca de 574 x 241 px. Em cartão menor reduza `CELL` em passos de 2 px.
4. A v3 desenha a etiqueta de procedência dentro do Chart, porque o catálogo a pede; se o `VisualCard` já a desenha, apague as duas etiquetas (ANO-6).
5. Os estados vazio e indisponível estão inline; ao colar, troque por `EmptyState` e `UnavailableState` do Farol, mantendo o texto.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/` e confira os dois temas.

## Referências

- Estudo da família: `_estudo/familias/22_unidades-waffle-e-pictograma.md`.
- Técnica de grade em `div` com `grid-rows` explícito: `22_unidades-waffle-e-pictograma/01_waffle/v1_leads-com-telefone-valido`.
- Piso de área e respiro proporcional: GEO-16 em `ARMADILHAS.md`.
- Pedido ao dono: o catálogo manda o restante do quadrado da v2 em `--surface-overlay`, que no tema claro é o mesmo branco do cartão; a peça usa `--surface-sunken` com contorno `--line-strong`.

## Observações da revisão (não bloqueantes)

**2026-10-13, revisão independente das quatro versões.** `v1`, `v3` e `v4` aprovadas; `v2` reprovada por um bloqueante na frase acessível, descrito em `validation/revisao_22_unidades-waffle-e-pictograma__05_area-quadrada-proporcional_2026-10-13.md`. Nenhum item abaixo reprova.

- `v1`: a legenda "1 célula = 5 por etapa" e a frase acessível "1 célula valendo 5" deixam a contagem sem substantivo (NUM-6). O catálogo escreve do mesmo jeito e o nome está sob cada quadrado; "1 célula = 5 registros da etapa" fecha a leitura.
- `v1`: cerca de 140 px dos 574 px de largura do corpo ficam vazios à direita, porque os três quadrados encostam à esquerda. Sem corte nem colisão.
- `v2`: o colchete do bloco aceso cobre 3 linhas (51 células) e a terceira tem 9 apagadas encostadas nele; o colchete do resto cobre 206 das 215 apagadas. Declarado no `notes`, e os números escritos são os exatos.
- `v2`: cerca de 70 px vazios entre o cabeçalho e o quadrado no canvas `quadrado`; canvas por número fecharia o cartão (GEO-1).
- `v2`: dois ramos sem rótulo, fora do dado padrão. A anotação do aceso some quando as oportunidades arredondam para 0 células, e a do resto some quando o resto não ocupa uma linha inteira (`litRows > 0` e `restRows > 0`). Nos dois a parte fica sem nome na tela (ROT-10) e a célula neutra perde a isenção do valor escrito.
- `v2`: o período só chega à frase acessível; a tela diz "do semestre" sem dizer qual (DAD-9).
- `v2`: o resto em `--surface-sunken` com contorno `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro e vale pela isenção do valor escrito ao lado (17.2). O desvio do catálogo está certo: `--surface-overlay` mede 1,00:1 no claro (TOK-1). Quem precisa de emenda é o catálogo.
- `v3`: dentro do quadrado da receita, a folga em `--chart-1` contra o coberto em `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro, e em deuteranopia a distância cai para delta E76 de 4,2 no claro (19,0 no escuro), o mesmo valor do par 2 e 6 da COR-8. O segundo canal existe, que é o colchete com rótulo em peso 700, e por isso não bloqueia. Falta o par medido no `notes` (TOK-9), e um canal de forma, como a célula vazada da `v2`, tiraria a dependência da cor; as duas amostras da legenda também ficam iguais nesse caso.
- `v3`: etiquetas MEDIDO e DERIVADO desenhadas no Chart com `frame: card` (ANO-6, perguntas 17 e 25 com ressalva). O catálogo pede, são duas procedências no mesmo cartão e o desvio está declarado; mesmo tratamento de `25/04`, `25/05` e `25/07`.
- `v3`: os valores sob os quadrados (R$ 1,9 mi e R$ 2,5 mi) são mais grossos que a contagem de células (193 e 248) e não fecham com a folga impressa: a diferença aparente é R$ 0,6 mi e o cartão escreve R$ 546,6 mil. É a precisão do `formatCurrencyCompact` (NUM-1), não erro de conta.
- `v3`: o `useCase` do `meta.json` saiu sem o trecho "na mesma unidade" que o catálogo traz.
- `v3`: o período só chega à frase acessível; a tela diz "do trimestre" (DAD-9).
- `v3` e `v4`: a legenda da unidade sai como "R$ 10,0 mil", pelo formatador, e o título da `v3` diz "R$ 10 mil".
- `v4`: a barra do total 200 vezes menor tem trilho de 8 px e preenchimento de 6 px, abaixo do piso de 12 px da ESP-2, e largura no piso de 2 px, que é 1,4% do trilho para um valor de 0,5%. O piso está no `notes`, a lasca se vê nos dois temas (8,47:1 e 4,67:1 contra o trilho) e o número exato está escrito.
- `v4`: dois textos com algarismo sem `tabular-nums` (TIP-1): a linha de leitura ("200 para um", "limite de 100") e "200 vezes menor que o maior total".
- `v4`: três cores categóricas (`--chart-1`, `--chart-3` e `--chart-6`) em marcas que já têm rótulo direto; uma cor só bastaria (COR-1). O `data.ts` reserva o slot 2 para um total num corpo que pinta `--negative`, o que a COR-8 veda; hoje não aparece porque esse total é nulo.
- `v4`: a frase acessível não traz nenhum valor em reais: diz células, "negativo" e "em barra". O saldo de −R$ 380,0 mil e os R$ 10,2 mil de reembolsos só existem na tela. O campo `period` do `data.ts` não é usado na tela nem na frase.
- `v4`: as notas das exceções quebram com uma palavra órfã ("total", "sinal"), e "200 vezes menor" aparece duas vezes, na linha de leitura e na linha da exceção.
- `v4`: a amostra da legenda da unidade é vazada, que é a forma da ausência na ROT-4 e na 17.2.
- As quatro: CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA não medem (`texto_em_html`) e foram cobertas à mão. Texto de 5,21:1 para cima nos dois temas, nenhum par de textos encostado, e a diferença entre preview e página ficou entre 0,01% e 0,11%.

**2026-10-13, segunda revisão independente da `v2`, sobre o `Chart.tsx` alterado às 06:41.** Aprovada, sem bloqueante. O bloqueante da primeira revisão saiu: a frase acessível agora diz "Quadrado de 257 células, cada uma vale 5 leads, para 1.284 leads do 1º semestre de 2026", com 184 caracteres e uma unidade só. `data.ts` e `meta.json` não mudaram. Os itens da `v2` do parágrafo acima seguem valendo no arquivo de hoje; abaixo, o que foi remedido e o que é novo. Nenhum item reprova.

- `v2`: remedido nos dois previews. 257 células, 42 acesas (17, 17 e 8 a partir do canto inferior esquerdo) e 215 apagadas; textos de 5,21:1 para cima no escuro e de 5,37:1 para cima no claro; célula acesa a 9,50:1 e 6,00:1; colchete do resto a 5,21:1 e 5,37:1 e colchete do aceso a 9,50:1 e 6,00:1; célula apagada a 1,79:1 e 1,83:1, que vale pela isenção do valor escrito ao lado; preview contra página com 0,14% de pixels com qualquer diferença, igual nos dois temas.
- `v2`: o colchete do aceso mede 40 px (linhas 14 a 16) e a linha 14 tem 9 células apagadas encostadas nele; o do resto mede 180 px (13 linhas, 206 das 215 apagadas). Lido pela altura, o colchete do aceso daria cerca de 18% em vez de 16,5%. Não bloqueia porque o colchete é a ligação do rótulo, não a marca: a contagem de células está certa, as apagadas se distinguem pela forma vazada e o número exato está escrito. Segue declarado no `notes`.
- `v2`, novo, leitura do código sem render: com 1 a 17 células acesas (até 87 de 1.284 leads, 6,8%), a anotação do aceso tem 36 px de texto num colchete de 12 px (`rowsHeight(1)`). O texto sobra 12 px para cima e 12 px para baixo e consome o vão inteiro até a legenda da unidade. Com 18 a 34 células sobram 5 px de cada lado. Taxa abaixo de 7% é comum em dado real; altura mínima igual à do texto resolve.
- `v2`, novo, leitura do código sem render: total positivo que arredonda para 0 células deixa a tela com "0 células no quadrado", sem quadrado e sem nenhuma das duas anotações. A Anatomia deste README promete "menos de 1 célula", e só a `v1` escreve.
- `v2`: "do semestre" está fixo no JSX (linha 81) e a frase acessível usa `data.period`. Hoje a tela só não diz qual semestre (DAD-9); com outro período no dado, tela e frase passam a se contradizer. Escrever o `data.period` na tela resolve os dois.
- `v2`: a sobra de altura mede 57,5 px (corpo de 355,5 px para 298 px de conteúdo). Pela GEO-1, peça que cabe num preset com sobra declara o nome do preset, então `quadrado` está certo; é acabamento e não pede canvas por número.
- `v2`: plural fixo em "células no quadrado" e em "1 célula = N leads", que saem errados com 1 célula ou com unidade 1. Fora do dado padrão.
- `v2`: no `notes`, "então passa de 9 células apagadas" lê mal; "passa ao lado de 9 células apagadas" diz o que o desenho faz. O segundo item de `demonstrates` segue diferente do catálogo (`--surface-sunken` com contorno no lugar de `--surface-overlay`), pela saída da TOK-1; a emenda continua sendo do catálogo.
