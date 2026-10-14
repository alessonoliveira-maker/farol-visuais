# Pequenos múltiplos de dispersão

## O que é

A mesma dispersão repetida por grupo, em painéis do mesmo tamanho, lado a lado, com domínio e cortes idênticos em todos. Cada painel responde à mesma pergunta (aqui, ticket contra ciclo de fechamento) para um grupo diferente, e o domínio compartilhado é o que permite comparar posição e forma de um painel para outro sem reler a escala a cada olhada. Lê se da esquerda para a direita e de cima para baixo, como uma pequena tabela de gráficos.

## Quando usar

- A mesma relação entre duas medidas em 4 a 12 grupos, como ticket contra ciclo por executivo.
- Mais de 5 grupos, que não cabem com cor e forma diferentes no mesmo plano sem virar confusão.
- Quadrante ou corte repetido por plataforma ou trimestre, com os mesmos limiares e contagem por região.
- Grupos com pelo menos cerca de 10 pontos por painel, para a nuvem ter forma reconhecível.

## Quando evitar

- Poucos pontos por painel: a comparação vira anedota; use pontos por categoria (família 17).
- Até 5 grupos cujas nuvens não se cobrem: use a dispersão simples por categoria (modelo 01), no mesmo plano.
- Domínio próprio por painel: a mesma posição na grade passa a significar valores diferentes de um grupo para o outro, o que é o defeito central que este modelo existe para evitar.
- Tela estreita reduzida a uma coluna só: mantenha pelo menos duas colunas visíveis e role a página em vez de empilhar tudo verticalmente.

## Anatomia

1. Grade de painéis em Tailwind (`grid-template-columns`/`grid-template-rows` calculados do número de grupos, `gap-3`), todos do mesmo tamanho.
2. Cabeçalho de cada painel em duas linhas: o nome do grupo sozinho na primeira, em `text-text-secondary` e com a largura inteira do painel, sem `truncate`; na segunda, a contagem de pontos com o substantivo ("11 oportunidades", NUM-6) e a mediana do grupo, em `text-text-muted`. Nome de marca desenhada não se corta (TIP-7), e com a contagem ao lado do nome sobravam cerca de 120 px dos 217 px do cabeçalho, o que cortava o nome mais longo da grade.
3. Um `ScatterChart` por painel, com `CartesianGrid` nos dois sentidos em `var(--line-subtle)`, a exceção da EIX-3 para planos com duas grandezas quantitativas. As posições das linhas vêm de `verticalCoordinatesGenerator`/`horizontalCoordinatesGenerator` próprios, calculados do `domain` e da área útil (`offset`), não dos tiques do eixo: o gerador padrão do Recharts deriva a grade do mesmo cálculo de decolisão de texto que decide o rótulo visível, então nos painéis sem rótulo (item 5) a malha saía incompleta e diferente de painel para painel (EIX-9).
4. Eixo x (ticket) e eixo y (ciclo) com o mesmo `domain` e os mesmos `ticks` em todos os painéis, formatados por `formatCurrencyAxis` e `formatDays`, com `interval={0}` para que os tiques declarados apareçam todos e na posição real, sem o realocamento por colisão de texto que o Recharts aplica por padrão (e que descolava o rótulo da própria linha de grade).
5. Ticks numéricos só na borda externa da grade: `tick` ativo apenas nos painéis da linha de baixo (eixo x) e da coluna da esquerda (eixo y); os demais mantêm a mesma largura e altura reservada com `tick={false}`, para os corpos dos painéis não mudarem de tamanho entre si. Da v2 em diante quem decide isso é a função `tickOwners`, porque a borda sozinha tem um buraco: painel sem observação não desenha eixo, então se ele calha na coluna da esquerda a fileira inteira perde a régua de ciclo, e se calha na fileira de baixo a coluna perde a de ticket; a responsabilidade passa então para o vizinho com observação, o mais à esquerda da fileira e o mais abaixo da coluna.
6. `ReferenceLine` tracejada na mediana do ciclo do próprio grupo, em `var(--text-muted)` (papel de Referência, 17.2) com `ifOverflow="extendDomain"`, sem rótulo inline: o valor ("mediana X dias") mora no cabeçalho do painel, porque a nuvem cresce na diagonal e cobre o corpo inteiro do gráfico, sem canto seguro para texto sem risco de esconder um ponto (ANO-3).
7. Nota `aria-hidden` acima da grade declarando por extenso o domínio comum dos dois eixos, para quem olha um painel isolado não presumir escala própria. Da v2 em diante o domínio é **derivado do `data`** (maior valor arredondado para cima pelo passo do eixo), e não constante escrita no topo do arquivo: só assim a promessa de escala comum continua verdadeira quando a página passa outro conjunto por prop.
8. Painel sem observação não recebe plano: em vez do `ScatterChart` entra um bloco com `role="status"`, moldura tracejada em `border-line-subtle`, ícone `Filter` de 14 px e a frase da ausência em 11 px `--text-muted`. Grade e eixos com zero pontos afirmariam que o plano foi medido e nada caiu ali, que é frase diferente de não houve observação no período (EST-1, mais a DAD-2, que pede a ausência contornada).
9. Toda agregação de painel (mediana, contagem por região) trata lista vazia pelo tipo, `number | null`, nunca por `0` (EST-1b); o número ausente vira `formatUnavailable()` no cabeçalho e a linha de referência correspondente não é desenhada.

## Versões

- `v1_ticket-contra-ciclo-por-executivo`: ScatterChart por executivo numa grade de 4 colunas por 2 linhas, domínio de ticket e de ciclo compartilhado pelos 8 painéis, ticks só na borda externa da grade e mediana do ciclo de cada executivo como `ReferenceLine` tracejada dentro do próprio painel. O dado fictício carrega força de relação diferente em cada painel, de quase perfeita a nenhuma, que é o achado que a grade existe para encontrar.
- `v2_time-inteiro-ao-fundo`: a nuvem do time inteiro desenhada antes em todos os painéis, em anel vazado `--text-muted`, com as oportunidades do executivo do painel por cima em ponto cheio `--chart-1` com revestimento de `--surface-raised`. O fundo é literalmente a mesma figura nos 8 painéis, então o que muda é só onde o recorte cai dentro dela. O destaque não mora na cor: medido à mão, `--chart-1` contra `--text-muted` dá 1,82:1 no escuro e 1,12:1 no claro.
- `v3_doze-regioes-ordenadas-pela-mediana`: 12 regiões numa grade de 3 colunas, ordenadas pela mediana do ciclo, do mais curto ao mais longo, com a mediana escrita no cabeçalho de cada painel e o critério da ordem declarado na linha de leitura. O `data.ts` está em ordem alfabética de propósito, para a ordem da tela ser conferível contra ele à mão.
- `v4_quadrantes-por-trimestre-com-painel-vazio`: 6 trimestres com os mesmos cortes de ticket e de ciclo, contagem por região no cabeçalho, um painel de 2 pontos com a nota de amostra pequena, um painel sem nenhuma oportunidade com a moldura tracejada e a ausência escrita, e a meta que valia num dos trimestres declarada no cabeçalho daquele painel em vez de mover a linha só ali.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para o destino escolhido (seção 16 do `CONTRATO.md`) e troque `ExecutivePanel` e os grupos pelo tipo e pelos registros reais da página (por SDR, por região, por plataforma).
2. Na v1, recalcule `TICKET_DOMAIN`, `TICKET_TICKS`, `CICLO_DOMAIN` e `CICLO_TICKS` a partir do conjunto real de dados (nas v2, v3 e v4 isso já é derivado do `data` e só o passo, `TICKET_STEP` e `CICLO_STEP`, se escolhe), seguindo a EIX-4 (domínio termina na primeira linha de grade acima do maior valor); não copie os números fixos deste catálogo. Num painel deste tamanho, 3 tiques por eixo é o que cabe sem colidir; ao mudar a contagem, ajuste `MARGIN.right` e `Y_AXIS_WIDTH` para o rótulo do tique mais alto de cada eixo não estourar a borda do painel (item 4c da revisão de 2026-09-19).
3. Ajuste `COLUMNS` ao número de grupos da página; a conta de linhas e a de quem escreve o rótulo de cada eixo (`tickOwners`, da v2 em diante) já se adaptam ao número de fileiras resultante.
4. Se a página tiver mais de 12 grupos, pagine ou agrupe antes de passar `data`: o modelo pressupõe até cerca de 12 painéis legíveis.
5. Dê altura ao contêiner pai (a grade inteira, não cada painel) ou passe `height`; sem altura, cada `ResponsiveContainer` desenha zero.

## Referências

- Praticante: [Stephen Few, Simple Displays of Complex Quantitative Relationships](http://www.perceptualedge.com/articles/b-eye/complex_relationships.pdf): observar os pequenos múltiplos por bairro com os mesmos eixos e cada venda plotada, que revelam agrupamentos que um agregado esconderia.
- Catálogo: [Vega-Lite, Becker's Barley Trellis Plot](https://vega.github.io/vega-lite/examples/trellis_barley.html): observar painéis ordenados pela mediana.
- Documentação: [Observable Plot, Facets](https://observablehq.com/plot/features/facets): observar a regra de domínio compartilhado entre facetas e o recurso de repetir uma camada de contexto em todas elas, que é a técnica da v2.

## Observações da revisão (não bloqueantes)

- `v1_ticket-contra-ciclo-por-executivo`: a frase acessível mede 244 caracteres, a 6 do teto de 250 da ACE-1, e cresce com o nome do executivo mais lento; o check já avisa.
- `v1_ticket-contra-ciclo-por-executivo`: a linha de leitura declara o domínio comum em vez de uma conclusão calculada do dado, que é o que a ANO-5 descreve; a conclusão (quem fecha mais rápido) existe só na frase acessível.
- `v1_ticket-contra-ciclo-por-executivo`: o cabeçalho trunca `Diego Fernandes de Castro`, e a isenção da TIP-7 só vale hoje porque esse nome inteiro aparece na frase acessível, por ser o de mediana mais longa. Mudando o dado, o nome truncado pode deixar de estar na frase e a isenção cai junto; a saída é o nome em linha própria, acima da contagem.
- `v1_ticket-contra-ciclo-por-executivo`: dois nomes do `data.ts` trazem sobrenome por extenso (`Ana Beatriz Ramos`, `Diego Fernandes de Castro`) em vez da forma com inicial de sobrenome que a seção 3 do contrato exemplifica (`Talita V.`); são fictícios e o acervo já tem precedente aprovado, mas a forma com inicial é a que protege de coincidir com pessoa real.
- `v1_ticket-contra-ciclo-por-executivo`: com 11 pontos num corpo de cerca de 262 por 115 px, as marcas se encostam e a nuvem lê como um traço contínuo; a relação e a comparação entre painéis continuam legíveis, mas o ponto individual não se separa. Raio menor ou contorno na cor da superfície devolveria a contagem ao olho.
- `v1_ticket-contra-ciclo-por-executivo` (revisão de 2026-09-19): `TICKET_DOMAIN` e `CICLO_DOMAIN` são constantes declaradas no topo do arquivo, enquanto o `meta.json` e o catálogo dizem "domínio único calculado sobre o conjunto inteiro". O domínio é de fato único nos 8 painéis, que é o que o modelo precisa afirmar, mas ele não é derivado do `data`: com outro conjunto passado por prop, ponto acima de R$ 900 mil ou de 160 dias sai do corpo sem aviso. O passo 2 de "Como colar no Farol" já manda recalcular; derivar os dois domínios do próprio `data` fecharia a diferença entre o que o texto promete e o que o código faz.
- `v1_ticket-contra-ciclo-por-executivo` (revisão de 2026-09-19): os dois eixos usam `tickMargin={6}`, contra os 8 px que a EIX-5 fixa. Não há consequência medível no preview (nenhuma colisão nas duas medições da guarda `COLISAO-TEXTO`, nos dois temas), então fica anotado para o próximo agente que tocar o arquivo alinhar a constante.
- `v1_ticket-contra-ciclo-por-executivo` (revisão de 2026-09-19): o mesmo valor aparece com duas grafias na mesma tela, "R$ 900,0 mil" na nota de escala (`formatCurrencyCompact`, NUM-1 para rótulo) e "R$ 900 mil" no tique (`formatCurrencyAxis`, NUM-1 para eixo). Cada uma está no formatador certo do seu papel, e a leitura não muda, mas lado a lado a casa decimal chama atenção sem significar nada.
- `v1_ticket-contra-ciclo-por-executivo` (revisão de 2026-09-19): os 8 painéis trazem dado estritamente monotônico, um ticket maior sempre com um ciclo maior, então nenhuma nuvem tem ruído, agrupamento ou ponto fora da curva. O caso difícil exigido pela seção 3 está coberto pelo nome longo e pelo painel de ticket baixo, e a comparação entre painéis funciona, mas um conjunto com alguma dispersão real mostraria melhor o que uma dispersão serve para ler.

## Correções de 2026-09-19 (rodada de revisão)

- **Grade que mudava de painel para painel (EIX-9):** o `<CartesianGrid>` do Recharts deriva as linhas internas dos mesmos tiques que decidem o rótulo visível de cada eixo; como só a coluna da esquerda mostra o rótulo de Y e só a linha de baixo mostra o de X, o algoritmo de decolisão de texto do Recharts descartava as linhas internas de grade nos painéis sem rótulo naquele eixo, então cada painel acabava com uma malha diferente (alguns sem nenhuma linha interna). Corrigido com `verticalCoordinatesGenerator`/`horizontalCoordinatesGenerator` próprios (`ticketGridX`, `cicloGridY`), que calculam a posição de cada linha direto do domínio e da área útil do gráfico (`offset`), sem depender de `tick` estar ligado. A malha agora é idêntica nos 8 painéis.
- **Rótulo do tique máximo descolado da própria linha de grade, tiques sumindo, "160 dias" quebrando em duas linhas:** as três vinham da mesma causa, o algoritmo `interval="preserveEnd"` padrão do Recharts, que descarta rótulos internos por colisão de largura de texto e desloca o rótulo da ponta para não vazar do canvas, sem mover a linha de grade junto. Corrigido com `interval={0}` nos dois eixos (mostra exatamente os tiques declarados, na posição real, sem realocação) e `TICKET_TICKS`/`CICLO_TICKS` reduzidos de 4/5 para 3 linhas cada, que é o piso da EIX-4 e cabe sem colisão num painel de ~163×58 px. `Y_AXIS_WIDTH` subiu de 44 para 56 (dentro da faixa de 48 a 64 da EIX-6, resolvendo a quebra de "160 dias") e `MARGIN.right` subiu de 8 para 30, o espaço que o rótulo "R$ 900 mil" precisa para não ser cortado pela borda do painel agora que não é mais empurrado para dentro.
- **Contagem de pontos sem substantivo (NUM-6):** o cabeçalho do painel mostrava só o número (`11`); passou a escrever `11 oportunidades` (com plural condicional), na mesma linha.
- **Mediana pintada com o token de contexto de dado (17.2):** `MEDIAN_STROKE` usava `--line-strong`, que a tabela de papéis de cor reserva para série de comparação; a mediana é referência (média/corte de leitura), então passou a `--text-muted`, o token que a própria tabela nomeia para "Referência".
- Como efeito colateral da contagem mais longa, o cabeçalho de `Diego Fernandes de Castro` passou a truncar no render (antes não truncava em nenhum tema), então o comentário do `data.ts` sobre esse caso deixou de ser uma pendência.
- A nota de escala deixou de escrever `R$ 0` e `0` como texto literal: agora usa `formatCurrencyCompact(TICKET_DOMAIN[0])` e `formatDays(CICLO_DOMAIN[0])`, então acompanha o domínio se ele mudar.

## Correção de 2026-09-28

**v1, o painel sem oportunidade ficava com mediana zero.** `median` devolvia `0` para lista vazia,
então um executivo sem nenhuma ganha no recorte recebia a linha tracejada na base do painel e o
cabeçalho escrevia "mediana 0 dias", que se lê como o ciclo mais curto da grade justamente onde não
houve nada para medir; pior, esse painel seria eleito o mais rápido na frase acessível, porque o
`reduce` que procura o menor ciclo mediano rodava sobre todos os painéis.

O que mudou: `median` devolve `number | null`; o cabeçalho do painel escreve `formatUnavailable()`
no lugar do número e a `ReferenceLine` não é desenhada, as duas coisas contando a mesma história; os
extremos da frase acessível saem só dos painéis medidos; e a frase declara quantos painéis ficaram
sem oportunidade ganha.

**Conserto de caminho latente:** os 8 painéis publicados têm 11 pontos cada, então nada disso é
renderizado e o desenho não mudou. O que se conserta é o ramo, não a foto.

## Correção de 2026-09-28, segunda rodada de revisão

**v1, o cabeçalho cortava o nome do executivo (TIP-7).** O nome dividia a primeira linha com a
contagem de oportunidades e ficava com cerca de 120 px dos 217 px do cabeçalho, então
`Diego Fernandes de Castro` saía como `Diego Fernandes d...`. Nome de marca desenhada não se corta, e
a isenção da TIP-7 não se aplica a nome de categoria. O nome passou a ocupar a primeira linha
sozinho, com a largura inteira do painel, e a contagem desceu para a linha da mediana, que já
existia: o cabeçalho continua com duas linhas e nenhuma altura foi tirada do gráfico. O nome mais
longo do dado também encolheu, para `Diego F. Castro`. Fica declarado o que acontece com um nome
maior que a linha: ele quebra em duas e encolhe o corpo daquele painel, o que se vê, em vez de sumir
por reticência.

**v1, os oito painéis ensinavam correlação perfeita.** Os onze pontos de cada painel subiam quase em
linha reta, ou seja a dispersão não dispersava, e a peça que existe para comparar a relação entre
duas medidas mostrava a mesma relação em todo recorte. O `data.ts` foi reescrito com força de relação
diferente por painel, medida em Pearson sobre os próprios pares: Camila O. +0,98 e Felipe N. +0,80
sobem juntas, Giovana P. −0,87 anda ao contrário, Ana Beatriz Ramos +0,62 e Bruno C. +0,48 ficam no
meio, Diego F. Castro −0,42 é fraca com um ponto solto, e Elisa T. +0,04 e Hugo M. 0,00 são nuvens
sem relação nenhuma. O número de oportunidades por executivo passou a variar de 10 a 12, porque no
trimestre real ele varia e o cabeçalho de cada painel escreve o próprio `n`.

Com isso saem duas das observações não bloqueantes registradas acima: a do cabeçalho truncado e a do
dado estritamente monotônico. A frase acessível também deixou de raspar o teto da ACE-1, porque o
nome mais longo encolheu: são 234 caracteres, contra os 244 de antes.

## Terceira rodada de 2026-09-28: v2, v3 e v4

**O modelo fechou em 4 de 4 versões.** As três novas nasceram com o domínio dos dois eixos
**derivado do `data`**, com `tickMargin={8}` da EIX-5 e com a faixa de eixo x em 26 px; as três
diferenças em relação à v1 estão explicadas abaixo, e em todas elas quem venceu foi a regra.

### Onde a v1 e o vizinho propagariam desvio, e a regra venceu

- **`tickMargin` de 6 contra os 8 da EIX-5.** A v1 escreve `tickMargin={6}` nos dois eixos
  (`v1_ticket-contra-ciclo-por-executivo/Chart.tsx`, linhas 186 e 198), e a própria EIX-5 fixa 8 com
  grade. Como não há consequência medível no preview da v1, a 14.1 a classifica como observação, e a
  v1 já a registra acima. As v2, v3 e v4 usam 8.
- **Domínio em constante contra domínio calculado.** A v1 declara `TICKET_DOMAIN` e `CICLO_DOMAIN`
  como constantes do topo do arquivo (linhas 26 e 30), enquanto o `meta.json` dela promete "domínio
  único calculado sobre o conjunto inteiro" e a EIX-9 pede domínio **calculado sobre o conjunto**. As
  três novas derivam o topo de cada eixo do maior valor observado, arredondado para cima pelo passo,
  e por isso a promessa continua verdadeira com outro `data` vindo por prop.
- **Número de tela escrito à mão no vizinho.** `10_matriz-de-dispersao/v1_quatro-medidas-de-campanha/Chart.tsx`
  escreve `0 a {measure.format(...)}` nas linhas 153 e 165: o `0` é número de tela digitado, e a
  seção 8 manda todo número de tela passar por `@/lib/format`. Ele escapa da guarda NUMERO-CRU só
  porque o elemento carrega `tabular-nums`, que é a exceção N1 da guarda, não uma licença da seção 8.
  Aqui as pontas do domínio saem de `formatCurrencyAxis` e `formatDays`.

### A faixa do eixo x, medida

`X_AXIS_HEIGHT` subiu de 18 para 26 px nas três novas versões. O rótulo do tique nasce a `tickMargin`
da linha do eixo e a tinta dele mede cerca de 15 px, então a faixa precisa de pelo menos 23 px: com
18 px o render acusava `Conteudo passa da area do corpo` no rótulo da fileira de baixo, nos dois
temas, nas três versões. Aumentar o canvas **não** resolvia, porque a grade é `flex-1` e absorve a
altura nova empurrando o rótulo junto; quem resolve é a faixa reservada. A v1 foi re-renderizada
nesta rodada para conferir se carregava o mesmo desvio e **não carrega**: sai sem aviso de corpo.

### O painel sem observação, que é o teste deste modelo

Pequeno múltiplo quase sempre tem célula vazia, e a saída fácil, desenhar o plano com zero pontos,
afirma uma coisa que não foi medida. Aqui o painel vazio **não recebe plano**: sem grade, sem eixo e
sem nuvem, com a moldura tracejada que a DAD-2 pede para ausência e a frase escrita ao lado do ícone
`Filter`, que é o desenho da EST-1. O cabeçalho acompanha: a contagem escreve `0 oportunidades`,
porque zero medido é zero (EST-3), e as duas linhas de contagem por região dizem "sem oportunidade"
em vez de "0 rápidas, 0 lentas", que daria à divisão por quadrante uma precisão que ela não tem ali.
A mediana, onde o modelo a escreve, sai por `formatUnavailable()` e a linha de referência não é
desenhada (EST-1b e EST-2).

Junto veio um defeito que só aparece com painel vazio e que a v1 também tem em latência: **com o
rótulo de eixo apenas na borda da grade, um painel vazio na coluna da esquerda deixa a fileira sem
régua de ciclo, e na fileira de baixo deixa a coluna sem régua de ticket**. A função `tickOwners`
passa a responsabilidade para o vizinho com observação. Na v4 isso é visível: a coluna da esquerda
escreve os rótulos de ticket sob o painel de cima, e a fileira de baixo escreve os de ciclo no painel
do meio. É estranho e é correto; o contrário seria uma fileira inteira sem escala.

### O que o check não mediu, e a medição à mão que entrou no lugar

`CONTRASTE-MARCA` e `ESPESSURA-MARCA` saem `preview_com_transform` nas **quatro** versões deste
modelo, porque o leitor de marcas não compõe a matriz do Recharts. Estar fora do escopo de uma guarda
não é estar aprovado por ela, então os pares foram medidos à mão pela fórmula da WCAG contra
`--surface-raised`, nos dois temas: `--chart-1` mede 9,50:1 no escuro e 6,00:1 no claro;
`--text-muted` mede 5,21:1 e 5,37:1; `--line-subtle`, da grade, mede 1,25:1 e 1,29:1, abaixo do piso,
o que é deliberado, porque quem carrega a posição é o ponto e não a linha atrás dele.

O par que **nenhuma guarda mede** é marca contra marca, e ele decide a v2: `--chart-1` contra
`--text-muted` mede **1,82:1 no escuro e 1,12:1 no claro** (TOK-9). No tema claro, portanto, a cor
sozinha não separa o destaque do contexto, e é por isso que a v2 soma preenchimento (ponto cheio
contra anel vazado), tamanho (raio 3,8 px contra 2,6 px) e revestimento de `--surface-raised` por
baixo do contorno, que mede 9,50:1 contra `--chart-1` no escuro e 6,00:1 no claro (TOK-4).

### Divergências declaradas

- **17.2 contra a seção 7, na cor da nuvem de fundo da v2.** A tabela de papéis da 17.2 dá o papel de
  "Neutro de dado" a `--line-strong`, que mede 1,79:1 e 1,83:1 contra o cartão e só se sustenta com o
  valor escrito na marca. Numa nuvem de 84 pontos não há valor a escrever em cada um, então a v2 usa
  `--text-muted`, que a tabela de tokens da seção 7 nomeia "categoria neutra" e que mede 5,21:1 e
  5,37:1. Pela 14.1 contraste é regra que decide o que o desenho afirma, e regra dessas se resolve
  pela medição.
- **Itens 1 e 4 da especificação do catálogo da v4.** O catálogo pede ao mesmo tempo "mesmos cortes
  em todos os painéis" e "meta que mudou no trimestre escrita no título do painel afetado". Movendo a
  linha só naquele painel, a mesma posição passaria a significar valores diferentes de painel para
  painel, que é o defeito central que este modelo existe para evitar (EIX-9). Resolvido a favor do
  CONTRATO: o corte desenhado é o atual nos seis painéis e a meta daquele trimestre vai escrita no
  cabeçalho, para quem lê a contagem saber contra que régua ela foi feita.

### Observações da terceira rodada (não bloqueantes)

- `v2`: o `preview.svg` pesa cerca de 265 KB, quase o triplo da v3 e cinco vezes a v4, porque a nuvem
  de fundo são 84 marcas repetidas em 8 painéis, 672 círculos mais os 84 do destaque. É o preço da
  técnica e não há corte óbvio: reduzir a nuvem seria reduzir a régua.
- `v2`: a nuvem de fundo inclui os pontos do próprio executivo do painel, de propósito, para o fundo
  ser literalmente a mesma figura nos 8 painéis. A consequência é que cada ponto aceso pousa sobre um
  anel neutro, e quem separa os dois ali é o revestimento na cor do cartão.
- `v4`: um painel que fosse ao mesmo tempo de amostra pequena e de meta diferente escreveria as duas
  notas na mesma linha da contagem, que a essa altura passaria de 60 caracteres e quebraria em duas,
  encurtando o plano daquele painel. Não acontece com o dado publicado, e a saída, se acontecer, é
  encurtar a nota e não abrir linha nova.
- `v3`: a frase acessível mede 207 caracteres e cresce com o nome das regiões; a da `v2` mede 226 e a
  da `v4` mede 233, contra o teto de 250 da ACE-1 e o aviso a partir de 235.
- Todas as três: o `Filter` do estado vazio de painel é o mesmo ícone do estado vazio do visual
  inteiro. Um ícone próprio para célula sem observação distinguiria melhor os dois níveis, mas não
  existe convenção de casa para isso e inventar uma aqui seria decidir sozinho.
