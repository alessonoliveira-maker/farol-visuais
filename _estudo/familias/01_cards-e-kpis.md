# 01 Cards e KPIs

> Família do catálogo VISUAIS do Farol. Estudo feito em 2026-09-14. Todos os casos de uso são fictícios; nomes de pessoas, plataformas e produtos são rótulos genéricos.
> Stack alvo: React 18.3 + TypeScript strict + Recharts 3.10 + Tailwind 4 + lucide-react. Nada de d3, nivo, visx ou echarts no código; bibliotecas de terceiros aparecem aqui só como referência de desenho.

## O que a família responde

Esta é a família do **número que responde sozinho**. Enquanto as outras 26 famílias comparam muitas coisas, aqui existe **uma medida em destaque** e tudo o mais no cartão serve para dar o contexto mínimo que impede a leitura errada desse número: contra quando, contra quanto, com que forma no tempo, com que confiança.

A regra que atravessa toda a literatura é a mesma: **um número sozinho não é informação**. Few construiu o bullet graph exatamente para resolver isso num espaço de dashboard, e a crítica dele aos medidores e ponteiros continua valendo: mostram pouco dado, ocupam muito espaço e vêm cheios de decoração inútil (Wikipedia, bullet graph; especificação da Perceptual Edge). Do outro lado, Knaflic defende que **nem todo número merece gráfico**: com um ou dois valores, o texto grande comunica melhor que a barra, porque a barra ocupa espaço e ainda arrisca enganar pela posição do rótulo (SWD, "storytelling with simple text").

Perguntas típicas no Farol:

* Quanto de receita foi reconhecido no mês, e isso é bom? (Comercial)
* Quantas agendas a pré-vendas marcou esta semana, contra a semana passada e contra o teto de capacidade? (Pré-vendas)
* O CPL qualificado subiu ou desceu, e qual é a forma dessa curva nos últimos 6 meses? (Marketing)
* Quanto falta para a meta do trimestre, e no ritmo atual ela é alcançável? (Diretoria)
* Qual é a faixa provável do cenário, em vez do ponto médio disfarçado de certeza? (Diretoria)
* Esse número é medido, derivado ou premissa? (regra local do Farol, vale para toda a família)
* Esse número existe? (o card que diz honestamente que não há coleta é um modelo, não um erro)

A família tem dois vizinhos próximos que precisam ficar separados na cabeça de quem escolhe. **24 microvisuais e sparklines** guarda a sparkline quando ela é o visual inteiro, por exemplo uma coluna de sparklines dentro de uma tabela. **13 progresso, meta e gauge** guarda o progresso quando o arco ou a barra é o protagonista. Aqui, sparkline e progresso entram **subordinados ao número**: se o olho vai primeiro ao gráfico, o modelo mora na outra família.

## Decisões transversais da família

1. **Hierarquia de três pesos, no máximo.** Rótulo pequeno, número grande, contexto pequeno. Quando os quatro elementos têm o mesmo tamanho, o cartão vira parágrafo e deixa de responder. O contrato do Farol fixa o número em 30 px Space Grotesk 600 (`kpi-number text-3xl leading-none font-semibold`) e limita o corpo a três tamanhos, nada abaixo de 11 px (TIP-1, TIP-2).
2. **Algarismo tabular obrigatório.** Sem `tnum`, uma grade de cartões dança a cada atualização e números da mesma coluna não alinham. No Farol isso vem de graça em `kpi-number` e `font-display`; em Manrope, `tabular-nums`.
3. **Formatação central, nunca local.** Tudo passa por `@/lib/format` ou `valueFormat`: `formatCurrencyCompact` no número do cartão, `formatPercent` na taxa, `formatRateWithVolume` quando o denominador é pequeno. Nada de `toLocaleString` nem `toFixed` em texto visível.
4. **Cor nunca é a única pista.** Variação boa e ruim usa `--positive` e `--negative`, sempre acompanhada de sinal e de ícone direcional do lucide-react. O contrato ainda proíbe fundo tingido atrás de texto semântico: `text-positive` sobre `bg-positive/15` mede 4,33:1 no tema claro e reprova (COR-7).
5. **Polaridade não é o sinal.** CPL que sobe é ruim; receita que sobe é boa; tempo até o primeiro contato que sobe é ruim. O componente recebe `polaridade: 'maior-melhor' | 'menor-melhor' | 'neutra'` e decide a cor a partir disso, nunca a partir do sinal do delta. Esse é o erro mais comum e mais silencioso da família inteira.
6. **Sparkline sem eixo tem escala implícita.** Uma sparkline escalada do menor ao maior valor exagera ruído. Quando a escala não parte do zero, a regra EIX-2 do contrato proíbe preencher a área. Se a mensagem depende do nível e não da forma, a escala precisa partir do zero ou o card precisa escrever a faixa.
7. **Delta precisa da âncora escrita.** "+12%" não diz contra o quê. O card escreve "vs. mês anterior" ou "vs. mesma semana de 2025" em `text-text-muted`. Métrica com duas âncoras de tempo, como mês corrente parcial contra mês fechado, é armadilha conhecida: o card tem que declarar que o período está incompleto.
8. **Percentual de percentual é ambíguo.** Taxa que vai de 10% para 12% subiu 2 pontos percentuais, não 20%. O card escolhe uma das duas leituras e escreve a unidade: `+2,0 p.p.` ou `+20,0%`. As duas ao mesmo tempo confundem.
9. **Denominador pequeno mata a taxa.** Abaixo de um n mínimo (o Farol usa 30 como piso de conforto), a taxa sai com o par, via `formatRateWithVolume`: `25,0% (7 de 28)`. Sem isso o card promove ruído a tendência.
10. **Procedência é do `VisualCard`, não do Chart.** A etiqueta MEDIDO, DERIVADO, PREMISSA ou LACUNA usa `--prov-*` e aparece **uma vez por cartão**, fora do corpo do visual (ANO-6). Os tokens `--prov-*` nunca viram cor de série.
11. **Ausência tem desenho próprio.** Zero e "sem coleta" são coisas diferentes e precisam parecer diferentes. Zero é `0` com a mesma tipografia do número; ausência é traço ou "sem dado" em `--text-muted`, com a linha que explica o porquê. A Datawrapper trata isso como bug clássico: célula vazia que vira `0` na dica mente.
12. **Card de KPI usa moldura `stage`.** No contrato do Farol, visual que já é o próprio cartão (KPI, cartão de alerta) vai direto na grade, sem `VisualCard` em volta. Isso muda a responsabilidade: o KPI desenha o próprio título e a própria borda.
13. **A maioria destes modelos não é Recharts.** Card de KPI é HTML com Tailwind; o Recharts entra só no minigráfico. Quando o minigráfico é uma linha ou área pequena, `recharts-nativo` dentro de um contêiner de altura fixa resolve. Quando é barra de progresso, bullet ou trilho, **SVG puro ou HTML com Tailwind é mais barato, mais previsível e mais acessível** que montar um `BarChart` de uma barra só.
14. **Acessibilidade.** O card inteiro é um `figure` ou uma região com `aria-label` que diz número, unidade, período e comparação numa frase. A sparkline decorativa leva `aria-hidden`, porque a frase já contém a informação.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1.1 | KPI simples | Um número que o público já sabe ler, com rótulo e período | Quando ninguém sabe se o número é bom | Número sem período nem unidade |
| 1.2 | KPI com variação contra período anterior | Métrica acompanhada com cadência fixa | Série muito volátil ou n pequeno | Cor pelo sinal do delta, não pela polaridade |
| 1.3 | KPI comparativo atual, anterior e meta | Precisa das três âncoras na mesma leitura | Espaço apertado, onde vira sopa de números | Três números do mesmo tamanho |
| 1.4 | KPI com sparkline | A forma da série muda a conclusão | Menos de 5 pontos ou série sem cadência | Sparkline de escala livre usada para julgar nível |
| 1.5 | KPI com sparkbar | Série discreta e contável (dias, semanas, campanhas) | Série contínua longa | Colunas finas demais para ler ou clicar |
| 1.6 | KPI com barra de progresso até a meta | Meta acumulada dentro de um período fechado | Métrica sem teto natural | Barra que passa de 100% e some do trilho |
| 1.7 | KPI com bullet embutido | Realizado contra meta e contra faixas qualitativas | Público que nunca viu bullet, sem legenda | Faixas em três matizes em vez de três intensidades |
| 1.8 | KPI com trilho de capacidade | Uso contra teto operacional (filas, carteira) | Medida sem teto declarado | Teto premissa exibido como se fosse medido |
| 1.9 | Big number com contexto | O número precisa de uma frase para significar algo | Grade de cartões, onde a frase quebra o alinhamento | Frase que repete o rótulo em vez de explicar |
| 1.10 | KPI de razão com numerador e denominador | Taxas, conversões, CPL, custo por unidade | Quando o denominador é estável e conhecido | Esconder o n pequeno atrás do percentual |
| 1.11 | KPI com decomposição | O total só faz sentido com a composição | Mais de 5 componentes | Segmentos sem rótulo e sem ordem estável |
| 1.12 | KPI com faixa de incerteza | Cenário, forecast, projeção | Dado já realizado | Publicar o ponto médio e esconder a faixa |
| 1.13 | KPI com status | Estado categórico derivado de uma régua escrita | Quando a régua não existe ou muda toda semana | Semáforo sem dizer qual é o corte |
| 1.14 | KPI com etiqueta de procedência | Número de planejamento que mistura medição e premissa | Painel em que tudo é medido | Etiqueta em cor de série, brigando com o dado |
| 1.15 | KPI indisponível | Não há coleta, ou a coleta falhou | Quando o valor é zero de verdade | Mostrar `0` ou `-` no lugar de "sem dado" |
| 1.16 | Grade de scorecards | Comparar a mesma métrica entre muitas entidades | Métricas de unidades diferentes na mesma grade | Escalas de sparkline diferentes entre cartões |
| 1.17 | Tira de KPIs | Cabeçalho de tela, 3 a 6 números de abertura | Mais de 6 cartões na mesma linha | Cartões de importância desigual com peso igual |
| 1.18 | KPI hierárquico | Um número principal explicado por 2 ou 3 filhos | Filhos que não somam nem dividem o principal | Filho que parece KPI independente |
| 1.19 | KPI com tracker de estado | Cumprimento diário de SLA ou disponibilidade | Série com mais de cerca de 90 células no cartão | Célula sem dica e sem rótulo de data |
| 1.20 | KPI com posição no ranking | Desempenho relativo entre pares | Grupos com menos de 4 integrantes | Posição sem o tamanho do grupo |
| 1.21 | Card de exceção | Só aparece quando estoura uma régua | Painel executivo que precisa de leitura estável | Cartão que some e deixa buraco na grade |
| 1.22 | KPI com ritmo até a meta | Meta com prazo e acumulação aproximadamente linear | Metas sazonais ou com degraus | Projetar linearmente uma série sazonal |
| 1.23 | KPI clicável com drill | Número que sempre gera a pergunta "de onde veio" | Card impresso ou exportado | Afordância de clique invisível |
| 1.24 | KPI em texto corrido | Uma ou duas medidas dentro de uma frase | Comparação entre muitas entidades | Frase longa que esconde o número |
| 1.25 | KPI com par de indicadores | Métrica de volume que pode ser inflada à custa da qualidade | Quando as duas medidas não têm relação de efeito e contraefeito | Dois números de mesmo peso sem a relação escrita |
| 1.26 | KPI com bandline | A sparkline precisa dizer se o nível atual é alto ou baixo contra o histórico | Histórico curto, com menos de cerca de 20 observações | Quartis calculados só sobre a janela visível |
| 1.27 | KPI com seletor de janela | O mesmo número lido em 7, 30 e 90 dias | Tira com muitos cartões ou peça impressa | Trocar a janela do número sem trocar a âncora do delta |
| 1.28 | KPI com lista de contribuição | O total e os 3 a 5 maiores responsáveis por ele | Quando a lista vira o protagonista (família 02) | Lista sem a linha de demais que feche o total |
| 1.29 | KPI em carregamento | Enquanto a consulta ainda não voltou | Consulta que responde abaixo de cerca de 300 ms | Esqueleto com altura diferente do cartão final |
| 1.30 | KPI com frescor do dado | Fonte com atraso variável ou coleta agendada | Dado sempre fresco e transacional | Mostrar a hora de carga da página como se fosse a do dado |
| 1.31 | KPI com sparkline comparativa | Série sazonal, comparar a forma com o mesmo período anterior | Mais de duas séries no minigráfico | Série anterior com o mesmo peso da atual |
| 1.32 | KPI com anel de progresso | Uma fração só, quando o kit visual exige forma circular | Comparar vários cartões entre si (mora melhor em 13) | Anel sem o número escrito no centro |
| 1.33 | KPI com ponto de ação | Muitos KPIs e só as exceções merecem olhar | Métrica sem limiares de ação definidos | Pintar também os cartões normais |
| 1.34 | KPI de distribuição resumida | Tempos e valores assimétricos, como SLA e ticket | Poucas observações no período | Publicar a média de uma distribuição de cauda longa |

---

## Modelos

### 1.1 KPI simples

**Descrição.** Um rótulo, um número grande e uma linha de período. É o átomo da família: tudo o que vem depois acrescenta contexto a este desenho. Serve quando o público já carrega a régua na cabeça e o número basta para confirmar ou desmentir o que ele esperava.

**Anatomia.** (1) Rótulo da métrica em 12 px, `text-text-secondary`, sem abreviação obscura. (2) Número em 30 px Space Grotesk 600, `kpi-number`, `text-text-primary`, formatado por `formatCurrencyCompact` ou `formatInteger`. (3) Unidade colada ao número quando ela não cabe no rótulo. (4) Linha de período em 11 px, `text-text-muted`, sempre presente: "set/2026", "últimos 30 dias", "acumulado do trimestre". (5) Opcionalmente um ícone do lucide-react no canto, 16 px, `text-text-muted`, decorativo e com `aria-hidden`.

**Abordagem na stack:** `html-tailwind`. Nenhum SVG, nenhum Recharts. Um `<figure>` com `flex flex-col gap-1`, moldura `stage` conforme a seção 13 do contrato, e `aria-label` montado da frase completa.

**Ponto delicado.** O período é obrigatório e quase sempre é o que falta. Um número de receita sem período é impossível de auditar e vira fonte de discussão na reunião. O segundo ponto é o comprimento: `R$ 1.284.930,00` estoura a caixa de 360 px em telas menores, então o formatador compacto é a regra e o valor exato vai na dica ou no `title`. Terceiro ponto, o número precisa de `leading-none` e `tabular-nums` ou a grade de cartões fica desalinhada quando um valor muda de dígito.

**Versões sugeridas.**

* **V1 Básico.** Receita reconhecida no mês corrente, com o período escrito embaixo e nada mais. Público Comercial.
* **V2 Com ícone e unidade.** Agendas realizadas na semana, com ícone de calendário decorativo e a unidade "agendas" em `text-text-muted` ao lado do número. Público Pré-vendas.
* **V3 Caso denso do Farol.** Tira de abertura da tela de Marketing com investimento total, leads, CPL e CPL qualificado, quatro cartões 1.1 em grade, todos com o mesmo período no rodapé e o mesmo alinhamento de linha de base do número.
* **V4 Caso limite.** Valor negativo e valor gigante no mesmo cartão: variação de carteira de `-R$ 2,4 mi`, com o sinal explícito antes do símbolo de moeda e o valor exato no `title`. Sem cor semântica, porque o cartão 1.1 não julga, só informa.

**Referências.**

* Catálogo: [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/). Observar que o próprio catálogo trata o número com microgrático como unidade de leitura, o que justifica separar o 1.1 puro do 1.4.
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar o argumento central: com um ou dois números, o gráfico ocupa espaço e ainda arrisca enganar pela posição do rótulo.
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar o limite de itens que o olho processa antes de precisar de agrupamento.
* Portal de design: [Dribbble, Dashboard Card Stats Metrics em TailwindCSS](https://dribbble.com/shots/15261147-Dashboard-Card-Stats-Metrics-TailwindCSS-Component). Observar a proporção entre rótulo e número e o respiro interno do cartão.
* Portal de design: [Figma Community, Mobile Dashboard, charts e KPI widgets](https://www.figma.com/community/file/1528308765361625218/mobile-dashboard-charts-kpi-widgets). Observar que o kit traz estados vazios como componente, não como acidente.

### 1.2 KPI com variação contra período anterior

**Descrição.** O 1.1 acrescido de uma linha de delta: seta, sinal, magnitude e a âncora escrita. É o modelo mais usado em painel operacional e o que mais erra, porque a cor costuma vir do sinal e não da polaridade da métrica.

**Anatomia.** (1) Rótulo. (2) Número. (3) Linha de variação: ícone `TrendingUp`, `TrendingDown` ou `Minus` do lucide-react em 14 px, sinal textual, magnitude formatada e a âncora ("vs. mês anterior") em `text-text-muted`. (4) Período do número. A linha de variação fica a 8 px do número, conforme a régua de espaçamento do contrato.

**Abordagem na stack:** `html-tailwind`. A cor sai de uma função pura `corDaVariacao(delta, polaridade)` que devolve `text-positive`, `text-negative` ou `text-text-muted`, e o ícone sai da mesma função. Nada de `bg-positive/15` atrás do texto, por causa da COR-7.

**Ponto delicado.** Três armadilhas empilhadas. Primeira, **polaridade**: CPL que cai é bom, então o delta negativo pinta `--positive`. Segunda, **unidade do delta**: variação de uma taxa sai em pontos percentuais, variação de um valor sai em percentual; o componente recebe `tipoDelta: 'pp' | 'pct' | 'abs'` e não adivinha. Terceira, **período incompleto**: comparar 14 dias corridos do mês contra o mês fechado anterior produz queda falsa; quando o período está em curso, o cartão escreve "parcial, 14 de 30 dias" e a comparação vai contra os mesmos 14 dias do mês anterior. Quarta armadilha menor: divisão por zero quando o período anterior é zero; o texto vira "sem base de comparação", não `Infinity` nem `+100%`.

**Versões sugeridas.**

* **V1 Básico.** Receita reconhecida no mês com `+8,4% vs. mês anterior`, seta para cima em `--positive`. Público Comercial.
* **V2 Polaridade invertida.** CPL qualificado com `-11,2% vs. mês anterior`, seta para baixo pintada em `--positive` porque a métrica é do tipo menor melhor, e a legenda de uma linha explicando a convenção uma vez por tela. Público Marketing.
* **V3 Caso denso do Farol.** Tira de seis cartões de Pré-vendas (entradas, agendas marcadas, agendas realizadas, taxa de comparecimento, tempo até o primeiro contato, fila em aberto) com polaridades diferentes convivendo na mesma linha, cada um com a âncora escrita e a taxa saindo com o par quando o n é menor que 30.
* **V4 Caso limite.** Três estados difíceis no mesmo componente: base anterior igual a zero ("sem base de comparação"), delta exatamente zero (ícone `Minus`, cor neutra, texto "estável") e período parcial (etiqueta "parcial" ao lado da âncora).

**Referências.**

* Catálogo: [Datawrapper Academy, formatos numéricos personalizados](https://academy.datawrapper.de/article/207-custom-number-formats-that-you-can-display-in-datawrapper). Observar o tratamento de sinal, separador e sufixo, que é exatamente o que o formatador do cartão precisa fixar.
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar o par número mais palavra: a palavra é que carrega a âncora.
* Praticante: [Anatomy of the KPI Card, Anastasiya Kuznetsova](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card). Observar a decomposição do cartão em camadas e o peso visual do delta em relação ao número (aberto: confirma período, nome e valor como obrigatórios e o contexto por comparação sazonal, média, meta e dimensão).
* Implementação: [Tremor, spark charts dentro de cartão de métrica](https://www.tremor.so/docs/visualizations/spark-chart). Observar o arranjo número mais variação mais microgrático em `h-8 w-20`, que é a proporção de referência.
* Portal de design: [Dribbble, tag kpi-card](https://dribbble.com/tags/kpi-cards). Observar quantas peças usam fundo tingido atrás do delta, prática que o contrato do Farol proíbe por contraste.

### 1.3 KPI comparativo atual, anterior e meta

**Descrição.** Três números na mesma leitura: o realizado em destaque, o período anterior e a meta, os dois últimos em peso menor e alinhados. Resolve a reunião em que alguém sempre pergunta "e a meta?" logo depois de ver o delta.

**Anatomia.** (1) Rótulo. (2) Número principal. (3) Uma régua de dois ou três pares rótulo mais valor, em 11 px, dispostos em linha com divisória vertical `border-line-subtle` entre eles, ou em duas colunas quando o cartão é estreito. (4) Um indicador curto de atingimento ("87% da meta") que já é o veredito. Sem barra: a barra é o modelo 1.6.

**Abordagem na stack:** `html-tailwind`. Grade de duas ou três colunas com `divide-x divide-line-subtle`, números em `kpi-number text-sm font-semibold` conforme a tabela de tipografia do contrato.

**Ponto delicado.** O risco é o cartão virar tabela de quatro números do mesmo peso, e aí ninguém sabe qual é a resposta. A hierarquia precisa ser brutal: o principal em 30 px, os apoios em 14 px e os rótulos deles em 11 px `text-text-muted`. Segundo ponto, meta ausente é comum (executivo novo, produto novo) e a coluna da meta precisa de um estado "sem meta" em vez de sumir, porque sumir desalinha a grade de cartões vizinhos. Terceiro ponto, se anterior e meta tiverem escalas muito diferentes, o par vira ruído; nesse caso o modelo certo é o 1.7.

**Versões sugeridas.**

* **V1 Básico.** Receita do trimestre com anterior e meta, e o atingimento em uma linha. Público Comercial.
* **V2 Com destaque no veredito.** Mesmo cartão, com o atingimento em `--negative` e o texto "abaixo da meta por R$ 143 mil", calculado do dado e não escrito à mão. Público Comercial.
* **V3 Caso denso do Farol.** Tela de Diretoria com quatro cartões 1.3 lado a lado (receita, novos clientes, custo da área, participação estimada), cada um com meta e com a etiqueta de procedência do `VisualCard`, porque participação de mercado é DERIVADO e a meta é PREMISSA.
* **V4 Caso limite.** Meta ausente em um dos cartões da grade: a coluna existe, mostra "sem meta" em `text-text-muted` e o veredito some, sem alterar a altura do cartão.

**Referências.**

* Catálogo: [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Observar que a alternativa gráfica ao trio de números é o bullet, e quando cada uma ganha.
* Praticante: [Few, especificação do bullet graph em PDF](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Observar a distinção entre medida em destaque e medidas comparativas, que é a espinha deste modelo (PDF aberto; texto lido por extração local).
* Praticante: [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). Observar a crítica aos medidores: pouco dado, muito espaço, muita decoração.
* Portal de design: [Figma Community, KPI Charts](https://www.figma.com/community/file/1130917765288346079/kpi-charts). Observar arranjos de comparação dentro de um cartão só.
* Portal de design: [Untitled UI, componentes de métrica em Figma](https://www.untitledui.com/components/metrics). Observar as variantes de cartão de métrica com e sem comparação.

### 1.4 KPI com sparkline

**Descrição.** Número grande com uma minilinha da série recente logo abaixo ou ao lado. A sparkline não substitui o gráfico da tela; ela responde a uma pergunta só: a forma dessa série é subida firme, queda, ou serra. Tufte definiu a peça como um gráfico pequeno, intenso, simples, do tamanho de uma palavra e com resolução tipográfica.

**Anatomia.** (1) Rótulo. (2) Número. (3) Sparkline sem eixo, sem grade, sem dica, com cerca de 32 px de altura e 80 a 140 px de largura. (4) Ponto final destacado, ligado por cor ao número, que é a recomendação explícita de Tufte. (5) Opcionalmente a âncora temporal da série ("12 meses"). (6) Opcionalmente a banda cinza de faixa normal, também de Tufte, quando existe um intervalo esperado.

**Abordagem na stack:** `recharts-nativo` para a minilinha, dentro de um contêiner de altura fixa. `LineChart` com `margin={{top:2,right:2,bottom:2,left:2}}`, uma `Line` com `dot={false}`, `isAnimationActive={false}` e `strokeWidth={1.5}`, sem `XAxis`, `YAxis`, `CartesianGrid` nem `Tooltip`. O exemplo oficial `TinyLineChart` do Recharts é exatamente esse esqueleto. O ponto final vai como uma segunda `Line` de um ponto só, ou como `dot` condicional no último índice.

**Ponto delicado.** Quatro pontos. Primeiro, **escala**: por padrão o Recharts ajusta o domínio ao mínimo e ao máximo, o que transforma uma oscilação de 1% numa montanha; se a mensagem é nível, fixar `domain={[0, 'dataMax']}`; se a mensagem é forma, manter livre e **não preencher área**, por EIX-2. Segundo, **altura**: `ResponsiveContainer` dentro de um pai sem altura definida colapsa para zero e a sparkline some sem erro; o pai precisa de `h-8` explícito. Terceiro, **furo na série**: `null` no meio corta a linha, o que é o comportamento honesto; `connectNulls` mente sobre a continuidade, então só com nota escrita. Quarto, **animação**: numa grade de doze cartões, a animação do Recharts custa caro e polui; `isAnimationActive={false}` ou o `useAnimateOnce` do Farol.

**Versões sugeridas.**

* **V1 Básico.** CPL qualificado do mês com sparkline dos últimos 12 meses e o ponto final em `--chart-1`. Público Marketing.
* **V2 Com anotação de faixa.** Tempo médio até o primeiro contato com banda cinza de faixa normal (`ReferenceArea` de 0 a 4 horas em `--surface-overlay`) e o ponto final fora da banda em `--negative`, que é a leitura de Tufte aplicada a SLA. Público Pré-vendas.
* **V3 Caso denso do Farol.** Grade de oito cartões de executivo com sparkline de 26 semanas cada, todos na **mesma escala vertical** para que a comparação entre cartões seja legítima, com a escala comum escrita uma vez no rodapé da grade.
* **V4 Caso limite.** Série de 5 pontos e série com 2 meses sem coleta: com menos de 5 pontos o componente troca a linha por pontos soltos e escreve "série curta"; com furo, a linha quebra e o rodapé diz "2 meses sem coleta", nunca `connectNulls` silencioso.

**Referências.**

* Catálogo: [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/). Observar a definição de Tufte reproduzida e os usos em tabela e em texto.
* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Observar a proporção que produz inclinação média perto de 45 graus, os pontos de mínimo e máximo e a banda cinza de faixa normal.
* Praticante: [Few, Bar Widths and the Spaces in Between em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf). Observar a lógica de respiro que também vale para a sparkbar do 1.5.
* Implementação: [Recharts, TinyLineChart](https://recharts.github.io/en-US/examples/TinyLineChart/) e a [galeria de exemplos](https://recharts.github.io/en-US/examples/). Observar o esqueleto sem eixos e a margem mínima.
* Implementação: [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart). Observar `SparkLineChart`, `SparkAreaChart` e `SparkBarChart` e o dimensionamento `h-8 w-20` dentro do cartão.
* Portal de design: [Dribbble, Bar Chart Dashboard Card em tema escuro](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme). Observar o contraste do traço do microgrático sobre fundo escuro, que é onde a sparkline costuma sumir.

### 1.5 KPI com sparkbar

**Descrição.** Variante do 1.4 em que o microgrático é uma fileira de minicolunas em vez de uma linha. Vale quando cada ponto é uma unidade contável e discreta (um dia, uma semana, uma campanha) e quando o leitor precisa comparar alturas, não seguir uma trajetória. O Data Viz Project cataloga isso como column sparkline; a variante de dois estados, acima e abaixo de zero, é a win loss sparkline.

**Anatomia.** (1) Rótulo. (2) Número. (3) Fileira de 7 a 30 colunas, altura máxima de cerca de 32 px, vão de 1 a 2 px entre colunas. (4) Última coluna em cor de destaque, ligada ao número. (5) Opcionalmente uma linha de base visível quando há valores negativos. (6) Âncora temporal.

**Abordagem na stack:** `recharts-nativo` com `BarChart` mínimo (é o esqueleto do exemplo oficial `TinyBarChart`), ou `html-tailwind` quando as colunas são poucas e todas positivas: um `flex items-end gap-px` com `div` de altura percentual calculada em TypeScript. A segunda opção custa menos e aceita `title` por coluna sem montar dica do Recharts.

**Ponto delicado.** Barra exige base zero, sempre, mesmo em versão miniatura; sparkbar com eixo truncado é mentira com aparência de enfeite. Em compensação, com base zero e um pico muito alto, todas as outras colunas viram um fio; nesse caso o modelo certo é a sparkline de linha (1.4) ou um recorte declarado. Segundo ponto, largura mínima de coluna: abaixo de 3 px a coluna some no tema escuro e o alvo de clique fica inviável, então a contagem de pontos é limitada pela largura do cartão, não pelo tamanho da série. Terceiro, a versão win loss usa duas cores de polaridade e precisa do sinal em texto na dica, porque a altura sozinha não diz de que lado está.

**Versões sugeridas.**

* **V1 Básico.** Agendas realizadas por dia útil nas últimas 4 semanas, 20 colunas, última em `--chart-1`. Público Pré-vendas.
* **V2 Com destaque.** Leads por dia com as colunas de fim de semana em `--line-strong` e as de dia útil em `--chart-1`, para não ler queda onde só há calendário. Público Marketing.
* **V3 Caso denso do Farol.** Cartão de handoff com 30 colunas de dias e um `ReferenceLine` horizontal no teto diário da fila, colunas acima do teto em `--negative`. Público Pré-vendas.
* **V4 Caso limite.** Win loss: semanas com saldo de oportunidades positivo e negativo, colunas para cima e para baixo a partir da linha de base, com a semana de saldo exatamente zero desenhada como um traço de 1 px e não como ausência.

**Referências.**

* Catálogo: [Data Viz Project, Column Sparkline](https://datavizproject.com/data-type/column-sparkline/). Observar a diferença de uso entre linha e coluna no mesmo espaço.
* Catálogo: [Data Viz Project, Win loss Sparkline](https://datavizproject.com/data-type/win-loss-sparkline/). Observar o formato de dois estados, útil para saldo e para bateu ou não bateu.
* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Observar a insistência na resolução tipográfica: a peça tem de caber ao lado de uma palavra.
* Implementação: [Recharts, TinyBarChart](https://recharts.github.io/en-US/examples/TinyBarChart/). Observar o esqueleto sem eixos e sem grade.
* Implementação: [Tremor, SparkBarChart](https://www.tremor.so/docs/visualizations/spark-chart). Observar a API mínima e o dimensionamento por classe utilitária.
* Portal de design: [Dribbble, tag kpi-cards](https://dribbble.com/tags/kpi-cards). Observar como as peças resolvem o vão entre colunas em cartões estreitos.

### 1.6 KPI com barra de progresso até a meta

**Descrição.** Número, meta e uma barra horizontal fina que mostra a fração percorrida. Responde "quanto já foi" numa leitura só. Diferente do modelo 1.3, aqui o julgamento é visual antes de ser numérico.

**Anatomia.** (1) Rótulo. (2) Número realizado. (3) Trilho de 6 a 8 px de altura em `--surface-overlay`, largura total do cartão, cantos arredondados. (4) Preenchimento em `--chart-1` ou na cor semântica, com largura percentual. (5) Marcador opcional do ritmo esperado, um traço vertical de 2 px em `--line-strong` na posição da fração do período já decorrida. (6) Linha de rodapé com "R$ 412 mil de R$ 600 mil" e o percentual.

**Abordagem na stack:** `html-tailwind` para o trilho e o preenchimento, com `role="progressbar"`, `aria-valuenow`, `aria-valuemin` e `aria-valuemax`. O marcador de ritmo é um `div` absoluto. Montar isso com Recharts custa mais e entrega menos acessibilidade.

**Ponto delicado.** Três pontos. Primeiro, **estouro**: com 118% da meta, a barra clampa em 100% e o excedente vira texto ("+18% acima"), ou o trilho ganha uma zona de excesso com hachura; o que não pode é o preenchimento vazar do trilho ou sumir. Segundo, **período decorrido**: 60% da meta no dia 5 do mês é ótimo e no dia 28 é ruim; sem o marcador de ritmo a barra diz meia verdade, e esse marcador é o que separa este modelo do 1.22. Terceiro, **meta zero ou ausente**: a divisão explode e o componente precisa do estado "sem meta", com o trilho vazio e o texto explicando.

**Versões sugeridas.**

* **V1 Básico.** Receita do trimestre contra a meta, barra e rodapé com o par realizado e meta. Público Comercial.
* **V2 Com marcador de ritmo.** A mesma barra com o traço do ritmo esperado na posição do dia corrente e o rodapé dizendo "atrás do ritmo por R$ 74 mil". Público Comercial.
* **V3 Caso denso do Farol.** Grade de 8 cartões de executivo, cada um com trilho de mesma largura e mesma escala relativa, ordenados pelo atingimento, com o cartão do usuário logado em destaque. Público Comercial.
* **V4 Caso limite.** Três estouros na mesma grade: atingimento de 118% (clampado, com texto de excedente), atingimento de 0% no primeiro dia do período (trilho vazio, sem cor de alerta, porque zero no dia 1 não é problema) e meta ausente (trilho neutro com "sem meta").

**Referências.**

* Catálogo: [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Observar por que o bullet nasceu como substituto de barra de progresso com contexto.
* Praticante: [Few, especificação do bullet graph em PDF](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Observar a distinção entre a barra que mostra quantidade e a marca que mostra referência (PDF aberto; texto lido por extração local).
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar que o veredito em palavras ainda é necessário mesmo com a barra desenhada.
* Implementação: [Tremor, ProgressBar e CategoryBar em data bars](https://npm.tremor.so/docs/visualizations/data-bars). Observar o arranjo canônico de métrica mais barra mais texto de fração.
* Portal de design: [Figma Community, Dashboard UI Kits Series](https://www.figma.com/community/file/1347448012996114787/dashboard-ui-kits-series). Observar alturas e raios de trilho usados em kits de painel.

### 1.7 KPI com bullet embutido

**Descrição.** O número acompanhado do bullet graph de Few: barra fina do realizado, marca vertical da referência e faixas de fundo em intensidades do mesmo tom declarando estado qualitativo. É a resposta mais densa da família, e a que exige mais do leitor.

**Anatomia.** (1) Rótulo com a unidade entre parênteses. (2) Número. (3) Faixas de fundo, duas ou três, encostadas umas nas outras, em intensidades de um único tom, do escuro (ruim) ao claro (bom), como manda a especificação. (4) Barra do realizado, mais estreita que as faixas e centrada nelas. (5) Marca vertical da referência, cruzando a barra. (6) Escala mínima nas pontas ou nenhuma, se todos os números estiverem escritos.

**Abordagem na stack:** `svg-puro`. Um `<svg viewBox="0 0 240 28">` com retângulos de faixa, retângulo do realizado e uma linha de referência; a geometria é uma função `escala(valor) => x` calculada em TypeScript a partir do domínio. O Recharts não tem bullet e improvisar com `BarChart layout="vertical"` mais `ReferenceLine` custa mais código e dá menos controle sobre a espessura relativa. No Farol existe um `BulletChart` de biblioteca interna; a versão do catálogo mostra a geometria crua para quem vai colar.

**Ponto delicado.** Quatro pontos. Primeiro, **faixas em intensidades, não em matizes**: verde, amarelo e vermelho de fundo brigam com a cor semântica da barra e reprovam em daltonismo; a especificação pede intensidades de um só tom, escuro para ruim e claro para bom. No tema escuro do Farol isso inverte a intuição da especificação original, então as faixas saem de `--seq-1` a `--seq-3` e a barra fica em `--text-primary` ou `--chart-1`, com contraste medido. Segundo, **número de faixas**: três já é muito para um cartão pequeno; duas resolvem quase tudo. Terceiro, **a régua das faixas tem de estar escrita em algum lugar**, senão o cartão inventa autoridade; a dica ou o rodapé diz "ruim abaixo de 70%, bom acima de 95%". Quarto, **público**: bullet exige alfabetização; num painel de diretoria sem legenda, o 1.3 ou o 1.6 comunicam mais.

**Versões sugeridas.**

* **V1 Básico.** Atingimento de meta do trimestre por produto, três faixas, marca na meta e barra no realizado. Público Comercial.
* **V2 Com legenda de régua.** O mesmo cartão com uma linha de rodapé que escreve os cortes das faixas, calculada da configuração da métrica e não digitada.
* **V3 Caso denso do Farol.** Coluna de 6 bullets empilhados numa mesma escala compartilhada (taxa de resposta, taxa de agenda, comparecimento, aproveitamento, tempo até o contato invertido, aderência à cadência), todos de 0 a 100%, com a marca de referência na média histórica de cada um. Público Pré-vendas.
* **V4 Caso limite.** Realizado acima do topo da escala: a barra clampa na borda com um chevron indicando corte, e o valor exato aparece escrito. Referência ausente: as faixas ficam, a marca some e o rodapé diz "sem referência definida".

**Referências.**

* Catálogo: [Data Viz Project, Bullet Graph](https://datavizproject.com/data-type/bullet-graph/). Observar a genealogia: variação de barra que substitui medidor de painel.
* Catálogo: [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Observar a lista de usos e as ferramentas que implementam.
* Praticante: [Few, Bullet Graph Design Specification em PDF](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Observar a especificação original de 2013 (PDF aberto; texto lido por extração local: cinco componentes, de duas a cinco faixas, uma ou duas medidas comparativas).
* Praticante: [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). Observar a regra de intensidades de um só tom e a possibilidade de orientação vertical e de empilhamento.
* Praticante: [Clearly and Simply, An Alternative Design of Bullet Graphs](https://www.clearlyandsimply.com/clearly_and_simply/2017/05/an-alternative-design-of-bullet-graphs.html). Observar a crítica de que as faixas roubam atenção da barra, e o desenho alternativo proposto (apareceu na busca; não aberto nesta coleta).
* Praticante: [Nightingale, Why I Stopped Using Bullet Graphs (and What I Now Use Instead)](https://nightingaledvs.com/why-i-stopped-using-bullet-graphs-and-what-i-now-use-instead/). Observar as onze desvantagens listadas, em especial a curva de aprendizado, a leitura lenta e as variantes de menor melhor; é o argumento para o 1.33 quando a grade é grande (aberto).
* Praticante: [IBCS, avaliação do bullet graph](https://www.ibcs.com/resource/ibcs-evaluation-bullet-graphs/). Observar as três correções propostas: tirar a terceira faixa de comprimento arbitrário, normalizar a meta e destacar a variação (apareceu na busca; não aberto).
* Portal de design: [Figma Community, KPI Charts](https://www.figma.com/community/file/1130917765288346079/kpi-charts). Observar variantes de marcador e espessura em peças de interface.

### 1.8 KPI com trilho de capacidade contra teto

**Descrição.** Parece o 1.6, mas a referência não é uma meta a ser perseguida e sim um **teto a não ser ultrapassado**. A polaridade inteira se inverte: chegar a 100% é ruim. Modelo central da tela de Pré-vendas e da tela de Diretoria, onde a capacidade da esteira é a restrição que manda no plano.

**Anatomia.** (1) Rótulo com a unidade da capacidade ("entradas por mês", "contas por carteira"). (2) Número da demanda ou do uso. (3) Trilho representando o teto, com zona de conforto, zona de atenção e zona de estouro marcadas por intensidade. (4) Preenchimento do uso. (5) Quando o uso passa do teto, uma extensão hachurada além do trilho, que **é o ponto do modelo**: o excesso precisa ser visível, não clampado. (6) Rodapé com "274 de 240, estouro de 34".

**Abordagem na stack:** `svg-puro`. O clamp do 1.6 não serve aqui, então a escala vai de 0 ao maior valor entre uso e teto vezes 1,1, e o teto vira uma marca vertical em `--line-strong` dentro do desenho. O excesso pinta em `--negative` com `pattern` de hachura declarado em `<defs>`.

**Ponto delicado.** O teto quase sempre é **premissa**, não medição: vem de uma planilha de capacidade, de uma conversa com o time, de uma regra de negócio. O contrato do Farol resolve isso com a etiqueta de procedência do `VisualCard`, e este modelo é o que mais depende dela. O segundo ponto é a unidade de tempo: teto mensal comparado a uso semanal é erro de leitura garantido, então rótulo e número compartilham a mesma janela, escrita. O terceiro é que a zona de atenção precisa de um corte declarado; "amarelo a partir de 85%" é uma decisão de negócio, não um detalhe de estilo.

**Versões sugeridas.**

* **V1 Básico.** Uso da fila de pré-vendas contra o teto mensal, com o teto marcado e o rodapé com o par. Público Pré-vendas.
* **V2 Com estouro visível.** Demanda projetada de 274 entradas por mês contra teto medido de 240, com a hachura do excesso e o rodapé "estouro de 34 por mês". Público Diretoria.
* **V3 Caso denso do Farol.** Grade de quatro filas de pré-vendas e uma carteira de vendas, cinco trilhos empilhados na mesma escala relativa (percentual do próprio teto), com a etiqueta PREMISSA em três deles e MEDIDO em dois, e um rodapé único explicando de onde vem cada teto. Público Diretoria.
* **V4 Caso limite.** Teto desconhecido: o trilho aparece sem marca, em neutro, e o rodapé diz "teto não declarado, sem julgamento possível", em vez de inventar 100%. Uso zero com teto definido: trilho vazio com o teto marcado, sem cor de alerta.

**Referências.**

* Catálogo: [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Observar que o mesmo desenho serve para meta e para teto, e que a diferença mora na polaridade declarada.
* Praticante: [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). Observar a ideia de faixas qualitativas, que aqui viram conforto, atenção e estouro.
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar o custo cognitivo de painéis com muitas réguas diferentes na mesma tela.
* Implementação: [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker). Observar o vocabulário de estados por célula, reaproveitável para as zonas do trilho.
* Portal de design: [Dribbble, Dashboard Card Stats Metrics em TailwindCSS](https://dribbble.com/shots/15261147-Dashboard-Card-Stats-Metrics-TailwindCSS-Component). Observar o tratamento de trilho e preenchimento em componente utilitário.

### 1.9 Big number com contexto ou benchmark

**Descrição.** O número grande acompanhado de **uma frase** que o torna interpretável: uma comparação externa, um benchmark de mercado, uma equivalência, um perímetro. É o modelo de abertura de relatório e de slide de diretoria, e é o que Knaflic chama de simple text: o gráfico sairia pior.

**Anatomia.** (1) Número grande, às vezes maior que o padrão de cartão, ocupando o cartão inteiro. (2) Frase curta de contexto em 12 ou 14 px, em duas linhas no máximo, com a parte quantitativa em `text-text-primary` e o resto em `text-text-secondary`. (3) Perímetro escrito quando o número é uma participação ou uma estimativa. (4) Fonte do benchmark, quando externo.

**Abordagem na stack:** `html-tailwind`. Tipografia pura. O único cuidado técnico é a quebra de linha da frase, que não pode empurrar a altura do cartão numa grade.

**Ponto delicado.** A frase precisa **acrescentar**, não repetir. "Receita reconhecida de R$ 1,2 mi em set/2026" seguido de "receita reconhecida do mês" é desperdício de linha. A frase boa traz uma âncora que o leitor não tem: o perímetro da participação, a base de comparação, a equivalência. Segundo ponto, benchmark externo exige fonte e data, e no Farol, que é protótipo com dado fictício, exige também que a fonte seja declarada como fictícia. Terceiro, o número grande em cartão estreito quebra; o formatador compacto e um `text-balance` na frase resolvem a maior parte.

**Versões sugeridas.**

* **V1 Básico.** "R$ 1,24 mi" com a frase "receita reconhecida em set/2026, a maior de 2026 até aqui". Público Comercial.
* **V2 Com benchmark.** "4,2%" com a frase "participação estimada no perímetro de 38 concorrentes mapeados; fora do perímetro o número não é comparável". Público Diretoria.
* **V3 Caso denso do Farol.** Abertura da tela de Diretoria com três big numbers em faixa (receita do ano, custo total da área, retorno da camada declarada), cada um com uma frase de perímetro diferente e a etiqueta de procedência correspondente, porque o retorno muda de valor conforme a camada de custo escolhida.
* **V4 Caso limite.** Número que não deveria ser lido sozinho: "R$ 0" de receita vinda de mídia paga, com a frase "0 de 66 vitórias no período vieram de mídia paga; 55,7% do volume de entradas veio dela", que é uma comparação desconfortável e por isso mesmo o conteúdo do cartão.

**Referências.**

* Catálogo: [Datawrapper Academy, formatos numéricos](https://academy.datawrapper.de/article/207-custom-number-formats-that-you-can-display-in-datawrapper). Observar prefixo, sufixo e arredondamento, que é metade do trabalho do big number.
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar o argumento e o exemplo dos dois números que dispensam gráfico.
* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Observar a ideia de dataword: número e microgrático na corrente do texto, que é o parente próximo deste modelo e vira o 1.24.
* Portal de design: [Behance, Sales Dashboard Design](https://www.behance.net/gallery/205112599/Sales-Dashboard-Design?locale=en_US). Observar a escala tipográfica do número de abertura em peças de painel (apareceu na busca; não aberto, conferir as imagens antes de adotar).
* Portal de design: [Figma Community, Mobile Dashboard, charts e KPI widgets](https://www.figma.com/community/file/1528308765361625218/mobile-dashboard-charts-kpi-widgets). Observar como o kit trata número grande em largura de celular.

### 1.10 KPI de razão com numerador e denominador

**Descrição.** Taxa, custo por unidade ou conversão exibidos com as duas parcelas que os produzem. O percentual sozinho esconde o tamanho da amostra, e é assim que uma tela transforma 2 de 3 em 67% e vira decisão.

**Anatomia.** (1) Rótulo da razão. (2) Número da razão, formatado por `formatPercent` ou por `formatCurrencyCompact` quando é custo por unidade. (3) Linha do par, em 12 px `text-text-muted`: "7 de 28", "R$ 160,5 mil em 1.284 leads". (4) Opcionalmente a variação, que aqui sai em pontos percentuais. (5) Opcionalmente um aviso de amostra pequena quando o denominador fica abaixo do piso.

**Abordagem na stack:** `html-tailwind`, com o par vindo de `formatRateWithVolume(numerador, denominador)`, que já entrega `25,0% (7 de 28)` no padrão do Farol.

**Ponto delicado.** Três armadilhas. Primeira, **piso de denominador**: abaixo dele o cartão mostra o par e apaga a cor semântica da variação, porque não existe sinal para julgar. Segunda, **janelas diferentes no numerador e no denominador**: custo do mês dividido por leads da semana é um número sem significado, e essa é a forma mais comum de CPL errado; as duas parcelas declaram a mesma janela. Terceira, **denominador zero**: a razão não existe e o cartão escreve "sem base", não `0%` nem `NaN`. Quarta, menor, mas recorrente: razão de razões não se soma nem se tira média; o total da tela é calculado do somatório do numerador sobre o somatório do denominador, nunca da média dos cartões.

**Versões sugeridas.**

* **V1 Básico.** Taxa de comparecimento em agenda, com o par "112 de 140". Público Pré-vendas.
* **V2 Com variação em pontos.** CPL qualificado do mês com `-R$ 18,40` de variação e a nota "vs. mês anterior, mesma janela de 30 dias". Público Marketing.
* **V3 Caso denso do Farol.** Tela de Marketing com uma razão por plataforma (cinco plataformas fictícias), cada cartão com o par e o total da tela calculado por agregação das parcelas, mais a linha de leitura "o total não é a média dos cinco".
* **V4 Caso limite.** Plataforma com 3 leads no mês: mostra `33,3% (1 de 3)`, com o percentual em `text-text-muted` em vez da cor semântica, e a etiqueta "amostra pequena". Plataforma sem investimento no mês: "sem base", não `R$ 0,00` de CPL.

**Referências.**

* Catálogo: [FT Visual Vocabulary, README das nove categorias](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). Observar a distinção entre magnitude, que é número contado, e as categorias de taxa calculada; a razão pertence à segunda e por isso precisa do par.
* Catálogo: [Datawrapper Academy, células vazias exibidas como zero](https://www.datawrapper.de/academy/my-empty-cells-get-displayed-as-zeros-in-tooltips). Observar por que vazio virando zero é bug e não detalhe.
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar o par número mais palavra aplicado a proporções.
* Praticante: [Stacey Barr, 3 problemas dos semáforos de KPI](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/). Observar o argumento de que variação sem teste de sinal vira ruído promovido a decisão (não abriu: o servidor devolveu 403 nesta coleta).
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar variantes de cartão que já reservam linha para o denominador.

### 1.11 KPI com decomposição

**Descrição.** Número total com uma barra de composição fina no rodapé, mostrando de que partes ele é feito. Responde ao "quanto" e ao "de quê" no mesmo cartão, sem virar gráfico de pizza.

**Anatomia.** (1) Rótulo. (2) Número total. (3) Barra única horizontal de 8 a 10 px, segmentada, largura total do cartão, cores de `--chart-*` na ordem da convenção do Farol. (4) Legenda compacta em duas colunas com ponto de cor, nome e valor, no máximo 5 linhas. (5) Categoria de ausência sempre por último, em `--line-strong`, nunca dissolvida em "outros".

**Abordagem na stack:** `html-tailwind` com `flex` de larguras percentuais, ou `svg-puro` quando é preciso `stroke` de separação entre segmentos. Recharts aqui é desperdício: a barra única de composição é a especialidade do modelo 2.15 e o cartão só precisa da geometria.

**Ponto delicado.** Primeiro, **ordem estável**: se a ordem dos segmentos muda a cada atualização, a comparação entre períodos morre; a ordem vem da configuração da métrica, não do valor. Segundo, **segmento minúsculo**: fatia de 0,4% vira um fio de 1 px e o rótulo não cabe; o componente agrupa abaixo de um corte declarado e a legenda diz o corte. Terceiro, **contorno**: no tema escuro, segmentos vizinhos de tons próximos colam; um `stroke` de 1 px em `--surface-raised` separa sem inventar cor. Quarto, a soma dos segmentos tem de fechar com o número grande, inclusive depois do arredondamento dos rótulos.

**Versões sugeridas.**

* **V1 Básico.** Leads do mês decompostos por origem em quatro segmentos, com legenda de quatro linhas. Público Marketing.
* **V2 Com destaque.** O mesmo cartão com o segmento de mídia paga em cor e os demais em intensidades neutras, e a linha de leitura "mídia paga responde por 55,7% do volume". Público Marketing.
* **V3 Caso denso do Farol.** Custo total da área decomposto nas três camadas (marginal, direto, alocado), com a advertência de que o retorno muda de valor conforme a camada, e a etiqueta de procedência diferente por camada. Público Diretoria.
* **V4 Caso limite.** Composição com uma fatia de ausência grande: "sem origem declarada" com 31% do total, em `--line-strong`, por último, com rótulo explícito; e uma cauda de 9 origens pequenas agrupadas em "9 origens abaixo de 2%", com o corte escrito.

**Referências.**

* Catálogo: [FT Visual Vocabulary, categoria parte do todo](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). Observar a lista de formas de parte do todo e o lugar da barra única entre elas.
* Catálogo: [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Observar a lógica de faixas encostadas, que é a mesma geometria da barra segmentada.
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar o limite prático de categorias distinguíveis num elemento pequeno.
* Portal de design: [Figma Community, Dashboard Cards](https://www.figma.com/community/file/969677870366908785/dashboard-cards). Observar barras de composição dentro de cartões estreitos.

### 1.12 KPI com faixa de incerteza

**Descrição.** Número de cenário ou projeção exibido como **faixa**, não como ponto. O ponto médio publicado sozinho vira compromisso; a faixa publicada preserva a honestidade do modelo que a gerou. Modelo obrigatório na tela de Diretoria do Farol, onde cenário e meta convivem.

**Anatomia.** (1) Rótulo com a palavra que declara a natureza ("projeção", "cenário", "estimativa"). (2) A faixa escrita como número principal: "R$ 8,4 mi a R$ 10,1 mi". (3) Uma barra fina de intervalo com marca central, ou uma faixa sombreada, mostrando a largura relativa. (4) A premissa que gera a faixa, em uma linha. (5) Etiqueta PREMISSA ou DERIVADO.

**Abordagem na stack:** `svg-puro` para a barra de intervalo (retângulo claro da faixa mais traço central), com escala calculada em TypeScript. Quando a faixa acompanha uma série no tempo, o desenho vira `recharts-nativo` com `Area` de `dataKey` de par `[baixo, alto]` mais `Line` central, mas aí o visual já pesa mais que o número e migra para a família 05.

**Ponto delicado.** Primeiro, **a largura da faixa tem de ser proporcional**, senão o desenho mente sobre a incerteza; a escala precisa de um domínio declarado que não seja a própria faixa. Segundo, **o ponto central é opcional e perigoso**: se ele aparecer com peso igual ao da faixa, o leitor guarda o ponto e esquece o intervalo. Terceiro, **o rótulo do número principal fica longo** e quebra o cartão; a solução é reduzir a precisão da faixa (duas casas significativas bastam) antes de reduzir a fonte. Quarto, uma faixa sem a premissa escrita é pior do que um ponto, porque parece rigor sem ser.

**Versões sugeridas.**

* **V1 Básico.** Receita projetada do próximo ano em faixa, com a premissa "considerando o teto medido da pré-vendas". Público Diretoria.
* **V2 Com três cenários.** Faixa com três marcas (conservador, base, otimista) e o texto dizendo qual deles virou a meta, o que costuma ser a pergunta real da reunião.
* **V3 Caso denso do Farol.** Três cartões de faixa lado a lado para o mesmo cenário em três camadas de custo, mostrando que o retorno vale 2,60x, 1,08x ou 0,08x conforme a camada, cada cartão com a camada escrita no rótulo.
* **V4 Caso limite.** Faixa assimétrica e faixa que cruza zero: retorno projetado de `-0,3x a 1,4x`, com a marca do zero desenhada em `--line-strong` e o texto "o cenário admite resultado negativo".

**Referências.**

* Praticante: [SWD, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Observar as formas de mostrar intervalo sem assustar o público executivo (apareceu na busca; não aberto nesta coleta).
* Praticante: [FlowingData, Visualizing the Uncertainty in Data](https://flowingdata.com/2018/01/08/visualizing-the-uncertainty-in-data/). Observar o repertório de formas de incerteza e o custo de cada uma (apareceu na busca; não aberto nesta coleta).
* Catálogo: [FT Visual Vocabulary, README](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). Observar a categoria distribuição e o lugar das formas de intervalo.
* Portal de design: [Figma Community, KPI Charts](https://www.figma.com/community/file/1130917765288346079/kpi-charts). Observar tratamentos de faixa e marcador em componentes de cartão.

### 1.13 KPI com status (semáforo)

**Descrição.** O número acompanhado de um estado categórico: no alvo, em atenção, fora do alvo. A régua que produz o estado é uma decisão de negócio escrita, e o cartão tem de mostrar qual é. Sem isso o semáforo é opinião com aparência de medição.

**Anatomia.** (1) Rótulo. (2) Número. (3) Selo de status com **forma, ícone e palavra**, não só cor: círculo cheio mais `CircleCheck`, losango mais `TriangleAlert`, quadrado mais `CircleX`, do lucide-react, com o texto do estado ao lado. (4) A régua em uma linha: "alvo acima de 95%; atenção entre 85% e 95%". (5) Opcionalmente a distância até o próximo corte.

**Abordagem na stack:** `html-tailwind`. A função `statusDe(valor, regua, polaridade)` devolve `{ chave, rotulo, token, icone }` e é testável; o componente só pinta. Os tokens são `--positive`, `--warning` e `--negative`, e nunca `--chart-2` nem `--chart-4`, que repetem o hex de `--warning` e de `--positive` na paleta do Farol (regra COR-8).

**Ponto delicado.** Este é o modelo mais criticado da família, e por bons motivos. Primeiro, **vermelho e verde são indistinguíveis** para cerca de 1 em 12 homens; a crítica clássica é que um semáforo isolado ainda perde o contexto de posição que o semáforo de rua tem, então forma e palavra são obrigatórias, não enfeite. Segundo, **corte arbitrário**: 94,9% vira vermelho e 95,0% vira verde, e a diferença não existe no mundo; a distância até o corte, escrita, devolve a proporção ao leitor. Terceiro, **régua volátil**: régua que muda a cada trimestre destrói a comparação histórica e precisa de data de vigência. Quarto, **ruído promovido a decisão**: variação dentro da variabilidade normal do processo não deveria acender nada, e essa é a crítica de fundo de quem trabalha com controle de processo.

**Versões sugeridas.**

* **V1 Básico.** Cumprimento de SLA de primeiro contato com selo "no alvo", ícone e a régua escrita. Público Pré-vendas.
* **V2 Com distância até o corte.** O mesmo cartão marcando "atenção" e o texto "faltam 1,2 p.p. para voltar ao alvo", calculado do dado.
* **V3 Caso denso do Farol.** Grade de 9 filas de pré-vendas com selo por fila, ordenadas por severidade e não por nome, com uma legenda única da régua no topo da grade em vez de repetida em 9 cartões.
* **V4 Caso limite.** Três estados difíceis: valor exatamente no corte (regra de desempate escrita, "o corte pertence ao alvo"), régua ausente (selo neutro "sem régua definida", em `--text-muted`) e métrica sem polaridade (nenhum selo, porque não existe bom nem ruim).

**Referências.**

* Praticante: [Stacey Barr, 3 problemas dos semáforos tradicionais de KPI](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/). Observar o argumento sobre cortes arbitrários e sobre confundir variação normal com mudança real (não abriu: 403 nesta coleta; conteúdo conhecido pelo resumo da busca).
* Praticante: [Bernard Marr, como usar cores de semáforo e classificações RAG em painéis](https://bernardmarr.com/performance-reporting-how-to-use-traffic-light-colours-and-rag-ratings-in-dashboards/). Observar a defesa do formato e as condições que ele exige para funcionar.
* Praticante: [Smart Frames UI, Traffic Lights Out, Accessible Dashboards in](https://smart-frames.co.uk/2025/01/23/rethinking-rag-colours-in-business-intelligence-tools/). Observar as alternativas acessíveis de codificação de estado (apareceu na busca; não aberto nesta coleta).
* Praticante: [Kat Greenbrook, The end of traffic light dashboards](https://www.linkedin.com/pulse/end-traffic-light-dashboards-kat-greenbrook). Observar a crítica de que o semáforo isolado perde o contexto que o semáforo de rua tem (apareceu na busca; não aberto nesta coleta).
* Implementação: [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker). Observar como o estado por célula é modelado com cor mais dica de texto.
* Portal de design: [Dribbble, tag kpi-dashboard](https://dribbble.com/tags/kpi-dashboard). Observar quantas peças codificam estado só por cor, que é exatamente o que este modelo proíbe.

### 1.14 KPI com etiqueta de procedência

**Descrição.** Card de KPI que declara **de onde vem o número**: MEDIDO, DERIVADO, PREMISSA ou LACUNA. É uma regra local do Farol nascida de um caso concreto de planejamento em que uma premissa de planilha foi lida como medição e produziu um erro de oito vezes. Não é um enfeite de governança; é o que impede a tela de mentir com números redondos.

**Anatomia.** (1) Etiqueta pequena no topo do cartão, 11 px, em `--prov-medido`, `--prov-derivado`, `--prov-premissa` ou `--prov-lacuna`, com a palavra escrita. (2) Rótulo. (3) Número. (4) Contexto. (5) Uma linha de origem quando a etiqueta não é MEDIDO: "premissa da planilha de capacidade de 2026-08".

**Abordagem na stack:** `html-tailwind`. No Farol a etiqueta é responsabilidade do `VisualCard` e aparece uma vez por cartão (ANO-6); a versão do catálogo mostra o desenho para quem cola o KPI fora do wrapper, que é o caso da moldura `stage`.

**Ponto delicado.** Primeiro, **os tokens `--prov-*` são reservados** e não podem virar cor de série; a regra COR-8 vai além e afasta `--chart-2` e `--chart-4` de composições com até quatro categorias justamente para que uma fatia nunca pareça "medida" ao lado do selo. Segundo, **granularidade**: um cartão com número derivado de três fontes de procedências diferentes precisa da procedência mais fraca, não da mais forte; a regra é a do elo mais fraco, e ela tem de estar no seletor, não no componente. Terceiro, a etiqueta ocupa linha e, numa grade, todas as alturas precisam considerá-la mesmo quando um cartão é MEDIDO e a linha de origem não existe.

**Versões sugeridas.**

* **V1 Básico.** Agendas realizadas na semana com etiqueta MEDIDO e nada mais. Público Pré-vendas.
* **V2 Com origem escrita.** Teto de capacidade da esteira com etiqueta PREMISSA e a linha "premissa declarada; a medição da mesma janela deu 13,2".
* **V3 Caso denso do Farol.** Tela de Diretoria com seis cartões em que convivem MEDIDO (custo), DERIVADO (retorno por camada), PREMISSA (metas) e LACUNA (receita por origem), com as quatro etiquetas visíveis na mesma tela e um rodapé que explica a escala de confiança.
* **V4 Caso limite.** Número que mistura procedências: receita por origem calculada a partir de receita medida e de rótulo de origem incompleto; a etiqueta cai para LACUNA, o número aparece em `text-text-muted` e o texto diz qual parte falta.

**Referências.**

* Praticante: [Stacey Barr, 3 problemas dos semáforos tradicionais de KPI](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/). Observar a insistência em declarar a régua e a origem antes de julgar (não abriu: 403 nesta coleta).
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar o custo de acrescentar metadado visível a cada cartão e como agrupar para não poluir.
* Catálogo: [Datawrapper Academy, células vazias exibidas como zero](https://www.datawrapper.de/academy/my-empty-cells-get-displayed-as-zeros-in-tooltips). Observar o parentesco: declarar ausência é o caso extremo de declarar procedência.
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar onde cabe um selo pequeno sem competir com o número.

### 1.15 KPI indisponível (estado honesto)

**Descrição.** O cartão que diz que o número **não existe**, e por quê. É um modelo, não um erro de renderização. Em painel de protótipo com fontes desiguais, ele é o que separa "zero" de "não coletamos", e essa distinção muda decisão.

**Anatomia.** (1) Rótulo normal, com o mesmo peso dos outros cartões da grade. (2) No lugar do número, um traço longo ou a palavra "sem dado", em 30 px `text-text-muted`, mantendo a altura da linha do número para a grade não dançar. (3) Motivo em uma linha: "sem coleta nesta fonte", "coleta falhou em 2026-09-13", "métrica descontinuada". (4) Etiqueta LACUNA. (5) Opcionalmente a data da última medição válida, que costuma ser a informação mais útil do cartão.

**Abordagem na stack:** `html-tailwind`. A regra de ouro é que o cartão **ocupa exatamente o mesmo espaço** do cartão preenchido, com a mesma tipografia e o mesmo alinhamento de linha de base, para não abrir buraco na grade nem chamar mais atenção do que merece.

**Ponto delicado.** Primeiro e principal, **zero não é ausência**. O erro clássico, catalogado pela Datawrapper como bug de célula vazia exibida como zero, é o que produz gráficos com quedas a pique no último ponto porque o dado ainda não fechou. Segundo, **nunca mostrar `NaN`, `null`, `undefined`, `-` sozinho ou `0`**: cada um desses é uma leitura errada diferente. Terceiro, **o motivo tem de ser específico**; "erro ao carregar" não ajuda ninguém, "a fonte de mídia não expõe receita por origem" ajuda e vira item de backlog. Quarto, em série temporal com furo, a ausência é do ponto e não do cartão: o número existe, mas a sparkline quebra, e o rodapé declara quantos pontos faltam.

**Versões sugeridas.**

* **V1 Básico.** Receita por origem com "sem dado", motivo "origem não é carimbada na venda" e etiqueta LACUNA. Público Marketing.
* **V2 Com última medição.** AUM por carteira com "sem dado", motivo "depende de extração externa" e a linha "última medição válida: 2026-06-30". Público Diretoria.
* **V3 Caso denso do Farol.** Grade de oito cartões em que três estão indisponíveis por motivos diferentes (fonte inexistente, coleta falhou, métrica ainda não definida), todos com a mesma altura dos preenchidos e ordenados sem separação, para que a lacuna apareça no contexto em que é usada.
* **V4 Caso limite.** Zero verdadeiro ao lado de ausência no mesmo painel: um cartão com `0` em tipografia cheia e cor normal, com o texto "nenhuma venda de mídia paga no período", e ao lado um cartão "sem dado" em `text-text-muted`; a diferença tipográfica é o conteúdo do exemplo.

**Referências.**

* Catálogo: [Datawrapper Academy, células vazias exibidas como zero](https://www.datawrapper.de/academy/my-empty-cells-get-displayed-as-zeros-in-tooltips). Observar a recomendação de trocar nulo por "N/A" em vez de deixar virar zero.
* Catálogo: [Datawrapper Academy, dados irregulares em gráficos de linha](https://academy.datawrapper.de/article/321-patchy-data). Observar o tratamento de buraco na série e por que a linha deve quebrar.
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar a ideia de manter o ritmo visual da grade mesmo com conteúdo faltando.
* Portal de design: [Figma Community, Mobile Dashboard, charts e KPI widgets](https://www.figma.com/community/file/1528308765361625218/mobile-dashboard-charts-kpi-widgets). Observar que o kit entrega estados vazios como componente de primeira classe.

### 1.16 Grade de scorecards

**Descrição.** A mesma métrica repetida para muitas entidades, um cartão por entidade, tudo alinhado numa grade. É o modelo que responde "quem está bem e quem está mal" sem obrigar o leitor a abrir uma tabela. Cada cartão é pequeno: nome da entidade, valor, variação e, quando cabe, um microgrático.

**Anatomia.** (1) Nome da entidade em 12 px `text-text-secondary`, truncado com `title` completo. (2) Valor em 20 a 24 px, menor que o do cartão solitário porque aqui a comparação entre cartões pesa mais que cada número isolado. (3) Variação com polaridade. (4) Sparkline opcional de 40 px de altura. (5) Ordenação declarada no cabeçalho da grade, nunca implícita. (6) Um marcador comum de referência, mediana ou meta, repetido em todos os cartões na mesma posição.

**Abordagem na stack:** `html-tailwind` para a grade e os cartões, `recharts-nativo` para cada microgrático, ou `svg-puro` quando a grade passa de cerca de 12 cartões. O ponto de virada é medido, não estético: cada instância do Recharts carrega o próprio observador de redimensionamento, e uma grade de 24 cartões com gráfico acaba pagando isso em cada mudança de filtro. Uma polilinha em SVG puro, com a geometria calculada em TypeScript, custa quase nada e aceita a mesma escala compartilhada.

**Ponto delicado.** O erro central é **escala livre por cartão**. Tufte escreve exatamente sobre isso no ensaio de sparklines: o exemplo dos fundos mostra que normalizar cada série pelo próprio mínimo e máximo cria comparabilidade falsa, porque o olho lê as formas lado a lado como se estivessem na mesma régua. Numa grade de scorecards, ou todos os micrográficos dividem o mesmo domínio de eixo, ou o cartão escreve a faixa de cada um. Segundo ponto, **ordem estável**: reordenar por valor a cada atualização faz o mesmo executivo pular de lugar e destrói a memória espacial de quem abre o painel toda segunda. A ordem alfabética é menos útil e mais confiável; quando a ordenação é por valor, ela precisa estar escrita e ser a mesma em todas as sessões. Terceiro, **altura uniforme**: um cartão sem sparkline, porque a entidade é nova, não pode encolher; o espaço fica reservado com a mesma altura e o texto "sem histórico". Quarto, **n pequeno por entidade**: dividir 40 vendas entre 12 executivos produz taxas individuais que são ruído; nesse caso a grade mostra volume absoluto, não taxa.

**Versões sugeridas.**

* **V1 Básico.** Seis squads de pré-vendas com agendas realizadas na semana, ordem alfabética, sem microgrático. Público Pré-vendas.
* **V2 Com destaque.** A mesma grade com o squad do usuário em `--accent` e os demais em cinza, além de uma linha tracejada de mediana repetida em todos os micrográficos. Público Pré-vendas.
* **V3 Caso denso do Farol.** Vinte e quatro executivos fictícios com receita reconhecida no trimestre, variação contra o trimestre anterior e sparkline de 13 semanas, todos no mesmo domínio de eixo, com cabeçalho declarando "ordenado por receita, escala compartilhada de R$ 0 a R$ 1,2 mi".
* **V4 Caso limite.** Grade com três problemas simultâneos: um executivo que entrou no mês passado e não tem histórico, um com denominador de 4 oportunidades onde a taxa sai com o par, e um afastado, cujo cartão aparece em estado inativo em vez de sumir da grade.

**Referências.**

* Catálogo: [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/). Observar a sparkline como unidade repetível dentro de uma grade ou tabela (apareceu na busca; ao abrir nesta revisão, 403).
* Praticante: [Edward Tufte, Sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Observar o alerta sobre escala individual por série e a ideia de pequenos múltiplos empilhados para comparar dezenas de séries de uma vez.
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar o limite de 5 a 7 itens em memória ativa, que é o argumento para paginar ou agrupar a grade em vez de despejar 40 cartões.
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar que o kit trata o microgrático como bloco de tamanho fixo, 112 por 56 px, o que é o que garante altura uniforme na grade.

### 1.17 Tira de KPIs

**Descrição.** A linha de abertura de uma tela: de 3 a 6 cartões lado a lado que respondem, antes de qualquer gráfico, o estado do assunto daquela tela. Não é uma grade de scorecards, porque aqui cada cartão é uma métrica **diferente**; ali eram entidades diferentes na mesma métrica. A confusão entre os dois é frequente e produz tiras em que nada é comparável e tudo parece ser.

**Anatomia.** (1) Faixa horizontal com colunas de largura igual, `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4`. (2) Cartões com a mesma altura, calculada pelo cartão mais alto, não pelo conteúdo de cada um. (3) Período declarado **uma vez**, no cabeçalho da tira, quando é o mesmo para todos; quando diverge, cada cartão declara o seu e a tira não declara nada. (4) Ordem narrativa da esquerda para a direita: da causa para o efeito, ou do topo do funil para a base. (5) Opcionalmente o primeiro cartão em destaque, com o número maior e o fundo levemente elevado.

**Abordagem na stack:** `html-tailwind`. Grade com quebra por breakpoint, sem rolagem horizontal, e altura igualada por `items-stretch` mais `h-full` no cartão, nunca por altura fixa em pixels, que quebra quando um rótulo ocupa duas linhas.

**Ponto delicado.** Primeiro, **importância igual é o defeito**. O material do Nightingale é direto ao dizer que o problema não é o número exato de cartões e sim mostrar muitos visuais com peso idêntico ao mesmo tempo: o olho não tem por onde começar. A tira precisa de pelo menos uma assimetria, seja um cartão maior, seja um agrupamento com separador. Segundo, **a régua de 5 a 7**: acima disso a tira vira barra de status ilegível, e a saída é agrupar em duas tiras curtas com subtítulo, não espremer. Terceiro, **unidades misturadas**: moeda, contagem, percentual e tempo na mesma linha exigem que cada cartão traga a unidade colada ao número, porque o leitor varre a linha horizontalmente e carrega a unidade do cartão anterior por inércia. Quarto, **quebra no mobile**: seis cartões viram três linhas de dois, e a ordem narrativa precisa sobreviver à quebra, o que raramente acontece quando a ordem foi pensada só para a tela larga. Quinto, **linha de base**: cartões com e sem linha de variação desalinham os números; a solução é reservar a linha de variação em todos, preenchida com um traço quando não há comparação.

**Versões sugeridas.**

* **V1 Básico.** Três cartões na abertura de Comercial: receita reconhecida, negócios fechados e ticket médio, mesmo período no cabeçalho da tira.
* **V2 Com cartão primário.** A mesma tira com o cartão de receita ocupando duas colunas, número em 36 px e sparkline, enquanto os outros dois seguem no formato compacto. A assimetria é o que define por onde a leitura começa.
* **V3 Caso denso do Farol.** Abertura de Marketing com seis cartões, investimento, leads, CPL, leads qualificados, CPL qualificado e cobertura de origem, com quatro unidades diferentes, duas polaridades diferentes e o último cartão trazendo cobertura como percentual com o par entre parênteses.
* **V4 Caso limite.** Tira de seis em tela estreita: quebra em três linhas de dois, com o cartão de receita por origem em estado indisponível ocupando a mesma altura dos demais, e um cartão cujo rótulo tem duas linhas puxando a altura de toda a fileira.

**Referências.**

* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar o argumento contra visuais simultâneos de importância igual e o uso de tamanho e contraste como ordem de leitura.
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar a ideia de usar o número grande para enquadrar a história antes dos gráficos que a sustentam, que é exatamente o papel da tira no topo da tela.
* Catálogo: [shadcn/ui, galeria de gráficos](https://v3.shadcn.com/charts). Observar o padrão de cartão com cabeçalho de número e rodapé de tendência, que é a forma canônica da tira nessa stack.
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar os nove tipos de cartão e a existência de versão desktop de 388 px e móvel de 343 px, que é a régua de quebra da tira.

### 1.18 KPI hierárquico

**Descrição.** Um número principal explicado, no mesmo cartão, por dois ou três números filhos que o decompõem ou o dividem. Resolve a pergunta imediata que todo total provoca: "composto de quê". É o parente de cartão da família 19, cascata, e da família 12, hierarquia, mas fica aqui porque o protagonista continua sendo o número do topo.

**Anatomia.** (1) Rótulo e número principal no peso cheio da família, 30 px. (2) Uma régua fina horizontal separando o principal dos filhos. (3) Dois ou três filhos em linha, cada um com rótulo em 11 px e valor em 16 a 18 px, portanto visivelmente subordinados. (4) Participação de cada filho em percentual, opcional, em `text-text-muted`. (5) Quando os filhos não fecham o total, uma linha de resíduo nomeada, nunca omitida.

**Abordagem na stack:** `html-tailwind`. Nenhum gráfico. A tentação de desenhar uma barra empilhada minúscula aqui costuma piorar: com três componentes e uma barra de 240 px, o menor segmento vira um traço de 6 px sem rótulo possível. Se a composição precisa ser vista como forma, o modelo certo é 1.11, com barra empilhada de largura inteira, ou uma peça da família 02.

**Ponto delicado.** Primeiro, **os filhos precisam ter uma relação declarada com o pai**: somam ao pai, dividem o pai ou explicam o pai. São três relações diferentes e o cartão tem que dizer qual é. Receita igual a receita nova mais receita de carteira é soma. Ticket médio igual a receita dividida por negócios é divisão. Taxa de comparecimento explicada por agendas marcadas e realizadas é explicação. Misturar as três num cartão produz a impressão de que os filhos somam quando não somam. Segundo, **o resíduo**: quando a soma dos filhos dá 94% do pai, o cartão mostra "outros" ou "sem classificação" com os 6%, porque o buraco silencioso é o que faz alguém somar de cabeça e desconfiar do painel inteiro. Terceiro, **subordinação tipográfica**: se o filho tem o mesmo peso do pai, o leitor lê quatro KPIs independentes; a diferença de tamanho precisa ser de pelo menos um degrau da escala, e a cor do filho é `text-text-secondary`, não `text-text-primary`. Quarto, **profundidade**: filho de filho não cabe num cartão; a partir do segundo nível o assunto muda de família.

**Versões sugeridas.**

* **V1 Soma.** Receita reconhecida no mês com dois filhos, clientes novos e carteira, somando exatamente o pai, cada um com a participação em percentual. Público Comercial.
* **V2 Divisão.** Ticket médio como pai, com os filhos receita e número de negócios, deixando o operador de divisão explícito entre eles em `text-text-muted`. Público Comercial.
* **V3 Caso denso do Farol.** Cartão de handoff na tela de Pré-vendas com o número principal de agendas realizadas e três filhos, agendas marcadas, não comparecimento e remarcações, mais a linha de resíduo "sem registro de desfecho", que costuma ser o maior aprendizado do cartão.
* **V4 Caso limite.** Pai com filhos que não fecham: leads por origem em que 18% ficam em "origem não carimbada", com o resíduo em `text-text-muted`, etiqueta LACUNA no cartão e a frase que explica que o carimbo se perde na página de destino.

**Referências.**

* Catálogo: [FT Visual Vocabulary, categorias e famílias](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). Observar a categoria part-to-whole e os tipos listados nela, coluna empilhada, barra proporcional, pizza, rosca, treemap e cascata, para saber quando o cartão deixa de bastar e o assunto vira gráfico.
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar a ideia de dosar sinais por tela: o KPI hierárquico é uma forma de responder a segunda pergunta sem gastar um visual inteiro.
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar o par número mais palavra aplicado ao filho, que sem rótulo curto vira enigma.
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar a linha de ações opcional no rodapé do cartão, que é onde o detalhamento completo do pai deveria ficar em vez de tentar caber nos filhos.

### 1.19 KPI com tracker de estado

**Descrição.** Um número acompanhado de uma fita horizontal de células, uma por período, cada célula pintada pelo estado daquele período. É o formato que as ferramentas de monitoramento consagraram para disponibilidade e que serve igualmente bem para cumprimento de SLA, presença de coleta e dias com ou sem venda. O número responde "quanto"; a fita responde "quando falhou e se falha em bloco ou espalhado", que é a pergunta que o percentual esconde.

**Anatomia.** (1) Rótulo e número principal, normalmente o percentual de períodos dentro da régua. (2) Fita de células de altura fixa, na casa de 24 a 32 px, com folga mínima entre elas. (3) Escala de estado com poucas categorias: dentro, fora, parcial e sem dado. (4) Dica por célula com a data e o valor daquele dia. (5) Marcadores de extremidade em texto, "há 30 dias" à esquerda e "hoje" à direita, porque sem eles ninguém sabe qual ponta é a recente.

**Abordagem na stack:** `html-tailwind` para a fita, com um `flex gap-px` e cada célula como `div` de `flex-1`, ou `svg-puro` quando as células precisam de raio, faixas e rótulo de eixo. Recharts não entra aqui: um `BarChart` de 30 barras iguais custa mais e entrega menos controle de acessibilidade que 30 elementos com `title` e `aria-label`.

**Ponto delicado.** Primeiro, **densidade contra largura**. A implementação de referência da Tremor resolve isso reduzindo o número de células visíveis por breakpoint, não encolhendo as células até virarem fios; a regra prática é um piso de largura por célula, e abaixo dele a fita agrega de dia para semana em vez de continuar espremendo. Segundo, **cor não pode ser a única pista**: a fita é um caso extremo disso, porque não há rótulo nenhum; por isso a dica é obrigatória, o cartão traz o resumo em texto, e o estado "sem dado" usa cinza neutro com padrão de traço, distinto do vermelho de falha. Terceiro, **ausência contra falha**: um dia sem coleta não é um dia fora do SLA, e tratar os dois com a mesma cor inventa incidentes. Quarto, **fim de semana e feriado** em métrica comercial: a fita de dias corridos mostra sábado e domingo como buracos permanentes; ou a fita é de dias úteis e diz isso, ou os não úteis vão em cinza claro declarado na legenda. Quinto, **teto de células**: acima de cerca de 90 a fita vira textura e a leitura muda de família, passando para 15, mapa de calor e calendário.

**Versões sugeridas.**

* **V1 Básico.** Cumprimento de SLA de primeiro contato nos últimos 30 dias, número em percentual e fita de 30 células em dois estados. Público Pré-vendas.
* **V2 Com resumo escrito.** A mesma fita com a frase "28 de 30 dias dentro do SLA; as duas falhas foram consecutivas em 2026-08-19 e 2026-08-20", que é o que o percentual sozinho não conta.
* **V3 Caso denso do Farol.** Noventa dias de disponibilidade de coleta das quatro fontes de mídia, quatro fitas empilhadas com o mesmo eixo temporal, quatro estados por célula e um cartão de número por fonte à esquerda.
* **V4 Caso limite.** Fita com três semanas sem coleta no meio da série, fins de semana marcados como não aplicáveis e o número principal recalculado sobre o denominador de dias válidos, com o par escrito, "93,1% (27 de 29 dias válidos)".

**Referências.**

* Catálogo: [Tremor, componente Tracker](https://www.tremor.so/docs/visualizations/tracker). Observar a anatomia mínima, célula com cor e dica, a cor padrão cinza quando o dado não define estado, e a redução de células por breakpoint em vez de encolhimento infinito.
* Catálogo: [Data Viz Project, Win Loss Sparkline](https://datavizproject.com/data-type/win-loss-sparkline/). Observar o parentesco direto: a fita de estado é uma sparkline de ganho e perda com célula em vez de traço (apareceu na busca; não aberto).
* Praticante: [Edward Tufte, Sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Observar a ideia de faixa de referência em cinza e o valor de ancorar o gráfico ao número do extremo direito.
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar a variação positiva e negativa de cada microgrático, que é o equivalente de estado da fita em versão contínua.

### 1.20 KPI com posição no ranking

**Descrição.** O número acompanhado da colocação dentro de um grupo de pares. Serve quando o valor absoluto diz pouco e o que importa é a posição relativa: um executivo com R$ 380 mil no trimestre só significa alguma coisa contra o que os outros fizeram. É o cartão que costuma abrir a visão individual dentro de um painel de equipe.

**Anatomia.** (1) Rótulo e número da métrica. (2) Colocação escrita por extenso com o tamanho do grupo, "3º de 12", nunca "3º" sozinho. (3) Variação de posição contra o período anterior, com ícone e a âncora, "subiu 2 posições vs. o trimestre anterior". (4) Distância até uma referência, líder ou mediana, em valor e não só em posição. (5) Opcionalmente uma régua horizontal minúscula com um marcador do indivíduo e outro da mediana do grupo.

**Abordagem na stack:** `html-tailwind` para todo o texto, mais `svg-puro` para a régua de posição, que é uma linha com dois ou três marcadores e nada mais. Recharts não agrega nada num desenho de 4 elementos com coordenadas triviais.

**Ponto delicado.** Primeiro, **posição é ordinal e esconde a distância**. Segundo e terceiro lugares podem estar separados por R$ 2 mil ou por R$ 300 mil, e o cartão que mostra só a colocação faz os dois casos parecerem iguais. Por isso a distância em valor é praticamente obrigatória. Segundo, **grupo pequeno**: numa equipe de 4 pessoas, ser 3º é quase ruído, e a posição muda de lugar com uma venda. Abaixo de cerca de 5 pares, o cartão mostra o valor contra a mediana e omite a colocação. Terceiro, **empates**: duas pessoas com o mesmo valor precisam da mesma posição e o cartão precisa dizer "3º de 12, empatado", senão a ordenação do banco decide arbitrariamente quem é terceiro e o painel vira discussão. Quarto, **a variação de posição é enganosa quando o grupo muda de tamanho**: subir de 8º para 6º porque duas pessoas saíram não é melhora, e o cartão precisa comparar grupos comparáveis ou declarar a mudança. Quinto, **efeito sobre o comportamento**: ranking individual publicado é uma decisão de gestão, não de visualização, e no protótipo vale usar rótulos genéricos de executivo fictício.

**Versões sugeridas.**

* **V1 Básico.** Receita reconhecida no trimestre de um executivo fictício com "3º de 12" embaixo do número. Público Comercial.
* **V2 Com distância.** O mesmo cartão com "R$ 84 mil abaixo do 1º" e "R$ 120 mil acima da mediana", que é o que transforma a colocação em informação acionável.
* **V3 Caso denso do Farol.** Cartão de perfil do executivo com quatro posições diferentes na mesma peça, receita, win rate, tempo médio de fechamento e volume de oportunidades, cada uma com o tamanho do grupo e cada uma com polaridade própria, porque tempo menor é melhor.
* **V4 Caso limite.** Grupo de 4 pessoas com dois empates: o cartão troca a colocação por uma régua de posição com marcadores, escreve "empatado em 2º" e explica que com 4 pares a colocação é instável.

**Referências.**

* Catálogo: [FT Visual Vocabulary, categorias e famílias](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). Observar a categoria ranking e seus tipos, barra ordenada, coluna ordenada, símbolo proporcional ordenado, dot strip plot, slope e lollipop, para saber para onde o assunto migra quando o grupo inteiro precisa aparecer.
* Catálogo: [Nivo, Bump chart](https://nivo.rocks/bump/). Observar a diferença entre mostrar a posição, que é o bump, e mostrar a posição com o valor, que é o area bump; a mesma escolha se repete dentro do cartão.
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar o uso de tamanho e contraste para dizer o que se lê primeiro, aqui aplicado ao conflito entre o valor e a colocação.
* Portal de design: [Dribbble, etiqueta de cartões de KPI](https://dribbble.com/tags/kpi-cards). Observar como as peças resolvem a linha de colocação sem transformar o cartão numa medalha (apareceu na busca; não aberto).

### 1.21 Card de exceção

**Descrição.** Um cartão que só existe quando uma régua escrita é estourada. Não mostra uma métrica contínua; mostra a contagem de casos fora da régua, o critério e o caminho para agir. É o oposto do KPI de acompanhamento: o KPI está sempre lá e o card de exceção deveria, na maior parte dos dias, não estar.

**Anatomia.** (1) Ícone de atenção do lucide-react, 16 px, na cor semântica. (2) Contagem de casos em peso alto, mas um degrau abaixo do número dos KPIs vizinhos, porque exceção não pode dominar a tela. (3) Frase do critério, obrigatória e literal: "oportunidades sem movimento há mais de 30 dias". (4) Severidade, quando existe mais de um nível. (5) Ação: link ou botão que abre a lista dos casos, nunca só o número. (6) Data da avaliação da régua.

**Abordagem na stack:** `html-tailwind`. Borda esquerda de 2 px na cor semântica, fundo do cartão igual ao dos demais. O contrato do Farol proíbe texto semântico sobre fundo tingido pela regra COR-7, então a cor vive na borda e no ícone, e o texto fica em `text-text-primary`.

**Ponto delicado.** Primeiro, **o buraco na grade**. Um cartão que aparece e some reorganiza a tira inteira e faz o leitor perder a posição dos outros. Duas saídas honestas: reservar o espaço com o estado calmo, "nenhum caso fora da régua", ou tirar as exceções da grade e colocá-las numa faixa própria acima dela, que colapsa quando está vazia. A segunda é preferível quando as exceções variam em número. Segundo, **a régua tem que estar escrita no cartão**. Este é o mesmo defeito que a literatura de semáforos denuncia há anos: um sinal vermelho sem o corte declarado não é informação, é opinião com cor. Terceiro, **fadiga de alerta**: se o cartão aparece todo dia, ele deixa de ser lido; a régua está errada e precisa ser recalibrada, não repintada. Quarto, **exceção de dado não é exceção de negócio**: "a coleta de mídia falhou ontem" e "12 oportunidades paradas" são cartões de naturezas diferentes e não podem dividir a mesma faixa, senão o operador aprende a ignorar as duas. Quinto, **a contagem precisa do denominador** quando a base é pequena: "3 paradas" assusta diferente se o pipeline tem 12 ou 400 oportunidades.

**Versões sugeridas.**

* **V1 Básico.** "7 oportunidades sem movimento há mais de 30 dias", com a régua escrita e um link para a lista. Público Comercial.
* **V2 Com severidade e denominador.** O mesmo cartão com dois níveis, 7 acima de 30 dias e 2 acima de 90, mais o denominador "de 143 oportunidades abertas" e a data da avaliação.
* **V3 Caso denso do Farol.** Faixa de exceções da tela de Pré-vendas com quatro cartões simultâneos, fila acima do teto de capacidade, SLA de primeiro contato estourado, agendas sem desfecho registrado e leads sem dono, cada um com régua própria e ordenados por severidade, não por ordem de cálculo.
* **V4 Caso limite.** Estado calmo e falha de coleta na mesma faixa: um cartão neutro dizendo "nenhum caso fora das réguas em 2026-09-14" e, separado por um divisor, um cartão de saúde de dados dizendo que a régua de mídia não pôde ser avaliada porque a fonte não atualizou, que é diferente de dizer que está tudo bem.

**Referências.**

* Praticante: [Stacey Barr, 3 problemas dos semáforos tradicionais de KPI](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/). Observar a exigência de declarar o corte e a crítica ao sinal que reage a ruído de período único (não abriu: 403 nesta coleta e na anterior).
* Praticante: [Kat Greenbrook, o fim dos painéis de semáforo](https://www.linkedin.com/pulse/end-traffic-light-dashboards-kat-greenbrook). Observar o argumento de que o sinal substitui a explicação em vez de acompanhá-la (apareceu na busca; não aberto).
* Catálogo: [Datawrapper Academy, dados irregulares](https://academy.datawrapper.de/article/321-patchy-data). Observar por que falha de coleta merece tratamento próprio e não pode ser lida como resultado (apareceu na busca, que também devolveu o endereço novo www.datawrapper.de/academy/patchy-data; não aberto).
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar a linha de ações no rodapé do cartão, que é o lugar natural do "ver os 7 casos".

### 1.22 KPI com ritmo até a meta

**Descrição.** O cartão de progresso acrescido da variável que o 1.6 ignora: **o tempo**. Mostra quanto do período já passou ao lado de quanto da meta já foi feito, e com isso responde a pergunta que interessa em meio de trimestre, que não é "quanto falta" e sim "no ritmo atual, chega". É o modelo de fechamento de período por excelência.

**Anatomia.** (1) Realizado como número principal. (2) Trilho horizontal com o realizado preenchido. (3) Um marcador vertical na meta, no fim do trilho. (4) Um segundo marcador, visualmente diferente do primeiro, na posição do **ritmo esperado**, isto é, a fração do período já decorrida. (5) Frase de veredito com a projeção e o gap: "no ritmo atual, 92% da meta; faltam R$ 140 mil". (6) Declaração do período: "18 de 63 dias úteis decorridos". (7) Etiqueta de procedência DERIVADO na projeção.

**Abordagem na stack:** `svg-puro` para o trilho com os dois marcadores, `html-tailwind` para todo o resto. O trilho é um retângulo de fundo, um retângulo de preenchimento e duas linhas verticais; a geometria é uma regra de três em TypeScript. Montar isso como `BarChart` do Recharts com `ReferenceLine` funciona, mas paga layout, escala e margem para desenhar quatro formas.

**Ponto delicado.** Primeiro, **a projeção linear é uma premissa, e quase sempre falsa em vendas**. Receita comercial concentra no fim do mês e do trimestre; projetar linearmente no dia 10 produz pessimismo garantido e queima a credibilidade do cartão. As saídas são três: usar dias úteis em vez de dias corridos, usar a curva histórica de acumulação do mesmo período do ano anterior, ou declarar em texto que a projeção é linear e por isso é piso. O que não se pode é apresentar a projeção com a mesma autoridade do realizado. Segundo, **os dois marcadores precisam ser distinguíveis sem cor**: meta é linha cheia até o topo do trilho; ritmo esperado é linha tracejada mais curta, com rótulo. Confundir os dois inverte o veredito. Terceiro, **metas sazonais e com degrau** quebram o modelo por completo; nesse caso o cartão vira gráfico da família 13 ou 05, com a curva de meta acumulada desenhada. Quarto, **já bateu a meta**: o trilho precisa de tratamento explícito acima de 100%, com o excedente em segmento distinto e o número dizendo "118% da meta", em vez de uma barra estourada. Quinto, **período que ainda nem começou**: no primeiro dia, dividir por zero de dias decorridos tem que devolver "sem ritmo medido", não `Infinity`.

**Versões sugeridas.**

* **V1 Básico.** Receita do trimestre com trilho, marcador de meta e a frase "58% da meta com 60% do trimestre decorrido". Público Comercial.
* **V2 Com marcador de ritmo e veredito.** O mesmo cartão com o marcador tracejado de ritmo esperado, o veredito "levemente atrás" em texto e a etiqueta DERIVADO na projeção.
* **V3 Caso denso do Farol.** Tela de Diretoria com três metas empilhadas no mesmo eixo horizontal, receita, negócios fechados e agendas, cada uma com o próprio realizado e todas compartilhando o mesmo marcador de tempo decorrido, o que deixa ver de relance qual das três está fora do ritmo.
* **V4 Caso limite.** Dois cartões difíceis lado a lado: uma meta já superada em 118%, com o excedente desenhado além do marcador, e uma meta sazonal em que a projeção linear diz 64% mas a curva histórica do mesmo período diz 91%, com as duas leituras escritas e a linear marcada como piso.

**Referências.**

* Catálogo: [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html). Observar os três componentes, medida principal, medida comparativa e faixas qualitativas, e a recomendação de no máximo cinco faixas; o marcador de ritmo é uma segunda medida comparativa e por isso precisa de forma distinta.
* Praticante: [Stephen Few, especificação de desenho do bullet graph](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf). Observar as faixas em tons de um mesmo matiz e o argumento contra o ponteiro decorativo (PDF aberto; texto lido por extração local).
* Praticante: [SWD, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Observar o tratamento de projeção como faixa e não como ponto, que é a ressalva que o veredito do cartão precisa carregar (apareceu na busca; não aberto).
* Catálogo: [Datawrapper Academy, o que considerar ao criar gráficos de linha](https://academy.datawrapper.de/article/129-what-to-consider-when-creating-line-charts). Observar a estrutura do guia, que separa o que o gráfico mostra bem do que ele leva o leitor a concluir errado; a mesma disciplina vale para a projeção do cartão (apareceu na busca; não aberto).

### 1.23 KPI clicável com drill

**Descrição.** O cartão que abre o detalhe por trás do número: a lista de oportunidades, a quebra por motivo, a fila de trabalho. Responde à pergunta que todo número de painel provoca em reunião, "de onde veio isso", sem obrigar ninguém a trocar de tela. A variante "com link de ação" é uma das 23 que a Tremor publica nos blocos de KPI, com o rodapé "ver mais" como afordância explícita.

**Anatomia.** (1) Rótulo, número e contexto como no 1.2. (2) Afordância visível e constante: ícone `ChevronRight` ou `ArrowUpRight` do lucide-react em 16 px no canto, ou rodapé escrito "ver 143 oportunidades". (3) Estado de passagem do cursor que muda só a borda (`hover:border-line-strong`), sem mexer no layout. (4) Foco de teclado visível (`focus-visible:ring-2`). (5) Destino que herda o período e os filtros da tela, escrito no cabeçalho da gaveta.

**Abordagem na stack:** `html-tailwind`. O cartão é um `<article class="relative">` com **um único** `<a>` ou `<button>` cujo pseudoelemento cobre a superfície inteira (`after:absolute after:inset-0`), o padrão de link esticado. Embrulhar o cartão todo num `<button>` quebra quando há ícone de ajuda ou dica dentro, porque elemento interativo aninhado é HTML inválido. A sparkline, se houver, recebe `pointer-events-none` para o clique atravessar.

**Ponto delicado.** Primeiro e decisivo, **o detalhe tem de fechar com o número**. Se o cartão diz 143 e a gaveta lista 139, o drill destrói a confiança no painel inteiro. A contagem e a lista saem da mesma definição de métrica (mesmo período, mesmos filtros, mesma regra de deduplicação), e quando alguma linha é excluída a gaveta escreve quantas e por quê. Segundo, **afordância inconsistente**: se só metade dos cartões da tira abre detalhe e todos parecem iguais, o leitor clica nos errados e desiste; a regra é uniforme por tira ou declarada pelo ícone. Terceiro, **teclado e retorno de foco**: Enter abre, Esc fecha e o foco volta ao cartão de origem. Quarto, **toque**: afordância que só aparece na passagem do cursor não existe no celular, então o ícone é permanente. Quinto, **exportação**: no PDF o link some, e o rodapé precisa continuar fazendo sentido como texto.

**Versões sugeridas.**

* **V1 Básico.** Oportunidades abertas no funil, cartão inteiro clicável com `ChevronRight`, abrindo a gaveta com a lista no mesmo período. Público Comercial.
* **V2 Com anotação de fechamento.** Perdas do mês com o rodapé "ver por motivo"; a gaveta abre já agrupada por motivo e escreve "143 de 143 perdas classificadas", o que prova ao leitor que o detalhe é o mesmo número. Público Comercial.
* **V3 Caso denso do Farol.** Tira de seis cartões de Pré-vendas em que cada um leva a uma fila de trabalho diferente (entradas sem dono, agendas sem desfecho, SLA estourado), preservando filtros e período no endereço do destino, com foco visível e retorno do foco ao fechar.
* **V4 Caso limite.** Três estados na mesma tira: número zero (a gaveta abre vazia com "nenhuma oportunidade parada pela régua de 30 dias"), cartão LACUNA (sem afordância e sem clique, porque não há linha para mostrar) e drill que não fecha ("139 linhas; 4 excluídas por duplicidade").

**Referências.**

* Implementação: [Tremor Blocks, KPI cards](https://blocks.tremor.so/blocks/kpi-cards). Observar a variante com link de ação no rodapé e a de detalhamento por categoria, que são as duas formas de convite ao drill (aberto).
* Implementação: [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist). Observar como `onValueChange` transforma cada barra em botão com destaque de passagem e como `href` por item vira link, que é o mesmo contrato do cartão clicável (aberto).
* Catálogo: [Highcharts Dashboards, componente KPI](https://www.highcharts.com/docs/dashboards/kpi-component). Observar que o KPI sincroniza com os outros componentes do painel; o drill pode ser filtro cruzado em vez de navegação (aberto).
* Praticante: [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/). Observar a ordem de leitura do alto à esquerda para baixo à direita: o cartão é a porta, o detalhe vem depois (aberto).
* Portal de design: [Figma Community, KPI Dashboard with micro interactions](https://www.figma.com/community/file/1577537133533397367/kpi-dashboard-with-micro-interactions). Observar os estados de passagem do cursor e a transição de valor (não abriu nesta coleta, HTTP 403; registrado como aberto via leitor em `00_portais-de-design.md`).

### 1.24 KPI em texto corrido

**Descrição.** O número mora dentro de uma frase: "a pré-vendas marcou **214 agendas** em ago/2026, **12% acima** de julho". É o dataword de Tufte e o simple text de Knaflic levados para a interface. Serve para o resumo que abre uma tela, para o sumário executivo da Diretoria e para qualquer peça que vai ser lida em voz alta ou colada num e-mail.

**Anatomia.** (1) Frase de uma a duas linhas. (2) Números em `kpi-number font-semibold text-text-primary`, o resto em `text-text-secondary`. (3) Unidade colada ao número, repetida na frase. (4) Período e âncora da comparação dentro da própria frase. (5) Opcionalmente um minigráfico com a altura da linha de texto, ao lado do número.

**Abordagem na stack:** `html-tailwind` para a frase e `svg-puro` para o minigráfico em linha: `<svg class="inline-block h-[1em] w-12 align-[-0.125em]" aria-hidden="true">` com uma `polyline` cuja geometria sai de uma função TypeScript. A frase é **gerada por função** a partir do dado, com os formatadores centrais; nunca texto digitado.

**Ponto delicado.** Primeiro, **a frase envelhece**: texto escrito à mão fica errado na próxima carga. O verbo também é dado: "subiu", "caiu" ou "ficou estável" dependem do sinal, da polaridade e de um corte de estabilidade declarado. Segundo, **gramática de borda em português**: "1 agenda", "2 agendas", "nenhuma agenda"; a função cobre singular, plural e zero, senão aparece "0 agendas, +Infinity%". Terceiro, **precisão**: a Datawrapper recomenda não acrescentar precisão desnecessária e repetir a unidade junto do número ("3,4% desempregados"); no Farol isso é `formatCurrencyCompact` e unidade por extenso. Quarto, **palavra colorida como legenda** de um gráfico abaixo precisa também de negrito, porque cor sozinha não carrega o destaque (COR-2). Quinto, **teto de números**: acima de dois ou três por frase o texto vira enigma e o assunto é tabela.

**Versões sugeridas.**

* **V1 Básico.** Resumo de abertura da tela de Comercial: "em set/2026 foram reconhecidos **R$ 1,24 mi**, **8% acima** de agosto". Público Comercial.
* **V2 Com dataword.** Frase de Marketing com a sparkline de 12 meses do CPL qualificado em linha, da altura do texto, e o ponto final destacado na mesma cor do número, como Tufte propõe. Público Marketing.
* **V3 Caso denso do Farol.** Sumário executivo da Diretoria com três frases geradas (receita contra meta, demanda contra teto, cenário em faixa), com a faixa escrita "entre R$ 8,4 mi e R$ 10,1 mi" em vez do ponto médio e a procedência entre parênteses quando o número não é MEDIDO.
* **V4 Caso limite.** A mesma função de frase diante de zero ("nenhuma venda veio de mídia paga"), de um ("1 agenda sem desfecho"), de variação dentro do corte ("ficou estável, 0,4%"), de base anterior zero ("sem base de comparação em julho") e de ausência ("a receita por origem não é coletada").

**Referências.**

* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Observar a definição de dataword, o gráfico do tamanho de uma palavra que aparece onde números e texto aparecem (aberto).
* Praticante: [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text). Observar o texto que nivela o público antes do gráfico, que acrescenta credibilidade (aberto).
* Catálogo: [Datawrapper, text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/). Observar a regra de não acrescentar precisão, de repetir a unidade no texto e de conduzir o olho por tamanho, estilo e cor (aberto).
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar a frase de que o período de comparação é a parte que as equipes esquecem, que vale igual para a frase gerada (aberto).

### 1.25 KPI com par de indicadores

**Descrição.** Dois números no mesmo cartão ligados por uma relação de **efeito e contraefeito**: volume de agendas e taxa de comparecimento, leads e percentual qualificado, fechamentos e desconto médio. A ideia vem da gestão industrial: toda métrica perseguida sozinha é otimizada à custa de outra, e o par torna esse custo visível na mesma leitura. É a resposta de desenho à formulação popular da lei de Goodhart, "quando uma medida vira meta, deixa de ser uma boa medida"; o exemplo clássico citado nessa literatura é o hospital que reduz o tempo de internação e aumenta a reinternação.

**Anatomia.** (1) Título do par, que nomeia a relação: "Agendas e comparecimento". (2) Indicador de efeito no peso de KPI. (3) Contraindicador um degrau abaixo, ligado ao primeiro por um conector escrito ("com", "ao custo de"). (4) Delta de cada um, cada qual com a **própria polaridade**. (5) Veredito combinado em uma linha, calculado: "volume subiu, qualidade caiu". (6) Opcionalmente um quadrante minúsculo de 48 px com a seta do período anterior para o atual.

**Abordagem na stack:** `html-tailwind`. A leitura sai de uma função pura `leituraDoPar(deltaA, polaridadeA, deltaB, polaridadeB, corte)` que devolve um de cinco vereditos (os quatro quadrantes e "sem mudança relevante"). O quadrante opcional é `svg-puro`, com duas marcas e uma seta; montar isso em `ScatterChart` é desproporcional.

**Ponto delicado.** Primeiro, **o par é declarado, não montado**: juntar duas métricas quaisquer no mesmo cartão sugere causalidade; o par vive no registro de métricas, com a relação escrita. Segundo, **defasagem**: o volume é lido na hora, a qualidade só se conhece depois (a agenda marcada hoje comparece daqui a dez dias). Comparar agendas desta semana com o comparecimento desta semana mistura coortes; o cartão usa coorte (agendas marcadas na semana e o desfecho delas) e declara "coorte ainda aberta". Terceiro, **ruído**: pequenas oscilações dos dois produzem vereditos alternados toda semana; abaixo de um corte de estabilidade, o veredito é "sem mudança relevante". Quarto, **cores opostas no mesmo cartão** parecem contradição; é o veredito em texto que resolve a leitura, e por isso ele é obrigatório. Quinto, **três já não é par**: com uma terceira medida o assunto vira 1.3 ou 1.18.

**Versões sugeridas.**

* **V1 Básico.** Agendas marcadas na semana e taxa de comparecimento da mesma coorte, com o conector "com". Público Pré-vendas.
* **V2 Com veredito.** Leads do mês `+34%` e percentual qualificado `-9 p.p.`, com a linha "o volume subiu à custa da qualidade", calculada. Público Marketing.
* **V3 Caso denso do Farol.** Tela de Comercial com três pares (fechamentos e desconto médio; velocidade de handoff e taxa de aceite pelo executivo; funil criado e idade média das oportunidades), cada um com coorte declarada e veredito próprio.
* **V4 Caso limite.** Coorte aberta (o comparecimento só fecha em 14 dias: contraindicador marcado "parcial" e veredito suprimido), volume zero (taxa "sem base") e os dois indicadores dentro do corte ("sem mudança relevante", sem cor).

**Referências.**

* Praticante: [Nightingale, Dashboard Psychology, Effective Feedback in Data Design](https://nightingaledvs.com/dashboard-psychology-effective-feedback-in-data-design/). Observar o conselho de pôr dois números lado a lado para provocar comparação e o papel do referencial, que diz tanto quando agir quanto quando parar de se preocupar com uma métrica (aberto).
* Praticante: [Wikipedia, Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law). Observar as formulações de Goodhart e de Strathern e os exemplos de medida que se degrada sob pressão, que são o motivo de existir do par (aberto; a página não trata de contramedidas).
* Praticante: Andy Grove, *High Output Management* (1983), origem da ideia de indicadores pareados. Sem link: a [página do livro na Wikipedia](https://en.wikipedia.org/wiki/High_Output_Management) foi aberta e não menciona o conceito; nenhuma fonte aberta nesta sessão o confirma, ver lacunas.
* Portal de design: [Behance, Analytics Metric Cards UI](https://www.behance.net/gallery/255429155/Analytics-Metric-Cards-UI). Observar nas imagens se algum cartão combina duas medidas com a relação escrita; a página não traz texto (registrado como aberto em `00_portais-de-design.md`).

### 1.26 KPI com bandline

**Descrição.** Sparkline com faixas horizontais de fundo que mostram a distribuição histórica da métrica, a proposta de Stephen Few de 2013 para devolver à sparkline a informação de magnitude que Tufte deixava para o texto. A linha dos últimos 30 dias corre sobre as faixas calculadas em seis meses ou um ano, e o leitor vê de relance se o nível atual é baixo, típico ou alto **para aquela métrica**, sem ler um único rótulo. Few argumenta que rótulo de mínimo e máximo exige leitura verbal, que é lenta, e que num painel a magnitude precisa ser visual.

**Anatomia.** (1) Rótulo e número. (2) Sparkline da janela recente. (3) Três faixas de fundo em intensidades de um mesmo tom: a mais clara no primeiro quartil, a média na amplitude interquartil e a mais escura no quarto quartil. (4) Linha fina da mediana dentro da faixa do meio, na cor do cartão. (5) Valores atípicos marcados individualmente, com o critério de 1,5 vez a amplitude interquartil: ponto cheio para atípico baixo, ponto vazado com borda para atípico alto. (6) Rodapé com a janela de referência: "faixas: distribuição de 26 semanas".

**Abordagem na stack:** `recharts-custom`. `LineChart` com três `ReferenceArea` de `y1` a `y2` para as faixas, um `ReferenceLine` na mediana e uma `Line` com `dot` como função de renderização que só desenha os atípicos. Os quartis saem de uma função TypeScript pura com método declarado (interpolação linear) sobre a **janela de referência**, nunca sobre a janela visível. Numa grade com mais de cerca de 12 cartões, a mesma geometria em `svg-puro` custa bem menos.

**Ponto delicado.** Primeiro, **circularidade**: quartis calculados só sobre os pontos visíveis fazem a linha preencher sempre as quatro faixas, e o desenho não diz nada; esse é o erro da tabela de modelos. Segundo, **escala**: Few escala cada bandline para ocupar a altura, o que favorece a forma; quando os cartões existem para comparar nível entre si, a escala é comum (EIX-9) e o rodapé da grade escreve isso. Terceiro, **histórico curto**: com menos de cerca de 20 observações os quartis oscilam a cada ponto novo e as faixas dançam; o cartão omite as faixas e escreve "histórico curto para quartis". Quarto, **sazonalidade**: a distribuição do ano mistura meses fortes e fracos, e dezembro sempre parece fora da curva; a janela de referência pode ser a mesma estação do ano anterior, declarada. Quinto, **tema escuro**: a escala clara para escura de Few não se traduz direto; as três intensidades saem de um neutro medido contra o cartão nos dois temas, e `--surface-overlay` fica fora pela ANO-4. A marcação dos atípicos por cheio e vazado já é forma, não cor, o que resolve a acessibilidade sem esforço extra.

**Versões sugeridas.**

* **V1 Básico.** Entradas diárias de leads nos últimos 30 dias sobre a distribuição dos últimos 180 dias. Público Marketing.
* **V2 Com atípico anotado.** Tempo até o primeiro contato com os dois últimos dias acima do limite de atípico, pontos vazados, e a frase "2 dias acima de 1,5 vez a amplitude interquartil". Público Pré-vendas.
* **V3 Caso denso do Farol.** Grade de 12 cartões de executivo, cada bandline sobre a distribuição do próprio executivo em 52 semanas, lida como "no quartil de cima do próprio histórico", com nota de que as faixas são individuais e que a comparação de nível entre pessoas mora em outra peça.
* **V4 Caso limite.** Executivo com 9 semanas de histórico (faixas omitidas, com texto), distribuição degenerada em que o primeiro e o terceiro quartis valem zero porque a campanha passou meses sem investimento (as faixas colapsam num traço e o cartão troca o desenho por texto) e duas semanas sem coleta (a linha quebra).

**Referências.**

* Praticante: [Stephen Few, Introducing Bandlines, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/introducing_bandlines.pdf). Observar os cinco valores que definem as faixas, a regra de três intensidades de um só tom, a linha da mediana e a marcação de atípicos por ponto cheio e vazado (PDF aberto; texto lido por extração local).
* Praticante: [Stephen Few, Best Practices for Scaling Sparklines in Dashboards, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf). Observar os cinco métodos de escala e o quinto em especial: incluir sempre uma subfaixa significativa e escalar cada linha pelo próprio mínimo e máximo (PDF aberto; texto lido por extração local).
* Catálogo: [Data Viz Catalogue, Box Plot](https://datavizcatalogue.com/methods/box_plot.html). Observar a mesma lógica de mediana, quartis e atípicos, que a bandline deita na horizontal atrás da linha (aberto).
* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Observar a faixa cinza de normalidade, que é a ancestral direta da bandline (aberto).
* Implementação: [Recharts, BandedChart](https://recharts.github.io/en-US/examples/BandedChart/). Observar faixa preenchida atrás de linha no mesmo gráfico (registrado por outra família deste estudo; não aberto nesta sessão).
* Portal de design: [Dribbble, tag sparkline](https://dribbble.com/tags/sparkline). Observar que as peças de portal usam sparkline decorativa e nenhuma traz faixa de distribuição; a bandline do Farol sai da especificação, não de referência visual (registrado por outra família deste estudo; não aberto nesta sessão).

### 1.27 KPI com seletor de janela

**Descrição.** O cartão com um controle de 7, 30 e 90 dias que troca, juntos, a janela do número, a âncora do delta e o trecho da sparkline. É o padrão do exemplo interativo de área do shadcn/ui, que põe um seletor de "últimos 3 meses, 30 dias, 7 dias" no cabeçalho do cartão. Serve quando a mesma métrica é lida em horizontes diferentes por públicos diferentes: o operador de pré-vendas olha a semana, a diretoria olha o trimestre.

**Anatomia.** (1) Rótulo. (2) Controle segmentado com três opções no máximo, no cabeçalho do cartão. (3) Número recalculado para a janela. (4) Delta contra a janela anterior **de mesmo tamanho**, com a âncora escrita e reescrita a cada troca. (5) Sparkline da janela, com a granularidade declarada. (6) Data de referência: "até 2026-09-13".

**Abordagem na stack:** `html-tailwind` para o controle, como grupo de rádio (`role="radiogroup"`, setas do teclado trocam a opção), e `recharts-nativo` para a sparkline. O recorte é uma função pura `recortarJanela(serie, dias, dataReferencia)`; a data de referência vem do dado, nunca de `new Date()`, porque o catálogo exige determinismo. O próprio exemplo do shadcn fixa a data de referência no código, pelo mesmo motivo.

**Ponto delicado.** Primeiro, **trocar o número sem trocar a âncora** é o erro que a tabela registra: 30 dias contra o mês anterior fechado mistura janelas; a comparação é sempre com os 30 dias imediatamente anteriores, ou com a mesma janela do ano anterior, e o texto diz qual. Segundo, **o dia de hoje está incompleto**: "últimos 7 dias" termina no último dia fechado, senão toda janela curta parece queda. Terceiro, **duas fontes de verdade**: se a tela já tem filtro de período, o seletor do cartão briga com ele; ou o cartão segue o filtro e desabilita o seletor com a frase "segue o período da tela", ou a tela não tem filtro. Quarto, **granularidade**: 90 pontos diários numa sparkline de 120 px viram ruído; em 90 dias a série vira semanal, escrito. Quinto, **o número muda de largura** quando a janela troca (de R$ 98 mil para R$ 1,2 mi) e empurra o delta; algarismo tabular e largura mínima reservada seguram o layout. Sexto, **exportação**: o PDF precisa escrever qual janela estava ativa.

**Versões sugeridas.**

* **V1 Básico.** Leads recebidos com 7, 30 e 90 dias, número, delta e sparkline mudando juntos. Público Marketing.
* **V2 Com âncora anotada.** CPL com a linha "30 dias até 2026-09-13 vs. 30 dias anteriores", reescrita a cada troca, e a nota "dia corrente fora da conta". Público Marketing.
* **V3 Caso denso do Farol.** Tira de quatro cartões de Pré-vendas comandada por **um** seletor no cabeçalho da tira, em vez de quatro seletores soltos, com a sparkline passando de diária para semanal na janela de 90 dias e a granularidade escrita em cada cartão.
* **V4 Caso limite.** Fonte com 45 dias de coleta: a opção de 90 dias fica desabilitada com a dica "coleta começou em 2026-07-31"; janela anterior incompleta suprime o delta com "sem janela anterior completa"; e a tela com filtro global ativo desabilita os seletores de todos os cartões.

**Referências.**

* Implementação: [shadcn/ui, código do Area Chart Interactive](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-area-interactive.tsx). Observar o `Select` com 90d como padrão, 30d e 7d, o filtro por data a partir de uma data de referência fixa e o seletor alinhado à direita do cabeçalho em telas largas (aberto).
* Catálogo: [shadcn/ui, galeria de gráficos de área](https://ui.shadcn.com/charts/area). Observar a variante interativa no contexto das outras nove (aberto; a página não expõe o código, lido no arquivo do registro).
* Praticante: [Stephen Few, Best Practices for Scaling Sparklines in Dashboards, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf). Observar o argumento de manter uma faixa de escala consistente de um dia para o outro, que a troca de janela ameaça (PDF aberto; texto lido por extração local).
* Portal de design: [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). Observar o rótulo de período de comparação como elemento fixo do cartão, que aqui passa a ser dinâmico (aberto).

### 1.28 KPI com lista de contribuição

**Descrição.** O total em destaque e, logo abaixo, os três a cinco itens que mais contribuíram para ele, cada um com barra horizontal proporcional, valor e participação, fechando com uma linha de "demais" que completa a soma. Responde de uma vez "quanto" e "de onde veio", que é a pergunta que quase todo número de volume provoca na reunião. É o desenho dos blocos de KPI do Tremor que juntam um total de vendas à distribuição por canal, e do componente BarList, que põe barras horizontais com o rótulo por dentro.

**Anatomia.** (1) Rótulo e período. (2) Número total com peso cheio. (3) Lista de 3 a 5 linhas em ordem decrescente de valor, cada uma com nome, barra de fundo proporcional ao **total** (não ao maior item), valor compacto e participação em percentual. (4) Linha "demais (n itens)" em `text-text-muted`, com barra neutra, que garante que a lista fecha o total. (5) Linha separada "sem origem registrada" quando parte do total não tem rótulo. (6) Link "ver todos", que leva à peça completa da família 02.

**Abordagem na stack:** `html-tailwind`. Cada barra é um `div` com largura percentual calculada numa função pura `montarContribuicao(itens, topN)`, que devolve `{ topo, demais, semRotulo, total }` e confere que a soma fecha antes de desenhar. Nada de Recharts aqui: um `BarChart` de cinco barras dentro do cartão paga eixo, margem e `ResponsiveContainer` para desenhar cinco retângulos, e o rótulo por dentro da barra é HTML natural. A lista é um `<ol>`, e cada item tem nome acessível completo: "Plataforma A, R$ 42 mil, 38% do total".

**Ponto delicado.** Primeiro, **a lista não fecha o total**: sem a linha de demais, o leitor soma os cinco itens, não chega ao número de cima e perde a confiança no cartão inteiro; é o erro da tabela. Segundo, **a base da barra**: escalar pelo maior item faz o primeiro parecer 100% e esconde que ele é só 38% do total; escala pelo total é leitura de contribuição, escala pelo maior é ranking, e o cartão escolhe uma e escreve qual. Terceiro, **negativos**: contribuição para uma variação (quem puxou a queda) mistura itens positivos e negativos, e barra de largura não carrega sinal; esse caso mora na barra divergente da família 02 ou na cascata da 19. Quarto, **sem rótulo não é "demais"**: 22% de leads sem origem conhecida não podem sumir na cauda, senão a cobertura do dado desaparece junto; linha própria, com a palavra e a etiqueta LACUNA. Quinto, **ordem estável**: valores empatados precisam de desempate determinístico (pelo nome), ou a lista troca de lugar a cada atualização. Sexto, **nome longo** trunca com reticência e mostra o nome completo no `title`; quebrar em duas linhas desalinha a grade.

**Versões sugeridas.**

* **V1 Básico.** Investimento de mídia do mês com as três plataformas genéricas (Plataforma A, B e C) abaixo, barras pela participação no total e linha de demais. Público Marketing.
* **V2 Com destaque e anotação.** Receita reconhecida no trimestre com os cinco maiores contratos, o primeiro aceso e a nota calculada "os 5 maiores respondem por 61% do total". Público Comercial.
* **V3 Caso denso do Farol.** Leads do mês com as cinco maiores origens, a linha "demais (9 origens)" e a linha separada "sem origem registrada, 22%" com etiqueta LACUNA, que é a mesma cobertura de dado que a tela de Marketing declara no rodapé. Público Marketing.
* **V4 Caso limite.** Variação de receita contra o trimestre anterior com contribuições de sinais opostos (o cartão recusa a barra de largura, escreve os valores com sinal e aponta para a cascata) e um total zero, em que as participações saem "sem base" em vez de `NaN%`.

**Referências.**

* Implementação: [Tremor, BarList](https://www.tremor.so/docs/visualizations/bar-list). Observar o rótulo por dentro da barra, a ordem decrescente como padrão, o `valueFormatter` e o clique por item com `onValueChange` (aberto).
* Implementação: [Tremor Blocks, KPI cards](https://blocks.tremor.so/blocks/kpi-cards). Observar os blocos "Total sales" e os de detalhamento por tipo, que juntam um total a uma distribuição, e notar que nenhum deles traz a linha de demais (aberto).
* Catálogo: [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart). Observar a leitura de concentração, poucos itens explicando a maior parte do total, que é o que a anotação da V2 escreve (registrado por outra família deste estudo; não aberto nesta sessão).
* Praticante: [Stephen Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf). Observar no nono erro, arrumar mal os dados, a frase de que o que deve ser comparado precisa ser arrumado para provocar a comparação, que justifica a ordem decrescente e a base comum das barras (PDF aberto; texto lido por extração local).
* Portal de design: [Dribbble, SaaS Analytics Dark Dashboard](https://dribbble.com/shots/23673869-SaaS-Analytics-Dark-Dashboard). Observar a faixa de KPIs de vendas acima da tabela de transações em tema escuro, a versão expandida do mesmo par entre total e origem (não abriu; registrado em `00_portais-de-design.md` a partir da busca).

### 1.29 KPI em carregamento

**Descrição.** O estado do cartão enquanto a consulta não voltou: um esqueleto com a forma exata do cartão final, blocos neutros no lugar do rótulo, do número e do minigráfico, que diz "aqui vai haver um número" sem mostrar número nenhum. Não é enfeite de transição; é o terceiro estado de todo KPI, ao lado do preenchido (1.1) e do indisponível (1.15), e merece o mesmo cuidado de desenho. A NN/g indica o esqueleto para carregamentos entre 1 e 10 segundos e desaconselha qualquer indicador abaixo de 1 segundo, porque o piscar atrapalha mais do que informa.

**Anatomia.** (1) Bloco do rótulo com 12 px de altura e 40% a 60% da largura. (2) Bloco do número na altura exata da linha de 30 px com `leading-none`. (3) Bloco do contexto com 11 px. (4) Retângulo liso na altura reservada da sparkline, quando o cartão final tem uma. (5) Moldura, borda e raio idênticos aos do cartão pronto. (6) Nenhum texto visível; o aviso de carregamento vai só para o leitor de tela.

**Abordagem na stack:** `html-tailwind`. Blocos `div` arredondados com `motion-safe:animate-pulse`, que é o mesmo recurso do Skeleton do shadcn/ui, num neutro medido contra o fundo do cartão nos dois temas. O contêiner recebe `aria-busy="true"` e um texto oculto, "carregando receita reconhecida". O componente recebe `estado: 'carregando' | 'pronto' | 'indisponivel'` e **um único layout** desenha os três, de modo que as alturas coincidem por construção e não por duas marcações que divergem com o tempo. No catálogo o estado é prop com default, sem temporizador, porque `setInterval` é proibido e o render desliga animação.

**Ponto delicado.** Primeiro, **altura diferente da final**, o erro da tabela: quando o dado chega, a grade pula e o leitor perde a linha. Segundo, **piscar**: consulta que volta em 150 ms mostra o esqueleto por um quadro e parece defeito; o esqueleto só aparece depois de cerca de 300 ms e, uma vez visível, fica um tempo mínimo. Terceiro, **animação**: a NN/g registra que brilho e pulso podem distrair e criar problema de acessibilidade; pulso lento, sob `motion-safe`, e nunca brilho correndo por doze cartões ao mesmo tempo. Quarto, **esqueleto que parece dado**: bloco de sparkline em forma de onda ou colunas de alturas variadas vira leitura falsa; retângulo liso. Quinto, **carregamento eterno**: consulta que falhou não pode deixar o esqueleto pulsando; passado um tempo limite, o cartão cai para o 1.15 com o motivo "a consulta não respondeu". Sexto, **chegada parcial**: numa grade, cada cartão carrega por conta própria e a ordem dos cartões nunca muda por causa da ordem de chegada.

**Versões sugeridas.**

* **V1 Básico.** Cartão de receita reconhecida em esqueleto, com blocos de rótulo, número e período. Público Comercial.
* **V2 Com minigráfico reservado.** Cartão de CPL qualificado com o retângulo liso da sparkline na altura exata e o aviso acessível "carregando CPL qualificado dos últimos 30 dias". Público Marketing.
* **V3 Caso denso do Farol.** Tira de seis KPIs de Pré-vendas em chegada progressiva: três prontos, dois em esqueleto e um já no estado indisponível por tempo limite, todos com a mesma altura. Público Pré-vendas.
* **V4 Caso limite.** Troca de filtro com número já na tela: em vez de apagar o contexto voltando ao esqueleto, o cartão mantém o número anterior esmaecido com a marca "atualizando" até o novo chegar; se a nova consulta falhar, devolve o valor anterior com a data e o período dele escritos.

**Referências.**

* Praticante: [NN/g, skeleton screens](https://www.nngroup.com/articles/skeleton-screens/). Observar os limiares de tempo (nada abaixo de 1 segundo, esqueleto ou indicador entre 1 e 10, barra de progresso acima de 10), a exigência de espelhar o layout final e o alerta sobre brilho e pulso (aberto; Samhita Tankala, 2023-06-04).
* Implementação: [shadcn/ui, Skeleton](https://ui.shadcn.com/docs/components/skeleton). Observar que o componente é um `div` com `animate-pulse` e tamanho por classe, e que os exemplos de cartão e de tabela montam o esqueleto com as caixas do conteúdo final (aberto; a página não traz nota de acessibilidade).
* Praticante: [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/). Observar a troca do indicador giratório pelo esqueleto e o instantâneo em cache rotulado com o horário quando a fonte cai, que é a V4 (aberto; Karan Rawal, 2025-09-12).
* Portal de design: [Figma Community, KPI Dashboard with micro interactions](https://www.figma.com/community/file/1577537133533397367/kpi-dashboard-with-micro-interactions). Observar a transição de valor entre estados, que é onde o esqueleto encontra o cartão pronto (não abriu; registrado em `00_portais-de-design.md` a partir da busca).

### 1.30 KPI com frescor do dado

**Descrição.** O número acompanhado de **quando ele foi medido** e de um sinal quando essa medição passou do prazo esperado. Em fonte com carga agendada (mídia paga que atualiza uma vez por dia, CRM que sincroniza de hora em hora, planilha de meta atualizada à mão), o número de hoje pode ser o de anteontem sem aviso nenhum. O cartão escreve "dado de 2026-09-13 05:00" e, quando a janela esperada estoura, troca essa linha por um alerta de defasagem. A documentação de frescor do Data Studio mostra a data e a hora da última atualização no canto inferior esquerdo do relatório e fixa em 12 horas a atualização das fontes de mídia e medição; a Smashing descreve um widget com estado da sincronização, horário e botão de atualizar.

**Anatomia.** (1) Rótulo, número e contexto como no 1.2. (2) Linha de frescor em 11 px, `text-text-muted`, com o ícone `Clock` do lucide-react: "dado de 2026-09-13 05:00". (3) Prazo esperado da fonte, que mora no dicionário da métrica e não no componente: "atualiza a cada 24 h". (4) Estado de defasagem quando o atraso passa do prazo: ícone `TriangleAlert`, a palavra "defasado" e há quanto tempo, em `--warning` no texto e no ícone, nunca como fundo (COR-7). (5) Opcionalmente o nome genérico da fonte.

**Abordagem na stack:** `html-tailwind`. A função pura `frescorDe(dataDoDado, dataDeReferencia, prazoHoras)` devolve `{ estado: 'em-dia' | 'defasado' | 'sem-carimbo' | 'inconsistente', atrasoHoras }`. A data de referência entra por prop e, no catálogo, vem do próprio dado, nunca de `new Date()`; no Farol, quem passa o relógio é o pai. Tempo relativo ("há 3 h") só como complemento do carimbo absoluto, porque envelhece com a tela aberta.

**Ponto delicado.** Primeiro, **o carimbo da página não é o carimbo do dado**: a hora em que a página abriu ou em que a consulta rodou não diz nada sobre quando a fonte foi coletada; é o erro da tabela e o mais frequente, porque é o único horário que o navegador tem de graça. O carimbo vem da carga (a maior data de coleta da tabela) e a consulta precisa expor esse campo. Segundo, **precisão**: Few lista o horário até o segundo como detalhe inútil num painel; minuto basta para fonte horária e data basta para fonte diária. Terceiro, **fuso**: carimbo gravado em UTC e exibido como hora local desloca 3 horas e faz a carga das 05:00 parecer das 02:00; o formatador declara o fuso. Quarto, **frescor por cartão, não por tela**: um carimbo único no rodapé mente para metade dos cartões quando a tela mistura fontes; só quando todos dividem a mesma fonte o carimbo sobe para o cabeçalho da tira. Quinto, **defasado não é indisponível**: dado velho continua sendo dado e o número fica visível; só depois de um segundo limite (três ciclos, por exemplo) o cartão cai para o 1.15. Sexto, **período fechado não envelhece**: a receita de agosto lida em setembro mostra "fechado em 2026-09-02" e fica fora da regra de defasagem.

**Versões sugeridas.**

* **V1 Básico.** Investimento de mídia do mês com "dado de 2026-09-13 05:00" e "atualiza a cada 24 h". Público Marketing.
* **V2 Com alerta de defasagem.** O mesmo cartão com a fonte parada há 52 horas: número visível, linha em `--warning` com ícone e a frase "defasado há 2 dias; última carga 2026-09-11 05:00". Público Marketing.
* **V3 Caso denso do Farol.** Tira de Diretoria com quatro cartões de quatro fontes: custo (carga diária, em dia), receita (fechamento mensal, "fechado em 2026-09-02"), leads (carga horária, em dia) e meta (planilha manual, "atualizada em 2026-08-30"), cada um com o próprio carimbo e nenhum no rodapé geral. Público Diretoria.
* **V4 Caso limite.** Fonte sem carimbo de coleta ("sem data de coleta registrada", com etiqueta LACUNA na linha de frescor), carimbo no futuro por erro de fuso (o cartão escreve "carimbo inconsistente" em vez de "em dia") e defasagem de três ciclos, em que o cartão cai para o estado indisponível com a data da última medição válida.

**Referências.**

* Implementação: [Google Cloud, Manage data freshness no Data Studio](https://docs.cloud.google.com/looker/docs/studio/manage-data-freshness). Observar a tabela de intervalos por conector, com mídia e medição fixas em 12 horas, o intervalo mínimo de um minuto entre atualizações manuais e o carimbo da última atualização no canto inferior esquerdo (aberto).
* Praticante: [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/). Observar o widget de frescor com estado da sincronização, horário e botão manual, e o rótulo "Data as of 10:42 AM" no instantâneo em cache (aberto).
* Praticante: [Stephen Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf). Observar no terceiro erro, detalhe ou precisão excessivos, o exemplo de horário até o segundo, que calibra a precisão do carimbo (PDF aberto; texto lido por extração local).
* Implementação: [Grafana, Stat](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/stat/). Observar que o "No value" mostra um hífen por padrão, justamente o traço solto que a família proíbe para ausência e que o cartão defasado também não pode herdar (aberto).
* Portal de design: [Behance, Modern KPI Dashboard Cards UI Kit 2025](https://www.behance.net/gallery/227305143/Modern-KPI-Dashboard-Cards-UI-Kit-2025). Observar nas imagens se algum cartão reserva lugar para carimbo de atualização; a página só traz título e etiquetas (aberto, registrado em `00_portais-de-design.md`).

### 1.31 KPI com sparkline comparativa

**Descrição.** O KPI com sparkline (1.4) com uma segunda linha, a do período de comparação, desenhada atrás e em neutro: os últimos 30 dias sobre os mesmos 30 dias do ano anterior, ou o mês corrente acumulado sobre o mês anterior acumulado. Responde o que o delta sozinho não responde: a diferença veio de um dia atípico ou a curva inteira descolou? Tufte trata a sobreposição como instrumento de comparação: pôr duas formas uma sobre a outra mostra na hora onde coincidem e onde divergem.

**Anatomia.** (1) Rótulo, número e delta com âncora escrita, como no 1.2. (2) Sparkline da série atual em traço de 2 px na cor do cartão. (3) Série de comparação atrás, em traço de 1 px, neutro e tracejado, sem pontos. (4) Rótulo direto curto na ponta de cada linha ("2026", "2025") ou uma legenda de uma linha no rodapé, nunca legenda em caixa. (5) Ponto final só na série atual. (6) Rodapé com o critério de alinhamento: "alinhado por dia da semana" ou "alinhado por dia útil".

**Abordagem na stack:** `recharts-nativo`. `LineChart` com duas `Line` sobre um `XAxis` oculto, `dot={false}` e `isAnimationActive={useAnimateOnce()}`; a série anterior com `strokeDasharray` e cor neutra, declarada **antes** da atual no JSX para ficar atrás. O domínio do `YAxis` oculto é calculado sobre as duas séries juntas, senão cada linha escala por conta própria e a comparação desaparece. É o esqueleto do exemplo de linhas múltiplas do shadcn/ui, com uma diferença decisiva: lá as duas séries têm o mesmo peso, aqui não podem ter. O alinhamento sai de uma função pura `alinharPeriodos(atual, anterior, criterio)`.

**Ponto delicado.** Primeiro, **mesmo peso visual**, o erro da tabela: com duas linhas iguais o leitor precisa descobrir qual é a de agora; a hierarquia (cor contra neutro, 2 px contra 1 px, cheia contra tracejada) é o conteúdo do modelo. Segundo, **calendário**: 2026-09-01 caiu numa terça e 2025-09-01 numa segunda; alinhar por data põe segunda contra terça e cria picos falsos em série com padrão semanal; entradas e agendas alinham por dia da semana, receita alinha por dia útil, e o rodapé escreve qual. Terceiro, **período parcial contra período fechado**: o mês corrente para no dia útil 9 e o anterior está inteiro; a linha anterior pode aparecer inteira (leitura de ritmo, parente do 1.22), mas o número e o delta comparam só até o mesmo dia útil. Quarto, **escala conjunta com pico**: um pico de campanha na série anterior achata a atual; o domínio comum continua certo, e uma nota curta explica o achatamento. Quinto, **terceira série**: meta ou média viram outra forma (linha de referência horizontal ou faixa), porque três linhas em 120 px viram novelo.

**Versões sugeridas.**

* **V1 Básico.** Leads por dia nos últimos 30 dias sobre os mesmos 30 dias de 2025, com o total do período e o delta contra o ano anterior. Público Marketing.
* **V2 Com destaque.** Receita reconhecida acumulada no mês, a série de 2026 parando no dia útil 9 sobre a de 2025 completa, com o ponto final aceso e o rótulo "dia útil 9: 41% acima". Público Comercial.
* **V3 Caso denso do Farol.** Grade de seis cartões de Pré-vendas (entradas, agendas marcadas, agendas realizadas, comparecimento, tempo até o primeiro contato e leads sem dono), todos com a mesma semana do ano anterior alinhada por dia da semana e um rodapé único na grade com o critério. Público Pré-vendas.
* **V4 Caso limite.** Métrica nova sem ano anterior (a série de comparação some com a frase "sem série de 2025: coleta começou em 2026-03"), ano anterior com seis dias sem coleta (a linha tracejada quebra e não liga o furo) e série anterior com pico que achata a atual, anotado.

**Referências.**

* Praticante: [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/). Observar as pilhas de sparklines sobrepostas e o eletrocardiograma dobrado contra a luz, em que alinhar os complexos revela o ritmo irregular: sobreposição como método de comparação (aberto; a página não especifica peso visual para a série de referência).
* Implementação: [shadcn/ui, código do Line Chart Multiple](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-line-multiple.tsx). Observar as duas `Line` com o mesmo `strokeWidth={2}` e `dot={false}`, justamente a igualdade de peso que este modelo quebra, e o rodapé com a variação escrita (aberto).
* Praticante: [Stephen Few, Best Practices for Scaling Sparklines in Dashboards, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf). Observar a discussão de escala consistente entre sparklines comparadas, que aqui vira domínio comum às duas séries (PDF aberto; texto lido por extração local).
* Portal de design: [Behance, Analytics Metric Cards UI](https://www.behance.net/gallery/255429155/Analytics-Metric-Cards-UI). Observar nas imagens se as sparklines de comparação dão peso menor ao período anterior; a página não traz texto (aberto, registrado em `00_portais-de-design.md`).

### 1.32 KPI com anel de progresso

**Descrição.** O número acompanhado de um anel que mostra **uma única fração**: 75% do orçamento consumido, 62% da capacidade ocupada, nota 88 de 100. Entra no catálogo porque kits e blocos de KPI usam muito: os blocos do Tremor trazem anel em "Plan overview", "Budget HR" e "Web vitals scores", e o componente ProgressCircle aceita texto no centro. Mora aqui só quando o anel é **subordinado** ao número; quando o arco é o protagonista, ou quando vários cartões precisam ser comparados entre si, a peça vai para a família 13 e quase sempre vira barra (1.6). Few é duro com o formato: o medidor circular gasta muito espaço para dizer muito pouco, e sem escala legível nem referência não diz se o valor é bom.

**Anatomia.** (1) Rótulo. (2) Anel de 40 a 64 px com trilho neutro e arco preenchido a partir das 12 horas, em sentido horário. (3) Percentual escrito no centro ou ao lado, sempre. (4) Número absoluto com o par: "R$ 340 mil de R$ 450 mil". (5) Linha de período. (6) Opcionalmente cor semântica pelo corte de uma régua escrita, com ícone e palavra, como no 1.13.

**Abordagem na stack:** `svg-puro`. Um `circle` de trilho e um `circle` de arco com `strokeDasharray` igual à circunferência e `strokeDashoffset` calculado por uma função pura `arcoDe(valor, maximo, raio)`, girado para começar no topo, com ponta reta para que 3% não pareça 6%. O Recharts faz o mesmo com `RadialBarChart` e `RadialBar` com `background` como trilho, fixando a escala por um eixo angular numérico de 0 a 100 ou pelo ângulo final calculado à mão (sem isso, o único valor vira volta completa), mas paga `ResponsiveContainer` e cálculo de raio para desenhar um arco; `recharts-nativo` só compensa quando o cartão já usa Recharts ao lado.

**Ponto delicado.** Primeiro, **o anel sem o número**, o erro da tabela: ângulo é uma das codificações menos precisas, e 58% e 65% parecem iguais. Segundo, **acima de 100%**: o ProgressCircle do Tremor corta o valor no máximo com `Math.min(max, Math.max(value, 0))`, o que é seguro para desenhar e perigoso para ler, porque 130% do orçamento vira o mesmo anel cheio de 100%; o cartão escreve "130%", marca o excedente (segunda volta em traço distinto ou selo "acima do teto") e nunca deixa o corte calado. Terceiro, **negativo e zero**: valor abaixo de zero sai do domínio e vira texto com sinal; zero mostra o trilho vazio com "0%", sem esconder o anel. Quarto, **comparação entre cartões**: seis anéis lado a lado são lidos por ângulo, e ângulo compara mal; se o objetivo é comparar, a tira vira barras com base comum. Quinto, **o que é o 100%**: meta, teto de capacidade e orçamento são denominadores diferentes; o denominador vai escrito, com procedência quando é PREMISSA. Sexto, **espessura**: arco grosso com ponta arredondada infla valores pequenos; cerca de 12% do diâmetro e ponta reta.

**Versões sugeridas.**

* **V1 Básico.** Orçamento de mídia do mês com anel em 75%, percentual no centro e "R$ 34 mil de R$ 45 mil" ao lado. Público Marketing.
* **V2 Com régua e anotação.** Ocupação da carteira em 92%, arco em `--warning` com ícone, a palavra "atenção" e a régua "atenção acima de 85% do teto", com o teto marcado PREMISSA. Público Pré-vendas.
* **V3 Caso denso do Farol.** Tira de Diretoria com três anéis (meta do trimestre, orçamento consumido, ocupação da capacidade), cada um com o próprio denominador escrito e a nota de que os três 100% não medem a mesma coisa. Público Diretoria.
* **V4 Caso limite.** Orçamento estourado em 130% (anel cheio, volta excedente tracejada e selo "30% acima"), denominador zero por falta de orçamento definido ("sem teto definido" no lugar do anel) e valor negativo de estorno (sem anel, só texto com sinal).

**Referências.**

* Implementação: [Tremor, ProgressCircle](https://www.tremor.so/docs/visualizations/progress-circle). Observar `value`, `max`, `radius`, `strokeWidth`, as cinco variantes, o texto central por `children`, o exemplo "$340/$450" ao lado do anel e o corte com `Math.min` (aberto).
* Implementação: [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/). Observar `RadialBar` com `background` como trilho e `barSize`, e notar que o exemplo compara sete categorias em arcos, uso que este modelo não recomenda (aberto).
* Praticante: [Stephen Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf). Observar no segundo erro, contexto insuficiente, o medidor que só deixa estimar o valor, sem escala legível nem referência, e a frase sobre muito espaço usado para dizer pouco (PDF aberto; texto lido por extração local).
* Implementação: [Tremor Blocks, KPI cards](https://blocks.tremor.so/blocks/kpi-cards). Observar os blocos "Plan overview", "Budget HR" e "Web vitals scores", com anel de capacidade, de orçamento alocado e de nota até 100 (aberto).
* Portal de design: [Dribbble, UI Progress Indicator Percentage Ring Chart](https://dribbble.com/shots/4069776-UI-Progress-Indicator-Percentage-Ring-Chart). Observar o anel com percentual central, padrão recorrente em cartões (não abriu; registrado por outra família deste estudo a partir da busca).
* Portal de design: [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit). Observar as variantes linear, circular e em etapas lado a lado, útil para decidir quando o anel deveria ser barra (não abriu; registrado em `00_portais-de-design.md` a partir da busca).

### 1.33 KPI com ponto de ação

**Descrição.** Um marcador pequeno, ponto ou ícone, que só aparece no cartão cuja métrica cruzou um limiar de ação; os demais cartões ficam sem marca nenhuma. É a resposta ao décimo erro de desenho de painel na lista de Few: quando tudo é visualmente proeminente, nada se destaca, e o olho precisa ser levado ao que pede atenção agora. Difere do 1.13, que dá um estado a todo cartão (no alvo, atenção, fora), porque aqui o estado normal é **ausência de marca**; e difere do 1.21, que é um cartão inteiro de exceção, porque aqui o cartão da métrica continua o mesmo e só ganha o ponto.

**Anatomia.** (1) Cartão comum, do 1.2 ou do 1.4. (2) Ponto de 8 px ou ícone `CircleAlert` de 14 px junto do rótulo, na cor semântica, só quando o limiar foi cruzado. (3) Dica e nome acessível com a regra: "12% dos leads acima de 48 h sem primeiro contato; limiar 10%". (4) Dois níveis no máximo, distintos por forma além da cor: ponto vazado para atenção, ponto cheio com ícone para ação. (5) Opcionalmente a contagem no cabeçalho da tira: "2 de 12 pedem atenção".

**Abordagem na stack:** `html-tailwind`. A função pura `pontoDeAcao(valor, limiares, polaridade)` devolve `null` na maior parte do tempo, e o componente só desenha o marcador quando recebe algo. Cor em `--warning` e `--negative` no ponto e no ícone, nunca no fundo nem no número (COR-7). O marcador tem `role="img"` e `aria-label` com a regra, porque é a única informação do cartão que não está escrita em outro lugar.

**Ponto delicado.** Primeiro, **pintar também os cartões normais**, o erro da tabela: um ponto verde em cada cartão no alvo devolve a tela ao estado em que tudo chama atenção, que é exatamente o painel que Few usa como contraexemplo. Segundo, **limiar sem dono**: o ponto só vale se os limiares estão escritos e datados no dicionário da métrica; ponto sem regra é opinião. Terceiro, **pisca e apaga**: métrica que cruza o limiar a cada dois dias ensina o operador a ignorar o ponto; histerese (acende acima de 10%, apaga abaixo de 8%) ou duas leituras seguidas antes de acender. Quarto, **layout**: o espaço do marcador fica reservado em todos os cartões, vazio quando não há ponto, senão o rótulo pula quando o ponto aparece. Quinto, **polaridade**: queda de CPL não merece ponto e subida merece (decisão transversal 5). Sexto, **ponto sem caminho**: o marcador leva à lista dos casos ou diz o próximo passo; destacar sem caminho produz ansiedade, não decisão.

**Versões sugeridas.**

* **V1 Básico.** Tira de quatro KPIs de Marketing em que só o CPL qualificado ganha o ponto de atenção, com a regra na dica. Público Marketing.
* **V2 Com dois níveis e anotação.** Tempo até o primeiro contato com ponto cheio e ícone (18% dos leads acima de 48 h, limiar de ação 15%) ao lado da taxa de comparecimento com ponto vazado (atenção), cada um com a regra escrita. Público Pré-vendas.
* **V3 Caso denso do Farol.** Grade de 12 KPIs de Comercial com dois pontos acesos, o cabeçalho "2 de 12 pedem atenção", a ordem da grade inalterada (o ponto não reordena) e o clique que abre as oportunidades responsáveis. Público Comercial.
* **V4 Caso limite.** Métrica oscilando em torno do limiar (continua marcada até cair abaixo de 8%, com a histerese dita na dica), métrica sem limiar definido (espaço vazio e dica "sem limiar de ação") e métrica sem dado (nenhum ponto e estado do 1.15, porque ausência de dado não pode ser lida como "nada a fazer").

**Referências.**

* Praticante: [Stephen Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf). Observar no décimo erro, destacar mal o que importa, o painel em que todos os dados são igualmente fortes e coloridos e a frase de que, quando tudo é proeminente, nada se destaca (PDF aberto; texto lido por extração local).
* Implementação: [Grafana, Stat](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/stat/). Observar os limiares e os modos de cor (nenhum, valor, fundo em gradiente, fundo sólido); o fundo sólido pinta todos os cartões e é o que este modelo evita (aberto).
* Implementação: [Tremor Blocks, KPI cards](https://blocks.tremor.so/blocks/kpi-cards). Observar os blocos com estado "within", "observe" e "critical" com ícone, e comparar: lá todo cartão carrega um estado, aqui só o que saiu da regra (aberto).
* Praticante: [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/). Observar a recomendação de cartões de alto contraste e indicadores por cor para sinalizar anomalia, e o limite dela quando aplicada a todos os cartões ao mesmo tempo (aberto).
* Portal de design: [Behance, Dark-Themed Business Management Dashboard UI](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI). Observar o indicador de status em painel escuro com acentos vibrantes, e quanto dele marca exceção e quanto marca o normal (aberto, registrado em `00_portais-de-design.md`).

### 1.34 KPI de distribuição resumida

**Descrição.** Para métricas de tempo e de valor com cauda longa (tempo até o primeiro contato, ciclo de venda, ticket), o cartão mostra a **mediana** como número principal e um percentil alto ao lado, o p90, com uma régua mínima que marca p25, mediana, p75 e p90. A média de uma distribuição assimétrica é puxada pela cauda e descreve um caso que quase não existe. O livro de SRE do Google dá o exemplo canônico: um serviço com latência média de 100 ms a 1.000 requisições por segundo pode ter 1% delas levando 5 segundos. Ferramentas de monitoramento tratam a estatística como escolha declarada: o painel Stat do Grafana reduz a série por média, mediana ou percentil de 1 a 99.

**Anatomia.** (1) Rótulo com a estatística no nome: "tempo até o primeiro contato, mediana". (2) Número da mediana. (3) Percentil alto ao lado, em peso menor: "p90: 31 h". (4) Régua horizontal de 4 a 6 px com a faixa interquartil preenchida, um traço na mediana e um marcador no p90, sem eixo, com os extremos rotulados. (5) Tamanho da amostra: "n = 412 leads". (6) Opcionalmente o SLA como traço vertical na régua.

**Abordagem na stack:** `svg-puro` para a régua e `html-tailwind` para o resto. Os percentis saem de uma função pura `quantis(valores, [0.25, 0.5, 0.75, 0.9], metodo)` com o método de interpolação declarado, ou vêm prontos da consulta quando a série crua não chega ao navegador. A escala da régua vai de zero a um teto declarado (p99 ou o SLA), e não do mínimo ao máximo, para que cartões lado a lado sejam comparáveis. Em Recharts seria um `BarChart` horizontal empilhado com segmento invisível, caro demais para quatro marcas; a peça completa, com caixa e atípicos, mora na família 16.

**Ponto delicado.** Primeiro, **publicar a média de uma distribuição de cauda longa**, o erro da tabela: ciclo médio de 48 dias com mediana de 21 faz a reunião planejar em cima de um caso raro. Segundo, **mediana não soma nem tira média**: a mediana do trimestre não é a média das medianas mensais, e a do time não é a média das medianas dos executivos; agregar percentil exige a série crua ou um histograma, que é por que o livro de SRE recomenda coletar contagens por faixa. Terceiro, **amostra pequena**: com 14 observações o p90 é praticamente o maior valor e oscila a cada caso novo; abaixo do n mínimo de 30 (decisão transversal 9) o p90 sai e o cartão escreve "amostra pequena". Quarto, **censura**: tempo até o primeiro contato só existe para quem já foi contatado; leads ainda sem contato somem da conta e deixam a mediana otimista, então o cartão escreve "fora da conta: 37 leads ainda sem contato". Quinto, **delta de mediana** precisa da mesma disciplina de n e de âncora do 1.2, e com n pequeno vira ruído. Sexto, **rótulo honesto**: "tempo médio" no rótulo com a mediana no número é mentira tipográfica.

**Versões sugeridas.**

* **V1 Básico.** Tempo até o primeiro contato na semana: mediana 6 h, p90 31 h, n = 412, com a régua da faixa interquartil. Público Pré-vendas.
* **V2 Com meta e anotação.** Ciclo de venda do trimestre com mediana de 21 dias, p90 de 74 dias, traço da meta de 30 dias na régua e a nota "a média, 48 dias, é puxada por 6 oportunidades acima de 120 dias". Público Comercial.
* **V3 Caso denso do Farol.** Tira de três cartões comparáveis (tempo até o primeiro contato, tempo até a agenda, tempo de aceite do handoff), todos com mediana, p90 e n, réguas com teto declarado e o SLA de cada etapa marcado. Públicos Pré-vendas e Comercial.
* **V4 Caso limite.** Amostra de 14 casos (p90 suprimido com "amostra pequena"), 37 leads censurados declarados fora da conta e ticket com um estorno negativo, excluído com a regra escrita no rodapé.

**Referências.**

* Praticante: [Google SRE Book, Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/). Observar a seção "Worrying About Your Tail", o exemplo da média de 100 ms com 1% das requisições em 5 segundos e a coleta por faixas de fronteiras aproximadamente exponenciais (aberto).
* Implementação: [Grafana, Calculation types](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/calculation-types/). Observar a lista de reduções (média, mediana, percentis de 1 a 99, último não nulo, contagem, amplitude), prova de que a estatística do número é uma escolha e deve ser declarada (aberto).
* Implementação: [Grafana, Stat](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/stat/). Observar o número único com sparkline de área e a opção de cálculo que reduz a série a um valor (aberto).
* Catálogo: [Data Viz Catalogue, Box Plot](https://datavizcatalogue.com/methods/box_plot.html). Observar mediana, quartis e atípicos, que a régua do cartão resume em quatro marcas (aberto; registrado no 1.26).
* Praticante: [Stephen Few, Introducing Bandlines, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/introducing_bandlines.pdf). Observar quartis e mediana usados como fundo para ler magnitude, parente próximo desta régua (PDF aberto; texto lido por extração local).
* Portal de design: nenhuma peça com mediana e percentil no mesmo cartão apareceu nas fontes consultadas; ver lacunas.

---

## Variações vistas nas fontes que foram fundidas ou descartadas

* **Selo de variação em pílula** (blocos de KPI do Tremor, com o percentual dentro de um selo). Fundido no 1.2: é um tratamento do delta, não um modelo; a pílula solta, fora do cartão, mora na família 24.
* **Borda lateral colorida no cartão** (um dos blocos de KPI do Tremor). Fundida no 1.21 e no 1.33 como o lugar da cor semântica, já que COR-7 proíbe fundo tingido atrás de texto.
* **Uso contra limite** (bloco "Requests" do Tremor, consumo contra teto). É o 1.8, trilho de capacidade; nada a acrescentar.
* **Cartão de cotação com variação de preço** (bloco com ticker de ativo). Descartado: cotação não é métrica de nenhum dos quatro públicos do Farol, e o delta absoluto com percentual já está no 1.2.
* **Medidor de ponteiro e velocímetro.** Mora na família 13; a crítica de Few ao espaço gasto para dizer pouco vale integralmente, e o anel do 1.32 é o máximo de forma circular que esta família aceita.
* **Modo de cor de fundo sólido** (painel Stat do Grafana). Descartado: pinta o cartão inteiro, contraria COR-7 e, aplicado a todos os cartões, anula o destaque (1.33).
* **Área de fundo atrás do número** (modo de gráfico em área do painel Stat). Fundida no 1.4, com a restrição EIX-2: sem escala a partir do zero, a área não é preenchida.
* **Botão de atualizar no cartão** (widget de frescor descrito pela Smashing; atualização manual do Data Studio). Fundido no 1.30 como opcional do Farol; o `Chart.tsx` do catálogo não faz `fetch` e não pode ter o botão funcional.
* **Esqueleto com brilho correndo.** Variação de animação do 1.29, não modelo; a recomendação é pulso lento sob `motion-safe`.
* **Anel com seções empilhadas** (exemplos radiais do shadcn/ui). Composição em arco mora na família 07; o 1.32 só aceita uma fração.
* **Distribuição por zona dentro do cartão** (bloco "Running" do Tremor, com faixas de frequência). É o 1.11 quando as partes somam o total, ou o 1.28 quando o interesse é quem mais contribuiu.
* **Contagem animada do número até o valor final** (microinterações de kits de Figma). Descartada como modelo: atrasa a leitura do dado principal, o render do catálogo desliga animação, e qualquer movimento no Farol passa por `useAnimateOnce`.

## Fontes consultadas

**Nota de método (2026-09-14).** Esta sessão retomou o arquivo a partir do modelo 1.28. A tabela de modelos, as decisões transversais e os modelos 1.1 a 1.27 vieram das sessões anteriores do estudo e foram mantidos sem alteração. A cota de busca web da sessão já estava esgotada (200 de 200), então os modelos 1.28 a 1.34 foram apoiados em abertura direta de páginas (19 das 25 permitidas, contando dois redirecionamentos) e em links já verificados por outras famílias deste estudo e por `00_portais-de-design.md`. Nas seções, "(aberto)" marca página lida; "(não abriu)" ou "não aberto" marca link que apareceu num resultado de busca sem ser aberto; link sem marca veio das sessões anteriores. São 79 links distintos citados.

**Abertas nesta sessão (conteúdo lido), modelos 1.28 a 1.34.**
- Praticantes: [Stephen Few, Common Pitfalls in Dashboard Design, em PDF](https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf) (texto extraído localmente; o resumo automático da página era impreciso); [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/); [NN/g, skeleton screens](https://www.nngroup.com/articles/skeleton-screens/); [Smashing Magazine, UX strategies for real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/); [Google SRE Book, Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/).
- Implementação: [Tremor, BarList](https://www.tremor.so/docs/visualizations/bar-list); [Tremor, ProgressCircle](https://www.tremor.so/docs/visualizations/progress-circle); [Tremor Blocks, KPI cards](https://blocks.tremor.so/blocks/kpi-cards); [shadcn/ui, Skeleton](https://ui.shadcn.com/docs/components/skeleton); [shadcn/ui, código do Line Chart Multiple](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-line-multiple.tsx); [Recharts, Simple Radial Bar Chart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/); [Grafana, Stat](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/stat/); [Grafana, Calculation types](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/calculation-types/); [Google Cloud, Manage data freshness no Data Studio](https://docs.cloud.google.com/looker/docs/studio/manage-data-freshness), alcançada a partir de [support.google.com/looker-studio/answer/7020039](https://support.google.com/looker-studio/answer/7020039), que redireciona.
- Abertas sem conteúdo aproveitável: [Carbon Design System, loading pattern](https://carbondesignsystem.com/patterns/loading-pattern/) (a leitura devolveu só a navegação); [Atlassian, box plot complete guide](https://www.atlassian.com/data/charts/box-plot-complete-guide) (idem). Nenhuma das duas é citada nos modelos.

**Abertas em sessões anteriores deste estudo (marcadas "aberto" nas seções).** [Anastasiya Kuznetsova, Anatomy of the KPI Card](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card); [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text); [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/); [Nightingale, Why I Stopped Using Bullet Graphs](https://nightingaledvs.com/why-i-stopped-using-bullet-graphs-and-what-i-now-use-instead/); [Nightingale, Dashboard Psychology](https://nightingaledvs.com/dashboard-psychology-effective-feedback-in-data-design/); [Stephen Few, especificação do bullet graph](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf); [Stephen Few, Introducing Bandlines](https://www.perceptualedge.com/articles/visual_business_intelligence/introducing_bandlines.pdf); [Stephen Few, Best Practices for Scaling Sparklines](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf); [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/); [Datawrapper, text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/); [Data Viz Catalogue, Box Plot](https://datavizcatalogue.com/methods/box_plot.html); [Wikipedia, Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law); [Wikipedia, High Output Management](https://en.wikipedia.org/wiki/High_Output_Management); [Tremor, BarList (endereço antigo)](https://www.tremor.so/docs/visualizations/barlist); [Highcharts Dashboards, componente KPI](https://www.highcharts.com/docs/dashboards/kpi-component); [shadcn/ui, código do Area Chart Interactive](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-area-interactive.tsx); [shadcn/ui, galeria de gráficos de área](https://ui.shadcn.com/charts/area); [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics); Behance: [Analytics Metric Cards UI](https://www.behance.net/gallery/255429155/Analytics-Metric-Cards-UI), [Modern KPI Dashboard Cards UI Kit 2025](https://www.behance.net/gallery/227305143/Modern-KPI-Dashboard-Cards-UI-Kit-2025), [Dark-Themed Business Management Dashboard UI](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI). Aberta com erro 403: [Stacey Barr, 3 problems with traditional KPI traffic lights](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/).

**Vistas em resultado de busca, não abertas.** [SWD, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty); [FlowingData, Visualizing the Uncertainty in Data](https://flowingdata.com/2018/01/08/visualizing-the-uncertainty-in-data/); [Clearly and Simply, An Alternative Design of Bullet Graphs](https://www.clearlyandsimply.com/clearly_and_simply/2017/05/an-alternative-design-of-bullet-graphs.html); [IBCS, avaliação do bullet graph](https://www.ibcs.com/resource/ibcs-evaluation-bullet-graphs/); [Smart Frames UI, rethinking RAG colours](https://smart-frames.co.uk/2025/01/23/rethinking-rag-colours-in-business-intelligence-tools/); [Kat Greenbrook, The end of traffic light dashboards](https://www.linkedin.com/pulse/end-traffic-light-dashboards-kat-greenbrook); [Datawrapper Academy, patchy data](https://academy.datawrapper.de/article/321-patchy-data); [Datawrapper Academy, what to consider when creating line charts](https://academy.datawrapper.de/article/129-what-to-consider-when-creating-line-charts); [Data Viz Project, Win loss Sparkline](https://datavizproject.com/data-type/win-loss-sparkline/); [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart); [Recharts, BandedChart](https://recharts.github.io/en-US/examples/BandedChart/); Dribbble: [tag kpi-cards](https://dribbble.com/tags/kpi-cards), [tag sparkline](https://dribbble.com/tags/sparkline), [SaaS Analytics Dark Dashboard](https://dribbble.com/shots/23673869-SaaS-Analytics-Dark-Dashboard), [UI Progress Indicator Percentage Ring Chart](https://dribbble.com/shots/4069776-UI-Progress-Indicator-Percentage-Ring-Chart); Behance: [Sales Dashboard Design](https://www.behance.net/gallery/205112599/Sales-Dashboard-Design?locale=en_US); Figma Community: [KPI Dashboard with micro interactions](https://www.figma.com/community/file/1577537133533397367/kpi-dashboard-with-micro-interactions), [Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit).

**Herdadas das sessões anteriores sem marca de abertura (modelos 1.1 a 1.27).** Catálogos: [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/), [Column Sparkline](https://datavizproject.com/data-type/column-sparkline/) e [Bullet Graph](https://datavizproject.com/data-type/bullet-graph/); [Data Viz Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html); [FT Visual Vocabulary, README](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md); [Wikipedia, Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph). Praticantes: [Stephen Few, Bar Widths and the Spaces in Between](https://www.perceptualedge.com/articles/visual_business_intelligence/bar_widths.pdf); [Datawrapper Academy, formatos numéricos personalizados](https://academy.datawrapper.de/article/207-custom-number-formats-that-you-can-display-in-datawrapper); [Datawrapper Academy, células vazias exibidas como zero](https://www.datawrapper.de/academy/my-empty-cells-get-displayed-as-zeros-in-tooltips); [Bernard Marr, traffic light colours e RAG ratings](https://bernardmarr.com/performance-reporting-how-to-use-traffic-light-colours-and-rag-ratings-in-dashboards/). Implementação: [Recharts, galeria de exemplos](https://recharts.github.io/en-US/examples/), [TinyLineChart](https://recharts.github.io/en-US/examples/TinyLineChart/) e [TinyBarChart](https://recharts.github.io/en-US/examples/TinyBarChart/); [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart), [Tracker](https://www.tremor.so/docs/visualizations/tracker) e [data bars](https://npm.tremor.so/docs/visualizations/data-bars); [shadcn/ui, galeria de gráficos](https://v3.shadcn.com/charts); [Nivo, Bump chart](https://nivo.rocks/bump/). Portais: Dribbble, [Dashboard Card Stats Metrics TailwindCSS](https://dribbble.com/shots/15261147-Dashboard-Card-Stats-Metrics-TailwindCSS-Component), [Bar Chart Dashboard Card Dark Theme](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme) e [tag kpi-dashboard](https://dribbble.com/tags/kpi-dashboard); Figma Community, [Mobile Dashboard, charts e KPI widgets](https://www.figma.com/community/file/1528308765361625218/mobile-dashboard-charts-kpi-widgets), [KPI Charts](https://www.figma.com/community/file/1130917765288346079/kpi-charts), [Dashboard UI Kits Series](https://www.figma.com/community/file/1347448012996114787/dashboard-ui-kits-series) e [Dashboard Cards](https://www.figma.com/community/file/969677870366908785/dashboard-cards).

**Lacunas.**
- Sem busca web nesta sessão, os modelos 1.28 a 1.34 não têm referência nova de Andy Kirk, Alberto Cairo, FlowingData ou Information is Beautiful Awards; os praticantes citados são Few, Tufte, NN/g, Smashing e o livro de SRE.
- Nenhum projeto de Behance, shot de Dribbble ou arquivo de Figma Community específico de esqueleto de KPI, de carimbo de frescor ou de mediana com percentil no cartão foi encontrado; nos modelos 1.29, 1.30 e 1.34 o portal citado é aproximação ou está declarado ausente.
- Nenhum catálogo clássico (Data Viz Project, Data Viz Catalogue, FT Visual Vocabulary) trata carregamento, frescor ou ponto de ação como tipo de gráfico; as referências desses três modelos são de sistemas de design e de ferramentas de monitoramento.
- A origem da ideia de indicadores pareados em Andy Grove (1.25) segue sem fonte aberta que a confirme.
- As 25 referências herdadas sem marca de abertura não foram reabertas nesta sessão.
