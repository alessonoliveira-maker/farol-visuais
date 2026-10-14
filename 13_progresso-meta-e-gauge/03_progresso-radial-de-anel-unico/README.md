# Progresso radial de anel único

## O que é

Um anel fechado de 360 graus com o trecho cumprido preenchido e o número no centro. É o radial mais inofensivo da família, porque o leitor reconhece "quase fechado" e "mal começou" sem precisar ler ângulo. Em Recharts, `RadialBarChart` começando no topo (`startAngle={90}`, `endAngle={-270}`, uma volta completa no sentido horário), com `PolarAngleAxis` numérico e domínio explícito: sem ele o Recharts normaliza pelo maior valor da série e um percentual isolado vira anel cheio em silêncio. O anel esconde por natureza o denominador (70% de quê, até quando), então todo cartão deste modelo escreve o valor absoluto e o total ao lado do percentual, nunca só o percentual sozinho.

## Quando usar

- Um percentual isolado contra 100%, ou contra uma meta menor que 100%, num cartão pequeno.
- Até quatro cartões com percentuais independentes lado a lado, cada um lido sozinho, nunca comparado ao vizinho.
- Avanço contra a meta repartido por até quatro origens, com o total no centro e a legenda ao lado.
- Leitura de ritmo com um tique na fração do período já decorrida, sem consultar relógio no componente.

## Quando evitar

- Comparar valores entre itens: o comprimento do arco lê pior que o de uma barra; use o bullet chart (13/02) ou a barra horizontal (família 02).
- Coluna de tabela com dezenas de anéis: é barra em célula (14/01), não um anel por linha.
- Composição de um total sem meta declarada: é rosca (família 07), não progresso.
- Mais de quatro origens no anel empilhado: vira confete; use barra empilhada (família 02).
- Valor que passa muito de 100% como caso comum: a barra com excedente (13/01) mostra o tamanho do excesso melhor que um anel que só trava.

## Anatomia

1. **Anel de fundo (trilho):** `RadialBar` com `background={{ fill: 'var(--surface-sunken)' }}`, visível nos dois temas mesmo sem valor algum (`--surface-overlay` vale `#ffffff` no tema claro, igual ao cartão, e apagava o trilho; corrigido em 2026-09-18).
2. **Anel preenchido:** `RadialBar` com `fill` em `--chart-1` (série única) ou `--negative` quando o valor está em estouro, `cornerRadius` reto perto de 0% e de 100% para a ponta arredondada não desenhar ângulo que o valor não tem.
3. **Eixo polar:** `PolarAngleAxis` numérico, `tick={false}`, `domain` explícito no maior valor de referência (meta ou 100), nunca deixado ao Recharts calcular pelo maior da série.
4. **Número central:** percentual grande em `kpi-number`, sempre seguido do par valor absoluto e total (`formatCurrencyCompact` ou `formatInt`), num `div` absoluto fora do `viewBox`, porque é mais simples de estilizar que um `Label` polar. O furo é circular e estreita à medida que o texto se afasta do centro: quando o par não cabe numa linha só sem cruzar o arco, ele quebra em duas linhas curtas (v2, v4) em vez de encolher abaixo do piso de 11 px; uma legenda extra que não faz parte do par (o mês, em v1) sai do furo e vira uma linha própria abaixo do anel inteiro.
5. **Tique de ritmo (v2):** traço radial curto na posição da fração decorrida, calculado por uma função polar (`polarPoint`) a partir de `startAngle`, `endAngle` e a fração vinda do dado.
6. **Segmentos por origem (v3):** múltiplos `RadialBar` com `stackId` compartilhado, cor por slot categórico fixo e contorno de 1 px em `--surface-raised` entre segmentos, nunca ordenados pelo valor.

## Versões

- [`v1_agendas-do-mes-no-anel`](./v1_agendas-do-mes-no-anel/): anel básico com as agendas marcadas pela pré-vendas contra a meta do mês; ponta reta perto das bordas, trilho visível nos dois temas e o mês escrito numa linha própria abaixo do anel, fora do furo. Previews: [escuro](./v1_agendas-do-mes-no-anel/preview.svg) e [claro](./v1_agendas-do-mes-no-anel/preview-claro.svg).
- [`v2_receita-do-mes-com-tique-de-ritmo`](./v2_receita-do-mes-com-tique-de-ritmo/): o mesmo anel com um tique na fração do mês decorrida e a diferença contra o ritmo em pontos percentuais, com sinal e ícone dizendo se o mês está adiantado ou atrasado; o par de valores quebra em duas linhas curtas para caber no furo sem cruzar o arco. Previews: [escuro](./v2_receita-do-mes-com-tique-de-ritmo/preview.svg) e [claro](./v2_receita-do-mes-com-tique-de-ritmo/preview-claro.svg).
- [`v3_meta-de-receita-por-origem`](./v3_meta-de-receita-por-origem/): anel empilhado por origem (cliente atual, indicação, inbound, mídia paga), total no centro e legenda lateral com valor e percentual de cada parte, ordem sempre vinda do dado. Previews: [escuro](./v3_meta-de-receita-por-origem/preview.svg) e [claro](./v3_meta-de-receita-por-origem/preview-claro.svg).
- [`v4_orcamento-com-estouro-e-ausencia`](./v4_orcamento-com-estouro-e-ausencia/): três pequenos múltiplos na mesma escala percentual, um caso de estouro (anel travado, excedente escrito abaixo dele em `--negative`), um caso de zero medido (trilho visível nos dois temas e o número 0) e um caso sem coleta (trilho tracejado e `formatUnavailable()`); em cada anel o par consumido/planejado quebra em duas linhas curtas para caber no furo menor dos três pequenos múltiplos. Previews: [escuro](./v4_orcamento-com-estouro-e-ausencia/preview.svg) e [claro](./v4_orcamento-com-estouro-e-ausencia/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue `data` à seleção real da página; o default de cada versão fica só como amostra.
2. A moldura é `card`: embrulhe em `VisualCard` com altura no corpo (`h-40` a `h-48` para o canvas `kpi-alto` das v1 e v2; `h-56` a `h-64` para o canvas `card` das v3 e v4, que precisa de espaço lateral ou de três colunas).
3. Nunca chame o componente sem `domain` explícito no `PolarAngleAxis`: sem ele, um valor único normalizado pelo próprio Recharts vira anel cheio mesmo estando longe da meta.
4. Ao trocar a meta ou o total por dado real, confira que o par valor absoluto e total continua escrito no centro: é a regra desta família contra o anel virar decoração que esconde o denominador.
5. Na v2, a fração decorrida do período chega pronta no dado (calculada na página, a partir da data de corte); o componente nunca chama `new Date()`.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e abra a página nos dois temas e a 390 px de largura: o texto central é o primeiro a colidir num cartão estreito demais.

## Referências

- [Estudo da família](../../_estudo/familias/13_progresso-meta-e-gauge.md): seção 11, anatomia completa, o ponto delicado de passar de 100% e as versões sugeridas deste modelo.
- [Catálogo da família](../../_estudo/catalogo/13_progresso-meta-e-gauge.json): caso de uso, o que cada versão demonstra e o canvas sugerido.
- [CONTRATO.md](../../CONTRATO.md): seção 17, em especial COR-8 (ordem dos slots categóricos), ROT-7 (halo obrigatório) e EIX-1/EIX-8 (domínio explícito e sem eixo duplo).
- [Recharts, RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/): padrões de `startAngle`, `endAngle`, `innerRadius` e `outerRadius`.
- [Recharts, RadialBar](https://recharts.github.io/en-US/api/RadialBar/) e [PolarAngleAxis](https://recharts.github.io/en-US/api/PolarAngleAxis/): `background`, `cornerRadius`, `minPointSize`, `type` e `domain`.
- [shadcn, A radial chart with text](https://www.shadcn.io/examples/a-radial-chart-with-text): `Label` central posicionado pelo `viewBox`, receita adaptada aqui como `div` absoluto.
- [shadcn, A radial chart with stacked sections](https://www.shadcn.io/examples/a-radial-chart-with-stacked-sections): `stackId` compartilhado e o rótulo central com a soma das partes, base da v3.
- [Tremor, ProgressCircle](https://www.tremor.so/docs/visualizations/progress-circle): variantes de estado (neutro, atenção, erro, sucesso), referência para a cor de estouro da v4.

## Correção de 2026-09-18

Rodada única de correção depois da reprovação de v1, v2 e v4 (v3 já estava aprovada e não foi tocada). Causa comum dos dois problemas bloqueantes das três versões: o furo do anel é circular e estreita conforme o texto se afasta do centro, então uma linha larga o bastante para caber na largura total do cartão ainda cruza o arco quando cai fora da linha central. Correção na origem, não cosmética:

- **v1** (`agendas em setembro de 2026` cruzando o arco, ESP-4/ROT-7/ACE-3): a linha do mês não faz parte do par valor/total exigido pela anatomia, então saiu do furo inteiro e virou uma linha própria abaixo do anel (mesmo padrão já usado pelo `05_gauge-de-arco-preenchido/v1`, que escreve a origem da meta abaixo do arco). Trilho trocado de `--surface-overlay` para `--surface-sunken`, visível nos dois temas.
- **v2** (`R$ 2,2 mi de R$ 3,0 mi` cruzando os dois lados do arco, mesmos códigos): esse par é o exigido pela anatomia e não podia sair do centro, então quebrou em duas linhas curtas (`R$ 2,2 mi` / `de R$ 3,0 mi`) e o furo abriu de 80% para 82% do raio. Trilho corrigido do mesmo jeito que a v1.
- **v4** (`R$ 44,8 mil de R$ 40,0 mil` cruzando o anel de estouro, mesmos códigos, mais o trilho do anel de zero medido invisível no tema claro, checklist 1 e 25): mesma quebra em duas linhas aplicada aos três anéis, furo aberto de 70% para 74% do raio (com três anéis dividindo a largura do cartão, o furo de cada um é bem menor que o de um anel único) e trilho trocado para `--surface-sunken`, o que resolve o bloqueante do caso de zero medido.
- Em nenhuma versão o `npm run check` acusa a colisão: o par central mora em HTML (`foreignObject`/`div`), e COLISAO-TEXTO e CONTRASTE-TEXTO não medem texto em HTML (ponto cego já declarado no README antes desta rodada). A verificação foi visual, nos dois PNGs de cada tema, depois do render.
- `{...AXIS_PROPS}` espalhado em todo `PolarAngleAxis` das três versões corrigidas (decisão do dono para este modelo); como `tick={false}` e `axisLine={false}` continuam declarados depois do spread, o eixo continua invisível como antes, sem mudança visual.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19, segunda leitura, feita depois da rodada de correção: as quatro versões passaram sem bloqueante (`npm run check` com 0 com erro e os dois PNGs de cada versão conferidos). Os itens abaixo ficam registrados como nuance, nenhum deles reprova._

- v2: o tique de ritmo é um traço cinza sem nome nem valor ao lado. Quem lê só a imagem não sabe que aquilo é a fração decorrida do mês; a ANO-2 pediria nome e valor na anotação. A leitura principal não depende dele, porque o centro escreve a diferença em pontos percentuais.
- v2: a diferença de ritmo sai por `formatDecimal` com o "p.p." escrito à mão, e não por `formatPercentPoints`, que o catálogo cita. O desvio está justificado no campo `notes` e é o mesmo já adotado em outros modelos; fica registrado só para não parecer esquecimento.
- v3: com o trilho em `--surface-overlay`, ainda invisível no tema claro na leitura de 2026-09-19 (a v3 não foi tocada naquela rodada por não estar entre as reprovadas), o trecho que faltava para a meta sumia da figura e o leitor precisava do "65%" escrito para saber quanto restava. O visual continuava honesto, porque o percentual e o par de valores estão no centro. Corrigido em 2026-09-29: a v3 foi para `--surface-sunken`, como as irmãs.
- v4: o rótulo de cada anel vive abaixo dele em `--text-muted` e o nome da plataforma fica em `truncate`. Com um nome mais longo que os três do dado, o corte vai aparecer; um teste com nome longo no `data.ts` mediria isso.
- v2: a base da diferença de ritmo, os 60% do mês já decorridos, só aparece na frase acessível e no traço do tique, nunca escrita na tela ao lado de "+14,0 p.p.". A NUM-4 pede a base na mesma linha da variação; aqui a leitura não engana porque o tique marca a posição do ritmo, mas uma anotação curta com nome e valor resolveria os dois pontos de uma vez.
- v3: o `PolarAngleAxis` é o único das quatro versões sem `{...AXIS_PROPS}` espalhado. Como o eixo tem `tick={false}` e `axisLine={false}`, nada muda no desenho; vale só como diferença de padrão entre irmãs do mesmo modelo.
- v3: o percentual da legenda é medido contra a meta, não contra o total já realizado, e por isso as quatro linhas somam os 65% do centro. A leitura fecha, mas o cabeçalho da coluna não existe e o par só se entende depois de somar; um rótulo de coluna ao colar no Farol tiraria a dúvida.
- v4: o caso sem coleta desenha o trilho tracejado e escreve `formatUnavailable()`, porém sem o ícone `Unplug` que a EST-2 descreve. A ausência continua distinta do zero medido pelo traço e pela palavra, então é acabamento, não sentido.

## Pendências conhecidas

- **Fechada em 2026-09-29.** A v3 seguia com o trilho em `--surface-overlay` (invisível no tema claro), fora do escopo da rodada de 2026-09-18 por não estar entre as versões reprovadas; a varredura do token trocou o `TRACK_FILL` da v3 por `--surface-sunken`, e as quatro versões do modelo desenham o trilho nos dois temas.
- v2: tique de ritmo sem rótulo de nome e valor (ANO-2) segue sem anotação, por ser observação não bloqueante.
- v4: corte por `truncate` do nome da plataforma com rótulo longo segue sem caso de teste no `data.ts`.
