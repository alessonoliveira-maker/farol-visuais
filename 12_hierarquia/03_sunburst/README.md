# Sunburst

## O que é

Anéis concêntricos em que o centro é a raiz da hierarquia, cada anel é um nível e o ângulo de cada setor é proporcional ao valor; com dois níveis equivale a uma rosca aninhada, e a leitura é pela abertura angular de cada fatia dentro do pai, não pela área. Duas consequências valem para todas as versões. A primeira é que **o valor de um nó com filhos é sempre a soma dos filhos**, nunca um total declarado à parte: é essa igualdade que faz a abertura do anel externo fechar com a do interno por construção, em vez de fechar por coincidência do dado. A segunda é que **a cor não carrega profundidade**: a rampa sequencial do Farol tem só três degraus acima de 3:1 nos dois temas e eles medem 1,42:1 e 1,45:1 entre si (TOK-8), então nível vai por raio, borda e rótulo, que é o que o anel já oferece de graça, e a cor fica para a categoria do primeiro nível.

## Quando usar

- Hierarquia de 2 ou 3 níveis em que a pergunta é "de que é feito cada pai".
- Ênfase no total e no primeiro nível, com o total escrito no centro do anel.
- Composição com até 6 categorias no primeiro nível e poucas dezenas de itens no segundo.
- Explorar um ramo mantendo a forma radial, com trilha de navegação acima do gráfico.

## Quando evitar

- Comparação precisa entre fatias ou pergunta de quanto a mais: ângulo é uma leitura grosseira; use barras ou treemap (12/01).
- Comparar a mesma subcategoria entre pais diferentes: a leitura fica impossível no anel externo.
- Comparar um anel com o outro: para o mesmo ângulo o arco de fora é mais longo e a área é maior (GEO-5); o número vem sempre escrito e a comparação de tamanho acontece dentro de cada anel.
- Muitos subníveis finos com rótulo: o `SunburstChart` do Recharts imprime rótulo em **todo** setor e não tem piso angular nem prop que esconda o texto; agrupe antes de desenhar, que é o que a `v4` faz, ou use icicle (12/06).
- Mais de 3 níveis com rótulos longos: use icicle lateral (12/06).

## Anatomia

1. **Furo central.** Vazio de raio fixo (`innerRadius`) reservado para o agregado, escrito numa `div` absoluta por cima do SVG e nunca pelo Recharts. Ele também empurra os anéis para fora, o que aumenta a distância angular entre rótulos vizinhos do anel externo.
2. **Anel do primeiro nível.** Um setor por categoria, ângulo proporcional ao total, cor por categoria (`--chart-1` a `--chart-6`, na ordem de slot da COR-8) gravada no `fill` do próprio nó. Na `v2` a cor é outra coisa: um ramo aceso em `--chart-1` e todos os demais no neutro de dado `--text-muted`.
3. **Anel do segundo nível.** Um setor por filho, na mesma cor do pai, ordenado por valor dentro dele; a soma dos filhos fecha exatamente com o pai.
4. **Contorno e vão.** `stroke` na cor de estrutura que separa segmentos (`--surface-raised`, tabela 17.2) no lugar do branco padrão do componente, e `ringPadding` para o vão radial. Na `v3` o vão sobe de 2 para 6 px, porque dentro de uma categoria aberta os dois anéis têm a mesma cor e um vão de 2 px deixa os dois níveis lendo como um bloco só. Na `v4` o contorno sai em `--text-muted`: ele é a única tinta do setor "Não classificado", que é vazado, e pela ACE-6 o traço que carrega a informação precisa de 3:1.
5. **Rótulo nativo, com halo.** O Recharts imprime o valor cru de cada nó, sem nome e sem formatação, e o texto não se desliga. Como os ramos usam cores categóricas diferentes e só há par aprovado para texto direto sobre `--chart-1` (ROT-6), o `textOptions` ganha um halo opaco em `--surface-raised` (ROT-7): o halo vira o fundo do texto contra qualquer cor de setor, com o par já aprovado `--text-primary` sobre `--surface-raised`.
6. **Lista de identificação.** Uma linha por nó do primeiro nível, com amostra de cor, nome, percentual e contagem em colunas à direita, e logo abaixo o nome e o valor de cada filho. Ela cobre todo nó, inclusive o fino demais para texto no anel, e é o que cumpre a ROT-10, porque a dica não conta. A lista carrega o nível: o filho aparece recuado e menor, nunca na mesma altura visual do pai.
7. **Preparo antes do desenho, na `v4`.** Filho fino demais para o próprio rótulo entra em "Outros subcanais"; a diferença entre o total declarado da origem e a soma dos filhos entra em "Não classificado", desenhado em vazado e escrito no rodapé. Nenhuma das duas some calada.
8. **Estado do caminho, na `v3`.** O caminho aberto é `useState`, o dado do gráfico é a subárvore dele, e o caminho é podado contra a árvore a cada render: id que não existe mais, ou ramo cuja soma de submotivos não é positiva, é descartado e a peça volta à raiz. Os percentuais inteiros saem pelo maior resto, e fecham em 100 no nível aberto. A descida existe no clique do setor e também num botão da lista, porque o SVG fica fora do alcance de quem usa teclado ou leitor de tela.
9. **Frase acessível.** `aria-label` na raiz com `role="figure"`, e não `role="img"`, porque a lista de identificação e os botões de navegação precisam continuar acessíveis.

## Versões

- `v1_entradas-por-origem-e-subcanal`: `SunburstChart` nativo com `innerRadius`, `ringPadding`, `stroke` e `textOptions` sobrescritos, cor por origem gravada no `fill` de cada nó da árvore, subcanais ordenados por valor somando exatamente o pai, total no centro por `div` absoluta, e lista de identificação abaixo do anel. Previews: [preview.svg](v1_entradas-por-origem-e-subcanal/preview.svg) e [preview-claro.svg](v1_entradas-por-origem-e-subcanal/preview-claro.svg).
- `v2_ramo-indicacao-em-destaque`: um ramo aceso em `--chart-1` e todos os outros no neutro de dado, com o ramo aceso declarado no `data.ts` e nunca inferido do ranking, o percentual dele no centro no lugar do total e a base logo abaixo, e o segundo canal do destaque no peso do nome e na linha de leitura. Previews: [preview.svg](v2_ramo-indicacao-em-destaque/preview.svg) e [preview-claro.svg](v2_ramo-indicacao-em-destaque/preview-claro.svg).
- `v3_motivos-de-perda-com-detalhamento`: caminho em `useState`, clique no setor de categoria trocando a raiz, clique em folha sem efeito, categoria aberta voltando como anel interno inteiro, centro virando botão de voltar, trilha acima do anel e caminho podado contra a árvore. Previews: [preview.svg](v3_motivos-de-perda-com-detalhamento/preview.svg) e [preview-claro.svg](v3_motivos-de-perda-com-detalhamento/preview-claro.svg).
- `v4_subcanais-finos-agrupados`: preparo em TypeScript que agrupa subcanais finos em "Outros subcanais" por origem, com o piso derivado da geometria do rótulo, filho "Não classificado" com a diferença entre o total declarado e a soma, desenhado em vazado, lista com os agrupados e seus valores, e rodapé de reconciliação. Previews: [preview.svg](v4_subcanais-finos-agrupados/preview.svg) e [preview-claro.svg](v4_subcanais-finos-agrupados/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão mais próxima para a página de destino.
2. Troque o tipo e o dado de exemplo pela query real, mantendo `id`, `name` e o valor de cada nó, mais `slot` onde a versão pinta por categoria.
3. `slot` vem de um dicionário fixo da página (categoria para posição 1 a 6), nunca da posição no ranking do período: veja a nota em `data.ts`.
4. Dê altura ao pai (`h-96` na grade, por exemplo) ou passe `height`, porque o `ResponsiveContainer` desenha zero sem isso; os canvas de exemplo são mais altos que largos, porque o rótulo nativo não tem nome e a identificação precisa da lista abaixo do anel, então a célula de destino também deve ser vertical.
5. Se a página tiver mais de 6 categorias no primeiro nível, agrupe o excedente em "Outras origens" antes de montar a árvore (COR-4); nenhuma versão faz esse corte sozinha.
6. **Confira o maior valor que a query pode devolver.** O rótulo do componente imprime o valor cru, sem passar por `@/lib/format`, então acima de mil o anel escreve `1180` enquanto o resto do painel escreve `1.180`. As quatro versões mantêm o dado abaixo de mil justamente por isso; acima disso o caminho é trocar a unidade do dado ou aceitar a divergência de forma declarada.
7. Na `v2`, passe `highlightId` vindo da página. Na `v3`, passe `initialPath` com o ramo que a página quer abrir, e lembre que o caminho é local ao componente: uma página que precise dele na URL vai querer subir `path` para prop controlada, o que não está desenhado aqui.
8. Na `v4`, o piso de agrupamento (`MIN_SECTOR_SHARE`) foi calculado para o canvas do catálogo; num cartão bem menor o raio médio do anel externo cai e o piso precisa subir na mesma proporção, porque ele é a razão entre a tinta do rótulo e o perímetro.

## Referências

- Catálogo: [Recharts, API SunburstChart](https://recharts.github.io/en-US/api/SunburstChart/): `innerRadius`, `outerRadius`, `ringPadding`, `startAngle`, `endAngle`, `textOptions` e dado com `children`.
- Catálogo: [From Data to Viz, Sunburst](https://www.data-to-viz.com/graph/sunburst.html): dificuldade de rótulo, leitura de ângulo e distorção dos anéis externos.
- Catálogo: [Data Visualisation Catalogue, Sunburst Diagram](https://datavizcatalogue.com/methods/sunburst_diagram.html): hierarquia e parte do todo em anéis.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): comparações de área e ângulo são grosseiras.
- Tipagem local: `app/node_modules/recharts/types/chart/SunburstChart.d.ts` (Recharts 3.10.1).
- Fonte local, lida em 2026-09-28 para as medições da seção seguinte: `app/node_modules/recharts/es6/chart/SunburstChart.js`, linhas 48 a 54 (`getMaxDepthOf`), 158 (`thickness`), 211 a 231 (setor, chave e rótulo); e `app/node_modules/recharts/es6/component/Text.js`, linhas 149 a 186 e 230 (quando o texto devolve nulo).

## O que o componente do Recharts não faz, medido na fonte

Três limites da biblioteca decidiram o desenho das três versões novas, e nenhum deles está na documentação.

- **O rótulo é obrigatório e é o valor cru.** `SunburstChart.js:226` cria um `<Text>` por setor com `d[dataKey]` como filho, sem condição. Não há prop de rótulo por nó, e `textOptions` não desliga o texto: `Text` só devolve `null` quando `wordsByLines` sai vazio (`Text.js:230`), e `getWordsByLines` sempre devolve ao menos uma linha para um número. Consequência em três frentes: o dado precisa ficar abaixo de mil para o texto cru coincidir com `formatInt`; o setor precisa ser angularmente grande o bastante para o rótulo dele não encostar no vizinho; e a ideia de "rotular só o dominante" não se implementa aqui.
- **A espessura é igual em todos os anéis, e um anel inteiro se perde.** `SunburstChart.js:158` calcula `thickness = (outerRadius − innerRadius) / treeDepth`, e `getMaxDepthOf` conta a raiz, que `drawArcs` nunca desenha. Com dois anéis a peça ocupa dois terços do anel disponível e o terço de fora fica vazio; com um anel só, metade. Não existe prop de espessura por nível, então "anéis externos mais finos" não é expressável, e compensar o terço perdido exigiria fixar `outerRadius` em pixel, o que quebraria o tamanho responsivo da seção 5.
- **A chave de React de cada setor é o nome do nó mais o índice dentro do próprio pai** (`SunburstChart.js:212`), e os setores vão todos para uma lista só. Dois filhos de pais diferentes com o mesmo nome e o mesmo índice caem na mesma chave, e o React avisa que pode omitir um deles. Foi o que aconteceu na `v4`, que tem "Outros subcanais" e "Não classificado" em várias origens; o conserto é dar nome único ao nó da árvore, o que custa zero porque o nome não é desenhado.

## Colisões entre o catálogo e o CONTRATO, resolvidas a favor do contrato

Cada uma está também na nota do `meta.json` da versão.

- `v2`: o catálogo pede o ramo aceso em **accent-cyan**, que é acento de interface e que a seção 7 manda evitar em dado. O destaque saiu em `--chart-1`, que a mesma seção nomeia como a cor de quando só uma coisa acende. Aqui a troca não muda um pixel: os dois tokens têm o mesmo hex nos dois temas (`#2dd4e8` no escuro, `#0b6d7d` no claro).
- `v2`: o catálogo pede **anéis externos mais finos** para compensar a distorção de área do perímetro maior, e a biblioteca não permite espessura por nível. A saída aplicada é a que a GEO-5 prescreve: todo valor vem escrito, no setor e na lista, e a peça declara que os anéis não se comparam entre si.
- `v3`: o catálogo pede **rótulo só no submotivo dominante e o resto na dica**. A ROT-10 anula a segunda metade, porque a dica não existe no preview, no papel nem para quem navega por teclado; a biblioteca anula a primeira. Todo setor leva rótulo e a identificação vive na lista.
- `v4`: o catálogo pede agrupar o que está **abaixo de 1%** do total, e 1% não basta porque o rótulo nativo não tem piso angular. O piso passou a ser derivado da geometria: no anel externo da peça o raio médio é 121,5 px, dois rótulos vizinhos ficam a `pi x 121,5 x (s1 + s2)` px um do outro, e a tinta de três dígitos em Space Grotesk a 11 px mede 19,5 px mais 2 px de halo de cada lado, o que pede 23,5 px de centro a centro; daí cada lado precisa de 3,1%, e o piso usado é 4%. O 1% do catálogo continua descrito no dado, onde três subcanais ficam abaixo dele.
- `v4`: o catálogo pede o "Não classificado" em **neutro hachurado**, e a COR-9 proíbe textura em marca. A saída é o vazado que a ACE-2 e a DAD-2 endossam: preenchimento na cor do cartão e contorno em `--text-muted`, que mede 5,21:1 e 5,37:1, contra 1,00:1 de `--surface-raised` no tema claro.

## O que a leva de 2026-09-28 mudou, e o que a v1 faz que uma regra proíbe

As três versões novas herdaram da `v1` a forma e o estilo, e **não** herdaram duas coisas, porque em cada uma delas uma regra vence o que a `v1` faz. A `v1` não foi tocada: consertá-la aqui a faria perder o veredito.

- **`truncate` na linha de leitura.** `v1_entradas-por-origem-e-subcanal/Chart.tsx:109` escreve a linha de leitura com `truncate`, e o texto dela é "X lidera com N entradas, P% do total": a cauda carrega o número **e** a conclusão. A TIP-7, na emenda de 2026-09-28, só libera `truncate` em texto de apoio cuja cauda não carregue nem um nem outro. Nas três versões novas a linha de leitura não trunca e quebra em duas linhas quando precisa, e o canvas já conta com isso.
- **`truncate` no nome da origem dentro da lista.** `v1_entradas-por-origem-e-subcanal/Chart.tsx:139`. O nome é a identificação de uma marca desenhada, e a TIP-7 proíbe que ele suma por reticência; a revisão de 2026-09-20 já havia registrado o sintoma. Nas versões novas o nome não trunca.
- **Largura de caractere.** Nenhuma das versões novas herdou um `CHAR_WIDTH` único: onde a `v4` precisa estimar tinta de rótulo, a conta usa 6,49 px por dígito em Space Grotesk a 11 px, que é a medição por família do dossiê de produção, e não o 6,4 ou o 6,3 herdados em outras peças do acervo.

## Pendências conhecidas

- **Subcanal fino sozinho, na `v4`.** Quando só um filho de uma origem cai abaixo do piso, ele continua desenhado com o próprio nome, porque agrupar um item só troca o nome dele por um rótulo genérico sem mudar nenhum ângulo. O rótulo dele pode então encostar no vizinho, e o conserto verdadeiro, esconder o texto daquele setor, a biblioteca não permite. O dado fixo não cai nesse caminho: as cinco origens têm dois ou mais filhos finos.
- **O terço vazio do anel.** As quatro versões perdem uma espessura de anel por fora, por conta do `treeDepth` que conta a raiz. Está declarado em cada `meta.json`, e o conserto exigiria fixar o raio em pixel.
- **O preview da `v3` mostra só o estado aberto**, por decisão do catálogo. O anel de cinco categorias, que é o estado mais alto e o que dimensiona o canvas, não aparece nele: quem revisa precisa montar o componente com `initialPath` vazio.
- **`ESPESSURA-MARCA` não mede nada nas quatro versões** (`sem_marca_de_barra` em três, `marca_html` na `v1`): não há `<Bar>` a que aplicar o piso geral. A espessura de anel foi conferida à mão contra o piso de rótulo interno da ESP-2, que é o tamanho do texto mais 6 px, ou 17 px para o texto de 11 px: `v2` 46,3 px, `v3` 30,3 px na raiz e cerca de 51 px no estado aberto, `v4` 31,7 px.
- **`CONTRASTE-TEXTO` e `COLISAO-TEXTO` não alcançam o centro, a trilha, a lista e o rodapé**, que vivem em `foreignObject`. Os pares estão medidos à mão na nota de cada `meta.json`.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-20, `v1_entradas-por-origem-e-subcanal` aprovada; nada abaixo reprova._

- `v1`: a lista de identificação está em ordem de ranking, enquanto os setores saem na ordem do dado (anti-horário a partir das 3 horas). A ROT-4 pede a ordem visual das marcas; aqui cor e número mantêm a identificação de cada setor, então a leitura não se perde, mas a varredura entre anel e lista exige um salto. Vale igual para as três versões novas.
- `v1`: a contagem aparece sem o substantivo nos rótulos do anel e na coluna da direita da lista. A unidade "entradas" vive só no centro do anel e na linha de leitura, o que atende o sentido da NUM-6 para a composição inteira, e não para cada número isolado. Vale igual para as três versões novas, e no anel não há como mudar: o rótulo é do componente.
- `v1`: o vão da lista está em 6 px (`gap-1.5` e `space-y-1.5`) contra os 10 px da tabela 17.7. Sem consequência no preview: os dois temas separam origem de subcanal sem colar texto. As versões novas mantêm o mesmo vão, por consistência dentro do modelo.
- `v1`: `padding` e `ringPadding` repetem o padrão 2 da biblioteca, e o comentário do `SECTOR_PADDING` descreve `padding` como contorno do setor, quando a API do Recharts o define como distância entre setores vizinhos. As versões novas corrigem o comentário; a `v3` sobe o `ringPadding` para 6 px, pelo motivo da Anatomia, item 4.

_Revisão independente de 2026-10-14, `v4_subcanais-finos-agrupados` aprovada, `v2_ramo-indicacao-em-destaque` e `v3_motivos-de-perda-com-detalhamento` reprovadas (bloqueantes em `validation/revisao_12_hierarquia__03_sunburst_2026-10-14.md`); nada abaixo reprova._

- `v2`, `v3`, `v4`: o rótulo do anel sai em `--text-primary` com halo de `--surface-raised` sobre setor preenchido, e a `TEXTO-NA-MARCA` orienta, como dívida conhecida, para o vazado sem halo da ROT-7b. Nos quatro PNGs o número lê limpo. Na `v2` e na `v3` a troca cabe, porque todo setor é preenchido e o vazado mede 5,21:1 e 5,37:1 sobre `--text-muted` e de 5,34:1 a 9,50:1 sobre as categóricas; na `v4` não cabe, porque o `textOptions` é global e o setor "Não classificado" tem o cartão por baixo.
- `v2`, `v3`, `v4`: o recorte de tempo não aparece na tela ("da semana", "do trimestre", "na semana"); 2026-W38, 2026-T3 e 2026-W39 vivem só no comentário do `data.ts`. A DAD-9 pede o período vindo do dado, como prop ou campo.
- `v2`: o catálogo pede anéis externos mais finos, e a versão não os desenha, por limite do `SunburstChart` declarado acima. A saída da GEO-5 tem duas metades, número escrito e a peça declarando que os anéis não se comparam; a segunda vive só no `meta.json` e neste README. Vale uma nota curta na peça ou o catálogo reescrito para o que o componente faz.
- `v2`: o `notes` do `meta.json` diz que o catálogo pede o ramo aceso em `accent-amber`; o catálogo e este README dizem `accent-cyan`.
- `v2`: com `highlightId` fora do dado, o centro escreve `formatUnavailable()` seguido de "de 872 entradas", sem o ícone `Unplug` da EST-2, e não separa a origem desconhecida da origem sem entrada na semana, que é zero medido (EST-3).
- `v2`: o dado fixo põe Indicação também na liderança, então o caso que o `data.ts` anuncia, o destaque fora do primeiro lugar, não aparece no preview.
- `v3`: a cor de ação é `--chart-1` (trilha, Voltar e nomes que descem). Na raiz, que o preview não mostra, os cinco nomes de categoria saem em ciano ao lado de amostras de cinco cores, e o ciano é também a cor de Sem perfil. Melhor `--text-primary` com sublinhado ou ícone de descida; se ficar a cor, o token de interface é `--accent-cyan`, mesmo hex.
- `v3`: o caminho não é podado no estado. `resolveOpen` ignora o id que sumiu, mas `path` continua com ele, e a peça reabre Sem perfil sozinha quando um filtro posterior devolve o ramo; o comentário de `resolveOpen` e o item 8 da Anatomia dizem que o id é descartado.
- `v4`: o percentual da lista é arredondado um a um e o dado fixo soma 100 por coincidência (35, 21, 18, 16 e 10). Usar o maior resto, como a `v2` e a `v3` passaram a fazer (NUM-2).
- `v4`: "Outros subcanais" e "Não classificado" não passam pelo piso de 4%: dois finos de 4 e 3 entradas, ou 2 entradas sem subcanal, desenham setor estreito com rótulo, o mesmo risco da pendência do subcanal fino sozinho, que pode citar os três casos.
- `v4`: `Math.max(declaredTotal − soma, 0)` cala o caso inverso, subcanais somando mais que o total declarado; a origem passa a valer a soma sem aviso no rodapé de reconciliação.
- `v4`: o rodapé "Em vazado" não traz amostra vazada ao lado (ROT-4); nome e número já identificam o setor.
- README: a pendência da `ESPESSURA-MARCA` diz `marca_html` na `v1`; o `check` de 2026-10-14 acusa `marca_html` na `v3` e `sem_marca_de_barra` nas outras três.

_Revisão independente de 2026-10-14, segunda passada depois da rodada única de correção: `v2_ramo-indicacao-em-destaque` e `v3_motivos-de-perda-com-detalhamento` aprovadas; nada abaixo reprova. Os estados fora do preview foram montados numa bancada temporária, sem tocar nos arquivos da versão._

- `v2`: no centro, o número de "de 872 entradas" sai em Manrope sem `tabular-nums` (TIP-1). Como é um número sozinho numa frase, não muda nada no preview. Use `font-display` no número, como a linha de leitura já faz.
- `v2`: o par marca contra marca do destaque não está no `notes`, embora a TOK-9 mande medir e escrever: `--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro. O segundo canal existe: nome em 700 na lista e na linha de leitura, centro nomeando o ramo, valor de cada setor batendo com a lista. Mesmo assim, o rótulo do anel no ramo aceso continua em 500 como os outros, porque o `textOptions` é global. Vale escrever o número no `notes`.
- `v2`: na bancada, com `highlightId` fora do dado, a palavra "indisponível" em 24 px ocupa o furo inteiro e deixa poucos pixels de folga para o anel de cada lado. Isso se soma à observação anterior sobre o ícone `Unplug`.
- `v2`: na bancada, com o ramo aceso zerado, a frase acessível diz "Cliente atual é o maior subcanal dela, com 0". Num ramo em zero o maior subcanal é arbitrário, e essa parte da frase deveria cair.
- `v3`: na bancada, com `initialPath` em Sem perfil e o ramo vazio, zerado ou removido, a peça volta à raiz e a lista fecha com "Sem perfil 0% 0", que é o zero medido da EST-3. O rótulo "0" do setor de ângulo zero existe no SVG, mas os setores vizinhos o cobrem na emenda das 3 horas, então o zero só se lê na lista. Com o dado todo zerado ou a lista vazia, a peça mostra o bloco de vazio.
- `v3`: a observação anterior sobre o caminho não podado no estado continua valendo depois da correção, e agora vale também para o ramo esvaziado. O `path` guarda `sem-perfil`, e quando o filtro devolve submotivos ao ramo a peça reabre Sem perfil sozinha.
