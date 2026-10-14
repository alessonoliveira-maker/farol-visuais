# Dispersão conectada

## O que é

Os pontos de uma única entidade, um por período, são ligados por segmentos retos na ordem do tempo, e a linha desenha a trajetória nas duas medidas ao mesmo tempo. Mostra viradas que duas linhas separadas escondem, mas cobra caro do leitor: ele acompanha quatro coisas mudando juntas, a posição em X, a posição em Y e a direção de cada uma. Início vazado, fim cheio e rótulo de período nas pontas e nas viradas são obrigatórios para a trajetória não virar um fio sem sentido de leitura.

## Quando usar

- Trajetória de uma entidade em duas medidas, como CPL e taxa de qualificação de uma plataforma nos últimos 12 meses.
- Mostrar o mês em que as duas medidas mudaram de direção juntas.
- Uma ou duas entidades, de 6 a cerca de 24 períodos.
- Público analítico que já conhece as duas medidas.

## Quando evitar

- Mais de duas entidades no mesmo plano: vira espaguete; mostre uma por vez ou use pequenos múltiplos (modelo 11).
- Público não técnico: duas linhas empilhadas ou indexadas no tempo (família 04) contam o mesmo com menos esforço.
- Só dois momentos por entidade: use antes e depois com setas (modelo 06).
- Curva suavizada: `monotone` inventa caminho entre meses; a ligação é sempre linear.

## Anatomia

1. Eixo X (CPL) e eixo Y (taxa de qualificação) numéricos, com domínio explícito e estável e unidade em cada tique (`formatCurrencyAxis`, `formatPercent`), pela CONTRATO EIX-4 e EIX-6.
2. Grade nos dois sentidos com `CartesianGrid` em `--line-subtle`, pela EIX-3b e não pelo `vertical={false}` da EIX-3: os dois eixos são quantitativos e lidos por posição, então ali a grade é a régua do desenho. Sem tique e sem linha de eixo, o que exige escrever `tickLine={false}` e `axisLine={false}` DEPOIS de `{...AXIS_PROPS}`, porque o módulo compartilhado traz `axisLine` ligado e em JSX vence a última propriedade (EIX-5).
3. A ligação é sempre linear, nunca `monotone`, que inventaria caminho entre os meses medidos. Com uma cor só a `v1` usa `Scatter` com `line` e `lineJointType="linear"`; quando o traço precisa mudar de cor, de espessura ou quebrar num vão, ele vai numa camada própria dentro do `ScatterChart`, um `<line>` por par de meses vizinhos, com as posições vindas de `useXAxisScale` e `useYAxisScale`.
4. Marca do primeiro mês em anel vazado (`shape` customizado), marca do último mês em ponto cheio, e os meses do meio em ponto pequeno vazado com contorno na cor do traço, exceto a virada, que leva ponto cheio mais um anel em volta como segundo canal (ACE-2).
5. Rótulo de mês (`formatMonthShort`) só no início, no fim e na virada, calculada em TypeScript pela mudança de sinal entre um mês e o seguinte, nunca escrita à mão. A medida em que se procura a virada é a que muda de direção: a `v1` procura no CPL, a `v2` e a `v3` procuram na taxa de qualificação, porque nelas o CPL cai do começo ao fim e não vira nunca.
6. Dica própria (`ChartTooltip`) com o mês e os dois valores já formatados, porque os meses do meio da trajetória não têm rótulo direto.
7. Linha de leitura acima do gráfico, calculada do dado: nomeia o mês da virada quando existe, ou diz que as duas medidas seguem juntas (ANO-5).
8. Traço em token de DADO, nunca em `--line-strong`: aqui o traço carrega a relação, e pela ACE-6 isso o obriga a 3:1 contra o cartão. Medido contra `--surface-raised`: `--chart-1` 9,50:1 no escuro e 6,00:1 no claro, `--text-muted` 5,21:1 e 5,37:1, `--line-strong` 1,79:1 e 1,83:1, que é o que o tira da lista.
9. Anotação de no máximo 50 caracteres em 11 px e `--text-muted`, com halo da cor do cartão, no máximo duas por visual (ANO-1, ANO-2, ROT-7).
10. Vão de período sem coleta: a série quebra em pernas, nenhum segmento atravessa, e o vão recebe um anel vazado e tracejado maior que qualquer marca de dado mais a palavra que diz a causa.

## Versões

- `v1_trajetoria-de-uma-plataforma`: CPL e taxa de qualificação da plataforma A, mês a mês nos últimos 12 meses. Demonstra `Scatter` com `line` e `lineJointType` linear sobre dados ordenados por mês, início em anel vazado e fim em ponto cheio com rótulo de mês, rótulos de mês só no início, no fim e na virada calculada do CPL, e domínio explícito nos dois eixos com unidade.
- `v2_virada-anotada`: a virada de público da plataforma A em doze meses, com o CPL caindo do começo ao fim e a qualificação subindo até nov/25 e caindo depois. Demonstra anotação curta ancorada no mês da virada com halo sobre a linha, o cotovelo da virada aceso com o resto da trajetória em neutro, duas anotações no visual, que é o teto da ANO-1, e a virada calculada da qualificação e não do CPL.
- `v3_tres-plataformas-uma-em-foco`: três plataformas nos mesmos doze meses, uma acesa pela prop `highlightId`. Demonstra trajetórias de contexto em traço fino neutro sem rótulo de mês, ordem de desenho com a acesa por último, frase acessível que descreve só a trajetória em foco, e anticolisão de rótulo com oito posições candidatas presas ao plano.
- `v4_mes-sem-coleta`: doze meses de calendário com fev/26 sem coleta, na lista com os campos em nulo. Demonstra a série dividida em duas pernas sem ligar por cima do buraco, anel tracejado e vazado marcando o vão com o mês escrito ao lado, e mês ausente nunca interpolado nem lançado como zero.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/ConnectedScatterTrajectory/`.
2. Troque o `import` do `./data` pelo dado real da plataforma; a ordenação por mês e a virada são recalculadas sozinhas, e a virada não precisa vir marcada no dado. Confira qual das duas medidas vira no seu recorte: `findTurnIndex` olha uma só, e nas versões deste modelo ela é o CPL na `v1` e a taxa de qualificação na `v2` e na `v3`.
3. Ajuste `DOMAIN_X`, `TICKS_X`, `DOMAIN_Y` e `TICKS_Y` para a faixa real das duas métricas; um domínio fixo evita que a trajetória mude de escala a cada filtro.
4. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
5. Na `v3`, passe `highlightId` com o `platformId` da trajetória que a página selecionou; as outras duas caem sozinhas para o traço fino neutro, e a frase acessível se refaz em volta da nova acesa.
6. Na `v4`, o mês sem coleta continua na lista, com os campos em nulo: não filtre a linha fora, porque linha ausente é indistinguível de mês esquecido, e não a lance como zero.
7. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [From Data to Viz, connected scatter](https://www.data-to-viz.com/graph/connectedscatter.html): uso para duas variáveis no tempo sem eixo duplo e o alerta de espaguete com mais de uma entidade.
- [Vega-Lite, Connected Scatterplot](https://vega.github.io/vega-lite/examples/connected_scatterplot.html): o canal `order` pelo período, nunca pela posição do ponto no plano.
- [Recharts, Joint Line Scatter Chart](https://recharts.github.io/en-US/examples/JointLineScatterChart/): `line` e `lineJointType` no `Scatter`, base da implementação desta versão.
- [Nightingale, Connected Scatterplots Make Me Feel Dumb](https://nightingaledvs.com/connected-scatterplots-make-me-feel-dumb/): o argumento das quatro coisas mudando ao mesmo tempo e a alternativa de linhas empilhadas ou indexadas.

## Onde a especificação do catálogo cedeu ao CONTRATO

_Leva de 2026-09-28, ao produzir a `v2`, a `v3` e a `v4`._

- **Neutro do traço, nas três versões.** A tabela 17.2 indica `--line-strong` como neutro, e a `ACE-6` diz que o traço que CARREGA a relação é dado e precisa de 3:1 contra o cartão. O teste separa os dois casos: tape o traço desta família e não sobra informação nenhuma, porque é ele que diz qual mês virou qual. Medido contra `--surface-raised`, `--line-strong` dá 1,79:1 no escuro e 1,83:1 no claro e está fora; o neutro passou a ser `--text-muted` (5,21:1 e 5,37:1) e a cor acesa `--chart-1` (9,50:1 e 6,00:1). O "traço fino" que a `v3` pede foi resolvido por ESPESSURA de 1,25 px e não por cor apagada nem por opacidade, porque espessura não desconta contraste e opacidade desconta (`ACE-5`). Medido a mais, e é o número que nenhuma guarda vê porque `CONTRASTE-MARCA` sai `preview_com_transform` em dispersão: a cor acesa contra a neutra, MARCA CONTRA MARCA, dá 1,82:1 no escuro e 1,12:1 no claro. No tema claro as duas têm praticamente a mesma luminância, então a cor sozinha NÃO separa o destaque, e por isso ele carrega sempre outros canais: espessura de traço, anel em volta da marca, rótulo de mês que só ele tem e peso 700 no nome (`ACE-2`, `COR-2`).
- **Rampa sequencial recusada, na `v3`.** Trajetória no tempo puxa rampa para indicar a ordem dos meses, e dos sete degraus de `--seq-*` só o 5, o 6 e o 7 passam de 3:1 nos dois temas: 1,14 / 1,58 / 2,29 / 3,38 / 4,89 / 6,96 / 10,12 no escuro e 1,21 / 1,49 / 1,92 / 2,60 / 3,72 / 5,45 / 8,29 no claro. Doze meses em três degraus úteis não existe, então a ordem do tempo é carregada pela POSIÇÃO dos pontos, pelo anel vazado da partida contra o ponto cheio da chegada e pelo rótulo de mês escrito, nunca por degrau de cor.
- **O segmento da virada virou o cotovelo inteiro, na `v2`.** O catálogo pede "segmento da virada em cor de destaque", no singular. Um segmento só mostra uma direção, e o que a versão afirma é a MUDANÇA de direção, que precisa dos dois segmentos que encostam na virada. Acendem os dois.
- **A virada é da qualificação, não do CPL, na `v2`.** A `v1` deste modelo procura a virada no CPL. No dado da `v2` o CPL cai nos doze meses, então uma virada procurada nele não existiria e a peça sairia sem destaque nenhum. A busca migrou para a taxa de qualificação, que é a medida que muda de direção, e o caso de uso do catálogo é exatamente esse.
- **Ponto fantasma sem valor, na `v4`.** O catálogo pede "ponto fantasma tracejado" e a `EIX-10` proíbe afirmar valor para o que não foi medido. O anel fica no meio do vão, mas é vazado, tracejado, tem raio de 7 px, maior que qualquer marca de dado da peça, e NENHUM segmento chega até ele, então nada no desenho afirma caminho nem posição. Quem fecha a leitura é a palavra "sem coleta" ao lado, porque forma sozinha não diz por que o mês não está lá.
- **`formatUnavailable()` não entra na `v4`.** A `EST-2` manda escrever a ausência com ela no lugar do NÚMERO, e no plano não existe casa de número a preencher: o mês simplesmente não tem marca. O que a peça precisa dizer é a causa, que é o que a `EST-4` pede de uma comparação sem base, e a causa é "sem coleta".
- **`EIX-3b` contra `EIX-3`, nas três versões.** Grade nos DOIS sentidos, em `--line-subtle`, sem tique e sem linha de eixo: os dois eixos são quantitativos e lidos por posição, e ali a grade é a régua do desenho. Não é o `vertical={false}` da regra geral.
- **`EIX-5` escrita depois do espalhamento, nas três versões.** `AXIS_PROPS` traz `axisLine` LIGADO, então `axisLine={false}` e `tickLine={false}` vêm DEPOIS de `{...AXIS_PROPS}` nos dois eixos de cada peça; a ordem é o que decide, e a guarda `EIXO-CALMO` resolve o valor efetivo. A `v1` deste modelo já escrevia `axisLine={false}` e passa; cinco versões vizinhas da família não escrevem e estão na fila de dívida.
- **Ferramenta, e aqui o enunciado geral não vale.** Corre a ideia de que em dispersão as guardas de marca saem `preview_com_transform`, e nos vizinhos de bolhas saem mesmo, nas 12 versões. Nas quatro versões DESTE modelo, medido em 2026-09-28, `CONTRASTE-MARCA` mede 4 de 4 e o que sai sem medir é `ESPESSURA-MARCA`, por `sem_marca_de_barra`. O que nenhuma das duas cobre é marca contra MARCA, porque `CONTRASTE-MARCA` mede contra o cartão: esse número foi calculado à mão pela fórmula da WCAG sobre `app/src/styles/tokens.css`, nos dois temas, e escrito no `notes` de cada versão; os dois PNGs de cada uma foram olhados.

## Observações da revisão (não bloqueantes)

- `v1_trajetoria-de-uma-plataforma`: a virada usa ponto cheio, a mesma linguagem do fim da trajetória, separada dele só por 2 px de raio; quem lê depressa pode tomar `abr/26` por outra ponta. Um segundo canal, como anel duplo ou anotação, distinguiria melhor.
- `v1_trajetoria-de-uma-plataforma`: as duas pernas da trajetória correm quase paralelas, de 8 a 10 px uma da outra, porque CPL e qualificação andam em espelho perfeito no dado; a ordem do tempo só se recupera pelos três rótulos. Um dado com laço mais aberto mostraria melhor o que o modelo tem de próprio.
- `v1_trajetoria-de-uma-plataforma`: a frase da linha de leitura afirma que a qualificação faz o movimento espelhado, e isso não é calculado do dado como o mês da virada; com dado real que não espelhe, a frase passa a dizer o que o gráfico não mostra.
- `v1_trajetoria-de-uma-plataforma`: `Y_AXIS_WIDTH = 44` fica abaixo da faixa de 48 a 64 da EIX-6, que está escrita para tique de moeda; aqui o eixo Y é percentual e 44 basta, mas o número diverge da régua.
- `v1_trajetoria-de-uma-plataforma`: o item 4 da Anatomia diz que os meses do meio saem em ponto pequeno neutro, e o código os desenha vazados com contorno em `var(--chart-1)`; a descrição e o desenho divergem, e quem copiar o modelo pela Anatomia vai procurar um token neutro que não está lá.
- `v1_trajetoria-de-uma-plataforma`: o rótulo de mês sai em `font-sans` sem `tabular-nums`, e ele carrega algarismos do ano; a TIP-1 pede `font-display` no `<text>` de SVG com número.
- `v1_trajetoria-de-uma-plataforma`: o rótulo de mês mistura duas linhas da tabela 17.1, 11 px da linha de tique e anotação com a cor `--text-secondary` da linha de rótulo de categoria; o par medido passa no contraste nos dois temas, mas convém declarar qual dos dois papéis o rótulo ocupa.
- `v1_trajetoria-de-uma-plataforma`: a linha de leitura nomeia o mês da virada e não traz nenhum valor; dizer de quanto a quanto o CPL caiu deixaria a conclusão quantitativa, no espírito da NUM-6.
- `v1_trajetoria-de-uma-plataforma`: os valores dos nove meses do meio vivem só na dica, que não existe no `preview.svg`, no papel nem para quem navega por teclado; a frase acessível cobre apenas o primeiro mês, a virada e o último.
- `v1_trajetoria-de-uma-plataforma`: perto da virada as duas pernas passam a cerca de 17 px uma da outra e o ponto de fev/26 quase encosta no segmento de volta; continua legível, mas é o trecho mais apertado do desenho.
- `v1_trajetoria-de-uma-plataforma`: com o domínio de X começando em `R$ 100` e o menor CPL em `R$ 140`, o quarto esquerdo do plano fica vazio; é o preço do intervalo redondo da EIX-4 e não tem correção dentro da régua.

Revisão de 2026-10-05, as quatro versões rejulgadas pela ACE-6 e aprovadas. O traço que carrega a relação foi medido de novo sobre `tokens.css`: `--chart-1` 9,50:1 no escuro e 6,00:1 no claro, `--text-muted` 5,21:1 e 5,37:1, todos acima de 3:1 contra `--surface-raised`.

- `v1_trajetoria-de-uma-plataforma`: o `data.ts` declara a taxa de qualificação pronta, sem leads nem qualificados, e a frase acessível e a dica escrevem `14,0%` sem o volume; a NUM-1 pede `formatRateWithVolume` e a DAD-1 pede contagens no dado, que é o que a `v2`, a `v3` e a `v4` já fazem. É a primeira coisa a alinhar quando alguém tocar a versão.
- `v1_trajetoria-de-uma-plataforma`: o item 4 da Anatomia diz que a virada leva ponto cheio mais um anel em volta, e a `v1` desenha só o ponto cheio de 3 px; o anel existe na `v2` e na `v3`.
- `v2_virada-anotada`: a anotação da virada fica 11 px acima do centro e o halo dela termina onde começa o anel de 9 px, com sobreposição calculada de 0,75 px na borda de fora do anel; nos dois PNGs o anel sai inteiro, mas a `v3` usa 13 px e deixa folga.
- `v2_virada-anotada`, `v3_tres-plataformas-uma-em-foco`, `v4_mes-sem-coleta`: o CPL da linha de leitura, das anotações e da frase acessível sai por `formatCurrencyAxis`, e a NUM-1 reserva esse formatador ao tique e pede `formatCurrencyCompact` no rótulo direto; nesta faixa de valor os dois imprimem o mesmo texto.
- `v3_tres-plataformas-uma-em-foco`: a frase acessível diz que a qualificação "topa em 33,0%", verbo coloquial e ambíguo; "chega ao topo de" diz o mesmo sem ruído.
- `v3_tres-plataformas-uma-em-foco`: os doze meses da Plataforma C cabem em R$ 10 de CPL e os pontos de contexto se encostam no trecho final; a forma da trajetória ainda se lê, mas os meses não se contam.
- `v3_tres-plataformas-uma-em-foco`: a nota de rodapé descreve o desenho e não o dado, e custa 25 px de plano (GEO-14); o nome na ponta de cada trajetória de contexto já faz esse serviço.
- `v3_tres-plataformas-uma-em-foco`: quando nenhuma das oito posições candidatas fica livre, a anticolisão põe o rótulo na menos ruim e não avisa; com outro recorte, um rótulo pode cair sobre marca em silêncio.
- `v4_mes-sem-coleta`: o anel do vão fica no ponto médio entre jan/26 e mar/26, que é a posição que uma interpolação linear daria; o tracejado, o raio maior, a falta de segmento e a palavra "sem coleta" impedem a leitura como valor, mas o lugar em si não é neutro.
- `v4_mes-sem-coleta`: a nota de rodapé nomeia jan/26 e mar/26 como as bordas do vão, e nenhum dos dois tem rótulo no plano; o leitor deduz quais são pelas pontas soltas das duas pernas.
