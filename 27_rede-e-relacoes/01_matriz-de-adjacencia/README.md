# Matriz de adjacência

## O que é

Os mesmos nós nas linhas e nas colunas, e cada célula pintada e escrita pela intensidade da ligação entre o par. Não existe cruzamento de aresta, então a rede densa continua legível, e por isso a matriz é também a alternativa acessível de toda a família. A ordem é a informação: em ordem alfabética a matriz parece ruído, e ordenada por grupo e grau, ou por baricentro iterativo, os blocos e as pontes aparecem. Relação simétrica desenha só o triângulo inferior; relação dirigida desenha a matriz inteira e escreve no canto que a linha é a origem e a coluna é o destino.

## Quando usar

- Rede densa com 10 a 30 nós em que o grafo livre viraria emaranhado: coocorrência de origens, motivos de perda.
- Confronto direto entre pares do mesmo tipo ou de dois tipos (SDR por executivo), com contagem ou taxa na célula.
- Leitura de valor exato do par, que chord e grafo só entregam na dica.
- Alternativa acessível ou visão móvel de qualquer outro modelo da família, com as mesmas ligações.
- Busca de grupos e pontes quando existe um critério de ordenação declarado (grupo, grau, baricentro).

## Quando evitar

- Poucos nós e ligações esparsas, em que a forma da rede é a mensagem: use o grafo por forças (27/04) ou o arc diagram (27/05).
- Mais de 30 nós num cartão estreito sem rolagem: filtre por peso ou colapse os nós sem par antes, como a `v4`.
- Movimento de uma etapa para outra com diagonal de permanência: use a matriz de transição (15/07_matriz-de-transicao).
- Duas categorias quaisquer sem leitura de rede, só intensidade: use a matriz categórica (15/02_matriz-categorica).
- Volume com sentido entre poucas entidades, em que a proporção do todo importa: use o chord direcional (11/05).

## Anatomia

1. **Nomes dos dois eixos**, todos escritos. Na matriz triangular o nome fica na ponta da linha, dentro do triângulo vazio (`v1`), ou na margem esquerda com o número da posição repetido no topo da coluna (`v3`, `v4`). Texto nunca girado (TIP-5), e nenhum nó fica sem nome (GEO-13).
2. **Ordem declarada**: grupo e grau (`v1`), baricentro iterativo com seletor e ordem padrão visível (`v3`), grau decrescente (`v4`).
3. **Células por quartil** dos pares com ligação, em `--seq-2`, `--seq-3`, `--seq-6` e `--seq-7`, com a contagem escrita em todas. `--seq-4` e `--seq-5` não têm texto legível nos dois temas e ficam fora.
4. **Diagonal** em `--line-subtle`, sem número. `--surface-overlay` é o mesmo branco do cartão no tema claro e fica só no realce de linha e coluna.
5. **Zero medido** em `--surface-sunken` com o 0 escrito; **par sem medição** hachurado com contorno, sem número (`v4`). Os dois nunca leem igual.
6. **Separação de grupo** por faixa de espaço, com o nome do grupo dentro dela (`v1`); sem borda (ESP-5).
7. **Destaque por contorno** em `--chart-1`, desenhado fora da célula quando a rampa chega perto do ciano (`v2`), mais peso 700 no nome e no valor do destaque.
8. **Totais marginais** fora da grade em `--text-secondary` (`v2`), e a base mínima que um destaque exige.
9. **Legenda** com as classes, o zero, a diagonal e cada tratamento fora da escala; na `v3` e na `v4` ela mora no triângulo superior vazio.
10. **Formatadores**: `formatInt` na contagem, `formatPercent` no percentual da linha, `formatMonthShort` no mês.

## Versões

- `v1_coocorrencia-de-origens-na-jornada`: 12 origens em 3 grupos, triângulo inferior, cor por quartil, par gigante que não apaga o resto, linha e coluna realçadas sob o cursor.
- `v2_handoff-sdr-por-executivo`: matriz dirigida de 6 SDRs por 9 executivos, percentual da linha na célula, par mais concentrado contornado, totais marginais e anotação junto do par.
- `v3_motivos-de-perda-que-andam-juntos`: 18 motivos ordenados por baricentro iterativo em `useMemo`, seletor de ordem, bloco de três motivos anotado e rolagem horizontal com cabeçalho de linha fixo.
- `v4_matriz-esparsa-e-par-sem-medicao`: 40 origens reduzidas a 18, as 22 sem par contadas no rodapé, zero medido distinto de par sem medição hachurado.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<Componente>/`.
2. Troque o `data.ts` pelos pares reais. Par ausente da lista vale zero medido na `v1`, na `v3` e na `v4`; só `journeys: null` (`v4`) é par sem medição. Se a fonte não cobre todos os nós, liste os pares sem medição explicitamente.
3. O desenho é SVG com o `viewBox` do tamanho do corpo medido, para o texto sair em 11 px reais. Ao colar numa caixa de outro tamanho, mude `VIEW_W` e `VIEW_H` (`v1`, `v2`) ou deixe o tamanho sair do número de nós (`v3`, `v4`).
4. Acima de uns 30 nós a célula de 20 px deixa de caber com número: filtre por peso, colapse os nós sem par ou passe para a visão de lista de pares.
5. A `v3` usa `useState` e `useMemo`; o baricentro roda uma vez por conjunto de dados. A `v2` e a `v3` têm botões e dica por cursor, e o preview estático mostra só o estado inicial.
6. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`, e troque o estado vazio inline por `EmptyState`.
7. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): matriz de adjacência como heatmap e os erros de ordenação.
- Catálogo: [The Python Graph Gallery, adjacency matrix](https://python-graph-gallery.com/): ordem dos nós e blocos.
- Método: Bertin, J. Semiology of Graphics, matriz reordenável (a origem da ordenação por baricentro).
- Método: Behrisch et al., Matrix Reordering Methods for Table and Network Visualization (Computer Graphics Forum, 2016): comparação de critérios de ordem.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): quartil contra escala linear.
- Pedido de superfície, para a seção 6 do contrato: um par de tokens de rampa divergente e um token de textura para "sem medição". A hachura sai de um `pattern` de SVG em `--text-muted`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, quatro versões julgadas. `v1`, `v3` e `v4` aprovadas; `v2` reprovada por dois bloqueantes (frase acessível sem a base mínima do destaque, e pontilhado de base pequena abaixo do piso de contraste), descritos em `validation/revisao_27_rede-e-relacoes__01_matriz-de-adjacencia_2026-10-13.md`. Os itens abaixo não reprovam.

- `v1`, `v2`, `v3` e `v4`: número escrito dentro de frase sai em Manrope sem `tabular-nums` (TIP-1): linha de leitura e legenda da `v1`, anotação e legenda da `v2`, legenda e anotação do bloco da `v3`, legenda e rodapé da `v4`. Os números de célula, de total e de posição usam `font-display` com `tabular-nums`. Sem coluna a alinhar, o preview não muda.
- `v1`, `v3` e `v4`: o aviso `CONTRASTE-MARCA` do check é a diagonal em `--line-subtle` (1,25:1 no escuro e 1,29:1 no claro). Ela é estrutura sem valor, que a TOK-1 endossa nesse token. No claro ela fica a 1,12:1 do zero medido em `--surface-sunken`, e quem separa os dois é o 0 escrito.
- `v1` e `v2`: o realce de linha e coluna sob o cursor usa `--surface-overlay`, como o catálogo pede, e esse token é o mesmo branco do cartão no tema claro (1,00:1). No claro o realce fica só na cor do rótulo, mais o peso 600 na `v1`. `--surface-sunken` daria faixa visível nos dois temas. Estado de cursor, fora do preview.
- `v1` e `v2`: a legenda fica abaixo da grade, e a ROT-4 pede acima ou ao lado. São duas linhas, 8% e 11% do corpo, e o desenho não encolhe.
- `v1`: dentro de cada grupo a ordem é por grau decrescente e nada na tela diz isso (GEO-12); o grau não está escrito em lugar nenhum. Uma palavra na legenda resolve.
- `v1` e `v4`: `GROUP_SLOT` de 13 px e o recuo de 13 px da legenda, na `v1`, e `LEGEND_LINE` de 15 px, na `v4`, são ímpares; a ESP-1 pede múltiplos de 2. Sem consequência no render.
- `v2`: os totais marginais levam o cabeçalho `total` sem o substantivo (NUM-6). A unidade está em outro ponto do cartão: a legenda e o subtítulo dizem agendas. `agendas` cabe no cabeçalho, alinhado à direita.
- `v2`: linha de SDR com total zero escreve `0%` nas nove células (`percent ?? 0`, linha 305 do `Chart.tsx`). Percentual de linha sem base não é zero medido (EST-4): escrever a ausência ou tirar a linha. O dado padrão não tem esse caso.
- `v2`: `data.period` entra cru na frase acessível (`2026-T3`). Não existe formatador de trimestre em `@/lib/format`; vale o pedido de superfície.
- `v3`: a anotação do bloco soma os três pares (68, 58 e 41) e escreve `167 perdas juntas`; a frase acessível diz `167 perdas entre si`. Perda com os três motivos conta três vezes, então a soma é de coocorrências, não de perdas. A `v1` usa a palavra certa.
- `v3`: o bloco anotado é a melhor janela de três vizinhos na ordem corrente, não o trio mais forte do dado: preço, desconto e orçamento somam 229 e não são vizinhos na ordem padrão. Nos modos Frequência e Nome o contorno continua desenhado sobre uma ordem que não agrupa. Dizer `vizinhos` na legenda, ou desenhar o bloco só no agrupamento.
- `v3`: o baricentro não converge no dado padrão. Refeito fora do componente, ele entra num ciclo de duas ordens a partir do passo 7 e sai pelo teto de 24 iterações, porque a parada só reconhece ordem igual à anterior. As três famílias ficam em bloco nas duas ordens, mas a ordem dentro do bloco muda (11 de 18 motivos trocam de lugar) e o trio anotado depende da paridade do teto: com 25 seria preço, sem verba e orçamento, com 184. Detectar o ciclo e escolher a ordem de menor custo, e corrigir o comentário do topo, que diz "até a ordem parar de mudar".
- `v3`: o modo `Frequência` ordena pela soma das coocorrências do motivo, não pela frequência do motivo nas perdas.
- `v3`: a anotação do bloco tem 74 caracteres em três linhas e sai em `--text-secondary`; a ANO-2 pede até 50 e `--text-muted`. Cabe no triângulo vazio sem colisão. A legenda tem sete linhas, e a ROT-4 pede duas, com a mesma folga.
- `v3`: legenda e anotação têm posição fixa no triângulo superior. Com outro dado, um bloco que comece na posição 7 ou 8 leva o contorno para cima das últimas linhas da anotação. No dado padrão o bloco começa na 13 e não encosta.
- `v3` e `v4`: a legenda não nomeia a diagonal, que o item 9 da Anatomia promete; a `v1` nomeia.
- `v4`: o mês (`ago/26`) só existe na frase acessível (DAD-9). Subtítulo, legenda e rodapé não dizem o período. Cabe no título da legenda.
- `v4`: a ordem é por grau decrescente e as linhas são numeradas de 1 a 18, o que lê como ranking sem dizer de quê (GEO-12).
- `v4`: a segunda linha do rodapé repete `40 origens` e `92%` do subtítulo (ANO-5). O rodapé é calculado e o subtítulo é texto fixo do `meta.json`; ao colar no Farol um dos dois sai.
- Anatomia, item 3: falta dizer que a cor não ordena sozinha (TOK-8). `--seq-2` contra `--seq-3` mede 1,45:1 no escuro e 1,29:1 no claro, e `--seq-6` contra `--seq-7` mede 1,45:1 e 1,52:1. Quem carrega a ordem é a contagem escrita em cada célula.

Revisão de 2026-10-13, segunda passada, só a `v2`, julgada no arquivo corrigido: aprovada, sem bloqueante. A frase acessível agora diz a base mínima do destaque, e o pontilhado de base pequena usa a cor do texto da faixa e mede de 5,45:1 a 10,72:1 contra a célula nos dois temas. Os itens abaixo não reprovam.

- `v2`: seguem valendo, sem mudança no arquivo, os seis itens da primeira passada: número em frase sem `tabular-nums` (TIP-1), realce do cursor em `--surface-overlay`, legenda abaixo da grade (ROT-4), cabeçalho `total` sem o substantivo (NUM-6), `0%` em linha de SDR sem base (linha 305 do `Chart.tsx`) e período cru na frase acessível.
- `v2`: o anel do destaque fica a 0,5 px da célula. Contra o cartão ele mede 9,50:1 no escuro e 6,00:1 no claro; contra a própria célula em `--seq-7`, 1,07:1 e 1,38:1. Em densidade 1x o meio pixel de cartão se mistura e o anel lê como célula maior; o peso 700 e a anotação seguram o destaque. Afastar o anel até sobrar 1 px inteiro de cartão.
- `v2`: a célula de zero e a amostra dela na legenda medem 1,15:1 contra o cartão nos dois temas. Quem carrega a leitura é o `0%` escrito, a 5,98:1 e 4,65:1. As amostras de `--seq-2` e `--seq-3` ficam em 1,58:1 e 2,29:1 no escuro e 1,49:1 e 1,92:1 no claro, e valem pela faixa escrita ao lado.
- `v2`: os números de célula e de total usam `font-display` sem peso declarado e herdam 400, que Space Grotesk não carrega (TIP-4). O navegador desenha em 500 e o preview não muda. Declarar 500.
- `v2`: `LEFT_W` de 48 px é fixo, e o rótulo `SDR 3` em peso 700 mede 30 px dos 40 px úteis. Nome real de SDR sai cortado pela esquerda (TIP-7). Calcular a margem pelo maior rótulo e dizer isso no passo 3 de Como colar no Farol.
- `v2`: sem nenhum SDR com base mínima, a frase acessível cai para 64 caracteres e perde o período e o total (ACE-1). O dado padrão não passa por esse ramo.
- `v2`: linhas e colunas seguem a ordem do código (SDR 1 a 6, A a I). Ordenar as colunas pelo total recebido (48, 37, 25) deixaria C e F vizinhos, e o par de 70% viraria um bloco. Melhoria possível; o catálogo não pede.
