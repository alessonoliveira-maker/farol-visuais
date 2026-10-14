# Parecer de revisão: 23_mapas/03_simbolos-proporcionais

> Este arquivo tem duas passadas do mesmo dia. A que vale para o corretor é a **segunda**, logo abaixo, feita sobre as quatro versões já corrigidas. A primeira vem depois dela, como histórico: dos nove bloqueantes dela, oito fecharam e um fechou pela metade.

# Segunda passada, 2026-10-13: as quatro versões depois da correção

Revisor independente. Julgadas as quatro versões, todas em `revisao_desatualizada`, pelo arquivo de hoje (`Chart.tsx` de 13:07:56 a 13:13:30, `data.ts` de 12:06 a 12:15, `meta.json` de 12:18:59 e, na `v3`, de 13:13:57) e pelos PNGs de 13:14, posteriores a todos eles. A nota da primeira passada não serviu de régua; os critérios de aceite escritos nela foram reconferidos um a um, por medida nova. `npm run check` com tipos: 0 com erro, 0 avisos, antes e depois da edição do README.

Resultado: `v1`, `v2` e `v4` **aprovadas**; `v3` **reprovada, por um bloqueante**. As observações não bloqueantes das quatro estão no README do modelo, no parágrafo da segunda revisão.

## O que foi medido e o que não foi

* **Geometria:** lida do `preview.svg` de cada versão (centro, raio e traço de cada círculo, pontas de cada linha de chamada, âncora de cada texto), em px do `<svg>` do mapa. A geometria é a mesma no `preview-claro.svg` das quatro.
* **Distância a um círculo** é sempre até a tinta dele, raio mais meio traço. **Distância de rótulo** usa largura de texto estimada (de 6,6 a 7 px por caractere de 11 px), com erro da ordem de 1 px.
* **Cor:** os valores resolvidos dos tokens saíram dos dois previews, e o contraste foi calculado pela fórmula da WCAG.
* **`v2`, área do cheio:** cada pixel dos dois PNGs (escala 2) foi decomposto por mínimos quadrados em três tintas (cartão, anel e cheio), e a soma da fração de cheio foi comparada com π r².
* **`v3`, lugar para a sigla do Piauí:** busca em grade de 1 px por toda posição de caixa a até 60 px do círculo e nas faixas do topo e da base do painel, com as regras do próprio `placeLabels` (1 px de qualquer círculo, 4 px de outro rótulo, linha de chamada a 3 px de círculo alheio), e a linha testada a partir de todo o contorno do círculo, de 2 em 2 ou de 5 em 5 graus. Feita duas vezes: com a caixa de 16 por 16 px que o código reserva e com a de 13 por 12 px da tinta com halo.
* **`v4`, segundo canal:** os dois PNGs foram convertidos para tons de cinza e olhados.
* **Preview contra página**, medida minha com limiar de 24 por canal: 0,000% na `v1` e na `v4`, 0,03% na `v2` e de 0,07% a 0,08% na `v3`.
* **Refeito contra o `data.ts`:** o raio de cada círculo contra a raiz do valor sobre o máximo na `v3` (erro zero nos 54) e na `v4` (os 14 raios distintos, que a `RAIO-CONTRA-AREA` não mede por `valor_nao_casado`); na `v1` e na `v2` a guarda mediu e eu conferi por amostra. Totais, participações, contagens e percentuais escritos nas quatro batem.
* **Não renderizado:** o estado vazio das quatro, o ramo de `free` falso da `v1` e da `v4` (rótulo sem lugar cai no primeiro candidato) e o ramo de centros coincidentes da `v3`. Lidos no código.

## O que fechou da primeira passada

| Versão | Bloqueante de antes | Medida de hoje | Estado |
|---|---|---|---|
| `v1` | Ponta de linha de chamada dentro de círculo vizinho | SP: ponta em (152,76; 119,32), a 3,53 px da tinta de GO, e o trajeto nunca chega mais perto que isso. MG: ponta em (201,97; 111,14), a 5,44 px da tinta de ES, trajeto a 3,46 px no ponto mais próximo. Nenhum trecho sobre círculo alheio | Fechou |
| `v1` | Topo do maior círculo da legenda cortado | Caixa de 52 px para raio de 24 px; a tinta começa a 2,4 px do topo | Fechou |
| `v2` | Tracejado na cor do cartão comendo a área do cheio | Anel pintado antes do cheio nas 15 UFs abaixo da meta, só anel em TO, nenhum anel nas 11 que bateram. Área do cheio de −0,2% a +1,5% de π r² em 24 das 26 UFs com realizado, nos dois temas. As duas que saem são as menores: Amapá (raio de 1,80 px) mede +2,2% e Roraima (raio de 1,16 px) +11,7%, meio px² de quantização numa área de 4,2 px² | Fechou |
| `v2` | Topo do maior círculo da legenda cortado | Caixa de 38 px para raio de 18 px, sem traço; a tinta começa a 1 px do topo | Fechou |
| `v3` | SC em cima de SP nos dois painéis | Menor vão entre círculos: 9,38 px em 2025 (ES e SE) e 6,29 px em 2026 (DF e TO). Nenhum círculo fora do painel | Fechou |
| `v3` | MA, PI, AL e TO sem sigla nos dois painéis | 27 siglas de 27 em 2025; 26 de 27 em 2026, falta o Piauí | **Não fechou**: bloqueante 1 abaixo |
| `v3` | Legenda "Contorno escuro: perímetro", falsa no tema escuro e sem amostra | "Com aro: no perímetro" e "Sem aro: fora dele", cada uma com a amostra. O aro mede de 14,5:1 a 18,0:1 contra o cartão e contra o contorno do país, nos dois temas | Fechou |
| `v4` | Sinal de 19 das 24 UFs só na cor | Alta em círculo cheio, queda em anel vazado, zero em anel fino com o "0" escrito. Em tons de cinza o sinal das 24 lê nos dois temas, inclusive Tocantins (−1), anel de 3,1 px de raio com furo de 4,2 px | Fechou |
| `v4` | Ponta da linha de SP dentro do círculo de PR | SP: ponta a 3,81 px da tinta de GO, trajeto a 3,21 px de MT. PR: nenhum vizinho a menos de 6 px. SE: ponta no arco de baixo do anel, a 2,53 px da tinta de AL e a 3,53 px do eixo do traço dele, do lado oposto | Fechou |

## `v3_dorling-receita-2025-e-2026`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 12 e 18; seção 14.1, identificação das marcas; DIC-1

**O que se vê.** No painel de 2026 há um círculo azul com aro, entre DF, CE, PE e MG, sem nome. É o Piauí, que está dentro do perímetro. Em 2025 ele tem a sigla, mas a 17,6 px dali, porque cada painel é relaxado sozinho. No Dorling a posição é declarada aproximada, então a sigla é a única identificação, e sem ela a pergunta do caso de uso (como a receita por UF mudou de tamanho entre 2025 e 2026 dentro do perímetro) não se responde para essa UF com o desenho parado. O nome só existe no `<title>`, e a DIC-1 não deixa o essencial morar só na dica. Nada na tela avisa que falta uma sigla: a declaração está só no README, em Pendências conhecidas.

**Evidência.** `preview.svg`, segundo painel: 27 `<circle>` e 26 `<text>` de sigla. O círculo sem texto está em (240,26; 59,04), raio de 5,63 px, R$ 260 mil; no PNG fica em (1290; 378). Vãos até os vizinhos: CE 10,29 px, MG 10,57 px, DF 10,70 px, PE 11,95 px. O primeiro painel tem 27 de 27. O critério de aceite da primeira passada pedia 27 siglas em cada painel.

**Por que acontece.** O `placeLabels` reserva para cada sigla `item.uf.length * LABEL_CHAR_W`, que dá 16 px de largura, e `LABEL_ASCENT + LABEL_DESCENT`, que dá 16 px de altura (`Chart.tsx:57`, `174`, `175`, `281` e `329`). A tinta de "PI" em 11 px e peso 600 mede cerca de 10 px por 8 px, 13 por 12 com o halo: sigla em maiúscula não tem descendente. Com a caixa de 16 por 16 há 62 posições livres a até 60 px do círculo, nenhuma colada a ele e nenhuma alcançável por linha de chamada com os 3 px de folga da regra. Com a de 13 por 12 há 245 livres, e 22 delas servem: uma colada ao círculo, com o canto em (244; 65), logo abaixo e à direita, e 21 a uma linha curta dali. Os candidatos ao lado do círculo são só esquerda, direita, cima e baixo (linhas 238 a 250), e os de margem são só as colunas oeste e leste: a diagonal, onde está o bolsão entre PE e MG, não é tentada. Sem lugar, `free` fica falso e a linha 410 não desenha nada.

**O que mudar.** Duas saídas, da mais barata à mais completa, e uma exigência que vale para as duas.

1. Medir a caixa pela tinta real (largura pelo texto, 8 px acima da linha de base e zero abaixo, mais 1,5 px de halo por lado) e incluir as quatro diagonais entre os candidatos ao lado do círculo. Cabe, mas apertado: a posição mais próxima fica a 0,7 px da tinta do Piauí e a 0,7 px da de Minas Gerais; a 6 px do Piauí, com o canto em (249; 68), há outra com 2 px de folga, que pede uma linha de chamada curta.
2. Relaxar uma vez só, com o maior raio dos dois anos por UF, e posicionar os rótulos uma vez só. Cada UF passa a ficar no mesmo lugar nos dois painéis, o que também fecha a observação do README sobre MS, ES, PR e TO mudarem de lugar de um ano para o outro, e o problema vira um só em vez de dois.
3. Em qualquer das duas, o ramo de `free` falso precisa deixar rastro na tela: uma linha na legenda com o nome de cada UF que ficou sem sigla naquele painel, no lugar do silêncio de hoje.

A faixa de margem superior que o corretor anotou no README também serve, mesmo com a caixa de 16 por 16: há 38 posições no topo do painel com linha de chamada válida, todas à direita, com o canto da caixa entre x = 302 e x = 313, folga de 3,0 a 3,5 px (o vizinho mais próximo da linha é RN) e linha de 70 a 84 px. É a saída de linha mais longa e de menor folga. Na margem inferior não há nenhuma.

**Critério de aceite:** 27 siglas em cada painel no dado padrão, nenhuma sigla a menos de 1 px de círculo, e nenhum ramo em que uma marca fique sem nome sem que a tela diga qual.

**Testado só em bancada.** A busca foi feita sobre as posições do `preview.svg`, fora do componente. Não é render: o corretor confere de novo depois de mudar o código, inclusive o painel de 2025, onde a caixa menor muda o lugar de outras siglas.

### Itens de mesma rodada, que não bloqueiam

Estão no README, no parágrafo da segunda revisão: a mesma UF em lugares diferentes nos dois painéis (até 45 px, com PR e MS trocando de ordem), o traço na cor do cartão que tira de 16% a 36% da área das 5 UFs fora do perímetro, a linha de chamada de 147 px de Tocantins em 2025, a sigla MA solta do círculo dela e o comentário de 120 passos sobre uma constante que vale 300. Da primeira passada seguem abertos o "+7%" sem a casa decimal (NUM-1), o total que soma as 27 UFs (NUM-5), a frase do contorno cinza e o `REGION_SLOT` do `notes`.

O traço na cor do cartão foi pesado como constante de acabamento e não como encoding: tira meio pixel de raio de cinco pontos de 2,5 a 6 px, todos fora do recorte que a pergunta faz, sem artefato visível além de um aro branco fino no tema claro. É a mesma classe do contorno de 1,25 px da `v1`, que soma 82% à área do Amapá e vem do catálogo.

## `v1`, `v2` e `v4`: aprovadas

Nenhuma das três tem "não" nas 32 perguntas. O que cada uma exercita das regras EIX, ROT, NUM, COR, TIP e ACE foi conferido de novo, além do que fechou acima.

* **`v1`.** Área pela raiz do valor, sem piso (EIX-1 no sentido da GEO-3). Série única em `--chart-1` (COR-1). Preenchimento a 0,70: 3,25:1 sobre o cartão no claro e 5,29:1 no escuro (ACE-5), com contorno sólido a 5,20:1 e 10,90:1 sobre o contorno do país. Legenda de tamanho com o último degrau no máximo observado, 2.140 (ROT-5b). Roraima como anel pontilhado com `formatUnavailable()` na legenda, nunca como círculo mínimo (EST-2). Linha de leitura calculada: 2.140 sobre 10.916 dá 20%, e as 5 maiores somam 54%. Frase acessível de 208 caracteres. Linhas de chamada em `--text-muted`, de 4,65:1 a 5,98:1 (ACE-6). As 21 UFs sem sigla são decisão do catálogo e a legenda diz onde está o número delas.
* **`v2`.** Meta e realizado na mesma escala de área, com o máximo em São Paulo (EIX-9). Bateu a meta é estado, em `--positive`, com visto e percentual: cor, ícone e texto (ACE-2, COR-6). Os 11 percentuais batem com o dado, e Sergipe, com 100% exatos, leva o visto. Tocantins sem realizado mostra só o anel e `formatUnavailable()` (EST-2, sem o ícone `Unplug`, que segue como observação). Legenda na ordem de leitura, com amostra na forma da marca (ROT-4), e régua de área terminando em R$ 5,3 mi (ROT-5b). Frase acessível de 181 caracteres. O que a versão não entrega é a distância até a meta para quem ficou abaixo: o anel encosta no cheio e os dois medem 1,16:1 e 1,35:1 entre si. A pergunta do caso de uso é quem já cobre a meta, e isso lê; por isso é observação e não bloqueio.
* **`v4`.** Tamanho pelo módulo, sem piso, conferido nos 14 raios distintos. Cor pelo sinal com a polaridade certa (COR-6) e, agora, forma pelo sinal: cheio e anel vazado (ACE-2). Sinal de menos tipográfico e mais escrito à mão sobre o módulo (NUM-3). Zero medido desenhado e escrito (EST-3). Preenchimento a 0,80: 3,65:1 no claro e 5,17:1 no escuro sobre o cartão (ACE-5); anel da queda a 5,51:1 e 6,30:1 sobre o contorno do país. Glifo de mais a 3,81:1 e 4,96:1 sobre o verde composto. Linha de leitura: 14 altas, 10 quedas, 3 zeros, saldo de +97, tudo refeito do dado. Frase acessível de 232 caracteres. Dois rótulos ficam mais perto de um vizinho do que eu gostaria ("SC +42" e "MG −30"), sem tocar nem apontar para dentro de círculo alheio: observação, com a medida no README.

## Registro do parecer

```
Versão: 23_mapas/03_simbolos-proporcionais/v1_clientes-ativos-no-centroide
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 27, 28, 29

Versão: 23_mapas/03_simbolos-proporcionais/v2_bolhas-em-grade-realizado-contra-meta
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 13, 27, 28, 29, 30, 31, 32

Versão: 23_mapas/03_simbolos-proporcionais/v3_dorling-receita-2025-e-2026
Data: 2026-10-13
Resultado: reprovada
Não: 12, 18
Correções:
  12 e 18. Seção 14.1, identificação das marcas, e DIC-1: o Piauí não tem sigla no painel de 2026 e só se identifica na dica; medir a caixa do rótulo pela tinta real e tentar as diagonais, ou relaxar e rotular uma vez só para os dois painéis, até dar 27 siglas em cada um.
Não se aplica: 3, 4, 6, 13, 27, 28, 29, 30

Versão: 23_mapas/03_simbolos-proporcionais/v4_saldo-de-clientes-negativo-e-zero
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 27, 28, 29
```

## Defeito de régua ou de ferramenta

* Nenhuma guarda compara rótulo esperado com rótulo desenhado. A `v3` passa no `check` com 0 avisos e uma marca sem nome, porque o ramo de `free` falso simplesmente não desenha o `<text>`.
* A `RAIO-CONTRA-AREA` segue sem ver traço que tira ou soma área. Na `v3` o traço na cor do cartão tira de 16% a 36% da área das 5 UFs fora do perímetro; na `v1` o traço na cor da marca soma 82% à do Amapá. As duas passam.
* O scratchpad da sessão é uma pasta só para todos os agentes: um script de recorte meu foi sobrescrito por outro agente no meio da revisão. Passei a trabalhar em subpasta própria, e nenhuma medida deste parecer saiu do arquivo trocado.

# Primeira passada, 2026-10-13 (histórico)

Revisor independente, 2026-10-13. Julgadas as quatro versões, todas em `sem_revisao`, pelos arquivos de hoje (`Chart.tsx` de 12:16:11 a 12:18:28, `meta.json` de 12:18:59) e pelos PNGs de 12:19, posteriores a todos eles. `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: **as quatro reprovadas**. `v1` com 2 bloqueantes, `v2` com 2, `v3` com 3 e `v4` com 2. A fórmula está certa nas quatro: o raio sai da raiz do valor sobre o máximo, sem piso, e foi conferido círculo a círculo no `preview.svg`. O que reprova é o que acontece depois da fórmula: marca comida por traço, círculo coberto por vizinho, rótulo que aponta para a marca errada, sinal só na cor.

Dois defeitos se repetem, e a correção de um serve aos dois lugares: a linha de chamada (`v1` e `v4`, e a `v3` vai precisar dela) e o corte do maior círculo da legenda (`v1` e `v2`).

## O que foi medido e o que não foi

* **Geometria:** lida do `preview.svg` de cada versão (centro e raio de cada círculo, pontas de cada linha de chamada, âncora de cada texto). Coordenadas em px do `<svg>` do mapa.
* **Tinta e cor:** lidas do pixel dos PNGs de conferência, que estão em escala 2, com a fórmula de contraste da WCAG.
* **`v2`:** a área de preenchimento visível de cada UF que bateu a meta foi contada no PNG (projeção de cada pixel na reta entre a cor do cartão e a cor cheia) e comparada com π r².
* **`v3`:** a relaxação foi refeita fora do componente com as mesmas constantes, e bateu com o `preview.svg` até a segunda casa.
* **Refeito contra o `data.ts`:** totais, participações, contagens e percentuais escritos nas quatro versões. Todos batem.
* **Contraste de marca que passa:** `v1` mede 3,02:1 sobre o contorno do país no claro e 5,71:1 no escuro. `v4` mede 3,27:1 no verde e 4,03:1 no vermelho no claro, 5,68:1 e 4,34:1 no escuro.
* **Não renderizado:** o estado vazio das quatro e o ramo de centros coincidentes da `v3`. Lidos no código.

## `v1_clientes-ativos-no-centroide`: reprovada, 2 bloqueantes

### Bloqueante 1. Pergunta 31, com reflexo na 12; seção 14.1, identificação das marcas

**O que se vê.** O rótulo `MG 1.180` aponta para o círculo do Espírito Santo. A linha de chamada chega pela direita, entra no círculo pequeno e para dentro dele: quem lê liga o segundo maior valor do mapa a um círculo de 300 clientes.

**Evidência.** No `preview.svg`, a linha de MG vai de (204,32; 120) a (243; 120). O círculo de ES tem centro em (206,5; 125,5) e raio 8,99. A ponta da linha fica a 5,92 px do centro de ES, ou seja 3,07 px para dentro dele, e os primeiros 9,3 px dos 38,7 px da linha (24%) correm sobre ES, que é pintado por cima de MG. A linha de `SP 2.140` vai de (142,5; 139) a (103; 139): termina a 14,92 px do centro de PR, que tem raio 14,86, portanto em cima do contorno de PR, e passa a 1,13 px do fundo do círculo de MS (0,5 px do traço dele). Três marcas disputam a mesma ponta.

**Por que acontece.** `placeLabels` ancora a linha no ponto do círculo dono voltado para o rótulo (`Chart.tsx:177` a `186`), e a exceção das linhas 205 a 209 aceita de propósito a saída que nasce dentro de um vizinho ("dele não há como sair"). O teste de travessia usa folga de 1 px (`r + 1`), que deixa passar a tangência de MS por 0,13 px.

**O que mudar.** A ponta visível da linha tem de cair numa parte do círculo dono que não esteja coberta nem encostada em outro círculo. Duas saídas: (a) terminar a linha no centro do círculo dono, com um ponto de 2 px na cor da linha: os centros de SP e de MG estão livres (o de MG fica a 20,7 px do centro de ES, 27,6 px do de SP e 21,5 px do de RJ, todos fora dos raios), e a ponta atual de PR já cai em arco livre; (b) manter a ponta na borda, recusar o candidato cuja saída caia dentro de qualquer vizinho ou a menos de 3 px do contorno de um, e varrer outros ângulos. **Critério de aceite:** nenhuma ponta de linha dentro de outro círculo nem a menos de 3 px do traço de outro, e nenhum trecho de linha sobre círculo que não seja o dono.

### Bloqueante 2. Pergunta 15; ESP-3 e seção 14.1, constante com consequência no render

**O que se vê.** O maior círculo da legenda de tamanho, o do máximo observado (`2.140`), sai com o topo cortado em linha reta, nos dois temas. É o degrau que a ROT-5b manda existir.

**Evidência.** `Chart.tsx:276` faz `legendBox = Math.ceil(2 * R_MAX)`, 48 px, e a linha 340 põe o centro em `legendBox - r - 1`, 23, com raio 24 e traço de 1,25: o topo da marca fica em y = −1,63 e o `<svg>` corta em 0. No PNG claro a primeira linha com tinta do círculo (linha 260) já tem 40 px de largura, 20 px reais. Na `v4`, que soma 2 px à caixa, a primeira linha tem 8 px.

**O que mudar.** A caixa precisa do diâmetro mais o traço inteiro: por exemplo `legendBox = 2 * R_MAX + 4` com o centro em `legendBox - r - 2`. Conferir no PNG que a primeira linha de tinta do círculo máximo volta a ser um arco.

### Itens de mesma rodada, que não bloqueiam

* TIP-7: a linha de leitura usa `truncate` e a cauda dela carrega um número que não está na frase acessível ("as 5 maiores UFs somam 54%"). Hoje cabe com folga; num cartão mais estreito perde o achado. Tirar o `truncate` ou levar os 54% para a frase.
* TIP-3: seis siglas em peso 700 (SP, MG, RJ, PR, RS e RR), e a regra dá dois elementos. Sem consequência no render; 600 resolve.
* TIP-1: os números da linha de leitura e da nota da legenda não têm `tabular-nums`.
* O halo de `RR` sai em `--surface-raised` sobre o contorno do país, que é `--surface-sunken`, e desenha uma tarja atrás da sigla nos dois temas.
* 21 das 26 UFs medidas não têm sigla, por decisão do catálogo (rótulo só nas 5 maiores). Sem as divisas a posição sozinha identifica pouco: quando a malha existir, vale rever.

## `v2_bolhas-em-grade-realizado-contra-meta`: reprovada, 2 bloqueantes

### Bloqueante 1. Perguntas 15 e 12; GEO-16 e GEO-3, seção 14.1, encoding por área

**O que se vê.** Nas UFs que bateram a meta o círculo cheio vira engrenagem: o tracejado da meta, pintado na cor do cartão por cima do cheio, cai em cima da borda do preenchimento e arranca pedaços dele. No Amapá sobra um risco, em Sergipe um losango, na Paraíba um pentágono. A meta só se lê como anel em São Paulo, e a área do realizado, que é o dado, sai menor que o valor justamente nas UFs que a pergunta quer achar.

**Evidência.** Área de preenchimento visível contra π r², igual nos dois temas. Raios em px.

| UF | Raio da meta | Raio do realizado | Área visível |
|---|---|---|---|
| SP | 17,10 | 18,00 | 91,9% |
| RJ | 11,31 | 11,64 | 89,3% |
| PR | 10,18 | 10,33 | 89,8% |
| SC | 8,90 | 9,37 | 85,4% |
| GO | 7,80 | 7,96 | 86,4% |
| DF | 6,76 | 7,02 | 83,4% |
| ES | 6,29 | 6,42 | 84,6% |
| MS | 5,52 | 5,55 | 84,2% |
| PB | 4,27 | 4,42 | 76,8% |
| SE | 3,31 | 3,31 | 74,5% |
| AP | 1,75 | 1,80 | 57,2% |

A perda vai de 8% a 43% e cresce quando o círculo encolhe: é a GEO-16, medida absoluta contra codificação por área, e a marca pequena paga tudo. As 15 UFs abaixo da meta não entram na tabela porque nelas o tracejado é cinza e lê como contorno da meta, que é o que ele é.

**Por que acontece.** `Chart.tsx:108` a `116`: o anel da meta tem traço de 1,5 px e vai em `--surface-raised` quando `reached`. A diferença de raio entre meta e realizado nessas 11 UFs vai de 0,00 a 0,90 px, sempre menor que o traço, então o anel nunca fica inteiro dentro do cheio: metade dele some no cartão e a outra metade morde a borda.

**O que mudar.** O preenchimento não pode perder área para o anel. Saída mais simples: pintar o anel da meta ANTES do cheio, sempre em `--text-secondary`. Onde o realizado cobre a meta, o cheio tapa o anel, que é a leitura literal do caso de uso ("já cobre a meta"), e o visto com o percentual diz o resto; onde não cobre, o anel aparece por fora, como hoje. Alternativa: anel por dentro só quando `r do realizado − r da meta` passar do traço mais 1 px, o que no dado padrão não acontece em nenhuma UF. **Critério de aceite:** área visível de cada cheio dentro de 2% de π r² nos dois temas, e a amostra `Meta` da legenda igual ao que se desenha.

### Bloqueante 2. Pergunta 15; ESP-3 e seção 14.1, constante com consequência no render

**O que se vê.** O maior círculo da legenda (`R$ 5,3 mi`) sai com o topo cortado, nos dois temas. É o mesmo defeito do bloqueante 2 da `v1`.

**Evidência.** `Chart.tsx:73` faz `legendBox = Math.ceil(2 * R_MAX)`, 36 px, e a linha 163 põe o centro em `legendBox - r - 1`, 17, com raio 18: o topo fica em y = −1. No PNG claro a primeira linha com tinta (linha 944) já tem 28 px de largura, 14 px reais.

**O que mudar.** `legendBox = 2 * R_MAX + 2`, como a `v4` faz, mantendo o centro em `legendBox - r - 1`.

### Itens de mesma rodada, que não bloqueiam

* Frase acessível: "com a maior marca em Santa Catarina: R$ 1,4 mi contra R$ 1,3 mi". "Maior marca" lê como o maior círculo, que é São Paulo. O que a frase quer dizer é o maior percentual da meta (SC com 111,0% contra SP com 110,8%). Trocar por "maior superação" e dizer o percentual. Na legenda, "com percentual" pede o complemento "da meta".
* EST-2: Tocantins escreve `formatUnavailable()` sem o ícone `Unplug`.
* As 15 UFs abaixo da meta não têm número escrito, por decisão do catálogo: AC com 60% e RR com 55% ficam iguais a MT com 95% para quem não abre a dica.
* SP: 1,1 px entre o fundo do maior círculo (y 39) e o topo da sigla (y 40,1). Não colide, mas não tem respiro.
* A coluna 1 da grade não tem UF, e o desenho fica 35 px à direita do centro do cartão.

## `v3_dorling-receita-2025-e-2026`: reprovada, 3 bloqueantes

### Bloqueante 1. Pergunta 15; seção 14.1, encoding por área e versão que não demonstra o que o catálogo diz

**O que se vê.** Santa Catarina está em cima de São Paulo nos dois painéis. A frase do topo diz que "os círculos se afastam para não se sobrepor", e o maior círculo do desenho, o que a frase acessível cita como líder, tem um pedaço tapado. O pedaço é maior em 2026 que em 2025, então a comparação entre painéis, que é a pergunta, sai torta.

**Evidência.** `preview.svg`, painel de 2025: SP em (204,18; 155,80) com raio 29,63 e SC em (201,49; 189,39) com raio 15,61. Distância de 33,70 contra 45,24 de soma dos raios: 11,54 px de penetração, lente de 222 px², 8,1% da área de SP. Painel de 2026: SP em (205,41; 154,36) com raio 32 e SC em (200,28; 187,72) com raio 17,28. Distância de 33,75 contra 49,28: 15,53 px de penetração, lente de 357 px², 11,1% de SP. RS e SC também se tocam, 0,68 px em 2025 e 2,17 px em 2026. A parte visível de SP cresce 12,8% de um painel para o outro; o valor cresce 16,7%.

**Por que acontece.** `Chart.tsx:125` e `126`: depois das 120 rodadas, cada círculo é preso à caixa do painel. `PANEL_H` é 206, e SC termina exatamente em `PANEL_H − r − 1` (189,39 e 187,72), assim como RS. A relaxação empurrou os dois para baixo de SP e o grampo final os trouxe de volta para cima dele.

**O que mudar.** O grampo não pode desfazer o afastamento. Ou o painel ganha altura para o sul caber (há cerca de 30 px livres abaixo dos painéis no canvas `largo`, e SC inteira abaixo de SP pede `PANEL_H` de uns 224), ou o limite da caixa entra dentro do laço de relaxação, como mais uma restrição a cada rodada, e não depois dele. **Critério de aceite:** no `preview.svg`, nenhum par com distância menor que a soma dos raios, nos dois painéis. Depois de corrigir, olhar de novo a vizinhança: hoje PR é deslocado de 38 a 42 px e termina ao norte de MS, separado de SC e RS por São Paulo.

### Bloqueante 2. Perguntas 12 e 18; seção 14.1, identificação das marcas; DIC-1

**O que se vê.** Quatro círculos não têm nome em nenhum dos dois painéis: Maranhão, Piauí, Alagoas e Tocantins, três deles dentro do perímetro. Num Dorling a posição é declarada aproximada, então a sigla é a única identificação, e sem ela não dá para achar a mesma UF no outro painel, que é o caso de uso. A legenda manda para a dica ("Sem sigla: nome na dica"), e a DIC-1 não deixa o essencial morar só nela.

**Evidência.** Círculos sem `<text>` no painel de 2025: (223,42; 57,02) com raio 7,96, MA; (235,28; 69,91) com raio 5,84, PI; (280,72; 76,97) com raio 6,44, AL; (187,81; 79,49) com raio 4,94, TO. Em 2026, os mesmos quatro. O rótulo `PA` fica a 2,2 px do círculo dele e a cerca de 1,5 px do círculo sem nome do Maranhão (largura de texto estimada): lê como nome de qualquer um dos dois.

**Por que acontece.** `placeLabels` é chamado sem o quarto argumento (`Chart.tsx:299` a `306`), então não há coluna de margem: rótulo sem lugar ao lado do círculo fica com `free` falso e não é desenhado (linha 380). O painel tem 360 px e o mapa ocupa 200: sobram 80 px de cada lado.

**O que mudar.** Passar as colunas de margem para o `placeLabels`, que já sabe usá-las (é a mesma função da `v1`), com a linha de chamada corrigida como no bloqueante 1 da `v1`. **Critério de aceite:** 27 siglas em cada painel, nenhuma sigla mais perto de outro círculo que do dela, e a frase "Sem sigla: nome na dica" fora da legenda.

### Bloqueante 3. Pergunta 12; ROT-4, ACE-7 e seção 14.1, identificação das marcas

**O que se vê.** A legenda diz "Contorno escuro: perímetro; sem contorno, fora dele". No tema escuro o contorno do perímetro é claro, porque vai em `--text-primary`, e quem leva traço escuro são as cinco UFs de fora, em `--surface-raised` (`Chart.tsx:372`). A legenda diz o contrário do desenho num dos dois temas, e o perímetro é o recorte da pergunta. Também não há amostra: a regra do contorno só existe em texto.

**O que mudar.** Nomear pela forma e não pela cor ("Com contorno: no perímetro; sem contorno: fora dele") e dar as duas amostras na forma da marca, um círculo com o contorno e um sem.

### Itens de mesma rodada, que não bloqueiam

* NUM-1: variação abaixo de 10% leva uma casa. O cabeçalho de 2026 escreve "+7% contra 2025" e a conta dá 6,9%.
* NUM-5: o "total" dos cabeçalhos soma as 27 UFs, e a pergunta é sobre o perímetro. Dizer "total das 27 UFs" ou dar o total do perímetro. A frase acessível também não cita o perímetro.
* Linha de leitura: "O contorno cinza mostra o lugar real das UFs" promete mais do que há, porque o contorno é do país, sem divisas. Ela usa `truncate` e o conteúdo não está na frase acessível (TIP-7).
* `meta.json`, `notes`: cita a constante `REGION_SLOT`; no `data.ts` ela se chama `REGION_COLOR`.
* Os dois painéis e a legenda somam 894 px fixos e fecham o corpo do canvas `largo` sem folga nenhuma.
* O halo das siglas de fora do círculo desenha tarja sobre o contorno do país, como na `v1`.

## `v4_saldo-de-clientes-negativo-e-zero`: reprovada, 2 bloqueantes

### Bloqueante 1. Pergunta 19; ACE-2

**O que se vê.** O sinal do saldo só está escrito em 5 das 24 UFs com saldo diferente de zero. Nas outras 19, crescer ou encolher é só verde ou vermelho. É a pergunta do caso de uso ("onde a carteira cresceu ou encolheu"), e o catálogo pede o sinal "escrito no rótulo, nunca só na cor".

**Evidência.** `Chart.tsx:255`: há rótulo para as 5 de maior módulo (SP, SC, MG, PR e RJ) e para as 3 de saldo zero. O verde contra o vermelho mede 1,23:1 no claro (`#3b9275` e `#c04e63`, lidos sobre o contorno do país) e 1,31:1 no escuro: para quem não separa matiz, as duas cores são o mesmo cinza. A legenda diz "Cresceu, saldo com +" e "Encolheu, saldo com −", mas o sinal não está em 19 das marcas que ela descreve.

**O que mudar.** Todo círculo de saldo não nulo precisa de um segundo canal legível com o desenho parado. Duas saídas: (a) o glifo `+` ou `−` desenhado como marca dentro do círculo quando o raio comporta, na cor do cartão, que mede 3,78:1 sobre o verde e 4,65:1 sobre o vermelho no claro e 4,94:1 e 3,78:1 no escuro: passa o piso de marca e não o de texto, por isso traço e não `<text>`; e, para as 6 UFs de módulo 1 ou 2 (raio de 3,1 a 4,4 px), sigla com o valor assinado pela coluna de margem; (b) a forma como segundo canal, um dos sinais vazado ou com segundo anel, declarada na legenda e distinta do anel do zero. **Critério de aceite:** com o PNG em tons de cinza, dá para dizer o sinal de cada uma das 24.

### Bloqueante 2. Pergunta 31; seção 14.1, identificação das marcas

**O que se vê.** A linha de `SP +50` termina dentro do círculo do Paraná, que é pintado por cima de São Paulo e tem a mesma cor. As linhas de `SP +50` e de `PR +28` chegam as duas ao mesmo bojo verde, e o maior círculo do mapa, o que a frase acessível cita como maior alta, fica sem vínculo claro. É o mesmo defeito do bloqueante 1 da `v1`, no mesmo `placeLabels`.

**Evidência.** `preview.svg`: a linha de SP vai de (144,5; 139) a (103; 139). PR tem centro em (152; 150,5) e raio 16,46: a ponta fica a 13,73 px do centro, 2,73 px para dentro de PR, e 4,3 px dos 41,5 px da linha correm sobre ele. A linha de PR chega a (135,87; 153,79), 15 px abaixo. A linha de `SE 0` nasce 1,22 px dentro do círculo de AL e corre 3,7 px sobre ele; ali o anel do zero, pintado por último, segura a leitura, mas a regra é a mesma.

**O que mudar.** A correção do bloqueante 1 da `v1`, com o mesmo critério de aceite. O centro de SP está livre nesta versão (a 18,5 px do centro de PR, 2 px fora do raio dele).

### Itens de mesma rodada, que não bloqueiam

* `meta.json`, `notes`: diz que o saldo zero é "um anel pontilhado de 4 px"; o código e a legenda desenham anel contínuo.
* TIP-7: a linha de leitura usa `truncate` e a cauda dela é a conclusão ("+97 clientes"), que não está na frase acessível.
* TIP-3 e TIP-1: oito siglas em peso 700; números da linha de leitura sem `tabular-nums`.
* TOK-4: vermelho sobre verde a 0,80 (MG sobre SP, RS sobre SC) gera uma terceira cor na lente. O contorno na cor do sinal segura a leitura.
* NUM-6: os degraus da legenda de tamanho ("10", "25", "50") não levam o substantivo, e o título dela ("Saldo em módulo, pela área") também não diz clientes.

## Registro do parecer

```
Versão: 23_mapas/03_simbolos-proporcionais/v1_clientes-ativos-no-centroide
Data: 2026-10-13
Resultado: reprovada
Não: 15, 31
Correções:
  31. Seção 14.1, identificação: a ponta da linha de chamada de MG cai dentro do círculo de ES e a de SP em cima do contorno de PR; ancorar em parte livre do círculo dono.
  15. ESP-3: o maior círculo da legenda sai com o topo cortado; a caixa precisa do diâmetro mais o traço.
Não se aplica: 3, 4, 6, 7, 13, 27, 28, 29

Versão: 23_mapas/03_simbolos-proporcionais/v2_bolhas-em-grade-realizado-contra-meta
Data: 2026-10-13
Resultado: reprovada
Não: 12, 15
Correções:
  15. GEO-16 e GEO-3: o tracejado da meta na cor do cartão come de 8% a 43% da área do cheio nas 11 UFs que bateram a meta; pintar o anel antes do cheio.
  12. ROT-4: a amostra `Meta` da legenda não é o que se desenha nessas 11 UFs; sai junto com a correção acima.
  15. ESP-3: o maior círculo da legenda sai com o topo cortado; somar 2 px à caixa.
Não se aplica: 3, 4, 6, 13, 27, 28, 29, 30, 31, 32

Versão: 23_mapas/03_simbolos-proporcionais/v3_dorling-receita-2025-e-2026
Data: 2026-10-13
Resultado: reprovada
Não: 12, 15, 18
Correções:
  15. Seção 14.1, encoding por área: SC cobre 8,1% de SP em 2025 e 11,1% em 2026 porque o grampo da caixa desfaz a relaxação; dar altura ao painel ou levar o limite para dentro do laço.
  12 e 18. Seção 14.1, identificação, e DIC-1: MA, PI, AL e TO não têm sigla em nenhum painel; passar as colunas de margem ao placeLabels.
  12. ROT-4 e ACE-7: "Contorno escuro: perímetro" é falso no tema escuro e não tem amostra; nomear pela forma e dar as duas amostras.
Não se aplica: 3, 4, 6, 13, 27, 28, 29, 30, 31, 32

Versão: 23_mapas/03_simbolos-proporcionais/v4_saldo-de-clientes-negativo-e-zero
Data: 2026-10-13
Resultado: reprovada
Não: 19, 31
Correções:
  19. ACE-2: o sinal de 19 das 24 UFs com saldo não nulo depende só da cor (verde contra vermelho a 1,23:1 no claro); dar um segundo canal a todo círculo.
  31. Seção 14.1, identificação: a ponta da linha de chamada de SP cai dentro do círculo de PR; mesma correção da v1.
Não se aplica: 3, 4, 6, 7, 13, 27, 28, 29
```

## Defeito de régua ou de ferramenta

* A `RAIO-CONTRA-AREA` mediu a `v2` e passou: ela compara o `r` declarado do `<circle>` com o valor, e não vê a tinta que um traço na cor do cartão, pintado por cima, tira do preenchimento. A perda de 8% a 43% só apareceu contando pixel.
* Nenhuma guarda olha sobreposição entre círculos nem ponta de linha de chamada dentro de marca alheia. Os três bloqueantes de identificação e o de sobreposição da `v3` saíram de leitura do `preview.svg`.
* O dossiê marcou a `v1` com "o texto desta versão pede opacity (contra a ACE-5)". O produtor tratou certo, subindo de 0,60 para 0,70 e declarando no `notes`; a medida do pixel confirma 3,02:1 no claro.

