# Gauge semicircular com ponteiro e faixas

## O que é

O velocímetro: um arco de 180 graus dividido em faixas por intensidade de um único tom, um
ponteiro que aponta o valor e um número grande. É o formato mais pedido por diretoria e o mais
criticado da família de progresso e meta, porque a escala do arco é arbitrária: num arco de 0 a
100, o valor 83 ocupa 149,4 graus e ninguém lê esse ângulo com precisão. O ponteiro é a forma
menos precisa de todo o catálogo de progresso e meta: a posição angular se lê com erro grande e
quem olha tende a arredondar para a faixa mais próxima em vez de calcular o valor exato. Por isso
o modelo nunca desenha só o arco: mínimo e máximo ficam escritos nas pontas, o valor sai sempre em
texto grande, e a peça existe só como destaque único, nunca em painel com mais de um gauge por
tela. Em Recharts, um `PieChart` semicircular com `startAngle` 180 e `endAngle` 0 desenha as
faixas por `Cell`; o ângulo do ponteiro sai do valor por uma função própria (`valueToAngle`),
nunca do meio de um setor, e o ponteiro é um polígono preenchido, não um traço fino que some no
tema escuro.

## Quando usar

- Pedido explícito de diretoria por uma métrica só, como peça única de destaque numa tela ou
  slide (v1, v2, v3, v4).
- Avaliação qualitativa com 3 a 5 estados nomeados e limiares com dono e data declarados, como a
  cobertura de dado do funil contra uma régua definida em reunião (v2).
- Capacidade contra um teto medido pelo time, em apresentação, com a zona de estouro sinalizada
  por ícone e nunca por verde (v3).
- Caso limite em que o valor real passa do máximo do arco e precisa continuar visível sem esticar
  a escala nem dar uma segunda volta no ponteiro (v4).

## Quando evitar

- Qualquer caso em que a barra caiba: o mesmo dado em bullet chart (13/02) lê melhor, porque tem
  espaço para o rótulo do limiar ao lado do valor, sem depender de ângulo. É a alternativa padrão
  deste modelo.
- Mais de um gauge na mesma tela, ou qualquer comparação entre itens: um painel de bullets
  alinhados (13/05) compara séries no mesmo espaço em que um gauge só mostra uma.
- Medida contínua sem estados definidos: o arco preenchido (13/09) ou a barra de progresso linear
  (13/01) mostram a mesma continuidade sem a armadilha do ponteiro.
- Limiares inventados na hora, sem origem declarada: a v2 mostra como citar quem definiu a régua e
  quando, direto na legenda.
- Valor que passa do máximo com frequência: a barra com excedente (13/01, v4) mostra o estouro sem
  precisar travar um ponteiro no fim do arco a cada mês.

## Anatomia

1. **Arco de faixas.** `Pie` semicircular (`startAngle={180}`, `endAngle={0}`) com uma `Cell` por
   faixa, `fill="var(--surface-sunken)"` e `fillOpacity` crescente por intensidade: a faixa mais
   clara marca o estado pior, nunca um semáforo de matiz (COR-1, decisão 5 da família).
2. **Ponteiro.** Polígono preenchido em `var(--text-primary)` com contorno de 1 px em
   `var(--surface-raised)`, calculado por `valueToAngle` (interpolação linear travada nas pontas),
   nunca pelo `midAngle` de um setor.
3. **Disco de base.** Círculo pequeno no centro do ponteiro, mesma cor e contorno dele, para
   esconder a junção dos vértices do polígono.
4. **Mínimo e máximo.** Texto de 11 px em `var(--text-muted)` nas duas pontas do arco, sempre
   pelos formatadores de `@/lib/format` (NUM-1, NUM-6).
5. **Tiques de limiar.** Traço curto em `var(--surface-raised)` na fronteira entre faixas, com o
   número ao lado (anatomia do modelo, "tiques com os limiares"); o teto medido (v3, v4) usa um
   traço mais longo e mais forte, com o rótulo "teto" por extenso, para não se confundir com uma
   fronteira comum (ANO-3).
6. **Valor grande.** Fora do `viewBox` do Recharts, em `div` absoluto centrado na base do arco
   (`kpi-number text-3xl font-semibold text-text-primary`), decisão do dono da marca para este
   modelo: o ângulo nunca é a única leitura.
7. **Palavra de estado (v2).** Quando a régua é qualitativa, o nome do estado ocupa o lugar do
   número grande e o valor numérico vira apoio, 14 px, logo abaixo.
8. **Ícone de estouro (v3).** `TriangleAlert` do lucide, 14 px, `text-negative`, posicionado sobre
   a faixa de estouro: a polaridade de capacidade nunca fica verde no cheio.
9. **Marca de transbordo (v4).** Pequeno triângulo em `var(--negative)` além da ponta do arco,
   ligado ao ponteiro travado no máximo, acompanhado do valor real escrito por extenso.

## Versões

- **`v1_atingimento-trimestral-com-ponteiro`**: atingimento da meta de receita do trimestre em três
  faixas (abaixo do esperado, em rota, acima da meta), ponteiro contínuo e mínimo, máximo e
  limiares escritos nas pontas e nas fronteiras do arco.
- **`v2_cobertura-de-dado-com-nota`**: cobertura de campos mínimos das oportunidades com quatro
  estados nomeados (crítico, atenção, saudável, ótimo), o estado como palavra no centro, o valor de
  apoio abaixo dela, a distância até a faixa saudável e a origem dos limiares numa legenda.
- **`v3_capacidade-contra-teto-medido`**: entradas mensais da pré-vendas contra um teto de
  atendimento medido, com a faixa de estouro sinalizada por ícone, a folga escrita em texto e o
  traço do teto distinto de uma fronteira comum.
- **`v4_valor-acima-do-maximo`**: mesmo cenário de capacidade um mês depois, com o valor real acima
  do máximo do arco: o ponteiro trava no fim, ganha uma marca de transbordo e o texto grande mostra
  o valor real, nunca um domínio esticado em silêncio.

Previews: [v1 escuro](v1_atingimento-trimestral-com-ponteiro/preview.svg) ·
[v1 claro](v1_atingimento-trimestral-com-ponteiro/preview-claro.svg) ·
[v2 escuro](v2_cobertura-de-dado-com-nota/preview.svg) ·
[v2 claro](v2_cobertura-de-dado-com-nota/preview-claro.svg) ·
[v3 escuro](v3_capacidade-contra-teto-medido/preview.svg) ·
[v3 claro](v3_capacidade-contra-teto-medido/preview-claro.svg) ·
[v4 escuro](v4_valor-acima-do-maximo/preview.svg) ·
[v4 claro](v4_valor-acima-do-maximo/preview-claro.svg)

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida; o `data.ts` de cada versão já separa faixas
   (`bands` ou `states`) de valor, mínimo, máximo e, quando existir, teto, para o seletor da página
   substituir só os números, sem mexer na geometria.
2. O ponteiro e as faixas dependem de `useChartWidth`/`useChartHeight`, lidos dentro do `PieChart`:
   ao colar, mantenha o `Dial` como filho direto de `PieChart` dentro do mesmo
   `ResponsiveContainer`, nunca fora dele.
3. Dê altura ao pai (mínimo de 160 px): abaixo disso o texto absoluto da base pode não caber junto
   do arco. Um `VisualCard` de `kpi-alto` ou `card` já atende.
4. Se a página tiver mais de uma métrica candidata a gauge, escolha só uma por tela; as demais
   viram bullet chart (13/02) ou cartão de KPI simples.
5. Quando o teto ou os limiares vierem de outra fonte (registry de métricas), mantenha a citação
   de origem em texto visível, como a v2 faz na legenda: um limiar sem dono é a primeira coisa que
   este modelo pode mentir.

## Referências

- Catálogo: [Recharts, Pie Chart With Needle](https://recharts.github.io/en-US/examples/PieChartWithNeedle/):
  o cálculo do comprimento do ponteiro e a rotação por `transformOrigin`; este modelo usa a mesma
  ideia de ponteiro como polígono, mas calcula o ângulo por `valueToAngle` em vez do `midAngle` do
  exemplo oficial, porque o exemplo aponta para o meio de uma fatia, não para um valor contínuo.
- Catálogo: [AG Charts, Radial Gauge](https://www.ag-grid.com/charts/react/radial-gauge/): a API
  completa do formato, incluindo a regra de que o rótulo some quando o ponteiro está ligado.
- Catálogo: [Apache ECharts, exemplo gauge-grade](https://echarts.apache.org/examples/en/editor.html?c=gauge-grade):
  a família de variantes que a biblioteca mantém para o mesmo formato.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](http://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf):
  a comparação de três gauges contra o painel de bullets equivalente, no mesmo espaço, que embasa
  a recomendação de "quando evitar" deste README.
- Portal de design: [Behance, Gauge Chart](https://www.behance.net/gallery/233895453/Gauge-Chart):
  por que a peça precisa do número escrito dentro ou junto de cada arco.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-19; as quatro versões passaram no `npm run check` e nenhuma tem
achado bloqueante. Os pontos abaixo são melhorias, não reprovação._

- Modelo inteiro: a COR-9 do CONTRATO lista "velocímetro" entre as formas proibidas, enquanto o
  catálogo pede este modelo e a decisão da família o registra como armadilha assumida. A revisão
  seguiu o catálogo, conforme a regra da leva; a divergência entre as duas réguas fica registrada.
- v1 a v4: as faixas são pintadas com `var(--surface-sunken)` e `fillOpacity`, não com a rampa
  `--seq-1` a `--seq-7` que a 17.2 reserva para intensidade. No tema escuro as faixas quase não se
  distinguem entre si nem do cartão; a leitura se sustenta nos limiares escritos e no texto de
  estado, que é justamente o que o modelo promete, mas a rampa daria a mesma leitura sem depender só
  do texto.
- v2: as amostras da legenda repetem a opacidade do arco sobre o fundo do cartão e ficam quase
  invisíveis nos dois temas; quem identifica cada estado é o intervalo escrito ao lado, não a cor.
- v2: "Faltam 3,0% para a faixa saudável" é distância entre dois percentuais, ou seja, pontos
  percentuais; escrito com "%" pode ser lido como variação relativa.
- v2: a palavra de estado em 30 px fica maior que o próprio arco, que encolheu para caber a legenda
  de quatro itens mais a linha de origem; a hierarquia entre o desenho e o texto se inverte.
- v2: `kpi-number` está aplicado a uma palavra ("Atenção"), e a classe existe para ligar algarismo
  tabular em número.
- v3: a faixa de estouro é a menos entintada das três (opacidade 0,42) e não é nomeada no arco; o
  ícone à direita, solto no vazio e `aria-hidden`, é a única pista visual de que aquela ponta é a
  zona ruim.
- v3: o texto de apoio diz "faltam 16 para o teto", sem o substantivo da unidade que a NUM-6 pede e
  que o próprio `meta.json` promete ("faltam 16 entradas para o teto").
- v4: o arco mostra o teto de 274, mas o texto de apoio compara o valor só com o máximo de 320; a
  distância de 64 entradas acima do teto aparece apenas na frase acessível.
