# Mosaico e marimekko

Esta família mostra **dois fatores de composição ao mesmo tempo**: quanto cada grupo pesa no total, pela largura, e do que ele é feito, pela altura. A área de cada ladrilho é proporcional ao valor da célula, e as variáveis dividem o retângulo de forma recursiva. A forma é boa para visão geral da composição e ruim quando a comparação numérica precisa ser exata, porque só a parte da base tem linha de base comum. Os três modelos abaixo vão do marimekko 100% (que absorve o divergente, o mosaico de duas variáveis e o mosaico com resíduos) ao bar mekko de altura absoluta e ao spineplot de desfecho binário. Nenhum sai do Recharts: a largura variável não existe na `Bar`, então o layout é TypeScript puro e o desenho é SVG em React.

Estudo de origem: [`_estudo/familias/26_mosaico-marimekko.md`](../_estudo/familias/26_mosaico-marimekko.md). Catálogo desta família: [`_estudo/catalogo/26_mosaico-marimekko.json`](../_estudo/catalogo/26_mosaico-marimekko.json).

## O que a família responde

Perguntas típicas no Farol, com dado fictício:

- **Diretoria:** qual a nossa participação em cada segmento, e quanto cada segmento pesa no perímetro de mercado declarado?
- **Marketing:** de cada origem de lead, quanto do volume tem dado completo, parcial ou ausente? Quanto se investe em cada plataforma, lido como leads vezes CPL? Que combinação de plataforma e formato do criativo qualifica mais?
- **Comercial:** a taxa de ganho muda com a faixa de porte? Quais origens trazem ticket alto com poucas vitórias? No handoff, quanto cada fila teve aceito e por que motivo o resto voltou?
- **Pré-vendas:** quanto cada fila pesa nas entradas e qual a proporção dentro e fora do SLA em cada uma? Lead contatado dentro do SLA qualifica mais?

## Modelos

| # | Modelo | Pasta | Abordagem | Versões | O que responde |
|---|---|---|---|---|---|
| 01 | Marimekko 100% e mosaico | [./01_marimekko-e-mosaico/](./01_marimekko-e-mosaico/) | SVG puro | 4 | Peso do grupo e composição dele ao mesmo tempo; absorve o marimekko divergente, o mosaico de duas variáveis e o mosaico com resíduos. |
| 02 | Bar mekko (variwide) | [./02_bar-mekko-variwide/](./02_bar-mekko-variwide/) | SVG puro | 4 | Taxa por grupo em valor absoluto com o peso do grupo na largura, quando a área é grandeza real (investimento, receita). |
| 03 | Spineplot, spinograma e double decker | [./03_spineplot/](./03_spineplot/) | SVG puro | 4 | Taxa de um desfecho binário ao longo de x, com o peso de cada x; absorve x contínuo em faixas e duas variáveis na largura. |

As pastas dos modelos são criadas quando as versões forem produzidas.

Versões previstas no catálogo:

| Modelo | Versão | Caso de uso |
|---|---|---|
| 01 | `v1_cobertura-de-dado-por-origem` | Marketing: leads por origem divididos em dado completo, parcial e ausente. |
| 01 | `v2_handoff-aceitas-e-devolvidas` | Comercial: variação divergente com aceitas acima e devolvidas por motivo abaixo. |
| 01 | `v3_participacao-de-mercado-com-perimetro` | Diretoria: fatia por segmento com perímetro declarado e procedência. |
| 01 | `v4_desfecho-por-origem-com-residuos` | Comercial: mosaico com resíduos de Pearson e amostra insuficiente em hachura. |
| 02 | `v1_cpl-por-plataforma` | Marketing: CPL na altura, leads na largura, investimento como área. |
| 02 | `v2_investimento-acima-do-cpl-alvo` | Marketing: parte de cada coluna acima do CPL alvo destacada. |
| 02 | `v3_ticket-medio-e-receita-por-origem` | Comercial: ticket médio na altura, vitórias na largura, receita como área. |
| 02 | `v4_investimento-sem-lead` | Marketing: plataforma com investimento e zero lead, CPL indefinido. |
| 03 | `v1_ganho-por-faixa-de-porte` | Comercial: spineplot básico de ganho por faixa de porte. |
| 03 | `v2_qualificacao-por-tempo-ate-contato` | Pré-vendas: spinograma com a faixa do SLA marcada. |
| 03 | `v3_qualificado-por-plataforma-e-formato` | Marketing: double decker de plataforma e formato do criativo. |
| 03 | `v4_porte-desconhecido-e-amostra-pequena` | Comercial: porte desconhecido hachurado e faixa com n = 4. |

## Quando a família serve

- Peso de cada grupo e composição dele no mesmo quadro, de 3 a 6 grupos por até 5 partes.
- Participação de mercado com o 100% da largura definido por um perímetro escrito no subtítulo.
- Tabela de contingência de duas variáveis categóricas lida como área, com a ordem de divisão declarada.
- Taxa por grupo em que o peso do grupo muda a leitura, com área que é grandeza real.
- Taxa de um desfecho binário ao longo de categorias ou faixas de x com pesos diferentes.

## Quando procurar outra família

- Grupos de peso parecido ou largura sem significado: barras empilhadas 100% (02/04) ou colunas empilhadas 100% (03/04).
- Comparação precisa entre partes do meio da pilha: barras agrupadas (02/02).
- Hierarquia de três níveis ou mais: treemap (12/01).
- Fluxo de casos entre etapas ou estados: parallel sets (11/04).
- Contagem cruzada lida como número, ou mais de 6 grupos por 5 partes: tabela cruzada com totais marginais (14/06).
- Duas métricas sem produto significativo: dispersão simples (09/01).
- Uma fração de 100 contada por unidade: waffle (22/01).

## Guia rápido: qual modelo escolher

1. **A altura é uma composição que fecha em 100% dentro de cada grupo?** Marimekko 100% (01). Com um lado favorável e outro desfavorável, a variação divergente (v2), com a mesma escala acima e abaixo da linha.
2. **As duas dimensões são variáveis categóricas e a pergunta é se elas se associam?** Mosaico de duas variáveis, também no 01: diga no subtítulo qual variável dividiu primeiro. Para ver onde a combinação foge do esperado, cor pelo resíduo (v4), só com esperado de pelo menos 5.
3. **A altura é um valor absoluto, como CPL ou ticket médio, e largura vezes altura é uma grandeza real?** Bar mekko (02). Se o produto não significa nada, dispersão (09/01).
4. **O desfecho é binário e a pergunta é se a taxa muda ao longo de x?** Spineplot (03). x contínuo vira spinograma com limites de negócio escritos no eixo (v2); duas variáveis explicativas viram double decker (v3).
5. **Todos os grupos têm peso parecido?** A largura não informa: barras ou colunas empilhadas 100% (02/04 ou 03/04).
6. **Mais de 6 grupos, mais de 5 partes ou três níveis?** Tabela cruzada com totais marginais (14/06) ou treemap (12/01).

Regras que valem para os três modelos:

- Layout em função pura de TypeScript (`marimekko()` do estudo), desenho em `rect` com `fill="var(--chart-N)"`; nenhuma dependência nova além do React.
- Ordem das colunas por largura decrescente ou pela ordem natural (faixas); ordem das partes fixa em todas as colunas, com a parte mais importante na base.
- Vão de 1 a 2 px em `--surface-raised`; o mosaico estatístico usa vão maior entre grupos que entre partes.
- Rótulo dentro do ladrilho só acima de uns 28 por 16 px; nome, total e participação da coluna ficam no eixo.
- Coluna abaixo de 4 px de largura não some: agrega em outros ou ganha marcador externo com rótulo.
- Ausente é parte, não buraco: "sem informação" em hachura neutra no topo da coluna, e o subtítulo declara a cobertura quando o denominador da largura é incompleto.
- Participação de mercado só com perímetro declarado no subtítulo e etiqueta `--prov-premissa` ou `--prov-medido`.
- Resíduo não é bom nem ruim: dois matizes neutros, nunca `--positive` e `--negative`. O kit ainda não tem par de tokens divergentes (proposta no estudo, decisão 8).
- SVG com `aria-hidden` e a tabela cruzada equivalente em `details` ou aba; frase acessível calculada do dado na raiz.
- No celular, layout horizontal: colunas viram linhas, com rótulos à esquerda.

## Referências cruzadas

O estudo mapeou 8 formas nesta família; três viraram modelos, cinco foram absorvidas como versões, e as vizinhas moram onde a geometria ou a leitura pertence.

| Visual do estudo | Onde mora | Por quê |
|---|---|---|
| Marimekko divergente (26#3) | [01 marimekko e mosaico](./01_marimekko-e-mosaico/), versão v2 | É o mesmo layout com dois acumuladores, um acima e um abaixo da linha zero. |
| Mosaico de duas variáveis (26#4) | [01 marimekko e mosaico](./01_marimekko-e-mosaico/), versão v4 | Mesma função de layout, com vão maior entre grupos e botão de inverter variáveis. |
| Mosaico com resíduos (26#5) | [01 marimekko e mosaico](./01_marimekko-e-mosaico/), versão v4 | É o mosaico com a cor trocada pelo resíduo de Pearson. |
| Spinograma (26#7) | [03 spineplot](./03_spineplot/), versão v2 | Spineplot com x contínuo cortado em faixas de limites declarados. |
| Double decker (26#8) | [03 spineplot](./03_spineplot/), versão v3 | Layout recursivo só na largura, com o desfecho na altura. |
| Barra 100% empilhada e barra proporcional empilhada | [02_barras-horizontais, modelo 04](../02_barras-horizontais/04_barras-empilhadas-100/) e [03_colunas-verticais, modelo 04](../03_colunas-verticais/04_colunas-empilhadas-100/) | Sem a largura com significado, a barra 100% compara melhor e usa Recharts nativo. |
| Treemap, inclusive a divisão alternada em fatias | [12_hierarquia, modelo 01 treemap](../12_hierarquia/01_treemap/) | Hierarquia de área sem eixos percentuais pertence à família de hierarquia. |
| Parallel sets | [11_fluxo-sankey, modelo 04 parallel sets](../11_fluxo-sankey/04_parallel-sets/) | Quando a pergunta é a passagem de casos entre categorias, a faixa de fluxo lê melhor que o ladrilho. |
| Tabela cruzada com totais marginais | [14_tabelas-visuais, modelo 06](../14_tabelas-visuais/06_tabela-cruzada-com-totais-marginais/) | É a saída acessível de todo mosaico e a escolha quando o leitor precisa do número. |
| Mapa de calor de resíduos | [15_mapa-de-calor-e-calendario, modelo 02 matriz categórica](../15_mapa-de-calor-e-calendario/02_matriz-categorica/) | Sem a área, a matriz em cor mostra o resíduo com células iguais. |
| Barra divergente sem largura | [02_barras-horizontais, modelo 08 divergente empilhada](../02_barras-horizontais/08_divergente-empilhada-likert/) | Divergente com grupos de peso igual dispensa a largura variável. |
| Duas métricas sem produto significativo | [09_dispersao-e-bolhas, modelo 01](../09_dispersao-e-bolhas/01_dispersao-simples/) | Se largura vezes altura não é grandeza, o bar mekko inventa uma área. |
| Distribuição de x sem desfecho | [16_distribuicao, modelo 01 histograma](../16_distribuicao/01_histograma/) | O spinograma só vale com um desfecho na altura. |
| Waffle e área quadrada | [22_unidades-waffle-e-pictograma](../22_unidades-waffle-e-pictograma/) | Fração contada por unidade, sem segunda dimensão. |

## Referências

Todos os links vêm do estudo da família e da varredura de portais (`_estudo/00_portais-de-design.md`), com a marca de proveniência de lá quando a página não foi lida por inteiro. Bibliotecas citadas só como leitura de geometria e de API não entram na stack do Farol.

### Método e definição da forma

- [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html): observar os dois eixos percentuais, a leitura como barra 100% empilhada de duas vias, o alerta sobre a falta de linha de base e o limite de poucos segmentos, que dobra no divergente. O catálogo trata marimekko e mosaico como o mesmo gráfico.
- [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): observar a divisão recursiva, o histórico (Hartigan e Kleiner, 1981; Friendly, 1994; antecedente de 1877), o sombreamento pelo resíduo padronizado e as variantes spineplot e double decker.
- [R, spineplot (documentação)](https://stat.ethz.ch/R-manual/R-devel/library/graphics/html/spineplot.html): observar a definição por P(y dado x) contra P(x), o spinograma com `breaks` e as referências a Friendly e a Hartigan e Kleiner.
- [Nightingale, How to Create a Pivot Marimekko Chart in Plain JavaScript](https://nightingaledvs.com/how-to-create-a-pivot-marimekko-chart-in-plain-javascript/): observar largura pela soma da coluna e altura pelo percentual dentro dela, totais acima das colunas, percentual na base, pivô de dimensão e o limite para comparação detalhada.
- [Nightingale, busca por marimekko](https://nightingaledvs.com/?s=marimekko): observar o que mais o portal publicou sobre a forma.
- [FT Visual Vocabulary (pasta)](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) e [README com a barra proporcional empilhada](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar onde a barra proporcional empilhada entra no vocabulário, vizinha da barra 100% (02 e 03).
- [Data Visualisation Catalogue, índice](https://datavizcatalogue.com/): observar os métodos vizinhos de composição para decidir se a largura é necessária.

### Marimekko e mosaico (01)

- [Nivo, marimekko](https://nivo.rocks/marimekko/): observar `value` para a espessura, `dimensions` para as partes, os `offset` `expand`, `diverging` e `silhouette`, os exemplos divergentes e o layout horizontal para o celular.
- [Vega-Lite, Mosaic Chart with Labels](https://vega.github.io/vega-lite/examples/rect_mosaic_labelled_with_offset.html): observar a sequência `aggregate`, `stack` horizontal normalizado, `window` para rank e segundo `stack` vertical, e o deslocamento que separa rótulos.
- [Vega-Lite, galeria](https://vega.github.io/vega-lite/examples/): observar os exemplos de `rect` vizinhos do mosaico.

### Bar mekko (02)

- [Highcharts, variwide](https://www.highcharts.com/demo/highcharts/variwide): a página abriu só com título e categoria (colunas e barras); vale como nome da forma.
- [Nivo, marimekko](https://nivo.rocks/marimekko/): observar a espessura vinda de outra dimensão, que é o princípio do bar mekko.

### Spineplot, spinograma e double decker (03)

- [R, spineplot (documentação)](https://stat.ethz.ch/R-manual/R-devel/library/graphics/html/spineplot.html) e [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot), acima: observar o spineplot como caso especial do mosaico, os limites de faixa do spinograma e a variante double decker.

### Galerias varridas sem a forma

- [AG Charts, galeria](https://www.ag-grid.com/charts/gallery/): sem marimekko nem mosaico; confirma que a forma não é padrão de biblioteca de gráfico de negócio.
- [RAWGraphs, tutoriais](https://www.rawgraphs.io/learning): sem marimekko nem mosaico.

### Portais de design

**Pouca referência:** é a família mais pobre do catálogo. Buscas no Behance por "marimekko chart", "mekko chart" e "mosaic plot" não trouxeram projeto de gráfico dedicado, e a Figma Community não foi varrida por falta de orçamento de busca. Olhe cada peça antes de adotar.

- [Dribbble, 45 Marimekko Chart](https://dribbble.com/shots/4543911-45-Marimekko-Chart) (não abriu): marimekko de uma série numerada de estudos de gráfico; a qualidade visual não foi conferida.
- [Dribbble, tag marimekko](https://dribbble.com/tags/marimekko) [busca]: citada para mostrar a escassez; inclui páginas de referência do formato em tablet.
- [Behance, portfólio 2024 com tags de mosaico](https://www.behance.net/gallery/159150041/Jonny-Czar-Portfolio-2024) [aberto]: portfólio com tags de mosaico, ladrilho e gráfico; a página traz só miniaturas e tags, sem descrição da peça.
- [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html) [busca]: não é portal de design, mas a varredura o registrou por explicar largura e altura normalizadas a 100% e o limite de poucas categorias.
