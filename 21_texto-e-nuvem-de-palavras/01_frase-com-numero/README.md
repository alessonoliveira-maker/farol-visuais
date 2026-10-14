# Frase com número e legenda embutida

## O que é

A frase é a peça e o número é parte dela. O modelo tem duas formas que dividem a mesma ideia: a frase que carrega a conclusão e pinta o nome de cada série com a cor do traço do gráfico ao lado, dispensando a legenda; e o KPI em texto corrido, com o número em Space Grotesk dentro de uma frase de uma ou duas linhas, a unidade colada e a base da comparação escrita. A frase nunca é digitada: sai de uma função pura sobre o dado, que decide o verbo (cresceram, caíram, ficaram estáveis) pelo sinal e por um corte de estabilidade declarado, e trata singular, plural, zero, base zero e ausência. A cor nunca trabalha sozinha: a palavra pintada leva peso 600 e o número leva sinal.

## Quando usar

- Abrir uma tela com a conclusão do recorte em uma frase, com um ou dois números e a base da comparação.
- Substituir a legenda de um gráfico de duas a quatro séries pintando os nomes na frase com a cor de cada série.
- Sumário executivo da Diretoria lido em voz alta ou colado num e-mail, com até três frases.
- Título dinâmico de painel filtrável, desde que a frase seja recalculada a cada filtro.
- Número que precisa sair em faixa (cenário) ou com a palavra premissa, onde o card de KPI forçaria um ponto.

## Quando evitar

- Mais de três números numa frase: vira enigma; use a tabela visual (família 14) ou a tira de KPIs (01/07).
- O número sozinho é a peça, com variação e meta: use o KPI simples com contexto (01/01).
- Frase fixa sobre dado filtrável: contradiz o gráfico no primeiro filtro; gere a frase ou tire o texto.
- Cor como único canal de destaque na palavra: some para quem não distingue a cor; sempre junto de peso 600 ou 700.
- Comparação entre muitas entidades: o texto esconde a ordem; use barras simples ordenadas (02/01).

## Anatomia

1. **Função de frase:** função pura do próprio `Chart.tsx` que devolve uma lista de peças (texto, número, série, alerta, indisponível) e não uma string; a mesma lista alimenta a tela e a frase acessível, então o corpo e o `aria-label` nunca divergem (DAD-5).
2. **Palavra de série:** nome em `font-semibold` com a cor vinda do mesmo objeto que pinta o traço (`var(--chart-1)`, `var(--chart-3)`), na ordem calculada do dado.
3. **Número:** `kpi-number font-semibold text-text-primary`, por `formatCurrencyCompact`, `formatInt`, `formatPercent` ou `formatDecimal`; percentual inteiro a partir de 10% e com uma casa abaixo (NUM-1).
4. **Variação:** sinal tipográfico `+` ou `−` escrito à mão sobre o valor absoluto (NUM-3), ícone `TrendingUp` ou `TrendingDown` e cor pela polaridade; estável fica em `text-text-secondary`. A base vai na mesma frase (NUM-4).
5. **Dataword:** `<svg>` de `1em` de altura dentro de um contêiner `inline-flex` (GEO-17), geometria calculada em TypeScript, traço em `--text-muted` sem área e o último ponto na cor do número.
6. **Alerta:** o multiplicador contra o teto em `text-negative font-bold` com `TriangleAlert`, o único peso 700 do visual.
7. **Ausência:** `Unplug` e `formatUnavailable()` com o motivo escrito, nunca um zero; zero medido sai por extenso ("nenhuma agenda").
8. **Gráfico (só na v1):** `LineChart` de duas séries sem `Legend`, marcador e valor no fim de cada linha, grade horizontal, dica com os dois valores do mês.
9. **Acessibilidade:** raiz com `role` e `aria-label` calculado da mesma lista de peças; as frases visíveis levam `aria-hidden` para o leitor de tela não ler duas vezes.

## Versões

- [`v1_leads-qualificados-contra-totais`](./v1_leads-qualificados-contra-totais/) ([escuro](./v1_leads-qualificados-contra-totais/preview.svg), [claro](./v1_leads-qualificados-contra-totais/preview-claro.svg)): os leads qualificados cresceram 12% em out/26 contra 1,9% dos totais. Demonstra os nomes das séries na frase com a cor do traço, peso 600 junto da cor, verbo e ordem calculados e o gráfico de duas linhas sem legenda.
- [`v2_receita-do-mes-em-texto-corrido`](./v2_receita-do-mes-em-texto-corrido/) ([escuro](./v2_receita-do-mes-em-texto-corrido/preview.svg), [claro](./v2_receita-do-mes-em-texto-corrido/preview-claro.svg)): receita de set/26 em texto corrido, `+8,4%` contra ago/26 e a tendência de 12 meses. Demonstra o número em `kpi-number`, a sparkline inline de 1em com geometria em TypeScript e o último ponto na cor do número.
- [`v3_sumario-executivo-da-diretoria`](./v3_sumario-executivo-da-diretoria/) ([escuro](./v3_sumario-executivo-da-diretoria/preview.svg), [claro](./v3_sumario-executivo-da-diretoria/preview-claro.svg)): três frases da Diretoria. Demonstra no máximo dois números por frase, o multiplicador 3,1x contra o teto em `text-negative` com peso 700 e ícone, o cenário em faixa e a palavra premissa.
- [`v4_zero-um-estavel-e-ausente`](./v4_zero-um-estavel-e-ausente/) ([escuro](./v4_zero-um-estavel-e-ausente/preview.svg), [claro](./v4_zero-um-estavel-e-ausente/preview-claro.svg)): a mesma função diante de nenhuma agenda, uma agenda, plural, variação estável, base zero e dado não coletado, mais o título com empate. Demonstra concordância por extenso, corte de estabilidade, base zero sem infinito e ausência com motivo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDaFrase>/`. A v1 vai dentro de um `VisualCard` (a raiz não tem borda nem fundo, ESP-4); v2, v3 e v4 também, porque a moldura do catálogo é `card`.
2. Troque o `data` pelo recorte já filtrado da página. A frase é recalculada a cada render: o título do `VisualCard` não pode repetir o que ela diz.
3. Na v1, o objeto `SERIES` é a fonte única da cor. Se a página já tem um mapa de categoria para slot, importe dele em vez de repetir os dois slots, para o nome na frase e o traço nunca divergirem.
4. Troque `polarity` (v2) e `STABLE_CUT` pelo sentido do bom e pelo corte do dicionário da métrica; nunca decida a cor pelo sinal da variação.
5. Na v3, a etiqueta de procedência (MEDIDO, DERIVADO, PREMISSA) é do `VisualCard`; a palavra premissa na frase fica.
6. Na v4, o estado vazio inline dá lugar a `EmptyState` e a ausência inline a `UnavailableState` quando a página já os usa, mantendo o motivo escrito.

## Referências

- [Storytelling with Data, storytelling with simple text](https://www.storytellingwithdata.com/blog/2021/5/20/storytelling-with-simple-text): com um ou dois números, o texto grande comunica melhor que o gráfico.
- Tufte, Beautiful Evidence, capítulo sobre sparklines: o dataword, o gráfico do tamanho de uma palavra dentro da frase.
- Pedido de formatador: `@/lib/format` não tem formato de moeda com duas casas no compacto (o catálogo escreve R$ 1,24 mi); a v2 usa `formatCurrencyCompact`, que devolve R$ 1,2 mi.
- Estudo da família: [`_estudo/familias/21_texto-e-nuvem-de-palavras.md`](../../_estudo/familias/21_texto-e-nuvem-de-palavras.md).
- Farol: `app/src/lib/format.ts` (formatadores) e `app/src/components/visuals/charts/chartTheme.ts` (`useAnimateOnce`, `AXIS_PROPS`).
- Molde: `_render/exemplos/01_cards-e-kpis/01_kpi-com-sparkline/`.

## Observações da revisão (não bloqueantes)

**2026-10-13, revisão independente das quatro versões.** `v1`, `v2`, `v3` e `v4` aprovadas, sem bloqueante. `npm run check` com tipos: 0 com erro, 0 aviso. Contraste medido nos dois temas com os tokens de `app/src/styles/tokens.css`, escuro e claro: palavra em `--chart-1` 9,50:1 e 6,00:1; palavra em `--chart-3` 6,47:1 e 6,18:1; `--negative` 5,50:1 e 6,36:1; `--positive` 7,36:1 e 5,34:1; `--text-muted` 5,21:1 e 5,37:1. Os dois primeiros itens são os de maior peso. Nenhum item abaixo reprova.

- `v2`: no `preview.svg` os dois números principais (`R$ 1,2 mi` e `R$ 1,1 mi`) saem 4 px abaixo da linha de base da frase e o `12` sai 3 px abaixo, nos dois temas; na página viva estão alinhados. Fidelidade refeita com a conta do render (maior diferença por canal acima de 48): 0,80% no escuro e 0,78% no claro, acima do teto de 0,5% da pergunta 21 e dentro da faixa de aviso da seção 12, que só dá erro acima de 2%. Não há colisão nem corte. A origem é o serializador: o parágrafo que contém `<svg>` é partido em um `foreignObject` por trecho, e o `span` com classe própria herda `line-height: 40px` dentro de uma caixa de 31 px. O `+8,4%`, que mora num `inline-flex`, não se desloca; o mesmo contêiner nos dois números tira o desvio enquanto a ferramenta não muda. Mesmo tratamento de `16/06`, `24/02` e `25/07`.
- `v4`: a frase acessível lista só os nomes dos casos ("zero, um, plural, estável, sem base, sem coleta e empate") e a lista inteira leva `aria-hidden`. Quem ouve não recebe equipe, número, a equipe sem coleta nem o empate (pergunta 19, ACE-1, e seção 11, que reserva `aria-hidden` ao que é decorativo). O conteúdo cabe em 199 caracteres: "7 frases de agendas realizadas em out/26: Equipe Leste nenhuma, Oeste 1, Sul 2, Centro 2.312 (estável), Nova 6 (sem base), Norte indisponível. Plataforma Norte e Plataforma Sul empatam em 14 agendas." A outra saída é tirar o `aria-hidden` da lista. "Geradas pela mesma função" é fala de catálogo e não deve chegar ao Farol.
- `v2`: a frase acessível começa pelo assunto ("Receita reconhecida em set/26") e não pelo tipo, e fecha com "A tendência de 12 meses está na frase", que aponta para um desenho escondido de quem ouve sem dizer para onde a série vai (ACE-1). O molde `01_kpi-com-sparkline` faz o mesmo. A frase tem 122 caracteres; com o menor mês e o maior ela chega a 149.
- `v2`: ramos fora do dado padrão. Variação exatamente zero sai `−0,0%`, porque `signedPercent` só testa `fraction > 0`. Com o mês corrente nulo, a frase visível perde o mês e o motivo, que ficam só no `aria-label`, e a nota continua dizendo "o ponto é set/26" sem ponto desenhado. Com menos de 3 meses medidos a nota descreve uma sparkline que não existe. Com um mês só, o cartão diz "Nenhum mês neste recorte" em vez de escrever o valor com "sem mês anterior medido" (EST-4).
- `v2`: `R$ 1,2 mi` contra `R$ 1,1 mi` com `+8,4%`: quem refaz a conta com os números impressos chega a 9,1%. É a precisão do `formatCurrencyCompact` (NUM-1), já declarada no `notes` e no pedido de formatador das Referências; não é erro de conta.
- `v2`: o `12` em Manrope com `tabular-nums` a 24 px abre um vão visível entre os dois algarismos, na página e no arquivo. `font-display` no número, como nos outros três da frase, iguala a leitura.
- `v1`: o vínculo entre o nome na frase e a linha é só a cor. As duas cores distam em matiz (COR-8), mas uma contra a outra medem 1,47:1 no escuro e 1,03:1 no claro, então em impressão cinza o vínculo some e resta a semântica (qualificados são parte dos totais). É o desenho que o catálogo pede e é o mesmo canal de uma legenda; em cartão largo, o nome curto ao lado do valor do fim da linha daria o segundo canal (ACE-2).
- `v1`: `interval={0}` imprime os 12 meses, acima do teto de 8 da EIX-7. No canvas `card` cabem com 9 px entre rótulos, medido nos dois PNGs; em cartão mais estreito colidem. Falta a constante local do teto.
- `v1`: ramos fora do dado padrão. Com um mês só, a frase sai vazia e o gráfico desenha uma linha de um ponto (EIX-11). Com as duas séries terminando próximas, os rótulos do fim das linhas não têm respiro mínimo declarado (ROT-2, 16 px entre âncoras).
- `v3`: ramos fora do dado padrão. Sem previsão de entradas e com teto declarado, a frase diz "sem teto de capacidade para comparar", motivo trocado: `ratioOf` devolve `null` pelos dois caminhos e o texto só conhece um. "As entradas previstas para out/26 estão indisponível" não concorda em número. Com os três blocos nulos a frase acessível mede 273 caracteres, acima do teto de 250; hoje mede 232.
- `v3`: o `demonstrates` diz "geradas pela mesma função", como o catálogo, e o código tem três funções de frase (`revenueSentence`, `intakeSentence`, `scenarioSentence`) sobre o mesmo vocabulário de peças e o mesmo `renderPiece`.
- `v3`: no canvas `largo` cada frase cabe em uma linha e as três ocupam cerca de 119 px dos 265 px do corpo; o resto fica vazio, centrado. O `notes` declara a sobra como espaço para a quebra em duas linhas.
- `v4`: `font-display` sem classe de peso em "indisponível" pede Space Grotesk 400, que não é carregada (TIP-4); o navegador resolve para 500, e o preview embute 500 e 600. Vale `font-medium`. O mesmo trecho existe na `v2` e na `v3`, fora do dado padrão.
- `v4`: ramo fora do dado padrão. O `deltaPiece` (base a partir de 10 e variação acima do corte) decide o tom pelo sinal, sem polaridade declarada (COR-6), e não leva ícone (ACE-2 pede sinal e ícone). Para agendas realizadas o resultado está certo, mas o passo 4 de "Como colar no Farol" manda nunca decidir a cor pelo sinal.
- `v1`, `v2`, `v3` e `v4`: a frase, que é a peça, sai em 16, 24, 20 e 16 px: o mesmo papel em três tamanhos, nenhum deles na tabela 17.1 (TIP-2, teto ainda sem mecanismo). Sem consequência visível; falta uma linha na tabela para a frase que é a peça.
- `v1`, `v2` e `v4`: três cortes de estabilidade para o mesmo conceito (0,5%, 0,05% e 1%). O da `v2` só pega o que arredonda para 0,0%. O passo 4 manda trocar pelo corte do dicionário da métrica e não diz qual é o padrão.
- Anatomia, itens 1 e 9: "a mesma lista alimenta a tela e a frase acessível" vale para a `v1` e a `v3`. A `v2` monta a frase em JSX e a fala numa cadeia paralela, e a `v4` fala só os nomes dos casos.
