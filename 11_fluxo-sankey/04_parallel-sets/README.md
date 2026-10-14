# Parallel sets

## O que é

Cada eixo é uma dimensão categórica da mesma população, dividida em segmentos empilhados; faixas sem seta ligam eixos vizinhos e mostram como os atributos se combinam. Não é sequência no tempo nem fluxo com direção física: a ordem dos eixos é escolha de leitura, e só eixos vizinhos se comparam diretamente. A cor pertence só à primeira dimensão, que se mantém identificável ao longo de todo o caminho; as demais dimensões ficam em neutro, porque cada um dos seus segmentos combina gente de mais de uma categoria da primeira.

## Quando usar

- Cruzar 3 ou 4 atributos categóricos da mesma população, com até 5 categorias por eixo.
- Achar as combinações que concentram volume, como origem, porte e desfecho das agendas.
- Mostrar a cobertura de dado cruzada com o desfecho, quando a ausência é uma categoria do eixo.

## Quando evitar

- Mais de 4 eixos ou mais de 5 categorias por eixo: vira emaranhado; para dois atributos, usar a matriz categórica (15_mapa-de-calor-e-calendario, 02_matriz-categorica).
- Ler correlação entre eixos que não são vizinhos: reordenar os eixos ou fazer outro diagrama.
- Combinações com poucos casos, que sugerem padrão falso: agrupar em "outras combinações".
- Mesmas unidades em momentos diferentes: usar o 03_alluvial.
- Parte de um todo em duas dimensões lida por área: usar a família 26_mosaico-marimekko.

## Anatomia

1. Três eixos em `TypeScript` puro (`origens`, `portes`, `desfechos`), posicionados a intervalo fixo (`xOrigem`, `xPorte`, `xDesfecho`), cada um com o segmento em `BLOCK_WIDTH` de largura.
2. Segmentos empilhados em `<rect>`, um por categoria, sempre na ordem fixa do eixo: a soma acumulada do dado decide a posição, a mesma técnica de cursor do `03_alluvial`.
3. Uma raia de rótulo (`LABEL_LANE`) reservada ANTES de cada segmento, nos três eixos, com o nome da categoria e a contagem numa linha só. A raia fica acima do próprio segmento e nunca recebe tinta de faixa, porque as faixas só ocupam a extensão vertical dos segmentos: por isso o eixo do meio, que não tem margem lateral livre, também consegue rótulo direto sem halo e sem cruzar marca.
4. Faixas da camada 1 (origem para porte) em `<path>` como Bézier horizontal, coloridas pela categoria de ORIGEM em slot fixo (`--chart-N`, ordem 1, 3, 6, 5, 2 da COR-8); um único `sort` por (origem, porte) entrega ao mesmo tempo a saída da origem ordenada pelo porte e a entrada do porte ordenada pela origem.
5. Faixas da camada 2 (porte para desfecho) na mesma geometria, mas cada linha do dado já é a combinação inteira: o `sort` usa (porte, desfecho, origem), o que agrupa pelo porte, ordena a saída pelo segmento de destino (o desfecho) e usa a origem só para desempatar, sem perder a cor herdada da primeira dimensão.
6. Porte e desfecho em neutro (`--line-strong`), como os nós de destino do `01_sankey-simples`: cada um dos segmentos combina gente de mais de uma origem, então não tem uma cor categórica própria.
7. Legenda de cor por origem acima do diagrama (`aria-hidden`, porque a frase acessível da raiz já cita a origem líder), única fonte da correspondência entre cor e nome de origem para quem olha uma faixa isolada longe do eixo.
8. Cabeçalho de eixo (`Origem`, `Porte`, `Desfecho`) centralizado acima de cada coluna.
9. Linha de leitura calculada do dado no topo do corpo: a origem líder e o desfecho mais comum, com a contagem de cada um (ANO-5).
10. `data` vazio troca o diagrama inteiro por um bloco `role="status"` (EST-1).

As versões v2, v3 e v4 partem da mesma geometria e mudam três coisas, nesta ordem de importância:

11. **Empilhamento por ordem única, e fita contínua.** Em vez de reordenar a saída de cada eixo pelo segmento de destino, as três irmãs empilham as combinações dentro de toda categoria pela MESMA ordem lexicográfica. Com isso cada combinação vira uma fita de espessura constante do primeiro ao último eixo, e a conservação do fluxo fica visível: o que entra numa categoria sai dela inteiro, na mesma altura relativa. É o que permite acender uma combinação de ponta a ponta na v2.
12. **A ordem de empilhamento é declarada** (armadilha GEO-12) e é OUTRA COISA da ordem dos eixos. Uma ordem global só deixa UMA adjacência sem cruzamento, a dos seus dois primeiros critérios; as demais cruzam. A v3 declara `stackOrder` com telefone na frente exatamente por isso, para o vão limpo cair entre telefone e desfecho, que é onde a pergunta mora, e paga o preço no vão entre origem e cargo.
13. **Texto em `<text>` de SVG, com `viewBox` igual ao corpo medido da moldura.** A v1 desenha o texto em HTML sobreposto ao SVG; as irmãs escrevem tudo dentro do SVG e declaram `viewBox` com o tamanho exato do corpo (894 px de largura, altura conforme o canvas), de modo que a escala sai 1 e 11 px declarados são 11 px na tela. O ganho é de medição: `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` passam a MEDIR a peça, em vez de saírem `texto_em_html` sem olhar nada.
14. **Raia de rótulo de duas linhas**, nome numa e contagem na seguinte, num `<text>` só com dois `<tspan>`, sempre dentro da faixa horizontal do próprio bloco, onde nenhuma fita passa. Por isso o rótulo dispensa halo e o bloco é dimensionado pela soma de glifo do rótulo mais largo, nunca por estimativa.
15. **Eixo com menos categorias é centrado** no vão do eixo mais alto, para os eixos ocuparem a mesma extensão vertical e nenhum parecer maior do que é.

## Versões

- `v1_origem-porte-e-desfecho-das-agendas`: origem, porte da empresa e desfecho das 248 agendas de pré-vendas marcadas em 2026-08, com 5 origens, 3 portes e 4 desfechos. Demonstra os três eixos como barras finas segmentadas com nome da categoria e contagem, as faixas coloridas pela primeira dimensão em slots fixos, a geometria compartilhada com o alluvial sem seta e sem ordem temporal, e o vão entre segmentos com faixas ordenadas pelo segmento de destino.
- `v2_combinacao-em-destaque`: quanto pesa a combinação Indicação, Grande e Realizada nas 248 agendas de 2026-08. Demonstra a prop `highlight` com uma categoria por eixo, a fita acesa em `--chart-1` atravessando os três eixos contra todo o resto no neutro da 17.2, a fatia acesa dentro de cada bloco costurando as duas faixas, a contagem e o percentual da combinação na linha de leitura, e a ordem inicial dos eixos fixa na prop `axisOrder`.
- `v3_cobertura-de-dado-dos-leads-por-origem`: se a falta de telefone e de cargo pesa no desfecho dos 1.240 leads de 2026-08. Demonstra quatro eixos, o teto do modelo, o segmento de ausência vazado com contorno `--text-muted` e sempre por último, a ordem dos eixos que põe telefone vizinho do desfecho, a cor vinda do eixo de telefone em vez da primeira dimensão, e a frase acessível com a taxa de qualificação com e sem telefone.
- `v4_combinacoes-raras-agregadas`: o que sobra das 28 combinações das 248 agendas quando as raras viram uma só. Demonstra o limiar de 5 agendas em constante no topo do arquivo, a faixa "outras combinações" em `--line-strong` presente nos três eixos e com a contagem escrita, a lista das seis agregadas uma a uma no rodapé como alternativa tabular, a anotação do limiar, e a agregação feita no componente com o `data.ts` entregando as combinações cruas.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/AgendaParallelSets/`.
2. Troque o `import` do `./data` pelas listas reais de `origens`, `portes`, `desfechos` e pelas combinações (`data`); mantenha a mesma forma de `ParallelCombo` para o layout continuar calculando sozinho, já que todo total de eixo é somado das combinações, nunca declarado à parte.
3. Passe `data` pela prop a partir do seletor da página; o default do `data.ts` fica só como amostra do catálogo.
4. Dê altura ao pai (`<div className="h-72">`, por exemplo) ou passe `height`. Na v1 o SVG usa `preserveAspectRatio="none"` e ocupa 100% do contêiner nos dois eixos; nas v2, v3 e v4 o `viewBox` tem a proporção do corpo da moldura do catálogo e o SVG escala junto, então o cartão do Farol precisa de proporção parecida para o texto não encolher abaixo de 11 px. Cartão bem mais baixo que o canvas declarado pede mudar `VIEW_HEIGHT` e recalcular `LANE`, `AXIS_TOP` e `AXIS_BOTTOM`, que são todos constantes do topo do arquivo.
5. Nas v2, v3 e v4 confira que o bloco continua mais largo que o rótulo mais largo depois de trocar os nomes das categorias: `BLOCK_WIDTH` é dimensionado pela soma de glifo do rótulo, e nome mais comprido do que ele volta a encostar em tinta de fita.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Data Visualisation Catalogue, Parallel Sets](https://datavizcatalogue.com/methods/parallel_sets.html): a diferença para o sankey, sem setas, a população se divide em cada conjunto de linhas.
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): a confusão entre sankey e alluvial, que também atinge parallel sets.
- [RAWGraphs, Alluvial Diagram (código)](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src/alluvialdiagram): a geometria compartilhada, dimensões categóricas como eixos, retângulo por valor único.

## Observações da revisão (não bloqueantes)

- `v1_origem-porte-e-desfecho-das-agendas`: a origem em slot 6 (Rede profissional) convive com a de slot 2 (Indicação), o par que a COR-8 mede em ΔE 4,1 sob deuteranopia no tema claro; o vão da COR-5 existe (contorno `--surface-raised` de 1), mas a faixa em si não tem rótulo próprio, então a correspondência entre cor e origem depende da legenda.
- `v1_origem-porte-e-desfecho-das-agendas`: a amostra da legenda é um quadrado arredondado, enquanto a marca que ela nomeia é a faixa; a ROT-4 pede a amostra na forma da marca.
- `v1_origem-porte-e-desfecho-das-agendas`: as faixas de 1 e de 2 agendas ficam mais finas que o contorno de separação de 1 unidade, então aparecem como fio de cabelo nos dois temas; é proporcional ao dado, mas está no limite da leitura.
- `v1_origem-porte-e-desfecho-das-agendas`: a frase acessível escreve a competência como `2026-08`; pela NUM-7 o texto de tela pede `formatMonthShort`, que imprimiria `ago/26`.
- `v1_origem-porte-e-desfecho-das-agendas`: o item 7 da Anatomia diz que a legenda é `aria-hidden`, mas no código só as amostras de cor levam o atributo e o texto da legenda segue legível pelo leitor de tela; quem diverge é o README, não o componente.
- `v1_origem-porte-e-desfecho-das-agendas`: o rótulo "Não compareceu, 7 agendas" é atravessado pela faixa fina de Orgânico nos dois temas, sem halo e sem deslocamento (ROT-7). Medido no preview: a faixa segue contínua coluna a coluna sob o texto, que continua legível, então o desvio não parte a marca; mas contraria o item 3 da Anatomia, que afirma que a raia de rótulo nunca recebe tinta de faixa.
- `v1_origem-porte-e-desfecho-das-agendas`: os três eixos terminam em alturas diferentes, porque o número de raias de rótulo difere (5, 3 e 4), e a coluna de origem parece mais extensa que a de porte. A tinta dos segmentos mede 217, 221 e 219 px no preview escuro, ou seja, os três eixos somam a mesma população e a leitura proporcional continua correta; quem cresce é o vão, não o dado.
- `v1_origem-porte-e-desfecho-das-agendas`: o SVG usa `preserveAspectRatio="none"`, então a escala vertical e a horizontal divergem no canvas largo (cerca de 0,75 contra 1,00) e o contorno de separação de 1 unidade sai mais fino na vertical que na horizontal. Não muda a proporção dentro de cada eixo, que é medida só na vertical.

- Registro do produtor, `v2`, `v3` e `v4`: as três levam aviso de `CONTRASTE-MARCA`, porque `--line-strong` preenchido mede 1,79:1 no escuro e 1,83:1 no claro. Não é descuido: a 17.2 nomeia esse token como o neutro da marca não destacada, e nas três a fita neutra é justamente o que não deve competir com o que está aceso. As contagens das categorias que essas fitas atravessam vão escritas no rótulo, que é a isenção que a ACE-3 admite.
- Registro do produtor, `v3`: a ordem de empilhamento declarada deixa o vão entre telefone e desfecho sem cruzamento e cobra o preço no vão entre origem e cargo, que fica emaranhado. Uma ordem global de empilhamento só limpa UMA adjacência; a escolha foi limpar a que responde à pergunta. Quem reordenar os eixos precisa reordenar `stackOrder` junto.
- Registro do produtor, `v2`, `v3` e `v4`: as guardas de texto medem estas três peças porque o texto vive em `<text>` de SVG e o `viewBox` repete o corpo da moldura, então a escala sai 1. Colado num cartão do Farol de proporção diferente, o texto escala junto e pode cair abaixo dos 11 px da TIP-2 sem nenhuma guarda acusar, porque a `TAMANHO-TEXTO` lê o tamanho DECLARADO. É o passo 4 de "Como colar no Farol".
- Registro do produtor, `v4`: a raia de rótulo deixa 3,2 px entre a tinta da primeira linha e o bloco da categoria de cima. É o mínimo do desenho atual, e encolher `LANE` abaixo de 32 px encosta o rótulo na marca. Aumentar o número de categorias por eixo pede canvas mais alto, não raia menor.
- Registro do produtor, `v2`: a especificação da versão pedia as fitas fora de foco a 15% de opacidade, e o contrato venceu, porque a ACE-5 mede o mínimo entre 0,63 e 0,77 nas cores de papel. O fora de foco saiu por token neutro, sem opacidade nenhuma, e o desvio está declarado na nota do `meta.json`.
