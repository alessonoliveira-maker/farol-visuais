# Grafo radial e circular

## O que é

Duas formas de rede com posição fixa, sem simulação. A egocêntrica põe uma entidade no centro e as relações dela em anéis de distância: quem ela liga direto no primeiro anel, em ângulos iguais, e quem esses ligam no segundo, em leque junto de quem ligou. A circular põe todos os nós no perímetro de um círculo, ordenados por categoria e, dentro dela, por número de ligações, e desenha cada ligação por dentro como curva quadrática (`M xi,yi Q cx,cy xj,yj`) com o controle no centro na `v3` e puxado para o meio da corda nos vizinhos na `v2`. A mesma circular com linha fina de espessura única é o chord sem fita, que diz se a relação existe e não quanto. Lê-se a egocêntrica de dentro para fora, pelo alcance; a circular, pelo que sai de um nó e por onde isso cai, dentro do grupo dele ou fora. O texto nunca gira: o rótulo é horizontal em todas as versões.

## Quando usar

- Rede centrada numa entidade: parceiro de indicação, cliente âncora, executivo e sua carteira, com alcance de primeiro e segundo grau.
- Egocêntrica em cartão quadrado: até 12 nós no primeiro anel e até 3 por leque no segundo, com rótulo de código curto (3 ou 4 caracteres).
- Todos os nós num círculo, agrupados por categoria: até 12 nós com nome de até 15 caracteres em 422 px de corpo, ou 16 nós com nome e contagem em 574 px.
- Relação binária, existe ou não, em que o peso não importa: a forma de chord sem fita.
- Cartão quadrado em que o grafo livre mudaria de forma a cada filtro e o arc diagram não cabe.
- Período sem nenhuma relação que precisa aparecer como zero medido, com o histórico ao lado.

## Quando evitar

- Muitas ligações longas cruzando o centro: use a matriz de adjacência (`27_rede-e-relacoes/01_matriz-de-adjacencia`).
- O peso da relação é a mensagem: use o chord simétrico (`27_rede-e-relacoes/07_chord-simetrico`).
- As folhas pertencem a uma hierarquia e as ligações podem ser agrupadas em feixe: use o edge bundling (`27_rede-e-relacoes/08_hierarchical-edge-bundling`).
- Pertencimento de pai para filho em anéis, sem ligação cruzada: use a árvore radial (`12_hierarquia/07_arvore-e-dendrograma`).
- Nome de nó longo, acima de 15 caracteres, ou mais de 16 nós rotulados: o rótulo horizontal não cabe em volta do círculo; use o arc diagram de eixo vertical (`27_rede-e-relacoes/05_arc-diagram`).
- Tela de 400 px com mais de 12 nós: ofereça a lista ordenada de pares.

## Anatomia

1. **Nó central** (`v1`, `v4`): círculo em `var(--chart-1)` com o código da entidade em peso 700 e `var(--accent-cyan-contrast)`, o único par legível sobre o ciano (ROT-6).
2. **Primeiro anel** (`v1`): um nó por conta direta, em setores iguais a partir de uma costura à direita, em ordem de contas indicadas adiante. O nó tem 14 px de raio e leva o código dentro, vazado em `var(--surface-raised)` sobre `var(--text-muted)`.
3. **Segundo anel** (`v1`): nós de 4,5 px em leque de até 13 graus por vizinha, centrado no ângulo de quem indicou. O código fica fora do círculo, com a caixa empurrada pela meia largura vezes o cosseno e a meia altura vezes o seno (`labelDistance`).
4. **Anel de referência** (`v1`, `v4`): círculo de 1 px em `var(--line-subtle)`, com o que ele representa escrito na costura, em 11 px e `var(--text-muted)`, com halo na cor do cartão: o grau na `v1`, a palavra anterior na `v4`.
5. **Aresta**: linha reta do centro ao nó na egocêntrica; curva quadrática na circular (`edgePath`): controle no centro na `v3`; na `v2` o controle sai do centro rumo ao meio da corda, com k = 0,85 vezes (1 menos a distância angular sobre 180), para que as ligações do mesmo nó saiam em ângulos diferentes. Sempre em `var(--text-muted)`, porque carrega a relação e mede 3:1 (ACE-6); nunca em `var(--line-strong)`.
6. **Arco de grupo** (`v2`): arco de 2 px em `var(--text-muted)` no raio dos nós, um por grupo, interrompido entre grupos, com um tique no meio apontando o nome do grupo.
7. **Vaga do nome do grupo** (`v2`): cada grupo reserva uma posição da volta, no meio do arco, para o próprio nome, em 12 px, peso 600 e `var(--text-muted)`. O nome divide a coluna de rótulos com as origens do grupo; o que o separa delas é o tamanho, o peso, o tom, o tique e a falta de ponto.
8. **Foco** (`v2`): a origem de `highlightId` acende as ligações dela em `var(--chart-1)` com 2,5 px e revestimento na cor do cartão; as demais baixam para `strokeOpacity` de 0,76. O nó selecionado cresce e o rótulo dele vai a peso 700; os das parceiras, a 600.
9. **Rótulo em volta do círculo** (`v2`, `v3`): horizontal, começando no nó à direita do centro e terminando nele à esquerda; o que encosta em outro é empurrado para longe do equador (`placeLabels`).
10. **Contagem junto do nome** (`v3`): `formatInt` com o substantivo, em Space Grotesk, na mesma linha do nome da equipe.
11. **Nó isolado** (`v3`): anel vazado em `var(--text-muted)` no lugar dele na volta, com 0 relações escrito.
12. **Histórico** (`v4`): nós vazados e raios tracejados em `var(--text-muted)`, no anel de fora.
13. **Linha de leitura e frase acessível**: a primeira no topo do corpo, em 12 px, calculada do dado; a segunda na raiz, com o tipo de gráfico, as contagens e a conclusão, pelos mesmos formatadores.
14. **Vazio**: sem nenhum nó, o desenho dá lugar a um bloco `role="status"` com o ícone `Filter` (EST-1); na `v4`, carteira não carregada dá lugar a `formatUnavailable()` com o ícone `Unplug` (EST-2).

## Versões

- `v1_egocentrica-parceiro-de-indicacao`: o parceiro P07 no centro, 9 contas diretas e 14 indiretas. Demonstra o nó central em `var(--chart-1)` com rótulo em peso 700, os dois anéis de referência com o grau escrito, o leque do segundo anel junto de quem indicou, a contagem por anel na linha de leitura e o rótulo horizontal dentro do nó e fora do círculo.
- `v2_circular-coocorrencia-de-origens`: 12 origens em três grupos e 19 pares que dividem jornada, com a busca paga acesa. Demonstra os arcos de grupo com vão, a curva quadrática com controle puxado para a corda nos vizinhos, o foco por `highlightId` sem cor abaixo do piso, o nome do grupo numa vaga própria no meio do arco e a ordem declarada no rodapé.
- `v3_equipes-que-compartilham-oportunidades`: 16 equipes em três categorias e 18 pares, com 3 equipes isoladas. Demonstra o chord sem fita com linha de espessura única, a contagem de parceiras junto do nome, o nó isolado vazado com o zero escrito, a nota de que a espessura não mede quantidade e a ordem por categoria e grau.
- `v4_parceiro-sem-indicacao-no-periodo`: o parceiro P12 sem indicação no 3º trimestre de 2026, com 5 indicações anteriores. Demonstra o estado vazio com o nó central mantido, o histórico vazado e tracejado rotulado como anterior, a diferença escrita entre zero medido e carteira não carregada e a frase acessível com a última indicação.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Na `v1`, passe `data` como lista de indicações (`from`, `to`) e `egoId` com o código do centro. Não ordene antes: a ordem do primeiro anel é do componente. Conta indicada por duas diretas fica com a primeira da lista, e indicação de terceiro grau em diante não é desenhada. Leque com mais de 3 contas aperta o passo e os códigos encostam: acima disso, corte a lista por conta direta e escreva o que ficou de fora.
3. Na `v2`, cada origem traz `label`, `inSentence` (o nome sem a maiúscula de rótulo, para o meio da frase) e `group`; `groups` dá a ordem da volta. `highlightId` é a origem acesa; id que não existe deixa tudo em neutro e a linha de leitura passa a citar a origem com mais ligações.
4. Na `v3`, cada equipe traz `category`, e `categories` dá a ordem da volta. Equipe sem par não some: vira anel vazado. O dado é de existência; se houver quantidade por par e ela importar, o modelo é o chord simétrico.
5. Na `v4`, `loaded` falso troca o cartão inteiro pelo estado de ausência de dado; `loaded` verdadeiro sem indicação no trimestre é o zero medido do preview. Não troque um pelo outro. Use a `v1` quando o trimestre tem indicações e a página quer o alcance.
6. O `viewBox` é o tamanho do corpo do cartão do catálogo: 422 x 355 na `v1` e na `v2`, 574 x 425 na `v3`, 220 x 225 no grafo da `v4`. Mudou o cartão, mude `VIEW_W`, `VIEW_H`, o centro e os raios juntos, senão o texto chega à tela abaixo de 11 px (GEO-18). Na circular quem limita o raio é a largura do maior rótulo, não a altura.
7. Dê altura ao pai antes de embrulhar em `VisualCard`, e troque o bloco de vazio por `EmptyState` e o de ausência por `UnavailableState`.

## Referências

- [Apache ECharts, Les Miserables (circular layout)](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/graph-circular-layout.ts): o layout circular com curvatura, de onde vem a curva quadrática com controle no centro.
- [Data Visualisation Catalogue, Non-ribbon Chord Diagram](https://datavizcatalogue.com/methods/non_ribbon_chord_diagram.html): o chord só com nós e linhas, que é a `v3`.
- [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): o custo de orientação do arranjo circular, motivo para oferecer a lista de pares em tela estreita.
- `VISUAIS/12_hierarquia/07_arvore-e-dendrograma/README.md`: o vizinho radial de pai para filho, de onde vêm o `viewBox` do tamanho do corpo e o rótulo de perímetro sem giro.
- `VISUAIS/27_rede-e-relacoes/05_arc-diagram/README.md`: o vizinho de eixo único, de onde vêm a medição do traço neutro e o revestimento da ligação acesa.
- `app/src/lib/format.ts`: `formatInt`, `formatDate`, `formatMonthShort` e `formatUnavailable`, os formatadores do modelo.
- `app/src/styles/tokens.css`: `--chart-1`, `--accent-cyan-contrast`, `--text-muted`, `--text-secondary`, `--surface-raised` e `--line-subtle`.

## Desvios do catálogo, declarados

Em quatro pontos a especificação do catálogo colide com o contrato. Em todos o contrato vence, e o desvio está também na nota do `meta.json` de cada versão.

0. **Controle da curva na `v2`.** O catálogo pede o controle no centro. Com ele a baixada corria por baixo da ligação acesa e do revestimento dela (ACE-6, TOK-4), com até 60% do caminho coberto. O controle agora é `centro + k × (meio da corda − centro)`, `k = 0,85 × (1 − distância angular ÷ 180)`. A `v3` segue com o controle no centro, sem acesa nem revestimento.
1. **Rótulo girado.** O modelo pede o rótulo girado pelo ângulo e virado 180 graus na metade esquerda. A TIP-5 proíbe `rotate` em texto, sem exceção para radial. O rótulo é horizontal nas quatro versões.
2. **Ligação e histórico em `var(--line-strong)`.** A `v2` pede a ligação fora de foco nesse token com opacidade baixa, e a `v4` pede o histórico nele. O traço carrega a relação (ACE-6) e o token mede 1,79:1 no escuro e 1,83:1 no claro. Ficou `var(--text-muted)`: a 0,76 de opacidade na `v2`, que mede 3,58:1 e 3,28:1, e opaco, vazado e tracejado na `v4`.
3. **Período como `2026-T3`.** Na tela da `v4` o trimestre sai por extenso, porque o formato do dado não é formato de tela (NUM-7).

## O que o check não mede nestas peças, e a medição à mão

O `check` fecha com 0 erros e 0 avisos nas quatro versões, e as guardas de desenho medem as quatro: `COLISAO-TEXTO`, `TAMANHO-TEXTO`, `CONTRASTE-TEXTO`, `CONTRASTE-MARCA` e `TEXTO-NA-MARCA`, porque o `viewBox` é o corpo do cartão e a escala sai 1. O que ficou fora, com o que foi conferido no lugar:

- `ESPESSURA-MARCA` sai `sem_marca_de_barra` nas quatro: a guarda só tem piso para marca de barra. Os nós que levam texto dentro medem 28 px de diâmetro no primeiro anel da `v1` e 36 px e 32 px no nó central da `v1` e da `v4`, contra o piso de 17 px e 18 px do rótulo interno (texto mais 6 px).
- `OPACIDADE-MARCA` sai `sem_opacidade_em_marca` nas quatro. Só a `v2` usa opacidade, e ela chega ao traço pela constante `DIM_OPACITY`, que a guarda não segue. Medido à mão contra `tokens.css`: `--text-muted` a 0,76 sobre o cartão dá 3,58:1 no escuro e 3,28:1 no claro.
- `RAIO-CONTRA-AREA` sai `sem_dado` na `v1`, na `v2` e na `v3` e `valor_nao_casado` na `v4`. Nenhum raio destas peças codifica valor: o tamanho do nó separa o papel (centro, direta e indireta na `v1`; selecionada e demais na `v2`) e é um só na `v3` e na `v4`.
- `FORMATO-ACESSIVEL` mede 2 das 4 e sai `frase_sem_formatador` nas outras, em que a frase passa por uma função local (`countLabel`) antes do `formatInt`. Conferido à mão: corpo e frase usam `formatInt`, `formatDate` e `formatMonthShort` nas mesmas medidas.
- Par marca contra marca da `v2` (TOK-9): `--chart-1` contra a ligação baixada mede 2,65:1 no escuro e 1,83:1 no claro. O destaque não depende só da cor: espessura, revestimento, tamanho do nó e peso do rótulo mudam junto.
- O bloco de texto da `v4` é HTML e sai `texto_em_html` trecho a trecho; o grafo dela, em SVG, é medido.

## Pendências conhecidas

- O resumo do modelo prevê que o segundo grau que transborda o anel vire "mais N" escrito. Nenhuma das quatro versões pede isso no que demonstra, e a `v1` desenha as 14 contas; o corte não foi escrito nesta leva. Leque com mais de 3 contas aperta o passo dentro do setor de quem indicou, e os códigos passam a encostar.
- Na `v2` o nome do grupo fica na mesma coluna dos rótulos das origens, entre elas. Com rótulo horizontal não há raia livre fora deles em 422 px: o nome além dos rótulos passaria da borda.
- Na `v3`, pares de nós vizinhos na volta desenham um laço estreito que vai até meio raio (geometria do catálogo, controle no centro); a `v2` já usa o controle puxado para a corda e a `v3` deve acompanhar numa próxima revisão.
- A caixa de colisão dos rótulos da `v2` e da `v3` usa 6,6 px por caractere, sempre para mais, e não a largura medida de cada nome. A borda do cartão não entra nessa conta: nome mais longo que 15 caracteres na `v2`, ou rótulo de nome e contagem acima de cerca de 145 px na `v3` (o mais largo do dado mede 133 px e para a 14 px da borda), passa da borda e pede raio menor.
- Na `v3` a contagem usa duas palavras, parceiras nas equipes ligadas e relações na isolada, como o catálogo escreve.
- Na `v4` só o estado de zero medido aparece no preview. O estado de carteira não carregada e o de trimestre com indicação estão no código e não foram fotografados.

## Observações da revisão (não bloqueantes)

**2026-10-13, revisão independente das quatro versões.** A `v1`, a `v3` e a `v4` foram aprovadas. A `v2` foi reprovada porque a ligação acesa cobre ligações baixadas que dividem nó com ela, e o parecer está em `validation/revisao_27_rede-e-relacoes__06_grafo-radial-e-circular_2026-10-13.md`. O que segue não reprova.

- `v1`: a nota de ordem diz "em sentido horário" sem dizer de onde a volta parte. O ponto de partida é a costura à direita, onde o grau vai escrito; vale escrever isso na nota.
- `v2`: a legenda das ligações fica abaixo do desenho, e a ROT-4 pede acima ou ao lado; a contagem abre a frase em vez de ir em coluna à direita (ROT-5). Sem consequência visível no preview.
- `v2`: o `notes` mede o par marca contra marca só entre ligações (TOK-9). O nó aceso em `var(--chart-1)` contra o nó comum em `var(--text-secondary)` mede 1,16:1 no escuro e 1,35:1 no claro e não está escrito. O segundo canal existe, a ligação acesa que chega ao nó e o peso do rótulo, mas na parceira o nó não muda de tamanho nem de forma.
- `v2`: o comentário do `data.ts` fala em dois empates de grau dentro do mesmo grupo. São três: Evento e Parceiro também empatam, com 2 pares cada.
- `v3`: nos quatro laços de vizinhos (Vendas A com Vendas B, Vendas C com Vendas D, Pré-vendas A com Pré-vendas B, Pós-venda A com Pós-venda B) quase todo o comprimento corre fundido com as outras linhas dos dois nós: 95% e 85% do caminho nos dois primeiros ficam a menos de 1,2 px de outra linha. Nada é apagado, porque a cor é uma só, e o par se lê pela volta do laço. Se a `v2` tirar o ponto de controle do centro para pares próximos, a `v3` deve acompanhar, e o item 5 da Anatomia também.
- `v4`, com peso: o ramo de trimestre com indicação não foi fotografado e, pela conta do código, colide. Os dois anéis partem da mesma costura, então com 1 indicação no trimestre e histórico ímpar, ou com a mesma quantidade de nós nos dois anéis, o nó do trimestre cai em cima do raio tracejado de um nó do histórico. Com 1 indicação no trimestre e as 5 do dado, o rótulo do nó novo ocupa de cerca de 37 a 57 px em x, o halo dele cobre o tracejado entre os dois nós e a caixa encosta no anel vazado de C58, que vai de 29 a 39 px. O histórico passa a parecer indicado pela conta nova, ou fica sem raio. Saída: girar o anel do trimestre para os vãos do histórico, ou tirar o ramo e mandar o caso para a `v1`. Não medido em render.
- `v4`: as duas datas em `font-display` estão dentro de parágrafo de peso 400, e Space Grotesk 400 não é carregado (TIP-4). O navegador sobe para 500 e a data sai mais pesada que a frase em volta. Declarar o peso no `span`.
- `v4`: com `referrals` vazio e `loaded` verdadeiro, a raiz segue `role="img"` com o nó central sozinho, e a EST-1 pede `role="status"` no vazio. O desvio está declarado no `notes` e a frase acessível cobre o caso.

**2026-10-13, segunda revisão da `v2`, depois da troca do controle da curva.** A `v2` foi aprovada: as 32 perguntas dão sim nos dois temas e o bloqueante da primeira passada saiu. Medido de novo nos dois PNGs, por amostra ao longo de cada ligação baixada fora do raio do nó: 13 das 14 têm de 91% a 100% do caminho à vista, e a pior, Redes pagas com Display, tem 77% no escuro e 80% no claro, com 51 px seguidos à vista (na primeira passada a mesma ligação tinha 60% do caminho coberto e nenhum trecho próprio). `--text-muted` a 0,76 recalculado contra `tokens.css`: 3,58:1 no escuro e 3,28:1 no claro. O que segue não reprova.

- `v2`: os últimos 15 px de Redes pagas com Display, antes do nó de Display, correm por baixo da ligação acesa de Busca paga com Display e do revestimento dela, porque as duas chegam ao nó com 3,2 graus de diferença. O par se lê pela continuidade, já que a acesa termina no mesmo nó. Vale abrir esse ângulo, por exemplo fazendo o `k` cair mais depressa entre 2 e 3 vagas de distância, para a leitura não depender deste dado.
- `v2`: oito pares de ligações baixadas saem do mesmo nó com 1 a 6 graus de diferença e correm juntas por 10 a 19 px a partir do centro do nó antes de abrir (Redes pagas para Display e Marketplace; Busca orgânica para Blog, Acesso direto e Redes orgânicas; Blog para Busca orgânica e Acesso direto; Redes orgânicas para Busca orgânica e Blog; Indicação para Evento e Parceiro; Parceiro para Evento e Indicação). A cor é uma só, nada é apagado e o desenho se lê como forquilha.
- `v2`: o primeiro parágrafo do comentário de abertura do `Chart.tsx` ainda diz curva de controle no centro, enquanto o comentário de `edgePath`, o `meta.json` e este README dizem controle puxado para a corda (DAD-10). E `CONTROL_PULL` ficou declarada depois da interface `Point`, fora do bloco de constantes do topo.
- `v2`, ramo não fotografado: sem `highlightId` válido, a linha de leitura escreve que uma origem lidera e a frase acessível que ela é a que mais divide jornada. No dado padrão Busca orgânica e Busca paga empatam com 5 pares e o desempate é o nome, sem que o empate seja dito. Escrever o empate ou trocar por uma das que mais dividem. Lido do código, não renderizado.
- `v2`: seguem valendo as três observações da primeira passada (legenda abaixo do desenho, nó aceso contra nó comum em 1,16:1 e 1,35:1, três empates de grau no comentário do `data.ts`). Nenhum desses pontos mudou nesta correção.
