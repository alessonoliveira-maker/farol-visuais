# Família 15: mapa de calor e calendário

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa ou empresa real.

## O que a família responde

Mapa de calor codifica um valor pela cor de uma célula posicionada numa grade de duas dimensões
discretas. O Data Viz Catalogue resume: bom para a visão geral e para padrões, ruim para ler valor
exato, porque diferenças finas de tom são difíceis de perceber; por isso a legenda é obrigatória e o
número dentro da célula resolve quando cabe. Few lembra que cor não é o canal mais preciso para
quantidade, mas é o único que deixa uma grade inteira visível de uma vez.

A família reúne três usos que compartilham a mesma geometria:

- **Tempo cíclico:** dia da semana por hora, dia do ano, dia do mês. Pergunta: quando acontece?
- **Matriz de categorias:** executivo por etapa, plataforma por mês, métrica por métrica. Pergunta:
  onde está o extremo, qual o padrão?
- **Coorte:** grupo de entrada por tempo decorrido. Pergunta: grupos novos se comportam melhor que os
  antigos?

Perguntas típicas no Farol:

- **Pré-vendas:** em que dia e hora chegam os leads, e o SDR está disponível nessa janela? Em quais
  dias cada fila estourou o SLA?
- **Comercial:** quais cohorts de oportunidades criadas convertem melhor aos 3 meses? Entre quais
  etapas a oportunidade mais retrocede?
- **Marketing:** em quais meses e plataformas o CPL qualificado disparou? Quais métricas de mídia andam
  juntas?
- **Diretoria:** em que dias do ano a receita reconhecida se concentra? O efeito de fim de mês existe?

## Decisões transversais da família

1. **Tipo de escala segue a pergunta.** Sequencial para magnitude (tokens `--seq-1` a `--seq-7`);
   divergente quando existe ponto de quebra lógico (zero, meta, média), com dois matizes e neutro no
   meio. Few descreve as duas e condena arco-íris: não se percebe ordem entre matizes. O Farol ainda
   não tem tokens divergentes; compor com `--negative`, `--surface-overlay` e `--positive` até existir
   `--div-*`.
2. **Contínua ou em faixas.** Few argumenta que a binagem é herança de limitação técnica e mostra que
   perto de sete faixas as últimas já ficam indistinguíveis. Regra do Farol: faixas (5 a 7) quando a
   leitura é categórica (dentro do SLA, atenção, estouro) ou quando há régua; contínua interpolada com
   `color-mix(in oklab, ...)` entre tokens vizinhos quando a tarefa é ordenar ou comparar extremos.
3. **Tema escuro inverte a intuição.** No fundo escuro, valor alto é o tom mais claro e brilhante;
   `--seq-1` fica perto do fundo. Consequência: valor baixo e "sem dado" podem se confundir. Célula
   ausente sempre com padrão SVG de hachura e borda tracejada, e nunca pintada com `--seq-1`.
4. **Texto na célula com contraste condicional.** Token de texto escolhido por faixa (claro nas faixas
   baixas, escuro nas altas no tema escuro), como o exemplo de texto condicional do Vega-Lite.
5. **Vizinhança engana.** Few mostra que a mesma cor parece mais clara cercada de tons escuros. Um vão
   de 1 a 2 px na cor do fundo entre células reduz o efeito e melhora a leitura de linhas.
6. **Normalizar antes de colorir.** Contagem por dia da semana num mês carrega o número de ocorrências
   do dia (um mês com cinco segundas infla a segunda). Dividir pelo número de ocorrências ou mostrar
   taxa. From Data to Viz lista a falta de normalização como erro comum.
7. **Fuso antes de agregar por hora.** Timestamps convertidos para o fuso da operação antes do
   agrupamento; uma hora errada desloca o pico inteiro.
8. **Ordem de linhas e colunas.** Tempo em ordem natural; categorias ordenadas por total, por régua do
   registry ou por semelhança (modelo 13). Nunca alfabética por padrão.
9. **Um primitivo para quase tudo.** Os modelos 1, 5, 7, 8, 9, 10, 11, 12, 13 e 15 são o mesmo
   componente `HeatGrid` em SVG com props de escala, ordenação, rótulo e margens. Recharts não tem
   heatmap; forçar com `ScatterChart` de formas quadradas funciona mas briga com o layout de eixo
   categórico. SVG com geometria calculada em TypeScript é mais simples e previsível.
10. **Acessível e exportável.** Grade grande não é navegável por leitor de tela célula a célula; cada
    heatmap oferece o alternador "ver como tabela" (família 14) e um `aria-label` com o resumo (maior
    valor, menor valor, janela de pico).

```ts
// Primitivo de escala compartilhado pela família
export type Scale = { kind: 'seq' | 'div'; domain: [number, number]; mid?: number; bins?: number };

export function cellFill(v: number | null, s: Scale): string {
  if (v === null) return 'url(#farol-hatch-ausente)';
  const [lo, hi] = s.domain;
  if (s.kind === 'div') {
    const mid = s.mid ?? 0;
    const t = v >= mid ? (v - mid) / (hi - mid || 1) : (mid - v) / (mid - lo || 1);
    const pct = Math.round(Math.min(1, t) * 100);
    const edge = v >= mid ? 'var(--positive)' : 'var(--negative)';
    return `color-mix(in oklab, ${edge} ${pct}%, var(--surface-overlay))`;
  }
  const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo || 1)));
  const bins = s.bins ?? 7;
  return `var(--seq-${Math.max(1, Math.ceil(t * bins))})`;
}
```

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Heatmap dia da semana por hora | janela de pico de um evento recorrente | poucos eventos por célula (ruído) | contagem bruta sem normalizar pelo número de dias |
| 2 | Punch card (bolhas dia por hora) | volume por janela quando a cor já carrega outra medida | leitores que precisam comparar valores finos | raio proporcional ao valor (área cresce ao quadrado) |
| 3 | Calendário estilo contribuições | atividade diária ao longo de meses ou anos | séries curtas (menos de 8 semanas) | pintar dias futuros ou sem carga como zero |
| 4 | Calendário mensal em grade | leitura de um mês com o número do dia visível | comparação entre muitos meses | semana começando em dia diferente do padrão da operação |
| 5 | Matriz anual dia do mês por mês | efeito de dia do mês (início, fim, quinzena) | dia da semana importa mais que dia do mês | desenhar 30 e 31 de fevereiro como zero |
| 6 | Cohort de conversão em triângulo | grupos de entrada ao longo do tempo decorrido | cohorts de poucos elementos | período em curso lido como queda |
| 7 | Heatmap de correlação | quais métricas andam juntas | poucas observações por par | escala sequencial para correlação com sinal |
| 8 | Matriz categórica genérica | extremos e padrões entre duas dimensões de categoria | unidades diferentes por coluna (use 14) | ordem alfabética escondendo o padrão |
| 9 | Heatmap com totais marginais | padrão da grade e peso de cada linha e coluna | quando os totais não interessam | total entrando na escala de cor do miolo |
| 10 | Heatmap com eixo agrupado | hierarquia curta num eixo (ano e trimestre, canal e origem) | hierarquia com mais de dois níveis | grupos sem separação visual |
| 11 | Lasagna (entidades por tempo) | status ou valor diário de muitas entidades | poucas entidades (use linhas em 04) | entidades antes de existirem pintadas como zero |
| 12 | Heatmap com células de tamanho variável | cor para taxa e tamanho para volume, na mesma grade | público sem hábito de dupla codificação | círculo grande de volume pequeno por escala linear |
| 13 | Heatmap ordenado por semelhança | perfis parecidos entre entidades em várias métricas | leitores que precisam achar uma entidade pelo nome | reordenar a cada filtro sem avisar |
| 14 | Heatmap radial de 24 horas | reforçar a natureza cíclica do dia | comparação precisa entre dias | anéis externos parecendo maiores que os internos |
| 15 | Matriz de transição entre etapas | de onde para onde as entidades se movem | quando só importa o volume por etapa (use 10) | diagonal de permanência dominando a escala |

---

## 1. Heatmap dia da semana por hora

**Descrição.** Grade de 7 linhas (dias) por até 24 colunas (horas), com a cor da célula para volume ou
taxa naquela janela. É o modelo mais pedido para operação: onde está o pico e se a equipe está lá.

**Anatomia.** Eixo de dias à esquerda na ordem da operação (segunda a domingo); eixo de horas no topo
com rótulo a cada 2 ou 3 horas; células com vão de 1 px; legenda de faixas com unidade ("leads por
dia, média"); anotação opcional da janela de pico.

**Abordagem na stack.** `svg-puro` via `HeatGrid`: `x = hora * cw`, `y = dia * ch`, `fill = cellFill()`.
Para 7 por 24 células o SVG é leve; tooltip com o `Tooltip` do Radix já presente em `components/ui`.

**Ponto delicado.** Normalizar pelo número de ocorrências do dia no recorte (média por segunda, não
soma). Converter o fuso antes de agrupar por hora. Separar "fora do expediente" (célula neutra com
rótulo) de "zero no expediente". Poucos eventos por célula geram manchas aleatórias: exigir mínimo de
eventos no recorte ou agregar em blocos de 2 horas.

**Versões sugeridas.**
- **V1 básica: entradas de lead por dia e hora.** Média por ocorrência do dia, das 8h às 20h, escala
  sequencial em 6 faixas.
- **V2 com destaque: pico de entradas contra janela do SDR.** Contorno âmbar na janela de maior volume
  e anotação "58% das entradas entre 11h e 14h; 2 SDRs em almoço nessa janela".
- **V3 densa do Farol: agendas marcadas por hora, um mini heatmap por SDR.** Oito SDRs em pequenos
  múltiplos de 5 por 12 células, escala comum a todos.
- **V4 caso limite: expediente, feriado e amostra.** Sábado e domingo neutros com rótulo "sem
  expediente", semana de feriado removida da média com nota no rodapé, células com menos de 5 eventos
  hachuradas.

**Referências.**
- Catálogo: [Highcharts, exemplos de heat map](https://www.highcharts.com/blog/tutorials/heat-map-examples-using-highcharts/): observar "vendas por funcionário por dia útil" e o heatmap grande de dia por hora com milhares de células.
- Praticante: [Stephen Few, Keep radar graphs below the radar](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar o caso de acessos por hora do dia e por que a linha horizontal lê melhor que o relógio.
- Catálogo: [Data Viz Catalogue, heatmap](https://datavizcatalogue.com/methods/heatmap.html): observar a exigência de legenda e o uso de intervalos de tempo em linha ou coluna.
- Portal de design: [Behance, monitoramento de dados com heatmaps e radares](https://www.behance.net/gallery/221169407/Data-Monitoring-Merchant-Heatmaps-Radars): projeto de painel de monitoramento que transforma atividade em heatmaps; observar a combinação de grade de calor com alertas (só metadados em texto verificados).

---

## 2. Punch card (bolhas dia por hora)

**Descrição.** Mesma grade do modelo 1, mas o volume vira o tamanho de um círculo em vez da cor. Deixa a
cor livre para uma segunda medida (taxa de resposta, por exemplo). O Vega-Lite reproduz o punch card de
atividade por dia e hora.

**Anatomia.** Eixos categóricos de dia e hora; círculo centrado na célula; legenda de tamanho com três
referências; legenda de cor quando houver dupla codificação.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart` com `XAxis type="category"` (hora),
`YAxis type="category"` (dia) e `ZAxis` com `range` para o tamanho do símbolo. O kit já tem
`ScatterBubbleChart.tsx` como base.

**Ponto delicado.** Área, não raio, deve ser proporcional ao valor; o domínio do `ZAxis` precisa começar
em zero e o tamanho mínimo precisa manter visível o valor 1. Com cor e tamanho juntos, a legenda
explica os dois canais separadamente.

**Versões sugeridas.**
- **V1 básica: respostas de lead por dia e hora.** Tamanho igual a volume de respostas.
- **V2 com destaque: volume e taxa.** Tamanho igual a mensagens enviadas pelo SDR, cor igual a taxa de
  resposta, com as janelas acima de 30% de resposta contornadas.
- **V3 caso limite: cauda longa.** Uma janela com 400 envios e várias com 2; tamanho mínimo de 4 px e
  nota "área proporcional ao volume".

**Referências.**
- Catálogo: [Vega-Lite, Table Bubble Plot (punch card)](https://vega.github.io/vega-lite/examples/circle_github_punchcard.html): observar dia no eixo Y com ordem customizada, hora no X e tamanho pela soma.
- Catálogo: [visx, exemplo de heatmap com círculos](https://raw.githubusercontent.com/airbnb/visx/master/packages/visx-demo/src/sandboxes/visx-heatmap/Example.tsx): observar raio pelo menor lado da célula e escala de opacidade adicional.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Sem a grade temporal, bolhas em eixo categórico são família 09.

---

## 3. Calendário estilo contribuições

**Descrição.** Um ano (ou vários empilhados) desenhado como colunas de semanas e linhas de dias da
semana, cada dia uma célula colorida. Mostra sazonalidade, dias sem atividade e rupturas ao longo de
meses. ECharts, Nivo, AG Charts e Evidence oferecem o mesmo desenho; o Nivo declara inspiração no
exemplo "calendar view" do D3.

**Anatomia.** Rótulo do ano; rótulos de mês no topo; rótulos de dia da semana à esquerda (só alternados);
células quadradas com vão; contorno de separação entre meses (o `path` em degrau do exemplo D3); legenda
de faixas; dias futuros sem célula.

**Abordagem na stack.** `svg-puro`. A geometria é o ponto central:

```ts
const MS_DIA = 86_400_000;
const diaSemana = (d: Date) => (d.getUTCDay() + 6) % 7; // 0 = segunda

export function posicaoNoAno(d: Date, inicio: Date) {
  const offset = diaSemana(inicio); // dias antes da primeira segunda
  const n = Math.round((d.getTime() - inicio.getTime()) / MS_DIA);
  return { col: Math.floor((n + offset) / 7), row: diaSemana(d) };
}
```

O contorno do mês sai do último dia de cada mês: sobe pela coluna da semana até o dia da semana dele e
dobra para a coluna seguinte, formando o degrau.

**Ponto delicado.** Datas em UTC ou todas no fuso local, nunca misturadas (o dia muda na virada). Dia
futuro não é desenhado; dia passado sem carga de dado é hachurado; dia com zero é `--seq-1` com borda
sutil. Fins de semana podem sair da grade (5 linhas) quando a operação não trabalha. No celular, virar
o calendário na vertical (meses em linhas), como a variante vertical do ECharts.

**Versões sugeridas.**
- **V1 básica: fechamentos por dia em 2026.** Escala em 5 faixas de 0 a 4 ou mais fechamentos.
- **V2 com destaque: dias sem entrada de lead e campanhas.** Dias com zero entradas em dia útil com
  contorno âmbar; marcadores acima da grade no início de cada campanha fictícia.
- **V3 densa do Farol: três anos de receita reconhecida por dia.** 2024, 2025 e 2026 empilhados, escala
  comum, soma do ano ao lado de cada faixa.
- **V4 caso limite: ano parcial e lacunas de carga.** Grade até 2026-09-14 sem células futuras, fins de
  semana removidos e 6 dias de falha de carga hachurados com tooltip "sem carga nesta data".

**Referências.**
- Catálogo: [Apache ECharts, calendar heatmap (código)](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/calendar-heatmap.ts): observar `cellSize: ['auto', 13]`, `visualMap` em faixas e série `heatmap` no sistema de coordenadas `calendar`.
- Catálogo: [Nivo, Calendar](https://nivo.rocks/calendar/): observar direção, espaçamento de anos, borda de mês e cor para dia vazio.
- Catálogo: [Evidence, Calendar Heatmap](https://docs.evidence.dev/components/charts/calendar-heatmap): observar a expansão automática para vários anos e a grade completa mesmo com dias faltando.
- Catálogo: [Observable, calendar view do D3](https://observablehq.com/@d3/calendar-view) (não abriu): observar o contorno de mês calculado e anos empilhados.
- Praticante: [FlowingData, calendar heatmaps para séries temporais](https://flowingdata.com/2012/03/15/calendar-heatmaps-to-visualize-time-series-data/) (não abriu): post de referência sobre o formato.
- Portal de design: [Behance, Heatmap UI para dias positivos num app de diário](https://www.behance.net/gallery/201243715/Heatmap-UI-Chart-UXUI-Design): exploração de heatmap para acompanhar dias; observar tamanho de célula e escala de intensidade em interface de produto (só metadados em texto verificados).

**Mora melhor em outra família?** Uma única linha de dias com status categórico é a faixa de status da
família 14 (modelo 9) ou microvisual da 24.

---

## 4. Calendário mensal em grade

**Descrição.** O mês desenhado como calendário de parede: 7 colunas, 5 ou 6 linhas, número do dia em
cada célula e a cor pelo valor. Lê como agenda, o que ajuda públicos operacionais.

**Anatomia.** Cabeçalho com mês e ano; cabeçalho de dias da semana; célula com número do dia no canto e
valor no centro; dias de outro mês esmaecidos ou ausentes; legenda.

**Abordagem na stack.** `html-tailwind`: CSS grid `grid-cols-7` com `aspect-square`, cor por
`style={{ background }}`. HTML é melhor que SVG aqui porque o texto do dia e do valor precisa quebrar e
escalar com a fonte.

**Ponto delicado.** Semana começando na segunda ou no domingo conforme o padrão já usado no
`PeriodPicker.tsx` do Farol. Meses com 6 semanas mudam a altura; reservar 6 linhas evita salto de
layout entre meses. Feriado marcado com ícone, não com cor.

**Versões sugeridas.**
- **V1 básica: reuniões realizadas por dia em setembro de 2026.** Número de reuniões no centro da
  célula, cor por faixa.
- **V2 com destaque: dias acima da capacidade de agenda.** Dias com mais de 22 agendas ganham borda
  âmbar e ícone de alerta.
- **V3 caso limite: mês de 6 semanas com feriado.** Dias de agosto e outubro esmaecidos nas pontas,
  feriado com ícone e célula neutra, dia corrente com anel de foco.

**Referências.**
- Catálogo: [Highcharts, calendar heatmap mensal](https://www.highcharts.com/demo/highcharts/calendar-heatmap-month): demo de um mês de temperatura diária em grade de calendário; observar o dia como rótulo dentro da célula.
- Catálogo: [Apache ECharts, lista de exemplos](https://github.com/apache/echarts-examples/tree/gh-pages/public/examples/ts): observar as variantes `calendar-simple`, `calendar-vertical` e `calendar-horizontal`.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Quando os eventos são itens com duração (reuniões com hora de início e
fim), é cronograma da família 20.

---

## 5. Matriz anual dia do mês por mês

**Descrição.** Linhas de meses e colunas de dias do mês (1 a 31). Esconde o dia da semana e evidencia
efeitos de calendário contábil: início do mês, quinzena, fim do mês. O Vega-Lite usa esse desenho no
exemplo de temperaturas máximas diárias.

**Anatomia.** Eixo de meses à esquerda; eixo de dias 1 a 31 no topo; células inexistentes (30 e 31 de
fevereiro, 31 de abril) sem desenho; legenda.

**Abordagem na stack.** `svg-puro` via `HeatGrid` com uma máscara de validade de data.

**Ponto delicado.** Célula de data inexistente não é zero nem ausente: simplesmente não é desenhada.
Mês corrente para no dia de hoje. Dias úteis e não úteis se misturam; considerar sombrear fins de semana
de leve para explicar vales.

**Versões sugeridas.**
- **V1 básica: leads qualificados por dia do mês em 2026.** Doze linhas por 31 colunas.
- **V2 com destaque: efeito de fim de mês nos fechamentos.** Últimos 5 dias úteis de cada mês com
  contorno e anotação "41% dos fechamentos nos últimos 5 dias úteis".
- **V3 caso limite: datas inexistentes e mês parcial.** Fevereiro com 28 células, setembro cortado em
  2026-09-14, fins de semana sombreados.

**Referências.**
- Catálogo: [Vega-Lite, Annual Weather Heatmap](https://vega.github.io/vega-lite/examples/rect_heatmap_weather.html): observar `timeUnit` de dia no X e mês no Y, sem domínio de eixo.
- Catálogo: [Observable Plot, cell mark](https://observablehq.com/plot/marks/cell) (não abriu): documentação do `cell` com exemplo de calendário por dia e mês.
- Portal de design: sem referência específica verificada.

---

## 6. Cohort de conversão em triângulo

**Descrição.** Linhas são grupos de entrada (cohort do mês em que o lead ou a oportunidade nasceu),
colunas são o tempo decorrido desde a entrada (M0, M1, M2...), e a célula mostra a taxa acumulada ou do
período. O formato triangular aparece sozinho: cohorts recentes têm menos períodos decorridos.

**Anatomia.** Coluna do cohort com data; coluna do tamanho do cohort (n) com barra; miolo com taxa em
cor e número; diagonal do período corrente marcada como parcial; linha de média ponderada no rodapé;
legenda.

**Abordagem na stack.** `html-tailwind`: é uma tabela com células coloridas e precisa do número legível;
reaproveita o renderizador do modelo 2 da família 14 e a coluna de barra do modelo 1.

**Ponto delicado.** Três leituras precisam estar claras: na horizontal, como um cohort amadurece; na
vertical, se cohorts novos convertem melhor na mesma idade; na diagonal, o que aconteceu num mês de
calendário para todos. A célula do período em curso é parcial e parece queda; marcar com borda
tracejada e tooltip "período em curso". Cohort pequeno produz taxas instáveis: esmaecer abaixo de n
mínimo. A média do rodapé é ponderada pelo tamanho, não média simples das taxas.

**Versões sugeridas.**
- **V1 básica: conversão de lead em agenda por cohort mensal de entrada.** Taxa acumulada de M0 a M6
  para cohorts de janeiro a setembro de 2026.
- **V2 com destaque: mudança de régua.** Linha divisória entre abril e maio de 2026 com anotação
  "nova cadência de pré-vendas", mostrando que a coluna M1 clareia a partir de maio.
- **V3 densa do Farol: taxa de ganho acumulada por mês de criação da oportunidade.** 18 cohorts por 12
  meses decorridos, coluna de n com barra e média ponderada.
- **V4 caso limite: parcial, pequeno e absoluto.** Diagonal de setembro tracejada, cohort de fevereiro
  com n = 12 esmaecido e alternador entre taxa e contagem absoluta.

**Referências.**
- Catálogo: [Holistics, cohort retention](https://docs.holistics.io/docs/charts/cohort-retention): observar a coluna de tamanho do cohort e o cuidado com a ordem cronológica das colunas.
- Praticante: [Statsig, introdução aos triangle charts](https://www.statsig.com/blog/intro-triangle-charts-retention): observar a leitura horizontal (um cohort envelhecendo) e vertical (cohorts na mesma idade).
- Portal de design: [Behance, cohort analysis de retenção ao longo do tempo](https://www.behance.net/gallery/174732039/COHORT-ANALYSIS-CUSTOMER-RETENTION-OVER-TIME): painel de análise de coorte; observar a combinação de tabela triangular com resumo (só metadados em texto verificados).

**Mora melhor em outra família?** As curvas de retenção de cada cohort, lado a lado, são família 04.

---

## 7. Heatmap de correlação

**Descrição.** Matriz quadrada de métricas por métricas com o coeficiente de correlação em cada célula,
escala divergente centrada em zero e metade superior mascarada, porque a matriz é simétrica (exemplo
de correlação diagonal do seaborn).

**Anatomia.** Métricas nos dois eixos na mesma ordem; triângulo inferior; diagonal omitida; células
quadradas; escala divergente de −1 a +1 com zero neutro; coeficiente como rótulo quando cabe.

**Abordagem na stack.** `svg-puro` via `HeatGrid` com `kind: 'div'`, `domain: [-1, 1]` e máscara
`linha > coluna`. O coeficiente é calculado no seletor de dados (Pearson ou Spearman declarado).

**Ponto delicado.** Correlação tem sinal, então escala sequencial é erro. Número de observações por par
define a confiança: 10 semanas geram coeficientes enganosos, e From Data to Viz lembra que mais de uns 10
atributos tornam o correlograma difícil de ler. Variância zero torna o coeficiente indefinido; a célula
diz "não calculável" em vez de 0. Correlação não é causa, e o subtítulo diz isso quando o público é
executivo.

**Versões sugeridas.**
- **V1 básica: correlação entre métricas semanais do funil.** Dez métricas (investimento, leads, MQL,
  agendas, show rate, propostas, fechamentos, ticket, ciclo, CPL), 52 semanas.
- **V2 com destaque: só correlações fortes rotuladas.** Rótulo e contorno nas células com módulo acima de
  0,6; demais sem número, só cor.
- **V3 caso limite: amostra curta e indefinida.** Métricas com menos de 12 semanas de histórico
  hachuradas; "reuniões canceladas" constante no período com células "não calculável".

**Referências.**
- Catálogo: [seaborn, matriz de correlação diagonal](https://seaborn.pydata.org/examples/many_pairwise_correlations.html): observar a máscara do triângulo superior, paleta divergente centrada em zero e células quadradas.
- Catálogo: [From Data to Viz, correlograma](https://www.data-to-viz.com/graph/correlogram.html): observar o limite prático de variáveis e a variante com dispersões.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar o XY heatmap na categoria Correlation.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** A matriz de dispersões (scatterplot matrix) mora na família 09.

---

## 8. Matriz categórica genérica

**Descrição.** O heatmap clássico em tabela: uma dimensão categórica nas linhas, outra nas colunas, a
mesma medida em todas as células. Vega-Lite chama de table heatmap; AG Charts e Nivo oferecem rótulos
nas células e legenda em gradiente.

**Anatomia.** Rótulos de linha e coluna; células com vão; número opcional; legenda de gradiente ou
faixas com unidade; destaque opcional de linha e coluna ao passar o ponteiro.

**Abordagem na stack.** `svg-puro` via `HeatGrid`. Com mais de 20 colunas, rolagem horizontal dentro do
contêiner do gráfico e rótulos de linha fixos à esquerda.

**Ponto delicado.** Ordem das categorias é metade da leitura (From Data to Viz e Few recomendam
ordenar ou agrupar antes de colorir). Escolha de paleta ruim é o terceiro erro da lista de From Data to
Viz. Com negativos, divergente; com taxa e volume misturados, separar em dois heatmaps ou usar o modelo
12.

**Versões sugeridas.**
- **V1 básica: win rate por executivo e segmento de cliente.** 12 executivos por 5 segmentos, taxa em %.
- **V2 com destaque: rótulos e ordenação por total.** Executivos ordenados pelo win rate geral, rótulo
  em todas as células e a célula de maior valor por coluna com contorno.
- **V3 densa do Farol: CPL qualificado por plataforma e criativo.** 4 plataformas por 30 criativos com
  rolagem horizontal, rótulos de plataforma fixos.
- **V4 caso limite: negativos e sem amostra.** Margem por origem e trimestre em escala divergente, com
  células sem venda hachuradas.

**Referências.**
- Catálogo: [AG Charts, heatmap com rótulos](https://www.ag-grid.com/charts/gallery/heatmap-with-labels/): observar formatador de rótulo na célula e legenda em gradiente.
- Catálogo: [Nivo, HeatMap](https://nivo.rocks/heatmap/): observar escalas sequencial, divergente e quantizada e a cor dedicada para nulo.
- Catálogo: [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): observar os erros comuns de normalização, ordenação e paleta.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): observar a lista de tarefas de leitura de heatmap e o limite de sete faixas.
- Portal de design: [Behance, monitoramento de dados com heatmaps e radares](https://www.behance.net/gallery/221169407/Data-Monitoring-Merchant-Heatmaps-Radars): observar heatmaps em painel operacional (só metadados em texto verificados).

**Mora melhor em outra família?** Com colunas de unidades diferentes e texto, tabela com heatmap da
família 14.

---

## 9. Heatmap com totais marginais

**Descrição.** O modelo 8 com barras nas margens: à direita, o total de cada linha; embaixo, o total de
cada coluna. A cor mostra o padrão, as barras mostram o peso, e o leitor não confunde uma linha
"quente" de volume pequeno com uma linha importante.

**Anatomia.** Miolo colorido; barras horizontais de total por linha à direita; barras verticais de total
por coluna embaixo; valor do total ao lado de cada barra; legenda de cor separada da escala das barras.

**Abordagem na stack.** `svg-puro` num único SVG, para que as margens alinhem com as células sem
cálculo de layout entre componentes.

**Ponto delicado.** Duas escalas diferentes no mesmo desenho (cor do miolo e comprimento das margens),
cada uma com sua legenda. Quando o miolo mostra taxa e as margens volume, dizer isso no título das
margens.

**Versões sugeridas.**
- **V1 básica: entradas por dia e hora com totais.** Total por dia à direita e por hora embaixo.
- **V2 com destaque: perdas por motivo e etapa.** Margem destaca "proposta" como a etapa com mais
  perdas e o miolo mostra que preço domina só nessa etapa.
- **V3 caso limite: total zero e taxa no miolo.** Hora sem nenhuma entrada (barra ausente e "0") e miolo
  com taxa de agenda, margens com volume de leads.

**Referências.**
- Catálogo: [Data Viz Catalogue, heatmap](https://datavizcatalogue.com/methods/heatmap.html): observar a leitura por interseção de linhas e colunas e a necessidade de legenda.
- Praticante: [Stephen Few, análise multivariada com heatmaps](https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf): observar a leitura de perfil por linha e de variável por coluna.
- Portal de design: sem referência específica verificada.

---

## 10. Heatmap com eixo agrupado

**Descrição.** Um dos eixos tem dois níveis de categoria (ano e trimestre, canal e origem), com o nível
superior como rótulo de grupo e separação visual entre grupos. O AG Charts tem o exemplo com eixo de
categoria agrupada.

**Anatomia.** Rótulo de grupo acima ou à esquerda do rótulo de item; vão maior entre grupos que entre
itens; opcional linha de subtotal por grupo.

**Abordagem na stack.** `svg-puro` via `HeatGrid` com prop `groups` que soma um espaçamento extra no
cálculo de posição.

**Ponto delicado.** Grupos com número desigual de itens; o rótulo de grupo centraliza sobre seus itens.
Em tela estreita, o rótulo de grupo vira abreviação e o item vai para o tooltip.

**Versões sugeridas.**
- **V1 básica: taxa de conversão por trimestre agrupado por ano.** 2025 e 2026 com quatro trimestres
  cada, etapas nas linhas.
- **V2 com destaque: leads por origem agrupada em canal.** Canais pago, orgânico e indicação nas linhas,
  origens dentro de cada um, meses nas colunas, com o canal indicação em destaque.
- **V3 caso limite: grupos desiguais e tela estreita.** Canal com 1 origem e canal com 9; rótulos de
  origem migram para o tooltip abaixo de 480 px.

**Referências.**
- Catálogo: [AG Charts, heatmap com eixo de categoria agrupada](https://www.ag-grid.com/charts/gallery/grouped-category-heatmap/): observar o eixo `grouped-category` com o segundo nível em negrito.
- Portal de design: sem referência específica verificada.

---

## 11. Lasagna (entidades por tempo)

**Descrição.** Cada linha é uma entidade (fila, SDR, oportunidade) e cada coluna é um período (dia,
semana); a cor mostra valor ou status. O Vega-Lite chama de lasagna plot, heatmap de séries temporais
densas.

**Anatomia.** Rótulos de entidade à esquerda; eixo de tempo com rótulos esparsos (só início de mês ou
ano, como no exemplo do Vega-Lite); células estreitas sem vão horizontal quando o período é curto;
legenda.

**Abordagem na stack.** `svg-puro`. Até uns 10 mil `rect` o SVG aguenta; acima disso agregar por
semana ou virtualizar linhas.

**Ponto delicado.** Entidade que começou depois (admissão, criação) não tem células antes do início, e
isso é diferente de zero. Ordem das linhas conta a história: por início, por média ou por semelhança. Em
tela estreita, 365 colunas viram 52 (semanas).

**Versões sugeridas.**
- **V1 básica: SLA diário por fila.** 12 filas por 90 dias com faixas de tempo de primeiro contato.
- **V2 com destaque: ocupação semanal por SDR.** Ordenada pela ocupação média, semanas acima de 100%
  com contorno âmbar.
- **V3 densa do Farol: dias parados das oportunidades abertas.** 200 oportunidades por 120 dias, cor
  pelo número de dias sem movimento, ordenadas pela data de criação.
- **V4 caso limite: início tardio e agregação.** SDRs admitidos em julho sem células antes; no celular
  as colunas diárias viram semanais com nota.

**Referências.**
- Catálogo: [Vega-Lite, Lasagna Plot](https://vega.github.io/vega-lite/examples/rect_lasagna.html): observar rótulo de eixo só no primeiro dia do ano e categorias nominais nas linhas.
- Catálogo: [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): observar a versão de uma linha só com status categórico.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Com poucas entidades e valor contínuo, linhas da família 04; uma
entidade só, faixa de status da família 14.

---

## 12. Heatmap com células de tamanho variável

**Descrição.** Cada célula é um círculo (ou quadrado) cujo tamanho mostra volume e cuja cor mostra taxa.
Evita que uma célula de taxa altíssima com 2 casos domine a atenção. Nivo tem receita de tamanho de
célula variável; visx combina cor e opacidade no `HeatmapCircle`.

**Anatomia.** Grade de posições fixas; forma centrada com tamanho pela área; cor pela segunda medida;
duas legendas.

**Abordagem na stack.** `svg-puro` via `HeatGrid` com `shape: 'circle'` e raio `r = rMax * Math.sqrt(v / vMax)`.

**Ponto delicado.** Área proporcional (raiz no raio). Tamanho mínimo visível para valores pequenos, mas
zero sem forma. Célula vazia com ponto neutro para a grade não parecer quebrada.

**Versões sugeridas.**
- **V1 básica: taxa de agenda e volume por origem e mês.** Cor é taxa, tamanho é número de leads.
- **V2 caso limite: zeros e extremos.** Origem com zero leads em março sem círculo e ponto neutro;
  "campanha de fim de ano" com volume 30 vezes maior limitada ao raio máximo e anotada.

**Referências.**
- Catálogo: [Nivo, HeatMap](https://nivo.rocks/heatmap/): observar as formas de célula retangular e circular e a receita de tamanho variável.
- Catálogo: [visx, exemplo de heatmap](https://raw.githubusercontent.com/airbnb/visx/master/packages/visx-demo/src/sandboxes/visx-heatmap/Example.tsx): observar escalas de cor e de opacidade e o raio pelo menor lado da célula.
- Portal de design: sem referência específica verificada.

---

## 13. Heatmap ordenado por semelhança

**Descrição.** Entidades nas linhas, métricas normalizadas nas colunas, e as linhas reordenadas para que
perfis parecidos fiquem vizinhos, com dendrograma opcional à esquerda. Few mostra o uso científico com
dendrograma e alerta que exige público treinado; From Data to Viz lembra que a clusterização costuma
acompanhar o heatmap.

**Anatomia.** Colunas de métricas normalizadas (percentil ou escore); linhas ordenadas; dendrograma ou
faixas de grupo à esquerda; legenda da normalização.

**Abordagem na stack.** `svg-puro`. Ordenação calculada em TypeScript: para o Farol basta ordenar pelo
primeiro componente (média ponderada das métricas normalizadas) ou por aglomeração hierárquica simples
de distância euclidiana com ligação média; o dendrograma é um `path` em cotovelos.

**Ponto delicado.** Reordenar a cada filtro desorienta; congelar a ordem ao filtrar ou avisar "ordem
recalculada". Normalização por coluna é obrigatória, senão a métrica de maior escala define a ordem.
Para público executivo, trocar dendrograma por faixas de grupo nomeadas.

**Versões sugeridas.**
- **V1 básica: perfil de origens de lead em 8 métricas normalizadas.** Linhas ordenadas por semelhança,
  sem dendrograma.
- **V2 com destaque: grupos nomeados.** Três faixas à esquerda ("volume sem qualidade", "poucas e
  boas", "equilibradas") no lugar do dendrograma.
- **V3 caso limite: ordem instável.** Filtro de trimestre muda a ordem; a versão congela a ordem do
  recorte anterior e mostra o botão "reordenar".

**Referências.**
- Praticante: [Stephen Few, análise multivariada com heatmaps](https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf): observar o heatmap organizado por dendrograma e a advertência sobre público.
- Catálogo: [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): observar a clusterização antes de arranjar linhas e colunas.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** O dendrograma isolado é família 12; como substituto de radares demais,
ver família 18 (modelo 5).

---

## 14. Heatmap radial de 24 horas

**Descrição.** Os dias da semana viram anéis concêntricos e as horas viram setores, formando um relógio
colorido. O ECharts tem um exemplo de heatmap polar customizado. Reforça a leitura cíclica do dia, ao
custo de precisão.

**Anatomia.** Anéis por dia (segunda no centro ou fora); 24 setores com 0h no topo e sentido horário;
rótulos só em 0h, 6h, 12h e 18h; legenda.

**Abordagem na stack.** `svg-puro`: cada célula é um setor anular com `path` de dois arcos.

```ts
export function setorAnular(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${cx + r * Math.sin(a)},${cy - r * Math.cos(a)}`; // 0 no topo
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)} A${r1},${r1} 0 ${grande} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${grande} 0 ${p(r0, a0)} Z`;
}
```

**Ponto delicado.** Anéis externos têm células maiores e ganham peso visual; Few mostra que objetos
maiores da mesma cor parecem mais salientes. Por isso o modelo 1 continua sendo o padrão, e este só entra
em peça de destaque.

**Versões sugeridas.**
- **V1 básica: entradas de lead por hora em anéis por dia.** Sete anéis, 24 setores, segunda no anel
  interno.
- **V2 caso limite: comparação difícil.** Mesma informação ao lado do modelo 1 para mostrar que o pico
  de sábado no anel externo parece maior do que é.

**Referências.**
- Catálogo: [Apache ECharts, lista de exemplos](https://github.com/apache/echarts-examples/tree/gh-pages/public/examples/ts): observar o arquivo `custom-polar-heatmap` como referência de heatmap em coordenadas polares.
- Praticante: [Stephen Few, radar graphs](https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf): observar a única justificativa aceita para forma circular, a continuidade do ciclo de 24 horas.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Com uma série só por hora, radar de ciclo da família 18 (modelo 6).

---

## 15. Matriz de transição entre etapas

**Descrição.** Etapas de origem nas linhas, etapas de destino nas colunas, e a cor pela quantidade (ou
percentual da linha) de movimentos. Acima da diagonal, avanços; abaixo, retrocessos. From Data to Viz
lembra o uso de heatmap para matrizes de adjacência.

**Anatomia.** Mesma lista de etapas nos dois eixos, na ordem do funil; diagonal marcada (permanência) e
fora da escala; células de retrocesso com tratamento distinto; totais opcionais.

**Abordagem na stack.** `svg-puro` via `HeatGrid`, com a diagonal desenhada à parte.

**Ponto delicado.** A permanência na mesma etapa costuma ser o maior número e achata a escala; excluir a
diagonal do domínio. Percentual por linha responde "de quem sai de proposta, para onde vai"; contagem
responde "onde há mais movimento". O rótulo diz qual.

**Versões sugeridas.**
- **V1 básica: movimentos entre etapas do funil no trimestre.** Seis etapas mais "ganho" e "perdido"
  como destinos.
- **V2 com destaque: retrocessos.** Células abaixo da diagonal em escala divergente (tons de
  `--negative`) e avanços em sequencial, com anotação "14% das propostas voltaram para descoberta".
- **V3 caso limite: etapa sem saída e diagonal.** Etapa "contrato" sem movimentos no período (linha
  vazia com rótulo) e diagonal desenhada em cinza com valores fora da escala.

**Referências.**
- Catálogo: [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): observar a menção a matrizes de adjacência como variação.
- Catálogo: [Data Viz Catalogue, heatmap](https://datavizcatalogue.com/methods/heatmap.html): observar a leitura por interseção e o uso para relações.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Quando o volume do fluxo importa mais que a matriz, Sankey da família
11; como grafo de relações, família 27.

---

## Fontes consultadas

Abertas nesta pesquisa (2026-09-14):

- Data Viz Catalogue, heatmap: https://datavizcatalogue.com/methods/heatmap.html
- From Data to Viz, heatmap: https://www.data-to-viz.com/graph/heatmap.html
- From Data to Viz, correlograma: https://www.data-to-viz.com/graph/correlogram.html
- FT Visual Vocabulary: https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- Stephen Few, Heatmaps: to bin or not to bin?: https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf
- Stephen Few, análise multivariada com heatmaps: https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf
- Stephen Few, Keep radar graphs below the radar: https://www.perceptualedge.com/articles/dmreview/radar_graphs.pdf
- Vega-Lite, galeria de exemplos: https://vega.github.io/vega-lite/examples/
- Vega-Lite, texto sobre heatmap: https://vega.github.io/vega-lite/examples/layer_text_heatmap.html
- Vega-Lite, Annual Weather Heatmap: https://vega.github.io/vega-lite/examples/rect_heatmap_weather.html
- Vega-Lite, Lasagna Plot: https://vega.github.io/vega-lite/examples/rect_lasagna.html
- Vega-Lite, Table Bubble Plot (punch card): https://vega.github.io/vega-lite/examples/circle_github_punchcard.html
- Apache ECharts, calendar heatmap (código): https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/calendar-heatmap.ts
- Apache ECharts, lista de exemplos: https://github.com/apache/echarts-examples/tree/gh-pages/public/examples/ts
- Highcharts, exemplos de heat map: https://www.highcharts.com/blog/tutorials/heat-map-examples-using-highcharts/
- Highcharts, calendar heatmap mensal: https://www.highcharts.com/demo/highcharts/calendar-heatmap-month
- AG Charts, galeria: https://www.ag-grid.com/charts/gallery/
- AG Charts, heatmap com rótulos: https://www.ag-grid.com/charts/gallery/heatmap-with-labels/
- AG Charts, calendar heatmap: https://www.ag-grid.com/charts/gallery/calendar-heatmap/
- AG Charts, heatmap com eixo agrupado: https://www.ag-grid.com/charts/gallery/grouped-category-heatmap/
- Nivo, HeatMap: https://nivo.rocks/heatmap/
- Nivo, Calendar: https://nivo.rocks/calendar/
- visx, exemplos (pastas de sandbox): https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes
- visx, exemplo de heatmap (código): https://raw.githubusercontent.com/airbnb/visx/master/packages/visx-demo/src/sandboxes/visx-heatmap/Example.tsx
- Evidence, Calendar Heatmap: https://docs.evidence.dev/components/charts/calendar-heatmap
- Tremor, Tracker: https://www.tremor.so/docs/visualizations/tracker
- seaborn, matriz de correlação diagonal: https://seaborn.pydata.org/examples/many_pairwise_correlations.html
- Holistics, cohort retention: https://docs.holistics.io/docs/charts/cohort-retention
- Statsig, triangle charts: https://www.statsig.com/blog/intro-triangle-charts-retention
- Behance, monitoramento de dados com heatmaps e radares: https://www.behance.net/gallery/221169407/Data-Monitoring-Merchant-Heatmaps-Radars
- Behance, Heatmap UI: https://www.behance.net/gallery/201243715/Heatmap-UI-Chart-UXUI-Design
- Behance, cohort analysis: https://www.behance.net/gallery/174732039/COHORT-ANALYSIS-CUSTOMER-RETENTION-OVER-TIME

Apareceram em busca ou em página aberta, mas não carregaram:

- Observable Plot, cell mark (não abriu, limite de requisições): https://observablehq.com/plot/marks/cell
- Observable, calendário simplificado com Plot (não abriu): https://observablehq.com/@observablehq/plot-simplified-calendar
- Observable, heatmap temporal de temperatura com Plot (não abriu): https://observablehq.com/@observablehq/plot-seattle-temperature-heatmap
- Observable, calendar view do D3 (não abriu): https://observablehq.com/@d3/calendar-view
- FlowingData, calendar heatmaps (não abriu, acesso negado): https://flowingdata.com/2012/03/15/calendar-heatmaps-to-visualize-time-series-data/
- FlowingData, tipo de gráfico heatmap (não abriu): https://flowingdata.com/charttype/heatmap/
- Highcharts, Large heatmap (não abriu): https://www.highcharts.com/demo/highcharts/heatmap-canvas

Lacunas desta família: Dribbble e Figma Community não renderizaram conteúdo para leitura automática; Data
Viz Project (Ferdio) respondeu com acesso negado; as páginas do Behance abriram só com metadados em texto,
sem inspeção das imagens. O editor de exemplos do ECharts não expõe código em texto, por isso o código foi
lido no repositório de exemplos.
