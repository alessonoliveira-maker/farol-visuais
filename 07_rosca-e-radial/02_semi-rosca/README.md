# Semi rosca

## O que é

Uma rosca de 180 graus: o arco cobre só a metade de cima do círculo, com o centro do total sentado sobre a base, onde a meia volta terminaria se fosse inteira. A forma cabe numa faixa baixa e larga, onde a rosca cheia da família 07/01 sobraria altura vazia. Serve a dois usos: composição de poucas partes num só arco, ou progresso empilhado de duas ou três séries contra uma meta, como o radial empilhado do shadcn. A meia volta dobra a distorção do ângulo perto das duas pontas (o mesmo valor ocupa o dobro do arco de uma rosca cheia equivalente), por isso todo modelo aqui escreve o total e a participação em número, nunca só o comprimento do arco.

## Quando usar

- Composição de 2 a 4 partes numa faixa de resumo baixa e larga, com o total escrito sobre a base.
- Progresso empilhado de 2 ou 3 séries contra uma meta, com o total e a meta escritos no centro.
- Uma faixa de KPIs em que três ou quatro semicírculos do mesmo diâmetro comparam filas, canais ou etapas lado a lado.

## Quando evitar

- Visual que precisa de agulha, escala e faixas qualitativas: isso é gauge (13), não semi rosca.
- Uma parte acima de 90% do total: o arco vira um bloco quase inteiro e a leitura passa a depender só do número; nesse caso, progresso circular (13/03).
- Cartão com altura sobrando: a rosca cheia (07/01) lê melhor e ainda sobra espaço para o centro.
- Mais de 4 partes coloridas: barra 100% horizontal (03) lê com mais precisão.

## Anatomia

1. Arco em `Pie` com `startAngle={180}` e `endAngle={0}` (ou `RadialBarChart` com `startAngle={0}` e `endAngle={180}` no progresso empilhado), sempre varrendo por cima do centro, nunca por baixo.
2. `innerRadius` em 70% do `outerRadius`, com `cy` deslocado para perto da base do corpo (entre 82% e 90% da altura), porque `getMaxRadius` do Recharts usa a menor dimensão do corpo e a metade de baixo do círculo nunca é desenhada.
3. Total (ou "valor de X") escrito sobre a base, dentro do miolo, por `Label` com `content` e dois `tspan`, nunca repetido no título do `VisualCard`.
4. Participação de cada categoria escrita na ponta do próprio arco: nome, contagem por `formatInt` e percentual inteiro por `formatPercent`, com o ângulo calculado a partir de `midAngle` (seção 17.4, ROT-2).
5. Percentual inteiro somando sempre 100, pelo maior resto (NUM-2), nunca pelo arredondamento simples de cada fatia.
6. Cor por slot fixo na ordem da COR-8 (1, 3, 6...), com separador de 2 px em `--surface-raised` entre fatias vizinhas (COR-5).
7. Referência opcional (marca de 50%, meta) como traço tracejado em `--text-muted`, com halo obrigatório (ROT-7) em qualquer rótulo que possa cair perto dela.
8. Trilho sem faixas verde, amarela e vermelha: a forma não é um gauge e não deve parecer um.

## Versões

- `v1_agendas-do-mes-por-resultado`: 132 agendas de pré-vendas do mês por resultado (realizada, remarcada, não compareceu). Demonstra o arco de 180 graus com o total sobre a base, rótulo de nome, contagem e percentual em cada ponta do arco, e o percentual inteiro somando 100 pelo maior resto.
- `v2_agendas-por-canal-com-marca-de-metade`: agendas da semana por canal, inbound contra outbound. Demonstra o tique fixo de 50% no topo do arco, a linha de leitura calculada do dado, os dois canais em slots categóricos 1 e 3, e o halo obrigatório no rótulo que pode cruzar o tique.
- `v3_resultado-das-agendas-por-fila`: três semicírculos de mesmo diâmetro numa grade HTML, um por fila (inbound, outbound, reativação), com legenda única acima da faixa e o total no centro de cada arco. Demonstra a fila de poucas agendas trocando a contagem por taxa com volume (`formatRateWithVolume`) e o percentual inteiro de cada fila somando 100 pelo maior resto (NUM-2), calculado fila a fila.
- `v4_agendas-acima-da-meta-semanal`: `RadialBarChart` empilhado com inbound e outbound no mesmo `stackId`, contra uma meta semanal de 90. Demonstra o domínio do `PolarAngleAxis` no maior valor entre a soma e a meta (nunca fixo na meta, porque isso faria dois canais de tamanho diferente ocuparem o mesmo meio arco), a meta marcada por um traço de referência sobre o próprio arco, a soma que passa da meta enchendo o arco sem estourar os 180 graus, o centro "104 de 90" e o selo do excedente, com `cornerRadius` só na ponta final do arco.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página (seção 16 do CONTRATO).
2. Troque o `import` do `./data` pelo seletor real da página; em `v2` e `v4`, mantenha os nomes exportados (`data`, `meta`) ou ajuste as props na chamada do componente.
3. Confirme a altura do corpo antes de colar: com `cy` entre 82% e 90%, o arco só usa a metade de cima do corpo, então uma faixa baixa (140 a 200 px) já é suficiente; não force uma altura de rosca cheia.
4. Em `v2`, o tique de 50% lê `useChartWidth` e `useChartHeight` do próprio Recharts: se o componente for embrulhado num container que não seja o `ResponsiveContainer` direto, confirme que esses hooks continuam respondendo o tamanho do corpo, não o da página inteira.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Catálogo: [shadcn, chart-radial-stacked (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-stacked.tsx).
- Catálogo: [Recharts, Straight Angle Pie Chart](https://recharts.github.io/en-US/examples/StraightAnglePieChart/).
- Catálogo: [Highcharts, semi circle donut](https://www.highcharts.com/demo/highcharts/pie-semi-circle).
- Portal de design: [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29).
- Farol: `_estudo/familias/07_rosca-e-radial.md`, seção "5. Semi rosca".

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18._

- `v1` e `v2`: a cor sai de `SLOT_COLORS[index]`, isto é, da posição no array, e não do `id` da categoria. O dado fixo está na ordem certa, então o desenho está correto; ao colar numa página que ordene ou filtre, o mapa por `id` da `v3` (`colorFor`) é o que a COR-3 pede.
- `v1` e `v4`: o número do centro sai em 20 px, acima dos 14 px que a tabela 17.1 reserva ao centro de rosca. Lê bem nos dois temas; fica registrado como desvio consciente de escala.
- `v2`: o tique de 50% aparece só como um traço acima da banda e um ponto solto dentro do miolo, porque o trecho que cruza o arco fica por baixo do `Pie`. A leitura continua clara pelo rótulo "50%", mas o ponto solto abaixo da banda é ruído.
- `v2`: o `HalfTick` calcula raio e `cy` sem descontar a margem de 5 px do `PieChart`, então nasce cerca de 6 px acima da banda em vez de encostar nela.
- `v2`: o percentual sai de arredondamento simples, não do maior resto que a Anatomia deste README declara. Com duas partes os dois métodos coincidem, então o resultado impresso está certo.
- `v3` e `v4`: a amostra da legenda é um círculo; a ROT-4 pede a amostra na forma da marca, que aqui é o gomo do arco.
- `v3`: as três filas imprimem o não comparecimento em formatos diferentes (`7 (12%)`, `14 (18%)` e `18,2% (2 de 11)`), o que atrapalha exatamente a comparação que o caso de uso pede.
- `v4`: o arco varre da direita para a esquerda (`startAngle` 0, `endAngle` 180), ao contrário das `v1` a `v3`. Dentro do mesmo modelo o progresso muda de sentido de uma versão para a outra.
- `v4`: o `MetaTick` entra na árvore antes dos dois `RadialBar`, então o arco pinta por cima do traço: da linha desenhada entre os raios 113 e 72 sobra só o pedaço de 12 px que fica fora do arco, medido no `preview.svg`. É o mesmo efeito já anotado na `v2`, aqui na marca que dá nome à versão.
- `v4`: o `MetaTick` também calcula o raio sem descontar a margem de 5 px do `RadialBarChart`, então nasce em 109 px de raio contra os 101 px do arco de verdade.
- `v4`: o `cornerRadius` está só no último `RadialBar`, como a Anatomia manda, mas o Recharts arredonda as duas pontas daquele gomo, então a emenda entre os canais aparece arredondada no PNG. Sem forma própria (`shape`), a biblioteca não separa uma ponta da outra.
- `v4`: o trilho do `background` usava `--surface-overlay`, que no tema claro é o mesmo branco do cartão. Com o dado fixo o arco fica cheio e o trilho nunca aparece; ele só entrava em cena quando a soma ficava abaixo da meta, e aí sumia no claro. Corrigido em 2026-09-29: o `background` do `RadialBar` passou a `--surface-sunken`.
- `v4`: o `demonstrates` do `meta.json` diz "Label do PolarRadiusAxis", mas o centro é o componente `CenterLabel` com `useChartWidth` e `useChartHeight`; o texto descreve outra peça.
- `v3`: a frase acessível abre com "Três semicírculos" em palavra fixa e logo adiante interpola `data.length`; com outro número de filas as duas metades da frase se contradizem.
- Catálogo: a entrada da `v4` pede que a soma acima da meta encha o arco sem passar dos 180 graus. Dá para atender isso sem perder a proporção entre os dois canais, com o domínio em `max(total, meta)` e a meta marcada como referência sobre o arco. A revisão seguiu o que está escrito no catálogo e registra aqui a alternativa.

_Revisão de 2026-10-14 (`v4`, código atual; os bloqueantes estão em `validation/revisao_07_rosca-e-radial__02_semi-rosca_2026-10-14.md`)._

- `v4`: a legenda lista Inbound antes de Outbound, mas o arco varre da direita para a esquerda e põe o outbound à esquerda e o inbound à direita; a ROT-4 pede a legenda na ordem visual das marcas.
- `v4`: a identificação dos dois canais vai numa legenda abaixo do corpo, e o rótulo direto nas pontas do arco cabe, como mostra a `v1`; a ROT-4 guarda a legenda para quando o rótulo direto não cabe.
- `v4`: "Inbound 45", "Outbound 59", "meta 90" e "+14 acima da meta" saem sem o substantivo; a unidade só aparece no centro ("agendas na semana"). "+14 agendas acima da meta" fecha a NUM-6 no selo, que é o número que responde o caso de uso.
- `v4`: o arco desenhado tem 101 px de raio num corpo de 574 por 218 px e os 86 px de cima do corpo ficam vazios, porque o raio sai de `min(largura, altura) / 2` e a metade de baixo nunca é desenhada; um `outerRadius` calculado da altura útil acima de `cy` usaria a faixa inteira.
- `v4`: a banda vai de 74 a 101 px de raio no `preview.svg`, porque o `barCategoryGap` padrão de 10% do `RadialBar` come as duas bordas; a razão real é 73%, não os 68% de `INNER_FRACTION` nem os 70% da Anatomia.
- `v4`: `useDonutCenter` diz repetir a fórmula do `RadialBarChart`, mas põe o centro em y 183,88 contra os 187,48 do `preview.svg` (o Recharts aplica o `cy` percentual sobre a altura inteira); o `MetaTick` acerta esse `cy` e erra o raio. Os dois cálculos do mesmo centro discordam entre si; no texto do centro não há consequência visível.
- `v4`: `CHART_MARGIN` é declarada e não é passada ao `RadialBarChart`; a margem vale 5 px por coincidência com o padrão da biblioteca (ESP-3 pede margem explícita).
- `v4`: os deslocamentos do `MetaTick` (+4, −2, +16) e do `CenterLabel` (−22, −6) ficam soltos no corpo das funções, e não como constantes nomeadas no topo (seção 5).
- `v4`: seguem valendo no arquivo atual as observações de 2026-09-18 sobre o sentido da varredura, a emenda arredondada entre os gomos, o centro em 20 px, a amostra circular da legenda e o "Label do PolarRadiusAxis" do `meta.json`.

_Revisão de 2026-10-14, segunda passada (`v4`, código corrigido, aprovada; os dois bloqueantes da manhã estão resolvidos)._

- `v4`: o traço da meta é sólido, de 2 px, em `--text-primary`, com halo de 5 px em `--surface-raised`; a tabela 17.2 dá à referência `--text-muted` em traço de 1 px tracejado `3 3`, e o item 7 da Anatomia deste README diz o mesmo. O halo da saída da TOK-10 também resolve o contraste com o token de referência, e a `v2` desenha a sua marca de metade de outro jeito: dentro do modelo a referência tem dois desenhos.
- `v4`: o `shape` próprio (`makeTipShape`) agora existe, mas repassa o `cornerRadius` ao `Sector`, que arredonda as duas pontas do gomo de outbound. A emenda com o inbound continua arredondada e, nos cantos de 6 px da emenda e da base esquerda, aparece o trilho `--surface-sunken` (mancha escura no tema escuro, cinza clara no claro). Com o `shape` já é possível arredondar só a ponta final, que é o que o `demonstrates` promete.
- `v4`: com a meta agora visível sobre o arco, o sentido da varredura (da direita para a esquerda) decide onde o excedente se lê: as 14 agendas acima da meta são o trecho à esquerda do traço, e lido da esquerda para a direita, como nas `v1` a `v3`, o mesmo traço pareceria marcar 13% do arco. O número escrito ("104 de 90", "+14 acima da meta") desfaz a dúvida e o sentido vem do catálogo e da Anatomia (`startAngle` 0, `endAngle` 180), por isso fica como observação, agora de peso maior que a de 2026-09-18.
- `v4`: o rótulo "meta 90" está em `font-display` sem `fontWeight`, isto é, Space Grotesk 400, peso que a seção 8 não carrega (TIP-4); o navegador cai no 500 e o render não mostra diferença. `fontWeight={500}` fecha a 17.1.
- `v4`: o `RadialBarChart` recebe `data` inteira, mas o centro, o selo, a legenda e o domínio leem só `data[0]`; com duas linhas o gráfico desenharia duas bandas concêntricas e os números de uma só. Passar `[row]` fecha o contrato da prop.
- `v4`: o `check` avisa AGREGACAO-ZERO em `Chart.tsx:98` (`domainMax > 0 ? … : 0`); ali o zero é limite de desenho e não chega a texto, como a própria guarda reconhece.
- `v4`: o `MetaTick` da manhã não existe mais; o traço lê `cx`, `cy` e os raios reais que o Recharts passa ao `shape`, então as observações da manhã sobre o raio do traço e os deslocamentos "+4, −2, +16" estão superadas. Seguem soltos no corpo das funções os deslocamentos novos (3 e 16 px, larguras 5 e 2, limiar 0,15 do `textAnchor`) e os do `CenterLabel` (−22, −6), que continua 3,6 px acima do `cy` real, sem consequência visível.
- `v4`: seguem valendo as observações anteriores sobre a ordem e a amostra da legenda, a legenda no lugar do rótulo direto, a unidade ausente em "Inbound 45", "Outbound 59", "meta 90" e "+14 acima da meta", o vazio de 86 px acima do arco, a razão real de 73% da banda, a `CHART_MARGIN` não passada, o centro em 20 px e o "Label do PolarRadiusAxis" do `meta.json`.
