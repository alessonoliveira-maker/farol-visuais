# 21_texto-e-nuvem-de-palavras

_Estudo de família do catálogo VISUAIS do Farol. Pesquisa feita em 2026-09-14. Dados de exemplo 100% fictícios._

Stack de referência: React 18.3 + TypeScript strict + Recharts 3.10.1 + Tailwind 4 + lucide-react. Nada de d3, d3-cloud, visx, nivo ou echarts no código; essas bibliotecas aparecem só como referência de algoritmo ou de forma.

---

## 1. O que a família responde

Aqui o texto é o próprio dado, ou é a forma de apresentar um dado. Os dois papéis:

1. **Texto como dado.** Motivos de perda digitados livremente, termos de busca paga, palavras nos títulos de criativos, objeções anotadas pela pré-vendas, respostas abertas de formulário. As perguntas: quais termos aparecem mais, quais cresceram, em que contexto aparece uma palavra, e como o vocabulário difere entre grupos.
2. **Texto como forma.** O número que precisa ser lembrado, a frase que substitui a legenda, a citação que ilustra um padrão, a anotação que explica um pico.

Perguntas típicas no Farol:

| Público | Pergunta |
|---|---|
| Comercial | Quais palavras mais aparecem nos motivos de perda livres do trimestre? |
| Comercial | O que os executivos escrevem depois de "não tem" nas anotações das oportunidades perdidas? |
| Pré-vendas | Quais objeções aparecem nas anotações de ligação, e o que mudou depois do novo roteiro? |
| Marketing | Quais termos de busca trazem lead qualificado e quais trazem lead fora do perfil? |
| Marketing | Quais palavras nos títulos de criativos aparecem mais nos anúncios de CPL baixo? |
| Diretoria | Qual é a frase do mês, com o número principal e a comparação que dá sentido a ele? |

Aviso que atravessa a família: a nuvem de palavras é a forma mais pedida e a mais criticada. O Data Viz Catalogue e o From Data to Viz apontam o viés para palavras longas e a baixa precisão; Stephen Few coloca a nuvem ao lado das bolhas empacotadas como forma chamativa e pobre em informação. Para análise, os modelos 3 a 9 respondem melhor; a nuvem fica para ambientação e para exploração rápida.

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Nuvem de palavras em espiral | Visão impressionista de muitos termos, exploração | Comparar valores ou períodos com precisão | Tamanho de fonte linear no valor, inflando termos longos |
| 2 | Nuvem alinhada ponderada (tag cloud) | Tags clicáveis que funcionam como filtro | Ranking preciso | Degraus de tamanho que não se distinguem |
| 3 | Lista de termos com barras | Ranking dos termos com valor legível | Mais de 30 termos sem paginação | Contar ocorrências em vez de documentos que citam o termo |
| 4 | Barras divergentes de mudança de vocabulário | O que cresceu e o que caiu entre dois períodos ou grupos | Grupos muito pequenos | Termos raros dominando por proporção instável |
| 5 | Pirâmide de termos entre dois grupos | Mostrar as duas magnitudes lado a lado | Quando só a diferença importa (use o 4) | Não normalizar pelo tamanho de cada grupo |
| 6 | Dispersão de termos entre dois grupos | Achar termos típicos de cada grupo num universo grande | Público não analítico | Rótulos sobrepostos |
| 7 | Árvore de palavras | Explorar o que vem antes ou depois de uma palavra | Termos raros | Árvore sem poda, ilegível |
| 8 | Concordância KWIC | Ler o contexto real de cada ocorrência | Resumo executivo | Cortar o contexto esquerdo pelo lado errado |
| 9 | Dispersão lexical ao longo do tempo | Quando um termo começou ou parou de aparecer | Contagens altas por dia | Remover a faixa do termo sem ocorrência |
| 10 | Número em destaque com frase | O número a ser lembrado, com comparação | Vários números de peso igual (use cards da família 01) | Número sem referência de comparação |
| 11 | Frase com número e legenda embutida | Título que já diz a conclusão e substitui a legenda | Quando a conclusão muda com filtros e a frase é fixa | Frase estática que contradiz o dado filtrado |
| 12 | Citação em destaque e verbatim realçado | Ilustrar um padrão com a voz do cliente | Como prova de frequência | Citação escolhida a dedo sem dizer quanto ela representa |
| 13 | Anotação narrativa sobre gráfico | Explicar um ponto, faixa ou mudança | Excesso de anotações | Anotação ancorada em pixel e não no dado |

---

## 3. Modelos em detalhe

### 3.1 Nuvem de palavras em espiral

**Descrição.** Termos com tamanho de fonte proporcional ao peso, arranjados de forma compacta a partir do centro. O Data Viz Catalogue registra que palavras longas ganham ênfase indevida e que a forma serve mais à estética que à análise.

**Anatomia.** Termos em tamanhos variados; cor opcional por categoria; nenhuma escala visível; tooltip com a contagem; nota "tamanho indica número de respostas que citam o termo".

**Abordagem na stack.** `svg-puro`, com layout calculado em TypeScript num `useMemo`:
1. Ordenar por peso decrescente e cortar nos N maiores (60 a 100).
2. Tamanho de fonte por escala de raiz quadrada entre 12 px e 48 px, para que a área do texto acompanhe melhor o valor.
3. Medir a largura de cada termo com `CanvasRenderingContext2D.measureText` na mesma família tipográfica do app, depois de `document.fonts.ready`; altura por `actualBoundingBoxAscent + actualBoundingBoxDescent`.
4. Para cada termo, percorrer uma espiral arquimediana a partir do centro (`x = a·t·cos t`, `y = a·t·sin t`) testando colisão de retângulo contra os já posicionados, com folga de 2 px. É o mesmo princípio do d3-cloud e da série word cloud do Highcharts.
5. Termo que não couber é descartado e contado ("12 termos fora da nuvem"), como o d3-cloud faz.
6. Sem rotação, ou só 0 e 90 graus: o Highcharts avisa que a colisão dele não considera rotação, e rotação livre piora leitura.
7. Determinístico: nada de `Math.random`, para a nuvem não mudar a cada renderização.
8. Renderizar `<text textAnchor="middle" dominantBaseline="central">` dentro de um `<svg viewBox>` responsivo.

**Ponto delicado.** Medir antes da fonte carregar dá larguras erradas e sobreposição. Redimensionar a janela refaz o layout e embaralha posições: recalcular só em breakpoints fixos de largura. Acessibilidade: a mesma lista ordenada em `sr-only` para leitor de tela.

**Versões sugeridas.**
1. **Básico: motivos de perda livres do trimestre.** 60 termos fictícios ("preço", "momento", "já tem assessor", "prazo") em cor única.
2. **Com destaque: termos que cresceram.** Cor de destaque só nos termos com mais de 50% de aumento contra o trimestre anterior; o resto em cinza.
3. **Denso e real do Farol: termos de busca paga por qualificação.** Tamanho = leads; cor = maioria qualificada ou não qualificada; tooltip com CPL qualificado.
4. **Limite: base pequena e termo longo.** Com menos de 30 respostas ou menos de 15 termos, não desenhar a nuvem: mostrar a lista do modelo 3 com aviso "amostra pequena". Termo longo como "planejamento sucessório" tem o tamanho limitado para não dominar a peça. Nuvem em forma de silhueta (opção `shape` e `maskImage` do echarts-wordcloud) fica fora do catálogo.

**Referências.**
- Catálogo: [Data Viz Catalogue, Word Cloud](https://datavizcatalogue.com/methods/wordcloud.html): observar os vieses de palavra longa e de ascendentes e descendentes.
- Catálogo: [From Data to Viz, Word cloud](https://www.data-to-viz.com/graph/wordcloud.html): observar a crítica à área como codificação e as alternativas sugeridas (barplot, lollipop).
- Algoritmo: [d3-cloud, README](https://github.com/jasondavies/d3-cloud): observar a colocação do maior para o menor, a espiral arquimediana ou retangular e o descarte do que não cabe.
- Algoritmo: [Highcharts, Word cloud series](https://www.highcharts.com/docs/chart-and-series-types/word-cloud-series): observar estratégias de colocação, tipos de espiral e a limitação da colisão com rotação.
- Algoritmo: [echarts-wordcloud, README](https://github.com/ecomfe/echarts-wordcloud): observar `sizeRange`, `gridSize` e `shrinkToFit`, que decide entre encolher e omitir.
- Stack: [MDN, measureText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText): observar os campos de `TextMetrics` para largura e caixa real.
- Catálogo: [amCharts, Word Cloud](https://www.amcharts.com/demos/word-cloud/) e [amCharts, Changing Data Word Cloud](https://www.amcharts.com/demos/changing-data-word-cloud/): observar o corte em cerca de 100 palavras e a transição quando os pesos mudam.
- Praticante: [Stephen Few, What Makes a Chart Boring?](https://www.perceptualedge.com/blog/?p=1612): observar a crítica conjunta a nuvem de palavras e bolhas empacotadas.
- Praticante: [Nightingale, How to Share Memorable Data](https://nightingaledvs.com/how-to-share-memorable-data/): observar o uso de nuvem numa ferramenta de exploração para não sobrecarregar o usuário.
- Portal de design: [Behance, busca "word cloud"](https://www.behance.net/search/projects/word%20cloud) e [Marketing Word Cloud](https://www.behance.net/gallery/17146335/Marketing-Word-Cloud): observar composição manual de funções de marketing como nuvem.

---

### 3.2 Nuvem alinhada ponderada (tag cloud)

**Descrição.** Termos em fluxo de texto, linha após linha, com tamanho ou peso tipográfico por frequência, em ordem alfabética ou por peso. Costuma funcionar como filtro clicável. A Wikipedia distingue nuvens por frequência, por significância contra um corpus de fundo e por categorização, e lembra o pedido de desculpas público de um grande site de fotos pelas tag clouds.

**Anatomia.** Termos em `flex-wrap`; 4 ou 5 degraus de tamanho; contagem opcional; estado selecionado.

**Abordagem na stack.** `html-tailwind`. `div` com `flex flex-wrap items-baseline gap-x-3 gap-y-1`; degrau calculado por quantil em TypeScript e mapeado para `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`; cada termo é um `button` com `aria-pressed`.

**Ponto delicado.** Degraus discretos por quantil em vez de escala contínua, para a diferença ser perceptível. `items-baseline` alinha tamanhos diferentes. Ordem alfabética facilita achar; ordem por peso facilita ranquear. A escolha precisa aparecer no subtítulo.

**Versões sugeridas.**
1. **Básico: interesses declarados no formulário.** 30 tags fictícias em ordem alfabética com 5 degraus.
2. **Com destaque: tags como filtro.** Tags selecionadas com fundo de destaque e contagem "(124)"; o painel inteiro filtra.
3. **Denso e real do Farol: origens de lead com cobertura de dado.** Tags agrupadas por família (mídia paga, indicação, evento, orgânico) em blocos com título, cada bloco com percentual de leads com origem preenchida.
4. **Limite: 300 tags.** Top 40 visíveis e botão "ver todas" abrindo lista pesquisável; tag sem ocorrência no período some da nuvem mas continua na busca.

**Referências.**
- Catálogo: [Wikipedia, Tag cloud](https://en.wikipedia.org/wiki/Tag_cloud): observar tipos, layouts alfabético e por peso, e a fórmula de normalização do tamanho.
- Catálogo: [Data Viz Catalogue, Word Cloud](https://datavizcatalogue.com/methods/wordcloud.html): observar os arranjos em linhas e colunas como variante.
- Portal de design: [Behance, busca "word cloud"](https://www.behance.net/search/projects/word%20cloud): observar a diferença entre composições decorativas e listas ponderadas.

---

### 3.3 Lista de termos com barras

**Descrição.** Ranking de termos com barra horizontal proporcional e valor à direita. É a alternativa que o From Data to Viz recomenda à nuvem. Tem parentesco com a família 02; mora aqui pela especialização em texto: termos longos, n-gramas, ligação com o contexto (modelo 8).

**Anatomia.** Termo sobre a barra ou à esquerda; barra com base zero; valor formatado; opcional percentual do total e variação.

**Abordagem na stack.** `html-tailwind`, no desenho do BarList do Tremor: cada linha é um `div relative` com a barra `absolute inset-y-0 left-0` de largura `valor / max`, largura mínima visível, o termo por cima com contraste e o valor numa coluna `tabular-nums`. Clique numa linha abre o KWIC. Um `BarChart layout="vertical"` do Recharts também serve, mas rótulos longos no eixo Y ocupam largura fixa e truncam pior.

**Ponto delicado.** A contagem certa é de documentos que citam o termo, não de ocorrências: uma resposta que repete "preço" três vezes não pesa três. Barras sempre com base zero, como a Datawrapper Academy lembra para barras em tabelas. Stopwords em português e do domínio precisam sair antes: o NLTK mostra que os termos mais frequentes de um texto quase nunca dizem nada.

**Versões sugeridas.**
1. **Básico: top 15 termos de motivos de perda.**
2. **Com destaque: termo selecionado.** A linha "concorrente" destacada abre abaixo as frases fictícias em KWIC.
3. **Denso e real do Farol: tabela de termos de busca paga.** Colunas termo, leads, barra, percentual qualificado, CPL qualificado, seta de variação contra o mês anterior e tendência de 12 semanas (aproxima a família 14).
4. **Limite: unigrama, bigrama e dado ausente.** Seletor entre palavra e par de palavras; termo sem classificação de qualificação com barra hachurada e rótulo "sem classificação", fora do cálculo do percentual.

**Referências.**
- Catálogo: [Tremor, BarList](https://tremor.so/docs/visualizations/bar-list): observar `valueFormatter`, `sortOrder`, `onValueChange` e a largura mínima da barra.
- Catálogo: [From Data to Viz, Word cloud](https://www.data-to-viz.com/graph/wordcloud.html): observar as alternativas recomendadas à nuvem.
- Praticante: [Datawrapper Academy, How to add bar charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): observar base zero, faixa máxima fixa e cor separada para negativos.
- Base de texto: [NLTK Book, capítulo 1](https://www.nltk.org/book/ch01.html): observar a distribuição de frequência e por que as palavras mais comuns são vazias.

---

### 3.4 Barras divergentes de mudança de vocabulário (word shift)

**Descrição.** Para dois períodos ou dois grupos, cada termo recebe uma barra para a direita (mais típico do grupo B, ou cresceu) ou para a esquerda (mais típico do grupo A, ou caiu), ordenada pela contribuição. O Shifterator formaliza isso como word shift graph, com versões por proporção, entropia de Shannon e divergência de Jensen-Shannon.

**Anatomia.** Eixo zero central; barras horizontais; termo junto à ponta; cor por direção; totais no topo.

**Abordagem na stack.** `recharts-nativo`. `BarChart layout="vertical"`, `YAxis type="category" dataKey="termo"`, `XAxis type="number" domain={[-m, m]}` simétrico, `Bar dataKey="contribuicao"` com cor por sinal via `Cell`, e `ReferenceLine x={0}`. Mesmo esquema do exemplo Positive And Negative Bar Chart.

**Ponto delicado.** Métrica: diferença de proporção `pB - pA` é a mais explicável; termos raros oscilam muito, então aplicar mínimo de ocorrências (por exemplo 5) e dizer isso. Domínio simétrico evita que um lado pareça maior por escala.

**Versões sugeridas.**
1. **Básico: motivos de perda do 3º contra o 4º trimestre de 2026.** 20 termos que mais mudaram.
2. **Com destaque: termo explicado.** Anotação em "concorrente" com "+6,2 p.p." e nota de contexto.
3. **Denso e real do Farol: antes e depois do novo roteiro de pré-vendas.** Anotações de ligação antes e depois de 2026-10-01, 30 termos, contagem de cada grupo no tooltip.
4. **Limite: termo novo e grupos desbalanceados.** Termo que só existe no grupo B com selo "novo"; grupo A com 40 respostas contra 400 do B avisado no subtítulo.

**Referências.**
- Método: [Shifterator, README](https://github.com/ryanjgallagher/shifterator): observar a anatomia de barras por contribuição e os tipos de shift.
- Stack: [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar Positive And Negative Bar Chart.
- Praticante: [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): observar títulos conversacionais do tipo "mais X que Y".

---

### 3.5 Pirâmide de termos entre dois grupos

**Descrição.** Duas listas espelhadas com o mesmo eixo de termos: grupo A para a esquerda, grupo B para a direita. Ao contrário do modelo 4, mostra as duas magnitudes e não só a diferença.

**Anatomia.** Termos no centro ou à esquerda; barras para os dois lados; eixo com valores absolutos nos dois sentidos.

**Abordagem na stack.** `recharts-nativo`, no esquema do exemplo Population Pyramid: dois `Bar` com o mesmo `stackId`, valor do grupo A negativo e `tickFormatter={(v) => Math.abs(v)}`.

**Ponto delicado.** Normalizar pelo tamanho do grupo (percentual das respostas do grupo), senão o grupo maior domina. Ordenar por soma ou por diferença, e dizer qual.

**Versões sugeridas.**
1. **Básico: anotações de oportunidades ganhas contra perdidas.**
2. **Com destaque: diferença relevante.** Termos com diferença acima de 10 p.p. em cor cheia; os demais translúcidos.
3. **Denso e real do Farol: respostas de formulário por vertical.** Vertical patrimonial contra vertical de crédito estruturado (fictícias), 25 termos.
4. **Limite: termo ausente num lado.** Barra zero com traço e "0%", nunca remoção do termo.

**Referências.**
- Stack: [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar Population Pyramid.
- Método: [Shifterator, README](https://github.com/ryanjgallagher/shifterator): observar a comparação par a par de textos.

---

### 3.6 Dispersão de termos entre dois grupos (scattertext)

**Descrição.** Cada termo é um ponto: eixo X com a frequência no grupo A, eixo Y com a frequência no grupo B. Termos longe da diagonal são característicos de um grupo. O Scattertext popularizou a forma e trata a colisão de rótulos como problema central.

**Anatomia.** Pontos; diagonal de referência; rótulos só nos termos mais distintivos; eixos em rank ou escala log.

**Abordagem na stack.** `recharts-custom`. `ScatterChart` com dois eixos numéricos (`scale="log"` com domínio positivo, ou ranks), `Scatter` com `LabelList` de `content` customizado que só desenha rótulos pré-aprovados, e `ReferenceLine` com `segment` para a diagonal. A seleção de rótulos é um algoritmo guloso em TypeScript: ordenar por distinção e aceitar um rótulo só se o retângulo dele não colidir com os já aceitos.

**Ponto delicado.** Escala log não aceita zero: usar rank ou somar 1 e declarar. Com mais de 300 termos o gráfico vira nuvem de pontos; filtrar por frequência mínima.

**Versões sugeridas.**
1. **Básico: 100 termos, ganhos contra perdidos, 15 rótulos.**
2. **Com destaque: busca.** Campo de busca destaca o ponto do termo e lista as frases.
3. **Denso e real do Farol: títulos de criativos.** Criativos com CPL abaixo contra acima da mediana, 250 termos fictícios.
4. **Limite: termos raros empilhados na origem.** Agregar os de frequência 1 e 1 num marcador "142 termos raros" em vez de desenhar pontos sobrepostos.

**Referências.**
- Método: [Scattertext, README](https://github.com/JasonKessler/scattertext): observar eixos por categoria e o tratamento de colisão de rótulos.
- Stack: [Recharts, Scatter Chart With Labels](https://recharts.github.io/en-US/examples/ScatterChartWithLabels/): observar `LabelList` dentro de `Scatter`.

---

### 3.7 Árvore de palavras (word tree)

**Descrição.** Uma palavra raiz e as sequências que a seguem (sufixo), que a precedem (prefixo) ou ambas, com tamanho pela frequência. Técnica criada por Martin Wattenberg e Fernanda Viégas em 2007.

**Anatomia.** Raiz grande; ramos em colunas por posição; fonte decrescente com a frequência; conectores curvos.

**Abordagem na stack.** `svg-puro`. Em TypeScript: tokenizar as frases, montar uma trie a partir da raiz, podar ramos abaixo de uma contagem mínima e limitar a profundidade (3 ou 4 palavras). Layout: X pela largura acumulada das palavras medidas; Y pelas folhas, com o pai centralizado nos filhos; conectores bézier.

**Ponto delicado.** Agrupar por forma normalizada (sem acento e em minúsculas) e exibir a forma original mais frequente. Clique numa palavra para torná-la raiz exige recomputar a trie. Sem poda, a árvore fica ilegível acima de umas 200 frases.

**Versões sugeridas.**
1. **Básico: raiz "não" nas objeções anotadas.** Ramos "tem interesse", "tem tempo", "é o momento".
2. **Com destaque: ramo que leva à perda.** Ramos cujas frases terminaram em oportunidade perdida em cor de destaque.
3. **Denso e real do Farol: árvore dupla com raiz "preço".** Prefixo e sufixo sobre 500 anotações fictícias de perda.
4. **Limite: raiz rara.** Com menos de 5 ocorrências, mostrar as frases em KWIC em vez de árvore.

**Referências.**
- Catálogo: [Google Charts, Word Tree](https://developers.google.com/chart/interactive/docs/gallery/wordtree): observar os formatos implícito e explícito e as orientações prefixo, sufixo e dupla.
- Catálogo: [Jason Davies, Word Tree](https://www.jasondavies.com/wordtree/): observar a troca de raiz por clique e a árvore reversa.

---

### 3.8 Concordância KWIC

**Descrição.** Cada ocorrência do termo em uma linha, com o termo centralizado, o contexto esquerdo alinhado à direita e o contexto direito alinhado à esquerda. O formato Key Word in Context é atribuído a Hans Peter Luhn.

**Anatomia.** Três colunas; termo em destaque; metadados por linha (data, desfecho, dono fictício); ordenação pelo contexto.

**Abordagem na stack.** `html-tailwind`. `grid grid-cols-[1fr_auto_1fr]` com a primeira coluna `text-right` e a última `text-left`; contexto cortado por palavras em TypeScript (as N palavras mais próximas do termo). Para listas longas, `@tanstack/react-virtual`, que já está no projeto.

**Ponto delicado.** O contexto esquerdo precisa ser cortado pelo começo, mantendo as palavras mais próximas do termo; o truque `dir="rtl"` embaralha pontuação e deve ser evitado. No Farol os verbatins são fictícios, mas o componente deve mascarar nome, e-mail e telefone antes de exibir.

**Versões sugeridas.**
1. **Básico: 20 ocorrências de "concorrente".**
2. **Com destaque: ordenação pelo contexto direito.** Agrupa naturalmente "concorrente mais barato", "concorrente já atende".
3. **Denso e real do Farol: KWIC ligado à lista de termos.** Clique no modelo 3 abre o KWIC com filtro por desfecho, virtualizado para 2.000 linhas.
4. **Limite: termo na borda da frase.** Contexto vazio mostra um marcador discreto para não colapsar a coluna.

**Referências.**
- Catálogo: [Wikipedia, Key Word in Context](https://en.wikipedia.org/wiki/Key_Word_in_Context): observar o layout centralizado e a diferença para o formato sem contexto.

---

### 3.9 Dispersão lexical ao longo do tempo

**Descrição.** Uma faixa por termo, com um traço vertical a cada ocorrência na posição temporal. O NLTK usa a forma para mostrar onde as palavras aparecem ao longo de um corpus.

**Anatomia.** Termos no eixo Y; tempo no eixo X; traços finos translúcidos; total à direita.

**Abordagem na stack.** `recharts-custom`. `ScatterChart` com `XAxis type="number"` de datas e `YAxis type="category"` de termos; `Scatter` com `shape` customizado que desenha um `<line>` vertical com a altura da banda.

**Ponto delicado.** Muitas ocorrências no mesmo dia viram borrão: acima de umas 10 por dia por termo, agregar por semana e migrar para mapa de calor (família 15). Termo sem ocorrência mantém a faixa vazia com "0", porque remover a faixa esconde a ausência.

**Versões sugeridas.**
1. **Básico: 6 termos de motivo de perda em 2026.**
2. **Com destaque: evento de referência.** `ReferenceLine` em 2026-07-01 (reajuste fictício de taxa) mostrando "preço" adensando depois.
3. **Denso e real do Farol: 12 objeções da pré-vendas por dia.** Com total por termo à direita.
4. **Limite: termo ausente no período.** Faixa vazia com "0" e rótulo "sem menções".

**Referências.**
- Base de texto: [NLTK Book, capítulo 1](https://www.nltk.org/book/ch01.html): observar o dispersion plot, uma faixa por termo e um traço por ocorrência.
- Stack: [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): observar os exemplos de ScatterChart para eixos categóricos e shape customizado.

---

### 3.10 Número em destaque com frase

**Descrição.** Um número grande acompanhado de uma frase que diz o que ele significa e contra o quê. Diferente do card de KPI da família 01: aqui a frase é a peça e o número é parte dela. O Nightingale descreve números grandes com cor de acento e texto de apoio como recurso de memória.

**Anatomia.** Número em tipografia de destaque; unidade; frase de contexto com comparação; período e procedência em texto pequeno.

**Abordagem na stack.** `html-tailwind`. `p` com `span` numérico `text-5xl tabular-nums` na fonte display do app, frase em `text-base`, formatação com `Intl.NumberFormat('pt-BR', { notation: 'compact' })`.

**Ponto delicado.** O arredondamento do número precisa bater com o gráfico ao lado; a Datawrapper recomenda abreviar e deixar a precisão para o tooltip. Frase gerada por template trata singular e plural, sinal e zero ("nenhuma venda" e não "0 vendas").

**Versões sugeridas.**
1. **Básico: "48 vendas fechadas em 2026".**
2. **Com destaque: comparação em alerta.** "Entradas previstas equivalem a **3,1x** o teto de capacidade medido", com o multiplicador em cor de alerta.
3. **Denso e real do Farol: faixa de três números da Diretoria.** Cada número com etiqueta de procedência (medido, premissa, derivado) e frase de uma linha.
4. **Limite: valor em faixa ou ausente.** Cenário com saída em faixa: "entre R$ 8,2 mi e R$ 10,4 mi"; sem dado: "sem dado suficiente no período", nunca um zero falso.

**Referências.**
- Praticante: [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): observar hierarquia em dois tamanhos, números abreviados e precisão no tooltip.
- Praticante: [Nightingale, How to Share Memorable Data](https://nightingaledvs.com/how-to-share-memorable-data/): observar números grandes com cor de acento e mensagem de uma frase.

---

### 3.11 Frase com número e legenda embutida

**Descrição.** O título do gráfico é uma frase com a conclusão, e as palavras-chave têm a cor da série correspondente, dispensando a legenda. A Datawrapper recomenda rotular direto em vez de chave de cor e escrever títulos em linguagem de conversa.

**Anatomia.** Título em frase; `span` colorido igual à série; subtítulo com método e período; gráfico sem legenda.

**Abordagem na stack.** `html-tailwind`. `h3` com `span` que usa o mesmo token de cor passado ao `stroke` ou `fill` do Recharts, vindo de um objeto TypeScript único; `font-semibold` junto com a cor.

**Ponto delicado.** Fonte única de verdade para as cores. Cor mais peso tipográfico, para não depender só de cor. Frase dinâmica precisa inverter quando a relação se inverte com o filtro.

**Versões sugeridas.**
1. **Básico:** "Leads **qualificados** cresceram mais que leads **totais** em outubro".
2. **Com destaque:** "CPL qualificado caiu **18%** na **Plataforma de Busca**".
3. **Denso e real do Farol: título dinâmico do painel de mídia.** A frase cita a plataforma com maior CPL no filtro atual e muda junto com ele.
4. **Limite: empate ou vazio.** "CPL estável (variação abaixo de 1%)"; "Sem leads no período filtrado".

**Referências.**
- Praticante: [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): observar rótulo direto, pouco deslocamento de olhar e linguagem de conversa.
- Praticante: [Datawrapper Academy, How to create text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar formatação de texto com cor dentro das anotações.

---

### 3.12 Citação em destaque e verbatim realçado

**Descrição.** Trecho de texto destacado tipograficamente (pull quote) e, na variante analítica, um verbatim com termos realçados e a informação de quanto ele representa. A Wikipedia registra o risco da citação fora de contexto.

**Anatomia.** Fio lateral ou aspas grandes; corpo maior; atribuição por perfil fictício ("cliente patrimonial, faixa B"); realce nos termos; contador "1 de 38 respostas parecidas".

**Abordagem na stack.** `html-tailwind`. `blockquote` com `border-s-4`; realce montado em TypeScript dividindo a string em segmentos pelos índices das ocorrências e renderizando `mark`, sem `dangerouslySetInnerHTML`.

**Ponto delicado.** Casar "preco" com "preço" exige normalizar para buscar, mas realçar a forma original. Mostrar a representatividade evita que uma frase escolhida a dedo pareça frequência.

**Versões sugeridas.**
1. **Básico: citação fictícia de motivo de ganho no topo do painel comercial.**
2. **Com destaque: verbatim com termos realçados.** Cor por categoria de objeção.
3. **Denso e real do Farol: cinco verbatins por motivo de perda.** Cada um com "representa 23% das respostas desse motivo".
4. **Limite: verbatim longo e dado sensível.** Texto de 800 caracteres recortado ao redor do termo com reticências; telefone substituído por "[telefone]".

**Referências.**
- Catálogo: [Wikipedia, Pull quote](https://en.wikipedia.org/wiki/Pull_quote): observar convenções tipográficas e o risco de tirar do contexto.
- Praticante: [Nightingale, How to Share Memorable Data](https://nightingaledvs.com/how-to-share-memorable-data/): observar mensagens de uma frase apoiadas por visual.

---

### 3.13 Anotação narrativa sobre gráfico

**Descrição.** Texto curto ligado a um ponto, faixa ou barra, com ou sem seta, explicando o que o leitor está vendo. Técnica que atravessa famílias; mora aqui porque é texto como forma.

**Anatomia.** Rótulo; linha guia ou seta; ponto de ancoragem no dado; faixa destacada opcional.

**Abordagem na stack.** `recharts-custom`. `ReferenceDot` com `label` customizado, ou um componente filho do gráfico que chama `useXAxisScale` e `useYAxisScale` para posicionar `<text>` e `<path>` com `marker-end`. Para quebra de linha automática, o componente `Text` do Recharts aceita largura.

**Ponto delicado.** Ancorar pela coordenada do dado mais um deslocamento em px, nunca por pixel absoluto. No celular, trocar as anotações por números com legenda abaixo do gráfico, como a Datawrapper faz. Colocar a anotação do lado oposto à massa de dados.

**Versões sugeridas.**
1. **Básico: pico de leads com "lançamento da campanha".**
2. **Com destaque: seta e faixa.** Seta apontando a queda e faixa sombreada no período.
3. **Denso e real do Farol: 3 anotações na série de CPL por plataforma.** Com modo celular em chaves numeradas.
4. **Limite: ponto anotado fora do filtro.** A anotação some e aparece aviso discreto "1 anotação fora do período".

**Referências.**
- Praticante: [Datawrapper Academy, How to create text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): observar âncoras de nove pontos, deslocamento e chaves numeradas no celular.
- Stack: [Recharts API](https://recharts.github.io/en-US/api/): observar `ReferenceDot`, `Label`, `LabelList` e os hooks de escala.
- Praticante: [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): observar anotação como forma de chamar o leitor para o gráfico.

---

## 4. Modelos que moram melhor em outra família

| Modelo | Família certa | Motivo |
|---|---|---|
| Treemap de termos e bolhas de palavras empacotadas | 12_hierarquia e 09_dispersao-e-bolhas | A forma é de área; Stephen Few critica as bolhas empacotadas junto com a nuvem |
| Frequência acumulada de termos (curva de Zipf) | 04_linhas | Curva contínua; o NLTK a usa como gráfico de linha |
| Termo por semana em intensidade | 15_mapa-de-calor-e-calendario | Grade termo x tempo codificada por cor |
| Card com número e variação | 01_cards-e-kpis | O número é a peça, não a frase |
| Sentimento por período em barras empilhadas divergentes | 02_barras-horizontais | É escala tipo Likert |
| Rede de coocorrência de termos | 27_rede-e-relacoes | Nós e arestas |
| Contagem de menções como ícones | 22_unidades-waffle-e-pictograma | Unidade repetida |

---

## 5. Notas transversais de implementação

1. **Pré-processamento antes do visual.** Minúsculas; chave sem acento via `normalize('NFD')` e remoção de diacríticos; forma exibida = forma original mais frequente; stopwords em português mais as do domínio ("cliente", "lead" quando onipresentes); bigramas opcionais; contagem por documento. Tudo em TypeScript puro sobre o dado fictício.
2. **Medição de texto.** `measureText` depois de `document.fonts.ready`, com cache por termo, fonte e tamanho.
3. **Determinismo.** Layouts de nuvem, árvore e rótulos sem aleatoriedade.
4. **Tema escuro.** O menor degrau de fonte ainda precisa de contraste de leitura contra o fundo; realce `mark` com fundo translúcido e texto claro.
5. **Dados pessoais.** Verbatins no Farol são fictícios, mas os componentes 8 e 12 nascem com mascaramento de nome, e-mail e telefone.
6. **Acessibilidade.** Nuvem e árvore sempre com lista textual equivalente.

---

## 6. Fontes consultadas

Abertas com conteúdo:
- https://datavizcatalogue.com/methods/wordcloud.html
- https://www.data-to-viz.com/graph/wordcloud.html
- https://github.com/jasondavies/d3-cloud
- https://www.highcharts.com/docs/chart-and-series-types/word-cloud-series
- https://github.com/ecomfe/echarts-wordcloud
- https://www.amcharts.com/demos/word-cloud/
- https://www.amcharts.com/demos/changing-data-word-cloud/
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText
- https://en.wikipedia.org/wiki/Tag_cloud
- https://tremor.so/docs/visualizations/bar-list
- https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables
- https://www.datawrapper.de/academy/category/tables
- https://www.nltk.org/book/ch01.html
- https://github.com/ryanjgallagher/shifterator
- https://github.com/JasonKessler/scattertext
- https://developers.google.com/chart/interactive/docs/gallery/wordtree
- https://www.jasondavies.com/wordtree/
- https://en.wikipedia.org/wiki/Key_Word_in_Context
- https://en.wikipedia.org/wiki/Pull_quote
- https://www.datawrapper.de/blog/text-in-data-visualizations/
- https://www.datawrapper.de/academy/how-to-create-text-annotations
- https://recharts.github.io/en-US/examples/
- https://recharts.github.io/en-US/examples/ScatterChartWithLabels/
- https://recharts.github.io/en-US/api/
- https://www.perceptualedge.com/blog/?p=1612
- https://nightingaledvs.com/how-to-share-memorable-data/
- https://www.behance.net/search/projects/word%20cloud
- https://www.behance.net/gallery/17146335/Marketing-Word-Cloud
- https://ui.shadcn.com/charts (sem modelos de texto; confirma a lacuna nas galerias baseadas em Recharts)

Tentadas sem sucesso, por isso sem link: artigo "Word clouds considered harmful" do Nieman Lab (403), página "about" da nuvem de Jason Davies (404), exemplo de nuvem do visx (página vazia), documentação do Voyant Tools (502), Data Viz Project (403), FlowingData (403), Dribbble e Figma Community (vazio ou 403), Observable Plot (429).
