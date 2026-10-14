# Pizza com detalhamento de Outros

## O que é

Uma pizza com as maiores partes e uma fatia "Outros" que se abre ao lado, numa barra horizontal com as origens que a compõem (bar of pie). Dois conectores em SVG, calculados a partir dos dois ângulos da fatia "Outros", ligam as bordas dessa fatia aos dois cantos do painel de detalhe, mostrando que aquele arco inteiro corresponde àquela lista inteira. A variante interativa é o drilldown: clicar numa fatia troca o dado da própria pizza pelo nível filho dela, com trilha de navegação e o total do nível pai à vista.

O assunto deste modelo é a cauda agregada, e é ali que mora a desonestidade típica da forma: "Outros" esconde exatamente o que o leitor precisaria ver, e o critério de agregação quase nunca está escrito. Por isso toda versão deste modelo escreve na tela, e não só no README, a regra que manda uma categoria para a cauda e quantas categorias ela reúne. É a mesma classe da armadilha GEO-12, critério de ordenação que só existe no comentário do código.

## Quando usar

- Cauda longa que precisa existir sem poluir a pizza: até 4 fatias maiores e Outros, com a composição aberta ao lado.
- Quem lê precisa saber o que Outros contém sem trocar de tela: origens de lead menores, submotivos de perda.
- Hierarquia rasa de dois níveis em que o nível pai é a mensagem e o nível filho é consulta.

## Quando evitar

- A cauda é a mensagem: barra horizontal com top N (família 02).
- Outros maior que a maior fatia: o teto está baixo ou a categoria está mal definida; rever o agrupamento antes.
- Hierarquia com três níveis ou mais: sunburst (12/03).
- Celular ou card estreito, onde os conectores quebram: pizza simples com legenda tabular (modelo 01 desta família).

## Anatomia

1. Pizza principal em `Pie`, com `startAngle` e `endAngle` calculados a cada renderização a partir da fração de "Outros" (`f`): `startAngle = -180 * f` e `endAngle = startAngle - 360` giram o círculo até "Outros" ficar centrada às 3 horas, simétrica em torno do eixo horizontal que aponta para o painel de detalhe, mantendo "Outros" como última fatia da volta e a ordem das demais.
2. As maiores origens em cor categórica por slot fixo, na ordem 1, 3, 6, 5 dos tokens `--chart-*` (COR-8), e "Outros" sempre por último, em neutro. Qual neutro é a única divergência entre as versões, e está no item 13.
3. Rótulo interno de percentual inteiro posicionado por `midAngle`, a 62% do raio. A cor do texto e a decisão de halo estão no item 12, que é onde a ROT-7b manda decidir.
4. Dois conectores (`pointAtFraction`), agora retas simples porque a rotação já vira "Outros" de frente para o painel: da borda superior da fatia até o canto de cima da caixa de detalhe, e da borda inferior até o canto de baixo. Nenhum arco, nenhum contorno do disco, nenhuma reta cruza o disco ou outra fatia, porque as duas bordas de "Outros" já nascem no lado do disco voltado para fora.
5. Painel de detalhe: cabeçalho com o nome "Outros" e o total repetido (`formatInt`, com o substantivo "leads"), e uma `BarChart` vertical com as origens que compõem "Outros", do maior para o menor.
6. Cada barra do detalhe tem o valor escrito na ponta livre, na mesma unidade da pizza (contagem de leads, NUM-6). Na v2 e na v4 esse valor sai sem halo: a emenda de 2026-09-19 da ROT-7 mediu que o halo de 4 px apaga marca de traço mais fina que ele, e os conectores têm 1 px, então quem se afasta é o rótulo, por geometria, e não o conector.
7. Percentual inteiro pelo maior resto (`integerPercents`), que soma 100 tanto no rótulo interno quanto na lista de identificação abaixo do gráfico.
8. Lista de identificação abaixo da pizza e do painel, com amostra quadrada, nome e percentual de toda fatia, inclusive "Outros" (ROT-10): nomeia no papel o que a dica não alcançaria.
9. Linha de leitura no topo do corpo, calculada do dado: o total de leads do mês e o total de "Outros" (ANO-5).
10. `data.main` e `data.outrosDetail` vazios trocam o gráfico inteiro por um bloco `role="status"` (EST-1).
11. A regra da cauda mora no dado, nunca num comentário: `tailMaxLeads` na v2, `tailMaxLosses` na v3 e `tailMaxShare` na v4. A peça imprime o critério e a contagem num rodapé de 11 px em `--text-muted`, e repete a contagem no rótulo da fatia, em "Outros (n=4)" (COR-4, GEO-12).
12. Rótulo interno de percentual vazado em `var(--surface-raised)` e **sem halo**, pela ROT-7b: o texto tem a fatia inteira por baixo, e o halo da ROT-7 é a mesma `--surface-raised`, que no tema claro é o mesmo branco do vazado e apagaria a letra por dentro. Vazado mede de 5,21:1 a 6,18:1 sobre as cores usadas, acima do piso de 4,50:1. Vale para a v2, a v3 e a v4; a v1 ainda usa `--text-primary` com halo, que a ROT-6 proíbe (ver Observações da revisão).
13. Neutro da cauda em `var(--text-muted)` na v2, na v3 e na v4, que mede 5,21:1 no escuro e 5,37:1 no claro contra o cartão. A v1 usa `var(--line-strong)`, que mede 1,79:1 e 1,83:1 e sai como aviso da guarda `CONTRASTE-MARCA` (armadilha TOK-5).
14. Percentual inteiro pelo maior resto, com retorno `readonly number[] | null` para lista sem todo a repartir (EST-1b): percentual de nada não é zero por cento.
15. Piso angular do rótulo interno em 5% da volta (`MIN_LABEL_FRACTION`); abaixo dele a fatia é nomeada pela lista de identificação, e a soma do que está impresso continua fechando 100 (ROT-10).

## Versões

- `v1_origens-de-lead-com-outros-aberto`: origens de lead do mês, com quatro origens principais (site orgânico, indicação, evento, mídia paga) e uma fatia "Outros" de 13% que se abre ao lado em quatro origens menores (parceiro, podcast, imprensa, cold email). Demonstra a `Pie` e a `BarChart` vertical lado a lado em flex, os dois conectores em SVG sobreposto calculados a partir dos ângulos da fatia "Outros", "Outros" em neutro e sempre por último com o total repetido no painel de detalhe, e o valor escrito em cada barra do detalhe na mesma unidade (leads) da pizza.
- `v2_parceiro-cresceu-dentro-de-outros`: a mesma cauda, agora com dono. A pizza principal fica intacta e o painel de detalhe acende só a barra de Parceiro, em `--chart-1`, com as outras três em `--text-muted`; a anotação de 11 px nomeia a base ("Parceiro: 18 leads contra 6 em jul/26", NUM-4) e a linha de leitura diz que Parceiro chega a 18 dos 20 leads que separam a cauda. A regra do agrupamento e a contagem de origens que ela reúne saem escritas no rodapé. O slot 1 da COR-8 fica reservado ao destaque, então as quatro origens nomeadas caem em 3, 6, 5 e 2, e `--chart-1` aparece uma vez só na peça inteira (COR-3).
- `v3_motivos-de-perda-com-drilldown`: a variante interativa. O estado do nível em React troca o `data` da pizza ao clicar na fatia, a trilha "Todos" e "Preço" é um botão focável por teclado, o total do nível pai fica sempre à vista e a lista tabular repete a mesma navegação para quem não usa o ponteiro. A raiz vai em `role="group"` e não em `role="img"`, porque `img` apaga os botões da árvore de acessibilidade. O percentual do nível filho é do próprio nível, o que mantém rótulo e ângulo dizendo a mesma coisa, e o percentual do pai vem da mesma conta do nível de cima para os dois nunca discordarem em 1 ponto. Uma checagem em TypeScript recusa desenhar quando o total do pai não fecha com a soma dos filhos.
- `v4_cauda-de-23-categorias`: a cauda longa. Vinte e três campanhas abaixo de 1% dos leads, das quais o painel abre as 10 maiores e resume as 13 restantes numa linha escrita com a contagem, a soma e o maior valor, sem rolagem e sem `overflow` escondido. Nome de campanha inteiro, sem reticência (TIP-7). Duas checagens em TypeScript recusam desenhar quando a cauda passa a maior fatia nomeada ou quando uma linha da cauda viola o teto que ela mesma declara. O canvas é por número, 960x560, porque nenhum preset entrega os 12 px de espessura da ESP-2 com 10 barras.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para uma pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/LeadOriginsBarOfPie/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` pela prop; o default do `data.ts` fica só como amostra do catálogo.
3. Reserve altura suficiente no pai: o painel de detalhe precisa de espaço vertical para as barras da cauda de "Outros" além do diâmetro da pizza, por isso o canvas de referência é o preset `largo` (960 x 400).
4. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Highcharts, pie with drilldown](https://www.highcharts.com/demo/highcharts/pie-drilldown): a página abriu só com título; o comportamento de trocar a pizza pelo detalhe é o que a v3 implementa, com trilha e total do nível pai.
- [Datawrapper Academy, customizing your pie chart](https://www.datawrapper.de/academy/customizing-your-pie-chart): observar o agrupamento automático das menores acima de cinco fatias, com teto e rótulo configuráveis, base do agrupamento em "Outros" desta versão.
- [Storytelling with Data, what is a pie chart](https://www.storytellingwithdata.com/blog/2020/5/14/what-is-a-pie-chart): observar a consolidação das pequenas em "All other", o mesmo papel que "Outros" cumpre aqui.
- Farol: `app/src/components/visuals/charts/DonutChart.tsx` (Pie com `Cell` por índice e `ChartTooltip`, referência mais próxima já em produção).

## Observações da revisão (não bloqueantes)

- `v1_origens-de-lead-com-outros-aberto`: a frase acessível diz "do maior para o menor", mas a ordem impressa é 36%, 25%, 14%, 12% e 13%, porque "Outros" vai por último por convenção; vale dizer isso na própria frase.
- `v1_origens-de-lead-com-outros-aberto`: o estado vazio só dispara quando `data.main` e `data.outrosDetail` estão os dois vazios; com `main` vazio e a cauda cheia, a pizza vira uma fatia única de 100% de "Outros".
- `v1_origens-de-lead-com-outros-aberto`: o painel de detalhe toma toda a largura restante, então a barra de 21 leads fica mais longa que o raio da pizza de 142 leads; um teto de largura no painel aproximaria os dois pesos.
- `v1_origens-de-lead-com-outros-aberto`: as fatias principais trazem só o percentual; o valor absoluto por origem não aparece em lugar nenhum do desenho parado, só o total do mês e o de "Outros".
- `v1_origens-de-lead-com-outros-aberto`: o rótulo interno da pizza não tem piso angular (o modelo 01 esconde abaixo de 18 graus), então uma fatia principal muito pequena imprimiria o percentual mesmo sem espaço; com o dado desta versão nenhuma fatia chega perto disso, e a lista de identificação abaixo do gráfico continua nomeando toda parte.
- `v1_origens-de-lead-com-outros-aberto`: a margem direita reservada no painel de detalhe é de 60 px, suficiente para "21 leads"; uma cauda com contagem de quatro dígitos pediria mais respiro, já que a maior barra sempre alcança a largura toda por causa do domínio `dataMax`.
- `v2`, `v3` e `v4`: o rótulo interno é vazado em `--surface-raised` e sem halo, pela ROT-7b. A `v1` ainda escreve o percentual em `--text-primary` com halo (`v1_origens-de-lead-com-outros-aberto/Chart.tsx:162`), e a ROT-6 é literal em proibir `--text-primary` sobre as categóricas: sobre `--chart-1` mede 1,53:1 no escuro e 2,99:1 no claro. O halo salva a leitura e a guarda `CONTRASTE-TEXTO` mede o halo, não a fatia, então o defeito passa pelo portão. Conserto pendente, junto com a troca do neutro `--line-strong` por `--text-muted`, que hoje é o aviso de `CONTRASTE-MARCA` da `v1`.
- `v4_cauda-de-23-categorias`: o canvas de 960x560 é o que a conta da ESP-2 pede com 10 barras, e ele é alto para uma grade de cartões. A alternativa medida seria abrir 6 linhas da cauda no preset `largo`, o que mudaria o que a versão ensina; quem colar num painel apertado troca o número de linhas por `detailRows`, não a espessura da barra.
- `v3_motivos-de-perda-com-drilldown`: o preview mostra o nível filho, porque o render não captura clique. O nível de cima existe e é alcançável pelo botão "Todos", mas não aparece em imagem nenhuma da galeria; quem revisar precisa abrir o componente para ver os dois estados.
- `v3_motivos-de-perda-com-drilldown`: a lista tabular e as fatias ficam com os mesmos slots de cor nos dois níveis (1, 3, 6, 5 da COR-8, com Outros em neutro), então "Acima do orçamento" no nível filho repete a cor de "Preço" no nível pai. Os dois nunca estão na mesma tela e a trilha declara o nível, mas um mapa de cor por submotivo evitaria a coincidência.

Revisão de 2026-10-14 (v2, v3 e v4; a v3 saiu reprovada por COR-8, com parecer em `validation/`, e os itens abaixo não reprovam):

- `v2_parceiro-cresceu-dentro-de-outros` e `v4_cauda-de-23-categorias`: no cabeçalho do painel, o "(12% do total)" mora num `<p>` sem `tabular-nums` (TIP-1); só o "46 leads" e o "99 leads" estão em `kpi-number`. Número solto em linha, sem coluna a alinhar, então sem consequência no preview; vale pôr `tabular-nums` no `<p>`.
- `v2_parceiro-cresceu-dentro-de-outros`: a frase acessível diz "Parceiro passou de 6 para 18 leads" sem o mês da base; o desenho escreve "contra 6 em jul/26" (NUM-4), e a frase pode repetir o `formatMonthShort(data.previousMonth)`. Na mesma frase, "Dentro dela" se refere a "Outros", que a frase anterior trata no masculino.
- `v2_parceiro-cresceu-dentro-de-outros`: o destaque vem de `highlightId` no dado, não da maior variação contra o mês anterior; com o dado padrão os dois coincidem (6 para 18, contra 11 para 13, 12 para 9 e 8 para 6), mas a página que colar a peça precisa decidir quem acende.
- `v2_parceiro-cresceu-dentro-de-outros` e `v4_cauda-de-23-categorias`: com a cauda vazia e as nomeadas cheias, o estado vazio não dispara e a peça desenha uma fatia "Outros" de 0%, conectores saindo do mesmo ponto e um painel sem barras; uma guarda para `tail` vazio trocaria o painel por uma frase.
- `v4_cauda-de-23-categorias`: o catálogo pede a lista completa da cauda na frase acessível e a peça segue a ACE-1 (teto de 250); a consequência é que os nomes das 13 campanhas resumidas não aparecem em lugar nenhum, nem na tela nem na frase. A frase também diz "em 4 campanhas nomeadas" para uma pizza de 5 fatias; "4 campanhas nomeadas e Outros" leria melhor.

Revisão de 2026-10-14, segunda passada da v3 (aprovada depois da troca de slots para 1, 3, 6, 5; os itens abaixo não reprovam):

- `v3_motivos-de-perda-com-drilldown`: o comentário de `SLICE_LABEL_FILL` (`Chart.tsx:37`) e o item 12 da Anatomia dizem que o vazado mede "de 5,21:1 a 6,18:1"; com `--chart-1` na fatia de Preço a faixa passou a ir de 5,21:1 (neutro, escuro) a 9,50:1 (`--chart-1`, escuro), e `--chart-5` mede 6,25:1 no claro. Tudo acima de 4,50:1, só o texto envelheceu.
- `v3_motivos-de-perda-com-drilldown`: o cabeçalho da lista diz "motivo" também no nível aberto, onde as linhas são submotivos; "submotivo" quando há nível aberto leria melhor.
- `v3_motivos-de-perda-com-drilldown`: o rodapé escreve "Outros reúne os 3 motivos abaixo de 10 perdas" a partir de `tailMaxLosses` e da contagem de submotivos, mas nada confere em TypeScript que cada submotivo de Outros fica abaixo do teto e cada motivo nomeado fica no teto ou acima, como a `v4` confere. Com o dado padrão vale (9, 7 e 5 contra 26 no menor nomeado).
- `v3_motivos-de-perda-com-drilldown`: abrir um motivo com 0 perdas e submotivos (pelo botão da lista ou por `focusId`) deixa `percents` nulo, e a peça inteira vira o bloco "Nenhuma perda neste recorte", sem o botão "Todos" para voltar e com uma frase falsa, porque o nível de cima tem perdas. Um vazio só do nível filho, mantendo a trilha, fecharia o caso; o dado padrão não chega lá.
- `v3_motivos-de-perda-com-drilldown`: o item 11 da Anatomia diz que toda versão repete a contagem no rótulo da fatia, em "Outros (n=4)"; a `v3` escreve só "Outros", com a linha "inclui ..." logo abaixo e a contagem no rodapé, o que nomeia mais e não menos. Vale ajustar a frase do README.
