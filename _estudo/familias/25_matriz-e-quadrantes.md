# Família 25: matriz e quadrantes

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa ou empresa real.

## O que a família responde

Matriz e quadrantes é a família da **classificação por duas dimensões**. Ela não pergunta "qual o valor", como a
barra, nem "existe relação", como a dispersão: pergunta **"em que grupo isto cai e o que se faz com esse grupo"**.
O plano é cortado por limiares e cada região ganha um nome que já carrega uma decisão: acelerar, manter,
investigar, cortar. O Data Viz Project trata o caso canônico como *Opposite Diagram* (também 2x2 Diagram ou 2x2
Matrix), dois conjuntos de opostos em um eixo horizontal e um vertical, e registra a característica que define a
família: os valores podem ser orientados a dados, mas o uso é frequentemente conceitual, mostrando os opostos de
uma questão em escala relativa.

Há duas metades na família, que compartilham a gramática mas não a matéria-prima:

- **Quadrantes contínuos.** Os eixos são medidas numéricas e cada entidade é um ponto; o corte é uma linha de
  referência (média, mediana, meta). É dispersão que virou classificação. A fronteira com a família 09 é exata:
  em 09 a pergunta é sobre a **relação** entre X e Y; aqui é sobre a **região** em que cada entidade caiu.
- **Matrizes discretas.** Linhas e colunas são categorias e a célula é a unidade visual. Aqui entram matriz de
  risco, nine-box, matriz de confusão, de-para e cobertura. A fronteira com a família 15 também é exata: em 15 a
  grade existe para ler **intensidade por gradiente** (calendário, mapa de calor); aqui a célula existe para
  **nomear um grupo** e costuma carregar rótulo, contagem e ação, não só cor.

Perguntas típicas no Farol:

- **Comercial:** quais executivos têm volume alto e conversão baixa, e portanto um problema de qualificação e
  não de esforço? Quais motivos de perda são frequentes **e** caros? Quais contas do forecast valem muito e
  estão paradas há tempo demais? O handoff de pré-vendas para vendas piora conforme o tamanho da conta?
- **Pré-vendas:** que filas têm muita entrada e pouco atendimento dentro do SLA? Quais SDRs estão acima do teto
  de capacidade e abaixo da meta de agenda? Onde a fila cresce e a taxa de contato cai ao mesmo tempo?
- **Marketing:** quais campanhas têm CPL baixo e CPL qualificado alto, isto é, compram volume barato que não
  vira nada? Quais criativos combinam alcance grande e conversão ruim? Quais origens têm muito lead e pouca
  cobertura de dado, o que impede julgar qualquer coisa sobre elas?
- **Diretoria:** quais linhas de produto combinam crescimento e participação, na leitura de portfólio? Qual o
  mapa de risco dos cenários por probabilidade e impacto? Onde a demanda passa da capacidade instalada?

## O que a pesquisa diz, antes de desenhar

1. **O 2x2 é ferramenta de argumento, não de medida.** O Data Viz Project registra o uso frequentemente
   conceitual; a linhagem do formato inclui Eisenhower (urgente e importante), SWOT, growth-share da BCG
   (crescimento e participação), Magic Quadrant (execução e visão) e a Approval Matrix da New York Magazine.
   Isso é virtude e risco ao mesmo tempo: o quadrante convence antes de provar.
2. **O limiar é a decisão inteira.** A tcviz coloca o ponto com clareza: o defeito central do quadrante padrão é
   supor que o corte fica no meio do plano, quando linhas de referência deveriam refletir metas, orçamentos ou
   valores de SLA reais, e não onde os dados se aglomeram. Trocar a mediana pela meta muda quem é estrela e quem
   é cachorro sem que nenhum dado tenha mudado.
3. **Simetria forçada destrói ou inventa resolução.** Ainda na tcviz: obrigar uma análise assimétrica a caber
   numa grade 2x2 ou colapsa resolução significativa ou cria distinção artificial; um eixo pode precisar de
   cinco faixas enquanto o outro só precisa de passa e não passa.
4. **Matriz de risco tem defeito matemático conhecido.** A crítica clássica é de Louis Anthony "Tony" Cox
   (*What's Wrong with Risk Matrices?*, Risk Analysis, 2008): a matriz típica ordena corretamente só uma fração
   dos pares de risco e, sob certas condições, chega a ordenar um risco menor acima de um maior. Multiplicar
   escalas ordinais (raro, possível, provável) para gerar escore composto é inválido, porque são descritores
   ordinais e não intervalares. Consequência prática: a cor da célula não decide orçamento.
5. **Mais células só ajudam com critério afiado.** O 5x5 é o formato mais comum por dar resolução maior que o
   3x3 e reduzir, sem eliminar, a compressão de faixa; mas mais células só é melhor se as definições de escala
   forem precisas o bastante para pôr o risco na linha e na coluna certas de forma consistente. Com critério
   vago, o 5x5 só dá mais formas de discordar.
6. **Matriz de eixo oculto engana.** A crítica ao Magic Quadrant é instrutiva: a própria Gartner reconhece que
   os analistas precisam ter em mente de seis a oito *drivers* por eixo, ou seja, o eixo mostrado não se explica
   sozinho, e os rótulos de quadrante podem enganar se tomados ao pé da letra. No Farol, todo eixo de quadrante
   diz a métrica e a unidade, e todo eixo composto abre a fórmula no tooltip.
7. **Matriz de confusão precisa declarar a normalização.** Normalizar por linha dá revocação, por coluna dá
   precisão; sem normalizar, com classe desbalanceada, o valor absoluto leva a conclusão imprópria por causa da
   colorização do mapa de calor. O rótulo tem que dizer qual das três leituras está na tela.
8. **Pontuação em silêncio antes da discussão.** Na prática de priorização por impacto e esforço, a recomendação
   é definir os critérios antes e pontuar individualmente em silêncio antes da conversa em grupo, o mecanismo
   que impede o enquadramento de uma pessoa sobrepor a avaliação independente de todo mundo.
9. **A matriz vale por revelar aglomerado.** O argumento a favor: vinte iniciativas numa planilha são
   esmagadoras, e as mesmas vinte num plano revelam na hora aglomerado de ganho rápido ou projeto grande
   consumindo recurso. A leitura é de **massa por região**, não de posição exata de cada item.
10. **A célula quadrada de duas categorias tem nome e mark próprio.** No Observable Plot, o `cell` é uma variante
    do `rect` para quando as duas dimensões são ordinais, com escala de banda nos dois eixos e codificação por
    `fill`. Vale como definição de anatomia: matriz discreta é banda contra banda, não número contra número.
11. **Círculo na interseção é alternativa ao preenchimento.** O Data Visualisation Catalogue descreve a matriz de
    correlação como forma tabular com marcadores circulares de tamanho variável nas interseções, boa para
    variância, ocorrência, padrão, similaridade e correlação. Tamanho na célula lê melhor que gradiente quando o
    sinal é magnitude, e não ordem.
12. **9-box é ferramenta de calibração, não de medição.** O nine-box (3x3 desempenho contra potencial, origem
    McKinsey nos anos 1970, usado por boa parte das grandes empresas em revisão de talento) existe para
    sustentar conversa de calibração; a crítica recorrente é que os eixos são julgamento subjetivo apresentado
    com cara de escala. No Farol isso vira regra: eixo de julgamento sempre etiquetado como tal.

## Regras do Farol para esta família

1. **O limiar é declarado, nunca implícito.** Toda linha divisória carrega rótulo dizendo o que ela é e de onde
   veio: "mediana da carteira (R$ 148 mil)", "meta de SLA (30 min)", "break-even (R$ 4,20 por lead)". Quadrante
   sem rótulo de corte é gráfico sem eixo.
2. **Etiqueta de procedência no corte.** O registry marca cada limiar como MEDIDO (mediana da própria série),
   PREMISSA (número de planilha), DERIVADO (calculado de outros) ou LACUNA. Corte de premissa entra tracejado e
   com ícone; corte medido entra sólido. A regra existe porque o mesmo plano com corte diferente conta história
   diferente e ninguém percebe.
3. **Rótulo de quadrante diz a ação, não o apelido.** "Muito volume, pouca conversão: revisar qualificação"
   funciona; "cachorros" e "vacas leiteiras" não funcionam fora do jargão da consultoria e, pior, afirmam mais do
   que o dado sustenta. Apelido só quando o público já usa o vocabulário.
4. **Contagem por quadrante sempre visível.** Cada região mostra quantas entidades caíram nela e, quando faz
   sentido, a soma da medida de negócio (receita, investimento, fila). Quadrante com 2 itens e quadrante com 80
   parecem iguais no canto da tela se ninguém escrever o número.
5. **Fronteira é zona, não linha.** Item que cai a 1% do corte não é diferente do vizinho do outro lado. Onde a
   decisão for cara, desenhar faixa de indiferença (banda translúcida de ±x% em torno do corte) e tratar quem
   está dentro dela como "na fronteira", em cinza, fora dos quatro rótulos.
6. **Eixo composto abre a conta.** Se o eixo é um escore de vários fatores, o tooltip mostra os fatores e os
   pesos. Eixo de julgamento humano recebe marca visual própria (contorno tracejado no eixo) e a legenda diz
   "avaliação do time, não medição".
7. **Cor com um papel só.** Ou a cor pinta a região (fundo do quadrante) ou pinta a categoria do ponto, nunca as
   duas. Quando o fundo é colorido, o ponto é neutro com contorno; quando o ponto é colorido, o fundo é apenas
   um tom de superfície com a divisória visível.
8. **Fundo de quadrante em tom baixíssimo.** No tema escuro, região sombreada entre 4% e 8% de opacidade sobre a
   superfície; acima disso o fundo compete com o dado e some a grade. Verde e vermelho saturados pintando
   quadrante inteiro são proibidos: viram juízo de valor antes da leitura.
9. **Semáforo de matriz de risco precisa de segundo canal.** Cor de célula sempre acompanhada de número ou de
   padrão (densidade de traço), porque 8% dos homens têm alguma deficiência de visão de cores e porque a
   crítica de Cox vale: a cor é resumo grosseiro de uma multiplicação inválida.
10. **Matriz discreta mostra o zero e o vazio de formas diferentes.** Célula com contagem zero recebe o dígito 0
    sobre a superfície base; célula sem dado recebe hachura diagonal e entra na legenda como "sem dado". Deixar
    as duas iguais é o erro mais caro da metade discreta da família.
11. **Dado ausente não vira ponto.** Entidade sem uma das duas medidas sai do plano e vira linha de rodapé
    ("14 campanhas sem CPL qualificado não aparecem"). Nunca colocar no (0,0), porque o (0,0) é o quadrante mais
    barulhento de todos.
12. **Quadrante não é para muitos pontos.** Acima de ~120 entidades a leitura por rótulo morre; aí o modelo vira
    contagem por região (modelo 7) ou densidade (modelo 10), com a lista detalhada fora do plano.
13. **Grade discreta legível tem célula de pelo menos 44px** no menor lado, para caber contagem e para virar
    alvo de clique confortável; abaixo disso, a matriz vira mapa de calor e muda de família.
14. **Ordenação da matriz discreta é decisão.** Linha e coluna ordenadas por severidade, por volume ou pela
    ordem do processo, sempre declarado no subtítulo. Ordem alfabética esconde bloco.

## Base de implementação no Recharts 3.10

A família se divide em dois caminhos técnicos que quase não se conversam.

**Caminho A, quadrantes contínuos: Recharts.**

- `ScatterChart` é o container; `ComposedChart` quando o plano precisa dividir espaço com `Line` ou `Area`.
- `ReferenceLine` desenha o corte: `x` ou `y` em unidade de dado, `segment` para diagonal (par de coordenadas),
  `label` (string, objeto com `value` e `position`, elemento ou função) e `ifOverflow` com `discard`,
  `extendDomain`, `hidden` ou `visible`. O padrão de uso é
  `<ReferenceLine y={4000} stroke="red" strokeDasharray="3 3" label={{ value: 'Target Value', position: 'insideTopRight' }} />`.
- `ReferenceArea` pinta a região: `x1`, `x2`, `y1`, `y2` **em valor de dado, não em pixel**; o lado omitido vai
  até a borda do domínio; `ifOverflow` com padrão `discard`; `radius` aceita número ou os quatro cantos;
  `zIndex` com padrão 100 controla a camada; aceita `shape` próprio e `<Label />` como filho.
- Atenção de camada: com `ifOverflow="discard"` a área some se qualquer canto ficar fora do domínio, o que
  acontece sempre que o domínio é automático e o filtro encolhe os dados. Por isso a regra do domínio fixo.
- `Scatter` aceita `shape` (predefinidos ou componente próprio), `label`, `zAxisId`, `activeShape` e `line`;
  `ZAxis` dá a terceira medida por área do símbolo, com `range` padrão `[64, 64]` e valor em px².
- `XAxis` e `YAxis` com `type="number"`, `domain` explícito, `scale` e `reversed`. Para matriz em posto, os dois
  eixos viram `type="number"` com `reversed` no eixo de rank, ou `type="category"` quando o eixo é ordinal.
- `LabelList` com `content` próprio resolve rótulo direto no ponto; o `content` é chamado uma vez por item e
  recebe `x`, `y`, `value` e `index`.
- Recharts 3 aceita componente próprio como filho direto do gráfico e expõe hooks de layout e de escala. O índice
  da API lista `usePlotArea`, `useOffset`, `useMargin`, `useChartWidth`, `useChartHeight`, `useXAxisDomain`,
  `useYAxisDomain`, `useXAxisScale`, `useYAxisScale`, `useXAxisInverseScale` e `useYAxisInverseScale`.
  `useXAxisScale(xAxisId?)` devolve uma função de valor de dado para pixel, ou `undefined` fora do contexto do
  gráfico, e entrou na 3.8. É o encaixe oficial para seta, curva de fronteira, bin e seleção retangular: o
  componente filho lê a escala e desenha em SVG, sem refazer a conta do domínio à mão. As versões inversas
  convertem pixel em dado, o que resolve seleção por arrasto.

**Caminho B, matrizes discretas: CSS Grid com Tailwind, ou SVG puro.**

Recharts não tem componente de célula de matriz. Duas saídas, e a escolha é por tamanho:

- `html-tailwind` com `grid`: melhor até ~12x12. Cada célula é um `<button>` ou `<div>` com `aria-label`, o que
  dá foco por teclado, tooltip nativo do navegador, texto selecionável e quebra de linha de graça. Cabeçalhos de
  linha e coluna são células da própria grade (`grid-template-columns: auto repeat(N, minmax(0,1fr))`).
- `svg-puro`: quando passa de ~200 células, quando precisa de rótulo rotacionado no eixo, quando a célula leva
  glifo desenhado (círculo proporcional, meia-lua, triângulo) ou quando a matriz precisa virar imagem exportável.
  Geometria calculada em TypeScript com escala de banda escrita à mão.

```ts
export function escalaBanda(n: number, total: number, preenchimento = 0.08) {
  const passo = total / n;
  const folga = passo * preenchimento;
  return {
    passo,
    pos: (i: number) => i * passo + folga / 2,
    tam: Math.max(1, passo - folga),
    centro: (i: number) => i * passo + passo / 2,
  };
}
```

Utilitários comuns aos quadrantes contínuos:

```ts
export type Item = { id: string; nome: string; x: number; y: number; z?: number };
export type Corte = { valor: number; origem: 'MEDIDO' | 'PREMISSA' | 'DERIVADO'; rotulo: string };

export function mediana(v: number[]) {
  if (v.length === 0) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export type Regiao = 'AD' | 'AE' | 'BD' | 'BE' | 'FRONTEIRA';

export function classificar(it: Item, cx: Corte, cy: Corte, tolerancia = 0): Regiao {
  const perto = (v: number, c: number) => tolerancia > 0 && Math.abs(v - c) <= Math.abs(c) * tolerancia;
  if (perto(it.x, cx.valor) || perto(it.y, cy.valor)) return 'FRONTEIRA';
  const direita = it.x >= cx.valor;
  const alto = it.y >= cy.valor;
  return alto ? (direita ? 'AD' : 'AE') : direita ? 'BD' : 'BE';
}

export function resumoPorRegiao(itens: Item[], cx: Corte, cy: Corte, tol = 0) {
  const acc = new Map<Regiao, { n: number; soma: number }>();
  for (const it of itens) {
    const r = classificar(it, cx, cy, tol);
    const a = acc.get(r) ?? { n: 0, soma: 0 };
    acc.set(r, { n: a.n + 1, soma: a.soma + (it.z ?? 0) });
  }
  return acc;
}
```

Tokens: fundo de região `var(--chart-1)` a 6% ou `var(--surface-raised)`; divisória `var(--line-strong)`;
grade `var(--line-subtle)`; ponto neutro `var(--text-muted)`; ponto em destaque `var(--chart-2)`; célula de
matriz da superfície base até `var(--chart-1)`; hachura de "sem dado" em `var(--line-subtle)`.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Matriz 2x2 de quadrantes | classificar de 8 a 60 entidades por duas medidas com ação por região | a pergunta é a relação entre X e Y, não o grupo | corte no meio do plano por conveniência, sem dizer o que ele é |
| 2 | Quadrante com corte estatístico | não existe meta; o interesse é "acima ou abaixo do típico" | série pequena ou muito assimétrica | usar média em cauda longa e jogar quase todo mundo à esquerda |
| 3 | Quadrante com corte por meta declarada | existe SLA, break-even, teto de capacidade | a meta é palpite disfarçado de número | corte de premissa desenhado igual a corte medido |
| 4 | Quadrante com rótulos diretos | o leitor precisa saber quem é cada ponto (até ~20) | mais de 25 entidades | rótulos empilhados e ilegíveis, sem regra de seleção |
| 5 | Quadrante com bolhas | terceira medida de magnitude (receita, investimento, fila) | comparar a terceira medida com precisão | tamanho pelo raio e bolha grande escondendo pequena |
| 6 | Quadrante com sumário por região | a conclusão é "quantos e quanto caem em cada grupo" | poucas entidades, onde contar é trivial | somar medida que não é aditiva (taxa, média) por região |
| 7 | Matriz 2x2 agregada | só interessam os quatro números, para cartão pequeno | é preciso achar entidade específica | quadrante com área proporcional sugerindo posição |
| 8 | Quadrante com trajetória | mostrar movimento entre dois períodos | mais de dois momentos, ou muitas entidades | seta sem indicar onde começa e onde termina |
| 9 | Quadrante em posto | as duas medidas têm escalas incomparáveis ou caudas brutais | diferença absoluta importa | apresentar posto como se fosse valor |
| 10 | Quadrante denso | centenas ou milhares de entidades | leitor precisa identificar item | ponto opaco empilhado escondendo a massa real |
| 11 | Quadrante com distribuições marginais | ver as regiões e a forma de cada medida juntas | cartão pequeno | histograma marginal com domínio diferente do plano |
| 12 | Priorização impacto x esforço com iso-linhas | fila de iniciativas a ordenar por retorno sobre custo | insumo é achismo não calibrado | tratar o escore subjetivo como medição |
| 13 | Matriz de risco em células | catálogo de riscos por probabilidade e impacto | decidir orçamento pela cor | multiplicar escala ordinal e ordenar pelo produto |
| 14 | Nine-box 3x3 | calibrar carteira por duas dimensões de julgamento em 3 níveis | os eixos são medidas contínuas de verdade | apresentar avaliação subjetiva com cara de escala medida |
| 15 | Matriz de Eisenhower com cartões | distribuir itens acionáveis entre quatro caixas | itens com posição numérica real | caixa que vira lista infinita sem corte de quantidade |
| 16 | Mapa perceptual | posicionar marcas ou ofertas em dois eixos conceituais | público vai ler como medição | eixo sem unidade apresentado como se fosse escala |
| 17 | Matriz de confusão | avaliar classificador: previsto contra real | mais de ~10 classes na mesma tela | não declarar se está bruta, por linha ou por coluna |
| 18 | Matriz de-para | fluxo de mudança de estado entre dois momentos | o interesse é o caminho completo (vira Sankey, família 11) | somar diagonal com fora da diagonal no total |
| 19 | Matriz de correlação | explorar relação entre 4 a 15 medidas | apresentação para diretoria | escala divergente sem ponto neutro no zero |
| 20 | Matriz de cobertura binária | quem tem e quem não tem cada atributo | o valor é quantitativo e não binário | ausência e "sem dado" pintadas da mesma forma |
| 21 | Matriz de comparação de itens | comparar de 3 a 8 opções em vários critérios | critérios com unidades muito diferentes sem normalizar | célula colorida sem número, virando julgamento opaco |
| 22 | Matriz de decisão ponderada | escolher entre opções com pesos explícitos | pesos não acordados | esconder o peso e mostrar só o total |
| 23 | Matriz de pares | confronto direto entre entidades (quem passa para quem) | matriz grande e esparsa | metade redundante desenhada sem necessidade |
| 24 | Pequenos múltiplos de quadrantes | mesma classificação repetida por segmento ou período | poucos itens por painel | cada painel com corte e domínio próprios |
| 25 | Quadrante com lista sincronizada | o leitor precisa do plano e do detalhe ao mesmo tempo | cartão estreito de dashboard | lista que não reage ao filtro do plano |
| 26 | Plano com fronteira curva de equilíbrio | a regra de decisão é um produto ou razão dos dois eixos (vitórias = volume × taxa) | a fronteira não tem fórmula acordada | desenhar corte reto onde a regra é hiperbólica |
| 27 | Quadrante de variação centrado no zero | os dois eixos são variações com sinal entre dois períodos | um dos eixos é nível e não variação | domínio assimétrico que tira o zero do centro e esconde o sinal |
| 28 | Matriz de responsabilidade (RACI) | quem executa, responde, é consultado e informado em cada etapa do handoff | processo ainda sem dono definido | linha sem nenhum A, ou com dois, passando sem alerta |

---

## 1. Matriz 2x2 de quadrantes

**Descrição.** O modelo-base da família. Duas medidas numéricas nos eixos, uma divisória vertical e uma
horizontal, quatro regiões nomeadas e um ponto por entidade. Raffael Marty descreve bem o mecanismo: a grade em
cruz "acelera a compreensão agrupando os dados em baldes simples", facilita comparação rápida dentro de cada
quadrante e, por deixar os eixos à vista, "expõe o raciocínio analítico" e entrega conselho direto pelo rótulo
da região. Ele também nomeia o preço: a matriz "restringe o espaço de decisão" ao forçar tudo em quatro
compartimentos, e a escolha da fronteira e do rótulo enquadra a decisão de quem lê.

**Anatomia.** Dois eixos numéricos com nome, unidade e domínio fixo; divisória vertical em `x = cx` e horizontal
em `y = cy`, cada uma com rótulo do que é; quatro regiões, cada uma com um título curto no canto externo e a
contagem de itens; pontos neutros com hover; rodapé com `n` no plano e `n` fora por dado ausente.

**Abordagem na stack.** `recharts-nativo` com duas `ReferenceLine` e quatro `ReferenceArea` de fundo. O gist
público mais citado para isso usa só as duas linhas (`<ReferenceLine x={0} />` e `<ReferenceLine y={0} />`) e o
próprio comentário da discussão aponta o que falta: colorir o fundo das quatro regiões exige `ReferenceArea`.

```tsx
const CX = 148, CY = 0.22, DX: [number, number] = [0, 400], DY: [number, number] = [0, 0.6];

<ScatterChart responsive data={contas} margin={{ top: 24, right: 24, bottom: 28, left: 12 }}>
  <CartesianGrid stroke="var(--line-subtle)" />
  <XAxis type="number" dataKey="ticket" name="Ticket médio" unit=" mil" domain={DX} />
  <YAxis type="number" dataKey="conversao" name="Conversão" domain={DY} tickFormatter={pct} />
  <ReferenceArea x1={CX} x2={DX[1]} y1={CY} y2={DY[1]} fill="var(--chart-1)" fillOpacity={0.06}
    label={{ value: 'Prioridade máxima', position: 'insideTopRight', fill: 'var(--text-muted)' }} />
  <ReferenceArea x1={DX[0]} x2={CX} y1={CY} y2={DY[1]} fill="var(--surface-raised)" fillOpacity={0.5} />
  <ReferenceLine x={CX} stroke="var(--line-strong)"
    label={{ value: 'mediana do ticket · R$ 148 mil', position: 'insideBottomRight' }} />
  <ReferenceLine y={CY} stroke="var(--line-strong)"
    label={{ value: 'conversão média · 22%', position: 'insideTopLeft' }} />
  <Scatter fill="var(--chart-2)" fillOpacity={0.85} />
</ScatterChart>
```

**Ponto delicado.** `ReferenceArea` nasce com `ifOverflow="discard"`: se qualquer canto da região sair do
domínio, a região inteira desaparece sem erro. Com domínio automático isso acontece toda vez que um filtro
encolhe os dados, e o resultado é um gráfico que perde o fundo em silêncio. Duas travas: domínio fixo declarado
no registry e `x2`/`y2` amarrados às constantes do domínio, nunca a `dataMax`. A segunda armadilha é a camada: a
`ReferenceArea` tem `zIndex` com padrão 100 e precisa ficar **atrás** dos pontos; conferir no build da 3.10,
porque a ordem de declaração dos filhos também conta. A terceira é o rótulo de região colidir com ponto no
canto: usar `position` interna e reservar margem de 24px no topo e na direita.

**Versões sugeridas.**
- **V1 básica: ticket contra conversão por executivo.** 14 executivos fictícios, ticket médio em milhares no X e
  taxa de conversão no Y; cortes na mediana do ticket e na conversão média da área, ambos rotulados.
- **V2 com anotação: a região que paga a conta.** A região "ticket alto e conversão alta" ganha fundo em
  `--chart-1` a 6% e uma anotação curta: "3 executivos, 61% da receita fechada no trimestre".
- **V3 densa do Farol: campanhas por CPL e CPL qualificado.** 48 campanhas fictícias, CPL no X invertido (menor
  é melhor à direita, com `reversed`), CPL qualificado no Y; a região perigosa é "CPL baixo, CPL qualificado
  alto", onde o volume barato não vira nada.
- **V4 caso limite: quase todo mundo num canto.** Quando 80% das entidades caem numa região, o 2x2 não separa:
  o cartão mostra a mensagem "a divisória não separa esta amostra (38 de 47 numa só região)" e sugere trocar o
  corte para quartil ou passar ao modelo 9, em posto.

**Referências.**
- Catálogo: [Data Viz Project, 2x2 Matrix / Opposite Diagram](https://datavizproject.com/data-type/2x2-matrix/) (não abriu; retorna 403 ao fetch): o resultado de busca traz a definição de dois conjuntos de opostos em eixos cartesianos e o alerta de que o uso é com frequência conceitual, em escala relativa.
- Catálogo: [visualizing.org, Quadrant Chart](https://www.visualizing.org/quadrant-chart) (não abriu): apareceu na busca como verbete de definição e casos de uso do formato.
- Praticante: [Raffael Marty, Two-by-Two Matrices](https://www.informit.com/articles/article.aspx?p=709139&seqNum=7): observar a lista de vantagens (balde simples, eixo visível, conselho pelo rótulo) e o alerta de que a matriz restringe o espaço de decisão.
- Ferramenta: [Mermaid, proposta de diagrama 2x2 / quadrantChart](https://github.com/mermaid-js/mermaid/issues/4282): observar a gramática mínima que a proposta define (título, rótulo e direção de cada eixo, rótulo dos quatro quadrantes, pontos por par de coordenadas) e a distinção entre uso com pontos e uso puramente conceitual.
- Ferramenta: [Recharts, gist de ScatterChart com 4 quadrantes](https://gist.github.com/mehulcse/f729d4e93ee1dc67d7c8d22eb73bf940): observar que só as duas `ReferenceLine` resolvem as divisórias e que o fundo colorido depende de `ReferenceArea`, ponto levantado nos comentários.
- Portal de design: [Dribbble, Priority Matrix dark mode, Niels Rozemeijer](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode): quadrante em tema escuro com itens como cartões; a página carrega só a imagem no fetch, sem texto de especificação.

---

## 2. Quadrante com corte estatístico

**Descrição.** A variante em que a divisória é calculada da própria amostra: mediana, média, quartil. Responde
"quem está acima do típico nas duas dimensões" quando não existe meta externa. O Vega-Lite tem o equivalente
mais enxuto desse raciocínio no exemplo de dispersão com sobreposição de média e desvio padrão, que junta ponto,
regra da média e faixa de desvio em camadas.

**Anatomia.** Igual ao modelo 1, mas com a divisória em linha tracejada e rótulo que nomeia a estatística e o
valor; opcionalmente uma faixa de indiferença translúcida de ±10% em torno de cada corte, com os itens de dentro
em cinza.

**Abordagem na stack.** `recharts-custom`: a estatística é calculada em TypeScript antes da renderização, e as
duas `ReferenceLine` recebem o resultado; a faixa de indiferença é uma `ReferenceArea` fina em cada eixo.

```ts
const cx: Corte = { valor: mediana(itens.map(i => i.x)) ?? 0, origem: 'MEDIDO', rotulo: 'mediana do ticket' };
const cy: Corte = { valor: mediana(itens.map(i => i.y)) ?? 0, origem: 'MEDIDO', rotulo: 'mediana da conversão' };
const tol = 0.08;
```

**Ponto delicado.** Corte calculado **muda quando o filtro muda**, e o leitor não vê isso acontecer. Duas
consequências: o mesmo executivo troca de região ao filtrar por trimestre sem que nada nele tenha mudado, e
comparar dois cartões lado a lado com cortes diferentes é armadilha. A trava é escrever o valor do corte no
rótulo e repetir no tooltip de cada ponto ("22% de conversão, contra mediana de 19% neste recorte"). Média em
distribuição de cauda longa, que é a regra em ticket e em valor de oportunidade, empurra quase todo mundo para
o lado esquerdo: mediana é o padrão, média só quando a distribuição for simétrica e isso estiver verificado.

**Versões sugeridas.**
- **V1 básica: mediana nos dois eixos.** 22 origens de lead fictícias, volume no X e taxa de qualificação no Y,
  com os dois cortes na mediana e o valor escrito na linha.
- **V2 com faixa de indiferença.** Mesma matriz com banda de ±8% em torno de cada corte; os 5 itens de dentro
  saem dos rótulos de região e viram "na fronteira", em cinza, com nota explicando por quê.
- **V3 real do Farol: SDR por fila e SLA.** 9 SDRs fictícios, tamanho de fila no X e percentual de primeiro
  contato dentro do SLA no Y; cortes na mediana da equipe; a região "fila grande e SLA baixo" é a que gera a
  pauta da reunião de pré-vendas.
- **V4 caso limite: média contra mediana.** Cartão com alternador entre média e mediana que mostra quantos itens
  trocam de região na troca ("7 de 22 mudam de quadrante"); serve para provar ao time que a escolha do corte é
  uma decisão, não um detalhe técnico.

**Referências.**
- Catálogo: [Vega-Lite, Scatterplot with Mean and Standard Deviation Overlay](https://vega.github.io/vega-lite-v2/examples/layer_global_mean_dev.html) (não abriu; apareceu literalmente na busca): observar a composição em camadas de ponto, regra da média e `rect` de desvio, que é a receita para faixa de indiferença.
- Praticante: [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): observar o argumento de que o corte no ponto médio é o defeito central do formato e a defesa de zonas configuráveis.
- Ferramenta: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `x`, `y` em valor de dado, `label` com `position` e `strokeDasharray` para o corte calculado.
- Portal de design: [Dribbble, Priority Matrix dark mode](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode): mesma peça do modelo 1, útil para o tratamento de divisória discreta em fundo escuro.

---

## 3. Quadrante com corte por meta declarada

**Descrição.** A divisória não sai dos dados: é o SLA, o break-even, o teto de capacidade, a meta do trimestre.
É a variante mais honesta da família em contexto operacional, porque o corte é a regra que a área já usa. A
tcviz defende exatamente isso: as linhas de referência "deveriam refletir metas, orçamentos ou valores de SLA
reais, e não onde os dados se aglomeram".

**Anatomia.** Divisórias sólidas com rótulo que nomeia a meta e a fonte ("teto de capacidade: 274 entradas por
mês, modelo de filas"); ícone de etiqueta de procedência ao lado do rótulo; fundo em `--chart-1` a 6% só na
região que a meta define como boa, as outras três neutras.

**Abordagem na stack.** `recharts-nativo`. O corte vem do registry como constante, não da amostra, o que
simplifica: domínio fixo, `ReferenceLine` com valor literal, `ReferenceArea` amarrada ao domínio.

```tsx
const META = { entradas: 274, sla: 0.8 } as const;

<ReferenceLine x={META.entradas} stroke="var(--chart-3)" strokeWidth={1.5}
  label={{ value: 'teto de capacidade · 274/mês (PREMISSA)', position: 'top', fill: 'var(--text-muted)' }} />
<ReferenceLine y={META.sla} stroke="var(--chart-3)" strokeWidth={1.5} strokeDasharray="4 4"
  label={{ value: 'meta de SLA · 80% em 30 min', position: 'insideTopLeft' }} />
```

**Ponto delicado.** Meta e medição não podem ter o mesmo traço. No Farol, corte medido é sólido e corte de
premissa é tracejado, com a etiqueta escrita no rótulo. Quando a meta muda no meio da série histórica, uma linha
única mente: ou o cartão recorta o período de vigência da meta, ou o modelo vira pequenos múltiplos por período
(modelo 24). E meta fora do domínio some com `ifOverflow="discard"`; quando a meta puder cair fora dos dados,
usar `ifOverflow="extendDomain"` para o eixo esticar até ela, que é o comportamento certo (esconder a meta porque
ninguém chegou perto dela é o pior resultado possível).

**Versões sugeridas.**
- **V1 básica: SLA contra volume por fila.** 6 filas de pré-vendas fictícias, entradas no mês no X e percentual
  dentro do SLA no Y, cortes no teto de 274 e na meta de 80%.
- **V2 com destaque: quem furou o teto.** As filas à direita do teto ganham contorno em `--chart-3` e uma
  anotação: "2 filas acima da capacidade medida; SLA cai 19 pontos nessa região".
- **V3 real do Farol: campanhas contra break-even.** 30 campanhas fictícias, CPL no X com o break-even de
  R$ 4,20 por lead e taxa de qualificação no Y com a meta de 18%; o cartão separa o que paga do que não paga.
- **V4 caso limite: meta acima de todo mundo.** Meta de 80% de SLA com a melhor fila em 61%: `extendDomain` puxa
  o eixo até 0,8, a linha aparece no topo vazio e a nota diz "nenhuma fila atinge a meta neste recorte", em vez
  de sumir com a linha.

**Referências.**
- Praticante: [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): observar a defesa explícita de corte por meta, orçamento ou SLA no lugar da mediana.
- Ferramenta: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `ifOverflow` com os quatro valores e o exemplo de rótulo `Target Value` posicionado `insideTopRight`.
- Ferramenta: [Highcharts, demo de bubble sand-signika](https://www.highcharts.com/demo/bubble/sand-signika) (não abriu; retornou 404 ao fetch): a busca descreve o demo como bubble que usa `plotLines` nos dois eixos com traço colorido e rótulo, que é a mesma ideia de corte por meta.
- Portal de design: [Dribbble, Priority Matrix dark mode](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode): referência de tratamento de divisória e rótulo em tema escuro.

---

## 4. Quadrante com rótulos diretos nas entidades

**Descrição.** Cada ponto carrega o nome. É o formato do Magic Quadrant e de qualquer matriz que exista para
dizer "quem". Sem rótulo, o quadrante contínuo vira uma nuvem anônima que só serve para contar; com rótulo, vira
uma lista posicionada. O limite prático é baixo: acima de ~20 nomes o texto se cruza e o leitor perde os dois.

**Anatomia.** Ponto pequeno com rótulo à direita (ou acima, conforme o espaço); regra de seleção declarada
quando nem todos são rotulados ("só os 12 maiores por receita"); rótulo em `--text-muted`, exceto o do item em
destaque; nenhuma linha de chamada, exceto quando o deslocamento passa de ~24px.

**Abordagem na stack.** `recharts-custom`: `Scatter` com `LabelList` de `content` próprio, mais um passo de
desconflito calculado em TypeScript antes de renderizar. O Vega-Lite resolve a mesma coisa com marca de texto no
lugar do ponto, no exemplo de dispersão com marcas de texto coloridas.

```tsx
type Caixa = { x: number; y: number; w: number; h: number; i: number };

export function desconflitar(caixas: Caixa[], passos = 60) {
  const out = caixas.map(c => ({ ...c }));
  for (let p = 0; p < passos; p++) {
    let mexeu = false;
    for (let a = 0; a < out.length; a++)
      for (let b = a + 1; b < out.length; b++) {
        const A = out[a], B = out[b];
        const dx = Math.abs(A.x - B.x), dy = Math.abs(A.y - B.y);
        if (dx < (A.w + B.w) / 2 && dy < (A.h + B.h) / 2) {
          const empurra = ((A.h + B.h) / 2 - dy) / 2 + 0.5;
          if (A.y <= B.y) { A.y -= empurra; B.y += empurra; } else { A.y += empurra; B.y -= empurra; }
          mexeu = true;
        }
      }
    if (!mexeu) break;
  }
  return out;
}
```

**Ponto delicado.** O `content` do `LabelList` é chamado uma vez por item e não conhece os vizinhos, então o
desconflito tem que acontecer **fora** dele: calcular as posições finais num `useMemo` a partir da largura e da
altura da área de plotagem (hooks de layout do Recharts 3) e ler a posição pronta pelo índice. Medir texto sem
canvas é impreciso; usar largura estimada por caractere (cerca de 6,2px em 12px de fonte) e truncar o nome em 18
caracteres com reticências, com o nome inteiro no tooltip. Rótulo perto da divisória confunde de que lado o item
está: nesse caso, o rótulo vai para o lado externo da região.

**Versões sugeridas.**
- **V1 básica: 12 executivos nomeados.** Ticket médio contra win rate, com o nome fictício ao lado de cada ponto
  e desconflito vertical.
- **V2 com destaque e anotação.** Um executivo selecionado em `--chart-2` com rótulo em negrito e caixa de
  anotação ligada por linha fina: "volume 3º maior, conversão 11º; a fila está entrando sem filtro".
- **V3 real do Farol: motivos de perda.** 16 motivos fictícios, frequência no X e valor perdido no Y, cada um
  rotulado; a região "frequente e caro" é o que vai para a pauta, e o rótulo é o que faz o cartão funcionar sem
  tooltip.
- **V4 caso limite: 40 entidades.** Rotular só as 10 mais extremas por distância do centro, com a regra escrita
  no subtítulo ("nomes: 10 mais distantes do cruzamento; demais no hover") e as outras 30 como pontos neutros.

**Referências.**
- Catálogo: [Vega-Lite, Scatter Plot with Text Marks](https://vega.github.io/vega-lite/examples/text_scatterplot_colored.html) (não abriu; apareceu literalmente na busca): observar a substituição do ponto por texto, alternativa quando o nome é curto e o número de itens é pequeno.
- Praticante: [Michael Sandberg, Calling Bullshit on the 2017 Gartner Magic Quadrant](https://datavizblog.com/2017/02/23/calling-bullshit-on-the-2017-gartner-magic-quadrant-for-bi-analytics-platforms/) (não abriu; apareceu literalmente na busca): crítica de dataviz ao quadrante rotulado mais famoso do mercado, útil para saber o que não repetir.
- Praticante: [Mark Sellors, Gartner-style charts in R with ggplot2](https://blog.sellorm.com/2019/02/11/gartner-style-charts-in-r-with-ggplot2/) (não abriu; apareceu literalmente na busca): reconstrução passo a passo do formato, boa para a lista de elementos que ele exige.
- Ferramenta: [Recharts, API do ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/): observar `label` e `<Label />` como filho, usados para o título de cada região sem colidir com os rótulos dos pontos.

---

## 5. Quadrante com bolhas

**Descrição.** A terceira medida entra pela área do círculo. É o formato da growth-share matrix da BCG
(crescimento no eixo, participação no outro, receita no tamanho) e da Business Impact Matrix que Marty descreve:
explorabilidade no Y, custo de correção no X e impacto de negócio no tamanho da bolha, com as três medidas
normalizadas em escala de 1 a 5. A bolha é o que transforma "quem está onde" em "quanto pesa quem está onde".

**Anatomia.** Círculos com área proporcional à terceira medida, desenhados dos maiores para os menores;
preenchimento a 55% de opacidade com contorno em cor cheia, para bolha sobreposta continuar legível; legenda de
tamanho com dois ou três círculos de referência e o valor de cada um; divisórias e rótulos de região como nos
modelos 1 a 3.

**Abordagem na stack.** `recharts-nativo` com `ZAxis`: `<ZAxis dataKey="receita" range={[60, 900]} domain={[0, max]} />`.
O `range` é **área em px²**, não raio, que é exatamente o que se quer; conferir no build, porque é o ponto em que
a maior parte das bibliotecas erra. Ordenar os dados por `z` decrescente antes de passar ao `Scatter` resolve a
ordem de pintura.

```tsx
const ordenados = [...itens].sort((a, b) => (b.z ?? 0) - (a.z ?? 0));

<ScatterChart responsive data={ordenados}>
  <XAxis type="number" dataKey="x" domain={[0, 1]} tickFormatter={pct} name="Participação" />
  <YAxis type="number" dataKey="y" domain={[-0.2, 0.6]} tickFormatter={pct} name="Crescimento" />
  <ZAxis type="number" dataKey="z" range={[60, 900]} domain={[0, 4_000_000]} name="Receita" unit=" R$" />
  <ReferenceLine y={0} stroke="var(--line-strong)" label={{ value: 'crescimento zero' }} />
  <ReferenceLine x={0.15} stroke="var(--line-strong)" strokeDasharray="4 4" />
  <Scatter fill="var(--chart-1)" fillOpacity={0.55} stroke="var(--chart-1)" />
</ScatterChart>
```

**Ponto delicado.** Três armadilhas juntas. Primeira, o `domain` do `ZAxis` precisa começar em zero, senão a
menor bolha vira um ponto e a proporção mente. Segunda, sem legenda de tamanho a terceira medida é decorativa:
o leitor compara áreas mal, e a legenda com dois círculos e os valores é obrigatória. Terceira, bolha grande
cruzando a divisória é ambígua: a classificação é pelo **centro**, e isso precisa estar escrito, porque metade
de uma bolha grande costuma invadir a região vizinha. Quando a terceira medida tiver valor negativo (variação de
receita, por exemplo), a área não pode representá-la: usar cor divergente para o sinal e área para o módulo, com
a legenda dizendo isso.

**Versões sugeridas.**
- **V1 básica: linhas de produto.** 7 linhas fictícias, participação no X, crescimento no Y, receita na área;
  corte em crescimento zero e na participação média do perímetro declarado.
- **V2 com anotação de perímetro.** Mesma matriz com nota fixa: "participação calculada sobre o perímetro de 38
  concorrentes mapeados, não sobre o mercado total"; sem isso, participação é número sem denominador.
- **V3 real do Farol: plataformas de mídia.** 5 plataformas fictícias, CPL qualificado no X, taxa de
  qualificação no Y e investimento do trimestre na área; a bolha grande no quadrante ruim é a conclusão do
  cartão.
- **V4 caso limite: uma bolha domina.** Uma plataforma com 78% do investimento faz as outras quatro virarem
  pontos: alternador para escala de área comprimida (`range` menor, com aviso "áreas comprimidas, comparação
  aproximada") ou troca do tamanho por rótulo de valor.

**Referências.**
- Praticante: [Raffael Marty, Two-by-Two Matrices](https://www.informit.com/articles/article.aspx?p=709139&seqNum=7): observar a Business Impact Matrix, com as três medidas normalizadas de 1 a 5 e o impacto no tamanho da bolha.
- Ferramenta: [AG Charts, Multiple Bubble Series](https://www.ag-grid.com/charts/gallery/multiple-bubble-series/) (não abriu; apareceu literalmente na busca): galeria de bolhas com várias séries, referência de legenda de tamanho e de sobreposição.
- Ferramenta: [Apache ECharts, issue 16401, linhas de quadrante dentro da área de plotagem](https://github.com/apache/echarts/issues/16401) (não abriu; apareceu literalmente na busca): pedido de recurso que descreve exatamente o caso de marcar regiões de foco em bolha e dispersão.
- Catálogo: [graphomate, BCG Matrix with graphomate bubbles](https://www.graphomate.com/en/2018/09/charts-tables-for-ui5-2-2/) (não abriu; apareceu literalmente na busca): implementação comercial de matriz BCG em bolhas, útil como referência de anatomia.

---

## 6. Quadrante com sumário por região

**Descrição.** Os pontos continuam lá, mas cada região ganha um bloco de resumo: quantas entidades caíram nela e
quanto elas somam na medida de negócio. É o modelo que responde "qual o tamanho do problema", não "quem é o
problema". O argumento clássico a favor da matriz é esse: vinte iniciativas numa planilha são esmagadoras, as
mesmas vinte no plano revelam na hora o aglomerado de ganho rápido ou o punhado de projetos grandes comendo o
recurso.

**Anatomia.** Quatro blocos de canto, cada um com título curto da região, contagem, medida agregada e
participação sobre o total; os blocos ficam no canto **externo** de cada região para não cobrir ponto; a soma
dos quatro é mostrada no rodapé, com a contagem de itens na fronteira, se houver faixa de indiferença.

**Abordagem na stack.** `recharts-custom` para os pontos e `html-tailwind` para os blocos: a `ReferenceArea`
aceita `label`, mas rótulo de várias linhas com hierarquia de tipo é sofrimento em SVG. A saída é posicionar
quatro `div` absolutas sobre o `ResponsiveContainer`, calculadas a partir da fração do corte no domínio.

```tsx
const fx = (CX - DX[0]) / (DX[1] - DX[0]);
const fy = (CY - DY[0]) / (DY[1] - DY[0]);

<div className="relative">
  <ScatterChart>{/* ... */}</ScatterChart>
  <div className="pointer-events-none absolute inset-0">
    <Bloco style={{ left: `${fx * 100}%`, top: 0 }} regiao="AD" resumo={resumo.get('AD')} />
    {/* AE, BD, BE */}
  </div>
</div>
```

**Ponto delicado.** Só somar medida aditiva. Contagem, receita, investimento e tamanho de fila somam; taxa de
conversão, CPL e ticket médio **não somam**, e a média das médias por região é erro silencioso. A regra é: se a
medida do eixo é uma razão, o bloco mostra a razão recalculada sobre os totais da região (soma dos numeradores
sobre soma dos denominadores), nunca a média dos itens. O segundo ponto é o posicionamento: os blocos são
percentuais sobre a área de plotagem, então precisam descontar as margens do gráfico; usar os hooks de layout do
Recharts 3 ou repetir as margens como constante compartilhada.

**Versões sugeridas.**
- **V1 básica: contagem nas quatro regiões.** 30 campanhas fictícias com "12 campanhas" em cada bloco de canto.
- **V2 com medida de negócio.** Cada bloco mostra contagem e investimento somado, mais a participação: "9
  campanhas · R$ 412 mil · 61% do investimento".
- **V3 real do Farol: oportunidades do forecast.** Valor no X e dias parada no Y, corte em R$ 150 mil e 30 dias;
  o bloco "valor alto e parada" mostra "7 oportunidades · R$ 2,1 milhões · 44% do pipeline vivo", que é o número
  que move a reunião.
- **V4 caso limite: região vazia.** Quando uma região não tem nenhum item, o bloco mostra "0 itens" em tom
  apagado em vez de sumir; região que some parece região que não existe, e a ausência é informação.

**Referências.**
- Praticante: [Learn Lean Sigma, Impact Effort Matrix](https://www.learnleansigma.com/guides/impact-effort-matrix/) (não abriu; apareceu literalmente na busca): guia passo a passo que trata a leitura por aglomerado como o produto principal da matriz.
- Praticante: [NN/g, 5 Prioritization Methods in UX Roadmapping](https://www.nngroup.com/articles/prioritization-methods/) (não abriu; apareceu literalmente na busca): compara métodos de priorização e situa a matriz 2x2 entre eles.
- Ferramenta: [Recharts, API do ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/): observar `label`, `<Label />` filho e `zIndex` com padrão 100, que definem o que dá para escrever dentro da região sem sair do SVG.
- Portal de design: [Dribbble, Priority Matrix dark mode](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode): observar a hierarquia de tipo dentro de cada região em fundo escuro.

---

## 7. Matriz 2x2 agregada

**Descrição.** Some com os pontos e fica só a grade: quatro caixas, cada uma com um número. É o formato de
cartão pequeno, de resumo executivo e de qualquer lugar onde a pergunta é "quanto cai em cada grupo" e ninguém
vai procurar item individual. A proposta de diagrama do Mermaid formaliza esse uso ao separar duas gramáticas: a
com pontos plotados, no estilo Magic Quadrant, e a puramente conceitual, no estilo Eisenhower, em que os
quadrantes carregam texto e não coordenada.

**Anatomia.** Grade 2x2 com bordas finas; rótulo de eixo fora da grade nas duas direções, com a seta de sentido
("menor → maior"); dentro de cada caixa, o número grande, o rótulo da região e uma linha de contexto; nenhuma
caixa com área proporcional ao valor, para não sugerir posição.

**Abordagem na stack.** `html-tailwind` puro: `grid grid-cols-2 grid-rows-2` com `gap-px` sobre um fundo de
divisória, cada caixa um `<button>` que aplica o filtro correspondente ao clicar. Não precisa de Recharts, e não
deveria usar: o overhead do SVG não paga nada aqui.

```tsx
<div className="grid grid-cols-2 grid-rows-2 gap-px rounded-lg bg-[var(--line-subtle)] p-px">
  {regioes.map(r => (
    <button key={r.id} onClick={() => filtrar(r.id)}
      className="bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-raised)] focus-visible:outline-2">
      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{r.titulo}</div>
      <div className="mt-1 text-3xl tabular-nums">{r.n}</div>
      <div className="text-sm text-[var(--text-muted)]">{r.contexto}</div>
    </button>
  ))}
</div>
```

**Ponto delicado.** Ordem das caixas é convenção, e convenção quebrada custa caro: no plano cartesiano, o "alto
e à direita" é a caixa superior direita, e a ordem de leitura natural (esquerda para direita, cima para baixo)
não bate com a ordem de importância. A saída é marcar a direção nos dois eixos com seta e rótulo, e pôr a caixa
"melhor" sempre no mesmo canto em todos os cartões do Farol. Em largura pequena a grade 2x2 tende a virar coluna
única; quando isso acontece, a matriz deixa de ser matriz, então o ponto de quebra desliga o modelo e mostra as
quatro linhas com um selo de região em cada uma.

**Versões sugeridas.**
- **V1 básica: quatro contagens.** Leads do mês por "tem telefone" e "tem cargo", quatro caixas com a contagem e
  o percentual sobre o total.
- **V2 com destaque.** A caixa problemática ganha borda em `--chart-3` e ícone da lucide; o resto fica neutro.
- **V3 real do Farol: cobertura de dado por origem.** Eixos "origem identificada" e "documento válido"; a caixa
  "nem origem nem documento" mostra "1.204 leads · 31%", que é o tamanho real da lacuna de atribuição.
- **V4 caso limite: matriz conceitual sem números.** Modo de planejamento em que as caixas trazem texto de
  decisão e não contagem, com aviso "matriz conceitual, sem dado por trás", para não confundir com medição.

**Referências.**
- Ferramenta: [Mermaid, proposta de diagrama 2x2](https://github.com/mermaid-js/mermaid/issues/4282): observar a separação explícita entre a sintaxe com pontos e coordenadas e a sintaxe conceitual, só com texto por quadrante.
- Praticante: [Raffael Marty, Two-by-Two Matrices](https://www.informit.com/articles/article.aspx?p=709139&seqNum=7): observar a leitura por balde como vantagem central do formato.
- Portal de design: [Miro, template de matriz 2x2 de priorização](https://miro.com/templates/2x2-prioritization-matrix/) (não abriu; apareceu literalmente na busca): quadro colaborativo com as quatro caixas rotuladas, referência de rótulo e direção de eixo.
- Portal de design: [Dribbble, Priority Matrix dark mode](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode): tratamento das caixas em tema escuro.

---

## 8. Quadrante com trajetória entre dois períodos

**Descrição.** Cada entidade vira uma seta do "onde estava" para o "onde está". A mudança de região é o assunto:
quem saiu do quadrante ruim, quem entrou. O Observable Plot tem o exemplo canônico desse desenho, com áreas
metropolitanas dos Estados Unidos de 1980 a 2015, uma seta por cidade ligando duas observações e a cor do traço
codificando a direção da mudança.

**Anatomia.** Ponto pequeno ou vazado no início, seta com ponta no fim; cor do traço pela direção (melhorou,
piorou, cruzou divisória); divisórias e regiões como no modelo 1; legenda que diz explicitamente qual ponta é o
começo e qual é o fim.

**Abordagem na stack.** `recharts-custom`: um componente filho do `ScatterChart` lê `useXAxisScale()` e
`useYAxisScale()` e desenha as setas em SVG; o `Scatter` nativo cuida só do ponto de destino e do tooltip. As props
que o `shape` do `Scatter` recebe trazem `cx` e `cy` do próprio ponto, mas não a escala, então a seta não deve ser
desenhada dentro do `shape`. O marcador de ponta vai em `<defs><marker>`, um por cor, referenciado por `markerEnd`.

```tsx
type Mov = { id: string; x0: number; y0: number; x1: number; y1: number; melhorou: boolean };

function Trajetorias({ itens }: { itens: Mov[] }) {
  const sx = useXAxisScale();
  const sy = useYAxisScale();
  if (!sx || !sy) return null; // fora do contexto do gráfico
  const px = (v: number) => Number(sx(v)); // conferir o tipo de retorno de ScaleFunction no build
  const py = (v: number) => Number(sy(v));
  return (
    <g>
      <defs>
        {(['bom', 'ruim'] as const).map(t => (
          <marker key={t} id={`ponta-${t}`} viewBox="0 0 8 8" refX="7" refY="4"
            markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={t === 'bom' ? 'var(--chart-1)' : 'var(--chart-3)'} />
          </marker>
        ))}
      </defs>
      {itens.map(m => {
        const ax = px(m.x0), ay = py(m.y0), bx = px(m.x1), by = py(m.y1);
        const comp = Math.hypot(bx - ax, by - ay);
        const k = comp > 0 ? Math.max(0, comp - 5) / comp : 0; // recuo de 5px antes do alvo
        const t = m.melhorou ? 'bom' : 'ruim';
        return (
          <g key={m.id}>
            <circle cx={ax} cy={ay} r={3} fill="none" stroke={`var(--chart-${m.melhorou ? 1 : 3})`} />
            <line x1={ax} y1={ay} x2={ax + (bx - ax) * k} y2={ay + (by - ay) * k}
              stroke={`var(--chart-${m.melhorou ? 1 : 3})`} strokeWidth={1.5} markerEnd={`url(#ponta-${t})`} />
          </g>
        );
      })}
    </g>
  );
}
```

**Ponto delicado.** Sem `inset` no fim, a ponta da seta fica por baixo do círculo do destino e some; encurtar o
segmento em 4 a 6px antes do alvo (o Plot expõe isso como `insetEnd`, e aqui é conta à mão). Seta muito curta
vira borrão: abaixo de ~12px de comprimento, trocar por um ponto com anel, com a legenda dizendo "mudança
pequena". Acima de ~15 entidades o plano vira macarrão; nesse caso, filtrar para quem trocou de região e dizer
no subtítulo quantos ficaram parados. A curvatura (`bend`, no vocabulário do Plot) ajuda quando duas setas se
sobrepõem, mas curva exagerada inventa um caminho que não existe: o trajeto entre dois momentos não foi uma
curva, foi só um antes e um depois.

**Versões sugeridas.**
- **V1 básica: executivos entre dois trimestres.** 10 executivos fictícios, seta do T2 para o T3 em ticket
  contra win rate.
- **V2 com destaque na mudança de região.** Só as 4 entidades que cruzaram alguma divisória em cor; as outras em
  cinza a 30%, e a anotação conta: "2 saíram da região crítica, 2 entraram".
- **V3 real do Farol: origens de lead antes e depois do ajuste de campanha.** 12 origens fictícias, volume no X
  e taxa de qualificação no Y, setas de setembro para outubro, com a divisória na meta de qualificação.
- **V4 caso limite: entidade nova ou que sumiu.** Origem que não existia no período anterior entra como ponto
  com anel tracejado e sem seta; origem que sumiu entra como seta terminando num "x". As duas aparecem na
  legenda, porque seta ausente lida como "não mudou" é erro de leitura grave.

**Referências.**
- Catálogo: [Observable Plot, arrow mark](https://observablehq.github.io/plot/marks/arrow): observar `x1,y1,x2,y2`, `bend`, `headAngle`, `headLength`, `insetEnd` e `sweep`, e o exemplo de mudança entre 1980 e 2015 com a cor codificando direção.
- Ferramenta: [Recharts, API do Scatter](https://recharts.github.io/en-US/api/Scatter/) : observar `shape` (padrão `circle`, aceita elemento ou função própria), que é o encaixe para desenhar a seta inteira por item, e `activeShape` para o estado de hover.
- Praticante: [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): observar a insistência em zonas configuráveis, que aqui vale para manter a divisória fixa entre os dois períodos comparados.

---

## 9. Quadrante em posto

**Descrição.** Os eixos deixam de ser o valor e passam a ser a **posição** da entidade no ranking de cada medida.
Serve quando as duas medidas têm escalas incomparáveis, quando uma delas tem cauda longa brutal ou quando o
público discute "quem está entre os melhores", não "quanto". O efeito colateral é que a distribuição fica
uniforme por construção e a divisória natural cai no meio do ranking.

**Anatomia.** Eixos de 1 a `n` com sentido invertido (posto 1 no topo e à direita); grade de fundo por decil;
divisórias na mediana do ranking; tooltip **sempre** com o valor bruto além do posto; nota de rodapé explicando
que a posição é relativa ao recorte filtrado.

**Abordagem na stack.** `recharts-custom`: os postos são calculados em TypeScript, com tratamento explícito de
empate, e os eixos usam `reversed`.

```ts
export function postos(vals: number[], maiorMelhor = true) {
  const ord = vals.map((v, i) => ({ v, i }))
    .sort((a, b) => (maiorMelhor ? b.v - a.v : a.v - b.v));
  const r = new Array<number>(vals.length);
  let i = 0;
  while (i < ord.length) {
    let j = i;
    while (j + 1 < ord.length && ord[j + 1].v === ord[i].v) j++;
    const medio = (i + j) / 2 + 1; // posto médio no empate
    for (let k = i; k <= j; k++) r[ord[k].i] = medio;
    i = j + 1;
  }
  return r;
}
```

**Ponto delicado.** Posto apaga a distância: o primeiro e o segundo podem estar empatados na prática ou separados
por um abismo, e o gráfico mostra a mesma coisa. Por isso o tooltip carrega o valor bruto e o cartão traz, ao
lado, um microvisual de distribuição (família 24) mostrando o espaçamento real. Empate mal tratado gera pontos
exatamente sobrepostos: posto médio resolve a ordem, mas os pontos continuam no mesmo lugar, então aplicar um
deslocamento determinístico de ±2px por índice, nunca aleatório, para o gráfico não mudar a cada render. E o
posto depende do recorte: mudar o filtro renumera todo mundo, o que precisa estar escrito.

**Versões sugeridas.**
- **V1 básica: posto de volume contra posto de conversão.** 20 origens fictícias, os dois eixos de 1 a 20.
- **V2 com destaque na diagonal.** Linha de identidade tracejada (posto igual nas duas medidas); quem está muito
  acima dela converte melhor do que o volume sugere, e a anotação diz isso em uma frase.
- **V3 real do Farol: criativos de mídia.** 34 criativos fictícios, posto de impressões contra posto de lead
  qualificado; o canto "muito visto e pouco produtivo" é a lista de corte do mês.
- **V4 caso limite: nove empates no último posto.** Nove criativos com zero lead qualificado empatam no último
  posto; o cartão agrupa em um marcador único com contagem ("9 criativos empatados em 0") em vez de empilhar
  nove pontos idênticos.

**Referências.**
- Praticante: [Visier, Quadrant visual (2x2 scatter plot)](https://docs.visier.com/developer/Analytics/visual%20types/2x2%20scatter%20plot.htm): observar a definição de quadrante por limiar de cada métrica, o alternador "Center on thresholds", o rótulo por quadrante limitado a 48 caracteres e o teto de 3.000 itens do visual.
- Ferramenta: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `segment` com par de coordenadas, que é o caminho para a linha de identidade em posto.
- Catálogo: [Data Visualisation Catalogue, correlation matrix](https://datavizcatalogue.com/blog/chart-snapshot-correlation-matrix/): observar o uso de marcador de tamanho variável na interseção, alternativa quando o empate de posto for frequente.

---

## 10. Quadrante denso

**Descrição.** A mesma classificação aplicada a centenas ou milhares de entidades: leads, sessões, mensagens. A
identidade individual se perde e o que sobra é a massa por região. O From Data to Viz tem uma página inteira
sobre o problema, sob o nome de *overplotting*: pontos demais tornam a dispersão ilegível, e existem técnicas
para evitar. As duas que servem aqui são opacidade com ponto pequeno e binagem em grade.

**Anatomia.** Duas camadas: o fundo, com a contagem por bin numa escala sequencial ou com pontos a 25% de
opacidade; e a frente, com divisórias, rótulo de região e contagem. A legenda diz quantos itens cada tom
representa. Nenhum tooltip por ponto: o tooltip é por bin ou por região.

**Abordagem na stack.** `svg-puro` para os bins, desenhado como filho do gráfico Recharts, com a contagem
calculada em TypeScript e a escala de cor discreta em 5 degraus. Alternativa mais barata: `recharts-nativo` com
`Scatter` de `shape="circle"`, `r` pequeno e `fillOpacity` baixa, que aguenta bem até uns 2 mil pontos.

```ts
export function binar(itens: Item[], dx: [number, number], dy: [number, number], nx = 24, ny = 16) {
  const grade = new Map<string, number>();
  const px = (dx[1] - dx[0]) / nx, py = (dy[1] - dy[0]) / ny;
  for (const it of itens) {
    if (!Number.isFinite(it.x) || !Number.isFinite(it.y)) continue;
    const i = Math.min(nx - 1, Math.max(0, Math.floor((it.x - dx[0]) / px)));
    const j = Math.min(ny - 1, Math.max(0, Math.floor((it.y - dy[0]) / py)));
    const k = `${i}:${j}`;
    grade.set(k, (grade.get(k) ?? 0) + 1);
  }
  return { grade, px, py, nx, ny };
}
```

**Ponto delicado.** Bin que cruza a divisória estraga a classificação: escolher `nx` e `ny` de modo que o corte
caia exatamente numa borda de bin, ou binar separadamente dentro de cada região. O segundo ponto é o teto de
itens; produtos comerciais declaram um: o visual de quadrante do Visier suporta até 3.000 itens e oferece drill
por clique direito. No Farol, acima de ~2.000 pontos o modelo vira bin obrigatório e o detalhe sai do plano e vai
para a lista. Terceiro: bin vazio e bin com contagem 1 precisam de tons distinguíveis, senão a nuvem parece um
retângulo cheio.

**Versões sugeridas.**
- **V1 básica: 1.400 leads.** Minutos até o primeiro contato no X e número de tentativas no Y, pontos a 25% de
  opacidade, divisórias no SLA de 30 minutos e em 3 tentativas.
- **V2 com anotação por região.** Cada região com contagem e participação; a anotação diz "58% dos leads levam
  mais de 30 minutos para o primeiro contato".
- **V3 densa do Farol: 9.100 sessões do site.** Bins de 24 por 16 em escala sequencial, tooltip por bin com
  contagem e faixa de valores, divisórias em tempo de sessão e páginas vistas.
- **V4 caso limite: massa colada no eixo.** 62% dos leads com zero tentativa registrada colam no eixo inferior;
  o cartão separa essa faixa numa banda própria rotulada "sem tentativa registrada", fora da escala do plano,
  para não achatar o resto.

**Referências.**
- Catálogo: [From Data to Viz, Overplotting](https://www.data-to-viz.com/caveat/overplotting.html) (não abriu; o endereço veio do índice de caveats da própria página inicial, que foi aberta): observar a lista de técnicas contra sobreposição, que é o assunto exato deste modelo.
- Praticante: [Visier, Quadrant visual](https://docs.visier.com/developer/Analytics/visual%20types/2x2%20scatter%20plot.htm): observar o teto declarado de 3.000 itens e o drill por clique direito como saída para o detalhe.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar `inset` e `fill`, que definem o desenho de cada bin da grade de densidade.
- Ferramenta: [Recharts, API do Scatter](https://recharts.github.io/en-US/api/Scatter/): observar `shape` e `activeShape` para o ponto pequeno com estado de hover barato.

---

## 11. Quadrante com distribuições marginais

**Descrição.** O plano de quadrantes ganha, nas bordas, um histograma por eixo. Responde ao mesmo tempo "em que
região está cada um" e "como cada medida se distribui", o que expõe na hora se a divisória caiu num vale (bom) ou
no meio de um pico (ruim, porque metade da massa fica encostada na fronteira).

**Anatomia.** Plano principal ocupando cerca de 78% da largura e da altura; faixa de histograma no topo,
alinhada ao eixo X, e à direita, alinhada ao eixo Y; as duas faixas com o mesmo domínio do plano; a divisória se
estende para dentro das faixas; nenhum eixo numérico nas faixas, só o valor de pico no rótulo.

**Abordagem na stack.** `html-tailwind` como grade de três células (`grid-template-areas`) com três gráficos
Recharts dentro: um `ScatterChart` central e dois `BarChart` de barras finas. O domínio dos três é a mesma
constante, e as margens laterais precisam bater, senão o alinhamento quebra.

```tsx
<div className="grid gap-1" style={{ gridTemplateColumns: '1fr 72px', gridTemplateRows: '64px 1fr' }}>
  <HistTopo domain={DX} bins={binsX} />
  <div />
  <PlanoQuadrantes />
  <HistDireita domain={DY} bins={binsY} />
</div>
```

**Ponto delicado.** Alinhamento é tudo e é frágil: o `ScatterChart` reserva espaço para os rótulos do eixo, o
`BarChart` do topo não, e um deslocamento de 30px já desalinha visivelmente. A trava é declarar as margens como
constante única e passar a mesma para os três, com `YAxis` do histograma de topo em `hide` mas com a mesma
largura reservada (`width={44}` mais `tick={false}`). Segundo ponto: o número de bins muda a forma; fixar por
regra declarada (Freedman-Diaconis ou 24 bins) e escrever no rodapé. Em cartão estreito o modelo não cabe:
abaixo de 520px de largura, desligar as marginais e manter só o plano.

**Versões sugeridas.**
- **V1 básica: histograma nos dois eixos.** Campanhas por CPL e taxa de qualificação, 24 bins em cada faixa.
- **V2 com destaque do corte.** A divisória atravessa as faixas e o bin que a contém fica em `--chart-3`, com a
  nota "o corte cai no pico da distribuição: 14 de 48 campanhas estão a menos de 10% dele".
- **V3 real do Farol: oportunidades por valor e idade.** 320 oportunidades fictícias, valor no X em escala
  logarítmica e dias no funil no Y; a marginal de valor mostra a cauda longa que justifica usar mediana e não
  média como corte.
- **V4 caso limite: distribuição bimodal.** A marginal de dias no funil tem dois picos (o que anda rápido e o
  que trava); a nota diz que uma divisória única não descreve essa medida e sugere três faixas no lugar de duas.

**Referências.**
- Catálogo: [From Data to Viz, página inicial e índice de caveats](https://www.data-to-viz.com/): observar a organização por formato de dado de entrada e a lista de armadilhas, incluindo tamanho de bin do histograma (`caveat/bin_size.html`).
- Catálogo: [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/) (não abriu; apareceu literalmente na busca): observar as composições em camadas e a concatenação de gráficos, que é a receita formal das marginais.
- Ferramenta: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar que a mesma linha precisa ser replicada nas três peças, já que cada gráfico é independente.

---

## 12. Matriz de priorização impacto e esforço com iso-linhas

**Descrição.** O 2x2 mais usado do mundo corporativo: impacto no Y, esforço no X, quatro rótulos (ganho rápido,
projeto grande, preenchimento, desperdício). A versão que vale a pena construir acrescenta as **iso-linhas de
valor**: curvas em que impacto dividido por esforço é constante, o que ordena os itens por retorno em vez de só
agrupá-los. A literatura de priorização é firme em dois pontos: definir os critérios de impacto e de esforço
antes de pontuar, e pontuar individualmente em silêncio antes da discussão em grupo, justamente para o
enquadramento de uma pessoa não sobrepor a avaliação dos outros.

**Anatomia.** Plano com esforço crescendo para a direita; iso-linhas em traço fino de fundo (retas pela origem,
já que impacto sobre esforço constante é uma reta em escala linear); rótulo de razão na ponta de cada iso-linha;
itens como bolhas com o nome ao lado; rótulos de região nos quatro cantos; etiqueta visível de que os eixos são
avaliação do time.

**Abordagem na stack.** `recharts-custom`: as iso-linhas são `ReferenceLine` com `segment`, que aceita um par de
coordenadas e por isso desenha diagonal.

```tsx
const ISO = [3, 2, 1, 0.5];
const MAX = 10; // domínio fixo dos dois eixos, [0, 10]
// y = k·x cortada na borda do domínio: a ponta sai pelo topo quando k > 1 e pela direita quando k <= 1
const ponta = (k: number) => (k > 1 ? { x: MAX / k, y: MAX } : { x: MAX, y: MAX * k });
{ISO.map(k => (
  <ReferenceLine key={k} segment={[{ x: 0, y: 0 }, ponta(k)]}
    stroke="var(--line-subtle)" strokeDasharray="2 4"
    label={{ value: `${k}x`, position: 'insideTopRight', fill: 'var(--text-muted)' }} />
))}
```

**Ponto delicado.** Duas coisas se confundem aqui: a **região** (quatro caixas) e a **ordem** (iso-linhas). Se as
duas aparecerem com o mesmo peso visual, o leitor não sabe qual manda. A regra: iso-linha é fundo, divisória de
região é traço médio, e o rótulo do cartão diz qual das duas leituras é a oficial. Segundo ponto: escore de 1 a 5
tem granularidade grossa, e vários itens caem exatamente na mesma coordenada; aplicar deslocamento determinístico
pequeno e dizer no rodapé ("itens empilhados deslocados para leitura; posição exata no tooltip"). Terceiro:
esforço às vezes é medido (horas) e impacto quase nunca; misturar medição e julgamento nos dois eixos sem
etiqueta é o pecado do modelo.

**Versões sugeridas.**
- **V1 básica: 14 iniciativas.** Impacto e esforço de 1 a 5, quatro regiões rotuladas, nomes ao lado.
- **V2 com iso-linhas e ordem.** As mesmas 14 com iso-linhas de 3x, 2x, 1x e 0,5x e uma lista lateral ordenada
  pela razão, o que mostra que dois itens do mesmo quadrante podem estar longe na ordem.
- **V3 real do Farol: backlog de automações de pré-vendas.** 22 itens fictícios, esforço em dias de trabalho
  (MEDIDO) e impacto em horas poupadas por mês (DERIVADO); as bolhas trazem o número de pessoas afetadas.
- **V4 caso limite: escore sem calibração.** Quando o desvio entre avaliadores passa de um limiar, o cartão
  troca o ponto por uma cruz que mostra a faixa entre a menor e a maior nota dada, com a nota "sem consenso: 5
  itens com divergência maior que 2 pontos".

**Referências.**
- Praticante: [NN/g, 5 Prioritization Methods in UX Roadmapping](https://www.nngroup.com/articles/prioritization-methods/) (não abriu; apareceu literalmente na busca): observar onde a matriz 2x2 se encaixa entre os métodos e quais são seus limites declarados.
- Praticante: [Learn Lean Sigma, Impact Effort Matrix](https://www.learnleansigma.com/guides/impact-effort-matrix/) (não abriu; apareceu literalmente na busca): observar a exigência de definir critérios de impacto e de esforço antes da pontuação.
- Portal de design: [CNVS, 10 Ways to Design an Impact Effort Matrix](https://www.getcnvs.design/blog/design-an-impact-effort-matrix) (não abriu; apareceu literalmente na busca): coletânea de variações visuais do mesmo 2x2, útil para escolher o tratamento de região e de rótulo.
- Portal de design: [UXPin, Priority Matrix: the value of a unique UX](https://www.uxpin.com/studio/blog/priority-matrix-the-value-of-a-unique-ux/) (não abriu; apareceu literalmente na busca): matriz de prioridade tratada como interface, não como figura estática.
- Ferramenta: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `segment` com par de coordenadas, o mecanismo das iso-linhas.

---

## 13. Matriz de risco em células

**Descrição.** A grade clássica de probabilidade contra impacto, em 3x3, 4x4 ou 5x5, com cada célula pintada por
nível e carregando os riscos que caíram nela. Os tamanhos mais difundidos seguem normas: 3x3 na OHSAS 18001, 4x4
na AS/NZS 4360:2004 e 5x5 na MIL-STD-882B. É o modelo da família com a crítica mais bem documentada. Tony Cox
(2008) mostrou que a matriz típica compara sem ambiguidade menos de 10% dos pares de riscos sorteados, comprime
riscos quantitativamente diferentes na mesma célula, pode dar nota maior ao risco menor quando frequência e
severidade andam em sentidos opostos (o que ele chama de "pior que inútil") e recebe notas opostas para o mesmo
risco conforme quem avalia. Thomas, Bratvold e Bickel (2014) acrescentaram que o ranking resultante é arbitrário
e muda quando se muda o desenho das escalas.

**Anatomia.** Probabilidade nas linhas, crescendo de baixo para cima; impacto nas colunas, crescendo da esquerda
para a direita; descritor de cada faixa com critério numérico no cabeçalho ("provável: 30% a 60% no trimestre");
célula com fundo de nível em três tons de baixa saturação, o nome do nível escrito e a contagem de riscos; clique
abre a lista; faixa separada abaixo da grade para "sem avaliação".

**Abordagem na stack.** `html-tailwind` com CSS Grid. O nível vem de uma tabela de consulta acordada, nunca da
multiplicação de índices ordinais, que é justamente o que a crítica condena.

```tsx
type Nivel = 'baixo' | 'medio' | 'alto';
const PROB = ['rara', 'improvável', 'possível', 'provável', 'quase certa'] as const;
const IMP = ['mínimo', 'menor', 'moderado', 'maior', 'severo'] as const;
// [probabilidade][impacto], índice 0 = menor; tabela acordada no comitê, não produto de índices
const NIVEL: Nivel[][] = [
  ['baixo', 'baixo', 'baixo', 'medio', 'medio'],
  ['baixo', 'baixo', 'medio', 'medio', 'alto'],
  ['baixo', 'medio', 'medio', 'alto', 'alto'],
  ['medio', 'medio', 'alto', 'alto', 'alto'],
  ['medio', 'alto', 'alto', 'alto', 'alto'],
];

<div role="grid" aria-label="Matriz de risco" className="grid gap-px bg-[var(--line-subtle)] p-px"
  style={{ gridTemplateColumns: `auto repeat(${IMP.length}, minmax(44px, 1fr))` }}>
  {[...PROB.keys()].reverse().map(p => (
    <Fragment key={p}>
      <div role="rowheader" className="bg-[var(--surface)] px-2 text-xs text-[var(--text-muted)]">{PROB[p]}</div>
      {IMP.map((_, i) => (
        <button key={i} role="gridcell" aria-label={`${PROB[p]}, ${IMP[i]}: ${contagem(p, i)} riscos`}
          className={`nivel-${NIVEL[p][i]} min-h-11 text-lg tabular-nums`} onClick={() => abrir(p, i)}>
          {contagem(p, i)}
        </button>
      ))}
    </Fragment>
  ))}
</div>
```

**Ponto delicado.** Três. A ordem vertical: a primeira linha do DOM é a de cima, então o laço percorre as faixas de
probabilidade de trás para frente, e esquecer isso inverte a matriz inteira sem erro visível. A cor: a célula
pintada é resumo grosseiro, então o número vai sempre junto e os três tons precisam passar em simulação de
daltonismo; nada de verde e vermelho saturados. E a incerteza: risco avaliado como "entre possível e provável"
não cabe numa célula; ou o comitê decide, ou o risco vira um traço que atravessa as duas células, com a nota
explicando. Navegação por setas entre células (`onKeyDown` com índice de linha e coluna) é obrigatória, porque a
grade é o controle de filtro.

**Versões sugeridas.**
- **V1 básica: 5x5 com contagem.** 23 riscos fictícios do plano comercial de 2027, contagem por célula e o nível
  escrito no canto.
- **V2 com destaque de movimento.** Riscos que mudaram de célula desde o último comitê ganham marca "▲1" ou "▼1"
  na célula de destino e a anotação "4 riscos subiram de nível; nenhum desceu".
- **V3 real do Farol: mapa de risco dos cenários.** Diretoria: dependência de mídia paga, capacidade de
  pré-vendas acima do teto, concentração de receita em três executivos; clicar na célula abre a lista com dono,
  gatilho e plano de resposta.
- **V4 caso limite: compressão de faixa.** Alternador 3x3 e 5x5 sobre os mesmos 23 riscos mostrando quantos se
  empilham na mesma célula em cada formato ("no 3x3, 11 riscos dividem a célula alta e alta"); os 2 riscos sem
  impacto avaliado ficam na faixa "sem avaliação", fora da grade.

**Referências.**
- Catálogo: [Wikipedia, Risk matrix](https://en.wikipedia.org/wiki/Risk_matrix): observar os tamanhos por norma, os quatro defeitos apontados por Cox (resolução, erros e reversões, alocação, entrada subjetiva) e o resultado de 2014 sobre ranking arbitrário.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a célula em duas dimensões ordinais com escala de banda e a opção `interval` para mostrar lacuna em vez de continuidade falsa.
- Ferramenta: [Highcharts, demo de heatmap](https://www.highcharts.com/demo/highcharts/heatmap): a página abriu, mas o texto do demo não veio no fetch; vale como referência de grade categórica com rótulo por célula.
- Portal de design: [Dribbble, Animated Matrix Chart, 49 Days of Charts](https://dribbble.com/shots/17790868-Animated-Matrix-Chart-49-Days-of-Charts) (não abriu; o fetch voltou vazio): matriz de células em série de estudos de gráfico.

---

## 14. Nine-box 3x3

**Descrição.** Três faixas por eixo, nove células, itens distribuídos em caixas. A origem é a matriz GE e McKinsey:
atratividade do mercado no Y e força do negócio no X, cada uma em alto, médio e baixo, com três zonas de
recomendação (crescer, seletividade, colher). No desenho original as unidades de negócio são círculos com raio
pelo tamanho do mercado, fatia pela participação e seta para a posição esperada. As limitações registradas são as
de sempre em matriz de julgamento: ponderação subjetiva e diferente entre unidades, construção cara e demorada,
pouca precisão e pouca atenção à interação entre as unidades. O mesmo esqueleto aparece em revisão de carteira,
em ABC e XYZ (valor contra previsibilidade) e em calibração de talento.

**Anatomia.** Grade 3x3 com as faixas nomeadas e o critério de corte no cabeçalho; zonas diagonais pintadas por
três tons baixos (a zona é soma dos índices, não célula isolada); dentro de cada célula, contagem, soma da medida
de negócio e até seis chips com nome, seguidos de "+n"; seta opcional de posição prevista.

**Abordagem na stack.** `html-tailwind`. Recharts só entra se o requisito for posição contínua dentro da célula,
e aí o modelo deixa de ser nine-box e vira o modelo 1 com três cortes por eixo.

```ts
export function faixa(v: number, cortes: readonly [number, number]): 0 | 1 | 2 {
  return v < cortes[0] ? 0 : v < cortes[1] ? 1 : 2;
}
// zona diagonal da matriz GE: soma dos índices 0 e 1 colhe, 2 é seletividade, 3 e 4 crescem (3 células cada)
export function zona(ix: 0 | 1 | 2, iy: 0 | 1 | 2) {
  const s = ix + iy;
  return s <= 1 ? 'colher' : s === 2 ? 'seletividade' : 'crescer';
}
```

**Ponto delicado.** O corte da faixa é a decisão escondida: tercil da própria amostra põe um terço em cada faixa
por construção, e limiar fixo pode deixar a faixa alta vazia. O subtítulo diz qual dos dois está em uso. A célula
central (médio e médio) costuma concentrar metade dos itens e virar lista ilegível; limitar os chips, ordenar
por medida e abrir o resto em painel. E o eixo de julgamento humano carrega a marca da regra 6: contorno
tracejado no eixo e legenda "avaliação do time, não medição".

**Versões sugeridas.**
- **V1 básica: contagem nas nove células.** 60 contas fictícias por potencial estimado e relacionamento, com o
  critério de cada faixa no cabeçalho.
- **V2 com chips e seta de tendência.** Até seis contas nomeadas por célula, com seta para a célula prevista no
  próximo semestre, como no desenho GE; a anotação conta quantas mudam de zona.
- **V3 real do Farol: ABC e XYZ da carteira.** 180 contas fictícias por receita reconhecida (A, B, C) e
  variabilidade mensal (X, Y, Z); cada célula com contagem e soma de receita; a célula "A e Z" (muita receita,
  pouca previsibilidade) é o que entra no forecast como faixa e não como ponto.
- **V4 caso limite: célula vazia e célula lotada.** A célula "alto e alto" vazia mostra "0 contas" em tom
  apagado; a central com 41 contas mostra seis chips, "+35" e o botão de abrir a lista.

**Referências.**
- Catálogo: [Wikipedia, GE multifactorial analysis](https://en.wikipedia.org/wiki/GE_multifactorial_analysis): observar as três zonas de investimento, o círculo com raio e fatia por unidade, a seta de posição futura e a lista de limitações.
- Praticante: [Raffael Marty, Two-by-Two Matrices](https://www.informit.com/articles/article.aspx?p=709139&seqNum=7): observar o alerta de que a matriz restringe o espaço de decisão, que pesa ainda mais com nove caixas.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar `inset` e texto sobreposto, a receita para célula com contagem.
- Portal de design: [Dribbble, Figma infographics, Matrix distribution, Scatter chart](https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart) (não abriu; o fetch voltou vazio): distribuição de itens em matriz sobre dispersão.

---

## 15. Matriz de Eisenhower com cartões

**Descrição.** Quatro caixas de urgência e importância com itens acionáveis dentro, sem coordenada numérica. Na
formulação corrente, importante e urgente se faz imediatamente e pessoalmente; importante e não urgente ganha data
e se faz pessoalmente; urgente e não importante se delega; nem um nem outro se abandona. A frase atribuída a
Eisenhower ("tenho dois tipos de problema, o urgente e o importante") foi, segundo ele próprio, de um ex-reitor
não nomeado. O modelo representa toda a linhagem de matriz de texto 2x2 (SWOT, Ansoff): a célula é uma lista, e o
valor está em forçar a ação que cada caixa pede.

**Anatomia.** Grade 2x2 com o verbo da caixa no título ("fazer hoje", "agendar", "delegar", "descartar"); regra de
classificação escrita no rodapé; cartões compactos com nome, um número e um ícone de estado; contagem no título
de cada caixa; limite de cartões visíveis por caixa com "+n".

**Abordagem na stack.** `html-tailwind`: `grid grid-cols-2`, lista dentro de cada caixa, ícones da lucide
(`Clock`, `ArrowRightLeft`, `Trash2`). No Farol a caixa é **derivada por regra**, não arrastada: o painel é de
leitura, e a regra é o que dá para auditar.

```ts
type Pendencia = { id: string; nome: string; venceEmH: number | null; valorPotencial: number | null };
type Caixa = 'fazer' | 'agendar' | 'delegar' | 'descartar' | 'sem_regra';

export function caixa(p: Pendencia, slaH = 24, corteValor = 50_000): Caixa {
  if (p.venceEmH === null || p.valorPotencial === null) return 'sem_regra';
  const urgente = p.venceEmH <= slaH;
  const importante = p.valorPotencial >= corteValor;
  return importante ? (urgente ? 'fazer' : 'agendar') : urgente ? 'delegar' : 'descartar';
}
```

**Ponto delicado.** O item sem um dos dois atributos não pode cair por padrão em "descartar", que é o que acontece
quando `null` vira zero na comparação; ele vai para uma faixa própria, visível. A ordem dentro da caixa também é
decisão (vencimento primeiro, valor como desempate) e precisa estar escrita. Em tela estreita a grade vira coluna
e perde a leitura cruzada; manter o 2x2 com cartões menores até ~360px e só então empilhar, com o verbo da caixa
repetido em cada cabeçalho.

**Versões sugeridas.**
- **V1 básica: quatro caixas.** 18 pendências fictícias de uma coordenação de vendas, até cinco cartões por caixa.
- **V2 com destaque de atraso.** Cartões vencidos em "fazer hoje" ganham ícone de relógio em `--chart-3` e a
  contagem no título ("7, sendo 3 vencidas").
- **V3 real do Farol: fila da SDR.** 64 leads fictícios distribuídos por SLA de primeiro contato (urgência) e faixa
  de valor potencial (importância); "delegar" vira "redistribuir para a fila de apoio".
- **V4 caso limite: caixa lotada e item sem regra.** "Fazer hoje" com 40 cartões mostra seis e "+34"; 9 leads sem
  valor potencial ficam na faixa "sem regra aplicável" abaixo da grade, em vez de engordar "descartar".

**Referências.**
- Praticante: [Wikipedia, Time management, método Eisenhower](https://en.wikipedia.org/wiki/Time_management): observar a ação associada a cada quadrante e a nota sobre a autoria da frase.
- Ferramenta: [Mermaid, proposta de diagrama 2x2](https://github.com/mermaid-js/mermaid/issues/4282): observar a sintaxe conceitual, com texto por quadrante e sem coordenada.
- Portal de design: [Dribbble, Priority Matrix dark mode](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode): itens como cartões em quatro caixas, em tema escuro.

---

## 16. Mapa perceptual

**Descrição.** Posiciona ofertas, marcas ou mensagens em dois eixos que representam como o público as percebe. É
técnica de marketing para mostrar visualmente a percepção de clientes; os eixos podem vir de escalonamento
multidimensional, análise fatorial ou discriminante sobre pesquisa, e a regressão de preferência acrescenta pontos
ideais ou vetores de preferência. A limitação registrada é direta: o mapa intuitivo, feito sem dado de cliente, é
limitado justamente por isso. O quadrante aqui é conceitual e relativo, não métrico.

**Anatomia.** Eixos sem números, com um polo nomeado em cada ponta ("preço relativo baixo" e "alto"); ofertas como
pontos rotulados; ponto ideal como alvo; vetores de preferência como setas a partir do centro; nota de método
sempre visível ("pesquisa com 212 respostas, escalonamento multidimensional" ou "hipótese do time"); proporção 1:1.

**Abordagem na stack.** `recharts-custom`: `ScatterChart` com domínio simétrico `[-1, 1]` nos dois eixos,
`tick={false}`, polos como `<Label>` nas pontas, cruz central com duas `ReferenceLine`, ponto ideal com
`ReferenceDot` e vetor com `ReferenceLine` de `segment` saindo da origem.

```tsx
<div className="aspect-square w-full max-w-[560px]">
  <ScatterChart responsive data={ofertas} margin={{ top: 28, right: 28, bottom: 28, left: 28 }}>
    <XAxis type="number" dataKey="d1" domain={[-1, 1]} tick={false}>
      <Label value="amplitude de serviço: estreita ← → ampla" position="insideBottom" />
    </XAxis>
    <YAxis type="number" dataKey="d2" domain={[-1, 1]} tick={false} />
    <ReferenceLine x={0} stroke="var(--line-subtle)" />
    <ReferenceLine y={0} stroke="var(--line-subtle)" />
    <ReferenceDot x={0.55} y={-0.4} r={7} fill="none" stroke="var(--chart-2)" label="ideal do segmento" />
    <Scatter fill="var(--text-muted)" />
  </ScatterChart>
</div>
```

**Ponto delicado.** Distância é a única coisa que o mapa afirma, e distância só existe com proporção 1:1: um
contêiner responsivo que estica a largura distorce o mapa sem avisar, daí o `aspect-square`. Eixos de
escalonamento multidimensional são rotacionáveis e sem unidade, então mostrar número no tick é mentir precisão;
o nome dos polos é interpretação do analista e deve ser tratado como tal. E mapas de pesquisas diferentes não se
comparam lado a lado, porque cada solução tem sua própria orientação.

**Versões sugeridas.**
- **V1 básica: sete ofertas fictícias.** Amplitude de serviço contra preço relativo, eixos declarados pelo time.
- **V2 com ponto ideal e espaço vazio.** Ponto ideal do segmento e anotação da região sem nenhuma oferta
  ("ninguém ocupa amplo e preço médio").
- **V3 real do Farol: perímetro de concorrência.** Nove concorrentes fictícios do perímetro declarado, com
  tamanho do ponto pela participação (DERIVADO) e a nota de perímetro obrigatória da Diretoria.
- **V4 caso limite: mapa sem pesquisa.** Moldura tracejada, pontos vazados e selo "hipótese do time, sem dado de
  cliente"; o cartão não deixa ligar a camada de tamanho, porque participação sobre hipótese é dupla invenção.

**Referências.**
- Catálogo: [Wikipedia, Perceptual mapping](https://en.wikipedia.org/wiki/Perceptual_mapping): observar os métodos de derivação dos eixos, pontos ideais contra vetores ideais e a limitação do mapa intuitivo.
- Catálogo: [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a categoria Correlação, em que dispersão e bolha aparecem como formas padrão para duas medidas.
- Portal de design: [Behance, Quadrant Chart (Scatter Plot), Nick Visscher](https://www.behance.net/gallery/182422151/Quadrant-Chart-%28Scatter-Plot%29): projeto de 2023-10-16 inspirado em peça jornalística; a página não descreve eixos nem rótulos, vale pela imagem.

---

## 17. Matriz de confusão

**Descrição.** Classes previstas contra classes reais, com a diagonal como acerto e o resto como tipo de erro. No
Farol serve para auditar qualquer classificação automática: temperatura do lead prevista contra desfecho,
motivo de perda sugerido contra motivo revisado, origem inferida contra origem confirmada. Duas lições da
literatura mandam no desenho. A convenção de eixos varia: linhas como real e colunas como previsto, ou o
contrário, e as duas aparecem publicadas. E acurácia engana em classe desbalanceada: um classificador com 95% de
acerto global pode errar toda a classe minoritária; o coeficiente de correlação de Matthews é apontado como a
métrica mais informativa. A implementação de referência do scikit-learn põe o real nas linhas, o previsto nas
colunas e oferece normalização por linha (`true`), por coluna (`pred`), pelo total (`all`) ou nenhuma.

**Anatomia.** Cabeçalho com "real ↓" e "previsto →" escritos; classes na mesma ordem nos dois eixos; diagonal com
contorno próprio; célula com contagem e, conforme o modo, o percentual; totais por linha e por coluna nas margens;
seletor de normalização visível com o nome da métrica que ele produz (revocação por linha, precisão por coluna);
painel lateral com precisão e revocação por classe e o coeficiente de Matthews.

**Abordagem na stack.** `html-tailwind` até ~10 classes, com a mesma grade do modelo 13; `svg-puro` acima disso.
A normalização é calculada em TypeScript e a divisão por zero tem tratamento explícito.

```ts
export type Modo = 'bruto' | 'linha' | 'coluna' | 'total';

export function normalizar(m: number[][], modo: Modo): (number | null)[][] {
  const somaL = m.map(l => l.reduce((a, b) => a + b, 0));
  const somaC = m[0].map((_, j) => m.reduce((a, l) => a + l[j], 0));
  const total = somaL.reduce((a, b) => a + b, 0);
  return m.map((l, i) => l.map((v, j) => {
    const d = modo === 'linha' ? somaL[i] : modo === 'coluna' ? somaC[j] : modo === 'total' ? total : 1;
    return d === 0 ? null : v / d; // null = linha ou coluna sem casos, desenhado com hachura
  }));
}
```

**Ponto delicado.** A escala de cor muda de sentido com o modo: em bruto ela mede volume e a diagonal da classe
majoritária engole a paleta; normalizado, ela mede taxa. A saída é escala própria por modo, legenda que diz qual
está ativa e, quando o objetivo é achar erro, pintar só fora da diagonal e deixar a diagonal com contorno. Linha
sem nenhum caso real devolve divisão por zero: `null`, hachura e "sem casos", nunca 0%. E classe rara com três
casos produz percentuais que pulam de 33% em 33%: mostrar o `n` da linha e esmaecer linhas abaixo de 20 casos.

**Versões sugeridas.**
- **V1 básica: binária.** Lead qualificado previsto contra qualificado em 60 dias, quatro células com os nomes
  (verdadeiro positivo, falso positivo, falso negativo, verdadeiro negativo) e as contagens.
- **V2 normalizada por linha.** Temperatura prevista (quente, morno, frio) contra desfecho, com a revocação na
  diagonal em destaque e a anotação "metade dos que viraram venda estava marcada como frio".
- **V3 real do Farol: motivos de perda.** Cinco motivos sugeridos por um classificador de texto contra o motivo
  revisado pela coordenação, sobre 1.200 perdas fictícias; o painel mostra que "sem fit" absorve erro de quase
  todas as outras classes.
- **V4 caso limite: classe rara.** A classe "concorrência" com 7 casos aparece esmaecida, com o `n` na margem e a
  nota "percentuais instáveis abaixo de 20 casos"; a linha "outros" sem casos no período mostra hachura.

**Referências.**
- Catálogo: [Wikipedia, Confusion matrix](https://en.wikipedia.org/wiki/Confusion_matrix): observar que as duas convenções de eixo coexistem, a tabela de métricas derivadas e o alerta sobre acurácia em dado desbalanceado.
- Ferramenta: [scikit-learn, ConfusionMatrixDisplay](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ConfusionMatrixDisplay.html): observar `normalize` com `true`, `pred` e `all`, `include_values`, `values_format` e o real nas linhas.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a célula ordinal com texto sobreposto, o esqueleto visual da matriz.

---

## 18. Matriz de-para

**Descrição.** Estado no início do período nas linhas, estado no fim nas colunas, contagem na célula. A diagonal é
quem ficou; quando os estados têm ordem, acima da diagonal é avanço e abaixo é regressão. É a forma compacta do
fluxo entre dois momentos, e a fronteira com a família 11 é clara: se a pergunta é "quantos passaram de A para
B", a matriz resolve em uma tela e mostra também quem não passou; se a pergunta é o caminho por vários estágios em
sequência, vira Sankey. A FT Visual Vocabulary registra o parente contínuo, o *XY heatmap*, como bom para padrão
entre duas categorias e ruim para diferença fina, que é exatamente o limite da leitura por cor aqui.

**Anatomia.** Linhas "de" e colunas "para" na mesma ordem de processo; linha extra "entrou no período" e coluna
extra "saiu" (ganho, perda, descarte), sem as quais os totais não fecham; diagonal com contorno; triângulo de
avanço e de regressão em dois tons; célula com contagem e, no hover, percentual da linha e da coluna.

**Abordagem na stack.** `html-tailwind` com grade. A matriz é montada em TypeScript a partir dos pares de estado
de cada entidade nas duas datas.

```ts
export function dePara<E extends string>(pares: { de: E | 'entrou'; para: E | 'saiu' }[], estados: readonly E[]) {
  const L = ['entrou', ...estados] as const, C = [...estados, 'saiu'] as const;
  const m = L.map(() => C.map(() => 0));
  for (const p of pares) {
    const i = L.indexOf(p.de as (typeof L)[number]), j = C.indexOf(p.para as (typeof C)[number]);
    if (i < 0 || j < 0) continue; // estado fora do dicionário: contar à parte e mostrar no rodapé
    m[i][j] += 1;
  }
  return { linhas: L, colunas: C, m };
}
```

**Ponto delicado.** O total é o erro clássico: somar a diagonal com o fora da diagonal para dizer "movimentações"
dobra o sentido da palavra. O cartão separa "permaneceram", "avançaram", "regrediram", "entraram" e "saíram". A
normalização também muda a pergunta: por linha responde "para onde foram os que estavam em Qualificação", por
coluna responde "de onde vieram os que estão em Proposta". E estado sem ordem natural (origem, canal) não tem
avanço nem regressão, então os dois tons de triângulo são desligados.

**Versões sugeridas.**
- **V1 básica: estágios do funil.** Cinco estágios fictícios entre duas datas, contagem por célula.
- **V2 com destaque de regressão.** Triângulo inferior em `--chart-3` e anotação "38 oportunidades voltaram de
  Proposta para Qualificação; 29 delas do mesmo time".
- **V3 real do Farol: foto de trimestre.** 1.340 oportunidades fictícias entre 2026-06-30 e 2026-09-30, com linha
  "nova no trimestre" e colunas "ganha" e "perdida"; o painel ao lado traz os cinco totais separados.
- **V4 caso limite: estágio extinto.** Um estágio que deixou de existir no meio do trimestre vira coluna "estágio
  extinto" hachurada, com a contagem de entidades que estavam nele e a nota de mudança de processo.

**Referências.**
- Catálogo: [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar o *XY heatmap* na categoria Correlação e a descrição "bom para padrão, menos bom para diferença fina".
- Praticante: [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/): observar como a ordem de linhas e colunas revela ou esconde bloco, o mesmo efeito da ordem de processo aqui.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a opção `interval` para lacuna explícita, útil no estágio extinto.

---

## 19. Matriz de correlação

**Descrição.** Todas as medidas contra todas, com o coeficiente de cada par na célula. O From Data to Viz define o
correlograma como a forma de analisar a relação entre cada par de variáveis numéricas, com a distribuição na
diagonal, e registra dois alertas: acima de ~10 variáveis a leitura fica muito difícil, e todas as armadilhas da
dispersão e do histograma continuam valendo. O Data Visualisation Catalogue descreve a variante com marcador
circular de tamanho variável na interseção. É ferramenta de exploração; a matriz de dispersões completa (SPLOM),
com um gráfico por par, mora na família 09.

**Anatomia.** Só o triângulo inferior, porque a metade de cima repete a de baixo; diagonal com o nome da medida;
célula com círculo de área proporcional ao módulo do coeficiente e cor pelo sinal em escala divergente com zero
neutro; o valor com duas casas no hover ou na célula quando couber; `n` de pares no tooltip; ordem das medidas por
agrupamento, não alfabética.

**Abordagem na stack.** `svg-puro` com a `escalaBanda` da seção base, para o círculo por célula; `html-tailwind`
quando a célula leva só cor e número. O coeficiente é calculado em TypeScript com exclusão por par.

```ts
export function pearsonPar(a: (number | null)[], b: (number | null)[]) {
  const xs: number[] = [], ys: number[] = [];
  a.forEach((v, i) => { const w = b[i]; if (v !== null && w !== null) { xs.push(v); ys.push(w); } });
  const n = xs.length;
  if (n < 3) return { r: null, n };
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return { r: sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy), n };
}
// raio do círculo: área proporcional a |r|, então raio = rMax * sqrt(|r|)
```

**Ponto delicado.** Exclusão por par faz cada célula ter seu próprio `n`, e duas células vizinhas podem vir de
amostras muito diferentes; o `n` precisa estar à mão e a célula com poucos pares, marcada. Série temporal com
tendência comum infla qualquer correlação (investimento e leads crescem juntos porque o ano cresce): calcular
sobre a variação semana a semana, não sobre o nível, e dizer isso no subtítulo. A escala divergente tem domínio
fixo `[-1, 1]` com o neutro no zero; domínio automático entre o menor e o maior coeficiente desloca o neutro e
pinta como negativo o que é só fraco.

**Versões sugeridas.**
- **V1 básica: seis medidas de mídia.** Investimento, impressões, cliques, leads, qualificados e CPL qualificado
  semanais, triângulo inferior com cor e número.
- **V2 com destaque dos pares fortes.** Pares com módulo acima de 0,7 ganham contorno e a anotação "investimento e
  leads andam juntos; qualificados não acompanham".
- **V3 densa do Farol: catorze medidas semanais.** 52 semanas fictícias de marketing e pré-vendas, círculos
  proporcionais, ordem por agrupamento; o bloco de medidas de topo de funil se descola do bloco de qualificação.
- **V4 caso limite: pares insuficientes.** Medidas que só existem há 8 semanas geram células com menos de 12 pares,
  hachuradas como "pares insuficientes"; um par com correlação negativa forte em nível, que some na variação,
  ganha nota de tendência comum.

**Referências.**
- Catálogo: [From Data to Viz, Correlogram](https://www.data-to-viz.com/graph/correlogram.html): observar o limite de ~10 variáveis e o uso declaradamente exploratório.
- Catálogo: [Data Visualisation Catalogue, correlation matrix](https://datavizcatalogue.com/blog/chart-snapshot-correlation-matrix/): observar o marcador circular de tamanho variável nas interseções.
- Praticante: [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/): observar a reordenação por agrupamento como o que torna bloco visível.

---

## 20. Matriz de cobertura binária

**Descrição.** Entidades contra atributos, com "tem" ou "não tem" na célula: quais origens de lead entregam
telefone, cargo, empresa, UTM, consentimento. Tem duas formas. A grade direta (entidade por atributo) serve para
achar a origem sem um campo. A forma agregada, no estilo UpSet, conta as **combinações** de campos presentes: cada
coluna da matriz é um conjunto, cada linha uma combinação possível, pontos ligados mostram quais conjuntos
participam e barras dão o tamanho de cada combinação e de cada conjunto. O UpSet se declara adequado de 4 a 30
conjuntos, justamente onde o diagrama de Venn deixa de ser legível, e ordena por tamanho, por grau ou por conjunto.

**Anatomia.** Na grade direta: ponto cheio para presente, anel vazio para ausente, hachura para "não coletado", e
percentual de preenchimento no rodapé de cada coluna. Na forma agregada: matriz de pontos com traço ligando os
presentes, barra horizontal de tamanho por combinação à direita e barra de tamanho por atributo no topo.

**Abordagem na stack.** `html-tailwind` nas duas formas: a barra é uma `div` com largura percentual na mesma linha
da grade, o que garante alinhamento sem sincronizar dois gráficos. `svg-puro` só se passar de ~40 linhas.

```ts
export function padroes<K extends string>(regs: Record<K, boolean | null>[], campos: readonly K[]) {
  const acc = new Map<string, number>();
  for (const r of regs) {
    const chave = campos.map(c => (r[c] === null ? '?' : r[c] ? '1' : '0')).join('');
    acc.set(chave, (acc.get(chave) ?? 0) + 1);
  }
  return [...acc].map(([chave, n]) => ({ chave, n })).sort((a, b) => b.n - a.n);
}
```

**Ponto delicado.** Os estados são três, não dois: presente, vazio (a fonte entrega o campo e ele veio em branco) e
não coletado (a coleta não traz o campo, por exemplo porque a listagem da API devolve menos campos que o detalhe).
Pintar os dois últimos da mesma forma transforma defeito de coleta em defeito de base, e o preenchimento baixo
num campo que a origem trata como obrigatório é sintoma de coleta. A forma agregada explode em combinações (seis
campos dão até 64): mostrar as 12 maiores e juntar o resto em "demais combinações", com a contagem.

**Versões sugeridas.**
- **V1 básica: grade direta.** 12 origens fictícias contra 6 campos, pontos cheio e vazio, percentual por coluna.
- **V2 agregada no estilo UpSet.** As 9 combinações mais frequentes de campos preenchidos entre 8.400 leads
  fictícios, com barra de tamanho; a maior combinação é "só e-mail e nome".
- **V3 real do Farol: cobertura por origem com limiar.** Célula com o percentual preenchido e o ponto cheio só
  acima de 80%, o limiar declarado para "dá para julgar a origem"; o cartão de CPL qualificado herda o aviso.
- **V4 caso limite: campo não coletado.** Uma fonte cuja coleta não traz telefone aparece com hachura na coluna
  inteira e a nota "preenchimento desconhecido: campo fora da coleta, não ausente na base".

**Referências.**
- Catálogo: [UpSet](https://upset.app/): observar a matriz de pontos ligados, as barras de tamanho, a faixa de 4 a 30 conjuntos e as ordenações por tamanho e grau.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a opção `interval`, que mostra lacuna em vez de continuidade.
- Catálogo: [Data Visualisation Catalogue, correlation matrix](https://datavizcatalogue.com/blog/chart-snapshot-correlation-matrix/): observar o marcador na interseção, o mesmo vocabulário do ponto cheio e vazio.

---

## 21. Matriz de comparação de itens

**Descrição.** Poucas opções nas colunas, vários critérios nas linhas, e em cada célula um glifo que resume o
desempenho da opção naquele critério, com o número ao lado. O glifo clássico é a *Harvey ball*: ideograma redondo
para comunicar informação qualitativa em tabela de comparação, criado por Harvey L. Poppel nos anos 1970 e usado
quando qualidade, segurança ou algo parecido é difícil de resumir em número. A fronteira com a família 14 é de
propósito: lá a tabela é lida linha a linha; aqui a matriz é lida como padrão de preenchimento (qual coluna é
cheia, qual critério ninguém atende).

**Anatomia.** Colunas de 3 a 8 opções com cabeçalho fixo; linhas de critérios com a direção escrita ("menor é
melhor"); célula com glifo de cinco níveis e o valor real; melhor da linha marcado com contorno; linha de rodapé
com a contagem de critérios em que cada opção lidera.

**Abordagem na stack.** `html-tailwind` para a tabela e `svg-puro` para o glifo, desenhado como arco e não como
caractere Unicode, que rende de forma irregular entre fontes.

```tsx
export function HarveyBall({ fracao, rotulo }: { fracao: number | null; rotulo: string }) {
  const r = 7, c = 8;
  if (fracao === null)
    return <svg width={16} height={16} role="img" aria-label={`${rotulo}: sem dado`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line-subtle)" strokeDasharray="2 2" /></svg>;
  const f = Math.min(1, Math.max(0, fracao));
  const a = f * 2 * Math.PI, x = c + r * Math.sin(a), y = c - r * Math.cos(a);
  const arco = f >= 1 ? null : `M${c},${c} L${c},${c - r} A${r},${r} 0 ${f > 0.5 ? 1 : 0} 1 ${x},${y} Z`;
  return (
    <svg width={16} height={16} role="img" aria-label={`${rotulo}: ${Math.round(f * 4)} de 4`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--text-muted)" />
      {f >= 1 ? <circle cx={c} cy={c} r={r} fill="var(--text-muted)" /> : f > 0 && <path d={arco!} fill="var(--text-muted)" />}
    </svg>
  );
}
```

**Ponto delicado.** Normalizar por critério respeitando a direção: CPL menor é melhor, volume maior é melhor, e a
fração do glifo inverte conforme o caso. O glifo quantiza em cinco níveis e esconde diferença: duas opções com 61%
e 74% podem ganhar o mesmo três quartos, então o número vai sempre junto. A escala de normalização também é
decisão: mínimo e máximo das opções na tela exageram diferença pequena; faixa absoluta acordada é mais honesta e
precisa estar declarada.

**Versões sugeridas.**
- **V1 básica: plataformas de mídia.** 5 plataformas fictícias contra 6 critérios (CPL, CPL qualificado, volume,
  cobertura de dado, atraso de dado, esforço de integração), glifo e valor.
- **V2 com destaque do melhor da linha.** Contorno no líder de cada critério e anotação "nenhuma plataforma lidera
  em volume e em CPL qualificado ao mesmo tempo".
- **V3 real do Farol: cenários da Diretoria.** 4 cenários fictícios contra 8 critérios, incluindo receita em
  faixa e custo nas três camadas; a célula de receita mostra a faixa, e o glifo usa o ponto médio com aviso.
- **V4 caso limite: dado ausente e empate.** Um cenário sem custo de camada 3 calculado recebe glifo tracejado
  "sem dado"; empate no líder marca as duas colunas e não escolhe uma.

**Referências.**
- Catálogo: [Wikipedia, Harvey balls](https://en.wikipedia.org/wiki/Harvey_balls): observar o uso em tabela de comparação para informação qualitativa e o alerta sobre renderização irregular do caractere Unicode.
- Catálogo: [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar o símbolo proporcional na categoria Magnitude, indicado quando a diferença fina importa pouco.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a célula ordinal com texto, alternativa quando o glifo não for necessário.

---

## 22. Matriz de decisão ponderada

**Descrição.** Opções contra critérios, com peso por critério, nota por célula e total por opção. No método de
Pugh, uma opção serve de referência e as outras são marcadas como melhor, pior ou igual em cada critério; a
variante ponderada acrescenta importância por critério. O verbete registra quatro fraquezas que o desenho precisa
enfrentar: a lista de critérios é arbitrária e provavelmente incompleta; critérios menores distraem; muitos
critérios menores somados podem escolher uma opção que falha um requisito obrigatório; e as notas são palpites,
não medições, o que dá cara de ciência a algo que não mediu nada.

**Anatomia.** Faixa superior com os critérios eliminatórios em passa e não passa, avaliados antes de qualquer soma;
linha de pesos visível como barra fina acima de cada coluna; célula com nota e contribuição ponderada; coluna de
total com barra empilhada decompondo a contribuição de cada critério; indicador de sensibilidade ao lado do
vencedor.

**Abordagem na stack.** `html-tailwind` para a grade e a faixa eliminatória; `recharts-nativo` para a decomposição
do total, com `BarChart layout="vertical"` e um `Bar` por critério com o mesmo `stackId`. A sensibilidade é
calculada em TypeScript.

```ts
type Opcao = { id: string; notas: Record<string, number>; eliminatorios: Record<string, boolean> };

export function totais(ops: Opcao[], pesos: Record<string, number>) {
  const soma = Object.values(pesos).reduce((a, b) => a + b, 0);
  return ops.map(o => ({
    id: o.id,
    elegivel: Object.values(o.eliminatorios).every(Boolean),
    total: Object.entries(pesos).reduce((a, [c, p]) => a + (o.notas[c] ?? 0) * (p / soma), 0),
  }));
}

// o vencedor muda se algum peso variar ±20%? devolve os critérios que viram a decisão
export function sensivel(ops: Opcao[], pesos: Record<string, number>, delta = 0.2) {
  const lider = (p: Record<string, number>) =>
    totais(ops, p).filter(t => t.elegivel).sort((a, b) => b.total - a.total)[0]?.id;
  const base = lider(pesos);
  return Object.keys(pesos).filter(c =>
    [1 - delta, 1 + delta].some(f => lider({ ...pesos, [c]: pesos[c] * f }) !== base));
}
```

**Ponto delicado.** Esconder o peso e mostrar só o total é o erro que transforma a matriz em caixa preta; o peso é
dado de primeira classe e fica na tela. Opção que falha um eliminatório não entra no ranking, mesmo com o maior
total, e aparece riscada com o motivo. E nota ordinal de 1 a 5 somada com peso é aritmética sobre escala que não
é intervalar; quando o critério tem medida real (custo em reais, prazo em dias), usar a medida normalizada e
deixar a nota só para o que não tem medida, marcando qual é qual.

**Versões sugeridas.**
- **V1 básica: três opções.** Três desenhos fictícios de remuneração variável contra cinco critérios com pesos e
  total.
- **V2 com decomposição.** A coluna de total vira barra empilhada por critério, mostrando que o vencedor ganha
  quase só em "simplicidade de apuração".
- **V3 real do Farol: orçamento de 2027.** Quatro cenários fictícios contra sete critérios, com o eliminatório
  "cabe na capacidade medida de pré-vendas"; um cenário com o maior total sai riscado por falhar o eliminatório.
- **V4 caso limite: decisão instável.** A sensibilidade mostra que com o peso de custo 10% maior outro cenário
  vence; o cartão exibe o selo "decisão sensível ao peso de custo" em vez de coroar um vencedor.

**Referências.**
- Catálogo: [Wikipedia, Decision-matrix method](https://en.wikipedia.org/wiki/Decision-matrix_method): observar a opção de referência, a marcação melhor, pior e igual, a variante ponderada e as quatro fraquezas listadas.
- Praticante: [NN/g, 5 Prioritization Methods in UX Roadmapping](https://www.nngroup.com/articles/prioritization-methods/) (não abriu; apareceu literalmente em busca anterior deste estudo): comparação de métodos de priorização em que a pontuação ponderada aparece ao lado da matriz 2x2.
- Ferramenta: [Recharts, índice da API](https://recharts.github.io/en-US/api/): observar `BarChart`, `Bar` e a lista de componentes cartesianos disponíveis para a decomposição.

---

## 23. Matriz de pares

**Descrição.** Entidades contra entidades do mesmo tipo, com a intensidade da relação na célula: quem passa
oportunidade para quem no handoff, quais motivos de perda aparecem juntos, qual fila redistribui lead para qual.
O exemplo de referência é a matriz de coocorrência de personagens de *Les Misérables* de Mike Bostock: célula
mais escura para coocorrência mais frequente, matiz pela comunidade detectada e três ordenações (nome,
frequência, agrupamento). O argumento a favor é o que separa este modelo da família 27: na matriz,
cruzamento de linha é impossível, então rede densa continua legível; e com nós relacionados próximos fica fácil
achar agrupamento e ponte.

**Anatomia.** Mesma lista nas linhas e nas colunas, na mesma ordem; em relação simétrica (coocorrência), só o
triângulo inferior; em relação direcional (de quem para quem), a matriz inteira com "origem ↓" e "destino →"; a
diagonal com tratamento próprio (vazia, ou "a si mesmo" quando faz sentido); seletor de ordenação visível.

**Abordagem na stack.** `html-tailwind` até ~15 por 15; `svg-puro` acima, com a `escalaBanda` da seção base e
rótulos de coluna rotacionados. A ordenação é calculada em TypeScript; a mais simples que já revela bloco é por
baricentro iterativo.

```ts
// ordena índices para aproximar quem se relaciona: posição = média ponderada das posições dos vizinhos
export function ordemBaricentro(m: number[][], iteracoes = 12) {
  let ordem = m.map((_, i) => i);
  for (let t = 0; t < iteracoes; t++) {
    const pos = new Map(ordem.map((id, p) => [id, p] as const));
    const peso = (i: number) => {
      let s = 0, w = 0;
      m[i].forEach((v, j) => { if (j !== i && v > 0) { s += v * (pos.get(j) ?? 0); w += v; } });
      return w === 0 ? (pos.get(i) ?? 0) : s / w;
    };
    ordem = [...ordem].sort((a, b) => peso(a) - peso(b));
  }
  return ordem;
}
```

**Ponto delicado.** A ordem decide tudo: a mesma matriz em ordem alfabética parece ruído e ordenada por
agrupamento mostra blocos. O seletor de ordem precisa estar à vista e a ordem padrão, declarada. Em relação
direcional, trocar linha por coluna inverte a leitura, então o cabeçalho escreve o sentido. E matriz esparsa (90%
de zeros) desperdiça tela: colapsar linhas e colunas sem nenhum par em "n entidades sem relação", no rodapé.

**Versões sugeridas.**
- **V1 básica: handoff por par.** 6 SDRs fictícios nas linhas e 9 executivos nas colunas, contagem de
  oportunidades passadas no trimestre.
- **V2 com taxa e amostra.** A cor passa a ser a taxa de ganho do par, com o `n` escrito na célula e esmaecimento
  abaixo de 10 oportunidades; a anotação aponta o par que converte o dobro da média.
- **V3 real do Farol: motivos de perda que andam juntos.** 18 motivos fictícios em 1.460 perdas, triângulo
  inferior ordenado por agrupamento; o bloco "sem retorno", "contato inválido" e "sem fit" aparece colado.
- **V4 caso limite: matriz esparsa.** 40 origens com 92% de pares vazios; ordenação por agrupamento, 22 origens
  sem par colapsadas no rodapé e a matriz reduzida a 18 por 18.

**Referências.**
- Praticante: [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/): observar as três ordenações, a codificação por opacidade e matiz e o argumento de que matriz não tem cruzamento de linha.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar a opção `ticks` para rotular só parte de um domínio de alta cardinalidade.
- Catálogo: [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar o *XY heatmap* como forma de padrão entre duas categorias.

---

## 24. Pequenos múltiplos de quadrantes

**Descrição.** O mesmo quadrante repetido por segmento, por plataforma ou por período, com escalas idênticas. O
pequeno múltiplo é uma série de gráficos semelhantes com a mesma escala e os mesmos eixos, e Tufte o defende
como resposta à pergunta que está no centro do raciocínio quantitativo: "comparado com o quê?". No Observable
Plot a mesma ideia chama facetamento: os canais `fx` e `fy` particionam os dados e repetem o gráfico por
partição, com as escalas de posição compartilhadas por padrão. Para esta família o ganho é específico: ver se a
**massa por região** muda entre painéis.

**Anatomia.** Grade de 2 a 12 painéis com domínio idêntico e o mesmo corte (ou, quando o corte muda por painel,
o valor escrito no título); título do painel com o nome e a contagem por região em linha curta; eixos numéricos só
na borda externa da grade; destaque de entidade sincronizado entre painéis.

**Abordagem na stack.** `html-tailwind` como grade de `ScatterChart` do `recharts-nativo`, todos recebendo as
mesmas constantes de domínio e de corte. O destaque sincronizado é estado React por `id`, não `syncId`.

```tsx
const [ativo, setAtivo] = useState<string | null>(null);

<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
  {paineis.map(p => (
    <figure key={p.id} className="rounded-md bg-[var(--surface)] p-2">
      <figcaption className="text-xs text-[var(--text-muted)]">{p.nome} · {p.resumo}</figcaption>
      <ScatterChart responsive data={p.itens} height={180}>
        <XAxis type="number" dataKey="x" domain={DX} hide={!p.bordaInferior} />
        <YAxis type="number" dataKey="y" domain={DY} hide={!p.bordaEsquerda} />
        <ReferenceLine x={CORTE.x} stroke="var(--line-strong)" />
        <ReferenceLine y={CORTE.y} stroke="var(--line-strong)" />
        <Scatter onMouseEnter={(d: { id: string }) => setAtivo(d.id)} onMouseLeave={() => setAtivo(null)}
          shape={(s: any) => <circle cx={s.cx} cy={s.cy} r={s.payload.id === ativo ? 5 : 3}
            fill={s.payload.id === ativo ? 'var(--chart-2)' : 'var(--text-muted)'} />} />
      </ScatterChart>
    </figure>
  ))}
</div>
```

**Ponto delicado.** Domínio automático por painel destrói o modelo sem aviso: cada painel se estica até os próprios
dados e a mesma posição passa a significar valores diferentes. O `syncId` do Recharts sincroniza tooltip e brush
com `syncMethod` padrão por **índice**, o que em dispersão liga pontos que só coincidem na posição do array; por
isso a sincronização é por `id` em estado próprio. Com muitos painéis, esconder eixos internos e manter só o
corte e a contagem por região; com poucos itens por painel, a comparação vira anedota e o painel precisa dizer o
`n`.

**Versões sugeridas.**
- **V1 básica: quatro plataformas.** CPL contra taxa de qualificação por campanha, um painel por plataforma
  fictícia, mesmo domínio e mesmos cortes.
- **V2 com destaque sincronizado.** Passar o mouse numa campanha presente em várias plataformas acende o ponto em
  todos os painéis, com a anotação "a mesma peça é boa numa plataforma e ruim em outra".
- **V3 real do Farol: executivos por trimestre.** Seis trimestres fictícios em painéis, ticket contra win rate,
  com a meta que mudou no terceiro trimestre escrita no título de cada painel (a saída prevista no modelo 3).
- **V4 caso limite: painel quase vazio.** Um trimestre com 2 executivos ativos aparece com o selo "amostra
  pequena"; um painel sem dados mantém a moldura e o texto "sem oportunidades no período", sem sumir da grade.

**Referências.**
- Praticante: [Wikipedia, Small multiple](https://en.wikipedia.org/wiki/Small_multiple): observar a exigência de mesma escala e mesmos eixos e a citação de Tufte sobre "comparado com o quê".
- Catálogo: [Observable Plot, Facets](https://observablehq.github.io/plot/features/facets): observar `fx` e `fy`, as escalas compartilhadas por padrão, `facetAnchor` e a sugestão de moldura por painel.
- Ferramenta: [Recharts, ScatterChart](https://recharts.github.io/en-US/api/ScatterChart/): observar `syncId` e `syncMethod` com padrão `index`, a razão para sincronizar por `id` em estado próprio.

---

## 25. Quadrante com lista sincronizada

**Descrição.** Plano e lista na mesma tela, ligados nos dois sentidos: clicar numa região ou arrastar um retângulo
filtra a lista; passar o mouse numa linha da lista acende o ponto. É o modelo que devolve ao quadrante a
identidade que ele perde acima de ~25 entidades. O exemplo de pincel retangular do Vega-Lite é a referência de
gramática: uma seleção do tipo intervalo, pontos selecionados coloridos e não selecionados em cinza por condição
na codificação de cor. O visual de quadrante do Visier segue a mesma lógica com drill por clique direito.

**Anatomia.** Plano à esquerda com cerca de 60% da largura; lista à direita com contagem ("12 de 84"), soma da
medida e ordenação declarada; chip da seleção ativa com botão de limpar; itens fora do plano por dado ausente no
fim da lista com selo próprio; estado vazio com instrução.

**Abordagem na stack.** `recharts-custom` com `html-tailwind`. O `Brush` do Recharts é de um eixo só, feito para
série; seleção retangular em dispersão é camada própria, com `usePlotArea` e as escalas inversas. O destaque vindo
da lista é um segundo `Scatter` com um item só, para não redesenhar a nuvem inteira a cada hover.

```tsx
type Ret = { x1: number; x2: number; y1: number; y2: number };

function SelecaoRetangular({ onFim }: { onFim: (r: Ret) => void }) {
  const area = usePlotArea();
  const invX = useXAxisInverseScale(); // pixel para dado; conferir a assinatura na 3.10
  const invY = useYAxisInverseScale();
  const [ini, setIni] = useState<{ x: number; y: number } | null>(null);
  const [fim, setFim] = useState<{ x: number; y: number } | null>(null);
  if (!area || !invX || !invY) return null;
  const local = (e: React.PointerEvent<SVGRectElement>) => {
    const b = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };
  return (
    <g>
      <rect x={area.x} y={area.y} width={area.width} height={area.height} fill="transparent"
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); const p = local(e); setIni(p); setFim(p); }}
        onPointerMove={e => { if (ini) setFim(local(e)); }}
        onPointerUp={() => {
          if (ini && fim) onFim({
            x1: Number(invX(Math.min(ini.x, fim.x))), x2: Number(invX(Math.max(ini.x, fim.x))),
            y1: Number(invY(Math.max(ini.y, fim.y))), y2: Number(invY(Math.min(ini.y, fim.y))), // pixel y cresce para baixo
          });
          setIni(null); setFim(null);
        }} />
      {ini && fim && <rect pointerEvents="none" x={Math.min(ini.x, fim.x)} y={Math.min(ini.y, fim.y)}
        width={Math.abs(fim.x - ini.x)} height={Math.abs(fim.y - ini.y)}
        fill="var(--chart-2)" fillOpacity={0.08} stroke="var(--chart-2)" />}
    </g>
  );
}
```

**Ponto delicado.** Camada: o retângulo transparente declarado depois do `Scatter` cobre os pontos e mata o
tooltip; declarado antes, os pontos continuam clicáveis e o arrasto começa no espaço vazio. Conferir a ordem de
pintura no build, porque a 3.x organiza parte dos filhos por camada. Eixo Y invertido em pixel é a fonte do bug
mais comum (o `y1` de dado sai do maior `y` de pixel). E a lista precisa reagir ao **mesmo** filtro global do
cartão: seleção local que ignora o filtro de período mostra contagem que não bate com o plano. Em cartão estreito,
a lista vai para baixo como gaveta, com a contagem sempre visível.

**Versões sugeridas.**
- **V1 básica: clique na região.** Clicar num dos quatro blocos de região filtra a lista de 30 campanhas fictícias.
- **V2 com pincel retangular.** Arrasto livre com contagem e soma de investimento da seleção em tempo real.
- **V3 real do Farol: forecast.** 84 oportunidades fictícias, valor contra dias parada; a lista mostra valor, dias,
  estágio e executivo fictício, ordenada por valor em risco; hover na linha acende o ponto.
- **V4 caso limite: seleção vazia e fora do plano.** Retângulo sem nenhum ponto mostra "nenhuma oportunidade nesta
  área; limpar seleção"; 6 oportunidades sem data de último movimento ficam no fim da lista com o selo "fora do
  plano: sem data".

**Referências.**
- Catálogo: [Vega-Lite, Rectangular Brush](https://vega.github.io/vega-lite/examples/interactive_brush.html): observar `select: interval` e a condição de cor que separa selecionado de não selecionado.
- Praticante: [Visier, Quadrant visual](https://docs.visier.com/developer/Analytics/visual%20types/2x2%20scatter%20plot.htm): observar o drill por clique direito como caminho do plano para o detalhe.
- Ferramenta: [Recharts, useXAxisScale](https://recharts.github.io/en-US/api/useXAxisScale/): observar o retorno `ScaleFunction | undefined`, o uso só dentro do gráfico e a existência da versão inversa.

---

## 26. Plano com fronteira curva de equilíbrio

**Descrição.** Quando a regra de decisão é um produto ou uma razão dos dois eixos, o corte certo não é reto.
Vitórias são oportunidades trabalhadas vezes taxa de ganho; investimento é leads vezes CPL. As curvas em que esse
produto é constante são hipérboles, e a meta ("12 vitórias no trimestre") vira uma fronteira curva que separa quem
chega de quem não chega, por caminhos diferentes. O modelo 12 tem a versão reta dessa ideia (razão constante é
reta pela origem); aqui a regra é produto. É o argumento da tcviz levado adiante: o corte deve refletir a regra
real, e não uma cruz por conveniência.

**Anatomia.** Curvas de nível em traço fino com o valor na ponta ("5, 10, 20 vitórias"); a curva da meta em traço
médio com a região acima dela em tom baixo; pontos por entidade; tooltip com o produto calculado; nota que diz a
fórmula da curva.

**Abordagem na stack.** `recharts-custom`: componente filho que lê `useXAxisScale` e `useYAxisScale` e desenha a
curva como `path` a partir de pontos amostrados. A região acima da curva fecha o mesmo caminho até o canto
superior direito do domínio.

```tsx
function Isoquanta({ k, dx, dy, rotulo }: { k: number; dx: [number, number]; dy: [number, number]; rotulo: string }) {
  const sx = useXAxisScale(), sy = useYAxisScale();
  if (!sx || !sy || k <= 0) return null;
  const x0 = Math.max(dx[0], k / dy[1], 1e-9), x1 = dx[1]; // começa onde a curva entra pelo topo
  const pts: [number, number][] = [];
  for (let i = 0, N = 64; i <= N; i++) {
    const x = x0 * Math.pow(x1 / x0, i / N); // passo geométrico: mais pontos onde a curva dobra
    const y = k / x;
    if (y >= dy[0] && y <= dy[1]) pts.push([Number(sx(x)), Number(sy(y))]);
  }
  if (pts.length < 2) return null;
  const [lx, ly] = pts[pts.length - 1];
  return (
    <g>
      <path d={'M' + pts.map(p => p.join(',')).join('L')} fill="none" stroke="var(--line-strong)" strokeDasharray="4 4" />
      <text x={lx - 4} y={ly - 6} textAnchor="end" fontSize={11} fill="var(--text-muted)">{rotulo}</text>
    </g>
  );
}
```

**Ponto delicado.** Amostragem com passo uniforme em X deixa a curva quebrada perto do eixo, onde ela muda
rápido; o passo geométrico resolve. Recortar a curva no domínio é obrigatório, senão o `path` sai da área de
plotagem. Em escala logarítmica nos dois eixos a hipérbole vira reta de inclinação menos um, o que é elegante e
explica o formato, mas `scale="log"` não aceita zero: entidade com zero vitórias some do plano e precisa ir para
uma faixa própria. E a fronteira continua sendo zona (regra 5): quem está a uma vitória da curva não é outro tipo.

**Versões sugeridas.**
- **V1 básica: isoquantas de vitórias.** 14 executivos fictícios, oportunidades trabalhadas no X e taxa de ganho no
  Y, curvas de 5, 10 e 20 vitórias.
- **V2 com a meta como fronteira.** Curva de 12 vitórias em traço médio, região acima em tom baixo e a anotação "4
  executivos chegam na meta com metade do volume da equipe".
- **V3 real do Farol: iso-investimento.** 48 campanhas fictícias, leads no X e CPL no Y, curvas de R$ 5 mil, 20
  mil e 50 mil; campanhas na mesma curva custam igual e entregam volumes muito diferentes.
- **V4 caso limite: eixos logarítmicos e zero.** Alternador para log nos dois eixos, em que as curvas viram retas
  paralelas; 3 executivos com zero vitórias ficam numa faixa "sem vitórias" abaixo do plano.

**Referências.**
- Praticante: [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/): observar a defesa de zonas que reflitam a regra do negócio, que aqui ganha forma de curva.
- Ferramenta: [Recharts, useXAxisScale](https://recharts.github.io/en-US/api/useXAxisScale/): observar a função de dado para pixel, que dispensa refazer a conta do domínio.
- Ferramenta: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar que `segment` só desenha reta, o limite que obriga o `path` próprio.
- Catálogo: [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar dispersão e bolha como formas padrão de Correlação, sobre as quais a curva é camada.

---

## 27. Quadrante de variação centrado no zero

**Descrição.** Os dois eixos são variações com sinal entre dois períodos, e a origem é "nada mudou". Os quatro
quadrantes têm leitura imediata: cresceu e melhorou, cresceu e piorou, encolheu e melhorou, encolheu e piorou. É
diferente do corte estatístico e do corte por meta, porque o zero não é escolha do analista; e é diferente da
matriz BCG do modelo 5, em que só um eixo é variação. A FT Visual Vocabulary agrupa esse raciocínio na categoria
Desvio, cujo gráfico base é a barra divergente que acomoda valores negativos e positivos.

**Anatomia.** Domínio simétrico em torno do zero nos dois eixos; cruz no zero em traço sólido; rótulo de ação nos
quatro quadrantes; ticks com sinal explícito ("+5 p.p."); unidade declarada em cada eixo, separando variação
percentual de variação em pontos percentuais; entidades com base pequena marcadas.

**Abordagem na stack.** `recharts-nativo`: `ScatterChart` com `ReferenceLine x={0}` e `ReferenceLine y={0}`, como no
gist de quatro quadrantes, e domínio simétrico calculado em TypeScript com teto para valor extremo.

```ts
export function dominioSimetrico(vals: number[], folga = 0.1, teto = Infinity): [number, number] {
  const m = Math.max(1e-9, ...vals.filter(Number.isFinite).map(Math.abs));
  const lim = Math.min(teto, m * (1 + folga));
  return [-lim, lim];
}

export const comSinal = (v: number, unidade: string) =>
  `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unidade}`;

// valor além do teto fica preso na borda, com a marca de "fora da escala" e o valor real no rótulo
export const prender = (v: number, [lo, hi]: [number, number]) => ({ v: Math.min(hi, Math.max(lo, v)), fora: v < lo || v > hi });
```

**Ponto delicado.** Variação percentual sobre base pequena explode: de 2 para 6 leads é +200% e empurra o eixo
inteiro, achatando o resto na cruz. Três travas: taxa varia em pontos percentuais e nunca em percentual de
percentual; volume com base abaixo de um mínimo declarado sai do plano; e valor extremo fica preso na borda com
marca e valor escrito, com `ifOverflow` nunca esticando o domínio por causa dele. Entidade nova não tem variação
(divisão por zero) e vai para o rodapé. Domínio assimétrico tira o zero do centro e faz o quadrante "piorou"
parecer menor do que é.

**Versões sugeridas.**
- **V1 básica: plataformas mês contra mês.** 5 plataformas fictícias, variação do investimento (%) contra variação
  do CPL qualificado (%), cruz no zero.
- **V2 com anotação por quadrante.** O quadrante "gastou mais e piorou" ganha o rótulo de ação e a nota "2
  plataformas, 71% do aumento de investimento".
- **V3 real do Farol: origens de lead.** 22 origens fictícias, variação de volume (%) contra variação da taxa de
  qualificação (p.p.), com base mínima de 30 leads nos dois meses e as 5 origens abaixo dela listadas no rodapé.
- **V4 caso limite: valor extremo e origem nova.** Uma origem com +480% fica presa na borda direita com seta e o
  valor; 3 origens que não existiam no mês anterior aparecem no rodapé como "sem base de comparação".

**Referências.**
- Catálogo: [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a categoria Desvio e a barra divergente, que lida com negativos e positivos.
- Ferramenta: [Recharts, gist de ScatterChart com 4 quadrantes](https://gist.github.com/mehulcse/f729d4e93ee1dc67d7c8d22eb73bf940): observar as duas `ReferenceLine` no zero, o esqueleto exato deste modelo.
- Ferramenta: [Recharts, API do ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/): observar `ifOverflow` e por que não usar `extendDomain` para valor extremo.

---

## 28. Matriz de responsabilidade (RACI)

**Descrição.** Etapas de um processo nas linhas, papéis nas colunas e uma letra na célula: R para quem executa, A
para quem responde em última instância, C para quem é consultado em via dupla e I para quem é informado em via
única. A regra de governança é uma só: exatamente um A por etapa. Há variantes com letras extras (RASCI com
suporte, RACI-VSL com verificador e signatário, CAIRO com "fora do circuito", DACI). No Farol ela serve ao handoff
de pré-vendas para vendas, e ganha interesse quando cruza o declarado com o executado. Mora aqui, e não na família
14, porque a célula nomeia um papel e a leitura é o padrão da grade.

**Anatomia.** Etapas na ordem do processo; papéis nas colunas; letra em glifo com forma e tom próprios (A cheio, R
contornado, C e I só texto); coluna de alerta à direita; linha de rodapé com a carga de cada papel (quantos R e A);
legenda das letras sempre visível.

**Abordagem na stack.** `html-tailwind` com tabela semântica (`<table>`, `<th scope>`), porque a matriz é
documento e precisa de leitor de tela. A validação roda em TypeScript e vira coluna de alerta.

```ts
type Letra = 'R' | 'A' | 'C' | 'I';
type Etapa = { nome: string; papeis: Partial<Record<string, Letra[]>> };

export function validarRaci(etapas: Etapa[], papeis: readonly string[]) {
  const alertas: { alvo: string; msg: string }[] = [];
  for (const e of etapas) {
    const nA = papeis.filter(p => e.papeis[p]?.includes('A')).length;
    if (nA !== 1) alertas.push({ alvo: e.nome, msg: `${nA} responsáveis finais (A); o esperado é 1` });
    if (!papeis.some(p => e.papeis[p]?.includes('R'))) alertas.push({ alvo: e.nome, msg: 'ninguém executa (R)' });
  }
  for (const p of papeis)
    if (!etapas.some(e => e.papeis[p]?.length)) alertas.push({ alvo: p, msg: 'papel sem nenhuma letra' });
  return alertas;
}
```

**Ponto delicado.** Letra só por cor falha em acessibilidade e em impressão: a forma do glifo carrega a diferença,
e a cor só reforça. Célula com duas letras ("A e R") é comum e legítima e não pode quebrar o layout. O maior risco
é de leitura: RACI é declaração de processo, não medição; quando o cartão cruza com quem de fato registrou a
etapa no CRM, as duas camadas precisam de etiqueta própria (PREMISSA para o declarado, MEDIDO para o executado).

**Versões sugeridas.**
- **V1 básica: handoff declarado.** 8 etapas fictícias (qualificar, agendar, registrar nota, aceitar oportunidade,
  primeira reunião, atualizar estágio, registrar perda, devolver lead) contra 5 papéis.
- **V2 com alertas.** A etapa "registrar perda" sem nenhum A ganha ícone e tom de alerta; o rodapé mostra o
  executivo com 6 R e nenhum apoio.
- **V3 real do Farol: declarado contra executado.** Cada célula mostra a letra declarada e o percentual de vezes
  que aquele papel de fato registrou a etapa no trimestre fictício; divergência acima de 30 pontos em destaque.
- **V4 caso limite: variante e papel vago.** Variante RASCI com a letra S; um papel sem ocupante no período aparece
  com a coluna hachurada e "papel sem ocupante desde 2026-08-01", sem apagar as letras declaradas.

**Referências.**
- Catálogo: [Wikipedia, Responsibility assignment matrix](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix): observar a definição das quatro letras, a regra de um único A por etapa, o layout etapa por papel e as variantes.
- Catálogo: [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell): observar texto sobre célula ordinal, a base da célula com letra.
- Portal de design: nenhuma peça de RACI em dashboard foi aberta nesta pesquisa; lacuna registrada.

---

## Vizinhos que moram melhor em outra família

| Forma | Por que não fica aqui | Família |
|---|---|---|
| Matriz de dispersões (SPLOM) | um gráfico de relação por par, sem região nomeada | 09_dispersao-e-bolhas |
| Dispersão conectada com mais de dois momentos | o assunto é o caminho no tempo, não a troca de região | 09_dispersao-e-bolhas |
| Mapa de calor contínuo, calendário e coorte | a célula existe para ler gradiente, não para nomear grupo | 15_mapa-de-calor-e-calendario |
| Sankey de mudança de estado por vários estágios | o caminho completo importa mais que o par início e fim | 11_fluxo-sankey |
| Mosaico de tabela de contingência | a área da célula codifica proporção, o que a matriz aqui proíbe | 26_mosaico-marimekko |
| Grafo de nós e arestas | o interesse é caminho, vizinhança e centralidade | 27_rede-e-relacoes |
| Tabela com glifo lida linha a linha | leitura de registro, não de padrão de preenchimento | 14_tabelas-visuais |
| Comparação de uma entidade em muitos critérios | perfil de uma opção, sem grade de opções | 18_radar |
| Distância até a meta em um só eixo | progresso, sem segunda dimensão | 13_progresso-meta-e-gauge |

## Lacunas desta pesquisa

- A cota de busca da sessão acabou no meio do estudo; os modelos 13 a 28 se apoiam em 25 páginas abertas
  diretamente, e não em nova rodada de busca.
- O Data Viz Project devolveu 403 ao fetch; os dois shots de matriz no Dribbble voltaram vazios. Os portais de
  design têm pouca peça de matriz discreta para dashboard (a busca de matriz 2x2 devolve quase só quadro branco);
  RACI, matriz de confusão e de-para ficaram sem referência de portal.
- Não foi aberta fonte específica de Storytelling with Data, Stephen Few, Andy Kirk, Alberto Cairo, Nightingale ou
  FlowingData sobre esta família; a crítica metodológica veio de Cox (via verbete), Marty, tcviz e Bostock.
- A assinatura exata de `useXAxisInverseScale` e o tipo de retorno de `ScaleFunction` precisam ser conferidos no
  build da 3.10 antes de virar código de catálogo.

## Fontes consultadas

Legenda: sem marca, a página foi aberta; (não abriu) apareceu literalmente em resultado de busca, mas não carregou.

**Catálogos**
- [Data Viz Project, 2x2 Matrix](https://datavizproject.com/data-type/2x2-matrix/) (não abriu; 403)
- [visualizing.org, Quadrant Chart](https://www.visualizing.org/quadrant-chart) (não abriu)
- [Data Visualisation Catalogue, correlation matrix](https://datavizcatalogue.com/blog/chart-snapshot-correlation-matrix/)
- [From Data to Viz, página inicial](https://www.data-to-viz.com/)
- [From Data to Viz, Correlogram](https://www.data-to-viz.com/graph/correlogram.html)
- [From Data to Viz, Overplotting](https://www.data-to-viz.com/caveat/overplotting.html) (não abriu)
- [FT Visual Vocabulary, chart doctor](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary)
- [Observable Plot, arrow mark](https://observablehq.github.io/plot/marks/arrow)
- [Observable Plot, cell mark](https://observablehq.github.io/plot/marks/cell)
- [Observable Plot, Facets](https://observablehq.github.io/plot/features/facets)
- [Vega-Lite v2, Scatterplot with Mean and Standard Deviation Overlay](https://vega.github.io/vega-lite-v2/examples/layer_global_mean_dev.html) (não abriu)
- [Vega-Lite, Scatter Plot with Text Marks](https://vega.github.io/vega-lite/examples/text_scatterplot_colored.html) (não abriu)
- [Vega-Lite, galeria de exemplos](https://vega.github.io/vega-lite/examples/) (não abriu)
- [Vega-Lite, Rectangular Brush](https://vega.github.io/vega-lite/examples/interactive_brush.html)
- [UpSet](https://upset.app/)
- [Wikipedia, Risk matrix](https://en.wikipedia.org/wiki/Risk_matrix)
- [Wikipedia, GE multifactorial analysis](https://en.wikipedia.org/wiki/GE_multifactorial_analysis)
- [Wikipedia, Perceptual mapping](https://en.wikipedia.org/wiki/Perceptual_mapping)
- [Wikipedia, Confusion matrix](https://en.wikipedia.org/wiki/Confusion_matrix)
- [Wikipedia, Harvey balls](https://en.wikipedia.org/wiki/Harvey_balls)
- [Wikipedia, Decision-matrix method](https://en.wikipedia.org/wiki/Decision-matrix_method)
- [Wikipedia, Responsibility assignment matrix](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix)

**Praticantes**
- [Raffael Marty, Two-by-Two Matrices](https://www.informit.com/articles/article.aspx?p=709139&seqNum=7)
- [tcviz, What is a quadrant chart](https://tcviz.com/blog/what-is-a-quadrant-chart/)
- [Visier, Quadrant visual (2x2 scatter plot)](https://docs.visier.com/developer/Analytics/visual%20types/2x2%20scatter%20plot.htm)
- [Mike Bostock, Les Misérables Co-occurrence](https://bost.ocks.org/mike/miserables/)
- [Wikipedia, Small multiple (Tufte)](https://en.wikipedia.org/wiki/Small_multiple)
- [Wikipedia, Time management (método Eisenhower)](https://en.wikipedia.org/wiki/Time_management)
- [Michael Sandberg, Calling Bullshit on the 2017 Gartner Magic Quadrant](https://datavizblog.com/2017/02/23/calling-bullshit-on-the-2017-gartner-magic-quadrant-for-bi-analytics-platforms/) (não abriu)
- [Mark Sellors, Gartner-style charts in R with ggplot2](https://blog.sellorm.com/2019/02/11/gartner-style-charts-in-r-with-ggplot2/) (não abriu)
- [Learn Lean Sigma, Impact Effort Matrix](https://www.learnleansigma.com/guides/impact-effort-matrix/) (não abriu)
- [NN/g, 5 Prioritization Methods in UX Roadmapping](https://www.nngroup.com/articles/prioritization-methods/) (não abriu)

**Ferramentas e bibliotecas**
- [Recharts, índice da API](https://recharts.github.io/en-US/api/)
- [Recharts, ReferenceLine](https://recharts.github.io/en-US/api/ReferenceLine/)
- [Recharts, ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/)
- [Recharts, Scatter](https://recharts.github.io/en-US/api/Scatter/)
- [Recharts, ScatterChart](https://recharts.github.io/en-US/api/ScatterChart/)
- [Recharts, useXAxisScale](https://recharts.github.io/en-US/api/useXAxisScale/)
- [Recharts, gist de ScatterChart com 4 quadrantes](https://gist.github.com/mehulcse/f729d4e93ee1dc67d7c8d22eb73bf940)
- [Mermaid, proposta de diagrama 2x2](https://github.com/mermaid-js/mermaid/issues/4282)
- [scikit-learn, ConfusionMatrixDisplay](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ConfusionMatrixDisplay.html)
- [Highcharts, demo de heatmap](https://www.highcharts.com/demo/highcharts/heatmap) (abriu sem o texto do demo)
- [Highcharts, demo de bubble sand-signika](https://www.highcharts.com/demo/bubble/sand-signika) (não abriu; 404)
- [AG Charts, Multiple Bubble Series](https://www.ag-grid.com/charts/gallery/multiple-bubble-series/) (não abriu)
- [Apache ECharts, issue 16401](https://github.com/apache/echarts/issues/16401) (não abriu)
- [graphomate, BCG Matrix with graphomate bubbles](https://www.graphomate.com/en/2018/09/charts-tables-for-ui5-2-2/) (não abriu)

**Portais de design**
- [Dribbble, Priority Matrix dark mode](https://dribbble.com/shots/17008842-Priority-Matrix-dark-mode)
- [Dribbble, Figma infographics, Matrix distribution, Scatter chart](https://dribbble.com/shots/5270970-Figma-infographics-Matrix-distribution-Scatter-chart) (não abriu)
- [Dribbble, Animated Matrix Chart, 49 Days of Charts](https://dribbble.com/shots/17790868-Animated-Matrix-Chart-49-Days-of-Charts) (não abriu)
- [Behance, Quadrant Chart (Scatter Plot)](https://www.behance.net/gallery/182422151/Quadrant-Chart-%28Scatter-Plot%29)
- [Miro, template de matriz 2x2 de priorização](https://miro.com/templates/2x2-prioritization-matrix/) (não abriu)
- [CNVS, 10 Ways to Design an Impact Effort Matrix](https://www.getcnvs.design/blog/design-an-impact-effort-matrix) (não abriu)
- [UXPin, Priority Matrix: the value of a unique UX](https://www.uxpin.com/studio/blog/priority-matrix-the-value-of-a-unique-ux/) (não abriu)
