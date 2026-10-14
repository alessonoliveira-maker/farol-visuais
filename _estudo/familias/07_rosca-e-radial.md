# Família 07: rosca e radial

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10 (instalado 3.10.1), Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa, empresa ou plataforma real.

## O que a família responde

A família reúne as formas em coordenada polar que não são pizza cheia: a **rosca** (parte do todo com o centro
aproveitado), os **anéis e barras radiais** (progresso ou comparação medida em arco) e as **colunas radiais e a
rosa** (magnitude por setor, boa para ciclos). A Data Visualisation Catalogue explica o ganho da rosca: a leitura
sai da área e vai para o comprimento do arco, e o miolo vira espaço útil. O FT diz o mesmo em uma linha: o centro
"abre espaço para mais informação". O preço vem nas formas radiais: a mesma medida angular fica mais comprida no
anel de fora (Data Visualisation Catalogue), e a barra circular só se paga com muitas categorias (From Data to Viz).

Perguntas típicas no Farol:

- **Comercial:** quanto do forecast do trimestre já virou receita reconhecida? Como a carteira aberta se divide por
  etapa e, dentro de cada etapa, por executivo?
- **Pré-vendas:** quantas agendas da meta semanal cada SDR já marcou? Quanto do teto de capacidade da fila está
  ocupado?
- **Marketing:** como o investimento se reparte por plataforma, com o total no centro? Qual a cobertura de dado de
  cada origem de lead?
- **Diretoria:** qual o atingimento das três metas do ano? Como o custo mensal se distribui ao longo dos 12 meses?

Quando não usar: comparação precisa entre categorias (barra, 02); progresso de muitos itens lado a lado (bullet em
13 ou tabela com barra em 14); qualquer caso em que o círculo não tem significado e só ocupa espaço. Few ("Our
Irresistible Fascination with All Things Circular") mostra gauges circulares gastando um painel inteiro para dizer
o que quatro bullet graphs dizem numa faixa.

## Decisões transversais da família

1. **Tudo da família 06 vale aqui:** todo verdadeiro, teto de 5 fatias, ordem decrescente a partir das 12 horas
   (`startAngle={90}`, `endAngle={-270}`), estado ativo sem `activeIndex`, separador em `var(--surface-raised)`,
   sem 3D, dado ausente declarado com procedência.
2. **Espessura do anel.** `innerRadius` entre 60% e 80% do `outerRadius`. O AG Charts usa 0,7 como padrão. Anel
   fino demais vira contorno e some; grosso demais volta a ser pizza.
3. **O centro tem uma função.** Total, item ativo ou valor contra meta; nunca ícone decorativo. No Recharts, o
   número central é um `Label` com `content={({ viewBox }) => ...}` dentro do `Pie` (rosca) ou do
   `PolarRadiusAxis` (radial), padrão dos componentes do shadcn. O guia de migração do Recharts 3 avisa que
   `Label` embrulhado em componente próprio precisa de `displayName = 'Label'`. Alternativa: `div` absoluto
   centralizado sobre o gráfico, melhor para tipografia e leitura de tela.
4. **Domínio angular explícito.** `RadialBar` preenche o arco relativo ao domínio; sem
   `PolarAngleAxis type="number" domain={[0, meta]} tick={false}`, um valor único enche o anel inteiro. O exemplo
   de texto radial do shadcn contorna isso fixando `endAngle` à mão; o kit do Farol usa domínio explícito.
5. **Distorção polar declarada.** Em anéis concêntricos o mesmo ângulo é mais comprido por fora. Rótulo de valor
   em cada anel ou barra é obrigatório, e a ordem dos anéis é por importância, não por valor.
6. **Acima de 100%.** Progresso circular não tem para onde crescer: segunda volta em tom mais escuro, ou arco
   cheio com selo "112%". Nunca cortar em 100% em silêncio.
7. **Trilho.** `background` no `RadialBar` (a prop aceita objeto com `fill: 'var(--surface-overlay)'`) ou
   `PolarGrid gridType="circle" radialLines={false}`, como no shadcn.
8. **Tamanho mínimo.** Raio externo de pelo menos 56 px para centro com número de dois dígitos a 24 px; abaixo
   disso o número sai do centro e vai para o lado.
9. **Cor.** Por item no dado (`fill: 'var(--chart-1)'`); semântica (`--positive`, `--warning`, `--negative`) só
   quando a polaridade da métrica é conhecida no registry.
10. **Celular.** A rosca preserva o número central; legenda e rótulos descem para baixo do gráfico.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Rosca com total central | parte do todo com o total como informação principal | total que muda com filtro sem aviso | total no centro e repetido no título |
| 2 | Rosca com fatia ativa | explorar partes sem poluir com rótulos | toque sem estado de seleção claro | centro que pisca ao atravessar o separador |
| 3 | Rosca aninhada hierárquica | de que é feito cada pai, dois níveis | comparar subcategoria entre pais | filhos que não somam o pai e desalinham o anel |
| 4 | Anéis concêntricos de dois períodos | mesma composição em dois momentos | três ou mais períodos | ordenar cada anel pelo próprio valor |
| 5 | Semi rosca | composição ou progresso empilhado em faixa baixa | parecer gauge sem ser gauge | total cortado pela borda inferior |
| 6 | Progresso circular | um valor contra meta, com destaque visual | muitos itens lado a lado | anel cheio por falta de domínio; ponta redonda em 0% |
| 7 | Anéis de atividade | 2 a 4 metas do mesmo período | mais de 4 metas | ordenar anéis por valor e exagerar a distorção |
| 8 | Barra radial | ranking curto como peça de capa | comparação precisa | arco maior que 270 graus parecendo 100% |
| 9 | Barra radial empilhada | composição em arco com 2 ou 3 partes | muitos segmentos | canto arredondado em cada gomo |
| 10 | Coluna radial (barplot circular) | muitas categorias ou ciclo (horas, dias do ano) | menos de uns 40 itens sem ciclo | círculo interno pequeno que infla as maiores |
| 11 | Rosa de Nightingale | magnitude em ciclo de 12 meses ou 7 dias | categorias sem ciclo | raio linear no valor |
| 12 | Roscas em small multiples | uma fração por grupo, com número central | mais de 12 grupos | cor ou métrica central variando entre roscas |
| 13 | Anel segmentado em unidades | contagem pequena contra total discreto (12 de 20) | mais de 40 unidades | vão fixo que come o anel quando N cresce |

---

## 1. Rosca com total central

**Descrição.** Pizza com o miolo recortado, e o miolo carrega o total. Data Visualisation Catalogue, From Data
to Viz e FT concordam no uso: parte do todo com poucas categorias e informação extra no centro. É a forma mais
comum da família em painel.

**Anatomia.** Anel; total em `--text-primary` de 24 a 32 px; unidade ou rótulo em `--text-muted` abaixo; rótulo
externo ou legenda tabular; separador; rodapé com procedência.

**Abordagem na stack.** `recharts-nativo`: `Pie innerRadius="62%" outerRadius="80%"` e, dentro dele,
`<Label content={({ viewBox }) => ...} />` desenhando dois `tspan` centrados, como no componente de rosca com
texto do shadcn. O AG Charts oferece `innerLabels` com várias linhas e `innerCircle.fill` para o miolo, boa
referência de anatomia.

**Ponto delicado.** O total do centro é o total do todo, não a soma das fatias visíveis: se o usuário esconde
uma série pela legenda, o centro recalcula e diz "de R$ X no total", ou mantém e marca a fatia escondida. Número
em formato compacto (`formatCurrencyCompact`). O total não se repete no título.

**Versões sugeridas.**
- **V1 básica: investimento de mídia do mês.** R$ 186 mil no centro, três plataformas no anel.
- **V2 com anotação: variação no centro.** Total e "+12% contra agosto" em `--text-secondary`, sem cor semântica,
  porque investimento subir não é bom nem ruim por si.
- **V3 densa do Farol: carteira aberta por etapa.** Qualificação, proposta, negociação, fechamento; centro em duas
  linhas, "R$ 7,4 mi" e "58 oportunidades".
- **V4 caso limite: recorte vazio e dado indisponível.** Filtro sem oportunidades mostra anel tracejado e "0 no
  recorte"; fonte fora do ar mostra anel tracejado e "indisponível" (`formatUnavailable()`), com o motivo no
  tooltip.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, donut chart](https://datavizcatalogue.com/methods/donut_chart.html): observar a troca de leitura de área para comprimento de arco e o uso do miolo.
- Catálogo: [shadcn, chart-pie-donut-text (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-text.tsx): observar o total calculado e desenhado no centro em duas linhas.
- Catálogo: [AG Charts, donut series](https://www.ag-grid.com/charts/react/donut-series/): observar `innerLabels`, `innerCircle` e `sectorSpacing`.
- Praticante: [From Data to Viz, donut plot](https://www.data-to-viz.com/graph/donut.html): observar o limite de poucas categorias e o centro para total e percentuais.
- Portal de design: [Behance, Donut, Chart UI](https://www.behance.net/gallery/201371225/Donut-Chart-UI): estudo de interface de rosca (a página traz só título, ferramentas e tags).

**Mora melhor em outra família?** Com uma fração só, progresso circular (modelo 6); como KPI minúsculo, 01 ou 24.

---

## 2. Rosca com fatia ativa

**Descrição.** Hover, foco ou clique muda o centro para mostrar a fatia ativa (nome, valor, percentual), e a
fatia ganha raio ou anel externo. Libera o rótulo externo: a rosca fica limpa e o detalhe mora no centro.

**Anatomia.** Setor ativo com `outerRadius` 6 a 10 px maior; demais com opacidade reduzida opcional; centro que
alterna entre total (repouso) e item ativo.

**Abordagem na stack.** `recharts-custom`: `activeShape` (exemplo CustomActiveShapePieChart) ou `shape` que
checa `isActive`; o centro lê um estado React atualizado pelos eventos do `Pie`. `Tooltip defaultIndex` abre a
rosca com um item ativo. Clique para filtrar segue o Tremor: clicar seleciona, clicar de novo desmarca.

**Ponto delicado.** O Recharts 3 removeu `activeIndex`; ativar a fatia a partir de fora (hover na tabela ao
lado) exige `shape` lendo o estado próprio. O centro não pode piscar entre total e item ao atravessar o
separador: atraso de saída de 80 a 120 ms. Em toque, o primeiro toque ativa e o segundo filtra. Fatia de 0,8%
(3 graus) é quase impossível de apontar: ativar pela legenda e pelo teclado, sem inflar o ângulo com `minAngle`.

**Versões sugeridas.**
- **V1 básica:** rosca de perdas por motivo; hover mostra motivo, contagem e percentual no centro.
- **V2 com destaque inicial:** o maior motivo abre ativo (`defaultIndex={0}`) e o subtítulo explica por quê.
- **V3 densa do Farol:** rosca de origem dos leads ligada à tabela; hover na linha ativa a fatia e clique filtra o painel inteiro.
- **V4 caso limite:** fatia de 0,8% ativada só pela legenda tabular e pelo teclado; o centro mostra "Imprensa, 3 leads, 0,8%".

**Referências.**
- Catálogo: [Recharts, Custom Active Shape Pie Chart](https://recharts.github.io/en-US/examples/CustomActiveShapePieChart/): observar `activeShape` com segundo `Sector` e linha até o valor.
- Catálogo: [shadcn, chart-pie-donut-active (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-active.tsx): observar o índice ativo desenhado com raio maior.
- Catálogo: [Recharts, guia de migração 3.0](https://github.com/recharts/recharts/wiki/3.0-migration-guide): observar a remoção de `activeIndex`, `blendStroke` e o `accessibilityLayer` ligado por padrão.
- Catálogo: [Tremor, donut chart](https://www.tremor.so/docs/visualizations/donut-chart): observar `onValueChange` e o desmarcar no segundo clique.
- Portal de design: [Behance, The Art and Science of Speaking Donut Charts](https://www.behance.net/gallery/179227873/The-Art-and-Science-of-Speaking-Donut-Charts): estudo sobre roscas em ferramentas de BI (a página traz só título e tags).

**Mora melhor em outra família?** Se o detalhe do item é extenso, tabela com linha expansível (14).

---

## 3. Rosca aninhada hierárquica

**Descrição.** Anel interno com as categorias e anel externo com as subcategorias, alinhadas angularmente ao
pai. O exemplo oficial "Two Level Pie Chart" do Recharts usa pizza interna (`outerRadius` 50%) e anel externo
(60% a 80%); o AG Charts mostra continentes por dentro e países por fora. É um sunburst de dois níveis; mais
níveis moram na família 12.

**Anatomia.** Anel interno (pai); vão; anel externo (filhos) na mesma ordem angular, em tons da cor do pai;
rótulo em um só dos anéis; tooltip com caminho "pai > filho".

**Abordagem na stack.** `recharts-nativo`: dois `Pie` com o mesmo `cx`, `cy`, `startAngle` e `endAngle`. A
ordenação é TypeScript: pais em ordem decrescente e filhos em ordem decrescente dentro de cada pai, concatenados
na ordem dos pais. Tons dos filhos com `color-mix(in oklab, var(--chart-1) 70%, var(--surface-raised))`.

**Ponto delicado.** O alinhamento depende de a soma dos filhos ser igual ao pai; qualquer diferença desalinha o
anel todo. Validar em TypeScript e criar o filho "não classificado" com a diferença. Few critica o gráfico de dois
níveis que tenta comparar tipo de produto entre países: comparar subcategoria entre pais é impossível; o modelo
responde só "de que é feito cada pai".

**Versões sugeridas.**
- **V1 básica:** perdas por etapa (interno) e motivo (externo).
- **V2 com destaque:** só os filhos de "proposta" coloridos; os demais em neutro.
- **V3 densa do Farol:** custo por camada (interno: mídia, time, estrutura) e item (externo: três plataformas; SDRs, executivos, gestão; CRM, dados, escritório).
- **V4 caso limite:** filhos de "estrutura" somam R$ 12 mil a menos que o pai; aparece o filho "sem rateio" hachurado e um alerta de reconciliação.

**Referências.**
- Catálogo: [Recharts, Two Level Pie Chart](https://recharts.github.io/en-US/examples/TwoLevelPieChart/): observar os raios relativos e o `Tooltip defaultIndex`.
- Catálogo: [AG Charts, multiple donut charts](https://www.ag-grid.com/charts/gallery/multiple-donuts/): observar agregação por continente no anel interno e detalhe por país no externo.
- Catálogo: [Highcharts, documentação de pizza](https://www.highcharts.com/docs/chart-and-series-types/pie-chart): observar a rosca montada com várias séries de `size` e `innerSize` diferentes.
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar a crítica ao gráfico de dois níveis de parte do todo.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Três níveis ou mais: sunburst ou treemap (12).

---

## 4. Anéis concêntricos de dois períodos

**Descrição.** O mesmo conjunto de categorias em dois momentos: pizza ou anel interno para o período anterior,
anel externo para o atual. O exemplo "pie in a donut" do AG Charts compara duas datas, esconde rótulos abaixo de
10% e mostra setas de variação no tooltip.

**Anatomia.** Anel interno em tons dessaturados; externo em cor cheia; legenda "dentro: agosto, fora: setembro";
tooltip com os dois valores e a variação em pontos percentuais.

**Abordagem na stack.** `recharts-nativo`: dois `Pie` com os mesmos ângulos e **a mesma ordem de categorias**,
fixada pelo período atual e aplicada aos dois.

**Ponto delicado.** Pelo efeito polar, o anel externo parece maior para a mesma fração e sugere crescimento;
declarar e mostrar a variação em texto. Categoria nova no período atual entra no fim e fica ausente no anel
interno, marcada como "sem dado no período anterior", não como zero. Três períodos ou mais: barra 100% (03) ou
linha (04).

**Versões sugeridas.**
- **V1 básica:** origem dos leads em agosto (dentro) e setembro (fora).
- **V2 com anotação:** a categoria que mais mudou recebe rótulo "+7 p.p."; o tooltip traz as duas frações.
- **V3 densa do Farol:** investimento por plataforma no trimestre anterior e no atual, com o total de cada período na legenda.
- **V4 caso limite:** plataforma que só existe em setembro: fatia externa normal e lacuna interna com o texto "sem dado em agosto".

**Referências.**
- Catálogo: [AG Charts, pie in a donut](https://www.ag-grid.com/charts/gallery/pie-in-a-donut/): observar `outerRadiusRatio` da pizza interna e o tooltip comparativo.
- Catálogo: [Data Visualisation Catalogue, radial bar chart](https://datavizcatalogue.com/methods/radial_bar_chart.html): observar a explicação do arco externo mais longo, que vale para anéis concêntricos.
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar por que comparar partes entre pizzas é difícil.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Participação em vários períodos: linha (04).

---

## 5. Semi rosca

**Descrição.** Rosca de 180 graus. Serve para composição com poucas partes em faixa baixa, ou para um arco
empilhado de progresso, como o componente radial empilhado do shadcn (duas séries em meia volta com total no
centro).

**Anatomia.** Arco; total centralizado sobre a base; rótulos nas pontas; meta opcional como tique.

**Abordagem na stack.** `recharts-nativo`: `Pie startAngle={180} endAngle={0} cy="80%"` com `innerRadius`; ou
`RadialBarChart endAngle={180}` com `RadialBar stackId="a"` por série e `Label` dentro do `PolarRadiusAxis`
(shadcn).

**Ponto delicado.** Sem agulha nem escala não é gauge, e não deve parecer um: nada de faixas verde, amarelo e
vermelho no trilho. O total sobre a base some se `cy` for 100%. No modo empilhado, soma acima da meta enche o
arco e a sobra precisa de texto.

**Versões sugeridas.**
- **V1 básica:** agendas do mês por resultado em meia rosca.
- **V2 com anotação:** tique de 50% no topo e frase "metade das agendas veio de outbound".
- **V3 densa do Farol:** agendas marcadas por canal (inbound e outbound empilhados) contra a meta semanal de 90, centro "72 de 90".
- **V4 caso limite:** 104 de 90; o arco enche e aparece o selo "+14 acima da meta", sem estourar os 180 graus.

**Referências.**
- Catálogo: [shadcn, chart-radial-stacked (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-stacked.tsx): observar `endAngle={180}`, `stackId`, `cornerRadius` e o `Label` dentro do `PolarRadiusAxis`.
- Catálogo: [Recharts, Straight Angle Pie Chart](https://recharts.github.io/en-US/examples/StraightAnglePieChart/): observar ângulos e centro na base.
- Catálogo: [Highcharts, semi circle donut](https://www.highcharts.com/demo/highcharts/pie-semi-circle): a página abriu só com título.
- Portal de design: [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29): roscas e círculos de progresso num kit escuro.

**Mora melhor em outra família?** Com agulha, escala e faixas: gauge (13).

---

## 6. Progresso circular

**Descrição.** Um anel com trilho e arco preenchido até valor sobre meta, número no centro. O Tremor documenta
o componente com `value`, `max`, `radius`, `strokeWidth`, variantes de cor, conteúdo no centro e o estado zero
(só o trilho). O shadcn tem a versão em Recharts com trilho por `PolarGrid`.

**Anatomia.** Trilho; arco; ponta arredondada opcional; número central; meta escrita abaixo; tique opcional de
ritmo esperado.

**Abordagem na stack.** Duas opções.
`recharts-custom`: `RadialBarChart startAngle={90} endAngle={-270}` com um item, `PolarAngleAxis type="number"
domain={[0, meta]} tick={false}` e `RadialBar dataKey="value" background cornerRadius={8}`.
`svg-puro`, mais leve para listas de dezenas de anéis:

```tsx
type RingProps = { value: number | null; max: number; size?: number; stroke?: number };

export function ProgressRing({ value, max, size = 64, stroke = 6 }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value === null || max <= 0 ? 0 : Math.min(value / max, 1);
  const cap = pct < 0.02 || pct > 0.98 ? 'butt' : 'round';
  const mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--surface-overlay)" strokeWidth={stroke}
        strokeDasharray={value === null ? '3 3' : undefined} />
      {pct > 0 && (
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--chart-1)" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap={cap}
          transform={`rotate(-90 ${mid} ${mid})`} />
      )}
    </svg>
  );
}
```

**Ponto delicado.** Sem domínio explícito o `RadialBar` enche o anel. `strokeLinecap="round"` desenha um ponto
com 0% e faz 99% parecer 100%: ponta reta nos extremos, como no trecho acima. Meta zero ou ausente não pode virar
divisão por zero: estado "sem meta". Acima de 100%, segunda volta ou selo (decisão 6).

**Versões sugeridas.**
- **V1 básica:** atingimento da meta trimestral de receita reconhecida, 68%.
- **V2 com anotação:** tique no anel em 74%, a fração do trimestre já decorrida; o arco atrás do tique diz "abaixo do ritmo".
- **V3 densa do Farol:** fileira de anéis por SDR com agendas da semana contra a meta individual (16, 18, 20), número central e meta abaixo.
- **V4 caso limite:** 112% com segunda volta em `color-mix` mais escuro e selo "+12%"; 0% só com trilho; sem meta com trilho tracejado e "sem meta cadastrada".

**Referências.**
- Catálogo: [Tremor, progress circle](https://www.tremor.so/docs/visualizations/progress-circle): observar `value`, `max`, variantes e o comportamento em zero.
- Catálogo: [shadcn, chart-radial-text (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-text.tsx): observar `PolarGrid` com `polarRadius` como trilho e `endAngle` fixado à mão.
- Catálogo: [Recharts, API do RadialBar](https://recharts.github.io/en-US/api/RadialBar/) e [API do PolarAngleAxis](https://recharts.github.io/en-US/api/PolarAngleAxis/): observar `background`, `cornerRadius`, `minPointSize`, `type` e `domain`.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): observar o redesenho de três gauges como bullet graphs.
- Portal de design: [Behance, Axure Tutorial, Progress Ring](https://www.behance.net/gallery/180372547/Axure-Tutorial-Practices-and-Examples-29Progress-Ring): componente de anel de progresso (a página traz só o texto introdutório).

**Mora melhor em outra família?** Com faixas qualitativas ou muitos itens para comparar: bullet (13).

---

## 7. Anéis de atividade

**Descrição.** Vários anéis de progresso concêntricos, um por métrica, cada um contra a sua meta. Em painel,
serve para 2 a 4 metas do mesmo período e do mesmo dono.

**Anatomia.** Anéis de fora para dentro; trilho em cada anel; legenda ao lado com métrica, valor e meta (o
centro é pequeno demais para três números).

**Abordagem na stack.** `recharts-custom`: `RadialBarChart innerRadius="35%" outerRadius="100%"` com dados já
normalizados em TypeScript (`pct = valor / meta * 100`), `RadialBar dataKey="pct" background cornerRadius` e
`PolarAngleAxis type="number" domain={[0, 100]} tick={false}`. O exemplo simples do Recharts mostra `barSize`,
`background`, rótulo `insideStart` e legenda à direita.

**Ponto delicado.** O anel de fora fica mais comprido para o mesmo percentual; a ordem é por importância, e o
percentual vai escrito. A normalização esconde a unidade: tooltip e legenda sempre trazem valor bruto e meta. O
Nivo avisa que a margem não considera os rótulos da grade radial; o mesmo vale aqui para a legenda. Mais de
quatro anéis, os de dentro ficam minúsculos.

**Versões sugeridas.**
- **V1 básica:** três metas anuais da diretoria: receita reconhecida 71%, novos clientes 58%, custo dentro do orçamento 93%.
- **V2 com anotação:** tique do ritmo esperado em cada anel (setembro, 75% do ano decorrido).
- **V3 densa do Farol:** capacidade da pré-vendas em três anéis: entradas tratadas contra o teto de 274, agendas contra a meta, SLA cumprido contra o alvo, com legenda tabular.
- **V4 caso limite:** uma métrica sem meta aparece só na legenda ("sem meta") e sem anel; outra acima de 100% ganha segunda volta.

**Referências.**
- Catálogo: [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/): observar `background`, `barSize` e rótulo no início do arco.
- Catálogo: [Nivo, radial bar](https://nivo.rocks/radial-bar/): observar trilhos, eixos radial e circular e o aviso de margem.
- Catálogo: [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): observar a série radial bar simples, empilhada e invertida.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Mais de quatro metas: bullet em lista (13).

---

## 8. Barra radial

**Descrição.** Barras categóricas desenhadas como arcos concêntricos com origem angular comum; o comprimento
angular é o valor. A Data Visualisation Catalogue registra o problema central: cada barra externa fica mais longa
que a anterior mesmo com o mesmo valor, e a justificativa é quase só estética.

**Anatomia.** Arcos com trilho; nome da categoria no início de cada arco ou legenda; valor na ponta; ângulo
máximo de 270 graus.

**Abordagem na stack.** `recharts-nativo`: `RadialBarChart` com `RadialBar dataKey="value" background
label={{ position: 'insideStart' }}` e `Legend`, como no exemplo simples; `PolarAngleAxis type="number"
domain={[0, max]}` e `endAngle` que limita o arco maior a 270 graus.

**Ponto delicado.** Uma barra de 360 graus parece anel cheio, isto é, 100%: limitar a 270. Ordenar com o maior
por fora exagera a diferença; com o maior por dentro, comprime. Não há ordem correta, só declarada: o kit põe o
maior por fora, escreve o valor na ponta e recomenda barra horizontal (02) quando a comparação precisa ser
precisa.

**Versões sugeridas.**
- **V1 básica:** agendas por SDR na semana, seis arcos.
- **V2 com destaque:** legenda com foco por clique, como no exemplo oficial: a série clicada fica cheia e as outras vão a 0,2 de opacidade.
- **V3 densa do Farol:** leads por origem no mês em sete arcos, como peça de capa do painel de marketing, com a tabela ao lado.
- **V4 caso limite:** origem com 0 leads (só o trilho e o rótulo "0") e origem 8 vezes maior que a segunda, que transforma as outras em lascas; nesse caso, trocar por barra (02).

**Referências.**
- Catálogo: [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/): observar a legenda posicionada à direita com `cx="30%"`.
- Catálogo: [Recharts, Radial Bar Chart with Click to Focus Legend](https://recharts.github.io/en-US/examples/RadialBarChartClickToFocusLegendExample/): observar o contexto React compartilhado entre legenda e setor e a transição de opacidade.
- Catálogo: [Data Visualisation Catalogue, radial bar chart](https://datavizcatalogue.com/methods/radial_bar_chart.html): observar a distorção das barras externas.
- Portal de design: [Behance, Crowdinvesting Interest Rate](https://www.behance.net/gallery/75245591/Crowdinvesting-Interest-Rate): infográfico editorial com barra radial de taxas em dois anos.

**Mora melhor em outra família?** Ranking que precisa ser lido com precisão: barra horizontal (02).

---

## 9. Barra radial empilhada

**Descrição.** Arcos divididos em segmentos empilhados: composição medida em arco. O AG Charts mostra receita
trimestral por categoria de produto; o shadcn, duas séries em meia volta com total no centro.

**Anatomia.** Arcos concêntricos com dois ou três segmentos; legenda de segmentos; total na ponta de cada arco.

**Abordagem na stack.** `recharts-nativo`: um `RadialBar` por série com o mesmo `stackId`; separação visual com
`stroke` da cor do fundo (o shadcn usa `className="stroke-transparent stroke-2"`).

**Ponto delicado.** Segmento do meio não tem base comum, como na barra empilhada, e ainda soma a distorção de
raio: no máximo três segmentos. `cornerRadius` arredonda cada segmento e cria gomos que parecem categorias
separadas; arredondar só a ponta final, desenhando a série do fim com `shape` próprio, ou não arredondar.

**Versões sugeridas.**
- **V1 básica:** agendas por canal em meia volta com total central.
- **V2 com destaque:** segmento outbound em cor cheia e inbound em neutro.
- **V3 densa do Farol:** entradas por dia útil da semana (cinco arcos) empilhadas por status: tratada no SLA, fora do SLA, pendente.
- **V4 caso limite:** feriado na quarta: arco vazio com o rótulo "sem expediente", não zero.

**Referências.**
- Catálogo: [AG Charts, stacked radial bar](https://www.ag-grid.com/charts/gallery/stacked-radial-bar/): observar `innerRadiusRatio` pequeno, rótulos de eixo desligados e o formatador de valor.
- Catálogo: [shadcn, chart-radial-stacked (código fonte)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-stacked.tsx): observar `stackId` e `cornerRadius` em cada série.
- Catálogo: [Nivo, radial bar](https://nivo.rocks/radial-bar/): observar o formato de dados em grupos com séries.
- Portal de design: [Behance, D3.js Hierarchical chart options](https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options): barra radial empilhada comparada com sankey, corda e barras para o mesmo dado; o cliente escolheu o sankey por legibilidade.

**Mora melhor em outra família?** Composição por categoria com precisão: barra empilhada (02 ou 03).

---

## 10. Coluna radial (barplot circular)

**Descrição.** Barras que saem de um círculo interno para fora, uma por categoria. From Data to Viz é claro sobre
o uso: muitas categorias (40 ou mais) com padrão evidente, círculo interno com mais da metade do raio, escala
visível e ordenação por valor. A Data Visualisation Catalogue acrescenta que o zero pode ficar num anel externo
para acomodar negativos. Ciclos (hora do dia, dia do ano) são o uso natural.

**Anatomia.** Círculo interno vazio; barras como setores de anel; anéis de grade com valores; rótulos girados na
ponta; vão angular entre grupos.

**Abordagem na stack.** `svg-puro`. Os exemplos oficiais do Recharts cobrem a barra radial concêntrica; esta
anatomia tem geometria própria em TypeScript. Cada barra é um setor de anel (não um retângulo girado):

```ts
/** Ângulos em radianos, 0 às 12 horas, sentido horário. Não usar para 360 graus exatos. */
export function arcPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const p = (r: number, a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = p(r1, a0);
  const [x1, y1] = p(r1, a1);
  const [x2, y2] = p(r0, a1);
  const [x3, y3] = p(r0, a0);
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
}
```

**Ponto delicado.** Com raio linear no valor, a área do setor cresce mais que o valor; o círculo interno grande
(From Data to Viz) reduz o efeito. Rótulos girados precisam virar 180 graus na metade esquerda para não ficarem de
cabeça para baixo. Um arco de exatamente 360 graus não desenha num `path` único: dividir em dois.

**Versões sugeridas.**
- **V1 básica:** entradas da pré-vendas por hora do dia, 24 colunas.
- **V2 com anotação:** faixa do horário comercial sombreada e anotação no pico das 11 horas.
- **V3 densa do Farol:** leads por dia de 2026 (365 colunas finas) agrupados por mês com vão angular, para ver sazonalidade de mídia.
- **V4 caso limite:** desvio semanal do CPL contra a média, com negativos: zero num anel intermediário, barras para dentro e para fora, cor pela polaridade (CPL abaixo da média é bom).

**Referências.**
- Praticante: [From Data to Viz, circular barplot](https://www.data-to-viz.com/graph/circularbarplot.html): observar os erros listados (círculo interno pequeno, poucos itens, falta de escala, ordem arbitrária).
- Catálogo: [Data Visualisation Catalogue, radial column chart](https://datavizcatalogue.com/methods/radial_column_chart.html): observar o zero num anel externo para negativos.
- Catálogo: [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): observar as variantes simples, agrupada e invertida da coluna radial.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Série temporal sem ciclo: colunas (03); dia do ano em grade: calendário (15).

---

## 11. Rosa de Nightingale

**Descrição.** Setores de ângulo igual com raio proporcional ao valor; também chamada coxcomb ou área polar. A
Data Visualisation Catalogue lembra a origem (mortes evitáveis na Guerra da Crimeia) e o defeito: setores
externos ganham área desproporcional. O Chart.js resume a diferença para a pizza: todo setor tem o mesmo ângulo e
só o raio muda.

**Anatomia.** Setores iguais; anéis de escala; nome da categoria no perímetro; anel tracejado de referência (média).

**Abordagem na stack.** `recharts-custom`: `Pie` com todos os itens de `value: 1` (ângulo igual) e `shape` que
desenha `Sector` com `outerRadius = Math.sqrt(rMin ** 2 + (rMax ** 2 - rMin ** 2) * (v / vMax))`; anéis de escala
em `circle` no mesmo SVG, pintados depois dos setores para a referência não sumir sob as pétalas altas.
Alternativa `svg-puro` com o `arcPath` do modelo 10, necessária quando há empilhamento.

**Ponto delicado.** Raio em raiz quadrada do valor, senão a área cresce ao quadrado (exatamente o que o catálogo
aponta); a Vega-Lite usa escala `sqrt` pelo mesmo motivo. Empilhado, a regra vale para o raio acumulado. Uso
honesto: ciclo de 12 meses ou 7 dias, onde o círculo significa alguma coisa.

**Correção de 2026-09-28, e este parágrafo existe porque a redação anterior autorizou o defeito.** Até esta data
a linha acima dizia `outerRadius = rMin + (rMax - rMin) * Math.sqrt(v / vMax)`, com a raiz **por dentro** do piso
de raio, e as versões v1, v2 e v4 do modelo saíram fiéis a ela. Essa forma não entrega área proporcional quando o
raio mínimo é maior que zero, porque a área de um setor de anel vale `r² − rMin²` e não `r²`: medido na v1,
dez/25 (R$ 8,4 mil) desenhava **32,7%** da área de out/25 (R$ 42,9 mil), quando a proporção real é **19,6%**, com
desvio de até 2,16 pontos percentuais no mês de pico. A forma acima, com a raiz por fora da soma inteira, fecha a
conta em qualquer ponto da escala e em qualquer ponto da pilha. Quem escrever um modelo radial novo copia a linha
da Abordagem, não a intuição de "multiplicar a raiz pelo vão".

**A grandeza lida se declara no desenho.** A rosa codifica valor em **área**, e nem o ângulo nem o raio são
lineares nela: o ângulo é constante entre os setores e o raio cresce pela raiz. Toda versão traz no rodapé, em
11 px e `--text-muted`, que a comparação se faz pela área e que o ângulo é igual em todos os passos. Sem isso o
leitor aplica o hábito da pizza, procura o ângulo, e conclui que todos os meses são iguais.

**Teto de escala fixo cobra o desenho do corte.** Escala com teto constante é uma escolha legítima, porque faz o
tamanho do setor querer dizer a mesma coisa quando o recorte muda, mas ela produz valor acima do teto. Nesse caso
a marca cortada precisa de sinal visual de quebra (duas tarjas na cor do cartão atravessando a marca, a marca
passando **para fora** do anel do topo em vez de parar rente a ele) e do valor real escrito. Corte calado desenha
dois valores diferentes do mesmo tamanho, e o leitor conclui empate onde há diferença.

**Versões sugeridas.**
- **V1 básica:** investimento de mídia por mês de 2026, 12 setores.
- **V2 com anotação:** anel tracejado da média mensal; meses acima em cor cheia e abaixo em neutro com o valor escrito ao lado (opacidade em marca é perda de contraste medida, ACE-5, então o recurso do AG Charts entra como cor e não como transparência).
- **V3 densa do Farol:** custo mensal empilhado em três camadas (mídia, time, estrutura), com raio acumulado pela mesma fórmula da Abordagem, e o corte declarado no mês que passa do teto da escala.
- **V4 caso limite:** outubro a dezembro ainda sem dado: setores só com contorno tracejado e o rótulo "a realizar", nunca raio zero. O piso de raio desse contorno se escolhe convertendo a fração de volta em valor pela fórmula da Abordagem, para não coincidir com nenhum mês plausível.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, Nightingale rose chart](https://datavizcatalogue.com/methods/nightingale_rose_chart.html): observar a ênfase exagerada dos setores externos.
- Catálogo: [AG Charts, simple nightingale](https://www.ag-grid.com/charts/gallery/simple-nightingale/): observar a linha de média no eixo radial e a opacidade condicional.
- Catálogo: [Chart.js, polar area](https://www.chartjs.org/docs/latest/charts/polar.html): observar a definição por ângulo igual e raio variável.
- Catálogo: [Vega-Lite, Radial Plot](https://vega.github.io/vega-lite/examples/arc_radial.html): observar a escala `sqrt` no raio.
- Portal de design: [Behance, D3.js 2023 Disaster Hotspots Dashboard](https://www.behance.net/gallery/236085929/D3js-2023-Disaster-Hotspots-Dashboard): rosa como peça principal, com hover que filtra por tipo junto de um mapa de pontos.
- Portal de design: [Behance, Florence Nightingale, Visualización de Datos](https://www.behance.net/gallery/124198669/Florence-Nightingale-Visualizacion-de-Datos): releitura do formato (a página traz só título e tags).

**Mora melhor em outra família?** Sem ciclo, colunas (03); várias métricas por categoria, radar (18).

---

## 12. Roscas em small multiples

**Descrição.** Várias roscas pequenas, uma por grupo, cada uma com a mesma métrica no centro. Muito comum em
painel de qualidade de dado. Herda a crítica de Tufte a várias pizzas (via Few); o número central é o que salva a
leitura.

**Anatomia.** Grade de roscas de 64 a 96 px; número central; nome do grupo embaixo; legenda única; rótulos de
linha e coluna quando a grade é uma matriz.

**Abordagem na stack.** `html-tailwind` com grade (`grid grid-cols-3 md:grid-cols-6`) e `recharts-nativo` por
célula, como no exemplo "Pie Chart in Grid"; com mais de oito roscas binárias, o `ProgressRing` do modelo 6 em
`svg-puro`.

**Ponto delicado.** Mesma cor, mesma métrica central e mesmo diâmetro em todas. Número central com n pequeno
engana: abaixo de um n mínimo, mostrar "n=4" no lugar do percentual. Muitas roscas binárias numa tabela
funcionam melhor como barra em célula (14).

**Versões sugeridas.**
- **V1 básica:** cobertura de telefone válido por origem, seis roscas.
- **V2 com destaque:** roscas abaixo de 50% com número em `--warning`, porque cobertura baixa é ruim no registry.
- **V3 densa do Farol:** completude de quatro campos (origem, porte, telefone, cargo) por plataforma de mídia, 3 por 4 roscas em matriz com rótulos de linha e coluna.
- **V4 caso limite:** plataforma com 4 leads no mês: rosca cinza e "n=4" no centro.

**Referências.**
- Catálogo: [Recharts, Pie Chart in Grid](https://recharts.github.io/en-US/examples/PieChartInGrid/): observar roscas `responsive` em grade CSS.
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a frase sobre o centro da rosca como espaço para mais informação.
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar a citação de Tufte sobre várias pizzas.
- Portal de design: [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29): roscas repetidas em kit escuro.

**Mora melhor em outra família?** Fração por grupo em tabela: composição inline ou barra em célula (14).

---

## 13. Anel segmentado em unidades

**Descrição.** Anel dividido em N segmentos iguais, cada um uma unidade (agenda, dia útil), colorido por status.
Junta a contagem da família 22 à forma circular. Legível até uns 30 ou 40 segmentos.

**Anatomia.** Segmentos iguais com vão; cor por status; centro "12 de 20".

**Abordagem na stack.** `recharts-nativo`: `Pie` com N itens de `value: 1`, `fill` por status no dado,
`innerRadius="75%"` e `paddingAngle` calculado, como no exemplo oficial com vão e cantos arredondados.

**Ponto delicado.** Vão fixo come proporção maior quando N cresce: `paddingAngle = Math.min(3, 120 / N)`. Com
`cornerRadius` o segmento curto vira pílula. Acima de 40 unidades, waffle (22).

**Versões sugeridas.**
- **V1 básica:** 20 agendas da meta semanal, 12 marcadas.
- **V2 com destaque:** três status (realizada, marcada para os próximos dias, faltante), só a primeira em cor cheia.
- **V3 densa do Farol:** 21 dias úteis do mês por fila, cada segmento com SLA do dia cumprido, estourado ou sem expediente.
- **V4 caso limite:** teto de 150 contas por executivo: os segmentos viram fios; trocar por waffle de 10 por 15 (22).

**Referências.**
- Catálogo: [Recharts, Pie Chart with gap and rounded corners](https://recharts.github.io/en-US/examples/PieChartWithPaddingAngle/): observar `paddingAngle={5}` e `cornerRadius="50%"`.
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a regra de números inteiros para grades de unidades.
- Praticante: [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart): observar a legenda que diz o que cada unidade representa.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Com muitas unidades, waffle ou unit chart (22).

---

## Modelos vistos nas fontes que moram em outra família

- **Gauge com agulha, faixas e escala:** 13.
- **Sunburst, anéis de três ou mais níveis:** 12 (a Data Visualisation Catalogue lista sunburst como variação da rosca).
- **Radar:** 18.
- **Espiral temporal:** 04 ou 20 (Few critica a espiral que faz o ano mais recente parecer mais longo).
- **Rosca de raio variável:** 06, modelo 8 (a galeria do AG Charts tem a variante em rosca).
- **Rosca minúscula em KPI ou célula:** 01, 14 e 24.
- **Corda:** 27.

## Fontes consultadas

- Data Visualisation Catalogue, donut chart: https://datavizcatalogue.com/methods/donut_chart.html
- Data Visualisation Catalogue, radial bar chart: https://datavizcatalogue.com/methods/radial_bar_chart.html
- Data Visualisation Catalogue, radial column chart: https://datavizcatalogue.com/methods/radial_column_chart.html
- Data Visualisation Catalogue, Nightingale rose chart: https://datavizcatalogue.com/methods/nightingale_rose_chart.html
- From Data to Viz, donut plot: https://www.data-to-viz.com/graph/donut.html
- From Data to Viz, circular barplot: https://www.data-to-viz.com/graph/circularbarplot.html
- FT Visual Vocabulary (README): https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md
- Recharts, Two Level Pie Chart: https://recharts.github.io/en-US/examples/TwoLevelPieChart/
- Recharts, Custom Active Shape Pie Chart: https://recharts.github.io/en-US/examples/CustomActiveShapePieChart/
- Recharts, Straight Angle Pie Chart: https://recharts.github.io/en-US/examples/StraightAnglePieChart/
- Recharts, Pie Chart with gap and rounded corners: https://recharts.github.io/en-US/examples/PieChartWithPaddingAngle/
- Recharts, Pie Chart in Grid: https://recharts.github.io/en-US/examples/PieChartInGrid/
- Recharts, Simple Radial Bar Chart: https://recharts.github.io/en-US/examples/SimpleRadialBarChart/
- Recharts, Radial Bar Chart with Click to Focus Legend: https://recharts.github.io/en-US/examples/RadialBarChartClickToFocusLegendExample/
- Recharts, API do RadialBar: https://recharts.github.io/en-US/api/RadialBar/
- Recharts, API do PolarAngleAxis: https://recharts.github.io/en-US/api/PolarAngleAxis/
- Recharts, API do Sector: https://recharts.github.io/en-US/api/Sector/
- Recharts, guia de migração 3.0: https://github.com/recharts/recharts/wiki/3.0-migration-guide
- shadcn, charts radiais: https://ui.shadcn.com/charts/radial
- shadcn, chart-pie-donut-text: https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-text.tsx
- shadcn, chart-pie-donut-active: https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-pie-donut-active.tsx
- shadcn, chart-radial-text: https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-text.tsx
- shadcn, chart-radial-stacked: https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radial-stacked.tsx
- Tremor, donut chart: https://www.tremor.so/docs/visualizations/donut-chart
- Tremor, progress circle: https://www.tremor.so/docs/visualizations/progress-circle
- AG Charts, galeria: https://www.ag-grid.com/charts/gallery/
- AG Charts, donut series: https://www.ag-grid.com/charts/react/donut-series/
- AG Charts, pie in a donut: https://www.ag-grid.com/charts/gallery/pie-in-a-donut/
- AG Charts, multiple donut charts: https://www.ag-grid.com/charts/gallery/multiple-donuts/
- AG Charts, stacked radial bar: https://www.ag-grid.com/charts/gallery/stacked-radial-bar/
- AG Charts, simple nightingale: https://www.ag-grid.com/charts/gallery/simple-nightingale/
- Nivo, radial bar: https://nivo.rocks/radial-bar/
- Highcharts, documentação de pizza: https://www.highcharts.com/docs/chart-and-series-types/pie-chart
- Highcharts, semi circle donut: https://www.highcharts.com/demo/highcharts/pie-semi-circle
- Highcharts, donut chart: https://www.highcharts.com/demo/highcharts/pie-donut
- Chart.js, polar area: https://www.chartjs.org/docs/latest/charts/polar.html
- Vega-Lite, Radial Plot: https://vega.github.io/vega-lite/examples/arc_radial.html
- Stephen Few, Save the Pies for Dessert: https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf
- Stephen Few, Our Irresistible Fascination with All Things Circular: https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf
- Storytelling with Data, what is a unit chart: https://www.storytellingwithdata.com/blog/what-is-a-unit-chart
- Nightingale, Finding The Right Elements For an Award-Winning Dashboard: https://nightingaledvs.com/elements-for-an-award-winning-dashboard/ (a autora admite que radial não é visual comum de painel e o usa para sobrepor uma rosca ao ranking)
- Behance, Donut, Chart UI: https://www.behance.net/gallery/201371225/Donut-Chart-UI
- Behance, The Art and Science of Speaking Donut Charts: https://www.behance.net/gallery/179227873/The-Art-and-Science-of-Speaking-Donut-Charts
- Behance, Dark Dashboard Elements (Freebie): https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29
- Behance, Axure Tutorial, Progress Ring: https://www.behance.net/gallery/180372547/Axure-Tutorial-Practices-and-Examples-29Progress-Ring
- Behance, Crowdinvesting Interest Rate: https://www.behance.net/gallery/75245591/Crowdinvesting-Interest-Rate
- Behance, D3.js Hierarchical chart options: https://www.behance.net/gallery/236869859/D3js-Hierarchical-chart-options
- Behance, D3.js 2023 Disaster Hotspots Dashboard: https://www.behance.net/gallery/236085929/D3js-2023-Disaster-Hotspots-Dashboard
- Behance, Florence Nightingale, Visualización de Datos: https://www.behance.net/gallery/124198669/Florence-Nightingale-Visualizacion-de-Datos
- Dribbble, Radial Chart (não abriu): https://dribbble.com/shots/20464065-Radial-Chart

Não carregaram e ficaram fora: página de rosca do Data Viz Project (HTTP 403), demo de anéis de atividade do
Highcharts (endereço tentado deu 404) e a Figma Community (HTTP 403).
