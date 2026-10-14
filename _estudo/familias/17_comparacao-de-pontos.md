# Família 17: comparação de pontos

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa ou empresa real.

## O que a família responde

Esta é a família que troca **área por posição**. Em vez de encher uma barra do zero até o valor, ela marca o
valor com um ponto e deixa o resto do espaço livre. O ganho é duplo: cabe muito mais categoria na mesma altura
de cartão, e a escala não precisa começar em zero, porque a codificação é posição sobre um eixo comum e não
comprimento a partir de uma origem. William Cleveland propôs o dot plot exatamente como substituto do gráfico de
barras, e o argumento que ficou é o do Data Visualisation Catalogue: "menos poluição visual, sem necessidade de
começar do zero, comparação de valores e identificação de padrão mais fáceis".

Quando o ponto aparece **duas vezes na mesma linha**, a família muda de pergunta: deixa de ser "quanto" e passa
a ser "quanto mudou" ou "qual a distância entre os dois". É o dumbbell, o arrow plot, o range plot e o slope
chart. O FT Visual Vocabulary distribui essas formas entre *Ranking* (dot strip plot, slope, lollipop),
*Distribution* (dot plot, dot strip plot) e *Magnitude* (lollipop), o que já avisa uma coisa importante: o mesmo
desenho serve a perguntas diferentes conforme o que vai no eixo e como as linhas são ordenadas.

Perguntas típicas no Farol:

- **Comercial:** qual o ticket médio por executivo, com 14 executivos no mesmo cartão? O ciclo de venda encurtou
  entre o primeiro e o segundo semestre, por segmento? Quais motivos de perda cresceram e quais caíram entre dois
  trimestres? Onde cada executivo está entre a meta e o realizado? O forecast de cada negócio cabe na faixa
  pessimista e otimista?
- **Pré-vendas:** o SLA de primeiro contato melhorou entre a semana passada e esta, por SDR? Qual a carga atual
  de cada fila contra o teto declarado? Quantas agendas por SDR, ordenadas, sem gastar meia tela com barras?
- **Marketing:** o CPL de cada campanha mudou quanto do mês passado para este? Qual a distância entre o CPL bruto
  e o CPL qualificado por origem, que é a pergunta real do orçamento? Como as plataformas se posicionam num
  ranking que muda todo mês?
- **Diretoria:** o custo por unidade entregue de cada área, nas três camadas? A participação de mercado subiu ou
  desceu em cada perímetro? O cenário de 2027 entrega uma faixa por linha de receita, com o ponto central
  marcado? Quem ocupou qual posição no ranking em cada trimestre?

Fronteiras com outras famílias, para não duplicar catálogo:

- **Magnitude a partir do zero, com poucas categorias e leitura de "quantas vezes maior":** é **02** ou **03**.
  Barra vence quando a comparação é de razão, porque comprimento a partir da origem sustenta razão e posição não.
- **A forma da distribuição importa** (dois picos, cauda, onde está o grosso): é **16_distribuicao**. Aqui só
  entra o resumo por categoria, um ponto ou dois, sem o corpo da distribuição.
- **Duas medidas quantitativas cruzadas num plano:** é **09_dispersao-e-bolhas**. Aqui um dos eixos é sempre
  categórico (ou tempo com dois momentos discretos).
- **Ponto contra meta com faixa qualitativa de fundo** (bullet de Few): é **13_progresso-meta-e-gauge**; aqui
  fica a variante sem faixa qualitativa.
- **Uma série contínua no tempo com muitos pontos:** é **04_linhas**. O slope chart existe justamente porque só
  há dois momentos e o meio não foi medido.
- **Ponto dentro de célula de tabela** (coluna de comparação numa lista ordenável): é **14_tabelas-visuais**
  usando a geometria daqui.
- **Microdot dentro de célula estreita:** é **24_microvisuais-sparklines**.

## O que a pesquisa diz, antes de desenhar

1. **O ponto existe para dispensar o zero.** O argumento de Cleveland, repetido pelo Data Visualisation
   Catalogue e por Stephen Few, é que no dot plot "os pontos não estão mais conectados à linha de base, então
   não estamos mais julgando comprimento": a escala pode começar onde o dado começa sem enganar ninguém. Numa
   barra, o olho lê a distância até a base mesmo quando a base não significa nada.
2. **Acima de ~12 categorias, barra já perdeu.** Few sugere o dot plot justamente quando passam de doze barras;
   a mesma regra aparece em Storytelling with Data como teto para barras. Este é o caso mais comum do Farol:
   14 executivos, 22 campanhas, 18 motivos de perda.
3. **Mas o dot plot é desconhecido, e isso é um custo real.** Nick Desbarats mediu em oficina: entre 0% e 10%
   dos participantes reconhecem o tipo de gráfico. Ele lista cinco causas de confusão: leitura como dispersão,
   dúvida sobre por que o ponto substituiu a barra, ponto redondo que não indica a direção da medida, linha de
   grade da categoria imitando grade quantitativa e leitura de série temporal na versão vertical. As correções
   propostas: marca direcional (pipe ou barra esmaecida) no lugar do círculo, tirar a grade da categoria e
   acrescentar guia quantitativa perpendicular.
4. **Novidade não vence familiaridade.** No teste de Cole Nussbaumer Knaflic entre dot plot, slopechart e barra,
   a plateia escolheu a barra, e a conclusão publicada foi "simples muitas vezes vence sexy". Isso não mata a
   família; define onde ela ganha: densidade alta, escala sem zero e comparação de distância.
5. **Dot plot, range plot e arrow plot respondem perguntas diferentes.** A Datawrapper separa os três por
   ênfase: dot plot quando importam os valores, range plot quando "a distância entre os valores importa mais
   que os valores" e arrow plot quando importa a **mudança**. No arrow plot a seta sempre aponta da data mais
   antiga para a mais recente, o que resolve a ambiguidade de qual ponta é o começo.
6. **Máximo de três pontos por linha.** A Datawrapper é explícita: "quanto mais pontos você tem nas linhas, mais
   difícil fica de ler", e recomenda no máximo três. Acima disso o desenho vira linha, e linha é família 04.
7. **Slopegraph é forma de antes e depois.** Tufte publicou o formato em 1983 como *table-graphic*; Andy Kirk
   resume a aplicação típica como "história de antes e depois". O defeito conhecido é o cruzamento: "a leitura
   fica difícil quando o número de retas que se cruzam aumenta". Tufte mesmo escreve que tabela e slopegraph são
   "colegas na explicação, não concorrentes".
8. **Ordenar é metade do trabalho.** A ordem da lista é a codificação mais forte de uma comparação de pontos. A
   Datawrapper documenta ordenar arrow plot por valor inicial, valor final, diferença absoluta ou diferença em
   pontos percentuais; cada ordenação conta uma história diferente com o mesmo dado.
9. **O dot strip plot é a forma mais econômica de ranking.** Pela definição do FT, "pontos colocados em ordem
   numa tira são um método econômico de dispor ranks em várias categorias". Serve de ranking e de distribuição
   ao mesmo tempo, e o defeito é empilhamento de valores iguais.
10. **Lollipop é meio-termo com custo.** O FT registra que "lollipops chamam mais atenção para o valor do dado
    que barra ou coluna padrão". O custo está documentado nos guias de prática: quando duas hastes têm
    comprimento parecido e a lista não está ordenada, comparar dois lollipops é mais difícil que comparar duas
    barras, porque o disco na ponta ocupa espaço fora do valor.
11. **A cabeça do lollipop mente um pouco.** O centro do círculo é o valor; a borda passa dele. Em lista
    ordenada com valores próximos, dois círculos de raio 5px se tocam quando a diferença real é menor que 10px
    de escala, o que sugere empate onde não há.
12. **Comparar distância exige eixo comum.** Todos os modelos da família dependem de um eixo quantitativo único
    compartilhado por todas as linhas. Faceta com domínio próprio por painel destrói a comparação e é o erro
    silencioso mais frequente do grupo.
13. **A diferença de precisão entre barra, lollipop e dot plot é pequena.** No experimento da 3iap com 141
    participantes, o dot plot errou significativamente menos nas perguntas numéricas, mas só "~1% mais preciso em
    média"; o lollipop foi respondido mais rápido que o dot plot, com o mais rápido "~1 segundo" à frente do mais
    lento. Dentro da família, a escolha se decide por densidade, escala e reconhecimento, não por ganho de acurácia.

## Regras do Farol para esta família

1. **Ordem declarada, nunca alfabética por acidente.** Toda peça diz no subtítulo por que está nessa ordem
   ("ordenado por diferença", "ordenado pelo valor de agosto"). Alfabética só quando o leitor procura um nome.
2. **Eixo comum, domínio explícito.** `domain` vem do registry da métrica e não muda com o filtro; se mudar,
   o gráfico avisa. Faceta e pequenos múltiplos herdam o mesmo domínio.
3. **Dot plot sem grade de categoria.** Seguindo Desbarats, até ~8 categorias não há linha por categoria. A partir
   daí entra uma guia que não se confunde com escala: faixa larga e clara por linha (zebra em `--surface-raised`)
   ou separador fino **entre** linhas (`--line-subtle`, 1px), nunca uma reta passando pelo centro do ponto. A grade
   quantitativa fica perpendicular à medida e pode ser mais visível que a guia, porque ajuda a estimar valor.
4. **Dois pontos ligados sempre têm legenda de ponta.** Quem é o antes e quem é o depois aparece como legenda
   com a mesma forma do marcador, e o primeiro item do cartão traz rótulo direto nas duas pontas.
5. **Direção codificada duas vezes.** Cor de subida e de descida é redundância, não informação única: a seta,
   a ordem ou o sinal no rótulo do delta precisam dizer a mesma coisa sem cor.
6. **Polaridade declarada.** "Subiu" não é "melhorou". Cada métrica no registry carrega `melhorQuando: 'maior'`
   ou `'menor'`; o CPL que cai é verde, o SLA em minutos que cai é verde, a receita que cai é vermelha.
7. **Ponto ausente não vira zero, e não vira ponto.** Categoria sem valor no período fica na lista com o ponto
   vazado (`fill` transparente, `stroke` em `--line-strong`) e o tooltip diz "sem dado no período". Dumbbell com
   só uma ponta medida vira ponto solto sem conector, jamais um conector que desce até zero.
8. **Rótulo direto no delta, não nos dois valores.** Em dumbbell e slope, o número que o leitor quer é a
   diferença. Os dois valores vão no tooltip; o delta vai no gráfico, com sinal.
9. **Teto de linhas por cartão.** Até 12 linhas no cartão pequeno, até 25 no cartão largo, acima disso lista
   rolável com cabeçalho fixo do eixo (a régua tem que ficar visível enquanto rola).
10. **Alvo de clique maior que o ponto.** A área sensível de cada linha é a faixa inteira, altura da banda; o
    ponto tem 5 a 7px de raio e o alvo tem 24px de altura no mínimo.
11. **Toda peça da família tem tabela irmã.** O slopegraph e o dumbbell vivem ao lado de uma tabela com os dois
    valores e o delta; é a recomendação de Tufte aplicada ao produto e resolve o custo de familiaridade.

## Base de implementação no Recharts 3.10

O Recharts não tem componente de dot plot, dumbbell, lollipop, arrow plot nem slope chart. A biblioteca oficial
do shadcn/ui também não: a galeria cobre área, barra, linha, pizza, radar e radial. Ou seja, **esta família
inteira é construída**, e há três rotas, em ordem de robustez:

**Rota A, barra de faixa com `shape` própria (a mais usada aqui).** `Bar` aceita `dataKey` que devolve um par
`[baixo, alto]`, e a `shape` recebe `x`, `y`, `width`, `height` já calculados. Com `layout="vertical"` no
`ComposedChart`, uma linha de dumbbell, arrow ou range é um `Bar` só cuja `shape` desenha o conector e as duas
cabeças. Vantagem decisiva: a geometria vem pronta do Recharts, escala, domínio, banda da categoria e animação
inclusos; e o par cruza o zero sem truque de série transparente empilhada.

**Rota B, `Scatter` com eixo de categoria.** `ScatterChart` com `YAxis type="category" dataKey="nome"` e
`XAxis type="number"` entrega o dot plot de Cleveland quase de graça, com `Scatter` por série. `Scatter` aceita
`shape` como string predefinida (`circle`, `cross`, `diamond`, `square`, `star`, `triangle`, `wye`), como
`ReactElement` ou como função; `line` liga os pontos e `lineType="joint"` os conecta na ordem do dado. Testar no
build o comportamento do eixo de categoria com `Scatter`, porque é o ponto da API que mais muda entre versões.

**Rota C, SVG puro em componente filho.** Desde o Recharts 3 "o gráfico renderiza filhos arbitrários": um
componente próprio entra ao lado de `Bar` e `XAxis` sem o antigo `Customized`, e os hooks `usePlotArea`,
`useChartWidth`, `useChartHeight`, `useMargin` e `useOffset` dizem onde está a área de desenho. Para slopegraph
com resolução de colisão de rótulo, é mais simples abandonar o Recharts e desenhar o `<svg>` inteiro com
geometria calculada em TypeScript; são duas colunas e retas, não há nada a reaproveitar.

Peças auxiliares que a família usa muito:

- `ErrorBar` como filho de `Bar`, `Line` ou `Scatter`; `direction="x"` dá barra horizontal. **Cuidado:** os
  valores são **distâncias relativas ao ponto**, não limites absolutos. Valor 10 com erro 2 desenha de 8 a 12.
  Para faixa com limites absolutos, converter antes: `[valor - min, max - valor]`.
- `ReferenceLine` para a meta, a mediana ou o teto; `ReferenceArea` para a banda aceitável.
- `LabelList` com `content` para o rótulo do delta; o `content` é chamado uma vez por item e recebe a geometria.
- `Cell` está deprecado no Recharts 3; cor por item vai na `shape`.
- Tokens: ponta inicial `var(--chart-3)`, ponta final `var(--chart-1)`, conector `var(--line-strong)`, destaque
  `var(--chart-2)`, alerta `var(--negativo)`, sucesso `var(--positivo)`, grade `var(--line-subtle)`.

Utilitários comuns aos modelos com dois pontos:

```ts
export type ParCategoria = {
  id: string;
  categoria: string;
  inicio: number | null;
  fim: number | null;
};

export type Polaridade = 'maior' | 'menor';

export type LinhaComparada = ParCategoria & {
  delta: number | null;
  deltaPct: number | null;
  faixa: [number, number] | null;  // sempre [menor, maior], para a barra de faixa
  sentido: 'subiu' | 'desceu' | 'igual' | 'incompleto';
  bom: boolean | null;             // polaridade já aplicada
};

export function compararPar(p: ParCategoria, polaridade: Polaridade): LinhaComparada {
  if (p.inicio == null || p.fim == null) {
    return { ...p, delta: null, deltaPct: null, faixa: null, sentido: 'incompleto', bom: null };
  }
  const delta = p.fim - p.inicio;
  const sentido = delta > 0 ? 'subiu' : delta < 0 ? 'desceu' : 'igual';
  const bom = delta === 0 ? null : polaridade === 'maior' ? delta > 0 : delta < 0;
  return {
    ...p,
    delta,
    deltaPct: p.inicio === 0 ? null : delta / Math.abs(p.inicio),
    faixa: [Math.min(p.inicio, p.fim), Math.max(p.inicio, p.fim)],
    sentido,
    bom,
  };
}

export type Ordem = 'inicio' | 'fim' | 'delta' | 'deltaPct' | 'categoria';

export function ordenar(linhas: LinhaComparada[], por: Ordem, desc = true): LinhaComparada[] {
  const sinal = desc ? -1 : 1;
  const chave = (l: LinhaComparada): number | string =>
    por === 'categoria' ? l.categoria : (l[por] ?? Number.NEGATIVE_INFINITY);
  return [...linhas].sort((a, b) => {
    const ka = chave(a), kb = chave(b);
    if (typeof ka === 'string' || typeof kb === 'string') return String(ka).localeCompare(String(kb)) * -sinal;
    return (ka - kb) * sinal;
  });
}
```

Resolução de colisão de rótulo, usada por slopegraph, bump chart e dot strip:

```ts
export function afastarRotulos(ys: number[], alturaMinima = 14): number[] {
  const ordem = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  let anterior = Number.NEGATIVE_INFINITY;
  for (const p of ordem) {
    p.y = Math.max(p.y, anterior + alturaMinima);
    anterior = p.y;
  }
  const saida = new Array<number>(ys.length);
  for (const p of ordem) saida[p.i] = p.y;
  return saida;
}
```

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Dot plot de Cleveland | um valor por categoria, muitas categorias, escala sem zero | poucas categorias e leitura de razão | grade da categoria imitando escala; ordem alfabética sem motivo |
| 2 | Dot plot agrupado | 2 ou 3 séries por categoria, sem conector | mais de 3 pontos por linha | pontos que se sobrepõem quando os valores coincidem |
| 3 | Dot plot em pequenos múltiplos | mesma comparação em vários recortes | poucas categorias por painel | domínio de eixo diferente em cada painel |
| 4 | Dot strip plot | ranking econômico em muitas categorias | valores repetidos em massa | pontos idênticos empilhados virando um só |
| 5 | Dot plot de desvio | distância de cada categoria a uma referência | referência que muda por linha | esconder o valor absoluto e só mostrar o desvio |
| 6 | Dot plot com intervalo | estimativa com incerteza por categoria | incerteza desconhecida ou inventada | tratar o `ErrorBar` como limite absoluto |
| 7 | Dumbbell antes e depois | mudança entre dois momentos em muitas categorias | mais de dois momentos | não dizer qual ponta é o antes |
| 8 | Dumbbell agrupado | dois pares por categoria (dois segmentos, dois períodos) | mais de dois pares | quatro cores brigando na mesma linha |
| 9 | Connected dot plot de três pontos | trajetória curta com marco intermediário | quatro ou mais pontos | virar linha do tempo disfarçada |
| 10 | Arrow plot | a mudança importa mais que os valores | mudanças minúsculas em escala larga | seta sem cabeça, ou cabeça maior que o delta |
| 11 | Range plot | a distância entre dois valores é a notícia | quando os valores é que importam | ler a faixa como intervalo de confiança |
| 12 | Range plot com marcador interno | faixa de cenário com valor central e meta | faixa sem método declarado | marcador central sem dizer se é média ou mediana |
| 13 | Lollipop horizontal | rótulos longos, muitas categorias, ar no cartão | comparação precisa entre valores próximos | disco grande que faz empate visual onde não há |
| 14 | Lollipop vertical | poucas categorias com ordem natural (mês, etapa) | rótulos longos | rótulo de categoria girado a 45 graus |
| 15 | Lollipop divergente | valores positivos e negativos contra uma referência | tudo do mesmo sinal | eixo de categoria no meio, empurrando os rótulos |
| 16 | Lollipop agrupado | duas séries por categoria mantendo o eixo comum | mais de duas séries | hastes sobrepostas sem deslocamento |
| 17 | Slope chart | dois momentos, poucas categorias, história de reversão | muitas retas que se cruzam | rótulos sobrepostos nas pontas |
| 18 | Slope chart em painéis | muitas categorias que se cruzariam num só plano | poucas categorias | escala independente por painel |
| 19 | Bump chart de ranking | posição no ranking ao longo de 3 a 8 períodos | quando o valor importa mais que a posição | esconder que a distância entre ranks não é o valor |
| 20 | Dot plot pareado em colunas | comparar duas populações lado a lado no mesmo eixo | quando o par não é o mesmo objeto | ligar pontos que não são a mesma entidade |
| 21 | Dot plot em matriz categórica | um valor por cruzamento de duas categorias | matriz cheia e densa | célula vazia lida como zero |
| 22 | Dot plot com resumo e distribuição ao fundo | mediana por categoria com a dispersão visível | público que só quer o número | jitter sem semente fixa tremendo entre renders |
| 23 | Dot plot com marca direcional | público que não reconhece o dot plot; lista longa com escala sem zero | poucas categorias em que a barra comum resolve | gradiente com `id` repetido entre gráficos da mesma página |

---

## 1. Dot plot de Cleveland

**Descrição.** Um ponto por categoria sobre um eixo quantitativo comum, com as categorias empilhadas em linhas.
É a forma-mãe da família e o substituto direto do gráfico de barras horizontais quando a lista é longa ou
quando o zero não diz nada.

**Anatomia.** Coluna de rótulos de categoria à esquerda; sem reta atravessando o ponto (a partir de ~8 categorias,
zebra clara por linha ou separador fino entre linhas); ponto cheio de 5 a 7px de raio; eixo quantitativo embaixo com 4 a 6 marcações e unidade no título; ordem
declarada no subtítulo; opcional `ReferenceLine` na mediana ou na meta.

**Abordagem na stack.** `recharts-nativo` pela rota B: `ScatterChart` com `YAxis type="category"` e
`XAxis type="number"`.

```tsx
<ScatterChart layout="vertical" margin={{ top: 8, right: 28, bottom: 8, left: 8 }}>
  <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
  <XAxis type="number" dataKey="ticket" domain={[0, 420]} unit=" mil" tick={{ fill: 'var(--text-muted)' }} />
  <YAxis type="category" dataKey="executivo" width={120} tickLine={false} axisLine={false} />
  <ReferenceLine x={186} stroke="var(--line-strong)" strokeDasharray="4 4"
    label={{ value: 'mediana 186', position: 'top', fill: 'var(--text-muted)' }} />
  <Scatter data={linhas} fill="var(--chart-1)" shape="circle" />
  <Tooltip cursor={{ fill: 'var(--surface-raised)' }} content={<TooltipLinha />} />
</ScatterChart>
```

**Ponto delicado.** Três coisas. Primeira: nada horizontal pode **parecer grade quantitativa**; é a
quarta causa de confusão da lista de Desbarats ("guide lines violate expectations"). Até ~8 categorias, sem guia;
acima, zebra ou separador entre bandas, e a grade vertical mais visível que qualquer guia. Segunda: eixo de categoria em `ScatterChart` é a parte da API que mais varia; se o build
reclamar, trocar para `ComposedChart layout="vertical"` com um `Bar` de `shape` própria que desenha só o
círculo. Terceira: `width` do `YAxis` fixo trunca nome longo sem avisar; calcular pela maior string ou usar
`tick` próprio com `title`.

**Versões sugeridas.**
- **V1 básica: ticket médio por executivo.** 14 executivos fictícios, ticket em milhares, ordenado do maior para
  o menor, eixo começando em 120 e não em zero, com nota "escala não começa em zero".
- **V2 com destaque e anotação: quem está acima da mediana.** Mesma lista; pontos acima da mediana em
  `--chart-1`, abaixo em `--line-strong`; `ReferenceLine` na mediana com rótulo; anotação em texto no canto
  contando quantos estão de cada lado.
- **V3 densa do Farol: CPL por campanha.** 28 campanhas fictícias de quatro plataformas, CPL em reais, ordenado
  por CPL, cor por plataforma (4 tons), cartão rolável com o eixo fixo no topo.
- **V4 caso limite: categoria sem dado.** Três das 28 campanhas não tiveram investimento no período; a linha
  continua na lista com ponto vazado e o tooltip diz "sem investimento em agosto"; rodapé conta as três.

**Referências.**
- Catálogo: [DataViz Catalogue, Chart Snapshot: Cleveland Dot Plots](https://datavizcatalogue.com/blog/chart-snapshot-cleveland-dot-plots/): observar a lista de vantagens sobre a barra, "sem necessidade de começar do zero", e o recorte de uso para conjuntos com número moderado de categorias.
- Catálogo: [Data Viz Project, dot chart](https://datavizproject.com/data-type/dot-chart/) (não abriu, HTTP 403): pelo resultado da busca, a ficha define o dot chart como gráfico de duas dimensões que compara uma variável entre categorias e aponta o lollipop como a variante com haste; observar a lista de formas vizinhas.
- Catálogo: [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot): observar o limite prático de três pontos por linha e a regra de quando trocar para range plot ou arrow plot.
- Praticante: [Practical Reporting, a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot): observar as cinco causas de confusão medidas em oficina e a proposta de trocar o círculo por marca direcional.
- Praticante: [Storytelling with Data, dot plot vs slopechart vs bar chart](https://www.storytellingwithdata.com/blog/2017/10/13/novel-vs-the-boring-old-bar-chart): observar que a plateia escolheu a barra e por quê; serve de contraprova antes de adotar o dot plot por estética.
- Portal de design: [Dribbble, Dashboard charts library (Setproduct)](https://dribbble.com/shots/14154711-Dashboard-charts-library) (não abriu): biblioteca de widgets de dashboard em tema claro e escuro; observar o tratamento do rótulo de categoria e o espaçamento entre linhas.

---

## 2. Dot plot agrupado

**Descrição.** Duas ou três séries de pontos na mesma linha de categoria, sem conector, cada série com cor e
forma próprias. Responde "como cada categoria se comporta em dois ou três recortes" mantendo o eixo comum.

**Anatomia.** Igual ao modelo 1 mais uma legenda de série com a forma exata do marcador; quando dois valores
coincidem, o marcador de trás ganha contorno para não sumir; ordem definida por uma das séries, declarada.

**Abordagem na stack.** `recharts-nativo`: um `Scatter` por série no mesmo `ScatterChart`, com `shape`
diferente por série (`circle`, `diamond`, `triangle`) além da cor, para não depender de cor sozinha.

**Ponto delicado.** Sobreposição exata. Quando duas séries têm o mesmo valor, um ponto cobre o outro e o leitor
lê "só tem uma série aqui". Duas saídas: contorno de 1,5px em `--surface-base` em todos os marcadores, ou
deslocamento vertical de 3px por série dentro da banda da categoria, declarado na legenda. O deslocamento é
mentira controlada, então só cabe quando o eixo tem escala larga.

**Versões sugeridas.**
- **V1 básica: agendas por SDR em dois meses.** 8 SDRs fictícios, julho em `--chart-3` e agosto em `--chart-1`.
- **V2 com destaque: a série corrente em cor, as anteriores em cinza.** Três meses; só o mês corrente colorido,
  os dois anteriores em tons de `--line-strong`, criando rastro sem virar linha do tempo.
- **V3 densa do Farol: CPL, CPL qualificado e meta por origem.** 12 origens fictícias com três marcadores por
  linha (bruto, qualificado, meta), formas diferentes, ordenado pela distância entre bruto e qualificado.
- **V4 caso limite: empate exato.** Duas origens em que CPL bruto e qualificado coincidem; os dois marcadores
  ganham contorno e o tooltip explicita "mesmo valor nas duas medidas".

**Referências.**
- Catálogo: [Datawrapper Academy, examples of Datawrapper dot and range plots](https://www.datawrapper.de/academy/examples-of-datawrapper-dot-charts) (não abriu): exemplos publicados de dot e range plot; observar o uso de cor por série e o rótulo direto nas pontas.
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar que dot plot aparece em *Distribution* como "forma simples de mostrar a mudança ou a faixa (mín/máx) do dado em várias categorias".
- Praticante: [Nightingale, beyond the bar: alternative methods for visualizing two points of change](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): observar as cinco alternativas comparadas e a posição do clustered bar como linha de base chata mas segura.
- Portal de design: [Figma Community, Data Visualisation UI Kit, 150 charts / 36 chart types](https://www.figma.com/community/file/1212977094398360391/data-visualisation-ui-kit-150-charts-36-chart-types-10-color-palettes) (não abriu): kit com muitos tipos e paletas; observar como as variações de marcador são organizadas como componentes.

---

## 3. Dot plot em pequenos múltiplos

**Descrição.** O mesmo dot plot repetido em painéis, um por recorte (região, produto, trimestre), com **eixo
idêntico** em todos. Resolve o caso em que uma dimensão a mais estouraria a legenda de cor.

**Anatomia.** Grade de painéis com título curto; eixo quantitativo desenhado só na borda inferior e na borda
esquerda da grade, não repetido em cada painel; rótulos de categoria repetidos só na coluna da esquerda; uma
linha de referência comum atravessando todos os painéis na mesma posição.

**Abordagem na stack.** `html-tailwind` para a grade (`grid grid-cols-2 lg:grid-cols-4 gap-4`) com um
`ScatterChart` por célula, todos recebendo o mesmo `domain` calculado uma vez fora do laço. Alternativa
`svg-puro` quando a grade passa de 8 painéis, para desenhar um `<svg>` só e não pagar 12 `ResponsiveContainer`.

**Ponto delicado.** O domínio. Deixar cada painel calcular o próprio domínio é o erro que mata o modelo: os
painéis ficam visualmente iguais e os números são de ordens diferentes. Calcular `[min, max]` sobre o conjunto
inteiro, aplicar em todos e, se um painel ficar vazio pelo filtro, desenhar o painel mesmo assim com a marca
"sem dado", para a grade não mudar de forma e enganar a comparação.

**Versões sugeridas.**
- **V1 básica: ticket por executivo, um painel por segmento.** Quatro segmentos fictícios, mesma lista de
  executivos, mesmo eixo.
- **V2 com destaque: um executivo perseguido pela grade.** O mesmo executivo em `--chart-2` nos quatro painéis,
  os demais em cinza, mostrando onde ele é forte e onde não é.
- **V3 densa do Farol: SLA de primeiro contato por SDR, um painel por semana.** Seis semanas, 8 SDRs, eixo em
  minutos, `ReferenceLine` no teto de SLA repetida nos seis painéis.
- **V4 caso limite: painel vazio.** Na semana de recesso duas SDRs não tiveram lead; os painéis existem, com os
  rótulos, os pontos ausentes e a nota "sem lead na semana".

**Referências.**
- Catálogo: [Datawrapper Academy, examples of Datawrapper dot and range plots](https://academy.datawrapper.de/article/281-examples-of-datawrapper-dot-charts) (não abriu): coletânea de exemplos publicados; observar a repetição de escala entre peças.
- Praticante: [Nightingale, beyond the bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): observar a recomendação de pequenos múltiplos quando "o gráfico tem muitas categorias", com o ganho de espaço em branco.
- Praticante: [FlowingData, how to make dot plots in R](https://flowingdata.com/2015/04/15/how-to-make-dot-plots-in-r/) (não abriu): tutorial de dot plot; observar o passo de ordenação e o tratamento do rótulo de categoria.
- Portal de design: [Figma Community, Data Visualization Graphs / Charts Kit](https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit) (não abriu): 40 gráficos customizáveis com estilos de texto e cor; observar como o kit trata a repetição de eixo em grade.

---

## 4. Dot strip plot

**Descrição.** Cada categoria recebe uma tira horizontal e os pontos daquela categoria são plotados na tira.
Pela definição do FT, "pontos colocados em ordem numa tira são um método econômico de dispor ranks em várias
categorias". Serve para ranking e, com muitos pontos, começa a mostrar distribuição.

**Anatomia.** Tira por categoria (faixa de fundo `--surface-raised` bem sutil, opcional); pontos pequenos (3 a
4px) com opacidade 0,6 a 0,8; marcador de resumo opcional (mediana como traço vertical mais forte); eixo comum
embaixo; contagem `n` ao lado do nome da categoria.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart` com `YAxis type="category"` e muitos pontos por
categoria; ou `svg-puro` quando passa de ~800 pontos, desenhando `<circle>` num `<g>` por tira, que renderiza
mais rápido que o mesmo número de elementos gerenciados pelo Recharts.

**Ponto delicado.** Valores repetidos viram um ponto só. Duas correções: opacidade baixa, que faz a pilha
aparecer mais escura, e deslocamento vertical determinístico dentro da tira derivado do id do registro (nunca
`Math.random()`, senão treme entre renders e entre servidor e cliente). Quando a pergunta vira "qual a forma",
o modelo já pertence a **16_distribuicao** como beeswarm ou strip.

**Versões sugeridas.**
- **V1 básica: ticket das oportunidades ganhas por segmento.** Cinco segmentos fictícios, cada ponto uma
  oportunidade, `n` ao lado do nome.
- **V2 com anotação: a maior de cada tira nomeada.** Rótulo direto só no ponto mais alto de cada segmento.
- **V3 densa do Farol: minutos até o primeiro contato por SDR.** 8 SDRs, ~900 leads fictícios, opacidade 0,45,
  traço da mediana por tira e `ReferenceLine` no teto de SLA.
- **V4 caso limite: empate em massa.** Muitos leads com exatamente 5 minutos porque a automação carimba o
  mesmo valor; deslocamento determinístico e nota "142 leads com o mesmo valor carimbado pela automação".

**Referências.**
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar que dot strip plot aparece em *Ranking* e em *Distribution*, com a definição de método econômico de dispor ranks.
- Catálogo: [DataViz Catalogue, chart snapshot: dot distribution plots](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/) (não abriu): observar o uso do ponto como unidade ou como contagem e a fronteira com histograma.
- Praticante: [VizWiz, how to create a dot strip plot](https://www.vizwiz.com/2021/06/dot-strip-plot.html) (não abriu): passo a passo do formato; observar a escolha de tamanho e opacidade do ponto.
- Portal de design: [Dribbble, tag chart](https://dribbble.com/tags/chart) (não abriu): galeria ampla de peças de gráfico; observar o tratamento de tiras e faixas de fundo em cartões escuros.

---

## 5. Dot plot de desvio

**Descrição.** Em vez do valor absoluto, cada linha mostra a **distância até uma referência** comum (a meta, a
média da empresa, o mês anterior, o benchmark do mercado). O zero passa a ser a referência e fica no meio.

**Anatomia.** Eixo centrado no zero com sinal nos dois lados; linha vertical forte no zero rotulada com o que a
referência é e quanto vale; ponto por categoria; haste opcional do zero até o ponto; cor por polaridade da
métrica; rótulo direto com sinal em cada ponto.

**Abordagem na stack.** `recharts-nativo` com `ScatterChart`, `XAxis type="number"` de domínio simétrico
(`[-m, m]` com `m = max(|desvio|)` arredondado) e `ReferenceLine x={0}`. Se quiser a haste, vira
`recharts-custom`: `ComposedChart` com `Bar dataKey={d => [0, d.desvio]}` de `barSize` 2 e `shape` própria.

**Ponto delicado.** O domínio simétrico. Calculado sobre os dados filtrados, ele muda de largura a cada filtro e
o mesmo desvio parece maior ou menor. Fixar `m` no registry por métrica. E nunca esconder o absoluto: o tooltip
precisa dizer "realizado 182, meta 200, desvio −18", senão o leitor não sabe se −18 é catástrofe ou ruído.

**Versões sugeridas.**
- **V1 básica: realizado menos meta por executivo.** 12 executivos fictícios, desvio em milhares, zero rotulado
  "meta do trimestre".
- **V2 com anotação: quem virou o sinal.** Dois executivos que estavam negativos no mês anterior e viraram
  positivo ganham marcador anelado e nota curta ao lado.
- **V3 densa do Farol: CPL de cada campanha contra o CPL médio da plataforma.** 26 campanhas, referência
  diferente por plataforma, então a peça vira quatro blocos empilhados, cada um com seu zero rotulado.
- **V4 caso limite: referência ausente.** Uma plataforma nova sem histórico não tem média; o bloco aparece com
  os valores absolutos e a nota "sem base de comparação: primeira veiculação".

**Referências.**
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar a família *Deviation* e a lógica de zero no meio herdada de diverging bar e spine chart.
- Catálogo: [Datawrapper Academy, how to create a range plot](https://www.datawrapper.de/academy/how-to-create-a-range-plot): observar o argumento de quando a distância vale mais que os valores, que é o mesmo raciocínio do desvio.
- Praticante: [Storytelling with Data, a little math on non-zero baselines](https://www.storytellingwithdata.com/blog/2014/02/a-little-math-on-non-zero-baselines) (não abriu): observar a conta que mostra o quanto a base não zero distorce a leitura de comprimento, e por que ponto escapa disso.
- Portal de design: [Dribbble, busca comparison-chart](https://dribbble.com/search/comparison-chart) (não abriu): galeria de peças de comparação; observar quantas resolvem "acima e abaixo" só com cor e por que isso falha no escuro.

---

## 6. Dot plot com intervalo

**Descrição.** Ponto central mais uma faixa de incerteza por categoria. É o forest plot do mundo clínico
levado ao dashboard: a estimativa e o quanto ela pode variar, lado a lado, com eixo comum.

**Anatomia.** Ponto do valor central (mediana, média ou centro do cenário); segmento horizontal do limite
inferior ao superior com serifas nas pontas; `n` por linha; referência vertical (meta, zero, mercado);
declaração do que é a faixa no subtítulo, obrigatória.

**Abordagem na stack.** `recharts-nativo`: `Scatter` com `ErrorBar direction="x"`. **Atenção à semântica:** o
`ErrorBar` interpreta os valores como **distâncias relativas** ao ponto, não como limites absolutos; valor 10
com erro 2 desenha de 8 a 12. Então o dado precisa carregar `erro: [central - inferior, superior - central]`.

```tsx
<Scatter data={linhas} fill="var(--chart-1)">
  <ErrorBar dataKey="erro" direction="x" width={6} strokeWidth={1.5} stroke="var(--line-strong)" />
</Scatter>
```

**Ponto delicado.** Além da semântica relativa do `ErrorBar`, o risco de significado: faixa de cenário não é
intervalo de confiança, e desvio padrão não é erro padrão. O subtítulo tem de dizer exatamente o que a barra
representa e como foi calculada, com link para o método. Faixa inventada por regra de bolso ("mais ou menos
20%") é pior que nenhuma faixa.

**Versões sugeridas.**
- **V1 básica: ciclo mediano por segmento, com quartis.** Cinco segmentos, ponto na mediana, faixa do primeiro
  ao terceiro quartil, subtítulo "faixa = quartis".
- **V2 com anotação: o segmento cuja faixa cruza a meta.** Segmentos cuja faixa atravessa a `ReferenceLine` da
  meta ganham cor de atenção e a nota "faixa cruza a meta: resultado não conclusivo".
- **V3 densa do Farol: faixa de cenário de receita por linha de produto para 2027.** Oito linhas, ponto no
  cenário base e faixa do pessimista ao otimista, com o método declarado e o `n` de negócios que sustenta cada
  linha.
- **V4 caso limite: amostra pequena.** Duas linhas com `n` de 3 e 4 mostram só o ponto, sem faixa, e a nota
  "n < 5: faixa não calculada".

**Referências.**
- Catálogo: [Recharts, ErrorBar](https://recharts.github.io/en-US/api/ErrorBar/): observar `direction` x/y, `width` das serifas e principalmente que os valores são distâncias relativas ao ponto.
- Catálogo: [Vega-Lite, ranged dot plot](https://vega.github.io/vega-lite-v2/examples/layer_ranged_dot.html): a especificação empilha uma camada `line` e uma camada `point` sobre `x` quantitativo e `y` nominal, com a cor do ponto vindo de uma escala ordinal de dois valores; observar que a faixa é só a camada de baixo, e que os dois pontos por categoria nascem de um filtro que mantém apenas dois períodos.
- Praticante: [Nightingale, beyond the bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): observar o enquadramento de que a distância é a mensagem quando há dois pontos por categoria.
- Portal de design: [Visa Product Design System, dumbbell plot](https://design.visa.com/data-visualization/charts/dumbbell-plot/) (carregou truncado): página de sistema de design para a geometria de dois pontos; observar a marcação de acessibilidade e o tratamento de rótulo direto.

---

## 7. Dumbbell antes e depois

**Descrição.** Dois pontos por categoria ligados por um segmento. Também chamado barbell, connected dot plot ou
pré-pós. A definição do DataViz Catalogue é direta: serve para "ilustrar mudanças entre dois pontos no tempo,
condições ou grupos". O conector é o que faz o trabalho: ele transforma dois valores em uma distância.

**Anatomia.** Rótulo de categoria; conector de 2 a 3px em `--line-strong` (ou colorido pela polaridade do
delta); cabeça inicial vazada ou em `--chart-3`; cabeça final cheia em `--chart-1`; rótulo do delta com sinal
na ponta direita da linha; legenda dizendo qual cabeça é qual; ordenação declarada.

**Abordagem na stack.** `recharts-custom` pela rota A: um `Bar` de faixa com `shape` própria, que desenha o
conector e as duas cabeças de uma vez.

```tsx
type FormaHaltere = {
  x?: number; y?: number; width?: number; height?: number;
  payload?: LinhaComparada;
};

function Haltere(p: FormaHaltere) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = p;
  if (!payload || payload.faixa == null) return null;
  const cy = y + height / 2;
  const subiu = (payload.delta ?? 0) > 0;
  // a barra de faixa é sempre [menor, maior]; o sentido decide qual borda é o "antes"
  const xAntes = subiu ? x : x + width;
  const xDepois = subiu ? x + width : x;
  const corDelta = payload.bom == null ? 'var(--line-strong)'
    : payload.bom ? 'var(--positivo)' : 'var(--negativo)';
  return (
    <g>
      <line x1={x} x2={x + width} y1={cy} y2={cy} stroke={corDelta} strokeWidth={3} strokeLinecap="round" />
      <circle cx={xAntes} cy={cy} r={5} fill="var(--surface-base)" stroke="var(--chart-3)" strokeWidth={2} />
      <circle cx={xDepois} cy={cy} r={5.5} fill="var(--chart-1)" />
    </g>
  );
}

<ComposedChart layout="vertical" data={linhas}>
  <XAxis type="number" domain={[0, 240]} unit=" min" />
  <YAxis type="category" dataKey="categoria" width={140} axisLine={false} tickLine={false} />
  <Bar dataKey="faixa" shape={<Haltere />} isAnimationActive={false} barSize={18}>
    <LabelList dataKey="delta" position="right" content={<RotuloDelta />} />
  </Bar>
</ComposedChart>
```

**Ponto delicado.** A barra de faixa é sempre `[menor, maior]`, então **a geometria sozinha não diz qual ponta é
o antes**. O sentido tem que vir do `payload`, como no código acima; errar isso inverte metade das linhas sem
nenhum sintoma visual. Segundo ponto: quando o delta é minúsculo, as duas cabeças se tocam e a linha some;
abaixo de um limiar em pixels (cerca de `2 * raio + 2`), desenhar uma cabeça só, bipartida, e deixar o tooltip
explicar. Terceiro: `isAnimationActive={false}` porque a animação de barra de faixa cresce a partir de uma borda
e dá a impressão de movimento do dado.

**Versões sugeridas.**
- **V1 básica: SLA de primeiro contato por SDR, semana passada contra esta.** 8 SDRs fictícios, minutos,
  ordenado pela melhora.
- **V2 com destaque e anotação: só quem piorou.** Linhas com delta ruim em `--negativo` e as demais em cinza;
  anotação "3 de 8 pioraram" e rótulo direto do delta só nessas três.
- **V3 densa do Farol: motivos de perda, trimestre anterior contra atual.** 18 motivos fictícios, participação
  percentual em cada trimestre, ordenado pela variação em pontos percentuais, cartão rolável.
- **V4 caso limite: categoria nova e categoria que sumiu.** Um motivo só existe no trimestre atual e outro só no
  anterior; os dois viram ponto solto, sem conector, com marcador "novo" e "não ocorreu", e o rodapé conta.

**Referências.**
- Catálogo: [DataViz Catalogue, chart snapshot: dumbbell plots](https://datavizcatalogue.com/blog/chart-snapshot-dumbbell-plot/): observar os nomes alternativos (barbell, connected dot plot) e o recorte de uso para mudança entre dois pontos, condições ou grupos.
- Catálogo: [Data Viz Project, dumbbell plot](https://datavizproject.com/data-type/dumbbell-plot/) (não abriu, HTTP 403): ficha do formato no catálogo Ferdio; observar a categorização por função e as formas vizinhas sugeridas.
- Catálogo: [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot): observar que o conector aparece automaticamente com mais de um ponto por linha e "indica a diferença quantitativa".
- Catálogo: [Highcharts, dumbbell series](https://www.highcharts.com/docs/chart-and-series-types/dumbbell-series): observar que as duas pontas têm configurações separadas (`marker` e `lowMarker`, `color` e `lowColor`) e o conector tem `connectorColor` e `connectorWidth` próprios; é a mesma separação de papéis que a `shape` do Farol precisa expor.
- Catálogo: [From Data to Viz, lollipop chart](https://www.data-to-viz.com/graph/lollipop.html): observar que o site trata o haltere como "Cleveland dot plot", variante do lollipop para dois valores por grupo, e recomenda ordenar pela média, pela mediana ou pela diferença.
- Praticante: [Nightingale, the dumbbell plot: a how-to guide (Mike Raper)](https://medium.com/nightingale/the-dumbbell-plot-a-how-to-guide-5dafd1d67581) (não abriu): guia passo a passo do formato; observar as escolhas de ordenação e de rótulo de ponta.
- Portal de design: [Visa Product Design System, dumbbell plot](https://design.visa.com/data-visualization/charts/dumbbell-plot/) (carregou truncado): especificação do formato dentro de um design system; observar tokens de cor, espessura do conector e regras de acessibilidade.
- Portal de design: [Figma Community, Charts Components For Free, mais de 30 desenhos](https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available) (não abriu, HTTP 403): pelo resultado da busca, o arquivo inclui lollipop e dumbbell entre os tipos; observar como as duas pontas viram variantes do mesmo componente.

---

## 8. Dumbbell agrupado

**Descrição.** Dois halteres por categoria, empilhados dentro da mesma banda: um par por subgrupo. Responde
"a mudança foi igual nos dois segmentos?" sem abrir duas peças.

**Anatomia.** Banda de categoria com dois sublinhas de 10 a 12px; cada sublinha com seu haltere; rótulo do
subgrupo minúsculo à esquerda dentro da banda ou só na legenda; separador sutil entre bandas para o olho não
juntar sublinhas de categorias vizinhas.

**Abordagem na stack.** `recharts-custom`: dois `Bar` de faixa (`dataKey="faixaA"` e `dataKey="faixaB"`) com a
mesma `shape` parametrizada por subgrupo; o Recharts já desloca `Bar` irmãos dentro da banda da categoria.

**Ponto delicado.** Cor. São quatro papéis disputando a mesma linha: antes, depois, subgrupo A, subgrupo B. A
saída que funciona é usar **cor só para o subgrupo** e **preenchimento** (vazado contra cheio) para antes e
depois, com a legenda mostrando exatamente as quatro combinações. Usar quatro cores distintas é o caminho para
um cartão ilegível no escuro.

**Versões sugeridas.**
- **V1 básica: ciclo de venda por segmento, dois semestres, aberto por porte.** Cinco segmentos, dois portes.
- **V2 com destaque: onde os dois subgrupos andaram em direções opostas.** Bandas com sinais discordantes
  ganham fundo `--surface-raised` e nota curta.
- **V3 densa do Farol: CPL por plataforma, aberto em campanha de topo e de fundo, mês anterior contra atual.**
  Quatro plataformas, dois tipos de campanha, oito halteres.
- **V4 caso limite: subgrupo sem par.** Uma plataforma não teve campanha de fundo no mês atual; a sublinha fica
  com o ponto do mês anterior e a marca "descontinuada em agosto".

**Referências.**
- Catálogo: [Datawrapper Academy, customizing your dot plot](https://www.datawrapper.de/academy/customizing-your-dot-plot): observar quatro decisões que a ferramenta expõe e que o nosso cartão também precisa expor: a opção "highlight range between dots", que acende o conector grosso entre os pontos; o alinhamento do rótulo de categoria à esquerda ou à direita; agrupar e reordenar linhas por coluna; e a marcação do eixo no topo ou embaixo.
- Praticante: [Nightingale, beyond the bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): observar o clustered bar como alternativa e por que o haltere ganha quando a distância é a notícia.
- Portal de design: [Figma Community, Advanced Data Visualization](https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization) (não abriu): kit configurável; observar a organização de variantes de marcador e preenchimento, que é o problema deste modelo.

---

## 9. Connected dot plot de três pontos

**Descrição.** Três pontos por categoria na mesma linha, ligados em sequência. É o limite superior que a
Datawrapper recomenda ("no máximo três pontos por linha"); acima disso o desenho vira linha e muda de família.

**Anatomia.** Conector contínuo passando pelos três pontos; marcadores com formas distintas e tamanho crescente
do primeiro ao último; legenda com as três formas; rótulo direto só no último ponto.

**Abordagem na stack.** `recharts-custom`: `Bar` de faixa `[min(t1,t2,t3), max(t1,t2,t3)]` com `shape` que
recebe os três valores no `payload`, converte cada um em pixel por regra de três dentro da faixa e desenha
segmentos e marcadores. Alternativa `recharts-nativo`: três `Scatter` com `line={false}` mais um `Bar` fino de
faixa como conector.

**Ponto delicado.** Converter valor em pixel dentro da `shape`. A `shape` recebe `x` e `width` da faixa, não a
escala do eixo; a conversão correta é
`px = x + ((valor - faixa[0]) / (faixa[1] - faixa[0])) * width`, e quebra quando `faixa[1] === faixa[0]`
(três valores iguais). Tratar esse caso desenhando um marcador só. Segundo ponto: com três pontos o leitor tenta
ler trajetória, então a ordem temporal tem que estar evidente na forma e no tamanho, não só na cor.

**Versões sugeridas.**
- **V1 básica: entradas, agendas e oportunidades por origem.** Três etapas do funil na mesma linha, mostrando
  onde cada origem perde.
- **V2 com anotação: o maior tombo entre etapas.** A origem com a maior queda relativa entre dois marcadores
  ganha destaque e nota "perde 78% entre agenda e oportunidade".
- **V3 densa do Farol: meta, forecast e realizado por executivo.** 14 executivos, três marcadores, ordenado pela
  distância entre realizado e meta.
- **V4 caso limite: três valores iguais.** Um executivo com meta, forecast e realizado idênticos vira marcador
  único triplo, com o tooltip listando os três.

**Referências.**
- Catálogo: [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot): observar o teto de três pontos por linha e o aviso de que "quanto mais pontos nas linhas, mais difícil fica de ler".
- Catálogo: [Observable Plot, dot mark](https://observablehq.com/plot/marks/dot) (não abriu): API de marcas de ponto com raio, símbolo e canais; observar a separação entre marca e transformação, útil para pensar a `shape` própria.
- Praticante: [Practical Reporting, a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot): observar a crítica ao ponto redondo que não indica direção, que piora com três marcadores na mesma linha.
- Portal de design: [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard) (não abriu): peça de dashboard escuro; observar contraste de marcador sobre fundo escuro, que é o problema de três marcadores juntos.

---

## 10. Arrow plot

**Descrição.** O haltere com uma cabeça só, virada em seta. A Datawrapper resume a diferença: o arrow plot serve
"quando você quer enfatizar a mudança entre os valores mais que os próprios valores". A Flourish define como
"connected dot plot com uma cabeça de seta em cada linha para destacar a direção da mudança".

**Anatomia.** Ponto de origem pequeno; haste; cabeça de seta no destino; cor por polaridade (não por direção
crua); rótulo do delta; a regra da Datawrapper de que "a seta sempre aponta da data mais antiga para a mais
recente" vale como contrato do componente.

**Abordagem na stack.** `recharts-custom`: `Bar` de faixa com `shape` que desenha a haste e um `<path>`
triangular na ponta do destino. Cabeça de seta é `<path d="M …Z" />` ou `<polygon>` com três pontos calculados;
`marker-end` de SVG funciona, mas herda cor pelo `fill` do `<marker>` e complica o tema.

```ts
export function cabecaDeSeta(xPonta: number, cy: number, paraDireita: boolean, tam = 7): string {
  const dx = paraDireita ? -tam : tam;
  return `M ${xPonta} ${cy} L ${xPonta + dx} ${cy - tam * 0.6} L ${xPonta + dx} ${cy + tam * 0.6} Z`;
}
```

**Ponto delicado.** Duas armadilhas. A cabeça de seta tem tamanho fixo em pixels, então **quando o delta é
pequeno a cabeça é maior que a haste** e a peça vira uma fileira de triângulos sem informação; abaixo de ~12px
de haste, trocar por um marcador de "sem mudança relevante" e mandar o valor para o tooltip. A outra: ordem dos
dados. A Flourish avisa que "as linhas são desenhadas na ordem em que aparecem na planilha, com a cabeça de
seta no último ponto"; no Farol, a ordem é sempre imposta no código a partir da data, nunca herdada do payload.

**Versões sugeridas.**
- **V1 básica: CPL por campanha, julho para agosto.** 12 campanhas fictícias, seta apontando para agosto, cor
  por polaridade (CPL que cai é bom).
- **V2 com destaque: só as mudanças acima de 15%.** Setas coloridas nas que passam do limiar, cinza nas demais,
  anotação "9 de 22 mudaram mais de 15%".
- **V3 densa do Farol: participação de mercado por perímetro.** 16 concorrentes fictícios em dois perímetros,
  seta do ano anterior para o atual, ordenado pela variação em pontos percentuais, com a nota de perímetro no
  subtítulo.
- **V4 caso limite: mudança quase nula.** Cinco linhas com variação abaixo de 0,2 ponto percentual viram
  marcador neutro sem seta e a legenda ganha a entrada "variação abaixo do limiar".

**Referências.**
- Catálogo: [Datawrapper Academy, how to create an arrow plot](https://www.datawrapper.de/academy/how-to-create-an-arrow-plot): a definição é "como pontos de categorias diferentes mudaram entre duas datas", e a regra de direção é mecânica: valor antigo menor que o novo, seta para a direita; valor antigo maior, seta para a esquerda. Observar também a árvore de decisão publicada ali, que manda usar linha quando há mais de dois momentos, range plot quando a ênfase é a distância e não o tempo, e dot plot quando não há momento nenhum.
- Catálogo: [Datawrapper blog, new arrow and range plots](https://www.datawrapper.de/blog/new-arrow-and-range-plots): observar a separação de ênfase entre arrow (mudança) e range (distância) e o rótulo de início, fim, variação absoluta ou percentual.
- Catálogo: [Flourish, (Ar)row row row your plot](https://flourish.studio/blog/make-arrow-plots/): observar a definição de arrow plot como connected dot plot com cabeça e o alerta de que a ordem das linhas na planilha decide o desenho.
- Catálogo: [Observable Plot, arrow mark](https://observablehq.com/plot/marks/arrow) (não abriu, HTTP 429): pelo resultado da busca, o exemplo liga duas observações de cada cidade entre 1980 e 2015 e a cor do traço codifica o sentido da variação; observar que a cor responde ao significado da mudança, não à direção geométrica. Exemplo irmão: [Plot, arrow variation chart](https://observablehq.com/@observablehq/plot-arrow-variation-chart) (não abriu).
- Praticante: [Nightingale, beyond the bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): observar o uso de ícones direcionais em tabela como alternativa barata ao arrow plot.
- Portal de design: [Dribbble, busca dashboard-chart](https://dribbble.com/search/dashboard-chart) (não abriu): galeria de cartões de dashboard; observar como o indicador de direção costuma virar seta minúscula ao lado do número, e o quanto isso some no escuro.

---

## 11. Range plot

**Descrição.** Dois valores por categoria ligados por uma barra grossa, com a ênfase na **distância**. A
Datawrapper é explícita: é a escolha "quando você quer chamar atenção para a distância entre os valores mais
que para os valores em si", com o exemplo canônico da diferença salarial entre grupos.

**Anatomia.** Barra de 8 a 12px de altura com pontas arredondadas; os dois valores rotulados dentro ou nas
pontas da barra; sem cabeças distintas, porque não há antes e depois, só extremos; ordenação pela largura da
faixa; eixo comum.

**Abordagem na stack.** `recharts-nativo` na forma mais pura desta família: `ComposedChart layout="vertical"`
com `Bar dataKey="faixa"` devolvendo `[min, max]`, `radius` para as pontas e `barSize` de 10. Sem `shape`
própria. É o único modelo do grupo que o Recharts entrega quase pronto.

**Ponto delicado.** O leitor treinado em estatística lê barra horizontal com dois extremos como intervalo de
confiança. Se a faixa for mínimo e máximo observados, o subtítulo tem de dizer "faixa = mínimo e máximo
observados", e a diferença importa: uma faixa de extremos é sensível a um único outlier, um intervalo não.
Segundo ponto: quando a faixa é muito estreita, `radius` maior que metade da largura desenha uma cápsula
deformada; limitar `radius` a `Math.min(5, largura / 2)`.

**Versões sugeridas.**
- **V1 básica: mínimo e máximo de ticket por segmento.** Cinco segmentos, faixa dos extremos observados.
- **V2 com anotação: a faixa mais larga.** O segmento com a maior amplitude ganha cor e a nota "amplitude de
  R$ 12 mil a R$ 480 mil: a média não descreve este segmento".
- **V3 densa do Farol: distância entre CPL bruto e CPL qualificado por origem.** 14 origens, faixa entre as duas
  medidas, ordenada pela distância, que é exatamente a pergunta de orçamento.
- **V4 caso limite: faixa de largura zero.** Duas origens em que bruto e qualificado coincidem porque todo lead
  qualificou; desenhar ponto único com anel e nota "100% de qualificação: faixa nula".

**Referências.**
- Catálogo: [Datawrapper Academy, how to create a range plot](https://www.datawrapper.de/academy/how-to-create-a-range-plot): observar a definição de quando a distância importa mais que os valores e o alerta contra poluir a peça com símbolos redundantes.
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar o dot plot descrito como "forma simples de mostrar a mudança ou a faixa (mín/máx) do dado em várias categorias".
- Catálogo: [Recharts, Custom Shape Bar Chart](https://recharts.github.io/en-US/examples/CustomShapeBarChart/): exemplo oficial de `shape` própria em `Bar` (`shape={TriangleBar}`); observar que a função recebe `x`, `y`, `width`, `height` e `index` já calculados, que é o contrato de que toda a rota A depende.
- Catálogo: [AG Charts, range bar series (React)](https://www.ag-grid.com/charts/react/range-bar-series/): observar `yLowKey` e `yHighKey` no lugar de um par, `direction: 'horizontal'` trocando os eixos, `label.formatter` distinguindo a ponta baixa da alta por `itemType`, `cornerRadius` e a regra de que valor nulo, `NaN` ou infinito abre lacuna em vez de desenhar zero.
- Praticante: [Storytelling with Data, dot plot vs slopechart vs bar chart](https://www.storytellingwithdata.com/blog/2017/10/13/novel-vs-the-boring-old-bar-chart): observar o custo de familiaridade, que no range plot é menor porque a barra grossa se parece com barra.
- Portal de design: [Figma Community, Charts & Graphs UI Kit](https://www.figma.com/community/file/1314538669933482880/charts-graphs-ui-kit) (não abriu): kit de gráficos; observar a espessura e o raio de canto adotados nas barras, que é a decisão central deste modelo.

---

## 12. Range plot com marcador interno

**Descrição.** A faixa do modelo 11 mais um marcador dentro dela: o valor central, o valor atual ou a meta. É a
forma que o Farol usa para cenário, porque responde ao mesmo tempo "qual a aposta" e "qual a margem".

**Anatomia.** Faixa em cor de baixa saturação; marcador interno em traço vertical forte (não em círculo, para
não competir com as pontas); rótulos das pontas discretos; rótulo do marcador em destaque; referência vertical
da meta atravessando todas as linhas; método declarado no subtítulo.

**Abordagem na stack.** `recharts-custom`: `Bar dataKey="faixa"` com `shape` que desenha o retângulo da faixa e
o traço interno posicionado por regra de três, como no modelo 9. Alternativa `recharts-nativo`: `Bar` de faixa
mais um `Scatter` do valor central no mesmo eixo, se o eixo de categoria em `Scatter` funcionar no build.

**Ponto delicado.** O marcador interno precisa de contraste com a própria faixa **e** com o fundo do cartão,
porque ele cai sobre os dois (dentro da faixa, e fora dela quando a faixa é estreita). Solução: traço de 2px em
`--text-strong` com halo de 1px em `--surface-base`. E o método do marcador tem que estar escrito: base,
mediana e média dão números diferentes e o leitor de diretoria vai perguntar.

**Versões sugeridas.**
- **V1 básica: cenário 2027 por linha de receita.** Oito linhas, faixa pessimista a otimista, traço no base.
- **V2 com anotação: as linhas cuja faixa não alcança a meta.** `ReferenceLine` na meta; linhas cuja ponta
  otimista fica abaixo dela ganham cor de alerta e a nota "meta fora da faixa mesmo no otimista".
- **V3 densa do Farol: capacidade contra demanda por fila.** Quatro filas de pré-vendas, faixa de demanda
  projetada, traço na demanda atual e `ReferenceLine` no teto medido de 274 entradas por mês.
- **V4 caso limite: marcador fora da faixa.** Uma fila cuja demanda atual já passou do otimista; o traço é
  desenhado fora do retângulo, com seta de transbordo e nota "atual acima do cenário otimista".

**Referências.**
- Catálogo: [Datawrapper blog, new arrow and range plots](https://www.datawrapper.de/blog/new-arrow-and-range-plots): observar a flexibilidade de escolher quaisquer duas colunas como limites e o rótulo das pontas dentro do gráfico.
- Catálogo: [Vega-Lite, ranged dot plot](https://vega.github.io/vega-lite-v2/examples/layer_ranged_dot.html): observar a composição em duas camadas, a reta por categoria desenhada primeiro e os pontos por cima com tamanho fixo e opacidade cheia; é a mesma ordem de árvore que o Recharts exige aqui.
- Praticante: [Practical Reporting, a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot): observar a proposta de marca em pipe no lugar do círculo, que é exatamente o marcador interno recomendado aqui.
- Portal de design: [Dribbble, Dashboard charts library (Setproduct)](https://dribbble.com/shots/14154711-Dashboard-charts-library) (não abriu): observar o tratamento de faixas e marcadores de meta em cartões de dashboard, em claro e escuro.

---

## 13. Lollipop horizontal

**Descrição.** Barra horizontal reduzida a uma haste fina com um disco na ponta. O FT registra o ganho:
"lollipops chamam mais atenção para o valor do dado que barra ou coluna padrão". É o meio-termo entre a barra
(que ancora no zero) e o dot plot (que abandona a âncora): a haste mantém a referência ao zero, o disco marca o
valor.

**Anatomia.** Haste de 2px do zero (ou da referência) até o valor; disco de 5 a 6px de raio centrado no valor;
rótulo de categoria à esquerda; valor à direita do disco; eixo quantitativo obrigatoriamente ancorado no zero,
porque a haste promete isso.

**Abordagem na stack.** `recharts-custom`: um `Bar` só, com `shape` que desenha retângulo fino mais círculo. É
mais robusto que combinar `Bar` fino com `Scatter`, porque evita o problema de eixo de categoria no `Scatter` e
garante que haste e disco nunca se desalinhem.

```tsx
function Pirulito({ x = 0, y = 0, width = 0, height = 0, fill = 'var(--chart-1)' }) {
  const cy = y + height / 2;
  const positivo = width >= 0;
  const xFim = x + width;
  return (
    <g>
      <rect x={Math.min(x, xFim)} y={cy - 1} width={Math.abs(width)} height={2} fill={fill} opacity={0.55} />
      <circle cx={xFim} cy={cy} r={5.5} fill={fill} />
    </g>
  );
}
```

**Ponto delicado.** O disco mente. O valor é o **centro** do círculo, mas o olho lê a borda; com raio 5,5px,
duas categorias que diferem em 8px de escala parecem quase iguais porque os discos quase se tocam. Três
consequências práticas: ordenar sempre, manter o raio pequeno (5 a 6px), e nunca usar lollipop quando a decisão
depende de distinguir valores próximos. Se depender, é barra. Segundo ponto: o eixo tem que começar no zero, ao
contrário do dot plot; haste cortada é mentira estrutural.

**Versões sugeridas.**
- **V1 básica: agendas por SDR no mês.** 8 SDRs fictícios, contagem, ordenado do maior para o menor.
- **V2 com destaque: acima e abaixo do teto de capacidade.** `ReferenceLine` no teto; quem passa dele tem disco
  em `--negativo` e rótulo com o excedente.
- **V3 densa do Farol: leads por origem com cobertura de dado.** 22 origens, contagem de leads na haste e o
  disco colorido por faixa de cobertura do campo de origem (cheio, meio, vazio), com legenda de três estados.
- **V4 caso limite: valor zero e valor ausente.** Origem com zero lead mostra só o disco no zero; origem sem
  coleta no período não mostra haste nem disco, só a marca "sem coleta", e as duas ficam visualmente distintas.

**Referências.**
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar que o lollipop aparece em *Ranking* e em *Magnitude*, com a justificativa de chamar mais atenção ao valor.
- Catálogo: [Highcharts, lollipop series](https://www.highcharts.com/docs/chart-and-series-types/lollipop-series): observar a definição "basicamente um bar plot, mas com uma linha e um ponto no lugar da barra", o fato de o centro do ponto ser o valor, e a recomendação de usar lollipop quando várias barras têm altura parecida, em torno de 90% da faixa, para evitar o efeito moiré; parâmetros `connectorWidth`, `connectorColor`, `radius` e `fillColor`.
- Praticante: [Tableau, viz variety show: when to use a lollipop chart](https://www.tableau.com/blog/viz-whiz-when-use-lollipop-chart-and-how-build-one-64267) (não abriu): observar o argumento de redução de tinta e os casos em que a barra continua melhor.
- Catálogo: [From Data to Viz, lollipop chart](https://www.data-to-viz.com/graph/lollipop.html): observar os erros listados: não ordenar os grupos quando não há hierarquia natural, usar lollipop com vários valores por grupo ("Several values per group? Don't use a lollipop") e pendurar barra de erro no disco.
- Praticante: [3iap, bars vs lollipops (vs dot plots)](https://3iap.com/bar-graphs-vs-lollipop-charts-vs-dot-plots-experiment-PP8-qapwQe2fRBJu1-ADfA/): observar que barra e lollipop não diferiram em acerto entre 141 participantes e que o lollipop foi mais rápido que o dot plot; é argumento para escolher pelo cartão, não pela precisão.
- Portal de design: [Behance, Dark Themed Business Management Dashboard UI](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI): dashboard escuro com acentos vibrantes; observar a hierarquia criada só por cor de acento sobre fundo escuro, que decide se uma haste de 2px sobrevive no cartão.

---

## 14. Lollipop vertical

**Descrição.** O mesmo modelo 13 girado: haste de baixo para cima e disco no topo. No Highcharts isso é
`chart.inverted`. Serve quando a categoria tem ordem natural que o leitor espera da esquerda para a direita:
mês, semana, etapa do funil, faixa de valor.

**Anatomia.** Eixo de categoria embaixo com rótulos curtos e horizontais; eixo quantitativo à esquerda
ancorado no zero; hastes verticais de 2px; discos no topo; valor acima do disco quando cabe.

**Abordagem na stack.** `recharts-custom`: `BarChart` na orientação padrão com a mesma `shape` do modelo 13
adaptada (retângulo fino vertical mais círculo no topo). A geometria da `shape` muda: `height` é o comprimento,
`y` é o topo.

**Ponto delicado.** Rótulo de categoria. Vertical só funciona com rótulo curto e horizontal; no instante em que
o rótulo precisa girar 45 graus, o modelo está errado e o certo é o 13. É o mesmo teste da família 03. Segundo
ponto: valores muito próximos do topo do domínio deixam o disco encostado na borda; reservar folga de
`raio + 4px` no `domain` superior.

**Versões sugeridas.**
- **V1 básica: fechamentos por mês.** 12 meses fictícios, contagem, disco no topo.
- **V2 com destaque: o mês corrente parcial.** O último mês com disco vazado e haste tracejada, legenda
  "mês em curso, dado parcial".
- **V3 densa do Farol: entradas por semana na pré-vendas.** 26 semanas, `ReferenceLine` no teto medido de
  capacidade, semanas acima do teto com disco em `--negativo`.
- **V4 caso limite: uma categoria domina a escala.** Uma semana de campanha pontual com o quádruplo das demais;
  em vez de escala log, cortar a haste com marca de quebra e escrever o valor acima, com nota do corte.

**Referências.**
- Catálogo: [Highcharts, lollipop series](https://www.highcharts.com/docs/chart-and-series-types/lollipop-series): observar `chart.inverted` como a chave entre horizontal e vertical e os parâmetros de conector.
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar que a família *Magnitude* separa coluna e barra pela mesma lógica de rótulo que decide entre lollipop vertical e horizontal.
- Praticante: [Darío Weitz, lollipop e dumbbell charts com Plotly](https://medium.com/data-science/lollipop-dumbbell-charts-with-plotly-696039d5f85) (não abriu): observar a construção por camadas (linha mais marcador) e a discussão de quando cada um serve.
- Portal de design: [Dribbble, Bar Chart Dashboard Card, tema escuro](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme) (não abriu): cartão de gráfico em tema escuro; observar o contraste de haste fina sobre fundo escuro, que é o risco do lollipop.

---

## 15. Lollipop divergente

**Descrição.** Lollipop com o eixo ancorado numa referência que não é o extremo: zero no meio, hastes para os
dois lados. Junta a legibilidade do lollipop com a leitura de sinal do diverging bar.

**Anatomia.** Linha de referência vertical forte no centro, rotulada; hastes saindo dela; discos nas pontas;
rótulos de categoria à esquerda do plot, **fora** da área de dados, nunca no centro; cor por polaridade;
domínio simétrico.

**Abordagem na stack.** `recharts-custom`: `Bar dataKey={d => [0, d.valor]}` com a `shape` do modelo 13, que já
trata `width` negativo, mais `ReferenceLine x={0}`. Rótulos de categoria no `YAxis`, à esquerda.

**Ponto delicado.** A tentação de colocar o rótulo da categoria no centro, junto ao zero, "para economizar
espaço": isso quebra a lista, porque o rótulo passa a andar conforme o sinal e o olho perde a coluna de leitura.
Rótulo sempre na mesma coluna. Segundo ponto: `width` negativo em `<rect>` é inválido em SVG; a `shape` precisa
de `Math.min(x, x + width)` e `Math.abs(width)`, como no código do modelo 13.

**Versões sugeridas.**
- **V1 básica: variação de leads por origem contra o mês anterior.** 14 origens, variação absoluta, zero no
  meio rotulado "mês anterior".
- **V2 com anotação: a origem que mais caiu.** Disco maior e rótulo direto com o valor e o percentual.
- **V3 densa do Farol: desvio do custo por unidade entregue contra o orçado, por área.** 18 áreas fictícias,
  cor por polaridade (acima do orçado é ruim), ordenado pelo desvio.
- **V4 caso limite: quase tudo do mesmo lado.** Num mês em que 17 das 18 áreas ficam acima do orçado, a peça
  vira quase um lollipop comum; a nota "17 de 18 acima" evita que o leitor ache que o zero está errado.

**Referências.**
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar a família *Deviation* e as formas que ela lista, que emprestam a lógica de zero central.
- Catálogo: [Highcharts, lollipop series](https://www.highcharts.com/docs/chart-and-series-types/lollipop-series): observar que o conector é parametrizado à parte do marcador, o que permite colorir haste e disco por regras diferentes.
- Catálogo: [Data Viz Project, lollipop chart](https://datavizproject.com/data-type/lollipop-chart/) (não abriu, HTTP 403): pelo resultado da busca, a ficha registra o *diverging lollipop chart* como forma vizinha que mostra divergência a partir de um valor, e o ganho do lollipop quando todos os valores são altos, na faixa de 80% a 90%.
- Praticante: [Storytelling with Data, a little math on non-zero baselines](https://www.storytellingwithdata.com/blog/2014/02/a-little-math-on-non-zero-baselines) (não abriu): observar a matemática da distorção quando a âncora muda, que é o que justifica manter o zero visível aqui.
- Portal de design: [Behance, busca charts dashboard](https://www.behance.net/search/projects/charts%20dashboard) (não abriu): observar como as peças resolvem a coluna de rótulos em gráficos divergentes.

---

## 16. Lollipop agrupado

**Descrição.** Duas hastes por categoria, lado a lado dentro da banda, cada uma com seu disco. Equivale ao
gráfico de barras agrupado com metade da tinta, e mantém a âncora no zero que o dot plot agrupado abandona.

**Anatomia.** Banda de categoria dividida em duas sublinhas; hastes deslocadas verticalmente; discos com cores
de série; legenda de série; espaçamento entre bandas maior que entre sublinhas, para o agrupamento ser lido.

**Abordagem na stack.** `recharts-custom`: dois `Bar` irmãos com a mesma `shape` do modelo 13 e cores
diferentes; o Recharts já divide a banda entre eles. Ajustar `barSize` e `barGap` para que a folga entre
sublinhas seja menor que a folga entre categorias, senão o agrupamento some.

**Ponto delicado.** A hierarquia de espaçamento. Com `barGap` e `barCategoryGap` no padrão, a distância entre
duas sublinhas da mesma categoria fica parecida com a distância entre categorias, e o leitor agrupa errado. A
regra prática: folga entre categorias de pelo menos o dobro da folga entre sublinhas. Segundo ponto: com duas
séries a leitura de razão volta a ser exigida ("A é o dobro de B?"), e aí o disco atrapalha; se essa for a
pergunta, é barra agrupada da família 02.

**Versões sugeridas.**
- **V1 básica: agendas e oportunidades por SDR.** 8 SDRs, duas séries, mesmo eixo de contagem.
- **V2 com destaque: a maior diferença entre as séries.** A categoria com a maior distância entre os dois
  discos ganha fundo de banda e nota "converte 12% das agendas".
- **V3 densa do Farol: investimento e leads por plataforma, dois meses.** Quatro plataformas, duas séries,
  eixo duplo evitado por normalização (índice base 100 no mês anterior), declarada no subtítulo.
- **V4 caso limite: uma série inteira ausente.** Uma plataforma sem investimento no mês corrente mostra só a
  sublinha do mês anterior, com a outra marcada "sem veiculação", e não uma haste de comprimento zero.

**Referências.**
- Catálogo: [Highcharts, lollipop series](https://www.highcharts.com/docs/chart-and-series-types/lollipop-series): observar a configuração de múltiplas séries e a herança do módulo dumbbell.
- Catálogo: [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot): observar o mesmo teto de três marcadores por linha, que aqui vira teto de três hastes.
- Praticante: [Storytelling with Data, dot plot vs slopechart vs bar chart](https://www.storytellingwithdata.com/blog/2017/10/13/novel-vs-the-boring-old-bar-chart): observar o argumento de que a barra agrupada separa grupos pela posição sem precisar de cor.
- Portal de design: [Figma Community, Charts Components Kit, gratuito](https://www.figma.com/community/file/1117140803316010537/charts-components-kit-free) (não abriu): observar as folgas adotadas entre séries e entre categorias, que é a decisão central deste modelo.

---

## 17. Slope chart

**Descrição.** Duas colunas verticais, uma por momento, e uma reta por categoria ligando os dois valores. O
formato é de Tufte, publicado em 1983 como *table-graphic*, e a aplicação típica, na formulação de Andy Kirk,
é "a história de antes e depois". A inclinação carrega a magnitude da mudança; o cruzamento carrega a inversão
de posição, que é a notícia que nenhum outro modelo da família entrega tão bem.

**Anatomia.** Duas âncoras verticais com o rótulo do momento no topo; rótulo de categoria e valor nas duas
pontas, alinhados à esquerda na coluna esquerda e à direita na direita; retas de 1,5 a 2px; uma cor de destaque
e o resto em neutro; eixo quantitativo geralmente implícito (os números vão nos rótulos).

**Abordagem na stack.** `svg-puro` é o caminho certo. São duas colunas e N retas; o valor do Recharts aqui é
pequeno e o custo é grande, porque o problema real é **colisão de rótulo**, que nenhuma API de gráfico resolve.
Com `LineChart` e uma `Line` por categoria também funciona para até 6 ou 7 categorias, mas cada categoria vira
um componente e a legenda estoura.

```tsx
const x1 = 120, x2 = largura - 120;
const escala = (v: number) => alturaPlot - ((v - minimo) / (maximo - minimo)) * alturaPlot;
const yEsq = afastarRotulos(linhas.map(l => escala(l.inicio!)));
const yDir = afastarRotulos(linhas.map(l => escala(l.fim!)));
// as retas usam escala(); só os RÓTULOS usam yEsq e yDir
```

**Ponto delicado.** Três, todos conhecidos. Primeiro, **a colisão de rótulo**: com valores próximos os nomes se
sobrepõem; a correção é afastar os rótulos sem mover as retas, com a função `afastarRotulos` da base de
implementação, e ligar o rótulo deslocado ao ponto real com um traço fininho quando o afastamento passar de
uns 8px; Charlie Park registra a alternativa mais simples, que é aumentar a altura do cartão até os
rótulos caberem, e a regra de alinhar o texto à esquerda para o olho varrer a coluna. Segundo, **o cruzamento**: a legibilidade cai quando muitas retas se cruzam, então acima de ~10
categorias o certo é o modelo 18 ou destacar duas ou três e apagar o resto. Terceiro, **o zero**: slopegraph
não precisa dele, mas se as duas colunas tiverem escalas diferentes o gráfico mente; escala única, sempre.

**Versões sugeridas.**
- **V1 básica: participação por canal, ano anterior contra atual.** Seis canais fictícios, percentual nas duas
  pontas, escala única.
- **V2 com destaque e anotação: a inversão.** Dois canais que trocaram de posição em `--chart-1` e `--chart-2`,
  os outros quatro em `--line-strong` com opacidade 0,4, e uma anotação curta apontando o cruzamento.
- **V3 densa do Farol: win rate por executivo, primeiro contra segundo semestre.** 14 executivos, com o
  intervalo de 10% a 70% que existe no diagnóstico; rótulos afastados, retas não; cor por polaridade do delta.
- **V4 caso limite: empate e ausência.** Dois executivos com o mesmo valor nos dois semestres (reta horizontal
  sobreposta, resolvida por deslocamento de rótulo) e um que entrou no meio do ano, que aparece só como ponto
  na coluna direita, com nota "entrou em julho".

**Referências.**
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar que slope aparece em *Ranking* e em *Change over Time*, com a definição "perfeito para mostrar como ranks mudaram no tempo ou variam entre categorias".
- Catálogo: [Wikipedia, slope chart](https://en.wikipedia.org/wiki/Slope_chart): observar a limitação central, o gráfico fica "crowded and difficult to interpret if too many lines cross", e a indicação de trocar por linha quando há mais de dois momentos.
- Catálogo: [RAWGraphs, how to make a slope graph](https://rawgraphs.github.io/learning/how-to-make-a-slope-graph/) (abriu parcialmente): tutorial com placares de duas temporadas de ligas de futebol; observar o mapeamento de duas colunas numéricas para as duas âncoras.
- Praticante: [Charlie Park, Edward Tufte's slopegraphs](https://charliepark.org/slopegraphs/): observar o levantamento histórico do formato, as regras de rotulagem e o tratamento de valores empatados.
- Praticante: [Storytelling with Data, more on slopegraphs](https://www.storytellingwithdata.com/blog/2014/03/more-on-slopegraphs): observar os dois usos declarados (dois momentos, ou dois grupos nas mesmas dimensões), o destaque por cor para a exceção saltar do resto e a defesa de que a reta faz sentido mesmo sem dado contínuo no meio.
- Praticante: [Edward Tufte, slopegraphs for comparing gradients: theory and practice](https://www.edwardtufte.com/notebook/slopegraphs-for-comparing-gradients-slopegraph-theory-and-practice/) (não abriu, domínio bloqueado pela rede): página do próprio Tufte; observar a inclinação tratada como a codificação principal e os exemplos que ele seleciona.
- Portal de design: [Figma Community, r19 Data Visualization Kit](https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit) (não abriu): kit livre inclusive para uso comercial; observar o tratamento tipográfico dos rótulos de ponta.

---

## 18. Slope chart em painéis

**Descrição.** Um slopegraph por categoria, dispostos em grade, com escala idêntica. É a saída documentada pelo
Nightingale para "quando o gráfico tem muitas categorias": troca o emaranhado de cruzamentos por espaço em
branco e leitura painel a painel.

**Anatomia.** Grade de painéis pequenos; em cada painel, uma reta e dois pontos; título do painel com o nome da
categoria; valor nas duas pontas; a mesma faixa vertical em todos; opcional uma reta cinza de referência (a
média geral) repetida em todos os painéis, para dar âncora comparativa.

**Abordagem na stack.** `html-tailwind` para a grade mais `svg-puro` minúsculo por painel (uma reta, dois
círculos, dois textos): é literalmente mais simples que configurar um gráfico. Para 20 painéis, um `<svg>` por
painel de ~60 elementos totais renderiza sem esforço.

**Ponto delicado.** A escala comum, de novo, é o que dá sentido à grade; painel com escala própria transforma
todas as retas em 45 graus e destrói a comparação. Segundo ponto: a **ordem dos painéis** é informação. Ordenar
por inclinação (maior queda primeiro) conta uma história; ordenar por valor final conta outra; alfabética conta
nenhuma. Declarar no subtítulo.

**Versões sugeridas.**
- **V1 básica: win rate por executivo, dois semestres, um painel por executivo.** 14 painéis, escala comum.
- **V2 com destaque: linha de referência da empresa.** Reta cinza da média da empresa repetida nos 14 painéis;
  painéis acima dela em `--positivo`.
- **V3 densa do Farol: CPL por campanha em 24 painéis.** Ordenado pela variação relativa, quatro colunas em
  telas largas e duas no tablet, com o cabeçalho da escala fixo acima da grade.
- **V4 caso limite: painel de um período só.** Campanhas que só existiram num dos meses mostram o ponto
  solitário e a marca "só em agosto", mantendo a célula na grade para não bagunçar o alinhamento.

**Referências.**
- Praticante: [Nightingale, beyond the bar](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/): observar a recomendação explícita de slope graph em pequenos múltiplos "quando um gráfico tem muitas categorias" e o ganho de espaço em branco.
- Praticante: [Charlie Park, Edward Tufte's slopegraphs](https://charliepark.org/slopegraphs/): observar a crítica de eixo com escala dupla e a decisão entre mostrar rank ordinal ou escala real, que nos painéis precisa ser a mesma em todos.
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar a posição do slope entre *Ranking* e *Change over Time*, que muda a ordenação dos painéis.
- Portal de design: [Figma Community, Data Visualization Chart Set 1](https://www.figma.com/community/file/1272086414322879429/data-visualization-chart-set-1) (não abriu): observar o dimensionamento de peças pequenas em grade e o tamanho mínimo de tipografia adotado.

---

## 19. Bump chart de ranking

**Descrição.** O slopegraph estendido a mais de dois momentos, com o eixo vertical carregando **posição** e não
valor. O FT descreve o slope como "perfeito para mostrar como ranks mudaram no tempo"; o bump chart é essa ideia
levada a 3 a 8 períodos.

**Anatomia.** Eixo vertical invertido (1 no topo); um ponto por período por categoria; retas ligando os pontos
da mesma categoria; rótulo de categoria nas duas pontas; cor de destaque para 2 ou 3 categorias, neutro para o
resto; número da posição dentro do ponto quando cabe.

**Abordagem na stack.** `recharts-nativo` com `LineChart`, `YAxis reversed domain={[1, n]}` com `ticks`
inteiros, e uma `Line` por categoria com `dot` próprio desenhando o círculo com o número. Acima de ~10
categorias, `svg-puro` para controlar rótulo e sobreposição.

**Ponto delicado.** O bump chart **apaga a magnitude**: primeiro e segundo lugar podem estar separados por 1%
ou por 400%, e o desenho é igual. Isso é uma escolha, não um defeito, mas obriga a duas coisas: o tooltip tem de
trazer o valor, e o subtítulo tem de dizer que o eixo é posição. Segundo ponto: empate de posição. Duas
categorias no mesmo rank precisam de regra de desempate declarada (por valor bruto, por ordem alfabética) ou
desenho de posição fracionária, e a regra vai na nota.

**Versões sugeridas.**
- **V1 básica: ranking de origens por volume de leads, 6 meses.** Oito origens fictícias.
- **V2 com destaque: duas trajetórias.** A origem que subiu mais e a que caiu mais em cor; as outras seis em
  cinza claro; anotação nas duas pontas.
- **V3 densa do Farol: ranking de executivos por receita reconhecida, 8 trimestres.** 14 executivos, rótulos
  só nas pontas, `afastarRotulos` nas duas colunas, número da posição dentro do ponto.
- **V4 caso limite: entrada e saída no meio da série.** Dois executivos que entraram no trimestre 4 e um que
  saiu no 6; as retas começam e terminam no meio, com ponto anelado marcando entrada e saída, e nunca
  interpolando o trecho ausente.

**Referências.**
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar a categoria *Ranking* inteira e o alerta implícito de que posição não é valor.
- Catálogo: [Wikipedia, slope chart](https://en.wikipedia.org/wiki/Slope_chart): observar o bump chart listado como forma vizinha para posição e a nota de que a leitura piora quando muitas retas se cruzam, que é o limite prático do bump.
- Catálogo: [RAWGraphs, how to make a bump chart](https://rawgraphs.github.io/learning/how-to-make-a-bump-chart/) (abriu parcialmente): pelo resultado da busca, as posições 1, 2 e 60 ganham o mesmo espaçamento "regardless of the absolute value"; observar essa frase como o aviso que o subtítulo precisa carregar.
- Catálogo: [nivo, bump chart](https://nivo.rocks/bump/): referência de anatomia apenas, porque nivo está fora da stack; observar a separação entre Bump (só posição) e AreaBump (posição com espessura pelo valor) e as receitas de dado ausente e de ponto customizado.
- Praticante: [Charlie Park, Edward Tufte's slopegraphs](https://charliepark.org/slopegraphs/): observar a distinção entre mostrar rank ordinal e mostrar escala real, que é exatamente a decisão do bump chart.
- Portal de design: [Dribbble, tag charts](https://dribbble.com/tags/charts) (não abriu): galeria ampla; observar o uso de rótulo nas duas pontas e de cor de destaque contra fundo neutro.

---

## 20. Dot plot pareado em colunas

**Descrição.** O dot plot girado 90 graus: categorias no eixo horizontal, valor no vertical, dois pontos por
categoria empilhados verticalmente e ligados por um segmento curto. É o haltere vertical, e serve quando a
categoria tem ordem natural e a comparação é entre dois grupos, não entre dois momentos.

**Anatomia.** Eixo vertical quantitativo com grade horizontal; por categoria, dois marcadores de formas
distintas ligados por segmento vertical fino; rótulos de categoria embaixo, curtos; legenda de grupo; rótulo do
delta acima do par mais alto.

**Abordagem na stack.** `recharts-custom`: `BarChart` na orientação padrão, `Bar dataKey="faixa"` com a `shape`
do modelo 7 adaptada para o eixo vertical (conector em `x` fixo, cabeças em `y` e `y + height`).

**Ponto delicado.** Pareamento falso. O modelo sugere fortemente que os dois pontos são o **mesmo objeto** em
duas condições; se forem duas populações diferentes (por exemplo, o ticket de PF e o de PJ dentro do segmento),
o conector inventa uma relação que não existe. Regra: conector só quando é o mesmo objeto. Populações
diferentes ficam sem conector e viram o modelo 2 girado.

**Versões sugeridas.**
- **V1 básica: ticket previsto e realizado por mês.** 12 meses, dois pontos por mês, conector vertical.
- **V2 com anotação: o mês em que o previsto passou do realizado.** Conector em `--negativo` e rótulo do delta.
- **V3 densa do Farol: entradas e agendas por semana.** 26 semanas, dois marcadores por semana, escala comum,
  com a distância vertical sendo a perda da etapa.
- **V4 caso limite: eixo com muitos rótulos.** Nas 26 semanas o rótulo do eixo fica ilegível; mostrar um rótulo
  a cada quatro semanas e deixar o tooltip com a data exata, em vez de girar o texto.

**Referências.**
- Catálogo: [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot): observar o conector automático entre pontos da mesma linha e a semântica de "diferença quantitativa".
- Catálogo: [Recharts, Scatter](https://recharts.github.io/en-US/api/Scatter/): observar `shape` aceitando string, `ReactElement` ou função, e `line` com `lineType="joint"` ligando os pontos na ordem do dado.
- Catálogo: [ApexCharts, dumbbell chart](https://apexcharts.com/javascript-chart-demos/column-charts/dumbbell-chart/): demo vertical com `plotOptions.bar.horizontal: false`, meses no eixo e as pontas baixa e alta em cores distintas com legenda; observar que é a geometria deste modelo e que só a legenda diz qual ponta é qual.
- Catálogo: [Highcharts, lower and upper dumbbell markers](https://www.highcharts.com/demo/highcharts/dumbbell-markers) (abriu sem o conteúdo do gráfico): demo de haltere com símbolo próprio em cada ponta; observar a forma, e não só a cor, separando os dois grupos.
- Praticante: [Practical Reporting, a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot): observar a causa de confusão número cinco, a orientação vertical que faz o leitor supor série temporal, que é o risco direto deste modelo.
- Portal de design: [Behance, busca data dashboard](https://www.behance.net/search/projects/data%20dashboard?locale=en_US) (não abriu): observar o tratamento de eixos com muitos rótulos em peças de dashboard.

---

## 21. Dot plot em matriz categórica

**Descrição.** Duas categorias, uma em cada eixo, e um ponto em cada cruzamento, com o valor codificado em
tamanho ou em cor. É a fronteira desta família com o mapa de calor: o ponto ocupa menos área que a célula cheia
e deixa o fundo respirar, o que ajuda quando a matriz é esparsa.

**Anatomia.** Eixos categóricos nos dois lados; ponto por cruzamento; tamanho por área (nunca por raio) ou cor
sequencial; legenda de tamanho com dois ou três círculos de referência; célula sem dado deixada **vazia de
verdade**, sem ponto, com a legenda explicando.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart` com os dois eixos em `type="category"` e `ZAxis` para
o tamanho, lembrando que `ZAxis` mapeia **área em px²** e precisa de `domain` começando em zero. Alternativa
`html-tailwind`: uma `grid` com um `div` redondo por célula, mais simples de tornar acessível e navegável por
teclado.

**Ponto delicado.** Ponto ausente contra ponto de valor zero. Sem regra explícita os dois somem e o leitor lê a
mesma coisa; a convenção do Farol é ponto minúsculo anelado para zero e célula totalmente vazia para ausência,
com as duas na legenda. Segundo ponto: com dois eixos categóricos densos o modelo deixa de ser desta família e
vira **15_mapa-de-calor-e-calendario**, que usa a célula inteira e lê melhor em alta densidade.

**Versões sugeridas.**
- **V1 básica: oportunidades por origem e por segmento.** Seis origens, cinco segmentos, tamanho por contagem.
- **V2 com destaque: os cruzamentos que ganharam negócio.** Cruzamentos com pelo menos uma vitória em
  `--positivo`, os demais em neutro; anotação com a contagem.
- **V3 densa do Farol: motivo de perda por etapa do funil.** 18 motivos por 6 etapas, tamanho por contagem,
  ordenado por total de motivo e total de etapa, com marginais em texto nas bordas.
- **V4 caso limite: matriz esparsa.** Dos 108 cruzamentos só 31 têm dado; o desenho fica com 77 células vazias
  e a nota "77 de 108 cruzamentos sem ocorrência" evita a leitura de erro de carga.

**Referências.**
- Catálogo: [FT chart-doctor, visual vocabulary](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md): observar *XY heatmap* e *ordered proportional symbol* como vizinhos diretos deste desenho.
- Catálogo: [Vega, dot plot example](https://vega.github.io/vega/examples/dot-plot/) (não abriu): observar a especificação mínima de um dot plot e a separação entre escala de posição e escala de tamanho.
- Praticante: [DataViz Catalogue, chart snapshot: dot distribution plots](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/) (não abriu): observar a distinção entre ponto como unidade e ponto como contagem.
- Portal de design: [Dribbble, Dashboard charts library (Setproduct)](https://dribbble.com/shots/14154711-Dashboard-charts-library) (não abriu): observar o tratamento de grades densas em tema escuro e o contraste mínimo de marcadores pequenos.

---

## 22. Dot plot com resumo e distribuição ao fundo

**Descrição.** O ponto de resumo por categoria (mediana, média) desenhado sobre a nuvem dos valores
individuais, em opacidade baixa. Junta a leitura rápida do dot plot com a honestidade de mostrar quantos casos
sustentam aquele ponto, sem ir para o box plot.

**Anatomia.** Por linha, pontos individuais pequenos e translúcidos (3px, opacidade 0,25) mais o marcador de
resumo grande e opaco; `n` ao lado do nome; opcional faixa interquartil discreta ao fundo; declaração do que é
o marcador de resumo.

**Abordagem na stack.** `recharts-nativo`: dois `Scatter` no mesmo `ScatterChart`, o de fundo com os individuais
e o da frente com o resumo. O de fundo precisa vir **primeiro** na árvore para ficar atrás.

**Ponto delicado.** O deslocamento vertical dos pontos individuais dentro da banda tem de ser determinístico,
derivado de um hash do id, e nunca `Math.random()`: com aleatório, o gráfico treme a cada render e diverge entre
servidor e cliente. Segundo ponto: acima de ~400 pontos por linha a nuvem vira barra sólida e o modelo perde a
graça; nesse volume, o certo é **16_distribuicao** com beeswarm ou violino.

**Versões sugeridas.**
- **V1 básica: ciclo mediano por segmento com os casos ao fundo.** Cinco segmentos, `n` visível.
- **V2 com anotação: mediana que não descreve.** Segmento com dois agrupamentos claros marcado com a nota
  "dois grupos: 18 e 140 dias; a mediana fica no vazio".
- **V3 densa do Farol: minutos até o primeiro contato por SDR.** 8 SDRs, ~900 leads, `ReferenceLine` no SLA e
  marcador da mediana por SDR.
- **V4 caso limite: `n` pequeno.** Duas SDRs com `n` de 4 e 6 mostram só os pontos individuais, sem marcador de
  resumo, com a nota "n < 10: mediana não calculada".

**Referências.**
- Catálogo: [Observable Plot, dodge transform](https://observablehq.com/plot/transforms/dodge) (não abriu): observar que o dodge coloca cada ponto na posição mais próxima da linha de base sem interseção, alternativa determinística ao jitter aleatório.
- Catálogo: [Observable Plot, dot mark](https://observablehq.com/plot/marks/dot) (não abriu): observar os canais de raio e símbolo e o uso de dodge para beeswarm.
- Praticante: [Practical Reporting, a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot): observar o risco de o leitor ler a nuvem como dispersão, que aqui é real e se corrige com o rótulo do eixo.
- Portal de design: [Figma Community, Advanced Data Visualization](https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization) (não abriu): observar como o kit trata opacidade e camadas de marcador.

---

## 23. Dot plot com marca direcional

**Descrição.** A resposta de Nick Desbarats ao dot plot que o público não reconhece: trocar o círculo por uma
marca que diz em que direção a medida corre. São duas formas. O **pipe**, um traço curto perpendicular ao eixo,
e a **barra esmaecida**, uma barra encurtada e translúcida que termina num traço forte no valor e, nas palavras
dele, "sugere visualmente a ponta de uma barra". A codificação continua sendo posição, a escala continua podendo
começar fora do zero, mas o leitor deixa de achar que está diante de uma dispersão.

**Anatomia.** Rótulo de categoria à esquerda; marca de 2px de largura por 60% da altura da banda (pipe), ou
retângulo de até 40px com gradiente de opacidade de 0 a 0,5 terminando num traço opaco de 2px no valor (barra
esmaecida); nenhuma reta atravessando a marca; grade quantitativa vertical visível; a partir de ~8 categorias,
faixa larga e clara por linha para o pipe, ou separador fino entre linhas para a barra esmaecida; ordem declarada.

**Abordagem na stack.** `recharts-custom`: `ComposedChart layout="vertical"` com `Bar dataKey="valor"` e `shape`
que usa só a ponta da barra (`x + width`) e ignora a base, então o domínio sem zero não atrapalha. O gradiente vai
num `<defs>` filho do gráfico, que o Recharts 3 aceita como filho arbitrário.

```tsx
type FormaMarca = { x?: number; y?: number; width?: number; height?: number };

function marcaDirecional(variante: 'pipe' | 'esmaecida', gradId: string) {
  return function Marca({ x = 0, y = 0, width = 0, height = 0 }: FormaMarca) {
    const xValor = x + width;                 // a ponta da barra é o valor
    const h = height * 0.6, topo = y + (height - h) / 2;
    const traco = <rect x={xValor - 1} y={topo} width={2} height={h} fill="var(--chart-1)" />;
    if (variante === 'pipe') return traco;
    const recuo = Math.min(40, Math.abs(width));
    const xRecuo = width >= 0 ? xValor - recuo : xValor;   // negativo esmaece em direção ao zero
    return (
      <g>
        <rect x={xRecuo} y={topo} width={recuo} height={h} fill={`url(#${gradId})`}
          transform={width < 0 ? `rotate(180 ${xRecuo + recuo / 2} ${topo + h / 2})` : undefined} />
        {traco}
      </g>
    );
  };
}

// no componente: const gradId = `esm-${useId().replace(/:/g, '')}`;
<ComposedChart layout="vertical" data={linhas}>
  <defs>
    <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" style={{ stopColor: 'var(--chart-1)', stopOpacity: 0 }} />
      <stop offset="100%" style={{ stopColor: 'var(--chart-1)', stopOpacity: 0.5 }} />
    </linearGradient>
  </defs>
  <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
  <XAxis type="number" domain={[120, 420]} />
  <YAxis type="category" dataKey="executivo" width={120} axisLine={false} tickLine={false} />
  <Bar dataKey="valor" shape={marcaDirecional('esmaecida', gradId)} isAnimationActive={false} />
</ComposedChart>
```

**Ponto delicado.** Três. Primeiro, o `id` do gradiente: dois gráficos na mesma página com `id` fixo compartilham
o mesmo `<linearGradient>` e o segundo herda a cor do primeiro sem erro nenhum; gerar com `useId` e tirar os dois
pontos que o React 18 põe no valor, porque `url(#:r0:)` não resolve em todo navegador. Segundo, a cor do
gradiente: `stop-color` como atributo não lê variável CSS de forma confiável, então vai em `style`, senão o tema
escuro não troca a cor. Terceiro, a própria evidência: o autor avisa que as propostas "são apenas hipóteses",
não testadas contra o dot plot comum com leitor sem treino, e o experimento da 3iap mostra que a diferença de
precisão entre as formas é de ~1%. O ganho esperado é reconhecimento, e ele deve ser validado com o time.

**Versões sugeridas.**
- **V1 básica: agendas por SDR com pipe.** 8 SDRs fictícios, sem guia por linha porque a lista não passa de
  oito, grade vertical, ordenado do maior para o menor.
- **V2 com destaque e anotação: ticket médio por executivo com barra esmaecida.** 14 executivos fictícios,
  escala começando em 120 com a nota "escala não começa em zero", os três abaixo do piso de ticket com traço em
  `--negativo` e nota "3 de 14 abaixo do piso".
- **V3 densa do Farol: taxa de qualificação por origem.** 22 origens fictícias, barra esmaecida, separador fino
  entre linhas, `ReferenceLine` na taxa média, cartão rolável com o eixo fixo no topo.
- **V4 caso limite: desvio contra o orçado com negativos e dado ausente.** 18 áreas fictícias, domínio simétrico;
  nas negativas a barra esmaece em direção ao zero; duas áreas sem fechamento no mês ficam só com o rótulo e a
  marca "sem dado", sem traço no zero.

**Referências.**
- Praticante: [Practical Reporting, a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot): observar o pipe e a barra esmaecida, a remoção das guias de categoria, a guia larga e clara acima de oito categorias e a ressalva de que tudo ainda é hipótese.
- Praticante: [3iap, bars vs lollipops (vs dot plots)](https://3iap.com/bar-graphs-vs-lollipop-charts-vs-dot-plots-experiment-PP8-qapwQe2fRBJu1-ADfA/): observar que a diferença de acerto entre as formas ficou em ~1% e a de tempo em ~1 segundo; a marca direcional disputa reconhecimento, não precisão.
- Catálogo: [Datawrapper Academy, customizing your dot plot](https://www.datawrapper.de/academy/customizing-your-dot-plot): observar *custom grid lines* e *tick position* como os controles de guia quantitativa que este modelo precisa manter visíveis.
- Portal de design: [Behance, Dark Themed Business Management Dashboard UI](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI): observar a hierarquia por cor de acento sobre fundo escuro, útil para calibrar a opacidade máxima da barra esmaecida.

---

## Modelos vistos nas fontes que moram em outra família

- **Barra e coluna ordenada** (FT, *Ranking*): a comparação de magnitude com âncora no zero é **02** e **03**.
  Aparecem aqui só como contraprova, porque o teste de Storytelling with Data mostrou a plateia escolhendo a
  barra mesmo quando o dot plot estava disponível.
- **Ordered proportional symbol** (FT, *Ranking*): símbolo dimensionado por valor em lista ordenada é
  **09_dispersao-e-bolhas** pela codificação de área, ou **22_unidades-waffle-e-pictograma** quando o símbolo é
  figurativo.
- **Connected scatterplot** (FT, *Correlation* e *Change over Time*): duas medidas quantitativas ligadas no
  tempo é **09**, não aqui; aqui um dos eixos é sempre categórico.
- **Bullet chart** (Few): ponto contra meta **com faixa qualitativa de fundo** é **13_progresso-meta-e-gauge**.
  O modelo 12 é a variante sem a faixa qualitativa, e essa é a fronteira.
- **Beeswarm, strip chart, raincloud, box plot e violino** (Wilke, Observable Plot): quando a pergunta vira "qual
  a forma da distribuição", é **16_distribuicao**. O modelo 22 é o ponto exato onde as duas famílias se tocam.
- **Barcode plot e histograma** (FT, *Distribution*): **16**.
- **Diverging bar, diverging stacked bar e spine chart** (FT, *Deviation*): **02_barras-horizontais**. O modelo
  15 empresta a lógica de zero central mas mantém o ponto.
- **Comet chart** (exemplo de `trail` no Altair): trilha que afina do início ao fim; é o arrow plot com largura
  variável e, no plano de duas medidas, vira **09**. Sem paralelo nativo na stack e sem ganho sobre a seta.
- **Cycle plot e sparkline em lista** (04 e 24): série curta repetida por categoria é linha, não ponto.
- **Linha com muitos pontos no tempo:** **04_linhas**. A regra é a da Datawrapper: acima de três marcadores por
  categoria, o desenho já é linha.
- **Tabela com ícone direcional** (Nightingale): a alternativa mais barata ao arrow plot é a seta dentro da
  célula de uma tabela; isso é **14_tabelas-visuais**, e vale considerar antes de construir o gráfico.
- **XY heatmap** (FT): matriz categórica densa com célula cheia é **15_mapa-de-calor-e-calendario**; o modelo 21
  só faz sentido enquanto a matriz é esparsa.
- **Parallel coordinates** (FT, *Magnitude*): várias medidas por entidade em eixos paralelos parece slopegraph
  com mais colunas, mas a pergunta é multivariada; mora em **25_matriz-e-quadrantes** ou **18_radar** conforme o
  desenho, não aqui.
- **Circular barplot e lollipop radial** (From Data to Viz, vizinho do lollipop): barras ou hastes em círculo
  perdem o eixo reto comum; moram em **07_rosca-e-radial**.
- **Dot plot de Wilkinson** (pontos empilhados por contagem): cada ponto é uma observação e a pilha é a
  frequência; é **16_distribuicao**, ou **22_unidades-waffle-e-pictograma** quando o ponto é unidade contável.
- **Area bump** (nivo): ranking com a espessura da faixa dando o valor; a leitura é de área no tempo, perto de
  **05_areas**. O modelo 19 fica só com a posição.
- **Range bar com início e fim datados** (AG Charts, range bar): quando a categoria é tarefa e o eixo é
  calendário, é **20_cronograma-e-linha-do-tempo**; o modelo 11 fica com faixas de valor.
- **Arrow variation chart em plano XY** (Observable Plot): a seta entre duas medidas quantitativas é
  **09_dispersao-e-bolhas**; aqui a seta corre sempre sobre um eixo único.

---

## Fontes consultadas

Pesquisa feita em duas passadas no mesmo dia (2026-09-14). A segunda conferiu links que a primeira só tinha visto
em busca, acrescentou os catálogos que faltavam e fundamentou o modelo 23. Todas as aberturas foram diretas, sem proxy.

### Abertas e lidas

- [DataViz Catalogue, chart snapshot: Cleveland dot plots](https://datavizcatalogue.com/blog/chart-snapshot-cleveland-dot-plots/)
- [DataViz Catalogue, chart snapshot: dumbbell plots](https://datavizcatalogue.com/blog/chart-snapshot-dumbbell-plot/)
- [Datawrapper Academy, how to create a dot plot](https://www.datawrapper.de/academy/how-to-create-a-dot-plot)
- [Datawrapper Academy, customizing your dot plot](https://www.datawrapper.de/academy/customizing-your-dot-plot)
- [Datawrapper Academy, how to create a range plot](https://www.datawrapper.de/academy/how-to-create-a-range-plot)
- [Datawrapper Academy, how to create an arrow plot](https://www.datawrapper.de/academy/how-to-create-an-arrow-plot)
- [Datawrapper blog, new arrow and range plots](https://www.datawrapper.de/blog/new-arrow-and-range-plots)
- [FT chart-doctor, visual vocabulary (README)](https://github.com/ft-interactive/chart-doctor/blob/master/visual-vocabulary/README.md)
- [Flourish blog, (Ar)row row row your plot](https://flourish.studio/blog/make-arrow-plots/)
- [From Data to Viz, lollipop chart](https://www.data-to-viz.com/graph/lollipop.html)
- [Highcharts, lollipop series](https://www.highcharts.com/docs/chart-and-series-types/lollipop-series)
- [Highcharts, dumbbell series](https://www.highcharts.com/docs/chart-and-series-types/dumbbell-series)
- [ApexCharts, dumbbell chart (demo vertical)](https://apexcharts.com/javascript-chart-demos/column-charts/dumbbell-chart/)
- [AG Charts, range bar series (React)](https://www.ag-grid.com/charts/react/range-bar-series/)
- [Vega-Lite, ranged dot plot](https://vega.github.io/vega-lite-v2/examples/layer_ranged_dot.html)
- [nivo, bump chart](https://nivo.rocks/bump/) (só como referência de anatomia; fora da stack)
- [Storytelling with Data, dot plot vs slopechart vs bar chart](https://www.storytellingwithdata.com/blog/2017/10/13/novel-vs-the-boring-old-bar-chart)
- [Storytelling with Data, more on slopegraphs](https://www.storytellingwithdata.com/blog/2014/03/more-on-slopegraphs)
- [Practical Reporting (Nick Desbarats), a friendlier dot plot](https://www.practicalreporting.com/blog/2019/2/20/a-friendlier-dot-plot)
- [3iap, settling the debate: bars vs lollipops (vs dot plots)](https://3iap.com/bar-graphs-vs-lollipop-charts-vs-dot-plots-experiment-PP8-qapwQe2fRBJu1-ADfA/)
- [Nightingale, beyond the bar: alternative methods for visualizing two points of change](https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/)
- [Charlie Park, Edward Tufte's slopegraphs](https://charliepark.org/slopegraphs/)
- [Wikipedia, slope chart](https://en.wikipedia.org/wiki/Slope_chart)
- [Recharts, Scatter API](https://recharts.github.io/en-US/api/Scatter/)
- [Recharts, ErrorBar API](https://recharts.github.io/en-US/api/ErrorBar/)
- [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/)
- [Recharts, Custom Shape Bar Chart](https://recharts.github.io/en-US/examples/CustomShapeBarChart/)
- [Behance, Dark Themed Business Management Dashboard UI](https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI)

### Abertas parcialmente ou com falha

- [Visa Product Design System, dumbbell plot](https://design.visa.com/data-visualization/charts/dumbbell-plot/): carregou, conteúdo truncado antes da especificação.
- [Perceptual Edge (Stephen Few), dot plots: a useful alternative to bar charts](https://www.perceptualedge.com/articles/b-eye/dot_plots.pdf): PDF baixado, não convertido em texto legível; o argumento citado veio de resultado de busca.
- [Highcharts, lower and upper dumbbell markers](https://www.highcharts.com/demo/highcharts/dumbbell-markers): carregou a página, sem a especificação do gráfico.
- [RAWGraphs, how to make a slope graph](https://rawgraphs.github.io/learning/how-to-make-a-slope-graph/): carregou só a entrada do tutorial.
- [RAWGraphs, how to make a bump chart](https://rawgraphs.github.io/learning/how-to-make-a-bump-chart/): carregou só a entrada do tutorial; a frase sobre espaçamento veio da busca.
- [UC Davis Data Viz Idea Lab, dumbbell plot](https://datavizidealab.ucdavis.edu/dumbbell): HTTP 403.
- [Data Viz Project (Ferdio), dumbbell plot](https://datavizproject.com/data-type/dumbbell-plot/): HTTP 403.
- [Data Viz Project (Ferdio), lollipop chart](https://datavizproject.com/data-type/lollipop-chart/): HTTP 403; o resumo citado veio da busca.
- [Data Viz Project (Ferdio), dot chart](https://datavizproject.com/data-type/dot-chart/): HTTP 403; o resumo citado veio da busca.
- [Figma Community, Charts Components For Free, mais de 30 desenhos](https://www.figma.com/community/file/1341342078358634043/charts-components-for-free-more-than-30-designs-available): HTTP 403.
- [Dribbble, Dashboard charts library (Setproduct)](https://dribbble.com/shots/14154711-Dashboard-charts-library): respondeu sem conteúdo legível.
- [Edward Tufte, slopegraphs for comparing gradients: theory and practice](https://www.edwardtufte.com/notebook/slopegraphs-for-comparing-gradients-slopegraph-theory-and-practice/): domínio bloqueado pela rede.
- [Observable Plot, arrow mark](https://observablehq.com/plot/marks/arrow): HTTP 429.
- [Observable Plot, link mark](https://observablehq.com/plot/marks/link): HTTP 429.

### Vistas em resultado de busca, não abertas

Catálogos e bibliotecas:

- [Datawrapper Academy, customizing your arrow plot](https://www.datawrapper.de/academy/customizing-your-arrow-plot)
- [Datawrapper Academy, examples of Datawrapper dot and range plots](https://www.datawrapper.de/academy/examples-of-datawrapper-dot-charts)
- [Datawrapper Academy, examples (espelho)](https://academy.datawrapper.de/article/281-examples-of-datawrapper-dot-charts)
- [Datawrapper blog, easy comparison: dot plots](https://www.datawrapper.de/blog/brand-new-dot-plots)
- [Datawrapper, arrow plots](https://www.datawrapper.de/charts/arrow-plot)
- [DataViz Catalogue, chart snapshot: dot distribution plots](https://datavizcatalogue.com/blog/chart-snapshot-dot-distribution-plot/)
- [Vega, dot plot example](https://vega.github.io/vega/examples/dot-plot/)
- [Observable Plot, dot mark](https://observablehq.com/plot/marks/dot)
- [Observable Plot, dodge transform](https://observablehq.com/plot/transforms/dodge)
- [Observable, Plot: arrow variation chart](https://observablehq.com/@observablehq/plot-arrow-variation-chart)
- [Mosaic (UW Interactive Data Lab), population change arrows](https://idl.uw.edu/mosaic/examples/population-arrows.html)
- [Vega-Altair, comet chart](https://altair-viz.github.io/gallery/comet_chart.html)
- [Highcharts, dumbbell series demo](https://www.highcharts.com/demo/highcharts/dumbbell)
- [AG Charts gallery, simple range bar](https://www.ag-grid.com/charts/gallery/simple-range-bar/)
- [AG Charts gallery, multiple horizontal range bars](https://www.ag-grid.com/charts/gallery/multiple-horizontal-range-bars/)
- [nivo, area bump chart](https://nivo.rocks/area-bump/)
- [R Graph Gallery, lollipop chart with 2 groups](https://r-graph-gallery.com/303-lollipop-plot-with-2-values.html)
- [D3 Graph Gallery, Cleveland dot plot](https://d3-graph-gallery.com/graph/lollipop_cleveland.html)
- [Apache ECharts, examples](https://echarts.apache.org/examples/en/index.html): sem exemplo específico de dumbbell ou lollipop localizado na busca.
- [shadcn/ui, charts (área)](https://ui.shadcn.com/charts/area)
- [Wikipedia, dot plot (statistics)](https://en.wikipedia.org/wiki/Dot_plot_(statistics))
- [FT visual vocabulary, PDF hospedado pelo Journalism Courses](https://journalismcourses.org/wp-content/uploads/2020/07/Visual-vocabulary.pdf)
- [Domo, Cleveland dot plot](https://www.domo.com/learn/charts/cleveland-dot-plot)
- [Domo, dumbbell chart](https://www.domo.com/learn/charts/dumbbell-plot-chart)
- [Domo, slope chart](https://www.domo.com/learn/charts/slope-chart)

Praticantes:

- [Edward Tufte forum, response to slopegraphs for comparing gradients](https://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0003uu)
- [Andy Kirk, Visualising Data](https://visualisingdata.com/)
- [PolicyViz, episode 157 com Alberto Cairo](https://policyviz.com/podcast/episode-157-alberto-cairo/)
- [Storytelling with Data, a little math on non-zero baselines](https://www.storytellingwithdata.com/blog/2014/02/a-little-math-on-non-zero-baselines)
- [FlowingData, how to make dot plots in R](https://flowingdata.com/2015/04/15/how-to-make-dot-plots-in-r/)
- [FlowingData, bar chart baselines start at zero](https://flowingdata.com/2015/08/31/bar-chart-baselines-start-at-zero/)
- [FlowingData, tag slopegraph](https://flowingdata.com/tag/slopegraph/)
- [FlowingData, chart types](https://flowingdata.com/chart-types/)
- [Nightingale (Mike Raper), the dumbbell plot: a how-to guide](https://medium.com/nightingale/the-dumbbell-plot-a-how-to-guide-5dafd1d67581)
- [Darío Weitz, lollipop e dumbbell charts com Plotly](https://medium.com/data-science/lollipop-dumbbell-charts-with-plotly-696039d5f85)
- [Darío Weitz, slope charts, why and how](https://medium.com/data-science/slope-charts-why-how-11c2a0bc28be)
- [Tableau, viz variety show: when to use a lollipop chart](https://www.tableau.com/blog/viz-whiz-when-use-lollipop-chart-and-how-build-one-64267)
- [UC Business Analytics R Guide, Cleveland dot plots](https://uc-r.github.io/cleveland-dot-plots)
- [UC Business Analytics R Guide, lollipop charts](http://uc-r.github.io/lollipop)
- [VizWiz, how to create a dot strip plot](https://www.vizwiz.com/2021/06/dot-strip-plot.html)
- [Universidade de Iowa (STAT4580), dot plots and bar charts](https://homepage.divms.uiowa.edu/~luke/classes/STAT4580/dotbar.html)
- [Data and Design, replace your complex bar chart with a dot plot](https://dataanddesign.substack.com/p/replace-your-complex-bar-chart-with)
- [Information is Beautiful Awards, showcase](https://www.informationisbeautifulawards.com/showcase): a busca não localizou peça premiada específica de slope ou dot plot.

Portais de design citados nos modelos (todos vistos em busca; nenhum abriu, exceto o projeto Behance da lista de
abertas):

- [Figma Community, Data Visualisation UI Kit, 150 charts / 36 chart types](https://www.figma.com/community/file/1212977094398360391/data-visualisation-ui-kit-150-charts-36-chart-types-10-color-palettes)
- [Figma Community, Data Visualization Graphs / Charts Kit](https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit)
- [Figma Community, Advanced Data Visualization](https://www.figma.com/community/file/1258847030939461287/advanced-data-visualization)
- [Figma Community, Charts & Graphs UI Kit](https://www.figma.com/community/file/1314538669933482880/charts-graphs-ui-kit)
- [Figma Community, Charts Components Kit, gratuito](https://www.figma.com/community/file/1117140803316010537/charts-components-kit-free)
- [Figma Community, Charts UI Kit](https://www.figma.com/community/file/988105631489720603/charts-ui-kit)
- [Figma Community, r19 Data Visualization Kit](https://www.figma.com/community/file/1047125723874245889/r19-data-visualization-kit)
- [Figma Community, Data Visualization Chart Set 1](https://www.figma.com/community/file/1272086414322879429/data-visualization-chart-set-1)
- [Dribbble, Charts dark dashboard](https://dribbble.com/shots/1891117-Charts-dark-dashboard)
- [Dribbble, Bar Chart Dashboard Card, tema escuro](https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme)
- [Dribbble, tag chart](https://dribbble.com/tags/chart)
- [Dribbble, tag charts](https://dribbble.com/tags/charts)
- [Dribbble, busca comparison-chart](https://dribbble.com/search/comparison-chart)
- [Dribbble, busca dashboard-chart](https://dribbble.com/search/dashboard-chart)
- [Dribbble, busca dumbbell-plot](https://dribbble.com/search/dumbbell-plot?page=3)
- [Behance, busca data visualization chart](https://www.behance.net/search/projects/data-visualization%20chart)
- [Behance, busca charts dashboard](https://www.behance.net/search/projects/charts%20dashboard)
- [Behance, busca data dashboard](https://www.behance.net/search/projects/data%20dashboard?locale=en_US)
- [Behance, busca dark dashboard ui](https://www.behance.net/search/projects/dark%20dashboard%20ui)

### Lacunas conhecidas

- Nenhuma peça de portal de design mostra dumbbell, arrow ou slope em tema escuro com link específico aberto; as
  referências de portal são kits e buscas, e a decisão visual do Farol vai depender do protótipo.
- As fichas do Data Viz Project (Ferdio) responderam 403; o que se cita delas vem do texto da busca.
- A página de slopegraph do próprio Tufte ficou bloqueada pela rede; o conteúdo de Tufte chega por Charlie Park e
  pela Wikipedia.
- O modelo 23 se apoia numa proposta que o autor declara não testada; entra no catálogo como hipótese a validar.
