# Chord simétrico de relação

## O que é

Grupos no perímetro de um círculo e fitas entre eles, com a largura proporcional à força da relação e sem sentido: as duas pontas da fita têm a mesma largura porque a matriz é simétrica. O arco externo de cada grupo mede o total das suas relações, e o ângulo sai da soma da linha descontado o vão entre grupos. Dentro do arco os parceiros ficam ordenados pelo peso, do maior para o menor, para reduzir cruzamentos. É a geometria do chord direcional da família 11 aplicada a uma matriz simétrica, com a flag de arco grande ligada quando o ângulo passa de π. Chord não é autoexplicativo: a nota de como ler fica junto do visual, e a matriz resolve a mesma pergunta com mais precisão.

## Quando usar

- Coocorrência com peso entre até 6 grupos coloridos mais Outros, como produtos na mesma carteira.
- Mostrar de uma vez o total de cada grupo e com quem ele se relaciona.
- Relação sem sentido, em que A com B é o mesmo que B com A.
- Cartão quadrado ou alto, com espaço para a nota de como ler e para a alternância com a matriz.
- Destacar o parceiro mais associado de um grupo em foco.

## Quando evitar

- Relação dirigida, com volume de A para B: use o chord direcional de fluxo (`11_fluxo-sankey/05_chord-direcional-de-fluxo`).
- Mais de 10 grupos ou muitas fitas finas: use a matriz de adjacência (`27_rede-e-relacoes/01_matriz-de-adjacencia`).
- Leitura do valor exato de cada par: use a matriz, com o valor na célula.
- Relação binária sem peso: use a forma circular do grafo radial, sem fita (`27_rede-e-relacoes/06`).
- Sobreposição de públicos em que a pergunta é parte do todo: use a família 22 ou 26, não uma rede.

## Anatomia

1. **Arco do grupo** (`<path>` de rosca entre `R_INNER` e `R_OUTER`): ângulo pela soma da linha, vão fixo `PAD_ANGLE` entre grupos. Cor por slot fixo na ordem 1, 3, 6, 5, 2, 4 (`CHART_SERIES_COLORS`); Outros em `var(--text-muted)`, que mede 5,2:1 no escuro e não some como `var(--line-strong)`.
2. **Subarcos**: dentro do arco, um trecho por parceiro, do maior para o menor peso; o empate segue a ordem do dado.
3. **Fita** (`<path>` com `A` e `Q` pelo centro): uma por par, com as duas pontas do mesmo ângulo; a cor é a do grupo de índice menor no par. Contorno de 1 unidade do viewBox em `var(--surface-raised)`, pintado por baixo do preenchimento (`paintOrder: 'stroke'`) para não comer a fita; fitas largas primeiro e finas por último. Par com ponta abaixo de `MIN_TIP` (1,6 unidade, cerca de 2,3 px) perde a fita, mantém o ângulo e é declarado na tela (rodapé na `v1`, linha do painel na `v2`).
4. **Rótulo do grupo** (HTML sobre o SVG, sem rotação): nome em 12 px e total em `formatInt` com o substantivo, em 11 px, ancorado fora do arco em três posições por eixo. `START_ANGLE` gira a roda para o grupo pequeno não cair no topo, onde o rótulo bate no vizinho.
5. **Linha de leitura e nota de como ler**: a conclusão calculada do dado no topo e "fita mais larga, mais clientes com os dois" no pé.
6. **Foco** (`v2`): `highlightId` acende as fitas e o arco do grupo em `var(--chart-1)`; o resto vai em neutro pleno, sem opacidade. Painel com os pares em ordem, valor e percentual inteiro pelo maior resto (soma 100) do par sobre o total do grupo; canvas `alto`; o mais associado leva rótulo em peso 700.
7. **Faixa só este produto** (`v3`): a diagonal da matriz é a cauda do arco do próprio grupo em neutro, sem fita de retorno, com o valor escrito e item de legenda próprio. Grupo sem par ocupa o arco todo com a faixa.
8. **Limiar, matriz e lista** (`v4`): `MIN_RIBBON` tira a fita do par pequeno mas reserva o ângulo dele; o rodapé conta os pares ocultos; a origem sem jornada fica fora do círculo e é contada à parte. A alternância Corda e Matriz usa `useState`; a matriz é a visão acessível, e abaixo de 400 px de largura a corda dá lugar à lista de pares por container query.
9. **Frase acessível**: tipo do gráfico, contagens e par mais forte, com a forma `plain` do nome para não ter maiúscula no meio da oração.
10. **Vazio**: sem nenhum par, um bloco `role="status"` com o ícone `Filter` no lugar do desenho (EST-1).

## Versões

- `v1_produtos-na-mesma-carteira`: 7 produtos e 20 pares de clientes. Demonstra arco e fita em path com geometria em TypeScript, fita simétrica, cor por slot fixo com Outros neutro, a nota de como ler e os subarcos ordenados pelo peso.
- `v2_produto-mais-associado-ao-credito-estruturado`: o mesmo desenho com um produto em foco por `highlightId`. Demonstra fitas em `var(--chart-1)` e o resto em neutro, o painel dos pares com `formatPercent`, o parceiro mais associado anotado em peso 700 e a frase acessível com o par mais forte.
- `v3_clientes-com-um-produto-so`: 6 produtos com a diagonal da matriz. Demonstra a faixa só este produto como cauda neutra do arco, sem fita para si mesmo, a divisão legível entre pares e faixa própria, a legenda do item e um produto sem nenhum par.
- `v4_origens-demais-agrupadas-em-outros`: 11 origens, seis coloridas e Outros (n=5), mais uma sem jornada. Demonstra o limiar de fita com os pares ocultos contados, a alternância com a matriz, a origem fora do círculo e a lista de pares abaixo de 400 px. Canvas `alto`, por causa dos dois rodapés e da linha de alternância.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o dado fictício pela matriz real, uma linha por par não ordenado.
2. Mantenha `groups` na ordem de leitura com o `slot` fixo de cada grupo e a forma `plain` em minúscula; a cor pertence ao grupo, não à posição (COR-3). Passe no máximo 6 grupos coloridos mais Outros.
3. Na `v3`, a diagonal entra na lista como par com `a` igual a `b`. Na `v4`, a origem com `slot` nulo é agrupada em Outros e a com `hasJourney` falso sai do círculo.
4. O círculo escala com o pai por `viewBox` e os rótulos são HTML de 12 e 11 px, que não encolhem com ele; prefira `quadrado` ou `alto` a `card` quando houver mais de 6 grupos, porque o corpo de 225 px de altura deixa o círculo pequeno.
5. Dê altura ao pai antes de embrulhar em `VisualCard` e troque o bloco de vazio por `EmptyState`.

## Referências

- Geometria de chord (ordenação de subarcos, arco grande, fita por curva quadrática pelo centro): d3-chord, `chordGroup` e `ribbon`, e o chord direcional da família 11 deste catálogo (`11_fluxo-sankey/05_chord-direcional-de-fluxo`).
- Quando preferir a matriz: `27_rede-e-relacoes/01_matriz-de-adjacencia`.
- Arquivos do Farol de referência: `app/src/lib/format.ts` e `app/src/components/visuals/charts/chartTheme.ts`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, quatro versões julgadas. `v3` e `v4` aprovadas; `v1` e `v2` reprovadas (fitas finas consumidas pelo próprio contorno nas duas, e percentuais do painel somando 101 na `v2`), com o parecer em `validation/revisao_27_rede-e-relacoes__07_chord-simetrico_2026-10-13.md`. Os itens abaixo não reprovam.

- `v4`: três fitas acima do limiar ficam sem cor por 5 a 9 px no ponto mais fino (site orgânico com evento, evento com Outros, indicação com e-mail) e tênues por 13 a 20 px, nos dois temas. As pontas têm de 2,5 a 3,9 px de tinta e a cor identifica o par, por isso não reprova. `MIN_RIBBON = 10` está em leads e não conhece a largura desenhada: no limiar a ponta teria 1,3 px de tinta e o corpo sumiria como na `v1`. Derivar o piso dos px por lead e alinhar a fita ao conserto da `v1` e da `v2`.
- `v4`: os 3 pares entre origens de Outros (marketplace com webinar, rádio com mídia exterior, webinar com telemarketing; 25 dos 908 leads do dado) são descartados em `aggregate` sem linha na tela. A célula Outros com Outros da matriz sai vazia como as outras diagonais e a frase acessível diz "A matriz traz todos os valores". As outras duas exclusões têm rodapé próprio; esta pede o mesmo. O comentário do `data.ts` fala em 29 pares e o dado tem 32 linhas.
- `v1`, `v2` e `v3`: o total do arco soma pares, então cliente com três produtos conta mais de uma vez. A `v1` avisa no `notes` e na nota ("O arco soma os pares"), mas escreve `333 clientes` e "739 clientes em pares"; a `v3` usa a soma como denominador ("476 de 870 clientes têm um produto só"). Com o dado fictício nada desmente; ao colar, passar a contagem distinta de clientes ou trocar o substantivo.
- `v1` e `v2`: o agrupamento sai com o rótulo `Outros`, sem a contagem `(n=X)` que a COR-4 pede e que a `v4` escreve. O dado não diz quantos produtos o grupo junta, e o caso de uso e a frase acessível contam "7 produtos" com o agrupamento dentro. Guardar a contagem no `data.ts` e dizer "6 produtos e Outros".
- `v1`, `v3` e `v4`: a cor da fita é a do grupo de índice menor no par, e só este README e o `notes` dizem isso. Numa relação sem sentido, fita da cor de um lado só pode ler como direção; meia frase na nota de como ler resolve (GEO-12).
- As quatro: a fita entre grupos vizinhos afina no ápice qualquer que seja o peso, porque as duas bordas usam o centro como ponto de controle. A largura só é fiel nas pontas; a Anatomia e a nota "fita mais larga" podem dizer isso.
- As quatro: `STROKE_WIDTH = 1` é unidade do viewBox e cresce com a roda (1,13 px na `v2`, 1,34 na `v3`, 1,44 na `v1`, 1,65 na `v4`), e a Anatomia fala em "contorno de 1 px". Fica dentro da faixa da COR-5; o efeito sobre a fita fina é o bloqueante da `v1` e da `v2`.
- `v1`: a menor distância entre caixas de rótulo é de 2,6 px (Conta digital e Cartão, em linhas diferentes, sem colisão). O giro é a constante `START_ANGLE`, ajustada a este dado; outro dado pode pôr dois grupos pequenos lado a lado no topo.
- `v2`: aceso em `--chart-1` contra neutro em `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro (TOK-9). O segundo canal existe (peso 700 nos dois rótulos, anotação, painel, fitas do foco por cima), mas o `notes` não traz o número que a TOK-9 manda escrever, e no claro a marca do foco se separa do neutro só pelo matiz.
- `v2`: o comentário da prop `highlightId` diz que id fora de `groups` "deixa a roda toda em neutro"; o código devolve o bloco de vazio com a frase "Nenhum cliente com dois produtos", que não é o caso (DAD-10). Fora do dado padrão.
- `v2`: o canvas `card` deixa o círculo com 126 px, e o "Como colar" deste README recomenda `quadrado` ou `alto` acima de 6 grupos. Os rótulos dos grupos fora do foco não trazem total, o que a 17.2 aceita no neutro sem valor.
- `v2` e `v4`: número em frase sem `tabular-nums` (TIP-1): o `218` da nota do painel na `v2`, o `3` e o `10` do rodapé na `v4`. Sem coluna a alinhar, o preview não muda.
- `v3`: a linha de leitura ocupa duas linhas no `quadrado` (a ANO-5 pede uma). Nada colide e o círculo perde 20 px.
- `v3`: "com 140." na linha de leitura, "140." na frase acessível e `140 só este` no rótulo saem sem o substantivo (NUM-6). A unidade está na mesma frase e na linha de cima do rótulo.
- `v3`: o item de legenda "Só este produto" fica no rodapé, e a ROT-4 pede acima ou ao lado. São duas linhas e o desenho não encolhe por elas.
- `v3`: o contorno tira 1,34 px de toda fita (a menor, de 25 clientes, fica com 6,4 de 7,7 px). Nenhuma se perde com este dado; alinhar a fita ao conserto da `v1` e da `v2`.
- `v3` e `v4`: texto que não flexiona fora do dado padrão: "1 produto sem nenhum par" na frase da `v3`, e "N pares abaixo de" no rodapé e "N pares pequenos" na frase da `v4`.
- `v4`: os números da matriz saem centralizados na célula (a TIP-6 pede à direita em coluna). Com 1 a 3 algarismos a leitura não se perde. Conferido em página viva nos dois temas: tabela de 574 por 245,5 px, cabeçalhos em duas linhas, sem transbordo.
- `v4`: a linha de leitura não tem `aria-hidden` numa raiz `role="figure"` (ANO-5), então o leitor de tela ouve a conclusão duas vezes. Na visão Matriz continuam no rodapé "ficam sem fita" e "Como ler: fita mais larga", que falam de um desenho que não está na tela.
- `v4`: na lista abaixo de 400 px o par sai na ordem alfabética do id ("Outros (n=5) com redes sociais", "Evento com indicação"), não na ordem da roda, e o número não leva "leads" (a linha de leitura leva). Conferido em página viva: 21 itens em ordem decrescente, sem aviso de layout.
- Catálogo, seguido como está escrito: o caso de uso da `v1` fala em "7 produtos" e o "o que demonstra" pede "Outros neutro"; e a `v2` é sugerida em `card` com 7 grupos, contra o "Como colar" acima.

Revisão de 2026-10-13, segunda passada, depois da rodada de correção, com a `v1` e a `v2` julgadas pelo arquivo corrigido. `v1` aprovada; `v2` reprovada (no canvas `alto` a camada de rótulos sai da escala da roda e os rótulos ficam de 15 a 45 px do anel, e o percentual do painel é escrito à mão onde o catálogo e a seção Versões deste README dizem `formatPercent`), com o parecer na seção "Segunda passada" de `validation/revisao_27_rede-e-relacoes__07_chord-simetrico_2026-10-13.md`. Os itens abaixo não reprovam. Da primeira passada seguem valendo, sem mudança, `Outros` sem `(n=X)`, o total do arco somando pares, a cor da fita pelo índice menor e a fita que afina no ápice.

- `v1`: o rodapé passou a quatro linhas e a roda encolheu de 288 para 254 px de lado (GEO-14). O piso `MIN_TIP` de 1,6 unidade vale 2,0 px na tela, e não os "2,3 px com a roda de 172 px" do comentário do `Chart.tsx` e do item 3 da Anatomia; o anel mede 152 px. Os três pares sem fita são com Outros: dizer isso uma vez encurta a lista e devolve altura à roda.
- `v1` e `v2`: `MIN_TIP` está em unidade do viewBox e não conhece o px desenhado (2,0 px na `v1`, 2,7 na `v2`); num cartão menor a ponta cai abaixo de 2 px sem o piso perceber. É o mesmo ponto da `MIN_RIBBON` da `v4`.
- `v1`: a fita de consórcio com Outros (9 clientes) afina até 0,8 px no gargalo. Segue contínua e visível nos dois temas, no limite.
- `v1`: no rodapé, `6`, `5` e `3` saem sem o substantivo (NUM-6) e sem classe tabular (TIP-1), porque nascem dentro do template; a unidade vem no fim da frase ("somando 14 clientes").
- `v1`: a caixa `aspect-square h-full w-auto max-w-full` só é quadrada quando a altura é o lado curto. No `quadrado` é (254 por 254 px, tinta dos rótulos de 10 a 13 px do anel); num corpo mais alto que largo a camada de rótulos estica e se afasta do anel, que é o bloqueante da `v2`. A `v3` e a `v4` usam a mesma classe e não foram medidas nesta passada. Alinhar as quatro ao conserto da `v2`.
- `v2`: com a caixa consertada sobram cerca de 95 px de altura no corpo do `alto`, porque a roda é limitada pela largura (331 px). Canvas por número fecha o cartão (GEO-1).
- `v2`: o comentário do topo do `Chart.tsx` promete "cor da fita: a do grupo de índice menor no par", que a versão não faz, e tem um parêntese aberto (DAD-10). No `notes` do `meta.json`, uma frase começa em minúscula.
- `v2`: dois pares fora do foco também ficam sem fita pelo piso (seguro auto com Outros, 6; financiamento com Outros, 5) e a tela não diz. São contexto neutro sem valor escrito.
- `v2`: o rótulo de Financiamento ocupa os 88 px do `max-w-[5.5rem]` ("o mais associado" mede 86,5 px) e a tinta começa a 1 px da borda esquerda do corpo. Nome mais longo quebra a linha ou sai do corpo.
- `v2`: itens da primeira passada que mudaram. O canvas agora é `alto` e o anel tem 186 px; o `notes` traz os números da TOK-9; o comentário da prop `highlightId` foi alinhado ao código, mas a frase do vazio para id inexistente continua dizendo "Nenhum cliente com dois produtos"; o `218` da nota do painel segue sem `tabular-nums`.

Revisão de 2026-10-15, terceira passada, depois da segunda rodada de correção, só a `v2` julgada. `v2` aprovada: a caixa da roda é quadrada (334 por 334 px), as sete âncoras ficam a 105,2 px do centro e os percentuais saem por `formatPercent` sobre o maior resto (44, 27, 19, 5, 4 e 1, soma 100). Os itens abaixo não reprovam.

- `v2`: a tinta dos rótulos fica de 14,6 a 18,1 px do próprio arco nos dois temas, e não de 10 a 14 px como a correção registrou. Cada rótulo está mais perto do próprio arco que de qualquer vizinho; a menor margem é a de Outros (18,0 px do arco dele, 22,0 do de Consórcio e 22,1 do de Cartão). `R_LABEL` está em unidade do viewBox, então o vão cresce com a roda (8,9 px na escala da `v1`, 11,7 aqui); um afastamento em px manteria o vão fixo.
- `v2`, GEO-1, decidido: o canvas `alto` fica. A conta cabe nele com sobra, e nesse caso a GEO-1 manda escrever o nome do preset. A sobra é de cerca de 87 px no corpo: cerca de 108 px em branco entre o subtítulo e o rótulo Cartão e 86 px abaixo de "estruturado". Se o dono preferir o cartão justo, 640 por 480 escrito por número fecha.
- `v2`, TIP-4: os números do painel fora da primeira linha e o `96 clientes` do rótulo usam `kpi-number` sem classe de peso e herdam 400. Space Grotesk 400 não é carregado, e o navegador usa o 500. O preview não muda.
- `v2`: da segunda passada seguem valendo, sem mudança, o comentário do topo do `Chart.tsx` (cor da fita pelo índice menor, parêntese aberto), a frase que começa em minúscula no `notes`, a frase do vazio para id inexistente, o `218` sem `tabular-nums`, os dois pares fora do foco que ficam sem fita e sem aviso, e o rótulo de Financiamento que ocupa os 88 px e começa a 1 px da borda do corpo.
- Pendências conhecidas, abaixo: o item da `v3` e da `v4` repete "é o antigo é o antigo"; e o item da `v2` sobre a GEO-1 fica respondido pela decisão acima.

## Pendências conhecidas

- `v1`, COR-5: três pares com Outros (3, 5 e 6 clientes) ficam sem fita por piso e são contados no rodapé; as fitas de 8 e 9 clientes seguem finas no meio.
- `v2`, COR-5: Cartão (8) e Outros (3) ficam sem fita por piso e marcados no painel; Conta digital (12) tem fita fina.
- `v2`, GEO-1: a caixa da roda agora é quadrada nos dois limites (`[container-type:size]` no pai, lado `min(100cqw, 100cqh)`), então o corpo do `alto` deixa folga vertical; declarar o canvas por número fica para o revisor decidir.
- `v3` e `v4`: a caixa `aspect-square h-full w-auto max-w-full` ainda é a antiga; alinhar ao conserto da `v2`. O contorno também ainda é o antigo é o antigo (aprovadas, não tocadas); alinhar ao `paintOrder` das irmãs quando voltarem à fila.
