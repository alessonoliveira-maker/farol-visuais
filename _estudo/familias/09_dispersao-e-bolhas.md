# Família 09: dispersão e bolhas

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa ou empresa real.

## O que a família responde

Dispersão posiciona cada entidade por duas medidas quantitativas, uma em cada eixo. Responde "existe relação
entre X e Y", "qual a direção e a força dessa relação", "quem foge do padrão" e "onde há aglomerados". Bolha
acrescenta uma terceira medida pela área do círculo. O Data Visualisation Catalogue resume a função como
detectar padrão e relação "quando você tem dados numéricos pareados" e já avisa que correlação não é causa.
O FT Visual Vocabulary coloca a família em *Correlation*: dispersão, dispersão conectada, bolhas e heatmap XY.

Perguntas típicas no Farol:

- **Comercial:** oportunidades de ticket maior demoram mais para fechar? O valor no forecast de 30 dias antes
  bateu com o valor fechado? Executivo com mais carteira converte menos?
- **Pré-vendas:** quanto mais tentativas por lead, mais agendas? O tempo até o primeiro contato derruba o
  comparecimento? SDR com fila maior cumpre menos SLA?
- **Marketing:** campanha de CPL menor traz lead menos qualificado? Quanto rende cada real a mais de
  investimento por plataforma? Criativo de CTR alto converte?
- **Diretoria:** custo de cada área contra o que ela entrega; crescimento contra participação por linha de
  produto (quando vira leitura por quadrante, mora na família 25).

## O que a pesquisa diz, antes de desenhar

1. **Sobreposição é o erro número um** quando a amostra cresce (From Data to Viz). As saídas documentadas são
   transparência, ponto menor, amostragem, destaque de subgrupo, facetas e densidade 2D (From Data to Viz,
   density2d); Observable Plot oferece `hexbin` e `density`, e o RAWGraphs tem hexagonal binning "para pontos
   sobrepostos".
2. **Mostrar subgrupos.** Não mostrar pode esconder paradoxo de Simpson (From Data to Viz).
3. **Área, não raio.** Bolha dimensionada pelo raio exagera as grandes (Data Visualisation Catalogue, From Data
   to Viz). O Observable Plot usa escala `sqrt` no raio por padrão e desenha as maiores primeiro, "as menores
   por cima"; o exemplo de bolhas do ECharts usa `Math.sqrt` no `symbolSize`.
4. **A terceira variável é a pior lida.** A relação entre X e Y é "muito mais óbvia" que a com o tamanho (From
   Data to Viz); o olho compara mal áreas e a memória curta guarda "cerca de quatro" informações visuais (SWD).
   Bolha exige legenda de tamanho.
5. **Linha de tendência não é enfeite.** SWD recomenda tirar quando não esclarece; Datawrapper diz para não usar
   "se os pontos estão espalhados por toda parte". Regressão de Y em X não é a de X em Y (Observable Plot).
6. **Anotar leva o olho.** Datawrapper usa anotação para "outliers e tendências"; SWD recomenda rótulo e
   agrupamento para público não técnico.
7. **Eixo não precisa começar em zero** porque a codificação é posição (SWD).
8. **Resumo estatístico não substitui o gráfico.** O Datasaurus Dozen tem doze conjuntos com mesma média, desvio
   e correlação e formas totalmente diferentes; o dinossauro original é de Alberto Cairo.
9. **Dispersão conectada cobra caro.** Desbarats (Nightingale) argumenta que o leitor precisa acompanhar quatro
   coisas mudando ao mesmo tempo e não achou padrão que não aparecesse também em linhas empilhadas ou indexadas.

## Regras do Farol para esta família

1. **Legenda diz o que é cada ponto** ("cada ponto é uma campanha na semana") e a unidade de cada eixo.
2. **Domínio explícito e estável** entre filtros (`domain={[0, 400]}` ou calculado no registry); domínio
   automático só em modo exploração, porque ele muda a forma da nuvem quando o filtro muda.
3. **Bolha com área proporcional:** `ZAxis` com `domain` começando em 0, maiores desenhadas antes e legenda de
   tamanho com 2 ou 3 círculos de referência.
4. **Volume:** acima de ~500 pontos no cartão, opacidade 0,35 a 0,5 e ponto pequeno; acima de ~3.000, modelo
   binado (13 ou 14) ou amostra declarada no rodapé.
5. **Tendência só com prova:** reta sempre com `n` e R² no rótulo e só quando o R² passa um piso declarado
   (sugestão 0,3 e `n` de pelo menos 10); abaixo disso a reta some e o rótulo diz por quê.
6. **Cor tem um papel só:** ou categoria (até 5 grupos) ou destaque (uma cor mais neutro), nunca os dois.
7. **Rótulo direto só no que importa** (até ~8 pontos); o resto responde ao hover.
8. **Dado ausente não vira zero.** Ponto sem X ou sem Y sai do gráfico e entra no rodapé ("37 campanhas sem
   investimento registrado não aparecem"). Um ponto no (0, 0) inventado é o pior erro da família.

## Base de implementação no Recharts 3.10

- `ScatterChart` para dispersão pura; `ComposedChart` quando a dispersão divide o plano com `Line` ou `Area`
  (padrão do exemplo oficial "Scatter And Line Of Best Fit").
- `Scatter`: `data`, `dataKey`, `shape` (predefinidos `circle`, `cross`, `diamond`, `square`, `star`,
  `triangle`, `wye` ou componente próprio), `line`, `lineType` (`joint` liga os pontos, `fitting` desenha
  regressão), `lineJointType`, `activeShape`, `label`, `zAxisId`, `animationMatchBy`.
- `ZAxis`: eixo virtual que não desenha nada; `range` padrão `[64, 64]`; aceita `domain`, `scale`, `name`,
  `unit`. O tamanho do símbolo é área em px²; conferir no build se o círculo sai com área proporcional ao valor.
- `XAxis` e `YAxis`: `type="number"`, `scale` (`log`, `sqrt` e outras), `domain` com `dataMin`, `dataMax` ou
  função, `allowDataOverflow`, `niceTicks` (`auto`, `adaptive`, `snap125`, `none`), `reversed`.
- `ErrorBar`: filho de `Bar`, `Line` e `Scatter`; `direction` `x` ou `y`; `dataKey` com valor simétrico ou par
  `[baixo, alto]`, que são distâncias a partir do ponto e não limites absolutos.
- `ReferenceLine`: `x`, `y` ou `segment` para diagonal; `ReferenceArea`: `x1`, `x2`, `y1`, `y2` em unidade de
  dado, e o lado omitido vai até a borda; os dois têm `ifOverflow`.
- `LabelList`: `dataKey`, `content` (chamado uma vez por item), `position`, `offset`, `formatter`.
- Recharts 3 aceita componente próprio como filho direto do gráfico, sem `Customized`, e o guia de
  customização lista `usePlotArea`, `useChartWidth`, `useChartHeight`, `useMargin` e
  `useActiveTooltipDataPoints`. Conferir a exportação exata na 3.10 antes de depender de um hook.
- shadcn/ui charts não tem categoria de dispersão; o `ScatterChart` do Tremor (`size`, `sizeRange`,
  `showOpacity`, `category`) serve como referência de API e comportamento, não como dependência.
- Tokens: ponto padrão `var(--chart-1)`, destaque `var(--chart-2)`, neutro `var(--line-strong)`, grade
  `var(--line-subtle)`, textos `var(--text-muted)`, fundo de marcador `var(--surface-raised)`.

Utilitário comum aos modelos com tendência:

```ts
export type Par = { x: number; y: number };

export function minimosQuadrados(pts: Par[]) {
  const n = pts.length;
  if (n < 3) return null;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of pts) {
    const dx = p.x - mx, dy = p.y - my;
    sxx += dx * dx; sxy += dx * dy; syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;
  const inclinacao = sxy / sxx;
  return { n, inclinacao, intercepto: my - inclinacao * mx, r2: (sxy * sxy) / (sxx * syy), mx, sxx };
}
```

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Dispersão simples | relação entre duas medidas de um conjunto de entidades | uma das medidas é categoria ou tempo | domínio automático e ponto ausente jogado em zero |
| 2 | Dispersão com linha de tendência | mostrar direção e força de uma relação | nuvem sem forma, `n` pequeno | reta estendida além dos dados, sem R² |
| 3 | Tendência com faixa de confiança | leitor precisa ver a incerteza da reta | público que lê a faixa como "onde os pontos caem" | chamar faixa da média de faixa dos pontos |
| 4 | Dispersão com rótulos e destaque | contar quem é quem nos extremos | todos os pontos rotulados | rótulos sobrepostos e sem regra de seleção |
| 5 | Dispersão com linha de identidade | previsto contra realizado, meta contra entrega | medidas de unidades diferentes | eixos com escalas diferentes, diagonal que não é 45° |
| 6 | Bolhas | terceira medida de magnitude por entidade | comparação precisa da terceira medida | tamanho pelo raio, sem legenda de tamanho |
| 7 | Bolhas em grade categórica | volume por duas categorias ordenadas (dia e hora) | quando a cor resolveria (mapa de calor) | bolha vazia confundida com zero |
| 8 | Dispersão por categoria | comparar nuvens de 2 a 5 grupos | mais de 5 grupos no mesmo plano | cor sem forma, ilegível para daltônico |
| 9 | Dispersão conectada | trajetória de duas medidas no tempo para uma entidade | mais de uma ou duas entidades | curva suavizada inventando caminho |
| 10 | Dispersão de antes e depois com setas | mudança de posição de várias entidades entre dois momentos | muitos momentos | seta sem indicação de qual ponta é o início |
| 11 | Dispersão com barras de erro | valores estimados com incerteza por entidade | incerteza desconhecida | usar limites absolutos no `ErrorBar` |
| 12 | Dispersão com distribuições marginais | ver relação e forma de cada medida juntas | cartão pequeno | histogramas com domínio diferente do plano |
| 13 | Dispersão binada em grade | milhares de pontos, leitura de concentração | poucas centenas de pontos | tamanho pelo raio da contagem |
| 14 | Hexbin | concentração densa com forma contínua | leitor precisa achar um ponto específico | cor sequencial sem legenda e hexágono vazio igual a zero |
| 15 | Contorno de densidade 2D | picos de concentração em nuvem enorme | amostra pequena | largura de banda escolhida sem teste |
| 16 | Envoltória por grupo | mostrar território de cada grupo | grupos com outliers extremos | casco calculado em unidade de dado com escala log |
| 17 | Matriz de dispersão | explorar pares entre 3 a 5 medidas | apresentação para diretoria | domínios diferentes por célula |
| 18 | Pequenos múltiplos de dispersão | mesma relação em vários grupos sem sobrepor | poucos pontos por painel | cada painel com domínio próprio |
| 19 | Dispersão em escala logarítmica | medidas que variam em ordens de grandeza | valores zero ou negativos | esquecer de avisar a escala no eixo |
| 20 | Dispersão com zoom e seleção por área | exploração de nuvem densa | cartão estático de apresentação | alvo de hover do tamanho do ponto |
| 21 | Bolhas animadas no tempo | narrar a evolução de posição e tamanho | leitura analítica fina | animação casando pontos pelo índice, não pelo id |

---

## 1. Dispersão simples

**Descrição.** Cada ponto é uma entidade com um valor em X e um em Y. É a forma de entrada da família e a base
de quase todos os outros modelos.

**Anatomia.** Dois eixos numéricos com nome e unidade; grade leve nos dois sentidos; pontos com opacidade
moderada; tooltip com o nome da entidade e os dois valores formatados; rodapé com `n` exibido e `n` fora do
gráfico por dado ausente.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart`, `XAxis` e `YAxis` com `type="number"`, `Scatter`,
`Tooltip` com `content` próprio e `CartesianGrid`.

```tsx
<ScatterChart responsive data={ganhas} margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
  <CartesianGrid stroke="var(--line-subtle)" />
  <XAxis type="number" dataKey="ticketMil" name="Ticket" unit=" mil" domain={[0, 400]} />
  <YAxis type="number" dataKey="cicloDias" name="Ciclo" unit=" d" domain={[0, 180]} />
  <Tooltip content={<TooltipOportunidade />} cursor={{ stroke: 'var(--line-strong)', strokeDasharray: '3 3' }} />
  <Scatter fill="var(--chart-1)" fillOpacity={0.7} />
</ScatterChart>
```

**Ponto delicado.** O tooltip padrão mostra X e Y e não diz quem é o ponto; sempre `content` próprio com o nome.
Pontos idênticos se escondem: opacidade abaixo de 1 revela a pilha. O filtro deve montar `ganhas` já sem os
registros incompletos e contar os descartados para o rodapé.

**Versões sugeridas.**
- **V1 básica: ticket contra ciclo.** Oportunidades ganhas nos últimos 12 meses, ticket em milhares de reais no
  X e ciclo em dias no Y; cada ponto uma oportunidade fictícia.
- **V2 com destaque: o executivo selecionado.** Mesma nuvem; as oportunidades do Executivo D em `--chart-1` e as
  demais em `--line-strong` com opacidade 0,35, desenhadas antes para ficarem atrás.
- **V3 densa do Farol: velocidade de contato.** 1.800 leads do trimestre, minutos até o primeiro contato no X e
  tentativas até a agenda no Y; ponto de raio 2, opacidade 0,35.
- **V4 caso limite: horário ausente.** 12% dos leads sem registro de primeiro contato ficam fora; rodapé "212
  leads sem horário de 1º contato não aparecem" com link para a lista.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, scatterplot](https://datavizcatalogue.com/methods/scatterplot.html): observar o uso para dados pareados, a linha de tendência opcional e o aviso de correlação.
- Catálogo: [Recharts, Simple Scatter Chart](https://recharts.github.io/en-US/examples/SimpleScatterChart/): observar `type="number"` nos eixos e `unit` alimentando o tooltip.
- Praticante: [Storytelling with Data, what is a scatterplot](https://www.storytellingwithdata.com/blog/2020/5/27/what-is-a-scatterplot): observar transparência nos sobrepostos, eixo sem zero e o alerta de leitura errada.
- Portal de design: [Behance, Scatter plot charting component](https://www.behance.net/gallery/149202761/Scatter-plot-charting-component): componente de dispersão para web mostrado em vários estados; a página traz só as imagens, sem especificação escrita.

---

## 2. Dispersão com linha de tendência

**Descrição.** A dispersão ganha uma reta de mínimos quadrados que resume direção e inclinação. Serve para dizer
"cada unidade a mais de X vem com tanto de Y", nunca para dizer causa.

**Anatomia.** Pontos em tom neutro; reta em cor de destaque só no intervalo de X observado; rótulo curto junto à
ponta da reta com inclinação traduzida, R² e `n`.

**Abordagem na stack.** `recharts-custom`: `ComposedChart` com `Scatter` e `Line`, reta calculada em TypeScript
com `minimosQuadrados`. O exemplo oficial usa um array só, com chaves separadas para os pontos e para os dois
extremos da reta, e a `Line` com `dot={false}`, `activeDot={false}` e `legendType="none"`. Para exploração
rápida existe `<Scatter line lineType="fitting" />`, que não devolve R² nem permite o piso da regra 5.

```tsx
const fit = minimosQuadrados(pontos);
const x0 = Math.min(...pontos.map((p) => p.x));
const x1 = Math.max(...pontos.map((p) => p.x));
const linhas = [
  ...pontos.map((p) => ({ x: p.x, y: p.y })),
  ...(fit && fit.r2 >= 0.3 ? [x0, x1].map((x) => ({ x, tendencia: fit.intercepto + fit.inclinacao * x })) : []),
];

<ComposedChart responsive data={linhas}>
  <XAxis type="number" dataKey="x" domain={[0, 60]} unit=" mil" />
  <YAxis type="number" domain={[0, 250]} />
  <Scatter dataKey="y" fill="var(--line-strong)" fillOpacity={0.6} />
  <Line dataKey="tendencia" stroke="var(--chart-1)" strokeWidth={2} dot={false} activeDot={false} legendType="none" />
</ComposedChart>
```

**Ponto delicado.** Não extrapolar: a reta vai de `x0` a `x1`. Com eixo em escala log, a regressão tem que ser
feita sobre o log, ou a "reta" vira curva. Um ou dois outliers dominam os mínimos quadrados; quando o registry
marcar a métrica como de cauda longa, calcular também a mediana das inclinações e avisar se as duas divergem.
Conferir se a `Line` quebra nas linhas que só têm `y` (o exemplo oficial não usa `connectNulls`).

**Versões sugeridas.**
- **V1 básica: investimento contra leads qualificados.** Campanha por semana, investimento em milhares de reais
  no X e leads qualificados no Y, com a reta.
- **V2 com anotação: retorno marginal.** Rótulo "cada R$ 1 mil a mais veio com ~3,2 leads qualificados (R² 0,58;
  n 64)" ao lado da ponta direita.
- **V3 densa do Farol: uma reta por plataforma.** Plataformas A, B e C em cores categóricas, cada uma com sua
  reta; a leitura é a diferença de inclinação, e o tooltip da reta mostra os três R².
- **V4 caso limite: sem relação.** R² 0,07 com n 9: a reta não é desenhada e o rótulo diz "sem relação linear
  detectável (R² 0,07; n 9)".

**Referências.**
- Catálogo: [Recharts, Scatter And Line Of Best Fit](https://recharts.github.io/en-US/examples/ScatterAndLineOfBestFit/): observar o array único com chaves de pontos e de reta e a `Line` sem ponto nem legenda.
- Catálogo: [Vega-Lite, Linear Regression](https://vega.github.io/vega-lite/examples/layer_point_line_regression.html): observar as três camadas (pontos, reta, texto de R²).
- Catálogo: [Recharts, API do Scatter](https://recharts.github.io/en-US/api/Scatter/): observar `lineType` `fitting` como atalho de regressão.
- Praticante: [Datawrapper Academy, how to create a scatter plot](https://www.datawrapper.de/academy/how-to-create-a-scatter-plot): observar a regra de não usar tendência quando a nuvem é espalhada.
- Portal de design: busca no [Behance por scatter plot dashboard](https://www.behance.net/search/projects/scatter%20plot%20dashboard) trouxe só dashboards genéricos, sem peça de tendência dedicada; fica sem referência de portal.

---

## 3. Tendência com faixa de confiança

**Descrição.** Acrescenta à reta a faixa de confiança da média estimada. Mostra que a inclinação tem incerteza e
que ela cresce nas pontas do intervalo de X.

**Anatomia.** Pontos neutros; faixa translúcida em volta da reta, mais larga nas extremidades; reta sólida;
subtítulo "faixa de 95% da média estimada".

**Abordagem na stack.** `recharts-custom`: `ComposedChart` com `Area` de faixa (o `dataKey` devolve o par
`[baixo, alto]`), `Line` da reta e `Scatter`. A faixa é calculada em uma grade de 30 valores de X.

```ts
export function faixaMedia(fit: NonNullable<ReturnType<typeof minimosQuadrados>>, pts: Par[], xs: number[], t = 1.96) {
  const res = pts.reduce((s, p) => s + (p.y - (fit.intercepto + fit.inclinacao * p.x)) ** 2, 0);
  const s = Math.sqrt(res / (fit.n - 2));
  return xs.map((x) => {
    const yhat = fit.intercepto + fit.inclinacao * x;
    const e = t * s * Math.sqrt(1 / fit.n + (x - fit.mx) ** 2 / fit.sxx);
    return { x, tendencia: yhat, faixa: [yhat - e, yhat + e] as [number, number] };
  });
}
```

**Ponto delicado.** A faixa é da média, não dos pontos; o leitor tende a achar que os pontos deveriam cair dentro
dela. Quando a pergunta for "este ponto está fora do padrão", usar o intervalo de predição (troca `1 / n` por
`1 + 1 / n`), que é bem mais largo, e dizer no subtítulo qual dos dois está desenhado. Com `n` abaixo de 30,
`t = 1,96` subestima a faixa; usar tabela de t.

**Versões sugeridas.**
- **V1 básica: ciclo contra ticket.** Oportunidades ganhas, faixa de 95% da média.
- **V2 com destaque: fora do padrão.** Intervalo de predição em vez da faixa da média, e as oportunidades fora
  dele em `--chart-2` com rótulo.
- **V3 densa do Farol: Produto A e Produto B.** Duas retas e duas faixas com opacidade 0,15 cada; a sobreposição
  das faixas mostra onde os produtos não se distinguem.
- **V4 caso limite: amostra pequena.** Com n abaixo de 10 a faixa não é desenhada e o subtítulo diz "amostra
  insuficiente para faixa (n 6)".

**Referências.**
- Catálogo: [Observable Plot, linear regression](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/linear-regression.md): observar `ci` padrão 0,95, `precision` e a observação de que regressão é direcional.
- Catálogo: [From Data to Viz, scatter](https://www.data-to-viz.com/graph/scatter.html): observar a lista de variações e o alerta de subgrupos.
- Praticante: [Datasaurus Dozen](https://www.research.autodesk.com/publications/same-stats-different-graphs/): observar que estatística igual convive com formas diferentes; faixa e R² não dispensam olhar a nuvem.
- Portal de design: nenhuma peça verificada; o padrão é mais comum em relatório estatístico que em portfólio.

---

## 4. Dispersão com rótulos e destaque

**Descrição.** Dispersão em que poucos pontos escolhidos recebem nome e cor, e o resto vira contexto.

**Anatomia.** Nuvem neutra; pontos destacados em cor com anel; rótulo direto próximo ao ponto; linha guia quando o
rótulo precisa se afastar; opcional, anotação de uma frase.

**Abordagem na stack.** `recharts-custom`: `Scatter` com `shape` próprio que colore pelo campo `destaque` e
`LabelList` com `content` que devolve `null` para quem não é destacado.

```tsx
<Scatter data={ordenadoDestaqueNoFim} shape={<PontoDestaque />}>
  <LabelList
    dataKey="nome"
    content={(p) => (destacados.has(String(p.value)) ? <RotuloComGuia {...p} /> : null)}
  />
</Scatter>
```

**Ponto delicado.** `LabelList` roda para todos os pontos; o filtro fica no `content`. Colisão não é resolvida por
nenhuma das bibliotecas vistas (o exemplo de rótulos do AG Charts só usa `placement: top`). Resolver em
TypeScript: testar 8 posições candidatas em volta do ponto com caixa estimada (largura de ~6,5 px por caractere
a 12 px) e escolher a primeira que não colide com rótulos já colocados nem sai da área do gráfico; se nenhuma
servir, puxar com linha guia. Destacados vão no fim do array para serem desenhados por cima.

**Versões sugeridas.**
- **V1 básica: extremos do time.** 18 executivos por ticket médio (X) e win rate (Y), rótulo só nos 3 de maior
  e nos 3 de menor win rate.
- **V2 com anotação: o contraste.** Seta e texto "Executivo F: maior ticket, menor conversão" posicionados por
  cima do plano, estilo anotação do Datawrapper.
- **V3 densa do Farol: busca de campanha.** 140 campanhas, campo de busca destaca e rotula a escolhida; demais em
  neutro com opacidade 0,3.
- **V4 caso limite: dois destacados no mesmo lugar.** Rótulo combinado "Executivo C e Executivo H" e o tooltip
  lista os dois com os valores.

**Referências.**
- Catálogo: [Recharts, Scatter Chart With Labels](https://recharts.github.io/en-US/examples/ScatterChartWithLabels/): observar o `LabelList` dentro do `Scatter`.
- Catálogo: [Recharts, API do LabelList](https://recharts.github.io/en-US/api/LabelList/): observar que `content` como função é chamado uma vez por item.
- Catálogo: [AG Charts, scatter with labels](https://www.ag-grid.com/charts/gallery/scatter-with-labels/): observar rótulo em todos os pontos com `placement` fixo, sem tratamento de colisão.
- Praticante: [Datawrapper Academy, text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar anotação com e sem seta e ponto de ancoragem para telas pequenas.
- Portal de design: [Behance, Scatter plot charting component](https://www.behance.net/gallery/149202761/Scatter-plot-charting-component): estados de seleção de um componente de dispersão.

---

## 5. Dispersão com linha de identidade

**Descrição.** X é o valor previsto (ou a meta) e Y o realizado, na mesma unidade; a diagonal y = x separa quem
entregou mais do que o previsto (acima) de quem entregou menos (abaixo). É a leitura de calibração do forecast.

**Anatomia.** Plano quadrado; mesmo domínio nos dois eixos; diagonal tracejada rotulada "realizado = previsto";
opcional, duas retas de tolerância; contagem acima e abaixo nos cantos.

**Abordagem na stack.** `recharts-custom`: `ScatterChart` com `ReferenceLine segment` e domínios iguais.

```tsx
const lim = 500;
<ScatterChart responsive style={{ aspectRatio: 1 }}>
  <XAxis type="number" dataKey="previsto" domain={[0, lim]} unit=" mil" />
  <YAxis type="number" dataKey="realizado" domain={[0, lim]} unit=" mil" />
  <ReferenceLine segment={[{ x: 0, y: 0 }, { x: lim, y: lim }]} stroke="var(--line-strong)" strokeDasharray="4 4" ifOverflow="hidden" />
  <Scatter data={fechadas} fill="var(--chart-1)" fillOpacity={0.7} />
</ScatterChart>
```

**Ponto delicado.** Se a área útil não for quadrada, a diagonal não sai a 45° e o leitor lê viés onde não há:
fixar a proporção e reservar a mesma largura para os dois eixos. Tolerância percentual vira duas retas
(`segment` até `lim / 1,15` e até `lim`), não uma faixa retangular. Oportunidades perdidas têm realizado zero e
formam uma linha no chão que puxa a leitura; tratar à parte.

**Versões sugeridas.**
- **V1 básica: forecast contra fechamento.** Oportunidades fechadas no trimestre, valor no forecast de 30 dias
  antes no X e valor fechado no Y.
- **V2 com destaque: faixa de tolerância.** Retas de mais e menos 15%, contagem "62% dentro da tolerância" e os
  pontos fora em `--chart-2`.
- **V3 densa do Farol: calibração por executivo.** Seletor de executivo pinta seus pontos; o subtítulo traz a
  mediana do erro percentual dele contra a do time.
- **V4 caso limite: perdidas.** Oportunidades com realizado zero saem do plano e viram contador lateral "14
  perdidas, R$ 1,9 mi previstos", para não achatar a nuvem.

**Referências.**
- Catálogo: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `segment` para linha entre dois pontos quaisquer e `ifOverflow`.
- Catálogo: [FT Visual Vocabulary, README](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md): observar a dispersão como "forma padrão" de relação entre duas variáveis contínuas.
- Praticante: [Stephen Few, Simple Displays of Complex Quantitative Relationships](http://www.perceptualedge.com/articles/b-eye/complex_relationships.pdf): observar a solução vencedora que plota cada venda com a diferença entre preço pedido e preço obtido, em vez de agregar.
- Portal de design: nenhuma peça verificada com diagonal de identidade.

---

## 6. Bolhas

**Descrição.** Dispersão em que a área de cada círculo codifica uma terceira medida de magnitude.

**Anatomia.** Eixos X e Y; círculos translúcidos com contorno fino na cor do fundo para separar vizinhos; legenda
de tamanho com 3 círculos e valores redondos; tooltip com as três medidas.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart`, `ZAxis` com `range` e `domain`, `Scatter` com dados
ordenados do maior para o menor. Legenda de tamanho em `html-tailwind` ou SVG com a mesma conta.

```tsx
const AREA_MAX = 900; // px²
<ScatterChart responsive>
  <XAxis type="number" dataKey="cpl" name="CPL" unit=" R$" domain={[0, 300]} />
  <YAxis type="number" dataKey="taxaQualif" name="Qualificação" domain={[0, 0.6]} tickFormatter={pct} />
  <ZAxis type="number" dataKey="investimento" name="Investimento" domain={[0, maxInvest]} range={[12, AREA_MAX]} />
  <Scatter data={[...campanhas].sort((a, b) => b.investimento - a.investimento)} fill="var(--chart-1)" fillOpacity={0.5} stroke="var(--surface-raised)" />
</ScatterChart>

// legenda: raio de um círculo cuja área é proporcional ao valor
const raio = (v: number) => Math.sqrt(((v / maxInvest) * AREA_MAX) / Math.PI);
```

**Ponto delicado.** O `range` do `ZAxis` é área; com `domain` automático o menor valor recebe o menor tamanho e a
proporção se perde, por isso `domain` começa em 0. O piso de 12 px² (para a menor não sumir) quebra a
proporção perto de zero: dizer na legenda. O Recharts desenha na ordem do array, então ordenar do maior para o
menor faz as pequenas ficarem visíveis por cima, como o Observable Plot faz por padrão.

**Versões sugeridas.**
- **V1 básica: campanhas.** CPL no X, taxa de qualificação no Y, investimento na área.
- **V2 com destaque: acima do teto.** Três campanhas com CPL acima do teto em `--chart-2`, retas de teto e de
  meta, legenda de tamanho com R$ 5 mil, R$ 20 mil e R$ 50 mil.
- **V3 densa do Farol: três plataformas.** 60 campanhas por plataforma em cor categórica, área pelo número de
  leads, tooltip com CPL qualificado.
- **V4 caso limite: investimento zero e valores muito desiguais.** Campanha orgânica sem investimento vira anel
  tracejado de tamanho mínimo com a nota "sem investimento"; quando o maior valor passa 200 vezes o menor, a
  legenda avisa "bolhas pequenas com tamanho mínimo".

**Referências.**
- Catálogo: [Data Visualisation Catalogue, bubble chart](https://datavizcatalogue.com/methods/bubble_chart.html): observar o alerta de área e não raio e o limite de quantidade de bolhas.
- Catálogo: [Recharts, Bubble Chart](https://recharts.github.io/en-US/examples/BubbleChart/): observar `ZAxis range={[16, 225]}`.
- Catálogo: [Recharts, Three Dim Scatter Chart](https://recharts.github.io/en-US/examples/ThreeDimScatterChart/): observar `ZAxis` com `range={[60, 400]}` e duas séries com `shape` diferente.
- Catálogo: [Observable Plot, dot](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/dot.md): observar escala `sqrt` no raio e ordenação por raio decrescente.
- Catálogo: [ECharts, bubble gradient](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bubble-gradient.ts): observar `Math.sqrt` no `symbolSize` e rótulo só no destaque.
- Praticante: [Storytelling with Data, what is a bubble chart](https://www.storytellingwithdata.com/blog/2021/5/11/what-is-a-bubble-chart): observar a dificuldade de comparar áreas e a recomendação de construir o gráfico em partes.
- Praticante: [From Data to Viz, bubble](https://www.data-to-viz.com/graph/bubble.html): observar a legenda de tamanho obrigatória e a escolha de qual variável vai na área.
- Portal de design: [Behance, Bubble Chart](https://www.behance.net/gallery/156115599/Bubble-Chart): peça editorial de bolhas; a página não descreve o que cada medida codifica.

---

## 7. Bolhas em grade categórica

**Descrição.** Os dois eixos são categorias ordenadas (dia da semana e hora, por exemplo) e a bolha dá o volume
de cada cruzamento. Também conhecido como punch card.

**Anatomia.** Linhas por categoria de Y, colunas por categoria de X, bolha centrada na célula, legenda de tamanho,
destaque de faixa.

**Abordagem na stack.** `recharts-nativo`: o exemplo oficial usa um `ScatterChart` por linha (dia), empilhados, com
`ZAxis` comum; alternativa com um único `ScatterChart` e `YAxis type="category"`.

**Ponto delicado.** O leitor precisa distinguir zero de sem dado: zero é um ponto mínimo, sem expediente é
célula vazia com traço. Se a pergunta for só "onde concentra", mapa de calor lê melhor e cabe em menos espaço.
Com vários gráficos empilhados, fixar o mesmo `ZAxis domain` em todos.

**Versões sugeridas.**
- **V1 básica: agendas por dia e hora.** Agendas marcadas no trimestre por dia útil e hora cheia.
- **V2 com destaque: melhor janela.** Faixa das 10h às 12h de terça a quinta sombreada, com a taxa de
  comparecimento no rótulo.
- **V3 densa do Farol: capacidade da pré-vendas.** Bolha pelos contatos feitos e cor pelo percentual de SLA
  cumprido (escala sequencial de 3 passos).
- **V4 caso limite: fora do expediente.** Sábado e horas antes das 8h viram traço "sem expediente"; hora com
  expediente e zero contato vira ponto mínimo.

**Referências.**
- Catálogo: [Recharts, Bubble Chart](https://recharts.github.io/en-US/examples/BubbleChart/): observar os sete gráficos empilhados, um por dia.
- Catálogo: [ECharts, scatter on single axis](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/scatter-single-axis.ts): observar um eixo único por dia e o tamanho pelo valor.
- Catálogo: [AG Charts, bubble with categories](https://www.ag-grid.com/charts/gallery/bubble-with-categories/): observar os dois eixos categóricos e `minSize`/`maxSize`.
- Portal de design: nenhuma peça verificada.

**Mora melhor em outra família?** Quando só a concentração importa, mapa de calor (15).

---

## 8. Dispersão por categoria

**Descrição.** Duas a cinco nuvens no mesmo plano, cada uma com cor e forma próprias, para comparar posição e
espalhamento dos grupos.

**Anatomia.** Uma série por grupo; forma diferente por série além da cor; legenda clicável que isola um grupo;
opcional, centróide de cada grupo com marcador maior.

**Abordagem na stack.** `recharts-nativo`: um `Scatter` por grupo com `shape` predefinido (`circle`, `diamond`,
`triangle`, `square`, `cross`) e `Legend`.

```tsx
{grupos.map((g, i) => (
  <Scatter key={g.id} name={g.nome} data={g.pontos} shape={FORMAS[i]} fill={`var(--chart-${i + 1})`} fillOpacity={0.65} />
))}
```

**Ponto delicado.** Forma junto com cor mantém a leitura para quem não distingue cores (o Observable Plot baseia
seus símbolos em pesquisa de legibilidade). Grupos com tamanhos muito diferentes: o grande cobre o pequeno, então
desenhar o maior primeiro. Acima de 5 grupos, pequenos múltiplos (modelo 18).

**Versões sugeridas.**
- **V1 básica: origem do lead.** Tempo até o primeiro contato no X e número de interações no Y, com inbound,
  outbound e indicação.
- **V2 com destaque: um grupo em foco.** Indicação em cor, os outros dois em neutro, e o centróide de cada grupo
  marcado.
- **V3 densa do Farol: quatro plataformas.** 300 campanhas em quatro formas e cores, legenda que isola a
  plataforma com clique.
- **V4 caso limite: 11 origens.** Agrupar as 3 maiores e "outras", com botão "abrir em pequenos múltiplos".

**Referências.**
- Catálogo: [Recharts, Scatter Chart With Cells](https://recharts.github.io/en-US/examples/ScatterChartWithCells/): observar o símbolo próprio com `Symbols` escolhendo cor e tipo pelo índice.
- Catálogo: [Observable Plot, dot](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/dot.md): observar os conjuntos de símbolos preenchidos e vazados.
- Praticante: [Datawrapper Academy, customizing your scatter plot](https://datawrapper.de/academy/customizing-your-scatter-plot): observar cor por coluna, legenda de cor, opacidade para sobrepostos e forma por categoria.
- Portal de design: [Behance, UX/UI Design: Data Visualization Library](https://www.behance.net/gallery/124260019/UXUI-Design-Data-Visualization-Library): biblioteca de gráficos para uma empresa de vendas de porte médio; a página não lista os tipos.

---

## 9. Dispersão conectada

**Descrição.** Os pontos de uma entidade são ligados na ordem do tempo, e a linha mostra a trajetória nas duas
medidas.

**Anatomia.** Pontos ligados por segmentos retos; início marcado com anel vazado, fim com ponto cheio e seta;
rótulo de período no início, no fim e nas viradas; eixos com unidade.

**Abordagem na stack.** `recharts-nativo`: `Scatter` com `line` e `lineJointType="linear"` e dados ordenados por
período; seta e rótulos com `LabelList` e `shape` só no último ponto.

**Ponto delicado.** `monotone` suaviza e inventa caminho entre meses; usar `linear`. Mês sem dado precisa quebrar
a linha: dividir em duas séries em vez de ligar por cima do buraco. Desbarats mostra que o leitor perde a noção
de direção e velocidade; oferecer ao lado a mesma informação como duas linhas empilhadas no tempo (família 04).

**Versões sugeridas.**
- **V1 básica: trajetória de uma plataforma.** CPL no X e taxa de qualificação no Y, mês a mês nos últimos 12
  meses.
- **V2 com anotação: a virada.** Rótulo no mês em que o CPL caiu e a qualificação caiu junto: "troca de público
  em 2026-03".
- **V3 densa do Farol: três plataformas.** Três trajetórias viram espaguete; a versão real mostra uma por vez com
  seletor e as outras em traço neutro fino.
- **V4 caso limite: mês sem dado.** Linha interrompida e ponto fantasma tracejado no mês ausente, com a nota "sem
  coleta em 2026-06".

**Referências.**
- Catálogo: [From Data to Viz, connected scatter](https://www.data-to-viz.com/graph/connectedscatter.html): observar o uso para duas variáveis no tempo sem eixo duplo e o alerta de espaguete.
- Catálogo: [Vega-Lite, Connected Scatterplot](https://vega.github.io/vega-lite/examples/connected_scatterplot.html): observar o canal `order` pelo ano, e não pela posição.
- Catálogo: [Recharts, Joint Line Scatter Chart](https://recharts.github.io/en-US/examples/JointLineScatterChart/): observar `line` e `lineJointType` no `Scatter`.
- Praticante: [Nightingale, Connected Scatterplots Make Me Feel Dumb](https://nightingaledvs.com/connected-scatterplots-make-me-feel-dumb/): observar o argumento das quatro coisas mudando ao mesmo tempo e as alternativas empilhada e indexada.
- Portal de design: nenhuma peça verificada.

**Mora melhor em outra família?** Para público não técnico, duas linhas empilhadas ou indexadas (04).

---

## 10. Dispersão de antes e depois com setas

**Descrição.** Cada entidade aparece em dois momentos e uma seta liga a posição antiga à nova. Mostra quem se
moveu, para onde e quanto, nas duas medidas.

**Anatomia.** Ponto de origem pequeno e vazado; seta com cabeça curta até o ponto de destino; cor pela direção
(melhorou, piorou, misto); rótulo só nas maiores mudanças.

**Abordagem na stack.** `svg-puro` sobreposto ao `ScatterChart`: componente filho que converte dado em pixel com
`usePlotArea` e os mesmos domínios dos eixos, e desenha `line` com `marker-end`.

```tsx
function Setas({ itens, dx, dy }: { itens: Movimento[]; dx: [number, number]; dy: [number, number] }) {
  const area = usePlotArea(); // conferir exportação na 3.10
  if (!area) return null;
  const sx = (v: number) => area.x + ((v - dx[0]) / (dx[1] - dx[0])) * area.width;
  const sy = (v: number) => area.y + area.height - ((v - dy[0]) / (dy[1] - dy[0])) * area.height;
  return (
    <g>
      {itens.map((m) => (
        <line key={m.id} x1={sx(m.x0)} y1={sy(m.y0)} x2={sx(m.x1)} y2={sy(m.y1)} stroke={corDirecao(m)} strokeWidth={1.5} markerEnd="url(#seta)" />
      ))}
    </g>
  );
}
```

**Ponto delicado.** A conversão só vale com escala linear e domínio explícito idêntico ao dos eixos. "Melhorou"
depende da métrica: CPL subir é ruim, qualificação subir é bom; a regra de cor vem do registry. Seta muito curta
some sob a cabeça: abaixo de um limiar em pixels, desenhar só o ponto de destino com anel.

**Versões sugeridas.**
- **V1 básica: canais de um trimestre para o outro.** CPL no X e taxa de qualificação no Y, uma seta por canal.
- **V2 com destaque: piorou nas duas.** Setas que foram para CPL maior e qualificação menor em `--negative`, as
  demais em neutro.
- **V3 densa do Farol: 25 campanhas.** Só as setas acima do percentil 75 de deslocamento recebem rótulo; hover
  destaca a seta e mostra os dois valores de cada ponta.
- **V4 caso limite: entidade nova.** Campanha sem trimestre anterior vira ponto com anel e o rótulo "nova".

**Referências.**
- Catálogo: [Observable Plot, arrow](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/arrow.md): observar o exemplo de duas observações por cidade ligadas por seta, cor por direção e as opções `bend`, `headLength` e `inset`.
- Catálogo: [Observable Plot, link](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/link.md): observar o mesmo dado com linha simples e cor pela direção.
- Praticante: [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/): observar componentes próprios como filhos do gráfico e os hooks de área de plotagem.
- Portal de design: nenhuma peça verificada.

---

## 11. Dispersão com barras de erro

**Descrição.** Cada ponto é uma estimativa e carrega um intervalo em X, em Y ou nos dois.

**Anatomia.** Ponto; traço vertical e ou horizontal até os limites; serifas curtas; subtítulo com o tipo de
intervalo (95% de Wilson, desvio padrão).

**Abordagem na stack.** `recharts-nativo`: `Scatter` com um ou dois `ErrorBar` filhos (`direction="y"` e
`direction="x"`). O intervalo é calculado antes e convertido em distâncias.

```ts
export function wilson(k: number, n: number, z = 1.96) {
  if (n === 0) return null;
  const p = k / n, z2 = z * z;
  const centro = (p + z2 / (2 * n)) / (1 + z2 / n);
  const meia = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return { baixo: centro - meia, alto: centro + meia };
}
// ErrorBar recebe distância a partir do ponto: [p - baixo, alto - p]
```

```tsx
<Scatter data={sdrs} fill="var(--chart-1)">
  <ErrorBar dataKey="erroY" direction="y" width={4} stroke="var(--text-muted)" />
</Scatter>
```

**Ponto delicado.** O `dataKey` do `ErrorBar` é distância, não limite absoluto; passar o limite desenha barras
erradas sem erro de compilação. O intervalo de Wilson é assimétrico perto de 0% e 100%. Barras de erro sobre
colunas criam o viés de achar mais provável o que está dentro da barra (Datawrapper); ponto com intervalo evita
esse viés.

**Versões sugeridas.**
- **V1 básica: taxa de agenda por SDR.** X com volume de leads trabalhados, Y com taxa de agenda e intervalo de
  95%.
- **V2 com destaque: diferente do time.** Linha horizontal da taxa do time; SDRs cujo intervalo não cruza a linha
  em `--chart-2`.
- **V3 densa do Farol: erro nos dois eixos.** Oito canais com CPL médio (intervalo pelo desvio entre semanas) no
  X e taxa de qualificação (Wilson) no Y.
- **V4 caso limite: amostra mínima.** Canal com n 3 tem intervalo de quase 0 a 100%; o ponto vira vazado, sem
  barras, e o tooltip diz "amostra insuficiente".

**Referências.**
- Catálogo: [Recharts, API do ErrorBar](https://recharts.github.io/en-US/api/ErrorBar/): observar `direction`, `width` das serifas e o `dataKey` simétrico ou par.
- Catálogo: [ECharts, error scatter on cartesian](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/custom-error-scatter.ts): observar o `renderItem` que desenha intervalo em X e em Y com serifas.
- Catálogo: [Vega-Lite, Error Bars Showing Confidence Interval](https://vega.github.io/vega-lite/examples/layer_point_errorbar_ci.html): observar `extent: ci` calculado pela biblioteca.
- Praticante: [Datawrapper Academy, confidence intervals in column charts](https://www.datawrapper.de/academy/confidence-intervals-error-bars-datawrapper-column-charts): observar o viés "dentro da barra" e os ajustes de opacidade.
- Portal de design: nenhuma peça verificada.

---

## 12. Dispersão com distribuições marginais

**Descrição.** O plano de dispersão ganha um histograma de X acima e um de Y à direita, com os mesmos domínios.

**Anatomia.** Grade de 2 por 2: histograma de X no topo, dispersão ao centro, histograma de Y deitado à direita,
canto vazio com `n`.

**Abordagem na stack.** `recharts-custom` com layout `html-tailwind`: `ScatterChart` central, `BarChart` superior
e `BarChart layout="vertical"` à direita, bins calculados em TypeScript sobre o mesmo domínio.

```tsx
<div className="grid grid-cols-[1fr_96px] grid-rows-[96px_1fr] gap-1">
  <HistogramaX dominio={dx} margem={margemEsquerda} />
  <div />
  <PlanoDispersao dx={dx} dy={dy} />
  <HistogramaY dominio={dy} margem={margemInferior} />
</div>
```

**Ponto delicado.** As margens internas dos três gráficos precisam coincidir ao pixel, senão as barras não se
alinham aos pontos: fixar `margin` e largura do eixo (`width` do `YAxis`) iguais. Com eixo em log na dispersão,
os bins do marginal também são em log.

**Versões sugeridas.**
- **V1 básica: ticket contra ciclo.** Oportunidades ganhas com os dois histogramas.
- **V2 com destaque: seleção cruzada.** Clique numa barra do histograma de ciclo destaca os pontos daquela faixa.
- **V3 densa do Farol: 2.000 leads.** Minutos até o contato (log) e tentativas, pontos com opacidade 0,25; os
  marginais dão a forma que a nuvem esconde.
- **V4 caso limite: cauda longa.** Valores acima do P99 recolhidos numa barra "acima de X" no marginal e num
  marcador na borda do plano.

**Referências.**
- Catálogo: [From Data to Viz, scatter](https://www.data-to-viz.com/graph/scatter.html): observar as distribuições marginais como variação recomendada.
- Catálogo: [ECharts, histogram with custom series](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-histogram.ts): observar histogramas das duas dimensões calculados a partir dos mesmos pontos.
- Portal de design: [Dribbble, Figma infographics: Matrix, distribution, Scatter chart](https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart) (não abriu): kit de dispersão com distribuição citado na varredura de portais do projeto; a página veio sem conteúdo legível.

---

## 13. Dispersão binada em grade

**Descrição.** Os dois eixos são divididos em faixas e cada célula vira um círculo cujo tamanho é a contagem de
pontos. Resolve sobreposição mantendo a sintaxe de dispersão.

**Anatomia.** Grade regular; círculo por célula não vazia; legenda de tamanho em contagem; opcional, cor por uma
taxa média da célula.

**Abordagem na stack.** `recharts-nativo`: bins calculados em TypeScript viram pontos no centro de cada célula,
com `ZAxis dataKey="contagem"` e `domain` a partir de 0.

**Ponto delicado.** A grade precisa ser a mesma entre filtros para a comparação valer; guardar as bordas no
registry. Célula com 1 ponto e célula com 400 ficam desproporcionais: piso visual declarado. Célula vazia não
recebe círculo.

**Versões sugeridas.**
- **V1 básica: leads por fit e engajamento.** Pontuação de fit e de engajamento em 10 faixas cada.
- **V2 com destaque: faixa-alvo.** Células com fit acima de 7 e engajamento acima de 6 em `--chart-2`.
- **V3 densa do Farol: cor pela taxa de agenda.** Tamanho pela contagem e cor sequencial pela taxa de agenda da
  célula.
- **V4 caso limite: célula com poucos leads.** Células com menos de 10 leads ficam só com contorno e a taxa não é
  colorida.

**Referências.**
- Catálogo: [Vega-Lite, 2D Histogram Scatterplot](https://vega.github.io/vega-lite/examples/circle_binned.html): observar os dois eixos binados em até 10 faixas e o tamanho pela contagem.
- Catálogo: [From Data to Viz, 2D density](https://www.data-to-viz.com/graph/density2d.html): observar "útil só se a amostra é enorme" e a sensibilidade ao tamanho da faixa.
- Portal de design: nenhuma peça verificada.

---

## 14. Hexbin

**Descrição.** O plano é ladrilhado por hexágonos e cada um é colorido (ou dimensionado) pela quantidade de pontos
que caem nele.

**Anatomia.** Hexágonos em escala sequencial de cor; legenda de cor com contagem; eixos da dispersão; opcional,
pontos destacados por cima.

**Abordagem na stack.** `svg-puro`: pontos convertidos para pixel, binning hexagonal em TypeScript e `path` por
hexágono.

```ts
export function hexbin(pts: { px: number; py: number }[], r: number) {
  const dx = r * Math.sqrt(3), dy = r * 1.5;
  const bins = new Map<string, { cx: number; cy: number; n: number }>();
  for (const { px, py } of pts) {
    const cand = [Math.floor(py / dy), Math.ceil(py / dy)].map((row) => {
      const col = Math.round(px / dx - (row & 1) / 2);
      const cx = (col + (row & 1) / 2) * dx, cy = row * dy;
      return { key: `${row}:${col}`, cx, cy, d: (px - cx) ** 2 + (py - cy) ** 2 };
    });
    const b = cand[0].d <= cand[1].d ? cand[0] : cand[1];
    const atual = bins.get(b.key) ?? { cx: b.cx, cy: b.cy, n: 0 };
    atual.n += 1;
    bins.set(b.key, atual);
  }
  return [...bins.values()];
}
// vértices de hexágono de ponta para cima: ângulo π/6 + k·π/3, raio r
```

**Ponto delicado.** Hexágono vazio não é desenhado; zero e ausência não se misturam. A escala de cor sequencial
precisa de legenda em contagem, e o maior bin não pode saturar tudo: usar escala por quantis quando a
distribuição é muito concentrada. O Observable Plot recomenda contorno para os menores ficarem visíveis. Recalcular
no resize, porque o raio é em pixels.

**Versões sugeridas.**
- **V1 básica: leads do semestre.** Tempo até o contato e tentativas, raio de 10 px.
- **V2 com destaque: um SDR por cima.** Hexágonos do time em escala neutra, pontos do SDR selecionado por cima em
  `--chart-1`.
- **V3 densa do Farol: 40 mil interações de marketing.** Horas desde a última interação e pontuação de
  engajamento, cor por quantis.
- **V4 caso limite: um hexágono concentra metade.** Escala por quantis e rótulo no hexágono dominante com a
  contagem.

**Referências.**
- Catálogo: [Observable Plot, hexbin](https://raw.githubusercontent.com/observablehq/plot/main/docs/transforms/hexbin.md): observar `binWidth` em pixels, saídas `fill` e `r` e a dica de contorno.
- Catálogo: [RAWGraphs, hexagonal binning (metadata)](https://raw.githubusercontent.com/rawgraphs/rawgraphs-charts/master/src/hexagonalBinning/metadata.js): observar a descrição "densidade em vez de pontos" por cor ou área.
- Catálogo: [From Data to Viz, 2D density](https://www.data-to-viz.com/graph/density2d.html): observar hexbin, histograma 2D e contorno como as três formas da família.
- Portal de design: nenhuma peça verificada.

---

## 15. Contorno de densidade 2D

**Descrição.** Curvas de nível sobre a nuvem mostram onde a concentração é maior, como um mapa topográfico.

**Anatomia.** Linhas de contorno (ou faixas preenchidas) em escala sequencial; pontos opcionais bem apagados;
legenda "mais denso".

**Abordagem na stack.** `svg-puro`: estimativa de densidade gaussiana numa grade em pixels e marching squares para
extrair as isolinhas. Custo de implementação alto; o Farol usa hexbin (modelo 14) antes e só implementa contorno
se a leitura de picos for essencial.

**Ponto delicado.** Largura de banda muda a conclusão (From Data to Viz); fixar no registry e manter igual entre
facetas, como o Observable Plot faz com os limiares. Grade de 100 por 100 com 40 mil pontos custa 400 milhões de
operações: calcular em Web Worker ou no servidor.

**Versões sugeridas.**
- **V1 básica: onde se concentram os leads qualificados.** Fit e engajamento com 8 níveis de contorno.
- **V2 com destaque: dois grupos.** Contornos de inbound e outbound em duas cores, só linha, sem preenchimento.
- **V3 caso limite: amostra pequena.** Abaixo de 500 pontos o contorno é trocado automaticamente pela dispersão
  simples com aviso.

**Referências.**
- Catálogo: [Observable Plot, density](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/density.md): observar `bandwidth` padrão de 20 px, `thresholds` e a analogia com mapa topográfico.
- Catálogo: [From Data to Viz, 2D density](https://www.data-to-viz.com/graph/density2d.html): observar "brinque com a largura de banda" e o alerta de amostra pequena.
- Portal de design: nenhuma peça verificada.

**Mora melhor em outra família?** Densidade 2D em grade regular é mapa de calor (15).

---

## 16. Envoltória por grupo

**Descrição.** Cada grupo recebe um polígono convexo que envolve seus pontos, marcando o território.

**Anatomia.** Polígono translúcido por grupo na cor do grupo; pontos por cima; rótulo do grupo junto ao polígono.

**Abordagem na stack.** `recharts-custom`: `ScatterChart` com as séries e um filho próprio que converte os pontos
para pixel (mesma técnica do modelo 10) e desenha o casco calculado em TypeScript.

```ts
export function cascoConvexo(p: [number, number][]) {
  const pts = [...p].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cruz = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const meia = (lista: [number, number][]) => {
    const h: [number, number][] = [];
    for (const q of lista) {
      while (h.length >= 2 && cruz(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    return h;
  };
  const inferior = meia(pts), superior = meia([...pts].reverse());
  return inferior.slice(0, -1).concat(superior.slice(0, -1));
}
```

**Ponto delicado.** Calcular o casco em pixels (depois da escala), não em unidade de dado, para funcionar com log.
Um outlier estica o polígono e dá a impressão de território enorme: oferecer o casco dos pontos entre P5 e P95.
Polígonos sobrepostos com opacidade acima de 0,15 viram lama.

**Versões sugeridas.**
- **V1 básica: produtos.** Oportunidades de Produto A e Produto B por ticket e ciclo, com casco de cada um.
- **V2 com destaque: casco sem extremos.** Casco dos pontos entre P5 e P95, extremos em pontos vazados.
- **V3 caso limite: grupo com 2 pontos.** Sem casco possível; desenhar segmento entre os dois com o rótulo "2
  oportunidades".

**Referências.**
- Catálogo: [RAWGraphs, convex hull (metadata)](https://raw.githubusercontent.com/rawgraphs/rawgraphs-charts/master/src/convexHull/metadata.js): observar a definição e o uso para "identificar pontos da mesma categoria".
- Catálogo: [RAWGraphs, pasta de gráficos](https://github.com/rawgraphs/rawgraphs-charts/tree/master/src): observar `convexHull`, `hexagonalBinning` e `contourPlot` como gráficos de correlação do mesmo acervo.
- Portal de design: nenhuma peça verificada.

---

## 17. Matriz de dispersão

**Descrição.** Grade com uma dispersão para cada par de medidas; a diagonal traz a distribuição de cada uma.

**Anatomia.** Grade de N por N; diagonal com histograma; células pequenas sem rótulo de eixo interno; rótulos só
na borda; seleção numa célula destaca os mesmos pontos em todas.

**Abordagem na stack.** `html-tailwind` com `grid` e `ScatterChart` pequenos (`isAnimationActive={false}`), estado
de seleção compartilhado em React.

**Ponto delicado.** Cada coluna usa o mesmo domínio de X em todas as linhas, e cada linha o mesmo de Y; senão a
comparação entre células mente. Com 5 medidas são 20 gráficos: desligar animação e tooltip nas células e abrir o
par clicado em tamanho grande. Uso de exploração, não de apresentação.

**Versões sugeridas.**
- **V1 básica: quatro medidas de campanha.** Investimento, CPL, CTR e taxa de qualificação.
- **V2 com destaque: seleção cruzada.** Arrastar numa célula destaca as campanhas em todas as outras.
- **V3 caso limite: medida com muitos ausentes.** Coluna de CTR com 30% ausente mostra o `n` de cada célula no
  canto.

**Referências.**
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar a entrada "Interactive Scatterplot Matrix" na seção de visões múltiplas.
- Catálogo: [From Data to Viz, scatter](https://www.data-to-viz.com/graph/scatter.html): observar o correlograma como parente para muitos pares.
- Portal de design: nenhuma peça verificada.

**Mora melhor em outra família?** Correlograma com cor pela correlação vai para mapa de calor (15).

---

## 18. Pequenos múltiplos de dispersão

**Descrição.** A mesma dispersão repetida por grupo, lado a lado, com os mesmos eixos.

**Anatomia.** Painéis do mesmo tamanho; título curto por painel; eixos rotulados só na borda; mediana do grupo
como referência dentro de cada painel.

**Abordagem na stack.** `html-tailwind` com `grid-cols` responsivo e um `ScatterChart` por painel com domínios
compartilhados vindos do conjunto inteiro.

**Ponto delicado.** Domínio compartilhado é a regra que dá sentido ao modelo. Ordem dos painéis por uma medida
(mediana de Y, por exemplo), não alfabética. Em tela estreita os painéis caem para uma coluna e o leitor perde a
comparação: manter no mínimo duas colunas e rolar.

**Versões sugeridas.**
- **V1 básica: executivos.** Ticket contra ciclo, um painel por executivo, oito painéis.
- **V2 com destaque: referência do time.** Nuvem do time inteiro em neutro atrás de cada painel, pontos do
  executivo em cor.
- **V3 densa do Farol: 12 regiões comerciais fictícias.** Painéis ordenados pela mediana do ciclo.
- **V4 caso limite: painel com 2 pontos.** Painel mantém o tamanho, mostra os pontos e escreve "2 oportunidades,
  sem leitura de padrão".

**Referências.**
- Praticante: [Stephen Few, Simple Displays of Complex Quantitative Relationships](http://www.perceptualedge.com/articles/b-eye/complex_relationships.pdf): observar os pequenos múltiplos por bairro com os mesmos eixos e cada venda plotada, que revelam agrupamentos que um agregado esconderia.
- Catálogo: [Vega-Lite, Becker's Barley Trellis Plot](https://vega.github.io/vega-lite/examples/trellis_barley.html): observar painéis ordenados pela mediana.
- Portal de design: nenhuma peça verificada.

---

## 19. Dispersão em escala logarítmica

**Descrição.** Um ou os dois eixos em escala logarítmica, para medidas que variam em ordens de grandeza (tempo de
resposta, ticket, investimento).

**Anatomia.** Marcas do eixo em potências ou em 1, 2, 5; aviso "escala logarítmica" no rótulo do eixo; grade em
cada década.

**Abordagem na stack.** `recharts-nativo`: `XAxis scale="log"` com `domain` explícito positivo e `ticks` fixos.

```tsx
<XAxis type="number" dataKey="minutos" scale="log" domain={[1, 10000]} ticks={[1, 10, 60, 600, 1440, 10000]} tickFormatter={formatarDuracao} />
```

**Ponto delicado.** Zero e negativos não existem em log: o registro com 0 minuto quebra a escala. Tratar antes
(piso de 1 com nota, ou sair do gráfico com contagem). Datawrapper avisa que log é mais difícil de ler; escrever a
escala no eixo e usar marcas em unidades humanas (1 min, 1 h, 1 dia).

**Versões sugeridas.**
- **V1 básica: tempo de resposta.** Minutos até o primeiro contato (log) contra taxa de agenda por lote.
- **V2 com destaque: SLA.** Reta vertical em 15 minutos, rótulo "SLA".
- **V3 densa do Farol: ticket em log nos dois eixos.** Valor previsto contra valor fechado de R$ 5 mil a R$ 5 mi.
- **V4 caso limite: zeros.** 38 leads com resposta instantânea registrada como 0 ficam num marcador na borda
  esquerda "respostas automáticas: 38".

**Referências.**
- Catálogo: [Recharts, API do XAxis](https://recharts.github.io/en-US/api/XAxis/): observar `scale` com `log`, `domain` e `ticks` manuais.
- Praticante: [Datawrapper Academy, customizing your scatter plot](https://datawrapper.de/academy/customizing-your-scatter-plot): observar "log é mais difícil de entender, mas faz sentido com pontos aglomerados".
- Praticante: [Stephen Few, Displaying Change Between Two Points in Time](http://www.perceptualedge.com/articles/visual_business_intelligence/displaying_change_between_two_points_in_time.pdf): observar que em escala log inclinações iguais são taxas iguais.
- Portal de design: nenhuma peça verificada.

---

## 20. Dispersão com zoom e seleção por área

**Descrição.** O leitor arrasta um retângulo na nuvem para ampliar ou selecionar pontos, e a lista ao lado mostra
os selecionados.

**Anatomia.** Retângulo de seleção translúcido; botão "voltar à visão completa"; contador de selecionados; tabela
ou lista lateral.

**Abordagem na stack.** `recharts-custom`: `onMouseDown`, `onMouseMove` e `onMouseUp` do gráfico guardam as
coordenadas, `ReferenceArea` desenha o retângulo, e o `domain` dos eixos passa a vir do estado com
`allowDataOverflow`.

**Ponto delicado.** Ponto de 3 px é alvo ruim para hover; desenhar no `shape` um círculo transparente de raio 8
para captura, ou usar a abordagem de malha de Voronoi do Nivo como referência de comportamento. Em toque não há
hover nem arraste fino: oferecer seleção por filtro numérico além do gesto.

**Versões sugeridas.**
- **V1 básica: ampliar.** Nuvem de 3.000 leads com zoom por arraste.
- **V2 com destaque: selecionar e listar.** Arraste seleciona e a lista lateral mostra os leads com link para o
  CRM fictício.
- **V3 caso limite: seleção vazia.** Retângulo sem pontos mostra "nenhum lead nesta área" e não altera o domínio.

**Referências.**
- Catálogo: [Recharts, API do ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/): observar `x1`, `x2`, `y1`, `y2` em unidade de dado e `ifOverflow`.
- Catálogo: [Nivo, scatterplot](https://nivo.rocks/scatterplot/): observar `useMesh` com Voronoi para capturar interação e a versão em canvas.
- Catálogo: [AG Charts, scatter with large data](https://www.ag-grid.com/charts/gallery/scatter-with-large-data/): observar marcador pequeno com opacidade 0,8 e várias séries em volume alto.
- Portal de design: nenhuma peça verificada.

---

## 21. Bolhas animadas no tempo

**Descrição.** Bolhas que se movem período a período controladas por um seletor de tempo, para narrar a evolução
de posição e tamanho.

**Anatomia.** Plano de bolhas; período atual em marca d'água grande; controle de reprodução e barra de tempo;
rastro opcional da entidade selecionada.

**Abordagem na stack.** `recharts-nativo` para as bolhas (`animationDuration`, `isAnimationActive`) e
`html-tailwind` para o controle de tempo; dados por período trocados no estado.

**Ponto delicado.** A animação precisa casar cada bolha pelo identificador, não pela posição no array; conferir os
valores aceitos por `animationMatchBy` na API do `Scatter` e manter a ordem estável. Entidade que aparece ou some
entre períodos precisa entrar e sair com opacidade, não saltar da origem. SWD recomenda narrar em partes; em
leitura analítica, oferecer o modelo 10 (setas) com os mesmos dados.

**Versões sugeridas.**
- **V1 básica: plataformas mês a mês.** CPL, qualificação e investimento das plataformas A, B e C nos últimos 12
  meses.
- **V2 com destaque: rastro.** Plataforma selecionada deixa rastro dos meses anteriores em pontos pequenos.
- **V3 caso limite: plataforma pausada.** Mês sem investimento: a bolha esmaece para 20% e o rótulo diz "pausada".

**Referências.**
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar as entradas de bolhas no estilo de evolução de países por renda e expectativa de vida.
- Catálogo: [Highcharts, bubble chart](https://www.highcharts.com/demo/highcharts/bubble): observar a demonstração com temas claro e escuro.
- Praticante: [Storytelling with Data, what is a bubble chart](https://www.storytellingwithdata.com/blog/2021/5/11/what-is-a-bubble-chart): observar animação e interatividade como forma de guiar o leitor.
- Portal de design: nenhuma peça verificada.

---

## Modelos vistos nas fontes que moram em outra família

- **Quadrante com linhas de corte e matriz de priorização:** 25.
- **Heatmap XY, correlograma e histograma 2D em grade de cor:** 15.
- **Bolhas empacotadas (sem eixos):** 12.
- **Mapa de bolhas:** 23.
- **Strip plot, jitter e beeswarm (um eixo quantitativo):** 16.
- **Dumbbell e dot plot por categoria:** 17.
- **Linha mais coluna (quantidade e taxa):** 08.

## Fontes consultadas

- FT Visual Vocabulary, README: https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md
- Data Visualisation Catalogue, scatterplot: https://datavizcatalogue.com/methods/scatterplot.html
- Data Visualisation Catalogue, bubble chart: https://datavizcatalogue.com/methods/bubble_chart.html
- Data Viz Project, scatterplot (não abriu, HTTP 403): https://datavizproject.com/data-type/scatterplot/
- From Data to Viz, índice: https://www.data-to-viz.com/
- From Data to Viz, scatter: https://www.data-to-viz.com/graph/scatter.html
- From Data to Viz, connected scatter: https://www.data-to-viz.com/graph/connectedscatter.html
- From Data to Viz, bubble: https://www.data-to-viz.com/graph/bubble.html
- From Data to Viz, 2D density: https://www.data-to-viz.com/graph/density2d.html
- From Data to Viz, overplotting (não abriu, página acima do limite de tamanho): https://www.data-to-viz.com/caveat/overplotting.html
- Recharts, índice de exemplos: https://recharts.github.io/en-US/examples/
- Recharts, Simple Scatter Chart: https://recharts.github.io/en-US/examples/SimpleScatterChart/
- Recharts, Scatter And Line Of Best Fit: https://recharts.github.io/en-US/examples/ScatterAndLineOfBestFit/
- Recharts, Bubble Chart: https://recharts.github.io/en-US/examples/BubbleChart/
- Recharts, Three Dim Scatter Chart: https://recharts.github.io/en-US/examples/ThreeDimScatterChart/
- Recharts, Scatter Chart With Labels: https://recharts.github.io/en-US/examples/ScatterChartWithLabels/
- Recharts, Scatter Chart With Cells: https://recharts.github.io/en-US/examples/ScatterChartWithCells/
- Recharts, Joint Line Scatter Chart: https://recharts.github.io/en-US/examples/JointLineScatterChart/
- Recharts, API Scatter: https://recharts.github.io/en-US/api/Scatter/
- Recharts, API ZAxis: https://recharts.github.io/en-US/api/ZAxis/
- Recharts, API ErrorBar: https://recharts.github.io/en-US/api/ErrorBar/
- Recharts, API ReferenceLine: https://recharts.github.io/en-US/api/ReferenceLine/
- Recharts, API ReferenceArea: https://recharts.github.io/en-US/api/ReferenceArea/
- Recharts, API LabelList: https://recharts.github.io/en-US/api/LabelList/
- Recharts, API XAxis: https://recharts.github.io/en-US/api/XAxis/
- Recharts, guia de customização: https://recharts.github.io/en-US/guide/customize/
- Recharts, guia de migração 3.0: https://github.com/recharts/recharts/wiki/3.0-migration-guide
- shadcn/ui charts (sem dispersão): https://ui.shadcn.com/charts
- Tremor, scatter chart: https://npm.tremor.so/docs/visualizations/scatter-chart
- Observable Plot, dot: https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/dot.md
- Observable Plot, linear regression: https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/linear-regression.md
- Observable Plot, hexbin: https://raw.githubusercontent.com/observablehq/plot/main/docs/transforms/hexbin.md
- Observable Plot, density: https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/density.md
- Observable Plot, arrow: https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/arrow.md
- Observable Plot, link: https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/link.md
- Vega-Lite, galeria: https://vega.github.io/vega-lite/examples/
- Vega-Lite, Linear Regression: https://vega.github.io/vega-lite/examples/layer_point_line_regression.html
- Vega-Lite, Connected Scatterplot: https://vega.github.io/vega-lite/examples/connected_scatterplot.html
- Vega-Lite, 2D Histogram Scatterplot: https://vega.github.io/vega-lite/examples/circle_binned.html
- Vega-Lite, Error Bars Showing Confidence Interval: https://vega.github.io/vega-lite/examples/layer_point_errorbar_ci.html
- Vega-Lite, Becker's Barley Trellis Plot: https://vega.github.io/vega-lite/examples/trellis_barley.html
- Vega-Lite, Bubble Plot: https://vega.github.io/vega-lite/examples/point_bubble.html
- ECharts, bubble gradient: https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bubble-gradient.ts
- ECharts, scatter on single axis: https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/scatter-single-axis.ts
- ECharts, error scatter: https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/custom-error-scatter.ts
- ECharts, histogram with custom series: https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-histogram.ts
- ECharts, scatter regression (não abriu, HTTP 404): https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/scatter-regression.ts
- Highcharts, bubble chart: https://www.highcharts.com/demo/highcharts/bubble
- AG Charts, galeria: https://www.ag-grid.com/charts/gallery/
- AG Charts, scatter with labels: https://www.ag-grid.com/charts/gallery/scatter-with-labels/
- AG Charts, scatter with large data: https://www.ag-grid.com/charts/gallery/scatter-with-large-data/
- AG Charts, bubble with categories: https://www.ag-grid.com/charts/gallery/bubble-with-categories/
- Nivo, scatterplot: https://nivo.rocks/scatterplot/
- RAWGraphs, pasta de gráficos: https://github.com/rawgraphs/rawgraphs-charts/tree/master/src
- RAWGraphs, convex hull (metadata): https://raw.githubusercontent.com/rawgraphs/rawgraphs-charts/master/src/convexHull/metadata.js
- RAWGraphs, hexagonal binning (metadata): https://raw.githubusercontent.com/rawgraphs/rawgraphs-charts/master/src/hexagonalBinning/metadata.js
- Datawrapper Academy, how to create a scatter plot: https://www.datawrapper.de/academy/how-to-create-a-scatter-plot
- Datawrapper Academy, customizing your scatter plot: https://datawrapper.de/academy/customizing-your-scatter-plot
- Datawrapper Academy, text annotations: https://www.datawrapper.de/academy/how-to-create-text-annotations
- Datawrapper Academy, confidence intervals in column charts: https://www.datawrapper.de/academy/confidence-intervals-error-bars-datawrapper-column-charts
- Storytelling with Data, what is a scatterplot: https://www.storytellingwithdata.com/blog/2020/5/27/what-is-a-scatterplot
- Storytelling with Data, what is a bubble chart: https://www.storytellingwithdata.com/blog/2021/5/11/what-is-a-bubble-chart
- Stephen Few, Simple Displays of Complex Quantitative Relationships: http://www.perceptualedge.com/articles/b-eye/complex_relationships.pdf
- Stephen Few, Displaying Change Between Two Points in Time: http://www.perceptualedge.com/articles/visual_business_intelligence/displaying_change_between_two_points_in_time.pdf
- Nightingale, Connected Scatterplots Make Me Feel Dumb: https://nightingaledvs.com/connected-scatterplots-make-me-feel-dumb/
- Nightingale, busca por scatterplot: https://nightingaledvs.com/?s=scatterplot
- Datasaurus Dozen (Same Stats, Different Graphs): https://www.research.autodesk.com/publications/same-stats-different-graphs/
- FlowingData, chart type scatter plot (não abriu, HTTP 403): https://flowingdata.com/charttype/scatter-plot/
- Behance, Scatter plot charting component: https://www.behance.net/gallery/149202761/Scatter-plot-charting-component
- Behance, UX/UI Design: Data Visualization Library: https://www.behance.net/gallery/124260019/UXUI-Design-Data-Visualization-Library
- Behance, Bubble Chart: https://www.behance.net/gallery/156115599/Bubble-Chart
- Behance, busca por scatter plot dashboard: https://www.behance.net/search/projects/scatter%20plot%20dashboard
- Behance, busca por bubble chart data visualization: https://www.behance.net/search/projects/bubble%20chart%20data%20visualization
- Dribbble, Figma infographics Matrix distribution Scatter chart (não abriu, sem conteúdo legível): https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart
- Dribbble, Bubble Chart (não abriu, sem conteúdo legível): https://dribbble.com/shots/2925554-Bubble-Chart
- Dribbble, tag scatter plot (não abriu, sem conteúdo legível): https://dribbble.com/tags/scatter_plot
- Figma Community, busca por scatter plot (não abriu, HTTP 403): https://www.figma.com/community/search?resource_type=mixed&sort_by=relevancy&query=scatter%20plot&editor_type=all

As páginas de exemplo do Observable (notebooks) devolveram HTTP 429 durante a pesquisa e ficaram fora; a
documentação do Observable Plot foi lida pelos arquivos-fonte no repositório oficial.
