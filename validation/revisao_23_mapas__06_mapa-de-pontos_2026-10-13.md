# Parecer de revisão: 23_mapas/06_mapa-de-pontos

> Este arquivo tem duas passadas do mesmo dia. A que vale para o corretor é a **segunda**, logo abaixo, feita sobre as quatro versões já corrigidas. A primeira vem depois dela, como histórico: os oito bloqueantes dela fecharam. Os dois bloqueantes de hoje são novos e nasceram da correção.

# Segunda passada, 2026-10-13: as quatro versões depois da correção

Revisor independente. Julgadas as quatro versões, todas em `revisao_desatualizada`, pelo arquivo de hoje (`Chart.tsx` de 13:34:09 a 13:36:56; `data.ts` de 12:22 a 12:27 e, na `v2`, de 13:35; `meta.json` de 12:28 na `v1` e de 13:37 a 13:38 nas outras) e pelos PNGs de 13:38, posteriores a todos eles. A nota da primeira passada não serviu de régua; os critérios de aceite escritos nela foram reconferidos um a um, por medida nova. `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: `v1` e `v3` **aprovadas**; `v2` e `v4` **reprovadas, com um bloqueante cada**. As observações não bloqueantes estão no README do modelo, no parágrafo da segunda revisão.

Os dois bloqueantes têm a mesma raiz: o posicionamento cumpre uma regra (não cobrir outro ponto) e deixa sem dono o que acontece quando a regra não fecha. Na `v2` o ponto que não acha lugar cai na coordenada da cidade sem teste nenhum, e para debaixo do selo. Na `v4` os cachos se empurram sem limite, e um terço dos pontos vai parar fora do país.

## O que foi medido e o que não foi

* **Geometria:** lida do `preview.svg` de cada versão (centro e raio de cada círculo, elipses, âncora de cada texto, subcaminhos do path da `v3`), em px do `<svg>` do mapa. Os PNGs estão em escala 2, e o `<svg>` do mapa começa em (33; 86) na `v1`, na `v2` e na `v4`.
* **`v2`, posicionamento:** refeito fora do componente em JavaScript, com as mesmas constantes, a mesma semente e o mesmo `data.ts`. Reproduziu a tela ponto a ponto, inclusive a queda na origem. As variantes do "O que mudar" saíram dessa bancada.
* **`v3`, tinta:** os cinco paths rasterizados a 10 amostras por px. "Tinta à vista" é a área da união dos círculos; "área só dele" é a parte do círculo que nenhum outro do mesmo mapa cobre. A tinta por caixa de UF conta tudo o que cai na caixa, inclusive ponto de UF vizinha.
* **`v4`, contorno:** teste de ponto no polígono sobre o `BRASIL_OUTLINE` projetado, no centro de cada ponto; "inteiro fora" é o centro a mais de 1,95 px da borda. O centro de cada cacho saiu do primeiro ponto da espiral. Quilômetros a 111,2 km por grau, aproximados.
* **Contraste:** fórmula da WCAG sobre `app/src/styles/tokens.css`, com a cor composta sobre `--surface-sunken` e sobre `--surface-raised`, nos dois temas.
* **Refeito contra o `data.ts`:** totais, classes por haversine, contagens por escritório, por origem e por macrorregião, percentuais. Batem nas quatro.
* **Não renderizado:** o estado vazio das quatro e o ramo de macrorregião sem cidade da `v1`. Lidos no código.

## O que fechou da primeira passada

| Versão | Bloqueante de antes | Medida de hoje | Estado |
|---|---|---|---|
| `v1` | Ponto de Recife cortado pela borda do `<svg>` | Margem de 10 px. A tinta dos 42 pontos vai de x = 89,2 a 195,9 num `<svg>` de 204 px, e de y = 43,7 a 178,1 em 202 px | Fechou |
| `v1` | Macrorregião sem cidade escrita como 0, com ponto cheio | `Chart.tsx:183` a `189`: `null` escreve `formatUnavailable()` em `--text-muted`, sem amostra. Lido no código | Fechou |
| `v2` | A contagem saía do sorteio | Classe por haversine na coordenada da cidade (`Chart.tsx:118` a `121`). Refeito do dado: 33 de 74 dentro (45%), 41 fora, 16, 8 e 9 por escritório; a tela escreve o mesmo na linha de leitura, na legenda, na lista e na frase acessível. Nenhum ponto cheio fora da elipse (nível máximo 0,803) e nenhum anel dentro (mínimo 1,303). O dado caiu de 143 para 74 clientes, saída que a primeira passada ofereceu | Fechou |
| `v2` | Nome do escritório colado em anel de cliente | Centro da marca mais próxima de cada caixa de nome: 5,9 px (Brasília), 6,6 px (São Paulo) e 11,8 px (Belo Horizonte) | Fechou |
| `v2` | Elipse coberta por ponto | Nenhum ponto sobre o traço: o centro mais próximo fica a 3,73 px do eixo da elipse, com 0,5 px de vão entre as tintas | Fechou |
| `v3` | A origem pintada por último tomava o mapa; DF como borrão da cor do cartão | Um mapa por origem, sem contorno no path. Participação na tinta contra participação no dado: de 0,4 a 2,5 pontos no país, até 3,5 na caixa de SP, até 6,3 na do RJ (Mídia paga, 31,5% no dado e 25,2% na tinta). DF como mancha na cor da origem, de 3,25:1 a 7,20:1 contra o contorno do país | Fechou; a caixa do RJ passa 1,3 ponto do critério e vai como observação |
| `v3` | Slots 2 e 6 juntos, com a cor como único canal | Nome, contagem e percentual escritos sobre cada mapa | Fechou |
| `v4` | Pontos empilhados num disco de 3,22 px | Menor distância entre centros: 6,18 px, para pontos de 3,9 px com o contorno. Nenhum ponto cobre outro, e a área do cacho cresce com a contagem | Fechou, e é esta correção que abre o bloqueante de hoje |

## `v2_raio-de-atuacao-dos-escritorios`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 15; seção 14.1, constante com consequência no render (colisão)

**O que se vê.** Na elipse de São Paulo, um dos 16 pontos cheios está enfiado sob o selo do escritório, acima e à esquerda do ícone, nos dois temas. O ponto e o aro do selo têm a mesma cor (`--chart-1`), então o que sobra à vista lê como um calombo no aro.

**Evidência.** No `preview.svg` o ponto está em (107,52; 182,49), que é exatamente a coordenada projetada de Jundiaí, a 9,20 px do centro do selo, em (112,77; 190,05). O selo tem raio 8 mais 0,75 de traço e é pintado depois dos pontos (`Chart.tsx:272` a `278`): ficam cobertos 1,55 dos 4 px do preenchimento, 34% da área dele, ou 2,05 dos 5 px contando o contorno. No PNG o ponto fica em (281; 537). Os outros 73 cumprem tudo: os de dentro ficam de 12,04 a 16,49 px do centro do selo, os de fora têm nível de elipse de no mínimo 1,303, e o menor vão entre centros é de 5,40 px.

**Por que acontece.** `placeClients` começa cada cliente com `let chosen = origin` (`Chart.tsx:129`) e, quando as 900 tentativas falham, grava a origem sem passar por nenhum dos quatro testes. Na bancada, com a mesma semente, cai um cliente só: o segundo de Jundiaí. Não é azar do sorteio, são duas coisas somadas:

1. **A faixa é menor que o pedido.** O ponto de dentro só pode ficar entre 12 px do centro (`BADGE_CLEAR`) e o nível 0,809 da elipse. Em São Paulo essa faixa mede 348 px² e tem de 3,3 a 4,7 px de largura; em arranjo hexagonal a 5,4 px comporta cerca de 14 pontos, e o dado pede 16. Belo Horizonte comporta 13 para 8, e Brasília 12 para 9.
2. **O sorteio procura mal.** O raio de busca cresce até 95 px em volta da cidade, e quase todo candidato cai fora de uma faixa dessa largura.

**Por que reprova com um ponto só.** A 14.1 manda reprovar a constante cujo desvio aparece no render, e o teste dela é a colisão medida no preview. Aqui uma marca de dado fica sob um elemento opaco que não é dado, o `notes` do `meta.json` e o comentário de `placeClients` (linhas 111 a 115) dizem que todo ponto fica "longe do selo", e o ramo que falha não deixa rastro. O README manda trocar o `data.ts` pelo dado real: com mais clientes, o mesmo ramo empilha na coordenada da cidade todo ponto que não couber, e na cidade do próprio escritório essa coordenada é o centro do selo, onde o ponto some inteiro. É o "ponto empilhado deixa de contar" que reprovou a `v4` na primeira passada, à espera do primeiro recorte maior. Não é o caso do par Ribeirão Preto e Uberlândia da `v1`, que segue como observação: lá são dois pontos da mesma série, com contorno entre eles, 0,78 px de sobreposição e os dois à vista.

**O que mudar.**

1. Tirar a queda na origem: posição só entra em `placed` depois de passar nos quatro testes.
2. Trocar o sorteio de raio crescente por busca determinística da posição válida mais próxima da cidade (grade de 0,5 px em volta da origem, em ordem de distância). Continua sem `Math.random`, e o ponto fica o mais perto da cidade que a geometria deixa.
3. Se ainda assim faltar lugar, o ramo deixa rastro na tela: ou a legenda passa a "1 ponto = N clientes", com N calculado da capacidade, ou diz quantos clientes ficaram sem ponto. Nunca ponto sem teste.
4. Opcional, e melhora a leitura: selo de raio 7 ou 6. A faixa alarga, os pontos ficam mais perto da cidade e a coroa em volta do selo se desfaz.

**Testado só em bancada.** Com as constantes de hoje, a busca em grade coloca os 74 pontos sem nenhuma queda, com deslocamento máximo de 27,7 px; com selo de raio 7, máximo de 15,1 px; com raio 6, 13,5 px. Mexer só em constante, mantendo o sorteio, não fecha: selo de raio 7 derruba dois pontos, raio 6 derruba um de São José dos Campos, `MIN_GAP` de 5,0 ou 5,2, `EDGE_CLEAR` de 3,0 e 3.000 tentativas mantêm a queda de Jundiaí. Só a 23 px por grau o sorteio fecha, e aí o cartão `card` precisa ser reconferido. Bancada não é render: o corretor confere de novo depois de mudar o código, inclusive a caixa dos três nomes.

**Critério de aceite:** no dado padrão, 74 pontos; todo ponto de dentro a pelo menos `BADGE_CLEAR` do centro do selo e dentro da folga da elipse; todo ponto de fora além dela; nenhum par de centros a menos de `MIN_GAP`; e nenhum caminho no código em que um ponto entre na lista sem passar pelos testes.

### Itens de mesma rodada, que não bloqueiam

Estão no README, no parágrafo da segunda revisão: a amostra da legenda maior que o ponto, a frase "posição dentro da cidade" para pontos que ficam de 64 a 87 km dela, a ordem da lista por escritório e o 41 repetido na linha de leitura.

## `v4_leads-sem-municipio-fora-do-mapa`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 15 e 3; seção 14.1, encoding de posição

**O que se vê.** Um terço dos pontos está fora do país. Há um cacho inteiro no mar ao largo do Sudeste, outro mais abaixo, ao largo de Santa Catarina, pontos acima da costa do Ceará e pontos a oeste da fronteira com o Paraguai. Dentro do país, o Sul, o Sudeste e o Centro-Oeste viraram um tapete de pontos igualmente espaçados, em que não se separa uma cidade da outra. Aparece nos dois temas; no claro os pontos de fora ficam sobre o branco do cartão.

**Evidência.** Do `preview.svg`, 184 pontos: **64 (35%) têm o centro fora do contorno do país**, e 55 estão inteiros fora. O ponto mais longe da própria cidade é de São Paulo, a 61,2 px, cerca de 1.170 km.

| Cidade | Pontos | Centro do cacho, distância da cidade | Onde foi parar | Pontos fora do contorno |
|---|---|---|---|---|
| São Paulo | 36 | 38,7 px, cerca de 740 km | lon −52,8 e lat −21,1, no Mato Grosso do Sul | 3 |
| Curitiba | 10 | 30,7 px, cerca de 590 km | lon −45,6 e lat −29,2, no Atlântico | 10 |
| Londrina | 3 | 26,5 px, cerca de 510 km | dentro do país | 0 |
| Campo Grande | 4 | 25,9 px, cerca de 500 km | sobre a fronteira oeste | 3 |
| Maceió | 2 | 23,0 px, cerca de 440 km | dentro do país | 0 |
| João Pessoa | 2 | 22,2 px, cerca de 430 km | dentro do país | 0 |
| Rio de Janeiro | 18 | 18,7 px, cerca de 360 km | lon −40,6 e lat −24,7, no Atlântico | 18 |
| Vitória | 5 | 17,4 px, cerca de 330 km | no Atlântico | 5 |
| Fortaleza | 7 | 11,1 px, cerca de 210 km | acima da costa | 6 |
| Porto Alegre | 10 | 8,1 px | sobre a costa | 5 |
| Salvador | 9 | 6,1 px | sobre a costa | 5 |

Os outros 9 pontos de fora são de Campinas (3), Natal (2), Recife, Belém, São Luís e Aracaju (1 cada). Só Belém, Manaus, Porto Velho, Cuiabá, São Luís e Teresina ficaram com o cacho a menos de 1 px da cidade.

**Por que acontece.** Três coisas somadas, em `placeDots`:

1. **A espiral é mais aberta do que o comentário diz.** `CLUSTER_STEP * Math.sqrt(index + 0.5)` (linhas 100 e 101) dá a cada ponto 50 px² e de 6,2 a 7,2 px entre centros, e não os 4 px do comentário da linha 26; o ponto com contorno pede 3,9 px. Cada cacho ocupa cerca de 2,5 vezes a área de que precisa: o de São Paulo tem 52 px de diâmetro num mapa de 232 px, 9 graus.
2. **O afastamento não tem teto.** O relaxamento trata cada cacho como disco rígido e empurra os discos até não se tocarem; a atração de volta (`PULL` de 0,03) não segura. São Paulo e Campinas estão a 4,5 px uma da outra e os discos pedem 41 px entre centros.
3. **Nada testa o contorno do país.** O único limite é o retângulo do `<svg>` (linhas 93 e 94).

**Por que reprova.** Mapa de pontos afirma posição: o README do modelo diz que a leitura é onde há ponto e onde não há nenhum. Com os leads de São Paulo centrados no Mato Grosso do Sul e os do Rio de Janeiro no mar, o mapa afirma lugar e o lugar é falso, e "a posição em volta da cidade é ilustrativa" não cobre 740 km. A versão existe para mostrar que lead sem município não vai ao centroide "para não criar aglomerado falso", e o mapa dela agora leva para onde não há lead os leads que têm município.

**A correção fez o que a primeira passada pediu.** O parecer anterior mandou o cacho crescer com a contagem e os cachos vizinhos se afastarem, com dois critérios de aceite: nenhum ponto com menos da metade à vista e tinta em ordem com a contagem. Os dois estão cumpridos. Faltou ao pedido o limite: até onde um cacho pode ir, e que o ponto fique em terra. O defeito de hoje é novo e é consequência daquela receita, não descuido de quem corrigiu.

**O que mudar.** Decidir a posição ponto a ponto, e não cacho a cacho:

1. Para cada cidade, na ordem do dado (as maiores primeiro), cada ponto pega a posição válida mais próxima da cidade: centro dentro do polígono do país (o `insideRing` da `v3` serve) e a pelo menos 4 px de todo ponto já posto.
2. Sem disco rígido e sem relaxamento. Os pontos de cidades vizinhas formam uma massa só: São Paulo, Campinas e Ribeirão Preto viram uma mancha, e é isso que o dado tem ali.
3. A tela continua dizendo que a posição é ilustrativa, agora com o número: o maior deslocamento, calculado do desenho.

Se a espiral ficar, três condições: constante que dê 4 px entre centros (perto de 2,6 no lugar de 4), teto de deslocamento por cacho e teste de contorno ponto a ponto. Nem assim São Paulo e Campinas se separam sem sair do lugar, e por isso a primeira saída é a recomendada.

**Testado só em bancada.** A 5,8 px por grau, posição livre mais próxima numa grade de 0,5 px, centro dentro do contorno, 4,0 px entre centros, na ordem do dado: 184 pontos, nenhum fora do contorno, deslocamento máximo de 15,3 px (Campinas, cerca de 290 km) e médio de 6,3 px; o ponto mais longe de São Paulo fica a 14,7 px. Hoje o máximo é de 61,2 px. Com as cidades menores primeiro o máximo sobe para 24,0 px, em São Paulo: a ordem do dado é a melhor. Bancada não é render: o corretor confere de novo depois de mudar o código.

**Critério de aceite:** nenhum ponto com o centro fora do contorno do país; nenhum par de centros a menos de 3,9 px; no dado padrão, o ponto mais longe de cada cidade a no máximo 16 px dela, e esse máximo escrito na tela; 184 pontos para 3.680 leads.

### Itens de mesma rodada, que não bloqueiam

Estão no README: a amostra da legenda com raio de 2,7 px para ponto de 1,7 px, o "8,0%" de composição (NUM-1), a lista com 3 das 12 UFs sem dizer quantas ficaram de fora e o `?? 0` do card com `withoutCity` vazio.

## `v1` e `v3`: aprovadas

Nenhuma das duas tem "não" nas 32 perguntas. O que cada uma exercita das regras EIX, ROT, NUM, COR, TIP e ACE foi conferido de novo, além do que fechou acima.

* **`v1`.** Ponto um para um com raio fixo, série única em `--chart-1` (COR-1), sem legenda de série (ROT-1). 42 pontos no `<svg>` para 42 eventos; 0, 10, 7, 17 e 8 por macrorregião, refeito do dado e somando 42 no rodapé. Preenchimento a 0,80 sobre o contorno do país: 3,59:1 no claro e 7,20:1 no escuro (ACE-5). Zero medido do Norte em anel pontilhado com o 0 escrito, forma e número além da cor (EST-3, ACE-2); o anel mede 4,65:1 e 5,98:1. Uma anotação de 11 px com halo (ANO-1, ROT-7), texto a 7,04:1 e 9,36:1. Dois tamanhos de texto, 12 e 11 px, e nenhum peso 700 (TIP-2, TIP-3). Linha de leitura calculada: 17 sobre 42 dá 40%. Frase acessível de 149 caracteres. O par Ribeirão Preto e Uberlândia, a 4,42 px entre centros, é o único que se toca, e os dois se contam.
* **`v3`.** Pequenos múltiplos na mesma escala (EIX-9), cor por chave vinda do dado nos slots 1, 3, 6, 5 e 2 (COR-3, COR-8), cinco categorias (COR-4), nome com contagem e percentual sobre cada mapa (ROT-10, ACE-2). Percentuais 25, 32, 16, 4 e 23, somando 100 pelo maior resto (NUM-2); os totais por origem e os 9.800 refeitos do dado; 1.960 pontos contados no preview, 483, 634, 309, 87 e 447. Preenchimento a 0,80 sobre o contorno do país: de 3,25:1 a 3,84:1 no claro e de 4,65:1 a 7,20:1 no escuro (ACE-5, medido à mão). Nenhum ponto fora do contorno nem cortado pela borda do mapa. Frase acessível de 164 caracteres.

**Por que a saturação da `v3` é observação e não bloqueio.** É o item que mais pesa entre os que ficaram: a tinta à vista vai de 77% a 97% do nominal por mapa, 240 dos 1.960 pontos têm menos de 10% de área só deles, e na caixa do Rio de Janeiro e no Distrito Federal as origens saem iguais. Pesei como limiar e não como encoding por quatro razões. A tela declara a sobreposição e manda ler o número. O catálogo fixa o valor do ponto no slug e põe o Distrito Federal no `data.ts` como caso difícil de aglomeração. A leitura que o caso de uso pede é verdadeira: concentração no Sul e no Sudeste em todas as origens, e Eventos rala. E a participação de cada origem na tinta fica a até 2,5 pontos da participação em leads no país. Quem quiser fechar: aviso que fale de área saturada, e não só de UF pequena, e `MIN_GAP` valendo entre UFs vizinhas.

## Registro do parecer

```
Versão: 23_mapas/06_mapa-de-pontos/v1_eventos-presenciais-por-cidade
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 7, 18, 26, 27, 28, 29, 31, 32

Versão: 23_mapas/06_mapa-de-pontos/v2_raio-de-atuacao-dos-escritorios
Data: 2026-10-13
Resultado: reprovada
Não: 15
Correções:
  15. Seção 14.1, constante com consequência no render: um ponto de Jundiaí cai na origem sem teste e fica com 34% do preenchimento sob o selo de São Paulo; tirar a queda na origem e buscar a posição válida mais próxima da cidade, com rastro na tela se faltar lugar.
Não se aplica: 4, 6, 7, 18, 26, 27, 28, 29

Versão: 23_mapas/06_mapa-de-pontos/v3_um-ponto-a-cada-cinco-leads-por-origem
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 13, 18, 26, 28, 29, 31, 32

Versão: 23_mapas/06_mapa-de-pontos/v4_leads-sem-municipio-fora-do-mapa
Data: 2026-10-13
Resultado: reprovada
Não: 3, 15
Correções:
  3 e 15. Seção 14.1, encoding de posição: 64 dos 184 pontos saem do contorno do país e o cacho de São Paulo fica a cerca de 740 km da cidade; posicionar ponto a ponto, na posição livre mais próxima da cidade e dentro do polígono do país, com o maior deslocamento escrito na tela.
Não se aplica: 4, 6, 7, 13, 18, 26, 27, 28, 29, 31, 32
```

## Defeito de régua ou de ferramenta

* Nenhuma guarda mede marca contra o contorno geográfico nem marca de dado sob outro elemento. A `v4` passa no `check` com 0 avisos e 64 de 184 pontos fora do país; a `v2` passa com um ponto sob o selo.
* A `OPACIDADE-MARCA` sai com `sem_opacidade_em_marca` na `v3`, que tem `fillOpacity` de 0,80 no path: o `fill` vem de `SLOT_COLOR[...]` e a guarda só lê cor literal. O motivo impresso diz que não há opacidade, e há; o certo seria um motivo próprio, como cor não resolvida.
* O critério de aceite da `v4` na primeira passada não tinha teto de deslocamento nem teste de contorno, e a correção que o cumpriu produziu o bloqueante de hoje. Critério de aceite de posicionamento precisa dizer também onde a marca não pode ir.

# Primeira passada, 2026-10-13 (histórico)

Revisor independente, 2026-10-13. Julgadas as quatro versões, todas em `sem_revisao`, pelos arquivos de hoje (`Chart.tsx` de 12:28, `data.ts` de 12:22 a 12:28, `meta.json` de 12:28) e pelos PNGs de 12:28 e 12:29, posteriores a todos eles. `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: **as quatro reprovadas**. `v1` com 2 bloqueantes, `v2` com 3, `v3` com 2 e `v4` com 1.

O defeito que se repete em três delas tem uma causa só: o ponto é sorteado e depois tratado como se fosse dado. Na `v2` a contagem que responde ao caso de uso sai do sorteio, e não do `data.ts`. Na `v3` e na `v4` os pontos sorteados caem uns sobre os outros, e a tela deixa de mostrar a quantidade que a legenda "1 ponto = N" promete. A `v1`, que abre os pontos em anel e não empilha, é a única em que os 42 pontos se contam, e cai por um corte de borda e por um ramo de ausência.

O que está certo e não precisa mexer: projeção em escala 1 nas quatro (texto de 11 px chega com 11 px), semente fixa sem `Math.random`, ray casting, haversine e a elipse com `rx` corrigido pelo cosseno, estado vazio com `role="status"`, frase acessível de 146 a 165 caracteres, percentuais da `v3` somando 100 pelo maior resto, e os totais escritos, que batem com o `data.ts` nas quatro.

## O que foi medido e o que não foi

* **Geometria:** o posicionamento de cada versão foi refeito fora do componente, com as mesmas constantes e a mesma semente, lendo o `data.ts`. Bateu com a tela nas três que sorteiam: `v2` com 55 dentro e 36, 10 e 9 por escritório; `v3` com 1.960 pontos (483, 634, 309, 87 e 447 por origem); `v4` com 184 pontos.
* **Cobertura:** rasterização de 8 a 10 amostras por px, na ordem de pintura do componente. "À vista" é o preenchimento do ponto que não ficou sob outro ponto pintado depois.
* **Pixel:** lido dos PNGs de conferência, que estão em escala 2.
* **Contraste:** fórmula da WCAG sobre `tokens.css`, com a cor composta arredondada por canal. Os pontos ficam sobre o contorno do país, em `--surface-sunken`, e não sobre o cartão, e foi contra ele que medi. O mínimo é 3,24:1 (`--chart-6` a 0,80 no claro); `--chart-1` mede 3,59:1 a 0,80 e 3,92:1 a 0,85 no claro. Passa nas quatro. `--text-secondary` sobre `--surface-sunken` mede 9,36:1 e 7,04:1.
* **Distância de cor:** ΔE76 entre as cores compostas, com deuteranopia simulada pela matriz de Machado 2009. É simulação por matriz, não teste com pessoa.
* **Não renderizado:** o estado vazio das quatro e o ramo de macrorregião sem cidade da `v1`. Lidos no código.

## `v1_eventos-presenciais-por-cidade`: reprovada, 2 bloqueantes

### Bloqueante 1. Pergunta 15; ESP-3 com consequência no render

**O que se vê.** Um dos três pontos de Recife sai com o lado direito cortado em linha reta, nos dois temas. É a única marca do mapa sem borda redonda.

**Evidência.** O ponto tem centro em x = 182,80 e raio 2,6, mais 0,5 de contorno, e o `<svg>` tem 184 px de largura (`Chart.tsx:20` e `111`): 1,40 px dos 5,2 px do preenchimento ficam fora, 1,90 px com o contorno. No PNG claro, linha y = 300, a cor cheia do ponto vai de x = 427 a x = 433 e o branco começa em x = 434, sem pixel de transição; 434 é a borda direita do `<svg>` (66 mais 2 vezes 184).

**Por que acontece.** A caixa `GEO_BOUNDS` termina em `lonMax: -34`, Recife está em -34,9, e o anel de desempilhamento soma até 5,09 px (São Paulo) à coordenada. A caixa foi dimensionada para o contorno, não para o contorno mais o anel.

**O que mudar.** Dar folga ao desenho nos quatro lados: uma constante de margem de pelo menos 9 px (maior raio de anel, 5,09, mais o raio do ponto, mais o contorno) somada ao `viewBox` e à projeção, mantendo a escala 1. **Critério de aceite:** para todo ponto, `cx` e `cy` mais ou menos 3,1 px caem dentro do `<svg>`; o cartão `card` continua fechando.

### Bloqueante 2. Pergunta 8; EST-1b e DAD-2, ausência exibida como zero

**O que se lê no código.** `sumEvents` devolve `null` para a macrorregião que não tem nenhuma cidade na lista, como a regra pede, e a tela desfaz isso: `formatInt(region.events ?? 0)` em `Chart.tsx:183` escreve `0`, e a linha 181 escolhe a amostra por `region.events === 0`, então o `null` cai no ramo do ponto cheio. Com um recorte que só traga cidades do Sul, o rodapé escreve "Norte 0, Nordeste 0, Centro-Oeste 0, Sudeste 0, Sul 8", os quatro zeros com amostra de ponto cheio.

**Por que reprova sem aparecer no preview.** O `data.ts` desta versão define que zero é medido ("a cidade foi acompanhada e não recebeu evento"). Região sem cidade acompanhada é ausência de medida, e a 14.1 põe ausência exibida como zero entre o que bloqueia sempre. A EST-1b existe porque esse defeito mora no ramo e não na foto. O resto do componente já trata certo: `emptyRegions` filtra por `=== 0` e não promete "sem nenhum evento" para a região nula.

**O que mudar.** No rodapé, região com `events === null` escreve `formatUnavailable()` em `--text-muted`, sem amostra de ponto nem de anel, ou sai da lista. O anel pontilhado continua só para o zero medido.

### Para aproveitar a mesma rodada (não reprova, está no README)

A anotação "nenhum evento no Norte" passa da borda do contorno (ocupa de x = 20 a 95 e o país, nessa altura, vai de 36 a 75) e o halo em `--surface-sunken` pinta uma tarja sobre o cartão e apaga a fronteira embaixo dela; a âncora da anotação é constante (`NOTE_LON`, `NOTE_LAT`) e ficaria sobre o Amazonas mesmo que a região vazia fosse outra.

## `v2_raio-de-atuacao-dos-escritorios`: reprovada, 3 bloqueantes

### Bloqueante 1. Perguntas 1 e 3; seção 14.1, encoding: a contagem sai do sorteio, não do dado

**O que se vê.** A tela responde ao caso de uso com "38% dos clientes ficam a até 100 km de um escritório; 88 ficam fora do alcance". Em volta de cada selo de escritório há uma coroa de anéis vazados logo depois da elipse: são os clientes da própria cidade do escritório, desenhados e contados como fora do raio.

**Evidência.** Pela coordenada da cidade, que é o que o `data.ts` traz, ficam dentro do raio **86 de 143 clientes (60%)** e fora 57. A tela diz **55 (38%)** e 88. A diferença, cidade a cidade:

| Cidade | Clientes | Distância da cidade ao escritório | Dentro pelo dado | Dentro na tela | Distância dos pontos sorteados |
|---|---|---|---|---|---|
| São Paulo | 14 | 0 km | 14 | 4 | 88 a 120 km |
| Belo Horizonte | 10 | 0 km | 10 | 3 | 90 a 121 km |
| Brasília | 12 | 0 km | 12 | 1 | 100 a 121 km |
| Campinas | 9 | 83,6 km | 9 | 6 | 57 a 118 km |
| Sorocaba | 7 | 83,8 km | 7 | 6 | 74 a 104 km |
| Anápolis | 5 | 125,0 km | 0 | 1 | 89 a 146 km |

Das 36 pessoas que estão na cidade de um escritório, 28 foram contadas como fora do alcance dele. A lista "por escritório" herda o erro: São Paulo 36, Belo Horizonte 10 e Brasília 9, onde o dado dá 50, 17 e 19.

**Por que acontece.** `placeClients` (`Chart.tsx:82` a `97`) sorteia a posição de cada cliente e chama `nearestOffice` sobre o ponto sorteado (linha 92), não sobre a cidade. O sorteio soma até 0,4 grau, que são 44 km, e na cidade do escritório soma antes `OFFICE_CLEAR_DEG`, 0,706 grau ou 78 km, para tirar os pontos de baixo do selo (linhas 31 e 89). O raio de 100 km mede 0,899 grau. O `meta.json` registra a escolha ("a distância é medida no ponto espalhado") e a tela diz que a posição é ilustrativa: uma posição ilustrativa não pode decidir o número.

**O que mudar.** A classe de cada cliente sai de coordenada que está no `data.ts`: ou a da cidade (haversine sobre `row.lon` e `row.lat`), ou uma coordenada por cliente escrita no dado. O espalhamento, se continuar, é só desenho e nunca atravessa a elipse: o ponto de um cliente de dentro fica dentro, o de fora fica fora, e o cliente da cidade do escritório fica dentro do raio. **Critério de aceite:** com o dado atual, linha de leitura, legenda, lista e frase acessível escrevem 86 dentro (60%) e 57 fora, com 50, 17 e 19 por escritório; nenhum ponto cheio fora da elipse e nenhum anel dentro dela.

**A conta que o corretor vai encontrar.** A 17 px por grau a elipse de São Paulo tem 803 px² e o selo de raio 8 ocupa 201 px² dela. Pelo dado cabem ali 50 clientes, e um ponto com contorno ocupa 22,9 px². Não fecha sem mudar a geometria. Saídas, à escolha: subir a escala (o mapa usa 178 px dos cerca de 240 px de altura do corpo), trocar o selo por uma marca pequena na coordenada com o ícone e o nome fora da elipse, reduzir o raio do ponto, ou reduzir as contagens do `data.ts`, que é fictício, mantendo os casos de borda (Campinas, Ouro Preto, Formosa, Anápolis).

### Bloqueante 2. Perguntas 31 e 13; ROT-7 marca fina e GEO-4

**O que se vê.** O nome do escritório começa colado num anel de cliente: lê-se "○Brasília" e "○São Paulo". Um anel de cliente do Rio de Janeiro fica com a parte de baixo coberta pelo halo do nome "São Paulo", em cima do "a" de "Paulo".

**Evidência.** O nome é ancorado em `x + rx + 5` (`Chart.tsx:200` e `201`), entre 21 e 22 px do centro, e os clientes da cidade do escritório são sorteados entre 12 e 20 px do centro: a mesma faixa. A caixa do nome "São Paulo" vai de x = 113 a 172 e de y = 149 a 161, e há um ponto do Rio de Janeiro dentro dela.

**O que mudar.** Escolher a posição do nome depois de conhecer os pontos: testar direita, esquerda, acima e abaixo contra a lista de clientes e ficar com a primeira em que nenhuma marca cai na caixa do texto mais 3 px. Boa parte some com a correção do bloqueante 1, mas o teste precisa existir, porque o Rio de Janeiro continua ao lado.

### Bloqueante 3. Pergunta 15; sobreposição

**O que se vê.** Em São Paulo os pontos cheios, os anéis e a elipse viram uma mancha só. A borda dos 100 km, que é o que a versão existe para mostrar, não se segue com o olho.

**Evidência.** Em São Paulo, 64% do perímetro da elipse está coberto por ponto (35% em Belo Horizonte, 34% em Brasília); os 36 pontos cheios deixam à vista tinta equivalente a 21,3 pontos, e 15 deles têm menos da metade à vista.

**O que mudar.** Sai junto com a geometria do bloqueante 1. **Critério de aceite:** nenhum ponto com menos da metade do preenchimento à vista, e a elipse visível em pelo menos dois terços do perímetro nos três escritórios.

## `v3_um-ponto-a-cada-cinco-leads-por-origem`: reprovada, 2 bloqueantes

### Bloqueante 1. Pergunta 15; seção 14.1, encoding: a origem pintada por último toma o mapa

**O que se vê.** O Sul e o Sudeste são uma massa laranja no escuro e marrom no claro, a cor de Redes sociais. A linha de leitura, ao lado, diz que quem lidera é Mídia paga. No Distrito Federal, o ponto mais denso do dado, há um borrão da cor do cartão no lugar dos pontos.

**Evidência.** As origens são pintadas na ordem de `ORIGINS`, uma camada por cima da outra (`Chart.tsx:175` a `186`), e Redes sociais é a última. Participação no dado contra participação na tinta à vista:

| Recorte | Busca orgânica | Mídia paga | Indicação | Eventos | Redes sociais |
|---|---|---|---|---|---|
| País, dado | 24,6% | 32,3% | 15,8% | 4,4% | 22,8% |
| País, tinta à vista | 16,2% | 26,7% | 16,9% | 5,1% | 35,1% |
| Caixa de SP, dado | 25,0% | 30,8% | 15,9% | 4,5% | 23,7% |
| Caixa de SP, tinta à vista | 9,9% | 20,1% | 19,3% | 5,6% | 45,1% |
| Caixa do RJ, tinta à vista | 4,5% | 13,4% | 16,6% | 4,5% | 61,0% |
| Caixa do DF, tinta à vista | 2,0% | 5,9% | 4,5% | 3,8% | 83,8% |

Dos 1.960 pontos, 462 (24%) têm menos de 10% do preenchimento à vista e 932 (48%) têm menos da metade. Por origem, somem 40% dos pontos de Busca orgânica e 29% dos de Mídia paga, contra 5% dos de Redes sociais. A caixa de São Paulo tem 2.006 px² e recebe 396 pontos de 8 px² cada.

No Distrito Federal, 96 pontos (480 leads) caem numa caixa de 6,4 por 3,5 px: de 805 px² desenhados ficam 57 px² à vista (7%). E o que fica não é cor de origem: na caixa do DF no PNG, 67 de 104 pixels no claro e 78 de 104 no escuro estão na cor do cartão ou a menos de 40 níveis dela, nenhum está na cor de Redes sociais, e a média mede 1,03:1 e 1,30:1 contra o contorno do país. O caso difícil que o `data.ts` declara ("480 leads num polígono minúsculo") aparece como um vazio.

**Por que acontece.** Duas coisas somadas. Camada inteira sobre camada inteira dá a quem é pintado por último toda a área disputada. E o `stroke` de 0,4 px em `--surface-raised` num path único é pintado depois do preenchimento do path inteiro: onde os subcaminhos se sobrepõem, os contornos de todos os círculos riscam o preenchimento, e com dezenas empilhados o contorno vence.

**O que mudar.** Nenhuma origem pode ficar sistematicamente por cima, e o contorno não pode apagar o preenchimento. Duas saídas: (a) pequenos múltiplos, um mapa por origem na mesma escala (EIX-9), cada um com nome e total em rótulo direto; mantém um path por origem e a cor fixa, e o canvas `largo` comporta cinco mapas de cerca de 144 px; (b) mapa único com a pintura intercalada por sorteio de semente fixa entre as origens, em várias passadas, o que custa o path único por origem que o catálogo pede e não resolve o bloqueante 2. Nas duas, tirar o `stroke` do path. O DF não comporta 96 pontos em escala nenhuma deste canvas: a saturação se declara com o número escrito. **Critério de aceite:** a participação de cada origem na tinta à vista fica a até 5 pontos percentuais da participação no dado, no país e nas caixas de SP e RJ; e o DF aparece como marca com 3:1 contra o contorno do país nos dois temas.

### Bloqueante 2. Perguntas 11 e 19; COR-8 e ACE-2, identificação das marcas

**O que se vê.** Indicação e Redes sociais são duas origens em dois tons vizinhos, oliva e marrom no claro, mostarda e laranja no escuro, em pontos de 3,2 px de diâmetro. São justamente as duas camadas que ficam por cima.

**Evidência.** A versão usa os slots 1, 3, 6, 5 e 2. A COR-8 diz que 5 e 6 junto de 2 "exigem o vão da COR-5 e rótulo em cada marca", porque o par 2 e 6 mede 4,1 em deuteranopia no claro. Medido nas cores compostas a 0,80 sobre `--surface-sunken`: ΔE76 de 17,5 em visão normal e 3,6 em deuteranopia no claro; 23,1 e 14,2 no escuro. Os outros pares ficam de 46 a 102 em visão normal. Rótulo em cada um de 1.960 pontos não existe, então a origem do ponto só existe na cor.

**O que mudar.** A saída (a) do bloqueante 1 resolve os dois: com um mapa por origem e o nome em cima, a cor deixa de ser o único canal. Se o mapa único ficar, a quinta origem precisa de um segundo canal que se leia no tamanho do ponto, e o par 2 e 6 não pode estar junto.

## `v4_leads-sem-municipio-fora-do-mapa`: reprovada, 1 bloqueante

### Bloqueante 1. Pergunta 15; seção 14.1, encoding: o ponto empilhado deixa de contar

**O que se vê.** Toda cidade grande é um cacho do mesmo tamanho. O cacho de Brasília com Goiânia parece o maior do mapa, e o de São Paulo com Campinas, que tem mais que o dobro dos leads, parece menor.

**Evidência.** `SPREAD_DEG` de 0,7 grau dá um disco de 3,22 px de raio para pontos de 3,4 px de diâmetro (`Chart.tsx:25` e `29`): o disco comporta a área de 8,4 pontos, qualquer que seja a cidade.

| Cidade | Leads | Pontos | Tinta à vista, em pontos | Pontos com menos de 10% à vista |
|---|---|---|---|---|
| São Paulo | 720 | 36 | 4,7 | 25 |
| Rio de Janeiro | 360 | 18 | 5,6 | 6 |
| Belo Horizonte | 260 | 13 | 5,9 | 2 |
| Brasília | 220 | 11 | 5,6 | 2 |
| Aracaju | 20 | 1 | 1,0 | 0 |

São Paulo, com 36 pontos, mostra menos tinta que Belo Horizonte com 13. São Paulo mais Campinas (880 leads, 44 pontos) mostram 9,0 pontos de tinta; Brasília mais Goiânia (340 leads, 17 pontos) mostram 9,7. No mapa inteiro, os 184 pontos da legenda e da frase acessível deixam à vista o equivalente a 84,3, e 44 têm menos de 10% à vista. "1 ponto = 20 leads com município" não se lê.

**O que mudar.** O cacho cresce com a contagem: área do cacho proporcional ao número de pontos, com distância mínima entre centros de um diâmetro mais o contorno, em ordem fixa (o anel da `v1` é o padrão da casa; para 36 pontos serve a espiral de girassol), e os cachos vizinhos se afastam em vez de se cobrirem. O mapa usa 182 px dos cerca de 240 px de altura do corpo, então há escala para subir. Com o espalhamento maior, a tela passa a dizer que a posição em volta da cidade é ilustrativa; hoje só o `meta.json` diz. **Critério de aceite:** nenhum ponto com menos da metade do preenchimento à vista, e a tinta à vista de cada cidade em ordem com a contagem dela.

## Observações

As que não reprovam estão no `README.md` do modelo, na seção `## Observações da revisão (não bloqueantes)`, parágrafo de 2026-10-13.
