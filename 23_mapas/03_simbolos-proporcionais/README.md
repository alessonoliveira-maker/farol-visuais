# Símbolos proporcionais

## O que é

Um círculo por UF, com a **área** proporcional a um valor absoluto (clientes, receita, saldo), desenhado no centroide da UF sobre um contorno neutro do país. O raio sai de `rMax × √(valor ÷ máximo)`, a pintura vai do maior para o menor para os pequenos ficarem por cima, e a legenda de tamanho traz círculos de referência redondos, com o último degrau no máximo observado. Lê-se o tamanho e a posição; o número exato vai no rótulo das maiores UFs e na dica. O modelo cobre três variações da mesma ideia: o símbolo no centroide, o símbolo no centro do tile de uma grade e o cartograma de Dorling, em que a relaxação afasta os círculos sobrepostos.

**Neste catálogo não há a malha do IBGE.** A lista de imports do contrato é fechada e não tem o módulo `ufCentroides.ts`. O contorno do país (51 pontos) e os centroides (a 0,1 grau) vivem no `data.ts` de cada versão, escritos à mão e declarados como aproximados. O viewBox tem escala 1, com 5 px por grau, para o texto de 11 px chegar com 11 px.

## Quando usar

- Total absoluto por UF quando o coroplético premiaria as UFs grandes: clientes ativos, receita reconhecida, saldo de carteira.
- Dois valores da mesma grandeza no mesmo lugar, como meta vazada e realizado cheio.
- Magnitude com contexto geográfico, até cerca de 27 símbolos.
- Bolhas em grade quando o Nordeste oriental e o Sudeste se sobrepõem na malha.
- Dorling quando a magnitude deve dominar e a posição aproximada basta, com a distorção dita no subtítulo.

## Quando evitar

- Taxa ou percentual: use o coroplético (`23_mapas/02_coropletico-por-uf`) ou o tile grid (`23_mapas/01_tile-grid-por-uf`).
- Comparação precisa entre valores parecidos: a área engana; use as barras ordenadas (`02_barras-horizontais/01_barras-simples-ordenadas`).
- Relação entre duas medidas sem geografia: use as bolhas da família 09 (`09_dispersao-e-bolhas/03_bolhas`).
- Fluxo entre UFs: use a família 11, de fluxo e sankey.
- Itens individuais com coordenada: use o mapa de pontos (`23_mapas/06_mapa-de-pontos`).

## Anatomia

1. **Contorno do país:** polígono em `--surface-sunken` com traço `--line-subtle`. `--surface-overlay` não serve, porque no tema claro é o mesmo branco do cartão.
2. **Centroide:** `UF_CENTROIDS` no `data.ts`, em graus, projetado a 5 px por grau (`cx` pela longitude, `cy` pela latitude negada).
3. **Círculo:** raio pela raiz do valor sobre o máximo, sem piso (GEO-16). Preenchimento em `--chart-1`, `--positive` ou `--negative` com opacidade acima do mínimo medido (0,70 e 0,80; ACE-5), contorno na mesma cor.
4. **Ordem de pintura** do maior para o menor, por ordenação no componente.
5. **Legenda de tamanho** com degraus redondos abaixo do máximo e o máximo observado, calculado do dado (ROT-5b), pelo `formatInt` ou `formatCurrencyCompact`.
6. **Rótulo** de sigla e valor só nas maiores UFs, com halo `--surface-raised`, à direita do círculo a leste de 46° O e à esquerda a oeste dele.
7. **Estados fora da escala:** UF sem medição é anel pontilhado em `--text-muted` com a palavra indisponível; saldo zero é anel vazado em `--text-secondary`; meta sem realizado é só o tracejado; meta batida não ganha anel, porque ele ficaria sob o cheio e a borda vazaria.
8. **Raiz** `figure` com `aria-label` calculado do dado: quantas UFs, quem lidera, o que ficou sem medição.

## Versões

- `v1_clientes-ativos-no-centroide`: clientes ativos nos centroides, preenchimento a 0,70, legenda de três círculos e rótulo nas 5 maiores UFs.
- `v2_bolhas-em-grade-realizado-contra-meta`: círculo no tile da grade de 8 por 6, meta tracejada (pintada antes do cheio, só onde a meta não foi batida) e realizado cheio na mesma escala, visto e percentual onde a meta foi batida.
- `v3_dorling-receita-2025-e-2026`: dois painéis com relaxação de Dorling em `useMemo`, escala de raio comum, cor por macrorregião e aro no perímetro (legenda com as duas amostras), siglas fora do círculo com linha de chamada na margem do painel.
- `v4_saldo-de-clientes-negativo-e-zero`: tamanho pelo módulo do saldo, cor pelo sinal e segundo canal no desenho (alta cheia com +, queda em anel vazado com −, glifo dentro do círculo quando cabe e está livre), sinal escrito e saldo zero em anel vazado.

## Como colar no Farol

1. Trocar o `data.ts` pelo dado real por UF, mantendo a sigla como chave; os centroides e o contorno podem sair do módulo de geometria do Farol quando ele existir, no lugar do bloco escrito à mão.
2. Conferir que a UF sem medição chega como `null` e nunca como `0`.
3. Embrulhar num `VisualCard` e usar o `UnavailableState` do Farol no lugar do estado vazio inline.
4. No Farol, a dica nativa de `<title>` pode virar a `ChartTooltip`; o texto dela já traz o número que o rótulo não comporta.

## Referências

- Pedido registrado: a malha do IBGE como módulo de geometria (`ufPaths.ts` e `ufCentroides.ts`), fora da lista de imports da seção 6 do contrato; hoje o contorno é aproximado.
- Cartograma de Dorling: Dorling, D. (1991), *The Visualization of Spatial Social Structure*; a relaxação aqui é determinística, com 300 passos, retorno à origem de fator 0,02, folga de 12 px entre círculos e o limite do painel aplicado dentro do laço.
- Estudo da família: `_estudo/familias/23_mapas.md`.
- Arquivo do Farol de referência para formatação: `app/src/lib/format.ts`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, sobre os arquivos do mesmo dia. As quatro versões foram reprovadas, e os bloqueantes estão no parecer `validation/revisao_23_mapas__03_simbolos-proporcionais_2026-10-13.md`. O que segue não reprova e fica para quem tocar o arquivo.

- `v1`, `v3` e `v4`, TIP-7: a linha de leitura usa `truncate` e o conteúdo dela não está na frase acessível. Na `v1` a cauda carrega "as 5 maiores UFs somam 54%" e na `v4` carrega a conclusão, "+97 clientes". Hoje cabem com folga.
- `v1` e `v4`, TIP-3: siglas em peso 700, seis na `v1` e oito na `v4`, contra dois elementos da regra. Sem consequência no render.
- `v1` e `v4`, TIP-1: os números da linha de leitura e da nota da legenda não têm `tabular-nums`.
- `v1`, `v3` e `v4`: o halo em `--surface-raised` desenha uma tarja atrás das siglas que caem sobre o contorno do país, que é `--surface-sunken`.
- `v1`: 21 das 26 UFs medidas não têm sigla, por decisão do catálogo. Sem as divisas a posição identifica pouco; rever quando a malha existir.
- `v2`, redação da frase acessível: "maior marca em Santa Catarina" lê como o maior círculo, que é São Paulo. O sentido é o maior percentual da meta. Na legenda, "com percentual" pede "da meta".
- `v2`, EST-2: Tocantins escreve `formatUnavailable()` sem o ícone `Unplug`.
- `v2`: as 15 UFs abaixo da meta não têm o percentual escrito, por decisão do catálogo; AC com 60% e MT com 95% só se separam na dica.
- `v2`: 1,1 px entre o fundo do círculo de São Paulo e o topo da sigla; e a coluna 1 da grade, sem UF, deixa o desenho 35 px à direita do centro.
- `v3`, NUM-1: "+7% contra 2025" deveria levar uma casa, "+6,9%".
- `v3`, NUM-5: o "total" dos cabeçalhos soma as 27 UFs e a pergunta é sobre o perímetro; a frase acessível também não cita o perímetro.
- `v3`, redação: "O contorno cinza mostra o lugar real das UFs" promete mais do que há, porque o contorno é do país, sem divisas.
- `v3`, `notes`: cita `REGION_SLOT`; a constante do `data.ts` é `REGION_COLOR`.
- `v3`: os painéis e a legenda somam 894 px fixos e fecham o canvas `largo` sem folga; e a relaxação leva o Paraná de 38 a 42 px para o norte, acima de Mato Grosso do Sul.
- `v4`, `notes`: diz "anel pontilhado" para o saldo zero; o código e a legenda desenham anel contínuo.
- `v4`, TOK-4: vermelho sobre verde a 0,80 gera uma terceira cor na lente (MG sobre SP, RS sobre SC); o contorno na cor do sinal segura a leitura.
- `v4`, NUM-6: os degraus da legenda de tamanho e o título dela não dizem "clientes".
- Régua: a `RAIO-CONTRA-AREA` compara o raio declarado com o valor e não vê tinta comida por traço na cor do cartão; foi assim que a `v2` passou no `check`.

Segunda revisão de 2026-10-13, sobre os arquivos corrigidos no mesmo dia (`Chart.tsx` de 13:07 a 13:13, PNGs de 13:14). `v1`, `v2` e `v4` aprovadas; `v3` reprovada por um bloqueante, o Piauí sem sigla no painel de 2026, descrito na segunda passada do parecer `validation/revisao_23_mapas__03_simbolos-proporcionais_2026-10-13.md`. Do parágrafo acima, fechou a lente de terceira cor da `v4` (a queda virou anel vazado) e mudou a nota do Paraná na `v3` (ver abaixo); as demais seguem como estavam. O que segue é novo e não reprova.

- `v1`: o traço de 1,25 px centrado no raio soma área que o valor não tem nas marcas mínimas: Amapá (12 clientes, raio de 1,8 px) desenha 82% a mais, Acre 55%, Tocantins 34%; São Paulo, 5%.
- `v1`: o preenchimento a 0,70 sobre o contorno do país mede 2,99:1 no tema claro pela conta dos tokens (3,02:1 lido do pixel na primeira passada); quem segura a marca é o contorno sólido, a 5,20:1.
- `v1`: a ponta da linha de São Paulo cai a 3,5 px de Goiás, no encontro dos dois círculos. Passa na régua de 3 px; um ponto de 2 px no fim da linha deixaria o dono fora de dúvida.
- `v1`, DAD-9: o recorte de período do `data.ts` (fim do 3º trimestre de 2026) não aparece no cartão nem na frase acessível.
- `v2`: anel da meta e cheio medem 1,16:1 entre si no escuro e 1,35:1 no claro e encostam sem vão. Abaixo da meta a marca lê como engrenagem, e a tinta visível do anel soma de 15% (MG) a 62% (AL) da área do cheio, 145% no Acre e 172% em Roraima. O estado lê; a distância até a meta, não. Escrever o percentual também abaixo da meta, em neutro, tiraria o peso do anel.
- `v2`: em Roraima e no Acre o anel de 1,5 px tem raio de 1,6 e 1,9 px e não lê como anel; a marca é um borrão de 4 a 5 px.
- `v2`, `notes` do `meta.json`: ainda diz que, com a meta batida, o tracejado vai por dentro em `--surface-raised`; o código não desenha anel nesse caso.
- `v2`: na legenda, "Bateu: visto e %" não diz "da meta", e o "(11 de 27)" está sem `tabular-nums` (TIP-1).
- `v3`: cada painel é relaxado sozinho, e a mesma UF muda de lugar de um ano para o outro: Mato Grosso do Sul 45 px, Espírito Santo 34 px, Paraná 31 px, Tocantins 23 px. Em 2025 o Paraná fica ao sul de Mato Grosso do Sul e em 2026 ao norte. Uma relaxação só, com o maior raio dos dois anos, poria cada UF no mesmo lugar nos dois painéis.
- `v3`: o traço de 1 px em `--surface-raised` das 5 UFs fora do perímetro cobre meio pixel do cheio: a área visível fica entre 64% (Roraima em 2026) e 84% (Rondônia em 2026) da declarada, e no tema claro ele aparece como aro branco fino sobre o contorno do país. Tirar o traço resolve os dois.
- `v3`: no painel de 2025 a linha de chamada de Tocantins mede 147 px e atravessa o Norte, a 5,2 px do Acre.
- `v3`: a sigla MA fica a cerca de 5,8 px do círculo dela nos dois painéis (as demais, de 2,3 a 3,4 px) e, em 2026, a 5,6 px do Ceará. Distâncias de rótulo com largura de texto estimada, aqui e nas duas linhas da `v4` abaixo.
- `v3`, comentário do `Chart.tsx`: `ITERATIONS` vale 300 e o comentário acima dela diz 120 passos; o catálogo também diz 120. No `notes`, "a sigla sobe para cima do círculo" já não descreve o desenho.
- `v4`: o rótulo "SC +42" fica a cerca de 1,6 px do contorno do Paraná e a 3,4 px do de Santa Catarina. A linha de chamada de "PR +28" desfaz a dúvida, mas o dono não é o círculo mais próximo; recusar o lugar ao lado quando um vizinho está mais perto que o dono.
- `v4`: "MG −30" fica a cerca de 3,1 px do anel de Minas Gerais e a 3,3 px do ponto do Espírito Santo, que tem saldo de +1.
- `v4`: cheio pequeno pintado depois cobre trecho de anel: 18% do contorno de Minas Gerais sob Goiás e Distrito Federal, 22% do de Rio Grande do Norte sob Paraíba, 6% do de Rio de Janeiro sob Espírito Santo. Os três anéis seguem legíveis.
- `v4`: a legenda diz "cheio, com +" e "anel vazado, com −", e o glifo aparece em 2 das 14 altas e em 4 das 10 quedas. Quem carrega o sinal em todas é o cheio contra o vazado.
- `v4`, `notes` do `meta.json`: descreve o desenho anterior (preenchimento a 0,80 nos dois sinais, saldo de 1 sempre como círculo cheio). Hoje a queda é anel vazado, e Tocantins, com −1, é anel como o zero, separado dele pela cor, pela espessura e pelo "0" escrito.
- `v4`: "3º trimestre de 2026" está escrito à mão na frase acessível, fora do dado.
- `v4`: a amostra "Cresceu" da legenda tem raio de 5,5 px mais traço numa caixa de 12 px e perde 0,1 px de cada lado; não se vê.
- Régua: nenhuma guarda compara rótulo esperado com rótulo desenhado. A sigla que o `placeLabels` da `v3` desiste de pôr some sem aviso no `check`.

## Pendências conhecidas

- `v3`, identificação: no painel de 2026 o Piauí (círculo azul entre DF, PE e MG) fica sem sigla, porque nenhuma linha de chamada sai dele sem tocar vizinho; está na dica. Falta uma coluna de margem superior ou inferior para esse caso.
- `v1`, `v3` e `v4`, linha de chamada: a rotina `placeLabels` agora ancora a linha em ponto livre do círculo dono e recusa trajeto a menos de 3 px de outro círculo ou sobre outro rótulo; quando nada passa, o rótulo cai no primeiro candidato (`free` falso).
