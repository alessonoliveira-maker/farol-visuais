# Linha do tempo de marcos

## O que é

Eventos de duração zero, cada um posicionado na data exata sobre um eixo de tempo contínuo. O losango marca o evento, o rótulo diz o nome e a data, e uma linha tracejada marca hoje. A escala é sempre a do calendário: dois marcos a catorze dias um do outro ficam colados, e o seguinte, a três meses, fica longe. Lê-se da esquerda para a direita; o que decide a leitura é a distância entre marcos, e por isso o espaçamento nunca vem da ordem na lista.

## Quando usar

- Eventos pontuais com data exata, de 4 a cerca de 25 no período exibido.
- Acompanhamento de plano: marcos atingidos, em curso e futuros contra a data de hoje.
- Contar a história de um período com poucos eventos, cada um com título e uma frase.
- Comparar a cadência de marcos entre públicos em faixas sobre o mesmo eixo.

## Quando evitar

- Eventos com duração relevante: use o Gantt (20/01).
- Etapas sem data e só com ordem: use o stepper de etapas (20/03).
- Eventos com magnitude que precisa ser comparada: use a linha do tempo de círculos (20/08).
- Eventos que explicam uma métrica: marque sobre a série com `ReferenceLine` (04/01).
- Mais de 15 eventos com texto descritivo: use o feed vertical em cartões (20/06).

## Anatomia

1. `ScatterChart` com `XAxis` numérico em milissegundos UTC, domínio de mês cheio e ticks mensais gerados em TypeScript, escritos por `formatMonthShort` (EIX-4).
2. `YAxis` numérico escondido (`hide`), com a faixa em `y = 0`; nas versões de várias faixas, `y` é o índice da faixa e o tique é escrito pelo nome do público. Nunca eixo de categoria: `Scatter` sobre categoria abre uma banda por ponto (REC-14).
3. Losango em `--chart-1` com contorno `--surface-raised`, tamanho por `ZAxis` (área em px², REC-15 e REC-31).
4. Eixo da faixa em `ReferenceLine` com `--line-strong` e `ifOverflow="extendDomain"` (REC-1).
5. Rótulo com nome e data (`formatDate`), alternado acima e abaixo pela ordem de data, com halo `--surface-raised` (ROT-7). Na `v4` a anticolisão é calculada em TypeScript: escada de três alturas, linha guia fina e a regra de que nenhum texto fica no caminho da guia de outro.
6. Linha de hoje vinda do dado: `ReferenceLine` tracejada em `--text-muted`, com a data escrita. O chart nunca lê o relógio.
7. Linha de leitura acima do gráfico, calculada do dado (ANO-5), e frase acessível de 100 a 250 caracteres na raiz (ACE-1).
8. Estado vazio com `Filter` e frase (EST-1); toda agregação sobre a lista devolve `number | null` ou `null` (EST-1b).

## Versões

- `v1_marcos-do-plano-comercial-2027`: seis marcos do plano de 2027 e a linha de hoje. Demonstra `Scatter` com losango sobre `XAxis` em milissegundos UTC, espaçamento pela data real, ticks mensais gerados em TypeScript e rótulo alternado acima e abaixo com a data por `formatDate`.
- `v2_regua-de-marcos-com-estado`: cinco marcos do trimestre com estado. Demonstra três estados pela forma (cheio, núcleo, vazado), trecho percorrido em traço cheio, marco atrasado em `--negative` com a contagem de dias e marco sem data confirmada tracejado com a data prevista entre parênteses.
- `v3_narrativa-do-ano-da-pre-vendas`: oito eventos de 2026 em cartões de título e frase. Demonstra cartões em SVG posicionados por `useXAxisScale` e `usePlotArea`, conector curto até o ponto, escala real declarada e borda de destaque no evento que mexeu na taxa, com a taxa derivada das contagens de contatos e reuniões (taxa com volume na mesma linha) e a variação calculada do par antes e depois, e vão mínimo de 8 px entre cartões do mesmo lado.
- `v4_marcos-por-publico-com-semana-lotada`: 25 marcos de 2027 em quatro públicos. Demonstra quatro faixas com a mesma escala e hoje cruzando todas, rótulos em escada de três alturas com linha guia e busca com retrocesso (nenhum marco único fica sem nome), marcos do mesmo pixel agrupados em um losango com contador e lista na dica, e a coluna "a definir" para os marcos sem data.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/<NomeDoComponente>/`.
2. Troque o `import` do `./data` pelo dado real. Datas em `YYYY-MM-DD`; a ordenação, o domínio do eixo e os ticks mensais se recalculam sozinhos.
3. Passe `today` (prop opcional) com a data de referência da página; sem ela vale a do `data.ts`. Não use a data do navegador dentro do chart.
4. Na `v2`, entregue `state` e `confirmed` por marco; o atraso é calculado (não atingido com data anterior a hoje) e nunca vem pronto do dado.
5. Na `v4`, marco sem data entra com `date: null`: não filtre a linha fora e não lance uma data no fim do ano. Ajuste `MARGIN.right` se os nomes da coluna "a definir" forem mais longos.
6. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
7. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, Scatter Chart](https://recharts.github.io/en-US/examples/): `Scatter`, `shape`, `ZAxis` e `ReferenceLine` com `segment`.
- Hooks `useXAxisScale`, `useYAxisScale`, `usePlotArea` e `useChartWidth` do Recharts 3.10.1, usados na `v3` e na `v4` para posicionar cartões e rótulos.
- Tufte, E. *The Visual Display of Quantitative Information*: o dado no lugar onde ele acontece, sem moldura em volta.
- Arquivo do Farol de referência: `app/src/components/visuals/charts/chartTheme.ts` (eixo, animação) e `ChartTooltip.tsx` (dica).
- Pedido ao Farol: nenhum formatador de intervalo entre datas em `@/lib/format`; a contagem de dias sai de milissegundos UTC dentro do componente.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-08, primeira passada das quatro versões. Medido nos `preview.svg` e nos PNGs de `_render/.qa/` (2 px de imagem por px de CSS). O que reprovou as quatro está em `validation/revisao_20_cronograma-e-linha-do-tempo__02_linha-do-tempo-de-marcos_2026-10-08.md`, não aqui.

- `v1`, `v2`, `v3`: a grade ganha uma linha na borda direita sem tique, porque o domínio termina 14 dias depois do início do último mês e o Recharts fecha a grade na borda da plotagem. Lê-se como um mês curto sem nome. A `v4` termina o domínio em início de mês e não tem a linha solta.
- `v1`, `v2`, `v4`: a linha de hoje usa tracejado `4 4`; a tabela 17.2 dá `3 3` de 1 px ao papel de referência. Sem consequência no preview.
- `v1`, `v2`, `v4`: o nome do marco sai em 11 px; a tabela 17.1 dá 12 px ao rótulo de categoria. Acima do piso da TIP-2, sem consequência no preview.
- As quatro: os números da linha de leitura estão fora de `tabular-nums` (TIP-1), e o rótulo "hoje" com a data, na `v1`, na `v2` e na `v4`, sai sem `font-display`. É frase corrida, sem coluna a alinhar, por isso não reprova.
- `v1`: alternar acima e abaixo pelo índice não é anticolisão. Três marcos em menos de uma largura de rótulo põem o primeiro e o terceiro do mesmo lado, um sobre o outro. Com o dado padrão os vizinhos do mesmo lado ficam a 184 px ou mais e nada colide.
- `v1`: "Orçamento aprovado" começa a 0,4 px da borda esquerda do corpo. `MARGIN.left` é fixo, então nome mais longo no primeiro marco sai do corpo.
- `v2`: o dado padrão não tem marco futuro com data confirmada. O losango vazado de traço contínuo não aparece no preview, e o tracejado de "data a confirmar" fica sem o par com que contrasta. Cabe nos mesmos 5 marcos trocando um dos dois atingidos.
- `v2`: "14 dias de atraso" sai em `font-sans`, com o número fora de algarismo tabular (TIP-1).
- `v2`: o `demonstrates` do `meta.json` troca o `--line-subtle` do catálogo por `--line-strong` no trecho a percorrer, com a razão na nota (o `--line-subtle` some no tema claro). Mede 1,79:1 no escuro e 1,83:1 no claro, e passa como régua de referência: quem diz onde o percorrido acaba é o fim do traço cheio e a linha de hoje. Falta alinhar o texto do catálogo.
- `v3`: a altura do cartão não deriva da altura da plotagem e o título não quebra em linhas. Em corpo mais baixo que o do canvas `largo`, ou com título acima de cerca de 28 caracteres, o texto sai do cartão.
- `v4`: o rótulo "Piloto de reativação" cruza a linha de hoje, e o halo abre um vão de uma linha de texto no tracejado. A ROT-7 está cumprida; a escada é que não trata a linha de hoje como obstáculo.
- `v4`: a largura do rótulo é estimada por `CHAR_WIDTH = 5.9` por caractere (armadilha GEO-8). "Reformulação do site" é estimado em 118 px e mede 108,5 px; a estimativa erra para mais, que é o lado seguro, mas texto com muitas maiúsculas erra para menos.
- `v4`: `MERGE_DAYS = 5` é medida em dias, não em pixels. Em cartão mais estreito, marcos a 6 dias se sobrepõem sem virar contador; em cartão mais largo, marcos separados se agrupam sem precisar.
- `v4`: a terceira altura da escada põe o topo do texto a 1,6 px do eixo da faixa de cima. O dado padrão não chega a ela.
- `v4`: os 5 marcos agrupados (3 do Comercial e 2 da Pré-vendas) só têm nome na dica, por decisão do catálogo. A frase acessível também não os nomeia.
- `v4`: sem nenhum marco sem data, o título "a definir" e os 140 px de `MARGIN.right` continuam no desenho.
- `v2`, `v3`, `v4`: há constantes de desenho escritas no corpo do componente (`cy + 4`, `top + CARD_PAD + 10`, `py - 11`, `baseline - 9`, `area.y + 10`), fora do bloco nomeado do topo que a seção 5 pede.
- As quatro, para o `ARMADILHAS.md`: o `LabelList` de um `Scatter` entrega em `x` e `y` o canto superior esquerdo da caixa do símbolo, com `width` e `height` iguais a 2 vezes o raio de `√(área/π)`. O centro da marca é `x + width / 2` e `y + height / 2`. Foi o que deslocou os rótulos da `v1` e da `v2`.

Revisão de 2026-10-08, segunda passada, depois da correção: as quatro versões aprovadas, julgadas pelo arquivo de hoje. Medido nos `preview.svg` e nos PNGs dos dois temas; o SVG sozinho e a página saem iguais nas oito imagens (0,000% de pixels diferentes). Das observações acima, a de "Orçamento aprovado" a 0,4 px da borda perdeu o objeto: com a âncora no centro do losango o rótulo começa a 6 px da borda do corpo, embora `MARGIN.left` continue fixo. As demais continuam valendo.

- `v1`, `v2`: sem achado novo. Entre a tinta do rótulo e a ponta do losango ficam 4,1 px acima e 4,3 px abaixo na `v1`, e 4,6 px acima e 8 px abaixo na `v2`; o halo não corta marca em nenhum dos temas.
- `v1`, `v3`, `v4`: a grade vertical tem uma linha por mês, de 10 a 13 linhas, contra as 3 a 5 da EIX-4. Cada linha tem tique nomeado e os rótulos têm halo; sem consequência no preview.
- `v3`: o `demonstrates` do `meta.json` diz "Escala real declarada na linha de leitura", mas com o dado padrão a linha de leitura fala só da taxa de agenda. Quem declara a escala é o subtítulo, como o catálogo pede. Falta alinhar o texto do `meta.json`.
- `v3`: os oito eventos estão a 42 dias um do outro, com um único intervalo de 35, e os cartões ficam empacotados pelo vão de 8 px. A escala real se vê só nos pontos, quase equidistantes; um par de eventos próximos no dado a mostraria.
- `v3`: o conector é vertical no x do ponto e o empurrão do cartão não tem teto. No dado padrão todo conector cai dentro do próprio cartão (o mais perto da borda fica a 64 px dela); com dois eventos do mesmo lado a menos de uma largura de cartão, o conector pode parar fora do cartão que ele liga.
- `v3`: "agenda +40% contra 15,0%" põe uma variação relativa ao lado de uma base que também é percentual. Quem impede a leitura como pontos percentuais é a linha de leitura, com o par de 15,0% para 21,0% e o volume. `signedPercent` escreve sempre sem casa decimal, e a NUM-1 pede uma casa abaixo de 10%.
- `v4`: "Campanha de reativação" ganhou nome e, como "Piloto de reativação", cruza a linha de hoje, agora dentro da palavra, entre o "p" e o "a". O halo da ROT-7 está lá e o nome se lê, mas sobra um toco do tracejado acima das letras. A escada segue sem tratar a linha de hoje como obstáculo.
- `v4`: "Reformulação do site", na segunda altura, fica a cerca de 5 px da ponta de baixo do losango agrupado da Pré-vendas. A escada só confere a própria faixa; sem colisão no preview.
- `v4`: três rótulos da segunda altura ancoram à direita e ficam 14 px acima do rótulo de outro marco ("Fechamento do ano" sobre "Revisão de meta T3", "Convenção de vendas" sobre "Mutirão de renovação", "Dois turnos de contato" sobre "Treino de objeções"). Quem impede a leitura como um rótulo de duas linhas é a linha guia.
- `v4`: o preview usa duas das três alturas da escada, 15 rótulos na primeira e 5 na segunda. A terceira segue sem exemplo, e nela o texto encosta na faixa de cima.
- `v4`: `solve(0, []) ?? []` devolve lista vazia quando a busca com retrocesso não acha solução, e aí somem todos os rótulos de uma vez, não só o que não coube. O dado padrão tem solução.
