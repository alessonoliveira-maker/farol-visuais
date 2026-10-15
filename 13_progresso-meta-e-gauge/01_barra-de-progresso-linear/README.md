# Barra de progresso e capacidade contra teto

## O que é

Um trilho, uma barra que cresce dentro dele e um traço de referência. Quando a referência é uma
meta, a pergunta é quanto falta para chegar lá; quando é um teto de capacidade, a polaridade
inverte e a pergunta vira quanto sobra ou quanto já estourou. O domínio do trilho vai até o maior
entre o valor e a referência, com folga, para que passar de 100% caiba com marca própria em vez de
travar a barra. Com prazo, entra a segunda régua da família: o ritmo esperado na data de corte, que
chega pronto no dado, nunca calculado no componente. Nenhuma versão deste modelo lê como "bom" ou
"ruim" sozinha: o denominador (meta ou teto), o período e se o ritmo esperado entrou na conta
aparecem sempre em texto, porque um percentual sem essas três coisas lê do jeito que quem olha
quiser. Feito em HTML com Tailwind, sem Recharts, para caber em cartão, lista e linha de tabela.

## Quando usar

- Uma medida contra uma meta ou um teto declarado, em cartão com pouco espaço (v1).
- Meta com prazo, lida no meio do período, com o ritmo esperado para a data de corte escrito ao
  lado (v2).
- Lista de 4 a 15 pessoas ou filas com metas diferentes, normalizada em percentual da meta, numa
  escala comum ao grupo (v3).
- Demanda contra teto de capacidade medido, com a folga ou o estouro escritos ao lado (v4).
- Acumulado que só sobe, como meta de campanha, no lugar de um termômetro decorado.

## Quando evitar

- Existe régua qualitativa acordada (ruim, aceitável, bom) com dono e data: use o bullet chart
  (13/02), que tem espaço para as faixas.
- Meta ou teto sem dono nem medição: a folga vira ficção. Mostre só o número em cartão de KPI
  (01/03) até a meta existir de fato.
- Muitas categorias ordenadas sem nenhuma referência de meta ou teto: é barra horizontal comum
  (família 02).
- Acompanhamento dia a dia do acumulado contra a meta ao longo do tempo: use o burn-up (04/06), que
  tem eixo de tempo.
- Mais de 15 linhas com várias colunas numéricas: é bullet em célula de tabela (14/01).

## Anatomia

1. **Rótulo da métrica ou da linha.** Nome do que está sendo medido e o período, sempre em texto,
   nunca só no `meta.json` (`text-text-secondary`, `text-xs`).
2. **Trilho.** `div` com `bg-surface-sunken`, altura fixa (12 px nas versões de card, `h-3`) e
   `rounded-full`, exceto quando a barra some abaixo de 4% do comprimento: aí a ponta vira
   `rounded-sm` (`ROUNDED_FLOOR`), porque a ponta arredondada de uma barra curta soma comprimento
   visual que não existe no dado (v1, v3). O token não é `bg-surface-overlay`: no tema claro ele é
   o mesmo branco do cartão e o trilho deixa de existir na tela (`TOK-1`).
3. **Barra preenchida.** `bg-chart-1` para o realizado contra meta (v1, v2); `var(--line-strong)`
   para demanda contra teto, porque ali a barra cheia não é sucesso (v4, COR-6).
4. **Traço de referência.** `border-l border-dashed border-text-muted`, 1 px, ultrapassando o
   trilho por 3 px de cada lado, para a meta ou o teto (régua 17.2, papel Referência). Teto de
   premissa usa o mesmo traço com `opacity-50` e a palavra "(premissa)" no rótulo, nunca a cor de
   procedência, que é do `VisualCard` (v4, ANO-6, regra 9 do README da família).
5. **Traço de ritmo esperado.** `border-l border-dotted border-text-secondary`, textura diferente
   da meta para os dois não se confundirem na mesma barra; posição vem de `elapsedRatio` do dado,
   nunca de um relógio no componente (v2).
6. **Segmento de excedente ou de projeção.** Acima de 100% da meta, um segmento em `bg-positive`
   com o percentual escrito ao lado (v3); em projeção, o mesmo tom do realizado com
   `repeating-linear-gradient` tracejado, porque projeção é premissa e usa a textura, não uma cor
   nova (v2).
7. **Segmento de estouro.** Além do teto, `bg-negative` com ícone `AlertTriangle` e o texto do
   excesso, porque aqui subir é ruim (v4, COR-6).
8. **Texto de apoio.** Par de números por `formatCurrencyCompact` ou `formatInt`, o que falta ou o
   que sobra, e a declaração explícita de que a leitura considera ou não o ritmo esperado.
9. **Frase acessível.** `role="img"` (medida única) ou `role="table"` (lista), com `aria-label`
   calculado do dado: valor, referência, percentual e o que falta, nunca repetindo só o título.

## Versões

- **[`v1_receita-do-trimestre-contra-meta`](./v1_receita-do-trimestre-contra-meta/preview.svg)**: a
  barra básica, receita reconhecida do trimestre contra a meta, com o domínio em
  `Math.max(valor, meta) × 1,05` e o par de números escrito.
- **[`v2_agendas-no-ritmo-do-mes`](./v2_agendas-no-ritmo-do-mes/preview.svg)**: acrescenta a
  segunda régua da família, o ritmo esperado como traço pontilhado e a projeção tracejada como
  premissa, com o modo de ritmo (linear ou curva histórica) declarado no rótulo.
- **[`v3_cota-por-executivo`](./v3_cota-por-executivo/preview.svg)**: lista de 8 executivos com
  metas diferentes numa escala comum, ordenada por atingimento, com a mediana da equipe como
  traço comum a todas as linhas, o excedente acima de 100% em tom próprio e quem não tem meta
  definida fora da mediana.
- **[`v4_filas-contra-teto-com-estouro`](./v4_filas-contra-teto-com-estouro/preview.svg)**: inverte
  a polaridade para capacidade contra teto, com o excedente em `--negative`, o teto de premissa
  distinguido por texto e traço apagado, e a fila sem coleta em trilho tracejado com
  `formatUnavailable()`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida; o componente não desenha moldura própria
   (`ESP-4`), então ele espera viver dentro de um `VisualCard`, de uma linha de lista ou de uma
   célula de tabela que já tenha o próprio padding e borda.
2. Troque o `data` fixo pela leitura do registry de métricas da página (`value`, `target` ou
   `cap`, e `period`); mantenha o tipo exportado em `data.ts` como contrato entre o seletor da
   página e o componente.
3. Se o cartão de destino tiver prazo (agenda do mês, meta trimestral em andamento), prefira a
   `v2`: o `elapsedRatio` e o `expectedRatio` precisam vir prontos da mesma consulta que calcula o
   `value`, nunca de `new Date()` no componente.
4. Em lista (`v3`) ou painel de filas (`v4`), a escala comum (`domainMax`) é calculada sobre o
   array inteiro: não recorte a lista depois de calcular o domínio, ou o comprimento das barras
   deixa de ser comparável entre linhas.
5. Dê altura ao pai (uma linha de `h-3` mais o texto de apoio cabe em cerca de 72 a 96 px por
   linha) e confira os dois temas: o traço de referência em `--text-muted` é o ponto mais claro que
   o contrato aprova para texto, e qualquer tom mais claro reprova.

## Referências

- [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf):
  a regra de que a barra só vale quando a escala começa em zero, a medida partida em real e
  projetado, e o tratamento de métrica em que menos é melhor (a mesma lógica da polaridade
  invertida da v4).
- [Data Viz Project, Progress Bar](https://datavizproject.com/data-type/progress-bar/): a ficha
  trata o formato como elemento de interface, não de estatística, o que explica o vício de travar
  em 100% que este modelo evita com o domínio em `Math.max(valor, meta) × 1,05`.
- [Datawrapper Academy, customizing your bullet bar chart](https://www.datawrapper.de/academy/customizing-your-bullet-bar-chart):
  estender o eixo além do maior valor, referência para a folga de 1,3 vez o teto da v4.
- [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard):
  progresso de cota convivendo com saúde de pipeline e acurácia de forecast na mesma tela, o
  mesmo trio de leitura da v2 e da v3.
- [Estudo da família](../../_estudo/familias/13_progresso-meta-e-gauge.md), seção 1 (barra de
  progresso linear), seção 3 (ritmo esperado e projeção) e seção 18 (capacidade contra teto): a
  anatomia, o ponto delicado do domínio e as versões sugeridas que este modelo produziu.
- [README da família](../README.md): as decisões transversais (meta e teto escritos em texto,
  passar de 100% cabe, ritmo esperado como segunda régua, procedência é do `VisualCard`) que valem
  para as quatro versões acima.
- [CONTRATO.md](../../CONTRATO.md), seção 17: papéis de cor (17.2), formatação numérica (17.6) e
  os pares de contraste aprovados (17.10) usados em cada traço e texto deste modelo.

## Observações da revisão (não bloqueantes)

Revisão de 2026-09-18, as quatro versões aprovadas. Nada aqui impede o uso como referência.

- **v1**: no tema claro o trilho (`bg-surface-overlay`) quase se confundia com o cartão, e o fim da
  escala só se percebia pelo traço da meta. Corrigido em 2026-09-29: as quatro versões desenham o
  trilho em `bg-surface-sunken`, que se vê nos dois temas.
- **v1**: o traço da meta não leva rótulo junto (ANO-2); o valor vive no canto superior direito,
  perto o bastante para a leitura fechar, mas longe do traço que ele nomeia.
- **v1**: o `useCase` do `meta.json` passa das duas linhas do cabeçalho da moldura e sai cortado em
  "para fechar o" nos dois PNGs. É o `line-clamp-2` do harness compartilhado, não o visual;
  encurtar o caso de uso resolve sem tocar no componente.
- **v2**: o traço do ritmo esperado cai dentro da faixa listrada da projeção e se confunde com as
  listras; estendê-lo acima e abaixo do trilho, como o traço da meta faz com `inset-y-[-3px]`,
  devolveria a leitura sem mudar o dado.
- **v2**: a lacuna até o ritmo está escrita ("13 agendas atrás do ritmo") mas não tem realce próprio
  no trilho, e o `demonstrates` promete destaque; o trecho entre o fim da barra e o traço do ritmo
  é o candidato natural.
- **v3**: não há marca na posição dos 100% da cota. Quem passou dela mostra a troca de cor, quem
  está abaixo depende do percentual escrito para saber o quanto falta.
- **v3**: a raiz usa `role="table"` sem filhos com papel de linha e célula; `role="img"` com a mesma
  frase calculada descreveria a lista sem prometer uma tabela ao leitor de tela.
- **v3**: o traço da mediana também é desenhado na linha de quem está sem meta, que por regra fica
  fora do cálculo dessa mediana.
- **v3**: "sem meta definida (R$ 61,0 mil)" quebra em duas linhas na coluna de 8rem e separa o
  parêntese do número.
- **v4**: a demanda de cada fila não aparece escrita, só o teto e a folga ou o estouro; a barra
  neutra em `--line-strong` é o par que a tabela 17.10 aprova com o valor escrito ao lado.
- **v4**: mesma observação da v3 sobre `role="table"` sem linhas nem células.
- **v4**: na fila que estourou, o traço do teto coincide com a emenda entre a barra neutra e o
  excedente e quase desaparece ali; nas outras filas ele lê bem.

Revisão de 2026-10-14, sobre o arquivo de hoje das quatro versões (motivo `revisao_desatualizada`).
v1, v2 e v3 aprovadas; v4 reprovada, e o bloqueante dela está em
`validation/revisao_13_progresso-meta-e-gauge__01_barra-de-progresso-linear_2026-10-14.md`. A
observação de 2026-09-18 sobre a demanda da v4 não escrita deixou de ser nuance: sem o valor escrito,
a isenção da 17.2 para `--line-strong` não vale. Os itens abaixo não impedem o uso como referência.

- **v1 a v4**: o traço de referência tem `inset-y-[-3px]`, mas o trilho tem `overflow-hidden` e corta a extensão; nos PNGs ele mede a altura do trilho (12 px, dois traços de 3 px), e a Anatomia, item 4, promete 3 px acima e abaixo. Ou o traço sai do trilho como irmão posicionado sobre ele, ou a Anatomia muda.
- **v1**: `percentOfTarget` devolve `0` quando a meta é zero (`Chart.tsx:29`), e o cartão escreveria "0,0% da meta" e "faltam R$ 0"; a `AGREGACAO-ZERO` orienta por dívida. Saída da EST-1b: `number | null` e `formatUnavailable()` no lugar do percentual.
- **v1**: "83,6% da meta" sai em Manrope sem `tabular-nums` (TIP-1); o número vizinho do mesmo parágrafo está em `kpi-number`.
- **v1**: a frase acessível termina em "Leitura sem o ritmo esperado do período considerado", que lê como se o considerado fosse o período; "Leitura que não considera o ritmo esperado do período" diz o que se quer.
- **v2**: neste dado o traço do ritmo cai no vão de 3 px entre duas listras, colado à listra seguinte (x 722 e 723 do PNG, listra a partir de 724). No vão mede 9,36:1 no escuro e 7,04:1 no claro; sobre a listra mediria 1,62:1 e 2,35:1. A visibilidade depende de onde o dado põe o traço.
- **v2**: a listra da projeção, com `opacity-70`, mede 2,99:1 contra o trilho no claro (3,45:1 contra o cartão); o 68 escrito abaixo garante a isenção, mas a margem é de 0,01.
- **v2**: o traço do ritmo usa `--text-secondary` pontilhado, que não é papel da 17.2 (Referência é `--text-muted` tracejado); a textura já separa ritmo e meta.
- **v2**: a frase acessível diz "41 de 90 na dia 18 de 30"; o artigo é "no".
- **v2**: o `meta.json` e a Anatomia dizem que o ritmo sai de `elapsedRatio`, e o componente lê `expectedRatio`; `elapsedRatio` fica no `data.ts` sem uso. No modo linear os dois valem 0,6 e o desenho está certo.
- **v2**: as larguras da listra (5 px e 8 px) estão dentro do `repeating-linear-gradient`, não em constante nomeada no topo.
- **v3**: o período "2026 T3" está escrito no JSX da linha de leitura (`Chart.tsx:79`) e não vem do dado, ao contrário da v1, da v2 e da v4; colado no Farol com outro trimestre, a linha erra o período.
- **v3**: o traço da mediana some onde cruza a barra: `--text-muted` contra `--chart-1` mede 1,82:1 no escuro e 1,12:1 no claro (TOK-10), nas linhas de Renata A., Murilo C. e Talita V. O valor está escrito no topo, então é referência; a saída da TOK-10 é interromper o traço sobre a barra ou dar-lhe halo.
- **v3**: o contorno tracejado de "sem meta definida" usa `--line-strong`; o papel Ausência da 17.2 pede contorno `--text-muted`. A palavra ao lado carrega a identificação.
- **v4**: contagens sem substantivo (NUM-6): "teto 180", "34 acima do teto do mês", "faltam 18"; o nome da fila sugere a unidade, mas nenhuma linha a escreve.
- **v4**: o traço do teto de premissa, com `opacity-50`, mede 2,33:1 no escuro e 1,96:1 no claro contra o trilho; a palavra "(premissa)" e o número escrito carregam a informação, e o traço segue visível nos dois PNGs.
- **v4**: o contorno tracejado da fila sem coleta usa `--line-strong`; mesma observação da v3 sobre o papel Ausência.
- **v4**: a frase acessível conta "1 acima do teto do mês" sem dizer qual fila; "Entradas novas, 34 acima" fecharia a conclusão.

Revisão de 2026-10-14, segunda passada da v4 depois da rodada de correção (motivo `revisao_desatualizada`).
v4 aprovada: a demanda agora está escrita em cada linha ("demanda 214 · teto 180") e a barra neutra
passou a `--text-muted`, que mede 5,21:1 e 5,37:1 contra o cartão e 5,98:1 e 4,65:1 contra o trilho. A
observação de 2026-09-18 sobre a demanda não escrita está resolvida. Os itens abaixo não impedem o uso
como referência.

- **v4**: na fila que estourou, a barra neutra e o excedente medem 1,05:1 entre si no escuro (`#7f8fab` contra `#f2617a`) e 1,18:1 no claro (`#5c6b87` contra `#b5253f`), e não há o vão de 1,5 px nem o contorno `--surface-raised` da COR-5. A emenda se lê pelo matiz (simulado, diferença de cor de 20 e 29 em protanopia, 40 e 46 em deuteranopia), pelo estreitamento da ponta arredondada da barra neutra e pelos números escritos com o ícone; em leitura sem cor, só o estreitamento marca onde fica o teto. Com `--line-strong`, que voltou a valer porque a demanda está escrita, o par sobe para 3,08:1 e 3,47:1.
- **v4**: a Anatomia, item 3, ainda diz `var(--line-strong)` para a demanda contra teto, e o `Chart.tsx` usa `--text-muted`; o parecer de 2026-10-14 pedia, nesta opção, atualizar a Anatomia e registrar o desvio no `notes` do `meta.json`, e nenhum dos dois mudou. O `notes` também diz "teto e período aparecem em texto por linha", e o período aparece uma vez, na linha do topo.
- **v4**: `--text-muted` faz dois papéis da 17.2 no mesmo visual, neutro de dado na barra e referência no traço do teto; a forma separa os dois, mas na fila que estourou o traço some sobre a emenda (já anotado em 2026-09-18). Voltar a barra para `--line-strong` resolve este item e o primeiro de uma vez.
- **v4**: demanda medida igual a zero desenha barra de largura 0% e nada no trilho, só "demanda 0" escrito (EST-3, ramo latente, fora do dado publicado); a v3 resolveu o mesmo caso com traço de base.
- **v4**: os números em `kpi-number` não declaram peso e pedem Space Grotesk 400, que não está entre os pesos carregados (TIP-4); o navegador cai para 500 e o PNG não mostra defeito. "ago/26" na linha do topo sai em Manrope sem `tabular-nums` (TIP-1).

## Correção de 2026-09-25

**v3.** A `teamMedian` era calculada sobre `withQuota`, mas a única guarda de vazio testava
`data.length`. Com linhas no recorte e nenhuma cota definida, `median([])` devolvia `0` e o cartão
imprimia "mediana da equipe 0,0%", que é zero medido no lugar de ausência, mais um traço tracejado
plantado no zero do trilho de todas as linhas, lido como mediana de 0%.

O que mudou: `median` passa a devolver `number | null` e a guarda de vazio é a lista que alimenta a
mediana, não `data`; o caso vazio escreve `formatUnavailable()` com o ícone `Unplug` em
`--text-muted` (EST-2) e o traço da mediana deixa de ser desenhado, porque não há mediana. A frase
acessível ganhou o motivo junto do indisponível. A mensagem do recorte vazio parou de dizer "não há
executivo com cota no período", que agora é outro estado, e diz que o filtro não devolveu executivo.

**Conserto de caminho latente:** o dado publicado tem sete executivos com cota, então o defeito não
aparecia no preview e o desenho não mudou (render mediu 0,00% de diferença nos dois temas). O que se
conserta é o ramo, não a foto.
