# 19 Cascata (waterfall)

> Família do catálogo VISUAIS do Farol. Estudo feito em 2026-09-14. Todos os casos de uso são fictícios; nomes de pessoas, plataformas e produtos são rótulos genéricos.
> Stack alvo: React 18.3 + TypeScript strict + Recharts 3.10 + Tailwind 4 + lucide-react. Bibliotecas de terceiros aparecem só como referência de desenho.

## O que a família responde

A cascata mostra **como um valor inicial vira um valor final** passando por acréscimos e decréscimos em sequência. Colunas de início e fim partem do eixo; as intermediárias flutuam, cada uma começando onde a anterior terminou (SWD, Wikipedia). Também é chamada de bridge (finanças), flying bricks ou Mario chart (Wikipedia). O FT a coloca em "parte do todo", como a forma de parte do todo que aceita componentes negativos.

Perguntas típicas no Farol:

* Por que a receita reconhecida do trimestre saiu de X para Y? (novos, expansão, cancelamentos, diluição)
* Onde as entradas do funil se perdem até virar ganho? (perdas por motivo em ponte)
* De que é feito o custo total? (custo em três camadas, com subtotal)
* O que mudou no forecast desde a semana passada? (novas, avanços, perdas, datas que deslizaram)
* O que explica a diferença entre dois períodos, por componente? (CPL por efeito volume, custo e mix)
* Como o saldo evoluiu período a período? (fila de pré-vendas ao longo da semana)
* Quanto falta até a meta, e de onde veio o que já foi feito? (ponte até a meta)

## Regras que valem para a família inteira

1. **Início e fim no eixo; intermediárias flutuam** (SWD, Power BI). Subtotais também partem do eixo.
2. **Três papéis de cor:** aumento, queda e total. Cor por **polaridade** da métrica (custo que sobe é ruim); acrescentar sinal no rótulo para não depender só de verde e vermelho (Zebra BI registra o verde e vermelho como convenção financeira; o sinal textual cobre daltonismo).
3. **Conectores horizontais** entre o topo de uma coluna e a base da próxima guiam o olho (SWD).
4. **Não truncar o eixo** para exagerar variações pequenas diante de totais grandes; se a história está nas variações, usar a cascata de variação por componente sem as colunas de total, ou declarar a quebra (SWD alerta para essa tentação).
5. **Os números têm de fechar.** Soma das variações = fim menos início; subtotais calculados no dado e não pelo gráfico (Zebra BI). Arredondamento de rótulo não pode quebrar o fechamento.
6. **Sinais opostos no mesmo passo** empilhados ficam ilegíveis; separar em passos (Peltier).
7. **No Recharts**, a forma robusta é a **barra de faixa**: `dataKey` devolvendo `[baixo, alto]`, que cruza o zero sem truque (o exemplo oficial Waterfall usa exatamente isso). O truque antigo de série transparente empilhada (ECharts `bar-waterfall`, Peltier) quebra quando a série cruza o zero.
8. **`Cell` está deprecado**; cor por tipo de passo vai no `shape`.

9. **Rótulo em toda coluna.** Retângulo flutuante sem linha de base comum não se lê no eixo; o Datawrapper recomenda rotular todos os números sempre que couber, e a SWD registra a crítica de origem: a cascata pede comparação de objetos que flutuam no espaço.
10. **A ordem é a narrativa.** Cronológica, por bloco lógico, ou ganhos primeiro e perdas depois (a SWD nota que agrupar assim dá ao gráfico um arco regular, mais fácil de ler). Declarar o critério na legenda.
11. **Orientação pelo tipo de eixo.** Tempo corre da esquerda para a direita; quebra estrutural desce de cima para baixo. Atenção ao vocabulário: o Zebra BI chama de "horizontal" o gráfico com categorias no eixo horizontal, o inverso do uso comum neste catálogo; vale ler o critério, não o rótulo.
12. **A cascata não é intuitiva para leigos.** No desafio de cascata da SWD, teste com usuários devolveu "por que as barras estão flutuando?"; legenda de papéis, seta de direção e rótulo de eixo deixam de ser enfeite.
13. **Zoom nas diferenças em vez de eixo quebrado.** Quando as variações são minúsculas diante dos totais, o Datawrapper sugere remover as colunas de total ou soltá-las como ponto flutuante, e avisa que marcador de quebra de eixo em coluna de total é pior que o problema: o leitor compara alturas mesmo assim.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 19.1 | Cascata de ponte | Explicar a passagem de um valor inicial a um final | Mais de ~12 passos | Não fechar a conta entre início, passos e fim |
| 19.2 | Cascata com subtotais | Blocos lógicos com parciais (receita líquida, custo variável) | Subtotal que ninguém usa | Misturar subtotal acumulado com subtotal de bloco |
| 19.3 | Cascata horizontal | Rótulos longos (motivos de perda, linhas de custo) | Passos com ordem temporal | Conectores sem alinhamento vertical |
| 19.4 | Cascata de variação por componente | Diferença entre dois períodos decomposta por componente | Componentes que não somam a diferença | "Outros" que não fecha o residual |
| 19.5 | Cascata de decomposição | Total quebrado em partes até zero (ou até o gap da meta) | Partes sem ordem de leitura | Partes que não somam o total escondidas |
| 19.6 | Cascata temporal de saldo | Saldo que evolui por período com entradas e saídas | Mais de ~24 períodos | Esconder o saldo final |
| 19.7 | Cascata empilhada | Cada passo decomposto em componentes do mesmo sinal | Componentes de sinais opostos no mesmo passo | Paleta de componentes que briga com aumento e queda |
| 19.8 | Cascata aninhada | Ponte que abre em outra ponte dentro do passo escolhido | Hierarquia sem nível intermediário real | Nível filho que não soma o passo pai |
| 19.9 | Cascata em pequenos múltiplos | A mesma ponte repetida por segmento, executivo ou plataforma | Escalas muito diferentes entre os painéis | Cada painel com escala própria e comparação falsa |
| 19.10 | Cascata de previsão | Realizado até hoje mais projetado até o fim do período | Projeção sem tratamento visual distinto | Projetado pintado igual ao realizado |
| 19.11 | Cascata pareada | Duas pontes do mesmo desenho lado a lado, plano contra real | Perguntas que cabem numa ponte de variação | Escalas independentes nos dois lados |
| 19.12 | Cascata com faixa de cenário | Passos com incerteza declarada e saída em faixa | Quando existe número único auditável | Faixa desenhada só no total, escondendo onde nasce a incerteza |


---

## 19.1 Cascata de ponte

**Descrição.** A forma canônica: coluna de início no eixo, passos flutuantes de aumento e queda, coluna de fim no eixo. A Wikipedia registra os apelidos (bridge, flying bricks, Mario chart) e a origem na McKinsey. O Datawrapper resume a vocação: mostrar **o caminho entre dois valores**, quando as partes importam tanto quanto o total e o dado tem sinais opostos.

**Anatomia.** Eixo Y em zero; coluna inicial cheia; passos flutuantes com base no acumulado anterior; conectores horizontais ligando topo de um a base do próximo; coluna final cheia; rótulo com sinal em cada passo; legenda de três papéis (aumento, queda, total).

**Abordagem na stack.** `recharts-custom`. `BarChart` + um único `Bar dataKey="faixa"` com `[baixo, alto]` por linha, exatamente como o exemplo oficial Waterfall do Recharts, e `shape` customizado escolhendo a cor por `isTotal` e pelo sinal. Conectores como `ReferenceLine` por passo é frágil; melhor desenhá-los dentro do próprio `shape` (cada barra emite seu segmento até a próxima) ou numa camada `<Customized>` que recebe as coordenadas. `LabelList` com `formatter` para o sinal.

**Ponto delicado.** O pré-cálculo em TypeScript é o gráfico inteiro: um `reduce` que devolve `{ nome, faixa: [baixo, alto], delta, tipo }`. Coluna de total precisa ancorar em zero mesmo quando o acumulado é negativo (o helper do exemplo oficial trata isso indo de zero ao mínimo). Passo de valor zero vira barra de altura zero e some: renderizar um traço de 2 px na altura do acumulado com o rótulo "0". E a conta precisa fechar: validar `soma(deltas) === fim - inicio` em teste, não na revisão visual.

**Versões sugeridas.**
- **V1 básica: ponte da receita reconhecida do trimestre.** Início no trimestre anterior, quatro passos (novos contratos, expansão, reajuste, cancelamentos) e fim no trimestre atual.
- **V2 com anotação: o passo que explica tudo.** O maior passo em cor cheia, o resto em neutro, e uma nota ancorada ("cancelamentos tiraram 2 pontos do crescimento"). Título de conclusão em vez de título descritivo, como a SWD faz no recap do desafio.
- **V3 densa do Farol: ponte da receita com doze passos e diluição.** Receita de um contrato imobiliário fictício reconhecida em quatro parcelas mensais aparece como quatro passos pequenos; acima de doze passos, agregar a cauda em "demais (7)" com desdobramento no clique.
- **V4 caso limite: acumulado que cruza o zero.** Mês de cancelamento pesado em que o acumulado fica negativo no meio da ponte; a barra de faixa atravessa o eixo sem truque, e uma linha de zero em `--border` fica visível por cima do fundo escuro.

**Referências.**
- Catálogo: [Recharts, exemplo Waterfall](https://recharts.github.io/en-US/examples/Waterfall/): observar `computeWaterfallData` devolvendo `[baixo, alto]`, o `shape` `WaterfallBar` e as colunas de total ancoradas em zero.
- Catálogo: [Wikipedia, waterfall chart](https://en.wikipedia.org/wiki/Waterfall_chart): observar os apelidos, a origem na McKinsey e a menção a múltiplas colunas de total e a valores que cruzam o eixo.
- Praticante: [Storytelling with Data, what is a waterfall](https://www.storytellingwithdata.com/blog/2020/11/16/what-is-a-waterfall): observar a explicação do "fim da barra anterior é a base da próxima" e o alerta de que barras flutuantes não se comparam entre si.
- Praticante: [Datawrapper, what to consider when creating waterfall charts](https://www.datawrapper.de/blog/waterfall-charts-guide): observar as três cores, a recomendação de rotular tudo e a proibição de marcador de quebra de eixo em coluna de total.
- Portal de design: [Dribbble, Waterfall Chart de Shashank Sahay](https://dribbble.com/shots/4936758-Waterfall-Chart) (não abriu): apareceu na busca por cascata; observar o tratamento de rótulo e conector num shot de interface.

**Mora melhor em outra família?** Se não há sinais opostos e o total não interessa, barra simples (02 ou 03). Se a pergunta é a queda etapa a etapa de um mesmo conjunto, funil (10).

---

## 19.2 Cascata com subtotais

**Descrição.** A ponte ganha colunas intermediárias que voltam ao eixo e fecham um bloco lógico. A Wikipedia descreve o recurso como "subtotais intermediários representados por colunas inteiras entre as colunas flutuantes"; o Datawrapper implementa via coluna extra de categoria no dado; o AG Charts declara num array `totals` com índice e rótulo. É a forma que a busca chama de bridge propriamente dita: ponte com paradas.

**Anatomia.** Blocos separados por vão maior; subtotal ancorado no eixo com cor de total; dentro do bloco, os passos flutuantes; rótulo do subtotal com nome do estágio, não só o número; conector que morre no subtotal e renasce depois dele.

**Abordagem na stack.** `recharts-custom`. Mesmo `Bar` de faixa, com `tipo: 'subtotal'` na linha, e o `shape` dando a esse tipo o preenchimento de total. O vão de bloco não sai de `barGap`; sai de linhas espaçadoras no array de dados (uma entrada vazia com `faixa: null`) ou de `ReferenceArea` pintando a faixa do bloco ao fundo.

**Ponto delicado.** Dois tipos de subtotal se confundem: o **acumulado** (soma de tudo até aqui) e o **de bloco** (soma só do bloco). Misturar os dois no mesmo gráfico quebra a leitura. Escolher um, declarar no rótulo e calcular no dado, nunca deixando o componente somar rótulos já arredondados. Subtotal de valor próximo de zero vira sliver: mostrar o número fora da barra.

**Versões sugeridas.**
- **V1 básica: custo em três camadas.** Camada 1 (marginal), subtotal; camada 2 (estrutura de área), subtotal; camada 3 (rateio corporativo), total. A Diretoria lê as três camadas sem precisar de três gráficos.
- **V2 com destaque: a camada que vira a conclusão.** Bloco da camada 1 em cor cheia e os outros dois esmaecidos, com nota "o mesmo cenário vale 2,60x, 1,08x e 0,08x conforme a camada; a camada tem de vir declarada".
- **V3 densa do Farol: da entrada bruta ao ganho, com quatro paradas.** Entradas do mês, descontos de duplicata e fora de perímetro, subtotal "entradas válidas"; perdas de contato e de agenda, subtotal "chegou à pré-venda"; declínios por fit, subtotal "passou para vendas"; perdas de proposta, total "ganhos".
- **V4 caso limite: bloco com saldo zero.** Um bloco em que os aumentos anulam as quedas e o subtotal repete o anterior; marcar o subtotal com rótulo "sem efeito líquido" para o leitor não achar que o gráfico travou.

**Referências.**
- Catálogo: [AG Charts, customised waterfall](https://www.ag-grid.com/charts/gallery/customised-waterfall/): observar o array `totals` com índice e rótulo, os estilos separados de `item.positive`, `item.negative` e `item.total`, e o conector tracejado configurável.
- Catálogo: [Datawrapper Academy, customizing your waterfall chart](https://www.datawrapper.de/academy/customizing-your-waterfall-chart): observar a coluna de categoria que gera os subtotais, a escolha entre diferenças e totais corridos e o rótulo editável de subtotal.
- Praticante: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar a taxonomia de tipos e a recomendação de posicionar a coluna de total numa ponta para separar contribuintes de acumulados.
- Praticante: [Zebra BI, Power BI horizontal waterfall charts explained](https://zebrabi.com/power-bi-waterfall-charts-explained/): observar o recurso "Result" que transforma uma categoria em subtotal ancorado e a recomendação de rotular e distinguir visualmente cada parada.
- Portal de design: [Figma Community, Net Revenue Waterfall Chart Generator](https://www.figma.com/community/plugin/1620729787813298870/net-revenue-waterfall-chart-generator) (não abriu): plugin que monta ponte de receita líquida a partir de CSV; apareceu na busca como referência de layout com paradas.

**Mora melhor em outra família?** Se o interesse é só a composição final e não o caminho, barra empilhada (02) ou rosca (07). Se as paradas são etapas de um processo com perda proporcional, funil (10).

---

## 19.3 Cascata horizontal

**Descrição.** A mesma ponte deitada: barras correndo no eixo X e categorias empilhadas no eixo Y. A Inforiver dá o motivo principal: rótulo de categoria longo, que na vertical obriga a truncar ou girar o texto. No recap do desafio da SWD, vários participantes chegaram sozinhos à versão deitada pelo mesmo motivo. O AG Charts mantém entrada própria de horizontal waterfall na galeria.

**Anatomia.** Eixo X com a escala de valor e zero visível; eixo Y com os nomes alinhados à direita, na ordem de leitura; barras flutuantes; conectores **verticais** ligando a ponta direita de uma barra à esquerda da próxima; início e fim ancorados no zero; rótulo à direita de cada barra.

**Abordagem na stack.** `recharts-custom` com `layout="vertical"`: `XAxis type="number"`, `YAxis type="category" dataKey="nome" width={...}`, e o mesmo `Bar` de faixa. O conector muda de eixo e passa a ser um segmento vertical; recalcular no `shape` usando `x + width` em vez de `y`. Largura do `YAxis` tem de ser medida, não chutada: calcular pelo maior rótulo em TypeScript e dar teto com reticências via `tick` customizado.

**Ponto delicado.** Em lista longa, o gráfico cresce em altura e o eixo X some no topo; fixar o eixo ou repetir a régua embaixo. O conector vertical precisa cair exatamente no centro da faixa entre as duas barras, senão parece erro de renderização; usar o `bandwidth` calculado da escala categórica, não uma constante. Ordem em cascata horizontal é vertical: a leitura desce, então a ordem cronológica fica antinatural e é melhor reservar a horizontal para quebras estruturais, como o Zebra BI recomenda.

**Versões sugeridas.**
- **V1 básica: perdas por motivo.** "Não fit", "sem contato", "sem orçamento", "concorrência", "prazo" com nomes inteiros legíveis, do maior para o menor, fechando no total perdido.
- **V2 com destaque: as perdas pré-venda contra as de venda.** Bloco superior com os motivos pré-venda em uma cor, bloco inferior com os de venda em outra, subtotal em cada bloco e nota "96% das perdas acontecem antes da proposta".
- **V3 densa do Farol: linhas de custo da área.** Quinze linhas com nomes compridos (ferramenta de automação, plataforma de dados, mídia, comissão variável) somando o custo total do mês; cauda agrupada em "demais linhas (6)" que abre no clique.
- **V4 caso limite: rótulo que não cabe em telefone.** Abaixo de 640 px o `YAxis` sai e cada barra carrega rótulo interno de duas linhas com valor à direita; se ainda não couber, a tela troca para a tabela visual (14) com barrinha embutida.

**Referências.**
- Catálogo: [AG Charts, horizontal waterfall chart](https://www.ag-grid.com/charts/gallery/horizontal-waterfall/) (não abriu; apareceu listado na galeria): observar que a biblioteca trata a orientação como variante de primeira classe e não como ajuste.
- Catálogo: [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): observar as três entradas de cascata (simples, horizontal e customizada) e o fato de serem recurso enterprise.
- Praticante: [Storytelling with Data, recap do desafio da cascata](https://www.storytellingwithdata.com/blog/2018/5/15/may-swdchallenge-recap-the-waterfall-chart): observar as versões deitadas enviadas pela comunidade e o motivo declarado (rótulo longo e legibilidade).
- Praticante: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar a regra explícita de usar orientação horizontal para rótulo de categoria comprido.
- Portal de design: [Dribbble, Waterfall NPS Chart de Gregory Muryn-Mukha](https://dribbble.com/shots/6710427-Waterfall-NPS-Chart) (não abriu): segundo a busca, cascata horizontal de fatores de NPS; observar como cada fator vira linha nomeada.

**Mora melhor em outra família?** Se as barras não flutuam e todas partem do zero, barras horizontais (02). Se a lista passa de vinte linhas e o total deixa de importar, tabela visual (14).

---

## 19.4 Cascata de variação por componente

**Descrição.** A ponte não liga dois estoques; ela **decompõe uma diferença**. Sai do valor do período A, atravessa os efeitos que explicam a mudança e chega ao período B. Na literatura financeira é o bridge de preço, volume e mix (PVM) e o margin bridge; a Inforiver chama de variance waterfall e de breakdown waterfall quando a quebra é por geografia ou categoria. O ponto que a torna um modelo próprio é que os passos são **efeitos calculados**, não linhas do razão.

**Anatomia.** Duas colunas cheias nas pontas com os valores dos dois períodos; no meio, um passo por efeito, com nome do efeito e sinal; um passo "residual" explícito quando a decomposição não fecha; rótulo em pontos percentuais quando a métrica é taxa.

**Abordagem na stack.** `recharts-custom`, idêntico ao 19.1 na renderização. O peso está no TypeScript: a função que produz os efeitos precisa ser pura, testada e devolver o residual. Uma variante útil é `html-tailwind` para a versão compacta em card: cinco retângulos com `flex` e largura proporcional, sem eixo, quando o gráfico é só uma tira dentro de um KPI.

**Ponto delicado.** A decomposição tem que somar a diferença **por construção**. Efeito mix é o mais malcalculado; se o modelo não fecha, o honesto é um passo "não explicado" visível e não um "outros" silencioso que absorve o erro. Segundo: quando a métrica é um quociente (CPL, ticket, margem), a soma dos efeitos é em unidades da métrica, não em reais, e o rótulo tem de dizer isso. Terceiro: se o dado da origem é rótulo declarado e não trilha medida, a ponte herda a incerteza; marcar a etiqueta da fonte no rodapé.

**Versões sugeridas.**
- **V1 básica: CPL de um mês para o outro.** CPL de agosto, efeito volume, efeito custo, efeito mix de plataforma, CPL de setembro.
- **V2 com anotação: o efeito que ninguém esperava.** Efeito mix destacado com nota "a troca de plataforma explica mais que o aumento de investimento"; os outros em neutro.
- **V3 densa do Farol: receita do semestre contra o anterior, por componente.** Novos clientes, expansão de clientes existentes, reajuste, redução de escopo, cancelamento, mais um passo "não conciliado" para a parte que o financeiro não casa com o CRM.
- **V4 caso limite: componentes que não somam.** Quando a diferença tem 18% sem explicação, a ponte mostra o passo "não explicado" hachurado, com rodapé dizendo o que falta medir; a alternativa de esconder o resíduo está proibida.

**Referências.**
- Catálogo: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar as definições de variance waterfall, breakdown waterfall e combination waterfall, que separam variação de valor absoluto.
- Catálogo: [Vega-Lite, waterfall chart of monthly profit and loss](https://vega.github.io/vega-lite/examples/waterfall_chart.html): observar o `window` de soma corrida, `y` em `previous_sum` e `y2` em `sum`, o conector como `rule` via `lead` e o rótulo com prefixo de sinal.
- Praticante: [Zebra BI, price volume mix analysis in Power BI](https://zebrabi.com/price-volume-mix-analysis-power-bi/) (não abriu; apareceu na busca): observar a decomposição de receita em preço, volume e mix apresentada como ponte.
- Praticante: [Rohit Patel, how to do the price-volume-mix waterfall right](https://medium.com/quickai-app/how-to-do-the-price-volume-mix-waterfall-right-6723f5ed2920) (não abriu; apareceu na busca): observar o alerta de que o efeito mix é o mais atribuído errado.
- Portal de design: [Figma Community, Waterfal charts](https://www.figma.com/community/plugin/1180125043621224219/waterfal-charts) (não abriu): plugin de cascata a partir de dados; apareceu na busca por componentes de cascata.

**Mora melhor em outra família?** Se a decomposição tem hierarquia de dois ou três níveis e o interesse é a árvore, hierarquia (12). Se o que importa é o fluxo entre origens e destinos, Sankey (11).

---

## 19.5 Cascata de decomposição

**Descrição.** Ponte sem segundo estoque: parte de um total e desce até zero (ou sobe do zero até o total), com cada passo sendo uma parte. A busca registra as duas direções: **build-up**, em que os componentes se somam até o total, e a quebra do total, em que ele é consumido pelas partes. O Datawrapper alerta que, se o total não interessa e todas as partes têm o mesmo sinal, a barra simples é melhor; a decomposição só ganha quando há partes negativas ou quando o "resto até zero" é a conclusão.

**Anatomia.** Coluna de total ancorada numa ponta; passos consumindo ou construindo; barra final chegando em zero (ou no total); cada passo rotulado com valor e participação percentual; nenhuma coluna intermediária de total.

**Abordagem na stack.** `recharts-custom` quando há eixo e escala; `html-tailwind` quando a peça é uma tira dentro de um card de KPI, com `div` de largura percentual e `title` para o valor. A variante "até o gap da meta" ganha uma `ReferenceLine` no valor da meta, com o último passo sendo o gap restante em cor de alerta.

**Ponto delicado.** A ordem tem de ser defensável: por tamanho, por bloco de negócio ou pela sequência de decisão. Ordem arbitrária faz a mesma decomposição contar histórias diferentes. Parte que vale menos de 2% do total desaparece: agrupar em "demais" com desdobramento, e nunca deixar sliver de 1 px sem rótulo. Se todas as partes são positivas e somam o total, conferir se a pergunta não era simplesmente composição, caso em que a família 02 ou 07 responde melhor com menos tinta.

**Versões sugeridas.**
- **V1 básica: de onde vem o custo marginal.** Mídia, ferramentas, comissão e brindes somando o custo variável do mês, do maior ao menor.
- **V2 com destaque: ponte até a meta.** Meta anual como coluna cheia; realizado, contratado mas não reconhecido, pipeline ponderado; o último passo é o gap, em `--warning`, com nota "faltam X para a meta considerando o pipeline ponderado".
- **V3 densa do Farol: a entrada bruta do mês até o ganho.** Total de entradas, menos duplicatas, menos fora de perímetro, menos sem contato, menos declínio por fit, menos perdas na proposta, chegando ao número de ganhos; a cauda estreita no fim exige rótulo externo.
- **V4 caso limite: partes sem dado.** Três linhas de custo que a controladoria não devolveu viram um passo hachurado "sem medição", contado no total mas marcado como não auditado, com etiqueta LACUNA no rodapé.

**Referências.**
- Catálogo: [Datawrapper, what to consider when creating waterfall charts](https://www.datawrapper.de/blog/waterfall-charts-guide): observar o critério de quando a barra simples vence a cascata e a recomendação de ordenar por tamanho ou cronologia conforme a história.
- Catálogo: [Recharts, exemplo Waterfall](https://recharts.github.io/en-US/examples/Waterfall/): observar que a mesma estrutura de faixa serve para decomposição, bastando declarar apenas uma coluna de total.
- Praticante: [Storytelling with Data, what is a waterfall](https://www.storytellingwithdata.com/blog/2020/11/16/what-is-a-waterfall): observar o conselho de agrupar ganhos e perdas para dar ao gráfico um arco regular.
- Praticante: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar o "measure-only waterfall", que compara medidas sem categorias, o parente mais próximo da decomposição pura.
- Portal de design: [Figma Community, Waterfall (Design)](https://www.figma.com/community/file/1099626340704948588/waterfall-design) (não abriu): arquivo comunitário de cascata; apareceu na busca por componente de cascata em Figma.

**Mora melhor em outra família?** Partes todas positivas e total secundário: barras (02) ou rosca (07). Quebra do total em blocos com área proporcional: mosaico (26) ou hierarquia (12).

---

## 19.6 Cascata temporal de saldo

**Descrição.** Cada passo é um período, e o valor do passo é a variação líquida daquele período; o acumulado é o saldo. O exemplo do Vega-Lite é exatamente isso (lucro e prejuízo mês a mês somando o resultado do ano), e o AG Charts usa o índice diário de uma bolsa em outubro com um total mensal no fim. O Zebra BI recomenda a orientação com o tempo correndo da esquerda para a direita justamente para este caso.

**Anatomia.** Eixo X temporal com todos os períodos, inclusive os de variação zero; barras de variação líquida; conectores desenhando a linha do saldo; coluna de saldo final ancorada no eixo; opcionalmente uma linha fina por cima ligando os acumulados, que é o mesmo dado lido como série.

**Abordagem na stack.** `recharts-custom` com `ComposedChart`: o `Bar` de faixa desenha as variações e uma `Line` com `dataKey="acumulado"` e `dot={false}` sobrepõe o saldo, tornando o conector desnecessário. Eixo temporal com `XAxis` categórico de rótulos curtos; se o período é denso, `interval` controlado em vez de rótulo girado.

**Ponto delicado.** Período sem movimento tem de aparecer como espaço, não sumir do eixo, senão o tempo deixa de ser contínuo. Acima de vinte e quatro períodos a cascata vira ruído: ou agrega (semana para mês) ou troca para linha do acumulado com barras de variação embaixo, que é o combinado (08). E o saldo final não pode ficar implícito: coluna ancorada com rótulo, porque a leitura do último topo flutuante é justamente o que o olho erra.

**Versões sugeridas.**
- **V1 básica: fila de pré-vendas na semana.** Saldo de segunda, entradas e saídas por dia, saldo de sexta.
- **V2 com anotação: o dia em que a fila estourou.** A barra do dia de maior entrada destacada com nota "entradas de um único disparo levaram a fila acima do teto de capacidade", com `ReferenceLine` no teto.
- **V3 densa do Farol: saldo de oportunidades abertas por mês, doze meses.** Entradas menos ganhos menos perdas menos as que passaram de trinta dias paradas; a linha do acumulado por cima mostra que o estoque cresce enquanto o fluxo não muda.
- **V4 caso limite: saldo que fica negativo.** Mês de expurgo em que as saídas superam o estoque e o acumulado cruza o zero; a barra de faixa atravessa o eixo e o rótulo do saldo vai para fora da barra, do lado que tem espaço.

**Referências.**
- Catálogo: [Vega-Lite, waterfall chart of monthly profit and loss](https://vega.github.io/vega-lite/examples/waterfall_chart.html): observar o tratamento especial das entradas "Begin" e "End" e a cor neutra reservada aos totais.
- Catálogo: [AG Charts, customised waterfall](https://www.ag-grid.com/charts/gallery/customised-waterfall/): observar a série diária de um mês inteiro com um único total declarado no índice 10 e rótulo "Monthly Net".
- Praticante: [Zebra BI, Power BI horizontal waterfall charts explained](https://zebrabi.com/power-bi-waterfall-charts-explained/): observar o critério de orientação (tempo do mais antigo ao mais novo; quebra estrutural de cima para baixo) e a ressalva de vocabulário.
- Praticante: [Apache ECharts, handbook, waterfall](https://echarts.apache.org/handbook/en/how-to/chart-types/bar/waterfall/): observar a série auxiliar transparente e a separação em série positiva e negativa, técnica que a série temporal expõe ao cruzar o zero.
- Portal de design: [Dribbble, Waterfall Chart designs (tag)](https://dribbble.com/tags/waterfall-chart) (não abriu; a página voltou vazia): tag de cascata usada para varredura de referências de interface.

**Mora melhor em outra família?** Se a pergunta é a trajetória do saldo e não a contribuição de cada período, linha (04) ou área (05). Se são variações e acumulado juntos com escalas diferentes, combinado e eixo duplo (08).

---

## 19.7 Cascata empilhada

**Descrição.** Cada passo flutuante se divide em segmentos de origem. A Peltier descreve a leitura: mostrar a contribuição de várias séries em cada categoria, empilhando dentro das barras flutuantes. É o modelo que responde "quem contribuiu com o quê em cada passo", mas carrega o defeito estrutural da família: **não se empilha positivo com negativo**. A Peltier resolve com um "Mixed bar" de preenchimento hachurado, ou com o Split Bar Waterfall, que divide a barra ao meio e empilha positivos à esquerda e negativos à direita.

**Anatomia.** Barras flutuantes segmentadas; legenda de componentes separada da legenda de papéis (aumento, queda, total); rótulo do passo com o líquido, e o detalhe por segmento só no tooltip; total ancorado sem segmentação ou com a mesma paleta, nunca com as duas convenções ao mesmo tempo.

**Abordagem na stack.** `svg-puro`. O `Bar` de faixa do Recharts entrega um retângulo por linha, e empilhar dentro dele exige que o `shape` desenhe N `rect`, o que já é SVG à mão com as escalas do Recharts por baixo; quando a peça tem legenda, tooltip e realce por segmento, é mais limpo calcular a geometria inteira em TypeScript e emitir o `<svg>`. Escalas: uma função linear valor para pixel escrita à mão, com domínio vindo do mínimo e do máximo do acumulado.

**Ponto delicado.** Duas paletas brigam: a de polaridade (sobe, desce, total) e a de componente. Resolver escolhendo **uma** delas para o preenchimento e a outra para um sinal secundário (borda, seta no rótulo, ícone). Se um passo tem componentes de sinais opostos, dividir em dois passos, como a regra 6 da família manda, e só usar a barra mista quando não houver alternativa, sempre com hachura e nota. Terceiro ponto: o tooltip precisa dizer o líquido do passo e o bruto do segmento, senão o leitor soma errado.

**Versões sugeridas.**
- **V1 básica: ganhos e perdas do mês por executivo.** Passo "ganhos" segmentado por executivo, passo "perdas" segmentado por executivo, saldo no fim.
- **V2 com destaque: um executivo em foco.** Só o segmento de um executivo colorido em todos os passos, o resto em cinza; nota comparando a taxa de conversão dele com a mediana.
- **V3 densa do Farol: investimento de mídia por plataforma na ponte de custo.** Passo "mídia" dividido nas quatro plataformas, passo "ferramentas" dividido por contrato, passo "pessoas" inteiro; a legenda de plataformas fica presa ao passo, não ao gráfico inteiro.
- **V4 caso limite: passo com sinais opostos.** Uma plataforma devolveu crédito no mês enquanto as outras gastaram; o passo vira dois ("mídia investida" e "mídia estornada") e o desenho registra a decisão em nota, em vez de empilhar sinais contrários.

**Referências.**
- Catálogo: [Peltier Tech, Stacked Waterfall Chart](https://peltiertech.com/documentation/stacked-waterfall/): observar a definição do modelo, o "Mixed bar" com preenchimento padronizado e as variantes Dual, Rotated, Paired e Split Bar.
- Catálogo: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar stacked waterfall e stacked breakdown waterfall como tipos distintos e o alerta de não comparar barras com bases diferentes.
- Praticante: [Peltier Tech, Excel waterfall charts (bridge charts)](https://peltiertech.com/excel-waterfall-charts-bridge-charts/): observar o aviso de que a técnica quebra ao misturar positivos e negativos dentro do empilhamento e o limite prático de itens por coluna.
- Praticante: [sjcobb, echarts-waterfall](https://github.com/sjcobb/echarts-waterfall) (não abriu; apareceu na busca): implementação de cascata em ECharts descrita como capaz de cobrir a barra que atravessa de positivo a negativo.
- Portal de design: [Figma Community, Charts Artisan](https://www.figma.com/community/plugin/1577643545855669744/charts-artisan) (não abriu): suíte de gráficos que lista cascata entre os tipos; apareceu na busca por componentes.

**Mora melhor em outra família?** Se o total por passo não importa e a comparação é entre componentes, colunas agrupadas (03). Se o interesse é o caminho dos componentes entre estágios, Sankey (11).

---

## 19.8 Cascata aninhada

**Descrição.** Um passo da ponte se abre numa ponte própria. A Inforiver chama de continuous/nested waterfall e descreve cada nível de hierarquia formando sua cascata, com barras flutuantes servindo de subtotal do nível de cima; distingue ainda o "regular/grounded", em que os níveis compartilham a mesma linha de base. É o drill sem sair do tipo de gráfico: a leitura permanece a mesma, só muda o grão.

**Anatomia.** Nível pai completo no topo; o passo escolhido marcado (moldura, cor ou ícone de lupa); nível filho abaixo ou substituindo o pai, com a coluna de entrada igual ao passo pai e a coluna de saída igual ao passo pai também; trilha de migalhas com o caminho.

**Abordagem na stack.** `recharts-custom` com estado de navegação em React: o dado é uma árvore, e um seletor de caminho devolve a lista de passos do nível corrente já no formato de faixa. Duas telas ou duas faixas empilhadas, à escolha; a versão com o pai visível em cima e o filho embaixo prende melhor o contexto. `onClick` no `shape` para descer, migalha em `html-tailwind` para subir.

**Ponto delicado.** O filho tem de somar o pai, e isso precisa ser garantido no dado, não na interface: se a soma dos filhos difere do passo pai, o nível filho ganha um passo "não atribuído" explícito. Segundo: a escala muda ao descer, e um passo pequeno vira a tela inteira; manter um indicador do tamanho relativo ("este passo é 6% do total") para o leitor não perder a proporção. Terceiro: manter a mesma convenção de cor nos dois níveis, senão o drill parece outro gráfico.

**Versões sugeridas.**
- **V1 básica: custo total abrindo em marketing.** Ponte do custo da área; o passo "marketing" abre em mídia, ferramentas, agência e eventos.
- **V2 com destaque: o passo que mais cresceu.** No nível pai, o passo com maior variação contra o período anterior ganha moldura e o rótulo "abre"; ao descer, o filho abre já ordenado por variação.
- **V3 densa do Farol: perdas do funil em três níveis.** Nível 1, perdas por etapa; nível 2, dentro de "pré-venda", perdas por motivo; nível 3, dentro de "sem contato", perdas por canal tentado; a migalha mostra o caminho e o percentual do total em cada passo.
- **V4 caso limite: filho que não fecha o pai.** Quando 12% do passo pai não tem classificação, o nível filho mostra o passo "sem motivo registrado" hachurado e o rodapé marca a etiqueta LACUNA, em vez de redistribuir proporcionalmente.

**Referências.**
- Catálogo: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar a distinção entre continuous/nested waterfall e regular/grounded waterfall e o uso de barras flutuantes como subtotal de nível.
- Catálogo: [AG Charts, customised waterfall](https://www.ag-grid.com/charts/gallery/customised-waterfall/): observar o `tooltip renderer` que diferencia item real de total sintético, mecânica necessária quando um nível vira o passo de outro.
- Praticante: [Datawrapper Academy, customizing your waterfall chart](https://www.datawrapper.de/academy/customizing-your-waterfall-chart): observar como a coluna de categoria agrupa mudanças, o análogo declarativo de um nível de hierarquia.
- Praticante: [Storytelling with Data, recap do desafio da cascata](https://www.storytellingwithdata.com/blog/2018/5/15/may-swdchallenge-recap-the-waterfall-chart): observar o alerta de que a cascata já não é intuitiva; acrescentar navegação exige mais legenda, não menos.
- Portal de design: [Figma Community, Chart components](https://www.figma.com/community/file/1407258492483066708/chart-components) (não abriu): biblioteca de componentes de gráfico; apareceu na busca por cascata em Figma.

**Mora melhor em outra família?** Se a hierarquia importa mais que o caminho, treemap ou árvore (12). Se o drill é sobre uma tabela de números, tabela visual (14).

---

## 19.9 Cascata em pequenos múltiplos

**Descrição.** A mesma ponte, com os mesmos passos, repetida lado a lado por segmento. A Inforiver lista small multiple waterfall, a variante por medida, a variante com resumo de KPI no painel e a multidimensional com dimensões diferentes nos dois eixos da grade. O ganho é comparar **forma**: onde cada segmento perde é mais legível que o total de cada um.

**Anatomia.** Grade de painéis pequenos; eixo Y compartilhado e visível só na coluna da esquerda; mesmo conjunto de passos, na mesma ordem, em todos; título do painel com o nome e o resultado final; opcionalmente um valor de KPI no canto de cada painel.

**Abordagem na stack.** `svg-puro` para a grade e `recharts-custom` dentro de cada célula é caro (um `ResponsiveContainer` por painel pesa). Para seis painéis ou menos, Recharts serve; acima disso, SVG puro com uma escala compartilhada calculada em TypeScript e um componente `MiniPonte` que recebe `x0`, `y0`, largura e altura. Grade em `html-tailwind` com `grid grid-cols-3 gap-4`.

**Ponto delicado.** Escala compartilhada não é negociável: painel com escala própria transforma comparação em ilusão. Se um segmento é dez vezes maior que os outros, ou se declara "escalas independentes" em cada título (e então a comparação é só de forma), ou se normaliza tudo em percentual do início do próprio painel. Segundo: rótulo em painel pequeno não cabe; deixar valor só no início, no fim e no maior passo, com o resto no tooltip.

**Versões sugeridas.**
- **V1 básica: ponte de entradas por plataforma.** Quatro painéis, mesmos passos (impressão, clique, lead, lead qualificado), mesma escala.
- **V2 com destaque: o painel fora do padrão.** O painel cuja forma difere dos outros ganha borda em `--accent` e uma linha de texto explicando a diferença; os demais ficam em cinza.
- **V3 densa do Farol: ponte do funil por executivo.** Oito painéis com os mesmos cinco passos, ordenados pela taxa final; a diferença de win rate entre o primeiro e o último painel aparece como forma, não como número solto.
- **V4 caso limite: segmento com volume baixo demais.** Executivo com três oportunidades no período tem a ponte substituída por um aviso "amostra pequena (n=3)" dentro do painel, para não induzir leitura de taxa.

**Referências.**
- Catálogo: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar as quatro variantes de pequenos múltiplos descritas, inclusive a que embute resumo de KPI em cada painel.
- Catálogo: [Datawrapper, what to consider when creating waterfall charts](https://www.datawrapper.de/blog/waterfall-charts-guide): observar o alerta de que quatro cascatas lado a lado cansam rápido, e a sugestão de barra empilhada quando a comparação é o objetivo principal.
- Praticante: [Storytelling with Data, recap do desafio da cascata](https://www.storytellingwithdata.com/blog/2018/5/15/may-swdchallenge-recap-the-waterfall-chart): observar a variedade de ferramentas usadas pela comunidade e a insistência em perguntar se o dado pede mesmo uma cascata.
- Praticante: [Peltier Tech, Stacked Waterfall Chart](https://peltiertech.com/documentation/stacked-waterfall/): observar a variante Paired, o parente de dois painéis do pequeno múltiplo.
- Portal de design: [Figma Community, Full charts components](https://www.figma.com/community/file/1039326385370619352/full-charts-components) (não abriu): biblioteca de componentes de gráfico que apareceu na busca; referência de grade de painéis pequenos.

**Mora melhor em outra família?** Se a comparação entre segmentos é só do resultado final, comparação de pontos (17) ou barras (02). Se cada painel é uma série no tempo, linhas em pequenos múltiplos (04).

---

## 19.10 Cascata de previsão

**Descrição.** A ponte junta o que já aconteceu com o que ainda vai acontecer. A Inforiver descreve o forecasting waterfall como a mistura de realizado (um tratamento visual) com projeção (outro padrão), mostrando a variação entre plano e realizado ao longo dos períodos. O IBCS formaliza a ideia: cenários (realizado, plano, orçamento, previsão, ano anterior) têm notação própria, aplicada automaticamente por quem segue a norma.

**Anatomia.** Passos de realizado em preenchimento sólido; passos de projeção em hachura ou contorno; divisor vertical marcando "hoje"; coluna final do projetado com rótulo declarando que é projeção; quando há plano, uma marca de referência no valor planejado.

**Abordagem na stack.** `recharts-custom`. O `shape` já escolhe cor por tipo; aqui ele passa a escolher **preenchimento**: `fill` sólido para realizado e `fill="url(#hachura)"` para projetado, com o `<pattern>` declarado em `<defs>` dentro de um `<Customized>` ou no SVG do container. Divisor com `ReferenceLine x="hoje"` e `strokeDasharray`.

**Ponto delicado.** Projeção pintada igual a realizado é o erro que contamina a decisão; a distinção tem de sobreviver a impressão em preto e branco, então a hachura vem antes da cor. Segundo: a data de corte é uma âncora de tempo e tem de estar escrita ("realizado até 2026-09-13"), porque a mesma peça olhada uma semana depois mente calada. Terceiro: se a projeção vem de premissa e não de medição, a etiqueta PREMISSA aparece no rodapé, e o rótulo do total final não pode ter a mesma tipografia do realizado.

**Versões sugeridas.**
- **V1 básica: fechamento do trimestre.** Realizado dos dois primeiros meses, projeção do terceiro, total projetado no fim.
- **V2 com anotação: plano contra projeção.** Marca do plano no total final e um passo explícito "distância do plano", com nota dizendo de onde sai a projeção.
- **V3 densa do Farol: forecast semanal da carteira.** Passos de "base da semana passada", "novas oportunidades", "avanços de estágio", "perdas", "datas que deslizaram para o mês seguinte" e "forecast desta semana"; o passo de deslizamento é o que a Comercial mais esconde e o que mais explica o desvio.
- **V4 caso limite: projeção com base rasa.** Quando menos de metade das oportunidades tem data de fechamento preenchida, o passo projetado ganha hachura mais larga e nota "projeção sobre 44% de cobertura de campo".

**Referências.**
- Catálogo: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar a definição de forecasting waterfall, com realizado e projeção em tratamentos distintos e variações contra o plano.
- Catálogo: [IBCS, vertical waterfall chart template (C06)](https://www.ibcs.com/resource/chart-template-06/): observar barras agrupadas de realizado e plano combinadas com a cascata de variações absolutas, pinos para variação percentual e ordenação pela variação contra o plano.
- Praticante: [Zebra BI, IBCS](https://zebrabi.com/ibcs/) (não abriu; apareceu na busca): observar que os cenários AC, PL, BU, FC e PY recebem padrões de preenchimento normatizados, que é a origem da hachura de projeção.
- Praticante: [Zebra BI, Power BI horizontal waterfall charts explained](https://zebrabi.com/power-bi-waterfall-charts-explained/): observar a recomendação de contextualizar a peça com legenda e nota, exigência maior ainda quando há projeção.
- Portal de design: [Dribbble, Waterfall Chart designs (tag)](https://dribbble.com/tags/waterfall-chart) (não abriu): usada na varredura; nenhum shot específico de cascata com projeção foi aberto nesta pesquisa.

**Mora melhor em outra família?** Se a projeção é uma trajetória e não uma decomposição, linha com faixa de projeção (04 ou 05). Se a pergunta é só "quanto falta para a meta", progresso e meta (13).

---

## 19.11 Cascata pareada

**Descrição.** Duas pontes com exatamente os mesmos passos, desenhadas lado a lado ou espelhadas, para comparar dois conjuntos de observações. A Inforiver chama de side-by-side waterfall e cita o caso clássico do demonstrativo de resultado em dois anos; a variante com variâncias acrescenta a diferença absoluta e percentual ao lado. A Peltier oferece Dual Waterfall e Paired Waterfall na edição avançada. Diferente do 19.4, aqui nada é decomposto: as duas pontes ficam inteiras e a comparação é do leitor.

**Anatomia.** Duas colunas de painel com o mesmo eixo de passos; escala compartilhada e explicitada; na versão espelhada, um eixo central com os nomes dos passos e as barras crescendo para os dois lados; faixa opcional de variância entre os dois painéis.

**Abordagem na stack.** `svg-puro` na versão espelhada (o Recharts não tem eixo central com duas direções sem gambiarra) e `recharts-custom` em dois `BarChart` irmãos com `domain` fixo idêntico na versão lado a lado. O domínio compartilhado vem de um `useMemo` que olha os dois conjuntos antes de renderizar qualquer painel.

**Ponto delicado.** Escala independente nos dois lados é o erro que anula o modelo inteiro; travar o domínio e mostrá-lo. Segundo: a versão espelhada inverte a direção de leitura de um dos lados, e o olho lê "maior" onde há só "mais longe do centro"; rotular com sinal dos dois lados. Terceiro: se o leitor só quer a diferença, a ponte de variação (19.4) responde com metade da tinta, e o pareado passa a ser desperdício.

**Versões sugeridas.**
- **V1 básica: este trimestre contra o anterior.** Mesmos seis passos nas duas pontes, escala travada, total de cada lado em destaque.
- **V2 com variância: a coluna do meio.** Entre os dois painéis, uma tira fina com a diferença de cada passo em pontos e em percentual, no formato de variância do IBCS.
- **V3 densa do Farol: dois canais de origem na mesma ponte de funil.** Painel esquerdo com indicação e cliente atual, painel direito com mídia paga, mesmos passos; a forma mostra que o segundo entrega volume no topo e nada no fim.
- **V4 caso limite: um lado sem dado em um passo.** Quando o canal da direita não tem medição de um dos passos, aquele passo fica vazio com hachura "sem medição" e o total do lado carrega a ressalva, em vez de somar zero.

**Referências.**
- Catálogo: [Inforiver, waterfall charts in Power BI](https://inforiver.com/ebooks/waterfall-charts-power-bi/): observar side-by-side waterfall e a variante com variâncias absolutas e percentuais.
- Catálogo: [Peltier Tech, Dual Waterfall Chart](https://peltiertech.com/documentation/dual-waterfall/) (não abriu; apareceu na busca): variante de duas cascatas comparadas na edição avançada.
- Praticante: [IBCS, vertical waterfall chart template (C06)](https://www.ibcs.com/resource/chart-template-06/): observar barras agrupadas de dois cenários ao lado da cascata de variação, com escala consistente exigida pela certificação.
- Praticante: [Peltier Tech, Stacked Waterfall Chart](https://peltiertech.com/documentation/stacked-waterfall/): observar a existência de Paired Waterfall como categoria própria, sinal de que a comparação pareada é recorrente o bastante para virar produto.
- Portal de design: [Figma Community, Charts Components For Free](https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available) (não abriu, HTTP 403): arquivo com mais de trinta tipos de gráfico, cascata incluída segundo a busca.

**Mora melhor em outra família?** Se a comparação é de dois valores por categoria e não de dois caminhos, dumbbell ou comparação de pontos (17). Se as duas pontes só interessam pela diferença, cascata de variação (19.4).

---

## 19.12 Cascata com faixa de cenário

**Descrição.** Ponte em que um ou mais passos carregam incerteza declarada, e o total sai como faixa em vez de número. É a adaptação do catálogo para a pergunta da Diretoria "cenários com saída em faixa"; não é um tipo canônico de biblioteca, e sim a cascata combinada com a marca de intervalo que o recap do desafio da SWD registra em algumas submissões (barras de erro acrescentadas à cascata para esclarecer o significado).

**Anatomia.** Passos certos em preenchimento sólido; passos incertos com barra de intervalo (mínimo, esperado, máximo) sobre a barra; coluna final desenhada como faixa vertical com o valor esperado marcado; rodapé declarando a premissa de cada intervalo.

**Abordagem na stack.** `recharts-custom` com `ErrorBar` dentro do `Bar` para os passos incertos, e `svg-puro` para a faixa final, que é um retângulo semitransparente com uma linha no valor esperado. Como o `ErrorBar` do Recharts trabalha sobre o valor da série e a série aqui é uma faixa, o mais previsível é desenhar o intervalo dentro do próprio `shape`, com os limites vindo do dado.

**Ponto delicado.** A faixa do total **não é** a soma das faixas dos passos, a menos que se assuma correlação perfeita; somar mínimos e máximos infla o intervalo. Ou se declara a regra usada ("faixa do total assume que os passos se movem juntos") ou se calcula o intervalo na origem e se explica. Segundo ponto: faixa desenhada só no total esconde onde nasce a incerteza; marcar os passos incertos é o que torna o modelo honesto. Terceiro: se existe número único auditável, este modelo está sobrando.

**Versões sugeridas.**
- **V1 básica: ponte de receita do próximo trimestre com três passos incertos.** Base contratada certa; novos, expansão e cancelamento com faixa; saída em faixa.
- **V2 com anotação: onde a faixa nasce.** O passo de maior amplitude destacado com nota "a incerteza do total é quase toda deste passo; medir isto reduz a faixa pela metade".
- **V3 densa do Farol: capacidade contra demanda no ano seguinte.** Passos de capacidade instalada, contratações previstas, produtividade em rampa e atrito; saída em faixa comparada à linha de demanda projetada, com o cruzamento marcado.
- **V4 caso limite: cenário que estoura o teto.** Quando o cenário otimista passa do teto de capacidade medido, a parte da faixa acima do teto é hachurada e recebe o rótulo "acima da capacidade medida", porque a receita nessa região não é entregável.

**Referências.**
- Catálogo: [Recharts, exemplo Waterfall](https://recharts.github.io/en-US/examples/Waterfall/): observar que a barra de faixa já é o mecanismo de intervalo, o que torna o passo incerto uma variação barata do mesmo componente.
- Catálogo: [Datawrapper Academy, customizing your waterfall chart](https://www.datawrapper.de/academy/customizing-your-waterfall-chart): observar a opção de "zoom to differences" e as faixas de destaque (highlight ranges), o parente declarativo do realce de cenário.
- Praticante: [Storytelling with Data, recap do desafio da cascata](https://www.storytellingwithdata.com/blog/2018/5/15/may-swdchallenge-recap-the-waterfall-chart): observar as submissões que acrescentaram barras de erro e setas de direção à cascata para tornar o significado explícito.
- Praticante: [Datawrapper, what to consider when creating waterfall charts](https://www.datawrapper.de/blog/waterfall-charts-guide): observar a proibição do marcador de quebra de eixo em coluna de total, que vale igualmente para a coluna em faixa.
- Portal de design: [Figma Community, UCharts](https://www.figma.com/community/plugin/1404821057322599271/ucharts-line-chart-bar-chart-area-chart-pie-chart-scatter-chart-radar-chart) (não abriu): plugin de gráficos citado na busca como suporte a cascata; sem exemplo de faixa de cenário.

**Mora melhor em outra família?** Se o que interessa é a distribuição do resultado e não o caminho, distribuição (16). Se o cenário é uma trajetória com banda no tempo, área com faixa (05).

---

## Notas de implementação que valem para a família toda

- **Um só componente base.** Todos os doze modelos saem de `BarChart` + `Bar dataKey` de faixa + `shape` customizado. O que muda é o pré-processamento em TypeScript e a camada de anotação. Vale escrever uma função `montarCascata(passos, opcoes)` que devolve `{ linhas, dominio, conectores }` e testá-la isolada do React.
- **Conectores.** Três caminhos: desenhar dentro do `shape` (cada barra emite o segmento até a próxima), usar `<Customized>` com acesso às escalas, ou renderizar uma camada SVG absoluta por cima. O `ReferenceLine` por passo não escala e quebra em responsivo.
- **Recharts não tem cascata nativa.** Existe pedido aberto no repositório (issue 7010) e o exemplo oficial é justamente a receita manual; o catálogo trata a cascata como `recharts-custom` por definição, nunca como `recharts-nativo`.
- **Tema escuro.** Verde e vermelho sobre fundo escuro pedem luminosidade maior que a da paleta de impressão; o Datawrapper sugere lima e vermelho escuro ou verde-azulado e vermelho como pares mais seguros, e o teste com simulador de daltonismo vem antes de fechar a paleta.
- **Acessibilidade.** Sinal no rótulo (`+` e `-`), seta ou ícone `lucide-react` (`trending-up`, `trending-down`) e `aria-label` por barra com nome, valor e acumulado. A crítica de que a cascata não é intuitiva é anterior à cor: a legenda de papéis é obrigatória.
- **Zero e vazio.** Passo com valor zero vira traço fino com rótulo; passo sem medição vira hachura declarada e fica fora da soma, com etiqueta LACUNA no rodapé; nunca zero silencioso no lugar de ausente.

## Modelos vistos nas fontes que moram em outra família

- **Funil com queda etapa a etapa e taxa de conversão:** 10.
- **Fluxo entre origens e destinos, com cruzamentos:** Sankey (11).
- **Árvore de decomposição e treemap:** 12.
- **Barra de variação com base comum (plus-minus e lollipop de variância do IBCS e do Zebra BI):** 02 e 17.
- **Linha do acumulado com barras de variação em eixo duplo:** 08.
- **Barra empilhada 100% quando o total não interessa:** 02 e 03.
- **Progresso contra meta em barra única ou gauge:** 13.
- **Cascata reduzida a tira dentro de um card, sem eixo:** microvisual (24), com a geometria vindo daqui.
- **Cascata de requisições de rede (waterfall de performance web):** homônimo, não pertence a esta família; é cronograma (20).

## Fontes consultadas

Abertas e lidas nesta pesquisa:

- Recharts, exemplo Waterfall: https://recharts.github.io/en-US/examples/Waterfall/
- Wikipedia, waterfall chart: https://en.wikipedia.org/wiki/Waterfall_chart
- Inforiver, waterfall charts in Power BI (ebook): https://inforiver.com/ebooks/waterfall-charts-power-bi/
- Peltier Tech, Excel waterfall charts (bridge charts): https://peltiertech.com/excel-waterfall-charts-bridge-charts/
- Peltier Tech, Stacked Waterfall Chart: https://peltiertech.com/documentation/stacked-waterfall/
- Apache ECharts, handbook, waterfall: https://echarts.apache.org/handbook/en/how-to/chart-types/bar/waterfall/
- Highcharts, demo waterfall (abriu só com título e categoria): https://www.highcharts.com/demo/highcharts/waterfall
- Storytelling with Data, what is a waterfall: https://www.storytellingwithdata.com/blog/2020/11/16/what-is-a-waterfall
- Storytelling with Data, recap do desafio da cascata (maio de 2018): https://www.storytellingwithdata.com/blog/2018/5/15/may-swdchallenge-recap-the-waterfall-chart
- AG Charts, galeria: https://www.ag-grid.com/charts/gallery/
- AG Charts, customised waterfall: https://www.ag-grid.com/charts/gallery/customised-waterfall/
- Vega-Lite, waterfall chart of monthly profit and loss: https://vega.github.io/vega-lite/examples/waterfall_chart.html
- Datawrapper, what to consider when creating waterfall charts: https://www.datawrapper.de/blog/waterfall-charts-guide
- Datawrapper Academy, customizing your waterfall chart: https://www.datawrapper.de/academy/customizing-your-waterfall-chart
- IBCS, vertical waterfall chart template (C06): https://www.ibcs.com/resource/chart-template-06/
- Zebra BI, Power BI horizontal waterfall charts explained: https://zebrabi.com/power-bi-waterfall-charts-explained/

Tentadas e não abertas (apareceram na busca ou voltaram erro):

- Data Viz Project, waterfall chart (não abriu, HTTP 403): https://datavizproject.com/data-type/waterfall-chart/
- Dribbble, tag waterfall-chart (não abriu, página voltou vazia): https://dribbble.com/tags/waterfall-chart
- Datawrapper Academy, examples of Datawrapper waterfall charts (não abriu, conteúdo não veio): https://www.datawrapper.de/academy/waterfall-chart-examples
- Figma Community, Charts Components For Free (não abriu, HTTP 403): https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available
- Nightingale no Medium, Data Density in Financial Presentations (não abriu, HTTP 403): https://medium.com/nightingale/lets-bring-some-data-density-to-financial-presentations-f8bc9e52ff10

Apareceram literalmente em resultado de busca e entraram como referência sem leitura:

- AG Charts, simple waterfall: https://www.ag-grid.com/charts/gallery/simple-waterfall/
- AG Charts, horizontal waterfall: https://www.ag-grid.com/charts/gallery/horizontal-waterfall/
- Recharts, issue 7010, feature request de cascata nativa: https://github.com/recharts/recharts/issues/7010
- Recharts, exemplo Custom Shape Bar Chart: https://recharts.github.io/en-US/examples/CustomShapeBarChart/
- sjcobb, echarts-waterfall: https://github.com/sjcobb/echarts-waterfall
- Peltier Tech, Waterfall Chart: https://peltiertech.com/documentation/waterfall/
- Peltier Tech, Dual Waterfall Chart: https://peltiertech.com/documentation/dual-waterfall/
- Datawrapper Academy, how to create a waterfall chart: https://www.datawrapper.de/academy/how-to-create-a-waterfall-chart
- Datawrapper, new: waterfall charts in Datawrapper: https://www.datawrapper.de/blog/waterfall-charts
- Zebra BI, create waterfall (bridge) charts from a single measure: https://help.zebrabi.com/kb/power-bi/bridge-waterfall-from-1-measure/
- Zebra BI, Excel waterfall chart tutorial: https://zebrabi.com/excel-waterfall-chart/
- Zebra BI, IBCS: https://zebrabi.com/ibcs/
- Zebra BI, price volume mix analysis in Power BI: https://zebrabi.com/price-volume-mix-analysis-power-bi/
- Rohit Patel, how to do the price-volume-mix waterfall right: https://medium.com/quickai-app/how-to-do-the-price-volume-mix-waterfall-right-6723f5ed2920
- The Cost Element, sales bridge (volume price mix analysis): https://thecostelement.com/sales-bridge-volume-price-mix-analysis/
- Inforiver, waterfall charts for finance professionals: https://inforiver.com/insights/waterfall-charts-finance-professionals-best-friend/
- FT, chart-doctor, visual vocabulary (pasta): https://github.com/ft-interactive/chart-doctor/tree/master/visual-vocabulary
- FT, chart-doctor, visual vocabulary (README): https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md
- Nightingale, Viva Magenta and Waterfall Experiences in Data Visualization: https://nightingaledvs.com/viva-magenta-and-waterfall-experiences-in-data-visualization/
- Nightingale, Navigating the Wide World of Data Visualization Libraries: https://nightingaledvs.com/navigating-the-wide-world-of-data-visualization-libraries/
- Domo, waterfall chart guide: https://www.domo.com/learn/charts/waterfall-charts
- AnyChart Playground, waterfall chart: https://playground.anychart.com/chart-types/waterfall-chart
- think-cell, waterfall charts in PowerPoint: https://www.think-cell.com/en/resources/content-hub/a-step-by-step-guide-to-creating-waterfall-charts-in-powerpoint
- Preset, waterfall chart: https://docs.preset.io/docs/waterfall-chart
- Spotfire, what is a waterfall chart: https://www.spotfire.com/glossary/what-is-a-waterfall-chart
- Sigma, when waterfall charts are the best option: https://www.sigmacomputing.com/blog/waterfall-charts-data-visualization
- MrExcel, stacked waterfall com valores positivos e negativos: https://www.mrexcel.com/board/threads/stacked-waterfall-chart-with-positive-and-negative-values-in-excel.1199615/
- Observable Plot, interval transform: https://observablehq.github.io/plot/transforms/interval
- Dribbble, Waterfall NPS Chart (Gregory Muryn-Mukha): https://dribbble.com/shots/6710427-Waterfall-NPS-Chart
- Dribbble, Waterfall Chart (Shashank Sahay): https://dribbble.com/shots/4936758-Waterfall-Chart
- Figma Community, Waterfal charts (plugin): https://www.figma.com/community/plugin/1180125043621224219/waterfal-charts
- Figma Community, Net Revenue Waterfall Chart Generator (plugin): https://www.figma.com/community/plugin/1620729787813298870/net-revenue-waterfall-chart-generator
- Figma Community, Charts Artisan (plugin): https://www.figma.com/community/plugin/1577643545855669744/charts-artisan
- Figma Community, UCharts (plugin): https://www.figma.com/community/plugin/1404821057322599271/ucharts-line-chart-bar-chart-area-chart-pie-chart-scatter-chart-radar-chart
- Figma Community, Chart components: https://www.figma.com/community/file/1407258492483066708/chart-components
- Figma Community, Full charts components: https://www.figma.com/community/file/1039326385370619352/full-charts-components
- Figma Community, Waterfall (design): https://www.figma.com/community/file/1099626340704948588/waterfall-design

Lacunas desta varredura: o Data Viz Project e a página de exemplos do Datawrapper devolveram bloqueio ou conteúdo vazio; o Behance não trouxe projeto dedicado a cascata em duas buscas; o Observable Plot não tem exemplo oficial de cascata na documentação encontrada, e a receita equivalente é o `window` de soma corrida do Vega-Lite; nenhum exemplo de cascata apareceu no shadcn/ui charts nem no Tremor nesta pesquisa; o RAWGraphs e o From Data to Viz não foram abertos por falta de entrada de cascata nos resultados de busca.
