# Gauge de arco preenchido

## O que é

O gauge sem ponteiro: um arco de 240 ou 180 graus cresce sobre um arco de fundo completo, com o número grande no centro. É o caso limpo do `RadialBarChart`, e o `PolarAngleAxis` numérico com `domain` explícito é obrigatório; sem ele o Recharts normaliza a maior barra do conjunto e um valor qualquer aparece como arco cheio, em silêncio. O modelo só se justifica quando a faixa que o arco percorre carrega significado: mínimo, máximo e meta escritos e ditos por extenso, nunca um domínio de 0 a 100 inventado para preencher espaço. No Farol continua abaixo do bullet chart (modelo 02): serve para um percentual num cartão pequeno, nunca para comparar itens entre si.

## Quando usar

- Um percentual da meta num cartão pequeno, quando a barra linear não compõe com o layout ao redor.
- Até três cartões lado a lado com o mesmo arco e o mesmo domínio, cada um lido sozinho, nunca comparado por ângulo.
- Meta que não é o fim da escala, marcada como traço tracejado sobre o próprio arco.

## Quando evitar

- Comparação entre vários gauges: o ângulo não se compara por igual em duas posições diferentes do arco; use o painel de bullets (13/02).
- Composição de um total: isso é meia rosca (07/02), não progresso contra meta.
- Métrica de cartão com variação e sem régua desenhada: isso é cartão de KPI (01), sem arco nenhum.
- Estados qualitativos nomeados (ruim, aceitável, bom): gauge com ponteiro e faixas (13/06) ou bullet (13/02) leem melhor.
- Qualquer domínio cujo mínimo, máximo ou meta não tenham origem que se escreva em uma frase: sem essa frase o arco só diz "cheio" ou "vazio", não uma decisão.

## Anatomia

1. **Arco de fundo:** `RadialBar background` em `--surface-sunken` (fila coletada) ou contorno tracejado em `--line-strong` (fila sem coleta, v3), nunca semáforo de matiz e nunca `--surface-overlay`, que no tema claro é o mesmo branco do cartão e apaga o arco de fundo (`TOK-1`).
2. **Arco preenchido:** um `RadialBar` só em `--chart-1` (destaque único); `cornerRadius` zera abaixo de uma varredura mínima em graus, para a ponta arredondada não sugerir dado onde ele é quase zero.
3. **Escala:** `PolarAngleAxis type="number" domain={[0, max]} tick={false}`, calculado no componente a partir do dado, nunca deixado ao Recharts normalizar pela maior barra.
4. **Número central:** `formatInt` em Space Grotesk (`className="font-display"`), filho do próprio `RadialBarChart` para herdar `cx`/`cy` via `useChartWidth`/`useChartHeight`, porque o `Label position="center"` do Recharts resolve pelo contexto cartesiano e erra o centro polar.
5. **Pontas do arco:** mínimo e máximo escritos quando os dois são reais (v1); quando o fim físico do arco é só folga de desenho para o excedente caber (v2), a ponta não ganha número, e quem carrega o teto real é o traço de meta.
6. **Traço de meta:** linha tracejada em `--text-muted` mais rótulo com halo (`ROT-7`), na posição real do valor dentro do domínio, nunca fixada no fim da escala (armadilha da família: o padrão `discard` do `ReferenceLine` cartesiano apaga a meta fora de escala; aqui o equivalente é calcular o ângulo pela fórmula do domínio, nunca supor que a meta é o topo).
7. **Origem do limite:** frase abaixo do arco dizendo de onde vem a meta ou o teto comum (decisão do dono para este modelo). Sem ela, o número da ponta ou do traço não se distingue de um valor inventado.
8. **Frase acessível:** `role="img"` na raiz com o realizado, a meta, o que falta ou o excedente e a origem do limite; arco e traços vão `aria-hidden`.

## Versões

- [`v1_meta-de-agendas-em-arco`](./v1_meta-de-agendas-em-arco/): arco de 240 graus com um único valor contra a meta, mínimo e máximo reais nas duas pontas, `cornerRadius` zerado perto de zero e a origem da meta escrita por extenso. Previews: [escuro](./v1_meta-de-agendas-em-arco/preview.svg) e [claro](./v1_meta-de-agendas-em-arco/preview-claro.svg).
- [`v2_fechamentos-acima-da-meta`](./v2_fechamentos-acima-da-meta/): o realizado passa da meta; o domínio alarga só o suficiente para o excedente caber, a meta vira traço tracejado dentro do arco (não mais o fim da escala) e o trecho excedente empilha em `--positive` com ícone e percentual sobre a própria meta. Previews: [escuro](./v2_fechamentos-acima-da-meta/preview.svg) e [claro](./v2_fechamentos-acima-da-meta/preview-claro.svg).
- [`v3_filas-na-mesma-escala`](./v3_filas-na-mesma-escala/): três gauges lado a lado com domínio comum calculado sobre o conjunto e a origem do teto escrita uma vez para as três; uma fila em zero medido (arco de fundo sozinho, número 0) e uma sem coleta (contorno tracejado, ícone `Unplug`, `formatUnavailable()`, nunca 0%). Previews: [escuro](./v3_filas-na-mesma-escala/preview.svg) e [claro](./v3_filas-na-mesma-escala/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue `data` à seleção real da página; o default de cada versão fica só como amostra.
2. A moldura é `card`: embrulhe em `VisualCard` com altura no corpo (`h-40` a `h-56` para v1 e v2; `h-64` a `h-72` para o painel de três filas da v3, que precisa de espaço para rótulo e par de contagens abaixo de cada arco).
3. O mínimo, o máximo e a meta são decisão de negócio, não de estilo: passe os três (e a frase de origem) a partir da régua acordada com o dono da métrica, nunca hardcoded fora do dado. Sem uma origem que se escreva em uma frase, não publique a peça: é exatamente o problema que este modelo resolve.
4. Antes de reusar a v1 para um caso que pode passar de 100%, troque para o desenho da v2 (domínio alargado e traço de meta interno): a v1 trava a meta no fim da escala e o excedente desaparece em silêncio.
5. Na v3, o domínio comum (`Math.max` sobre as capacidades do conjunto) precisa ser recalculado a cada troca de filas exibidas; nunca copie um número fixo de outra tela.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e abra a página nos dois temas e a 390 px de largura: o rótulo do traço de meta e o das pontas, por saírem fora do corpo do arco, são os primeiros a cortar num cartão estreito demais.

## Referências

- [Recharts, RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/): `startAngle`, `endAngle`, `innerRadius`, `outerRadius` e `barSize` do arco.
- [Recharts, RadialBar](https://recharts.github.io/en-US/api/RadialBar/) e [PolarAngleAxis](https://recharts.github.io/en-US/api/PolarAngleAxis/): `background`, `cornerRadius`, `type` e `domain` explícito, a parte que a maioria dos exemplos da internet esquece.
- [shadcn/ui, Radial Charts](https://ui.shadcn.com/charts/radial): variantes prontas sobre Recharts, base para o número central herdando o contexto do gráfico.
- [shadcn, A radial chart with a custom shape](https://www.shadcn.io/patterns/chart-radial-shape): uso de `endAngle` parcial para virar o anel em arco de gauge com rótulo central.
- [AG Charts, Radial Gauge](https://www.ag-grid.com/charts/react/radial-gauge/): a distinção declarada entre barra e ponteiro, e a recomendação de barra para faixa contínua com limiar, que sustenta a régua deste modelo de nomear a origem do limite.
- [Highcharts, Solid gauge](https://www.highcharts.com/demo/highcharts/gauge-solid): o arco preenchido como formato padrão de biblioteca, referência de proporção entre `innerRadius` e `outerRadius`.
- [Behance, Gauge Chart](https://www.behance.net/gallery/233895453/Gauge-Chart): arcos para métricas do mês, referência para por que cada arco precisa do número escrito dentro.
- [Behance, Theme and UI Design for Charts, Gauges and Maps](https://www.behance.net/gallery/65301405/Theme-and-UI-Design-for-Charts-Gauges-and-Maps): tratamento de tema, grade e tipografia; a parte de ponteiro foi descartada.
- [Estudo da família](../../_estudo/familias/13_progresso-meta-e-gauge.md): anatomia completa, o ponto delicado do `PolarAngleAxis` e as versões sugeridas deste modelo.
- [Catálogo da família](../../_estudo/catalogo/13_progresso-meta-e-gauge.json): caso de uso, o que cada versão demonstra e canvas sugerido.
- [CONTRATO.md](../../CONTRATO.md): seção 17, em especial ANO-3, ROT-7 e COR-9, usadas no traço de meta, no halo do rótulo e na proibição de sombra ou gradiente no arco.
- [Padrão de acabamento, estudo](../../_estudo/00_acabamento.md): armadilha 2 sobre o gauge e armadilha 19 sobre a meta que some com `discard`.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Nenhum bloqueante nas três versões; os pontos abaixo são acabamento e
limite conhecido do tema, registrados para quem for copiar o modelo._

- **Todas as versões:** o trilho de fundo usava `--surface-overlay`, que no tema claro vale `#ffffff`,
  o mesmo valor de `--surface-raised`; o arco de fundo sumia por inteiro no claro e o preenchido
  ficava sem a régua que diz quanto falta. Corrigido em 2026-09-29: as três versões pintam o
  `background` em `--surface-sunken`, e na v3 a fila sem coleta segue em contorno tracejado de
  `--line-strong`.
- **v1:** a linha de leitura e a frase de origem da meta saem truncadas no canvas do preview
  (`setembro de 2…`, `planejamento comercial j…`); a leitura sobrevive, o ano e o fim da frase não.
- **v1:** `ratio` é travado por `Math.min(1, value / target)`, então um realizado acima da meta
  imprimiria `100,0%` sem aviso; o caminho certo é a v2, e as `notes` já dizem isso.
- **v2:** o `MetaTick` é irmão anterior aos dois `RadialBar`, então o arco pinta por cima do traço
  tracejado e sobra só o trecho fora do raio externo; o rótulo `meta 20` e a emenda entre o ciano e
  o verde seguram a leitura, mas o traço "sobre o arco" da Anatomia não é o que sai no PNG.
- **v2:** o trecho excedente nasce com `cornerRadius` nas duas pontas e encosta no ciano só pelo
  raio médio, o que faz o verde ler como pílula solta em vez de continuação do mesmo arco.
- **v2:** `MinLabel` e `CenterLabel` desenham `<text>` sem `aria-hidden`, diferente da v1; sem efeito
  prático porque a raiz é `role="img"`, mas quebra a simetria entre as versões.
- **v3:** no tema claro a fila em zero medido fica só com o número `0` e o par `0,0% (0 de 25)`,
  sem nenhum arco, porque o trilho é invisível ali; é a demonstração de "zero medido com o arco de
  fundo sozinho" que se perde num dos dois temas, e o contorno tracejado usado na fila sem coleta
  resolveria também esse caso.

_Revisão de 2026-10-14, sobre o código de 2026-09-28 (trilho em `--surface-sunken`). O trilho agora
aparece nos dois temas, inclusive na fila em zero da v3. Dois pontos da revisão anterior mudaram de
peso e foram para o parecer em `validation/revisao_13_progresso-meta-e-gauge__05_gauge-de-arco-preenchido_2026-10-14.md`:
o `57` da v1 encosta no arco (bloqueante) e o rodapé cortado da v2 perde o domínio (bloqueante pela
emenda da TIP-7 de 2026-09-28). O que segue é nota, não reprova._

- **v1:** a linha de leitura corta em `setembro de 2…`; a cauda perdida é o ano, o achado vem antes
  e a frase acessível tem o resto, então a TIP-7 permite, mas a data partida lê mal (`formatMonthShort`
  ou quebra em duas linhas).
- **v1:** o rodapé corta em `planejamento comercial j…`; passa nas duas condições da TIP-7.
- **v1:** `ratio` devolve 0 quando `target` é 0 (aviso AGREGACAO-ZERO, dívida conhecida): a peça
  escreveria `0,0% da meta` e `Faltam 0` em vez de `formatUnavailable()`.
- **v1:** `de 90` (em `font-sans`), o `90` do rodapé e o ano da linha de leitura são números em
  Manrope sem `tabular-nums` (TIP-1); sem efeito visível numa linha só.
- **v1:** o `90` sai três vezes (ponta, `de 90` e rodapé); o `de 90` repete a ponta ao lado.
- **v1:** o `meta.json` escreve `endAngle -30` com hífen; o catálogo escreve "menos 30".
- **v1 e v2:** os rótulos das pontas e o traço de meta usam `min(largura, altura) / 2` como raio, sem
  a margem de 5 px nem o vão de banda que o Recharts aplica; na v2 o traço passa 10,8 px além da
  borda externa (o código pretende 5) e os rótulos não acompanham a banda se o canvas mudar.
- **v2:** `+15,0%` deveria sair `+15%` pela NUM-1 (variação inteira a partir de 10%), como o catálogo
  escreve.
- **v2:** o domínio é fixo em 1,2 vez a meta; realizado acima de 24 passa do fim do arco. Um teto
  `Math.max` entre 1,2 vez a meta e o realizado com folga evita o transbordo.
- **v2:** com `target` 0, `over / target` vira infinito na linha positiva e na frase acessível.
- **v2:** continuam valendo as notas de 2026-09-18 sobre o traço de meta pintado por baixo do arco e
  o verde que lê como pílula; a meta segue identificável pelo toco externo, pelo rótulo e pela
  emenda de cor.
- **v2:** o `20` sai três vezes (linha positiva, `meta 20` e rodapé).
- **v3:** `truncate` no nome da fila (a TIP-7 proíbe reticência em nome de marca) e na linha do par de
  contagens, que carrega o número; nada corta no preview, mas num cartão estreito são os primeiros a
  sumir. Deixar quebrar.
- **v3:** o percentual sob cada arco usa a capacidade da própria fila e o arco usa o domínio comum;
  com capacidades diferentes o texto e o arco divergem. O dado de amostra tem as três capacidades
  iguais, então o caso não é exercitado.
- **v3:** `72,0% (18 de 25)` em Manrope sem `tabular-nums` (TIP-1).
- **v3:** o contorno da fila sem coleta em `--line-strong` mede 1,8:1 contra o cartão; vale pela saída
  da TOK-1 (dois estados de ausência, um em poço e outro em contorno) e porque a palavra e o ícone
  carregam o estado.

_Correção de 2026-10-14: v1 com o número em 26 px (20 px com três algarismos), linha de base mais alta e `CenterLabel` desenhado depois do `RadialBar`; v2 com o rodapé sem `truncate`, domínio do arco dito primeiro e levado à frase acessível, e número central com corpo proporcional ao miolo do arco._

_Revisão de 2026-10-14, segunda passada, sobre a correção acima. Os dois bloqueantes saíram: a
tinta do `57` da v1 fica a 8 px do arco nos dois temas (medido no PNG de 2x, pixel de texto puro
contra pixel de arco puro), e o rodapé da v2 diz o fim do arco inteiro, em duas linhas. v1 e v2
aprovadas. O que segue é nota, não reprova._

- **v1:** o `CenterLabel` vem depois do `RadialBar` no JSX, mas o Recharts 3 pinta o setor preenchido
  numa camada própria, e no `preview.svg` o `<path>` do arco continua depois do `<text>` do número;
  a nota de correção acima promete uma ordem que o render não entrega. Sem consequência hoje, porque
  a folga é de 8 px, e com três algarismos em 20 px a conta dá folga acima de 7 px.
- **v1:** continuam valendo as notas anteriores sobre a leitura cortada em `setembro de 2…`, o rodapé
  cortado em `planejamento comercial j…`, o ramo de `target` 0 e o `de 90` em Manrope sem
  `tabular-nums`.
- **v1 e v2:** os deslocamentos do número e dos rótulos estão escritos no meio do JSX, e não como
  constantes nomeadas no topo (seção 5): `cy - 1`, `cy + 16` e o par `20 : 26` na v1; `0.5 * 0.58 * 0.8 - 4`,
  `outer + 5`, `inner - 4`, `outer + 20` e o fator `1.1` na v2.
- **v2:** o rodapé em duas linhas tirou 29 px do corpo do arco (de 111 para 82 px). O raio externo caiu
  para 33 px e a banda para 9 px, abaixo do piso geral de 12 px da ESP-2 (aviso, sem medição atrás), e
  o arco ocupa um quinto da largura do cartão. Tudo segue legível nos dois temas; um canvas por número
  mais alto, declarado pela GEO-1, devolveria o arco da v1.
- **v2:** o corpo do número central usa `0.58` fixo como fração do raio interno, enquanto
  `INNER_FRACTION` vale `0.64`; o `23` saiu em 15 px com 12 px de folga até a borda interna e caberia
  maior se a conta derivasse da constante.
- **v2:** `+15,0%` segue com uma casa na linha positiva e na frase acessível (NUM-1 pede `+15%` a partir
  de 10%). A frase tem 242 caracteres, a 8 do teto da ACE-1, e cresce com o nome da métrica.
- **v2:** a linha positiva usa `truncate` e a cauda dela carrega a meta (`da meta de 20`); nada corta no
  preview, mas a TIP-7 só admite reticência quando a cauda não leva número. Deixar quebrar.
- **v2:** os números do cabeçalho, da linha positiva e do rodapé estão em Manrope sem `tabular-nums`
  (TIP-1), sem efeito visível.
- **v2:** continuam valendo as notas anteriores sobre o traço de meta pintado por baixo do arco (o que
  se vê é o toco externo e o traço nas quinas da emenda entre o ciano e o verde), o verde que lê como
  pílula, o domínio fixo em 1,2 vez a meta e o ramo de `target` 0.
