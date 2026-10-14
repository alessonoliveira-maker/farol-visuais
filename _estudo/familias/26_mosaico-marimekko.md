# Família 26: mosaico e marimekko

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10 (instalado 3.10.1), Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa, empresa ou plataforma real.

## O que a família responde

A família mostra **dois fatores de composição ao mesmo tempo**: quanto cada grupo pesa no total (largura) e do
que ele é feito (altura). A Data Visualisation Catalogue chama o marimekko de barra 100% empilhada de duas vias,
útil para ver relação entre categorias e subcategorias, e avisa que ele fica difícil com muitos segmentos e que
os segmentos não compartilham linha de base. A Wikipedia traça a origem do mosaico (Hartigan e Kleiner, 1981;
Friendly, 1994; um antecedente de Georg von Mayr em 1877): a área de cada ladrilho é proporcional à contagem, e
as variáveis dividem o retângulo de forma recursiva. A documentação do R define o spineplot como caso especial:
largura pela frequência de x, altura pela frequência condicional de y.

Perguntas típicas no Farol:

- **Diretoria:** qual a nossa participação em cada segmento, e quanto cada segmento pesa no perímetro de mercado
  declarado?
- **Marketing:** de cada origem de lead, quanto do volume tem dado completo, parcial ou ausente? Quanto se investe
  em cada plataforma, lido como leads vezes CPL?
- **Comercial:** em que etapa as perdas se concentram e com quais motivos? A taxa de ganho muda com a faixa de porte?
- **Pré-vendas:** quanto cada fila pesa nas entradas e qual a proporção dentro e fora do SLA em cada uma?

Quando não usar: comparação precisa entre segmentos do meio (barra agrupada, 02); mais de uns 6 grupos por 5
partes; hierarquia de três níveis ou mais (treemap, 12); fluxo entre etapas (sankey, 11). O artigo do Nightingale
sobre marimekko resume o papel: bom para visão geral da composição, ruim quando a comparação numérica precisa
ser exata.

## Decisões transversais da família

1. **Não há componente pronto no Recharts.** A largura variável não existe na `Bar`. O layout é TypeScript puro e o
   desenho é `svg-puro` com `rect`; tooltip é um `div` absoluto que reusa o card de tooltip do kit. Hipótese a
   validar em protótipo, sem fonte que a confirme: um `ComposedChart` com eixos numéricos de 0 a 100 e um
   `ReferenceArea` por ladrilho dá eixos e grade do Recharts de graça, mas perde o tooltip nativo.
2. **Ordem das colunas.** Por largura decrescente, ou ordem natural (faixas). **Ordem das partes fixa** em todas as
   colunas, com a parte mais importante na base, a única que tem linha de base comum.
3. **Vãos.** 1 a 2 px entre colunas e entre partes, na cor `--surface-raised`. O mosaico estatístico usa vãos
   maiores a cada nível de divisão, para mostrar a ordem das variáveis.
4. **Rótulos.** Nome, total e participação da coluna no topo ou na base; rótulo dentro do ladrilho só acima de um
   limiar de área (uns 28 por 16 px), senão tooltip. A Vega-Lite calcula deslocamentos para separar rótulos.
5. **Coluna fina não some.** Abaixo de 4 px de largura, agregar em "Outros" ou puxar um marcador externo com rótulo.
6. **Ausente é parte, não buraco.** "Sem informação" vira ladrilho hachurado no topo da coluna; quando o
   denominador da largura é incompleto, o subtítulo declara a cobertura.
7. **Perímetro declarado.** Participação de mercado só existe com o 100% da largura definido: subtítulo obrigatório
   ("perímetro: 4 segmentos, base de dados pública fictícia, 2026") e procedência `--prov-premissa` ou
   `--prov-medido`.
8. **Cor.** Paleta categórica `--chart-1..8` para as partes; o kit ainda não tem par de tokens divergentes, e o
   modelo 5 precisa de um (proposta: `--accent-cyan` e `--accent-amber` com `color-mix`, sem `--positive` e
   `--negative`, porque resíduo não é bom nem ruim).
9. **Acessibilidade.** SVG com `aria-hidden` e, ao lado, a tabela cruzada equivalente (família 14, modelo 13) em
   `details` ou aba.
10. **Celular.** Layout horizontal (o Nivo oferece vertical e horizontal): colunas viram linhas, com rótulos à
    esquerda e largura virando altura.

Layout base usado pelos modelos 1, 4 e 6:

```ts
export type Cell = { group: string; part: string; value: number };
export type Tile = { group: string; part: string; x: number; w: number; y: number; h: number; value: number; share: number };

export function marimekko(cells: Cell[], groups: string[], parts: string[], W: number, H: number, gap = 2): Tile[] {
  const valueOf = (g: string, p: string) => cells.find((c) => c.group === g && c.part === p)?.value ?? 0;
  const totals = groups.map((g) => parts.reduce((s, p) => s + valueOf(g, p), 0));
  const grand = totals.reduce((s, v) => s + v, 0);
  const usableW = W - gap * Math.max(groups.length - 1, 0);
  const tiles: Tile[] = [];
  let x = 0;
  groups.forEach((g, gi) => {
    const w = grand === 0 ? 0 : (totals[gi] / grand) * usableW;
    const usableH = H - gap * Math.max(parts.length - 1, 0);
    let y = H;
    parts.forEach((p) => {
      const v = valueOf(g, p);
      const share = totals[gi] === 0 ? 0 : v / totals[gi];
      const h = share * usableH;
      y -= h;
      tiles.push({ group: g, part: p, x, w, y, h, value: v, share });
      y -= gap;
    });
    x += w + gap;
  });
  return tiles;
}
```

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Marimekko 100% | peso do grupo e composição dele ao mesmo tempo | comparar partes do meio com precisão | ordem das partes variando entre colunas |
| 2 | Bar mekko (variwide) | taxa por grupo com peso do grupo; área com significado | quando largura vezes altura não é grandeza real | eixo Y que não começa em zero |
| 3 | Marimekko divergente | lado favorável e desfavorável por grupo com peso | categoria neutra sem regra | escalas diferentes acima e abaixo da linha |
| 4 | Mosaico de duas variáveis | tabela de contingência vista como área | variáveis com muitas categorias | não dizer qual variável dividiu primeiro |
| 5 | Mosaico com resíduos | onde a combinação acontece mais ou menos que o esperado | contagens esperadas pequenas | pintar resíduo com cor de bom e ruim |
| 6 | Spineplot | taxa de um desfecho ao longo das categorias de x, com o peso de cada x | x contínuo sem faixas | usar vão grande e perder a leitura de proporção |
| 7 | Spinograma | a mesma pergunta com x contínuo em faixas | faixas escolhidas para contar uma história | trocar limites de faixa sem declarar |
| 8 | Double decker | desfecho ao longo de duas ou três variáveis explicativas | mais de três variáveis | rótulos de eixo empilhados ilegíveis |

---

## 1. Marimekko 100%

**Descrição.** Colunas lado a lado cuja largura é a participação do grupo no total, divididas em partes cuja
altura é a participação dentro do grupo. O artigo do Nightingale sobre marimekko em JavaScript descreve o mesmo
cálculo (largura pela soma da coluna, altura pelo percentual dentro dela) e acrescenta a troca de dimensão por
pivô. O Nivo implementa com `value` para a espessura, `dimensions` para as partes e `offset` `expand` para 100%.

**Anatomia.** Eixo X de 0 a 100% da largura, com nome, total e participação de cada coluna; eixo Y de 0 a 100%;
ladrilhos com vão; rótulo interno só nos grandes; legenda das partes na mesma ordem vertical.

**Abordagem na stack.** `svg-puro` com o `marimekko()` acima; cada `Tile` vira `rect` com `fill` por parte, e o
hover mostra valor absoluto, participação no grupo e participação no total. Ordenação de grupos e partes em
TypeScript antes do layout.

**Ponto delicado.** Só a parte da base tem linha comum; a mais importante vai para baixo. A coluna fina precisa
do marcador externo (decisão 5). O total de cada coluna fica fora do ladrilho, no eixo, para não competir com os
rótulos internos. Mudar o filtro muda as larguras: animar a transição ou manter a ordem de grupos fixa durante a
sessão, para o leitor não perder onde estava cada coluna.

**Versões sugeridas.**
- **V1 básica: leads por origem e cobertura de dado.** Largura pelo volume de cada origem, altura dividida em
  completo, parcial e ausente.
- **V2 com destaque: onde falta dado.** "Ausente" em hachura com `--warning` e o resto em neutros; anotação "mídia
  paga: a coluna mais larga e a maior fatia sem dado".
- **V3 densa do Farol: participação de mercado com perímetro.** Largura pelo tamanho de cada um de quatro segmentos
  no perímetro declarado; altura dividida em "nós", "concorrente A", "concorrente B" e "demais"; um seletor troca a
  dimensão das colunas de segmento para região, como o pivô do artigo do Nightingale.
- **V4 caso limite: segmento de 0,5% e participação sem medição.** A coluna de 3 px ganha marcador externo com
  rótulo e a opção "agregar em outros segmentos"; a célula sem medição vira hachura "sem medição", fora da soma.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html): observar os dois eixos percentuais e o alerta sobre a falta de linha de base.
- Catálogo: [Nivo, marimekko](https://nivo.rocks/marimekko/): observar `value`, `dimensions`, os `offset` `expand`, `diverging` e `silhouette` e o layout horizontal.
- Praticante: [Nightingale, How to Create a Pivot Marimekko Chart in Plain JavaScript](https://nightingaledvs.com/how-to-create-a-pivot-marimekko-chart-in-plain-javascript/): observar totais acima das colunas, percentual na base, pivô de dimensão e o limite de comparação detalhada.
- Portal de design: [Behance, Jonny Czar Portfolio 2024](https://www.behance.net/gallery/159150041/Jonny-Czar-Portfolio-2024): portfólio com tags de mosaico, ladrilho e gráfico; a página traz só miniaturas e tags, sem descrição da peça.
- Portal de design: [Dribbble, 45 Marimekko Chart](https://dribbble.com/shots/4543911-45-Marimekko-Chart) (não abriu): marimekko de uma série numerada de estudos, segundo a varredura de portais do projeto.

**Mora melhor em outra família?** Sem necessidade da largura, barra 100% empilhada (02 ou 03).

---

## 2. Bar mekko (variwide)

**Descrição.** Colunas de largura variável e altura em valor absoluto de uma métrica, sem normalizar para 100%.
A área é o produto das duas medidas e só faz sentido quando esse produto é uma grandeza real. O Highcharts chama
de variwide; o Nivo descreve o marimekko como barra que "usa uma dimensão extra para a espessura".

**Anatomia.** Colunas encostadas; largura pela métrica A com eixo X acumulado; altura pela métrica B com eixo Y
real começando em zero; rótulo com as duas métricas e a área; linha de referência opcional.

**Abordagem na stack.** `svg-puro`: `x` acumulado pela métrica A, `height = yScale(b)`, ticks do eixo Y gerados em
TypeScript com passo "bonito" (1, 2, 2,5 ou 5 vezes potência de 10).

**Ponto delicado.** Validar o significado da área antes de escolher o modelo. Eixo Y a partir de zero, porque a
altura é comprimento. Ordenar pela altura (a pergunta costuma ser a taxa), com a largura como peso. Coluna de
largura zero some: marcar na base.

**Versões sugeridas.**
- **V1 básica: CPL por plataforma.** Altura pelo CPL, largura pelos leads; a área de cada coluna é o investimento.
- **V2 com anotação: CPL alvo.** Linha de referência horizontal no CPL alvo; a parte de cada coluna acima da linha
  sombreada lê como "investimento pago acima do alvo".
- **V3 densa do Farol: ticket médio por origem.** Altura pelo ticket médio das vitórias, largura pelo número de
  vitórias; a área é a receita, e a coluna alta e estreita de uma origem mostra ticket alto com poucas vitórias.
- **V4 caso limite: investimento sem lead.** Plataforma com R$ 8 mil e zero leads tem CPL indefinido; vira marcador
  na base com "R$ 8 mil sem lead", nunca coluna de altura infinita.

**Referências.**
- Catálogo: [Highcharts, variwide](https://www.highcharts.com/demo/highcharts/variwide): a página abriu só com título e categoria (colunas e barras).
- Catálogo: [Nivo, marimekko](https://nivo.rocks/marimekko/): observar a espessura vinda de outra dimensão.
- Praticante: [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html): observar a relação com a barra empilhada e o uso para visão geral.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Duas métricas sem produto significativo: dispersão (09).

---

## 3. Marimekko divergente

**Descrição.** Largura variável por grupo e partes que divergem de uma linha central: acima as favoráveis,
abaixo as desfavoráveis. Corresponde ao `offset` `diverging` do Nivo, que tem exemplos divergentes na
documentação.

**Anatomia.** Linha zero horizontal; partes positivas empilhadas para cima e negativas para baixo; largura pelo
volume; escala vertical em percentual simétrica.

**Abordagem na stack.** `svg-puro`, variação do layout base com dois acumuladores (um acima e um abaixo do zero) e
domínio vertical simétrico calculado pelo maior lado.

**Ponto delicado.** Mesma escala para cima e para baixo. Categoria neutra precisa de regra: dividir ao meio sobre a
linha ou deixar fora com nota. O eixo é de proporção por lado, não de sinal de valor.

**Versões sugeridas.**
- **V1 básica:** por origem (largura pelos leads), qualificados e em análise acima, desqualificados abaixo.
- **V2 com destaque:** o motivo "sem perfil" em cor cheia abaixo da linha, os outros motivos em neutro.
- **V3 densa do Farol: handoff da pré-vendas para vendas.** Largura pelas oportunidades passadas por fila; acima as
  aceitas pelo executivo; abaixo as devolvidas por motivo (fora de perfil, sem contato, duplicada).
- **V4 caso limite:** fila com 100% aceitas (nada abaixo) e fila com n = 3, coluna fina com selo "n = 3".

**Referências.**
- Catálogo: [Nivo, marimekko](https://nivo.rocks/marimekko/): observar o `offset` `diverging` e os exemplos divergentes.
- Praticante: [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html): observar o limite de segmentos, que aqui dobra por haver dois lados.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Sem a largura: barra divergente (02).

---

## 4. Mosaico de duas variáveis

**Descrição.** Tabela de contingência desenhada como área: a primeira variável divide a largura e a segunda
divide cada coluna; a área do ladrilho é proporcional à contagem (Wikipedia). A Vega-Lite constrói o "Mosaic
Chart with Labels" com `aggregate`, um `stack` para a posição horizontal normalizada, `window` para rank e um
segundo `stack` para a vertical, e ainda desloca rótulos para não sobreporem.

**Anatomia.** Colunas pela variável 1 com vão maior; ladrilhos pela variável 2 com vão menor; nomes das duas
variáveis nos eixos; célula de contagem zero marcada como linha fina.

**Abordagem na stack.** `svg-puro` com o layout base, `gap` maior entre grupos que entre partes, e um botão
"inverter variáveis" que troca `groups` e `parts`.

**Ponto delicado.** A ordem das variáveis muda a pergunta: variável 1 na largura responde P(variável 2 dado
variável 1). O subtítulo diz qual dividiu primeiro. Contagem zero observada é informação: linha de 1 px com
marca, nunca ausência silenciosa.

**Versões sugeridas.**
- **V1 básica:** origem por desfecho (ganho, perdido, aberto), contagens do ano.
- **V2 com interação:** botão inverter mostra desfecho por origem, e o subtítulo muda junto.
- **V3 densa do Farol:** etapa da perda por motivo, 5 por 6 ladrilhos, rótulo só nos grandes.
- **V4 caso limite:** duas combinações com zero (linhas marcadas) e uma variável com 12 categorias agregada em 5 mais "outras".

**Referências.**
- Catálogo: [Vega-Lite, Mosaic Chart with Labels](https://vega.github.io/vega-lite/examples/rect_mosaic_labelled_with_offset.html): observar a sequência de transformações e o deslocamento de rótulos.
- Praticante: [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): observar a divisão recursiva e o histórico.
- Catálogo: [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html): observar que o catálogo trata marimekko e mosaico como o mesmo gráfico.
- Portal de design: nenhuma referência de gráfico encontrada; a busca por "mosaic plot" no Behance só trouxe identidade visual e padronagem.

**Mora melhor em outra família?** Contagem cruzada com leitura de número: tabela cruzada (14) ou mapa de calor (15).

---

## 5. Mosaico com resíduos

**Descrição.** O mesmo mosaico, com a cor do ladrilho pelo resíduo padronizado em relação à independência entre as
variáveis (Friendly, citado na Wikipedia). Mostra onde a combinação acontece mais ou menos do que o esperado.

**Anatomia.** Escala divergente com faixa neutra perto de zero; limiares de legenda em mais ou menos 2 e mais ou
menos 4; ladrilhos com esperado pequeno sem cor.

**Abordagem na stack.** `svg-puro`, com resíduo calculado em TypeScript:

```ts
export function pearsonResidual(obs: number, rowTotal: number, colTotal: number, grand: number): number | null {
  const expected = (rowTotal * colTotal) / grand;
  return expected < 5 ? null : (obs - expected) / Math.sqrt(expected);
}
```

**Ponto delicado.** Resíduo não é bom nem ruim: cor em dois matizes neutros, sem `--positive` e `--negative`. O kit
não tem tokens divergentes (decisão 8). Esperado abaixo de 5 deixa o resíduo instável: sem cor e com hachura.

**Versões sugeridas.**
- **V1 básica:** origem por desfecho com resíduos.
- **V2 com anotação:** "indicação e ganho: 3,1 desvios acima do esperado" escrito no ladrilho.
- **V3 densa do Farol:** faixa de porte por motivo de perda, mostrando que "preço" se concentra no porte pequeno.
- **V4 caso limite:** combinações com esperado abaixo de 5 em hachura "amostra insuficiente".

**Referências.**
- Praticante: [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): observar o sombreamento pelo resíduo padronizado.
- Praticante: [R, spineplot (documentação)](https://stat.ethz.ch/R-manual/R-devel/library/graphics/html/spineplot.html): observar as referências a Friendly (1994) e Hartigan e Kleiner.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Sem a área: mapa de calor de resíduos (15).

---

## 6. Spineplot

**Descrição.** Caso especial do mosaico e generalização da barra empilhada ou destacada (documentação do R):
barras encostadas de largura proporcional à frequência de x e altura dividida pela proporção de y dentro de cada x.
Responde "a taxa de y muda com x, e quanto pesa cada x".

**Anatomia.** Colunas encostadas; eixo Y de 0 a 100% com as categorias de y à direita; eixo X com as categorias de
x; linha de referência da taxa global.

**Abordagem na stack.** `svg-puro` com o layout base e duas partes (desfecho sim ou não); a parte de interesse na
base.

**Ponto delicado.** Y binário é o caso mais legível. Vão grande entre colunas atrapalha a leitura da proporção;
usar 1 px. Categoria "desconhecida" de x fica fora da ordem natural, à direita.

**Versões sugeridas.**
- **V1 básica:** faixa de porte por ganho.
- **V2 com anotação:** linha da taxa global de ganho atravessando as colunas.
- **V3 densa do Farol:** fila de origem da pré-vendas por agenda realizada, largura pelas entradas de cada fila.
- **V4 caso limite:** "porte desconhecido" com 30% das entradas vira coluna larga hachurada à direita.

**Referências.**
- Praticante: [R, spineplot (documentação)](https://stat.ethz.ch/R-manual/R-devel/library/graphics/html/spineplot.html): observar a definição por P(y dado x) contra P(x).
- Praticante: [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): observar o spineplot como variação.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Sem a largura: barra 100% (02).

**Nota de nomenclatura.** "Spine chart" também circula como nome de barra de faixa com valor contra referência
(painéis de indicadores). Esse uso não foi confirmado em fonte aberta nesta pesquisa e, se entrar no catálogo,
mora em 14 ou 17.

---

## 7. Spinograma

**Descrição.** O spineplot com x contínuo cortado em faixas; a documentação do R passa os limites (`breaks`) para o
histograma e usa a frequência de cada faixa como largura.

**Anatomia.** Faixas contíguas com limites numéricos no eixo X; altura com a proporção do desfecho.

**Abordagem na stack.** `svg-puro`; faixas calculadas em TypeScript com limites de negócio declarados.

**Ponto delicado.** Os limites mudam a história; usar limites que o negócio já usa e escrever os limites no eixo.

**Versões sugeridas.**
- **V1 básica:** horas até o primeiro contato (até 1, 1 a 4, 4 a 24, mais de 24) por lead qualificado.
- **V2 com anotação:** a faixa do SLA de primeiro contato marcada.
- **V3 densa do Farol:** dias da oportunidade sem movimento (0 a 7, 8 a 15, 16 a 30, mais de 30) por ganho, usando o corte de 30 dias que o painel já chama de parada.

**Referências.**
- Praticante: [R, spineplot (documentação)](https://stat.ethz.ch/R-manual/R-devel/library/graphics/html/spineplot.html): observar spinograma e `breaks`.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Distribuição de x sem desfecho: histograma (16).

---

## 8. Double decker

**Descrição.** Mosaico de duas ou três variáveis explicativas que dividem só a largura, com a variável resposta na
altura de cada coluna; listado como variação na Wikipedia.

**Anatomia.** Colunas aninhadas pela variável 1 e pela variável 2; altura com a proporção do desfecho; rótulos do
eixo X em duas linhas.

**Abordagem na stack.** `svg-puro`, layout recursivo na largura seguido de uma divisão de altura por coluna.

**Ponto delicado.** Rótulos em várias linhas ficam ilegíveis rápido; acima de três variáveis as colunas ficam finas
demais para ler.

**Versões sugeridas.**
- **V1 básica:** origem e faixa de porte na largura, percentual de ganho na altura.
- **V2 com destaque:** colunas acima da taxa global em cor cheia.
- **V3 densa do Farol:** plataforma e formato do criativo na largura, percentual de lead qualificado na altura.

**Referências.**
- Praticante: [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): observar a variante double decker.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Muitas combinações: tabela cruzada (14) ou small multiples de barras (02).

---

## Modelos vistos nas fontes que moram em outra família

- **Barra 100% empilhada e barra proporcional empilhada do FT:** 02 e 03.
- **Treemap, inclusive a divisão alternada em fatias:** 12.
- **Parallel sets:** 11.
- **Waffle e área quadrada:** 22.
- **Tabela cruzada com totais marginais:** 14.

## Fontes consultadas

- Data Visualisation Catalogue, marimekko chart: https://datavizcatalogue.com/methods/marimekko_chart.html
- Data Visualisation Catalogue, índice: https://datavizcatalogue.com/
- FT Visual Vocabulary (pasta): https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- FT Visual Vocabulary (README, barra proporcional empilhada): https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md
- Wikipedia, mosaic plot: https://en.wikipedia.org/wiki/Mosaic_plot
- R, spineplot: https://stat.ethz.ch/R-manual/R-devel/library/graphics/html/spineplot.html
- Vega-Lite, galeria: https://vega.github.io/vega-lite/examples/
- Vega-Lite, Mosaic Chart with Labels: https://vega.github.io/vega-lite/examples/rect_mosaic_labelled_with_offset.html
- Nivo, marimekko: https://nivo.rocks/marimekko/
- Highcharts, variwide: https://www.highcharts.com/demo/highcharts/variwide
- AG Charts, galeria (sem marimekko nem mosaico): https://www.ag-grid.com/charts/gallery/
- RAWGraphs, tutoriais (sem marimekko nem mosaico): https://www.rawgraphs.io/learning
- Nightingale, How to Create a Pivot Marimekko Chart in Plain JavaScript: https://nightingaledvs.com/how-to-create-a-pivot-marimekko-chart-in-plain-javascript/
- Nightingale, busca por marimekko: https://nightingaledvs.com/?s=marimekko
- Behance, Jonny Czar Portfolio 2024: https://www.behance.net/gallery/159150041/Jonny-Czar-Portfolio-2024
- Dribbble, 45 Marimekko Chart (não abriu): https://dribbble.com/shots/4543911-45-Marimekko-Chart

Buscas no Behance por "marimekko chart", "mekko chart" e "mosaic plot" não trouxeram projeto de gráfico dedicado;
o notebook de marimekko do Observable devolveu HTTP 429 e ficou fora das referências.
