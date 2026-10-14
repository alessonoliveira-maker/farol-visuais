# Waffle em barras

## O que é

Colunas feitas de células contáveis sobre um eixo de categorias: a altura segue comparável como numa coluna comum, e cada célula vale uma quantidade declarada na legenda (1 agenda, 10 leads). O `BarChart` do Recharts entrega a banda, a dica e a `ReferenceLine`; um `shape` próprio no `Bar` desenha os `rect` de baixo para cima, com o mesmo número de células por linha em todas as colunas, preenchendo cada linha da esquerda para a direita. O eixo de valor fica oculto e o valor exato vai escrito no topo da coluna, porque a altura da célula só bate com a escala quando o domínio sai da razão entre a altura do gráfico e a altura da célula. Só a última célula pode ser parcial, e sempre com aviso na legenda.

## Quando usar

- Contagem por categoria que o leitor quer contar, até cerca de 300 unidades por coluna (a v4 sobe a célula para 10 quando passa disso).
- Agendas, reuniões ou vitórias por dia ou por mês, em que cada célula é uma coisa real (v1, v3).
- Contagem contra uma referência fixa, como a meta diária, desenhada como `ReferenceLine` que cai na borda de uma célula (v2).
- Composição por origem dentro de cada coluna, com poucas categorias e célula de uma unidade (v3).

## Quando evitar

- Contagens grandes sem necessidade de contar: colunas comuns (03).
- Mais de 12 a 15 categorias: as células ficam pequenas demais; colunas (03) ou linha (04).
- Valor contínuo em reais ou horas, sem unidade contável honesta: colunas (03).
- Diferença fina entre categorias próximas: barras horizontais ordenadas (02/01).
- Parte de um todo sem eixo de categoria: waffle 10 por 10 (22/01).
- Distribuição de uma medida por item, como dias no funil: dot plot empilhado (16/09).

## Anatomia

1. **Coluna de células:** `Bar` com `shape` próprio que desenha `rect` de baixo para cima, `PER_ROW` células por linha, vão de 2 px e raio de 2 px. A cor vai por `var(--chart-N)`; o neutro é `--text-muted`.
2. **Domínio calculado:** o corpo é medido por `ResizeObserver`, as linhas que cabem são `floor(altura do gráfico / (célula + vão))` e o `YAxis` oculto recebe `[0, linhas x células por linha]`. Assim a célula sai quase quadrada e a `ReferenceLine` cai na célula certa.
3. **Valor no topo:** `LabelList` com `content` próprio, a 10 px do topo da última linha desenhada, em `font-display` por `formatInt`. O valor escrito é o dado, nunca a contagem de células.
4. **Legenda de unidade:** amostra na forma da célula e o texto "1 célula = N unidades" sempre visível; amostra de célula parcial e de ausência tracejada só quando o desenho as tem. Na v3 a ausência (sem origem declarada) é célula vazada, sem preenchimento e com contorno `--text-muted`, na célula e na amostra, e o eixo escreve `parcial até 12/10`.
5. **Referência (v2):** `ReferenceLine` com `ifOverflow="extendDomain"`, traço tracejado em `--text-muted` e rótulo na margem direita, mais a distância escrita no topo das colunas abaixo dela, com halo.
6. **Ausência e zero (v4):** mês sem coleta é contorno tracejado de duas linhas com o ícone `Unplug` e `formatUnavailable()`; zero medido é só a régua da base com o 0 escrito.
7. **Célula como botão (v3):** `rect` com `role="button"`, `tabIndex` e rótulo que cita a oportunidade, a origem e o mês, na ordem de preenchimento; a prop `onOpenOpportunity` recebe o id.
8. **Dica:** `ChartTooltip` com o que o desenho não escreve: dia por extenso e data (v1, v2), contagem por origem (v3) e células desenhadas (v4).
9. **Frase acessível:** na raiz, calculada do dado, com a unidade e o recorte; as células são `aria-hidden`, exceto na v3, onde são botões e a raiz é `role="group"`.

## Versões

- `v1_agendas-por-dia-util`: cinco dias úteis, célula de 1 agenda, três células por linha, valor no topo e legenda de unidade. Canvas `card`.
- `v2_agendas-contra-meta-diaria`: meta de 18 por dia como `ReferenceLine` na borda da célula 18, dias abaixo em `--chart-1` com "faltaram N" no topo e os demais em neutro, com um dia exatamente na meta. Canvas `card`.
- `v3_vitorias-por-mes-e-origem`: dez meses de 2026, células empilhadas por quatro origens e uma categoria de ausência, cada célula um botão, outubro marcado como parcial no eixo. Canvas `largo`.
- `v4_leads-por-mes-em-celulas-de-dez`: célula de 10 leads porque junho passa de 300, 347 com a última célula em 70% e o valor exato no topo, julho sem coleta tracejado e agosto com zero medido. Canvas `card`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e passe o dado real pela prop `data`.
2. Ponha a peça numa célula com altura definida: o domínio nasce da altura medida do corpo, e sem altura o `ResponsiveContainer` não desenha. O card de 360 px de altura é o mínimo para a v1, v2 e v4; a v3 pede o `largo`.
3. Mantenha a cor por categoria vinda do dado (`slot` na v3), nunca derivada da posição na lista ordenada.
4. Na v3, ligue `onOpenOpportunity` à rota da oportunidade; sem a prop as células ficam como botões sem ação.
5. Os estados vazio e indisponível estão inline; ao colar, troque por `EmptyState` e `UnavailableState` do Farol mantendo o texto.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/` e confira os dois temas.

## Referências

- Estudo da família: `_estudo/familias/22_unidades-waffle-e-pictograma.md`.
- Molde Recharts da estrutura: `02_barras-horizontais/03_barras-empilhadas/v1_pipeline-por-estagio`; molde de waffle da família: `22_unidades-waffle-e-pictograma/01_waffle`.
- Os previews usam vão de 20% da banda de cada lado, fora dos 30% a 40% da ESP-2, porque a coluna precisa de largura para três ou quatro células por linha; cada `meta.json` declara a conta.

## Observações da revisão (não bloqueantes)

**2026-10-12, primeira revisão das quatro versões.** As quatro foram reprovadas, cada uma por um bloqueante, e o parecer está em `validation/revisao_22_unidades-waffle-e-pictograma__02_waffle-em-barras_2026-10-12.md`. O que segue não reprova e fica para quem tocar o arquivo.

- `v1`, `v2`, `v3`, `v4`: `barCategoryGap` de 20%, fora dos 30% a 40% da ESP-2. Declarado no `notes` e sem consequência no render: as colunas não se tocam e a célula fica entre 12,5 e 21 px.
- `v1`, `v2`, `v3`, `v4`: o valor do topo é o número solto, sem o substantivo que a NUM-6 pede. A unidade está na legenda (`1 célula = 1 agenda`), a poucos pixels, e a leitura não se perde.
- `v2`: `faltaram 3` e `faltaram 5` ficam a 1,5 px da linha da meta (tinta até a linha 346 do PNG, traço cheio a partir da 350) e o halo apaga a franja de cima do traço. Lê, mas a linha passa a parecer sublinhado do rótulo. A posição é fixa em 15 px acima do valor e não olha a linha: com passo de célula entre 22 e 33 px a linha atravessa o rótulo, e ali a ROT-7 manda mover o rótulo, não confiar no halo.
- `v2`: a prop `goal` aceita meta que não é múltiplo de 3. Nesse caso a linha cai no meio de uma linha de células, some atrás delas e pode atravessar o valor do topo. Declarar o limite na prop ou tratar o caso.
- `v2`: `faltaram N` e `meta 18 por dia` saem em Manrope sem `tabular-nums` (TIP-1).
- `v2`: o rótulo da meta usa `--text-secondary` e a ANO-2 pede `--text-muted`; o tracejado é `4 4` e a 17.2 diz `3 3`. Sem consequência visível.
- `v2`: o par destaque contra neutro (`--chart-1` contra `--text-muted`) mede 1,82:1 no escuro e 1,12:1 no claro e não está no `notes`, como a TOK-9 pede. O segundo canal existe: a anotação `faltaram N` e a posição sob a linha.
- `v3`: o eixo escreve só `parcial` em out/26. O dia até onde o mês foi contado (12/10/2026) existe só na frase acessível, e a EIX-10 pede a nota `parcial até` com a data (armadilha DAD-9). Vale levar na rodada de correção.
- `v3`: o comentário do `data.ts` diz que falta origem em quatro meses; o dado tem três (mar, mai e jul).
- `v3`: sem `onOpenOpportunity` as 199 células continuam com `role="button"` e `tabIndex`, isto é, 199 paradas de teclado que não fazem nada. Tirar o papel e o foco quando a prop não vem.
- `v3`: legenda e dica seguem a ordem da base ao topo, dita em palavra na própria legenda. A ROT-4 fala em pilha lida de cima para baixo; aqui a declaração escrita resolve.
- `v3`, `v4`: o payload da dica passa por `as unknown as ChartTooltipProps['payload']`. Compila, mas esconde do tipo qualquer mudança no `ChartTooltip`.
- `v4`: a célula parcial de 20% de abr/26 vira um filete de 2,5 px, que é o aviso de ESPESSURA-MARCA do `check`. O encoding está certo e o valor exato está no topo; o filete lê mais como traço do que como célula.
- `v4`: recorte com meses, mas todos sem coleta, cai no bloco de vazio com o ícone `Filter` (`totalOf` devolve nulo). Vazio e indisponível se misturam nesse ramo, que o preview não exercita: lista vazia pede o bloco de vazio, e meses sem coleta pedem o desenho tracejado de cada mês.

**2026-10-12, segunda passada, depois da rodada de correção.** As quatro foram aprovadas, julgadas pelo arquivo e pelos PNGs das 09:06. Saíram os dois bloqueantes: o descendente dos tiques está inteiro em `v1`, `v2` e `v4` (eixo de 28 px, 6 linhas de tinta sob a linha de base e 6 livres até a borda, nos quatro PNGs de cada uma), e a ausência da `v3` é vazada na célula e na amostra. Também saíram três observações da primeira revisão: `faltaram N` longe da linha da meta (`v2`), `parcial até` com a data no eixo e o comentário do `data.ts` (`v3`). As demais observações de cima continuam valendo como estão. O que segue é novo ou mudou de número.

- `v3`: a célula vazada só recebe clique no contorno de 1,5 px. Com `fill="none"` e sem `pointerEvents="all"` (`Chart.tsx:167` a `180`), o miolo não é alvo do ponteiro: clique no centro medido no navegador, 0 eventos; no contorno, 1. O teclado funciona. São as 3 vitórias sem origem declarada, justamente as que alguém vai querer abrir. O parecer da primeira passada pedia manter a área clicável e a correção não fez. Corrigir antes de colar no Farol com `onOpenOpportunity`. Não reprova porque nenhuma pergunta do checklist nem regra do contrato cobre alvo de clique.
- `v3`: a data do tique sai de `formatDate(until).slice(0, 5)` (`Chart.tsx:211`), corte à mão que depende do desenho do formatador. O eixo mostra `12/10` e a frase acessível diz `12/10/2026`; o ano está na linha de cima do tique (`out/26`).
- `v3`: `parcial até 12/10` sai em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
- `v3`: o `notes` do `meta.json` ainda diz só que a ausência "fica em --text-muted e por último", sem dizer que é vazada. O README já diz.
- `v3`: na dica, a ausência recebe amostra cheia em neutro (`color: originColor(origin)`), enquanto a marca é vazada; o rótulo acessível da célula lê "origem sem origem declarada"; e a amostra vazada da legenda é feita com `boxShadow` interno, onde a `v4` usa `border`. Três acertos de redação e de coerência, nenhum visível no preview.
- `v2`: os valores `15` e `13` ficam 3 px abaixo da linha da meta (linhas 351 a 356 do PNG livres) e `faltaram 3` e `faltaram 5` 6 px acima. A linha passa inteira entre os dois e o halo não a corta. Lê bem; fica o registro da folga.
- `v2`: a regra que sobe o rótulo (`Chart.tsx:157` e `158`) usa 15, 8 e 14 soltos, sem constante nomeada no topo.
- `v2`: a linha da meta cabe no vão de 2 px entre a sexta e a sétima linha de células, mas a 0,07 px da borda de cima (traço de 60,36 a 61,36; vão de 60,29 a 62,29). O passo da célula sai da altura medida do corpo (213,5 px) e a escala do Recharts usa 214. Sem consequência visível.
- `v4`: o `p` de `indisponível` fica a 2 px do contorno tracejado de jul/26 (tinta até a linha 536 do PNG, traço a partir da 541). Não encosta e a palavra lê inteira.
- `v4`: o limiar de 300 com célula de 1 lead não cabe no `card`. Leitura do código, ramo não renderizado: com 4 células por linha cabem 11 linhas quase quadradas, 44 leads; acima disso a célula achata, e com 300 leads ela mede 0,15 px de altura. O limiar vem do catálogo; vale baixá-lo ou derivá-lo das linhas que cabem.

## Pendências conhecidas

- `v4`, ESPESSURA-MARCA: a célula parcial de 20% de abr/26 vira filete de 2,5 px (aviso esperado, encoding correto, valor exato no topo).
- `v3`: sem `onOpenOpportunity` as células seguem com `role="button"` e `tabIndex`; falta tirar o papel e o foco quando a prop não vem.
- `v2`: `goal` que não é múltiplo de 3 cai no meio de uma linha de células; falta declarar o limite na prop.
