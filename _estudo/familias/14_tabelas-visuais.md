# Família 14: tabelas visuais

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa ou empresa real.

## O que a família responde

Tabela visual é a tabela que continua sendo tabela (o leitor ainda consulta o número exato de uma
linha), mas ganha uma camada gráfica dentro da célula para que o padrão apareça antes da leitura.
Serve quando há muitas entidades, várias métricas com unidades diferentes e a pergunta mistura
"quanto exatamente" com "quem se destaca". O TableLens (Ramana Rao, publicado no acervo de Stephen
Few) resume o espírito: gráfico primeiro, dentro de uma estrutura que todo mundo já sabe ler, e a
ordenação por coluna como operador principal de análise.

Perguntas típicas no Farol:

- **Comercial:** qual executivo está abaixo da meta de fechamento e em que etapa ele perde mais?
  Quem subiu e quem caiu no ranking de receita reconhecida do trimestre?
- **Pré-vendas:** quais filas estouraram o SLA nos últimos 30 dias, e em quais dias? Como a produção
  semanal de agendas de cada SDR evoluiu nas últimas 12 semanas?
- **Marketing:** quais origens de lead têm CPL qualificado alto e cobertura de dado baixa? Qual
  plataforma de mídia piorou o CPL contra o mês anterior?
- **Diretoria:** quais áreas cumprem cada meta do ano (sim, parcial, não)? Em quais métricas cada
  cenário fica fora da faixa?

Quando não usar: se a pergunta é só a forma de uma série ou a comparação de cinco barras, o gráfico
dedicado (02, 03, 04) lê mais rápido. A Storytelling with Data lembra que tabela é ruim em
apresentação ao vivo, porque a plateia não lê e escuta ao mesmo tempo.

## Decisões transversais da família

1. **Escala por coluna.** Colunas com unidades diferentes nunca dividem escala. Dentro da coluna, o
   domínio é comum a todas as linhas; sem isso a barra da linha 1 não se compara com a da linha 2.
   Datawrapper expõe essa faixa (range) como configuração explícita; Few descreve cinco jeitos de
   escalar sparklines e o que cada um deixa comparar.
2. **Total, média e referência ficam fora do domínio.** Uma linha de total dez vezes maior achata
   todas as barras. Ela fica fixa (sticky), com estilo próprio e sem barra, ou com barra em escala
   própria declarada.
3. **Dado ausente não é zero.** O kit já tem `formatUnavailable()`, que imprime "indisponível". A
   célula visual precisa do equivalente gráfico: sem barra, trilho tracejado ou hachura, o texto
   "indisponível" e o motivo no tooltip.
4. **Cor segue a polaridade da métrica, não o sinal.** CPL subir é ruim; taxa de conversão subir é
   bom. A polaridade mora no registry de métricas, e a célula só consulta.
5. **Número à direita com algarismos tabulares** (`tabular-nums`), texto à esquerda, como recomenda a
   SWD. Barra e número não disputam o mesmo pixel: o número fica fora da barra.
6. **A base já existe.** O `DataTable.tsx` do kit usa @tanstack/react-table (já instalado), declara o
   teto de linhas no rodapé e vira lista de cartões no celular. Todo modelo desta família é um
   renderizador de célula (`cell` da `ColumnDef`) ou um cabeçalho sobre esse componente, não uma
   tabela nova.
7. **No celular a camada visual encolhe antes do número.** Sparkline e barra podem sumir na variante
   cartão; valor, estado e procedência nunca somem. Datawrapper faz o mesmo ao esconder colunas e
   trocar a tabela por cartões em telas pequenas.
8. **Acessibilidade.** A camada gráfica é redundante ao texto: SVG decorativo com `aria-hidden`, valor
   legível no texto da célula. Status nunca só por cor; sempre ícone ou rótulo junto.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Tabela com barras inline | comparar magnitude entre muitas linhas sem perder o número | negativos relevantes (use 7) ou só 3 a 6 linhas (use 02) | escala recalculada por linha; barra que não começa em zero |
| 2 | Tabela com heatmap nas células | achar extremos e padrões em colunas de mesma natureza (meses, etapas) | colunas de unidades diferentes numa escala única | gradiente automático de mínimo a máximo refém de um outlier |
| 3 | Tabela com sparklines | mostrar trajetória de cada linha ao lado do valor atual | quando a pergunta é o valor de um ponto específico da série | misturar escala própria por linha com leitura de magnitude |
| 4 | Ranking com variação de posição | quem subiu, quem caiu, quem entrou no topo | poucos itens com valores quase iguais (ranking vira ruído) | seta pela posição numérica sem considerar que posição menor é melhor |
| 5 | Matriz de comparação com status | cumprimento de critérios qualitativos por entidade | quando existe o número por trás do status (mostre o número) | status só por cor; confundir "não se aplica" com "sem dado" |
| 6 | Tabela com bullet inline | valor contra meta e faixas qualitativas por linha | sem meta cadastrada na maioria das linhas | faixas qualitativas com escala diferente entre linhas |
| 7 | Tabela com barras divergentes inline | variação ou desvio com sinal (a partir de zero ou da meta) | coluna só com positivos | zero centralizado quando não há negativos |
| 8 | Tabela com composição 100% inline | mix de categorias por linha (motivos, origens, status) | mais de 5 categorias ou n pequeno | ordem das categorias mudando entre linhas |
| 9 | Tabela com faixa de status temporal | status diário ou semanal recente por entidade (SLA, carga) | série quantitativa contínua (use 3) | blocos demais para a largura; ausência pintada como falha |
| 10 | Lista de barras com rótulo | top N de uma métrica em espaço estreito | várias métricas por item (use 1) | rótulo longo sobre barra curta sem contraste |
| 11 | Tabela com ponto e intervalo inline | valor dentro de faixa (mínimo e máximo, cenário, dispersão) | quando a faixa não tem significado para o leitor | escala diferente por linha; intervalo sem legenda |
| 12 | Scorecard tabular | resumo de KPIs com valor, meta, variação e seta | quando o leitor precisa da série (use 3) | seta verde para CPL subindo |
| 13 | Tabela cruzada com totais marginais | contagem por duas dimensões com totais de linha e coluna | mais de 15 por 15 células sem cor (use 15) | total entrando na escala de cor do miolo; denominador do percentual implícito |
| 14 | Tabela agrupada com subtotais e linha fixa | hierarquia curta (time, área) com comparação contra média | grupos de uma linha só | ordenar e quebrar os grupos |
| 15 | Tabela com linha expansível | resumo por linha e detalhe sob demanda sem trocar de tela | detalhe que o leitor precisa comparar entre linhas | montar todos os gráficos de detalhe na carga |
| 16 | Tabela de cobertura e procedência | mostrar quanto do dado existe e de onde vem o número | tela executiva sem espaço para ressalva | taxa com denominador pequeno exibida como percentual cheio |

---

## 1. Tabela com barras inline

**Descrição.** Uma ou mais colunas numéricas ganham uma barra horizontal proporcional ao valor, dentro
da própria célula. É o TableLens na forma mínima: a leitura do padrão acontece pela barra, a consulta
exata pelo número ao lado. Ordenar por uma coluna e olhar se as barras das outras colunas também
"descem" revela correlação sem gráfico de dispersão.

**Anatomia.** Cabeçalho com unidade e indicador de ordenação; coluna de rótulo; número alinhado à
direita; trilho (fundo cinza opcional, como no Datawrapper); barra; marcador de referência opcional
(média ou meta como traço vertical); rodapé "mostrando X de Y".

**Abordagem na stack.** `html-tailwind`. Célula com `div` relativo; trilho em `bg-[var(--surface-overlay)]`
e barra com `style={{ width: pct + '%' }}` em `bg-[var(--chart-1)]`. O domínio é calculado uma vez por
coluna em TypeScript (`useMemo` sobre as linhas filtradas, não sobre a página visível) e passado ao
renderizador de célula por `column.columnDef.meta`.

**Ponto delicado.** O domínio precisa ser das linhas do recorte inteiro, não só da página exibida;
caso contrário a barra muda de tamanho ao paginar. O zero é sempre a origem. Outlier extremo: truncar
a barra em um teto declarado (ex.: percentil 95) e desenhar uma marca de corte na ponta, com o valor
real no número.

**Versões sugeridas.**
- **V1 básica: receita reconhecida por executivo.** Doze executivos, coluna em R$ mil com barra no
  trilho, ordenação inicial decrescente. Executivo 03 lidera com R$ 1.240 mil.
- **V2 com destaque: agendas por SDR contra a meta.** Barra neutra para quem bateu a meta semanal de
  18 agendas, barra âmbar para quem ficou abaixo, traço vertical da meta no trilho de todas as linhas.
- **V3 densa do Farol: leads por origem em quatro colunas.** 14 origens com entradas, MQL, agendas e
  fechamentos, cada coluna com seu domínio. Ordenar por entradas mostra que "formulário do site"
  tem volume alto e barras de agenda curtas.
- **V4 caso limite: ausente, zero e outlier.** "Evento presencial" com CPL indisponível (sem barra,
  texto "indisponível", tooltip "custo não importado"), "parceiro B" com 0 agendas (trilho vazio e
  "0") e "campanha de fim de ano" com volume 11 vezes maior, barra truncada com marca de corte.

**Referências.**
- Catálogo: [Datawrapper Academy, barras e linhas em tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar as opções de estilo fino, trilho cinza, cor para negativos e faixa manual.
- Praticante: [Ramana Rao, TableLens (acervo Perceptual Edge)](https://www.perceptualedge.com/articles/b-eye/tablelens.pdf): observar ordenação como operador de correlação e foco com contexto.
- Praticante: [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): observar barras embutidas e alinhamento de números.
- Portal de design: [Behance, Data Table Web Desktop](https://www.behance.net/gallery/246319147/Data-Table-Web-Desktop): projeto de tabela SaaS com tags de dashboard e dataviz; observar densidade de linha e hierarquia de colunas (página abriu só com metadados em texto).

**Mora melhor em outra família?** Com uma métrica e poucas linhas, vira barra horizontal simples em 02.

---

## 2. Tabela com heatmap nas células

**Descrição.** O fundo de cada célula recebe uma cor proporcional ao valor, com o número sobre ela. Serve
para achar extremos e padrões em colunas de mesma natureza (meses, etapas, semanas). Diferente do
heatmap matricial da família 15, aqui a estrutura continua de tabela: colunas de texto, colunas sem
cor e unidades diferentes convivem.

**Anatomia.** Cabeçalho; colunas coloridas com número centralizado ou à direita; legenda de escala com
limites e unidade (Datawrapper permite legenda e escala em degraus); chip "sem dado" na legenda.

**Abordagem na stack.** `html-tailwind`. A cor sai de uma função TypeScript que quantiza o valor nos
tokens `--seq-1` a `--seq-7` e aplica via `style={{ background: 'var(--seq-4)' }}`. Para escala contínua,
interpolar dois tokens vizinhos com `color-mix(in oklab, var(--seq-3) 40%, var(--seq-4))`, que o
Tailwind 4 já usa internamente.

```ts
const SEQ = 7;
export function seqToken(v: number | null, min: number, max: number): string | null {
  if (v === null) return null; // ausente: a célula recebe classe de hachura, não cor
  const t = max === min ? 0.5 : (v - min) / (max - min);
  const i = Math.min(SEQ, Math.max(1, Math.ceil(t * SEQ)));
  return `var(--seq-${i})`;
}
```

**Ponto delicado.** Três armadilhas. (a) O Datawrapper avisa que o gradiente se ajusta sozinho ao
mínimo e máximo das colunas, e um outlier distorce tudo; usar faixa manual ou percentis. (b) Contraste
do texto: no tema escuro `--seq-1` é quase o fundo e `--seq-7` é ciano claro, então o texto precisa
trocar de token por faixa (claro nas faixas 1 a 4, `--accent-cyan-contrast` nas faixas 5 a 7), como o
exemplo de texto condicional do Vega-Lite. No tema claro a regra inverte. (c) Few mostra que a cor é
percebida em relação aos vizinhos; 1 px de fundo entre células reduz o efeito.

**Versões sugeridas.**
- **V1 básica: conversão por etapa e mês.** Seis etapas do funil nas linhas, 12 meses de 2026 nas
  colunas, taxa em %, escala comum às 12 colunas.
- **V2 com destaque: CPL qualificado por plataforma e mês com teto.** Escala em 5 degraus com faixa
  manual de R$ 60 a R$ 240; células acima do teto de R$ 180 ganham contorno âmbar e ícone.
- **V3 densa do Farol: painel de metas da diretoria.** Nove áreas por oito métricas de unidades
  diferentes; cor calculada por coluna (posição percentual dentro da coluna) e número sempre visível.
- **V4 caso limite: desvio contra meta com negativos.** Escala divergente centrada em 0% com
  `--negative` e `--positive`; células sem meta cadastrada com hachura e texto "sem meta".

**Referências.**
- Catálogo: [Datawrapper Blog, heatmaps em tabelas](https://www.datawrapper.de/blog/heatmaps-for-tables): observar escala em degraus, faixa customizada e barras sobre o heatmap.
- Catálogo: [Vega-Lite, texto sobre heatmap](https://vega.github.io/vega-lite/examples/layer_text_heatmap.html): observar a cor do texto condicionada ao valor da célula.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): observar escala sequencial x divergente, limite prático de faixas e efeito de vizinhança.
- Portal de design: [Behance, plataforma de relatórios e analytics](https://www.behance.net/gallery/176149443/ReportPro-Reporting-and-Analytics): projeto com tags de tabelas e relatório financeiro; observar como a formatação condicional convive com a grade (página abriu só com metadados em texto).

**Mora melhor em outra família?** Quando todas as colunas são da mesma medida e não há coluna de texto
além do rótulo, é a matriz categórica da família 15.

---

## 3. Tabela com sparklines

**Descrição.** Uma coluna com um micrográfico de linha, área ou colunas por linha da tabela, mostrando
a trajetória recente ao lado do valor atual. Tufte definiu sparkline como gráfico pequeno, intenso, do
tamanho de uma palavra, embutido onde o número é discutido.

**Anatomia.** Coluna do micrográfico com largura fixa; último ponto marcado na cor de destaque e ligado
ao número da coluna seguinte (Tufte); mínimo e máximo opcionais; banda de faixa normal opcional; sem
eixo, sem grade.

**Abordagem na stack.** `svg-puro`. Com 50 linhas, 50 instâncias de `LineChart` do Recharts pesam
(cada uma com `ResponsiveContainer`, contexto e animação). Um componente `Sparkline` que calcula o
atributo `d` do `path` em TypeScript custa quase nada. O Recharts nativo (`LineChart` do exemplo Tiny
Line Chart, com `dot={false}`) fica para o caso de poucas linhas com tooltip.

```ts
export function sparkPath(ys: (number | null)[], w: number, h: number, [lo, hi]: [number, number]) {
  const step = ys.length > 1 ? w / (ys.length - 1) : 0;
  const y = (v: number) => h - ((v - lo) / (hi - lo || 1)) * h;
  let d = '';
  let pen = false;
  ys.forEach((v, i) => {
    if (v === null) { pen = false; return; } // quebra a linha no buraco
    d += `${pen ? 'L' : 'M'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`;
    pen = true;
  });
  return d;
}
```

**Ponto delicado.** A escala decide o que se pode comparar. Few lista cinco métodos: preencher a altura
com mínimo e máximo de cada linha (só forma); faixa fixa útil (ex.: 90% a 100%); mínimo e máximo da
série inteira (magnitude, mas achata); zero ao máximo da série com área preenchida (melhor para
magnitude); e faixa de referência sombreada com escala própria. A tabela precisa dizer no cabeçalho
qual escala usou. Datawrapper não oferece tooltip na sparkline e sugere rótulos de primeiro e último
valor; no Farol, tooltip só em ponteiro fino e nunca como única forma de ler.

**Versões sugeridas.**
- **V1 básica: 12 semanas de agendas por SDR.** Linha com escala própria por linha, último ponto em
  ciano e o valor da semana ao lado.
- **V2 com destaque: SLA de primeiro contato com faixa aceitável.** Banda cinza de 0 a 15 minutos em
  todas as linhas (método 5 de Few, faixa normal de Tufte) e pontos fora da banda em âmbar.
- **V3 densa do Farol: carteira de 20 executivos com três micrográficos.** Área de receita dos
  últimos 12 meses com escala comum a partir de zero, colunas de fechamentos por mês e linha de
  pipeline aberto com escala própria, cabeçalho declarando cada escala.
- **V4 caso limite: série curta e série com buraco.** Executivo contratado há 5 semanas (linha só nas
  5 posições finais, sem esticar para a largura toda) e semana sem carga de dado (quebra na linha, sem
  `connectNulls`).

**Referências.**
- Praticante: [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar marcação do último ponto, faixa normal e proporção que deixa a inclinação legível.
- Praticante: [Stephen Few, escala de sparklines em dashboards](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf): observar os cinco métodos de escala com o mesmo conjunto de dados.
- Catálogo: [Recharts, Tiny Line Chart](https://recharts.github.io/en-US/examples/TinyLineChart/): observar o `LineChart` mínimo com `dot={false}`.
- Catálogo: [Tremor, Spark Chart](https://www.tremor.so/docs/visualizations/spark-chart): observar `minValue`, `maxValue` e `connectNulls` expostos no micrográfico.
- Portal de design: sem referência específica verificada (Dribbble e Figma Community não carregaram nesta pesquisa).

**Mora melhor em outra família?** O micrográfico isolado (em cartão ou texto corrido) é da família 24.

---

## 4. Ranking com variação de posição

**Descrição.** Tabela ordenada por uma métrica que mostra, além da posição e do valor, quanto cada item
andou desde o período anterior: seta, número de posições, entrada nova e saída do topo. Responde "quem
subiu e quem caiu", que a barra ordenada sozinha não mostra.

**Anatomia.** Coluna de posição; coluna de variação de posição (ícone `ArrowUp`, `ArrowDown` ou `Minus`
do lucide com o número); rótulo; valor com barra opcional; variação do valor (absoluta e percentual);
selo "novo"; linha fantasma "saiu do top N" no fim.

**Abordagem na stack.** `html-tailwind` com lucide-react. O cálculo da posição anterior acontece no
seletor de dados, não no componente: a célula recebe `{ pos, posAnterior, valor, valorAnterior }`.

**Ponto delicado.** Posição menor é melhor, então "subiu" é `posAnterior - pos > 0`. Empates exigem
regra explícita (competição padrão "1, 2, 2, 4" com rótulo "2=" ou ordem por critério secundário
declarado). Item sem posição anterior é "novo", não "subiu 999". Para métricas em que menor é melhor
(ciclo de venda em dias, CPL), a ordenação inverte e a legenda precisa dizer.

**Versões sugeridas.**
- **V1 básica: receita reconhecida do trimestre.** Posição, executivo, valor e seta com delta de
  posição contra o trimestre anterior.
- **V2 com destaque: top 10 origens por leads qualificados.** Selo "novo" em "webinar de setembro",
  linha fantasma esmaecida "saiu do top 10: indicação de parceiro".
- **V3 densa do Farol: ranking de executivos com três variações.** Posição, delta de posição, delta
  de valor em R$ e em %, barra do valor atual e sparkline das posições nos últimos 6 meses.
- **V4 caso limite: empate e menor é melhor.** Dois executivos com a mesma receita dividindo "4=", e
  ranking de ciclo de venda em que subir no ranking significa reduzir de 48 para 39 dias.

**Referências.**
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a categoria Ranking (barra ordenada, slope, dot strip) como alternativas quando a variação importa mais que o valor.
- Catálogo: [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist): observar `sortOrder` e rótulo dentro da barra para listas ordenadas.
- Praticante: [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): observar a ordenação estratégica de linhas e colunas.
- Portal de design: [Behance, Data Table Web Desktop](https://www.behance.net/gallery/246319147/Data-Table-Web-Desktop): observar a convivência de indicadores de tendência com densidade de tabela (só metadados em texto verificados).

**Mora melhor em outra família?** Quando a história é a trajetória das posições ao longo de muitos
períodos, vira bump chart ou slope na família 17.

---

## 5. Matriz de comparação com status

**Descrição.** Entidades nas linhas, critérios qualitativos nas colunas e um símbolo de status em cada
cruzamento: cumpriu, parcial, não cumpriu, não se aplica, sem dado. Inclui a variante com bolas de
Harvey (círculos preenchidos em quartos), usadas para atributos difíceis de quantificar.

**Anatomia.** Cabeçalho de critérios (girado ou abreviado com tooltip); célula com ícone e rótulo
acessível; contagem por linha ("5 de 7") e por coluna; legenda dos símbolos no topo.

**Abordagem na stack.** `html-tailwind` com lucide-react (`Check`, `X`, `CircleDashed`, `Minus`). Bolas
de Harvey como pequeno `svg-puro` com `path` de arco calculado para 0, 1/4, 1/2, 3/4 e 1.

```ts
export function harveyPath(frac: 0 | 0.25 | 0.5 | 0.75 | 1, r = 7): string {
  if (frac === 0) return '';
  if (frac === 1) return `M ${r} 0 A ${r} ${r} 0 1 1 ${r - 0.01} 0 Z`;
  const a = -Math.PI / 2 + frac * 2 * Math.PI;
  const x = r + r * Math.cos(a);
  const y = r + r * Math.sin(a);
  return `M ${r} ${r} L ${r} 0 A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x} ${y} Z`;
}
```

**Ponto delicado.** Cinco estados que não podem se confundir: cumpriu, parcial, não cumpriu, não se
aplica e sem dado. Cada um com forma diferente, não só cor. A Wikipedia registra que caracteres Unicode
de bola de Harvey renderizam de forma desigual entre fontes; por isso SVG, não caractere. Se existe o
número por trás do status (ex.: 72% da meta), mostrar o número e deixar o status como derivado.

**Versões sugeridas.**
- **V1 básica: metas do ano por área.** Nove áreas por seis metas com check, parcial e X.
- **V2 com destaque: maturidade de processo com bolas de Harvey.** Cinco critérios por time comercial,
  destaque da coluna com pior média.
- **V3 densa do Farol: checklist de handoff por oportunidade.** 25 oportunidades por 7 critérios do
  handoff de pré-vendas para comercial, contagem por linha e por coluna, ordenação por pendências.
- **V4 caso limite: não se aplica e sem dado.** Traço neutro para "não se aplica" (oportunidade sem
  proposta ainda), ícone de ausência com tooltip "campo não preenchido no CRM fictício" e X para
  "não cumpriu".

**Referências.**
- Catálogo: [Wikipedia, Harvey balls](https://en.wikipedia.org/wiki/Harvey_balls): observar o uso em tabelas de comparação e a limitação de renderização por fonte.
- Praticante: [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/): observar a tabela realçada com cor, negrito e símbolos vencendo o radar.
- Catálogo: [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): observar cor e tooltip por bloco de status.
- Portal de design: sem referência específica verificada.

---

## 6. Tabela com bullet inline

**Descrição.** Cada linha traz um bullet graph compacto: barra do realizado, traço da meta e faixas
qualitativas ao fundo (ruim, atenção, bom). Resolve em uma célula o par valor e meta que o scorecard
mostra em duas colunas.

**Anatomia.** Faixas de fundo em tons de `--surface-overlay`; barra fina central do realizado; traço
vertical da meta; valor numérico à direita; cabeçalho com a escala comum.

**Abordagem na stack.** `svg-puro`, reaproveitando a geometria do `BulletChart.tsx` do kit numa versão
sem eixo, altura de 14 a 18 px e largura fixa por coluna.

**Ponto delicado.** As faixas qualitativas e a escala são comuns à coluna; se cada linha tem meta
diferente, normalizar em % da meta (meta = 100%) e dizer isso no cabeçalho. Valor acima do teto da
escala: barra encosta no fim e ganha marca de estouro, com o número real ao lado.

**Versões sugeridas.**
- **V1 básica: receita contra meta por executivo.** Escala em % da meta individual, faixas 0 a 70%,
  70 a 100% e acima de 100%.
- **V2 com destaque: capacidade contra teto por fila.** Fila "retorno de inbound" com 112% do teto,
  barra passando do trilho com marca âmbar.
- **V3 densa do Farol: 14 filas com dois bullets.** Entradas do mês contra teto de 300 e agendas
  contra meta de 90, cada coluna com sua escala.
- **V4 caso limite: sem meta e muito acima.** Linha sem meta cadastrada (só barra, texto "sem meta") e
  linha com 180% da meta (barra truncada no teto de 150% com seta).

**Referências.**
- Praticante: [Perceptual Edge, biblioteca de artigos de Few](https://www.perceptualedge.com/library.php): observar a entrada "Bullet Graph Design Specification", especificação original do bullet graph.
- Catálogo: [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table): observar largura fixa de coluna para micrográficos.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** O bullet sozinho, fora da tabela, pertence à família 13.

---

## 7. Tabela com barras divergentes inline

**Descrição.** Barras que saem de um eixo zero para a esquerda (negativo) e para a direita (positivo)
dentro da célula. Mostra variação, desvio contra meta ou saldo com sinal.

**Anatomia.** Linha vertical fina do zero; barra negativa e positiva em tokens de polaridade; número
com sinal explícito ("+12%", "−8%") fora da barra.

**Abordagem na stack.** `html-tailwind`. Posição do zero calculada por coluna:
`zero = -min / (max - min)` quando o domínio cruza zero; barra com `left` e `width` em %.

**Ponto delicado.** Se a coluna não tem negativos, o zero encosta à esquerda e o modelo vira o 1;
centralizar à força desperdiça metade da célula. Domínio simétrico (`[-M, M]`) facilita comparar
magnitudes dos dois lados; assimétrico aproveita espaço. Cor vem da polaridade da métrica (CPL
negativo é bom).

**Versões sugeridas.**
- **V1 básica: variação do CPL contra o mês anterior por plataforma.** Plataforma A −14% em verde,
  Plataforma C +22% em vermelho, porque CPL menor é melhor.
- **V2 com destaque: desvio de forecast contra realizado por executivo.** Linhas com erro acima de 20%
  para qualquer lado ganham ícone de alerta.
- **V3 densa do Farol: resultado por origem.** Receita atribuída menos custo de mídia em 16 origens,
  domínio simétrico, ordenado do maior saldo ao menor.
- **V4 caso limite: coluna só positiva e ausente.** Coluna de crescimento de base toda positiva (zero à
  esquerda) e origem sem custo importado (sem barra, "indisponível").

**Referências.**
- Catálogo: [Datawrapper Academy, barras em tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar a cor separada para valores negativos.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a categoria Deviation (barra divergente).
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Fora da tabela, barra divergente é família 02.

---

## 8. Tabela com composição 100% inline

**Descrição.** Uma barra empilhada de 100% por linha mostra o mix de categorias daquela entidade:
motivos de perda por executivo, origens dos fechamentos por trimestre, status de leads por origem.

**Anatomia.** Legenda de categorias no cabeçalho, em ordem fixa; barra segmentada; rótulo percentual só
nos segmentos acima de um limite (ex.: 12%); coluna com o n de cada linha.

**Abordagem na stack.** `html-tailwind` com `flex` e `flex-basis` em %. Cores `--chart-1` a `--chart-5`
na ordem do registry.

**Ponto delicado.** A ordem das categorias é a mesma em todas as linhas; só o primeiro segmento tem
base alinhada, então a categoria mais importante vai primeiro. Linha com n pequeno (ex.: 3 perdas)
produz percentuais enganosos: mostrar o n e esmaecer.

**Versões sugeridas.**
- **V1 básica: motivos de perda por executivo.** Preço, timing, concorrência, sem retorno, outros.
- **V2 com destaque: origem dos fechamentos por trimestre.** Segmento "indicação" em âmbar e os demais
  em neutros, para responder quanto do resultado veio de indicação.
- **V3 densa do Farol: status dos leads por origem.** 14 origens por novo, em cadência, agendado e
  descartado, ordenadas pela fatia de agendado.
- **V4 caso limite: n pequeno e cauda.** Linha com n = 3 hachurada e rótulo "n=3"; categorias abaixo
  de 5% agregadas em "outros".

**Referências.**
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a categoria Part-to-whole e a barra empilhada proporcional.
- Catálogo: [Datawrapper, nova ferramenta de tabelas](https://www.datawrapper.de/blog/new-table-tool-barcharts-fixed-rows-responsive-2): observar estilo por categoria em células e colunas.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Com poucas linhas e foco no mix, barra 100% em 02; com duas dimensões
e área proporcional, marimekko em 26.

---

## 9. Tabela com faixa de status temporal

**Descrição.** Cada linha traz uma fileira de blocos, um por dia ou semana, colorido pelo status daquele
período (dentro do SLA, atenção, estouro, sem dado). O Tremor chama o componente de Tracker e o usa para
monitoramento, com cor e tooltip por bloco.

**Anatomia.** Coluna de rótulo; fileira de blocos de largura igual e vão de 1 a 2 px; resumo à direita
("26 de 30 dias no SLA"); legenda de status no cabeçalho; marca de hoje.

**Abordagem na stack.** `html-tailwind`: `flex` de `div` com classe de cor por status e `Tooltip` do
Radix por bloco. O Tremor mostra recorte responsivo (menos blocos no celular), que o Farol reproduz com
`slice` por breakpoint.

**Ponto delicado.** Largura mínima de bloco de 4 px; abaixo disso, agregar por semana. Dia sem expediente
é neutro, dia sem dado é hachurado, e nenhum dos dois é pintado como falha. Status semântico usa
`--positive`, `--warning` e `--negative`, sempre com o resumo em texto ao lado.

**Versões sugeridas.**
- **V1 básica: SLA diário por fila nos últimos 30 dias.** Seis filas, verde dentro do SLA, âmbar
  atenção, vermelho estouro.
- **V2 com destaque: carga diária de dados por fonte.** Blocos de sucesso, carga parcial e falha para
  cinco fontes fictícias, com a fonte que falhou 3 dias seguidos destacada.
- **V3 densa do Farol: 12 SDRs por 60 dias úteis.** Status de meta diária de tentativas; no celular
  mostra só os últimos 20 dias.
- **V4 caso limite: calendário irregular.** Feriado e fins de semana neutros, dois dias sem dado
  hachurados, SDR admitido há 9 dias sem blocos antes da admissão.

**Referências.**
- Catálogo: [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): observar cor por bloco, `defaultBackgroundColor`, tooltip e recorte responsivo.
- Praticante: [Edward Tufte, sparklines](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar a lógica de gráfico do tamanho de palavra aplicada a eventos binários.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Uma fileira isolada, fora de tabela, é microvisual da família 24; muitas
entidades por muitos dias com valor contínuo é o lasagna da família 15.

---

## 10. Lista de barras com rótulo

**Descrição.** A tabela mais enxuta possível: nome e valor de um top N, com a barra desenhada atrás do
rótulo. O Tremor chama de BarList e expõe ordenação, formatação de valor e clique por barra.

**Anatomia.** Barra de fundo translúcida com o rótulo por cima; valor à direita; ordenação decrescente;
linha final "outras N" agregando a cauda.

**Abordagem na stack.** `html-tailwind`: `div` relativo com barra absoluta em `--accent-cyan-soft` e
texto em `--text-primary`. Clique abre o `DrillDrawer` do kit.

**Ponto delicado.** O rótulo precisa ter contraste tanto sobre a barra quanto fora dela; a barra usa tom
suave e o texto não muda de cor. Nome longo trunca com reticências e tooltip. A cauda agregada não entra
no domínio das barras.

**Versões sugeridas.**
- **V1 básica: top 8 origens de lead do mês.** Ordenadas por entradas.
- **V2 com destaque: motivos de perda clicáveis.** Clique em "preço" abre a lista das 37 oportunidades
  perdidas por preço.
- **V3 densa do Farol: criativos por leads qualificados.** 15 criativos com valor e percentual do
  total, barra do criativo pausado em cinza.
- **V4 caso limite: nomes longos e cauda.** Nomes de campanha de 60 caracteres truncados, "outras 23
  origens" somadas no fim.

**Referências.**
- Catálogo: [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist): observar `sortOrder`, `valueFormatter` e `onValueChange`.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** É barra horizontal simplificada; o modelo completo está na família 02.

---

## 11. Tabela com ponto e intervalo inline

**Descrição.** Cada linha mostra um ponto (valor central) e uma faixa (mínimo e máximo, intervalo
interquartil, pessimista a otimista) sobre uma escala comum à coluna, com marcador de referência.

**Anatomia.** Linha fina do intervalo; ponto do valor central; traço vertical de referência (média,
meta); valores numéricos das pontas em tooltip e o central em texto.

**Abordagem na stack.** `svg-puro`: `line` para o intervalo, `circle` para o ponto e `line` vertical para
a referência, com a escala da coluna calculada uma vez.

**Ponto delicado.** Intervalo sem legenda é ininteligível; o cabeçalho diz o que a faixa representa. Few
mostra, no método 5 de escala de sparklines, que uma faixa de referência sombreada comum a todas as
linhas facilita ver quem está acima ou abaixo. Linha com amostra de 1 não tem intervalo.

**Versões sugeridas.**
- **V1 básica: ticket médio por executivo contra a média do time.** Ponto do ticket e traço da média.
- **V2 com destaque: cenários da diretoria com saída em faixa.** Para cada métrica, faixa de
  pessimista a otimista e ponto do cenário base; métricas cuja faixa não alcança a meta em âmbar.
- **V3 densa do Farol: tempo de ciclo por executivo.** Mediana e intervalo interquartil de 20
  executivos, ordenados pela mediana.
- **V4 caso limite: faixa cruzando zero e amostra de um.** Margem por origem com intervalo de −4% a +9%
  e executivo com um único negócio (só ponto, rótulo "n=1").

**Referências.**
- Praticante: [Stephen Few, escala de sparklines](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf): observar a faixa de referência sombreada comum às linhas.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar dot strip plot e dot plot nas categorias Distribution e Ranking.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Fora da tabela, com foco na distribuição, famílias 16 e 17.

---

## 12. Scorecard tabular

**Descrição.** Uma linha por KPI com valor atual, meta, variação contra o período anterior e seta de
tendência. É o cartão de KPI da família 01 empilhado em forma de tabela, útil quando são 8 a 20
indicadores.

**Anatomia.** Métrica com unidade; valor; meta; atingimento em %; variação absoluta e percentual; ícone de
tendência (`TrendingUp`, `TrendingDown`, `Minus`); selo de procedência.

**Abordagem na stack.** `html-tailwind` com lucide-react; cor da seta calculada pela polaridade do
registry.

**Ponto delicado.** A seta indica direção do número e a cor indica se é bom: CPL subindo tem seta para
cima em vermelho. Variação sobre base zero não é percentual ("sem base"). Oscilação dentro de uma banda
de estabilidade (ex.: 2%) vira "estável" para não produzir falsos alarmes.

**Versões sugeridas.**
- **V1 básica: resumo mensal do Marketing.** Leads, MQL, CPL, CPL qualificado, agendas e investimento.
- **V2 com destaque: polaridade.** CPL +12% com seta para cima em vermelho ao lado de taxa de agenda +12%
  com seta para cima em verde, e nota de rodapé explicando a regra.
- **V3 densa do Farol: scorecard da diretoria.** 15 métricas agrupadas por área, com selo MEDIDO,
  DERIVADO, PREMISSA ou LACUNA em `--prov-*`.
- **V4 caso limite: sem base e estável.** Métrica nova sem período anterior ("sem base") e métrica com
  variação de +0,8% marcada "estável".

**Referências.**
- Praticante: [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): observar tabelas para métricas variadas com unidades diferentes em resumos executivos.
- Catálogo: [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table): observar formatação numérica por coluna e linhas fixas.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Com poucos KPIs e espaço, cartões da família 01.

---

## 13. Tabela cruzada com totais marginais

**Descrição.** Contagem ou soma por duas dimensões (executivo por etapa, origem por mês) com totais de
linha e de coluna. Com a cor no miolo, fica a meio caminho do heatmap; com barras nos totais, mostra o
peso de cada linha e coluna.

**Anatomia.** Miolo numérico (com ou sem cor); coluna de total com barra horizontal; linha de total com
barra vertical ou horizontal; célula de canto com o total geral; seletor de percentual (do total, por
linha, por coluna).

**Abordagem na stack.** `html-tailwind` em CSS grid, com a cor do miolo pela mesma função do modelo 2 e
as barras marginais pelo modelo 1.

**Ponto delicado.** Totais têm escala própria e nunca entram na escala de cor do miolo. O percentual
precisa dizer o denominador no próprio cabeçalho ("% da linha"). Zero e vazio são diferentes: vazio é
combinação impossível ou sem registro, zero é registro sem ocorrência.

**Versões sugeridas.**
- **V1 básica: oportunidades abertas por executivo e etapa.** Totais simples nas margens.
- **V2 com destaque: heatmap no miolo e barras nas margens.** Etapa "proposta" com a coluna mais
  carregada destacada.
- **V3 densa do Farol: leads por origem e mês.** 14 origens por 12 meses, totais com barras e
  alternador de percentual por linha.
- **V4 caso limite: denominador e vazio.** Alternador entre "% do total", "% da linha" e "% da coluna"
  com rótulo explícito; origem criada em junho com células vazias antes disso.

**Referências.**
- Praticante: [Stephen Few, análise multivariada com heatmaps](https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf): observar leitura por linha (perfil) e por coluna (variável) na mesma matriz.
- Catálogo: [Vega-Lite, Table Heatmap](https://vega.github.io/vega-lite/examples/rect_heatmap.html) (não abriu): exemplo de tabela colorida por média agregada em duas dimensões discretas.
- Portal de design: sem referência específica verificada.

**Mora melhor em outra família?** Sem números visíveis e com foco em padrão, heatmap da família 15
(modelo 9).

---

## 14. Tabela agrupada com subtotais e linha fixa

**Descrição.** Linhas agrupadas por uma dimensão curta (time, área, canal) com subtotal por grupo e uma
linha fixa de referência (média da casa, total) que não sai da tela ao rolar ou filtrar.

**Anatomia.** Cabeçalho duplo quando as colunas também têm grupo (Datawrapper permite duas linhas de
cabeçalho); linha de grupo com rótulo e subtotal; linhas filhas recuadas; linha fixa com fundo próprio.

**Abordagem na stack.** `html-tailwind` sobre o TanStack Table já instalado (agrupamento e linhas
expansíveis são recursos dele); linha fixa com `position: sticky` dentro do contêiner de rolagem da
tabela.

**Ponto delicado.** Ordenar por coluna ordena dentro de cada grupo, preservando os grupos; ordenar
quebrando grupos é outro modo e precisa de controle próprio. Subtotal fica fora do domínio das barras.
Grupo com uma única linha omite o subtotal redundante. `sticky` não funciona se algum ancestral tiver
`overflow: hidden`.

**Versões sugeridas.**
- **V1 básica: pipeline por time comercial.** Três times com subtotal de pipeline e de fechamentos.
- **V2 com destaque: média da casa fixa.** Linha "média da casa" presa no topo enquanto o leitor rola
  22 executivos.
- **V3 densa do Farol: custo em três camadas por área.** Colunas agrupadas em camada 1, 2 e 3 com
  cabeçalho duplo, áreas agrupadas com subtotal e total geral fixo no rodapé.
- **V4 caso limite: grupo unitário e filtro.** Time com um executivo sem subtotal; filtro que esvazia um
  grupo mostra o grupo recolhido com "nenhuma linha neste recorte".

**Referências.**
- Catálogo: [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table): observar linhas fixas, cabeçalho duplo e listras para tabelas largas.
- Praticante: [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): observar rótulos de supercategoria para reduzir repetição.
- Catálogo: [shadcn/ui, Data Table](https://ui.shadcn.com/docs/components/data-table): observar a composição sobre TanStack Table com ordenação, filtro, visibilidade de colunas e ações por linha.
- Portal de design: sem referência específica verificada.

---

## 15. Tabela com linha expansível

**Descrição.** Cada linha resume uma entidade; ao expandir, abre um painel com detalhe gráfico (série,
distribuição, histórico) sem trocar de tela. É o "foco com contexto" do TableLens: abrir uma região com
mais detalhe sem perder as demais linhas de vista.

**Anatomia.** Botão de expandir com `ChevronRight` girando; linha resumo; painel de detalhe ocupando a
largura da tabela; indicador de linhas abertas.

**Abordagem na stack.** `html-tailwind` para a estrutura (expansão do TanStack Table) e `recharts-nativo`
no painel de detalhe (`LinesChart.tsx` ou `BarsChart.tsx` do kit).

**Ponto delicado.** Montar o gráfico do detalhe só quando a linha abre (renderização condicional), senão
50 linhas montam 50 gráficos na carga. Foco de teclado vai para o painel ao abrir e volta ao botão ao
fechar; `aria-expanded` no botão. Detalhe que precisa ser comparado entre linhas não deve morar em painel
expansível.

**Versões sugeridas.**
- **V1 básica: oportunidades perdidas com histórico.** Expandir mostra as etapas percorridas com datas.
- **V2 com destaque: executivo com série e motivos.** Painel com linha de receita de 12 meses e barra de
  motivos de perda, com o motivo dominante destacado.
- **V3 densa do Farol: filas de pré-vendas.** Linha com volume, SLA e capacidade; detalhe com o heatmap
  de entradas por dia e hora daquela fila (família 15).
- **V4 caso limite: detalhe sem dado e várias abertas.** Painel com estado "sem histórico neste recorte"
  e três linhas abertas ao mesmo tempo com navegação por teclado.

**Referências.**
- Praticante: [Ramana Rao, TableLens](https://www.perceptualedge.com/articles/b-eye/tablelens.pdf): observar foco com contexto e reorganização de colunas como apoio ao raciocínio.
- Catálogo: [shadcn/ui, Data Table](https://ui.shadcn.com/docs/components/data-table): observar o padrão de ações por linha e composição de componentes reutilizáveis.
- Portal de design: [Behance, plataforma de relatórios e analytics](https://www.behance.net/gallery/176149443/ReportPro-Reporting-and-Analytics): projeto com tags de tabelas, relatório e CRM; observar hierarquia entre resumo e detalhe (só metadados em texto verificados).

---

## 16. Tabela de cobertura e procedência

**Descrição.** Modelo específico da postura do Farol: além do valor, cada linha mostra quanto do dado
existe (cobertura de campos) e de onde o número vem (procedência). Evita a leitura de uma taxa calculada
sobre 20% da base como se fosse a base inteira.

**Anatomia.** Coluna de volume; colunas de cobertura por campo com barra de preenchimento de 0 a 100%;
selo de procedência (MEDIDO, DERIVADO, PREMISSA, LACUNA, PROTÓTIPO) com os tokens `--prov-*`; célula de
taxa que troca o percentual por fração ("3 de 4") quando o denominador é pequeno; nota de rodapé com a
regra.

**Abordagem na stack.** `html-tailwind` com `ProvenanceBadge.tsx` do kit e barras do modelo 1.

**Ponto delicado.** Limiares explícitos e iguais em todas as telas: abaixo de n mínimo, fração em vez de
percentual; abaixo de cobertura mínima, taxa esmaecida com ícone e tooltip. "Indisponível" (a operação
não tem o dado) não é "0%" (a operação tem o dado e ele é zero). Uma coluna inteira LACUNA vira um único
aviso no cabeçalho, não 14 células repetindo a palavra.

**Versões sugeridas.**
- **V1 básica: cobertura de campos por origem de lead.** Percentual de leads com telefone, e-mail
  corporativo, cargo e cidade por 10 origens.
- **V2 com destaque: selo de procedência por métrica.** CPL MEDIDO, CPL qualificado DERIVADO, receita
  atribuída PREMISSA, com legenda dos selos.
- **V3 densa do Farol: leads por origem com cobertura.** 14 origens com volume, CPL, cinco colunas de
  cobertura e taxa de agenda, esmaecida onde a cobertura de telefone está abaixo de 50%.
- **V4 caso limite: denominador pequeno e coluna lacuna.** "Evento regional" com 4 leads mostrando "3
  de 4" em vez de 75%; coluna "receita por origem" inteira como LACUNA com aviso único no cabeçalho.

**Referências.**
- Catálogo: [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table): observar cor condicional por categoria em células.
- Catálogo: [Datawrapper Blog, heatmaps em tabelas](https://www.datawrapper.de/blog/heatmaps-for-tables): observar legenda de escala e faixa customizada como forma de dizer o que a cor significa.
- Praticante: [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): observar o uso de elementos visuais para dirigir a leitura aos valores importantes.
- Portal de design: sem referência específica verificada.

---

## Fontes consultadas

Abertas nesta pesquisa (2026-09-14):

- Datawrapper Academy, barras, colunas e linhas em tabelas: https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables
- Datawrapper Academy, customizando a tabela: https://www.datawrapper.de/academy/customizing-your-table
- Datawrapper Academy, tabelas com atualização contínua (mini colunas, sparklines e heatmaps): https://www.datawrapper.de/academy/how-to-create-live-updating-tables
- Datawrapper Blog, heatmaps em tabelas: https://www.datawrapper.de/blog/heatmaps-for-tables
- Datawrapper Blog, nova ferramenta de tabelas: https://www.datawrapper.de/blog/new-table-tool-barcharts-fixed-rows-responsive-2
- Ramana Rao, TableLens (acervo Perceptual Edge): https://www.perceptualedge.com/articles/b-eye/tablelens.pdf
- Stephen Few, escala de sparklines em dashboards: https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf
- Stephen Few, Heatmaps: to bin or not to bin?: https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf
- Stephen Few, análise multivariada com heatmaps: https://www.perceptualedge.com/articles/b-eye/heatmaps.pdf
- Perceptual Edge, biblioteca de artigos: https://www.perceptualedge.com/library.php
- Edward Tufte, sparkline theory and practice: https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/
- Storytelling with Data, o que é uma tabela: https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table
- Junk Charts, alternativas ao radar: https://www.junkcharts.com/alternatives-to-radar-chart-1/
- FT Visual Vocabulary: https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- Vega-Lite, texto sobre heatmap: https://vega.github.io/vega-lite/examples/layer_text_heatmap.html
- Recharts, Tiny Line Chart: https://recharts.github.io/en-US/examples/TinyLineChart/
- Tremor, Tracker: https://www.tremor.so/docs/visualizations/tracker
- Tremor, BarList: https://www.tremor.so/docs/visualizations/barlist
- Tremor, Spark Chart: https://www.tremor.so/docs/visualizations/spark-chart
- shadcn/ui, Data Table: https://ui.shadcn.com/docs/components/data-table
- Wikipedia, Harvey balls: https://en.wikipedia.org/wiki/Harvey_balls
- Behance, Data Table Web Desktop: https://www.behance.net/gallery/246319147/Data-Table-Web-Desktop
- Behance, plataforma de relatórios e analytics: https://www.behance.net/gallery/176149443/ReportPro-Reporting-and-Analytics

Apareceram em busca mas não carregaram ou não foram abertas:

- Vega-Lite, Table Heatmap (não abriu): https://vega.github.io/vega-lite/examples/rect_heatmap.html
- Datawrapper, página de tabelas (não abriu): https://www.datawrapper.de/tables
- Hands-On Data Visualization, tabela com sparklines (não abriu): https://handsondataviz.org/table-datawrapper.html

Lacunas desta família: Dribbble e Figma Community não renderizaram conteúdo para leitura automática, então
não há referência de portal de design verificada para vários modelos; as páginas do Behance abriram só com
metadados em texto (título, tags e descrição), sem inspeção das imagens.
