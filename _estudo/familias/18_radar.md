# Família 18: radar

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa ou empresa real.

## O que a família responde

Radar (também chamado aranha, teia ou estrela) coloca várias variáveis quantitativas em eixos que saem
do centro, liga os valores e forma um polígono. Responde "qual é o perfil desta entidade em várias
dimensões" e, com cuidado, "este perfil é parecido com aquele". O Data Viz Catalogue lista comparação,
padrão e relação como funções, e já avisa das três fraquezas: polígonos sobrepostos poluem, eixos demais
complicam e comparar valores num eixo reto é mais fácil.

Perguntas típicas no Farol:

- **Comercial:** qual o perfil do executivo em descoberta, proposta, negociação, follow up, CRM em dia e
  precisão de forecast? Ele se parece com a média do time?
- **Pré-vendas:** em quais dimensões (tempo de resposta, tentativas, agenda, qualificação, show rate) a
  fila de inbound difere da fila de outbound?
- **Marketing:** qual o perfil de qualidade de uma origem de lead (cobertura de telefone, e-mail
  corporativo, cargo, fit, resposta, agenda)?
- **Diretoria:** qual a maturidade de cada área nos critérios do plano anual? Em que horas do dia a
  demanda se concentra?

## O que a pesquisa diz, antes de desenhar

A literatura é quase unânime em restringir o radar. Os argumentos que valem para o Farol:

1. **Área engana.** O raio cresce de forma linear e a área cresce ao quadrado; valores altos parecem
   maiores do que são (SWD). Ler área de polígono irregular é difícil, e sobrepostos pior (From Data to
   Viz, SWD).
2. **A forma depende da ordem dos eixos.** Permutar as categorias muda forma, área e ângulos sem mudar
   o dado (Flourish, Nightingale). Grande parte do que o olho vê é escolha editorial.
3. **Linha sugere continuidade** entre categorias que não têm relação de vizinhança (Nightingale).
4. **Preferimos simetria.** Few mostra que polígonos simétricos parecem melhores, mesmo quando o
   perfil desequilibrado tem valores maiores.
5. **Não tem começo nem sentido de leitura**, então ranking não aparece (Few).
6. **Onde o radar se justifica.** Few aceita um caso: dado cíclico, como horas do dia, em que o relógio
   evita cortar 23h59 de 00h00. SWD aceita perfil de um item em várias dimensões para público técnico.
   Flourish aceita comparação de entidades em métricas de escala comum (percentuais, notas).
7. **Alternativas recomendadas.** Barras (Few, Junk Charts), pequenos múltiplos (Few, SWD, Flourish),
   tabela realçada (Junk Charts), coordenadas paralelas (From Data to Viz, SWD, Data Viz Catalogue) e
   variantes radiais sem polígono: colunas radiais, pirulito radial e stellar (Nightingale, Flourish).

## Regras do Farol para esta família

1. Radar só entra como **leitura de perfil**, nunca como ranking ou comparação de magnitude.
2. **5 a 8 eixos.** Menos de 5 vira triângulo ou quadrado sem informação; mais de 8 vira ruído.
3. **No máximo 2 séries sobrepostas** (a entidade e a referência). Três ou mais: pequenos múltiplos
   (modelo 5) ou barras (modelo 10).
4. **Escala comum declarada e fixa.** Nota de 1 a 5 ou índice de 0 a 100, com
   `PolarRadiusAxis domain={[0, 100]}`. Nunca domínio automático, que muda a forma entre filtros.
   Métricas de unidades diferentes só entram normalizadas, com o método escrito no subtítulo.
5. **Ordem dos eixos vem do registry** e é a mesma em todas as telas; dimensões correlatas ficam
   vizinhas.
6. **Centro é zero.** Sem `innerRadius`, que desloca a base e exagera diferenças.
7. **Todo radar tem saída para barras.** Botão "ver como barras" que troca para o modelo 10 com os
   mesmos dados, e tooltip com os valores numéricos de todas as séries.
8. **Dado ausente não colapsa no centro.** Um eixo sem valor desenhado como zero cria uma ponta falsa
   para dentro. Marcar o eixo como "sem dado" e interromper o polígono.

## Base de implementação no Recharts 3.10

- `RadarChart`: `startAngle` padrão 90 e `endAngle` padrão −270, ou seja, primeiro eixo no topo e
  sentido horário; `outerRadius` padrão "80%"; `data` com uma linha por eixo.
- `PolarGrid`: `gridType` "polygon" (padrão) ou "circle"; `radialLines` liga ou desliga os raios;
  `polarRadius` define os níveis; `stroke` e `strokeDasharray` para o tema.
- `PolarAngleAxis`: `dataKey` do nome do eixo; `tick` aceita função de render (o exemplo "label custom"
  do shadcn usa `tspan` para valor e nome em duas linhas e desloca o primeiro rótulo);
  `axisLineType` "polygon" ou "circle".
- `PolarRadiusAxis`: `domain`, `angle`, `tickCount`, `axisLine={false}` para limpar.
- `Radar`: `dataKey`, `fill`, `fillOpacity`, `stroke`, `dot`, `activeDot`, `label`, `connectNulls`,
  `shape` customizável, e ainda `isRange` e `baseLinePoints` (há exemplo oficial "Range Radar Custom
  Animation"; conferir o formato do dado antes de adotar).
- Cores do tema: série foco em `var(--chart-1)` (ciano), referência em `var(--line-strong)` ou
  `var(--chart-2)` (âmbar), grade em `var(--line-subtle)`, rótulos em `var(--text-muted)`.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Radar simples | perfil de uma entidade em 5 a 8 dimensões de mesma escala | ranking ou leitura de magnitude | domínio automático e ordem de eixos arbitrária |
| 2 | Radar comparativo sobreposto | entidade contra uma referência | três ou mais séries | duas áreas opacas escondendo uma à outra |
| 3 | Radar só contorno | várias referências leves, sem peso de área | quando o leitor precisa ver o "tamanho" do perfil | linha fina demais no fundo escuro |
| 4 | Radar com faixa de referência | posição da entidade dentro da faixa do grupo | faixa sem significado para o leitor | faixa desenhada como área opaca cobrindo a série |
| 5 | Radar em pequenos múltiplos | comparar 4 a 12 perfis sem sobreposição | mais de 12 entidades | cada miniatura com domínio próprio |
| 6 | Radar de ciclo | dado naturalmente cíclico (24h, semana, 12 meses) | comparação fina de valores | começar o ciclo fora do topo ou em sentido anti-horário |
| 7 | Stellar chart | forma radial chamativa mantendo leitura por distância | leitura exata de valores | espeto largo demais virando área |
| 8 | Colunas radiais e rosa | valores por categoria cíclica com apelo visual | comparação precisa | raio linear quando a leitura é área |
| 9 | Pirulito radial | muitas dimensões com leitura por distância | poucos eixos (use barras) | rótulos girados ilegíveis |
| 10 | Barras paralelas por dimensão | alternativa recomendada ao radar comparativo | dimensões de unidades diferentes | ordenar as dimensões de forma diferente do radar ao alternar |
| 11 | Pequenos múltiplos de barras por métrica | métricas com escalas diferentes por entidade | poucas entidades e uma métrica | eixo comum entre painéis de unidades diferentes |
| 12 | Dot plot por dimensão | notas de várias entidades por dimensão | uma entidade só | pontos sobrepostos sem tratamento |
| 13 | Coordenadas paralelas | muitos perfis e padrões de grupo | leitores sem hábito do gráfico | eixos com escalas diferentes sem rótulo de mínimo e máximo |
| 14 | Tabela realçada de perfil | quando o leitor precisa dos valores exatos por dimensão | muitas entidades e dimensões (use heatmap) | realce que ninguém explica |

---

## 1. Radar simples

**Descrição.** Um polígono preenchido para uma entidade, com os eixos das dimensões saindo do centro.
É a forma de entrada da família e a única que o Farol usa sem par de referência.

**Anatomia.** Grade de níveis (polígono ou círculo); raios dos eixos; rótulo de cada eixo na ponta;
escala radial com 3 a 5 níveis rotulados em um único ângulo; polígono com preenchimento translúcido e
contorno; pontos nos vértices; tooltip com os valores.

**Abordagem na stack.** `recharts-nativo`: `RadarChart`, `PolarGrid`, `PolarAngleAxis`,
`PolarRadiusAxis` e um `Radar`.

```tsx
<RadarChart data={perfil} outerRadius="72%">
  <PolarGrid stroke="var(--line-subtle)" />
  <PolarAngleAxis dataKey="dimensao" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
  <PolarRadiusAxis domain={[0, 100]} tickCount={5} angle={90} axisLine={false} tick={false} />
  <Radar dataKey="indice" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.28} dot={{ r: 3 }} />
</RadarChart>
```

**Ponto delicado.** Rótulos dos eixos colidem com o contorno do cartão nos ângulos laterais; reservar
`outerRadius` entre 65% e 75% e quebrar nomes longos em duas linhas com `tspan` num `tick` customizado.
Com eixo nulo, `connectNulls` liga os vizinhos e esconde a ausência; preferir quebrar o polígono e
marcar o rótulo do eixo com "sem dado".

**Versões sugeridas.**
- **V1 básica: perfil de qualidade da origem "formulário do site".** Seis eixos em índice de 0 a 100:
  telefone 58, e-mail corporativo 41, cargo 36, fit 62, resposta 47, agenda 22.
- **V2 com destaque: perfil do SDR 04 no trimestre com valor nos vértices.** Grade circular
  (`gridType="circle"`), rótulo de valor em cada ponto e o eixo mais fraco (show rate) em âmbar.
- **V3 densa do Farol: maturidade do processo comercial.** Oito critérios da diretoria com nomes
  longos quebrados em duas linhas e nota de 1 a 5 no tooltip.
- **V4 caso limite: eixo sem dado e unidades diferentes.** Eixo "precisão de forecast" sem medição
  (polígono interrompido e rótulo "sem dado"); subtítulo "índices normalizados de 0 a 100 pelo
  percentil no time" porque as métricas originais têm unidades diferentes.

**Referências.**
- Catálogo: [Data Viz Catalogue, radar chart](https://datavizcatalogue.com/methods/radar_chart.html): observar as limitações listadas e a recomendação de poucas variáveis.
- Catálogo: [Recharts, Simple Radar Chart](https://recharts.github.io/en-US/examples/SimpleRadarChart/): observar a composição mínima `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis` e `Radar`.
- Catálogo: [shadcn/ui, radar com grade circular (código)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-grid-circle.tsx): observar `gridType="circle"`, `fillOpacity={0.6}` e pontos com `fillOpacity: 1`.
- Praticante: [Stephen Few, Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar o mesmo dado em radar e em barras e o argumento sobre ranking.
- Portal de design: [Behance, seleção de radar charts](https://www.behance.net/gallery/116913831/Selection-of-radar-charts): coleção de estilos de radar; observar variações de grade e preenchimento (só metadados em texto verificados).

---

## 2. Radar comparativo sobreposto

**Descrição.** Duas séries no mesmo radar: a entidade e uma referência (média do time, meta, período
anterior). A diferença de forma aponta onde a entidade se afasta da referência.

**Anatomia.** Igual ao modelo 1, mais uma segunda série com estilo distinto (preenchida e contorno, ou
duas opacidades diferentes), legenda e tooltip com as duas séries e a diferença.

**Abordagem na stack.** `recharts-nativo`: dois `Radar` e `Legend`; tooltip do kit (`ChartTooltip.tsx`)
com linha de diferença calculada.

**Ponto delicado.** Opacidades iguais escondem uma série atrás da outra. O AG Charts usa 0,4 e 0,6 em
duas áreas; no fundo escuro do Farol funciona melhor a série foco preenchida (0,28) e a referência só em
contorno tracejado. A série desenhada por último fica por cima: a referência vem antes no JSX.

**Versões sugeridas.**
- **V1 básica: Executivo 07 contra a média do time.** Executivo em ciano preenchido, média em contorno
  tracejado `var(--line-strong)`.
- **V2 com destaque: Plataforma A contra Plataforma B em seis indicadores de mídia.** Índices de 0 a
  100 (CTR, CPL invertido, CPL qualificado invertido, taxa de agenda, cobertura de dado, frequência),
  com legenda e tooltip com as duas.
- **V3 caso limite: três séries muito próximas.** Três trimestres quase idênticos geram emaranhado;
  a versão esmaece as séries não focadas ao passar o ponteiro na legenda e oferece "ver como barras".

**Referências.**
- Catálogo: [Recharts, Specified Domain Radar Chart](https://recharts.github.io/en-US/examples/SpecifiedDomainRadarChart/): observar duas séries com `fillOpacity={0.6}` e `domain={[0, 150]}` fixo.
- Catálogo: [AG Charts, radar area com rótulos](https://www.ag-grid.com/charts/gallery/radar-area-with-labels/): observar opacidades diferentes por série e rótulos só na primeira.
- Praticante: [Storytelling with Data, o que é um spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): observar a recomendação de pequenos múltiplos quando as sobreposições poluem.
- Portal de design: [Behance, Analytics Spider (Radar) Chart em D3](https://www.behance.net/gallery/38231429/Analytics-Spider-%28Radar%29-Chart-D3js): projeto de radar analítico; observar tratamento de interação e comparação (só metadados em texto verificados).

---

## 3. Radar só contorno

**Descrição.** Séries sem preenchimento, só linha e pontos. É a resposta ao dilema "preenchido ou
contorno": contorno quando há várias referências leves e o leitor compara forma; preenchido quando uma
série é o foco e o volume do perfil importa.

**Anatomia.** Grade sem raios ou com raios leves; linhas com espessura mínima de 2 px; pontos nos
vértices; legenda com amostra de linha, não de área.

**Abordagem na stack.** `recharts-nativo`: `Radar` com `fillOpacity={0}`, `strokeWidth={2}` e `dot`;
`PolarGrid radialLines={false}` como no exemplo "lines only" do shadcn.

**Ponto delicado.** No tema escuro linha de 1 px some sobre a grade; usar 2 px e grade em
`--line-subtle`. Para distinguir séries sem depender só de cor, variar `strokeDasharray` (contínua,
tracejada, pontilhada).

**Versões sugeridas.**
- **V1 básica: três cenários de meta.** Pessimista, base e otimista em contorno, sem preenchimento,
  eixos de receita, fechamentos, ticket, ciclo, win rate e retenção normalizados.
- **V2 com destaque: foco preenchido, referências em contorno.** Cenário escolhido preenchido em ciano e
  os outros dois em contorno cinza tracejado.
- **V3 caso limite: linhas coincidentes.** Dois cenários iguais em quatro eixos; pontos com tamanhos
  diferentes e tooltip listando as séries coincidentes.

**Referências.**
- Catálogo: [shadcn/ui, radar só linhas (código)](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-lines-only.tsx): observar `fillOpacity={0}`, `strokeWidth={2}` e `radialLines={false}`.
- Catálogo: [AG Charts, radar com marcadores](https://www.ag-grid.com/charts/gallery/radar-with-markers/): observar marcadores com opacidade 0,9 e sem traço, e grade circular.
- Praticante: [From Data to Viz, a armadilha do spider chart](https://www.data-to-viz.com/caveat/spider.html): observar o problema da ordem dos eixos e da escala comum.
- Portal de design: [Behance, Radar Chart](https://www.behance.net/gallery/132957557/Radar-Chart): peça de radar para web; observar espessura e contraste de linha (só metadados em texto verificados).

---

## 4. Radar com faixa de referência

**Descrição.** Em vez de uma série de referência, uma faixa: a coroa entre o mínimo e o máximo do grupo
(ou entre o piso e o alvo da meta) em cada eixo, com a entidade desenhada como linha por cima. Responde
"em quais dimensões ele está fora do normal do time".

**Anatomia.** Coroa translúcida entre dois polígonos; série foco em linha com pontos; vértices fora da
faixa marcados; legenda "faixa do time (mínimo a máximo)".

**Abordagem na stack.** `recharts-custom`. Caminho mais seguro: um `Radar` para o máximo com `shape`
customizado que recebe os pontos e desenha a coroa como um único `path` com `fill-rule="evenodd"`
(polígono externo do máximo e interno do mínimo), mais um `Radar` normal para a entidade. O `isRange`
nativo existe no Recharts 3; validar o formato do dado no exemplo oficial antes de trocar o `shape`.

```ts
type P = { x: number; y: number };
export function coroa(externo: P[], interno: P[]): string {
  const anel = (ps: P[]) => ps.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join('') + 'Z';
  return anel(externo) + anel([...interno].reverse());
}
```

**Ponto delicado.** Duas áreas empilhadas (máximo preenchido e mínimo com a cor do fundo por cima)
parecem funcionar, mas quebram com transparência e com a grade, que some dentro do mínimo. A coroa em
`evenodd` mantém a grade visível. A faixa precisa de n suficiente: com 3 executivos, mínimo e máximo
são os próprios executivos.

**Versões sugeridas.**
- **V1 básica: Executivo 07 dentro da faixa do time.** Coroa entre mínimo e máximo de 11 executivos em
  seis dimensões, executivo em linha ciano.
- **V2 com destaque: faixa de meta aceitável.** Coroa entre piso e alvo por dimensão de qualidade de
  lead; vértices da origem abaixo do piso em âmbar com rótulo do valor.
- **V3 caso limite: faixa degenerada.** Dimensão em que todos têm o mesmo valor (coroa vira linha) e
  grupo com n = 3 (aviso "faixa com 3 executivos").

**Referências.**
- Catálogo: [Recharts, API do Radar](https://recharts.github.io/en-US/api/Radar/): observar `shape`, `isRange` e `baseLinePoints`.
- Catálogo: [AG Charts, radar com marcadores](https://www.ag-grid.com/charts/gallery/radar-with-markers/): observar linhas cruzadas semitransparentes marcando fronteiras de domínio no raio.
- Praticante: [Flourish, radar charts para histórias de dados](https://flourish.studio/blog/create-online-radar-spider-charts/): observar o uso para análise de lacuna (gap) e o alerta sobre ordem dos eixos.
- Portal de design: sem referência específica verificada.

---

## 5. Radar em pequenos múltiplos

**Descrição.** Um radar pequeno por entidade, lado a lado, todos com os mesmos eixos, a mesma ordem e o
mesmo domínio. Troca a sobreposição por repetição, que é o conselho de SWD, Flourish e Few.

**Anatomia.** Grade de miniaturas com título de entidade; eixos rotulados só na primeira miniatura ou em
legenda comum; referência opcional em contorno em todas.

**Abordagem na stack.** `recharts-nativo`: um `RadarChart` por célula de um grid Tailwind, com `data`
e `domain` compartilhados; o `SmallMultiples.tsx` do kit define o padrão de grade e título.

**Ponto delicado.** Domínio fixo idêntico em todas as miniaturas, senão a comparação entre elas é
falsa. Rótulos de eixo em cada miniatura poluem; manter só o índice numérico dos eixos e uma legenda de
eixos. Ordenar as miniaturas por um critério declarado (média do índice, por exemplo).

**Versões sugeridas.**
- **V1 básica: perfil de 8 SDRs.** Oito radares de 160 px, domínio de 0 a 100, ordenados pelo índice
  médio.
- **V2 com destaque: média do time em contorno em cada miniatura.** Série do SDR preenchida e média
  tracejada, com o SDR abaixo da média em mais eixos marcado no título.
- **V3 caso limite: 20 entidades.** Miniaturas pequenas demais para ler; a versão mostra o aviso e
  recomenda o heatmap de perfil da família 15 (modelo 13).

**Referências.**
- Praticante: [Flourish, radar charts](https://flourish.studio/blog/create-online-radar-spider-charts/): observar a alternância entre grade de pequenos múltiplos e visão individual.
- Praticante: [Storytelling with Data, spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): observar pequenos múltiplos como saída para várias séries.
- Praticante: [Stephen Few, radar graphs](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar a proposta de gráficos separados por medida em vez de polígonos sobrepostos.
- Portal de design: sem referência específica verificada.

---

## 6. Radar de ciclo

**Descrição.** Eixos que representam posições de um ciclo (24 horas, 7 dias, 12 meses). É o único caso
em que Few aceita o radar: o formato de relógio preserva a continuidade entre o fim e o começo do ciclo.

**Anatomia.** 12 a 24 eixos com rótulos esparsos (0h, 6h, 12h, 18h); início no topo e sentido horário;
grade circular; série em linha ou área leve.

**Abordagem na stack.** `recharts-custom`: `RadarChart` com o `startAngle` e `endAngle` padrão (topo e
horário), `PolarGrid gridType="circle"` e `PolarAngleAxis` com `tick` que só desenha os rótulos de
quarto de ciclo.

**Ponto delicado.** Few alerta que o relógio de 24 horas exige ajuste de percepção e que a linha
horizontal lê melhor; o radar de ciclo só vence quando a mensagem é a continuidade (madrugada ligada à
noite). Com 12 meses e ano parcial, meses futuros ficam ausentes, não zero.

**Versões sugeridas.**
- **V1 básica: entradas de lead por hora do dia.** 24 eixos, média por hora, área leve em ciano.
- **V2 com destaque: dia útil contra fim de semana.** Dia útil preenchido, fim de semana em contorno
  âmbar, anotação na madrugada "atividade de fim de semana começa às 21h".
- **V3 caso limite: 12 meses com ano parcial.** Setembro a dezembro de 2026 ausentes (polígono aberto e
  rótulo "a medir"), não recolhidos ao centro.

**Referências.**
- Praticante: [Stephen Few, radar graphs](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar a figura de acessos médios por hora como relógio de 24 horas e a ressalva.
- Catálogo: [Highcharts, polar (radar) chart](https://www.highcharts.com/docs/chart-and-series-types/polar-chart): observar `pane.startAngle` com 0 no norte e `pointPlacement`.
- Catálogo: [Recharts, API do RadarChart](https://recharts.github.io/en-US/api/RadarChart/): observar `startAngle` 90 e `endAngle` −270 como padrão.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Quando a leitura precisa de dia e hora juntos, o heatmap de dia por
hora (família 15) ou o heatmap radial de 24 horas (15, modelo 14).

---

## 7. Stellar chart

**Descrição.** Proposto por Alexandre Morin-Chassé na Nightingale: cada dimensão vira um espeto
afinado que sai do centro até o valor, sem polígono ligando os eixos. Mantém o apelo radial, elimina
a área e a linha falsa entre categorias e preserva a forma de estrela independentemente da quantidade
de eixos.

**Anatomia.** Grade circular leve; um espeto por eixo (triângulo fino com base no centro e ponta no
valor); ponto na ponta opcional; rótulo do eixo e do valor na ponta; círculo tracejado de referência
opcional.

**Abordagem na stack.** `svg-puro`. A geometria cabe em uma função:

```ts
export function espeto(cx: number, cy: number, i: number, n: number, r: number, meiaBase = 3) {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / n; // primeiro eixo no topo, sentido horário
  const ponta = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const perp = a + Math.PI / 2;
  const b1 = [cx + meiaBase * Math.cos(perp), cy + meiaBase * Math.sin(perp)];
  const b2 = [cx - meiaBase * Math.cos(perp), cy - meiaBase * Math.sin(perp)];
  return `M${b1.join(',')} L${ponta.join(',')} L${b2.join(',')} Z`;
}
```

**Ponto delicado.** A base do espeto precisa ser estreita (2 a 4 px de meia base); base larga volta a
ser área. Valor zero some; manter um ponto no centro do eixo e o rótulo "0". Rótulos nas pontas colidem
quando os valores altos são vizinhos; posicionar os rótulos no raio externo fixo, não na ponta.

**Versões sugeridas.**
- **V1 básica: perfil de competências do Executivo 07.** Seis espetos com índice de 0 a 100.
- **V2 com destaque: valor na ponta e meta em círculo.** Círculo tracejado em 70 como meta e espetos
  abaixo da meta em âmbar, com o valor rotulado.
- **V3 caso limite: zero e vizinhos altos.** Dimensão "precisão de forecast" com 0 (ponto e rótulo) e
  duas dimensões vizinhas com 95 e 97, rótulos no raio externo.

**Referências.**
- Praticante: [Nightingale, The Stellar Chart](https://nightingaledvs.com/the-stellar-chart-an-elegant-alternative-to-radar-charts/): observar os três problemas do radar e a sequência colunas radiais, pirulito radial e stellar.
- Praticante: [Flourish, radar charts](https://flourish.studio/blog/create-online-radar-spider-charts/): observar stellar e barras radiais como saída quando clareza é prioridade.
- Catálogo: [ResearchGate, artigo do Stellar Chart](https://www.researchgate.net/publication/354904488_The_Stellar_Chart_An_Elegant_Alternative_to_Radar_Charts) (não abriu): versão acadêmica do mesmo autor.
- Portal de design: sem referência específica verificada.

---

## 8. Colunas radiais e rosa

**Descrição.** Setores de ângulo igual, um por categoria, com o raio pelo valor. Com raio linear são as
colunas radiais que a Nightingale apresenta como alternativa ao radar; com área proporcional (raio pela
raiz) é a rosa de Nightingale. Uma barra por categoria, sem polígono.

**Anatomia.** Setores de ângulo igual com pequeno vão; grade circular; rótulos por setor; valor no
tooltip ou na ponta.

**Abordagem na stack.** `svg-puro`: cada setor com o `setorAnular` da família 15 (raio interno zero). O
Recharts faz barras concêntricas (`RadialBarChart`), que é outro gráfico e não serve aqui.

**Ponto delicado.** O Data Viz Catalogue aponta a distorção das formas polares: barras mais afastadas
parecem maiores. Declarar se o raio é linear ou por área. Serve para categorias cíclicas (meses);
para categorias sem ordem, barras retas vencem.

**Versões sugeridas.**
- **V1 básica: leads por mês de 2026 em rosa.** Doze setores, área proporcional ao volume.
- **V2 caso limite: linear contra área.** Mesmo dado nas duas escalas lado a lado, mostrando que no raio
  linear o mês de pico parece quatro vezes maior quando é o dobro.

**Referências.**
- Catálogo: [Data Viz Catalogue, radial bar chart](https://datavizcatalogue.com/methods/radial_bar_chart.html): observar o alerta sobre barras externas parecerem mais longas.
- Praticante: [Nightingale, The Stellar Chart](https://nightingaledvs.com/the-stellar-chart-an-elegant-alternative-to-radar-charts/): observar a coluna radial com zero no centro como primeira alternativa.
- Catálogo: [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): observar a seção Nightingale com série simples, múltiplas séries e invertida.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Sim: colunas radiais e rosa pertencem à família 07 (rosca e radial);
entram aqui só como alternativa ao radar.

---

## 9. Pirulito radial

**Descrição.** Linha fina do centro até o valor com um círculo na ponta, uma por dimensão. É a coluna
radial com menos tinta, útil quando há muitas dimensões (10 a 20) e o polígono seria ilegível.

**Anatomia.** Grade circular com níveis rotulados; hastes finas; círculos nas pontas; rótulos das
dimensões no raio externo.

**Abordagem na stack.** `svg-puro`: `line` do centro ao ponto e `circle` na ponta, com o ângulo da
função do stellar.

**Ponto delicado.** Com muitas dimensões, rótulos girados ficam ilegíveis; manter texto horizontal
ancorado pelo quadrante (`textAnchor` start à direita, end à esquerda) e abreviar com tooltip.

**Versões sugeridas.**
- **V1 básica: pontuação por critério de maturidade.** Doze critérios da diretoria com nota de 0 a 100.
- **V2 caso limite: 18 dimensões.** Rótulos abreviados com tooltip e pontas abaixo de 40 destacadas.

**Referências.**
- Praticante: [Nightingale, The Stellar Chart](https://nightingaledvs.com/the-stellar-chart-an-elegant-alternative-to-radar-charts/): observar o pirulito radial como passo intermediário entre colunas radiais e stellar.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Família 07; o pirulito reto é família 02.

---

## 10. Barras paralelas por dimensão

**Descrição.** A alternativa recomendada ao radar comparativo: cada dimensão vira uma linha de barras
horizontais agrupadas (entidade e referência lado a lado), no mesmo eixo. Few mostra o mesmo dado em
radar e em barras e conclui que posição ao longo de um eixo reto é muito mais fácil de comparar; Junk
Charts chega à mesma conclusão.

**Anatomia.** Dimensões no eixo vertical na ordem do registry (ou ordenadas pela diferença); barras
agrupadas por série; eixo comum de 0 a 100; rótulo de valor na ponta; legenda.

**Abordagem na stack.** `recharts-nativo`: `BarChart layout="vertical"` com `YAxis type="category"` e um
`Bar` por série; o `BarsChart.tsx` do kit é a base. O mesmo `data` do radar serve sem transformação, o
que permite o alternador "ver como barras".

**Ponto delicado.** Ao alternar do radar para as barras, manter a ordem das dimensões do radar (senão o
leitor perde a correspondência); a ordenação pela diferença é uma segunda opção explícita. Referência
como traço (bullet) em vez de barra reduz tinta quando há só uma entidade.

**Versões sugeridas.**
- **V1 básica: Executivo 07 contra a média do time.** Seis dimensões, barra ciano do executivo e barra
  cinza da média.
- **V2 com destaque: ordenado pela lacuna.** Dimensões ordenadas da maior diferença negativa para a
  maior positiva, média como traço vertical sobre a barra do executivo.
- **V3 densa do Farol: 4 plataformas por 6 indicadores de mídia.** Barras agrupadas por indicador com
  índice de 0 a 100 e a plataforma selecionada em cor, as demais em neutros.
- **V4 caso limite: unidades diferentes.** Indicadores em R$, % e dias não cabem num eixo comum; a
  versão mostra o aviso e troca para pequenos múltiplos (modelo 11).

**Referências.**
- Praticante: [Stephen Few, radar graphs](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar a figura de barras com os mesmos dados do radar e a leitura de ranking.
- Praticante: [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/): observar a crítica às áreas sobrepostas e a solução por tabela e pequenos múltiplos.
- Catálogo: [From Data to Viz, a armadilha do spider chart](https://www.data-to-viz.com/caveat/spider.html): observar as alternativas cartesianas sugeridas.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Sim: é barra horizontal agrupada da família 02; está documentada aqui
porque é a saída padrão de todo radar do Farol.

---

## 11. Pequenos múltiplos de barras por métrica

**Descrição.** Um painel de barras por métrica, cada um com seu eixo, com as entidades na mesma ordem em
todos os painéis. É a resposta de Few ao radar com eixos de escalas diferentes: comparar todas as
entidades numa métrica e todas as métricas de uma entidade, sem normalização artificial.

**Anatomia.** Grade de painéis com título da métrica e unidade; mesmas entidades e ordem em todos;
entidade foco em cor e demais em neutro; eixo próprio por painel.

**Abordagem na stack.** `recharts-nativo`: um `BarChart` por métrica dentro do `SmallMultiples.tsx` do
kit, com `domain` próprio por painel e `YAxis` categórico compartilhando a ordem.

**Ponto delicado.** Aqui o eixo não é comum entre painéis, ao contrário do modelo 5; cada painel precisa
mostrar unidade e escala. Métrica em que menor é melhor não inverte o eixo (confunde); inverte a
ordenação ou marca "menor é melhor" no título.

**Versões sugeridas.**
- **V1 básica: cinco métricas de mídia por plataforma.** CPL em R$, CTR em %, taxa de agenda em %,
  cobertura de telefone em % e custo total em R$ mil, um painel cada.
- **V2 com destaque: plataforma selecionada.** Plataforma B em ciano em todos os painéis e as demais em
  cinza.
- **V3 caso limite: menor é melhor.** Painel de CPL com "menor é melhor" no título e ordenação crescente,
  mantendo as outras métricas em ordem decrescente.

**Referências.**
- Praticante: [Stephen Few, radar graphs](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar a proposta de cinco gráficos de barras, um por medida, para perfis de concorrentes.
- Praticante: [Storytelling with Data, spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): observar pequenos múltiplos como formato preferível a sobreposição.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Família 02 ou 03 em pequenos múltiplos.

---

## 12. Dot plot por dimensão

**Descrição.** Cada dimensão é uma linha horizontal com um ponto por entidade sobre um eixo comum. Mostra
distribuição e posição relativa em todas as dimensões com pouquíssima tinta, e aceita mais entidades que
o radar.

**Anatomia.** Dimensões no eixo vertical; eixo horizontal comum; pontos por entidade (foco em cor, demais
em neutro); traço da média; variante haltere ligando dois períodos.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart` com `YAxis type="category"` para as dimensões,
`XAxis type="number"` com `domain` fixo e um `Scatter` por série. O haltere (linha entre dois pontos)
precisa de `shape` customizado ou de uma camada SVG por cima.

**Ponto delicado.** Pontos iguais se sobrepõem; aplicar deslocamento vertical pequeno e determinístico
por entidade (não aleatório, para não mudar a cada render). Com muitas entidades, só o foco colorido.

**Versões sugeridas.**
- **V1 básica: nota de cada executivo por dimensão.** Doze executivos em seis dimensões, média como traço.
- **V2 com destaque: haltere entre trimestres.** Executivo 07 com ponto do trimestre anterior vazado,
  ponto atual cheio e linha entre eles.
- **V3 caso limite: empates.** Várias notas iguais a 80 com deslocamento vertical determinístico e
  tooltip listando os empatados.

**Referências.**
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar dot strip plot e dot plot nas categorias Ranking e Distribution.
- Praticante: [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/): observar a comparação direta por dimensão que o radar dificulta.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Família 17 (comparação de pontos).

---

## 13. Coordenadas paralelas

**Descrição.** O radar "desenrolado": dimensões como eixos verticais paralelos, cada entidade como uma
linha que os atravessa. SWD descreve assim; Data Viz Catalogue e From Data to Viz o apontam como
alternativa preferida, e Few sugere a forma mais simples, a linha sobre eixo categórico.

**Anatomia.** Eixos verticais por dimensão com mínimo e máximo rotulados; linhas por entidade; destaque
de uma entidade ou grupo e as demais esmaecidas; ordem dos eixos que minimiza cruzamentos.

**Abordagem na stack.** `svg-puro` quando cada eixo tem escala própria (escala por eixo em TypeScript e
`polyline` por entidade). Com escala comum normalizada, a variante simples é `recharts-nativo` com
`LineChart`, `XAxis` categórico de dimensões e uma `Line` por entidade.

**Ponto delicado.** From Data to Viz lista três erros: linhas demais (espaguete), ordem arbitrária dos
eixos e escala inadequada entre variáveis incomparáveis. O Data Viz Catalogue lembra que só relações
entre eixos vizinhos são fáceis de ver, e que seleção por pincel (brushing) resolve a poluição. SWD
avisa que o público pode ler as escalas não uniformes como se fossem uma só: rotular mínimo e máximo em
cada eixo.

**Versões sugeridas.**
- **V1 básica: perfil de 14 origens em 6 métricas normalizadas.** `LineChart` com eixo categórico e
  índice de 0 a 100.
- **V2 com destaque: uma origem em foco.** "Indicação de cliente" em ciano e as outras 13 em cinza com
  opacidade 0,3.
- **V3 caso limite: escalas próprias por eixo.** SVG com CPL em R$, taxa em % e ciclo em dias, cada eixo
  com mínimo e máximo rotulados e nota "cada eixo tem sua escala".

**Referências.**
- Catálogo: [Data Viz Catalogue, parallel coordinates](https://datavizcatalogue.com/methods/parallel_coordinates.html): observar a limitação de eixos vizinhos e a seleção por pincel.
- Catálogo: [From Data to Viz, parallel coordinates](https://www.data-to-viz.com/graph/parallel.html): observar os quatro métodos de escala, a ordem dos eixos e o destaque contra o espaguete.
- Praticante: [Storytelling with Data, spider chart](https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart): observar a apresentação das coordenadas paralelas como radar desenrolado.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Não há família própria no catálogo; a variante simples é linha
categórica (família 04) e a completa se aproxima da família 17.

---

## 14. Tabela realçada de perfil

**Descrição.** Entidades nas linhas, dimensões nas colunas, valores numéricos com realce do melhor e do
pior por coluna (negrito, cor, símbolo). Junk Charts mostra que, para perguntas como "quem é melhor em
tal dimensão", a tabela realçada vence o radar.

**Anatomia.** Números alinhados à direita; realce do máximo e do mínimo de cada coluna; símbolo para
abaixo do piso; linha fixa da média.

**Abordagem na stack.** `html-tailwind` sobre o `DataTable.tsx` do kit, com as regras de realce da
família 14.

**Ponto delicado.** Realce precisa de legenda ("negrito: melhor da coluna"). Com mais de 10 entidades por
8 dimensões, o realce se perde; trocar por tabela com heatmap (família 14, modelo 2).

**Versões sugeridas.**
- **V1 básica: executivos por dimensão.** Doze executivos em seis dimensões com melhor da coluna em
  negrito e pior com ícone.
- **V2 caso limite: muitas entidades.** 30 SDRs por 8 dimensões com a recomendação de migrar para o
  heatmap de perfil.

**Referências.**
- Praticante: [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/): observar a tabela com cor, negrito e símbolos respondendo "quem é melhor em quê".
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Sim, família 14; está aqui como alternativa documentada ao radar.

---

## Fontes consultadas

Abertas nesta pesquisa (2026-09-14):

- Data Viz Catalogue, radar chart: https://datavizcatalogue.com/methods/radar_chart.html
- Data Viz Catalogue, radial bar chart: https://datavizcatalogue.com/methods/radial_bar_chart.html
- Data Viz Catalogue, parallel coordinates: https://datavizcatalogue.com/methods/parallel_coordinates.html
- From Data to Viz, a armadilha do spider chart: https://www.data-to-viz.com/caveat/spider.html
- From Data to Viz, parallel coordinates: https://www.data-to-viz.com/graph/parallel.html
- FT Visual Vocabulary: https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- Stephen Few, Keep radar graphs below the radar: https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf
- Storytelling with Data, o que é um spider chart: https://www.storytellingwithdata.com/blog/2021/8/31/what-is-a-spider-chart
- Storytelling with Data, guia de gráficos: https://www.storytellingwithdata.com/chart-guide
- Junk Charts, alternativas ao radar: https://www.junkcharts.com/alternatives-to-radar-chart-1/
- Flourish, radar charts: https://flourish.studio/blog/create-online-radar-spider-charts/
- Nightingale, The Stellar Chart: https://nightingaledvs.com/the-stellar-chart-an-elegant-alternative-to-radar-charts/
- Recharts, Simple Radar Chart: https://recharts.github.io/en-US/examples/SimpleRadarChart/
- Recharts, Specified Domain Radar Chart: https://recharts.github.io/en-US/examples/SpecifiedDomainRadarChart/
- Recharts, API do RadarChart: https://recharts.github.io/en-US/api/RadarChart/
- Recharts, API do Radar: https://recharts.github.io/en-US/api/Radar/
- Recharts, API do PolarGrid: https://recharts.github.io/en-US/api/PolarGrid/
- Recharts, API do PolarAngleAxis: https://recharts.github.io/en-US/api/PolarAngleAxis/
- shadcn/ui, radar charts: https://ui.shadcn.com/charts/radar
- shadcn/ui, registro de gráficos (lista de arquivos): https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/charts
- shadcn/ui, radar com grade circular (código): https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-grid-circle.tsx
- shadcn/ui, radar com rótulo customizado (código): https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-label-custom.tsx
- shadcn/ui, radar só linhas (código): https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-lines-only.tsx
- shadcn/ui, radar com eixo de raio (código): https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-radar-radius.tsx
- AG Charts, galeria: https://www.ag-grid.com/charts/gallery/
- AG Charts, radar com marcadores: https://www.ag-grid.com/charts/gallery/radar-with-markers/
- AG Charts, radar area com rótulos: https://www.ag-grid.com/charts/gallery/radar-area-with-labels/
- Highcharts, polar (radar) chart: https://www.highcharts.com/docs/chart-and-series-types/polar-chart
- Highcharts, demo spiderweb: https://www.highcharts.com/demo/highcharts/polar-spider
- Nivo, Radar: https://nivo.rocks/radar/
- visx, exemplo de radar (pasta): https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-radar
- visx, exemplo de radar (código): https://raw.githubusercontent.com/airbnb/visx/master/packages/visx-demo/src/sandboxes/visx-radar/Example.tsx
- Behance, seleção de radar charts: https://www.behance.net/gallery/116913831/Selection-of-radar-charts
- Behance, Analytics Spider (Radar) Chart em D3: https://www.behance.net/gallery/38231429/Analytics-Spider-%28Radar%29-Chart-D3js
- Behance, Radar Chart: https://www.behance.net/gallery/132957557/Radar-Chart
- Behance, monitoramento de dados com heatmaps e radares: https://www.behance.net/gallery/221169407/Data-Monitoring-Merchant-Heatmaps-Radars

Apareceram em busca ou em página aberta, mas não carregaram ou não foram abertas:

- ResearchGate, artigo do Stellar Chart (não abriu): https://www.researchgate.net/publication/354904488_The_Stellar_Chart_An_Elegant_Alternative_to_Radar_Charts
- AG Charts, radar line simples (não abriu): https://www.ag-grid.com/charts/gallery/simple-radar-line/
- AG Charts, Nightingale simples (não abriu): https://www.ag-grid.com/charts/gallery/simple-nightingale/

Observação sobre o visx: o exemplo de radar calcula ângulos e pontos com seno e cosseno e desenha os níveis
da teia com raio `(i + 1) * raio / níveis`; é a mesma geometria que o Farol usa nos modelos em SVG puro
(7, 9 e 13).

Lacunas desta família: Dribbble e Figma Community não renderizaram conteúdo para leitura automática; Data
Viz Project (Ferdio) respondeu com acesso negado; o exemplo oficial "Range Radar Custom Animation" do
Recharts apareceu na lista de exemplos, mas a URL direta não foi encontrada, então o formato de dado do
`isRange` ficou por validar; as páginas do Behance abriram só com metadados em texto.
