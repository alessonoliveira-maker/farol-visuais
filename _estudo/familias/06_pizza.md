# Família 06: pizza

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10 (instalado 3.10.1), Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa, empresa ou plataforma real.

## O que a família responde

Pizza responde uma pergunta só: **que fração de um todo único cada parte representa**. Stephen Few
("Save the Pies for Dessert") reconhece a força da forma, a mensagem "parte do todo" vem embutida no
desenho, e a fraqueza: comparar fatias entre si, porque o olho julga mal ângulo e área. Nick Desbarats
(Nightingale) resume a divisão de trabalho: barra é mais precisa para comparar partes; pizza é mais precisa
para perceber frações. A leitura é boa perto de 25%, 50% e 75% (Few; Datawrapper), porque essas frações
caem nos quadrantes do relógio.

Perguntas típicas no Farol:

- **Comercial:** quanto da receita reconhecida do trimestre veio de cliente novo? Um motivo de perda domina
  os demais?
- **Pré-vendas:** que fração das agendas marcadas virou reunião realizada, remarcada ou não comparecimento?
- **Marketing:** como o investimento do mês se divide entre as três plataformas de mídia? Que parte dos
  leads chegou sem origem declarada?
- **Diretoria:** como o custo do trimestre se reparte nas três camadas (mídia, time, estrutura)?

Quando não usar:

- comparar partes de tamanho parecido ou ordenar partes com precisão: barra horizontal (02);
- comparar a composição de vários todos: barra 100% empilhada (02 ou 03). Few cita Tufte: "o único desenho
  pior que uma pizza é várias delas";
- participação que muda no tempo: linha (04) ou área (05);
- valores que não somam um todo, com negativo ou categorias sobrepostas. A SWD é direta: se as fatias não
  somam 100%, a pizza está errada;
- só dois valores: Datawrapper sugere escrever o número; se houver meta, progresso (13).

## Decisões transversais da família

1. **Todo verdadeiro.** Categorias exclusivas, soma igual ao total declarado, nenhum negativo (critérios de
   Desbarats e da SWD). O componente valida em TypeScript e, se a soma divergir do total além da tolerância de
   arredondamento, mostra estado de erro em vez de uma pizza errada.
2. **Teto de 5 fatias, alvo de 4.** O guia de cuidados do Datawrapper fala em quatro, o blog e o tutorial em
   cinco, e a ferramenta agrupa sozinha as menores acima de cinco; Desbarats aceita até seis ou sete. Acima do
   teto, as menores viram "Outros", sempre a última fatia, com a composição no tooltip.
3. **Ordem.** Decrescente, começando às 12 horas e girando no sentido horário; "Outros" e "Sem informação" ficam
   no fim, fora da ordenação. Few mostra que a mesma fatia de 25% fica ilegível quando a ordenação a tira do
   quadrante. Exceção: categoria com ordem natural (faixas de porte) mantém essa ordem.
4. **Convenção de ângulo do Recharts.** Zero grau fica às 3 horas e o ângulo cresce no sentido anti-horário,
   como mostra o exemplo oficial de semicírculo (`startAngle={180}` até `endAngle={0}` passando pelo topo).
   Para começar às 12 horas no sentido horário: `startAngle={90}` e `endAngle={-270}`. É o erro mais comum ao
   portar desenho do Figma.
5. **Rótulo direto, sem legenda.** SWD e Few mostram o custo de ir e voltar entre legenda e fatia. Rótulo com
   nome e percentual; valor absoluto no tooltip. Legenda só no modelo 10.
6. **Cor com intenção.** Um destaque em `var(--chart-1)` e o resto em neutros ou tons próximos (Datawrapper);
   cor por item no próprio dado (`{ name, value, fill: 'var(--chart-2)' }`), padrão dos componentes do shadcn.
   Nunca uma cor forte diferente por fatia só para diferenciar: a SWD mostra que fatia escura parece maior que
   fatia clara do mesmo tamanho.
7. **Separador no tema escuro.** `stroke="var(--surface-raised)"` com espessura 1 a 2, a cor do fundo do card.
   O `blendStroke` saiu no Recharts 3 (o guia de migração manda usar `stroke`). `paddingAngle` só com cuidado
   (ver modelo 1).
8. **Sem 3D, brilho, transparência, sombra ou gradiente.** Few mostra a mesma pizza parecendo três pizzas
   diferentes quando inclinada, e um brilho simulado que faz quatro fatias parecerem três.
9. **Dado ausente muda o denominador.** Registro sem categoria vira fatia "Sem informação" em
   `var(--line-strong)` com hachura; nunca some em silêncio. O rodapé declara cobertura ("292 de 340 leads com
   origem") e procedência com os tokens `--prov-medido`, `--prov-derivado`, `--prov-premissa`, `--prov-lacuna`.
10. **Estado ativo no Recharts 3.** A prop `activeIndex` foi removida (guia de migração). Hover e foco saem do
    `Tooltip` (`defaultIndex` deixa um item ativo ao abrir, como no exemplo TwoLevelPieChart); o desenho do
    setor ativo sai de `activeShape` (exemplo CustomActiveShapePieChart) ou de `shape` checando `isActive`
    (documentação da API do Pie). Seleção persistente por clique é estado React do componente pai.
11. **Acessibilidade.** `accessibilityLayer` passou a vir ligado por padrão no Recharts 3 (teclado percorre os
    setores). Mesmo assim, o card entrega a lista de valores como texto e nada depende só de cor.
12. **Celular.** A pizza encolhe até uns 120 px de diâmetro; rótulos externos viram lista abaixo. O Datawrapper
    sugere pizza em coluna estreita ou barra lateral, onde ela ocupa pouco.
13. **Formatação.** Percentual e valor pelos helpers do kit (`formatDecimal`, `formatCurrencyCompact`,
    `formatInt`); ausência por `formatUnavailable()`, que imprime "indisponível".

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Pizza simples | fração de 2 a 5 partes de um todo | partes de valor parecido que precisam ser ordenadas | começar às 3 horas e fatiar na ordem do banco |
| 2 | Pizza com rótulos externos | nomes longos ou fatias finas demais para rótulo interno | mais de 6 rótulos ou card estreito | linhas guia cruzadas e rótulos sobrepostos |
| 3 | Pizza com fatia em destaque | a mensagem é uma parte específica | todas as partes importam igual | deslocar todas as fatias; destaque que some em fatia fina |
| 4 | Pizza em semicírculo | composição em faixa baixa e larga | uma parte acima de 90% | total posto abaixo do centro e cortado pelo SVG |
| 5 | Pizzas em small multiples | a mesma composição de 2 a 4 todos, leitura aproximada | comparar a mesma parte entre todos com precisão | ordem e cor das categorias mudando entre pizzas |
| 6 | Pizza com detalhamento de "Outros" | cauda longa que precisa existir sem poluir | quando a cauda é a mensagem | "Outros" maior que a maior fatia |
| 7 | Pizza de fração única | uma parte contra o restante | fração abaixo de 5% ou acima de 95% | pintar parte e restante com duas cores fortes |
| 8 | Pizza de raio variável | ângulo com uma métrica e raio com outra, em peça exploratória | painel operacional | raio linear no valor, que infla a área ao quadrado |
| 9 | Pizzas proporcionais ao total | composição de todos com tamanhos muito diferentes | diferença de total pequena | raio proporcional ao total em vez da área |
| 10 | Pizza com legenda tabular | card estreito, nome longo, valor exato necessário | quando cabe rótulo direto | legenda em ordem diferente da ordem angular |

---

## 1. Pizza simples

**Descrição.** Círculo dividido em setores cujo ângulo é proporcional à fração. É a forma de referência da
família; os demais modelos são variações de rótulo, destaque, arranjo ou de codificação extra. A Data
Visualisation Catalogue a indica para noção rápida de distribuição e para comparar uma categoria contra o
todo, e registra que ela "não mostra mais que poucos valores".

**Anatomia.** Título com o todo e a unidade ("Receita reconhecida do 3º trimestre, R$ mil"); setores;
separador na cor do fundo; rótulo interno com percentual; total declarado no subtítulo; tooltip com valor
absoluto e fração; rodapé com cobertura e procedência.

**Abordagem na stack.** `recharts-nativo`: `PieChart` com um `Pie` (`dataKey="value"`, `nameKey="name"`,
`startAngle={90}`, `endAngle={-270}`, `stroke="var(--surface-raised)"`) e `Tooltip` com o conteúdo do kit.
O exemplo oficial "Pie Chart With Customized Label" põe o percentual no meio do setor com `midAngle` e
`RADIAN = Math.PI / 180`, `labelLine={false}` e `textAnchor` escolhido pelo lado do centro. Nos exemplos da
versão 3, `PieChart` recebe `responsive` e `style` com `aspectRatio: 1`, sem `ResponsiveContainer`.
Ordenação e agrupamento acontecem em TypeScript antes do `data`:

```ts
export type Slice = { name: string; value: number; fill?: string };

export function preparePie(rows: Slice[], max = 5, otherLabel = 'Outros'): Slice[] {
  const valid = rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  if (valid.length <= max) return valid;
  const head = valid.slice(0, max - 1);
  const tail = valid.slice(max - 1);
  return [...head, { name: otherLabel, value: tail.reduce((s, r) => s + r.value, 0) }];
}
```

**Ponto delicado.** O rótulo interno some em fatia fina: esconder abaixo de um limiar (18 graus, 5%) e deixar
o valor no tooltip. `minAngle` torna a fatia visível mas falsifica a proporção; usar só para "Sem informação" e
declarar. `paddingAngle` subtrai o mesmo ângulo de toda fatia e por isso encolhe proporcionalmente mais as
pequenas (o exemplo oficial com `paddingAngle={5}` e `cornerRadius` é estético). Fatia de valor zero não é
desenhada; se a categoria importa, citar no rodapé ("Evento: 0").

**Versões sugeridas.**
- **V1 básica: origem da receita reconhecida do trimestre.** Cliente novo 46%, expansão de cliente ativo 38%,
  renovação 16%; total de R$ 2.480 mil no subtítulo; percentual dentro das fatias.
- **V2 com anotação: resultado das agendas da semana.** Realizada 64%, remarcada 21%, não compareceu 15%; nota
  ao lado "não comparecimento subiu de 9% para 15% contra a semana anterior", sem seta sobre a fatia.
- **V3 densa do Farol: investimento de mídia do mês por plataforma.** Plataforma social A 52%, plataforma de
  busca B 35%, rede profissional C 13%; o tooltip traz R$ investido, leads e CPL, porque a pizza responde só
  "para onde foi o dinheiro".
- **V4 caso limite: origem dos leads com dado ausente.** Formulário do site 41%, mídia paga 33%, indicação 12%,
  "Sem informação" 14% com hachura e fora da ordenação; rodapé "292 de 340 leads com origem declarada" e selo
  de lacuna.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, pie chart](https://datavizcatalogue.com/methods/pie_chart.html): observar as funções listadas (comparação, parte do todo, proporção) e o limite de poucos valores.
- Catálogo: [Recharts, Pie Chart With Customized Label](https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/): observar o cálculo do rótulo por `midAngle` e a cor aplicada por `shape`, sem `Cell`.
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar o mesmo 25% legível antes e ilegível depois de ordenar, e a pizza rotulada que vira "tabela mal arranjada".
- Praticante: [Storytelling with Data, what is a pie chart](https://www.storytellingwithdata.com/blog/2020/5/14/what-is-a-pie-chart): observar ordenar decrescente, rotular direto e agrupar em "todos os outros".
- Portal de design: [Behance, Mobile Dashboard w/ Real Data, Dark theme UI](https://www.behance.net/gallery/51204899/Mobile-Dashboard-w-Real-Data-Dark-theme-UI): pizza animada em app escuro; observar o contraste do separador (a página traz só texto curto e tags).

**Mora melhor em outra família?** Se as partes precisam ser ordenadas com precisão, barra horizontal simples (02).

---

## 2. Pizza com rótulos externos

**Descrição.** Rótulos fora do círculo, ligados ao setor por linha guia. O Datawrapper recomenda rotular fora
as fatias pequenas e os nomes longos, e desliga a legenda de cores quando os rótulos são externos. É a
variação que deixa a pizza autoexplicativa sem legenda.

**Anatomia.** Setor; linha guia em dois segmentos (radial curto e horizontal); rótulo alinhado à esquerda no
lado direito e à direita no lado esquerdo; percentual em `--text-primary` e nome em `--text-secondary`; coluna
lateral reservada para os textos.

**Abordagem na stack.** `recharts-custom`: `label` recebe função com `cx`, `cy`, `midAngle`, `outerRadius`,
`percent` e `name`; `labelLine` recebe função que desenha o `path` em dois segmentos. A Vega-Lite resolve com
camada de texto em raio maior que o do arco (raio 90 contra `outerRadius` 80), e a mesma ideia vale aqui. A
anticolisão é TypeScript próprio, rodado antes de renderizar, porque o Recharts não empurra rótulos:

```ts
type LabelPos = { index: number; side: 'left' | 'right'; y: number };

export function spreadLabels(pos: LabelPos[], minGap: number, top: number, bottom: number): LabelPos[] {
  for (const side of ['left', 'right'] as const) {
    const col = pos.filter((p) => p.side === side).sort((a, b) => a.y - b.y);
    for (let i = 1; i < col.length; i++) col[i].y = Math.max(col[i].y, col[i - 1].y + minGap);
    const overflow = col.length ? col[col.length - 1].y - bottom : 0;
    if (overflow > 0) for (const p of col) p.y = Math.max(top, p.y - overflow);
  }
  return pos;
}
```

**Ponto delicado.** Os rótulos consomem largura: o `outerRadius` sai do espaço que sobra depois da coluna de
texto, e não o contrário. Duas fatias finas vizinhas colidem sempre; começando às 12 horas em ordem
decrescente, as menores ficam no fim do giro (perto das 11 horas), onde há mais espaço vertical. Abaixo de
360 px de largura, trocar os rótulos por lista.

**Versões sugeridas.**
- **V1 básica: motivos de perda do trimestre.** Cinco fatias com nomes longos ("sem orçamento no ciclo", "optou
  por solução interna", "sem retorno após proposta"), rótulo externo com nome e percentual.
- **V2 com destaque: o motivo que cresceu.** Mesma pizza com "sem retorno após proposta" em `--chart-1` e as
  demais em neutro; só o rótulo destacado em `--text-primary`.
- **V3 densa do Farol: custo do trimestre em três camadas.** Total de R$ 1.930 mil no subtítulo; mídia 44%, time
  41%, ferramentas e estrutura 15%; rótulo externo com percentual e R$ mil, porque a diretoria lê o número.
- **V4 caso limite: fatias de 2% e 3% vizinhas.** A anticolisão empurra os rótulos e a linha guia dobra; abaixo
  de 360 px a pizza fica sem rótulo e a lista ordenada aparece embaixo.

**Referências.**
- Catálogo: [Datawrapper Academy, customizing your pie chart](https://www.datawrapper.de/academy/customizing-your-pie-chart): observar rótulo interno e externo ligáveis em separado e a legenda que some com rótulo externo.
- Catálogo: [Vega-Lite, Pie Chart with Labels](https://vega.github.io/vega-lite/examples/layer_arc_label.html): observar a camada de texto em raio maior e o `stack: true` no theta para seguir o empilhamento.
- Catálogo: [AG Charts, donut series](https://www.ag-grid.com/charts/react/donut-series/): observar a distinção entre `calloutLabel` (externo com linha guia, para layout cheio) e `sectorLabel` (interno).
- Praticante: [Datawrapper blog, pie charts](https://www.datawrapper.de/blog/pie-charts): observar "rotule fora as fatias menores" e o agrupamento em "outros".
- Portal de design: [Dribbble, Pie Chart Infographic](https://dribbble.com/shots/11927332-Pie-Chart-Infographic) (não abriu): rótulo fora da fatia em linguagem de infográfico, segundo a varredura de portais do projeto.

**Mora melhor em outra família?** Com mais de seis rótulos, barra horizontal (02).

---

## 3. Pizza com fatia em destaque

**Descrição.** Uma fatia recebe ênfase por cor, por deslocamento radial (a pizza explodida, variante listada
na Wikipedia) ou por um anel externo quando ativa. É a versão narrativa: o título diz o que a fatia significa.
Datawrapper e SWD recomendam cor distinta para o valor importante e tons para o resto.

**Anatomia.** Fatia destacada em cor de acento; demais em neutro; deslocamento opcional de 6 a 10 px ao longo
do `midAngle`; anel externo fino no estado ativo; título declarativo.

**Abordagem na stack.** `recharts-custom`. Destaque fixo: `fill` no dado. Deslocamento: `shape` que soma
`dx = Math.cos(-midAngle * RADIAN) * offset` e `dy = Math.sin(-midAngle * RADIAN) * offset` ao `cx` e `cy` e
renderiza `Sector` (componente exportado pelo Recharts). Hover: `activeShape`, como no exemplo oficial, que
desenha um segundo `Sector` por fora e uma linha até o valor. Clique que filtra outra peça: estado no pai,
`onClick` no `Pie` e `shape` comparando o `index` com o selecionado.

**Ponto delicado.** Explodir todas as fatias só atrapalha; deslocar uma. O deslocamento aumenta o raio aparente
e pode estourar a área do SVG: reservar o `offset` na margem. Em tema escuro, a cor de acento precisa de
contraste contra `--surface-raised` e contra as vizinhas. Ativo e selecionado são estados diferentes: hover
some ao sair, seleção persiste e precisa de indicação visível (cursor, `aria-pressed` na lista equivalente).

**Versões sugeridas.**
- **V1 básica: receita de cliente novo.** Fatia de 46% em `--chart-1`, resto em dois neutros.
- **V2 com anotação: não comparecimento.** Fatia de 15% deslocada 8 px, com a nota "alvo: abaixo de 10%".
- **V3 densa do Farol: perdas por motivo que filtram a tabela.** Clicar na fatia filtra a lista de oportunidades
  perdidas; a selecionada fica deslocada e as outras caem para 40% de opacidade, o mesmo recurso de opacidade do
  exemplo oficial de legenda com foco.
- **V4 caso limite: a fatia de interesse é a menor.** "Concorrente" com 3%: o destaque vem com rótulo externo e o
  número vai no título, porque cor numa lasca de 11 graus não aparece.

**Referências.**
- Catálogo: [Recharts, Custom Active Shape Pie Chart](https://recharts.github.io/en-US/examples/CustomActiveShapePieChart/): observar o `Sector` externo e a linha guia desenhados só para o setor ativo.
- Catálogo: [shadcn, chart-pie-donut-active (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-active.tsx): observar o `Sector` com `outerRadius + 10` para o índice ativo.
- Praticante: [Storytelling with Data, death to pie charts](https://www.storytellingwithdata.com/blog/2011/07/death-to-pie-charts): observar a crítica à cor arbitrária, que cria ilusão de tamanho.
- Portal de design: [Behance, Pie Chart, Graphic Design](https://www.behance.net/gallery/110138073/Pie-Chart-Graphic-Design): widget de pizza com transformações 3D em card de dashboard; observar como contra-exemplo de destaque por profundidade.

**Mora melhor em outra família?** Se a fatia destacada é a única mensagem, fração única (modelo 7) ou progresso (13).

---

## 4. Pizza em semicírculo

**Descrição.** Meio círculo de 180 graus representa 100%. Cabe em faixa baixa e larga, onde a pizza cheia
desperdiça altura. É também a base do arco contínuo de parlamento e do gauge.

**Anatomia.** Arco com base reta; rótulos acima ou nas pontas; total centralizado sob o arco, sobre a linha de
base; marca opcional de 50% no topo.

**Abordagem na stack.** `recharts-nativo`: o exemplo oficial "Straight Angle Pie Chart" usa
`startAngle={180}`, `endAngle={0}`, `cx="50%"`, `cy="100%"` e `outerRadius="120%"`. O Highcharts faz a mesma
coisa com `startAngle`, `endAngle` e `center`.

**Ponto delicado.** Com `cy="100%"` o total posto abaixo do centro sai do SVG: reservar altura ou usar `cy`
menor. A marca de 50% cai no topo, o que ajuda a leitura, mas o título precisa dizer que o arco inteiro é o
todo. O tooltip precisa respeitar a borda inferior do card.

**Versões sugeridas.**
- **V1 básica: agendas do mês por resultado** numa faixa de 320 por 160 px.
- **V2 com anotação: marca de 50% no topo** e o texto "mais da metade das entradas veio de mídia paga".
- **V3 densa do Farol: três semicírculos na faixa de resumo da pré-vendas**, um por fila (inbound, outbound,
  reativação), cada um com realizada, remarcada e não compareceu.
- **V4 caso limite: uma parte com 92%.** O arco vira quase um bloco e a leitura passa para o número; acima de 90%,
  trocar por fração única (modelo 7) ou progresso (13).

**Referências.**
- Catálogo: [Recharts, Straight Angle Pie Chart](https://recharts.github.io/en-US/examples/StraightAnglePieChart/): observar `cy="100%"` e o raio relativo ao contêiner.
- Catálogo: [Highcharts, semi circle donut](https://www.highcharts.com/demo/highcharts/pie-semi-circle): a página abriu só com título e navegação; o código fica no editor externo.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): observar que forma circular gasta espaço para dizer pouco em painel denso; guardar o semicírculo para quando o espaço é mesmo baixo e largo.
- Portal de design: [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29): kit escuro com pizza, rosca e círculo de progresso.

**Mora melhor em outra família?** Com agulha e escala, gauge (13); com furo, semi rosca (07).

---

## 5. Pizzas em small multiples

**Descrição.** Várias pizzas pequenas, uma por todo (período, time, segmento), com as mesmas categorias, a
mesma ordem e as mesmas cores. Few, citando Tufte, condena a forma para acompanhar mudança; ela sobrevive em
painel quando a pergunta é "em qual todo a parte X passa da metade", não "quanto variou".

**Anatomia.** Grade de pizzas do mesmo diâmetro; título curto e total por pizza; legenda única no topo (aqui a
legenda se justifica, porque rotular cada pizza repete tudo); ordem de categorias fixa.

**Abordagem na stack.** `recharts-nativo` dentro de `html-tailwind`: grade `grid grid-cols-2 md:grid-cols-4`
com um `PieChart responsive` por célula, como no exemplo oficial "Pie Chart in Grid". O Datawrapper tem um tipo
de gráfico próprio para múltiplas pizzas, citado na página de customização.

**Ponto delicado.** A ordem das categorias é fixa entre as pizzas; a regra de ordenar por valor vale só para
pizza isolada. Sem isso a mesma cor muda de posição e a comparação some. Diâmetro igual para todas; total muito
diferente pede o modelo 9. A partir de cinco todos, barra 100% empilhada (02).

**Versões sugeridas.**
- **V1 básica: resultado das agendas em quatro semanas**, quatro pizzas iguais.
- **V2 com destaque: só "não compareceu" colorida** em todas as pizzas, para responder em que semana passou de 15%.
- **V3 densa do Farol: origem dos leads por SDR** ("SDR 01" a "SDR 04"), legenda única e total no título de cada pizza.
- **V4 caso limite: uma pizza com n = 6.** Aparece em cinza com o selo "amostra pequena", sem percentual cheio.

**Referências.**
- Catálogo: [Recharts, Pie Chart in Grid](https://recharts.github.io/en-US/examples/PieChartInGrid/): observar pizzas `responsive` em células de tamanhos diferentes da grade CSS.
- Catálogo: [RAWGraphs, tutoriais](https://www.rawgraphs.io/learning): pizza entre os tutoriais da ferramenta (a página do tutorial em si abriu só com a introdução).
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar a série de quatro pizzas por ano redesenhada como barras e depois como linha.
- Portal de design: [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options): observar o método de comparar várias formas para o mesmo dado antes de escolher.

**Mora melhor em outra família?** Participação ao longo do tempo: linha (04) ou barra 100% (03).

---

## 6. Pizza com detalhamento de "Outros"

**Descrição.** A pizza mostra as maiores partes e uma fatia "Outros"; ao lado, uma barra (bar of pie) ou uma
segunda pizza (pie of pie) abre a composição de "Outros". A variante interativa é o drilldown: clicar na fatia
troca a pizza pelo detalhe dela.

**Anatomia.** Pizza principal; "Outros" em neutro; conectores SVG da fatia até o painel de detalhe; barra
empilhada ou lista de barras com as partes; total de "Outros" repetido no topo do detalhe; no drilldown, trilha
de navegação ("Todos > Outros").

**Abordagem na stack.** `recharts-custom`: `Pie` principal e `BarChart layout="vertical"` para o detalhe, lado
a lado em flex; os dois conectores são `path` num SVG sobreposto, com coordenadas calculadas a partir dos ângulos
da fatia "Outros" (conhecidos depois de `preparePie`). No drilldown, estado `level` e troca de `data`.

**Ponto delicado.** "Outros" nunca pode ser a maior fatia; se for, o teto está baixo ou a categoria está mal
definida. No drilldown o leitor perde o todo: manter a trilha e o total do nível pai. Conectores quebram ao
redimensionar; recalcular com `ResizeObserver` ou abrir mão deles no celular.

**Versões sugeridas.**
- **V1 básica: origens de lead.** Quatro principais e "Outros" (9%) detalhado ao lado: evento, parceiro, podcast, imprensa.
- **V2 com anotação: dentro de "Outros"**, nota "parceiro triplicou no mês".
- **V3 densa do Farol: motivos de perda com drilldown.** "Preço" abre em "acima do orçamento", "taxa" e "ticket mínimo".
- **V4 caso limite: cauda de 23 categorias abaixo de 1%.** O detalhe vira lista rolável com as 10 maiores e "mais 13 abaixo de 0,5%".

**Referências.**
- Catálogo: [Highcharts, pie with drilldown](https://www.highcharts.com/demo/highcharts/pie-drilldown): a página abriu só com título; o comportamento fica no editor externo.
- Catálogo: [Datawrapper Academy, customizing your pie chart](https://www.datawrapper.de/academy/customizing-your-pie-chart): observar o agrupamento automático das menores acima de cinco fatias, com teto e rótulo configuráveis.
- Praticante: [Storytelling with Data, what is a pie chart](https://www.storytellingwithdata.com/blog/2020/5/14/what-is-a-pie-chart): observar a consolidação das pequenas em "All other".
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Quando a cauda é a mensagem, barra horizontal com top N (02).

---

## 7. Pizza de fração única

**Descrição.** Duas fatias: a parte e o restante. O Datawrapper lembra que dois valores são, na prática, um
valor só; ainda assim, como glifo ao lado do número, a pizza binária comunica "quase metade" num relance,
porque o todo está implícito na forma (Desbarats).

**Anatomia.** Parte em cor de acento começando às 12 horas; restante em `--surface-overlay`; número grande ao
lado, nunca dentro de pizza cheia.

**Abordagem na stack.** `recharts-nativo` com dois itens e `isAnimationActive={false}` quando repetido em
lista; ou `svg-puro` com um `path` de arco quando for glifo de 16 a 24 px em célula de tabela (mais barato que
um `PieChart` por linha).

**Ponto delicado.** O restante é fundo, não categoria: nada de duas cores fortes. Frações extremas (abaixo de
5%, acima de 95%) viram lasca ou disco; trocar por número com barra (13). Não confundir com progresso: fração
única é parte de um todo existente; progresso é caminho até meta, que pode ser ultrapassada.

**Versões sugeridas.**
- **V1 básica:** "38% das oportunidades ganhas vieram de indicação", glifo de 48 px ao lado do número.
- **V2 com anotação:** mesma, com um tique no contorno marcando os 25% do trimestre anterior.
- **V3 densa do Farol:** coluna de glifos na tabela de origens (família 14) com a fração de leads que têm CPL qualificado calculável.
- **V4 caso limite:** fração 0% mostra círculo vazio com "0%"; fração indisponível mostra contorno tracejado e "indisponível", nunca o mesmo círculo vazio.

**Referências.**
- Praticante: [Datawrapper Academy, what to consider when creating a pie chart](https://www.datawrapper.de/academy/what-to-consider-when-creating-a-pie-chart): observar "pizza pode ser desnecessária com dois valores" e "funciona melhor perto de 25%, 50% ou 75%".
- Praticante: [Nightingale, Have I Resolved the Pie Chart Debate?](https://nightingaledvs.com/have-i-resolved-the-pie-chart-debate/): observar os seis critérios e a distinção entre perceber fração e comparar partes.
- Catálogo: [Wikipedia, pie chart](https://en.wikipedia.org/wiki/Pie_chart): observar que a pizza funciona para comparar uma categoria contra o total.
- Portal de design: [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29): círculos de progresso e pizzas pequenas em kit escuro.

**Mora melhor em outra família?** Como glifo em célula, 24 ou 14; contra meta, 13.

---

## 8. Pizza de raio variável

**Descrição.** O ângulo codifica uma métrica (participação) e o raio de cada setor codifica outra. Aparece no
AG Charts (ângulo por população, raio por PIB per capita) e no Highcharts. É peça exploratória; em painel
operacional costuma confundir.

**Anatomia.** Setores com raios diferentes; anéis concêntricos como escala do raio; legenda dupla que explica
ângulo e raio; tooltip com as duas métricas.

**Abordagem na stack.** `recharts-custom`: `Pie` com `outerRadius` máximo e `shape` que devolve `Sector` com
raio calculado por item, `r = rMin + (rMax - rMin) * Math.sqrt(v / vMax)`. Anéis de escala desenhados à parte,
em `circle` no mesmo SVG.

**Ponto delicado.** A área do setor cresce com o quadrado do raio e linearmente com o ângulo, e o olho soma as
duas. O exemplo radial da Vega-Lite avisa que o leitor "será atraído pela área total, confundindo as duas
dimensões", e por isso usa escala de raiz quadrada, zero incluído e raio mínimo. Só vale quando o produto das
duas métricas não induz a leitura errada.

**Versões sugeridas.**
- **V1 básica:** participação no investimento (ângulo) e CPL qualificado (raio) por plataforma de mídia, três setores.
- **V2 com anotação:** anel de referência no CPL qualificado alvo; setor que passa do anel ganha rótulo.
- **V3 densa do Farol:** participação nas entradas (ângulo) e taxa de agenda (raio) por fila da pré-vendas, na aba de análise.
- **V4 caso limite:** plataforma sem conversão no mês: raio mínimo com hachura e tooltip "CPL indisponível: 0 leads qualificados".

**Referências.**
- Catálogo: [AG Charts, pie with variable radius](https://www.ag-grid.com/charts/gallery/pie-with-variable-radius/): observar as duas codificações explicadas no tooltip.
- Catálogo: [Highcharts, variable radius pie](https://www.highcharts.com/demo/highcharts/variable-radius-pie): a página abriu só com título.
- Catálogo: [Vega-Lite, Radial Plot](https://vega.github.io/vega-lite/examples/arc_radial.html): observar escala `sqrt`, `zero: true`, `rangeMin: 20` e o aviso sobre área total.
- Portal de design: [Behance, Data Driven Polar Charts PowerPoint Template](https://www.behance.net/gallery/95759279/Data-Driven-Polar-Charts-PowerPoint-Template-Nulivo): kit de gráficos polares para indicadores (a página descreve só o tipo de template).

**Mora melhor em outra família?** Duas métricas por categoria leem melhor em dispersão (09) ou barras pareadas (02).

---

## 9. Pizzas proporcionais ao total

**Descrição.** Small multiples em que a área de cada pizza é proporcional ao total e as fatias mostram a
composição. Playfair, na origem da pizza (The Statistical Breviary, 1801, lembrado por Few), já usava círculos de
tamanhos diferentes lado a lado. O FT indica símbolo proporcional quando a variação entre valores é grande e a
diferença fina não importa.

**Anatomia.** Pizzas em linha, alinhadas pela base; área proporcional ao total; legenda de tamanho com dois
círculos de referência; total escrito sob cada pizza.

**Abordagem na stack.** `recharts-custom`: um `PieChart` por item com `outerRadius = rMax * Math.sqrt(total /
totalMax)` dentro de contêineres de mesmo tamanho, para alinhar. Com mais de seis pizzas, `svg-puro` num SVG só.

**Ponto delicado.** Raio proporcional ao total é o erro clássico: Few mostra um infográfico que usou diâmetro e
fez o menor círculo parecer o dobro do real; e mesmo com área certa o olho subestima (lei de Stevens, expoente
perto de 0,8, citada por Few via Kosslyn). Por isso o total vai escrito. Abaixo de 24 px de diâmetro não cabe
composição: só o total.

**Versões sugeridas.**
- **V1 básica:** receita reconhecida por trimestre de 2026 (quatro pizzas), fatias por tipo de cliente.
- **V2 com anotação:** legenda de tamanho com R$ 500 mil e R$ 2.000 mil.
- **V3 densa do Farol:** leads do semestre por plataforma de mídia, área pelo volume e fatias por qualificação (qualificado, em análise, desqualificado).
- **V4 caso limite:** mês com total 40 vezes menor (campanha pausada) abaixo do mínimo: vira ponto com "12 leads, composição omitida".

**Referências.**
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar Playfair e o teste do círculo 16 vezes maior.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): observar o caso do diâmetro usado no lugar da área.
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a indicação de símbolo proporcional para grandes variações.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Total e composição juntos leem melhor em barra empilhada (03) ou marimekko (26).

---

## 10. Pizza com legenda tabular

**Descrição.** Pizza pequena à esquerda e legenda em forma de tabela à direita (marcador de cor, nome, valor,
percentual), na mesma ordem das fatias. É o padrão de card de produto quando os nomes são longos e o card é
estreito. Few critica o vai e volta da legenda; a tabela reduz esse custo porque já carrega o número.

**Anatomia.** Pizza de 96 a 140 px; tabela com cor, nome, valor (algarismos tabulares, à direita) e percentual;
linha de total; hover na linha acende a fatia e vice versa.

**Abordagem na stack.** `html-tailwind` para a legenda (`grid grid-cols-[auto_1fr_auto_auto]`) e
`recharts-nativo` para a pizza. O hover compartilhado é estado React (`hovered: string | null`) que alimenta a
opacidade no `shape` e a classe da linha. O Tremor expõe `onValueChange` no clique da fatia, e clicar de novo
desmarca; aqui o equivalente é `onClick` no `Pie` com o mesmo comportamento.

**Ponto delicado.** Ordem da legenda igual à ordem angular. Ligação de hover nos dois sentidos também por
teclado (linha focável). No celular a tabela desce para baixo; a pizza pode sumir, a tabela nunca.

**Versões sugeridas.**
- **V1 básica:** investimento por plataforma com legenda tabular em R$ e %.
- **V2 com destaque:** hover numa linha apaga as outras fatias para 30%.
- **V3 densa do Farol:** perdas por motivo com legenda que traz contagem e valor perdido; clique filtra a lista de oportunidades.
- **V4 caso limite:** sete categorias; a pizza mostra quatro e "Outros", a tabela mostra as sete com "Outros" expansível.

**Referências.**
- Catálogo: [Tremor, donut chart](https://www.tremor.so/docs/visualizations/donut-chart): observar a variante `pie`, o rótulo central e o `onValueChange`.
- Catálogo: [shadcn, charts de pizza](https://ui.shadcn.com/charts/pie): coleção de 12 variantes de pizza em Recharts (o texto da página não lista os nomes).
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar o custo da legenda e a tabela bem desenhada como alternativa.
- Portal de design: [Behance, Visualize Your Expenses with Donut Chart UI Design](https://www.behance.net/gallery/168471219/Visualize-Your-Expenses-with-Donut-Chart-UI-Design): rosca de despesas com categorias listadas numa interface (a página traz título e tags).

**Mora melhor em outra família?** Quando a tabela é o principal, tabela com composição inline (14).

---

## Modelos vistos nas fontes que moram em outra família

- **Rosca, rosa de Nightingale, anel segmentado, pizza dentro da rosca:** 07.
- **Sunburst e anel de vários níveis:** 12 (a Wikipedia lista ring e multilevel como variantes da pizza).
- **Pizza com agulha:** 13. O exemplo oficial [Recharts, Pie Chart With Needle](https://recharts.github.io/en-US/examples/PieChartWithNeedle/) desenha a agulha em SVG próprio, girada pelo `midAngle`.
- **Pizza quadrada (square pie, waffle):** 22. A Wikipedia registra estudo em que a pizza quadrada foi a mais precisa entre os formatos de pizza.
- **Pizza como marcador em mapa ou dispersão:** 23 e 09.
- **Glifo de pizza em célula:** 24 e 14.
- **Pizza 3D, com brilho ou transparência:** antipadrão, fora do catálogo (Few).

## Fontes consultadas

- Datawrapper blog, pie charts: https://www.datawrapper.de/blog/pie-charts
- Datawrapper Academy, how to create a pie chart: https://www.datawrapper.de/academy/how-to-create-a-pie-chart
- Datawrapper Academy, what to consider when creating a pie chart: https://www.datawrapper.de/academy/what-to-consider-when-creating-a-pie-chart
- Datawrapper Academy, customizing your pie chart: https://www.datawrapper.de/academy/customizing-your-pie-chart
- Datawrapper, tipos de gráfico: https://www.datawrapper.de/charts
- Data Visualisation Catalogue, índice: https://datavizcatalogue.com/
- Data Visualisation Catalogue, pie chart: https://datavizcatalogue.com/methods/pie_chart.html
- From Data to Viz, caveat pie: https://www.data-to-viz.com/caveat/pie.html
- FT Visual Vocabulary (pasta): https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- FT Visual Vocabulary (README): https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md
- Recharts, galeria de exemplos: https://recharts.github.io/en-US/examples/
- Recharts, Pie Chart With Customized Label: https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/
- Recharts, Custom Active Shape Pie Chart: https://recharts.github.io/en-US/examples/CustomActiveShapePieChart/
- Recharts, Straight Angle Pie Chart: https://recharts.github.io/en-US/examples/StraightAnglePieChart/
- Recharts, Pie Chart with gap and rounded corners: https://recharts.github.io/en-US/examples/PieChartWithPaddingAngle/
- Recharts, Pie Chart in Grid: https://recharts.github.io/en-US/examples/PieChartInGrid/
- Recharts, Pie Chart With Needle: https://recharts.github.io/en-US/examples/PieChartWithNeedle/
- Recharts, Two Level Pie Chart: https://recharts.github.io/en-US/examples/TwoLevelPieChart/
- Recharts, API do Pie: https://recharts.github.io/en-US/api/Pie/
- Recharts, guia de migração 3.0: https://github.com/recharts/recharts/wiki/3.0-migration-guide
- shadcn, charts de pizza: https://ui.shadcn.com/charts/pie
- shadcn, chart-pie-donut-active: https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-active.tsx
- Tremor, donut chart: https://www.tremor.so/docs/visualizations/donut-chart
- Vega-Lite, galeria: https://vega.github.io/vega-lite/examples/
- Vega-Lite, Pie Chart with Labels: https://vega.github.io/vega-lite/examples/layer_arc_label.html
- Vega-Lite, Radial Plot: https://vega.github.io/vega-lite/examples/arc_radial.html
- Highcharts, documentação de pizza: https://www.highcharts.com/docs/chart-and-series-types/pie-chart
- Highcharts, semi circle donut: https://www.highcharts.com/demo/highcharts/pie-semi-circle
- Highcharts, pie with drilldown: https://www.highcharts.com/demo/highcharts/pie-drilldown
- Highcharts, variable radius pie: https://www.highcharts.com/demo/highcharts/variable-radius-pie
- AG Charts, galeria: https://www.ag-grid.com/charts/gallery/
- AG Charts, pie with variable radius: https://www.ag-grid.com/charts/gallery/pie-with-variable-radius/
- AG Charts, donut series: https://www.ag-grid.com/charts/react/donut-series/
- Nivo, pie: https://nivo.rocks/pie/
- RAWGraphs, tutoriais: https://www.rawgraphs.io/learning
- Wikipedia, pie chart: https://en.wikipedia.org/wiki/Pie_chart
- Stephen Few, Save the Pies for Dessert: https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf
- Stephen Few, Our Irresistible Fascination with All Things Circular: https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf
- Storytelling with Data, what is a pie chart: https://www.storytellingwithdata.com/blog/2020/5/14/what-is-a-pie-chart
- Storytelling with Data, death to pie charts: https://www.storytellingwithdata.com/blog/2011/07/death-to-pie-charts
- Nightingale, Have I Resolved the Pie Chart Debate?: https://nightingaledvs.com/have-i-resolved-the-pie-chart-debate/
- Behance, Mobile Dashboard w/ Real Data, Dark theme UI: https://www.behance.net/gallery/51204899/Mobile-Dashboard-w-Real-Data-Dark-theme-UI
- Behance, Pie Chart, Graphic Design: https://www.behance.net/gallery/110138073/Pie-Chart-Graphic-Design
- Behance, Dark Dashboard Elements (Freebie): https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29
- Behance, D3.js Hierarchical chart options: https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options
- Behance, Data Driven Polar Charts PowerPoint Template: https://www.behance.net/gallery/95759279/Data-Driven-Polar-Charts-PowerPoint-Template-Nulivo
- Behance, Visualize Your Expenses with Donut Chart UI Design: https://www.behance.net/gallery/168471219/Visualize-Your-Expenses-with-Donut-Chart-UI-Design
- Dribbble, Pie Chart Infographic (não abriu): https://dribbble.com/shots/11927332-Pie-Chart-Infographic

Não carregaram e ficaram fora das referências: a página de pizza do Data Viz Project (HTTP 403), shots do Dribbble
(página vazia no leitor) e a Figma Community (HTTP 403).
