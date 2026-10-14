# Plano com iso-linhas de razão ou produto

## O que é

Um plano de duas medidas em que a regra de decisão não é uma cruz: é uma razão ou um produto dos dois eixos. Razão constante é uma reta que sai da origem, e dá as iso-linhas de retorno da priorização por impacto e esforço; produto constante é uma hipérbole, e dá a fronteira curva de equilíbrio, como vitórias iguais a oportunidades vezes taxa de ganho, ou investimento igual a leads vezes custo por lead. Lê-se pela posição do ponto em relação às linhas: quem está na mesma linha tem o mesmo resultado, e chegou nele por um caminho diferente. Toda linha é calculada em TypeScript, sem biblioteca, e recortada ao domínio fixo do plano.

## Quando usar

- Ordenar uma fila de até cerca de 20 iniciativas por retorno sobre esforço, e não só agrupar em quatro caixas (`v1`, 14 automações).
- A meta é um produto dos eixos e pode ser atingida por volume ou por taxa (`v2`, 14 executivos).
- Mostrar que entidades na mesma curva custam igual e entregam volumes diferentes, com até cerca de 60 pontos sem nome e rótulo só nos extremos (`v3`, 48 campanhas).
- As duas medidas variam por mais de uma ordem de grandeza: em escala log a curva vira reta e o vão entre elas fica igual (`v4`, de 12 a 230 oportunidades).
- A fórmula da fronteira está acordada e cabe numa nota do cartão.

## Quando evitar

- O corte é um limiar independente em cada eixo: matriz 2x2 de quadrantes ([modelo 01](../01_matriz-2x2-de-quadrantes/)).
- A fronteira não tem fórmula acordada: curva desenhada a olho inventa regra; volte ao modelo 01 com corte declarado.
- Impacto e esforço pontuados sem critério definido antes da pontuação: o plano dá precisão de régua a um palpite.
- A pergunta é a relação entre as duas medidas: dispersão com tendência ou identidade (`09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia`).
- Centenas de itens, em que a leitura por curva se perde na nuvem: densidade 2D (`09_dispersao-e-bolhas/09_densidade-2d`).

## Anatomia

1. Pontos em `ScatterChart` com `ZAxis` de tamanho fixo (ARMADILHAS, REC-15 e REC-31): `--chart-1` para quem responde à pergunta (razão a partir do corte, vitórias na meta, acima da zona) e `--text-muted` para os demais. Quem cai numa zona de fronteira é ponto oco com contorno `--text-muted`, forma própria para a cor não ser o único canal (`v3` e `v4`).
2. Iso-linha de razão (`v1`) e reta de vitórias em escala log (`v4`): `ReferenceLine` com `segment` e `ifOverflow="extendDomain"`, com os dois extremos calculados por uma função pura (`clipRatioLine`, `clipHyperbola`) e postos dentro do domínio, porque a reta cuja ponta passa da borda é descartada inteira (REC-1).
3. Hipérbole em escala linear (`v2` e `v3`): `path` próprio numa camada filha do gráfico, que lê `useXAxisScale` e `useYAxisScale`. A amostragem tem 48 trechos em passo geométrico no X, cada X o anterior vezes a mesma razão, para a curva não quebrar onde despenca, junto do eixo Y.
4. Hierarquia de traço em três degraus: grade em `--line-subtle`; iso-linha de fundo em `--line-strong` de 1 px, que a ACE-6 trata como referência; divisória de região, curva da meta e curva com faixa em `--text-muted` de 1,5 px, sólida quando o número é registrado.
5. Região e faixa: a região acima da meta em `--chart-1` a 10% (`v2`) e a faixa de tolerância ou zona de fronteira em `--text-muted` a 18% (`v3` e `v4`), sempre como espaço entre duas curvas da mesma fórmula, fechado pela borda do plano e nunca por diagonal (GEO-9). A guarda `OPACIDADE-MARCA` é escapada com motivo em cada linha.
6. Ordem de pintura: filho sem `zIndex` é pintado depois da grade e antes de tudo o mais, então região, faixa e curva próprias ficam atrás; `ReferenceLine` fica em 400 e `Scatter` em 600. Os rótulos de ponto vão num `ZIndexLayer` em 450, para o halo cortar linha e nunca ponto (ROT-7, GEO-4).
7. Valor na ponta de cada linha, na margem reservada e nunca pelo `label` nativo (REC-4): `3x`, `20 vitórias`, `R$ 20 mil` por `formatCurrencyAxis`. A meta leva a palavra meta logo abaixo do valor.
8. Rótulo direto só em quem responde à pergunta, com posição calculada fora do `LabelList`: a ordem das tentativas começa pelos lugares que a linha não atravessa, e o nome sem lugar livre ainda é desenhado. Os demais têm o nome na dica.
9. Eixos numéricos com domínio e `ticks` fixos, grade nos dois sentidos (EIX-3b), `axisLine` desligado depois do spread do `AXIS_PROPS` e a unidade no tique: `formatPercent`, `formatCurrencyAxis`, `formatInt`. Em escala log os tiques são escritos à mão (`v4`).
10. Dica própria com `ChartTooltip`, acrescentando o que o corpo não escreve: as duas notas e a região (`v1`), o par taxa e volume por `formatRateWithVolume` e o produto (`v2` e `v4`), o custo por lead e o investimento (`v3`).
11. Linha de leitura calculada do dado no topo, que diz qual leitura é a oficial, e rodapé com a fórmula da curva ou a nota da escala, o `n` no plano e o `n` fora dele. Ausência nunca vira ponto no zero (DAD-2), e zero medido que a escala log não desenha ganha faixa própria, com o tique `0%` (`v4`).
12. Estado vazio com `role="status"` e o ícone `Filter` quando nenhuma entidade tem as duas medidas.

## Versões

- `v1_automacoes-por-impacto-e-esforco`: 14 automações com notas de impacto e de esforço de 1 a 5. Demonstra as iso-linhas de 3x, 2x, 1x e 0,5x com `ReferenceLine segment` cortada na borda, a razão escrita na ponta de cada uma em traço de fundo, as divisórias da matriz clássica um degrau acima, o contorno tracejado e a linha que declara as notas como avaliação do time, e o deslocamento determinístico dos itens de mesmas notas ao longo da própria reta, avisado no rodapé.
- `v2_vitorias-por-volume-e-taxa-com-meta`: 14 executivos por oportunidades e taxa de ganho, com meta de 12 vitórias. Demonstra as hipérboles de 5, 10 e 20 vitórias em `path` com `useXAxisScale`, o passo geométrico na amostragem, a curva da meta em traço médio com a região acima em tom baixo, a dica com o produto calculado, a fórmula no rodapé e a anotação dos 4 que chegam à meta com até metade do volume médio.
- `v3_campanhas-em-curvas-de-investimento`: 51 campanhas, 48 no plano, por leads e custo por lead. Demonstra as curvas de R$ 5 mil, R$ 20 mil e R$ 50 mil recortadas ao domínio, os 48 pontos neutros com nome só nos dois extremos de cada curva, a faixa de 10% em torno de R$ 20 mil com os itens de dentro em ponto oco, a legenda que diz o que é cada ponto e a unidade de cada eixo, e as 3 campanhas sem lead fora do plano, contadas no rodapé.
- `v4_escala-log-com-executivos-sem-vitoria`: 14 executivos de carteiras muito diferentes, em escala log nos dois eixos. Demonstra as curvas de 3, 6, 12 e 24 vitórias como retas paralelas, os 3 executivos sem vitória numa faixa de taxa zero abaixo do plano, os tiques log declarados à mão, a nota que explica por que as curvas viraram retas e a zona de uma vitória em torno da meta, com quem está nela em ponto oco.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/<Nome>/`, e troque o `import` do `./data` pelo dado real, já agregado por entidade. Razão, taxa e custo por lead saem das duas medidas dentro do componente: não mande a medida derivada pronta.
2. Ajuste `DOMAIN_X`, `DOMAIN_Y` e os `ticks` do topo do arquivo à faixa real das duas medidas. O domínio é fixo de propósito: as linhas são recortadas contra essas constantes, e se um ponto passar delas o Recharts estica o eixo e a linha para antes da borda.
3. A regra vem do negócio, não do componente: `priorityRatio` (`v1`), `winsGoal` (`v2` e `v4`), `frontierWins` (`v4`), `bandInvestment` e `bandTolerance` (`v3`) são props com valor padrão no `data.ts`. As linhas de fundo são constantes (`ISO_RATIOS`, `ISO_WINS`, `ISO_INVESTMENTS`).
4. As camadas próprias só funcionam dentro do `ScatterChart`, porque dependem de `usePlotArea` e das escalas. Mantenha a ordem dos filhos: camada de curva, linhas de referência, `Scatter`, camada de texto.
5. Na `v1` o ponto é passado ao `Scatter` como elemento (`shape={<DodgedDot />}`), não como função: é o que deixa o componente ler a escala para afastar os itens de mesmas notas. Trocar por função quebra a regra dos hooks.
6. Na `v4` a faixa de taxa zero vive entre o plano e os tiques do eixo X, e a conta é `X_TICK_MARGIN = STRIP_GAP + STRIP_HEIGHT`; mudou uma, mude a outra. Em escala log o domínio nunca inclui zero.
7. Coloque o componente no corpo de um `VisualCard` com altura definida no pai ou passe `height`; o canvas de cada versão está no `meta.json` com a conta. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): `segment` com par de coordenadas, o mecanismo das iso-linhas retas, e o limite dele, que só desenha reta e obriga o `path` próprio na curva.
- [Recharts, useXAxisScale](https://recharts.github.io/en-US/api/useXAxisScale/): a função de dado para pixel, que dispensa refazer a conta do domínio ao desenhar a hipérbole, e que extrapola fora do domínio, o que dá o pixel da origem na `v1`.
- Pacote instalado, `recharts/es6/zIndex/DefaultZIndexes.js`: grade em −100, filho sem `zIndex` em 0, `ReferenceLine` em 400, eixo em 500 e `Scatter` em 600; é o que decide onde cada camada deste modelo é pintada.
- Pacote instalado, `recharts/es6/util/ActiveShapeUtils.js`: a forma do `Scatter` passada como elemento é clonada e vira componente; passada como função, é só chamada.
- [Learn Lean Sigma, Impact Effort Matrix](https://www.learnleansigma.com/guides/impact-effort-matrix/): a exigência de definir critérios de impacto e de esforço antes de pontuar.
- [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): a defesa de zonas que reflitam a regra do negócio, que aqui ganha forma de curva.
- Estudo da família: `_estudo/familias/25_matriz-e-quadrantes.md`, de onde saem a fronteira como zona e a procedência escrita em toda linha de corte.
- Nenhum pedido de formatador ou de dependência fora da lista da seção 6 do contrato: o recorte das retas, a amostragem das hipérboles e o desconflito de rótulos são implementação local em cada `Chart.tsx`.

## Notas do produtor (não bloqueantes)

_Leva de 2026-10-06, as quatro versões. São decisões e tensões declaradas, não defeitos escondidos; quem revisa decide._

- As quatro: `--text-muted` faz dois papéis no mesmo visual, o de neutro dos pontos e o de traço médio (divisória, curva da meta, curva com faixa), e a 17.2 pede um papel por token. É a mesma tensão que a revisão do modelo 01 registrou: o papel de referência da 17.2 é `--text-muted`, e `--line-strong`, a outra saída, já é a iso-linha de fundo aqui. Ponto e traço não se confundem pela forma.
- As quatro: só quem responde à pergunta tem o nome no desenho; os demais pontos têm o nome na dica. Na `v1` são 4 de 14, na `v2` 8 de 14, na `v3` 6 de 48 e na `v4` 7 de 11, mais os 3 da faixa de taxa zero.
- `v2`, `v3` e `v4`: os três comentários `check-ok: OPACIDADE-MARCA` estão escritos na linha de cima da região, da faixa e da zona, com o motivo, e o `check` não conta nenhum como em uso, porque a opacidade vem de constante nomeada (`GOAL_TINT`, `BAND_TINT`, `ZONE_TINT`) e o leitor da guarda não resolve constante. O comentário fica para o dia em que resolver.
- `v2`, `v3` e `v4`: `ESPESSURA-MARCA` e `CONTRASTE-MARCA` saem `preview_com_transform`, como em toda dispersão do acervo; os contrastes de marca foram tirados da tabela de tokens e estão na nota de cada `meta.json`. Na `v1` a `CONTRASTE-MARCA` mede, porque o ponto é desenhado sem `transform`.
- `v1`: os nomes das quatro regiões ficam fora do plano, acima e abaixo da região de cada um, e não nos cantos internos como no modelo 01. As retas se abrem a partir do canto de baixo à esquerda e a de razão 1 sai pelo canto de cima à direita, então nenhum canto interno fica livre de reta.
- `v1`: as divisórias ficam em 3,5, entre as notas 3 e 4, para nenhuma nota inteira cair em cima delas; o valor não vai escrito, lê-se pela posição no eixo. Dois dos quatro itens da frente da fila caem em Preenchimento na matriz clássica, e é por isso que a linha de leitura diz qual leitura é a oficial.
- `v2`: a anotação tem duas linhas e 64 caracteres, acima dos 50 da ANO-2, porque traz a contagem, a regra e o valor do volume médio; e vai em `--text-secondary`, não em `--text-muted`, porque fica sobre a região tingida a 10%, onde `--text-muted` cairia abaixo de 4,5:1.
- `v2`: na fila de rótulos do topo só o último leva a unidade (`5`, `10`, `20 vitórias`), como numa fila de tiques; as três pontas ficam a menos de 60 px uma da outra e a unidade repetida não cabe.
- `v3`: o catálogo pede pontos neutros e itens de dentro da faixa em cinza. Os 48 são `--text-muted`, e quem está na faixa é ponto oco, a convenção de fronteira como zona do modelo 01. O caso de uso passou a dizer "48 campanhas com lead", porque o dado tem 51 e as 3 sem lead ficam fora do plano.
- `v4`: "a uma vitória da meta" foi lido como zona dos dois lados, de 11 a 13, e quem fez exatamente 12 ou 13 também sai em ponto oco. A leitura de um lado só, 11 apenas, é uma troca de uma linha em `statusOf`. A zona tem cerca de 8 px de altura na escala log: quem a carrega são os pontos ocos e o rótulo `meta ± 1` na margem.
- `v4`: as retas de fundo são 3, 6 e 24 vitórias, escolha do produtor, porque o catálogo não fixa valores nesta versão; com a meta de 12 a série dobra a cada reta e o vão igual entre elas é a própria lição da escala log.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v1`, `v2` e `v4` aprovadas, `v3` reprovada, com o parecer em `validation/revisao_25_matriz-e-quadrantes__03_plano-com-iso-linhas_2026-10-06.md`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3` e `v4`: as iso-linhas de fundo vão em `--line-strong` de 1 px, que mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão. Foram aceitas como referência com o valor escrito na ponta (ACE-6), que é como o catálogo as define; o traço de referência da 17.2 é `--text-muted`.
- `v2`, `v3` e `v4`: a guarda OPACIDADE-MARCA conta as três como medidas e não mede a região, a faixa nem a zona, porque a opacidade vem de constante nomeada. Medido no PNG contra o cartão: região da `v2` 1,22:1 no escuro e 1,16:1 no claro; faixa da `v3` e zona da `v4` 1,31:1 e 1,27:1. Aceitas como fundo de região, com a fronteira na curva ou na reta opaca em `--text-muted`.
- `v2`, `v3` e `v4`: o nome posto a oeste do ponto é ancorado no início de uma caixa estimada em 6,2 px por caractere, e a tinta mede de 4,9 a 5,6 px. O texto termina de 10 a 21 px antes do fim da caixa, que é onde o ponto está, e o vão cresce com o tamanho do nome. Na `v3` isso reprova; na `v2` e na `v4` fica nos dois itens de nome abaixo.
- `v1`: a reta de 2x, que é o corte da fila oficial, tem o mesmo traço de fundo das outras três, e as divisórias, que só nomeiam regiões, têm o traço mais forte. Segue o catálogo; quem carrega o corte é a cor do ponto e a razão escrita ao lado do nome.
- `v1`: o `notes` do `meta.json` diz que as guardas de contraste de marca não medem a peça, e a CONTRASTE-MARCA mede a `v1` (1 de 4 no `check`), porque o ponto é desenhado sem `transform`.
- `v2`: o nome `Otávio L.` fica abaixo e à esquerda do ponto, fora da região tingida, a 11,4 px dele e a 19,1 px do ponto cinza de Bruno T.; o ponto de Otávio L. está a 8,3 px do fim de `Renan A.`. O dono se lê por eliminação, porque são 8 pontos na meta e 8 nomes.
- `v2`: na fila do topo, `5` e `10` vão sem unidade e só o último leva `vitórias` (NUM-6). Lê-se como fila de tiques; a unidade inteira não cabe em três pontas a menos de 60 px uma da outra.
- `v2`: a anotação tem 64 caracteres em duas linhas e vai em `--text-secondary`, acima dos 50 caracteres e fora do `--text-muted` da ANO-2. Sem corte nem colisão nos dois temas.
- `v2`: o halo na cor do cartão aparece como contorno em volta dos nomes e da anotação que ficam sobre a região tingida, nos dois temas. É a pendência aberta da ROT-7, que não tem token para a superfície de baixo.
- `v3`: `Mala direta para associações` atravessa a faixa e a curva de R$ 20 mil, e o halo apaga cerca de 12 px da curva junto do topo do plano. A ROT-7 manda halo sobre linha de referência; a curva da faixa entre os obstáculos do `placeLabels` evitaria o cruzamento.
- `v3`: `E-mail, boletim mensal` fica deitado em cima da curva de R$ 5 mil, e o halo apaga a curva em toda a largura do nome, 116,5 px.
- `v3`: nada no corpo diz que só os dois extremos de cada curva levam nome; a legenda explica o ponto cheio e o oco, e não o critério do nome.
- `v4`: `Helena B.` fica a 3,5 px do ponto de Renan A., que está logo acima do nome, e a 4,5 px do próprio. Distingue-se pelo peso e pela cor do nome, que seguem o ponto oco.
- `v4`: `Fábio J.` fica a 10,5 px do próprio ponto, abaixo e à esquerda, em cima da linha de grade de 30%. O ponto seguinte está a 28,4 px, então a leitura não se perde.
- `v4`: os nomes da faixa de taxa zero cruzam as linhas verticais da faixa sem halo (`Ana Carolina M.` em 50 e `Ícaro M.` em 100). A linha é `--line-subtle` e o nome mede 9,36:1 no escuro e 7,04:1 no claro sobre a faixa.
- `v4`: a fórmula vitórias = oportunidades × taxa de ganho só aparece na dica. A nota do rodapé diz que as curvas viram reta na escala log e não escreve a conta.

Segunda passada de 2026-10-06, só a `v3`, julgada pelo `Chart.tsx` corrigido depois do parecer acima: aprovada. O bloqueante da primeira passada saiu: os seis nomes ficam de 1,7 a 4,5 px da borda do próprio ponto e o ponto alheio mais perto fica a 10,7 px ou mais, nos dois temas. A linha acima que diz que a âncora a oeste reprova a `v3` descreve o arquivo anterior. Nenhum item abaixo reprova.

- `v3`: `E-mail, boletim mensal` continua deitado sobre a curva de R$ 5 mil, agora colado ao próprio ponto. A curva fica sem tinta de 608,5 px até o ponto, cerca de 120 px dos 711 px de largura dela, com resíduos entre as palavras; segue identificada pelo trecho à esquerda e pelo valor na ponta. O candidato acima à esquerda tira o nome de cima da curva e hoje perde para o do meio na ordem do `placeLabels`.
- `v3`: `Mala direta para associações` continua a atravessar a faixa e a curva de R$ 20 mil, e o halo apaga de 6 a 9 px da curva junto do topo do plano. Com 153 px de nome e o ponto em 45 leads, toda posição a leste cruza a curva.
- `v3`: a legenda continua sem dizer que só os dois extremos de cada curva levam nome.
- `v3`: o `ZAxis` não tem `dataKey`, então o `Z_RANGE` não chega ao ponto cheio, que sai com 4,51 px de raio, o tamanho padrão do símbolo, e não com os 4 px do `POINT_RADIUS`; o ponto oco mede 4,75 px por fora. Sem diferença visível entre os dois.
- `v3`: sem candidato que passe no `ownIsNearest`, o `placeLabels` volta ao primeiro lugar livre e aceita nome mais perto de ponto alheio, sem linha de chamada. O dado padrão não exercita esse ramo.
- `v3`: a frase acessível e o rodapé escrevem `campanhas sem lead` e `ficam fora` no plural fixo; num recorte com uma só saem `1 campanhas` e `1 sem lead ficam fora`.
- `v3`: o nome de cada eixo aparece duas vezes, na legenda e no título do eixo; o título vertical acrescenta a fórmula e o horizontal só repete.
- `v3`: restam números de acabamento soltos no JSX (10, 6, 4 e 14 px nas âncoras de texto da margem, 1 e 1,5 px de traço), fora das constantes do topo.
