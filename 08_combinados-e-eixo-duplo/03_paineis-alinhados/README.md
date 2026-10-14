# Painéis alinhados

## O que é

Dois ou três gráficos empilhados na vertical sobre o mesmo eixo x, cada um com o seu próprio eixo y à esquerda e a mesma largura de eixo, amarrados por `syncId` para o cursor e a dica andarem juntos. É a saída padrão do Farol para duas ou três grandezas de unidades diferentes no mesmo calendário, e a forma que a regra EIX-8 do padrão de acabamento (sem eixo duplo) pede no lugar do eixo duplo. Lê-se painel a painel, de cima para baixo, comparando a posição do mesmo mês entre eles.

## Quando usar

- Duas ou três métricas de unidades diferentes no mesmo calendário: investimento e CPL qualificado; entradas, agendas e fechamentos.
- Público geral, sem mediação, que precisa ler o nível e a variação de cada métrica sem escala arbitrária.
- Até 52 períodos por painel, com o painel principal ocupando cerca de dois terços da altura do corpo.

## Quando evitar

- Espaço vertical mínimo, como faixa ou KPI: rotule a segunda série num gráfico só (`v2_cpl-com-volume-rotulado`) ou use a família 24_microvisuais-sparklines.
- Mais de três painéis: vira pequenos múltiplos, como em `04_linhas/09_pequenos-multiplos-de-linha`.
- Métricas na mesma unidade: um gráfico só, com `01_coluna-com-linha` desta família.
- Painéis lidos em altura uns contra os outros sem escala comum: aplique a EIX-9 (escala comum entre painéis comparáveis) ou a comparação cruzada engana.

## Anatomia

1. Painel de cima, o principal: `ComposedChart` com `Bar`, eixo y próprio à esquerda com domínio a partir do zero e ticks redondos calculados no componente (`formatCurrencyAxis`), `XAxis` presente mas com `hide` (reserva a mesma estrutura de dados do eixo sem desenhar rótulo).
2. Painel de baixo, o secundário: `ComposedChart` com `Line`, mesmo eixo x, `XAxis` visível com `tickFormatter={formatMonthShort}` e `tickMargin={8}`.
3. `syncId` igual nos dois `ComposedChart`: o cursor e a dica (`ChartTooltip`) se movem juntos quando o mouse passa sobre qualquer um dos dois.
4. `YAxis width` fixo na mesma constante e `margin` idêntico nos dois painéis, para as bandas de mês caírem na mesma coluna horizontal nos dois gráficos.
5. Título de painel em texto simples (`text-text-secondary`, 12 px) com o nome da métrica e a unidade entre parênteses, no lugar da legenda que uma série única não precisa (ROT-1).
6. Linha de leitura no topo do cartão, calculada do dado: o intervalo de cada métrica e o mês sem medição, quando houver.
7. Um `Bar` oculto (`hide`) na mesma categoria dentro do `ComposedChart` do painel sem barra própria: sem ele, o Recharts resolve a escala do eixo x como `point` num painel e `band` no outro (a primeira só existe quando há `Bar` na árvore), e a mesma categoria cai em colunas diferentes nos dois painéis, com desvio de até meia banda. `hide` tira o retângulo do desenho e da dica sem tirar o painel da escala `band`. A barra oculta só é necessária quando os painéis **misturam** barra e linha: em `v3_entradas-agendas-fechamentos`, que é linha nos três, todos caem em `point` e alinham sozinhos.
8. O eixo x dos painéis de cima leva `tick={false}`, nunca `hide` (saída da REC-17): `hide` devolve ao plano daquele painel os 30 px reservados ao eixo, e os painéis de cima nascem mais altos que o de baixo, o que desmancha a proporção declarada. A `v1` usa `hide`, que é o que o catálogo pediu para ela; as versões `v3` e `v4` usam `tick={false}`.
9. `interval={0}` nos dois eixos, com `ticks` explícito: sem ele o eixo descarta tique em painel baixo e leva a linha de grade correspondente junto (REC-29), que é o defeito registrado na `v1` deste modelo.

## Versões

- `v1_investimento-sobre-cpl-qualificado`: investimento mensal em mídia paga em colunas no painel de cima e CPL qualificado em linha no painel de baixo, com um mês sem lead qualificado tratado como lacuna (`null`, `connectNulls={false}`), nunca como zero. Previews: [preview.svg](./v1_investimento-sobre-cpl-qualificado/preview.svg) (escuro) e [preview-claro.svg](./v1_investimento-sobre-cpl-qualificado/preview-claro.svg) (claro).
- `v2_cpl-com-volume-rotulado`: a variação sem painel extra. Um gráfico só, com o eixo do CPL, e o volume de leads escrito nos dois meses que mudam a leitura (o CPL mais baixo do ano, que vem com o menor volume, e o pico de volume). O rótulo chega por `dataKey` próprio calculado junto com o dado, que é a saída da REC-5, e não por índice. Previews: [preview.svg](./v2_cpl-com-volume-rotulado/preview.svg) e [preview-claro.svg](./v2_cpl-com-volume-rotulado/preview-claro.svg).
- `v3_entradas-agendas-fechamentos`: três painéis de 26 semanas com o mesmo `syncId` e um `Brush` no painel de baixo que recorta os três de uma vez, porque o `syncId` sincroniza o recorte além da dica. Contagens com `allowDecimals={false}` e escala própria por painel, declarada em nota no rodapé do cartão. Previews: [preview.svg](./v3_entradas-agendas-fechamentos/preview.svg) e [preview-claro.svg](./v3_entradas-agendas-fechamentos/preview-claro.svg).
- `v4_metrica-nova-com-lacuna`: receita nos doze meses e taxa de conversão medida só a partir de mai/26, com os meses anteriores em `null` e uma faixa `ReferenceArea` que escreve a ausência dentro do painel, em vez de deixá-la para a dica (DIC-5). Previews: [preview.svg](./v4_metrica-nova-com-lacuna/preview.svg) e [preview-claro.svg](./v4_metrica-nova-com-lacuna/preview-claro.svg).

### Notas de decisão das versões novas

- **Cor.** A `v3` usa **uma cor só** nos três painéis, e isso é escolha, não descuido: as três etapas estão na mesma unidade mas em escalas diferentes, e cor por painel convidaria a comparar altura entre painéis, que é justamente a leitura que este modelo proíbe sem escala comum. A `v1`, a `v2` e a `v4` seguem a ordem de slots da COR-8 (`--chart-1`, depois `--chart-3`) porque ali cada painel é uma grandeza diferente com escala própria e o título nomeia cada uma.
- **Canvas.** As três versões novas declaram o canvas por número, com a conta escrita na nota do `meta.json` (GEO-1). A `v3` precisou de 680 px de altura: nenhum preset fecha três painéis mais `Brush`, e o preset `alto` deixaria 74 px para os três planos somados.
- **Caso de uso na fronteira.** Os casos de uso da `v3` e da `v4` têm 91 caracteres, contra os 92 que cabem em uma linha num cabeçalho de 574 px. A altura das duas foi calculada como se o cabeçalho quebrasse em duas linhas, então qualquer emenda de texto não desloca o desenho.
- **Par de contraste medido.** O texto da faixa de lacuna da `v4` é `--text-muted` de 11 px sobre `--surface-sunken`: 5,98:1 no tema escuro e 4,65:1 no claro, acima do piso de 4,5:1 da ACE-3 nos dois. Sem halo, porque a faixa é a única coisa sob a tinta (ROT-7b).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/InvestmentAndCplPanels/` e ajuste o import do dado.
2. Ligue `data` à consulta real (investimento mensal por período e CPL qualificado do mesmo período); mantenha `cplQualificado` como `number | null`, nunca `0`, quando não houver lead qualificado no mês.
3. Embrulhe num `VisualCard` único: os dois painéis internos já se comportam como um cartão só, então o `title` do `meta.json` vira o `title` do `VisualCard` e o `useCase` pode virar `subtitle`.
4. Dê altura ao pai (por exemplo `h-96`) para os dois painéis internos terem espaço suficiente; abaixo de cerca de 280 px o painel secundário fica baixo demais para o rótulo do eixo.
5. Se a página precisar de mais de dois painéis, copie a `v3_entradas-agendas-fechamentos`, que já resolve isso: `Panel` interno com proporção de altura por painel, `syncId` comum e a base do painel de baixo reservando a altura do `Brush`, para o plano dele não nascer mais curto que a proporção pedida.
6. Com `Brush`, lembre que o recorte viaja pelo `syncId`: um `Brush` só, no último painel, recorta os três. E nunca ancore rótulo por índice num gráfico com `Brush`, porque o índice passa a contar a fatia visível, não o array (REC-23).

## Referências

- [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis): as duas saídas, rótulo direto e gráficos empilhados com o mesmo eixo x.
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/): os panel charts.
- [Daydreaming Numbers, 5 alternatives to dual axis charts](https://daydreamingnumbers.com/5-alternatives-to-dual-axis-charts/): lado a lado, rótulo direto, priorizar e rotular, connected scatterplot e índice.
- [Datawrapper, Why not to use two axes, and what to use instead](https://www.datawrapper.de/blog/dualaxis): a vantagem e o custo de espaço dos gráficos separados.
- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/): `syncId` e `Brush`.

## Observações da revisão (não bloqueantes)

- **Achado que vale para todo o modelo, medido em quatro previews:** a largura que o Recharts reserva para a TINTA de um tique de eixo y é `width` menos **14 px**, não menos os 8 px do `tickMargin`. Os 6 px que faltam são o `tickSize`, descontado mesmo com `tickLine={false}`. Medições: 58 px de eixo com `R$ 20 mil` de 47,3 px (quebrou, é a `v1`), 60 px com `R$ 1,0 mi` de 47,6 px (quebrou), 64 px com o mesmo tique (uma linha, é a `v4`) e 48 px com `R$ 300` de 33,8 px (uma linha por 0,2 px, subido para 52 na `v2`). Quem quebra em duas linhas desloca o grupo do eixo e pode cortar o tique do topo contra a borda do painel: é a REC-2.
- `v2_cpl-com-volume-rotulado`: o `position="top"` e o `offset` do `LabelList` **não chegam** ao `content` quando a marca é uma `Line`; o `y` que o `content` recebe é o do próprio ponto, porque a `Line` entrega `viewBox` de altura zero. O respiro é subtraído dentro do componente, e mudar o `offset` não move nada.
- `v2_cpl-com-volume-rotulado`: os previews divergem da página em 1,14% (escuro) e 1,18% (claro), abaixo do aviso de 2%. A diferença é inteiramente das duas linhas de texto que começam com "CPL": é a fidelidade que o próprio `render` anuncia, com o par `P` para `L` medido em 0,594 px, e o conserto está fora do catálogo, em `app/src/main.tsx`.
- `v2_cpl-com-volume-rotulado`: a anotação `31 leads` passa a cerca de 4 px da linha de grade de `R$ 200`; o halo da ROT-7 resolve a leitura, e nenhuma guarda mede par de texto contra linha de grade.
- `v3_entradas-agendas-fechamentos`: o rótulo do primeiro tique de mês (`abr/26`) nasce meio rótulo à esquerda do plano, sobre a faixa vazia do eixo y, porque a escala de ponto ancora o primeiro ponto na borda. A separação vertical contra o tique de valor é de cerca de 19 px, então não há encontro de tinta.
- `v3_entradas-agendas-fechamentos`: o `Brush` usa `fill="var(--surface-sunken)"` e `stroke="var(--text-muted)"`; os dois filetes brancos de dentro de cada alça são desenho fixo do Recharts (`stroke="#fff"` no `DefaultTraveller`) e não passam por token.

- `v1_investimento-sobre-cpl-qualificado`: `maxBarSize` é 26 e a espessura medida no PNG escuro é de 25 px, acima do teto de 24 px em cartão da ESP-2; o check não acusa e a leitura não sofre.
- `v1_investimento-sobre-cpl-qualificado`: o painel do CPL imprime só três tiques (R$ 0, R$ 200 e R$ 400); os tiques calculados de 100 e 300 caem por colisão e a grade fica com metade dos passos.
- `v1_investimento-sobre-cpl-qualificado`: o domínio do CPL vai até R$ 400 com o dado entre R$ 184 e R$ 312, então cerca de metade do painel fica vazia e a subida de 70% no ano lê como rampa suave.
- `v1_investimento-sobre-cpl-qualificado`: o painel de cima não imprime o rótulo da linha de base (R$ 0) que o de baixo imprime; a base foi medida em y=706 e as barras chegam nela, mas o acabamento dos dois eixos fica diferente.
- `v1_investimento-sobre-cpl-qualificado`: a linha de leitura usa `truncate` e é o único lugar fora da dica que nomeia a lacuna de mar/26; em cartão estreito essa é a parte da frase que some primeiro.
- `v1_investimento-sobre-cpl-qualificado`: a frase acessível escreve "O investimento subiu de" com o verbo fixo, enquanto a linha de leitura decide entre subiu e caiu pelo dado; com uma série em queda o nome acessível passa a contrariar o visual.
- `v1_investimento-sobre-cpl-qualificado`: o cursor da linha usa `var(--line-strong)` escrito à mão, que é exatamente o valor de `CURSOR_COLOR` do `chartTheme`; importar a constante deixaria a DIC-3 explícita para quem copiar o modelo.

**Revisão de 2026-10-14 (`v2`, `v3` e `v4`, as três aprovadas).** Nenhum dos itens abaixo muda o que o preview afirma com o dado de exemplo; os de texto fixo passam a mentir quando o Chart for ligado à consulta real.

- `v2`, `v3` e `v4`, TIP-1: a linha de leitura imprime número em Manrope sem `tabular-nums`; em prosa, sem consequência visível.
- `v2_cpl-com-volume-rotulado`: a anotação `31 leads` cai em fev/26, que não tem tique (o eixo imprime jan, mar, mai...), e só a frase acessível diz o mês; escrever o mês na anotação ou derivar os tiques incluindo os meses anotados.
- `v2_cpl-com-volume-rotulado`: "leads no ano" é texto fixo; com um recorte que não seja o ano civil, a linha de leitura afirma um período que o dado não tem. Derivar do primeiro e do último mês.
- `v2_cpl-com-volume-rotulado`: com `MARGIN.top` de 20 e `LABEL_OFFSET` de 16, uma anotação num ponto a menos de 4 px do topo do domínio tem a tinta de 11 px cortada pela borda do plano; o dado de exemplo fica longe disso (o `214 leads` tem 2,7 px até a grade de R$ 300).
- `v3_entradas-agendas-fechamentos`: os verbos da linha de leitura ("entradas sobem", "fechamentos caem") e da frase acessível ("sobem", "caem") são fixos, e só os números vêm do dado; com dado real em que os fechamentos sobem, o cartão escreve "caem de 3 para 7". Decidir o verbo pelo sinal, como a linha de leitura da `v1` já faz.
- `v4_metrica-nova-com-lacuna`: o mesmo na linha de leitura, "Receita sobe de" com o verbo fixo.
- `v3_entradas-agendas-fechamentos`: a conclusão compara a primeira com a última semana (4 para 2) e deixa de fora o pico de 8 em jun, que é o que o caso de uso pergunta; "caem de 8 no pico para 2" responde à pergunta de etapa travada.
- `v3_entradas-agendas-fechamentos`: o `Brush` não recebe `tickFormatter`, e no Recharts 3.10.1 o `BrushText` aparece ao lado das alças quando o cursor passa sobre ele (`isTextActive`), escrevendo a semana crua (`2026-04-06`), fora da NUM-7 e sem algarismo tabular; `tickFormatter={(value: string) => formatDate(value)}` resolve. Não aparece no preview estático.
- `v3_entradas-agendas-fechamentos`: os planos medem 142, 76 e 76 px no preview, contra os 129, 74 e 74 px da nota do `meta.json` (pior caso, com o caso de uso em duas linhas); o rateio 3:2:2 é dos contêineres, e o desconto fixo de título, margem e eixo em cada painel leva a razão dos planos a cerca de 1,9:1:1.
- `v3` e `v4`, ACE-1: a frase acessível abre com "Três painéis por semana" e "Dois painéis por mês", que soam como painéis por período; "Três painéis de linha, por semana" e "Dois painéis mensais, colunas de receita e linha da taxa" diriam o tipo de marca.
- `v4_metrica-nova-com-lacuna`, DAD-1 e NUM-1: a dica do painel da taxa imprime `28,6%` sem o volume (declarado no `meta.json`), e o par só existe para o último mês, na linha de leitura e na frase; a saída da REC-6, dica montada à mão buscando `ganhos` e `oportunidades` na linha do dado, fecha o par mês a mês.
- `v4_metrica-nova-com-lacuna`: a faixa de lacuna só nasce com nulos no começo da série; sem nenhum mês medido, o painel da taxa desenha grade vazia de 0% a 100% sem texto de ausência, e um nulo no meio da série quebra a linha sem nota.
- `v4_metrica-nova-com-lacuna`: `barCategoryGap="34%"` e `radius={[3, 3, 0, 0]}` estão escritos dentro do `Panel`, fora das constantes do topo (seção 5); valores dentro da ESP-2, sem consequência.
