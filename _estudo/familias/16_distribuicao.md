# Família 16: distribuição

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa ou empresa real.

## O que a família responde

Distribuição é a família que responde "como os valores se espalham", e não "quanto deu no total". Ela troca a
pergunta de soma por pergunta de forma: onde está o grosso dos casos, quanto varia, existe mais de um pico,
quem são os extremos, a média é representativa. O Data Visualisation Catalogue coloca histograma e densidade
sob análise de distribuição e reconhecimento de padrão; o FT Visual Vocabulary abre uma categoria
*Distribution* com histograma, dot plot, dot strip, barcode, boxplot, violino e pirâmide populacional.

O ganho é justamente o que os cards da família 01 escondem. Um card diz "ciclo médio de 74 dias"; o histograma
mostra que existem dois grupos, um que fecha em três semanas e outro que arrasta seis meses, e que quase
ninguém fecha em 74 dias. É o mesmo argumento do Datasaurus e do quarteto de Anscombe, aplicado a uma medida só.

Perguntas típicas no Farol:

- **Comercial:** qual a forma do ciclo de vendas, não só a média? O ticket tem cauda longa? A distribuição de
  ganhos por executivo é parecida ou um executivo vive de um negócio grande? Quantos dias uma oportunidade
  costuma ficar parada antes de morrer?
- **Pré-vendas:** quanto tempo leva o primeiro contato, do lead entrar até alguém falar com ele? A fila por SDR
  é equilibrada? O SLA estoura em quantos casos e por quanto? Quantas tentativas até a agenda?
- **Marketing:** como o CPL se espalha entre campanhas da mesma plataforma? A mediana do CPL qualificado por
  origem, com a dispersão junto? Quantos criativos vivem na cauda cara?
- **Diretoria:** a carga por pessoa cabe no teto? O custo por unidade entregue varia quanto entre áreas? O
  cenário tem faixa, e qual o formato dessa faixa?

Fronteiras com outras famílias, para não duplicar catálogo:

- Comparar **um resumo por categoria** sem mostrar a forma (mediana, intervalo, meta contra realizado em pontos)
  é **17_comparacao-de-pontos**; distribuição só entra quando a forma importa.
- Contagem por **categoria nominal** é **02_barras-horizontais** ou **03_colunas-verticais**. Histograma parece
  barra mas o eixo é contínuo e binado; a diferença é substantiva, não estética.
- Distribuição de **duas variáveis ao mesmo tempo** (hexbin, contorno de densidade 2D) é **09_dispersao-e-bolhas**.
- Distribuição **no tempo por célula** (dia contra hora) é **15_mapa-de-calor-e-calendario**.
- Distribuição **de uma parte no todo** empilhada a 100% é **02** ou **26_mosaico-marimekko**.
- Microhistograma dentro de célula de tabela é **24_microvisuais-sparklines** com a geometria daqui.
- Faixa de percentis desenhada ao longo do tempo (fan chart) é **05_areas** com a estatística daqui.

## O que a pesquisa diz, antes de desenhar

1. **A largura do bin muda a conclusão.** From Data to Viz é direto: "tente vários tamanhos de bin, isso pode
   levar a conclusões muito diferentes". O Observable Plot documenta as regras clássicas em `thresholds`:
   *auto* (Scott, limitada a 200 bins), *scott*, *freedman-diaconis*, *sturges*, um número como dica, ou um
   array explícito. No Farol o bin nunca é acidente de renderização: ele é escolhido, declarado e fixo.
2. **Box plot esconde a forma.** From Data to Viz mantém uma página de ressalva só sobre isso: o box reduz a
   distribuição a cinco números e apaga multimodalidade, aglomerado e buraco; a recomendação é somar jitter ou
   violino e **sempre mostrar o número de observações**. Claus Wilke reforça que o box plot "não detecta padrão
   bimodal" e lembra que ele foi inventado para ser desenhado à mão.
3. **Violino exige amostra.** Wilke: "verifique que você tem pontos suficientes em cada grupo para justificar
   mostrar as densidades como linhas suaves". O react-graph-gallery põe um piso prático em torno de 100 pontos e
   avisa que "o violino sofre o mesmo defeito do histograma: a forma depende muito do número de buckets".
4. **Densidade pode inventar dado.** Wilke diz que a estimativa de densidade "pode sugerir que existe dado onde
   não existe": a curva vaza além do mínimo e do máximo observados e, em medida que não pode ser negativa
   (dias, reais, contagem), a cauda atravessa o zero. Recortar no domínio observado é obrigação.
5. **Ridgeline escala, histograma empilhado não.** Wilke recomenda ridgeline para muitas distribuições, chegando
   perto de uma centena, e desaconselha ridgeline feito de histogramas, porque "as barras de histogramas
   diferentes se alinham de formas confusas". Densidades sobrepostas ou empilhadas ele trata como má ideia pelo
   mesmo motivo do histograma empilhado.
6. **Jitter e dodge não são a mesma coisa.** Jitter é ruído aleatório, muda a cada render se a semente não for
   fixa e deforma levemente a leitura; dodge (beeswarm) é determinístico e, nas palavras da documentação do
   Observable Plot, "preserva exatamente a dimensão de posição de entrada, resultando em visualização mais
   precisa". O algoritmo é guloso e depende da ordem de entrada, com `padding` de 1px por padrão somado ao raio.
7. **Mostrar o ponto individual só até certo volume.** Wilke coloca strip chart como solução para conjunto
   esparso demais para violino. O raincloud (meio violino + box + pontos) é descrito como melhor para conjuntos
   menores, "onde não há observações demais para sobrecarregar o leitor com pontos".
8. **Distribuição acumulada não tem parâmetro.** A ECDF não depende de bin nem de banda: é o dado exato em forma
   de escada. O Observable Plot expõe isso como `cumulative` no bin transform, com −1 invertendo para "ou mais".
   Para responder "quantos casos ficam abaixo do SLA", ela é mais honesta que o histograma.
9. **Compare poucas distribuições sobrepostas.** From Data to Viz limita histograma sobreposto a três ou quatro
   grupos antes de virar borrão; acima disso, facetas ou ridgeline.
10. **A frequência do eixo tem que ser nomeada.** Datawrapper: no histograma, "quanto mais alta a barra, mais
    valores caem naquele bin". Parece óbvio e é a legenda que mais falta em dashboard de produto, onde o leitor
    tende a ler altura de barra como dinheiro.

## Regras do Farol para esta família

1. **`n` sempre visível.** Toda peça de distribuição mostra quantas observações entraram, no subtítulo ou no
   eixo da categoria ("SDR C · n 48"). Sem `n` o leitor não sabe se a forma é sinal ou sorte.
2. **Bin declarado, não automático.** A largura do bin vem do registry da métrica (`binLargura: 7` dias,
   `binLargura: 250` reais) e aparece no rótulo do eixo ("ciclo, faixas de 7 dias"). Filtro que muda a amostra
   não pode mudar a régua; senão o usuário compara duas formas que nunca foram comparáveis.
3. **Grupo pequeno não ganha curva suave.** Abaixo de 30 observações o violino e a densidade viram strip ou
   beeswarm automaticamente, com nota "n 12: pontos individuais". Abaixo de 5, só o valor em texto.
4. **Curva recortada no observado.** Toda densidade é cortada em `[min, max]` da amostra e, se a métrica for
   declarada não negativa, em zero. Nada de cauda de KDE sugerindo ciclo de menos um dia.
5. **Box plot nunca sozinho em cartão de decisão.** Ou vem com os pontos por cima (raincloud, sina, box+jitter),
   ou vem acompanhado do histograma da mesma métrica no cartão irmão.
6. **Outlier tem nome.** Ponto além das cercas é clicável e o tooltip diz qual oportunidade, campanha ou lead é.
   Distribuição sem drill vira curiosidade; com drill vira fila de trabalho.
7. **Jitter com semente fixa.** Nunca `Math.random()` direto: ruído determinístico derivado do id do registro,
   para o gráfico não tremer entre renders nem entre o servidor e o cliente.
8. **Escala log só quando a cauda manda,** e com aviso no eixo. Valor zero e negativo saem do log e viram nota
   de rodapé, nunca sumiço silencioso.
9. **Limiar operacional desenhado.** SLA, teto de capacidade e meta de CPL entram como `ReferenceLine` ou
   `ReferenceArea` com rótulo, e o texto diz o percentual do lado errado ("31% acima do SLA de 30 min").
10. **Dado ausente fora do gráfico e dentro do rodapé.** Registro sem a medida não vira zero nem bin zero;
    sai da amostra e é contado ("214 leads sem horário de primeiro contato ficaram fora").
11. **Cor com um papel só.** Ou grupo, ou destaque de faixa, nunca os dois. A escala sequencial de densidade só
    entra quando a peça é mapa de calor, e aí ela mora na família 15.

## Base de implementação no Recharts 3.10

Recharts não tem histograma, box plot, violino nem beeswarm como componentes. O que ele tem é o suficiente para
montar todos eles, desde que a estatística seja calculada em TypeScript antes de virar `data`. O padrão da
família é: **função pura de agregação → array já pronto → componente Recharts genérico.**

- **`BarChart` + `Bar`** com `XAxis type="number"` e a categoria do bin já formatada: histograma. Usar
  `barCategoryGap={0}` ou `barGap={0}` para as barras encostarem, que é o que separa histograma de barra.
- **`Bar` com `dataKey` devolvendo par `[baixo, alto]`**: barra flutuante. É a base do box, da caixa do IQR e
  da faixa interquartil; o exemplo oficial de Box Plot usa exatamente `entry => [entry.q1, entry.q3]`.
- **`ErrorBar`** filho de `Bar` ou `Scatter`, com `direction` `x` ou `y`: whiskers. Atenção, o `dataKey` do
  `ErrorBar` é **distância a partir do ponto**, não limite absoluto; o exemplo oficial escreve
  `entry => [entry.q3 - entry.min, entry.max - entry.q3]`.
- **`shape` customizado no `Bar`**: recebe `x`, `y`, `width`, `height` e o `payload`, e devolve SVG próprio. É
  assim que a mediana vira uma linha dentro da caixa, com a posição calculada como
  `((q3 - mediana) / (q3 - q1)) * height`.
- **`Scatter`** com eixo categórico de um lado: strip, jitter, beeswarm, raincloud e os outliers do box.
- **`Area` com `dataKey` devolvendo par**: violino e faixa de percentis; a curva de densidade vira uma série de
  pares `[-d, +d]` em torno da linha de base da categoria.
- **`ComposedChart`**: obrigatório quando a peça mistura barra, área, linha e ponto no mesmo plano (box + jitter,
  histograma + densidade, ridgeline com linha de mediana).
- **`ReferenceLine`**, **`ReferenceArea`**: SLA, meta, média, mediana e faixa aceitável.
- **Componente próprio como filho direto** do gráfico (Recharts 3 aceita sem `Customized`), com os hooks de
  layout do guia de customização (`usePlotArea`, `useChartWidth`, `useChartHeight`, `useMargin`), para desenhar
  geometria que nenhum componente cobre. Conferir a exportação exata na 3.10 antes de depender de um hook.
- **`svg-puro`** quando a geometria é livre demais para o modelo de série do Recharts: beeswarm com dodge real,
  ridgeline com muitas faixas sobrepostas, letter-value plot, stem and leaf.
- **`html-tailwind`** para as versões compactas: histograma de 20 barras em `div` com `flex` e altura
  percentual, strip de percentis em uma linha, distribuição dentro de célula de tabela.
- Tokens: barra padrão `var(--chart-1)`, destaque `var(--chart-2)`, neutro `var(--line-strong)`, grade
  `var(--line-subtle)`, texto `var(--text-muted)`, superfície `var(--surface-raised)`, alerta `var(--danger)`.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Histograma | ver a forma de uma medida contínua | poucas observações, ou eixo categórico | bin automático mudando junto com o filtro |
| 2 | Histograma com estatística anotada | contar "a média não é o típico" | leitor que só quer o número | média e mediana desenhadas sem dizer qual é qual |
| 3 | Histograma acumulado | responder "quantos ficam abaixo de X" | procurar o pico ou a moda | acumulada crescente quando a pergunta é "ou mais" |
| 4 | Polígono de frequência | sobrepor duas ou três formas sem borrão | uma série só, onde a barra é mais clara | linha suavizada inventando vale entre bins |
| 5 | Histograma com densidade sobreposta | mostrar barra observada e curva ajustada | público que lê a curva como dado | curva com área diferente da do histograma |
| 6 | Histogramas sobrepostos | comparar 2 a 3 grupos na mesma régua | 4 grupos ou mais | opacidade sem ordem fixa de desenho |
| 7 | Histograma espelhado (pirâmide) | comparar exatamente dois grupos por faixa | mais de dois grupos | faixas de largura desigual nos dois lados |
| 8 | Pequenos múltiplos de histograma | 4 a 20 grupos, cada um com sua forma | 2 grupos, onde sobrepor basta | eixo Y livre por painel |
| 9 | Faixa de densidade em cor | muitas distribuições empilhadas em pouco espaço | leitura de valor exato | escala de cor sem legenda e sem `n` |
| 10 | Densidade (KDE) | forma suave com amostra grande | menos de 30 observações | cauda vazando para valor impossível |
| 11 | Densidades sobrepostas | 2 a 4 grupos com forma parecida | grupos com `n` muito diferente | densidade normalizada escondendo que um grupo é minúsculo |
| 12 | Ridgeline | muitas distribuições, sobretudo ao longo do tempo | 2 ou 3 grupos | ridgeline feito de histogramas |
| 13 | Box plot | resumir muitos grupos em pouco espaço, público técnico | público que não lê quartil; distribuição bimodal | box sozinho, sem `n` e sem pontos |
| 14 | Box plot com entalhe e largura variável | comparar medianas e tamanhos de grupo juntos | poucos grupos ou público leigo | entalhe sem explicar que é intervalo da mediana |
| 15 | Letter-value plot | milhares de observações com cauda importante | `n` pequeno, público leigo | usar quando o box comum já bastava |
| 16 | Box plot com jitter | box plot honesto, com os pontos por cima | milhares de pontos por grupo | jitter sem semente, tremendo a cada render |
| 17 | Violino | forma completa por grupo, amostra grande | menos de 100 pontos por grupo | banda escolhida no automático, sem teste |
| 18 | Violino com marcadores internos | violino que também dá mediana e quartis | cartão pequeno | marcador interno mais forte que a forma |
| 19 | Meio violino e raincloud | forma, resumo e pontos no mesmo espaço | grupos com muitas observações | três camadas competindo em peso visual |
| 20 | Sina plot | ver todo ponto com a largura contando a densidade | `n` na casa dos milhares | leitor achar que X do ponto tem significado |
| 21 | Strip plot e jitter | poucas dezenas de pontos, leitura em segundos | centenas de pontos empilhados | pontos opacos escondendo a pilha |
| 22 | Beeswarm | mostrar todo ponto sem sobrepor e sem mentir na posição | milhares de pontos numa faixa estreita | raio grande demais empurrando a nuvem |
| 23 | Barcode plot (rug) | forma crua em altura de uma linha | valores muito repetidos | traço opaco virando bloco sólido |
| 24 | Dot plot empilhado de Wilkinson | amostra pequena onde contar unidade importa | acima de 150 pontos | ponto com raio maior que a largura do bin |
| 25 | Quantile dotplot | comunicar incerteza de previsão a público não técnico | análise fina de cauda | número de quantis mudando entre cartões |
| 26 | ECDF | responder "quanto por cento abaixo de X" sem escolher bin | achar moda ou multimodalidade óbvia | ler a escada como curva contínua |
| 27 | Q-Q plot | testar se a medida segue uma distribuição de referência | painel executivo | usar em público que nunca viu um |
| 28 | Curva de Lorenz | mostrar concentração: quanto do total vem de poucos | amostra pequena, poucas entidades | esquecer a diagonal de igualdade |
| 29 | Faixa de percentis | resumo de incerteza em uma linha, empilhável | quando a forma importa mais que os cortes | faixa da média vendida como faixa dos casos |
| 30 | Stem and leaf | 15 a 150 valores, quando o dígito exato importa | dashboard, tela pequena, público geral | usar como gráfico e não como tabela |
| 31 | Curva de sobrevivência (Kaplan-Meier) | tempo até um evento quando parte dos casos ainda não terminou | todos os casos já encerrados; aí a ECDF basta | descartar os abertos e chamar a curva de ciclo |
| 32 | Meia-olho e intervalo em gradiente | faixa de cenário com forma, ponto e intervalos numa linha | público que precisa ler o valor de cada caso | gradiente sem os intervalos nomeados |
| 33 | Bean plot | forma, traço por observação e média do grupo, em amostra média | milhares de casos por grupo | traços sem transparência virando barra sólida |
| 34 | Histograma empilhado por categoria | ver de que grupo é feito cada bin quando o total manda | comparar a forma de cada grupo | ler a camada de cima a partir do zero |
| 35 | Desfechos hipotéticos animados (HOP) | explicar incerteza de cenário em apresentação | relatório impresso, painel sem interação | animação rápida demais para contar frequência |
| 36 | Wheat plot (strip com jitter ordenado) | ver forma e valor exato de cada caso em amostra pequena | centenas de casos por grupo | espaçamento vertical menor que o diâmetro do ponto |

---

## 1. Histograma

**Descrição.** O eixo contínuo é cortado em faixas de largura igual e a altura da barra conta quantas
observações caíram em cada faixa. É o modelo de entrada da família e a régua contra a qual os outros são
julgados.

**Anatomia.** Eixo X contínuo com os limites dos bins e a unidade no rótulo ("ciclo em dias, faixas de 7");
eixo Y de contagem ou frequência, com o nome escrito ("oportunidades"); barras encostadas, sem espaço entre
elas; subtítulo com `n`; rodapé com os registros descartados por dado ausente.

**Abordagem na stack.** `recharts-custom`: `BarChart` com `XAxis type="number"`, `Bar` e
`barCategoryGap={0}`. A agregação é feita antes, em TypeScript puro, e o array entregue já tem `binInicio`,
`binFim`, `contagem` e `rotulo`.

```tsx
export function binar(valores: number[], largura: number, minimo = 0) {
  const mapa = new Map<number, number>()
  for (const v of valores) {
    const i = Math.floor((v - minimo) / largura)
    mapa.set(i, (mapa.get(i) ?? 0) + 1)
  }
  const maiorIndice = Math.max(...mapa.keys())
  return Array.from({ length: maiorIndice + 1 }, (_, i) => ({
    binInicio: minimo + i * largura,
    binFim: minimo + (i + 1) * largura,
    contagem: mapa.get(i) ?? 0,
  }))
}
```

```tsx
<BarChart data={bins} barCategoryGap={0} margin={{ top: 12, right: 16, bottom: 24, left: 8 }}>
  <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
  <XAxis dataKey="binInicio" type="number" domain={[0, 210]} tickFormatter={(v) => `${v}`} />
  <YAxis allowDecimals={false} />
  <Tooltip content={<TooltipBin />} cursor={{ fill: 'var(--surface-raised)' }} />
  <Bar dataKey="contagem" fill="var(--chart-1)" isAnimationActive={false} />
</BarChart>
```

**Ponto delicado.** Bin vazio no meio da faixa precisa existir no array com `contagem: 0`; se ele sumir, o
Recharts encosta os vizinhos e o buraco desaparece da leitura, que é justamente o achado. O eixo X tem que ser
`type="number"` e não categórico, senão a escala fica desigual quando há bin faltando. E o tooltip padrão diz
"binInicio 42": trocar por "42 a 49 dias · 18 oportunidades".

**Versões sugeridas.**
- **V1 básica: ciclo de fechamento.** 312 oportunidades ganhas nos últimos 12 meses, ciclo em dias, bin de 7,
  domínio de 0 a 210; barra única em `--chart-1`.
- **V2 com anotação: o SLA de primeiro contato.** Minutos até o primeiro contato, bin de 5; `ReferenceLine`
  vertical em 30 minutos com rótulo "SLA" e as barras à direita em `--danger`; subtítulo "31% acima do SLA".
- **V3 densa do Farol: CPL por campanha.** 187 campanhas do trimestre, CPL em reais, bin de 25; cauda longa
  cortada em R$ 600 com o último bin rotulado "600+" e contado como "6 campanhas acima".
- **V4 caso limite: muitos zeros.** Receita reconhecida por oportunidade em que 41% valem zero; o bin do zero
  ganha hachura e nota "41% sem receita lançada", para o pico do zero não passar por forma da distribuição.

**Referências.**
- Catálogo: [Observable Plot, bin transform](https://observablehq.com/plot/transforms/bin): observar `thresholds` com scott, freedman-diaconis e sturges, e o `cumulative: -1` para "ou mais".
- Catálogo: [Highcharts, histogram demo](https://www.highcharts.com/demo/ios/histogram): observar o histograma calculado a partir da série de origem, com o dado cru mostrado embaixo como dispersão.
- Praticante: [Datawrapper Academy, how to read a histogram](https://www.datawrapper.de/academy/histogram-min-max-median-mean): observar a regra do limite do bin (80,5 cai em 80 a 90; 90 cai em 90 a 100) e o exemplo em que média 293 e mediana 50 divergem.
- Portal de design: [SetProduct, distribution chart patterns](https://setproduct.com/charts/patterns/distribution): observar o tratamento de histograma em tema claro e escuro com legenda, eixo e anotação de ponto.

---

## 2. Histograma com estatística anotada

**Descrição.** O mesmo histograma, com média, mediana e um ou dois percentis desenhados por cima como linhas
verticais rotuladas. É o modelo que transforma o gráfico em argumento: ele existe para mostrar que a média
citada no card não é o caso típico.

**Anatomia.** Barras do histograma; `ReferenceLine` vertical para média (tracejada) e para mediana (sólida),
cada uma com rótulo curto contendo o valor; opcionalmente faixa p25 a p75 como `ReferenceArea` de fundo; nota
de leitura em uma linha embaixo do gráfico.

**Abordagem na stack.** `recharts-custom`: o histograma do modelo 1 mais `ReferenceLine` com `x` no valor da
estatística, `stroke` e `strokeDasharray` diferentes por papel, e `label` com `position="top"`.

```tsx
<ReferenceLine x={mediana} stroke="var(--chart-2)"
  label={{ value: `mediana ${mediana}d`, position: 'top', fill: 'var(--chart-2)', fontSize: 11 }} />
<ReferenceLine x={media} stroke="var(--text-muted)" strokeDasharray="4 3"
  label={{ value: `média ${media}d`, position: 'top', fill: 'var(--text-muted)', fontSize: 11 }} />
```

**Ponto delicado.** Média e mediana perto uma da outra empilham os rótulos e viram borrão. A correção é
calcular a distância em pixels antes de renderizar (`Math.abs(media - mediana) / amplitude * larguraPlot`) e,
abaixo de uns 48px, colapsar os dois rótulos num só bloco de texto ("média 74d · mediana 51d"), ancorado no
maior dos dois. O `ReferenceLine` também precisa de `ifOverflow="extendDomain"` quando a estatística cai fora
do domínio fixado, senão ela some sem aviso.

**Versões sugeridas.**
- **V1 básica: ciclo com média e mediana.** Histograma de ciclo com as duas linhas e a frase "metade fecha em
  até 51 dias; a média de 74 é puxada por 19 negócios longos".
- **V2 com destaque: faixa típica.** `ReferenceArea` de p25 a p75 em `--surface-raised` atrás das barras,
  rotulada "metade dos casos", com média e mediana por cima.
- **V3 densa do Farol: ticket de fechamento.** 208 negócios ganhos, ticket em reais, bin de R$ 5 mil, escala
  log opcional; média, mediana e p90 desenhados, com o p90 rotulado "10% acima de R$ 148 mil".
- **V4 caso limite: bimodal.** Tempo de resposta do lead com dois picos (minutos e dias); as linhas de média e
  mediana caem no vale, e a nota diz explicitamente "a média cai onde quase não há caso".

**Referências.**
- Catálogo: [Vega-Lite, histogram](https://vega.github.io/vega-lite/examples/histogram.html): observar o bin declarado no encoding e o eixo contínuo com limites do bin, base da anotação.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar o argumento de que a largura do bin muda o que a forma diz, e por isso a estatística anotada precisa vir junto.
- Portal de design: [Behance, Figma Charts Kit, dashboard templates design system](https://www.behance.net/gallery/67155393/Figma-Charts-Kit-Dashboard-templates-design-system): observar o tratamento de linha de referência e rótulo dentro da área do gráfico sem competir com a barra.

---

## 3. Histograma acumulado

**Descrição.** Cada barra soma a si mesma e a todas as anteriores, então a última barra vale 100%. Responde
"quantos casos ficam até aqui" sem exigir que o leitor some barras de cabeça. A variante "ou mais" inverte o
sentido e responde "quantos passam disso".

**Anatomia.** Eixo X igual ao do histograma; eixo Y em percentual acumulado de 0 a 100 com marcas em 25, 50,
75; barras ou degraus; uma linha guia horizontal no percentual de interesse cruzando com uma vertical no
limiar; rótulo no cruzamento.

**Abordagem na stack.** `recharts-custom`: mesmo `BarChart`, com o array já acumulado em TypeScript. O
Observable Plot expõe isso como `cumulative` no bin transform, com `+1` para "até aqui" e `-1` para "ou mais";
no Farol a escolha vira um parâmetro do agregador.

```tsx
export function acumular(bins: Bin[], sentido: 1 | -1 = 1) {
  const total = bins.reduce((s, b) => s + b.contagem, 0)
  const ordem = sentido === 1 ? bins : [...bins].reverse()
  let soma = 0
  const saida = ordem.map((b) => ({ ...b, pct: ((soma += b.contagem) / total) * 100 }))
  return sentido === 1 ? saida : saida.reverse()
}
```

**Ponto delicado.** Acumulada só é legível se o eixo X estiver ordenado e completo; bin faltando quebra a
monotonicidade visual e o degrau mente. E a versão "ou mais" precisa dizer isso no rótulo do eixo, porque a
curva descendente é lida por engano como queda de volume. Quando a pergunta é de SLA, a leitura correta é
sempre um par: o limiar no X e o percentual no Y, marcados juntos, não deixados para o leitor achar.

**Versões sugeridas.**
- **V1 básica: SLA de primeiro contato.** Minutos até o primeiro contato, acumulada crescente, com a linha
  guia em 30 minutos e o rótulo "69% dentro do SLA".
- **V2 com anotação: dois limiares.** Acumulada com marcas em 5, 30 e 120 minutos e três rótulos empilhados à
  direita ("41% em 5 min · 69% em 30 min · 88% em 2 h").
- **V3 densa do Farol: ciclo por segmento.** Duas acumuladas sobrepostas, negócio novo contra cliente da casa,
  mostrando que a curva do cliente da casa sobe muito antes; a distância horizontal entre as curvas na altura
  de 50% vira a frase "a mediana difere em 34 dias".
- **V4 caso limite: cauda infinita.** Oportunidades ainda abertas não têm ciclo; entram como censura à direita,
  fora da acumulada, com nota "87 abertas não entram; a curva vale só para as fechadas".

**Referências.**
- Catálogo: [Vega-Lite, layered histogram and cumulative histogram](https://vega.github.io/vega-lite/examples/layer_cumulative_histogram.html): observar o histograma e a acumulada no mesmo plano, com a acumulada como camada.
- Catálogo: [Observable Plot, bin transform](https://raw.githubusercontent.com/observablehq/plot/main/docs/transforms/bin.md): observar a opção `cumulative`, com `-1` produzindo a distribuição reversa "ou mais".
- Praticante: [FT, Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a entrada *cumulative curve* na coluna Distribution, descrita como forma de mostrar desigualdade por frequência acumulada.

---

## 4. Polígono de frequência

**Descrição.** As alturas dos bins viram pontos ligados por reta, no ponto médio de cada bin, e as barras
somem. É o histograma em forma de linha; serve para sobrepor duas ou três distribuições sem que uma tampe a
outra.

**Anatomia.** Mesmo eixo X binado; linha por grupo com marcador no ponto médio do bin; sem preenchimento ou com
preenchimento muito leve; legenda por grupo com o `n` de cada um.

**Abordagem na stack.** `recharts-nativo`: `LineChart` com `XAxis type="number"` sobre o array de bins já
agregado, um `Line` por grupo, `type="linear"` e `dot={false}` acima de uns 20 bins.

**Ponto delicado.** `type="monotone"` suaviza e inventa curva entre dois bins vizinhos, criando vales e picos
que não existem no dado; em distribuição isso é erro de leitura, não estética. A linha é `linear` por regra.
O outro cuidado é o ponto de ancoragem: o valor tem que ser plotado no centro do bin, não no início, senão a
forma desloca meio bin para a esquerda.

**Versões sugeridas.**
- **V1 básica: uma série.** Polígono do ciclo de fechamento sobre o histograma esmaecido, como ponte visual
  entre os dois modelos.
- **V2 comparativa: três canais.** CPL por campanha em busca, social e display, três linhas em `--chart-1`,
  `--chart-2`, `--chart-3`, com `n` na legenda e nota de que as três usam o mesmo bin de R$ 25.
- **V3 caso limite: grupos de tamanho muito diferente.** Um grupo com 240 campanhas e outro com 11; alternar
  para frequência relativa em percentual e avisar no eixo ("% das campanhas do canal"), porque em contagem
  absoluta o grupo pequeno vira uma linha rente ao zero.

**Referências.**
- Catálogo: [Vega-Lite, relative frequency histogram](https://vega.github.io/vega-lite/examples/histogram_rel_freq.html): observar a troca de contagem por frequência relativa, que é o que permite comparar grupos desiguais.
- Praticante: [From Data to Viz, violin](https://www.data-to-viz.com/graph/violin.html): observar o alerta de que diferença de tamanho de amostra entre grupos precisa ficar visível, válido também para linhas sobrepostas.
- Portal de design: [Behance, Charts. Infographics. Data design in Figma](https://www.behance.net/gallery/70284157/Charts-Infographics-Data-design-in-Figma): observar o peso de linha e o tratamento de legenda em séries múltiplas finas.

---

## 5. Histograma com densidade sobreposta

**Descrição.** Barras de contagem observada mais uma curva suave por cima, servindo de resumo da forma. Serve
quando o público quer ver o dado real e a leitura simplificada no mesmo lugar.

**Anatomia.** Barras em cor neutra e opacidade reduzida; curva em cor de destaque com traço de 2px; eixo Y
duplo conceitual resolvido por normalização, não por dois eixos desenhados; nota dizendo que a curva é
estimativa.

**Abordagem na stack.** `recharts-custom` com `ComposedChart`: `Bar` para os bins e `Line` (ou `Area` com
`fillOpacity` baixa) para a densidade, ambas no mesmo `YAxis`. A densidade é calculada em TypeScript com
kernel gaussiano sobre uma grade de uns 120 pontos.

```tsx
export function densidadeGauss(valores: number[], grade: number[], banda: number) {
  const n = valores.length
  return grade.map((x) => {
    const s = valores.reduce((acc, v) => {
      const u = (x - v) / banda
      return acc + Math.exp(-0.5 * u * u)
    }, 0)
    return { x, d: s / (n * banda * Math.sqrt(2 * Math.PI)) }
  })
}
```

**Ponto delicado.** A densidade integra 1 e o histograma conta unidades; se as duas escalas não forem
conciliadas, a curva vira um fio rente ao eixo ou estoura o topo. A conversão correta é multiplicar a
densidade por `n * larguraDoBin`, que põe a curva na mesma unidade de contagem das barras. Qualquer atalho
visual (esticar a curva até o topo) quebra a promessa de que a curva descreve as barras.

**Versões sugeridas.**
- **V1 básica: ciclo com curva.** Histograma de ciclo em `--line-strong` com 30% de opacidade e a curva em
  `--chart-1`, rodapé "curva: estimativa suavizada, banda 6 dias".
- **V2 com destaque: fora da curva.** Bins cuja contagem excede a curva em mais de 40% ganham borda de alerta;
  serve para mostrar aglomerado suspeito, como um monte de negócios fechando exatamente no último dia do mês.
- **V3 caso limite: métrica não negativa.** Tempo de resposta com muitos casos perto de zero; a curva é
  recortada em zero e a nota diz "curva cortada no zero; sem essa correção a estimativa sugeria tempo
  negativo", que é exatamente o alerta do Wilke.

**Referências.**
- Catálogo: [Vega-Lite, density plot](https://vega.github.io/vega-lite/examples/area_density.html): observar a transformação de densidade com bandwidth explícito e extent, o mesmo par de parâmetros a declarar no Farol.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar a frase de que a curva pode estender a cauda para regiões onde não há e não pode haver dado.
- Portal de design: [Behance, Advanced SaaS Analytics Dashboards & KPI UI/UX, P1](https://www.behance.net/gallery/129162191/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-P1): observar a combinação de barra neutra com linha de destaque em tema escuro.

---

## 6. Histogramas sobrepostos

**Descrição.** Duas ou três distribuições desenhadas na mesma régua, com transparência, para comparar
deslocamento e espalhamento. Acima de três grupos vira borrão e o modelo certo passa a ser faceta ou ridgeline.

**Anatomia.** Um conjunto de barras por grupo, na mesma posição de bin, com `fillOpacity` entre 0.45 e 0.6;
legenda com `n` por grupo; mistura de cor nas áreas de interseção assumida e explicada.

**Abordagem na stack.** `recharts-nativo`: `BarChart` com vários `Bar` no mesmo `dataKey` de bin, usando
`stackId` ausente e `barGap={-larguraBarra}` para forçar sobreposição real, ou `recharts-custom` com `shape`
próprio quando a mistura de cor precisa ser controlada.

**Ponto delicado.** Sobreposição com transparência depende da ordem de desenho, e a ordem no Recharts é a
ordem dos filhos. Grupo maior desenhado por último cobre o menor. A regra do Farol é ordenar por `n`
decrescente na renderização, para o grupo pequeno ficar sempre por cima, e fixar essa ordem mesmo quando o
filtro muda os tamanhos; senão a mesma peça muda de aparência entre dois filtros e ninguém entende por quê.

**Versões sugeridas.**
- **V1 básica: dois grupos.** Ciclo de negócio novo contra ciclo de cliente da casa, dois tons, 55% de
  opacidade.
- **V2 com anotação: a diferença medida.** Além das barras, duas linhas verticais de mediana e uma seta
  horizontal entre elas com o rótulo "34 dias de diferença na mediana".
- **V3 caso limite: escalas muito diferentes.** 640 leads de mídia paga contra 38 de indicação; trocar
  contagem por percentual dentro do grupo e escrever no eixo Y "% dos leads do canal", com o `n` bruto na
  legenda para não esconder que um grupo é minúsculo.

**Referências.**
- Catálogo: [Data Viz Catalogue, box and whisker plot](http://datavizcatalogue.com/methods/box_plot.html): observar a justificativa de que resumo ocupa menos espaço quando há muitos grupos, que é o limite de onde a sobreposição para de servir.
- Praticante: [From Data to Viz, ridgeline](https://www.data-to-viz.com/graph/ridgeline.html): observar a recomendação de trocar sobreposição por faixas deslocadas quando os grupos passam de meia dúzia.
- Portal de design: [Behance, Sales Analytics, B2B Dashboard UI/UX](https://www.behance.net/gallery/248974775/Sales-Analytics-B2B-Dashboard-UIUX): observar a paleta de duas séries em superfície escura e o contraste mantido na área de interseção.

---

## 7. Histograma espelhado (pirâmide)

**Descrição.** Dois histogramas do mesmo eixo de faixas desenhados costas com costas, um crescendo para a
esquerda e outro para a direita. O FT chama de *population pyramid* e descreve literalmente como "back to back
histograms". Fora de demografia, serve para qualquer comparação binária forte.

**Anatomia.** Eixo de faixas na vertical, ao centro ou à esquerda; dois conjuntos de barras horizontais em
sentidos opostos; eixo X simétrico com valores absolutos nos dois lados; rótulo de grupo no topo de cada lado;
`n` por lado.

**Abordagem na stack.** `recharts-custom`: `BarChart` com `layout="vertical"`, um `Bar` com valores negativos
e outro com positivos, `XAxis` com `tickFormatter={(v) => String(Math.abs(v))}` e `domain` simétrico fixado.

```tsx
const dominio = [-maximo, maximo] as const
<XAxis type="number" domain={dominio} tickFormatter={(v: number) => Math.abs(v).toString()} />
<YAxis type="category" dataKey="faixa" width={72} />
<Bar dataKey="ladoEsquerdoNegativo" fill="var(--chart-1)" />
<Bar dataKey="ladoDireito" fill="var(--chart-2)" />
```

**Ponto delicado.** O truque do valor negativo vaza para o tooltip e para o rótulo de dado, que passam a
mostrar "−38 leads". Todo formatador precisa aplicar `Math.abs`, inclusive o do `LabelList` e o do `Tooltip`.
O domínio simétrico precisa ser calculado sobre o máximo dos dois lados e fixado, senão cada lado ganha escala
própria e a comparação, que é o único motivo da peça existir, fica falsa.

**Versões sugeridas.**
- **V1 básica: ganhos contra perdas por faixa de ticket.** Faixas de R$ 25 mil no eixo vertical; perdidas à
  esquerda, ganhas à direita.
- **V2 com destaque: onde o funil vira.** A faixa em que o lado direito passa o esquerdo ganha fundo
  `--surface-raised` e o rótulo "acima de R$ 150 mil, ganha mais do que perde".
- **V3 densa do Farol: pré-vendas contra vendas.** Faixas de tempo parado em dias; à esquerda as oportunidades
  na pré-vendas, à direita as em vendas, mostrando que a fila velha está concentrada de um lado só.
- **V4 caso limite: lados muito desiguais.** 1.464 perdidas contra 66 ganhas; manter a escala simétrica em
  absoluto faz o lado das ganhas sumir, então a versão oferece um alternador "absoluto | % do lado" com a
  escolha escrita no eixo.

**Referências.**
- Catálogo: [FT, Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a entrada *population pyramid*, descrita como histogramas costas com costas, dentro da coluna Distribution.
- Catálogo: [Vega-Lite, histogram from binned data](https://vega.github.io/vega-lite/examples/bar_binned_data.html): observar o caso em que os bins já vêm calculados, que é como o Farol entrega os dois lados prontos.
- Portal de design: [Behance, Data screen, Regional business monitoring](https://www.behance.net/gallery/171554797/Data-screen-Regional-business-monitoring): observar a composição espelhada e o eixo central compartilhado em painel escuro.

---

## 8. Pequenos múltiplos de histograma

**Descrição.** Um histograma pequeno por grupo, todos na mesma grade, mesma escala e mesmo bin. É a resposta
correta quando há de quatro a vinte grupos e sobrepor viraria borrão.

**Anatomia.** Grade de painéis; título curto por painel com nome do grupo e `n`; eixo X desenhado só na
última linha; eixo Y só na primeira coluna; escala compartilhada; opcionalmente a distribuição geral em cinza
claro atrás de cada painel, como régua de comparação.

**Abordagem na stack.** `html-tailwind` para a grade (`grid grid-cols-4 gap-3`) com um `BarChart` do Recharts
dentro de cada célula, dentro de `ResponsiveContainer`. O cálculo de domínio é feito uma vez, fora, e passado
igual para todos.

**Ponto delicado.** Deixar o Recharts calcular o domínio por painel é o erro que mata o modelo: cada painel
fica com eixo próprio e a comparação vira ilusão. Domínio de X e de Y são calculados no componente pai e
passados como prop. O segundo cuidado é performance: vinte `ResponsiveContainer` com animação ligada travam o
painel; `isAnimationActive={false}` e memoização do array de bins por grupo são obrigatórios.

**Versões sugeridas.**
- **V1 básica: ciclo por executivo.** Oito painéis, bin de 7 dias, escala comum, `n` no título de cada um.
- **V2 com contexto: sombra do geral.** Cada painel traz, atrás, a distribuição da área inteira em
  `--line-subtle`, e a do executivo por cima em `--chart-1`.
- **V3 densa do Farol: CPL por plataforma e mês.** Grade de 4 plataformas por 6 meses, 24 painéis
  minúsculos, sem eixo, só forma; clicar abre o histograma grande da célula.
- **V4 caso limite: grupo quase vazio.** Executivo com 3 negócios fechados; o painel troca o histograma por
  três traços verticais e o texto "n 3", em vez de desenhar uma barra solitária que parece pico.

**Referências.**
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar como a galeria trata faceta e trellis, com escala resolvida de forma compartilhada por padrão.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar o argumento de testar várias larguras de bin, que em pequenos múltiplos precisa ser resolvido uma vez para todos os painéis.
- Portal de design: [Behance, Advanced SaaS Analytics Dashboards & KPI UI/UX, Set 01](https://www.behance.net/gallery/93727935/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-Set-01): observar a densidade de cartões pequenos numa grade e o tamanho mínimo de rótulo que ainda se lê.

---

## 9. Faixa de densidade em cor (heat strip de distribuição)

**Descrição.** A distribuição de cada grupo vira uma tira horizontal em que a cor, e não a altura, codifica a
densidade. Escura onde há muitos casos, clara onde há poucos. Empilha dezenas de grupos em um espaço em que
caberiam três violinos.

**Anatomia.** Uma tira por grupo, alinhadas na mesma escala horizontal; escala sequencial de cor com legenda;
rótulo do grupo à esquerda com `n`; eixo compartilhado embaixo; marcador de mediana como traço claro sobre a
tira, opcional.

**Abordagem na stack.** `svg-puro`: cada tira é uma sequência de `<rect>` de largura fixa, uma por célula da
grade de densidade, com `fill` vindo de uma função de interpolação de cor escrita em TypeScript. Alternativa
`recharts-custom` com `Bar` de altura constante e `Cell` por bin, mas o SVG puro sai mais barato porque não há
eixo Y de verdade.

**Ponto delicado.** É um mapa de calor disfarçado, então herda o problema do mapa de calor: escala de cor sem
legenda é indecifrável, e escala normalizada por linha esconde que um grupo tem 400 casos e outro tem 9. A
regra é declarar no rodapé se a cor é densidade dentro do grupo (padrão, permite comparar forma) ou contagem
absoluta (permite comparar volume), nunca deixar implícito. Quando a peça vira mapa de calor de duas
dimensões categóricas, ela muda de família e vai para **15_mapa-de-calor-e-calendario**.

**Versões sugeridas.**
- **V1 básica: ciclo por executivo.** Doze tiras, cor sequencial de `--surface-raised` a `--chart-1`, mediana
  marcada.
- **V2 comparativa: mesma métrica, doze meses.** Uma tira por mês do ciclo de fechamento, revelando se a
  distribuição está encurtando ao longo do ano.
- **V3 caso limite: grupo com n baixo.** Tiras com `n` abaixo de 15 ganham hachura diagonal e o rótulo
  "amostra pequena", para a cor densa não ser lida como concentração real.

**Referências.**
- Catálogo: [Vega-Lite, 2D histogram heatmap](https://vega.github.io/vega-lite/examples/rect_binned_heatmap.html): observar o bin em duas dimensões com cor por contagem, que é a geometria de origem da tira.
- Praticante: [From Data to Viz, ridgeline](https://www.data-to-viz.com/graph/ridgeline.html): observar a lógica de empilhar muitos grupos numa régua comum, que a tira leva ao extremo trocando altura por cor.
- Portal de design: [Behance, Web app to optimize energy distribution](https://www.behance.net/gallery/204349647/Web-app-to-optimize-energy-distribution): observar o uso de faixas coloridas contínuas como leitura de intensidade em interface escura.

---

## 10. Densidade (KDE)

**Descrição.** Curva suave estimada a partir dos pontos, que responde a mesma pergunta do histograma sem o
degrau do bin. Troca o parâmetro "largura do bin" pelo parâmetro "banda", que é igualmente decisivo e menos
visível para o leitor.

**Anatomia.** Curva única, com ou sem preenchimento; eixo Y rotulado como densidade ou simplesmente omitido
quando a peça é qualitativa; recorte explícito nos limites observados; `n` no subtítulo; banda declarada no
rodapé.

**Abordagem na stack.** `recharts-nativo` para o desenho (`AreaChart` com `Area type="monotone"` sobre a grade
de densidade) e TypeScript puro para o cálculo, com a função `densidadeGauss` do modelo 5. A banda padrão sai
da regra de Silverman.

```tsx
export function bandaSilverman(valores: number[]) {
  const n = valores.length
  const media = valores.reduce((a, b) => a + b, 0) / n
  const dp = Math.sqrt(valores.reduce((a, v) => a + (v - media) ** 2, 0) / (n - 1))
  const ord = [...valores].sort((a, b) => a - b)
  const q = (p: number) => ord[Math.floor(p * (n - 1))]
  const iqr = q(0.75) - q(0.25)
  return 0.9 * Math.min(dp, iqr / 1.34) * Math.pow(n, -1 / 5)
}
```

**Ponto delicado.** Três armadilhas na mesma peça. A cauda vaza para valor impossível, e por isso a grade
começa em `max(0, min - 2*banda)` e termina em `max + 2*banda`, com corte duro em zero quando a métrica é
declarada não negativa. A banda automática some da tela e vira decisão invisível, então ela é escrita no
rodapé. E o eixo Y em unidade de densidade não significa nada para o leitor de negócio: ou vira contagem
equivalente (`d * n * passo`), ou some com uma nota de que a altura é relativa.

**Versões sugeridas.**
- **V1 básica: ticket médio.** Curva de ticket de fechamento com preenchimento leve, mediana marcada, rodapé
  "n 208 · banda R$ 8,2 mil · curva cortada em zero".
- **V2 com destaque: faixa de decisão.** `ReferenceArea` sobre a faixa de ticket que o comitê considera alvo,
  com o percentual da área dentro dela escrito no rótulo.
- **V3 caso limite: amostra curta.** Com `n` 22 a peça se recusa a desenhar a curva e cai automaticamente para
  strip plot, com a nota "n 22: pontos individuais, sem curva".

**Referências.**
- Catálogo: [Vega-Lite, density plot](https://vega.github.io/vega-lite/examples/area_density.html): observar os parâmetros `bandwidth` e `extent` da transformação de densidade, que correspondem exatamente aos dois cuidados do modelo.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar o conselho de sempre verificar se a estimativa não prevê valor impossível, com o exemplo da idade negativa.
- Portal de design: [Behance, Figma Charts Kit, dashboard templates design system](https://www.behance.net/gallery/67155393/Figma-Charts-Kit-Dashboard-templates-design-system): observar o preenchimento com gradiente suave sob a curva sem perder a linha de contorno.

---

## 11. Densidades sobrepostas

**Descrição.** Duas a quatro curvas na mesma régua, com preenchimento translúcido, para ver deslocamento e
largura lado a lado. Empilhar densidades, em vez de sobrepor, é desaconselhado: o leitor tenta ler a altura de
cada camada a partir da linha de base e erra.

**Anatomia.** Uma curva por grupo com preenchimento de 20% a 30%; legenda com cor, nome e `n`; mesma grade de
avaliação para todas as curvas; opcionalmente as medianas marcadas como pequenos triângulos no eixo.

**Abordagem na stack.** `recharts-nativo`: `AreaChart` com várias `Area` sem `stackId`, cada uma com
`fillOpacity` baixa e `stroke` forte. Todas precisam compartilhar o mesmo array de `x`, o que significa
calcular a densidade de todos os grupos sobre uma grade única.

**Ponto delicado.** Densidade é normalizada por grupo: cada curva integra 1, independentemente de o grupo ter
500 ou 12 observações. Duas curvas de mesma altura podem representar populações de tamanho muito diferente, e
o leitor de negócio lê altura como volume. Ou a peça multiplica cada densidade por `n` (aí as áreas ficam
proporcionais ao volume real e a comparação de forma fica prejudicada), ou mantém a normalização e escreve o
`n` grande na legenda. A escolha é declarada, nunca silenciosa.

**Versões sugeridas.**
- **V1 básica: dois canais.** CPL de busca contra social, duas curvas, `n` na legenda.
- **V2 com anotação: sobreposição medida.** A região em que as duas curvas se cruzam ganha hachura e o rótulo
  "faixa em que os dois canais custam igual: R$ 180 a R$ 240".
- **V3 caso limite: quatro grupos e um minúsculo.** Quatro plataformas, uma com 9 campanhas; a curva do grupo
  pequeno é substituída por strip de pontos na mesma régua, e a legenda explica a troca.

**Referências.**
- Catálogo: [Vega-Lite, stacked density estimates](https://vega.github.io/vega-lite/examples/area_density_stacked.html): observar exatamente o que evitar, a leitura de camada empilhada, e comparar com a versão sobreposta.
- Praticante: [Claus Wilke, boxplots and violins](https://clauswilke.com/dataviz/boxplots-violins.html): observar a exigência de pontos suficientes por grupo antes de mostrar densidade como linha suave.
- Portal de design: [Behance, Advanced SaaS Analytics Dashboards & KPI UI/UX, P1](https://www.behance.net/gallery/129162191/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-P1): observar o equilíbrio entre preenchimento translúcido e contorno em fundo escuro.

---

## 12. Ridgeline (joyplot)

**Descrição.** Uma densidade por grupo, deslocada verticalmente e ligeiramente sobreposta à vizinha, todas na
mesma régua horizontal. É o modelo certo para muitas distribuições, sobretudo quando os grupos têm ordem
natural, como mês a mês.

**Anatomia.** Linha de base por grupo, com rótulo à esquerda; curvas preenchidas com cor de fundo opaca, para
a de cima tapar a de baixo; sobreposição de 30% a 60% da altura; eixo X único embaixo; ordem dos grupos
declarada (cronológica ou por mediana).

**Abordagem na stack.** `svg-puro` é o caminho limpo: cada faixa é um `<path>` gerado por uma função própria
que converte a densidade em coordenadas, com `transform="translate(0, i * passo)"` e ordem de desenho de baixo
para cima. Fazer no Recharts exige um `ComposedChart` com N séries de `Area` e deslocamento artificial de
linha de base, o que engessa o `Tooltip` e não compensa.

```tsx
function caminhoFaixa(d: Ponto[], x: (v: number) => number, alturaMax: number, base: number) {
  const topo = d.map((p) => `${x(p.x)},${base - p.dNorm * alturaMax}`).join(' L')
  return `M${x(d[0].x)},${base} L${topo} L${x(d[d.length - 1].x)},${base} Z`
}
```

**Ponto delicado.** A sobreposição só funciona se o preenchimento for opaco e a ordem de desenho for de trás
para a frente (grupo mais ao fundo primeiro). Com `fillOpacity` translúcido o efeito de profundidade morre e a
peça vira mancha. O segundo ponto é a altura: normalizar cada faixa pela própria altura máxima deixa todas do
mesmo tamanho e esconde volume; normalizar pela altura máxima global deixa faixas pequenas invisíveis. O Farol
usa normalização global com piso mínimo de 8% e nota no rodapé. E ridgeline feito de histogramas é proibido,
porque as barras de faixas diferentes se alinham de formas confusas.

**Versões sugeridas.**
- **V1 básica: ciclo mês a mês.** Doze faixas, janeiro embaixo e dezembro em cima, mostrando se o ciclo está
  encurtando.
- **V2 com destaque: um grupo em foco.** Todas as faixas em `--line-strong` e a faixa do executivo escolhido
  em `--chart-1`, com a mediana dele marcada.
- **V3 densa do Farol: CPL por campanha ao longo de 18 meses.** Dezoito faixas em 420px de altura, rótulo de
  mês só a cada três, mediana marcada em cada faixa como traço fino.
- **V4 caso limite: mês sem dado.** Mês sem campanha ativa não vira faixa reta em zero; vira uma linha
  pontilhada com o texto "sem campanha" e o rótulo mantido, para o eixo temporal não mentir.

**Referências.**
- Catálogo: [From Data to Viz, ridgeline](https://www.data-to-viz.com/graph/ridgeline.html): observar o limite prático de que abaixo de meia dúzia de grupos outro modelo é melhor, e a exigência de ordenar os grupos.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar por que ridgeline de histogramas não funciona e a recomendação de usar densidade nas faixas.
- Portal de design: [Behance, Charts. Infographics. Data design in Figma](https://www.behance.net/gallery/70284157/Charts-Infographics-Data-design-in-Figma): observar tratamentos de camadas sobrepostas com rótulo lateral e eixo único compartilhado.

---

## 13. Box plot

**Descrição.** Cinco números por grupo: primeiro quartil, mediana e terceiro quartil formam a caixa; os bigodes
vão até o último valor dentro das cercas (1,5 vez o intervalo interquartil a partir da caixa, na convenção de
Tukey); o que passa das cercas vira ponto. É o resumo mais compacto da família e também o mais mal lido: Nick
Desbarats relata na Nightingale que, nas oficinas dele, "tipicamente menos de 20%" dos participantes já sabia
ler um box plot. Stephen Few defende o box plot justamente pelo lado oposto: muitas distribuições cabem nele
sem a poluição que o polígono de frequência cria.

**Anatomia.** Eixo de categoria com nome e `n` por grupo; caixa do Q1 ao Q3 com borda fina; traço de mediana
mais forte que a borda; bigodes até o último valor dentro das cercas, e não até o mínimo e o máximo absolutos
quando há outlier; outliers como pontos; linha de referência do limiar operacional; uma frase de leitura
("caixa: metade central dos casos") no rodapé, porque o público do Farol não é estatístico.

**Abordagem na stack.** `recharts-custom`: `ComposedChart` com `Bar` de `dataKey` em par `[q1, q3]`, `shape`
próprio para desenhar a mediana, `ErrorBar` filho do `Bar` para os bigodes e `Scatter` separado para os
outliers. É exatamente a montagem do exemplo oficial Box Plot do Recharts.

```tsx
export function resumoBox(valores: number[]) {
  const ord = [...valores].sort((a, b) => a - b)
  const q = (p: number) => {
    const pos = (ord.length - 1) * p
    const base = Math.floor(pos)
    const prox = ord[base + 1] ?? ord[base]
    return ord[base] + (pos - base) * (prox - ord[base])
  }
  const q1 = q(0.25), mediana = q(0.5), q3 = q(0.75), iqr = q3 - q1
  const dentro = ord.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr)
  return {
    n: ord.length, q1, mediana, q3,
    bigodeBaixo: dentro[0], bigodeAlto: dentro[dentro.length - 1],
    outliers: ord.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr),
  }
}
```

```tsx
<ComposedChart data={grupos} margin={{ top: 12, right: 16, bottom: 24, left: 8 }}>
  <XAxis dataKey="rotulo" allowDuplicatedCategory={false} />
  <YAxis domain={[0, 180]} />
  <Bar dataKey={(g: Grupo) => [g.q1, g.q3]} shape={<CaixaComMediana />} isAnimationActive={false}>
    <ErrorBar dataKey={(g: Grupo) => [g.q3 - g.bigodeBaixo, g.bigodeAlto - g.q3]}
      width={0} stroke="var(--text-muted)" />
  </Bar>
  <Scatter data={outliersPlanos} dataKey="valor" fill="var(--danger)" />
  <ReferenceLine y={30} stroke="var(--line-strong)" strokeDasharray="4 3" label="SLA 30 min" />
</ComposedChart>
```

**Ponto delicado.** Três. Primeiro, no exemplo oficial o bigode é medido **a partir de Q3**, e não a partir de
cada ponta da caixa: a distância de baixo é `q3 - min`, então a linha do bigode atravessa a caixa inteira; se a
caixa for translúcida no tema escuro, essa linha aparece por dentro e parece uma segunda mediana. Caixa opaca na
cor da superfície, ou bigode desenhado no próprio `shape`. Segundo, o método de quartil muda a caixa:
interpolação linear, dobradiças de Tukey e as duas funções de quartil de planilha dão resultados diferentes em
amostra pequena, e o gerente que confere na planilha acha que o painel errou. O método é declarado no registry
da métrica. Terceiro, `IQR = 0` (todos os valores iguais) zera a altura da caixa e a mediana some; o `shape`
precisa desenhar um traço mínimo de 2px.

**Versões sugeridas.**
- **V1 básica: primeiro contato por SDR.** Seis SDRs fictícios (SDR A a SDR F), minutos até o primeiro contato,
  `n` no rótulo do eixo e `ReferenceLine` no SLA de 30 minutos.
- **V2 com destaque: plataforma em foco.** CPL qualificado por plataforma (Plataforma 1 a 4); todas as caixas
  em `--line-strong` e a plataforma escolhida no filtro em `--chart-1`, com a meta de CPL como `ReferenceArea`.
- **V3 densa do Farol: dias parados por etapa.** Oito etapas do funil em layout horizontal, 1.900
  oportunidades abertas; outliers clicáveis com o código fictício da oportunidade (OP 10482) abrindo o drill.
- **V4 caso limite: grupo minúsculo e outlier distante.** Etapa com `n` 4 não ganha caixa, só os quatro
  pontos e o texto "n 4"; um outlier de 412 dias fica fora do domínio fixado e vira marcador na borda com o
  valor escrito, em vez de esticar o eixo e esmagar as outras caixas.

**Referências.**
- Catálogo: [Recharts, Box Plot](https://recharts.github.io/en-US/examples/BoxPlot/): observar o par `[q1, q3]` no `Bar`, o bigode medido a partir de Q3 e os outliers num `Scatter` à parte.
- Catálogo: [AG Charts, box plot com múltiplas séries](https://www.ag-grid.com/charts/gallery/multiple-box-plots/): observar o tooltip com os cinco números e a separação de séries por cor.
- Praticante: [Nightingale, I've Stopped Using Box Plots. Should You?](https://nightingaledvs.com/ive-stopped-using-box-plots-should-you/): observar os três defeitos (forma larga lida como quantidade, quartil como conceito abstrato, tudo parece sino) e as alternativas propostas.
- Praticante: [Stephen Few, Distribution Displays (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf): observar a tabela que compara histograma, polígono, box, strip e quantile plot por tarefa, e a ideia de trocar a caixa por histograma sob demanda.
- Portal de design: [Dribbble, Box Plot with Whiskers](https://dribbble.com/shots/4615955-Box-Plot-with-Whiskers) (não abriu): observar a defesa do box como faixa e distribuição num espaço pequeno, citada no resultado da busca.
- Portal de design: [Highcharts, box plot no tema escuro](https://www.highcharts.com/demo/box-plot/dark-unica): observar contraste de bigode e mediana sobre fundo escuro.

---

## 14. Box plot com entalhe e largura variável

**Descrição.** Duas variações de McGill, Tukey e Larsen (1978). Na **largura variável**, a caixa é proporcional à
raiz quadrada do `n` do grupo, e o tamanho da amostra entra na própria forma. No **entalhe**, a caixa estreita em
volta da mediana numa faixa de `mediana ± 1,58 × IQR / √n`; se os entalhes de dois grupos não se sobrepõem, a
diferença entre as medianas é forte. A documentação do ggplot2 lembra que o entalhe é intervalo para
**comparar** medianas, não intervalo de confiança da mediana isolada.

**Anatomia.** Caixa em polígono de dez vértices com a cintura na mediana; largura da caixa escalada por `√n`
contra o maior grupo; legenda curta ("largura: tamanho da amostra · entalhe: comparação de medianas"); bigodes e
outliers iguais aos do modelo 13.

**Abordagem na stack.** `recharts-custom`: o mesmo `Bar` de par `[q1, q3]`, com `shape` que desenha um `<path>`
entalhado dentro da largura de banda que o Recharts entrega. A escala valor para pixel sai da própria caixa.

```tsx
function CaixaEntalhada(p: BarShapeProps & { payload: Grupo; nMax: number }) {
  const { x, y, width, height, payload: g, nMax } = p
  const pxPorUnidade = g.q3 === g.q1 ? 0 : height / (g.q3 - g.q1)
  const w = width * Math.sqrt(g.n / nMax)
  const cx = x + width / 2, meio = w / 2, cintura = w / 4
  const yMed = y + (g.q3 - g.mediana) * pxPorUnidade
  const entalhe = Math.min((1.58 * (g.q3 - g.q1)) / Math.sqrt(g.n) * pxPorUnidade, height / 2)
  const d = `M${cx - meio},${y} H${cx + meio} V${yMed - entalhe} L${cx + cintura},${yMed}
    L${cx + meio},${yMed + entalhe} V${y + height} H${cx - meio} V${yMed + entalhe}
    L${cx - cintura},${yMed} L${cx - meio},${yMed - entalhe} Z`
  return <path d={d} fill="var(--surface-raised)" stroke="var(--chart-1)" />
}
```

**Ponto delicado.** Em amostra pequena o entalhe fica maior que a própria caixa e o polígono "dobra para
fora", o desenho estranho que o R avisa com mensagem; o `Math.min` acima corta o entalhe na altura da caixa, e o
corte precisa virar aviso visível ("entalhe maior que a caixa: amostra pequena"), não correção silenciosa. A
largura por `√n` exige `nMax` calculado sobre **todos** os grupos antes do render, e fixado quando o filtro
esconde um grupo; senão a largura de um mesmo grupo muda sem que o dado dele tenha mudado.

**Versões sugeridas.**
- **V1 básica: ciclo por origem.** Negócio novo, cliente da casa e indicação; entalhes que não se tocam e a
  frase "as medianas diferem com folga".
- **V2 com destaque: largura mostrando amostra.** CPL por plataforma, com uma plataforma de 9 campanhas
  visivelmente mais estreita que as de 180; a largura evita que a caixa pequena seja lida como tão confiável
  quanto as grandes.
- **V3 caso limite: entalhe estourado.** Executivo com 7 negócios; o entalhe é cortado, tracejado e anotado,
  e a comparação de medianas daquele grupo sai da frase-resumo.

**Referências.**
- Catálogo: [ggplot2, geom_boxplot](https://ggplot2.tidyverse.org/reference/geom_boxplot.html): observar os parâmetros `notch` e `varwidth` e a fórmula `1.58 * IQR / sqrt(n)` documentada.
- Praticante: [Wickham e Stryjewski, 40 years of boxplots (PDF)](https://vita.had.co.nz/papers/boxplots.pdf): observar a genealogia das variações de box plot desde Tukey, incluindo entalhe e largura variável.
- Portal de design: [Figma Community, r19 Data Visualization Kit](https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit): observar o componente de box plot do kit e como ele separa caixa, mediana e bigode em camadas editáveis.

---

## 15. Letter-value plot (boxen)

**Descrição.** Box plot para amostra grande. Hofmann, Wickham e Kafadar (2017) partem da crítica de que o box
plot foi pensado para ser desenhado à mão, em conjunto pequeno; com dezenas de milhares de casos ele despeja
centenas de "outliers" que nada têm de anormal. O letter-value plot acrescenta caixas aninhadas para os
quantis seguintes (oitavos, dezesseis avos e assim por diante) **só até a profundidade em que esses quantis
ainda são estimativas confiáveis**, e chama de outlier apenas o que passa da última caixa desenhada.

**Anatomia.** Caixa central da mediana aos quartis, como no box comum; caixas externas progressivamente mais
estreitas e mais claras, uma por nível; mediana em traço; poucos pontos de outlier; legenda de níveis
("cada faixa externa guarda metade do que sobrou fora da anterior").

**Abordagem na stack.** `svg-puro`, como componente filho do `ComposedChart` que lê a escala pelos hooks de
layout, ou num `<svg>` próprio. Várias `Bar` de faixa na mesma categoria seriam posicionadas lado a lado pelo
Recharts, e forçar a sobreposição com `barGap` negativo quebra no redimensionamento.

```tsx
export function letterValues(ord: number[], niveis: number) {
  const n = ord.length
  const valorNaProfundidade = (d: number) => {
    const baixo = ord[Math.floor(d) - 1], alto = ord[Math.ceil(d) - 1]
    return (baixo + alto) / 2
  }
  const faixas: { nivel: number; baixo: number; alto: number }[] = []
  let d = (1 + n) / 2
  for (let k = 1; k <= niveis; k++) {
    d = (1 + Math.floor(d)) / 2
    faixas.push({ nivel: k, baixo: valorNaProfundidade(d), alto: valorNaProfundidade(n + 1 - d) })
  }
  return faixas
}
```

**Ponto delicado.** A quantidade de níveis é a decisão central e não pode ser fixa: ela depende de `n`. Uma
regra simples usada na prática é `floor(log2(n)) - 3` níveis, que deixa poucos casos fora da última caixa; o
artigo discute alternativas baseadas na confiabilidade do quantil, e a regra escolhida precisa ser conferida
contra ele antes de ir para o componente. A cor é o outro risco: os tons das caixas externas precisam de
contraste 3:1 entre vizinhos no tema escuro, senão a peça vira um bloco único e perde o motivo de existir.

**Versões sugeridas.**
- **V1 básica: primeiro contato em volume.** 38 mil leads do ano, minutos até o primeiro contato por canal de
  entrada, com 5 a 7 níveis por canal conforme o `n`.
- **V2 densa do Farol: CPL diário por conjunto de anúncios.** 26 mil linhas de mídia paga por plataforma; a
  cauda cara aparece em faixas, sem as centenas de pontos que o box comum desenharia.
- **V3 caso limite: canal pequeno.** Canal com 600 leads recebe só dois níveis; abaixo de 1.000 casos o
  componente volta para box com pontos (modelo 16) e diz por quê no rodapé.

**Referências.**
- Catálogo: [CRAN, pacote lvplot](https://archive.linux.duke.edu/cran/web/packages/lvplot/index.html): observar que a implementação escolhe dinamicamente quantos letter values mostrar.
- Praticante: [Hofmann, Wickham e Kafadar, Letter-value plots: Boxplots for large data](https://vita.had.co.nz/papers/letter-value-plot.html): observar a regra de parar onde o quantil deixa de ser confiável e o princípio de que tudo o que aparece é observação real.
- Portal de design: [Dribbble, Distribution Chart UI design, Figma templates kit](https://dribbble.com/shots/13988553-Distribution-Chart-Ui-design-Figma-templates-kit): observar o tratamento de faixa e distribuição por grupo em kit de interface; nenhum portal mostrou letter-value em si, lacuna registrada.

---

## 16. Box plot com jitter

**Descrição.** O box plot do modelo 13 com todas as observações por cima, cada uma deslocada levemente para o
lado. É a correção mais barata do defeito do box: From Data to Viz lembra que amostra pequena e distribuição
bimodal são impossíveis de detectar lendo só as caixas, e que os pontos tornam a distribuição imediatamente
visível, desde que o volume não seja grande a ponto de a nuvem virar mancha.

**Anatomia.** Caixa vazada (só contorno) ou com preenchimento muito leve; pontos pequenos (raio 2 a 3px) com
opacidade entre 0.35 e 0.6; deslocamento lateral limitado a uns 35% da largura da banda; outliers não
duplicados (o ponto já está na nuvem); `n` no eixo.

**Abordagem na stack.** `recharts-custom`: o box do modelo 13 mais um `Scatter` com `shape` próprio que
desloca `cx` em pixels. Assim o eixo continua categórico e o jitter não vira dado.

```tsx
export function ruido(id: string, amplitude: number) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return ((h >>> 0) / 4294967295 - 0.5) * 2 * amplitude
}

<Scatter data={observacoes} dataKey="valor" isAnimationActive={false}
  shape={(p: ScatterShapeProps & { payload: Obs }) => (
    <circle cx={p.cx + ruido(p.payload.id, 14)} cy={p.cy} r={2.5}
      fill="var(--chart-1)" fillOpacity={0.45} />
  )} />
```

**Ponto delicado.** Dois problemas específicos do Recharts. O `Scatter` num eixo categórico com vários pontos
por categoria cria categorias duplicadas no eixo, e as marcas saem repetidas; `allowDuplicatedCategory={false}`
no `XAxis` resolve. E a amplitude do ruído em pixels precisa sair da largura da banda (`bandwidth` do eixo),
não ser um número fixo, senão num painel estreito os pontos de um grupo invadem o vizinho. O ruído vem do id
do registro (hash FNV acima), nunca de `Math.random()`, para o gráfico não tremer a cada render.

**Versões sugeridas.**
- **V1 básica: tentativas até a agenda.** Seis SDRs, 30 a 80 leads cada, caixa vazada e pontos em
  `--chart-1`.
- **V2 com destaque: lado errado do SLA.** Pontos acima do SLA de 30 minutos em `--danger` e os de dentro em
  neutro; a cor responde ao limiar, não ao grupo, e o subtítulo traz o percentual.
- **V3 densa do Farol: ticket por executivo.** 14 executivos fictícios, 208 negócios ganhos; cada ponto abre o
  negócio no drill e o tooltip mostra código, valor e data de fechamento.
- **V4 caso limite: grupo com 900 pontos.** O componente troca a nuvem do grupo por faixa de densidade
  (modelo 9) ou mostra amostra fixa declarada ("200 de 900, sorteio por id"), nunca uma mancha sólida.

**Referências.**
- Catálogo: [React Graph Gallery, boxplot com jitter](https://www.react-graph-gallery.com/example/boxplot-jitter): observar a ordem de desenho dos pontos sobre a caixa e o tamanho pequeno dos marcadores.
- Catálogo: [R Graph Gallery, boxplot with jitter](https://r-graph-gallery.com/96-boxplot-with-jitter.html): observar o ajuste de opacidade e tamanho do ponto para não esconder a caixa.
- Praticante: [From Data to Viz, the boxplot and its pitfalls](https://www.data-to-viz.com/caveat/boxplot.html): observar o argumento central de que amostra pequena e bimodalidade não aparecem na caixa. A página abriu truncada nesta pesquisa; o conteúdo citado veio do resultado da busca.
- Portal de design: [Flourish, box, violin e beeswarm no template de dispersão](https://helpcenter.flourish.studio/hc/en-us/articles/9859136207759-How-to-make-box-violin-and-beeswarm-scatter-plots): observar que a ferramenta trata box, violino e pontos como camadas ligáveis sobre o mesmo gráfico.

---

## 17. Violino

**Descrição.** A densidade de cada grupo espelhada em torno de um eixo central: onde o violino é largo há muitos
casos, onde afina há poucos. O Data Visualisation Catalogue descreve como um box plot com a densidade girada de
cada lado. Ganha do box exatamente onde o box mente (bimodalidade, aglomerado, buraco) e perde onde a amostra é
curta: o RAWGraphs avisa que, por depender de estimativa de densidade, ele só faz sentido com dado suficiente, e
o React Graph Gallery sugere box com pontos abaixo de uns 100 casos.

**Anatomia.** Eixo de categoria com `n`; uma forma simétrica por grupo, todas com a mesma largura máxima de
banda; eixo de valor comum; forma recortada no mínimo e no máximo observados; banda de suavização declarada no
rodapé; contorno de 1px e preenchimento sólido de baixa saturação.

**Abordagem na stack.** `svg-puro` para vários grupos lado a lado: um `<path>` por grupo, com escala linear
própria em TypeScript e a densidade calculada pela `densidadeGauss` do modelo 5. Para **um grupo só** em
horizontal, `recharts-custom` resolve com `AreaChart` e `Area` de `dataKey` em par `[-d, d]`.

```tsx
export function caminhoViolino(
  dens: { v: number; d: number }[], cx: number, meiaLargura: number,
  dRef: number, y: (v: number) => number,
) {
  const lado = (s: 1 | -1) => (p: { v: number; d: number }) =>
    `${cx + s * (p.d / dRef) * meiaLargura},${y(p.v)}`
  const direita = dens.map(lado(1))
  const esquerda = [...dens].reverse().map(lado(-1))
  return `M${direita.join(' L')} L${esquerda.join(' L')} Z`
}
```

**Ponto delicado.** O `dRef` decide o que a largura significa, e há três leituras legítimas (as mesmas que o
`geom_sina` do ggforce oferece como `scale`): **área** (densidade máxima global, grupos comparáveis em forma),
**contagem** (densidade vezes `n`, grupo grande fica largo) e **largura** (cada violino ocupa a banda inteira,
forma pura, volume some). O Farol escolhe por métrica e escreve na legenda. A banda também precisa ser a mesma
para todos os grupos; Silverman calculado por grupo dá uma banda diferente para cada um, e as formas deixam de
ser comparáveis. E grupo abaixo do piso de `n` cai para strip (regra 3), sem exceção.

**Versões sugeridas.**
- **V1 básica: ciclo por segmento.** Três segmentos com mais de 150 negócios cada; escala por área, mediana
  como traço fino.
- **V2 com destaque: violino dividido.** Uma metade por grupo na mesma categoria: tempo até a agenda de leads de
  mídia paga (metade esquerda) e de indicação (metade direita) por squad de pré-vendas; cor com um papel só, o
  grupo.
- **V3 densa do Farol: CPL por plataforma.** 1.100 campanhas em quatro plataformas; escala por contagem para a
  plataforma dominante aparecer larga, e `n` grande no eixo.
- **V4 caso limite: massa no zero.** Receita por oportunidade com 41% de zeros; o zero sai da densidade e vira
  uma barra curta separada abaixo do violino, rotulada "41% sem receita", porque a suavização espalharia o pico
  do zero por valores que não existem.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, violin plot](https://datavizcatalogue.com/methods/violin_plot.html): observar a definição como box com densidade girada e o marcador de mediana dentro.
- Catálogo: [Data Viz Project, violin plot](https://datavizproject.com/data-type/violin-plot/) (não abriu): observar a ficha do catálogo e os exemplos relacionados.
- Praticante: [Claus Wilke, visualizing many distributions at once](https://clauswilke.com/dataviz/boxplots-violins.html): observar a exigência de pontos suficientes por grupo e a comparação lado a lado de box, violino, strip e sina. Domínio bloqueado para abertura nesta sessão; link do resultado da busca.
- Praticante: [React Graph Gallery, violin plot](https://www.react-graph-gallery.com/violin-plot): observar a transição animada entre box e violino, que expõe o que a caixa escondia.
- Portal de design: [Ant Design Charts for Figma](https://www.antforfigma.com/ant-design-charts-for-figma): observar a presença de histograma, box e violino no mesmo kit de componentes estatísticos.

---

## 18. Violino com marcadores internos

**Descrição.** O violino com um resumo desenhado por dentro: mini box (faixa interquartil grossa e mediana em
ponto claro), linhas de quartil tracejadas ou só o ponto da mediana. O r-statistics.co chama o par violino e
mini box de padrão clássico: o violino dá a forma e a caixa dá mediana, dispersão e outliers.

**Anatomia.** Violino em cor de baixa saturação; barra interna fina do Q1 ao Q3 em `--line-strong`; ponto de
mediana em `--text-strong` com anel da cor da superfície; bigode interno opcional até p5 e p95; legenda que diz
qual é cada marcador.

**Abordagem na stack.** `svg-puro`, sobre o `caminhoViolino` do modelo 17: um `<rect>` para o IQR e um
`<circle>` para a mediana por grupo, na mesma escala. Em horizontal com um grupo só, `recharts-custom` com
`Area` em par mais `ReferenceLine` e `ReferenceDot`.

**Ponto delicado.** O mini box tem largura fixa e o violino não: onde a forma afina perto da mediana (caso
bimodal), a caixa transborda o contorno e parece outra forma. A largura do marcador é
`min(larguraPadrão, 0.6 × larguraDoViolinoNaMediana)`, com piso de 3px. O segundo cuidado é peso: o marcador
interno é resumo e deve ser mais discreto que a forma, senão o leitor volta a ler só o box.

**Versões sugeridas.**
- **V1 básica: CPL qualificado por origem.** Quatro origens, violino com mediana e IQR internos.
- **V2 com anotação: meta atravessando os grupos.** `ReferenceLine` na meta de CPL cortando todos os violinos,
  com o percentual acima da meta escrito ao lado de cada um.
- **V3 caso limite: mediana no vale.** Tempo de resposta bimodal; o ponto da mediana cai onde o violino quase
  some, e a nota diz "a mediana está onde quase não há caso; leia os dois picos".

**Referências.**
- Catálogo: [R CHARTS e r-statistics.co, violin plot in R](https://r-statistics.co/Violin-Plot-in-R.html): observar a combinação violino e mini box e a escolha de paleta para não competir com o resto do painel.
- Praticante: [Mode, Violin Plots 101](https://mode.com/blog/violin-plot-examples/): observar a explicação de leitura para público de negócio.
- Portal de design: [Figma Community, r19 Data Visualization Kit](https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit): observar o componente de violino ao lado do box e da curva de densidade no mesmo kit.

---

## 19. Meio violino e raincloud

**Descrição.** Três camadas numa banda só: meia densidade de um lado (a nuvem), um box estreito no meio e os
pontos com jitter do outro lado (a chuva). Allen, Poggiali, Whitaker e colegas propuseram o formato em 2019
como resposta à barra com barra de erro, criticada por distorcer tamanho de efeito e esconder o padrão do dado
cru. O meia olho do ggdist é a mesma ideia sem a chuva: densidade mais intervalo.

**Anatomia.** Layout horizontal; em cada banda, meia densidade preenchida na metade superior, box fino na linha
de base, pontos pequenos com jitter na faixa inferior; eixo de valor comum; rótulo do grupo à esquerda com `n`;
legenda de uma linha explicando as três camadas na primeira vez que a peça aparece.

**Abordagem na stack.** `svg-puro`: meio violino é o `caminhoViolino` do modelo 17 com um lado só (a base vira
reta), box em `<rect>` e `<line>`, pontos em `<circle>` com o `ruido` do modelo 16 limitado à sub-banda.
Para um único grupo, `recharts-custom` com `ComposedChart` em `layout="vertical"` resolve, mas a divisão da banda
em sub-faixas é mais simples de controlar em SVG próprio.

```tsx
const faixa = { nuvem: [0, 0.5], box: [0.52, 0.6], chuva: [0.64, 0.98] } as const
const yDe = (i: number, parte: keyof typeof faixa, t: number) =>
  topo + i * alturaBanda + (faixa[parte][0] + t * (faixa[parte][1] - faixa[parte][0])) * alturaBanda
```

**Ponto delicado.** As três camadas competem por peso visual e por altura. A nuvem tem que ser a mais leve
(preenchimento de baixa opacidade, sem contorno forte), o box o mais fino e os pontos pequenos; qualquer camada
em cor cheia apaga as outras. A banda precisa de altura mínima (uns 56px) para as três sub-faixas serem
legíveis; abaixo disso o componente omite a nuvem. E o jitter da chuva fica preso na sub-faixa dele, senão o
ponto cai dentro da nuvem e parece parte da densidade.

**Versões sugeridas.**
- **V1 básica: tempo até a agenda por squad.** Três squads de pré-vendas fictícios, 120 a 300 leads cada.
- **V2 com destaque: antes e depois.** Nuvem do trimestre anterior só em contorno e a do atual preenchida, na
  mesma banda, com a frase "a mediana caiu de 3,2 para 1,8 dia depois da nova cadência".
- **V3 densa do Farol: handoff por executivo.** Dez executivos, 20 a 60 handoffs cada; pontos clicáveis levam
  à oportunidade e o box mostra a mediana de dias entre agenda e primeira reunião de vendas.
- **V4 caso limite: grupo com n 9.** Sem nuvem e sem box: só a chuva e um traço de mediana, com "n 9" no
  rótulo.

**Referências.**
- Catálogo: [ggdist, slab + interval stats and geoms](https://mjskay.github.io/ggdist/articles/slabinterval.html): observar o meia olho (densidade mais intervalos de 66% e 95%) e as variações com pontos, base do raincloud sem a chuva.
- Praticante: [Allen e colegas, Raincloud plots: a multi-platform tool for robust data visualization](https://ora.ox.ac.uk/objects/uuid:e870716e-0be2-4f7c-9e9f-a05f4aa0dd47): observar a motivação contra barra com erro e as modificações sugeridas para amostras de tamanhos diferentes.
- Praticante: [RainCloudPlots no GitHub](https://github.com/RainCloudPlots/RainCloudPlots): observar os tutoriais com a ordem das camadas e o deslocamento entre nuvem, box e chuva.
- Portal de design: nenhum portal (Behance, Dribbble, Figma Community) devolveu raincloud nesta pesquisa; a referência visual mais próxima é o [Python Graph Gallery, violino com beeswarm](https://python-graph-gallery.com/502-violinplot-and-swarmplot/), que é galeria de código e não portal.

---

## 20. Sina plot

**Descrição.** Strip com jitter em que a largura do espalhamento de cada ponto é limitada pela densidade no
valor dele. A documentação do `geom_sina` do ggforce define como "um strip chart com jitter aprimorado, em que a
largura do jitter é controlada pela distribuição de densidade dos dados dentro de cada classe". Com muitos
pontos ele desenha o contorno de um violino; com poucos, parece um strip comum, que é o comportamento certo.

**Anatomia.** Uma coluna de pontos por grupo; pontos espalhados lateralmente até o contorno da densidade; eixo
de valor comum; opcionalmente o contorno do violino em linha muito fina; mediana em traço horizontal.

**Abordagem na stack.** `recharts-custom`: `Scatter` com `shape` que desloca `cx`. A fração lateral de cada ponto
(`-1` a `1`, já multiplicada pela densidade relativa no valor dele) é calculada em TypeScript e guardada no
registro; o `shape` só multiplica pela meia largura da banda.

```tsx
export function fracaoSina(obs: Obs[], dens: { v: number; d: number }[], dRef: number) {
  const dNoValor = (v: number) => {
    const i = dens.findIndex((p) => p.v >= v)
    if (i <= 0) return dens[0]?.d ?? 0
    const a = dens[i - 1], b = dens[i]
    return a.d + ((v - a.v) / (b.v - a.v)) * (b.d - a.d)
  }
  return obs.map((o) => ({ ...o, fracao: ruido(o.id, 1) * (dNoValor(o.valor) / dRef) }))
}
```

**Ponto delicado.** O `ggforce` expõe três escalas (`area`, `count`, `width`) e um `seed` para reprodutibilidade;
as duas decisões valem igual aqui. Sem semente fixa o gráfico muda de desenho a cada render, e sem escala
declarada grupos de tamanho muito diferente ficam com larguras incomparáveis. A busca linear da densidade é
O(n × grade): com 5 mil pontos e grade de 120 ainda é instantâneo, mas deve rodar num `useMemo` com o array de
observações como dependência. E o leitor pode achar que a posição lateral tem significado; a legenda diz que
não tem.

**Versões sugeridas.**
- **V1 básica: CPL por plataforma.** Quatro plataformas, 60 a 300 campanhas cada, escala por área.
- **V2 com destaque: um tipo de criativo.** Campanhas com criativo em vídeo em `--chart-2` e demais em neutro,
  mostrando se o vídeo mora na cauda barata ou na cara.
- **V3 densa do Farol: dias entre agenda e reunião.** 2.400 handoffs em seis squads; contorno de violino
  desenhado em 1px e mediana marcada.
- **V4 caso limite: tamanhos desiguais.** Um squad com 900 casos e outro com 40; alternador "área | contagem"
  com a escolha escrita na legenda.

**Referências.**
- Catálogo: [ggforce, geom_sina](https://ggforce.data-imaginist.com/reference/geom_sina.html): observar a definição, os modos de escala e os métodos `density` e `counts`.
- Praticante: [Claus Wilke, visualizing many distributions at once](https://clauswilke.com/dataviz/boxplots-violins.html): observar o sina plot lado a lado com strip, box e violino sobre o mesmo dado.
- Praticante: [draw sinaplots with geom_sina](https://mzuer.github.io/blog/2020/05/30/r-sinaplot): observar exemplos práticos de ajuste de largura máxima.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 21. Strip plot e jitter

**Descrição.** Cada observação vira um ponto numa escala só. Stephen Few resume a troca: o strip mostra o valor
exato de cada caso (e os buracos entre eles, que o histograma apaga), mas "não mostra a forma da distribuição
nem de longe tão bem" quanto histograma e polígono. A sobreposição se alivia com transparência; quando não basta,
entra o jitter perpendicular à escala. Few critica o jitter comum como "bombardeio em tapete" que mexe em todos
os valores, e não só nos escondidos, criando padrões verticais sem significado que ainda assim puxam o olho.

**Anatomia.** Eixo de valor; uma faixa por grupo; pontos pequenos com opacidade; deslocamento perpendicular
mínimo; mediana e limiar marcados (Few lembra que o strip não identifica tendência central nem outlier sozinho);
`n` por faixa.

**Abordagem na stack.** `recharts-nativo` para o strip simples: `ScatterChart` com `XAxis type="number"`,
`YAxis type="category"` e um `Scatter` por grupo, sem jitter. Com jitter, vira `recharts-custom` com o `shape`
e o `ruido` determinístico do modelo 16.

```tsx
<ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
  <XAxis type="number" dataKey="valor" domain={[0, 180]} name="minutos" />
  <YAxis type="category" dataKey="sdr" allowDuplicatedCategory={false} width={72} />
  <Scatter data={observacoes} fill="var(--chart-1)" fillOpacity={0.45} isAnimationActive={false} />
  <ReferenceLine x={30} stroke="var(--line-strong)" label="SLA" />
</ScatterChart>
```

**Ponto delicado.** Transparência que funciona em fundo claro some no escuro: ponto com 20% de opacidade sobre
superfície escura fica abaixo do contraste mínimo de marca de dado. O piso no Farol é 0.35 com contorno de
0.5px na cor da superfície. Cada ponto é um elemento SVG: acima de uns 2 mil pontos a interação pesa, e acima
de 5 mil a peça troca para faixa de densidade (modelo 9). E valor discreto com poucos níveis (tentativas de 1 a
8) empilha tudo em oito pontos; nesse caso o modelo certo é o dot plot empilhado (modelo 24).

**Versões sugeridas.**
- **V1 básica: negócios ganhos no mês.** 23 negócios, valor em reais, uma faixa só, transparência.
- **V2 com anotação: mediana, p90 e nomes.** CPL de 64 campanhas com mediana e p90 marcados e as três
  campanhas acima do p90 rotuladas pelo nome fictício.
- **V3 densa do Farol: primeiro contato por SDR.** Seis faixas horizontais, 40 a 120 leads por SDR, jitter
  perpendicular determinístico e SLA desenhado.
- **V4 caso limite: dado ausente e valor repetido.** 214 leads sem horário de contato ficam fora e contados no
  rodapé; quando a métrica tem menos de 15 valores distintos, o componente troca para dot plot empilhado.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, dot distribution plot](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/): observar os nomes alternativos (strip plot, dot strip plot), a opacidade contra sobreposição e a variante barcode.
- Catálogo: [Guia de visualização de dados da UE, univariate scatter plots and strip plots](https://data.europa.eu/apps/data-visualisation-guide/univariate-scatter-plots-and-strip-plots): observar o tratamento do strip como dispersão de uma variável.
- Praticante: [Stephen Few, The DataVis Jitterbug (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/the_datavis_jitterbug.pdf): observar as três regras propostas (mexer só no ponto escondido, só o mínimo necessário, no lugar que menos prejudica a leitura).
- Praticante: [Nightingale, I've Stopped Using Box Plots. Should You?](https://nightingaledvs.com/ive-stopped-using-box-plots-should-you/): observar o strip e o strip com jitter como substitutos do box, lidos "em poucos segundos".
- Portal de design: [Dribbble, Distribution Chart UI design, Figma templates kit](https://dribbble.com/shots/13988553-Distribution-Chart-Ui-design-Figma-templates-kit): observar a proposta de kit para comparar faixa e distribuição de grupos numéricos.

---

## 22. Beeswarm

**Descrição.** Pontos empacotados lado a lado para não se sobreporem, com a posição no eixo de valor mantida.
O Data Visualisation Catalogue insiste que não é jitter: o deslocamento é o mínimo para evitar sobreposição. O
blog do Observable resume o limite em duas frases: o beeswarm "pode falhar se houver pontos demais", porque a
nuvem dispara para fora da área do gráfico, e "não deve ser usado para inferir valores exatos no eixo", já que o
raio do ponto cobre uma faixa de valores.

**Anatomia.** Eixo de valor; pontos de raio fixo; âncora do empilhamento (centro, para nuvem espelhada, ou base,
para nuvem de um lado só); cor por categoria opcional; tooltip por ponto; mediana marcada.

**Abordagem na stack.** `svg-puro`: a geometria depende do raio em pixels e da escala em pixels, então o layout
só pode ser calculado depois de medir a largura (`ResizeObserver`), numa função pura de TypeScript. O amCharts
resolve com simulação de força; aqui a solução é o algoritmo guloso, sem biblioteca.

```tsx
export function dodge(pts: { id: string; x: number }[], r: number, padding = 1) {
  const diam = 2 * r + padding
  const saida: { id: string; x: number; y: number }[] = []
  for (const p of [...pts].sort((a, b) => a.x - b.x)) {
    const viz = saida.filter((q) => Math.abs(q.x - p.x) < diam)
    const cands = [0, ...viz.flatMap((q) => {
      const dy = Math.sqrt(diam * diam - (q.x - p.x) ** 2)
      return [q.y + dy, q.y - dy]
    })].sort((a, b) => Math.abs(a) - Math.abs(b))
    const y = cands.find((c) =>
      viz.every((q) => (q.x - p.x) ** 2 + (q.y - c) ** 2 >= diam * diam - 1e-6)) ?? 0
    saida.push({ ...p, y })
  }
  return saida
}
```

**Ponto delicado.** Quatro. O algoritmo é guloso e depende da ordem de entrada: ordenar por valor dá uma forma,
ordenar por data dá outra, e a ordem precisa ser fixa. A altura necessária só é conhecida depois do cálculo
(`max(|y|) + r`); se passar do espaço, o componente reduz o raio até um piso de 2px e, abaixo disso, cai para
dot plot empilhado ou faixa de densidade, com aviso. O recálculo em cada redimensionamento precisa de
`requestAnimationFrame` ou debounce. E o filtro `viz` acima é quadrático; acima de mil pontos a busca de vizinhos
usa janela deslizante sobre o array ordenado.

**Versões sugeridas.**
- **V1 básica: CPL de cada campanha.** 187 campanhas do trimestre, nuvem espelhada, mediana marcada.
- **V2 com destaque: campanhas acima da meta.** Pontos acima da meta de CPL qualificado com contorno de
  alerta e as cinco mais caras rotuladas.
- **V3 densa do Farol: ticket por trimestre.** 312 negócios ganhos em quatro faixas trimestrais, raio de 3px,
  cor com um papel só (vertical fictícia A ou B) e drill por ponto.
- **V4 caso limite: volume demais.** 2 mil leads no mês não cabem na altura do cartão; o componente mostra a
  faixa de densidade no lugar e a frase "2.000 pontos não cabem sem sobrepor; forma resumida".

**Referências.**
- Catálogo: [Observable Plot, dodge transform](https://observablehq.com/plot/transforms/dodge) (não abriu, HTTP 429): observar o `dodgeX` e o `dodgeY`, que calculam a dimensão livre a partir da fixa.
- Catálogo: [amCharts, beeswarm demo](https://www.amcharts.com/demos/beeswarm/): observar o reposicionamento ao redimensionar e o tamanho do ponto como segunda variável.
- Praticante: [Observable, five underused charts for richer dashboards](https://old.observablehq.com/blog/five-underused-charts-for-richer-dashboards): observar os dois alertas citados acima, escritos para contexto de dashboard.
- Praticante: [Data Visualisation Catalogue, beeswarm plots](https://datavizcatalogue.com/blog/chart-snapshot-beeswarm-plot/): observar a distinção entre beeswarm e jitter e o uso de cor para categoria.
- Portal de design: [Data Viz Project, beeswarm plot](https://datavizproject.com/data-type/beeswarm-blot/): observar a ficha visual e os exemplos editoriais ligados a ela.

---

## 23. Barcode plot (rug)

**Descrição.** Um traço fino por observação ao longo de uma escala, sem empilhar nada. O FT lista o *barcode
plot* na coluna Distribution do Visual Vocabulary, e o Data Visualisation Catalogue o descreve como variação do
strip "que usa listras em vez de pontos". Desenhado na borda de outro gráfico (sob um histograma ou uma
densidade), o mesmo traço se chama *rug* e mostra onde estão os dados que a curva suavizou.

**Anatomia.** Faixa de 12 a 24px de altura; traço de 1px com opacidade entre 0.25 e 0.5; eixo de valor ou só os
extremos rotulados; caso selecionado com traço mais alto e em cor de destaque; mediana como traço mais grosso.

**Abordagem na stack.** `svg-puro` quando é peça compacta (um `<line>` por valor, sem eixo do Recharts);
`recharts-custom` quando é o rug debaixo de uma densidade do Recharts, com `Scatter` em `y` fixo e `shape` que
devolve `<line>` em vez de círculo.

```tsx
<svg width={largura} height={20} role="img" aria-label={`${valores.length} negócios`}>
  {valores.map((v) => (
    <line key={v.id} x1={Math.round(x(v.valor)) + 0.5} x2={Math.round(x(v.valor)) + 0.5}
      y1={4} y2={16} stroke="var(--chart-1)" strokeOpacity={0.35} shapeRendering="crispEdges" />
  ))}
</svg>
```

**Ponto delicado.** Linha de 1px em coordenada fracionária é rasterizada como 2px pela metade da opacidade, e a
faixa inteira fica borrada; arredondar para o meio pixel e usar `shapeRendering="crispEdges"`. A opacidade
acumula quando traços se sobrepõem, o que é desejável até saturar: com dezenas de valores idênticos o traço vira
bloco e a contagem some, e a peça passa a pedir histograma. É um microvisual: dentro de card ou célula ele mora em
**24_microvisuais-sparklines**, com a geometria descrita aqui.

**Versões sugeridas.**
- **V1 básica: tickets do ano no card de receita.** 208 negócios ganhos numa linha de 16px abaixo do KPI.
- **V2 com destaque: onde está este negócio.** Mesmo barcode com o negócio aberto no drill em traço alto
  `--chart-2` e o texto "maior que 81% dos ganhos do ano".
- **V3 densa do Farol: rug sob a densidade de CPL.** 1.100 campanhas como tapete na base da curva do modelo 10.
- **V4 caso limite: valores arredondados.** CPL lançado em múltiplos de R$ 10 empilha dezenas de traços no mesmo
  pixel; acima de 8 coincidências no mesmo valor o componente troca para histograma e avisa.

**Referências.**
- Catálogo: [FT, Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar o barcode ao lado de dot strip e histograma na coluna Distribution.
- Catálogo: [FT, pôster do Visual Vocabulary (PDF)](https://journalismcourses.org/wp-content/uploads/2020/07/Visual-vocabulary.pdf): observar o desenho de referência de cada forma da coluna Distribution.
- Catálogo: [Data Visualisation Catalogue, dot distribution plot](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/): observar a variante barcode descrita como listras no lugar de pontos.
- Praticante: [FlowingData, compact ways to visualize distributions](https://flowingdata.com/2017/12/04/compact-ways-to-visualize-distributions-in-r/) (não abriu, HTTP 403): observar o foco em formas compactas para pouco espaço.
- Portal de design: nenhum barcode em portal; lacuna registrada.

---

## 24. Dot plot empilhado de Wilkinson (histograma de unidades)

**Descrição.** Histograma em que cada observação é um ponto empilhado no seu intervalo. Leland Wilkinson
formalizou o desenho; o Data Visualisation Catalogue destaca que ele mostra observações e não bins. Stephen Few,
que o chama de *dot histogram*, é frio: fora da tela ele não tem vantagem sobre o histograma comum, e na tela a
vantagem é poder apontar cada ponto. No Farol a vantagem é outra: **contar**, quando cada ponto é um negócio.

**Anatomia.** Eixo de valor com intervalos; pontos de diâmetro igual à largura do intervalo em pixels; pilhas a
partir da base; eixo Y omitido (a pilha já é a contagem) ou só com a marca do maior valor; `n` no subtítulo.

**Abordagem na stack.** `svg-puro`, porque o diâmetro depende da escala em pixels e o layout é calculado depois
de medir a largura. Para amostra pequena em card, `html-tailwind` com colunas `flex-col-reverse` de `div`
redondos resolve sem SVG.

```tsx
export function empilhar(valores: number[], largura: number, minimo = 0) {
  const nivelDoBin = new Map<number, number>()
  return [...valores].sort((a, b) => a - b).map((v) => {
    const bin = Math.floor((v - minimo) / largura)
    const nivel = nivelDoBin.get(bin) ?? 0
    nivelDoBin.set(bin, nivel + 1)
    return { v, bin, nivel, centro: minimo + (bin + 0.5) * largura }
  })
}
```

**Ponto delicado.** O algoritmo original de Wilkinson não usa grade fixa: cada pilha começa no próximo ponto
ainda não agrupado, e a posição da pilha acompanha o dado. O Farol troca por grade fixa para obedecer à regra 2
(régua igual entre filtros) e precisa dizer isso a quem comparar com o desenho clássico. Altura é o limite: a
maior pilha vezes o diâmetro tem que caber no card; o `stat_dots` do ggdist resolve escolhendo a largura do bin
automaticamente, e no Farol, onde o bin é fixo, a saída é fazer cada ponto valer mais de um caso, com a unidade
escrita ("cada ponto: 5 leads"), que é a lógica de **22_unidades-waffle-e-pictograma**.

**Versões sugeridas.**
- **V1 básica: dias até a primeira reunião.** 46 oportunidades do mês, intervalos de 2 dias.
- **V2 com destaque: desfecho no ponto.** Negócios ganhos em ponto cheio e perdidos em ponto vazado, na mesma
  pilha; forma, e não só cor, carrega o desfecho.
- **V3 densa do Farol: tentativas até a agenda.** 140 leads com valor discreto de 1 a 12 tentativas, uma pilha
  por número de tentativas, com a pilha acima de 6 tentativas destacada como fila de revisão.
- **V4 caso limite: amostra grande.** 600 leads não cabem; cada ponto vale 10 e o resto de cada pilha aparece
  como ponto parcial com rótulo, nunca arredondado em silêncio.

**Referências.**
- Catálogo: [Data Visualisation Catalogue, dot plots e unit charts](https://datavizcatalogue.com/blog/chart-snapshot-dot-plots-unit-charts/): observar a separação entre dot plot de distribuição e gráfico de unidades.
- Catálogo: [ggdist, slab + interval stats and geoms](https://mjskay.github.io/ggdist/articles/slabinterval.html): observar o `stat_dots`, que escolhe a largura do bin para as pilhas caberem.
- Praticante: [Leland Wilkinson, Dot Plots (PDF)](https://www.cs.uic.edu/~wilkinson/Publications/dotplots.pdf): observar o algoritmo de agrupamento por densidade de pontos, que difere da grade fixa.
- Praticante: [Stephen Few, The DataVis Jitterbug (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/the_datavis_jitterbug.pdf): observar a avaliação franca do dot histogram e o que ele só ganha na tela.
- Portal de design: [Dribbble, Histogram Charts for Figma](https://dribbble.com/shots/23639318-Histogram-Charts-for-Figma): observar a coleção de histogramas customizáveis para dashboard; dot plot empilhado em si não apareceu em portal.

---

## 25. Quantile dotplot

**Descrição.** Proposto por Matthew Kay, Tara Kola, Jessica Hullman e Sean Munson (CHI 2016) para mostrar a
incerteza de uma previsão em tela pequena: a distribuição vira 20 pontos, cada um um quantil igualmente provável,
empilhados como no dot plot de Wilkinson. A leitura é por contagem, e o exemplo do repositório é literal: "se
aceito perder o ônibus 2 em 20 vezes, conto 2 pontos a partir da esquerda". O resultado da busca registra que a
forma reduziu em cerca de 1,15 vez a variância das estimativas de probabilidade frente à curva de densidade.

**Anatomia.** Exatamente 20 (ou 50) pontos; eixo de valor; legenda "cada ponto: 1 em 20 desfechos"; limiar de
decisão cortando a pilha; contagem dos pontos de cada lado escrita junto do limiar.

**Abordagem na stack.** `svg-puro`, reaproveitando o `empilhar` do modelo 24 sobre os 20 quantis. Os quantis
saem das amostras do simulador de cenários com o espaçamento do repositório (de `1/k/2` a `1 - 1/k/2`).

```tsx
export function quantisPara(amostras: number[], k = 20) {
  const ord = [...amostras].sort((a, b) => a - b)
  return Array.from({ length: k }, (_, i) =>
    ord[Math.min(ord.length - 1, Math.floor(((i + 0.5) / k) * ord.length))])
}
```

**Ponto delicado.** `k` é fixo no produto inteiro: um cartão com 20 pontos e outro com 50 fazem "3 pontos"
significar coisas diferentes. Com 20 quantis as caudas abaixo de 2,5% e acima de 97,5% não aparecem, o que
precisa estar dito quando o risco de cauda for o assunto. E o texto não pode chamar ponto de "negócio": cada
ponto é um desfecho simulado, e a legenda repete isso, porque a forma é muito parecida com a do modelo 24.

**Versões sugeridas.**
- **V1 básica: receita do próximo trimestre.** 20 desfechos simulados de receita reconhecida (valores
  fictícios) com a meta cortando a pilha e a frase "14 de 20 cenários passam da meta".
- **V2 com anotação: data de fechamento.** Data provável de fechamento de uma oportunidade grande em 20 quantis
  semanais; "em 4 de 20 desfechos o fechamento fica para o ano seguinte".
- **V3 densa do Farol: cenários de orçamento de mídia.** Quatro cenários da Diretoria lado a lado, 20 pontos
  cada, mesma régua de entradas qualificadas por mês e o teto de capacidade da pré-vendas como linha.
- **V4 caso limite: previsão sem variação.** Premissa fixa gera 20 quantis iguais; a peça mostra uma pilha única
  e a nota "sem variação no modelo: conferir se a entrada é PREMISSA".

**Referências.**
- Catálogo: [Vega, quantile dot plot example](https://vega.github.io/vega/examples/quantile-dot-plot/): observar o controle de quantidade de quantis e o empilhamento automático.
- Praticante: [Kay, quantile-dotplots.md no repositório when-ish-is-my-bus](https://github.com/mjskay/when-ish-is-my-bus/blob/master/quantile-dotplots.md): observar a construção passo a passo e a regra de leitura por contagem.
- Praticante: [MU Collective, When(ish) is my bus?](https://mucollective.northwestern.edu/project/when-ish-is-my-bus): observar o contexto de uso em tela de celular e decisão cotidiana.
- Praticante: [Uncertainty displays using quantile dotplots or CDFs improve transit decision-making (PDF)](https://www.mjskay.com/papers/chi2018-uncertain-bus-decisions.pdf): observar a comparação entre dotplot e curva acumulada em decisão real.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 26. ECDF (distribuição acumulada empírica)

**Descrição.** Uma escada que sobe `1/n` a cada observação, do menor valor ao maior. Claus Wilke resume a
vantagem: ECDF e Q-Q "não exigem escolha arbitrária de parâmetro e mostram todo o dado de uma vez", sem bin e
sem banda. Ele também registra o custo: são menos intuitivas que histograma e densidade e aparecem pouco fora de
publicação técnica. A versão **descendente** ("ou mais") é a que ele chama de crítica para distribuição muito
assimétrica; em eixos log, uma lei de potência vira reta. O *quantile plot* de Stephen Few é a mesma ideia com os
eixos trocados.

**Anatomia.** Eixo X de valor; eixo Y de 0% a 100% com marcas em 25, 50 e 75; degraus finos; linhas guia no
limiar e no percentual lido, com o par rotulado no cruzamento; indicação de sentido ("até" ou "ou mais") no
título do eixo Y.

**Abordagem na stack.** `recharts-nativo`: `LineChart` com `XAxis type="number"` e `Line type="stepAfter"` sobre
os valores únicos ordenados, `dot={false}` e `ReferenceLine` nos dois eixos para a leitura.

```tsx
export function ecdf(valores: number[]) {
  const ord = [...valores].sort((a, b) => a - b)
  const n = ord.length
  const pontos = [{ valor: ord[0], pct: 0 }]
  ord.forEach((v, i) => {
    if (ord[i + 1] !== v) pontos.push({ valor: v, pct: ((i + 1) / n) * 100 })
  })
  return pontos
}
```

**Ponto delicado.** A ECDF é contínua à direita: o salto acontece **no** valor. Com `stepAfter` e o ponto
`{valor, pct}` gravado com o percentual já acumulado naquele valor, o degrau fica certo; com `stepBefore` a
curva inteira desloca um degrau e o "69% em até 30 minutos" vira mentira pequena e silenciosa. Empates precisam
ser colapsados (o `if` acima), senão aparecem degraus verticais repetidos. Com dezenas de milhares de valores, a
série é reamostrada numa grade de uns 200 quantis antes do render, com erro máximo de meio ponto percentual. E
casos ainda sem desfecho não entram: ciclo de oportunidade aberta pede o modelo 31.

**Versões sugeridas.**
- **V1 básica: SLA de primeiro contato.** Minutos até o primeiro contato, guia em 30 minutos, rótulo "69% em até
  30 min".
- **V2 com destaque: trimestre atual contra os anteriores.** Quatro ECDFs de tempo até a agenda, três em neutro e
  o trimestre corrente em `--chart-1`.
- **V3 densa do Farol: CPL "ou mais" em escala log.** ECDF descendente de 1.100 campanhas com X logarítmico, para
  responder "quantas campanhas custam R$ 400 ou mais" direto no eixo.
- **V4 caso limite: massa no zero.** Receita por oportunidade com 41% de zeros: a curva nasce em 41% no zero, e o
  salto inicial ganha rótulo próprio para não ser lido como defeito do gráfico.

**Referências.**
- Catálogo: [ggdist, slab + interval stats and geoms](https://mjskay.github.io/ggdist/articles/slabinterval.html): observar o `ccdfinterval`, CDF complementar desenhada como barra a partir da base, forma boa para "ou mais".
- Praticante: [Claus Wilke, ECDF e Q-Q plots](https://clauswilke.com/dataviz/ecdf-qq.html): observar a ECDF descendente para dado assimétrico e o alerta sobre público. O domínio estava bloqueado nesta sessão; o texto foi lido no [espelho do livro](https://f0nzie.github.io/dataviz-wilke-2020/ecdf-qq.html).
- Praticante: [Stephen Few, Distribution Displays (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf): observar o quantile plot, que elimina sobreposição ao dar a cada valor sua posição, e o custo de aprendizado que Few reconhece.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 27. Q-Q plot

**Descrição.** Quantis observados contra quantis de uma referência: uma distribuição teórica (normal, lognormal)
ou outra amostra. Pontos sobre a diagonal dizem "mesma forma"; afastamento sistemático diz onde a forma difere.
Wilke usa para "determinar em que medida os dados seguem ou não uma distribuição", e mostra no exemplo das notas
de prova como um teto de 100 pontos cria desvio artificial. A geometria é de dispersão (**09_dispersao-e-bolhas**),
mas a pergunta é de distribuição, e por isso o modelo fica aqui.

**Anatomia.** Eixo X de quantis de referência; eixo Y de quantis observados, na mesma unidade e na mesma escala;
área de plotagem quadrada; diagonal tracejada; pontos pequenos; anotação na região que desvia.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart` com `Scatter` e `ReferenceLine` com `segment` para a
diagonal. O inverso da normal é calculado em TypeScript, sem biblioteca; posições de plotagem `(i + 0.5) / n`.

```tsx
const zAprox = (p: number) => 4.91 * (p ** 0.14 - (1 - p) ** 0.14)
export function qqNormal(valores: number[]) {
  const ord = [...valores].sort((a, b) => a - b), n = ord.length
  return ord.map((v, i) => ({ teorico: zAprox((i + 0.5) / n), observado: v }))
}
```

**Ponto delicado.** A aproximação acima serve para o miolo e erra na cauda extrema; se a pergunta for de cauda, a
função precisa ser trocada por uma aproximação de maior precisão e conferida contra tabela antes de ir para o
componente. A diagonal só tem 45 graus se os dois eixos tiverem o mesmo domínio e a área for quadrada; o
`ResponsiveContainer` com `aspect={1}` resolve. Na comparação de duas amostras, os tamanhos diferem e os quantis
precisam ser interpolados na mesma grade de probabilidades, nunca emparelhados por índice.

**Versões sugeridas.**
- **V1 básica: premissa do simulador.** Ciclo de fechamento contra uma lognormal, para conferir se a premissa
  usada no simulador de cenários da Diretoria descreve o dado medido.
- **V2 com anotação: dois anos.** Q-Q de duas amostras, tempo até a agenda em 2025 contra 2026; os pontos da cauda
  acima da diagonal ganham a nota "a cauda longa ficou mais longa, o miolo não mudou".
- **V3 caso limite: métrica com teto.** Atingimento de meta limitado a 150% no sistema de origem achata o topo; a
  nota atribui o desvio ao teto, não à forma.

**Referências.**
- Catálogo: [Vega-Lite, quantile-quantile plot](https://vega.github.io/vega-lite/examples/point_quantile_quantile.html): observar a comparação lado a lado contra uniforme e normal com o transform de quantil.
- Catálogo: [Vega, quantile-quantile plot example](https://vega.github.io/vega/examples/quantile-quantile-plot/): observar a mesma peça com a escolha de distribuição de referência interativa.
- Praticante: [Claus Wilke, ECDF e Q-Q plots (espelho)](https://f0nzie.github.io/dataviz-wilke-2020/ecdf-qq.html): observar o exemplo do teto de 100 pontos e a recomendação para público técnico.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 28. Curva de Lorenz

**Descrição.** Entidades ordenadas da menor para a maior; no eixo X, a fração acumulada de entidades; no Y, a
fração acumulada do total. A diagonal é a igualdade perfeita, e quanto mais a curva se afasta dela, mais
concentrado é o total. O Our World in Data define o Gini como `A / (A + B)`, sendo A a área entre a diagonal e a
curva. O FT lista a curva acumulada na coluna Distribution como forma de mostrar desigualdade. No Farol responde
"quanto do total vem de poucos": receita por cliente, orçamento por campanha, carteira por executivo.

**Anatomia.** Área quadrada de 0% a 100% nos dois eixos; diagonal tracejada; curva sólida; área entre as duas
sombreada; uma leitura rotulada no ponto de interesse; Gini na legenda com o `n` de entidades.

**Abordagem na stack.** `recharts-nativo`: `ComposedChart` com `XAxis type="number" domain={[0, 100]}`, `Area` de
`dataKey` em par `[pctTotal, igualdade]` para sombrear a desigualdade e `Line type="linear"` para a curva.

```tsx
export function lorenz(valores: number[]) {
  const ord = valores.filter((v) => v >= 0).sort((a, b) => a - b)
  const total = ord.reduce((s, v) => s + v, 0), n = ord.length
  let acum = 0
  const pontos = [{ x: 0, pctTotal: 0, igualdade: 0 }]
  ord.forEach((v, i) => {
    acum += v
    pontos.push({ x: ((i + 1) / n) * 100, pctTotal: (acum / total) * 100, igualdade: ((i + 1) / n) * 100 })
  })
  const b2 = pontos.slice(1).reduce((s, p, i) => s + ((p.pctTotal + pontos[i].pctTotal) / 100) / n, 0)
  return { pontos, gini: 1 - b2 }
}
```

**Ponto delicado.** Valor negativo (estorno) faz a curva descer e quebra a interpretação; sai da conta e entra no
rodapé. Zero não sai: cliente sem receita no período faz parte da concentração, e tirá-lo esconde a desigualdade.
O leitor de negócio pensa de cima para baixo ("os 10% maiores fazem quanto"), mas a curva de Lorenz lê de baixo
para cima; o rótulo traduz ("os 10% maiores respondem por 52%", lido entre 90% e 100% do eixo X). Com poucas
entidades (8 executivos) a curva vira polígono de degraus grossos e o Gini fica enviesado; a peça mostra os
pontos e não publica o índice. A versão barra ordenada mais linha acumulada (Pareto) mora em
**08_combinados-e-eixo-duplo**.

**Versões sugeridas.**
- **V1 básica: concentração da receita por cliente.** Receita reconhecida do ano de 640 clientes fictícios, com o
  rótulo "10% dos clientes: 52% da receita".
- **V2 com destaque: ano anterior contra atual.** Duas curvas, a anterior em neutro, Gini de cada ano na legenda.
- **V3 densa do Farol: orçamento de mídia por campanha.** 1.100 campanhas; marcação de que 12% delas consomem 70%
  do investimento, com clique na faixa abrindo a lista.
- **V4 caso limite: estornos e zeros.** 23 lançamentos negativos fora com nota; 30% dos clientes com receita zero
  no período mantidos, e a curva corre rente ao eixo X até 30%.

**Referências.**
- Catálogo: [FT, Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a curva acumulada como forma de desigualdade na coluna Distribution.
- Praticante: [Our World in Data, what is the Gini coefficient](https://ourworldindata.org/what-is-the-gini-coefficient): observar a leitura das áreas A e B e a diagonal da igualdade.
- Praticante: [CORE Econ, Lorenz curves and Gini coefficients](https://books.core-econ.org/doing-economics/book/text/05-02.html): observar o passo a passo de construção a partir de dados ordenados.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 29. Faixa de percentis

**Descrição.** Uma linha por grupo com faixas aninhadas dos **casos**: traço fino do p10 ao p90, barra grossa do
p25 ao p75 e ponto na mediana. É o `pointinterval` do ggdist aplicado à amostra, e o resumo mais legível para
público de negócio porque dispensa o vocabulário de bigode e cerca. Quando só o resumo importa e não há
distribuição por trás, a peça mora em **17_comparacao-de-pontos**; desenhada ao longo do tempo, vira fan chart em
**05_areas**.

**Anatomia.** Eixo de valor comum a todas as linhas; por grupo, traço p10 a p90 em `--line-strong`, barra p25 a
p75 em `--chart-1`, ponto de mediana com anel da cor da superfície; legenda única ("faixa clara: 80% dos casos ·
faixa escura: metade central"); limiar como linha vertical atravessando todas as linhas; `n` à direita.

**Abordagem na stack.** `html-tailwind` para linhas compactas, com posição percentual; `recharts-custom` quando a
peça precisa de eixo e tooltip do Recharts, usando um `Bar` de par `[p10, p90]` em layout vertical e um `shape`
que desenha as duas faixas e a mediana a partir do `payload`, na mesma lógica da caixa do modelo 13.

```tsx
const pos = (v: number) => ((v - dominio[0]) / (dominio[1] - dominio[0])) * 100
function LinhaPercentis({ g }: { g: Resumo }) {
  return (
    <div className="relative h-5" aria-label={`mediana ${g.p50}, metade central de ${g.p25} a ${g.p75}`}>
      <div className="absolute top-2 h-1 rounded-sm bg-(--line-strong)"
        style={{ left: `${pos(g.p10)}%`, width: `${pos(g.p90) - pos(g.p10)}%` }} />
      <div className="absolute top-1 h-3 rounded-sm bg-(--chart-1)"
        style={{ left: `${pos(g.p25)}%`, width: `${pos(g.p75) - pos(g.p25)}%` }} />
      <div className="absolute top-0.5 size-4 -translate-x-1/2 rounded-full border-2 border-(--surface-raised) bg-(--text-strong)"
        style={{ left: `${pos(g.p50)}%` }} />
    </div>
  )
}
```

**Ponto delicado.** Percentil extremo em amostra pequena é quase o valor máximo: com `n` 12, o p90 é o segundo
maior caso. A peça exige um piso de `n` por percentil (na ordem de 20 casos para p10 e p90) e, abaixo dele,
desenha só a metade central com aviso. O erro mais caro é semântico: faixa dos casos não é margem de erro da
média, e o leitor de diretoria confunde as duas; a legenda diz "dos casos" com todas as letras. E o domínio é o
mesmo para todas as linhas, calculado no componente pai, nunca por linha.

**Versões sugeridas.**
- **V1 básica: primeiro contato por SDR.** Seis linhas, p10 a p90 de minutos até o primeiro contato.
- **V2 com destaque: parte da faixa além do SLA.** O trecho de cada faixa à direita dos 30 minutos ganha cor de
  alerta e o percentual acima do SLA aparece no fim da linha.
- **V3 densa do Farol: CPL por campanha dentro de tabela.** 24 campanhas ordenadas por mediana, a faixa de CPL
  diário numa coluna da tabela visual (ponte com **14_tabelas-visuais**).
- **V4 caso limite: cenário da Diretoria.** Faixa p10 a p90 dos desfechos simulados de receita de 2027 contra meta
  fictícia de R$ 10 mi, com o texto "faixa de cenários, não previsão pontual"; linha com `n` insuficiente mostra
  só a metade central.

**Referências.**
- Catálogo: [ggdist, slab + interval stats and geoms](https://mjskay.github.io/ggdist/articles/slabinterval.html): observar o `pointinterval` com intervalos aninhados de 66% e 95% e a espessura diferente por intervalo.
- Praticante: [Claus Wilke, visualizing uncertainty](https://clauswilke.com/dataviz/visualizing-uncertainty.html): observar a distinção entre faixa de dados e faixa de incerteza da estimativa.
- Praticante: [Stephen Few, Distribution Displays (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf): observar as definições de quartil, decil e percentil usadas para escolher os cortes.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 30. Stem and leaf (caule e folhas)

**Descrição.** Proposto por John Tukey na análise exploratória dos anos 1970: cada valor é partido em caule
(dígitos iniciais) e folha (último dígito), e as folhas enfileiradas formam um histograma deitado feito de
algarismos. A diferença para o histograma é preservar o dado original: dá para ler cada valor. É tabela com forma
de gráfico, e em produto mora perto de **14_tabelas-visuais**.

**Anatomia.** Coluna de caules alinhada à direita; divisor vertical; folhas ordenadas em fonte monoespaçada com
algarismos tabulares; **chave de leitura obrigatória** ("4 | 7 = 47 dias"); `n` e unidade da folha no rodapé.

**Abordagem na stack.** `html-tailwind`: grade de duas colunas com `font-mono tabular-nums`, folhas como texto, e
contêiner com `overflow-x-auto` para linha longa. A agregação é função pura.

```tsx
export function caulesEFolhas(valores: number[], unidadeFolha = 1) {
  const mapa = new Map<number, number[]>()
  for (const v of [...valores].sort((a, b) => a - b)) {
    const inteiro = Math.trunc(v / unidadeFolha)
    const caule = Math.trunc(inteiro / 10)
    const chave = inteiro < 0 ? caule - 1 : caule
    mapa.set(chave, [...(mapa.get(chave) ?? []), Math.abs(inteiro % 10)])
  }
  const chaves = [...mapa.keys()], lo = Math.min(...chaves), hi = Math.max(...chaves)
  return Array.from({ length: hi - lo + 1 }, (_, i) => {
    const chave = lo + i
    return { rotulo: chave < 0 ? `−${Math.abs(chave + 1)}` : String(chave), folhas: mapa.get(chave) ?? [] }
  })
}
```

**Ponto delicado.** Caule vazio precisa aparecer, igual ao bin vazio do histograma, senão o buraco some. Negativo
é a pegadinha clássica: valores de −1 a −9 têm caule "−0", que é diferente do caule "0". Em JavaScript isso
falha duas vezes: `Math.trunc` gera `-0`, `String(-0)` imprime "0", e o `Map` compara chaves por SameValueZero,
então `-0` e `0` caem **na mesma chave** e os dois caules se fundem sem erro. Por isso o código acima desloca os
caules negativos em uma posição (`chave = caule - 1`) e monta o rótulo com o sinal à mão. A unidade
da folha (arredondar ticket para R$ 1 mil, por exemplo) e a escolha entre truncar e arredondar vão para a chave.
Leitor de tela lê dígitos soltos; o bloco leva `aria-label` com o resumo e a tabela fica disponível como dado.

**Versões sugeridas.**
- **V1 básica: ciclos do semestre.** 46 ciclos de fechamento em dias, chave "4 | 7 = 47 dias".
- **V2 com destaque: negócios de um executivo.** As folhas dos negócios do executivo selecionado em cor de
  destaque e negrito, para a marca não depender só de cor.
- **V3 caso limite: variação com negativos.** Variação mensal de CPL por campanha de −38% a +61%; caules "−0" e
  "0" separados e a chave explicando a diferença.

**Referências.**
- Catálogo: [Wikipedia, stem-and-leaf display](https://en.wikipedia.org/wiki/Stem-and-leaf_display): observar as variações de caule dividido e o tratamento de negativos.
- Praticante: [Mark Bounthavong, John W. Tukey short biography](https://mbounthavong.com/blog/2020/12/16/communicating-data-effectively-with-data-visualizations-part-32-john-w-tukey-short-biography): observar o contexto da análise exploratória de onde vem a forma.
- Praticante: [Stem & Leaf Plots Extended for Text Visualizations](https://www.researchgate.net/publication/318300438_Stem_Leaf_Plots_Extended_for_Text_Visualizations): observar a extensão da forma para texto, útil para rótulos de campanha.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 31. Curva de sobrevivência (Kaplan-Meier)

**Descrição.** Proporção de casos que **ainda não** tiveram o evento ao longo do tempo, estimada sem jogar fora os
casos que ainda estão em andamento (censurados). O artigo de método da PMC descreve a curva em degraus que cai a
cada evento, as censuras marcadas com traços verticais, a tabela de número em risco abaixo do gráfico ("deve ser
reportada porque representa a informação fundamental para interpretar a curva") e a mediana lida onde a curva
cruza 50%. No Farol ela corrige o viés mais comum do ciclo de vendas: medir só as oportunidades fechadas encurta
o ciclo, porque as longas ainda estão abertas. A geometria é de linha (**04_linhas**); a pergunta é de distribuição
de tempo, e por isso fica aqui.

**Anatomia.** Eixo Y de 100% a 0% ("ainda sem decisão") ou invertido ("já decididas"); eixo X em dias; degraus;
marcas de censura como traços curtos; guia na mediana; tabela de em risco alinhada às marcas do eixo X; faixa de
confiança opcional.

**Abordagem na stack.** `recharts-custom`: `ComposedChart` com `Line type="stepAfter"` para a curva, `Scatter` com
`shape` que devolve um traço vertical para as censuras e `ReferenceLine y={50}`. A tabela de em risco é
`html-tailwind`, em grade com as mesmas margens do gráfico.

```tsx
type Caso = { dias: number; decidiu: boolean }
export function kaplanMeier(casos: Caso[]) {
  const ord = [...casos].sort((a, b) => a.dias - b.dias)
  let emRisco = ord.length, s = 1
  const curva = [{ dias: 0, s: 100 }], censuras: { dias: number; s: number }[] = []
  for (let i = 0; i < ord.length; ) {
    const t = ord[i].dias
    let eventos = 0, censurados = 0
    for (; i < ord.length && ord[i].dias === t; i++) ord[i].decidiu ? eventos++ : censurados++
    if (eventos > 0) { s *= 1 - eventos / emRisco; curva.push({ dias: t, s: s * 100 }) }
    if (censurados > 0) censuras.push({ dias: t, s: s * 100 })
    emRisco -= eventos + censurados
  }
  curva.push({ dias: ord[ord.length - 1].dias, s: s * 100 })
  return { curva, censuras }
}
```

**Ponto delicado.** O evento precisa ser escolhido com cuidado: se o evento é "ganhou" e a perda vira censura, a
curva trata o perdido como alguém que ainda pode ganhar e **infla** a chance de ganho. Perda é risco competidor;
a pergunta honesta com Kaplan-Meier é "tempo até a decisão" (ganho ou perda), e a separação entre os dois pede
incidência acumulada, fora do escopo desta família. A cauda engana: quando restam poucos em risco, um único evento
derruba a curva; a regra citada no resultado da busca é parar de reportar abaixo de 10% da amostra ou de 15
casos, e o Farol tracejou a curva daí em diante. A tabela de em risco só funciona alinhada ao eixo X, com as
mesmas margens do `ComposedChart`; qualquer diferença de padding desalinha os números das marcas.

**Versões sugeridas.**
- **V1 básica: tempo até a decisão.** 520 oportunidades de 2026, 87 ainda abertas como censura; "metade decide em
  até 58 dias".
- **V2 com destaque: duas origens.** Indicação contra mídia paga, duas curvas e a tabela de em risco com uma
  linha por origem.
- **V3 densa do Farol: primeiro contato humano.** Leads de fim de semana contra dia útil, com os leads ainda sem
  contato no momento da extração censurados, e SLA de 30 minutos como guia vertical.
- **V4 caso limite: cauda rala.** Depois dos 180 dias restam 11 oportunidades em risco; a curva segue tracejada e
  a nota diz "abaixo de 15 casos em risco a queda não é confiável".

**Referências.**
- Praticante: [PMC, Methods to analyse time-to-event data: the Kaplan-Meier survival curve](https://pmc.ncbi.nlm.nih.gov/articles/PMC8478547/): observar a marca de censura, a tabela de em risco e a leitura da mediana em 50%.
- Praticante: [numiqo, Kaplan-Meier curve explained](https://numiqo.com/tutorial/kaplan-meier-curve): observar o exemplo passo a passo da tabela de cálculo com censura entre eventos.
- Praticante: [MCP Analytics, Kaplan-Meier estimator practical guide](https://mcpanalytics.ai/articles/kaplan-meier-estimator-practical-guide-for-data-driven-decisions): observar a regra de truncar a leitura quando o grupo em risco fica pequeno.
- Catálogo e portal de design: nenhum dos catálogos gerais nem dos portais consultados traz a curva; lacuna registrada.

---

## 32. Meia-olho e intervalo em gradiente

**Descrição.** A família *slab + interval* do ggdist, pensada para distribuição de incerteza (cenários, previsões,
reamostragens), e não só para casos observados. O **meia-olho** combina uma meia densidade com ponto e intervalos
(66% e 95% por padrão); o **olho** espelha a densidade como violino; o **intervalo em gradiente** troca altura por
opacidade, e a densidade vira uma faixa que escurece onde o desfecho é mais provável. No Farol é a forma natural
dos "cenários com saída em faixa" da Diretoria.

**Anatomia.** Uma linha por cenário; meia densidade acima da linha de base (ou faixa de gradiente sem altura);
ponto da mediana; intervalo grosso de 66% e fino de 95% sobre a base; rótulos dos intervalos na primeira linha;
limiar de decisão atravessando todas as linhas.

**Abordagem na stack.** `svg-puro`: a meia densidade reaproveita o `caminhoViolino` do modelo 17 com um lado só; o
gradiente é um `<linearGradient>` com um `<stop>` por ponto da grade de densidade e `stopOpacity` proporcional à
densidade. A versão compacta pode ser `html-tailwind` com `linear-gradient` montado em string no `style`.

```tsx
function FaixaGradiente({ dens, x0, x1 }: { dens: { v: number; d: number }[]; x0: number; x1: number }) {
  const id = `grad${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const dMax = Math.max(...dens.map((p) => p.d))
  const ini = dens[0].v, span = dens[dens.length - 1].v - ini
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          {dens.map((p) => (
            <stop key={p.v} offset={(p.v - ini) / span} stopColor="var(--chart-1)" stopOpacity={p.d / dMax} />
          ))}
        </linearGradient>
      </defs>
      <rect x={x0} y={0} width={x1 - x0} height={12} rx={2} fill={`url(#${id})`} />
    </g>
  )
}
```

**Ponto delicado.** Cada instância precisa de `id` de gradiente único na página inteira, senão todos os cartões
passam a usar o primeiro gradiente definido; o `useId` do React resolve, mas devolve caracteres como dois pontos
que atrapalham a referência `url(#...)`, daí a limpeza acima. Opacidade sozinha não se lê em número: o gradiente
só vai para tela com os intervalos nomeados e com o texto do percentual acima do limiar. E a faixa é recortada no
domínio simulado; fora dele não há gradiente esmaecendo, há nada.

**Versões sugeridas.**
- **V1 básica: receita de 2027 por cenário.** Três cenários fictícios (conservador, base, expansão) em meia-olho
  com intervalos de 66% e 95%.
- **V2 com anotação: chance de bater a meta.** Meta fictícia de R$ 10 mi como linha vertical e, em cada cenário, o
  texto "base: 38% dos desfechos acima da meta".
- **V3 densa do Farol: doze cenários de orçamento.** Doze linhas de 16px em gradiente, sem altura, com ponto e
  intervalo; cabe num cartão onde doze meias densidades não caberiam.
- **V4 caso limite: distribuição cortada no teto.** Cenário em que a entrada de leads bate no teto fictício de 300
  por mês: a massa acumulada no teto aparece como barra no próprio teto, e não suavizada para depois dele.

**Referências.**
- Catálogo: [ggdist, slab + interval stats and geoms](https://mjskay.github.io/ggdist/articles/slabinterval.html): observar lado a lado meia-olho, olho, gradiente, CCDF e pontos, todos com os mesmos intervalos.
- Catálogo: [ggdist, stat_halfeye](https://mjskay.github.io/ggdist/reference/stat_halfeye.html): observar os parâmetros de largura dos intervalos e de lado da densidade.
- Praticante: [Claus Wilke, visualizing uncertainty](https://clauswilke.com/dataviz/visualizing-uncertainty.html): observar a discussão sobre como mostrar faixa de incerteza sem o leitor tomar o ponto central como certeza.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 33. Bean plot

**Descrição.** Proposto por Peter Kampstra no Journal of Statistical Software como alternativa ao box plot: cada
"feijão" é a densidade espelhada do grupo, com **um traço curto por observação** dentro da forma e uma linha na
média do grupo, mais uma linha da média geral atravessando o gráfico. O artigo destaca que bimodalidade e
**medições duplicadas** saltam aos olhos, e que dá para ver se o grupo tem observações suficientes para interessar.

**Anatomia.** Densidade espelhada com contorno leve; traços horizontais curtos por observação, com opacidade;
traço mais longo e mais forte na medida central do grupo; linha pontilhada da medida central geral; variante
assimétrica com uma metade por subgrupo.

**Abordagem na stack.** `svg-puro`: o `caminhoViolino` do modelo 17, um `<line>` por observação com largura fixa
dentro da banda e uma linha horizontal global em coordenada de valor.

**Ponto delicado.** Os traços acumulam opacidade quando coincidem, e isso é o recurso: é assim que a duplicata
aparece. Mas acima de uns 300 casos por grupo eles viram bloco e o feijão perde a forma. O original usa média;
em métrica assimétrica (ticket, ciclo) a média engana, e o Farol desenha a mediana e diz isso na legenda. A
variante assimétrica é o violino dividido do modelo 17 com traços; as duas metades precisam da mesma banda.

**Versões sugeridas.**
- **V1 básica: CPL por plataforma.** Quatro feijões com um traço por campanha e a mediana geral pontilhada.
- **V2 com destaque: ganhos contra perdidos.** Feijão assimétrico por vertical fictícia, metade esquerda com o
  ticket dos ganhos e direita com o dos perdidos.
- **V3 caso limite: duplicata suspeita.** 37 leads com exatamente 0 minuto até o primeiro contato formam um traço
  escuro na base; a nota diz "possível carimbo automático no cadastro, conferir a coleta", que é o uso de
  diagnóstico que o artigo promete.

**Referências.**
- Praticante: [Kampstra, Beanplot: a boxplot alternative for visual comparison of distributions](https://www.jstatsoft.org/article/view/v028c01): observar os componentes (traço por observação, densidade, médias) e a variante assimétrica.
- Catálogo: [CRAN, vinheta do pacote beanplot (PDF)](https://cran.r-project.org/web/packages/beanplot/vignettes/beanplot.pdf): observar os exemplos com duplicatas e bimodalidade.
- Catálogo: [statsmodels, beanplot](https://www.statsmodels.org/stable/generated/statsmodels.graphics.boxplots.beanplot.html): observar as opções de traço, média e lado.
- Portal de design: nenhum achado em portal; lacuna registrada.

---

## 34. Histograma empilhado por categoria

**Descrição.** Histograma cujas barras são divididas por grupo: a altura total é a distribuição geral e as
camadas dizem de que grupo é feito cada intervalo. Responde bem "de onde vem o volume desta faixa" e mal "qual a
forma de cada grupo", porque só a camada da base tem linha de base comum; é a mesma objeção que a pesquisa faz a
densidades empilhadas (ver "O que a pesquisa diz", item 5). Entra no catálogo porque é pedido comum em dashboard
e precisa de regra.

**Anatomia.** Intervalos encostados; camadas por grupo em ordem fixa, com o maior grupo na base; legenda com `n`
por grupo; total do intervalo no tooltip; no máximo quatro grupos.

**Abordagem na stack.** `recharts-nativo`: `BarChart` com `barCategoryGap={0}` e um `Bar` por grupo com o mesmo
`stackId`, sobre o array de bins já agregado por grupo em TypeScript.

**Ponto delicado.** A ordem das camadas é a ordem dos filhos e precisa ficar fixa entre filtros; se o filtro
mudar qual grupo é maior e a ordem acompanhar, a mesma peça muda de desenho sem mudar de dado. O tooltip padrão
lista os valores das camadas; ele precisa trazer também o total do intervalo e a participação de cada grupo nele.
Acima de quatro grupos a cor não separa mais nada e a peça passa para pequenos múltiplos (modelo 8); a versão a
100% por intervalo deixa de ser distribuição e vai para **02_barras-horizontais** ou **26_mosaico-marimekko**.

**Versões sugeridas.**
- **V1 básica: ciclo por origem.** Ciclo de fechamento em faixas de 7 dias, três origens empilhadas.
- **V2 com destaque: uma camada em foco.** Só a camada de indicação em `--chart-1` e as outras em neutro, para
  responder "em que faixas de ciclo caem os negócios de indicação".
- **V3 caso limite: grupos demais.** Com sete origens o componente recusa o empilhamento, desenha pequenos
  múltiplos e explica a troca em uma linha.

**Referências.**
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/): observar o histograma empilhado por cor ao lado das versões sobreposta e em facetas.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar a crítica ao empilhamento quando a pergunta é comparar formas (link herdado da rodada anterior deste estudo).
- Portal de design: [Dribbble, Charts UI design Figma templates: bars, histograms, line graphs](https://dribbble.com/shots/20359409-Charts-UI-design-Figma-templates-Bars-histograms-line-graphs) (não abriu): observar a biblioteca de histogramas do kit, citada no resultado da busca.

---

## 35. Desfechos hipotéticos animados (HOP)

**Descrição.** Os *hypothetical outcome plots* de Jessica Hullman e colegas trocam a faixa estática por animação:
cada quadro desenha **um** desfecho sorteado da distribuição, e o leitor sente a frequência vendo os quadros
passarem. Os resultados de busca registram duas coisas úteis: a forma ajuda observador sem treino a julgar
tendência em dado ambíguo, e melhora muito a estimativa de probabilidade conjunta, com várias variáveis ao mesmo
tempo, frente à visualização estática. Wilke lembra o limite: não existe em papel, e funciona em tela e em
apresentação oral. O gráfico de cada quadro pertence à família dele (barra, linha); a forma de mostrar a
distribuição é o que mora aqui.

**Anatomia.** Um gráfico comum redesenhado a cada 400 a 600ms com um desfecho; contador "desfecho 7 de 50"; botões
de pausar e avançar (ícones do lucide-react); limiar fixo em todos os quadros; domínio fixo; rastro opcional dos
últimos quadros em traço esmaecido.

**Abordagem na stack.** `recharts-custom`: um `BarChart` ou `LineChart` comum com `isAnimationActive={false}`, cujo
`data` troca a cada quadro por um hook de React; controles em `html-tailwind`.

```tsx
export function useQuadro(total: number, ms = 500) {
  const [i, setI] = useState(0)
  const [rodando, setRodando] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (!rodando) return
    const t = window.setInterval(() => setI((v) => (v + 1) % total), ms)
    return () => window.clearInterval(t)
  }, [rodando, total, ms])
  return { i, rodando, setRodando }
}
```

**Ponto delicado.** A animação padrão do Recharts interpola as barras entre quadros e inventa desfechos
intermediários que nunca foram sorteados; `isAnimationActive={false}` é obrigatório. O domínio do eixo é fixado
sobre todos os desfechos, senão o eixo reescala a cada quadro e a barra parece parada. A sequência de sorteios
usa semente fixa, para a mesma apresentação repetir igual. Quem pede movimento reduzido começa com a animação
pausada, e a exportação para PDF troca a peça pelo dotplot de quantis (modelo 25), porque o papel congela um
quadro qualquer e o transforma em previsão.

**Versões sugeridas.**
- **V1 básica: receita do trimestre.** 50 desfechos simulados em barra única contra a meta fictícia, contador de
  quadro visível.
- **V2 com destaque: rastro.** Os últimos 10 desfechos ficam como traços esmaecidos atrás da barra atual.
- **V3 densa do Farol: funil conjunto.** Quatro barras (entradas, agendas, oportunidades, ganhos) sorteadas juntas
  em cada quadro, mostrando que um mês fraco de entradas derruba as etapas seguintes ao mesmo tempo, coisa que
  quatro intervalos independentes não mostram.
- **V4 caso limite: exportação e movimento reduzido.** No PDF e com `prefers-reduced-motion`, a peça vira dotplot
  de quantis com nota "versão estática dos 50 desfechos".

**Referências.**
- Praticante: [Jessica Hullman, página de pesquisa](https://users.eecs.northwestern.edu/~jhullman/research.html): observar a linha de trabalho sobre incerteza e os artigos de HOP.
- Praticante: [Hypothetical Outcome Plots Help Untrained Observers Judge Trends in Ambiguous Data (PubMed)](https://pubmed.ncbi.nlm.nih.gov/30136961/): observar o experimento com público sem treino.
- Praticante: [Claus Wilke, visualizing uncertainty](https://clauswilke.com/dataviz/visualizing-uncertainty.html): observar o limite de meio (tela e apresentação sim, papel não).
- Praticante: [Towards Data Science, uncertainty visualization made easy with HOPs](https://towardsdatascience.com/uncertainty-visualization-made-easy-with-hypothetical-outcome-plots-89558574d069/): observar exemplos em GIF e a cadência dos quadros.
- Catálogo e portal de design: nenhum achado; lacuna registrada.

---

## 36. Wheat plot (strip com jitter ordenado)

**Descrição.** Proposta de Stephen Few (2017) para consertar o jitter. Os pontos são agrupados em intervalos como
num histograma, mas dentro de cada intervalo são ordenados do menor ao maior e cada um fica **no seu valor
exato** no eixo; a pilha sai inclinada, e essa inclinação mostra como os valores se distribuem dentro do
intervalo. Few diz que o desenho estranha à primeira vista e "leva só um minuto" para aprender, e que o nome vem
das fileiras de trigo curvadas pelo vento. Junta o histograma e o strip: forma e valor de cada caso.

**Anatomia.** Eixo de valor com marcas nos limites dos intervalos; pontos com posição horizontal exata; altura
dada pela ordem dentro do intervalo; pontos vazados quando falta espaço; mediana e limiar marcados; nota de
leitura na primeira aparição.

**Abordagem na stack.** `recharts-custom`: `ScatterChart` com `XAxis type="number"` no valor exato e `YAxis`
oculto na ordem dentro do intervalo, calculada em TypeScript. O Recharts desenha; a geometria é só a atribuição de
nível.

```tsx
export function wheat(obs: { id: string; v: number }[], largura: number, minimo = 0) {
  const nivelDoBin = new Map<number, number>()
  return [...obs].sort((a, b) => a.v - b.v || a.id.localeCompare(b.id)).map((o) => {
    const bin = Math.floor((o.v - minimo) / largura)
    const nivel = nivelDoBin.get(bin) ?? 0
    nivelDoBin.set(bin, nivel + 1)
    return { ...o, bin, nivel }
  })
}
```

**Ponto delicado.** O espaçamento vertical (altura do plot dividida pelo maior nível) precisa ser pelo menos o
diâmetro do ponto; se não for, Few propõe duas saídas, nesta ordem: pontos vazados, que se sobrepõem um pouco e
continuam visíveis, e pontos menores. Passado esse limite, ele volta para o strip comum com transparência. O
desempate por `id` na ordenação mantém o desenho estável entre renders. E o domínio do `YAxis` oculto é fixado
em `[0, maiorNivel]` sobre todos os grupos, senão dois wheat plots lado a lado ficam com espaçamentos diferentes.

**Versões sugeridas.**
- **V1 básica: dias até a primeira reunião.** 46 oportunidades do mês, intervalos de 5 dias.
- **V2 com anotação: o buraco.** O mesmo gráfico com a lacuna entre 13 e 15 dias anotada ("nenhuma reunião
  marcada nessa faixa: semana de feriado"), o tipo de achado que Few mostra no artigo.
- **V3 densa do Farol: primeiro contato.** 180 leads de uma semana, minutos até o contato, pontos vazados e SLA
  como linha vertical.
- **V4 caso limite: volume demais.** 900 leads no mês; o componente cai para strip com transparência, como o
  próprio Few recomenda, e diz por quê.

**Referências.**
- Praticante: [Stephen Few, The DataVis Jitterbug: Let's Improve an Old Dance (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/the_datavis_jitterbug.pdf): observar a sequência strip, strip com jitter, dot histogram e wheat plot sobre o mesmo dado, e as saídas para falta de espaço.
- Praticante: [Stephen Few, Distribution Displays (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf): observar o strip com transparência como base de comparação.
- Catálogo e portal de design: nenhum catálogo nem portal consultado lista o wheat plot; lacuna registrada.

---

## Resumo por abordagem na stack

| Abordagem | Modelos |
|---|---|
| `recharts-nativo` | 4 polígono de frequência · 6 histogramas sobrepostos · 10 densidade · 11 densidades sobrepostas · 21 strip sem jitter · 26 ECDF · 27 Q-Q · 28 Lorenz · 34 histograma empilhado |
| `recharts-custom` | 1 histograma · 2 com estatística · 3 acumulado · 5 com densidade · 7 espelhado · 13 box · 14 entalhe e largura · 16 box com jitter · 20 sina · 31 Kaplan-Meier · 35 HOP · 36 wheat |
| `svg-puro` | 9 faixa de densidade em cor · 12 ridgeline · 15 letter-value · 17 violino · 18 violino com marcadores · 19 raincloud · 22 beeswarm · 23 barcode · 24 dot plot de Wilkinson · 25 quantile dotplot · 32 meia-olho e gradiente · 33 bean plot |
| `html-tailwind` | 8 pequenos múltiplos (grade) · 29 faixa de percentis · 30 stem and leaf |

**Funções puras que a família compartilha**, candidatas a um único módulo de agregação (nome sugerido
`distribuicao.ts`): `binar` (1), `acumular` (3), `densidadeGauss` (5), `bandaSilverman` (10), `resumoBox` (13),
`ruido` (16), `caminhoViolino` (17), `dodge` (22), `empilhar` (24), `quantisPara` (25), `ecdf` (26), `qqNormal`
(27), `lorenz` (28), `caulesEFolhas` (30), `kaplanMeier` (31), `wheat` (36) e o hook `useQuadro` (35). Nenhuma
depende de biblioteca; todas recebem números e devolvem arrays prontos para o Recharts ou para SVG.

**Modelos que moram melhor em outra família** (a geometria fica aqui, a peça vai para lá): barcode dentro de card
em **24_microvisuais-sparklines**; stem and leaf e faixa de percentis em linha de tabela em **14_tabelas-visuais**;
Q-Q como dispersão em **09_dispersao-e-bolhas**; Pareto (barra mais acumulada) em **08_combinados-e-eixo-duplo**;
faixa de percentis ao longo do tempo em **05_areas**; resumo sem forma em **17_comparacao-de-pontos**; dot plot com
ponto valendo várias unidades em **22_unidades-waffle-e-pictograma**; faixa de densidade com duas dimensões
categóricas em **15_mapa-de-calor-e-calendario**.

## Limites desta rodada, ditos às claras

- **Continuação.** Os modelos 1 a 12 vieram de uma rodada anterior do mesmo dia e foram mantidos como estavam;
  os links deles não foram reabertos nesta rodada e estão marcados como herdados na lista de fontes.
- **Cotas.** As 25 aberturas de página permitidas foram usadas, e a cota de buscas da sessão esgotou no meio
  desta rodada. Os modelos 23 a 36 foram escritos só com o que já tinha sido lido ou buscado.
- **Páginas que não abriram.** `clauswilke.com` bloqueado pela rede (o capítulo de ECDF foi lido num espelho do
  livro); Observable Plot com HTTP 429 duas vezes; FlowingData e Data Viz Project com HTTP 403; o shot do Dribbble
  veio vazio; From Data to Viz abriu truncado.
- **Afirmações vindas só do resultado da busca**, sem leitura da fonte primária: a redução de cerca de 1,15 vez
  na variância com quantile dotplot, os achados de HOP sobre tendência e probabilidade conjunta, a regra de
  truncar Kaplan-Meier abaixo de 10% ou 15 casos e a fórmula do entalhe do ggplot2.
- **Portais de design.** Distribuição quase não aparece em Behance e Dribbble; 14 dos 36 modelos ficaram sem
  referência de portal, o que confirma a varredura irmã em `00_portais-de-design.md`.
- **Tipos do Recharts.** Os nomes de tipo usados nos exemplos (`BarShapeProps`, `ScatterShapeProps`) e a
  exportação exata dos hooks de layout precisam ser conferidos na 3.10 instalada antes de virar código; o
  comportamento citado do exemplo Box Plot (par `[q1, q3]` e bigode medido a partir de Q3) foi conferido na
  página oficial.
- **Aproximações numéricas.** O inverso da normal do modelo 27 e a regra de níveis do modelo 15 são pontos de
  partida que precisam de teste contra tabela e contra o artigo antes de ir para produção.

## Fontes consultadas

Marcas: **[aberto]** página lida nesta rodada; **[PDF]** PDF baixado e com texto extraído localmente; **[busca]**
endereço que apareceu literalmente num resultado de busca desta rodada, sem abertura; **(não abriu)** tentativa
de abertura sem conteúdo; **[herdado]** link dos modelos 1 a 12, da rodada anterior, não reaberto nesta.

**Catálogos e galerias**
- [aberto] https://recharts.github.io/en-US/examples/BoxPlot/ · Recharts, exemplo Box Plot.
- [aberto] https://datavizcatalogue.com/blog/chart-snapshot-beeswarm-plot/ · Data Visualisation Catalogue, beeswarm.
- [aberto] https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/ · Data Visualisation Catalogue, strip e barcode.
- [aberto] https://mjskay.github.io/ggdist/articles/slabinterval.html · ggdist, família slab e intervalo.
- [aberto] https://ggforce.data-imaginist.com/reference/geom_sina.html · ggforce, sina plot.
- [aberto] https://www.amcharts.com/demos/beeswarm/ · amCharts, beeswarm.
- [aberto] https://www.react-graph-gallery.com/beeswarm · React Graph Gallery, beeswarm (página com pouco detalhe técnico; não citada nos modelos).
- (não abriu) https://observablehq.com/plot/transforms/dodge · Observable Plot, dodge (HTTP 429).
- (não abriu) https://datavizproject.com/data-type/violin-plot/ · Data Viz Project, violino (HTTP 403).
- [busca] https://datavizproject.com/data-type/beeswarm-blot/ · Data Viz Project, beeswarm.
- [busca] https://datavizcatalogue.com/methods/violin_plot.html · Data Visualisation Catalogue, violino.
- [busca] https://datavizcatalogue.com/blog/chart-snapshot-dot-plots-unit-charts/ · Data Visualisation Catalogue, dot plots.
- [busca] https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary · FT Visual Vocabulary.
- [busca] https://journalismcourses.org/wp-content/uploads/2020/07/Visual-vocabulary.pdf · pôster do FT Visual Vocabulary.
- [busca] https://www.ag-grid.com/charts/gallery/multiple-box-plots/ · AG Charts, box plot múltiplo.
- [busca] https://www.highcharts.com/demo/box-plot/dark-unica · Highcharts, box plot em tema escuro.
- [busca] https://ggplot2.tidyverse.org/reference/geom_boxplot.html · ggplot2, box plot com entalhe.
- [busca] https://archive.linux.duke.edu/cran/web/packages/lvplot/index.html · pacote lvplot.
- [busca] https://www.react-graph-gallery.com/example/boxplot-jitter · React Graph Gallery, box com jitter.
- [busca] https://www.react-graph-gallery.com/violin-plot · React Graph Gallery, violino.
- [busca] https://r-graph-gallery.com/96-boxplot-with-jitter.html · R Graph Gallery, box com jitter.
- [busca] https://python-graph-gallery.com/502-violinplot-and-swarmplot/ · Python Graph Gallery, violino com beeswarm.
- [busca] https://helpcenter.flourish.studio/hc/en-us/articles/9859136207759-How-to-make-box-violin-and-beeswarm-scatter-plots · Flourish, box, violino e beeswarm.
- [busca] https://data.europa.eu/apps/data-visualisation-guide/univariate-scatter-plots-and-strip-plots · guia de visualização da UE.
- [busca] https://vega.github.io/vega/examples/quantile-dot-plot/ · Vega, quantile dot plot.
- [busca] https://vega.github.io/vega-lite/examples/point_quantile_quantile.html · Vega-Lite, Q-Q.
- [busca] https://vega.github.io/vega/examples/quantile-quantile-plot/ · Vega, Q-Q.
- [busca] https://vega.github.io/vega-lite/examples/ · Vega-Lite, galeria (também citada nos modelos 8 e 34).
- [busca] https://mjskay.github.io/ggdist/reference/stat_halfeye.html · ggdist, meia-olho.
- [busca] https://cran.r-project.org/web/packages/beanplot/vignettes/beanplot.pdf · vinheta do beanplot.
- [busca] https://www.statsmodels.org/stable/generated/statsmodels.graphics.boxplots.beanplot.html · statsmodels, beanplot.
- [busca] https://en.wikipedia.org/wiki/Stem-and-leaf_display · stem and leaf.
- [herdado] https://observablehq.com/plot/transforms/bin · https://raw.githubusercontent.com/observablehq/plot/main/docs/transforms/bin.md · https://www.highcharts.com/demo/ios/histogram · https://vega.github.io/vega-lite/examples/histogram.html · https://vega.github.io/vega-lite/examples/layer_cumulative_histogram.html · https://vega.github.io/vega-lite/examples/histogram_rel_freq.html · https://vega.github.io/vega-lite/examples/area_density.html · https://vega.github.io/vega-lite/examples/area_density_stacked.html · https://vega.github.io/vega-lite/examples/bar_binned_data.html · https://vega.github.io/vega-lite/examples/rect_binned_heatmap.html · http://datavizcatalogue.com/methods/box_plot.html

**Praticantes e pesquisa**
- [aberto] https://nightingaledvs.com/ive-stopped-using-box-plots-should-you/ · Nightingale, contra o box plot.
- [aberto] https://old.observablehq.com/blog/five-underused-charts-for-richer-dashboards · Observable, beeswarm em dashboard.
- [PDF] https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf · Stephen Few, Distribution Displays.
- [PDF] https://www.perceptualedge.com/articles/visual_business_intelligence/the_datavis_jitterbug.pdf · Stephen Few, The DataVis Jitterbug.
- [aberto] https://vita.had.co.nz/papers/letter-value-plot.html · Hofmann, Wickham e Kafadar, letter-value plots.
- [aberto] https://github.com/mjskay/when-ish-is-my-bus/blob/master/quantile-dotplots.md · Kay, quantile dotplots.
- [aberto] https://f0nzie.github.io/dataviz-wilke-2020/ecdf-qq.html · Wilke, ECDF e Q-Q (espelho do livro).
- [aberto] https://ourworldindata.org/what-is-the-gini-coefficient · Our World in Data, Gini e Lorenz.
- [aberto] https://www.jstatsoft.org/article/view/v028c01 · Kampstra, beanplot.
- [aberto] https://pmc.ncbi.nlm.nih.gov/articles/PMC8478547/ · PMC, curva de Kaplan-Meier.
- [aberto, truncado] https://www.data-to-viz.com/caveat/boxplot.html · From Data to Viz, armadilhas do box plot.
- (não abriu) https://clauswilke.com/dataviz/ecdf-qq.html · Wilke, ECDF e Q-Q (domínio bloqueado; lido no espelho).
- (não abriu) https://flowingdata.com/2017/12/04/compact-ways-to-visualize-distributions-in-r/ · FlowingData, distribuições compactas (HTTP 403).
- [busca] https://clauswilke.com/dataviz/boxplots-violins.html · Wilke, muitas distribuições.
- [busca] https://clauswilke.com/dataviz/visualizing-uncertainty.html · Wilke, incerteza.
- [busca] https://vita.had.co.nz/papers/boxplots.pdf · Wickham e Stryjewski, 40 anos de box plot.
- [busca] https://ora.ox.ac.uk/objects/uuid:e870716e-0be2-4f7c-9e9f-a05f4aa0dd47 · Allen e colegas, raincloud.
- [busca] https://github.com/RainCloudPlots/RainCloudPlots · repositório raincloud.
- [busca] https://mzuer.github.io/blog/2020/05/30/r-sinaplot · sina plot na prática.
- [busca] https://r-statistics.co/Violin-Plot-in-R.html · violino e mini box.
- [busca] https://mode.com/blog/violin-plot-examples/ · violino para público de negócio.
- [busca] https://www.cs.uic.edu/~wilkinson/Publications/dotplots.pdf · Wilkinson, dot plots.
- [busca] https://mucollective.northwestern.edu/project/when-ish-is-my-bus · MU Collective, projeto do ônibus.
- [busca] https://www.mjskay.com/papers/chi2018-uncertain-bus-decisions.pdf · Kay e colegas, CHI 2018.
- [busca] https://books.core-econ.org/doing-economics/book/text/05-02.html · CORE Econ, Lorenz e Gini.
- [busca] https://mbounthavong.com/blog/2020/12/16/communicating-data-effectively-with-data-visualizations-part-32-john-w-tukey-short-biography · biografia de Tukey.
- [busca] https://www.researchgate.net/publication/318300438_Stem_Leaf_Plots_Extended_for_Text_Visualizations · stem and leaf para texto.
- [busca] https://numiqo.com/tutorial/kaplan-meier-curve · tutorial de Kaplan-Meier.
- [busca] https://mcpanalytics.ai/articles/kaplan-meier-estimator-practical-guide-for-data-driven-decisions · guia prático de Kaplan-Meier.
- [busca] https://users.eecs.northwestern.edu/~jhullman/research.html · Hullman, pesquisa sobre incerteza.
- [busca] https://pubmed.ncbi.nlm.nih.gov/30136961/ · HOPs e julgamento de tendência.
- [busca] https://towardsdatascience.com/uncertainty-visualization-made-easy-with-hypothetical-outcome-plots-89558574d069/ · HOPs com exemplos.
- [busca] https://www.data-to-viz.com/graph/violin.html · From Data to Viz, violino (citado no modelo 4).
- [herdado] https://www.datawrapper.de/academy/histogram-min-max-median-mean · https://clauswilke.com/dataviz/histograms-density-plots.html · https://www.data-to-viz.com/graph/ridgeline.html

**Portais de design e kits**
- (não abriu) https://dribbble.com/shots/4615955-Box-Plot-with-Whiskers · Dribbble, box plot com bigodes (página veio vazia).
- [busca] https://dribbble.com/shots/13988553-Distribution-Chart-Ui-design-Figma-templates-kit · Dribbble, kit de distribuição.
- [busca] https://dribbble.com/shots/23639318-Histogram-Charts-for-Figma · Dribbble, histogramas para Figma.
- [busca] https://dribbble.com/shots/20359409-Charts-UI-design-Figma-templates-Bars-histograms-line-graphs · Dribbble, biblioteca de gráficos (não abriu na varredura irmã).
- [busca] https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit · Figma Community, r19 Data Visualization Kit.
- [busca] https://www.antforfigma.com/ant-design-charts-for-figma · kit de gráficos estatísticos para Figma.
- [herdado] https://setproduct.com/charts/patterns/distribution · https://www.behance.net/gallery/67155393/Figma-Charts-Kit-Dashboard-templates-design-system · https://www.behance.net/gallery/70284157/Charts-Infographics-Data-design-in-Figma · https://www.behance.net/gallery/129162191/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-P1 · https://www.behance.net/gallery/248974775/Sales-Analytics-B2B-Dashboard-UIUX · https://www.behance.net/gallery/171554797/Data-screen-Regional-business-monitoring · https://www.behance.net/gallery/93727935/Advanced-SaaS-Analytics-Dashboards-KPI-UIUX-Set-01 · https://www.behance.net/gallery/204349647/Web-app-to-optimize-energy-distribution
