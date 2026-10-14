# Sankey simples de duas colunas

## O que é

Nós dispostos em duas colunas, ligados por faixas cuja largura é proporcional ao volume que passa por elas: de onde o lead vem e onde ele termina. Lê se pela espessura relativa das faixas que chegam a cada nó, não pela posição vertical. A largura da faixa **é** o valor, então a soma de entrada e a de saída de cada nó precisam fechar por construção: quando não fecham, o Sankey do Recharts toma o maior dos dois lados como valor do nó (`Math.max` em `getNodesTree`), o nó fica mais alto que as faixas que o alimentam e nada na tela avisa. A orientação vertical, para coluna estreita e celular, é a `v4` deste mesmo modelo.

## Quando usar

- Origem para desfecho numa unidade só (leads, agendas ou reais), com até 8 nós por coluna.
- Handoff de uma equipe para outra: quem entrega para quem e em que proporção.
- Cruzamento de duas classificações da mesma população em que a direção de origem para destino é clara.
- Coluna estreita de painel ou celular, na versão vertical, com até 5 nós por nível.

## Quando evitar

- Mais de 8 nós por coluna sem agrupar em "Outros": as ligações viram fios abaixo de 1 px. Agrupar as menores, como a `v2` faz com as ligações abaixo de 3 agendas.
- Caminho com três ou mais etapas e perdas no meio: usar o `02_sankey-multietapa`.
- Mesmas unidades mudando de categoria no tempo, sem direção de fluxo: usar o `03_alluvial`.
- Funil linear sem ramificação: usar a família `10_funil`.
- Leitura exata de cada par origem e destino: usar a matriz de transição em `15_mapa-de-calor-e-calendario, 07_matriz-de-transicao`.

## Anatomia

1. **Nó** (retângulo, `nodeWidth` de 14 px na horizontal, `NODE_HEIGHT` de 12 px na vertical): um por origem ou por destino, com o lado proporcional ao volume que passa por ele. Origem em cor fixa por categoria, tomada do campo `slot` do dado nos slots 1, 3, 6, 5 e 2 da COR-8; destino em neutro, porque mistura faixas de mais de uma cor.
2. **Nó de ausência** (`v3`): sem preenchimento, com contorno `var(--text-muted)` de 1,5 px, e sempre por último na coluna. A forma vazada mais a palavra escrita são o segundo canal que a ACE-2 pede, e o par é o que a ACE-8 aprova para contorno de ausência.
3. **Rótulo do nó**: nome em `--text-secondary`, 12 px, Manrope 500 (11 px na `v4`, por causa da coluna estreita); contagem em `--text-muted`, Space Grotesk, por `formatInt` e com o substantivo escrito ("420 leads"). Fica fora do nó, na margem lateral reservada.
4. **Ligação** (faixa): forma FECHADA de duas cúbicas, com espessura proporcional ao valor, cor herdada do nó de origem e **sem opacidade**. A forma fechada existe para a faixa poder levar contorno próprio; um traço grosso com `strokeWidth` não leva.
5. **Contorno de faixa** (`var(--surface-raised)`, 1 px): separa faixas coladas e faixa de nó sem mexer no contraste do preenchimento. É a saída que a COR-5 autoriza e a que a TOK-4 exige, porque as categóricas são calibradas contra o cartão e não umas contra as outras.
6. **Linha de chamada** (`v4`, `var(--text-muted)`, 1 px): nasce dentro do nó e para no rótulo deslocado para a segunda fileira. Carrega relação, então mede 3:1 pela ACE-6.
7. **Linha de leitura**: frase de 12 px no topo do corpo, calculada do dado, com o agregado que é o denominador de tudo o que está desenhado.
8. **Frase acessível**: na raiz, com o tipo de gráfico, quantas origens e destinos, e a mesma conclusão da linha de leitura, pelos mesmos formatadores.

## Versões

- `v1_origem-para-desfecho-dos-leads`: 1.240 leads de cinco origens até quatro desfechos de qualificação. Demonstra o Sankey nativo do Recharts com nó e ligação customizados por token de cor, montado de um dicionário nome para índice, e a margem lateral reservada para rótulo fora do nó. Preview: [v1_origem-para-desfecho-dos-leads/preview.svg](./v1_origem-para-desfecho-dos-leads/preview.svg) (escuro) e [preview-claro.svg](./v1_origem-para-desfecho-dos-leads/preview-claro.svg) (claro).
- `v2_handoff-sdr-para-executivo-com-foco`: as 187 agendas realizadas de cinco SDRs para oito executivos, com o SDR 3 aceso. Demonstra a prop `highlightId` acendendo as faixas de um nó com o resto em neutro **por token e não por opacidade**, as 40 ligações do dado reduzidas a 35 depois que as abaixo de 3 agendas caem em "Outros executivos", a anotação da maior saída escrita na ponta que a recebe, o peso 700 no nome e no valor do foco (o teto da TIP-3) e as faixas acesas pintadas por último, numa segunda camada desenhada pela última ligação (a ordem do array fica, e com ela a ordem vertical), e o `onMouseEnter` guardando o índice da ligação em estado. Preview: [v2_handoff-sdr-para-executivo-com-foco/preview.svg](./v2_handoff-sdr-para-executivo-com-foco/preview.svg) (escuro) e [preview-claro.svg](./v2_handoff-sdr-para-executivo-com-foco/preview-claro.svg) (claro).
- `v3_origem-ausente-com-cobertura`: 174 dos 1.210 leads chegaram sem origem registrada e seguem no diagrama como nó vazado. Demonstra a ausência como categoria de primeira classe, `sort={false}` para ela não subir na coluna pelo tamanho, a cobertura de 86% calculada do dado na linha de leitura, a ausência fora de "Outros" e fora do teto de 6 cores, e a faixa em cor cheia com contorno de superfície. Preview: [v3_origem-ausente-com-cobertura/preview.svg](./v3_origem-ausente-com-cobertura/preview.svg) (escuro) e [preview-claro.svg](./v3_origem-ausente-com-cobertura/preview-claro.svg) (claro).
- `v4_vertical-em-coluna-estreita`: as 248 agendas marcadas de cinco origens no topo para quatro desfechos na base, em 422 px de largura. Demonstra o layout vertical calculado em TypeScript (o Sankey do Recharts não tem prop de orientação), nenhum `transform` no SVG para o texto seguir na horizontal, o deslocamento das faixas dentro do nó pela posição horizontal do destino, o nome quebrado em duas linhas por palavra inteira em vez de reticência, o `viewBox` no tamanho exato do corpo e as faixas pintadas das maiores para as menores, o rótulo de desfecho em duas fileiras com linha de chamada tratada como obstáculo (o rótulo da fileira de cima se desloca para 10 px à direita dela). Preview: [v4_vertical-em-coluna-estreita/preview.svg](./v4_vertical-em-coluna-estreita/preview.svg) (escuro) e [preview-claro.svg](./v4_vertical-em-coluna-estreita/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Troque `data` pelas linhas reais no formato `{ nodes: { name }[], links: { source, target, value }[] }`, com `source` e `target` como índice no array `nodes`, nunca por nome.
3. **Confira a soma antes de desenhar.** Some `value` por `source` e por `target` e compare com o total: se as duas somas divergirem, o Sankey desenha assim mesmo, com o nó maior que as faixas que o alimentam. É a classe de defeito que o acervo registra de uma peça que declarava 412 repasses e somava 338.
4. Na `v1` e na `v3`, a cor da origem vem do dado: mantenha o campo `slot` da categoria ou revise o dicionário local. Da sétima categoria colorida em diante, agregue em "Outras origens" antes de montar o dado (COR-4); a ausência não entra nesse teto.
5. Na `v2`, `highlightId` é o nome do nó aceso, e string vazia deixa o diagrama inteiro em neutro, que é a leitura honesta de "nada em foco".
6. Na `v4`, o `viewBox` é o tamanho do corpo do cartão: mudou o canvas, mude `VIEW_WIDTH` e `VIEW_HEIGHT` junto, senão o `preserveAspectRatio="none"` distorce as distâncias declaradas.
7. Dê altura ao pai (`h-64` ou similar) antes de embrulhar em `VisualCard`, porque o `ResponsiveContainer` não desenha nada sem altura.

## Referências

- [From Data to Viz, Sankey](https://www.data-to-viz.com/graph/sankey.html): posição dos nós para reduzir cruzamentos e remoção de ligações fracas.
- [Data Visualisation Catalogue, Sankey Diagram](https://datavizcatalogue.com/methods/sankey_diagram.html): espessura como magnitude e cor para categorias ou transição de estado.
- [Recharts, API Sankey](https://recharts.github.io/en-US/api/Sankey/): `nodePadding`, `nodeWidth`, `linkCurvature`, `sort`, `align`, `verticalAlign`.
- [Recharts, exemplo de Sankey](https://recharts-recharts.mintlify.app/examples/sankey): formato por índice e nó customizado com cor por `payload.depth`.
- [Highcharts, Sankey diagram (docs)](https://www.highcharts.com/docs/chart-and-series-types/sankey-diagram): formato `from`, `to`, `weight`, base do dicionário nome para índice.
- Tipagem local `app/node_modules/recharts/types/chart/Sankey.d.ts` (Recharts 3.10.1): confirma que `node` e `link` customizados recebem o nó computado inteiro, inclusive campos extras do dado de origem, e que **não existe prop de orientação**, que é a razão de a `v4` calcular a geometria à mão.
- Fonte local `app/node_modules/recharts/es6/chart/Sankey.js`: `getNodesTree` define o valor do nó como `Math.max` da soma das entradas e da soma das saídas, e `updateYOfTree` define a escala como o MENOR `(altura menos (n menos 1) vezes nodePadding) / soma` entre as colunas. As duas linhas decidem a espessura de toda faixa deste modelo, e a segunda é a conta que precede o render.

## Colisões entre a especificação do catálogo e o contrato (2026-09-28)

Em dois pontos a especificação da `v2` pede o que o contrato proíbe. Nos dois o contrato venceu, e a medição está no campo `notes` do `meta.json` da versão.

- `v2` (ACE-5, guarda `OPACIDADE-MARCA`): a especificação pede as faixas fora de foco **a 15%**. O `fillOpacity` compõe a cor da marca com a do cartão, e a 15% qualquer cor fica entre 1,0 e 1,2:1, abaixo do piso de 3:1 da WCAG 1.4.11; aqui isso apagaria 140 das 187 agendas, ou 75% da população. O apagamento passou a ser por token, `--text-muted`, medido em 5,21:1 no escuro e 5,37:1 no claro. Não se usou o `--line-strong` que a seção 17.2 nomeia para marca não destacada, porque ele mede 1,79:1 e 1,83:1: é a mesma decisão que a `v4` do `03_alluvial` registrou, e o motivo é o peso da população, não o gosto.
- `v2` (TIP-3): a especificação pede peso 700 no nome do nó em foco. A TIP-3 permite 700 em **dois** elementos, o nome e o valor do destaque, e é exatamente o que a peça gasta: o nome e a contagem do SDR aceso. A linha de leitura fica em 600.

Vale também um achado de token que atravessa as três versões novas: **`--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro**, e `--chart-1` contra `--chart-3` mede 1,47:1 e 1,03:1. Isso não é defeito da paleta, é luminância pareada deliberada, e a WCAG pede 3:1 contra o **fundo**, nunca contra outra marca. O que ele obriga é o contorno `--surface-raised` nas faixas, que mede 9,50:1 e 6,00:1 contra `--chart-1`, e não a troca da cor.

## Pendências conhecidas

- `ESPESSURA-MARCA` sai **não medida** (`marca_fora_do_bar`) nas quatro versões, porque a guarda só lê marca de `<Bar>`: a espessura das faixas deste modelo não tem piso automático. Medida à mão nos `preview.svg` desta leva: **v2 mínimo 5,17 px** em 35 faixas, **v3 mínimo 8,70 px** em 20, **v4 mínimo 5,71 px** em 15. As três passam do vão de 1,5 px da COR-5 e ficam abaixo do `ESP_PISO_GERAL` de 12 px, que a própria guarda declara não aplicar fora do `<Bar>`.
- `FORMATO-ACESSIVEL` sai não medida na `v1` (`frase_sem_formatador`), porque lá a frase acessível chega ao `aria-label` por dois saltos de `const` e a guarda segue só um. Nas v2, v3 e v4 os formatadores ficam no próprio inicializador da frase, com o mesmo argumento e a mesma chamada do corpo visível, e a guarda mede.
- `EIXO-CALMO` e `OPACIDADE-MARCA` saem não medidas nas quatro (`sem_grade`, `sem_opacidade_em_marca`): não há eixo cartesiano nem opacidade em marca neste modelo.
- `v1_origem-para-desfecho-dos-leads`: os nós de desfecho continuam em `--line-strong`, que mede 1,79:1 e 1,83:1 contra o cartão, e é por isso que o `check` devolve aviso de `CONTRASTE-MARCA` só nela. A v3 desta leva resolve o mesmo papel com `--text-muted`; migrar a v1 é conserto de uma linha e fica para quem tocar o arquivo.
- `v1_origem-para-desfecho-dos-leads`: as ligações são traço grosso (`stroke` com `strokeWidth`), não forma fechada, então não aceitam contorno próprio e no cruzamento a faixa desenhada depois cobre a anterior por inteiro. As três versões novas usam forma fechada com contorno de superfície.
- `v2`: com 35 faixas em 187 agendas o cruzamento no meio do vão é denso, e a identificação de um par específico depende do foco. É o limite que a seção "Quando evitar" descreve, e a alternativa para leitura par a par continua sendo a matriz de transição.
- `v4`: a margem superior guarda **uma** fileira de rótulo de até três linhas. Dado que exija uma segunda fileira no topo, como cinco origens de nome longo, pede canvas mais alto; o código já escolhe a fileira, mas o espaço não existe.

## Observações da revisão (não bloqueantes)

- `v1_origem-para-desfecho-dos-leads`: nos nós "Descartado" e "Sem contato" as faixas de `--chart-5` e `--chart-2` encostam sem o vão de 1,5 px que a COR-5 pede para vizinhos de pouco contraste. A leitura não sofre, porque o par medido como fraco em deuteranopia (2 e 6) nunca fica adjacente neste dado; ainda assim, um contorno de `--surface-raised` de 1 px na faixa resolveria de vez, inclusive para dados em que a ordem mude. É exatamente o que as v2, v3 e v4 passaram a fazer.
- `v1_origem-para-desfecho-dos-leads`: a ligação Orgânico para Qualificado (16 leads) sai com cerca de 2 px de espessura, visível nos dois temas mas no limite do que o próprio modelo declara em "Quando evitar". Vale o aviso de que, com esse desenho, valor abaixo de 15 leads em 1.240 já vira fio.

Revisão de 2026-10-05, depois da emenda ACE-6 (traço que carrega a relação mede 3:1). As ligações das quatro versões estão em token de dado e passam nos dois temas; os bloqueantes da v2 e da v4 estão em `validation/revisao_11_fluxo-sankey__01_sankey-simples_2026-10-05.md`.

- `v1_origem-para-desfecho-dos-leads`: os nós de desfecho seguem em `--line-strong` (1,79:1 no escuro e 1,83:1 no claro). Não reprova porque o nó não é o traço da relação e a contagem está escrita ao lado dele, que é a isenção da ACE-3; migrar para `--text-muted`, como a v3 e a v4, tira o aviso de `CONTRASTE-MARCA` do check.
- `v1_origem-para-desfecho-dos-leads`: o `meta.json` diz "links por índice, montados de um dicionário nome para índice", mas o `data.ts` já traz os índices escritos à mão e o único dicionário do `Chart.tsx` é de nome para cor. Ou o dado passa a montar os links pelo nome, ou o item perde a segunda metade.
- `v1_origem-para-desfecho-dos-leads`: ligação em traço grosso sem contorno, então no cruzamento `--chart-3` sobre `--chart-1` (1,03:1 no claro entre si) a borda depende só do matiz. As faixas continuam rastreáveis nos dois PNGs; o contorno de superfície das versões irmãs resolve.
- `v2_handoff-sdr-para-executivo-com-foco`: `foldedTargets` conta só destino recolhido por inteiro; com destino parcialmente recolhido a anotação do balde deixa de descrever o conteúdo. O dado padrão não exercita o caso.
- `v4_vertical-em-coluna-estreita`: o `meta.json` fala em "texto e dica" na horizontal, e a versão não tem dica.

Segunda passada de 2026-10-05, sobre a v2 e a v4 corrigidas. A v4 passou; o bloqueante que resta na v2 (faixas acesas duplicadas quando o contêiner muda de tamanho) está no mesmo arquivo de `validation/`, na seção "Segunda passada".

- `v2_handoff-sdr-para-executivo-com-foco`: a anotação do balde escreve "2 execs., menos de 3 por SDR", e "execs." é abreviação inventada (ROT-8). "2 executivos, até 2 por SDR" cabe na mesma margem.
- `v2_handoff-sdr-para-executivo-com-foco`: o `notes` do `meta.json` cita 70 px e 150 px de margem lateral, e o `MARGIN` do código é 80 e 170.
- `v4_vertical-em-coluna-estreita`: a linha de chamada de "Cancelada" passa a 2,0 px da tinta de "29 agendas", o rótulo do vizinho da esquerda. Lê solto nos dois temas, mas fica abaixo dos 4 px da 17.7: a varredura trata a chamada como obstáculo só para o bloco que vem depois dela, não para o que veio antes.
- `v4_vertical-em-coluna-estreita`: todo rótulo da base ganha um toco de chamada de 6 px na borda esquerda do nó, inclusive os que ficam logo abaixo dele. O de "Realizada" nasce a 96 px do próprio rótulo e fica solto; desenhar a chamada só para o rótulo rebaixado ou deslocado tira o toco.
- `v4_vertical-em-coluna-estreita`: o item da versão neste README diz que "o rótulo da fileira de cima se desloca para 10 px à direita" da chamada. Com o dado padrão esse ramo não roda (o rótulo já nasce a 11 px); quem afastou os dois foi a chamada ter ido para a borda esquerda do nó.
