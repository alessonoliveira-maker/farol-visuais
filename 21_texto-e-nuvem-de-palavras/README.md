# Texto e nuvem de palavras

Nesta família o texto tem dois papéis. **Texto como dado:** motivos de perda digitados livremente, termos de busca paga, palavras nos títulos de criativos, objeções anotadas pela pré-vendas, respostas abertas de formulário; as perguntas são quais termos aparecem, em que contexto, quando começaram a aparecer e como o vocabulário difere entre dois grupos. **Texto como forma:** o número que precisa ser lembrado dentro de uma frase, a frase que substitui a legenda, a citação que dá voz a um padrão já medido. A família responde "sobre o que se escreve e como se escreve", e também "qual é a frase do mês", sempre com a base declarada, porque texto convence mais do que prova.

Catálogo VISUAIS do Farol, 2026-09-14. Estudo de origem: [`_estudo/familias/21_texto-e-nuvem-de-palavras.md`](../_estudo/familias/21_texto-e-nuvem-de-palavras.md). Catálogo consolidado: [`_estudo/catalogo/21_texto-e-nuvem-de-palavras.json`](../_estudo/catalogo/21_texto-e-nuvem-de-palavras.json). Todos os casos de uso são fictícios.

## Quando a família serve

O que ela responde em cada público do Farol:

* **Comercial:** quais palavras mais aparecem nos motivos de perda livres do trimestre; o que os executivos escrevem antes e depois de "preço" nas oportunidades perdidas; qual vocabulário distingue as oportunidades ganhas das perdidas; qual frase de cliente resume o motivo de ganho mais citado.
* **Pré-vendas:** quais objeções aparecem nas anotações de ligação e como elas continuam depois de "não"; em que dias cada objeção se concentrou; o que mudou no vocabulário depois do novo roteiro.
* **Marketing:** quais termos de busca paga trazem lead qualificado e quais trazem lead fora do perfil; quais palavras nos títulos de criativos são típicas dos anúncios de CPL baixo; como as respostas abertas de formulário se distribuem no tempo.
* **Diretoria:** qual é a frase do mês, com o número principal, a comparação que dá sentido a ele, a faixa do cenário e a palavra premissa quando o número não é medido.

**Aviso que atravessa a família.** A nuvem de palavras é a forma mais pedida e a mais criticada: palavra longa ganha ênfase indevida, a área não se compara com precisão e ela aparece nas críticas ao lado das bolhas empacotadas como forma chamativa e pobre em informação. Para análise, a concordância (03), a dispersão no tempo (05), a dispersão de termos (06), a árvore (07) e a bar list de termos da família 02 respondem melhor; a nuvem (04) fica para ambientação e exploração rápida.

Serve mal quando a pergunta é só "quanto": contagem de termos com valor exato é barra horizontal ordenada, e número isolado com meta é card de KPI.

## Decisões que valem para a família toda

1. **Pré-processamento antes do visual.** Minúsculas; chave sem acento por `normalize('NFD')` e remoção de diacríticos; forma exibida é a forma original mais frequente; stopwords em português e as do domínio ("cliente", "lead" quando onipresentes) saem antes; bigramas opcionais. Tudo em TypeScript puro sobre o dado fictício.
2. **Contagem por documento.** O peso de um termo é quantas respostas o citam, não quantas vezes ele aparece: uma resposta que repete "preço" três vezes pesa uma.
3. **Frase gerada, nunca digitada.** Toda frase com número sai de uma função pura sobre o dado, com os formatadores de `@/lib/format`; o verbo (subiu, caiu, ficou estável) depende do sinal, da polaridade e de um corte de estabilidade declarado, e a função trata singular, plural, zero, faixa e ausência.
4. **Medição de texto.** Layouts que dependem da largura da palavra (nuvem, árvore, rótulos da dispersão) medem com `measureText` depois de `document.fonts.ready`, com cache por termo, fonte e tamanho.
5. **Determinismo.** Nuvem, árvore e seleção de rótulos sem `Math.random`; o layout só é refeito em breakpoints fixos de largura, nunca a cada pixel de redimensionamento.
6. **Tema escuro e realce.** O menor degrau de fonte é de 12 px e continua legível em `--text-muted`; realce `mark` com fundo translúcido, texto claro e um segundo canal (peso ou sublinhado), porque cor sozinha não carrega destaque.
7. **Representatividade declarada.** Citação diz quanto representa ("1 de 38 respostas parecidas"); nuvem, árvore e dispersão dizem o n de respostas e o que ficou de fora ("12 termos fora da nuvem").
8. **Dados pessoais.** Os verbatins do Farol são fictícios, mas a citação (02) e a concordância (03) nascem com mascaramento de nome, e-mail e telefone antes de qualquer exibição.
9. **Acessibilidade.** Nuvem e árvore sempre acompanhadas da lista textual equivalente em `sr-only`; a raiz tem `aria-label` com frase calculada do dado.

## Modelos

As pastas de modelo são criadas pelos produtores; os links abaixo apontam para onde cada uma vai morar.

| # | Modelo | Técnica | O que resolve | Versões previstas |
|---|---|---|---|---|
| 01 | [Frase com número e legenda embutida](./01_frase-com-numero/) | HTML com Tailwind | Conclusão em frase gerada do dado, com o número dentro do texto, a base da comparação escrita e as palavras pintadas com a cor da série no lugar da legenda | 4 |
| 02 | [Citação em destaque e verbatim realçado](./02_citacao-e-verbatim/) | HTML com Tailwind | Voz do cliente ilustrando um padrão já medido, com termos realçados por categoria, contador de representatividade e mascaramento de dado pessoal | 4 |
| 03 | [Concordância KWIC](./03_concordancia-kwic/) | HTML com Tailwind | Cada ocorrência de um termo numa linha, com o termo centralizado e os contextos esquerdo e direito alinhados, para ler como o termo é usado | 4 |
| 04 | [Nuvem de palavras](./04_nuvem-de-palavras/) | SVG puro; variante alinhada em HTML com Tailwind | Visão impressionista do vocabulário em espiral determinística, ou nuvem alinhada com degraus por quantil e termos clicáveis como filtro | 4 |
| 05 | [Dispersão lexical ao longo do tempo](./05_dispersao-lexical-no-tempo/) | Recharts com shape customizado | Quando cada termo começou, adensou ou parou de aparecer, uma faixa por termo e um traço por ocorrência | 4 |
| 06 | [Dispersão de termos (scattertext)](./06_dispersao-de-termos/) | Recharts com rótulos customizados | Qual vocabulário distingue dois grupos entre centenas de termos, com diagonal de referência e rótulos sem colisão | 4 |
| 07 | [Árvore de palavras](./07_arvore-de-palavras/) | SVG puro | Como as frases continuam depois, ou começam antes, de uma palavra raiz, com ramos podados pela frequência | 4 |

Variações absorvidas como versões: o KPI em texto corrido da família 01 (estudo 01, item 1.24) entra no 01, na versão com dataword (`v2_receita-do-mes-em-texto-corrido`) e nas regras de gramática de borda da `v4_zero-um-estavel-e-ausente`; a nuvem alinhada ponderada, ou tag cloud (estudo 21, item 2), entra no 04 como `v3_termos-de-busca-em-nuvem-alinhada`, em HTML com Tailwind.

## Guia rápido: qual modelo escolher

Comece pela pergunta, não pela forma:

| Se a pergunta é... | Use |
|---|---|
| Qual é a conclusão do recorte, com o número e a base da comparação | 01 |
| Qual série é qual, sem legenda embaixo do gráfico | 01, versão de legenda embutida |
| Qual é o resumo da Diretoria, com cenário em faixa e premissa declarada | 01, versão de sumário executivo |
| Como o cliente diz isso, e quanto essa fala representa | 02 |
| Em que contexto o termo aparece, ocorrência por ocorrência | 03 |
| Sobre o que as pessoas escrevem, numa olhada e sem precisão | 04 |
| Quais tags filtram o painel | 04, versão de nuvem alinhada |
| Quando um termo começou ou parou de aparecer, ou se adensou depois de um evento | 05 |
| Qual vocabulário distingue dois grupos entre 100 e 300 termos | 06 |
| Como as frases continuam depois, ou começam antes, de uma palavra | 07 |
| Quais termos aparecem mais, com o valor legível | Bar list da família 02 (02/09) |
| Quais termos cresceram e quais caíram entre dois períodos ou grupos | Barras divergentes da família 02 (02/06) |
| As duas magnitudes de cada termo lado a lado, entre dois grupos | Pirâmide da família 02 (02/07) |
| O número a ser lembrado como peça, com variação e meta | KPI simples com contexto (01/01) |
| Por que o gráfico tem aquele pico | Anotação sobre a linha simples (04/01) |

Três testes antes de escolher:

* **A pergunta pede valor exato?** Então não é nuvem: é a bar list de termos (02/09), e a nuvem no máximo acompanha como ambientação.
* **Há menos de 30 respostas ou menos de 15 termos?** Nuvem, árvore e dispersão inventam padrão com amostra pequena; mostre a lista ou as frases em concordância (03), com o aviso de amostra pequena.
* **O texto vai ser lido por quem decide ou por quem investiga?** Quem decide lê a frase (01) e a citação com representatividade (02); quem investiga usa a concordância (03), a dispersão (05 e 06) e a árvore (07).

## Referências cruzadas

Formas estudadas nesta família que moram em outra, porque a técnica é a dela; a versão de texto já está prevista lá.

| Item do estudo 21 | Onde mora | Versão com texto | Motivo |
|---|---|---|---|
| 3, Lista de termos com barras | [02_barras-horizontais/09_bar-list](../02_barras-horizontais/09_bar-list/) | `v4_termos-com-cauda-agregada` | É bar list: termo, barra com base zero e valor, com a cauda agregada |
| 4, Barras divergentes de mudança de vocabulário (word shift) | [02_barras-horizontais/06_barras-divergentes](../02_barras-horizontais/06_barras-divergentes/) | `v3_termos-de-perda-que-mais-mudaram` | Barra divergente a partir do zero com domínio simétrico |
| 5, Pirâmide de termos entre dois grupos | [02_barras-horizontais/07_butterfly-piramide](../02_barras-horizontais/07_butterfly-piramide/) | `v3_termos-em-ganhas-e-perdidas` | Butterfly com as duas magnitudes normalizadas por grupo |
| 10, Número em destaque com frase | [01_cards-e-kpis/01_kpi-simples](../01_cards-e-kpis/01_kpi-simples/) | absorvido no KPI simples com contexto | O número é a peça; a frase é contexto dele. Quando a frase é a peça, use o 01 desta família |
| 13, Anotação narrativa sobre gráfico | [04_linhas/01_linha-simples](../04_linhas/01_linha-simples/) | anotação ancorada no dado da série | A anotação vive dentro do gráfico que ela explica, ancorada na coordenada do dado |

## Quando procurar outra família

| Se o que você tem é... | Família certa | Motivo |
|---|---|---|
| Treemap de termos ou bolhas de palavras empacotadas | [12_hierarquia](../12_hierarquia/) ou [09_dispersao-e-bolhas](../09_dispersao-e-bolhas/) | A forma é de área, e as bolhas empacotadas sofrem a mesma crítica da nuvem |
| Frequência acumulada de termos (curva de Zipf) | [04_linhas](../04_linhas/) | Curva contínua |
| Termo por semana em intensidade, ou dispersão com mais de 10 ocorrências por dia | [15_mapa-de-calor-e-calendario](../15_mapa-de-calor-e-calendario/) | Grade termo por tempo codificada por cor |
| Card com número e variação | [01_cards-e-kpis](../01_cards-e-kpis/) | O número é a peça, não a frase |
| Sentimento por período em barras empilhadas divergentes | [02_barras-horizontais](../02_barras-horizontais/) | É escala tipo Likert (02/08) |
| Rede de coocorrência de termos | [27_rede-e-relacoes](../27_rede-e-relacoes/) | Nós e arestas |
| Contagem de menções como ícones | [22_unidades-waffle-e-pictograma](../22_unidades-waffle-e-pictograma/) | Unidade repetida |
| Tabela de termos com várias colunas (leads, percentual qualificado, CPL, tendência) | [14_tabelas-visuais](../14_tabelas-visuais/) | Várias métricas por termo, com escala por coluna |

## Referências

Todos os links vêm do estudo da família 21, do estudo da família 01 (item 1.24, absorvido no modelo 01) ou de [`_estudo/00_portais-de-design.md`](../_estudo/00_portais-de-design.md). A marca **[aberto]** ou **[busca]** repete a procedência registrada nos portais.

### Frase com número e citação (modelos 01 e 02)

* [Datawrapper, Text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations/): rótulo direto no lugar da chave de cor, título em linguagem de conversa, número abreviado com a precisão na dica e a unidade repetida no texto; modelo 01.
* [Datawrapper Academy, How to create text annotations](https://www.datawrapper.de/academy/how-to-create-text-annotations): texto com cor dentro da anotação, âncoras e chaves numeradas no celular; modelo 01 e anotação narrativa (04/01).
* [Sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): a definição de dataword, o gráfico do tamanho de uma palavra onde números e texto aparecem; modelo 01, versão com dataword.
* [Storytelling with data, simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text): o texto que nivela o público antes do gráfico; modelo 01.
* [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics): o período de comparação é a parte que as equipes esquecem, e vale igual para a frase gerada; modelo 01.
* [Nightingale, How to Share Memorable Data](https://nightingaledvs.com/how-to-share-memorable-data/): números grandes com cor de acento e mensagem de uma frase apoiada por visual; modelos 01, 02 e 04.
* [Wikipedia, Pull quote](https://en.wikipedia.org/wiki/Pull_quote): convenções tipográficas da citação em destaque e o risco de tirar a fala do contexto; modelo 02.

### Leitura do termo em contexto (modelos 03 e 07)

* [Wikipedia, Key Word in Context](https://en.wikipedia.org/wiki/Key_Word_in_Context): o layout com o termo centralizado e a diferença para o formato sem contexto; modelo 03.
* [Google Charts, Word Tree](https://developers.google.com/chart/interactive/docs/gallery/wordtree): formatos implícito e explícito e as orientações prefixo, sufixo e dupla; modelo 07.
* [Word Tree interativo em jasondavies.com](https://www.jasondavies.com/wordtree/): troca de raiz por clique e árvore reversa; modelo 07.

### Nuvem de palavras (modelo 04)

* [Data Viz Catalogue, Word Cloud](https://datavizcatalogue.com/methods/wordcloud.html): viés de palavra longa e de ascendentes e descendentes, e os arranjos em linhas e colunas como variante.
* [From Data to Viz, Word cloud](https://www.data-to-viz.com/graph/wordcloud.html): crítica à área como codificação e as alternativas sugeridas, barplot e lollipop.
* [d3-cloud, README](https://github.com/jasondavies/d3-cloud): colocação do maior para o menor, espiral arquimediana ou retangular e descarte do que não cabe; só como referência de algoritmo, sem importar a biblioteca.
* [Highcharts, Word cloud series](https://www.highcharts.com/docs/chart-and-series-types/word-cloud-series): estratégias de colocação, tipos de espiral e a limitação da colisão com rotação.
* [echarts-wordcloud, README](https://github.com/ecomfe/echarts-wordcloud): `sizeRange`, `gridSize` e `shrinkToFit`, que decide entre encolher e omitir; só como referência de algoritmo.
* [MDN, measureText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText): campos de `TextMetrics` para largura e caixa real do texto.
* [amCharts, Word Cloud](https://www.amcharts.com/demos/word-cloud/) e [amCharts, Changing Data Word Cloud](https://www.amcharts.com/demos/changing-data-word-cloud/): corte em cerca de 100 palavras e a transição quando os pesos mudam.
* [Perceptual Edge, What Makes a Chart Boring?](https://www.perceptualedge.com/blog/?p=1612): crítica conjunta à nuvem de palavras e às bolhas empacotadas.
* [Wikipedia, Tag cloud](https://en.wikipedia.org/wiki/Tag_cloud): tipos de nuvem, layouts alfabético e por peso e a fórmula de normalização do tamanho; versão de nuvem alinhada.

### Dispersões (modelos 05 e 06)

* [NLTK Book, capítulo 1](https://www.nltk.org/book/ch01.html): o dispersion plot, uma faixa por termo e um traço por ocorrência, e por que as palavras mais comuns são vazias; modelo 05 e pré-processamento da família.
* [Recharts, índice de exemplos](https://recharts.github.io/en-US/examples/): exemplos de ScatterChart com eixo categórico e shape customizado; modelo 05.
* [Scattertext, README](https://github.com/JasonKessler/scattertext): eixos por categoria e o tratamento de colisão de rótulos; modelo 06.
* [Recharts, Scatter Chart With Labels](https://recharts.github.io/en-US/examples/ScatterChartWithLabels/): `LabelList` dentro de `Scatter`; modelo 06.
* [Recharts API](https://recharts.github.io/en-US/api/): `ReferenceLine`, `ReferenceArea`, `LabelList` e os hooks de escala usados em 05 e 06.

### Formas que moram em outra família

* [Tremor, BarList](https://tremor.so/docs/visualizations/bar-list): `valueFormatter`, `sortOrder` e largura mínima da barra; lista de termos (02/09).
* [Datawrapper Academy, How to add bar charts to tables](https://www.datawrapper.de/academy/how-to-add-bar-charts-line-charts-to-tables): base zero, faixa máxima fixa e cor separada para negativos; lista de termos em tabela.
* [Shifterator, README](https://github.com/ryanjgallagher/shifterator): anatomia de barras por contribuição e tipos de word shift; barras divergentes (02/06) e pirâmide (02/07).

### Portais de design

* [Behance, Career Advice Word Cloud Infographic](https://www.behance.net/gallery/43513099/Career-Advice-Word-Cloud-Infographic) **[aberto]**: tamanho e destaque indicam frequência dos termos; a página não detalha regra de cor.
* [Dribbble, Word Cloud](https://dribbble.com/shots/4085097-Word-Cloud) **[busca]**: nuvem de palavras como peça de interface; qualidade visual não conferida.
* [Dribbble, tag word cloud](https://dribbble.com/tags/word_cloud) **[busca]**: mostra que o material do portal é quase todo decorativo.
* [Behance, busca "word cloud"](https://www.behance.net/search/projects/word%20cloud): diferença entre composições decorativas e listas ponderadas.
* [Behance, Marketing Word Cloud](https://www.behance.net/gallery/17146335/Marketing-Word-Cloud): composição manual de funções de marketing como nuvem; referência de composição, não de análise.
* [shadcn/ui, Charts](https://ui.shadcn.com/charts): nenhum modelo de texto; confirma a lacuna nas galerias baseadas em Recharts.

**Lacunas.** Não há nuvem, concordância, árvore ou dispersão de termos dentro de dashboard analítico nos portais varridos: a busca devolveu quase só estampa e pôster. O desenho destes modelos se apoia nas referências de método acima, não em shot de portal. Ficaram sem link, porque não abriram na pesquisa: o artigo "Word clouds considered harmful", a documentação do Voyant Tools, o Data Viz Project, o FlowingData e o Observable Plot.

**No Farol:** frase, citação, concordância e nuvem alinhada em HTML com Tailwind; nuvem em espiral e árvore em SVG puro com geometria calculada em TypeScript; dispersão no tempo e dispersão de termos no Recharts com shape e rótulos customizados. Nada de d3, d3-cloud, visx, nivo ou echarts.
