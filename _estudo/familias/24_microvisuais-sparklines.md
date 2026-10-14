# 24 Microvisuais e sparklines

> Família do catálogo VISUAIS do Farol. Estudo feito em 2026-09-14. Todos os casos de uso são fictícios; nomes de pessoas, plataformas e produtos são rótulos genéricos.
> Stack alvo: React 18.3 + TypeScript strict + Recharts 3.10 + Tailwind 4 + lucide-react. Bibliotecas de terceiros aparecem só como referência de desenho.

## O que a família responde

Esta família não tem um tipo de dado próprio. Ela tem um **tamanho**: o gráfico cabe dentro de uma célula de tabela, de um card de KPI ou de uma linha de texto. Tufte batizou a forma de sparkline e a definiu como "a small intense, simple, word-sized graphic with typographic resolution", com a exigência de que o gráfico tenha "the resolution of typography" e fique "where they are discussed", ou seja, colado no número que ele explica.

A consequência prática é que o microvisual troca **precisão de leitura** por **densidade e vizinhança**. Ninguém lê valor exato num sparkline; lê forma, direção, ruptura e posição relativa. Em compensação, cabem 200 deles numa tela, um por linha da tabela, e o olho compara linha a linha sem trocar de tela.

Perguntas típicas no Farol:

* Esse número subiu ou caiu, e desde quando? (receita reconhecida do mês com a série dos 12 meses ao lado)
* Quais das 40 origens de lead mudaram de comportamento no trimestre? (sparkline por linha da tabela de origens)
* Esse executivo está acima ou abaixo da meta, e quanto é "acima"? (bullet micro por executivo)
* Quantas semanas dessa fila bateram o SLA? (win/loss de 26 semanas numa célula)
* Do que é feito esse total, sem gastar uma pizza inteira? (barra de composição mini na linha da tabela)
* Esse CPL de R$ 412 é bom? (sparkline com faixa de normalidade, o número dentro ou fora da banda)
* Quanto do dado dessa origem existe? (medidor de cobertura ao lado do próprio indicador)
* A capacidade da pré-vendas encostou no teto? (barra com marcador de teto, uma por fila)

## Onde a fronteira desta família fica

Quase todo modelo daqui é a versão reduzida de um modelo de outra família. A regra de moradia que este estudo adota:

* **O modelo mora aqui** quando o encolhimento muda o desenho, e não só a escala: some eixo, some legenda, some grade, some rótulo intermediário, a escala passa a ser implícita e a leitura vira comparativa entre linhas vizinhas. Sparkline, win/loss, bullet micro, pílula de variação e faixa de calor nascem pequenos.
* **O modelo mora na família grande** quando o encolhimento é só uma questão de `width` e `height`. Um gráfico de linha com eixo, legenda e tooltip continua sendo 04_linhas mesmo em 320 px.
* Referências cruzadas explícitas aparecem em cada modelo: 13_progresso-meta-e-gauge (progresso e gauge), 14_tabelas-visuais (a tabela que hospeda os microvisuais), 15_mapa-de-calor-e-calendario (faixa de calor e grade de atividade), 16_distribuicao (strip plot e boxplot), 17_comparacao-de-pontos (dumbbell), 22_unidades-waffle-e-pictograma (waffle), 01_cards-e-kpis (o card que hospeda o sparkline), 05_areas (horizonte).

## Regras que valem para a família inteira

1. **Tamanho é a especificação, não o acaso.** Tremor fixa o spark chart em `h-12 w-28` (48 px por 112 px) e é uma boa âncora: sparkline de card entre 96 px e 140 px de largura por 32 px a 48 px de altura; sparkline de célula de tabela entre 60 px e 100 px por 20 px a 28 px. Abaixo de 60 px de largura a forma vira ruído.
2. **Proporção governa a leitura da tendência.** Tufte pede o perfil "lumpy", com inclinações médias perto de 45 graus (banking to 45°). Sparkline muito achatado esconde a subida; muito alto transforma ruído em drama. Na prática: escolher a altura em função do intervalo da série, não do espaço sobrando.
3. **O que sai:** eixo, grade, legenda, rótulo de ponto intermediário, animação. O que fica: a forma, o último ponto e, no máximo, um extremo. Tremor entrega os spark charts sem eixo, sem legenda e sem tooltip por padrão; Datawrapper registra o mesmo limite: "sparklines do not have hover tooltip capability".
4. **O número vive ao lado, não dentro.** O microvisual é adjunto de um número legível. Tufte manda colocá-lo "where they are discussed". Num card: número grande, microvisual embaixo ou ao lado. Numa tabela: coluna de valor, coluna de microvisual.
5. **Escala compartilhada ou escala por linha, sempre declarada.** Datawrapper expõe as duas: deixar o intervalo em branco faz cada célula preencher o próprio espaço; preencher mínimo e máximo dá eixo comum a todas. As duas mentem de formas diferentes. Escala por linha compara **forma**; escala comum compara **nível**. A legenda da tabela precisa dizer qual está em uso.
6. **Recorte de série curta distorce.** Sparkline de 6 pontos não é tendência, é ruído. Piso prático: 12 pontos para série mensal, 8 para semanal, e recusar a renderização abaixo disso, com um traço neutro e a nota "série curta".
7. **Cor carrega polaridade, não identidade.** Num microvisual não cabe legenda, então a cor precisa significar algo universal na tela: bom, ruim, neutro, ou o destaque da linha selecionada. Paleta categórica de 8 cores dentro de 100 px não é lida.
8. **Verde e vermelho sozinhos não bastam.** Pílula de variação e win/loss precisam de sinal textual (mais, menos, seta) além da cor. Daltonismo e monocromia de impressão quebram a leitura só por cor.
9. **Dado ausente é estado, não zero.** Buraco na série vira lacuna visível (linha interrompida, coluna vazada), nunca zero; `connectNulls` ligado esconde a falha de coleta. No Farol isso importa porque cobertura de dado é um indicador em si.
10. **Sem tooltip por padrão, mas com acesso ao dado.** Se o usuário precisa do valor exato, ele clica e abre a família grande (04_linhas, 03_colunas). O microvisual é porta de entrada, não destino. Quando o tooltip existir, ele deve ter `isAnimationActive={false}` para não piscar em grade densa.
11. **Desempenho é regra de desenho aqui.** 200 sparklines na tela são 200 instâncias de gráfico. Com Recharts, `ResponsiveContainer` por linha custa um `ResizeObserver` por linha; para tabela longa, largura e altura fixas em pixel e `isAnimationActive={false}`. Acima de ~120 microvisuais por tela, SVG puro calculado em TypeScript ganha da biblioteca com folga.
12. **Acessibilidade não é opcional só porque o gráfico é pequeno.** Cada microvisual carrega `role="img"` e um `aria-label` que diz a leitura em palavras ("receita de 12 meses, alta de 18 por cento, último valor R$ 1,4 mi"). O leitor de tela recebe a frase, não o SVG.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 24.1 | Sparkline de linha | Forma de uma série contínua ao lado do número | Menos de 8 pontos; categorias sem ordem | Escala por linha vendida como se fosse comum |
| 24.2 | Sparkline com extremos e valor final | Quando o leitor precisa de âncora numérica | Espaço que não comporta o rótulo | Rótulo sobreposto ao traço no último ponto |
| 24.3 | Sparkline de área | Dar peso visual a volume acumulado | Várias séries sobrepostas | Gradiente forte que come a linha |
| 24.4 | Sparkline com faixa de normalidade | Julgar se o valor está dentro do esperado | Faixa arbitrária, sem fonte | Banda cinza mais visível que o dado |
| 24.5 | Sparkline com série de comparação | Ano anterior, meta ou par de referência | Mais de duas séries | Duas séries de peso igual, sem hierarquia |
| 24.6 | Sparkline com cauda de projeção | Realizado mais previsto no mesmo traço | Projeção sem faixa de incerteza | Tracejado que parece dado medido |
| 24.7 | Sparkbar (colunas) | Valores discretos por período | Série longa que vira franja | Barras de 1 px sem espaçamento |
| 24.8 | Sparkbar divergente | Variação com sinal em torno do zero | Série que quase nunca cruza o zero | Zero fora do centro visual |
| 24.9 | Win/loss | Resultado binário por período | Quando a magnitude importa | Usar quando a intensidade era a história |
| 24.10 | Horizonte micro | Dezenas de séries longas empilhadas | Público que nunca viu a forma | Mais de 3 bandas sem legenda de bandas |
| 24.11 | Área empilhada micro | Mudança de mix ao longo do tempo | Mais de 4 componentes | Componentes sem ordem estável |
| 24.12 | Barra de dado em célula | Ranking e magnitude dentro da tabela | Quando o número já basta | Barra com escala por linha num ranking |
| 24.13 | Barra de composição mini | Parte do todo por linha | Mais de 5 partes | Fatias de 2 px sem agrupar em "outros" |
| 24.14 | Bullet micro | Realizado contra meta com faixas de contexto | Sem meta definida | Faixas qualitativas inventadas |
| 24.15 | Barra com teto de capacidade | Demanda contra limite operacional | Limite que muda toda semana | Esconder a parte que estoura o teto |
| 24.16 | Strip plot micro | Espalhamento de poucos valores por linha | Mais de ~60 pontos por célula | Pontos sobrepostos sem transparência |
| 24.17 | Boxplot micro | Comparar distribuições linha a linha | Menos de ~10 observações | Caixa sem dizer qual quartil está desenhado |
| 24.18 | Micro dumbbell | Antes e depois em uma célula | Mais de dois pontos | Não indicar qual ponto é o atual |
| 24.19 | Micro dispersão | Relação de duas medidas por linha | Poucos pontos ou correlação fraca | Eixo implícito que ninguém decifra |
| 24.20 | Pílula de variação | Delta ao lado do KPI | Base pequena, delta instável | Percentual sobre base minúscula |
| 24.21 | Seta de tendência no texto | Direção dentro de uma frase ou rótulo | Quando a magnitude importa | Seta sem o valor que a sustenta |
| 24.22 | Medidor de cobertura de dado | Qualificar o próprio indicador | Fonte com 100 por cento de cobertura sempre | Indicador exibido sem a ressalva de cobertura |
| 24.23 | Faixa de calor | Muitos períodos em pouca largura | Escala divergente sem ponto neutro claro | Verde e vermelho sem alternativa |
| 24.24 | Micro waffle de contagem | Contagens pequenas e inteiras | Acima de ~50 unidades | Unidade que não é contável de verdade |
| 24.25 | Micro anel | Um percentual único dentro de um chip | Comparação entre linhas | Anel usado onde barra leria melhor |
| 24.26 | Sparkline em degraus | Nível que muda aos saltos (headcount, preço, meta) | Métrica contínua | Interpolar entre níveis e inventar transição |
| 24.27 | Sparkline de faixa por período | Mínimo, máximo e fechamento de cada semana | Público sem hábito de ler faixa | Barra de faixa confundida com barra de volume |
| 24.28 | Barra de desvio em célula | Um único desvio contra referência por linha | Série temporal | Cor por sinal em métrica onde alta é ruim |
| 24.29 | Marcador em trilho | Onde o valor de hoje cai dentro de uma faixa | Faixa sem definição de fonte | Trilho sem mínimo e máximo declarados |
| 24.30 | Barras pareadas mini | Atual contra anterior em duas barras | Mais de dois períodos | Barras com bases diferentes |
| 24.31 | Micro slope | Direção entre dois instantes por linha | Mais de dois instantes | Inclinação lida sem escala comum |
| 24.32 | Faixa de status (tracker) | Estado categórico por período, dezenas de períodos | Estado contínuo | Cinza de "sem dado" igual a "ok" |
| 24.33 | Ponto de status | Semáforo de uma linha contra regra explícita | Sem regra de corte declarada | Cor sozinha, sem rótulo textual |
| 24.34 | Grade de atividade micro | Dia a dia de um mês ou ano em pouca área | Quando a sequência importa mais que o dia da semana | Semana começando em dia diferente entre grades |
| 24.35 | Histograma micro | Forma da distribuição por linha | Menos de ~30 observações | Faixas de classe diferentes entre linhas |
| 24.36 | Cascata micro | Ponte de um total a outro numa célula | Mais de ~8 passos | Totais desenhados como variação |
| 24.37 | Funil micro | Conversão por etapa numa linha de tabela | Etapas que não são subconjunto | Largura proporcional ao valor sem piso de leitura |
| 24.38 | Barra divergente empilhada mini | Escala ordinal com centro neutro | Categorias sem ordem | Neutro fora do centro visual |
| 24.39 | Ranking micro (bump strip) | Posição no ranking ao longo do tempo | Quando a magnitude importa | Rank 1 embaixo, invertendo a leitura |
| 24.40 | Curva de concentração micro | Quanto do total vem de poucos itens | Menos de ~10 itens | Itens sem ordenação decrescente |
| 24.41 | Linha do tempo de eventos micro | Quando aconteceram eventos pontuais | Eventos simultâneos demais | Eventos sobrepostos sem agrupamento |


---

## 24.1 Sparkline de linha

**Descrição.** A forma canônica da família: uma polilinha sem eixo, sem grade, sem legenda, colada ao número que ela explica. A Wikipedia a define como "a very small line chart, typically drawn without axes or coordinates, that presents the general shape of a variation (typically over time) in some measurement". Tufte acrescenta a exigência de resolução tipográfica e a instrução de que ela fique onde o assunto é discutido. O que se lê nela é forma e direção, não valor.

**Anatomia.** Traço de 1,5 px a 2 px; domínio horizontal igual ao intervalo da série; domínio vertical do mínimo ao máximo da própria série com folga de 5 a 10 por cento em cima e embaixo para o traço não encostar na borda; sem marcadores de ponto; caixa de 96 a 140 px por 32 a 48 px; opcionalmente um ponto no último valor.

**Abordagem na stack.** `recharts-nativo`. `LineChart` com `margin={{ top: 2, right: 2, bottom: 2, left: 2 }}`, um `Line` com `dot={false}`, `activeDot={false}`, `isAnimationActive={false}`, `strokeWidth={2}`, `type="monotone"` ou `"linear"`, e **nenhum** `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip` ou `Legend`. Tremor faz exatamente isso no `SparkLineChart` e fixa o tamanho em `h-12 w-28`. Se a tabela passar de ~120 linhas, trocar por `svg-puro`: o cálculo é um mapeamento linear de domínio para viewBox e um `path` com `M` e `L`, sem dependência nem `ResizeObserver`.

**Ponto delicado.** A escala vertical. Sem eixo, o leitor assume que linhas vizinhas são comparáveis, e elas não são se cada uma normaliza pelo próprio mínimo e máximo. Datawrapper deixa a escolha explícita: intervalo em branco faz a célula preencher o próprio espaço, intervalo preenchido dá eixo comum. A decisão é de produto, não de componente: escala por linha compara **forma**, escala comum compara **nível**. Qualquer que seja, o cabeçalho da coluna precisa dizer. O segundo ponto delicado é a proporção: Tufte pede inclinações médias perto de 45 graus, o que na prática significa escolher a altura em função da amplitude relativa da série, não do espaço sobrando no card.

**Versões sugeridas.**
- **V1 básica: receita reconhecida, 12 meses.** Card do Comercial com o número grande e o sparkline embaixo, escala própria, sem rótulo nenhum. Serve só para responder "a forma é de alta, queda ou serra".
- **V2 com destaque: o trecho que virou a conversa.** A mesma série com os três últimos meses em cor cheia e o resto em `--muted`, mais uma linha pontilhada horizontal na média do período. O destaque sai de um segundo `Line` cujo `dataKey` devolve `null` fora da janela de destaque.
- **V3 densa do Farol: tabela de 38 origens de lead.** Uma coluna de sparkline por origem, 18 meses, escala **comum** a todas porque a pergunta é "qual origem carrega volume", com o cabeçalho dizendo "mesma escala em todas as linhas". Renderização em SVG puro; 38 instâncias de Recharts com `ResponsiveContainer` custam 38 observadores de redimensionamento sem necessidade.
- **V4 caso limite: origem com coleta interrompida.** Uma das origens não tem dado entre março e junho. Nada de `connectNulls`; o traço interrompe e a lacuna fica visível, com o `aria-label` dizendo "4 meses sem coleta". Origem com menos de 8 pontos não desenha linha: mostra um traço neutro e o texto "série curta".

**Referências.**
- Catálogo: [Wikipedia, sparkline](https://en.wikipedia.org/wiki/Sparkline): observar a definição sem eixo nem coordenadas, a atribuição a Tufte e a menção a agrupar sparklines como small multiples.
- Catálogo: [Recharts, Simple Line Chart](https://recharts.github.io/en-US/examples/SimpleLineChart/): observar que a versão 3 aceita `responsive` e `style` com `aspect-ratio` no próprio `LineChart`, o que evita envolver cada sparkline num `ResponsiveContainer`.
- Praticante: [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar "word-sized graphic with typographic resolution", o banking to 45 graus e a instrução de manter o gráfico junto do texto que o discute.
- Praticante: [Datawrapper Academy, how to add bar charts, column charts and line charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar a escolha entre escala individual e escala compartilhada e o registro de que sparkline não tem tooltip.
- Portal de design: [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline): observar a recorrência do par número grande mais traço curto e a largura típica do traço em cards escuros.

**Mora melhor em outra família?** Se o gráfico ganha eixo, legenda e tooltip, ele é 04_linhas. Se o sparkline é só o rodapé de um card de KPI, o card inteiro é 01_cards-e-kpis e este modelo é o ingrediente.

---

## 24.2 Sparkline com extremos e valor final

**Descrição.** O sparkline de linha mais um punhado de âncoras numéricas: ponto no último valor com o número ao lado, e pontos nos extremos da série. É a versão que Tufte de fato publica, com "colored dots at endpoints to link sparklines with numerical values", tipicamente vermelho nas pontas e azul nos máximos e mínimos do período. Resolve a crítica mais comum ao sparkline puro: sem número, o leitor não sabe de que ordem de grandeza está falando.

**Anatomia.** Traço; círculo de 3 px no último ponto na cor de destaque; círculos menores no máximo e no mínimo em cor secundária; rótulo numérico à direita do último ponto, fora da área do traço; opcionalmente os rótulos de máximo e mínimo em texto menor, acima e abaixo.

**Abordagem na stack.** `recharts-custom`. `Line` com `dot={false}` e um `dot` só no último índice via função `dot={(props) => props.index === ultimo ? <circle .../> : null}`, ou, mais limpo, um `Scatter` separado com apenas os três pontos de interesse dentro de um `ComposedChart`. O rótulo final não é `LabelList`: é texto HTML ao lado do SVG, alinhado por flex, porque texto dentro do SVG não herda a tipografia do Tailwind e não quebra linha.

**Ponto delicado.** Espaço. O rótulo numérico rouba de 30 a 50 px da largura, e se ele for desenhado dentro da caixa do gráfico o último ponto encosta na borda ou sai do `viewBox`. A solução estável são dois elementos irmãos num flex: o SVG com `flex-1` e o número com largura fixa e `tabular-nums`. Segundo ponto: quando máximo e último coincidem, os dois círculos se sobrepõem; a regra é o último ponto vencer e o extremo não ser desenhado.

**Versões sugeridas.**
- **V1 básica: CPL mensal com o valor do mês corrente.** Traço de 12 meses, ponto e número no mês atual.
- **V2 com anotação: máximo e mínimo do ano marcados.** Pontos nos extremos com rótulos discretos, mostrando que o CPL de hoje está a 8 por cento do melhor mês do ano.
- **V3 densa do Farol: tabela de desempenho por executivo.** Uma linha por executivo, com sparkline de 26 semanas de valor fechado, ponto no último e número à direita; a tabela ordena pelo número, e o traço explica se o número é ponto fora da curva ou patamar. Escala por linha, porque a pergunta é sobre o comportamento de cada um.
- **V4 caso limite: série que termina em queda a zero.** Executivo que não fechou nada nas últimas 6 semanas; o ponto final cai na base da caixa e o rótulo "R$ 0" some contra a borda. Reservar 6 px de folga inferior e nunca deixar o domínio vertical começar exatamente no mínimo da série.

**Referências.**
- Catálogo: [Protovis, sparklines](https://mbostock.github.io/protovis/ex/sparklines.html): observar a reprodução clássica do sparkline de Tufte com banda de referência e marcação de extremos, útil como espelho de geometria.
- Catálogo: [Highcharts, sparkline demo](https://www.highcharts.com/demo/highcharts/sparkline): observar o padrão de uma função fábrica que injeta um gráfico minúsculo em cada célula de tabela e a configuração que zera margens, título e legenda.
- Praticante: [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar a convenção de ponto vermelho nas pontas e azul nos extremos, e o aviso contra o "optical clutter" de muitos pontos coloridos.
- Praticante: [Peltier Tech, sparklines and data bars in Excel 2010](https://peltiertech.com/sparklines-and-data-bars-in-excel-2010/): observar o tratamento de primeiro ponto, último ponto, alto e baixo como opções independentes e as armadilhas de escala do recurso nativo.
- Portal de design: [Dribbble, coleção charts & gauges](https://dribbble.com/rileyzoi/collections/721831-charts-gauges) (não abriu): observar a composição de número grande, traço e ponto final em cards limpos de dashboard.

**Mora melhor em outra família?** Se os rótulos passam de três, o gráfico já não é word-sized e vai para 04_linhas com eixo de verdade.

---

## 24.3 Sparkline de área

**Descrição.** O mesmo traço com o espaço abaixo preenchido. AnyChart cataloga o tipo como "a Line Sparklines graph in which the area between the series and the X axis is filled with color". O preenchimento acrescenta peso visual e ajuda o olho a achar o microvisual numa tabela densa, mas destrói a leitura de séries que não têm zero como base natural.

**Anatomia.** Traço superior com opacidade cheia; preenchimento em gradiente vertical de 25 por cento a 0 por cento de opacidade, ou cor sólida de baixa opacidade; base no zero do domínio, não no mínimo da série.

**Abordagem na stack.** `recharts-nativo`. `AreaChart` com um `Area` de `fill="url(#grad)"`, `strokeWidth={2}`, `dot={false}`, `isAnimationActive={false}`, mais um `<defs><linearGradient>` por card. Tremor tem o equivalente no `SparkAreaChart`, com `fill` em `"gradient"` por padrão. Detalhe de implementação que morde: se cada card definir um gradiente com o mesmo `id`, o navegador resolve todos para o primeiro; o `id` precisa ser único por instância, por exemplo via `useId()`.

**Ponto delicado.** A base. Área preenchida comunica "quantidade acumulada desde zero". Se o domínio vertical começa no mínimo da série, que é o padrão confortável de um sparkline, a área preenchida mente: uma variação de 2 por cento vira um bloco maciço. Regra: área só quando o zero for base legítima e estiver dentro do domínio; caso contrário, linha. Série com negativos preenchida vira mancha ambígua acima e abaixo do eixo; aí o modelo certo é o 24.8.

**Versões sugeridas.**
- **V1 básica: entradas diárias da pré-vendas, 30 dias.** Volume começa em zero por natureza, então a área é honesta.
- **V2 com destaque: área em dois tons.** Dias dentro do SLA em cor de acento, dias fora em cor de alerta, num `AreaChart` com duas `Area` sobrepostas e `dataKey` que devolve `null` fora do trecho.
- **V3 densa do Farol: mídia paga por plataforma, 4 cards lado a lado.** Um card por plataforma fictícia, cada um com investimento diário em área, todos na **mesma** escala vertical, para que a leitura "esta plataforma consome o dobro" funcione entre cards.
- **V4 caso limite: série com um pico de 10x.** Um dia de campanha concentrada esmaga o resto da área. Ou se recorta o pico e se anota ("pico de 2026-05-14 fora de escala"), ou se troca por escala logarítmica, que num microvisual sem eixo é ilegível; a saída preferida é recortar e anotar.

**Referências.**
- Catálogo: [AnyChart Chartopedia, sparkline chart](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/): observar a taxonomia de quatro tipos (linha, área, coluna, win/loss) e a descrição do preenchimento até o eixo X.
- Catálogo: [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart): observar `SparkAreaChart` com `fill` em gradiente por padrão, as props `autoMinValue`, `minValue` e `maxValue` e o tamanho base `h-12 w-28`.
- Praticante: [Datawrapper, what to consider when creating small multiple line charts](https://www.datawrapper.de/blog/what-to-consider-when-creating-small-multiple-line-charts): observar as regras de escala comum entre painéis pequenos, que valem igual para cards de sparkline lado a lado.
- Portal de design: [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard): observar quantos cards escuros usam área com gradiente de baixa opacidade em vez de linha pura, e o custo disso em leitura.

**Mora melhor em outra família?** Área com eixo e leitura de valor é 05_areas. Área empilhada micro é o 24.11 aqui.

---

## 24.4 Sparkline com faixa de normalidade

**Descrição.** O sparkline ganha uma banda cinza atrás do traço marcando o intervalo considerado normal. Tufte usa a forma no exemplo clínico: "gray band indicates acceptable ranges, making deviations immediately visible", e a leitura fica binária mesmo sem eixo, porque o que importa é se o traço está dentro ou fora da faixa. É o modelo que transforma um sparkline descritivo em um sparkline com julgamento.

**Anatomia.** Retângulo de fundo cobrindo toda a largura, entre o limite inferior e o superior, em `--muted` com opacidade baixa; traço da série por cima; opcionalmente uma linha central na mediana histórica; o último ponto marcado, com cor que muda se ele está fora da banda.

**Abordagem na stack.** `recharts-nativo`. `ReferenceArea` com `y1` e `y2` nos limites, `ifOverflow="extendDomain"` para a banda não forçar recorte, desenhado **antes** do `Line` para ficar atrás. Em `svg-puro` é um `rect` atrás do `path`, e essa versão é preferível em tabela longa. Em `html-tailwind` a banda também funciona: um `div` posicionado em porcentagem com `bg-muted/40`, com o traço como SVG sobreposto.

**Ponto delicado.** A origem da faixa. Banda desenhada "no olho" vira profecia autorrealizável: tudo parece normal porque a faixa foi desenhada em volta do que aconteceu. A faixa precisa ter uma definição declarada e estável, e o candidato honesto é um dos três: intervalo interquartílico da própria série histórica, meta contratada mais ou menos uma tolerância, ou limite operacional conhecido. O rótulo da coluna precisa dizer qual. Segundo ponto: a banda não pode ter mais contraste do que o dado; em tema escuro é fácil errar para mais, e a banda passa a ser o que o olho vê primeiro.

**Versões sugeridas.**
- **V1 básica: tempo de primeira resposta da pré-vendas, 20 dias úteis.** Banda no intervalo de SLA contratado, traço diário por cima.
- **V2 com anotação: os dias fora da banda ganham ponto.** Cada ponto fora do intervalo vira um círculo na cor de alerta e o rodapé do card diz "3 de 20 dias fora do SLA".
- **V3 densa do Farol: tabela de filas da pré-vendas.** Uma linha por fila, sparkline de 26 semanas com a banda do SLA daquela fila; filas diferentes têm bandas diferentes, o que impede escala comum e exige a nota "cada linha tem seu próprio SLA".
- **V4 caso limite: faixa que muda no meio da série.** O SLA foi renegociado em 2026-04-01. Em vez de uma banda única, duas bandas lado a lado com uma divisória vertical de 1 px, e o `aria-label` dizendo que o critério mudou. Esconder a mudança é pior do que o gráfico ficar um pouco mais complexo.

**Referências.**
- Catálogo: [Protovis, sparklines](https://mbostock.github.io/protovis/ex/sparklines.html): observar a banda de referência desenhada atrás do traço e a marcação do valor fora da banda.
- Catálogo: [Recharts, API de Tooltip e componentes de referência](https://recharts.github.io/en-US/api/Tooltip/): observar como os componentes auxiliares se posicionam na ordem de renderização, que é o que decide se a banda fica atrás ou na frente do traço.
- Praticante: [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar o exemplo médico com banda cinza de faixa aceitável e a recomendação de suavizar o contraste entre dado e fundo.
- Praticante: [Storytelling with Data, small multiple charts](https://www.storytellingwithdata.com/blog/2020/2/13/little-things-can-mean-a-lot): observar o argumento de que repetição de um mesmo padrão pequeno permite ao leitor aprender a forma uma vez e aplicar em dezenas de painéis.
- Portal de design: [Mobbin, glossário de badge](https://mobbin.com/glossary/badge): observar o vocabulário de indicador diferencial, símbolo mais cor mais rótulo, que é o que rotula o "fora da faixa" sem depender só de cor.

**Mora melhor em outra família?** Se o julgamento é contra uma meta única em vez de um intervalo, o modelo é o bullet micro (24.14). Se a faixa é de incerteza de previsão, é o 24.6.

---

## 24.5 Sparkline com série de comparação

**Descrição.** Duas séries no mesmo microvisual, com hierarquia explícita: a série atual em cor cheia, a série de referência em cinza. A referência costuma ser o mesmo período do ano anterior, a meta ao longo do tempo ou a média do grupo. É o jeito mais barato de responder "isso é bom?" sem gastar um segundo gráfico.

**Anatomia.** Traço de referência em `--muted` com 1 px, eventualmente tracejado; traço atual em cor de acento com 2 px; sem legenda, porque o cinza já significa "passado" ou "referência"; o último ponto de cada série pode receber um marcador, e a distância vertical entre eles é a leitura.

**Abordagem na stack.** `recharts-nativo`. `LineChart` com dois `Line`, ordem de declaração definindo quem fica por cima, `strokeDasharray="3 3"` na referência. Um refinamento que vale a pena: `ComposedChart` com um `Area` de `dataKey` calculado igual à diferença, preenchendo a região entre as duas curvas com cor de polaridade (verde quando acima, vermelho quando abaixo). Isso exige pré-cálculo em TypeScript de dois campos, `positivo` e `negativo`, com `null` fora do respectivo trecho; o Recharts não corta área por condição sozinho.

**Ponto delicado.** Duas séries num espaço de 100 px já é o teto absoluto. A terceira torna o microvisual ilegível e deve ser recusada no tipo do componente, não na revisão de código. O segundo problema é o cruzamento: quando as curvas se cruzam várias vezes, o preenchimento entre elas fica esfarrapado; nesse caso, abandonar o preenchimento e ficar com os dois traços. E o mais silencioso: se as séries têm bases diferentes (ano anterior com 11 meses, ano atual com 8), o alinhamento por índice desalinha o calendário; o eixo horizontal precisa ser o mês, não a posição no array.

**Versões sugeridas.**
- **V1 básica: fechamentos por mês contra o mesmo mês do ano anterior.** Duas linhas, cinza e acento, sem preenchimento.
- **V2 com destaque: preenchimento de polaridade.** A região entre as curvas em verde quando o ano atual está acima e em vermelho quando está abaixo, mostrando que a virada aconteceu em abril.
- **V3 densa do Farol: um card por produto fictício, 6 produtos.** Cada card com a série do produto e, em cinza, a média dos 6, tornando visível qual produto puxa e qual é puxado. Escala comum dentro do card, escala independente entre cards, declarado no rodapé.
- **V4 caso limite: referência ausente em parte do período.** O produto lançado em maio não tem ano anterior; a série cinza começa no meio e o trecho sem referência recebe hachura leve no fundo, em vez de um cinza que insinua zero.

**Referências.**
- Catálogo: [Recharts, Simple Line Chart](https://recharts.github.io/en-US/examples/SimpleLineChart/): observar duas `Line` no mesmo `LineChart` e o controle de `margin`, base do par atual e referência.
- Catálogo: [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart): observar que `categories` aceita mais de uma série e que a paleta padrão tem 9 cores, o que é convite a errar; num microvisual o limite prático é duas.
- Praticante: [Datawrapper, what to consider when creating small multiple line charts](https://www.datawrapper.de/blog/what-to-consider-when-creating-small-multiple-line-charts): observar a técnica de repetir todas as séries em cinza ao fundo de cada painel e destacar uma, que é a versão em small multiples deste modelo.
- Portal de design: [Dribbble, tag kpi](https://dribbble.com/tags/kpi): observar o par linha cheia mais linha fantasma em cards de comparação de período.

**Mora melhor em outra família?** Comparação de duas séries com leitura de valor é 04_linhas. Comparação de dois pontos apenas, início e fim, é o micro dumbbell (24.18) ou a família 17.

---

## 24.6 Sparkline com cauda de projeção

**Descrição.** A série realizada continua num trecho previsto, visualmente separado: traço cheio até hoje, traço tracejado depois, e uma faixa de incerteza em volta do trecho previsto. Resolve a exigência de Diretoria de que cenário saia em faixa e não em número único, sem gastar um gráfico inteiro.

**Anatomia.** Linha vertical fina marcando "hoje"; traço cheio à esquerda; traço tracejado à direita; banda de incerteza preenchida atrás do trecho tracejado, entre o cenário baixo e o alto; opcionalmente o valor projetado do fim do horizonte em texto.

**Abordagem na stack.** `recharts-custom`. `ComposedChart` com três séries pré-calculadas em TypeScript: `realizado` (com `null` no futuro), `previsto` (com `null` no passado, exceto o ponto de junção, que precisa repetir o último realizado para as linhas se encostarem) e `faixa`, um `Area` com `dataKey` devolvendo `[baixo, alto]`, que o Recharts aceita como faixa. O tracejado sai de `strokeDasharray` na `Line` de previsto. A linha de hoje é `ReferenceLine x={hoje}`.

**Ponto delicado.** O ponto de junção. Se `previsto` começar só no primeiro dia futuro, aparece um vão de 1 posição entre as duas linhas, e num microvisual esse vão parece um buraco no dado. A correção é repetir o último valor realizado como primeiro valor de previsto. O segundo ponto delicado é semântico: tracejado sozinho não diz "previsão" para quem nunca viu a convenção; num microvisual não cabe legenda, então o `aria-label` e o tooltip do card precisam dizer, e o card deve carregar a etiqueta de procedência (medido contra derivado) que o Farol exige.

**Versões sugeridas.**
- **V1 básica: forecast de fechamento do trimestre.** Realizado semanal mais 6 semanas projetadas em tracejado.
- **V2 com faixa: cenário em banda.** A mesma projeção com banda entre cenário conservador e otimista, e o rodapé dizendo "faixa de cenário, não intervalo estatístico".
- **V3 densa do Farol: seis cards de meta 2027.** Um card por linha de receita fictícia, cada um com realizado até hoje e a trajetória necessária para bater a meta em tracejado; o gap entre a projeção natural e a trajetória necessária é o que a Diretoria precisa ver.
- **V4 caso limite: projeção que estoura a escala.** Cenário otimista cinco vezes acima do realizado achata todo o histórico. A regra é fixar o domínio pelo realizado mais 20 por cento e recortar a faixa, com um chevron na borda superior indicando que o cenário alto continua fora da caixa.

**Referências.**
- Catálogo: [Recharts, Simple Line Chart](https://recharts.github.io/en-US/examples/SimpleLineChart/): observar o uso de `null` numa série para interromper o traço, mecanismo que separa realizado de previsto.
- Catálogo: [Financial Times, visual vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md): observar as categorias de "change over time" e "uncertainty" e a recomendação de separar dado observado de dado estimado por traço e por cor.
- Praticante: [Datawrapper Academy, adicionar gráficos a tooltips](https://www.datawrapper.de/academy/how-to-embed-charts-into-tooltips): observar a ideia de o microvisual ser porta de entrada e o detalhe morar no tooltip, que é a saída para a projeção sem poluir o card.
- Portal de design: [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/): observar o tratamento de estados de incerteza e de dado em atualização em painéis operacionais.

**Mora melhor em outra família?** Projeção com eixo, intervalo e leitura de valor é 05_areas (faixa) ou 04_linhas. Meta com marcador único é 13_progresso-meta-e-gauge.

---

## 24.7 Sparkbar (colunas)

**Descrição.** O microvisual de colunas verticais, uma coluna por período, altura proporcional ao valor. AnyChart descreve o tipo como aquele em que cada ponto é desenhado como um retângulo vertical cuja altura corresponde ao valor, e recomenda o uso justamente quando a série pode ter valores negativos. É o modelo certo quando os períodos são eventos discretos e contáveis (leads do dia, agendas da semana, fechamentos do mês) e não um contínuo que faria sentido interpolar.

**Anatomia.** N colunas de largura igual com vão de 1 px a 3 px entre elas; base no zero, sempre; sem eixo; última coluna em cor de destaque; altura da caixa entre 20 px e 32 px em célula de tabela, 32 px a 48 px em card.

**Abordagem na stack.** `recharts-nativo`. `BarChart` com um `Bar` de `isAnimationActive={false}`, `barCategoryGap` em 15 a 20 por cento e nenhum eixo. Para destacar uma coluna sem criar segunda série, `Bar` aceita `Cell` como filhos, um por ponto, com `fill` calculado em TypeScript; é o caminho limpo para "a última coluna é a de hoje" e para "as colunas fora do padrão são laranja". O AG Grid resolve o mesmo problema com um `itemStyler` que decide o preenchimento por valor, que é a mesma ideia com outro nome. Acima de cerca de 40 colunas ou 120 linhas de tabela, migrar para `svg-puro` com retângulos calculados.

**Ponto delicado.** Largura por coluna. Com 52 semanas em 100 px sobra menos de 2 px por coluna, e o vão come metade disso; o resultado é uma franja cinza sem forma. A regra prática: largura mínima de 3 px por coluna mais 1 px de vão, o que dá um teto de cerca de 25 colunas em 100 px e 35 em 140 px. Passou disso, ou se agrega o período (semana vira mês) ou se troca para 24.1, que não tem esse piso. O segundo ponto: domínio automático não garante base zero; declarar o domínio começando em zero num `YAxis` com `hide`, ou calcular a altura em SVG puro.

**Versões sugeridas.**
- **V1 básica: agendas marcadas por semana, 16 semanas.** Uma coluna por semana, última em destaque, número da semana corrente ao lado.
- **V2 com destaque: colunas abaixo do piso operacional em alerta.** As semanas com menos de 8 agendas ganham `Cell` em cor de alerta, e o rodapé conta quantas foram.
- **V3 densa do Farol: tabela de 12 filas da pré-vendas.** Uma linha por fila, sparkbar de 13 semanas, escala comum entre filas porque a pergunta da Diretoria é sobre volume absoluto, com o cabeçalho declarando a escala e o valor máximo da tabela.
- **V4 caso limite: semana sem operação.** Semana de recesso sem nenhuma entrada. Coluna de altura zero é indistinguível de coluna ausente; a saída é desenhar um traço de 1 px na base em `--muted` para "zero medido" e deixar o espaço vazado, sem traço, para "sem coleta", com a diferença explicada no `aria-label`.

**Referências.**
- Catálogo: [AnyChart Chartopedia, sparkline chart](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/): observar a definição de column sparkline como retângulo vertical proporcional e a recomendação de usá-lo quando há valores negativos.
- Catálogo: [AG Grid, bar e column sparkline customisation](https://www.ag-grid.com/javascript-data-grid/sparklines-bar-customisation/): observar `padding` por lado, a remoção da linha de eixo zerando sua espessura e o `itemStyler` que muda o preenchimento por valor, equivalente do `Cell` do Recharts.
- Praticante: [Datawrapper Academy, como adicionar gráficos de barras e linhas a tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar que coluna em tabela precisa começar no zero, que existe cor separada para valor negativo e o aviso de que coluna em célula não tem tooltip e só mostra o número do primeiro e do último ponto.
- Praticante: [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar o argumento de resolução tipográfica, que é o que impõe o piso de largura por coluna.
- Portal de design: [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard): observar o uso de sparkbar em cards escuros com a última coluna em cor de acento, padrão recorrente.

**Mora melhor em outra família?** Colunas com eixo, rótulo e leitura de valor são 03_colunas-verticais. Colunas de frequência de uma distribuição são 16_distribuicao.

---

## 24.8 Sparkbar divergente

**Descrição.** Sparkbar com o zero no meio da caixa: colunas para cima quando o valor é positivo, para baixo quando é negativo. É a forma canônica para variação, saldo e diferença contra meta, porque a linha de base carrega significado por si. O Datawrapper oferece cor separada para positivo e negativo exatamente aqui, e exige que a escala comece no zero.

**Anatomia.** Linha de base de 1 px no zero, atravessando a largura; colunas acima e abaixo; duas cores de polaridade; escala vertical simétrica por padrão, para que uma queda de 10 e uma alta de 10 tenham o mesmo tamanho.

**Abordagem na stack.** `recharts-nativo` com um detalhe. `BarChart` já desenha barras negativas para baixo; o que falta é a simetria e a cor. A cor sai de um `Cell` por ponto, com preenchimento decidido pelo sinal. A simetria sai de um `YAxis` com `hide` e domínio de menos m a mais m, onde m é o maior valor absoluto da série. A linha de base sai de `ReferenceLine` em y igual a zero.

**Ponto delicado.** A simetria. Domínio automático assimétrico é a armadilha mais comum: uma série que vai de menos 2 a mais 40 desenha o menos 2 como um cotoco invisível e o leitor conclui que não houve queda. Calcular m como o maior valor absoluto e forçar o domínio é obrigatório. O segundo ponto delicado é semântico: em receita, positivo é bom; em custo, CPL e tempo de resposta, positivo é ruim. A cor precisa mapear **bom e ruim**, não **mais e menos**, e isso obriga o componente a receber a polaridade da métrica como propriedade, não a deduzir do sinal.

**Versões sugeridas.**
- **V1 básica: variação mês a mês da receita reconhecida, 12 meses.** Colunas verde para cima, vermelho para baixo, base no zero.
- **V2 com anotação: a sequência de quedas marcada.** Os três meses negativos consecutivos recebem um colchete fino embaixo com o rótulo "3 meses".
- **V3 densa do Farol: tabela de 9 motivos de perda, variação contra o trimestre anterior.** Escala comum, para que "preço cresceu muito mais que os outros" seja lido na altura; a coluna ao lado traz o valor absoluto, porque variação sobre base pequena engana.
- **V4 caso limite: métrica de custo.** A mesma tabela para CPL por plataforma, onde alta é ruim. A polaridade inverte: colunas para cima ficam vermelhas. O cabeçalho da coluna precisa dizer "alta é pior", porque a inversão silenciosa é pior que a ausência de cor.

**Referências.**
- Catálogo: [AnyChart Chartopedia, sparkline chart](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/): observar a indicação explícita de column sparkline para séries com valores negativos.
- Catálogo: [Vega-Lite, bar chart with negative values and a zero baseline](https://vega.github.io/vega-lite/examples/bar_negative.html): observar a base zero explícita e o tratamento de rótulo em barra negativa, o mesmo problema geométrico em escala grande.
- Praticante: [Datawrapper Academy, como adicionar gráficos de barras e linhas a tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar o par de seletores de cor, um para positivo e outro para negativo, e a exigência de começar no zero.
- Praticante: [Storytelling with Data, little things can mean a lot](https://www.storytellingwithdata.com/blog/2020/2/13/little-things-can-mean-a-lot): observar o argumento de que consistência de forma repetida é o que permite ler dezenas de microvisuais sem reaprender a leitura em cada linha.
- Portal de design: [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline): observar quantos exemplos ignoram a simetria do eixo e o efeito disso na leitura de queda.

**Mora melhor em outra família?** Variação decomposta em contribuições é 19_cascata-waterfall. Um único delta ao lado do KPI é a pílula de variação (24.20).

---

## 24.9 Win/loss

**Descrição.** Colunas de altura fixa: para cima quando o período foi bom, para baixo quando foi ruim, nada quando foi neutro. AnyChart trata o tipo como variação do column sparkline em que cada ponto "only shows whether the corresponding value is positive, negative, or zero", e a documentação de planilha reforça que a convenção de dado é 1 para vitória, menos 1 para derrota e zero para empate. O win/loss joga fora a magnitude de propósito: o que ele mostra bem é **sequência**, ou seja, sequências de acerto, sequências de falha e a virada entre elas.

**Anatomia.** N blocos de largura igual e altura idêntica; metade superior para vitória, metade inferior para derrota; uma faixa central de 1 px a 2 px onde o empate aparece como traço; duas cores de polaridade; sem eixo; alto de 14 px a 22 px, mais baixo que o sparkbar porque a altura não carrega informação.

**Abordagem na stack.** `svg-puro` é a escolha melhor. A geometria é trivial (largura da caixa dividida por N, um retângulo por período, deslocado para cima ou para baixo) e evita carregar um motor de gráfico para desenhar retângulos de altura constante. Em `recharts-nativo` dá para fazer com `BarChart` sobre uma série derivada de 1, menos 1 e 0, com `Cell` por sinal, mas é uma volta longa. Em `html-tailwind` também funciona: uma `div` `flex gap-px` com filhos de `h-2 w-1` alinhados por `self-start` e `self-end` dentro de uma caixa de altura fixa; essa versão é a mais barata de todas em tabela longa e a que melhor herda o tema.

**Ponto delicado.** Escolher win/loss quando a magnitude era a história. Se a pergunta é "quanto ganhamos", win/loss apaga a resposta: uma vitória de R$ 1 mil e outra de R$ 800 mil viram o mesmo bloco. O modelo só se justifica quando o desfecho é genuinamente binário (bateu ou não bateu o SLA, o mês fechou positivo ou negativo, a fila estourou ou não estourou o teto). O segundo ponto: **zero não é neutro por acidente**. Se o dado bruto tem zero por falta de coleta, o win/loss desenha empates que nunca existiram; a regra é separar "zero medido" (traço central) de "sem dado" (espaço vazio, sem traço) antes de chegar no componente.

**Versões sugeridas.**
- **V1 básica: 26 semanas de SLA da pré-vendas.** Bloco para cima quando a semana fechou dentro do SLA, para baixo quando estourou.
- **V2 com anotação: a sequência marcada.** A maior sequência de derrotas ganha um sublinhado fino e o rótulo "6 semanas seguidas fora", que é a leitura que o win/loss faz melhor que qualquer outro microvisual.
- **V3 densa do Farol: tabela de executivos, 12 meses de meta.** Uma linha por executivo, 12 blocos por linha, bateu ou não bateu a meta do mês. A tabela ordena por número de meses batidos, e o padrão de sequência distingue quem é irregular de quem decaiu.
- **V4 caso limite: executivo que entrou em maio.** Os quatro primeiros meses não existem, não são derrotas. Ficam vazios, sem traço central, e o `aria-label` diz "sem meta atribuída até abril". Desenhar derrota onde não havia meta é o erro que transforma o microvisual em acusação falsa.

**Referências.**
- Catálogo: [AnyChart Chartopedia, sparkline chart](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/): observar a definição de win/loss como variação do column sparkline que só registra positivo, negativo ou zero.
- Catálogo: [AnyChart, WinLoss sparkline](https://www.anychart.com/blog/2016/04/02/winloss-javascript-sparkline-chart-anychart/): observar a escolha de desenho de blocos de altura constante e o uso do tipo para séries de resultado esportivo e comercial.
- Praticante: [MyExcelOnline, win/loss sparklines](https://www.myexcelonline.com/blog/winloss-sparklines-in-excel/): observar a convenção de dado 1, menos 1 e 0, o aviso de que blanks e entradas inconsistentes quebram o desenho e o foco em sequências e padrões.
- Praticante: [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar a insistência em resolução tipográfica, que é o que faz o win/loss caber literalmente dentro de uma linha de texto.
- Portal de design: [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline): observar a variante de blocos binários em tabelas de status e a escolha de altura menor que a do sparkbar.

**Mora melhor em outra família?** Se cada período tem mais de dois estados, é faixa de calor (24.23) ou 15_mapa-de-calor-e-calendario. Se a magnitude importa, é o sparkbar divergente (24.8).

---

## 24.10 Horizonte micro

**Descrição.** A técnica que comprime uma série temporal dobrando a amplitude em bandas: divide o eixo vertical em faixas de mesma altura, sobrepõe as faixas superiores em vez de empilhá-las verticalmente e usa intensidade de cor para dizer em que faixa o valor está. Valores negativos são espelhados para cima em outra matiz. O resultado é uma série que ocupa um quarto da altura sem perder a leitura de pico, o que a torna a forma mais densa desta família: dezenas de séries empilhadas numa tela.

**Anatomia.** Caixa de 16 px a 28 px de altura; 2 ou 3 bandas positivas em tons crescentes de uma matiz; 2 ou 3 bandas negativas em tons crescentes de outra matiz; linha de base implícita no zero ou na mediana; rótulo da série à esquerda, fora da caixa.

**Abordagem na stack.** `svg-puro`, sem discussão. O Recharts não tem dobramento de banda, e emular com N `Area` recortadas por `clipPath` é mais código e mais frágil que calcular. O cálculo em TypeScript: define-se `banda` como amplitude dividida pelo número de faixas; para cada faixa `i`, gera-se uma série derivada com `clamp(valor menos i vezes banda, 0, banda)`; cada série vira um `path` preenchido com opacidade crescente, todas ancoradas na mesma base. São 4 a 6 `path` por série e nenhuma dependência.

**Ponto delicado.** A curva de aprendizado. Horizonte é o único modelo desta família que o leitor não decifra sozinho na primeira vez; quem nunca viu lê as bandas como camadas empilhadas e erra a magnitude por um fator igual ao número de bandas. A regra de produto: só usar horizonte em tela de analista recorrente, nunca em tela de apresentação, e sempre com uma legenda de banda ao lado (uma coluna estreita mostrando os três tons e o valor de corte de cada um). Segundo ponto: mais de 3 bandas por polaridade destrói a leitura; 2 é o mais seguro, 3 é o teto.

**Versões sugeridas.**
- **V1 básica: 20 origens de lead, 90 dias, 2 bandas.** Uma faixa de 18 px por origem, intensidade dizendo o volume.
- **V2 com anotação: a origem selecionada em destaque.** A linha clicada ganha borda e expande para um sparkline de área normal de 48 px, com as demais permanecendo em horizonte; é a interação que resolve a curva de aprendizado.
- **V3 densa do Farol: 40 criativos de mídia paga, 120 dias de impressões.** Quarenta faixas numa tela, escala **comum** obrigatória, porque a graça do horizonte é justamente comparar nível entre séries; a escala por série tornaria o painel inteiro sem sentido.
- **V4 caso limite: série com negativo real.** Saldo de pipeline por semana, que entra e sai do negativo. As bandas negativas em matiz distinta, espelhadas; o cuidado é a matiz negativa não ser mais saturada que a positiva, senão toda a tela parece crise.

**Referências.**
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar as famílias de trellis e small multiples, que são a alternativa de menor densidade e maior legibilidade ao horizonte.
- Catálogo: [Wikipedia, sparkline](https://en.wikipedia.org/wiki/Sparkline): observar a nota de que sparklines agrupados funcionam como small multiples, que é a base conceitual do painel de horizontes.
- Praticante: [Wikipedia, warming stripes](https://en.wikipedia.org/wiki/Warming_stripes): observar a decisão deliberada de remover eixos, rótulos e números e deixar só a cor, o mesmo princípio que sustenta o horizonte e a faixa de calor.
- Praticante: [Datawrapper, o que considerar ao criar small multiple line charts](https://www.datawrapper.de/blog/what-to-consider-when-creating-small-multiple-line-charts): observar as regras de escala comum entre painéis, que valem com mais força ainda em horizonte.
- Portal de design: [Dribbble, tag heatmap chart](https://dribbble.com/tags/heatmap-chart) (não abriu): observar como intensidade por faixa aparece quase sempre em grade, e quase nunca dobrada em bandas, sinal de que o horizonte é ferramenta de analista, não de vitrine.

**Mora melhor em outra família?** Área com eixo e leitura de valor é 05_areas. Grade de intensidade por período sem forma de onda é 15_mapa-de-calor-e-calendario.

---

## 24.11 Área empilhada micro

**Descrição.** Duas a quatro componentes empilhadas dentro da caixa do microvisual, mostrando como o **mix** mudou ao longo do tempo. Normalmente em versão 100 por cento, porque num espaço de 100 px a leitura de total já se perde e o que sobra legível é a proporção. É o microvisual da pergunta "a composição mudou", que a barra de composição mini (24.13) responde só para um instante.

**Anatomia.** Caixa de 100 px a 140 px por 28 px a 40 px; 2 a 4 faixas empilhadas em cores de categoria estáveis; sem legenda dentro do gráfico (a legenda vive no cabeçalho da coluna ou do card); ordem de empilhamento fixa e igual em todas as instâncias.

**Abordagem na stack.** `recharts-nativo`. `AreaChart` com `stackOffset="expand"` para a versão 100 por cento, N componentes `Area` com o mesmo `stackId`, `dot={false}`, `isAnimationActive={false}` e nenhum eixo. Para a versão de total absoluto, basta omitir o `stackOffset`.

**Ponto delicado.** Número de componentes. Quatro é o teto absoluto num microvisual, e mesmo quatro já exige que as cores sejam muito distintas. Acima disso, agregar em "outros" antes do componente, nunca dentro dele, porque a regra de agregação é decisão de negócio. O segundo ponto: **ordem estável**. Se a ordem de empilhamento for derivada do valor (maior embaixo), ela muda de card para card e de mês para mês, e a comparação entre instâncias morre; a ordem tem que vir de uma lista canônica fixa. O terceiro: na versão 100 por cento, uma componente pode ir a zero e sumir sem aviso; o `aria-label` precisa dizer o percentual final de cada componente.

**Versões sugeridas.**
- **V1 básica: mix de origem de lead, 12 meses, 3 componentes.** Inbound, outbound e indicação, em 100 por cento.
- **V2 com destaque: uma componente em cor e as outras em cinza.** Ao passar o cursor na legenda do cabeçalho, só a componente escolhida fica colorida; resolve a ilegibilidade de 4 cores em 100 px sem tirar a informação da tela.
- **V3 densa do Farol: tabela de 8 produtos fictícios, mix de canal por trimestre.** Uma célula de área empilhada por produto, ordem canônica de canal igual em todas, cabeçalho com a legenda única para a coluna inteira.
- **V4 caso limite: mês sem nenhum lead.** Na versão 100 por cento, mês com denominador zero gera divisão por zero e o Recharts desenha uma faixa cheia arbitrária. Filtrar antes: mês vazio vira lacuna vertical na área, com hachura leve, e o rodapé registra "1 mês sem base".

**Referências.**
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar os exemplos de trellis stacked bar e trellis area, que são a mesma ideia em tamanho maior e com eixo.
- Catálogo: [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart): observar que o `SparkAreaChart` aceita empilhamento e que os eixos são escondidos com `XAxis hide` e `YAxis hide`, e não removidos, o que é o truque que mantém a escala funcionando.
- Praticante: [Datawrapper Academy, como adicionar gráficos de barras e linhas a tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar a recomendação de uma coluna vazia de separação entre microvisuais adjacentes, que é o que impede duas áreas empilhadas de parecerem uma só.
- Praticante: [Storytelling with Data, little things can mean a lot](https://www.storytellingwithdata.com/blog/2020/2/13/little-things-can-mean-a-lot): observar o cuidado com ordem e consistência entre elementos repetidos.
- Portal de design: [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard): observar os cards de mix com duas ou três faixas e a raridade (justificada) de quatro ou mais.

**Mora melhor em outra família?** Área empilhada com eixo e legenda é 05_areas. Mix de um único instante é 24.13 aqui, ou 06_pizza se o gráfico for grande.

---

## 24.12 Barra de dado em célula

**Descrição.** Uma barra horizontal desenhada dentro da célula da tabela, atrás ou ao lado do número, com comprimento proporcional ao valor. É o microvisual mais antigo e mais usado do mundo corporativo (a planilha chama de data bar) e o mais fácil de errar. Serve para transformar uma coluna de números numa coluna que o olho ordena sem ler.

**Anatomia.** Trilho opcional em `--muted` ocupando a largura total da célula; barra preenchida a partir da borda esquerda; número alinhado à direita, fora da barra, em `tabular-nums`; altura da barra entre 6 px e 14 px, ou a altura cheia da célula quando a barra é fundo do número.

**Abordagem na stack.** `html-tailwind`, e só. Duas `div` aninhadas, a externa com `w-full bg-muted/30 rounded-sm` e a interna com `style={{ width: pct + '%' }}`. Zero SVG, zero biblioteca, o tema herdado direto, funciona em qualquer largura de coluna e não custa nada em tabela de 500 linhas. Usar Recharts aqui é desperdício puro. A única variante que pede SVG é quando a barra precisa de escala logarítmica ou de marcadores internos, e aí o modelo já é outro (24.14 ou 24.15).

**Ponto delicado.** A escala tem que ser comum à coluna inteira. Barra normalizada por linha num ranking é o erro que anula o propósito: todas as linhas ficam com a barra cheia e a ordenação visual some. A norma é `valor / máximo da coluna`, com o máximo declarado no cabeçalho. O segundo ponto: valor negativo. Barra de dado só aceita negativo se o zero sair da borda e for para o meio da célula, o que reduz pela metade o espaço de cada lado; o Datawrapper resolve com cores distintas para positivo e negativo, e a mesma regra vale aqui. O terceiro: quando a barra é fundo do número, o contraste texto sobre barra tem que passar em ambos os estados, dentro e fora da barra, e em tema escuro isso quase sempre exige a barra em opacidade baixa.

**Versões sugeridas.**
- **V1 básica: receita por executivo.** Coluna de valor mais barra normalizada pelo maior valor da tabela.
- **V2 com destaque: a linha do usuário logado.** A barra do próprio executivo em cor de acento, as demais em `--muted-foreground`, sem mudar o comprimento; o destaque é de identidade, não de valor.
- **V3 densa do Farol: 38 origens de lead com volume e custo.** Duas colunas de barra na mesma tabela, uma de volume e uma de custo, cada uma com sua própria normalização e seu próprio cabeçalho declarando o máximo; a leitura interessante é a **discordância** entre os dois comprimentos na mesma linha.
- **V4 caso limite: cauda longa extrema.** A maior origem tem 60 por cento do volume e as 30 seguintes têm menos de 1 por cento cada, virando barras de meio pixel. Escala logarítmica num data bar é ilegível; a saída honesta é quebrar a tabela em dois blocos, "principais" e "cauda", cada um com sua normalização, com o corte declarado.

**Referências.**
- Catálogo: [Datawrapper Academy, como adicionar gráficos de barras e linhas a tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar a escolha entre escala individual e compartilhada, a exigência de começar no zero e os seletores separados de cor para positivo e negativo.
- Catálogo: [AG Grid, sparklines overview](https://www.ag-grid.com/javascript-data-grid/sparklines-overview/): observar que bar e column são tipos distintos na API (bar é horizontal, column é vertical), distinção que costuma ser fonte de confusão em revisão de código.
- Praticante: [Stephen Few, bullet graphs revisited](https://www.perceptualedge.com/blog/?p=217): observar a advertência de nunca comparar magnitudes entre gráficos de escalas diferentes, que é exatamente o que a barra normalizada por linha faz.
- Praticante: [Peltier Tech, sparklines and data bars in Excel 2010](https://peltiertech.com/sparklines-and-data-bars-in-excel-2010/): observar as armadilhas de escala do recurso nativo de data bar e o tratamento de mínimo e máximo.
- Portal de design: [Dribbble, tag table ui](https://dribbble.com/tags/table-ui): observar o padrão de barra de baixa opacidade como fundo da célula e a escolha de altura em relação ao texto.

**Mora melhor em outra família?** Barra com eixo, rótulo e ordenação explícita é 02_barras-horizontais. A tabela que hospeda as barras é 14_tabelas-visuais.

---

## 24.13 Barra de composição mini

**Descrição.** Uma barra horizontal única dividida em segmentos, mostrando a repartição de um total dentro de uma linha ou de um card. É a alternativa honesta à pizza em espaço pequeno: comprimento é mais fácil de comparar que ângulo, e uma barra de 120 px por 8 px carrega três a cinco partes de forma legível, o que nenhuma pizza de 40 px faz.

**Anatomia.** Barra de largura total e altura de 6 px a 12 px, com cantos arredondados só nas pontas; segmentos contíguos, sem vão, ou com vão de 1 px a 2 px para separar visualmente; cores de categoria estáveis; rótulos fora da barra, como chips com o quadradinho de cor, o nome e o percentual.

**Abordagem na stack.** `html-tailwind`. Um `flex` com `overflow-hidden rounded-full` e filhos com `style={{ width: pct + '%' }}` e a cor da categoria. Alternativa `recharts-nativo`: um `BarChart` com `layout="vertical"` e N `Bar` com o mesmo `stackId`, mas isso traz um motor de gráfico inteiro para desenhar três divs. O `flex` ganha em peso, em tema e em acessibilidade.

**Ponto delicado.** Segmentos minúsculos. Uma parte de 0,7 por cento numa barra de 120 px tem menos de 1 px e ou some, ou é arredondada para 1 px e passa a mentir para mais. Duas regras: agregar em "outros" tudo abaixo de um piso (3 a 5 por cento é um bom corte) **antes** do componente, e nunca aplicar largura mínima aos segmentos, porque largura mínima quebra a soma de 100 por cento. O segundo ponto: a soma. Se as partes não fecham o total, a barra precisa mostrar o resto como segmento explícito de "não classificado", que no Farol é informação valiosa, não sobra. Terceiro: rótulos fora da barra sempre; texto dentro de segmento de 20 px é ilegível e força truncamento.

**Versões sugeridas.**
- **V1 básica: composição do pipeline por estágio.** Barra única, 4 segmentos, chips de legenda embaixo.
- **V2 com anotação: segmento selecionado em destaque.** Ao clicar num chip, o segmento correspondente ganha borda de 1 px e os outros caem para 40 por cento de opacidade, com o valor absoluto aparecendo ao lado.
- **V3 densa do Farol: tabela de 12 executivos, composição da carteira por produto.** Uma barra por linha, mesma ordem de segmentos em todas, legenda única no cabeçalho da coluna. A leitura é "quem está concentrado em um produto só", que salta quando uma barra é quase monocromática.
- **V4 caso limite: linha com "não classificado" dominante.** Um executivo com 62 por cento da carteira sem produto preenchido no CRM. O segmento cinza hachurado ocupa a maior parte, e essa é a informação principal da linha; esconder o não classificado, redistribuindo proporcionalmente, seria fabricar dado.

**Referências.**
- Catálogo: [Data Viz Catalogue, stacked bar graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html): observar a distinção entre empilhado simples e empilhado 100 por cento e a nota sobre a dificuldade de comparar segmentos que não partem da mesma base.
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar os exemplos de barra empilhada normalizada, úteis como referência da geometria em tamanho grande.
- Praticante: [Datawrapper Academy, como adicionar gráficos de barras e linhas a tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar as limitações de interação em célula de tabela, que empurram os rótulos para fora da barra.
- Praticante: [Stephen Few, bullet graphs revisited](https://www.perceptualedge.com/blog/?p=217): observar a regra de não abusar de cor num painel e preferir intensidades de uma mesma escala, que é o que salva a barra de composição de virar arco-íris.
- Portal de design: [Dribbble, tag table ui](https://dribbble.com/tags/table-ui): observar as barras de composição finas em linhas de tabela e o uso de chips como legenda externa.

**Mora melhor em outra família?** Parte do todo em tamanho normal é 06_pizza ou 02_barras-horizontais. Composição que muda no tempo é 24.11 aqui, ou 26_mosaico-marimekko quando a largura também carrega valor.

---

## 24.14 Bullet micro

**Descrição.** A versão reduzida do bullet graph de Stephen Few, criado em 2005 porque os medidores de painel "conveyed too little information, did so unclearly, and wasted a great deal of space". Ele reúne quatro coisas em uma barra: a medida em destaque (a barra), a medida comparativa (um traço perpendicular, tipicamente a meta), faixas qualitativas de contexto no fundo (ruim, aceitável, bom) e uma escala quantitativa. Na versão micro a escala explícita cai e o restante fica.

**Anatomia.** Trilho horizontal de 12 px a 18 px de altura dividido em 2 ou 3 faixas de contexto, em intensidades de um mesmo cinza; barra da medida em destaque, mais fina e centrada verticalmente, em cor sólida; traço vertical de 2 px a 3 px marcando a meta, atravessando a altura da barra; número ao lado, fora do desenho.

**Abordagem na stack.** `html-tailwind` para a versão de célula e `svg-puro` quando houver mais de duas faixas ou marcadores múltiplos. Em Tailwind: um contêiner `relative` com as faixas como `div` absolutas de largura percentual, a barra como `div` de altura menor e `top-1/2 -translate-y-1/2`, e a meta como `div` de 2 px com `left: pct%`. Em `recharts-custom` dá para montar com `BarChart layout="vertical"` mais `ReferenceLine`, mas o custo por linha de tabela não compensa.

**Ponto delicado.** As faixas qualitativas. Few é explícito: as faixas devem ser intensidades de um mesmo tom, não matizes diferentes, porque cor demais num painel vira ruído e quebra acessibilidade; e cada bullet é independente, não se comparam magnitudes entre bullets de escalas diferentes. O segundo ponto delicado é a **direção da métrica**: para métricas do tipo "não exceder" (custo, defeito, CPL), Few recomenda inverter a escala e a sequência de cores, de modo que a barra cresça para a esquerda e o comportamento diferente salte aos olhos. O terceiro, e o mais grave no Farol: faixa qualitativa inventada. Se ninguém definiu o que é "bom", desenhar a faixa é fabricar julgamento; sem definição de fonte, o modelo correto é a barra com marcador de meta apenas, sem faixas.

**Versões sugeridas.**
- **V1 básica: atingimento do trimestre por executivo.** Barra de realizado, traço na meta, sem faixas, número à direita.
- **V2 com contexto: faixas de piso, meta e superação.** Três intensidades de cinza com cortes declarados no cabeçalho ("piso 70 por cento, meta 100 por cento, superação 120 por cento").
- **V3 densa do Farol: tabela de 6 filas da pré-vendas com meta de agendas.** Um bullet por linha, escala própria por fila porque as metas são diferentes, com a advertência de Few impressa no cabeçalho: as barras não são comparáveis entre si, só a posição relativa à própria meta é.
- **V4 caso limite: métrica onde menos é melhor.** CPL por plataforma. Escala invertida, faixas na ordem oposta, e um ícone de seta para baixo no cabeçalho. Manter a orientação padrão aqui faz o pior desempenho parecer o melhor.

**Referências.**
- Catálogo: [Data Viz Catalogue, bullet graph](https://datavizcatalogue.com/methods/bullet_graph.html): observar a anatomia em quatro partes e a recomendação de uso em painéis com pouco espaço vertical.
- Catálogo: [Stephen Few, bullet graph design specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): observar a especificação original de proporções, de número de faixas qualitativas e da marca comparativa.
- Praticante: [Stephen Few, bullet graphs revisited](https://www.perceptualedge.com/blog/?p=217): observar a origem do modelo como substituto do gauge, a regra de usar intensidades em vez de matizes, a inversão de escala para métricas do tipo "não exceder" e o alerta de não comparar bullets de escalas distintas.
- Praticante: [Datawrapper Academy, como adicionar gráficos a tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar o padrão de barra em célula com escala compartilhada, que é o substrato do bullet em tabela.
- Portal de design: [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard): observar quantos cards desenham gauge onde um bullet caberia, que é exatamente o problema que Few descreve.

**Mora melhor em outra família?** Bullet em tamanho cheio, com eixo numérico visível, é 13_progresso-meta-e-gauge. Meta sem faixas de contexto é a barra de progresso da mesma família 13.

---

## 24.15 Barra com teto de capacidade

**Descrição.** Parente próximo do bullet micro, mas com uma diferença de semântica que muda o desenho: o marcador não é uma meta que se quer atingir, é um **limite que não se deve ultrapassar**. A barra mostra a demanda (entradas na fila, carteira por executivo, agendas por SDR) e o traço mostra o teto operacional medido. A pergunta não é "chegamos lá", é "quanto sobra" ou "quanto estourou". A literatura de barra de progresso deixa claro por que o modelo precisa existir separado: uma barra de progresso só funciona quando o total é um número fixo e significativo, e valores acima de 100 por cento costumam ser desenhados errado pelos componentes prontos, com o texto certo e a barra travada no fim.

**Anatomia.** Trilho de largura total representando uma escala que vai de zero até **acima** do teto (tipicamente 130 a 150 por cento do teto, para o estouro caber); barra da demanda em cor neutra até o teto; segmento excedente, depois do teto, em cor de alerta e contíguo à barra; traço vertical de 2 px no teto, mais alto que a barra; rótulo à direita com demanda sobre teto ("312 / 274").

**Abordagem na stack.** `html-tailwind`. Um contêiner `relative h-3` com a escala calculada em TypeScript (`escalaMax = Math.max(teto * 1.3, demanda)`), um `div` para a parte dentro do teto com `width: min(demanda, teto) / escalaMax`, um segundo `div` para o excedente começando em `left: teto / escalaMax` e um `div` de 2 px para o traço. O Tremor tem dois ingredientes que valem de referência: `MarkerBar`, que desenha um marcador e uma faixa entre `minValue` e `maxValue`, e `CategoryBar`, cujo marcador muda de cor conforme a faixa onde cai; nenhum dos dois trata estouro, e é justamente essa lacuna que o modelo resolve.

**Ponto delicado.** Esconder o estouro. O padrão confortável é normalizar pela capacidade e cortar em 100 por cento, e aí a fila com 110 por cento e a fila com 190 por cento ficam idênticas. A escala precisa ser calculada para caber o maior estouro da tabela, e com escala comum a todas as linhas, senão o traço do teto dança de posição e a comparação morre. O segundo ponto é a procedência do teto: no Farol o teto de capacidade é um número medido (entradas por mês que a pré-vendas absorve) e não uma premissa de planilha; se for premissa, o traço vira tracejado e a etiqueta diz PREMISSA. O terceiro: teto que muda no período. Se a equipe cresceu no meio do mês, a barra do mês fechado usa o teto médio ponderado, declarado no `aria-label`.

**Versões sugeridas.**
- **V1 básica: carga da pré-vendas no mês.** Uma barra, demanda de 231 entradas contra teto de 274, com 43 de folga escritas ao lado.
- **V2 com destaque: estouro em cor de alerta.** O mês em que entraram 312 leads; os 38 acima do teto aparecem como segmento laranja após o traço e o rótulo diz "estouro de 14 por cento".
- **V3 densa do Farol: tabela de 14 executivos contra teto de carteira de 150 contas.** Escala comum de zero a 210, traço do teto na mesma posição em todas as linhas, ordenação por excedente. Os estouros formam uma coluna vertical de laranja que a Diretoria lê de relance.
- **V4 caso limite: teto indefinido.** Fila nova sem capacidade medida. Nada de desenhar traço em valor chutado: a barra aparece sem marcador, em cinza, com o chip "teto não medido". Um teto inventado faria a fila parecer sobrecarregada ou ociosa sem base nenhuma.

**Referências.**
- Catálogo: [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars): observar `MarkerBar` com faixa entre `minValue` e `maxValue`, `CategoryBar` com marcador que herda a cor da faixa e a ausência de tratamento para valor acima do máximo.
- Catálogo: [Stephen Few, bullet graph design specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): observar a medida comparativa como traço perpendicular, que aqui passa a significar limite em vez de meta.
- Praticante: [Domo, o que é uma barra de progresso](https://www.domo.com/learn/charts/progress-bars) (não abriu): o resultado de busca registra que a barra só funciona com total fixo e significativo e recomenda bullet quando o total varia.
- Praticante: [Retool Forum, barra de progresso acima de 100 por cento](https://community.retool.com/t/displaying-progress-bar-values-exceeding-100/54342) (não abriu): observar, pelo título e pelo resumo da busca, que o estouro é pedido recorrente de quem monitora produção contra meta e que os componentes prontos não o desenham.
- Portal de design: [Dribbble, tag progress chart](https://dribbble.com/tags/progress-chart) (não abriu): observar como quase toda barra de progresso trava em 100 por cento, que é o comportamento a evitar.

**Mora melhor em outra família?** Capacidade contra demanda em série temporal, com eixo, é 08_combinados-e-eixo-duplo ou 13_progresso-meta-e-gauge. O modelo aqui é a leitura de uma linha só.

---

## 24.16 Strip plot micro

**Descrição.** Todos os valores individuais de uma linha desenhados como traços ou pontos sobre um eixo horizontal implícito, sem agregação. É o microvisual de distribuição mais honesto: não calcula quartil nem classe, mostra cada observação. O SpreadJS cataloga a mesma ideia como spread sparkline, com seis estilos (traço empilhado do centro, pontos espalhados do centro, pontos com jitter, traços de um lado a outro, pontos empilhados e faixa de traços de mesmo tamanho), todos variações de onde colocar a observação repetida.

**Anatomia.** Trilho horizontal de 1 px em `--muted`; um traço vertical de 1 px a 2 px (estilo rug) ou um ponto de 3 px por observação; opacidade entre 30 e 50 por cento para que a sobreposição vire intensidade; opcionalmente um traço mais alto na mediana e um ponto na observação mais recente.

**Abordagem na stack.** `svg-puro`. A escala é `x = (v - min) / (max - min) * largura`, um `line` ou `circle` por valor, e o jitter vertical, quando usado, precisa ser **determinístico** (derivado do índice, por exemplo `((i * 37) % 7) / 7`), nunca `Math.random()`, senão cada re-renderização move os pontos e a tabela treme. Em `recharts-nativo` dá com `ScatterChart` e `Scatter` sobre `y` constante, mas o custo por linha não compensa.

**Ponto delicado.** Sobreposição. Com 40 valores repetidos em R$ 0, 40 traços viram um só, e a leitura "a maioria é zero" some. As saídas, em ordem de preferência: transparência (a intensidade denuncia a pilha), empilhamento de pontos (dot stack, que é quase um histograma) ou jitter determinístico. O segundo ponto: domínio. Escala por linha faz cada distribuição parecer igualmente espalhada; a regra da família vale aqui com força, escala comum quando a pergunta é "qual linha tem ciclo mais longo".

**Versões sugeridas.**
- **V1 básica: ciclo de venda dos deals ganhos do trimestre por executivo.** Um traço por deal, dias entre criação e ganho, escala comum de 0 a 180 dias.
- **V2 com destaque: mediana e deal mais recente.** Traço alto na mediana, ponto de acento no último deal fechado, mostrando se ele caiu dentro ou fora do padrão do executivo.
- **V3 densa do Farol: tempo de primeira resposta de cada lead, por fila.** Seis linhas, 60 a 200 observações por linha, pontos com 30 por cento de opacidade; a intensidade à esquerda é a fila que responde rápido, a franja à direita é a cauda que o SLA precisa atacar.
- **V4 caso limite: valores empilhados em zero.** Leads respondidos no mesmo minuto registram 0. Usar empilhamento vertical de pontos em vez de traço único e escrever a contagem ao lado ("41 em 0 min").

**Referências.**
- Catálogo: [SpreadJS, spread sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkspread): observar os seis estilos de desenho da observação repetida e o parâmetro de média.
- Catálogo: [Observable Plot, tick mark](https://observablehq.com/plot/marks/tick) (não abriu): observar o `tickX` como marca de strip plot e a nota de que, sem dimensão secundária, o tick se comporta como regra.
- Praticante: [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot) (não abriu): observar a definição de dot plot como vários pontos numa linha e a atribuição a William Cleveland.
- Portal de design: [Dribbble, tag scatter plot](https://dribbble.com/tags/scatter-plot) (não abriu): observar o uso de transparência em pontos densos, o mesmo recurso que resolve a pilha do strip micro.

**Mora melhor em outra família?** Strip plot com eixo e rótulos é 16_distribuicao. Quando a distribuição precisa de resumo em vez de pontos, é o 24.17 ou o 24.35.

---

## 24.17 Boxplot micro

**Descrição.** O resumo de cinco números (mínimo, primeiro quartil, mediana, terceiro quartil, máximo) reduzido a uma célula. Tufte já havia proposto a versão mínima, o quartile plot: tirar preenchimentos, grades, capas dos bigodes e contornos, deixar os bigodes em cinza claro e a mediana como ponto, de modo que o olho siga a trilha das medianas entre linhas. Na célula da tabela é essa versão que sobrevive; a caixa cheia com contorno não cabe em 20 px de altura.

**Anatomia.** Bigode de 1 px do mínimo ao primeiro quartil e do terceiro quartil ao máximo, em `--muted-foreground`; faixa do intervalo interquartílico em barra de 4 px a 6 px, ou um vão vazio no estilo Tufte; ponto ou traço de 2 px na mediana em cor de acento; opcionalmente pontos soltos para outliers.

**Abordagem na stack.** `svg-puro`, com os quantis calculados em TypeScript antes do componente (o Recharts não calcula quartil). `recharts-custom` é possível via `Bar` empilhado com `shape` customizado, mas a geometria em SVG é mais curta que a volta pela biblioteca.

**Ponto delicado.** Qual boxplot. O SpreadJS expõe cinco classes de cálculo diferentes para o mesmo desenho: `5ns` (bigode no mínimo e no máximo, sem outlier), `7ns` (bigodes nos percentis 2 e 98), `tukey` (bigode até 1,5 vez o intervalo interquartílico, com outliers), `bowley` (marcas nos percentis 10 e 90) e `sigma3` (baseado em desvio padrão). Dois boxplots com classes diferentes lado a lado mentem sem aviso. A classe precisa estar fixa no componente e declarada no cabeçalho. O segundo ponto: amostra pequena. Com 6 deals, quartil é ruído com aparência de estatística; abaixo de cerca de 10 observações, trocar para o strip plot (24.16), que mostra os 6 pontos sem fingir precisão.

**Versões sugeridas.**
- **V1 básica: ticket dos deals ganhos por produto fictício.** Um boxplot por linha, escala comum, classe `tukey`.
- **V2 com anotação: faixa aceitável ao fundo.** A mesma célula com uma banda cinza atrás marcando o ticket mínimo que o produto exige, recurso que o SpreadJS chama de `acceptableStart` e `acceptableEnd`.
- **V3 densa do Farol: dias parado por estágio do funil.** Oito estágios, um boxplot por linha, versão Tufte com mediana em ponto; o gargalo aparece como a mediana que foge da coluna.
- **V4 caso limite: amostra insuficiente.** Estágio com 4 deals. O componente recusa o boxplot e desenha os 4 pontos, com o chip "n=4".

**Referências.**
- Catálogo: [SpreadJS, box plot sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkboxplot): observar as cinco classes de cálculo, a média opcional e a faixa aceitável.
- Catálogo: [Data Viz Catalogue, box and whisker plot](https://datavizcatalogue.com/methods/box_plot.html) (não abriu): observar a anatomia completa, que é o ponto de partida do que o micro remove.
- Praticante: [Simplex, Tufte in Excel: the box plot](https://simplexct.com/tufte-in-excel-the-box-plot): observar a remoção de preenchimentos, grades, capas e contornos, bigodes em cinza e mediana em vermelho para seguir a trilha das medianas.
- Praticante: [Displayr, sparkline box](https://displayrdocs.zendesk.com/hc/en-us/articles/8012701338255-Visualization-Distributions-Sparkline-Box) (não abriu): observar a existência do boxplot como tipo próprio de sparkline em ferramenta de pesquisa.
- Portal de design: [Dribbble, tag box plot](https://dribbble.com/tags/box_plot) (não abriu): observar a raridade do modelo em portais, sinal de que a legibilidade depende de público treinado.

**Mora melhor em outra família?** Boxplot com eixo, comparação de grupos e outliers rotulados é 16_distribuicao.

---

## 24.18 Micro dumbbell

**Descrição.** Dois pontos numa linha horizontal ligados por um traço, dentro de uma célula: o antes e o depois, ou o valor e a referência. O Datawrapper separa três parentes em escala cheia e a separação vale igual no micro: o **dot plot** mostra pontos numa linha sem ligação; o **range plot** mostra exatamente dois pontos com traço forte e serve quando a ênfase é a **distância** entre eles; o **arrow plot** troca o traço por uma seta que aponta do instante anterior para o posterior e serve quando a ênfase é a **direção** da mudança entre duas datas.

**Anatomia.** Trilho implícito; traço de 2 px a 3 px entre os dois valores; ponto vazado (anterior) e ponto cheio (atual), ou ponta de seta no atual; cor do traço opcionalmente pela polaridade da mudança; rótulo do valor atual fora da célula.

**Abordagem na stack.** `svg-puro`: dois `circle` e um `line`, ou um `path` com `marker-end` para a versão seta. `html-tailwind` também resolve com três `div` absolutas posicionadas em porcentagem, e essa é a versão mais leve em tabela longa. Recharts não tem vantagem aqui.

**Ponto delicado.** Dizer qual ponto é o atual. Dois círculos iguais obrigam o leitor a adivinhar a direção, e metade adivinha errado. Resolver com forma (vazado contra cheio) ou com seta, nunca só com cor. O segundo ponto: pontos coincidentes. Quando antes e depois são iguais, o traço some e os dois círculos se sobrepõem; desenhar um único ponto com anel e o `aria-label` "sem variação". O terceiro: o Datawrapper avisa que as células precisam ter medidas da mesma natureza; misturar valor absoluto num ponto e percentual no outro produz uma distância sem significado.

**Versões sugeridas.**
- **V1 básica: win rate por executivo, trimestre anterior contra atual.** Ponto vazado, ponto cheio, traço entre eles, escala comum de 0 a 100 por cento.
- **V2 com anotação: seta e cor de polaridade.** Versão arrow plot, seta verde quando subiu e vermelha quando caiu, tabela ordenada pelo tamanho da mudança.
- **V3 densa do Farol: CPL por plataforma fictícia contra CPL qualificado.** Dois pontos por linha que não são antes e depois, mas duas medidas do mesmo custo; o comprimento do traço é o custo da desqualificação, que é a leitura que interessa ao Marketing.
- **V4 caso limite: sem valor no trimestre anterior.** Canal lançado no trimestre atual. Só o ponto cheio aparece, sem traço, e o chip "novo" substitui a variação.

**Referências.**
- Catálogo: [microcharts, Dumbbell](https://microcharts.dev/docs/charts/dumbbell) (não abriu; link da navegação da biblioteca): observar o dumbbell como componente de célula num catálogo dedicado a microvisuais.
- Praticante: [Datawrapper Academy, how to create an arrow plot](https://www.datawrapper.de/academy/how-to-create-an-arrow-plot): observar a regra de escolha entre arrow plot (duas datas), range plot (distância entre pontos) e dot plot (sem tempo), e o aviso de medidas comparáveis.
- Praticante: [Datawrapper Academy, how to create a range plot](https://www.datawrapper.de/academy/how-to-create-a-range-plot) (não abriu): observar a definição de exatamente dois pontos com traço forte.
- Portal de design: [Dribbble, tag range chart](https://dribbble.com/tags/range_chart) (não abriu): observar a escassez do modelo em portais, apesar de ser um dos mais legíveis para antes e depois.

**Mora melhor em outra família?** Dumbbell com eixo e rótulos por categoria é 17_comparacao-de-pontos. Dois instantes ligados como inclinação é o micro slope (24.31).

---

## 24.19 Micro dispersão

**Descrição.** Uma nuvem de pontos de duas medidas dentro de uma caixa pequena, sem eixos. O SpreadJS cataloga como scatter sparkline, destinada a "compact relationship analysis". Serve para uma pergunta só: as duas medidas andam juntas nesta linha, e essa relação é diferente da linha vizinha? Não serve para ler valor, nem para identificar ponto.

**Anatomia.** Caixa quadrada ou levemente horizontal de 32 px a 48 px de lado; pontos de 2 px a 3 px com opacidade entre 40 e 60 por cento; opcionalmente uma linha de tendência de 1 px e o ponto mais recente em cor de acento; quadrícula ausente, mas um traço fino na mediana de cada eixo ajuda a ler quadrante.

**Abordagem na stack.** `recharts-nativo` para poucas instâncias: `ScatterChart` com `XAxis` e `YAxis` presentes, mas com `hide`, domínio fixo e um `Scatter` com `isAnimationActive={false}`. Para tabela com dezenas de linhas, `svg-puro` com as escalas calculadas em TypeScript. A reta de tendência, se usada, é regressão linear calculada fora do componente e desenhada como `line`.

**Ponto delicado.** Eixo implícito que ninguém decifra. Sem rótulo, o leitor não sabe qual medida está na horizontal; o cabeçalho da coluna precisa dizer ("x: investimento, y: leads"). O segundo ponto é estatístico: com menos de 12 pontos ou correlação fraca, a nuvem sugere padrão onde não há, e a linha de tendência piora, porque dá autoridade ao ruído. Recusar a reta abaixo de um número mínimo de pontos. O terceiro: escala comum entre linhas é quase obrigatória, senão todas as nuvens preenchem a caixa e parecem igualmente correlacionadas.

**Versões sugeridas.**
- **V1 básica: investimento diário contra leads por plataforma fictícia.** Uma nuvem por linha, 30 dias, escala comum.
- **V2 com destaque: o dia mais recente.** Ponto de acento no último dia, mostrando se ele está na nuvem ou fora dela.
- **V3 densa do Farol: tabela de 20 criativos, frequência contra CTR.** A nuvem de cada criativo revela fadiga: CTR caindo à medida que a frequência sobe, uma inclinação descendente que o número médio esconde.
- **V4 caso limite: poucos dias de veiculação.** Criativo com 5 dias no ar. A caixa mostra os 5 pontos sem reta e com o chip "n=5".

**Referências.**
- Catálogo: [SpreadJS, lista de tipos de sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain): observar a scatter sparkline ao lado dos outros 23 tipos, o que dá a medida de quão raro o modelo é mesmo em ferramentas especializadas.
- Catálogo: [Spread Windows Forms, scatter sparkline](https://developer.mescius.com/spreadnet/docs/latest/online-win/scatter-sparkline.html) (não abriu): observar a descrição de correlação entre dois conjuntos de valores numa célula.
- Praticante: [Wikipedia, scatter plot](https://en.wikipedia.org/wiki/Scatter_plot) (não abriu): observar a advertência clássica de que correlação visual não é causalidade, que num micro sem eixo pesa mais.
- Portal de design: [Dribbble, tag scatter chart](https://dribbble.com/tags/scatter-chart) (não abriu): observar como a dispersão quase nunca aparece em tamanho reduzido nos portais.

**Mora melhor em outra família?** Dispersão com eixos, rótulos e bolhas é 09_dispersao-e-bolhas, e é quase sempre onde esse modelo deve morar; o micro só se justifica em small multiples por linha.

---

## 24.20 Pílula de variação

**Descrição.** O delta ao lado do KPI, desenhado como texto dentro de um chip: sinal, número, unidade e um glifo de direção. É o microvisual mais comum dos cards de dashboard e o que mais mente por omissão. O Tremor resolve com o `BadgeDelta`, que tem cinco estados (`increase`, `moderateIncrease`, `unchanged`, `moderateDecrease`, `decrease`) e a propriedade `isIncreasePositive` para métricas em que subir é ruim. A biblioteca microcharts leva a regra mais longe: a direção é sempre dupla, "a triangle and a color, so it never relies on color alone", e a polaridade invertida troca **só** a cor, nunca o glifo.

**Anatomia.** Chip com raio total, altura de 20 px a 24 px; glifo de direção (triângulo ou seta do lucide-react, `TrendingUp`, `TrendingDown`, `Minus`); número com sinal explícito em `tabular-nums`; cor de fundo em opacidade baixa e texto na cor cheia da polaridade; opcionalmente a base da comparação em texto menor fora do chip ("contra o mês anterior").

**Abordagem na stack.** `html-tailwind` com lucide-react. Um `span` `inline-flex items-center gap-1 rounded-full px-2 text-xs tabular-nums`, com as classes de cor resolvidas por uma função pura `tom(delta, polaridade, faixaNeutra)` que devolve `bom`, `ruim` ou `neutro`. Nenhum SVG próprio além do ícone.

**Ponto delicado.** Três armadilhas, todas de conteúdo e não de desenho. **Base pequena:** de 2 para 5 leads é "mais 150 por cento", e a pílula verde gigante vira a manchete do card; abaixo de uma base mínima, mostrar o delta absoluto ("mais 3") em vez do percentual. **Zero e indefinido:** a microcharts manda exibir o glifo neutro e "No change" em vez de `+0%`, e um travessão no lugar de `NaN%` quando a base é zero; no Farol isso vale para toda métrica com denominador que pode zerar. **Polaridade:** CPL que subiu é ruim; a pílula recebe a polaridade da métrica como propriedade, e o glifo continua apontando para cima. Um quarto ponto: faixa neutra. Variação de 0,3 por cento pintada de verde é ruído colorido; declarar uma faixa em que o tom é neutro.

**Versões sugeridas.**
- **V1 básica: receita reconhecida do mês contra o mês anterior.** Chip verde "mais 12,4 por cento" com seta para cima.
- **V2 com anotação: base da comparação explícita.** O mesmo chip com o texto "contra 2025-09" ao lado e o valor absoluto do delta no tooltip.
- **V3 densa do Farol: quatro cards de Marketing.** Investimento, leads, CPL e CPL qualificado, cada um com pílula; CPL e CPL qualificado com polaridade invertida, de modo que a alta aparece em vermelho com seta para cima.
- **V4 caso limite: base zero e base minúscula.** Canal sem lead no mês anterior mostra glifo neutro e "sem base"; canal que foi de 2 para 5 mostra "mais 3" e não "mais 150 por cento".

**Referências.**
- Catálogo: [Tremor, badges e BadgeDelta](https://npm.tremor.so/docs/ui/badges): observar os cinco `deltaType`, a propriedade `isIncreasePositive` e o exemplo de card de KPI com "+9.3%".
- Catálogo: [microcharts, Delta](https://microcharts.dev/docs/charts/delta): observar a direção dupla (glifo e cor), a polaridade que troca só a cor e o tratamento de zero e de `NaN`.
- Praticante: [Mobbin, glossário de badge](https://mobbin.com/glossary/badge): observar que a pílula é o formato de badge mais comum e o uso como rótulo de item em lista, que é a posição da pílula em tabela.
- Portal de design: [Creative Tim, KPI cards com sparkline e indicador de variação](https://www.creative-tim.com/ui/block/kpi-sparkline-cards) (não abriu): observar a composição recorrente de número grande, pílula no canto e sparkline embaixo.
- Portal de design: [Dribbble, tag percentage](https://dribbble.com/tags/percentage) (não abriu): observar quantas pílulas usam só cor, sem glifo, que é o erro a evitar.

**Mora melhor em outra família?** O card que hospeda a pílula é 01_cards-e-kpis. Variação ao longo do tempo é o sparkbar divergente (24.8).

---

## 24.21 Seta de tendência no texto

**Descrição.** Um glifo de direção, sem número dentro, que cabe numa frase, num rótulo de coluna ou numa célula estreita. Stephen Few já tratava o sparkline como o complemento da seta: a seta diz a direção de agora, o sparkline acrescenta o contexto histórico. A biblioteca microcharts dá a regra de desenho mais importante do modelo: "The glyph never scales with magnitude: an arrow twice as long would claim precision this size can't carry." Seta só diz subiu, desceu ou ficou; qualquer tentativa de codificar intensidade no ângulo ou no tamanho promete uma precisão que o glifo não tem.

**Anatomia.** Ícone de 12 px a 16 px alinhado à linha de base do texto; três estados (cima, baixo, estável); cor de polaridade reforçando a forma; o número que sustenta a direção sempre visível na mesma linha ou no tooltip.

**Abordagem na stack.** `html-tailwind` com lucide-react (`ArrowUpRight`, `ArrowDownRight`, `ArrowRight`), dentro de um `span` `inline-flex align-baseline`. A decisão de estado é função pura com faixa de ruído: `estado(delta, faixa)` devolve `estavel` quando `|delta| < faixa`.

**Ponto delicado.** A faixa de estabilidade. Sem ela, uma oscilação de 0,1 por cento vira seta para cima e o painel inteiro parece em movimento; a microcharts chama esse parâmetro de `flatBand` e o descreve como o lugar onde se declara o piso de ruído. O segundo ponto: seta sem o valor. Seta isolada é afirmação sem prova; a regra é o número estar a um olhar de distância. O terceiro: polaridade, igual à pílula; a seta de CPL para cima continua apontando para cima e fica vermelha.

**Versões sugeridas.**
- **V1 básica: coluna de direção na tabela de origens.** Uma seta por linha, faixa de estabilidade de 5 por cento.
- **V2 com anotação: seta dentro da frase.** Texto de resumo do card: "entradas estáveis, agendas em queda, SLA em alta", com as setas inline e o valor no tooltip de cada uma.
- **V3 densa do Farol: cabeçalho de 12 colunas de métricas da Diretoria.** Uma seta ao lado do rótulo de cada coluna resumindo a direção do total, o que permite ler a tabela antes de ler os números.

**Referências.**
- Catálogo: [microcharts, TrendArrow](https://microcharts.dev/docs/charts/trend-arrow): observar o glifo que não escala com a magnitude, o `flatBand` como piso de ruído e a recomendação de usar Delta para magnitude e Sparkline para série.
- Praticante: [Stephen Few, Information Dashboard Design, apresentação](https://blogs.ischool.berkeley.edu/i247s12/files/2012/01/Dashboard-Design-Overview-Presentation.pdf) (não abriu): observar, pelo resumo da busca, a ideia de que o sparkline enriquece a seta de tendência com o histórico.
- Portal de design: [Dribbble, tag indicator](https://dribbble.com/tags/indicator) (não abriu): observar a variedade de glifos de direção e o uso frequente de seta com tamanho variável, que é o erro que o modelo proíbe.

**Mora melhor em outra família?** Direção com magnitude é a pílula (24.20). Palavras e glifos em texto corrido podem também ser tratados em 21_texto-e-nuvem-de-palavras.

---

## 24.22 Medidor de cobertura de dado

**Descrição.** Um microvisual que não fala do negócio, fala do **próprio indicador**: quanto do universo tem o dado que sustenta o número ao lado. É o modelo que o Farol precisa mais do que os catálogos oferecem, porque "leads por origem com cobertura de dado" é requisito do público de Marketing e porque um CPL qualificado calculado sobre 40 por cento da base não é o mesmo número que um CPL calculado sobre 95 por cento. A pesquisa de Song e Szafir sobre visualização de dado ausente dá a base empírica: visualizações que **destacam** o valor ausente elevam a percepção de qualidade e confiança, enquanto as que simplesmente quebram a continuidade reduzem essa percepção e podem enviesar a interpretação. Mostrar a lacuna, portanto, não enfraquece o painel; escondê-la é que enfraquece.

**Anatomia.** Duas formas canônicas. A **fração**: chip com o percentual de cobertura e um micro trilho de 40 px preenchido na proporção. A **barra de qualidade em três segmentos**: válido, inválido e ausente, na ordem fixa, com ausente em cinza hachurado; é o padrão que ferramentas de qualidade de dado colocam no topo de cada coluna de tabela. Em ambos, o rótulo diz sobre qual denominador ("58 por cento dos leads do período têm telefone").

**Abordagem na stack.** `html-tailwind`. A fração é um `div` de trilho com um filho de largura percentual e um `span` de texto; a barra de três segmentos é o mesmo `flex` da barra de composição (24.13) com hachura via `background-image: repeating-linear-gradient(...)` no segmento ausente. O limiar que muda o estado do indicador (por exemplo, abaixo de 50 por cento o número principal fica esmaecido e ganha o ícone `TriangleAlert` do lucide-react) é função pura, fora do componente.

**Ponto delicado.** O denominador. "Cobertura" sem base declarada é ambígua: cobertura sobre a base inteira, sobre o período, sobre os leads que passaram de etapa? Cada uma dá um número diferente e defensável; o componente exige o denominador como texto obrigatório. O segundo ponto, e o mais caro: **cobertura baixa pode ser defeito de coleta, não da base**. Fill-rate suspeito num campo que a origem trata como obrigatório é sintoma de que o coletor lê um endpoint que não devolve o campo, e o medidor precisa permitir essa leitura, mostrando a série da cobertura ao longo do tempo: um degrau brusco é coleta, uma rampa lenta é comportamento. O terceiro: ausente não é zero. A barra de três segmentos só é honesta se "ausente" e "valor zero" forem categorias diferentes antes de chegar ao componente.

**Versões sugeridas.**
- **V1 básica: chip de cobertura ao lado do CPL qualificado.** "Cobertura 58 por cento", trilho curto, número principal normal porque está acima do limiar.
- **V2 com destaque: três segmentos por campo.** Telefone válido, telefone malformado, sem telefone; o segmento malformado é o que o time de dados consegue corrigir.
- **V3 densa do Farol: tabela de 38 origens com coluna de cobertura.** Ao lado do volume de leads, a cobertura do campo de qualificação; as origens abaixo de 50 por cento ficam com o número de CPL qualificado esmaecido e o ícone de alerta, e a ordenação padrão coloca as piores coberturas no topo.
- **V4 caso limite: salto de cobertura por mudança de coleta.** A cobertura de telefone pula de 21 para 58 por cento num mês porque a coleta passou a ler o detalhe de cada contato. O medidor mostra o sparkline de cobertura com o degrau e uma anotação "mudança de coleta em 2026-08-03", para ninguém ler o salto como mudança de comportamento dos leads.

**Referências.**
- Catálogo: [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars): observar `ProgressBar` e `CategoryBar` como ingredientes prontos para fração e segmentos, e o fato de nenhum deles ter estado de "ausente".
- Catálogo: [DQOps, tipos de dashboard de qualidade de dado](https://dqops.com/docs/dqo-concepts/types-of-data-quality-dashboards/) (não abriu): observar, pelo resumo da busca, a dimensão de completude como painel próprio.
- Praticante: [Song e Szafir, Where's My Data? Evaluating Visualizations with Missing Data](https://cmci.colorado.edu/visualab/MissingData/) (não abriu): observar o achado de que destacar o ausente eleva a qualidade percebida e que quebrar a continuidade a reduz e enviesa a leitura.
- Praticante: [artigo completo em PDF](https://cmci.colorado.edu/visualab/papers/song_VIS_2018.pdf) (não abriu): observar os três modos de codificar valor imputado (destacar, atenuar, anotar) e os três métodos de imputação testados.
- Portal de design: [Dribbble, tag status indicator](https://dribbble.com/tags/status-indicator) (não abriu): observar a ausência quase total de indicadores de qualidade de dado em portais, o que confirma que o modelo precisa ser desenhado do zero.

**Mora melhor em outra família?** Cobertura como painel próprio, por campo e por fonte, é 14_tabelas-visuais ou 15_mapa-de-calor-e-calendario. O modelo aqui é o selo colado no indicador.

---

## 24.23 Faixa de calor

**Descrição.** Uma fileira de células de largura igual, um período por célula, cor proporcional ao valor. As warming stripes são o exemplo mais conhecido e a prova de que a forma funciona sem eixo, sem rótulo e sem número. Em tabela, o Datawrapper transformou a mesma ideia em recurso: colorir células pelo valor para que o leitor "quickly skim the table for outliers and patterns", com gradiente contínuo ou em degraus, intervalo de cor definido à mão e legenda opcional, e a sugestão de esconder valores e cabeçalhos para criar colunas bem estreitas quando há muitas.

**Anatomia.** N retângulos contíguos ou com vão de 1 px; altura de 10 px a 16 px; escala sequencial de uma matiz para magnitude ou divergente de duas matizes para desvio contra meta; legenda de classes fora da faixa, uma vez por coluna; valor ausente com hachura, fora da escala de cor.

**Abordagem na stack.** `html-tailwind` ou `svg-puro`. Como a cor é calculada, não dá para usar classe Tailwind dinâmica; a cor sai de uma função pura `cor(valor, classes, paleta)` e entra por `style={{ backgroundColor }}`. A versão em degraus (5 a 7 classes) é preferível à contínua: cabe em legenda e resiste melhor ao tema escuro. SVG com `rect` ganha quando há mais de 60 células ou quando a faixa precisa exportar como imagem.

**Ponto delicado.** Três. **Escala sequencial contra divergente:** usar divergente só quando existe um ponto neutro com significado (a meta, o zero da variação); sem ele, divergente inventa uma fronteira. **Tema escuro:** em fundo escuro, a classe mais baixa não pode ter a mesma luminância do fundo, senão "valor baixo" e "sem célula" ficam idênticos; a rampa começa num tom já distinto do fundo. **Daltonismo:** verde e vermelho como extremos são a escolha errada; azul e laranja resistem a deuteranopia. Por fim, ausente nunca vira a menor classe: vira hachura.

**Versões sugeridas.**
- **V1 básica: 52 semanas de entradas na pré-vendas.** Escala sequencial de 5 classes, uma faixa por card.
- **V2 com anotação: semana corrente destacada.** Borda de 1 px na última célula e o valor dela escrito ao lado, respondendo "e esta semana?".
- **V3 densa do Farol: 12 filas por 26 semanas de SLA.** Uma faixa por fila, escala divergente centrada na meta de SLA de cada fila, colunas estreitas sem número, legenda única no cabeçalho; os blocos de laranja em diagonal mostram o estouro se propagando de uma fila para a seguinte.
- **V4 caso limite: semanas sem coleta.** Quatro semanas sem dado numa fila aparecem hachuradas, e o `aria-label` conta "4 semanas sem coleta"; pintá-las na classe mais clara faria parecer que a fila parou.

**Referências.**
- Catálogo: [Datawrapper, heatmaps for tables](https://www.datawrapper.de/blog/heatmaps-for-tables): observar escala em degraus contra contínua, intervalo de cor manual, legenda, colunas estreitas sem valor e barras sobre o heatmap.
- Catálogo: [microcharts, HeatStrip](https://microcharts.dev/docs/charts/heat-strip) (não abriu; link da navegação da biblioteca): observar a faixa de calor como componente dedicado de célula.
- Praticante: [Wikipedia, warming stripes](https://en.wikipedia.org/wiki/Warming_stripes): observar a remoção deliberada de eixo, rótulo e número, que é o que torna a faixa legível em qualquer tamanho.
- Praticante: [Datawrapper Academy, how to create a heatmap](https://academy.datawrapper.de/article/308-how-to-create-a-heatmap) (não abriu): observar o passo a passo de escolha de paleta e de intervalo.
- Portal de design: [Dribbble, tag heatmap](https://dribbble.com/tags/heatmap) (não abriu): observar a frequência de rampas verde e vermelho, que é o padrão a evitar.

**Mora melhor em outra família?** Grade de duas dimensões (fila por semana como matriz) é 15_mapa-de-calor-e-calendario. A faixa aqui é uma linha só, dentro de célula ou card.

---

## 24.24 Micro waffle de contagem

**Descrição.** Uma grade pequena de unidades contáveis, com as preenchidas representando o valor. O Data Viz Project descreve o waffle como grade de células pequenas em que as coloridas representam o dado, útil para progresso contra alvo ou percentual de conclusão. No tamanho micro, o modelo só sobrevive com uma condição: **a unidade precisa ser contável de verdade**. A biblioteca microcharts, que é dedicada a microvisuais, exclui explicitamente waffles, pizzas e gauges de ponteiro porque "fail at word size", e oferece no lugar o `IconArray`: grade fixa de 10, 20 ou 100 unidades, "the denominator on show", sem nenhuma unidade parcialmente preenchida.

**Anatomia.** Grade de 10 unidades em linha (1 por 10) ou de 20 em duas linhas (2 por 10); quadrados ou círculos de 4 px a 6 px com vão de 1 px a 2 px; preenchidas em cor cheia, vazias em contorno ou em `--muted`; o número por extenso ao lado ("3 de 10").

**Abordagem na stack.** `html-tailwind`: `grid grid-cols-10 gap-0.5` com `Array.from({ length: n })` e a classe decidida pelo índice. Para ícone (pessoa, reunião), `svg-puro` com um `symbol` reutilizado por `use`, ou ícones do lucide-react em tamanho 10 px quando a grade tem no máximo 10 unidades.

**Ponto delicado.** Unidade parcial e unidade fictícia. A regra da microcharts é categórica: "A 37% rate is never a unit drawn 37% full, and a rate too small to fill one unit is flagged rather than faked." Arredondar 37 por cento para 4 de 10 é aceitável se o texto disser 37 por cento; desenhar uma unidade 70 por cento cheia não é, porque ninguém lê fração de quadrado de 5 px. O segundo ponto: waffle de percentual abstrato. Se 10 unidades não correspondem a 10 coisas reais, o waffle é só uma barra de progresso mais difícil de ler; o uso honesto é contagem pequena e inteira (vagas, SDRs, reuniões da semana).

**Versões sugeridas.**
- **V1 básica: agendas da semana contra o piso de 10.** Dez quadrados, 7 preenchidos, "7 de 10" ao lado.
- **V2 com destaque: estado por unidade.** Cada unidade é uma reunião: cheia quando aconteceu, contorno quando está marcada, cinza riscado quando foi cancelada.
- **V3 densa do Farol: ocupação das 6 posições de SDR por fila.** Uma grade de 6 unidades por fila, preenchida pelas posições ocupadas, com a vaga aberta em contorno tracejado; a Diretoria lê capacidade instalada sem converter em percentual.
- **V4 caso limite: taxa pequena demais.** Conversão de 0,6 por cento numa grade de 100: nenhuma unidade chega a ser preenchida; o componente mostra a grade vazia com o chip "menos de 1 em 100" em vez de inventar uma unidade.

**Referências.**
- Catálogo: [Data Viz Project, waffle chart](https://datavizproject.com/data-type/percentage-grid/) (não abriu): observar a definição como grade de células coloridas e o uso de vários waffles lado a lado para comparação.
- Catálogo: [microcharts, IconArray](https://microcharts.dev/docs/charts/icon-array): observar as grades de 10, 20 e 100, a proibição de unidade parcial e a sinalização de taxa pequena demais.
- Praticante: [microcharts, when to use](https://microcharts.dev/docs/when-to-use): observar a exclusão deliberada de pizza, gauge de ponteiro e waffle por falharem no tamanho de palavra.
- Portal de design: [Dribbble, tag waffle chart](https://dribbble.com/tags/waffle-chart) (não abriu): observar como o waffle aparece quase sempre grande e decorativo, raramente como microvisual.

**Mora melhor em outra família?** Waffle e pictograma em tamanho de leitura são 22_unidades-waffle-e-pictograma. O micro só vale para contagens até cerca de 20.

---

## 24.25 Micro anel

**Descrição.** Um arco circular de 20 px a 40 px mostrando um único percentual, geralmente dentro de um chip ou no canto de um card. É o microvisual mais popular em portais de design e o menos eficiente em leitura: a microcharts mantém um `MicroDonut` só como acento ao lado de um número impresso e avisa que, para qualquer leitura comparativa, a barra segmentada vence "a donut of the same data at every size we ship", limitando o donut a 4 fatias mais "outros". O anel de progresso de valor único é a variante defensável; a pizza micro (que o SpreadJS oferece como pie sparkline) é a indefensável.

**Anatomia.** Trilho circular completo em `--muted`; arco de progresso com `stroke-linecap` arredondado ou reto; espessura de 3 px a 5 px; início às 12 horas, sentido horário; número fora do anel quando o diâmetro é menor que 32 px, dentro quando é maior.

**Abordagem na stack.** Duas vias. `svg-puro`, a mais leve: um `circle` de trilho e outro `circle` com `strokeDasharray={circunferencia}` e `strokeDashoffset={circunferencia * (1 - pct)}`, girado em menos 90 graus. `recharts-nativo`: `RadialBarChart` com `innerRadius` e `outerRadius`, `startAngle={90}` e `endAngle={-270}`, um `RadialBar` com `background` para o trilho e, detalhe que morde, um `PolarAngleAxis type="number" domain={[0, 100]} tick={false}`; sem esse eixo o Recharts normaliza o valor único pelo próprio máximo e desenha o arco sempre cheio. O Tremor tem o `ProgressCircle` com `radius`, `strokeWidth` e variantes semânticas, e o shadcn/ui publica exemplos de anel radial com texto central usando `Label`.

**Ponto delicado.** Comparação entre linhas. Uma coluna de 20 anéis em tabela obriga o olho a comparar ângulos, que é a codificação mais fraca do repertório; a mesma coluna em barra de dado (24.12) é lida de relance. A regra do Farol: anel só quando há **um** percentual isolado num card, nunca como coluna de tabela. O segundo ponto: valores acima de 100 por cento. O arco não tem para onde crescer; ou se desenha uma segunda volta em outra cor, ou se troca para a barra com teto (24.15). O terceiro: arco muito fino em tema escuro some contra o trilho; espessura mínima de 3 px e contraste de trilho declarado.

**Versões sugeridas.**
- **V1 básica: atingimento da meta do mês num card.** Anel de 36 px com 72 por cento dentro.
- **V2 com anotação: meta intermediária.** Traço radial curto marcando onde o atingimento deveria estar hoje pelo calendário (dia 14 de 30 dá 47 por cento), mostrando que 72 por cento está adiantado.
- **V3 densa do Farol: cabeçalho de 4 cards da pré-vendas.** Entradas, agendas, SLA e ocupação, cada um com anel de 28 px ao lado do número; aceitável porque são quatro percentuais independentes, não uma comparação.
- **V4 caso limite: superação de meta.** 134 por cento. Primeira volta cheia na cor padrão e segunda volta de 34 por cento em cor de destaque sobreposta, com o número escrito; sem isso o anel travado em 100 esconderia a superação.

**Referências.**
- Catálogo: [Recharts, RadialBarChart API](https://recharts.github.io/en-US/api/RadialBarChart/) (não abriu): observar `innerRadius`, `outerRadius`, `startAngle` e `endAngle`, que controlam anel e semicírculo.
- Catálogo: [shadcn/ui, radial charts](https://ui.shadcn.com/charts/radial) (não abriu): observar os exemplos de anel com texto central e de seções empilhadas por `stackId`.
- Catálogo: [Tremor, progress circle](https://www.tremor.so/docs/visualizations/progress-circle) (não abriu): observar `radius`, `strokeWidth` e as variantes semânticas.
- Praticante: [microcharts, MicroDonut](https://microcharts.dev/docs/charts/micro-donut): observar o limite de 4 fatias mais "outros", o uso como acento ao lado de número impresso e a recomendação de barra segmentada para qualquer comparação.
- Portal de design: [Dribbble, UI progress indicator ring](https://dribbble.com/shots/4069776-UI-Progress-Indicator-Percentage-Ring-Chart) (não abriu): observar o anel com percentual central, padrão recorrente em cards.

**Mora melhor em outra família?** Anel e rosca em tamanho de leitura são 07_rosca-e-radial; gauge com meta é 13_progresso-meta-e-gauge. Pizza micro não deve ser usada; composição pequena é a barra de composição mini (24.13).

---

## 24.26 Sparkline em degraus

**Descrição.** O sparkline de linha com interpolação em escada: o traço fica horizontal enquanto o valor não muda e sobe ou desce na vertical no instante da mudança. É a forma correta para grandezas que **não variam continuamente**: headcount da equipe, meta vigente, preço de tabela, teto de capacidade, número de filas ativas. Uma linha diagonal entre dois patamares inventa uma transição gradual que nunca existiu; o degrau diz "ficou exatamente neste nível até este dia".

**Anatomia.** Traço de 1,5 px a 2 px com segmentos só horizontais e verticais; opcionalmente um ponto em cada mudança de nível; o nível atual escrito ao lado; sem eixo.

**Abordagem na stack.** `recharts-nativo`. `Line` com `type="stepAfter"` (o valor vale a partir do ponto até o próximo), `dot={false}` e `isAnimationActive={false}`. As variantes `step` e `stepBefore` existem e mudam o significado: `stepBefore` diz que o novo valor já valia antes da data registrada, o que só é verdade para dado lançado retroativamente. Em `svg-puro`, o `path` alterna `H` e `V` em vez de `L`.

**Ponto delicado.** Escolher o tipo de degrau pelo significado da data. Se a data registra quando a mudança **passou a valer** (contratação em 2026-04-01), é `stepAfter`; se registra o **fim** de um período (fechamento mensal), é `stepBefore`. Errar desloca todos os degraus um período e faz a mudança parecer causa de algo que aconteceu antes dela. O segundo ponto: último degrau. O traço precisa se estender até hoje, e não parar na última mudança, senão parece que a série acabou; a série recebe um ponto sintético na data corrente repetindo o último valor.

**Versões sugeridas.**
- **V1 básica: SDRs ativos por mês, 18 meses.** Degraus de 3 para 4 e de 4 para 6, nível atual escrito ao lado.
- **V2 com anotação: degrau sobre o sparkline de volume.** A linha de volume de entradas em cinza e o teto de capacidade em degraus por cima, mostrando o mês em que a demanda cruzou o teto antes da contratação acontecer.
- **V3 densa do Farol: meta mensal por executivo em tabela.** Uma linha por executivo com a meta em degraus, que muda em datas diferentes para cada um; revela quem teve meta revista no meio do trimestre.
- **V4 caso limite: série com um único nível.** Meta que nunca mudou desenha uma reta horizontal que parece falha de coleta; o componente escreve "sem alteração desde 2026-01-01" em vez de desenhar.

**Referências.**
- Catálogo: [Recharts, Line API](https://recharts.github.io/en-US/api/Line/) (não abriu): observar a propriedade `type` e os valores `step`, `stepBefore` e `stepAfter`.
- Catálogo: [shadcn.io, line chart with step](https://www.shadcn.io/examples/a-line-chart-with-step) (não abriu): observar o exemplo de degrau montado sobre Recharts com Tailwind, a mesma stack do Farol.
- Praticante: [TradingView, o que são step line charts](https://in.tradingview.com/support/solutions/43000745272-what-are-step-line-charts) (não abriu): observar, pelo resumo da busca, a distinção entre degrau (valor fixo até a mudança) e linha (mudança contínua).
- Portal de design: [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline): observar a quase ausência de degraus, sinal de que a interpolação suave é aplicada por hábito mesmo onde o dado é discreto.

**Mora melhor em outra família?** Degrau com eixo e rótulo de cada mudança é 04_linhas; mudanças como eventos datados são 20_cronograma-e-linha-do-tempo.

---

## 24.27 Sparkline de faixa por período

**Descrição.** Para cada período, um traço vertical do mínimo ao máximo e uma marca no valor de fechamento ou na mediana. É a família do OHLC financeiro e da range block sparkline do SpreadJS ("represents intervals or bounded ranges from source data"), levada para operação: quando a pergunta é sobre **variabilidade dentro do período**, a média do período esconde o que importa. Tempo de primeira resposta com mediana de 12 minutos e máximo de 9 horas não é a mesma semana que mediana de 12 e máximo de 40 minutos.

**Anatomia.** Uma coluna por período com traço de 1 px a 2 px do mínimo ao máximo; marca horizontal curta ou ponto na mediana; opcionalmente uma faixa mais grossa entre os percentis 25 e 75; sem eixo; a coluna mais recente em cor de acento.

**Abordagem na stack.** `recharts-custom`. `BarChart` com `dataKey` devolvendo `[min, max]`, que o Recharts aceita como barra de intervalo, largura estreita por `barSize`, e um `Scatter` ou `Line` sem traço com `dot` customizado para a mediana, dentro de um `ComposedChart`. Em `svg-puro` são dois `line` e um `circle` por período, e é a versão preferível em tabela.

**Ponto delicado.** Ser lido como barra de volume. Uma coluna que não começa no zero, num microvisual sem eixo, é interpretada como quantidade; a distinção precisa vir do desenho (traço fino, nunca barra cheia) e do cabeçalho ("faixa mínimo e máximo por semana"). O segundo ponto: outlier domina. Um único lead respondido depois de um feriado estica o máximo e achata todas as outras semanas; usar percentis 5 e 95 no lugar de mínimo e máximo, declarado no cabeçalho, é quase sempre a escolha certa em operação.

**Versões sugeridas.**
- **V1 básica: tempo de primeira resposta por semana, 12 semanas.** Traço do percentil 5 ao 95, ponto na mediana.
- **V2 com destaque: faixa interquartil.** Traço fino do mínimo ao máximo e trecho grosso entre os quartis, com a mediana em acento; as semanas de alta variabilidade saltam pelo comprimento do trecho grosso.
- **V3 densa do Farol: ticket dos deals ganhos por mês, por produto fictício.** Uma célula por produto, 12 meses, escala comum; revela o produto cuja mediana é estável mas cuja faixa se abriu, sinal de mistura de perfis de cliente.
- **V4 caso limite: período com uma observação.** Mês com um único deal ganho vira ponto sem traço, e o `aria-label` diz "1 observação".

**Referências.**
- Catálogo: [SpreadJS, lista de tipos de sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain): observar a RangeBlock sparkline, definida como representação de intervalos limitados.
- Catálogo: [microcharts, Sparkline](https://microcharts.dev/docs/charts/sparkline): observar na navegação o componente Ohlc entre os microvisuais centrais, e na página a regra de `null` como lacuna que nunca interpola.
- Praticante: [Datawrapper Academy, customizing your range plot](https://www.datawrapper.de/academy/customizing-your-range-plot) (não abriu): observar como a distância entre dois extremos vira a leitura principal.
- Portal de design: [Dribbble, tag candlestick chart](https://dribbble.com/tags/candlestick-chart) (não abriu): observar a marca de abertura e fechamento, que no Farol vira mediana e último valor.

**Mora melhor em outra família?** Faixa por período com eixo é 16_distribuicao (boxplot no tempo) ou 05_areas (banda). O micro é para variabilidade por linha de tabela.

---

## 24.28 Barra de desvio em célula

**Descrição.** Uma barra horizontal que nasce de uma linha de referência no centro da célula e cresce para a direita quando o valor está acima dela e para a esquerda quando está abaixo. É um desvio único por linha, não uma série. O SpreadJS cataloga a forma como vari sparkline ("variance against a reference point"), com referência, mínimo e máximo, marca opcional e cores para positivo e negativo; o Tremor tem o `DeltaBar`, de menos 100 a mais 100, com `isIncreasePositive`; e o SpreadJS ainda lista a variante pirulito, a lollipop variance sparkline, que troca a barra por haste e ponto.

**Anatomia.** Linha de referência vertical de 1 px no centro; barra de 6 px a 10 px a partir dela; duas cores de polaridade; opcionalmente uma marca secundária (a meta esticada, por exemplo); número com sinal fora da barra, alinhado à direita.

**Abordagem na stack.** `html-tailwind`. Um contêiner `relative` com um `div` de 1 px em `left-1/2`, e a barra como `div` absoluto com `left: 50%` e `width: pct/2 %` quando positiva, ou `right: 50%` e a mesma largura quando negativa. A escala `pct = |desvio| / maxAbsColuna` é calculada uma vez por coluna. A variante pirulito troca a barra por um `div` de 1 px e um círculo de 6 px na ponta.

**Ponto delicado.** A polaridade e a simetria, as mesmas do sparkbar divergente (24.8), com um agravante: sem série, o leitor não tem contexto para suspeitar de erro. A escala precisa ser simétrica e comum à coluna (maior desvio absoluto da tabela), e a cor precisa mapear bom e ruim, não mais e menos. O segundo ponto: desvio relativo contra absoluto. "Mais 40 por cento sobre a meta" numa meta de 5 agendas e "mais 8 por cento" numa meta de 200 não são comparáveis em importância; quando a tabela mistura bases muito diferentes, a coluna vizinha precisa mostrar o desvio absoluto.

**Versões sugeridas.**
- **V1 básica: realizado contra meta por executivo, em percentual.** Barra verde para a direita, vermelha para a esquerda, escala simétrica de menos 50 a mais 50.
- **V2 com anotação: variante pirulito com meta esticada.** Haste e ponto, mais uma marca fina em mais 20 por cento indicando a meta de superação.
- **V3 densa do Farol: 26 criativos, CPL qualificado contra a mediana da campanha.** Polaridade invertida (acima da mediana é ruim), escala comum, ordenação pelo desvio; os criativos a cortar se agrupam no topo com barras vermelhas para a direita.
- **V4 caso limite: desvio fora da escala.** Um criativo com CPL 6 vezes a mediana. A barra é recortada na borda com um chevron e o número exato fica escrito; esticar a escala para ele achataria todos os outros.

**Referências.**
- Catálogo: [SpreadJS, vari sparkline](https://developer.mescius.com/spreadjs/docs/v18/features/sparkmain/sparkvari): observar referência, mínimo e máximo, marca opcional, legenda e cores separadas para acima e abaixo da referência.
- Catálogo: [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars): observar o `DeltaBar` de menos 100 a mais 100 e o `isIncreasePositive` para métricas em que subir é ruim.
- Praticante: [microcharts, Delta](https://microcharts.dev/docs/charts/delta): observar a regra de que inverter a polaridade troca a cor e nunca a direção, que vale igual para a barra.
- Praticante: [Datawrapper Academy, como adicionar gráficos a tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar os seletores de cor separados para positivo e negativo nas barras de célula.
- Portal de design: [Dribbble, tag kpi dashboard](https://dribbble.com/tags/kpi-dashboard): observar a raridade de barras de desvio centradas em cards, quase sempre substituídas por pílulas.

**Mora melhor em outra família?** Desvios com eixo e rótulo por categoria são 02_barras-horizontais (barra divergente). Um desvio só, sem barra, é a pílula (24.20).

---

## 24.29 Marcador em trilho

**Descrição.** Um trilho horizontal representando uma faixa conhecida (mínimo e máximo histórico, piso e teto aceitáveis, faixa de mercado) e um único ponto marcando onde o valor atual cai. Não há barra crescendo do zero: a leitura é **posição**, e não quantidade. O Tremor chama o componente de `MarkerBar`, que desenha o marcador e, quando recebe `minValue` e `maxValue`, também a faixa; a microcharts oferece o `DotPlot` como parente de célula. É o microvisual certo para "o CPL de hoje é alto ou baixo para o que já vimos".

**Anatomia.** Trilho de 4 px a 6 px em `--muted`, com a faixa de referência em tom um pouco mais forte; ponto ou traço vertical de 8 px a 12 px no valor atual, em cor de acento; rótulos opcionais de mínimo e máximo nas pontas, em texto de 10 px; valor atual escrito fora.

**Abordagem na stack.** `html-tailwind`. Contêiner `relative h-3`, faixa como `div` absoluto com `left` e `width` percentuais, marcador como `div` com `left: pct%` e `-translate-x-1/2`. Nenhuma biblioteca.

**Ponto delicado.** O que o trilho representa. Um trilho de 0 a 100 dá leitura de percentual; um trilho do mínimo ao máximo histórico dá leitura de posição relativa; um trilho da faixa aceitável dá leitura de julgamento. Os três desenham igual e dizem coisas diferentes, e só o rótulo desfaz a ambiguidade; o componente exige os limites como texto visível ou `aria-label`. O segundo ponto: valor fora do trilho. O marcador preso na borda esconde o quanto passou; ele fica na borda com uma seta para fora e o número escrito.

**Versões sugeridas.**
- **V1 básica: CPL do mês na faixa dos últimos 12 meses.** Trilho do menor ao maior CPL do período, ponto no mês atual.
- **V2 com contexto: faixa aceitável dentro do trilho.** Trilho do mínimo ao máximo histórico, com a faixa aceitável em tom mais forte no meio; o ponto dentro ou fora dela é o julgamento.
- **V3 densa do Farol: participação de mercado por segmento, com perímetro declarado.** Uma linha por segmento, trilho da menor à maior participação entre concorrentes fictícios do perímetro, ponto na participação própria; a nota do cabeçalho diz qual perímetro define o trilho.
- **V4 caso limite: valor fora da faixa histórica.** Novo recorde de CPL; o ponto fica na borda direita com chevron e o rótulo "acima do máximo de 12 meses".

**Referências.**
- Catálogo: [Tremor, data bars](https://npm.tremor.so/docs/visualizations/data-bars): observar o `MarkerBar` com marcador e faixa opcional entre `minValue` e `maxValue`.
- Catálogo: [microcharts, DotPlot](https://microcharts.dev/docs/charts/dot-plot) (não abriu; link da navegação da biblioteca): observar o dot plot como microvisual de célula.
- Praticante: [Datawrapper Academy, customizing your dot plot](https://www.datawrapper.de/academy/customizing-your-dot-plot) (não abriu): observar as opções de destaque de um ponto sobre a linha.
- Praticante: [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): observar a faixa de normalidade cinza, que é o trilho deste modelo sem a série.
- Portal de design: [Dribbble, tag kpi cards](https://dribbble.com/tags/kpi_cards) (não abriu): observar a raridade do marcador em trilho, apesar de ser mais honesto que a barra de progresso quando não há meta.

**Mora melhor em outra família?** Vários pontos por linha, com eixo, é 17_comparacao-de-pontos. Com série temporal e faixa, é o 24.4.

---

## 24.30 Barras pareadas mini

**Descrição.** Duas barras finas empilhadas verticalmente dentro da célula, a de cima para o período atual e a de baixo para a referência (período anterior, meta, média do grupo), ambas nascendo da mesma borda esquerda. Resolve a comparação de dois valores com comprimento, que é a codificação mais precisa, sem pedir que o leitor calcule percentual. A microcharts traz a forma como `PairedBars` entre os microvisuais centrais, e o SpreadJS tem as primitivas `Hbar` e `Vbar` de célula que, repetidas, compõem o par.

**Anatomia.** Duas barras de 4 px a 6 px com vão de 2 px; atual em cor cheia, referência em `--muted-foreground` ou contorno; mesma escala e mesma origem; os dois números fora, o atual em peso maior.

**Abordagem na stack.** `html-tailwind`. Um `div` `flex flex-col gap-0.5` com duas trilhas, cada uma com um filho de largura percentual calculada contra o máximo da coluna (que inclui as duas séries). Em `recharts-nativo`, `BarChart layout="vertical"` com dois `Bar` também faz, mas é peso sem ganho.

**Ponto delicado.** Escala. O máximo da coluna precisa ser calculado sobre as duas barras de todas as linhas; se cada série normaliza pelo próprio máximo, a barra de referência de uma linha pode ficar maior que a atual mesmo quando o valor é menor. O segundo ponto: hierarquia. Duas barras da mesma cor e da mesma espessura obrigam o leitor a lembrar qual é qual; a de referência é sempre a mais apagada, e a ordem (atual em cima) é fixa em todo o Farol. O terceiro: mais de dois períodos transforma o par em sparkbar horizontal ilegível; o limite é dois.

**Versões sugeridas.**
- **V1 básica: leads do mês contra o mês anterior, por origem.** Barra cheia em cima, barra apagada embaixo.
- **V2 com anotação: referência como meta.** A barra de baixo é a meta; a de cima fica verde quando a ultrapassa e mantém a cor neutra quando não, sem vermelho, porque "abaixo da meta no dia 10" não é falha.
- **V3 densa do Farol: fechamentos por executivo, trimestre atual contra o mesmo trimestre do ano anterior.** Catorze linhas, escala comum às 28 barras; quem cresceu e quem encolheu salta pela troca de qual barra é maior.
- **V4 caso limite: sem referência.** Executivo contratado neste ano; só a barra de cima aparece, a de baixo vira texto "sem ano anterior" em 10 px.

**Referências.**
- Catálogo: [microcharts, PairedBars](https://microcharts.dev/docs/charts/paired-bars) (não abriu; link da navegação da biblioteca): observar o par de barras como componente de célula dedicado.
- Catálogo: [SpreadJS, Hbar sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkhbar) (não abriu): observar a barra horizontal de célula como primitiva que compõe o par.
- Praticante: [Datawrapper, your favorite chart type is more flexible than you think](https://blog.datawrapper.de/favorite-popular-chart-types/) (não abriu): observar a ideia de que uma barra comum, bem configurada, cobre comparações que costumam ser desenhadas com formas mais caras.
- Portal de design: [Dribbble, tag kpi design](https://dribbble.com/tags/kpi-design) (não abriu): observar o uso de barra fantasma para o período anterior em cards de comparação.

**Mora melhor em outra família?** Barras agrupadas com eixo são 02_barras-horizontais. Dois pontos na mesma linha, em vez de duas barras, é o micro dumbbell (24.18).

---

## 24.31 Micro slope

**Descrição.** Um segmento de reta ligando o valor do primeiro instante (à esquerda) ao do segundo (à direita), dentro de uma célula. É o slopegraph reduzido a uma linha de tabela: a inclinação mostra direção e intensidade da mudança sem precisar de rótulo. A Storytelling with Data trata o slopegraph como a forma de comparar dois pontos no tempo em que a linha que conecta os pontos mostra aumento ou queda e a taxa de mudança pela própria inclinação, "sem exigir explicação".

**Anatomia.** Caixa de 32 px a 48 px de largura e a altura da linha de texto; dois pontos de 3 px nas bordas; segmento de 1,5 px a 2 px; cor pela polaridade da mudança; valores do início e do fim opcionalmente escritos à esquerda e à direita da caixa.

**Abordagem na stack.** `svg-puro`: um `line` de `(0, y1)` a `(w, y2)` e dois `circle`, com `y` calculado sobre a escala comum da coluna. Três elementos, nenhuma biblioteca. Em `recharts-nativo` seria um `LineChart` de dois pontos, desproporcional.

**Ponto delicado.** Inclinação sem escala comum não significa nada. Se cada célula normaliza pelos próprios dois valores, toda mudança vira uma diagonal de canto a canto e 1 por cento parece igual a 80 por cento. A escala precisa ser comum à coluna. O segundo ponto: largura da caixa. A mesma variação desenhada em 24 px e em 48 px tem inclinações visuais diferentes; a largura é fixa no componente. O terceiro, que distingue o slope do dumbbell: o slope só faz sentido com **tempo** entre os dois pontos; para duas medidas simultâneas (CPL contra CPL qualificado), o dumbbell é a forma certa.

**Versões sugeridas.**
- **V1 básica: taxa de conversão por etapa, trimestre anterior para o atual.** Um segmento por etapa, verde subindo, vermelho descendo.
- **V2 com anotação: rótulos nas pontas.** "18 por cento" à esquerda e "24 por cento" à direita, com o segmento entre eles; o formato vira uma frase visual.
- **V3 densa do Farol: participação de cada origem no volume, 2025 para 2026.** Vinte linhas, escala comum; as origens que ganharam espaço formam diagonais ascendentes que se leem de relance ao percorrer a coluna.

**Referências.**
- Catálogo: [microcharts, Slope](https://microcharts.dev/docs/charts/slope) (não abriu; link da navegação da biblioteca): observar o slope como microvisual de célula distinto do dumbbell.
- Catálogo: [Financial Times, visual vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md): observar o slope na categoria de mudança ao longo do tempo, ao lado de linha e de colunas.
- Praticante: [Storytelling with Data, more on slopegraphs](https://www.storytellingwithdata.com/blog/2014/03/more-on-slopegraphs) (não abriu): observar o slopegraph para dois instantes e a inclinação como leitura que dispensa explicação.
- Praticante: [BetterEvaluation, slopegraph](https://www.betterevaluation.org/methods-approaches/methods/slopegraph) (não abriu): observar a descrição do método como comparação de dois pontos por categoria.
- Portal de design: [Dribbble, tag chart](https://dribbble.com/tags/chart) (não abriu): observar a raridade do slope em portais, frente à frequência com que aparece em jornalismo de dados.

**Mora melhor em outra família?** Slopegraph com todas as categorias num só gráfico é 17_comparacao-de-pontos ou 04_linhas. Mais de dois instantes é o sparkline de linha (24.1).

---

## 24.32 Faixa de status (tracker)

**Descrição.** Uma fileira de blocos verticais estreitos, um por período, cada um pintado pela **categoria de estado** daquele período: ok, degradado, fora, sem dado. É o padrão das páginas de disponibilidade de serviço, que o Tremor empacotou como `Tracker`, "Component for visualizing data related to monitoring", com cor e tooltip por bloco e uma cor padrão para blocos sem cor definida. Difere do win/loss (24.9), que tem dois estados e usa posição, e da faixa de calor (24.23), que codifica magnitude contínua; aqui são três a quatro estados nominais.

**Anatomia.** 30 a 90 blocos de largura igual, com vão de 1 px a 2 px e cantos levemente arredondados; altura de 20 px a 32 px; paleta de 3 a 4 estados com um deles reservado a "sem dado"; tooltip por bloco com data e estado; resumo textual ao lado ("27 de 30 dias dentro do SLA").

**Abordagem na stack.** `html-tailwind`. Um `div` `flex gap-px` com filhos `flex-1 h-6 rounded-sm` e a cor resolvida por um mapa `estado -> classe`. O Tremor mostra também o truque responsivo: esconder parte dos blocos por breakpoint para que 90 dias no desktop virem 30 no celular, sem recalcular nada. Tooltip, se houver, com o `Tooltip` do próprio design system e não com `title`, que não aparece em toque.

**Ponto delicado.** O estado "sem dado". O Tremor usa cinza como cor padrão de bloco sem cor, e em muitas implementações o cinza também significa "ok neutro"; o resultado é que o dia sem coleta parece dia tranquilo. "Sem dado" precisa de tratamento visual próprio (hachura ou contorno vazado), distinto de qualquer estado medido. O segundo ponto: número de estados. Com 5 ou mais cores o tracker vira mosaico e a pergunta "quantos dias ruins" deixa de ter resposta visual; agrupar em no máximo 4. O terceiro: daltonismo, porque verde, amarelo e vermelho são exatamente a tríade que falha; reforçar o estado ruim com altura menor ou com marca, não só com matiz.

**Versões sugeridas.**
- **V1 básica: 30 dias de SLA da fila de entrada.** Verde dentro, laranja fora, hachura sem coleta, resumo "27 de 30".
- **V2 com anotação: três estados e o pior dia marcado.** Dentro, perto do limite, fora; o dia com maior estouro recebe uma marca acima do bloco e o tooltip traz o tempo exato.
- **V3 densa do Farol: 8 integrações de fonte de dado, 90 dias.** Uma faixa por fonte (CRM, mídia paga por plataforma, analytics), estado da coleta diária: completa, parcial, falhou, sem agenda; é a tela que responde "posso confiar no painel de hoje".
- **V4 caso limite: celular.** A mesma tela a 400 px mostra só os últimos 30 blocos por fonte, com a nota "90 dias no desktop"; espremer 90 blocos em 360 px daria blocos de 3 px sem vão.

**Referências.**
- Catálogo: [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): observar a estrutura de dado com `color` e `tooltip` por bloco, o `defaultBackgroundColor` para bloco sem cor e o exemplo responsivo que esconde blocos por breakpoint.
- Praticante: [Stephen Few, Dashboard Design: Taking a Metaphor Too Far](https://www.perceptualedge.com/articles/dmreview/dashboard_design.pdf) (não abriu): observar, pelo título e pelo contexto da busca, a crítica ao uso literal de metáforas de painel e de semáforo.
- Portal de design: [Dribbble, uptime status board](https://dribbble.com/shots/2733357) (não abriu): observar a faixa de blocos diários como linguagem estabelecida de página de status.
- Portal de design: [Dribbble, tag uptime](https://dribbble.com/tags/uptime) (não abriu): observar a variação de altura e de vão entre blocos e o efeito na leitura de dias ruins.

**Mora melhor em outra família?** Estados em duas dimensões (fonte por dia como matriz) são 15_mapa-de-calor-e-calendario. Estados com duração variável, e não por período fixo, são 20_cronograma-e-linha-do-tempo.

---

## 24.33 Ponto de status

**Descrição.** Um único marcador ao lado de um nome ou de um número, dizendo em que estado aquela linha está segundo uma regra: no prazo, em atenção, atrasado, inativo. É o semáforo dos painéis corporativos, e o modelo mais criticado desta família. Stephen Few lembra que cerca de 10 por cento dos homens e 1 por cento das mulheres não distinguem vermelho de verde, justamente as cores que o semáforo usa para significados opostos. A microcharts responde com um desenho que resolve o problema na origem: cada estado combina uma silhueta distinta com uma cor semântica, "a filled circle for ok, a triangle for warn, a diamond for error, a hollow ring for off, a half-filled circle for busy", de modo que os estados continuam distintos em escala de cinza, na impressão e no modo de alto contraste.

**Anatomia.** Marcador de 8 px a 10 px; forma por estado (círculo cheio, triângulo, losango, anel vazado); cor semântica; rótulo textual curto ao lado ou, no mínimo, no `aria-label`; pulso opcional só para estado ao vivo, desligado em `prefers-reduced-motion`.

**Abordagem na stack.** `svg-puro` para as formas (um `symbol` por estado reutilizado por `use`), ou `html-tailwind` com ícones do lucide-react (`Circle`, `Triangle`, `Diamond`, `CircleDashed`) preenchidos pela cor do estado. A regra de corte que decide o estado é função pura com os limiares declarados, testável sem renderizar.

**Ponto delicado.** A regra. Ponto vermelho sem regra declarada é opinião com cor; o cabeçalho ou o tooltip precisa dizer "atrasado = mais de 30 dias sem movimento". O segundo ponto: estado sem nuance. O semáforo esconde se a linha acabou de cruzar o limite ou está lá há meses; quando isso importa, o ponto ganha um sparkline (24.1) ao lado ou é substituído pela faixa de status (24.32). O terceiro: excesso. Uma tabela em que 70 por cento das linhas estão vermelhas não comunica prioridade; Few recomenda cor para destacar o que precisa de atenção, e isso pressupõe que a maioria **não** precisa.

**Versões sugeridas.**
- **V1 básica: deals parados por executivo.** Círculo cheio para "movimentou nos últimos 30 dias", triângulo para "entre 30 e 60", losango para "mais de 60".
- **V2 com anotação: estado com duração.** O ponto recebe um número pequeno ao lado, "há 12 dias", respondendo se o problema é novo ou crônico.
- **V3 densa do Farol: handoff da pré-vendas para vendas, 40 oportunidades.** Um ponto por oportunidade para o estado do aceite pelo executivo: aceito, pendente dentro do prazo, pendente fora do prazo, recusado; a tabela ordena por estado e só as de losango ficam coloridas, as demais em cinza.
- **V4 caso limite: sem regra aplicável.** Oportunidade sem data de handoff registrada. Anel vazado com rótulo "sem data", nunca verde por omissão.

**Referências.**
- Catálogo: [microcharts, StatusDot](https://microcharts.dev/docs/charts/status-dot): observar o par silhueta e cor por estado, o pulso que some com movimento reduzido e o nome acessível "Status: ok".
- Praticante: [Stacey Barr, 3 problems with KPI traffic lights](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/) (não abriu; retornou 403): observar, pelo resumo da busca, a crítica ao semáforo como resumo de desempenho e a citação de Few sobre daltonismo.
- Praticante: [Stephen Few, Dashboard Design: Taking a Metaphor Too Far](https://www.perceptualedge.com/articles/dmreview/dashboard_design.pdf) (não abriu): observar a crítica à metáfora de semáforo e de painel de carro.
- Portal de design: [Dribbble, tag status](https://dribbble.com/tags/status) (não abriu): observar como quase todos os pontos de status dependem só de cor, que é o padrão a evitar.

**Mora melhor em outra família?** Status numa tabela inteira é 14_tabelas-visuais. O card de KPI com semáforo é 01_cards-e-kpis.

---

## 24.34 Grade de atividade micro

**Descrição.** Um calendário em miniatura: células de 6 px a 10 px arranjadas em semanas (colunas) e dias da semana (linhas), coloridas pela intensidade do dia. Popularizada pelos gráficos de contribuição de repositórios de código, a forma empacota um ano de medições diárias num retângulo compacto e revela ciclos de dia da semana que uma série linear esconde. O SpreadJS tem versões de célula para mês e para ano (month sparkline e year sparkline), e a microcharts oferece `ActivityGrid` e `CalendarStrip`. O guia de visualização de dados da União Europeia acrescenta que o calendário pode ganhar barras de agregação por semana e por dia da semana para facilitar a leitura de ciclos.

**Anatomia.** Grade de 7 linhas por N semanas (ano) ou de 5 a 6 linhas por 7 colunas (mês); vão de 1 px a 2 px; escala sequencial de 4 a 5 classes; células fora do período (dias antes do início do mês) vazias e sem contorno; dias sem dado com contorno vazado; rótulos mínimos de mês acima e de dia da semana à esquerda, só na versão de card.

**Abordagem na stack.** `html-tailwind` ou `svg-puro`. A grade é `grid grid-rows-7 grid-flow-col gap-px`, com as células geradas a partir de um array de datas já alinhado ao início da semana; o cálculo do deslocamento inicial (`getDay()` da primeira data, ajustado para a semana começar na segunda) é a parte que exige teste. SVG com `rect` para o ano completo, que passa de 360 células.

**Ponto delicado.** Início da semana e fuso. Grade que começa no domingo numa tela e na segunda em outra desalinha todas as leituras de dia útil; a convenção é fixa no componente (segunda-feira, que é a leitura operacional brasileira). Datas em UTC renderizadas em fuso local deslocam eventos de fim de noite para o dia seguinte, e o domingo vazio vira segunda cheia; a data precisa chegar ao componente já como data civil, sem hora. O segundo ponto: a grade enfatiza o dia da semana e apaga a sequência; se a pergunta é tendência, o sparkline (24.1) responde melhor com a mesma área.

**Versões sugeridas.**
- **V1 básica: agendas realizadas por dia no trimestre.** Grade de 13 semanas por 7 dias, 4 classes.
- **V2 com anotação: feriados marcados.** Dias sem expediente com contorno pontilhado, para que o vazio não seja lido como ociosidade.
- **V3 densa do Farol: um mês por SDR, 6 grades lado a lado.** Grade mensal de atividades registradas no CRM por SDR, escala comum; revela quem concentra o trabalho no começo da semana e quem registra tudo na sexta.
- **V4 caso limite: dado ausente contra zero.** Um SDR de férias duas semanas: células de férias com contorno vazado e rótulo no tooltip; pintá-las na classe zero faria as férias parecerem improdutividade.

**Referências.**
- Catálogo: [SpreadJS, lista de tipos de sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain): observar as month e year sparklines como calendários de célula.
- Catálogo: [microcharts, CalendarStrip](https://microcharts.dev/docs/charts/calendar-strip) (não abriu; link da navegação da biblioteca): observar o calendário em faixa, alternativa de uma linha só à grade de 7 linhas.
- Praticante: [Guia de visualização de dados da União Europeia, calendar heatmap](https://data.europa.eu/apps/data-visualisation-guide/calendar-heatmap) (não abriu): observar a recomendação de barras de agregação por semana e por dia da semana para ler ciclos.
- Portal de design: [Dribbble, calendar heatmap](https://dribbble.com/shots/3532285-Calendar-heatmap) (não abriu): observar o tamanho de célula e o vão que mantêm a grade legível em tema escuro.

**Mora melhor em outra família?** Calendário em tamanho de leitura, com rótulos e legenda, é 15_mapa-de-calor-e-calendario.

---

## 24.35 Histograma micro

**Descrição.** Colunas contíguas de frequência por classe de valor, dentro de uma célula. O SpreadJS define a histogram sparkline como resumo da "source-value frequency across compact distribution bins", com modo discreto (um bin por valor existente) e contínuo (intervalos). Onde o boxplot micro (24.17) resume em cinco números, o histograma mostra a **forma**: bimodalidade, cauda longa, parede em zero. É a leitura que distingue "todos os leads demoram 2 horas" de "metade é respondida em 5 minutos e metade em um dia".

**Anatomia.** 8 a 20 colunas contíguas, sem vão ou com 1 px; base no zero; altura proporcional à contagem, ou à fração quando as linhas têm tamanhos de amostra muito diferentes; opcionalmente um traço vertical na mediana ou no limite de SLA.

**Abordagem na stack.** `recharts-nativo` para poucas células: os bins são calculados em TypeScript e passados a um `BarChart` com `barCategoryGap={0}`, sem eixos. Para tabela, `svg-puro` com `rect`. Em ambos, o cálculo do bin fica fora do componente, porque é ele que precisa ser igual em todas as linhas.

**Ponto delicado.** **Bins comuns.** Se cada linha calcula seus próprios intervalos, a mesma coluna representa "0 a 10 minutos" numa linha e "0 a 3 horas" na outra, e a comparação morre sem aviso. Os limites de classe são calculados uma vez sobre a coluna inteira (ou fixados pelo negócio: 0 a 5 min, 5 a 15, 15 a 60, 1 a 4 h, mais de 4 h). O segundo ponto: contagem contra fração. Uma fila com 900 leads e outra com 40 desenhadas em contagem absoluta fazem a segunda parecer vazia; para comparar forma, normalizar por fração e declarar. O terceiro: amostra pequena. Abaixo de cerca de 30 observações, a forma do histograma é artefato do bin; trocar para o strip plot (24.16).

**Versões sugeridas.**
- **V1 básica: tempo de primeira resposta da fila de entrada.** Bins fixos pelo SLA, colunas em fração.
- **V2 com anotação: limite de SLA.** Traço vertical no bin do limite e as colunas à direita em cor de alerta, com o percentual fora do SLA escrito ao lado.
- **V3 densa do Farol: ticket dos deals ganhos, uma célula por produto fictício.** Bins comuns em escala logarítmica de valor declarada no cabeçalho; revela o produto bimodal, com uma massa de tickets pequenos e outra de grandes, que a média trataria como um só perfil.
- **V4 caso limite: amostra pequena.** Produto com 11 deals: o componente recusa o histograma e mostra o strip plot com o chip "n=11".

**Referências.**
- Catálogo: [SpreadJS, histogram sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/histogram-sparkline) (não abriu): observar os modos discreto e contínuo e os elementos de bin, barra, borda e rótulo.
- Catálogo: [microcharts, HistogramStrip](https://microcharts.dev/docs/charts/histogram-strip) (não abriu; link da navegação da biblioteca): observar o histograma como faixa de célula.
- Praticante: [Atlassian, a complete guide to box plots](https://www.atlassian.com/data/charts/box-plot-complete-guide) (não abriu): observar, pelo resumo da busca, que o boxplot localiza melhor os percentis e o histograma mostra melhor a forma, que é o critério de escolha entre 24.17 e 24.35.
- Praticante: [From Data to Viz](https://www.data-to-viz.com/) (não abriu): observar a árvore de decisão que separa histograma, densidade, boxplot e violino pelo número de grupos e de observações.
- Portal de design: [Dribbble, tag statistics histogram](https://dribbble.com/tags/statistics_histogram) (não abriu): observar a raridade do histograma em tamanho reduzido nos portais.

**Mora melhor em outra família?** Histograma com eixo e comparação de grupos é 16_distribuicao.

---

## 24.36 Cascata micro

**Descrição.** A ponte de um total a outro, reduzida a uma célula: uma coluna de partida, colunas flutuantes para cada acréscimo e decréscimo e uma coluna de chegada. O SpreadJS tem a cascade sparkline, "generally used to analyze a value over time like yearly sales, total profit, net tax", com cores separadas para positivo, negativo e total e um marcador de tipo por item (`+`, `-` ou `=`) que diz quais colunas são totais. No micro, o modelo responde "o que explica a diferença entre o mês passado e este" sem abrir um gráfico inteiro.

**Anatomia.** 4 a 8 colunas estreitas; partida e chegada ancoradas no zero em cor neutra; passos flutuantes começando onde o anterior terminou, verde para acréscimo e laranja para decréscimo; conectores horizontais de 1 px opcionais entre topos; sem rótulos internos, com a lista de passos no tooltip ou no cabeçalho.

**Abordagem na stack.** `recharts-custom`. `BarChart` com duas `Bar` de mesmo `stackId`: a primeira invisível (`fill="transparent"`) com a base acumulada e a segunda com a magnitude do passo e `Cell` por sinal. O acumulado é pré-calculado em TypeScript. Em `svg-puro` a geometria é igualmente curta (um `rect` por passo com `y` no mínimo entre início e fim) e é a escolha para tabela.

**Ponto delicado.** Distinguir total de variação. Coluna de total desenhada flutuando, ou passo desenhado ancorado no zero, quebra a leitura da ponte inteira; o tipo de cada item é dado de entrada, não inferência. O segundo ponto: passo que cruza o zero. Um decréscimo que leva o acumulado abaixo de zero precisa de base zero visível no meio da caixa, e o domínio vertical é calculado sobre o mínimo e o máximo do **acumulado**, não dos passos. O terceiro: número de passos. Acima de 8, os passos pequenos viram fiapos; agregar em "demais" antes do componente.

**Versões sugeridas.**
- **V1 básica: receita reconhecida, mês anterior para o atual.** Partida, novos contratos, expansão, cancelamentos, chegada.
- **V2 com destaque: maior passo negativo marcado.** O decréscimo dominante em laranja cheio e os outros em tom apagado, respondendo "o que mais pesou".
- **V3 densa do Farol: tabela de 10 executivos, carteira do trimestre anterior para o atual.** Uma cascata por linha com os mesmos quatro passos em ordem fixa, escala comum; quem cresceu por conta nova e quem cresceu só por reajuste fica visível na altura do segundo passo.
- **V4 caso limite: acumulado negativo.** Saldo de pipeline que termina abaixo de zero: linha de base no meio da caixa, chegada desenhada para baixo e rótulo "saldo negativo" fora da célula.

**Referências.**
- Catálogo: [SpreadJS, cascade sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkcascade): observar `colorPositive`, `colorNegative`, `colorTotal`, o `itemTypeRange` com `+`, `-` e `=` e o exemplo de demonstrativo de resultado com totais intermediários.
- Catálogo: [microcharts, Waterfall](https://microcharts.dev/docs/charts/waterfall) (não abriu; link da navegação da biblioteca): observar a cascata entre os microvisuais centrais.
- Praticante: [Financial Times, visual vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md): observar a separação entre desvio, parte do todo e fluxo, que ajuda a decidir se a ponte é de variação ou de composição.
- Portal de design: [Dribbble, waterfall chart por Shashank Sahay](https://dribbble.com/shots/4936758-Waterfall-Chart) (não abriu): observar, pelo resumo da busca, a regra de desenhar as barras de variação visualmente diferentes das barras de total.
- Portal de design: [Dribbble, waterfall chart por Michal Daniel](https://dribbble.com/shots/3699945-Waterfall-chart) (não abriu): observar o rótulo direto, que no micro vira tooltip.

**Mora melhor em outra família?** Cascata com eixo e rótulos é 19_cascata-waterfall, onde este modelo mora quase sempre; o micro é para ponte repetida por linha.

---

## 24.37 Funil micro

**Descrição.** As etapas de um funil como colunas decrescentes lado a lado, dentro de uma célula ou de um card, cada uma ancorada no zero. A microcharts toma uma decisão de desenho que vale adotar integralmente: "one stepped rectangle per stage", todas a partir do zero, "so the drop between neighbors is the read", evitando de propósito a silhueta afunilada clássica, que interpola dado inexistente entre as etapas. Também avisa o que fazer quando uma etapa é maior que a anterior (reengajamento): desenhar no tamanho real e registrar a inversão no resumo.

**Anatomia.** 3 a 6 colunas de largura igual, com vão de 2 px; alturas proporcionais ao volume de cada etapa; primeira etapa em tom mais escuro ou todas no mesmo tom; conversão entre etapas em texto de 10 px acima de cada coluna, em percentual; volume da última etapa escrito ao lado.

**Abordagem na stack.** `recharts-nativo` para card: `BarChart` com um `Bar`, `barCategoryGap` pequeno e `LabelList` com a conversão calculada em TypeScript. `html-tailwind` para tabela: `flex items-end gap-0.5` com alturas percentuais. A forma de trapézio exigiria `svg-puro` e é justamente a que não se deve desenhar.

**Ponto delicado.** A conversão exibida. Existem duas e são números diferentes: conversão **da etapa anterior** (agendas sobre entradas) e conversão **do topo** (agendas sobre o total que entrou). Rótulo sem dizer qual é ambiguidade garantida; o Farol fixa a da etapa anterior na célula e a do topo no tooltip. O segundo ponto: altura legível. A última etapa costuma ter 1 a 3 por cento do topo e vira coluna de 1 px; a altura mínima visual não pode ser aplicada sem aviso, porque mente sobre a proporção, então a coluna pequena ganha o número escrito em cima. O terceiro: etapas que não são subconjunto. Se "reunião" pode acontecer sem passar por "qualificado", o funil está desenhando uma hierarquia falsa; nesses casos o modelo certo é a barra de composição (24.13) ou o fluxo (11).

**Versões sugeridas.**
- **V1 básica: funil da pré-vendas no mês.** Entradas, contatadas, qualificadas, agendadas, com a conversão entre cada par.
- **V2 com destaque: a etapa com pior conversão.** A coluna seguinte à maior queda em cor de alerta e o percentual em negrito.
- **V3 densa do Farol: tabela de 12 origens de lead, funil de 4 etapas por linha.** Escala por linha (a pergunta é a forma, não o volume), com o volume do topo escrito na primeira coluna da tabela; as origens com muito volume e funil achatado no fim ficam visíveis ao lado das de pouco volume e funil cheio.
- **V4 caso limite: etapa maior que a anterior.** Reengajamento de leads antigos faz "qualificadas" superar "contatadas" no mês; a coluna é desenhada no tamanho real, a conversão aparece como "mais de 100 por cento" e o `aria-label` explica a inversão.

**Referências.**
- Catálogo: [microcharts, Funnel](https://microcharts.dev/docs/charts/funnel): observar os retângulos em degrau ancorados no zero, a recusa da silhueta afunilada, os rótulos em percentual ou valor e o tratamento da etapa maior que a anterior.
- Catálogo: [Wikipedia, funnel chart](https://en.wikipedia.org/wiki/Funnel_chart) (não abriu): observar a forma clássica de trapézios, que é o ponto de partida do que o micro abandona.
- Praticante: [microcharts, when to use](https://microcharts.dev/docs/when-to-use): observar a regra de usar o microvisual quando o gráfico mora dentro de algo que já se está lendo, com o funil completo numa página de análise vinculada.
- Portal de design: [Dribbble, tag funnel chart](https://dribbble.com/tags/funnel-chart) (não abriu): observar a predominância de trapézios decorativos, que é o padrão a evitar no micro.

**Mora melhor em outra família?** Funil em tamanho de leitura, com rótulos e perdas por etapa, é 10_funil; funil em que as etapas se ramificam é 11_fluxo-sankey.

---

## 24.38 Barra divergente empilhada mini

**Descrição.** Uma barra única por linha para uma escala ordinal com polos (muito ruim, ruim, neutro, bom, muito bom), alinhada por um eixo central: as categorias negativas crescem para a esquerda, as positivas para a direita. É a forma consagrada para escala Likert, e a microcharts tem uma versão de célula, a `LikertStrip`. Mas o modelo tem uma crítica séria que precisa entrar no catálogo junto com ele: o Datawrapper argumenta que a barra divergente torna "really hard to compare the length of the bars to either side of the middle line", desperdiça largura e, quando divide o neutro ao meio, sugere que metade dos neutros seria positiva, o que chama de perigoso. A recomendação deles é a barra empilhada 100 por cento com rótulo direto, reservando a divergente para quando a **forma geral** importa mais que a comparação precisa.

**Anatomia.** Linha central de 1 px; segmentos negativos à esquerda em rampa de uma matiz, positivos à direita em rampa de outra; neutro em cinza, ou dividido no centro, ou separado fora da barra; percentual agregado de cada lado escrito nas pontas ("22 por cento" à esquerda, "61 por cento" à direita).

**Abordagem na stack.** `html-tailwind`. Um contêiner de largura total com um `div` à esquerda do centro (`justify-end`) contendo os segmentos negativos na ordem do mais forte para a borda, e outro à direita com os positivos. As larguras são percentuais sobre metade da célula, calculadas contra o **maior lado** da coluna inteira, para que a linha central fique no mesmo lugar em todas as linhas.

**Ponto delicado.** O neutro. As três soluções têm custo: dividir ao meio (visualmente simétrico, semanticamente enganoso), empilhar só de um lado (desloca o centro) ou separar numa coluna própria (a mais honesta, e a que o Farol adota). O segundo ponto: o centro precisa ficar alinhado entre linhas; se cada linha centraliza a própria barra, a comparação lado a lado some. O terceiro: a própria escolha do modelo. Se a pergunta é "qual linha tem mais positivo", a barra 100 por cento alinhada à esquerda responde melhor; a divergente só vale quando a leitura é o equilíbrio entre os polos.

**Versões sugeridas.**
- **V1 básica: nota de qualidade dos leads recebidos pelo executivo no handoff, escala de 5 pontos.** Negativos à esquerda, positivos à direita, neutro em coluna separada.
- **V2 com anotação: saldo líquido.** Ao lado da barra, o saldo "positivo menos negativo" em pontos percentuais, para ordenação.
- **V3 densa do Farol: 12 origens de lead, avaliação de qualidade pelo time de vendas.** Uma barra por origem, centro alinhado, neutro separado; a origem de mídia paga com saldo negativo aparece como a única barra que pende para a esquerda.
- **V4 caso limite: neutro dominante.** Origem com 70 por cento de neutros; a barra divergente fica curtíssima e parece "sem opinião forte". A coluna separada de neutro, larga, é o que conta a história real: o time não sabe avaliar aquele lead.

**Referências.**
- Catálogo: [microcharts, LikertStrip](https://microcharts.dev/docs/charts/likert-strip) (não abriu; link da navegação da biblioteca): observar a escala Likert como microvisual de célula.
- Catálogo: [Data Viz Catalogue, chart snapshot diverging bar charts](https://datavizcatalogue.com/blog/chart-snapshot-diverging-bar-charts/) (não abriu): observar as variantes de barra divergente simples e empilhada.
- Praticante: [Datawrapper, the case against diverging stacked bars](https://www.datawrapper.de/blog/divergingbars): observar a dificuldade de comparar segmentos dos dois lados, o perigo de dividir o neutro e a recomendação da barra 100 por cento com rótulo direto.
- Praticante: [Data Revelations, rethinking the divergent stacked bar chart](https://www.datarevelations.com/rethinkingdivergent/) (não abriu): observar a proposta de colocar as opiniões mais fortes no centro e o neutro por fora.
- Portal de design: [Dribbble, tag likert scale](https://dribbble.com/tags/likert_scale) (não abriu): observar como a maioria dos desenhos divide o neutro ao meio, que é a escolha a evitar.

**Mora melhor em outra família?** Divergente empilhada com eixo e rótulos por categoria é 02_barras-horizontais. Composição sem polos é a barra de composição mini (24.13).

---

## 24.39 Ranking micro (bump strip)

**Descrição.** A posição de um item no ranking ao longo do tempo, desenhada como uma linha curta dentro da célula, com o eixo vertical em **ordem de posição** e não em valor. A FlowingData resume a vantagem do bump chart: ele não é afetado por grandes diferenças de magnitude, porque espaça as posições igualmente, enquanto um gráfico de linha comum amontoa as categorias pequenas no fundo. A microcharts tem a versão de célula, `BumpStrip`. No micro, cada linha da tabela mostra só a trajetória do próprio item, com o total de posições implícito na altura.

**Anatomia.** Caixa de 60 px a 100 px por 20 px a 28 px; eixo vertical invertido, com a posição 1 no **topo**; traço em degraus ou em linha reta entre períodos; ponto no período atual; posição atual escrita ao lado ("3o", com a variação "subiu 2").

**Abordagem na stack.** `recharts-nativo`. `LineChart` com `YAxis hide reversed domain={[1, totalPosicoes]}`, `Line type="linear"` ou `"stepAfter"` e `dot` só no último ponto. O `reversed` é o detalhe que decide se o modelo funciona. Em `svg-puro`, `y = (posicao - 1) / (total - 1) * altura`, já com o topo sendo a melhor posição.

**Ponto delicado.** Inversão do eixo. Posição 1 embaixo faz subir no ranking parecer queda, e o erro passa despercebido porque a linha "parece normal". O segundo ponto: empates e universo que muda. Se o número de itens ranqueados muda entre períodos (uma origem nova entra), a posição 5 de 10 e a posição 5 de 20 não são a mesma coisa; fixar o universo ou normalizar para percentil. O terceiro: o bump apaga a magnitude de propósito. Um item pode ser primeiro com 51 por cento ou com 12 por cento; quando isso importa, a coluna vizinha mostra o valor.

**Versões sugeridas.**
- **V1 básica: posição de cada executivo no ranking de receita, 6 meses.** Linha com o topo como primeiro lugar, posição atual escrita.
- **V2 com anotação: entrada e saída do top 3.** Uma faixa sutil no terço superior da caixa marca o top 3; os meses dentro da faixa ficam em cor cheia.
- **V3 densa do Farol: 20 criativos de mídia paga, posição semanal por CPL qualificado.** Uma célula por criativo, 12 semanas, eixo invertido e universo fixo; revela a fadiga como descida lenta e constante, que a tabela de valor absoluto não mostra.
- **V4 caso limite: item que saiu do ranking.** Criativo pausado por 3 semanas: o traço interrompe (sem posição, não última posição) e retoma quando volta a veicular.

**Referências.**
- Catálogo: [microcharts, BumpStrip](https://microcharts.dev/docs/charts/bump-strip) (não abriu; link da navegação da biblioteca): observar o ranking como faixa de célula.
- Catálogo: [Data Viz Catalogue, chart snapshot bump charts](https://datavizcatalogue.com/blog/chart-snapshot-bump-charts/) (não abriu): observar a definição do bump chart como variante do gráfico de linha centrada em posição.
- Praticante: [FlowingData, how to make a bump chart](https://flowingdata.com/2019/11/18/r-ggplot-bump-chart/) (não abriu): observar a necessidade de calcular a posição antes e de ajustar a escala vertical para posições.
- Praticante: [Datawrapper Academy, how to create a bump chart](https://academy.datawrapper.de/article/347-how-to-create-a-bump-chart) (não abriu): observar o formato longo de dado com data, posição e categoria.
- Portal de design: [Dribbble, tag ranking](https://dribbble.com/tags/ranking) (não abriu): observar como ranking em portais é quase sempre lista estática, sem trajetória.

**Mora melhor em outra família?** Bump chart com todas as categorias num só gráfico é 04_linhas. Posição num instante só é 02_barras-horizontais ordenadas.

---

## 24.40 Curva de concentração micro

**Descrição.** Os itens ordenados do maior para o menor, com a participação acumulada desenhada como curva ou como barra segmentada, para responder "quanto do total vem de poucos". É o Pareto reduzido a uma célula. O SpreadJS tem a pareto sparkline, que ordena os segmentos por valor, desenha até duas linhas de alvo (por exemplo 0,5 e 0,8), destaca em vermelho o segmento de uma posição escolhida e rotula cada segmento com o percentual acumulado ou individual. No Farol a pergunta é recorrente: concentração de receita em poucas contas, de leads em poucas campanhas, de perdas em poucos motivos.

**Anatomia.** Duas formas. **Barra acumulada:** barra horizontal única com os itens em ordem decrescente, segmentos contíguos, e um traço vertical em 80 por cento do total; o número de segmentos à esquerda do traço é a leitura. **Curva:** polilinha côncava do canto inferior esquerdo ao superior direito, com o eixo horizontal em fração de itens e o vertical em fração do total, e uma diagonal cinza de referência (distribuição igual).

**Abordagem na stack.** `html-tailwind` para a barra acumulada (mesmo `flex` do 24.13, com os segmentos ordenados e um `div` de 1 px na posição de 80 por cento). `svg-puro` para a curva, com os pontos acumulados calculados em TypeScript e a diagonal como `line`. Em `recharts-nativo`, a curva cabe num `LineChart` com `ReferenceLine` de segmento, mas a versão SVG é mais curta.

**Ponto delicado.** Ordenação e universo. A curva só significa algo com os itens em ordem decrescente e com o universo inteiro, incluindo a cauda; cortar os itens pequenos antes de calcular faz a concentração parecer menor do que é. O segundo ponto: poucos itens. Com 5 itens, "o primeiro responde por 40 por cento" é quase inevitável e não é concentração; abaixo de cerca de 10 itens, a leitura honesta é a barra de composição simples. O terceiro: comparação entre linhas com universos de tamanhos diferentes exige o eixo horizontal em fração de itens, não em contagem.

**Versões sugeridas.**
- **V1 básica: concentração de receita por conta no trimestre.** Barra acumulada com traço em 80 por cento, "11 de 140 contas" escrito ao lado.
- **V2 com destaque: primeira posição destacada.** A maior conta em cor de alerta, como faz o `highlightPosition` do SpreadJS, respondendo "quanto depende de um cliente só".
- **V3 densa do Farol: tabela de executivos com a curva de concentração da carteira.** Uma curva por executivo, eixo em fração de contas; carteiras com curva quase vertical no início são as de risco.
- **V4 caso limite: carteira pequena.** Executivo com 6 contas: o componente recusa a curva e mostra a barra de composição com as 6 contas nomeadas.

**Referências.**
- Catálogo: [SpreadJS, pareto sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkpareto): observar as duas linhas de alvo, o destaque por posição e a escolha entre rótulo acumulado e individual.
- Catálogo: [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart) (não abriu): observar a combinação de barras decrescentes com a linha do total acumulado.
- Praticante: [ASQ, what is a Pareto chart](https://asq.org/quality-resources/pareto) (não abriu): observar o uso em qualidade para priorizar os poucos fatores que explicam a maior parte do efeito.
- Portal de design: [Dribbble, tag charting](https://dribbble.com/tags/charting) (não abriu): observar a ausência de curvas de concentração em portais, apesar de serem leitura central de risco comercial.

**Mora melhor em outra família?** Pareto com barras e eixo é 08_combinados-e-eixo-duplo. Concentração por hierarquia de contas é 12_hierarquia.

---

## 24.41 Linha do tempo de eventos micro

**Descrição.** Uma régua horizontal de tempo, dentro de uma célula ou abaixo de um sparkline, com marcas nos instantes em que algo aconteceu: campanha lançada, meta revista, SDR contratado, coleta interrompida, mudança de regra. O Data Viz Catalogue define a linha do tempo como forma gráfica de mostrar uma lista de eventos em ordem cronológica; a microcharts tem a versão de célula, `EventTimeline`. No Farol, o valor do modelo é explicar o sparkline vizinho: o degrau da cobertura (24.22) ou o pico de entradas só se entende com o evento que o causou marcado no mesmo eixo.

**Anatomia.** Linha de base de 1 px com a mesma extensão e o mesmo domínio do sparkline acima; marcas verticais de 6 px a 10 px ou pontos por evento; forma ou cor por tipo de evento (no máximo 3 tipos); rótulo do evento só no tooltip; marca do "hoje" na borda direita.

**Abordagem na stack.** `svg-puro`, com a escala de tempo compartilhada com o sparkline por uma função `x(data)` única passada aos dois componentes. Quando a régua fica sob um gráfico Recharts, a alternativa é `ReferenceLine x={data}` dentro do próprio gráfico, mas isso mistura evento e dado no mesmo desenho; a régua separada mantém o sparkline limpo.

**Ponto delicado.** Eventos próximos. Dois eventos na mesma semana, numa régua de 12 meses em 120 px, ficam a menos de 3 px um do outro e viram uma marca só; agrupar eventos que caem no mesmo pixel numa marca com contador ("2") e abrir a lista no tooltip. O segundo ponto: alinhamento com o sparkline. Se a régua usa domínio diferente (primeiro evento ao último evento, em vez do mesmo período do sparkline), as marcas não caem sob os pontos que explicam, e a correlação sugerida vira falsa. O terceiro: evento não é causa. A régua mostra coincidência temporal; o `aria-label` e o tooltip descrevem o evento sem afirmar efeito.

**Versões sugeridas.**
- **V1 básica: eventos de mídia sob o sparkline de leads.** Marcas nas datas de início e fim de campanha, tooltip com o nome genérico da campanha.
- **V2 com anotação: tipos de evento.** Triângulo para mudança de coleta, círculo para campanha, losango para mudança de regra de negócio, sob o sparkline de CPL qualificado.
- **V3 densa do Farol: tabela de 8 fontes de dado com régua de incidentes.** Uma régua por fonte, 90 dias, marcas nos incidentes de coleta, alinhada à faixa de status (24.32) da mesma linha.
- **V4 caso limite: eventos amontoados.** Semana de recesso com 5 eventos: uma única marca com o contador "5" e a lista completa no tooltip.

**Referências.**
- Catálogo: [Data Viz Catalogue, timeline](https://datavizcatalogue.com/methods/timeline.html) (não abriu): observar a definição de linha do tempo como lista de eventos em ordem cronológica.
- Catálogo: [microcharts, EventTimeline](https://microcharts.dev/docs/charts/event-timeline) (não abriu; link da navegação da biblioteca): observar a linha do tempo de eventos como microvisual de célula.
- Praticante: [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/): observar o cuidado com contexto temporal e com a confiança do usuário em painéis que mudam enquanto são lidos.
- Portal de design: [Dribbble, tag event timeline](https://dribbble.com/tags/event_timeline) (não abriu): observar os marcadores por tipo de evento e o agrupamento de eventos próximos.

**Mora melhor em outra família?** Linha do tempo com rótulos, durações e trilhas é 20_cronograma-e-linha-do-tempo.

---

## Variações vistas nas fontes que foram fundidas ou descartadas

Os dois catálogos mais completos de microvisuais consultados, a lista de 24 tipos do SpreadJS e a navegação de cerca de 34 componentes centrais da microcharts, foram cruzados com os 41 modelos acima. O que não virou modelo próprio:

| Variação na fonte | Destino | Motivo |
|---|---|---|
| Pie sparkline (SpreadJS) | Fundida em 24.25 | Mesma geometria do anel; o estudo desaconselha a pizza micro |
| MicroDonut, ProgressRing (microcharts) | Fundidas em 24.25 | Variantes de anel de valor único e de composição |
| PictogramRow, IconArray (microcharts) | Fundidas em 24.24 | Mesma lógica de unidade contável |
| RugStrip, Seismogram (microcharts); Spread sparkline (SpreadJS) | Fundidas em 24.16 | Estilos de desenho da observação individual |
| MiniBar (microcharts); Hbar e Vbar (SpreadJS) | Fundidas em 24.12 e 24.30 | Primitivas de barra de célula |
| SegmentedBar (microcharts); Stacked sparkline (SpreadJS) | Fundidas em 24.13 | Barra de composição |
| DualSparkline (microcharts) | Fundida em 24.5 | Série de comparação |
| StackedArea, Horizon (microcharts) | Já em 24.11 e 24.10 | Sem diferença de desenho |
| Ohlc (microcharts); RangeBlock (SpreadJS) | Fundidas em 24.27 | Faixa por período |
| Lollipop variance, Vari (SpreadJS); DeltaBar (Tremor) | Fundidas em 24.28 | Desvio único em célula |
| MarkerBar (Tremor); DotPlot (microcharts) | Fundidas em 24.29 | Posição em trilho |
| CategoryBar (Tremor) | Citada em 24.14, 24.15 e 24.22 | Ingrediente de bullet, teto e cobertura |
| HeatCell (microcharts) | Remetida a 14_tabelas-visuais | Célula de tabela colorida, não microvisual próprio |
| Month e Year sparkline (SpreadJS); ActivityGrid, CalendarStrip (microcharts) | Fundidas em 24.34 | Calendário micro |
| Gauge KPI e Progress sparkline (SpreadJS) | Remetidas a 13_progresso-meta-e-gauge | Gauge de ponteiro falha no tamanho de palavra, segundo a microcharts |
| Image sparkline e Custom sparkline (SpreadJS) | Descartadas | Não são forma de visualização, são mecanismo de extensão |
| Coleções Decision, Expressive e Frontier (microcharts) | Não inventariadas | A página aberta só listou a coleção central; fica como lacuna |

---

## Fontes consultadas

**Nota de método (2026-09-14).** Esta sessão retomou o arquivo a partir do modelo 24.15; os modelos 24.1 a 24.14 vieram da versão anterior do estudo e foram mantidos, com três links de portal trocados por versões que apareceram literalmente nas buscas desta sessão. A sessão esgotou a cota de busca web e usou 24 das 25 aberturas de página permitidas. Nas seções, "(não abriu)" marca link que apareceu num resultado de busca sem ser aberto, e "link da navegação da biblioteca" marca endereço lido na navegação de uma página aberta da microcharts.

**Abertas nesta sessão (conteúdo lido).**
- SpreadJS: [lista de tipos de sparkline](https://developer.mescius.com/spreadjs/docs/features/sparkmain); [cascade](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkcascade); [spread](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkspread); [box plot](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkboxplot); [pareto](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkpareto); [vari](https://developer.mescius.com/spreadjs/docs/v18/features/sparkmain/sparkvari).
- microcharts: [composition](https://microcharts.dev/docs/composition); [when to use](https://microcharts.dev/docs/when-to-use); [Sparkline](https://microcharts.dev/docs/charts/sparkline); [IconArray](https://microcharts.dev/docs/charts/icon-array); [Delta](https://microcharts.dev/docs/charts/delta); [TrendArrow](https://microcharts.dev/docs/charts/trend-arrow); [StatusDot](https://microcharts.dev/docs/charts/status-dot); [Funnel](https://microcharts.dev/docs/charts/funnel); [MicroDonut](https://microcharts.dev/docs/charts/micro-donut).
- Tremor: [Tracker](https://www.tremor.so/docs/visualizations/tracker); [data bars](https://npm.tremor.so/docs/visualizations/data-bars); [badges](https://npm.tremor.so/docs/ui/badges).
- Datawrapper: [heatmaps for tables](https://www.datawrapper.de/blog/heatmaps-for-tables); [the case against diverging stacked bars](https://www.datawrapper.de/blog/divergingbars); [how to create an arrow plot](https://www.datawrapper.de/academy/how-to-create-an-arrow-plot).
- Praticantes: [Simplex, Tufte in Excel: the box plot](https://simplexct.com/tufte-in-excel-the-box-plot).
- Abertas sem conteúdo aproveitável: [Stephen Few, Rich Data, Poor Data](https://www.perceptualedge.com/articles/Whitepapers/Rich_Data_Poor_Data.pdf) (PDF devolvido como binário ilegível); [Stacey Barr, 3 problems with KPI traffic lights](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/) (HTTP 403).

**Vistas em resultado de busca nesta sessão, não abertas.**
- Catálogos e bibliotecas: [Data Viz Project, waffle](https://datavizproject.com/data-type/percentage-grid/); [Data Viz Catalogue, box plot](https://datavizcatalogue.com/methods/box_plot.html); [Data Viz Catalogue, timeline](https://datavizcatalogue.com/methods/timeline.html); [Data Viz Catalogue, bump charts](https://datavizcatalogue.com/blog/chart-snapshot-bump-charts/); [Data Viz Catalogue, diverging bar charts](https://datavizcatalogue.com/blog/chart-snapshot-diverging-bar-charts/); [From Data to Viz](https://www.data-to-viz.com/); [Observable Plot, tick](https://observablehq.com/plot/marks/tick); [Recharts, Line API](https://recharts.github.io/en-US/api/Line/); [Recharts, RadialBarChart API](https://recharts.github.io/en-US/api/RadialBarChart/); [shadcn/ui, radial charts](https://ui.shadcn.com/charts/radial); [shadcn.io, step line](https://www.shadcn.io/examples/a-line-chart-with-step); [Tremor, progress circle](https://www.tremor.so/docs/visualizations/progress-circle); [SpreadJS, histogram](https://developer.mescius.com/spreadjs/docs/features/sparkmain/histogram-sparkline); [SpreadJS, Hbar](https://developer.mescius.com/spreadjs/docs/features/sparkmain/sparkhbar); [Spread WinForms, scatter sparkline](https://developer.mescius.com/spreadnet/docs/latest/online-win/scatter-sparkline.html); [Displayr, sparkline box](https://displayrdocs.zendesk.com/hc/en-us/articles/8012701338255-Visualization-Distributions-Sparkline-Box); [DQOps, data quality dashboards](https://dqops.com/docs/dqo-concepts/types-of-data-quality-dashboards/); [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart); [Wikipedia, funnel chart](https://en.wikipedia.org/wiki/Funnel_chart); [Wikipedia, scatter plot](https://en.wikipedia.org/wiki/Scatter_plot).
- Praticantes: [Datawrapper Academy, dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot), [customizing dot plot](https://www.datawrapper.de/academy/customizing-your-dot-plot), [range plot](https://www.datawrapper.de/academy/how-to-create-a-range-plot), [customizing range plot](https://www.datawrapper.de/academy/customizing-your-range-plot), [heatmap](https://academy.datawrapper.de/article/308-how-to-create-a-heatmap), [bump chart](https://academy.datawrapper.de/article/347-how-to-create-a-bump-chart); [Datawrapper blog, chart types more flexible](https://blog.datawrapper.de/favorite-popular-chart-types/); [Storytelling with Data, more on slopegraphs](https://www.storytellingwithdata.com/blog/2014/03/more-on-slopegraphs); [FlowingData, bump chart](https://flowingdata.com/2019/11/18/r-ggplot-bump-chart/); [Stephen Few, Dashboard Design: Taking a Metaphor Too Far](https://www.perceptualedge.com/articles/dmreview/dashboard_design.pdf); [Stephen Few, apresentação Information Dashboard Design](https://blogs.ischool.berkeley.edu/i247s12/files/2012/01/Dashboard-Design-Overview-Presentation.pdf); [Song e Szafir, Where's My Data](https://cmci.colorado.edu/visualab/MissingData/) e [PDF](https://cmci.colorado.edu/visualab/papers/song_VIS_2018.pdf); [Data Revelations, rethinking divergent](https://www.datarevelations.com/rethinkingdivergent/); [BetterEvaluation, slopegraph](https://www.betterevaluation.org/methods-approaches/methods/slopegraph); [Atlassian, box plot guide](https://www.atlassian.com/data/charts/box-plot-complete-guide); [ASQ, Pareto](https://asq.org/quality-resources/pareto); [TradingView, step line](https://in.tradingview.com/support/solutions/43000745272-what-are-step-line-charts); [Domo, progress bars](https://www.domo.com/learn/charts/progress-bars); [Retool Forum, progresso acima de 100 por cento](https://community.retool.com/t/displaying-progress-bar-values-exceeding-100/54342); [guia de visualização da União Europeia, calendar heatmap](https://data.europa.eu/apps/data-visualisation-guide/calendar-heatmap); [Smashing Magazine, real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/); [Mobbin, badge](https://mobbin.com/glossary/badge).
- Portais de design: Dribbble, tags [sparkline](https://dribbble.com/tags/sparkline), [kpi](https://dribbble.com/tags/kpi), [kpi dashboard](https://dribbble.com/tags/kpi-dashboard), [kpi design](https://dribbble.com/tags/kpi-design), [kpi cards](https://dribbble.com/tags/kpi_cards), [table ui](https://dribbble.com/tags/table-ui), [percentage](https://dribbble.com/tags/percentage), [indicator](https://dribbble.com/tags/indicator), [status](https://dribbble.com/tags/status), [status indicator](https://dribbble.com/tags/status-indicator), [uptime](https://dribbble.com/tags/uptime), [heatmap](https://dribbble.com/tags/heatmap), [heatmap chart](https://dribbble.com/tags/heatmap-chart), [waffle chart](https://dribbble.com/tags/waffle-chart), [funnel chart](https://dribbble.com/tags/funnel-chart), [progress chart](https://dribbble.com/tags/progress-chart), [range chart](https://dribbble.com/tags/range_chart), [candlestick chart](https://dribbble.com/tags/candlestick-chart), [scatter plot](https://dribbble.com/tags/scatter-plot), [scatter chart](https://dribbble.com/tags/scatter-chart), [box plot](https://dribbble.com/tags/box_plot), [statistics histogram](https://dribbble.com/tags/statistics_histogram), [likert scale](https://dribbble.com/tags/likert_scale), [ranking](https://dribbble.com/tags/ranking), [event timeline](https://dribbble.com/tags/event_timeline), [chart](https://dribbble.com/tags/chart), [charting](https://dribbble.com/tags/charting); shots [uptime status board](https://dribbble.com/shots/2733357), [calendar heatmap](https://dribbble.com/shots/3532285-Calendar-heatmap), [progress ring](https://dribbble.com/shots/4069776-UI-Progress-Indicator-Percentage-Ring-Chart), [waterfall por Shashank Sahay](https://dribbble.com/shots/4936758-Waterfall-Chart), [waterfall por Michal Daniel](https://dribbble.com/shots/3699945-Waterfall-chart); coleção [charts & gauges](https://dribbble.com/rileyzoi/collections/721831-charts-gauges); [Creative Tim, KPI sparkline cards](https://www.creative-tim.com/ui/block/kpi-sparkline-cards).

**Herdadas da versão anterior (modelos 24.1 a 24.14), mantidas sem reabertura nesta sessão.** [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/); [Wikipedia, sparkline](https://en.wikipedia.org/wiki/Sparkline); [Wikipedia, warming stripes](https://en.wikipedia.org/wiki/Warming_stripes); [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart); [Recharts, Simple Line Chart](https://recharts.github.io/en-US/examples/SimpleLineChart/); [Recharts, Tooltip API](https://recharts.github.io/en-US/api/Tooltip/); [Datawrapper Academy, gráficos em tabelas](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables); [Datawrapper Academy, gráficos em tooltips](https://www.datawrapper.de/academy/how-to-embed-charts-into-tooltips); [Datawrapper, small multiple line charts](https://www.datawrapper.de/blog/what-to-consider-when-creating-small-multiple-line-charts); [Storytelling with Data, little things can mean a lot](https://www.storytellingwithdata.com/blog/2020/2/13/little-things-can-mean-a-lot); [Stephen Few, bullet graphs revisited](https://www.perceptualedge.com/blog/?p=217); [Stephen Few, bullet graph design spec](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf); [Data Viz Catalogue, bullet graph](https://datavizcatalogue.com/methods/bullet_graph.html); [Data Viz Catalogue, stacked bar](https://datavizcatalogue.com/methods/stacked_bar_graph.html); [Financial Times, visual vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md); [Protovis, sparklines](https://mbostock.github.io/protovis/ex/sparklines.html); [Highcharts, sparkline](https://www.highcharts.com/demo/highcharts/sparkline); [AG Grid, sparklines overview](https://www.ag-grid.com/javascript-data-grid/sparklines-overview/); [AG Grid, bar customisation](https://www.ag-grid.com/javascript-data-grid/sparklines-bar-customisation/); [AnyChart, Chartopedia sparkline](https://www.anychart.com/chartopedia/chart-type/sparkline-chart/); [AnyChart, win/loss](https://www.anychart.com/blog/2016/04/02/winloss-javascript-sparkline-chart-anychart/); [Vega-Lite, exemplos](https://vega.github.io/vega-lite/examples/); [Vega-Lite, bar negative](https://vega.github.io/vega-lite/examples/bar_negative.html); [Peltier Tech, sparklines e data bars](https://peltiertech.com/sparklines-and-data-bars-in-excel-2010/); [MyExcelOnline, win/loss](https://www.myexcelonline.com/blog/winloss-sparklines-in-excel/).

**Lacunas.** Nenhum artigo específico de Nightingale, Andy Kirk, Alberto Cairo ou Information is Beautiful Awards sobre microvisuais apareceu nas buscas; nenhum projeto de Behance ou arquivo de Figma Community específico de microvisual foi encontrado (só páginas de busca, não citadas). As coleções não centrais da microcharts não foram inventariadas.
