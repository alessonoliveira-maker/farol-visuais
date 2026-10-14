# Família 13: progresso, meta e gauge

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10, Tailwind 4, lucide-react. Tema escuro por padrão.
Sem dependência nova: o que o Recharts não faz vira SVG puro em React com geometria em TypeScript, ou HTML com Tailwind.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa, empresa ou plataforma real.

## O que a família responde

Esta é a família do **número contra a régua**. O visual não existe para mostrar quanto vale a medida; existe para
responder se a medida está **onde deveria estar**. Stephen Few resume o problema no primeiro parágrafo da
especificação do bullet graph: o formato foi criado "para substituir os medidores e ponteiros usados em painéis",
porque o desenho linear "dá uma exibição rica de dado em pouco espaço" e "permite leitura mais eficiente que
medidores radiais". Toda a família herda essa tensão: de um lado o arco, bonito e péssimo de ler; do outro a
barra com traço de meta, feia de apresentação e certeira.

O contrato do Farol já tomou lado. O item M4 do `00_acabamento.md` manda usar bullet graph no lugar de gauge, e a
lista de armadilhas registra o gauge como erro número 2: "ângulo lê mal, ocupa espaço e escala arbitrária (arco de
83% valendo 100%)". Este estudo cataloga o gauge assim mesmo, porque ele aparece em pedido de diretoria e porque
existe uma forma honesta de desenhá-lo, mas cada modelo radial carrega a ressalva.

Perguntas típicas no Farol:

- **Comercial:** quanto da meta trimestral de receita reconhecida já fechou? O executivo está no ritmo para bater a
  cota até o fim do mês? Quantas oportunidades faltam para o forecast fechar?
- **Pré-vendas:** a fila de hoje cabe na capacidade da equipe? Das agendas da semana, quantas estão marcadas contra
  as 90 previstas? Quantos dias seguidos a fila fechou dentro do SLA?
- **Marketing:** o CPL do mês está dentro da faixa aceitável, no limite ou estourado? Quanto do orçamento da
  plataforma já foi consumido e faltam quantos dias de mês?
- **Diretoria:** a demanda projetada passa do teto de capacidade medido? O cenário base entrega a meta de 2027 ou
  só a faixa otimista chega lá? Quais marcos do plano já foram atingidos?

Três perguntas que **não** são desta família. Composição de um total ("de que é feito") é 06 ou 07. Evolução no
tempo sem alvo é 04 ou 05. Comparação entre categorias sem meta é 02. Assim que a meta sai de cena, o visual
vira barra comum e muda de casa.

## Decisões transversais da família

1. **Meta declarada, não subentendida.** Todo visual desta família escreve o valor da meta em texto, não só
   desenha o traço. A régua A4 do acabamento vale aqui: meta e teto entram como `ReferenceLine` com
   `ifOverflow="extendDomain"`, porque o padrão `"discard"` do Recharts **apaga a linha quando a meta passa do
   maior valor**, que é justamente o caso interessante (meta longe, realizado baixo).

2. **Passar de 100% é normal e precisa caber.** Barra de progresso de biblioteca costuma travar em 100%. Meta
   comercial é batida com folga. O domínio do desenho vai até `Math.max(meta, realizado) * 1,05`, e o excedente
   ganha marca própria (hachura, tom mais claro, rótulo "+14% acima da meta"). Travar em 100% é apagar informação.

3. **O tempo decorrido é a segunda régua.** 60% da meta no dia 10 de 30 é ótimo; no dia 28 é desastre. Sempre que
   a meta tem prazo, o visual mostra o **ritmo esperado** como marcador secundário. Few chama isso de projeção e
   sugere partir a medida em dois segmentos, realizado e projetado. A régua G11 do acabamento define a textura:
   realizado sólido, projeção tracejada, mesma cor.

4. **Três faixas qualitativas, no máximo cinco.** Few é explícito: "o número de faixas qualitativas deve ser
   limitado a no máximo cinco e idealmente a três. Mais de cinco estados exigiria um nível de raciocínio
   perceptual que não é eficiente para um painel".

5. **Faixa por intensidade, não por matiz.** Ainda Few: "em vez de matizes distintos, que podem não ser
   distinguíveis por quem é daltônico, codifique essas faixas como intensidades distintas do escuro ao claro de um
   único matiz". A tabela original é sobre preto no branco (três faixas: 40%, 25% e 10% de preto, a mais escura
   para o pior estado). No tema escuro do Farol isso vira o inverso literal: sobreposição clara decrescente sobre
   o cartão, a mais clara marcando a zona ruim, conforme M5 do acabamento. Semáforo verde, amarelo e vermelho nas
   faixas é o atalho que a família proíbe por padrão; quando o público exigir, entra como camada extra com ícone.

6. **Polaridade da métrica manda na cor, não o sinal do número.** Receita subindo é bom; CPL subindo é ruim. Few
   trata o caso: para despesa, "a sequência das cores de fundo foi invertida", e num segundo desenho inverte
   também o sentido da barra e a escala. No Farol, métrica de custo declara `polarity: 'lower-is-better'` no dado
   e o componente inverte as faixas, nunca o leitor.

7. **Escala que não começa em zero troca a barra por ponto.** Regra literal do spec: quando a escala quantitativa
   começa acima de zero, "a medida principal deve ser codificada como um símbolo, como um ponto ou um X". Barra
   cortada mente sobre proporção. Vale também para a versão Farol da régua G1.

8. **Proporção da barra principal.** Um terço da espessura do contêiner, segundo o spec. É o que faz a faixa
   qualitativa aparecer dos dois lados da barra sem competir com ela.

9. **A meta é traço curto perpendicular, menos dominante que a barra.** Quando a barra cruza a meta, "a medida
   comparativa deve normalmente aparecer atrás da medida principal". Duas comparativas no máximo (meta e mesmo
   período do ano anterior), a segunda mais apagada.

10. **Sem dado não é zero por cento.** Barra vazia com 0% grita "fracasso"; ausência é outra coisa. Sem coleta, o
    trilho vai tracejado em `--line-strong` e o número vira `formatUnavailable()`. Vale muito aqui, porque meta
    por pessoa quase sempre tem alguém sem dado.

11. **Denominador pequeno sai com o par.** "87% da meta" sobre 8 agendas engana. `formatRateWithVolume(7, 8)`
    imprime `87,5% (7 de 8)`, e abaixo de um mínimo o visual ganha selo de amostra pequena.

12. **Nada de animação de ponteiro que balança.** O gauge animado de biblioteca oscila até assentar; no preview
    determinístico do catálogo isso nem existe, e no Farol respeita `prefers-reduced-motion`. O determinismo do
    contrato proíbe `Date.now` e `Math.random`, então nenhum modelo desta família calcula "hoje" sozinho: a data
    de corte vem no dado.

13. **Acessibilidade: a frase carrega a leitura.** `role="img"` na raiz e `aria-label` com a frase calculada,
    tipo "receita reconhecida em R$ 4,2 milhões, 84% da meta de R$ 5 milhões, faltam R$ 800 mil". Ponteiro, arco e
    trilho vão `aria-hidden`. Quem usa leitor de tela nunca deve depender de ler ângulo.

14. **Cor nunca é a única pista.** `--positive` e `--negative` entram acompanhados de sinal, ícone do lucide ou
    palavra. O gauge que fica verde ao bater a meta e vermelho ao perder é inacessível sozinho.

15. **Geometria de arco fica em TypeScript, não no olho.** Todo modelo radial que não é Recharts nativo usa a
    mesma função de ponto polar, com ângulo em graus e o zero no topo. Ela aparece uma vez aqui e os modelos
    referenciam:

    ```ts
    export type Pt = { x: number; y: number };

    export function polar(cx: number, cy: number, r: number, deg: number): Pt {
      const rad = ((deg - 90) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    /** Arco de anel entre dois ângulos, em sentido horário. Espessura = rOut menos rIn. */
    export function ringArc(cx: number, cy: number, rIn: number, rOut: number, a0: number, a1: number): string {
      const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
      const p1 = polar(cx, cy, rOut, a0);
      const p2 = polar(cx, cy, rOut, a1);
      const p3 = polar(cx, cy, rIn, a1);
      const p4 = polar(cx, cy, rIn, a0);
      return [
        `M ${p1.x} ${p1.y}`,
        `A ${rOut} ${rOut} 0 ${large} 1 ${p2.x} ${p2.y}`,
        `L ${p3.x} ${p3.y}`,
        `A ${rIn} ${rIn} 0 ${large} 0 ${p4.x} ${p4.y}`,
        'Z',
      ].join(' ');
    }

    /** Converte valor em ângulo dentro do arco do gauge, com trava nas pontas. */
    export function valueToAngle(v: number, min: number, max: number, a0: number, a1: number): number {
      if (max === min) return a0;
      const t = Math.min(1, Math.max(0, (v - min) / (max - min)));
      return a0 + t * (a1 - a0);
    }
    ```

16. **O Recharts tem dois motores radiais e eles não são intercambiáveis.** `RadialBarChart` mede pelo ângulo
    varrido da barra; `PieChart` com `startAngle` e `endAngle` mede pelo ângulo da fatia. Progresso de um valor
    contra um máximo pede `RadialBarChart` com `PolarAngleAxis type="number" domain={[0, max]} tick={false}`, que
    é o truque que faz o arco respeitar a escala em vez de normalizar a maior barra. Faixa qualitativa fixa
    (bandas boa, média, ruim) pede `PieChart` com uma `Cell` por faixa. Misturar os dois no mesmo visual exige dois
    gráficos sobrepostos em posição absoluta e é a maior fonte de bug desta família.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Barra de progresso linear | uma medida contra uma meta, pouco espaço | quando a meta tem faixa de qualidade | travar em 100% e esconder o estouro |
| 2 | Barra de progresso com faixas qualitativas | quando existe zona boa, aceitável e ruim declarada | faixas sem dono, inventadas na hora | pintar as faixas em semáforo de matiz |
| 3 | Barra com ritmo esperado e projeção | meta com prazo, leitura no meio do período | período fechado, sem futuro | mostrar só o realizado e deixar o leitor calcular o ritmo |
| 4 | Bullet chart horizontal | o caso geral da família: medida, meta e faixas | público que nunca viu o formato e sem anotação | meta como barra e não como traço perpendicular |
| 5 | Painel de bullets alinhados | várias métricas com metas diferentes na mesma tela | métricas em unidades que não convivem | escala compartilhada onde cada métrica tem a sua |
| 6 | Bullet vertical em coluna | quando o rótulo é curto e o espaço é alto | rótulo longo, que vira texto girado | girar o texto do rótulo |
| 7 | Bullet em célula de tabela | ranking com dezenas de linhas e a mesma meta relativa | quando cada linha tem meta em escala diferente | célula sem escala visível, virando enfeite |
| 8 | Gauge semicircular com ponteiro | pedido explícito de diretoria, uma medida só | qualquer caso em que a barra caiba | arco de 180 graus valendo 0 a 100 e o leitor lendo ângulo |
| 9 | Gauge de arco preenchido | progresso percentual num cartão pequeno | comparação entre vários gauges | arco de fundo incompleto, mudando a régua |
| 10 | Gauge com faixas e nota | avaliação qualitativa com rótulo de estado | medida contínua sem estado definido | nota grande e valor pequeno, escondendo o número |
| 11 | Progresso radial de anel único | um percentual contra 100% em cartão | valor que passa de 100% | anel que dá mais de uma volta sem avisar |
| 12 | Anéis concêntricos | 3 a 4 metas independentes da mesma pessoa ou equipe | comparar as metas entre si | raios diferentes com o mesmo percentual parecendo diferentes |
| 13 | Progresso radial empilhado | composição dentro do avanço (quanto veio de cada fonte) | mais de 4 partes | somar as partes e passar do arco sem tratar |
| 14 | Termômetro | meta de campanha, público não técnico, valor acumulado | métrica que pode cair | bulbo cheio virando parte da escala |
| 15 | Tracker de blocos | sequência de dias ou execuções com estado | mais de uns 90 blocos sem agregação | bloco sem tooltip e sem legenda de estado |
| 16 | Lista de metas por pessoa | cota por executivo, agenda por pré-vendas | equipe grande sem ordenação | ordenar por nome em vez de por atingimento |
| 17 | Régua de marcos | plano com 4 a 8 marcos datados | tarefas com duração, que pedem Gantt | marcos espaçados por ordem e não por data |
| 18 | Capacidade contra teto | demanda versus teto medido, com zona de estouro | teto que é premissa e não medição | apresentar teto de premissa como se fosse medido |
| 19 | Faixa de cenário contra meta | saída em faixa, pessimista a otimista | cenário único, sem incerteza | faixa sem dizer o que é o piso e o teto |
| 20 | Burn-up acumulado contra meta | acompanhamento de meta ao longo do período | um ponto só no tempo | linha de meta sem a linha de ritmo necessário |

---

## 1. Barra de progresso linear

**Descrição.** Um trilho, uma barra que cresce dentro dele, um traço de meta. É o formato mais barato da família e
o que mais aparece: a Data Viz Project registra a progress bar como "elemento de controle gráfico usado para
visualizar o avanço de uma operação longa", origem de interface, não de estatística. No painel comercial ela vira
a resposta curta de "quanto da meta já fechou".

**Anatomia.** Rótulo da métrica; trilho em `--surface-overlay` com raio pequeno; barra preenchida em `--chart-1`;
traço vertical de meta em `--text-primary`; número grande com o realizado; texto de apoio com o par
("R$ 4,2 mi de R$ 5,0 mi") e o que falta. Quando o realizado passa da meta, o trecho excedente muda de tom.

**Abordagem na stack.** `html-tailwind`. Não é caso de Recharts: dois `div` e um `span` posicionado resolvem, e o
resultado é mais leve e mais fácil de encaixar dentro de cartão e de célula.

```tsx
type Props = { value: number; target: number; max?: number };

export function ProgressBar({ value, target, max }: Props) {
  const top = max ?? Math.max(value, target) * 1.05;
  const pct = (n: number) => `${Math.min(100, (n / top) * 100)}%`;
  const over = value > target;
  return (
    <div className="relative h-3 w-full rounded-full bg-surface-overlay" role="img"
         aria-label={`realizado ${value}, meta ${target}`}>
      <div className="absolute inset-y-0 left-0 rounded-full bg-chart-1" style={{ width: pct(Math.min(value, target)) }} />
      {over && (
        <div className="absolute inset-y-0 rounded-r-full bg-positive/40"
             style={{ left: pct(target), width: pct(value - target) }} />
      )}
      <div className="absolute inset-y-[-3px] w-0.5 bg-text-primary" style={{ left: pct(target) }} aria-hidden />
    </div>
  );
}
```

**Ponto delicado.** O `max` é a decisão inteira. Com `max = target`, tudo acima da meta some e a barra fica
sempre cheia; com `max` fixo em 100 e meta de 120, o traço da meta sai do trilho. O padrão do kit é
`Math.max(value, target) * 1,05`, o que garante folga para o traço e faz a barra encolher de propósito quando
alguém bate a meta com muita sobra. Segundo detalhe: `rounded-full` no trilho e na barra faz a ponta arredondada
somar uns 6 px de comprimento visual, que em valores pequenos vira erro de leitura de vários por cento; abaixo de
uns 4% do trilho o kit troca por `rounded-sm`.

**Versões sugeridas.**
- **V1 básica:** receita reconhecida do trimestre contra a meta trimestral, barra única e o par de números.
- **V2 com destaque:** a mesma barra com o excedente hachurado e o rótulo "+8% acima da meta" na ponta, em
  `--positive` acompanhado de ícone `trending-up`.
- **V3 densa do Farol:** seis barras num cartão de pré-vendas, uma por fila de trabalho, todas com meta diária e o
  mesmo `max` calculado sobre o conjunto, para que o comprimento possa ser comparado entre filas.
- **V4 caso limite:** fila sem coleta no dia vira trilho tracejado em `--line-strong` com "indisponível"; fila com
  meta zero (não tem meta definida) some o traço e o texto diz "sem meta definida", nunca 0.

**Referências.**
- Catálogo: [Data Viz Project, Progress Bar](https://datavizproject.com/data-type/progress-bar/): observar que a
  ficha trata o formato como elemento de interface e não como gráfico, o que explica o vício de travar em 100%.
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar a regra de que a barra só vale quando a escala começa em zero; acima de zero, vira ponto ou X.
- Portal de design: [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit)
  (apareceu na busca do estudo de portais, não aberto aqui): linear, circular e em etapas no mesmo arquivo.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar como progresso de cota convive com saúde de pipeline e acurácia de forecast na mesma tela.

**Mora melhor em outra família?** Se a barra virar a métrica principal de um cartão com número grande e delta, é
cartão de KPI (01). Se forem muitas categorias ordenadas sem meta, é barra horizontal (02).

---

## 2. Barra de progresso com faixas qualitativas

**Descrição.** O trilho deixa de ser neutro e vira uma escala de estado: ruim, aceitável, bom. É o bullet graph
sem a medida comparativa, ou a `CategoryBar` do Tremor, que desenha segmentos de categoria com um marcador de
posição por cima. Serve quando o número só ganha sentido contra uma régua qualitativa acordada com o time, por
exemplo CPL: abaixo de R$ 90 é bom, entre R$ 90 e R$ 140 é aceitável, acima é ruim.

**Anatomia.** Trilho dividido em 2 a 5 segmentos contíguos com larguras proporcionais aos limiares; marcador do
valor atual, um triângulo ou um traço espesso; tiques dos limiares com número; rótulo do estado em texto.

**Abordagem na stack.** `html-tailwind` com `flex` e larguras percentuais, ou `svg-puro` quando o marcador
precisa de forma própria. Os segmentos saem de um array de limiares e a largura de cada um é a diferença entre
limiares dividida pela amplitude total.

**Ponto delicado.** A ordem das intensidades. Few manda a mais escura para o pior estado sobre fundo branco; no
tema escuro do Farol a lógica é a inversa literal, a sobreposição mais clara marca o pior, conforme M5 do
acabamento. Segundo ponto: os limiares precisam de dono. Faixa inventada pelo desenvolvedor vira número com cara
de regra, exatamente a armadilha que o projeto 28 registra como premissa lida como medição. Toda faixa carrega
etiqueta de procedência e a fonte no tooltip. Terceiro: a barra de faixa não é barra de progresso; ela não cresce,
o marcador é que anda. Misturar os dois (barra crescendo dentro de faixas) é o bullet do modelo 4, com outra
proporção de espessura.

**Versões sugeridas.**
- **V1 básica:** CPL do mês em três faixas com o marcador dentro da faixa aceitável.
- **V2 com anotação:** a faixa aceitável ganha rótulo com a origem ("faixa definida na revisão de 2026-06"), e o
  marcador leva a variação contra o mês anterior.
- **V3 densa do Farol:** quatro plataformas de mídia fictícias, uma linha cada, faixas iguais e marcadores
  comparáveis na vertical; a linha com marcador na faixa ruim recebe ícone de alerta.
- **V4 caso limite:** métrica de custo com polaridade invertida (quanto menor melhor) desenhada ao lado de uma
  métrica de receita; as faixas aparecem espelhadas e a legenda explica a inversão, como Few propõe para despesa.

**Referências.**
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar a tabela de intensidades por número de faixas e a inversão da sequência para despesa.
- Catálogo: [Tremor, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars): observar a `CategoryBar`, que
  aceita valores acima de 100 e serve de referência de API para faixas com marcador.
- Catálogo: [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart):
  observar o conselho de estender o eixo além do maior valor e o realce de faixa na aba de anotação.
- Portal de design: [Figma Community, Figma Chart Components](https://www.figma.com/community/file/1477881073711295499/figma-chart-components)
  (apareceu na busca do estudo de portais, não aberto aqui): 19 componentes de gráfico com indicadores de estado.

**Mora melhor em outra família?** Se as faixas forem categorias de composição e não estados de qualidade, é barra
empilhada 100% (02). Se o marcador virar comparação entre dois pontos, é comparação de pontos (17).

---

## 3. Barra com ritmo esperado e projeção

**Descrição.** A barra de progresso ganha a segunda régua da família: o tempo. Além do realizado e da meta,
aparece onde o realizado **deveria** estar hoje, dado o tempo decorrido, e opcionalmente a projeção de onde vai
terminar. Few descreve o recurso como opcional do bullet graph e explica o motivo: comparando uma medida atual a
uma meta futura "você vê facilmente quão longe está da meta, mas nem sempre é fácil dizer se está no caminho de
atingi-la", e sugere partir a medida em dois segmentos, o real de hoje e o projetado.

**Anatomia.** Trilho; segmento sólido do realizado; segmento tracejado ou mais claro da projeção, na mesma cor
(régua G11 do acabamento); traço cheio da meta; traço fino e pontilhado do ritmo esperado, com rótulo "esperado
hoje"; texto do prazo ("dia 18 de 30").

**Abordagem na stack.** `html-tailwind` para o caso de cartão, com o tracejado feito por
`repeating-linear-gradient` em `style` usando `var(--chart-1)`, ou `svg-puro` quando a projeção precisa de
`strokeDasharray` de verdade. A data de corte nunca é calculada no componente: o determinismo do contrato proíbe
`new Date()` sem argumento, então `elapsedRatio` chega pronto no dado.

**Ponto delicado.** O ritmo esperado quase nunca é linear. Fechamento comercial concentra no fim do mês, agenda
de pré-vendas cai em semana de feriado. Marcador de ritmo linear num negócio sazonal acusa atraso que não existe.
O kit aceita dois modos: `pace: 'linear'` e `pace: 'curve'` com a curva histórica no dado, e o rótulo diz qual foi
usado. Segundo ponto: projeção é premissa, e precisa aparecer como tal, com a etiqueta de procedência
`--prov-premissa`, nunca com a mesma cor cheia do realizado.

**Versões sugeridas.**
- **V1 básica:** meta mensal de agendas, realizado sólido, traço de ritmo esperado no dia 18.
- **V2 com destaque:** a lacuna entre o realizado e o ritmo esperado ganha hachura e o rótulo "12 atrás do ritmo".
- **V3 densa do Farol:** receita reconhecida do trimestre com três segmentos, realizado até o dia de corte,
  contratado a reconhecer e projeção do restante, cada um com textura própria e a etiqueta de procedência.
- **V4 caso limite:** projeção que ultrapassa a meta e sai do trilho: o domínio se estende, o excedente projetado
  fica tracejado em `--positive`, e o texto avisa que a projeção é premissa com base declarada.

**Referências.**
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar a seção "Optional Features" com a medida partida em real e projetado.
- Catálogo: [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart):
  observar a dupla barra externa e interna (planejado contra realizado), que é o caso mais simples deste modelo.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar a separação entre realizado, meta e acurácia de forecast na mesma peça.

**Mora melhor em outra família?** A projeção com faixa de incerteza ao longo do tempo é linha ou área (04, 05). O
acumulado dia a dia contra a meta é o modelo 20 desta mesma família.

---

## 4. Bullet chart horizontal

**Descrição.** O modelo central da família e a recomendação oficial do Farol no lugar do gauge. Cinco componentes,
na lista literal de Few: rótulo de texto, escala quantitativa num eixo linear, medida principal, uma ou duas
medidas comparativas, e de duas a cinco faixas declarando o estado qualitativo. O argumento dele contra o
alternativo é direto: medidores circulares "gastam muito espaço para dizer relativamente pouco, e falham
espetacularmente quando a intenção é comparar".

**Anatomia.** Rótulo à esquerda; faixas qualitativas como retângulos de fundo contíguos que formam toda a área do
gráfico; barra principal centrada, com cerca de um terço da espessura do contêiner, ponta alinhada ao valor;
traço curto perpendicular na meta, menos dominante que a barra e desenhado atrás dela quando há cruzamento; eixo
com tiques discretos embaixo.

**Abordagem na stack.** `recharts-custom`. `BarChart` com `layout="vertical"`, faixas como `ReferenceArea` (que
pinta toda a altura da área de plotagem), meta como `ReferenceLine` vertical e a medida como `Bar` com `barSize`
propositalmente menor que a banda de categoria.

```tsx
<BarChart layout="vertical" data={[row]} barCategoryGap={0} margin={{ top: 4, right: 8, bottom: 16, left: 8 }}>
  <XAxis type="number" domain={[0, top]} tickLine={false} axisLine={false} />
  <YAxis type="category" dataKey="label" hide />
  {bands.map((b) => (
    <ReferenceArea key={b.from} x1={b.from} x2={b.to} ifOverflow="extendDomain"
      fill="var(--surface-overlay)" fillOpacity={b.opacity} stroke="none" />
  ))}
  <Bar dataKey="value" barSize={12} fill="var(--chart-1)" isAnimationActive={false} radius={[0, 2, 2, 0]} />
  <ReferenceLine x={row.target} ifOverflow="extendDomain"
    stroke="var(--text-primary)" strokeWidth={2} />
</BarChart>
```

**Ponto delicado.** Três armadilhas empilhadas. Primeira, a ordem no JSX é a ordem de pintura: `ReferenceArea`
antes da `Bar`, `ReferenceLine` depois, senão a meta some atrás da barra e a regra de Few (comparativa atrás da
principal) se inverte sem aviso. Segunda, `ifOverflow` em `ReferenceLine` e `ReferenceArea` tem padrão
`"discard"`, e é exatamente o caso em que a meta está acima do maior valor que interessa: sem
`ifOverflow="extendDomain"` a meta desaparece justamente quando está longe, que é a armadilha 19 do acabamento.
Terceira, a proporção. `barSize` fixo com altura de contêiner responsiva quebra a regra do terço; o kit calcula
`barSize = Math.round(height * 0.34)` a partir da altura conhecida do cartão, não deixa o Recharts decidir.
Quarta, menor e mais chata: a SWD registra que "a exibição densa pode ser difícil de ler", e o público que nunca
viu bullet chart precisa de uma anotação apontando cada parte na primeira vez que ele aparece no painel.

**Versões sugeridas.**
- **V1 básica:** receita reconhecida do trimestre, meta como traço, três faixas de estado.
- **V2 com anotação:** a mesma peça com chamadas apontando "realizado", "meta" e "faixa aceitável", desenho de
  primeira aparição no painel.
- **V3 densa do Farol:** quatro métricas comerciais empilhadas, uma por linha (receita, oportunidades ganhas, taxa
  de conversão, ticket médio), cada uma com escala própria e faixas próprias, rótulos alinhados à esquerda.
- **V4 caso limite:** métrica que pode ficar negativa (variação de carteira). Few trata o caso com um desenho
  específico para positivo e negativo: a escala cruza o zero, o zero recebe `--line-strong` sólido, a barra cresce
  para a esquerda quando negativa e as faixas seguem a polaridade.

**Referências.**
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar os cinco componentes, o terço de espessura, as intensidades por número de faixas e o desenho para
  valores negativos.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf):
  observar a comparação lado a lado de três gauges contra quatro pessoas em bullets no mesmo espaço.
- Praticante: [Storytelling with Data, bullet graphs galore](https://www.storytellingwithdata.com/blog/2021/12/9/bullet-graphs-galore):
  observar as versões simplificadas sem faixa de fundo, que muita gente preferiu por legibilidade.
- Catálogo: [Data Visualisation Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html):
  observar a nomenclatura das três partes e o teto de cinco faixas.
- Catálogo: [Data Viz Project, Bullet Graph](https://datavizproject.com/data-type/bullet-graph/):
  observar a ficha de funções (comparação e intervalo) e a família de origem, a barra.
- Portal de design: nenhum shot específico de bullet chart apareceu na varredura de portais deste estudo; a busca
  chegou só à página de tag [dribbble.com/tags/bullet_chart](https://dribbble.com/tags/bullet_chart) (não aberta).

**Mora melhor em outra família?** Sem faixas e sem meta, é barra horizontal comum (02). Com muitas linhas e
números ao lado, vira tabela com barra em célula (14).

---

## 5. Painel de bullets alinhados

**Descrição.** Vários bullets empilhados, rótulos alinhados à esquerda, um por métrica ou por pessoa. É o
argumento de Few transformado em layout: no lugar de três gauges, quatro pessoas avaliadas em três dimensões
cabem no mesmo espaço "de forma que torna a comparação muito mais fácil e rápida". A eficácia, ele escreve,
"se deve em grande parte ao desenho linear".

**Anatomia.** Coluna de rótulos com largura fixa; coluna de gráficos com a mesma margem esquerda em todas as
linhas, para que as pontas das barras se comparem na vertical; um eixo comum no rodapé quando a escala é
compartilhada, ou um eixo por linha quando cada métrica tem a sua; separadores discretos.

**Abordagem na stack.** `recharts-custom` quando a escala é compartilhada: um único `BarChart` com
`layout="vertical"` e uma categoria por linha resolve tudo, com as faixas como `ReferenceArea` que atravessam
todas as linhas. Quando cada métrica tem escala própria, vira repetição do componente do modelo 4 dentro de um
`grid` do Tailwind, e o alinhamento passa a ser responsabilidade do layout, não do gráfico.

**Ponto delicado.** Decidir entre escala compartilhada e escala por linha é a decisão que faz ou quebra o painel.
Compartilhada permite comparar comprimento entre linhas, mas só vale quando as métricas têm a mesma unidade;
misturar reais e percentual numa escala só é erro grosseiro. Escala por linha permite qualquer métrica, mas então
o comprimento **não** se compara entre linhas, e o painel precisa dizer isso em texto, porque o olho compara de
qualquer jeito. O truque que o kit adota: com escala por linha, normalizar tudo para "percentual da meta", o que
devolve a comparabilidade sem mentir; a unidade original fica no rótulo e no tooltip.

**Versões sugeridas.**
- **V1 básica:** três métricas de pré-vendas com escala própria, cada uma com sua meta.
- **V2 com destaque:** as linhas ordenadas por atingimento, e a única abaixo da faixa aceitável em `--negative`
  com ícone `alert-triangle` ao lado do rótulo.
- **V3 densa do Farol:** oito executivos fictícios com cota trimestral, todos normalizados em percentual da meta,
  faixa aceitável comum de 80% a 100%, e o valor absoluto ao final de cada linha.
- **V4 caso limite:** dois executivos entraram no meio do trimestre e têm meta proporcional; as linhas trazem selo
  "meta proporcional, 41 dias" e ficam agrupadas no fim, fora da ordenação principal.

**Referências.**
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf):
  observar a figura com quatro avaliados em três dimensões no espaço de três gauges.
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar as duas disposições de múltiplos bullets, horizontal e vertical, na página 2.
- Catálogo: [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart):
  observar as opções de ordenação e agrupamento de linhas, que são a parte difícil deste modelo.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar a hierarquia entre o bloco de quota por pessoa e os cartões de topo.

**Mora melhor em outra família?** Com muitas linhas e várias colunas numéricas, é tabela visual (14).

---

## 6. Bullet vertical em coluna

**Descrição.** O mesmo bullet girado 90 graus: escala na vertical, barra crescendo de baixo para cima, meta como
traço horizontal. Few prevê a orientação e define os padrões próprios dela: rótulo acima do gráfico, escala à
esquerda.

**Anatomia.** Rótulo no topo; coluna estreita com as faixas empilhadas; barra central subindo; traço horizontal da
meta; escala à esquerda, ou dispensada quando o número está escrito.

**Abordagem na stack.** `recharts-custom`: `BarChart` na orientação padrão, `ReferenceArea` com `y1` e `y2` para
as faixas e `ReferenceLine` com `y` para a meta. Em coluna muito estreita (menos de uns 40 px), sai mais limpo em
`svg-puro`, porque as margens do Recharts comem espaço demais.

**Ponto delicado.** Rótulo longo. Na horizontal, "Taxa de conversão de agenda para oportunidade" cabe à esquerda;
na vertical, não cabe em cima de uma coluna de 40 px e a tentação é girar o texto. Texto girado é o erro clássico
aqui: quebra a leitura e não passa em revisão de acessibilidade. A saída do kit é abreviar no rótulo visível e
carregar o nome completo no `aria-label` e no tooltip. Segundo ponto: com 6 ou mais colunas lado a lado, a versão
vertical vira um quase gráfico de colunas, e a régua da família diz para preferir a horizontal, que é onde as
pontas se alinham para comparação.

**Versões sugeridas.**
- **V1 básica:** capacidade usada de três filas, três colunas com teto como traço.
- **V2 com destaque:** a coluna que passou do teto em `--negative` com hachura acima do traço.
- **V3 densa do Farol:** consumo de orçamento de quatro plataformas de mídia no mês, colunas com faixa de conforto
  entre 85% e 105% do planejado, e o valor em moeda compacta no topo de cada coluna.
- **V4 caso limite:** plataforma sem investimento no mês, coluna vazia com trilho tracejado e "sem veiculação",
  jamais 0% pintado como se fosse desempenho ruim.

**Referências.**
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar os padrões próprios da orientação vertical (rótulo acima, escala à esquerda).
- Catálogo: [Data Visualisation Catalogue, Bullet Graph](https://datavizcatalogue.com/methods/bullet_graph.html):
  observar que a medida comparativa é sempre perpendicular à orientação do gráfico.
- Portal de design: [Behance, Gauge Chart](https://www.behance.net/gallery/233895453/Gauge-Chart): observar o
  argumento declarado na peça, comparar produto a produto sem tabela longa; o bullet vertical entrega isso melhor
  que os arcos que a peça usa.

**Mora melhor em outra família?** Com muitas colunas e sem meta, é coluna vertical (03).

---

## 7. Bullet em célula de tabela

**Descrição.** O bullet reduzido a uns 60 por 12 pixels, morando dentro de uma célula, ao lado do número. Resolve
o problema que toda tabela de desempenho tem: a coluna "% da meta" é lida como texto, linha a linha, e ninguém
enxerga o padrão. Com a micro barra, o olho varre a coluna inteira de uma vez.

**Anatomia.** Trilho de 1 px de contorno ou fundo sutil; barra fina; traço de meta; nada de eixo, nada de rótulo;
o número fica na célula vizinha, alinhado à direita com algarismo tabular.

**Abordagem na stack.** `svg-puro`. Um `<svg viewBox="0 0 100 12">` com dois `rect` e uma `line`, sem Recharts:
em tabela de 40 linhas, 40 instâncias de `ResponsiveContainer` derrubam a página. A escala é uma divisão simples,
não precisa de biblioteca.

```tsx
export function BulletCell({ value, target, max }: { value: number; target: number; max: number }) {
  const w = (n: number) => Math.max(0, Math.min(100, (n / max) * 100));
  return (
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="h-3 w-16" aria-hidden focusable="false">
      <rect x={0} y={3} width={100} height={6} fill="var(--surface-overlay)" />
      <rect x={0} y={3} width={w(value)} height={6} fill="var(--chart-1)" />
      <line x1={w(target)} x2={w(target)} y1={1} y2={11} stroke="var(--text-primary)" strokeWidth={1.5}
            vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
```

**Ponto delicado.** `preserveAspectRatio="none"` estica o desenho e, sem `vectorEffect="non-scaling-stroke"`, o
traço da meta engorda junto e vira um bloco. É o bug número um deste modelo. O segundo: a escala. Se cada linha
usar o próprio máximo, as barras não se comparam e a coluna vira enfeite; o kit usa um `max` único da coluna, ou
normaliza para percentual da meta. O terceiro: a célula é `aria-hidden` e o valor acessível vive na célula de
número ao lado, senão o leitor de tela recita 40 gráficos sem conteúdo.

**Versões sugeridas.**
- **V1 básica:** coluna "atingimento" numa tabela de 12 executivos, escala comum de 0 a 120% da meta.
- **V2 com destaque:** as três linhas abaixo de 70% com a barra em `--negative` e ícone no início da linha.
- **V3 densa do Farol:** tabela de 40 origens de lead com volume, CPL, CPL qualificado e a micro barra de
  atingimento da meta de volume; ordenação clicável e a escala recalculada só quando o filtro muda.
- **V4 caso limite:** origem sem meta definida: célula com traço tracejado e o texto "sem meta"; origem com volume
  zero no período: barra ausente, não barra de comprimento zero colada na borda.

**Referências.**
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar que o formato foi desenhado para caber em pouco espaço, o que é exatamente o caso da célula.
- Catálogo: [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart):
  observar a barra externa e a interna dentro da mesma linha de tabela, o formato mais próximo deste modelo.
- Catálogo: [Tremor, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars): observar a `BarList`, que é a
  versão de lista com barra embutida na linha.
- Portal de design: [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit)
  (apareceu na busca do estudo de portais, não aberto aqui): variações de barra fina servem de referência de altura.

**Mora melhor em outra família?** O modelo é meio caminho com 14 (tabelas visuais) e com 24 (microvisuais). Fica
aqui porque o traço de meta é o que define o desenho; sem meta, a célula vira barra de tabela e mora na 14.

---

## 8. Gauge semicircular com ponteiro

**Descrição.** O velocímetro: arco de 180 graus dividido em faixas, ponteiro apontando o valor, número no centro.
É o formato mais pedido e o mais criticado da família. A ficha do Farol é honesta: existe porque diretoria pede e
porque em apresentação de uma métrica só ele carrega presença; nunca porque lê melhor. Few: medidores circulares
"gastam muito espaço para dizer relativamente pouco, e falham espetacularmente quando a intenção é comparar". O
acabamento do Farol registra o formato como armadilha número 2, com a alternativa nomeada, o bullet do modelo 4.

**Anatomia.** Arco de 180 graus com raio interno e externo; 2 a 5 faixas por intensidade; tiques com os limiares;
ponteiro partindo do centro; disco de base do ponteiro; número grande abaixo ou dentro do arco; rótulos de mínimo
e máximo nas pontas.

**Abordagem na stack.** `recharts-custom`. O exemplo oficial `PieChartWithNeedle` do Recharts é a receita: um
`PieChart` com `startAngle={180}` e `endAngle={0}`, uma `Cell` por faixa, e o ponteiro entrando como
`activeShape` de uma segunda `Pie` sobre a mesma base. O comprimento do ponteiro no exemplo é
`innerRadius + (outerRadius - innerRadius) / 2` e a rotação sai de uma transformação `rotate` com
`transformOrigin` no centro da base. Alternativa igualmente válida e mais controlável: `svg-puro` com o `ringArc`
e o `valueToAngle` das decisões transversais, desenhando arco, tiques e ponteiro à mão.

**Ponto delicado.** A escala arbitrária é o defeito estrutural. Num arco de 180 graus com domínio de 0 a 100, o
valor 83 ocupa 149,4 graus e ninguém lê isso; o número escrito é que informa, o arco é decoração. Por isso o kit
exige três coisas em todo gauge: mínimo e máximo escritos nas pontas, o valor em texto grande, e no máximo um
gauge por tela. Detalhe técnico que morde: no exemplo oficial o ângulo do ponteiro vem do `midAngle` do setor, ou
seja, aponta para o meio de uma fatia, não para um valor contínuo; para gauge de verdade o ângulo tem que sair do
valor com `valueToAngle`, senão o ponteiro pula de faixa em faixa. Terceiro: ponteiro de traço fino some no tema
escuro sobre faixa clara; o kit desenha o ponteiro como polígono preenchido em `--text-primary` com contorno de
1 px em `--surface-raised`.

**Versões sugeridas.**
- **V1 básica:** atingimento da meta trimestral em três faixas, ponteiro e número grande.
- **V2 com anotação:** traço fino da meta sobre o arco, separado das faixas, com o rótulo "meta 100%", para o
  leitor não confundir fronteira de faixa com meta.
- **V3 densa do Farol:** gauge de capacidade da pré-vendas, 0 a 320 entradas por mês, faixa confortável até 240,
  atenção de 240 a 274 e estouro acima do teto medido de 274, com o valor do mês e a etiqueta MEDIDO no teto.
- **V4 caso limite:** valor acima do máximo do arco. O ponteiro trava no fim, ganha seta de transbordo e o texto
  escreve o valor real; nunca dar mais de uma volta nem esticar o domínio em silêncio.

**Referências.**
- Catálogo: [Recharts, Pie Chart With Needle](https://recharts.github.io/en-US/examples/PieChartWithNeedle/):
  observar o cálculo do comprimento do ponteiro, a rotação por `transformOrigin` e a limitação do `midAngle`.
- Catálogo: [AG Charts, Radial Gauge](https://www.ag-grid.com/charts/react/radial-gauge/): observar a API completa
  do formato (segmentação por passo, contagem ou valores; alvos em triângulo, círculo ou linha; e a regra de que o
  rótulo some quando o ponteiro está ligado).
- Catálogo: [Apache ECharts, exemplo gauge-grade](https://echarts.apache.org/examples/en/editor.html?c=gauge-grade):
  observar a família de variantes que a biblioteca mantém (gauge-simple, gauge-progress, gauge-ring, gauge-grade,
  gauge-multi-title, gauge-barometer, gauge-temperature, gauge-clock).
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf):
  observar a comparação de três gauges contra o painel de bullets equivalente, no mesmo espaço.
- Portal de design: [Behance, Gauge Chart](https://www.behance.net/gallery/233895453/Gauge-Chart): observar arcos
  para pedidos, receita e lucro do mês, e por que a peça precisa do número escrito dentro de cada arco.

**Mora melhor em outra família?** Quase sempre: o mesmo dado em bullet (modelo 4) lê melhor. O arco só se defende
quando é peça única de destaque.

---

## 9. Gauge de arco preenchido

**Descrição.** O gauge sem ponteiro: o próprio arco cresce sobre um arco de fundo completo. É o solid gauge das
bibliotecas e o gauge-progress do ECharts. Perde a pretensão de precisão do velocímetro e ganha o que interessa
num painel: comprimento de arco é lido como comprimento, não como ângulo de ponteiro.

**Anatomia.** Arco de fundo de 180 ou 240 graus em `--surface-overlay`; arco preenchido em `--chart-1` com ponta
arredondada; número grande centrado; mínimo e máximo nas pontas; traço de meta sobre o arco quando a meta não é o
máximo do domínio.

**Abordagem na stack.** `recharts-nativo`. É o caso limpo do `RadialBarChart`:

```tsx
<RadialBarChart data={[{ name: 'meta', value }]} startAngle={210} endAngle={-30}
  innerRadius="72%" outerRadius="100%" barSize={18}>
  <PolarAngleAxis type="number" domain={[0, max]} angleAxisId={0} tick={false} />
  <RadialBar dataKey="value" background={{ fill: 'var(--surface-overlay)' }}
    cornerRadius={9} fill="var(--chart-1)" isAnimationActive={false} />
</RadialBarChart>
```

**Ponto delicado.** O `PolarAngleAxis type="number"` com `domain` explícito é obrigatório e é a parte que quase
todo exemplo da internet esquece. Sem ele, o `RadialBarChart` normaliza a maior barra do conjunto para o arco
inteiro, e um valor de 40 sozinho aparece como arco cheio: o gráfico fica sempre em 100%, em silêncio. Segundo
ponto: `startAngle` e `endAngle` são graus no sentido anti horário a partir do eixo x positivo, o que confunde
quem espera sentido de relógio; meia lua superior sai com `startAngle={180} endAngle={0}` e o arco de 240 graus
com `210` e `-30`. Terceiro: `cornerRadius` maior que metade do `barSize` deforma a ponta e, com valor perto de
zero, a ponta arredondada aparece mesmo sem dado, mentindo alguns por cento; abaixo de um mínimo o kit zera o
`cornerRadius`.

**Versões sugeridas.**
- **V1 básica:** percentual da meta mensal de agendas num cartão pequeno, arco de 240 graus.
- **V2 com destaque:** traço de meta sobre o arco e o excedente em `--positive`, quando o realizado passa de 100%.
- **V3 densa do Farol:** três cartões lado a lado, um por fila da pré-vendas, mesmo arco, mesmo domínio, número
  grande e o par de contagens abaixo de cada um.
- **V4 caso limite:** valor zero no período: arco de fundo sozinho com o número 0 e a frase de contexto; sem
  coleta, arco tracejado com "indisponível", nunca arco vazio com 0%.

**Referências.**
- Catálogo: [Recharts, RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/): observar
  `startAngle` com padrão 0 e `endAngle` com padrão 360, mais `innerRadius`, `outerRadius` e `barSize`.
- Catálogo: [shadcn/ui, Radial Charts](https://ui.shadcn.com/charts/radial): observar as variantes prontas sobre
  Recharts, inclusive a de forma customizada com `endAngle` parcial.
- Catálogo: [shadcn, A radial chart with a custom shape](https://www.shadcn.io/patterns/chart-radial-shape):
  observar o uso de `endAngle` para virar o anel em arco de gauge com rótulo central.
- Catálogo: [AG Charts, Radial Gauge](https://www.ag-grid.com/charts/react/radial-gauge/): observar a distinção
  declarada entre barra e ponteiro, e a recomendação de barra para faixa contínua com limiar.
- Portal de design: [Behance, Theme and UI Design for Charts, Gauges and Maps](https://www.behance.net/gallery/65301405/Theme-and-UI-Design-for-Charts-Gauges-and-Maps):
  observar o tratamento de tema (grade, tipografia, paleta) e descartar a parte de ponteiro.

**Mora melhor em outra família?** Sendo composição de um total, é rosca (07). Sendo uma métrica de cartão com
delta, é cartão de KPI (01).

---

## 10. Gauge com faixas e nota

**Descrição.** Variante em que o resultado não é o número, é o **estado**: a peça entrega uma palavra (ruim,
atenção, saudável) e o número entra de apoio. O ECharts mantém a variante com o nome gauge-grade. Stephanie
Evergreen defende o formato exatamente para dado qualitativo, em que a escala é uma régua de julgamento e não uma
medida contínua.

**Anatomia.** Arco com 3 a 5 setores nomeados; marcador do valor (ponteiro curto ou ponto sobre o arco); rótulo do
estado em texto grande no centro; valor numérico pequeno abaixo; legenda com os limiares e a origem deles.

**Abordagem na stack.** `recharts-custom` com `PieChart` semicircular e uma `Cell` por faixa, mais rótulo central
em HTML posicionado por cima; ou `svg-puro` quando os setores precisam de rótulo curvo. O texto central não sai
do Recharts: um `div` absoluto centrado por Tailwind lê melhor e não briga com o `viewBox`.

**Ponto delicado.** O estado precisa de dono e de data. "Saudável" é julgamento, e julgamento sem fonte vira
regra fantasma. A régua do projeto 28 cabe inteira aqui: toda faixa carrega etiqueta (MEDIDO, DERIVADO, PREMISSA)
e a legenda diz de onde veio o limiar. Segundo ponto: quando o valor cai bem na fronteira entre duas faixas, a
peça precisa dizer isso, senão um centavo muda a palavra e ninguém entende; o kit escreve a distância até a
fronteira ("2 pontos da faixa de atenção"). Terceiro: nota grande com valor minúsculo esconde o número, que é o
erro comum listado na tabela.

**Versões sugeridas.**
- **V1 básica:** saúde do pipeline em três estados com o valor do índice abaixo.
- **V2 com anotação:** a fronteira mais próxima destacada e a frase da distância até ela.
- **V3 densa do Farol:** índice de cobertura de dado do funil (percentual de deals com campos mínimos), quatro
  faixas, valor de 44,9% caindo na faixa de atenção, com a origem do limiar na legenda.
- **V4 caso limite:** índice indisponível no período: arco em tom neutro inteiro, palavra "indisponível" no centro
  e a nota dizendo qual coleta faltou; nunca a faixa mais baixa por omissão de dado.

**Referências.**
- Catálogo: [Apache ECharts, exemplo gauge-grade](https://echarts.apache.org/examples/en/editor.html?c=gauge-grade):
  observar o arco por setores nomeados e o rótulo de estado no centro.
- Praticante: [Stephanie Evergreen, Qualitative Data Visualization: The Gauge Diagram](https://stephanieevergreen.com/gauge-diagram/):
  observar o argumento de que o gauge serve a dado qualitativo, que é a exceção que esta variante explora.
- Catálogo: [AG Charts, Radial Gauge](https://www.ag-grid.com/charts/react/radial-gauge/): observar `segmentation`
  por valores customizados, que é como se declara uma régua de estado com limiares irregulares.
- Portal de design: [Figma Community, plugin Gauge Charts](https://www.figma.com/community/plugin/1584969787567772564/gauge-charts-quick-customizable-gauge-dial-speedometer-chart-widget-for-figma-figjam)
  (apareceu na busca do estudo de portais, não aberto aqui): variações de mostrador e indicador de KPI.

**Mora melhor em outra família?** Se o estado for só um rótulo colorido sem escala, é cartão de KPI com selo (01).

---

## 11. Progresso radial de anel único

**Descrição.** Anel fechado de 360 graus com o trecho cumprido preenchido e o número no centro. É o formato de
cartão mais copiado da internet e o mais inofensivo dos radiais, porque o leitor não precisa ler ângulo: reconhece
"quase fechado" e "mal começou". O shadcn/ui mantém a variante com rótulo central, em que o `Label` usa as
coordenadas do `viewBox` para posicionar o texto.

**Anatomia.** Anel de fundo completo; anel preenchido; número grande no centro com `font-display`; legenda curta
abaixo do número; opcionalmente um tique na posição da meta quando a meta não é 100%.

**Abordagem na stack.** `recharts-nativo`: `RadialBarChart` com `startAngle={90}` e `endAngle={-270}` (volta
completa começando no topo), `PolarAngleAxis` numérico com `domain={[0, 100]}` e `tick={false}`, `RadialBar` com
`background` e `cornerRadius`. O texto central entra por `PolarRadiusAxis` com `Label` e conteúdo customizado, ou
por um `div` absoluto, que é mais simples de estilizar e o que o kit prefere.

**Ponto delicado.** Passar de 100%. O anel fechado não tem para onde crescer: ou dá uma segunda volta por cima de
si mesmo, o que é ilegível, ou trava. O kit trava o anel em 100%, muda a cor para `--positive`, e escreve o
excedente em texto ("112% da meta"). Segundo ponto: o começo no topo exige `startAngle={90}`, e trocar para
`endAngle={270}` inverte o sentido de giro sem aviso, o que muda a leitura de quem compara dois cartões. Terceiro:
anel fino demais (menos de uns 8 px) some no tema escuro; mínimo prático de 10 px com o fundo em
`--surface-overlay` visível.

**Versões sugeridas.**
- **V1 básica:** 74% da meta do mês num cartão de 180 px.
- **V2 com destaque:** tique na posição da meta parcial (por exemplo, 80% do mês) e o número com a diferença.
- **V3 densa do Farol:** quatro cartões de marketing em grade, um por plataforma, mostrando consumo de orçamento,
  todos com o mesmo domínio e o valor absoluto abaixo do percentual.
- **V4 caso limite:** plataforma com 112% do orçamento consumido: anel travado em volta cheia, cor `--negative`,
  ícone de alerta e o texto "12% acima do planejado" fora do anel.

**Referências.**
- Catálogo: [shadcn, A radial chart with text](https://www.shadcn.io/examples/a-radial-chart-with-text): observar o
  `Label` posicionado por coordenadas do `viewBox`, que é a receita de rótulo central em Recharts.
- Catálogo: [Recharts, RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/): observar os padrões
  de `startAngle` e `endAngle` e o efeito de `innerRadius` em percentual.
- Catálogo: [Tremor, ProgressCircle](https://www.tremor.so/docs/visualizations/progress-circle): observar as
  variantes de estado (neutro, atenção, erro, sucesso) e a decisão de expor estado como propriedade.
- Portal de design: [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit)
  (apareceu na busca do estudo de portais, não aberto aqui): a versão circular do kit serve de referência de
  espessura de anel.

**Mora melhor em outra família?** Sendo composição de partes de um total, é rosca (07).

---

## 12. Anéis concêntricos

**Descrição.** Três ou quatro anéis encaixados, um por meta independente. O Highcharts chama de activity gauge e
descreve como "várias séries em arco ao redor do mesmo centro, parecido com o gráfico de atividade do relógio da
Apple". A diretriz de interface da Apple resume a lógica do formato: o anel está fechado ou não está, e é isso que
prende a atenção. A crítica que a pesquisa registra também importa: anel fechado não diz nada sobre o histórico se
a meta mudou no meio do caminho.

**Anatomia.** Anéis concêntricos de espessura igual, do maior ao menor; cada anel com seu fundo; legenda externa
ligando cor a meta; número por meta em lista ao lado, não dentro do anel.

**Abordagem na stack.** `recharts-nativo`: um `RadialBarChart` com uma linha de dado e uma `RadialBar` por meta,
ou uma `RadialBar` com várias entradas de dado; `PolarAngleAxis` numérico com `domain={[0, 100]}` mantém a escala
honesta em todos os anéis.

**Ponto delicado.** O defeito de percepção é conhecido e não tem conserto dentro do formato: com o mesmo
percentual, o anel externo desenha um arco fisicamente mais longo que o interno, então 60% no anel de fora parece
mais que 60% no de dentro. É a razão pela qual o kit obriga o número escrito por meta ao lado, e proíbe o uso do
formato para **comparar** as metas entre si. Segundo ponto: legenda. Cor de anel sem legenda é adivinhação, e
legenda dentro do círculo não cabe. Terceiro: com quatro anéis o interno fica minúsculo; o limite prático é três,
quatro só com raio externo grande.

**Versões sugeridas.**
- **V1 básica:** três metas de uma pré-vendas na semana: entradas tratadas, agendas marcadas, SLA cumprido.
- **V2 com destaque:** o anel que não fechou em `--warning`, com ícone e o que falta escrito na lista ao lado.
- **V3 densa do Farol:** grade de seis pessoas fictícias da pré-vendas, cada uma com seu trio de anéis, todos na
  mesma escala, com os três números embaixo; a leitura é "quem fechou os três".
- **V4 caso limite:** pessoa que entrou na semana e tem meta proporcional em duas das três dimensões e nenhuma
  meta na terceira: o anel sem meta fica só com o fundo tracejado e a lista escreve "sem meta".

**Referências.**
- Catálogo: [Highcharts, Activity gauge demo](https://www.highcharts.com/demo/android/gauge-activity) (não abriu,
  retornou 404 na tentativa; apareceu literalmente na busca): arcos múltiplos ao redor do mesmo centro no estilo do
  relógio da Apple.
- Praticante: [Apple, Human Interface Guidelines, Activity rings](https://developers.apple.com/design/human-interface-guidelines/components/status/activity-rings/)
  (apareceu literalmente na busca, não aberto aqui): a lógica do "fechou ou não fechou" e as três dimensões fixas.
- Catálogo: [shadcn, A radial chart](https://www.shadcn.io/examples/a-radial-chart): observar os anéis concêntricos
  por categoria, cada um na sua faixa circular, sobre Recharts.
- Portal de design: [Behance, Gauge Chart](https://www.behance.net/gallery/233895453/Gauge-Chart): observar a
  disposição de vários arcos numa peça só e o custo de espaço que isso cobra.

**Mora melhor em outra família?** Três a cinco dimensões comparáveis de uma mesma entidade: radar (18). Várias
entidades em três dimensões: painel de bullets (modelo 5) ou tabela visual (14).

---

## 13. Progresso radial empilhado

**Descrição.** Um anel só, mas o trecho cumprido é partido em segmentos por fonte. Responde duas perguntas de uma
vez: quanto da meta já foi e de onde veio. O shadcn/ui mantém a variante com `stackId`, em que dois arcos dividem a
mesma faixa angular e o rótulo central mostra o total.

**Anatomia.** Anel de fundo; segmentos contíguos em cores da paleta categórica; total no centro; legenda com
contribuição de cada parte; traço de meta quando a meta não é o fim do anel.

**Abordagem na stack.** `recharts-nativo`: `RadialBarChart` com duas ou três `RadialBar` compartilhando
`stackId="a"`, `PolarAngleAxis` numérico com o domínio no valor da meta, e o `Label` central com a soma. É o
mesmo mecanismo do empilhamento cartesiano, transposto para o ângulo.

**Ponto delicado.** A soma pode passar da meta, e aí o empilhamento transborda o arco: o Recharts continua
desenhando e o último segmento vira volta extra, sobrepondo o primeiro. O kit trata antes de desenhar, cortando o
excedente num segmento próprio marcado como transbordo, com o valor real no texto. Segundo ponto: mais de quatro
partes num anel vira confete; acima disso, barra empilhada (02) resolve melhor. Terceiro: a ordem dos segmentos
precisa ser estável entre renderizações e entre cartões, senão a mesma origem muda de posição e o painel mente.

**Versões sugeridas.**
- **V1 básica:** meta mensal de oportunidades com dois segmentos, inbound e outbound.
- **V2 com destaque:** o segmento de indicação em cor cheia e os demais em tom mais apagado, porque é a origem que
  a diretoria quer acompanhar.
- **V3 densa do Farol:** meta trimestral de receita com quatro segmentos (cliente atual, indicação, inbound, mídia
  paga), total no centro, legenda com valor e percentual de cada parte.
- **V4 caso limite:** soma em 118% da meta: o anel enche, o excedente vira segmento hachurado marcado como
  transbordo e o texto declara "18% acima da meta"; parte com contribuição abaixo de 1% fica só na legenda.

**Referências.**
- Catálogo: [shadcn, A radial chart with stacked sections](https://www.shadcn.io/examples/a-radial-chart-with-stacked-sections):
  observar o `stackId` compartilhado e o rótulo central com a soma das partes.
- Catálogo: [Recharts, RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/): observar `barSize` e
  `innerRadius`, que definem se o empilhamento cabe numa faixa só.
- Catálogo: [shadcn, A radial chart with a label](https://www.shadcn.io/examples/a-radial-chart-with-a-label):
  observar `LabelList` com posição `insideStart`, útil quando os segmentos precisam de nome no próprio arco.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar como a peça reparte a meta por origem sem recorrer a anel.

**Mora melhor em outra família?** Composição pura, sem meta: rosca (07). Mais de quatro partes: barra empilhada
100% (02).

---

## 14. Termômetro

**Descrição.** Coluna vertical com bulbo na base que enche de baixo para cima até a meta, com marcas de escala ao
lado. É o formato de campanha de arrecadação, popular fora do mundo de dados justamente porque não exige nenhuma
explicação: o material de captação descreve a peça como "um termômetro clássico, só que em vez de temperatura ele
acompanha o avanço da campanha, e as doações vão colorindo a barra". A ficha honesta: é um gráfico de barra
vertical com enfeite, e o enfeite é o que o faz funcionar com público não técnico.

**Anatomia.** Tubo com contorno; preenchimento de baixo para cima; bulbo na base, sempre cheio e **fora** da
escala; marcas de escala à direita com valores e a meta no topo; rótulo do valor atual ao lado do nível.

**Abordagem na stack.** `svg-puro`. O tubo é um `rect` com raio grande, o bulbo é um `circle`, o preenchimento é
um `rect` recortado por `clipPath` para respeitar o raio do tubo. Recharts não tem nada aqui e forçar um
`BarChart` custa mais do que desenhar.

**Ponto delicado.** O bulbo. Ele é sempre cheio, então conta como "zero" e não pode entrar na régua; quem desenha
o preenchimento medindo do fundo do bulbo até o topo introduz um erro fixo de alguns por cento, e em valores
baixos o termômetro mostra progresso que não existe. A escala começa no topo do bulbo. Segundo ponto: o formato
pressupõe acumulado que só sobe; métrica que pode cair (saldo de pipeline, carteira) fica esquisita e é caso de
barra comum. Terceiro: o contorno do tubo precisa de contraste no tema escuro, senão o vidro some e sobra uma
barra flutuante.

**Versões sugeridas.**
- **V1 básica:** meta de captação de uma campanha fictícia, valor e meta escritos.
- **V2 com marcos:** marcas intermediárias na escala (25%, 50%, 75%) com rótulo, para a leitura ganhar degraus.
- **V3 densa do Farol:** termômetro de meta anual de receita ao lado de uma coluna com o acumulado por trimestre,
  uma peça de abertura de reunião de diretoria; a escala em moeda compacta e a meta marcada no topo.
- **V4 caso limite:** meta batida: o tubo enche até o topo, o excedente sai como um bloco acima da marca da meta,
  com rótulo próprio, em vez de o termômetro estourar o desenho.

**Referências.**
- Catálogo: [Data Viz Project, Progress Bar](https://datavizproject.com/data-type/progress-bar/): observar que o
  termômetro é a mesma codificação por comprimento, só girada e vestida.
- Praticante: [WildApricot, Fundraising Thermometers](https://www.wildapricot.com/blog/fundraising-thermometer):
  observar as três formas de rotular a peça (percentual, par arrecadado e meta, ou só a barra cheia).
- Portal de design: [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit)
  (apareceu na busca do estudo de portais, não aberto aqui): variações verticais e em etapas.

**Mora melhor em outra família?** Sem o enfeite, é barra de progresso (modelo 1) ou coluna (03).

---

## 15. Tracker de blocos

**Descrição.** Uma fileira de blocos, um por dia ou por execução, cada um colorido pelo estado. O Tremor mantém o
componente com esse nome: uma grade de quadrados coloridos em que cada um representa um estado ou evento, com
tooltip próprio, e o caso de uso de referência é o monitor de disponibilidade. No Farol vira a leitura de
regularidade: não interessa só se a meta foi batida, interessa se ela é batida **sempre**.

**Anatomia.** Fileira de blocos de largura igual e vão pequeno; cor por estado, com legenda nomeando cada estado;
tooltip por bloco com data e valor; rótulos de início e fim embaixo; contagem resumo ao lado ("27 de 30 dias
dentro do SLA").

**Abordagem na stack.** `html-tailwind`: `flex gap-0.5` com um `div` por bloco, ou `svg-puro` acima de uns 120
blocos, para não inflar o DOM. Cada bloco é um `button` quando clicável, com rótulo acessível próprio.

**Ponto delicado.** Cor é a única codificação, então a legenda é obrigatória e os estados precisam ser
distinguíveis sem depender de matiz: o kit usa três tons da rampa sequencial mais um padrão hachurado para "sem
dado", que é o estado que todo tracker esquece. Segundo ponto: bloco muito estreito. Abaixo de uns 4 px o alvo de
clique some e o tooltip vira loteria; a saída é agregar por semana e dizer isso no rótulo. Terceiro: o eixo de
tempo é implícito e irregular quando faltam dias; sem um bloco por dia de calendário, inclusive os vazios, a
fileira mente sobre a sequência.

**Versões sugeridas.**
- **V1 básica:** 30 blocos, um por dia, verde quando a fila fechou dentro do SLA.
- **V2 com destaque:** a maior sequência de dias bons anotada por cima ("melhor sequência: 11 dias").
- **V3 densa do Farol:** cinco fileiras, uma por pessoa da pré-vendas, 90 dias cada, agregadas por semana, com o
  resumo de atingimento à direita de cada fileira.
- **V4 caso limite:** feriado e fim de semana como blocos neutros fora da contagem; três dias sem coleta como
  blocos hachurados, e o resumo dizendo "27 de 30 dias com dado".

**Referências.**
- Catálogo: [Tremor, Tracker](https://npm.tremor.so/docs/visualizations/tracker): observar a forma do dado (cor,
  tooltip e chave por bloco) e o caso de uso de monitor de disponibilidade.
- Catálogo: [Tremor, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars): observar como a biblioteca
  agrupa barra, lista e marcador na mesma família de componentes de estado.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar o uso de faixas compactas de estado ao lado dos números grandes.

**Mora melhor em outra família?** Com dias organizados em semanas e meses, é calendário de calor (15). Com blocos
contando unidades em vez de estados, é waffle (22).

---

## 16. Lista de metas por pessoa

**Descrição.** Uma linha por pessoa, com nome, barra de atingimento, meta e valor. É o formato mais político da
família, porque coloca gente em ordem, e o mais usado na reunião semanal. O desenho precisa resolver uma tensão:
mostrar a diferença sem transformar o painel em pelourinho.

**Anatomia.** Avatar ou inicial; nome; barra com traço de meta; percentual de atingimento em algarismo tabular;
valor absoluto; coluna opcional de variação contra o período anterior; rodapé com a mediana da equipe como linha
de referência sobre todas as barras.

**Abordagem na stack.** `html-tailwind` para a lista mais a barra do modelo 1 ou o SVG do modelo 7. Recharts só
entra quando a lista precisa virar gráfico ordenável com eixo compartilhado, e aí é o modelo 5.

**Ponto delicado.** Metas diferentes por pessoa. Executivo sênior com meta de R$ 1,2 milhão e júnior com meta de
R$ 400 mil não se comparam em valor absoluto, só em percentual da meta, e o kit mostra os dois: barra em
percentual, número absoluto ao lado. Segundo ponto: base pequena. Pessoa com 3 oportunidades no período tem
atingimento volátil e precisa do par (`formatRateWithVolume`) e do selo de amostra pequena, senão o ranking vira
ruído. Terceiro: ordenação. Por atingimento é o padrão; por nome esconde o padrão; e o kit guarda a ordenação
escolhida, mas nunca ordena por variação, que é a mais instável. Quarto, e é regra de escrita: nome fictício
sempre, e a peça do catálogo jamais carrega gente real.

**Versões sugeridas.**
- **V1 básica:** oito executivos fictícios com cota trimestral, ordenados por atingimento.
- **V2 com referência:** linha vertical da mediana da equipe cruzando todas as barras, com rótulo, para cada
  pessoa ser lida contra o grupo e não só contra a própria meta.
- **V3 densa do Farol:** a mesma lista com quatro colunas numéricas (oportunidades, taxa de conversão, ticket
  médio, receita) e a micro barra do modelo 7 na coluna de atingimento; agrupada por time.
- **V4 caso limite:** pessoa afastada metade do período, com meta proporcional e selo; pessoa nova sem meta
  definida, que aparece no fim com "sem meta" e não entra na mediana.

**Referências.**
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf):
  observar a figura em que quatro pessoas avaliadas cabem no espaço de três gauges.
- Catálogo: [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart):
  observar as opções de ordenação e agrupamento por coluna, que é a decisão central deste modelo.
- Catálogo: [Tremor, Data Bars](https://npm.tremor.so/docs/visualizations/data-bars): observar a `BarList`, o
  formato de referência de lista com barra embutida.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar a hierarquia entre a lista por pessoa e os indicadores agregados do topo.

**Mora melhor em outra família?** Com muitas colunas numéricas, é tabela visual (14). Sem meta, é ranking em barra
horizontal (02).

---

## 17. Régua de marcos

**Descrição.** Uma linha do tempo horizontal com 4 a 8 marcos datados, cada um em um de três estados: atingido,
em curso, futuro. É o formato de acompanhamento de plano, e a literatura de gestão descreve exatamente esse papel,
"acelerar decisões de seguir ou parar com marcadores claros de sim ou não". A diferença para um cronograma é que
aqui nada tem duração: só pontos.

**Anatomia.** Eixo horizontal com escala de data real; marcos como círculos sobre o eixo; rótulo alternando acima
e abaixo para não colidir; trecho do eixo já percorrido em cor cheia e o restante apagado; marcador de "hoje"
como linha vertical.

**Abordagem na stack.** `svg-puro`. O eixo é uma linha, os marcos são círculos posicionados por uma escala de
tempo linear calculada em TypeScript (diferença de datas dividida pela amplitude). Recharts pode desenhar com
`ScatterChart` num eixo de tempo, mas o custo de controlar colisão de rótulo é maior do que escrever a geometria.

**Ponto delicado.** Marcos espaçados por ordem em vez de data é o erro comum: fica bonito, mede errado, e esconde
que dois marcos estão a três dias um do outro enquanto o seguinte está a quatro meses. A escala é sempre temporal.
Consequência imediata: os rótulos colidem, e resolver colisão é o trabalho real deste modelo. A regra do kit é
alternar acima e abaixo, e quando ainda colide, encurtar o rótulo e jogar o texto completo no tooltip. Segundo
ponto: o marcador de "hoje" vem no dado, por causa do determinismo; o componente nunca chama o relógio.

**Versões sugeridas.**
- **V1 básica:** cinco marcos do plano do trimestre com estado por preenchimento do círculo.
- **V2 com destaque:** marco atrasado em `--negative` com ícone e o número de dias de atraso ao lado.
- **V3 densa do Farol:** plano anual da área com oito marcos, agrupados por frente (dado, processo, time) em três
  faixas empilhadas sobre o mesmo eixo de tempo, com "hoje" cruzando as três.
- **V4 caso limite:** dois marcos na mesma semana e um marco sem data definida. Os dois viram um grupo com
  contador ("2 marcos"), e o sem data sai do eixo para uma coluna "a definir" à direita, nunca chutado no fim.

**Referências.**
- Catálogo: [Vizzlo, Milestone Charts](https://vizzlo.com/graphs/milestones): observar as variantes de marco
  (marcos em seta, lista de marcos, linha do tempo com ícone) e o partido de rótulo alternado.
- Praticante: [Asana, Milestone chart, definition and steps](https://asana.com/resources/milestone-chart)
  (apareceu literalmente na busca, não aberto aqui): observar os componentes de um marco (marcador, eixo de data,
  descrição, dependência e dono).
- Portal de design: [Figma Community, Progress Bar UI Kit](https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit)
  (apareceu na busca do estudo de portais, não aberto aqui): a variação em etapas é a base de régua de marcos.

**Mora melhor em outra família?** Com duração e barras, é cronograma (20). Com muitos eventos sem meta, é linha do
tempo (20) também; aqui só fica quando os marcos são metas.

---

## 18. Capacidade contra teto

**Descrição.** Variante do bullet em que a meta não é algo a alcançar, é algo a **não** ultrapassar. A polaridade
inverte tudo: a barra cheia é ruim, a zona acima do traço é vermelha, e a leitura útil é a folga. É o visual das
telas de Pré-vendas e Diretoria do Farol, onde a pergunta é se a demanda projetada cabe no teto medido.

**Anatomia.** Trilho que vai além do teto de propósito, para a zona de estouro existir; barra da demanda; traço do
teto com rótulo e etiqueta de procedência; zona de estouro hachurada além do teto; texto com a folga ("faltam 46
entradas para o teto") ou com o excesso.

**Abordagem na stack.** `html-tailwind` para o caso de uma linha, `recharts-custom` quando são várias filas com
tetos diferentes, com o teto como `ReferenceLine` por linha e, aí, `ifOverflow="extendDomain"` deixa de ser
detalhe e vira requisito, porque a demanda muitas vezes fica abaixo do teto e sem isso o teto some.

**Ponto delicado.** A procedência do teto é o ponto político. Teto medido e teto de premissa se parecem no
desenho e valem coisas diferentes na discussão; o projeto 28 registra o caso concreto em que uma premissa de
planilha foi lida como medição por muito tempo. O kit obriga a etiqueta no rótulo do teto (MEDIDO, DERIVADO,
PREMISSA) e recusa teto sem etiqueta. Segundo ponto: a zona de estouro precisa existir no domínio mesmo quando
ninguém estourou, senão o leitor não percebe que há um teto acima e lê a barra como progresso. Terceiro: cor. A
barra cheia aqui não é sucesso, então `--chart-1` neutro até o teto e `--negative` só além dele, com hachura e
ícone; verde nunca.

**Versões sugeridas.**
- **V1 básica:** entradas do mês na pré-vendas contra o teto medido, com a folga escrita.
- **V2 com anotação:** o teto com etiqueta MEDIDO e a nota da base ("medido em 2026-08, 5 pessoas").
- **V3 densa do Farol:** quatro filas de trabalho com tetos próprios e demanda projetada para os três meses
  seguintes, três barras por fila, a barra que estoura destacada e o excesso rotulado.
- **V4 caso limite:** fila cujo teto é premissa e não medição: o traço vira tracejado, a etiqueta vira PREMISSA e
  a peça escreve que a leitura só fecha depois da janela de medição.

**Referências.**
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar o tratamento de métrica em que menos é melhor (despesa, defeito abaixo de um limiar), com sequência de
  faixas invertida.
- Catálogo: [AG Charts, Radial Gauge](https://www.ag-grid.com/charts/react/radial-gauge/): observar os alvos com
  forma e posicionamento próprios, que é a API mais completa de "marcador de limite" entre as bibliotecas vistas.
- Catálogo: [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart):
  observar o conselho de estender o eixo além do maior valor, que aqui é o que faz a zona de estouro existir.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar a leitura de saúde de pipeline, que é o mesmo raciocínio de folga contra capacidade.

**Mora melhor em outra família?** Capacidade ao longo do tempo, com demanda e teto por mês, é combinado (08).

---

## 19. Faixa de cenário contra meta

**Descrição.** A saída não é um número, é um intervalo: pessimista, base, otimista. O visual desenha a faixa como
uma barra clara, o cenário base como um traço forte dentro dela e a meta como um traço externo. Responde a
pergunta que a Diretoria faz de verdade: "a meta cabe dentro da faixa ou só no melhor caso".

**Anatomia.** Eixo quantitativo; retângulo claro da faixa com as pontas rotuladas; marcador do cenário base;
traço da meta, visualmente distinto do base; rótulos nomeando o que é o piso e o teto da faixa e com que premissa
cada ponta foi calculada.

**Abordagem na stack.** `recharts-custom` com `BarChart` horizontal: a faixa entra como uma barra empilhada
transparente até o piso mais uma barra visível do piso ao teto (o truque clássico da barra flutuante), o base como
`ReferenceLine` ou `Scatter`, e a meta como segunda `ReferenceLine` com traço diferente. Em uma linha só,
`svg-puro` sai mais simples.

**Ponto delicado.** Faixa sem nome é gráfico bonito e inútil. O leitor precisa saber o que o piso significa (por
exemplo, "conversão do pior trimestre dos últimos dois anos") e o que o teto pressupõe; sem isso a faixa vira
decoração de incerteza. Segundo ponto: a barra flutuante no Recharts exige uma série invisível embaixo, e essa
série aparece no tooltip e na legenda se não for silenciada; o kit desliga tooltip e legenda da série de apoio.
Terceiro: quando a meta cai fora da faixa inteira, a peça precisa dizer em texto, porque visualmente parece só um
traço distante.

**Versões sugeridas.**
- **V1 básica:** receita projetada do próximo trimestre em faixa, com a meta ao lado.
- **V2 com anotação:** as duas pontas rotuladas com a premissa de cada uma e a distância entre o base e a meta.
- **V3 densa do Farol:** cinco linhas, uma por trimestre até o fim de 2027, faixas acumuladas e a meta anual como
  linha vertical cruzando todas, mostrando em qual trimestre a faixa passa a conter a meta.
- **V4 caso limite:** cenário em que nem o otimista alcança a meta: a faixa inteira fica à esquerda do traço, e a
  peça escreve a lacuna em valor e em percentual, sem esticar o eixo para disfarçar.

**Referências.**
- Catálogo: [Datawrapper, Bullet bars](https://www.datawrapper.de/charts/bullet-bars) (apareceu literalmente na
  busca, não aberto aqui): observar a proposta de mostrar o que deu certo e o que não deu na mesma barra.
- Catálogo: [Datawrapper Blog, New Arrow and Range Plots](https://www.datawrapper.de/blog/new-arrow-and-range-plots)
  (apareceu literalmente na busca, não aberto aqui): observar o gráfico de amplitude, que é a forma canônica de
  desenhar faixa entre dois valores.
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar a recomendação de projeção como segmento adicional, que é a versão de uma ponta só deste modelo.
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar como forecast e acurácia convivem sem virar um número só.

**Mora melhor em outra família?** Faixa ao longo do tempo é área de incerteza (05). Faixa entre dois pontos sem
meta é comparação de pontos (17).

---

## 20. Burn-up acumulado contra meta

**Descrição.** O progresso desenhado ao longo do tempo: uma linha acumulada subindo, uma linha horizontal da meta
e uma linha do ritmo necessário. Vem da gestão ágil, onde o burn-up mantém separadas a linha do realizado e a
linha do escopo total, enquanto o burndown funde as duas num movimento só e esconde mudança de escopo. No Farol a
"mudança de escopo" é a meta revisada no meio do ano, que acontece e precisa aparecer.

**Anatomia.** Eixo de tempo; área ou linha do acumulado realizado; linha horizontal da meta, que pode ter degrau
quando a meta foi revisada; linha tracejada do ritmo necessário do dia de corte até o fim; marcador de "hoje";
rótulo com a projeção de chegada.

**Abordagem na stack.** `recharts-nativo`: `ComposedChart` com `Area` para o acumulado, `Line` tracejada para o
ritmo necessário e `ReferenceLine` horizontal com `ifOverflow="extendDomain"` para a meta. Quando a meta mudou, ela
deixa de ser `ReferenceLine` e vira uma `Line` própria com `type="stepAfter"`, que é o que desenha o degrau
honestamente.

**Ponto delicado.** A meta revisada. Redesenhar o passado com a meta nova apaga a revisão e é a forma mais comum
de o gráfico mentir; a meta é uma série temporal, não uma constante, e o degrau precisa de anotação dizendo quando
e por que mudou (a régua A1 do acabamento pede exatamente isso). Segundo ponto: acumulado só sobe, então o eixo
começa em zero e a curva nunca desce; se descer, o dado tem estorno e isso merece anotação, não suavização.
Terceiro: a linha de ritmo necessário é recalculada a cada dia e fica mais íngreme conforme o tempo passa; mostrar
a de hoje sem a inclinação original tira a noção de quanto o atraso custou.

**Versões sugeridas.**
- **V1 básica:** receita reconhecida acumulada no trimestre, meta como linha horizontal.
- **V2 com destaque:** a linha do ritmo necessário do dia de corte ao fim, e o rótulo "precisa de R$ 62 mil por
  semana para fechar".
- **V3 densa do Farol:** acumulado de oportunidades ganhas no ano com a meta revisada em julho (degrau), a área do
  realizado, a projeção tracejada e a anotação da revisão.
- **V4 caso limite:** período com estorno, em que o acumulado cai num mês: o degrau para baixo fica visível, com
  anotação; e o trecho sem coleta entra como lacuna, com `connectNulls` desligado.

**Referências.**
- Catálogo: [Atlassian, Agile burndown chart tutorial](https://www.atlassian.com/agile/tutorials/burndown-charts)
  (apareceu literalmente na busca, não aberto aqui): observar a linha ideal como diagonal e a linha real dia a dia.
- Praticante: [Globant, Why you should use a Burn-Up chart instead of a Burn-Down chart](https://stayrelevant.globant.com/en/technology/agile-organizations/why-you-should-use-burn-up-chart-in-agile-instead/)
  (apareceu literalmente na busca, não aberto aqui): observar o argumento central, o burn-up mostra mudança de
  escopo e o burndown esconde.
- Praticante: [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  observar a seção de projeção, que explica por que "quanto falta" não responde "vou chegar".
- Portal de design: [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  observar a convivência entre série temporal e indicador de meta na mesma tela.

**Mora melhor em outra família?** É meio caminho com linha (04) e área (05). Fica aqui porque a linha de meta e a
de ritmo são o assunto; sem elas, é série temporal comum.

---

## Modelos que passaram perto e moram em outra família

- **Cartão de KPI com meta escrita e delta, sem barra:** 01. A fronteira é o desenho da régua; sem régua
  desenhada, é cartão.
- **Ranking de categorias sem meta:** 02.
- **Meia rosca como composição de um total:** 07. O gauge de arco preenchido (modelo 9) só se distingue dela
  porque mede contra um máximo, não contra a soma das partes.
- **Sparkline com faixa de referência dentro de célula:** 24; aqui fica só a versão com traço de meta (modelo 7).
- **Calendário de calor com meta diária:** 15.
- **Waffle de "x de 100 da meta":** 22, que já trata o arredondamento pelo maior resto.
- **Gantt de tarefas com duração:** 20. A régua de marcos (modelo 17) fica aqui porque marco não tem duração.
- **Funil com meta por etapa:** 10.

## Lacunas desta pesquisa

1. **Bullet chart não tem referência de portal de design.** A varredura de Behance, Dribbble e Figma Community
   feita no `00_portais-de-design.md` já registrava isso e a busca desta sessão confirmou: só apareceu a página de
   tag do Dribbble. É o formato mais recomendado da família e o menos desenhado nos portais, o que diz algo sobre
   por que o gauge sobrevive. Consequência prática: o bullet do Farol sai do zero, a partir do spec.
2. **O FT Visual Vocabulary não tem gauge nem bullet.** A leitura do README confirmou: a seção Magnitude cobre
   coluna, barra, símbolo proporcional e lollipop, e nenhum formato de meta aparece. A ausência é dado: o
   vocabulário do FT é editorial, e progresso contra meta é assunto de painel interno, não de jornalismo.
3. **As demos de gauge de atividade do Highcharts não carregaram** (404 nas duas tentativas). A descrição usada
   veio literalmente do resultado de busca.
4. **A página de gráficos radiais do shadcn/ui carregou sem o código.** As descrições de cada variante vieram dos
   resultados de busca das páginas espelho; a conferência de props precisa ser feita na implementação.
5. **Não foi encontrado teste perceptual quantitativo** comparando leitura de gauge, bullet e barra com meta. A
   crítica ao gauge nesta família é argumento de praticante (Few), não resultado de experimento com número.

## Fontes consultadas

Marcação: [aberto] carregou nesta sessão; [busca] apareceu literalmente em resultado de busca mas não foi aberto;
[falhou] foi tentado e não carregou; [portais] veio do `00_portais-de-design.md` deste mesmo estudo.

**Praticantes**
- Stephen Few, Bullet Graph Design Specification: https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf [aberto]
- Stephen Few, Our Irresistible Fascination with All Things Circular: http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf [aberto]
- Stephen Few, Software Support for Bullet Graphs: https://www.perceptualedge.com/blog/?p=375 [busca]
- Storytelling with Data, bullet graphs galore: https://www.storytellingwithdata.com/blog/2021/12/9/bullet-graphs-galore [aberto]
- Stephanie Evergreen, Qualitative Data Visualization, The Gauge Diagram: https://stephanieevergreen.com/gauge-diagram/ [busca]
- Clearly and Simply, An Alternative Design of Bullet Graphs: https://www.clearlyandsimply.com/2017/05/an-alternative-design-of-bullet-graphs/ [busca]
- Dueling Data, Bullet vs Gauge: http://duelingdata.blogspot.com/2017/07/bullet-vs-gauge.html [busca]
- Tableau, Why bullet graphs pack more punch than gauge charts: https://www.tableau.com/blog/bullet-graphs-beat-gauge-charts [falhou, HTTP 403]
- Tableau, Stephen Few Riffs on Bullet Graphs: https://www.tableau.com/blog/stephen-few-riffs-bullet-graphs [busca]
- Better Evaluation, Bullet graph design specification: https://www.betterevaluation.org/tools-resources/bullet-graph-design-specification [busca]
- Apple, Human Interface Guidelines, Activity rings: https://developers.apple.com/design/human-interface-guidelines/components/status/activity-rings/ [busca]
- Globant, Why you should use a Burn-Up chart instead of a Burn-Down chart: https://stayrelevant.globant.com/en/technology/agile-organizations/why-you-should-use-burn-up-chart-in-agile-instead/ [busca]
- Atlassian, Agile burndown chart tutorial: https://www.atlassian.com/agile/tutorials/burndown-charts [busca]
- WildApricot, Fundraising Thermometers: https://www.wildapricot.com/blog/fundraising-thermometer [busca]
- Asana, Milestone chart, definition and steps: https://asana.com/resources/milestone-chart [busca]

**Catálogos e bibliotecas**
- Data Visualisation Catalogue, Bullet Graph: https://datavizcatalogue.com/methods/bullet_graph.html [aberto]
- Data Viz Project, Bullet Graph: https://datavizproject.com/data-type/bullet-graph/ [busca]
- Data Viz Project, Progress Bar: https://datavizproject.com/data-type/progress-bar/ [busca]
- FT Visual Vocabulary, README: https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md [aberto, sem gauge nem bullet]
- Datawrapper Academy, customizing your bullet bar chart: https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart [aberto]
- Datawrapper, Bullet bars: https://www.datawrapper.de/charts/bullet-bars [busca]
- Datawrapper Blog, New Arrow and Range Plots: https://www.datawrapper.de/blog/new-arrow-and-range-plots [busca]
- Datawrapper Blog, Annotations in bar, range, and dot charts: https://www.datawrapper.de/blog/annotations-in-bar-charts [busca]
- Recharts, RadialBarChart (API): https://recharts.github.io/en-US/api/RadialBarChart/ [aberto]
- Recharts, Pie Chart With Needle: https://recharts.github.io/en-US/examples/PieChartWithNeedle/ [aberto]
- Recharts, Radial bar chart (exemplo): https://recharts-recharts.mintlify.app/examples/radial-bar-chart [busca]
- shadcn/ui, Radial Charts: https://ui.shadcn.com/charts/radial [aberto, página sem o código]
- shadcn, A radial chart: https://www.shadcn.io/examples/a-radial-chart [busca]
- shadcn, A radial chart with text: https://www.shadcn.io/examples/a-radial-chart-with-text [busca]
- shadcn, A radial chart with a label: https://www.shadcn.io/examples/a-radial-chart-with-a-label [busca]
- shadcn, A radial chart with stacked sections: https://www.shadcn.io/examples/a-radial-chart-with-stacked-sections [busca]
- shadcn, A radial chart with a custom shape: https://www.shadcn.io/patterns/chart-radial-shape [busca]
- Tremor, Tracker: https://npm.tremor.so/docs/visualizations/tracker [aberto]
- Tremor, Data Bars: https://npm.tremor.so/docs/visualizations/data-bars [busca]
- Tremor, ProgressCircle: https://www.tremor.so/docs/visualizations/progress-circle [busca]
- AG Charts, Radial Gauge (React): https://www.ag-grid.com/charts/react/radial-gauge/ [aberto]
- Apache ECharts, exemplo gauge-grade: https://echarts.apache.org/examples/en/editor.html?c=gauge-grade [busca]
- Highcharts, Solid gauge: https://www.highcharts.com/demo/highcharts/gauge-solid [busca]
- Highcharts, Activity gauge: https://www.highcharts.com/demo/android/gauge-activity [falhou, HTTP 404]
- Highcharts, Gauge with dual axes: https://www.highcharts.com/demo/highcharts/gauge-dual [busca]
- Highcharts, VU meter: https://www.highcharts.com/demo/gauge-vu-meter/sand-signika [busca]
- Vizzlo, Milestone Charts: https://vizzlo.com/graphs/milestones [busca]
- Wikipedia, Bullet graph: https://en.wikipedia.org/wiki/Bullet_graph [busca]
- Domo, Gauge Charts Explained: https://www.domo.com/learn/charts/gauge-chart [busca]

**Portais de design**
- Behance, Pipeline OS, B2B Sales Forecasting Dashboard: https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard [portais, aberto na varredura]
- Behance, Gauge Chart: https://www.behance.net/gallery/233895453/Gauge-Chart [portais, aberto na varredura]
- Behance, Theme and UI Design for Charts, Gauges and Maps: https://www.behance.net/gallery/65301405/Theme-and-UI-Design-for-Charts-Gauges-and-Maps [portais, aberto na varredura]
- Figma Community, Figma Chart Components: https://www.figma.com/community/file/1477881073711295499/figma-chart-components [portais, busca]
- Figma Community, Progress Bar UI Kit: https://www.figma.com/community/file/1272185145737268273/progress-bar-ui-kit [portais, busca]
- Figma Community, plugin Gauge Charts: https://www.figma.com/community/plugin/1584969787567772564/gauge-charts-quick-customizable-gauge-dial-speedometer-chart-widget-for-figma-figjam [portais, busca]
- Dribbble, Figma Charts UI kit, Gauge templates: https://dribbble.com/shots/14711130-Figma-Charts-UI-kit-Gauge-templates [portais, não abriu]
- Dribbble, tag bullet_chart: https://dribbble.com/tags/bullet_chart [busca]

**Documentos internos do estudo**
- `VISUAIS/CONTRATO.md`: tokens, formato de número, determinismo, acessibilidade.
- `VISUAIS/_estudo/00_acabamento.md`: M4 e M5 sobre bullet graph, A4 sobre linha de meta, G1, G11, armadilhas 2 e 19.
- `VISUAIS/_estudo/00_portais-de-design.md`, seção `13_progresso-meta-e-gauge`.
