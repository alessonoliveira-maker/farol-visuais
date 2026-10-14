# Grade e tira de KPIs

## O que é

Composição de vários cartões numa peça só, nas duas formas que a família absorve: a **tira**, de 3 a 6 métricas *diferentes* que abre uma tela, lida da esquerda para a direita em ordem narrativa; e a **grade de scorecards**, a mesma métrica repetida por *entidade*, lida como "quem está bem e quem está mal" sem abrir tabela. A composição é o que garante altura igual entre cartões, linha de base comum do número, período ou escala declarados uma vez só e, na grade, o mesmo domínio de eixo em todos os micrográficos. HTML com Tailwind; o micrográfico de sparkline ou polyline, quando existe, é SVG puro com geometria própria, sem Recharts, porque cada instância paga observador de redimensionamento e a grade pode passar de uma dezena de cartões.

## Quando usar

- Cabeçalho de tela com 3 a 6 números de abertura, em ordem da causa para o efeito.
- A mesma métrica comparada entre 6 e 24 entidades, como executivos ou squads.
- Tira em que um cartão primário maior define por onde a leitura começa.
- Várias métricas lidas na mesma janela de tempo, comandadas por um seletor único da tira.

## Quando evitar

- Mais de 6 cartões na mesma linha: quebre em duas tiras curtas com subtítulo, cada uma com sua própria ordem narrativa, em vez de espremer uma linha ilegível.
- Métricas de unidades diferentes dentro de uma grade de scorecards: isso é tira, não grade; ou, se o volume de entidades for grande, uma tabela.
- Várias métricas por entidade lidas linha a linha: scorecard em tabela (família 14, modelo 04), porque a grade não sustenta mais de uma métrica por cartão sem perder a escala comum.
- Taxa individual com denominador pequeno em cada entidade: mostre volume absoluto na grade em vez de uma taxa que é ruído promovido a tendência (a v4 mostra a saída quando a taxa é inevitável).
- Cartões que aparecem e somem conforme uma régua é cruzada: [card de exceção](../08_card-de-excecao/), que já nasce como faixa de exceções com o estado calmo ocupando o lugar.

## Anatomia

1. **Faixa da tira:** colunas de largura igual, `grid grid-cols-1 sm:grid-cols-3 items-stretch gap-4`, altura calculada pelo cartão mais alto (`h-full` no cartão, nunca pixel fixo).
2. **Cabeçalho da tira:** período declarado uma vez, em `text-[0.6875rem] text-text-muted`, por `formatMonthShort`, quando é o mesmo para todos os cartões; ou um seletor único de janela em `role="radiogroup"` que reescreve a âncora do delta e a granularidade da tira inteira (v2).
3. **Cartão comum da tira:** rótulo em `text-xs font-medium text-text-secondary`, número em `kpi-number text-3xl leading-none font-semibold text-text-primary` com a unidade colada, e uma linha de variação **reservada em todo cartão** (`min-h-4`), preenchida ou com "sem período anterior medido", para a base do número nunca desalinhar entre colunas.
4. **Cartão primário da tira:** ocupa duas colunas de quatro (`@container` na raiz, `@sm:grid-cols-4` e `@sm:col-span-2` no cartão, por consulta de contêiner e não de janela), número maior e uma sparkline subordinada em SVG puro, sem eixo, grade nem dica, `aria-hidden` porque a frase acessível da raiz já traz a tendência (v2).
5. **Cabeçalho da grade:** declara a ordem (alfabética estável, ou por valor de uma métrica nomeada) e, quando há micrográfico, a escala compartilhada por extenso ("semanal de R$ 0 a R$ 120 mil"), nunca implícita.
6. **Cartão de entidade na grade:** nome truncado com `title` completo, valor em `kpi-number text-sm` (14 px, o número de apoio da tabela 17.1) menor que o do cartão solitário, porque aqui a comparação entre cartões pesa mais que cada número isolado, e a posição no grupo escrita ("3º de 12") quando a ordem é por valor.
7. **Micrográfico da grade:** `polyline` ou `path` em SVG puro, `viewBox` fixo, no **mesmo domínio de eixo em todos os cartões** (EIX-9): nenhuma entidade normaliza pelo próprio mínimo e máximo.
8. **Marcador comum:** mediana, meta ou teto como traço tracejado em `var(--line-strong)` ou `var(--text-muted)`, na mesma posição vertical em todos os micrográficos da grade.
9. **Casos limite da grade:** entidade sem histórico reserva o mesmo espaço com a frase "sem histórico", em vez de encolher o cartão; amostra pequena fica sem cor semântica em vez de pintar ruído de vermelho ou verde; diferença contra a mediana menor que a faixa neutra declarada também fica sem cor, para não opor verde e vermelho entre valores quase empatados; entidade inativa permanece no lugar com um rótulo de status, nunca some da grade.
10. **Acessibilidade:** raiz `role="group"` com `aria-label` calculado do dado inteiro (quantos cartões, o líder ou destaque, o período ou a janela, casos sem comparação), nunca a repetição do título do cartão.

## Versões

- [`v1_tira-de-abertura-do-comercial`](./v1_tira-de-abertura-do-comercial/) ([escuro](./v1_tira-de-abertura-do-comercial/preview.svg), [claro](./v1_tira-de-abertura-do-comercial/preview-claro.svg)): três métricas de abertura do Comercial em ago/26, receita, negócios fechados e ticket médio. Demonstra a grade de colunas iguais com `items-stretch` e `h-full`, o período declarado uma vez no cabeçalho, a linha de variação reservada em todo cartão e a unidade colada a cada número.
- [`v2_tira-da-pre-vendas-com-primario-e-janela`](./v2_tira-da-pre-vendas-com-primario-e-janela/) ([escuro](./v2_tira-da-pre-vendas-com-primario-e-janela/preview.svg), [claro](./v2_tira-da-pre-vendas-com-primario-e-janela/preview-claro.svg)): agendas realizadas, leads recebidos e handoffs aceitos da pré-vendas, com um cartão primário de duas colunas. Demonstra o cartão primário com sparkline, o seletor de janela de 7, 30 e 90 dias em `role="radiogroup"` reescrevendo a âncora do delta e a granularidade, e a data de referência vinda do dado com o dia corrente fora da conta.
- [`v3_grade-de-executivos-com-escala-comum`](./v3_grade-de-executivos-com-escala-comum/) ([escuro](./v3_grade-de-executivos-com-escala-comum/preview.svg), [claro](./v3_grade-de-executivos-com-escala-comum/preview-claro.svg)): doze executivos fictícios com receita semanal do 3º trimestre. Demonstra a polyline em SVG puro sobre o mesmo domínio de eixo, o cabeçalho que declara ordem e escala por extenso, a mediana tracejada repetida em todos os cartões e a posição no grupo escrita em cada um.
- [`v4_grade-com-novo-amostra-pequena-e-afastado`](./v4_grade-com-novo-amostra-pequena-e-afastado/) ([escuro](./v4_grade-com-novo-amostra-pequena-e-afastado/preview.svg), [claro](./v4_grade-com-novo-amostra-pequena-e-afastado/preview-claro.svg)): seis executivos com taxa de conversão do 3º trimestre, incluindo um sem histórico, um com denominador de 4 oportunidades e um afastado. Demonstra o espaço do micrográfico reservado com a frase "sem histórico" na mesma altura, a taxa com o par e sem cor semântica na amostra pequena, a faixa neutra de 2 pontos ao redor da mediana que evita opor verde e vermelho entre executivos quase empatados, o cartão inativo que permanece na grade e a ordem alfabética estável escrita no cabeçalho.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDaTiraOuGrade>/`. A peça já é a própria moldura (`frame: "stage"`): vai direto na grade da página, sem `VisualCard`, numa célula com altura (a linha inteira para a tira, uma altura fixa por linha para a grade).
2. Na tira, se o período divergir entre métricas, retire a declaração única do cabeçalho e escreva o período dentro de cada cartão; a v1 e a v2 assumem período comum e por isso declaram uma vez só.
3. Na grade, troque a ordenação por uma vinda do seletor da página (por valor, por status, alfabética) mas mantenha a régua **escrita** no cabeçalho: nunca deixe a ordem mudar de sessão para sessão sem dizer qual é.
4. Na v3 e na v4, o `domainMax` (ou o domínio implícito de 0 a 1 da taxa) vem do maior valor do recorte real, calculado uma vez para o conjunto inteiro antes de passar `data`; recalcular por cartão quebra o domínio comum da EIX-9.
5. Na v2, o seletor de janela (`WINDOWS`) e a agregação semanal acima de 90 dias podem virar prop controlada pela página, se a janela precisar ficar em sincronia com outros cartões da mesma tela.
6. Acima de cerca de 12 cartões com micrográfico, mantenha a implementação em SVG puro desta versão em vez de trocar por Recharts: é o ponto de virada medido no estudo da família.

## Referências

- [Edward Tufte, Sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/): o alerta sobre escala individual por série e pequenos múltiplos empilhados para comparar dezenas de séries de uma vez (v3, v4).
- [Nightingale, Making Dashboards Optimal for Human Brain Processing](https://nightingaledvs.com/dashboards-human-brain-processing/): o argumento contra visuais simultâneos de importância igual na tira, e o limite de 5 a 7 itens em memória ativa na grade (v1, v2).
- [SWD, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text): o número grande enquadrando a história antes dos gráficos que a sustentam, o papel da tira no topo da tela (v1, v2).
- [shadcn/ui, galeria de gráficos](https://v3.shadcn.com/charts): o padrão de cartão com cabeçalho de número e rodapé de tendência, a forma canônica da tira nessa stack (v1, v2).
- [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics): os nove tipos de cartão, a régua de quebra de largura da tira, e o micrográfico como bloco de tamanho fixo que garante altura uniforme na grade (v1, v3).
- [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/): a sparkline como unidade repetível dentro de uma grade (apareceu na busca; ao abrir nesta revisão, 403).
- Estudo da família: [`_estudo/familias/01_cards-e-kpis.md`](../../_estudo/familias/01_cards-e-kpis.md), modelos 1.16 e 1.17.
- Farol: `app/src/lib/format.ts` (formatadores) e `app/src/components/visuals/KpiCard.tsx` (a variação com ícone que a v1 e a v2 repetem em cada cartão).

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-18, sobre o estado rendido das quatro versões, nos dois temas. As quatro seguem aprovadas: `npm run check` fecha com 0 com erro e 1 aviso (a frase da v3, a 4 caracteres do teto). Esta lista substitui a da passada de 2026-09-17: os pontos que o produtor já resolveu saíram, os que continuam de pé ficaram e os novos entraram ao fim. Nenhum item desta lista reprova versão alguma._

_Segunda leitura do mesmo dia, por outro revisor: os itens abaixo foram reconferidos contra os PNGs dos dois temas e contra o código; a duplicata sobre a escala do micrográfico da v4 foi fundida numa linha só e três pontos novos entraram ao fim. Conferidas também as contas impressas, que fecham: `+8,3%`, `−22%` e `+39%` na v1, e o total de `R$ 1,3 mi` do primeiro cartão da v3._

_Resolvido desde a passada anterior: a frase acessível da v3 caiu de 266 para 246 caracteres e a da v4 de 351 para dentro do teto; `Carlos Eduardo Villalba` deixou de sair com reticência e passou a quebrar em duas linhas, como na v3._

- v1: a variação de receita compara `R$ 1,3 mi` com `R$ 1,2 mi` no formato compacto, e os `+8,3%` só fecham com o valor cheio; o arredondamento da NUM-1 deixa a conta irreproduzível na própria tela.
- v1: a base da variação vai num `span` com `truncate`; no canvas `faixa` nada se corta, mas em coluna estreita o trecho "contra R$ 1,2 mi em jul/26" some antes do número.
- v1 e v4: `data.metrics` vazio na tira, e a lista de executivos vazia na grade, deixam a peça sem cartão nenhum e sem o bloco `role="status"` da EST-1; a v3 já traz esse bloco e serve de gabarito para as duas.
- v2: os dois cartões menores imprimem o delta (`+6,7%`, `+5,4%`) sem repetir a âncora que o cartão primário escreve; a janela selecionada fica declarada uma vez no cabeçalho, como manda o desenho da tira, mas a NUM-4 pede a base na mesma linha de toda variação.
- v2: o seletor de janela é interativo e o PNG só registra o estado de 30 dias; as janelas de 7 e 90 dias, inclusive a nota de granularidade semanal, não têm prova visual no material de conferência.
- v3: a frase acessível está a 246 caracteres, 4 abaixo do teto de 250 da ACE-1, e é calculada do dado; um nome mais longo no recorte real estoura o teto sem que nada no componente segure.
- v3: o destaque saiu do topo e hoje é `Renata A.`, 6ª de 12, o que era o pedido da passada anterior; o `demonstrates` do `meta.json` ainda ilustra a posição com "3º de 12", que não é o que a tela mostra.
- v3: `polylinePoints` corta o valor em `Math.min(value, domainMax)`; com o dado fixo nada passa de R$ 120 mil, mas em dado real um pico acima do teto vira linha reta no topo, sem aviso.
- v3: a mediana tracejada é semanal e o `useCase` pergunta pela mediana do trimestre; o cabeçalho declara a diferença, porém as duas medianas convivem na mesma peça.
- v4: `sem oportunidades` quebra em duas linhas no cartão de Bianca S. e empurra o micrográfico para baixo; a altura do cartão se mantém, mas a linha de base do número deixa de ser comum.
- v4: a frase acessível voltou para dentro do teto da ACE-1, mas conta os casos limite por número ("1 novo, 1 amostra pequena e 1 afastado") sem dizer de quem é cada um; quem só ouve a frase não liga a etiqueta ao nome.
- v3 e v4: o SVG estica até o fim da caixa reservada, e o vão abaixo da linha é o domínio comum honesto (0 a R$ 120 mil na v3, 0 a 100% na v4); no canvas `largo` da v4 esse vão fica muito alto e a grade parece inacabada, o que se resolve com teto de altura no micrográfico, não com escala por cartão.
- v4: `Carlos Eduardo Villalba` passou a quebrar em duas linhas, como na v3, e não sai mais com reticência; a anatomia do modelo, porém, segue prometendo "nome truncado com `title` completo", que é o oposto do que as duas grades fazem hoje.
- v4: o cabeçalho declara a ordem, porém não declara a escala do micrográfico, que é fixa de 0 a 100% da taxa; a v3 declara a dela por extenso e as duas grades ficam desiguais nesse ponto.
- v3 e v4: `Bento de Oliveira Kranz` e `Carlos Eduardo Villalba` trazem sobrenome inteiro, fora do padrão de inicial de sobrenome da seção 3 do contrato, que existe justamente para nome fictício nunca colidir com pessoa real.
- v4: o ícone `Minus` do estado neutro encosta à esquerda da taxa e fica parecido com o sinal de menos tipográfico, o que abre a leitura "−54,8%"; a taxa não tem domínio negativo e o par "(23 de 42)" desfaz a dúvida, mas um traço vertical, um til ou a palavra "na mediana" carregariam o mesmo recado sem o risco.
- v4: na largura rendida, quatro dos seis cartões quebram o valor no meio do par, "54,8% (23 de" numa linha e "42)" na outra, e o `items-center` do `flex` deixa o ícone flutuando entre as duas linhas; o número continua legível, mas a linha de base do valor deixa de ser comum na grade.
- v4: `Bianca S.` escreve "sem oportunidades" no lugar do número, que é mais informativo que o `formatUnavailable()` pedido pela EST-2; vale confirmar com o dono do contrato se a frase específica passa a ser o padrão do modelo ou se é desvio tolerado.
- v1: a linha de variação é reservada em todo cartão (`min-h-4`) e o caminho "sem período anterior medido" existe no código, mas as três métricas do `data.ts` têm base anterior, então o caso que a versão diz demonstrar não aparece em nenhum dos dois PNGs.
- v2: os cartões compactos empurram o número para o rodapé com `justify-between`, enquanto o primário ancora o dele no topo; a tira ganha altura igual, que é o que o modelo promete, mas perde a linha de base comum do número entre as quatro colunas.
- v2: o seletor usa `role="radio"` em `button` sem tratamento de seta do teclado; o leitor de tela anuncia o grupo certo, e a navegação por seta, que o padrão ARIA de radiogroup espera, fica por conta de quem colar no Farol.
- v3: o número do cartão é o total do trimestre e o micrográfico é semanal; a leitura só se sustenta porque a escala do cabeçalho vai até R$ 120,0 mil, e o agregado do número não vem dito no rótulo (NUM-5).
- v2: a sparkline do cartão primário normaliza pelo próprio mínimo e máximo, e não pelo zero, sem nada escrito sobre isso; é a convenção de sparkline que a referência de Tufte do README endossa, mas fica desigual com a v3 e a v4, que desenham sobre domínio comum e declarado.
- v3: com doze cartões no canvas `largo`, a faixa do micrográfico sobra pouca altura e as polylines saem quase planas; a comparação com a mediana tracejada continua legível, porém a forma da série, que o `useCase` também pergunta, quase não se distingue entre executivos.
- v3 e v4: os micrográficos entram com `aria-hidden` e toda a leitura deles fica na frase da raiz; é o que a seção 11 permite, e vale registrar que quem usa leitor de tela recebe posição, total e mediana, mas nunca a forma da série.
- v1 e v2: a tira usa `role="group"` com a frase inteira em `aria-label`, e a frase da v2 não descreve a forma da sparkline, que é o único elemento marcado com `aria-hidden` sem equivalente em texto.
- v4: na medição do PNG claro a frase "sem histórico" de Bianca S. ocupa as linhas 548 a 564 e a de Carlos Eduardo Villalba as linhas 526 a 541; os 22 px de diferença vêm da linha do valor, que quebra em duas linhas em quatro dos seis cartões e deixa `42)` sozinho na segunda. A altura do cartão se mantém e a primeira linha do número continua na mesma base, então a leitura não muda, mas um `min-h` na linha do valor fecharia o vão.
- v4: a grade não desenha o marcador comum tracejado que a Anatomia item 8 prevê; a mediana de 54,5% vive só escrita no cabeçalho, enquanto a v3, no mesmo modelo, repete o traço em todos os micrográficos.
- v1: a tira quebra por `sm:grid-cols-3`, consulta de janela, enquanto a v2, a v3 e a v4 usam `@container` com `@sm:`; num cartão estreito dentro de janela larga a v1 mantém três colunas espremidas em vez de empilhar.
- v1: a unidade "negócios" sai no mesmo corpo do número, em `text-3xl`, e a v2 imprime a unidade em corpo menor ao lado do número; as duas tiras do mesmo modelo ensinam tratamentos diferentes para a mesma peça.
- v2: a sparkline normaliza pelo próprio mínimo e máximo e não declara escala, ao contrário do domínio comum que a grade declara por extenso; num cartão único não engana, porém a régua do modelo fica diferente entre tira e grade.
- v3: com `data` de lista vazia a versão quebra em tempo de execução, porque `ranked[0]` vai para `total()` por asserção `as ExecutiveWeekly`; o dado fixo nunca chega lá, mas quem colar no Farol com lista filtrada chega.

_Revisão independente de 2026-10-02, só da v2, pedida porque o render de 2026-10-01 passou a desenhar o `<button>` com a linha de base herdada. O seletor foi medido nos dois temas e está limpo: Manrope 11 px em peso 500, caixa de 20,5 px com a tinta inteira dentro (72 a 87 em caixa de 70 a 90,5), mesma linha de base do período à esquerda, borda direita em 940 px junto com o último cartão, 4 px entre botões, 6 px até os cartões, sem corte nem colisão; o arquivo difere da página em 0,0009% (escuro) e 0,0066% (claro) dos pixels, fora da região dos botões. As janelas de 7 e de 90 dias, que nunca tinham sido vistas, foram abertas na página viva e fotografadas. A v2 foi **reprovada** nesta data por um bloqueante que não tem relação com o botão (a caixa semanal de 6 dias na janela de 90), descrito em `validation/revisao_01_cards-e-kpis__07_grade-e-tira-de-kpis_2026-10-02.md`. Os itens abaixo são os não bloqueantes da mesma passada._

- v2: os três botões e o trecho "contra os 30 dias anteriores" imprimem número em Manrope sem `tabular-nums` (TIP-1); a nota de 90 dias, na mesma peça, já leva a classe. Sem consequência visível, porque nenhum deles alinha em coluna.
- v2: a unidade ao lado do número (`agendas`, `leads`, `handoffs`) herda Space Grotesk do `kpi-number` e pede `font-normal`, peso 400 que a TIP-4 não carrega; o navegador entrega o 500. Sem consequência visível.
- v2: a pílula da janela selecionada usa `bg-surface-overlay` direto sobre o palco e mede 1,06:1 no claro e 1,21:1 no escuro; a seleção se lê pelo tom do texto (`--text-primary` contra `--text-muted`), com o mesmo peso 500 nos três botões. A janela também está escrita no cartão primário, então nada depende só da pílula, mas um segundo canal no botão marcado (peso 600 ou contorno em `--line-subtle`) deixaria o estado visível no claro.
- v2: `data.metrics` vazio deixa a tira só com o período e o seletor, sem cartão e sem o bloco `role="status"` da EST-1; é o mesmo ponto já anotado para a v1 e a v4, e a v3 serve de gabarito.
- v2: os cartões usam `p-3` (12 px) e a tabela 17.7 pede 16 px para o cartão próprio da moldura `stage`. Sem consequência visível.
- v2: a frase acessível escreve "queda de −18%" e "alta de +9,2%"; lida em voz alta, "queda de menos 18%" é dupla negação. A palavra já carrega o sentido e o número poderia sair sem sinal na frase, como saiu o zero do caso estável.
- v2: na janela de 7 dias a série diária de agendas vai de 14 a 15 e a sparkline usa a altura inteira para a diferença de 1 agenda, ao lado de um `−18%` que se refere à semana anterior e não ao que a linha mostra. É a escala de menor a maior que a EIX-2 admite sem área, e reforça os dois registros anteriores sobre a escala não declarada.
- v2: na janela de 90 dias a sparkline encolhe para o mínimo de 24 px (de 39,5 px) e a nota de granularidade termina em 228,5 px, 1,5 px além do limite interno do cartão (227 px); cabe no preenchimento e não corta.
- v2: o comentário do topo do `data.ts` diz "90 dias fechados antes de 2026-08-31" e o do campo diz "índice 89 = referenceDate"; a tela segue o segundo ("até 31/08/2026, dia corrente fora da conta"). Um dos dois comentários precisa ser reescrito.
- v2: o `check` avisa AGREGACAO-ZERO nas linhas 45 e 46 (`Math.min` e `Math.max` da sparkline); a guarda `series.length < 2` logo acima impede a lista vazia de chegar ali, e a dívida segue na fila da guarda.

_Segunda revisão independente de 2026-10-02, só da v2, depois da correção da EIX-10 descrita mais abaixo. A v2 foi **aprovada**. A janela de 90 dias foi aberta na página viva nos dois temas, com o mesmo empacotamento do render e sem gravar preview. O `d` lido do DOM tem 12 pontos e é idêntico ao calculado à parte pela fórmula do `data.ts`: 125, 103, 80, 101, 134, 129, 98, 98, 131, 147, 124 e 102, índices 6 a 89. O último ponto vale 102, a soma dos 7 dias que terminam na data de referência, e deixou de ser a caixa de 6 dias. A tinta do traço, medida na coluna de cada vértice, fica a no máximo 0,63 px do esperado na janela de 90 dias e a 0,77 px nas de 7 e de 30. A nota sai em uma linha, de 33 a 293 px num cartão que vai de 33 a 461 px. Isso fecha a pendência "sem prova em pixel" da seção Pendências conhecidas. Os dois previews de 30 dias são iguais aos do commit fora o carimbo de origem, e a página viva difere do PNG em 0,0009% (escuro) e 0,0066% (claro) dos pixels. `npm run check`: 0 com erro, 3 avisos; o aviso AGREGACAO-ZERO da v2 passou das linhas 45 e 46 para as 52 e 53. Os dez itens do parágrafo anterior continuam de pé. Os itens abaixo são novos e nenhum reprova._

- v2: na janela de 90 dias o traço cobre 84 dias e o número do cartão cobre os 90 (1.372 das 1.468 agendas estão no traço; as 96 dos 6 dias mais antigos ficam só no total). A nota diz "12 semanas cheias de 7 dias" e deixa a conta dos 84 para quem lê; "últimos 84 dias" na mesma nota fecharia sem depender da multiplicação.
- v2: `sparkSeries` ancora as caixas em `metric.series.length` e `windowTotals` corta pelo literal 90. O tipo documenta 90 valores e o dado fixo nunca sai disso, mas com série de outro comprimento os dois divergem, e abaixo de 84 valores o `slice` de início negativo devolve caixa vazia que soma 0, zero no lugar de ausência (EST-1b). Vale uma guarda de comprimento ao colar no Farol.
- v2: `WEEK_DAYS` e `SPARK_WEEKS` nasceram depois de `windowTotals`, fora do bloco de constantes do topo do arquivo (seção 5 do contrato). Sem consequência visível.
- v2: o item 5 de "Como colar no Farol" fala em "agregação semanal acima de 90 dias"; o código agrega na janela de 90 dias, e não acima dela.

## Correção de 2026-09-25

**v4, mediana qualificada que virava zero.** `median(qualifying)` devolvia `0` para amostra vazia,
e a peça imprimia "mediana qualificada 0%" na linha de leitura e na frase acessível, com a faixa
neutra de 2 p.p. anunciada ao redor de um centro falso. Zero medido no lugar de ausência.

O que mudou: `median` devolve `number | null`; sem amostra qualificada a linha de leitura escreve
`formatUnavailable()` com o ícone `Unplug` (EST-2) e diz que nenhum cartão recebe cor semântica, em
vez de descrever uma faixa que não existe; a frase acessível carrega o mesmo motivo.

**Sobre o segundo efeito, a pintura.** Foi conferido e **não se confirmou**: `hasSample` usa o mesmo
predicado de `qualifying` (`total >= MIN_SAMPLE_FOR_COLOR`), então amostra qualificada vazia implica
`hasSample` falso em todos os cartões e `status` já saía `null` para todos. A grade inteira pintada
de "acima" não chegava a acontecer. Ainda assim `medianRate !== null` entrou na condição de
`status`, porque a guarda que protege a pintura passou a ser a ausência da mediana, e não uma
coincidência entre dois predicados que um refino de régua pode separar.

**Conserto de caminho latente:** o dado publicado tem quatro executivos acima do mínimo de 10
oportunidades, então o preview não exibia o defeito e o desenho não mudou.

**v1 e v2, o sinal do zero.** `signedPercent` imprimia `−0,0%` para variação zero, porque
`fraction > 0 ? '+' : '−'` manda o zero para o ramo negativo. A guarda de `isFlat` existe no corpo
do cartão, mas **não** na frase acessível, que chama a função também no caso estável. Passou a
valer a convenção do acervo (`02_barras-horizontais/06_barras-divergentes/v1`): o teste é sobre o
**texto impresso**, e o que já sai escrito como zero sai sem sinal. Um `=== 0` cru não bastaria,
porque a variação minúscula que arredonda para 0,0% imprimiria `−0,0%` do mesmo jeito. Latente nos
dois: nenhuma métrica do dado publicado está estável.

**Pendência de redação, não de número:** com a correção, a frase acessível dessas duas versões diz
"estável de 0,0%" no caso estável. É verdadeiro e lê torto; cortar o " de 0,0%" é decisão de
redação e ficou fora deste conserto.

### Segunda passada, 2026-09-25: estável não leva número

A pendência de redação acima foi fechada nas v1 e v2: a frase acessível escreve só "estável", sem
o " de 0,0%", porque o número lia como se 0,0% fosse a quantidade de estabilidade e não acrescenta
nada ao que a palavra já diz. Concordância conferida nas duas: "Leads recebidos: 2.202 leads,
estável." fecha, e o ramo não estável segue com "alta de +6,7%", intocado.

Com o corte, `signedPercent` deixou de ser alcançável com zero nas duas versões, porque a guarda de
`isFlat` passou a cobrir o corpo **e** a frase. A guarda de zero dentro da função ficou, agora como
convenção dela, e o comentário foi reescrito para não descrever um motivo que não existe mais: quem
chamar a função de um terceiro lugar não reintroduz o menos zero.

### Terceira passada, 2026-09-25: a mediana da v3

**v3, guarda de vazio na lista vizinha.** `median(data.executives.flatMap(...))` era protegido por
`data.executives.length === 0`, que é a lista de executivos, não a lista de semanas que alimenta a
mediana. Executivo presente no recorte com série semanal vazia devolvia `0`, e o cartão escrevia
"mediana tracejada em R$ 0" no cabeçalho, na frase acessível, e plantava o traço tracejado na base de
**todos** os cartões: zero medido no lugar de ausência, com o traço lido como mediana de R$ 0.

O que mudou, na mesma forma da `13_progresso-meta-e-gauge/01_barra-de-progresso-linear/v3` e da `v4`
deste modelo, para as três não divergirem: `median` devolve `number | null`; a guarda de vazio passa a
ser `weeklyPool`, a própria lista de semanas; o caso nulo escreve `formatUnavailable()` com o ícone
`Unplug` em `--text-muted` (EST-2) no lugar do valor, a frase acessível carrega o mesmo com o motivo
("nenhuma semana medida, sem traço nos cartões"), e o traço **deixa de ser desenhado**, porque não há
mediana. O estado do recorte vazio não foi mexido: ele fala do filtro sem pessoa, que é outro estado.

**Conserto de caminho latente:** os 12 executivos publicados têm 13 semanas cada, então o preview não
exibia o defeito e o desenho não mudou. O que se conserta é o ramo, não a foto.

**Dois ramos latentes achados ao lado, listados e não consertados**, porque o que desenhar em cada um
é decisão de desenho: `polylinePoints` divide por `series.length - 1`, então uma única semana dá passo
infinito e `NaN` no `x` (o `points` sai inválido e a linha não desenha; hoje uma série de um ponto
também não desenharia, então o resultado visível é o mesmo, mas por acidente); e `data.domainMax` zero
zera o denominador da polilinha e do traço da mediana, e o cabeçalho passaria a anunciar uma escala de
R$ 0 a R$ 0.

## Correção de 2026-10-02 (v2, EIX-10)

Na janela de 90 dias a sparkline do primário somava caixas de 7 dias a partir do início da série, e a última caixa, a mais recente, saía com 6 dias. `sparkSeries` agora alinha as caixas pelo fim: 12 semanas cheias de 7 dias (84 dias, a mais recente termina em `referenceDate`), e os 6 dias mais antigos ficam fora do traço, não do total do cartão. A nota diz "agregado por semana, 12 semanas cheias de 7 dias". Os previews de 30 dias não mudaram (só o carimbo de origem).

## Pendências conhecidas

- v2, EIX-10: a janela de 90 dias não é fotografada pelo preview nem pelo `check`; a correção foi conferida por leitura do código e por conta direta das fronteiras das caixas (12 caixas de 7 dias, da posição 6 à 89), sem prova em pixel.
