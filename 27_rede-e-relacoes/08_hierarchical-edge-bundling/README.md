# Hierarchical edge bundling

## O que é

Feixe hierárquico de arestas. As folhas de uma hierarquia ficam num círculo, agrupadas pelo pai, e cada ligação entre duas folhas é uma curva que acompanha o caminho da hierarquia: da folha ao grupo, ao ramo, à raiz e de volta. Ligações de rota parecida viram um feixe que só se abre nas pontas. Aqui a hierarquia é a procedência dos indicadores: fontes de dado agrupadas por sistema num ramo, indicadores agrupados por dashboard no outro, e a ligação diz que o indicador usa a fonte. Lê-se pela forma do feixe, de que grupo para que grupo, e pela folha acesa, o que entra nela e o que sai dela. A tensão β decide quanto a curva obedece à hierarquia: perto de 0 volta a ser reta, perto de 1 tudo se junta num feixe só; o padrão do Farol é 0,85. O texto nunca gira: o rótulo é horizontal nas quatro versões.

## Quando usar

- Ligações entre folhas de uma hierarquia real: fontes por sistema e indicadores por dashboard, páginas por seção, equipes por área.
- Procedência com dezenas de ligações, em que o arc diagram cruzaria arcos demais. As versões desenham de 79 a 95 ligações.
- Com nome em cada folha (`v1`): até 34 linhas por lado, contando uma por folha e uma por nome de grupo, em cartão de 816 x 616 px. São cerca de 58 folhas em 10 grupos, com nome de até 22 caracteres.
- Sem nome nas folhas (`v2`, `v3`, `v4`): até cerca de 80 folhas num círculo de 100 px de raio, com o nome de cada uma na dica e o do grupo em volta.
- Leitura de risco: quais folhas de um grupo dependem de uma folha de outro grupo, com a lista ao lado (`v2`).
- Painel exploratório em que o cursor separa o que entra do que sai de uma folha.

## Quando evitar

- Dado sem hierarquia: o feixe não tem rota. Use o grafo por forças (`27_rede-e-relacoes/04_grafo-de-rede-por-forcas`) ou a matriz de adjacência (`27_rede-e-relacoes/01_matriz-de-adjacencia`).
- Poucas ligações com rótulo que precisa ser lido de perto: use o arc diagram (`27_rede-e-relacoes/05_arc-diagram`).
- Peso exato por par: a curva aqui só diz que a ligação existe. Use a matriz de adjacência (`27_rede-e-relacoes/01_matriz-de-adjacencia`) ou o chord simétrico (`27_rede-e-relacoes/07_chord-simetrico`).
- A hierarquia em si é a mensagem, sem ligação entre folhas: use a árvore e dendrograma (`12_hierarquia/07_arvore-e-dendrograma`).
- Até 16 nós sem hierarquia de dois níveis: use o grafo circular (`27_rede-e-relacoes/06_grafo-radial-e-circular`).
- Visual parado sem cursor e sem lista de apoio: o feixe sozinho não diz quem liga a quem. Sem interação, use a `v2`, que escreve a lista.
- Mais de 34 linhas por lado com nome em cada folha: o passo cai abaixo de 13 px e os nomes encostam. Cresça o cartão ou tire os nomes das folhas.

## Anatomia

1. **Folha**: ponto de 2,2 a 3 px de raio em `var(--text-secondary)`, com contorno `var(--surface-raised)`. A selecionada cresce para 4,5 ou 5 px.
2. **Volta por linhas** (`v1`, `buildLayout`): cada lado do círculo é uma coluna de linhas de mesma altura, uma por folha e uma pelo nome do grupo, e a folha fica no ponto do círculo que está na altura da linha dela. O passo é derivado: a altura útil dividida pelos vãos, 13,2 px no dado padrão.
3. **Volta uniforme** (`v2`, `v3`, `v4`, `buildLayout`): uma vaga por folha, um vão de 1,5 vaga entre grupos e de 3 vagas entre ramos, com o passo saindo de 360 graus dividido pelo total. Nos dois layouts a ordem é a do dado, em sentido anti-horário a partir do topo.
4. **Nós internos**: o grupo fica no meio angular das folhas dele, a 0,6 do raio; o ramo, no meio dos grupos dele, a 0,2; a raiz é o centro. Não são desenhados: só guiam a curva.
5. **Feixe** (`controlPoints`, `bundlePath`): os pontos de controle são os ancestrais do caminho, com o ancestral comum incluso; a tensão puxa cada ponto para a reta entre as duas folhas, P' = β·P + (1 − β)·(P0 + t·(Pn − P0)); a B-spline cúbica uniforme vira segmentos de Bézier cúbica, com as pontas repetidas para a curva tocar a folha. Traço de 1 px em `var(--text-muted)` a 0,76 de opacidade, porque carrega a relação e mede 3:1 (ACE-6).
6. **Arco de grupo**: arco de 1,5 px em `var(--text-muted)` no raio das folhas, interrompido entre grupos. Na `v4` um segundo arco, 7 px por fora, abraça cada ramo.
7. **Nome da folha** (`v1`): horizontal, 11 px, `var(--text-secondary)`, na linha da folha. A posição sai do canto da caixa (`labelOffset`, GEO-19); perto dos polos uma linha de chamada de 1 px liga o nome à folha.
8. **Nome do grupo**: 11 px, peso 600 e `var(--text-primary)` numa linha própria da coluna na `v1`; em volta do círculo, em `var(--text-secondary)`, nas `v2` e `v3` (`placeLabels`), onde quem encosta em outro procura a vaga livre mais próxima.
9. **Foco de alerta** (`v2`): as ligações da fonte selecionada em `var(--negative)` com 2 px e revestimento na cor do cartão, as folhas atingidas maiores, o nome da fonte em peso 700 com o ícone `Unplug`.
10. **Lista lateral** (`v2`): os indicadores atingidos por dashboard, do mais atingido ao menos, com a contagem por `formatInt` à direita do nome do dashboard e o zero escrito.
11. **Sentido e interna** (`v3`, e no cursor da `v1`): entrada em `var(--chart-1)` contínuo, saída em `var(--chart-6)` tracejado, interna em `var(--chart-3)` desenhada por último; as três com revestimento.
12. **Legenda e contagem** (`v3`): acima do desenho, a legenda de sentido à esquerda e a contagem de internas por dashboard à direita, com o número em Space Grotesk alinhado à direita.
13. **Painel de tensão** (`v4`): título com β por `formatDecimal` com duas casas, frase do regime e os nomes dos dois ramos com a contagem.
14. **Linha de leitura, rodapé e frase acessível**: a primeira no topo do corpo, em 12 px, calculada do dado; o rodapé declara a tensão; a frase acessível na raiz diz o tipo, as contagens e a conclusão, pelos mesmos formatadores.
15. **Vazio**: sem nenhuma folha, o desenho dá lugar a um bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_procedencia-fontes-e-indicadores`: 18 fontes em 5 sistemas e 40 indicadores em 5 dashboards, com 79 dependências e o nome de cada folha. Demonstra o layout radial com folhas agrupadas pelo pai e vão entre grupos, o caminho pelo ancestral comum convertido em B-spline e em Bézier cúbica, a tensão de 0,85 declarada no rodapé, o feixe em `var(--text-muted)` acima do piso de 3:1 e o rótulo horizontal em cada folha, na altura dela.
- `v2_indicadores-que-caem-sem-o-formulario`: a fonte formulário do site selecionada, com os 11 indicadores que dependem dela. Demonstra a seleção por `highlightId` em `var(--negative)`, os demais feixes baixados sem sumir da forma, o ícone `Unplug` junto do nome da fonte, a lista lateral por dashboard com o zero escrito e a contagem na linha de leitura.
- `v3_dependencia-dentro-do-mesmo-dashboard`: as 10 dependências entre indicadores do mesmo dashboard, em 95 ligações. Demonstra o caminho que sobe só até o pai comum, a ligação interna em `var(--chart-3)` desenhada por último, a entrada e a saída da folha selecionada em duas cores e dois traços com legenda, e a contagem de internas por dashboard.
- `v4_tensao-baixa-e-alta-lado-a-lado`: a mesma procedência em dois painéis, com β de 0,30 e de 0,95. Demonstra os pequenos múltiplos com as mesmas folhas, a tensão que volta às retas e a que junta tudo num feixe, o valor de β no título de cada painel, a curva como função pura com β de parâmetro e a nota do padrão de 0,85.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Passe `data` com `sources` e `indicators`, cada um como lista de grupos com as folhas dentro, e `links` como lista de pares (`from` é a folha usada, `to` é quem usa). Não ordene antes: a ordem do dado é a ordem da volta. Cada folha e cada grupo trazem `label` e `inSentence`, o nome sem a maiúscula de rótulo, para o meio da frase.
3. `tension` é a tensão β, de 0 a 1, com padrão 0,85. Exponha o controle na página e mantenha o valor escrito: o rodapé já o imprime.
4. Na `v1`, `highlightId` é opcional e o cursor acende a folha. Na `v2`, `highlightId` é a fonte escolhida na página; id que não existe deixa tudo em neutro e a lista dá lugar a um aviso. Na `v3`, `highlightId` é a folha de partida e o cursor troca a seleção. Na `v4`, `tensions` recebe até três valores, um por painel.
5. O `viewBox` é o tamanho do corpo do cartão do catálogo: 750 x 497 na `v1`, 894 x 281 na `v2` e na `v4`, 574 x 425 na `v3`. Mudou o cartão, mude `VIEW_W`, `VIEW_H`, o centro e o raio juntos, senão o texto chega à tela abaixo de 11 px (GEO-18).
6. Na `v1` quem limita é o número de linhas por lado: o passo é a altura útil do círculo dividida pelos vãos, e abaixo de 13 px os nomes encostam. Nas demais quem limita é a largura do maior nome de grupo ao lado do círculo.
7. O dado não tem peso. Se houver quantidade por par e ela importar, o modelo é o chord simétrico ou a matriz de adjacência.
8. Dê altura ao pai antes de embrulhar em `VisualCard`, e troque o bloco de vazio por `EmptyState`.

## Referências

- Danny Holten, Hierarchical Edge Bundles: Visualization of Adjacency Relations in Hierarchical Data (IEEE TVCG, 2006): o método, a tensão β e a B-spline pelos ancestrais do caminho.
- [Observable, Hierarchical edge bundling](https://observablehq.com/@d3/hierarchical-edge-bundling): o layout radial com folhas agrupadas e as duas cores de entrada e saída no cursor.
- [D3, curveBundle](https://d3js.org/d3-shape/curve#curveBundle): a mesma B-spline com o endireitamento por β, de onde vem o padrão de 0,85.
- [Data Visualisation Catalogue, Non-ribbon Chord Diagram](https://datavizcatalogue.com/methods/non_ribbon_chord_diagram.html): o vizinho sem hierarquia, só com nós e linhas.
- `VISUAIS/27_rede-e-relacoes/06_grafo-radial-e-circular/README.md`: o vizinho circular, de onde vêm o `viewBox` do tamanho do corpo, a medição do traço neutro e o rótulo de perímetro sem giro.
- `VISUAIS/12_hierarquia/07_arvore-e-dendrograma/README.md`: o dendrograma radial, de onde vêm a posição do pai no meio dos filhos e a decisão de não girar texto.
- `app/src/lib/format.ts`: `formatInt` e `formatDecimal`, os formatadores do modelo.
- `app/src/styles/tokens.css`: `--text-muted`, `--text-secondary`, `--text-primary`, `--surface-raised`, `--negative`, `--chart-1`, `--chart-3` e `--chart-6`.

## Desvios do catálogo, declarados

Em quatro pontos a especificação do catálogo colide com o contrato. Em todos o contrato vence, e o desvio está também na nota do `meta.json` de cada versão.

1. **Rótulo girado.** O modelo pede o rótulo girado pelo ângulo e virado 180 graus na metade esquerda. A TIP-5 proíbe `rotate` em texto, sem exceção para radial. Na `v1` os 58 nomes ficam na horizontal porque a volta é montada por linhas: o ângulo da folha sai da linha do nome dela, e não de um passo angular igual. Nas outras três só o grupo, o ramo ou a folha selecionada levam nome.
2. **Feixe em `var(--line-strong)` com opacidade baixa.** A `v1` pede esse token e a `v2` pede 0,2 de opacidade nos feixes fora de foco. O traço carrega a relação (ACE-6) e `var(--line-strong)` mede 1,79:1 no escuro e 1,83:1 no claro. Ficou `var(--text-muted)` a 0,76, que mede 3,58:1 e 3,28:1; o piso é 0,72 (ACE-5).
3. **Canvas.** A `v1` sai de `alto` para 816 x 616, e a `v3` de `quadrado` para `alto`. A conta de linhas e de largura está na nota de cada `meta.json` (GEO-1).
4. **Raio dos nós internos.** O dendrograma radial põe os níveis em terços iguais. Aqui o ramo fica a 0,2 e o grupo a 0,6 do raio, porque com o ramo em um terço o feixe dos indicadores faz um gancho largo antes de voltar para o próprio lado.

## O que o check não mede nestas peças, e a medição à mão

O `check` fecha com 0 erros e 0 avisos nas quatro versões, e as guardas de desenho medem as quatro: `COLISAO-TEXTO`, `TAMANHO-TEXTO`, `CONTRASTE-TEXTO`, `CONTRASTE-MARCA`, `TEXTO-NA-MARCA` e `OPACIDADE-MARCA`, porque o `viewBox` é o corpo do cartão e a escala sai 1. O que ficou fora, com o que foi conferido no lugar:

- `ESPESSURA-MARCA` sai `sem_marca_de_barra` nas quatro: a guarda só tem piso para marca de barra. A marca aqui é o traço da ligação, de 1 px em repouso e 2 px aceso, e a folha, de 2,2 a 5 px de raio; nenhuma leva texto dentro.
- `RAIO-CONTRA-AREA` sai `sem_marca_de_area` ou `sem_dado`: nenhum raio codifica valor. O tamanho da folha separa o papel: selecionada, atingida e demais.
- `FORMATO-ACESSIVEL` mede a `v2` e a `v4` e sai `frase_sem_formatador` na `v1` e na `v3`, em que a frase passa por `countLabel` antes do `formatInt`. Conferido à mão: corpo e frase usam `formatInt` e `formatDecimal` nas mesmas medidas.
- A opacidade do feixe, medida também à mão contra `tokens.css`: `--text-muted` a 0,76 sobre o cartão dá 3,58:1 no escuro e 3,28:1 no claro.
- Par marca contra marca (TOK-9), que nenhuma guarda mede: `--negative` contra a ligação baixada dá 1,54:1 no escuro e 1,94:1 no claro; `--chart-1` contra `--chart-3`, 1,47:1 e 1,03:1. O destaque nunca depende só da cor: espessura, revestimento, tamanho da folha, traço da saída, peso do nome e a lista escrita mudam junto.
- O estado de cursor da `v1` e da `v3` não aparece no preview: a troca da linha de leitura, a legenda de sentido do rodapé da `v1` e o nome da folha acesa foram escritos e conferidos fora da ferramenta, sem preview gravado.

## Pendências conhecidas

- A caixa de colisão dos nomes de grupo da `v2` e da `v3` usa 6,6 px por caractere, sempre para mais, e não a largura medida de cada nome. A borda do cartão não entra nessa conta.
- Na `v1` o corte entre as duas colunas cai entre dois grupos. Um grupo com mais da metade das linhas deixa as colunas desiguais, e o passo passa a ser o da coluna maior.
- As versões sem nome nas folhas dependem da dica nativa para dizer qual folha é qual. Sem cursor, a `v2` responde pela lista e a `v3` pela contagem por dashboard, mas não pelo nome de cada par.

## Observações da revisão (não bloqueantes)

**2026-10-13, revisão independente das quatro versões.** As quatro foram aprovadas: as 32 perguntas dão sim nos dois temas, com as perguntas 4, 6, 26, 27, 28 e 29 sem aplicação. `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes. Refeito à mão do `data.ts`: 18 fontes, 40 indicadores e 79 dependências; as 11 do formulário do site (5, 4, 1, 1 e 0 por dashboard); as 10 internas da `v3` (4, 3, 2, 1 e 0) e as 2 entradas e 3 saídas de receita recorrente. A contagem de caminhos de cada `preview.svg` fecha com esses números. Contraste recalculado contra `tokens.css`: `--text-muted` a 0,76 dá 3,57:1 no escuro e 3,27:1 no claro (as notas escrevem 3,58 e 3,28, diferença de arredondamento); o piso de 0,72 é o do tema claro, e no escuro ele fica em 0,66. Escala do `<svg>` conferida nos quatro PNGs pela distância entre a linha de leitura e o rodapé: 1 nos quatro. Frase acessível lida em `data-farol-ace`: 207, 227, 219 e 233 caracteres. Não renderizado: o estado vazio das quatro, o cursor da `v1` e da `v3` e a `v2` sem `highlightId` válido; o que se diz deles abaixo é leitura do código. O que segue não reprova.

- `v1`: a volta por linhas tira do arco a leitura de tamanho do grupo. Medido no `preview.svg`: Sistema de vendas e Sistema financeiro têm 4 folhas cada e arcos de 70,9 e 40,8 px; Dashboard financeiro, com 7 folhas, tem 144,7 px, mais que os 94,6 px de Dashboard de pré-vendas, com 8. Não é encoding, porque cada folha é um ponto com nome, mas vale dizer no item 2 da Anatomia que o comprimento do arco não se compara entre grupos.
- `v1`: a fronteira entre os dois ramos não tem marca própria. Dashboard comercial fica na coluna da esquerda, abaixo dos cinco sistemas, separado de Sistema financeiro pelo mesmo vão de uma linha dos outros grupos, e o vão maior do pé do círculo cai entre dois dashboards do mesmo ramo. O nome do grupo resolve; um vão maior na troca de ramo, ou o nome do ramo, fecharia a leitura.
- `v1`: `SOURCES_ID`, `INDICATORS_ID`, `LEGEND_IN_X` e `LEGEND_OUT_X` estão declaradas depois das funções, fora do bloco de constantes do topo. E o cursor usa os slots 1 e 6, pulando o 3 da ordem da COR-8, para manter o mapa de cores da `v3`; a nota da `v1` não diz isso.
- `v2`: a ligação acesa e o revestimento dela cobrem ligações baixadas que seguem a mesma rota. Medido no `preview.svg`, contando o trecho em que o eixo da baixada corre a menos de 2 px do eixo de uma acesa: 16 das 68 têm mais da metade do caminho coberta e 4 passam de 80% (sessões do site com conversão do site, 89%; chat do site com leads gerados e com leads sem resposta, 84% cada; páginas de produto com conversão do site, 80%). As 15 que chegam a um indicador atingido chegam por baixo do vermelho. Nenhuma perde as duas pontas, e o menor trecho próprio tem 20,7 px, junto da folha de origem. Não reprova aqui, ao contrário de `27_rede-e-relacoes/06_grafo-radial-e-circular/v2`, porque no feixe a rota comum é o próprio encoding: o par não se lê do desenho nem em repouso, e a contagem por folha está na dica. Se a peça ganhar leitura por par, as pontas precisam abrir.
- `v2`: a legenda abre a frase com a contagem em vez de levá-la em coluna à direita (ROT-5), e `LIST_ROW_PITCH` vale 15, fora do múltiplo de 2 da ESP-1. Sem consequência visível no preview.
- `v2`: a linha de leitura escreve Formulário do site com maiúscula no meio da frase, porque usa `label`; a frase acessível e a legenda usam `inSentence`. Redação.
- `v3`, com peso: a interna é pintada por último, com revestimento, e cobre o fim de duas das três saídas da folha selecionada, porque previsão de receita e atingimento de meta recebem a saída e também têm interna. Medido no `preview.svg`: os últimos 26,8 px da saída para previsão de receita e os últimos 15,6 px da saída para atingimento de meta correm a menos de 2 px do eixo de uma interna (15% e 9% do caminho). O tracejado para antes da folha e quem chega nela é o azul. O par ainda se lê pela folha em `var(--chart-6)`, que é maior, e por isso não reprova. Saída possível: quando a folha de destino tem interna, pintar a entrada e a saída depois dela.
- `v3`: das 80 ligações neutras, 11 têm mais da metade do caminho sob o revestimento de uma colorida e 5 têm as duas pontas cobertas (os 20 px junto de cada folha), ficando à vista só no meio do feixe; a pior tem 90% coberto e 23,5 px próprios. Vale a leitura da `v2`: é contexto, e a legenda não escreve contagem para elas.
- `v3`: o par de cada interna não se lê do desenho. Em Dashboard de pré-vendas as 2 internas formam um leque de quatro pontas com o vértice comum, e em Dashboard comercial as 4 formam uma malha de seis pontas. Quem responde é a tabela de contagem, e o par só aparece com o cursor na folha.
- `v3`, ramos não fotografados: com o cursor numa folha que tem interna, essa ligação sai na cor do sentido e as curvas em `var(--chart-3)` deixam de bater com a tabela (em Ticket médio, 3 azuis em Dashboard comercial contra 4 escritos). E `internalTotal` soma todos os grupos enquanto a tabela lista só dashboards: uma ligação entre duas fontes do mesmo sistema entraria na linha de leitura e na legenda de "dentro do mesmo dashboard" sem entrar na tabela.
- `v3`: a legenda tem quatro linhas, e a ROT-4 fala em até duas; ocupa 60 px, 14% do corpo. A contagem abre a frase (ROT-5) e `BLOCK_ROW_PITCH` vale 15 (ESP-1). Sem consequência visível no preview.
- `v4`: a frase do painel de 0,30 diz que as curvas voltam a ser quase retas. Medido no `preview.svg`: a flecha sobre a corda tem mediana de 11% e passa de 10% em 48 das 79 curvas (17,1 px de mediana e 28,0 px de máxima, num círculo de 92 px de raio); o comprimento fica 3% acima da corda na mediana. O contraste com o painel de 0,95, de mediana 36%, se vê, mas "as curvas se soltam do feixe" descreve melhor o que está desenhado. Limiar discutível.
- `v4`: β aparece no título do painel e no rodapé sem ser apresentado como a tensão (ROT-8). "Tensão β = 0,30" fecha a leitura sem custo de espaço.
- `v4`: as folhas não têm dica nativa, ao contrário da `v2` e da `v3`, e os dez arcos de grupo ficam sem nome. Está declarado na nota e a comparação é de forma; um `<title>` por folha daria o nome sem ocupar o cartão.
