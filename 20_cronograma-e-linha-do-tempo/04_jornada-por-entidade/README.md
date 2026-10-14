# Jornada por entidade

## O que é

Uma linha por oportunidade, com segmentos contíguos pintados pela etapa em que ela esteve. O comprimento do segmento é o tempo na etapa, a ordem dos segmentos é a ordem do funil, e a mesma etapa longa repetida em muitas linhas denuncia o gargalo. O eixo pode ser o calendário (cada linha na sua data) ou os dias desde a criação (todas partem do dia zero). A variante de Marey troca os segmentos por uma linha em degrau que sobe de etapa em etapa e desce quando a oportunidade volta. Feito em Recharts nativo, com `BarChart` de layout vertical e pilha de durações nas três primeiras versões e `LineChart` com `stepAfter` na quarta.

## Quando usar

- Tempo em cada etapa do funil, caso a caso, de 10 a cerca de 60 entidades (v1, v3).
- Achar o gargalo: a mesma etapa longa se repetindo em muitas linhas (v1, v3).
- Achar a oportunidade aberta que está parada e dizer em que etapa (v2).
- Comparar ciclos alinhando todas as entidades pelo dia zero da criação (v3).
- Velocidade de passagem e retorno de etapa em até cerca de 12 oportunidades (v4).

## Quando evitar

- Só a etapa atual importa: use o stepper (20/03).
- Volume agregado por etapa, sem identidade de entidade: use o funil (família 10).
- Transições entre etapas em massa: use o Sankey (família 11) ou a matriz de transição (15/07).
- Muitas etapas curtas e ilegíveis: agrupe em fases antes de desenhar.
- Centenas de entidades: use a lasagna (15/06) ou o Marey em SVG puro.
- Quatro ou mais etapas em que a ordem precisa ser lida pela cor: a rampa sequencial do Farol não separa os degraus (TOK-8), então a ordem vai pela posição e pela legenda escrita.

## Anatomia

1. **Linha por oportunidade.** Nome no eixo vertical (v1, v2) ou só na dica (v3), ordenado pela criação (v1), pela pior parada (v2) ou pelo ciclo total (v3).
2. **Segmento por etapa.** Um `Bar` por etapa na mesma pilha; uma série `g` sem marca empurra a pilha até a data de criação. A tupla `[entrada, saída]` do catálogo não empilha no Recharts, então as durações em dias viram a pilha.
3. **Cor da etapa.** Identidade por etapa nos slots categóricos 1, 3, 6 e 5 (`--chart-1`, `--chart-3`, `--chart-6`, `--chart-5`) na ordem do funil (v1, v3), todos acima de 3:1 nos dois temas; a ordem mora na posição e na legenda, com contorno `--surface-raised` entre vizinhos. Na v2 o destaque é `--negative` com hachura e o resto é `--surface-sunken` com contorno `--text-muted` (`--line-strong` como área mede 1,79:1 contra o cartão).
4. **Legenda.** Amostras na ordem do funil e na ordem das marcas, acima do gráfico.
5. **Eixo de tempo.** Meses por `formatMonthShort` (v1, v2, v4) ou dias por `formatDays` (v3), sempre com `ticks` calculados.
6. **Marcas de exceção.** Losango `--positive` no fechamento (v1), hachura e rótulo "parada N d" (v2), mediana de saída de cada etapa em `ReferenceLine` (v3), anel no trecho descendente da própria linha, na cor dela, e data da volta em faixa sem traço, com linha de chamada pontilhada quando o texto não cabe ao lado (v4).
7. **Ponta aberta.** Etapa em andamento termina em hoje, vindo do dado, com traço tracejado (v2, v4).
8. **Linha de leitura.** Uma frase de 12 px calculada do dado, `aria-hidden`.
9. **Dica.** Etapa, dias e datas por `formatDays` e `formatDate`: o que o corpo não escreve.
10. **Estado vazio.** `role="status"` com `Filter` e uma frase de 12 px em `--text-muted`.

## Versões

- **`v1_oportunidades-ganhas-por-etapa`**: 15 oportunidades ganhas no trimestre, quatro etapas com cor por identidade, linhas pela data de criação e losango de fechamento.
- **`v2_tempo-parado-em-destaque`**: 12 oportunidades abertas, etapa com mais de 30 dias em hachura com `useId`, rótulo "parada N d" escrito, demais segmentos em cinza e ponta aberta em hoje.
- **`v3_alinhada-pelo-dia-zero`**: 40 oportunidades em dias desde a criação, linhas pelo ciclo, mediana de saída de cada etapa em `ReferenceLine`, barras finas e nome só na dica. Canvas por número (640 x 880), declarado no `notes`.
- **`v4_marey-com-retorno-de-etapa`**: 10 oportunidades em `LineChart` com `stepAfter`, retorno de etapa com marcador e data, abertas tracejadas até hoje, a mais rápida e a mais lenta em cor.

## Como colar no Farol

1. Copie o `Chart.tsx` da versão e troque o default de `data` pelas datas de entrada em cada etapa, que o histórico de etapas da oportunidade já tem. O dado vem em datas `YYYY-MM-DD`; o componente converte em dias.
2. Envolva num `VisualCard` e passe o título por fora; o Chart não desenha cabeçalho de cartão.
3. Em v2 e v4, `today` vem do dado da página, nunca do relógio do componente.
4. O limite de 30 dias da v2 é uma premissa: ele vem de `stallDays` no dado e deve ser declarado no cartão como premissa, não como regra do Farol.
5. Com mais de 15 linhas na v1 ou na v2, aumente a altura do cartão antes de aumentar o vão: a barra tem piso de 12 px.
6. O estado vazio inline dá lugar ao `EmptyState` do Farol (seção 16, passo 7).

## Referências

- Edward Tufte, The Visual Display of Quantitative Information: o diagrama de Marey de horários de trem, que a v4 adapta para etapas de funil.
- Data Viz Catalogue, Gantt chart: a barra por período em eixo de tempo.
- Referência do Farol: `app/src/styles/tokens.css` para os tokens, `app/src/lib/format.ts` para `formatDate`, `formatDays` e `formatMonthShort`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-08, quatro versões julgadas: `v2` aprovada; `v1`, `v3` e `v4` reprovadas, com parecer em `validation/revisao_20_cronograma-e-linha-do-tempo__04_jornada-por-entidade_2026-10-08.md`. Nada abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3`, `v4`: a linha de leitura usa `truncate` e a cauda carrega o número ou a conclusão (`mediana de 21 dias`, `em proposta`, `mediana de 19 dias`, `voltaram de etapa`), o que a TIP-7 proíbe. No preview nada é cortado, mas na `v2` a folga é de 22,5 px: com `qualificação` no lugar de `proposta` a reticência come o nome da etapa. Escrever a conclusão primeiro ou deixar quebrar em duas linhas.
- `v1`, `v3`: a amostra da legenda é um quadrado de 10 px com `rounded-sm` e sai redonda, enquanto a marca é um retângulo de raio 1 a 2 px (ROT-4). Na `v2` a amostra `dentro do prazo` sai em pílula pelo mesmo motivo.
- `v1`, `v2`: `barCategoryGap` de 24%, abaixo dos 30% da ESP-2 e declarado no `meta.json`; a barra mede 12 px na `v1`, que é o piso exato, e 15 px na `v2`, sem consequência no preview.
- `v1`: a etapa de 1 dia (qualificação da `Oportunidade 11`) tem 2,8 px, e o contorno de 1,5 px na cor do cartão deixa cerca de 1,3 px de tinta. Ainda se vê nos dois temas; num eixo mais longo some. Vale um piso de largura visível.
- `v1`: o título do `meta.json` (`Jornada das oportunidades ganhas por etapa`) difere do título do catálogo (`Jornada das oportunidades ganhas no trimestre`) e a nota não declara a troca.
- `v1`, `v3`: `STAGE_COLORS[stage] ?? STAGE_COLORS[0]` devolve a cor da primeira etapa quando `stages` traz uma quinta; o tipo do dado fixa quatro entradas, mas `stages` é prop livre.
- `v2`: o rótulo escreve `58 d`, forma literal do catálogo, e a linha de leitura, a legenda, a dica e a frase acessível escrevem `dias`. A ROT-8 pede sem abreviação e a mesma medida sai de dois jeitos (DAD-5). Com `dias` o maior rótulo passa de 132 px para cerca de 150 px e pede margem direita maior que os 156 px de hoje.
- `v2`: três dos cinco rótulos (`Proposta, parada 58 d`, `Diagnóstico, parada 37 d`, `Qualificação, parada 36 d`) falam de etapa que a oportunidade já deixou, e `parada` lê como estado atual; só a `Oportunidade 06` e a `Oportunidade 01` estão paradas hoje. A hachura no meio da linha desfaz a dúvida, mas a redação pode separar o que ficou do que está.
- `v2`, `v4`: número em texto HTML fora de classe tabular: `30 dias` na linha de leitura e na legenda da `v2` e `08/10/2026` na legenda das duas (TIP-1). Sem coluna de números, não há consequência visível.
- `v2`: a grade desenha a borda direita do eixo em 2026-10-09, o fim da janela mais um dia, sem tique e 3 px depois da ponta de hoje; pode ser lida como a linha de hoje. Terminar o domínio em hoje alinha as duas.
- `v3`: quatro linhas de mediana com rótulo, e a ANO-1 fala em no máximo duas anotações por visual (a nota do `meta.json` cita "por tipo de marca", que não é o texto da regra). O catálogo pede a mediana de cada etapa, então a versão segue o catálogo e a divergência é da régua.
- `v3`: o rótulo da mediana traz só o valor (`8 dias`) e o nome mora na legenda, onde a ANO-2 pede nome e valor; `20 dias` e `40 dias` arredondam 19,5 e 39,5, e a linha é desenhada no valor exato.
- `v3`: `a etapa que mais pesa é proposta` vale pela mediana (19 dias contra 17,5 de negociação); pela soma de dias a ordem inverte (negociação 750, proposta 741, de 2.320). A frase declara a mediana, mas o dado fixo ensina melhor com as duas réguas apontando para a mesma etapa.
- `v3`: `key={value}` em `MedianLabels` e nas `ReferenceLine` repete a chave quando duas medianas acumuladas coincidem.
- `v3`: a legenda tem 11,5 px de folga antes de quebrar em duas linhas; ela tem `flex-wrap`, então quebra em vez de cortar e tira uma linha de altura do gráfico.
- `v4`: os trechos horizontais de todas as oportunidades caem nos mesmos cinco níveis e se cobrem. A mais rápida fica sob a mais lenta em qualificação de 06/07 a 09/07, 3 dos 7 dias dela, e nenhuma linha cinza pode ser seguida do começo ao fim. É consequência do `stepAfter` que o catálogo pede; um deslocamento vertical de 2 px nas linhas em destaque, ou o revestimento da TOK-4, devolve a continuidade.
- `v4`: nenhuma oportunidade é nomeada no desenho parado: `mais rápida` e `mais lenta` não dizem qual é, e o nome só existe na dica (DIC-1). O rótulo de fim de linha comporta o nome.
- `v4`: os rótulos de fim de linha não têm marcador na cor da série (ROT-3); `mais lenta, 92 dias` termina 8 px antes da linha azul e fica acima da chegada de duas linhas cinza, de 02/10 e 05/10.
- `v4`: a grade desenha sete linhas horizontais, as cinco de etapa e as duas bordas do domínio (−0,3 e 4,65), que não são etapa; `syncWithTicks` deixa só as cinco.
- `v4`: o rótulo de retorno procura o x livre de degraus na faixa e usa três linhas de rótulo; com mais de três retornos próximos no tempo a busca cai no fallback ao lado do anel e pode colidir (ROT-9); e duas abertas na mesma etapa repetem a `key` do rótulo `em aberto`.

Revisão de 2026-10-08, segunda passada, depois da correção: `v1`, `v3` e `v4` julgadas no arquivo de hoje e aprovadas, sem bloqueante, com os dois PNGs de cada uma abertos. O parecer da primeira passada em `validation/` fica como histórico. Do parágrafo acima seguem valendo o `truncate` na linha de leitura, a amostra redonda da legenda, a etapa de 1 dia, o título do `meta.json`, a reserva `STAGE_COLORS[0]`, as quatro medianas, o rótulo só com valor, proposta contra negociação, a `key` repetida, a folga da legenda, os trechos horizontais cobertos, a oportunidade sem nome, a grade de sete linhas e o número sem classe tabular. O que mudou ou apareceu:

- `v1`, `v3`: os slots 1, 3, 6 e 5 medem, contra o cartão, 9,50, 6,47, 7,39 e 5,90 no escuro e 6,00, 6,18, 5,39 e 6,25 no claro. A etapa `Qualificação`, que media 2,60 no claro, deixou de ser achado.
- `v1`: a barra mede 13,0 px no preview; o comentário de `CATEGORY_GAP` diz 12 px, a nota do `meta.json` diz 12,5 px e o item acima dizia 12 px.
- `v1`: o losango `--positive` tem o mesmo hex de `--chart-4` e agora divide o corpo com `--chart-5` e `--chart-6`, pares que a COR-8 manda separar com vão e rótulo. O contorno de cartão, a forma própria e a legenda `Ganha` seguram a leitura; no claro o losango mede 1,13:1 contra `Qualificação` e 1,17:1 contra `Negociação`, então a forma é o único canal entre eles.
- `v3`: os rótulos das medianas não têm anticolisão. No dado fixo o menor vão de tinta é de 25 px, entre `8 dias` e `20 dias`; duas medianas a menos de 7 dias uma da outra (cerca de 39 px entre centros) encostam os textos (ROT-9).
- `v4`: os rótulos de retorno ficam a 167 px e a 101 px dos anéis, em janela livre à direita, e as linhas de chamada cruzam 4 e 3 degraus de outras linhas, entre eles o da linha azul; o comentário do código diz `sem tocar traço de dado`. A chamada de baixo passa a 1,5 px do outro anel, e os dois rótulos empilhados saem em ordem inversa à do tempo. Lê-se seguindo o pontilhado e conferindo a data no eixo; uma pista fora do plano, como na saída da GEO-4, encurta o caminho.
- `v4`: o item acima sobre a busca do rótulo fala em três linhas de rótulo; o código de hoje tem duas (`LABEL_ROWS`, 8 px acima e 8 px abaixo do centro da faixa), então o terceiro retorno próximo já cai na reserva ao lado do anel, sem teste de colisão.
- `v4`: o anel cinza de 02/09/2026 fica num degrau que é ao mesmo tempo a descida da `Oportunidade 06` e a subida da `Oportunidade 07`, que mudam de etapa no mesmo dia entre os mesmos níveis. O desenho mostra um degrau só; um dia de diferença no dado fixo ensina melhor.
- `v4`: `mais lenta, 92 dias` termina em x 803,2, a 0,6 px do x do degrau cinza da `Oportunidade 05` (803,8) e a 8 px da linha azul (811,2). O peso 700, a espessura e a linha de leitura levam à linha azul; o marcador na cor da série, da ROT-3, tira a dúvida.
- `v4`: a TOK-9 pede o par marca contra marca escrito no `notes`. Medido: `--chart-1` contra `--text-muted` 1,82 no escuro e 1,12 no claro; `--chart-3` contra `--text-muted` 1,24 e 1,15; `--chart-1` contra `--chart-3` 1,47 e 1,03. O segundo canal existe: espessura 3 contra 1,5 e rótulo direto.
