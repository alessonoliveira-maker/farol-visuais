# Scorecard tabular com procedência

## O que é

Uma linha por indicador, com valor do período, meta, atingimento e variação contra o período
anterior, cada uma com a seta de tendência e a cor pela polaridade que a métrica declara, não pelo
sinal do número. É o cartão de KPI da família 01 empilhado em forma de tabela, e na postura do
Farol cada linha também pode dizer de onde o número vem (MEDIDO, DERIVADO, PREMISSA, LACUNA) ou
quanto do dado por trás dele existe. Lê se de cima para baixo, coluna por coluna: o nome do
indicador à esquerda, os números à direita em algarismo tabular.

## Quando usar

* Resumo de 6 a 20 KPIs com unidades diferentes que não cabem em cartões na mesma tela.
* Leitura de valor, meta e variação lado a lado, com a polaridade decidindo a cor.
* Tela executiva em que cada número precisa carregar a procedência na própria linha.
* Cobertura de campos por origem ou por métrica, para não ler uma taxa calculada sobre 20% da
  base como se fosse a base inteira.

## Quando evitar

* Até 5 KPIs com espaço de sobra: os cartões da família 01 (`01_cards-e-kpis`) leem melhor.
* Quando o leitor precisa da série de cada indicador, não só do último valor: use a tabela com
  série por linha (`14/03_tabela-com-serie-por-linha`).
* Métrica nova sem período anterior mostrada com percentual de variação: escreva "sem base" em
  vez de inventar uma queda ou alta que não existe.
* Procedência igual para o cartão inteiro: nesse caso é a etiqueta única do `VisualCard`, não uma
  coluna repetida em toda linha.

## Anatomia

1. **Indicador.** Nome da métrica, à esquerda, em `text-text-secondary`; é o `<th scope="row">`
   de cada linha.
2. **Valor do período.** Número formatado pela unidade da linha (`formatValue` do despachante de
   `@/components/visuals/valueFormat`), à direita, em `kpi-number` e `text-text-primary`.
3. **Meta.** Mesmo formato do valor, em `text-text-muted`; ausente vira travessão, nunca zero.
4. **Atingimento.** Razão entre valor e meta pela direção que a métrica precisa seguir: quem sobe
   divide valor por meta, quem desce (como CPL) divide meta por valor, e por isso as duas colunas
   passam de 100% quando a meta é batida na direção certa. Cor `--positive` a partir de 100%,
   `--negative` abaixo, `--text-secondary` quando a métrica não tem direção declarada.
5. **Variação.** Ícone `TrendingUp`, `TrendingDown` ou `Minus` (dentro da banda de estabilidade)
   com `aria-hidden`, sinal tipográfico e a base nomeada na linha de apoio abaixo ("vs R$ 96,1 mil
   em jul/26"), nunca um número solto sem o mês e o valor de comparação.
6. **Procedência.** Texto curto em `--prov-medido`, `--prov-derivado`, `--prov-premissa` ou
   `--prov-lacuna`, com a legenda por extenso escrita uma vez no topo da tabela, não em cada
   célula.
7. **Cobertura.** Percentual e fração sempre lado a lado (`formatInt` para a fração, `formatPercent`
   para o percentual); abaixo do n mínimo a fração vem em destaque e o percentual em apoio, o
   inverso do padrão acima do n mínimo.
8. **Nota de rodapé.** Uma linha, 11 px, `text-text-muted`, escrevendo por extenso o critério de
   bom e ruim ou o motivo de uma lacuna: a cor nunca é a única explicação na tela.

## Versões

* [`v1_resumo-mensal-do-marketing`](./v1_resumo-mensal-do-marketing/) ([preview](./v1_resumo-mensal-do-marketing/preview.svg), [claro](./v1_resumo-mensal-do-marketing/preview-claro.svg)):
  seis indicadores de Marketing com valor, meta, atingimento e variação; o atingimento inverte a
  razão para CPL e CPL qualificado, que precisam cair.
* [`v2_polaridade-e-banda-de-estabilidade`](./v2_polaridade-e-banda-de-estabilidade/) ([preview](./v2_polaridade-e-banda-de-estabilidade/preview.svg), [claro](./v2_polaridade-e-banda-de-estabilidade/preview-claro.svg)):
  a mesma seta para cima em vermelho no CPL e em verde na taxa de agendamento, banda de
  estabilidade de 2% e indicador sem polaridade (investimento em mídia) sempre em cinza.
* [`v3_scorecard-da-diretoria-com-procedencia`](./v3_scorecard-da-diretoria-com-procedencia/) ([preview](./v3_scorecard-da-diretoria-com-procedencia/preview.svg), [claro](./v3_scorecard-da-diretoria-com-procedencia/preview-claro.svg)):
  15 métricas em três áreas, cada uma com o selo de procedência e a legenda dos quatro selos
  escrita por extenso uma vez no topo; a receita atribuída por origem é a linha LACUNA, com o
  motivo ao lado do `indisponível`.
* [`v4_cobertura-denominador-pequeno-e-lacuna`](./v4_cobertura-denominador-pequeno-e-lacuna/) ([preview](./v4_cobertura-denominador-pequeno-e-lacuna/preview.svg), [claro](./v4_cobertura-denominador-pequeno-e-lacuna/preview-claro.svg)):
  cobertura de telefone e cargo por sete origens, cada uma com a barra inline de 0 a 100% ao
  lado do percentual, coluna cidade em lacuna declarada uma vez no cabeçalho (célula única
  mesclada no corpo), variação de leads com o mês-base nomeado e "sem base" na origem nova,
  taxa de agendamento em cinza com ícone onde o telefone está abaixo de 50% e duas origens de
  menos de dez leads para provar o degrau da fração.

## Como colar no Farol

1. Este modelo é `html-tailwind` puro: nenhuma dependência de Recharts, só `<table>`, tokens e
   `lucide-react`. Copie `Chart.tsx` e `data.ts` para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Ligue `data` a partir do seletor de registry da página (leads, MQL, CPL etc. já existem em
   `@/data/metrics/registry`); mantenha as uniões de unidade (`'int' | 'currencyCompact' | ...`)
   como um subconjunto literal de `ValueFormat`, para `formatValue` continuar aceitando sem cast.
3. Se a página real tiver mais de 20 indicadores, pagine ou agrupe por área como a v3, em vez de
   deixar a tabela rolar sem cabeçalho fixo: nenhuma versão do catálogo trata rolagem.
4. O `role="table"` e a frase acessível já computam do dado; ao trocar por dado real, confira que
   a frase ainda cabe em 100 a 250 caracteres (ACE-1) com o novo número de linhas.
5. Embrulhe no `VisualCard` do destino; o Chart não desenha título nem moldura (seção 17,
   ANO-6, ESP-4).

## Referências

* [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table):
  observar tabelas para métricas variadas com unidades diferentes em resumos executivos.
* [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table):
  formatação por coluna, linhas fixas e cor condicional por categoria; base das colunas de
  procedência e cobertura.
* [Behance, Customer Intelligence Marketing Analytics](https://www.behance.net/gallery/105773549/Customer-Intelligence-Marketing-Analytics-platform):
  o achado do estudo da família que trata grau de cobertura de dado como métrica própria, e não
  como nota de rodapé.
* [microcharts, Delta](https://microcharts.dev/docs/charts/delta): inverter a polaridade troca a
  cor e nunca a direção da seta, a regra por trás das colunas de atingimento e variação.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19. Nenhum item aqui reprova a versão; ficam registrados para quem mexer no
modelo depois._

* **v1_resumo-mensal-do-marketing.** Meta ausente é impressa como travessão dentro do próprio
  Chart, enquanto a EST-2 pede `formatUnavailable()`; o caminho não aparece no preview porque
  nenhuma linha do `data.ts` tem `target` nulo.
* **v1_resumo-mensal-do-marketing.** O `data.ts` declara `target` e `previousValue` como
  anuláveis, mas as seis linhas vêm preenchidas: o ramo "sem mês anterior" existe no código e
  nunca é exercitado pelo dado fixo.
* **v2_polaridade-e-banda-de-estabilidade.** Dentro da tabela, a diferença entre os dois "+12%"
  está só na cor; quem não distingue verde de vermelho depende da nota de rodapé, que está lá e
  resolve, mas é o único segundo canal.
* **v3_scorecard-da-diretoria-com-procedencia.** O cabeçalho da coluna do período imprime
  `2026-08` cru, enquanto a v1 e a v2 imprimem `ago/26` por `formatMonthShort`: é divergência de
  formato entre versões do mesmo modelo.
* **v3_scorecard-da-diretoria-com-procedencia.** A linha de grupo leva `aria-hidden`, então o
  leitor de tela não recebe o nome da área; a frase acessível conta as três áreas, mas não as
  nomeia.
* **v4_cobertura-denominador-pequeno-e-lacuna.** O catálogo cita `formatRateWithVolume` e a
  versão monta o par com `formatInt` mais `formatPercent`, para poder inverter a ordem quando o
  denominador é pequeno; o número continua saindo dos formatadores do Farol.
* **v4_cobertura-denominador-pequeno-e-lacuna.** O caso da métrica nova "sem base", que o catálogo
  cita na mesma linha da lacuna, não aparece em nenhuma versão do modelo: esta versão não tem
  coluna de variação contra período anterior, só cobertura.

Acréscimos da revisão independente de 2026-09-19, depois da rodada de correção. Nenhum reprova:

* **Todas as versões.** Nenhuma trata `data` vazio com o bloco `role="status"` da EST-1: com a lista
  vazia sobra o cabeçalho da tabela e a nota de rodapé. O ramo não existe no código de nenhuma das
  quatro.
* **v3_scorecard-da-diretoria-com-procedencia.** A faixa de grupo usa `bg-surface-overlay`, que no
  tema claro tem o mesmo valor do cartão: a faixa desaparece e só o rótulo em caixa alta separa as
  áreas. Continua legível, mas a separação de grupo existe só no tema escuro.
* **v4_cobertura-denominador-pequeno-e-lacuna.** As barras de cobertura não partem de uma origem
  comum entre as linhas: a célula é alinhada à direita e o texto ao lado muda de largura, então
  cada trilho começa num ponto diferente. O trilho tem sempre a mesma largura e o percentual está
  escrito ao lado, então a leitura não engana; o que se perde é a varredura da coluna de cima a
  baixo.
* **v4_cobertura-denominador-pequeno-e-lacuna.** O comentário de topo do `Chart.tsx` diz que o
  motivo da lacuna de Cidade mora no cabeçalho da coluna, e na tela ele está no rodapé: o texto do
  código contradiz o que a versão desenha.
* **v4_cobertura-denominador-pequeno-e-lacuna.** A taxa de agendamento sai com percentual inteiro
  (14%, 11%), enquanto a NUM-1 pede uma casa para taxa de conversão; a fração ao lado dá a base, e
  por isso é arredondamento, não erro de leitura.

_Revisão independente de 2026-10-14, `v4_cobertura-denominador-pequeno-e-lacuna` em revisão
desatualizada (trilho levado a `bg-surface-sunken`). Nenhum item abaixo reprova; os bloqueantes desta
revisão estão em `validation/revisao_14_tabelas-visuais__04_scorecard-tabular_2026-10-14.md`._

* **v4_cobertura-denominador-pequeno-e-lacuna.** A fração entre parênteses, "(302 de 412)", sai em
  Manrope sem `tabular-nums` (`Chart.tsx:70`), e o "ago/26" da linha de contexto também; a TIP-1 pede
  algarismo tabular em todo número. Na coluna alinhada à direita a diferença não aparece no preview.
* **v4_cobertura-denominador-pequeno-e-lacuna.** A barra pintada mede 10 px de altura, não 12: o
  `absolute inset-y-0` ocupa a caixa de dentro da borda de 1 px do trilho, e o comentário de
  `BAR_HEIGHT` promete o piso de 12 px da ESP-2. O percentual escrito ao lado sustenta a leitura,
  inclusive no 24% de Cargo do Formulário do site, que sai quase um círculo.
* **v4_cobertura-denominador-pequeno-e-lacuna.** Os textos de uma mesma linha não dividem a linha de
  base: estimado a olho no PNG de 2x, em Mídia social, "indisponível" fica uns 3 px acima do
  agendamento no tamanho real, com origem, leads e percentuais no meio. Sem colisão nem leitura errada.
* **v4_cobertura-denominador-pequeno-e-lacuna.** `RatePair` com denominador zero escreve
  `formatUnavailable()` sem o ícone `Unplug` que a EST-2 pede ao lado da palavra; o dado fixo não
  exercita o ramo.
* **v4_cobertura-denominador-pequeno-e-lacuna.** A frase acessível conta "2 com telefone abaixo de
  50%" sem nomear as origens e sem falar do cargo, que tem três origens abaixo do limiar (Busca paga,
  Formulário do site e Webinar piloto).
* **v4_cobertura-denominador-pequeno-e-lacuna (o mesmo vale para v1 a v3).** `role="table"` na `div`
  raiz, que envolve um `<p>` e o `<table>` de verdade, aninha dois papéis de tabela para o leitor de
  tela; os modelos `07` e `08` da família usam `role="group"` na raiz.

_Revisão independente de 2026-10-14, segunda passada, `v4_cobertura-denominador-pequeno-e-lacuna`
aprovada depois da rodada de correção. Nenhum item abaixo reprova._

* **v4_cobertura-denominador-pequeno-e-lacuna.** A variação de leads abaixo de 10% sai inteira:
  Busca paga escreve "−5% contra 281 em jul/26", que é −4,6%, e a NUM-1 pede uma casa abaixo de 10%.
  A base nomeada ao lado sustenta a leitura.
* **v4_cobertura-denominador-pequeno-e-lacuna.** Evento regional escreve "−33% contra 6 em jul/26",
  variação percentual sobre base de 6 leads, justamente na versão que tira o percentual do destaque
  abaixo de 10. A base nomeada evita o engano; a diferença absoluta ("−2 contra 6") seguiria a regra
  da própria versão.
* **v4_cobertura-denominador-pequeno-e-lacuna.** A frase acessível tirou a cidade em vez de dizer que
  ela é indisponível em toda origem, não cita a variação nem o "sem base", e diz "agendamento em
  cinza" para quem ouve; "com aviso de base fraca" descreveria o sentido, não a cor.
* **v4_cobertura-denominador-pequeno-e-lacuna.** O `Unplug` do cabeçalho de Cidade herda
  `text-secondary`, e a EST-2 pede o ícone em `text-muted`; o cabeçalho é alinhado à direita e o
  ícone da célula mesclada, centrado.
* **v4_cobertura-denominador-pequeno-e-lacuna.** A variação de leads tem sinal e não tem o ícone de
  tendência da anatomia (item 5); como a variação não usa cor, o sinal basta para a ACE-2. O "(sem
  base)" é mais curto que a frase da EST-4 ("sem mês anterior medido para comparar"); o rodapé explica.
* **v4_cobertura-denominador-pequeno-e-lacuna.** Seguem valendo as observações anteriores: fração e
  agora também a variação de leads em Manrope sem `tabular-nums` (TIP-1), barra pintada de 10 px,
  trilhos sem origem comum entre linhas, denominador zero sem `Unplug`, `role="table"` aninhado e
  vazio sem bloco `role="status"` (EST-1).

## Correção de 2026-09-19

_Rodada única de correção do reprovo de 2026-09-19 (`v4_cobertura-denominador-pequeno-e-lacuna`).
O bloqueante foi a falta da barra de cobertura de 0 a 100%; o catálogo venceu (não foi editado),
então a barra entrou na versão, não o inverso._

* **Resolvido.** `RatePair` ganhou uma barra inline de 0 a 100% ao lado do par percentual/fração,
  em telefone e cargo (nunca em agendamento, que é taxa de conversão, não cobertura de campo). O
  trilho levou `border border-line-subtle` além do `bg-surface-overlay`: sem a borda, cobertura 0%
  (caso "Webinar piloto" em Cargo) desenhava um trilho branco sobre cartão branco no tema claro,
  indistinguível de ausência de dado, o que o próprio modelo existe para evitar. Conferido nos dois
  PNGs. Em 2026-09-29 a varredura do token levou esse trilho de `bg-surface-overlay` para
  `bg-surface-sunken`, mantida a borda.
* **Resolvido.** `meta.json` voltou a listar a barra em `demonstrates`, a mesma lista que tinha sido
  reescrita sem registrar a divergência (o motivo apontado pelo revisor para a lacuna ter passado
  batida).
* **Não resolvido nesta rodada** (ficam como pendência, nenhum bloqueia a versão):
  * A palavra "indisponível" da coluna Cidade segue com o motivo no rodapé, não no cabeçalho da
    coluna como o catálogo descreve; mudar exigiria redesenhar o cabeçalho (hoje só ícone + rótulo)
    sem estourar a largura das seis colunas, o que não coube no escopo de um bloqueante só.
  * A divergência `formatRateWithVolume` (catálogo) vs `formatInt` + `formatPercent` manuais
    (código) permanece: a versão precisa inverter a ordem do par abaixo do n mínimo, e
    `formatRateWithVolume` sempre devolve percentual primeiro, sem essa opção.
  * O caso "métrica nova sem base" citado pelo catálogo não existe em nenhuma versão do modelo;
    não é um bug desta versão, é ausência de versão dedicada ao caso.
  * Possível defeito de escopo do catálogo: a barra de cobertura inline é o assunto declarado do
    modelo `01_tabela-com-barras-inline` da mesma família. A correção seguiu o catálogo como
    escrito (regra 3 da leva), mas o catálogo não foi alterado nem confirmado como certo.

## Correção de 2026-10-14

_Reprovo de 2026-10-14 da `v4_cobertura-denominador-pequeno-e-lacuna`, três bloqueantes do catálogo._

* **Resolvido.** Cidade escreve "indisponível" e o motivo uma vez no `<th>`; o corpo é uma célula com `rowSpan`.
* **Resolvido.** `data.ts` ganhou `previousVolume: number | null`; Leads escreve a variação com a base ("+12% contra 368 em jul/26") e Webinar piloto escreve "sem base".
* **Resolvido.** A taxa de agendamento fica em `text-muted` com `TriangleAlert` onde o telefone está abaixo de 50%; o rodapé e a frase acessível descrevem a regra e nomeiam as origens.
