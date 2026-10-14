# Pizza simples

## O que é

Um círculo dividido em até cinco setores cujo ângulo é proporcional à fração de um todo único. A leitura começa às 12 horas e segue no sentido horário, em ordem decrescente de valor, com o percentual escrito dentro de cada fatia e o nome de cada categoria numa lista curta abaixo do gráfico, para toda fatia ficar identificável sem abrir a dica. É a forma de referência da família Pizza: as demais versões deste modelo variam o rótulo, o destaque ou o arranjo, mas a geometria de base é sempre esta.

## Quando usar

- Fração de 2 a 5 partes exclusivas de um todo declarado, com leitura boa perto de 25%, 50% e 75%.
- A mensagem é parte do todo: quanto da receita veio de cliente novo, para onde foi o investimento do mês.
- Uma parte específica carrega a mensagem e pode ganhar destaque por cor, deslocamento e peso do rótulo.
- Card estreito ou coluna lateral, onde a pizza ocupa pouco e uma legenda tabular carrega o número exato.

## Quando evitar

- Partes de valor parecido que precisam ser ordenadas com precisão: barra horizontal simples (família 02).
- Mais de 5 partes sem agrupamento: detalhamento de Outros (modelo 02 desta família) ou barra horizontal (02).
- Composição de vários todos: small multiples (modelo 04) com poucos todos, barra 100% empilhada (03) com muitos.
- Participação que muda no tempo: linha (04) ou área (05).
- Valores com negativo, categorias sobrepostas ou soma diferente do total declarado: a pizza mente; usar barra (02).
- Só dois valores, parte e restante: fração única (modelo 03) ou o número escrito.

## Anatomia

1. Setores em `Pie`, com `startAngle={90}` e `endAngle={-270}` para começar às 12 horas e girar no sentido horário.
2. Ordenação decrescente e teto de fatias calculados em TypeScript antes do `data` (`prepareSlices`), agrupando a cauda em "Outros" acima de cinco categorias, pintada em `var(--line-strong)` (`sliceFill`), o neutro do catálogo, nunca numa cor categórica.
3. Separador entre fatias em `stroke="var(--surface-raised)"`, a cor do cartão.
4. Rótulo interno de percentual inteiro (`formatPercent`, 0 casas) posicionado por `midAngle`, com halo em `var(--surface-raised)` para ter contraste sobre qualquer cor categórica (ROT-6, ROT-7). Some abaixo de 18 graus (5% do círculo): a fatia fica sem número dentro do arco, mas nome e percentual seguem legíveis na lista de identificação (item 7).
5. Percentual inteiro pelo maior resto (`integerPercents`), que sempre soma 100 (NUM-2) tanto no cálculo quanto no que fica escrito na tela, somando o rótulo interno com a lista de identificação.
6. Cor categórica por slot fixo na ordem 1, 3, 6, 5 dos tokens `--chart-*` (COR-8).
7. Lista de identificação abaixo do gráfico, com amostra quadrada na cor de cada fatia, nome por extenso sem corte e percentual alinhado à direita (ROT-4, ROT-5): nomeia toda fatia no preview estático, inclusive as que ficam abaixo do piso do rótulo interno. `aria-hidden`, porque a frase acessível da raiz já enumera as mesmas categorias.
8. Linha de leitura no topo do corpo, calculada do dado: o total reconhecido e quem lidera (ANO-5).
9. Dica (`ChartTooltip`) com o nome da categoria e o valor absoluto em moeda compacta; a fração já está escrita na fatia ou na lista, então a dica não repete o percentual.
10. `data` vazio troca o gráfico inteiro por um bloco `role="status"` (EST-1).

Peças que só existem em algumas versões, e o que cada uma resolve:

11. **Fatia deslocada** (v2): o setor aceso sai do disco 8 px na direção do próprio `midAngle`, desenhado por `Sector` dentro do `shape` do `Pie`, porque a prop `activeIndex` saiu no Recharts 3. O vetor do deslocamento serve ao setor e ao rótulo dele, para os dois andarem juntos.
12. **Rótulo interno vazado** (v2): o percentual sai em `var(--surface-raised)`, a cor do cartão, sem halo. É o único texto que passa 4,5:1 ao mesmo tempo sobre o aceso e sobre o neutro, e o halo é proibido aqui porque no tema claro ele é do mesmo branco do texto vazado (ROT-7).
13. **Legenda tabular** (v3): grade de cinco colunas de largura fixa, amostra, nome, contagem, valor e percentual, na mesma ordem angular das fatias, com linha de total (ROT-5). A linha é um `<button>` com `aria-pressed`, e ponteiro, teclado e disco acendem uns aos outros por estado React.
14. **Foco de fatia** (v3): raio 6 px maior mais opacidade de 0,75 nas demais. A opacidade sozinha não separa, porque o piso de 3:1 da marca limita quanto ela pode cair; o raio é o segundo canal que a ACE-2 pede.
15. **Rótulo externo com linha guia** (v4): dois segmentos, um radial até o joelho e um reto até o texto, com anticolisão em TypeScript por lado do disco. O empurrão respeita a ordem angular, que é o que impede duas guias de se cruzarem, e a margem lateral do gráfico sai do maior rótulo do recorte, estimado por tabela de largura de glifo das duas fontes.
16. **Fatia de ausência** (v4): sem preenchimento, com contorno `var(--text-muted)` de 1,5 px, fora da ordenação e por último, com nome e número no rótulo externo (ACE-2).

## Versões

- `v1_origem-da-receita-reconhecida`: origem da receita reconhecida do trimestre entre cliente novo, expansão de cliente ativo, renovação e uma cauda de ajustes. Demonstra o ângulo inicial às 12 horas no sentido horário, a ordenação e o teto de fatias em TypeScript, o rótulo interno de percentual escondido abaixo de 18 graus, a lista de identificação por nome e percentual abaixo do gráfico, o separador na cor do cartão e o percentual inteiro somando 100, com o total na linha de leitura e o valor absoluto só na dica.
- `v2_nao-comparecimento-em-destaque`: desfecho das 82 agendas da semana, com o não comparecimento aceso. Demonstra a fatia deslocada 8 px pelo próprio `midAngle` com `Sector` no `shape`, a margem de 10 px reservada nos quatro lados, o destaque em três canais (deslocamento, peso 700 do rótulo e anotação), a anotação com base nomeada e volume, e o neutro em `var(--text-muted)`, que passa o piso de marca nos dois temas.
- `v3_perdas-por-motivo-com-legenda-tabular`: as 212 oportunidades perdidas do trimestre por motivo, em contagem e em valor. Demonstra a pizza de 120 px ao lado de uma legenda tabular de cinco colunas com linha de total, a seleção por clique com `aria-pressed` que desmarca no segundo clique, o acendimento nos dois sentidos entre disco e legenda, o foco por raio mais opacidade de 0,75 e a cauda agrupada com a composição escrita no desenho.
- `v4_origem-dos-leads-com-dado-ausente`: os 340 leads do mês por origem, com 48 deles sem origem declarada. Demonstra rótulos externos com linha guia de dois segmentos e anticolisão em TypeScript, o par de fatias de 3% e 2% empurrado sem as guias se cruzarem, a margem lateral derivada do dado por largura de glifo, a fatia vazada de ausência por último e a cobertura na linha de leitura.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para uma pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/RevenueOriginPie/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` pela prop; o default do `data.ts` fica só como amostra do catálogo.
3. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-80">`, por exemplo, para o canvas quadrado) ou passe `height`.
4. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Data Visualisation Catalogue, pie chart](https://datavizcatalogue.com/methods/pie_chart.html): observar as funções listadas (comparação, parte do todo, proporção) e o limite de poucos valores.
- [Recharts, Pie Chart With Customized Label](https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/): observar o cálculo do rótulo por `midAngle` e a cor aplicada por `shape`, sem `Cell`.
- [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar o mesmo 25% legível antes e ilegível depois de ordenar, e a pizza rotulada que vira "tabela mal arranjada".
- [Storytelling with Data, what is a pie chart](https://www.storytellingwithdata.com/blog/2020/5/14/what-is-a-pie-chart): observar ordenar decrescente, rotular direto e agrupar em "todos os outros".
- Farol: `app/src/components/visuals/charts/DonutChart.tsx` (Pie com `Cell` por índice e `ChartTooltip`, referência mais próxima já em produção).

## Produção da v2, da v3 e da v4, em 2026-09-28

A leva fecha as quatro versões planejadas, então este modelo não tem mais versão ausente e a seção
`Versões planejadas (fora desta leva)` saiu. O que a produção mediu, e o que ela mudou de ideia:

**Defeito da v1 que as novas versões não repetem.** O rótulo interno da v1 sai em
`fill="var(--text-primary)"` sobre fatia categórica (`Chart.tsx:161`), resgatado por um halo de
`var(--surface-raised)` de 4 px (`Chart.tsx:42`). A guarda `CONTRASTE-TEXTO` aprova, porque ela
resolve o fundo por geometria e o halo é tinta da superfície pintada por baixo do glifo, mas a
**ROT-6 é literal**: `--text-primary` sobre as categóricas "é proibido". Medido nesta produção
contra `tokens.css`, o par mede 1,53:1 sobre `--chart-1` no escuro e 2,99:1 no claro, e a matriz de
texto sobre preenchimento reprova `--text-primary` sobre as oito categóricas e as quatro
semânticas. O halo ainda cai na `GEO-4`, que é o halo apagando a marca que ele deveria deixar ver.
A v2 usa o vazado em `var(--surface-raised)`, que mede 9,50:1 e 6,00:1 sobre o aceso e 5,21:1 e
5,37:1 sobre o neutro, **sem halo nenhum**, porque no tema claro o halo é do mesmo branco do texto
vazado e o apagaria (1,00:1, ROT-7).

**Segundo achado na v1, latente.** O `sliceFill` da v1 manda a cauda agrupada para
`var(--line-strong)` (`Chart.tsx:65`), que mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão:
abaixo do piso de 3:1, e a isenção do valor escrito não salva, porque a cauda pode cair abaixo dos
18 graus do rótulo interno e ficar sem número dentro da marca. A base publicada tem 4 categorias
contra um teto de 5, então `prepareSlices` nunca agrupa e o preview não expõe o caso. A v3 e a v4
usam `var(--text-muted)` como neutro, medido em 5,21:1 e 5,37:1.

**Melhoria de `integerPercents`.** As três versões novas devolvem `null` quando não há todo a
repartir, em vez da lista de zeros que a v1 e as duas implementações irmãs do acervo devolvem.
Percentual de nada não é zero por cento, e a EST-1b manda a ausência morar no tipo. O ramo é
inalcançável com a base publicada, o que é exatamente o motivo de nenhuma revisão por imagem pegar
este defeito: o defeito mora no ramo, não na foto.

**A soma fecha em 100 nas três, pelo maior resto, conferida antes do render.** v2: 58, 17, 15, 10.
v3: 32, 26, 18, 15, 9 (repare que o maior resto leva 25,47 para 26 e 8,96 para 9, o que parece
errado de olho e é o método funcionando). v4: 44, 37, 3, 2, 14, com a fatia de ausência dentro do
todo.

**O que o `check` declarou não medir, e o número medido à mão no lugar.** `EIXO-CALMO` saiu
`sem_grade` nas quatro versões, o que é esperado numa pizza. `ESPESSURA-MARCA` sai
`sem_marca_de_barra`: o piso de 12 px é o outro lado do `maxBarSize` e não existe aqui; a
verificação equivalente é a corda da menor fatia contra a tinta do rótulo interno, medida em 31,9 px
contra 20,8 px na v2, com 5,5 px de cada lado. `OPACIDADE-MARCA` saiu `sem_opacidade_em_marca` nas
quatro, inclusive na v3, porque a cor da fatia sai de uma função em tempo de execução e o leitor não
resolve; a conta foi feita à mão e está no `notes` da v3. `COLISAO-TEXTO` e `CONTRASTE-TEXTO` não
alcançam a legenda da v3, que é `texto_em_html` dentro de `foreignObject`; as larguras de coluna
foram conferidas por estimativa de glifo e no PNG dos dois temas.

**Colisões declaradas com o CONTRATO.** Na v3 o catálogo pede a composição da cauda "na dica", e a
DIC-2 obriga a dica a ser o `ChartTooltip`, que não tem onde imprimir uma lista de composição;
somando a ROT-10, que não aceita a dica como lugar de nomear parte de um todo, a composição foi
para o desenho e a versão ficou sem dica, o que a DIC-1 já pedia, já que a legenda traz contagem,
valor e percentual. Pelo mesmo motivo a v2 e a v4 também não têm dica. Ainda na v3, a legenda
tabular é mais alta que os 30% do corpo da ROT-4: cinco linhas com cabeçalho e total não cabem em
duas linhas de legenda, e a ROT-5 é quem governa legenda com valor.

**O que o texto do catálogo marcou como colisão e não era.** A v2 pede "rótulo em peso 700", que o
dossiê marca contra a TIP-3. Lida a regra, ela **permite** peso 700 em até dois elementos, "o nome e
o valor do destaque", que é exatamente o que a v2 usa: o percentual dentro da fatia acesa e o nome
dela na lista. Não há desvio a declarar.

**Duas premissas de canvas corrigidas por medição.** A v3 não cabe no preset `card`: as linhas
escritas somam 223 px contra 225 px de corpo com o caso de uso em duas linhas, e 2 px são margem de
estouro, não de folga; o canvas virou 640 x 400 por número. A v4 foi escrita supondo duas linhas de
cabeçalho, e o render mostrou o caso de uso de 91 caracteres cabendo em **uma**, o que devolve 16,5
px de corpo; o `notes` traz as duas contas, porque o texto do cabeçalho pode mudar.

**Uma correção que só o PNG pegou.** Na v3, a primeira versão marcava o foco só por opacidade, e o
render mostrou que entre 1,00 e 0,75 o olho não separa a fatia acesa das apagadas. Descer mais não é
opção, porque 0,75 já é o piso das cinco cores usadas. Entrou o ganho de 6 px de raio na fatia em
foco. Na mesma versão, a fileira com `flex-1` esticava e abria um vão de 44 px entre a legenda e a
nota de rodapé, que lia como acidente de alinhamento; virou `shrink-0`.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19; correção de 2026-09-19 (rodada única, ver problemas bloqueantes abaixo)._

**Corrigidos nesta rodada:**

- `v1_origem-da-receita-reconhecida`: a fatia de 4% ficava sem nome e sem número no desenho, porque cai abaixo do piso de 18 graus do rótulo interno; o percentual impresso somava 96 na tela e o restante só aparecia na dica, que o preview estático não mostra. **Corrigido:** a lista de identificação abaixo do gráfico (item 7 da Anatomia) mostra nome e percentual de toda fatia, inclusive as que ficam abaixo do piso; o percentual impresso na tela (rótulo interno mais lista) volta a somar 100.
- `v1_origem-da-receita-reconhecida`: o `OTHER_SLOT` mandava a cauda agrupada para `--chart-2`, uma cor categórica, quando o padrão do catálogo põe "Outros" em neutro. **Corrigido:** `sliceFill` pinta a cauda em `var(--line-strong)`; a base de hoje ainda não exercita o agrupamento (só 4 categorias, teto de 5), então o desvio não aparecia no preview mas o código já sai certo.

**Seguem como observação (não bloqueantes, fora do escopo desta rodada):**

- `v1_origem-da-receita-reconhecida`: a linha de leitura imprime `R$ 2,5 mi` por `formatCurrencyCompact`, enquanto o catálogo descreve o total como R$ 2.480 mil. O formatador é o certo pela NUM-1; fica o registro de que o texto do catálogo e o número na tela não são a mesma grafia.
- `v1_origem-da-receita-reconhecida`: `prepareSlices` descarta linhas com valor zero ou negativo em silêncio. Para a pizza é a decisão certa, já que ângulo negativo mente, mas nada na tela declara que uma categoria sumiu do todo.

**Revisão independente de 2026-09-19 (segunda leitura, versão aprovada sem bloqueante):**

- `v1_origem-da-receita-reconhecida`: o `PieChart` não declara a constante `MARGIN` que a ESP-3 pede; o respiro vem de `OUTER_RADIUS = '76%'`. Nos dois PNGs nada encosta na borda do corpo, então a leitura não muda, mas a folga fica implícita no raio em vez de explícita na margem.
- `v1_origem-da-receita-reconhecida`: `OTHER_LABEL` é só `'Outros'`, sem a contagem `(n=X)` que a COR-4 exige no rótulo do agrupamento. O desvio é latente: a base fixa tem 4 categorias contra um teto de 5, então `prepareSlices` nunca agrupa e o preview não expõe o caso.
- `v1_origem-da-receita-reconhecida`: a lista de identificação fica abaixo do gráfico e ocupa 4 linhas, enquanto a ROT-4 pede legenda acima ou ao lado e em até duas linhas. É troca deliberada para nomear a fatia de 4%, que cai abaixo do piso do rótulo interno, e o bloco fica em torno de 29% do corpo, sob o teto de 30% da própria regra.
- `v1_origem-da-receita-reconhecida`: o valor absoluto por categoria vive só na dica, que é inalcançável sob o `role="img"` da raiz. A frase acessível carrega o total e os percentuais, então nada essencial se perde, mas o leitor de tela não chega ao valor de cada fatia.
- `v1_origem-da-receita-reconhecida`: a linha de leitura usava `truncate`. Nas larguras renderizadas ela cabia inteira nos dois temas; num cartão mais estreito seria cortada, e o corte levaria o percentual, que morava na cauda da frase. **(fechada na Correção de 2026-09-28, com a folga medida lá.)**

**Revisão independente de 2026-10-14 (primeira passada da v2, da v3 e da v4; v2 e v4 aprovadas, v3 reprovada por um bloqueante descrito em `validation/revisao_06_pizza__01_pizza-simples_2026-10-14.md`):**

- `v2_nao-comparecimento-em-destaque`: o cabeçalho "agendas" da lista mede cerca de 41 px em 11 px dentro de uma coluna `w-8` de 32 px; transborda para a direita e termina cerca de 10 px além da borda direita dos números (no PNG, 344 px contra 332 px). Não encosta no "%", mas a coluna de contagem perde o alinhamento com o próprio cabeçalho (TIP-6). Alargar a coluna até o cabeçalho caber.
- `v2_nao-comparecimento-em-destaque`: a anotação "Semana anterior: 9% (7 de 78) agendas" não nomeia a medida; quem liga o 9% ao não comparecimento é a linha de leitura acima, e o "agendas" depois do parêntese lê torto. "Semana anterior: 9% (7 de 78) não compareceram" tem 47 caracteres e cabe na ANO-2. A distância que o caso de uso pergunta continua para o leitor subtrair, o que o catálogo aceita ("15% contra 9%").
- `v3_perdas-por-motivo-com-legenda-tabular`: no estado parado as quatro fatias fora de foco saem a 0,75 de opacidade e as amostras da legenda saem cheias; amostra contra fatia mede de 1,48:1 a 1,69:1, e no tema claro a amostra de "Sem aderência ao perfil buscado" é um azul visivelmente mais escuro que a fatia. Matiz e ordem angular casam, então a identificação não cai; amostra que acompanha o estado da fatia fecharia a diferença.
- `v3_perdas-por-motivo-com-legenda-tabular`: a coluna de valor mistura "mi" e "mil" ("R$ 1,2 mi" logo acima de "R$ 890,0 mil"), e alinhado à direita o número de mais algarismos parece o maior. O formatador é o da NUM-1; a linha de leitura diz só o líder em contagem, e o líder em valor (Escolheu outro fornecedor, R$ 1,5 mi), que o próprio código chama de "o achado do cartão", vive só na frase acessível.
- `v3_perdas-por-motivo-com-legenda-tabular`: o `PieChart` não declara `MARGIN` (ESP-3); o respiro vem do raio absoluto de 50 px mais 6 px de ganho numa caixa de 120 px. Nada encosta no PNG.
- `v3_perdas-por-motivo-com-legenda-tabular`: a composição de "Outros motivos (n=3)" está em `aria-hidden` e fora da frase acessível, então o leitor de tela recebe o agrupamento sem saber o que ele reúne.
- `v4_origem-dos-leads-com-dado-ausente`: rótulos externos em 11 px, enquanto a 17.1 dá 12 px a rótulo de categoria e a rótulo direto de valor. A TAMANHO-TEXTO passa e o PNG não mostra consequência.
- `v4_origem-dos-leads-com-dado-ausente`: a linha de leitura escreve a cobertura com uma casa (85,9%) e a fatia de ausência sai inteira (14%); são complementares e a soma de olho dá 99,9. "85,9% (292 de 340) leads do mês" também lê torto, com o substantivo depois do parêntese.
- `v4_origem-dos-leads-com-dado-ausente`: se o recorte não tiver origem declarada nenhuma, `leader` vira a linha de ausência e a leitura diria "Sem origem declarada lidera com 100%". Ramo inalcançável com a base publicada.
- `v2`, `v3` e `v4`: número em Manrope sem `tabular-nums` na linha de leitura (e na anotação da v2), contra a letra da TIP-1, sem consequência em prosa; e `kpi-number` ou `font-display` sem peso declarado pedem Space Grotesk 400, que não está entre os pesos carregados da TIP-4, e o navegador cai no 500.

**Revisão independente de 2026-10-14, segunda passada da v3 (aprovada; o bloqueante da primeira passada fechou com `activeId = hoverId ?? selectedId`, conferido no navegador por script: ponteiro na linha e na fatia acendem os dois lados, Tab acende, Enter seleciona com `aria-pressed` e desmarca no segundo, sair devolve Preço, e sem seleção nem ponteiro as cinco fatias voltam à opacidade 1):**

- `v3_perdas-por-motivo-com-legenda-tabular`: o ganho de 6 px de raio na fatia em foco aumenta a área dela em 25,4% (56² contra 50²). No estado parado Preço, com 32% da contagem, pinta 37,2% da tinta do disco; com o ponteiro em "Sem resposta depois do contato" (15%) a fatia pinta 18,2% contra 17,7% de "Escolheu outro fornecedor" (18%), e as duas se invertem no olho. O número escrito na legenda segura a leitura e a ordem do líder não muda, mas o deslocamento pelo `midAngle` da v2 dá o mesmo segundo canal sem mexer na área. Nenhuma guarda mede: a RAIO-CONTRA-AREA sai `valor_nao_casado`.
- `v3_perdas-por-motivo-com-legenda-tabular`: o `Pie` do Recharts 3.10.1 nasce com `rootTabIndex` 0, então o primeiro Tab cai no grupo `recharts-pie`, que não faz nada, e o contorno de foco sai recortado pela caixa de 120 px (só as bordas esquerda e de baixo aparecem). `rootTabIndex={-1}` no `Pie` deixa as linhas da legenda como a única rota de teclado, que é a que funciona.
- `v3_perdas-por-motivo-com-legenda-tabular`: ponteiro e foco dividem o mesmo `hoverId`. Com o foco de teclado numa linha, passar o ponteiro por outra e sair apaga a prévia da linha focada, e a peça volta para a seleção com o foco ainda parado ali.
- `v3_perdas-por-motivo-com-legenda-tabular`: o `selectedId` padrão `'preco'` sobrevive à troca de `data`. Com dado real sem esse id, `activeId` não casa com fatia nenhuma e as cinco saem a 0,75 sem nenhuma acesa; e o default do parâmetro continua impedindo montar sem seleção. Ramo inalcançável com a base publicada.
- `v3_perdas-por-motivo-com-legenda-tabular`: `orderRows` descarta motivo com contagem zero em silêncio. O total não muda, mas o motivo some da legenda, contra a EST-3 (zero medido se escreve 0) e no mesmo desenho do descarte calado que a Correção de 2026-09-25 fechou na v1. Ramo inalcançável com a base publicada.
- `v3_perdas-por-motivo-com-legenda-tabular`: a nota de rodapé diz "o valor vai na coluna à direita", e a coluna mais à direita da legenda é a de percentual. "O valor vai na coluna valor" ou "na legenda" não deixa dúvida.
- `v3_perdas-por-motivo-com-legenda-tabular`: as quatro observações da primeira passada seguem abertas (amostra cheia contra fatia a 0,75, "mi" e "mil" na mesma coluna, `MARGIN` ausente, composição de Outros fora da frase acessível).

## Correção de 2026-09-25

**v1, descarte calado.** `prepareSlices` filtrava `value > 0` e nada na tela dizia que uma categoria
havia saído do todo. Descartar é a decisão certa (não existe fatia de zero nem de ângulo negativo),
o defeito era o silêncio: o leitor tomava os 100% do desenho pelo universo do recorte, e o total
escrito na linha de leitura era o total do que ficou, sem aviso.

O que mudou, e só isto: `droppedCount` conta as linhas sem valor positivo e, quando há alguma, um
rodapé em `--text-muted` de 11 px escreve "N categorias fora do todo, sem valor positivo: os 100%
são do que ficou", na forma já usada em `09_dispersao-e-bolhas/01_dispersao-simples/v1`. A mesma
frase entra na frase acessível. O filtro, a ordenação, o agrupamento em "Outros" e as cores seguem
idênticos.

Mudou também a mensagem do recorte vazio, que era o mesmo defeito levado ao extremo: com todas as
categorias em zero, `rows.length` é 0 e a tela afirmava "não houve receita reconhecida no período",
atribuindo ao período o que era descarte. Agora, se havia categoria e ela foi descartada, a mensagem
diz que as N categorias do recorte estão sem valor positivo.

**Conserto de caminho latente:** as 4 categorias publicadas têm valor positivo, então `droppedCount`
é 0, o rodapé não é renderizado e o desenho não mudou. O que se conserta é o ramo, não a foto.

A observação da revisão de 2026-09-19 que registrava este descarte em silêncio fica fechada por esta
correção; a que registra o `truncate` da linha de leitura fica fechada pela correção de 2026-09-28,
logo abaixo.

## Correção de 2026-09-28

**v1, a linha de leitura usava `truncate` e o número morava na cauda.** A frase era "R$ 2,5 mi
reconhecidos no 3º trimestre; cliente novo lidera com 44% do total", isto é, começava pela base e
terminava na conclusão, e `truncate` corta pelo fim: num cartão mais estreito o que sumiria seria
justamente o percentual que a linha existe para dizer. A observação de 2026-09-19 registrava o risco
e seguia aberta.

**Medição antes do conserto, que corrige a premissa do pedido.** Na largura publicada a frase cabia:
media cerca de 419 px contra cerca de 424 px de corpo disponível no canvas `quadrado`, com uns 5 px
de folga, e os dois previews traziam o texto inteiro, com o render acusando 0,00% de diferença entre
o SVG e a página nos dois temas. Não havia corte na tela; o defeito era latente, com 5 px separando
o latente do visível.

O que mudou: saiu o `truncate` e a redação foi invertida para a conclusão vir primeiro, "Cliente
novo lidera com 44% dos R$ 2,5 mi do trimestre". A frase caiu para cerca de 332 px, com uns 92 px de
folga, e, se um nome de categoria longo passar disso, ela quebra em duas linhas e o gráfico cede os
16 px, em vez de perder o número. A observação de 2026-09-19 fica fechada.
